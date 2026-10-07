"use client";

import { useState } from "react";
import type { ReferralOffer } from "@/lib/calculator";

export type AppliedPromo = { code: string; offer: ReferralOffer } | null;

type CheckState = { kind: "idle" } | { kind: "checking" } | { kind: "invalid" } | { kind: "error"; message: string };

/**
 * Promo / referral code field. "Apply" checks the code with the affiliate
 * system (via /api/promo); only a valid code is reported to the parent.
 * Never shows commission details, just the customer's offer.
 */
export function PromoCodeInput({
  applied,
  onApplied,
  compact = false,
}: {
  applied: AppliedPromo;
  onApplied: (promo: AppliedPromo) => void;
  compact?: boolean;
}) {
  const [value, setValue] = useState("");
  const [state, setState] = useState<CheckState>({ kind: "idle" });

  async function apply() {
    setState({ kind: "checking" });
    try {
      const res = await fetch("/api/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: value }),
      });
      const data = (await res.json()) as { valid?: boolean; code?: string; offer?: ReferralOffer; error?: string };
      if (!res.ok) return setState({ kind: "error", message: data.error ?? "Couldn't check the code. Try again." });
      if (data.valid && data.code && data.offer) {
        setState({ kind: "idle" });
        onApplied({ code: data.code, offer: data.offer });
      } else {
        setState({ kind: "invalid" });
      }
    } catch {
      setState({ kind: "error", message: "Couldn't check the code. Try again." });
    }
  }

  if (applied) {
    return (
      <div className="rounded-lg border border-brand/40 bg-brand/5 p-3 text-sm">
        <p>
          <span className="font-semibold text-brand-ink">{applied.code}</span> applied:{" "}
          {applied.offer.free_months} month{applied.offer.free_months > 1 ? "s" : ""} free on a{" "}
          {applied.offer.commitment_months}-month plan.
        </p>
        <button
          type="button"
          onClick={() => {
            onApplied(null);
            setValue("");
          }}
          className="mt-1 text-xs text-foreground/60 underline hover:text-foreground"
        >
          Remove code
        </button>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs font-medium text-foreground/60">Promo / referral code (optional)</p>
      <div className={`flex gap-2 ${compact ? "mt-1" : "mt-2"}`}>
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value.toUpperCase().slice(0, 12));
            if (state.kind !== "idle") setState({ kind: "idle" });
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (value.trim()) void apply();
            }
          }}
          placeholder="ENTER CODE"
          autoCapitalize="characters"
          autoComplete="off"
          aria-label="Promo or referral code"
          className="w-full rounded-lg border-2 border-foreground/20 bg-background px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <button
          type="button"
          onClick={apply}
          disabled={!value.trim() || state.kind === "checking"}
          className="shrink-0 rounded-lg border-2 border-foreground/20 px-4 py-2 text-sm font-semibold text-foreground/70 hover:border-brand/60 disabled:opacity-40"
        >
          {state.kind === "checking" ? "Checking…" : "Apply"}
        </button>
      </div>
      {state.kind === "invalid" && (
        <p role="alert" className="mt-1 text-xs text-red-500">
          That code isn&apos;t valid. Check it and try again.
        </p>
      )}
      {state.kind === "error" && (
        <p role="alert" className="mt-1 text-xs text-red-500">
          {state.message}
        </p>
      )}
    </div>
  );
}
