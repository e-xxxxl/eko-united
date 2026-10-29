// After a new version of the site goes live, a page that was already open on a
// visitor's phone still holds the old code. Its next tap can then ask for
// files that no longer exist, which surfaces as a "chunk" or "failed to fetch"
// error. Reloading once fetches the new version and fixes it, so the visitor
// never needs to know. The sessionStorage stamp stops it looping if the
// problem is something a reload cannot fix.
const STALE = /ChunkLoadError|Loading chunk|Loading CSS chunk|Failed to load chunk|dynamically imported module|Failed to fetch|RSC payload|Importing a module script failed|Unexpected token '<'/i;
const KEY = "eko-stale-reload";

export function reloadIfStale(error: Error): boolean {
  if (!STALE.test(`${error?.name || ""} ${error?.message || ""}`)) return false;
  try {
    const last = Number(sessionStorage.getItem(KEY) || 0);
    if (Date.now() - last < 60_000) return false;
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch {
    return false;
  }
  window.location.reload();
  return true;
}
