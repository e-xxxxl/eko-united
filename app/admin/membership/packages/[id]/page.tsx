"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import MembershipTierForm, { type TierFormValues } from "@/components/admin/MembershipTierForm";
import { adminFetch, revalidatePublicPaths } from "@/lib/adminApi";
import type { MembershipTier } from "@/lib/membershipTypes";

export default function EditMembershipPackagePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [tier, setTier] = useState<MembershipTier | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetch<MembershipTier[]>("/membership/tiers")
      .then((all) => {
        const found = all.find((t) => t._id === params.id);
        if (!found) {
          setError("Package not found.");
          return;
        }
        setTier(found);
      })
      .catch((err) => setError(err.message));
  }, [params.id]);

  async function handleSave(values: TierFormValues) {
    setSaving(true);
    setError("");
    try {
      await adminFetch(`/membership/tiers/${params.id}`, { method: "PUT", body: JSON.stringify(values) });
      await revalidatePublicPaths(["/membership"]);
      router.push("/admin/membership/packages");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save package.");
      setSaving(false);
    }
  }

  return (
    <AdminShell>
      {() => (
        <div className="px-6 py-16 sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Membership</p>
          <h1 className="display-title font-display mt-2 mb-10">Edit Package</h1>
          {error && !tier && (
            <p className="text-sm text-red-500" role="alert">
              {error}
            </p>
          )}
          {tier && <MembershipTierForm initial={tier} onSave={handleSave} saving={saving} error={error} />}
        </div>
      )}
    </AdminShell>
  );
}
