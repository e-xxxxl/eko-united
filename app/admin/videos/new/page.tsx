"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import VideoForm, { type VideoFormValues } from "@/components/admin/VideoForm";
import { adminFetch, revalidatePublicPaths } from "@/lib/adminApi";

export default function NewVideoPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(values: VideoFormValues) {
    setSaving(true);
    setError("");
    try {
      await adminFetch("/videos", { method: "POST", body: JSON.stringify(values) });
      await revalidatePublicPaths(["/videos"]);
      router.push("/admin/videos");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add video.");
      setSaving(false);
    }
  }

  return (
    <AdminShell>
      {() => (
        <div className="px-6 py-16 sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Videos</p>
          <h1 className="display-title font-display mt-2 mb-10">Add Video</h1>
          <VideoForm onSave={handleSave} saving={saving} error={error} />
        </div>
      )}
    </AdminShell>
  );
}
