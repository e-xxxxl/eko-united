"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import TicketTypeForm, { type TicketTypeFormValues, type MatchOption } from "@/components/admin/TicketTypeForm";
import { adminFetch, revalidatePublicPaths } from "@/lib/adminApi";

type TicketType = TicketTypeFormValues & { _id: string };

export default function EditTicketTypePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [ticketType, setTicketType] = useState<TicketType | null>(null);
  const [matches, setMatches] = useState<MatchOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetch<MatchOption[]>("/matches").then(setMatches).catch(() => setMatches([]));
    adminFetch<TicketType[]>("/ticket-types")
      .then((all) => {
        const found = all.find((t) => t._id === params.id);
        if (!found) {
          setError("Ticket type not found.");
          return;
        }
        setTicketType({ ...found, match: typeof found.match === "string" ? found.match : (found.match as unknown as { _id: string })._id });
      })
      .catch((err) => setError(err.message));
  }, [params.id]);

  async function handleSave(values: TicketTypeFormValues) {
    setSaving(true);
    setError("");
    try {
      await adminFetch(`/ticket-types/${params.id}`, { method: "PUT", body: JSON.stringify(values) });
      await revalidatePublicPaths(["/tickets"]);
      router.push("/admin/ticket-types");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save ticket type.");
      setSaving(false);
    }
  }

  return (
    <AdminShell>
      {() => (
        <div className="px-6 py-16 sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Tickets</p>
          <h1 className="display-title font-display mt-2 mb-10">Edit Ticket Type</h1>
          {error && !ticketType && (
            <p className="text-sm text-red-500" role="alert">
              {error}
            </p>
          )}
          {ticketType && (
            <TicketTypeForm initial={ticketType} matches={matches} onSave={handleSave} saving={saving} error={error} />
          )}
        </div>
      )}
    </AdminShell>
  );
}
