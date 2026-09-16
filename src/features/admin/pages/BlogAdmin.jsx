import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createBlogPost,
  createCategory,
  deleteBlogPost,
  deleteCategory,
  getBlogPost,
  listBlogPosts,
  listCategories,
  updateBlogPost,
  updateCategory,
} from '../adminService';
import { ErrorBox, Loading } from '../ui';
import { ImageField, SelectField, TagsField, TextArea, TextField, slugify } from '../fields';
import { renderMarkdown, estimateReadingMinutes } from '../../../lib/markdown';

const EMPTY = {
  slug: '', title: '', excerpt: '', body_markdown: '', category_id: '', tags: [],
  author_name: 'Maîtrise Énergie', cover_image_url: '', cover_image_alt: '',
  reading_minutes: null, seo_title: '', seo_description: '', status: 'draft', indexable: true,
};

export default function BlogAdmin() {
  const [view, setView] = useState('list'); // 'list' | 'categories' | id | 'new'
  const [state, setState] = useState({ status: 'loading' });

  const load = useCallback(() => {
    setState({ status: 'loading' });
    Promise.all([listBlogPosts(), listCategories()])
      .then(([posts, categories]) => setState({ status: 'ready', posts, categories }))
      .catch((error) => setState({ status: 'error', error }));
  }, []);

  useEffect(load, [load]);

  if (view === 'categories') {
    return <Categories categories={state.categories || []} onDone={() => { setView('list'); load(); }} />;
  }
  if (view === 'new' || (view !== 'list' && view)) {
    return (
      <Editor
        id={view === 'new' ? null : view}
        categories={state.categories || []}
        onDone={() => { setView('list'); load(); }}
        onCancel={() => setView('list')}
      />
    );
  }

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h2>Contenus</h2>
          <p className="hint">Rédigez, organisez et publiez les articles de la rubrique Ressources.</p>
        </div>
        <span className="admin-toolbar">
          <button className="admin-btn ghost" onClick={() => setView('categories')}>Catégories</button>
          <button className="admin-btn" onClick={() => setView('new')}>+ Nouvel article</button>
        </span>
      </div>
      {state.status === 'loading' && <Loading />}
      {state.status === 'error' && <ErrorBox error={state.error} />}
      {state.status === 'ready' && (
        <ul className="admin-list">
          {state.posts.map((post) => (
            <li key={post.id}>
              <span>
                <strong>{post.title}</strong>
                <span className="muted"> · {post.category?.name || 'Sans catégorie'} · /ressources/{post.slug}</span>
              </span>
              <span className="admin-item-actions">
                <span className={`admin-badge ${post.status === 'published' ? 'published' : ''}`}>
                  {post.status === 'published' ? 'Publié' : 'Brouillon'}
                </span>
                <button className="admin-btn ghost" onClick={() => setView(post.id)}>Éditer</button>
              </span>
            </li>
          ))}
          {state.posts.length === 0 && <li className="muted">Aucun article.</li>}
        </ul>
      )}
    </>
  );
}

