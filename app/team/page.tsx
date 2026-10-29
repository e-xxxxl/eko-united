import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { apiList } from "@/lib/api";
import type { DemoPlayer } from "@/lib/demoData";
import { isAllowedImageUrl } from "@/lib/imageHosts";
import { groupMeta, groupSquad, playerPhotoUrl } from "@/lib/squad";
import { sectionMeta } from "@/lib/seo";

export const metadata: Metadata = sectionMeta("team");

async function getSquad(): Promise<DemoPlayer[]> {
  return apiList<DemoPlayer>("/players?role=player", 1800);
}

// The squad laid out the way a team sheet reads: goalkeepers first, then
// defenders, midfielders and forwards, each in its own section. Photos are
// tall (3:4) so every player stands up in the frame, whatever the screen.
export default async function TeamPage() {
  const squad = await getSquad();
  const groups = groupSquad(squad);

  return (
    <main className="px-6 py-16 sm:px-10 lg:px-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-cyan">The Uga Boys</p>
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
        <>
          {groups.length > 1 && (
            <nav aria-label="Squad sections" className="-mx-6 mb-10 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
              {groups.map(({ group, players }) => (
                <a
                  key={group}
                  href={`#${group}`}
                  className="shrink-0 rounded-lg bg-navy/[0.05] px-4 py-2 text-xs font-bold uppercase tracking-wide text-navy/70 transition-colors duration-200 ease-smooth hover:bg-navy hover:text-white"
                >
                  {groupMeta[group].label} <span className="text-navy/35">{players.length}</span>
                </a>
              ))}
            </nav>
          )}

          <div className="space-y-16">
            {groups.map(({ group, players }) => (
              <section key={group} id={group} className="scroll-mt-28">
                <div data-reveal className="mb-6 flex items-baseline gap-4 border-b border-navy/10 pb-3">
                  <h2 className="font-display text-3xl font-bold text-navy sm:text-4xl">{groupMeta[group].label}</h2>
                  <span className="font-display text-2xl text-cyan">{String(players.length).padStart(2, "0")}</span>
                </div>

                <div data-reveal-stagger className="grid grid-cols-2 gap-x-3 gap-y-9 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 xl:grid-cols-5">
                  {players.map((player) => {
                    const photo = playerPhotoUrl(player.photoUrl, player.photoCutout);
                    // The player's second photo fades in over the first on hover.
                    const alt = (player.extraPhotos || []).filter(isAllowedImageUrl)[0];
                    const altPhoto = alt ? playerPhotoUrl(alt, player.photoCutout) : undefined;
                    return (
                      <Link key={player._id} href={`/team/${player.slug}`} className="group block">
                        <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
                          {photo ? (
                            <Image
                              src={photo}
                              alt={player.name}
                              fill
                              sizes="(min-width: 1280px) 18vw, (min-width: 1024px) 23vw, (min-width: 640px) 30vw, 48vw"
                              className="object-cover object-top transition-transform duration-500 ease-smooth group-hover:scale-105"
                            />
                          ) : (
                            <div className="absolute inset-0 rounded-xl bg-navy/[0.06]" />
                          )}
                          {photo && altPhoto && (
                            <Image
                              src={altPhoto}
                              alt=""
                              aria-hidden
                              fill
                              sizes="(min-width: 1280px) 18vw, (min-width: 1024px) 23vw, (min-width: 640px) 30vw, 48vw"
                              className="object-cover object-top opacity-0 transition-[opacity,transform] duration-500 ease-smooth group-hover:scale-105 group-hover:opacity-100 group-focus-visible:opacity-100"
                            />
                          )}
                        </div>
                        <div className="mt-3 flex items-start gap-2.5">
                          {typeof player.squadNumber === "number" && (
                            <span className="font-display text-3xl font-bold leading-none text-cyan sm:text-4xl">
                              {player.squadNumber}
                            </span>
                          )}
                          <div className="min-w-0">
                            <p className="font-display text-xl font-bold leading-tight text-navy transition-colors duration-200 ease-smooth group-hover:text-cyan sm:text-2xl">
                              {player.name}
                            </p>
                            {player.position && (
                              <p className="mt-0.5 text-xs font-bold uppercase tracking-wide text-navy/70 sm:text-sm">
                                {player.position}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
