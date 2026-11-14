// Connects the Optimus UI state to the database: loads it in, and saves whatever changed.
const safeName = n => String(n || 'file').replace(/[^A-Za-z0-9._-]+/g, '_').slice(-120);
const key = r => r.collection + '|' + r.id;
// Items people can delete in the app, and that are shared live between people (re-read every minute).
const SHARED = ['notes', 'notes_private', 'mentions'];
const isShared = k => SHARED.includes(k.split('|')[0]);

export function setupData(db, B) {
  if (db.demo) { B.render(); return; }

  // team list -> USERS
  Object.keys(B.users).forEach(k => delete B.users[k]);
  B.pms.length = 0;
  for (const m of db.members) {
    B.users[m.key] = { name: m.name, role: m.title || '', kind: m.kind, color: m.color || '#525252', email: m.email || '', hon: !!m.can_see_honorariums, boss: m.reports_to || '' };
    if (m.kind === 'pm') B.pms.push(m.key);
  }

  // Production never loads the prototype's sample data: an empty database means an empty workspace.
  const seeding = false;
  B.hydrate(db.rows);
  B.audit.length = 0;
  B.audit.push(...db.audit);
  B.login(db.me);

  // what the database already has, so only changes are sent
  const snap = new Map();
  const canRead = r => !r.confidential || B.canConf();
  if (!seeding) for (const r of B.collect()) if (db.rows.some(x => key(x) === key(r))) snap.set(key(r), JSON.stringify(r));
  // rows this person cannot read were never loaded: never resend local placeholders for them
  const blindSent = new Set(seeding ? [] : B.collect().filter(r => !canRead(r)).map(key));
  let auditLen = B.audit.length;

  let timer = null, running = false, again = false, failed = false;
  async function sync() {
    if (running) { again = true; return; }
    running = true;
    try {
      // 1. upload new invoice files to storage
      for (const v of B.invoices()) {
        if (v.att && v.att.blob instanceof Blob && !v.att.path) {
          const path = `${B.invConf(v) ? 'confidential' : 'general'}/${v.id}/${Date.now()}-${safeName(v.att.name)}`;
          await db.upload(path, v.att.blob);
          v.att.path = path;
        }
      }
      // 2. rows that changed
      const rows = B.collect();
      const changed = rows.filter(r => snap.get(key(r)) !== JSON.stringify(r));
      // arrays keep the newest item first; reverse so the database order matches
      const order = r => (r.collection === 'tasks' || r.collection === 'invoices') ? -rows.indexOf(r) : rows.indexOf(r);
      changed.sort((a, b) => order(a) - order(b));
      const readable = changed.filter(canRead);
      const blind = changed.filter(r => !canRead(r) && !blindSent.has(key(r)));
      if (readable.length) await db.saveRows(readable, false);
      if (blind.length) await db.saveRows(blind, true);
      readable.forEach(r => snap.set(key(r), JSON.stringify(r)));
      blind.forEach(r => blindSent.add(key(r)));
      // notes and mentions removed in the app are deleted in the database
      const present = new Set(rows.map(key));
      const gone = [...snap.keys()].filter(k => isShared(k) && !present.has(k));
      if (gone.length && db.deleteRows) {
        await db.deleteRows(gone.map(k => { const i = k.indexOf('|'); return { collection: k.slice(0, i), id: k.slice(i + 1) }; }));
        gone.forEach(k => snap.delete(k));
      }
      // 3. new activity-log entries (the app adds them to the front)
      if (B.audit.length > auditLen) {
        const fresh = B.audit.slice(0, B.audit.length - auditLen).reverse();
        auditLen = B.audit.length;
        await db.addAudit(fresh.map(a => ({ action: a[2], detail: a[3] })));
      }
      if (failed) { failed = false; db.status = ''; B.render(); }
    } catch (e) {
      console.error('Save failed', e);
      if (!failed) { failed = true; db.status = 'Not saved, retrying'; B.toast('Could not save your last change. Retrying.'); }
      setTimeout(schedule, 5000);
    } finally {
      running = false;
      if (again) { again = false; schedule(); }
    }
  }
  function schedule() { clearTimeout(timer); timer = setTimeout(sync, 400); }

  // Pick up notes and mentions other people added, without a reload. Local edits not yet saved win.
  let pulling = false;
  async function pull() {
    if (pulling || running || !db.fetchRows) return;
    pulling = true;
    try {
      const server = await db.fetchRows(SHARED);
      const local = B.collect();
      const localByKey = new Map(local.map(r => [key(r), r]));
      const dirty = new Set(local.filter(r => isShared(key(r)) && snap.get(key(r)) !== JSON.stringify(r)).map(key));
      [...snap.keys()].filter(k => isShared(k) && !localByKey.has(k)).forEach(k => dirty.add(k)); // deleted here, not yet sent
      const changed = B.mergeShared(server, dirty);
      const after = B.collect();
      const afterKeys = new Set(after.map(key));
      for (const r of after) if (isShared(key(r)) && !dirty.has(key(r))) snap.set(key(r), JSON.stringify(r));
      [...snap.keys()].filter(k => isShared(k) && !afterKeys.has(k) && !dirty.has(k)).forEach(k => snap.delete(k));
      if (changed) B.refresh();
    } catch (e) { console.warn('Refresh failed', e); }
    finally { pulling = false; }
  }
  setInterval(pull, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) pull(); });

  document.addEventListener('click', schedule);
  document.addEventListener('change', schedule);
  document.addEventListener('keyup', e => { if (e.key === 'Escape' || e.key === 'Enter') schedule(); });
  setInterval(sync, 5000);
  window.addEventListener('beforeunload', e => { if (running || failed) { e.preventDefault(); e.returnValue = ''; } });

  B.render();
}
