-- Let admins manage any member's profile photo.
--
-- Run once in Supabase → SQL Editor. Safe to re-run: the function is
-- `create or replace`, and every policy is dropped by name first. All four
-- policy names below are introduced by this file, so nothing you already have
-- is touched.
--
-- Why this is needed: avatar objects are foldered by auth user id
-- (`avatars/<user_id>/<timestamp>.jpg`). The existing policies let a member
-- write their own folder, which is correct — but it also means an admin
-- uploading on someone else's behalf is writing a folder that is not theirs,
-- and the upload is rejected until the policies below exist.
--
-- RLS policies are OR'd together, so these only ever ADD permission for
-- admins. Members keep exactly the access they have today.

-- ---------------------------------------------------------------------------
-- Admin check
-- ---------------------------------------------------------------------------
-- This MUST be `security definer`. A policy on `profiles` that itself selects
-- from `profiles` re-triggers RLS on the inner query and Postgres fails with
-- "infinite recursion detected in policy for relation profiles". Running the
-- lookup as the function owner bypasses RLS for that one read and breaks the
-- cycle. `search_path` is pinned so the function cannot be redirected at
-- another schema's `profiles`.

create or replace function public.is_kso_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and is_admin = true
  );
$$;

revoke all on function public.is_kso_admin() from public;
-- `anon` needs this too: the profiles guard trigger calls it, and signup
-- inserts the profile row before a session exists. For anon it is always
-- false, so nothing is disclosed.
grant execute on function public.is_kso_admin() to authenticated, anon;

-- ---------------------------------------------------------------------------
-- storage.objects — the avatar files themselves
-- ---------------------------------------------------------------------------

drop policy if exists "avatars_admin_insert" on storage.objects;
drop policy if exists "avatars_admin_update" on storage.objects;
drop policy if exists "avatars_admin_delete" on storage.objects;

create policy "avatars_admin_insert"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'avatars' and public.is_kso_admin());

create policy "avatars_admin_update"
on storage.objects
for update
to authenticated
using (bucket_id = 'avatars' and public.is_kso_admin())
with check (bucket_id = 'avatars' and public.is_kso_admin());

create policy "avatars_admin_delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'avatars' and public.is_kso_admin());

-- ---------------------------------------------------------------------------
-- profiles — pointing another member's row at the new photo
-- ---------------------------------------------------------------------------
-- The admin panel already updates other members' rows (admin flag, member
-- type), so a policy permitting this very likely exists. This is included so
-- the feature works on a project where it does not; it is additive, and
-- harmless if `profiles` already allows it.

drop policy if exists "profiles_admin_update" on profiles;

create policy "profiles_admin_update"
on profiles
for update
to authenticated
using (public.is_kso_admin())
with check (public.is_kso_admin());

-- ---------------------------------------------------------------------------
-- Verify
-- ---------------------------------------------------------------------------
-- select public.is_kso_admin();  -- true when run as an admin member
--
-- select policyname, cmd from pg_policies
-- where (schemaname = 'storage' and tablename = 'objects' and policyname like 'avatars_admin%')
--    or (tablename = 'profiles' and policyname = 'profiles_admin_update')
-- order by policyname;
