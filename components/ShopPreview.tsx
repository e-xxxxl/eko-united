import Link from "next/link";
import { apiFetch } from "@/lib/api";
import type { DemoProduct } from "@/lib/demoData";
import ProductCard from "@/components/shop/ProductCard";

async function getProducts(): Promise<DemoProduct[]> {
  const list = await apiFetch<DemoProduct[]>("/products", 900);
  return (Array.isArray(list) ? list : []).slice(0, 4);
}

export default async function ShopPreview() {
  const products = await getProducts();
  if (products.length === 0) return null;

  return (
    <section className="bg-navy-dark px-6 py-16 sm:px-10 lg:px-16">
      <div data-reveal className="mb-8 flex items-baseline justify-between gap-x-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-cyan">
            2026 Kit
          </p>
          <h2 className="font-display text-2xl text-white sm:text-3xl">Club Shop</h2>
        </div>
        <Link
          href="/shop"
          className="shrink-0 whitespace-nowrap text-sm font-semibold text-cyan transition-colors duration-200 ease-smooth hover:text-white"
        >
          Visit shop →
        </Link>
      </div>

      <div data-reveal-stagger className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} badge="New" dark />
        ))}
      </div>
    </section>
  );
}
