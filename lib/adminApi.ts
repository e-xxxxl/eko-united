import { API_URL } from "@/lib/api";
import { getToken, clearToken } from "@/lib/adminAuth";

// Shared client-side fetch helper for every /api/admin/* call — attaches the
// Bearer token every protected backend route expects, and centralizes the
// "token is missing/expired" handling (clear it and force back to /admin)
// so individual admin pages don't each reimplement 401 handling.
export async function adminFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  if (!token) {
    clearToken();
    window.location.href = "/admin";
    throw new Error("Not signed in");
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}/admin${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
  } catch {
    throw new Error("Can't reach the server right now. Check your connection and try again.");
  }

  if (res.status === 401) {
    clearToken();
    window.location.href = "/admin";
    throw new Error("Your session expired — please sign in again.");
  }

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || "Something went wrong. Please try again.");
  }
  return body as T;
}

// Call right after a successful create/update/delete so the change shows up
// on the public site immediately instead of waiting out that page's cache
// window (up to an hour for some pages). Best-effort: a failed revalidation
// doesn't fail the save, it just means the public page falls back to its
// normal cache window.
export async function revalidatePublicPaths(paths: string[]) {
  const token = getToken();
  if (!token) return;
  try {
    await fetch("/api/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ paths }),
    });
  } catch {
    // intentionally swallowed — see comment above
  }
}
