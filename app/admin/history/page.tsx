"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { adminFetch, revalidatePublicPaths } from "@/lib/adminApi";

type HistoryMilestone = {
  _id: string;
  year: number;
  title: string;
  isActive: boolean;
};

export default function AdminHistoryPage() {
  const [milestones, setMilestones] = useState<HistoryMilestone[] | null>(null);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function load() {
    adminFetch<HistoryMilestone[]>("/history")
      .then(setMilestones)
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  async function handleDelete(id: string) {
    if (!confirm("Remove this milestone from the public site?")) return;
    setDeletingId(id);
    try {
      await adminFetch(`/history/${id}`, { method: "DELETE" });
      await revalidatePublicPaths(["/club-history"]);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete milestone.");
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
              <h1 className="display-title font-display mt-2">Club History</h1>
            </div>
            <Link
              href="/admin/history/new"
              className="rounded-full bg-yellow px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-navy-dark transition-transform duration-300 ease-smooth hover:scale-105"
            >
              + Add milestone
            </Link>
          </div>

          {error && (
            <p className="mb-4 text-sm text-red-500" role="alert">
              {error}
            </p>
          )}

          {milestones === null ? (
            <p className="text-navy/50">Loading…</p>
          ) : milestones.length === 0 ? (
            <p className="text-navy/50">No milestones yet — add the first one.</p>
          ) : (
            <div className="border-t border-navy/10">
              {milestones.map((milestone) => (
                <div
                  key={milestone._id}
                  className="flex items-center justify-between gap-4 border-b border-navy/10 py-4"
                >
                  <div>
                    <p className="font-medium text-navy">{milestone.title}</p>
                    <p className="text-xs uppercase tracking-wide text-navy/40">
                      {milestone.year} · {milestone.isActive ? "Active" : "Hidden"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Link
                      href={`/admin/history/${milestone._id}`}
                      className="text-sm font-semibold text-cyan transition-colors duration-200 ease-smooth hover:text-navy"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(milestone._id)}
                      disabled={deletingId === milestone._id}
                      className="text-sm font-semibold text-navy/40 transition-colors duration-200 ease-smooth hover:text-red-500 disabled:opacity-50"
                    >
                      {deletingId === milestone._id ? "Removing…" : "Remove"}
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
