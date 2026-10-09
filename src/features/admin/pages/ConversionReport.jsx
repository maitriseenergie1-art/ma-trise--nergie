import { DonutChart, InfoTip, StatCard } from '../ui';

const SOURCE_LABELS = { ai: 'Assistants IA', search: 'Moteurs de recherche', social: 'Réseaux sociaux', referral: 'Autres sites web', direct: 'Accès direct', paid: 'Publicités payantes', other: 'Autres' };
const DEVICE_LABELS = { mobile: 'Téléphone', desktop: 'Ordinateur', tablet: 'Tablette', inconnu: 'Inconnu' };
const QUICK_LABELS = { blog: 'articles', caseStudy: 'page Réalisations', sector: 'secteurs', solution: 'solutions', financing: 'Financement CEE', generic: 'À propos / FAQ', eligibility: 'bas de page' };
const FIELD_LABELS = { firstName: 'Prénom', lastName: 'Nom', company: 'Entreprise', phone: 'Téléphone', email: 'E-mail', need: 'Type de besoin', privacy: 'Case de consentement', building: 'Type de site', size: 'Surface', monthlyBill: 'Facture mensuelle', general: 'Général' };
const ELIGIBILITY_STEPS = { 1: 'Type de site', 2: 'Surface disponible', 3: 'Facture d’électricité', 4: 'Coordonnées envoyées' };

const formLabel = (key = '') => {
  if (key === 'contact') return 'Page Contact';
  if (key === 'eligibility') return 'Test d’éligibilité solaire';
  if (key === 'floating_qualified_lead') return 'Bulle de contact flottante';
  if (key.startsWith('quick_')) return `Formulaire rapide (${QUICK_LABELS[key.slice(6)] || key.slice(6)})`;
  return key;
};
const fieldLabel = (key = '') => { const [form, field] = key.split(':'); return `${formLabel(form)} › ${FIELD_LABELS[field] || field}`; };
const pageLabel = (path) => (path === '/' ? 'Accueil (/)' : path);
const rate = (part, whole) => (whole ? `${Math.round((part / whole) * 1000) / 10} %`.replace('.', ',') : '—');
const share = (part, whole) => (whole ? (part / whole) * 100 : 0);

const FUNNEL = [
  ['visitors', 'Visiteurs', 'Chaque personne qui arrive sur le site (comptée une seule fois, même si elle consulte plusieurs pages).'],
  ['formSeen', 'Ont vu un formulaire', 'Visiteurs pour qui un formulaire s’est réellement affiché à l’écran (au moins 40 % visible). S’ils ne le voient pas, ils ne peuvent pas le remplir : c’est souvent le premier levier.'],
  ['formStarted', 'Ont commencé à le remplir', 'Visiteurs qui ont cliqué dans un champ ou répondu à une première question. Ils ont montré un vrai intérêt. Aucune valeur saisie n’est enregistrée.'],
  ['formSubmitted', 'Ont envoyé leur demande', 'Visiteurs qui ont envoyé un formulaire : ce sont vos leads.'],
];

function Funnel({ steps }) {
  const byKey = Object.fromEntries(steps.map((s) => [s.key, s.count]));
  const top = Math.max(1, byKey.visitors);
  return <div className="admin-card"><h3>Le parcours des visiteurs, étape par étape<InfoTip label="Explication : parcours">Lisez de haut en bas : à chaque étape, une partie des visiteurs s’arrête. L’étape où la barre rétrécit le plus est celle à améliorer en priorité. Le pourcentage à droite compare à l’étape précédente.</InfoTip></h3>
    <p className="hint">Combien de visiteurs franchissent chaque étape jusqu’à la demande de contact.</p>
    <div className="admin-funnel">{FUNNEL.map(([key, label, info], index) => { const count = byKey[key] || 0; const prev = index ? byKey[FUNNEL[index - 1][0]] || 0 : null;
      return <div className="admin-funnel-row" key={key}><div className="admin-funnel-label">{label}<InfoTip label={`Explication : ${label}`}>{info}</InfoTip></div><div className="admin-funnel-track"><div className="admin-funnel-fill" style={{ width: `${Math.max(count ? 2 : 0, share(count, top))}%` }}/></div><div className="admin-funnel-value"><strong>{count}</strong>{index > 0 && <small>{rate(count, prev)} de l’étape précédente</small>}</div></div>; })}</div></div>;
}

