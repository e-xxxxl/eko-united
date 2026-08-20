import Link from "next/link";
import { apiFetch } from "@/lib/api";
import MatchCard from "@/components/MatchCard";

type Match = {
  _id: string;
  opponent: string;
  competition?: string;
  venue?: string;
  kickoff: string;
  isHome: boolean;
  status: "upcoming" | "live" | "finished" | "postponed";
};

const demoFixtures: Match[] = [
  { _id: "f1", opponent: "Remo Stars FC", competition: "NNL — Matchday 12", venue: "Agege Stadium, Lagos", kickoff: "2026-08-30T15:00:00.000Z", isHome: true, status: "upcoming" },
  { _id: "f2", opponent: "Sporting Lagos", competition: "NNL — Matchday 13", venue: "Teslim Balogun Stadium", kickoff: "2026-09-06T15:00:00.000Z", isHome: false, status: "upcoming" },
  { _id: "f3", opponent: "Rivers United", competition: "NNL — Matchday 14", venue: "Agege Stadium, Lagos", kickoff: "2026-09-13T15:00:00.000Z", isHome: true, status: "upcoming" },
];

async function getFixtures(): Promise<Match[]> {
  const live = await apiFetch<Match[]>("/matches?status=upcoming", 600);
  return live && live.length > 0 ? live.slice(0, 3) : demoFixtures;
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
      <div className="border-t border-navy/10">
        {fixtures.map((match) => (
          <MatchCard key={match._id} match={match} />
        ))}
      </div>
    </div>
  );
}
