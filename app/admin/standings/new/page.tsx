"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import StandingForm, { type StandingFormValues } from "@/components/admin/StandingForm";
import { adminFetch, revalidatePublicPaths } from "@/lib/adminApi";

export default function NewStandingPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(values: StandingFormValues) {
    setSaving(true);
    setError("");
    try {
      await adminFetch("/standings", { method: "POST", body: JSON.stringify(values) });
      await revalidatePublicPaths(["/table", "/"]);
      router.push("/admin/standings");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create standing.");
      setSaving(false);
    }
  }

  return (
    <AdminShell>
      {() => (
        <div className="px-6 py-16 sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">League Table</p>
          <h1 className="display-title font-display mt-2 mb-10">Add Club</h1>
          <StandingForm onSave={handleSave} saving={saving} error={error} />
        </div>
      )}
    </AdminShell>
  );
}
