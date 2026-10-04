import { Star } from 'lucide-react';
import { Container, Eyebrow, Section } from './ui';
import { siteConfig } from '../config/siteConfig';

// Chiffres réels à fournir — voir la liste « Données à me fournir » de la PR.
// Tant qu'une valeur n'est pas confirmée, le placeholder reste visible plutôt que d'afficher un chiffre inventé.
const stats = [
  { value: '[À REMPLIR : kWc installés]', label: 'de puissance installée' },
  { value: '[À REMPLIR : nb. de sites équipés]', label: 'sites professionnels équipés' },
  { value: '[À REMPLIR : nb. années]', label: 'années d’expérience' },
  { value: '[À REMPLIR : note /5]', label: 'note moyenne Google' },
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
        <strong>[À REMPLIR : note /5]</strong>
        <small>Avis Google · voir la fiche</small>
      </span>
    </a>
  );
}

export function SocialProof() {
  const clientLogos = [1, 2, 3, 4, 5, 6];
  return (
    <Section className="social-proof" tone="muted">
      <Container>
        <div className="section-intro">
          <Eyebrow>Ils nous ont fait confiance</Eyebrow>
          <h2>Des entreprises déjà engagées dans leur projet solaire.</h2>
          <p className="lead small">Logos et études de cas à remplacer par vos références réelles avant la mise en ligne définitive.</p>
        </div>
        <ul className="client-logo-row" aria-label="Logos clients à renseigner">
          {clientLogos.map((index) => (
            <li key={index} className="client-logo-placeholder" aria-hidden="true">[À REMPLIR : logo client]</li>
          ))}
        </ul>
        <div className="case-study-grid">
          {[1, 2, 3].map((index) => (
            <article key={index} className="case-study-placeholder">
              <span className="config-placeholder">[À REMPLIR : étude de cas {index}]</span>
              <dl>
                <div><dt>Secteur</dt><dd>[À REMPLIR]</dd></div>
                <div><dt>Surface</dt><dd>[À REMPLIR] m²</dd></div>
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
