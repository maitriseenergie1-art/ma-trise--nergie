import { MidContact } from '../components/MidContact';
import { heroImages } from '../data/heroImages';
import { CardCarousel } from '../components/CardCarousel';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck, Landmark, Wrench, MonitorCog, ArrowLeft, ArrowRight, HandHeart, Layers3, LockKeyhole, ScanSearch } from 'lucide-react';
import { images } from '../data/images';
import { solutions } from '../data/solutions';
import { sectors } from '../data/sectors';
import { trackEvent } from '../services/analyticsService';
import { usePageData } from '../hooks/usePageData';
import { contentKeys, loadBlogPosts, loadCaseStudies } from '../services/contentService';
import { siteConfig } from '../config/siteConfig';
import { Button, Container, Eyebrow, Section } from '../components/ui';
import { Seo } from '../components/Seo';
import { ArticleCard, CaseCard, SectorCard, SolutionCard } from '../components/cards';
import { faqSchema, organizationSchema, websiteSchema } from '../lib/structuredData';
import { Faq, ProcessBar } from '../components/sections';
import { ContactForm } from '../features/contact/ContactForm';

function SectorCarousel() {
  const [start, setStart] = useState(0);
  const visible = sectors.slice(start, start + 3);
  const previous = () => setStart((value) => Math.max(0, value - 3));
  const next = () => setStart((value) => Math.min(sectors.length - 3, value + 3));

  return <div className="sector-carousel">
    <div className="sector-carousel-header">
      <div>
        <Eyebrow>Secteurs</Eyebrow>
        <h2>Nos secteurs d’activité</h2>
        <p className="lead small">Nos expertises s’adaptent aux environnements industriels, tertiaires, logistiques et spécialisés.</p>
      </div>
      <div className="carousel-controls desktop-sector-controls">
        <button type="button" onClick={previous} disabled={start === 0} aria-label="Afficher les secteurs précédents"><ArrowLeft size={18}/></button>
        <button type="button" onClick={next} disabled={start >= sectors.length - 3} aria-label="Afficher les secteurs suivants"><ArrowRight size={18}/></button>
      </div>
    </div>
    <div className="sector-carousel-track desktop-sector-carousel">{visible.map((sector) => <SectorCard sector={sector} key={sector.slug}/>)}</div>
    <div className="sector-carousel-track mobile-card-carousel mobile-sector-carousel">{sectors.map((sector) => <SectorCard sector={sector} key={sector.slug}/>)}</div>
  </div>;
}

function ExpertiseMethod() {
  const points = [
    [ClipboardCheck, 'Études & audits', 'Auditer les usages, les équipements et les flux pour définir les priorités techniques.'],
    [Landmark, 'Financement', 'Étudier les dispositifs mobilisables et préparer le projet avec les éléments utiles.'],
    [Wrench, 'Travaux', 'Coordonner les interventions sur le chauffage, le CVC, l’isolation, le froid ou les réseaux.'],
    [MonitorCog, 'Pilotage', 'Suivre les réglages, la GTB, les consommations et les indicateurs d’exploitation.'],
  ];
  return <Section className="expertise-method"><Container>
    <div className="section-intro two"><div><Eyebrow>Une méthode complète</Eyebrow><h2>Relier étude, travaux et pilotage.</h2></div><p>Nous traitons les installations dans leur ensemble : air comprimé, récupération de chaleur, refroidissement industriel, chauffage, CVC, enveloppe et supervision.</p></div>
    <div className="competency-grid">{points.map(([Icon, title, text], index) => <article key={title}><span className="competency-icon"><Icon size={24}/><small>0{index + 1}</small></span><h3>{title}</h3><p>{text}</p></article>)}</div>
  </Container></Section>;
}

function WhyUs() {
  const points = [
    [HandHeart, 'Accompagnement humain', 'Un échange clair pour cadrer les priorités techniques de votre site.'],
    [ScanSearch, 'Analyse sur mesure', 'Les usages, équipements et contraintes guident chaque première lecture.'],
    [LockKeyhole, 'Données confidentielles', 'Vos informations de projet restent traitées avec la discrétion attendue.'],
    [Layers3, 'Expertise multidomaine', 'Bâtiments, CVC, froid, utilités et pilotage sont étudiés ensemble.'],
  ];
  return <Section className="why-us"><Container><div className="section-intro two"><div><Eyebrow>Pourquoi Maîtrise Énergie</Eyebrow><h2>Une étude sérieuse commence par une écoute précise.</h2></div><p>Nous relions les enjeux d’exploitation, les données disponibles et les leviers techniques pour éclairer la décision.</p><Button to="/contact" sourceCta="home_why_contact">Parlons de votre projet</Button></div><div className="why-grid">{points.map(([Icon,title,text])=><article key={title}><Icon size={22}/><h3>{title}</h3><p>{text}</p></article>)}</div></Container></Section>;
}

function FundingPreview() {
  const steps = [[ClipboardCheck, 'Projet'], [ScanSearch, 'Étude'], [Landmark, 'Financement'], [Wrench, 'Travaux']];
  return <Section className="funding-preview"><Container><div><Eyebrow>Financements</Eyebrow><h2>Le financement se prépare avec le projet.</h2><p className="lead small">Nous examinons les dispositifs mobilisables à partir des travaux, du site et de leurs conditions de mise en œuvre.</p><Button to="/financement-cee" variant="secondary" sourceCta="home_financing">Comprendre le financement</Button></div><ol className="funding-preview-flow" aria-label="Étapes d’étude du financement">{steps.map(([Icon, label], index) => <li className={`funding-step${index === 2 ? ' funding-step-active' : ''}`} key={label}><span className="funding-step-icon"><Icon size={22} strokeWidth={1.8} aria-hidden="true"/></span><span className="funding-step-label">{label}</span></li>)}</ol></Container></Section>;
}

