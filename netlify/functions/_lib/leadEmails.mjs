// Transactional e-mails sent through Resend after a lead is created:
//   1. internal notification to the sales team,
//   2. automatic acknowledgement to the person who filled in the form.
//
// Server only. Required environment variables (Netlify → Environment variables):
//   RESEND_API_KEY        Resend API key (sending access is enough)
//   RESEND_FROM           Sender on a domain verified in Resend,
//                         e.g. "Maîtrise Énergie <notifications@maitrise-energie.fr>"
// Optional:
//   LEAD_NOTIFICATION_TO  Comma-separated internal recipients (default: contact@maitrise-energie.fr)
//   SITE_URL              Public origin used to build the logo URL

const RESEND_URL = 'https://api.resend.com/emails';
const TIMEOUT_MS = 6_000;

const BRAND = {
  name: 'Maîtrise Énergie',
  tagline: 'Performance énergétique',
  ink: '#102d48',
  green: '#1e967c',
  paper: '#f4f1e9',
  white: '#ffffff',
  line: '#d8e1e3',
  muted: '#5a6d7b',
  copper: '#c98a45',
  phone: '+33 7 68 49 59 45',
  email: 'contact@maitrise-energie.fr',
  hours: 'Lundi au vendredi · 9h00–18h00',
  address: '37 Avenue Trudaine, 75009 Paris',
};

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";

const SOURCE_LABELS = {
  contact: 'Formulaire de contact',
  eligibility: "Test d'éligibilité",
  landing_page: 'Page de destination',
  campaign: 'Campagne',
};

const esc = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Header-safe single-line text (subjects) — no CR/LF injection.
const oneLine = (value, max = 120) => String(value ?? '').replace(/[\r\n\t]+/g, ' ').trim().slice(0, max);

const siteUrl = () => (process.env.SITE_URL || process.env.URL || 'https://maitrise-energie.fr').replace(/\/+$/, '');
const logoUrl = () => `${siteUrl()}/web-app-manifest-192x192.png`;
const telHref = (value) => `tel:${String(value || '').replace(/[^\d+]/g, '')}`;

// ---------------------------------------------------------------------------
// Shared layout: table based, inline styles, 600px max, fluid on phones.
// Works in Apple Mail (iPhone), Gmail (app + web), Outlook, Yahoo.
// ---------------------------------------------------------------------------

