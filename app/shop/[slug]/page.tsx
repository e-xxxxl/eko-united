import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { DemoProduct } from "@/lib/demoData";
import { formatNaira } from "@/lib/format";
import { isAllowedImageUrl } from "@/lib/imageHosts";
import ProductDetailPurchase from "@/components/shop/ProductDetailPurchase";
import ProductGallery from "@/components/shop/ProductGallery";
import ProductCard, { categoryLabels } from "@/components/shop/ProductCard";

async function getProduct(slug: string): Promise<DemoProduct | null> {
  return await apiFetch<DemoProduct>(`/products/${slug}`, 900);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product Not Found" };

  const description = product.description || `${product.name}, ${formatNaira(product.price)}. Official Eko United FC merchandise.`;
  const url = `https://ekounitedfc.com/shop/${product.slug}`;

  return {
    title: product.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: "Eko United FC",
      title: `${product.name} | Eko United FC Shop`,
      description,
      url,
      // No manual `images`: opengraph-image.tsx in this route folder
      // generates the actual card (always 1200x630), rather than claiming
      // that size for what's usually actually a square product photo.
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, all] = await Promise.all([getProduct(slug), apiFetch<DemoProduct[]>("/products", 900)]);
  if (!product) notFound();

  const photos = product.images.filter(isAllowedImageUrl);
  const related = (Array.isArray(all) ? all : []).filter((p) => p._id !== product._id).slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: photos.length ? photos : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "NGN",
      price: product.price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <main className="px-6 py-10 sm:px-10 sm:py-14 lg:px-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav aria-label="Breadcrumb" className="mb-8 text-xs font-semibold uppercase tracking-wide text-navy/40">
        <Link href="/shop" className="transition-colors duration-200 ease-smooth hover:text-navy">
          Shop
        </Link>
        <span className="mx-2 text-navy/25">/</span>
        <span className="text-navy/70">{categoryLabels[product.category] || "Merchandise"}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16">
        <ProductGallery images={photos} name={product.name} />

        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-cyan">
            {categoryLabels[product.category] || "Merchandise"}
          </p>
          <h1 className="display-title font-display mt-3">{product.name}</h1>
          <ProductDetailPurchase product={product} image={photos[0]} />
          {product.description && (
            <div className="mt-9 border-t border-navy/10 pt-7">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-navy/50">Details</p>
              <p className="whitespace-pre-line text-base leading-relaxed text-navy/70">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24 border-t border-navy/10 pt-14">
          <h2 data-reveal className="display-title font-display mb-8">
            More from the shop
          </h2>
          <div data-reveal-stagger className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 xl:gap-x-6">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
