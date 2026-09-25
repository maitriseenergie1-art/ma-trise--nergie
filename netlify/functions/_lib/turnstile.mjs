const TURNSTILE_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const MAX_TOKEN_LENGTH = 2048;

function hostnameFrom(value) {
  if (!value || typeof value !== 'string') return null;
  try {
    return new URL(value.includes('://') ? value : `https://${value}`).hostname || null;
  } catch {
    return null;
  }
}

const isLocalHostname = (hostname) => hostname === 'localhost' || hostname === '127.0.0.1';

export function getExpectedTurnstileHostname(req, env = process.env) {
  // Sur Netlify (NETLIFY=true), un SITE_URL resté sur localhost est ignoré au profit de URL (domaine principal).
  const candidates = [env.TURNSTILE_EXPECTED_HOSTNAME, env.SITE_URL, env.VITE_SITE_URL, env.URL]
    .map(hostnameFrom)
    .filter(Boolean);
  const configured = env.NETLIFY ? candidates.find((h) => !isLocalHostname(h)) : candidates[0];
  if (configured) return configured;
  return hostnameFrom(req.headers.get('origin'));
}

// Domaine configuré avec et sans « www. » : Turnstile renvoie le hostname réellement utilisé.
export function getAllowedTurnstileHostnames(req, env = process.env) {
  const hostname = getExpectedTurnstileHostname(req, env);
  if (!hostname) return [];
  if (hostname === 'localhost' || /^[\d.]+$/.test(hostname) || hostname.includes(':')) return [hostname];
  const bare = hostname.replace(/^www\./, '');
  return [bare, `www.${bare}`];
}

export function getClientIp(req) {
  return (
    req.headers.get('x-nf-client-connection-ip')
    || req.headers.get('cf-connecting-ip')
    || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || null
  );
}

export async function verifyTurnstile({
  token,
  expectedAction,
  expectedHostname,
  remoteIp,
  secret = process.env.TURNSTILE_SECRET_KEY,
  fetchImpl = fetch,
}) {
  if (!secret || typeof token !== 'string' || !token || token.length > MAX_TOKEN_LENGTH) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set('remoteip', remoteIp);

  const response = await fetchImpl(TURNSTILE_URL, {
    method: 'POST',
    body,
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) return false;

  const result = await response.json();
  if (!result.success || result.action !== expectedAction) return false;
  const allowed = [expectedHostname].flat().filter(Boolean);
  return !allowed.length || allowed.includes(result.hostname);
}
