"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Next's <Link> scrolls to top on navigation by default, but that default
// only applies to genuine client-side transitions — this is a small,
// explicit belt-and-suspenders guarantee that every route change lands at
// the top of the new page, regardless of edge cases (e.g. a visitor
// returning via back/forward, or scroll position carried over from a very
// tall previous page).
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
