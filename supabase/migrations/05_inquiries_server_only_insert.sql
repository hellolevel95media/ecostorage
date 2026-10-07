-- Inquiries are now written only by the server (/api/inquiries and
-- /api/affiliate-applications, using the service role), after validation,
-- the Turnstile bot check and the quote being recomputed server-side.
-- Removing the public insert policy stops anyone writing straight into the
-- table with the public anon key.
--
-- ⚠ APPLY ONLY AFTER the new code is deployed to production. The old live
-- calculator inserts directly from the browser and needs this policy until
-- then.

drop policy if exists "Public insert inquiries" on public.inquiries;

-- Supports the affiliate relay retry job (/api/cron/affiliate-relay).
create index if not exists inquiries_affiliate_relay_idx
  on public.inquiries ((metadata -> 'affiliate' ->> 'relay'), created_at)
  where metadata ? 'affiliate';
