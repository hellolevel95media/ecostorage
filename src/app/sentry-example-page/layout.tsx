import type { ReactNode } from "react";

// The page itself is a client component (Sentry's own scaffolding), so it
// can't export `metadata` directly — this sibling layout is what actually
// keeps it out of search results until it's deleted (see todo.txt).
export const metadata = {
  robots: { index: false, follow: false },
};

export default function SentryExamplePageLayout({ children }: { children: ReactNode }) {
  return children;
}
