"use client";

import { useState } from "react";
import Image from "next/image";
import { clsx } from "clsx";
import LineupPitch from "@/components/match/LineupPitch";
import { isAllowedImageUrl } from "@/lib/imageHosts";
import { playerPhotoUrl } from "@/lib/squad";
import { FORMATION_PRESETS, arrangeLines, bandLabels, bandOf, parseFormation, playerRank, sortByPosition, type LineupPlayer, type PositionBand } from "@/lib/lineup";

const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-wide text-navy/50";
const MAX_XI = 11;

function Thumb({ p }: { p: LineupPlayer }) {
  const src = isAllowedImageUrl(p.photoUrl) ? playerPhotoUrl(p.photoUrl, p.photoCutout) : undefined;
  return (
    <span className="relative block h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gradient-to-b from-cyan/60 to-navy">
      {src ? (
        <Image src={src} alt="" fill sizes="40px" className="object-cover object-top" />
      ) : (
        <span className="flex h-full w-full items-center justify-center font-display text-lg text-white">{p.squadNumber ?? p.name.charAt(0)}</span>
      )}
    </span>
  );
}

// Choose the formation and the starting eleven; everybody else in the squad
// becomes a substitute on their own (untick anyone who is not in the matchday
// squad). A live pitch shows what the public page will draw.
export default function LineupPicker({
  squad,
  formation,
  onFormation,
  lineup,
  onLineup,
  leftOut,
  onLeftOut,
}: {
  squad: LineupPlayer[];
  formation: string;
  onFormation: (f: string) => void;
  lineup: string[];
  onLineup: (ids: string[]) => void;
  leftOut: string[];
  onLeftOut: (ids: string[]) => void;
}) {
  const [note, setNote] = useState("");

  const byId = new Map(squad.map((p) => [p._id, p]));
  const xi = lineup.map((id) => byId.get(id)).filter((p): p is LineupPlayer => Boolean(p));
  const rest = sortByPosition(squad.filter((p) => !lineup.includes(p._id)));
  const bench = rest.filter((p) => !leftOut.includes(p._id));
  const counts = parseFormation(formation);
  const lines = arrangeLines(xi, formation);
  const hasGk = xi.some((p) => playerRank(p.position).line === 0);

  function toggleXi(id: string) {
    setNote("");
    if (lineup.includes(id)) return onLineup(lineup.filter((x) => x !== id));
    if (lineup.length >= MAX_XI) return setNote("The starting eleven is full. Tap a selected player to swap them out.");
    onLineup([...lineup, id]);
  }

  function toggleBench(id: string) {
    onLeftOut(leftOut.includes(id) ? leftOut.filter((x) => x !== id) : [...leftOut, id]);
  }

  const groups = (["goalkeepers", "defenders", "midfielders", "forwards"] as PositionBand[])
    .map((band) => ({ band, players: sortByPosition(squad.filter((p) => bandOf(p.position) === band)) }))
    .filter((g) => g.players.length > 0);

  return (
    <div className="space-y-8">
      {/* Formation */}
      <div>
        <span className={labelClass}>Formation</span>
        <div className="flex flex-wrap gap-2">
          {FORMATION_PRESETS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => onFormation(formation === f ? "" : f)}
              aria-pressed={formation === f}
              className={clsx(
                "rounded-lg px-4 py-2 font-display text-xl leading-none tracking-wider transition-colors duration-200 ease-smooth",
                formation === f ? "bg-navy text-cyan" : "bg-navy/[0.06] text-navy/70 hover:bg-navy/15"
              )}
            >
              {f}
            </button>
          ))}
          <input
            value={FORMATION_PRESETS.includes(formation) ? "" : formation}
            onChange={(e) => onFormation(e.target.value)}
            placeholder="Other, e.g. 3-4-2-1"
            aria-label="Custom formation"
            className="w-44 rounded-lg border border-navy/15 bg-transparent px-3 py-2 text-sm text-navy outline-none placeholder:text-navy/30 focus:border-cyan"
          />
        </div>
        <p className="mt-2 text-xs text-navy/45">With a formation and all eleven players picked, the match page draws them on a pitch.</p>
      </div>

      {/* Starting XI */}
      <div>
        <div className="mb-3 flex items-baseline justify-between">
          <span className="text-sm font-bold uppercase tracking-wide text-navy">Starting XI</span>
          <span className={clsx("font-display text-3xl leading-none", lineup.length === MAX_XI ? "text-cyan" : "text-navy")}>
            {lineup.length} <span className="text-lg text-navy/40">/ {MAX_XI}</span>
          </span>
        </div>
        {note && <p className="mb-3 rounded-lg bg-yellow/25 px-3 py-2 text-sm text-navy">{note}</p>}
        {xi.length > 0 && !hasGk && <p className="mb-3 text-xs text-red-500">No goalkeeper picked yet.</p>}
        <div className="space-y-5">
          {groups.map(({ band, players }) => (
            <div key={band}>
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-navy/40">{bandLabels[band]}</p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {players.map((p) => {
                  const on = lineup.includes(p._id);
                  return (
                    <li key={p._id}>
                      <button
                        type="button"
                        onClick={() => toggleXi(p._id)}
                        aria-pressed={on}
                        className={clsx(
                          "flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors duration-200 ease-smooth",
                          on ? "border-cyan bg-cyan/10" : "border-navy/10 hover:border-navy/30"
                        )}
                      >
                        <Thumb p={p} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-navy">
                            {p.squadNumber != null && <span className="mr-1.5 text-navy/40">#{p.squadNumber}</span>}
                            {p.name}
                          </span>
                          <span className="block truncate text-xs text-navy/45">{p.position || "No position set"}</span>
                        </span>
                        <span
                          aria-hidden
                          className={clsx(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                            on ? "border-cyan bg-cyan text-navy-dark" : "border-navy/20 text-transparent"
                          )}
                        >
                          ✓
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Substitutes: the rest, automatically */}
      <div>
        <div className="mb-1 flex items-baseline justify-between">
          <span className="text-sm font-bold uppercase tracking-wide text-navy">Substitutes</span>
          <span className="font-display text-3xl leading-none text-navy">{bench.length}</span>
        </div>
        <p className="mb-3 text-xs text-navy/45">
          Everyone not in the starting eleven is added as a substitute automatically, listed from goalkeeper to forward. Untick anyone who is
          not in the matchday squad (injured or not travelling).
        </p>
        {rest.length === 0 ? (
          <p className="text-sm text-navy/40">No one left in the squad.</p>
        ) : (
          <ul className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
            {rest.map((p) => (
              <li key={p._id}>
                <label className="flex cursor-pointer items-center gap-3 py-1.5 text-sm text-navy">
                  <input type="checkbox" checked={!leftOut.includes(p._id)} onChange={() => toggleBench(p._id)} className="h-4 w-4 shrink-0 accent-navy" />
                  <span className={clsx("truncate", leftOut.includes(p._id) && "text-navy/35 line-through")}>
                    {p.squadNumber != null && <span className="text-navy/40">#{p.squadNumber} </span>}
                    {p.name}
                    {p.position && <span className="text-navy/40"> · {p.position}</span>}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Preview */}
      <div>
        <span className={labelClass}>Preview</span>
        {counts && xi.length === MAX_XI && lines.length >= 4 ? (
          <LineupPitch lines={lines} formation={formation} link={false} />
        ) : (
          <p className="rounded-xl border border-dashed border-navy/15 px-4 py-6 text-center text-sm text-navy/45">
            Pick a formation and all eleven players to see them on the pitch.
          </p>
        )}
      </div>
    </div>
  );
}
