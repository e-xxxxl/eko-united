"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { adminFetch } from "@/lib/adminApi";
import { formatNaira } from "@/lib/format";

type Overview = {
  season: { played: number; wins: number; draws: number; losses: number; goalsFor: number; goalsAgainst: number };
  topScorers: { player: string; goals: number }[];
  tickets: { revenue: number; sold: number; totalIssued: number; checkedIn: number };
  shop: { revenue: number; orders: number; topProducts: { name: string; quantity: number }[] };
  recentOrders: { _id: string; type: "shop" | "ticket"; customerName: string; totalAmount: number; createdAt: string }[];
};

// Cross-cutting rollup (results + ticket revenue + shop revenue in one
// place): super_admin only, see backend/src/routes/admin/analytics.js for
// why. Every other role already has its own scoped view of this data
// elsewhere (Orders, Matches, Ticket Types).
function StatTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="border-t border-navy/10 pt-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-navy/40">{label}</p>
      <p className="font-display mt-1 text-3xl text-navy">{value}</p>
      {sub && <p className="mt-1 text-xs text-navy/40">{sub}</p>}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetch<Overview>("/analytics/overview")
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <AdminShell>
      {() => (
        <div className="px-6 py-16 sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Overview</p>
          <h1 className="display-title font-display mt-2 mb-10">Analytics</h1>

          {error && (
            <p className="mb-4 text-sm text-red-500" role="alert">
              {error}
            </p>
          )}

          {data === null && !error ? (
            <p className="text-navy/50">Loading…</p>
          ) : data ? (
            <div className="space-y-14">
              <section>
                <p className="mb-4 font-display text-lg text-navy">Season Record</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
                  <StatTile label="Played" value={String(data.season.played)} />
                  <StatTile
                    label="W / D / L"
                    value={`${data.season.wins} / ${data.season.draws} / ${data.season.losses}`}
                  />
                  <StatTile
                    label="Goals For / Against"
                    value={`${data.season.goalsFor} / ${data.season.goalsAgainst}`}
                  />
                  <StatTile
                    label="Goal Difference"
                    value={
                      data.season.goalsFor - data.season.goalsAgainst >= 0
                        ? `+${data.season.goalsFor - data.season.goalsAgainst}`
                        : String(data.season.goalsFor - data.season.goalsAgainst)
                    }
                  />
                </div>

                {data.topScorers.length > 0 && (
                  <div className="mt-8">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-navy/40">Top Scorers</p>
                    <div className="border-t border-navy/10">
                      {data.topScorers.map((s, i) => (
                        <div
                          key={s.player}
                          className="flex items-center justify-between border-b border-navy/10 py-2.5 text-sm"
                        >
                          <span className="text-navy">
                            <span className="mr-2 text-navy/30">{i + 1}</span>
                            {s.player}
                          </span>
                          <span className="font-semibold text-navy">{s.goals}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              <section>
                <p className="mb-4 font-display text-lg text-navy">Ticket Sales</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
                  <StatTile label="Revenue" value={formatNaira(data.tickets.revenue)} />
                  <StatTile label="Tickets Sold" value={String(data.tickets.sold)} />
                  <StatTile
                    label="Checked In"
                    value={`${data.tickets.checkedIn} / ${data.tickets.totalIssued}`}
                    sub={
                      data.tickets.totalIssued > 0
                        ? `${Math.round((data.tickets.checkedIn / data.tickets.totalIssued) * 100)}% gate turnout`
                        : undefined
                    }
                  />
                </div>
              </section>

              <section>
                <p className="mb-4 font-display text-lg text-navy">Shop Sales</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
                  <StatTile label="Revenue" value={formatNaira(data.shop.revenue)} />
                  <StatTile label="Orders" value={String(data.shop.orders)} />
                </div>

                {data.shop.topProducts.length > 0 && (
                  <div className="mt-8">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-navy/40">
                      Best-Selling Products
                    </p>
                    <div className="border-t border-navy/10">
                      {data.shop.topProducts.map((p, i) => (
                        <div
                          key={p.name}
                          className="flex items-center justify-between border-b border-navy/10 py-2.5 text-sm"
                        >
                          <span className="text-navy">
                            <span className="mr-2 text-navy/30">{i + 1}</span>
                            {p.name}
                          </span>
                          <span className="font-semibold text-navy">{p.quantity} sold</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {data.recentOrders.length > 0 && (
                <section>
                  <p className="mb-4 font-display text-lg text-navy">Recent Paid Orders</p>
                  <div className="border-t border-navy/10">
                    {data.recentOrders.map((o) => (
                      <div
                        key={o._id}
                        className="flex flex-wrap items-center justify-between gap-2 border-b border-navy/10 py-3 text-sm"
                      >
                        <span className="text-navy">
                          {o.customerName}{" "}
                          <span className="text-xs uppercase tracking-wide text-navy/40">· {o.type}</span>
                        </span>
                        <span className="flex items-center gap-3">
                          <span className="font-semibold text-navy">{formatNaira(o.totalAmount)}</span>
                          <span className="text-xs text-navy/40">
                            {new Date(o.createdAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              timeZone: "Africa/Lagos",
                            })}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          ) : null}
        </div>
      )}
    </AdminShell>
  );
}
