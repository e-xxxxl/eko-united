"use client";

import Link from "next/link";
import { useCart, cartCount } from "@/lib/cart";

// Reads localStorage via useCart (client-only, starts at 0 on the server
// render and syncs after mount — see lib/cart.ts) so it never causes a
// hydration mismatch even though the count depends on client-only state.
export default function CartIndicator({ variant = "icon" }: { variant?: "icon" | "text" }) {
  const cart = useCart();
  const count = cartCount(cart);

  if (variant === "text") {
    return (
      <Link
        href="/cart"
        className="px-3 py-2 text-sm text-white/60 transition-colors duration-200 ease-smooth hover:text-white"
      >
        Cart{count > 0 ? ` (${count})` : ""}
      </Link>
    );
  }

  return (
    <Link href="/cart" aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`} className="relative">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-white/80 transition-colors duration-200 ease-smooth hover:text-white">
        <path
          d="M6 8h12l-1 12H7L6 8Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M9 8a3 3 0 1 1 6 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-yellow px-1 text-[10px] font-bold text-navy-dark">
          {count}
        </span>
      )}
    </Link>
  );
}
