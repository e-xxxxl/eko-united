import type { Metadata } from "next";
import { apiFetch } from "@/lib/api";
import type { DemoMatch } from "@/lib/demoData";
import MatchCard from "@/components/MatchCard";
import PageBanner, { BannerStat } from "@/components/PageBanner";
import { groupByMonth } from "@/lib/matchGroups";
import { sectionMeta } from "@/lib/seo";

export const metadata: Metadata = sectionMeta("fixtures");

async function getFixtures(): Promise<DemoMatch[]> {
  return (await apiFetch<DemoMatch[]>("/matches?status=upcoming", 600)) || [];
}

export default async function FixturesPage() {
  const fixtures = await getFixtures();

  const jsonLd = fixtures.map((match) => ({
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: `Eko United FC vs ${match.opponent}`,
    startDate: match.kickoff,
    location: match.venue ? { "@type": "Place", name: match.venue } : undefined,
    competitor: [{ "@type": "SportsTeam", name: "Eko United FC" }, { "@type": "SportsTeam", name: match.opponent }],
  }));

  return (
    <main className="px-6 py-16 sm:px-10 lg:px-16">
      {jsonLd.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <PageBanner
        eyebrow="Nigeria National League · Group A"
        title="Fixtures"
        ghost="Fixtures"
        intro="Every home and away date for the Uga Boys this season. Tap a match for the preview, line-up and tickets."
      >
        <BannerStat label="Upcoming" value={fixtures.length} />
        <BannerStat label="Home" value={fixtures.filter((m) => m.isHome).length} />
        <BannerStat label="Away" value={fixtures.filter((m) => !m.isHome).length} />
      </PageBanner>

      {fixtures.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-navy/15 px-6 py-16 text-center text-navy/50">No upcoming fixtures scheduled yet. Check back soon.</p>
      ) : (
        <div className="space-y-12">
          {groupByMonth(fixtures).map((g) => (
            <section key={g.label}>
              <h2 className="mb-5 flex items-center gap-4 font-display text-3xl uppercase text-navy">
                {g.label}
                <span className="h-px flex-1 bg-navy/10" />
                <span className="text-sm tracking-widest text-navy/40">{g.items.length}</span>
              </h2>
              <div data-reveal-stagger className="space-y-3">
                {g.items.map((match) => (
                  <MatchCard key={match._id} match={match} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
