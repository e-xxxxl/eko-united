import type { Metadata } from "next";
import MediaAccreditationForm from "@/components/MediaAccreditationForm";
import PageIntro from "@/components/PageIntro";
import { getPagePhotos } from "@/lib/pagePhotos";

export const metadata: Metadata = {
  title: "Media Accreditation",
  description: "Request media accreditation to cover Eko United FC matches and events.",
};

const steps = [
  { title: "Tell us who you are", text: "Your outlet, your role and how to reach you." },
  { title: "Choose the match", text: "Say which match or event you would like to cover." },
  { title: "We reply directly", text: "The club's media team responds to every request." },
];

export default async function MediaAccreditationPage() {
  const photos = await getPagePhotos("media-accreditation");
  return (
    <main className="px-6 py-16 sm:px-10 lg:px-16">
      <PageIntro
        eyebrow="Press"
        title="Media Accreditation"
        photos={photos}
        intro="Journalists, photographers and broadcasters covering Eko United FC can request accreditation below. Include the match(es) you are interested in and any relevant details, and the club will respond directly."
      >
        <a
          href="#request"
          className="btn-glass btn-glass-yellow inline-block px-8 py-3.5 text-sm font-bold uppercase tracking-wide"
        >
          Request accreditation
        </a>
      </PageIntro>

      <ol data-reveal-stagger className="mb-16 grid gap-4 md:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.title} className="flex gap-5 rounded-2xl bg-navy/[0.04] p-6">
            <span className="font-display text-5xl font-bold leading-none text-cyan">{i + 1}</span>
            <div>
              <p className="font-display text-xl font-bold text-navy">{s.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-navy/65">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <section id="request" data-reveal className="scroll-mt-28 rounded-3xl bg-navy/[0.04] p-6 sm:p-10">
        <h2 className="display-title font-display mb-8">Your request</h2>
        <MediaAccreditationForm />
      </section>
    </main>
  );
}
