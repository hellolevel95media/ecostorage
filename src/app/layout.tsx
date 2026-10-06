import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono, Noto_Sans_SC } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppWidget } from "@/components/ui/WhatsAppWidget";
import { CookieConsent } from "@/components/ui/CookieConsent";
import { AnalyticsBeacon } from "@/components/ui/AnalyticsBeacon";
import { ToastHost } from "@/components/ui/ToastHost";
import { OrganizationJsonLd } from "@/components/seo/OrganizationJsonLd";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const appSans = Plus_Jakarta_Sans({
  variable: "--font-app-sans",
  subsets: ["latin"],
});

const appMono = JetBrains_Mono({
  variable: "--font-app-mono",
  subsets: ["latin"],
});

// Loaded globally but only actually applied via the :lang(zh) rule in
// globals.css — has zero effect on existing English pages, Plus Jakarta
// Sans doesn't cover CJK glyphs so Chinese article content needs this.
const appSC = Noto_Sans_SC({
  variable: "--font-app-sc",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

const description =
  "Flexible personal and corporate storage with on-demand pickup, delivery, and climate-controlled facilities.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "EcoStorage | Personal & Corporate Storage",
  description,
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "EcoStorage | Personal & Corporate Storage",
    description,
    url: SITE_URL,
    siteName: "EcoStorage",
    locale: "en_SG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EcoStorage | Personal & Corporate Storage",
    description,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Lets fixed/floating elements read env(safe-area-inset-*) on notched and
  // gesture-bar devices instead of treating those insets as zero.
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${appSans.variable} ${appMono.variable} ${appSC.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <OrganizationJsonLd />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppWidget />
        <CookieConsent />
        <AnalyticsBeacon />
        <ToastHost />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
