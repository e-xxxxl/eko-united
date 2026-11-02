import type { Metadata } from "next";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { formatPrice, formatTicketCode } from "@/lib/format";
import RefreshWhilePending from "@/components/RefreshWhilePending";
import ClearCart from "@/components/cart/ClearCart";

export const metadata: Metadata = {
  title: "Order Confirmed",
  robots: { index: false },
};

type OrderStatus = {
  status: "pending" | "paid" | "failed" | "cancelled";
  type: "shop" | "ticket";
  totalAmount: number;
};

type TicketsReply = {
  status: string;
  customerName?: string;
  tickets: {
    code: string;
    ticketTypeName: string;
    holderName: string;
    match: { opponent: string; kickoff: string; venue?: string; isHome: boolean } | null;
  }[];
};

function matchLine(m: NonNullable<TicketsReply["tickets"][number]["match"]>) {
  const teams = m.isHome ? `Eko United vs ${m.opponent}` : `${m.opponent} vs Eko United`;
  const when = new Date(m.kickoff).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Lagos",
  });
  return [teams, when, m.venue].filter(Boolean).join(" · ");
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string; token?: string; pending?: string }>;
}) {
  const { orderId, token, pending } = await searchParams;
  // Back from the payment page: ask the payment provider directly whether the
  // payment went through (this also completes the order), instead of waiting for
  // its webhook to arrive.
  const verified =
    orderId && token && !pending
      ? await apiFetch<{ status: string; providerStatus: string | null }>(`/checkout/${orderId}/verify?token=${encodeURIComponent(token)}`, 0)
      : null;
  const order = orderId ? await apiFetch<OrderStatus>(`/checkout/${orderId}`, 0) : null;
  const ticketsReply =
    order?.type === "ticket" && order.status === "paid" && orderId && token
      ? await apiFetch<TicketsReply>(`/checkout/${orderId}/tickets?token=${encodeURIComponent(token)}`, 0)
      : null;
  const tickets = ticketsReply?.tickets || [];

  const isFree = order?.status === "paid" && order.totalAmount === 0;
  // The buyer closed the payment window or backed out: Paystack calls that "abandoned".
  const notCompleted =
    order?.status === "pending" && !pending && ["abandoned", "failed", "reversed"].includes(verified?.providerStatus || "");
  // Came back from the payment page but the confirmation has not landed yet.
  const waitingForPayment = order?.status === "pending" && !pending && !notCompleted;

  const heading = notCompleted
    ? "Payment not completed"
    : order?.status === "paid"
      ? order.type === "ticket"
        ? "Your tickets"
        : isFree
          ? "Order confirmed"
          : "Payment received"
      : waitingForPayment
        ? "Confirming your payment"
        : pending || order?.status === "pending"
          ? "Order recorded"
          : "Order status unknown";

  const message = notCompleted
    ? "No money was taken. Your cart is still saved, so you can go back and try again."
    : order?.status === "paid"
      ? order.type === "ticket"
        ? "You are all set. Show the QR code at the gate, or read out the number. We have also emailed your tickets."
        : "Your order is confirmed. A confirmation has been sent to your email."
      : waitingForPayment
        ? "We are waiting for your bank to confirm. This usually takes a few seconds and this page will update by itself."
        : "We've recorded your order. If payment isn't fully set up yet on our end, the club will be in touch to complete it.";

  return (
    <main className="mx-auto max-w-2xl px-6 py-24 text-center sm:px-10">
      {waitingForPayment && <RefreshWhilePending />}
      {(order?.status === "paid" || pending) && <ClearCart />}
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Thank you</p>
      <h1 className="display-title font-display mt-3">{heading}</h1>
      <p className="mx-auto mt-4 max-w-lg text-base text-navy/60">{message}</p>

      {tickets.length > 0 && (
        <ul className="mt-10 space-y-5 text-left">
          {tickets.map((t, i) => (
            <li key={t.code} className="overflow-hidden rounded-2xl bg-navy/[0.04]">
              <div className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:items-center sm:gap-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/qr/${t.code}`}
                  alt={`QR code for ticket ${formatTicketCode(t.code)}`}
                  width={176}
                  height={176}
                  className="h-44 w-44 shrink-0 rounded-xl bg-white p-1"
                />
                <div className="min-w-0 text-center sm:text-left">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan">
                    {t.ticketTypeName} · Ticket {i + 1} of {tickets.length}
                  </p>
                  <p className="mt-2 font-display text-5xl leading-none tracking-[0.12em] text-navy">{formatTicketCode(t.code)}</p>
                  <p className="mt-3 text-sm font-semibold text-navy">{t.holderName}</p>
                  {t.match && <p className="mt-1 text-sm text-navy/60">{matchLine(t.match)}</p>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {tickets.length > 0 && (
        <p className="mx-auto mt-6 max-w-md text-xs leading-relaxed text-navy/45">
          Take a screenshot of this page or keep the email. Each ticket admits one person, once.
        </p>
      )}

      {order && (
        <p className="mt-6 text-sm text-navy/40">
          Order total: <span className="font-semibold text-navy">{formatPrice(order.totalAmount)}</span>
        </p>
      )}

      {notCompleted ? (
        <Link
          href="/cart"
          className="btn-glass btn-glass-yellow mt-10 inline-block px-8 py-3 text-sm font-bold uppercase tracking-wide"
        >
          Back to my cart
        </Link>
      ) : (
        <Link
          href="/"
          className="btn-glass btn-glass-yellow mt-10 inline-block px-8 py-3 text-sm font-bold uppercase tracking-wide"
        >
          Back to home
        </Link>
      )}
    </main>
  );
}
