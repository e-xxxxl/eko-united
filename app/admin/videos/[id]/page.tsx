"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import VideoForm, { type VideoFormValues } from "@/components/admin/VideoForm";
import { adminFetch, revalidatePublicPaths } from "@/lib/adminApi";

type Video = VideoFormValues & { _id: string };

export default function EditVideoPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [video, setVideo] = useState<Video | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetch<Video[]>("/videos")
      .then((all) => {
        const found = all.find((v) => v._id === params.id);
        if (!found) {
          setError("Video not found.");
          return;
        }
        setVideo(found);
      })
      .catch((err) => setError(err.message));
  }, [params.id]);

  async function handleSave(values: VideoFormValues) {
    setSaving(true);
    setError("");
    try {
      await adminFetch(`/videos/${params.id}`, { method: "PUT", body: JSON.stringify(values) });
      await revalidatePublicPaths(["/videos"]);
      router.push("/admin/videos");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save video.");
      setSaving(false);
    }
  }

  return (
    <AdminShell>
      {() => (
        <div className="px-6 py-16 sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Videos</p>
          <h1 className="display-title font-display mt-2 mb-10">Edit Video</h1>
          {error && !video && (
            <p className="text-sm text-red-500" role="alert">
              {error}
            </p>
          )}
          {video && <VideoForm initial={video} onSave={handleSave} saving={saving} error={error} />}
        </div>
      )}
    </AdminShell>
  );
}
