"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";

// The club's Meta (Facebook) pixel. It can be changed without touching code by
// setting NEXT_PUBLIC_META_PIXEL_ID when the site is built.
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "3220589354807544";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

// Meta's base code, loaded on every public page (the home page included). The
// admin panel is never tracked.
//
// Meta's snippet counts one PageView when the site first loads. This site then
// moves between pages without reloading, so each later page change is reported
// here as another PageView; otherwise only the first page a visitor opens would
// ever be counted.
export default function MetaPixel() {
  const pathname = usePathname();
  const isAdmin = Boolean(pathname?.startsWith("/admin"));
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      // The base code below reports this one itself.
      firstRender.current = false;
      return;
    }
    // If the pixel has not been loaded yet (a visitor moving from the admin panel
    // to the site), loading it reports the page, so nothing to add here.
    if (!isAdmin && window.fbq) window.fbq("track", "PageView");
  }, [pathname, isAdmin]);

  if (isAdmin) return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${PIXEL_ID}');
fbq('track', 'PageView');`}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
