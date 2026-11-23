# EcoStorage website — Handoff (single merged copy)

Tracked in git so both PCs share it. Read it first, once per session; update only when the owner asks.
Public repo: no secrets, keys, scraped reviews or reviewer data in any doc. Last full rewrite
2026-11-10; tidied 2026-11-15 and 2026-11-16 (completed items removed; git history has the originals;
`docs/archive/` holds older handoffs, already merged here).

## Recent direct tasks
Rule (owner-approved 2026-11-20): one line per task Jonny gives directly, max 10 lines, tidy every session, nothing older than 2 weeks.
2026-11-20 | Analytics snapshot, organic growth ideas | done (GA + Search Console zip reviewed)
2026-11-20 | Search Console CSV analysis, title rewrites for 3 weak pages | waiting on owner approval to apply
2026-11-20 | First-hand HIP articles (9) from owner's flat photos + long-form answers; byline "Jonny", voice "we", no dates in text, never show unit number 10-211 | done: inserted as drafts 21-29 Nov (one/day 08:50 UTC); 15 non-HIP drafts moved to every 2 days 1-29 Dec; drafts in `content/articles/drafts-hip-firsthand/`; marketing told (`handoffs/to-marketing_2026-11-20_jonny-voice-first-hand-articles.md`)
2026-11-20 | HIP facts: mum's glasses stepped on by contractor (left lying around); contractor faces OK; blur numbers in checklist photo; this flat's furniture WAS stored with EcoStorage (blurred pallet photos only) | recorded
2026-11-20 | Search Console "Page with redirect" / "Discovered - not indexed" | diagnosed: only http://ecostorage.sg/ (intended 308), site healthy; owner to Request Indexing for /services and 2 -zh articles
2026-11-20 | Connect Search Console so Claude reads it directly | waiting on owner choice: Google Cloud service-account setup list, or search for simpler connector first
2026-11-21 | Marketing asks: confirm `storing-for-hip-in-waves` live on 26 Nov and send final URL (https://ecostorage.sg/resources/storing-for-hip-in-waves) for post 2 bio link | open; owner has not read the 9 HIP drafts yet (first live 21 Nov 08:50 UTC); check door/gate photos for unit number 10-211
2026-11-20 | Google Business Profile help | waiting (later today)
2026-11-21 | GA4 trend chart (artifact https://claude.ai/artifact/7U2mv4wsQP156jr5tWRpco, private): 45 sessions 2-20 Nov (Direct 30, Organic 11, AI Assistant 3 on 12 Nov, Social 1); Direct spike 16-17 Nov likely internal | done. From editing session: who-we-are (24 Nov) and HIP notice (27 Nov) posts ready; use `final_v2.mp4`, `captions.srt`, `cover.png` (option A) in `C:\editing\exports\social\<post-id>\`; their handoff `C:\editing\HANDOFF.md`. Nothing committed this session.
2026-11-23 | GA4 report 17-23 Nov + make promo tracking airtight | done: 19 users (+90%), 25 sessions, Google organic 12 (11 land on HIP articles), no social; 1 calculator lead 17 Nov 2pm has no DB row (owner: probably a test); 23 Nov promo_applied from hip-when-nobody-is-home-all-day had empty article (next/link keeps old document.referrer). Fix: `InlineText` adds `src=<slug>` to article ?promo= links, calculator sends promo_article, `/api/inquiries` saves `metadata.promoArticle`, `promo_applied` has source link|typed; migration 11 adds `promo_article` to `social.inquiries_attribution` (applied live). Owner focus: grow traffic before changing the calculator.

## 0a. Social team link-up (18 Nov, work PC) - NEW, read first

The social team works in `C:socmark` (sessions `socmark-c1` etc.; Claude sessions on this PC can message each other with SendMessage/ListAgents, or exchange files in `handoffs/`). Their request: `C:socmarkhandoffs	o-website-ecostorage_2026-11-18.md`; our reply: `handoffs/reply-to-socmark_2026-11-18.md` (written before apply, its status lines are stale; this section is current). Owner approved everything below.
- **UTM attribution LIVE** (f5f6cbc): `src/lib/attribution.ts` + `AttributionCapture.tsx` keep first-touch utm_source/medium/campaign/content, landing path, referrer host for 30 days in localStorage, **only at the "accepted" consent level**; `/api/inquiries` writes them to new nullable `inquiries` columns; UTM values on GA4 `generate_lead`. NOT carried by `/api/affiliate-applications`. **Never end-to-end tested on live**: open `/?utm_source=test&utm_medium=social&utm_campaign=test`, send a test enquiry, check the columns. UTM params must be registered as GA4 event-scoped custom dimensions to appear in reports (owner, click-by-click).
- **DB migrations applied live 18 Nov** (files in `supabase/migrations/`): 07 attribution columns; 08 schema `social` (view `social.inquiries_attribution`, no PII; tables snapshots_daily, post_stats_daily, manual_entries; role `social_reader` nologin, unused); 09 service_role grants; 10 `social.feedback` + `social.error_log`. Owner added `social` to Supabase Exposed schemas. RLS on, no anon/authenticated access. Advisors unchanged apart from intended "RLS, no policy" INFO on the two new tables.
- **Dashboard** = separate Vercel project `ecostorage-social` (Level95 team, repo hellolevel95media/ecostorage-social), live. We copied to it (values never printed; sensitive): NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, ADMIN_ALLOWED_EMAILS, GA4_PROPERTY_ID/CLIENT_EMAIL/PRIVATE_KEY, plus a NEW CRON_SECRET. Service role key came from this PC's local `.env.local`, GA4 from the local service-account file. Rotating the website's keys later means checking that project too.
- **Meta + TikTok pixels LIVE but dormant** (1c76d20): `MarketingPixels.tsx`, `src/lib/pixels.ts`; load only at "accepted", never /admin, nothing loads until `NEXT_PUBLIC_META_PIXEL_ID` / `NEXT_PUBLIC_TIKTOK_PIXEL_ID` are set in Vercel (ecostorage project) and redeployed. Lead/SubmitForm fire on confirmed enquiry (via `trackEvent("generate_lead")`), Contact on WhatsApp click. New banner text (single "Got it" button kept), /cookies "Marketing pixels" section, "four categories", CSP allows facebook/tiktok. **Owner approved wording 18 Nov. Next: owner creates the pixels and gives the IDs.**
- WhatsApp widget keeps its existing prefilled message (owner only declined channel-specific prefills). Article go-live dates were sent to socmark (list in the reply file; they can move).
- `AGENTS.md` shows modified again (auto-generated by `next dev`; `git checkout -- AGENTS.md` only with owner's OK). Untracked `20SQFT WASTED.png` is the owner's hero reference.

## 0. Where we are (end of session 2026-11-16, work PC)

**GA4 check-in done 16 Nov** (started a day early; the system date was 16 Nov). Next: see the open list below. Keep GA4 instructions click-by-click: the owner found GA4's UI confusing. **Never send the owner to
"Create event"** (it builds a new event and asks for a URL; ours already exist).

- **GA4 event tracking shipped 15 Nov** (commits f5ca662, f19d343, ddbff0f, bf9c892; deploys Ready).
  `src/lib/analytics.ts` `trackEvent()` + `src/components/ui/TrackedLink.tsx`. Events:
  `generate_lead` (form_type contact/personal/corporate/partner/calculator), `whatsapp_click`,
  `phone_click`, `email_click` (location), `calculator_start` (trigger), `calculator_step` (step),
  `promo_applied`, `affiliate_apply`, `form_error` (form_type, reason). Verified by Playwright and by the
  owner in GA4 Realtime (`email_click` not spotted there; Claude confirmed the live site fires it).
  `/admin/analytics` has a "Leads and actions" panel reading these via the GA4 Data API.
- **Consent = opt-out (PDPA).** Banner: "Got it" + "cookie settings" link only. `/cookies` offers Full
  analytics (default) / Anonymous, no cookies (Consent Mode v2, analytics_storage denied) / Off.
  localStorage `ecostorage-cookie-consent` = accepted | anonymous | declined.
- **Owner done in GA4 on 15 Nov:** 5 event-scoped custom dimensions (form_type, location, step, trigger,
  reason); live test passed; data retention 14 months; Search Console linked + collection published;
  internal-traffic IP rule created (filter left on Testing); cross-domain list set to `ecostorage.sg`
  (tag quality now "Excellent"; stray `*.vercel.app` hits dismissed). Key events tab holds only GA4's
  placeholders `close_convert_lead`, `qualify_lead` (never fire, leave) and `purchase`.
- **Done 16 Nov:** `generate_lead`, `whatsapp_click`, `phone_click` starred as key events; Internal Traffic
  data filter set to **Active** (owner's own visits and tests no longer count, so test from a phone on
  mobile data or ask for a different IP); admin Leads panel checked against a screenshot (1/1/1/0, matches
  GA4); ledger rows added (commit 9059551).
- **Shipped 16 Nov (commits c43bf43, efbf26c):** `/partner` redesigned as two separate cards (affiliate vs
  business partnership); promo-code box + calculator now support Novac stand-alone promo codes
  (`kind:"promo"`: storage-fee-only discount, Month-to-Month-only when `plans_with_free_months` is false, no
  stacking with an `eco_ref` affiliate link, EN + ZH texts in `src/lib/promo-text.ts`). Tested only against a
  mock Novac; **real staging test DONE 16 Nov** (owner enquiry promo3@test.ecostorage.sg; banners verified).
  **Pricing (owner, 16 Nov): one S$60 per 20 sqft module for every size, volume tiers removed** (calculator,
  `calcspec.md`, `visaid.md`, `PRODUCT.md`); the S$55/module floor is now ONLY the lowest rent Novac staff can set by hand
  (a "best rate" to close a sale); **promo codes ignore it** (owner decision 17 Nov, live in Novac on staging and
  live: validate returns `floor_per_module: null`; the site treats null/absent as no floor, a number is still
  respected). Savings = plan free months + promos only. Thumbnails added to all 5 drafts that lacked one (defects article uses a real
  stretch-wrapped-boxes frame from `C:\editing`; Canva generation couldn't be downloaded). Promo "ticket"
  card + Promo Gold token (DESIGN.md) added; `PromoTicket.tsx`. Vercel CLI: work PC uses `--global-config .vercel/auth`; home PC has global CLI logged in as hello-76246995 (use `--scope level95`).
- **DONE (GA4, 16 Nov evening):** `email_click` now in Admin > Events (left unstarred). Old note:
  (standard reports lag 24-48h; there is no "Existing events" tab). Do NOT star it: it was never meant to
  be a key event. If still absent from the Events list by 18 Nov, check the site's email links and run a
  `run_report` for it. The GA MCP server works on the work PC (it answered 16 Nov).
- **Enquiry emails work in production:** Resend notification to hello@ arrived on the 15 Nov test.
- **Vercel CLI works** via `npx vercel <cmd>` from the repo root (user hello-76246995, linked
  level95/ecostorage, writes `VERCEL_OIDC_TOKEN` to `.env.local`). Production env has all four GA vars,
  RESEND_API_KEY, CRON_SECRET, INQUIRY_NOTIFICATION_*; the two Turnstile keys are NOT in Vercel.
- **Owner to-do, DEFERRED by owner (16 Nov):** (a) rotate `RESEND_API_KEY` and `CRON_SECRET` (printed in chat
  2026-11-10; update both in Vercel and redeploy, or the publish cron returns 401) and the local
  Turnstile secret. Checked 16 Nov: Novac (`C:\Novac`) uses its own, different Resend key (hash differs)
  and its own Vercel project, so nothing there has rotated these; this site's pair is NOT done unless the
  owner did it in the Vercel dashboard (can't tell: Vercel CLI isn't linked on the work PC, link would
  need `vercel link`). Rotating here doesn't touch Novac. The only reason to do it is that the old values
  sat in a chat log; the risk is low, so the owner may defer it.
  (b) confirm which "accounts and settings" in section 5 are done.
- **Open list 16 Nov: ALL CLOSED on home PC except key rotation (deferred). Only dated item left: FAQ + Summary for the 28 Nov article before ~25 Nov.**
  Status 16 Nov evening (home PC):
  1. DONE: owner ran the staging promo test (enquiry promo3@test.ecostorage.sg); banners look right.
  2. DONE: Novac live pricing confirmed S$60 per module.
  3. DONE: `email_click` now listed in GA4 Admin > Events (recent events, 16 Nov). Left unstarred (not a key event).
  4. DONE: deleted all 108 headless/Playwright rows from live `page_views` (15-16 Nov tests + a few Oct/Nov bots); 192 real rows remain.
  5. DONE: `partner-redesign` branch deleted (0 unique commits, no PR). Latest production deploy Ready. Vercel CLI now global on home PC, logged in as hello-76246995 (`vercel ls --scope level95`).
  6. DONE: ZH promo texts reviewed.
  7. Deferred by owner: rotate RESEND_API_KEY and CRON_SECRET.
  8. Thumbnails are all done (17-20 Nov HIP drafts + corporate).
- **Home hero animation (17 Nov, pushed):** `src/components/sections/SpaceComparison.tsx` (client component, inline SVG +
  the `motion` package) sits above the hero headline on the HOME page only (`<HeroBanner showSpaceComparison />`; the
  prop is opt-in because HeroBanner is shared by personal/corporate/mission/partner). Left, pink "lock-and-key": static
  boxes and red aisles, a counter that climbs 0 to 200 SQFT WASTED (grows and reddens, fixed-width digits); a figure
  pushes two boxes up the middle aisle, turns 180 degrees and walks out. Right, green EcoStorage pallets, fixed
  "0 SQFT WASTED": a forklift snakes round the block to fill the far corner slot, then returns and removes the nearest
  pallet. Same room and box size both sides; 12 s loop; reduced-motion shows the final frame; English/Chinese text via
  `<html lang>`. Mobile: panels stack at 70svh over the hero video. Tuning lives in the constants and keyframe arrays
  at the top of each Scene. Sketch `20SQFT WASTED.png` in the repo root is the owner's reference (not committed).
  Playwright is not in package.json (install with `npm i --no-save playwright` to test).
- **Article CTAs DONE 17 Nov (live DB, owner approved):** 31 EN articles (17 published, 14 drafts) got two friendly
  CTAs: a short "this might help" line mid-article (before the next heading after the most relevant section, or at the
  paragraph midpoint for headingless articles) and a sincere reminder at the end (mentions the code). Six HIP articles
  whose Summary already linked `/personal#quote` had that link upgraded to the promo link instead of a second line.
  Code per topic: HIP10 (all HIP), RENO10, MOVE10 (rentals/moving/packing/downsizing/overseas), BTO10, STUDENT10,
  BIZ10. NOT given a CTA (no fitting code, owner to decide): long-term-storage guide, how-we-protect, accurate-quote,
  ambient-vs-aircon, fragile packing, how-much-space, pallet-vs-crate, mould, appliances, valet-vs-self-storage,
  contract-questions; the 8 `-zh` articles also untouched (English wording). Backup of all bodies before the change:
  table `articles_body_backup_20261117` (RLS on; drop it once happy). Live check 17 Nov: all six codes validate on
  production with `floor_per_module: null`; promo links render; IndexNow pinged for the 17 published pages. New
  articles should end with the matching CTA. Code pushed as db822af. Original notes:
- **Article promo codes (17 Nov, work PC; site code pushed db822af and deployed):** six topic codes
  created in Novac by the owner: `HIP10`, `RENO10`, `MOVE10`, `BTO10`, `STUDENT10`, `BIZ10` (10% off the first month's
  storage fee only, no max, one use per customer, repeat customers allowed, max 100 claims per code to see how long
  each takes to hit 100; each code's note names its article topic). Site side: `?promo=CODE` on the calculator link
  (`/personal?promo=HIP10#quote`) auto-applies the code (`lookupPromo`/`trackPromoApplied` in `PromoCodeInput.tsx`,
  effect in `StorageCalculator.tsx`); the article is taken from `?src=slug` or the same-site referrer
  (`/resources/<slug>`) and sent on GA4 `promo_applied` (`source:"link"`, `article`) and `generate_lead`
  (`promo_article`). Tested with Playwright (installed `--no-save` on this PC) against a mocked `/api/promo` with
  Novac's new reply: all good, S$6 off one module. A live check against real Novac is still to do after deploy
  (local `.env.local` points at `localhost:3000`, so `/api/promo` returns 503 locally). **Next:** owner approves CTA
  wording, then add a light CTA line + `/personal?promo=CODE#quote` link to each article group (HIP, renovation,
  moving/rentals, BTO, student, corporate/e-commerce); register `article` and `promo_article` as GA4 event-scoped
  custom dimensions (click-by-click). Don't touch the live DB without the owner's OK. Leftovers from this session:
  dev server on port 3111 may still be running, and `AGENTS.md` shows modified (auto-generated by `next dev`;
  `git checkout -- AGENTS.md`).
- **Articles:** queue healthy; owner parked the non-HIP FAQ + Summary retrofit for now. The first one
  without it publishes 28 Nov (student-belongings-storage-long-break): raise it before ~25 Nov.

## 1. What this is

Public marketing site for EcoStorage (Singapore valet storage + moving): service pages, blog/CMS with
admin, storage calculator, contact, corporate and partner forms, English + Mandarin.
Next.js 16.4.5 (App Router), TypeScript, Tailwind v4, Supabase, Vercel.

- GitHub `hellolevel95media/ecostorage`, branch `main`. **Every push auto-deploys to production.**
- Vercel project `ecostorage` (team `level95`), live at **https://ecostorage.sg** (`www` redirects to
  apex). `NEXT_PUBLIC_SITE_URL=https://ecostorage.sg`. Functions in `sin1`. The Claude Vercel connector
  can't see the owner's team: ask the owner to confirm deploys are **Ready**.
- DNS/registrar **Exabytes** (`@` A `216.198.79.1`, `www` CNAME `06f03c634ba12958.vercel-dns-017.com`).
- Supabase project `dqmuuszmuyixjxonwjpv` (ap-southeast-1). Article content lives in `articles`
  (cols: slug, title, category, tags, thumbnail_url, excerpt, body, status, published_at, author, locale).
- **Two PCs.** Work PC `C:\`, home PC `D:\`. Sync via git only (pull at start, run
  `node scripts/git-tidy.mjs`, push at end). `.env.local` from `vercel env pull` or the owner's password
  manager, never git. Commit as hellolevel95media. Push hang fix:
  `GIT_TERMINAL_PROMPT=0 GCM_INTERACTIVE=never timeout 60 git push origin main`. Repo-local
  `credential.https://github.com.username=hellolevel95media` is per-PC; set again on a fresh clone.
- Never commit `.env*`, `CLAUDE.local.md`, `profile-pics/`, `private/`, `Design/`, `v.tmp.mjs`.
- Secrets rule: never paste or print real keys. Check env with key names only:
  `grep -o '^[A-Z_]*=' .env.local`. Never print values.

## 2. Novac (internal CRM/ERP, separate app and DB in `C:\Novac`)

Sessions here are website-only; don't edit `C:\Novac`. "Affiliate system" = Novac.
- `?ref=CODE` sets a 14-day `eco_ref` cookie (`src/proxy.ts`); promo → `/api/promo`; enquiries via
  `/api/inquiries` (price recalculated server-side), referred ones relayed to Novac, retry cron
  `/api/cron/affiliate-relay`; `/partner` form → `/api/affiliate-applications`. HMAC-signed. Contract
  `docs/novac-integration.md`, code `src/lib/affiliate/*`. Dormant until `AFFILIATE_API_URL` /
  `AFFILIATE_WEBHOOK_SECRET` are set in Vercel. Don't remove.
- **Commission rates, tiers and payout timing must never appear on this site.**
- Novac DBs: staging `tzqwnwcfnhjybquigher` (14ft + 3 movers = S$350); live `funnvpmhyfxubvpdpafl` still has
  an S$250 placeholder. "14ft lorry with 2 movers" (S$300) is the owner's call.

## 3. Business facts, email, copy rules

- **Zoho Mail Lite** (`.sg`): `hello@` and `jonnylim@ecostorage.sg`; `sales@` aliases `hello@`. Exabytes DNS:
  3 MX, one root SPF (`include:zohomail.sg`), ownership TXT, DKIM `zmail._domainkey`. Signatures updated.
  Real inbound/outbound test still not done.
- **Google Search Console:** Domain property verified by DNS TXT (keep). Adding `hello@ecostorage.sg` as
  second owner failed earlier; retry.
- Search titles/descriptions deliberately omit the brand name (owner decision).
- Verified claims in `PRODUCT.md` (24/7 monitored, 6,500+ customers, 13 locations, 8 years; climate-
  controlled is a minority offering, ~15% of space).
- **Copy rules:** no delivery-time guarantee (say "scheduled to suit you"; "a few days' notice" is OK);
  no "fully insured pickups"; no testimonials, stats, crew sizes or warehouse locations in articles.
  **14ft full truckload = S$350** (`TRUCKLOAD_14FT_RATE`, `src/lib/calculator.ts`).
- **Address:** 621 Aljunied Road, #03-06, Lipo Building, Singapore 389834 (site, llms.txt, PRODUCT.md).
  No physical office/walk-ins: keep street address out of signatures and marketing.
- **Only front-facing number +65 8899 1184** (WhatsApp `wa.me/6588991184`). +65 8899 7017 is the WhatsApp
  Cloud API number only; never publish.
- **Google review link (live):** `COMPANY.googleReviewUrl` in `src/lib/nav.ts` =
  `https://g.page/r/CaLiAkVhgH3ZEAI/review` (footer link tested by owner).

## 4. Security and health

Next 16.4.5 (fixes 3 critical advisories), `npm audit fix`, DB hardening migration 06, migration 05
applied (no public insert on `inquiries`). 2026-11-06 diagnostic all pass: security headers, `/admin`
redirects when logged out, anon key can't read `inquiries`/`page_views`/`profiles`, `/api/inquiries`
validates, cron needs auth, `media` bucket excludes SVG. Not tested: rate limiting (would spam the live
form). Supabase advisors: `is_admin()` executable by anon (left, RLS depends on it); leaked-password
protection off (Pro-only, owner ignored). Run `get_advisors` once before and once after any migration.
Lint: only errors are in git-ignored `Design/_build/*.js`.

## 5. Open items

**Earmarked, don't raise unless asked (owner hates re-checking):** Turnstile (free Cloudflare anti-spam
on forms) and Resend (emails hello@ when an enquiry arrives). Status unknown: keys exist in local
`.env.local`, unconfirmed in Vercel, live JS didn't contain the Turnstile site key on 2026-11-10. If
enabling: Vercel vars `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`,
`INQUIRY_NOTIFICATION_EMAIL` (hello@), `INQUIRY_NOTIFICATION_FROM` (`EcoStorage <notifications@ecostorage.sg>`);
Resend domain `ecostorage.sg` shared with Novac (`send.` + `resend._domainkey`, Zoho MX/SPF untouched).
Code `src/lib/email.ts`. Status 15 Nov: Resend + notification vars are in Vercel and the
notification email works; Turnstile keys are local only, so Turnstile is still off in production.

**Accounts and settings (owner to confirm which are done):**
1. Supabase Auth → "Allow new users to sign up" off.
2. Vercel: `ADMIN_ALLOWED_EMAILS` holds only admin email(s).
3. Admin 2FA enrolled (`/admin` → Security).
4. Sentry: DSN saved; confirm a test error arrives.
5. UptimeRobot monitor on `/api/health`, alerts to hello@.
6. GitHub Actions secrets for the daily DB backup: `SUPABASE_PROJECT_REF` (`dqmuuszmuyixjxonwjpv`),
   `SUPABASE_DB_PASSWORD` (owner enters it, never chat).
7. ~~GA4 retention~~ done 15 Nov.
8. Spot-check live quotes after the 2026-10-10 pricing changes (`fc939e3`, `543722e`).

**Other:**
- Drafts `what-to-expect-on-moving-day` (18 Dec) and `corporate-storage-singapore-businesses` (20 Dec) were
  ones the owner was reviewing; they are now scheduled, so confirm reviewed before those dates.
- Jonny Lim's job title on the name card is blank. Confirm `https://ecostorage.sg/brand/logo-icon.png`
  returns 200 if signatures are re-pasted.
- Not fixable in code: library hero videos 480p; HIP guide image has seams; older articles lack subheadings.
- Marketing step still open: QR code for the Google review link on collateral.

## 6. Articles: publishing, standard, queue

**Mechanics.** Drafts with future `published_at` (08:50 UTC) are published by cron
`GET /api/cron/publish-articles` (`0 9 * * *`, Bearer `CRON_SECRET`), at most one overdue draft per run,
revalidating `/resources`, the slug, `/`, `/personal`, `/sitemap.xml`, llms.txt, and pinging IndexNow.
Hobby-plan timing drifts within the hour (confirmed working). 401 from the cron = `CRON_SECRET` missing.
`ArticleForm.tsx` keeps `published_at` when saving a draft. Reschedule by updating `published_at` in SQL
(2026-11-10 used a CTE with `row_number()`), or `scripts/seed-article-queue.mjs --every N --at HH:MM`
(dry-run default, `--apply`) for new batches from `content/articles/queue/`. Ask for a new batch when
fewer than ~7 drafts remain (`select slug, published_at from articles where status='draft'`).

**Format** (`src/lib/article-body.ts`): paragraphs separated by blank line; `## ` headings; `### Question?`
subheadings (FAQ only); `- ` lists (no numbered lists); `[text](/path)` inline links (internal or https
only); `[[media:URL]]` images. Style: 800-1200 words, no litotes, varied endings, light CTA. An
`## Frequently asked questions` section auto-emits FAQPage JSON-LD (`ArticleJsonLd.tsx`).

**ARTICLE STANDARD (owner, 2026-11-10):** every new article ends with `## Frequently asked questions`
(3-5 Q&As, facts only from the article) then a final `## Summary` (3-5 bullets, optional light CTA link
to `/personal#quote`, anchor `id="quote"` is in `StorageCalculator.tsx`). Workflow: draft in chat, owner
approves, then write to the DB (`update articles set body = rtrim(body) || $$...$$`, or insert as draft).
Never write to live DB without the owner's OK; drafts are safe until their date.

**Queue now (all `draft`):**
- HIP daily: 15 hip-with-seniors-children-pets, 16 hip-move-out-or-stay-home,
  17 hip-when-nobody-is-home-all-day, 18 hip-defects-damaged-belongings, 19 hip-toilet-water-test-opt-out,
  20 Nov hip-voting-75-percent-how-it-works. All 6 have FAQ + Summary.
- Non-HIP every 2 days: 22 Nov renovation-delay-what-to-do-with-belongings, 24 bto-key-collection-to-move-in-
  storage, 26 moving-out-of-rental-deposit-checklist, 28 student-belongings-storage-long-break, 30
  storage-contract-questions-before-you-sign, 2 Dec pallet-storage-vs-crate-storage, 4
  prevent-mould-damp-stored-items-singapore, 6 prepare-appliances-for-storage, 8
  valet-storage-vs-self-storage-singapore, 10 downsizing-home-keep-store-sell, 12
  storing-belongings-overseas-posting, 14 packing-boxes-weight-labelling, 16
  small-business-ecommerce-inventory-storage, 18 what-to-expect-on-moving-day, 20 Dec
  corporate-storage-singapore-businesses.
- Already published (EN): hip-announced-what-happens-next, hip-cost-what-hdb-residents-pay,
  hip-optional-improvements-which-to-choose (12-14 Nov, verified 200 with FAQ + Summary), bed-wardrobe-mattress-during-hip, protect-electronics-during-hip,
  staying-home-during-hip-one-livable-room, hip-timeline-week-by-week, hip-prep-checklist,
  what-is-hdb-hip-guide, store-furniture-during-hip, how-much-dust-hip-generates, diy-plastic-covering-hip,
  decluttering-before-a-move, storage-for-home-renovations-singapore, how-much-storage-space-do-you-need,
  how-to-pack-fragile-valuable-items, ambient-storage-vs-air-conditioned, moving-between-rentals-singapore,
  getting-an-accurate-storage-quote, how-we-protect-your-belongings, long-term-storage-singapore-guide
  (+ 8 `-zh` Mandarin articles, reviewed; hub `/resources/zh`).

**FAQ + Summary still missing:**
- 12 non-HIP drafts (student-belongings onward): add before each publishes (28 Nov first).
- Published articles: Summary only missing on ambient-storage-vs-air-conditioned and
  long-term-storage-singapore-guide (they have FAQ). Neither section on the other 14 older published
  EN articles; priority hip-timeline-week-by-week, hip-prep-checklist, store-furniture-during-hip,
  how-much-dust-hip-generates, diy-plastic-covering-hip, staying-home-during-hip-one-livable-room,
  bed-wardrobe-mattress-during-hip, protect-electronics-during-hip. Retrofit one at a time with owner approval.
- Thumbnails: all drafts have one (done 16 Nov).

**HIP content notes.** Source facts from HDB's HIP information booklet
(`hdb.gov.sg/-/media/managing-my-home/upgrading-and-redevelopment/home-improvement-programme-hip/HIP-Info-BookletJun-2025-InfoWEB-Jan-2026.pdf`)
and gov.sg's "5 Things You Should Know if Your Home Is Undergoing HIP". Key facts used: adult household
member required in flat during works (8am-6pm Mon-Sat excl. public holidays, up to 10 working days);
1-year DLP, contractor makes good damage; water test = floor flooded min 10 mm for 4 h, fail → must take
toilet upgrade or sign 6-year ceiling-leak undertaking; 6-week e-opting window; works ~4 months after poll,
~18 months per precinct; 75% of eligible SC households must vote yes (gov.sg; results per block in the
Government Gazette, from a search summary, unverified). **Don't quote 2026 co-payment dollar figures**
(secondary sources disagree); the 5-12.5% range is in the live articles. Owner has noted many households
can't be home all day (the HDB rule says otherwise; articles quote the rule and give a plan, no HDB
workaround claimed). Owner said don't redirect readers to the Information Centre except where HDB's
booklet itself names it (defects reporting).

**HIP topic backlog (researched 2026-11-10, not written):** selling/renting around HIP; HIP 2026 schedule
by town (18,000 flats, 198 blocks, 12 towns announced May 2026; time-sensitive, needs "check HDB" note);
cooking/aircon/kitchen during HIP; cleaning and renovating after HIP. GA4 shows visitors land mostly on
resource pages; only organic landing is hip-timeline-week-by-week; GSC queries "hip contact number",
"hdb hip schedule".

**Facts for owner to review (older queue):** crate vs pallet wording, climate-controlled mention, fragile-
packing extras "communicated in advance", prohibited-items list (storing-belongings-overseas-posting:
confirm real terms). No legal/tenancy advice in rental articles.

## 7. Analytics and SEO

- **GA4 property 561860842.** GA MCP server (work PC only): project `.mcp.json` runs Google's read-only
  `analytics-mcp` (pipx, `~/.local/bin`); credentials = service-account key for
  `website-dashboard@striking-domain-513504-p4` at `%USERPROFILE%/.config/ecostorage/ga-service-account.json`
  (outside repo, never commit). Verified 2026-11-10 (28d: 11 sessions). Home PC needs `pip install --user
  pipx`, `pipx install analytics-mcp`, key file copied to the same path. Delete the original key copy in
  C:/Google Chrome Downloads once happy.
- **Search Console baseline (28d to 3 Nov):** 13 clicks, 1.34K impressions, avg position 24.7; 28 pages
  indexed, 7 not. Top zero-click query groups: "aircon/air conditioned storage" (~330 impr, pos 20-30 →
  ambient-storage-vs-air-conditioned) and "long term storage (singapore) / budget" (~170 impr, pos 30-58 →
  long-term-storage-singapore-guide). Best page: hip-timeline-week-by-week. "Page with redirect" =
  `http://ecostorage.sg/` (fine). Not indexed: how-much-storage-space-do-you-need (+zh), how-to-pack-
  fragile-valuable-items, long-term-storage-singapore-guide-zh, storage-for-home-renovations-singapore, /services.
  "Request indexing" sent 2026-11-06 for four of those plus the two rewritten articles; check Pages report ~mid Nov.
- **Site changes (2026-11-06/10):** sitemap now `revalidate = 3600` (`src/app/sitemap.ts`), lists new
  articles; `/llms.txt` is a live route (`src/app/llms.txt/route.ts`, edit facts in `src/lib/llms-base.ts`);
  IndexNow wired (`src/lib/indexnow.ts`, key file in `public/`); robots.txt unchanged (AI crawlers allowed);
  keyword H1s and shorter page titles/metas (titles in code, hero headings in DB sections + fallback-content.ts);
  `ambient-storage-vs-air-conditioned` and `long-term-storage-singapore-guide` rewritten; inline links added.
- Bing Webmaster Tools done (imported from GSC). Owner to validate schema once (Rich Results Test) on the
  two rewritten articles.
- **LLM visibility:** owner declined reminders. When the owner next asks about SEO/LLM visibility (expected
  early 2027), run WebSearch + live-site checks ("aircon storage Singapore", "long term storage
  Singapore", "HIP storage" on ChatGPT/Perplexity/Gemini; is ecostorage.sg cited) and compare to the
  baseline above. Don't scrape Google results.
- **Next SEO ideas:** recheck the two rewritten pages in GSC ~early Dec 2026; expand zh articles (bodies
  ~800-1000 chars vs 2-7K EN, likely why zh isn't indexed); "document / archive storage Singapore" article
  (queries at pos 67-90, corporate page); rankings ledger from GSC Queries (dated CSV snapshots).

### 7a. Analytics follow-ups (tracking setup itself: see section 0)

- Snapshots live in `docs/analytics-ledger.md` (13 Nov baseline: 9 users, 14 sessions; 16 Nov: 11 users,
  18 sessions, 38 views, 44% engagement, 3 test leads, no real leads yet; AI Assistant ~2s). Add a row each session.
- **GA MCP server** works on the work PC (failed to connect on home PC 16 Nov; set up there if needed) (verified 16 Nov: `run_report`, `run_realtime_report`,
  `list_key_events`). Needs pipx `analytics-mcp` and the service-account key at the stated path.
- **Compound what works:** more HIP-timeline-style articles; push Organic Search via the GSC zero-click
  targets above; find out why AI Assistant visits last ~2s (check `llms.txt` and cited URLs).
- **UTM tags** on every owner-shared link (exact links at the bottom of `TODO.txt`); rebuild name card
  and flyer QR codes with UTM before the next print run.
- Optional code tweak offered, not done: load GA only on the `ecostorage.sg` host so dashboard visits to
  `*.vercel.app` URLs don't count.

## 8. Marketing plan (planning only; budget very tight, no paid ads)

Order: (1) Zoho signatures DONE; (2) Google Business Profile + review link DONE, QR on collateral open;
(3) ~10 Singapore directory listings with identical name/address/phone; (4) owner pastes 1-star/5-star
reviews of 5-8 competitors by hand, Claude clusters themes; (5) partner one-pager PDF (link + QR, no
commission rates); (6) Meta: connect Instagram, pixel, no spend; (7) later ads. Upkeep: reply to reviews
+ one photo weekly, article queue automated, GA4 monthly, partner review monthly, directories yearly.
Open: Meta vs Google Ads first; whether to pilot the competitor-overlap scraper.

**Competitor-overlap pilot (research only, undecided):** from TikTok @angusthenontechnical: scrape
competitor Google Maps reviewers, find non-competitor businesses sharing reviewers, approach as partners,
mine review text for ops/ad angles. Pilot 5-8 facilities, ~1-2K reviews, tens of dollars. Risks: scraping
breaks Google's terms; reviewer data is personal (PDPA: hash IDs, aggregates only, never contact
reviewers, B2B only); keep data and `.env*` out of git; keep away from the Google account that owns the
Business Profile. **Cheaper route preferred: hand-pasted reviews.** Working style: consultant-like;
`npx`/`npm` running third-party code needs explicit "go ahead" with commands listed first; create files with
Write/Edit, not PowerShell `Set-Content`.

## 9. Collateral (`Design/`, git-ignored, work PC only)

Rebuild: `npm i --no-save playwright qrcode opentype.js`, `npx playwright install chromium`, then
`node Design/_build/build.js [shirt|card|flyer|signature]`. Done: shirt, name card (Aljunied), brochure and
renovation flyers (reprinted), 3 email signatures (in Zoho). Other PC: rebuild or copy the folder.

## 10. Meta Business Suite and WhatsApp (in progress; Claude is view-only, owner changes everything)

- Use the **`ecostorage.sg` portfolio (1411102151224785)**: Page `Ecostorage.sg` (1450478074807041),
  Instagram `@ecostorage.sg` (1447787901731713), ad account `EcoStorage` (2185287639079477, SGD), WhatsApp
  account. Legal name STORAGE VAULT PTE. LTD. Leftover empty portfolios: Storage Vault Pte Ltd
  (1444007637856782, deletable, irreversible, do last), Easy Store and Lucky FortuneCat SG (leave alone).
- WhatsApp +65 8899 7017 connected via Cloud API (250 customers/24h). Unknown whether the iPhone WhatsApp
  Business app can coexist; owner to test, else replies via Business Suite Inbox or Novac Flow.
- Instagram not yet connected to the ad account (Settings → Accounts → Instagram accounts → @ecostorage.sg
  → Connect assets → Other business assets → tick EcoStorage → Add). Portfolios unverified (have ACRA
  BizFile ready for WhatsApp scale).
- To do: Primary Page; require 2FA; backup admin; domain verification TXT `facebook-domain-verification=`
  (keep SPF); ad payment method; connect Novac Flow (tokens only in Novac/Vercel settings); WhatsApp
  opt-in wording for PDPA. Chat history: no bulk export; unencrypted local iPhone backup + `wtsexporter`;
  mask personal data before any AI use.
