import { useEffect, useState } from 'react';
import { fetchStats } from '../adminService';
import { BarList, DonutChart, ErrorBox, InfoTip, Loading, StatCard, TrendChart } from '../ui';

const GROUP_LABELS = { ai: 'Assistants IA (ChatGPT…)', search: 'Moteurs de recherche', social: 'Réseaux sociaux', referral: 'Autres sites web', direct: 'Accès direct', paid: 'Publicités payantes', other: 'Autres' };
const DEVICE_LABELS = { mobile: 'Téléphone', desktop: 'Ordinateur', tablet: 'Tablette' };
const TARGET_LABELS = { phone: 'Appel téléphonique', email: 'E-mail', booking: 'Prise de rendez-vous', eligibility: 'Formulaire d’éligibilité', contact: 'Formulaire de contact' };
const TABS = [
  ['overview', 'Vue d’ensemble'], ['acquisition', 'D’où viennent les visiteurs'], ['pages', 'Pages consultées'], ['clicks', 'Clics'],
];
const toItems = (object, labels) => Object.entries(object || {}).map(([key, count]) => ({ key: labels?.[key] || key, count }));
const relabel = (items = [], labels = {}) => items.map((item) => ({ ...item, key: labels[item.key] || item.key || 'Inconnu' }));
const plural = (n, one, many) => `${n} ${n > 1 ? many : one}`;

export default function Stats() {
  const [days, setDays] = useState(90); const [tab, setTab] = useState('overview'); const [state, setState] = useState({ status: 'loading' });
  useEffect(() => { setState({ status: 'loading' }); fetchStats(days).then((data) => setState({ status: 'ready', data })).catch((error) => setState({ status: 'error', error })); }, [days]);
  const periodLabel = { 30: '30 derniers jours', 90: '90 derniers jours', 180: '6 derniers mois', 365: '12 derniers mois' }[days];
  return <><div className="admin-topbar admin-analytics-topbar"><div><p className="admin-kicker">Analyse du site</p><h2>Qui visite votre site, et que font-ils ?</h2><p className="hint">Chiffres sur les {periodLabel}. Cliquez sur les <b>(i)</b> pour comprendre chaque indicateur.</p></div><label className="admin-period">Période<select className="admin-select" value={days} onChange={(event) => setDays(Number(event.target.value))}><option value={30}>30 jours</option><option value={90}>90 jours</option><option value={180}>6 mois</option><option value={365}>12 mois</option></select></label></div>
    <div className="admin-analytics-tabs" role="tablist" aria-label="Statistiques"><div>{TABS.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>{label}</button>)}</div></div>
    {state.status === 'loading' && <Loading label="Chargement des statistiques…"/>}{state.status === 'error' && <ErrorBox error={state.error}/>} {state.status === 'ready' && <AnalyticsBody traffic={state.data.traffic} leads={state.data.leads} tab={tab}/>}</>;
}

function Summary({ traffic, leads }) {
  const sources = toItems(traffic.byGroup, GROUP_LABELS).sort((a, b) => b.count - a.count);
  const best = sources[0];
  const topPage = traffic.viewsByPath?.[0];
  return <div className="admin-summary"><p>Votre site a reçu <b>{plural(traffic.totalViews, 'visite', 'visites')}</b> de <b>{plural(traffic.uniqueSessions, 'visiteur', 'visiteurs')}</b> (une personne qui revient compte pour plusieurs visites).</p>
    <p>{traffic.formSubmits > 0 || leads?.total > 0 ? <>Côté contacts : <b>{plural(traffic.formSubmits, 'formulaire envoyé', 'formulaires envoyés')}</b>{traffic.phoneClicks ? <> et <b>{plural(traffic.phoneClicks, 'clic', 'clics')}</b> sur le numéro de téléphone.</> : '.'}</> : <>Aucun formulaire n’a encore été envoyé{traffic.phoneClicks ? <>, mais <b>{plural(traffic.phoneClicks, 'personne a cliqué', 'personnes ont cliqué')}</b> sur le numéro de téléphone.</> : '.'}</>}</p>
    {best && <p>Principale source de visiteurs : <b>{best.key}</b>{topPage ? <> · Page la plus vue : <b>{topPage.key}</b></> : null}.</p>}</div>;
}

function GaNotice() {
  return <div className="admin-ga"><strong>Google Analytics est branché (G-P79WQK7ET3).</strong><p>Il ne mesure que les visiteurs qui ont cliqué sur « Tout accepter » dans le bandeau de cookies. Les chiffres de cette page, eux, viennent du suivi interne du site et comptent tous les visiteurs : les deux outils n’afficheront donc jamais exactement les mêmes totaux. Les rapports détaillés de Google sont sur analytics.google.com.</p></div>;
}

