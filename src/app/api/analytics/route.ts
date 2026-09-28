import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const MAX_BODY_BYTES = 20_000;

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  }

  const body = await request.json().catch(() => null);
  const path = body && typeof body.path === "string" ? body.path.slice(0, 500) : null;

  if (!path) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const referrer = typeof body.referrer === "string" ? body.referrer.slice(0, 500) : null;
  const userAgent = request.headers.get("user-agent")?.slice(0, 500) ?? null;

  try {
    const supabase = await createServerSupabaseClient();
    await supabase.from("page_views").insert({ path, referrer, user_agent: userAgent });
  } catch {
    // Analytics is best-effort — a DB hiccup shouldn't surface as a broken
    // page for the visitor whose pageview triggered this beacon.
  }

  return NextResponse.json({ ok: true });
}
