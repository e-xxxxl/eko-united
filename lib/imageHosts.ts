// Single source of truth for which external image hosts are trusted —
// must stay in sync with next.config.js's `images.remotePatterns` (that
// file is CommonJS and can't import this, so keep the two lists matching
// by hand; there are only two entries, worth the small duplication rather
// than restructuring next.config.js's module format).
export const ALLOWED_IMAGE_HOSTS = ["res.cloudinary.com", "images.unsplash.com"];

// Local /public paths (start with "/") are always fine — no host to check.
export function isAllowedImageUrl(url: string | undefined | null): url is string {
  if (!url) return false;
  if (url.startsWith("/")) return true;
  try {
    return ALLOWED_IMAGE_HOSTS.includes(new URL(url).hostname);
  } catch {
    return false;
  }
}
