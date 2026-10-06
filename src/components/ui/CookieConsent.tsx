"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

export const COOKIE_CONSENT_KEY = "ecostorage-cookie-consent";

function subscribe(onChange: () => void) {
  window.addEventListener("cookie-consent-change", onChange);
  return () => window.removeEventListener("cookie-consent-change", onChange);
}

export function CookieConsent() {
  const visible = useSyncExternalStore(
    subscribe,
    () => !localStorage.getItem(COOKIE_CONSENT_KEY),
    () => false,
  );

  function choose(value: "accepted" | "declined") {
    localStorage.setItem(COOKIE_CONSENT_KEY, value);
    window.dispatchEvent(new Event("cookie-consent-change"));
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl rounded-2xl border border-border bg-card p-4 shadow-card sm:inset-x-auto sm:right-6 sm:bottom-6">
      <p className="text-sm text-foreground/80">
        We use essential cookies to run this site and, with your consent, anonymous analytics
        cookies to understand traffic. See our{" "}
        <Link href="/cookies" className="font-medium text-brand-ink hover:underline">
          Cookie Policy
        </Link>
        .
      </p>
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => choose("declined")}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-foreground/60 hover:text-foreground"
        >
          Decline
        </button>
        <button
          type="button"
          onClick={() => choose("accepted")}
          className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-brand-foreground"
        >
          Accept
        </button>
      </div>
    </div>
  );
}

export function hasAnalyticsConsent() {
  return typeof window !== "undefined" && localStorage.getItem(COOKIE_CONSENT_KEY) === "accepted";
}
