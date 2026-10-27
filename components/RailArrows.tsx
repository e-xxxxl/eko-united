"use client";

// Previous / next buttons for a horizontally scrolling rail elsewhere on the
// page (found by id). Each press moves roughly one card, smoothly.
export default function RailArrows({ targetId, label }: { targetId: string; label: string }) {
  function scroll(dir: -1 | 1) {
    const rail = document.getElementById(targetId);
    if (!rail) return;
    const card = rail.querySelector<HTMLElement>("[data-rail-card]");
    const step = card ? card.getBoundingClientRect().width + 24 : rail.clientWidth * 0.8;
    rail.scrollBy({ left: dir * step * 2, behavior: "smooth" });
  }

  const arrow = "btn-glass btn-glass-navy flex h-11 w-11 items-center justify-center rounded-xl";
  return (
    <div className="hidden items-center gap-2 sm:flex">
      <button type="button" onClick={() => scroll(-1)} aria-label={`Previous ${label}`} className={arrow}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M15 5l-7 7 7 7" />
        </svg>
      </button>
      <button type="button" onClick={() => scroll(1)} aria-label={`Next ${label}`} className={arrow}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
