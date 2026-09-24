"use client";

import { useMemo, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";

const UNIT_SIZES = [
  { id: "small", label: "Small (5x5)", monthlyRate: 49 },
  { id: "medium", label: "Medium (10x10)", monthlyRate: 99 },
  { id: "large", label: "Large (10x20)", monthlyRate: 169 },
  { id: "business", label: "Business pallet storage", monthlyRate: 259 },
] as const;

export function StorageCalculator() {
  const [unitId, setUnitId] = useState<(typeof UNIT_SIZES)[number]["id"]>("medium");
  const [months, setMonths] = useState(3);

  const unit = useMemo(() => UNIT_SIZES.find((u) => u.id === unitId)!, [unitId]);
  const estimate = unit.monthlyRate * months;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-6 rounded-2xl border border-white/10 bg-card p-6 sm:p-10 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-xs font-semibold tracking-wide text-brand uppercase">
            Storage calculator
          </p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Estimate your monthly rate</h2>
          <p className="mt-2 text-sm text-foreground/70">
            Pick a unit size and duration to see a rough estimate. Final pricing is confirmed on
            your quote.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-xs font-medium text-foreground/60">Unit size</label>
              <div className="grid grid-cols-2 gap-2">
                {UNIT_SIZES.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setUnitId(u.id)}
                    className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                      u.id === unitId
                        ? "border-brand bg-brand/10 text-brand"
                        : "border-white/10 text-foreground/70 hover:border-white/30"
                    }`}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 flex items-center justify-between text-xs font-medium text-foreground/60">
                <span>Duration</span>
                <span>{months} month{months === 1 ? "" : "s"}</span>
              </label>
              <input
                type="range"
                min={1}
                max={24}
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
                className="w-full accent-brand"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-background p-6 text-center">
          <p className="text-xs font-semibold tracking-wide text-foreground/50 uppercase">
            Estimated total
          </p>
          <p className="mt-2 text-4xl font-bold text-brand">${estimate.toLocaleString()}</p>
          <p className="mt-1 text-sm text-foreground/60">
            ${unit.monthlyRate}/mo &times; {months} mo
          </p>
          <ButtonLink href="/contact" className="mt-6 w-full">
            Get My Exact Quote
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
