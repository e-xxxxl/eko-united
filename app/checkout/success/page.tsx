import type { Metadata } from "next";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { formatNaira } from "@/lib/format";

export const metadata: Metadata = {
  title: "Order Confirmed",
  robots: { index: false },
};

type OrderStatus = {
  status: "pending" | "paid" | "failed" | "cancelled";
  type: "shop" | "ticket";
  totalAmount: number;
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string; pending?: string }>;
}) {
  const { orderId, pending } = await searchParams;
  const order = orderId ? await apiFetch<OrderStatus>(`/checkout/${orderId}`, 0) : null;

  const heading =
    order?.status === "paid"
      ? "Payment received"
      : pending || order?.status === "pending"
        ? "Order recorded"
        : "Order status unknown";

  const message =
    order?.status === "paid"
      ? order.type === "ticket"
        ? "Your tickets are confirmed — a confirmation has been sent to your email."
        : "Your order is confirmed — a confirmation has been sent to your email."
      : "We've recorded your order. If payment isn't fully set up yet on our end, the club will be in touch to complete it.";

  return (
    <main className="mx-auto max-w-xl px-6 py-24 text-center sm:px-10">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Thank you</p>
      <h1 className="display-title font-display mt-3">{heading}</h1>
      <p className="mt-4 text-base text-navy/60">{message}</p>

      {order && (
        <p className="mt-6 text-sm text-navy/40">
          Order total: <span className="font-semibold text-navy">{formatNaira(order.totalAmount)}</span>
        </p>
      )}

      <Link
        href="/"
        className="mt-10 inline-block rounded-full bg-yellow px-8 py-3 text-sm font-bold uppercase tracking-wide text-navy-dark transition-transform duration-300 ease-smooth hover:scale-105"
      >
        Back to home
      </Link>
    </main>
  );
}
