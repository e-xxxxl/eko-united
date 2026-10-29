"use client";

import { useEffect } from "react";
import { reloadIfStale } from "@/lib/staleReload";

// Last line of defence: if the page shell itself fails, this replaces it. It
// has to bring its own <html> and plain inline styles, because the site's
// layout and stylesheet are exactly what may have failed.
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    console.error(error);
    reloadIfStale(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#fff", color: "#0A244D", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "96px 24px", textAlign: "center" }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.3em", textTransform: "uppercase", color: "#65CBE9" }}>
            Eko United FC
          </p>
          <h1 style={{ fontSize: 36, margin: "16px 0" }}>Something went wrong</h1>
          <p style={{ lineHeight: 1.6, opacity: 0.7 }}>The page did not load properly. Please try again.</p>
          <a
            href="/"
            style={{ display: "inline-block", marginTop: 24, padding: "14px 32px", background: "#FFC72C", color: "#0A244D", fontWeight: 700, textDecoration: "none", borderRadius: 12 }}
          >
            Back to home
          </a>
        </div>
      </body>
    </html>
  );
}
