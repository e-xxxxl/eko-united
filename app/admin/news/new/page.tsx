"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import NewsForm, { type NewsFormValues } from "@/components/admin/NewsForm";
import { adminFetch, revalidatePublicPaths } from "@/lib/adminApi";

export default function NewArticlePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(values: NewsFormValues) {
    setSaving(true);
    setError("");
    try {
      await adminFetch("/news", { method: "POST", body: JSON.stringify(values) });
      await revalidatePublicPaths(["/news", "/"]);
      router.push("/admin/news");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create article.");
      setSaving(false);
    }
  }

  return (
    <AdminShell>
      {() => (
        <div className="px-6 py-16 sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">News</p>
          <h1 className="display-title font-display mt-2 mb-10">Add Article</h1>
          <NewsForm onSave={handleSave} saving={saving} error={error} />
        </div>
      )}
    </AdminShell>
  );
}
