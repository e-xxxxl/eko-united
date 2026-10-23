"use client";

import { useState, type FormEvent } from "react";
import { youtubeId } from "@/lib/youtube";

export type VideoFormValues = {
  title: string;
  youtubeUrl: string;
  publishedAt: string;
  isActive: boolean;
};

const fieldClass =
  "w-full border-b border-navy/20 bg-transparent px-1 py-3 text-sm text-navy outline-none transition-colors duration-200 ease-smooth placeholder:text-navy/30 focus:border-cyan";
const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-wide text-navy/50";

export default function VideoForm({
  initial,
  onSave,
  saving,
  error,
}: {
  initial?: Partial<VideoFormValues>;
  onSave: (values: VideoFormValues) => void;
  saving: boolean;
  error: string;
}) {
  const [title, setTitle] = useState(initial?.title || "");
  const [youtubeUrl, setYoutubeUrl] = useState(initial?.youtubeUrl || "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [localError, setLocalError] = useState("");

  const id = youtubeId(youtubeUrl);
  const publishedAtValue = initial?.publishedAt ? initial.publishedAt.slice(0, 10) : undefined;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!id) {
      setLocalError("Paste a valid YouTube link, for example https://www.youtube.com/watch?v=...");
      return;
    }
    setLocalError("");
    const data = new FormData(event.currentTarget);
    const publishedAtLocal = String(data.get("publishedAt") || "");
    onSave({
      title: title.trim(),
      youtubeUrl: youtubeUrl.trim(),
      publishedAt: publishedAtLocal ? new Date(publishedAtLocal).toISOString() : new Date().toISOString(),
      isActive,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
      <div>
        <label htmlFor="title" className={labelClass}>
          Title
        </label>
        <input
          id="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Match highlights: Eko United vs Heartland"
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="youtubeUrl" className={labelClass}>
          YouTube link
        </label>
        <input
          id="youtubeUrl"
          required
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className={fieldClass}
        />
        <p className="mt-2 text-xs text-navy/45">
          Any YouTube link works: the watch page, a youtu.be share link or a Shorts link. Visitors see a preview
          and tap through to watch it on YouTube.
        </p>
        {youtubeUrl.trim() && !id && (
          <p className="mt-2 text-xs text-red-500">That does not look like a YouTube link yet.</p>
        )}
        {id && (
          <div className="mt-4 overflow-hidden rounded-xl bg-navy-dark">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
              alt="Video preview"
              className="aspect-video w-full object-cover"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <label htmlFor="publishedAt" className={labelClass}>
            Date
          </label>
          <input id="publishedAt" name="publishedAt" type="date" defaultValue={publishedAtValue} className={fieldClass} />
        </div>
        <label className="flex cursor-pointer items-end gap-3 pb-3 text-sm text-navy">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 accent-navy"
          />
          Show on the website
        </label>
      </div>

      {(localError || error) && (
        <p className="text-sm text-red-500" role="alert">
          {localError || error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="btn-glass btn-glass-yellow px-8 py-3 text-sm font-bold uppercase tracking-wide disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save video"}
      </button>
    </form>
  );
}
