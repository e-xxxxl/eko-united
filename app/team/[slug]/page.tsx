import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Player = {
  _id: string;
  name: string;
  slug: string;
  position?: string;
  squadNumber?: number;
  dateOfBirth?: string;
  nationality?: string;
  photoUrl?: string;
  bio?: string;
  stats?: { appearances?: number; goals?: number; assists?: number };
  role: "player" | "coach" | "technical_staff" | "management";
};

async function getPlayer(slug: string): Promise<Player | null> {
  return apiFetch<Player>(`/players/${slug}`, 1800);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const player = await getPlayer(slug);
  if (!player) return { title: "Player Not Found" };

  const description = player.position
    ? `${player.name} — ${player.position} for Eko United FC.`
    : `${player.name} — Eko United FC.`;

  return {
    title: player.name,
    description,
    openGraph: player.photoUrl
      ? { images: [{ url: player.photoUrl, width: 800, height: 800 }] }
      : undefined,
  };
}

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const player = await getPlayer(slug);
  if (!player) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: player.name,
    nationality: player.nationality,
    memberOf: { "@type": "SportsTeam", name: "Eko United FC" },
    ...(player.role === "player" && player.position ? { jobTitle: player.position } : {}),
  };

  const stats = [
    { label: "Appearances", value: player.stats?.appearances ?? 0 },
    { label: "Goals", value: player.stats?.goals ?? 0 },
    { label: "Assists", value: player.stats?.assists ?? 0 },
  ];

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="grid gap-10 px-6 py-16 sm:px-10 lg:grid-cols-[380px_1fr] lg:px-16">
        <div className="relative aspect-[3/4] overflow-hidden bg-navy-light">
          {player.photoUrl ? (
            <Image
              src={player.photoUrl}
              alt={player.name}
              fill
              priority
              sizes="(min-width: 1024px) 380px, 90vw"
              className="object-cover"
            />
          ) : null}
          {typeof player.squadNumber === "number" && (
            <span className="font-display absolute left-4 top-4 text-5xl text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
              {player.squadNumber}
            </span>
          )}
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-cyan">
            {player.position || "Eko United FC"}
          </p>
          <h1 className="display-title font-display">{player.name}</h1>

          <dl className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3">
            {player.nationality && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-navy/40">Nationality</dt>
                <dd className="mt-1 text-base font-semibold text-navy">{player.nationality}</dd>
              </div>
            )}
            {player.dateOfBirth && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-navy/40">Date of Birth</dt>
                <dd className="mt-1 text-base font-semibold text-navy">
                  {new Date(player.dateOfBirth).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    timeZone: "Africa/Lagos",
                  })}
                </dd>
              </div>
            )}
          </dl>

          {player.role === "player" && (
            <div className="mt-10 flex gap-10 bg-navy-dark px-6 py-6">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-3xl text-yellow">{stat.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-white/50">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          )}

          {player.bio && (
            <p className="mt-8 max-w-2xl text-base leading-relaxed text-navy/70">
              {player.bio}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
