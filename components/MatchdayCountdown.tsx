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
    <div className="flex gap-4" role="timer" aria-live="off">
      {units.map((u) => (
        <div key={u.label} className="text-center">
          <span className="font-display block text-3xl tabular-nums text-cyan sm:text-4xl">
            {u.value === undefined ? "--" : String(u.value).padStart(2, "0")}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white/50">
            {u.label}
          </span>
        </div>
      ))}
    </div>
  );
}
