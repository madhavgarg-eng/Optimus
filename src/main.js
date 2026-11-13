import './style.css';
import { configured, sb, loadWorkspace, saveRows, addAudit, upload, fileUrl, fileBlob, saveMember, removeMember, requestAccess, declineRequest, clearRequest } from './db.js';
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
      <div><b>Private where it matters</b>Honorariums visible only to people you allow</div>
    </div></section>`;
}
function screen(inner) {
  root.innerHTML = `<div class="login">${art()}<section class="login-form"><div class="login-card">${inner}</div></section></div>`;
  const card = root.querySelector('.login-card'), on = () => document.documentElement.hasAttribute('data-easy');
  card.insertAdjacentHTML('beforeend', `<button class="btn ghost sm" id="easy" type="button" aria-pressed="${on()}" style="align-self:flex-start;padding-left:0">Easy reading: ${on() ? 'on' : 'off'} (larger text, stronger contrast)</button>`);
  document.getElementById('easy').onclick = e => {
    const r = document.documentElement; if (on()) r.removeAttribute('data-easy'); else r.setAttribute('data-easy', '');
    try { localStorage.setItem('optimus-easy', on() ? '1' : '0'); } catch (_) {}
    e.target.setAttribute('aria-pressed', on()); e.target.textContent = `Easy reading: ${on() ? 'on' : 'off'} (larger text, stronger contrast)`;
  };
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
    <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap"><button class="btn ghost sm" style="padding-left:0" id="go-setup" type="button">First time here? Set up your account</button><button class="btn ghost sm" style="padding-right:0" id="go-forgot" type="button">Forgot password?</button></div>`);
  document.getElementById('go-setup').onclick = () => setupForm();
  document.getElementById('go-forgot').onclick = () => forgotForm();
  document.getElementById('lf').onsubmit = async e => {
    e.preventDefault();
    const btn = e.target.querySelector('button'); btn.disabled = true; btn.textContent = 'Signing in…';
    const { error } = await sb.auth.signInWithPassword({ email: document.getElementById('le').value.trim(), password: document.getElementById('lp').value });
    if (error) loginForm(error.message === 'Invalid login credentials' ? 'That email and password do not match.' : error.message);
    else start();
  };
}

