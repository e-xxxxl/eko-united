import { sectionCard, storyCard } from "@/lib/og/cards";
import { apiFetch } from "@/lib/api";
import type { DemoNews } from "@/lib/demoData";

// Per-article share card, always an exact 1200x630 with the cover photo
// cropped to fit, however the photo was shot. X and WhatsApp show a source
// image at its own proportions, so a raw uploaded cover can look like an odd
// rectangle; generating the card here fixes the shape once, on our side.
export const alt = "Eko United FC news";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 900;

const categoryLabels: Record<DemoNews["category"], string> = {
  article: "Article",
  match_report: "Match report",
  press_release: "Press release",
};

export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await apiFetch<DemoNews>(`/news/${slug}`, 900);
  if (!article) return sectionCard("news");
  const date = new Date(article.publishedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Lagos",
  });
  return storyCard({
    photo: article.coverImageUrl,
    eyebrow: categoryLabels[article.category] || "News",
    title: article.title,
    meta: date,
    fallbackKey: "news",
  });
}
