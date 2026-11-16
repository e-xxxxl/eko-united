import { clsx } from "clsx";

export type MatchEvent = { minute?: number; type?: string; player?: string; detail?: string };

const labels: Record<string, string> = {
  goal: "Goal",
  yellow_card: "Yellow card",
  red_card: "Red card",
  substitution: "Substitution",
};

function EventIcon({ type }: { type?: string }) {
  if (type === "yellow_card") return <span aria-hidden className="block h-5 w-3.5 rounded-[3px] bg-yellow shadow" />;
  if (type === "red_card") return <span aria-hidden className="block h-5 w-3.5 rounded-[3px] bg-red-600 shadow" />;
  if (type === "substitution") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M7 4v14M3.5 14.5 7 18l3.5-3.5M17 20V6M13.5 9.5 17 6l3.5 3.5" />
      </svg>
    );
  }
  // goal (and anything unknown): a ball
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="m12 8.2 3.3 2.4-1.3 3.9h-4l-1.3-3.9L12 8.2ZM12 8.2V3.2M15.3 10.6l4.7-1.6M14 14.5l2.9 4M10 14.5l-2.9 4M8.7 10.6 4 9" />
    </svg>
  );
}

// Goals and cards down a vertical line, in the order they happened.
export default function MatchTimeline({ events }: { events: MatchEvent[] }) {
  const ordered = events.every((e) => typeof e.minute === "number")
    ? [...events].sort((a, b) => (a.minute as number) - (b.minute as number))
    : events;
  return (
    <ol className="relative space-y-4 before:absolute before:bottom-2 before:left-[2.35rem] before:top-2 before:w-px before:bg-navy/15 sm:before:left-[2.6rem]">
      {ordered.map((e, i) => {
        const goal = e.type === "goal";
        return (
          <li key={i} className="relative flex items-center gap-4">
            <span className="w-10 shrink-0 text-right font-display text-2xl leading-none text-navy sm:w-11 sm:text-3xl">
              {typeof e.minute === "number" ? `${e.minute}'` : ""}
            </span>
            <span
              className={clsx(
                "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-4 ring-white",
                goal ? "bg-cyan text-navy-dark" : "bg-navy/10 text-navy"
              )}
            >
              <EventIcon type={e.type} />
            </span>
            <div className="min-w-0">
              <p className="truncate font-display text-2xl leading-tight text-navy">{e.player || (e.type ? labels[e.type] || e.type : "")}</p>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-navy/45">
                {e.type ? labels[e.type] || e.type : ""}
                {e.detail ? ` · ${e.detail}` : ""}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
