import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

// Derive the Supabase host from the project URL so the CSP only allow-lists
// this project's own API/storage domain rather than all of *.supabase.co.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).origin : "https://*.supabase.co";

// Sentry's browser SDK posts error/trace reports straight to its ingest host
// (parsed from the DSN, e.g. https://oXXXXXX.ingest.us.sentry.io). Without
// this in connect-src, the CSP itself would silently block every report once
// a real NEXT_PUBLIC_SENTRY_DSN is configured.
const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const sentryIngestHost = sentryDsn ? new URL(sentryDsn).origin : null;

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${supabaseHost}`,
  `media-src 'self' blob: ${supabaseHost}`,
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseHost} https://vitals.vercel-insights.com https://va.vercel-scripts.com${sentryIngestHost ? ` ${sentryIngestHost}` : ""}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  // Drops the `X-Powered-By: Next.js` response header, which otherwise
  // fingerprints the framework (and indirectly narrows the version) for
  // anyone probing the site.
  poweredByHeader: false,
  async redirects() {
    return [{ source: "/zh", destination: "/resources/zh", permanent: true }];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Vercel adds its own HSTS header on custom domains, but setting
          // it here too means it's present regardless of host platform and
          // survives a future migration off Vercel.
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "level95media",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
