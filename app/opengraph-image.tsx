import { ImageResponse } from "next/og";

// Site-wide fallback share-card image — Next's file-convention route. Any
// page that doesn't define its own more specific `openGraph.images` (news
// articles, shop products, ticket pages all do) inherits this one, so a
// shared homepage/shop/tickets/cart link always renders a real large image
// card on X/Twitter/etc. instead of the blank card that came from the old
// `/social/default.jpg` reference in layout.tsx — that file never actually
// existed on disk, so every share was silently missing its image before this.
export const alt = "Eko United FC — The Uga Boys";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#0A244D",
        }}
      >
        <div style={{ display: "flex", width: 64, height: 6, background: "#65CBE9" }} />
        <div
          style={{
            display: "flex",
            marginTop: 40,
            fontSize: 108,
            fontWeight: 700,
            letterSpacing: -2,
            color: "#FFFFFF",
            lineHeight: 1,
          }}
        >
          EKO UNITED FC
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 40,
            fontWeight: 500,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#65CBE9",
          }}
        >
          The Uga Boys
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 56,
            fontSize: 26,
            color: "rgba(255,255,255,0.55)",
          }}
        >
          Nigeria National League
        </div>
      </div>
    ),
    { ...size }
  );
}
