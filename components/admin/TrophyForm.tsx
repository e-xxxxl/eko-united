"use client";

import { useState, type FormEvent } from "react";
import CloudinaryUpload from "@/components/admin/CloudinaryUpload";
import { isAllowedImageUrl } from "@/lib/imageHosts";

export type TrophyFormValues = {
  name: string;
  competition: string;
  year: number;
  timesWon: number;
  description: string;
  imageUrl: string;
  displayOrder: number;
};

const fieldClass =
  "w-full border-b border-navy/20 bg-transparent px-1 py-3 text-sm text-navy outline-none transition-colors duration-200 ease-smooth placeholder:text-navy/30 focus:border-cyan";
const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-wide text-navy/50";

export default function TrophyForm({
  initial,
  onSave,
  saving,
  error,
}: {
  initial?: Partial<TrophyFormValues>;
  onSave: (values: TrophyFormValues) => void;
  saving: boolean;
  error: string;
}) {
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl || "");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Image is optional here, unlike Sponsors — only block on a bad host,
    // not on it being empty.
    if (imageUrl && !isAllowedImageUrl(imageUrl)) return;
    const data = new FormData(event.currentTarget);
    onSave({
      name: String(data.get("name") || ""),
      competition: String(data.get("competition") || ""),
      year: Number(data.get("year") || new Date().getFullYear()),
      timesWon: Number(data.get("timesWon") || 1),
      description: String(data.get("description") || ""),
      imageUrl,
      displayOrder: Number(data.get("displayOrder") || 0),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
      <div>
        <label htmlFor="name" className={labelClass}>
          Trophy name
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={initial?.name}
          placeholder="e.g. NNL Regional Champions"
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="competition" className={labelClass}>
          Competition
        </label>
        <input id="competition" name="competition" defaultValue={initial?.competition} className={fieldClass} />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <label htmlFor="year" className={labelClass}>
            Year
          </label>
          <input
            id="year"
            name="year"
            type="number"
            required
            defaultValue={initial?.year ?? new Date().getFullYear()}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="timesWon" className={labelClass}>
            Times won
          </label>
          <input
            id="timesWon"
            name="timesWon"
            type="number"
            min={1}
            defaultValue={initial?.timesWon ?? 1}
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          Description (optional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={initial?.description}
          className={fieldClass}
        />
      </div>

      <div>
        <span className={labelClass}>Image (optional)</span>
        <CloudinaryUpload
          value={imageUrl}
          onChange={setImageUrl}
          folder="eko-united-fc/trophies"
          hint="Recommended: square trophy photo on a plain background, at least 500×500px."
        />
      </div>

      <div>
        <label htmlFor="displayOrder" className={labelClass}>
          Display order
        </label>
        <input
          id="displayOrder"
          name="displayOrder"
          type="number"
          defaultValue={initial?.displayOrder ?? 0}
          className={fieldClass}
        />
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
        {saving ? "Saving…" : "Save trophy"}
      </button>
    </form>
  );
}
