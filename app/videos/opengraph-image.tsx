import { collageCard } from "@/lib/og/cards";
import { apiFetch } from "@/lib/api";

export const alt = "Videos | Eko United FC";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 1800;

// The share card shows the photos that are on this page.
export default async function OpengraphImage() {
  const list = await apiFetch<{ videoId: string }[]>("/videos", 1800);
  const videos = Array.isArray(list) ? list : [];
  return collageCard("videos", videos.map((v) => ({ url: `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg` })));
}
