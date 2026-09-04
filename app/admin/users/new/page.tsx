"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { adminFetch } from "@/lib/adminApi";

const fieldClass =
  "w-full border-b border-navy/20 bg-transparent px-1 py-3 text-sm text-navy outline-none transition-colors duration-200 ease-smooth placeholder:text-navy/30 focus:border-cyan";
const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-wide text-navy/50";

export default function NewStaffAccountPage() {
  const router = useRouter();
  const [role, setRole] = useState<"content_editor" | "ticket_manager" | "shop_manager" | "super_admin">(
    "content_editor"
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      await adminFetch("/users", {
        method: "POST",
        body: JSON.stringify({
          name: String(data.get("name") || ""),
          email: String(data.get("email") || ""),
          password: String(data.get("password") || ""),
          role,
        }),
      });
      router.push("/admin/users");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account.");
      setSaving(false);
    }
  }

  return (
    <AdminShell>
      {() => (
        <div className="px-6 py-16 sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Site</p>
          <h1 className="display-title font-display mt-2 mb-10">Add Staff Account</h1>

          <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
            <div>
              <label htmlFor="name" className={labelClass}>
                Full name
              </label>
              <input id="name" name="name" required className={fieldClass} />
            </div>
            <div>
              <label htmlFor="email" className={labelClass}>
                Email
              </label>
              <input id="email" name="email" type="email" required className={fieldClass} />
            </div>
            <div>
              <label htmlFor="password" className={labelClass}>
                Temporary password (they can't change it themselves yet — share it securely)
              </label>
              <input id="password" name="password" type="password" required minLength={8} className={fieldClass} />
            </div>
            <div>
              <span className={labelClass}>Role</span>
              <div className="flex flex-wrap gap-2">
                {(["content_editor", "ticket_manager", "shop_manager", "super_admin"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors duration-200 ease-smooth ${
                      role === r
                        ? "border-cyan bg-cyan/10 text-navy"
                        : "border-navy/15 text-navy/50 hover:border-navy/30"
                    }`}
                  >
                    {r.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-yellow px-8 py-3 text-sm font-bold uppercase tracking-wide text-navy-dark transition-transform duration-300 ease-smooth hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
            >
              {saving ? "Creating…" : "Create account"}
            </button>
          </form>
        </div>
      )}
    </AdminShell>
  );
}
