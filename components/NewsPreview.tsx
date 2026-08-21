import Link from "next/link";
import Image from "next/image";
import { apiFetch } from "@/lib/api";
import { demoNews, type DemoNews } from "@/lib/demoData";

const categoryLabels: Record<DemoNews["category"], string> = {
  article: "Article",
  match_report: "Match Report",
  press_release: "Press Release",
};

async function getNews(): Promise<DemoNews[]> {
  const live = await apiFetch<DemoNews[]>("/news?limit=4", 600);
  return (live && live.length > 0 ? live : demoNews).slice(0, 4);
}

function excerpt(body: string, len = 110) {
  const clean = body.split(/\n+/)[0];
  return clean.length > len ? clean.slice(0, len).trim() + "…" : clean;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "Africa/Lagos",
  });
}

// One large featured story (image, category, excerpt, date) plus three
// smaller stacked stories beside it — not a flat grid of identical tiles.
export default async function NewsPreview() {
  const news = await getNews();
  if (news.length === 0) return null;
  const [featured, ...rest] = news;

  return (
    <section className="border-t border-navy/10 px-6 py-16 sm:px-10 lg:px-16">
      <div className="mb-8 flex items-baseline justify-between">
        <h2 className="font-display text-2xl text-navy sm:text-3xl">Latest News</h2>
        <Link
          href="/news"
          className="text-sm font-semibold text-cyan transition-colors duration-200 ease-smooth hover:text-navy"
        >
          View more →
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-5 lg:gap-10">
        <Link href={`/news/${featured.slug}`} className="group block lg:col-span-3">
          <div className="relative aspect-[16/10] overflow-hidden bg-navy-light">
            {featured.coverImageUrl && (
              <Image
                src={featured.coverImageUrl}
                alt={featured.title}
                fill
                priority
                sizes="(min-width: 1024px) 55vw, 90vw"
                className="object-cover transition-transform duration-500 ease-smooth group-hover:scale-105"
              />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-dark/90 via-navy-dark/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-cyan">
                {categoryLabels[featured.category]}
              </p>
              <p className="font-display mt-2 text-2xl leading-tight text-white sm:text-3xl">
                {featured.title}
              </p>
              <p className="mt-2 max-w-lg text-sm text-white/70">{excerpt(featured.body, 140)}</p>
              <p className="mt-3 text-xs text-white/50">{formatDate(featured.publishedAt)}</p>
            </div>
          </div>
        </Link>

        <div className="flex flex-col divide-y divide-navy/10 lg:col-span-2">
          {rest.map((item) => (
            <Link key={item._id} href={`/news/${item.slug}`} className="group flex gap-4 py-4 first:pt-0">
              <div className="relative aspect-square w-20 shrink-0 overflow-hidden bg-navy-light sm:w-24">
                {item.coverImageUrl && (
                  <Image
                    src={item.coverImageUrl}
                    alt={item.title}
                    fill
                    sizes="96px"
                    className="object-cover transition-transform duration-500 ease-smooth group-hover:scale-105"
                  />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan">
                  {categoryLabels[item.category]}
                </p>
                <p className="mt-1 text-sm font-medium leading-snug text-navy group-hover:text-cyan">
                  {item.title}
                </p>
                <p className="mt-1 text-xs text-navy/40">{formatDate(item.publishedAt)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
