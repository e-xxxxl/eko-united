import { collageCard } from "@/lib/og/cards";
import { apiFetch } from "@/lib/api";

export const alt = "Club Membership | Eko United FC";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 600;

// The share card shows the photos that are on this page.
export default async function OpengraphImage() {
  const data = await apiFetch<{ content?: { heroImageUrl?: string; gallery?: { url?: string }[] } }>("/membership/plans", 600);
  const gallery = data?.content?.gallery || [];
  const urls = [data?.content?.heroImageUrl, ...gallery.map((g) => g.url)].filter(Boolean);
  return collageCard("membership", urls.map((url) => ({ url })));
}
