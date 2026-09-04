"use client";

import { useState, type FormEvent } from "react";
import CloudinaryUpload from "@/components/admin/CloudinaryUpload";
import { isAllowedImageUrl } from "@/lib/imageHosts";
import { slugify } from "@/lib/slugify";

export type ProductFormValues = {
  name: string;
  slug: string;
  description: string;
  price: number;
  category: "jersey" | "apparel" | "accessories" | "other";
  images: string[];
  sizes: string[];
  stock: number;
};

const fieldClass =
  "w-full border-b border-navy/20 bg-transparent px-1 py-3 text-sm text-navy outline-none transition-colors duration-200 ease-smooth placeholder:text-navy/30 focus:border-cyan";
const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-wide text-navy/50";
const MAX_IMAGES = 4;

export default function ProductForm({
  initial,
  onSave,
  saving,
  error,
}: {
  initial?: Partial<ProductFormValues>;
  onSave: (values: ProductFormValues) => void;
  saving: boolean;
  error: string;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [category, setCategory] = useState<ProductFormValues["category"]>(initial?.category || "jersey");
  const [images, setImages] = useState<string[]>(initial?.images?.length ? initial.images : [""]);
  const [sizesInput, setSizesInput] = useState((initial?.sizes || ["S", "M", "L", "XL"]).join(", "));

  const validImages = images.filter(Boolean);
  const badImage = validImages.some((url) => !isAllowedImageUrl(url));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (validImages.length === 0 || badImage) return;
    const data = new FormData(event.currentTarget);
    onSave({
      name,
      slug: slug || slugify(name),
      description: String(data.get("description") || ""),
      price: Number(data.get("price") || 0),
      category,
      images: validImages,
      sizes: sizesInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      stock: Number(data.get("stock") || 0),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
      <div>
        <label htmlFor="name" className={labelClass}>
          Product name
        </label>
        <input
          id="name"
          name="name"
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="slug" className={labelClass}>
          Slug (used in the product URL)
        </label>
        <input
          id="slug"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(slugify(e.target.value));
          }}
          required
          className={fieldClass}
        />
      </div>

      <div>
        <span className={labelClass}>Category</span>
        <div className="flex flex-wrap gap-2">
          {(["jersey", "apparel", "accessories", "other"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors duration-200 ease-smooth ${
                category === c
                  ? "border-cyan bg-cyan/10 text-navy"
                  : "border-navy/15 text-navy/50 hover:border-navy/30"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          Description (optional)
        </label>
        <textarea id="description" name="description" rows={3} defaultValue={initial?.description} className={fieldClass} />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <label htmlFor="price" className={labelClass}>
            Price (₦)
          </label>
          <input id="price" name="price" type="number" min={0} required defaultValue={initial?.price} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="stock" className={labelClass}>
            Stock
          </label>
          <input id="stock" name="stock" type="number" min={0} defaultValue={initial?.stock ?? 0} className={fieldClass} />
        </div>
      </div>

      <div>
        <label htmlFor="sizes" className={labelClass}>
          Sizes (comma-separated, leave blank for "one size")
        </label>
        <input
          id="sizes"
          value={sizesInput}
          onChange={(e) => setSizesInput(e.target.value)}
          placeholder="S, M, L, XL"
          className={fieldClass}
        />
      </div>

      <div>
        <span className={labelClass}>Photos (up to {MAX_IMAGES})</span>
        <div className="space-y-4">
          {images.map((url, i) => (
            <CloudinaryUpload
              key={i}
              value={url}
              onChange={(next) => setImages((prev) => prev.map((u, idx) => (idx === i ? next : u)))}
              folder="eko-united-fc/products"
            />
          ))}
        </div>
        {images.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => setImages((prev) => [...prev, ""])}
            className="mt-3 text-xs font-semibold uppercase tracking-wide text-cyan transition-colors duration-200 ease-smooth hover:text-navy"
          >
            + Add another photo
          </button>
        )}
        {validImages.length === 0 && (
          <p className="mt-2 text-xs text-red-500" role="alert">
            At least one photo is required.
          </p>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-yellow px-8 py-3 text-sm font-bold uppercase tracking-wide text-navy-dark transition-transform duration-300 ease-smooth hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
      >
        {saving ? "Saving…" : "Save product"}
      </button>
    </form>
  );
}
