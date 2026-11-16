// Putting a starting eleven in order and onto a pitch. Pure functions with no
// page or database code in them, shared by the public match page and the
// admin lineup picker so both always agree.

export type LineupPlayer = {
  _id: string;
  name: string;
  slug?: string;
  position?: string;
  squadNumber?: number;
  photoUrl?: string;
  photoCutout?: boolean;
};

// Where a player stands on the pitch, from the free-text position the club
// typed ("GK", "Left Back", "Defensive Midfielder", "Striker"...). `line` runs
// from the goalkeeper (0) up to the striker (6); `side` is left (-1), centre (0)
// or right (1) so a line can be laid out left to right.
export function playerRank(position?: string): { line: number; side: number } {
  const p = (position || "").toLowerCase();
  if (!p.trim()) return { line: 3, side: 0 };

  const left = /\bleft\b|\b(lb|lwb|lm|lw)\b/.test(p);
  const right = /\bright\b|\b(rb|rwb|rm|rw)\b/.test(p);
  const side = left ? -1 : right ? 1 : 0;

  if (/goal|keeper|\bgk\b/.test(p)) return { line: 0, side: 0 };
  // Wing backs sit between the defence and the midfield, so a back three with
  // wing backs fills out its midfield five.
  if (/wing.?back|\b(lwb|rwb)\b/.test(p)) return { line: 1.5, side };
  if (/mid|playmaker|\b(cm|dm|am|cdm|cam|lm|rm)\b/.test(p)) {
    if (/defensive|holding|\b(cdm|dm)\b/.test(p)) return { line: 2, side };
    if (/attacking|playmaker|\b(cam|am)\b/.test(p)) return { line: 4, side };
    return { line: 3, side };
  }
  if (/defen|back|sweeper|centre-half|center-half|\b(cb|lb|rb)\b/.test(p)) return { line: 1, side };
  if (/wing|\b(lw|rw)\b/.test(p)) return { line: 5, side };
  if (/second striker|\bss\b|shadow|inside forward/.test(p)) return { line: 5.5, side: 0 };
  if (/forward|striker|attack|\b(cf|st)\b/.test(p)) return { line: 6, side };
  return { line: 3, side: 0 };
}

export type PositionBand = "goalkeepers" | "defenders" | "midfielders" | "forwards";

export const bandLabels: Record<PositionBand, string> = {
  goalkeepers: "Goalkeeper",
  defenders: "Defenders",
  midfielders: "Midfielders",
  forwards: "Forwards",
};

export function bandOf(position?: string): PositionBand {
  const { line } = playerRank(position);
  if (line === 0) return "goalkeepers";
  if (line < 2) return "defenders";
  if (line < 5) return "midfielders";
  return "forwards";
}

const byNumber = (a: LineupPlayer, b: LineupPlayer) => (a.squadNumber ?? 999) - (b.squadNumber ?? 999) || a.name.localeCompare(b.name);

// Goalkeeper first, striker last; by squad number among equals.
export function sortByPosition(players: LineupPlayer[]): LineupPlayer[] {
  return [...players].sort((a, b) => {
    const ra = playerRank(a.position);
    const rb = playerRank(b.position);
    return ra.line - rb.line || ra.side - rb.side || byNumber(a, b);
  });
}

export const FORMATION_PRESETS = ["4-3-3", "4-4-2", "4-2-3-1", "3-5-2", "3-4-3", "5-3-2", "4-1-4-1", "4-5-1", "5-4-1"];

// "4-3-3" -> [4, 3, 3]. Only a real eleven counts: ten outfield players across
// three to five lines. Anything else (blank, "attacking", "4-3") gives null.
export function parseFormation(formation?: string): number[] | null {
  const parts = (formation || "")
    .trim()
    .split(/\s*[-–]\s*/)
    .map((n) => Number(n));
  if (parts.length < 3 || parts.length > 5) return null;
  if (parts.some((n) => !Number.isInteger(n) || n < 1 || n > 8)) return null;
  return parts.reduce((s, n) => s + n, 0) === 10 ? parts : null;
}

const leftToRight = (line: LineupPlayer[]) =>
  [...line].sort((a, b) => playerRank(a.position).side - playerRank(b.position).side || byNumber(a, b));

// The eleven as rows from the goalkeeper up to the forwards. With a valid
// formation and a full eleven that includes a goalkeeper, players are dealt
// into its lines in position order (a 4-2-3-1 gets four defenders, two holding
// midfielders, three attacking midfielders and one striker). Otherwise the rows
// follow the positions themselves. Returns [] when there is nobody to place.
export function arrangeLines(xi: LineupPlayer[], formation?: string): LineupPlayer[][] {
  if (xi.length === 0) return [];
  const sorted = sortByPosition(xi);
  const counts = parseFormation(formation);

  if (counts && xi.length === 11 && playerRank(sorted[0].position).line === 0) {
    const lines: LineupPlayer[][] = [[sorted[0]]];
    let at = 1;
    for (const n of counts) {
      lines.push(leftToRight(sorted.slice(at, at + n)));
      at += n;
    }
    return lines;
  }

  const bands: Record<PositionBand, LineupPlayer[]> = { goalkeepers: [], defenders: [], midfielders: [], forwards: [] };
  for (const p of sorted) bands[bandOf(p.position)].push(p);
  return (["goalkeepers", "defenders", "midfielders", "forwards"] as const)
    .map((b) => leftToRight(bands[b]))
    .filter((line) => line.length > 0);
}

// The surname for a shirt label: "Emeka Okafor" -> "Okafor".
export function shortName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 ? parts[parts.length - 1] : parts[0] || "";
}

// A match's competition text is typed as "Nigeria National League · Matchday 1".
// Split it into a short league tag and the matchday number for the headline.
export function parseCompetition(competition?: string): { league: string; matchday: number | null } {
  const raw = (competition || "").trim();
  const md = raw.match(/matchday\s*(\d+)/i);
  const league = raw.replace(/\s*[·|,\-–]?\s*matchday\s*\d+/i, "").trim();
  return {
    league: /nigeria national league/i.test(league) ? "NNL" : league || "Friendly",
    matchday: md ? Number(md[1]) : null,
  };
}
