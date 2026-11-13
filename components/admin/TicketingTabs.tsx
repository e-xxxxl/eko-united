"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

// The four parts of ticketing, side by side at the top of each, so the ticket
// manager moves between them without hunting through the main menu.
const tabs = [
  { href: "/admin/tickets", label: "Overview", exact: true },
  { href: "/admin/tickets/sales", label: "Orders" },
  { href: "/admin/ticket-types", label: "Ticket types" },
  { href: "/admin/scan-tickets", label: "Check-in" },
];

export default function TicketingTabs() {
  const pathname = usePathname() || "";
  return (
    <nav aria-label="Ticketing" className="-mx-6 mb-8 flex gap-1 overflow-x-auto border-b border-navy/10 px-6 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map((t) => {
        const active = t.exact ? pathname === t.href : pathname === t.href || pathname.startsWith(`${t.href}/`);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={clsx(
              "-mb-px shrink-0 border-b-2 px-4 py-3 text-xs font-semibold uppercase tracking-wide transition-colors duration-200 ease-smooth",
              active ? "border-cyan text-navy" : "border-transparent text-navy/40 hover:text-navy"
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
