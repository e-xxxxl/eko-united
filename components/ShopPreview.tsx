"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { clsx } from "clsx";

// Static teaser only — the real Product model, cart and checkout are Phase 2
// (out of scope for now, see CLAUDE.md §7). Kit renders supplied by Emmanuel,
// in frontend/public/jerseys/ — swap for real Cloudinary product photography
// once shot, no layout change needed. Size selection is decorative (no real
// inventory yet) but interactive, so the teaser feels like a real product
// card rather than a flat image.
const products = [
  { id: "home-kit", name: "2026 Home Kit", price: "₦25,000", imageUrl: "/jerseys/home-kit.jpg", badge: "New" },
  { id: "away-kit", name: "2026 Away Kit", price: "₦25,000", imageUrl: "/jerseys/away-kit.jpg", badge: "New" },
];

const sizes = ["S", "M", "L", "XL"];

function ProductCard({ product }: { product: (typeof products)[number] }) {
  const [size, setSize] = useState("M");

  return (
    <div className="group relative overflow-hidden bg-white">
      <span className="absolute left-3 top-3 z-10 rounded-full border border-navy/20 bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-navy">
        {product.badge}
      </span>

      <Link href="/shop" className="relative block aspect-[4/3] overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(min-width: 640px) 45vw, 90vw"
          className="object-contain p-3 transition-transform duration-500 ease-smooth group-hover:scale-110"
        />
        <div className="pointer-events-none absolute inset-0 flex items-end justify-center bg-navy-dark/0 opacity-0 transition-all duration-300 ease-smooth group-hover:bg-navy-dark/10 group-hover:opacity-100">
          <span className="mb-4 translate-y-3 rounded-full bg-navy-dark px-5 py-2 text-xs font-bold uppercase tracking-wide text-white transition-transform duration-300 ease-smooth group-hover:translate-y-0">
            Quick View
          </span>
        </div>
      </Link>

      <div className="border-t border-navy/10 p-4">
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-medium text-navy">{product.name}</p>
          <p className="text-sm font-semibold text-navy">{product.price}</p>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="mr-1 text-[10px] font-semibold uppercase tracking-wide text-navy/40">
            Size
          </span>
          {sizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              aria-pressed={size === s}
              className={clsx(
                "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition-colors duration-200 ease-smooth",
                size === s
                  ? "border-yellow bg-yellow text-navy-dark"
                  : "border-navy/15 text-navy/60 hover:border-navy/40"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ShopPreview() {
  return (
    <section className="bg-navy-dark px-6 py-16 sm:px-10 lg:px-16">
      <div className="mb-8 flex items-baseline justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-cyan">
            2026 Kit
          </p>
          <h2 className="font-display text-2xl text-white sm:text-3xl">Club Shop</h2>
        </div>
        <Link
          href="/shop"
          className="text-sm font-semibold text-cyan transition-colors duration-200 ease-smooth hover:text-white"
        >
          Visit shop →
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
