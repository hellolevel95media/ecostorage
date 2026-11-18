/**
 * Meta Pixel and TikTok Pixel event helpers.
 *
 * The pixels only exist on the page when MarketingPixels.tsx has loaded them,
 * which happens at the "accepted" consent level only, when a pixel ID is set,
 * and never on /admin. Every call here is a silent no-op otherwise. No
 * personal data is ever passed: events carry no name, email, phone or message.
 */

import { readConsentLevel } from "@/components/ui/CookieConsent";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    ttq?: {
      track: (event: string, params?: Record<string, unknown>) => void;
      page: () => void;
      grantConsent?: () => void;
      revokeConsent?: () => void;
    };
  }
}

type PixelEvent = "lead" | "contact";

/** Fires the pixel equivalent of an enquiry (lead) or a WhatsApp click (contact). */
export function trackPixel(event: PixelEvent): void {
  if (typeof window === "undefined") return;
  if ((readConsentLevel() ?? "accepted") !== "accepted") return;
  try {
    if (typeof window.fbq === "function") window.fbq("track", event === "lead" ? "Lead" : "Contact");
    if (window.ttq && typeof window.ttq.track === "function") window.ttq.track(event === "lead" ? "SubmitForm" : "Contact");
  } catch {
    // Pixels must never break the page.
  }
}
