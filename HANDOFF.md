# EcoStorage website — Handoff (single merged copy)

Tracked in git so both PCs share it. Read it first, once per session; update only when the owner asks.
Public repo: no secrets, keys, scraped reviews or reviewer data in any doc. Last full rewrite
2026-11-10 (older session logs compressed; git history has the originals).

## 0. Where we are (end of session 2026-11-10)

- **Article queue:** all drafts auto-publish by `published_at` (5pm SG = 08:50 UTC). HIP articles go
  out **daily 12-20 Nov**, then non-HIP **every 2 days 22 Nov to 20 Dec**. See section 6.
- **New standard (owner):** every article ends with `## Frequently asked questions` then `## Summary`.
  Done on `what-is-hdb-hip-guide`, all 9 HIP drafts and 3 non-HIP drafts. Still to do: section 6.
- **Verify on 12 Nov (~18:00 SG):** `/resources/hip-announced-what-happens-next` returns 200 with FAQ + Summary.
- **Owner to-do now:** (a) tell Claude which of the "accounts and settings" in section 5 are already
  done so they can be ticked off; (b) add thumbnails to the 4 newest HIP articles in `/admin`;
  (c) **rotate secrets**: on 2026-11-10 a Claude check printed the Turnstile secret, Resend API key and
  `CRON_SECRET` values into chat. Rotate all three (update Vercel after rotating `CRON_SECRET`, or the
  publish cron returns 401).
- **Done and closed 2026-11-10:** GA MCP verified, sitemap fixed, Google Business Profile + review link
  live, Zoho signatures, renovation flyer reprint, Mandarin article review, FAQ/Summary standard.

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
Code `src/lib/email.ts`. Until then enquiries appear only in `/admin` → Inquiries.

**Accounts and settings (owner to confirm which are done):**
1. Supabase Auth → "Allow new users to sign up" off.
2. Vercel: `ADMIN_ALLOWED_EMAILS` holds only admin email(s).
3. Admin 2FA enrolled (`/admin` → Security).
4. Sentry: DSN saved; confirm a test error arrives.
5. UptimeRobot monitor on `/api/health`, alerts to hello@.
6. GitHub Actions secrets for the daily DB backup: `SUPABASE_PROJECT_REF` (`dqmuuszmuyixjxonwjpv`),
   `SUPABASE_DB_PASSWORD` (owner enters it, never chat).
7. GA4: event data retention 14 months; check `/admin/analytics` fills daily.
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
- HIP daily: 12 hip-announced-what-happens-next, 13 hip-cost-what-hdb-residents-pay, 14
  hip-optional-improvements-which-to-choose, 15 hip-with-seniors-children-pets, 16 hip-move-out-or-stay-home,
  17 hip-when-nobody-is-home-all-day, 18 hip-defects-damaged-belongings, 19 hip-toilet-water-test-opt-out,
  20 Nov hip-voting-75-percent-how-it-works.
- Non-HIP every 2 days: 22 Nov renovation-delay-what-to-do-with-belongings, 24 bto-key-collection-to-move-in-
  storage, 26 moving-out-of-rental-deposit-checklist, 28 student-belongings-storage-long-break, 30
  storage-contract-questions-before-you-sign, 2 Dec pallet-storage-vs-crate-storage, 4
  prevent-mould-damp-stored-items-singapore, 6 prepare-appliances-for-storage, 8
  valet-storage-vs-self-storage-singapore, 10 downsizing-home-keep-store-sell, 12
  storing-belongings-overseas-posting, 14 packing-boxes-weight-labelling, 16
  small-business-ecommerce-inventory-storage, 18 what-to-expect-on-moving-day, 20 Dec
  corporate-storage-singapore-businesses.
- Already published (EN): bed-wardrobe-mattress-during-hip, protect-electronics-during-hip,
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
- The 4 newest HIP articles (when-nobody-is-home, defects, water-test, voting) have no thumbnail.

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
