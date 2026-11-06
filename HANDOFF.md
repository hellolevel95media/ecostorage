# EcoStorage website — Handoff (single merged copy)

Merged and synced 2026-11-06 from `HANDOFF.md` (2026-10-16), `HANDOFF-article-automation.md`,
`HANDOFF-security-diagnostic.md`, `HANDOFF-passive-marketing.md`, `HANDOFF-competitor-overlap.md`
and `docs/handoff-2026-11-02.md` (now in `docs/archive/`). Stale items were corrected against
the git history. **This file is now tracked in git** so both PCs share it. Read it first, once
per session. Update it only when the owner asks. The public repo means: no secrets, no keys,
no scraped reviews or reviewer data in any doc.

## 1. What this is

The public marketing website for EcoStorage (Singapore valet storage + moving): service pages,
blog/CMS with admin, storage calculator, contact, corporate and partner forms, English + Mandarin.
Next.js 16 (App Router), TypeScript, Tailwind v4, Supabase, Vercel.

- GitHub `hellolevel95media/ecostorage`, branch `main`. **Every push auto-deploys to production.**
- Vercel project `ecostorage` (team `level95`), live at **https://ecostorage.sg** (`www` redirects
  to the apex). `NEXT_PUBLIC_SITE_URL=https://ecostorage.sg`. Functions run in `sin1`.
- DNS/registrar: **Exabytes**. Vercel records: `@` A `216.198.79.1`, `www` CNAME
  `06f03c634ba12958.vercel-dns-017.com`.
- Supabase project `dqmuuszmuyixjxonwjpv` (ap-southeast-1), account hello@level95media.com.
- **Two PCs.** Work PC `C:\` (`C:\ecostorage`, `C:\Novac`), home PC `D:\`. Sync is git only
  (pull at start, push at end). `.env.local` comes from `vercel env pull` or the owner's password
  manager, never git. Commit/push as hellolevel95media. If push hangs on a hidden sign-in window:
  `GIT_TERMINAL_PROMPT=0 GCM_INTERACTIVE=never git -c credential.https://github.com.username=hellolevel95media push origin main`.
- Never commit `.env*`, `CLAUDE.local.md`, `profile-pics/`, `private/`, `Design/`, `v.tmp.mjs`.
- Vercel connector in Claude can't see the owner's team: ask the owner to confirm deploys are **Ready**.

## 2. Novac (internal CRM/ERP, separate app and DB in `C:\Novac`)

Sessions in this repo are website-only; don't edit `C:\Novac`. Anything saying "affiliate system"
means Novac.
- `?ref=CODE` sets a 14-day `eco_ref` cookie (`src/proxy.ts`); promo field → `/api/promo`;
  enquiries via `/api/inquiries` (price recalculated server-side), referred ones relayed to Novac,
  retry cron `/api/cron/affiliate-relay` (7 days); `/partner` form → `/api/affiliate-applications`.
  Requests are HMAC-signed. Contract: `docs/novac-integration.md`; code `src/lib/affiliate/*`.
- Dormant until `AFFILIATE_API_URL` / `AFFILIATE_WEBHOOK_SECRET` are set in Vercel. Don't remove.
- **Commission rates, tiers and payout timing must never appear on this site.** `is_existing_customer`
  is always sent false.
- Novac DBs: staging `tzqwnwcfnhjybquigher` (14ft + 3 movers price already S$350, audit-logged);
  live `funnvpmhyfxubvpdpafl` still has an S$250 placeholder. "14ft lorry with 2 movers" (S$300)
  price is the owner's call.

## 3. Business email, search, copy rules

- **Zoho Mail Lite**, region `.sg`: `hello@` and `jonnylim@ecostorage.sg`; `sales@` is an alias of
  `hello@`. DNS in Exabytes: 3 MX, **one root SPF only** (`include:zohomail.sg`), ownership TXT,
  DKIM `zmail._domainkey`, Google verification TXT. Real inbound/outbound test still not done.
- **Google Search Console**: Domain property verified by DNS TXT (keep it). Sitemap submitted
  (earlier "couldn't read" was a new-site delay; recheck). Adding `hello@ecostorage.sg` as second
  owner failed; retry.
- **Search titles/descriptions deliberately omit the brand name** (owner decision).
- Verified claims live in `PRODUCT.md` (24/7 monitored, 6,500+ customers, 13 locations, 8 years;
  climate-controlled space is a real minority offering).
