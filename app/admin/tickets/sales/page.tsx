"use client";

import { useCallback, useEffect, useState } from "react";
import { clsx } from "clsx";
import AdminShell from "@/components/admin/AdminShell";
import TicketingTabs from "@/components/admin/TicketingTabs";
import { EmptyState, ErrorNote, PageHeader, Pill, StatCard, btnSecondary, dateTimeLabel, kickoffLabel } from "@/components/admin/ui";
import { adminFetch, downloadAdminFile } from "@/lib/adminApi";
import { formatNaira, formatPrice, formatTicketCode } from "@/lib/format";

type TicketOrder = {
  _id: string;
  ref: string;
  createdAt: string;
  paidAt: string | null;
  status: "pending" | "paid" | "failed" | "cancelled";
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  marketingConsent: boolean;
  items: { name: string; quantity: number; unitPrice: number; lineTotal: number }[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentReference: string;
  referralCode: string;
  referralOwner: string;
  matchLabel: string;
  tickets: { code: string; ticketTypeName: string; used: boolean; usedAt: string | null; usedBy: string }[];
};

type Reply = {
  page: number;
  pages: number;
  count: number;
  summary: { paidOrders: number; paidAmount: number; paidTickets: number; pendingOrders: number; pendingAmount: number };
  orders: TicketOrder[];
};

type MatchOption = { _id: string; opponent: string; kickoff: string };

const statusTone = { paid: "good", pending: "warn", failed: "bad", cancelled: "neutral" } as const;
const statusLabel = { paid: "Paid", pending: "Not paid yet", failed: "Failed", cancelled: "Cancelled" } as const;

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-navy/40">{label}</dt>
      <dd className="mt-1 text-sm text-navy">{children}</dd>
    </div>
  );
}

