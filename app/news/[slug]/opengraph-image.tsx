import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";
import { apiFetch } from "@/lib/api";
import type { DemoNews } from "@/lib/demoData";

// Per-article share card, generated fresh rather than pointing platforms at
// the raw uploaded photo directly. That was the actual cause of X/Twitter
// showing an odd "rectangle" instead of a standard card: X renders whatever
// aspect ratio the source image actually has, and an admin-uploaded cover
// photo can be any shape. This route always outputs an exact 1200×630
// (X/Facebook/LinkedIn's universal standard size) with the photo cover-fit
// inside it, so every article's card is correctly shaped no matter what was
// uploaded — the crop is done here, once, server-side, not left to chance
// on whichever platform happens to render the link.
export const alt = "Eko United FC";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const categoryLabels: Record<DemoNews["category"], string> = {
  article: "Article",
  match_report: "Match Report",
  press_release: "Press Release",
};

async function getArticle(slug: string): Promise<DemoNews | null> {
  return await apiFetch<DemoNews>(`/news/${slug}`, 600);
}

export default async function OpengraphImage({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug);
  const crest = readFileSync(join(process.cwd(), "public/brand/crest-mark.png"));
  const crestSrc = `data:image/png;base64,${crest.toString("base64")}`;

  if (!article) {
    return new ImageResponse(
      (
        <div style={{ width: "100%", height: "100%", display: "flex", background: "#0A244D" }} />
      ),
      { ...size }
    );
  }

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#0A244D" }}>
        {article.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.coverImageUrl}
            width={size.width}
            height={size.height}
            style={{ position: "absolute", inset: 0, objectFit: "cover" }}
            alt=""
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "linear-gradient(to top, rgba(6,23,51,0.96) 0%, rgba(6,23,51,0.55) 45%, rgba(6,23,51,0.15) 100%)",
          }}
        />

        <div style={{ position: "absolute", top: 48, left: 56, display: "flex", alignItems: "center", gap: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={crestSrc} width={56} height={56} alt="" />
          <div style={{ display: "flex", fontSize: 28, fontWeight: 600, color: "#FFFFFF", letterSpacing: 1 }}>
            Eko United FC
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 56,
            right: 56,
            bottom: 52,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 24,
              fontWeight: 600,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#65CBE9",
            }}
          >
            {categoryLabels[article.category]}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 16,
              fontSize: 56,
              fontWeight: 700,
              lineHeight: 1.12,
              color: "#FFFFFF",
              maxHeight: 260,
              overflow: "hidden",
            }}
          >
            {article.title.length > 90 ? `${article.title.slice(0, 90).trim()}…` : article.title}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
