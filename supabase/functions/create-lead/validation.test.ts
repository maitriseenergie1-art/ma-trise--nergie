import { assertEquals } from 'jsr:@std/assert@1';
import { validateSubmission } from './validation.ts';

const contactPayload = {
  submissionId: 'ba761c0c-c16f-40cb-a2d7-2c15361efdb9',
  sourceForm: 'contact',
  trackingId: 'lead_demo_contact',
  contact: { firstName: 'Jean', lastName: 'Martin', email: 'JEAN@EXAMPLE.TEST', phone: '+33 6 00 00 00 00', companyName: 'Entreprise Démo' },
  need: { sector: 'Industrie', buildingType: null, siteSize: null, projectType: 'Optimisation énergétique', solutionSlug: 'air-comprime', equipment: [], projectTimeline: null, message: 'Message de démonstration.' },
  acquisition: { landingPage: '/solutions/air-comprime', ctaSource: 'solution_final_cta' },
  consent: { accepted: true, policyVersion: 'demo-v1' },
};

Deno.test('normalise une soumission Contact valide', () => {
  const result = validateSubmission(contactPayload);
  assertEquals(result.ok, true);
  if (result.ok) assertEquals(result.value.contact.email, 'jean@example.test');
});

Deno.test('accepte une soumission Éligibilité valide', () => {
  const result = validateSubmission({
    ...contactPayload,
    sourceForm: 'eligibility',
    trackingId: 'lead_demo_eligibility',
    need: {
      sector: 'Agroalimentaire',
      buildingType: 'Site industriel',
      siteSize: '5000-10000',
      projectType: 'Froid',
      solutionSlug: 'regulation-froid',
      equipment: ['centrale frigorifique'],
      projectTimeline: '6-12 mois',
      message: null,
    },
  });
  assertEquals(result.ok, true);
  if (result.ok) assertEquals(result.value.sourceForm, 'eligibility');
});

Deno.test('rejette un email invalide', () => {
  const result = validateSubmission({ ...contactPayload, contact: { ...contactPayload.contact, email: 'invalide' } });
  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.fields.email, 'INVALID_EMAIL');
});

Deno.test('rejette un consentement absent ou refusé', () => {
  const result = validateSubmission({ ...contactPayload, consent: { accepted: false } });
  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.fields.consent, 'CONSENT_REQUIRED');
});

Deno.test('rejette une source inconnue', () => {
  const result = validateSubmission({ ...contactPayload, sourceForm: 'newsletter' });
  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.fields.sourceForm, 'INVALID_SOURCE_FORM');
});

Deno.test('détecte le honeypot sans créer de contrat invalide', () => {
  const result = validateSubmission({ ...contactPayload, website: 'https://bot.example.test' });
  assertEquals(result.ok, true);
  if (result.ok) assertEquals(result.honeypotFilled, true);
});

Deno.test('submissionId absent : erreur explicite', () => {
  const { submissionId: _id, ...payload } = contactPayload;
  const result = validateSubmission(payload);
  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.fields.submissionId, 'SUBMISSION_ID_REQUIRED');
});
Deno.test('submissionId invalide ou trop long rejeté', () => {
  for (const submissionId of ['lead_session', 'x'.repeat(10000), 123, {}, '00000000-0000-0000-0000-000000000000']) {
    const result = validateSubmission({ ...contactPayload, submissionId });
    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.fields.submissionId, 'INVALID_SUBMISSION_ID');
  }
});
Deno.test('honeypot sans submissionId reste silencieux', () => {
  const result = validateSubmission({ ...contactPayload, submissionId: undefined, website: 'bot' });
  assertEquals(result.ok, true);
  if (result.ok) assertEquals(result.honeypotFilled, true);
});