function Editor({ id, categories, onDone, onCancel }) {
  const [form, setForm] = useState(id ? null : EMPTY);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (id) {
      getBlogPost(id)
        .then((item) =>
          setForm({ ...EMPTY, ...item, tags: item.tags || [], category_id: item.category_id || '' }),
        )
        .catch(setError);
    }
  }, [id]);

  const preview = useMemo(() => (form ? renderMarkdown(form.body_markdown) : ''), [form]);

  if (!form) return error ? <ErrorBox error={error} /> : <Loading />;
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const save = async () => {
    setBusy(true);
    setError(null);
    const payload = {
      ...form,
      slug: form.slug || slugify(form.title),
      category_id: form.category_id || null,
      reading_minutes: form.reading_minutes || estimateReadingMinutes(form.body_markdown),
    };
    delete payload.id;
    delete payload.category;
    delete payload.created_at;
    delete payload.updated_at;
    delete payload.search_vector;
    try {
      if (id) await updateBlogPost(id, payload);
      else await createBlogPost(payload);
      onDone();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm('Supprimer définitivement cet article ?')) return;
    setBusy(true);
    try {
      await deleteBlogPost(id);
      onDone();
    } catch (err) {
      setError(err);
      setBusy(false);
    }
  };

  return (
    <>
      <div className="admin-topbar">
        <h2>{id ? 'Éditer l’article' : 'Nouvel article'}</h2>
        <button className="admin-btn ghost" onClick={onCancel}>← Retour</button>
      </div>
      <ErrorBox error={error} />

      <div className="admin-card">
        <TextField label="Titre" value={form.title} onChange={(v) => set({ title: v, slug: form.slug || slugify(v) })} />
        <div className="admin-row">
          <TextField label="Slug" hint="URL : /ressources/…" value={form.slug} onChange={(v) => set({ slug: slugify(v) })} />
          <SelectField
            label="Catégorie"
            value={form.category_id}
            onChange={(v) => set({ category_id: v })}
            options={[{ value: '', label: '— Aucune —' }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
          />
        </div>
        <TextArea label="Chapô / extrait" rows={2} value={form.excerpt} onChange={(v) => set({ excerpt: v })} />
        <div className="admin-row">
          <TextField label="Auteur" value={form.author_name} onChange={(v) => set({ author_name: v })} />
          <TagsField label="Tags" value={form.tags} onChange={(v) => set({ tags: v })} />
        </div>
      </div>

      <div className="admin-card">
        <TextArea
          label="Contenu (Markdown)"
          rows={16}
          value={form.body_markdown}
          onChange={(v) => set({ body_markdown: v })}
          hint={`${estimateReadingMinutes(form.body_markdown)} min de lecture estimées`}
        />
        <details className="admin-preview">
          <summary>Aperçu</summary>
          <div className="prose" dangerouslySetInnerHTML={{ __html: preview }} />
        </details>
      </div>

      <ImageField
        label="Image de couverture"
        value={form.cover_image_url}
        altValue={form.cover_image_alt}
        onChange={(v) => set({ cover_image_url: v })}
        onAltChange={(v) => set({ cover_image_alt: v })}
        nameHint={form.slug || slugify(form.title)}
      />

      <div className="admin-card">
        <h3>SEO & publication</h3>
        <TextField label="Titre SEO" hint="Vide = titre de l’article." value={form.seo_title} onChange={(v) => set({ seo_title: v })} />
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

function Categories({ categories, onDone }) {
  const [items, setItems] = useState(categories);
  const [draft, setDraft] = useState({ name: '', slug: '', description: '' });
  const [error, setError] = useState(null);

  const add = async () => {
    setError(null);
    try {
      const created = await createCategory({ ...draft, slug: draft.slug || slugify(draft.name) });
      setItems((list) => [...list, created]);
      setDraft({ name: '', slug: '', description: '' });
    } catch (err) {
      setError(err);
    }
  };

  const save = async (cat) => {
    try {
      await updateCategory(cat.id, { name: cat.name, slug: cat.slug, description: cat.description });
    } catch (err) {
      setError(err);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Supprimer cette catégorie ? Les articles associés seront sans catégorie.')) return;
    try {
      await deleteCategory(id);
      setItems((list) => list.filter((c) => c.id !== id));
    } catch (err) {
      setError(err);
    }
  };

  return (
    <>
      <div className="admin-topbar">
        <h2>Catégories des ressources</h2>
        <button className="admin-btn ghost" onClick={onDone}>← Retour</button>
      </div>
      <ErrorBox error={error} />
      {items.map((cat, i) => (
        <div key={cat.id} className="admin-card">
          <div className="admin-row">
            <TextField label="Nom" value={cat.name} onChange={(v) => setItems(items.map((c, idx) => (idx === i ? { ...c, name: v } : c)))} />
            <TextField label="Slug" value={cat.slug} onChange={(v) => setItems(items.map((c, idx) => (idx === i ? { ...c, slug: slugify(v) } : c)))} />
          </div>
          <TextField label="Description" value={cat.description} onChange={(v) => setItems(items.map((c, idx) => (idx === i ? { ...c, description: v } : c)))} />
          <div className="admin-actions">
            <button className="admin-btn ghost" onClick={() => save(cat)}>Enregistrer</button>
            <button className="admin-btn danger" onClick={() => remove(cat.id)}>Supprimer</button>
          </div>
        </div>
      ))}
      <div className="admin-card">
        <h3>Nouvelle catégorie</h3>
        <div className="admin-row">
          <TextField label="Nom" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v, slug: draft.slug || slugify(v) })} />
          <TextField label="Slug" value={draft.slug} onChange={(v) => setDraft({ ...draft, slug: slugify(v) })} />
        </div>
        <TextField label="Description" value={draft.description} onChange={(v) => setDraft({ ...draft, description: v })} />
        <button className="admin-btn" onClick={add} disabled={!draft.name}>Ajouter</button>
      </div>
    </>
  );
}
