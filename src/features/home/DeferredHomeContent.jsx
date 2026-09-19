import { CardCarousel } from '../../components/CardCarousel';
import { Button, Container, Eyebrow, Section } from '../../components/ui';
import { ArticleCard, CaseCard } from '../../components/cards';
import { ContactForm } from '../contact/ContactForm';
import { siteConfig } from '../../config/siteConfig';
import { usePageData } from '../../hooks/usePageData';
import { contentKeys, loadBlogPosts, loadCaseStudies } from '../../services/contentService';

function HomeCaseStudies() {
  const { status, data } = usePageData(contentKeys.caseStudyList, loadCaseStudies);
  if (status !== 'success' || !data?.length) return null;
  return <Section tone="muted"><Container><div className="section-intro"><Eyebrow>Cas d’usage</Eyebrow><h2>Des exemples d’intervention à adapter à votre site.</h2><p className="lead small">Ces scénarios illustrent des approches possibles. Ils ne constituent pas des références clients ni des résultats garantis.</p></div><p className="demo-note">Exemples de présentation</p><CardCarousel label="Nos cas d’usage">{data.map((item) => <CaseCard item={item} key={item.slug}/>)}</CardCarousel></Container></Section>;
}

function HomeBlog() {
  const { status, data } = usePageData(contentKeys.blogList, loadBlogPosts);
  if (status !== 'success' || !data?.length) return null;
  return <Section><Container><div className="section-intro"><Eyebrow>Ressources</Eyebrow><h2>Comprendre les leviers avant de lancer un projet.</h2><p className="lead small">Des repères pratiques pour préparer une réflexion sur le pilotage, les flux thermiques et les financements.</p></div><CardCarousel label="Nos articles">{data.slice(0, 6).map((item) => <ArticleCard item={item} key={item.slug}/>)}</CardCarousel><p style={{ marginTop: '1.5rem' }}><Button to="/ressources" variant="secondary" sourceCta="home_resources">Toutes les ressources</Button></p></Container></Section>;
}

function ContactProject() {
  const { contact } = siteConfig;
  return <Section tone="muted"><Container><div className="contact-home-grid"><div>
    <Eyebrow>Contact</Eyebrow><h2>Parlons de votre projet photovoltaïque.</h2>
    <p className="lead small">Une première discussion permet de situer la surface disponible, votre facture électrique et les contraintes du site.</p>
    <div className="contact-location">
      <strong>Coordonnées et accompagnement</strong>
      <p>{contact.serviceArea}</p>
      {contact.address ? <p>{contact.address}</p> : <p className="config-placeholder">Adresse à renseigner avant publication.</p>}
      {contact.mapEmbedUrl ? <iframe title="Localisation de Maîtrise Énergie" src={contact.mapEmbedUrl} loading="lazy"/> : import.meta.env.DEV && <div className="map-placeholder">Emplacement prévu pour la carte de localisation.</div>}
    </div>
  </div><div className="contact-form"><ContactForm/></div></div></Container></Section>;
}

export default function DeferredHomeContent() {
  return <><HomeCaseStudies/><HomeBlog/><ContactProject/></>;
}
