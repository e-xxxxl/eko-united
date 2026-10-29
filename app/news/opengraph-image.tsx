import { storyCard } from "@/lib/og/cards";
import { apiFetch } from "@/lib/api";
import type { DemoNews } from "@/lib/demoData";

export const alt = "News | Eko United FC";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 900;

// Led by the cover photo and headline of the latest story.
export default async function OpengraphImage() {
  const list = (await apiFetch<DemoNews[]>("/news?limit=1", 900)) || [];
  const latest = Array.isArray(list) ? list[0] : undefined;
  return storyCard({
    photo: latest?.coverImageUrl,
    eyebrow: "Latest news",
    title: latest?.title || "Latest News",
    meta: "Eko United FC news",
    fallbackKey: "news",
  });
}
