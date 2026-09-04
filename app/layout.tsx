import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import SiteChrome from "@/components/SiteChrome";
import { apiFetch } from "@/lib/api";
import "./globals.css";

// Matches what's actually shipped on ekounitedfc.com's live teaser page —
// both are free Google Fonts (Bebas Neue + Work Sans), no licensing blocker.
// Self-hosted via next/font/local rather than next/font/google: the runtime
// fetch next/font/google does to Google's servers at dev-server-start/build
// time was failing (both in this sandbox and on Emmanuel's own machine —
// AbortError/certificate errors reaching fonts.googleapis.com). The font
// files themselves are unchanged — pulled from Google Fonts' own CSS API
// (fonts.googleapis.com/css2) and CDN (fonts.gstatic.com) and committed to
// frontend/public/fonts/ — this just removes the live network dependency.
const displayFont = localFont({
  src: "../public/fonts/BebasNeue-Regular.woff2",
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const bodyFont = localFont({
  src: [
    { path: "../public/fonts/WorkSans-Light.woff2", weight: "300" },
    { path: "../public/fonts/WorkSans-Regular.woff2", weight: "400" },
    { path: "../public/fonts/WorkSans-Medium.woff2", weight: "500" },
    { path: "../public/fonts/WorkSans-SemiBold.woff2", weight: "600" },
  ],
  variable: "--font-body",
  display: "swap",
});

const siteUrl = "https://ekounitedfc.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Eko United FC | Official Website",
    template: "%s | Eko United FC",
  },
  description:
    "Official website of Eko United FC, The Uga Boys — Nigeria National League club. News, fixtures, results, tickets and club shop.",
  openGraph: {
    type: "website",
    siteName: "Eko United FC",
    title: "Eko United FC | Official Website",
    description:
      "Official website of Eko United FC, The Uga Boys — Nigeria National League club.",
    url: siteUrl,
    // No explicit `images` here — the app/opengraph-image.tsx file convention
    // supplies the default share-card image site-wide (and any route with
    // its own generateMetadata, like a news article, overrides it with a
    // real photo). The old `/social/default.jpg` reference pointed at a file
    // that was never actually added to public/, so every shared link was
    // silently rendering with no image until this.
  },
  twitter: {
    card: "summary_large_image",
    title: "Eko United FC | Official Website",
    description:
      "Official website of Eko United FC, The Uga Boys — Nigeria National League club.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A244D",
};

type SiteSettings = {
  clubInfo?: { address?: string; phone?: string; email?: string };
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    youtube?: string;
    tiktok?: string;
  };
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetched once here (cached, revalidated hourly) so every page's footer
  // gets club contact info + social links without each page fetching it.
  const settings = await apiFetch<SiteSettings>("/settings");

  return (
    // suppressHydrationWarning on both root tags: the actual production
    // error (React #418, args[]=HTML) plus the repeated "extension port...
    // back/forward cache" console messages point at a browser extension
    // (password manager, Grammarly, an ad/theme extension, etc.) injecting
    // attributes into <html>/<body> before React hydrates — not a real
    // mismatch in anything this app renders. This is Next.js's own
    // documented fix for exactly that scenario; it only silences the
    // warning for these two root elements, it doesn't hide a real mismatch
    // anywhere inside the actual page content.
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <SiteChrome settings={settings}>{children}</SiteChrome>
      </body>
    </html>
  );
}
