# Handoff: rework /partner page for affiliates + B2B partners

Created 2026-10-03 from the `D:\ecostorage-affiliates` planning session.
Scope: **this file's task only**. The referral/attribution integration
(`?ref=` cookie, promo validation, signed webhook) is a separate later task;
see `D:\ecostorage-affiliates\docs\main-site-integration.md`.

## Background

EcoStorage is launching an affiliate programme run from a separate system
(`ecostorage-affiliates`: own Supabase project + Vercel app). The current
`/partner` page sends everything to `ContactForm type="partner"`, which
mixes two different audiences:

- **Individual affiliates**: people who refer storage customers for a
  commission.
- **B2B partners**: movers, property agents, interior designers and other
  businesses wanting a referral or service partnership.

**Business rule: commission rates, tiers, percentages, qualifying periods
and payout timing must NOT appear anywhere on the public site.** They are
shared only with approved affiliates via the affiliate portal's onboarding
pack. Public copy is benefit-led only. (Affiliates are separately required
by their terms to disclose that they earn commission when promoting.)

## Task

Rework `src/app/partner/page.tsx` so it serves two audiences with separate
paths.

1. **Individual affiliates**: "Become an EcoStorage affiliate" section,
   benefit-led copy only:
   - earn rewards for every customer you refer
   - tiered rewards that grow with your referrals
   - your referrals get an exclusive welcome offer
   - every application is personally reviewed
   - full programme details and terms are shared once approved

   Form fields: name, email, mobile, how they plan to promote (free text),
   and a required checkbox "I agree to be contacted about the affiliate
   programme". This is not the full terms, which are accepted later inside
   the affiliate portal.

   Submit to `/api/inquiries` with `type: "partner"` and
   `metadata.partnerKind = "affiliate"`. **Keep the submit call isolated in
   one function**, because it will later be re-pointed to the affiliate
   system's application endpoint.

   Success message: "Thanks, we review every application personally and
   will be in touch."

2. **B2B partners**: keep the existing `ContactForm` flow with
   `company_name`, but set `metadata.partnerKind = "business"`.

3. **Path picker**: two side-by-side cards (or a toggle) at the top so
   visitors choose their path.

4. **Admin**: update the admin inquiries view
   (`src/app/admin/(protected)/inquiries`) to show and filter by
   `partnerKind`.

## Notes for implementation

- `/api/inquiries` currently destructures only fixed fields and does **not**
  persist `metadata`. Extend it to accept and store a validated `metadata`
  object (check the `inquiries` table has a `metadata jsonb` column. The
  storage calculator already writes one via the browser client, so it
  likely exists, but confirm in `supabase/migrations/`). Allow-list the
  keys; don't store arbitrary JSON from the client.
- Follow CLAUDE.md: Server Components by default, `@/` imports, design
  tokens, types in `src/types/database.ts`, read the bundled Next.js docs
  before using unfamiliar APIs.
- Do **not** add any `?ref` cookie, promo-code validation or attribution
  logic.
- Done = zero TypeScript/ESLint errors, both paths submit successfully, and
  admin can filter by partner kind.

## Prompt to run

Open Claude Code in `D:\EcoStorage` and run:

```
Read HANDOFF-partner-page.md and implement it.
```
