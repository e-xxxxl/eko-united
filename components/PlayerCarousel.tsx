import Link from "next/link";
import Image from "next/image";
import { apiFetch } from "@/lib/api";
import { demoSquad, type DemoPlayer } from "@/lib/demoData";

async function getSquad(): Promise<DemoPlayer[]> {
  const live = await apiFetch<DemoPlayer[]>("/players?role=player", 1800);
  return live && live.length > 0 ? live : demoSquad;
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
      <div className="mb-8 flex items-baseline justify-between">
        <h2 className="font-display text-2xl text-navy sm:text-3xl">The Squad</h2>
        <Link
          href="/team"
          className="text-sm font-semibold text-cyan transition-colors duration-200 ease-smooth hover:text-navy"
        >
          View players →
        </Link>
      </div>

      <div className="relative -mx-6 sm:-mx-10 lg:-mx-16">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-white to-transparent sm:w-10 lg:w-16" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-white to-transparent sm:w-10 lg:w-16" />
        <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-2 sm:px-10 lg:gap-6 lg:px-16">
          {squad.map((player) => (
            <Link
              key={player._id}
              href={`/team/${player.slug}`}
              className="group relative block w-48 shrink-0 snap-start sm:w-56 lg:w-72 xl:w-80"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-navy-light">
                {player.photoUrl ? (
                  <Image
                    src={player.photoUrl}
                    alt={player.name}
                    fill
                    sizes="(min-width: 1280px) 320px, (min-width: 1024px) 288px, (min-width: 640px) 224px, 192px"
                    className="object-cover transition-transform duration-500 ease-smooth group-hover:scale-105"
                  />
                ) : null}

                {/* Scrim so name/number/position stay legible over any photo */}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/95 via-navy-dark/10 to-transparent" />

                {typeof player.squadNumber === "number" && (
                  <span className="font-display absolute left-3 top-3 text-3xl text-white/90 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] lg:text-4xl">
                    {player.squadNumber}
                  </span>
                )}

                <div className="absolute inset-x-0 bottom-0 p-4 lg:p-5">
                  <p className="font-display text-lg text-white lg:text-2xl">{player.name}</p>
                  {player.position && (
                    <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-cyan lg:text-sm">
                      {player.position}
                    </p>
                  )}
                </div>

                {/* Hover reveal */}
                <div className="absolute inset-0 flex items-center justify-center bg-navy-dark/0 opacity-0 transition-all duration-300 ease-smooth group-hover:bg-navy-dark/50 group-hover:opacity-100">
                  <span className="translate-y-2 rounded-full border border-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition-transform duration-300 ease-smooth group-hover:translate-y-0">
                    View Profile
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
