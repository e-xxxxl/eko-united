"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import PlayerForm, { type PlayerFormValues } from "@/components/admin/PlayerForm";
import { adminFetch, revalidatePublicPaths } from "@/lib/adminApi";

export default function NewPlayerPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(values: PlayerFormValues) {
    setSaving(true);
    setError("");
    try {
      await adminFetch("/players", { method: "POST", body: JSON.stringify(values) });
      await revalidatePublicPaths(["/team", "/team/coaching-staff", "/about", "/"]);
      router.push("/admin/players");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create profile.");
      setSaving(false);
    }
  }

  return (
    <AdminShell>
      {() => (
        <div className="px-6 py-16 sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Players &amp; Staff</p>
          <h1 className="display-title font-display mt-2 mb-10">Add Profile</h1>
          <PlayerForm onSave={handleSave} saving={saving} error={error} />
        </div>
      )}
    </AdminShell>
  );
}
