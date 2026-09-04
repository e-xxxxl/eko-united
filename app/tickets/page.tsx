import type { Metadata } from "next";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { demoFixtures, type DemoMatch } from "@/lib/demoData";

export const metadata: Metadata = {
  title: "Tickets",
  description: "Buy tickets for upcoming Eko United FC matches at Agege Stadium, Lagos.",
  alternates: { canonical: "https://ekounitedfc.com/tickets" },
  openGraph: {
    type: "website",
    siteName: "Eko United FC",
    title: "Match Tickets | Eko United FC",
    description: "Buy tickets for upcoming Eko United FC matches at Agege Stadium, Lagos.",
    url: "https://ekounitedfc.com/tickets",
  },
};

function formatKickoff(iso: string) {
  const date = new Date(iso);
  return {
    date: date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      timeZone: "Africa/Lagos",
    }),
    time: date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Africa/Lagos",
    }),
  };
}

async function getUpcomingMatches(): Promise<DemoMatch[]> {
  const live = await apiFetch<DemoMatch[]>("/matches?status=upcoming", 600);
  return live && live.length > 0 ? live : demoFixtures.filter((m) => m.status === "upcoming");
}

export default async function TicketsPage() {
  const matches = await getUpcomingMatches();

  return (
    <main className="px-6 py-16 sm:px-10 lg:px-16">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-cyan">
        Matchday
      </p>
      <h1 className="display-title font-display mb-10">Tickets</h1>

      {matches.length === 0 ? (
        <p className="text-navy/50">No upcoming fixtures on sale right now — check back soon.</p>
      ) : (
        <div className="border-t border-navy/10">
          {matches.map((match) => {
            const { date, time } = formatKickoff(match.kickoff);
            const home = match.isHome ? "Eko United" : match.opponent;
            const away = match.isHome ? match.opponent : "Eko United";
            return (
              <div
                key={match._id}
                className="flex flex-col gap-4 border-b border-navy/10 py-6 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-navy/40">
                    {match.competition || "Friendly"} · {match.venue || "Agege Stadium, Lagos"}
                  </p>
                  <p className="font-display mt-1 text-xl sm:text-2xl">
                    {home} <span className="text-navy/30">vs</span> {away}
                  </p>
                  <p className="mt-1 text-sm text-navy/60">
                    {date} · {time}
                  </p>
                </div>
                <Link
                  href={`/tickets/${match._id}`}
                  className="inline-block rounded-full bg-yellow px-8 py-3 text-center text-sm font-bold uppercase tracking-wide text-navy-dark transition-transform duration-300 ease-smooth hover:scale-105"
                >
                  Buy tickets
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
