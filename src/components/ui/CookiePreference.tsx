"use client";

import { useId, useSyncExternalStore } from "react";
import { readConsentLevel, setCookieConsent, type ConsentLevel } from "@/components/ui/CookieConsent";

function subscribe(onChange: () => void) {
  window.addEventListener("cookie-consent-change", onChange);
  return () => window.removeEventListener("cookie-consent-change", onChange);
}

const LEVELS: { id: ConsentLevel; label: string; detail: string; badge?: string }[] = [
  {
    id: "accepted",
    label: "Full analytics",
    badge: "Recommended",
    detail: "Anonymous visit data with a Google Analytics cookie, so we can tell a returning visitor from a new one.",
  },
  {
    id: "anonymous",
    label: "Anonymous analytics, no cookies",
    detail: "Page views and clicks are counted without any cookie or identifier. We cannot see repeat visits.",
  },
  {
    id: "declined",
    label: "Off",
    detail: "No analytics at all. Essential cookies for signed-in staff still apply.",
  },
];

/** Three-way analytics setting on /cookies. Undecided visitors show as "Full analytics". */
export function CookiePreference() {
  const name = useId();
  const stored = useSyncExternalStore(subscribe, () => readConsentLevel() ?? "accepted", () => "pending" as const);
  if (stored === "pending") return null;

  return (
    <fieldset className="rounded-xl border border-border bg-card p-4">
      <legend className="px-1 text-sm font-semibold text-foreground">Analytics on this device</legend>
      <div className="mt-2 space-y-3">
        {LEVELS.map((opt) => (
          <label key={opt.id} className="flex cursor-pointer gap-3 text-sm">
            <input
              type="radio"
              name={name}
              value={opt.id}
              checked={stored === opt.id}
              onChange={() => setCookieConsent(opt.id)}
              className="mt-0.5 accent-brand"
            />
            <span>
              <span className="font-medium text-foreground">{opt.label}</span>
              {opt.badge && (
                <span className="ml-2 rounded-full bg-brand/15 px-2 py-0.5 text-xs font-medium text-brand-ink">{opt.badge}</span>
              )}
              <span className="block text-foreground/70">{opt.detail}</span>
            </span>
          </label>
        ))}
      </div>
      <p className="mt-3 text-xs text-foreground/60">Changes apply immediately and are remembered on this browser.</p>
    </fieldset>
  );
}
