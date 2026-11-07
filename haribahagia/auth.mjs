export const SUPABASE_URL = 'https://pjdkdbzbkxnpgthlqgta.supabase.co';
export const PUBLISHABLE_KEY = 'sb_publishable_a9PmtTTCrYiwgJcypGyXbw_a8nx1DDJ';
export const CALLBACK_URL = 'https://samuelpgt.com/haribahagia/callback';
export const STORAGE_KEY = 'haribahagia-web-auth-v1';
export const BUILD = 'haribahagia-web-2026-11-08';

export function makeStorage(storage) {
  return {
    getItem: key => storage.getItem(key),
    setItem(key, value) {
      storage.setItem(key, value);
      if (storage.getItem(key) !== value) throw new Error('storage_unavailable');
    },
    removeItem: key => storage.removeItem(key),
  };
}

export function safeError(error) {
  const code = error?.code;
  if (code === 'bad_code_verifier' || code === 'flow_state_not_found' || code === 'flow_state_expired') {
    return 'Kode login tidak cocok dengan percobaan ini, sudah dipakai, atau kedaluwarsa. Mulai login Google lagi di browser ini.';
  }
  if (code === 'invalid_credentials') return 'Email atau kata sandi tidak sesuai.';
  if (code === 'email_not_confirmed') return 'Konfirmasikan email terlebih dahulu.';
  if (error?.message === 'oauth_cancelled') return 'Login Google dibatalkan atau ditolak. Silakan coba lagi.';
  if (error?.message === 'storage_unavailable') return 'Penyimpanan browser tidak tersedia. Izinkan penyimpanan situs lalu coba lagi.';
  if (error?.status === 0 || error instanceof TypeError || error?.name === 'AuthRetryableFetchError') {
    return 'Supabase belum dapat dijangkau. Periksa koneksi lalu coba lagi.';
  }
  return 'Login belum berhasil. Mulai ulang dari tombol Google atau coba email yang sudah terdaftar.';
}

// Each page has one initialization owner; callback and session restore never race.
export function makeAuthController(client, storage, location, history) {
  let initializing;
  let starting = false;
  let callbackExchange = 'belum dicoba';
  let verified = false;
  function facts() {
    let sessionStored = false;
    let verifierStored = false;
    let storageReadable = true;
    try {
      sessionStored = !!storage.getItem(STORAGE_KEY);
      verifierStored = !!storage.getItem(`${STORAGE_KEY}-code-verifier`);
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key?.startsWith(`${STORAGE_KEY}-flow-`) && key.endsWith('-code-verifier')) verifierStored = true;
      }
    } catch { storageReadable = false; }
    return { build: BUILD, callback: CALLBACK_URL, storageKey: STORAGE_KEY, verifierKey: `${STORAGE_KEY}-code-verifier`, storageReadable, sessionStored, verifierStored, callbackExchange, verified };
  }
  function clearCallback() {
    const url = new URL(location.href);
    for (const key of ['code', 'sb_flow_id', 'error', 'error_code', 'error_description']) url.searchParams.delete(key);
    history.replaceState(null, '', url.pathname + url.search);
  }
  async function verify() {
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    if (!data.session) { verified = false; return null; }
    const result = await client.auth.getUser();
    if (result.error) throw result.error;
    if (!result.data.user?.id || !storage.getItem(STORAGE_KEY)) throw new Error('storage_unavailable');
    verified = true;
    return { email: result.data.user.email || 'Akun terverifikasi' };
  }
  return {
    facts,
    initialize() {
      if (!initializing) initializing = (async () => {
        const url = new URL(location.href);
        if (url.searchParams.has('error')) {
          clearCallback();
          throw new Error('oauth_cancelled');
        }
        const code = url.searchParams.get('code');
        if (code) {
          callbackExchange = 'diproses';
          try {
            const flowId = url.searchParams.get('sb_flow_id');
            const result = await client.auth.exchangeCodeForSession(code, flowId ? { flowId } : undefined);
            if (result.error) throw result.error;
            callbackExchange = 'berhasil';
          } catch (error) { callbackExchange = 'gagal'; throw error; }
          finally { clearCallback(); }
        }
        return verify();
      })();
      return initializing;
    },
    async google() {
      if (starting) return;
      starting = true;
      try {
        const { data, error } = await client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: CALLBACK_URL, skipBrowserRedirect: true } });
        if (error) throw error;
        const target = new URL(data.url);
        if (target.origin !== SUPABASE_URL || target.pathname !== '/auth/v1/authorize') throw new Error('invalid_authorize_url');
        location.assign(target.href);
      } catch (error) { starting = false; throw error; }
    },
    async email(email, password) {
      const result = await client.auth.signInWithPassword({ email: email.trim(), password });
      if (result.error) throw result.error;
      return verify();
    },
    async logout() {
      const { error } = await client.auth.signOut({ scope: 'local' });
      if (error) throw error;
      if (storage.getItem(STORAGE_KEY)) throw new Error('storage_unavailable');
      verified = false;
    },
  };
}
