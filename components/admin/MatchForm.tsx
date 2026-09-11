"use client";

import { useEffect, useState, type FormEvent } from "react";
import CloudinaryUpload from "@/components/admin/CloudinaryUpload";
import { adminFetch } from "@/lib/adminApi";

type StatPair = { eko: number | null; opponent: number | null };

// The on-the-wire shape (matches the backend Match model's eventSchema
// exactly): this is what `initial.events` arrives as from the server and
// what gets sent back on save.
export type MatchEventValue = {
  minute?: number;
  type: "goal" | "yellow_card" | "red_card" | "substitution";
  player?: string;
  detail?: string;
};

// Editing-only shape: every field is a plain string so a half-typed number
// input (or an empty one) never fights the DOM's controlled-input value.
// Converted to/from MatchEventValue at load and at submit time.
type EventDraft = {
  minute: string;
  type: MatchEventValue["type"];
  player: string;
  detail: string;
};

export type MatchFormValues = {
  opponent: string;
  opponentLogoUrl: string;
  competition: string;
  venue: string;
  kickoff: string; // datetime-local input value, converted to ISO on save
  isHome: boolean;
  status: "upcoming" | "live" | "finished" | "postponed";
  score: { eko: number | null; opponent: number | null };
  preview: string;
  formation: string;
  lineup: string[]; // Player ids, starting XI
  substitutes: string[]; // Player ids
  events: MatchEventValue[];
  stats: {
    possession: StatPair;
    shots: StatPair;
    shotsOnTarget: StatPair;
    corners: StatPair;
    fouls: StatPair;
    yellowCards: StatPair;
    redCards: StatPair;
  };
  summary: string;
};

type SquadPlayer = { _id: string; name: string; squadNumber?: number; position?: string; role: string };

const fieldClass =
  "w-full border-b border-navy/20 bg-transparent px-1 py-3 text-sm text-navy outline-none transition-colors duration-200 ease-smooth placeholder:text-navy/30 focus:border-cyan";
const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-wide text-navy/50";
const sectionLabelClass = "mb-3 text-sm font-bold uppercase tracking-wide text-navy";
const statKeys = ["possession", "shots", "shotsOnTarget", "corners", "fouls", "yellowCards", "redCards"] as const;
const statLabels: Record<(typeof statKeys)[number], string> = {
  possession: "Possession (%)",
  shots: "Shots",
  shotsOnTarget: "Shots on target",
  corners: "Corners",
  fouls: "Fouls",
  yellowCards: "Yellow cards",
  redCards: "Red cards",
};
const eventTypeLabels: Record<MatchEventValue["type"], string> = {
  goal: "⚽ Goal",
  yellow_card: "🟨 Yellow card",
  red_card: "🟥 Red card",
  substitution: "🔄 Substitution",
};

