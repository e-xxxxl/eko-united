// ---------------------------------------------------------------------------
// Shared type definitions for content shapes fetched from the backend.
//
// This file used to also hold placeholder/demo content and fallback helpers
// for every page to show something before real data existed. That's been
// removed now that the site is going live — every page reads live data only
// and shows its own genuine empty state when there's none yet. Kept as
// "Demo*" type names purely to avoid a mechanical rename across every file
// that imports them; there's no demo data behind them anymore.
// ---------------------------------------------------------------------------

export type DemoPlayer = {
  _id: string;
  name: string;
  slug: string;
  position?: string;
  squadNumber?: number;
  dateOfBirth?: string;
  nationality?: string;
  photoUrl?: string;
  bio?: string;
  stats?: { appearances?: number; goals?: number; assists?: number };
  role: "player" | "coach" | "technical_staff" | "management";
  title?: string;
};

export type DemoMatch = {
  _id: string;
  opponent: string;
  competition?: string;
  venue?: string;
  kickoff: string;
  isHome: boolean;
  status: "upcoming" | "live" | "finished" | "postponed";
  score?: { eko: number | null; opponent: number | null };
};

export type DemoStanding = {
  _id: string;
  clubName: string;
  clubLogoUrl?: string;
  isEkoUnited: boolean;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalDifference: number;
  points: number;
  position: number;
};

export type DemoNews = {
  _id: string;
  title: string;
  slug: string;
  body: string;
  coverImageUrl?: string;
  images?: string[]; // additional photos shown within the article, separate from the cover
  category: "article" | "match_report" | "press_release";
  author: string;
  publishedAt: string;
};

export type DemoGalleryItem = { _id: string; type: "photo" | "video"; url: string; caption?: string };

export type DemoSponsor = {
  _id: string;
  name: string;
  logoUrl: string;
  website?: string;
  tier: "principal" | "partner" | "supplier";
};

export type DemoTrophy = {
  _id: string;
  name: string;
  competition?: string;
  year: number;
  timesWon: number;
  description?: string;
  imageUrl?: string;
};

export type DemoMilestone = { _id: string; year: number; title: string; description?: string };

export type DemoProduct = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  category: "jersey" | "apparel" | "accessories" | "other";
  images: string[];
  sizes: string[];
  stock: number;
};

export type DemoTicketType = {
  _id: string;
  match: string;
  name: string;
  price: number;
  quantityAvailable: number;
  quantitySold: number;
};
