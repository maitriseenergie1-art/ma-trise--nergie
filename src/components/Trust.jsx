import { Star } from 'lucide-react';
import { Container, Eyebrow, Section } from './ui';
import { siteConfig } from '../config/siteConfig';

// Chiffres communiqués par Jordan le 2026-10-04. La puissance installée (kWc) n'a pas
// de valeur réelle confirmée : elle reste en placeholder plutôt que d'être approximée.
const stats = [
  { value: '+500', label: 'sites professionnels équipés' },
  { value: '8 ans', label: 'd’expérience' },
  { value: '+10 M€', label: 'd’économies réalisées pour nos clients' },
  { value: '5/5', label: 'note moyenne Google' },
];

export function StatsBar() {
  return (
    <div className="stats-bar" aria-label="Chiffres clés Maîtrise Énergie">
      <Container>
        <ul>
          {stats.map((stat) => (
            <li key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
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
// voir la liste « Données à me fournir ». Les métriques précises (kWc, économie, retour)
// n'ont pas été communiquées par ces clients : elles restent en placeholder plutôt que d'être inventées.
const clientReferences = [
  { name: 'MAIF', detail: 'Centre de gestion sinistres — Labège, Toulouse' },
  { name: 'Carrefour', detail: 'Parking des Peupliers — Toulouse Purpan' },
  { name: 'Toulouse INP-ENSIACET', detail: 'Ombrières photovoltaïques sur parking — campus de Toulouse' },
];

export function SocialProof() {
  return (
    <Section className="social-proof" tone="muted">
      <Container>
        <div className="section-intro">
          <Eyebrow>Ils nous ont fait confiance</Eyebrow>
          <h2>Des entreprises déjà engagées dans leur projet solaire.</h2>
          <p className="lead small">Logos en attente de l’accord de chaque client. Les résultats chiffrés (kWc, économie, retour) ne nous ont pas été communiqués : ils restent en attente plutôt que d’être estimés.</p>
        </div>
        <ul className="client-logo-row" aria-label="Références clients">
          {clientReferences.map((client) => (
            <li key={client.name} className="client-logo-placeholder">
              <strong>{client.name}</strong>
              <small>[À REMPLIR : logo — accord client requis]</small>
            </li>
          ))}
        </ul>
        <div className="case-study-grid">
          {clientReferences.map((client) => (
            <article key={client.name} className="case-study-placeholder">
              <strong>{client.name}</strong>
              <span className="config-placeholder">{client.detail}</span>
              <dl>
                <div><dt>Puissance installée</dt><dd>[À REMPLIR] kWc</dd></div>
                <div><dt>Économie annuelle</dt><dd>[À REMPLIR] €/an</dd></div>
                <div><dt>Retour sur investissement</dt><dd>[À REMPLIR] ans</dd></div>
              </dl>
            </article>
          ))}
        </div>
        <GoogleReviewBadge/>
      </Container>
    </Section>
  );
}

export function Guarantees() {
  const items = [
    ['Certifications', '[À REMPLIR : QualiPV / RGE / Qualifelec — à confirmer]'],
    ['Assurance décennale', '[À REMPLIR : assureur et numéro de police]'],
    ['Identité de la société', '[À REMPLIR : raison sociale, SIRET]'],
    ['Zone d’intervention', 'Partout en France, selon la nature du projet'],
  ];
  return (
    <Section className="guarantees">
      <Container>
        <div className="section-intro">
          <Eyebrow>Garanties</Eyebrow>
          <h2>Un interlocuteur identifiable, avant tout engagement.</h2>
        </div>
        <dl className="guarantees-grid">
          {items.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </Section>
  );
}