function buildDiagnostics(c) {
  const f = Object.fromEntries(c.funnel.map((s) => [s.key, s.count]));
  const out = [];
  const add = (tone, title, text) => out.push({ tone, title, text });
  if (c.sessions < 100) add('info', 'Peu de données pour l’instant', `Seulement ${c.sessions} visiteurs sur la période : les pourcentages bougent beaucoup avec peu de monde. Prenez ces constats comme des pistes à vérifier, pas comme des certitudes.`);
  if (f.formSubmitted > 0) add('good', `${f.formSubmitted} demande${f.formSubmitted > 1 ? 's' : ''} reçue${f.formSubmitted > 1 ? 's' : ''}`, `Soit ${rate(f.formSubmitted, f.visitors)} des visiteurs. Sur un site de ce type (service B2B), 1 à 3 % est un repère courant, à titre indicatif.`);
  const bounce = share(c.singlePage, c.sessions);
  if (c.sessions >= 30 && bounce >= 70) add('warn', `${Math.round(bounce)} % des visiteurs repartent sans rien faire`, 'Ils ouvrent une page, ne cliquent sur rien et partent. Causes fréquentes : le message d’accueil ne correspond pas à ce qu’ils cherchaient, la page est lente à s’afficher ou le trafic n’est pas le bon (surtout si vient de publicités). Regardez le tableau « Pages d’arrivée » pour voir où c’est le plus marqué.');
  const tracked = c.engagementTracked;
  if (!tracked) add('info', 'Suivi détaillé tout juste activé', 'Le début de remplissage, les erreurs par champ et la profondeur de lecture ne sont enregistrés que depuis la dernière mise en ligne. Les constats correspondants apparaîtront après quelques jours de visites. Avant cette mise en ligne, « Ont vu un formulaire » était surestimé (compté dès le chargement de la page, même hors de l’écran).');
  if (tracked && c.sessions >= 30 && share(f.formSeen, f.visitors) < 25) add('warn', 'Peu de visiteurs voient un formulaire', `Seuls ${rate(f.formSeen, f.visitors)} des visiteurs voient un formulaire. Piste : placer un bouton ou un formulaire plus haut sur les pages les plus visitées.`);
  if (tracked && f.formSeen >= 20 && share(f.formStarted, f.formSeen) < 10) add('warn', 'On voit le formulaire, mais on ne le commence pas', `${rate(f.formStarted, f.formSeen)} seulement de ceux qui le voient commencent à le remplir. Pistes : un titre qui promet un bénéfice clair, des phrases de réassurance (gratuit, sans engagement, réponse sous 24 h), un formulaire visiblement court.`);
  if (tracked && f.formStarted >= 10 && share(f.formSubmitted, f.formStarted) < 50) add('warn', 'On commence le formulaire, mais on l’abandonne', `${rate(f.formSubmitted, f.formStarted)} seulement de ceux qui commencent finissent. Pistes : retirer les champs non essentiels, rassurer sur l’usage des données, vérifier les messages d’erreur sur téléphone.`);
  const err = c.errorsByField[0];
  if (err && err.count >= 3) add('warn', 'Un champ pose problème aux visiteurs', `« ${fieldLabel(err.key)} » a déclenché ${err.count} messages d’erreur. Un champ trop strict ou mal expliqué (format du téléphone, par exemple) fait perdre des demandes.`);
  const dev = Object.fromEntries(c.byDevice.map((d) => [d.key, d]));
  if (dev.mobile && dev.desktop && dev.mobile.sessions >= 30 && dev.desktop.sessions >= 30 && share(dev.mobile.engaged, dev.mobile.sessions) < share(dev.desktop.engaged, dev.desktop.sessions) * 0.6) add('warn', 'L’expérience semble moins bonne sur téléphone', `${rate(dev.mobile.engaged, dev.mobile.sessions)} des visiteurs sur téléphone explorent le site, contre ${rate(dev.desktop.engaged, dev.desktop.sessions)} sur ordinateur. Testez le site sur votre téléphone : lisibilité, boutons, formulaires.`);
  const paid = c.bySource.find((s) => s.key === 'paid');
  if (paid && paid.sessions >= 20 && paid.submitted === 0) add('warn', 'Les publicités amènent du monde, mais aucune demande', `${paid.sessions} visiteurs viennent de publicités payantes, ${rate(paid.engaged, paid.sessions)} ont exploré le site, aucun n’a envoyé de formulaire. Vérifiez que la page d’arrivée correspond à l’annonce et que le mot-clé ou le ciblage attire des décideurs.`);
  const blind = tracked && c.landingPages.find((p) => p.sessions >= 20 && p.formSeen === 0);
  if (blind) add('warn', `La page ${pageLabel(blind.path)} ne montre aucun formulaire`, `${blind.sessions} visiteurs y arrivent mais aucun ne voit de formulaire. Ajoutez un bouton d’action visible sans avoir à défiler.`);
  const hasScroll = c.landingPages.some((p) => p.scroll50 > 0);
  const shallow = hasScroll && c.landingPages.find((p) => p.sessions >= 20 && share(p.scroll50, p.sessions) < 25);
  if (shallow) add('warn', `Peu de visiteurs lisent la page ${pageLabel(shallow.path)}`, `Seuls ${rate(shallow.scroll50, shallow.sessions)} arrivent à la moitié de la page. Mettez l’essentiel (promesse, preuve, bouton) en haut.`);
  if (tracked && !out.some((o) => o.tone === 'warn')) add('good', 'Aucun point d’alerte détecté', 'Rien d’anormal dans les chiffres actuels. Continuez à surveiller l’évolution.');
  return out;
}

