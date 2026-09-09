import { MidContact } from '../components/MidContact';
import { heroImages } from '../data/heroImages';
import { CardCarousel } from '../components/CardCarousel';
import { useState } from 'react';
import { ClipboardCheck, Landmark, Wrench, MonitorCog, ArrowLeft, ArrowRight, HandHeart, Layers3, LockKeyhole, ScanSearch } from 'lucide-react';
import { images } from '../data/images';
import { solutions } from '../data/solutions';
import { sectors } from '../data/sectors';
import { caseStudies } from '../data/caseStudies';
import { resources } from '../data/resources';
import { siteConfig } from '../config/siteConfig';
import { Button, Container, Eyebrow, Section } from '../components/ui';
import { Seo } from '../components/Seo';
import { CaseCard, ResourceCard, SectorCard, SolutionCard } from '../components/cards';
import { Faq, FinalCta, ProcessBar } from '../components/sections';
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
  return <Section className="funding-preview"><Container><div><Eyebrow>Financements</Eyebrow><h2>Le financement se prépare avec le projet.</h2><p className="lead small">Nous examinons les dispositifs mobilisables à partir des travaux, du site et de leurs conditions de mise en œuvre.</p><Button to="/financement-cee" variant="secondary" sourceCta="home_financing">Comprendre le financement</Button></div><div className="funding-preview-flow" aria-label="Étapes d’étude du financement"><span><ClipboardCheck/>Projet</span><i/><span><ScanSearch/>Étude</span><i/><span><Landmark/>Financement</span><i/><span><Wrench/>Travaux</span></div></Container></Section>;
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

export default function Home() {
  return <><Seo title="Performance énergétique des sites professionnels" description="Études, financements, travaux et pilotage énergétique pour les bâtiments et installations professionnels."/>
    <section className="home-hero immersive-hero"><img className="hero-background" src={heroImages.architecture} alt="" fetchPriority="high"/><Container><div className="hero-copy"><Eyebrow>Ingénierie de la performance</Eyebrow><h1>Réduisez durablement la consommation de votre site.</h1><p>Études, financements, travaux et pilotage pour les bâtiments tertiaires, les sites industriels et leurs équipements techniques.</p><div className="button-row"><Button to="/eligibilite" sourceCta="home_hero_contact">Vérifier mon éligibilité</Button><Button to="/secteurs" variant="secondary" sourceCta="home_hero_sectors">Nos secteurs d’activité</Button></div><div className="hero-note"><span className="pulse"/>Approche globale, du diagnostic au suivi</div></div><ul className="hero-proof"><li>Étude personnalisée</li><li>Accompagnement humain</li><li>Données confidentielles</li><li>Expertise multidomaine</li></ul></Container></section>
    <ProcessBar/>
    <Section tone="dark"><Container><div className="section-intro"><Eyebrow>Expertises</Eyebrow><h2>Des leviers concrets, pensés pour vos installations.</h2><p className="lead small">Études, financements, travaux et pilotage : nous mobilisons les expertises nécessaires selon le contexte de votre projet.</p></div><CardCarousel label="Nos expertises">{solutions.map((solution) => <SolutionCard solution={solution} key={solution.slug}/>)}</CardCarousel></Container></Section>
    <Section><Container><SectorCarousel/></Container></Section>
    <WhyUs/>
    <ExpertiseMethod/>
    <MidContact sourceCta="home_mid_contact"/>
    <FundingPreview/>
    <Section tone="muted"><Container><div className="section-intro"><Eyebrow>Cas d’usage</Eyebrow><h2>Des exemples d’intervention à adapter à votre site.</h2><p className="lead small">Ces scénarios illustrent des approches possibles. Ils ne constituent pas des références clients ni des résultats garantis.</p></div><p className="demo-note">Exemples de présentation</p><CardCarousel label="Nos cas d’usage">{caseStudies.map((item) => <CaseCard item={item} key={item.slug}/>)}</CardCarousel></Container></Section>
    <Section><Container><div className="section-intro"><Eyebrow>Ressources & conseils</Eyebrow><h2>Comprendre les leviers avant de lancer un projet.</h2><p className="lead small">Des repères pratiques pour préparer une réflexion sur le pilotage, les flux thermiques et les financements.</p></div><CardCarousel label="Nos ressources">{resources.map((item) => <ResourceCard item={item} key={item.slug}/>)}</CardCarousel></Container></Section>
    <Section><Container><div className="faq-layout"><div><Eyebrow>Questions fréquentes</Eyebrow><h2>Préparer votre projet énergétique.</h2></div><Faq subject="votre site" items={[["Quand faut-il lancer une étude énergétique ?", "Dès qu’un équipement arrive en fin de cycle, qu’un usage évolue ou qu’une consommation mérite d’être mieux comprise."], ["Quels sites professionnels peuvent être accompagnés ?", "L’échange initial est adapté à la nature des installations, à l’activité et au projet envisagé."], ["Peut-on parler du financement avant les travaux ?", "Oui. Les dispositifs éventuels peuvent être étudiés à partir des caractéristiques réelles du projet."]]}/></div></Container></Section>
    <ContactProject/>
    <FinalCta eyebrow="Première consultation offerte" title="Votre projet mérite une étude sérieuse." text="Décrivez votre site en toute confidentialité pour préparer une étude initiale." label="Vérifier mon éligibilité" sourceCta="final_contact"/>
  </>;
}
