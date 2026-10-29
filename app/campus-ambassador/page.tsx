import type { Metadata } from "next";
import CampusAmbassadorForm from "@/components/CampusAmbassadorForm";
import PageIntro from "@/components/PageIntro";
import { getPagePhotos } from "@/lib/pagePhotos";
import { sectionMeta } from "@/lib/seo";

export const metadata: Metadata = sectionMeta("campusAmbassador");

const duties = [
  { title: "Be the voice of the club", text: "Share Eko United news, results and fixtures with students on your campus and online." },
  { title: "Build a supporter community", text: "Bring fellow students together to follow the Uga Boys, from watch parties to matchday trips." },
  { title: "Spread the word", text: "Help promote tickets, events and the club shop to your campus." },
  { title: "Tell the campus story", text: "Share photos, videos and stories from your school with the club's media team." },
  { title: "Support community work", text: "Help bring the club's community and CSR activities to students and neighbourhoods near you." },
  { title: "Be the link", text: "Be the club's first point of contact on your campus for fans, societies and sports groups." },
];

export default async function CampusAmbassadorPage() {
  const photos = await getPagePhotos("campus-ambassador");
  return (
    <main className="px-6 py-16 sm:px-10 lg:px-16">
      <PageIntro
        eyebrow="Students"
        title="Campus Ambassador"
        photos={photos}
        intro="Love football and your campus? Represent Eko United FC at your institution, grow the Uga Boys family among students and help the club reach the next generation of supporters."
      >
        <a
          href="#apply"
          className="btn-glass btn-glass-yellow inline-block px-8 py-3.5 text-sm font-bold uppercase tracking-wide"
        >
          Apply to be an ambassador
        </a>
      </PageIntro>

      <section className="mb-16">
        <h2 data-reveal className="display-title font-display mb-8">
          What ambassadors do
        </h2>
        <ul data-reveal-stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {duties.map((d, i) => (
            <li key={d.title} className="rounded-2xl bg-navy/[0.04] p-6">
              <span className="font-display text-4xl font-bold leading-none text-cyan">{String(i + 1).padStart(2, "0")}</span>
              <p className="mt-3 font-display text-2xl font-bold text-navy">{d.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-navy/65">{d.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="apply" data-reveal className="scroll-mt-28 rounded-3xl bg-navy/[0.04] p-6 sm:p-10">
        <h2 className="display-title font-display mb-3">Your application</h2>
        <p className="mb-8 max-w-xl text-sm leading-relaxed text-navy/60">
          Open to students of any tertiary institution. Tell us a little about you and your campus.
        </p>
        <CampusAmbassadorForm />
      </section>
    </main>
  );
}
