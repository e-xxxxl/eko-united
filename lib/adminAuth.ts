"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";

// Admin auth is client-side only: the backend issues a JWT (8h expiry) via
// POST /api/admin/auth/login and every protected backend route expects it as
// an `Authorization: Bearer <token>` header (see backend/src/middleware/auth.js)
// — there's no cookie-based session to hook into. Storing the token in
// localStorage is the natural fit for that existing contract; it does mean
// the token is readable by any script on the page, so keep this scoped to
// the admin panel only and never echo the token into a public page.
const TOKEN_KEY = "eko_admin_token";

export type AdminSession = { name: string; email: string; role: string };

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function login(email: string, password: string): Promise<AdminSession> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/admin/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    // fetch() throws its own generic "Failed to fetch" for anything that
    // never reached the server (backend down, wrong URL, offline) — that's
    // not something to show a user verbatim.
    throw new Error("Can't reach the server right now. Check your connection and try again.");
  }

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || "Something went wrong. Please try again.");
  }
  setToken(body.token);
  return body.user;
}

// Re-checks the token against the server on every protected-page mount
// (rather than trusting a locally-cached "logged in" flag) — the token can
// expire (8h) or the account can be deactivated between visits, and /me is
// the source of truth for both.
async function verifySession(): Promise<AdminSession | null> {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_URL}/admin/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      clearToken();
      return null;
    }
    const body = await res.json();
    return { name: body.admin.name, email: body.admin.email, role: body.admin.role };
  } catch {
    return null;
  }
}

// Shared guard for every protected admin page: redirects to /admin if
// there's no valid session, otherwise returns the logged-in admin's info.
export function useRequireAdmin() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminSession | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    verifySession().then((session) => {
      if (cancelled) return;
      if (!session) {
        router.replace("/admin");
      } else {
        setAdmin(session);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  return admin; // undefined = still checking, null = redirecting, object = ready
}

export function logout(router: ReturnType<typeof useRouter>) {
  clearToken();
  router.replace("/admin");
}