function AnalyticsBody({ traffic, leads, tab }) {
  if (!traffic.available) return <div className="admin-card admin-empty-state"><h3>Le suivi est prêt</h3><p className="hint">Les premières données apparaîtront ici après les prochaines visites.</p></div>;
  const overview = <>
    <Summary traffic={traffic} leads={leads}/>
    <div className="admin-stat-strip">
      <StatCard label="Visites" value={traffic.totalViews} hint={`${traffic.uniqueSessions} visiteurs différents`} info="Nombre de pages ouvertes par vos visiteurs. Si une personne consulte 3 pages, cela fait 3 visites. Les passages de robots (moteurs de recherche, outils d’analyse) peuvent s’y glisser, le chiffre est donc légèrement optimiste."/>
      <StatCard label="Clics" value={traffic.totalClicks} hint="Boutons, liens et téléphone" info="Nombre de fois où un visiteur a cliqué sur un bouton important (demander un devis, vérifier l’éligibilité), un lien de contact ou le numéro de téléphone. Plus il est élevé, plus les visiteurs s’intéressent à vos offres."/>
      <StatCard label="Formulaires envoyés" value={traffic.formSubmits} hint={`${traffic.formConversionRate} % de ceux qui l’ont vu l’ont envoyé`} info="Nombre de personnes qui ont rempli et envoyé un formulaire (contact ou éligibilité) : ce sont vos demandes de clients potentiels. Le pourcentage est le « taux de conversion » : parmi les personnes qui ont vu un formulaire, la part qui l’a envoyé."/>
      <StatCard label="Appels" value={traffic.phoneClicks} hint="Clics sur le numéro" info="Nombre de clics sur le numéro de téléphone. Attention : c’est un clic, pas forcément un appel abouti (le visiteur a pu raccrocher ou annuler)."/>
    </div>
    <div className="admin-card admin-trend-card"><h3>Évolution jour après jour<InfoTip label="Explication : évolution">Chaque courbe suit un indicateur au fil des jours. Les pics correspondent à une publication, une publicité ou un partage. Une courbe qui monte durablement est bon signe ; une chute brutale mérite une vérification.</InfoTip></h3><p className="hint">Visites, clics et formulaires sur la période sélectionnée.</p><TrendChart data={traffic.timeline} ariaLabel="Évolution des visites, clics et formulaires" series={[{key:'views',label:'Visites',color:'#126f5c'},{key:'clicks',label:'Clics',color:'#4e94c8'},{key:'formSubmits',label:'Formulaires',color:'#c56a39'}]}/></div>
    <div className="admin-analytics-panel">
      <DonutChart title="D’où viennent vos visiteurs ?" items={toItems(traffic.byGroup, GROUP_LABELS)} info="Le chemin que les visiteurs ont emprunté pour arriver : en tapant votre adresse (accès direct), via Google (moteurs de recherche), via un lien sur un autre site, un réseau social, une publicité payante ou un assistant IA comme ChatGPT."/>
      <DonutChart title="Sur quel appareil ?" items={relabel(traffic.devices, DEVICE_LABELS)} info="Le type d’appareil utilisé pour consulter le site. Si la majorité des visiteurs est sur téléphone, le confort d’usage sur mobile est essentiel."/>
    </div>
    <GaNotice/>
  </>;
  const acquisition = <>
    <div className="admin-howto"><strong>À quoi sert cet onglet ?</strong><p>Il répond à la question « par où les gens arrivent-ils sur mon site ? ». Cela permet de savoir quels canaux (Google, publicités, réseaux sociaux, IA…) valent la peine d’être développés.</p></div>
    <div className="admin-analytics-panel">
      <DonutChart title="Origine des visites" items={toItems(traffic.byGroup, GROUP_LABELS)} info="Regroupe les visiteurs par grande famille de provenance. « Accès direct » signifie que la personne a tapé l’adresse, utilisé un favori, ou que la provenance n’est pas détectable."/>
      <DonutChart title="Assistants IA" items={traffic.aiEngines} info="Visiteurs arrivés depuis un assistant d’intelligence artificielle (ChatGPT, Perplexity…) qui a cité ou recommandé votre site."/>
      <BarList title="Sources détaillées" items={traffic.sources} info="Le nom précis de la source (par exemple Google, LinkedIn, ChatGPT). Le pourcentage indique sa part dans l’ensemble des visites."/>
      <BarList title="Sites qui vous envoient du monde" items={traffic.referrerHosts} info="Les adresses de sites web précis sur lesquels des visiteurs ont cliqué pour venir chez vous."/>
    </div>
    <GaNotice/>
  </>;
  const pages = <>
    <div className="admin-howto"><strong>À quoi sert cet onglet ?</strong><p>Il montre les pages qui intéressent le plus vos visiteurs. Une page très vue est un bon endroit pour placer un bouton de contact.</p></div>
    <div className="admin-analytics-panel"><BarList title="Pages les plus consultées" items={traffic.viewsByPath} info="Chaque ligne est une page du site (« / » est la page d’accueil). Le chiffre est le nombre de visites, le pourcentage sa part du total."/><DonutChart title="Répartition des visites par page" items={(traffic.viewsByPath || []).map((i) => ({ ...i, key: i.key === '/' ? 'Accueil' : i.key }))} info="La même information sous forme de camembert : plus la part est grande, plus la page attire de visiteurs."/></div>
  </>;
  const clicks = <>
    <div className="admin-howto"><strong>À quoi sert cet onglet ?</strong><p>Il montre sur quoi les visiteurs cliquent : c’est le signe qu’une personne passe de « je regarde » à « je m’intéresse vraiment ».</p></div>
    <div className="admin-analytics-panel"><DonutChart title="Sur quoi cliquent-ils ?" unit="clics" items={relabel(traffic.clicksByTarget, TARGET_LABELS)} info="Les boutons, liens et moyens de contact les plus utilisés (téléphone, e-mail, formulaires, boutons d’appel à l’action)."/><BarList title="Boutons et liens les plus cliqués" items={relabel(traffic.clicksByTarget, TARGET_LABELS)} info="Le détail du camembert, du plus au moins cliqué."/><BarList title="Pages où les visiteurs cliquent" items={traffic.clicksByPath} info="Les pages qui poussent le plus à l’action. Une page très vue mais peu cliquée peut être améliorée."/></div>
  </>;
  return <div className="admin-analytics-clean">{tab === 'overview' && overview}{tab === 'acquisition' && acquisition}{tab === 'pages' && pages}{tab === 'clicks' && clicks}</div>;
}
