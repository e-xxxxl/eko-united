// ---------------------------------------------------------------------------
// DEMO CONTENT — temporary scaffolding so every route shows what the finished
// site will look like before the admin panel exists to populate real data.
//
// DELETE THIS FILE (and the fallback lines that import from it) once the
// admin dashboard is live and the club has entered real players, fixtures,
// news, etc. Real data always wins over demo data.
// ---------------------------------------------------------------------------

// News specifically uses a "fill" fallback rather than all-or-nothing: real
// articles are shown first (however many exist), and only the remaining
// slots — if the club hasn't published enough yet — are padded out with
// demo stories, so a homepage/section with e.g. 2 real articles doesn't look
// sparse next to one with 5. Everything else on the site still uses the
// simpler all-or-nothing fallback (`live.length > 0 ? live : demoX`).
export function fillWithDemo<T>(live: T[] | null | undefined, demo: T[], count: number): T[] {
  const real = live || [];
  if (real.length >= count) return real.slice(0, count);
  return [...real, ...demo.slice(0, count - real.length)];
}

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

const p = (url: string, w = 700) => `https://images.unsplash.com/photo-${url}?w=${w}&q=80&fit=crop&auto=format`;

export const demoSquad: DemoPlayer[] = [
  { _id: "p1", name: "Chidi Okafor", slug: "chidi-okafor", position: "Forward", squadNumber: 9, role: "player", nationality: "Nigeria", dateOfBirth: "2000-03-14", photoUrl: p("1517466787929-bc90951d0974"), bio: "A clinical finisher who joined the club ahead of the 2026 campaign, Chidi has quickly become a fan favourite for his movement in the box and composure in front of goal.", stats: { appearances: 14, goals: 11, assists: 3 } },
  { _id: "p2", name: "Emeka Taiwo", slug: "emeka-taiwo", position: "Midfielder", squadNumber: 8, role: "player", nationality: "Nigeria", dateOfBirth: "1999-07-22", photoUrl: p("1670489520245-c41cb342a565"), bio: "The engine room of the side — Emeka dictates tempo from a deep-lying position and rarely gives the ball away.", stats: { appearances: 16, goals: 2, assists: 9 } },
  { _id: "p3", name: "Segun Bello", slug: "segun-bello", position: "Defender", squadNumber: 4, role: "player", nationality: "Nigeria", dateOfBirth: "1998-11-02", photoUrl: p("1670489520252-91fcbaa172f2"), bio: "A commanding centre-back and vocal leader of the backline, Segun captains the side on matchdays.", stats: { appearances: 16, goals: 1, assists: 0 } },
  { _id: "p4", name: "Ayo Balogun", slug: "ayo-balogun", position: "Goalkeeper", squadNumber: 1, role: "player", nationality: "Nigeria", dateOfBirth: "1997-05-19", photoUrl: p("1614150011754-cd8b7c8dc0cc"), bio: "Ever-present between the sticks, Ayo's shot-stopping has kept the Uga Boys in games all season.", stats: { appearances: 16, goals: 0, assists: 0 } },
  { _id: "p5", name: "Femi Adeyemi", slug: "femi-adeyemi", position: "Winger", squadNumber: 11, role: "player", nationality: "Nigeria", dateOfBirth: "2001-01-30", photoUrl: p("1610017128786-4a25f0f7756c"), bio: "Electric down the right flank, Femi's pace and crossing have been a constant outlet for the attack.", stats: { appearances: 13, goals: 4, assists: 6 } },
  { _id: "p6", name: "Tunde Bakare", slug: "tunde-bakare", position: "Defender", squadNumber: 5, role: "player", nationality: "Nigeria", dateOfBirth: "1999-09-08", photoUrl: p("1649001863283-0ce7ca4e8754"), bio: "A reliable, no-nonsense defender who reads the game a step ahead of most forwards.", stats: { appearances: 15, goals: 0, assists: 1 } },
  { _id: "p7", name: "Ibrahim Musa", slug: "ibrahim-musa", position: "Midfielder", squadNumber: 6, role: "player", nationality: "Nigeria", dateOfBirth: "2000-06-17", photoUrl: p("1607080033776-63b372e37828"), bio: "A box-to-box midfielder with a knack for arriving late in the penalty area.", stats: { appearances: 12, goals: 3, assists: 2 } },
  { _id: "p8", name: "Kunle Adebayo", slug: "kunle-adebayo", position: "Forward", squadNumber: 19, role: "player", nationality: "Nigeria", dateOfBirth: "2002-02-11", photoUrl: p("1544222059-d13512b9f1da"), bio: "The youngest member of the squad, Kunle's breakthrough season has turned heads across the league.", stats: { appearances: 9, goals: 5, assists: 1 } },
];

