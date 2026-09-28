-- ---------------------------------------------------------------------------
-- sections.stats: optional structured stat data (e.g. the homepage trust
-- banner's 4 count-up metrics), editable from /admin without a code change.
-- ---------------------------------------------------------------------------
alter table public.sections
  add column if not exists stats jsonb;
