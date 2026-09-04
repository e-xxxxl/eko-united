"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import TrophyForm, { type TrophyFormValues } from "@/components/admin/TrophyForm";
import { adminFetch, revalidatePublicPaths } from "@/lib/adminApi";

export default function NewTrophyPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(values: TrophyFormValues) {
    setSaving(true);
    setError("");
    try {
      await adminFetch("/trophies", { method: "POST", body: JSON.stringify(values) });
      await revalidatePublicPaths(["/trophies"]);
      router.push("/admin/trophies");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create trophy.");
      setSaving(false);
    }
  }

  return (
    <AdminShell>
      {() => (
        <div className="px-6 py-16 sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Trophies</p>
          <h1 className="display-title font-display mt-2 mb-10">Add Trophy</h1>
          <TrophyForm onSave={handleSave} saving={saving} error={error} />
        </div>
      )}
    </AdminShell>
  );
}
