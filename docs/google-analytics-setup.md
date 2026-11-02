# Google Analytics setup (website traffic dashboard)

The admin page **/admin/analytics** shows visitors, time on site, search
engines, traffic sources and top pages from Google Analytics 4 (GA4). It needs
two things: a GA4 property collecting data, and a "robot" Google account
(service account) the dashboard uses to read it. About 20 minutes, once.

Nothing is collected until a visitor clicks **Accept** on the cookie banner.

## 1. Create the GA4 property

1. Go to analytics.google.com and sign in with the EcoStorage Google account.
2. Admin (gear, bottom left) > Create > Property.
   - Property name: `EcoStorage website`
   - Reporting time zone: **Singapore**. Currency: **SGD**.
3. Business details: pick anything sensible, then create.
4. Choose platform **Web**. Website URL `https://ecostorage.sg`, stream name
   `ecostorage.sg`. Leave **Enhanced measurement** on. Create stream.
5. Copy the **Measurement ID** (looks like `G-AB12CD34EF`). This is value A.
6. Admin > Property settings > Property details: copy the **Property ID**
   (only digits, e.g. `412345678`). This is value B.
7. Recommended: Admin > Data collection and modification > Data retention >
   set **Event data retention** to 14 months (default is only 2).

## 2. Create the service account (lets the dashboard read GA)

1. Go to console.cloud.google.com, same Google account. Create a project
   called `ecostorage-analytics` (top bar > project picker > New project).
2. Search for **Google Analytics Data API** > Enable.
3. Menu > IAM & Admin > Service Accounts > Create service account.
   Name `website-dashboard`. Skip the optional role steps. Done.
4. Copy its email (ends in `.iam.gserviceaccount.com`). This is value C.
5. Click it > Keys > Add key > Create new key > **JSON**. A file downloads.
   Keep it private (don't email it or put it in chat). Inside it, the
   `private_key` value (starts `-----BEGIN PRIVATE KEY-----`) is value D.
6. Back in Google Analytics: Admin > Property access management > **+** >
   Add users > paste value C, role **Viewer**, untick "notify". Add.

## 3. Add the four values in Vercel

Vercel > project **ecostorage** > Settings > Environment Variables. Add each
for **Production** (and Preview if you like):

| Name | Value |
|---|---|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | A, e.g. `G-AB12CD34EF` |
| `GA4_PROPERTY_ID` | B, digits only |
| `GA4_CLIENT_EMAIL` | C |
| `GA4_PRIVATE_KEY` | D, paste the whole key including the BEGIN/END lines |

Then Deployments > latest > **Redeploy** (the Measurement ID only takes
effect on a new build). For local testing, the same four go in `.env.local`.

## 4. Check it works

1. Open ecostorage.sg in a private window, click Accept, browse 2 pages.
2. In GA: Reports > Realtime should show 1 visitor within a minute.
3. /admin/analytics shows numbers. GA's standard reports can lag up to
   24 to 48 hours, so a fresh setup looks empty for the first day.

## What the numbers mean

- **Visitors**: different people (devices) in the period. **Visits**: separate
  sessions; one person can visit several times.
- **Avg time per visit**: time the page was actually open and in front of the
  visitor (Google's "engagement time"), so a tab left in the background
  doesn't count.
- **Engaged visits**: visits that lasted 10s+, viewed 2+ pages, or sent an
  enquiry. The rest is roughly the "bounce rate".
- **Search engines**: visits from normal (unpaid) search results, by engine.
  Paid Google Ads clicks show under "Paid Search" in "How visitors found the
  site". Search keywords are not in GA4; for those, connect Google Search
  Console (search.google.com/search-console) to the site separately.
- Only visitors who accept cookies are counted, so the true totals are higher.
  The "Built-in page counter" at the bottom is the site's own counter, also
  consent-only, for cross-checking.
