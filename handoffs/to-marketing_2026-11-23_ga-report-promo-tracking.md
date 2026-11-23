# To marketing: GA4 week report and promo tracking fix (2026-11-23)

From: website (ecostorage). Approved by Jonny in this session.

## GA4, 17-23 Nov (vs 10-16 Nov)
- 19 users (+90%), 18 new, 25 sessions (+47%), 41 views, 68% engaged, avg visit 3m38s.
- **Google organic: 12 sessions, 83% engaged, and 11 of them landed on a HIP article.** Top entries:
  bed-wardrobe-mattress-during-hip, diy-plastic-covering-hip, staying-home-during-hip-one-livable-room (2 each).
- Direct: 13 sessions (some of it is us).
- **Social, paid, referral: 0 sessions.** Nothing from IG/TikTok or UTM-tagged links yet.
- Mostly Singapore, mostly mobile (12 of 19 users).
- Leads: none real this week (one 17 Nov calculator lead was a test). Today one phone visitor tapped the
  HIP10 link in hip-when-nobody-is-home-all-day, got the code applied, then left without sending.

## Jonny's direction
**Grow traffic first**, so later site changes are based on enough data. HIP articles are the proven
channel; social is the open gap.

## What changed on the site today (live)
- Promo links inside articles now carry the article name (`/personal?promo=HIP10&src=<article-slug>#quote`),
  so GA and the database both record which article drove a promo code. Before, the article came through blank.
- Enquiries with a promo code now save the article in the database, so the credit survives visitors
  who decline cookies.
- `promo_applied` in GA now says whether the code came from a link or was typed in.
- `social.inquiries_attribution` has a new last column, **`promo_article`** (alongside `promo_code` and the
  UTM columns). Older rows are empty.

## What would help from your side
- **Tag every social link with UTMs** (`utm_source`, `utm_medium=social`, `utm_campaign`), or social traffic
  shows as Direct and we can't credit it.
- Bio/post links pointing at a promo offer can use `/personal?promo=CODE&utm_source=...#quote`.
  Keep `src=` for article slugs only.
- Point social posts at the HIP articles that already rank (list above) to stack on what Google is sending.
