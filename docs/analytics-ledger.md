# Analytics ledger

One dated row per website session so trends stay visible. GA4 property 561860842, Search Console
property `sc-domain:ecostorage.sg`. Figures are rolling 28 days ending on the date shown unless
noted. Add a row at the start of each session; never edit older rows.

## GA4 (28d)

| Snapshot date | Users | Sessions | Views | Engagement rate | Avg engagement / session | Events | Key events | Channels (sessions) | Top pages (views) | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| 2026-11-13 | 9 | 14 | 19 | 35.7% | 22s | 60 | 0 | Direct 7, Organic Search 3, AI Assistant 3, Organic Social 1 | `/` 8, `/contact` 3, `/resources/hip-timeline-week-by-week` 2, `/corporate` 1, `/resources` 1, `/resources/decluttering-before-a-move` 1 | Baseline. No custom events existed yet. Organic Search has the best engagement (66.7%, 51s). AI Assistant visits last ~2s. |

## Search Console (28d)

| Snapshot date | Clicks | Impressions | Avg position | Indexed pages | Not indexed | Top zero-click query groups | Notes |
|---|---|---|---|---|---|---|---|
| 2026-11-03 | 13 | 1,340 | 24.7 | 28 | 7 | "aircon / air conditioned storage" ~330 impr pos 20-30; "long term storage singapore / budget" ~170 impr pos 30-58 | Baseline. Best page hip-timeline-week-by-week. Indexing requested 2026-11-06 for 6 URLs. |

## Leads (GA4 custom events, available from 2026-11-15 deploy)

| Snapshot date | generate_lead (contact) | generate_lead (calculator) | generate_lead (corporate) | whatsapp_click | phone_click | email_click | calculator_start | promo_applied | Notes |
|---|---|---|---|---|---|---|---|---|---|
| 2026-11-15 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | Events shipped this date. First real row next session. |

## How to fill a row

- GA4: Reports > Reports snapshot (users, sessions, views, engagement), Reports > Acquisition >
  Traffic acquisition (channels), Reports > Engagement > Pages and screens (top pages), Reports >
  Engagement > Events (custom event counts). Set the date picker to "Last 28 days".
- Search Console: Performance > Search results (clicks, impressions, position), Indexing > Pages
  (indexed / not indexed counts). Queries: sort by impressions, filter position > 10 for zero-click
  targets.
- When the GA MCP server is connected, Claude can pull the GA4 numbers directly.
