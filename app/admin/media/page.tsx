"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { clsx } from "clsx";
import AdminShell from "@/components/admin/AdminShell";
import { adminFetch } from "@/lib/adminApi";
import { formatBytes, thumbUrl, type MediaItem, type MediaPage } from "@/lib/mediaTypes";

type Filter = "all" | "used" | "unused";

export default function AdminMediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async (next?: string | null) => {
    setLoading(true);
    setError("");
    try {
      const page = await adminFetch<MediaPage>(`/media${next ? `?cursor=${encodeURIComponent(next)}` : ""}`);
      setItems((prev) => (next ? [...prev, ...page.items] : page.items));
      setCursor(page.nextCursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the library.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      if (filter === "used" && i.usedBy.length === 0) return false;
      if (filter === "unused" && i.usedBy.length > 0) return false;
      if (!q) return true;
      return i.usedBy.some((l) => l.toLowerCase().includes(q)) || i.publicId.toLowerCase().includes(q);
    });
  }, [items, query, filter]);

  const unusedCount = items.filter((i) => i.usedBy.length === 0).length;
  const unusedBytes = items.filter((i) => i.usedBy.length === 0).reduce((n, i) => n + i.bytes, 0);

  async function remove(item: MediaItem) {
    if (!confirm("Permanently delete this photo from Cloudinary? This cannot be undone.")) return;
    setDeleting(item.publicId);
    setError("");
    try {
      await adminFetch("/media/delete", { method: "POST", body: JSON.stringify({ publicId: item.publicId }) });
      setItems((prev) => prev.filter((i) => i.publicId !== item.publicId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete it.");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <AdminShell>
      {() => (
        <div className="px-6 py-16 sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Content</p>
          <h1 className="display-title font-display mt-2">Photo library</h1>
          <p className="mb-8 mt-3 max-w-2xl text-sm leading-relaxed text-navy/55">
            Every photo uploaded to Cloudinary, labelled with where the site uses it. When you add a photo anywhere in
            the admin, choose it from here instead of uploading it again, so the same picture is only ever stored once.
            Photos marked &quot;Not used anywhere yet&quot; can be deleted to free space (super admin only).
          </p>

          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by player, article, product..."
              className="w-full rounded-xl border border-navy/15 bg-white px-4 py-2.5 text-sm text-navy outline-none focus:border-cyan sm:max-w-xs"
            />
            <div className="flex gap-2">
              {(["all", "used", "unused"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={clsx(
                    "rounded-lg px-4 py-2 text-xs font-semibold capitalize transition-colors duration-200 ease-smooth",
                    filter === f ? "bg-navy text-white" : "bg-navy/[0.05] text-navy/60 hover:bg-navy/10"
                  )}
                >
                  {f === "unused" ? `Not used (${unusedCount})` : f}
                </button>
              ))}
            </div>
            {unusedCount > 0 && (
              <p className="text-xs text-navy/45">Unused so far: {formatBytes(unusedBytes)} in {unusedCount} photos loaded</p>
            )}
          </div>

          {error && (
            <p className="mb-4 text-sm text-red-500" role="alert">
              {error}
            </p>
          )}

          <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
            {shown.map((item) => (
              <div key={item.publicId}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-navy/[0.06]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumbUrl(item.url)} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                </div>
                {item.usedBy.length > 0 ? (
                  <ul className="mt-2 space-y-0.5">
                    {item.usedBy.slice(0, 3).map((l) => (
                      <li key={l} className="text-xs font-semibold leading-snug text-navy">
                        {l}
                      </li>
                    ))}
                    {item.usedBy.length > 3 && <li className="text-[11px] text-navy/40">+{item.usedBy.length - 3} more</li>}
                  </ul>
                ) : (
                  <p className="mt-2 text-xs font-semibold text-navy/40">Not used anywhere yet</p>
                )}
                <p className="mt-1 text-[11px] text-navy/35">
                  {item.width}×{item.height} · {formatBytes(item.bytes)}
                </p>
                {item.usedBy.length === 0 && (
                  <button
                    type="button"
                    onClick={() => remove(item)}
                    disabled={deleting === item.publicId}
                    className="mt-1.5 text-xs font-semibold text-navy/40 transition-colors duration-200 ease-smooth hover:text-red-500 disabled:opacity-50"
                  >
                    {deleting === item.publicId ? "Deleting…" : "Delete"}
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            {loading && <p className="text-sm text-navy/50">Loading photos…</p>}
            {!loading && cursor && (
              <button
                type="button"
                onClick={() => load(cursor)}
                className="btn-glass btn-glass-navy px-6 py-2.5 text-xs font-bold uppercase tracking-wide"
              >
                Load more
              </button>
            )}
            {!loading && !error && shown.length === 0 && <p className="text-navy/50">No photos match.</p>}
          </div>
        </div>
      )}
    </AdminShell>
  );
}
