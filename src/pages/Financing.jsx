import { MidContact } from '../components/MidContact';
import { QuickLeadSection } from '../features/quickLead/QuickLeadSection';
import { BusinessIcon } from '../components/BusinessIcon';
import { solutionIcons } from '../data/businessIcons';
import { StepIcon } from '../components/StepIcon';
import { heroImages } from '../data/heroImages';
import { ArrowDownRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, Container, Eyebrow, PageHero, Section } from '../components/ui';
import { Seo } from '../components/Seo';
import { Faq, OfficialSources } from '../components/sections';
import { breadcrumbSchema, faqSchema } from '../lib/structuredData';

const journey=[
  ['Votre projet','Nous partons du besoin réel : équipement concerné, usage, contraintes du site et objectif recherché.'],
  ['Vérification d’éligibilité','Les caractéristiques techniques du projet sont examinées afin d’identifier les dispositifs qui peuvent éventuellement être mobilisés.'],
  ['Montage du financement','Lorsque le projet s’y prête, les éléments nécessaires au dossier sont préparés en cohérence avec l’opération envisagée.'],
  ['Réalisation des travaux','Le projet peut ensuite être engagé selon le périmètre retenu et les conditions validées.'],
];

const projectFocus=[
  ['Votre installation','Comprendre l’existant, les équipements et leur fonctionnement.'],
  ['L’opération envisagée','Identifier précisément les travaux ou optimisations à étudier.'],
  ['Les dispositifs mobilisables','Examiner ensuite les solutions de financement compatibles avec le projet.'],
];

const studyPoints=[
  ['Nature des travaux','Type d’opération et solution technique envisagée.'],
  ['Installation existante','Équipements, fonctionnement et caractéristiques du site.'],
  ['Conditions du projet','Calendrier, contraintes d’exploitation et périmètre d’intervention.'],
  ['Possibilités de financement','Analyse des dispositifs pouvant être étudiés selon le projet.'],
];

const solutionLinks=[
  ['GTB et pilotage','/solutions/gtb'],
  ['CVC et pompes à chaleur','/solutions/cvc'],
  ['Calorifugeage et isolation','/solutions/calorifugeage'],
  ['Froid','/solutions/regulation-froid'],
  ['Récupération de chaleur','/solutions/recuperation-chaleur'],
  ['Moteurs et variateurs','/solutions/moteurs-variateurs'],
  ['Air comprimé','/solutions/air-comprime'],
  ['Éclairage','/solutions/eclairage'],
];

const financingFaq=[
  ['Comment se déroule l’étude de mon projet de financement ?', 'Nous commençons par comprendre le contexte technique, les équipements concernés et l’opération envisagée. Les possibilités de financement sont ensuite examinées en fonction des caractéristiques du projet.'],
  ['Le financement peut-il être étudié avant les travaux ?', 'Oui, et il est généralement préférable d’aborder ce sujet suffisamment tôt afin d’intégrer les éventuelles conditions du dispositif au montage du projet.'],
  ['Une opération est-elle automatiquement éligible aux CEE ?', 'Non. Une première qualification permet d’identifier des pistes, mais l’éligibilité doit être confirmée à partir des caractéristiques réelles de l’opération et des conditions applicables.'],
  ['Pouvez-vous garantir le montant du financement ?', 'Non. Le niveau éventuel de financement dépend du projet, du dispositif étudié et des conditions applicables au moment du montage du dossier.'],
  ['Quel est le rôle de Maîtrise Énergie ?', 'Notre rôle est de relier l’analyse technique du projet, l’étude des solutions pertinentes, les possibilités de financement et la préparation de sa mise en œuvre.'],
  ['Quelles informations préparer ?', 'La nature du bâtiment ou du site, les équipements concernés, le problème observé, les travaux déjà envisagés et, lorsqu’ils sont disponibles, certains éléments techniques sur l’installation.'],
];