function button(href, label, { bg = BRAND.green, color = BRAND.white } = {}) {
  return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse:separate;">
<tr><td align="center" bgcolor="${bg}" style="border-radius:10px;background-color:${bg};">
<a href="${esc(href)}" target="_blank" style="display:inline-block;padding:14px 26px;font-family:${FONT};font-size:16px;font-weight:700;line-height:20px;color:${color};text-decoration:none;border-radius:10px;">${esc(label)}</a>
</td></tr></table>`;
}

function layout({ title, preheader, body, footer }) {
  return `<!DOCTYPE html>
<html lang="fr" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<meta name="format-detection" content="telephone=no,address=no,email=no,date=no">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${esc(title)}</title>
<style>
  body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
  table,td{mso-table-lspace:0;mso-table-rspace:0;}
  img{border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;}
  a{color:${BRAND.green};}
  @media only screen and (max-width:620px){
    .container{width:100%!important;}
    .px{padding-left:20px!important;padding-right:20px!important;}
    .stack{display:block!important;width:100%!important;}
    .h1{font-size:24px!important;line-height:30px!important;}
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.paper};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">${esc(preheader)}&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;</div>
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="${BRAND.paper}" style="background-color:${BRAND.paper};">
<tr><td align="center" style="padding:24px 12px;">
  <table role="presentation" class="container" border="0" cellpadding="0" cellspacing="0" width="600" style="width:600px;max-width:600px;">
    <tr><td bgcolor="${BRAND.ink}" class="px" style="background-color:${BRAND.ink};padding:22px 32px;border-radius:16px 16px 0 0;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr>
        <td valign="middle" style="padding-right:14px;"><img src="${esc(logoUrl())}" width="48" height="48" alt="${BRAND.name}" style="display:block;width:48px;height:48px;border-radius:12px;"></td>
        <td valign="middle" style="font-family:${FONT};">
          <div style="font-size:20px;line-height:24px;font-weight:800;color:${BRAND.white};letter-spacing:-0.2px;">${BRAND.name}</div>
          <div style="font-size:12px;line-height:16px;font-weight:600;color:#8fd8c6;letter-spacing:1.2px;text-transform:uppercase;">${BRAND.tagline}</div>
        </td>
      </tr></table>
    </td></tr>
    <tr><td bgcolor="${BRAND.green}" height="4" style="background-color:${BRAND.green};height:4px;font-size:0;line-height:0;">&nbsp;</td></tr>
    <tr><td bgcolor="${BRAND.white}" class="px" style="background-color:${BRAND.white};padding:36px 32px 32px;font-family:${FONT};color:${BRAND.ink};">
      ${body}
    </td></tr>
    <tr><td bgcolor="#eaeef0" class="px" style="background-color:#eaeef0;padding:22px 32px;border-radius:0 0 16px 16px;font-family:${FONT};font-size:12px;line-height:18px;color:${BRAND.muted};">
      ${footer}
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// 1. Acknowledgement to the visitor
// ---------------------------------------------------------------------------

export function buildAcknowledgement({ contact = {}, need = {} }) {
  const firstName = esc(contact.firstName || '');
  const project = need.projectType ? esc(need.projectType) : null;

  const body = `
<h1 class="h1" style="margin:0 0 16px;font-size:28px;line-height:34px;font-weight:800;color:${BRAND.ink};">Merci pour votre prise de contact${firstName ? `, ${firstName}` : ''}&nbsp;!</h1>
<p style="margin:0 0 16px;font-size:16px;line-height:26px;color:${BRAND.ink};">Nous avons bien reçu votre demande et nous vous en remercions.</p>
<p style="margin:0 0 24px;font-size:16px;line-height:26px;color:${BRAND.ink};"><strong>Un conseiller Maîtrise Énergie vous recontactera dans les plus brefs délais</strong> pour étudier votre projet avec vous.</p>
${project ? `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 24px;"><tr><td bgcolor="${BRAND.paper}" style="background-color:${BRAND.paper};border-left:4px solid ${BRAND.green};border-radius:8px;padding:14px 18px;font-family:${FONT};">
<div style="font-size:12px;line-height:16px;font-weight:700;color:${BRAND.muted};letter-spacing:1px;text-transform:uppercase;">Votre projet</div>
<div style="margin-top:4px;font-size:16px;line-height:24px;font-weight:700;color:${BRAND.ink};">${project}</div>
</td></tr></table>` : ''}
<p style="margin:0 0 12px;font-size:15px;line-height:24px;color:${BRAND.muted};">Une précision à nous apporter&nbsp;? Contactez-nous directement&nbsp;:</p>
${button(telHref(BRAND.phone), `Appeler le ${BRAND.phone}`)}
<p style="margin:16px 0 0;font-size:14px;line-height:22px;color:${BRAND.muted};">${BRAND.hours}<br>ou par e-mail à <a href="mailto:${BRAND.email}" style="color:${BRAND.green};font-weight:600;text-decoration:underline;">${BRAND.email}</a></p>
<p style="margin:28px 0 0;font-size:16px;line-height:26px;color:${BRAND.ink};">À très bientôt,<br><strong>L'équipe Maîtrise Énergie</strong></p>`;

  const footer = `
<p style="margin:0 0 8px;"><strong style="color:${BRAND.ink};">Ceci est un e-mail automatique, merci de ne pas y répondre.</strong> Cette adresse d'envoi ne permet pas de recevoir de réponse. Pour nous écrire, utilisez <a href="mailto:${BRAND.email}" style="color:${BRAND.green};text-decoration:underline;">${BRAND.email}</a>.</p>
<p style="margin:0;">${BRAND.name} · ${BRAND.address}<br>Vous recevez ce message car vous avez rempli un formulaire sur ${esc(siteUrl().replace(/^https?:\/\//, ''))}.</p>`;

  const html = layout({
    title: 'Nous avons bien reçu votre demande',
    preheader: 'Un conseiller vous recontactera dans les plus brefs délais.',
    body,
    footer,
  });

  const text = [
    `Merci pour votre prise de contact${contact.firstName ? `, ${contact.firstName}` : ''} !`,
    '',
    'Nous avons bien reçu votre demande et nous vous en remercions.',
    'Un conseiller Maîtrise Énergie vous recontactera dans les plus brefs délais pour étudier votre projet avec vous.',
    need.projectType ? `\nVotre projet : ${need.projectType}` : '',
    '',
    `Une précision à nous apporter ? ${BRAND.phone} (${BRAND.hours}) ou ${BRAND.email}`,
    '',
    "À très bientôt,\nL'équipe Maîtrise Énergie",
    '',
    '--',
    "Ceci est un e-mail automatique, merci de ne pas y répondre. Cette adresse d'envoi ne permet pas de recevoir de réponse.",
    `${BRAND.name} · ${BRAND.address}`,
  ].join('\n');

  return { subject: 'Nous avons bien reçu votre demande – Maîtrise Énergie', html, text };
}

// ---------------------------------------------------------------------------
// 2. Internal notification
// ---------------------------------------------------------------------------

export function buildNotification({ leadId, sourceForm, contact = {}, need = {}, acquisition = {} }) {
  const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ');
  const equipment = Array.isArray(need.equipment) ? need.equipment.filter(Boolean).join(', ') : '';
  const source = SOURCE_LABELS[sourceForm] || sourceForm || '—';

  const rows = [
    ['Contact', fullName],
    ['Entreprise', contact.companyName],
    ['E-mail', contact.email, `mailto:${contact.email}`],
    ['Téléphone', contact.phone, telHref(contact.phone)],
    ['Projet', need.projectType],
    ['Secteur', need.sector],
    ['Type de bâtiment', need.buildingType],
    ['Taille du site', need.siteSize],
    ['Équipements', equipment],
    ['Échéance', need.projectTimeline],
    ['Score de qualification', Number.isInteger(need.qualificationScore) ? `${need.qualificationScore}/100` : ''],
  ].filter(([, value]) => value);

  const tableRow = ([label, value, href]) => `<tr>
<td class="stack" valign="top" width="170" style="padding:10px 12px 10px 0;border-bottom:1px solid ${BRAND.line};font-family:${FONT};font-size:13px;line-height:20px;font-weight:700;color:${BRAND.muted};">${esc(label)}</td>
<td class="stack" valign="top" style="padding:10px 0;border-bottom:1px solid ${BRAND.line};font-family:${FONT};font-size:15px;line-height:22px;color:${BRAND.ink};word-break:break-word;">${href ? `<a href="${esc(href)}" style="color:${BRAND.green};font-weight:600;text-decoration:underline;">${esc(value)}</a>` : esc(value)}</td>
</tr>`;

  const trace = [
    ['Origine', source],
    ['Page', acquisition.landingPage],
    ['Bouton', acquisition.ctaSource],
    ['UTM', [acquisition.utmSource, acquisition.utmMedium, acquisition.utmCampaign].filter(Boolean).join(' / ')],
    ['Référence', leadId],
  ].filter(([, value]) => value);

  const body = `
<div style="display:inline-block;padding:5px 12px;border-radius:999px;background-color:${BRAND.paper};font-size:12px;line-height:16px;font-weight:700;color:${BRAND.copper};letter-spacing:1px;text-transform:uppercase;">Nouveau lead · ${esc(source)}</div>
<h1 class="h1" style="margin:14px 0 6px;font-size:26px;line-height:32px;font-weight:800;color:${BRAND.ink};">${esc(fullName || 'Nouveau contact')}</h1>
<p style="margin:0 0 24px;font-size:16px;line-height:24px;color:${BRAND.muted};">${esc(contact.companyName || '')}</p>
<table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:0 0 28px;"><tr>
<td style="padding:0 10px 10px 0;">${button(telHref(contact.phone), 'Appeler')}</td>
<td style="padding:0 0 10px 0;">${button(`mailto:${contact.email}`, 'Répondre', { bg: BRAND.ink })}</td>
</tr></table>
${need.message ? `<div style="margin:0 0 28px;padding:16px 18px;background-color:${BRAND.paper};border-left:4px solid ${BRAND.green};border-radius:8px;font-size:15px;line-height:24px;color:${BRAND.ink};white-space:pre-wrap;word-break:break-word;">${esc(need.message)}</div>` : ''}
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">${rows.map(tableRow).join('')}</table>
<p style="margin:28px 0 8px;font-size:12px;line-height:16px;font-weight:700;color:${BRAND.muted};letter-spacing:1px;text-transform:uppercase;">Traçabilité</p>
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">${trace.map(tableRow).join('')}</table>`;

  const footer = `<p style="margin:0;">Notification interne automatique · ${BRAND.name}. Le lead est enregistré dans le back-office.</p>`;

  const html = layout({
    title: `Nouveau lead – ${fullName}`,
    preheader: [contact.companyName, need.projectType].filter(Boolean).join(' · ') || 'Nouvelle demande reçue',
    body,
    footer,
  });

  const text = [
    `Nouveau lead (${source})`,
    ...rows.map(([label, value]) => `${label} : ${value}`),
    need.message ? `\nMessage :\n${need.message}` : '',
    '',
    ...trace.map(([label, value]) => `${label} : ${value}`),
  ].join('\n');

  const subject = oneLine(`Nouveau lead – ${fullName}${contact.companyName ? ` (${contact.companyName})` : ''}`);
  return { subject, html, text };
}

// ---------------------------------------------------------------------------
// Sending
// ---------------------------------------------------------------------------

async function send({ apiKey, idempotencyKey, payload, fetchImpl }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetchImpl(RESEND_URL, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
        'idempotency-key': idempotencyKey,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!res.ok) return { ok: false, status: res.status };
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error?.name === 'AbortError' ? 'timeout' : 'network' };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Best effort: never throws, never blocks the lead. Returns the outcome of
 * each message so the caller can log it.
 */
export async function sendLeadEmails(lead, { env = process.env, fetchImpl = fetch } = {}) {
  const apiKey = env.RESEND_API_KEY?.trim();
  const from = env.RESEND_FROM?.trim();
  if (!apiKey || !from) return { skipped: true, missing: [!apiKey && 'RESEND_API_KEY', !from && 'RESEND_FROM'].filter(Boolean) };

  const recipients = (env.LEAD_NOTIFICATION_TO || BRAND.email).split(',').map((r) => r.trim()).filter(Boolean);
  const notification = buildNotification(lead);
  const acknowledgement = buildAcknowledgement(lead);

  const [notif, ack] = await Promise.all([
    send({
      apiKey,
      fetchImpl,
      idempotencyKey: `lead-notification-${lead.leadId}`,
      payload: { from, to: recipients, reply_to: lead.contact.email, ...notification },
    }),
    send({
      apiKey,
      fetchImpl,
      idempotencyKey: `lead-acknowledgement-${lead.leadId}`,
      payload: { from, to: [lead.contact.email], ...acknowledgement },
    }),
  ]);
  return { notification: notif, acknowledgement: ack };
}
