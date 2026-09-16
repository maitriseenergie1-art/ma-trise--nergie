import { MidContact } from '../components/MidContact';
import { StepIcon } from '../components/StepIcon';
import { useParams } from 'react-router-dom';
import { solutions } from '../data/solutions';
import { siteConfig } from '../config/siteConfig';
import { Button, Container, Eyebrow, PageHero, Section } from '../components/ui';
import { Seo } from '../components/Seo';
import { Faq, FinalCta, RelatedContent } from '../components/sections';
import { absoluteUrl, breadcrumbSchema, faqSchema } from '../lib/structuredData';
import NotFound from './NotFound';

function Flow() {
  const labels = ['Analyse', 'Mesure', 'Étude', 'Proposition', 'Réglage', 'Suivi'];
  const icons = ['diagnostic', 'conception', 'etude', 'financement', 'pilotage', 'suivi'];
  return <ol className="method-flow">{labels.map((label, index) => <li key={label}>
    <span className="method-flow-icon"><StepIcon name={icons[index]}/></span>
    <span className="method-flow-index">{String(index + 1).padStart(2, '0')}</span>
    <span className="method-flow-label">{label}</span>
  </li>)}</ol>;
}

export default function SolutionDetail() {
  const { slug } = useParams();
  const solution = solutions.find((item) => item.slug === slug);
  if (!solution) return <NotFound/>;
  const faq = [
    [`Quels éléments de ${solution.title.toLowerCase()} doivent être examinés ?`, `${solution.equipment.slice(0, 4).join(', ')} sont étudiés avec les usages et les contraintes réelles du site.`],
    [`Comment interpréter ce signal : ${solution.symptoms[0].replace(/\.$/, '')} ?`, 'Ce constat ne suffit pas à lui seul. Il sert à orienter les premières vérifications techniques et les mesures utiles.'],
    ['Le financement peut-il être étudié ?', 'Selon l’opération, les caractéristiques du site et les conditions applicables, des dispositifs peuvent être examinés avant la décision.'],
  ];
  const path=`/solutions/${slug}`;
  const description=`${solution.benefit} Découvrez les contrôles, la méthode d’étude et les financements éventuels pour un site professionnel.`;
  return <><Seo title={`${solution.title} pour les professionnels`} description={description} canonicalPath={path} image={solution.heroImage} imageAlt={solution.heroAlt} schema={[{'@context':'https://schema.org','@type':'Service',name:solution.title,description,provider:{'@type':'Organization',name:siteConfig.name,url:absoluteUrl('/')},areaServed:'France'},faqSchema(faq),breadcrumbSchema([{name:'Accueil',path:'/'},{name:'Solutions',path:'/solutions'},{name:solution.title,path}])]}/>
    <PageHero icon={solution.icon} eyebrow="Solution de performance énergétique" title={solution.title} text={solution.problem} image={solution.heroImage} imageAlt={solution.heroAlt}><div className="button-row"><Button to="/contact" variant="secondary" sourceCta={`solution_${slug}_contact`} solutionInterest={slug}>{solution.cta}</Button><Button to="/eligibilite" sourceCta={`solution_${slug}_eligibility`} solutionInterest={slug}>Vérifier mon éligibilité</Button></div></PageHero>
    <Section className="symptoms"><Container><div className="section-intro two"><div><Eyebrow>Point de départ</Eyebrow><h2>Cette situation vous concerne-t-elle&nbsp;?</h2></div><p>{solution.problem}</p></div><div className="symptom-list mobile-card-carousel">{solution.symptoms.map((item,index)=><div key={item}><StepIcon name="diagnostic"/><span>0{index+1}</span><p>{item}</p></div>)}</div></Container></Section>
    <Section tone="muted"><Container className="content-split"><div><Eyebrow>Enjeu & principe</Eyebrow><h2>Réduire les dérives avant d’ajouter de la complexité.</h2><p className="lead small">{solution.benefit} L’analyse vise d’abord à comprendre ce qui se passe sur l’installation, puis à définir une réponse technique proportionnée.</p></div><div className="technical-principle"><StepIcon name="etude"/><span>Objectif</span><strong>{solution.benefit}</strong><p>Les équipements, les flux et les réglages sont examinés dans leur contexte réel d’usage.</p></div></Container></Section>
    <Section><Container><div className="section-intro"><Eyebrow>Méthode</Eyebrow><h2>Une séquence lisible, à adapter au périmètre du projet.</h2><p className="lead small">Analyse, mesure, étude et proposition structurent le projet. Le financement, les travaux et le suivi sont étudiés lorsque leur périmètre est confirmé.</p></div><Flow/></Container></Section>
    <Section tone="muted"><Container className="content-split"><div><Eyebrow>Financement</Eyebrow><h2>Étudier les possibilités sans les présumer.</h2><p className="lead small">Un dispositif CEE ou une autre aide peut éventuellement contribuer au projet selon l’opération, le site et les conditions applicables. L’éligibilité est vérifiée avant tout engagement.</p><Button to="/financement-cee" variant="secondary" sourceCta={`solution_${slug}_funding`} solutionInterest={slug}>Comprendre le financement</Button></div><div className="equipment-list"><StepIcon name="pilotage"/><span>Équipements et interfaces à considérer</span><p>{solution.equipment.join(' · ')}.</p></div></Container></Section>
<MidContact sourceCta="solution_mid_contact" solutionInterest={slug} title="Précisons les priorités de votre installation." label="Échanger sur votre installation"/>
    <RelatedContent solution={solution}/>
    <Section><Container className="faq-layout"><div><Eyebrow>Questions fréquentes</Eyebrow><h2>Préparer l’étude.</h2></div><Faq subject={solution.title.toLowerCase()} items={faq}/></Container></Section>
    <FinalCta title="Passer d’un constat à une étude utile." text={`Décrivez votre installation de ${solution.title.toLowerCase()}. Nous vous aidons à préciser les premières questions à traiter.`} label={solution.cta} sourceCta={`solution_${slug}_final`} solutionInterest={slug}/>
  </>;
}