function Diagnostics({ items }) {
  return <div className="admin-card"><h3>Ce que disent vos chiffres<InfoTip label="Explication : diagnostic">Des constats rédigés automatiquement à partir des données. Ce sont des pistes à vérifier, pas des verdicts : plus il y a de visiteurs, plus elles sont fiables.</InfoTip></h3>
    <div className="admin-diag">{items.map((item) => <div className={`admin-diag-item ${item.tone}`} key={item.title}><strong>{item.title}</strong><p>{item.text}</p></div>)}</div></div>;
}

function Table({ title, info, columns, rows, empty = 'Pas encore de données.' }) {
  return <div className="admin-card"><h3>{title}{info && <InfoTip label={`Explication : ${title}`}>{info}</InfoTip>}</h3>
    {!rows.length ? <p className="hint">{empty}</p> : <div className="admin-conv-scroll"><table className="admin-conv-table"><thead><tr>{columns.map((col) => <th key={col.label} className={col.num ? 'num' : ''}>{col.label}{col.info && <InfoTip label={`Explication : ${col.label}`}>{col.info}</InfoTip>}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i}>{columns.map((col) => <td key={col.label} className={col.num ? 'num' : ''}>{col.render(row, i)}</td>)}</tr>)}</tbody></table></div>}</div>;
}

