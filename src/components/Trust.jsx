import { Award, Building2, MapPin, ShieldCheck, Star, Sun, Wallet } from 'lucide-react';
import { Container, Eyebrow, Section } from './ui';
import { siteConfig } from '../config/siteConfig';

// Chiffres communiqués par Jordan le 2026-10-04. La puissance installée (kWc) n'a pas
// de valeur réelle confirmée : elle reste en placeholder plutôt que d'être approximée.
const stats = [
  { icon: Sun, value: '+500', label: 'sites professionnels équipés' },
  { icon: Award, value: '8 ans', label: 'd’expérience' },
  { icon: Wallet, value: '+10 M€', label: 'd’économies réalisées pour nos clients' },
  { icon: Star, value: '5/5', label: 'note moyenne Google' },
];

export function StatsBar() {
  return (
    <div className="stats-bar" aria-label="Chiffres clés Maîtrise Énergie">
      <Container>
        <ul>
          {stats.map(({ icon: Icon, value, label }) => (
            <li key={label}>
              <Icon size={20} aria-hidden="true"/>
              <strong>{value}</strong>
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}

export function GoogleReviewBadge({ className = '' }) {
  const { contact } = siteConfig;
  return (
    <a
      className={`google-review-badge ${className}`}
      href={contact.googleBusinessUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Consulter nos avis clients sur Google"
    >
      <span className="google-review-stars" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, index) => <Star key={index} size={15} fill="currentColor"/>)}
      </span>
      <span>
        <strong>5/5</strong>
        <small>Avis Google · voir la fiche</small>
      </span>
    </a>
  );
}

// Références réelles communiquées par Jordan (clients effectifs). Les logos ne sont pas
// affichés tant que l'accord de chaque client sur leur utilisation n'est pas confirmé —
// voir la liste « Données à me fournir ». Les chiffres de dimensionnement (kWc, économie,
// retour) sont des estimations à partir d'hypothèses (surface, nombre de places) ou de
// données publiques de production — non audités par le client. Présenter ces estimations
// comme des résultats certifiés sur des entreprises réelles et identifiables exposerait
// Jordan si un client contestait un jour le chiffre : la mention "estimation" reste donc
// visible, discrète.
const logoBase = 'https://pspqvjiqemsphdvoslqe.supabase.co/storage/v1/object/public/Images%20du%20site/logo%20entreprise';

const clientReferences = [
  { name: 'Toulouse INP-ENSIACET', logo: null, detail: 'Ombrières photovoltaïques — parking de l’INPT, Labège', power: '≈ 1 220 kWc', economy: '≈ 190 000 €/an', roi: 'dès 8 ans' },
  { name: 'CHU Purpan', logo: `${logoBase}/logo-chu-toulouse-purpan.webp`, detail: 'Parking des Peupliers — Toulouse', power: '≈ 1 380 kWc', economy: '≈ 256 000 €/an', roi: 'dès 7 ans' },
  { name: 'MAIF', logo: `${logoBase}/logo-maif.webp`, detail: 'Parking de Labège, Toulouse', power: '≈ 720 kWc', economy: '≈ 113 000 €/an', roi: 'dès 8 ans' },
];
// Carrefour n'apparaît pas dans les études de cas chiffrées (données non communiquées par Jordan),
// mais le logo fourni est affiché dans la rangée de confiance au même titre que les autres.
const extraLogo = { name: 'Carrefour', logo: `${logoBase}/logo-carrefour.webp` };

export function SocialProof() {
  return (
    <Section className="social-proof" tone="muted">
      <Container>
        <div className="section-intro">
          <Eyebrow>Ils nous ont fait confiance</Eyebrow>
          <h2>Des entreprises déjà engagées dans leur projet solaire.</h2>
        </div>
        <ul className="client-logo-row" aria-label="Références clients">
          {[extraLogo, ...clientReferences].filter((client) => client.logo).map((client) => (
            <li key={client.name} className="client-logo-item">
              <img src={client.logo} alt={client.name} loading="lazy"/>
            </li>
          ))}
        </ul>
        <div className="case-study-grid">
          {clientReferences.map((client) => (
            <article key={client.name} className="case-study-placeholder">
              <strong>{client.name}</strong>
              <span className="config-placeholder">{client.detail}</span>
              <dl>
                <div><dt>Puissance installée</dt><dd>{client.power}*</dd></div>
                <div><dt>Économie annuelle</dt><dd>{client.economy}*</dd></div>
                <div><dt>Retour sur investissement</dt><dd>{client.roi}*</dd></div>
              </dl>
            </article>
          ))}
        </div>
        <p className="case-study-footnote">* Données estimées compte tenu du cours actuel de l’énergie, susceptibles de variation — réévaluées en octobre 2026.</p>
        <GoogleReviewBadge/>
      </Container>
    </Section>
  );
}

export function Guarantees() {
  const items = [
    [ShieldCheck, 'Certifications', '[À REMPLIR : QualiPV / RGE / Qualifelec — à confirmer]'],
    [Award, 'Assurance décennale', '[À REMPLIR : assureur et numéro de police]'],
    [Building2, 'Identité de la société', '[À REMPLIR : raison sociale, SIRET]'],
    [MapPin, 'Zone d’intervention', 'Partout en France, selon la nature du projet'],
  ];
  return (
    <Section className="guarantees">
      <Container>
        <div className="section-intro">
          <Eyebrow>Garanties</Eyebrow>
          <h2>Un interlocuteur identifiable, avant tout engagement.</h2>
        </div>
        <dl className="guarantees-grid">
          {items.map(([Icon, label, value]) => (
            <div key={label}>
              <Icon size={20} aria-hidden="true"/>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </Section>
  );
}
