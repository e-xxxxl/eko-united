import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { DemoNews, NewsBlock } from "@/lib/demoData";
import FramedImage from "@/components/FramedImage";
import LightboxTrigger, { type LightboxPhoto } from "@/components/Lightbox";
import ShareLinks from "@/components/ShareLinks";
import SocialsSection from "@/components/SocialsSection";

const categoryLabels: Record<DemoNews["category"], string> = {
  article: "Article",
  match_report: "Match Report",
  press_release: "Press Release",
};

async function getArticle(slug: string): Promise<DemoNews | null> {
  return await apiFetch<DemoNews>(`/news/${slug}`, 600);
}

async function getRelatedNews(excludeSlug: string): Promise<DemoNews[]> {
  const live = await apiFetch<DemoNews[]>("/news?limit=6", 600);
  return (live || []).filter((n) => n.slug !== excludeSlug).slice(0, 3);
}

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "Africa/Lagos",
  });
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
      // No manual `images` here — opengraph-image.tsx in this same route
      // folder generates the actual card (always a correctly-cropped
      // 1200x630, regardless of the cover photo's real shape) and Next
      // wires it in automatically. Pointing platforms at the raw uploaded
      // photo directly was the cause of X rendering an odd "rectangle"
      // instead of a standard card — X uses the source image's real aspect
      // ratio verbatim, and an admin-uploaded photo can be any shape.
    },
    twitter: {
      card: "summary_large_image",
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
function buildContent(body: string, images: string[]): NewsBlock[] {
  const paragraphs = body.split(/\n+/).filter(Boolean);
  const blocks: NewsBlock[] = [];
  let imageIndex = 0;

  paragraphs.forEach((text, i) => {
    blocks.push({ kind: "paragraph", text });
    if ((i + 1) % 2 === 0 && imageIndex < images.length) {
      blocks.push({ kind: "image", url: images[imageIndex] });
      imageIndex += 1;
    }
  });

  while (imageIndex < images.length) {
    blocks.push({ kind: "image", url: images[imageIndex] });
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

  const related = await getRelatedNews(slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    datePublished: article.publishedAt,
    author: { "@type": "Organization", name: article.author },
    image: article.coverImageUrl ? [article.coverImageUrl] : undefined,
    publisher: { "@type": "Organization", name: "Eko United FC" },
  };

  // Articles built in the block editor carry their own ordered blocks; older
  // ones are laid out from the plain body plus loose photos as before.
  const content: NewsBlock[] = article.blocks?.length
    ? article.blocks
    : buildContent(article.body, article.images || []);
  const shareUrl = `https://ekounitedfc.com/news/${article.slug}`;
  const words = content.reduce((n, b) => n + (b.kind === "paragraph" ? (b.text || "").split(/\s+/).length : 0), 0);
  const readMinutes = Math.max(1, Math.round(words / 200));
  const firstParagraph = content.findIndex((b) => b.kind === "paragraph");

  // Every photo in the story, in reading order, so the viewer can step through them.
  const viewerPhotos: LightboxPhoto[] = [
    ...(article.coverImageUrl ? [{ src: article.coverImageUrl, alt: article.title }] : []),
    ...content.flatMap((b) =>
      b.kind === "image" && b.url ? [{ src: b.url, alt: b.caption || `${article.title}, photo`, caption: b.caption }] : []
    ),
  ];
  let inlinePhoto = article.coverImageUrl ? 0 : -1;

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {article.coverImageUrl && (
        // Full-bleed cover fill (not the contain+blur FramedImage treatment
        // used for in-body photos below) — the header should read as a bold,
        // edge-to-edge banner, same idea as the player profile photo, not a
        // smaller image floating on a padded backdrop. 4:5 on mobile was
        // already right; 21/9 on desktop was the actual problem — that's an
        // ultra-panoramic ratio that slices away most of a normal landscape
        // photo's height. 16:9 is a much more moderate, standard banner crop.
        <div data-reveal-skip className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-video">
          <LightboxTrigger photos={viewerPhotos} index={0} label="Enlarge cover photo" className="absolute inset-0 h-full">
            <Image
              src={article.coverImageUrl}
              alt={article.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </LightboxTrigger>
        </div>
      )}

      <article className="px-6 py-14 sm:px-10 sm:py-20 lg:px-16">
        <div className="mx-auto grid max-w-5xl gap-x-14 lg:grid-cols-[2.75rem_minmax(0,1fr)]">
          {/* Share rail: sticks beside the story on desktop so the options
              are always one click away while reading. Phones get the same
              icons in a row under the byline and again at the end. */}
          <aside className="hidden lg:block" aria-label="Share this story">
            <div className="sticky top-32">
              <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-navy/40">
                Share
              </p>
              <ShareLinks url={shareUrl} title={article.title} vertical />
            </div>
          </aside>

          <div className="min-w-0 max-w-3xl">
            <header>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-md bg-cyan/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-navy">
                  {categoryLabels[article.category]}
                </span>
                <span className="text-xs font-medium uppercase tracking-wide text-navy/45">
                  {readMinutes} min read
                </span>
              </div>
              <h1 className="display-title font-display mt-5">{article.title}</h1>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-navy/10 py-4">
                <p className="text-sm text-navy/55">
                  <span className="font-semibold text-navy">{article.author}</span>
                  <span className="mx-2 text-navy/25">|</span>
                  {new Date(article.publishedAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    timeZone: "Africa/Lagos",
                  })}
                </p>
                <div className="lg:hidden">
                  <ShareLinks url={shareUrl} title={article.title} />
                </div>
              </div>
            </header>

            <div className="mt-10 space-y-7">
              {content.map((block, i) => {
                if (block.kind === "image") {
                  if (!block.url) return null;
                  inlinePhoto += 1;
                  // Photos show whole, at their own proportions: no frame,
                  // crop or backdrop, just the picture at full story width.
                  return (
                    <figure key={i} className="!my-11">
                      <LightboxTrigger photos={viewerPhotos} index={inlinePhoto} label="Enlarge photo">
                        <Image
                          src={block.url}
                          alt={block.caption || `${article.title}, photo`}
                          width={1600}
                          height={1067}
                          sizes="(min-width: 1024px) 768px, 100vw"
                          className="h-auto w-full rounded-xl"
                        />
                      </LightboxTrigger>
                      {block.caption && (
                        <figcaption className="mt-3 text-sm leading-snug text-navy/50">{block.caption}</figcaption>
                      )}
                    </figure>
                  );
                }
                const lead = i === firstParagraph;
                if (block.bold) {
                  return (
                    <p
                      key={i}
                      className="border-l-4 border-cyan pl-5 text-xl font-semibold leading-snug text-navy sm:text-2xl"
                    >
                      {block.text}
                    </p>
                  );
                }
                return (
                  <p
                    key={i}
                    className={
                      lead
                        ? "text-xl font-medium leading-relaxed text-navy sm:text-[1.65rem] sm:leading-snug"
                        : "text-[1.0625rem] leading-[1.85] text-navy/80"
                    }
                  >
                    {block.text}
                  </p>
                );
              })}
            </div>

            <div className="mt-14 flex flex-wrap items-center justify-between gap-5 rounded-2xl bg-navy/[0.04] px-6 py-5">
              <p className="font-display text-xl text-navy">Share this story</p>
              <ShareLinks url={shareUrl} title={article.title} />
            </div>
          </div>
        </div>
      </article>

      <SocialsSection />

      {related.length > 0 && (
        <section className="border-t border-navy/10 px-6 py-16 sm:px-10 lg:px-16">
          <p className="mb-8 font-display text-2xl text-navy">More News</p>
          <div className="grid gap-8 sm:grid-cols-3">
            {related.map((item) => (
              <Link key={item._id} href={`/news/${item.slug}`} className="group block">
                {item.coverImageUrl ? (
                  <FramedImage
                    src={item.coverImageUrl}
                    alt={item.title}
                    sizes="(min-width: 640px) 30vw, 90vw"
                    className="aspect-[3/4] transition-transform duration-500 ease-smooth group-hover:scale-[1.02] sm:aspect-[4/3]"
                  />
                ) : (
                  <div className="aspect-[3/4] rounded-2xl bg-navy-light sm:aspect-[4/3]" />
                )}
                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-cyan">
                  {categoryLabels[item.category]} · {formatShortDate(item.publishedAt)}
                </p>
                <p className="mt-2 line-clamp-2 font-display text-lg leading-snug text-navy transition-colors duration-200 ease-smooth group-hover:text-cyan">
                  {item.title}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
