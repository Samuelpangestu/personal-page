const COOKIE = 'sl_rsvp';
const INVITE_PATHS = ['/weddingsamuelledy', '/weddingsamuelledy/', '/weddingsamuelledy/index.html', '/weddingsamuelledy/invitation', '/weddingsamuelledy/invitation/'];
// Which event cards each guest type keeps. Links without a guest ID are public, so church only.
const EVENT_SETS = {gereja: ['gereja'], resepsi: ['resepsi'], semua: ['gereja', 'resepsi']};

function reply(value, status = 200, id) {
  const headers = new Headers({'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow'});
  if (id) headers.set('Set-Cookie', COOKIE + '=' + id + '; Path=/weddingsamuelledy/api/rsvp; Max-Age=31536000; Secure; HttpOnly; SameSite=Strict');
  return new Response(JSON.stringify(value), {status, headers});
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (INVITE_PATHS.includes(url.pathname)) {
      return url.searchParams.has('guest') ? guestPage(request, env, url.searchParams.get('guest')) : publicPage(request, env);
    }
    if (url.pathname !== '/weddingsamuelledy/api/rsvp') return env.ASSETS.fetch(request);
    if (!['GET', 'POST'].includes(request.method)) return reply({ok: false}, 405);
    if (request.method === 'POST' && request.headers.get('Origin') !== url.origin) return reply({ok: false}, 403);
    if (!env.RSVP_WEBHOOK_URL || !env.RSVP_SECRET) return reply({ok: false}, 503);
    const cookie = (request.headers.get('Cookie') || '').split(';').map(v => v.trim()).find(v => v.startsWith(COOKIE + '='));
    const savedId = cookie ? cookie.slice(COOKIE.length + 1) : '';
    const id = /^[a-f0-9-]{36}$/.test(savedId) ? savedId : crypto.randomUUID();
    // shortcut: identity is one browser cookie, not an authenticated guest registry.
    // Add signed guest IDs when the invitation supports cross-device guest login.
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(id));
    const payload = {action: request.method === 'GET' ? 'read' : 'save',
      key: Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, '0')).join(''), secret: env.RSVP_SECRET};
    if (request.method === 'POST') {
      if (!request.headers.get('Content-Type')?.startsWith('application/json')) return reply({ok: false}, 415);
      if (Number(request.headers.get('Content-Length')) > 10000) return reply({ok: false}, 413);
      const text = await request.text();
      if (new TextEncoder().encode(text).length > 10000) return reply({ok: false}, 413);
      let body;
      try { body = JSON.parse(text); } catch { return reply({ok: false}, 400); }
      if (!body || typeof body.name !== 'string' || !body.name.trim() || body.name.trim().length > 120 ||
        typeof body.message !== 'string' || body.message.length > 2000 ||
        !['Hadir', 'Tidak Hadir'].includes(body.status) || !Number.isInteger(body.count) ||
        (body.status === 'Hadir' ? body.count < 1 || body.count > 2 : body.count !== 0)) return reply({ok: false}, 400);
      Object.assign(payload, {name: body.name.trim(), invitedName: body.name.trim(), message: body.message.trim(), status: body.status, count: body.count});
    }
    try {
      const response = await fetch(env.RSVP_WEBHOOK_URL, {method: 'POST',
        headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload),
        signal: AbortSignal.timeout(20000), redirect: 'follow'});
      const result = await response.json();
      if (!response.ok || result.ok !== true || (payload.action === 'save' && !result.entry)) throw new Error('Upstream failed');
      return reply({ok: true, entry: result.entry || null}, 200, id);
    } catch {
      return reply({ok: false, error: 'RSVP belum tersimpan. Silakan coba lagi.'}, 502);
    }
  }
};

async function guestPage(request, env, guestId) {
  const headers = {'Cache-Control': 'private, no-store', 'Content-Type': 'text/plain; charset=utf-8', 'X-Robots-Tag': 'noindex, nofollow'};
  if (!/^[a-f0-9]{32}$/.test(guestId || '')) return new Response('Link undangan tidak valid.', {status: 404, headers});
  try {
    if (!env.RSVP_WEBHOOK_URL || !env.RSVP_SECRET) throw new Error('Missing config');
    const response = await fetch(env.RSVP_WEBHOOK_URL, {method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({action: 'guest', guestId, secret: env.RSVP_SECRET}),
      signal: AbortSignal.timeout(20000), redirect: 'follow'});
    const result = await response.json();
    if (!response.ok || result.ok !== true) throw new Error('Lookup failed');
    if (result.name === null) return new Response('Undangan tidak ditemukan. Hubungi Samuel atau Ledy.', {status: 404, headers});
    if (typeof result.name !== 'string' || !result.name.trim() || result.name.length > 120) throw new Error('Invalid name');
    const page = await env.ASSETS.fetch(request);
    if (!page.ok || !page.headers.get('Content-Type')?.includes('text/html')) throw new Error('Page unavailable');
    const events = Object.hasOwn(EVENT_SETS, result.events) ? result.events : 'gereja';
    const personalized = withEvents(new HTMLRewriter().on('html', {
      element(element) { element.setAttribute('data-guest-name', result.name); }
    }), events).transform(page);
    const output = new Response(personalized.body, personalized);
    output.headers.set('Cache-Control', 'private, no-store');
    output.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return output;
  } catch {
    return new Response('Undangan belum dapat dimuat. Silakan muat ulang sebentar lagi.', {status: 503, headers});
  }
}

async function publicPage(request, env) {
  const page = await env.ASSETS.fetch(request);
  if (!page.headers.get('Content-Type')?.includes('text/html')) return page;
  return withEvents(new HTMLRewriter(), 'gereja').transform(page);
}

// Uninvited event cards are removed from the HTML itself, not just hidden.
function withEvents(rewriter, events) {
  const keep = EVENT_SETS[events];
  return rewriter.on('[data-event]', {
    element(element) { if (!keep.includes(element.getAttribute('data-event'))) element.remove(); }
  });
}
