import './style.css';
import { configured, sb, loadWorkspace, saveRows, addAudit, upload, fileUrl, fileBlob } from './db.js';
import { bootOptimus } from './app.js';

const root = document.getElementById('root');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function art() {
  return `<section class="login-art">
    <div class="brand"><span class="brand-mark">O</span>Optimus</div>
    <div style="display:flex;flex-direction:column;gap:16px">
      <h1>Every task, session and KPI in one place.</h1>
      <p>Optimus is Reverentia's daily work management system. Everyone sees what to do, by when, and where to update it.</p>
    </div>
    <div class="login-promise">
      <div><b>One source of truth</b>Tasks, sessions, faculty, students and KPIs</div>
      <div><b>Private where it matters</b>Honorariums visible only to Rajiv and Neha</div>
    </div></section>`;
}
function screen(inner) {
  root.innerHTML = `<div class="login">${art()}<section class="login-form"><div class="login-card">${inner}</div></section></div>`;
}
function message(title, body, withSignOut = true) {
  screen(`<div><div class="eyebrow">Optimus</div><h2 style="margin-top:6px">${esc(title)}</h2></div><p style="color:var(--ink-2);margin:0">${body}</p>
    ${withSignOut ? '<button class="btn" id="so" style="align-self:flex-start">Sign out</button>' : ''}`);
  const so = document.getElementById('so'); if (so) so.onclick = signOut;
}
async function signOut() { await sb.auth.signOut(); location.reload(); }

function loginForm(err = '') {
  screen(`<div><div class="eyebrow">Masters' Union · School of Family Business</div><h2 style="margin-top:6px">Sign in to Optimus</h2></div>
    <form id="lf" style="display:flex;flex-direction:column;gap:12px">
      <div class="field"><label for="le">Work email</label><input id="le" type="email" autocomplete="username" required></div>
      <div class="field"><label for="lp">Password</label><input id="lp" type="password" autocomplete="current-password" required></div>
      <span class="sc-err" id="lerr">${esc(err)}</span>
      <button class="btn primary" type="submit" style="justify-content:center;padding:10px">Sign in</button>
    </form>
    <p class="demo-note">No account yet, or forgot your password? Ask your Optimus admin to add or reset you.</p>`);
  document.getElementById('lf').onsubmit = async e => {
    e.preventDefault();
    const btn = e.target.querySelector('button'); btn.disabled = true; btn.textContent = 'Signing in…';
    const { error } = await sb.auth.signInWithPassword({ email: document.getElementById('le').value.trim(), password: document.getElementById('lp').value });
    if (error) loginForm(error.message === 'Invalid login credentials' ? 'That email and password do not match.' : error.message);
    else start();
  };
}

async function start() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return loginForm();
  message('Loading your workspace…', 'One moment.', false);
  let ws;
  try { ws = await loadWorkspace(session.user.email); }
  catch (e) { console.error(e); return message('Could not load Optimus', esc(e.message) + '<br>Check that the database setup script has been run in Supabase.'); }
  if (!ws.me) return message('You are not on the team list yet', `You are signed in as <b>${esc(session.user.email)}</b>, but that email is not in Optimus's team list. Ask your admin to add it.`);
  bootOptimus({
    demo: false, status: '', me: ws.me.key, members: ws.members, rows: ws.rows, audit: ws.audit,
    signOut, saveRows, addAudit, upload, fileUrl, fileBlob
  });
}

if (configured) {
  sb.auth.onAuthStateChange(ev => { if (ev === 'SIGNED_OUT') location.reload(); });
  start();
} else {
  // No Supabase keys: run the original preview with sample data in memory.
  bootOptimus({ demo: true });
}
