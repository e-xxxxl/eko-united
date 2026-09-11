"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { adminFetch, revalidatePublicPaths } from "@/lib/adminApi";
import { formatNaira } from "@/lib/format";

type Product = {
  _id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  isActive: boolean;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function load() {
    adminFetch<Product[]>("/products")
      .then(setProducts)
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  async function handleDelete(id: string) {
    if (!confirm("Permanently delete this product? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await adminFetch(`/products/${id}`, { method: "DELETE" });
      await revalidatePublicPaths(["/shop", "/"]);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AdminShell>
      {() => (
        <div className="px-6 py-16 sm:px-10">
          <div className="mb-8 flex items-baseline justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Shop</p>
              <h1 className="display-title font-display mt-2">Products</h1>
            </div>
            <Link
              href="/admin/products/new"
              className="rounded-full bg-yellow px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-navy-dark transition-transform duration-300 ease-smooth hover:scale-105"
            >
              + Add product
            </Link>
          </div>

          {error && (
            <p className="mb-4 text-sm text-red-500" role="alert">
              {error}
            </p>
          )}

          {products === null ? (
            <p className="text-navy/50">Loading…</p>
          ) : products.length === 0 ? (
            <p className="text-navy/50">No products yet — add the first one.</p>
          ) : (
            <div className="border-t border-navy/10">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between gap-4 border-b border-navy/10 py-4"
                >
                  <div>
                    <p className="font-medium text-navy">{product.name}</p>
                    <p className="text-xs uppercase tracking-wide text-navy/40">
                      {product.category} · {formatNaira(product.price)} · {product.stock} in stock ·{" "}
                      {product.isActive ? "Active" : "Hidden"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Link
                      href={`/admin/products/${product._id}`}
                      className="text-sm font-semibold text-cyan transition-colors duration-200 ease-smooth hover:text-navy"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(product._id)}
                      disabled={deletingId === product._id}
                      className="text-sm font-semibold text-navy/40 transition-colors duration-200 ease-smooth hover:text-red-500 disabled:opacity-50"
                    >
                      {deletingId === product._id ? "Removing…" : "Remove"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </AdminShell>
  );
}
