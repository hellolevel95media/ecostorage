"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { COOKIE_CONSENT_KEY } from "@/components/ui/CookieConsent";

const RAW_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
// Only a well-formed G- ID is ever written into the inline script.
const GA_ID = RAW_ID && /^G-[A-Z0-9]{4,16}$/.test(RAW_ID) ? RAW_ID : null;

function subscribe(onChange: () => void) {
  window.addEventListener("cookie-consent-change", onChange);
  return () => window.removeEventListener("cookie-consent-change", onChange);
}

// "pending" only during SSR/hydration; on the client it is the stored choice or null (undecided).
function readConsent() {
  return localStorage.getItem(COOKIE_CONSENT_KEY);
}

/**
 * Google Analytics 4 with Consent Mode v2 ("basic" opt-out model).
 *
 * Analytics storage is granted by default and the tag loads for every visitor
 * except on /admin; ad storage stays denied because the site runs no ads.
 * Choosing "Opt out" in the banner (or on /cookies) denies analytics storage
 * and sets Google's `ga-disable-<ID>` flag, which silences page views and
 * custom events immediately. Singapore's PDPA allows anonymous analytics on
 * an opt-out basis, unlike the GDPR opt-in model this replaced.
 */
export function GoogleAnalytics() {
  const pathname = usePathname();
  const consent = useSyncExternalStore(subscribe, readConsent, () => "pending");
  const declined = consent === "declined";
  const load = Boolean(GA_ID) && consent !== "pending" && !declined && !pathname.startsWith("/admin");

  // Visitor changed their mind after the tag was already on the page.
  useEffect(() => {
    if (!GA_ID || typeof window.gtag !== "function") return;
    (window as unknown as Record<string, boolean>)[`ga-disable-${GA_ID}`] = declined;
    window.gtag("consent", "update", { analytics_storage: declined ? "denied" : "granted" });
  }, [declined]);

  if (!load || !GA_ID) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true});`}
      </Script>
    </>
  );
}
