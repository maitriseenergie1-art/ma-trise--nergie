import { useEffect, useState } from 'react';
import { fetchStats } from '../adminService';
import { BarList, ErrorBox, Loading, StatCard, TrendChart } from '../ui';

const GROUP_LABELS = { ai: 'Assistants IA', search: 'Moteurs de recherche', social: 'Réseaux sociaux', referral: 'Sites référents', direct: 'Accès direct', paid: 'Campagnes payantes', other: 'Autres' };
const TABS = [
  ['overview', 'Vue d’ensemble'], ['pages', 'Pages consultées'], ['clicks', 'Clics'], ['acquisition', 'Acquisition'],
];
const toItems = (object, labels) => Object.entries(object || {}).map(([key, count]) => ({ key: labels?.[key] || key, count }));

export default function Stats() {
  const [days, setDays] = useState(90); const [tab, setTab] = useState('overview'); const [state, setState] = useState({ status: 'loading' });
  useEffect(() => { setState({ status: 'loading' }); fetchStats(days).then((data) => setState({ status: 'ready', data })).catch((error) => setState({ status: 'error', error })); }, [days]);
  return <><div className="admin-topbar admin-analytics-topbar"><div><p className="admin-kicker">Analyse du site</p><h2>Trafic et interactions</h2><p className="hint">Une lecture simple des pages, liens et canaux qui comptent.</p></div><label className="admin-period">Période<select className="admin-select" value={days} onChange={(event) => setDays(Number(event.target.value))}><option value={30}>30 jours</option><option value={90}>90 jours</option><option value={180}>6 mois</option><option value={365}>12 mois</option></select></label></div>
    <div className="admin-analytics-tabs" role="tablist" aria-label="Statistiques"><div>{TABS.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>{label}</button>)}</div></div>
    {state.status === 'loading' && <Loading label="Chargement des statistiques…"/>}{state.status === 'error' && <ErrorBox error={state.error}/>} {state.status === 'ready' && <AnalyticsBody traffic={state.data.traffic} tab={tab}/>}</>;
}

function AnalyticsBody({ traffic, tab }) {
  if (!traffic.available) return <div className="admin-card admin-empty-state"><h3>Le suivi est prêt</h3><p className="hint">Les premières données apparaîtront ici après les prochaines visites.</p></div>;
  const overview = <><div className="admin-stat-strip"><StatCard label="Visites" value={traffic.totalViews} hint={`${traffic.uniqueSessions} sessions`}/><StatCard label="Interactions" value={traffic.totalClicks} hint="Boutons, liens et téléphone"/><StatCard label="Formulaires envoyés" value={traffic.formSubmits} hint={`${traffic.formConversionRate} % de conversion`}/><StatCard label="Appels agence" value={traffic.phoneClicks} hint="Clics sur le numéro"/></div><div className="admin-card admin-trend-card"><h3>Évolution quotidienne</h3><p className="hint">Visites, clics et formulaires sur la période sélectionnée.</p><TrendChart data={traffic.timeline} ariaLabel="Évolution des visites, clics et formulaires" series={[{key:'views',label:'Visites',color:'#126f5c'},{key:'clicks',label:'Clics',color:'#4e94c8'},{key:'formSubmits',label:'Formulaires',color:'#c56a39'}]}/></div></>;
  const pages = <div className="admin-analytics-panel"><BarList title="Pages les plus consultées" items={traffic.viewsByPath}/></div>;
  const clicks = <div className="admin-analytics-panel"><BarList title="Boutons et liens les plus cliqués" items={traffic.clicksByTarget}/><BarList title="Pages où les visiteurs cliquent" items={traffic.clicksByPath}/></div>;
  const acquisition = <div className="admin-analytics-panel"><BarList title="Origine des visites" items={toItems(traffic.byGroup, GROUP_LABELS)}/><BarList title="Assistants IA" items={traffic.aiEngines}/><BarList title="Sources détaillées" items={traffic.sources}/><BarList title="Sites référents" items={traffic.referrerHosts}/></div>;
  return <div className="admin-analytics-clean">{tab === 'overview' && overview}{tab === 'pages' && pages}{tab === 'clicks' && clicks}{tab === 'acquisition' && acquisition}</div>;
}
