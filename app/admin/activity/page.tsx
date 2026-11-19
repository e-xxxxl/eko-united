"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { adminFetch } from "@/lib/adminApi";

type Action = "login" | "login_failed" | "create" | "update" | "delete" | "upload" | "action";

type Entry = {
  _id: string;
  adminId?: string;
  adminName?: string;
  adminEmail?: string;
  adminRole?: string;
  action: Action;
  section?: string;
  summary?: string;
  targetId?: string;
  fields?: string[];
  method?: string;
  path?: string;
  ip?: string;
  userAgent?: string;
  createdAt: string;
};

type StaffRow = {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  changes30d: number;
  lastAction: string | null;
  lastActionAt: string | null;
};

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  content_editor: "Content Editor",
  ticket_manager: "Ticket Manager",
  shop_manager: "Shop Manager",
  inventory_manager: "Inventory Manager",
};

const actionMeta: Record<Action, { label: string; className: string }> = {
  create: { label: "Added", className: "bg-cyan/25 text-navy" },
  update: { label: "Edited", className: "bg-navy/10 text-navy" },
  delete: { label: "Deleted", className: "bg-red-500 text-white" },
  upload: { label: "Upload", className: "bg-navy text-white" },
  action: { label: "Action", className: "bg-navy/10 text-navy" },
  login: { label: "Signed in", className: "bg-navy/[0.06] text-navy/60" },
  login_failed: { label: "Failed sign in", className: "bg-red-100 text-red-700" },
};

const typeFilters: { value: string; label: string }[] = [
  { value: "", label: "Everything" },
  { value: "create", label: "Added" },
  { value: "update", label: "Edited" },
  { value: "delete", label: "Deleted" },
  { value: "upload", label: "Uploads" },
  { value: "action", label: "Other actions" },
  { value: "login", label: "Sign ins" },
  { value: "login_failed", label: "Failed sign ins" },
];

const LAGOS = "Africa/Lagos";
const dayKey = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { timeZone: LAGOS });
const dayLabel = (iso: string) => {
  const key = dayKey(iso);
  if (key === dayKey(new Date().toISOString())) return "Today";
  if (key === dayKey(new Date(Date.now() - 86400000).toISOString())) return "Yesterday";
  return new Date(iso).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: LAGOS });
};
const timeOf = (iso: string) => new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: LAGOS });
const ago = (iso: string | null) => {
  if (!iso) return "never";
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
};
const initials = (name = "?") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "?";

function device(ua = "") {
  const os = /Windows/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iPhone/iPad" : /Mac OS/.test(ua) ? "Mac" : /Linux/.test(ua) ? "Linux" : "";
  const browser = /Edg\//.test(ua) ? "Edge" : /OPR\//.test(ua) ? "Opera" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "";
  return [browser, os].filter(Boolean).join(" on ") || "Unknown device";
}

const selectClass =
  "rounded-xl border border-navy/15 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-navy outline-none focus:border-cyan";

