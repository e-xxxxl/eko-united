import Image from "next/image";
import Link from "next/link";
import { isAllowedImageUrl } from "@/lib/imageHosts";
import { playerPhotoUrl } from "@/lib/squad";
import { shortName, type LineupPlayer } from "@/lib/lineup";

// The starting eleven laid out on a pitch, goalkeeper at the bottom and the
// forwards at the top, each player as a round photo with his shirt number and
// surname. `lines` comes from arrangeLines() in lib/lineup.ts. Works on the
// public match page and in the admin preview (pass `link={false}` there).

const STRIPES = Array.from({ length: 8 }, (_, i) => i);

function PitchMarkings() {
  return (
    <svg viewBox="0 0 100 130" className="absolute inset-0 h-full w-full" aria-hidden>
      {STRIPES.map((i) => (
        <rect key={i} x="0" y={i * 16.25} width="100" height="16.25" fill={i % 2 === 0 ? "#0f5c39" : "#0c4e31"} />
      ))}
      <g fill="none" stroke="rgba(255,255,255,0.38)" strokeWidth="0.55">
        <rect x="3" y="3" width="94" height="124" rx="0.5" />
        <line x1="3" y1="65" x2="97" y2="65" />
        <circle cx="50" cy="65" r="9.5" />
        <rect x="24" y="3" width="52" height="20" />
        <rect x="38" y="3" width="24" height="8" />
        <path d="M 40.5 23 A 10 10 0 0 0 59.5 23" />
        <rect x="24" y="107" width="52" height="20" />
        <rect x="38" y="119" width="24" height="8" />
        <path d="M 40.5 107 A 10 10 0 0 1 59.5 107" />
      </g>
      <circle cx="50" cy="65" r="0.9" fill="rgba(255,255,255,0.45)" />
    </svg>
  );
}

function Marker({ player, link }: { player: LineupPlayer; link: boolean }) {
  const src = isAllowedImageUrl(player.photoUrl) ? playerPhotoUrl(player.photoUrl, player.photoCutout) : undefined;
  const body = (
    <span className="group flex flex-col items-center">
      <span className="relative block h-[3.1rem] w-[3.1rem] sm:h-16 sm:w-16 lg:h-[4.5rem] lg:w-[4.5rem]">
        <span className="absolute inset-0 overflow-hidden rounded-full bg-gradient-to-b from-cyan to-navy ring-[2.5px] ring-white shadow-[0_6px_14px_rgba(0,0,0,0.45)] transition-transform duration-300 ease-smooth group-hover:scale-110">
          {src ? (
            <Image src={src} alt="" fill sizes="72px" className="object-cover object-top" />
          ) : (
            <span className="flex h-full w-full items-center justify-center font-display text-2xl text-white sm:text-3xl">
              {player.squadNumber ?? player.name.charAt(0)}
            </span>
          )}
        </span>
        {typeof player.squadNumber === "number" && src && (
          <span className="absolute -bottom-1 -left-1 flex h-[1.15rem] min-w-[1.15rem] items-center justify-center rounded-full bg-cyan px-1 text-[10px] font-bold leading-none text-navy-dark shadow sm:h-6 sm:min-w-[1.5rem] sm:text-xs">
            {player.squadNumber}
          </span>
        )}
      </span>
      <span className="mt-1.5 max-w-[4.9rem] truncate rounded bg-navy-dark/75 px-1.5 py-[3px] font-display text-[0.8rem] uppercase leading-none tracking-wide text-white sm:max-w-[7rem] sm:text-[1.05rem]">
        {shortName(player.name)}
      </span>
    </span>
  );
  return link && player.slug ? (
    <Link href={`/team/${player.slug}`} aria-label={player.name}>
      {body}
    </Link>
  ) : (
    body
  );
}

export default function LineupPitch({
  lines,
  formation,
  link = true,
}: {
  lines: LineupPlayer[][];
  formation?: string;
  link?: boolean;
}) {
  const rows = lines.length;
  return (
    <div className="relative mx-auto aspect-[100/130] w-full max-w-[34rem] overflow-hidden rounded-3xl bg-[#0f5c39] shadow-[0_24px_60px_-20px_rgba(6,23,51,0.55)] ring-1 ring-navy/20">
      <PitchMarkings />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_55%_at_50%_0%,rgba(255,255,255,0.10),transparent_70%)]" />
      {formation && (
        <span className="absolute bottom-3 right-3 rounded-md bg-navy-dark/80 px-2.5 py-0.5 font-display text-lg tracking-wider text-cyan sm:text-xl">{formation}</span>
      )}
      {lines.map((line, i) => {
        // Goalkeeper near the bottom, the top line near the top.
        const top = rows === 1 ? 50 : 86 - (i * 72) / (rows - 1);
        return line.map((p, j) => {
          const left = ((j + 0.5) / line.length) * 84 + 8;
          return (
            <div key={p._id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${left}%`, top: `${top}%` }}>
              <Marker player={p} link={link} />
            </div>
          );
        });
      })}
    </div>
  );
}
