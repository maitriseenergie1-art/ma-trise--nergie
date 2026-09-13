import { timingSafeEqual } from 'node:crypto';

export function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extraHeaders },
  });
}

export function safeEqual(a = '', b = '') {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

// Bearer token check against ADMIN_ACCESS_CODE.
export function isAuthorized(req) {
  const code = process.env.ADMIN_ACCESS_CODE;
  if (!code) return false;
  const header = req.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : header;
  return safeEqual(token, code);
}

export function requireAuth(req) {
  if (!isAuthorized(req)) return json({ error: 'unauthorized' }, 401);
  return null;
}

export async function readJson(req) {
  try {
    return await req.json();
  } catch {
    return null;
  }
}
