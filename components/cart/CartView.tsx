"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart, cartTotal, updateQuantity, removeFromCart, clearCart, versionLabels } from "@/lib/cart";
import { formatNaira, formatPrice } from "@/lib/format";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const fieldClass =
  "w-full border-b border-navy/20 bg-transparent px-1 py-2.5 text-sm text-navy outline-none transition-colors duration-200 ease-smooth placeholder:text-navy/30 focus:border-cyan";
const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-wide text-navy/50";

type AppliedReferral = { code: string; discountPercent: number };

export default function CartView() {
  const cart = useCart();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [referralInput, setReferralInput] = useState("");
  const [referral, setReferral] = useState<AppliedReferral | null>(null);
  const [referralMessage, setReferralMessage] = useState("");
  const [checkingReferral, setCheckingReferral] = useState(false);

  const isTicket = cart.type === "ticket";
  const subtotal = cartTotal(cart);
  // Display only: the server works the real discount out again from the code.
  const discount = referral ? Math.round((subtotal * referral.discountPercent) / 100) : 0;
  const total = Math.max(0, subtotal - discount);
  const isFree = cart.items.length > 0 && total === 0;

  async function applyReferral() {
    const code = referralInput.trim();
    if (!code) return;
    setCheckingReferral(true);
    setReferralMessage("");
    try {
      const res = await fetch(`${API_URL}/referrals/check?code=${encodeURIComponent(code)}&type=${isTicket ? "ticket" : "shop"}`);
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.valid) {
        setReferral(null);
        setReferralMessage(body.error || "That referral code isn't valid");
      } else {
        setReferral({ code: body.code, discountPercent: body.discountPercent });
        setReferralMessage(
          body.discountPercent > 0 ? `Code applied: ${body.discountPercent}% off.` : "Code applied. Thank you for the referral."
        );
      }
    } catch {
      setReferralMessage("Can't check the code right now. Please try again.");
    } finally {
      setCheckingReferral(false);
    }
  }

  async function handleCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setNotice("");

    const data = new FormData(event.currentTarget);

    try {
      const res = await fetch(`${API_URL}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: cart.type,
          items: cart.items.map((i) => ({ refType: i.refType, ref: i.ref, quantity: i.quantity, size: i.size, version: i.version })),
          customerName: String(data.get("name") || ""),
          customerEmail: String(data.get("email") || ""),
          customerPhone: String(data.get("phone") || ""),
          referralCode: referralInput.trim(),
          marketingConsent: data.get("consent") === "on",
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        // The shop was updated since this item was added (a product replaced
        // or removed), so the cart is holding something that no longer
        // exists. Drop that item and say so, instead of a bare "not found".
        const missing = res.status === 404 ? String(body.error || "").match(/not found: (\w+)/) : null;
        if (missing) {
          cart.items.filter((i) => i.ref === missing[1]).forEach((i) => removeFromCart(i.ref, i.size, i.version));
          setError(
            "An item in your cart is no longer available because the club has updated the shop, so we removed it. Please check your cart and try again."
          );
          setSubmitting(false);
          return;
        }
        setError(body.error || "Something went wrong placing your order. Please try again.");
        setSubmitting(false);
        return;
      }

      const link = `/checkout/success?orderId=${body.orderId}${body.token ? `&token=${body.token}` : ""}`;

      // Off to the payment page. The cart is deliberately NOT cleared yet: if
      // the buyer closes the payment window or presses back, it is still here.
      // It is emptied on the success page once the payment is confirmed.
      if (body.paymentUrl) {
        window.location.href = body.paymentUrl;
        return;
      }

      // Nothing to pay: the tickets or order are already confirmed.
      if (body.free) {
        clearCart();
        router.push(link);
        return;
      }

      // No payment provider configured yet on the backend — the order was
      // still recorded (see routes/checkout.js), just not auto-charged.
      clearCart();
      setNotice(body.message || "Your order has been recorded. The club will be in touch to complete payment.");
      router.push(`${link}&pending=1`);
    } catch {
      setError("Can't reach the server right now. Please try again.");
      setSubmitting(false);
    }
  }

  if (cart.items.length === 0 && !notice) {
    return (
      <div className="border-t border-navy/10 py-16 text-center">
        {error && (
          <p className="mx-auto mb-6 max-w-md text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
        <p className="text-navy/50">Your cart is empty.</p>
        <div className="mt-6 flex justify-center gap-4">
          <Link
            href="/shop"
            className="btn-glass btn-glass-navy px-6 py-2.5 text-xs font-bold uppercase tracking-wide"
          >
            Visit shop
          </Link>
          <Link
            href="/tickets"
            className="btn-glass btn-glass-yellow px-6 py-2.5 text-xs font-bold uppercase tracking-wide"
          >
            Get tickets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
      <div className="border-t border-navy/10">
        {cart.items.map((item) => {
          const detail = [item.matchLabel, item.version ? versionLabels[item.version] : null, item.size ? `Size ${item.size}` : null]
            .filter(Boolean)
            .join(" · ");
          return (
            <div
              key={`${item.ref}-${item.size || ""}-${item.version || ""}`}
              className="flex items-center justify-between gap-4 border-b border-navy/10 py-5"
            >
              <div>
                <p className="font-medium text-navy">{item.name}</p>
                <p className="text-xs uppercase tracking-wide text-navy/40">
                  {detail ? `${detail} · ` : ""}
                  {formatPrice(item.price)}
                  {item.price === 0 ? "" : " each"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.ref, item.size, item.quantity - 1, item.version)}
                    className="btn-glass btn-glass-navy flex h-7 w-7 rounded-lg items-center justify-center"
                  >
                    −
                  </button>
                  <span className="w-5 text-center text-sm font-semibold text-navy">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.ref, item.size, item.quantity + 1, item.version)}
                    className="btn-glass btn-glass-navy flex h-7 w-7 rounded-lg items-center justify-center"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeFromCart(item.ref, item.size, item.version)}
                  className="text-sm font-semibold text-navy/40 transition-colors duration-200 ease-smooth hover:text-red-500"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-navy/10 pt-6 lg:border-t-0 lg:pt-0">
        <div className="space-y-2 border-b border-navy/10 pb-4">
          {discount > 0 && (
            <>
              <div className="flex items-baseline justify-between text-sm text-navy/60">
                <span>Subtotal</span>
                <span>{formatNaira(subtotal)}</span>
              </div>
              <div className="flex items-baseline justify-between text-sm text-navy/60">
                <span>Referral discount ({referral?.discountPercent}%)</span>
                <span>-{formatNaira(discount)}</span>
              </div>
            </>
          )}
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-semibold uppercase tracking-wide text-navy/50">Total</span>
            <span className="font-display text-2xl text-navy">{formatPrice(total)}</span>
          </div>
        </div>

        <form onSubmit={handleCheckout} className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className={labelClass}>
              Full name
            </label>
            <input id="name" name="name" required autoComplete="name" className={fieldClass} />
          </div>
          <div>
            <label htmlFor="email" className={labelClass}>
              Email
            </label>
            <input id="email" name="email" type="email" required autoComplete="email" className={fieldClass} />
          </div>
          <div>
            <label htmlFor="phone" className={labelClass}>
              {isTicket ? "Phone number" : "Phone (optional)"}
            </label>
            <input id="phone" name="phone" type="tel" required={isTicket} autoComplete="tel" className={fieldClass} />
          </div>

          <div>
            <label htmlFor="referral" className={labelClass}>
              Referral code (optional)
            </label>
            <div className="flex items-end gap-3">
              <input
                id="referral"
                value={referralInput}
                onChange={(e) => {
                  setReferralInput(e.target.value.toUpperCase());
                  setReferral(null);
                  setReferralMessage("");
                }}
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                className={`${fieldClass} uppercase tracking-wide`}
              />
              <button
                type="button"
                onClick={applyReferral}
                disabled={checkingReferral || !referralInput.trim()}
                className="btn-glass btn-glass-navy shrink-0 px-5 py-2.5 text-xs font-bold uppercase tracking-wide disabled:opacity-50"
              >
                {checkingReferral ? "Checking…" : "Apply"}
              </button>
            </div>
            {referralMessage && (
              <p className={`mt-2 text-xs font-semibold ${referral ? "text-cyan" : "text-red-500"}`} role="status">
                {referralMessage}
              </p>
            )}
          </div>

          <label className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-navy/60">
            <input type="checkbox" name="consent" className="mt-0.5 h-4 w-4 shrink-0 accent-navy" />
            <span>
              I agree to receive emails and SMS from Eko United FC about matches, tickets, offers and club news. I can stop
              them at any time.
            </span>
          </label>

          {isTicket && isFree && (
            <p className="text-xs leading-relaxed text-navy/50">
              Your tickets are free. You will get a QR code and a number for each ticket on the next page and by email.
            </p>
          )}

          {error && (
            <p className="text-sm text-red-500" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || cart.items.length === 0}
            className="btn-glass btn-glass-yellow w-full px-8 py-3.5 text-sm font-bold uppercase tracking-wide disabled:opacity-60"
          >
            {submitting ? "Processing…" : isFree ? (isTicket ? "Get my free tickets" : "Place order") : "Checkout"}
          </button>
        </form>
      </div>
    </div>
  );
}
