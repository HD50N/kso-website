-- Run in Supabase → SQL Editor (once per project).
-- Creates a public bucket for formal / culture-show galleries and allows anyone to read + list objects.
-- Upload files in Dashboard → Storage, or use a script with the service role key.
--
-- Server listing on Vercel: add SUPABASE_SERVICE_ROLE_KEY (Settings → API → service_role) as a server env var.
-- Without it, the app uses the anon key; the SELECT policy below must exist for listing to work.

insert into storage.buckets (id, name, public)
values ('event-photos', 'event-photos', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "event_photos_public_select" on storage.objects;

create policy "event_photos_public_select"
on storage.objects
for select
to public
using (bucket_id = 'event-photos');
