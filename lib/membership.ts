// The club's official membership and sponsorship tiers, from the club's
// "Official Membership & Sponsorship Tier Framework". The ids match the
// backend's MEMBERSHIP_TIERS (models/MembershipApplication.js).
export type TierId = "platinum_corporate" | "platinum_member" | "diamond_member" | "gold_member";

export type Tier = {
  id: TierId;
  name: string;
  audience: string;
  price: string;
  period?: string;
  perks: string[];
};

export const tiers: Tier[] = [
  {
    id: "platinum_corporate",
    name: "Platinum Corporate",
    audience: "For companies and brands",
    price: "₦10,000,000",
    perks: [
      "A dedicated private executive suite on matchdays, with guest tickets included",
      "Your company logo placed prominently across official club assets",
      "Strategic corporate logo display on the club's official website",
      "Rights to sponsor and brand matchday halftime entertainment and shows",
      "Exclusive Adopt a Club CSR partnership with a club Community Social Responsibility project",
      "Adopt-a-Talent Initiative: directly fund youth development, elite gear, player education and athlete welfare through a transparent framework",
      "Customised corporate jerseys and official club merchandise",
      "High-level B2B events and networking",
    ],
  },
  {
    id: "platinum_member",
    name: "Platinum Member",
    audience: "For individuals",
    price: "₦5,000,000",
    perks: [
      "An exclusive private executive suite for home matchdays",
      "5 extra matchday tickets in the same private suite",
      "3 official jerseys (Home, Away and Third) plus official club merchandise",
      "Invitations to official club events, B2B networking sessions and an exclusive training ground experience with players and staff",
      "Founding Members status: eternalised in club history, with recognition on the official club website",
      "Platinum Founders Circle: a numbered membership card and permanent recognition on the club's Founders Wall",
      "20% off all official merchandise and a subscription to the official club newsletter",
    ],
  },
  {
    id: "diamond_member",
    name: "Diamond Member",
    audience: "For individuals",
    price: "₦2,000,000",
    period: "per year",
    perks: [
      "Matchday seating in a shared private suite, with full matchday refreshments",
      "2 extra tickets in the shared suite for your guests",
      "2 official club jerseys (Home and Away) plus official club merchandise",
      "Invitations to official club events and networking forums",
      "10% off official merchandise and a subscription to the official club newsletter",
    ],
  },
  {
    id: "gold_member",
    name: "Gold Member",
    audience: "For individuals",
    price: "₦500,000",
    period: "per year",
    perks: [
      "Entry to the shared executive suite on home matchdays",
      "1 official club jersey of your choice",
      "Selected official club merchandise",
      "A subscription to the official club newsletter",
    ],
  },
];

// Side-by-side comparison, one row per benefit, one value per tier in the
// same order as `tiers` above. null means the tier does not include it.
export const comparison: { feature: string; values: (string | null)[] }[] = [
  { feature: "Matchday suite", values: ["Dedicated private executive suite", "Private executive suite", "Shared private suite", "Shared executive suite"] },
  { feature: "Extra guest tickets", values: ["Included", "5 extra tickets", "2 extra tickets", null] },
  { feature: "Official jerseys", values: ["Customised corporate", "3 (Home, Away, Third)", "2 (Home and Away)", "1 of your choice"] },
  { feature: "Club merchandise", values: ["Yes", "Yes", "Yes", "Selected items"] },
  { feature: "Merchandise discount", values: [null, "20% off", "10% off", null] },
  { feature: "Events and networking", values: ["High-level B2B", "Official events and networking", "Official events and networking", null] },
  { feature: "Training ground experience", values: [null, "Exclusive visit with players and staff", null, null] },
  { feature: "Recognition", values: ["Logo on club website", "Founders Wall and numbered card", null, null] },
  { feature: "CSR and youth impact", values: ["Adopt a Club CSR and Adopt-a-Talent", null, null, null] },
  { feature: "Branding rights", values: ["Club assets and halftime show", null, null, null] },
];
