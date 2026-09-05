import type { Metadata } from "next";
import Image from "next/image";
import { clsx } from "clsx";
import { apiFetch } from "@/lib/api";
import type { DemoStanding } from "@/lib/demoData";

export const metadata: Metadata = {
  title: "League Table",
  description: "Nigeria National League standings.",
};

async function getStandings(): Promise<DemoStanding[]> {
  return (await apiFetch<DemoStanding[]>("/standings", 3600)) || [];
}

export default async function TablePage() {
  const standings = await getStandings();

  return (
    <main className="px-6 py-16 sm:px-10 lg:px-16">
      <h1 className="display-title font-display mb-10">League Table</h1>

      {standings.length === 0 ? (
        <p className="text-navy/50">Standings will appear here once the season begins.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-navy/10 text-left text-navy/40">
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Club</th>
                <th className="px-4 py-3 text-center font-medium">P</th>
                <th className="px-4 py-3 text-center font-medium">W</th>
                <th className="px-4 py-3 text-center font-medium">D</th>
                <th className="px-4 py-3 text-center font-medium">L</th>
                <th className="px-4 py-3 text-center font-medium">GD</th>
                <th className="px-4 py-3 text-center font-medium text-navy">Pts</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((row) => (
                <tr
                  key={row._id}
                  className={clsx(
                    "border-b border-navy/5 transition-colors duration-200 ease-smooth",
                    row.isEkoUnited ? "bg-yellow/10" : "hover:bg-navy/[0.03]"
                  )}
                >
                  <td className="px-4 py-3 text-navy/60">{row.position}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {row.clubLogoUrl ? (
                        <Image
                          src={row.clubLogoUrl}
                          alt={`${row.clubName} logo`}
                          width={24}
                          height={24}
                          className="h-6 w-6 rounded-full object-contain"
                        />
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-navy/10" aria-hidden />
                      )}
                      <span className={row.isEkoUnited ? "font-semibold text-navy" : "text-navy/80"}>
                        {row.clubName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-navy/60">{row.played}</td>
                  <td className="px-4 py-3 text-center text-navy/60">{row.won}</td>
                  <td className="px-4 py-3 text-center text-navy/60">{row.drawn}</td>
                  <td className="px-4 py-3 text-center text-navy/60">{row.lost}</td>
                  <td className="px-4 py-3 text-center text-navy/60">{row.goalDifference}</td>
                  <td className="px-4 py-3 text-center font-bold text-navy">{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