export const demoCoaches: DemoPlayer[] = [
  { _id: "c1", name: "Wale Ogunleye", slug: "wale-ogunleye", position: "Head Coach", role: "coach", title: "Head Coach", photoUrl: p("1560272564-c83b66b1ad12"), bio: "Appointed ahead of the 2026 season, Wale brings a possession-based philosophy built on a decade of coaching across the NNL." },
  { _id: "c2", name: "Grace Nwachukwu", slug: "grace-nwachukwu", position: "Assistant Coach", role: "coach", title: "Assistant Coach", photoUrl: p("1517466787929-bc90951d0974", 700) },
];

export const demoTechnicalStaff: DemoPlayer[] = [
  { _id: "t1", name: "Daniel Eze", slug: "daniel-eze", position: "Goalkeeping Coach", role: "technical_staff", title: "Goalkeeping Coach", photoUrl: p("1607080033776-63b372e37828") },
  { _id: "t2", name: "Amaka Obi", slug: "amaka-obi", position: "Fitness Coach", role: "technical_staff", title: "Fitness Coach", photoUrl: p("1544222059-d13512b9f1da") },
];

export const demoManagement: DemoPlayer[] = [
  { _id: "m1", name: "Chief Adekunle Johnson", slug: "adekunle-johnson", role: "management", title: "Chairman", photoUrl: p("1517466787929-bc90951d0974") },
  { _id: "m2", name: "Funmi Alabi", slug: "funmi-alabi", role: "management", title: "Chief Executive Officer", photoUrl: p("1670489520252-91fcbaa172f2") },
  { _id: "m3", name: "Bayo Okonkwo", slug: "bayo-okonkwo", role: "management", title: "Director of Football", photoUrl: p("1649001863283-0ce7ca4e8754") },
];

export function findDemoPerson(slug: string): DemoPlayer | undefined {
  return [...demoSquad, ...demoCoaches, ...demoTechnicalStaff, ...demoManagement].find((x) => x.slug === slug);
}

// --- Matches -----------------------------------------------------------

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

export const demoFixtures: DemoMatch[] = [
  { _id: "f1", opponent: "Remo Stars FC", competition: "NNL — Matchday 12", venue: "Agege Stadium, Lagos", kickoff: "2026-08-30T15:00:00.000Z", isHome: true, status: "upcoming" },
  { _id: "f2", opponent: "Sporting Lagos", competition: "NNL — Matchday 13", venue: "Teslim Balogun Stadium", kickoff: "2026-09-06T15:00:00.000Z", isHome: false, status: "upcoming" },
  { _id: "f3", opponent: "Rivers United", competition: "NNL — Matchday 14", venue: "Agege Stadium, Lagos", kickoff: "2026-09-13T15:00:00.000Z", isHome: true, status: "upcoming" },
  { _id: "f4", opponent: "Bendel Insurance", competition: "NNL — Matchday 15", venue: "Samuel Ogbemudia Stadium", kickoff: "2026-09-20T15:00:00.000Z", isHome: false, status: "upcoming" },
  { _id: "f5", opponent: "Kwara United", competition: "NNL — Matchday 16", venue: "Agege Stadium, Lagos", kickoff: "2026-09-27T15:00:00.000Z", isHome: true, status: "postponed" },
];

