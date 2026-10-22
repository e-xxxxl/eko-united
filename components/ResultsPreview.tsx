import Link from "next/link";
import { apiFetch } from "@/lib/api";
import type { DemoMatch } from "@/lib/demoData";
import MatchCard from "@/components/MatchCard";

// Backend already sorts status=finished by kickoff DESC (most recent first),
// so slicing the first 5 gives the last 5 results with no extra client sort.
async function getResults(): Promise<DemoMatch[]> {
  return ((await apiFetch<DemoMatch[]>("/matches?status=finished", 600)) || []).slice(0, 5);
}

export default async function ResultsPreview() {
  const results = await getResults();

  if (results.length === 0) return null;

  return (
    <div>
      <div data-reveal className="mb-2 flex items-baseline justify-between gap-x-4">
        <h2 className="font-display text-2xl text-navy">Latest Results</h2>
        <Link
          href="/results"
          className="shrink-0 whitespace-nowrap text-sm font-semibold text-cyan transition-colors duration-200 ease-smooth hover:text-navy"
        >
          All results →
        </Link>
      </div>
      <div data-reveal-stagger className="border-t border-navy/10">
        {results.map((match) => (
          <MatchCard key={match._id} match={match} />
        ))}
      </div>
    </div>
  );
}
