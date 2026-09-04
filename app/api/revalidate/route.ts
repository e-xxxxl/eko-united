import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { API_URL } from "@/lib/api";

// Why this exists: public pages fetch with `next: { revalidate: N }`, which
// caches the response for N seconds regardless of the underlying data
// changing — an admin saving a change wouldn't see it reflected on the
// public site until that window expired (up to an hour, for some pages).
// This route lets an admin mutation force an immediate refresh of the
// specific public paths it affects, right after the save succeeds.
//
// Auth: reuses the existing admin session instead of a separate secret —
// the caller's Bearer token is verified against the backend's own
// /admin/auth/me before anything gets revalidated.
export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing token" }, { status: 401 });
  }

  let meRes: Response;
  try {
    meRes = await fetch(`${API_URL}/admin/auth/me`, { headers: { Authorization: auth } });
  } catch {
    return NextResponse.json({ error: "Can't verify session" }, { status: 502 });
  }
  if (!meRes.ok) {
    return NextResponse.json({ error: "Invalid or expired session" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const paths = Array.isArray(body.paths) ? body.paths : [];

  for (const path of paths) {
    if (typeof path === "string" && path.startsWith("/")) {
      revalidatePath(path);
    }
  }

  return NextResponse.json({ revalidated: true, paths });
}
