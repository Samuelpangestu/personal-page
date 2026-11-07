import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '../haribahagia/vendor/supabase-2.119.0.js';
import { makeAuthController, makeStorage, safeError, STORAGE_KEY, CALLBACK_URL, SUPABASE_URL, PUBLISHABLE_KEY } from '../haribahagia/auth.mjs';

function memory() {
  const values = new Map();
  return { getItem: k => values.get(k) ?? null, setItem: (k,v) => values.set(k,v), removeItem: k => values.delete(k), key: i => [...values.keys()][i] ?? null, get length() { return values.size; } };
}
function page(href) {
  const location = { href, assign(url) { this.destination = url; } };
  const history = { replaceState(_state,_title,url) { location.href = new URL(url, location.href).href; } };
  return { location, history };
}
const user = { id: '00000000-0000-4000-8000-000000000001', email: 'qa@example.invalid', aud: 'authenticated', app_metadata: {}, user_metadata: {} };
const access = `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify({ sub: user.id, exp: Math.floor(Date.now()/1000)+3600 })).toString('base64url')}.synthetic-signature`;
const session = { access_token: access, refresh_token: 'synthetic-refresh', token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now()/1000)+3600, user };

test('real SDK: callback once, verified session, fresh-client restore, refresh and local logout', async () => {
  const storage = memory();
  const clients = [];
  let exchanges = 0;
  let refreshes = 0;
  const http = async (input, init) => {
    const request = new Request(input,init);
    const url = new URL(request.url);
    assert.equal(url.origin, SUPABASE_URL);
    if (url.pathname === '/auth/v1/user') return Response.json(user);
    if (url.pathname === '/auth/v1/logout') return new Response(null,{status:204});
    assert.equal(url.pathname, '/auth/v1/token');
    const body = await request.json();
    if (url.searchParams.get('grant_type') === 'pkce') {
      exchanges++;
      assert.equal(body.auth_code, 'synthetic-code');
      assert.ok(body.code_verifier);
      return Response.json(session);
    }
    assert.equal(url.searchParams.get('grant_type'),'refresh_token');
    refreshes++;
    return Response.json({...session,refresh_token:'synthetic-rotated'});
  };
  const makeClient = () => {
    const c = createClient(SUPABASE_URL,PUBLISHABLE_KEY,{global:{fetch:http},auth:{flowType:'pkce',storageKey:STORAGE_KEY,storage:makeStorage(storage),detectSessionInUrl:false,autoRefreshToken:false}});
    clients.push(c); return c;
  };
  try {
    const first = makeClient();
    const prepared = await first.auth.signInWithOAuth({provider:'google',options:{redirectTo:CALLBACK_URL,skipBrowserRedirect:true}});
    assert.equal(prepared.error,null);
    const redirect = new URL(new URL(prepared.data.url).searchParams.get('redirect_to'));
    const flow = redirect.searchParams.get('sb_flow_id');
    const context = page(CALLBACK_URL+'?code=synthetic-code'+(flow?'&sb_flow_id='+encodeURIComponent(flow):''));
    const controller = makeAuthController(first,storage,context.location,context.history);
    const both = await Promise.all([controller.initialize(),controller.initialize()]);
    assert.equal(exchanges,1);
    assert.equal(both[0].email,user.email);
    assert.equal(new URL(context.location.href).searchParams.has('code'),false);
    assert.equal(controller.facts().verified,true);
    assert.equal(controller.facts().sessionStored,true);
    await first.auth.dispose();
    const reopened=makeClient();
    const next=page(CALLBACK_URL.replace('/callback','/'));
    const restored=makeAuthController(reopened,storage,next.location,next.history);
    assert.equal((await restored.initialize()).email,user.email);
    assert.equal(exchanges,1);
    assert.equal((await reopened.auth.refreshSession()).error,null);
    assert.equal(refreshes,1);
    await restored.logout();
    assert.equal(storage.getItem(STORAGE_KEY),null);
    await reopened.auth.dispose();
    const loggedOut=makeClient();
    assert.equal(await makeAuthController(loggedOut,storage,next.location,next.history).initialize(),null);
  } finally { for(const c of clients) await c.auth.dispose(); }
});

test('Google starts once and redirects in the initiating tab to the exact callback', async () => {
  let calls=0;
  const context=page('https://samuelpgt.com/haribahagia/');
  const client={auth:{async signInWithOAuth(args){ calls++; assert.equal(args.options.redirectTo,CALLBACK_URL); return {data:{url:SUPABASE_URL+'/auth/v1/authorize?provider=google'},error:null}; }}};
  const controller=makeAuthController(client,memory(),context.location,context.history);
  await Promise.all([controller.google(),controller.google()]);
  assert.equal(calls,1);
  assert.equal(new URL(context.location.destination).origin,SUPABASE_URL);
});

test('OAuth errors clear credentials and never echo upstream descriptions', async () => {
  const context=page(CALLBACK_URL+'?error=access_denied&error_description=synthetic-secret');
  const controller=makeAuthController({auth:{}},memory(),context.location,context.history);
  await assert.rejects(controller.initialize(),/oauth_cancelled/);
  assert.equal(new URL(context.location.href).search,'');
  assert.ok(!safeError({message:'synthetic-secret'}).includes('synthetic-secret'));
  assert.equal(safeError({code:'bad_code_verifier'}).includes('Mulai login'),true);
});

test('failed exchange does not show a session, and removes code from address', async () => {
  let calls=0;
  const client={auth:{async exchangeCodeForSession(){calls++;return {error:{code:'flow_state_expired'}};}}};
  const context=page(CALLBACK_URL+'?code=synthetic-expired');
  const controller=makeAuthController(client,memory(),context.location,context.history);
  await assert.rejects(controller.initialize());
  assert.equal(calls,1);
  assert.equal(controller.facts().callbackExchange,'gagal');
  assert.equal(controller.facts().verified,false);
  assert.equal(new URL(context.location.href).search,'');
});

test('unwritable storage and failed logout surface failure', async () => {
  const broken={getItem:()=>null,setItem(){},removeItem(){}};
  assert.throws(()=>makeStorage(broken).setItem('k','v'),/storage_unavailable/);
  const context=page(CALLBACK_URL);
  const controller=makeAuthController({auth:{async signOut(){return {error:new Error('offline')};}}},memory(),context.location,context.history);
  await assert.rejects(controller.logout(),/offline/);
});
