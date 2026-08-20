import type { Metadata } from "next";
import { apiFetch } from "@/lib/api";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Eko United FC — address, phone, email and social media.",
};

type SiteSettings = {
  clubInfo?: { address?: string; phone?: string; email?: string };
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    youtube?: string;
    tiktok?: string;
  };
};

async function getSettings(): Promise<SiteSettings> {
  return (await apiFetch<SiteSettings>("/settings")) || {};
}

export default async function ContactPage() {
  const settings = await getSettings();
  const clubInfo = settings.clubInfo || {};
  const social = settings.socialLinks || {};
  const socialEntries = [
    { label: "Instagram", url: social.instagram },
    { label: "X / Twitter", url: social.twitter },
    { label: "Facebook", url: social.facebook },
    { label: "YouTube", url: social.youtube },
    { label: "TikTok", url: social.tiktok },
  ].filter((entry) => entry.url);

  const mapQuery = encodeURIComponent(clubInfo.address || "Agege Stadium, Lagos, Nigeria");

  return (
    <main className="px-6 py-16 sm:px-10 lg:px-16">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-cyan">
        Get In Touch
      </p>
      <h1 className="display-title font-display mb-10">Contact Us</h1>

      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-xl text-navy/90">Send a message</h2>
          <div className="mt-6">
            <ContactForm />
          </div>
        </div>

        <div>
          <h2 className="font-display text-xl text-navy/90">Club details</h2>
          <dl className="mt-6 space-y-4 text-sm">
            {clubInfo.address && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-navy/40">Address</dt>
                <dd className="mt-1 text-navy/80">{clubInfo.address}</dd>
              </div>
            )}
            {clubInfo.phone && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-navy/40">Phone</dt>
                <dd className="mt-1">
                  <a href={`tel:${clubInfo.phone}`} className="text-cyan hover:text-navy">
                    {clubInfo.phone}
                  </a>
                </dd>
              </div>
            )}
            {clubInfo.email && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-navy/40">Email</dt>
                <dd className="mt-1">
                  <a href={`mailto:${clubInfo.email}`} className="text-cyan hover:text-navy">
                    {clubInfo.email}
                  </a>
                </dd>
              </div>
            )}
          </dl>

          {socialEntries.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {socialEntries.map((entry) => (
                <a
                  key={entry.label}
                  href={entry.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan transition-colors duration-200 ease-smooth hover:text-navy"
                >
                  {entry.label}
                </a>
              ))}
            </div>
          )}

          <div className="mt-8 border border-navy/10">
            <iframe
              title="Eko United FC location"
              src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
              width="100%"
              height="320"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="border-0"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
