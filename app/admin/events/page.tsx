"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { adminFetch, revalidatePublicPaths } from "@/lib/adminApi";
import type { ClubEvent } from "@/lib/eventTypes";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<ClubEvent[] | null>(null);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function load() {
    adminFetch<ClubEvent[]>("/events")
      .then(setEvents)
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  async function handleDelete(id: string) {
    if (!confirm("Permanently delete this event? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await adminFetch(`/events/${id}`, { method: "DELETE" });
      await revalidatePublicPaths(["/events"]);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete event.");
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
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Content</p>
              <h1 className="display-title font-display mt-2">Events</h1>
            </div>
            <Link
              href="/admin/events/new"
              className="btn-glass btn-glass-yellow px-6 py-2.5 text-xs font-bold uppercase tracking-wide"
            >
              + Add event
            </Link>
          </div>

          {error && (
            <p className="mb-4 text-sm text-red-500" role="alert">
              {error}
            </p>
          )}

          {events === null ? (
            <p className="text-navy/50">Loading…</p>
          ) : events.length === 0 ? (
            <p className="text-navy/50">No events yet. Add the first one.</p>
          ) : (
            <div className="border-t border-navy/10">
              {events.map((ev) => (
                <div key={ev._id} className="flex items-center justify-between gap-4 border-b border-navy/10 py-4">
                  <div className="flex min-w-0 items-center gap-4">
                    {ev.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={ev.imageUrl} alt="" className="aspect-video w-28 shrink-0 rounded-lg bg-navy-dark object-cover" />
                    ) : (
                      <div className="aspect-video w-28 shrink-0 rounded-lg bg-navy/10" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-medium text-navy">{ev.name}</p>
                      <p className="text-xs uppercase tracking-wide text-navy/40">
                        {ev.eventDate ? new Date(ev.eventDate).toLocaleDateString("en-GB") : "No date"}
                        {ev.location ? ` · ${ev.location}` : ""} · {ev.isActive ? "Showing" : "Hidden"}{ev.showInHero ? " · In hero carousel" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    <Link
                      href={`/admin/events/${ev._id}`}
                      className="text-sm font-semibold text-cyan transition-colors duration-200 ease-smooth hover:text-navy"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(ev._id)}
                      disabled={deletingId === ev._id}
                      className="text-sm font-semibold text-navy/40 transition-colors duration-200 ease-smooth hover:text-red-500 disabled:opacity-50"
                    >
                      {deletingId === ev._id ? "Removing…" : "Remove"}
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