export default function TicketOrdersPage() {
  const [matches, setMatches] = useState<MatchOption[]>([]);
  const [match, setMatch] = useState("");
  const [status, setStatus] = useState("");
  const [kind, setKind] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Reply | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ id: string; text: string; ok: boolean } | null>(null);
  const [ready, setReady] = useState(false);

  // Links from the overview arrive with ?match= or ?status=.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setMatch(p.get("match") || "");
    setStatus(p.get("status") || "");
    setReady(true);
    adminFetch<MatchOption[]>("/tickets/matches-summary")
      .then(setMatches)
      .catch(() => setMatches([]));
  }, []);

  // Wait a moment after typing before searching.
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(() => {
    if (!ready) return;
    setLoading(true);
    const p = new URLSearchParams({ page: String(page), limit: "20" });
    if (match) p.set("match", match);
    if (status) p.set("status", status);
    if (kind) p.set("kind", kind);
    if (query) p.set("q", query);
    adminFetch<Reply>(`/tickets/orders?${p.toString()}`)
      .then((r) => {
        setData(r);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [ready, page, match, status, kind, query]);

  useEffect(load, [load]);

  function flash(id: string, text: string, ok: boolean) {
    setNotice({ id, text, ok });
    setTimeout(() => setNotice((n) => (n?.id === id ? null : n)), 5000);
  }

  async function action(order: TicketOrder, path: string, okText: string) {
    setBusyId(order._id);
    try {
      await adminFetch(`/orders/${order._id}/${path}`, { method: "POST" });
      flash(order._id, okText, true);
      load();
    } catch (err) {
      flash(order._id, err instanceof Error ? err.message : "That did not work.", false);
    } finally {
      setBusyId(null);
    }
  }

  async function downloadContacts() {
    try {
      await downloadAdminFile("/orders/contacts.csv?type=ticket", "eko-united-contacts.csv");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not download the list.");
    }
  }

  function setFilter(setter: (v: string) => void, value: string) {
    setter(value);
    setPage(1);
  }

  const selectClass = "rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-sm text-navy outline-none focus:border-cyan";

  return (
    <AdminShell>
      {(admin) => (
        <div className="px-6 py-12 sm:px-10">
          <PageHeader
            eyebrow="Ticketing"
            title="Ticket Orders"
            intro="Every ticket order, kept apart from shop orders. Open an order to see who bought, how it was paid, and the tickets with their check-in status."
            actions={
              <button type="button" onClick={downloadContacts} className={btnSecondary}>
                Download opted-in contacts
              </button>
            }
          />
          <TicketingTabs />
          {error && <ErrorNote>{error}</ErrorNote>}

          {data && (
            <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard label="Paid or claimed orders" value={data.summary.paidOrders} sub={`${data.summary.paidTickets} tickets`} />
              <StatCard label="Money received" value={formatNaira(data.summary.paidAmount)} tone="good" sub="from these orders" />
              <StatCard
                label="Not paid yet"
                value={data.summary.pendingOrders}
                sub={data.summary.pendingOrders > 0 ? `${formatNaira(data.summary.pendingAmount)} waiting` : "none waiting"}
                tone={data.summary.pendingOrders > 0 ? "warn" : "default"}
              />
              <StatCard label="Orders in this list" value={data.count} sub="matching the filters" />
            </div>
          )}

          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <select aria-label="Match" value={match} onChange={(e) => setFilter(setMatch, e.target.value)} className={selectClass}>
              <option value="">All matches</option>
              {matches.map((m) => (
                <option key={m._id} value={m._id}>
                  vs {m.opponent} · {kickoffLabel(m.kickoff)}
                </option>
              ))}
            </select>
            <select aria-label="Payment status" value={status} onChange={(e) => setFilter(setStatus, e.target.value)} className={selectClass}>
              <option value="">Any status</option>
              <option value="paid">Paid or claimed</option>
              <option value="pending">Not paid yet</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select aria-label="Free or paid" value={kind} onChange={(e) => setFilter(setKind, e.target.value)} className={selectClass}>
              <option value="">Free and paid</option>
              <option value="free">Free tickets only</option>
              <option value="paid">Paid tickets only</option>
            </select>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, phone, order or code"
              aria-label="Search orders"
              className={selectClass}
            />
          </div>

          {loading && !data ? (
            <p className="text-navy/50">Loading…</p>
          ) : !data || data.orders.length === 0 ? (
            <EmptyState>No ticket orders match these filters.</EmptyState>
          ) : (
            <ul className={clsx("divide-y divide-navy/10 rounded-2xl border border-navy/10 transition-opacity duration-200", loading && "opacity-50")}>
              {data.orders.map((o) => {
                const isOpen = open === o._id;
                const checkedIn = o.tickets.filter((t) => t.used).length;
                const summary = o.items.map((i) => `${i.quantity} × ${i.name}`).join(", ");
                return (
                  <li key={o._id}>
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : o._id)}
                      aria-expanded={isOpen}
                      className="flex w-full flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-4 text-left transition-colors duration-200 ease-smooth hover:bg-navy/[0.03]"
                    >
                      <div className="min-w-0 flex-1 basis-60">
                        <p className="font-semibold text-navy">
                          {o.customerName} <span className="ml-1 text-xs font-normal text-navy/40">#{o.ref}</span>
                        </p>
                        <p className="mt-0.5 truncate text-sm text-navy/60">{summary}</p>
                        <p className="mt-0.5 text-xs text-navy/40">
                          {o.matchLabel ? `${o.matchLabel} · ` : ""}
                          {dateTimeLabel(o.createdAt)}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Pill tone={statusTone[o.status]}>{statusLabel[o.status]}</Pill>
                        <Pill tone="neutral">{o.paymentMethod}</Pill>
                        {o.status === "paid" && o.tickets.length > 0 && (
                          <Pill tone={checkedIn === o.tickets.length ? "dark" : "neutral"}>
                            {checkedIn}/{o.tickets.length} in
                          </Pill>
                        )}
                      </div>
                      <p className="w-24 text-right font-display text-xl text-navy">{formatPrice(o.total)}</p>
                    </button>

                    {isOpen && (
                      <div className="border-t border-navy/10 bg-navy/[0.025] px-5 py-6">
                        <dl className="grid gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                          <Detail label="Buyer">
                            <p className="font-semibold">{o.customerName}</p>
                            <a href={`mailto:${o.customerEmail}`} className="block text-cyan hover:text-navy">
                              {o.customerEmail}
                            </a>
                            {o.customerPhone && (
                              <a href={`tel:${o.customerPhone}`} className="block text-cyan hover:text-navy">
                                {o.customerPhone}
                              </a>
                            )}
                            <p className="mt-1 text-xs text-navy/50">{o.marketingConsent ? "Agreed to emails and SMS" : "No marketing consent"}</p>
                          </Detail>
                          <Detail label="Payment">
                            <p>
                              <span className="font-semibold">{o.paymentMethod}</span> · {statusLabel[o.status]}
                            </p>
                            {o.paidAt && <p className="text-xs text-navy/50">Paid {dateTimeLabel(o.paidAt)}</p>}
                            {o.paymentReference && <p className="break-all text-xs text-navy/50">Reference {o.paymentReference}</p>}
                          </Detail>
                          <Detail label="Amounts">
                            <p>Tickets {formatNaira(o.subtotal)}</p>
                            {o.discount > 0 && (
                              <p className="text-navy/60">
                                Referral {o.referralCode}
                                {o.referralOwner ? ` (${o.referralOwner})` : ""}: -{formatNaira(o.discount)}
                              </p>
                            )}
                            {o.discount === 0 && o.referralCode && (
                              <p className="text-navy/60">
                                Referral {o.referralCode}
                                {o.referralOwner ? ` (${o.referralOwner})` : ""} (tracking only)
                              </p>
                            )}
                            <p className="mt-1 font-semibold">Total {formatPrice(o.total)}</p>
                          </Detail>
                        </dl>

                        <p className="mb-2 mt-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-navy/40">What was bought</p>
                        <ul className="divide-y divide-navy/10 rounded-xl bg-white">
                          {o.items.map((i) => (
                            <li key={i.name} className="flex items-center justify-between px-4 py-2.5 text-sm text-navy">
                              <span>
                                {i.quantity} × {i.name} <span className="text-navy/40">@ {formatPrice(i.unitPrice)}</span>
                              </span>
                              <span className="font-semibold">{formatPrice(i.lineTotal)}</span>
                            </li>
                          ))}
                        </ul>

                        {o.tickets.length > 0 && (
                          <>
                            <p className="mb-2 mt-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-navy/40">Tickets</p>
                            <ul className="divide-y divide-navy/10 rounded-xl bg-white">
                              {o.tickets.map((t) => (
                                <li key={t.code} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm">
                                  <span className="text-navy">
                                    <span className="font-display text-lg tracking-[0.12em]">{formatTicketCode(t.code)}</span>
                                    <span className="ml-3 text-navy/50">{t.ticketTypeName}</span>
                                  </span>
                                  {t.used ? (
                                    <span className="text-xs text-navy/60">
                                      <Pill tone="dark">Checked in</Pill> {dateTimeLabel(t.usedAt)}
                                      {t.usedBy ? ` by ${t.usedBy}` : ""}
                                    </span>
                                  ) : (
                                    <Pill tone="neutral">Not checked in</Pill>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </>
                        )}

                        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold">
                          {o.status === "paid" && (
                            <button
                              type="button"
                              disabled={busyId === o._id}
                              onClick={() => action(o, "resend-confirmation", "Tickets emailed again.")}
                              className="text-cyan transition-colors duration-200 ease-smooth hover:text-navy disabled:opacity-50"
                            >
                              {busyId === o._id ? "Sending…" : "Email the tickets again"}
                            </button>
                          )}
                          {admin.role === "super_admin" && o.status === "pending" && o.paymentMethod === "Not paid" && (
                            <button
                              type="button"
                              disabled={busyId === o._id}
                              onClick={() => action(o, "mark-paid", "Marked as paid and the tickets were issued.")}
                              className="text-navy underline transition-colors duration-200 ease-smooth hover:text-cyan disabled:opacity-50"
                            >
                              Mark as paid (cash or bank transfer)
                            </button>
                          )}
                          {notice?.id === o._id && <span className={notice.ok ? "text-cyan" : "text-red-500"}>{notice.text}</span>}
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {data && data.pages > 1 && (
            <div className="mt-6 flex items-center justify-between text-sm text-navy/60">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="font-semibold text-cyan hover:text-navy disabled:opacity-30">
                ← Newer
              </button>
              <span>
                Page {data.page} of {data.pages}
              </span>
              <button type="button" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)} className="font-semibold text-cyan hover:text-navy disabled:opacity-30">
                Older →
              </button>
            </div>
          )}
        </div>
      )}
    </AdminShell>
  );
}
