"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { COOKIE_CONSENT_KEY } from "@/components/ui/CookieConsent";

const RAW_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
// Only a well-formed G- ID is ever written into the inline script.
const GA_ID = RAW_ID && /^G-[A-Z0-9]{4,16}$/.test(RAW_ID) ? RAW_ID : null;

function subscribe(onChange: () => void) {
  window.addEventListener("cookie-consent-change", onChange);
  return () => window.removeEventListener("cookie-consent-change", onChange);
}

/**
 * Google Analytics 4. Loads only when a measurement ID is configured AND the
 * visitor has accepted analytics cookies, and never on /admin. GA4's enhanced
 * measurement records client-side page changes itself, so one load per visit
 * is enough. Feeds the dashboard at /admin/analytics.
 */
export function GoogleAnalytics() {
  const pathname = usePathname();
  const accepted = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(COOKIE_CONSENT_KEY) === "accepted",
    () => false,
  );

  if (!GA_ID || !accepted || pathname.startsWith("/admin")) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true});`}
      </Script>
    </>
  );
}
