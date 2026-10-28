export type MediaItem = {
  publicId: string;
  url: string;
  bytes: number;
  width: number;
  height: number;
  format: string;
  createdAt: string;
  folder: string;
  usedBy: string[];
};

export type MediaPage = { items: MediaItem[]; nextCursor: string | null };

export function formatBytes(n: number) {
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(n / 1024))} KB`;
}

// A small version of a Cloudinary photo for the library grid, so the grid does
// not download dozens of full-size originals.
export function thumbUrl(url: string, width = 360) {
  return url.includes("/upload/") ? url.replace("/upload/", `/upload/c_limit,w_${width},q_auto,f_auto/`) : url;
}
