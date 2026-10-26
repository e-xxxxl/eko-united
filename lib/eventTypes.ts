export type ClubEvent = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  eventDate?: string | null;
  location?: string;
  imageUrl?: string;
  images: string[];
  isActive: boolean;
};

export function formatEventDate(iso?: string | null, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { ...opts, timeZone: "Africa/Lagos" });
}
