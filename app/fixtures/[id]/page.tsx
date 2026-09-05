import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { DemoMatch } from "@/lib/demoData";

type MatchEvent = { minute?: number; type?: string; player?: string; detail?: string };
type MatchDetail = DemoMatch & {
  summary?: string;
  events?: MatchEvent[];
  lineup?: { _id: string; name: string; slug: string }[];
};

async function getMatch(id: string): Promise<MatchDetail | null> {
  return await apiFetch<MatchDetail>(`/matches/${id}`, 300);
}

function formatKickoff(iso: string) {
  const date = new Date(iso);
  return {
    date: date.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Africa/Lagos",
    }),
    time: date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Africa/Lagos",
    }),
  };
}

const eventLabels: Record<string, string> = {
  goal: "⚽ Goal",
  yellow_card: "🟨 Yellow card",
  red_card: "🟥 Red card",
  substitution: "🔄 Substitution",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const match = await getMatch(id);
  if (!match) return { title: "Match Not Found" };

  const home = match.isHome ? "Eko United" : match.opponent;
  const away = match.isHome ? match.opponent : "Eko United";
  const title = `${home} vs ${away}`;
  const description = `${match.competition || "Eko United FC"} — ${match.venue || "Agege Stadium, Lagos"}.`;
  const url = `https://ekounitedfc.com/fixtures/${id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", siteName: "Eko United FC", title, description, url },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const match = await getMatch(id);
  if (!match) notFound();

  const { date, time } = formatKickoff(match.kickoff);
  const home = match.isHome ? "Eko United" : match.opponent;
  const away = match.isHome ? match.opponent : "Eko United";
  const isFinished = match.status === "finished";
  const hasScore = isFinished && match.score && match.score.eko !== null && match.score.opponent !== null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: `${home} vs ${away}`,
    startDate: match.kickoff,
    location: { "@type": "Place", name: match.venue || "Agege Stadium, Lagos" },
    homeTeam: { "@type": "SportsTeam", name: home },
    awayTeam: { "@type": "SportsTeam", name: away },
  };

  return (
    <main className="mx-auto max-w-2xl px-6 py-16 sm:px-10 lg:px-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-cyan">
        {match.competition || "Friendly"} · {match.venue || "Agege Stadium, Lagos"}
      </p>
      <h1 className="display-title font-display mt-3">
        {home} <span className="text-navy/30">vs</span> {away}
      </h1>

      {match.status === "postponed" ? (
        <p className="mt-4 text-base font-semibold text-yellow">Postponed</p>
      ) : hasScore ? (
        <div className="mt-6 flex items-center gap-4">
          <span className="font-display text-5xl text-navy">
            {match.isHome ? match.score!.eko : match.score!.opponent}
            <span className="mx-3 text-navy/30">–</span>
            {match.isHome ? match.score!.opponent : match.score!.eko}
          </span>
        </div>
      ) : (
        <p className="mt-4 text-base text-navy/60">
          {date} · Kickoff {time}
        </p>
      )}

      {match.summary && (
        <p className="mt-8 max-w-xl text-base leading-relaxed text-navy/70">{match.summary}</p>
      )}

      {match.events && match.events.length > 0 && (
        <div className="mt-10 border-t border-navy/10 pt-6">
          <p className="mb-4 font-display text-lg text-navy">Match Events</p>
          <ul className="space-y-2">
            {match.events.map((event, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-navy/70">
                {typeof event.minute === "number" && (
                  <span className="w-10 shrink-0 font-semibold text-navy">{event.minute}&apos;</span>
                )}
                <span>{event.type ? eventLabels[event.type] || event.type : ""}</span>
                {event.player && <span className="text-navy/50">— {event.player}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!isFinished && match.status !== "postponed" && (
        <Link
          href={`/tickets/${id}`}
          className="mt-10 inline-block rounded-full bg-yellow px-8 py-3 text-sm font-bold uppercase tracking-wide text-navy-dark transition-transform duration-300 ease-smooth hover:scale-105"
        >
          Buy tickets
        </Link>
      )}
    </main>
  );
}
