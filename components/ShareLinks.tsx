import CopyLinkButton from "@/components/CopyLinkButton";

// Share a story to WhatsApp, X or Facebook, or copy its link. Plain links, no
// third-party scripts, so nothing extra loads and nothing tracks the reader.
// `vertical` stacks the icons for the sticky side rail beside an article;
// the default lays them out in a row.
const iconBox =
  "btn-glass btn-glass-navy flex h-11 w-11 items-center justify-center rounded-xl";

export default function ShareLinks({
  url,
  title,
  vertical = false,
}: {
  url: string;
  title: string;
  vertical?: boolean;
}) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links = [
    {
      label: "Share on WhatsApp",
      href: `https://wa.me/?text=${t}%20${u}`,
      hover: "hover:!text-[#128C4A]",
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M20 11.5a8 8 0 0 1-11.9 7L4 20l1.5-4A8 8 0 1 1 20 11.5z" />
          <path d="M9.2 8.6c.3 2.5 2.3 4.7 5.2 5.8l1.1-1.2-1.8-.9-.8.7c-.9-.4-1.8-1.3-2.2-2.2l.7-.8-.9-1.8z" fill="currentColor" stroke="none" />
        </svg>
      ),
    },
    {
      label: "Share on X",
      href: `https://twitter.com/intent/tweet?text=${t}&url=${u}`,
      hover: "hover:!text-black",
      icon: (
        <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      label: "Share on Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
      hover: "hover:!text-[#1877F2]",
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
          <path d="M13.5 21v-7.5h2.6l.5-3h-3.1V8.6c0-.9.3-1.5 1.6-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.4 0-4 1.4-4 4.1v2.1H7.5v3h2.9V21z" />
        </svg>
      ),
    },
  ];

  return (
    <div className={vertical ? "flex flex-col gap-3" : "flex flex-wrap items-center gap-3"}>
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={l.label}
          title={l.label}
          className={`${iconBox} ${l.hover}`}
        >
          {l.icon}
        </a>
      ))}
      <CopyLinkButton url={url} iconOnly />
    </div>
  );
}
