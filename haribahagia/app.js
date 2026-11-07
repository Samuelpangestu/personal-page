import { createClient } from './vendor/supabase-2.119.0.js';
import { CALLBACK_URL, STORAGE_KEY, SUPABASE_URL, PUBLISHABLE_KEY, makeStorage, makeAuthController, safeError } from './auth.mjs';

const el = id => document.getElementById(id);
async function boot() {
const client = createClient(SUPABASE_URL, PUBLISHABLE_KEY, {
  auth: { flowType: 'pkce', detectSessionInUrl: false, persistSession: true, autoRefreshToken: true, storageKey: STORAGE_KEY, storage: makeStorage(window.localStorage) },
});
const controller = makeAuthController(client, window.localStorage, window.location, window.history);
let ready = false;
let signedIn = false;
function diagnostics() {
  const facts = controller.facts();
  const rows = [
    ['Versi', facts.build], ['Callback HTTPS', CALLBACK_URL], ['Key sesi', facts.storageKey], ['Key penanda PKCE', facts.verifierKey],
    ['Penyimpanan dapat dibaca', facts.storageReadable], ['Sesi tersimpan', facts.sessionStored],
    ['Penanda PKCE ada', facts.verifierStored], ['Penukaran callback', facts.callbackExchange], ['Akun diverifikasi ke server', facts.verified],
  ];
  el('facts').replaceChildren(...rows.flatMap(([label, value]) => {
    const dt = document.createElement('dt'); dt.textContent = label;
    const dd = document.createElement('dd'); dd.textContent = typeof value === 'boolean' ? (value ? 'Ya' : 'Tidak') : value;
    return [dt, dd];
  }));
}
function render(user) {
  signedIn = !!user;
  el('heading').textContent = user ? 'Login berhasil' : 'Masuk ke HariBahagia';
  el('account').textContent = user?.email || '';
  el('login').hidden = !!user;
  el('session').hidden = !user;
  diagnostics();
}
function message(text, error = false) { el('status').textContent = text; el('status').dataset.error = String(error); }
async function perform(action) {
  document.querySelectorAll('button').forEach(button => button.disabled = true);
  message('Memproses…');
  try { await action(); message(''); }
  catch (error) { message(safeError(error), true); }
  finally { document.querySelectorAll('button').forEach(button => button.disabled = false); diagnostics(); }
}
el('google').addEventListener('click', () => perform(() => controller.google()));
el('email-form').addEventListener('submit', event => {
  event.preventDefault();
  perform(async () => {
    try { render(await controller.email(el('email').value, el('password').value)); }
    finally { el('password').value = ''; }
  });
});
el('logout').addEventListener('click', () => perform(async () => { await controller.logout(); render(null); }));
el('reload').addEventListener('click', () => location.reload());
el('diagnostics').addEventListener('toggle', diagnostics);

try { render(await controller.initialize()); }
catch (error) { render(null); message(safeError(error), true); }
finally { ready = true; }
client.auth.onAuthStateChange((event, session) => {
  if (!ready) return;
  if (event === 'SIGNED_OUT') render(null);
  if (event === 'SIGNED_IN' && session && !signedIn) location.reload();
});
}
try { await boot(); }
catch {
  el('heading').textContent = 'Login belum tersedia';
  el('status').textContent = 'Penyimpanan atau modul login belum tersedia. Izinkan penyimpanan situs, lalu muat ulang halaman.';
  el('status').dataset.error = 'true';
}
