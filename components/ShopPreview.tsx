import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { demoProducts, type DemoProduct } from "@/lib/demoData";
import ProductCard from "@/components/shop/ProductCard";

async function getProducts(): Promise<DemoProduct[]> {
  const live = await apiFetch<DemoProduct[]>("/products", 900);
  return (live && live.length > 0 ? live : demoProducts).slice(0, 2);
}

export default async function ShopPreview() {
  const products = await getProducts();

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
          <ProductCard key={product._id} product={product} badge="New" />
        ))}
      </div>
    </section>
  );
}
