-- Optimus database setup. Paste this whole file into Supabase > SQL Editor > New query, and click Run.
-- It is safe to run again: it only creates what is missing and refreshes the rules.

-- ============ 1. Team list (who can sign in, and their role) ============
-- kind: chair | head | owner | lead | pm
--   chair, head  : full access, including honorariums, bank details and senior-faculty invoices
--   owner, lead  : team view, confidential money fields masked
--   pm           : own work, confidential money fields masked
create table if not exists public.team_members (
  key        text primary key,                 -- short id used inside the app, e.g. 'ananya'
  email      text unique not null,             -- must match the person's Supabase login email
  name       text not null,
  title      text not null default '',
  kind       text not null check (kind in ('chair','head','owner','lead','pm')),
  color      text not null default '#525252',
  created_at timestamptz not null default now()
);

-- Starter team. CHANGE THE EMAILS to real ones (here, or later in Table Editor > team_members).
insert into public.team_members (key, email, name, title, kind, color) values
  ('rajiv',     'rajiv@example.com',     'Rajiv Gupta',   'Chairperson',        'chair', '#111111'),
  ('neha',      'neha@example.com',      'Neha Kadian',   'Head of Operations', 'head',  '#3B3B3B'),
  ('madhav',    'madhav@example.com',    'Madhav Garg',   'DWM Owner',          'owner', '#5F5F5F'),
  ('shivpriya', 'shivpriya@example.com', 'Shivpriya',     'Team Lead',          'lead',  '#404040'),
  ('ananya',    'ananya@example.com',    'Ananya Sharma', 'Programme Manager',  'pm',    '#1D4ED8'),
  ('karan',     'karan@example.com',     'Karan Mehta',   'Programme Manager',  'pm',    '#6B7280'),
  ('ishita',    'ishita@example.com',    'Ishita Rao',    'Programme Manager',  'pm',    '#D97706')
on conflict (key) do nothing;

-- ============ 2. Helper functions used by the access rules ============
create or replace function public.my_member_key() returns text
language sql stable security definer set search_path = public as $$
  select key from public.team_members where lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')) limit 1
$$;
create or replace function public.my_kind() returns text
language sql stable security definer set search_path = public as $$
  select kind from public.team_members where lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')) limit 1
$$;
create or replace function public.is_member() returns boolean
language sql stable as $$ select public.my_member_key() is not null $$;
create or replace function public.can_see_confidential() returns boolean
language sql stable as $$ select coalesce(public.my_kind() in ('chair','head'), false) $$;
create or replace function public.is_manager() returns boolean
language sql stable as $$ select coalesce(public.my_kind() in ('chair','head','owner','lead'), false) $$;

-- ============ 3. App data ============
-- One row per item (a task, a session, a faculty member, an invoice...). The item itself is in "data".
-- confidential = true rows (honorariums, faculty bank/PAN/rates, senior-faculty invoices) are
-- readable only by chair and head. Everyone else can add them but never read them back.
create table if not exists public.records (
  collection   text not null check (collection in
               ('tasks','sessions','faculty','faculty_private','cohorts','honoraria','invoices','settings')),
  id           text not null,
  seq          bigserial,
  owner_key    text,
  confidential boolean not null default false,
  data         jsonb not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  updated_by   text default public.my_member_key(),
  primary key (collection, id)
);
create index if not exists records_seq_idx on public.records (seq);

-- confidential collections are always confidential, whatever the app sends
create or replace function public.records_before_write() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.collection in ('faculty_private','honoraria') then new.confidential := true; end if;
  new.updated_at := now();
  new.updated_by := public.my_member_key();
  if tg_op = 'UPDATE' then
    new.created_at := old.created_at;
    new.seq := old.seq;
    -- once confidential, an item cannot be made public again except by chair/head
    if old.confidential and not new.confidential and not public.can_see_confidential() then
      new.confidential := true;
    end if;
  end if;
  return new;
