import { after, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendInquiryNotification } from "@/lib/email";
import { clientIp } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";
import { normalizeReferralCode } from "@/lib/affiliate/client";
import { parseReferral, REFERRAL_COOKIE } from "@/lib/affiliate/referral-cookie";
import { relayInquiry, type AffiliateMeta } from "@/lib/affiliate/relay";
import { COMMITMENT_OPTIONS, VALET_OPTIONS, calculateQuote, referralCommitment, MODULE_SQFT } from "@/lib/calculator";
import type { InquiryType, PartnerKind } from "@/types/database";

const VALID_TYPES: InquiryType[] = ["contact", "personal", "corporate", "partner"];
const PARTNER_KINDS: PartnerKind[] = ["affiliate", "business"];
const MAX_BODY_BYTES = 20_000;
const MAX_FIELD = { name: 200, email: 320, phone: 32, company_name: 200, address: 500, message: 2000 };

// Allow-listed metadata keys only — never persist arbitrary client JSON.
// partnerKind distinguishes the /partner page's two audiences (individual
// affiliates vs B2B partners) without needing a separate inquiry type.
function sanitizeMetadata(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object") return {};
  const raw = input as Record<string, unknown>;
  const metadata: Record<string, unknown> = {};
  if (typeof raw.partnerKind === "string" && PARTNER_KINDS.includes(raw.partnerKind as PartnerKind)) {
    metadata.partnerKind = raw.partnerKind;
  }
  return metadata;
}

/**
 * Calculator submissions send their selections, and the quote is recomputed
 * here from those — the browser's numbers are never trusted. The referral
 * plan only counts if a promo code is also present (the affiliate system
 * re-checks the code when the lead is relayed).
 */
function calculatorMetadata(input: unknown, hasPromoCode: boolean): Record<string, unknown> | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;
  const numUnits = Number(raw.numUnits);
  if (!Number.isInteger(numUnits) || numUnits < 1 || numUnits > 500) return null;

  const valet = VALET_OPTIONS.find((v) => v.id === raw.valet);
  const commitment =
    raw.commitment === "referral" && hasPromoCode
      ? referralCommitment({ commitment_months: 4, free_months: 1 })
      : COMMITMENT_OPTIONS.find((c) => c.id === raw.commitment);
  if (!valet || !commitment) return null;

  const quote = calculateQuote({ numUnits, commitment, valet });
  return {
    source: "storage_calculator",
    moduleSqft: MODULE_SQFT,
    numUnits,
    commitment: commitment.id,
    billedMonths: quote.billedMonths,
    valet: valet.id,
    estimatedMonthly: quote.discountedMonthly,
    estimatedTotal: quote.totalCost,
    savings: quote.savings,
    co2SavedKg: quote.co2SavedKg,
    treesSaved: quote.treesSaved,
    quote: {
      numUnits,
      commitment: commitment.id,
      commitmentMonths: commitment.months,
      freeMonths: commitment.freeMonths,
      valet: valet.id,
      estimatedMonthly: quote.discountedMonthly,
      estimatedTotal: quote.totalCost,
    },
  };
}

function field(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { type, name, email, phone, company_name, address, message, website, metadata, calculator, promo_code, turnstile_token } =
    body as Record<string, unknown>;

  // Honeypot: real users never fill this hidden field. Bots that do get a
  // fake success response so they don't learn to skip it.
  if (typeof website === "string" && website.trim()) {
    return NextResponse.json({ ok: true });
  }

  if (!VALID_TYPES.includes(type as InquiryType)) {
    return NextResponse.json({ error: "Invalid inquiry type" }, { status: 400 });
  }
  const cleanName = field(name, MAX_FIELD.name);
  const cleanEmail = field(email, MAX_FIELD.email);
  if (!cleanName || !cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return NextResponse.json({ error: "Name and a valid email are required" }, { status: 400 });
  }

  if (!(await verifyTurnstile(turnstile_token, clientIp(request)))) {
    return NextResponse.json({ error: "Security check failed. Please try again." }, { status: 403 });
  }

  // Referral signals: a typed code (any form except /partner) and the ?ref= cookie.
  const referralEligible = type !== "partner";
  const promoCode = referralEligible ? normalizeReferralCode(promo_code) : null;
  const ref = referralEligible ? parseReferral((await cookies()).get(REFERRAL_COOKIE)?.value) : null;

  const meta = calculator !== undefined ? calculatorMetadata(calculator, Boolean(promoCode)) : sanitizeMetadata(metadata);
  if (meta === null) {
    return NextResponse.json({ error: "Invalid calculator selection" }, { status: 400 });
  }
  if (promoCode || ref) {
    const affiliate: AffiliateMeta = {
      promoCode,
      refCode: ref?.code ?? null,
      linkClickedAt: ref?.clickedAt.toISOString() ?? null,
      relay: "pending",
      attempts: 0,
    };
    meta.affiliate = affiliate;
  }

  const inquiry = {
    type: type as InquiryType,
    name: cleanName,
    email: cleanEmail,
    phone: field(phone, MAX_FIELD.phone),
    company_name: field(company_name, MAX_FIELD.company_name),
    address: field(address, MAX_FIELD.address),
    message: field(message, MAX_FIELD.message),
    metadata: meta,
  };

  let saved: { id: string; created_at: string };
  try {
    const { data, error } = await createAdminClient()
      .from("inquiries")
      .insert(inquiry)
      .select("id, created_at")
      .single();
    if (error || !data) throw error;
    saved = data;
  } catch {
    return NextResponse.json({ error: "Could not save your message. Please try again." }, { status: 500 });
  }

  // After the response: email the team and relay any referral, so the
  // visitor never waits on (or sees failures from) either.
  after(async () => {
    await Promise.allSettled([
      sendInquiryNotification(inquiry),
      meta.affiliate ? relayInquiry({ ...inquiry, ...saved }) : Promise.resolve(),
    ]);
  });

  return NextResponse.json({ ok: true });
}
