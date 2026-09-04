import Image, { type ImageProps } from "next/image";
import { isAllowedImageUrl } from "@/lib/imageHosts";

// Defensive wrapper around next/image for any URL that ultimately came from
// an admin-entered field (sponsor/trophy/player logos & photos, etc.).
// next/image correctly throws — a hard render crash — for any host not
// explicitly allowlisted in next.config.js; that's the right behavior for
// the app in general, but it means one bad pasted URL (a Google Images
// thumbnail, a random blog host) can take down an entire public page for
// every visitor. This checks the host first and renders nothing (falling
// through to whatever placeholder the caller already has) instead of
// crashing. Validation on the way in (CloudinaryUpload's URL field) is the
// first line of defense — this is the second, for anything that slips
// through or was saved before that validation existed.
export default function SafeImage(props: ImageProps) {
  const src = typeof props.src === "string" ? props.src : undefined;
  if (!isAllowedImageUrl(src)) return null;
  return <Image {...props} />;
}