function ContactProject() {
  const { contact } = siteConfig;
  return <Section tone="muted"><Container><div className="contact-home-grid"><div>
    <Eyebrow>Contact</Eyebrow><h2>Parlons de votre projet.</h2>
    <p className="lead small">Une première discussion permet de situer vos installations, vos priorités et le niveau d’accompagnement attendu.</p>
    <div className="contact-location">
      <strong>Coordonnées et accompagnement</strong>
      <p>{contact.serviceArea}</p>
      {contact.address ? <p>{contact.address}</p> : <p className="config-placeholder">Adresse à renseigner avant publication.</p>}
      {contact.mapEmbedUrl ? <iframe title="Localisation de Maîtrise Énergie" src={contact.mapEmbedUrl} loading="lazy"/> : import.meta.env.DEV && <div className="map-placeholder">Emplacement prévu pour la carte de localisation.</div>}
    </div>
  </div><div className="contact-form"><ContactForm/></div></div></Container></Section>;
}

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

export default function Home() {
  const homeFaq=[["Quand faut-il lancer une étude énergétique ?", "Dès qu’un équipement arrive en fin de cycle, qu’un usage évolue ou qu’une consommation mérite d’être mieux comprise."], ["Quels sites professionnels peuvent être accompagnés ?", "L’échange initial est adapté à la nature des installations, à l’activité et au projet envisagé."], ["Peut-on parler du financement avant les travaux ?", "Oui. Les dispositifs éventuels peuvent être étudiés à partir des caractéristiques réelles du projet."]];
  return <><Seo title="Performance énergétique des entreprises" description="Audit, études, travaux et pilotage énergétique pour réduire les consommations des bâtiments tertiaires et installations industrielles en France." canonicalPath="/" schema={[organizationSchema(),websiteSchema(),faqSchema(homeFaq)]}/>
    <section className="home-hero immersive-hero home-hero-structured"><img className="hero-background" src={heroImages.architecture} alt="" fetchPriority="high"/><Container><div className="home-hero-layout"><div className="hero-copy"><Eyebrow>Performance énergétique des professionnels</Eyebrow><h1>Pilotez la performance énergétique de votre site.</h1><p>Nous vous aidons à comprendre vos consommations, prioriser les actions et préparer un projet adapté à vos bâtiments et installations.</p><div className="button-row"><Button to="/eligibilite" sourceCta="home_hero_contact">Décrire mon projet</Button><Button to="/solutions" variant="secondary" sourceCta="home_hero_solutions">Voir les solutions</Button></div><div className="hero-confidence"><LockKeyhole aria-hidden="true"/><span><strong>Première qualification confidentielle</strong><small>Sans engagement et à partir de votre situation réelle.</small></span></div></div><nav className="hero-paths" aria-label="Choisir un point de départ"><div className="hero-paths-heading"><Eyebrow>Votre point de départ</Eyebrow><h2>Que souhaitez-vous améliorer&nbsp;?</h2><p>Accédez directement au parcours qui correspond à votre besoin.</p></div><Link to="/solutions" onClick={()=>trackEvent('hero_path_clicked',{path:'solutions'})}><span className="hero-path-number">01</span><span><strong>Un équipement ou une installation</strong><small>GTB, CVC, froid, isolation, chaleur et utilités.</small></span><ArrowRight aria-hidden="true"/></Link><Link to="/secteurs" onClick={()=>trackEvent('hero_path_clicked',{path:'sectors'})}><span className="hero-path-number">02</span><span><strong>La performance globale d’un site</strong><small>Industrie, tertiaire, logistique, commerce ou santé.</small></span><ArrowRight aria-hidden="true"/></Link><Link to="/financement-cee" onClick={()=>trackEvent('hero_path_clicked',{path:'financing'})}><span className="hero-path-number">03</span><span><strong>Le financement d’un projet</strong><small>Comprendre les CEE et les critères à vérifier.</small></span><ArrowRight aria-hidden="true"/></Link></nav></div><div className="hero-reassurance" aria-label="Périmètre d’accompagnement"><span><strong>Bâtiments tertiaires</strong><small>Confort, usages et pilotage</small></span><span><strong>Sites industriels</strong><small>Procédés, réseaux et utilités</small></span><span><strong>De l’étude au suivi</strong><small>Une méthode structurée par étapes</small></span></div></Container></section>
    <ProcessBar contact/>
    <Section tone="dark" className="home-expertise"><Container><div className="section-intro"><Eyebrow>Expertises</Eyebrow><h2>Des leviers concrets, pensés pour vos installations.</h2><p className="lead small">Études, financements, travaux et pilotage : nous mobilisons les expertises nécessaires selon le contexte de votre projet.</p></div><CardCarousel label="Nos expertises">{solutions.map((solution) => <SolutionCard solution={solution} key={solution.slug}/>)}</CardCarousel></Container></Section>
    <Section className="home-sectors"><Container><SectorCarousel/></Container></Section>
    <WhyUs/>
    <ExpertiseMethod/>
    <MidContact sourceCta="home_mid_contact"/>
    <FundingPreview/>
    <HomeCaseStudies/>
    <HomeBlog/>
    <Section><Container><div className="faq-layout"><div><Eyebrow>Questions fréquentes</Eyebrow><h2>Préparer votre projet énergétique.</h2></div><Faq subject="votre site" items={homeFaq}/></div></Container></Section>
    <ContactProject/>
  </>;
}
