"use client";

import { useState } from "react";
import Link from "next/link";
import { formatNaira } from "@/lib/format";
import { addToCart } from "@/lib/cart";
import { isRealId } from "@/lib/isRealId";

export type TicketTypeOption = {
  _id: string;
  name: string;
  price: number;
  quantityAvailable: number;
  quantitySold: number;
};

export default function TicketPurchase({
  ticketTypes,
  matchLabel,
}: {
  ticketTypes: TicketTypeOption[];
  matchLabel: string;
}) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [added, setAdded] = useState(false);

  function setQty(id: string, qty: number) {
    setQuantities((prev) => ({ ...prev, [id]: Math.max(0, qty) }));
  }

  function handleAddToCart() {
    const chosen = ticketTypes.filter((t) => (quantities[t._id] || 0) > 0);
    for (const t of chosen) {
      addToCart("ticket", {
        refType: "TicketType",
        ref: t._id,
        name: t.name,
        price: t.price,
        quantity: quantities[t._id],
        matchLabel,
      });
    }
    if (chosen.length > 0) setAdded(true);
  }

  if (added) {
    return (
      <div className="mt-8 border-t border-navy/10 pt-6">
        <p className="text-sm text-navy">Tickets added to your cart.</p>
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
            Add more
          </button>
        </div>
      </div>
    );
  }

  const anySelected = Object.values(quantities).some((q) => q > 0);

  return (
    <div className="mt-8 border-t border-navy/10 pt-6">
      <div className="space-y-4">
        {ticketTypes.map((t) => {
          const isDemo = !isRealId(t._id);
          const remaining = isDemo ? Infinity : Math.max(0, t.quantityAvailable - t.quantitySold);
          const soldOut = !isDemo && remaining <= 0;
          return (
            <div key={t._id} className="flex items-center justify-between gap-4 border-b border-navy/10 pb-4">
              <div>
                <p className="font-display text-lg text-navy">{t.name}</p>
                <p className="text-sm text-navy/50">
                  {formatNaira(t.price)}{" "}
                  {soldOut ? (
                    <span className="text-red-500">— Sold out</span>
                  ) : isDemo ? (
                    <span className="text-navy/30">— Preview, not yet purchasable</span>
                  ) : null}
                </p>
              </div>
              {!soldOut && !isDemo && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQty(t._id, (quantities[t._id] || 0) - 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-navy/20 text-navy transition-colors duration-200 ease-smooth hover:border-navy"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-semibold text-navy">
                    {quantities[t._id] || 0}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty(t._id, Math.min(remaining, (quantities[t._id] || 0) + 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-navy/20 text-navy transition-colors duration-200 ease-smooth hover:border-navy"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={!anySelected}
        className="mt-6 w-full rounded-full bg-yellow px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-navy-dark transition-transform duration-300 ease-smooth hover:scale-[1.02] disabled:cursor-not-allowed disabled:bg-navy/10 disabled:text-navy/30 disabled:hover:scale-100 sm:w-auto"
      >
        Add to cart
      </button>
    </div>
  );
}
