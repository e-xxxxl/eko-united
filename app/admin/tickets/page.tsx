"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import AdminShell from "@/components/admin/AdminShell";
import TicketingTabs from "@/components/admin/TicketingTabs";
import { EmptyState, ErrorNote, PageHeader, Pill, ProgressBar, StatCard, btnPrimary, btnSecondary, kickoffLabel, timeLabel } from "@/components/admin/ui";
import { adminFetch, downloadAdminFile } from "@/lib/adminApi";
import { formatNaira, formatPrice } from "@/lib/format";

type MatchRow = {
  _id: string;
  opponent: string;
  kickoff: string;
  venue?: string;
  status: string;
  categories: number;
  capacity: number;
  sold: number;
  remaining: number;
  checkedIn: number;
  revenue: number;
};

type Category = {
  _id: string;
  name: string;
  price: number;
  isActive: boolean;
  free: boolean;
  capacity: number;
  sold: number;
  remaining: number;
  checkedIn: number;
  revenue: number;
  discount: number;
  orders: number;
};

type Overview = {
  match: { _id: string; opponent: string; kickoff: string; venue?: string; competition?: string; status: string };
  totals: {
    sold: number;
    capacity: number;
    remaining: number;
    checkedIn: number;
    notYetIn: number;
    revenue: number;
    discount: number;
    freeTickets: number;
    paidTickets: number;
    orders: number;
    pendingOrders: number;
    pendingTickets: number;
    pendingAmount: number;
  };
  categories: Category[];
  paymentMethods: { method: string; orders: number; tickets: number; amount: number }[];
};

const methodNote: Record<string, string> = {
  Paystack: "Paid online by card or transfer",
  Flutterwave: "Paid online",
  Free: "Free tickets, no payment",
  Offline: "Marked paid by an admin (cash or bank transfer)",
};

