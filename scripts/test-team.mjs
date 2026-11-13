import { PGlite } from '@electric-sql/pglite';
import fs from 'node:fs';
const db = new PGlite();
await db.exec(`create role anon; create role authenticated; create schema auth; create function auth.jwt() returns jsonb language sql stable as $$ select '{}'::jsonb $$;
create schema storage; create table storage.buckets(id text primary key, name text, public bool, file_size_limit bigint, allowed_mime_types text[]); create table storage.objects(id serial, bucket_id text, name text); alter table storage.objects enable row level security;`);
await db.exec(fs.readFileSync(new URL('../supabase/schema.sql', import.meta.url), 'utf8'));
await db.exec(`update team_members set email='neha.real@x.org' where key='neha'; update team_members set kind='head' where key='madhav'; insert into team_members(key,email,name,kind) values ('rajat','r@x','Rajat','head');`);
const r = await db.exec(fs.readFileSync(new URL('../supabase/set-team.sql', import.meta.url), 'utf8'));
console.table(r.at(-1).rows);
