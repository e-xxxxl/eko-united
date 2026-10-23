import type { Metadata } from "next";
import MembershipPlans from "@/components/MembershipPlans";
import { comparison, tiers } from "@/lib/membership";

export const metadata: Metadata = {
  title: "Club Membership",
  description:
    "Join Eko United FC as a Gold, Diamond or Platinum member, or partner with the club as a Platinum Corporate sponsor. See every package and its perks, and apply online.",
};

export default function MembershipPage() {
  return (
    <main className="px-6 py-16 sm:px-10 lg:px-16">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Official Membership</p>
      <h1 className="display-title font-display mb-6">Be part of The Uga Boys</h1>
      <p className="mb-14 max-w-2xl text-base leading-relaxed text-navy/70 sm:text-lg">
        From your own seat on matchday to your name on the club's Founders Wall, there is a membership
        package for every kind of supporter and every kind of partner. Choose yours below and apply in
        a minute.
      </p>

      <MembershipPlans />

      <section className="mt-24 hidden md:block">
        <h2 data-reveal className="display-title font-display mb-8">Compare the packages</h2>
        <div data-reveal className="overflow-hidden rounded-2xl ring-1 ring-navy/10">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">Membership packages compared</caption>
            <thead>
              <tr className="bg-navy-dark text-white">
                <th scope="col" className="w-[20%] px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                  Benefit
                </th>
                {tiers.map((t) => (
                  <th key={t.id} scope="col" className="px-4 py-4 font-display text-xl font-normal">
                    {t.name}
                    <span className="mt-1 block text-xs font-semibold tracking-wide text-cyan">{t.price}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparison.map((row, i) => (
                <tr key={row.feature} className={i % 2 === 0 ? "bg-navy/[0.03]" : "bg-white"}>
                  <th scope="row" className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-navy/60">
                    {row.feature}
                  </th>
                  {row.values.map((value, j) => (
                    <td key={j} className="px-4 py-4 text-navy/80">
                      {value ?? <span className="text-navy/25" aria-label="Not included">Not included</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
