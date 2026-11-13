"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import TicketingTabs from "@/components/admin/TicketingTabs";
import { EmptyState, ErrorNote, PageHeader, Pill, ProgressBar, btnPrimary, btnSecondary, kickoffLabel, timeLabel } from "@/components/admin/ui";
import { adminFetch, revalidatePublicPaths } from "@/lib/adminApi";
import { fetchMatchOptions, type MatchOption } from "@/lib/adminMatches";
import { formatPrice } from "@/lib/format";

type TicketType = {
  _id: string;
  match: string | { _id: string };
  name: string;
  price: number;
  quantityAvailable: number;
  quantitySold: number;
  isActive: boolean;
};

// What is on sale, match by match. Selling numbers live under Overview; this is
// where categories are added, repriced, hidden or removed.
export default function AdminTicketTypesPage() {
  const [types, setTypes] = useState<TicketType[] | null>(null);
  const [matches, setMatches] = useState<MatchOption[]>([]);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    Promise.all([adminFetch<TicketType[]>("/ticket-types"), fetchMatchOptions()])
      .then(([t, m]) => {
        setTypes(t);
        setMatches(m);
      })
      .catch((err) => setError(err.message));
  }
  useEffect(load, []);

  const matchIdOf = (t: TicketType) => (typeof t.match === "string" ? t.match : t.match?._id);

  async function toggleVisible(t: TicketType) {
    setBusyId(t._id);
    try {
      await adminFetch(`/ticket-types/${t._id}`, { method: "PUT", body: JSON.stringify({ isActive: !t.isActive }) });
      await revalidatePublicPaths(["/tickets"]);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the category.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(t: TicketType) {
    const warning =
      t.quantitySold > 0
        ? `${t.name} has ${t.quantitySold} ticket${t.quantitySold === 1 ? "" : "s"} sold. Removing it does not cancel them, but it will disappear from the sales figures. Remove it anyway?`
        : `Remove ${t.name}? This cannot be undone.`;
    if (!confirm(warning)) return;
    setBusyId(t._id);
    try {
      await adminFetch(`/ticket-types/${t._id}`, { method: "DELETE" });
      await revalidatePublicPaths(["/tickets"]);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove the category.");
    } finally {
      setBusyId(null);
    }
  }

  // Group by match, in date order.
  const groups = (() => {
    if (!types) return [];
    const byMatch = new Map<string, TicketType[]>();
    for (const t of types) {
      const id = matchIdOf(t);
      byMatch.set(id, [...(byMatch.get(id) || []), t]);
    }
    return [...byMatch.entries()]
      .map(([id, list]) => ({ id, match: matches.find((m) => m._id === id), list: list.sort((a, b) => a.price - b.price) }))
      .sort((a, b) => (a.match?.kickoff || "").localeCompare(b.match?.kickoff || ""));
  })();

  return (
    <AdminShell>
      {() => (
        <div className="px-6 py-12 sm:px-10">
          <PageHeader
            eyebrow="Ticketing"
            title="Ticket Types"
            intro="The categories on sale for each home match, with their prices and how many there are. Tickets are only sold for home matches."
            actions={
              <>
                <Link href="/admin/ticket-types/standard" className={btnPrimary}>
                  + Standard tickets for a match
                </Link>
                <Link href="/admin/ticket-types/new" className={btnSecondary}>
                  + Add one category
                </Link>
              </>
            }
          />
          <TicketingTabs />
          {error && <ErrorNote>{error}</ErrorNote>}

          {types === null ? (
            <p className="text-navy/50">Loading…</p>
          ) : groups.length === 0 ? (
            <EmptyState>
              Nothing on sale yet. <strong>Standard tickets for a match</strong> adds Regular (Popular Side), Premium and Box in one go.
            </EmptyState>
          ) : (
            <div className="space-y-10">
              {groups.map((g) => {
                const away = g.match && !g.match.isHome;
                return (
                  <section key={g.id}>
                    <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
                      <h2 className="font-display text-2xl text-navy">
                        {g.match ? `vs ${g.match.opponent}` : "Match no longer listed"}
                        {g.match && <span className="ml-3 text-sm font-normal text-navy/45">{kickoffLabel(g.match.kickoff)} · {timeLabel(g.match.kickoff)}</span>}
                      </h2>
                      {away && <Pill tone="warn">Away match: not on sale</Pill>}
                    </div>
                    <ul className="divide-y divide-navy/10 rounded-2xl border border-navy/10">
                      {g.list.map((t) => (
                        <li key={t._id} className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 px-5 py-4">
                          <div className="min-w-0 basis-52">
                            <p className="font-semibold text-navy">
                              {t.name} {!t.isActive && <Pill tone="neutral">Hidden</Pill>}
                            </p>
                            <p className="mt-0.5 text-sm text-navy/55">{formatPrice(t.price)} each</p>
                          </div>
                          <div className="w-44">
                            <p className="text-sm text-navy">
                              <strong>{t.quantitySold}</strong> of {t.quantityAvailable} sold
                            </p>
                            <ProgressBar value={t.quantitySold} max={t.quantityAvailable} className="mt-1.5" />
                            <p className="mt-1 text-xs text-navy/45">{Math.max(0, t.quantityAvailable - t.quantitySold)} left</p>
                          </div>
                          <div className="flex items-center gap-5 text-sm font-semibold">
                            <Link href={`/admin/ticket-types/${t._id}`} className="text-cyan transition-colors duration-200 ease-smooth hover:text-navy">
                              Edit
                            </Link>
                            <button type="button" disabled={busyId === t._id} onClick={() => toggleVisible(t)} className="text-navy/60 transition-colors duration-200 ease-smooth hover:text-navy disabled:opacity-50">
                              {t.isActive ? "Hide" : "Show"}
                            </button>
                            <button type="button" disabled={busyId === t._id} onClick={() => remove(t)} className="text-navy/40 transition-colors duration-200 ease-smooth hover:text-red-500 disabled:opacity-50">
                              Remove
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      )}
    </AdminShell>
  );
}
