"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import MembershipTierForm, { type TierFormValues } from "@/components/admin/MembershipTierForm";
import { adminFetch, revalidatePublicPaths } from "@/lib/adminApi";

export default function NewMembershipPackagePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(values: TierFormValues) {
    setSaving(true);
    setError("");
    try {
      await adminFetch("/membership/tiers", { method: "POST", body: JSON.stringify(values) });
      await revalidatePublicPaths(["/membership"]);
      router.push("/admin/membership/packages");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add package.");
      setSaving(false);
    }
  }

  return (
    <AdminShell>
      {() => (
        <div className="px-6 py-16 sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Membership</p>
          <h1 className="display-title font-display mt-2 mb-10">Add Package</h1>
          <MembershipTierForm onSave={handleSave} saving={saving} error={error} />
        </div>
      )}
    </AdminShell>
  );
}
