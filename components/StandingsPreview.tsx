import Link from "next/link";
import { apiFetch } from "@/lib/api";
import type { DemoStanding } from "@/lib/demoData";
import LeagueTable from "@/components/LeagueTable";

// Preview shows a slice CENTERED on Eko United's actual position: roughly
// 2 clubs above and 2 below (5 rows total), rather than a flat top-N cutoff
// that could omit Eko United entirely if they're mid-table or lower. Falls
// back to the top of the table only if Eko United isn't in the list yet
// (e.g. standings not populated for this season).
function sliceAroundEkoUnited(standings: DemoStanding[]): DemoStanding[] {
  const idx = standings.findIndex((row) => row.isEkoUnited);
  if (idx === -1) return standings.slice(0, 5);

  const windowSize = 5;
  const above = 2;
  let start = idx - above;
  let end = start + windowSize;

  if (start < 0) {
    start = 0;
    end = Math.min(windowSize, standings.length);
  }
  if (end > standings.length) {
    end = standings.length;
    start = Math.max(0, end - windowSize);
  }

  return standings.slice(start, end);
}

async function getStandings(): Promise<{ rows: DemoStanding[]; maxPoints: number }> {
  const live = (await apiFetch<DemoStanding[]>("/standings", 3600)) || [];
  return {
    rows: sliceAroundEkoUnited(live),
    maxPoints: Math.max(0, ...live.map((row) => row.points)),
  };
}

export default async function StandingsPreview() {
  const { rows, maxPoints } = await getStandings();

  return (
    <div>
      <div data-reveal className="mb-3 flex items-baseline justify-between gap-x-4">
        <h2 className="font-display text-2xl text-navy">League Table</h2>
        <Link
          href="/table"
          className="shrink-0 whitespace-nowrap text-sm font-semibold text-cyan transition-colors duration-200 ease-smooth hover:text-navy"
        >
          Full table →
        </Link>
      </div>
      {rows.length === 0 ? (
        <p className="border-t border-navy/10 py-6 text-navy/50">
          Standings will appear here once the season begins.
        </p>
      ) : (
        <LeagueTable rows={rows} maxPoints={maxPoints} variant="preview" />
      )}
    </div>
  );
}
