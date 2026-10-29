import { readFileSync } from "fs";
import { join } from "path";

// Server-only helpers for the generated share cards (opengraph-image files).

export const CARD = { width: 1200, height: 630 } as const;

export const COLORS = {
  navy: "#0A244D",
  navyDark: "#061733",
  cyan: "#65CBE9",
  yellow: "#FFC72C",
  white: "#FFFFFF",
} as const;

type OgFont = { name: string; data: Buffer; weight: 400 | 600; style: "normal" };

let fontCache: OgFont[] | null = null;

// The club's own typefaces (Bebas Neue for headlines, Work Sans for text), as
// TTF copies in lib/og/fonts: the image renderer cannot read the site's WOFF2
// files. If they are ever missing the cards fall back to the built-in font
// rather than failing.
export function ogFonts(): OgFont[] | undefined {
  if (fontCache) return fontCache;
  try {
    const dir = join(process.cwd(), "lib/og/fonts");
    fontCache = [
      { name: "Bebas", data: readFileSync(join(dir, "BebasNeue-Regular.ttf")), weight: 400, style: "normal" },
      { name: "Work", data: readFileSync(join(dir, "WorkSans-Regular.ttf")), weight: 400, style: "normal" },
      { name: "Work", data: readFileSync(join(dir, "WorkSans-SemiBold.ttf")), weight: 600, style: "normal" },
    ];
    return fontCache;
  } catch {
    return undefined;
  }
}

let crestCache: string | null = null;

export function crestUri(): string {
  if (!crestCache) {
    const crest = readFileSync(join(process.cwd(), "public/brand/crest-mark.png"));
    crestCache = `data:image/png;base64,${crest.toString("base64")}`;
  }
  return crestCache;
}

function sizedUrl(url: string, w: number, h: number, cutout: boolean): string {
  // Cloudinary: ask for exactly the crop the card needs (a few hundred KB, not
  // the 2MB original), centred on the subject. With "cutout" the AI background
  // removal is applied, as on the site.
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    const crop = `c_fill,w_${w},h_${h},g_auto`;
    return cutout
      ? url.replace("/upload/", `/upload/e_background_removal/${crop}/f_png/`)
      : url.replace("/upload/", `/upload/${crop},f_jpg,q_auto:good/`);
  }
  if (url.includes("images.unsplash.com")) {
    const u = new URL(url);
    u.searchParams.set("w", String(w));
    u.searchParams.set("fm", "jpg");
    return u.toString();
  }
  return url;
}

async function fetchAsDataUri(url: string, timeoutMs: number): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) return null;
    const type = (res.headers.get("content-type") || "").split(";")[0].trim();
    if (type !== "image/jpeg" && type !== "image/png") return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length === 0 || buf.length > 3_000_000) return null;
    return `data:${type};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

// A photo as an inline data URI sized for the card, or null if it cannot be
// had quickly. Share crawlers (WhatsApp especially) give up after a few
// seconds, so a slow or broken photo must never hold the card up: the card is
// drawn without it instead. A cut-out that fails (the background removal can
// take a moment the first time) falls back to the plain photo.
export async function cardPhoto(
  url: string | undefined | null,
  w: number,
  h: number,
  opts: { cutout?: boolean } = {}
): Promise<string | null> {
  if (!url) return null;
  if (opts.cutout) {
    const cut = await fetchAsDataUri(sizedUrl(url, w, h, true), 6000);
    if (cut) return cut;
  }
  return fetchAsDataUri(sizedUrl(url, w, h, false), 6000);
}

export function fitText(text: string, max: number): string {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1).trim()}…` : t;
}
