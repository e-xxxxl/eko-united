"use client";

import { useState } from "react";

// A YouTube preview frame. Asks for the high-resolution still first and falls
// back to the standard one when a video has no large thumbnail (older or short
// uploads). Plain <img> on purpose: these come straight from YouTube's image
// host and are already sized and compressed there.
export default function VideoThumb({ id, title, large = false }: { id: string; title: string; large?: boolean }) {
  const [fallback, setFallback] = useState(false);
  const src = fallback ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={title}
      loading={large ? "eager" : "lazy"}
      decoding="async"
      onLoad={(e) => {
        // YouTube answers a missing max-res still with a tiny grey 120px
        // placeholder rather than an error, so treat that as missing too.
        if (!fallback && e.currentTarget.naturalWidth <= 120) setFallback(true);
      }}
      onError={() => setFallback(true)}
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-smooth group-hover:scale-105"
    />
  );
}
