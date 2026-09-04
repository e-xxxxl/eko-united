import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { demoNews, type DemoNews } from "@/lib/demoData";
import FramedImage from "@/components/FramedImage";

const categoryLabels: Record<DemoNews["category"], string> = {
  article: "Article",
  match_report: "Match Report",
  press_release: "Press Release",
};

async function getArticle(slug: string): Promise<DemoNews | null> {
  const live = await apiFetch<DemoNews>(`/news/${slug}`, 600);
  return live || demoNews.find((n) => n.slug === slug) || null;
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
  const url = `https://ekounitedfc.com/news/${article.slug}`;
  // Only claim a large-image card when there's a real image to show —
  // "summary_large_image" with no image renders as a broken/empty card on X.
  const hasImage = Boolean(article.coverImageUrl);

  return {
    title: article.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      siteName: "Eko United FC",
      title: article.title,
      description,
      url,
      publishedTime: article.publishedAt,
      images: hasImage ? [{ url: article.coverImageUrl!, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: hasImage ? "summary_large_image" : "summary",
      title: article.title,
      description,
    },
  };
}

// Interleaves the article's extra photos (article.images, uploaded separately
// from the cover in the admin News form) roughly every two paragraphs, so a
// long-form piece reads like a real editorial layout instead of one photo up
// top and a wall of text below. Any photos left over once the text runs out
// are appended at the end rather than dropped.
type ContentBlock = { type: "p"; text: string } | { type: "img"; src: string };

function buildContent(body: string, images: string[]): ContentBlock[] {
  const paragraphs = body.split(/\n+/).filter(Boolean);
  const blocks: ContentBlock[] = [];
  let imageIndex = 0;

  paragraphs.forEach((text, i) => {
    blocks.push({ type: "p", text });
    if ((i + 1) % 2 === 0 && imageIndex < images.length) {
      blocks.push({ type: "img", src: images[imageIndex] });
      imageIndex += 1;
    }
  });

  while (imageIndex < images.length) {
    blocks.push({ type: "img", src: images[imageIndex] });
    imageIndex += 1;
  }

  return blocks;
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

  const content = buildContent(article.body, article.images || []);

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {article.coverImageUrl && (
        <FramedImage
          src={article.coverImageUrl}
          alt={article.title}
          priority
          rounded={false}
          sizes="100vw"
          className="aspect-video w-full sm:aspect-[21/9]"
        />
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
          {content.map((block, i) =>
            block.type === "p" ? (
              <p key={i}>{block.text}</p>
            ) : (
              <FramedImage
                key={i}
                src={block.src}
                alt={`${article.title} — additional photo`}
                sizes="(min-width: 1024px) 62vw, 90vw"
                className="!my-8 aspect-[4/3]"
              />
            )
          )}
        </div>
      </article>
    </main>
  );
}
