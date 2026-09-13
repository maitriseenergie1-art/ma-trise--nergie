import { admin } from '../supabaseAdmin.mjs';
import { json, readJson } from '../http.mjs';

const LOST_REASONS = ['budget', 'timing', 'not_qualified', 'no_response', 'competitor', 'other'];
const STATUSES = ['new', 'to_contact', 'contacted', 'qualified', 'appointment', 'proposal', 'won', 'lost', 'completed'];

const LIST_SELECT =
  'id,created_at,updated_at,status,source_form,first_name,last_name,email,phone,company_name,' +
  'lead_needs(sector,building_type,project_type,solution_slug,project_timeline,qualification_score),' +
  'acquisitions(utm_source,utm_medium,utm_campaign,landing_page,referrer,cta_source,gclid)';

export async function listLeads(url) {
  const type = url.searchParams.get('type');
  const status = url.searchParams.get('status');
  const q = (url.searchParams.get('q') || '').trim();

  let query = admin.from('leads').select(LIST_SELECT).order('created_at', { ascending: false }).limit(500);
  if (type && type !== 'all') query = query.eq('source_form', type);
  if (status && status !== 'all') query = query.eq('status', status);
  if (q) query = query.or(`company_name.ilike.%${q}%,email.ilike.%${q}%,last_name.ilike.%${q}%,first_name.ilike.%${q}%`);

  const { data, error } = await query;
  if (error) return json({ error: error.message }, 500);

  const rows = (data ?? []).map((lead) => {
    const need = lead.lead_needs?.[0] ?? null;
    const acq = lead.acquisitions?.[0] ?? null;
    return {
      id: lead.id,
      createdAt: lead.created_at,
      updatedAt: lead.updated_at,
      status: lead.status,
      sourceForm: lead.source_form,
      name: [lead.first_name, lead.last_name].filter(Boolean).join(' ') || null,
      email: lead.email,
      phone: lead.phone,
      company: lead.company_name,
      sector: need?.sector ?? null,
      projectType: need?.project_type ?? null,
      timeline: need?.project_timeline ?? null,
      score: need?.qualification_score ?? null,
      utmSource: acq?.utm_source ?? null,
      utmCampaign: acq?.utm_campaign ?? null,
      landingPage: acq?.landing_page ?? null,
    };
  });

  // Counts per source_form for the tab badges (independent of the type filter).
  let countsQuery = admin.from('leads').select('source_form,status');
  if (q) countsQuery = countsQuery.or(`company_name.ilike.%${q}%,email.ilike.%${q}%,last_name.ilike.%${q}%,first_name.ilike.%${q}%`);
  const { data: all } = await countsQuery;
  const byType = { all: all?.length ?? 0 };
  for (const row of all ?? []) byType[row.source_form] = (byType[row.source_form] ?? 0) + 1;

  return json({ leads: rows, countsByType: byType, statuses: STATUSES });
}

export async function getLead(id) {
  const { data: lead, error } = await admin.from('leads').select('*').eq('id', id).maybeSingle();
  if (error) return json({ error: error.message }, 500);
  if (!lead) return json({ error: 'not_found' }, 404);

  const [{ data: needs }, { data: acquisitions }, { data: consents }, { data: events }] = await Promise.all([
    admin.from('lead_needs').select('*').eq('lead_id', id).order('created_at', { ascending: false }),
    admin.from('acquisitions').select('*').eq('lead_id', id).order('created_at', { ascending: false }),
    admin.from('consents').select('*').eq('lead_id', id).order('created_at', { ascending: false }),
    admin.from('lead_events').select('*').eq('lead_id', id).order('created_at', { ascending: true }),
  ]);

  return json({ lead, needs: needs ?? [], acquisitions: acquisitions ?? [], consents: consents ?? [], events: events ?? [] });
}

export async function updateLeadStatus(id, req) {
  const body = await readJson(req);
  if (!body || !STATUSES.includes(body.status)) return json({ error: 'invalid_status' }, 400);
  const lostReason = body.status === 'lost' ? body.lostReason : null;
  if (body.status === 'lost' && !LOST_REASONS.includes(lostReason)) {
    return json({ error: 'lost_reason_required', reasons: LOST_REASONS }, 400);
  }

  const { data, error } = await admin.rpc('update_lead_status', {
    p_lead_id: id,
    p_new_status: body.status,
    p_lost_reason: lostReason,
  });
  if (error) return json({ error: error.message }, 400);
  return json({ ok: true, transition: data?.[0] ?? null });
}
