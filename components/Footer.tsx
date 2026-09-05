import Link from "next/link";
import Image from "next/image";

type FooterSettings = {
  clubInfo?: {
    address?: string;
    phone?: string;
    email?: string;
  };
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    youtube?: string;
    tiktok?: string;
  };
};

const columns = [
  {
    heading: "Club",
    links: [
      { href: "/about", label: "About" },
      { href: "/team", label: "Team" },
      { href: "/club-history", label: "Club History" },
      { href: "/trophies", label: "Trophy Cabinet" },
      { href: "/careers", label: "Careers" },
    ],
  },
  {
    heading: "Matches",
    links: [
      { href: "/fixtures", label: "Fixtures" },
      { href: "/results", label: "Results" },
      { href: "/table", label: "League Table" },
    ],
  },
  {
    heading: "Media",
    links: [
      { href: "/news", label: "News" },
      { href: "/gallery", label: "Gallery" },
    ],
  },
  {
    heading: "Info",
    links: [
      { href: "/sponsors", label: "Sponsors" },
      { href: "/media-accreditation", label: "Media Accreditation" },
      { href: "/contact", label: "Contact" },
      { href: "/privacy-policy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms & Conditions" },
    ],
  },
];

// Server component — receives SiteSettings fetched once in the root layout
// rather than each page re-fetching it, since the footer renders on every page.
export default function Footer({ settings }: { settings?: FooterSettings | null }) {
  const social = settings?.socialLinks || {};
  const socialEntries = [
    { key: "instagram", label: "Instagram", url: social.instagram },
    { key: "twitter", label: "X / Twitter", url: social.twitter },
    { key: "facebook", label: "Facebook", url: social.facebook },
    { key: "youtube", label: "YouTube", url: social.youtube },
    { key: "tiktok", label: "TikTok", url: social.tiktok },
  ].filter((entry) => entry.url);

  return (
    <footer className="border-t border-white/10 bg-navy-dark px-6 py-14 sm:px-10 lg:px-16">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3">
            <Image
              src="/brand/crest-mark.png"
              alt="Eko United FC crest"
              width={44}
              height={44}
              className="h-11 w-11"
            />
            <p className="font-display text-lg tracking-wide">Eko United FC</p>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/60">
            The Uga Boys — Nigeria National League. Official news, fixtures,
            tickets and club shop.
          </p>
          {(settings?.clubInfo?.address ||
            settings?.clubInfo?.phone ||
            settings?.clubInfo?.email) && (
            <div className="mt-5 space-y-1 text-sm text-white/50">
              {settings?.clubInfo?.address && <p>{settings.clubInfo.address}</p>}
              {settings?.clubInfo?.phone && <p>{settings.clubInfo.phone}</p>}
              {settings?.clubInfo?.email && <p>{settings.clubInfo.email}</p>}
            </div>
          )}
          {socialEntries.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {socialEntries.map((entry) => (
                <a
                  key={entry.key}
                  href={entry.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan transition-colors duration-200 ease-smooth hover:text-white"
                >
                  {entry.label}
                </a>
              ))}
            </div>
          )}
        </div>

        {columns.map((col) => (
          <div key={col.heading}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              {col.heading}
            </p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 transition-colors duration-200 ease-smooth hover:text-cyan"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Eko United FC. All rights reserved.</p>
        <p>Built by TEKUVO</p>
      </div>
    </footer>
  );
}
