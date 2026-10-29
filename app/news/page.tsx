import type { Metadata } from "next";
import { apiFetch } from "@/lib/api";
import type { DemoNews } from "@/lib/demoData";
import NewsBrowser from "@/components/NewsBrowser";
import { sectionMeta } from "@/lib/seo";

export const metadata: Metadata = sectionMeta("news");

async function getNews(): Promise<DemoNews[]> {
  return (await apiFetch<DemoNews[]>("/news?limit=50", 600)) || [];
}

export default async function NewsPage() {
  const news = await getNews();

  return (
    <main className="px-6 py-16 sm:px-10 lg:px-16">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Latest</p>
      <h1 className="display-title font-display mb-10">News</h1>

      {news.length === 0 ? (
        <p className="text-navy/50">Articles will appear here once published by the club.</p>
      ) : (
        <NewsBrowser news={news} />
      )}
    </main>
  );
}
