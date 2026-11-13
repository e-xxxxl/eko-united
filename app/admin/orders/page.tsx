"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { EmptyState, ErrorNote, PageHeader, Pill, StatCard, btnSecondary, dateTimeLabel } from "@/components/admin/ui";
import { adminFetch, downloadAdminFile } from "@/lib/adminApi";
import { formatNaira, formatPrice } from "@/lib/format";

type Order = {
  _id: string;
  items: { name: string; unitPrice: number; quantity: number; size?: string; version?: "replica" | "player" }[];
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  subtotalAmount?: number;
  totalAmount: number;
  discountAmount?: number;
  referralCode?: string;
  referralOwner?: string;
  marketingConsent?: boolean;
  status: "pending" | "paid" | "failed" | "cancelled";
  paymentProvider?: "paystack" | "flutterwave";
  paymentReference?: string;
  paidAt?: string;
  fulfilled: boolean;
  createdAt: string;
};

const statusTone = { paid: "good", pending: "warn", failed: "bad", cancelled: "neutral" } as const;
const statusLabel = { paid: "Paid", pending: "Not paid yet", failed: "Failed", cancelled: "Cancelled" } as const;

const methodOf = (o: Order) =>
  o.paymentProvider === "paystack" ? "Paystack" : o.paymentProvider === "flutterwave" ? "Flutterwave" : o.totalAmount === 0 ? "Free" : o.status === "paid" ? "Offline" : "Not paid";

const lineLabel = (i: Order["items"][number]) =>
  `${i.quantity} × ${i.name}${i.version ? ` (${i.version === "replica" ? "Replica" : "Player version"})` : ""}${i.size ? ` (${i.size})` : ""}`;

type Filter = "all" | "paid" | "to-send" | "pending";

