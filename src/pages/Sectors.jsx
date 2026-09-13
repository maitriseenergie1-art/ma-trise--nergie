import { heroImages } from '../data/heroImages';
import { sectors } from '../data/sectors';
import { Container, Eyebrow, PageHero, Section } from '../components/ui';
import { Seo } from '../components/Seo';
import { SectorCard } from '../components/cards';
import { QuickLeadSection } from '../features/quickLead/QuickLeadSection';
import { breadcrumbSchema, itemListSchema } from '../lib/structuredData';

export default function Sectors() {
  const schema = [
    breadcrumbSchema([{ name:'Accueil', path:'/' }, { name:'Secteurs', path:'/secteurs' }]),
    itemListSchema(sectors.map((item) => ({ name:item.title, path:`/secteurs/${item.slug}` }))),
  ];
  return <>
    <Seo title="Performance énergétique par secteur d’activité" description="Industrie, tertiaire, logistique, commerce, agroalimentaire et santé : identifiez les usages et solutions énergétiques adaptés à votre activité." canonicalPath="/secteurs" image={heroImages.facade} imageAlt="Bâtiment professionnel moderne" schema={schema}/>
    <PageHero eyebrow="Secteurs professionnels" title="Une stratégie énergétique adaptée à chaque activité." text="Les usages, horaires, équipements et contraintes de continuité changent selon le secteur. Explorez les postes à analyser avant de définir un projet." image={heroImages.facade} imageAlt="Façade d’un bâtiment professionnel moderne"/>
    <Section><Container>
      <div className="section-intro two"><div><Eyebrow>Choisir votre contexte</Eyebrow><h2>Comprendre les consommations à partir du terrain.</h2></div><p>Chaque page rassemble les enjeux typiques, les équipements concernés et les solutions à rapprocher de l’exploitation réelle du site.</p></div>
      <div className="sector-grid full mobile-card-carousel">{sectors.map((sector)=><SectorCard sector={sector} key={sector.slug}/>)}</div>
    </Container></Section>
    <QuickLeadSection variant="sector"/>
  </>;
}
