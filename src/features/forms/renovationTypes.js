export const renovationTypes = [
  ['photovoltaique', 'Photovoltaïque professionnel en autofinancement'],
  ['gtb', 'Gestion technique du bâtiment (GTB) et pilotage énergétique'],
  ['cvc', 'Chauffage, ventilation, climatisation et pompes à chaleur'],
  ['froid', 'Froid industriel ou commercial et régulation'],
  ['isolation', 'Isolation thermique et calorifugeage'],
  ['chaleur', 'Récupération de chaleur et chaleur fatale'],
  ['utilites', 'Air comprimé, moteurs, variateurs ou éclairage'],
  ['cee', 'Financement CEE'],
];

export const renovationTypeLabels = Object.fromEntries(renovationTypes);

export const renovationTypeFromSolution = (slug = '') => {
  if (slug === 'photovoltaique-professionnel') return 'photovoltaique';
  if (['gtb', 'pilotage-energetique'].includes(slug)) return 'gtb';
  if (['pompes-a-chaleur', 'cvc'].includes(slug)) return 'cvc';
  if (['haute-pression-flottante', 'regulation-froid'].includes(slug)) return 'froid';
  if (['calorifugeage', 'isolation-thermique', 'points-singuliers', 'destratification-air'].includes(slug)) return 'isolation';
  if (['recuperation-chaleur', 'chaleur-fatale'].includes(slug)) return 'chaleur';
  if (['air-comprime', 'moteurs-variateurs', 'eclairage'].includes(slug)) return 'utilites';
  return '';
};
