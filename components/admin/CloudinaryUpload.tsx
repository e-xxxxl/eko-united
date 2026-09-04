"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { adminFetch } from "@/lib/adminApi";
import { isAllowedImageUrl, ALLOWED_IMAGE_HOSTS } from "@/lib/imageHosts";

type SignatureResponse = {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
};

// Direct-to-Cloudinary upload, matching the signed-upload flow already built
// on the backend (backend/src/routes/adminUpload.js): request a short-lived
// signature from our own server, then POST the file straight to Cloudinary
// — the image bytes never touch our backend. Falls back gracefully to
// letting the admin just paste a URL (the `value`/`onChange` props still
// work as a plain text field either way).
export default function CloudinaryUpload({
  value,
  onChange,
  folder,
}: {
  value: string;
  onChange: (url: string) => void;
  folder: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError("");
    try {
      const sig = await adminFetch<SignatureResponse>("/upload/signature", {
        method: "POST",
        body: JSON.stringify({ folder }),
      });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("timestamp", String(sig.timestamp));
      formData.append("folder", sig.folder);
      formData.append("api_key", sig.apiKey);
      formData.append("signature", sig.signature);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error?.message || "Upload failed.");

      onChange(body.secure_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-24 shrink-0 items-center justify-center border border-navy/10 bg-white">
          {value ? (
            <Image
              src={value}
              alt=""
              width={96}
              height={64}
              className="max-h-full w-auto object-contain"
              unoptimized
            />
          ) : (
            <span className="text-[10px] uppercase tracking-wide text-navy/30">No image</span>
          )}
        </div>

        <div className="flex-1">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-full border border-navy/20 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-navy transition-colors duration-200 ease-smooth hover:border-navy disabled:opacity-60"
          >
            {uploading ? "Uploading…" : value ? "Replace image" : "Upload image"}
          </button>
          {error && (
            <p className="mt-2 text-xs text-red-500" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>

      <label className="mt-3 block text-xs text-navy/40">
        or paste an image URL directly
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://res.cloudinary.com/..."
          className="mt-1 w-full border-b border-navy/20 bg-transparent px-1 py-2 text-sm text-navy outline-none transition-colors duration-200 ease-smooth placeholder:text-navy/30 focus:border-cyan"
        />
      </label>
      {value && !isAllowedImageUrl(value) && (
        <p className="mt-2 text-xs text-red-500" role="alert">
          This won't display on the site — only {ALLOWED_IMAGE_HOSTS.join(" and ")} links work
          (a Google Images link, for example, won't). Upload the image instead, or paste a link
          from one of those.
        </p>
      )}
    </div>
  );
}
