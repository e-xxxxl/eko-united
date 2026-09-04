"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { adminFetch, revalidatePublicPaths } from "@/lib/adminApi";
import { formatNaira } from "@/lib/format";

type Match = { _id: string; opponent: string; kickoff: string; isHome: boolean };
type TicketType = {
  _id: string;
  match: string | Match;
  name: string;
  price: number;
  quantityAvailable: number;
  quantitySold: number;
  isActive: boolean;
};

export default function AdminTicketTypesPage() {
  const [ticketTypes, setTicketTypes] = useState<TicketType[] | null>(null);
  const [matches, setMatches] = useState<Record<string, Match>>({});
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function load() {
    Promise.all([adminFetch<TicketType[]>("/ticket-types"), adminFetch<Match[]>("/matches")])
      .then(([types, allMatches]) => {
        setTicketTypes(types);
        setMatches(Object.fromEntries(allMatches.map((m) => [m._id, m])));
      })
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  async function handleDelete(id: string) {
    if (!confirm("Remove this ticket type?")) return;
    setDeletingId(id);
    try {
      await adminFetch(`/ticket-types/${id}`, { method: "DELETE" });
      await revalidatePublicPaths(["/tickets"]);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete ticket type.");
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
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Tickets</p>
              <h1 className="display-title font-display mt-2">Ticket Types</h1>
            </div>
            <Link
              href="/admin/ticket-types/new"
              className="rounded-full bg-yellow px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-navy-dark transition-transform duration-300 ease-smooth hover:scale-105"
            >
              + Add ticket type
            </Link>
          </div>

          {error && (
            <p className="mb-4 text-sm text-red-500" role="alert">
              {error}
            </p>
          )}

          {ticketTypes === null ? (
            <p className="text-navy/50">Loading…</p>
          ) : ticketTypes.length === 0 ? (
            <p className="text-navy/50">No ticket types yet — add the first one.</p>
          ) : (
            <div className="border-t border-navy/10">
              {ticketTypes.map((t) => {
                const matchId = typeof t.match === "string" ? t.match : t.match?._id;
                const match = matches[matchId];
                return (
                  <div key={t._id} className="flex items-center justify-between gap-4 border-b border-navy/10 py-4">
                    <div>
                      <p className="font-medium text-navy">
                        {t.name} {match ? `— ${match.isHome ? "vs" : "at"} ${match.opponent}` : ""}
                      </p>
                      <p className="text-xs uppercase tracking-wide text-navy/40">
                        {formatNaira(t.price)} · {t.quantitySold}/{t.quantityAvailable} sold ·{" "}
                        {t.isActive ? "Active" : "Hidden"}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/admin/ticket-types/${t._id}`}
                        className="text-sm font-semibold text-cyan transition-colors duration-200 ease-smooth hover:text-navy"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(t._id)}
                        disabled={deletingId === t._id}
                        className="text-sm font-semibold text-navy/40 transition-colors duration-200 ease-smooth hover:text-red-500 disabled:opacity-50"
                      >
                        {deletingId === t._id ? "Removing…" : "Remove"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </AdminShell>
  );
}
