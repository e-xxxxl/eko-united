import type { Metadata } from "next";
import { apiFetch } from "@/lib/api";
import EventsBrowser from "@/components/EventsBrowser";
import type { ClubEvent } from "@/lib/eventTypes";
import { sectionMeta } from "@/lib/seo";

export const metadata: Metadata = sectionMeta("events");

async function getEvents(): Promise<ClubEvent[]> {
  return (await apiFetch<ClubEvent[]>("/events", 600)) || [];
}

export default async function EventsPage() {
  const events = await getEvents();

  // Upcoming (or undated) first, soonest first; finished events after, newest first.
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const isUpcoming = (e: ClubEvent) => !e.eventDate || new Date(e.eventDate) >= startOfToday;
  const upcoming = events
    .filter(isUpcoming)
    .sort((a, b) => (a.eventDate ? new Date(a.eventDate).getTime() : Infinity) - (b.eventDate ? new Date(b.eventDate).getTime() : Infinity));
  const past = events
    .filter((e) => !isUpcoming(e))
    .sort((a, b) => new Date(b.eventDate as string).getTime() - new Date(a.eventDate as string).getTime());

  return (
    <main className="px-6 py-16 sm:px-10 lg:px-16">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Club life</p>
      <h1 className="display-title font-display mb-10">Events &amp; CSR</h1>

      {events.length === 0 ? (
        <p className="text-navy/50">Events will appear here once the club announces them.</p>
      ) : (
        <EventsBrowser upcoming={upcoming} past={past} />
      )}
    </main>
  );
}
