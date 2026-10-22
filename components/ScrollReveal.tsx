"use client";

import { useEffect } from "react";

// Site-wide scroll choreography. Sections glide up and fade in as they enter
// the viewport, and groups of cards or rows arrive one after another.
//
// How it works, and why it is built this way:
//  - Each target gets a paused Web Animation parked on its first frame. The
//    browser composites transform and opacity on the GPU, nothing here
//    touches layout, and when an animation finishes it is cancelled so the
//    element returns to its natural style with no leftover layer.
//  - Nothing is written to the DOM (no classes or attributes), so React
//    hydration is never disturbed, and visitors without JavaScript simply see
//    the page as normal.
//  - Targets are opted in from the markup:
//      data-reveal             this element reveals ("up" by default, or
//                              data-reveal="fade|left|right|scale")
//      data-reveal-stagger     this element's children reveal in sequence
//      data-reveal-skip        never animate this element (full-bleed heroes)
//    A <main> with none of these gets a sensible default: each of its direct
//    children reveals on its own.
//  - A MutationObserver picks up content that streams in later (Suspense
//    sections) and pages swapped in by client-side navigation.
//  - Content already on screen when the page first loads is left alone, so a
//    hard load never flashes. Reduced-motion visitors get no animation at all.

type Variant = "up" | "fade" | "left" | "right" | "scale";

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const DURATION = 900;
const STEP = 85;
const MAX_STEPS = 6;

const FROM: Record<Variant, Keyframe> = {
  up: { opacity: 0, transform: "translate3d(0, 34px, 0)" },
  fade: { opacity: 0 },
  left: { opacity: 0, transform: "translate3d(-48px, 0, 0)" },
  right: { opacity: 0, transform: "translate3d(48px, 0, 0)" },
  scale: { opacity: 0, transform: "scale(0.93)" },
};
const TO: Keyframe = { opacity: 1, transform: "none" };

function asVariant(value: string | null): Variant {
  return value === "fade" || value === "left" || value === "right" || value === "scale" ? value : "up";
}

function isReal(el: Element) {
  const tag = el.tagName;
  return tag !== "SCRIPT" && tag !== "STYLE" && tag !== "TEMPLATE" && tag !== "NOSCRIPT";
}

export default function ScrollReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (typeof IntersectionObserver === "undefined" || !("animate" in Element.prototype)) return;

    const pending = new Map<Element, Animation>();
    const seen = new WeakSet<Element>();
    let initial = true;

    function release(el: Element) {
      const anim = pending.get(el);
      if (!anim) return;
      pending.delete(el);
      io.unobserve(el);
      anim.cancel();
    }

    const io = new IntersectionObserver(
      (entries) => {
        const entering = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left);

        entering.forEach((entry, i) => {
          const anim = pending.get(entry.target);
          if (!anim) return;
          pending.delete(entry.target);
          io.unobserve(entry.target);
          const extra = Number((entry.target as HTMLElement).dataset.revealDelay) || 0;
          anim.effect?.updateTiming({ delay: Math.min(i, MAX_STEPS) * STEP + extra });
          anim.play();
        });

        // Scrolled well past without ever being seen (fast jump, restored
        // scroll position): show it straight away rather than leave it hidden.
        for (const entry of entries) {
          if (!entry.isIntersecting && entry.boundingClientRect.bottom < 0) release(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
    );

    function register(el: Element, variant: Variant) {
      if (seen.has(el)) return;
      seen.add(el);
      if (!isReal(el) || el.closest("[data-reveal-skip]")) return;

      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;
      // First paint: whatever is already in view stays put, no flash.
      if (initial && rect.top < window.innerHeight && rect.bottom > 0) return;
      // Already scrolled past (e.g. restored scroll position): leave visible.
      if (rect.bottom < 0) return;

      const anim = el.animate([FROM[variant], TO], { duration: DURATION, easing: EASE, fill: "both" });
      anim.pause();
      anim.onfinish = () => {
        anim.cancel();
        pending.delete(el);
      };
      pending.set(el, anim);
      io.observe(el);
    }

    function scan() {
      if (window.location.pathname.startsWith("/admin")) return;

      for (const el of document.querySelectorAll("[data-reveal]")) {
        register(el, asVariant(el.getAttribute("data-reveal")));
      }
      for (const group of document.querySelectorAll("[data-reveal-stagger]")) {
        const variant = asVariant(group.getAttribute("data-reveal-stagger"));
        for (const child of group.children) register(child, variant);
      }
      // Default for plain pages: each direct child of <main> reveals itself,
      // unless it is, or contains, something explicitly tagged.
      for (const main of document.querySelectorAll("main")) {
        for (const child of main.children) {
          if (child.hasAttribute("data-reveal") || child.hasAttribute("data-reveal-stagger")) continue;
          if (child.querySelector("[data-reveal], [data-reveal-stagger], [data-reveal-skip]")) continue;
          if (child.hasAttribute("data-reveal-skip")) continue;
          register(child, "up");
        }
      }
    }

    let scanning = false;
    const mo = new MutationObserver((mutations) => {
      if (scanning) return;
      if (!mutations.some((m) => m.addedNodes.length > 0)) return;
      scanning = true;
      try {
        scan();
      } finally {
        scanning = false;
      }
    });

    let ticking = false;
    function onScroll() {
      if (ticking || pending.size === 0) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const gone: Element[] = [];
        for (const el of pending.keys()) {
          if (el.getBoundingClientRect().bottom < -40) gone.push(el);
        }
        gone.forEach(release);
      });
    }

    scan();
    initial = false;
    mo.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      mo.disconnect();
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      pending.forEach((anim) => anim.cancel());
      pending.clear();
    };
  }, []);

  return null;
}
