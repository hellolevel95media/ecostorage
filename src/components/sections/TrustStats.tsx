"use client";

import { useEffect, useRef, useState } from "react";
import type { SectionCopy } from "@/lib/fallback-content";
import type { TrustStat } from "@/types/database";

const DEFAULT_STATS: TrustStat[] = [
  { value: 13, label: "Islandwide locations" },
  { value: 6500, suffix: "+", label: "Happy customers" },
  { value: 600, suffix: "+", label: "Metric tons of CO2 saved per year", emphasis: true },
  { value: 8, label: "Years of securing your precious belongings" },
];

const COUNT_UP_MS = 1600;

export function TrustStats({ copy }: { copy: SectionCopy }) {
  const stats = copy.stats && copy.stats.length > 0 ? copy.stats : DEFAULT_STATS;
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="snap-section-flow mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      {copy.heading && (
        <h2 className="text-center text-2xl font-bold text-balance sm:text-3xl">{copy.heading}</h2>
      )}
      {copy.body && (
        <p className="mx-auto mt-3 max-w-2xl text-center text-foreground/70">{copy.body}</p>
      )}

      <div ref={ref} className="mt-8 grid grid-cols-2 gap-4 sm:mt-10 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <StatBubble key={`${stat.label}-${i}`} stat={stat} visible={visible} />
        ))}
      </div>
    </section>
  );
}

function StatBubble({ stat, visible }: { stat: TrustStat; visible: boolean }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!visible) return;

    let raf: number;
    const start = performance.now();

    function tick(now: number) {
      const progress = Math.min((now - start) / COUNT_UP_MS, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * stat.value));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible, stat.value]);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-6 text-center shadow-card transition-colors sm:p-8 ${
        stat.emphasis
          ? "border-brand/40 bg-brand/10"
          : "border-border bg-surface/60"
      }`}
    >
      {stat.emphasis && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-brand to-transparent"
        />
      )}
      <p
        className={`font-bold tabular-nums ${
          stat.emphasis ? "text-3xl text-brand sm:text-4xl" : "text-2xl sm:text-3xl"
        }`}
      >
        {stat.prefix}
        {display.toLocaleString()}
        {stat.suffix}
      </p>
      <p className="mt-2 text-sm text-foreground/70 sm:text-base">{stat.label}</p>
    </div>
  );
}
