"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { adminFetch, revalidatePublicPaths } from "@/lib/adminApi";

type Standing = {
  _id: string;
  clubName: string;
  position: number;
  points: number;
  isEkoUnited: boolean;
  isActive: boolean;
};

export default function AdminStandingsPage() {
  const [standings, setStandings] = useState<Standing[] | null>(null);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function load() {
    adminFetch<Standing[]>("/standings")
      .then(setStandings)
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  async function handleDelete(id: string) {
    if (!confirm("Permanently delete this club from the table? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await adminFetch(`/standings/${id}`, { method: "DELETE" });
      await revalidatePublicPaths(["/table", "/"]);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete standing.");
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
              <h1 className="display-title font-display mt-2">League Table</h1>
            </div>
            <Link
              href="/admin/standings/new"
              className="rounded-full bg-yellow px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-navy-dark transition-transform duration-300 ease-smooth hover:scale-105"
            >
              + Add club
            </Link>
          </div>

          {error && (
            <p className="mb-4 text-sm text-red-500" role="alert">
              {error}
            </p>
          )}

          {standings === null ? (
            <p className="text-navy/50">Loading…</p>
          ) : standings.length === 0 ? (
            <p className="text-navy/50">No standings yet — add the first club.</p>
          ) : (
            <div className="border-t border-navy/10">
              {[...standings]
                .sort((a, b) => a.position - b.position)
                .map((row) => (
                  <div
                    key={row._id}
                    className="flex items-center justify-between gap-4 border-b border-navy/10 py-4"
                  >
                    <div>
                      <p className="font-medium text-navy">
                        {row.position}. {row.clubName}
                        {row.isEkoUnited && (
                          <span className="ml-2 text-xs font-semibold uppercase tracking-wide text-cyan">
                            Eko United
                          </span>
                        )}
                      </p>
                      <p className="text-xs uppercase tracking-wide text-navy/40">
                        {row.points} pts · {row.isActive ? "Active" : "Hidden"}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/admin/standings/${row._id}`}
                        className="text-sm font-semibold text-cyan transition-colors duration-200 ease-smooth hover:text-navy"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(row._id)}
                        disabled={deletingId === row._id}
                        className="text-sm font-semibold text-navy/40 transition-colors duration-200 ease-smooth hover:text-red-500 disabled:opacity-50"
                      >
                        {deletingId === row._id ? "Removing…" : "Remove"}
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
