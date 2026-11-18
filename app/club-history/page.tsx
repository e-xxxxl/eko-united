import type { Metadata } from "next";
import { apiFetch } from "@/lib/api";
import type { DemoMilestone } from "@/lib/demoData";
import PageIntro from "@/components/PageIntro";
import { getPagePhotos } from "@/lib/pagePhotos";
import { sectionMeta } from "@/lib/seo";

export const metadata: Metadata = sectionMeta("clubHistory");

async function getHistory(): Promise<DemoMilestone[]> {
  return (await apiFetch<DemoMilestone[]>("/history", 3600)) || [];
}

export default async function ClubHistoryPage() {
  const milestones = await getHistory();

  return (
    <main className="px-6 py-16 sm:px-10 lg:px-16">
      <PageIntro
        eyebrow="Our story"
        title="Club History"
        intro="The story of The Uga Boys."
        photos={await getPagePhotos("club-history")}
      />

      {milestones.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-navy/15 px-6 py-16 text-center text-navy/50">The club&apos;s history will appear here once added.</p>
      ) : (
        <ol data-reveal-stagger className="relative mx-auto max-w-5xl">
          <span aria-hidden className="absolute bottom-0 left-5 top-0 w-px bg-gradient-to-b from-cyan via-navy/15 to-transparent lg:left-1/2" />
          {milestones.map((m, i) => (
            <li key={m._id} className="relative pb-12 pl-14 last:pb-0 lg:grid lg:grid-cols-2 lg:gap-16 lg:pl-0">
              <span aria-hidden className="absolute left-5 top-3 z-10 h-4 w-4 -translate-x-1/2 rounded-full border-4 border-white bg-cyan shadow-[0_0_0_2px_#65CBE9] lg:left-1/2" />
              <div className={i % 2 === 0 ? "lg:col-start-1 lg:text-right" : "lg:col-start-2"}>
                <p className="font-display text-7xl leading-none text-transparent [-webkit-text-stroke:1.5px_#0A244D] sm:text-8xl">{m.year}</p>
                <div className="mt-3 rounded-2xl border border-navy/10 bg-white p-5 shadow-[0_18px_40px_-30px_rgba(10,36,77,0.5)]">
                  <h2 className="font-display text-2xl uppercase text-navy">{m.title}</h2>
                  {m.description && <p className="mt-2 text-sm leading-relaxed text-navy/65">{m.description}</p>}
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
