"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { adminFetch, revalidatePublicPaths } from "@/lib/adminApi";
import { fetchMatchOptions, type MatchOption } from "@/lib/adminMatches";
import { formatPrice } from "@/lib/format";

type Row = { key: "regular" | "premium" | "box"; name: string; price: string; quantity: string; include: boolean };

// The club's standard seating. Regular (the popular side) is free, Premium is
// 3,000 naira, Box is 50,000 naira. For the first game of the season Premium is
// free too: tick the box below and its price drops to 0 for this match only.
const PREMIUM_PRICE = "3000";
const initialRows: Row[] = [
  { key: "regular", name: "Regular (Popular Side)", price: "0", quantity: "", include: true },
  { key: "premium", name: "Premium", price: PREMIUM_PRICE, quantity: "", include: true },
  { key: "box", name: "Box", price: "50000", quantity: "", include: true },
];

const fieldClass =
  "w-full border-b border-navy/20 bg-transparent px-1 py-3 text-sm text-navy outline-none transition-colors duration-200 ease-smooth placeholder:text-navy/30 focus:border-cyan disabled:text-navy/40";
const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-wide text-navy/50";

export default function StandardTicketsPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<MatchOption[]>([]);
  const [matchId, setMatchId] = useState("");
  const [firstGame, setFirstGame] = useState(false);
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMatchOptions().then(setMatches);
  }, []);

  const priceOf = (r: Row) => (r.key === "premium" && firstGame ? 0 : Number(r.price) || 0);
  const update = (key: Row["key"], patch: Partial<Row>) => setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const chosen = rows.filter((r) => r.include);
    if (!matchId) return setError("Choose the match.");
    if (chosen.length === 0) return setError("Tick at least one ticket type.");
    for (const r of chosen) {
      const q = Number(r.quantity);
      if (!r.name.trim()) return setError("Every ticket type needs a name.");
      if (!Number.isInteger(q) || q < 1) return setError(`Enter how many ${r.name} tickets there are.`);
    }

    setSaving(true);
    try {
      // Skip a type this match already has, so running this twice never doubles up.
      const existing = await adminFetch<{ name: string }[]>(`/ticket-types?match=${matchId}`);
      const have = new Set(existing.map((t) => t.name.trim().toLowerCase()));
      const toCreate = chosen.filter((r) => !have.has(r.name.trim().toLowerCase()));
      if (toCreate.length === 0) {
        setError("This match already has all of those ticket types.");
        setSaving(false);
        return;
      }
      for (const r of toCreate) {
        await adminFetch("/ticket-types", {
          method: "POST",
          body: JSON.stringify({ match: matchId, name: r.name.trim(), price: priceOf(r), quantityAvailable: Number(r.quantity) }),
        });
      }
      await revalidatePublicPaths(["/tickets"]);
      router.push("/admin/ticket-types");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the tickets.");
      setSaving(false);
    }
  }

  return (
    <AdminShell>
      {() => (
        <div className="px-6 py-16 sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Tickets</p>
          <h1 className="display-title font-display mt-2">Standard Tickets</h1>
          <p className="mb-10 mt-2 max-w-xl text-sm text-navy/50">
            Add Regular (Popular Side), Premium and Box tickets to a match in one go. Nothing is created until you press the
            button. Prices can be changed here or later under Ticket Types.
          </p>

          <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
            <div>
              <label htmlFor="match" className={labelClass}>
                Match
              </label>
              <select id="match" value={matchId} onChange={(e) => setMatchId(e.target.value)} className={fieldClass}>
                <option value="">Select a match…</option>
                {matches.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.isHome ? "vs " : "at "}
                    {m.opponent} ·{" "}
                    {new Date(m.kickoff).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Lagos" })}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-navy/[0.04] p-4 text-sm text-navy">
              <input type="checkbox" checked={firstGame} onChange={(e) => setFirstGame(e.target.checked)} className="mt-0.5 h-4 w-4 accent-navy" />
              <span>
                <span className="font-semibold">This is the first game of the season</span>
                <span className="mt-1 block text-xs leading-relaxed text-navy/55">
                  Premium tickets are free for this match. Fans still give their name, email and phone number, and can claim up to 4
                  per order.
                </span>
              </span>
            </label>

            <div className="space-y-6">
              {rows.map((r) => (
                <div key={r.key} className="rounded-2xl border border-navy/10 p-5">
                  <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-navy">
                    <input type="checkbox" checked={r.include} onChange={(e) => update(r.key, { include: e.target.checked })} className="h-4 w-4 accent-navy" />
                    Add this ticket type
                    <span className="ml-auto font-display text-xl text-cyan">{formatPrice(priceOf(r))}</span>
                  </label>
                  <div className="mt-4 grid gap-5 sm:grid-cols-3">
                    <div className="sm:col-span-1">
                      <label htmlFor={`name-${r.key}`} className={labelClass}>
                        Name
                      </label>
                      <input id={`name-${r.key}`} value={r.name} disabled={!r.include} onChange={(e) => update(r.key, { name: e.target.value })} className={fieldClass} />
                    </div>
                    <div>
                      <label htmlFor={`price-${r.key}`} className={labelClass}>
                        Price (₦)
                      </label>
                      <input
                        id={`price-${r.key}`}
                        type="number"
                        min={0}
                        disabled={!r.include || (r.key === "premium" && firstGame)}
                        value={r.key === "premium" && firstGame ? "0" : r.price}
                        onChange={(e) => update(r.key, { price: e.target.value })}
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <label htmlFor={`qty-${r.key}`} className={labelClass}>
                        How many tickets
                      </label>
                      <input
                        id={`qty-${r.key}`}
                        type="number"
                        min={1}
                        disabled={!r.include}
                        value={r.quantity}
                        onChange={(e) => update(r.key, { quantity: e.target.value })}
                        placeholder="e.g. 500"
                        className={fieldClass}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <p className="text-sm text-red-500" role="alert">
                {error}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={saving} className="btn-glass btn-glass-yellow px-8 py-3 text-sm font-bold uppercase tracking-wide disabled:opacity-60">
                {saving ? "Creating…" : "Create tickets"}
              </button>
              <Link href="/admin/ticket-types" className="btn-glass btn-glass-navy px-8 py-3 text-sm font-bold uppercase tracking-wide">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      )}
    </AdminShell>
  );
}
