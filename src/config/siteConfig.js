export const siteConfig = {
  name: 'MAÎTRISE ÉNERGIE',
  description: 'Photovoltaïque professionnel en autofinancement et solutions de performance énergétique pour les entreprises en France.',
  // Renseigné via VITE_SITE_URL ; fallback sur l'origine courante au runtime.
  siteUrl: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SITE_URL) || '',
  defaultShareImage: '/og-social.jpg',
  privacyPolicyVersion: '2026-09-legal-v2', // À versionner avec toute évolution de la politique publiée.
  contact: {
    phone: '+33 7 68 49 59 45',
    email: 'contact@maitrise-energie.fr',
    address: '37 Avenue Trudaine, 75009 Paris',
    geo: { latitude: 48.8809441, longitude: 2.3423369 },
    hours: 'Lundi au vendredi · 9h00–18h00',
    serviceArea: 'France métropolitaine · selon la nature du projet',
    mapEmbedUrl: 'https://maps.google.com/maps?q=37+Avenue+Trudaine%2C+75009+Paris&z=15&output=embed',
    bookingUrl: '',
    googleBusinessUrl: 'https://share.google/rIMm9qvv7fAKgz7Nk',
  },
  legal: { companyIdentity: '', address: '', registration: '', hostingProvider: '' },
};
