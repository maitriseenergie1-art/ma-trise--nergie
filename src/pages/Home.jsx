import { MidContact } from '../components/MidContact';
import { heroImages } from '../data/heroImages';
import { CardCarousel } from '../components/CardCarousel';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ClipboardCheck, Landmark, Wrench, MonitorCog, ArrowLeft, ArrowRight, HandHeart, Layers3, LockKeyhole, ScanSearch, Sun, Building2, ReceiptText, BadgeEuro, ChartNoAxesCombined, PhoneCall, UsersRound } from 'lucide-react';
import { images } from '../data/images';
import { solutions } from '../data/solutions';
import { sectors } from '../data/sectors';
import { siteConfig } from '../config/siteConfig';
import { Button, Container, Eyebrow, Section } from '../components/ui';
import { Seo } from '../components/Seo';
import { CompactSolutionCard, SectorCard } from '../components/cards';
import { faqSchema, organizationSchema, websiteSchema, webPageSchema } from '../lib/structuredData';
import { Faq } from '../components/sections';
import { trackEvent } from '../services/analyticsService';

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
    [ClipboardCheck, 'Étude solaire', 'Croiser surface exploitable, structure, consommation et potentiel de production avant de dimensionner.'],
    [Landmark, 'Autofinancement', 'Construire le scénario économique à partir des économies attendues et des conditions réelles du projet.'],
    [Wrench, 'Installation', 'Préparer et coordonner la centrale photovoltaïque en limitant l’impact sur l’activité du site.'],
    [MonitorCog, 'Suivi', 'Mesurer la production, l’autoconsommation et les résultats après la mise en service.'],
  ];
  return <Section className="expertise-method"><Container>
    <div className="section-intro two"><div><Eyebrow>Une méthode complète</Eyebrow><h2>Relier étude solaire, financement et exploitation.</h2></div><p>Chaque centrale est étudiée à partir du bâtiment, des consommations et des contraintes d’activité — pas à partir d’une puissance standard.</p></div>
    <div className="competency-grid">{points.map(([Icon, title, text], index) => <article key={title}><span className="competency-icon"><Icon size={24}/><small>0{index + 1}</small></span><h3>{title}</h3><p>{text}</p></article>)}</div>
  </Container></Section>;
}

function WhyUs() {
  const points = [
    [HandHeart, 'Un interlocuteur dédié', 'Un échange clair pour suivre le projet photovoltaïque, de la préqualification à la mise en service.'],
    [ScanSearch, 'Dimensionnement sur mesure', 'Surface, consommations et contraintes techniques guident chaque scénario étudié.'],
    [LockKeyhole, 'Données confidentielles', 'Vos informations de projet restent traitées avec la discrétion attendue.'],
    [Layers3, 'Vision énergétique globale', 'Le solaire reste prioritaire, avec les autres postes étudiés en complément lorsqu’ils sont pertinents.'],
  ];
  return <Section className="why-us"><Container><div className="section-intro two"><div><Eyebrow>Pourquoi Maîtrise Énergie</Eyebrow><h2>Une centrale rentable commence par des hypothèses solides.</h2></div><p>Nous relions potentiel du site, profil de consommation et montage économique pour éclairer la décision avant tout engagement.</p><Button to="/eligibilite" sourceCta="home_why_eligibility">Tester mon projet solaire</Button></div><div className="why-grid">{points.map(([Icon,title,text])=><article key={title}><Icon size={22}/><h3>{title}</h3><p>{text}</p></article>)}</div></Container></Section>;
}

