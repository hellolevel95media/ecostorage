# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Personal:** individuals and households needing to declutter, move, or free up space (dorm move-outs, full-home decluttering, life transitions) who want their items picked up, stored, and delivered back on their schedule without visiting a facility themselves.
- **Corporate:** Singapore businesses needing records/document archiving, inventory/pallet storage, and asset storage, typically with service-level expectations around retrieval and account management.

## Product Purpose

EcoStorage is a full-service pickup-and-delivery storage company serving both personal and corporate customers — not a self-storage facility customers visit themselves. The company collects, stores, and redelivers belongings on the customer's schedule, backed by an admin CMS (Supabase-driven page sections, services, and articles) and a lead-capture/quoting flow (including a pricing calculator).

## Positioning

EcoStorage differentiates from traditional Singapore self-storage — which is typically 100% air-conditioned, 24/7, and carbon-intensive — through its storage methods and facility mix:

1. **Pallet storage (standard):** customer items are placed on 100% recycled wooden pallets and bundled together with industrial shrink wrap, so items never touch the warehouse floor and never mix with another customer's belongings.
2. **Wooden crate storage (premium upgrade):** fully enclosed wooden crates with swinging doors, for items sensitive to temperature or light. Customers upgrade into this when their items call for it.

Main warehousing runs at 100% ambient temperature (not air-conditioned); only ~15% of total warehouse square footage across the company is climate-controlled space. This gives EcoStorage a genuinely lower carbon footprint than lock-and-key competitors that run AC 24/7 — this is a real, substantiated operational fact, not a marketing-only claim. The company is currently in the process of obtaining **LowCarbonSG certification**.

## Operating Context

- Market: fully Singapore-based, island-wide, with 13 locations.
- Warehouse/facility addresses are confidential and must never be disclosed publicly (security/operational policy). The public-facing contact address is: **7030 Ang Mo Kio Ave 5, #08-94, Singapore 569880**.
- Primary domain: `ecostorage.sg`.
- Contact details in `src/lib/nav.ts` (`COMPANY`) are correct: office address above, `hello@ecostorage.sg`, +65 8899 7017.

## Capabilities & Constraints

- Admin CMS backend: Supabase-driven `sections`, `services`, and `articles`, editable without code changes (site falls back to static copy in `src/lib/fallback-content.ts` when no DB row exists).
- Lead capture via Supabase `inquiries` table, including a pricing calculator (20 sqft "module" unit, commitment-period tiers, valet delivery add-ons, volume discounts) that also surfaces environmental metrics (CO2 saved, trees saved) tied to the ambient-warehousing story above.
- Never disclose specific warehouse locations in any public-facing copy or UI.

## Brand Commitments

- Name: **EcoStorage**. Brand accent color: `#00E599`.
- The environmental/"Eco" angle is real and substantiated (see Positioning), not vibe-only marketing — future copy and design work can lean on it as a genuine differentiator, though specific numeric CO2/trees-saved figures in the calculator are heuristic estimates, not third-party-certified figures, and should not be presented as audited data.

## Evidence on Hand

- Real, confirmed facts: pallet/shrink-wrap and crate storage methods, ~15% AC vs ~85% ambient warehouse space split, in-progress LowCarbonSG certification, 13 island-wide Singapore locations, confidential warehouse addresses, public office address above.
- **Owner-verified operating claims (confirmed 2026-10-09):** these figures come from the sister company's existing operations, which EcoStorage runs the same way under new management with optimisations. Approved for public copy: 24/7 monitored facilities, 6,500+ happy customers ("thousands of households and businesses"), 13 islandwide locations, 8 years of securing belongings, enquiries answered within one business day.
- Messaging update (2026-10-11): the owner replaced "fully insured pickups" in public copy with a transparency message ("transparent pricing and clear communication at every step"). Do not use the insured claim in copy unless the owner reinstates it.
- Delivery timing (2026-10-13): do not promise a delivery turnaround (no "within 24 hours"). Customers typically give 3-5 days' notice for outbound requests. Say delivery is scheduled to suit the customer, and that a few days' notice helps.
- **Storage + moving (owner decision 2026-10-13):** present EcoStorage as one team for storage and moving (it is not lock-and-key; getting items to the warehouse is part of the service). Approved claims: **S$350 per full 14ft truckload**, with or without tailgate, roughly a 3-room HDB including the living room (a 14ft truck fits about 4 to 6 pallets' worth depending on what is stored); a **price guarantee (never higher) for Standard and Premium Valet** customers and the current rate for everyone else; part loads and specialist items (e.g. grand pianos, via partner movers) are custom quotes; extras such as long push, stair carry, fragile packing or extra labour are **always communicated in advance**; changes on the day are priced and agreed on the spot before work continues; long push applies only on slopes or beyond 100 m from lift to truck; fragile wrapping depends on the item (55-inch TV basic, 75-inch TV advanced). Say **"our operations team"**, backed by vetted partner movers. **Never state crew sizes** (2 to 4 movers varies), fleet numbers or jobs per day.
- No testimonials, case studies, press mentions, or third-party proof points on file yet — future work must not fabricate these. Do not quote or paraphrase individual sister-company customer reviews as EcoStorage testimonials.
- Copy rule: say "Singapore"/"island-wide", not "the region". Climate-controlled space is a real, minority offering (~15% of warehouse space) and may be mentioned as an option, but do not describe the whole warehouse as climate-controlled; the ambient story is the main one.

## Product Principles

1. Pickup-and-delivery convenience beats self-storage friction — customers should never need to visit a facility.
2. Customer belongings stay segregated and protected (pallet + shrink wrap, or enclosed crates for sensitive items) — this is a trust/safety story, not just logistics.
3. Lower-carbon, ambient-temperature warehousing is a genuine, defensible differentiator against AC-24/7 competitors — real operational fact, safe to feature prominently.
4. Crate storage is a premium upgrade path, not the default — most items ship standard pallet.
5. Island-wide Singapore coverage, but exact warehouse locations stay confidential in all public-facing surfaces.
