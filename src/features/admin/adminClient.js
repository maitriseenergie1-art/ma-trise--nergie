const TOKEN_KEY = 'me-admin-code';

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export const getToken = () => {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
};

export const setToken = (value) => {
  try {
    sessionStorage.setItem(TOKEN_KEY, value);
  } catch {
    /* storage unavailable */
  }
};

export const clearToken = () => {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable */
  }
};

export async function api(path, { method = 'GET', body, form } = {}) {
  const headers = { authorization: `Bearer ${getToken()}` };
  let payload;
  if (form) {
    payload = form;
  } else if (body !== undefined) {
    headers['content-type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(`/api/admin${path}`, { method, headers, body: payload });
  } catch (error) {
    throw new ApiError('Serveur d’administration injoignable (fonctions Netlify non déployées ?).', 0, error);
  }

  if (res.status === 401) {
    clearToken();
    throw new ApiError('Code d’accès refusé.', 401);
  }

  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  const data = isJson ? await res.json().catch(() => ({})) : {};
  if (!isJson) {
    throw new ApiError(
      'Réponse inattendue du serveur d’administration. Lancez le site avec « netlify dev » (les fonctions Netlify ne tournent pas sous « vite » seul).',
      res.status,
    );
  }
  if (!res.ok) {
    throw new ApiError(data.message || data.error || `Erreur ${res.status}`, res.status, data);
  }
  return data;
}

export async function checkCode(code) {
  const res = await fetch('/api/admin/session', {
    headers: { authorization: `Bearer ${code}` },
  }).catch(() => null);
  if (!res || !res.ok) return false;
  // Guard against the SPA fallback returning index.html with a 200.
  return (res.headers.get('content-type') || '').includes('application/json');
}
