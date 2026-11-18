import type { Metadata } from "next";
import { apiFetch } from "@/lib/api";
import type { DemoSponsor } from "@/lib/demoData";
import SafeImage from "@/components/SafeImage";
import PageIntro from "@/components/PageIntro";
import { getPagePhotos } from "@/lib/pagePhotos";
import { sectionMeta } from "@/lib/seo";

export const metadata: Metadata = sectionMeta("sponsors");

async function getSponsors(): Promise<DemoSponsor[]> {
  return (await apiFetch<DemoSponsor[]>("/sponsors", 3600)) || [];
}

const tierMeta = {
  principal: { heading: "Principal Partner" },
  partner: { heading: "Partners" },
  supplier: { heading: "Official Suppliers" },
} as const;

function TierHeading({ label, strong }: { label: string; strong?: boolean }) {
  return (
    <h2 className="mb-6 flex items-center gap-4">
      <span className={strong ? "font-display text-3xl uppercase text-navy" : "font-display text-2xl uppercase text-navy/70"}>{label}</span>
      <span className="h-px flex-1 bg-gradient-to-r from-cyan/60 to-transparent" />
    </h2>
  );
}

function SponsorLogo({ sponsor, size, featured }: { sponsor: DemoSponsor; size: number; featured?: boolean }) {
  const content = (
    <div
      className={
        "group relative flex items-center justify-center overflow-hidden rounded-2xl border p-5 transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:border-cyan hover:shadow-[0_16px_34px_-22px_rgba(10,36,77,0.5)] " +
        (featured ? "border-navy/15 bg-[linear-gradient(135deg,#fff,rgba(101,203,233,0.12))]" : "border-navy/10 bg-white")
      }
      style={{ height: size }}
    >
      <SafeImage
        src={sponsor.logoUrl}
        alt={sponsor.name}
        width={size * 2.5}
        height={size * 0.7}
        className="max-h-full w-auto object-contain opacity-90 grayscale transition-all duration-300 ease-smooth group-hover:opacity-100 group-hover:grayscale-0"
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
      <PageIntro
        eyebrow="Proud Partners"
        title="Sponsors"
        intro="The businesses and brands that stand behind Eko United FC and The Uga Boys."
        photos={await getPagePhotos("sponsors")}
      />

      {sponsors.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-navy/15 px-6 py-16 text-center text-navy/50">Sponsor profiles will appear here once added by the club.</p>
      ) : (
        <div className="space-y-14">
          {principal.length > 0 && (
            <section>
              <TierHeading label={tierMeta.principal.heading} strong />
              <div data-reveal-stagger className="grid gap-6 sm:grid-cols-2">
                {principal.map((sponsor) => (
                  <SponsorLogo key={sponsor._id} sponsor={sponsor} size={150} featured />
                ))}
              </div>
            </section>
          )}

          {partner.length > 0 && (
            <section>
              <TierHeading label={tierMeta.partner.heading} />
              <div data-reveal-stagger className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {partner.map((sponsor) => (
                  <SponsorLogo key={sponsor._id} sponsor={sponsor} size={100} />
                ))}
              </div>
            </section>
          )}

          {supplier.length > 0 && (
            <section>
              <TierHeading label={tierMeta.supplier.heading} />
              <div data-reveal-stagger className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {supplier.map((sponsor) => (
                  <SponsorLogo key={sponsor._id} sponsor={sponsor} size={100} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
