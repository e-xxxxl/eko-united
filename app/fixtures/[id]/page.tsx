import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch, apiList } from "@/lib/api";
import type { DemoMatch, DemoPlayer } from "@/lib/demoData";
import CopyLinkButton from "@/components/CopyLinkButton";
import SocialsSection from "@/components/SocialsSection";
import MatchHero from "@/components/match/MatchHero";
import LineupSection, { type Coach } from "@/components/match/LineupSection";
import MatchTimeline, { type MatchEvent } from "@/components/match/MatchTimeline";
import MatchStatsBars, { type MatchStats } from "@/components/match/MatchStatsBars";
import { parseCompetition, type LineupPlayer } from "@/lib/lineup";

type MatchDetail = DemoMatch & {
  preview?: string;
  summary?: string;
  events?: MatchEvent[];
  formation?: string;
  lineup?: LineupPlayer[];
  substitutes?: LineupPlayer[];
  stats?: MatchStats;
};

async function getMatch(id: string): Promise<MatchDetail | null> {
  return await apiFetch<MatchDetail>(`/matches/${id}`, 300);
}

// The head coach: whoever is titled head coach or manager, else the first coach.
async function getHeadCoach(): Promise<Coach | null> {
  const coaches = await apiList<DemoPlayer>("/players?role=coach", 1800);
  const pick = coaches.find((c) => /head|manager/i.test(c.title || "")) || coaches[0];
  return pick ? { name: pick.name, title: pick.title, photoUrl: pick.photoUrl, slug: pick.slug } : null;
}

function formatKickoff(iso: string) {
  const date = new Date(iso);
  return {
    date: date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Lagos" }),
    time: date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" }),
  };
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const match = await getMatch(id);
  if (!match) return { title: "Match Not Found" };

  const home = match.isHome ? "Eko United" : match.opponent;
  const away = match.isHome ? match.opponent : "Eko United";
  const { league, matchday } = parseCompetition(match.competition);
  const title = `${home} vs ${away}`;
  const description = `${league}${matchday !== null ? ` Matchday ${matchday}` : ""}, ${match.venue || "Agege Stadium, Lagos"}.`;
  const url = `https://ekounitedfc.com/fixtures/${id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", siteName: "Eko United FC", title, description, url },
    twitter: { card: "summary_large_image", title, description },
  };
}

function Paragraphs({ text }: { text: string }) {
  return (
    <div className="max-w-3xl space-y-5 border-l-4 border-cyan pl-6 text-lg leading-relaxed text-navy/80 sm:text-xl">
      {text
        .split(/\n+/)
        .filter(Boolean)
        .map((p, i) => (
          <p key={i}>{p}</p>
        ))}
    </div>
  );
}

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = await getMatch(id);
  if (!match) notFound();
  const coach = await getHeadCoach();

  const { date, time } = formatKickoff(match.kickoff);
  const home = match.isHome ? "Eko United" : match.opponent;
  const away = match.isHome ? match.opponent : "Eko United";
  const finished = match.status === "finished";

  // A saved player who has since been removed comes back empty: leave those out.
  const lineup = (match.lineup || []).filter((p) => p && p.name);
  const substitutes = (match.substitutes || []).filter((p) => p && p.name);
  const hasLineup = lineup.length > 0 || substitutes.length > 0;
  const hasStats = Boolean(match.stats && Object.values(match.stats).some((p) => p && p.eko != null && p.opponent != null));
  const hasEvents = Boolean(match.events && match.events.length > 0);
  const overviewText = match.status === "upcoming" ? match.preview : match.summary || (match.status === "live" ? match.preview : undefined);
  const hasOverview = Boolean(overviewText);
  const showLineupSlot = hasLineup || match.status === "upcoming";

  const sections = [
    hasOverview && { id: "overview", label: finished ? "Report" : "Preview" },
    showLineupSlot && { id: "lineup", label: "Lineup" },
    hasStats && { id: "stats", label: "Stats" },
    hasEvents && { id: "events", label: "Goals & events" },
  ].filter(Boolean) as { id: string; label: string }[];

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <MatchHero
        match={{ ...match, id }}
        date={date}
        time={time}
        coachName={coach?.name}
      />

      {sections.length > 1 && (
        <nav
          aria-label="Match sections"
          className="sticky z-30 border-b border-navy/10 bg-white/90 backdrop-blur"
          style={{ top: "var(--header-height, 5rem)" }}
        >
          <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-6 sm:px-10 lg:px-16 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="shrink-0 border-b-2 border-transparent px-4 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-navy/50 transition-colors duration-200 ease-smooth hover:border-cyan hover:text-navy"
              >
                {s.label}
              </a>
            ))}
          </div>
        </nav>
      )}

      <div className="mx-auto max-w-6xl space-y-20 px-6 py-16 sm:px-10 sm:py-20 lg:px-16">
        {hasOverview && (
          <section id="overview" data-reveal className="scroll-mt-40">
            <h2 className="display-title font-display mb-8">{finished ? "Match Report" : "Match Preview"}</h2>
            <Paragraphs text={overviewText as string} />
          </section>
        )}

        {showLineupSlot && (
          <section id="lineup" data-reveal className="scroll-mt-40">
            {hasLineup ? (
              <LineupSection formation={match.formation} lineup={lineup} substitutes={substitutes} coach={coach} />
            ) : (
              <>
                <h2 className="display-title font-display mb-8">Lineup</h2>
                <p className="rounded-2xl border border-dashed border-navy/20 px-6 py-10 text-center text-navy/55">
                  The starting eleven will be announced closer to kickoff.
                </p>
              </>
            )}
          </section>
        )}

        {hasStats && (
          <section id="stats" data-reveal className="scroll-mt-40">
            <h2 className="display-title font-display mb-8">Match Stats</h2>
            <div className="max-w-3xl">
              <MatchStatsBars stats={match.stats as MatchStats} isHome={match.isHome} home={home} away={away} />
            </div>
          </section>
        )}

        {hasEvents && (
          <section id="events" data-reveal className="scroll-mt-40">
            <h2 className="display-title font-display mb-8">Goals &amp; Events</h2>
            <div className="max-w-2xl">
              <MatchTimeline events={match.events as MatchEvent[]} />
            </div>
          </section>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-navy/10 pt-6">
          <CopyLinkButton url={`https://ekounitedfc.com/fixtures/${id}`} />
          <Link href="/fixtures" className="text-sm font-semibold text-cyan transition-colors duration-200 ease-smooth hover:text-navy">
            Check more fixtures →
          </Link>
        </div>
      </div>

      <SocialsSection />
    </main>
  );
}
