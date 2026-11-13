-- Removes the prototype's sample data from Optimus. Anything your team added for real is kept.
-- Run it in Supabase > SQL Editor > New query AFTER the updated app is deployed
-- (the old app version would load the sample data again on an empty database).
--
-- It deletes only the exact sample items by their ids, so real tasks, sessions, faculty,
-- cohorts and invoices you created since launch are not touched.

begin;

delete from public.records
where (collection = 'tasks'           and id in ('T-1042','T-1043','T-1044','T-1045','T-1046','T-1047','T-1048','T-1049','T-1050','T-1051','T-1052','T-1053','T-1054','T-1055','T-1056','T-1057','T-1058','T-1059','T-1060'))
   or (collection = 'sessions'        and id in ('S-311','S-312','S-313','S-314','S-315','S-316','S-317','S-318','S-319'))
   or (collection = 'faculty'         and id in ('f1','f2','f3','f4','f5','f6','f7','f8','f9','f10'))
   or (collection = 'faculty_private' and id in ('f1','f2','f3','f4','f5','f6','f7','f8','f9','f10'))
   or (collection = 'cohorts'         and id in ('OPMC1','OPMC2','OPMC3','EBAPC1','EBAPC2'))
   or (collection = 'honoraria'       and id in ('f1|S-311','f8|S-319','f2|S-313','f5|S-316'))
   or (collection = 'invoices'        and id in ('IV-41','IV-42','IV-43','IV-44','IV-45','IV-46','IV-47','IV-48'))
   or (collection = 'settings'        and id in ('kstate','kq'));   -- sample KPI scores and scorecard states

-- Invoice numbering restarts at 1 only if no real invoice has been created yet.
delete from public.records r
where r.collection = 'settings' and r.id = 'invnext'
  and not exists (select 1 from public.records i where i.collection = 'invoices');

commit;

-- What is left (should list only items your team added):
select collection, count(*) as items from public.records group by collection order by collection;
