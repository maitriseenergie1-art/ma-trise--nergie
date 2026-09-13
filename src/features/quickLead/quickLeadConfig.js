// Compact conversion forms, one variant per lead intent. The wording is tuned
// per context so the visitor recognises their own situation.
export const QUICK_LEAD_VARIANTS = {
  generic: {
    projectType: 'Étude énergétique',
    heading: 'Parlons de votre projet',
    text: 'Laissez vos coordonnées : nous revenons vers vous pour cadrer les premières pistes.',
    cta: 'Être recontacté',
  },
  solution: {
    projectType: 'Étude — solution ciblée',
    heading: 'Étudier cette solution sur votre site',
    text: 'Décrivez brièvement votre installation : nous vous rappelons pour en parler concrètement.',
    cta: 'Demander une étude',
  },
  sector: {
    projectType: 'Étude — secteur',
    heading: 'Évaluer les priorités énergétiques de votre site',
    text: 'Un échange court permet de cibler les postes à examiner en premier.',
    cta: 'Être recontacté',
  },
  financing: {
    projectType: 'Financement CEE',
    heading: 'Estimer le financement de votre projet',
    text: 'Nous vérifions les dispositifs mobilisables à partir de votre contexte, avant tout engagement.',
    cta: 'Vérifier mon financement',
  },
  caseStudy: {
    projectType: 'Projet comparable',
    heading: 'Un projet comparable sur votre site ?',
    text: 'Dites-nous où vous en êtes : nous vous rappelons pour en discuter.',
    cta: 'En parler',
  },
  blog: {
    projectType: 'Question technique',
    heading: 'Une question sur votre installation ?',
    text: 'Posez votre question : un spécialiste vous répond.',
    cta: 'Poser ma question',
  },
  resource: {
    projectType: 'Accompagnement',
    heading: 'Besoin d’un accompagnement ?',
    text: 'Nous vous aidons à transformer ces repères en plan d’action.',
    cta: 'Être recontacté',
  },
};

export const resolveVariant = (name) => QUICK_LEAD_VARIANTS[name] || QUICK_LEAD_VARIANTS.generic;
