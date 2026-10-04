import { BadgeCheck, Banknote, Landmark, PiggyBank, ShieldCheck, Star, Wrench } from 'lucide-react';
import { Container, Eyebrow, Section } from './ui';
import { siteConfig } from '../config/siteConfig';
import { trackEvent } from '../services/analyticsService';
import { trustStats, clientLogos, realCaseStudies, googleReview, guarantees, sampleSimulation } from '../data/trustData';

export function TrustBar() {
  return <div className="trust-bar" aria-label="Chiffres clés"><Container className="trust-bar-inner">
    {trustStats.map((stat) => <div key={stat.label} className="trust-bar-item"><strong>{stat.value}</strong><span>{stat.label}</span></div>)}
  </Container></div>;
}

function CaseStudyCard({ study }) {
  return <article className="case-study-card">
    <div className="case-study-media">{study.photoUrl ? <img src={study.photoUrl} alt="" loading="lazy" width="480" height="320"/> : <span className="case-study-placeholder">Photo de chantier à fournir</span>}</div>
    <div className="case-study-body">
      <span>{study.sector}</span>
      <dl>
        <div><dt>Surface</dt><dd>{study.surface}</dd></div>
        <div><dt>Puissance</dt><dd>{study.power}</dd></div>
        <div><dt>Économie annuelle</dt><dd>{study.annualSaving}</dd></div>
        <div><dt>Retour sur investissement</dt><dd>{study.paybackYears}</dd></div>
      </dl>
    </div>
  </article>;
}

export function SocialProofSection() {
  const hasLogos = clientLogos.length > 0;
  return <Section className="social-proof" tone="muted"><Container>
    <div className="section-intro"><Eyebrow>Ils nous ont fait confiance</Eyebrow><h2>Des entreprises qui ont déjà franchi le pas du solaire.</h2></div>
    {hasLogos
      ? <div className="client-logos">{clientLogos.map((logo) => <img key={logo.name} src={logo.logoUrl} alt={logo.alt || logo.name} loading="lazy" width="140" height="48"/>)}</div>
      : <p className="trust-placeholder-note">[À REMPLIR : logos clients à ajouter avec leur accord]</p>}
    <div className="case-study-grid">{realCaseStudies.map((study) => <CaseStudyCard study={study} key={study.id}/>)}</div>
    <a className="google-review-card" href={siteConfig.contact.googleBusinessUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('google_review_clicked', { channel: 'social_proof' })}>
      <span className="google-review-stars" aria-hidden="true">{Array.from({ length: 5 }).map((_, index) => <Star key={index} size={18} fill={googleReview.rating && index < Math.round(googleReview.rating) ? 'currentColor' : 'none'}/>)}</span>
      <span><strong>{googleReview.rating ? `${googleReview.rating}/5` : '[À REMPLIR : note Google]'}</strong><small>{googleReview.reviewCount ? `Sur ${googleReview.reviewCount} avis Google` : '[À REMPLIR : nombre d’avis]'} · Voir nos avis</small></span>
    </a>
  </Container></Section>;
}

export function GuaranteesSection() {
  return <Section className="guarantees"><Container>
    <div className="section-intro two"><div><Eyebrow>Garanties</Eyebrow><h2>Une entreprise identifiée et assurée.</h2></div><p>Les informations administratives et les certifications de l’entreprise sont vérifiables avant tout engagement.</p></div>
    <div className="guarantees-grid">{guarantees.map((item) => <article key={item.label}><ShieldCheck size={22} aria-hidden="true"/><h3>{item.label}</h3><p>{item.value}</p></article>)}</div>
  </Container></Section>;
}

export function AutofinancingExplainer() {
  const steps = [
    [PiggyBank, 'Économies générées', 'La centrale produit de l’électricité autoconsommée sur site, ce qui réduit immédiatement la facture.'],
    [Banknote, 'Remboursement de l’installation', 'Une partie des économies générées contribue au remboursement du financement de la centrale, selon le montage retenu (à confirmer).'],
    [Landmark, 'Montage financier étudié au cas par cas', 'Tiers-financement, PPA ou crédit-bail : le mécanisme exact est validé selon le profil du projet.'],
    [BadgeCheck, 'Propriété ou fin de contrat', 'Selon le montage choisi, l’entreprise devient propriétaire de la centrale ou le contrat arrive à son terme.'],
  ];
  return <Section className="autofinancing-explainer"><Container>
    <div className="section-intro"><Eyebrow>Comment fonctionne l’autofinancement</Eyebrow><h2>Faire financer la centrale par les économies qu’elle génère.</h2><p className="lead small">Le mécanisme précis (tiers-financement, PPA ou crédit-bail) est étudié et validé pour chaque projet. Voici le principe général en 4 étapes.</p></div>
    <ol className="autofinancing-steps">{steps.map(([Icon, title, text], index) => <li key={title}><span className="autofinancing-step-icon"><Icon size={22} aria-hidden="true"/><small>0{index + 1}</small></span><h3>{title}</h3><p>{text}</p></li>)}</ol>
    <aside className="sample-simulation" aria-label="Exemple chiffré">
      <Eyebrow>Exemple de simulation</Eyebrow>
      <p>Pour un {sampleSimulation.buildingType} : une centrale d’environ <strong>{sampleSimulation.power}</strong>, une économie estimée de <strong>{sampleSimulation.annualSaving}</strong>, avec un retour sur investissement de l’ordre de <strong>{sampleSimulation.paybackYears}</strong>.</p>
      <small>Exemple donné à titre indicatif. Votre projet fait l’objet d’une étude personnalisée.</small>
    </aside>
  </Container></Section>;
}
