// Shapes returned by GET /api/membership/plans and the admin membership routes.
export type MembershipTier = {
  _id: string;
  slug: string;
  name: string;
  audience?: string;
  price: string;
  period?: string;
  tagline?: string;
  badge?: string;
  imageUrl?: string;
  perks: string[];
  displayOrder: number;
  isActive: boolean;
};

export type MembershipContent = {
  eyebrow?: string;
  title?: string;
  intro?: string;
  heroImageUrl?: string;
  galleryHeading?: string;
  gallery: { url: string; caption?: string }[];
};
