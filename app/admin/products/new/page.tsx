"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import ProductForm, { type ProductFormValues } from "@/components/admin/ProductForm";
import { adminFetch, revalidatePublicPaths } from "@/lib/adminApi";

export default function NewProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(values: ProductFormValues) {
    setSaving(true);
    setError("");
    try {
      await adminFetch("/products", { method: "POST", body: JSON.stringify(values) });
      await revalidatePublicPaths(["/shop", "/"]);
      router.push("/admin/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product.");
      setSaving(false);
    }
  }

  return (
    <AdminShell>
      {() => (
        <div className="px-6 py-16 sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Shop</p>
          <h1 className="display-title font-display mt-2 mb-10">Add Product</h1>
          <ProductForm onSave={handleSave} saving={saving} error={error} />
        </div>
      )}
    </AdminShell>
  );
}
