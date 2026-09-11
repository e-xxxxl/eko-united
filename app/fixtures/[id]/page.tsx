import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { DemoMatch } from "@/lib/demoData";
import { isAllowedImageUrl } from "@/lib/imageHosts";
import CopyLinkButton from "@/components/CopyLinkButton";
import SocialsSection from "@/components/SocialsSection";

type MatchEvent = { minute?: number; type?: string; player?: string; detail?: string };
type SquadPlayer = { _id: string; name: string; slug: string; squadNumber?: number; position?: string };
type StatPair = { eko: number | null; opponent: number | null };
type MatchStats = {
  possession?: StatPair;
  shots?: StatPair;
  shotsOnTarget?: StatPair;
  corners?: StatPair;
  fouls?: StatPair;
  yellowCards?: StatPair;
  redCards?: StatPair;
};
type MatchDetail = DemoMatch & {
  preview?: string;
  summary?: string;
  events?: MatchEvent[];
  formation?: string;
  lineup?: SquadPlayer[];
  substitutes?: SquadPlayer[];
  stats?: MatchStats;
};

const statLabels: Record<keyof MatchStats, string> = {
  possession: "Possession",
  shots: "Shots",
  shotsOnTarget: "Shots on target",
  corners: "Corners",
  fouls: "Fouls",
  yellowCards: "Yellow cards",
  redCards: "Red cards",
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
  const description = `${match.competition || "Eko United FC"}, ${match.venue || "Agege Stadium, Lagos"}.`;
  const url = `https://ekounitedfc.com/fixtures/${id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", siteName: "Eko United FC", title, description, url },
    twitter: { card: "summary_large_image", title, description },
  };
}

// A small crest/logo circle: Eko United's own crest on one side, the
// opponent's uploaded logo (falling back to an initial-letter mark when
// none has been set) on the other. Shared here rather than duplicated
// per-side since the only thing that changes is the image + label.
function TeamMark({
  src,
  alt,
  fallbackLetter,
}: {
  src?: string;
  alt: string;
  fallbackLetter: string;
}) {
  const showImage = src && isAllowedImageUrl(src);
  return (
    <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white sm:h-28 sm:w-28">
      {showImage ? (
        <Image src={src} alt={alt} fill sizes="112px" className="object-contain p-2.5" />
      ) : (
        <span className="font-display text-3xl text-navy/70 sm:text-4xl">{fallbackLetter}</span>
      )}
    </div>
  );
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
  const homeLogo = match.isHome ? "/brand/crest-mark.png" : match.opponentLogoUrl;
  const awayLogo = match.isHome ? match.opponentLogoUrl : "/brand/crest-mark.png";

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
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Bold navy header band: the match "pops" here instead of reading
          as a plain text page: both crests, the score/kickoff, and the
          competition/venue eyebrow, mirroring the homepage Next Match band. */}
      <section className="bg-navy-dark px-6 py-16 sm:px-10 lg:px-16">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-cyan">
          {match.competition || "Friendly"} · {match.venue || "Agege Stadium, Lagos"}
        </p>

        <div className="mt-8 flex flex-col items-center gap-8 sm:flex-row sm:items-center sm:justify-center sm:gap-12">
          <div className="flex flex-col items-center gap-3">
            <TeamMark src={homeLogo} alt={home} fallbackLetter={home.charAt(0)} />
            <span className="text-xs font-semibold uppercase tracking-wide text-white/60 sm:text-sm">
              {home}
            </span>
          </div>

          <div className="text-center">
            {match.status === "postponed" ? (
              <p className="font-display text-2xl text-yellow">Postponed</p>
            ) : hasScore ? (
              <span className="font-display text-5xl text-white sm:text-6xl">
                {match.isHome ? match.score!.eko : match.score!.opponent}
                <span className="mx-3 text-white/30">–</span>
                {match.isHome ? match.score!.opponent : match.score!.eko}
              </span>
            ) : (
              <>
                <p className="font-display text-2xl text-white/40">VS</p>
                <p className="mt-2 text-sm text-white/60">
                  {date}
                  <br />
                  Kickoff {time}
                </p>
              </>
            )}
          </div>

          <div className="flex flex-col items-center gap-3">
            <TeamMark src={awayLogo} alt={away} fallbackLetter={away.charAt(0)} />
            <span className="text-xs font-semibold uppercase tracking-wide text-white/60 sm:text-sm">
              {away}
            </span>
          </div>
        </div>

        {!isFinished && match.status !== "postponed" && (
          <div className="mt-10 flex justify-center">
            <Link
              href={`/tickets/${id}`}
              className="rounded-full bg-yellow px-8 py-3 text-sm font-bold uppercase tracking-wide text-navy-dark transition-transform duration-300 ease-smooth hover:scale-105"
            >
              Buy tickets
            </Link>
          </div>
        )}
      </section>

      <div className="mx-auto max-w-2xl px-6 py-14 sm:px-10 lg:px-16">
        {match.status === "upcoming" && match.preview && (
          <div>
            <p className="mb-3 font-display text-lg text-navy">Match Preview</p>
            <p className="max-w-xl text-base leading-relaxed text-navy/70">{match.preview}</p>
          </div>
        )}

        {((match.lineup && match.lineup.length > 0) || (match.substitutes && match.substitutes.length > 0)) && (
          <div className={`border-t border-navy/10 pt-6 ${match.status === "upcoming" && match.preview ? "mt-10" : ""}`}>
            <div className="mb-4 flex items-baseline justify-between">
              <p className="font-display text-lg text-navy">Lineup</p>
              {match.formation && (
                <span className="text-xs uppercase tracking-wide text-navy/40">Formation {match.formation}</span>
              )}
            </div>
            <div className="grid gap-8 sm:grid-cols-2">
              {match.lineup && match.lineup.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-navy/40">Starting XI</p>
                  <ul className="space-y-1.5">
                    {match.lineup.map((p) => (
                      <li key={p._id} className="text-sm text-navy/80">
                        {p.squadNumber != null && <span className="mr-2 text-navy/40">{p.squadNumber}</span>}
                        {p.name}
                        {p.position && <span className="ml-1 text-navy/40">· {p.position}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {match.substitutes && match.substitutes.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-navy/40">Substitutes</p>
                  <ul className="space-y-1.5">
                    {match.substitutes.map((p) => (
                      <li key={p._id} className="text-sm text-navy/60">
                        {p.squadNumber != null && <span className="mr-2 text-navy/40">{p.squadNumber}</span>}
                        {p.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {match.stats && Object.values(match.stats).some((p) => p && p.eko != null && p.opponent != null) && (
          <div className="border-t border-navy/10 pt-6 mt-10">
            <p className="mb-4 font-display text-lg text-navy">Match Statistics</p>
            <div className="space-y-4">
              {(Object.keys(statLabels) as (keyof MatchStats)[]).map((key) => {
                const pair = match.stats?.[key];
                if (!pair || pair.eko == null || pair.opponent == null) return null;
                const homeValue = match.isHome ? pair.eko : pair.opponent;
                const awayValue = match.isHome ? pair.opponent : pair.eko;
                const total = homeValue + awayValue || 1;
                const homePct = Math.round((homeValue / total) * 100);
                const suffix = key === "possession" ? "%" : "";
                return (
                  <div key={key}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-semibold text-navy">
                        {homeValue}
                        {suffix}
                      </span>
                      <span className="text-xs uppercase tracking-wide text-navy/50">{statLabels[key]}</span>
                      <span className="font-semibold text-navy">
                        {awayValue}
                        {suffix}
                      </span>
                    </div>
                    <div className="flex h-1.5 overflow-hidden rounded-full bg-navy/10">
                      <div className="bg-cyan" style={{ width: `${homePct}%` }} />
                      <div className="flex-1 bg-navy/25" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {match.summary && (
          <div className="border-t border-navy/10 pt-6 mt-10">
            <p className="mb-3 font-display text-lg text-navy">Match Summary</p>
            <p className="max-w-xl text-base leading-relaxed text-navy/70">{match.summary}</p>
          </div>
        )}

        {match.events && match.events.length > 0 && (
          <div className="border-t border-navy/10 pt-6 mt-10">
            <p className="mb-4 font-display text-lg text-navy">Goals &amp; Events</p>
            <ul className="space-y-2">
              {match.events.map((event, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-navy/70">
                  {typeof event.minute === "number" && (
                    <span className="w-10 shrink-0 font-semibold text-navy">{event.minute}&apos;</span>
                  )}
                  <span>{event.type ? eventLabels[event.type] || event.type : ""}</span>
                  {event.player && <span className="text-navy/50">· {event.player}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-navy/10 pt-6">
          <CopyLinkButton url={`https://ekounitedfc.com/fixtures/${id}`} />
          <Link
            href="/fixtures"
            className="text-sm font-semibold text-cyan transition-colors duration-200 ease-smooth hover:text-navy"
          >
            Check more fixtures →
          </Link>
        </div>
      </div>

      <SocialsSection />
    </main>
  );
}
