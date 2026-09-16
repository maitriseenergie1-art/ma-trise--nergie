import { MidContact } from '../components/MidContact';
import { heroImages } from '../data/heroImages';
import { CardCarousel } from '../components/CardCarousel';
import { useState } from 'react';
import { ClipboardCheck, Landmark, Wrench, MonitorCog, ArrowLeft, ArrowRight, HandHeart, Layers3, LockKeyhole, ScanSearch, Sun, Building2, ReceiptText, BadgeEuro, ChartNoAxesCombined } from 'lucide-react';
import { images } from '../data/images';
import { solutions } from '../data/solutions';
import { sectors } from '../data/sectors';
import { usePageData } from '../hooks/usePageData';
import { contentKeys, loadBlogPosts, loadCaseStudies } from '../services/contentService';
import { siteConfig } from '../config/siteConfig';
import { Button, Container, Eyebrow, Section } from '../components/ui';
import { Seo } from '../components/Seo';
import { ArticleCard, CaseCard, SectorCard, SolutionCard } from '../components/cards';
import { faqSchema, organizationSchema, websiteSchema } from '../lib/structuredData';
import { Faq } from '../components/sections';
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

function SolarJourney() {
  const steps = [
    [ScanSearch, 'Préqualifier le site', 'Nous vérifions la surface disponible, la facture d’électricité et le profil de consommation de votre entreprise.'],
    [Sun, 'Dimensionner la centrale', 'L’étude croise toiture ou foncier, contraintes techniques et potentiel de production solaire.'],
    [BadgeEuro, 'Structurer l’autofinancement', 'Le montage économique est étudié pour faire financer l’installation par les économies générées, selon la faisabilité du projet.'],
    [ChartNoAxesCombined, 'Produire et suivre', 'La centrale est mise en service puis suivie pour piloter la production et l’autoconsommation.'],
  ];
  return <Section className="solar-journey"><Container>
    <div className="section-intro two"><div><Eyebrow>Votre projet solaire</Eyebrow><h2>De la toiture à une électricité produite sur site.</h2></div><p>Un parcours conçu pour les entreprises disposant de grandes surfaces et d’une consommation électrique régulière.</p></div>
    <div className="solar-journey-grid">{steps.map(([Icon, title, text], index) => <article key={title}><span><small>0{index + 1}</small><Icon size={23} aria-hidden="true"/></span><h3>{title}</h3><p>{text}</p></article>)}</div>
  </Container></Section>;
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
  const homeFaq=[["À qui s’adresse l’offre photovoltaïque ?", "En priorité aux entreprises disposant d’au moins 2 000 m² de toiture ou de surface d’exploitation et payant au moins 1 000 € d’électricité par mois."], ["L’installation réduit-elle toujours la facture de 40 % ?", "40 % est l’objectif de réduction visé. Le résultat dépend du profil de consommation, de la surface exploitable, de l’ensoleillement et du dimensionnement confirmé par l’étude."], ["Comment fonctionne l’autofinancement ?", "Le montage est étudié pour que les économies générées contribuent au financement de l’installation. Sa faisabilité et ses conditions sont validées au cas par cas."]];
  return <><Seo title="Photovoltaïque professionnel en autofinancement" description="Centrale solaire pour professionnels : visez au moins 40 % de réduction sur votre facture d’électricité grâce à une installation étudiée en autofinancement." canonicalPath="/" schema={[organizationSchema(),websiteSchema(),faqSchema(homeFaq)]}/>
    <section className="home-hero immersive-hero home-hero-structured solar-hero"><img className="hero-background" src={heroImages.solarProfessional} alt="Centrale photovoltaïque installée sur la toiture d’un site professionnel" fetchPriority="high"/><Container><div className="home-hero-layout"><div className="hero-copy"><Eyebrow>Photovoltaïque pour les professionnels</Eyebrow><h1>Réduisez d’au moins 40&nbsp;% votre facture d’électricité grâce au solaire.</h1><p>Transformez votre toiture ou votre surface d’exploitation en centrale solaire, avec une installation étudiée en autofinancement et dimensionnée pour votre consommation.</p><div className="button-row"><Button to="/eligibilite" sourceCta="home_hero_solar_eligibility">Vérifier mon éligibilité</Button><Button to="/contact" variant="secondary" sourceCta="home_hero_solar_advisor">Parler à un conseiller</Button></div><div className="hero-confidence"><LockKeyhole aria-hidden="true"/><span><strong>Préqualification confidentielle en 2 minutes</strong><small>Objectif de réduction et autofinancement à confirmer par l’étude de votre site.</small></span></div></div><aside className="solar-offer-card" aria-label="Principaux critères de préqualification"><Eyebrow>Votre site est-il éligible&nbsp;?</Eyebrow><h2>Deux critères pour commencer.</h2><div className="solar-criterion"><Building2 aria-hidden="true"/><span><small>Surface disponible</small><strong>2 000 m² minimum</strong></span></div><div className="solar-criterion"><ReceiptText aria-hidden="true"/><span><small>Facture d’électricité</small><strong>1 000 € / mois minimum</strong></span></div><p>Toiture, parking, foncier ou surface d’exploitation : une étude valide ensuite le potentiel réel du site.</p><Button to="/eligibilite" sourceCta="home_criteria_eligibility">Tester mon projet</Button></aside></div><div className="hero-reassurance" aria-label="Bénéfices de l’offre photovoltaïque"><span><strong>≥ 40 % visés</strong><small>sur la facture d’électricité</small></span><span><strong>Autofinancement étudié</strong><small>à partir des économies générées</small></span><span><strong>Projet clé en main</strong><small>étude, installation et suivi</small></span></div></Container></section>
    <SolarJourney/>
    <Section tone="dark" className="home-expertise"><Container><div className="section-intro"><Eyebrow>Solutions complémentaires</Eyebrow><h2>Les autres leviers de performance énergétique.</h2><p className="lead small">Après le photovoltaïque, nous pouvons étudier les autres postes de consommation de vos bâtiments et installations : CVC, froid, isolation, chaleur, éclairage et pilotage.</p></div><CardCarousel label="Nos solutions complémentaires">{solutions.map((solution) => <SolutionCard solution={solution} key={solution.slug}/>)}</CardCarousel></Container></Section>
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
