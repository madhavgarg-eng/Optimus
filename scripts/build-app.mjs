// One-off transform: turns the prototype's inline script into src/app.js, wired to the data layer.
// Usage: node scripts/build-app.mjs <prototype-script.js>
import fs from 'node:fs';
let s = fs.readFileSync(process.argv[2], 'utf8');
const rep = (a, b, all = false) => {
  if (!s.includes(a)) throw new Error('Patch target not found: ' + a.slice(0, 80));
  s = all ? s.split(a).join(b) : s.replace(a, b);
};

// module wrapper
rep('(function(){\nconst TODAY', `import { setupData } from './data-bridge.js';
export function bootOptimus(db){
const localISO = d => new Date(d.getTime() - d.getTimezoneOffset()*6e4).toISOString().slice(0,10);
const TODAY_REAL = new Date();
const TODAY`);
s = s.replace(/render\(\);\n\}\)\(\);\s*$/, 'setupData(db, BRIDGE);\n}\n');
rep(`new Date('2026-10-15T09:30:00');`, `db.demo ? new Date('2026-10-15T09:30:00') : TODAY_REAL;\nconst TODAY_ISO = localISO(TODAY);\nconst isoWeek = d => { const t=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())); const n=t.getUTCDay()||7; t.setUTCDate(t.getUTCDate()+4-n); return Math.ceil(((t-Date.UTC(t.getUTCFullYear(),0,1))/864e5+1)/7); };\nconst nowStamp = () => { const d=new Date(); return d.toLocaleDateString('en-IN',{day:'numeric',month:'short'})+', '+d.toTimeString().slice(0,5); };`);

// real dates instead of the frozen demo date
rep(`value="2026-10-15"`, 'value="${TODAY_ISO}"', true);
rep(`'2026-10-15'`, 'TODAY_ISO', true);
rep(`-2026.xlsx`, '-${TODAY_ISO.slice(0,4)}.xlsx');
rep(`· Week 42`, '· Week ${isoWeek(TODAY)}');
rep(`AUDIT.unshift(['15 Oct, 09:30'`, `AUDIT.unshift([nowStamp()`, true);

// ids that stay unique when several people add items at the same time
rep(`'IV-'+(49+INVOICES.length-8)`, `newId('IV-', 49+INVOICES.length-8)`, true);
rep(`'f'+(Object.keys(FACULTY).length+1)`, `newId('f', Object.keys(FACULTY).length+1)`);
rep(`'S-'+(320+SESSIONS.length-9)`, `newId('S-', 320+SESSIONS.length-9)`);
rep(`'T-'+n`, `newId('T-', n)`);
rep('const D = s =>', "const newId = (p, n) => db.demo ? p + n : p + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2,5).toUpperCase();\nconst D = s =>");

// collections that get replaced from the database
rep('const STUDENTS =', 'let STUDENTS =');

// robust avatars for people missing from the team list
rep(`const initials = id => USERS[id].name`, `const UU = id => USERS[id] || {name:String(id||'Unknown'), role:'', kind:'pm', color:'#737373'};\nconst initials = id => UU(id).name`);
rep('style="background:${USERS[id].color}" title="${esc(USERS[id].name)}"', 'style="background:${UU(id).color}" title="${esc(UU(id).name)}"');
rep('<span>${esc(USERS[id].name)}</span></span>`;', '<span>${esc(UU(id).name)}</span></span>`;');

// sign out instead of persona switching when running for real
rep(`<button class="switch" data-act="logout">Switch person</button>`, '<button class="switch" data-act="logout">${db.demo?\'Switch person\':\'Sign out\'}</button>');
rep(`<span class="demo-pill">Preview · sample data</span>`, '${db.demo?\'<span class="demo-pill">Preview · sample data</span>\':(db.status?`<span class="demo-pill">${esc(db.status)}</span>`:\'\')}');
rep(`case 'logout': S.user=null;`, `case 'logout': if (!db.demo){ db.signOut(); break; } S.user=null;`);

// invoice attachments: files stored in Supabase Storage
rep("${v.att.blob?`<a class=\"btn sm\" href=\"${v.att.url}\" target=\"_blank\" rel=\"noopener\">Open</a>",
    "${v.att.path&&!v.att.blob?`<button class=\"btn sm\" data-act=\"attopen\" data-id=\"${v.id}\">Open</button><button class=\"btn sm\" data-act=\"attdl\" data-id=\"${v.id}\">${ic('download')}Download</button>`:v.att.blob?`<a class=\"btn sm\" href=\"${v.att.url}\" target=\"_blank\" rel=\"noopener\">Open</a>");
