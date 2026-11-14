// Supabase data access for Optimus.
import { createClient } from '@supabase/supabase-js';

const URL = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const configured = !!(URL && KEY);
export const sb = configured ? createClient(URL, KEY) : null;
const BUCKET = 'invoices';

const stamp = iso => { const d = new Date(iso); return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ', ' + d.toTimeString().slice(0, 5); };
const fail = (error, what) => { if (error) { const e = new Error(what + ': ' + error.message); e.cause = error; throw e; } };

async function selectAll(table, columns, order) {
  const out = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb.from(table).select(columns).order(order, { ascending: true }).range(from, from + 999);
    fail(error, 'Loading ' + table);
    out.push(...data);
    if (data.length < 1000) return out;
  }
}

export async function loadWorkspace(email) {
  const members = await selectAll('team_members', 'key,email,name,title,kind,color,can_see_honorariums,reports_to', 'key');
  const me = members.find(m => (m.email || '').toLowerCase() === email.toLowerCase());
  if (!me) {
    const { data: req, error } = await sb.from('join_requests').select('email,name,status,requested_at').maybeSingle();
    fail(error, 'Checking your request');
    return { me: null, members, request: req };
  }
  let requests = [];
  if (me.kind === 'owner') {
    const { data, error } = await sb.from('join_requests').select('email,name,note,status,requested_at').order('requested_at', { ascending: false });
    fail(error, 'Loading sign-up requests');
    requests = data;
  }
  const rows = await selectAll('records', 'collection,id,seq,data', 'seq');
  const { data: log, error } = await sb.from('audit_log').select('at,actor_key,action,detail').eq('kind', 'app').order('at', { ascending: false }).limit(300);
  fail(error, 'Loading activity');
  return { me, members, requests, rows, audit: log.map(a => [stamp(a.at), a.actor_key, a.action, a.detail || '']) };
}

export async function saveRows(rows, blind) {
  for (let i = 0; i < rows.length; i += 200) {
    const batch = rows.slice(i, i + 200);
    const { error } = await sb.from('records').upsert(batch, { onConflict: 'collection,id', ignoreDuplicates: blind });
    fail(error, 'Saving');
  }
}
export async function addAudit(entries) {
  const { error } = await sb.from('audit_log').insert(entries.map(e => ({ action: e.action, detail: e.detail })));
  fail(error, 'Saving activity');
}
export async function upload(path, blob) {
  const { error } = await sb.storage.from(BUCKET).upload(path, blob, { contentType: blob.type || 'application/octet-stream', upsert: false });
  fail(error, 'Uploading file');
}
export async function fileUrl(path) {
  const { data, error } = await sb.storage.from(BUCKET).createSignedUrl(path, 300);
  fail(error, 'Opening file');
  return data.signedUrl;
}
export async function fileBlob(path) {
  const { data, error } = await sb.storage.from(BUCKET).download(path);
  fail(error, 'Downloading file');
  return data;
}

// Team list (who can sign in, and their access level). The database decides who may change which rows.
export async function saveMember(row) {
  const { data, error } = await sb.from('team_members').upsert(row, { onConflict: 'key' }).select('key');
  fail(error, 'Saving person');
  if (!data || !data.length) throw new Error('You are not allowed to change this person.');
}
export async function removeMember(key) {
  const { data, error } = await sb.from('team_members').delete().eq('key', key).select('key');
  fail(error, 'Removing person');
  if (!data || !data.length) throw new Error('You are not allowed to remove this person.');
}

// Sign-up requests: a new account asks to join; the DWM owner approves (adds them to the team) or declines.
export async function requestAccess(email, name) {
  const { error } = await sb.from('join_requests').insert({ email: email.toLowerCase(), name });
  if (error && error.code !== '23505') fail(error, 'Sending your request');
}
export async function declineRequest(email) {
  const { data, error } = await sb.from('join_requests').update({ status: 'declined' }).eq('email', email).select('email');
  fail(error, 'Declining request');
  if (!data || !data.length) throw new Error('Only the DWM owner can decline requests.');
}
export async function clearRequest(email) {
  const { error } = await sb.from('join_requests').delete().eq('email', email);
  fail(error, 'Clearing request');
}

// Notes: items that can be deleted from the app, and the shared items re-checked every minute.
export async function deleteRows(keys) {
  for (const k of keys) {
    const { error } = await sb.from('records').delete().eq('collection', k.collection).eq('id', k.id);
    fail(error, 'Deleting');
  }
}
export async function fetchRows(collections) {
  const { data, error } = await sb.from('records').select('collection,id,seq,owner_key,confidential,data').in('collection', collections).order('seq', { ascending: true });
  fail(error, 'Refreshing');
  return data;
}
