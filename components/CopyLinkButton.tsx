"use client";

import { useState } from "react";

export default function CopyLinkButton({ url, iconOnly = false }: { url: string; iconOnly?: boolean }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (very old browser, insecure context) —
      // silently do nothing rather than throw; the link is still visible
      // in the address bar for the visitor to copy manually.
    }
  }

  const icon = copied ? (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  ) : (
    <svg width={iconOnly ? 18 : 14} height={iconOnly ? 18 : 14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? "Link copied" : "Copy link"}
        title={copied ? "Link copied" : "Copy link"}
        className="btn-glass btn-glass-navy flex h-11 w-11 items-center justify-center rounded-xl"
      >
        {icon}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="btn-glass btn-glass-navy inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold uppercase tracking-wide"
    >
      {icon}
      {copied ? "Link copied" : "Copy link"}
    </button>
  );
}