rep(`case 'attdl': { const v=INVOICES.find(x=>x.id===el.dataset.id); if (v&&v.att&&v.att.blob) saveFile(v.att.name, v.att.blob); break; }`,
    `case 'attdl': { const v=INVOICES.find(x=>x.id===el.dataset.id); if (v&&v.att&&v.att.blob) saveFile(v.att.name, v.att.blob); else if (v&&v.att&&v.att.path) db.fileBlob(v.att.path).then(b=>saveFile(v.att.name,b)).catch(()=>toast('Could not download the file')); break; }
    case 'attopen': { const v=INVOICES.find(x=>x.id===el.dataset.id); const w=window.open('about:blank','_blank'); db.fileUrl(v.att.path).then(u=>{ if (w) w.location=u; else window.open(u,'_blank'); }).catch(()=>{ if (w) w.close(); toast('Could not open the file'); }); break; }`);

// bridge: everything the data layer needs to read and replace app state
rep('/* ---------------- state ---------------- */', `/* ---------------- data bridge ---------------- */
const EMPTY_BANK = () => ({holder:'',bank:'',acct:'',ifsc:''});
const BRIDGE = {
  users: USERS, pms: PMS, audit: AUDIT,
  invoices: () => INVOICES,
  invConf: v => invConf(v),
  canConf: () => !!S.user && canConf(),
  toast: m => toast(m),
  render: () => render(),
  collect(){
    const out = [];
    const put = (collection, id, owner_key, confidential, data) => out.push({collection, id:String(id), owner_key: owner_key||null, confidential: !!confidential, data});
    TASKS.forEach(t => put('tasks', t.id, t.owner, false, t));
    SESSIONS.forEach(x => put('sessions', x.id, x.pm, false, x));
    Object.entries(FACULTY).forEach(([id,f]) => { const {rate, bank, pan, ...pub} = f; put('faculty', id, f.pm, false, pub); put('faculty_private', id, f.pm, true, {rate:+rate||0, bank: bank||EMPTY_BANK(), pan: pan||''}); });
    COHORTS.forEach(c => put('cohorts', c.code, c.pm, false, c));
    HONORARIA.forEach(h => put('honoraria', h.fac+'|'+h.session, null, true, h));
    INVOICES.forEach(v => { const d = {...v}; if (d.att){ const {blob, url, ...a} = d.att; d.att = a; } put('invoices', v.id, v.pm, invConf(v), d); });
    put('settings', 'kstate', null, false, KSTATE);
    put('settings', 'kq', null, false, KQ);
    put('settings', 'invnext', null, false, invNext);
    return out;
  },
  hydrate(rows){
    const by = c => rows.filter(r => r.collection===c);
    const asc = c => by(c).sort((a,b)=>a.seq-b.seq).map(r=>r.data);
    const desc = c => by(c).sort((a,b)=>b.seq-a.seq).map(r=>r.data);
    TASKS = desc('tasks');
    SESSIONS = asc('sessions');
    INVOICES = desc('invoices');
    const priv = Object.fromEntries(by('faculty_private').map(r=>[r.id, r.data]));
    Object.keys(FACULTY).forEach(k => delete FACULTY[k]);
    by('faculty').sort((a,b)=>a.seq-b.seq).forEach(r => { FACULTY[r.id] = {rate:0, bank:EMPTY_BANK(), pan:'', ...r.data, ...(priv[r.id]||{})}; });
    COHORTS.length = 0; COHORTS.push(...asc('cohorts'));
    HONORARIA.length = 0; HONORARIA.push(...asc('honoraria'));
    const setting = id => (by('settings').find(r=>r.id===id)||{}).data;
    const swap = (obj, val) => { if (!val) return; Object.keys(obj).forEach(k=>delete obj[k]); Object.assign(obj, val); };
    swap(KSTATE, setting('kstate')); swap(KQ, setting('kq')); swap(invNext, setting('invnext'));
    STUDENTS = COHORTS.filter(c=>c.status==='Running').flatMap(c=>c.students||[]);
  },
  login(key){
    S.user = key; S.view = USERS[key].kind==='pm' ? 'myday' : 'overview';
    S.taskScope = USERS[key].kind==='chair' ? 'assigned' : 'mine';
  }
};

/* ---------------- state ---------------- */`);

fs.writeFileSync(new URL('../src/app.js', import.meta.url), s);
console.log('src/app.js written,', s.split('\n').length, 'lines');
