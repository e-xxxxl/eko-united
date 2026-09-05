import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { DemoProduct } from "@/lib/demoData";
import { formatNaira } from "@/lib/format";
import { isAllowedImageUrl } from "@/lib/imageHosts";
import ProductDetailPurchase from "@/components/shop/ProductDetailPurchase";

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

  const description = product.description || `${product.name} — ${formatNaira(product.price)}. Official Eko United FC merchandise.`;
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
      // No manual `images` — opengraph-image.tsx in this route folder
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
  const product = await getProduct(slug);
  if (!product) notFound();

  const image = product.images.find(isAllowedImageUrl);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: image ? [image] : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "NGN",
      price: product.price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <main className="px-6 py-16 sm:px-10 lg:px-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="relative aspect-square overflow-hidden bg-navy-light">
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 90vw"
              className="object-contain p-8"
            />
          ) : null}
        </div>

        <div>
          <h1 className="display-title font-display">{product.name}</h1>
          <p className="mt-4 text-2xl font-semibold text-navy">{formatNaira(product.price)}</p>
          {product.description && (
            <p className="mt-6 max-w-md text-base leading-relaxed text-navy/70">{product.description}</p>
          )}
          <ProductDetailPurchase product={product} image={image} />
        </div>
      </div>
    </main>
  );
}
