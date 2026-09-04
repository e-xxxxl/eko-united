"use client";

import { useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { addToCart } from "@/lib/cart";
import { isRealId } from "@/lib/isRealId";
import type { ShopProduct } from "@/components/shop/ProductCard";

export default function ProductDetailPurchase({
  product,
  image,
}: {
  product: ShopProduct;
  image?: string;
}) {
  const [size, setSize] = useState(product.sizes[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const isDemo = !isRealId(product._id);
  const outOfStock = !isDemo && product.stock <= 0;

  function handleAddToCart() {
    addToCart("shop", {
      refType: "Product",
      ref: product._id,
      name: product.name,
      price: product.price,
      quantity,
      size: size || undefined,
      imageUrl: image,
    });
    setAdded(true);
  }

  if (added) {
    return (
      <div className="mt-8 border-t border-navy/10 pt-6">
        <p className="text-sm text-navy">Added to your cart.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/cart"
            className="rounded-full bg-yellow px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-navy-dark transition-transform duration-300 ease-smooth hover:scale-105"
          >
            View cart
          </Link>
          <button
            type="button"
            onClick={() => setAdded(false)}
            className="rounded-full border border-navy/20 px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-navy transition-colors duration-200 ease-smooth hover:border-navy"
          >
            Keep shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 border-t border-navy/10 pt-6">
      {product.sizes.length > 0 && (
        <div className="mb-6">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-navy/50">Size</span>
          <div className="flex gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                aria-pressed={size === s}
                className={clsx(
                  "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition-colors duration-200 ease-smooth",
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
      )}

      <div className="mb-6 flex items-center gap-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-navy/50">Quantity</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-navy/20 text-navy transition-colors duration-200 ease-smooth hover:border-navy"
          >
            −
          </button>
          <span className="w-6 text-center text-sm font-semibold text-navy">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-navy/20 text-navy transition-colors duration-200 ease-smooth hover:border-navy"
          >
            +
          </button>
        </div>
      </div>

      {isDemo && (
        <p className="mb-3 text-xs text-navy/40">
          Preview item — add real products via /admin/products to make this purchasable.
        </p>
      )}
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={outOfStock || isDemo}
        className="w-full rounded-full bg-yellow px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-navy-dark transition-transform duration-300 ease-smooth hover:scale-[1.02] disabled:cursor-not-allowed disabled:bg-navy/10 disabled:text-navy/30 disabled:hover:scale-100 sm:w-auto"
      >
        {isDemo ? "Coming soon" : outOfStock ? "Out of stock" : "Add to cart"}
      </button>
    </div>
  );
}
