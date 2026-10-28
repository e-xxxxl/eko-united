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
  { href: "/events", label: "Events" },
  { href: "/shop", label: "Shop" },
  { href: "/contact", label: "Contact" },
];

const moreLinks = [
  { href: "/membership", label: "Club Membership" },
  { href: "/volunteer", label: "Volunteer" },
  { href: "/table", label: "League Table" },
  { href: "/videos", label: "Videos" },
  { href: "/gallery", label: "Gallery" },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/trophies", label: "Trophy Cabinet" },
  { href: "/club-history", label: "Club History" },
  { href: "/media-accreditation", label: "Media Accreditation" },
];

// The phone menu is a full-screen sheet: the everyday destinations as big
// display type, the rest as a quieter grid underneath.
const mobileMain = [
  { href: "/fixtures", label: "Fixtures" },
  { href: "/results", label: "Results" },
  { href: "/news", label: "News" },
  { href: "/videos", label: "Videos" },
  { href: "/events", label: "Events" },
  { href: "/team", label: "Team" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];
const mobileMore = moreLinks.filter((l) => l.href !== "/videos");

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
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
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
          "relative z-10 flex items-center justify-between gap-4 px-6 py-3 sm:px-10 lg:px-16",
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
            className="btn-glass btn-glass-yellow whitespace-nowrap px-5 py-2 text-xs font-bold uppercase tracking-wide"
          >
            Tickets
          </Link>
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          <CartIndicator />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="btn-glass btn-glass-light relative flex h-11 w-11 items-center justify-center rounded-xl"
          >
            <span className="relative block h-4 w-5" aria-hidden>
              <span
                className={clsx(
                  "absolute left-0 h-0.5 w-5 rounded-full bg-white transition-all duration-300 ease-smooth",
                  open ? "top-[7px] rotate-45" : "top-0"
                )}
              />
              <span
                className={clsx(
                  "absolute left-0 top-[7px] h-0.5 rounded-full bg-white transition-all duration-300 ease-smooth",
                  open ? "w-0 opacity-0" : "w-3.5 opacity-100"
                )}
              />
              <span
                className={clsx(
                  "absolute left-0 h-0.5 w-5 rounded-full bg-white transition-all duration-300 ease-smooth",
                  open ? "top-[7px] -rotate-45" : "top-[14px]"
                )}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Full-screen phone menu. It sits under the header bar (which keeps the
          logo, cart and the close button on top of it), fades in, and its
          links rise in one after another. Closed, it is invisible and inert
          so it can't be tabbed into or read out. */}
      <div
        id="mobile-nav"
        inert={!open}
        aria-hidden={!open}
        className={clsx(
          "fixed inset-0 z-0 overflow-y-auto bg-navy-dark transition-[opacity,visibility] duration-300 ease-smooth lg:hidden",
          open ? "visible opacity-100" : "invisible opacity-0"
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_50%_at_100%_0%,rgba(101,203,233,0.18),transparent_70%),repeating-linear-gradient(115deg,transparent_0_46px,rgba(255,255,255,0.025)_46px_47px)]"
        />
        <nav
          aria-label="Mobile"
          className="relative flex min-h-full flex-col px-6 pb-10 sm:px-10"
          style={{ paddingTop: "calc(var(--header-height, 5.5rem) + 1.25rem)" }}
        >
          <ul>
            {mobileMain.map((link, i) => {
              const active = pathname === link.href || pathname?.startsWith(`${link.href}/`);
              return (
                <li
                  key={link.href}
                  className={clsx(
                    "border-b border-white/10 transition-all duration-500 ease-smooth",
                    open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  )}
                  style={{ transitionDelay: open ? `${80 + i * 45}ms` : "0ms" }}
                >
                  <Link
                    href={link.href}
                    className={clsx(
                      "flex items-center justify-between py-3.5 font-display text-4xl uppercase leading-none tracking-wide transition-colors duration-200 ease-smooth",
                      active ? "text-cyan" : "text-white active:text-cyan"
                    )}
                  >
                    {link.label}
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={active ? "text-cyan" : "text-white/30"}
                      aria-hidden
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div
            className={clsx(
              "mt-8 transition-all duration-500 ease-smooth",
              open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            )}
            style={{ transitionDelay: open ? `${80 + mobileMain.length * 45}ms` : "0ms" }}
          >
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan">The Club</p>
            <div className="grid grid-cols-2 gap-2">
              {mobileMore.map((link) => {
                const active = pathname === link.href || pathname?.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={clsx(
                      "rounded-xl px-4 py-3 text-xs font-semibold uppercase tracking-wide ring-1 transition-colors duration-200 ease-smooth",
                      active
                        ? "bg-cyan/15 text-cyan ring-cyan/40"
                        : "bg-white/[0.04] text-white/80 ring-white/10 active:bg-white/10"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <Link
              href="/tickets"
              className="btn-glass btn-glass-yellow mt-8 block px-5 py-4 text-center text-sm font-bold uppercase tracking-wide"
            >
              Buy tickets
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
