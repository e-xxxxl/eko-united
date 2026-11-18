import type { Metadata } from "next";
import { apiFetch } from "@/lib/api";
import type { DemoMatch } from "@/lib/demoData";
import MatchCard from "@/components/MatchCard";
import PageBanner, { BannerStat } from "@/components/PageBanner";
import { groupByMonth } from "@/lib/matchGroups";
import { sectionMeta } from "@/lib/seo";

export const metadata: Metadata = sectionMeta("results");

async function getResults(): Promise<DemoMatch[]> {
  return (await apiFetch<DemoMatch[]>("/matches?status=finished", 600)) || [];
}

export default async function ResultsPage() {
  const results = await getResults();
  let w = 0, d = 0, l = 0;
  for (const m of results) {
    const e = m.score?.eko, o = m.score?.opponent;
    if (e == null || o == null) continue;
    if (e > o) w++;
    else if (e < o) l++;
    else d++;
  }

  return (
    <main className="px-6 py-16 sm:px-10 lg:px-16">
      <PageBanner
        eyebrow="Nigeria National League · Group A"
        title="Results"
        ghost="Results"
        intro="Full time scores from every match this season, newest first."
      >
        <BannerStat label="Played" value={results.length} />
        <BannerStat label="Won" value={w} />
        <BannerStat label="Drawn" value={d} />
        <BannerStat label="Lost" value={l} />
      </PageBanner>

      {results.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-navy/15 px-6 py-16 text-center text-navy/50">No results yet this season. Check back after matchday one.</p>
      ) : (
        <div className="space-y-12">
          {groupByMonth(results).map((g) => (
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
