import Link from "next/link";
import Image from "next/image";
import { clsx } from "clsx";
import { apiFetch } from "@/lib/api";

type Standing = {
  _id: string;
  clubName: string;
  clubLogoUrl?: string;
  isEkoUnited: boolean;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalDifference: number;
  points: number;
  position: number;
};

const demoStandings: Standing[] = [
  { _id: "d1", clubName: "Sporting Lagos", isEkoUnited: false, played: 10, won: 7, drawn: 2, lost: 1, goalDifference: 14, points: 23, position: 1 },
  { _id: "d2", clubName: "Remo Stars FC", isEkoUnited: false, played: 10, won: 6, drawn: 3, lost: 1, goalDifference: 11, points: 21, position: 2 },
  { _id: "d3", clubName: "Eko United FC", isEkoUnited: true, played: 10, won: 6, drawn: 2, lost: 2, goalDifference: 9, points: 20, position: 3 },
  { _id: "d4", clubName: "Rivers United", isEkoUnited: false, played: 10, won: 5, drawn: 3, lost: 2, goalDifference: 6, points: 18, position: 4 },
  { _id: "d5", clubName: "Bendel Insurance", isEkoUnited: false, played: 10, won: 4, drawn: 3, lost: 3, goalDifference: 2, points: 15, position: 5 },
];

async function getStandings(): Promise<Standing[]> {
  const live = await apiFetch<Standing[]>("/standings", 3600);
  return live && live.length > 0 ? live : demoStandings;
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