export const demoResults: DemoMatch[] = [
  { _id: "r1", opponent: "Enyimba FC", competition: "NNL — Matchday 11", venue: "Agege Stadium, Lagos", kickoff: "2026-08-16T15:00:00.000Z", isHome: true, status: "finished", score: { eko: 2, opponent: 1 } },
  { _id: "r2", opponent: "Shooting Stars", competition: "NNL — Matchday 10", venue: "Obafemi Awolowo Stadium", kickoff: "2026-08-09T15:00:00.000Z", isHome: false, status: "finished", score: { eko: 1, opponent: 1 } },
  { _id: "r3", opponent: "Plateau United", competition: "NNL — Matchday 9", venue: "Agege Stadium, Lagos", kickoff: "2026-08-02T15:00:00.000Z", isHome: true, status: "finished", score: { eko: 3, opponent: 0 } },
  { _id: "r4", opponent: "Heartland FC", competition: "NNL — Matchday 8", venue: "Dan Anyiam Stadium", kickoff: "2026-07-26T15:00:00.000Z", isHome: false, status: "finished", score: { eko: 0, opponent: 2 } },
  { _id: "r5", opponent: "Katsina United", competition: "NNL — Matchday 7", venue: "Agege Stadium, Lagos", kickoff: "2026-07-19T15:00:00.000Z", isHome: true, status: "finished", score: { eko: 2, opponent: 0 } },
];

// --- Standings -----------------------------------------------------------

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

export const demoStandings: DemoStanding[] = [
  { _id: "s1", clubName: "Sporting Lagos", isEkoUnited: false, played: 12, won: 8, drawn: 2, lost: 2, goalDifference: 15, points: 26, position: 1 },
  { _id: "s2", clubName: "Remo Stars FC", isEkoUnited: false, played: 12, won: 7, drawn: 3, lost: 2, goalDifference: 12, points: 24, position: 2 },
  { _id: "s3", clubName: "Eko United FC", isEkoUnited: true, played: 12, won: 7, drawn: 2, lost: 3, goalDifference: 9, points: 23, position: 3 },
  { _id: "s4", clubName: "Rivers United", isEkoUnited: false, played: 12, won: 6, drawn: 3, lost: 3, goalDifference: 6, points: 21, position: 4 },
  { _id: "s5", clubName: "Enyimba FC", isEkoUnited: false, played: 12, won: 5, drawn: 4, lost: 3, goalDifference: 4, points: 19, position: 5 },
  { _id: "s6", clubName: "Bendel Insurance", isEkoUnited: false, played: 12, won: 5, drawn: 3, lost: 4, goalDifference: 2, points: 18, position: 6 },
  { _id: "s7", clubName: "Plateau United", isEkoUnited: false, played: 12, won: 4, drawn: 4, lost: 4, goalDifference: 0, points: 16, position: 7 },
  { _id: "s8", clubName: "Shooting Stars", isEkoUnited: false, played: 12, won: 4, drawn: 3, lost: 5, goalDifference: -2, points: 15, position: 8 },
  { _id: "s9", clubName: "Kwara United", isEkoUnited: false, played: 12, won: 3, drawn: 4, lost: 5, goalDifference: -5, points: 13, position: 9 },
  { _id: "s10", clubName: "Katsina United", isEkoUnited: false, played: 12, won: 3, drawn: 3, lost: 6, goalDifference: -7, points: 12, position: 10 },
  { _id: "s11", clubName: "Heartland FC", isEkoUnited: false, played: 12, won: 2, drawn: 3, lost: 7, goalDifference: -10, points: 9, position: 11 },
];

// --- News -----------------------------------------------------------

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

