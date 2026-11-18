-- The dashboard's server-side client uses the service role. It bypasses RLS but
-- still needs schema and table privileges on the new `social` schema.
-- anon and authenticated stay with nothing.

grant usage on schema social to service_role;
grant select on social.inquiries_attribution to service_role;
grant select, insert, update, delete on social.snapshots_daily, social.post_stats_daily, social.manual_entries to service_role;
grant usage, select on all sequences in schema social to service_role;
