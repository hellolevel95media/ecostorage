# EcoStorage website — Handoff

Updated 2026-10-10 (full refresh at the owner's request). Read this first.
Older notes are in `docs/archive/` (2026-09-29 session context, the
partner-page task, the old todo list and changelog); this file supersedes
them. **Only update this file when the owner asks.** Sessions are split
between this website repo and Novac, so routine edits here are unnecessary.

## 1. What this is

The public marketing website for EcoStorage (Singapore valet storage +
moving): service pages, blog/CMS with admin, storage calculator, contact,
corporate and partner forms, English + Mandarin. Next.js 16 (App Router),
TypeScript, Tailwind, Supabase, Vercel.

- GitHub `hellolevel95media/ecostorage`, branch `main`. **Every push
  auto-deploys to production.**
- Vercel project `ecostorage` (team `level95`). **Live at
  https://ecostorage.sg** (SSL issued, Vercel shows "Valid Configuration";
  `www` redirects to the apex). `NEXT_PUBLIC_SITE_URL=https://ecostorage.sg`
  is set in Vercel. Canonicals, `sitemap.xml`, `robots.txt` and `llms.txt` all
  use `ecostorage.sg`.
- Domain registrar and DNS: **Exabytes** (zone for `ecostorage.sg`). Vercel
  records: `@` A `216.198.79.1` and `www` CNAME `06f03c634ba12958.vercel-dns-017.com`
  (Vercel's newer values; the old `76.76.21.21` / `cname.vercel-dns.com` still work).
- Supabase project `dqmuuszmuyixjxonwjpv` (ap-southeast-1), account
  hello@level95media.com. The claude.ai Supabase connector is on this account.
- Accounts may move to `jonnylim@ecostorage.sg` later; not now.

## 2. Novac: the new system next door

**Novac** is EcoStorage's internal CRM/ERP (customers, jobs, billing, partner
movers, affiliates, photo vault), being planned in `D:\Novac`. It is a
**separate app with its own database**. The website keeps doing what it does;
it just sends some things to Novac. The owner works mainly in the Novac
session; sessions in this repo are website-only. Don't edit `D:\Novac` or
`D:\ecostorage-affiliates` from here.

It replaces the earlier "ecostorage-affiliates" app (`D:\ecostorage-affiliates`,
now retired). Anything on this site that says "affiliate system" means Novac.

What this site already does for Novac (commits `6bee9ee`, `d8be0e3`,
pushed and live):
- `?ref=CODE` links set a 14-day `eco_ref` cookie (in `src/proxy.ts`).
- Promo/referral code field → `/api/promo` → Novac checks the code.
- Calculator and contact enquiries go through `/api/inquiries` (price
  recalculated on the server, saved with the server-only Supabase key).
  Referred enquiries are then relayed to Novac; a daily Vercel cron
  (`/api/cron/affiliate-relay`, `CRON_SECRET`) retries failures for 7 days.
- `/partner` affiliate form → `/api/affiliate-applications` → Novac
  (falls back to a normal partner enquiry if Novac is unreachable).
- Turnstile bot check on all forms (code ready, not enabled live; see section 4).
- All of these requests are signed (HMAC). Contract:
  `docs/novac-integration.md`. Code: `src/lib/affiliate/*`.

**Until Novac is deployed this is dormant and harmless**: if
`AFFILIATE_API_URL` / `AFFILIATE_WEBHOOK_SECRET` aren't set, referral
features quietly switch off and enquiries still save normally. Don't remove
this code. When Novac goes live, set those two variables in Vercel.

Rules that come from Novac:
- **Affiliate commission rates, tiers and payout timing must never appear on
  this site.** The `/partner` page is benefit-led only.
