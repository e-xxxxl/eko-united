"use client";

import { useRef, useState, type FormEvent } from "react";
import CloudinaryUpload from "@/components/admin/CloudinaryUpload";
import { isAllowedImageUrl } from "@/lib/imageHosts";
import type { MembershipTier } from "@/lib/membershipTypes";

export type TierFormValues = Pick<
  MembershipTier,
  "name" | "audience" | "price" | "period" | "tagline" | "badge" | "imageUrl" | "perks" | "displayOrder" | "isActive"
>;

const fieldClass =
  "w-full border-b border-navy/20 bg-transparent px-1 py-3 text-sm text-navy outline-none transition-colors duration-200 ease-smooth placeholder:text-navy/30 focus:border-cyan";
const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-wide text-navy/50";
const tinyButton =
  "rounded-lg px-2.5 py-1.5 text-xs font-semibold text-navy/50 transition-colors duration-200 ease-smooth hover:bg-navy/5 hover:text-navy disabled:opacity-30 disabled:hover:bg-transparent";

export default function MembershipTierForm({
  initial,
  onSave,
  saving,
  error,
}: {
  initial?: Partial<TierFormValues>;
  onSave: (values: TierFormValues) => void;
  saving: boolean;
  error: string;
}) {
  const idRef = useRef(0);
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl || "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [perks, setPerks] = useState<{ id: number; text: string }[]>(() =>
    (initial?.perks?.length ? initial.perks : [""]).map((text) => ({ id: ++idRef.current, text }))
  );

  function move(i: number, dir: -1 | 1) {
    setPerks((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const copy = [...prev];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (imageUrl && !isAllowedImageUrl(imageUrl)) return;
    const data = new FormData(event.currentTarget);
    const text = (k: string) => String(data.get(k) || "").trim();
    onSave({
      name: text("name"),
      audience: text("audience"),
      price: text("price"),
      period: text("period"),
      tagline: text("tagline"),
      badge: text("badge"),
      imageUrl,
      perks: perks.map((p) => p.text.trim()).filter(Boolean),
      displayOrder: Number(data.get("displayOrder") || 0),
      isActive,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>
            Package name
          </label>
          <input id="name" name="name" required defaultValue={initial?.name} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="audience" className={labelClass}>
            Who it is for (optional)
          </label>
          <input
            id="audience"
            name="audience"
            defaultValue={initial?.audience}
            placeholder="e.g. For individuals"
            className={fieldClass}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="price" className={labelClass}>
            Price (shown exactly as typed)
          </label>
          <input id="price" name="price" required defaultValue={initial?.price} placeholder="₦500,000" className={fieldClass} />
        </div>
        <div>
          <label htmlFor="period" className={labelClass}>
            Period (optional)
          </label>
          <input
            id="period"
            name="period"
            defaultValue={initial?.period}
            placeholder="per year (empty for a one-off fee)"
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="tagline" className={labelClass}>
          One-line pitch (optional)
        </label>
        <input
          id="tagline"
          name="tagline"
          defaultValue={initial?.tagline}
          maxLength={200}
          placeholder="A short sentence that sells the package"
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="badge" className={labelClass}>
          Ribbon on the card (optional)
        </label>
        <input id="badge" name="badge" defaultValue={initial?.badge} maxLength={30} placeholder="e.g. Most exclusive" className={fieldClass} />
      </div>

      <div>
        <span className={labelClass}>Package photo</span>
        <CloudinaryUpload
          value={imageUrl}
          onChange={setImageUrl}
          folder="eko-united-fc/membership"
          hint="Best: landscape 16:11, 1600×1100px (minimum 1200×825px), JPG or WebP under 1MB. Shown at the top of the package card and beside the application form. Leave empty to show the club crest instead."
        />
      </div>

      <div>
        <span className={labelClass}>Perks</span>
        <p className="mb-3 text-xs text-navy/45">
          One perk per box. The first four show on the card; the rest open with "See all perks".
        </p>
        <div className="space-y-2">
          {perks.map((perk, i) => (
            <div key={perk.id} className="flex items-start gap-2">
              <textarea
                value={perk.text}
                rows={2}
                onChange={(e) => setPerks((prev) => prev.map((p) => (p.id === perk.id ? { ...p, text: e.target.value } : p)))}
                placeholder={`Perk ${i + 1}`}
                className="flex-1 resize-y rounded-xl border border-navy/15 bg-white px-3 py-2 text-sm leading-relaxed text-navy outline-none focus:border-cyan"
              />
              <div className="flex flex-col">
                <button type="button" className={tinyButton} disabled={i === 0} onClick={() => move(i, -1)}>
                  Up
                </button>
                <button type="button" className={tinyButton} disabled={i === perks.length - 1} onClick={() => move(i, 1)}>
                  Down
                </button>
                <button
                  type="button"
                  className={`${tinyButton} hover:!text-red-500`}
                  onClick={() =>
                    setPerks((prev) => (prev.length > 1 ? prev.filter((p) => p.id !== perk.id) : [{ id: perk.id, text: "" }]))
                  }
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setPerks((prev) => [...prev, { id: ++idRef.current, text: "" }])}
          className="btn-glass btn-glass-navy mt-3 px-5 py-2.5 text-xs font-bold uppercase tracking-wide"
        >
          + Add perk
        </button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="displayOrder" className={labelClass}>
            Display order (1 shows first)
          </label>
          <input id="displayOrder" name="displayOrder" type="number" defaultValue={initial?.displayOrder ?? 0} className={fieldClass} />
        </div>
        <label className="flex cursor-pointer items-end gap-3 pb-3 text-sm text-navy">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 accent-navy" />
          Show on the website
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
        {saving ? "Saving…" : "Save package"}
      </button>
    </form>
  );
}
