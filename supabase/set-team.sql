-- Sets the Optimus team to exactly five people, following the agreed hierarchy:
--   Rajiv Gupta  - Chairperson         (chair) : sees everything, approves KPIs, sees honorariums
--   Neha Kadian  - Head of Operations  (head)  : oversees PMs, confidential payments, verifies KPIs
--   Madhav Garg  - DWM Owner           (owner) : runs the system and reports; honorariums masked
--   Shivpriya    - Team Lead           (lead)  : team view, day-to-day operations; honorariums masked
--   Priyanshi    - Programme Manager   (pm)    : own cohorts, sessions and tasks; honorariums masked
--
-- BEFORE RUNNING: replace the REPLACE_ME emails with real ones. Any you leave as REPLACE_ME keep
-- the email already saved for that person (so it is safe to run before you have every address).
-- Run in Supabase > SQL Editor > New query.

begin;

-- 1. remove everyone else (sample people and any test rows)
delete from public.team_members
where key not in ('rajiv', 'neha', 'madhav', 'shivpriya', 'priyanshi');

-- 2. add or update the five people
insert into public.team_members (key, email, name, title, kind, color) values
  ('rajiv',     'REPLACE_ME_rajiv@mastersunion.org',     'Rajiv Gupta', 'Chairperson',        'chair', '#111111'),
  ('neha',      'REPLACE_ME_neha@mastersunion.org',      'Neha Kadian', 'Head of Operations', 'head',  '#3B3B3B'),
  ('madhav',    'madhav.garg@mastersunion.org',          'Madhav Garg', 'DWM Owner',          'owner', '#5F5F5F'),
  ('shivpriya', 'REPLACE_ME_shivpriya@mastersunion.org', 'Shivpriya',   'Team Lead',          'lead',  '#404040'),
  ('priyanshi', 'REPLACE_ME_priyanshi@mastersunion.org', 'Priyanshi',   'Programme Manager',  'pm',    '#1D4ED8')
on conflict (key) do update
  set email = case when excluded.email like 'REPLACE_ME%' then public.team_members.email else excluded.email end,
      name = excluded.name, title = excluded.title, kind = excluded.kind, color = excluded.color;

commit;

select key, name, title, kind, email from public.team_members
order by array_position(array['chair','head','owner','lead','pm'], kind);
