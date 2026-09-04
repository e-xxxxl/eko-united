"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import GalleryForm, { type GalleryFormValues } from "@/components/admin/GalleryForm";
import { adminFetch, revalidatePublicPaths } from "@/lib/adminApi";

type GalleryItem = GalleryFormValues & { _id: string };

export default function EditGalleryItemPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [item, setItem] = useState<GalleryItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetch<GalleryItem[]>("/gallery")
      .then((all) => {
        const found = all.find((g) => g._id === params.id);
        if (!found) {
          setError("Gallery item not found.");
          return;
        }
        setItem(found);
      })
      .catch((err) => setError(err.message));
  }, [params.id]);

  async function handleSave(values: GalleryFormValues) {
    setSaving(true);
    setError("");
    try {
      await adminFetch(`/gallery/${params.id}`, { method: "PUT", body: JSON.stringify(values) });
      await revalidatePublicPaths(["/gallery"]);
      router.push("/admin/gallery");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save gallery item.");
      setSaving(false);
    }
  }

  return (
    <AdminShell>
      {() => (
        <div className="px-6 py-16 sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Gallery</p>
          <h1 className="display-title font-display mt-2 mb-10">Edit Gallery Item</h1>
          {error && !item && (
            <p className="text-sm text-red-500" role="alert">
              {error}
            </p>
          )}
          {item && <GalleryForm initial={item} onSave={handleSave} saving={saving} error={error} />}
        </div>
      )}
    </AdminShell>
  );
}
