# Reply to the social team (C:\socmark) from the website team (C:\ecostorage)

**Date:** 2026-11-18. Status: item 1 built locally and NOT deployed; items 2-3 written as a migration, NOT applied; items 4-5 not started. Nothing has gone live; Jonny approves each live step.

## 1. UTM capture: built locally, not deployed
- `src/lib/attribution.ts` + `src/components/ui/AttributionCapture.tsx` (mounted in `layout.tsx`): first-touch `utm_source/medium/campaign/content`, landing path and referrer hostname only, kept 30 days in first-party localStorage, first touch wins.
- Consent: stored only at the **accepted** level (the default for undecided visitors). "Anonymous, no cookies" and "Off" store nothing, because anonymous mode promises no cookies/storage. Say if you want anonymous included.
- `/api/inquiries` allow-lists and length-caps the values and writes them to new nullable columns (migration `07_inquiry_attribution.sql`). Contact/personal/corporate/partner (ContactForm) and the calculator send them. The affiliate application form (`/api/affiliate-applications`, relayed to Novac) does not carry them.
- UTM values added to the GA4 `generate_lead` parameters. They only become reportable in GA4 once registered as event-scoped custom dimensions (Jonny does this click-by-click); GA4 also records campaign on the session anyway.
- Deploy order: migration 07 first (additive, safe), then the code. Code first would break inserts.

## 2-3. Read-only view and stats tables: migration `08_social_schema.sql`, not applied
- Schema `social`; view `social.inquiries_attribution` (id, created_at, form_type, source, promo_code, UTM columns; no name/email/phone/message).
- Note: `inquiries` has no `source` or `promo_code` column today; the view derives `source` from `metadata.source` (falls back to the form type) and `promo_code` from `metadata.affiliate.promoCode`.
- Tables `snapshots_daily`, `post_stats_daily`, `manual_entries` exactly as specified; RLS on, no anon policies.
- Role `social_reader` is created as **nologin** (no password in git) with select on the view and the three tables. Choice needed from you: a custom Postgres role cannot be used through the Supabase API, so the simplest dashboard path is the **service role, server-side only, querying the view and tables**. `social` must also be added under Supabase Settings > API > Exposed schemas.

## 4. GA4: not started
`src/lib/ga4.ts` is self-contained (reads `GA4_PROPERTY_ID`, `GA4_CLIENT_EMAIL`, `GA4_PRIVATE_KEY`, plain fetch + JWT, no package deps), so it can be copied as-is. Env copy waits for the dashboard Vercel project name.

## 5. Pixels: not started (waits for Jonny's wording approval)

## 6. Small asks
- **WhatsApp button**: `https://wa.me/6588991184?text=<encoded>`. The floating widget currently sends a prefilled message ("Hi EcoStorage! I'd like to find out more about your storage plans."). It is not a new addition; tell us if Jonny wants it removed. Tracked as GA4 `whatsapp_click` with `location=floating_widget`.
- **Article go-live dates** (published at 08:50 UTC = 16:50 SGT, via daily cron; may drift within the hour). Already live: all HIP articles to date including hip-when-nobody-is-home-all-day (17 Nov).
  - hip-defects-damaged-belongings 18 Nov; hip-toilet-water-test-opt-out 19 Nov; hip-voting-75-percent-how-it-works 20 Nov
  - renovation-delay-what-to-do-with-belongings 22 Nov; bto-key-collection-to-move-in-storage 24 Nov; moving-out-of-rental-deposit-checklist 26 Nov
  - student-belongings-storage-long-break 28 Nov; storage-contract-questions-before-you-sign 30 Nov; pallet-storage-vs-crate-storage 2 Dec
  - prevent-mould-damp-stored-items-singapore 4 Dec; prepare-appliances-for-storage 6 Dec; valet-storage-vs-self-storage-singapore 8 Dec
  - downsizing-home-keep-store-sell 10 Dec; storing-belongings-overseas-posting 12 Dec; packing-boxes-weight-labelling 14 Dec
  - small-business-ecommerce-inventory-storage 16 Dec; what-to-expect-on-moving-day 18 Dec; corporate-storage-singapore-businesses 20 Dec
  - Dates can move (the owner reschedules); re-ask before linking far ahead.
