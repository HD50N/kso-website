-- SECURITY FIX: stop members granting themselves admin.
--
-- Run once in Supabase → SQL Editor. Safe to re-run.
--
-- The problem
-- -----------
-- The only UPDATE policy on `profiles` is (sql_queries/supabase-schema.sql):
--
--     create policy "Users can update own profile" on profiles
--       for update using (auth.uid() = user_id);
--
-- That is row-scoped but NOT column-scoped, and `is_admin` lives on that row.
-- So any signed-in member can run this from the browser console with the
-- public anon key and become an admin:
--
--     update profiles
--     set is_admin = true, user_type = 'board_member', board_position = 'President'
--     where user_id = <their own id>;
--
-- Postgres has no per-column RLS, and column GRANTs would block admins too
-- (admins use the same `authenticated` role). A BEFORE trigger is the fix that
-- keeps every legitimate flow working.
--
-- What stays allowed
-- ------------------
--   * members editing their own name, bio, links, photo, graduation year, major
--   * members setting their own standing to undergrad / grad / alumni
--     (the profile page offers this, and alumni auto-promotion writes it)
--   * admins changing anything, for anyone (the admin panel)
--   * signup inserting a new profile

-- ---------------------------------------------------------------------------
-- Admin check (shared with avatars-admin-policies.sql; identical definition)
-- ---------------------------------------------------------------------------
-- `security definer` so the lookup does not re-trigger RLS on `profiles`.

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
-- The guard
-- ---------------------------------------------------------------------------

-- Deliberately NOT `security definer`: it has to see the CALLER's role below,
-- and inside a definer function `current_user` is the function's owner instead.
-- It needs no elevated rights of its own — `is_kso_admin()` is the definer
-- function that does the privileged lookup.

create or replace function public.guard_profile_privileges()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  -- Only browser clients are constrained. Anything running as a privileged
  -- role -- the SQL editor, a migration, a server-side job using the
  -- service_role key -- must stay unrestricted, or seeding a board member or
  -- an admin from the SQL editor would be silently downgraded.
  if current_user in ('service_role', 'postgres', 'supabase_admin', 'supabase_auth_admin')
     or exists (select 1 from pg_roles where rolname = current_user and rolsuper) then
    return new;
  end if;

  -- Admins may do as they like; this is how the admin panel works.
  if public.is_kso_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    -- Coerce rather than raise: signup inserts the row from the browser, and
    -- the insert policy deliberately permits it before a session exists
    -- (`auth.uid() is null`). Failing here would break account creation.
    new.is_admin := false;
    if new.user_type = 'board_member' then
      new.user_type := 'undergrad';
    end if;
    return new;
  end if;

  -- UPDATE: refuse loudly. No legitimate non-admin flow touches these.
  --
  -- Only an ESCALATION is blocked (false -> true). Dropping or re-asserting
  -- `false` is not a privilege gain, and the signup fallback in
  -- src/contexts/AuthContext.tsx writes `is_admin: false` on an UPDATE when the
  -- row already exists — refusing that would break an edge case of signup for
  -- no security benefit.
  if new.is_admin and not old.is_admin then
    raise exception 'Only admins can change admin status';
  end if;

  if new.user_type is distinct from old.user_type and new.user_type = 'board_member' then
    raise exception 'Only admins can assign board member status';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_guard_privileges on profiles;

create trigger profiles_guard_privileges
before insert or update on profiles
for each row execute function public.guard_profile_privileges();

-- ---------------------------------------------------------------------------
-- Not covered, on purpose
-- ---------------------------------------------------------------------------
-- `board_position` is still self-editable, because the profile page
-- intentionally lets an existing board member edit their own title ("Only
-- editable for existing board members"). A member who sets it gets a cosmetic
-- title in the directory but no extra permissions — the internships gate keys
-- on `user_type = 'board_member'`, which is now admin-only, and the public
-- board page reads the `board_positions` table instead.
--
-- To close that too, add this inside the UPDATE section above:
--
--   if new.board_position is distinct from old.board_position then
--     raise exception 'Only admins can change board position';
--   end if;
--
-- ...and make the Board Position field read-only in src/app/profile/page.tsx.

-- ---------------------------------------------------------------------------
-- Verify (run as a non-admin member; both should raise)
-- ---------------------------------------------------------------------------
-- update profiles set is_admin = true where user_id = auth.uid();
-- update profiles set user_type = 'board_member' where user_id = auth.uid();