- `is_existing_customer` is always sent as false (this site has no customer
  records; Novac's CRM decides).

## 3. Business email (Zoho) and search (Google)

- **Zoho Mail Lite**, 2 paid users, region `.sg`. Mailboxes `hello@ecostorage.sg`
  and `jonnylim@ecostorage.sg`. `sales@ecostorage.sg` is an **alias of
  `hello@`** (not a separate mailbox). Zoho's mail server accepts all three
  and rejects unknown addresses (checked 2026-10-10).
- DNS in Exabytes: three MX (`mx.zoho.sg` 10, `mx2` 20, `mx3` 50), one root SPF
  (`include:zohomail.sg`), Zoho ownership TXT, DKIM (`zmail._domainkey`), and
  the Google verification TXT. Zoho shows all records verified. **Keep one
  root SPF only.** Mail has not yet been tested with a real inbound message
  from outside; do one test to `hello@` and a reply back.
- **Google Search Console**: Domain property for `ecostorage.sg`, verified by
  DNS TXT (keep that record). Sitemap `https://ecostorage.sg/sitemap.xml`
  submitted; Search Console first reported "couldn't read" although the file
  fetches fine (200, valid XML, 34 URLs), a common new-site delay. Recheck
  after a couple of days. Indexing requested for `/personal`, `/corporate`,
  `/services`, `/resources`. Adding `hello@ecostorage.sg` as a second owner
  failed ("invalid email"); retry later.
- **Search titles and descriptions deliberately omit the brand name** and lead
  with value and reassurance (owner decision). Keep that when adding pages.
  Site-name and breadcrumb structured data are in `src/components/seo/`.

## 4. Needs checking

1. **Enquiry saving is confirmed working on live** (2026-10-09: a contact
   enquiry and a calculator quote both saved; the server key is present in
   Vercel). Test rows were deleted afterwards.
2. **`supabase/migrations/05_inquiries_server_only_insert.sql` is NOT applied.**
   The public "Public insert inquiries" policy still exists on `inquiries`.
   Now that server-side saving is confirmed, it can be applied; this removes
   the "anyone can insert" rule.
3. **Turnstile is not enabled on the live site.** The site key isn't set in
   Vercel (the submit button isn't gated). Set `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
   and `TURNSTILE_SECRET_KEY`, and `CRON_SECRET`, in Vercel when ready. With
   keys set, the form shows a loading message, and a "Try again" message if an
   ad blocker blocks the check.
4. **Resend (inquiry alert emails) is not set up.** No `send.` or
   `resend._domainkey` DNS records exist yet, so the site sends no email
   alerts; enquiries appear in `/admin` → Inquiries only. Plan: one Resend
   account (jonnylim@ecostorage.sg, created) with the verified domain
   `ecostorage.sg` shared with Novac, and a sending-only key named
   `main-site`. Resend's records go on `send.` + `resend._domainkey`, so
   Zoho's root MX/SPF stay untouched. This site only needs three variables:
   `RESEND_API_KEY`, `INQUIRY_NOTIFICATION_EMAIL` (hello@ecostorage.sg),
   `INQUIRY_NOTIFICATION_FROM` (`EcoStorage <notifications@ecostorage.sg>`).
   Code: `src/lib/email.ts`.
5. **Pricing changes shipped 2026-10-10 and are unverified on live**: commits
   `fc939e3` (calculator is the single pricing source; S$55 per module floor)
   and `543722e` (lock-in plans are N paid + free months; rent rounded up to
   10 cents). They pass type and lint checks; check a few real quotes.

## 5. Work completed 2026-10-09 (UX audit, commit `d8230bd`)

- Forms: specific error messages for each failure, 2000-character message limit
  with counter, browser email validation, required/optional markers, promo code
  collapsed behind a link, calculator button "Get My Quote" with inline
  validation, clearer bot-check states.
- Accessibility: darker greys for contrast, correct heading order and
  landmarks, 44px touch targets, three-line menu icon.
- Content: unambiguous dates ("5 Oct 2026"), "Keep reading" related articles,
  article bodies support `## Heading` and `- list` lines, distinct partner form
  headings, trust-segment commitment banners (gentle tone, drawn from themes in
  the sister company's reviews; no review is quoted anywhere).
- Admin: section editors are builder-style forms (cards to add, reorder and
  remove; no code-like syntax).
- 8 Mandarin articles published (`locale = 'zh'`, slugs end `-zh`), hub at
  `/resources/zh`, `/zh` redirects to it. **They are machine translations and
  need a native-speaker review.**
- Removed the public Sentry demo page. Fixed the cookie banner hydration error.
- Owner-verified claims (24/7 monitored, 6,500+
  customers, 13 locations, 8 years) are recorded in `PRODUCT.md`. Climate-controlled
  space is a real minority offering and may be mentioned.
- Trust banner and shirt back now say "transparent pricing and clear communication at
  every step" instead of "fully insured pickups" (owner decision, 2026-10-11). The live
  `sections` row was updated directly; `fallback-content.ts` matches.

**Not fixable in code:** all six library hero videos are 480p and look soft at
full width (new footage of 1080p or better is needed), and the HIP guide image
has visible seams in the file itself. Existing articles still have no
subheadings (would mean rewriting published text).

## 6. Other open items

- Supabase Auth: confirm "Allow new users to sign up" is off
  (Authentication → Sign In / Providers), and `ADMIN_ALLOWED_EMAILS` correct
  in Vercel (a typo there once blocked admin login).
- Admin 2FA: enrol in `/admin` → Security.
- Sentry: DSN saved; wizard step and test error not confirmed.
- UptimeRobot on `https://ecostorage.sg/api/health` (domain is now on Vercel,
  so this can be set up).
- GitHub Actions secrets for the daily DB backup workflow
  (`SUPABASE_PROJECT_REF`, `SUPABASE_DB_PASSWORD`).
- Google review link (`COMPANY.googleReviewUrl` in `src/lib/nav.ts`) is still `#`.
- The article "What to Expect on Moving Day": the owner is reviewing its
  publish state manually.
- `CLAUDE.local.md` (private instructions) is untracked and not in `.gitignore`;
  never commit it.

## 7. Secrets rule

Never paste real keys/passwords in chat. The user enters them into
`.env.local` (gitignored) or the dashboards. Claude may fix key names in an
existing `.env.local` but never prints or introduces secret values.
