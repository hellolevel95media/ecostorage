-- In-dashboard feedback and error log for the social dashboard (social team request, 2026-11-18).
-- user_email holds the dashboard admin's own login email only (no customer data).
-- Service role only; anon/authenticated get nothing, same as the other social tables.

create table if not exists social.feedback (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  kind text not null check (kind in ('bug','feature','other')),
  message text not null check (char_length(message) between 1 and 4000),
  page text,
  user_email text,
  status text not null default 'new' check (status in ('new','in_progress','done','wont_do')),
  resolution text,
  resolved_at timestamptz
);

create table if not exists social.error_log (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  source text not null,          -- 'collector:instagram', 'dashboard:server', 'dashboard:client', ...
  level text not null default 'error' check (level in ('error','warning')),
  message text not null,
  detail jsonb,
  resolved boolean not null default false
);

create index if not exists error_log_created_at_idx on social.error_log (created_at desc);

alter table social.feedback enable row level security;
alter table social.error_log enable row level security;

revoke all on social.feedback, social.error_log from public, anon, authenticated;
grant select, insert, update on social.feedback, social.error_log to service_role;
grant usage, select on all sequences in schema social to service_role;
