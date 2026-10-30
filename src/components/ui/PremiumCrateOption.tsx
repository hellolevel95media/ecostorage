"use client";

import { useId } from "react";
import { PREMIUM_CRATE, formatDollars } from "@/lib/calculator";

/**
 * Optional premium tier shown below the main calculator controls. It never
 * changes the standard estimate: ticking it only records interest, and our
 * team follows up with availability and a quote.
 */
export function PremiumCrateOption({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  const id = useId();
  return (
    <div className="rounded-2xl border-2 border-dashed border-foreground/25 bg-foreground/[0.03] p-4 sm:p-5">
      <p className="text-xs font-semibold tracking-wide text-foreground/60 uppercase">{PREMIUM_CRATE.tagline}</p>
      <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-base font-bold">{PREMIUM_CRATE.label}</p>
        <p className="text-sm font-semibold tabular-nums text-foreground/80">
          ${formatDollars(PREMIUM_CRATE.monthlyRate)}/mo · {PREMIUM_CRATE.sqft} sqft
        </p>
      </div>
      <p className="mt-2 text-sm text-foreground/70">{PREMIUM_CRATE.summary}</p>
      <ul className="mt-3 grid gap-1.5 text-sm text-foreground/80 sm:grid-cols-2">
        {PREMIUM_CRATE.features.map((feature) => (
          <li key={feature} className="flex gap-2">
            <span aria-hidden="true" className="text-brand-ink">
              ✓
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <label htmlFor={id} className="mt-4 flex cursor-pointer items-center gap-3 text-sm font-medium">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="h-5 w-5 shrink-0 cursor-pointer accent-brand"
        />
        <span>Tell me more about the Premium Wooden Crate</span>
      </label>
      {checked && (
        <p className="mt-2 text-xs text-foreground/60">
          This does not change your estimate above. Our team will confirm availability and send you a separate quote.
        </p>
      )}
    </div>
  );
}
