const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// Shared server-side fetch helper for the public API — centralizes the base
// URL, cache/revalidate window, and the try/catch-to-null fallback that every
// page needs so a backend hiccup renders an empty state instead of blocking
// or crashing the page.
const TIMEOUT_MS = 2500;

export async function apiFetch<T>(path: string, revalidate = 3600): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  // Belt-and-suspenders timeout: `controller.abort()` above is the real
  // cancellation attempt, but Next's fetch-cache wrapper (the `next.revalidate`
  // option below) has known edge cases where it doesn't forward an abort
  // signal to the underlying request, letting the fetch hang far past its
  // nominal timeout. Racing against a plain `setTimeout` guarantees this
  // function returns within TIMEOUT_MS regardless of whether the abort
  // actually reaches the socket — an abandoned fetch left running in the
  // background is fine; a blocked page render is not.
  const guard = new Promise<null>((resolve) => setTimeout(() => resolve(null), TIMEOUT_MS + 50));

  try {
    const result = await Promise.race([
      fetch(`${API_URL}${path}`, { next: { revalidate }, signal: controller.signal }).then((res) =>
        res.ok ? (res.json() as Promise<T>) : null
      ),
      guard,
    ]);
    return result;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export { API_URL };
