"use client";

import { useState, type FormEvent } from "react";
import CloudinaryUpload from "@/components/admin/CloudinaryUpload";
import { isAllowedImageUrl } from "@/lib/imageHosts";

export type StandingFormValues = {
  clubName: string;
  clubLogoUrl: string;
  isEkoUnited: boolean;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  position: number;
  season: string;
};

const fieldClass =
  "w-full border-b border-navy/20 bg-transparent px-1 py-3 text-sm text-navy outline-none transition-colors duration-200 ease-smooth placeholder:text-navy/30 focus:border-cyan";
const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-wide text-navy/50";

export default function StandingForm({
  initial,
  onSave,
  saving,
  error,
}: {
  initial?: Partial<StandingFormValues>;
  onSave: (values: StandingFormValues) => void;
  saving: boolean;
  error: string;
}) {
  const [clubLogoUrl, setClubLogoUrl] = useState(initial?.clubLogoUrl || "");
  const [isEkoUnited, setIsEkoUnited] = useState(initial?.isEkoUnited || false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (clubLogoUrl && !isAllowedImageUrl(clubLogoUrl)) return;
    const data = new FormData(event.currentTarget);
    const num = (name: string) => Number(data.get(name) || 0);
    onSave({
      clubName: String(data.get("clubName") || ""),
      clubLogoUrl,
      isEkoUnited,
      played: num("played"),
      won: num("won"),
      drawn: num("drawn"),
      lost: num("lost"),
      goalsFor: num("goalsFor"),
      goalsAgainst: num("goalsAgainst"),
      points: num("points"),
      position: num("position") || 1,
      season: String(data.get("season") || "2026"),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
      <div>
        <label htmlFor="clubName" className={labelClass}>
          Club name
        </label>
        <input id="clubName" name="clubName" required defaultValue={initial?.clubName} className={fieldClass} />
      </div>

      <div>
        <span className={labelClass}>Club logo (optional)</span>
        <CloudinaryUpload
          value={clubLogoUrl}
          onChange={setClubLogoUrl}
          folder="eko-united-fc/standings"
          hint="Recommended: square club crest, transparent background, at least 200×200px."
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-navy">
        <input
          type="checkbox"
          checked={isEkoUnited}
          onChange={(e) => setIsEkoUnited(e.target.checked)}
          className="h-4 w-4"
        />
        This is Eko United's row (highlighted on the public table)
      </label>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <label htmlFor="position" className={labelClass}>
            Position
          </label>
          <input
            id="position"
            name="position"
            type="number"
            min={1}
            required
            defaultValue={initial?.position ?? 1}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="season" className={labelClass}>
            Season
          </label>
          <input id="season" name="season" defaultValue={initial?.season ?? "2026"} className={fieldClass} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div>
          <label htmlFor="played" className={labelClass}>
            Played
          </label>
          <input id="played" name="played" type="number" min={0} defaultValue={initial?.played ?? 0} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="won" className={labelClass}>
            Won
          </label>
          <input id="won" name="won" type="number" min={0} defaultValue={initial?.won ?? 0} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="drawn" className={labelClass}>
            Drawn
          </label>
          <input id="drawn" name="drawn" type="number" min={0} defaultValue={initial?.drawn ?? 0} className={fieldClass} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div>
          <label htmlFor="lost" className={labelClass}>
            Lost
          </label>
          <input id="lost" name="lost" type="number" min={0} defaultValue={initial?.lost ?? 0} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="goalsFor" className={labelClass}>
            Goals for
          </label>
          <input
            id="goalsFor"
            name="goalsFor"
            type="number"
            min={0}
            defaultValue={initial?.goalsFor ?? 0}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="goalsAgainst" className={labelClass}>
            Goals against
          </label>
          <input
            id="goalsAgainst"
            name="goalsAgainst"
            type="number"
            min={0}
            defaultValue={initial?.goalsAgainst ?? 0}
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="points" className={labelClass}>
          Points
        </label>
        <input id="points" name="points" type="number" min={0} defaultValue={initial?.points ?? 0} className={fieldClass} />
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
        {saving ? "Saving…" : "Save standing"}
      </button>
    </form>
  );
}
