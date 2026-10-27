import type { DemoPlayer } from "@/lib/demoData";

// Squad ordering and photo helpers shared by the /team page, the homepage
// squad strip and the player page.

export type PositionGroup = "goalkeepers" | "defenders" | "midfielders" | "forwards" | "other";

export const groupMeta: Record<PositionGroup, { label: string; singular: string }> = {
  goalkeepers: { label: "Goalkeepers", singular: "Goalkeeper" },
  defenders: { label: "Defenders", singular: "Defender" },
  midfielders: { label: "Midfielders", singular: "Midfielder" },
  forwards: { label: "Forwards", singular: "Forward" },
  other: { label: "Squad", singular: "Player" },
};

export const groupOrder: PositionGroup[] = ["goalkeepers", "defenders", "midfielders", "forwards", "other"];

// Positions are typed freely in the admin ("GK", "Centre Back", "Left Wing
// Back", "Attacking Midfielder", "Striker"...), so the group is worked out
// from keywords. Midfield is checked before defence and attack so that
// "Defensive Midfielder" and "Attacking Midfielder" land in midfield.
export function positionGroup(position?: string): PositionGroup {
  const p = (position || "").toLowerCase();
  if (!p.trim()) return "other";
  if (/goal|keeper|\bgk\b/.test(p)) return "goalkeepers";
  if (/mid|playmaker|\b(cm|dm|am|cdm|cam)\b/.test(p)) return "midfielders";
  if (/defen|back|sweeper|centre-half|center-half|\b(cb|lb|rb|lwb|rwb)\b/.test(p)) return "defenders";
  if (/forward|striker|wing|attack|\b(cf|st|lw|rw|ss)\b/.test(p)) return "forwards";
  return "other";
}

const byNumber = (a: DemoPlayer, b: DemoPlayer) => (a.squadNumber ?? 999) - (b.squadNumber ?? 999) || a.name.localeCompare(b.name);

// Goalkeepers, then defenders, midfielders, forwards; by squad number within each.
export function sortSquad(players: DemoPlayer[]): DemoPlayer[] {
  return [...players].sort(
    (a, b) => groupOrder.indexOf(positionGroup(a.position)) - groupOrder.indexOf(positionGroup(b.position)) || byNumber(a, b)
  );
}

export function groupSquad(players: DemoPlayer[]): { group: PositionGroup; players: DemoPlayer[] }[] {
  return groupOrder
    .map((group) => ({ group, players: players.filter((p) => positionGroup(p.position) === group).sort(byNumber) }))
    .filter((g) => g.players.length > 0);
}

// With "remove background" switched on for a player, Cloudinary's AI cuts the
// person out of the photo as a transparent PNG (capped at 1400px wide). Only
// applies to Cloudinary-hosted photos; anything else is returned untouched.
export function playerPhotoUrl(url: string | undefined, cutout?: boolean): string | undefined {
  if (!url) return url;
  if (!cutout || !url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  return url.replace("/upload/", "/upload/e_background_removal/c_limit,w_1400/f_png/");
}
