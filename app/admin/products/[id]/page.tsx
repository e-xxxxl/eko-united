"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import ProductForm, { type ProductFormValues } from "@/components/admin/ProductForm";
import { adminFetch, revalidatePublicPaths } from "@/lib/adminApi";

type Product = ProductFormValues & { _id: string };

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetch<Product[]>("/products")
      .then((all) => {
        const found = all.find((p) => p._id === params.id);
        if (!found) {
          setError("Product not found.");
          return;
        }
        setProduct(found);
      })
      .catch((err) => setError(err.message));
  }, [params.id]);

  async function handleSave(values: ProductFormValues) {
    setSaving(true);
    setError("");
    try {
      await adminFetch(`/products/${params.id}`, { method: "PUT", body: JSON.stringify(values) });
      await revalidatePublicPaths(["/shop", "/"]);
      router.push("/admin/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product.");
      setSaving(false);
    }
  }

  return (
    <AdminShell>
      {() => (
        <div className="px-6 py-16 sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Shop</p>
          <h1 className="display-title font-display mt-2 mb-10">Edit Product</h1>
          {error && !product && (
            <p className="text-sm text-red-500" role="alert">
              {error}
            </p>
          )}
          {product && <ProductForm initial={product} onSave={handleSave} saving={saving} error={error} />}
        </div>
      )}
    </AdminShell>
  );
}
