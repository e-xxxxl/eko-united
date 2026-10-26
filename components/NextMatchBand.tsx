import Image from "next/image";
import Link from "next/link";
import MatchdayCountdown from "@/components/MatchdayCountdown";
import { isAllowedImageUrl } from "@/lib/imageHosts";

export type NextMatch = {
  _id: string;
  opponent: string;
  opponentLogoUrl?: string;
  competition?: string;
  venue?: string;
  kickoff: string;
  isHome: boolean;
};

// Pinned to Lagos time, same reasoning as MatchCard: without an explicit
// timeZone the server and each visitor's browser would format differently.
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Lagos",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Lagos",
  });
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 1 1 13 0c0 5.4-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.3" />
    </svg>
  );
}

// One side of the matchup. The badge is a fixed-aspect disc sized from the
// --badge variable set on the grid (so the VS marker can line up with its
// centre), and the name sits in a min-w-0 column: it wraps to at most two
// lines and breaks inside a long word, so no club name can push the row past
// its container, however long it is or however narrow the screen.
function TeamBadge({ name, logoUrl }: { name: string; logoUrl?: string }) {
  const hasLogo = logoUrl && isAllowedImageUrl(logoUrl);
  return (
    <div className="flex min-w-0 flex-col items-center gap-3 text-center sm:gap-4">
      <div className="relative aspect-square w-[var(--badge)] shrink-0">
        {hasLogo ? (
          <Image src={logoUrl} alt={`${name} badge`} fill sizes="144px" className="object-contain" />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-display text-[calc(var(--badge)*0.6)] leading-none text-white/80">
            {name.charAt(0)}
          </span>
        )}
      </div>
      <p
        title={name}
        className="line-clamp-2 w-full break-words font-display text-[clamp(1rem,4.4vw,1.75rem)] uppercase leading-[1.05] tracking-wide text-white [text-wrap:balance]"
      >
        {name}
      </p>
    </div>
  );
}

function InfoChip({ icon, label, value, className = "" }: { icon: React.ReactNode; label: string; value: React.ReactNode; className?: string }) {
  return (
    <li className={`flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 ${className}`}>
      <span className="shrink-0 text-cyan">{icon}</span>
      <span className="min-w-0">
        <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">{label}</span>
        <span className="block break-words text-sm font-medium leading-snug text-white">{value}</span>
      </span>
    </li>
  );
}

// The homepage band straight after the hero. Home team always sits on the
// left, same convention as the match page, so an away fixture reads
// "Opponent vs Eko United" rather than always putting us first.
export default function NextMatchBand({ match }: { match: NextMatch }) {
  const eko = <TeamBadge name="Eko United" logoUrl="/brand/crest-mark.png" />;
  const opponent = <TeamBadge name={match.opponent} logoUrl={match.opponentLogoUrl} />;

  return (
    <section className="relative -mt-px overflow-hidden bg-navy-dark px-5 py-12 sm:px-10 sm:py-16 lg:px-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(115deg,transparent_0_46px,rgba(255,255,255,0.025)_46px_47px)]"
      />

      <div data-reveal-stagger className="relative mx-auto flex max-w-5xl flex-col items-center gap-9 sm:gap-12">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Next Match</p>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            <span className="text-sm font-medium uppercase tracking-wide text-white/75">
              {match.competition || "Friendly"}
            </span>
            <span className="rounded-full border border-cyan/40 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan">
              {match.isHome ? "Home" : "Away"}
            </span>
          </div>
        </div>

        <div className="grid w-full max-w-3xl grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-3 [--badge:clamp(4.5rem,24vw,9rem)] sm:gap-8">
          {match.isHome ? eko : opponent}
          <div className="flex h-[var(--badge)] flex-col items-center justify-center gap-2">
            <span aria-hidden className="h-6 w-px bg-gradient-to-b from-transparent to-white/40 sm:h-10" />
            <span className="font-display text-xl leading-none text-white/60 sm:text-3xl">VS</span>
            <span aria-hidden className="h-6 w-px bg-gradient-to-t from-transparent to-white/40 sm:h-10" />
          </div>
          {match.isHome ? opponent : eko}
        </div>

        <MatchdayCountdown kickoffIso={match.kickoff} size="lg" />

        <ul className={`grid w-full gap-3 ${match.venue ? "max-w-3xl sm:grid-cols-2" : "max-w-md"}`}>
          <InfoChip
            icon={<CalendarIcon />}
            label="Kickoff"
            value={
              <>
                <span className="whitespace-nowrap">{formatDate(match.kickoff)}</span>
                {" · "}
                <span className="whitespace-nowrap">{formatTime(match.kickoff)} WAT</span>
              </>
            }
          />
          {match.venue && <InfoChip icon={<PinIcon />} label="Venue" value={match.venue} />}
        </ul>

        <div className="flex w-full max-w-md flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row">
          <Link
            href="/tickets"
            className="btn-glass btn-glass-yellow px-8 py-3 text-center text-xs font-bold uppercase tracking-wide"
          >
            Buy tickets
          </Link>
          <Link
            href={`/fixtures/${match._id}`}
            className="btn-glass btn-glass-light px-8 py-3 text-center text-xs font-bold uppercase tracking-wide"
          >
            Match centre
          </Link>
        </div>
      </div>
    </section>
  );
}
