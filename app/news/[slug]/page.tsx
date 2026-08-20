import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";

type NewsItem = {
  _id: string;
  title: string;
  slug: string;
  body: string;
  coverImageUrl?: string;
  category: "article" | "match_report" | "press_release";
  author: string;
  publishedAt: string;
};

const categoryLabels: Record<NewsItem["category"], string> = {
  article: "Article",
  match_report: "Match Report",
  press_release: "Press Release",
};

async function getArticle(slug: string): Promise<NewsItem | null> {
  return apiFetch<NewsItem>(`/news/${slug}`, 600);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Article Not Found" };

  const description = article.body.slice(0, 155).trim() + (article.body.length > 155 ? "…" : "");

  return {
    title: article.title,
    description,
    openGraph: {
      type: "article",
      title: article.title,
      description,
      publishedTime: article.publishedAt,
      images: article.coverImageUrl
        ? [{ url: article.coverImageUrl, width: 1200, height: 630 }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
    },
  };
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    datePublished: article.publishedAt,
    author: { "@type": "Organization", name: article.author },
    image: article.coverImageUrl ? [article.coverImageUrl] : undefined,
    publisher: { "@type": "Organization", name: "Eko United FC" },
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {article.coverImageUrl && (
        <div className="relative aspect-video w-full bg-navy-light sm:aspect-[21/9]">
          <Image
            src={article.coverImageUrl}
            alt={article.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
      )}

      <article className="mx-auto max-w-3xl px-6 py-16 sm:px-10 lg:px-16">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-cyan">
          {categoryLabels[article.category]}
        </p>
        <h1 className="display-title font-display mt-3">{article.title}</h1>
        <p className="mt-4 text-sm text-navy/40">
          {article.author} ·{" "}
          {new Date(article.publishedAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "Africa/Lagos",
          })}
        </p>

        <div className="mt-10 space-y-5 text-base leading-relaxed text-navy/80">
          {article.body
            .split(/\n+/)
            .filter(Boolean)
            .map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
        </div>
      </article>
    </main>
  );
}
