import { images } from './images.js';

// Contenus de démonstration : ils donnent des repères, sans constituer une doctrine réglementaire.
export const resources=[
  {
    slug:'cee-projet-energie',
    category:'Financement & CEE',
    title:'Comprendre les CEE pour un projet énergétique professionnel',
    excerpt:'Les principaux repères à connaître avant d’étudier les possibilités de financement associées à une opération de performance énergétique.',
    image:images.buildingEnvelope,
    indexable:false,
  },
  {
    slug:'air-comprime-pertes',
    category:'Air comprimé',
    title:'Comment identifier les pertes d’un réseau d’air comprimé ?',
    excerpt:'Production, pression, fuites, séchage et usages : les points à examiner pour comprendre le fonctionnement d’un réseau.',
    image:images.airCompressor,
    indexable:false,
  },
  {
    slug:'comprendre-la-gtb',
    category:'GTB',
    title:'Quels équipements peut-on piloter avec une GTB ?',
    excerpt:'Chauffage, ventilation, climatisation, éclairage et comptage : tour d’horizon des principaux équipements pouvant être supervisés.',
    image:images.controlPanel,
    indexable:false,
  },
  {
    slug:'valoriser-la-chaleur',
    category:'Récupération de chaleur',
    title:'Où chercher les gisements de récupération de chaleur ?',
    excerpt:'Groupes froids, compresseurs, process et rejets thermiques peuvent constituer des sources à étudier selon les usages du site.',
    image:images.thermalProcess,
    indexable:false,
  },
  {
    slug:'destratification-entrepot',
    category:'Logistique',
    title:'Quand étudier la déstratification d’un bâtiment ?',
    excerpt:'Les signaux à observer dans les bâtiments de grande hauteur chauffés et les zones de travail.',
    image:images.warehouse,
    indexable:false,
  },
  {
    slug:'regulation-froid',
    category:'Froid',
    title:'Quels paramètres examiner sur une installation frigorifique ?',
    excerpt:'Consignes, régulation, condensation, production et besoins : quelques repères pour commencer une analyse.',
    image:images.refrigerationPlant,
    indexable:false,
  },
];
