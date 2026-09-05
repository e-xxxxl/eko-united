import type { MetadataRoute } from "next";

// Next's file-convention route — auto-served at /manifest.webmanifest with
// the correct <link rel="manifest"> tag injected automatically, no manual
// <head> wiring needed. The crest (public/brand/crest-mark.png) is a real
// 512x512 PNG, so it's declared at both the 192 and 512 sizes Chrome/Android
// require for installability — browsers downscale the 512 source for the
// smaller entry just fine (only upscaling loses real quality).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Eko United FC — The Uga Boys",
    short_name: "Eko United FC",
    description: "Official Eko United FC app — news, fixtures, tickets and the club shop.",
    start_url: "/",
    display: "standalone",
    background_color: "#0A244D",
    theme_color: "#0A244D",
    // No "maskable" entry: Android crops maskable icons into circles/
    // squircles, which needs the artwork to sit inside a safe-zone margin —
    // without that confirmed, declaring one risks clipping the crest badly.
    // Android still renders a perfectly good adaptive icon from a plain
    // ("any" purpose, the default) icon on its own.
    icons: [
      { src: "/brand/crest-mark.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/crest-mark.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
