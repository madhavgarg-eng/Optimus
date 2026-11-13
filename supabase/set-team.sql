-- Optimus team and access. Safe to run more than once.
--
--   Person       Title                    Access level        Honorariums
--   Madhav Garg  DWM Owner                owner (everything)  always visible
--   Rajiv Gupta  Chairperson              chair               visible
--   Neha Kadian  Senior Program Manager   head                visible
--   Shivpriya    Program Manager          lead                visible
--   Priyanshi    Intern                   pm                  visible        (reports to Neha)
--
-- Access level decides which work someone sees. Honorarium access (faculty rates, totals, bank
-- details, senior-faculty invoices) is a separate per-person switch, OFF for anyone added later
-- unless it is switched on in Admin > People and access.
-- New people create their own account; they see nothing until the DWM owner approves the request.
--
-- BEFORE RUNNING: replace the REPLACE_ME emails with real ones. Any left as REPLACE_ME keep the
-- email already saved for that person. Run in Supabase > SQL Editor > New query.

begin;

-- 1. the honorarium switch
alter table public.team_members add column if not exists can_see_honorariums boolean not null default false;
alter table public.team_members add column if not exists reports_to text;  -- key of the person they report to

-- 2. access rules and sign-up requests
-- The DWM owner has every kind of access, whatever the hierarchy. Others see honorariums only if
-- their switch is on.
create or replace function public.can_see_confidential() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select can_see_honorariums or kind = 'owner' from public.team_members
                   where lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')) limit 1), false)
$$;
create or replace function public.is_owner() returns boolean
language sql stable as $$ select coalesce(public.my_kind() = 'owner', false) $$;

-- Who may change the team list
--   DWM owner: anyone, any level, and honorarium access.
--   Others with honorarium access: anyone except DWM owners, and cannot make someone a DWM owner.
--   Chair and head without it: only team-view and own-work people without honorarium access.
drop policy if exists tm_write        on public.team_members;
drop policy if exists tm_dwm_owner    on public.team_members;
drop policy if exists tm_admin_all    on public.team_members;
drop policy if exists tm_owner_add    on public.team_members;
drop policy if exists tm_owner_edit   on public.team_members;
drop policy if exists tm_owner_remove on public.team_members;
drop policy if exists tm_mgr_add      on public.team_members;
drop policy if exists tm_mgr_edit     on public.team_members;
drop policy if exists tm_mgr_remove   on public.team_members;
create policy tm_dwm_owner on public.team_members for all to authenticated
  using (public.is_owner()) with check (public.is_owner());
create policy tm_admin_all on public.team_members for all to authenticated
  using (public.can_see_confidential() and kind <> 'owner')
  with check (public.can_see_confidential() and kind <> 'owner');
create policy tm_mgr_add on public.team_members for insert to authenticated
  with check (public.my_kind() in ('chair','head') and kind in ('lead','pm') and not can_see_honorariums);
create policy tm_mgr_edit on public.team_members for update to authenticated
  using (public.my_kind() in ('chair','head') and kind in ('lead','pm') and not can_see_honorariums)
  with check (public.my_kind() in ('chair','head') and kind in ('lead','pm') and not can_see_honorariums);
create policy tm_mgr_remove on public.team_members for delete to authenticated
  using (public.my_kind() in ('chair','head') and kind in ('lead','pm') and not can_see_honorariums);

-- Sign-up requests. Anyone can create an account; it does nothing until the DWM owner approves it
-- (by adding them to team_members). Until then they can only see their own request.
create table if not exists public.join_requests (
  email        text primary key,
  name         text not null default '',
  note         text not null default '',
  status       text not null default 'pending' check (status in ('pending','declined')),
  requested_at timestamptz not null default now()
);
alter table public.join_requests enable row level security;
drop policy if exists jr_self_read   on public.join_requests;
drop policy if exists jr_self_add    on public.join_requests;
drop policy if exists jr_dwm_owner   on public.join_requests;
create policy jr_self_read on public.join_requests for select to authenticated
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));
create policy jr_self_add on public.join_requests for insert to authenticated
  with check (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')) and status = 'pending' and not public.is_member());
create policy jr_dwm_owner on public.join_requests for all to authenticated
  using (public.is_owner()) with check (public.is_owner());
grant select, insert, update, delete on public.join_requests to authenticated;
revoke all on public.join_requests from anon;

-- 3. the team: remove everyone else, then add or update the five
delete from public.team_members
where key not in ('rajiv', 'neha', 'madhav', 'shivpriya', 'priyanshi');

insert into public.team_members (key, email, name, title, kind, color, can_see_honorariums, reports_to) values
  ('rajiv',     'REPLACE_ME_rajiv@mastersunion.org',     'Rajiv Gupta', 'Chairperson',            'chair', '#111111', true, null),
  ('neha',      'REPLACE_ME_neha@mastersunion.org',      'Neha Kadian', 'Senior Program Manager', 'head',  '#3B3B3B', true, null),
  ('madhav',    'madhav.garg@mastersunion.org',          'Madhav Garg', 'DWM Owner',              'owner', '#5F5F5F', true, null),
  ('shivpriya', 'REPLACE_ME_shivpriya@mastersunion.org', 'Shivpriya',   'Program Manager',        'lead',  '#404040', true, null),
  ('priyanshi', 'REPLACE_ME_priyanshi@mastersunion.org', 'Priyanshi',   'Intern',                 'pm',    '#1D4ED8', true, 'neha')
on conflict (key) do update
  set email = case when excluded.email like 'REPLACE_ME%' then public.team_members.email else excluded.email end,
      name = excluded.name, title = excluded.title, kind = excluded.kind, color = excluded.color,
      can_see_honorariums = excluded.can_see_honorariums,
      reports_to = coalesce(excluded.reports_to, public.team_members.reports_to);

commit;

select key, name, title, kind, reports_to, can_see_honorariums, email from public.team_members
order by array_position(array['chair','head','owner','lead','pm'], kind);
