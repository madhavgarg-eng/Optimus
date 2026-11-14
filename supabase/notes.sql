-- Optimus notes: team notes, private notes and @mentions. Safe to run more than once.
-- Run in Supabase > SQL Editor > New query, after schema.sql.
--
--   notes          visible to everyone on the team
--   notes_private  visible only to the person who wrote it (not even the DWM owner can read it)
--   mentions       "@Name" tags in team notes; the person tagged gets a notification

begin;

-- 1. allow the new kinds of item
alter table public.records drop constraint if exists records_collection_check;
alter table public.records add constraint records_collection_check check (collection in
  ('tasks','sessions','faculty','faculty_private','cohorts','honoraria','invoices','settings','notes','notes_private','mentions'));

-- 2. the author of a note or mention is always whoever created it, and never changes
create or replace function public.records_before_write() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.collection in ('faculty_private','honoraria') then new.confidential := true; end if;
  if new.collection in ('notes','notes_private','mentions') then new.confidential := false; end if;
  new.updated_at := now();
  new.updated_by := public.my_member_key();
  if tg_op = 'INSERT' and new.collection in ('notes','notes_private','mentions') then
    new.owner_key := public.my_member_key();
  end if;
  if tg_op = 'UPDATE' then
    new.created_at := old.created_at;
    new.seq := old.seq;
    if old.collection in ('notes','notes_private','mentions') then new.owner_key := old.owner_key; end if;
    -- once confidential, an item cannot be made public again except by someone with honorarium access
    if old.confidential and not new.confidential and not public.can_see_confidential() then
      new.confidential := true;
    end if;
  end if;
  return new;
end $$;

-- 3. who can read and change what
drop policy if exists rec_read   on public.records;
drop policy if exists rec_insert on public.records;
drop policy if exists rec_update on public.records;
drop policy if exists rec_delete on public.records;
create policy rec_read on public.records for select to authenticated
  using (public.is_member()
         and (not confidential or public.can_see_confidential())
         and (collection <> 'notes_private' or owner_key = public.my_member_key()));
create policy rec_insert on public.records for insert to authenticated
  with check (public.is_member()
              and (collection <> 'notes_private' or owner_key = public.my_member_key()));
create policy rec_update on public.records for update to authenticated
  using (public.is_member()
         and (not confidential or public.can_see_confidential())
         and (collection <> 'notes_private' or owner_key = public.my_member_key()))
  with check (public.is_member()
              and (collection <> 'notes_private' or owner_key = public.my_member_key()));
create policy rec_delete on public.records for delete to authenticated
  using ((collection not in ('notes','notes_private','mentions') and public.can_see_confidential())
         or (collection in ('notes','notes_private','mentions') and owner_key = public.my_member_key())
         or (collection = 'notes' and public.is_owner()));

commit;
