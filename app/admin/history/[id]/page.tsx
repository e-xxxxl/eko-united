"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import HistoryForm, { type HistoryFormValues } from "@/components/admin/HistoryForm";
import { adminFetch, revalidatePublicPaths } from "@/lib/adminApi";

type HistoryMilestone = HistoryFormValues & { _id: string };

export default function EditHistoryPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [milestone, setMilestone] = useState<HistoryMilestone | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetch<HistoryMilestone[]>("/history")
      .then((all) => {
        const found = all.find((m) => m._id === params.id);
        if (!found) {
          setError("Milestone not found.");
          return;
        }
        setMilestone(found);
      })
      .catch((err) => setError(err.message));
  }, [params.id]);

  async function handleSave(values: HistoryFormValues) {
    setSaving(true);
    setError("");
    try {
      await adminFetch(`/history/${params.id}`, { method: "PUT", body: JSON.stringify(values) });
      await revalidatePublicPaths(["/club-history"]);
      router.push("/admin/history");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save milestone.");
      setSaving(false);
    }
  }

  return (
    <AdminShell>
      {() => (
        <div className="px-6 py-16 sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Club History</p>
          <h1 className="display-title font-display mt-2 mb-10">Edit Milestone</h1>
          {error && !milestone && (
            <p className="text-sm text-red-500" role="alert">
              {error}
            </p>
          )}
          {milestone && <HistoryForm initial={milestone} onSave={handleSave} saving={saving} error={error} />}
        </div>
      )}
    </AdminShell>
  );
}