export const demoNews: DemoNews[] = [
  {
    _id: "n1",
    slug: "preseason-report",
    title: "Preseason report: The Uga Boys ready for the new campaign",
    category: "article",
    author: "Eko United FC",
    publishedAt: "2026-07-01T09:00:00.000Z",
    coverImageUrl: p("1574629810360-7efbbe195018", 1200),
    body: "Eko United FC have completed a productive preseason schedule ahead of the 2026 Nigeria National League campaign, with the squad returning from training camp in high spirits.\n\nHead coach Wale Ogunleye praised the group's fitness levels and tactical understanding after a series of closed-door friendlies against regional opposition. \"We've built a strong foundation over the last six weeks. The players understand what we're trying to do on the pitch, and I'm excited for the season ahead,\" Ogunleye said.\n\nThe club also welcomed several new faces to the squad, including forward Chidi Okafor, who scored twice in the final preseason friendly. Season tickets and the 2026 kit are now available ahead of the opening matchday.",
  },
  {
    _id: "n2",
    slug: "new-signing-chidi-okafor",
    title: "Club announces new signing ahead of matchday one",
    category: "press_release",
    author: "Eko United FC",
    publishedAt: "2026-06-20T09:00:00.000Z",
    coverImageUrl: p("1626248801379-51a0748a5f96", 1200),
    body: "Eko United FC is delighted to announce the signing of forward Chidi Okafor ahead of the 2026 season. Okafor joins The Uga Boys on a two-year deal after an impressive spell in the Lagos regional league, where he finished as top scorer.\n\n\"I'm thrilled to be joining a club with this much ambition,\" Okafor said. \"The vision the club has shared with me, both on and off the pitch, is exactly why I wanted to make this move.\"\n\nOkafor will wear the number 9 shirt and is expected to feature in the club's opening fixture of the season.",
  },
  {
    _id: "n3",
    slug: "stadium-upgrades-complete",
    title: "Stadium upgrades completed ahead of the new season",
    category: "article",
    author: "Eko United FC",
    publishedAt: "2026-06-10T09:00:00.000Z",
    coverImageUrl: p("1611000273610-f4fb9c7fd0be", 1200),
    body: "Improvements to the club's home ground at Agege Stadium have been completed in time for the new season, including upgraded seating, new floodlighting, and refreshed pitch drainage.\n\nThe club thanks supporters for their patience during the works and looks forward to welcoming fans back for matchday one.",
  },
  {
    _id: "n4",
    slug: "match-report-enyimba",
    title: "Match report: Eko United edge past Enyimba in five-goal thriller",
    category: "match_report",
    author: "Eko United FC",
    publishedAt: "2026-08-16T18:00:00.000Z",
    coverImageUrl: p("1489944440615-453fc2b6a9a9", 1200),
    images: [p("1550881111-7cfde14b8073", 1000), p("1522778119026-d647f0596c20", 1000)],
    body: "Eko United FC came from behind to beat Enyimba FC 2-1 at Agege Stadium on Sunday, with second-half goals from Chidi Okafor and Femi Adeyemi sealing the win.\n\nEnyimba took an early lead against the run of play, but The Uga Boys responded well, dominating possession for large spells. Okafor's equaliser just before the hour mark shifted the momentum, and Adeyemi's driven finish from the edge of the box secured all three points with fifteen minutes to play.\n\nThe result moves Eko United up to third in the table ahead of next weekend's away trip to Sporting Lagos.",
  },
  {
    _id: "n5",
    slug: "youth-academy-plans",
    title: "Club outlines long-term community and youth development plans",
    category: "press_release",
    author: "Eko United FC",
    publishedAt: "2026-05-28T09:00:00.000Z",
    coverImageUrl: p("1629217855633-79a6925d6c47", 1200),
    body: "Eko United FC has outlined its ambitions to invest in grassroots football across Lagos over the coming seasons, as part of a broader commitment to the local community that raised the club.\n\nMore details will be announced in due course.",
  },
];

// --- Gallery -----------------------------------------------------------

export type DemoGalleryItem = { _id: string; type: "photo" | "video"; url: string; caption?: string };

export const demoGallery: DemoGalleryItem[] = [
  { _id: "g1", type: "photo", url: p("1489944440615-453fc2b6a9a9", 1000), caption: "Matchday at Agege Stadium" },
  { _id: "g2", type: "photo", url: p("1431324155629-1a6deb1dec8d", 1000), caption: "Under the lights" },
  { _id: "g3", type: "photo", url: p("1629217855633-79a6925d6c47", 1000), caption: "Training ground" },
  { _id: "g4", type: "photo", url: p("1599158150601-1417ebbaafdd", 1000), caption: "Pre-match warm-up" },
  { _id: "g5", type: "photo", url: p("1537228783107-df09e892bdbb", 1000), caption: "The Uga Boys faithful" },
  { _id: "g6", type: "photo", url: p("1565483276060-e6730c0cc6a1", 1000), caption: "Matchday atmosphere" },
  { _id: "g7", type: "photo", url: p("1539657523674-fbd149b04c13", 1000), caption: "Full house" },
  { _id: "g8", type: "photo", url: p("1517747614396-d21a78b850e8", 1000), caption: "Agege Stadium" },
  { _id: "g9", type: "photo", url: p("1434648957308-5e6a859697e8", 1000), caption: "Kickoff" },
];

