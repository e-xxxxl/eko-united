"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { clsx } from "clsx";
import { adminFetch } from "@/lib/adminApi";
import { formatBytes, thumbUrl, type MediaItem, type MediaPage } from "@/lib/mediaTypes";

// A window over everything already uploaded to Cloudinary. Choosing a photo
// hands its URL back, so the same photo can be reused anywhere instead of
// uploaded again (and stored twice). Each photo shows where the site already
// uses it, such as the player's name.
export default function MediaPicker({
  onSelect,
  onClose,
}: {
  onSelect: (url: string) => void;
  onClose: () => void;
}) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [folder, setFolder] = useState("all");

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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const folders = useMemo(() => {
    const set = new Set(items.map((i) => i.folder.split("/").pop() || "other"));
    return ["all", ...Array.from(set)];
  }, [items]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      if (folder !== "all" && (i.folder.split("/").pop() || "other") !== folder) return false;
      if (!q) return true;
      return i.usedBy.some((l) => l.toLowerCase().includes(q)) || i.publicId.toLowerCase().includes(q);
    });
  }, [items, query, folder]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Choose from the photo library"
      className="fixed inset-0 z-[100] flex items-end justify-center bg-navy-dark/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:h-[85vh] sm:rounded-3xl">
        <div className="flex items-center justify-between gap-4 border-b border-navy/10 px-5 py-4 sm:px-7">
          <div>
            <h2 className="font-display text-2xl font-bold text-navy">Photo library</h2>
            <p className="text-xs text-navy/50">Pick a photo that is already uploaded. Nothing new is stored.</p>
          </div>
          <button type="button" onClick={onClose} className="btn-glass btn-glass-navy px-4 py-2 text-xs font-bold uppercase tracking-wide">
            Close
          </button>
        </div>

        <div className="flex flex-col gap-3 border-b border-navy/10 px-5 py-3 sm:flex-row sm:items-center sm:px-7">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            // This window sits inside the page's form, so Enter must not submit it.
            onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
            placeholder="Search by player, article, product..."
            className="w-full rounded-xl border border-navy/15 bg-white px-4 py-2.5 text-sm text-navy outline-none focus:border-cyan sm:max-w-xs"
          />
          <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {folders.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFolder(f)}
                className={clsx(
                  "shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors duration-200 ease-smooth",
                  folder === f ? "bg-navy text-white" : "bg-navy/[0.05] text-navy/60 hover:bg-navy/10"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7">
          {error && (
            <p className="mb-4 text-sm text-red-500" role="alert">
              {error}
            </p>
          )}
          {shown.length === 0 && !loading && !error && <p className="text-navy/50">No photos match.</p>}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {shown.map((item) => (
              <button
                key={item.publicId}
                type="button"
                onClick={() => onSelect(item.url)}
                className="group text-left"
              >
                <span className="relative block aspect-[4/5] overflow-hidden rounded-xl bg-navy/[0.06] ring-2 ring-transparent transition-all duration-200 ease-smooth group-hover:ring-cyan">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumbUrl(item.url)} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                </span>
                <span className="mt-2 block text-xs font-semibold leading-snug text-navy">
                  {item.usedBy.length > 0 ? item.usedBy[0] : <span className="text-navy/40">Not used anywhere yet</span>}
                </span>
                {item.usedBy.length > 1 && <span className="block text-[11px] text-navy/40">+{item.usedBy.length - 1} more</span>}
                <span className="block text-[11px] text-navy/35">
                  {item.width}×{item.height} · {formatBytes(item.bytes)}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-6 text-center">
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
          </div>
        </div>
      </div>
    </div>
  );
}
