import { MidContact } from '../components/MidContact';
import { StepIcon } from '../components/StepIcon';
import { heroImages } from '../data/heroImages';
import { useParams } from 'react-router-dom';
import { sectors } from '../data/sectors';
import { solutions } from '../data/solutions';
import { Button, Container, Eyebrow, PageHero, Section } from '../components/ui';
import { Seo } from '../components/Seo';
import { SolutionCard } from '../components/cards';
import { Faq, FinalCta } from '../components/sections';
import NotFound from './NotFound';

export default function SectorDetail() {
  const { slug } = useParams();
  const sector = sectors.find((item) => item.slug === slug);
  if (!sector) return <NotFound/>;
  const matchingSolutions = solutions.filter((solution) => solution.relatedSectors.includes(slug));
  const faq = [
    [`Par où commencer sur un site ${sector.title.toLowerCase()} ?`, 'Une première lecture des usages, des équipements et des contraintes d’exploitation permet de cibler les postes à examiner.'],
    ['Les travaux doivent-ils concerner tout le site ?', 'Non. Le périmètre peut être progressif et s’appuyer sur les priorités techniques identifiées.'],
    ['Le financement est-il systématique ?', 'Les dispositifs éventuels dépendent de l’opération, du site et des conditions applicables. Ils sont étudiés sans promesse préalable.'],
  ];
  return <><Seo title={sector.title} description={sector.description}/>
    <PageHero icon={sector.icon} eyebrow="Secteur" title={sector.title} text={sector.description} image={heroImages.facade} imageAlt=""><Button to="/eligibilite" sourceCta={`sector_${slug}_contact`} sectorInterest={slug}>Vérifier mon éligibilité</Button></PageHero>
    <Section><Container><div className="section-intro two"><div><Eyebrow>Enjeux typiques</Eyebrow><h2>Relier les postes énergétiques à l’activité du site.</h2></div><p>Les priorités se précisent avec les usages, les horaires, les équipements et les impératifs de continuité propres à votre environnement.</p></div><div className="symptom-list mobile-card-carousel">{sector.challenges.map((challenge, index) => <div key={challenge}><StepIcon name="diagnostic"/><span>0{index + 1}</span><p>{challenge}</p></div>)}</div></Container></Section>
    <Section tone="muted"><Container><div className="section-intro"><Eyebrow>Postes à examiner</Eyebrow><h2>Les équipements qui structurent l’analyse.</h2></div><div className="site-map mobile-card-carousel">{sector.items.map((item,index)=><div key={item}><StepIcon name="site"/><span>{String(index+1).padStart(2,'0')}</span><h3>{item}</h3><p>Poste à examiner avec les conditions d’usage, les réglages et les interactions avec les autres équipements.</p></div>)}</div></Container></Section>
    <Section><Container><div className="section-intro"><Eyebrow>Solutions adaptées</Eyebrow><h2>Des leviers reliés à votre secteur.</h2><p className="lead small">Les solutions ci-dessous sont sélectionnées à partir des relations présentes dans les données du projet.</p></div><div className="solutions-grid mobile-card-carousel">{matchingSolutions.map((solution) => <SolutionCard key={solution.slug} solution={solution}/>)}</div></Container></Section>
<MidContact sourceCta="sector_mid_contact" sectorInterest={slug} title="Parlons des contraintes de votre site."/>
    <Section tone="muted"><Container className="content-split"><div><Eyebrow>Méthode</Eyebrow><h2>Comprendre avant de prioriser.</h2><p className="lead small">L’analyse du site tient compte de l’exploitation réelle, des équipements en place et des conditions de mise en œuvre. Les étapes suivantes sont définies selon le périmètre confirmé.</p></div><div className="technical-principle"><StepIcon name="etude"/><span>Financement</span><strong>À étudier selon le projet</strong><p>Les possibilités éventuelles sont examinées selon l’opération, les caractéristiques du site et les conditions applicables.</p><Button to="/eligibilite" variant="secondary" sourceCta={`sector_${slug}_eligibility`} sectorInterest={slug}>Vérifier mon éligibilité</Button></div></Container></Section>
    <Section><Container className="faq-layout"><div><Eyebrow>Questions fréquentes</Eyebrow><h2>Préparer votre projet.</h2></div><Faq subject={`un site ${sector.title.toLowerCase()}`} items={faq}/></Container></Section>
    <FinalCta title="Étudier les priorités de votre site." text={`Présentez votre contexte ${sector.title.toLowerCase()} et les équipements concernés pour orienter la première analyse.`} label={sector.cta} sourceCta={`sector_${slug}_final`} sectorInterest={slug}/>
  </>;
}
