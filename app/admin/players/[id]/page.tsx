"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import PlayerForm, { type PlayerFormValues } from "@/components/admin/PlayerForm";
import { adminFetch, revalidatePublicPaths } from "@/lib/adminApi";

type Player = PlayerFormValues & { _id: string };

export default function EditPlayerPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [player, setPlayer] = useState<Player | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetch<Player[]>("/players")
      .then((all) => {
        const found = all.find((p) => p._id === params.id);
        if (!found) {
          setError("Profile not found.");
          return;
        }
        setPlayer(found);
      })
      .catch((err) => setError(err.message));
  }, [params.id]);

  async function handleSave(values: PlayerFormValues) {
    setSaving(true);
    setError("");
    try {
      await adminFetch(`/players/${params.id}`, { method: "PUT", body: JSON.stringify(values) });
      await revalidatePublicPaths(["/team", "/team/coaching-staff", "/about", "/"]);
      router.push("/admin/players");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile.");
      setSaving(false);
    }
  }

  return (
    <AdminShell>
      {() => (
        <div className="px-6 py-16 sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Players &amp; Staff</p>
          <h1 className="display-title font-display mt-2 mb-10">Edit Profile</h1>
          {error && !player && (
            <p className="text-sm text-red-500" role="alert">
              {error}
            </p>
          )}
          {player && <PlayerForm initial={player} onSave={handleSave} saving={saving} error={error} />}
        </div>
      )}
    </AdminShell>
  );
}
