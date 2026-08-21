import type { Metadata } from "next";
import { apiFetch } from "@/lib/api";
import { demoFixtures, type DemoMatch } from "@/lib/demoData";
import MatchCard from "@/components/MatchCard";

export const metadata: Metadata = {
  title: "Fixtures",
  description: "Upcoming Eko United FC fixtures — Nigeria National League.",
};

async function getFixtures(): Promise<DemoMatch[]> {
  const live = await apiFetch<DemoMatch[]>("/matches?status=upcoming", 600);
  return live && live.length > 0 ? live : demoFixtures;
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

      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-cyan">
        Nigeria National League
      </p>
      <h1 className="display-title font-display mb-10">Fixtures</h1>

      {fixtures.length === 0 ? (
        <p className="text-navy/50">No upcoming fixtures scheduled yet — check back soon.</p>
      ) : (
        <div className="border-t border-navy/10">
          {fixtures.map((match) => (
            <MatchCard key={match._id} match={match} />
          ))}
        </div>
      )}
    </main>
  );
}
