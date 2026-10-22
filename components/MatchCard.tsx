import Link from "next/link";

type Match = {
  _id: string;
  opponent: string;
  competition?: string;
  venue?: string;
  kickoff: string;
  isHome: boolean;
  status: "upcoming" | "live" | "finished" | "postponed";
  score?: { eko: number | null; opponent: number | null };
};

// Pinned to Lagos time explicitly — without an explicit `timeZone`,
// toLocaleDateString/toLocaleTimeString use the runtime's local timezone,
// which differs between the server (wherever it's hosted) and each visitor's
// browser, producing different text and a hydration mismatch. Pinning also
// happens to be the more correct behavior for a Nigerian club site: match
// times should read in Lagos local time for everyone, not the viewer's own.
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

// Eko United is picked out in a solid navy tag wherever it appears in a
// fixture list, so our side is spotted at a glance (home or away).
export function TeamName({ name }: { name: string }) {
  if (name !== "Eko United") return <span>{name}</span>;
  return (
    <span className="rounded-md bg-navy px-2.5 py-0.5 leading-snug text-white shadow-[0_4px_12px_-4px_rgba(10,36,77,0.5)]">
      {name}
    </span>
  );
}

// A hairline-divided list row, not a bordered card — used stacked in a single
// column by /fixtures and /results. Result/postponed badges are a documented
// exception to "one yellow per page": each flags a real per-match fact, not
// page decoration, and fixtures/results never show both states at once.
export default function MatchCard({ match }: { match: Match }) {
  const { date, time } = formatKickoff(match.kickoff);
  const home = match.isHome ? "Eko United" : match.opponent;
  const away = match.isHome ? match.opponent : "Eko United";
  const isResult = match.status === "finished";

  let resultLabel: string | null = null;
  let resultTone = "text-navy/50";
  if (isResult && match.score && match.score.eko !== null && match.score.opponent !== null) {
    if (match.score.eko > match.score.opponent) {
      resultLabel = "W";
      resultTone = "text-yellow";
    } else if (match.score.eko < match.score.opponent) {
      resultLabel = "L";
      resultTone = "text-navy/30";
    } else {
      resultLabel = "D";
      resultTone = "text-cyan";
    }
  }

  return (
    <Link
      href={`/fixtures/${match._id}`}
      className="group flex flex-col gap-3 border-b border-navy/10 py-5 transition-colors duration-200 ease-smooth hover:bg-navy/[0.02] sm:flex-row sm:items-center sm:gap-6">
      <div className="sm:w-44 sm:shrink-0">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-navy/40">
          {match.competition || "Friendly"}
        </p>
        {match.venue && <p className="mt-1 text-xs text-navy/40">{match.venue}</p>}
      </div>

      <p className="font-display flex flex-1 flex-wrap items-center gap-x-2 gap-y-1 text-lg sm:text-xl">
        <TeamName name={home} />
        <span className="text-navy/30">vs</span>
        <TeamName name={away} />
      </p>

      <div className="flex items-center gap-3 sm:w-36 sm:justify-end">
        {match.status === "postponed" ? (
          <span className="text-xs font-semibold uppercase tracking-wide text-yellow">
            Postponed
          </span>
        ) : isResult && match.score && match.score.eko !== null && match.score.opponent !== null ? (
          <>
            <span className="font-display text-2xl">
              {match.isHome ? match.score.eko : match.score.opponent}
              <span className="mx-1.5 text-navy/30">–</span>
              {match.isHome ? match.score.opponent : match.score.eko}
            </span>
            {resultLabel && (
              <span className={`font-display text-lg ${resultTone}`}>{resultLabel}</span>
            )}
          </>
        ) : (
          <span className="text-sm text-navy/60">
            {date} · {time}
          </span>
        )}
      </div>
    </Link>
  );
}
