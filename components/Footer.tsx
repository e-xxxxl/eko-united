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

const WHATSAPP_CHANNEL_URL = "https://whatsapp.com/channel/0029Vb9YEZkA89MjRuBYcG43";

const columns = [
  {
    heading: "Club",
    links: [
      { href: "/about", label: "About" },
      { href: "/team", label: "Team" },
      { href: "/membership", label: "Club Membership" },
      { href: "/volunteer", label: "Volunteer" },
      { href: "/campus-ambassador", label: "Campus Ambassador" },
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
      { href: "/events", label: "Events & CSR" },
      { href: "/videos", label: "Videos" },
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
      <div data-reveal-stagger="fade" className="grid gap-10 sm:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3">
            <Image
              src="/brand/crest-mark.png"
              alt="Eko United FC crest"
              width={44}
              height={44}
              className="h-11 w-11"
            />
            <p className="font-display text-lg tracking-wide text-white">Eko United FC</p>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/60">
            The Uga Boys — Nigeria National League. Official news, fixtures,
            tickets and club shop.
          </p>
          <Link
            href="/membership"
            className="btn-glass btn-glass-yellow mt-5 inline-flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wide"
          >
            Join club membership <span aria-hidden>→</span>
          </Link>
          <a
            href={WHATSAPP_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-3 flex max-w-xs items-center gap-3 rounded-xl border border-white/15 px-4 py-3 text-sm text-white/80 transition-colors duration-200 ease-smooth hover:border-cyan hover:text-white"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden className="shrink-0 text-cyan">
              <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35zM12.05 21.8h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.89 9.88zM20.52 3.45A11.8 11.8 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.17-3.48-8.42z" />
            </svg>
            <span className="leading-snug">
              Follow the Eko United FC channel on WhatsApp
            </span>
          </a>
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