// --- Sponsors -----------------------------------------------------------

export type DemoSponsor = { _id: string; name: string; logoUrl: string; website?: string; tier: "principal" | "partner" | "supplier" };

// Simple text-mark placeholder logos (static SVGs in public/sponsors/)
// rather than borrowing real brand marks — swap for real sponsor logos via
// the admin panel.
export const demoSponsors: DemoSponsor[] = [
  { _id: "sp1", name: "Lagos Bridge Bank", logoUrl: "/sponsors/lagos-bridge-bank.svg", tier: "principal" },
  { _id: "sp2", name: "Danfo Logistics", logoUrl: "/sponsors/danfo-logistics.svg", tier: "partner" },
  { _id: "sp3", name: "Eko Water", logoUrl: "/sponsors/eko-water.svg", tier: "partner" },
  { _id: "sp4", name: "Marina Telecom", logoUrl: "/sponsors/marina-telecom.svg", tier: "partner" },
  { _id: "sp5", name: "Third Mainland Motors", logoUrl: "/sponsors/third-mainland-motors.svg", tier: "supplier" },
  { _id: "sp6", name: "Uga Sportswear", logoUrl: "/sponsors/uga-sportswear.svg", tier: "supplier" },
];

// --- Trophies -----------------------------------------------------------

export type DemoTrophy = { _id: string; name: string; competition?: string; year: number; timesWon: number; description?: string; imageUrl?: string };

export const demoTrophies: DemoTrophy[] = [
  { _id: "tr1", name: "NNL Regional Champions", competition: "Nigeria National League — Lagos Region", year: 2026, timesWon: 1, description: "Eko United FC's first major honour, secured in the club's debut competitive season." },
  { _id: "tr2", name: "Lagos State Cup", competition: "Lagos State FA Cup", year: 2026, timesWon: 1, description: "A dominant cup run, culminating in a 3-0 final victory at Teslim Balogun Stadium." },
];

// --- Club history -----------------------------------------------------------

export type DemoMilestone = { _id: string; year: number; title: string; description?: string };

export const demoHistory: DemoMilestone[] = [
  { _id: "h1", year: 2025, title: "Club founded", description: "Eko United FC was founded with a mission to give Lagos a football club its people could call their own." },
  { _id: "h2", year: 2026, title: "NNL debut season", description: "The Uga Boys made their competitive debut in the Nigeria National League, quickly establishing themselves as genuine contenders." },
  { _id: "h3", year: 2026, title: "Agege Stadium upgrades", description: "Home ground improvements completed, including new seating, floodlighting, and pitch drainage." },
  { _id: "h4", year: 2026, title: "First silverware", description: "The club won its first piece of major silverware, the Lagos State Cup, in a commanding final performance." },
];

// --- Club shop -----------------------------------------------------------

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

export const demoProducts: DemoProduct[] = [
  {
    _id: "p1",
    name: "2026 Home Kit",
    slug: "2026-home-kit",
    description: "The Uga Boys' home shirt for the 2026 Nigeria National League season — navy and cyan, crest on the chest.",
    price: 25000,
    category: "jersey",
    images: ["/jerseys/home-kit.jpg"],
    sizes: ["S", "M", "L", "XL"],
    stock: 40,
  },
  {
    _id: "p2",
    name: "2026 Away Kit",
    slug: "2026-away-kit",
    description: "The 2026 away shirt — a clean white base with navy and cyan trim.",
    price: 25000,
    category: "jersey",
    images: ["/jerseys/away-kit.jpg"],
    sizes: ["S", "M", "L", "XL"],
    stock: 35,
  },
];

// --- Match tickets ---------------------------------------------------------
// Keyed to demoFixtures' "f1" (the next fixture) so the /tickets flow has
// something to demo before real matches + ticket types exist in the backend.

export type DemoTicketType = {
  _id: string;
  match: string;
  name: string;
  price: number;
  quantityAvailable: number;
  quantitySold: number;
};

export const demoTicketTypes: DemoTicketType[] = [
  { _id: "tt1", match: "f1", name: "Regular", price: 2000, quantityAvailable: 500, quantitySold: 210 },
  { _id: "tt2", match: "f1", name: "VIP", price: 10000, quantityAvailable: 60, quantitySold: 22 },
];
