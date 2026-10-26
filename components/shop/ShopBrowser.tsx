"use client";

import { useMemo, useState } from "react";
import { clsx } from "clsx";
import ProductCard, { categoryLabels, type ShopProduct } from "@/components/shop/ProductCard";

type Sort = "newest" | "price-asc" | "price-desc";

const sorts: { key: Sort; label: string }[] = [
  { key: "newest", label: "Newest" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
];

// The shop front: category tabs with counts, a sort control, and a clean
// photo-led grid. Everything is filtered in the browser (the catalogue is
// small), so switching is instant.
export default function ShopBrowser({ products }: { products: ShopProduct[] }) {
  const [category, setCategory] = useState<"all" | NonNullable<ShopProduct["category"]>>("all");
  const [sort, setSort] = useState<Sort>("newest");

  const present = useMemo(() => {
    const set = new Set<NonNullable<ShopProduct["category"]>>();
    products.forEach((p) => p.category && set.add(p.category));
    return Array.from(set);
  }, [products]);

  const shown = useMemo(() => {
    const list = category === "all" ? [...products] : products.filter((p) => p.category === category);
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    return list;
  }, [products, category, sort]);

  const tabs: { key: "all" | NonNullable<ShopProduct["category"]>; label: string; count: number }[] = [
    { key: "all", label: "All", count: products.length },
    ...present.map((c) => ({
      key: c,
      label: c === "jersey" ? "Jerseys" : categoryLabels[c],
      count: products.filter((p) => p.category === c).length,
    })),
  ];

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 border-b border-navy/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 overflow-x-auto" role="tablist" aria-label="Shop categories">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={category === t.key}
              onClick={() => setCategory(t.key)}
              className={clsx(
                "shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-colors duration-200 ease-smooth",
                category === t.key ? "bg-navy text-white" : "text-navy/60 hover:bg-navy/5 hover:text-navy"
              )}
            >
              {t.label} <span className={category === t.key ? "text-white/60" : "text-navy/35"}>{t.count}</span>
            </button>
          ))}
        </div>

        <label className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-navy/50">
          Sort
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm font-medium normal-case tracking-normal text-navy outline-none focus:border-cyan"
          >
            {sorts.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {shown.length === 0 ? (
        <p className="py-10 text-navy/50">Nothing in this category yet.</p>
      ) : (
        <div data-reveal-stagger className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4 xl:gap-x-6">
          {shown.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
