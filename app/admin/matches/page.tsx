"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { adminFetch, revalidatePublicPaths } from "@/lib/adminApi";

type Match = {
  _id: string;
  opponent: string;
  competition?: string;
  kickoff: string;
  status: string;
  isHome: boolean;
  isActive: boolean;
};

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function load() {
    adminFetch<Match[]>("/matches")
      .then(setMatches)
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  async function handleDelete(id: string) {
    if (!confirm("Remove this match from the public site?")) return;
    setDeletingId(id);
    try {
      await adminFetch(`/matches/${id}`, { method: "DELETE" });
      await revalidatePublicPaths(["/fixtures", "/results", "/"]);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete match.");
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
              <h1 className="display-title font-display mt-2">Fixtures &amp; Results</h1>
            </div>
            <Link
              href="/admin/matches/new"
              className="rounded-full bg-yellow px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-navy-dark transition-transform duration-300 ease-smooth hover:scale-105"
            >
              + Add match
            </Link>
          </div>

          {error && (
            <p className="mb-4 text-sm text-red-500" role="alert">
              {error}
            </p>
          )}

          {matches === null ? (
            <p className="text-navy/50">Loading…</p>
          ) : matches.length === 0 ? (
            <p className="text-navy/50">No matches yet — add the first one.</p>
          ) : (
            <div className="border-t border-navy/10">
              {matches.map((match) => (
                <div
                  key={match._id}
                  className="flex items-center justify-between gap-4 border-b border-navy/10 py-4"
                >
                  <div>
                    <p className="font-medium text-navy">
                      {match.isHome ? "Eko United vs " : "vs Eko United — "}
                      {match.opponent}
                    </p>
                    <p className="text-xs uppercase tracking-wide text-navy/40">
                      {new Date(match.kickoff).toLocaleString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "Africa/Lagos",
                      })}{" "}
                      · {match.competition || "—"} · {match.status} ·{" "}
                      {match.isActive ? "Active" : "Hidden"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Link
                      href={`/admin/matches/${match._id}`}
                      className="text-sm font-semibold text-cyan transition-colors duration-200 ease-smooth hover:text-navy"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(match._id)}
                      disabled={deletingId === match._id}
                      className="text-sm font-semibold text-navy/40 transition-colors duration-200 ease-smooth hover:text-red-500 disabled:opacity-50"
                    >
                      {deletingId === match._id ? "Removing…" : "Remove"}
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
