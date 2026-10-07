import "server-only";
import { createHmac } from "node:crypto";

/**
 * Signed server-to-server calls to the separate affiliate system
 * (ecostorage-affiliates). Spec: D:\ecostorage-affiliates\docs\main-site-integration.md.
 *
 *   X-Eco-Timestamp: <unix seconds>
 *   X-Eco-Signature: v1=<hex HMAC-SHA256(AFFILIATE_WEBHOOK_SECRET, `${ts}.${rawBody}`)>
 *
 * Everything here degrades gracefully: if the affiliate system isn't
 * configured or reachable, callers get `null` and the visitor's enquiry
 * still goes through.
 */

export function affiliateConfigured() {
  return Boolean(process.env.AFFILIATE_API_URL && (process.env.AFFILIATE_WEBHOOK_SECRET?.length ?? 0) >= 32);
}

export type AffiliateResponse = { status: number; data: Record<string, unknown> };

export async function postToAffiliate(
  path: string,
  body: Record<string, unknown>,
  timeoutMs = 5000
): Promise<AffiliateResponse | null> {
  if (!affiliateConfigured()) return null;

  // Sign the exact bytes that are sent.
  const raw = JSON.stringify(body);
  const ts = String(Math.floor(Date.now() / 1000));
  const signature = createHmac("sha256", process.env.AFFILIATE_WEBHOOK_SECRET!).update(`${ts}.${raw}`).digest("hex");

  try {
    const res = await fetch(new URL(path, process.env.AFFILIATE_API_URL), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Eco-Timestamp": ts,
        "X-Eco-Signature": `v1=${signature}`,
      },
      body: raw,
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    return { status: res.status, data };
  } catch {
    return null;
  }
}

/** Referral codes: 8 chars, no look-alike letters (I, O, 0, 1). */
const CODE = /^[A-HJ-NP-Z2-9]{8}$/;

export function normalizeReferralCode(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const code = value.replace(/\s/g, "").toUpperCase();
  return CODE.test(code) ? code : null;
}
