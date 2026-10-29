"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";
import AdminShell from "@/components/admin/AdminShell";
import { adminFetch } from "@/lib/adminApi";

type Enquiry = {
  _id: string;
  type: "volunteer" | "media" | "campus_ambassador";
  name: string;
  email: string;
  phone?: string;
  details: Record<string, string>;
  emailed: boolean;
  read: boolean;
  createdAt: string;
};

const typeLabel = { volunteer: "Volunteer", campus_ambassador: "Campus ambassador", media: "Media accreditation" } as const;

export default function AdminEnquiriesPage() {
  const [items, setItems] = useState<Enquiry[] | null>(null);
  const [filter, setFilter] = useState<"all" | "volunteer" | "campus_ambassador" | "media">("all");
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    adminFetch<Enquiry[]>("/enquiries")
      .then(setItems)
      .catch((err) => setError(err.message));
  }, []);

  async function toggle(item: Enquiry) {
    setUpdatingId(item._id);
    try {
      const updated = await adminFetch<Enquiry>(`/enquiries/${item._id}`, {
        method: "PUT",
        body: JSON.stringify({ read: !item.read }),
      });
      setItems((prev) => (prev ? prev.map((x) => (x._id === updated._id ? updated : x)) : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update.");
    } finally {
      setUpdatingId(null);
    }
  }

  const shown = (items || []).filter((i) => filter === "all" || i.type === filter);
  const waiting = (items || []).filter((i) => !i.read).length;

  return (
    <AdminShell>
      {() => (
        <div className="px-6 py-16 sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Content</p>
          <h1 className="display-title font-display mt-2">Enquiries</h1>
          <p className="mb-6 mt-2 text-sm text-navy/50">
            Volunteer and campus ambassador applications and media accreditation requests.{" "}
            {items !== null && (waiting === 0 ? "All handled." : `${waiting} waiting.`)} Each one is also emailed to the
            marketing team.
          </p>

          <div className="mb-8 flex flex-wrap gap-2">
            {(["all", "volunteer", "campus_ambassador", "media"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={clsx(
                  "rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors duration-200 ease-smooth",
                  filter === f ? "bg-navy text-white" : "bg-navy/[0.05] text-navy/60 hover:bg-navy/10"
                )}
              >
                {f === "all" ? "All" : typeLabel[f]}
              </button>
            ))}
          </div>

          {error && (
            <p className="mb-4 text-sm text-red-500" role="alert">
              {error}
            </p>
          )}

          {items === null ? (
            <p className="text-navy/50">Loading…</p>
          ) : shown.length === 0 ? (
            <p className="text-navy/50">Nothing here yet.</p>
          ) : (
            <div className="border-t border-navy/10">
              {shown.map((item) => (
                <div key={item._id} className={clsx("border-b border-navy/10 py-5", !item.read && "bg-cyan/5")}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-navy">
                        {item.name}
                        <span className="ml-2 rounded-md bg-navy px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                          {typeLabel[item.type]}
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
                        {item.phone && (
                          <>
                            {" · "}
                            <a href={`tel:${item.phone}`} className="text-cyan hover:text-navy">
                              {item.phone}
                            </a>
                          </>
                        )}
                      </p>
                      <p className="mt-1 text-xs text-navy/40">
                        {new Date(item.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Lagos" })}
                        {" · "}
                        {item.emailed ? "Emailed to marketing" : "Not emailed (email not set up), follow up from here"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggle(item)}
                      disabled={updatingId === item._id}
                      className="text-sm font-semibold text-cyan transition-colors duration-200 ease-smooth hover:text-navy disabled:opacity-50"
                    >
                      {updatingId === item._id ? "Updating…" : item.read ? "Mark as waiting" : "Mark as handled"}
                    </button>
                  </div>
                  <dl className="mt-3 grid gap-x-8 gap-y-2 sm:grid-cols-2">
                    {Object.entries(item.details || {})
                      .filter(([, v]) => v)
                      .map(([k, v]) => (
                        <div key={k} className={k === "Message" ? "sm:col-span-2" : ""}>
                          <dt className="text-[11px] font-semibold uppercase tracking-wide text-navy/40">{k}</dt>
                          <dd className="mt-0.5 whitespace-pre-line text-sm leading-relaxed text-navy/80">{v}</dd>
                        </div>
                      ))}
                  </dl>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </AdminShell>
  );
}
