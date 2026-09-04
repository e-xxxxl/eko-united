import type { Metadata } from "next";
import { apiFetch } from "@/lib/api";
import { demoProducts, type DemoProduct } from "@/lib/demoData";
import ProductCard from "@/components/shop/ProductCard";

export const metadata: Metadata = {
  title: "Club Shop",
  description: "Official Eko United FC merchandise — 2026 home and away kits, and more.",
  alternates: { canonical: "https://ekounitedfc.com/shop" },
  openGraph: {
    type: "website",
    siteName: "Eko United FC",
    title: "Club Shop | Eko United FC",
    description: "Official Eko United FC merchandise — 2026 home and away kits, and more.",
    url: "https://ekounitedfc.com/shop",
  },
};

async function getProducts(): Promise<DemoProduct[]> {
  const live = await apiFetch<DemoProduct[]>("/products", 900);
  return live && live.length > 0 ? live : demoProducts;
}

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <main className="px-6 py-16 sm:px-10 lg:px-16">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-cyan">
        Official Merchandise
      </p>
      <h1 className="display-title font-display mb-10">Club Shop</h1>

      {products.length === 0 ? (
        <p className="text-navy/50">Products will appear here once added by the club.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
