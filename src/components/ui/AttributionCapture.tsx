"use client";

import { useEffect } from "react";
import { readConsentLevel } from "@/components/ui/CookieConsent";
import { captureAttribution } from "@/lib/attribution";

/**
 * Keeps the first utm_* tags a visitor arrives with (see lib/attribution.ts).
 * Runs on the first load and again if consent changes while the tags are
 * still in the URL. Never stores anything unless analytics is "accepted"
 * (undecided visitors count as accepted, the site's opt-out default).
 */
export function AttributionCapture() {
  useEffect(() => {
    function capture() {
      if (window.location.pathname.startsWith("/admin")) return;
      if ((readConsentLevel() ?? "accepted") !== "accepted") return;
      captureAttribution(new URL(window.location.href), document.referrer);
    }
    capture();
    window.addEventListener("cookie-consent-change", capture);
    return () => window.removeEventListener("cookie-consent-change", capture);
  }, []);

  return null;
}
