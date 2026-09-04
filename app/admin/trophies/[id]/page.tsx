"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import TrophyForm, { type TrophyFormValues } from "@/components/admin/TrophyForm";
import { adminFetch, revalidatePublicPaths } from "@/lib/adminApi";

type Trophy = TrophyFormValues & { _id: string };

export default function EditTrophyPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [trophy, setTrophy] = useState<Trophy | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetch<Trophy[]>("/trophies")
      .then((all) => {
        const found = all.find((t) => t._id === params.id);
        if (!found) {
          setError("Trophy not found.");
          return;
        }
        setTrophy(found);
      })
      .catch((err) => setError(err.message));
  }, [params.id]);

  async function handleSave(values: TrophyFormValues) {
    setSaving(true);
    setError("");
    try {
      await adminFetch(`/trophies/${params.id}`, { method: "PUT", body: JSON.stringify(values) });
      await revalidatePublicPaths(["/trophies"]);
      router.push("/admin/trophies");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save trophy.");
      setSaving(false);
    }
  }

  return (
    <AdminShell>
      {() => (
        <div className="px-6 py-16 sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Trophies</p>
          <h1 className="display-title font-display mt-2 mb-10">Edit Trophy</h1>
          {error && !trophy && (
            <p className="text-sm text-red-500" role="alert">
              {error}
            </p>
          )}
          {trophy && <TrophyForm initial={trophy} onSave={handleSave} saving={saving} error={error} />}
        </div>
      )}
    </AdminShell>
  );
}
