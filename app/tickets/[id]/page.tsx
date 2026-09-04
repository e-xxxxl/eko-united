import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { demoFixtures, demoResults, demoTicketTypes, type DemoMatch, type DemoTicketType } from "@/lib/demoData";
import TicketPurchase from "@/components/tickets/TicketPurchase";

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

async function getMatch(id: string): Promise<DemoMatch | null> {
  const live = await apiFetch<DemoMatch>(`/matches/${id}`, 300);
  return live || [...demoFixtures, ...demoResults].find((m) => m._id === id) || null;
}

async function getTicketTypes(matchId: string): Promise<DemoTicketType[]> {
  const live = await apiFetch<DemoTicketType[]>(`/ticket-types?match=${matchId}`, 300);
  return live && live.length > 0 ? live : demoTicketTypes.filter((t) => t.match === matchId);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const match = await getMatch(id);
  if (!match) return { title: "Match Not Found" };

  const opponent = match.opponent;
  const title = `Tickets: Eko United vs ${opponent}`;
  const description = `Buy tickets for Eko United FC vs ${opponent} — ${match.competition || "Nigeria National League"} at ${match.venue || "Agege Stadium, Lagos"}.`;
  const url = `https://ekounitedfc.com/tickets/${id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: "Eko United FC",
      title,
      description,
      url,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function MatchTicketsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const match = await getMatch(id);
  if (!match) notFound();

  const ticketTypes = await getTicketTypes(id);
  const { date, time } = formatKickoff(match.kickoff);
  const home = match.isHome ? "Eko United" : match.opponent;
  const away = match.isHome ? match.opponent : "Eko United";
  const matchLabel = `${home} vs ${away} — ${date}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: `${home} vs ${away}`,
    startDate: match.kickoff,
    location: { "@type": "Place", name: match.venue || "Agege Stadium, Lagos" },
    homeTeam: { "@type": "SportsTeam", name: home },
    awayTeam: { "@type": "SportsTeam", name: away },
    offers: ticketTypes.map((t) => ({
      "@type": "Offer",
      name: t.name,
      priceCurrency: "NGN",
      price: t.price,
      availability:
        t.quantityAvailable - t.quantitySold > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/SoldOut",
    })),
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
      <p className="mt-3 text-base text-navy/60">
        {date} · Kickoff {time}
      </p>

      {ticketTypes.length === 0 ? (
        <p className="mt-10 text-navy/50">Tickets for this match aren't on sale yet — check back soon.</p>
      ) : (
        <TicketPurchase ticketTypes={ticketTypes} matchLabel={matchLabel} />
      )}
    </main>
  );
}
