import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="px-6 py-16 sm:px-10 lg:px-16">
      <h1 className="display-title font-display mb-6">Privacy Policy</h1>
      {/*
        PLACEHOLDER — this page collects personal data (ticket buyers, shop
        customers, contact form, fan registration) so it needs a real privacy
        policy, ideally reviewed by someone with Nigerian data-protection
        (NDPA) knowledge, not generic boilerplate. Do not launch with this
        placeholder still in place.
      */}
      <p className="max-w-2xl text-navy/70">
        Privacy policy content to be added by the club before launch.
      </p>
    </main>
  );
}
