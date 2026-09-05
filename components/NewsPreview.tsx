import Link from "next/link";
import { apiFetch } from "@/lib/api";
import type { DemoNews } from "@/lib/demoData";
import FramedImage from "@/components/FramedImage";

const categoryLabels: Record<DemoNews["category"], string> = {
  article: "Article",
  match_report: "Match Report",
  press_release: "Press Release",
};

async function getNews(): Promise<DemoNews[]> {
  const live = await apiFetch<DemoNews[]>("/news?limit=6", 600);
  // Skip index 0 — that's the lead story already showcased in the hero
  // carousel (see app/page.tsx). Showing it twice on the same page would
  // feel redundant rather than "more news."
  return (live || []).slice(1, 5);
}

function excerpt(body: string, len = 100) {
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

// A horizontally snap-scrolling card rail rather than a static grid — feels
// distinct from the hero above (full-bleed single story) and from the news
// list page's grid, and reads naturally on mobile as a swipeable strip
// instead of a cramped stack. Each card uses FramedImage so an unusually
// tall/wide cover photo is never awkwardly cropped.
export default async function NewsPreview() {
  const news = await getNews();
  if (news.length === 0) return null;

  return (
    <section className="border-t border-navy/10 py-16">
      <div className="mb-8 flex items-baseline justify-between px-6 sm:px-10 lg:px-16">
        <h2 className="font-display text-2xl text-navy sm:text-3xl">More From The Club</h2>
        <Link
          href="/news"
          className="text-sm font-semibold text-cyan transition-colors duration-200 ease-smooth hover:text-navy"
        >
          View all →
        </Link>
      </div>

      <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-2 sm:px-10 lg:gap-6 lg:px-16">
        {news.map((item) => (
          <Link
            key={item._id}
            href={`/news/${item.slug}`}
            className="group block w-[78vw] shrink-0 snap-start sm:w-[46vw] lg:w-[27vw] xl:w-[24vw]"
          >
            {item.coverImageUrl ? (
              <FramedImage
                src={item.coverImageUrl}
                alt={item.title}
                sizes="(min-width: 1280px) 24vw, (min-width: 1024px) 27vw, (min-width: 640px) 46vw, 78vw"
                className="aspect-[3/4] transition-transform duration-500 ease-smooth group-hover:scale-[1.02] sm:aspect-[4/3]"
              />
            ) : (
              <div className="aspect-[3/4] rounded-2xl bg-navy-light sm:aspect-[4/3]" />
            )}
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-cyan">
              {categoryLabels[item.category]} · {formatDate(item.publishedAt)}
            </p>
            <p className="mt-2 line-clamp-2 font-display text-lg leading-snug text-navy transition-colors duration-200 ease-smooth group-hover:text-cyan">
              {item.title}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-navy/50">{excerpt(item.body)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