export default function ActivityPage() {
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [failed30, setFailed30] = useState(0);
  const [sections, setSections] = useState<string[]>([]);

  const [staffId, setStaffId] = useState("");
  const [type, setType] = useState("");
  const [section, setSection] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");

  const [items, setItems] = useState<Entry[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const request = useRef(0);

  // A link from Staff Accounts ("View activity") arrives as ?staff=<id>.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("staff");
    if (id) setStaffId(id);
  }, []);

  useEffect(() => {
    adminFetch<{ failedSignIns30d: number; staff: StaffRow[] }>("/activity/staff")
      .then((r) => {
        setStaff(r.staff);
        setFailed30(r.failedSignIns30d);
      })
      .catch(() => {});
    adminFetch<string[]>("/activity/sections").then(setSections).catch(() => {});
  }, []);

  // The search box waits for a pause in typing before it asks the server.
  useEffect(() => {
    const t = setTimeout(() => setQ(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const queryFor = useCallback(
    (p: number) => {
      const params = new URLSearchParams({ page: String(p), limit: "40" });
      if (staffId) params.set("staff", staffId);
      if (type) params.set("action", type);
      if (section) params.set("section", section);
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      if (q) params.set("q", q);
      return `/activity?${params}`;
    },
    [staffId, type, section, from, to, q]
  );

  useEffect(() => {
    const mine = ++request.current;
    setItems(null);
    setError("");
    adminFetch<{ items: Entry[]; total: number; page: number; pages: number }>(queryFor(1))
      .then((r) => {
        if (mine !== request.current) return;
        setItems(r.items);
        setTotal(r.total);
        setPage(r.page);
        setPages(r.pages);
      })
      .catch((err) => mine === request.current && setError(err instanceof Error ? err.message : "Could not load the activity log."));
  }, [queryFor]);

  async function loadMore() {
    setLoadingMore(true);
    try {
      const r = await adminFetch<{ items: Entry[]; page: number; pages: number }>(queryFor(page + 1));
      setItems((prev) => [...(prev || []), ...r.items]);
      setPage(r.page);
      setPages(r.pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load more.");
    } finally {
      setLoadingMore(false);
    }
  }

  const filtered = Boolean(staffId || type || section || from || to || q);
  function clearFilters() {
    setStaffId("");
    setType("");
    setSection("");
    setFrom("");
    setTo("");
    setSearch("");
    setQ("");
  }

  // Group the loaded rows by Lagos day.
  const groups: { label: string; rows: Entry[] }[] = [];
  for (const e of items || []) {
    const label = dayLabel(e.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.rows.push(e);
    else groups.push({ label, rows: [e] });
  }

  return (
    <AdminShell>
      {() => (
        <div className="px-6 py-16 sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Administration</p>
          <h1 className="display-title font-display mt-2">Activity Log</h1>
          <p className="mt-3 max-w-2xl text-sm text-navy/55">
            Every change a staff member makes, with who, what and when. Only super admins can see this page, and entries can&apos;t be edited or removed. History is kept for two years.
          </p>

          {/* One card per person */}
          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {staff.map((s) => (
              <button
                key={s._id}
                type="button"
                onClick={() => setStaffId(staffId === s._id ? "" : s._id)}
                className={`rounded-2xl border p-4 text-left transition-all duration-200 ease-smooth hover:-translate-y-0.5 ${
                  staffId === s._id ? "border-cyan bg-cyan/10" : "border-navy/10 bg-white hover:border-cyan"
                } ${s.isActive ? "" : "opacity-60"}`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy font-display text-base text-white">{initials(s.name)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-navy">{s.name}</p>
                    <p className="truncate text-[11px] uppercase tracking-wide text-navy/40">{roleLabels[s.role] || s.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-2xl leading-none text-navy">{s.changes30d}</p>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-navy/40">changes, 30 days</p>
                  </div>
                </div>
                <p className="mt-3 truncate text-xs text-navy/55">
                  {s.lastAction ? <>Last: {s.lastAction} <span className="text-navy/35">({ago(s.lastActionAt)})</span></> : "No changes yet"}
                </p>
                <p className="mt-0.5 text-[11px] text-navy/40">Signed in {ago(s.lastLoginAt)}</p>
              </button>
            ))}
          </div>

          {failed30 > 0 && (
            <button
              type="button"
              onClick={() => setType(type === "login_failed" ? "" : "login_failed")}
              className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-left text-sm text-red-700 transition-colors duration-200 ease-smooth hover:bg-red-100"
            >
              <strong>{failed30}</strong> failed sign in attempt{failed30 === 1 ? "" : "s"} in the last 30 days. Tap to see them.
            </button>
          )}

          {/* Filters */}
          <div className="mt-8 space-y-3 rounded-2xl bg-navy/[0.04] p-4">
            <div className="flex flex-wrap gap-2">
              {typeFilters.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setType(f.value)}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors duration-200 ease-smooth ${
                    type === f.value ? "bg-navy text-white" : "bg-white text-navy/60 hover:text-navy"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select value={staffId} onChange={(e) => setStaffId(e.target.value)} className={selectClass} aria-label="Staff member">
                <option value="">All staff</option>
                {staff.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <select value={section} onChange={(e) => setSection(e.target.value)} className={selectClass} aria-label="Section">
                <option value="">All sections</option>
                {sections.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-navy/50">
                From
                <input type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} className={selectClass} />
              </label>
              <label className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-navy/50">
                To
                <input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} className={selectClass} />
              </label>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search what was changed"
                className="min-w-[12rem] flex-1 rounded-xl border border-navy/15 bg-white px-4 py-2 text-sm text-navy outline-none placeholder:text-navy/35 focus:border-cyan"
              />
              {filtered && (
                <button type="button" onClick={clearFilters} className="text-xs font-semibold uppercase tracking-wide text-navy/50 hover:text-red-500">
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {error && (
            <p className="mt-6 text-sm text-red-500" role="alert">
              {error}
            </p>
          )}

          {/* Timeline */}
          <div className="mt-8">
            {items === null && !error ? (
              <div className="space-y-3" aria-hidden>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-2xl bg-navy/[0.05]" />
                ))}
              </div>
            ) : items && items.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-navy/15 px-6 py-14 text-center text-navy/50">
                {filtered ? "Nothing matches those filters." : "No activity has been recorded yet. It starts building up from the first change a staff member makes."}
              </p>
            ) : (
              <>
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-navy/40">
                  {total.toLocaleString()} {total === 1 ? "entry" : "entries"}
                  {filtered ? " match" : ""}
                </p>
                <div className="space-y-8">
                  {groups.map((g) => (
                    <section key={g.label}>
                      <h2 className="mb-3 flex items-center gap-4 font-display text-2xl uppercase text-navy">
                        {g.label}
                        <span className="h-px flex-1 bg-navy/10" />
                      </h2>
                      <ul className="space-y-2">
                        {g.rows.map((e) => {
                          const meta = actionMeta[e.action];
                          const isOpen = open === e._id;
                          return (
                            <li key={e._id} className="rounded-2xl border border-navy/10 bg-white">
                              <button
                                type="button"
                                onClick={() => setOpen(isOpen ? null : e._id)}
                                aria-expanded={isOpen}
                                className="flex w-full items-center gap-3 p-3 text-left sm:gap-4 sm:p-4"
                              >
                                <span className="w-11 shrink-0 text-xs font-semibold tabular-nums text-navy/45">{timeOf(e.createdAt)}</span>
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy font-display text-sm text-white">{initials(e.adminName)}</span>
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-sm text-navy">
                                    <strong className="font-semibold">{e.adminName || "Unknown"}</strong> <span className="text-navy/60">{e.summary}</span>
                                  </span>
                                  {e.section && e.action !== "login" && e.action !== "login_failed" && (
                                    <span className="mt-0.5 block text-[11px] uppercase tracking-wide text-navy/40">{e.section}</span>
                                  )}
                                </span>
                                <span className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${meta.className}`}>{meta.label}</span>
                              </button>
                              {isOpen && (
                                <dl className="grid gap-x-8 gap-y-2 border-t border-navy/10 px-4 py-4 text-xs sm:grid-cols-2">
                                  <Detail label="Who">
                                    {e.adminName} ({roleLabels[e.adminRole || ""] || e.adminRole || "unknown role"})
                                    <br />
                                    {e.adminEmail}
                                  </Detail>
                                  <Detail label="When">
                                    {new Date(e.createdAt).toLocaleString("en-GB", { dateStyle: "full", timeStyle: "medium", timeZone: LAGOS })}
                                  </Detail>
                                  {e.fields && e.fields.length > 0 && <Detail label="Fields sent">{e.fields.join(", ")}</Detail>}
                                  <Detail label="Device">
                                    {device(e.userAgent)}
                                    {e.ip ? ` · ${e.ip}` : ""}
                                  </Detail>
                                  {e.path && (
                                    <Detail label="Request">
                                      {e.method} {e.path}
                                    </Detail>
                                  )}
                                </dl>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  ))}
                </div>

                {page < pages && (
                  <div className="mt-8 text-center">
                    <button
                      type="button"
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="btn-glass btn-glass-navy px-8 py-3 text-xs font-bold uppercase tracking-wide disabled:opacity-60"
                    >
                      {loadingMore ? "Loading…" : "Show older activity"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-navy/40">{label}</dt>
      <dd className="mt-0.5 break-words text-navy/75">{children}</dd>
    </div>
  );
}
