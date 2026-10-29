"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { reloadIfStale } from "@/lib/staleReload";

// Shown inside the normal page chrome (header and footer stay) when something
// on a page throws in the browser. Replaces Next's bare "Application error"
// screen with a calm message and a way forward.
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    console.error(error);
    if (reloadIfStale(error)) setRefreshing(true);
  }, [error]);

  return (
    <main className="px-6 py-24 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-xl text-center">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Eko United FC</p>
        <h1 className="display-title font-display">{refreshing ? "Updating the page" : "Something went wrong"}</h1>
        <p className="mt-5 text-base leading-relaxed text-navy/70">
          {refreshing
            ? "The site was just updated. Loading the latest version."
            : "That page did not load properly. Please try again, or head back to the home page."}
        </p>
        {!refreshing && (
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="btn-glass btn-glass-yellow px-8 py-3 text-sm font-bold uppercase tracking-wide"
            >
              Try again
            </button>
            <Link href="/" className="btn-glass btn-glass-navy px-8 py-3 text-sm font-bold uppercase tracking-wide">
              Home
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