const emailOk = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
function setupForm(err = '') {
  screen(`<div><div class="eyebrow">Optimus</div><h2 style="margin-top:6px">Set up your account</h2></div>
    <p style="color:var(--ink-2);margin:0">Create your account with your work email. The DWM owner approves new accounts before you can see anything.</p>
    <form id="sf" style="display:flex;flex-direction:column;gap:12px">
      <div class="field"><label for="sn">Full name</label><input id="sn" autocomplete="name" required></div>
      <div class="field"><label for="se">Work email</label><input id="se" type="email" autocomplete="username" required></div>
      <div class="field"><label for="sp">New password (at least 8 characters)</label><input id="sp" type="password" autocomplete="new-password" minlength="8" required></div>
      <div class="field"><label for="sp2">Repeat password</label><input id="sp2" type="password" autocomplete="new-password" required></div>
      <span class="sc-err">${esc(err)}</span>
      <button class="btn primary" type="submit" style="justify-content:center;padding:10px">Create account</button>
    </form>
    <button class="btn ghost sm" style="align-self:flex-start;padding-left:0" id="back" type="button">Back to sign in</button>`);
  document.getElementById('back').onclick = () => loginForm();
  document.getElementById('sf').onsubmit = async e => {
    e.preventDefault();
    const name = document.getElementById('sn').value.trim(), email = document.getElementById('se').value.trim().toLowerCase(), p1 = document.getElementById('sp').value, p2 = document.getElementById('sp2').value;
    if (!name) return setupForm('Enter your full name.');
    if (!emailOk(email)) return setupForm('Enter a valid email.');
    if (p1.length < 8) return setupForm('Use at least 8 characters.');
    if (p1 !== p2) return setupForm('The two passwords do not match.');
    const btn = e.target.querySelector('button[type=submit]'); btn.disabled = true; btn.textContent = 'Creating…';
    const { data, error } = await sb.auth.signUp({ email, password: p1, options: { emailRedirectTo: location.origin, data: { name } } });
    if (error) return setupForm(/signups not allowed|disabled/i.test(error.message) ? 'Account set-up is switched off. Ask the DWM owner to turn on sign-ups in Supabase.' : error.message);
    if (data.session) return start();
    message('Check your email', `We sent a confirmation link to <b>${esc(email)}</b>. Click it, then sign in with your new password. The DWM owner then approves your account. If nothing arrives in a few minutes, check spam or ask the DWM owner.`, false);
    root.querySelector('.login-card').insertAdjacentHTML('beforeend', '<button class="btn" id="bk" style="align-self:flex-start">Back to sign in</button>');
    document.getElementById('bk').onclick = () => loginForm();
  };
}
function forgotForm(err = '') {
  screen(`<div><div class="eyebrow">Optimus</div><h2 style="margin-top:6px">Reset your password</h2></div>
    <form id="ff" style="display:flex;flex-direction:column;gap:12px">
      <div class="field"><label for="fe">Work email</label><input id="fe" type="email" autocomplete="username" required></div>
      <span class="sc-err">${esc(err)}</span>
      <button class="btn primary" type="submit" style="justify-content:center;padding:10px">Send reset link</button>
    </form>
    <button class="btn ghost sm" style="align-self:flex-start;padding-left:0" id="back" type="button">Back to sign in</button>`);
  document.getElementById('back').onclick = () => loginForm();
  document.getElementById('ff').onsubmit = async e => {
    e.preventDefault();
    const email = document.getElementById('fe').value.trim();
    if (!emailOk(email)) return forgotForm('Enter a valid email.');
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin });
    if (error) return forgotForm(error.message);
    message('Check your email', `If <b>${esc(email)}</b> has an Optimus account, a reset link is on its way. Open it on this device.`, false);
  };
}
function newPasswordForm(err = '') {
  screen(`<div><div class="eyebrow">Optimus</div><h2 style="margin-top:6px">Choose a new password</h2></div>
    <form id="np" style="display:flex;flex-direction:column;gap:12px">
      <div class="field"><label for="n1">New password (at least 8 characters)</label><input id="n1" type="password" autocomplete="new-password" required></div>
      <div class="field"><label for="n2">Repeat password</label><input id="n2" type="password" autocomplete="new-password" required></div>
      <span class="sc-err">${esc(err)}</span>
      <button class="btn primary" type="submit" style="justify-content:center;padding:10px">Save password</button>
    </form>`);
  document.getElementById('np').onsubmit = async e => {
    e.preventDefault();
    const p1 = document.getElementById('n1').value, p2 = document.getElementById('n2').value;
    if (p1.length < 8) return newPasswordForm('Use at least 8 characters.');
    if (p1 !== p2) return newPasswordForm('The two passwords do not match.');
    const { error } = await sb.auth.updateUser({ password: p1 });
    if (error) return newPasswordForm(error.message);
    history.replaceState(null, '', location.pathname);
    start();
  };
}

// Signed in, but not on the team yet: send a request to the DWM owner and wait.
async function waiting(session, req) {
  const email = session.user.email;
  if (!req) {
    const name = ((session.user.user_metadata || {}).name || '').trim() || email.split('@')[0];
    try { await requestAccess(email, name); req = { status: 'pending' }; }
    catch (e) { console.error(e); return message('Could not send your request', esc(e.message)); }
  }
  if (req.status === 'declined') return message('Your request was declined', `The DWM owner did not approve <b>${esc(email)}</b> for Optimus. If you think this is a mistake, speak to them directly.`);
  message('Waiting for approval', `Your account <b>${esc(email)}</b> is set up. The DWM owner has been asked to approve it and choose your access. You can open Optimus once they do.`);
  const so = document.getElementById('so');
  so.insertAdjacentHTML('beforebegin', '<div style="display:flex;gap:8px" id="wbtns"><button class="btn primary" id="again">Check again</button></div>');
  document.getElementById('wbtns').appendChild(so);
  document.getElementById('again').onclick = () => start();
}

async function start() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return loginForm();
  message('Loading your workspace…', 'One moment.', false);
  let ws;
  try { ws = await loadWorkspace(session.user.email); }
  catch (e) { console.error(e); return message('Could not load Optimus', esc(e.message) + '<br>Check that the database setup script has been run in Supabase.'); }
  if (!ws.me) return waiting(session, ws.request);
  bootOptimus({
    demo: false, status: '', me: ws.me.key, members: ws.members, rows: ws.rows, audit: ws.audit,
    requests: ws.requests || [],
    signOut, saveRows, addAudit, upload, fileUrl, fileBlob, saveMember, removeMember, declineRequest, clearRequest
  });
}

if (configured) {
  sb.auth.onAuthStateChange(ev => {
    if (ev === 'SIGNED_OUT') location.reload();
    if (ev === 'PASSWORD_RECOVERY') newPasswordForm();
  });
  if (window.__recovery) newPasswordForm(); else start();
} else {
  // No Supabase keys: run the original preview with sample data in memory.
  bootOptimus({ demo: true });
}
