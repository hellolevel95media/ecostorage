# EcoStorage website — Handoff

Updated 2026-10-10. Read this first. Older notes are in `docs/archive/`
(2026-09-29 session context, the partner-page task, the old todo list and
changelog); this file supersedes them.

## 1. What this is

The public marketing website for EcoStorage (Singapore valet storage +
moving): service pages, blog/CMS with admin, storage calculator, contact,
corporate and partner forms, English + Mandarin. Next.js 16 (App Router),
TypeScript, Tailwind, Supabase, Vercel.

- GitHub `hellolevel95media/ecostorage`, branch `main`. **Every push
  auto-deploys to production.**
- Vercel project `ecostorage` (team `level95`), currently at
  ecostorage-iota.vercel.app. Domain `ecostorage.sg` bought (Exabytes DNS,
  Vercel A + www CNAME records set); still to add the domain in Vercel and
  set `NEXT_PUBLIC_SITE_URL=https://ecostorage.sg`.
- Supabase project `dqmuuszmuyixjxonwjpv` (ap-southeast-1), account
  hello@level95media.com. The claude.ai Supabase connector is on this account.
- Accounts may move to `jonnylim@ecostorage.sg` later; not now.

## 2. Novac: the new system next door

**Novac** is EcoStorage's internal CRM/ERP (customers, jobs, billing, partner
movers, affiliates, photo vault), being planned in `D:\Novac`. It is a
**separate app with its own database**. The website keeps doing what it does;
it just sends some things to Novac.

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
- Turnstile bot check on all forms.
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

## 3. Needs checking now

1. **Enquiry form on the live site.** Enquiries are now saved with the
   server-only key, so Vercel must have `SUPABASE_SECRET_KEY` (or
   `SUPABASE_SERVICE_ROLE_KEY`). If it's missing, every enquiry fails with
   "Could not save your message". Check Vercel → Settings → Environment
   Variables, then send one test enquiry on the live site.
2. Once that works: apply `supabase/migrations/05_inquiries_server_only_insert.sql`
   (removes the public "anyone can insert" rule). Only after the server-side
   saving is confirmed live, or old browser-side inserts would break.
3. Turnstile keys and `CRON_SECRET` set in Vercel (the bot check is skipped
   if the site key isn't set).

## 4. Email (Resend), shared with Novac

Inquiry alerts use `src/lib/email.ts`: `RESEND_API_KEY`,
`INQUIRY_NOTIFICATION_EMAIL` (hello@ecostorage.sg),
`INQUIRY_NOTIFICATION_FROM` (`EcoStorage <notifications@ecostorage.sg>`).
Plan: one Resend account (jonnylim@ecostorage.sg, created) and one verified
domain `ecostorage.sg` shared with Novac; this site gets its own
sending-only key named `main-site`. Resend's DNS records go on `send.` +
`resend._domainkey`, so Zoho mail (root MX/SPF) is untouched; never add a
second root SPF. Setup is being done from the Novac session; this site only
needs the three variables.

## 5. Other open items (carried from the old todo list; recheck status)

- Supabase Auth: confirm "Allow new users to sign up" is off
  (Authentication → Sign In / Providers), and `ADMIN_ALLOWED_EMAILS` correct
  in Vercel (a typo there once blocked admin login).
- Admin 2FA: enrol in `/admin` → Security.
- Sentry: DSN saved; wizard step and test error not confirmed.
- UptimeRobot on `https://ecostorage.sg/api/health` once the domain is on Vercel.
- GitHub Actions secrets for the daily DB backup workflow
  (`SUPABASE_PROJECT_REF`, `SUPABASE_DB_PASSWORD`).
- Possible hydration warning from `CookieConsent` (seen 2026-09-29; may be fixed).

## 6. Secrets rule

Never paste real keys/passwords in chat. The user enters them into
`.env.local` (gitignored) or the dashboards. Claude may fix key names in an
existing `.env.local` but never prints or introduces secret values.
