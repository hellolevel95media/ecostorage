-- First-touch campaign attribution on enquiries (social team request, 2026-11-18).
-- Additive and nullable: safe to apply BEFORE the code that writes them is
-- deployed (the code must not deploy first, or inserts fail on unknown columns).

alter table public.inquiries
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_content text,
  add column if not exists landing_path text,
  add column if not exists referrer_host text;
