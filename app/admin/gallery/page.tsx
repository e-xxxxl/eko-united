"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { adminFetch, revalidatePublicPaths } from "@/lib/adminApi";

type GalleryItem = {
  _id: string;
  type: "photo" | "video";
  caption?: string;
  isActive: boolean;
};

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[] | null>(null);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function load() {
    adminFetch<GalleryItem[]>("/gallery")
      .then(setItems)
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  async function handleDelete(id: string) {
    if (!confirm("Permanently delete this gallery item? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await adminFetch(`/gallery/${id}`, { method: "DELETE" });
      await revalidatePublicPaths(["/gallery"]);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete item.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AdminShell>
      {() => (
        <div className="px-6 py-16 sm:px-10">
          <div className="mb-8 flex items-baseline justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Content</p>
              <h1 className="display-title font-display mt-2">Gallery</h1>
            </div>
            <Link
              href="/admin/gallery/new"
              className="rounded-full bg-yellow px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-navy-dark transition-transform duration-300 ease-smooth hover:scale-105"
            >
              + Add item
            </Link>
          </div>

          {error && (
            <p className="mb-4 text-sm text-red-500" role="alert">
              {error}
            </p>
          )}

          {items === null ? (
            <p className="text-navy/50">Loading…</p>
          ) : items.length === 0 ? (
            <p className="text-navy/50">No gallery items yet — add the first one.</p>
          ) : (
            <div className="border-t border-navy/10">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between gap-4 border-b border-navy/10 py-4"
                >
                  <div>
                    <p className="font-medium text-navy">{item.caption || "(no caption)"}</p>
                    <p className="text-xs uppercase tracking-wide text-navy/40">
                      {item.type} · {item.isActive ? "Active" : "Hidden"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Link
                      href={`/admin/gallery/${item._id}`}
                      className="text-sm font-semibold text-cyan transition-colors duration-200 ease-smooth hover:text-navy"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(item._id)}
                      disabled={deletingId === item._id}
                      className="text-sm font-semibold text-navy/40 transition-colors duration-200 ease-smooth hover:text-red-500 disabled:opacity-50"
                    >
                      {deletingId === item._id ? "Removing…" : "Remove"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </AdminShell>
  );
}
