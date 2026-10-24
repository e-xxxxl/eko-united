"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import MembershipTabs from "@/components/admin/MembershipTabs";
import { adminFetch, revalidatePublicPaths } from "@/lib/adminApi";
import type { MembershipTier } from "@/lib/membershipTypes";

export default function AdminMembershipPackagesPage() {
  const [tiers, setTiers] = useState<MembershipTier[] | null>(null);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function load() {
    adminFetch<MembershipTier[]>("/membership/tiers")
      .then(setTiers)
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  async function handleDelete(id: string) {
    if (!confirm("Permanently delete this package? Past applications keep its name. This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await adminFetch(`/membership/tiers/${id}`, { method: "DELETE" });
      await revalidatePublicPaths(["/membership"]);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete package.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AdminShell>
      {() => (
        <div className="px-6 py-16 sm:px-10">
          <div className="mb-6 flex items-baseline justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Membership</p>
              <h1 className="display-title font-display mt-2">Packages</h1>
            </div>
            <Link
              href="/admin/membership/packages/new"
              className="btn-glass btn-glass-yellow px-6 py-2.5 text-xs font-bold uppercase tracking-wide"
            >
              + Add package
            </Link>
          </div>
          <MembershipTabs current="/admin/membership/packages" />

          {error && (
            <p className="mb-4 text-sm text-red-500" role="alert">
              {error}
            </p>
          )}

          {tiers === null ? (
            <p className="text-navy/50">Loading…</p>
          ) : tiers.length === 0 ? (
            <p className="text-navy/50">No packages yet. Add the first one.</p>
          ) : (
            <div className="border-t border-navy/10">
              {tiers.map((tier) => (
                <div key={tier._id} className="flex items-center justify-between gap-4 border-b border-navy/10 py-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-navy">{tier.name}</p>
                    <p className="text-xs uppercase tracking-wide text-navy/40">
                      {tier.price}
                      {tier.period ? ` ${tier.period}` : ""} · {tier.perks.length} perks · order {tier.displayOrder} ·{" "}
                      {tier.isActive ? "Showing" : "Hidden"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    <Link
                      href={`/admin/membership/packages/${tier._id}`}
                      className="text-sm font-semibold text-cyan transition-colors duration-200 ease-smooth hover:text-navy"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(tier._id)}
                      disabled={deletingId === tier._id}
                      className="text-sm font-semibold text-navy/40 transition-colors duration-200 ease-smooth hover:text-red-500 disabled:opacity-50"
                    >
                      {deletingId === tier._id ? "Removing…" : "Remove"}
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
