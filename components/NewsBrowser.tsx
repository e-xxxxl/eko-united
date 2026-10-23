"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import FramedImage from "@/components/FramedImage";
import type { DemoNews } from "@/lib/demoData";

type Category = DemoNews["category"];

const categoryLabels: Record<Category, string> = {
  article: "Article",
  match_report: "Match Report",
  press_release: "Press Release",
};

const filters: { key: "all" | Category; label: string }[] = [
  { key: "all", label: "All" },
  { key: "article", label: "Articles" },
  { key: "match_report", label: "Match Reports" },
  { key: "press_release", label: "Press Releases" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Lagos",
  });
}

function excerpt(item: DemoNews, len = 150) {
  const first = (item.blocks?.find((b) => b.kind === "paragraph")?.text || item.body.split(/\n+/)[0] || "").trim();
  return first.length > len ? first.slice(0, len).trim() + "…" : first;
}

function readMinutes(item: DemoNews) {
  return Math.max(1, Math.round(item.body.split(/\s+/).length / 200));
}

function Chip({ category, onImage = false }: { category: Category; onImage?: boolean }) {
  return (
    <span
      className={clsx(
        "inline-block rounded-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
        onImage ? "bg-white/15 text-white ring-1 ring-white/30 backdrop-blur-md" : "bg-cyan/20 text-navy"
      )}
    >
      {categoryLabels[category]}
    </span>
  );
}

// The news landing page: the newest story as a full-width image-led feature,
// then a clean grid of the rest, with a filter by type. Photos fill their
// frames edge to edge; nothing sits behind or around them.
export default function NewsBrowser({ news }: { news: DemoNews[] }) {
  const [filter, setFilter] = useState<"all" | Category>("all");
  const shown = useMemo(() => (filter === "all" ? news : news.filter((n) => n.category === filter)), [news, filter]);
  const [featured, ...rest] = shown;

  return (
    <div>
      <div className="mb-8 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter news">
        {filters.map((f) => {
          const count = f.key === "all" ? news.length : news.filter((n) => n.category === f.key).length;
          if (f.key !== "all" && count === 0) return null;
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(f.key)}
              className={clsx(
                "shrink-0 rounded-xl px-4 py-2.5 text-xs font-semibold uppercase tracking-wide transition-all duration-300 ease-smooth",
                active
                  ? "bg-navy text-white shadow-[0_8px_18px_-10px_rgba(10,36,77,0.7)]"
                  : "bg-navy/[0.05] text-navy/60 hover:bg-navy/10 hover:text-navy"
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {!featured ? (
        <p className="text-navy/50">Nothing in this section yet.</p>
      ) : (
        <>
          <Link
            key={featured._id}
            href={`/news/${featured.slug}`}
            data-reveal
            className="group relative block overflow-hidden rounded-2xl bg-navy-dark"
          >
            <div className="relative aspect-[4/5] sm:aspect-[16/8]">
              {featured.coverImageUrl ? (
                <FramedImage
                  src={featured.heroImageUrl || featured.coverImageUrl}
                  alt={featured.title}
                  sizes="(min-width: 1024px) 90vw, 100vw"
                  rounded={false}
                  fill
                  priority
                  className="transition-transform duration-[900ms] ease-smooth group-hover:scale-[1.03]"
                />
              ) : null}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/35 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-9 lg:p-12">
                <div className="flex flex-wrap items-center gap-3">
                  <Chip category={featured.category} onImage />
                  <span className="text-xs font-semibold uppercase tracking-wide text-white/70">
                    {formatDate(featured.publishedAt)} · {readMinutes(featured)} min read
                  </span>
                </div>
                <p className="mt-4 line-clamp-3 max-w-3xl font-display text-3xl leading-[1.02] text-white sm:text-5xl lg:text-6xl">
                  {featured.title}
                </p>
                <p className="mt-4 hidden max-w-2xl text-base leading-relaxed text-white/75 sm:line-clamp-2 sm:block">
                  {excerpt(featured, 200)}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-cyan transition-transform duration-300 ease-smooth group-hover:translate-x-1">
                  Read the story <span aria-hidden>→</span>
                </span>
              </div>
            </div>
          </Link>

          {rest.length > 0 && (
            <div data-reveal-stagger className="mt-10 grid gap-x-6 gap-y-11 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((item) => (
                <Link key={item._id} href={`/news/${item.slug}`} className="group block">
                  {item.coverImageUrl ? (
                    <FramedImage
                      src={item.coverImageUrl}
                      alt={item.title}
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                      className="aspect-[4/3] transition-transform duration-500 ease-smooth group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="aspect-[4/3] rounded-2xl bg-navy-light" />
                  )}
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Chip category={item.category} />
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-navy/40">
                      {formatDate(item.publishedAt)}
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-3 font-display text-2xl leading-tight text-navy transition-colors duration-200 ease-smooth group-hover:text-cyan">
                    {item.title}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-navy/55">{excerpt(item)}</p>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
