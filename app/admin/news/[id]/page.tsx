"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import NewsForm, { type NewsFormValues } from "@/components/admin/NewsForm";
import { adminFetch, revalidatePublicPaths } from "@/lib/adminApi";

type Article = NewsFormValues & { _id: string };

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetch<Article[]>("/news")
      .then((all) => {
        const found = all.find((a) => a._id === params.id);
        if (!found) {
          setError("Article not found.");
          return;
        }
        setArticle(found);
      })
      .catch((err) => setError(err.message));
  }, [params.id]);

  async function handleSave(values: NewsFormValues) {
    setSaving(true);
    setError("");
    try {
      await adminFetch(`/news/${params.id}`, { method: "PUT", body: JSON.stringify(values) });
      await revalidatePublicPaths(["/news", "/"]);
      router.push("/admin/news");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save article.");
      setSaving(false);
    }
  }

  return (
    <AdminShell>
      {() => (
        <div className="px-6 py-16 sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">News</p>
          <h1 className="display-title font-display mt-2 mb-10">Edit Article</h1>
          {error && !article && (
            <p className="text-sm text-red-500" role="alert">
              {error}
            </p>
          )}
          {article && <NewsForm initial={article} onSave={handleSave} saving={saving} error={error} />}
        </div>
      )}
    </AdminShell>
  );
}
