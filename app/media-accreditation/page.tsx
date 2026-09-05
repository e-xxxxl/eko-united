import type { Metadata } from "next";
import MediaAccreditationForm from "@/components/MediaAccreditationForm";

export const metadata: Metadata = {
  title: "Media Accreditation",
  description: "Request media accreditation to cover Eko United FC matches and events.",
};

export default function MediaAccreditationPage() {
  return (
    <main className="px-6 py-16 sm:px-10 lg:px-16">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Press</p>
      <h1 className="display-title font-display mb-6">Media Accreditation</h1>
      <p className="mb-10 max-w-xl text-base leading-relaxed text-navy/70">
        Journalists, photographers and broadcasters covering Eko United FC can request
        accreditation below. Include the match(es) you're interested in and any relevant
        details — the club will respond directly.
      </p>
      <MediaAccreditationForm />
    </main>
  );
}