// Merchandise orders only. Ticket orders have their own list under Ticketing.
export default function AdminShopOrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ id: string; text: string; ok: boolean } | null>(null);

  function load() {
    adminFetch<Order[]>("/orders")
      .then(setOrders)
      .catch((err) => setError(err.message));
  }
  useEffect(load, []);

  function flash(id: string, text: string, ok: boolean) {
    setNotice({ id, text, ok });
    setTimeout(() => setNotice((n) => (n?.id === id ? null : n)), 5000);
  }

  function replace(updated: Order) {
    setOrders((prev) => (prev ? prev.map((o) => (o._id === updated._id ? updated : o)) : prev));
  }

  async function toggleFulfilled(order: Order) {
    setBusyId(order._id);
    try {
      replace(await adminFetch<Order>(`/orders/${order._id}`, { method: "PUT", body: JSON.stringify({ fulfilled: !order.fulfilled }) }));
    } catch (err) {
      flash(order._id, err instanceof Error ? err.message : "Could not update the order.", false);
    } finally {
      setBusyId(null);
    }
  }

  // Only for orders paid outside the online flow (no payment provider on them).
  async function markPaid(order: Order) {
    setBusyId(order._id);
    try {
      replace(await adminFetch<Order>(`/orders/${order._id}/mark-paid`, { method: "POST" }));
      flash(order._id, "Marked as paid. The confirmation email was sent if email is set up.", true);
    } catch (err) {
      flash(order._id, err instanceof Error ? err.message : "Could not mark it paid.", false);
    } finally {
      setBusyId(null);
    }
  }

  async function resend(order: Order) {
    setBusyId(order._id);
    try {
      await adminFetch(`/orders/${order._id}/resend-confirmation`, { method: "POST" });
      flash(order._id, "Confirmation email sent.", true);
    } catch (err) {
      flash(order._id, err instanceof Error ? err.message : "Could not send the email.", false);
    } finally {
      setBusyId(null);
    }
  }

  async function downloadContacts() {
    try {
      await downloadAdminFile("/orders/contacts.csv?type=shop", "eko-united-contacts.csv");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not download the list.");
    }
  }

  const stats = useMemo(() => {
    const paid = (orders || []).filter((o) => o.status === "paid");
    return {
      paidOrders: paid.length,
      revenue: paid.reduce((s, o) => s + o.totalAmount, 0),
      items: paid.reduce((s, o) => s + o.items.reduce((n, i) => n + i.quantity, 0), 0),
      toSend: paid.filter((o) => !o.fulfilled).length,
      pending: (orders || []).filter((o) => o.status === "pending").length,
    };
  }, [orders]);

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (orders || []).filter((o) => {
      if (filter === "paid" && o.status !== "paid") return false;
      if (filter === "to-send" && !(o.status === "paid" && !o.fulfilled)) return false;
      if (filter === "pending" && o.status !== "pending") return false;
      if (!q) return true;
      return [o.customerName, o.customerEmail, o.customerPhone || "", o._id.slice(-8), o.referralCode || "", ...o.items.map((i) => i.name)].join(" ").toLowerCase().includes(q);
    });
  }, [orders, filter, search]);

  const tabs: { value: Filter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "paid", label: "Paid" },
    { value: "to-send", label: `To send (${stats.toSend})` },
    { value: "pending", label: `Not paid yet (${stats.pending})` },
  ];

  return (
    <AdminShell>
      {(admin) => (
        <div className="px-6 py-12 sm:px-10">
          <PageHeader
            eyebrow="Shop"
            title="Shop Orders"
            intro="Merchandise orders only. Ticket orders are kept separate under Ticketing."
            actions={
              <button type="button" onClick={downloadContacts} className={btnSecondary}>
                Download opted-in contacts
              </button>
            }
          />
          {error && <ErrorNote>{error}</ErrorNote>}

          <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Paid orders" value={stats.paidOrders} sub={`${stats.items} items sold`} />
            <StatCard label="Money received" value={formatNaira(stats.revenue)} tone="good" sub="after referral discounts" />
            <StatCard label="To send out" value={stats.toSend} sub="paid, not yet fulfilled" tone={stats.toSend > 0 ? "warn" : "default"} />
            <StatCard label="Not paid yet" value={stats.pending} sub="started but unpaid" />
          </div>

          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {tabs.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setFilter(t.value)}
                  className={`rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors duration-200 ease-smooth ${
                    filter === t.value ? "bg-navy text-white" : "bg-navy/[0.05] text-navy/60 hover:bg-navy/10"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, phone, item or order"
              aria-label="Search orders"
              className="w-full rounded-xl border border-navy/15 bg-white px-4 py-2.5 text-sm text-navy outline-none focus:border-cyan sm:w-80"
            />
          </div>

          {orders === null ? (
            <p className="text-navy/50">Loading…</p>
          ) : shown.length === 0 ? (
            <EmptyState>{orders.length === 0 ? "No shop orders yet." : "No orders match this view."}</EmptyState>
          ) : (
            <ul className="divide-y divide-navy/10 rounded-2xl border border-navy/10">
              {shown.map((o) => {
                const isOpen = open === o._id;
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
                          {o.customerName} <span className="ml-1 text-xs font-normal text-navy/40">#{o._id.slice(-8).toUpperCase()}</span>
                        </p>
                        <p className="mt-0.5 truncate text-sm text-navy/60">{o.items.map(lineLabel).join(", ")}</p>
                        <p className="mt-0.5 text-xs text-navy/40">{dateTimeLabel(o.createdAt)}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Pill tone={statusTone[o.status]}>{statusLabel[o.status]}</Pill>
                        <Pill tone="neutral">{methodOf(o)}</Pill>
                        {o.status === "paid" && <Pill tone={o.fulfilled ? "dark" : "warn"}>{o.fulfilled ? "Sent" : "To send"}</Pill>}
                      </div>
                      <p className="w-28 text-right font-display text-xl text-navy">{formatPrice(o.totalAmount)}</p>
                    </button>

                    {isOpen && (
                      <div className="border-t border-navy/10 bg-navy/[0.025] px-5 py-6">
                        <dl className="grid gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                          <div>
                            <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-navy/40">Buyer</dt>
                            <dd className="mt-1 text-sm text-navy">
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
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-navy/40">Payment</dt>
                            <dd className="mt-1 text-sm text-navy">
                              <p>
                                <span className="font-semibold">{methodOf(o)}</span> · {statusLabel[o.status]}
                              </p>
                              {o.paidAt && <p className="text-xs text-navy/50">Paid {dateTimeLabel(o.paidAt)}</p>}
                              {o.paymentReference && <p className="break-all text-xs text-navy/50">Reference {o.paymentReference}</p>}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-navy/40">Amounts</dt>
                            <dd className="mt-1 text-sm text-navy">
                              <p>Items {formatNaira(o.subtotalAmount ?? o.totalAmount + (o.discountAmount || 0))}</p>
                              {o.referralCode && (
                                <p className="text-navy/60">
                                  Referral {o.referralCode}
                                  {o.referralOwner ? ` (${o.referralOwner})` : ""}
                                  {o.discountAmount ? `: -${formatNaira(o.discountAmount)}` : " (tracking only)"}
                                </p>
                              )}
                              <p className="mt-1 font-semibold">Total {formatPrice(o.totalAmount)}</p>
                            </dd>
                          </div>
                        </dl>

                        <p className="mb-2 mt-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-navy/40">What was bought</p>
                        <ul className="divide-y divide-navy/10 rounded-xl bg-white">
                          {o.items.map((i, idx) => (
                            <li key={idx} className="flex items-center justify-between px-4 py-2.5 text-sm text-navy">
                              <span>
                                {lineLabel(i)} <span className="text-navy/40">@ {formatPrice(i.unitPrice)}</span>
                              </span>
                              <span className="font-semibold">{formatPrice(i.unitPrice * i.quantity)}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold">
                          {o.status === "paid" && (
                            <button type="button" disabled={busyId === o._id} onClick={() => toggleFulfilled(o)} className="text-cyan transition-colors duration-200 ease-smooth hover:text-navy disabled:opacity-50">
                              {o.fulfilled ? "Sent ✓ (undo)" : "Mark as sent"}
                            </button>
                          )}
                          {o.status === "paid" && (
                            <button type="button" disabled={busyId === o._id} onClick={() => resend(o)} className="text-navy/60 transition-colors duration-200 ease-smooth hover:text-cyan disabled:opacity-50">
                              Email the confirmation again
                            </button>
                          )}
                          {admin.role === "super_admin" && o.status === "pending" && !o.paymentProvider && (
                            <button type="button" disabled={busyId === o._id} onClick={() => markPaid(o)} className="text-navy underline transition-colors duration-200 ease-smooth hover:text-cyan disabled:opacity-50">
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
        </div>
      )}
    </AdminShell>
  );
}
