import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { MAX_RELAY_ATTEMPTS, RELAY_WINDOW_DAYS, relayInquiry, type RelayMeta } from "@/lib/affiliate/relay";

/**
 * Retries enquiries whose relay to Novac failed (e.g. it was briefly down). Called by Vercel Cron (vercel.json) with
 * `Authorization: Bearer ${CRON_SECRET}`.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret ?? ""}`);
  if (!secret || secret.length < 16 || given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const since = new Date(Date.now() - RELAY_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await createAdminClient()
    .from("inquiries")
    .select("id, type, name, email, phone, company_name, address, message, metadata, created_at")
    .gte("created_at", since)
    .in("metadata->novac->>relay", ["pending", "failed"])
    .order("created_at")
    .limit(50);
  if (error) return NextResponse.json({ error: "Query failed" }, { status: 500 });

  const due = (data ?? []).filter(
    (i) => ((i.metadata as { novac?: RelayMeta }).novac?.attempts ?? 0) < MAX_RELAY_ATTEMPTS
  );
  for (const inquiry of due) await relayInquiry(inquiry);

  return NextResponse.json({ retried: due.length });
}
