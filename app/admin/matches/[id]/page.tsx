"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import MatchForm, { type MatchFormValues } from "@/components/admin/MatchForm";
import { adminFetch, revalidatePublicPaths } from "@/lib/adminApi";

type Match = MatchFormValues & { _id: string };

export default function EditMatchPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [match, setMatch] = useState<Match | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetch<Match>(`/matches/${params.id}`)
      .then(setMatch)
      .catch((err) => setError(err.message));
  }, [params.id]);

  async function handleSave(values: MatchFormValues) {
    setSaving(true);
    setError("");
    try {
      await adminFetch(`/matches/${params.id}`, { method: "PUT", body: JSON.stringify(values) });
      await revalidatePublicPaths(["/fixtures", "/results", "/"]);
      router.push("/admin/matches");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save match.");
      setSaving(false);
    }
  }

  return (
    <AdminShell>
      {() => (
        <div className="px-6 py-16 sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Fixtures &amp; Results</p>
          <h1 className="display-title font-display mt-2 mb-10">Edit Match</h1>
          {error && !match && (
            <p className="text-sm text-red-500" role="alert">
              {error}
            </p>
          )}
          {match && <MatchForm initial={match} onSave={handleSave} saving={saving} error={error} />}
        </div>
      )}
    </AdminShell>
  );
}
