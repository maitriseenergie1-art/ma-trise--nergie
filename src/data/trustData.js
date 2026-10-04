// Données réelles de preuve sociale et de crédibilité de l'entreprise.
// Remplacez chaque valeur marquée [À REMPLIR : ...] par une donnée vérifiée avant mise en ligne.
// Rien de ce fichier n'est un avis, un chiffre ou une certification réels tant que les placeholders
// n'ont pas été remplacés : ne jamais afficher ces valeurs comme si elles étaient confirmées.

export const trustStats = [
  { label: 'kWc installés', value: '[À REMPLIR : kWc cumulés]' },
  { label: 'sites équipés', value: '[À REMPLIR : nombre de sites]' },
  { label: 'ans d’expérience', value: '[À REMPLIR : nombre d’années]' },
  { label: 'note Google', value: '[À REMPLIR : note]/5' },
];

// Logos clients réels : [{ name: 'Nom du client', logoUrl: '/logos/client.webp', alt: 'Logo Client' }]
export const clientLogos = [];

// 3 études de cas réelles attendues. Chaque champ non fourni reste affiché comme placeholder visible.
export const realCaseStudies = [
  {
    id: 'etude-1',
    sector: '[À REMPLIR : secteur d’activité]',
    surface: '[À REMPLIR : surface en m²]',
    power: '[À REMPLIR : puissance installée en kWc]',
    annualSaving: '[À REMPLIR : économie annuelle en €]',
    paybackYears: '[À REMPLIR : durée de retour en années]',
    photoUrl: null,
  },
  {
    id: 'etude-2',
    sector: '[À REMPLIR : secteur d’activité]',
    surface: '[À REMPLIR : surface en m²]',
    power: '[À REMPLIR : puissance installée en kWc]',
    annualSaving: '[À REMPLIR : économie annuelle en €]',
    paybackYears: '[À REMPLIR : durée de retour en années]',
    photoUrl: null,
  },
  {
    id: 'etude-3',
    sector: '[À REMPLIR : secteur d’activité]',
    surface: '[À REMPLIR : surface en m²]',
    power: '[À REMPLIR : puissance installée en kWc]',
    annualSaving: '[À REMPLIR : économie annuelle en €]',
    paybackYears: '[À REMPLIR : durée de retour en années]',
    photoUrl: null,
  },
];

export const googleReview = {
  rating: null, // [À REMPLIR : note sur 5]
  reviewCount: null, // [À REMPLIR : nombre d’avis]
};

export const guarantees = [
  { label: 'Certification installateur', value: '[À REMPLIR : ex. QualiPV / RGE / Qualifelec, à confirmer]' },
  { label: 'Assurance décennale', value: '[À REMPLIR : assureur et numéro de police]' },
  { label: 'SIRET', value: '[À REMPLIR : numéro SIRET]' },
  { label: 'Identité de la société', value: '[À REMPLIR : dénomination sociale, forme juridique]' },
];

// Exemple chiffré présenté comme une simulation type, jamais comme un cas client réel.
export const sampleSimulation = {
  buildingType: 'entrepôt de 5 000 m²',
  power: '[À REMPLIR : kWc]',
  annualSaving: '[À REMPLIR : €/an]',
  paybackYears: '[À REMPLIR : années]',
};
