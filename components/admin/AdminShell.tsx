"use client";

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

// Only sections that actually exist link here — add to this list as each
// admin CRUD screen gets built, not ahead of it (a nav link to a page that
// doesn't exist yet is worse than no nav link). `roles` restricts who sees
// the link at all — omit it for anything every role should see (Dashboard).
// super_admin always sees everything regardless of `roles`, matching the
// backend's own requireRole() bypass (see middleware/auth.js).
const navLinks: { href: string; label: string; roles?: string[] }[] = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/players", label: "Players & Staff", roles: ["content_editor"] },
  { href: "/admin/matches", label: "Fixtures & Results", roles: ["content_editor"] },
  { href: "/admin/news", label: "News", roles: ["content_editor"] },
  { href: "/admin/sponsors", label: "Sponsors", roles: ["content_editor"] },
  { href: "/admin/trophies", label: "Trophies", roles: ["content_editor"] },
  { href: "/admin/history", label: "History", roles: ["content_editor"] },
  { href: "/admin/gallery", label: "Gallery", roles: ["content_editor"] },
  { href: "/admin/standings", label: "League Table", roles: ["content_editor"] },
  { href: "/admin/contact", label: "Messages", roles: ["content_editor"] },
  { href: "/admin/products", label: "Products", roles: ["shop_manager", "inventory_manager"] },
  { href: "/admin/ticket-types", label: "Ticket Types", roles: ["ticket_manager"] },
  { href: "/admin/orders", label: "Orders", roles: ["shop_manager", "ticket_manager", "inventory_manager"] },
  { href: "/admin/scan-tickets", label: "Scan Tickets", roles: ["ticket_manager", "inventory_manager"] },
  { href: "/admin/settings", label: "Settings", roles: ["content_editor"] },
  { href: "/admin/analytics", label: "Analytics", roles: ["super_admin"] },
  { href: "/admin/users", label: "Staff Accounts", roles: ["super_admin"] },
];

// Shared authenticated chrome for every admin page: verifies the session
// (redirecting to /admin if invalid), then renders the top bar + section nav
// + logout around whatever the page passes as children. Every new admin
// screen should wrap itself in this rather than re-implementing the guard
// and header.
export default function AdminShell({ children }: { children: (admin: AdminSession) => React.ReactNode }) {
  const admin = useRequireAdmin();
  const pathname = usePathname();
  const router = useRouter();

  if (!admin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-navy-dark">
        <p className="text-sm text-white/40">Loading…</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-navy-dark px-6 py-4 sm:px-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/brand/crest-mark.png" alt="" width={36} height={36} className="h-9 w-9" />
            <span className="font-display text-lg tracking-wide text-white">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-white">{admin.name}</p>
              <p className="text-xs text-cyan">{roleLabels[admin.role] || admin.role}</p>
            </div>
            <button
              type="button"
              onClick={() => logout(router)}
              className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition-colors duration-200 ease-smooth hover:border-white"
            >
              Log out
            </button>
          </div>
        </div>

        <nav className="mt-4 flex flex-wrap gap-x-6 gap-y-2" aria-label="Admin sections">
          {navLinks
            .filter((link) => !link.roles || admin.role === "super_admin" || link.roles.includes(admin.role))
            .map((link) => {
            const active = pathname === link.href || pathname?.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "text-xs font-semibold uppercase tracking-wide transition-colors duration-200 ease-smooth",
                  active ? "text-cyan" : "text-white/60 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {children(admin)}
    </div>
  );
}
