import type { Metadata } from "next";
import PageIntro from "@/components/PageIntro";
import { getPagePhotos } from "@/lib/pagePhotos";
import { sectionMeta } from "@/lib/seo";

export const metadata: Metadata = sectionMeta("careers");

export default async function CareersPage() {
  const photos = await getPagePhotos("careers");
  return (
    <main className="px-6 py-16 sm:px-10 lg:px-16">
      <PageIntro
        eyebrow="Careers"
        title="Join the Club"
        photos={photos}
        intro={
          <>
            We are always open to hearing from people who want to help build Eko United FC. Current openings will be
            listed here, so check back soon, or reach out through our{" "}
            <a href="/contact" className="font-semibold text-cyan underline underline-offset-4">
              contact page
            </a>
            .
          </>
        }
      />
    </main>
  );
}
