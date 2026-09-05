import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";
import { apiFetch } from "@/lib/api";
import type { DemoProduct } from "@/lib/demoData";
import { isAllowedImageUrl } from "@/lib/imageHosts";
import { formatNaira } from "@/lib/format";

// Same reasoning as app/news/[slug]/opengraph-image.tsx: generate a correct
// 1200x630 card rather than pointing platforms at the raw product photo,
// which is usually square (not the 1200x630 the old metadata claimed).
export const alt = "Eko United FC Shop";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function getProduct(slug: string): Promise<DemoProduct | null> {
  return await apiFetch<DemoProduct>(`/products/${slug}`, 900);
}

export default async function OpengraphImage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  const crest = readFileSync(join(process.cwd(), "public/brand/crest-mark.png"));
  const crestSrc = `data:image/png;base64,${crest.toString("base64")}`;

  if (!product) {
    return new ImageResponse(
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0A244D" }} />,
      { ...size }
    );
  }

  const image = product.images.find(isAllowedImageUrl);

  return (
    new ImageResponse(
      (
        <div style={{ width: "100%", height: "100%", display: "flex", background: "#0A244D" }}>
          {/* Photo panel on the left, product-name panel on the right —
              product photos are usually square/plain-background, so a
              full-bleed cover crop (like the news card) would crop into the
              product itself; a side-by-side layout keeps the whole photo
              visible instead. */}
          <div style={{ width: 520, height: "100%", display: "flex", background: "#FFFFFF", position: "relative" }}>
            {image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                width={520}
                height={630}
                style={{ objectFit: "contain", padding: 48 }}
                alt=""
              />
            )}
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "0 64px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={crestSrc} width={44} height={44} alt="" />
              <div style={{ display: "flex", fontSize: 22, fontWeight: 600, color: "#65CBE9", letterSpacing: 3, textTransform: "uppercase" }}>
                Club Shop
              </div>
            </div>
            <div style={{ display: "flex", marginTop: 28, fontSize: 48, fontWeight: 700, color: "#0A244D", lineHeight: 1.1 }}>
              {product.name}
            </div>
            <div style={{ display: "flex", marginTop: 20, fontSize: 34, fontWeight: 600, color: "#0A244D" }}>
              {formatNaira(product.price)}
            </div>
          </div>
        </div>
      ),
      { ...size }
    )
  );
}
