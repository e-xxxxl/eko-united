"use client";

import { useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { addToCart, versionLabels } from "@/lib/cart";
import { formatNaira } from "@/lib/format";
import { isRealId } from "@/lib/isRealId";
import type { ShopProduct } from "@/components/shop/ProductCard";

type Version = "replica" | "player";

// Price, version (Replica or Player version, for jerseys that have both), size,
// quantity and add-to-cart for one product. Checkout re-reads the real price
// from the database, so what is shown here is only ever a display.
export default function ProductDetailPurchase({
  product,
  image,
}: {
  product: ShopProduct;
  image?: string;
}) {
  const hasReplica = product.replicaPrice !== undefined && product.replicaPrice !== null;

  const [version, setVersion] = useState<Version>("replica");
  const [size, setSize] = useState(product.sizes[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const isDemo = !isRealId(product._id);
  const outOfStock = !isDemo && product.stock <= 0;
  const price = hasReplica && version === "replica" ? (product.replicaPrice as number) : product.price;

  function handleAddToCart() {
    addToCart("shop", {
      refType: "Product",
      ref: product._id,
      name: product.name,
      price,
      quantity,
      size: size || undefined,
      version: hasReplica ? version : undefined,
      imageUrl: image,
    });
    setAdded(true);
  }

  return (
    <div>
      <p className="mt-5 flex items-baseline gap-3">
        <span className="text-3xl font-semibold text-navy">{formatNaira(price)}</span>
        {hasReplica && <span className="text-sm text-navy/45">{versionLabels[version]}</span>}
      </p>

      {!isDemo && (
        <p className={clsx("mt-2 text-xs font-semibold uppercase tracking-wide", outOfStock ? "text-red-500" : product.stock <= 5 ? "text-navy" : "text-navy/45")}>
          {outOfStock ? "Sold out" : product.stock <= 5 ? `Only ${product.stock} left` : "In stock"}
        </p>
      )}

      {added ? (
        <div className="mt-8 border-t border-navy/10 pt-6">
          <p className="text-sm text-navy">Added to your cart.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/cart"
              className="btn-glass btn-glass-yellow px-6 py-2.5 text-xs font-bold uppercase tracking-wide"
            >
              View cart
            </Link>
            <button
              type="button"
              onClick={() => setAdded(false)}
              className="btn-glass btn-glass-navy px-6 py-2.5 text-xs font-bold uppercase tracking-wide"
            >
              Keep shopping
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-7 border-t border-navy/10 pt-7">
          {hasReplica && (
            <div>
              <span className="mb-3 block text-xs font-semibold uppercase tracking-wide text-navy/50">Version</span>
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Replica or player version">
                {(["replica", "player"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    role="radio"
                    aria-checked={version === v}
                    onClick={() => setVersion(v)}
                    className={clsx(
                      "rounded-xl px-4 py-3 text-left ring-1 transition-colors duration-200 ease-smooth",
                      version === v ? "bg-navy text-white ring-navy" : "bg-white text-navy ring-navy/20 hover:ring-navy/50"
                    )}
                  >
                    <span className="block text-sm font-semibold">{versionLabels[v]}</span>
                    <span className={clsx("mt-0.5 block text-xs", version === v ? "text-white/70" : "text-navy/50")}>
                      {formatNaira(v === "replica" ? (product.replicaPrice as number) : product.price)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.sizes.length > 0 && (
            <div>
              <span className="mb-3 block text-xs font-semibold uppercase tracking-wide text-navy/50">Size</span>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    aria-pressed={size === s}
                    className={clsx(
                      "flex h-11 min-w-[3rem] items-center justify-center rounded-lg px-3 text-sm font-semibold ring-1 transition-colors duration-200 ease-smooth",
                      size === s ? "bg-navy text-white ring-navy" : "bg-white text-navy/70 ring-navy/20 hover:ring-navy/50"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <span className="mb-3 block text-xs font-semibold uppercase tracking-wide text-navy/50">Quantity</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="btn-glass btn-glass-navy flex h-10 w-10 items-center justify-center rounded-lg"
              >
                −
              </button>
              <span className="w-8 text-center text-base font-semibold text-navy">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(Math.max(1, product.stock), q + 1))}
                aria-label="Increase quantity"
                className="btn-glass btn-glass-navy flex h-10 w-10 items-center justify-center rounded-lg"
              >
                +
              </button>
            </div>
          </div>

          {isDemo && (
            <p className="text-xs text-navy/40">
              Preview item. Add real products via /admin/products to make this purchasable.
            </p>
          )}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={outOfStock || isDemo}
            className="btn-glass btn-glass-yellow w-full px-8 py-4 text-sm font-bold uppercase tracking-wide"
          >
            {isDemo ? "Coming soon" : outOfStock ? "Sold out" : `Add to cart · ${formatNaira(price * quantity)}`}
          </button>
        </div>
      )}
    </div>
  );
}
