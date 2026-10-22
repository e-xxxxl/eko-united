import Image from "next/image";
import { clsx } from "clsx";
import type { DemoStanding } from "@/lib/demoData";

// One league table for the whole site: the homepage slice and the full
// /table page both render through this, so they never drift apart.
//
// It is a real <table> (screen readers get proper row and column headers),
// restyled as a stack of floating rows. On a phone only what matters stays on
// screen (position, club, played, goal difference, points) and the club's
// W-D-L record drops under its name, so nothing scrolls sideways and no
// club name is ever clipped. Wider screens bring back the full set of columns.
// Eko United's row is the one solid navy bar with the single yellow accent.

type Variant = "full" | "preview";

function Crest({ name, logoUrl, eko }: { name: string; logoUrl?: string; eko: boolean }) {
  const size = "h-7 w-7 sm:h-9 sm:w-9";
  if (logoUrl) {
    return (
      <span className={clsx("flex shrink-0 items-center justify-center", size)}>
        <Image src={logoUrl} alt="" width={36} height={36} className="h-full w-full object-contain" />
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className={clsx(
        "flex shrink-0 items-center justify-center rounded-full font-display text-sm tracking-wide",
        size,
        eko ? "bg-white/15 text-white" : "bg-navy/10 text-navy/60"
      )}
    >
      {name.replace(/[^A-Za-z ]/g, "").trim().slice(0, 2).toUpperCase()}
    </span>
  );
}

function signed(n: number) {
  return n > 0 ? `+${n}` : String(n);
}

export default function LeagueTable({
  rows,
  maxPoints,
  variant = "full",
}: {
  rows: DemoStanding[];
  maxPoints?: number;
  variant?: Variant;
}) {
  const full = variant === "full";
  const top = Math.max(maxPoints ?? 0, ...rows.map((r) => r.points), 1);

  // Columns that only appear once there is room. In the homepage preview the
  // table sits in a half-width column at lg, so the extras come back at xl.
  const showWdl = full ? "hidden sm:table-cell" : "hidden sm:table-cell lg:hidden xl:table-cell";
  const showRecordLine = full ? "sm:hidden" : "sm:hidden lg:block xl:hidden";
  const showGoals = "hidden md:table-cell";

  const head = "pb-1 text-[10px] font-semibold uppercase tracking-[0.16em]";
  const muted = "text-navy/40";

  return (
    <table className="w-full border-separate border-spacing-y-1.5 text-sm tabular-nums">
      <caption className="sr-only">League table, ranked by points</caption>
      <thead>
        <tr>
          <th scope="col" className={clsx(head, muted, "w-9 pl-2.5 text-left sm:w-16 sm:pl-5")}>
            <span className="sr-only">Position</span>
            <span aria-hidden>Pos</span>
          </th>
          <th scope="col" className={clsx(head, muted, "px-1.5 text-left sm:px-2")}>
            Club
          </th>
          <th scope="col" title="Played" className={clsx(head, muted, "w-7 text-center sm:w-10")}>
            P
          </th>
          <th scope="col" title="Won" className={clsx(head, muted, "w-9 text-center", showWdl)}>
            W
          </th>
          <th scope="col" title="Drawn" className={clsx(head, muted, "w-9 text-center", showWdl)}>
            D
          </th>
          <th scope="col" title="Lost" className={clsx(head, muted, "w-9 text-center", showWdl)}>
            L
          </th>
          {full && (
            <>
              <th scope="col" title="Goals for" className={clsx(head, muted, "w-10 text-center", showGoals)}>
                GF
              </th>
              <th scope="col" title="Goals against" className={clsx(head, muted, "w-10 text-center", showGoals)}>
                GA
              </th>
            </>
          )}
          <th scope="col" title="Goal difference" className={clsx(head, muted, "w-9 text-center sm:w-12")}>
            GD
          </th>
          <th scope="col" title="Points" className={clsx(head, "w-12 pr-2.5 text-center text-navy sm:w-20 sm:pr-5")}>
            Pts
          </th>
        </tr>
      </thead>
      <tbody data-reveal-stagger>
        {rows.map((row) => {
          const eko = row.isEkoUnited;
          const leading = row.position <= 3;
          const surface = eko ? "bg-navy-dark" : "bg-navy/[0.04] transition-colors duration-300 ease-smooth group-hover:bg-navy/[0.08]";
          const num = eko ? "text-white/80" : "text-navy/60";
          const cell = clsx("py-2.5 sm:py-3", surface, num);
          const center = "text-center";
          const pct = Math.round((row.points / top) * 100);

          return (
            <tr key={row._id} className="group">
              <td className={clsx(cell, "rounded-l-xl pl-2.5 sm:pl-5")}>
                <span
                  className={clsx(
                    "inline-flex h-6 w-6 items-center justify-center rounded-lg font-display text-base leading-none sm:h-8 sm:w-8 sm:text-xl",
                    eko ? "bg-white text-navy-dark" : leading ? "bg-cyan/30 text-navy" : "text-navy/50"
                  )}
                >
                  {row.position}
                </span>
              </td>

              <td className={clsx(cell, "max-w-0 px-1.5 sm:px-2")}>
                <div className="flex items-center gap-2 sm:gap-3">
                  <Crest name={row.clubName} logoUrl={row.clubLogoUrl} eko={eko} />
                  <div className="min-w-0 flex-1">
                    <p
                      className={clsx(
                        "truncate font-display text-[17px] leading-tight tracking-wide sm:text-xl",
                        eko ? "text-white" : "text-navy"
                      )}
                    >
                      {row.clubName}
                    </p>
                    <p className={clsx("mt-0.5 text-[11px] leading-none", showRecordLine, eko ? "text-white/55" : "text-navy/45")}>
                      {row.won}W · {row.drawn}D · {row.lost}L
                    </p>
                    <div
                      aria-hidden
                      className={clsx(
                        "mt-1.5 h-[3px] w-full max-w-[9rem] overflow-hidden rounded-full",
                        eko ? "bg-white/15" : "bg-navy/10"
                      )}
                    >
                      <div
                        className={clsx("h-full rounded-full", eko ? "bg-cyan" : "bg-navy/45")}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </td>

              <td className={clsx(cell, center)}>{row.played}</td>
              <td className={clsx(cell, center, showWdl)}>{row.won}</td>
              <td className={clsx(cell, center, showWdl)}>{row.drawn}</td>
              <td className={clsx(cell, center, showWdl)}>{row.lost}</td>
              {full && (
                <>
                  <td className={clsx(cell, center, showGoals)}>{row.goalsFor ?? "-"}</td>
                  <td className={clsx(cell, center, showGoals)}>{row.goalsAgainst ?? "-"}</td>
                </>
              )}
              <td className={clsx(cell, center, "font-semibold", row.goalDifference < 0 && "font-normal opacity-80")}>
                {signed(row.goalDifference)}
              </td>

              <td className={clsx(cell, center, "rounded-r-xl pr-2.5 sm:pr-5")}>
                <span
                  className={clsx(
                    "inline-flex min-w-[2.25rem] items-center justify-center rounded-lg px-1.5 py-1 font-display text-xl leading-none sm:min-w-[3rem] sm:px-2 sm:text-2xl",
                    eko ? "bg-yellow text-navy-dark" : "bg-navy/[0.09] text-navy"
                  )}
                >
                  {row.points}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