function HumanTrust() {
  const { contact } = siteConfig;
  const phoneHref = `tel:${contact.phone.replace(/\s/g, '')}`;
  const audiences = [
    [Building2, 'Groupes et sites structurés', 'Une méthode compatible avec les validations internes, les contraintes d’exploitation et les projets multi-interlocuteurs.'],
    [UsersRound, 'PME et sites indépendants', 'Un échange direct, un scénario lisible et des décisions proportionnées à la réalité de votre entreprise.'],
    [ClipboardCheck, 'Suivi de terrain', 'Un interlocuteur identifié pour relier étude, préparation du chantier, installation et suivi de la centrale.'],
  ];

  return <Section className="human-trust"><Container>
    <div className="human-trust-visual">
      <div className="human-trust-frame"><img src={images.teamOnSite} alt="Équipe technique échangeant sur un projet photovoltaïque sur un site professionnel" loading="lazy" width="1536" height="1024"/></div>
      <p>Illustration de mise en situation — visite technique sur un site professionnel.</p>
    </div>
    <div className="human-trust-content">
      <Eyebrow>À vos côtés, sur le terrain</Eyebrow>
      <h2>Grand groupe ou PME&nbsp;: le même niveau d’exigence.</h2>
      <p className="lead small">Nos équipes travaillent au contact des directions, responsables techniques et exploitants pour construire un projet solaire réaliste, compréhensible et compatible avec l’activité du site.</p>
      <div className="human-trust-points">{audiences.map(([Icon, title, text]) => <article key={title}><Icon size={21} aria-hidden="true"/><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
      <div className="human-trust-actions">
        <Button to="/contact" sourceCta="home_human_advisor">Échanger avec un conseiller</Button>
        <a href={phoneHref} onClick={() => trackEvent('phone_clicked', { channel: 'home_human_trust' })}><PhoneCall size={18} aria-hidden="true"/><span><small>Appelez-nous directement</small><strong>{contact.phone}</strong></span></a>
      </div>
    </div>
  </Container></Section>;
}

function DeferredVideo({ src, poster, title, description }) {
  const ref = useRef(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setEnabled(true);
        observer.disconnect();
      }
    }, { rootMargin: '300px 0px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return <article className="project-video" ref={ref}>
    <div className="project-video-media">
      {enabled
        ? <video controls muted playsInline preload="metadata" poster={poster} aria-label={title}><source src={src} type="video/mp4"/>Votre navigateur ne prend pas en charge la lecture vidéo.</video>
        : <img src={poster} alt="" loading="lazy" width="1600" height="900"/>}
    </div>
    <div className="project-video-copy"><h3>{title}</h3><p>{description}</p><small>Vidéo de présentation — lecture à la demande.</small></div>
  </article>;
}

function LargeSitesVideoShowcase() {
  return <Section className="large-sites-showcase"><Container>
    <div className="section-intro two"><div><Eyebrow>Sites de grande ampleur</Eyebrow><h2>Entrepôts, parkings et grands bâtiments&nbsp;: des projets conçus pour l’exploitation.</h2></div><p>Nous accompagnons les structures disposant de toitures, de hangars ou de parkings à valoriser, avec une approche adaptée aux contraintes des grands sites comme à celles des entreprises tertiaires.</p></div>
    <div className="project-video-grid">
      <DeferredVideo src="https://pspqvjiqemsphdvoslqe.supabase.co/storage/v1/object/public/Images%20du%20site/videos/entrepot-photovoltaique.mp4" poster={images.warehouse} title="Toitures d’entrepôts et hangars de stockage" description="Étudier une centrale photovoltaïque sur de grandes surfaces de toiture, sans perdre de vue les accès, la sécurité et la continuité d’activité du site."/>
      <DeferredVideo src="https://pspqvjiqemsphdvoslqe.supabase.co/storage/v1/object/public/Images%20du%20site/videos/photovoltaique-ombrieres.mp4" poster={images.office} title="Ombrières photovoltaïques pour parcs de stationnement" description="Valoriser les parkings de sièges, banques, assurances et bâtiments professionnels avec une installation solaire pensée pour les usages du site."/>
    </div>
  </Container></Section>;
}

function FundingPreview() {
  const steps = [[ClipboardCheck, 'Consommation'], [ScanSearch, 'Production'], [Landmark, 'Montage'], [Wrench, 'Installation']];
  return <Section className="funding-preview"><Container><div><Eyebrow>Autofinancement photovoltaïque</Eyebrow><h2>Faire travailler les économies pour financer la centrale.</h2><p className="lead small">L’étude économique rapproche la production attendue, votre autoconsommation et les conditions du montage. L’autofinancement reste soumis à validation du projet.</p><Button to="/eligibilite" variant="secondary" sourceCta="home_financing">Vérifier les premiers critères</Button></div><ol className="funding-preview-flow" aria-label="Étapes d’étude de l’autofinancement">{steps.map(([Icon, label], index) => <li className={`funding-step${index === 2 ? ' funding-step-active' : ''}`} key={label}><span className="funding-step-icon"><Icon size={22} strokeWidth={1.8} aria-hidden="true"/></span><span className="funding-step-label">{label}</span></li>)}</ol></Container></Section>;
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

const DeferredHomeContent = lazy(() => import('../features/home/DeferredHomeContent'));

function DeferredBelowFoldContent() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const load = () => setReady(true);
    const idle = window.requestIdleCallback?.(load, { timeout: 1800 });
    const fallback = idle ? null : window.setTimeout(load, 900);
    return () => {
      if (idle) window.cancelIdleCallback?.(idle);
      if (fallback) window.clearTimeout(fallback);
    };
  }, []);

  return ready ? <Suspense fallback={null}><DeferredHomeContent/></Suspense> : null;
}

