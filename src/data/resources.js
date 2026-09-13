import { images } from './images.js';

const sources = {
  cee: ['Ministère de la Transition écologique — dispositif des CEE', 'https://www.ecologie.gouv.fr/politiques-publiques/dispositif-certificats-deconomies-denergie'],
  audit: ['ADEME — audit énergétique et analyse des usages', 'https://agirpourlatransition.ademe.fr/entreprises/conseils/industrie/decarbonation/etat-des-lieux/audit-energetique'],
  tertiaire: ['Ministère de la Transition écologique — Éco Énergie Tertiaire', 'https://www.ecologie.gouv.fr/politiques-publiques/eco-energie-tertiaire-eet'],
};
const source = (key) => ({ label: sources[key][0], url: sources[key][1] });

export const resources = [
  {
    slug:'cee-projet-energie', category:'Financement & CEE',
    seoTitle:'CEE entreprise : financer un projet énergétique',
    title:'CEE pour les entreprises : comprendre le financement d’un projet énergétique',
    excerpt:'Conditions, calendrier et points de vigilance : les repères à connaître avant d’étudier les Certificats d’Économies d’Énergie pour des travaux professionnels.',
    image:images.buildingEnvelope, imageAlt:'Façade et enveloppe d’un bâtiment professionnel à rénover', updatedAt:'2026-09-10',
    intro:'Les Certificats d’Économies d’Énergie, ou CEE, peuvent contribuer au financement de certaines opérations. Le montant et l’éligibilité ne dépendent toutefois pas d’une simple liste d’équipements : ils doivent être vérifiés à partir du bénéficiaire, du site, de l’opération et des conditions de réalisation.',
    sections:[
      ['À quoi servent les CEE ?','Le dispositif impose aux fournisseurs d’énergie de soutenir des actions d’économies d’énergie. Pour une entreprise, cette contribution peut prendre la forme d’une prime ou d’un accompagnement associé à une opération éligible. Il ne s’agit ni d’un financement automatique ni d’un résultat garanti.'],
      ['Quand faut-il étudier le dossier ?','L’analyse doit intervenir avant l’engagement de l’opération. Les devis, dates, caractéristiques techniques et justificatifs doivent rester cohérents avec les exigences applicables. Commencer par le besoin technique évite de retenir un équipement uniquement parce qu’il semble aidé.'],
      ['Comment préparer une première qualification ?','Réunissez l’adresse et l’activité du site, les équipements existants, les usages, les caractéristiques du projet et le calendrier envisagé. Ces éléments permettent de distinguer une piste de financement d’une éligibilité réellement vérifiée.'],
    ],
    checklist:['Décrire le site et son activité','Identifier l’équipement existant','Définir l’opération envisagée','Vérifier les critères avant signature','Conserver les justificatifs du projet'],
    source:source('cee'), related:['/financement-cee','/solutions/calorifugeage','/solutions/gtb'], indexable:true,
  },
  {
    slug:'air-comprime-pertes', category:'Air comprimé',
    seoTitle:'Pertes d’air comprimé : diagnostic industriel',
    title:'Pertes d’air comprimé : comment diagnostiquer un réseau industriel ?',
    excerpt:'Fuites, pression, marche à vide, séchage et usages : une méthode claire pour analyser un réseau d’air comprimé avant de décider des actions.',
    image:images.airCompressor, imageAlt:'Compresseurs d’air dans un local technique industriel', updatedAt:'2026-09-10',
    intro:'Un réseau d’air comprimé doit être observé comme un système complet. Remplacer uniquement le compresseur peut laisser subsister les fuites, une pression excessive ou des usages inadaptés. Le diagnostic relie production, stockage, distribution et besoins réels.',
    sections:[
      ['Commencer par le profil de consommation','Les heures de fonctionnement, les séquences de charge et de marche à vide, la pression et les variations de demande donnent une première lecture. Les mesures doivent couvrir des périodes représentatives de l’activité.'],
      ['Rechercher les pertes sur le réseau','Les fuites se situent souvent aux raccords, flexibles, purgeurs et points d’usage. Leur détection doit être accompagnée d’un suivi des réparations afin de vérifier que la consommation de fond diminue réellement.'],
      ['Adapter la pression et les usages','Chaque niveau de pression supplémentaire peut alourdir les consommations et les pertes. Il faut néanmoins préserver les besoins du procédé, la qualité d’air et la stabilité du réseau avant toute modification.'],
    ],
    checklist:['Relever les heures de marche','Mesurer pression et débit','Cartographier les fuites','Contrôler les usages hors production','Suivre l’effet des corrections'],
    source:source('audit'), related:['/solutions/air-comprime','/solutions/moteurs-variateurs','/secteurs/industrie'], indexable:true,
  },
  {
    slug:'comprendre-la-gtb', category:'GTB',
    seoTitle:'GTB tertiaire : équipements à piloter',
    title:'GTB : quels équipements piloter dans un bâtiment tertiaire ?',
    excerpt:'Chauffage, ventilation, climatisation, éclairage et comptage : comprendre le rôle d’une gestion technique du bâtiment et préparer son périmètre.',
    image:images.controlPanel, imageAlt:'Armoire de contrôle d’une gestion technique du bâtiment', updatedAt:'2026-09-10',
    intro:'Une gestion technique du bâtiment centralise des informations et des commandes pour rendre l’exploitation plus lisible. Sa valeur ne vient pas du nombre d’écrans, mais de scénarios adaptés aux horaires, aux zones, aux usages et aux responsabilités des équipes.',
    sections:[
      ['Les équipements généralement concernés','La GTB peut superviser le chauffage, la ventilation, la climatisation, l’éclairage, les compteurs et certaines alarmes techniques. Le périmètre pertinent dépend des équipements déjà communicants et des décisions que l’exploitant doit prendre.'],
      ['Du comptage à l’action','Collecter des données sans définir les alertes, les seuils et les actions associées produit peu de valeur. Chaque indicateur doit répondre à une question d’exploitation : dérive horaire, consigne incohérente, surconsommation ou défaut de fonctionnement.'],
      ['Préparer un projet de GTB','Il faut recenser les installations, protocoles, automatismes, zones, calendriers et responsabilités. Une architecture simple, documentée et maintenable est préférable à une supervision complexe que personne ne peut exploiter.'],
    ],
    checklist:['Lister les équipements pilotables','Définir les usages par zone','Choisir des indicateurs utiles','Formaliser les scénarios horaires','Prévoir la maintenance et la formation'],
    source:source('tertiaire'), related:['/solutions/gtb','/solutions/pilotage-energetique','/secteurs/tertiaire'], indexable:true,
  },
  {
    slug:'valoriser-la-chaleur', category:'Récupération de chaleur',
    seoTitle:'Récupération de chaleur : trouver les gisements',
    title:'Récupération de chaleur : où identifier les gisements sur un site ?',
    excerpt:'Groupes froids, compresseurs et procédés : repérer une chaleur disponible, la qualifier et la rapprocher d’un besoin utile.',
    image:images.thermalProcess, imageAlt:'Équipements thermiques et tuyauteries sur un site industriel', updatedAt:'2026-09-10',
    intro:'La récupération de chaleur consiste à valoriser une énergie déjà présente avant d’en produire davantage. La faisabilité dépend autant de la source que du besoin : température, puissance, simultanéité, distance et continuité d’exploitation doivent être rapprochées.',
    sections:[
      ['Cartographier les sources','Les groupes frigorifiques, compresseurs d’air, fours, sécheurs, effluents et fumées peuvent rejeter de la chaleur. Un premier inventaire précise leur température, leur disponibilité et leur variation dans le temps.'],
      ['Identifier les besoins compatibles','Eau chaude, préchauffage d’air ou d’eau, chauffage de locaux et usages de procédé peuvent constituer des débouchés. Le besoin doit être suffisamment proche et simultané pour limiter les pertes et la complexité.'],
      ['Vérifier l’intégration technique','Échangeur, boucle hydraulique, stockage, pompe à chaleur éventuelle, régulation et solution de secours sont étudiés ensemble. La qualité du fluide et les contraintes sanitaires ou de production doivent aussi être prises en compte.'],
    ],
    checklist:['Lister les rejets thermiques','Mesurer température et disponibilité','Cartographier les besoins proches','Étudier la simultanéité','Évaluer l’intégration et le suivi'],
    source:source('audit'), related:['/solutions/recuperation-chaleur','/solutions/chaleur-fatale','/secteurs/agroalimentaire'], indexable:true,
  },
  {
    slug:'destratification-entrepot', category:'Logistique',
    seoTitle:'Déstratification d’un entrepôt : méthode',
    title:'Déstratification d’air en entrepôt : quand et comment l’étudier ?',
    excerpt:'Températures en hauteur, inconfort au sol et fonctionnement du chauffage : les indicateurs utiles dans un bâtiment logistique de grand volume.',
    image:images.warehouse, imageAlt:'Entrepôt logistique de grande hauteur avec éclairage industriel', updatedAt:'2026-09-10',
    intro:'Dans un volume chauffé de grande hauteur, l’air chaud peut s’accumuler sous la toiture alors que les zones occupées restent inconfortables. La déstratification cherche à homogénéiser les températures, mais elle doit être étudiée avec l’enveloppe, le chauffage et les mouvements d’air du site.',
    sections:[
      ['Mesurer l’écart vertical de température','Des relevés à plusieurs hauteurs et sur différentes périodes permettent de confirmer la stratification. Une mesure ponctuelle ne suffit pas lorsque les portes, l’activité ou la météo modifient rapidement les conditions.'],
      ['Observer l’exploitation réelle','Ouvertures de quais, circulation d’engins, zones de stockage et horaires de chauffage influencent le résultat. Le positionnement et le pilotage des appareils doivent respecter ces contraintes.'],
      ['Relier la solution au chauffage','La déstratification ne compense pas une enveloppe très dégradée ni un système de chauffage mal réglé. Elle s’intègre dans une lecture globale incluant isolation, programmation, régulation et maintenance.'],
    ],
    checklist:['Mesurer à plusieurs hauteurs','Repérer les zones occupées','Analyser les ouvertures de portes','Vérifier le système de chauffage','Définir le pilotage des appareils'],
    source:source('tertiaire'), related:['/solutions/destratification-air','/solutions/isolation-thermique','/secteurs/logistique'], indexable:true,
  },
  {
    slug:'regulation-froid', category:'Froid',
    seoTitle:'Régulation frigorifique : paramètres clés',
    title:'Régulation frigorifique : quels paramètres analyser en priorité ?',
    excerpt:'Pressions, températures, consignes, compresseurs et condensation : structurer le diagnostic d’une installation frigorifique professionnelle.',
    image:images.refrigerationPlant, imageAlt:'Compresseurs et tuyauteries d’une centrale frigorifique professionnelle', updatedAt:'2026-09-10',
    intro:'La performance d’une installation frigorifique dépend de la production, de la distribution, des consignes et des besoins. L’analyse doit préserver en priorité la température utile, la sécurité des produits et la continuité de fonctionnement.',
    sections:[
      ['Comparer les consignes aux besoins','Températures d’évaporation et de condensation, pression, surchauffe et horaires doivent être rapprochés des besoins réels. Des consignes trop conservatrices peuvent masquer un défaut ou augmenter la sollicitation des compresseurs.'],
      ['Observer la variation de charge','Le nombre de démarrages, la modulation, les séquences de compresseurs et le fonctionnement des condenseurs renseignent sur l’adaptation de l’installation. Les conditions extérieures doivent être intégrées à l’interprétation.'],
      ['Suivre après réglage','Toute modification doit être progressive, documentée et contrôlée. Le suivi vérifie simultanément la consommation, la stabilité des températures, les alarmes et la qualité de fonctionnement.'],
    ],
    checklist:['Historiser températures et pressions','Contrôler les consignes','Observer les séquences compresseurs','Intégrer les conditions extérieures','Vérifier les résultats après réglage'],
    source:source('audit'), related:['/solutions/regulation-froid','/solutions/haute-pression-flottante','/secteurs/commerce'], indexable:true,
  },
];
