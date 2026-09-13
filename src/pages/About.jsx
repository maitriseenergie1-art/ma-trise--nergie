import { CheckCircle2 } from 'lucide-react';
import { Button, Container, Eyebrow, PageHero, Section } from '../components/ui';
import { OfficialSources, ProcessBar } from '../components/sections';
import { Seo } from '../components/Seo';
import { QuickLeadSection } from '../features/quickLead/QuickLeadSection';
import { heroImages } from '../data/heroImages';
import { breadcrumbSchema, organizationSchema } from '../lib/structuredData';

const commitments = [
  ['Partir des usages réels','Les horaires, les contraintes d’exploitation et le comportement des équipements précèdent le choix d’une solution.'],
  ['Distinguer hypothèse et résultat','Une piste d’économie ou de financement reste à confirmer par les mesures, l’étude et les critères applicables.'],
  ['Rendre les décisions compréhensibles','Le périmètre, les priorités, les dépendances et les prochaines étapes doivent pouvoir être compris par les équipes.'],
  ['Prévoir le suivi','Une action n’est utile que si son fonctionnement et ses effets peuvent être vérifiés après mise en œuvre.'],
];

export default function About(){return <>
  <Seo title="Notre méthode d’ingénierie énergétique" description="Découvrez l’approche de Maîtrise Énergie : analyser les usages, mesurer les installations, prioriser les actions et suivre la performance des sites professionnels." canonicalPath="/a-propos" image={heroImages.architecture} imageAlt="Architecture d’un bâtiment professionnel" schema={[organizationSchema(),breadcrumbSchema([{name:'Accueil',path:'/'},{name:'À propos',path:'/a-propos'}])]}/>
  <PageHero eyebrow="Notre approche" title="La performance énergétique commence par une compréhension précise du site." text="Nous relions les usages, les équipements, la faisabilité technique, le financement éventuel et le suivi pour construire une décision exploitable." image={heroImages.architecture} imageAlt="Architecture d’un bâtiment professionnel"><Button to="/contact" variant="secondary">Présenter mon projet</Button></PageHero>
  <Section><Container className="content-split about-mission"><div><Eyebrow>Mission</Eyebrow><h2>Faire de la technique un levier de décision.</h2></div><div><p className="lead small">Maîtrise Énergie accompagne les professionnels qui souhaitent comprendre leurs consommations et structurer un projet réaliste.</p><p>Notre rôle n’est pas de proposer une opération standard à partir d’un mot-clé. Il faut mettre en relation le bâtiment, le procédé, l’exploitation, les données disponibles et les objectifs de l’entreprise.</p></div></Container></Section>
  <ProcessBar/>
  <Section tone="muted"><Container><div className="section-intro two"><div><Eyebrow>Principes de travail</Eyebrow><h2>Des recommandations traçables et proportionnées.</h2></div><p>Ces engagements structurent la première qualification, l’étude et la préparation d’une intervention.</p></div><div className="trust-grid">{commitments.map(([title,text])=><article key={title}><CheckCircle2 aria-hidden="true"/><h3>{title}</h3><p>{text}</p></article>)}</div></Container></Section>
  <Section><Container><OfficialSources items={[
    ['ADEME — audit énergétique en entreprise','https://agirpourlatransition.ademe.fr/entreprises/conseils/industrie/decarbonation/etat-des-lieux/audit-energetique','Méthodes et repères pour analyser les usages et les flux.'],
    ['Ministère — Éco Énergie Tertiaire','https://www.ecologie.gouv.fr/politiques-publiques/eco-energie-tertiaire-eet','Objectifs, assujettissement et plateforme OPERAT.'],
  ]}/></Container></Section>
  <QuickLeadSection variant="generic"/>
</>}
