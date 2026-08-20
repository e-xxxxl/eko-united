import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers",
  description: "Join the Eko United FC team — current opportunities at the club.",
};

export default function CareersPage() {
  return (
    <main className="px-6 py-16 sm:px-10 lg:px-16">
      <h1 className="display-title font-display mb-6">Join the Club</h1>
      <p className="max-w-2xl text-navy/70">
        We're always open to hearing from people who want to help build Eko
        United FC. Current openings will be listed here — check back soon,
        or reach out through our{" "}
        <a href="/contact" className="text-cyan underline underline-offset-4">
          contact page
        </a>
        .
      </p>
    </main>
  );
}
