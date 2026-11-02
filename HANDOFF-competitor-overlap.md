# EcoStorage: Competitor-Overlap Partnership Pilot (Handoff)

Written 2026-11-02 for a new Claude session. **Nothing has been built yet**; this is research and plan only. It is separate from `HANDOFF.md` (the website repo handoff). Do not edit that one for this work.

## Who and what
- User runs **EcoStorage**, a Singapore valet storage and moving business (per `HANDOFF.md`, which describes the public marketing website in this repo). Email on the account: hello@level95media.com.
- EcoStorage has **no Google reviews of its own**, so competitors' reviews are the seed data.
- Goals (user's words, condensed):
  1. **Partnerships** with businesses that already share customers with competitors.
  2. **Structured ads** whose core strategy is "borrowing" an existing user base.
  3. **Better information on why people leave good and bad reviews for competitors**, to improve EcoStorage's own operations.
- User wants a **full pipeline, but small scale, as a test first**.
- Brand assets (logo, colours) exist. The user wanted to see the plan first; ask for them when flyers or ads are needed. (Check `DESIGN.md`, `PRODUCT.md` and `public/` in this repo first.)

## Source inspiration
TikTok by @angusthenontechnical: https://vt.tiktok.com/ZSgEbCfUU/
(resolves to https://www.tiktok.com/@angusthenontechnical/video/7700696906397207821)
Title: "How to borrow a $1B fan base" / "AI-Generated Crumbl Cookies: The 'Never Been to Crumbl' Meme". 52s, #ai #buildwithai #vibecoding.

Watched with playwright-cli by stepping through frames. **Audio was not captured**, so this summary comes from on-screen captions and visuals and may miss details.

What the video shows:
1. Hook and credibility: Crumbl growth chart (15 to 968 franchise locations, 2018 to 2023) and a paid-partnership influencer clip.
2. Method: pull ~200 Crumbl Google Maps reviewers, use an **Apify Google Maps Reviews scraper** to export reviewer IDs, pull those reviewers' other reviews, then count which other businesses share the most reviewers. Output is a table tagged Competitor / Non-competitor (for example a book shop sharing 24 of 200 reviewers).
3. Pitch: an AI-drafted outreach email to the top non-competitor proposing a joint event (books-and-cookies reading night), plus an AI-designed flyer.
4. Counterpoint: a "cookie empire is starting to crumble" article, then a follow CTA.

## Pilot plan
**Scope:** one area, 5 to 8 competitor storage facilities, ~1,000 to 2,000 reviews total. About a week to build and run. Tens of dollars of API and scraper cost. Local scripts writing to a database, not a product.

| Stage | What happens | Tooling |
|---|---|---|
| 1. Seed | List competitor storage and moving companies; pull all public reviews (text, rating, date, reviewer ID) | Apify Google Maps Reviews scraper; store in Supabase |
| 2. Reviewer graph | For reviewers with usable IDs, pull their other public reviews | Same scraper, reviewer mode |
| 3. Overlap ranking | Count non-storage businesses by shared reviewers; tag competitor vs non-competitor; rank non-competitors | SQL plus Claude classification |
| 4. Review mining | Cluster competitor review text into positive and negative themes (access, security, pricing surprises, damp, staff, move-in friction, damage, punctuality); frequency counts and example quotes | Claude over review text |
| 5. Partner outreach | One-to-one drafts for the top 10 to 15 partners with a specific offer; **user approves and sends** | Claude |
| 6. Structured ads | Turn top themes and partner audiences into ad angles, one ad set per angle | Claude for copy and creative; Meta and/or Google Ads |
| 7. Tracking | Log every partner contact and ad result in one table | Supabase table, dashboard later |

**Likely partner categories** (assumption; the data decides): movers and renovators, property agents and property managers, condo and serviced-apartment managers, interior designers, e-commerce sellers, student housing, expat relocation services.

**Ad angles to test:**
- Audience borrowing: target interests and locations matching partners' customers.
- Competitor pain-point messaging: for example, if "surprise fees" is the top complaint, run "No hidden fees, ever" against a "24/7 access" angle.
- Partner co-promotion: co-branded offer through the partner's channel.

**Operations deliverable:** a short report of why people love or leave competitors, ranked by frequency, then turned into a checklist for EcoStorage's own operation.

**Pilot success criteria:**
1. The overlap list has at least 5 plausible non-competitor partners.
2. Review themes are specific enough to change something in operations.
3. At least 3 partner conversations and one ad test with measurable results.

## Risks and rules
- **Scraping Google Maps breaks Google's terms of service.** Mostly a commercial risk (scraper gets blocked); the user decides. Fallback: review-text-only pipeline (no reviewer graph), which loses partner discovery. The Places API alone returns too few reviews per place for overlap analysis.
- **Reviewer privacy.** Names and IDs are personal data (Singapore PDPA likely applies; confirm). Hash IDs, discard names, store only aggregate counts, never contact an individual reviewer. Partnerships are business-to-business only.
- Outreach emails must **not** say "we noticed shared reviewers"; refer to general local audience fit.
- **Small samples:** if most reviewers have a single review, the overlap ranking will be noisy. The pilot tests this cheaply; review mining still works regardless.
- **This repo is public and the user has several GitHub accounts.** Never commit `.env*` files, API keys, scraped reviews, or reviewer data. Keep pilot data and scripts out of tracked paths (or gitignored) unless the user says otherwise. Before any commit or push, run `gh auth status` and confirm the account and author identity with the user. In Bash, `gh` is at `"/c/Program Files/GitHub CLI/gh.exe"`; in PowerShell plain `gh` works.
- The user is on two PCs (`C:\` work, `D:\` home). Use the right paths for the PC you are on.

## Open questions (the user has not answered these)
1. **Area:** Singapore-wide, or specific districts? (The user was asked for city and suburbs and has not replied; Singapore is inferred from the repo.)
2. **Competitors:** discover automatically from the map, or does the user have a list?
3. **Scraping:** comfortable with the Google Maps scraper, or text-only?
4. **Apify:** does the user have an account, or use a free-tier trial?
5. **Ad platform:** Meta, Google, or both for the first test?

## How to work with this user
- Act like a **consultant serving a client**: ask about needs and success criteria before generating, explain how and why each output was produced, and do not deliver a finished product wholesale.
- Create and edit markdown and JS files with the Write and Edit tools, not PowerShell `Set-Content`/`Out-File` (UTF-8 BOM problem).
- `npx`/`npm` commands that run third-party code need the user's explicit "go ahead": list the exact commands first, then run them in one batch.
- Supabase, Vercel, Canva and Context7 connectors are available. The website repo has its own `supabase/` folder; check whether the pilot should use a separate Supabase project so scraped data never mixes with the live site's database.

## Suggested first steps
1. Get answers to the open questions above.
2. Propose the Supabase schema (competitors, reviews, hashed reviewers, reviewer_reviews, businesses, overlap_scores, themes, outreach_log, ad_tests) and get approval before applying any migration.
3. List the exact commands and tools needed (Apify actor, scripts) and wait for "go ahead".
4. Run stage 1 on one competitor first as a smoke test before scaling to all 5 to 8.
