import Link from "next/link";
import Image from "next/image";
import { apiList } from "@/lib/api";
import { groupMeta, playerPhotoUrl, positionGroup, sortSquad } from "@/lib/squad";
import type { DemoPlayer } from "@/lib/demoData";
import RailArrows from "@/components/RailArrows";

async function getSquad(): Promise<DemoPlayer[]> {
  return sortSquad(await apiList<DemoPlayer>("/players?role=player", 1800));
}

// The squad on the homepage: a swipeable rail (native scroll-snap, arrows on
// larger screens) of tall player cards in team-sheet order, goalkeepers first.
// Each photo is zoomed in a little inside its frame, anchored to the top so
// faces stay large and are never cut off. The photo stands alone; the number,
// position group, name and position sit underneath, with a rule that turns
// cyan on hover.
export default async function PlayerCarousel() {
  const squad = await getSquad();

  return (
    <section className="px-6 py-16 sm:px-10 lg:px-16">
      <div data-reveal className="mb-8 flex items-end justify-between gap-x-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-cyan">The Uga Boys</p>
          <h2 className="font-display text-3xl font-bold text-navy sm:text-4xl">The Squad</h2>
        </div>
        <div className="flex items-center gap-5">
          <Link
            href="/team"
            className="shrink-0 whitespace-nowrap text-sm font-semibold text-cyan transition-colors duration-200 ease-smooth hover:text-navy"
          >
            Full squad →
          </Link>
          {squad.length > 3 && <RailArrows targetId="squad-rail" label="players" />}
        </div>
      </div>

      {squad.length === 0 ? (
        <p className="border-t border-navy/10 py-6 text-navy/50">Squad profiles will appear here once added.</p>
      ) : (
        <div className="relative -mx-6 sm:-mx-10 lg:-mx-16">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-4 bg-gradient-to-r from-white to-transparent sm:w-10 lg:w-16" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-4 bg-gradient-to-l from-white to-transparent sm:w-10 lg:w-16" />
          <div
            id="squad-rail"
            data-reveal-stagger
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-6 pb-3 [scrollbar-width:none] sm:gap-5 sm:px-10 lg:gap-6 lg:px-16 [&::-webkit-scrollbar]:hidden"
          >
            {squad.map((player) => {
              const photo = playerPhotoUrl(player.photoUrl, player.photoCutout);
              const group = groupMeta[positionGroup(player.position)].singular;
              return (
                <Link
                  key={player._id}
                  href={`/team/${player.slug}`}
                  data-rail-card
                  className="group block w-[62vw] shrink-0 snap-start sm:w-60 lg:w-72 xl:w-80"
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
                    {photo ? (
                      <Image
                        src={photo}
                        alt={player.name}
                        fill
                        sizes="(min-width: 1280px) 320px, (min-width: 1024px) 288px, (min-width: 640px) 240px, 62vw"
                        className="origin-top scale-[1.14] object-cover object-top transition-transform duration-700 ease-smooth group-hover:scale-[1.22]"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-navy/[0.06]" />
                    )}
                  </div>

                  <div className="mt-4 border-t-2 border-navy/10 pt-3 transition-colors duration-300 ease-smooth group-hover:border-cyan">
                    <div className="flex items-start gap-3">
                      {typeof player.squadNumber === "number" && (
                        <span className="font-display text-5xl font-bold leading-[0.85] text-cyan lg:text-6xl">
                          {player.squadNumber}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-navy/45">{group}</p>
                        <p className="mt-0.5 truncate font-display text-xl font-bold leading-tight text-navy transition-colors duration-200 ease-smooth group-hover:text-cyan lg:text-2xl">
                          {player.name}
                        </p>
                        {player.position && (
                          <p className="text-xs font-bold uppercase tracking-wide text-navy/70 lg:text-sm">{player.position}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
