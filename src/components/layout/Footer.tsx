import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { ContactForm } from "@/components/sections/ContactForm";
import { COMPANY, NAV_LINKS } from "@/lib/nav";

export function Footer() {
  return (
    <footer className="relative mt-10 border-t border-border bg-background">
      <div
        aria-hidden
        className="h-px w-full bg-gradient-to-r from-transparent via-brand/60 to-transparent"
      />
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[0.9fr_0.6fr_1.4fr] lg:items-start lg:gap-10 lg:px-8">
        <div>
          <Logo />
          <p className="mt-2 max-w-xs text-sm text-foreground/60">
            Flexible personal and corporate storage, with pickup, delivery, and climate-controlled facilities across Singapore.
          </p>
          <address className="mt-2 space-y-0.5 text-sm text-foreground/60 not-italic">
            <p>{COMPANY.address}</p>
            <p>{COMPANY.email}</p>
            <p>{COMPANY.phone}</p>
          </address>
          <Link
            href={COMPANY.googleReviewUrl}
            className="mt-1 inline-flex min-h-11 items-center lg:min-h-0 lg:py-1 text-sm font-medium text-brand-ink hover:underline"
          >
            Leave us a Google review →
          </Link>
        </div>

        <nav aria-label="Footer navigation">
          <p className="text-xs font-semibold tracking-wide text-foreground/60 uppercase">Navigation</p>
          <ul className="mt-1 grid grid-cols-2 gap-x-4 text-sm text-foreground/70">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="inline-flex min-h-11 items-center lg:min-h-0 lg:py-1 hover:text-brand-ink">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <ContactForm type="contact" title="Quick contact" compact headingAs="h2" />
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-2 text-xs text-foreground/60 sm:flex-row sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} {COMPANY.name}. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="inline-flex min-h-11 items-center lg:min-h-0 lg:py-1 hover:text-brand-ink">
              Privacy Policy
            </Link>
            <Link href="/cookies" className="inline-flex min-h-11 items-center lg:min-h-0 lg:py-1 hover:text-brand-ink">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
