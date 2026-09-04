import type { Metadata } from "next";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { demoNews, type DemoNews } from "@/lib/demoData";
import FramedImage from "@/components/FramedImage";

export const metadata: Metadata = {
  title: "News",
  description: "The latest news, match reports and press releases from Eko United FC.",
};

const categoryLabels: Record<DemoNews["category"], string> = {
  article: "Article",
  match_report: "Match Report",
  press_release: "Press Release",
};

async function getNews(): Promise<DemoNews[]> {
  const live = await apiFetch<DemoNews[]>("/news?limit=30", 600);
  const real = live || [];
  // Unlike the homepage sections (fixed small counts, use fillWithDemo),
  // this page shows every real article there is — never truncated — and
  // only pads with demo stories if the club hasn't published enough yet to
  // fill out a normal-looking grid.
  if (real.length >= demoNews.length) return real;
  return [...real, ...demoNews.slice(real.length)];
}

export default async function NewsPage() {
  const news = await getNews();

  return (
    <main className="px-6 py-16 sm:px-10 lg:px-16">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-cyan">
        Latest
      </p>
      <h1 className="display-title font-display mb-10">News</h1>

      {news.length === 0 ? (
        <p className="text-navy/50">Articles will appear here once published by the club.</p>
      ) : (
        <div className="grid gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {news.map((item, i) => {
            const featured = i === 0;
            return (
              <Link
                key={item._id}
                href={`/news/${item.slug}`}
                className={`group block ${featured ? "sm:col-span-2 lg:col-span-2" : ""}`}
              >
                {item.coverImageUrl ? (
                  <FramedImage
                    src={item.coverImageUrl}
                    alt={item.title}
                    sizes={
                      featured
                        ? "(min-width: 1024px) 62vw, 90vw"
                        : "(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                    }
                    className={`transition-transform duration-500 ease-smooth group-hover:scale-[1.02] ${featured ? "aspect-[21/9]" : "aspect-video"}`}
                  />
                ) : (
                  <div className={`rounded-2xl bg-navy-light ${featured ? "aspect-[21/9]" : "aspect-video"}`} />
                )}
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.15em] text-cyan">
                  {categoryLabels[item.category]}
                </p>
                <p
                  className={`mt-2 font-medium leading-snug text-navy group-hover:text-cyan ${featured ? "text-xl" : "text-base"}`}
                >
                  {item.title}
                </p>
                <p className="mt-2 text-xs text-navy/40">
                  {new Date(item.publishedAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    timeZone: "Africa/Lagos",
                  })}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
