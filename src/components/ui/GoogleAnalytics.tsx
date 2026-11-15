"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { readConsentLevel, type ConsentLevel } from "@/components/ui/CookieConsent";

const RAW_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
// Only a well-formed G- ID is ever written into the inline script.
const GA_ID = RAW_ID && /^G-[A-Z0-9]{4,16}$/.test(RAW_ID) ? RAW_ID : null;

function subscribe(onChange: () => void) {
  window.addEventListener("cookie-consent-change", onChange);
  return () => window.removeEventListener("cookie-consent-change", onChange);
}

// "pending" only during SSR/hydration; on the client it is the stored level or "accepted" (undecided).
function readLevel(): ConsentLevel | "pending" {
  return readConsentLevel() ?? "accepted";
}

/**
 * Google Analytics 4 with Consent Mode v2 (opt-out model, three levels).
 *
 * - accepted (default): tag loads, analytics_storage granted, cookies set.
 * - anonymous: tag loads with analytics_storage denied. Consent Mode then
 *   sends cookieless, unidentified pings, so page views and custom events are
 *   still counted (modelled in some reports) without any cookie.
 * - declined: tag does not load; if it already has, `ga-disable-<ID>` silences it.
 *
 * Ad storage is always denied because the site runs no ads. Never loads on
 * /admin. Singapore's PDPA allows anonymous analytics on an opt-out basis.
 */
export function GoogleAnalytics() {
  const pathname = usePathname();
  const level = useSyncExternalStore(subscribe, readLevel, () => "pending" as const);
  const declined = level === "declined";
  const storage = level === "accepted" ? "granted" : "denied";
  const load = Boolean(GA_ID) && level !== "pending" && !declined && !pathname.startsWith("/admin");

  // Visitor changed the level after the tag was already on the page.
  useEffect(() => {
    if (!GA_ID || typeof window.gtag !== "function") return;
    (window as unknown as Record<string, boolean>)[`ga-disable-${GA_ID}`] = declined;
    window.gtag("consent", "update", { analytics_storage: storage });
  }, [declined, storage]);

  if (!load || !GA_ID) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{analytics_storage:'${storage}',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true});`}
      </Script>
    </>
  );
}
