import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import HeroCarousel from "@/components/HeroCarousel";
import MatchdayCountdown from "@/components/MatchdayCountdown";
import FixturesPreview from "@/components/FixturesPreview";
import StandingsPreview from "@/components/StandingsPreview";
import NewsPreview from "@/components/NewsPreview";
import SocialsSection from "@/components/SocialsSection";
import HistoryPreview from "@/components/HistoryPreview";
import ShopPreview from "@/components/ShopPreview";
import PlayerCarousel from "@/components/PlayerCarousel";
import PartnersSlogan from "@/components/PartnersSlogan";

// Placeholder data — replace with a fetch() to GET /api/matches/next once the
// backend has a real season calendar (the admin panel will own this once
// built). kickoffIso must stay a real ISO datetime — MatchdayCountdown reads it.
const nextMatch = {
  opponent: "Remo Stars FC",
  opponentInitial: "R",
  competition: "NNL — Matchday 12",
  date: "Sat, 30 Aug 2026 · 4:00 PM",
  venue: "Agege Stadium, Lagos",
  kickoffIso: "2026-08-30T15:00:00.000Z",
};

// Each data-driven section below is its own async Server Component wrapped
// in Suspense, so a slow/unreachable backend delays only that section — not
// the static hero, which paints immediately — and sections stream in
// independently rather than the whole page waiting on all of them together.
function SectionFallback({ className = "h-40" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-sm bg-navy/5 ${className}`} />
  );
}

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    name: "Eko United FC",
    alternateName: "The Uga Boys",
    sport: "Soccer",
    url: "https://ekounitedfc.com",
    memberOf: { "@type": "SportsOrganization", name: "Nigeria National League" },
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* HERO — full-bleed carousel background, header sits transparently on
          top until #hero-sentinel scrolls out of view. Purely static, no
          data fetch, so it paints immediately regardless of backend health. */}
      <section className="relative flex min-h-[92vh] flex-col justify-end overflow-hidden">
        <HeroCarousel />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/60 to-transparent" />

        <div className="relative z-10 px-6 pb-16 pt-32 sm:px-10 sm:pb-24 lg:px-16">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-cyan">
            Nigeria National League
          </p>
          <h1 className="display-hero font-display max-w-3xl text-white">The Uga Boys</h1>
          <p className="mt-6 max-w-md text-base text-white/70 sm:text-lg">
            The official home of Eko United FC — news, fixtures, tickets and
            everything Uga Boys.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/tickets"
              className="rounded-full bg-yellow px-8 py-3 text-sm font-bold uppercase tracking-wide text-navy-dark transition-transform duration-300 ease-smooth hover:scale-105"
            >
              Get tickets
            </Link>
            <Link
              href="/shop"
              className="rounded-full border border-white/30 px-8 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors duration-300 ease-smooth hover:border-white hover:bg-white/10"
            >
              Club shop
            </Link>
          </div>
        </div>
      </section>
      <div id="hero-sentinel" />

      {/* NEXT MATCH — team crests either side, countdown, two CTAs. Static
          demo data for now (see comment above); still no fetch, still instant. */}
      <section className="bg-navy-dark px-6 py-12 sm:px-10 lg:px-16">
        <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.3em] text-cyan sm:text-left">
          Next Match
        </p>
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-6 sm:gap-10">
            <div className="flex flex-col items-center gap-3">
              <Image
                src="/brand/crest-mark.png"
                alt="Eko United FC"
                width={64}
                height={64}
                className="h-14 w-14 sm:h-16 sm:w-16"
              />
              <span className="text-xs font-semibold uppercase tracking-wide text-white/60">
                Eko United
              </span>
            </div>
            <div className="text-center">
              <p className="font-display text-2xl text-white/40">VS</p>
              <MatchdayCountdown kickoffIso={nextMatch.kickoffIso} />
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 sm:h-16 sm:w-16">
                <span className="font-display text-2xl text-white/70">
                  {nextMatch.opponentInitial}
                </span>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide text-white/60">
                {nextMatch.opponent}
              </span>
            </div>
          </div>

          <div className="text-center lg:text-right">
            <p className="text-sm text-white/60">
              {nextMatch.competition} · {nextMatch.date}
            </p>
            <p className="text-sm text-white/40">{nextMatch.venue}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-3 lg:justify-end">
              <Link
                href="/news"
                className="rounded-full border border-white/30 px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white transition-colors duration-300 ease-smooth hover:border-white hover:bg-white/10"
              >
                Get more updates
              </Link>
              <Link
                href="/tickets"
                className="rounded-full bg-yellow px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-navy-dark transition-transform duration-300 ease-smooth hover:scale-105"
              >
                Buy tickets
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* MATCHES — next 3 fixtures + full league table, Eko United highlighted */}
      <section className="px-6 py-16 sm:px-10 lg:px-16">
        {/* min-w-0 on each grid item: without it, StandingsPreview's table
            (min-w-[480px], for its own internal horizontal scroll) forces
            the whole grid — including this sibling column — to refuse to
            shrink below 480px, overflowing the page on mobile. Grid items
            default to min-width:auto, not 0. */}
        <div className="grid gap-14 lg:grid-cols-2">
          <div className="min-w-0">
            <Suspense fallback={<SectionFallback className="h-72" />}>
              <FixturesPreview />
            </Suspense>
          </div>
          <div className="min-w-0">
            <Suspense fallback={<SectionFallback className="h-72" />}>
              <StandingsPreview />
            </Suspense>
          </div>
        </div>
      </section>

      <Suspense fallback={<SectionFallback className="mx-6 h-64 sm:mx-10 lg:mx-16" />}>
        <NewsPreview />
      </Suspense>

      <Suspense fallback={<SectionFallback className="h-32" />}>
        <SocialsSection />
      </Suspense>

      <Suspense fallback={<SectionFallback className="mx-6 h-24 sm:mx-10 lg:mx-16" />}>
        <HistoryPreview />
      </Suspense>

      <ShopPreview />

      <Suspense fallback={<SectionFallback className="mx-6 h-64 sm:mx-10 lg:mx-16" />}>
        <PlayerCarousel />
      </Suspense>

      <Suspense fallback={<SectionFallback className="h-40" />}>
        <PartnersSlogan />
      </Suspense>
    </main>
  );
}
