import type { TrustStat } from "@/types/database";

export interface SectionCopy {
  heading?: string;
  subheading?: string;
  body?: string;
  media_url?: string | null;
  cta_text?: string;
  cta_link?: string;
  stats?: TrustStat[];
}

/**
 * Static copy shown until a matching row exists in Supabase `sections`.
 * Keyed by page slug, then by `section_key` — mirrors the DB shape so the
 * admin CMS can override any entry without a code change.
 */
export const FALLBACK_SECTIONS: Record<string, Record<string, SectionCopy>> = {
  home: {
    hero: {
      heading: "Storage that moves at the speed of your life.",
      subheading:
        "Flexible personal and corporate storage space, on-demand pickup, and climate-controlled units across the region.",
      cta_text: "Get a Free Quote",
      cta_link: "/contact",
    },
    trust_banner: {
      heading: "Trusted by thousands of households and businesses",
      body: "24/7 monitored facilities, fully insured pickups, and a team that treats your belongings like our own.",
      stats: [
        { value: 13, suffix: "", label: "Islandwide locations" },
        { value: 6500, suffix: "+", label: "Happy customers" },
        { value: 600, suffix: "+", label: "Metric tons of CO2 saved per year", emphasis: true },
        { value: 8, suffix: "", label: "Years of securing your precious belongings" },
      ],
    },
  },
  personal: {
    trust_segment: {
      heading: "Our promise to you, from first pickup to final delivery",
      body: "Handing your belongings to someone else takes trust. Here is what we hold ourselves to, so you never feel left wondering.\n- Clear, kind communication: If a pickup or delivery time needs to change, we will tell you early and plainly, so you are never left waiting without an update.\n- Careful handling, end to end: Furniture is wrapped at your home, and every item is logged against your account and kept on its own pallet, so we always know where your things are.\n- Fair when something goes wrong: If anything arrives damaged, tell us and we will document it with you and work through it openly, keeping you informed at each step.\n- Here after you have paid, too: Questions after booking are just as welcome as before. We will explain anything in plain, simple language.",
    },
    hero: {
      heading: "Personal storage, simplified.",
      subheading:
        "From dorm move-outs to full-home decluttering, we pick up, store, and deliver back on your schedule.",
      cta_text: "Start My Quote",
      cta_link: "/contact",
    },
  },
  corporate: {
    trust_segment: {
      heading: "Dependable storage for the way your business runs",
      body: "Your records, stock and assets keep your business moving. We aim to make handing them over feel calm and predictable.\n- Tracked from pickup to retrieval: Every pallet and crate is logged against your account, so a retrieval is a specific, tracked item and never a search.\n- Honest timelines: If a schedule shifts, you will hear it from us early, with a clear new time, rather than having to chase for news.\n- A familiar point of contact: Dedicated account management means you speak with people who already know your account.\n- Clear quotes and billing: Itemised quotes up front, and any billing or refund question is handled patiently and kept visible to you until it is settled.",
    },
    hero: {
      heading: "Corporate storage built to scale.",
      subheading:
        "Inventory, document archiving, and asset storage with dedicated account management for growing businesses.",
      cta_text: "Talk to Sales",
      cta_link: "/contact",
    },
  },
  mission: {
    trust_segment: {
      heading: "Storage should feel calm, never stressful",
      body: "We believe storage should feel effortless, transparent and human, from the first quote to the last delivery.\n- Honest from the first quote: We show what is included and what could change the price, so there are no surprises later.\n- Present after the sale: Our care does not stop once you have booked. We stay easy to reach and quick to reply.\n- Accountable when it matters: If we get something wrong, we will say so, and make it right with you openly.\n- Gentle on the planet: Our warehouses run at ambient temperature, so your belongings are stored with a lower carbon footprint.",
    },
    hero: {
      heading: "Our mission",
      subheading:
        "Give every household and business room to grow, without the friction of traditional self-storage.",
    },
  },
  services: {
    trust_segment: {
      heading: "Every service, handled with care",
      body: "Whichever service you choose, the same standards apply, because your belongings matter to you.\n- Wrapped and protected: Pallets are shrink-wrapped, and sensitive items can move into enclosed crates for extra peace of mind.\n- Logged and tracked: Everything is recorded against your account, so partial returns are simple and nothing is left to memory.\n- Scheduling you can rely on: We will keep you updated if timings change, so you can plan your day with confidence.\n- Pricing that makes sense: Itemised quotes explain what you are paying for, with a friendly team to answer any question.",
    },
  },
  resources: {
    intro: {
      heading: "Resource library",
      subheading: "Guides, checklists, and tips — sorted by topic and freshness.",
    },
  },
  partner: {
    hero: {
      heading: "Be a partner.",
      subheading:
        "We grow through referral partnerships with real estate agents, property managers, and moving companies.",
      cta_text: "Apply to Partner",
      cta_link: "#partner-form",
    },
    trust_segment: {
      heading: "Our mission with partners",
      body: "We treat every referral like our own customer — transparent commissions, fast follow-up, and dedicated partner support.",
    },
    referral_intro: {
      heading: "Referral programme",
      body: "Introduce your clients to EcoStorage and earn ongoing referral rewards. Our partner team manages every step, from intro to invoicing.",
    },
  },
  contact: {
    trust_segment: {
      heading: "We'd love to hear from you",
      body: "Tell us a little about what you need stored. There is no pressure and no question is too small.\n- A real person replies: Our team responds within one business day.\n- Plain answers: We explain options and pricing simply, at your own pace.\n- We stay in touch: You will not be left wondering what happens next.",
    },
  },
};

export interface FallbackService {
  id: string;
  slug: string;
  title: string;
  category: "personal" | "corporate";
  description: string;
  cta_text: string;
  cta_link: string;
}

export const FALLBACK_SERVICES: FallbackService[] = [
  {
    id: "fallback-personal-boxes",
    slug: "pickup-and-storage",
    title: "Pickup & Storage",
    category: "personal",
    description: "We collect your items, photograph and catalog them, then store them securely.",
    cta_text: "See pricing",
    cta_link: "/personal",
  },
  {
    id: "fallback-personal-delivery",
    slug: "on-demand-delivery",
    title: "On-Demand Delivery",
    category: "personal",
    description: "Request any item back and we'll deliver it to your door within 24 hours.",
    cta_text: "See pricing",
    cta_link: "/personal",
  },
  {
    id: "fallback-corporate-records",
    slug: "records-management",
    title: "Records Management",
    category: "corporate",
    description: "Secure, indexed document storage with scan-on-demand retrieval.",
    cta_text: "Talk to sales",
    cta_link: "/corporate",
  },
  {
    id: "fallback-corporate-inventory",
    slug: "inventory-storage",
    title: "Inventory Storage",
    category: "corporate",
    description: "Scalable pallet and inventory storage with real-time tracking.",
    cta_text: "Talk to sales",
    cta_link: "/corporate",
  },
];

