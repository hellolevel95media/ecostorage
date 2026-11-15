"use client";

import { useSyncExternalStore } from "react";
import { COOKIE_CONSENT_KEY, setCookieConsent } from "@/components/ui/CookieConsent";

function subscribe(onChange: () => void) {
  window.addEventListener("cookie-consent-change", onChange);
  return () => window.removeEventListener("cookie-consent-change", onChange);
}

/** Shows the visitor's current analytics choice on /cookies and lets them change it. */
export function CookiePreference() {
  const choice = useSyncExternalStore(subscribe, () => localStorage.getItem(COOKIE_CONSENT_KEY), () => "pending");
  if (choice === "pending") return null;
  const optedOut = choice === "declined";

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-sm">
        Analytics cookies on this device are currently{" "}
        <span className="font-semibold text-foreground">{optedOut ? "off" : "on"}</span>.
      </p>
      <button
        type="button"
        onClick={() => setCookieConsent(optedOut ? "accepted" : "declined")}
        className="mt-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:border-brand/60"
      >
        {optedOut ? "Turn analytics on" : "Opt out of analytics"}
      </button>
    </div>
  );
}
