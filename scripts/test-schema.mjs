import { PGlite } from '@electric-sql/pglite';
import fs from 'node:fs';
const db = new PGlite();
const q = async (sql, label) => { try { const r = await db.exec(sql); return r; } catch (e) { console.log('ERR', label||'', e.message); return null; } };
await db.exec(`
create role anon; create role authenticated;
create schema auth; create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims', true),''),'{}')::jsonb $$;
create schema storage;
create table storage.buckets(id text primary key, name text, public bool, file_size_limit bigint, allowed_mime_types text[]);
create table storage.objects(id serial, bucket_id text, name text);
alter table storage.objects enable row level security;
grant usage on schema auth, storage to authenticated, anon; grant execute on function auth.jwt() to authenticated, anon;
grant select, insert, delete on storage.objects to authenticated; grant usage on all sequences in schema storage to authenticated;`);
const schema = fs.readFileSync(new URL('../supabase/schema.sql', import.meta.url),'utf8');
await db.exec(schema); await db.exec(schema); console.log('schema ran twice OK');
const as = async (email, sql) => {
  await db.exec(`reset role; set request.jwt.claims = '${JSON.stringify({email})}'; set role authenticated;`);
  try { const r = await db.query(sql); return r.rows; } catch (e) { return 'ERR: ' + e.message; } finally { await db.exec('reset role'); }
};
console.log('neha insert', await as('NEHA@example.com', `insert into records(collection,id,owner_key,confidential,data) values ('faculty_private','f1','ananya',false,'{"rate":85000}'),('tasks','T-1','ananya',false,'{}'),('invoices','IV-1','ananya',true,'{}')`));
console.log('neha sees', await as('neha@example.com', `select collection,id,confidential,updated_by from records order by seq`));
console.log('ananya sees', await as('ananya@example.com', `select collection,id from records order by seq`));
console.log('ananya update conf', await as('ananya@example.com', `update records set data='{"rate":1}' where id='f1' returning id`));
console.log('ananya blind insert dup', await as('ananya@example.com', `insert into records(collection,id,data) values ('invoices','IV-1','{"x":1}') on conflict do nothing`));
console.log('ananya blind insert new', await as('ananya@example.com', `insert into records(collection,id,data,confidential) values ('invoices','IV-2','{"x":1}',true) on conflict do nothing`));
console.log('ananya upsert task', await as('ananya@example.com', `insert into records(collection,id,data) values ('tasks','T-1','{"done":1}') on conflict (collection,id) do update set data=excluded.data`));
console.log('ananya delete', await as('ananya@example.com', `delete from records where id='T-1' returning id`));
console.log('stranger sees', await as('x@evil.com', `select count(*) from records`));
console.log('stranger insert', await as('x@evil.com', `insert into records(collection,id,data) values ('tasks','T-9','{}')`));
console.log('ananya audit fake actor', await as('ananya@example.com', `insert into audit_log(actor_key,action,detail) values ('rajiv','approved','x')`));
console.log('ananya audit read', await as('ananya@example.com', `select count(*) from audit_log`));
console.log('madhav audit read', await as('madhav@example.com', `select actor_key,kind,action,detail from audit_log order by id`));
console.log('madhav audit delete', await as('madhav@example.com', `delete from audit_log returning id`));
console.log('ananya team edit', await as('ananya@example.com', `update team_members set kind='chair' where key='ananya' returning key`));
console.log('ananya upload gen', await as('ananya@example.com', `insert into storage.objects(bucket_id,name) values ('invoices','confidential/IV-2/a.pdf'),('invoices','general/IV-3/b.pdf')`));
console.log('ananya files', await as('ananya@example.com', `select name from storage.objects`));
console.log('neha files', await as('neha@example.com', `select name from storage.objects`));
console.log('ping anon', await (async()=>{ await db.exec("set role anon"); const r=await db.query('select public.ping()'); await db.exec('reset role'); return r.rows;})());
