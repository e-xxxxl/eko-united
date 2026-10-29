"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import EventForm, { type EventFormValues } from "@/components/admin/EventForm";
import { adminFetch, revalidatePublicPaths } from "@/lib/adminApi";
import type { ClubEvent } from "@/lib/eventTypes";

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [event, setEvent] = useState<ClubEvent | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetch<ClubEvent[]>("/events")
      .then((all) => {
        const found = all.find((e) => e._id === params.id);
        if (!found) {
          setError("Event not found.");
          return;
        }
        setEvent(found);
      })
      .catch((err) => setError(err.message));
  }, [params.id]);

  async function handleSave(values: EventFormValues) {
    setSaving(true);
    setError("");
    try {
      await adminFetch(`/events/${params.id}`, { method: "PUT", body: JSON.stringify(values) });
      await revalidatePublicPaths(["/events", `/events/${values.slug}`]);
      router.push("/admin/events");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save event.");
      setSaving(false);
    }
  }

  return (
    <AdminShell>
      {() => (
        <div className="px-6 py-16 sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Events and CSR</p>
          <h1 className="display-title font-display mt-2 mb-10">Edit Event</h1>
          {error && !event && (
            <p className="text-sm text-red-500" role="alert">
              {error}
            </p>
          )}
          {event && (
            <EventForm
              initial={{ ...event, description: event.description || "", location: event.location || "", imageUrl: event.imageUrl || "" }}
              onSave={handleSave}
              saving={saving}
              error={error}
            />
          )}
        </div>
      )}
    </AdminShell>
  );
}
