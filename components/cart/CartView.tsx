"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart, cartTotal, updateQuantity, removeFromCart, clearCart } from "@/lib/cart";
import { formatNaira } from "@/lib/format";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function CartView() {
  const cart = useCart();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const total = cartTotal(cart);

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
          items: cart.items.map((i) => ({ refType: i.refType, ref: i.ref, quantity: i.quantity, size: i.size })),
          customerName: String(data.get("name") || ""),
          customerEmail: String(data.get("email") || ""),
          customerPhone: String(data.get("phone") || ""),
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error || "Something went wrong placing your order. Please try again.");
        setSubmitting(false);
        return;
      }

      clearCart();

      if (body.paymentUrl) {
        window.location.href = body.paymentUrl;
        return;
      }

      // No payment provider configured yet on the backend — the order was
      // still recorded (see routes/checkout.js), just not auto-charged.
      setNotice(body.message || "Your order has been recorded. The club will be in touch to complete payment.");
      router.push(`/checkout/success?orderId=${body.orderId}&pending=1`);
    } catch {
      setError("Can't reach the server right now. Please try again.");
      setSubmitting(false);
    }
  }

  if (cart.items.length === 0 && !notice) {
    return (
      <div className="border-t border-navy/10 py-16 text-center">
        <p className="text-navy/50">Your cart is empty.</p>
        <div className="mt-6 flex justify-center gap-4">
          <Link
            href="/shop"
            className="rounded-full border border-navy/20 px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-navy transition-colors duration-200 ease-smooth hover:border-navy"
          >
            Visit shop
          </Link>
          <Link
            href="/tickets"
            className="rounded-full bg-yellow px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-navy-dark transition-transform duration-300 ease-smooth hover:scale-105"
          >
            Buy tickets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
      <div className="border-t border-navy/10">
        {cart.items.map((item) => (
          <div
            key={`${item.ref}-${item.size || ""}`}
            className="flex items-center justify-between gap-4 border-b border-navy/10 py-5"
          >
            <div>
              <p className="font-medium text-navy">{item.name}</p>
              <p className="text-xs uppercase tracking-wide text-navy/40">
                {item.matchLabel || (item.size ? `Size ${item.size}` : null)} · {formatNaira(item.price)} each
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.ref, item.size, item.quantity - 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-navy/20 text-navy transition-colors duration-200 ease-smooth hover:border-navy"
                >
                  −
                </button>
                <span className="w-5 text-center text-sm font-semibold text-navy">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.ref, item.size, item.quantity + 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-navy/20 text-navy transition-colors duration-200 ease-smooth hover:border-navy"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={() => removeFromCart(item.ref, item.size)}
                className="text-sm font-semibold text-navy/40 transition-colors duration-200 ease-smooth hover:text-red-500"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-navy/10 pt-6 lg:border-t-0 lg:pt-0">
        <div className="flex items-baseline justify-between border-b border-navy/10 pb-4">
          <span className="text-sm font-semibold uppercase tracking-wide text-navy/50">Total</span>
          <span className="font-display text-2xl text-navy">{formatNaira(total)}</span>
        </div>

        <form onSubmit={handleCheckout} className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-navy/50">
              Full name
            </label>
            <input
              id="name"
              name="name"
              required
              className="w-full border-b border-navy/20 bg-transparent px-1 py-2.5 text-sm text-navy outline-none transition-colors duration-200 ease-smooth focus:border-cyan"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-navy/50">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full border-b border-navy/20 bg-transparent px-1 py-2.5 text-sm text-navy outline-none transition-colors duration-200 ease-smooth focus:border-cyan"
            />
          </div>
          <div>
            <label htmlFor="phone" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-navy/50">
              Phone (optional)
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="w-full border-b border-navy/20 bg-transparent px-1 py-2.5 text-sm text-navy outline-none transition-colors duration-200 ease-smooth focus:border-cyan"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || cart.items.length === 0}
            className="w-full rounded-full bg-yellow px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-navy-dark transition-transform duration-300 ease-smooth hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
          >
            {submitting ? "Processing…" : "Checkout"}
          </button>
        </form>
      </div>
    </div>
  );
}
