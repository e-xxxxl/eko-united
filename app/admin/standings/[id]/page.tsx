"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import StandingForm, { type StandingFormValues } from "@/components/admin/StandingForm";
import { adminFetch, revalidatePublicPaths } from "@/lib/adminApi";

type Standing = StandingFormValues & { _id: string };

export default function EditStandingPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [standing, setStanding] = useState<Standing | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetch<Standing[]>("/standings")
      .then((all) => {
        const found = all.find((s) => s._id === params.id);
        if (!found) {
          setError("Standing not found.");
          return;
        }
        setStanding(found);
      })
      .catch((err) => setError(err.message));
  }, [params.id]);

  async function handleSave(values: StandingFormValues) {
    setSaving(true);
    setError("");
    try {
      await adminFetch(`/standings/${params.id}`, { method: "PUT", body: JSON.stringify(values) });
      await revalidatePublicPaths(["/table", "/"]);
      router.push("/admin/standings");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save standing.");
      setSaving(false);
    }
  }

  return (
    <AdminShell>
      {() => (
        <div className="px-6 py-16 sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">League Table</p>
          <h1 className="display-title font-display mt-2 mb-10">Edit Club</h1>
          {error && !standing && (
            <p className="text-sm text-red-500" role="alert">
              {error}
            </p>
          )}
          {standing && <StandingForm initial={standing} onSave={handleSave} saving={saving} error={error} />}
        </div>
      )}
    </AdminShell>
  );
}
