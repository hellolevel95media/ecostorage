-- Storage Space v2.0 - Initial CMS schema
-- Public read access to all site content; write access restricted to
-- authenticated admin users (managed manually in Supabase Auth, no public
-- sign-up flow exists in this app).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- pages: one row per marketing page (home, personal, corporate, mission, ...)
-- ---------------------------------------------------------------------------
create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  meta_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- sections: ordered content blocks belonging to a page (hero banners,
-- commitment statements, trust banners, etc.)
-- ---------------------------------------------------------------------------
create table if not exists public.sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages (id) on delete cascade,
  section_key text not null,
  heading text,
  subheading text,
  body text,
  media_url text,
  cta_text text,
  cta_link text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (page_id, section_key)
);

-- ---------------------------------------------------------------------------
-- articles: SEO blog / resource library content
-- ---------------------------------------------------------------------------
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  category text,
  tags text[] not null default '{}',
  thumbnail_url text,
  excerpt text,
  body text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  author text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists articles_status_published_at_idx
  on public.articles (status, published_at desc);

-- ---------------------------------------------------------------------------
-- services: personal / corporate service cards
-- ---------------------------------------------------------------------------
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  category text not null check (category in ('personal', 'corporate')),
  description text,
  thumbnail_url text,
  video_url text,
  cta_text text,
  cta_link text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- media_assets: metadata for files uploaded to Supabase Storage
-- ---------------------------------------------------------------------------
create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  file_path text not null,
  file_type text not null,
  file_size integer,
  alt_text text,
  uploaded_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- inquiries: contact / personal / corporate form submissions
-- ---------------------------------------------------------------------------
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('contact', 'personal', 'corporate', 'partner')),
  name text not null,
  email text not null,
  phone text,
  company_name text,
  address text,
  message text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.pages;
create trigger set_updated_at before update on public.pages
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.sections;
create trigger set_updated_at before update on public.sections
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.articles;
create trigger set_updated_at before update on public.articles
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.services;
create trigger set_updated_at before update on public.services
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.pages enable row level security;
alter table public.sections enable row level security;
alter table public.articles enable row level security;
alter table public.services enable row level security;
alter table public.media_assets enable row level security;
alter table public.inquiries enable row level security;

-- Public read access to site content
create policy "Public read pages" on public.pages
  for select using (true);

create policy "Public read sections" on public.sections
  for select using (true);

create policy "Public read published articles" on public.articles
  for select using (status = 'published' or auth.role() = 'authenticated');

create policy "Public read services" on public.services
  for select using (true);

create policy "Public read media_assets" on public.media_assets
  for select using (true);

-- Admin (any authenticated user) write access to site content
create policy "Admin write pages" on public.pages
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Admin write sections" on public.sections
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Admin write articles" on public.articles
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Admin write services" on public.services
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Admin write media_assets" on public.media_assets
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Inquiries: anyone can submit a form, only admins can read/manage results
create policy "Public insert inquiries" on public.inquiries
  for insert with check (true);

create policy "Admin read inquiries" on public.inquiries
  for select using (auth.role() = 'authenticated');

create policy "Admin manage inquiries" on public.inquiries
  for update using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Admin delete inquiries" on public.inquiries
  for delete using (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- Storage bucket for media assets
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "Public read media bucket" on storage.objects
  for select using (bucket_id = 'media');

create policy "Admin write media bucket" on storage.objects
  for insert with check (bucket_id = 'media' and auth.role() = 'authenticated');

create policy "Admin update media bucket" on storage.objects
  for update using (bucket_id = 'media' and auth.role() = 'authenticated');

create policy "Admin delete media bucket" on storage.objects
  for delete using (bucket_id = 'media' and auth.role() = 'authenticated');
