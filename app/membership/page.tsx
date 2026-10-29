import type { Metadata } from "next";
import Image from "next/image";
import { apiFetch } from "@/lib/api";
import FramedImage from "@/components/FramedImage";
import MembershipPlans from "@/components/MembershipPlans";
import { isAllowedImageUrl } from "@/lib/imageHosts";
import type { MembershipContent, MembershipTier } from "@/lib/membershipTypes";
import { sectionMeta } from "@/lib/seo";

export const metadata: Metadata = sectionMeta("membership");

type PlansResponse = { content: MembershipContent; tiers: MembershipTier[] };

const steps = [
  { title: "Choose your package", text: "Compare what each package includes and pick the one that suits you." },
  { title: "Send your details", text: "Give us your name, email and phone number. It takes a minute." },
  { title: "We take it from here", text: "The club's marketing team contacts you to confirm and arrange payment." },
];

// Mosaic tile shapes, repeating, so a handful of uploaded photos reads as a
// deliberate layout rather than a plain grid.
const tileShapes = ["col-span-2 row-span-2", "", "", "col-span-2", "", "row-span-2", "", ""];

export default async function MembershipPage() {
  const data = await apiFetch<PlansResponse>("/membership/plans", 300);
  const content = data?.content;
  const tiers = data?.tiers || [];
  const heroImage = content?.heroImageUrl && isAllowedImageUrl(content.heroImageUrl) ? content.heroImageUrl : null;
  const gallery = (content?.gallery || []).filter((g) => g.url && isAllowedImageUrl(g.url));

  return (
    <main>
      <section
        data-reveal-skip
        className="relative flex min-h-[26rem] flex-col justify-end overflow-hidden bg-navy-dark sm:min-h-[34rem]"
      >
        {heroImage ? (
          <Image src={heroImage} alt="" fill priority sizes="100vw" className="object-cover object-top" />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(60%_90%_at_80%_0%,rgba(101,203,233,0.25),transparent_70%),repeating-linear-gradient(115deg,transparent_0_46px,rgba(255,255,255,0.025)_46px_47px)]" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/55 to-navy-dark/10" />
        <div className="relative px-6 pb-12 pt-32 sm:px-10 sm:pb-16 lg:px-16">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-cyan">
            {content?.eyebrow || "Official Membership"}
          </p>
          <h1 className="font-display max-w-3xl text-5xl leading-[0.95] text-white sm:text-7xl">
            {content?.title || "Be part of The Uga Boys"}
          </h1>
          {content?.intro && (
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">{content.intro}</p>
          )}
          {tiers.length > 0 && (
            <a
              href="#packages"
              className="btn-glass btn-glass-yellow mt-8 inline-block px-8 py-3.5 text-sm font-bold uppercase tracking-wide"
            >
              See the packages
            </a>
          )}
        </div>
      </section>

      <div className="px-6 py-16 sm:px-10 sm:py-20 lg:px-16">
        {tiers.length === 0 ? (
          <p className="text-navy/50">Membership packages will appear here soon.</p>
        ) : (
          <>
            <MembershipPlans tiers={tiers} />

            <section className="mt-24">
              <h2 data-reveal className="display-title font-display mb-10">
                How it works
              </h2>
              <ol data-reveal-stagger className="grid gap-5 md:grid-cols-3">
                {steps.map((s, i) => (
                  <li key={s.title} className="rounded-2xl bg-navy/[0.04] p-7">
                    <span className="font-display text-6xl leading-none text-cyan">{i + 1}</span>
                    <p className="mt-4 font-display text-2xl text-navy">{s.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-navy/65">{s.text}</p>
                  </li>
                ))}
              </ol>
            </section>

            {gallery.length > 0 && (
              <section className="mt-24">
                <h2 data-reveal className="display-title font-display mb-10">
                  {content?.galleryHeading || "Life as a member"}
                </h2>
                <div
                  data-reveal-stagger="scale"
                  className="grid auto-rows-[9.5rem] grid-cols-2 gap-3 sm:auto-rows-[12rem] lg:grid-cols-4"
                >
                  {gallery.map((g, i) => (
                    <figure
                      key={g.url + i}
                      className={`group relative overflow-hidden rounded-2xl bg-navy-dark ${tileShapes[i % tileShapes.length]}`}
                    >
                      <FramedImage
                        src={g.url}
                        alt={g.caption || "Eko United FC members"}
                        sizes="(min-width: 1024px) 25vw, 50vw"
                        fill
                        rounded={false}
                        className="transition-transform duration-[900ms] ease-smooth group-hover:scale-105"
                      />
                      {g.caption && (
                        <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-navy-dark/90 to-transparent p-4 text-sm text-white opacity-0 transition-all duration-500 ease-smooth group-hover:translate-y-0 group-hover:opacity-100">
                          {g.caption}
                        </figcaption>
                      )}
                    </figure>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
