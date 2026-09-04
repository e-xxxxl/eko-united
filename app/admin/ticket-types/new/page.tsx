"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import TicketTypeForm, { type TicketTypeFormValues, type MatchOption } from "@/components/admin/TicketTypeForm";
import { adminFetch, revalidatePublicPaths } from "@/lib/adminApi";

export default function NewTicketTypePage() {
  const router = useRouter();
  const [matches, setMatches] = useState<MatchOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetch<MatchOption[]>("/matches").then(setMatches).catch(() => setMatches([]));
  }, []);

  async function handleSave(values: TicketTypeFormValues) {
    setSaving(true);
    setError("");
    try {
      await adminFetch("/ticket-types", { method: "POST", body: JSON.stringify(values) });
      await revalidatePublicPaths(["/tickets"]);
      router.push("/admin/ticket-types");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create ticket type.");
      setSaving(false);
    }
  }

  return (
    <AdminShell>
      {() => (
        <div className="px-6 py-16 sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Tickets</p>
          <h1 className="display-title font-display mt-2 mb-10">Add Ticket Type</h1>
          <TicketTypeForm matches={matches} onSave={handleSave} saving={saving} error={error} />
        </div>
      )}
    </AdminShell>
  );
}
