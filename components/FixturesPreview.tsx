import Link from "next/link";
import { apiFetch } from "@/lib/api";
import type { DemoMatch } from "@/lib/demoData";
import MatchCard from "@/components/MatchCard";

async function getFixtures(): Promise<DemoMatch[]> {
  return ((await apiFetch<DemoMatch[]>("/matches?status=upcoming", 600)) || []).slice(0, 3);
}

export default async function FixturesPreview() {
  const fixtures = await getFixtures();

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="font-display text-2xl text-navy">Upcoming Fixtures</h2>
        <Link
          href="/fixtures"
          className="text-sm font-semibold text-cyan transition-colors duration-200 ease-smooth hover:text-navy"
        >
          All matches →
        </Link>
      </div>
      {fixtures.length === 0 ? (
        <p className="border-t border-navy/10 py-6 text-navy/50">
          No upcoming fixtures scheduled yet — check back soon.
        </p>
      ) : (
        <div className="border-t border-navy/10">
          {fixtures.map((match) => (
            <MatchCard key={match._id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}
