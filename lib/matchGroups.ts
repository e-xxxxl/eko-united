// Splits an already ordered list of matches into runs by month, keeping the
// order: [{ label: "November 2026", items: [...] }, ...].
export function groupByMonth<T extends { kickoff: string }>(matches: T[]): { label: string; items: T[] }[] {
  const groups: { label: string; items: T[] }[] = [];
  for (const m of matches) {
    const label = new Date(m.kickoff).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "Africa/Lagos" });
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(m);
    else groups.push({ label, items: [m] });
  }
  return groups;
}
