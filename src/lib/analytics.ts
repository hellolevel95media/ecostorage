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
  | { name: "generate_lead"; params: { form_type: LeadFormType; has_moving_quote: boolean; has_promo: boolean; num_units?: number; commitment?: string; valet?: string; premium_crate?: boolean } }
  | { name: "form_error"; params: { form_type: LeadFormType | "affiliate" | "promo"; reason: string } }
  | { name: "calculator_start"; params: { trigger: "size_guide" | "units" | "contact" } }
  | { name: "calculator_step"; params: { step: string } }
  | { name: "whatsapp_click"; params: { location: string } }
  | { name: "phone_click"; params: { location: string } }
  | { name: "email_click"; params: { location: string } }
  | { name: "promo_applied"; params: { free_months: number; commitment_months: number } }
  | { name: "affiliate_apply"; params: Record<string, never> };

export type LeadFormType = "contact" | "personal" | "corporate" | "partner" | "calculator";

export function trackEvent<E extends AnalyticsEvent>(name: E["name"], params: E["params"]): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  try {
    window.gtag("event", name, params);
  } catch {
    // Analytics must never break the page.
  }
}
