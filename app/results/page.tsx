import type { Metadata } from "next";
import { apiFetch } from "@/lib/api";
import { demoResults, type DemoMatch } from "@/lib/demoData";
import MatchCard from "@/components/MatchCard";

export const metadata: Metadata = {
  title: "Results",
  description: "Recent Eko United FC match results — Nigeria National League.",
};

async function getResults(): Promise<DemoMatch[]> {
  const live = await apiFetch<DemoMatch[]>("/matches?status=finished", 600);
  return live && live.length > 0 ? live : demoResults;
}

export default async function ResultsPage() {
  const results = await getResults();

  return (
    <main className="px-6 py-16 sm:px-10 lg:px-16">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-cyan">
        Nigeria National League
      </p>
      <h1 className="display-title font-display mb-10">Results</h1>

      {results.length === 0 ? (
        <p className="text-navy/50">No results yet this season — check back after matchday one.</p>
      ) : (
        <div className="border-t border-navy/10">
          {results.map((match) => (
            <MatchCard key={match._id} match={match} />
          ))}
        </div>
      )}
    </main>
  );
}
