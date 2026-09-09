import type { LeadSubmission } from '../create-lead/validation.ts';

const RESEND_EMAILS_URL = 'https://api.resend.com/emails';
const EMAIL_TIMEOUT_MS = 6_000;

type FetchImplementation = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
type EnvValues = Record<string, string | undefined>;

export type LeadNotificationInput = {
  leadId: string;
  trackingId: string;
  sourceForm: LeadSubmission['sourceForm'];
  contact: LeadSubmission['contact'];
  need: LeadSubmission['need'];
  acquisition: LeadSubmission['acquisition'];
};

export type LeadNotificationResult =
  | { ok: true; providerMessageId: string | null }
  | { ok: false; errorCode: 'EMAIL_CONFIG_MISSING' | 'EMAIL_TIMEOUT' | 'EMAIL_NETWORK_ERROR' | 'EMAIL_PROVIDER_ERROR'; providerStatus?: number };

type NotificationConfig = {
  apiKey: string;
  recipients: string[];
  from: string;
  replyTo: string | null;
};

type SendOptions = {
  env?: EnvValues;
  fetch?: FetchImplementation;
};

const present = (value: unknown) => typeof value === 'string' && value.trim().length > 0;

function readConfig(env: EnvValues): NotificationConfig | { missing: string[] } {
  const apiKey = env.RESEND_API_KEY?.trim();
  const recipients = (env.LEAD_NOTIFICATION_TO || '').split(',').map((recipient) => recipient.trim()).filter(Boolean);
  const from = env.LEAD_NOTIFICATION_FROM?.trim();
  const replyTo = env.LEAD_NOTIFICATION_REPLY_TO?.trim() || null;
  const missing = [!apiKey && 'RESEND_API_KEY', !recipients.length && 'LEAD_NOTIFICATION_TO', !from && 'LEAD_NOTIFICATION_FROM'].filter(Boolean) as string[];

  if (missing.length) return { missing };
  return { apiKey: apiKey!, recipients, from: from!, replyTo };
}

export function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  })[character] || character);
}

