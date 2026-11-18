import type { Metadata } from "next";
import Image from "next/image";
import { apiFetch } from "@/lib/api";
import type { DemoTrophy } from "@/lib/demoData";
import { isAllowedImageUrl } from "@/lib/imageHosts";
import PageIntro from "@/components/PageIntro";
import { getPagePhotos } from "@/lib/pagePhotos";
import { sectionMeta } from "@/lib/seo";

export const metadata: Metadata = sectionMeta("trophies");

async function getTrophies(): Promise<DemoTrophy[]> {
  return (await apiFetch<DemoTrophy[]>("/trophies", 3600)) || [];
}

export default async function TrophiesPage() {
  const trophies = await getTrophies();

  return (
    <main className="px-6 py-16 sm:px-10 lg:px-16">
      <PageIntro
        eyebrow="Honours"
        title="Trophy Cabinet"
        intro="Honours won by Eko United FC."
        photos={await getPagePhotos("trophies")}
      />

      {trophies.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-navy/15 px-6 py-16 text-center text-navy/50">Silverware will appear here once added by the club.</p>
      ) : (
        <div data-reveal-stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trophies.map((t) => (
            <article
              key={t._id}
              className="group relative flex flex-col overflow-hidden rounded-3xl bg-navy-dark text-white shadow-[0_24px_50px_-28px_rgba(6,23,51,0.7)] transition-transform duration-500 ease-smooth hover:-translate-y-1"
            >
              <span aria-hidden className="pointer-events-none absolute -right-2 -top-6 select-none font-display text-[8rem] leading-none text-white/[0.06]">
                {t.year}
              </span>
              <div className="relative flex h-56 items-center justify-center bg-[radial-gradient(55%_70%_at_50%_45%,rgba(101,203,233,0.35),transparent_72%)]">
                <span aria-hidden className="absolute bottom-0 h-3 w-2/3 rounded-[50%] bg-black/40 blur-md" />
                {isAllowedImageUrl(t.imageUrl) ? (
                  <Image
                    src={t.imageUrl}
                    alt={t.name}
                    width={220}
                    height={220}
                    className="relative h-40 w-40 object-contain drop-shadow-[0_16px_24px_rgba(0,0,0,0.45)] transition-transform duration-500 ease-smooth group-hover:scale-110"
                  />
                ) : (
                  <span aria-hidden className="relative flex h-28 w-28 items-center justify-center rounded-full border border-white/15 font-display text-5xl text-cyan/70">
                    {t.timesWon > 1 ? t.timesWon : "1"}
                  </span>
                )}
              </div>
              <div className="relative flex flex-1 flex-col border-t border-white/10 p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan">
                  {t.competition || "Honour"} · {t.year}
                </p>
                <h2 className="mt-2 font-display text-3xl uppercase leading-none">{t.name}</h2>
                {t.description && <p className="mt-3 text-sm leading-relaxed text-white/60">{t.description}</p>}
                {t.timesWon > 1 && (
                  <p className="mt-auto pt-5">
                    <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white/80">Won {t.timesWon} times</span>
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
