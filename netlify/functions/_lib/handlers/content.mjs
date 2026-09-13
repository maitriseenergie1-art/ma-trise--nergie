import { admin } from '../supabaseAdmin.mjs';
import { json, readJson } from '../http.mjs';

const CASE_COLUMNS = new Set([
  'slug', 'title', 'sector', 'tags', 'summary', 'problem', 'diagnosis', 'solution', 'works', 'results',
  'metrics', 'location', 'cover_image_url', 'cover_image_alt', 'gallery', 'seo_title', 'seo_description',
  'status', 'indexable', 'published_at',
]);

const POST_COLUMNS = new Set([
  'slug', 'title', 'excerpt', 'body_markdown', 'category_id', 'tags', 'author_name', 'cover_image_url',
  'cover_image_alt', 'reading_minutes', 'seo_title', 'seo_description', 'status', 'indexable', 'published_at',
]);

const CATEGORY_COLUMNS = new Set(['slug', 'name', 'description']);

function pick(body, allowed) {
  const out = {};
  for (const [k, v] of Object.entries(body || {})) if (allowed.has(k)) out[k] = v;
  return out;
}

// Auto-manage published_at so "published" rows always satisfy the DB constraint.
function withPublishAt(payload) {
  if (payload.status === 'published' && !payload.published_at) payload.published_at = new Date().toISOString();
  if (payload.status === 'draft') payload.published_at = null;
  return payload;
}

function crud(table, columns, listSelect) {
  return {
    async list() {
      const { data, error } = await admin.from(table).select(listSelect).order('updated_at', { ascending: false });
      if (error) return json({ error: error.message }, 500);
      return json({ items: data ?? [] });
    },
    async get(id) {
      const { data, error } = await admin.from(table).select(listSelect).eq('id', id).maybeSingle();
      if (error) return json({ error: error.message }, 500);
      if (!data) return json({ error: 'not_found' }, 404);
      return json({ item: data });
    },
    async create(req) {
      const body = await readJson(req);
      const payload = withPublishAt(pick(body, columns));
      const { data, error } = await admin.from(table).insert(payload).select(listSelect).single();
      if (error) return json({ error: error.message }, 400);
      return json({ item: data }, 201);
    },
    async update(id, req) {
      const body = await readJson(req);
      const payload = withPublishAt(pick(body, columns));
      const { data, error } = await admin.from(table).update(payload).eq('id', id).select(listSelect).single();
      if (error) return json({ error: error.message }, 400);
      return json({ item: data });
    },
    async remove(id) {
      const { error } = await admin.from(table).delete().eq('id', id);
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    },
  };
}

export const caseStudies = crud('case_studies', CASE_COLUMNS, '*');
export const blogPosts = crud('blog_posts', POST_COLUMNS, '*, category:blog_categories(id,slug,name)');
export const blogCategories = crud('blog_categories', CATEGORY_COLUMNS, '*');
