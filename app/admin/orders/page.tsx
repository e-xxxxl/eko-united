"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { adminFetch } from "@/lib/adminApi";
import { formatNaira, formatPrice } from "@/lib/format";
import { API_URL } from "@/lib/api";
import { getToken } from "@/lib/adminAuth";

type Order = {
  _id: string;
  type: "shop" | "ticket";
  items: { name: string; unitPrice: number; quantity: number; size?: string; version?: "replica" | "player" }[];
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  totalAmount: number;
  discountAmount?: number;
  referralCode?: string;
  referralOwner?: string;
  marketingConsent?: boolean;
  status: "pending" | "paid" | "failed" | "cancelled";
  paymentProvider?: "paystack" | "flutterwave";
  fulfilled: boolean;
  createdAt: string;
};

const statusTone: Record<Order["status"], string> = {
  paid: "text-cyan",
  pending: "text-navy/50",
  failed: "text-red-500",
  cancelled: "text-navy/30",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ id: string; text: string; tone: "ok" | "error" } | null>(null);

  function load() {
    adminFetch<Order[]>("/orders")
      .then(setOrders)
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  function flashNotice(id: string, text: string, tone: "ok" | "error") {
    setNotice({ id, text, tone });
    setTimeout(() => setNotice((prev) => (prev?.id === id ? null : prev)), 4000);
  }

  // People who ticked the box to hear from the club, as a spreadsheet.
  async function downloadContacts() {
    setError("");
    try {
      const res = await fetch(`${API_URL}/admin/orders/contacts.csv`, { headers: { Authorization: `Bearer ${getToken()}` } });
      if (!res.ok) throw new Error("Could not download the list.");
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = "eko-united-contacts.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not download the list.");
    }
  }

  async function toggleFulfilled(order: Order) {
    setUpdatingId(order._id);
    try {
      const updated = await adminFetch<Order>(`/orders/${order._id}`, {
        method: "PUT",
        body: JSON.stringify({ fulfilled: !order.fulfilled }),
      });
      setOrders((prev) => (prev ? prev.map((o) => (o._id === updated._id ? updated : o)) : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update order.");
    } finally {
      setUpdatingId(null);
    }
  }

  // Only for orders paid outside the online flow (no paymentProvider stamped;
  // see backend/src/routes/admin/orders.js for why a provider-tracked
  // order refuses this). Goes through the same stock/ticket/email path a
  // real payment webhook does, so this is also how the order confirmation
  // email gets exercised today, before live payment credentials exist.
  async function markPaid(order: Order) {
    setUpdatingId(order._id);
    try {
      const updated = await adminFetch<Order>(`/orders/${order._id}/mark-paid`, { method: "POST" });
      setOrders((prev) => (prev ? prev.map((o) => (o._id === updated._id ? updated : o)) : prev));
      flashNotice(order._id, "Marked paid, confirmation email sent (if Resend is configured).", "ok");
    } catch (err) {
      flashNotice(order._id, err instanceof Error ? err.message : "Failed to mark paid.", "error");
    } finally {
      setUpdatingId(null);
    }
  }

  async function resendConfirmation(order: Order) {
    setUpdatingId(order._id);
    try {
      await adminFetch(`/orders/${order._id}/resend-confirmation`, { method: "POST" });
      flashNotice(order._id, "Confirmation email sent.", "ok");
    } catch (err) {
      flashNotice(order._id, err instanceof Error ? err.message : "Failed to send.", "error");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <AdminShell>
      {(admin) => (
        <div className="px-6 py-16 sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Sales</p>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <h1 className="display-title font-display mt-2">Orders</h1>
            <button
              type="button"
              onClick={downloadContacts}
              className="btn-glass btn-glass-navy px-5 py-2.5 text-xs font-bold uppercase tracking-wide"
            >
              Download opted-in contacts (CSV)
            </button>
          </div>

          {error && (
            <p className="mb-4 text-sm text-red-500" role="alert">
              {error}
            </p>
          )}

          {orders === null ? (
            <p className="text-navy/50">Loading…</p>
          ) : orders.length === 0 ? (
            <p className="text-navy/50">No orders yet.</p>
          ) : (
            <div className="border-t border-navy/10">
              {orders.map((order) => (
                <div key={order._id} className="flex flex-wrap items-start justify-between gap-4 border-b border-navy/10 py-5">
                  <div>
                    <p className="font-medium text-navy">
                      {order.customerName} <span className="text-navy/40">· {order.customerEmail}</span>
                      {order.customerPhone && <span className="text-navy/40"> · {order.customerPhone}</span>}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-navy/40">
                      {order.type} ·{" "}
                      {order.items
                        .map(
                          (i) =>
                            `${i.quantity}× ${i.name}${i.version ? ` (${i.version === "replica" ? "Replica" : "Player version"})` : ""}${i.size ? ` (${i.size})` : ""}`
                        )
                        .join(", ")}
                    </p>
                    {(order.referralCode || order.marketingConsent) && (
                      <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                        {order.referralCode && (
                          <span className="font-semibold text-navy/60">
                            Referral {order.referralCode}
                            {order.referralOwner ? ` (${order.referralOwner})` : ""}
                            {order.discountAmount ? `, -${formatNaira(order.discountAmount)}` : ""}
                          </span>
                        )}
                        {order.marketingConsent && <span className="font-semibold text-cyan">Opted in to emails and SMS</span>}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-navy/40">
                      {new Date(order.createdAt).toLocaleString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "Africa/Lagos",
                      })}
                    </p>
                    {notice?.id === order._id && (
                      <p className={`mt-2 text-xs font-semibold ${notice.tone === "ok" ? "text-cyan" : "text-red-500"}`}>
                        {notice.text}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-display text-lg text-navy">{formatPrice(order.totalAmount)}</p>
                    <p className={`text-xs font-semibold uppercase tracking-wide ${statusTone[order.status]}`}>
                      {order.status}
                    </p>

                    {order.type === "shop" && order.status === "paid" && (
                      <button
                        type="button"
                        onClick={() => toggleFulfilled(order)}
                        disabled={updatingId === order._id}
                        className="mt-2 block text-xs font-semibold text-cyan transition-colors duration-200 ease-smooth hover:text-navy disabled:opacity-50"
                      >
                        {updatingId === order._id ? "Updating…" : order.fulfilled ? "Fulfilled ✓" : "Mark fulfilled"}
                      </button>
                    )}

                    {admin.role === "super_admin" && order.status === "pending" && !order.paymentProvider && (
                      <button
                        type="button"
                        onClick={() => markPaid(order)}
                        disabled={updatingId === order._id}
                        className="mt-2 block text-xs font-semibold text-navy underline transition-colors duration-200 ease-smooth hover:text-cyan disabled:opacity-50"
                      >
                        {updatingId === order._id ? "Marking paid…" : "Mark paid (offline payment)"}
                      </button>
                    )}

                    {order.status === "paid" && (
                      <button
                        type="button"
                        onClick={() => resendConfirmation(order)}
                        disabled={updatingId === order._id}
                        className="mt-2 block text-xs font-semibold text-navy/50 transition-colors duration-200 ease-smooth hover:text-cyan disabled:opacity-50"
                      >
                        {updatingId === order._id ? "Sending…" : "Resend confirmation email"}
                      </button>
                    )}
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
