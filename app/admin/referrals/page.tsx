"use client";

import { useEffect, useState, type FormEvent } from "react";
import { clsx } from "clsx";
import AdminShell from "@/components/admin/AdminShell";
import { adminFetch } from "@/lib/adminApi";
import { formatNaira } from "@/lib/format";

type Stats = {
  shopOrders: number;
  ticketOrders: number;
  itemsSold: number;
  ticketsIssued: number;
  revenue: number;
  discount: number;
};

type Referral = {
  _id: string;
  code: string;
  ownerName: string;
  discountPercent: number;
  appliesTo: "both" | "shop" | "tickets";
  isActive: boolean;
  notes?: string;
  stats: Stats;
};

type FormValues = {
  code: string;
  ownerName: string;
  discountPercent: string;
  appliesTo: Referral["appliesTo"];
  notes: string;
  isActive: boolean;
};

const emptyForm: FormValues = { code: "", ownerName: "", discountPercent: "0", appliesTo: "both", notes: "", isActive: true };

const appliesLabel: Record<Referral["appliesTo"], string> = {
  both: "Shop and tickets",
  shop: "Shop only",
  tickets: "Tickets only",
};

const fieldClass =
  "w-full border-b border-navy/20 bg-transparent px-1 py-3 text-sm text-navy outline-none transition-colors duration-200 ease-smooth placeholder:text-navy/30 focus:border-cyan disabled:text-navy/40";
const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-wide text-navy/50";

