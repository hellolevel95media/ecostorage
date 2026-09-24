export interface SectionCopy {
  heading?: string;
  subheading?: string;
  body?: string;
  cta_text?: string;
  cta_link?: string;
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
    },
  },
  personal: {
    trust_segment: {
      heading: "Our commitment to you",
      body: "Every personal storage plan includes free pickup scheduling, protective wrapping, and transparent month-to-month pricing — no long-term contracts.",
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
      heading: "Trust segment — our commitment statement",
      body: "We partner with operations, facilities, and records teams to deliver secure, scalable storage backed by service-level agreements.",
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
      heading: "Trust segment — our commitment statement",
      body: "We believe storage should feel effortless, transparent, and human — from the first quote to the last pickup.",
    },
    hero: {
      heading: "Our mission",
      subheading:
        "Give every household and business room to grow, without the friction of traditional self-storage.",
    },
  },
  services: {
    trust_segment: {
      heading: "Trust segment — our commitment statement",
      body: "Every service is backed by insured handling, transparent pricing, and a satisfaction guarantee.",
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
      body: "Tell us a little about what you need stored — our team responds within one business day.",
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

export const FALLBACK_ARTICLES: {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
}[] = [
  {
    slug: "how-to-pack-a-storage-unit",
    title: "How to Pack a Storage Unit Like a Pro",
    category: "Personal",
    excerpt: "Maximize every square foot with our room-by-room packing checklist.",
  },
  {
    slug: "corporate-records-retention-guide",
    title: "A Corporate Guide to Records Retention",
    category: "Corporate",
    excerpt: "What to keep, what to shred, and how long to store business documents.",
  },
  {
    slug: "climate-controlled-storage-explained",
    title: "Climate-Controlled Storage, Explained",
    category: "Guides",
    excerpt: "When it matters for your belongings — and when it doesn't.",
  },
];
