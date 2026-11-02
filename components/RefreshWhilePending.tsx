"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// After paying online, the bank confirms with the club's server a few seconds
// later. This re-reads the page every few seconds (for about a minute) so the
// buyer sees their tickets appear without having to refresh.
export default function RefreshWhilePending() {
  const router = useRouter();
  useEffect(() => {
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      router.refresh();
      if (tries >= 15) clearInterval(timer);
    }, 4000);
    return () => clearInterval(timer);
  }, [router]);
  return null;
}
