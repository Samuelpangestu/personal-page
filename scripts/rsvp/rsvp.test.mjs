import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';

const source = readFileSync(new URL('../../worker.js', import.meta.url), 'utf8');
const worker = (await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'))).default;
const gas = readFileSync(new URL('../../google-apps-script/Code.gs', import.meta.url), 'utf8');
const env = {RSVP_WEBHOOK_URL: 'https://example.test/exec', RSVP_SECRET: 'test-only-secret', ASSETS: {fetch: () => new Response('asset')}};
const entry = {name: 'Tamu Pengujian', status: 'Hadir', count: 2, message: 'Selamat'};
const req = (body = entry, extra = {}) => new Request('https://invite.test/weddingsamuelledy/api/rsvp', {
  method: 'POST', headers: {'Origin': 'https://invite.test', 'Content-Type': 'application/json', ...extra}, body: JSON.stringify(body)
});
const realFetch = globalThis.fetch;
test.afterEach(() => { globalThis.fetch = realFetch; });

test('worker serves existing pages unchanged and refuses other methods', async () => {
  assert.equal(await (await worker.fetch(new Request('https://invite.test/profile'), env)).text(), 'asset');
  assert.equal((await worker.fetch(new Request('https://invite.test/weddingsamuelledy/api/rsvp', {method: 'DELETE'}), env)).status, 405);
});
test('worker rejects cross-site, invalid counts, status, JSON, and large bodies before writing', async () => {
  globalThis.fetch = () => { throw new Error('must not call upstream'); };
  assert.equal((await worker.fetch(req(entry, {Origin: 'https://evil.test'}), env)).status, 403);
  for (const body of [{...entry, count: 3}, {...entry, count: '2'}, {...entry, status: 'Maybe'}, {...entry, name: ''}, null]) {
    assert.equal((await worker.fetch(req(body), env)).status, 400);
  }
  assert.equal((await worker.fetch(req(entry, {'Content-Type': 'text/plain'}), env)).status, 415);
  assert.equal((await worker.fetch(req({...entry, message: 'x'.repeat(11000)}), env)).status, 413);
});
test('worker forwards a private key, confirms success, and reuses cookie for update/read', async () => {
  const sent = [];
  globalThis.fetch = async (_url, options) => { sent.push(JSON.parse(options.body)); return Response.json({ok: true, entry}); };
  const first = await worker.fetch(req(), env);
  const cookie = first.headers.get('Set-Cookie').split(';')[0];
  assert.match(first.headers.get('Set-Cookie'), /HttpOnly; SameSite=Strict/);
  assert.match(first.headers.get('Cache-Control'), /no-store/);
  assert.equal((await first.json()).ok, true);
  await worker.fetch(req({...entry, status: 'Tidak Hadir', count: 0}, {Cookie: cookie}), env);
  await worker.fetch(new Request('https://invite.test/weddingsamuelledy/api/rsvp', {headers: {Cookie: cookie}}), env);
  assert.equal(sent[0].key, sent[1].key);
  assert.equal(sent[1].key, sent[2].key);
  assert.equal(sent[2].action, 'read');
  assert.equal(sent[0].secret, env.RSVP_SECRET);
  assert.ok(!JSON.stringify(await (await worker.fetch(req(), env)).json()).includes(env.RSVP_SECRET));
});
test('worker returns failure for unavailable config, upstream rejection, invalid JSON and network loss', async () => {
  assert.equal((await worker.fetch(req(), {})).status, 503);
  for (const response of [() => Response.json({ok: false}), () => new Response('<html>login</html>'), () => { throw new Error('offline'); }]) {
    globalThis.fetch = async () => response();
    const result = await worker.fetch(req(), env);
    assert.equal(result.status, 502);
    assert.equal((await result.json()).ok, false);
  }
});

function gasContext() {
  const rows = [['Waktu', 'Nama', 'Kehadiran', 'Jumlah', 'Ucapan', 'Key', 'Nama undangan', 'Dibuat', 'Sumber']];
  let released = 0;
  const sheet = {getLastRow: () => rows.length, getRange: (r, c, h, w) => ({
    getValues: () => rows.slice(r - 1, r - 1 + h).map(row => row.slice(c - 1, c - 1 + w)),
    setValues: values => values.forEach((row, i) => { rows[r - 1 + i] = row; })
  })};
  const context = vm.createContext({console: {error() {}}, Date, Number, JSON,
    LockService: {getScriptLock: () => ({waitLock() {}, releaseLock() {released++;}})},
    PropertiesService: {getScriptProperties: () => ({getProperty: key => ({RSVP_SECRET: 'test-only-secret', SPREADSHEET_ID: 'fake-sheet'})[key]})},
    SpreadsheetApp: {openById: () => ({getSheetByName: () => sheet}), flush() {}},
    ContentService: {MimeType: {JSON: 'json'}, createTextOutput: text => ({setMimeType: () => JSON.parse(text)})}
  });
  vm.runInContext(gas, context);
  return {context, rows, released: () => released, call: body => context.doPost({postData: {contents: JSON.stringify(body)}})};
}
const payload = {...entry, action: 'save', key: 'a'.repeat(64), invitedName: 'Tamu Pengujian', secret: 'test-only-secret'};
test('Sheets writes one row, updates attendance/count without duplication, and reads only matching key', () => {
  const g = gasContext();
  assert.equal(g.call(payload).ok, true);
  assert.equal(g.rows.length, 2);
  const created = g.rows[1][7];
  assert.equal(g.call({...payload, status: 'Tidak Hadir', count: 0}).ok, true);
  assert.equal(g.rows.length, 2);
  assert.equal(g.rows[1][2], 'Tidak Hadir');
  assert.equal(g.rows[1][3], 0);
  assert.equal(g.rows[1][7], created);
  assert.equal(g.call({...payload, action: 'read'}).entry.status, 'Tidak Hadir');
  assert.equal(g.call({...payload, action: 'read', key: 'b'.repeat(64)}).entry, null);
  assert.equal(g.released(), 4);
});
test('attendance without wishes is saved and adding wishes later updates the same row', async () => {
  const g = gasContext();
  globalThis.fetch = async (_url, options) => Response.json(g.call(JSON.parse(options.body)));
  const saved = await worker.fetch(req({...entry, message: ''}), env);
  assert.equal(saved.status, 200);
  const cookie = saved.headers.get('Set-Cookie').split(';')[0];
  assert.equal((await saved.json()).entry.message, '');
  assert.equal(g.rows[1][2], 'Hadir');
  assert.equal(g.rows[1][3], 2);
  assert.equal(g.rows[1][4], '');
  const changed = await worker.fetch(req({...entry, message: 'Selamat untuk kalian!'}, {Cookie: cookie}), env);
  assert.equal(changed.status, 200);
  assert.equal(g.rows.length, 2);
  assert.equal(g.rows[1][4], 'Selamat untuk kalian!');
});
test('Sheets rejects unauthorized/invalid requests and prevents spreadsheet formula injection', () => {
  const g = gasContext();
  for (const bad of [{...payload, secret: 'wrong'}, {...payload, count: -1}, {...payload, status: 'x'}, {...payload, key: ''}]) assert.equal(g.call(bad).ok, false);
  assert.equal(g.rows.length, 1);
  assert.equal(g.call({...payload, name: '=IMPORTXML("x")', message: '+cmd'}).ok, true);
  assert.match(g.rows[1][1], /^'=/);
  assert.match(g.rows[1][4], /^'\+/);
});
test('Sheets fills the first empty data row even when summary cells extend getLastRow', () => {
  const g = gasContext();
  for (let i = 0; i < 4; i++) g.rows.push(Array(9).fill(''));
  assert.equal(g.call(payload).ok, true);
  assert.equal(g.rows[1][1], payload.name);
  assert.equal(g.rows.length, 5);
});
test('Sheets does not release a lock it failed to acquire', () => {
  const g = gasContext();
  g.context.LockService.getScriptLock = () => ({waitLock() {throw new Error('busy');}, releaseLock() {throw new Error('must not release');}});
  assert.equal(g.call(payload).ok, false);
  assert.equal(g.rows.length, 1);
});

const client = createRequire(import.meta.url)('../../js/rsvp.js');
test('browser client accepts confirmed response and rejects HTTP, logical and network failures', async () => {
  globalThis.fetch = async (_url, options) => {
    assert.equal(options.credentials, 'same-origin');
    assert.equal(options.method, 'POST');
    return Response.json({ok: true, entry});
  };
  assert.deepEqual(await client.save(entry), entry);
  for (const response of [() => Response.json({ok: false}), () => Response.json({ok: true}, {status: 503}), () => {throw new Error('offline');}]) {
    globalThis.fetch = async () => response();
    await assert.rejects(client.save(entry), /belum tersimpan/);
  }
});
