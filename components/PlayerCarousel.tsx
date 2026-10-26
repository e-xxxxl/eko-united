import Link from "next/link";
import Image from "next/image";
import { apiFetch } from "@/lib/api";
import type { DemoPlayer } from "@/lib/demoData";

async function getSquad(): Promise<DemoPlayer[]> {
  return (await apiFetch<DemoPlayer[]>("/players?role=player", 1800)) || [];
}

// Native CSS scroll-snap, not a JS carousel library — lightweight, no extra
// client bundle, and swipes naturally on mobile. Cards read like a real
// player card (number + name + position overlaid on the photo via a scrim,
// a hover reveal), not a thumbnail with a caption underneath, and scale up
// substantially on large screens rather than staying thumbnail-sized.
export default async function PlayerCarousel() {
  const squad = await getSquad();

  return (
    <section className="px-6 py-16 sm:px-10 lg:px-16">
      <div data-reveal className="mb-8 flex items-baseline justify-between gap-x-4">
        <h2 className="font-display text-2xl text-navy sm:text-3xl">The Squad</h2>
        <Link
          href="/team"
          className="shrink-0 whitespace-nowrap text-sm font-semibold text-cyan transition-colors duration-200 ease-smooth hover:text-navy"
        >
          View players →
        </Link>
      </div>

      {squad.length === 0 ? (
        <p className="border-t border-navy/10 py-6 text-navy/50">
          Squad profiles will appear here once added.
        </p>
      ) : (
      <div className="relative -mx-6 sm:-mx-10 lg:-mx-16">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-white to-transparent sm:w-10 lg:w-16" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-white to-transparent sm:w-10 lg:w-16" />
        <div data-reveal-stagger className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-2 sm:px-10 lg:gap-6 lg:px-16">
          {squad.map((player) => (
            <Link
              key={player._id}
              href={`/team/${player.slug}`}
              className="group relative block w-48 shrink-0 snap-start sm:w-56 lg:w-72 xl:w-80"
            >
              {/* The photo stands alone: no panel, scrim or overlay behind or
                  over it, so a cut-out or full photo both show cleanly. The
                  number, name and position sit underneath. */}
              <div className="relative aspect-[3/4] overflow-hidden">
                {player.photoUrl ? (
                  <Image
                    src={player.photoUrl}
                    alt={player.name}
                    fill
                    sizes="(min-width: 1280px) 320px, (min-width: 1024px) 288px, (min-width: 640px) 224px, 192px"
                    className="object-cover object-top transition-transform duration-500 ease-smooth group-hover:scale-105"
                  />
                ) : null}
              </div>
              <div className="mt-3 flex items-baseline gap-3">
                {typeof player.squadNumber === "number" && (
                  <span className="font-display text-3xl leading-none text-cyan lg:text-4xl">{player.squadNumber}</span>
                )}
                <div className="min-w-0">
                  <p className="truncate font-display text-lg leading-tight text-navy transition-colors duration-200 ease-smooth group-hover:text-cyan lg:text-2xl">
                    {player.name}
                  </p>
                  {player.position && (
                    <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-navy/50 lg:text-sm">
                      {player.position}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      )}
    </section>
  );
}
