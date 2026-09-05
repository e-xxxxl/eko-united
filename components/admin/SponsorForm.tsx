"use client";

import { useState, type FormEvent } from "react";
import CloudinaryUpload from "@/components/admin/CloudinaryUpload";
import { isAllowedImageUrl } from "@/lib/imageHosts";

export type SponsorFormValues = {
  name: string;
  logoUrl: string;
  website: string;
  tier: "principal" | "partner" | "supplier";
  displayOrder: number;
};

const fieldClass =
  "w-full border-b border-navy/20 bg-transparent px-1 py-3 text-sm text-navy outline-none transition-colors duration-200 ease-smooth placeholder:text-navy/30 focus:border-cyan";
const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-wide text-navy/50";

export default function SponsorForm({
  initial,
  onSave,
  saving,
  error,
}: {
  initial?: Partial<SponsorFormValues>;
  onSave: (values: SponsorFormValues) => void;
  saving: boolean;
  error: string;
}) {
  const [tier, setTier] = useState<SponsorFormValues["tier"]>(initial?.tier || "partner");
  const [logoUrl, setLogoUrl] = useState(initial?.logoUrl || "");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Both checks have their own inline error already visible in the form —
    // this just stops the actual save, doesn't duplicate the messaging.
    if (!logoUrl || !isAllowedImageUrl(logoUrl)) return;
    const data = new FormData(event.currentTarget);
    onSave({
      name: String(data.get("name") || ""),
      logoUrl,
      website: String(data.get("website") || ""),
      tier,
      displayOrder: Number(data.get("displayOrder") || 0),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
      <div>
        <label htmlFor="name" className={labelClass}>
          Sponsor name
        </label>
        <input id="name" name="name" required defaultValue={initial?.name} className={fieldClass} />
      </div>

      <div>
        <span className={labelClass}>Logo</span>
        <CloudinaryUpload
          value={logoUrl}
          onChange={setLogoUrl}
          folder="eko-united-fc/sponsors"
          hint="Recommended: logo on a transparent or white background, at least 400px wide."
        />
        {!logoUrl && (
          <p className="mt-2 text-xs text-red-500" role="alert">
            A logo is required.
          </p>
        )}
      </div>

      <div>
        <label htmlFor="website" className={labelClass}>
          Website (optional)
        </label>
        <input
          id="website"
          name="website"
          type="url"
          defaultValue={initial?.website}
          placeholder="https://"
          className={fieldClass}
        />
      </div>

      <div>
        <span className={labelClass}>Tier</span>
        <div className="flex gap-2">
          {(["principal", "partner", "supplier"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTier(t)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors duration-200 ease-smooth ${
                tier === t
                  ? "border-cyan bg-cyan/10 text-navy"
                  : "border-navy/15 text-navy/50 hover:border-navy/30"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
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
        <p className="mt-1 text-xs text-navy/40">Lower numbers show first within a tier.</p>
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
        {saving ? "Saving…" : "Save sponsor"}
      </button>
    </form>
  );
}