const emptyStats = (): MatchFormValues["stats"] => ({
  possession: { eko: null, opponent: null },
  shots: { eko: null, opponent: null },
  shotsOnTarget: { eko: null, opponent: null },
  corners: { eko: null, opponent: null },
  fouls: { eko: null, opponent: null },
  yellowCards: { eko: null, opponent: null },
  redCards: { eko: null, opponent: null },
});

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
  const [opponentLogoUrl, setOpponentLogoUrl] = useState(initial?.opponentLogoUrl || "");
  const [lineup, setLineup] = useState<string[]>(initial?.lineup || []);
  const [substitutes, setSubstitutes] = useState<string[]>(initial?.substitutes || []);
  const [events, setEvents] = useState<EventDraft[]>(
    (initial?.events || []).map((e) => ({
      minute: e.minute != null ? String(e.minute) : "",
      type: e.type,
      player: e.player || "",
      detail: e.detail || "",
    }))
  );
  const [stats, setStats] = useState<MatchFormValues["stats"]>(initial?.stats || emptyStats());
  const [squad, setSquad] = useState<SquadPlayer[]>([]);

  useEffect(() => {
    adminFetch<SquadPlayer[]>("/players")
      .then((all) => setSquad(all.filter((p) => p.role === "player")))
      .catch(() => setSquad([]));
  }, []);

  function toggleInList(list: string[], setList: (v: string[]) => void, id: string) {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  }

  function addEvent() {
    setEvents([...events, { minute: "", type: "goal", player: "", detail: "" }]);
  }
  function updateEvent(index: number, patch: Partial<EventDraft>) {
    setEvents(events.map((e, i) => (i === index ? { ...e, ...patch } : e)));
  }
  function removeEvent(index: number) {
    setEvents(events.filter((_, i) => i !== index));
  }

  function updateStat(key: (typeof statKeys)[number], side: "eko" | "opponent", raw: string) {
    const value = raw === "" ? null : Number(raw);
    setStats({ ...stats, [key]: { ...stats[key], [side]: value } });
  }

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
      opponentLogoUrl,
      competition: String(data.get("competition") || ""),
      venue: String(data.get("venue") || ""),
      kickoff: kickoffLocal ? new Date(kickoffLocal).toISOString() : "",
      isHome,
      status,
      score: { eko: score("eko"), opponent: score("opponent") },
      preview: String(data.get("preview") || ""),
      formation: String(data.get("formation") || ""),
      lineup,
      substitutes,
      // Drop rows the admin added but never filled in; convert minute back
      // to a number (or omit it) for the backend's eventSchema.
      events: events
        .filter((e) => e.minute.trim() || e.player.trim() || e.detail.trim())
        .map((e) => ({
          type: e.type,
          minute: e.minute.trim() === "" ? undefined : Number(e.minute),
          player: e.player.trim() || undefined,
          detail: e.detail.trim() || undefined,
        })),
      stats,
      summary: String(data.get("summary") || ""),
    });
  }

  // datetime-local wants "YYYY-MM-DDTHH:mm" in local time, not a raw ISO string
  const kickoffLocalValue = initial?.kickoff
    ? new Date(initial.kickoff).toISOString().slice(0, 16)
    : undefined;

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
      <div className="space-y-5">
        <div>
          <label htmlFor="opponent" className={labelClass}>
            Opponent
          </label>
          <input id="opponent" name="opponent" required defaultValue={initial?.opponent} className={fieldClass} />
        </div>

        <div>
          <span className={labelClass}>Opponent logo (optional)</span>
          <CloudinaryUpload
            value={opponentLogoUrl}
            onChange={setOpponentLogoUrl}
            folder="eko-united-fc/opponents"
            hint="Recommended: square crest/logo, transparent background, at least 200×200px."
          />
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

        {(status === "finished" || status === "live") && (
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
      </div>

      {/* MATCH PREVIEW: a pre-match writeup, shown publicly while the match is
          still upcoming. Distinct from Summary below, which is the post-match
          report. */}
      <div>
        <p className={sectionLabelClass}>Match Preview</p>
        <label htmlFor="preview" className={labelClass}>
          Preview writeup (optional)
        </label>
        <textarea
          id="preview"
          name="preview"
          rows={3}
          placeholder="Team news, form, what's at stake…"
          defaultValue={initial?.preview}
          className={fieldClass}
        />
      </div>

      {/* LINEUPS */}
      <div>
        <p className={sectionLabelClass}>Lineup</p>
        <div className="mb-4">
          <label htmlFor="formation" className={labelClass}>
            Formation (optional)
          </label>
          <input
            id="formation"
            name="formation"
            placeholder="e.g. 4-3-3"
            defaultValue={initial?.formation}
            className={`${fieldClass} max-w-[160px]`}
          />
        </div>

        {squad.length === 0 ? (
          <p className="text-sm text-navy/40">No squad players yet, add some under Players & Staff first.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <span className={labelClass}>Starting XI</span>
              <div className="max-h-64 space-y-1 overflow-y-auto border-t border-navy/10 pt-2">
                {squad.map((p) => (
                  <label key={p._id} className="flex items-center gap-2 py-1 text-sm text-navy">
                    <input
                      type="checkbox"
                      checked={lineup.includes(p._id)}
                      onChange={() => toggleInList(lineup, setLineup, p._id)}
                      className="h-4 w-4 shrink-0"
                    />
                    <span>
                      {p.squadNumber != null && <span className="text-navy/40">#{p.squadNumber} </span>}
                      {p.name}
                      {p.position && <span className="text-navy/40"> · {p.position}</span>}
                    </span>
                  </label>
                ))}
              </div>
              <p className="mt-1 text-xs text-navy/40">{lineup.length} selected</p>
            </div>

            <div>
              <span className={labelClass}>Substitutes</span>
              <div className="max-h-64 space-y-1 overflow-y-auto border-t border-navy/10 pt-2">
                {squad.map((p) => (
                  <label key={p._id} className="flex items-center gap-2 py-1 text-sm text-navy">
                    <input
                      type="checkbox"
                      checked={substitutes.includes(p._id)}
                      onChange={() => toggleInList(substitutes, setSubstitutes, p._id)}
                      className="h-4 w-4 shrink-0"
                    />
                    <span>
                      {p.squadNumber != null && <span className="text-navy/40">#{p.squadNumber} </span>}
                      {p.name}
                      {p.position && <span className="text-navy/40"> · {p.position}</span>}
                    </span>
                  </label>
                ))}
              </div>
              <p className="mt-1 text-xs text-navy/40">{substitutes.length} selected</p>
            </div>
          </div>
        )}
      </div>

      {/* GOALS & EVENTS */}
      <div>
        <p className={sectionLabelClass}>Goals &amp; Events</p>
        <div className="space-y-3">
          {events.map((ev, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2 rounded-lg border border-navy/10 p-3">
              <input
                type="number"
                placeholder="Min"
                value={ev.minute}
                onChange={(e) => updateEvent(i, { minute: e.target.value })}
                className="w-16 border-b border-navy/20 bg-transparent px-1 py-1.5 text-sm text-navy outline-none focus:border-cyan"
              />
              <select
                value={ev.type}
                onChange={(e) => updateEvent(i, { type: e.target.value as MatchEventValue["type"] })}
                className="border-b border-navy/20 bg-transparent px-1 py-1.5 text-sm text-navy outline-none focus:border-cyan"
              >
                {(Object.keys(eventTypeLabels) as MatchEventValue["type"][]).map((t) => (
                  <option key={t} value={t}>
                    {eventTypeLabels[t]}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Player"
                value={ev.player}
                onChange={(e) => updateEvent(i, { player: e.target.value })}
                className="min-w-[140px] flex-1 border-b border-navy/20 bg-transparent px-1 py-1.5 text-sm text-navy outline-none focus:border-cyan"
              />
              <input
                type="text"
                placeholder="Detail (optional)"
                value={ev.detail}
                onChange={(e) => updateEvent(i, { detail: e.target.value })}
                className="min-w-[140px] flex-1 border-b border-navy/20 bg-transparent px-1 py-1.5 text-sm text-navy outline-none focus:border-cyan"
              />
              <button
                type="button"
                onClick={() => removeEvent(i)}
                className="ml-auto text-xs font-semibold uppercase tracking-wide text-red-500 hover:text-red-600"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addEvent}
          className="mt-3 rounded-full border border-navy/20 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-navy transition-colors duration-200 ease-smooth hover:border-navy"
        >
          + Add event
        </button>
      </div>

      {/* MATCH STATISTICS */}
      <div>
        <p className={sectionLabelClass}>Match Statistics</p>
        <p className="mb-3 text-xs text-navy/40">Leave blank to hide a stat from the public match page.</p>
        <div className="space-y-3">
          {statKeys.map((key) => (
            <div key={key} className="grid grid-cols-[1fr_80px_80px] items-center gap-3">
              <span className="text-sm text-navy/70">{statLabels[key]}</span>
              <input
                type="number"
                placeholder="Eko"
                value={stats[key].eko ?? ""}
                onChange={(e) => updateStat(key, "eko", e.target.value)}
                className="border-b border-navy/20 bg-transparent px-1 py-1.5 text-center text-sm text-navy outline-none focus:border-cyan"
              />
              <input
                type="number"
                placeholder="Opp."
                value={stats[key].opponent ?? ""}
                onChange={(e) => updateStat(key, "opponent", e.target.value)}
                className="border-b border-navy/20 bg-transparent px-1 py-1.5 text-center text-sm text-navy outline-none focus:border-cyan"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className={sectionLabelClass}>Post-Match Summary</p>
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
