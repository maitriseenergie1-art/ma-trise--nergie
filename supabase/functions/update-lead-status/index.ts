import { createClient } from 'npm:@supabase/supabase-js@2';
import { hasValidInternalApiKey } from '../_shared/internalAuth.ts';
import { validateStatusUpdate } from '../_shared/leadStatus.ts';

const MAX_BODY_BYTES = 4_000;

type JsonBody = Record<string, unknown>;

function json(body: JsonBody, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

function serverKey() {
  const legacyKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (legacyKey) return legacyKey;
  try {
    return JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}').default || null;
  } catch {
    return null;
  }
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') return json({ ok: false, error: 'METHOD_NOT_ALLOWED' }, 405);

  const internalApiKey = Deno.env.get('LEAD_STATUS_API_KEY') || null;
  if (!hasValidInternalApiKey(request.headers.get('x-lead-admin-key'), internalApiKey)) {
    return json({ ok: false, error: 'UNAUTHORIZED' }, 401);
  }

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) return json({ ok: false, error: 'PAYLOAD_TOO_LARGE' }, 413);

  let payload: unknown;
  try {
    const body = await request.text();
    if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) return json({ ok: false, error: 'PAYLOAD_TOO_LARGE' }, 413);
    payload = JSON.parse(body);
  } catch {
    return json({ ok: false, error: 'INVALID_JSON' }, 400);
  }

  const validation = validateStatusUpdate(payload);
  if (!validation.ok) return json({ ok: false, error: validation.code, field: validation.field }, 400);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = serverKey();
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('update lead status configuration error', { code: 'MISSING_SERVER_CONFIG' });
    return json({ ok: false, error: 'INTERNAL_ERROR' }, 500);
  }

  const { leadId, status, lostReason } = validation.value;
  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data, error } = await supabase.rpc('update_lead_status', {
    p_lead_id: leadId,
    p_new_status: status,
    p_lost_reason: lostReason,
  });

  if (error) {
    if (error.code === '22023' || error.code === 'P0001') {
      console.info('update lead status rejected', { leadId, status, code: error.code });
      return json({ ok: false, error: 'INVALID_TRANSITION' }, 409);
    }
    console.error('update lead status database error', { leadId, status, code: error.code || 'UNKNOWN' });
    return json({ ok: false, error: 'INTERNAL_ERROR' }, 500);
  }

  if (!Array.isArray(data) || !data[0]?.lead_id) return json({ ok: false, error: 'LEAD_NOT_FOUND' }, 404);

  const result = data[0] as { lead_id: string; previous_status: string; current_status: string };
  console.info('lead status updated', { leadId: result.lead_id, from: result.previous_status, to: result.current_status });
  return json({ ok: true, leadId: result.lead_id, previousStatus: result.previous_status, status: result.current_status }, 200);
});
