import { collageCard } from "@/lib/og/cards";
import { getPagePhotos } from "@/lib/pagePhotos";

export const alt = "Campus Ambassador | Eko United FC";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 600;

// The share card shows the photos that are on this page.
export default async function OpengraphImage() {
  const photos = await getPagePhotos("campus-ambassador");
  return collageCard("campusAmbassador", photos.map((url) => ({ url })));
}
