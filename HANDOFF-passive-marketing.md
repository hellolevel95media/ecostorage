# EcoStorage: Passive Marketing Plan (Handoff)

Written 2026-11-02. **Planning only; nothing built or changed yet.** Separate from `HANDOFF.md` (website repo; do not edit it unless asked) and `HANDOFF-competitor-overlap.md` (the review/partner pilot research; read it too).

Paths: work PC `C:\ecostorage`, home PC `D:\ecostorage`. Pull at session start, commit + push at the end. Commit as hellolevel95media (`hello@level95media.com`); run `gh auth status` first. This repo is public: never commit `.env*`, keys, scraped reviews or reviewer data. Never commit `CLAUDE.local.md` or `v.tmp.mjs`.

## Goal
Marketing the owner sets up once and maintains periodically. **Budget is very tight: build assets first, no paid ads yet.**

## Decisions made (2026-11-02)
1. **Address: 621 Aljunied Road, #03-06, Lipo Building, Singapore 389834** everywhere. Still says Ang Mo Kio Ave 5 in: `src/lib/nav.ts` (COMPANY.address), `public/llms.txt`, `PRODUCT.md`, email signatures (Zoho).
2. **Google Maps scraping:** not decided to proceed. Advice given: a throwaway Google account adds nothing (scrapers don't log in; second-account automation is itself a terms issue). Keep the pilot away from the Google account that will own the Business Profile. Real risk is PDPA (reviewer names/IDs): hash IDs, drop names, aggregates only, confirm with a PDPA adviser. **Cheap route preferred:** owner pastes 1-star and 5-star reviews of 5-8 competitors by hand, Claude clusters themes. Reviewer graph only later if worthwhile.
3. **Ads:** create assets first, run no ads yet. Meta setup (connect Instagram, pixel) is free and can be done now so retargeting data accumulates.

## Blockers
- Address switch (above).
- `COMPANY.googleReviewUrl` in `src/lib/nav.ts` is still `#`; EcoStorage has no Google reviews. Claim Google Business Profile first.
- 8 Mandarin articles are machine translated; need native review before promotion.

## Channels (set once, maintain on a cadence)
| Channel | One-time setup | Upkeep |
|---|---|---|
| Google Business Profile + reviews | Claim, photos, services, Aljunied address, real review link, QR code on cards/flyers, post-job WhatsApp review request (ideally via Novac) | Reply to reviews, one photo weekly |
| SEO content | Site already has 34 URLs, sitemap, llms.txt. Topics from competitor review themes (hidden fees, access, damp, damage) | One article monthly; refresh top pages from Search Console |
| Directory listings | ~10 Singapore storage/moving/renovation directories, identical name/address/phone | Yearly check |
| Partner/referral (Novac) | `?ref=` links, promo codes, `/partner` form already built (dormant until Novac live). Partner one-pager PDF with link + QR | Monthly review/payout. Commission rates never on the site |
| Overlap-pilot partners | Pick categories (renovators, property agents, condo managers, interior designers); one-to-one outreach, owner approves and sends. No mention of shared reviewers | Quarterly |
| Meta (later, paid) | Connect Instagram to ad account (Settings, Accounts, Instagram accounts, @ecostorage.sg, Connect assets, tick EcoStorage), pixel, domain verification | Fortnightly once ads run |
| Analytics | GA4 dashboard in `/admin` exists | Monthly read |

## Suggested order
1. Address switch across repo + Zoho signatures (one commit).
2. Claim Google Business Profile; put real link in `nav.ts`; QR code on collateral.
3. Directory listings.
4. Owner pastes competitor reviews; Claude produces theme report (ops checklist + article/ad angles).
5. Partner one-pager PDF.
6. Meta: connect Instagram, install pixel (no spend).
7. Later: first ads, optional scraper pilot.

## Open
- Meta vs Google Ads for the eventual first ad test (deferred with budget).
- Whether to proceed with the scraper pilot at all (deferred).
- Turn this into a tracked checklist (doc or `/admin` page)? Offered, not answered.

## Working style
Consultant-style: explain how/why, confirm needs first. Create files with Write/Edit, not PowerShell `Set-Content`. `npx`/`npm` running third-party code needs explicit "go ahead" (list commands first). Next step offered: start the address change.
