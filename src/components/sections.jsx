import { BusinessIcon } from './BusinessIcon';
import { useState } from 'react';
import { ArrowRight, ClipboardCheck, Landmark, ListChecks, MoveRight, Plus, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { solutions } from '../data/solutions';
import { sectors } from '../data/sectors';
import { Button, Container, Eyebrow, Section } from './ui';

export function FinalCta({title='Parlons de vos installations.',text='Décrivez votre site. Nous vous aidons à clarifier les premiers leviers à étudier.',eyebrow='Première étape',sourceCta='final_contact',solutionInterest,sectorInterest}){return <Section className="final-cta"><Container><div><Eyebrow>{eyebrow}</Eyebrow><h2>{title}</h2><p>{text}</p></div><Button to="/eligibilite" sourceCta={sourceCta} solutionInterest={solutionInterest} sectorInterest={sectorInterest}>Vérifier mon éligibilité</Button></Container></Section>}
export function ProcessBar() {
  const steps = [
    [ClipboardCheck, 'Qualifier', 'Nous consacrons le temps nécessaire à comprendre votre site, vos équipements, vos usages et vos objectifs avant toute recommandation.'],
    [ListChecks, 'Prioriser', 'L’analyse identifie les gisements les plus pertinents et classe les actions selon leur retour sur investissement et leur faisabilité technique.'],
    [Landmark, 'Financer', 'Nous cartographions CEE, MaPrimeRénov’, subventions locales et Éco-PTZ, et vous aidons à structurer le plan de financement.'],
    [Wrench, 'Réaliser', 'Pilotage des travaux, coordination des intervenants, contrôle de conformité et suivi des économies après réalisation.'],
  ];
  return <section className="process" id="notre-methode" aria-labelledby="method-title">
    <Container className="process-intro">
      <Eyebrow>Notre méthode</Eyebrow>
      <h2 id="method-title">De votre besoin aux travaux réalisés.</h2>
      <p className="lead">Une démarche structurée, sans improvisation, de l’étude à la livraison.</p>
    </Container>
    <Container>{steps.map(([Icon, label, text], index) => <div className="process-step" key={label}>
      <div><small>0{index + 1}</small><Icon size={32} aria-hidden="true"/><h3>{label}</h3></div>
      <p>{text}</p>
      {index < steps.length - 1 && <MoveRight className="process-arrow" aria-hidden="true"/>}
    </div>)}</Container>
  </section>;
}
export function Faq({subject,items}){const [open,setOpen]=useState(0);const questions=items||[[`Comment se déroule l’étude de ${subject} ?`,'Nous analysons d’abord le contexte technique et les usages du site avant de préciser les pistes adaptées.'],['Le financement peut-il être étudié avant les travaux ?','Oui, les possibilités peuvent être examinées à partir du contexte technique du projet, sans promesse de résultat.'],['Quel est le rôle de Maîtrise Énergie ?','Notre rôle est de relier étude, préparation, travaux et pilotage à la réalité de l’installation.']];return <div className="faq">{questions.map(([question,answer],index)=><div key={question}><button onClick={()=>setOpen(open===index?-1:index)} aria-expanded={open===index}>{question}<Plus className={open===index?'rotate':''}/></button>{open===index&&<p>{answer}</p>}</div>)}</div>}
export function RelatedContent({solution}){const relatedSolutions=solutions.filter(item=>solution.relatedSolutions.includes(item.slug));const relatedSectors=sectors.filter(item=>solution.relatedSectors.includes(item.slug));return <Section tone="muted"><Container><div className="section-intro"><Eyebrow>Pour aller plus loin</Eyebrow><h2>Des contenus reliés à votre projet.</h2></div><div className="related-grid mobile-card-carousel">{relatedSolutions.map(item=><Link key={item.slug} to={`/solutions/${item.slug}`}><BusinessIcon name={item.icon} size={26}/><span>Solution complémentaire</span><b>{item.title}</b><ArrowRight size={17}/></Link>)}{relatedSectors.slice(0,2).map(item=><Link key={item.slug} to={`/secteurs/${item.slug}`}><BusinessIcon name={item.icon} size={26}/><span>Secteur concerné</span><b>{item.title}</b><ArrowRight size={17}/></Link>)}</div></Container></Section>}
