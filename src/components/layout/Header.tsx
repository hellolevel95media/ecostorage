"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/layout/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { NAV_LINKS } from "@/lib/nav";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Scrolls away naturally with the page on mobile (per design brief);
          pinned to the top on desktop as before. */}
      <header className="relative border-b border-border bg-background/90 shadow-sm shadow-black/5 backdrop-blur lg:sticky lg:top-0 lg:z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Logo />

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => {
              const active =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-brand/10 text-brand-ink ring-1 ring-brand/20"
                      : "text-foreground/70 hover:text-brand-ink"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:block">
            <ButtonLink href="/contact">Get a Quote</ButtonLink>
          </div>
        </div>
      </header>

      {/* Floating mobile nav: always on-screen (not tied to header scroll
          position) so it stays reachable once the header has scrolled away. */}
      <div
        className="fixed z-[70] lg:hidden"
        style={{ top: "calc(1rem + var(--safe-t))", right: "calc(1rem + var(--safe-r))" }}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation"
          aria-expanded={open}
          className="flex h-11 w-11 flex-col items-center justify-center gap-[3px] rounded-full border border-border bg-background/95 shadow-card backdrop-blur"
        >
          <span className="sr-only">Menu</span>
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              aria-hidden="true"
              className="h-[2px] w-5 rounded-full bg-foreground"
            />
          ))}
        </button>

        {open && (
          <nav className="absolute top-full right-0 mt-2 flex w-56 flex-col gap-1 rounded-2xl border border-border bg-background/95 p-3 shadow-card-hover backdrop-blur">
            {NAV_LINKS.map((link) => {
              const active =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium ${
                    active ? "bg-brand/10 text-brand-ink" : "text-foreground/70"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <ButtonLink href="/contact" className="mt-2 w-full" onClick={() => setOpen(false)}>
              Get a Quote
            </ButtonLink>
          </nav>
        )}
      </div>
    </>
  );
}
