"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import HistoryForm, { type HistoryFormValues } from "@/components/admin/HistoryForm";
import { adminFetch, revalidatePublicPaths } from "@/lib/adminApi";

export default function NewHistoryPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(values: HistoryFormValues) {
    setSaving(true);
    setError("");
    try {
      await adminFetch("/history", { method: "POST", body: JSON.stringify(values) });
      await revalidatePublicPaths(["/club-history"]);
      router.push("/admin/history");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create milestone.");
      setSaving(false);
    }
  }

  return (
    <AdminShell>
      {() => (
        <div className="px-6 py-16 sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Club History</p>
          <h1 className="display-title font-display mt-2 mb-10">Add Milestone</h1>
          <HistoryForm onSave={handleSave} saving={saving} error={error} />
        </div>
      )}
    </AdminShell>
  );
}
