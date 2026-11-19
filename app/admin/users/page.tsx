"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import PasswordField from "@/components/admin/PasswordField";
import { adminFetch } from "@/lib/adminApi";

type Role = "super_admin" | "content_editor" | "ticket_manager" | "shop_manager" | "inventory_manager";

type StaffAccount = {
  _id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
};

const roleLabels: Record<Role, string> = {
  super_admin: "Super Admin",
  content_editor: "Content Editor",
  ticket_manager: "Ticket Manager",
  shop_manager: "Shop Manager",
  inventory_manager: "Inventory Manager",
};

const roleBlurb: Record<Role, string> = {
  super_admin: "Everything, including staff accounts and the activity log",
  content_editor: "News, fixtures, players, gallery, sponsors, league table",
  ticket_manager: "Ticket types, sales and the gate check-in",
  shop_manager: "Shop products and orders",
  inventory_manager: "Shop products and orders, plus gate check-in",
};

const fieldClass =
  "w-full border-b border-navy/20 bg-transparent px-1 py-3 text-sm text-navy outline-none transition-colors duration-200 ease-smooth placeholder:text-navy/30 focus:border-cyan";
const labelClass = "mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/50";

function lastSeen(iso?: string | null) {
  if (!iso) return "Never signed in";
  return `Last signed in ${new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" })}`;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<StaffAccount[] | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<StaffAccount | null>(null);

  function load() {
    adminFetch<StaffAccount[]>("/users")
      .then(setUsers)
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  function replace(updated: StaffAccount) {
    setUsers((prev) => (prev ? prev.map((u) => (u._id === updated._id ? { ...u, ...updated } : u)) : prev));
  }

  async function toggleActive(user: StaffAccount) {
    setUpdatingId(user._id);
    setError("");
    setNotice("");
    try {
      replace(await adminFetch<StaffAccount>(`/users/${user._id}`, { method: "PUT", body: JSON.stringify({ isActive: !user.isActive }) }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update account.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <AdminShell>
      {(admin) => (
        <div className="px-6 py-16 sm:px-10">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Administration</p>
              <h1 className="display-title font-display mt-2">Staff Accounts</h1>
              <p className="mt-3 max-w-xl text-sm text-navy/55">
                Add logins, change a person&apos;s name, email or role, reset a password, or switch an account off. Changes apply the next time that person clicks anything.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/admin/activity" className="btn-glass btn-glass-navy px-6 py-2.5 text-xs font-bold uppercase tracking-wide">
                Activity log
              </Link>
              <Link href="/admin/users/new" className="btn-glass btn-glass-yellow px-6 py-2.5 text-xs font-bold uppercase tracking-wide">
                + Add staff account
              </Link>
            </div>
          </div>

          {notice && (
            <p className="mb-4 rounded-xl bg-cyan/15 px-4 py-3 text-sm text-navy" role="status">
              {notice}
            </p>
          )}
          {error && (
            <p className="mb-4 text-sm text-red-500" role="alert">
              {error}
            </p>
          )}

          {users === null ? (
            <p className="text-navy/50">Loading…</p>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {users.map((user) => {
                const you = user.email === admin.email;
                return (
                  <div key={user._id} className={`rounded-2xl border bg-white p-5 ${user.isActive ? "border-navy/10" : "border-navy/10 opacity-60"}`}>
                    <div className="flex items-start gap-4">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy font-display text-lg text-white">{initials(user.name)}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-navy">
                          {user.name} {you && <span className="font-normal text-navy/40">(you)</span>}
                        </p>
                        <p className="truncate text-sm text-navy/55">{user.email}</p>
                        <p className="mt-1 text-[11px] uppercase tracking-wide text-navy/40">{lastSeen(user.lastLoginAt)}</p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${
                          user.isActive ? "bg-cyan/20 text-navy" : "bg-navy/10 text-navy/50"
                        }`}
                      >
                        {user.isActive ? "Active" : "Switched off"}
                      </span>
                    </div>

                    <p className="mt-4 text-xs text-navy/50">
                      <span className="font-semibold text-navy/75">{roleLabels[user.role]}</span> · {roleBlurb[user.role]}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-navy/10 pt-4 text-sm font-semibold">
                      <button type="button" onClick={() => setEditing(user)} className="text-cyan-dark transition-colors duration-200 ease-smooth hover:text-navy">
                        Edit details
                      </button>
                      <Link href={`/admin/activity?staff=${user._id}`} className="text-navy/55 transition-colors duration-200 ease-smooth hover:text-navy">
                        View activity
                      </Link>
                      <button
                        type="button"
                        onClick={() => toggleActive(user)}
                        disabled={updatingId === user._id || (you && user.isActive)}
                        title={you && user.isActive ? "You can't switch off your own account" : undefined}
                        className="ml-auto text-navy/40 transition-colors duration-200 ease-smooth hover:text-red-500 disabled:opacity-40 disabled:hover:text-navy/40"
                      >
                        {updatingId === user._id ? "Updating…" : user.isActive ? "Switch off" : "Switch back on"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {editing && (
            <EditDialog
              user={editing}
              isSelf={editing.email === admin.email}
              onClose={() => setEditing(null)}
              onSaved={(updated, message) => {
                replace(updated);
                setNotice(message);
                setError("");
                setEditing(null);
              }}
            />
          )}
        </div>
      )}
    </AdminShell>
  );
}

function EditDialog({
  user,
  isSelf,
  onClose,
  onSaved,
}: {
  user: StaffAccount;
  isSelf: boolean;
  onClose: () => void;
  onSaved: (user: StaffAccount, message: string) => void;
}) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState<Role>(user.role);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (password && password.length < 8) {
      setError("A new password needs at least 8 characters.");
      return;
    }
    setSaving(true);
    try {
      const details: Partial<StaffAccount> = {};
      if (name.trim() !== user.name) details.name = name.trim();
      if (email.trim().toLowerCase() !== user.email) details.email = email.trim();
      if (role !== user.role) details.role = role;

      let result = user;
      if (Object.keys(details).length > 0) {
        result = await adminFetch<StaffAccount>(`/users/${user._id}`, { method: "PUT", body: JSON.stringify(details) });
      }
      if (password) {
        await adminFetch(`/users/${user._id}/password`, { method: "PUT", body: JSON.stringify({ password }) });
      }
      const changed = [Object.keys(details).length > 0 && "details", password && "password"].filter(Boolean).join(" and ");
      onSaved(result, changed ? `Saved ${result.name}'s ${changed}.` : "Nothing was changed.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy-dark/60 p-4 backdrop-blur-sm sm:items-center" onMouseDown={onClose}>
      <form
        onSubmit={save}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Edit ${user.name}`}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <h2 className="font-display text-3xl uppercase text-navy">Edit staff account</h2>

        <div className="mt-6 space-y-5">
          <div>
            <label htmlFor="edit-name" className={labelClass}>
              Full name
            </label>
            <input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} required className={fieldClass} />
          </div>
          <div>
            <label htmlFor="edit-email" className={labelClass}>
              Email (they sign in with this)
            </label>
            <input id="edit-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={fieldClass} />
          </div>
          <div>
            <span className={labelClass}>Role</span>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(roleLabels) as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  disabled={isSelf && user.role === "super_admin" && r !== "super_admin"}
                  className={`rounded-xl border px-3.5 py-2 text-xs font-semibold uppercase tracking-wide transition-colors duration-200 ease-smooth disabled:cursor-not-allowed disabled:opacity-40 ${
                    role === r ? "border-cyan bg-cyan/10 text-navy" : "border-navy/15 text-navy/50 hover:border-navy/30"
                  }`}
                >
                  {roleLabels[r]}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-navy/45">{roleBlurb[role]}</p>
          </div>
          <div>
            <label htmlFor="edit-password" className={labelClass}>
              New password (leave empty to keep the current one)
            </label>
            <PasswordField
              id="edit-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              className={fieldClass}
            />
          </div>
        </div>

        {error && (
          <p className="mt-5 text-sm text-red-500" role="alert">
            {error}
          </p>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <button type="submit" disabled={saving} className="btn-glass btn-glass-yellow px-8 py-3 text-sm font-bold uppercase tracking-wide disabled:opacity-60">
            {saving ? "Saving…" : "Save changes"}
          </button>
          <button type="button" onClick={onClose} className="btn-glass btn-glass-navy px-6 py-3 text-sm font-bold uppercase tracking-wide">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
