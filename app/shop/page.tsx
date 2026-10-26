import type { Metadata } from "next";
import { apiFetch } from "@/lib/api";
import type { DemoProduct } from "@/lib/demoData";
import ShopBrowser from "@/components/shop/ShopBrowser";

export const metadata: Metadata = {
  title: "Club Shop",
  description: "Official Eko United FC merchandise: 2026 home and away kits, and more.",
  alternates: { canonical: "https://ekounitedfc.com/shop" },
  openGraph: {
    type: "website",
    siteName: "Eko United FC",
    title: "Club Shop | Eko United FC",
    description: "Official Eko United FC merchandise: 2026 home and away kits, and more.",
    url: "https://ekounitedfc.com/shop",
  },
};

async function getProducts(): Promise<DemoProduct[]> {
  // Guard against any non-list reply so a bad response can never break the build.
  const list = await apiFetch<DemoProduct[]>("/products", 900);
  return Array.isArray(list) ? list : [];
}

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <main className="px-6 py-16 sm:px-10 lg:px-16">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Official Merchandise</p>
          <h1 className="display-title font-display">Club Shop</h1>
        </div>
        {products.length > 0 && (
          <p className="text-sm text-navy/50">
            {products.length} {products.length === 1 ? "product" : "products"}
          </p>
        )}
      </div>

      {products.length === 0 ? (
        <p className="text-navy/50">Products will appear here once added by the club.</p>
      ) : (
        <ShopBrowser products={products} />
      )}
    </main>
  );
}