function displayValue(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null;
  if (Array.isArray(value)) {
    const entries = value.map(displayValue).filter((entry): entry is string => Boolean(entry));
    return entries.length ? entries.join(', ') : null;
  }
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

type Row = readonly [string, unknown];

function rows(items: Row[]) {
  return items.filter(([, value]) => present(displayValue(value))).map(([label, value]) => [label, displayValue(value)!] as const);
}

function textSection(title: string, items: Row[]) {
  const sectionRows = rows(items);
  if (!sectionRows.length) return '';
  return `${title}\n${sectionRows.map(([label, value]) => `${label} : ${value}`).join('\n')}`;
}

function htmlSection(title: string, items: Row[]) {
  const sectionRows = rows(items);
  if (!sectionRows.length) return '';
  return `<section style="margin:0 0 24px"><h2 style="font-size:16px;margin:0 0 10px">${escapeHtml(title)}</h2><table role="presentation" cellspacing="0" cellpadding="0" style="border-collapse:collapse;width:100%"><tbody>${sectionRows.map(([label, value]) => `<tr><th align="left" style="padding:4px 14px 4px 0;vertical-align:top;font-size:13px">${escapeHtml(label)}</th><td style="padding:4px 0;vertical-align:top;font-size:13px;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`).join('')}</tbody></table></section>`;
}

export function buildLeadNotification(input: LeadNotificationInput) {
  const isEligibility = input.sourceForm === 'eligibility';
  const sourceLabel = isEligibility ? 'Éligibilité' : 'Contact';
  const title = isEligibility ? 'Nouvelle demande issue du parcours Éligibilité' : 'Nouveau lead Contact';
  const contactRows: Row[] = [
    ['Prénom', input.contact.firstName],
    ['Nom', input.contact.lastName],
    ['Entreprise', input.contact.companyName],
    ['Email', input.contact.email],
    ['Téléphone', input.contact.phone],
  ];
  const projectRows: Row[] = [
    ['Secteur', input.need.sector],
    ['Type de site', input.need.buildingType],
    ['Taille', input.need.siteSize],
    ['Type de projet', input.need.projectType],
    ['Équipement', input.need.equipment],
    ['Calendrier', input.need.projectTimeline],
    ['Solution', input.need.solutionSlug],
    ['Message', input.need.message],
  ];
  const acquisitionRows: Row[] = [
    ['Landing page', input.acquisition.landingPage],
    ['Referrer', input.acquisition.referrer],
    ['CTA', input.acquisition.ctaSource],
    ['utm_source', input.acquisition.utmSource],
    ['utm_medium', input.acquisition.utmMedium],
    ['utm_campaign', input.acquisition.utmCampaign],
    ['utm_term', input.acquisition.utmTerm],
    ['utm_content', input.acquisition.utmContent],
    ['gclid', input.acquisition.gclid],
    ['gbraid', input.acquisition.gbraid],
    ['wbraid', input.acquisition.wbraid],
    ['fbclid', input.acquisition.fbclid],
  ];
  const identifierRows: Row[] = [
    ['Lead ID', input.leadId],
    ['Tracking ID', input.trackingId],
  ];
  const projectTitle = isEligibility ? 'Préqualification projet' : 'Projet';
  const text = [title, textSection('Coordonnées', contactRows), textSection(projectTitle, projectRows), textSection('Acquisition', acquisitionRows), textSection('Identifiants techniques', identifierRows)].filter(Boolean).join('\n\n');
  const html = `<!doctype html><html lang="fr"><body style="margin:0;padding:24px;background:#f7f7f3;color:#161a1b;font-family:Arial,sans-serif"><main style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #dce0d9;padding:28px"><h1 style="font-size:22px;margin:0 0 24px">${escapeHtml(title)}</h1>${htmlSection('Coordonnées', contactRows)}${htmlSection(projectTitle, projectRows)}${htmlSection('Acquisition', acquisitionRows)}${htmlSection('Identifiants techniques', identifierRows)}</main></body></html>`;

  return {
    subject: `Nouveau lead — Maîtrise Énergie — ${sourceLabel}`,
    text,
    html,
  };
}

export async function sendLeadNotification(input: LeadNotificationInput, options: SendOptions = {}): Promise<LeadNotificationResult> {
  const env = options.env || {
    RESEND_API_KEY: Deno.env.get('RESEND_API_KEY'),
    LEAD_NOTIFICATION_TO: Deno.env.get('LEAD_NOTIFICATION_TO'),
    LEAD_NOTIFICATION_FROM: Deno.env.get('LEAD_NOTIFICATION_FROM'),
    LEAD_NOTIFICATION_REPLY_TO: Deno.env.get('LEAD_NOTIFICATION_REPLY_TO'),
  };
  const config = readConfig(env);
  if ('missing' in config) return { ok: false, errorCode: 'EMAIL_CONFIG_MISSING' };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), EMAIL_TIMEOUT_MS);
  const message = buildLeadNotification(input);

  try {
    const response = await (options.fetch || fetch)(RESEND_EMAILS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'maitrise-energie-lead-notifications/1.0',
        'Idempotency-Key': `lead-notification-${input.leadId}`,
      },
      body: JSON.stringify({
        from: config.from,
        to: config.recipients,
        reply_to: config.replyTo || input.contact.email,
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
      signal: controller.signal,
    });

    if (!response.ok) return { ok: false, errorCode: 'EMAIL_PROVIDER_ERROR', providerStatus: response.status };

    let providerMessageId: string | null = null;
    try {
      const body = await response.json();
      providerMessageId = typeof body?.id === 'string' ? body.id : null;
    } catch {
      // A successful provider response without JSON is still a successful notification.
    }
    return { ok: true, providerMessageId };
  } catch (error) {
    return { ok: false, errorCode: error instanceof DOMException && error.name === 'AbortError' ? 'EMAIL_TIMEOUT' : 'EMAIL_NETWORK_ERROR' };
  } finally {
    clearTimeout(timeout);
  }
}
