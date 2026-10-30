"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clsx } from "clsx";
import { useRequireAdmin, logout, type AdminSession } from "@/lib/adminAuth";

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  content_editor: "Content Editor",
  ticket_manager: "Ticket Manager",
  shop_manager: "Shop Manager",
  inventory_manager: "Inventory Manager",
};

type NavLink = { href: string; label: string; roles?: string[] };
type NavGroup = { heading: string; links: NavLink[] };

// Only sections that actually exist link here: add to this list as each
// admin CRUD screen gets built, not ahead of it (a nav link to a page that
// doesn't exist yet is worse than no nav link). `roles` restricts who sees
// the link at all; omit it for anything every role should see (Dashboard).
// super_admin always sees everything regardless of `roles`, matching the
// backend's own requireRole() bypass (see middleware/auth.js). A group with
// no visible links for the signed-in role is not shown.
const navGroups: NavGroup[] = [
  {
    heading: "Overview",
    links: [
      { href: "/admin/dashboard", label: "Dashboard" },
      { href: "/admin/analytics", label: "Analytics", roles: ["super_admin"] },
    ],
  },
  {
    heading: "Matchday",
    links: [
      { href: "/admin/matches", label: "Fixtures & Results", roles: ["content_editor"] },
      { href: "/admin/standings", label: "League Table", roles: ["content_editor"] },
      { href: "/admin/players", label: "Players & Staff", roles: ["content_editor"] },
      { href: "/admin/scan-tickets", label: "Scan Tickets", roles: ["ticket_manager", "inventory_manager"] },
    ],
  },
  {
    heading: "Content",
    links: [
      { href: "/admin/news", label: "News", roles: ["content_editor"] },
      { href: "/admin/events", label: "Events and CSR", roles: ["content_editor"] },
      { href: "/admin/videos", label: "Videos", roles: ["content_editor"] },
      { href: "/admin/gallery", label: "Gallery", roles: ["content_editor"] },
      { href: "/admin/trophies", label: "Trophies", roles: ["content_editor"] },
      { href: "/admin/history", label: "History", roles: ["content_editor"] },
      { href: "/admin/sponsors", label: "Sponsors", roles: ["content_editor"] },
    ],
  },
  {
    heading: "Site",
    links: [
      { href: "/admin/page-photos", label: "Page photos", roles: ["content_editor"] },
      { href: "/admin/media", label: "Photo library", roles: ["content_editor", "shop_manager"] },
      { href: "/admin/settings", label: "Settings", roles: ["content_editor"] },
    ],
  },
  {
    heading: "Inbox",
    links: [
      { href: "/admin/enquiries", label: "Enquiries", roles: ["content_editor"] },
      { href: "/admin/contact", label: "Messages", roles: ["content_editor"] },
      { href: "/admin/membership", label: "Memberships", roles: ["content_editor"] },
    ],
  },
  {
    heading: "Shop and tickets",
    links: [
      { href: "/admin/products", label: "Products", roles: ["shop_manager", "inventory_manager"] },
      { href: "/admin/ticket-types", label: "Ticket Types", roles: ["ticket_manager"] },
      { href: "/admin/orders", label: "Orders", roles: ["shop_manager", "ticket_manager", "inventory_manager"] },
    ],
  },
  {
    heading: "Administration",
    links: [{ href: "/admin/users", label: "Staff Accounts", roles: ["super_admin"] }],
  },
];

// Shared authenticated chrome for every admin page: verifies the session
// (redirecting to /admin if invalid), then renders a grouped sidebar (a slide-
// out menu on phones) and the signed-in user with log out, around whatever the
// page passes as children. Every new admin screen should wrap itself in this
// rather than re-implementing the guard and header.
export default function AdminShell({ children }: { children: (admin: AdminSession) => React.ReactNode }) {
  const admin = useRequireAdmin();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!admin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-navy-dark">
        <p className="text-sm text-white/40">Loading…</p>
      </main>
    );
  }

  const groups = navGroups
    .map((g) => ({
      heading: g.heading,
      links: g.links.filter((l) => !l.roles || admin.role === "super_admin" || l.roles.includes(admin.role)),
    }))
    .filter((g) => g.links.length > 0);

  return (
    <div className="min-h-screen bg-white lg:flex">
      {/* Phone top bar: crest and a menu button. The sidebar slides in over the page. */}
      <header className="sticky top-0 z-30 flex items-center justify-between bg-navy-dark px-5 py-3 lg:hidden">
        <div className="flex items-center gap-3">
          <Image src="/brand/crest-mark.png" alt="" width={32} height={32} className="h-8 w-8" />
          <span className="font-display text-lg tracking-wide text-white">Admin</span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          className="btn-glass btn-glass-light flex h-10 w-10 items-center justify-center rounded-lg"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </header>

      {open && <div className="fixed inset-0 z-40 bg-navy-dark/60 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} aria-hidden />}

      <aside
        aria-label="Admin sections"
        className={clsx(
          "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-navy-dark transition-transform duration-300 ease-smooth",
          "lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-64 lg:max-w-none lg:shrink-0 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-5">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <Image src="/brand/crest-mark.png" alt="" width={40} height={40} className="h-10 w-10" />
            <span>
              <span className="block font-display text-xl leading-none tracking-wide text-white">Admin</span>
              <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan">Eko United FC</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white/60 transition-colors duration-200 ease-smooth hover:bg-white/10 hover:text-white lg:hidden"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5 [scrollbar-color:rgba(255,255,255,0.15)_transparent] [scrollbar-width:thin]">
          {groups.map((group, gi) => (
            <div key={group.heading} className={gi === 0 ? "" : "mt-6"}>
              <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">{group.heading}</p>
              <ul className="mt-2 space-y-0.5">
                {group.links.map((link) => {
                  const active = pathname === link.href || pathname?.startsWith(`${link.href}/`);
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        aria-current={active ? "page" : undefined}
                        className={clsx(
                          "relative flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 ease-smooth",
                          active ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/[0.06] hover:text-white"
                        )}
                      >
                        {active && <span aria-hidden className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-cyan" />}
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 px-5 py-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{admin.name}</p>
            <p className="mt-0.5 text-xs text-cyan">{roleLabels[admin.role] || admin.role}</p>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-lg border border-white/15 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-white/70 transition-colors duration-200 ease-smooth hover:border-cyan hover:text-white"
            >
              View site
            </Link>
            <button
              type="button"
              onClick={() => logout(router)}
              className="btn-glass btn-glass-light flex-1 px-3 py-2 text-xs font-semibold uppercase tracking-wide"
            >
              Log out
            </button>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">{children(admin)}</div>
    </div>
  );
}
