"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { adminFetch, revalidatePublicPaths } from "@/lib/adminApi";

type Player = {
  _id: string;
  name: string;
  role: string;
  position?: string;
  squadNumber?: number;
  isActive: boolean;
};

const roleLabels: Record<string, string> = {
  player: "Player",
  coach: "Coach",
  technical_staff: "Technical Staff",
  management: "Management",
};

export default function AdminPlayersPage() {
  const [players, setPlayers] = useState<Player[] | null>(null);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function load() {
    adminFetch<Player[]>("/players")
      .then(setPlayers)
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  async function handleDelete(id: string) {
    if (!confirm("Permanently delete this profile? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await adminFetch(`/players/${id}`, { method: "DELETE" });
      await revalidatePublicPaths(["/team", "/team/coaching-staff", "/about", "/"]);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete profile.");
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
              <h1 className="display-title font-display mt-2">Players &amp; Staff</h1>
            </div>
            <Link
              href="/admin/players/new"
              className="rounded-full bg-yellow px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-navy-dark transition-transform duration-300 ease-smooth hover:scale-105"
            >
              + Add profile
            </Link>
          </div>

          {error && (
            <p className="mb-4 text-sm text-red-500" role="alert">
              {error}
            </p>
          )}

          {players === null ? (
            <p className="text-navy/50">Loading…</p>
          ) : players.length === 0 ? (
            <p className="text-navy/50">No profiles yet — add the first one.</p>
          ) : (
            <div className="border-t border-navy/10">
              {players.map((player) => (
                <div
                  key={player._id}
                  className="flex items-center justify-between gap-4 border-b border-navy/10 py-4"
                >
                  <div>
                    <p className="font-medium text-navy">
                      {typeof player.squadNumber === "number" ? `#${player.squadNumber} ` : ""}
                      {player.name}
                    </p>
                    <p className="text-xs uppercase tracking-wide text-navy/40">
                      {roleLabels[player.role] || player.role}
                      {player.position ? ` · ${player.position}` : ""} ·{" "}
                      {player.isActive ? "Active" : "Hidden"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Link
                      href={`/admin/players/${player._id}`}
                      className="text-sm font-semibold text-cyan transition-colors duration-200 ease-smooth hover:text-navy"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(player._id)}
                      disabled={deletingId === player._id}
                      className="text-sm font-semibold text-navy/40 transition-colors duration-200 ease-smooth hover:text-red-500 disabled:opacity-50"
                    >
                      {deletingId === player._id ? "Removing…" : "Remove"}
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
