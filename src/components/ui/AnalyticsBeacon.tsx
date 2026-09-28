"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { hasAnalyticsConsent } from "@/components/ui/CookieConsent";

function sendBeacon(path: string) {
  if (path.startsWith("/admin") || !hasAnalyticsConsent()) return;
  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, referrer: document.referrer || null }),
    keepalive: true,
  }).catch(() => {});
}

export function AnalyticsBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    sendBeacon(pathname);

    function onConsentChange() {
      sendBeacon(pathname);
    }
    window.addEventListener("cookie-consent-change", onConsentChange);
    return () => window.removeEventListener("cookie-consent-change", onConsentChange);
  }, [pathname]);

  return null;
}
