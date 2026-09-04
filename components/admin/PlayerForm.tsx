"use client";

import { useState, type FormEvent } from "react";
import CloudinaryUpload from "@/components/admin/CloudinaryUpload";
import { isAllowedImageUrl } from "@/lib/imageHosts";
import { slugify } from "@/lib/slugify";

export type PlayerFormValues = {
  name: string;
  slug: string;
  position: string;
  squadNumber: number | null;
  dateOfBirth: string;
  nationality: string;
  photoUrl: string;
  bio: string;
  role: "player" | "coach" | "technical_staff" | "management";
  title: string;
  stats: { appearances: number; goals: number; assists: number };
};

const fieldClass =
  "w-full border-b border-navy/20 bg-transparent px-1 py-3 text-sm text-navy outline-none transition-colors duration-200 ease-smooth placeholder:text-navy/30 focus:border-cyan";
const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-wide text-navy/50";

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
  const [name, setName] = useState(initial?.name || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (photoUrl && !isAllowedImageUrl(photoUrl)) return;
    const data = new FormData(event.currentTarget);
    const num = (v: FormDataEntryValue | null) => (v ? Number(v) : 0);
    onSave({
      name,
      slug: slug || slugify(name),
      position: String(data.get("position") || ""),
      squadNumber: data.get("squadNumber") ? Number(data.get("squadNumber")) : null,
      dateOfBirth: String(data.get("dateOfBirth") || ""),
      nationality: String(data.get("nationality") || ""),
      photoUrl,
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
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors duration-200 ease-smooth ${
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
            className={fieldClass}
          />
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
        <CloudinaryUpload value={photoUrl} onChange={setPhotoUrl} folder="eko-united-fc/players" />
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
        disabled={saving}
        className="rounded-full bg-yellow px-8 py-3 text-sm font-bold uppercase tracking-wide text-navy-dark transition-transform duration-300 ease-smooth hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
      >
        {saving ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
