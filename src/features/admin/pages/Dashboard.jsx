import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchDashboard } from '../adminService';
import { BarList, CardGrid, ErrorBox, Loading, StatCard } from '../ui';

const STATUS_LABELS = {
  new: 'Nouveau', to_contact: 'À contacter', contacted: 'Contacté', qualified: 'Qualifié',
  appointment: 'RDV', proposal: 'Proposition', won: 'Gagné', lost: 'Perdu', completed: 'Terminé',
};
const FORM_LABELS = {
  contact: 'Contact', eligibility: 'Éligibilité', landing_page: 'Landing page', campaign: 'Campagne',
};
const GROUP_LABELS = { ai: 'IA', search: 'Recherche', social: 'Réseaux', referral: 'Référents', direct: 'Direct', paid: 'Payant', other: 'Autre' };

const fmtDate = (iso) => new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function Dashboard() {
  const [state, setState] = useState({ status: 'loading' });

  useEffect(() => {
    fetchDashboard()
      .then((data) => setState({ status: 'ready', data }))
      .catch((error) => setState({ status: 'error', error }));
  }, []);

  if (state.status === 'loading') return <Loading />;
  if (state.status === 'error') return <ErrorBox error={state.error} />;

  const { leads, content, traffic } = state.data;

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h2>Vue d’ensemble</h2>
          <p className="hint">Les indicateurs essentiels de votre activité.</p>
        </div>
        <span className="hint">Mis à jour {fmtDate(state.data.generatedAt)}</span>
      </div>

      <CardGrid>
        <StatCard label="Leads (30 j)" value={leads.last30} hint={`${leads.last7} sur 7 jours`} tone="accent" />
        <StatCard label="Total leads" value={leads.total} />
        <StatCard label="Taux de conversion" value={`${leads.conversionRate} %`} hint={`${leads.won} gagnés · ${leads.lost} perdus`} />
        <StatCard label="Score moyen" value={leads.avgScore ?? '—'} />
        <StatCard label="Visites (7 j)" value={traffic.available ? traffic.last7Views : '—'} hint={traffic.available ? `${traffic.last7Sessions} sessions` : 'tracking non actif'} />
        <StatCard label="Contenu publié" value={`${content.caseStudies.published + content.blogPosts.published}`} hint={`${content.blogPosts.draft + content.caseStudies.draft} brouillons`} />
      </CardGrid>

      <div className="admin-content-grid">
        <BarList
          title="Leads par statut"
          items={Object.entries(leads.byStatus).map(([key, count]) => ({ key, count }))}
          format={(k) => STATUS_LABELS[k] || k}
        />
        <BarList
          title="Leads par formulaire"
          items={Object.entries(leads.bySourceForm).map(([key, count]) => ({ key, count }))}
          format={(k) => FORM_LABELS[k] || k}
        />
        {traffic.available && (
          <BarList
            title="Trafic par canal (7 j)"
            items={Object.entries(traffic.byGroup).map(([key, count]) => ({ key, count }))}
            format={(k) => GROUP_LABELS[k] || k}
          />
        )}
      </div>

      <div className="admin-card">
        <h3>Derniers leads</h3>
        <ul className="admin-list">
          {leads.recent.map((lead) => (
            <li key={lead.id}>
              <span>
                <strong>{lead.label}</strong>
                <span className="muted"> · {FORM_LABELS[lead.sourceForm] || lead.sourceForm} · {fmtDate(lead.createdAt)}</span>
              </span>
              <span className="admin-badge">{STATUS_LABELS[lead.status] || lead.status}</span>
            </li>
          ))}
          {leads.recent.length === 0 && <li className="muted">Aucun lead pour l’instant.</li>}
        </ul>
        <p className="admin-card-link">
          <Link to="/admin/leads">Voir tous les leads →</Link>
        </p>
      </div>
    </>
  );
}
