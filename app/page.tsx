import { Suspense } from "react";
import Image from "next/image";
import HeroCarousel, { type HeroSlide } from "@/components/HeroCarousel";
import MatchdayCountdown from "@/components/MatchdayCountdown";
import FixturesPreview from "@/components/FixturesPreview";
import ResultsPreview from "@/components/ResultsPreview";
import StandingsPreview from "@/components/StandingsPreview";
import NewsPreview from "@/components/NewsPreview";
import SocialsSection from "@/components/SocialsSection";
import HistoryPreview from "@/components/HistoryPreview";
import ShopPreview from "@/components/ShopPreview";
import PlayerCarousel from "@/components/PlayerCarousel";
import PartnersSlogan from "@/components/PartnersSlogan";
import { apiFetch } from "@/lib/api";
import { isAllowedImageUrl } from "@/lib/imageHosts";
import Link from "next/link";

async function getHeroSlides(): Promise<HeroSlide[]> {
  return (await apiFetch<HeroSlide[]>("/news?limit=5", 600)) || [];
}

type NextMatch = {
  _id: string;
  opponent: string;
  opponentLogoUrl?: string;
  competition?: string;
  venue?: string;
  kickoff: string;
  isHome: boolean;
};

async function getNextMatch(): Promise<NextMatch | null> {
  return await apiFetch<NextMatch>("/matches/next", 300);
}

function formatMatchDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Lagos",
  });
}

// Each data-driven section below is its own async Server Component wrapped
// in Suspense, so a slow/unreachable backend delays only that section — not
// the static hero, which paints immediately — and sections stream in
// independently rather than the whole page waiting on all of them together.
function SectionFallback({ className = "h-40" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-sm bg-navy/5 ${className}`} />
  );
}

export default async function HomePage() {
  const [heroSlides, nextMatch] = await Promise.all([getHeroSlides(), getNextMatch()]);
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

      {/* HERO — the latest news, not stock photography: each slide is a real
          story (see getHeroSlides above), the whole slide links through to
          that article, and the header sits transparently on top of it (and
          stays transparent past it, see Header.tsx). Fetched here (not
          deferred behind Suspense) so the lead story is in the initial HTML,
          good for both LCP and a visitor who shares the homepage link.
          Ticket/shop CTAs deliberately aren't duplicated in here (a nested <Link> inside
          the slide's own link would be invalid HTML): they're one scroll
          away in the Next Match band below, and always in the header. */}
      {/* min-h-[max(92vh,56.25vw)]: on an ordinary (~16:9) screen 92vh and
          56.25vw land in about the same place, so this changes nothing there.
          On a wide/ultrawide window, 92vh alone pins the box's height while
          its width keeps growing with the viewport: the wider that gets
          relative to a portrait-oriented news photo, the more object-cover
          has to scale the photo up to cover the width, cropping into most of
          its height ("too zoomed in on big screen"). Capping the ratio to
          16:9 via the vw term means the box grows taller to match instead of
          staying razor-thin-and-wide, so the crop factor stays reasonable. */}
      {/* Pulled up by the header's own real height (--header-height, set by
          Header.tsx measuring itself) so this section visually starts at the
          very top of the page, genuinely behind the sticky header, instead
          of beginning right after the space the header reserves for itself
          in normal flow, see Header.tsx's comment on this for the full
          story of why that reserved space used to just show a blank white
          strip. The 100px fallback covers the one JS-less paint before that
          effect runs; it's close enough to the header's real ~94-102px
          height (mobile/desktop) that the gap is imperceptible either way. */}
      <section
        className="relative flex min-h-[max(92vh,56.25vw)] flex-col justify-end overflow-hidden"
        style={{ marginTop: "calc(-1 * var(--header-height, 100px))" }}
      >
        <HeroCarousel slides={heroSlides} />
      </section>

      {/* NEXT MATCH — the real next upcoming fixture (GET /api/matches/next,
          soonest kickoff first), not a hardcoded placeholder. Hides entirely
          if there's no upcoming match scheduled yet, rather than showing a
          fake opponent. */}
      {nextMatch && (
        <section className="bg-navy-dark px-6 py-12 sm:px-10 lg:px-16">
          <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.3em] text-cyan sm:text-left">
            Next Match
          </p>
          <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
            {/* Crests+VS stay a compact single row at every width; the clock
                sits full-width beneath rather than squeezed inline between
                them, which used to overflow past the viewport on mobile
                once the clock display grew wide enough to need its own room. */}
            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center justify-center gap-5 sm:gap-8">
                <div className="flex flex-col items-center gap-3">
                  <Image
                    src="/brand/crest-mark.png"
                    alt="Eko United FC"
                    width={64}
                    height={64}
                    className="h-12 w-12 sm:h-16 sm:w-16"
                  />
                  <span className="text-xs font-semibold uppercase tracking-wide text-white/60">
                    Eko United
                  </span>
                </div>
                <p className="font-display text-xl text-white/40 sm:text-2xl">VS</p>
                <div className="flex flex-col items-center gap-3">
                  {nextMatch.opponentLogoUrl && isAllowedImageUrl(nextMatch.opponentLogoUrl) ? (
                    <div className="relative h-12 w-12 overflow-hidden rounded-full border border-white/20 bg-white sm:h-16 sm:w-16">
                      <Image
                        src={nextMatch.opponentLogoUrl}
                        alt={nextMatch.opponent}
                        fill
                        sizes="64px"
                        className="object-contain p-1.5"
                      />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 sm:h-16 sm:w-16">
                      <span className="font-display text-2xl text-white/70">
                        {nextMatch.opponent.charAt(0)}
                      </span>
                    </div>
                  )}
                  <span className="max-w-[92px] text-center text-xs font-semibold uppercase tracking-wide text-white/60 sm:max-w-none">
                    {nextMatch.opponent}
                  </span>
                </div>
              </div>
              <MatchdayCountdown kickoffIso={nextMatch.kickoff} />
            </div>

            <div className="text-center lg:text-right">
              <p className="text-sm text-white/60">
                {nextMatch.competition || "Friendly"} · {formatMatchDate(nextMatch.kickoff)}
              </p>
              {nextMatch.venue && <p className="text-sm text-white/40">{nextMatch.venue}</p>}
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
      )}

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

        {/* Last 5 results: hidden entirely once there's nothing finished
            yet (ResultsPreview returns null), rather than showing an empty
            section. Full width below the fixtures/table grid above. */}
        <div className="mt-14 min-w-0">
          <Suspense fallback={<SectionFallback className="h-72" />}>
            <ResultsPreview />
          </Suspense>
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
