"use client";

import { useState, type ReactNode } from "react";
import type { PromoConditions, PromoDiscount, ReferralOffer } from "@/lib/calculator";
import { trackEvent } from "@/lib/analytics";
import { usePromoText } from "@/lib/promo-text";

export type AppliedPromo =
  | { kind: "affiliate"; code: string; offer: ReferralOffer }
  | { kind: "promo"; code: string; discount: PromoDiscount; conditions: PromoConditions }
  | null;

type CheckState =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "invalid" }
  | { kind: "referral_active" }
  | { kind: "error"; message: string };

interface PromoResponse {
  valid?: boolean;
  kind?: "affiliate" | "promo";
  reason?: string;
  code?: string;
  offer?: ReferralOffer;
  discount?: PromoDiscount;
  conditions?: PromoConditions;
  error?: string;
}

export type PromoLookup =
  | { kind: "ok"; promo: NonNullable<AppliedPromo> }
  | { kind: "invalid" }
  | { kind: "referral_active" }
  | { kind: "error"; message?: string };

/** Checks a code with /api/promo. Shared by the box's Apply button and the `?promo=` link pre-fill. */
export async function lookupPromo(code: string): Promise<PromoLookup> {
  try {
    const res = await fetch("/api/promo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = (await res.json()) as PromoResponse;
    if (!res.ok) return { kind: "error", message: data.error };
    if (data.valid && data.code && data.kind === "promo" && data.discount && data.conditions) {
      return { kind: "ok", promo: { kind: "promo", code: data.code, discount: data.discount, conditions: data.conditions } };
    }
    if (data.valid && data.code && data.offer) {
      return { kind: "ok", promo: { kind: "affiliate", code: data.code, offer: data.offer } };
    }
    if (data.reason === "referral_active") return { kind: "referral_active" };
    return { kind: "invalid" };
  } catch {
    return { kind: "error" };
  }
}

/** Offer terms only; the code itself stays out of analytics. `article` is the resource page that sent the visitor, if any. */
export function trackPromoApplied(promo: NonNullable<AppliedPromo>, extra: { source: "link" | "typed"; article?: string }): void {
  if (promo.kind === "promo") {
    trackEvent("promo_applied", { kind: "promo", discount_type: promo.discount.type, duration: promo.discount.duration, ...extra });
  } else {
    trackEvent("promo_applied", { free_months: promo.offer.free_months, commitment_months: promo.offer.commitment_months, ...extra });
  }
}

/**
 * Promo / referral code field. "Apply" checks the code with the affiliate
 * system (via /api/promo); only a valid code is reported to the parent. The box
 * holds one code: typing a new valid one replaces the old one. Never shows
 * commission details, just the customer's offer.
 */
export function PromoCodeInput({
  applied,
  onApplied,
  compact = false,
  renderPromo,
}: {
  applied: AppliedPromo;
  onApplied: (promo: AppliedPromo) => void;
  compact?: boolean;
  /** Replaces the plain text box for an accepted promo code (the calculator shows its ticket here). */
  renderPromo?: (applied: Extract<NonNullable<AppliedPromo>, { kind: "promo" }>, remove: () => void) => ReactNode;
}) {
  const t = usePromoText();
  const [value, setValue] = useState("");
  const [state, setState] = useState<CheckState>({ kind: "idle" });

  async function apply() {
    setState({ kind: "checking" });
    const result = await lookupPromo(value);
    if (result.kind === "ok") {
      setState({ kind: "idle" });
      setValue("");
      trackPromoApplied(result.promo, { source: "typed" });
      onApplied(result.promo);
    } else if (result.kind === "error") {
      setState({ kind: "error", message: result.message ?? t.checkFailed });
    } else {
      setState({ kind: result.kind });
    }
  }

  function remove() {
    onApplied(null);
    setValue("");
    setState({ kind: "idle" });
  }

  return (
    <div>
      {applied?.kind === "promo" && renderPromo && <div className="mb-3">{renderPromo(applied, remove)}</div>}
      {applied && !(applied.kind === "promo" && renderPromo) && (
        <div className="mb-3 rounded-lg border border-brand/40 bg-brand/5 p-3 text-sm">
          <p>
            <span className="font-semibold text-brand-ink">{applied.code}</span> {t.applied}:{" "}
            {applied.kind === "affiliate"
              ? t.monthsFree(applied.offer.free_months, applied.offer.commitment_months)
              : applied.discount.label}
          </p>
          {applied.kind === "promo" && (
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-xs text-foreground/70">
              {!applied.conditions.plans_with_free_months && <li>{t.monthlyOnly}</li>}
              {applied.conditions.new_customers_only && <li>{t.newCustomersOnly}</li>}
              <li>{t.subjectToConfirmation}</li>
            </ul>
          )}
          <button
            type="button"
            onClick={remove}
            className="mt-1 text-xs text-foreground/60 underline hover:text-foreground"
          >
            {t.remove}
          </button>
        </div>
      )}

      <p className="text-xs font-medium text-foreground/60">{applied ? t.replaceLabel : t.boxLabel}</p>
      <div className={`flex gap-2 ${compact ? "mt-1" : "mt-2"}`}>
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 20));
            if (state.kind !== "idle") setState({ kind: "idle" });
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (value.trim()) void apply();
            }
          }}
          placeholder={t.placeholder}
          autoCapitalize="characters"
          autoComplete="off"
          aria-label={t.inputAria}
          className="w-full rounded-lg border-2 border-foreground/20 bg-background px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <button
          type="button"
          onClick={apply}
          disabled={!value.trim() || state.kind === "checking"}
          className="shrink-0 rounded-lg border-2 border-foreground/20 px-4 py-2 text-sm font-semibold text-foreground/70 hover:border-brand/60 disabled:opacity-40"
        >
          {state.kind === "checking" ? t.checking : t.apply}
        </button>
      </div>
      {state.kind === "invalid" && (
        <p role="alert" className="mt-1 text-xs text-red-500">
          {t.invalid}
        </p>
      )}
      {state.kind === "referral_active" && (
        <p role="alert" className="mt-1 text-xs text-foreground/70">
          {t.referralActive}
        </p>
      )}
      {state.kind === "error" && (
        <p role="alert" className="mt-1 text-xs text-red-500">
          {state.message}
        </p>
      )}
      {!applied && <p className="mt-1 text-[11px] text-foreground/50">{t.onePerOrder}</p>}
    </div>
  );
}
