"use client";

import { useEffect, useRef, useState } from "react";
import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { clsx } from "clsx";
import FramedImage from "@/components/FramedImage";
import { isAllowedImageUrl } from "@/lib/imageHosts";

export type HeroSlide = {
  _id: string;
  slug: string;
  title: string;
  category: "article" | "match_report" | "press_release";
  publishedAt: string;
  coverImageUrl?: string;
  heroImageUrl?: string;
};

// Art direction for a slide that has its own landscape image: a <picture>
// (via next/image's getImageProps) so each device downloads only the image it
// actually shows, rather than both. Phones get the portrait cover image,
// letterboxed over a blurred copy of itself so the whole photo always shows;
// tablets and up get the landscape image, full-bleed. A slide with no
// landscape image keeps using FramedImage's single-image behavior instead.
function ArtDirectedImage({
  portraitSrc,
  landscapeSrc,
  alt,
  priority,
}: {
  portraitSrc: string;
  landscapeSrc: string;
  alt: string;
  priority: boolean;
}) {
  const common = { alt, fill: true, sizes: "100vw", priority } as const;
  const { props: landscape } = getImageProps({ ...common, src: landscapeSrc });
  const { props: portrait } = getImageProps({
    ...common,
    src: portraitSrc,
    className: "object-cover object-top sm:object-center",
  });

  return (
    <div className="absolute inset-0 overflow-hidden bg-navy-light">
      <picture>
        <source media="(min-width: 640px)" srcSet={landscape.srcSet} sizes="100vw" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img {...portrait} alt={alt} />
      </picture>
    </div>
  );
}

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
  const touch = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);

  // Advances every 6 seconds. Keyed on `index` so any change, automatic or
  // by swipe or dot, restarts the countdown: a slide someone just moved to
  // always gets its full time on screen.
  useEffect(() => {
    if (slides.length <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setTimeout(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearTimeout(timer);
  }, [slides.length, index]);

  function go(dir: -1 | 1) {
    setIndex((i) => (i + dir + slides.length) % slides.length);
  }

  // Swipe left for the next story, right for the previous. Only a clearly
  // horizontal gesture counts, so scrolling the page up and down still works,
  // and a swipe never counts as a tap on the story link underneath.
  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
    swiped.current = false;
  }
  function onTouchEnd(e: React.TouchEvent) {
    const start = touch.current;
    touch.current = null;
    if (!start || slides.length <= 1) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      swiped.current = true;
      go(dx < 0 ? 1 : -1);
    }
  }

  // No news published yet (a brand-new site, before the first article) —
  // a branded fallback so the homepage never shows a blank void here,
  // rather than just returning null.
  if (slides.length === 0) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-navy-dark px-6 text-center">
        <Image src="/brand/crest-mark.png" alt="Eko United FC crest" width={96} height={96} className="h-20 w-20 sm:h-24 sm:w-24" />
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan">
            Nigeria National League
          </p>
          <h1 className="font-display mt-3 text-4xl text-white sm:text-5xl">The Uga Boys</h1>
        </div>
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 touch-pan-y overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onClickCapture={(e) => {
        if (swiped.current) {
          e.preventDefault();
          e.stopPropagation();
          swiped.current = false;
        }
      }}
    >
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
          {(() => {
            const landscape = isAllowedImageUrl(slide.heroImageUrl) ? slide.heroImageUrl : undefined;
            const portrait = isAllowedImageUrl(slide.coverImageUrl) ? slide.coverImageUrl : undefined;
            if (landscape) {
              return (
                <ArtDirectedImage
                  portraitSrc={portrait || landscape}
                  landscapeSrc={landscape}
                  alt={slide.title}
                  priority={i === 0}
                />
              );
            }
            if (portrait) {
              return (
                <FramedImage
                  src={portrait}
                  alt={slide.title}
                  priority={i === 0}
                  rounded={false}
                  fill
                  position="50% 0%"
                  sizes="100vw"
                />
              );
            }
            return <div className="absolute inset-0 bg-navy-dark" />;
          })()}
          {/* Shade only where text sits: a soft top band so the header reads
              over any photo, and a deep fade at the bottom for the headline. */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-navy-dark/70 to-transparent" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/40 to-transparent" />

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
