"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import SponsorForm, { type SponsorFormValues } from "@/components/admin/SponsorForm";
import { adminFetch, revalidatePublicPaths } from "@/lib/adminApi";

type Sponsor = SponsorFormValues & { _id: string };

export default function EditSponsorPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [sponsor, setSponsor] = useState<Sponsor | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // No GET /admin/sponsors/:id on the backend — list is small enough to
    // fetch and find client-side rather than adding a single-item route
    // just for this form.
    adminFetch<Sponsor[]>("/sponsors")
      .then((all) => {
        const found = all.find((s) => s._id === params.id);
        if (!found) {
          setError("Sponsor not found.");
          return;
        }
        setSponsor(found);
      })
      .catch((err) => setError(err.message));
  }, [params.id]);

  async function handleSave(values: SponsorFormValues) {
    setSaving(true);
    setError("");
    try {
      await adminFetch(`/sponsors/${params.id}`, { method: "PUT", body: JSON.stringify(values) });
      await revalidatePublicPaths(["/sponsors", "/"]);
      router.push("/admin/sponsors");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save sponsor.");
      setSaving(false);
    }
  }

  return (
    <AdminShell>
      {() => (
        <div className="px-6 py-16 sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Sponsors</p>
          <h1 className="display-title font-display mt-2 mb-10">Edit Sponsor</h1>
          {error && !sponsor && (
            <p className="text-sm text-red-500" role="alert">
              {error}
            </p>
          )}
          {sponsor && <SponsorForm initial={sponsor} onSave={handleSave} saving={saving} error={error} />}
        </div>
      )}
    </AdminShell>
  );
}
