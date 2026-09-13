import { StepIcon } from '../components/StepIcon';
import { heroImages } from '../data/heroImages';
import { CardCarousel } from '../components/CardCarousel';
import { ArrowRight } from 'lucide-react';
import { images } from '../data/images';
import { solutionCategories, solutions } from '../data/solutions';
import { Button, Container, Eyebrow, PageHero, Section } from '../components/ui';
import { Seo } from '../components/Seo';
import { SolutionCard } from '../components/cards';
import { Faq, FinalCta } from '../components/sections';
import { breadcrumbSchema, itemListSchema } from '../lib/structuredData';

const groupContent = {'Pilotage & supervision':['Rendre les décisions visibles.','Mesurer, superviser et régler les équipements dans la durée.'],'Chauffage & CVC':['Produire et distribuer avec précision.','Adapter les équipements thermiques et de traitement d’air aux usages du site.'],'Isolation & performance thermique':['Conserver l’énergie utile.','Réduire les pertes de l’enveloppe et des réseaux tout en respectant l’exploitation.'],Froid:['Ajuster la production frigorifique.','Lire les pressions, températures et besoins de l’installation pour orienter les réglages.'],'Récupération & chaleur':['Valoriser les flux disponibles.','Étudier les rejets thermiques et les besoins proches avant de produire davantage.'],'Utilités & équipements':['Faire correspondre la puissance aux usages.','Observer moteurs, air comprimé et éclairage dans leur contexte réel.']};

export default function Solutions() {
  const groups = solutionCategories;
  const schema=[breadcrumbSchema([{name:'Accueil',path:'/'},{name:'Solutions',path:'/solutions'}]),itemListSchema(solutions.map((item)=>({name:item.title,path:`/solutions/${item.slug}`})))];
  return <><Seo title="Solutions énergétiques pour les entreprises" description="GTB, CVC, froid, isolation, récupération de chaleur, air comprimé et moteurs : explorez les solutions adaptées aux bâtiments et sites industriels." canonicalPath="/solutions" image={heroImages.industry} imageAlt="Installation énergétique sur un site industriel" schema={schema}/>
    <PageHero eyebrow="Solutions énergétiques" title="Améliorer la performance de vos bâtiments et installations." text="Chaque solution répond à un usage, un équipement et un contexte. Comparez les leviers de pilotage, chauffage, froid, isolation, récupération de chaleur et utilités industrielles." image={heroImages.industry} imageAlt="Installation énergétique sur un site industriel"><Button to="/eligibilite" sourceCta="solutions_hero_contact">Vérifier mon éligibilité</Button></PageHero>
    <Section className="solutions-catalog"><Container>{groups.map((group, index) => { const [title, text] = groupContent[group]; return <div className="solution-group" key={group}><div><Eyebrow>{group}</Eyebrow><h2>{title}</h2><p>{text}</p></div><CardCarousel label={group}>{solutions.filter((solution) => solution.category === group).map((solution) => <SolutionCard solution={solution} key={solution.slug}/>)}</CardCarousel>{index === 2 && <div className="solutions-mid-cta"><div><Eyebrow>Votre installation</Eyebrow><h2>Parlons de vos installations.</h2><p>Un échange initial permet de situer le besoin, les contraintes du site et les prochaines étapes pertinentes.</p><Button to="/eligibilite" sourceCta="solutions_mid_contact">Vérifier mon éligibilité</Button></div><div className="flow-diagram"><div><StepIcon name="diagnostic"/><span>01</span><b>Diagnostic</b></div><ArrowRight/><div><StepIcon name="conception"/><span>02</span><b>Conception</b></div><ArrowRight/><div><StepIcon name="travaux"/><span>03</span><b>Travaux</b></div><ArrowRight/><div><StepIcon name="pilotage"/><span>04</span><b>Pilotage</b></div></div></div>}</div>; })}</Container></Section>
    <Section tone="muted"><Container><div className="faq-layout"><div><Eyebrow>Questions fréquentes</Eyebrow><h2>Choisir une solution adaptée.</h2></div><Faq subject="vos installations" items={[["Comment choisir les premières solutions à étudier ?", "Nous partons des équipements, des usages et des contraintes du site pour hiérarchiser les pistes."], ["Faut-il traiter tous les équipements en même temps ?", "Non. Le programme peut être progressif et se concentrer sur les leviers les plus cohérents pour votre situation."], ["Le pilotage intervient-il après les travaux ?", "Le pilotage peut être pensé dès la conception afin de faciliter les réglages, le suivi et l’exploitation."]]}/></div></Container></Section>
    <FinalCta/>
  </>;
}
