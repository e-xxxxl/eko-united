"use client";

import { useEffect, useState, type FormEvent } from "react";
import AdminShell from "@/components/admin/AdminShell";
import MembershipTabs from "@/components/admin/MembershipTabs";
import CloudinaryUpload from "@/components/admin/CloudinaryUpload";
import { adminFetch, revalidatePublicPaths } from "@/lib/adminApi";
import { isAllowedImageUrl } from "@/lib/imageHosts";
import type { MembershipContent } from "@/lib/membershipTypes";

const fieldClass =
  "w-full border-b border-navy/20 bg-transparent px-1 py-3 text-sm text-navy outline-none transition-colors duration-200 ease-smooth placeholder:text-navy/30 focus:border-cyan";
const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-wide text-navy/50";
const MAX_GALLERY = 8;

export default function AdminMembershipContentPage() {
  const [content, setContent] = useState<MembershipContent | null>(null);
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [gallery, setGallery] = useState<{ url: string; caption: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetch<MembershipContent>("/membership/content")
      .then((c) => {
        setContent(c);
        setHeroImageUrl(c.heroImageUrl || "");
        setGallery((c.gallery || []).map((g) => ({ url: g.url, caption: g.caption || "" })));
      })
      .catch((err) => setError(err.message));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (heroImageUrl && !isAllowedImageUrl(heroImageUrl)) return;
    setSaving(true);
    setSaved(false);
    setError("");
    const data = new FormData(event.currentTarget);
    const text = (k: string) => String(data.get(k) || "").trim();
    try {
      await adminFetch("/membership/content", {
        method: "PUT",
        body: JSON.stringify({
          eyebrow: text("eyebrow"),
          title: text("title"),
          intro: text("intro"),
          heroImageUrl,
          galleryHeading: text("galleryHeading"),
          gallery: gallery.filter((g) => g.url && isAllowedImageUrl(g.url)),
        }),
      });
      await revalidatePublicPaths(["/membership"]);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminShell>
      {() => (
        <div className="px-6 py-16 sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Membership</p>
          <h1 className="display-title font-display mt-2 mb-6">Page content</h1>
          <MembershipTabs current="/admin/membership/content" />

          {error && !content && (
            <p className="text-sm text-red-500" role="alert">
              {error}
            </p>
          )}

          {content && (
            <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
              <div>
                <label htmlFor="eyebrow" className={labelClass}>
                  Small heading above the title
                </label>
                <input id="eyebrow" name="eyebrow" defaultValue={content.eyebrow} className={fieldClass} />
              </div>
              <div>
                <label htmlFor="title" className={labelClass}>
                  Page title
                </label>
                <input id="title" name="title" defaultValue={content.title} className={fieldClass} />
              </div>
              <div>
                <label htmlFor="intro" className={labelClass}>
                  Introduction
                </label>
                <textarea id="intro" name="intro" rows={4} defaultValue={content.intro} className={fieldClass} />
              </div>

              <div>
                <span className={labelClass}>Top banner photo</span>
                <CloudinaryUpload
                  value={heroImageUrl}
                  onChange={setHeroImageUrl}
                  folder="eko-united-fc/membership"
                  hint="Best: landscape 16:9, 2400×1350px (minimum 1600×900px), JPG or WebP under 1MB. Fills the top of the page behind the title, so keep faces in the middle and above the bottom third. Leave empty for the plain navy banner."
                />
              </div>

              <div>
                <label htmlFor="galleryHeading" className={labelClass}>
                  Photo gallery heading
                </label>
                <input id="galleryHeading" name="galleryHeading" defaultValue={content.galleryHeading} className={fieldClass} />
              </div>

              <div>
                <span className={labelClass}>Gallery photos (optional, up to {MAX_GALLERY})</span>
                <div className="space-y-4">
                  {gallery.map((g, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-2xl border border-navy/10 p-4">
                      <div className="flex-1">
                        <CloudinaryUpload
                          value={g.url}
                          onChange={(url) => setGallery((prev) => prev.map((x, idx) => (idx === i ? { ...x, url } : x)))}
                          folder="eko-united-fc/membership"
                          hint="Any orientation, 1600px wide or more. Shown in a mosaic and cropped to fit its tile, so keep the subject near the centre."
                        />
                        <input
                          value={g.caption}
                          onChange={(e) =>
                            setGallery((prev) => prev.map((x, idx) => (idx === i ? { ...x, caption: e.target.value } : x)))
                          }
                          placeholder="Caption (optional, shown on hover)"
                          maxLength={120}
                          className={`${fieldClass} mt-3`}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setGallery((prev) => prev.filter((_, idx) => idx !== i))}
                        className="mt-2 text-xs font-semibold text-navy/40 transition-colors duration-200 ease-smooth hover:text-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                {gallery.length < MAX_GALLERY && (
                  <button
                    type="button"
                    onClick={() => setGallery((prev) => [...prev, { url: "", caption: "" }])}
                    className="btn-glass btn-glass-navy mt-3 px-5 py-2.5 text-xs font-bold uppercase tracking-wide"
                  >
                    + Add photo
                  </button>
                )}
              </div>

              {error && (
                <p className="text-sm text-red-500" role="alert">
                  {error}
                </p>
              )}
              {saved && <p className="text-sm text-navy/60">Saved. The membership page is updated.</p>}

              <button
                type="submit"
                disabled={saving}
                className="btn-glass btn-glass-yellow px-8 py-3 text-sm font-bold uppercase tracking-wide disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save page content"}
              </button>
            </form>
          )}
        </div>
      )}
    </AdminShell>
  );
}
