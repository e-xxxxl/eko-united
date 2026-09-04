"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import GalleryForm, { type GalleryFormValues } from "@/components/admin/GalleryForm";
import { adminFetch, revalidatePublicPaths } from "@/lib/adminApi";

export default function NewGalleryItemPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(values: GalleryFormValues) {
    setSaving(true);
    setError("");
    try {
      await adminFetch("/gallery", { method: "POST", body: JSON.stringify(values) });
      await revalidatePublicPaths(["/gallery"]);
      router.push("/admin/gallery");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create gallery item.");
      setSaving(false);
    }
  }

  return (
    <AdminShell>
      {() => (
        <div className="px-6 py-16 sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Gallery</p>
          <h1 className="display-title font-display mt-2 mb-10">Add Gallery Item</h1>
          <GalleryForm onSave={handleSave} saving={saving} error={error} />
        </div>
      )}
    </AdminShell>
  );
}
