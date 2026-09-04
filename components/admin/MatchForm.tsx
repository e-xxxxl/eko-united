"use client";

import { useState, type FormEvent } from "react";

export type MatchFormValues = {
  opponent: string;
  competition: string;
  venue: string;
  kickoff: string; // datetime-local input value, converted to ISO on save
  isHome: boolean;
  status: "upcoming" | "live" | "finished" | "postponed";
  score: { eko: number | null; opponent: number | null };
  summary: string;
};

const fieldClass =
  "w-full border-b border-navy/20 bg-transparent px-1 py-3 text-sm text-navy outline-none transition-colors duration-200 ease-smooth placeholder:text-navy/30 focus:border-cyan";
const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-wide text-navy/50";

// Match lineup/events (who played, goals/cards by minute) aren't editable
// here yet — this covers the fields that actually drive the public
// Fixtures/Results pages and the homepage countdown. Flagged as a known gap,
// not an oversight.
export default function MatchForm({
  initial,
  onSave,
  saving,
  error,
}: {
  initial?: Partial<MatchFormValues>;
  onSave: (values: MatchFormValues) => void;
  saving: boolean;
  error: string;
}) {
  const [isHome, setIsHome] = useState(initial?.isHome ?? true);
  const [status, setStatus] = useState<MatchFormValues["status"]>(initial?.status || "upcoming");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const kickoffLocal = String(data.get("kickoff") || "");
    const score = (key: "eko" | "opponent") => {
      const raw = data.get(`score_${key}`);
      return raw === "" || raw === null ? null : Number(raw);
    };
    onSave({
      opponent: String(data.get("opponent") || ""),
      competition: String(data.get("competition") || ""),
      venue: String(data.get("venue") || ""),
      kickoff: kickoffLocal ? new Date(kickoffLocal).toISOString() : "",
      isHome,
      status,
      score: { eko: score("eko"), opponent: score("opponent") },
      summary: String(data.get("summary") || ""),
    });
  }

  // datetime-local wants "YYYY-MM-DDTHH:mm" in local time, not a raw ISO string
  const kickoffLocalValue = initial?.kickoff
    ? new Date(initial.kickoff).toISOString().slice(0, 16)
    : undefined;

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
      <div>
        <label htmlFor="opponent" className={labelClass}>
          Opponent
        </label>
        <input id="opponent" name="opponent" required defaultValue={initial?.opponent} className={fieldClass} />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <label htmlFor="competition" className={labelClass}>
            Competition
          </label>
          <input id="competition" name="competition" defaultValue={initial?.competition} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="venue" className={labelClass}>
            Venue
          </label>
          <input id="venue" name="venue" defaultValue={initial?.venue} className={fieldClass} />
        </div>
      </div>

      <div>
        <label htmlFor="kickoff" className={labelClass}>
          Kickoff
        </label>
        <input
          id="kickoff"
          name="kickoff"
          type="datetime-local"
          required
          defaultValue={kickoffLocalValue}
          className={fieldClass}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-navy">
        <input type="checkbox" checked={isHome} onChange={(e) => setIsHome(e.target.checked)} className="h-4 w-4" />
        Home fixture
      </label>

      <div>
        <span className={labelClass}>Status</span>
        <div className="flex flex-wrap gap-2">
          {(["upcoming", "live", "finished", "postponed"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors duration-200 ease-smooth ${
                status === s
                  ? "border-cyan bg-cyan/10 text-navy"
                  : "border-navy/15 text-navy/50 hover:border-navy/30"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {status === "finished" && (
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label htmlFor="score_eko" className={labelClass}>
              Eko United score
            </label>
            <input
              id="score_eko"
              name="score_eko"
              type="number"
              min={0}
              defaultValue={initial?.score?.eko ?? undefined}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="score_opponent" className={labelClass}>
              Opponent score
            </label>
            <input
              id="score_opponent"
              name="score_opponent"
              type="number"
              min={0}
              defaultValue={initial?.score?.opponent ?? undefined}
              className={fieldClass}
            />
          </div>
        </div>
      )}

      <div>
        <label htmlFor="summary" className={labelClass}>
          Summary (optional)
        </label>
        <textarea id="summary" name="summary" rows={3} defaultValue={initial?.summary} className={fieldClass} />
      </div>

      {error && (
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-yellow px-8 py-3 text-sm font-bold uppercase tracking-wide text-navy-dark transition-transform duration-300 ease-smooth hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
      >
        {saving ? "Saving…" : "Save match"}
      </button>
    </form>
  );
}
