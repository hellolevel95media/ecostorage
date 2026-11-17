"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { PromoConditions, PromoDiscount } from "@/lib/calculator";
import { usePromoText } from "@/lib/promo-text";

/**
 * The reward moment for an accepted stand-alone promo code. Promo Gold is reserved
 * for this card (and the "Savings" glow) and nothing else. The card carries its own
 * light surface and dark text, so it reads the same on white, grey or dark backgrounds.
 */

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(REDUCED_QUERY);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCED_QUERY).matches,
    () => false,
  );
}

/** Counts from the previous value to `to` in about 600 ms; just shows it with reduced motion. */
function CountUp({ to, reduced }: { to: number; reduced: boolean }) {
  const decimals = Number.isInteger(to) ? 0 : 2;
  const [shown, setShown] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    if (reduced) return;
    const start = performance.now();
    const origin = from.current;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 600);
      const eased = 1 - Math.pow(1 - p, 3);
      from.current = origin + (to - origin) * eased;
      setShown(from.current);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, reduced]);
  return <>{(reduced ? to : shown).toFixed(decimals)}</>;
}

function TagIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" />
      <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
      <path d="M17 3v3M15.5 4.5h3" />
    </svg>
  );
}

export interface PromoTicketProps {
  code: string;
  discount: PromoDiscount;
  conditions: PromoConditions;
  /** False when the chosen plan isn't covered (a Month-to-Month-only code on a lock-in plan). */
  applicable: boolean;
  /** Amount actually taken off per discounted month, after any floor Novac sends. */
  amount: number;
  totalAfter: number;
  billedMonths: number;
  floorLimited: boolean;
  onSwitchToMonthly?: () => void;
  onRemove?: () => void;
  /** One-line version for the rate dashboard. */
  compact?: boolean;
}

export function PromoTicket({
  code,
  discount,
  conditions,
  applicable,
  amount,
  totalAfter,
  billedMonths,
  floorLimited,
  onSwitchToMonthly,
  onRemove,
  compact = false,
}: PromoTicketProps) {
  const t = usePromoText();
  const reduced = usePrefersReducedMotion();
  const head = t.headline(discount);

  if (!applicable) {
    return (
      <div role="status" className="rounded-xl border-2 border-dashed border-foreground/20 bg-surface p-3 text-sm">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground/10 px-2.5 py-1 text-xs font-bold tracking-wide text-foreground/60">
            <TagIcon />
            {code}
          </span>
          {onRemove && !compact && (
            <button type="button" onClick={onRemove} className="text-xs text-foreground/60 underline hover:text-foreground">
              {t.remove}
            </button>
          )}
        </div>
        <p className="mt-2 font-semibold text-foreground/70">{t.monthlyOnlyTitle}</p>
        {onSwitchToMonthly && (
          <button
            type="button"
            onClick={onSwitchToMonthly}
            className="mt-2 inline-flex min-h-11 items-center justify-center rounded-full bg-foreground px-4 text-sm font-semibold text-background hover:bg-foreground/85 active:scale-[0.97]"
          >
            {t.switchToMonthly}
          </button>
        )}
      </div>
    );
  }

  if (compact) {
    return (
      <div role="status" className="promo-ticket rounded-xl px-3 py-2.5 text-[#2b2108]">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <span className="promo-gold-gradient inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold tracking-wide text-[#2b2108]">
            <TagIcon />
            {code}
          </span>
          <span className="text-sm font-bold text-promo-gold-ink tabular-nums">
            {head.before}
            {Number.isInteger(amount) ? amount : amount.toFixed(2)}
            {head.after}
          </span>
        </div>
        <p className="mt-1 text-sm tabular-nums">
          <span className="font-semibold">{t.totalShort}: ${totalAfter.toFixed(2)}</span>{" "}
          <span className="text-xs text-promo-gold-ink">{t.subjectTo}</span>
        </p>
      </div>
    );
  }

  return (
    <div role="status" className={`promo-ticket rounded-2xl p-4 text-[#2b2108] shadow-card ${reduced ? "" : "promo-ticket-shimmer"}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="promo-gold-gradient inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold tracking-wide text-[#2b2108]">
          <TagIcon />
          {code}
        </span>
        <span className="text-[11px] font-semibold tracking-wide text-promo-gold-ink uppercase">{t.ticketTag}</span>
      </div>

      <p className="mt-3 text-2xl leading-tight font-extrabold text-promo-gold-ink tabular-nums sm:text-3xl">
        {head.before}
        <CountUp to={amount} reduced={reduced} />
        {head.after}
      </p>

      <p className="mt-2 flex flex-wrap items-baseline gap-x-2 text-base tabular-nums">
        <span className="font-semibold">{t.totalShort}</span>
        <span className="text-lg font-bold">${totalAfter.toFixed(2)}</span>
        <span className="text-xs text-promo-gold-ink">{t.billedMonths(billedMonths)}</span>
      </p>

      <ul className="mt-3 space-y-0.5 text-[11px] leading-4 text-promo-gold-ink">
        {floorLimited && <li>{t.floorLimited}</li>}
        {!conditions.plans_with_free_months && <li>{t.monthlyOnly}</li>}
        {conditions.new_customers_only && <li>{t.newCustomersOnly}</li>}
        <li>{t.subjectToConfirmation}</li>
      </ul>

      {onRemove && (
        <button type="button" onClick={onRemove} className="mt-2 text-xs text-promo-gold-ink underline hover:opacity-80">
          {t.remove}
        </button>
      )}
    </div>
  );
}
