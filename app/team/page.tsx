import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { clsx } from "clsx";
import { apiFetch } from "@/lib/api";

export const metadata: Metadata = {
  title: "First Team Squad",
  description: "Meet the Eko United FC first team squad — The Uga Boys.",
};

type Player = {
  _id: string;
  name: string;
  slug: string;
  position?: string;
  squadNumber?: number;
  nationality?: string;
  photoUrl?: string;
};

async function getSquad(): Promise<Player[]> {
  return (await apiFetch<Player[]>("/players?role=player", 1800)) || [];
}

export default async function TeamPage() {
  const squad = await getSquad();

  return (
    <main className="px-6 py-16 sm:px-10 lg:px-16">
      <div className="mb-10 flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-cyan">
            The Uga Boys
          </p>
          <h1 className="display-title font-display">First Team Squad</h1>
        </div>
        <Link
          href="/team/coaching-staff"
          className="text-sm font-semibold text-cyan transition-colors duration-200 ease-smooth hover:text-navy"
        >
          Coaching &amp; technical staff →
        </Link>
      </div>

      {squad.length === 0 ? (
        <p className="text-navy/50">Squad profiles will appear here once added by the club.</p>
      ) : (
        // Every 5th tile spans two columns at a wider aspect ratio — breaks
        // the uniform grid rhythm deterministically, no "featured player"
        // flag required from the backend.
        <div className="grid gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {squad.map((player, i) => {
            const featured = i % 5 === 0;
            return (
              <Link
                key={player._id}
                href={`/team/${player.slug}`}
                className={clsx("group block", featured && "sm:col-span-2")}
              >
                <div
                  className={clsx(
                    "relative overflow-hidden bg-navy-light",
                    featured ? "aspect-[16/10]" : "aspect-[3/4]"
                  )}
                >
                  {player.photoUrl ? (
                    <Image
                      src={player.photoUrl}
                      alt={player.name}
                      fill
                      sizes={
                        featured
                          ? "(min-width: 1024px) 46vw, 90vw"
                          : "(min-width: 1024px) 23vw, (min-width: 640px) 30vw, 90vw"
                      }
                      className="object-cover transition-transform duration-500 ease-smooth group-hover:scale-105"
                    />
                  ) : null}
                  {typeof player.squadNumber === "number" && (
                    <span className="font-display absolute left-3 top-3 text-3xl text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
                      {player.squadNumber}
                    </span>
                  )}
                </div>
                <p className="mt-3 font-display text-base text-navy group-hover:text-cyan">
                  {player.name}
                </p>
                {player.position && (
                  <p className="text-sm text-navy/50">{player.position}</p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
