import { Suspense } from "react";
import HeroCarousel, { type HeroSlide } from "@/components/HeroCarousel";
import NextMatchBand, { type NextMatch } from "@/components/NextMatchBand";
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
import { formatEventDate, type ClubEvent } from "@/lib/eventTypes";

// Events the club switched on for the hero come first, then the latest news.
async function getHeroSlides(): Promise<HeroSlide[]> {
  const [news, events] = await Promise.all([
    apiFetch<HeroSlide[]>("/news?limit=5", 600),
    apiFetch<ClubEvent[]>("/events/hero", 600),
  ]);
  const eventSlides: HeroSlide[] = (Array.isArray(events) ? events : []).map((e) => ({
    _id: `event-${e._id}`,
    slug: e.slug,
    title: e.name,
    category: e.isCsr ? "csr" : "event",
    publishedAt: e.eventDate || "",
    coverImageUrl: e.imageUrl,
    heroImageUrl: e.imageUrl,
    href: `/events/${e.slug}`,
    subline: [formatEventDate(e.eventDate), e.location, "See the details →"].filter(Boolean).join(" · "),
  }));
  const newsSlides = Array.isArray(news) ? news : [];
  return [...eventSlides, ...newsSlides].slice(0, 6);
}

async function getNextMatch(): Promise<NextMatch | null> {
  return await apiFetch<NextMatch>("/matches/next", 300);
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
        data-reveal-skip
        className="relative flex min-h-[min(172vw,90svh)] flex-col justify-end overflow-hidden sm:min-h-[max(92vh,56.25vw)]"
        style={{ marginTop: "calc(-1 * var(--header-height, 100px))" }}
      >
        <HeroCarousel slides={heroSlides} />
      </section>

      {/* NEXT MATCH: the real next upcoming fixture (GET /api/matches/next,
          soonest kickoff first), not a hardcoded placeholder. Hides entirely
          if there's no upcoming match scheduled yet, rather than showing a
          fake opponent. */}
      {nextMatch && <NextMatchBand match={nextMatch} />}

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
