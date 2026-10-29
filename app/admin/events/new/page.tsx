"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import EventForm, { type EventFormValues } from "@/components/admin/EventForm";
import { adminFetch, revalidatePublicPaths } from "@/lib/adminApi";

export default function NewEventPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(values: EventFormValues) {
    setSaving(true);
    setError("");
    try {
      await adminFetch("/events", { method: "POST", body: JSON.stringify(values) });
      await revalidatePublicPaths(["/events"]);
      router.push("/admin/events");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add event.");
      setSaving(false);
    }
  }

  return (
    <AdminShell>
      {() => (
        <div className="px-6 py-16 sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Events and CSR</p>
          <h1 className="display-title font-display mt-2 mb-10">Add Event</h1>
          <EventForm onSave={handleSave} saving={saving} error={error} />
        </div>
      )}
    </AdminShell>
  );
}
