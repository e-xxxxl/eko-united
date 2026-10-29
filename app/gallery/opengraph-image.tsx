import { collageCard } from "@/lib/og/cards";
import { apiFetch } from "@/lib/api";
import type { DemoGalleryItem } from "@/lib/demoData";

export const alt = "Gallery | Eko United FC";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 1800;

// The share card shows the photos that are on this page.
export default async function OpengraphImage() {
  const items = await apiFetch<DemoGalleryItem[]>("/gallery?type=photo", 1800);
  const photos = (Array.isArray(items) ? items : []).filter((i) => i.type === "photo");
  return collageCard("gallery", photos.map((i) => ({ url: i.url })));
}