end $$;
drop trigger if exists records_before_write on public.records;
create trigger records_before_write before insert or update on public.records
  for each row execute function public.records_before_write();

-- ============ 4. Activity log (append-only) ============
create table if not exists public.audit_log (
  id         bigserial primary key,
  at         timestamptz not null default now(),
  actor_key  text,
  kind       text not null default 'app' check (kind in ('app','change')),
  action     text not null,
  detail     text
);
create index if not exists audit_log_at_idx on public.audit_log (at desc);

create or replace function public.audit_before_insert() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.actor_key := public.my_member_key();  -- nobody can log as someone else
  new.at := now();
  if new.kind is null then new.kind := 'app'; end if;
  return new;
end $$;
drop trigger if exists audit_before_insert on public.audit_log;
create trigger audit_before_insert before insert on public.audit_log
  for each row execute function public.audit_before_insert();

-- every database change is also logged automatically (what and who, never the confidential values)
create or replace function public.records_after_write() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.audit_log (kind, action, detail)
  values ('change', lower(tg_op), coalesce(new.collection, old.collection) || '/' || coalesce(new.id, old.id));
  return null;
end $$;
drop trigger if exists records_after_write on public.records;
create trigger records_after_write after insert or update or delete on public.records
  for each row execute function public.records_after_write();

-- ============ 5. Access rules (Row Level Security) ============
alter table public.team_members enable row level security;
alter table public.records      enable row level security;
alter table public.audit_log    enable row level security;

drop policy if exists tm_read  on public.team_members;
drop policy if exists tm_write on public.team_members;
create policy tm_read  on public.team_members for select to authenticated using (public.is_member());
create policy tm_write on public.team_members for all    to authenticated
  using (public.can_see_confidential()) with check (public.can_see_confidential());

drop policy if exists rec_read   on public.records;
drop policy if exists rec_insert on public.records;
drop policy if exists rec_update on public.records;
drop policy if exists rec_delete on public.records;
create policy rec_read   on public.records for select to authenticated
  using (public.is_member() and (not confidential or public.can_see_confidential()));
create policy rec_insert on public.records for insert to authenticated
  with check (public.is_member());
create policy rec_update on public.records for update to authenticated
  using (public.is_member() and (not confidential or public.can_see_confidential()))
  with check (public.is_member());
create policy rec_delete on public.records for delete to authenticated
  using (public.can_see_confidential());

drop policy if exists audit_read   on public.audit_log;
drop policy if exists audit_insert on public.audit_log;
create policy audit_read   on public.audit_log for select to authenticated using (public.is_manager());
create policy audit_insert on public.audit_log for insert to authenticated with check (public.is_member() and kind = 'app');
-- no update or delete policies: the log cannot be edited or erased from the app

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.records, public.team_members to authenticated;
grant select, insert on public.audit_log to authenticated;
grant usage, select on all sequences in schema public to authenticated;
revoke all on public.records, public.team_members, public.audit_log from anon;

-- ============ 6. Invoice file storage ============
-- Private bucket, 10 MB per file, PDF and images only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('invoices', 'invoices', false, 10485760, array['application/pdf','image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists inv_files_read   on storage.objects;
drop policy if exists inv_files_upload on storage.objects;
drop policy if exists inv_files_delete on storage.objects;
create policy inv_files_read on storage.objects for select to authenticated
  using (bucket_id = 'invoices' and public.is_member()
         and (name not like 'confidential/%' or public.can_see_confidential()));
create policy inv_files_upload on storage.objects for insert to authenticated
  with check (bucket_id = 'invoices' and public.is_member()
              and (name like 'general/%' or name like 'confidential/%'));
create policy inv_files_delete on storage.objects for delete to authenticated
  using (bucket_id = 'invoices' and public.can_see_confidential());

-- ============ 7. Keep-alive ============
-- Free Supabase projects pause after 7 days without activity. A daily GitHub Action calls this.
create or replace function public.ping() returns text language sql stable as $$ select 'ok'::text $$;
grant execute on function public.ping() to anon, authenticated;
