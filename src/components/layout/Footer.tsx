import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { ContactForm } from "@/components/sections/ContactForm";
import { COMPANY, NAV_LINKS } from "@/lib/nav";

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-border bg-background">
      <div
        aria-hidden
        className="h-px w-full bg-gradient-to-r from-transparent via-brand/60 to-transparent"
      />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.7fr_1.2fr] lg:gap-16 lg:px-8">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-foreground/60">
            Flexible personal and corporate storage, with pickup, delivery, and climate-controlled
            facilities.
          </p>
          <address className="mt-4 space-y-1 text-sm text-foreground/60 not-italic">
            <p>{COMPANY.address}</p>
            <p>{COMPANY.email}</p>
            <p>{COMPANY.phone}</p>
          </address>
          <Link
            href={COMPANY.googleReviewUrl}
            className="mt-4 inline-block text-sm font-medium text-brand hover:underline"
          >
            Leave us a Google review →
          </Link>
        </div>

        <nav aria-label="Footer navigation">
          <p className="text-xs font-semibold tracking-wide text-foreground/40 uppercase">Navigation</p>
          <ul className="mt-3 grid grid-cols-2 gap-2 text-sm text-foreground/70">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-brand">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <ContactForm type="contact" title="Quick contact" compact />
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-foreground/40 sm:flex-row sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} {COMPANY.name}. All rights reserved.
          </p>
          <Link href="/privacy" className="hover:text-brand">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
