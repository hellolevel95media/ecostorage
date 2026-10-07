import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { postToAffiliate } from "@/lib/affiliate/client";
import type { Inquiry } from "@/types/database";

/**
 * Relay of referred enquiries to the affiliate system.
 *
 * Referral details live in inquiries.metadata.affiliate:
 *   { promoCode, refCode, linkClickedAt, relay: "pending"|"sent"|"skipped"|"failed",
 *     attempts, lastAttemptAt, attributed? }
 * The relay runs right after the enquiry is saved; anything still
 * pending/failed is retried by /api/cron/affiliate-relay for up to 7 days
 * (the affiliate system's accepted window).
 */

export type AffiliateMeta = {
  promoCode: string | null;
  refCode: string | null;
  linkClickedAt: string | null;
  relay: "pending" | "sent" | "skipped" | "failed";
  attempts: number;
  lastAttemptAt?: string;
  attributed?: boolean;
};

export const MAX_RELAY_ATTEMPTS = 10;
export const RELAY_WINDOW_DAYS = 7;

export async function relayInquiry(inquiry: Pick<Inquiry, "id" | "name" | "email" | "phone" | "metadata" | "created_at">) {
  const meta = inquiry.metadata as Record<string, unknown>;
  const affiliate = meta.affiliate as AffiliateMeta | undefined;
  if (!affiliate || affiliate.relay === "sent" || affiliate.relay === "skipped") return;

  const isCalculator = meta.source === "storage_calculator";
  const result = await postToAffiliate("/api/webhooks/lead", {
    main_site_inquiry_id: inquiry.id,
    source: isCalculator ? "calculator" : "contact_form",
    full_name: inquiry.name,
    email: inquiry.email,
    phone: inquiry.phone,
    submitted_at: inquiry.created_at,
    promo_code: affiliate.promoCode,
    ref_code: affiliate.refCode,
    link_clicked_at: affiliate.linkClickedAt,
    // No customer records on the main site yet; prior enquiries aren't
    // customers. The affiliate system still blocks repeat referrals. Wire
    // this to real customer data once billing exists.
    is_existing_customer: false,
    quote: isCalculator ? (meta.quote ?? {}) : {},
  });

  const attempts = affiliate.attempts + 1;
  let next: AffiliateMeta;
  if (result && result.status === 200) {
    next = { ...affiliate, relay: "sent", attempts, attributed: result.data.attributed === true };
  } else if (result && result.status === 202) {
    next = { ...affiliate, relay: "skipped", attempts };
  } else if (result && result.status >= 400 && result.status < 500 && result.status !== 429) {
    // Rejected input or signature: retrying won't help. Leave it visible as failed.
    next = { ...affiliate, relay: "failed", attempts: MAX_RELAY_ATTEMPTS };
  } else {
    next = { ...affiliate, relay: "failed", attempts };
  }
  next.lastAttemptAt = new Date().toISOString();

  await createAdminClient()
    .from("inquiries")
    .update({ metadata: { ...meta, affiliate: next } })
    .eq("id", inquiry.id);
}
