"use client";

import { useState } from "react";
import Image from "next/image";
import { clsx } from "clsx";

// Every photo of a product: one large frame and a thumbnail strip. The photos
// fill their frames edge to edge with nothing behind or around them.
export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) {
    return <div className="aspect-[4/5] rounded-2xl bg-navy/[0.06]" />;
  }

  const go = (dir: -1 | 1) => setIndex((i) => (i + dir + images.length) % images.length);

  return (
    <div className="flex min-w-0 flex-col gap-3 lg:flex-row-reverse lg:gap-4">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl lg:flex-1">
        {images.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={i === index ? name : ""}
            fill
            priority={i === 0}
            sizes="(min-width: 1024px) 48vw, 100vw"
            className={clsx(
              "object-cover transition-opacity duration-500 ease-smooth",
              i === index ? "opacity-100" : "opacity-0"
            )}
          />
        ))}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="btn-glass btn-glass-light absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next photo"
              className="btn-glass btn-glass-light absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <span className="absolute bottom-3 right-3 rounded-md bg-navy-dark/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              {index + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="-mx-6 flex max-w-[100vw] gap-2.5 overflow-x-auto px-6 pb-1 sm:-mx-10 sm:px-10 lg:mx-0 lg:w-24 lg:max-w-none lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === index}
              className={clsx(
                "relative aspect-[4/5] w-20 shrink-0 overflow-hidden rounded-lg transition-all duration-300 ease-smooth lg:w-full",
                i === index ? "ring-2 ring-navy ring-offset-2" : "opacity-60 hover:opacity-100"
              )}
            >
              <Image src={src} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
