"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import CloudinaryUpload from "@/components/admin/CloudinaryUpload";
import { adminFetch, revalidatePublicPaths } from "@/lib/adminApi";
import { isAllowedImageUrl } from "@/lib/imageHosts";
import { PAGE_PHOTO_PAGES, type PagePhotoKey } from "@/lib/pagePhotos";

type Photos = Record<string, string[]>;

function PageCard({ pageKey, label, initial }: { pageKey: PagePhotoKey; label: string; initial: string[] }) {
  const [images, setImages] = useState<string[]>(initial);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  async function save() {
    setSaving(true);
    setStatus("");
    try {
      await adminFetch(`/page-photos/${pageKey}`, {
        method: "PUT",
        body: JSON.stringify({ images: images.filter((u) => u && isAllowedImageUrl(u)).slice(0, 3) }),
      });
      await revalidatePublicPaths([`/${pageKey}`]);
      setStatus("Saved.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-navy/10 p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-display text-2xl font-bold text-navy">{label}</h2>
        <a href={`/${pageKey}`} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold uppercase tracking-wide text-cyan hover:text-navy">
          View page
        </a>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i}>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-navy/45">
              {i === 0 ? "Large photo (tall)" : `Photo ${i + 1} (square)`}
            </p>
            <CloudinaryUpload
              value={images[i] || ""}
              onChange={(url) =>
                setImages((prev) => {
                  const next = [...prev];
                  while (next.length < 3) next.push("");
                  next[i] = url;
                  return next;
                })
              }
              folder="eko-united-fc/pages"
              hint={i === 0 ? "Portrait 3:4, 1200×1600px or larger." : "Square 1:1, 1000×1000px or larger."}
            />
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="btn-glass btn-glass-yellow px-6 py-2.5 text-xs font-bold uppercase tracking-wide disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save photos"}
        </button>
        {status && <span className="text-sm text-navy/60">{status}</span>}
      </div>
    </section>
  );
}

export default function AdminPagePhotosPage() {
  const [photos, setPhotos] = useState<Photos | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetch<Photos>("/page-photos")
      .then(setPhotos)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <AdminShell>
      {() => (
        <div className="px-6 py-16 sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Content</p>
          <h1 className="display-title font-display mt-2">Page photos</h1>
          <p className="mb-8 mt-3 max-w-2xl text-sm leading-relaxed text-navy/55">
            Each of these pages opens with a collage of up to three photos. Upload your own here; a page with no photos
            shows the site&apos;s default football photography. Photos are cropped to fit their frames, so keep the
            subject near the middle.
          </p>

          {error && (
            <p className="mb-4 text-sm text-red-500" role="alert">
              {error}
            </p>
          )}

          {photos === null && !error ? (
            <p className="text-navy/50">Loading…</p>
          ) : (
            <div className="space-y-6">
              {PAGE_PHOTO_PAGES.map((p) => (
                <PageCard key={p.key} pageKey={p.key} label={p.label} initial={photos?.[p.key] || []} />
              ))}
            </div>
          )}
        </div>
      )}
    </AdminShell>
  );
}
