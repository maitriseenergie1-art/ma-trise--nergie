export const siteConfig = {
  name: 'MAÎTRISE ÉNERGIE',
  description: 'Étude et amélioration de la performance énergétique des bâtiments tertiaires, sites industriels et installations professionnelles.',
  // Renseigné via VITE_SITE_URL ; fallback sur l'origine courante au runtime.
  siteUrl: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SITE_URL) || '',
  defaultShareImage: '/og-social.png',
  privacyPolicyVersion: 'site-demo-v1', // À versionner avec toute évolution de la politique publiée.
  contact: {
    // DEMO PLACEHOLDER — à remplacer avant production.
    phone: '+33 1 84 80 00 00',
    email: 'contact@maitrise-energie.fr',
    address: '24 rue de l’Innovation, 69007 Lyon',
    hours: 'Lundi au vendredi · 9h00–18h00',
    serviceArea: 'France métropolitaine · selon la nature du projet',
    mapEmbedUrl: '',
    bookingUrl: '',
  },
  legal: { companyIdentity: '', address: '', registration: '', hostingProvider: '' },
};
