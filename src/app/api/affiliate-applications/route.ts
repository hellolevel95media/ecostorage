import { NextResponse } from "next/server";
import { clientIp } from "@/lib/rate-limit";
import { postToAffiliate } from "@/lib/affiliate/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendInquiryNotification } from "@/lib/email";

/**
 * /partner "Become an affiliate" form. Forwarded server-to-server (signed)
 * to the affiliate system, which verifies the Turnstile token itself (tokens
 * are single-use, so this route must NOT verify it) and owns the review
 * queue. If the affiliate system is unreachable, the application is kept as
 * a partner inquiry here so it isn't lost.
 */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function field(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > 10_000) {
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  }
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Honeypot.
  if (typeof body.website === "string" && body.website.trim()) return NextResponse.json({ ok: true });

  const application = {
    full_name: field(body.name, 200),
    email: field(body.email, 320).toLowerCase(),
    phone: field(body.phone, 32),
    promotion_plan: field(body.promotion_plan, 2000),
    contact_consent: body.consent === true,
    preferred_locale: body.locale === "zh-Hans" ? "zh-Hans" : "en",
  };
  if (!application.full_name || !EMAIL.test(application.email)) {
    return NextResponse.json({ error: "Name and a valid email are required." }, { status: 400 });
  }
  if (!application.contact_consent) {
    return NextResponse.json({ error: "Please agree to be contacted about the programme." }, { status: 400 });
  }

  const ip = clientIp(request);
  const result = await postToAffiliate("/api/applications", {
    ...application,
    phone: application.phone || undefined,
    promotion_plan: application.promotion_plan || undefined,
    turnstile_token: field(body.turnstile_token, 2048),
    client_ip: ip === "unknown" ? undefined : ip,
  });

  if (result?.status === 201) return NextResponse.json({ ok: true });
  if (result?.status === 409) return NextResponse.json({ ok: true, alreadyReceived: true });
  if (result?.status === 403) {
    return NextResponse.json({ error: "Security check failed. Please try again." }, { status: 403 });
  }
  if (result?.status === 429) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }
  if (result?.status === 400) {
    const message = typeof result.data.error === "string" ? result.data.error : "Please check your details.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // Unreachable / misconfigured / 5xx: keep the application rather than lose it.
  const fallback = {
    type: "partner" as const,
    name: application.full_name,
    email: application.email,
    phone: application.phone || null,
    company_name: null,
    address: null,
    message: application.promotion_plan || null,
    metadata: { partnerKind: "affiliate", affiliateSystemUnavailable: true },
  };
  const { error } = await createAdminClient().from("inquiries").insert(fallback);
  if (error) return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  sendInquiryNotification(fallback).catch(() => {});
  return NextResponse.json({ ok: true });
}
