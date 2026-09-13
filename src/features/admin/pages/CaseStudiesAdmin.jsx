import { useCallback, useEffect, useState } from 'react';
import {
  createCaseStudy,
  deleteCaseStudy,
  getCaseStudy,
  listCaseStudies,
  updateCaseStudy,
} from '../adminService';
import { ErrorBox, Loading } from '../ui';
import { ImageField, SelectField, TagsField, TextArea, TextField, slugify } from '../fields';

const EMPTY = {
  slug: '', title: '', sector: '', tags: [], summary: '',
  problem: '', diagnosis: '', solution: '', works: '', results: '',
  metrics: [], location: '', cover_image_url: '', cover_image_alt: '',
  seo_title: '', seo_description: '', status: 'draft', indexable: true,
};

export default function CaseStudiesAdmin() {
  const [state, setState] = useState({ status: 'loading' });
  const [editing, setEditing] = useState(null); // id | 'new' | null

  const load = useCallback(() => {
    setState({ status: 'loading' });
    listCaseStudies()
      .then((items) => setState({ status: 'ready', items }))
      .catch((error) => setState({ status: 'error', error }));
  }, []);

  useEffect(load, [load]);

  if (editing) {
    return (
      <Editor
        id={editing === 'new' ? null : editing}
        onDone={() => {
          setEditing(null);
          load();
        }}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h2>Réalisations</h2>
          <p className="hint">Gérez les cas clients publiés sur le site.</p>
        </div>
        <button className="admin-btn" onClick={() => setEditing('new')}>+ Nouvelle réalisation</button>
      </div>
      {state.status === 'loading' && <Loading />}
      {state.status === 'error' && <ErrorBox error={state.error} />}
      {state.status === 'ready' && (
        <ul className="admin-list">
          {state.items.map((item) => (
            <li key={item.id}>
              <span>
                <strong>{item.title}</strong>
                <span className="muted"> · {item.sector} · /realisations/{item.slug}</span>
              </span>
              <span className="admin-item-actions">
                <span className={`admin-badge ${item.status === 'published' ? 'published' : ''}`}>
                  {item.status === 'published' ? 'Publié' : 'Brouillon'}
                </span>
                <button className="admin-btn ghost" onClick={() => setEditing(item.id)}>Éditer</button>
              </span>
            </li>
          ))}
          {state.items.length === 0 && <li className="muted">Aucune réalisation.</li>}
        </ul>
      )}
    </>
  );
}

function Editor({ id, onDone, onCancel }) {
  const [form, setForm] = useState(id ? null : EMPTY);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (id) {
      getCaseStudy(id)
        .then((item) => setForm({ ...EMPTY, ...item, tags: item.tags || [], metrics: item.metrics || [] }))
        .catch(setError);
    }
  }, [id]);

  if (!form) return error ? <ErrorBox error={error} /> : <Loading />;

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const save = async () => {
    setBusy(true);
    setError(null);
    const payload = { ...form, slug: form.slug || slugify(form.title) };
    delete payload.id;
    delete payload.created_at;
    delete payload.updated_at;
    try {
      if (id) await updateCaseStudy(id, payload);
      else await createCaseStudy(payload);
      onDone();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm('Supprimer définitivement cette réalisation ?')) return;
    setBusy(true);
    try {
      await deleteCaseStudy(id);
      onDone();
    } catch (err) {
      setError(err);
      setBusy(false);
    }
  };

  return (
    <>
      <div className="admin-topbar">
        <h2>{id ? 'Éditer la réalisation' : 'Nouvelle réalisation'}</h2>
        <button className="admin-btn ghost" onClick={onCancel}>← Retour</button>
      </div>
      <ErrorBox error={error} />

      <div className="admin-card">
        <TextField label="Titre" value={form.title} onChange={(v) => set({ title: v, slug: form.slug || slugify(v) })} />
        <div className="admin-row">
          <TextField label="Slug" hint="URL : /realisations/…" value={form.slug} onChange={(v) => set({ slug: slugify(v) })} />
          <TextField label="Secteur" value={form.sector} onChange={(v) => set({ sector: v })} />
        </div>
        <TagsField label="Tags / filtres" value={form.tags} onChange={(v) => set({ tags: v })} />
        <TextArea label="Résumé (carte + accroche)" rows={3} value={form.summary} onChange={(v) => set({ summary: v })} />
        <TextField label="Lieu / mention" value={form.location} onChange={(v) => set({ location: v })} />
      </div>

      <div className="admin-card">
        <h3>Récit du projet</h3>
        <TextArea label="Problématique" value={form.problem} onChange={(v) => set({ problem: v })} />
        <TextArea label="Diagnostic" value={form.diagnosis} onChange={(v) => set({ diagnosis: v })} />
        <TextArea label="Solution" value={form.solution} onChange={(v) => set({ solution: v })} />
        <TextArea label="Travaux" value={form.works} onChange={(v) => set({ works: v })} />
        <TextArea label="Résultats" value={form.results} onChange={(v) => set({ results: v })} />
      </div>

      <MetricsEditor value={form.metrics} onChange={(v) => set({ metrics: v })} />

      <ImageField
        label="Image de couverture"
        value={form.cover_image_url}
        altValue={form.cover_image_alt}
        onChange={(v) => set({ cover_image_url: v })}
        onAltChange={(v) => set({ cover_image_alt: v })}
      />

      <div className="admin-card">
        <h3>SEO</h3>
        <TextField label="Titre SEO" hint="Laisser vide pour utiliser le titre." value={form.seo_title} onChange={(v) => set({ seo_title: v })} />
        <TextArea label="Meta description" rows={2} value={form.seo_description} onChange={(v) => set({ seo_description: v })} />
        <SelectField
          label="Statut"
          value={form.status}
          onChange={(v) => set({ status: v })}
          options={[{ value: 'draft', label: 'Brouillon' }, { value: 'published', label: 'Publié' }]}
        />
        <label className="admin-check">
          <input type="checkbox" checked={form.indexable} onChange={(e) => set({ indexable: e.target.checked })} />
          Indexable par les moteurs de recherche
        </label>
      </div>

      <div className="admin-actions admin-savebar">
        <button className="admin-btn" disabled={busy} onClick={save}>{busy ? 'Enregistrement…' : 'Enregistrer'}</button>
        {id && <button className="admin-btn danger" disabled={busy} onClick={remove}>Supprimer</button>}
      </div>
    </>
  );
}

function MetricsEditor({ value, onChange }) {
  const rows = value || [];
  const update = (i, patch) => onChange(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  return (
    <div className="admin-card">
      <h3>Chiffres clés</h3>
      {rows.map((row, i) => (
        <div key={i} className="admin-row admin-metrics-row">
          <TextField label="Valeur" value={row.value} onChange={(v) => update(i, { value: v })} />
          <TextField label="Libellé" value={row.label} onChange={(v) => update(i, { label: v })} />
          <TextField label="Détail" value={row.detail} onChange={(v) => update(i, { detail: v })} />
          <button className="admin-btn ghost" onClick={() => onChange(rows.filter((_, idx) => idx !== i))}>✕</button>
        </div>
      ))}
      <button className="admin-btn ghost" onClick={() => onChange([...rows, { value: '', label: '', detail: '' }])}>
        + Ajouter un chiffre
      </button>
    </div>
  );
}
