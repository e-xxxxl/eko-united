import type { Metadata } from "next";
import VolunteerForm from "@/components/VolunteerForm";
import PageIntro from "@/components/PageIntro";
import { getPagePhotos } from "@/lib/pagePhotos";

export const metadata: Metadata = {
  title: "Volunteer",
  description: "Volunteer with Eko United FC: matchday support, community outreach, media, youth and events.",
};

const ways = [
  { title: "Matchday support", text: "Welcome supporters, help with stewarding and make home games run smoothly." },
  { title: "Community outreach", text: "Take the club into schools, estates and community events across Lagos." },
  { title: "Media and content", text: "Photograph, film and write the club's story on matchdays and beyond." },
  { title: "Youth and academy", text: "Support young players with training days, equipment and mentoring." },
  { title: "Fundraising and events", text: "Help plan and run the club's fan days, drives and special occasions." },
  { title: "Something else", text: "Have a skill that could help the club? Tell us and we will find a place for it." },
];

export default async function VolunteerPage() {
  const photos = await getPagePhotos("volunteer");
  return (
    <main className="px-6 py-16 sm:px-10 lg:px-16">
      <PageIntro
        eyebrow="Get involved"
        title="Volunteer With Us"
        photos={photos}
        intro="Eko United is built by the people around it. Give a few hours on matchdays, in the community or behind the scenes, and be part of The Uga Boys."
      >
        <a
          href="#apply"
          className="btn-glass btn-glass-yellow inline-block px-8 py-3.5 text-sm font-bold uppercase tracking-wide"
        >
          Apply to volunteer
        </a>
      </PageIntro>

      <section className="mb-16">
        <h2 data-reveal className="display-title font-display mb-8">
          Ways to help
        </h2>
        <ul data-reveal-stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ways.map((w, i) => (
            <li key={w.title} className="rounded-2xl bg-navy/[0.04] p-6">
              <span className="font-display text-4xl font-bold leading-none text-cyan">{String(i + 1).padStart(2, "0")}</span>
              <p className="mt-3 font-display text-2xl font-bold text-navy">{w.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-navy/65">{w.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="apply" data-reveal className="scroll-mt-28 rounded-3xl bg-navy/[0.04] p-6 sm:p-10">
        <h2 className="display-title font-display mb-8">Your application</h2>
        <VolunteerForm />
      </section>
    </main>
  );
}
