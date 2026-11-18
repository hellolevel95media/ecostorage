-- Social stats schema + read-only enquiry attribution view (social team request, 2026-11-18).
-- No personal data is exposed: the view has no name, email, phone or message.
-- The dashboard writes the three tables with the service role, server-side only.
-- NOTE: to query `social` through the Supabase API, add it under
-- Settings > API > Exposed schemas (a dashboard setting, not SQL).

create schema if not exists social;

do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'social_reader') then
    create role social_reader nologin;  -- no password here; never put one in git
  end if;
end $$;

-- Nothing in the schema is reachable by the public API roles.
revoke all on schema social from public, anon, authenticated;
grant usage on schema social to social_reader;

create table if not exists social.snapshots_daily (
  day date not null,
  platform text not null check (platform in ('instagram','facebook','tiktok','rednote','website')),
  followers int, reach int, views int, profile_visits int, link_clicks int,
  likes int, comments int, saves int, shares int,
  source text not null default 'api',   -- 'api' | 'manual' | 'public'
  fetched_at timestamptz not null default now(),
  primary key (day, platform)
);

create table if not exists social.post_stats_daily (
  day date not null,
  platform text not null,
  post_ref text not null,       -- platform media id
  post_id text,                 -- socmark post id, e.g. 2026-11-24_fragile-tip
  permalink text, format text,  -- reel | carousel | static | video
  published_at timestamptz,
  views int, reach int, likes int, comments int, saves int, shares int, avg_watch_s numeric,
  primary key (day, platform, post_ref)
);

create table if not exists social.manual_entries (   -- RedNote and anything without an API
  id bigserial primary key, day date not null, platform text not null,
  metric text not null, value numeric not null, note text,
  entered_at timestamptz not null default now()
);

-- RLS on, no policies: only the service role (bypasses RLS) and table owners
-- can touch rows. social_reader gets an explicit read policy.
alter table social.snapshots_daily enable row level security;
alter table social.post_stats_daily enable row level security;
alter table social.manual_entries enable row level security;

create policy "social_reader select" on social.snapshots_daily for select to social_reader using (true);
create policy "social_reader select" on social.post_stats_daily for select to social_reader using (true);
create policy "social_reader select" on social.manual_entries for select to social_reader using (true);

revoke all on all tables in schema social from public, anon, authenticated;
grant select on social.snapshots_daily, social.post_stats_daily, social.manual_entries to social_reader;

-- Attribution view. Owner-run (default), so it can read public.inquiries even
-- though that table's RLS blocks everyone else. Contains no personal data.
create or replace view social.inquiries_attribution as
select
  id,
  created_at,
  type as form_type,
  coalesce(metadata ->> 'source', type) as source,
  metadata -> 'affiliate' ->> 'promoCode' as promo_code,
  utm_source, utm_medium, utm_campaign, utm_content, landing_path, referrer_host
from public.inquiries;

revoke all on social.inquiries_attribution from public, anon, authenticated;
grant select on social.inquiries_attribution to social_reader;
