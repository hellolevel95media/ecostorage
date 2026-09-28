// Loaded only when a DSN is actually configured. `@sentry/nextjs` is a
// ~126KB gzip chunk on its own; a static import would ship it to every
// visitor on every page even while Sentry is unconfigured and doing nothing
// (see todo.txt item 4). Because NEXT_PUBLIC_SENTRY_DSN is inlined at build
// time, this branch — and the dynamic import inside it — is dead-code
// eliminated from the client bundle entirely until a DSN is set.
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  import("@sentry/nextjs").then((Sentry) => {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.1,
    });
  });
}
