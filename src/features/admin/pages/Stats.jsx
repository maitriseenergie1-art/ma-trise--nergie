import { useEffect, useState } from 'react';
import { fetchStats } from '../adminService';
import { BarList, CardGrid, ErrorBox, Loading, Spark, StatCard } from '../ui';

const FORM_LABELS = { contact: 'Contact', eligibility: 'Éligibilité', landing_page: 'Landing page', campaign: 'Campagne' };
const STATUS_LABELS = {
  new: 'Nouveau', to_contact: 'À contacter', contacted: 'Contacté', qualified: 'Qualifié',
  appointment: 'RDV', proposal: 'Proposition', won: 'Gagné', lost: 'Perdu', completed: 'Terminé',
};
const GROUP_LABELS = { ai: 'Moteurs IA', search: 'Recherche', social: 'Réseaux sociaux', referral: 'Sites référents', direct: 'Accès direct', paid: 'Payant', other: 'Autre' };
const toItems = (obj, labels) => Object.entries(obj || {}).map(([key, count]) => ({ key: labels?.[key] || key, count }));

export default function Stats() {
  const [days, setDays] = useState(90);
  const [state, setState] = useState({ status: 'loading' });

  useEffect(() => {
    setState({ status: 'loading' });
    fetchStats(days)
      .then((data) => setState({ status: 'ready', data }))
      .catch((error) => setState({ status: 'error', error }));
  }, [days]);

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h2>Statistiques</h2>
          <p className="hint">Analysez l’acquisition, le trafic et la conversion.</p>
        </div>
        <select className="admin-select" aria-label="Période d’analyse" value={days} onChange={(e) => setDays(Number(e.target.value))}>
          <option value={30}>30 jours</option>
          <option value={90}>90 jours</option>
          <option value={180}>6 mois</option>
          <option value={365}>12 mois</option>
        </select>
      </div>

      {state.status === 'loading' && <Loading />}
      {state.status === 'error' && <ErrorBox error={state.error} />}
      {state.status === 'ready' && <Body data={state.data} />}
    </>
  );
}

function Body({ data }) {
  const { leads, traffic } = data;
  return (
    <>
      <h3 className="admin-section-title">Trafic</h3>
      {!traffic.available && (
        <p className="hint">
          Le suivi de trafic n’est pas encore actif (table <code>traffic_events</code> absente ou aucun événement).
        </p>
      )}
      {traffic.available && (
        <>
          <CardGrid>
            <StatCard label="Pages vues" value={traffic.totalViews} tone="accent" />
            <StatCard label="Clics suivis" value={traffic.totalClicks} />
            <StatCard label="Via moteurs IA" value={traffic.byGroup?.ai || 0} hint="ChatGPT, Gemini, Google AI…" />
            <StatCard label="Via recherche" value={traffic.byGroup?.search || 0} />
          </CardGrid>
          <div className="admin-card">
            <h3>Pages vues par jour</h3>
            <Spark data={traffic.byDay} />
          </div>
          <div className="admin-content-grid">
            <BarList title="Canaux d’acquisition" items={toItems(traffic.byGroup, GROUP_LABELS)} />
            <BarList title="Sources détaillées" items={traffic.sources} />
            <BarList title="Moteurs IA" items={traffic.aiEngines} />
            <BarList title="Sites référents" items={traffic.referrerHosts} />
            <BarList title="Pages les plus vues" items={traffic.viewsByPath} />
            <BarList title="Éléments les plus cliqués" items={traffic.clicksByTarget} />
            <BarList title="Clics par page" items={traffic.clicksByPath} />
          </div>
        </>
      )}

      <h3 className="admin-section-title">Leads</h3>
      <CardGrid>
        <StatCard label="Total (période)" value={leads.total} />
      </CardGrid>
      <div className="admin-card">
        <h3>Leads par mois</h3>
        <Spark data={leads.byMonth} />
      </div>
      <div className="admin-content-grid">
        <BarList title="Par formulaire" items={toItems(leads.bySourceForm, FORM_LABELS)} />
        <BarList title="Par statut" items={toItems(leads.byStatus, STATUS_LABELS)} />
        <BarList title="Par secteur" items={leads.bySector} />
        <BarList title="Par type de projet" items={leads.byProjectType} />
        <BarList title="UTM source" items={leads.utmSource} />
        <BarList title="Campagnes" items={leads.utmCampaign} />
      </div>
      <div className="admin-card">
        <h3>Entonnoir</h3>
        <BarList items={leads.funnel.map((f) => ({ key: STATUS_LABELS[f.status] || f.status, count: f.count }))} />
      </div>
    </>
  );
}
