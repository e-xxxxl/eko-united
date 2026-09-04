"use client";

import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";

const sections: { href: string; label: string; description: string; roles?: string[] }[] = [
  { href: "/admin/players", label: "Players & Staff", description: "Squad, coaches, management profiles", roles: ["content_editor"] },
  { href: "/admin/matches", label: "Fixtures & Results", description: "Season match list, scores, status", roles: ["content_editor"] },
  { href: "/admin/news", label: "News", description: "Articles, match reports, press releases", roles: ["content_editor"] },
  { href: "/admin/sponsors", label: "Sponsors", description: "Club partners and logos", roles: ["content_editor"] },
  { href: "/admin/standings", label: "League Table", description: "Standings that power /table", roles: ["content_editor"] },
  { href: "/admin/gallery", label: "Gallery", description: "Matchday photos and videos", roles: ["content_editor"] },
  { href: "/admin/trophies", label: "Trophies", description: "Honours cabinet", roles: ["content_editor"] },
  { href: "/admin/history", label: "History", description: "Club timeline milestones", roles: ["content_editor"] },
  { href: "/admin/contact", label: "Messages", description: "Contact form submissions", roles: ["content_editor"] },
  { href: "/admin/products", label: "Products", description: "Club shop merchandise", roles: ["shop_manager"] },
  { href: "/admin/ticket-types", label: "Ticket Types", description: "Priced ticket categories per match", roles: ["ticket_manager"] },
  { href: "/admin/orders", label: "Orders", description: "Shop and ticket sales", roles: ["shop_manager", "ticket_manager"] },
  { href: "/admin/settings", label: "Settings", description: "Hero banners, club info, socials", roles: ["content_editor"] },
  { href: "/admin/users", label: "Staff Accounts", description: "Add and manage admin logins", roles: ["super_admin"] },
];

export default function AdminDashboardPage() {
  return (
    <AdminShell>
      {(admin) => {
        const visible = sections.filter(
          (s) => !s.roles || admin.role === "super_admin" || s.roles.includes(admin.role)
        );
        return (
          <div className="px-6 py-16 sm:px-10">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Welcome back</p>
            <h1 className="display-title font-display mt-2">{admin.name}</h1>
            <p className="mt-4 max-w-xl text-navy/60">
              Manage the site's content from here — changes go live on the public site within seconds
              of saving.
            </p>

            <div className="mt-10 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((section) => (
                <Link
                  key={section.href}
                  href={section.href}
                  className="group border-t border-navy/10 pt-4 transition-colors duration-200 ease-smooth"
                >
                  <p className="font-display text-lg text-navy transition-colors duration-200 ease-smooth group-hover:text-cyan">
                    {section.label}
                  </p>
                  <p className="mt-1 text-sm text-navy/50">{section.description}</p>
                </Link>
              ))}
            </div>
          </div>
        );
      }}
    </AdminShell>
  );
}
