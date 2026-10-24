"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { adminFetch } from "@/lib/adminApi";
import MembershipTabs from "@/components/admin/MembershipTabs";

type Application = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  tier: string;
  tierName?: string;
  emailed: boolean;
  read: boolean;
  createdAt: string;
};


export default function AdminMembershipPage() {
  const [items, setItems] = useState<Application[] | null>(null);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    adminFetch<Application[]>("/membership")
      .then(setItems)
      .catch((err) => setError(err.message));
  }, []);

  async function toggleHandled(item: Application) {
    setUpdatingId(item._id);
    try {
      const updated = await adminFetch<Application>(`/membership/${item._id}`, {
        method: "PUT",
        body: JSON.stringify({ read: !item.read }),
      });
      setItems((prev) => (prev ? prev.map((x) => (x._id === updated._id ? updated : x)) : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update application.");
    } finally {
      setUpdatingId(null);
    }
  }

  const waiting = items?.filter((x) => !x.read).length ?? 0;

  return (
    <AdminShell>
      {() => (
        <div className="px-6 py-16 sm:px-10">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Content</p>
            <h1 className="display-title font-display mt-2 mb-6">Membership</h1>
            <MembershipTabs current="/admin/membership" />
            {items !== null && (
              <p className="mt-2 text-sm text-navy/50">
                {waiting === 0 ? "All applications handled." : `${waiting} waiting to be followed up.`}
              </p>
            )}
          </div>

          {error && (
            <p className="mb-4 text-sm text-red-500" role="alert">
              {error}
            </p>
          )}

          {items === null ? (
            <p className="text-navy/50">Loading…</p>
          ) : items.length === 0 ? (
            <p className="text-navy/50">No applications yet. They appear here as soon as someone applies on the website.</p>
          ) : (
            <div className="border-t border-navy/10">
              {items.map((item) => (
                <div key={item._id} className={`border-b border-navy/10 py-5 ${item.read ? "" : "bg-cyan/5"}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-navy">
                        {item.name}
                        <span className="ml-2 rounded-md bg-navy px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                          {item.tierName || item.tier}
                        </span>
                        {!item.read && (
                          <span className="ml-2 rounded-md bg-cyan/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-navy">
                            New
                          </span>
                        )}
                      </p>
                      <p className="mt-1 text-sm text-navy/70">
                        <a href={`mailto:${item.email}`} className="text-cyan hover:text-navy">
                          {item.email}
                        </a>
                        {" · "}
                        <a href={`tel:${item.phone}`} className="text-cyan hover:text-navy">
                          {item.phone}
                        </a>
                      </p>
                      <p className="mt-1 text-xs text-navy/40">
                        {new Date(item.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          timeZone: "Africa/Lagos",
                        })}
                        {" · "}
                        {item.emailed ? "Emailed to marketing" : "Not emailed (email not set up), follow up from here"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleHandled(item)}
                      disabled={updatingId === item._id}
                      className="text-sm font-semibold text-cyan transition-colors duration-200 ease-smooth hover:text-navy disabled:opacity-50"
                    >
                      {updatingId === item._id ? "Updating…" : item.read ? "Mark as waiting" : "Mark as handled"}
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
