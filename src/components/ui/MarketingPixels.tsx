"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { readConsentLevel, type ConsentLevel } from "@/components/ui/CookieConsent";

const RAW_META = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
const RAW_TIKTOK = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID?.trim();
// Only well-formed IDs are ever written into the inline scripts.
const META_ID = RAW_META && /^\d{8,20}$/.test(RAW_META) ? RAW_META : null;
const TIKTOK_ID = RAW_TIKTOK && /^[A-Z0-9]{10,32}$/.test(RAW_TIKTOK) ? RAW_TIKTOK : null;

function subscribe(onChange: () => void) {
  window.addEventListener("cookie-consent-change", onChange);
  return () => window.removeEventListener("cookie-consent-change", onChange);
}

function readLevel(): ConsentLevel | "pending" {
  return readConsentLevel() ?? "accepted";
}

/**
 * Meta Pixel and TikTok Pixel, loaded ONLY at the "accepted" consent level
 * (full analytics, the default). Anonymous and Off never load them. With no
 * pixel ID set in the environment nothing loads at all. Never on /admin.
 * If the visitor later drops below "accepted", consent is revoked on the
 * already-loaded pixels and trackPixel() stops firing events.
 */
export function MarketingPixels() {
  const pathname = usePathname();
  const level = useSyncExternalStore(subscribe, readLevel, () => "pending" as const);
  const allowed = level === "accepted" && !pathname.startsWith("/admin");
  const lastPath = useRef<string | null>(null);

  // Route changes in the app router are not page loads: report them as page views.
  useEffect(() => {
    if (!allowed) return;
    if (lastPath.current !== null && lastPath.current !== pathname) {
      window.fbq?.("track", "PageView");
      window.ttq?.page();
    }
    lastPath.current = pathname;
  }, [allowed, pathname]);

  useEffect(() => {
    if (level === "pending") return;
    if (level === "accepted") {
      window.fbq?.("consent", "grant");
      window.ttq?.grantConsent?.();
    } else {
      window.fbq?.("consent", "revoke");
      window.ttq?.revokeConsent?.();
    }
  }, [level]);

  if (!allowed) return null;

  return (
    <>
      {META_ID && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_ID}');fbq('track','PageView');`}
        </Script>
      )}
      {TIKTOK_ID && (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};ttq.load('${TIKTOK_ID}');ttq.page();}(window,document,'ttq');`}
        </Script>
      )}
    </>
  );
}
