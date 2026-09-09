import { assertEquals, assertStringIncludes, assertNotMatch } from 'jsr:@std/assert@1';
import { buildLeadNotification, sendLeadNotification } from './email.ts';

const contactLead = {
  leadId: '00000000-0000-0000-0000-000000000001',
  trackingId: 'lead_demo_notification',
  sourceForm: 'contact' as const,
  contact: { firstName: 'Jean', lastName: 'Martin', email: 'jean.notification@example.test', phone: '+33600000000', companyName: 'Entreprise Démo' },
  need: { sector: 'Industrie', buildingType: null, siteSize: null, projectType: 'Air comprimé', solutionSlug: 'air-comprime', equipment: ['compresseurs'], projectTimeline: null, message: 'Besoin d’une première étude.', qualificationScore: null },
  acquisition: { landingPage: '/solutions/air-comprime', referrer: null, ctaSource: 'solution_final_cta', utmSource: 'google', utmMedium: 'cpc', utmCampaign: 'demo', utmTerm: null, utmContent: null, gclid: null, gbraid: null, wbraid: null, fbclid: null },
};

Deno.test('construit une notification Contact sans valeurs nulles', () => {
  const message = buildLeadNotification(contactLead);
  assertEquals(message.subject, 'Nouveau lead — Maîtrise Énergie — Contact');
  assertStringIncludes(message.text, 'Jean');
  assertStringIncludes(message.text, 'Air comprimé');
  assertNotMatch(message.text, /null|undefined/);
});

Deno.test('construit une notification Éligibilité avec le contexte projet', () => {
  const message = buildLeadNotification({
    ...contactLead,
    sourceForm: 'eligibility',
    need: { ...contactLead.need, buildingType: 'Site industriel', siteSize: '5 000 à 10 000 m²', equipment: ['centrale frigorifique'], projectTimeline: '3-6 mois' },
  });
  assertStringIncludes(message.subject, 'Éligibilité');
  assertStringIncludes(message.text, 'Site industriel');
  assertStringIncludes(message.text, '5 000 à 10 000 m²');
  assertStringIncludes(message.text, 'centrale frigorifique');
  assertStringIncludes(message.text, '3-6 mois');
});

Deno.test('échappe les données utilisateur dans le HTML', () => {
  const message = buildLeadNotification({ ...contactLead, contact: { ...contactLead.contact, companyName: 'Entreprise <script>alert(1)</script>' } });
  assertStringIncludes(message.html, 'Entreprise &lt;script&gt;alert(1)&lt;/script&gt;');
  assertNotMatch(message.html, /Entreprise <script>/);
});

Deno.test('retourne une erreur contrôlée si Resend est indisponible', async () => {
  const result = await sendLeadNotification(contactLead, {
    env: { RESEND_API_KEY: 'test-key', LEAD_NOTIFICATION_TO: 'sales@example.test', LEAD_NOTIFICATION_FROM: 'Leads <leads@example.test>' },
    fetch: async () => new Response(null, { status: 503 }),
  });
  assertEquals(result, { ok: false, errorCode: 'EMAIL_PROVIDER_ERROR', providerStatus: 503 });
});

Deno.test('envoie une requête Resend avec destinataires normalisés et référence idempotente', async () => {
  let request: RequestInit | undefined;
  const result = await sendLeadNotification(contactLead, {
    env: { RESEND_API_KEY: 'test-key', LEAD_NOTIFICATION_TO: 'sales@example.test, team@example.test ', LEAD_NOTIFICATION_FROM: 'Leads <leads@example.test>' },
    fetch: async (_input, init) => {
      request = init;
      return new Response(JSON.stringify({ id: 'provider-message-id' }), { status: 200 });
    },
  });
  assertEquals(result, { ok: true, providerMessageId: 'provider-message-id' });
  assertEquals(new Headers(request?.headers).get('Idempotency-Key'), 'lead-notification-00000000-0000-0000-0000-000000000001');
  assertEquals(JSON.parse(String(request?.body)).to, ['sales@example.test', 'team@example.test']);
});
