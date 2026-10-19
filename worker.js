const COOKIE = 'sl_rsvp';

function reply(value, status = 200, id) {
  const headers = new Headers({'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow'});
  if (id) headers.set('Set-Cookie', COOKIE + '=' + id + '; Path=/weddingsamuelledy/api/rsvp; Max-Age=31536000; Secure; HttpOnly; SameSite=Strict');
  return new Response(JSON.stringify(value), {status, headers});
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
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
