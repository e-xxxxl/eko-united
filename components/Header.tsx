"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { clsx } from "clsx";

const navLinks = [
  { href: "/about", label: "About" },
  { href: "/team", label: "Team" },
  { href: "/fixtures", label: "Fixtures" },
  { href: "/results", label: "Results" },
  { href: "/table", label: "Table" },
  { href: "/news", label: "News" },
  { href: "/gallery", label: "Gallery" },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/contact", label: "Contact" },
];

// Client component: needs interactive state for the mobile menu toggle and
// route-change awareness to auto-close it, plus (on the homepage only) a
// scroll-aware background. Sticky (not fixed) so it stays in normal document
// flow — every page keeps its own top padding without needing a manual
// offset for a fixed header.
export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isHome = pathname === "/";
  // Solid immediately on every page except the homepage, where it starts
  // transparent over the hero and solidifies once the hero scrolls out of
  // view (see the #hero-sentinel it observes in app/page.tsx).
  const [solid, setSolid] = useState(!isHome);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!isHome) {
      setSolid(true);
      return;
    }
    const sentinel = document.getElementById("hero-sentinel");
    if (!sentinel) {
      setSolid(true);
      return;
    }
    setSolid(false);
    const observer = new IntersectionObserver(
      ([entry]) => setSolid(!entry.isIntersecting),
      { rootMargin: "-64px 0px 0px 0px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isHome, pathname]);

  return (
    <header className="sticky top-0 z-50">
      {/* Two stacked layers so the background crossfades via opacity (GPU-safe)
          rather than a background-color transition. */}
      <div
        className={clsx(
          "absolute inset-0 bg-navy-dark transition-opacity duration-300 ease-smooth",
          solid ? "opacity-100" : "opacity-0"
        )}
      />
      {!solid && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 to-transparent" />
      )}

      <div className="relative flex items-center justify-between px-6 py-3 sm:px-10 lg:px-16">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/brand/crest-mark.png"
            alt="Eko United FC crest"
            width={80}
            height={80}
            priority
            className="h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem]"
          />
          <span className="font-display text-xl tracking-wide text-white sm:text-2xl">
            Eko United FC
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
          {navLinks.map((link) => {
            const active = pathname === link.href || pathname?.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "text-xs font-semibold uppercase tracking-[0.15em] transition-colors duration-200 ease-smooth",
                  active ? "text-cyan" : "text-white/80 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <Link
            href="/tickets"
            className="rounded-full bg-yellow px-5 py-2 text-xs font-bold uppercase tracking-wide text-navy-dark transition-transform duration-300 ease-smooth hover:scale-105"
          >
            Tickets
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden"
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

      <div
        id="mobile-nav"
        className={clsx(
          "relative grid overflow-hidden bg-navy-dark transition-[grid-template-rows] duration-300 ease-smooth lg:hidden",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <nav
            className="flex flex-col gap-1 px-6 py-4 sm:px-10"
            aria-label="Mobile"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-3 text-sm font-semibold uppercase tracking-wide text-white/80 transition-colors duration-200 ease-smooth hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-white/10 pt-4">
              <Link
                href="/trophies"
                className="px-3 py-2 text-sm text-white/60 hover:text-white"
              >
                Trophy Cabinet
              </Link>
              <Link
                href="/club-history"
                className="px-3 py-2 text-sm text-white/60 hover:text-white"
              >
                Club History
              </Link>
              <Link
                href="/tickets"
                className="mt-2 rounded-full bg-yellow px-5 py-2.5 text-center text-xs font-bold uppercase tracking-wide text-navy-dark"
              >
                Tickets
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
