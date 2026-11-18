"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

export const COOKIE_CONSENT_KEY = "ecostorage-cookie-consent";

/**
 * accepted  = full analytics (cookies allowed), the default for undecided visitors
 * anonymous = analytics without cookies (anonymous event pings only)
 * declined  = analytics off
 */
export type ConsentLevel = "accepted" | "anonymous" | "declined";

function subscribe(onChange: () => void) {
  window.addEventListener("cookie-consent-change", onChange);
  return () => window.removeEventListener("cookie-consent-change", onChange);
}

export function readConsentLevel(): ConsentLevel | null {
  const v = localStorage.getItem(COOKIE_CONSENT_KEY);
  return v === "accepted" || v === "anonymous" || v === "declined" ? v : null;
}

export function setCookieConsent(value: ConsentLevel) {
  localStorage.setItem(COOKIE_CONSENT_KEY, value);
  window.dispatchEvent(new Event("cookie-consent-change"));
}

/**
 * Opt-out notice. Analytics runs by default (see GoogleAnalytics.tsx); the
 * banner informs and points to /cookies, where visitors can change the level.
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
        We use essential cookies to run this site, analytics to see which pages help visitors, and
        Meta and TikTok pixels to measure our social media. You can change this any time in{" "}
        <Link href="/cookies" className="font-medium text-brand-ink hover:underline">
          cookie settings
        </Link>
        .
      </p>
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={() => setCookieConsent("accepted")}
          className="rounded-lg bg-brand px-4 py-1.5 text-sm font-medium text-brand-foreground"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

/** True unless the visitor has switched analytics off. Undecided visitors are counted. */
export function hasAnalyticsConsent() {
  return typeof window !== "undefined" && localStorage.getItem(COOKIE_CONSENT_KEY) !== "declined";
}
