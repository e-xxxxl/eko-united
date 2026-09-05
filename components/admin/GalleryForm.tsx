"use client";

import { useState, type FormEvent } from "react";
import CloudinaryUpload from "@/components/admin/CloudinaryUpload";
import { isAllowedImageUrl } from "@/lib/imageHosts";

export type GalleryFormValues = {
  type: "photo" | "video";
  url: string;
  caption: string;
  tags: string[];
};

const fieldClass =
  "w-full border-b border-navy/20 bg-transparent px-1 py-3 text-sm text-navy outline-none transition-colors duration-200 ease-smooth placeholder:text-navy/30 focus:border-cyan";
const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-wide text-navy/50";

export default function GalleryForm({
  initial,
  onSave,
  saving,
  error,
}: {
  initial?: Partial<GalleryFormValues>;
  onSave: (values: GalleryFormValues) => void;
  saving: boolean;
  error: string;
}) {
  const [type, setType] = useState<GalleryFormValues["type"]>(initial?.type || "photo");
  const [url, setUrl] = useState(initial?.url || "");
  const [tagsInput, setTagsInput] = useState((initial?.tags || []).join(", "));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Photos render via next/image and need an allow-listed host; videos
    // render via a plain <video> tag so any URL is fine there.
    if (!url) return;
    if (type === "photo" && !isAllowedImageUrl(url)) return;
    const data = new FormData(event.currentTarget);
    onSave({
      type,
      url,
      caption: String(data.get("caption") || ""),
      tags: tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
      <div>
        <span className={labelClass}>Type</span>
        <div className="flex gap-2">
          {(["photo", "video"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setType(t);
                setUrl("");
              }}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors duration-200 ease-smooth ${
                type === t
                  ? "border-cyan bg-cyan/10 text-navy"
                  : "border-navy/15 text-navy/50 hover:border-navy/30"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {type === "photo" ? (
        <div>
          <span className={labelClass}>Photo</span>
          <CloudinaryUpload
            value={url}
            onChange={setUrl}
            folder="eko-united-fc/gallery"
            hint="Recommended: landscape, at least 1200px wide."
          />
          {!url && (
            <p className="mt-2 text-xs text-red-500" role="alert">
              A photo is required.
            </p>
          )}
        </div>
      ) : (
        <div>
          <label htmlFor="url" className={labelClass}>
            Video URL
          </label>
          <input
            id="url"
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://res.cloudinary.com/.../video/..."
            className={fieldClass}
          />
          <p className="mt-1 text-xs text-navy/40">
            A direct video file link (e.g. uploaded to Cloudinary's video product) — not a YouTube
            page link.
          </p>
        </div>
      )}

      <div>
        <label htmlFor="caption" className={labelClass}>
          Caption (optional)
        </label>
        <input id="caption" name="caption" defaultValue={initial?.caption} className={fieldClass} />
      </div>

      <div>
        <label htmlFor="tags" className={labelClass}>
          Tags (optional, comma-separated)
        </label>
        <input
          id="tags"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="matchday, training"
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
        {saving ? "Saving…" : "Save gallery item"}
      </button>
    </form>
  );
}
