"use client";

import { useState, type FormEvent } from "react";
import CloudinaryUpload from "@/components/admin/CloudinaryUpload";
import { isAllowedImageUrl } from "@/lib/imageHosts";
import { slugify } from "@/lib/slugify";

export type EventFormValues = {
  name: string;
  slug: string;
  description: string;
  eventDate: string | null;
  location: string;
  imageUrl: string;
  images: string[];
  isActive: boolean;
  showInHero: boolean;
  isCsr: boolean;
};

const fieldClass =
  "w-full border-b border-navy/20 bg-transparent px-1 py-3 text-sm text-navy outline-none transition-colors duration-200 ease-smooth placeholder:text-navy/30 focus:border-cyan";
const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-wide text-navy/50";
const MAX_PHOTOS = 8;

export default function EventForm({
  initial,
  onSave,
  saving,
  error,
}: {
  initial?: Partial<EventFormValues>;
  onSave: (values: EventFormValues) => void;
  saving: boolean;
  error: string;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl || "");
  const [images, setImages] = useState<string[]>(initial?.images || []);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [showInHero, setShowInHero] = useState(initial?.showInHero ?? false);
  const [isCsr, setIsCsr] = useState(initial?.isCsr ?? false);

  const dateValue = initial?.eventDate ? initial.eventDate.slice(0, 10) : "";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (imageUrl && !isAllowedImageUrl(imageUrl)) return;
    const data = new FormData(event.currentTarget);
    const date = String(data.get("eventDate") || "");
    onSave({
      name: name.trim(),
      slug: slug || slugify(name),
      description: String(data.get("description") || "").trim(),
      eventDate: date ? new Date(`${date}T12:00:00+01:00`).toISOString() : null,
      location: String(data.get("location") || "").trim(),
      imageUrl,
      images: images.filter((u) => u && isAllowedImageUrl(u)),
      isActive,
      showInHero: isActive && showInHero,
      isCsr,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      <div>
        <label htmlFor="name" className={labelClass}>
          Event name
        </label>
        <input
          id="name"
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="slug" className={labelClass}>
          Slug (used in the event URL)
        </label>
        <input
          id="slug"
          required
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(slugify(e.target.value));
          }}
          className={fieldClass}
        />
      </div>

      <div className="rounded-xl bg-navy/[0.04] p-4">
        <label className="flex cursor-pointer items-start gap-3 text-sm text-navy">
          <input type="checkbox" checked={isCsr} onChange={(e) => setIsCsr(e.target.checked)} className="mt-0.5 h-4 w-4 accent-navy" />
          <span>
            <span className="font-semibold">This is a CSR activity (Community Social Responsibility)</span>
            <span className="mt-1 block text-xs leading-relaxed text-navy/55">
              Tick for outreach, donations, school visits and other community work. It is tagged
              &quot;Community Social Responsibility&quot; on the Events and CSR page and can be filtered there.
            </span>
          </span>
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="eventDate" className={labelClass}>
            Date (optional)
          </label>
          <input id="eventDate" name="eventDate" type="date" defaultValue={dateValue} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="location" className={labelClass}>
            Place (optional)
          </label>
          <input id="location" name="location" defaultValue={initial?.location} placeholder="e.g. Mobolaji Johnson Arena, Lagos" className={fieldClass} />
        </div>
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          About the event
        </label>
        <textarea
          id="description"
          name="description"
          rows={6}
          defaultValue={initial?.description}
          placeholder="What is happening, who it is for, how to take part. A blank line starts a new paragraph."
          className={fieldClass}
        />
      </div>

      <div>
        <span className={labelClass}>Cover photo</span>
        <CloudinaryUpload
          value={imageUrl}
          onChange={setImageUrl}
          folder="eko-united-fc/events"
          hint="Best: landscape 16:9, 2400×1350px (minimum 1600×900px), JPG or WebP under 1MB. Shown on the events list and across the top of the event page (on phones it is shown taller, so keep the subject in the middle)."
        />
      </div>

      <div>
        <span className={labelClass}>More photos (optional, up to {MAX_PHOTOS})</span>
        <div className="space-y-4">
          {images.map((url, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex-1">
                <CloudinaryUpload
                  value={url}
                  onChange={(next) => setImages((prev) => prev.map((u, idx) => (idx === i ? next : u)))}
                  folder="eko-united-fc/events"
                  hint="Landscape 4:3 works best, 1600px wide or more. Shown in a gallery under the event details."
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
        {images.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => setImages((prev) => [...prev, ""])}
            className="btn-glass btn-glass-navy mt-3 px-5 py-2.5 text-xs font-bold uppercase tracking-wide"
          >
            + Add photo
          </button>
        )}
      </div>

      <label className="flex cursor-pointer items-center gap-3 text-sm text-navy">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 accent-navy" />
        Show on the website
      </label>

      <div className="rounded-xl bg-navy/[0.04] p-4">
        <label className="flex cursor-pointer items-start gap-3 text-sm text-navy">
          <input
            type="checkbox"
            checked={showInHero}
            disabled={!isActive}
            onChange={(e) => setShowInHero(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-navy"
          />
          <span>
            <span className="font-semibold">Add to the homepage hero carousel</span>
            <span className="mt-1 block text-xs leading-relaxed text-navy/55">
              The cover photo, name, date and place appear as a slide at the top of the homepage, linking to this event.
              It comes off by itself the day after the event date. Use a landscape cover photo for the best result.
            </span>
          </span>
        </label>
      </div>

      {error && (
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="btn-glass btn-glass-yellow px-8 py-3 text-sm font-bold uppercase tracking-wide disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save event"}
      </button>
    </form>
  );
}
