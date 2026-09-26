import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { fetchLead, fetchLeads, setLeadStatus } from '../adminService';
import { ErrorBox, Loading } from '../ui';

const TABS = [
  { key: 'all', label: 'Tous' },
  { key: 'contact', label: 'Contact' },
  { key: 'eligibility', label: 'Éligibilité' },
  { key: 'landing_page', label: 'Landing page' },
  { key: 'campaign', label: 'Campagne' },
];
const STATUS_LABELS = {
  new: 'Nouveau', to_contact: 'À contacter', contacted: 'Contacté', qualified: 'Qualifié',
  appointment: 'RDV', proposal: 'Proposition', won: 'Gagné', lost: 'Perdu', completed: 'Terminé',
};
const LOST_REASONS = {
  budget: 'Budget', timing: 'Timing', not_qualified: 'Non qualifié',
  no_response: 'Sans réponse', competitor: 'Concurrent', other: 'Autre',
};
const fmt = (iso) => (iso ? new Date(iso).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }) : '—');

export default function Leads() {
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState({ key: 'createdAt', dir: 'desc' });
  const [state, setState] = useState({ status: 'loading' });
  const [selected, setSelected] = useState(null);

  const load = useCallback(() => {
    setState({ status: 'loading' });
    fetchLeads({ type: tab, q })
      .then((data) => setState({ status: 'ready', data }))
      .catch((error) => setState({ status: 'error', error }));
  }, [tab, q]);

  useEffect(() => {
    const id = setTimeout(load, q ? 300 : 0);
    return () => clearTimeout(id);
  }, [load, q]);

  const rows = useMemo(() => {
    if (state.status !== 'ready') return [];
    const list = [...state.data.leads];
    const { key, dir } = sort;
    list.sort((a, b) => {
      const va = a[key] ?? '';
      const vb = b[key] ?? '';
      if (va < vb) return dir === 'asc' ? -1 : 1;
      if (va > vb) return dir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [state, sort]);

  const counts = state.status === 'ready' ? state.data.countsByType : {};
  const toggleSort = (key) => setSort((s) => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }));

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h2>Leads</h2>
          <p className="hint">Qualifiez et suivez chaque opportunité commerciale.</p>
        </div>
        <input
          className="admin-search"
          aria-label="Rechercher un lead"
          placeholder="Rechercher (société, e-mail, nom)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="filter-tabs" role="tablist" aria-label="Filtrer les leads par origine">
        {TABS.map((t) => (
          <button
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`admin-btn ghost ${tab === t.key ? 'is-active' : ''}`}
          >
            {t.label}
            {counts[t.key] != null && <small>{counts[t.key] ?? 0}</small>}
          </button>
        ))}
      </div>

      {state.status === 'loading' && <Loading />}
      {state.status === 'error' && <ErrorBox error={state.error} />}
      {state.status === 'ready' && (
        <div className="admin-card admin-table-wrap">
          <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                {[
                  ['createdAt', 'Date'],
                  ['company', 'Société'],
                  ['name', 'Contact'],
                  ['sector', 'Secteur'],
                  ['score', 'Score'],
                  ['status', 'Statut'],
                ].map(([key, label]) => (
                  <th
                    key={key}
                    aria-sort={sort.key === key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    <button className="admin-sort" type="button" onClick={() => toggleSort(key)}>
                      {label}
                      {sort.key === key ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => setSelected(lead.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') setSelected(lead.id);
                  }}
                  tabIndex={0}
                  aria-label={`Ouvrir la fiche de ${lead.company || lead.name || 'ce lead'}`}
                >
                  <td style={{ whiteSpace: 'nowrap' }}>{fmt(lead.createdAt)}</td>
                  <td>
                    <strong className="admin-lead-company">{lead.company || 'Entreprise non renseignée'}</strong>
                  </td>
                  <td className="admin-contact-cell">
                    {lead.name || '—'}
                    <div className="muted">{lead.email || lead.phone || ''}</div>
                  </td>
                  <td>{lead.sector || 'Non renseigné'}</td>
                  <td>{lead.score ?? '—'}</td>
                  <td>
                    <span className="admin-badge">{STATUS_LABELS[lead.status] || lead.status}</span>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="muted admin-empty-cell">
                    Aucun lead pour le moment. Les demandes envoyées depuis le site apparaîtront ici.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {selected && <LeadDrawer id={selected} onClose={() => setSelected(null)} onChanged={load} />}
    </>
  );
}

function LeadDrawer({ id, onClose, onChanged }) {
  const [state, setState] = useState({ status: 'loading' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [lostReason, setLostReason] = useState('');

  const load = useCallback(() => {
    setState({ status: 'loading' });
    fetchLead(id)
      .then((data) => setState({ status: 'ready', data }))
      .catch((error) => setState({ status: 'error', error }));
  }, [id]);

  useEffect(load, [load]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const changeStatus = async (status, reason) => {
    if (status === 'lost' && !reason) {
      setLostReason('other');
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      await setLeadStatus(id, status, reason);
      setLostReason('');
      load();
      onChanged?.();
    } catch (error) {
      setErr(error);
    } finally {
      setBusy(false);
    }
  };

  const lead = state.data?.lead;
  const need = state.data?.needs?.[0];
  const acq = state.data?.acquisitions?.[0];

  // Portail vers <body> : sinon le position:fixed se cale sur .admin-main (animé) et non sur l'écran.
  return createPortal(
    <div className="admin admin-portal">
    <div
      className="admin-drawer-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="admin-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-drawer-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-topbar">
          <div>
            <p className="admin-kicker">Opportunité commerciale</p>
            <h2 className="admin-drawer-title" id="lead-drawer-title">Fiche du lead</h2>
          </div>
          <button type="button" className="admin-btn ghost" onClick={onClose}>Fermer</button>
        </div>

        {state.status === 'loading' && <Loading />}
        {state.status === 'error' && <ErrorBox error={state.error} />}
        {state.status === 'ready' && (
          <>
            {err && <ErrorBox error={err} />}
            <section className="admin-lead-overview">
              <div>
                <p className="admin-kicker">{lead.source_form || 'Formulaire du site'}</p>
                <strong className="admin-lead-name">{lead.company_name || 'Entreprise non renseignée'}</strong>
                <p className="muted admin-lead-meta">Reçu le {fmt(lead.created_at)}</p>
              </div>
              <label className="admin-lead-status-control">
                <span>Statut</span>
                <select
                  value={lead.status || 'new'}
                  disabled={busy}
                  onChange={(event) => changeStatus(event.target.value)}
                >
                  {Object.entries(STATUS_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                </select>
              </label>
            </section>

            <section className="admin-card admin-lead-section">
              <h3>Coordonnées</h3>
              <div className="admin-lead-detail-grid">
                <Detail k="Prénom" v={lead.first_name} />
                <Detail k="Nom" v={lead.last_name} />
                <Detail k="Entreprise" v={lead.company_name} />
                <Detail k="Téléphone" v={lead.phone} href={lead.phone ? `tel:${lead.phone.replace(/\s/g, '')}` : undefined} />
                <Detail k="E-mail" v={lead.email} href={lead.email ? `mailto:${lead.email}` : undefined} />
              </div>
              <div className="admin-lead-contact-actions">
                {lead.phone && <a className="admin-btn" href={`tel:${lead.phone.replace(/\s/g, '')}`}>Appeler</a>}
                {lead.email && <a className="admin-btn ghost" href={`mailto:${lead.email}`}>Écrire un e-mail</a>}
              </div>
            </section>

            {lostReason && (
              <div className="admin-lost-reason">
                <label htmlFor="lost-reason">Motif de perte</label>
                <select id="lost-reason" value={lostReason} onChange={(event) => setLostReason(event.target.value)}>
                  {Object.entries(LOST_REASONS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                <div className="admin-actions">
                  <button type="button" className="admin-btn danger" disabled={busy} onClick={() => changeStatus('lost', lostReason)}>Confirmer la perte</button>
                  <button type="button" className="admin-btn ghost" disabled={busy} onClick={() => setLostReason('')}>Annuler</button>
                </div>
              </div>
            )}

            {need && (
              <section className="admin-card admin-lead-section">
                <h3>Besoin</h3>
                <div className="admin-lead-detail-grid">
                  <Detail k="Secteur" v={need.sector} />
                  <Detail k="Type de bâtiment" v={need.building_type} />
                  <Detail k="Surface du site" v={need.site_size} />
                  <Detail k="Type de projet" v={need.project_type} />
                  <Detail k="Solution" v={need.solution_slug} />
                  <Detail k="Calendrier" v={need.project_timeline} />
                  <Detail k="Score de qualification" v={need.qualification_score} />
                  <Detail k="Équipements" v={Array.isArray(need.equipment) ? need.equipment.join(', ') : need.equipment} />
                </div>
                <Detail k="Message" v={need.message} className="admin-lead-message" />
              </section>
            )}

            {acq && (
              <section className="admin-card admin-lead-section admin-lead-context">
                <h3>Acquisition</h3>
                <div className="admin-lead-detail-grid">
                  <Detail k="Page d’arrivée" v={acq.landing_page} />
                  <Detail k="Référent" v={acq.referrer} />
                  <Detail k="CTA cliqué" v={acq.cta_source} />
                  <Detail k="Source / medium" v={[acq.utm_source, acq.utm_medium].filter(Boolean).join(' / ')} />
                  <Detail k="Campagne" v={acq.utm_campaign} />
                  <Detail k="gclid" v={acq.gclid} />
                </div>
              </section>
            )}

            <div className="admin-card">
              <h3>Historique</h3>
              <ul className="admin-list">
                {state.data.events.map((event) => (
                  <li key={event.id}>
                    <span>
                      <strong>{event.event_type}</strong>
                      <span className="muted"> · {fmt(event.created_at)}</span>
                      {event.metadata && Object.keys(event.metadata).length > 0 && (
                        <div className="muted">{JSON.stringify(event.metadata)}</div>
                      )}
                    </span>
                  </li>
                ))}
                {state.data.events.length === 0 && <li className="muted">Aucun événement.</li>}
              </ul>
            </div>

            {state.data.consents.length > 0 && (
              <div className="admin-card">
                <h3>Consentements</h3>
                {state.data.consents.map((c) => (
                  <Row key={c.id} k={c.consent_type} v={`${c.accepted ? 'accepté' : 'refusé'} · ${fmt(c.accepted_at || c.created_at)}`} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </div>,
    document.body,
  );
}

function Detail({ k, v, href, className = '' }) {
  const value = v == null || v === '' ? 'Non renseigné' : String(v);
  return (
    <div className={`admin-lead-detail ${className}`}>
      <span>{k}</span>
      {href ? <a href={href}>{value}</a> : <strong>{value}</strong>}
    </div>
  );
}

function Row({ k, v }) {
  if (v == null || v === '') return null;
  return <Detail k={k} v={v} />;
}