function CodeForm({
  initial,
  editing,
  saving,
  error,
  onSave,
  onCancel,
}: {
  initial: FormValues;
  editing: boolean;
  saving: boolean;
  error: string;
  onSave: (v: FormValues) => void;
  onCancel: () => void;
}) {
  const [v, setV] = useState<FormValues>(initial);
  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => setV((prev) => ({ ...prev, [key]: value }));

  function submit(e: FormEvent) {
    e.preventDefault();
    onSave(v);
  }

  return (
    <form onSubmit={submit} className="rounded-2xl bg-navy/[0.04] p-5 sm:p-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="rc-code" className={labelClass}>
            Code
          </label>
          <input
            id="rc-code"
            required
            disabled={editing}
            value={v.code}
            onChange={(e) => set("code", e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""))}
            placeholder="e.g. EMEKA10"
            maxLength={24}
            className={`${fieldClass} font-semibold uppercase tracking-wide`}
          />
          {editing && <p className="mt-1 text-xs text-navy/40">A code cannot be renamed. Add a new one instead.</p>}
        </div>
        <div>
          <label htmlFor="rc-owner" className={labelClass}>
            Belongs to (name)
          </label>
          <input id="rc-owner" required value={v.ownerName} onChange={(e) => set("ownerName", e.target.value)} placeholder="Full name of the person" className={fieldClass} />
        </div>
        <div>
          <label htmlFor="rc-percent" className={labelClass}>
            Discount (%)
          </label>
          <input
            id="rc-percent"
            type="number"
            min={0}
            max={100}
            value={v.discountPercent}
            onChange={(e) => set("discountPercent", e.target.value)}
            className={fieldClass}
          />
          <p className="mt-1 text-xs text-navy/40">0 means no discount: the code only tracks who brought the sale in.</p>
        </div>
        <div>
          <span className={labelClass}>Works on</span>
          <div className="flex flex-wrap gap-2">
            {(["both", "shop", "tickets"] as const).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => set("appliesTo", a)}
                className={clsx(
                  "rounded-xl border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors duration-200 ease-smooth",
                  v.appliesTo === a ? "border-cyan bg-cyan/10 text-navy" : "border-navy/15 text-navy/50 hover:border-navy/30"
                )}
              >
                {appliesLabel[a]}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-5">
        <label htmlFor="rc-notes" className={labelClass}>
          Note (optional, only you see this)
        </label>
        <input id="rc-notes" value={v.notes} onChange={(e) => set("notes", e.target.value)} placeholder="e.g. UNILAG ambassador" className={fieldClass} />
      </div>
      <label className="mt-5 flex cursor-pointer items-center gap-3 text-sm text-navy">
        <input type="checkbox" checked={v.isActive} onChange={(e) => set("isActive", e.target.checked)} className="h-4 w-4 accent-navy" />
        Code is active
      </label>

      {error && (
        <p className="mt-4 text-sm text-red-500" role="alert">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="submit" disabled={saving} className="btn-glass btn-glass-yellow px-7 py-3 text-sm font-bold uppercase tracking-wide disabled:opacity-60">
          {saving ? "Saving…" : editing ? "Save changes" : "Add code"}
        </button>
        <button type="button" onClick={onCancel} className="btn-glass btn-glass-navy px-7 py-3 text-sm font-bold uppercase tracking-wide">
          Cancel
        </button>
      </div>
    </form>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-navy/40">{label}</p>
      <p className="mt-1 font-display text-2xl leading-none text-navy">{value}</p>
    </div>
  );
}

export default function AdminReferralsPage() {
  const [codes, setCodes] = useState<Referral[] | null>(null);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    adminFetch<Referral[]>("/referrals")
      .then(setCodes)
      .catch((err) => setError(err.message));
  }
  useEffect(load, []);

  async function save(values: FormValues, id?: string) {
    setSaving(true);
    setFormError("");
    try {
      const body = JSON.stringify({
        code: values.code,
        ownerName: values.ownerName.trim(),
        discountPercent: Number(values.discountPercent) || 0,
        appliesTo: values.appliesTo,
        notes: values.notes.trim(),
        isActive: values.isActive,
      });
      await adminFetch(id ? `/referrals/${id}` : "/referrals", { method: id ? "PUT" : "POST", body });
      setAdding(false);
      setEditingId(null);
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not save the code.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(c: Referral) {
    setBusyId(c._id);
    try {
      await adminFetch(`/referrals/${c._id}`, {
        method: "PUT",
        body: JSON.stringify({ ownerName: c.ownerName, discountPercent: c.discountPercent, appliesTo: c.appliesTo, notes: c.notes, isActive: !c.isActive }),
      });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the code.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(c: Referral) {
    if (!window.confirm(`Delete the code ${c.code}? Orders already placed with it keep their record. This cannot be undone.`)) return;
    setBusyId(c._id);
    try {
      await adminFetch(`/referrals/${c._id}`, { method: "DELETE" });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete the code.");
    } finally {
      setBusyId(null);
    }
  }

  const totals = (codes || []).reduce(
    (t, c) => ({
      orders: t.orders + c.stats.shopOrders + c.stats.ticketOrders,
      revenue: t.revenue + c.stats.revenue,
      discount: t.discount + c.stats.discount,
    }),
    { orders: 0, revenue: 0, discount: 0 }
  );

  return (
    <AdminShell>
      {() => (
        <div className="px-6 py-16 sm:px-10">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Sales</p>
              <h1 className="display-title font-display mt-2">Referral Codes</h1>
              <p className="mt-2 max-w-xl text-sm text-navy/50">
                Each code belongs to a person. Buyers enter it at checkout, in the shop or for tickets. Give it a discount, or
                set it to 0% to just track who brings sales in.
              </p>
            </div>
            {!adding && (
              <button
                type="button"
                onClick={() => {
                  setAdding(true);
                  setEditingId(null);
                  setFormError("");
                }}
                className="btn-glass btn-glass-yellow px-6 py-3 text-xs font-bold uppercase tracking-wide"
              >
                + New code
              </button>
            )}
          </div>

          {error && (
            <p className="mb-4 text-sm text-red-500" role="alert">
              {error}
            </p>
          )}

          {adding && (
            <div className="mb-8 max-w-3xl">
              <CodeForm
                initial={emptyForm}
                editing={false}
                saving={saving}
                error={formError}
                onSave={(v) => save(v)}
                onCancel={() => setAdding(false)}
              />
            </div>
          )}

          {codes && codes.length > 0 && (
            <div className="mb-8 grid grid-cols-3 gap-4 border-y border-navy/10 py-5 sm:max-w-xl">
              <Stat label="Orders" value={String(totals.orders)} />
              <Stat label="Paid in" value={formatNaira(totals.revenue)} />
              <Stat label="Discounts" value={formatNaira(totals.discount)} />
            </div>
          )}

          {codes === null ? (
            <p className="text-navy/50">Loading…</p>
          ) : codes.length === 0 && !adding ? (
            <p className="text-navy/50">No referral codes yet. Add the first one.</p>
          ) : (
            <ul className="border-t border-navy/10">
              {codes.map((c) =>
                editingId === c._id ? (
                  <li key={c._id} className="border-b border-navy/10 py-6">
                    <div className="max-w-3xl">
                      <CodeForm
                        initial={{
                          code: c.code,
                          ownerName: c.ownerName,
                          discountPercent: String(c.discountPercent),
                          appliesTo: c.appliesTo,
                          notes: c.notes || "",
                          isActive: c.isActive,
                        }}
                        editing
                        saving={saving}
                        error={formError}
                        onSave={(v) => save(v, c._id)}
                        onCancel={() => setEditingId(null)}
                      />
                    </div>
                  </li>
                ) : (
                  <li key={c._id} className="border-b border-navy/10 py-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-center gap-3">
                          <span className="font-display text-3xl leading-none tracking-wide text-navy">{c.code}</span>
                          <span
                            className={clsx(
                              "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                              c.isActive ? "bg-cyan/20 text-navy" : "bg-navy/10 text-navy/50"
                            )}
                          >
                            {c.isActive ? "Active" : "Off"}
                          </span>
                        </p>
                        <p className="mt-2 text-sm font-medium text-navy">{c.ownerName}</p>
                        <p className="mt-1 text-xs uppercase tracking-wide text-navy/45">
                          {c.discountPercent > 0 ? `${c.discountPercent}% off` : "Tracking only"} · {appliesLabel[c.appliesTo]}
                        </p>
                        {c.notes && <p className="mt-1 text-xs text-navy/40">{c.notes}</p>}
                      </div>
                      <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm font-semibold">
                        <button type="button" onClick={() => { setEditingId(c._id); setAdding(false); setFormError(""); }} className="text-cyan transition-colors duration-200 ease-smooth hover:text-navy">
                          Edit
                        </button>
                        <button type="button" onClick={() => toggleActive(c)} disabled={busyId === c._id} className="text-navy/60 transition-colors duration-200 ease-smooth hover:text-navy disabled:opacity-50">
                          {c.isActive ? "Turn off" : "Turn on"}
                        </button>
                        <button type="button" onClick={() => remove(c)} disabled={busyId === c._id} className="text-navy/40 transition-colors duration-200 ease-smooth hover:text-red-500 disabled:opacity-50">
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4 lg:grid-cols-5">
                      <Stat label="Shop orders" value={`${c.stats.shopOrders} (${c.stats.itemsSold} items)`} />
                      <Stat label="Ticket orders" value={`${c.stats.ticketOrders} (${c.stats.ticketsIssued} tickets)`} />
                      <Stat label="Paid in" value={formatNaira(c.stats.revenue)} />
                      <Stat label="Discount given" value={formatNaira(c.stats.discount)} />
                    </div>
                  </li>
                )
              )}
            </ul>
          )}
        </div>
      )}
    </AdminShell>
  );
}
