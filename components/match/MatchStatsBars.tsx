import { clsx } from "clsx";

export type StatPair = { eko: number | null; opponent: number | null };
export type MatchStats = {
  possession?: StatPair;
  shots?: StatPair;
  shotsOnTarget?: StatPair;
  corners?: StatPair;
  fouls?: StatPair;
  yellowCards?: StatPair;
  redCards?: StatPair;
};

const labels: Record<keyof MatchStats, string> = {
  possession: "Possession",
  shots: "Shots",
  shotsOnTarget: "Shots on target",
  corners: "Corners",
  fouls: "Fouls",
  yellowCards: "Yellow cards",
  redCards: "Red cards",
};

// Head-to-head bars. Eko United is always cyan, the opponent navy, and each
// number sits on its own team's side whichever team is at home.
export default function MatchStatsBars({ stats, isHome, home, away }: { stats: MatchStats; isHome: boolean; home: string; away: string }) {
  const rows = (Object.keys(labels) as (keyof MatchStats)[])
    .map((key) => ({ key, pair: stats[key] }))
    .filter((r): r is { key: keyof MatchStats; pair: StatPair } => Boolean(r.pair) && r.pair!.eko != null && r.pair!.opponent != null);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between font-display text-2xl uppercase tracking-wide text-navy sm:text-3xl">
        <span className={isHome ? "text-cyan" : ""}>{home}</span>
        <span className={!isHome ? "text-cyan" : ""}>{away}</span>
      </div>
      <div className="space-y-6">
        {rows.map(({ key, pair }) => {
          const homeValue = isHome ? (pair.eko as number) : (pair.opponent as number);
          const awayValue = isHome ? (pair.opponent as number) : (pair.eko as number);
          const total = homeValue + awayValue;
          const homePct = total === 0 ? 50 : Math.round((homeValue / total) * 100);
          const suffix = key === "possession" ? "%" : "";
          return (
            <div key={key}>
              <div className="mb-2 flex items-end justify-between">
                <span className={clsx("font-display text-4xl leading-none", isHome ? "text-navy" : "text-navy/60")}>
                  {homeValue}
                  {suffix}
                </span>
                <span className="pb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-navy/50">{labels[key]}</span>
                <span className={clsx("font-display text-4xl leading-none", !isHome ? "text-navy" : "text-navy/60")}>
                  {awayValue}
                  {suffix}
                </span>
              </div>
              <div className="flex h-3 gap-1 overflow-hidden rounded-full">
                <div className={clsx("rounded-l-full", isHome ? "bg-cyan" : "bg-navy/35")} style={{ width: `${homePct}%` }} />
                <div className={clsx("flex-1 rounded-r-full", !isHome ? "bg-cyan" : "bg-navy/35")} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