- **Copy rules:** no 24-hour delivery guarantee (customers usually give 3-5 days' notice; say
  "scheduled to suit you"); no "fully insured pickups" (use "transparent pricing and clear
  communication at every step"); no testimonials, stats, crew sizes or warehouse locations in
  articles. **14ft full truckload is S$350** (`TRUCKLOAD_14FT_RATE` in `src/lib/calculator.ts`).
- **Address: 621 Aljunied Road, #03-06, Lipo Building, Singapore 389834**, now on the site, llms.txt
  and PRODUCT.md (commit `8e85829`). **Email signatures (Zoho) still need the new address and
  re-pasting.**
- **Contact number +65 8899 1184 is the only front-facing number** (site, WhatsApp button
  `wa.me/6588991184`, cards, flyers). +65 8899 7017 is the WhatsApp Cloud API number only (Novac's
  automated messages); never publish it.

## 4. Security and health (Next.js upgrade DONE)

The 2026-11-06 diagnostic was prompted by 3 critical Next.js 16.0-16.4.0 advisories
(GHSA-2464-fhr4-w9xw, GHSA-673q-mjm6-r5xr, GHSA-p3m5-59mp-jv5r; a newer Next also refuses to build
on affected versions). **Fixed: site is on Next 16.4.5** (`06c5b15`), plus `npm audit fix` and DB
function hardening migration 06 (`b7620ba`). Cached public pages use a cookie-free Supabase client.

Not confirmed as run (the rest of the diagnostic checklist): fresh-clone `npm ci && npm run build`
on Vercel-like conditions, live security headers, admin redirects when logged out, anon-key check
that `inquiries`/`page_views` aren't readable, API route input validation/rate limiting, SVG
handling in `next.config.ts` / media uploads, and an end-to-end enquiry test (only with owner's OK,
using an `@test.ecostorage.sg` email, then delete the row). Re-run these when asked; report first,
fix only typo-level issues unasked. Use `get_advisors` (Supabase) once before and once after any
migration.

## 5. Needs checking / open items

1. `supabase/migrations/05_inquiries_server_only_insert.sql` — was NOT applied as of 2026-10-16
   (public "insert inquiries" policy still on). Server-side saving is confirmed working, so it can
   be applied; verify current state first and ask the owner.
2. **Turnstile** not enabled live: set `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, and
   `CRON_SECRET` in Vercel when ready.
3. **Resend** (inquiry alert emails) not set up; enquiries only appear in `/admin` → Inquiries.
   Plan: Resend account under jonnylim@ecostorage.sg, domain `ecostorage.sg` shared with Novac
   (records on `send.` + `resend._domainkey`, Zoho MX/SPF untouched). Vars: `RESEND_API_KEY`,
   `INQUIRY_NOTIFICATION_EMAIL` (hello@), `INQUIRY_NOTIFICATION_FROM`
   (`EcoStorage <notifications@ecostorage.sg>`). Code `src/lib/email.ts`.
4. Pricing changes of 2026-10-10 (`fc939e3`, `543722e`) were unverified on live; spot-check quotes.
5. Supabase Auth: confirm "Allow new users to sign up" is off; `ADMIN_ALLOWED_EMAILS` correct in
   Vercel. Admin 2FA: enrol in `/admin` → Security.
6. Sentry: DSN saved; wizard step/test error unconfirmed. UptimeRobot on `/api/health` not set up.
7. GitHub Actions secrets for the daily DB backup (`SUPABASE_PROJECT_REF`, `SUPABASE_DB_PASSWORD`).
8. `COMPANY.googleReviewUrl` in `src/lib/nav.ts` is still `#` (needs Google Business Profile first).
9. Article "What to Expect on Moving Day" and `corporate-storage-singapore-businesses` are drafts the
   owner is reviewing (`published_at` null, cron ignores them).
10. 8 Mandarin articles (`locale='zh'`, slugs end `-zh`, hub `/resources/zh`) are machine
    translations; need native review before promotion. No more Mandarin until sorted.
11. GA4 dashboard `/admin/analytics`: check daily numbers populate (Realtime works); set GA event
    data retention to 14 months; optional Search Console integration.
12. Not fixable in code: library hero videos are 480p; HIP guide image has seams; older articles lack
    subheadings.
13. Reprint the renovation flyer (S$350, 8899 1184). Jonny Lim's job title on the name card is blank.
    Confirm `https://ecostorage.sg/brand/logo-icon.png` returns 200 before pasting signatures.

## 6. Daily article publishing (pushed in `964180f`, live)

- 16 finished English articles + images (real footage frames, faces blurred and eye-checked) were
  seeded to the **live DB as drafts** with `published_at` set; images in the Supabase `media` bucket.
  Source files: `content/articles/queue/NN-slug.md`, `content/articles/images/`.
- **One article every two days at 17:00 Singapore, 6 Nov to 6 Dec 2026.** Rows hold `published_at`
  08:50 UTC; cron `GET /api/cron/publish-articles` runs `0 9 * * *` (Bearer `CRON_SECRET`), publishes
  at most one overdue draft per run, and revalidates `/resources`, the slug, `/`, `/personal`,
  `/sitemap.xml`. Hobby plan timing is only accurate to the hour. Scheduled drafts are drafts with a
  future `published_at`; `ArticleForm.tsx` now keeps that date when saving a draft.
- **CHECK FIRST NEXT SESSION (2026-11-07 evening):** on 2026-11-06 the 17:00 SGT run had not published by 17:10 (article 01 still 404). `CRON_SECRET` was then saved in Vercel Prod (same as .env.local) and the site redeployed after the window. Owner chose to let the automation run unaided to test it. Check `curl -s -o /dev/null -w "%{http_code}" https://ecostorage.sg/resources/bed-wardrobe-mattress-during-hip` after 18:00 SGT on 7 Nov: 200 means working (the cron publishes one overdue draft per run, so article 02 is due 8 Nov). If still 404, check Vercel cron logs / a 401, then trigger the route manually with the secret.
- **Owner to confirm:** `CRON_SECRET` is set in Vercel Production (else 401 and nothing publishes) and
  the deploy is Ready. After the first run, confirm `/resources/bed-wardrobe-mattress-during-hip`
  is live.
- Queue order: 01 bed-wardrobe-mattress-during-hip, 02 protect-electronics-during-hip, 03 staying-home-
  during-hip-one-livable-room, 04 renovation-delay-what-to-do-with-belongings, 05 bto-key-collection-to-
  move-in-storage, 06 moving-out-of-rental-deposit-checklist, 07 student-belongings-storage-long-break,
  08 storage-contract-questions-before-you-sign, 09 pallet-storage-vs-crate-storage, 10 prevent-mould-damp-
  stored-items-singapore, 11 prepare-appliances-for-storage, 12 valet-storage-vs-self-storage-singapore,
  13 downsizing-home-keep-store-sell, 14 storing-belongings-overseas-posting, 15 packing-boxes-weight-
  labelling, 16 small-business-ecommerce-inventory-storage.
- Article format: header between `---` (`title, slug, category, tags, excerpt<155, image, image_alt`),
  body per `src/lib/article-body.ts` (paragraph = one line, `## Heading` only, `- ` lists, no numbered
  lists, `[[media:URL]]` images). Style: 800-1200 words, no litotes, varied endings, light CTA ok.
- **Facts for the owner to review:** crate vs pallet wording (09), climate-controlled mention (09, 10),
  fragile-packing extras "communicated in advance" (15), prohibited-items list (14: confirm real terms).
  Article 06 uses the approved S$350 line. No legal/tenancy advice (06, 16).
- Reschedule: update `published_at` on drafts, or re-seed with `scripts/seed-article-queue.mjs
  --every N --at HH:MM` (dry-run default, `--apply`). New batch: add files to the queue folder and
  seed with a new start date. When fewer than ~7 queued remain
  (`select slug, published_at from articles where status='draft' and published_at > now()`), ask for a
  new batch, using Search Console/GA4 to choose topics. 401 from the cron = `CRON_SECRET` missing.

## 7. Marketing plan (planning only, nothing built; budget very tight, no paid ads yet)

Build assets first. Suggested order: (1) update Zoho signatures with the Aljunied address; (2) claim
Google Business Profile, put the real review link in `nav.ts`, QR on collateral; (3) ~10 Singapore
directory listings with identical name/address/phone; (4) owner pastes 1-star and 5-star reviews of 5-8
competitors by hand, Claude clusters themes into an ops checklist + article/ad angles; (5) partner
one-pager PDF (link + QR, no commission rates); (6) Meta: connect Instagram, install pixel, no spend;
(7) later: first ads, optional scraper pilot. Upkeep cadence: reply to reviews and one photo weekly,
one article monthly (now automated), GA4 read monthly, partner review monthly, directories yearly.
Open: Meta vs Google Ads first; whether to do the scraper pilot; turn this into a tracked checklist.

### Competitor-overlap pilot (research only, undecided)
Idea from TikTok @angusthenontechnical ("borrow a fan base"): scrape competitor Google Maps reviewers
(Apify), find non-competitor businesses sharing the most reviewers, approach them as partners, and mine
review text for why people love/leave competitors. EcoStorage has no Google reviews of its own.
- Pilot: 5-8 competitor facilities, ~1,000-2,000 reviews, ~a week, tens of dollars. Stages: seed →
  reviewer graph → overlap ranking → theme mining → partner outreach (owner approves/sends) → ad
  angles → tracking table. Partner categories: movers/renovators, property agents/managers, condo
  managers, interior designers, e-commerce sellers, student housing, relocation services.
- Success: ≥5 plausible partners, themes specific enough to change operations, ≥3 partner conversations
  and one measurable ad test.
- Risks: scraping Google Maps breaks Google's terms; reviewer names/IDs are personal data (PDPA: hash
  IDs, drop names, aggregates only, never contact individual reviewers, B2B only); outreach must not say
  "we noticed shared reviewers"; keep scraped data and `.env*` out of git. **Cheaper route preferred:**
  hand-pasted reviews. Keep the pilot away from the Google account that will own the Business Profile.
  Consider a separate Supabase project for pilot data.
