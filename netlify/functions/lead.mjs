import { admin, supabaseConfigured } from './_lib/supabaseAdmin.mjs';
import { sendOpenAILeadCreated } from './_lib/openaiConversions.mjs';
import { sendLeadEmails } from './_lib/leadEmails.mjs';
import { getAllowedTurnstileHostnames, getClientIp, verifyTurnstile } from './_lib/turnstile.mjs';

export const config = { path: '/api/lead' };

const SOURCE_FORMS = new Set(['contact', 'eligibility', 'landing_page', 'campaign']);
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FRENCH_MOBILE = /^(?:0[67]\d{8}|\+33[67]\d{8})$/;
const PROJECT_TYPES = new Set(['Photovoltaïque professionnel en autofinancement','Gestion technique du bâtiment (GTB) et pilotage énergétique','Chauffage, ventilation, climatisation et pompes à chaleur','Froid industriel ou commercial et régulation','Isolation thermique et calorifugeage','Récupération de chaleur et chaleur fatale','Air comprimé, moteurs, variateurs ou éclairage','Financement CEE']);

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'content-type',
};

const j = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...CORS },
  });

const str = (v, max) => {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t && t.length <= max ? t : null;
};

const phone = (value) => str(value, 64)?.replace(/[\s.\-()]/g, '') || null;
export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'POST') return j({ ok: false, error: 'method_not_allowed' }, 405);
  if (!supabaseConfigured) return j({ ok: false, type: 'configuration' }, 200);

  const payload = await req.json().catch(() => null);
  if (!payload || typeof payload !== 'object') return j({ ok: false, type: 'validation', fields: { payload: 'INVALID' } }, 400);

  // Honeypot: pretend success, write nothing.
  if (typeof payload.website === 'string' && payload.website.trim()) {
    return new Response(null, { status: 204, headers: CORS });
  }

  const expectedAction = payload.sourceForm === 'contact' ? 'contact' : payload.sourceForm === 'eligibility' ? 'eligibility' : 'lead';
  const expectedHostname = getAllowedTurnstileHostnames(req);
  try {
    if (!await verifyTurnstile({
      token: payload.turnstileToken,
      expectedAction,
      expectedHostname,
      remoteIp: getClientIp(req),
    })) return j({ ok: false, type: 'validation', fields: { captcha: 'INVALID_CAPTCHA' } }, 400);
  } catch { return j({ ok: false, type: 'validation', fields: { captcha: 'INVALID_CAPTCHA' } }, 400); }

  const fields = {};
  const submissionId = typeof payload.submissionId === 'string' ? payload.submissionId.toLowerCase() : '';
  if (!UUID_V4.test(submissionId)) fields.submissionId = 'INVALID_SUBMISSION_ID';

  const sourceForm = payload.sourceForm;
  if (!SOURCE_FORMS.has(sourceForm)) fields.sourceForm = 'INVALID_SOURCE_FORM';

  const contact = payload.contact || {};
  const email = str(contact.email, 254)?.toLowerCase() || null;
  if (!email || !EMAIL.test(email)) fields.email = 'INVALID_EMAIL';
  if (!str(contact.firstName, 100)) fields.firstName = 'REQUIRED';
  if (!str(contact.lastName, 100)) fields.lastName = 'REQUIRED';
  if (!str(contact.companyName, 180)) fields.companyName = 'REQUIRED';
  if (!FRENCH_MOBILE.test(phone(contact.phone) || '')) fields.phone = 'INVALID_FRENCH_MOBILE';
  if (!PROJECT_TYPES.has(str(payload.need?.projectType, 160))) fields.projectType = 'INVALID_PROJECT_TYPE';

  if (payload.consent?.accepted !== true) fields.consent = 'CONSENT_REQUIRED';

  if (Object.keys(fields).length) return j({ ok: false, type: 'validation', fields }, 400);

  const need = payload.need || {};
  const acq = payload.acquisition || {};
  let equipment = need.equipment;
  if (!Array.isArray(equipment)) equipment = [];

  const { data, error } = await admin.rpc('create_lead_submission', {
    p_submission_id: submissionId,
    p_tracking_id: str(payload.trackingId, 128),
    p_source_form: sourceForm,
    p_first_name: str(contact.firstName, 100),
    p_last_name: str(contact.lastName, 100),
    p_email: email,
    p_phone: phone(contact.phone),
    p_company_name: str(contact.companyName, 180),
    p_sector: str(need.sector, 100),
    p_building_type: str(need.buildingType, 120),
    p_site_size: str(need.siteSize, 100),
    p_project_type: str(need.projectType, 160),
    p_solution_slug: str(need.solutionSlug, 120),
    p_equipment: equipment,
    p_project_timeline: str(need.projectTimeline, 120),
    p_message: str(need.message, 4000),
    p_qualification_score:
      Number.isInteger(need.qualificationScore) && need.qualificationScore >= 0 && need.qualificationScore <= 100
        ? need.qualificationScore
        : null,
    p_landing_page: str(acq.landingPage, 2048),
    p_referrer: str(acq.referrer, 2048),
    p_cta_source: str(acq.ctaSource, 160),
    p_utm_source: str(acq.utmSource, 255),
    p_utm_medium: str(acq.utmMedium, 255),
    p_utm_campaign: str(acq.utmCampaign, 255),
    p_utm_term: str(acq.utmTerm, 255),
    p_utm_content: str(acq.utmContent, 255),
    p_gclid: str(acq.gclid, 255),
    p_gbraid: str(acq.gbraid, 255),
    p_wbraid: str(acq.wbraid, 255),
    p_fbclid: str(acq.fbclid, 255),
    p_consent_type: 'privacy',
    p_policy_version: str(payload.consent?.policyVersion, 100),
    p_user_agent: req.headers.get('user-agent')?.slice(0, 500) || null,
  });

  if (error) {
    console.error('[lead]', error);
    return j({ ok: false, type: 'server' }, 500);
  }

  const row = data?.[0];
  if (!row?.lead_id) return j({ ok: false, type: 'server' }, 500);

  // Best effort: internal notification + acknowledgement to the visitor. Skipped
  // on idempotent replays so nobody receives a duplicate. A Resend failure never
  // affects the lead already stored.
  if (row.replayed !== true) {
    const emails = await sendLeadEmails({
      leadId: row.lead_id,
      sourceForm,
      contact: {
        firstName: str(contact.firstName, 100),
        lastName: str(contact.lastName, 100),
        email,
        phone: phone(contact.phone),
        companyName: str(contact.companyName, 180),
      },
      need: {
        sector: str(need.sector, 100),
        buildingType: str(need.buildingType, 120),
        siteSize: str(need.siteSize, 100),
        projectType: str(need.projectType, 160),
        equipment: equipment.filter((item) => typeof item === 'string').slice(0, 30),
        projectTimeline: str(need.projectTimeline, 120),
        message: str(need.message, 4000),
        qualificationScore: need.qualificationScore,
      },
      acquisition: {
        landingPage: str(acq.landingPage, 2048),
        ctaSource: str(acq.ctaSource, 160),
        utmSource: str(acq.utmSource, 255),
        utmMedium: str(acq.utmMedium, 255),
        utmCampaign: str(acq.utmCampaign, 255),
      },
    }).catch((error) => ({ error: String(error?.message || error) }));
    if (emails.skipped) console.warn('[lead] e-mails not sent, missing config', emails.missing);
    else if (emails.error || !emails.notification?.ok || !emails.acknowledgement?.ok) {
      console.warn('[lead] e-mail delivery issue', JSON.stringify(emails));
    }
  }

  // Best effort: the lead remains valid even if the advertising endpoint is
  // unavailable. The submission UUID is shared with the browser Pixel so
  // OpenAI can deduplicate both copies of the same conversion.
  if (payload.consent?.adsMeasurement === true) {
    const conversion = await sendOpenAILeadCreated({
      eventId: submissionId,
      sourceUrl: str(acq.landingPage, 2048),
      siteUrl: process.env.SITE_URL || process.env.URL || 'https://maitrise-energie.fr',
      oppref: str(acq.oppref, 2048),
      browserRef: str(acq.openaiBrowserRef, 512),
    });
    if (!conversion.ok && !conversion.skipped) {
      console.warn('[lead] OpenAI conversion not delivered', {
        status: conversion.status || null,
        error: conversion.error || null,
      });
    }
  }

  return j(
    {
      ok: true,
      leadId: row.lead_id,
      trackingId: row.tracking_id || payload.trackingId,
      submissionId,
      replayed: row.replayed === true,
    },
    201,
  );
}