export default function TicketOverviewPage() {
  const [matches, setMatches] = useState<MatchRow[] | null>(null);
  const [matchId, setMatchId] = useState("");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetch<MatchRow[]>("/tickets/matches-summary")
      .then((rows) => {
        setMatches(rows);
        if (rows.length > 0) {
          // The next match still to be played, else the most recent one.
          const now = Date.now() - 6 * 60 * 60 * 1000;
          const next = rows.find((r) => new Date(r.kickoff).getTime() >= now) || rows[rows.length - 1];
          setMatchId(next._id);
        }
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!matchId) return;
    setLoading(true);
    setError("");
    adminFetch<Overview>(`/tickets/overview/${matchId}`)
      .then(setOverview)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [matchId]);

  async function exportAttendees() {
    try {
      await downloadAdminFile(`/tickets/export.csv?match=${matchId}`, "attendees.csv");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not download the list.");
    }
  }

  const t = overview?.totals;

  return (
    <AdminShell>
      {() => (
        <div className="px-6 py-12 sm:px-10">
          <PageHeader
            eyebrow="Ticketing"
            title="Ticket Overview"
            intro="How many tickets have gone in each category for a match, who has checked in, and the money received."
            actions={
              <Link href="/admin/ticket-types/standard" className={btnPrimary}>
                + Set up tickets for a match
              </Link>
            }
          />
          <TicketingTabs />
          {error && <ErrorNote>{error}</ErrorNote>}

          {matches === null ? (
            <p className="text-navy/50">Loading…</p>
          ) : matches.length === 0 ? (
            <EmptyState>
              No tickets are on sale yet. Use <strong>Set up tickets for a match</strong> to add Regular, Premium and Box for a home
              match.
            </EmptyState>
          ) : (
            <>
              {/* Which match */}
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-navy/50">Home matches</p>
              <div className="-mx-6 mb-10 flex gap-3 overflow-x-auto px-6 pb-2 sm:mx-0 sm:px-0 [scrollbar-width:thin]">
                {matches.map((m) => {
                  const active = m._id === matchId;
                  return (
                    <button
                      key={m._id}
                      type="button"
                      onClick={() => setMatchId(m._id)}
                      aria-pressed={active}
                      className={clsx(
                        "w-60 shrink-0 rounded-2xl border p-4 text-left transition-colors duration-200 ease-smooth",
                        active ? "border-navy bg-navy text-white" : "border-navy/15 bg-white text-navy hover:border-navy/40"
                      )}
                    >
                      <p className={clsx("text-[10px] font-semibold uppercase tracking-[0.18em]", active ? "text-cyan" : "text-navy/45")}>
                        {kickoffLabel(m.kickoff)} · {timeLabel(m.kickoff)}
                      </p>
                      <p className="mt-1 font-display text-xl leading-tight">vs {m.opponent}</p>
                      <p className={clsx("mt-3 text-xs", active ? "text-white/70" : "text-navy/55")}>
                        {m.sold} of {m.capacity} sold
                      </p>
                      <ProgressBar value={m.sold} max={m.capacity} className={clsx("mt-1.5", active && "bg-white/20")} />
                      <p className={clsx("mt-3 text-xs font-semibold", active ? "text-white" : "text-navy")}>{formatNaira(m.revenue)} received</p>
                    </button>
                  );
                })}
              </div>

              {overview && t && (
                <div className={clsx("transition-opacity duration-200", loading && "opacity-50")}>
                  <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <h2 className="font-display text-3xl text-navy">vs {overview.match.opponent}</h2>
                      <p className="mt-1 text-sm text-navy/55">
                        {kickoffLabel(overview.match.kickoff)} · {timeLabel(overview.match.kickoff)}
                        {overview.match.venue ? ` · ${overview.match.venue}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Link href="/admin/scan-tickets" className={btnSecondary}>
                        Open check-in
                      </Link>
                      <button type="button" onClick={exportAttendees} className={btnSecondary}>
                        Download attendee list
                      </button>
                    </div>
                  </div>

                  {/* The headline numbers */}
                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <StatCard label="Tickets sold" value={t.sold} sub={`of ${t.capacity} · ${t.remaining} left`} />
                    <StatCard label="Checked in" value={t.checkedIn} sub={`${t.notYetIn} still to arrive`} tone="good" />
                    <StatCard label="Money received" value={formatNaira(t.revenue)} sub={t.discount > 0 ? `after ${formatNaira(t.discount)} of referral discounts` : "from paid tickets"} />
                    <StatCard
                      label="Free vs paid"
                      value={`${t.freeTickets} / ${t.paidTickets}`}
                      sub="free tickets / paid tickets"
                    />
                  </div>
                  {t.pendingOrders > 0 && (
                    <p className="mt-3 rounded-xl bg-yellow/20 px-4 py-3 text-sm text-navy">
                      <strong>{t.pendingOrders}</strong> order{t.pendingOrders === 1 ? "" : "s"} ({t.pendingTickets} ticket
                      {t.pendingTickets === 1 ? "" : "s"}, {formatNaira(t.pendingAmount)}) started but not paid yet. These are not counted
                      above.{" "}
                      <Link href="/admin/tickets/sales?status=pending" className="font-semibold underline">
                        See them
                      </Link>
                    </p>
                  )}

                  {/* By category */}
                  <h3 className="mb-4 mt-12 font-display text-2xl text-navy">By category</h3>
                  {overview.categories.length === 0 ? (
                    <EmptyState>No ticket categories for this match yet.</EmptyState>
                  ) : (
                    <>
                      <div className="hidden overflow-hidden rounded-2xl border border-navy/10 md:block">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-navy/[0.04] text-[10px] font-semibold uppercase tracking-[0.15em] text-navy/50">
                            <tr>
                              <th className="px-5 py-3">Category</th>
                              <th className="px-3 py-3">Sold</th>
                              <th className="px-3 py-3">Left</th>
                              <th className="px-3 py-3">Checked in</th>
                              <th className="px-3 py-3 text-right">Money received</th>
                              <th className="px-5 py-3 text-right">Discounts</th>
                            </tr>
                          </thead>
                          <tbody>
                            {overview.categories.map((c) => (
                              <tr key={c._id} className="border-t border-navy/10 align-top">
                                <td className="px-5 py-4">
                                  <p className="font-semibold text-navy">{c.name}</p>
                                  <p className="mt-1 flex items-center gap-2 text-xs text-navy/50">
                                    {formatPrice(c.price)} each {!c.isActive && <Pill tone="neutral">Hidden</Pill>}
                                  </p>
                                </td>
                                <td className="px-3 py-4">
                                  <p className="font-semibold text-navy">
                                    {c.sold} <span className="font-normal text-navy/40">/ {c.capacity}</span>
                                  </p>
                                  <ProgressBar value={c.sold} max={c.capacity} className="mt-2 w-32" />
                                </td>
                                <td className="px-3 py-4">
                                  {c.remaining === 0 ? <Pill tone="dark">Sold out</Pill> : <span className="font-semibold text-navy">{c.remaining}</span>}
                                </td>
                                <td className="px-3 py-4 text-navy">
                                  <span className="font-semibold">{c.checkedIn}</span> <span className="text-navy/40">/ {c.sold}</span>
                                </td>
                                <td className="px-3 py-4 text-right font-semibold text-navy">
                                  {c.free ? <span className="text-navy/40">Free</span> : formatNaira(c.revenue)}
                                  {!c.free && <p className="mt-0.5 text-xs font-normal text-navy/45">{c.orders} order{c.orders === 1 ? "" : "s"}</p>}
                                </td>
                                <td className="px-5 py-4 text-right text-navy/60">{c.discount > 0 ? formatNaira(c.discount) : "None"}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="border-t-2 border-navy/15 bg-navy/[0.04] text-navy">
                            <tr>
                              <td className="px-5 py-3 font-semibold">Total</td>
                              <td className="px-3 py-3 font-semibold">
                                {t.sold} <span className="font-normal text-navy/40">/ {t.capacity}</span>
                              </td>
                              <td className="px-3 py-3 font-semibold">{t.remaining}</td>
                              <td className="px-3 py-3 font-semibold">
                                {t.checkedIn} <span className="font-normal text-navy/40">/ {t.sold}</span>
                              </td>
                              <td className="px-3 py-3 text-right font-semibold">{formatNaira(t.revenue)}</td>
                              <td className="px-5 py-3 text-right text-navy/60">{t.discount > 0 ? formatNaira(t.discount) : "None"}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>

                      <ul className="space-y-3 md:hidden">
                        {overview.categories.map((c) => (
                          <li key={c._id} className="rounded-2xl border border-navy/10 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold text-navy">{c.name}</p>
                                <p className="mt-0.5 text-xs text-navy/50">{formatPrice(c.price)} each</p>
                              </div>
                              {c.remaining === 0 && <Pill tone="dark">Sold out</Pill>}
                            </div>
                            <p className="mt-3 text-sm text-navy">
                              <strong>{c.sold}</strong> of {c.capacity} sold · {c.remaining} left
                            </p>
                            <ProgressBar value={c.sold} max={c.capacity} className="mt-2" />
                            <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
                              <div>
                                <dt className="uppercase tracking-wide text-navy/45">Checked in</dt>
                                <dd className="mt-0.5 text-sm font-semibold text-navy">
                                  {c.checkedIn} / {c.sold}
                                </dd>
                              </div>
                              <div>
                                <dt className="uppercase tracking-wide text-navy/45">Money received</dt>
                                <dd className="mt-0.5 text-sm font-semibold text-navy">{c.free ? "Free" : formatNaira(c.revenue)}</dd>
                              </div>
                            </dl>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  {/* How it was paid */}
                  <h3 className="mb-4 mt-12 font-display text-2xl text-navy">How tickets were paid for</h3>
                  {overview.paymentMethods.length === 0 ? (
                    <EmptyState>No paid or claimed orders for this match yet.</EmptyState>
                  ) : (
                    <ul className="divide-y divide-navy/10 rounded-2xl border border-navy/10">
                      {overview.paymentMethods.map((m) => (
                        <li key={m.method} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                          <div>
                            <p className="font-semibold text-navy">{m.method}</p>
                            <p className="mt-0.5 text-xs text-navy/50">{methodNote[m.method] || ""}</p>
                          </div>
                          <p className="text-right text-sm text-navy/60">
                            {m.orders} order{m.orders === 1 ? "" : "s"} · {m.tickets} ticket{m.tickets === 1 ? "" : "s"}
                            <span className="ml-4 font-display text-xl text-navy">{m.method === "Free" ? "Free" : formatNaira(m.amount)}</span>
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="mt-4 text-xs text-navy/40">
                    Money received is what buyers actually paid, after any referral discount. For the buyer-by-buyer detail, open{" "}
                    <Link href={`/admin/tickets/sales?match=${matchId}`} className="font-semibold text-cyan hover:text-navy">
                      Orders
                    </Link>
                    .
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </AdminShell>
  );
}
