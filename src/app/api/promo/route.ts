import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clientIp } from "@/lib/rate-limit";
import { normalizeReferralCode, postToAffiliate } from "@/lib/affiliate/client";
import { parseReferral, REFERRAL_COOKIE } from "@/lib/affiliate/referral-cookie";
import type { PromoConditions, PromoDiscount } from "@/lib/calculator";

/**
 * Code check for the calculator / contact form. Proxies to the affiliate
 * system (signed), forwarding the visitor's IP so it can limit guessing per
 * visitor. Answers either an affiliate code ({ kind: "affiliate", offer }) or a
 * stand-alone promo code ({ kind: "promo", discount, conditions }) — never who
 * owns a code. One promotion per order: a promo code is refused when the visitor
 * arrived through an affiliate link (the link wins).
 */

const DURATIONS = ["first_month", "months", "contract"] as const;

function sanitizeDiscount(raw: unknown): PromoDiscount | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Record<string, unknown>;
  if (d.type !== "percent" && d.type !== "amount") return null;
  if (typeof d.value !== "number" || !Number.isFinite(d.value) || d.value <= 0) return null;
  if (!DURATIONS.includes(d.duration as (typeof DURATIONS)[number])) return null;
  const max = d.max_per_month;
  if (max !== null && max !== undefined && (typeof max !== "number" || !Number.isFinite(max) || max < 0)) return null;
  const months = d.months;
  if (months !== null && months !== undefined && (!Number.isInteger(months) || (months as number) < 1)) return null;
  if (d.duration === "months" && !Number.isInteger(months)) return null;
  return {
    type: d.type,
    value: d.value,
    max_per_month: typeof max === "number" ? max : null,
    duration: d.duration as PromoDiscount["duration"],
    months: typeof months === "number" ? months : null,
    label: typeof d.label === "string" ? d.label.slice(0, 120) : "",
  };
}

function sanitizeConditions(raw: unknown): PromoConditions {
  const c = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    new_customers_only: c.new_customers_only === true,
    // Unknown means the cautious reading: only Month-to-Month.
    plans_with_free_months: c.plans_with_free_months === true,
    not_with_referral: true,
  };
}

export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > 1_000) {
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  }
  const body = (await request.json().catch(() => null)) as { code?: unknown } | null;

  const code = normalizeReferralCode(body?.code);
  if (!code) return NextResponse.json({ valid: false });

  const ip = clientIp(request);
  const result = await postToAffiliate("/api/promo/validate", { code, client_ip: ip === "unknown" ? "0.0.0.0" : ip });

  if (!result) {
    return NextResponse.json({ error: "We couldn't check codes right now. Please try again shortly." }, { status: 503 });
  }
  if (result.status === 429) {
    return NextResponse.json({ error: "Too many attempts. Please try again in a few minutes." }, { status: 429 });
  }
  if (result.status !== 200) {
    return NextResponse.json({ error: "We couldn't check codes right now. Please try again shortly." }, { status: 503 });
  }
  if (result.data.valid !== true) return NextResponse.json({ valid: false });

  // Older Novac answers carry no "kind": that means an affiliate code.
  if (result.data.kind === "promo") {
    const discount = sanitizeDiscount(result.data.discount);
    if (!discount) return NextResponse.json({ valid: false });

    // The referral cookie is httpOnly, so only the server can see it.
    const ref = parseReferral((await cookies()).get(REFERRAL_COOKIE)?.value);
    if (ref) return NextResponse.json({ valid: false, reason: "referral_active" });

    return NextResponse.json({ valid: true, kind: "promo", code, discount, conditions: sanitizeConditions(result.data.conditions) });
  }

  const offer = result.data.offer as { commitment_months?: unknown; free_months?: unknown } | undefined;
  if (Number.isInteger(offer?.commitment_months) && Number.isInteger(offer?.free_months)) {
    return NextResponse.json({
      valid: true,
      kind: "affiliate",
      code,
      offer: { commitment_months: offer!.commitment_months, free_months: offer!.free_months },
    });
  }
  return NextResponse.json({ valid: false });
}
