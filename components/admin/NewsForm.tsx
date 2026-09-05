"use client";

import { useState, type FormEvent } from "react";
import CloudinaryUpload from "@/components/admin/CloudinaryUpload";
import { isAllowedImageUrl } from "@/lib/imageHosts";
import { slugify } from "@/lib/slugify";

export type NewsFormValues = {
  title: string;
  slug: string;
  body: string;
  coverImageUrl: string;
  images: string[];
  category: "article" | "match_report" | "press_release";
  author: string;
  publishedAt: string;
};

const fieldClass =
  "w-full border-b border-navy/20 bg-transparent px-1 py-3 text-sm text-navy outline-none transition-colors duration-200 ease-smooth placeholder:text-navy/30 focus:border-cyan";
const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-wide text-navy/50";
const MAX_EXTRA_IMAGES = 6;

export default function NewsForm({
  initial,
  onSave,
  saving,
  error,
}: {
  initial?: Partial<NewsFormValues>;
  onSave: (values: NewsFormValues) => void;
  saving: boolean;
  error: string;
}) {
  const [title, setTitle] = useState(initial?.title || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [coverImageUrl, setCoverImageUrl] = useState(initial?.coverImageUrl || "");
  const [images, setImages] = useState<string[]>(initial?.images || []);
  const [category, setCategory] = useState<NewsFormValues["category"]>(initial?.category || "article");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (coverImageUrl && !isAllowedImageUrl(coverImageUrl)) return;
    const validImages = images.filter((url) => url && isAllowedImageUrl(url));
    const data = new FormData(event.currentTarget);
    const publishedAtLocal = String(data.get("publishedAt") || "");
    onSave({
      title,
      slug: slug || slugify(title),
      body: String(data.get("body") || ""),
      coverImageUrl,
      images: validImages,
      category,
      author: String(data.get("author") || "Eko United FC"),
      publishedAt: publishedAtLocal ? new Date(publishedAtLocal).toISOString() : new Date().toISOString(),
    });
  }

  const publishedAtValue = initial?.publishedAt ? initial.publishedAt.slice(0, 10) : undefined;

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
      <div>
        <label htmlFor="title" className={labelClass}>
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="slug" className={labelClass}>
          Slug (used in the article URL)
        </label>
        <input
          id="slug"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(slugify(e.target.value));
          }}
          required
          className={fieldClass}
        />
      </div>

      <div>
        <span className={labelClass}>Category</span>
        <div className="flex flex-wrap gap-2">
          {(["article", "match_report", "press_release"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors duration-200 ease-smooth ${
                category === c
                  ? "border-cyan bg-cyan/10 text-navy"
                  : "border-navy/15 text-navy/50 hover:border-navy/30"
              }`}
            >
              {c.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className={labelClass}>Cover image</span>
        <CloudinaryUpload
          value={coverImageUrl}
          onChange={setCoverImageUrl}
          folder="eko-united-fc/news"
          hint="Recommended: landscape, at least 1200×630px — this is what shows at the top of the article and in share previews."
        />
      </div>

      <div>
        <span className={labelClass}>
          Additional photos (optional — shown within the article, separate from the cover)
        </span>
        <div className="space-y-4">
          {images.map((url, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex-1">
                <CloudinaryUpload
                  value={url}
                  onChange={(next) => setImages((prev) => prev.map((u, idx) => (idx === i ? next : u)))}
                  folder="eko-united-fc/news"
                  hint="Any orientation — shown at its full size within the article body."
                />
              </div>
              <button
                type="button"
                onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                className="mt-4 text-xs font-semibold text-navy/40 transition-colors duration-200 ease-smooth hover:text-red-500"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        {images.length < MAX_EXTRA_IMAGES && (
          <button
            type="button"
            onClick={() => setImages((prev) => [...prev, ""])}
            className="mt-3 text-xs font-semibold uppercase tracking-wide text-cyan transition-colors duration-200 ease-smooth hover:text-navy"
          >
            + Add another photo
          </button>
        )}
      </div>

      <div>
        <label htmlFor="body" className={labelClass}>
          Body
        </label>
        <textarea id="body" name="body" rows={8} required defaultValue={initial?.body} className={fieldClass} />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <label htmlFor="author" className={labelClass}>
            Author
          </label>
          <input
            id="author"
            name="author"
            defaultValue={initial?.author || "Eko United FC"}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="publishedAt" className={labelClass}>
            Published date
          </label>
          <input
            id="publishedAt"
            name="publishedAt"
            type="date"
            defaultValue={publishedAtValue}
            className={fieldClass}
          />
        </div>
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
        {saving ? "Saving…" : "Save article"}
      </button>
    </form>
  );
}
