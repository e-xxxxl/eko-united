import Link from "next/link";
import { clsx } from "clsx";

const tabs = [
  { href: "/admin/membership", label: "Applications" },
  { href: "/admin/membership/packages", label: "Packages" },
  { href: "/admin/membership/content", label: "Page content" },
];

// Sub-navigation shared by the three membership admin pages.
export default function MembershipTabs({ current }: { current: string }) {
  return (
    <div className="mb-8 flex flex-wrap gap-2">
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={clsx(
            "rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors duration-200 ease-smooth",
            current === t.href ? "bg-navy text-white" : "bg-navy/[0.05] text-navy/60 hover:bg-navy/10 hover:text-navy"
          )}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}
