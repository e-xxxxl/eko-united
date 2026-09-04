"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import SponsorForm, { type SponsorFormValues } from "@/components/admin/SponsorForm";
import { adminFetch, revalidatePublicPaths } from "@/lib/adminApi";

export default function NewSponsorPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(values: SponsorFormValues) {
    setSaving(true);
    setError("");
    try {
      await adminFetch("/sponsors", { method: "POST", body: JSON.stringify(values) });
      await revalidatePublicPaths(["/sponsors", "/"]);
      router.push("/admin/sponsors");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create sponsor.");
      setSaving(false);
    }
  }

  return (
    <AdminShell>
      {() => (
        <div className="px-6 py-16 sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Sponsors</p>
          <h1 className="display-title font-display mt-2 mb-10">Add Sponsor</h1>
          <SponsorForm onSave={handleSave} saving={saving} error={error} />
        </div>
      )}
    </AdminShell>
  );
}
