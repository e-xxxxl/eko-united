import { collageCard } from "@/lib/og/cards";
import { apiFetch } from "@/lib/api";
import type { ClubEvent } from "@/lib/eventTypes";

export const alt = "Events | Eko United FC";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 1800;

// The share card shows the photos that are on this page.
export default async function OpengraphImage() {
  const list = await apiFetch<ClubEvent[]>("/events", 1800);
  const events = (Array.isArray(list) ? list : []).filter((e) => e.imageUrl);
  return collageCard("events", events.map((e) => ({ url: e.imageUrl })));
}
