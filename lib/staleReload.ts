// After a new version of the site goes live, a page that was already open on a
// visitor's phone still holds the old code. Its next tap can then ask for
// files that no longer exist, which surfaces as a "chunk" or "failed to fetch"
// error. Reloading once fetches the new version and fixes it, so the visitor
// never needs to know. The sessionStorage stamp stops it looping if the
// problem is something a reload cannot fix.
//
// The other way a stale tab shows up is a tab left open on the admin panel
// across a deploy: the page it already holds is the old code, it fetches the
// new page's code, and the two no longer agree on what each file exports. That
// surfaces as "(0 , x.gv) is not a function" (a minified import that is not
// there) or as webpack failing to find a module to call. Real bugs rarely look
// like either, and the stamp below means a real bug gets one reload at most.
const STALE = new RegExp(
  [
    "ChunkLoadError",
    "Loading chunk",
    "Loading CSS chunk",
    "Failed to load chunk",
    "dynamically imported module",
    "Failed to fetch",
    "RSC payload",
    "Importing a module script failed",
    "Unexpected token '<'",
    "\\(0\\s*,\\s*[\\w$]+\\.[\\w$]+\\)\\s*is not a function",
    "reading 'call'",
    "__webpack_modules__",
  ].join("|"),
  "i"
);
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
