/**
 * Google Analytics 4 custom events.
 *
 * `gtag` only exists on the page once GoogleAnalytics.tsx has loaded it, which
 * happens after the visitor accepts analytics cookies and never on /admin.
 * Every call here is therefore a silent no-op without consent, without a
 * measurement ID, or on the server, and the consent gate lives in one place.
 *
 * Event names follow GA4 conventions (snake_case). `generate_lead` is a GA4
 * recommended event, so it can be marked as a key event in GA Admin.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export type AnalyticsEvent =
  | { name: "generate_lead"; params: { form_type: LeadFormType; has_moving_quote: boolean; has_promo: boolean; promo_article?: string; num_units?: number; commitment?: string; valet?: string; premium_crate?: boolean; utm_source?: string; utm_medium?: string; utm_campaign?: string; utm_content?: string } }
  | { name: "form_error"; params: { form_type: LeadFormType | "affiliate" | "promo"; reason: string } }
  | { name: "calculator_start"; params: { trigger: "size_guide" | "units" | "contact" } }
  | { name: "calculator_step"; params: { step: string } }
  | { name: "whatsapp_click"; params: { location: string } }
  | { name: "phone_click"; params: { location: string } }
  | { name: "email_click"; params: { location: string } }
  | { name: "promo_applied"; params: ({ free_months: number; commitment_months: number } | { kind: "promo"; discount_type: string; duration: string }) & { source: "link" | "typed"; article?: string } }
  | { name: "affiliate_apply"; params: Record<string, never> };

import { trackPixel } from "@/lib/pixels";

export type LeadFormType = "contact" | "personal" | "corporate" | "partner" | "calculator";

export function trackEvent<E extends AnalyticsEvent>(name: E["name"], params: E["params"]): void {
  if (typeof window === "undefined") return;
  // Marketing pixels (Meta, TikTok): a confirmed enquiry and a WhatsApp click.
  // generate_lead is only fired after the server confirms the enquiry saved.
  if (name === "generate_lead") trackPixel("lead");
  else if (name === "whatsapp_click") trackPixel("contact");
  if (typeof window.gtag !== "function") return;
  try {
    window.gtag("event", name, params);
  } catch {
    // Analytics must never break the page.
  }
}
