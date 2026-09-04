import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Order Cancelled",
  robots: { index: false },
};

export default function CheckoutCancelledPage() {
  return (
    <main className="mx-auto max-w-xl px-6 py-24 text-center sm:px-10">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Checkout</p>
      <h1 className="display-title font-display mt-3">Payment cancelled</h1>
      <p className="mt-4 text-base text-navy/60">
        Your payment was cancelled — nothing was charged. Your cart is still saved if you'd like to try again.
      </p>
      <Link
        href="/cart"
        className="mt-10 inline-block rounded-full bg-yellow px-8 py-3 text-sm font-bold uppercase tracking-wide text-navy-dark transition-transform duration-300 ease-smooth hover:scale-105"
      >
        Back to cart
      </Link>
    </main>
  );
}
