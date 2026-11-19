"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/adminApi";
import { formatBytes } from "@/lib/compressImage";

type Usage = {
  plan: string | null;
  lastUpdated: string | null;
  storageBytes: number;
  photos: number | null;
  creditsUsed: number | null;
  creditsLimit: number | null;
  creditsLeft: number | null;
  usedPercent: number | null;
  bandwidthBytes: number | null;
  creditBreakdown: { storage: number; bandwidth: number; transformations: number };
};

// How full the club's photo storage (Cloudinary) is. Super admin only: the
// backend refuses anyone else, and this card simply stays out of the way if the
// numbers cannot be had.
export default function StorageCard() {
  const [usage, setUsage] = useState<Usage | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetch<Usage>("/storage")
      .then(setUsage)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not read storage."));
  }, []);

  if (error) return <p className="rounded-2xl border border-navy/10 bg-white p-5 text-sm text-navy/50">Photo storage: {error}</p>;
  if (!usage) return <div className="h-44 animate-pulse rounded-2xl bg-navy/[0.05]" aria-hidden />;

  const pct = usage.usedPercent ?? 0;
  const tone = pct >= 85 ? "bg-red-500" : pct >= 60 ? "bg-yellow" : "bg-cyan";
  const parts = [
    { key: "Storage", value: usage.creditBreakdown.storage },
    { key: "Delivery (bandwidth)", value: usage.creditBreakdown.bandwidth },
    { key: "Processing", value: usage.creditBreakdown.transformations },
  ];

  return (
    <section className="rounded-2xl border border-navy/10 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-xl uppercase text-navy">Photo storage</h2>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-navy/40">
          Cloudinary {usage.plan ? `· ${usage.plan} plan` : ""}
        </p>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="font-display text-5xl leading-none text-navy">{formatBytes(usage.storageBytes)}</p>
          <p className="mt-1.5 text-xs text-navy/50">
            stored{usage.photos !== null ? ` across ${usage.photos.toLocaleString()} photos` : ""}
          </p>

          {usage.creditsLimit !== null && usage.creditsUsed !== null && (
            <div className="mt-5">
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-semibold text-navy">Plan allowance used</span>
                <span className="text-navy/60">
                  {usage.creditsUsed} of {usage.creditsLimit} credits ({pct}%)
                </span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-navy/10" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.min(100, pct)}%` }} />
              </div>
              {usage.creditsLeft !== null && (
                <p className="mt-2 text-xs text-navy/50">
                  {usage.creditsLeft} credits left this month. One credit is about 1 GB of storage or 1 GB of photos delivered to visitors.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="rounded-xl bg-navy/[0.04] p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-navy/45">Where the allowance goes</p>
          <ul className="mt-3 space-y-2">
            {parts.map((p) => (
              <li key={p.key} className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-navy/70">{p.key}</span>
                <span className="font-semibold text-navy">{p.value.toFixed(2)}</span>
              </li>
            ))}
          </ul>
          {usage.bandwidthBytes !== null && (
            <p className="mt-3 text-[11px] leading-snug text-navy/45">{formatBytes(usage.bandwidthBytes)} of photos delivered this month. Smaller photos reduce this.</p>
          )}
        </div>
      </div>
      {usage.lastUpdated && <p className="mt-4 text-[10px] uppercase tracking-[0.16em] text-navy/30">Figures from {usage.lastUpdated}</p>}
    </section>
  );
}