export default function Home() {
  const homeFaq=[["À qui s’adresse l’offre photovoltaïque ?", "En priorité aux entreprises disposant d’au moins 2 000 m² de toiture ou de surface d’exploitation et payant au moins 1 000 € d’électricité par mois."], ["L’installation réduit-elle toujours la facture de 40 % ?", "40 % est l’objectif de réduction visé. Le résultat dépend du profil de consommation, de la surface exploitable, de l’ensoleillement et du dimensionnement confirmé par l’étude."], ["Comment fonctionne l’autofinancement ?", "Le montage est étudié pour que les économies générées contribuent au financement de l’installation. Sa faisabilité et ses conditions sont validées au cas par cas."]];
  return <><Seo title="Photovoltaïque professionnel en autofinancement" description="Centrale solaire pour professionnels : visez au moins 40 % de réduction sur votre facture d’électricité grâce à une installation étudiée en autofinancement." canonicalPath="/" schema={[organizationSchema(),websiteSchema(),webPageSchema({name:'Photovoltaïque professionnel en autofinancement',description:'Centrale solaire et autoconsommation pour entreprises.',path:'/',about:['Photovoltaïque professionnel','Autoconsommation solaire','Performance énergétique des entreprises']}),faqSchema(homeFaq)]}/>
    <section className="home-hero immersive-hero home-hero-structured solar-hero"><img className="hero-background" src={heroImages.solarProfessional} alt="Centrale photovoltaïque installée sur la toiture d’un site professionnel" fetchPriority="high"/><Container><div className="home-hero-layout"><div className="hero-copy"><Eyebrow>Photovoltaïque pour les professionnels</Eyebrow><h1>Réduisez d’au moins 40&nbsp;% votre facture d’électricité grâce au solaire.</h1><p>Transformez votre toiture ou votre surface d’exploitation en centrale solaire, avec une installation étudiée en autofinancement et dimensionnée pour votre consommation.</p><div className="button-row"><Button to="/eligibilite" sourceCta="home_hero_solar_eligibility">Vérifier mon éligibilité</Button><Button to="/contact" variant="secondary" sourceCta="home_hero_solar_advisor">Parler à un conseiller</Button></div><div className="hero-confidence"><LockKeyhole aria-hidden="true"/><span><strong>Préqualification confidentielle en 2 minutes</strong><small>Objectif de réduction et autofinancement à confirmer par l’étude de votre site.</small></span></div></div><aside className="solar-offer-card" aria-label="Principaux critères de préqualification"><Eyebrow>Votre site est-il éligible&nbsp;?</Eyebrow><h2>Deux critères pour commencer.</h2><div className="solar-criterion"><Building2 aria-hidden="true"/><span><small>Surface disponible</small><strong>2 000 m² minimum</strong></span></div><div className="solar-criterion"><ReceiptText aria-hidden="true"/><span><small>Facture d’électricité</small><strong>1 000 € / mois minimum</strong></span></div><p>Toiture, parking, foncier ou surface d’exploitation : une étude valide ensuite le potentiel réel du site.</p><Button to="/eligibilite" sourceCta="home_criteria_eligibility">Tester mon projet</Button></aside></div><div className="hero-reassurance" aria-label="Bénéfices de l’offre photovoltaïque"><span><strong>≥ 40 % visés</strong><small>sur la facture d’électricité</small></span><span><strong>Autofinancement étudié</strong><small>à partir des économies générées</small></span><span><strong>Projet clé en main</strong><small>étude, installation et suivi</small></span></div></Container></section>
    <SolarJourney/>
    <Section tone="dark" className="home-expertise"><Container><div className="section-intro"><Eyebrow>Solutions complémentaires</Eyebrow><h2>Les autres leviers de performance énergétique.</h2><p className="lead small">Après le photovoltaïque, nous pouvons étudier les autres postes de consommation de vos bâtiments et installations : CVC, froid, isolation, chaleur, éclairage et pilotage.</p></div><CardCarousel label="Nos solutions complémentaires">{solutions.filter((solution) => solution.slug !== 'photovoltaique-professionnel').map((solution) => <CompactSolutionCard solution={solution} key={solution.slug}/>)}</CardCarousel></Container></Section>
    <Section className="home-sectors"><Container><SectorCarousel/></Container></Section>
    <HumanTrust/>
    <LargeSitesVideoShowcase/>
    <WhyUs/>
    <ExpertiseMethod/>
    <MidContact title="Votre site dispose-t-il du potentiel pour une centrale solaire&nbsp;?" text="Les premiers critères se vérifient à partir de votre surface disponible et de votre facture d’électricité." label="Tester mon éligibilité" to="/eligibilite" sourceCta="home_mid_eligibility"/>
    <FundingPreview/>
    <DeferredBelowFoldContent/>
    <Section><Container><div className="faq-layout"><div><Eyebrow>Questions fréquentes</Eyebrow><h2>Préparer votre projet photovoltaïque.</h2></div><Faq subject="votre site" items={homeFaq}/></div></Container></Section>
  </>;
}
