"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { clsx } from "clsx";
import { formatNaira } from "@/lib/format";
import { addToCart } from "@/lib/cart";
import { isAllowedImageUrl } from "@/lib/imageHosts";
import { isRealId } from "@/lib/isRealId";

export type ShopProduct = {
  _id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  sizes: string[];
  stock: number;
};

// Used on both the homepage teaser (ShopPreview) and the full /shop grid —
// one real add-to-cart flow instead of the old decorative-only size picker.
export default function ProductCard({ product, badge }: { product: ShopProduct; badge?: string }) {
  const [size, setSize] = useState(product.sizes[0] || "");
  const [added, setAdded] = useState(false);
  const image = product.images.find(isAllowedImageUrl);
  const isDemo = !isRealId(product._id);
  const outOfStock = !isDemo && product.stock <= 0;

  function handleAddToCart() {
    addToCart("shop", {
      refType: "Product",
      ref: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      size: size || undefined,
      imageUrl: image,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="group relative overflow-hidden bg-white">
      {badge && (
        <span className="absolute left-3 top-3 z-10 rounded-full border border-navy/20 bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-navy">
          {badge}
        </span>
      )}

      <Link href={`/shop/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-navy-light">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(min-width: 640px) 45vw, 90vw"
            className="object-contain p-3 transition-transform duration-500 ease-smooth group-hover:scale-110"
          />
        ) : null}
        <div className="pointer-events-none absolute inset-0 flex items-end justify-center bg-navy-dark/0 opacity-0 transition-all duration-300 ease-smooth group-hover:bg-navy-dark/10 group-hover:opacity-100">
          <span className="mb-4 translate-y-3 rounded-full bg-navy-dark px-5 py-2 text-xs font-bold uppercase tracking-wide text-white transition-transform duration-300 ease-smooth group-hover:translate-y-0">
            View product
          </span>
        </div>
      </Link>

      <div className="border-t border-navy/10 p-4">
        <div className="flex items-baseline justify-between">
          <Link href={`/shop/${product.slug}`} className="text-sm font-medium text-navy hover:text-cyan">
            {product.name}
          </Link>
          <p className="text-sm font-semibold text-navy">{formatNaira(product.price)}</p>
        </div>

        {product.sizes.length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <span className="mr-1 text-[10px] font-semibold uppercase tracking-wide text-navy/40">Size</span>
            {product.sizes.map((s) => (
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
        )}

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={outOfStock || isDemo}
          title={isDemo ? "Preview item — add real products via /admin/products to make this purchasable" : undefined}
          className="mt-4 w-full rounded-full border border-navy px-4 py-2 text-xs font-bold uppercase tracking-wide text-navy transition-colors duration-200 ease-smooth hover:bg-navy hover:text-white disabled:cursor-not-allowed disabled:border-navy/20 disabled:text-navy/30 disabled:hover:bg-transparent"
        >
          {isDemo ? "Coming soon" : outOfStock ? "Out of stock" : added ? "Added ✓" : "Add to cart"}
        </button>
      </div>
    </div>
  );
}
