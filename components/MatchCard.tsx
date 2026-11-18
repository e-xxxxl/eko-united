import Image from "next/image";
import Link from "next/link";
import { clsx } from "clsx";
import { isAllowedImageUrl } from "@/lib/imageHosts";
import { parseCompetition } from "@/lib/lineup";

type Match = {
  _id: string;
  opponent: string;
  opponentLogoUrl?: string;
  competition?: string;
  venue?: string;
  kickoff: string;
  isHome: boolean;
  status: "upcoming" | "live" | "finished" | "postponed";
  score?: { eko: number | null; opponent: number | null };
};

// Pinned to Lagos time explicitly: without an explicit `timeZone`,
// toLocaleDateString/toLocaleTimeString use the runtime's local timezone,
// which differs between the server (wherever it's hosted) and each visitor's
// browser, producing different text and a hydration mismatch. Pinning also
// happens to be the more correct behavior for a Nigerian club site: match
// times should read in Lagos local time for everyone, not the viewer's own.
function parts(iso: string) {
  const date = new Date(iso);
  const f = (opts: Intl.DateTimeFormatOptions) => date.toLocaleDateString("en-GB", { timeZone: "Africa/Lagos", ...opts });
  return {
    day: f({ day: "numeric" }),
    month: f({ month: "short" }),
    weekday: f({ weekday: "short" }),
    time: date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" }),
  };
}

// Eko United is picked out in bold cyan wherever it appears in a fixture
// list, so our side is spotted at a glance (home or away).
export function TeamName({ name }: { name: string }) {
  if (name !== "Eko United") return <span>{name}</span>;
  // No panel behind it: just a different, bolder colour than the opponent.
  return <span className="font-bold text-cyan-dark">{name}</span>;
}

function Crest({ src, name }: { src?: string; name: string }) {
  return (
    <span className="relative flex h-7 w-7 shrink-0 items-center justify-center">
      {src && isAllowedImageUrl(src) ? (
        <Image src={src} alt="" width={28} height={28} className="h-full w-full object-contain" />
      ) : (
        <span className="flex h-full w-full items-center justify-center rounded-full bg-navy/10 font-display text-xs text-navy/55">{name.charAt(0)}</span>
      )}
    </span>
  );
}

// A match as a card: a date block, both crests and names, the league and matchday,
// and on the right the score with a W, D or L, or the kickoff time. Used by
// /fixtures, /results and the homepage lists. Result and postponed badges flag a
// real per-match fact, not page decoration.
export default function MatchCard({ match }: { match: Match }) {
  const d = parts(match.kickoff);
  const { league, matchday } = parseCompetition(match.competition);
  const home = match.isHome ? "Eko United" : match.opponent;
  const away = match.isHome ? match.opponent : "Eko United";
  const homeLogo = match.isHome ? "/brand/crest-mark.png" : match.opponentLogoUrl;
  const awayLogo = match.isHome ? match.opponentLogoUrl : "/brand/crest-mark.png";
  const scored = match.status === "finished" && match.score && match.score.eko !== null && match.score.opponent !== null;

  let badge: { label: string; className: string } | null = null;
  if (scored) {
    const { eko, opponent } = match.score as { eko: number; opponent: number };
    badge =
      eko > opponent
        ? { label: "W", className: "bg-cyan text-navy-dark" }
        : eko < opponent
          ? { label: "L", className: "bg-red-500 text-white" }
          : { label: "D", className: "bg-navy/20 text-navy" };
  }

  return (
    <Link
      href={`/fixtures/${match._id}`}
      className="group flex items-center gap-4 rounded-2xl border border-navy/10 bg-white p-3 transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:border-cyan hover:shadow-[0_14px_30px_-18px_rgba(10,36,77,0.45)] sm:gap-5 sm:p-4"
    >
      <span className="flex w-14 shrink-0 flex-col items-center rounded-xl bg-navy-dark py-2 text-white sm:w-16">
        <span className="font-display text-3xl leading-none sm:text-4xl">{d.day}</span>
        <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan">{d.month}</span>
        <span className="text-[10px] uppercase tracking-wide text-white/50">{d.weekday}</span>
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 text-[10px] font-bold uppercase tracking-[0.16em]">
          <span className="text-cyan-dark">{league}</span>
          {matchday !== null && <span className="text-navy/45">Matchday {matchday}</span>}
          <span className="rounded bg-navy/[0.07] px-1.5 py-0.5 text-navy/50">{match.isHome ? "Home" : "Away"}</span>
        </span>
        <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-display text-lg leading-tight text-navy sm:text-2xl">
          <span className="flex items-center gap-2">
            <Crest src={homeLogo} name={home} />
            <TeamName name={home} />
          </span>
          <span className="text-sm text-navy/30">vs</span>
          <span className="flex items-center gap-2">
            <Crest src={awayLogo} name={away} />
            <TeamName name={away} />
          </span>
        </span>
        {match.venue && <span className="mt-1 block truncate text-xs text-navy/45">{match.venue}</span>}
      </span>

      <span className="flex shrink-0 items-center gap-2.5">
        {match.status === "postponed" ? (
          <span className="rounded-md bg-yellow px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-navy-dark">Postponed</span>
        ) : scored ? (
          <>
            <span className="font-display text-3xl leading-none text-navy sm:text-4xl">
              {match.isHome ? match.score!.eko : match.score!.opponent}
              <span className="mx-1 text-navy/25">-</span>
              {match.isHome ? match.score!.opponent : match.score!.eko}
            </span>
            {badge && (
              <span className={clsx("flex h-7 w-7 items-center justify-center rounded-md font-display text-lg leading-none", badge.className)}>{badge.label}</span>
            )}
          </>
        ) : (
          <span className="text-right">
            <span className="block font-display text-2xl leading-none text-navy sm:text-3xl">{d.time}</span>
            <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-navy/40">Kickoff</span>
          </span>
        )}
        <span aria-hidden className="hidden text-navy/25 transition-transform duration-300 ease-smooth group-hover:translate-x-1 group-hover:text-cyan sm:block">
          →
        </span>
      </span>
    </Link>
  );
}