export default function Financing(){
  return <>
    <Seo title="Financement CEE pour les entreprises" description="Comprendre les Certificats d’Économies d’Énergie, les conditions d’éligibilité et le calendrier à respecter pour financer des travaux professionnels." canonicalPath="/financement-cee" schema={[faqSchema(financingFaq),breadcrumbSchema([{name:'Accueil',path:'/'},{name:'Financement et CEE',path:'/financement-cee'}])]}/>
    <PageHero eyebrow="Financement & CEE" title="Financer des travaux énergétiques sans perdre de vue le besoin technique." text="Les Certificats d’Économies d’Énergie et d’autres dispositifs peuvent contribuer à certaines opérations. Leur mobilisation dépend du site, des équipements, du calendrier et des critères applicables." image={heroImages.facade} imageAlt="Façade d’un bâtiment tertiaire"/>

    <Section className="finance-section"><Container><div className="section-intro finance-intro"><Eyebrow>Point de départ</Eyebrow><h2>Le financement se construit autour du projet technique.</h2><p className="lead small">Une aide ou un dispositif de financement ne se détermine pas uniquement à partir du nom d’un équipement. L’analyse tient compte du site, de l’installation existante, de l’opération envisagée et de ses conditions de mise en œuvre.</p><p>C’est pourquoi nous commençons par comprendre le besoin technique avant d’étudier les mécanismes mobilisables.</p></div><div className="finance-focus-grid mobile-card-carousel">{projectFocus.map(([title,text],index)=><div key={title}><StepIcon name={["site","travaux","financement"][index]}/><span>0{index+1}</span><h3>{title}</h3><p>{text}</p></div>)}</div></Container></Section>

    <Section className="finance-section" tone="muted"><Container><div className="section-intro"><Eyebrow>Parcours de financement</Eyebrow><h2>Un dossier étudié dans le bon ordre.</h2><p className="lead small">Le financement s’intègre au projet au fil de sa qualification, sans présumer d’un résultat avant l’étude des éléments utiles.</p></div><div className="funding-flow">{journey.map(([title,text],index)=><span key={title}><div><StepIcon name={["site","etude","financement","travaux"][index]}/><b>{index+1}</b><h3>{title}</h3><p>{text}</p></div>{index<journey.length-1&&<ArrowDownRight/>}</span>)}</div></Container></Section>

    <Section className="finance-section"><Container className="content-split finance-cee"><div><Eyebrow>CEE</Eyebrow><h2>Les CEE : un levier à étudier avant d’engager certains travaux.</h2><p>Les Certificats d’Économies d’Énergie peuvent contribuer au financement de certaines opérations de performance énergétique. Leur mobilisation dépend toutefois de critères liés au projet, aux équipements et aux conditions de réalisation.</p><p>L’intérêt est donc d’étudier la question suffisamment tôt, avant de considérer qu’une opération est éligible ou de définir son montage financier.</p></div><aside className="finance-note"><span>Point de vigilance</span><strong>Une première qualification ne constitue pas une validation réglementaire définitive.</strong></aside></Container></Section>

    <Section className="finance-section official-section" tone="muted"><Container><OfficialSources items={[
      ['Certificats d’Économies d’Énergie','https://www.ecologie.gouv.fr/politiques-publiques/dispositif-certificats-deconomies-denergie','Présentation officielle du dispositif et de son fonctionnement.'],
      ['Fiches d’opérations standardisées CEE','https://www.ecologie.gouv.fr/politiques-publiques/operations-standardisees-deconomies-denergie','Conditions techniques publiées par le ministère.'],
      ['Aides aux entreprises — ADEME','https://agirpourlatransition.ademe.fr/entreprises/aides-financieres','Panorama public des dispositifs disponibles.'],
    ]}/></Container></Section>

<MidContact sourceCta="financing_mid_contact" title="Préparons l’étude de votre financement." label="Étudier le financement de mon projet"/>
    <Section className="finance-section" tone="muted"><Container><div className="section-intro"><Eyebrow>Analyse</Eyebrow><h2>Ce que nous étudions.</h2></div><div className="finance-study-grid mobile-card-carousel">{studyPoints.map(([title,text],index)=><div key={title}><StepIcon name={["travaux","site","etude","financement"][index]}/><h3>{title}</h3><p>{text}</p></div>)}</div></Container></Section>

    <Section className="finance-section"><Container className="content-split finance-why"><div><Eyebrow>En amont</Eyebrow><h2>Pourquoi étudier le financement avant les travaux ?</h2></div><div><p>La conception technique et le financement ne doivent pas être traités comme deux sujets indépendants. Les caractéristiques du projet peuvent influencer les dispositifs mobilisables, tandis que les exigences d’un mécanisme de financement peuvent imposer certaines vérifications avant l’engagement des travaux.</p><p>L’objectif est donc de construire un projet cohérent dès le départ, plutôt que de chercher un financement une fois l’opération déjà définie ou engagée.</p></div></Container></Section>

    <Section className="finance-section finance-reassurance" tone="dark"><Container className="content-split"><div><Eyebrow>Notre approche</Eyebrow><h2>Un accompagnement qui reste d’abord technique.</h2></div><div><p>Le financement ne doit pas conduire à choisir une opération uniquement parce qu’elle semble aidée. Nous partons d’abord du fonctionnement du site et des actions pertinentes à étudier.</p><p>L’objectif est de relier performance énergétique, faisabilité technique, financement et réalisation dans un même parcours de projet.</p></div></Container></Section>

    <Section className="finance-section" tone="muted"><Container><div className="section-intro"><Eyebrow>Solutions concernées</Eyebrow><h2>Des dispositifs à étudier selon la nature de l’opération.</h2><p className="lead small">Les possibilités varient fortement selon les travaux et les caractéristiques du site. Chaque opération doit donc être qualifiée individuellement.</p></div><div className="finance-solutions mobile-card-carousel">{solutionLinks.map(([label,to])=><Link key={to} to={to}><BusinessIcon name={solutionIcons[to.split("/").pop()]}/><span>{label}</span><ArrowDownRight size={18}/></Link>)}</div></Container></Section>

    <Section className="finance-section"><Container><div className="faq-layout"><div><Eyebrow>Questions fréquentes</Eyebrow><h2>Préparer l’étude de financement.</h2><p className="lead small">Des réponses utiles avant un premier échange sur votre projet.</p></div><Faq items={financingFaq}/></div></Container></Section>

    <Section className="finance-cta"><Container><div><Eyebrow>Première qualification</Eyebrow><h2>Vous avez un projet de performance énergétique ?</h2><p>Décrivez votre site et les travaux envisagés pour réaliser une première qualification.</p></div><div className="button-row"><Button to="/eligibilite" sourceCta="financing_final_eligibility">Vérifier mon éligibilité</Button><Button to="/contact" variant="secondary" sourceCta="financing_final_contact">Parler de mon projet</Button></div></Container></Section>
    <QuickLeadSection variant="financing" tone="" heading="Estimer le financement de votre projet"/>
  </>;
}
