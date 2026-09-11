"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import AdminShell from "@/components/admin/AdminShell";
import { adminFetch, revalidatePublicPaths } from "@/lib/adminApi";

type Sponsor = {
  _id: string;
  name: string;
  logoUrl: string;
  website?: string;
  tier: "principal" | "partner" | "supplier";
  displayOrder: number;
  isActive: boolean;
};

export default function AdminSponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[] | null>(null);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function load() {
    adminFetch<Sponsor[]>("/sponsors")
      .then(setSponsors)
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  async function handleDelete(id: string) {
    if (!confirm("Permanently delete this sponsor? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await adminFetch(`/sponsors/${id}`, { method: "DELETE" });
      await revalidatePublicPaths(["/sponsors", "/"]);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete sponsor.");
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
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">
                Content
              </p>
              <h1 className="display-title font-display mt-2">Sponsors</h1>
            </div>
            <Link
              href="/admin/sponsors/new"
              className="rounded-full bg-yellow px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-navy-dark transition-transform duration-300 ease-smooth hover:scale-105"
            >
              + Add sponsor
            </Link>
          </div>

          {error && (
            <p className="mb-4 text-sm text-red-500" role="alert">
              {error}
            </p>
          )}

          {sponsors === null ? (
            <p className="text-navy/50">Loading…</p>
          ) : sponsors.length === 0 ? (
            <p className="text-navy/50">No sponsors yet — add the first one.</p>
          ) : (
            <div className="border-t border-navy/10">
              {sponsors.map((sponsor) => (
                <div
                  key={sponsor._id}
                  className="flex items-center justify-between gap-4 border-b border-navy/10 py-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-20 items-center justify-center border border-navy/10 bg-white p-2">
                      <Image
                        src={sponsor.logoUrl}
                        alt=""
                        width={80}
                        height={40}
                        className="max-h-full w-auto object-contain"
                        unoptimized
                      />
                    </div>
                    <div>
                      <p className="font-medium text-navy">{sponsor.name}</p>
                      <p className="text-xs uppercase tracking-wide text-navy/40">
                        {sponsor.tier} · {sponsor.isActive ? "Active" : "Hidden"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Link
                      href={`/admin/sponsors/${sponsor._id}`}
                      className="text-sm font-semibold text-cyan transition-colors duration-200 ease-smooth hover:text-navy"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(sponsor._id)}
                      disabled={deletingId === sponsor._id}
                      className="text-sm font-semibold text-navy/40 transition-colors duration-200 ease-smooth hover:text-red-500 disabled:opacity-50"
                    >
                      {deletingId === sponsor._id ? "Removing…" : "Remove"}
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
