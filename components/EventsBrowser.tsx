"use client";

import { useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import EventCard from "@/components/EventCard";
import FramedImage from "@/components/FramedImage";
import { isAllowedImageUrl } from "@/lib/imageHosts";
import { CSR_LABEL, formatEventDate, type ClubEvent } from "@/lib/eventTypes";

type Filter = "all" | "events" | "csr";

// The events list: the next upcoming event as a large lead card, the rest
// as a grid, then past events. Upcoming and past arrive already split by the
// server, so what is "upcoming" never differs between the server render and
// the browser. When the club has any CSR activities, tabs let visitors see
// only events or only CSR.
export default function EventsBrowser({ upcoming, past }: { upcoming: ClubEvent[]; past: ClubEvent[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const hasCsr = [...upcoming, ...past].some((e) => e.isCsr);
  const hasEvents = [...upcoming, ...past].some((e) => !e.isCsr);
  const showTabs = hasCsr && hasEvents;

  const pick = (list: ClubEvent[]) =>
    list.filter((e) => (filter === "all" ? true : filter === "csr" ? e.isCsr : !e.isCsr));
  const up = pick(upcoming);
  const old = pick(past);
  const [featured, ...restUpcoming] = up;
  const featuredImage = featured?.imageUrl && isAllowedImageUrl(featured.imageUrl) ? featured.imageUrl : null;

  const tabs: { value: Filter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "events", label: "Events" },
    { value: "csr", label: "CSR" },
  ];

  return (
    <>
      {showTabs && (
        <div className="mb-10 flex gap-6 border-b border-navy/10">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setFilter(tab.value)}
              className={clsx(
                "-mb-px border-b-2 pb-3 text-xs font-semibold uppercase tracking-wide transition-colors duration-200 ease-smooth",
                filter === tab.value ? "border-cyan text-navy" : "border-transparent text-navy/40 hover:text-navy"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {up.length === 0 && old.length === 0 && <p className="text-navy/50">Nothing here yet.</p>}

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
                {featured.isCsr ? CSR_LABEL : featured.eventDate ? "Next event" : "Featured"}
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
        <div className="mt-10 grid gap-x-6 gap-y-11 sm:grid-cols-2 lg:grid-cols-3">
          {restUpcoming.map((e) => (
            <EventCard key={e._id} event={e} />
          ))}
        </div>
      )}

      {old.length > 0 && (
        <section className="mt-20 border-t border-navy/10 pt-12">
          <h2 className="display-title font-display mb-8">Past events</h2>
          <div className="grid gap-x-6 gap-y-11 sm:grid-cols-2 lg:grid-cols-3">
            {old.map((e) => (
              <EventCard key={e._id} event={e} muted />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