- Unanswered: area, competitor list, scraping vs text-only, Apify account, Meta vs Google.
- Working style: consultant-like (ask needs first, explain how/why); `npx`/`npm` running third-party code
  needs explicit "go ahead" with commands listed first; create files with Write/Edit, not PowerShell
  `Set-Content`.

## 8. Collateral (`Design/`, git-ignored, local to the work PC)

Rebuild: `npm i --no-save playwright qrcode opentype.js`, `npx playwright install chromium`, then
`node Design/_build/build.js [shirt|card|flyer|signature]` (retry once on a file-lock error). Done:
shirt, name card (Aljunied), brochure and renovation flyers, 3 email signatures (need re-pasting into
Zoho). On another PC rebuild or copy the folder.

## 9. Meta Business Suite and WhatsApp (in progress; Claude is view-only, the owner makes every change)

- Use the **`ecostorage.sg` portfolio (1411102151224785)**: Page `Ecostorage.sg` (1450478074807041),
  Instagram `@ecostorage.sg` (1447787901731713), ad account `EcoStorage` (2185287639079477, SGD),
  WhatsApp account. Legal name STORAGE VAULT PTE. LTD. Leftover empty portfolios: Storage Vault Pte Ltd
  (1444007637856782, deletable by owner, irreversible, do last), Easy Store and Lucky FortuneCat SG
  (owner's other business, leave alone).
- WhatsApp +65 8899 7017 "Connected" via Cloud API (limit 250 customers/24h). Unknown whether the iPhone
  WhatsApp Business app can coexist; owner to test, else replies via Business Suite Inbox or Novac Flow.
- Instagram not yet connected to the ad account: Settings → Accounts → Instagram accounts →
  @ecostorage.sg → Connect assets → Other business assets → tick EcoStorage → Add.
- Neither portfolio is verified (not currently required; have the ACRA BizFile ready for WhatsApp scale).
- To do: Primary Page; require 2FA; backup admin; domain verification (TXT
  `facebook-domain-verification=` at Exabytes, keep SPF); ad payment method; connect Novac Flow (Novac
  session owns it; tokens only in Novac/Vercel settings, never chat); WhatsApp opt-in wording for PDPA.
- Chat-history idea: no bulk WhatsApp export; unencrypted local iPhone backup + open-source
  `wtsexporter`; mask personal data before any AI use (PDPA).

## 10. Secrets rule

Never paste real keys/passwords in chat. The user enters them into `.env.local` (gitignored) or
dashboards. Claude may fix key names in an existing `.env.local` but never prints or introduces secret
values. Check env with key names only: `grep -o '^[A-Z_]*=' .env.local`.
