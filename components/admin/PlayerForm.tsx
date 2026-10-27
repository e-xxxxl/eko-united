"use client";

import { useState, type FormEvent } from "react";
import CloudinaryUpload from "@/components/admin/CloudinaryUpload";
import { isAllowedImageUrl } from "@/lib/imageHosts";
import { slugify } from "@/lib/slugify";
import { playerPhotoUrl } from "@/lib/squad";

export type PlayerFormValues = {
  name: string;
  slug: string;
  position: string;
  squadNumber: number | null;
  dateOfBirth: string;
  nationality: string;
  photoUrl: string;
  extraPhotos: string[];
  photoCutout: boolean;
  bio: string;
  role: "player" | "coach" | "technical_staff" | "management";
  title: string;
  stats: { appearances: number; goals: number; assists: number };
};

const fieldClass =
  "w-full border-b border-navy/20 bg-transparent px-1 py-3 text-sm text-navy outline-none transition-colors duration-200 ease-smooth placeholder:text-navy/30 focus:border-cyan";
const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-wide text-navy/50";
const MAX_EXTRA = 2;
const POSITIONS = [
  "Goalkeeper",
  "Centre Back",
  "Left Back",
  "Right Back",
  "Wing Back",
  "Defensive Midfielder",
  "Central Midfielder",
  "Attacking Midfielder",
  "Left Winger",
  "Right Winger",
  "Striker",
  "Centre Forward",
];

