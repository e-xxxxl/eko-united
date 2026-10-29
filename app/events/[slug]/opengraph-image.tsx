import { sectionCard, storyCard } from "@/lib/og/cards";
import { apiFetch } from "@/lib/api";
import { formatEventDate, type ClubEvent } from "@/lib/eventTypes";

export const alt = "Eko United FC event";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 1800;

export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await apiFetch<ClubEvent>(`/events/${slug}`, 1800);
  if (!event) return sectionCard("events");
  return storyCard({
    photo: event.imageUrl || event.images?.[0],
    eyebrow: event.isCsr ? "Community Social Responsibility" : "Event",
    title: event.name,
    meta: [formatEventDate(event.eventDate), event.location].filter(Boolean).join(" | ") || "Eko United FC",
    fallbackKey: "events",
  });
}
