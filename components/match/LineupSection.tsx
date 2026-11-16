import Image from "next/image";
import Link from "next/link";
import LineupPitch from "@/components/match/LineupPitch";
import { isAllowedImageUrl } from "@/lib/imageHosts";
import { playerPhotoUrl } from "@/lib/squad";
import { arrangeLines, bandLabels, bandOf, parseFormation, sortByPosition, type LineupPlayer, type PositionBand } from "@/lib/lineup";

export type Coach = { name: string; title?: string; photoUrl?: string; slug?: string };

function Avatar({ player, size }: { player: { name: string; photoUrl?: string; photoCutout?: boolean; squadNumber?: number }; size: string }) {
  const src = isAllowedImageUrl(player.photoUrl) ? playerPhotoUrl(player.photoUrl, player.photoCutout) : undefined;
  return (
    <span className={`relative block shrink-0 overflow-hidden rounded-full bg-gradient-to-b from-cyan/60 to-navy ${size}`}>
      {src ? (
        <Image src={src} alt="" fill sizes="64px" className="object-cover object-top" />
      ) : (
        <span className="flex h-full w-full items-center justify-center font-display text-xl text-white">{player.name.charAt(0)}</span>
      )}
    </span>
  );
}

// One line of the ordered lists: big number, round photo, bold name, position.
function PlayerRow({ player, muted = false }: { player: LineupPlayer; muted?: boolean }) {
  const inner = (
    <>
      <span className={`w-10 shrink-0 text-right font-display leading-none ${muted ? "text-2xl text-navy/30" : "text-4xl text-cyan"}`}>
        {player.squadNumber ?? ""}
      </span>
      <Avatar player={player} size={muted ? "h-9 w-9" : "h-12 w-12"} />
      <span className="min-w-0 flex-1">
        <span className={`block truncate font-display leading-tight ${muted ? "text-xl text-navy/80" : "text-2xl font-bold text-navy sm:text-[1.7rem]"}`}>{player.name}</span>
        {player.position && <span className="block truncate text-[11px] font-bold uppercase tracking-[0.14em] text-navy/45">{player.position}</span>}
      </span>
    </>
  );
  return (
    <li className="border-b border-navy/10 last:border-b-0">
      {player.slug ? (
        <Link href={`/team/${player.slug}`} className="flex items-center gap-3 py-2.5 transition-colors duration-200 ease-smooth hover:text-cyan">
          {inner}
        </Link>
      ) : (
        <div className="flex items-center gap-3 py-2.5">{inner}</div>
      )}
    </li>
  );
}

// Used when there is no formation to draw: bold photo cards, grouped from
// goalkeeper to forwards.
function PlayerCard({ player }: { player: LineupPlayer }) {
  const src = isAllowedImageUrl(player.photoUrl) ? playerPhotoUrl(player.photoUrl, player.photoCutout) : undefined;
  const card = (
    <span className="group relative block aspect-[3/4] overflow-hidden rounded-2xl bg-gradient-to-b from-navy to-navy-dark">
      {src && (
        <Image
          src={src}
          alt={player.name}
          fill
          sizes="(min-width: 1024px) 16vw, (min-width: 640px) 28vw, 44vw"
          className="object-cover object-top transition-transform duration-500 ease-smooth group-hover:scale-105"
        />
      )}
      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/20 to-transparent" />
      {typeof player.squadNumber === "number" && (
        <span className="absolute left-3 top-2 font-display text-5xl leading-none text-cyan drop-shadow">{player.squadNumber}</span>
      )}
      <span className="absolute inset-x-3 bottom-3">
        <span className="block font-display text-2xl font-bold uppercase leading-none text-white">{player.name}</span>
        {player.position && <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-cyan">{player.position}</span>}
      </span>
    </span>
  );
  return player.slug ? <Link href={`/team/${player.slug}`}>{card}</Link> : card;
}

function CoachCard({ coach }: { coach: Coach }) {
  const body = (
    <span className="flex items-center gap-4 rounded-2xl bg-navy p-4 text-white">
      <Avatar player={{ name: coach.name, photoUrl: coach.photoUrl }} size="h-14 w-14" />
      <span className="min-w-0">
        <span className="block text-[10px] font-bold uppercase tracking-[0.22em] text-cyan">{coach.title || "Head coach"}</span>
        <span className="block truncate font-display text-3xl leading-tight">{coach.name}</span>
      </span>
    </span>
  );
  return coach.slug ? <Link href={`/team/${coach.slug}`}>{body}</Link> : body;
}

// Both teams' side of the story we hold: Eko United's own eleven. The starting
// players come from the match, the substitutes are the rest of the matchday
// squad, and everyone is listed goalkeeper first, striker last. With a formation
// the eleven are drawn on a pitch.
export default function LineupSection({
  formation,
  lineup,
  substitutes,
  coach,
}: {
  formation?: string;
  lineup: LineupPlayer[];
  substitutes: LineupPlayer[];
  coach?: Coach | null;
}) {
  const xi = sortByPosition(lineup);
  const bench = sortByPosition(substitutes);
  const counts = parseFormation(formation);
  const lines = arrangeLines(lineup, formation);
  const showPitch = Boolean(counts) && lineup.length === 11 && lines.length >= 4;

  const bands = (["goalkeepers", "defenders", "midfielders", "forwards"] as PositionBand[])
    .map((band) => ({ band, players: xi.filter((p) => bandOf(p.position) === band) }))
    .filter((g) => g.players.length > 0);

  const xiList = (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <h3 className="font-display text-3xl text-navy">Starting XI</h3>
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-navy/40">{xi.length} players</span>
      </div>
      <ul>
        {xi.map((p) => (
          <PlayerRow key={p._id} player={p} />
        ))}
      </ul>
    </div>
  );

  const benchList =
    bench.length > 0 ? (
      <div>
        <div className="mb-1 flex items-baseline justify-between">
          <h3 className="font-display text-3xl text-navy">Substitutes</h3>
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-navy/40">{bench.length} players</span>
        </div>
        <ul className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {bench.map((p) => (
            <PlayerRow key={p._id} player={p} muted />
          ))}
        </ul>
      </div>
    ) : null;

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <h2 className="display-title font-display">Lineup</h2>
        {formation && (
          <span className="rounded-lg bg-navy px-4 py-2 font-display text-3xl leading-none tracking-wider text-cyan">{formation}</span>
        )}
      </div>

      {showPitch ? (
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-14">
          <div className="lg:sticky lg:top-40">
            <LineupPitch lines={lines} formation={formation} />
          </div>
          <div className="space-y-9">
            {coach && <CoachCard coach={coach} />}
            {xiList}
            {benchList}
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          {coach && (
            <div className="max-w-md">
              <CoachCard coach={coach} />
            </div>
          )}
          {bands.map(({ band, players }) => (
            <div key={band}>
              <div className="mb-4 flex items-baseline gap-3 border-b border-navy/10 pb-2">
                <h3 className="font-display text-3xl font-bold text-navy">{bandLabels[band]}</h3>
                <span className="font-display text-2xl text-cyan">{String(players.length).padStart(2, "0")}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
                {players.map((p) => (
                  <PlayerCard key={p._id} player={p} />
                ))}
              </div>
            </div>
          ))}
          {benchList && <div className="max-w-3xl">{benchList}</div>}
        </div>
      )}
    </div>
  );
}
