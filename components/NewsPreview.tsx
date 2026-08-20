import Link from "next/link";
import Image from "next/image";
import { apiFetch } from "@/lib/api";

type NewsItem = { _id: string; slug: string; title: string; coverImageUrl?: string };

// Demo articles with Unsplash stock photography — swap for real match/press
// photos (via Cloudinary) once articles are published from the admin panel.
const demoNews: NewsItem[] = [
  {
    _id: "n1",
    slug: "preseason-report",
    title: "Preseason report: The Uga Boys ready for the new campaign",
    coverImageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=900&q=80&fit=crop&auto=format",
  },
  {
    _id: "n2",
    slug: "new-signing",
    title: "Club announces new signing ahead of matchday one",
    coverImageUrl: "https://images.unsplash.com/photo-1626248801379-51a0748a5f96?w=900&q=80&fit=crop&auto=format",
  },
  {
    _id: "n3",
    slug: "stadium-upgrade",
    title: "Stadium upgrades completed ahead of the new season",
    coverImageUrl: "https://images.unsplash.com/photo-1611000273610-f4fb9c7fd0be?w=900&q=80&fit=crop&auto=format",
  },
];

async function getNews(): Promise<NewsItem[]> {
  const live = await apiFetch<NewsItem[]>("/news?limit=3", 600);
  return live && live.length > 0 ? live : demoNews;
}

export default async function NewsPreview() {
  const news = await getNews();

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
      <div className="grid gap-x-4 gap-y-10 sm:grid-cols-3">
        {news.map((item) => (
          <Link key={item._id} href={`/news/${item.slug}`} className="group block">
            <div className="relative aspect-video overflow-hidden bg-navy-light">
              {item.coverImageUrl ? (
                <Image
                  src={item.coverImageUrl}
                  alt={item.title}
                  fill
                  sizes="(min-width: 640px) 30vw, 90vw"
                  className="object-cover transition-transform duration-500 ease-smooth group-hover:scale-105"
                />
              ) : null}
            </div>
            <p className="mt-4 text-sm font-medium leading-snug text-navy group-hover:text-cyan">
              {item.title}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
