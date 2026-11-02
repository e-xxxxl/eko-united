import { API_URL } from "@/lib/api";

export type MatchOption = { _id: string; opponent: string; kickoff: string; isHome: boolean };

// The match list for the ticket screens. This reads the public matches
// endpoint, not /api/admin/matches: that one is limited to content editors, and
// the people who set up tickets (the ticket manager) do not have that access.
// Pass { homeOnly: true } for anything that creates or picks tickets: tickets
// are only sold for home matches.
export async function fetchMatchOptions({ homeOnly = false }: { homeOnly?: boolean } = {}): Promise<MatchOption[]> {
  try {
    const res = await fetch(`${API_URL}/matches`);
    if (!res.ok) return [];
    const all = (await res.json()) as MatchOption[];
    return Array.isArray(all)
      ? all.filter((m) => m.opponent && (!homeOnly || m.isHome)).sort((a, b) => a.kickoff.localeCompare(b.kickoff))
      : [];
  } catch {
    return [];
  }
}
