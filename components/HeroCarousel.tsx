"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { clsx } from "clsx";

// Demo match/stadium photography from Unsplash — swap for real Eko United
// match-day photos (still via next/image) once the club supplies them; the
// component and layout don't need to change, just these URLs.
const slides = [
  {
    id: "1",
    url: "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?w=1600&q=80&fit=crop&auto=format",
    alt: "Football match action",
  },
  {
    id: "2",
    url: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1600&q=80&fit=crop&auto=format",
    alt: "Packed football stadium",
  },
  {
    id: "3",
    url: "https://images.unsplash.com/photo-1508087625439-de3978963553?w=1600&q=80&fit=crop&auto=format",
    alt: "Football player in action",
  },
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={clsx(
            "absolute inset-0 transition-opacity duration-[1400ms] ease-smooth",
            i === index ? "opacity-100" : "opacity-0"
          )}
        >
          <Image
            src={slide.url}
            alt={slide.alt}
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
          />
          {/* Bridge-cable texture + navy tint, tying the photo back to the crest's brand language */}
          <div
            className="absolute inset-0 bg-navy-dark/45"
            style={{
              backgroundImage:
                "repeating-linear-gradient(100deg, rgba(101,203,233,0.08) 0px, rgba(101,203,233,0.08) 1px, transparent 1px, transparent 40px)",
            }}
          />
        </div>
      ))}
      {/* Slide indicators */}
      <div className="absolute bottom-6 left-6 z-10 flex gap-2 sm:left-10 lg:left-16">
        {slides.map((slide, i) => (
          <span
            key={slide.id}
            className={clsx(
              "h-1 rounded-full transition-all duration-500 ease-smooth",
              i === index ? "w-6 bg-cyan" : "w-3 bg-white/30"
            )}
          />
        ))}
      </div>
    </div>
  );
}
