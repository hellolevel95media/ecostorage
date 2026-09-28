-- ---------------------------------------------------------------------------
-- page_views: lightweight traffic log powering the /admin analytics view.
-- Populated by a consent-gated client beacon via the /api/analytics route;
-- never stores IP addresses or any personal data, only path/referrer/UA.
-- ---------------------------------------------------------------------------
create table if not exists public.page_views (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  referrer text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists page_views_created_at_idx on public.page_views (created_at desc);

alter table public.page_views enable row level security;

create policy "Public insert page_views" on public.page_views
  for insert with check (true);

create policy "Admin read page_views" on public.page_views
  for select using (auth.role() = 'authenticated');
