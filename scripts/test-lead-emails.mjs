// Envoie les deux e-mails (notification + accusé) vers une adresse de test via Resend.
// Usage : node --env-file=.env scripts/test-lead-emails.mjs vous@exemple.fr
import { sendLeadEmails } from '../netlify/functions/_lib/leadEmails.mjs';

const to = process.argv[2];
if (!to) {
  console.error('Usage : node --env-file=.env scripts/test-lead-emails.mjs <adresse-de-test>');
  process.exit(1);
}

const result = await sendLeadEmails(
  {
    leadId: `test-${Date.now()}`,
    sourceForm: 'contact',
    contact: { firstName: 'Camille', lastName: 'Test', email: to, phone: '0612345678', companyName: 'Entreprise Test' },
    need: {
      projectType: 'Photovoltaïque professionnel en autofinancement',
      sector: 'Industrie',
      equipment: ['Toiture'],
      message: 'Ceci est un message de test.',
    },
    acquisition: { landingPage: 'https://maitrise-energie.fr/contact' },
  },
  { env: { ...process.env, LEAD_NOTIFICATION_TO: to } },
);

console.log(JSON.stringify(result, null, 2));
process.exit(result.skipped || !result.notification?.ok || !result.acknowledgement?.ok ? 1 : 0);
