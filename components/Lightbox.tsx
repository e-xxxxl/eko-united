"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { clsx } from "clsx";

export type LightboxPhoto = { src: string; alt?: string; caption?: string };

// Wraps a photo so a click (or tap) opens it large over the page. `photos` is
// the whole set the viewer can step through, `index` is which one this
// trigger opens on, so every photo of a player, article or event can sit in
// its own place on the page and still flick through as one set. Esc closes,
// arrow keys and swipes move between photos.
export default function LightboxTrigger({
  photos,
  index = 0,
  label = "Enlarge photo",
  className,
  children,
}: {
  photos: LightboxPhoto[];
  index?: number;
  label?: string;
  className?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(index);

  return (
    <>
      <button
        type="button"
        aria-label={label}
        onClick={() => {
          setCurrent(index);
          setOpen(true);
        }}
        className={clsx("block w-full cursor-zoom-in text-left", className)}
      >
        {children}
      </button>
      {open && <Viewer photos={photos} current={current} setCurrent={setCurrent} onClose={() => setOpen(false)} />}
    </>
  );
}

function Viewer({
  photos,
  current,
  setCurrent,
  onClose,
}: {
  photos: LightboxPhoto[];
  current: number;
  setCurrent: (n: number) => void;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);
  const count = photos.length;

  const step = useCallback(
    (dir: -1 | 1) => setCurrent((current + dir + count) % count),
    [current, count, setCurrent]
  );

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      opener?.focus?.();
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (count > 1 && e.key === "ArrowRight") step(1);
      else if (count > 1 && e.key === "ArrowLeft") step(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, step, count]);

  const photo = photos[current];
  if (!photo || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={photo.alt || "Photo viewer"}
      className="fixed inset-0 z-[100] flex flex-col bg-navy-dark/95 backdrop-blur-sm"
      onClick={onClose}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        const start = touchX.current;
        touchX.current = null;
        if (start === null || count < 2) return;
        const dx = e.changedTouches[0].clientX - start;
        if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
      }}
    >
      <div className="flex items-center justify-between px-5 py-4 text-white/70">
        <span className="text-xs font-semibold uppercase tracking-wide">
          {count > 1 ? `${current + 1} / ${count}` : ""}
        </span>
        <button
          ref={closeRef}
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl leading-none text-white transition-colors duration-200 ease-smooth hover:bg-white/25"
        >
          ×
        </button>
      </div>

      <div className="relative min-h-0 flex-1 px-4 sm:px-16">
        <div className="relative h-full w-full" onClick={(e) => e.stopPropagation()}>
          <Image
            key={photo.src}
            src={photo.src}
            alt={photo.alt || ""}
            fill
            sizes="100vw"
            className="object-contain"
          />
        </div>
        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={(e) => {
                e.stopPropagation();
                step(-1);
              }}
              className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition-colors duration-200 ease-smooth hover:bg-white/25 sm:left-4"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={(e) => {
                e.stopPropagation();
                step(1);
              }}
              className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition-colors duration-200 ease-smooth hover:bg-white/25 sm:right-4"
            >
              ›
            </button>
          </>
        )}
      </div>

      <p className="min-h-[3.5rem] px-6 py-4 text-center text-sm text-white/70" onClick={(e) => e.stopPropagation()}>
        {photo.caption || ""}
      </p>
    </div>,
    document.body
  );
}
