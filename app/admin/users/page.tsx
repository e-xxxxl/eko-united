"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { adminFetch } from "@/lib/adminApi";

type StaffAccount = {
  _id: string;
  name: string;
  email: string;
  role: "super_admin" | "content_editor" | "ticket_manager" | "shop_manager";
  isActive: boolean;
};

const roleLabels: Record<StaffAccount["role"], string> = {
  super_admin: "Super Admin",
  content_editor: "Content Editor",
  ticket_manager: "Ticket Manager",
  shop_manager: "Shop Manager",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<StaffAccount[] | null>(null);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  function load() {
    adminFetch<StaffAccount[]>("/users")
      .then(setUsers)
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  async function updateRole(user: StaffAccount, role: StaffAccount["role"]) {
    setUpdatingId(user._id);
    try {
      const updated = await adminFetch<StaffAccount>(`/users/${user._id}`, {
        method: "PUT",
        body: JSON.stringify({ role }),
      });
      setUsers((prev) => (prev ? prev.map((u) => (u._id === updated._id ? updated : u)) : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update account.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function toggleActive(user: StaffAccount) {
    setUpdatingId(user._id);
    setError("");
    try {
      const updated = await adminFetch<StaffAccount>(`/users/${user._id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      setUsers((prev) => (prev ? prev.map((u) => (u._id === updated._id ? updated : u)) : prev));
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
          <div className="mb-8 flex items-baseline justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Site</p>
              <h1 className="display-title font-display mt-2">Staff Accounts</h1>
            </div>
            <Link
              href="/admin/users/new"
              className="rounded-full bg-yellow px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-navy-dark transition-transform duration-300 ease-smooth hover:scale-105"
            >
              + Add staff account
            </Link>
          </div>

          {error && (
            <p className="mb-4 text-sm text-red-500" role="alert">
              {error}
            </p>
          )}

          {users === null ? (
            <p className="text-navy/50">Loading…</p>
          ) : (
            <div className="border-t border-navy/10">
              {users.map((user) => (
                <div key={user._id} className="flex flex-wrap items-center justify-between gap-4 border-b border-navy/10 py-4">
                  <div>
                    <p className="font-medium text-navy">
                      {user.name} {user.email === admin.email && <span className="text-navy/40">(you)</span>}
                    </p>
                    <p className="text-xs uppercase tracking-wide text-navy/40">
                      {user.email} · {user.isActive ? "Active" : "Deactivated"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <select
                      value={user.role}
                      onChange={(e) => updateRole(user, e.target.value as StaffAccount["role"])}
                      disabled={updatingId === user._id}
                      className="rounded-full border border-navy/20 bg-transparent px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-navy outline-none focus:border-cyan"
                    >
                      {Object.entries(roleLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => toggleActive(user)}
                      disabled={updatingId === user._id || (user.email === admin.email && user.isActive)}
                      title={user.email === admin.email && user.isActive ? "You can't deactivate your own account" : undefined}
                      className="text-sm font-semibold text-navy/40 transition-colors duration-200 ease-smooth hover:text-red-500 disabled:opacity-50 disabled:hover:text-navy/40"
                    >
                      {updatingId === user._id ? "Updating…" : user.isActive ? "Deactivate" : "Reactivate"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </AdminShell>
  );
}
