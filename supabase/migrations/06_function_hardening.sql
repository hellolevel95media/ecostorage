-- handle_new_user is a trigger function; nothing should call it over the API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
-- Pin search_path so the function can't be hijacked by objects in other schemas.
alter function public.set_updated_at() set search_path = public;
-- is_admin() deliberately stays executable by anon/authenticated: RLS policies
-- call it as the requesting role, so revoking it would break public reads.
