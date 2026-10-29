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
  showInHero?: boolean;
  isCsr?: boolean; // a Community Social Responsibility activity
};

export const CSR_LABEL = "Community Social Responsibility";

export function formatEventDate(iso?: string | null, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { ...opts, timeZone: "Africa/Lagos" });
}
