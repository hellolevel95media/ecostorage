import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { postToAffiliate } from "@/lib/affiliate/client";
import type { Inquiry } from "@/types/database";

/**
 * Relay of customer enquiries to Novac (EcoStorage's CRM), which records
 * every one as a lead and, when a referral code or link is attached, decides
 * the affiliate referral. /partner enquiries stay on the website.
 *
 * Referral details (only when present) live in inquiries.metadata.affiliate:
 *   { promoCode, refCode, linkClickedAt }
 * Relay state lives in inquiries.metadata.novac:
 *   { relay: "pending"|"sent"|"failed", attempts, lastAttemptAt?, attributed? }
 * The relay runs right after the enquiry is saved; anything still
 * pending/failed is retried by /api/cron/affiliate-relay for up to 7 days
 * (Novac's accepted window).
 */

export type AffiliateMeta = {
  promoCode: string | null;
  refCode: string | null;
  linkClickedAt: string | null;
};

export type RelayMeta = {
  relay: "pending" | "sent" | "failed";
  attempts: number;
  lastAttemptAt?: string;
  attributed?: boolean;
};

export const MAX_RELAY_ATTEMPTS = 10;
export const RELAY_WINDOW_DAYS = 7;

type RelayInquiry = Pick<Inquiry, "id" | "type" | "name" | "email" | "phone" | "company_name" | "address" | "message" | "metadata" | "created_at">;

export async function relayInquiry(inquiry: RelayInquiry) {
  const meta = inquiry.metadata as Record<string, unknown>;
  const state = meta.novac as RelayMeta | undefined;
  if (!state || state.relay === "sent") return;
  const affiliate = meta.affiliate as AffiliateMeta | undefined;

  const isCalculator = meta.source === "storage_calculator";
  const result = await postToAffiliate("/api/webhooks/lead", {
    main_site_inquiry_id: inquiry.id,
    source: isCalculator ? "calculator" : "contact_form",
    inquiry_type: inquiry.type,
    full_name: inquiry.name,
    email: inquiry.email,
    phone: inquiry.phone,
    company_name: inquiry.company_name,
    address: inquiry.address,
    message: inquiry.message,
    submitted_at: inquiry.created_at,
    promo_code: affiliate?.promoCode ?? null,
    ref_code: affiliate?.refCode ?? null,
    link_clicked_at: affiliate?.linkClickedAt ?? null,
    quote: isCalculator ? (meta.quote ?? {}) : meta.movingQuote === true ? { movingQuote: true } : {},
  });

  const attempts = state.attempts + 1;
  let next: RelayMeta;
  if (result && (result.status === 200 || result.status === 202)) {
    // 200: referral decided; 202: recorded as a lead, no referral.
    next = { relay: "sent", attempts, attributed: result.data.attributed === true };
  } else if (result && (result.status === 400 || result.status === 413)) {
    // Rejected input: retrying won't help. Leave it visible as failed.
    next = { relay: "failed", attempts: MAX_RELAY_ATTEMPTS };
  } else {
    // Unreachable, 5xx, or a setup problem (401 signature, 404 not deployed
    // yet) that may be fixed within the retry window.
    next = { relay: "failed", attempts };
  }
  next.lastAttemptAt = new Date().toISOString();

  await createAdminClient()
    .from("inquiries")
    .update({ metadata: { ...meta, novac: next } })
    .eq("id", inquiry.id);
}
