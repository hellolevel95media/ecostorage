import { ButtonLink } from "@/components/ui/Button";
import type { SectionCopy } from "@/lib/fallback-content";
import { parseCommitments } from "@/lib/commitments";
import { TRUCKLOAD_14FT_RATE } from "@/lib/calculator";

/** How the fixed truck price works. Kept in code so it always matches the calculator. */
const TRUCK_NOTES = [
  "A full 14ft truck usually fits 4 to 6 pallets' worth. Boxes of books or clothes pack tightly; sofas, fridges and odd shapes take more room.",
  "Part loads are quoted to suit what you're moving. They aren't simply half price.",
  "Long push applies only when items go up or down a slope, or travel more than 100 m between the lift and the truck.",
  "Fragile wrapping depends on the item: a 55-inch TV needs basic wrapping, a 75-inch TV advanced wrapping.",
  "Specialist items such as grand pianos are handled by our partner movers and quoted separately.",
];

/**
 * Storage and moving, presented together: EcoStorage isn't lock-and-key, so
 * getting items to the warehouse is part of the service. Heading, intro,
 * promise cards and button come from the CMS (`moving` section); the price
 * card and the truck notes come from code.
 */
export function MovingBanner({ copy }: { copy: SectionCopy }) {
  const { intro, points } = parseCommitments(copy.body);
  const ctaText = copy.cta_text ?? "Get a storage and moving quote";
  const ctaLink = copy.cta_link ?? "/#quote";

  return (
    <section className="snap-section-flow mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface/60 px-6 py-8 shadow-card sm:px-10 sm:py-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-brand to-transparent"
        />
        <div className="grid gap-8 lg:grid-cols-[5fr_7fr] lg:gap-12">
          <div>
            <p className="text-xs font-semibold tracking-wide text-brand-ink uppercase">Storage + moving</p>
            <h2 className="mt-3 text-2xl font-bold text-balance sm:text-3xl">{copy.heading}</h2>
            {intro && <p className="mt-4 text-foreground/70">{intro}</p>}

            <div className="mt-6 rounded-2xl border-2 border-brand bg-card p-5">
              <p className="text-4xl font-bold text-brand-ink tabular-nums">
                S${TRUCKLOAD_14FT_RATE}
              </p>
              <p className="mt-1 font-semibold">per full 14ft truckload, with or without a tailgate</p>
              <p className="mt-1 text-sm text-foreground/70">
                Roughly a 3-room HDB, living room included. This is our current rate for everyone.
              </p>
              <p className="mt-3 rounded-lg bg-brand/10 px-3 py-2 text-sm text-foreground/80">
                <span className="font-semibold text-brand-ink">Valet customers:</span> S${TRUCKLOAD_14FT_RATE} is a price
                guarantee. It never goes higher while you&apos;re on a Valet plan.
              </p>
            </div>

            <div className="mt-6">
              <ButtonLink href={ctaLink}>{ctaText}</ButtonLink>
            </div>
          </div>

          {points.length > 0 && (
            <ul className="grid content-start gap-3 sm:grid-cols-2">
              {points.map((p) => (
                <li key={p.title + p.text} className="flex gap-3 rounded-xl border border-border bg-background/60 p-4">
                  <span
                    aria-hidden
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand-ink"
                  >
                    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="m4 10.5 4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <div>
                    {p.title && <p className="font-semibold">{p.title}</p>}
                    <p className="mt-1 text-sm text-foreground/70">{p.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-8 border-t border-border pt-6">
          <h3 className="text-sm font-semibold">How the truck price works</h3>
          <ul className="mt-3 grid gap-x-8 gap-y-2 text-sm text-foreground/70 md:grid-cols-2">
            {TRUCK_NOTES.map((note) => (
              <li key={note} className="flex gap-2">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                {note}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
