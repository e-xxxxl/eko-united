import type { Metadata } from "next";
import Image from "next/image";
import { apiFetch } from "@/lib/api";
import { demoTrophies, type DemoTrophy } from "@/lib/demoData";

export const metadata: Metadata = {
  title: "Trophy Cabinet",
  description: "Honours and silverware won by Eko United FC.",
};

async function getTrophies(): Promise<DemoTrophy[]> {
  const live = await apiFetch<DemoTrophy[]>("/trophies", 3600);
  return live && live.length > 0 ? live : demoTrophies;
}

export default async function TrophiesPage() {
  const trophies = await getTrophies();

  return (
    <main className="px-6 py-16 sm:px-10 lg:px-16">
      <h1 className="display-title font-display mb-2">Trophy Cabinet</h1>
      <p className="mb-10 text-navy/50">Honours won by Eko United FC.</p>

      {trophies.length === 0 ? (
        <p className="text-navy/50">Silverware will appear here once added by the club.</p>
      ) : (
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {trophies.map((t) => (
            <div key={t._id} className="border-t-2 border-navy/10 pt-6">
              {t.imageUrl ? (
                <Image
                  src={t.imageUrl}
                  alt={t.name}
                  width={56}
                  height={56}
                  className="mb-4 h-14 w-14 object-contain"
                />
              ) : (
                <div className="mb-4 h-14 w-14 rounded-full bg-navy/10" aria-hidden />
              )}
              <p className="font-display text-lg">{t.name}</p>
              <p className="mt-1 text-sm text-navy/50">
                {t.competition} · {t.year}
                {t.timesWon > 1 ? ` · Won ${t.timesWon}×` : ""}
              </p>
              {t.description && (
                <p className="mt-3 text-sm leading-relaxed text-navy/70">{t.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
