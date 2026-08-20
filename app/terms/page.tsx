import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
};

export default function TermsPage() {
  return (
    <main className="px-6 py-16 sm:px-10 lg:px-16">
      <h1 className="display-title font-display mb-6">Terms & Conditions</h1>
      {/*
        PLACEHOLDER — this site sells tickets and merchandise, so real terms
        (refund policy, ticket resale rules, shipping/returns for shop orders)
        need to be drafted before launch, not left as boilerplate.
      */}
      <p className="max-w-2xl text-navy/70">
        Terms & conditions to be added by the club before launch, covering
        ticket sales and merchandise orders.
      </p>
    </main>
  );
}
