import Link from "next/link";
import Image from "next/image";
import { clsx } from "clsx";
import { apiFetch } from "@/lib/api";
import type { DemoStanding } from "@/lib/demoData";

async function getStandings(): Promise<DemoStanding[]> {
  const live = await apiFetch<DemoStanding[]>("/standings", 3600);
  // Preview shows the top of the table only — the full list lives on /table.
  return (live || []).slice(0, 6);
}

export default async function StandingsPreview() {
  const standings = await getStandings();

  return (
    <div>
      <div className="mb-6 flex items-baseline justify-between">
        <h2 className="font-display text-2xl text-navy">League Table</h2>
        <Link
          href="/table"
          className="text-sm font-semibold text-cyan transition-colors duration-200 ease-smooth hover:text-navy"
        >
          Full table →
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-navy/10 text-left text-navy/40">
              <th className="py-2.5 pr-3 font-medium">#</th>
              <th className="py-2.5 pr-3 font-medium">Club</th>
              <th className="py-2.5 pr-3 text-center font-medium">P</th>
              <th className="py-2.5 pr-3 text-center font-medium">W</th>
              <th className="py-2.5 pr-3 text-center font-medium">D</th>
              <th className="py-2.5 pr-3 text-center font-medium">L</th>
              <th className="py-2.5 text-center font-medium text-navy">Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row) => (
              <tr
                key={row._id}
                className={clsx(
                  "border-b border-navy/5",
                  row.isEkoUnited && "bg-yellow/10"
                )}
              >
                <td className="py-2.5 pr-3 text-navy/60">{row.position}</td>
                <td className="py-2.5 pr-3">
                  <div className="flex items-center gap-2.5">
                    {row.clubLogoUrl ? (
                      <Image
                        src={row.clubLogoUrl}
                        alt=""
                        width={20}
                        height={20}
                        className="h-5 w-5 rounded-full object-contain"
                      />
                    ) : (
                      <div className="h-5 w-5 rounded-full bg-navy/10" aria-hidden />
                    )}
                    <span className={row.isEkoUnited ? "font-semibold text-navy" : "text-navy/80"}>
                      {row.clubName}
                    </span>
                  </div>
                </td>
                <td className="py-2.5 pr-3 text-center text-navy/60">{row.played}</td>
                <td className="py-2.5 pr-3 text-center text-navy/60">{row.won}</td>
                <td className="py-2.5 pr-3 text-center text-navy/60">{row.drawn}</td>
                <td className="py-2.5 pr-3 text-center text-navy/60">{row.lost}</td>
                <td className="py-2.5 text-center font-bold text-navy">{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
