import type { Metadata } from "next";
import { apiFetch } from "@/lib/api";
import { demoSponsors, type DemoSponsor } from "@/lib/demoData";
import SafeImage from "@/components/SafeImage";

export const metadata: Metadata = {
  title: "Sponsors & Partners",
  description: "The sponsors and partners who support Eko United FC.",
};

async function getSponsors(): Promise<DemoSponsor[]> {
  const live = await apiFetch<DemoSponsor[]>("/sponsors", 3600);
  return live && live.length > 0 ? live : demoSponsors;
}

const tierMeta = {
  principal: { heading: "Principal Partner" },
  partner: { heading: "Partners" },
  supplier: { heading: "Official Suppliers" },
} as const;

function SponsorLogo({ sponsor, size }: { sponsor: DemoSponsor; size: number }) {
  const content = (
    <div
      className="flex items-center justify-center border border-navy/10 p-6 transition-colors duration-300 ease-smooth hover:border-cyan"
      style={{ height: size }}
    >
      <SafeImage
        src={sponsor.logoUrl}
        alt={sponsor.name}
        width={size * 2.5}
        height={size * 0.7}
        className="max-h-full w-auto object-contain"
      />
    </div>
  );

  return sponsor.website ? (
    <a href={sponsor.website} target="_blank" rel="noopener noreferrer" aria-label={sponsor.name}>
      {content}
    </a>
  ) : (
    content
  );
}

export default async function SponsorsPage() {
  const sponsors = await getSponsors();
  const principal = sponsors.filter((s) => s.tier === "principal");
  const partner = sponsors.filter((s) => s.tier === "partner");
  const supplier = sponsors.filter((s) => s.tier === "supplier");

  return (
    <main className="px-6 py-16 sm:px-10 lg:px-16">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-cyan">
        Proud Partners
      </p>
      <h1 className="display-title font-display mb-10">Sponsors</h1>

      {sponsors.length === 0 ? (
        <p className="text-navy/50">Sponsor profiles will appear here once added by the club.</p>
      ) : (
        <div className="space-y-14">
          {principal.length > 0 && (
            <section>
              <p className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-cyan">
                {tierMeta.principal.heading}
              </p>
              <div className="grid gap-6 sm:grid-cols-2">
                {principal.map((sponsor) => (
                  <SponsorLogo key={sponsor._id} sponsor={sponsor} size={140} />
                ))}
              </div>
            </section>
          )}

          {partner.length > 0 && (
            <section>
              <p className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-navy/40">
                {tierMeta.partner.heading}
              </p>
              <div className="grid gap-5 sm:grid-cols-3 lg:grid-cols-4">
                {partner.map((sponsor) => (
                  <SponsorLogo key={sponsor._id} sponsor={sponsor} size={96} />
                ))}
              </div>
            </section>
          )}

          {supplier.length > 0 && (
            <section>
              <p className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-navy/40">
                {tierMeta.supplier.heading}
              </p>
              <div className="grid gap-5 sm:grid-cols-3 lg:grid-cols-4">
                {supplier.map((sponsor) => (
                  <SponsorLogo key={sponsor._id} sponsor={sponsor} size={96} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
