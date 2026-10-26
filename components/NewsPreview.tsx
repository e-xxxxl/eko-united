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
  // The newest stories first, the very latest included. The hero rotates
  // through the latest few, so a visitor who lands mid-rotation would
  // otherwise never see the newest story in this section at all.
  return (Array.isArray(live) ? live : []).slice(0, 5);
}

function excerpt(item: DemoNews, len = 170) {
  const first = (item.blocks?.find((b) => b.kind === "paragraph")?.text || item.body.split(/\n+/)[0] || "").trim();
  return first.length > len ? first.slice(0, len).trim() + "…" : first;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Lagos",
  });
}

function readMinutes(item: DemoNews) {
  return Math.max(1, Math.round(item.body.split(/\s+/).length / 200));
}

function Meta({ item }: { item: DemoNews }) {
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.15em]">
      <span className="text-cyan">{categoryLabels[item.category]}</span>
      <span className="text-navy/40">{formatDate(item.publishedAt)}</span>
      <span className="hidden text-navy/40 sm:inline">{readMinutes(item)} min read</span>
    </p>
  );
}

// A standard blog front: the newest story large on the left (photo, type,
// date, headline, excerpt), and the next few as a tidy list on the right
// (small photo beside type, date and headline). On a phone it is the large
// story first, then the list underneath.
export default async function NewsPreview() {
  const news = await getNews();
  if (news.length === 0) return null;

  const [lead, ...rest] = news;

  return (
    <section className="border-t border-navy/10 px-6 py-16 sm:px-10 lg:px-16">
      <div data-reveal className="mb-8 flex items-baseline justify-between gap-x-4">
        <h2 className="font-display text-2xl text-navy sm:text-3xl">More From The Club</h2>
        <Link
          href="/news"
          className="shrink-0 whitespace-nowrap text-sm font-semibold text-cyan transition-colors duration-200 ease-smooth hover:text-navy"
        >
          View all →
        </Link>
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-14">
        <Link href={`/news/${lead.slug}`} data-reveal className="group block">
          {lead.coverImageUrl ? (
            <FramedImage
              src={lead.heroImageUrl || lead.coverImageUrl}
              alt={lead.title}
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="aspect-[4/3] transition-transform duration-500 ease-smooth group-hover:scale-[1.01] sm:aspect-[16/10]"
            />
          ) : (
            <div className="aspect-[16/10] rounded-2xl bg-navy/[0.06]" />
          )}
          <div className="mt-5">
            <Meta item={lead} />
            <p className="mt-3 line-clamp-3 font-display text-3xl leading-[1.05] text-navy transition-colors duration-200 ease-smooth group-hover:text-cyan sm:text-4xl">
              {lead.title}
            </p>
            <p className="mt-3 line-clamp-3 max-w-2xl text-base leading-relaxed text-navy/60">{excerpt(lead)}</p>
            <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-navy transition-transform duration-300 ease-smooth group-hover:translate-x-1">
              Continue reading <span aria-hidden>→</span>
            </span>
          </div>
        </Link>

        {rest.length > 0 && (
          <div data-reveal-stagger className="flex flex-col divide-y divide-navy/10 border-y border-navy/10">
            {rest.map((item) => (
              <Link key={item._id} href={`/news/${item.slug}`} className="group flex gap-4 py-5 first:pt-5 sm:gap-5">
                {item.coverImageUrl ? (
                  <FramedImage
                    src={item.coverImageUrl}
                    alt={item.title}
                    sizes="160px"
                    rounded
                    className="aspect-[4/3] w-28 shrink-0 rounded-xl sm:w-40"
                  />
                ) : (
                  <div className="aspect-[4/3] w-28 shrink-0 rounded-xl bg-navy/[0.06] sm:w-40" />
                )}
                <div className="min-w-0 flex-1">
                  <Meta item={item} />
                  <p className="mt-2 line-clamp-3 font-display text-xl leading-snug text-navy transition-colors duration-200 ease-smooth group-hover:text-cyan sm:text-2xl">
                    {item.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
