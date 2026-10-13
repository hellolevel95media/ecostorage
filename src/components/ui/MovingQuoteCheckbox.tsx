"use client";

import { useId } from "react";
import { TRUCKLOAD_14FT_RATE } from "@/lib/calculator";

/**
 * The large "quote me for moving too" tick on the calculator and contact
 * forms. Controlled (calculator) or a plain named checkbox (contact form).
 */
export function MovingQuoteCheckbox({
  name,
  checked,
  onChange,
}: {
  name?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer gap-4 rounded-2xl border-2 border-foreground/20 p-4 transition-colors hover:border-brand/60 has-[:checked]:border-brand has-[:checked]:bg-brand/10 sm:p-5"
    >
      <input
        id={id}
        name={name}
        type="checkbox"
        value="yes"
        checked={checked}
        onChange={onChange ? (e) => onChange(e.target.checked) : undefined}
        className="mt-0.5 h-7 w-7 shrink-0 cursor-pointer accent-brand"
      />
      <span>
        <span className="block text-base font-bold">Give me a quote for moving services for my storage needs</span>
        <span className="mt-1 block text-sm text-foreground/70">
          We&apos;ll come back to you with a moving quote. A full 14ft truckload is S${TRUCKLOAD_14FT_RATE}, and extras like long
          push, stair carry, fragile packing or extra labour are always communicated in advance.
        </span>
      </span>
    </label>
  );
}
