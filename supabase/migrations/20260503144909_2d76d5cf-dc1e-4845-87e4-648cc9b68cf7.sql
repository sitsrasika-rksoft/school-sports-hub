
alter function public.set_updated_at() set search_path = public;

revoke execute on function public.is_sport_member(uuid, uuid) from anon;
revoke execute on function public.is_sport_lead(uuid, uuid) from anon;
revoke execute on function public.has_role(uuid, app_role) from anon;
revoke execute on function public.get_user_role(uuid) from anon;
revoke execute on function public.handle_new_user() from anon, authenticated;
revoke execute on function public.set_updated_at() from anon, authenticated;

drop policy if exists "Sport covers public read" on storage.objects;
create policy "Sport covers authenticated list" on storage.objects for select to authenticated using (bucket_id='sport-covers');
