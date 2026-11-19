// Shrinks a photo in the staff member's browser before it is uploaded, so a 6 MB
// phone photo goes up as a few hundred KB instead. Cloudinary also caps size and
// quality on arrival (backend/src/routes/adminUpload.js); doing it here as well
// means less data over a slow connection and a smaller file stored from the start.
//
// - longest side capped at 2000px (the widest the site ever shows a photo)
// - re-encoded as WebP, which keeps transparency (logos) and is about a third
//   smaller than JPEG at the same look
// - the phone's rotation is applied, so portrait shots are not saved sideways
// - GIF and SVG are left alone (re-encoding would flatten the animation / vector)
// - if shrinking somehow makes the file bigger, the original is kept
const MAX_SIDE = 2000;
const QUALITY = 0.82;

export type CompressResult = { file: File; before: number; after: number };

export async function compressImage(file: File): Promise<CompressResult> {
  const unchanged = { file, before: file.size, after: file.size };
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") return unchanged;

  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return unchanged;
    }
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", QUALITY));
    // A browser that cannot write WebP hands back a PNG: not worth using.
    if (!blob || blob.type !== "image/webp") return unchanged;
    // Only keep the new file if it is a real saving (or the photo had to be made smaller anyway).
    if (blob.size >= file.size && scale === 1) return unchanged;

    const name = file.name.replace(/\.[^.]+$/, "") || "photo";
    return { file: new File([blob], `${name}.webp`, { type: "image/webp" }), before: file.size, after: blob.size };
  } catch {
    // Anything unexpected (a format the browser cannot decode, low memory):
    // upload the original and let Cloudinary shrink it.
    return unchanged;
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}
