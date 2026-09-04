"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import FramedImage from "@/components/FramedImage";

export type HeroSlide = {
  _id: string;
  slug: string;
  title: string;
  category: "article" | "match_report" | "press_release";
  publishedAt: string;
  coverImageUrl?: string;
};

const categoryLabels: Record<HeroSlide["category"], string> = {
  article: "Article",
  match_report: "Match Report",
  press_release: "Press Release",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Lagos",
  });
}

// The hero is the latest news, not generic stock photography: each slide is
// a real story (cover photo + headline), the whole slide is a link to that
// article, and the carousel just advances through the most recent few. Each
// photo renders via FramedImage — a blurred, color-matched backdrop behind
// the full uncropped photo — so an unusually tall/wide uploaded cover never
// gets an awkward crop the way a plain object-cover fill would.
export default function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {slides.map((slide, i) => (
        <Link
          key={slide._id}
          href={`/news/${slide.slug}`}
          aria-hidden={i !== index}
          tabIndex={i === index ? 0 : -1}
          className={clsx(
            "absolute inset-0 block transition-opacity duration-[1400ms] ease-smooth",
            i === index ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          )}
        >
          {slide.coverImageUrl ? (
            <FramedImage
              src={slide.coverImageUrl}
              alt={slide.title}
              priority={i === 0}
              rounded={false}
              fill
              sizes="100vw"
            />
          ) : (
            <div className="absolute inset-0 bg-navy-dark" />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/50 to-navy-dark/10" />

          <div className="absolute inset-x-0 bottom-0 px-6 pb-16 pt-32 sm:px-10 sm:pb-24 lg:px-16">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-cyan">
              {categoryLabels[slide.category]}
            </p>
            <h1 className="font-display line-clamp-3 max-w-3xl text-4xl leading-[0.98] text-white sm:text-5xl lg:text-6xl">
              {slide.title}
            </h1>
            {/* suppressHydrationWarning: toLocaleDateString can legitimately
                render a hair differently between the server's Node/ICU build
                and a visitor's browser (this is the one piece of this
                component's output that's locale/environment-dependent) —
                Next.js's own docs recommend this exact escape hatch for
                date-formatted text rather than letting it fail hydration for
                the whole page. */}
            <p className="mt-6 text-sm text-white/60" suppressHydrationWarning>
              {formatDate(slide.publishedAt)} · Read the full story →
            </p>
          </div>
        </Link>
      ))}

      {slides.length > 1 && (
        <div className="absolute bottom-6 left-6 z-10 flex gap-2 sm:left-10 lg:left-16">
          {slides.map((slide, i) => (
            <button
              key={slide._id}
              type="button"
              aria-label={`Show story ${i + 1}: ${slide.title}`}
              onClick={() => setIndex(i)}
              className={clsx(
                "h-1 rounded-full transition-all duration-500 ease-smooth",
                i === index ? "w-6 bg-cyan" : "w-3 bg-white/30 hover:bg-white/50"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