export default function ConversionReport({ traffic, leads }) {
  const c = traffic.conversion;
  if (!c || !c.sessions) return <div className="admin-card admin-empty-state"><h3>Pas encore de parcours à analyser</h3><p className="hint">Les premières données arriveront avec les prochaines visites.</p></div>;
  const f = Object.fromEntries(c.funnel.map((s) => [s.key, s.count]));
  const leadsCount = leads?.total ?? 0;
  const segCols = (labels) => [
    { label: 'Groupe', render: (r) => labels[r.key] || r.key },
    { label: 'Visiteurs', num: true, render: (r) => r.sessions },
    { label: 'Explorent', num: true, info: 'Part des visiteurs qui ouvrent une 2ᵉ page ou cliquent. Plus elle est haute, plus le trafic est qualifié.', render: (r) => rate(r.engaged, r.sessions) },
    { label: 'Demandes', num: true, render: (r) => r.submitted },
  ];
  return <>
    <div className="admin-howto"><strong>Comment utiliser cet onglet ?</strong><p>Il suit le trajet d’un visiteur jusqu’à la demande de contact. Commencez par le parcours : repérez l’étape où l’on perd le plus de monde, puis lisez les constats et les tableaux pour comprendre pourquoi. Modifiez une chose à la fois sur le site, puis revenez comparer.</p></div>
    <div className="admin-stat-strip">
      <StatCard label="Visiteurs" value={c.sessions} hint={`${c.pagesPerSession} page${c.pagesPerSession > 1 ? 's' : ''} vue${c.pagesPerSession > 1 ? 's' : ''} en moyenne`} info="Nombre de personnes différentes (robots exclus). Une personne qui revient dans un nouvel onglet ou une nouvelle session compte à nouveau."/>
      <StatCard label="Repartent sans rien faire" value={rate(c.singlePage, c.sessions)} hint={`${c.singlePage} visiteurs`} info="Part des visiteurs qui n’ouvrent qu’une page et ne cliquent sur rien. Plus ce chiffre est bas, mieux c’est."/>
      <StatCard label="Taux de conversion" value={rate(f.formSubmitted, f.visitors)} hint={`${f.formSubmitted} visiteur${f.formSubmitted > 1 ? 's' : ''} sur ${f.visitors}`} info="Part des visiteurs qui envoient une demande. C’est l’indicateur final : tout le reste sert à le faire monter."/>
      <StatCard label="Demandes reçues (leads)" value={leadsCount} hint="Enregistrées dans l’onglet Leads" info="Nombre de demandes réellement enregistrées dans la base. Elle peut différer du nombre de formulaires envoyés si un visiteur a refusé la mesure ou bloqué le suivi."/>
    </div>
    <Funnel steps={c.funnel}/>
    <Diagnostics items={buildDiagnostics(c)}/>
    <Table title="Performance de chaque formulaire" info="Chaque ligne est un formulaire du site. « Vu » = affiché à l’écran, « Commencé » = au moins un champ touché, « Envoyé » = demande transmise. Les deux taux montrent où l’on perd les gens : avant de commencer, ou en cours de route." columns={[
      { label: 'Formulaire', render: (r) => formLabel(r.form) },
      { label: 'Vu', num: true, render: (r) => r.views },
      { label: 'Commencé', num: true, render: (r) => r.starts },
      { label: 'Envoyé', num: true, render: (r) => r.submits },
      { label: '% commencé', num: true, info: 'Parmi ceux qui ont vu le formulaire, part qui l’a commencé. Un chiffre bas = l’accroche ne suffit pas.', render: (r) => rate(r.starts, r.views) },
      { label: '% terminé', num: true, info: 'Parmi ceux qui ont commencé, part qui l’a envoyé. Un chiffre bas = formulaire trop long ou frein à l’envoi.', render: (r) => rate(r.submits, r.starts) },
      { label: 'Erreurs', num: true, info: 'Nombre de messages d’erreur affichés. Beaucoup d’erreurs = champs mal compris.', render: (r) => r.errors },
    ]} rows={c.forms}/>
    <Table title="Pages d’arrivée : lesquelles convertissent ?" info="Une ligne par page par laquelle les visiteurs entrent sur le site. « Explorent » = ouvrent une autre page ou cliquent. « Lisent la moitié » = ont défilé au moins jusqu’au milieu (mesuré depuis la mise en place du suivi). « Voient un formulaire » et « Demandes » indiquent si la page pousse à l’action." columns={[
      { label: 'Page', render: (r) => pageLabel(r.path) },
      { label: 'Visiteurs', num: true, render: (r) => r.sessions },
      { label: 'Explorent', num: true, render: (r) => rate(r.engaged, r.sessions) },
      { label: 'Lisent la moitié', num: true, render: (r) => (c.landingPages.some((p) => p.scroll50) ? rate(r.scroll50, r.sessions) : '—') },
      { label: 'Cliquent un contact', num: true, info: 'Part des visiteurs qui cliquent sur un bouton d’action ou un moyen de contact (téléphone, e-mail, rendez-vous).', render: (r) => rate(r.cta, r.sessions) },
      { label: 'Voient un formulaire', num: true, render: (r) => rate(r.formSeen, r.sessions) },
      { label: 'Demandes', num: true, render: (r) => r.submitted },
    ]} rows={c.landingPages}/>
    <div className="admin-analytics-panel">
      <DonutChart title="Visiteurs par origine" items={c.bySource.map((s) => ({ key: SOURCE_LABELS[s.key] || s.key, count: s.sessions }))} unit="visiteurs" info="Part de chaque canal dans vos visiteurs. Comparez avec le tableau à côté : un canal qui amène beaucoup de monde mais où presque personne n’explore est à revoir."/>
      <Table title="Qualité du trafic par origine" info="Pour chaque origine : nombre de visiteurs, part qui explore le site et nombre de demandes. Un petit canal qui explore beaucoup peut être plus intéressant qu’un gros canal qui rebondit." columns={segCols(SOURCE_LABELS)} rows={c.bySource}/>
      <DonutChart title="Visiteurs par appareil" items={c.byDevice.map((s) => ({ key: DEVICE_LABELS[s.key] || s.key, count: s.sessions }))} unit="visiteurs" info="Téléphone, ordinateur ou tablette. Le téléphone pèse souvent plus de la moitié du trafic : il doit être irréprochable."/>
      <Table title="Qualité du trafic par appareil" info="Comparez la part qui explore le site selon l’appareil. Un écart important signale un problème d’ergonomie sur le plus faible." columns={segCols(DEVICE_LABELS)} rows={c.byDevice}/>
    </div>
    <div className="admin-analytics-panel">
      <Table title="Test d’éligibilité : où abandonne-t-on ?" info="Le test d’éligibilité compte 4 étapes. Chaque ligne indique combien de personnes ont validé l’étape. Une grosse chute entre deux lignes = la question suivante fait fuir." columns={[
        { label: 'Étape validée', render: (r) => ELIGIBILITY_STEPS[r.step] || `Étape ${r.step}` },
        { label: 'Visiteurs', num: true, render: (r) => r.count },
        { label: 'vs étape précédente', num: true, render: (r, i) => (i ? rate(r.count, c.eligibilitySteps[i - 1].count) : '—') },
      ]} rows={c.eligibilitySteps} empty="Aucun visiteur n’a encore validé d’étape du test depuis la mise en place du suivi."/>
      <Table title="Champs qui provoquent des erreurs" info="Les champs où le visiteur a vu un message d’erreur (par exemple un numéro de téléphone mal formaté). Chaque erreur est une occasion d’abandon." columns={[
        { label: 'Champ', render: (r) => fieldLabel(r.key) },
        { label: 'Erreurs', num: true, render: (r) => r.count },
      ]} rows={c.errorsByField} empty="Aucune erreur de formulaire enregistrée, c’est plutôt bon signe."/>
    </div>
  </>;
}
