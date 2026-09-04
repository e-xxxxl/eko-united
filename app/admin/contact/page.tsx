"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { adminFetch } from "@/lib/adminApi";

type Submission = {
  _id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export default function AdminContactPage() {
  const [submissions, setSubmissions] = useState<Submission[] | null>(null);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  function load() {
    adminFetch<Submission[]>("/contact")
      .then(setSubmissions)
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  async function toggleRead(submission: Submission) {
    setUpdatingId(submission._id);
    try {
      const updated = await adminFetch<Submission>(`/contact/${submission._id}`, {
        method: "PUT",
        body: JSON.stringify({ read: !submission.read }),
      });
      setSubmissions((prev) => (prev ? prev.map((s) => (s._id === updated._id ? updated : s)) : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update submission.");
    } finally {
      setUpdatingId(null);
    }
  }

  const unreadCount = submissions?.filter((s) => !s.read).length ?? 0;

  return (
    <AdminShell>
      {() => (
        <div className="px-6 py-16 sm:px-10">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Content</p>
            <h1 className="display-title font-display mt-2">Contact Submissions</h1>
            {submissions !== null && (
              <p className="mt-2 text-sm text-navy/50">
                {unreadCount === 0 ? "All caught up." : `${unreadCount} unread.`}
              </p>
            )}
          </div>

          {error && (
            <p className="mb-4 text-sm text-red-500" role="alert">
              {error}
            </p>
          )}

          {submissions === null ? (
            <p className="text-navy/50">Loading…</p>
          ) : submissions.length === 0 ? (
            <p className="text-navy/50">No messages yet — submissions from the contact form will appear here.</p>
          ) : (
            <div className="border-t border-navy/10">
              {submissions.map((submission) => (
                <div
                  key={submission._id}
                  className={`border-b border-navy/10 py-5 ${submission.read ? "" : "bg-cyan/5"}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-navy">
                        {submission.name}{" "}
                        {!submission.read && (
                          <span className="ml-1 rounded-full bg-cyan/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-navy">
                            New
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-navy/40">
                        {submission.email} ·{" "}
                        {new Date(submission.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          timeZone: "Africa/Lagos",
                        })}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleRead(submission)}
                      disabled={updatingId === submission._id}
                      className="text-sm font-semibold text-cyan transition-colors duration-200 ease-smooth hover:text-navy disabled:opacity-50"
                    >
                      {updatingId === submission._id
                        ? "Updating…"
                        : submission.read
                          ? "Mark unread"
                          : "Mark read"}
                    </button>
                  </div>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-navy/70">{submission.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </AdminShell>
  );
}
