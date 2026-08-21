import type { Metadata } from "next";
import { apiFetch } from "@/lib/api";
import { demoHistory, type DemoMilestone } from "@/lib/demoData";

export const metadata: Metadata = {
  title: "Club History",
  description: "The story of Eko United FC, from founding to today.",
};

async function getHistory(): Promise<DemoMilestone[]> {
  const live = await apiFetch<DemoMilestone[]>("/history", 3600);
  return live && live.length > 0 ? live : demoHistory;
}

export default async function ClubHistoryPage() {
  const milestones = await getHistory();

  return (
    <main className="px-6 py-16 sm:px-10 lg:px-16">
      <h1 className="display-title font-display mb-2">Club History</h1>
      <p className="mb-12 text-navy/50">The story of The Uga Boys.</p>

      {milestones.length === 0 ? (
        <p className="text-navy/50">The club's history will appear here once added.</p>
      ) : (
        <ol className="relative space-y-10 border-l border-navy/15 pl-8">
          {milestones.map((m) => (
            <li key={m._id} className="relative">
              <span className="absolute -left-[calc(2rem+5px)] top-1 h-2.5 w-2.5 rounded-full bg-cyan" />
              <p className="font-display text-2xl text-cyan">{m.year}</p>
              <p className="mt-1 text-lg font-semibold text-navy">{m.title}</p>
              {m.description && (
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-navy/70">
                  {m.description}
                </p>
              )}
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
