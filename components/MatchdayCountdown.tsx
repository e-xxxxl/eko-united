"use client";

import { useEffect, useState } from "react";

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

// A colon-separated pair of dots between each digit box, matching a real
// digital clock's ":" rather than a plain gap, subtly pulsing so the whole
// thing reads as "live" even before the seconds box below it visibly ticks.
function ClockColon() {
  return (
    <div className="flex flex-col items-center justify-center gap-1 self-stretch py-2" aria-hidden>
      <span className="h-1 w-1 animate-pulse rounded-full bg-cyan/70" />
      <span className="h-1 w-1 animate-pulse rounded-full bg-cyan/70" />
    </div>
  );
}

// Client-only ticking countdown to kickoff. Starts with `null` (not a
// Date.now()-derived value) so the server-rendered HTML and the client's
// first render pass produce identical markup — computing the real time in
// useEffect, which only runs after hydration, avoids a hydration mismatch
// (the server and client would otherwise compute the countdown at two
// different instants and disagree on the seconds digit).
export default function MatchdayCountdown({ kickoffIso }: { kickoffIso: string }) {
  const [time, setTime] = useState<TimeParts | null>(null);

  useEffect(() => {
    const target = new Date(kickoffIso);
    setTime(getTimeParts(target));
    const interval = setInterval(() => setTime(getTimeParts(target)), 1000);
    return () => clearInterval(interval);
  }, [kickoffIso]);

  const units = [
    { label: "Days", value: time?.days },
    { label: "Hrs", value: time?.hours },
    { label: "Min", value: time?.minutes },
    { label: "Sec", value: time?.seconds },
  ];

  if (time?.isPast) {
    return <p className="text-sm font-semibold text-cyan">Kickoff!</p>;
  }

  return (
    <div
      className="flex items-stretch justify-center gap-1 rounded-2xl border border-white/10 bg-black/20 px-2 py-2.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] sm:gap-1.5 sm:px-3"
      role="timer"
      aria-live="off"
    >
      {units.map((u, i) => (
        <div key={u.label} className="flex items-stretch">
          {i > 0 && <ClockColon />}
          <div className="flex w-11 flex-col items-center rounded-lg bg-white/[0.06] px-1 py-1.5 sm:w-14 sm:py-2">
            <span className="font-display tabular-nums text-2xl leading-none text-cyan sm:text-3xl">
              {u.value === undefined ? "--" : String(u.value).padStart(2, "0")}
            </span>
            <span className="mt-1 text-[9px] font-semibold uppercase tracking-widest text-white/50 sm:text-[10px]">
              {u.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
