import type { Metadata } from "next";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import EventCard from "@/components/EventCard";
import FramedImage from "@/components/FramedImage";
import { isAllowedImageUrl } from "@/lib/imageHosts";
import { formatEventDate, type ClubEvent } from "@/lib/eventTypes";

export const metadata: Metadata = {
  title: "Events",
  description: "Fan days, community events and club occasions from Eko United FC.",
};

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

  const [featured, ...restUpcoming] = upcoming;
  const featuredImage = featured?.imageUrl && isAllowedImageUrl(featured.imageUrl) ? featured.imageUrl : null;

  return (
    <main className="px-6 py-16 sm:px-10 lg:px-16">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Club life</p>
      <h1 className="display-title font-display mb-10">Events</h1>

      {events.length === 0 ? (
        <p className="text-navy/50">Events will appear here once the club announces them.</p>
      ) : (
        <>
          {featured && (
            <Link
              href={`/events/${featured.slug}`}
              data-reveal
              className="group relative block overflow-hidden rounded-2xl bg-navy-dark"
            >
              <div className="relative aspect-[4/5] sm:aspect-[16/8]">
                {featuredImage && (
                  <FramedImage
                    src={featuredImage}
                    alt={featured.name}
                    sizes="(min-width: 1024px) 90vw, 100vw"
                    fill
                    rounded={false}
                    priority
                    className="transition-transform duration-[900ms] ease-smooth group-hover:scale-[1.03]"
                  />
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/35 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-9 lg:p-12">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan">
                    {featured.eventDate ? "Next event" : "Featured"}
                  </p>
                  <p className="mt-3 line-clamp-3 max-w-3xl font-display text-3xl leading-[1.02] text-white sm:text-5xl lg:text-6xl">
                    {featured.name}
                  </p>
                  <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-white/75">
                    {[formatEventDate(featured.eventDate), featured.location].filter(Boolean).join(" · ")}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-cyan transition-transform duration-300 ease-smooth group-hover:translate-x-1">
                    See the event <span aria-hidden>→</span>
                  </span>
                </div>
              </div>
            </Link>
          )}

          {restUpcoming.length > 0 && (
            <div data-reveal-stagger className="mt-10 grid gap-x-6 gap-y-11 sm:grid-cols-2 lg:grid-cols-3">
              {restUpcoming.map((e) => (
                <EventCard key={e._id} event={e} />
              ))}
            </div>
          )}

          {past.length > 0 && (
            <section className="mt-20 border-t border-navy/10 pt-12">
              <h2 data-reveal className="display-title font-display mb-8">
                Past events
              </h2>
              <div data-reveal-stagger className="grid gap-x-6 gap-y-11 sm:grid-cols-2 lg:grid-cols-3">
                {past.map((e) => (
                  <EventCard key={e._id} event={e} muted />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}
