"use client";

import { useEffect, useState, type FormEvent } from "react";
import AdminShell from "@/components/admin/AdminShell";
import CloudinaryUpload from "@/components/admin/CloudinaryUpload";
import { isAllowedImageUrl } from "@/lib/imageHosts";
import { adminFetch, revalidatePublicPaths } from "@/lib/adminApi";

type HeroBanner = { imageUrl: string; headline: string; linkUrl: string };

type Settings = {
  heroBanners: HeroBanner[];
  clubInfo: {
    history: string;
    vision: string;
    mission: string;
    stadiumInfo: string;
    address: string;
    phone: string;
    email: string;
  };
  socialLinks: {
    instagram: string;
    twitter: string;
    facebook: string;
    youtube: string;
    tiktok: string;
  };
  footerContent: string;
  seoDefaults: { title: string; description: string };
};

const EMPTY: Settings = {
  heroBanners: [],
  clubInfo: { history: "", vision: "", mission: "", stadiumInfo: "", address: "", phone: "", email: "" },
  socialLinks: { instagram: "", twitter: "", facebook: "", youtube: "", tiktok: "" },
  footerContent: "",
  seoDefaults: { title: "", description: "" },
};

const fieldClass =
  "w-full border-b border-navy/20 bg-transparent px-1 py-3 text-sm text-navy outline-none transition-colors duration-200 ease-smooth placeholder:text-navy/30 focus:border-cyan";
