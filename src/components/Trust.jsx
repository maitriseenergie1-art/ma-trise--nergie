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

// Logo "G" officiel Google (quatre couleurs de la marque) en SVG inline.
function GoogleGIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
      <path fill="#FBBC05" d="M11.69 28.18A13.93 13.93 0 0 1 10.9 24c0-1.45.25-2.86.69-4.18v-5.7H4.34A21.93 21.93 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"/>
      <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>
    </svg>
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
      aria-label="Consulter nos avis clients sur Google — note 5 sur 5"
    >
      <GoogleGIcon/>
      <span className="google-review-body">
        <span className="google-review-rating">
          <strong>5,0</strong>
          <span className="google-review-stars" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, index) => <Star key={index} size={18} fill="currentColor"/>)}
          </span>
        </span>
        <small>Avis Google · voir tous nos avis</small>
      </span>
    </a>
  );
}

// Références réelles communiquées par Jordan (clients effectifs), logos fournis par Jordan.
// Les chiffres de dimensionnement (kWc, économie, retour) sont des estimations à partir
// d'hypothèses (surface, nombre de places) ou de données publiques de production — non
// audités par le client. Présenter ces estimations comme des résultats certifiés sur des
// entreprises réelles et identifiables exposerait Jordan si un client contestait un jour
// le chiffre : la mention "estimation" reste donc visible, discrète.
const logoBase = 'https://pspqvjiqemsphdvoslqe.supabase.co/storage/v1/object/public/Images%20du%20site/logo%20entreprise';

const clientReferences = [
  { name: 'Toulouse INP-ENSIACET', logo: `${logoBase}/Toulouse-INP-ENSIACET.webp`, detail: 'Ombrières photovoltaïques — parking de l’INPT, Labège', power: '≈ 1 220 kWc', economy: '≈ 190 000 €/an', roi: 'dès 8 ans' },
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
        <div className="case-study-grid">
          {clientReferences.map((client) => (
            <article key={client.name} className="case-study-placeholder">
              <div className="case-study-header">
                {client.logo
                  ? <img src={client.logo} alt={client.name} loading="lazy"/>
                  : <strong>{client.name}</strong>}
              </div>
              <span className="config-placeholder">{client.detail}</span>
              <dl>
                <div><dt>Puissance installée</dt><dd>{client.power}*</dd></div>
                <div><dt>Économie annuelle</dt><dd className="gain">{client.economy}*</dd></div>
                <div><dt>Retour sur investissement</dt><dd>{client.roi}*</dd></div>
              </dl>
            </article>
          ))}
        </div>
        <p className="case-study-footnote">* Données estimées compte tenu du cours actuel de l’énergie, susceptibles de variation — réévaluées en octobre 2026.</p>
        <p className="also-trusted">Également sollicités par <img src={extraLogo.logo} alt={extraLogo.name} loading="lazy"/></p>
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
