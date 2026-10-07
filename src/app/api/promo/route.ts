import { NextResponse } from "next/server";
import { clientIp } from "@/lib/rate-limit";
import { normalizeReferralCode, postToAffiliate } from "@/lib/affiliate/client";

/**
 * Promo code check for the calculator / contact form. Proxies to the
 * affiliate system (signed), forwarding the visitor's IP so it can limit
 * guessing per visitor. Responds { valid, offer? } only — never who owns a
 * code.
 */
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

  const offer = result.data.offer as { commitment_months?: unknown; free_months?: unknown } | undefined;
  if (result.data.valid === true && Number.isInteger(offer?.commitment_months) && Number.isInteger(offer?.free_months)) {
    return NextResponse.json({
      valid: true,
      code,
      offer: { commitment_months: offer!.commitment_months, free_months: offer!.free_months },
    });
  }
  return NextResponse.json({ valid: false });
}
