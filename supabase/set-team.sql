-- Sets the Optimus team and lets Madhav (DWM owner) manage people from inside the app.
--   Rajiv Gupta  - Chairperson              (chair) : everything, approves KPIs, sees honorariums
--   Neha Kadian  - Senior Program Manager   (head)  : full access, including honorariums
--   Madhav Garg  - DWM Owner                (owner) : all operational work, manages people; honorariums masked
--   Shivpriya    - Program Manager          (lead)  : team view; honorariums masked
--   Priyanshi    - Intern                   (pm)    : own work only; honorariums masked
-- Safe to run more than once.
--
-- BEFORE RUNNING: replace the REPLACE_ME emails with real ones. Any you leave as REPLACE_ME keep
-- the email already saved for that person (so it is safe to run before you have every address).
-- Run in Supabase > SQL Editor > New query.

begin;

-- 0. who may change the team list:
--    Rajiv/Neha (chair, head): anyone.  Madhav (owner): only owner, lead and pm people, and can never
--    give honorarium access (chair/head). Everyone else: read only.
drop policy if exists tm_write       on public.team_members;
drop policy if exists tm_admin_all   on public.team_members;
drop policy if exists tm_owner_add   on public.team_members;
drop policy if exists tm_owner_edit  on public.team_members;
drop policy if exists tm_owner_remove on public.team_members;
create policy tm_admin_all on public.team_members for all to authenticated
  using (public.can_see_confidential()) with check (public.can_see_confidential());
create policy tm_owner_add on public.team_members for insert to authenticated
  with check (public.my_kind() = 'owner' and kind in ('owner','lead','pm'));
create policy tm_owner_edit on public.team_members for update to authenticated
  using (public.my_kind() = 'owner' and kind in ('owner','lead','pm'))
  with check (public.my_kind() = 'owner' and kind in ('owner','lead','pm'));
create policy tm_owner_remove on public.team_members for delete to authenticated
  using (public.my_kind() = 'owner' and kind in ('owner','lead','pm'));

-- 1. remove everyone else (sample people and any test rows)
delete from public.team_members
where key not in ('rajiv', 'neha', 'madhav', 'shivpriya', 'priyanshi');

-- 2. add or update the five people
insert into public.team_members (key, email, name, title, kind, color) values
  ('rajiv',     'REPLACE_ME_rajiv@mastersunion.org',     'Rajiv Gupta', 'Chairperson',        'chair', '#111111'),
  ('neha',      'REPLACE_ME_neha@mastersunion.org',      'Neha Kadian', 'Senior Program Manager', 'head',  '#3B3B3B'),
  ('madhav',    'madhav.garg@mastersunion.org',          'Madhav Garg', 'DWM Owner',          'owner', '#5F5F5F'),
  ('shivpriya', 'REPLACE_ME_shivpriya@mastersunion.org', 'Shivpriya',   'Program Manager',    'lead',  '#404040'),
  ('priyanshi', 'REPLACE_ME_priyanshi@mastersunion.org', 'Priyanshi',   'Intern',             'pm',    '#1D4ED8')
on conflict (key) do update
  set email = case when excluded.email like 'REPLACE_ME%' then public.team_members.email else excluded.email end,
      name = excluded.name, title = excluded.title, kind = excluded.kind, color = excluded.color;

commit;

select key, name, title, kind, email from public.team_members
order by array_position(array['chair','head','owner','lead','pm'], kind);
