import { apiFetch } from "@/lib/api";
import { isAllowedImageUrl } from "@/lib/imageHosts";

// The pages that open with a photo collage, and what the admin sees for each
// one under Page photos.
export const PAGE_PHOTO_PAGES = [
  { key: "media-accreditation", label: "Media accreditation" },
  { key: "contact", label: "Contact" },
  { key: "careers", label: "Careers" },
  { key: "sponsors", label: "Sponsors" },
  { key: "trophies", label: "Trophy cabinet" },
  { key: "club-history", label: "Club history" },
  { key: "volunteer", label: "Volunteer" },
  { key: "campus-ambassador", label: "Campus ambassador" },
] as const;

export type PagePhotoKey = (typeof PAGE_PHOTO_PAGES)[number]["key"];

const u = (id: string) => `https://images.unsplash.com/${id}?w=1400&q=80&fit=crop&auto=format`;
const KICK = u("photo-1560272564-c83b66b1ad12"); // player mid-kick, tall
const STADIUM = u("photo-1522778119026-d647f0596c20"); // floodlit stadium
const BALL_FOOT = u("photo-1579952363873-27f3bade9f55"); // boot on a ball, tall
const LIGHTS = u("photo-1431324155629-1a6deb1dec8d"); // stadium lights
const CROWD = u("photo-1537228783107-df09e892bdbb"); // supporters
const BALLS = u("photo-1551958219-acbc608c6377"); // balls on turf
const TURF = u("photo-1574629810360-7efbbe195018"); // ball on grass

// Shown until the club uploads its own photos for a page in the admin panel.
// Generic football imagery, decoration only.
const DEFAULTS: Record<PagePhotoKey, string[]> = {
  "media-accreditation": [KICK, STADIUM, BALL_FOOT],
  contact: [BALL_FOOT, CROWD, BALLS],
  careers: [KICK, LIGHTS, TURF],
  sponsors: [LIGHTS, CROWD, BALLS],
  trophies: [BALL_FOOT, STADIUM, KICK],
  "club-history": [STADIUM, KICK, CROWD],
  volunteer: [CROWD, BALLS, KICK],
  "campus-ambassador": [CROWD, KICK, LIGHTS],
};

// The club's own photos for a page if it has set any, otherwise the defaults.
export async function getPagePhotos(key: PagePhotoKey): Promise<string[]> {
  const all = await apiFetch<Record<string, string[]>>("/page-photos", 600);
  const own = Array.isArray(all?.[key]) ? (all as Record<string, string[]>)[key].filter(isAllowedImageUrl) : [];
  return (own.length > 0 ? own : DEFAULTS[key]).slice(0, 3);
}