export default function PlayerForm({
  initial,
  onSave,
  saving,
  error,
}: {
  initial?: Partial<PlayerFormValues>;
  onSave: (values: PlayerFormValues) => void;
  saving: boolean;
  error: string;
}) {
  const [role, setRole] = useState<PlayerFormValues["role"]>(initial?.role || "player");
  const [photoUrl, setPhotoUrl] = useState(initial?.photoUrl || "");
  const [extraPhotos, setExtraPhotos] = useState<string[]>(initial?.extraPhotos || []);
  const [cutout, setCutout] = useState(Boolean(initial?.photoCutout));
  const [preparing, setPreparing] = useState(false);
  const [name, setName] = useState(initial?.name || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (photoUrl && !isAllowedImageUrl(photoUrl)) return;
    const form = event.currentTarget;
    const extras = extraPhotos.filter((u) => u && isAllowedImageUrl(u)).slice(0, MAX_EXTRA);

    // The first request for a cut-out is processed by Cloudinary's AI, which
    // takes a few seconds. Ask for each one now (up to 25 seconds) so visitors
    // never meet that first slow request.
    if (cutout) {
      const urls = [photoUrl, ...extras].map((u) => playerPhotoUrl(u, true)).filter(Boolean) as string[];
      if (urls.length) {
        setPreparing(true);
        await Promise.race([
          Promise.allSettled(urls.map((u) => fetch(u, { mode: "no-cors" }))),
          new Promise((resolve) => setTimeout(resolve, 25000)),
        ]);
        setPreparing(false);
      }
    }

    const data = new FormData(form);
    const num = (v: FormDataEntryValue | null) => (v ? Number(v) : 0);
    onSave({
      name,
      slug: slug || slugify(name),
      position: String(data.get("position") || ""),
      squadNumber: data.get("squadNumber") ? Number(data.get("squadNumber")) : null,
      dateOfBirth: String(data.get("dateOfBirth") || ""),
      nationality: String(data.get("nationality") || ""),
      photoUrl,
      extraPhotos: extras,
      photoCutout: cutout,
      bio: String(data.get("bio") || ""),
      role,
      title: String(data.get("title") || ""),
      stats: {
        appearances: num(data.get("appearances")),
        goals: num(data.get("goals")),
        assists: num(data.get("assists")),
      },
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
      <div>
        <label htmlFor="name" className={labelClass}>
          Name
        </label>
        <input
          id="name"
          name="name"
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
          Slug (used in the profile URL)
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
        <span className={labelClass}>Role</span>
        <div className="flex flex-wrap gap-2">
          {(["player", "coach", "technical_staff", "management"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`rounded-xl border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors duration-200 ease-smooth ${
                role === r
                  ? "border-cyan bg-cyan/10 text-navy"
                  : "border-navy/15 text-navy/50 hover:border-navy/30"
              }`}
            >
              {r.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {role !== "player" && (
        <div>
          <label htmlFor="title" className={labelClass}>
            Title (e.g. "Head Coach", "Chairman")
          </label>
          <input id="title" name="title" defaultValue={initial?.title} className={fieldClass} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-5">
        <div>
          <label htmlFor="position" className={labelClass}>
            Position
          </label>
          <input
            id="position"
            name="position"
            defaultValue={initial?.position}
            placeholder="e.g. Striker"
            list="player-positions"
            className={fieldClass}
          />
          <datalist id="player-positions">
            {POSITIONS.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
          <p className="mt-1 text-[11px] text-navy/40">Positions decide the order on the team page: goalkeepers, defenders, midfielders, then forwards.</p>
        </div>
        <div>
          <label htmlFor="squadNumber" className={labelClass}>
            Squad number
          </label>
          <input
            id="squadNumber"
            name="squadNumber"
            type="number"
            min={1}
            defaultValue={initial?.squadNumber ?? undefined}
            className={fieldClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <label htmlFor="dateOfBirth" className={labelClass}>
            Date of birth
          </label>
          <input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            defaultValue={initial?.dateOfBirth?.slice(0, 10)}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="nationality" className={labelClass}>
            Nationality
          </label>
          <input id="nationality" name="nationality" defaultValue={initial?.nationality} className={fieldClass} />
        </div>
      </div>

      <div>
        <span className={labelClass}>Photo</span>
        <CloudinaryUpload
          value={photoUrl}
          onChange={setPhotoUrl}
          folder="eko-united-fc/players"
          hint="Best: a standing portrait, 3:4, 1200×1600px (minimum 900×1200px), JPG, PNG or WebP under 2MB. Full length or head to knees works best. Shown tall, never stretched wide."
        />

        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl bg-navy/[0.04] p-4 text-sm text-navy">
          <input type="checkbox" checked={cutout} onChange={(e) => setCutout(e.target.checked)} className="mt-0.5 h-4 w-4 accent-navy" />
          <span>
            <span className="font-semibold">Remove the photo background</span>
            <span className="mt-1 block text-xs leading-relaxed text-navy/55">
              The website shows the player cut out from the background, standing on the page. Applies to the
              main photo and the additional photos. Your original uploads are kept untouched, so you can
              switch this off at any time.
            </span>
          </span>
        </label>
      </div>

      <div>
        <span className={labelClass}>Additional photos (optional, up to {MAX_EXTRA})</span>
        <div className="space-y-4">
          {extraPhotos.map((url, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex-1">
                <CloudinaryUpload
                  value={url}
                  onChange={(next) => setExtraPhotos((prev) => prev.map((u, idx) => (idx === i ? next : u)))}
                  folder="eko-united-fc/players"
                  hint="Portrait 3:4, 1200×1600px. Shown on the player's own page beside the main photo."
                />
              </div>
              <button
                type="button"
                onClick={() => setExtraPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                className="mt-4 text-xs font-semibold text-navy/40 transition-colors duration-200 ease-smooth hover:text-red-500"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        {extraPhotos.length < MAX_EXTRA && (
          <button
            type="button"
            onClick={() => setExtraPhotos((prev) => [...prev, ""])}
            className="btn-glass btn-glass-navy mt-3 px-5 py-2.5 text-xs font-bold uppercase tracking-wide"
          >
            + Add photo
          </button>
        )}
      </div>

      <div>
        <label htmlFor="bio" className={labelClass}>
          Bio (optional)
        </label>
        <textarea id="bio" name="bio" rows={3} defaultValue={initial?.bio} className={fieldClass} />
      </div>

      {role === "player" && (
        <div className="grid grid-cols-3 gap-5">
          <div>
            <label htmlFor="appearances" className={labelClass}>
              Appearances
            </label>
            <input
              id="appearances"
              name="appearances"
              type="number"
              min={0}
              defaultValue={initial?.stats?.appearances ?? 0}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="goals" className={labelClass}>
              Goals
            </label>
            <input
              id="goals"
              name="goals"
              type="number"
              min={0}
              defaultValue={initial?.stats?.goals ?? 0}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="assists" className={labelClass}>
              Assists
            </label>
            <input
              id="assists"
              name="assists"
              type="number"
              min={0}
              defaultValue={initial?.stats?.assists ?? 0}
              className={fieldClass}
            />
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving || preparing}
        className="btn-glass btn-glass-yellow px-8 py-3 text-sm font-bold uppercase tracking-wide disabled:opacity-60"
      >
        {preparing ? "Preparing photos…" : saving ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
