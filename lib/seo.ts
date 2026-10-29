import type { Metadata } from "next";

// One place for how each page introduces itself when its link is shared, so
// the browser tab, the search result and the WhatsApp or X card all say the
// same thing. `headline` and `subline` are what the generated share image
// prints (see lib/og/cards.tsx); `eyebrow` is the small label above it.
export const SITE_URL = "https://ekounitedfc.com";
export const SITE_NAME = "Eko United FC";

export type SectionSeo = {
  path: string;
  title: string;
  description: string;
  eyebrow: string;
  headline: string;
  subline: string;
};

export const sections = {
  about: {
    path: "/about",
    title: "About the Club",
    description: "The story, vision and people behind Eko United FC, The Uga Boys of Lagos.",
    eyebrow: "The club",
    headline: "About Eko United",
    subline: "Our story, our vision, our people",
  },
  team: {
    path: "/team",
    title: "First Team Squad",
    description: "Meet the Eko United FC first team squad: goalkeepers, defenders, midfielders and forwards. The Uga Boys.",
    eyebrow: "The Uga Boys",
    headline: "First Team Squad",
    subline: "Nigeria National League",
  },
  coachingStaff: {
    path: "/team/coaching-staff",
    title: "Coaching and Technical Staff",
    description: "Meet the coaches and technical staff behind Eko United FC.",
    eyebrow: "The Uga Boys",
    headline: "Coaching Staff",
    subline: "The people behind the team",
  },
  fixtures: {
    path: "/fixtures",
    title: "Fixtures",
    description: "Every upcoming Eko United FC match in the Nigeria National League: dates, kick-off times and venues.",
    eyebrow: "Matchday",
    headline: "Fixtures",
    subline: "Nigeria National League",
  },
  results: {
    path: "/results",
    title: "Results",
    description: "Full-time scores and match reports from every Eko United FC game.",
    eyebrow: "Matchday",
    headline: "Results",
    subline: "Every score, every game",
  },
  table: {
    path: "/table",
    title: "League Table",
    description: "The latest Nigeria National League standings, with Eko United FC's position.",
    eyebrow: "Nigeria National League",
    headline: "League Table",
    subline: "Where Eko United stand",
  },
  news: {
    path: "/news",
    title: "News",
    description: "The latest news, match reports and press releases from Eko United FC.",
    eyebrow: "Club news",
    headline: "Latest News",
    subline: "Match reports and press releases",
  },
  events: {
    path: "/events",
    title: "Events",
    description: "Fan days, community outreach and club occasions from Eko United FC. See what is coming up.",
    eyebrow: "Club life",
    headline: "Events",
    subline: "Fan days and community days",
  },
  gallery: {
    path: "/gallery",
    title: "Gallery",
    description: "Photos from Eko United FC matchdays and behind the scenes.",
    eyebrow: "Matchday and beyond",
    headline: "Photo Gallery",
    subline: "Matchdays and behind the scenes",
  },
  videos: {
    path: "/videos",
    title: "Videos",
    description: "Match highlights, interviews and behind the scenes films from Eko United FC.",
    eyebrow: "Watch",
    headline: "Club Videos",
    subline: "Highlights and behind the scenes",
  },
  shop: {
    path: "/shop",
    title: "Club Shop",
    description: "Official Eko United FC kits and merchandise. Shop the Uga Boys collection online.",
    eyebrow: "Official store",
    headline: "Club Shop",
    subline: "Kits and merchandise",
  },
  tickets: {
    path: "/tickets",
    title: "Match Tickets",
    description: "Buy tickets for upcoming Eko United FC home matches online.",
    eyebrow: "Matchday",
    headline: "Match Tickets",
    subline: "Be there on matchday",
  },
  membership: {
    path: "/membership",
    title: "Club Membership",
    description: "Join Eko United FC as a Gold, Diamond or Platinum member, or partner with the club. See every package and apply online.",
    eyebrow: "Join the club",
    headline: "Club Membership",
    subline: "Gold, Diamond and Platinum",
  },
  volunteer: {
    path: "/volunteer",
    title: "Volunteer",
    description: "Give a few hours to Eko United FC: matchday support, community outreach, media, youth and events.",
    eyebrow: "Get involved",
    headline: "Volunteer With Us",
    subline: "Be part of The Uga Boys",
  },
  mediaAccreditation: {
    path: "/media-accreditation",
    title: "Media Accreditation",
    description: "Request media accreditation to cover Eko United FC matches and events.",
    eyebrow: "Press and media",
    headline: "Media Accreditation",
    subline: "Cover the Uga Boys",
  },
  sponsors: {
    path: "/sponsors",
    title: "Sponsors and Partners",
    description: "The sponsors and partners who stand behind Eko United FC.",
    eyebrow: "Partners",
    headline: "Sponsors and Partners",
    subline: "Backing the Uga Boys",
  },
  trophies: {
    path: "/trophies",
    title: "Trophy Cabinet",
    description: "The honours and silverware won by Eko United FC.",
    eyebrow: "Honours",
    headline: "Trophy Cabinet",
    subline: "Silverware and honours",
  },
  clubHistory: {
    path: "/club-history",
    title: "Club History",
    description: "The Eko United FC story, from the founding to today, milestone by milestone.",
    eyebrow: "Our story",
    headline: "Club History",
    subline: "From the founding to today",
  },
  contact: {
    path: "/contact",
    title: "Contact",
    description: "Get in touch with Eko United FC: address, phone, email and social media.",
    eyebrow: "Get in touch",
    headline: "Contact Us",
    subline: "We would love to hear from you",
  },
  careers: {
    path: "/careers",
    title: "Careers",
    description: "Work with Eko United FC. See the current opportunities at the club.",
    eyebrow: "Join the team",
    headline: "Careers",
    subline: "Opportunities at the club",
  },
} satisfies Record<string, SectionSeo>;

export type SectionKey = keyof typeof sections;

type PageMeta = { title: string; description: string; path: string; type?: "website" | "article" };

// Full metadata for one page: tab title, description, canonical link and the
// Open Graph and X card text. The share image itself comes from the page's
// opengraph-image file, which Next attaches automatically.
export function pageMeta({ title, description, path, type = "website" }: PageMeta): Metadata {
  const url = `${SITE_URL}${path}`;
  const cardTitle = `${title} | ${SITE_NAME}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type, siteName: SITE_NAME, title: cardTitle, description, url, locale: "en_NG" },
    twitter: { card: "summary_large_image", title: cardTitle, description },
  };
}

export function sectionMeta(key: SectionKey): Metadata {
  const s = sections[key];
  return pageMeta({ title: s.title, description: s.description, path: s.path });
}
