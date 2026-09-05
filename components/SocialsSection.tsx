import Image from "next/image";
import { apiFetch } from "@/lib/api";

// Demo crowd photo — swap for a real matchday crowd shot once supplied.
const bgImage = "https://images.unsplash.com/photo-1537228783107-df09e892bdbb?w=1600&q=80&fit=crop&auto=format";

type SocialLinks = {
  instagram?: string;
  twitter?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
};

const icons: Record<string, JSX.Element> = {
  instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  ),
  twitter: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M4 4l16 16M20 4L4 20" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="9" />
      <path d="M14 8.5h-1.5A1.5 1.5 0 0 0 11 10v2m0 0H9m2 0v6M9 12h4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10.5 9.5l5 2.5-5 2.5z" fill="currentColor" stroke="none" />
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3v10.5a3.5 3.5 0 1 1-3.5-3.5" />
      <path d="M15 3c.4 2.4 2 4 4.5 4.3" />
    </svg>
  ),
};

const platformLabels: Record<string, string> = {
  instagram: "Instagram",
  twitter: "X / Twitter",
  facebook: "Facebook",
  youtube: "YouTube",
  tiktok: "TikTok",
};

async function getSocialLinks(): Promise<SocialLinks | undefined> {
  const settings = await apiFetch<{ socialLinks?: SocialLinks }>("/settings");
  return settings?.socialLinks;
}

export default async function SocialsSection() {
  const social = await getSocialLinks();
  // No fabricated handles here — a wrong/fake social link is worse than no
  // section at all. Hides entirely until the admin sets real ones in Settings.
  if (!social || !Object.values(social).some(Boolean)) return null;
  const links = social;

  return (
    <section className="relative overflow-hidden bg-navy-dark px-6 py-20 sm:px-10 lg:px-16">
      <Image
        src={bgImage}
        alt=""
        fill
        sizes="100vw"
        className="object-cover opacity-25"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-navy-dark via-navy-dark/85 to-navy-dark/60" />

      <div className="relative flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">
            Follow The Uga Boys
          </p>
          <h2 className="font-display mt-2 text-2xl text-white sm:text-3xl">
            Get more updates
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {Object.entries(icons).map(([key, icon]) => {
            const url = links[key as keyof SocialLinks];
            if (!url) return null;
            return (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={platformLabels[key]}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-white transition-colors duration-200 ease-smooth hover:border-cyan hover:text-cyan"
              >
                <span className="h-5 w-5">{icon}</span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
