"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import CartIndicator from "@/components/CartIndicator";

// Kept lean on purpose — this is the row that has to share space with the
// crest+wordmark, a cart icon and a Tickets button. Everything else lives in
// the "More" dropdown just below, not because it matters less, but because
// 11 links in one row genuinely doesn't fit any real desktop width without
// crowding (that's what was happening before — bumping the breakpoint alone
// didn't fix it, there just wasn't enough room at any normal size).
const primaryLinks = [
  { href: "/about", label: "About" },
  { href: "/team", label: "Team" },
  { href: "/fixtures", label: "Fixtures" },
  { href: "/results", label: "Results" },
  { href: "/news", label: "News" },
  { href: "/shop", label: "Shop" },
  { href: "/contact", label: "Contact" },
];

const moreLinks = [
  { href: "/table", label: "League Table" },
  { href: "/gallery", label: "Gallery" },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/trophies", label: "Trophy Cabinet" },
  { href: "/club-history", label: "Club History" },
  { href: "/media-accreditation", label: "Media Accreditation" },
];

const allLinksForMobile = [...primaryLinks.slice(0, -1), ...moreLinks, primaryLinks[primaryLinks.length - 1]];

// Client component: needs interactive state for the mobile menu toggle and
// route-change awareness to auto-close it, plus (on the homepage only) a
// scroll-aware background. Sticky (not fixed) so it stays in normal document
// flow — every page keeps its own top padding without needing a manual
// offset for a fixed header.
export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const isHome = pathname === "/";
  // Solid immediately on every other page; always transparent on the
  // homepage, at every scroll position, not just over the hero: a plain
  // opacity flag, not scroll-tracked. (An earlier version solidified once the
  // hero scrolled out of view for legibility against the white sections
  // below; that read as "still has a background" and was removed.) A drop-
  // shadow on the header's own content (below) keeps the white crest/wordmark/
  // links readable over both the dark hero and the white page beneath it,
  // since there's no background layer left to guarantee contrast on its own.
  const [solid, setSolid] = useState(!isHome);

  useEffect(() => {
    setOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    setSolid(!isHome);
  }, [isHome, pathname]);

  // The header is `sticky`, not `fixed`: it still reserves its own box in
  // normal document flow (that's what lets it "stick" back to the top
  // correctly, and what every non-home page needs so its content starts
  // below the header rather than getting hidden under it). That reserved
  // box is exactly the "white bar" bug on the homepage: transparent though
  // the header itself is, nothing paints that reserved strip, and the hero
  // section only begins after it. The hero was never actually sitting
  // behind the header at all; an old dark scrim just used to paint over
  // that same strip and hide the gap. This measures the header's real
  // rendered height (responsive, so it can't drift out of sync with a
  // hardcoded number) and exposes it as a CSS variable that only the
  // homepage's hero section (app/page.tsx) consumes, pulling itself up by
  // exactly that amount so it visually starts at the very top, genuinely
  // behind the header, on every other page this variable simply goes unused.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const setHeightVar = () => {
      document.documentElement.style.setProperty("--header-height", `${el.offsetHeight}px`);
    };
    setHeightVar();
    const observer = new ResizeObserver(setHeightVar);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!moreOpen) return;
    function handleClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [moreOpen]);

  const isMoreActive = moreLinks.some(
    (link) => pathname === link.href || pathname?.startsWith(`${link.href}/`)
  );

  return (
    <header ref={headerRef} className="sticky top-0 z-50">
      {/* Always fully transparent on the homepage, at every scroll
          position: no scrim, no tint, just the crest/nav floating directly
          on whatever's behind them. Solid elsewhere (no hero to sit over).
          Opacity, not a background-color transition, so it's still one GPU-
          safe crossfade on the rare case `solid` does change (a route
          change into/out of the homepage). */}
      <div
        className={clsx(
          "absolute inset-0 bg-navy-dark transition-opacity duration-300 ease-smooth",
          solid ? "opacity-100" : "opacity-0"
        )}
      />

      <div
        className={clsx(
          "relative flex items-center justify-between gap-4 px-6 py-3 sm:px-10 lg:px-16",
          // No background layer to guarantee contrast once `solid` is gone
          // for good on the homepage, so a drop-shadow on the content itself
          // keeps the white crest/wordmark/links/hamburger readable over
          // both the dark hero and the white page sections beneath it.
          !solid && "drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]"
        )}
      >
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <Image
            src="/brand/crest-mark.png"
            alt="Eko United FC crest"
            width={80}
            height={80}
            priority
            className="h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem]"
          />
          <span className="font-display whitespace-nowrap text-xl tracking-wide text-white sm:text-2xl">
            Eko United FC
          </span>
        </Link>

        <nav className="hidden items-center gap-5 lg:flex" aria-label="Primary">
          {primaryLinks.map((link) => {
            const active = pathname === link.href || pathname?.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "whitespace-nowrap text-xs font-semibold uppercase tracking-[0.15em] transition-colors duration-200 ease-smooth",
                  active ? "text-cyan" : "text-white/80 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            );
          })}

          <div ref={moreRef} className="relative">
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              aria-expanded={moreOpen}
              className={clsx(
                "flex items-center gap-1 whitespace-nowrap text-xs font-semibold uppercase tracking-[0.15em] transition-colors duration-200 ease-smooth",
                isMoreActive ? "text-cyan" : "text-white/80 hover:text-white"
              )}
            >
              More
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={clsx("transition-transform duration-200 ease-smooth", moreOpen && "rotate-180")}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            <div
              className={clsx(
                "absolute right-0 top-full z-10 mt-3 w-52 origin-top-right rounded-lg bg-navy-dark py-2 shadow-xl ring-1 ring-white/10 transition-all duration-150 ease-smooth",
                moreOpen ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
              )}
            >
              {moreLinks.map((link) => {
                const active = pathname === link.href || pathname?.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={clsx(
                      "block px-4 py-2.5 text-xs font-semibold uppercase tracking-wide transition-colors duration-200 ease-smooth",
                      active ? "text-cyan" : "text-white/80 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        <div className="hidden shrink-0 items-center gap-5 lg:flex">
          <CartIndicator />
          <Link
            href="/tickets"
            className="whitespace-nowrap rounded-full bg-yellow px-5 py-2 text-xs font-bold uppercase tracking-wide text-navy-dark transition-transform duration-300 ease-smooth hover:scale-105"
          >
            Tickets
          </Link>
        </div>

        <div className="flex items-center gap-5 lg:hidden">
          <CartIndicator />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5"
          >
            <span
              className={clsx(
                "h-0.5 w-6 bg-white transition-transform duration-300 ease-smooth",
                open && "translate-y-2 rotate-45"
              )}
            />
            <span
              className={clsx(
                "h-0.5 w-6 bg-white transition-opacity duration-300 ease-smooth",
                open && "opacity-0"
              )}
            />
            <span
              className={clsx(
                "h-0.5 w-6 bg-white transition-transform duration-300 ease-smooth",
                open && "-translate-y-2 -rotate-45"
              )}
            />
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={clsx(
          "relative grid overflow-hidden bg-navy-dark transition-[grid-template-rows] duration-300 ease-smooth lg:hidden",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <nav
            className="flex max-h-[calc(100vh-5rem)] flex-col gap-1 overflow-y-auto px-6 py-4 sm:px-10"
            aria-label="Mobile"
          >
            {allLinksForMobile.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-3 text-sm font-semibold uppercase tracking-wide text-white/80 transition-colors duration-200 ease-smooth hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/tickets"
              className="mt-3 rounded-full bg-yellow px-5 py-2.5 text-center text-xs font-bold uppercase tracking-wide text-navy-dark"
            >
              Tickets
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
