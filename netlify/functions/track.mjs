import { admin, supabaseConfigured } from './_lib/supabaseAdmin.mjs';
import { classifyTraffic } from './_lib/referrer.mjs';
import { json, readJson } from './_lib/http.mjs';

export const config = { path: '/api/track' };

const EVENT_TYPES = new Set(['page_view', 'click', 'form_view', 'form_submit']);
const BOT_RE = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|headless|lighthouse|pagespeed|gtmetrix|monitor/i;

function hostOf(value) {
  if (!value) return null;
  try {
    return new URL(value).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204 });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  if (!supabaseConfigured) return json({ ok: false }, 200); // Never break the site.

  const body = await readJson(req);
  if (!body || !EVENT_TYPES.has(body.type) || !body.path) return json({ ok: false }, 202);

  const ua = req.headers.get('user-agent') || '';
  const isBot = BOT_RE.test(ua);

  const cls = classifyTraffic({
    referrer: body.referrer,
    landingUrl: body.landingUrl || body.path,
    utmSource: body.utmSource,
    utmMedium: body.utmMedium,
  });

  const row = {
    event_type: body.type,
    session_id: typeof body.sessionId === 'string' ? body.sessionId.slice(0, 64) : null,
    path: String(body.path).slice(0, 512),
    title: body.title ? String(body.title).slice(0, 300) : null,
    target: body.target ? String(body.target).slice(0, 300) : null,
    target_kind: body.targetKind ? String(body.targetKind).slice(0, 40) : null,
    referrer: body.referrer ? String(body.referrer).slice(0, 1000) : null,
    referrer_host: hostOf(body.referrer),
    source: cls.source,
    source_label: cls.label,
    source_group: cls.group,
    utm_source: body.utmSource ?? null,
    utm_medium: body.utmMedium ?? null,
    utm_campaign: body.utmCampaign ?? null,
    utm_term: body.utmTerm ?? null,
    utm_content: body.utmContent ?? null,
    device: body.device ? String(body.device).slice(0, 20) : null,
    country: req.headers.get('x-nf-geo-country') || req.headers.get('x-country') || null,
    is_bot: isBot,
  };

  const { error } = await admin.from('traffic_events').insert(row);
  if (error) console.warn('[track]', error.message);
  return json({ ok: !error }, 202);
}
