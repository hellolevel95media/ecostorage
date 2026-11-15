"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

export const COOKIE_CONSENT_KEY = "ecostorage-cookie-consent";

function subscribe(onChange: () => void) {
  window.addEventListener("cookie-consent-change", onChange);
  return () => window.removeEventListener("cookie-consent-change", onChange);
}

export function setCookieConsent(value: "accepted" | "declined") {
  localStorage.setItem(COOKIE_CONSENT_KEY, value);
  window.dispatchEvent(new Event("cookie-consent-change"));
}

/**
 * Opt-out notice. Analytics runs by default (see GoogleAnalytics.tsx); the
 * banner lets visitors switch it off and records that they have seen it.
 */
export function CookieConsent() {
  const visible = useSyncExternalStore(
    subscribe,
    () => !localStorage.getItem(COOKIE_CONSENT_KEY),
    () => false,
  );

  if (!visible) return null;

  // Centred, and raised above the WhatsApp button (bottom-right) until the
  // screen is wide enough for the two to sit side by side.
  return (
    <div className="fixed inset-x-4 bottom-24 z-50 mx-auto max-w-xl rounded-2xl border border-border bg-card p-4 shadow-card lg:bottom-6">
      <p className="text-sm text-foreground/80">
        We use essential cookies to run this site and anonymous analytics cookies to understand
        traffic. You can opt out here or at any time on our{" "}
        <Link href="/cookies" className="font-medium text-brand-ink hover:underline">
          Cookie Policy
        </Link>{" "}
        page.
      </p>
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setCookieConsent("declined")}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-foreground/60 hover:text-foreground"
        >
          Opt out
        </button>
        <button
          type="button"
          onClick={() => setCookieConsent("accepted")}
          className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-brand-foreground"
        >
          OK
        </button>
      </div>
    </div>
  );
}

/** True unless the visitor has opted out. Undecided visitors are counted. */
export function hasAnalyticsConsent() {
  return typeof window !== "undefined" && localStorage.getItem(COOKIE_CONSENT_KEY) !== "declined";
}
