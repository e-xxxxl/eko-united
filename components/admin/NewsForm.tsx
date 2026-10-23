"use client";

import { useRef, useState, type FormEvent } from "react";
import CloudinaryUpload from "@/components/admin/CloudinaryUpload";
import { isAllowedImageUrl } from "@/lib/imageHosts";
import { slugify } from "@/lib/slugify";

export type NewsFormBlock = {
  kind: "paragraph" | "image";
  text?: string;
  bold?: boolean;
  url?: string;
  caption?: string;
};

export type NewsFormValues = {
  title: string;
  slug: string;
  body: string;
  blocks: NewsFormBlock[];
  coverImageUrl: string;
  heroImageUrl: string;
  images: string[];
  category: "article" | "match_report" | "press_release";
  author: string;
  publishedAt: string;
};

type EditorBlock = NewsFormBlock & { id: number };

const fieldClass =
  "w-full border-b border-navy/20 bg-transparent px-1 py-3 text-sm text-navy outline-none transition-colors duration-200 ease-smooth placeholder:text-navy/30 focus:border-cyan";
const areaClass =
  "w-full resize-y rounded-xl border border-navy/15 bg-white px-4 py-3 text-sm leading-relaxed text-navy outline-none transition-colors duration-200 ease-smooth placeholder:text-navy/30 focus:border-cyan";
const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-wide text-navy/50";
const tinyButton =
  "rounded-lg px-2.5 py-1.5 text-xs font-semibold text-navy/50 transition-colors duration-200 ease-smooth hover:bg-navy/5 hover:text-navy disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-navy/50";
const MAX_IMAGES = 12;

