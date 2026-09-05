import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

// Site-wide fallback share-card image — Next's file-convention route. Any
// page that doesn't define its own more specific `openGraph.images` (news
// articles, shop products, ticket pages all do) inherits this one — most
// importantly the homepage itself, so a shared homepage link shows the real
// crest rather than just typography. The old `/social/default.jpg`
// reference in layout.tsx pointed at a file that never actually existed on
// disk, so every share was silently missing its image before this.
export const alt = "Eko United FC — The Uga Boys";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const crest = readFileSync(join(process.cwd(), "public/brand/crest-mark.png"));
  const crestSrc = `data:image/png;base64,${crest.toString("base64")}`;

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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={crestSrc} width={140} height={140} alt="" />
        <div style={{ display: "flex", width: 64, height: 6, marginTop: 40, background: "#65CBE9" }} />
        <div
          style={{
            display: "flex",
            marginTop: 32,
            fontSize: 100,
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
            fontSize: 38,
            fontWeight: 500,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#65CBE9",
          }}
        >
          The Uga Boys
        </div>
      </div>
    ),
    { ...size }
  );
}
