"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { adminFetch, revalidatePublicPaths } from "@/lib/adminApi";

type Video = {
  _id: string;
  title: string;
  videoId: string;
  publishedAt: string;
  isActive: boolean;
};

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[] | null>(null);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function load() {
    adminFetch<Video[]>("/videos")
      .then(setVideos)
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  async function handleDelete(id: string) {
    if (!confirm("Permanently delete this video from the website? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await adminFetch(`/videos/${id}`, { method: "DELETE" });
      await revalidatePublicPaths(["/videos"]);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete video.");
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
              <h1 className="display-title font-display mt-2">Videos</h1>
            </div>
            <Link
              href="/admin/videos/new"
              className="btn-glass btn-glass-yellow px-6 py-2.5 text-xs font-bold uppercase tracking-wide"
            >
              + Add video
            </Link>
          </div>

          {error && (
            <p className="mb-4 text-sm text-red-500" role="alert">
              {error}
            </p>
          )}

          {videos === null ? (
            <p className="text-navy/50">Loading…</p>
          ) : videos.length === 0 ? (
            <p className="text-navy/50">No videos yet. Paste the first YouTube link.</p>
          ) : (
            <div className="border-t border-navy/10">
              {videos.map((video) => (
                <div
                  key={video._id}
                  className="flex items-center justify-between gap-4 border-b border-navy/10 py-4"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`}
                      alt=""
                      className="aspect-video w-28 shrink-0 rounded-lg bg-navy-dark object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-navy">{video.title}</p>
                      <p className="text-xs uppercase tracking-wide text-navy/40">
                        {new Date(video.publishedAt).toLocaleDateString("en-GB")} ·{" "}
                        {video.isActive ? "Showing" : "Hidden"}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    <Link
                      href={`/admin/videos/${video._id}`}
                      className="text-sm font-semibold text-cyan transition-colors duration-200 ease-smooth hover:text-navy"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(video._id)}
                      disabled={deletingId === video._id}
                      className="text-sm font-semibold text-navy/40 transition-colors duration-200 ease-smooth hover:text-red-500 disabled:opacity-50"
                    >
                      {deletingId === video._id ? "Removing…" : "Remove"}
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