const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-wide text-navy/50";
const sectionClass = "border-t border-navy/10 pt-8";
const MAX_BANNERS = 5;

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    adminFetch<Partial<Settings>>("/settings")
      .then((data) =>
        setSettings({
          heroBanners: data.heroBanners || [],
          clubInfo: { ...EMPTY.clubInfo, ...data.clubInfo },
          socialLinks: { ...EMPTY.socialLinks, ...data.socialLinks },
          footerContent: data.footerContent || "",
          seoDefaults: { ...EMPTY.seoDefaults, ...data.seoDefaults },
        })
      )
      .catch((err) => setError(err.message));
  }, []);

  function updateBanner(i: number, patch: Partial<HeroBanner>) {
    setSettings((prev) =>
      prev
        ? { ...prev, heroBanners: prev.heroBanners.map((b, idx) => (idx === i ? { ...b, ...patch } : b)) }
        : prev
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!settings) return;
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const cleanBanners = settings.heroBanners.filter((b) => b.imageUrl && isAllowedImageUrl(b.imageUrl));
      await adminFetch("/settings", {
        method: "PUT",
        body: JSON.stringify({ ...settings, heroBanners: cleanBanners }),
      });
      await revalidatePublicPaths(["/", "/about"]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminShell>
      {() => (
        <div className="px-6 py-16 sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Site</p>
          <h1 className="display-title font-display mt-2 mb-10">Settings</h1>

          {!settings ? (
            <p className="text-navy/50">{error || "Loading…"}</p>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-2xl space-y-10">
              <div>
                <span className={labelClass}>Hero banners (homepage carousel, up to {MAX_BANNERS})</span>
                <div className="space-y-6">
                  {settings.heroBanners.map((banner, i) => (
                    <div key={i} className="space-y-3 border border-navy/10 p-4">
                      <CloudinaryUpload
                        value={banner.imageUrl}
                        onChange={(url) => updateBanner(i, { imageUrl: url })}
                        folder="eko-united-fc/hero"
                        hint="Recommended: wide landscape banner, at least 1600×900px."
                      />
                      <input
                        value={banner.headline}
                        onChange={(e) => updateBanner(i, { headline: e.target.value })}
                        placeholder="Headline (optional)"
                        className={fieldClass}
                      />
                      <input
                        value={banner.linkUrl}
                        onChange={(e) => updateBanner(i, { linkUrl: e.target.value })}
                        placeholder="Link URL (optional)"
                        className={fieldClass}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setSettings((prev) =>
                            prev ? { ...prev, heroBanners: prev.heroBanners.filter((_, idx) => idx !== i) } : prev
                          )
                        }
                        className="text-xs font-semibold text-navy/40 transition-colors duration-200 ease-smooth hover:text-red-500"
                      >
                        Remove banner
                      </button>
                    </div>
                  ))}
                </div>
                {settings.heroBanners.length < MAX_BANNERS && (
                  <button
                    type="button"
                    onClick={() =>
                      setSettings((prev) =>
                        prev
                          ? { ...prev, heroBanners: [...prev.heroBanners, { imageUrl: "", headline: "", linkUrl: "" }] }
                          : prev
                      )
                    }
                    className="mt-3 text-xs font-semibold uppercase tracking-wide text-cyan transition-colors duration-200 ease-smooth hover:text-navy"
                  >
                    + Add banner
                  </button>
                )}
              </div>

              <div className={sectionClass}>
                <p className="mb-4 font-display text-lg text-navy">Club Info</p>
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>History (About page summary)</label>
                    <textarea
                      rows={3}
                      value={settings.clubInfo.history}
                      onChange={(e) => setSettings({ ...settings, clubInfo: { ...settings.clubInfo, history: e.target.value } })}
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Vision</label>
                    <textarea
                      rows={2}
                      value={settings.clubInfo.vision}
                      onChange={(e) => setSettings({ ...settings, clubInfo: { ...settings.clubInfo, vision: e.target.value } })}
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Mission</label>
                    <textarea
                      rows={2}
                      value={settings.clubInfo.mission}
                      onChange={(e) => setSettings({ ...settings, clubInfo: { ...settings.clubInfo, mission: e.target.value } })}
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Stadium info</label>
                    <textarea
                      rows={2}
                      value={settings.clubInfo.stadiumInfo}
                      onChange={(e) => setSettings({ ...settings, clubInfo: { ...settings.clubInfo, stadiumInfo: e.target.value } })}
                      className={fieldClass}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <input
                      value={settings.clubInfo.address}
                      onChange={(e) => setSettings({ ...settings, clubInfo: { ...settings.clubInfo, address: e.target.value } })}
                      placeholder="Address"
                      className={fieldClass}
                    />
                    <input
                      value={settings.clubInfo.phone}
                      onChange={(e) => setSettings({ ...settings, clubInfo: { ...settings.clubInfo, phone: e.target.value } })}
                      placeholder="Phone"
                      className={fieldClass}
                    />
                    <input
                      value={settings.clubInfo.email}
                      onChange={(e) => setSettings({ ...settings, clubInfo: { ...settings.clubInfo, email: e.target.value } })}
                      placeholder="Email"
                      className={fieldClass}
                    />
                  </div>
                </div>
              </div>

              <div className={sectionClass}>
                <p className="mb-4 font-display text-lg text-navy">Social Links</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {(["instagram", "twitter", "facebook", "youtube", "tiktok"] as const).map((platform) => (
                    <input
                      key={platform}
                      value={settings.socialLinks[platform]}
                      onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, [platform]: e.target.value } })}
                      placeholder={`${platform[0].toUpperCase()}${platform.slice(1)} URL`}
                      className={fieldClass}
                    />
                  ))}
                </div>
              </div>

              <div className={sectionClass}>
                <p className="mb-4 font-display text-lg text-navy">Footer &amp; SEO</p>
                <div className="space-y-4">
                  <textarea
                    rows={2}
                    value={settings.footerContent}
                    onChange={(e) => setSettings({ ...settings, footerContent: e.target.value })}
                    placeholder="Footer content (optional)"
                    className={fieldClass}
                  />
                  <input
                    value={settings.seoDefaults.title}
                    onChange={(e) => setSettings({ ...settings, seoDefaults: { ...settings.seoDefaults, title: e.target.value } })}
                    placeholder="Default SEO title"
                    className={fieldClass}
                  />
                  <textarea
                    rows={2}
                    value={settings.seoDefaults.description}
                    onChange={(e) => setSettings({ ...settings, seoDefaults: { ...settings.seoDefaults, description: e.target.value } })}
                    placeholder="Default SEO description"
                    className={fieldClass}
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500" role="alert">
                  {error}
                </p>
              )}
              {saved && <p className="text-sm text-cyan">Saved.</p>}

              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-yellow px-8 py-3 text-sm font-bold uppercase tracking-wide text-navy-dark transition-transform duration-300 ease-smooth hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
              >
                {saving ? "Saving…" : "Save settings"}
              </button>
            </form>
          )}
        </div>
      )}
    </AdminShell>
  );
}
