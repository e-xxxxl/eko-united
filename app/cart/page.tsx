import type { Metadata } from "next";
import CartView from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "Your Cart",
  robots: { index: false }, // personal, dynamic — nothing here to index or share
};

export default function CartPage() {
  return (
    <main className="px-6 py-16 sm:px-10 lg:px-16">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Checkout</p>
      <h1 className="display-title font-display mb-10">Your Cart</h1>
      <CartView />
    </main>
  );
}
