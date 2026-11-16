import Image from "next/image";
import Link from "next/link";
import { clsx } from "clsx";
import MatchdayCountdown from "@/components/MatchdayCountdown";
import { isAllowedImageUrl } from "@/lib/imageHosts";
import { parseCompetition } from "@/lib/lineup";

type Hero = {
  id: string;
  opponent: string;
  opponentLogoUrl?: string;
  competition?: string;
  venue?: string;
  kickoff: string;
  isHome: boolean;
  status: "upcoming" | "live" | "finished" | "postponed";
  score?: { eko: number | null; opponent: number | null };
};

const iconProps = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;
const CalendarIcon = () => (
  <svg {...iconProps}>
    <rect x="3.5" y="5" width="17" height="15" rx="2" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </svg>
);
const ClockIcon = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);
const PinIcon = () => (
  <svg {...iconProps}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
    <circle cx="12" cy="10" r="2.3" />
  </svg>
);

function Crest({ src, name }: { src?: string; name: string }) {
  return (
    <div className="relative h-24 w-24 sm:h-36 sm:w-36 lg:h-44 lg:w-44">
      {src && isAllowedImageUrl(src) ? (
        <Image src={src} alt={`${name} crest`} fill sizes="176px" priority className="object-contain drop-shadow-[0_14px_28px_rgba(0,0,0,0.45)]" />
      ) : (
        <span className="flex h-full w-full items-center justify-center rounded-full border-2 border-white/15 bg-white/5 font-display text-6xl text-white/70 sm:text-7xl">
          {name.charAt(0)}
        </span>
      )}
    </div>
  );
}

function Team({ name, logo, side, coach }: { name: string; logo?: string; side: "Home" | "Away"; coach?: string }) {
  return (
    <div className="flex min-w-0 flex-col items-center text-center">
      <Crest src={logo} name={name} />
      <p className="mt-4 max-w-full font-display text-2xl uppercase leading-[0.95] tracking-wide text-white sm:text-4xl lg:text-5xl">{name}</p>
      <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.25em] text-cyan">{side}</p>
      {coach && <p className="mt-1 text-xs text-white/55">Head coach: {coach}</p>}
    </div>
  );
}

const statusLabel = { upcoming: "Upcoming", live: "Live", finished: "Full time", postponed: "Postponed" } as const;

// The top of the match page: the competition and matchday, both crests, the
// score or kickoff time at centre stage, and the date, time and venue.
export default function MatchHero({ match, date, time, coachName }: { match: Hero; date: string; time: string; coachName?: string }) {
  const { league, matchday } = parseCompetition(match.competition);
  const home = match.isHome ? "Eko United" : match.opponent;
  const away = match.isHome ? match.opponent : "Eko United";
  const homeLogo = match.isHome ? "/brand/crest-mark.png" : match.opponentLogoUrl;
  const awayLogo = match.isHome ? match.opponentLogoUrl : "/brand/crest-mark.png";
  const finished = match.status === "finished";
  const eko = match.score?.eko;
  const opp = match.score?.opponent;
  const hasScore = finished && eko != null && opp != null;
  const homeGoals = match.isHome ? eko : opp;
  const awayGoals = match.isHome ? opp : eko;
  const result = hasScore ? (eko! > opp! ? "Win" : eko! < opp! ? "Defeat" : "Draw") : null;
  const ekoColour = (isEkoHomeSide: boolean) => (isEkoHomeSide ? "text-cyan" : "text-white");

  return (
    <section data-reveal-skip className="relative overflow-hidden bg-navy-dark px-6 pb-14 pt-12 sm:px-10 sm:pb-16 sm:pt-16 lg:px-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_88%_-10%,rgba(101,203,233,0.26),transparent_70%),repeating-linear-gradient(115deg,transparent_0_46px,rgba(255,255,255,0.03)_46px_47px)]"
      />
      <Image src="/brand/crest-mark.png" alt="" width={520} height={520} aria-hidden className="pointer-events-none absolute -bottom-24 -left-20 h-[28rem] w-[28rem] opacity-[0.04]" />

      <div className="relative mx-auto max-w-6xl">
        {/* Competition, matchday, state */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="rounded-md bg-cyan px-3 py-1.5 font-display text-xl leading-none tracking-wider text-navy-dark sm:text-2xl">{league}</span>
            {matchday !== null && (
              <span className="font-display text-2xl uppercase tracking-wider text-white sm:text-3xl">Matchday {matchday}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-md border border-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/80">
              {match.isHome ? "Home" : "Away"}
            </span>
            <span
              className={clsx(
                "flex items-center gap-2 rounded-md px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em]",
                match.status === "live" ? "bg-red-600 text-white" : match.status === "postponed" ? "bg-yellow text-navy-dark" : "bg-white/10 text-white"
              )}
            >
              {match.status === "live" && <span className="h-2 w-2 animate-pulse rounded-full bg-white" />}
              {statusLabel[match.status]}
            </span>
          </div>
        </div>

        {/* Teams and centre stage */}
        <div className="mt-10 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 sm:mt-14 sm:gap-8">
          <Team name={home} logo={homeLogo} side="Home" coach={match.isHome ? coachName : undefined} />

          <div className="text-center">
            {hasScore ? (
              <>
                <p className="flex items-center justify-center gap-2 font-display text-[3.6rem] leading-none sm:gap-4 sm:text-[7rem] lg:text-[9rem]">
                  <span className={ekoColour(match.isHome)}>{homeGoals}</span>
                  <span className="text-white/25">-</span>
                  <span className={ekoColour(!match.isHome)}>{awayGoals}</span>
                </p>
                {result && (
                  <span
                    className={clsx(
                      "mt-3 inline-block rounded-md px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em]",
                      result === "Win" ? "bg-cyan text-navy-dark" : "bg-white/10 text-white/80"
                    )}
                  >
                    {result}
                  </span>
                )}
              </>
            ) : match.status === "postponed" ? (
              <p className="font-display text-3xl uppercase text-yellow sm:text-5xl">Postponed</p>
            ) : (
              <>
                <p className="font-display text-xl uppercase tracking-[0.3em] text-white/35 sm:text-3xl">vs</p>
                <p className="mt-1 font-display text-5xl leading-none text-white sm:text-7xl lg:text-8xl">{time}</p>
                <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.25em] text-cyan">Kickoff WAT</p>
              </>
            )}
          </div>

          <Team name={away} logo={awayLogo} side="Away" coach={!match.isHome ? coachName : undefined} />
        </div>

        {/* Date, time, venue */}
        <dl className="mx-auto mt-12 grid max-w-3xl gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-3">
          {[
            { icon: <CalendarIcon />, label: "Date", value: date },
            { icon: <ClockIcon />, label: "Kickoff", value: `${time} WAT` },
            { icon: <PinIcon />, label: "Venue", value: match.venue || "Agege Stadium, Lagos" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 bg-navy-dark/90 px-5 py-4">
              <span className="text-cyan">{item.icon}</span>
              <div className="min-w-0">
                <dt className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">{item.label}</dt>
                <dd className="text-sm font-semibold leading-snug text-white">{item.value}</dd>
              </div>
            </div>
          ))}
        </dl>

        {match.status === "upcoming" && (
          <div className="mt-10">
            <MatchdayCountdown kickoffIso={match.kickoff} size="lg" />
          </div>
        )}

        {match.isHome && !finished && match.status !== "postponed" && (
          <div className="mt-10 flex justify-center">
            <Link href={`/tickets/${match.id}`} className="btn-glass btn-glass-yellow px-10 py-3.5 text-sm font-bold uppercase tracking-wide">
              Get tickets
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
