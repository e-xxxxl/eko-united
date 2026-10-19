"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";

type TimeParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
};

function getTimeParts(target: Date): TimeParts {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    isPast: diff <= 0,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

// One split-flap style card. The digits animate in whenever their value
// changes (keyed on the value, so only the unit that actually ticked moves),
// and the card carries its own label. Font sizes use `cqw` (1% of the
// countdown's own width, see the container on the root below) rather than
// viewport units, so the same component scales correctly whether it sits in
// the full-width homepage band, a narrow phone column or the fixture header.
function TimeCard({
  label,
  text,
  accent,
  compact,
  progress,
}: {
  label: string;
  text: string;
  accent?: boolean;
  compact?: boolean;
  progress?: { fraction: number; animate: boolean };
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.13] to-white/[0.04] px-1 pb-2 pt-3 text-center shadow-[0_10px_28px_-14px_rgba(0,0,0,0.7)] sm:rounded-2xl sm:pb-3 sm:pt-4">
      <div className="relative">
        <span
          key={text}
          className={clsx(
            "block animate-digit-in font-display tabular-nums leading-none",
            // text-3xl is the fallback for browsers without container units.
            compact
              ? "text-3xl text-[clamp(1.25rem,11cqw,3.25rem)]"
              : "text-3xl text-[clamp(1.5rem,14cqw,4.5rem)]",
            accent ? "text-cyan" : "text-white"
          )}
        >
          {text}
        </span>
        {/* The split-flap seam, with a notch at each end. */}
        <span className="pointer-events-none absolute inset-x-[-4px] top-1/2 h-px bg-black/50" aria-hidden />
        <span className="pointer-events-none absolute -left-1 top-1/2 h-1.5 w-1 -translate-y-1/2 rounded-full bg-navy-dark" aria-hidden />
        <span className="pointer-events-none absolute -right-1 top-1/2 h-1.5 w-1 -translate-y-1/2 rounded-full bg-navy-dark" aria-hidden />
      </div>
      <span className="mt-2 block text-[9px] font-semibold uppercase tracking-[0.14em] text-white/55 sm:mt-3 sm:text-[11px] sm:tracking-[0.2em]">
        {label}
      </span>
      {progress && (
        <span
          className={clsx(
            "absolute inset-x-0 bottom-0 h-[3px] origin-left bg-cyan",
            progress.animate && "transition-transform duration-1000 ease-linear"
          )}
          style={{ transform: `scaleX(${progress.fraction})` }}
          aria-hidden
        />
      )}
    </div>
  );
}

// Client-only ticking countdown to kickoff. Starts with `null` (not a
// Date.now()-derived value) so the server-rendered HTML and the client's
// first render pass produce identical markup: computing the real time in
// useEffect, which only runs after hydration, avoids a hydration mismatch
// (the server and client would otherwise compute the countdown at two
// different instants and disagree on the seconds digit).
//
// `size="lg"` is for the homepage band, where there's room for bigger cards.
// The root is a size container with an explicit width (capped at the parent's
// width) so it also behaves when dropped into a shrink-wrapped flex column.
export default function MatchdayCountdown({
  kickoffIso,
  size = "md",
  className,
}: {
  kickoffIso: string;
  size?: "md" | "lg";
  className?: string;
}) {
  const [time, setTime] = useState<TimeParts | null>(null);

  useEffect(() => {
    const target = new Date(kickoffIso);
    setTime(getTimeParts(target));
    const interval = setInterval(() => setTime(getTimeParts(target)), 1000);
    return () => clearInterval(interval);
  }, [kickoffIso]);

  if (time?.isPast) {
    return (
      <div className={clsx("mx-auto flex items-center justify-center gap-2", className)} role="timer">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan/60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan" />
        </span>
        <span className="font-display text-2xl tracking-wide text-cyan">Kickoff!</span>
      </div>
    );
  }

  const isMatchday = time !== null && time.days === 0;
  const threeDigitDays = time !== null && time.days >= 100;

  return (
    <div
      role="timer"
      aria-live="off"
      aria-label={
        time
          ? `Kickoff in ${time.days} days, ${time.hours} hours, ${time.minutes} minutes and ${time.seconds} seconds`
          : "Countdown to kickoff"
      }
      className={clsx(
        "mx-auto w-[22rem] max-w-full [container-type:inline-size]",
        size === "lg" && "sm:w-[36rem]",
        className
      )}
    >
      <div className="mb-3 flex items-center justify-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-cyan sm:mb-4">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan/60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan" />
        </span>
        {isMatchday ? "Matchday · Kickoff in" : "Kickoff in"}
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        <TimeCard
          label="Days"
          text={time ? String(time.days).padStart(2, "0") : "--"}
          compact={threeDigitDays}
        />
        <TimeCard label="Hours" text={time ? pad(time.hours) : "--"} />
        <TimeCard label="Minutes" text={time ? pad(time.minutes) : "--"} />
        <TimeCard
          label="Seconds"
          text={time ? pad(time.seconds) : "--"}
          accent
          progress={
            time
              ? // Drains over each minute; no transition on the wrap back to
                // full, or it would visibly sweep up instead of resetting.
                { fraction: time.seconds / 59, animate: time.seconds !== 59 }
              : undefined
          }
        />
      </div>
    </div>
  );
}
