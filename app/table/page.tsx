import type { Metadata } from "next";
import { apiFetch } from "@/lib/api";
import type { DemoStanding } from "@/lib/demoData";
import LeagueTable from "@/components/LeagueTable";

export const metadata: Metadata = {
  title: "League Table",
  description: "Nigeria National League standings.",
};

async function getStandings(): Promise<DemoStanding[]> {
  return (await apiFetch<DemoStanding[]>("/standings", 3600)) || [];
}

function ordinal(n: number) {
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return "th";
  switch (n % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-white/[0.07] px-2 py-2.5 text-center ring-1 ring-white/10 sm:min-w-[5.5rem] sm:px-4">
      <p className="font-display text-2xl leading-none text-white sm:text-3xl">{value}</p>
      <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">{label}</p>
    </div>
  );
}

// Where Eko United stand right now, big and first, before the full table.
function EkoSpotlight({ row, total }: { row: DemoStanding; total: number }) {
  const gd = row.goalDifference > 0 ? `+${row.goalDifference}` : String(row.goalDifference);
  return (
    <section
      data-reveal
      className="relative mb-8 overflow-hidden rounded-2xl bg-navy-dark px-5 py-6 text-white sm:px-8 sm:py-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_120%_at_0%_0%,rgba(101,203,233,0.2),transparent_65%),repeating-linear-gradient(115deg,transparent_0_46px,rgba(255,255,255,0.025)_46px_47px)]"
      />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Eko United FC</p>
          <p className="mt-3 flex items-end gap-2 font-display leading-none">
            <span className="text-7xl sm:text-8xl">{row.position}</span>
            <span className="pb-1.5 text-3xl text-cyan sm:text-4xl">{ordinal(row.position)}</span>
            <span className="pb-2 text-base tracking-wide text-white/50 sm:text-lg">of {total}</span>
          </p>
        </div>
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          <Stat label="Pts" value={row.points} />
          <Stat label="Played" value={row.played} />
          <Stat label="GD" value={gd} />
          <Stat label="W-D-L" value={`${row.won}-${row.drawn}-${row.lost}`} />
        </div>
      </div>
    </section>
  );
}

export default async function TablePage() {
  const standings = await getStandings();
  const eko = standings.find((row) => row.isEkoUnited);

  return (
    <main className="px-6 py-16 sm:px-10 lg:px-16">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-cyan">
        Nigeria National League
      </p>
      <h1 className="display-title font-display mb-10">League Table</h1>

      {standings.length === 0 ? (
        <p className="text-navy/50">Standings will appear here once the season begins.</p>
      ) : (
        <>
          {eko && <EkoSpotlight row={eko} total={standings.length} />}
          <LeagueTable rows={standings} />
          <p data-reveal="fade" className="mt-5 text-xs leading-relaxed text-navy/45">
            P played · W won · D drawn · L lost · GF goals for · GA goals against · GD goal difference · Pts points
          </p>
        </>
      )}
    </main>
  );
}
