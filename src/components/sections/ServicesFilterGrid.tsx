"use client";

import { useState } from "react";
import { ServiceCard } from "@/components/sections/ServiceCard";
import type { Service } from "@/types/database";

const TABS = ["All", "Personal", "Corporate"] as const;

export function ServicesFilterGrid({ services }: { services: Service[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");

  const filtered =
    tab === "All" ? services : services.filter((s) => s.category === tab.toLowerCase());

  return (
    <div>
      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              tab === t ? "bg-brand text-brand-foreground" : "bg-card text-foreground/70 hover:text-brand"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
}
