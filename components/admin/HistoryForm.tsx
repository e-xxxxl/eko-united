"use client";

import { useState, type FormEvent } from "react";
import CloudinaryUpload from "@/components/admin/CloudinaryUpload";
import { isAllowedImageUrl } from "@/lib/imageHosts";

export type HistoryFormValues = {
  year: number;
  title: string;
  description: string;
  imageUrl: string;
};

const fieldClass =
  "w-full border-b border-navy/20 bg-transparent px-1 py-3 text-sm text-navy outline-none transition-colors duration-200 ease-smooth placeholder:text-navy/30 focus:border-cyan";
const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-wide text-navy/50";

export default function HistoryForm({
  initial,
  onSave,
  saving,
  error,
}: {
  initial?: Partial<HistoryFormValues>;
  onSave: (values: HistoryFormValues) => void;
  saving: boolean;
  error: string;
}) {
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl || "");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (imageUrl && !isAllowedImageUrl(imageUrl)) return;
    const data = new FormData(event.currentTarget);
    onSave({
      year: Number(data.get("year") || new Date().getFullYear()),
      title: String(data.get("title") || ""),
      description: String(data.get("description") || ""),
      imageUrl,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
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
        <label htmlFor="title" className={labelClass}>
          Milestone title
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={initial?.title}
          placeholder="e.g. Club founded"
          className={fieldClass}
        />
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
        <CloudinaryUpload value={imageUrl} onChange={setImageUrl} folder="eko-united-fc/history" />
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
        {saving ? "Saving…" : "Save milestone"}
      </button>
    </form>
  );
}