// Articles written before the block editor have a plain `body` (paragraphs
// separated by line breaks) and a loose list of extra photos. Turn those into
// blocks the same way the public page used to lay them out (a photo after
// every second paragraph), so opening an old article shows exactly what
// readers see and nothing is lost on the next save.
function legacyBlocks(body: string, images: string[]): NewsFormBlock[] {
  const out: NewsFormBlock[] = [];
  let next = 0;
  body
    .split(/\n+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .forEach((text, i) => {
      out.push({ kind: "paragraph", text });
      if ((i + 1) % 2 === 0 && next < images.length) out.push({ kind: "image", url: images[next++] });
    });
  while (next < images.length) out.push({ kind: "image", url: images[next++] });
  return out;
}

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
  const idRef = useRef(0);
  const withId = (b: NewsFormBlock): EditorBlock => ({ ...b, id: ++idRef.current });

  const [title, setTitle] = useState(initial?.title || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [coverImageUrl, setCoverImageUrl] = useState(initial?.coverImageUrl || "");
  const [heroImageUrl, setHeroImageUrl] = useState(initial?.heroImageUrl || "");
  const [category, setCategory] = useState<NewsFormValues["category"]>(initial?.category || "article");
  const [blocks, setBlocks] = useState<EditorBlock[]>(() => {
    const start: NewsFormBlock[] = initial?.blocks?.length
      ? initial.blocks
      : legacyBlocks(initial?.body || "", initial?.images || []);
    return (start.length ? start : [{ kind: "paragraph", text: "" } as NewsFormBlock]).map(withId);
  });
  const [localError, setLocalError] = useState("");

  const imageCount = blocks.filter((b) => b.kind === "image").length;

  function update(id: number, patch: Partial<NewsFormBlock>) {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }
  function remove(id: number) {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }
  function move(id: number, dir: -1 | 1) {
    setBlocks((prev) => {
      const i = prev.findIndex((b) => b.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const copy = [...prev];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  }
  function insertAfter(id: number | null, block: NewsFormBlock) {
    setBlocks((prev) => {
      const i = id === null ? prev.length - 1 : prev.findIndex((b) => b.id === id);
      const copy = [...prev];
      copy.splice(i + 1, 0, withId(block));
      return copy;
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError("");
    if (coverImageUrl && !isAllowedImageUrl(coverImageUrl)) return;
    if (heroImageUrl && !isAllowedImageUrl(heroImageUrl)) return;

    const cleaned: NewsFormBlock[] = [];
    for (const b of blocks) {
      if (b.kind === "paragraph") {
        const text = (b.text || "").trim();
        if (text) cleaned.push({ kind: "paragraph", text, bold: Boolean(b.bold) });
      } else if (b.url && isAllowedImageUrl(b.url)) {
        cleaned.push({ kind: "image", url: b.url, caption: (b.caption || "").trim() || undefined });
      }
    }
    const paragraphs = cleaned.filter((b) => b.kind === "paragraph");
    if (paragraphs.length === 0) {
      setLocalError("Write at least one paragraph for the story.");
      return;
    }

    const data = new FormData(event.currentTarget);
    const publishedAtLocal = String(data.get("publishedAt") || "");
    onSave({
      title,
      slug: slug || slugify(title),
      body: paragraphs.map((p) => p.text).join("\n\n"),
      blocks: cleaned,
      coverImageUrl,
      heroImageUrl,
      images: cleaned.filter((b) => b.kind === "image").map((b) => b.url as string),
      category,
      author: String(data.get("author") || "Eko United FC"),
      publishedAt: publishedAtLocal ? new Date(publishedAtLocal).toISOString() : new Date().toISOString(),
    });
  }

  const publishedAtValue = initial?.publishedAt ? initial.publishedAt.slice(0, 10) : undefined;
  let paragraphNumber = 0;

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
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
              className={`rounded-xl border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors duration-200 ease-smooth ${
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
        <span className={labelClass}>Cover image (phone / portrait)</span>
        <CloudinaryUpload
          value={coverImageUrl}
          onChange={setCoverImageUrl}
          folder="eko-united-fc/news"
          hint="Best: portrait 4:5, 1600×2000px (minimum 1200×1500px), JPG or WebP under 1MB. Keep the subject centred. Shown on phones in the homepage hero, at the top of the article on phones, in news lists and in share previews. If you skip the desktop image below, this one is used on desktop too (a landscape 3:2 photo, 2400×1600px, works best in that case)."
        />
      </div>

      <div>
        <span className={labelClass}>Desktop hero image (landscape, optional)</span>
        <CloudinaryUpload
          value={heroImageUrl}
          onChange={setHeroImageUrl}
          folder="eko-united-fc/news"
          hint="Best: landscape 16:9, 2560×1440px (minimum 1920×1080px), JPG or WebP under 1MB. Keep faces in the middle 60% of the width and above the bottom third, where the headline sits. Used only by the homepage hero on tablets and desktops."
        />
      </div>

      <div>
        <span className={labelClass}>Story</span>
        <p className="mb-4 text-xs leading-relaxed text-navy/45">
          Write the story one paragraph at a time. The first paragraph opens the article as its
          introduction. Tick Bold on any paragraph you want to stand out (a key quote or an
          announcement). Under a paragraph, add a photo if you want one there; photos are optional
          and show at their full size with an optional caption.
        </p>

        <div className="space-y-3">
          {blocks.map((block, i) => {
            const first = i === 0;
            const last = i === blocks.length - 1;
            const nextIsImage = blocks[i + 1]?.kind === "image";

            if (block.kind === "image") {
              return (
                <div key={block.id} className="rounded-2xl border border-dashed border-cyan/50 bg-cyan/[0.04] p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-navy/60">Photo</span>
                    <div className="flex items-center">
                      <button type="button" className={tinyButton} disabled={first} onClick={() => move(block.id, -1)}>
                        Up
                      </button>
                      <button type="button" className={tinyButton} disabled={last} onClick={() => move(block.id, 1)}>
                        Down
                      </button>
                      <button
                        type="button"
                        className={`${tinyButton} hover:!text-red-500`}
                        onClick={() => remove(block.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <CloudinaryUpload
                    value={block.url || ""}
                    onChange={(url) => update(block.id, { url })}
                    folder="eko-united-fc/news"
                    hint="Any orientation. It shows whole, at the full width of the article, with nothing cropped."
                  />
                  <input
                    value={block.caption || ""}
                    onChange={(e) => update(block.id, { caption: e.target.value })}
                    placeholder="Caption (optional)"
                    maxLength={160}
                    className={`${fieldClass} mt-3`}
                  />
                </div>
              );
            }

            paragraphNumber += 1;
            return (
              <div key={block.id} className="rounded-2xl border border-navy/10 bg-navy/[0.02] p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-navy/60">
                    {paragraphNumber === 1 ? "Introduction" : `Paragraph ${paragraphNumber}`}
                  </span>
                  <div className="flex flex-wrap items-center">
                    <label className="mr-2 flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-navy ring-1 ring-navy/15">
                      <input
                        type="checkbox"
                        checked={Boolean(block.bold)}
                        onChange={(e) => update(block.id, { bold: e.target.checked })}
                        className="h-3.5 w-3.5 accent-navy"
                      />
                      Bold
                    </label>
                    <button type="button" className={tinyButton} disabled={first} onClick={() => move(block.id, -1)}>
                      Up
                    </button>
                    <button type="button" className={tinyButton} disabled={last} onClick={() => move(block.id, 1)}>
                      Down
                    </button>
                    <button
                      type="button"
                      className={`${tinyButton} hover:!text-red-500`}
                      disabled={paragraphNumber === 1 && blocks.filter((b) => b.kind === "paragraph").length === 1}
                      onClick={() => remove(block.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <textarea
                  value={block.text || ""}
                  onChange={(e) => update(block.id, { text: e.target.value })}
                  rows={paragraphNumber === 1 ? 4 : 5}
                  placeholder={paragraphNumber === 1 ? "Open with the key facts of the story…" : "Continue the story…"}
                  className={`${areaClass} ${block.bold ? "font-semibold" : ""}`}
                />
                {!nextIsImage && imageCount < MAX_IMAGES && (
                  <button
                    type="button"
                    onClick={() => insertAfter(block.id, { kind: "image", url: "" })}
                    className="mt-3 text-xs font-semibold uppercase tracking-wide text-cyan transition-colors duration-200 ease-smooth hover:text-navy"
                  >
                    + Add a photo under this paragraph
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => insertAfter(null, { kind: "paragraph", text: "" })}
          className="btn-glass btn-glass-navy mt-4 px-5 py-2.5 text-xs font-bold uppercase tracking-wide"
        >
          + Add paragraph
        </button>
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
        {saving ? "Saving…" : "Save article"}
      </button>
    </form>
  );
}
