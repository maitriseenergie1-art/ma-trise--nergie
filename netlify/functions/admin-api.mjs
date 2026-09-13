import { json, requireAuth } from './_lib/http.mjs';
import { supabaseConfigured } from './_lib/supabaseAdmin.mjs';
import { getLead, listLeads, updateLeadStatus } from './_lib/handlers/leads.mjs';
import { blogCategories, blogPosts, caseStudies } from './_lib/handlers/content.mjs';
import { dashboard, stats } from './_lib/handlers/analytics.mjs';
import { uploadImage } from './_lib/handlers/uploads.mjs';

export const config = { path: '/api/admin/*' };

const RESOURCES = {
  'case-studies': caseStudies,
  'blog-posts': blogPosts,
  'blog-categories': blogCategories,
};

export default async function handler(req) {
  const denied = requireAuth(req);
  if (denied) return denied;
  if (!supabaseConfigured) return json({ error: 'supabase_not_configured' }, 500);

  const url = new URL(req.url);
  const segments = url.pathname.replace(/^\/api\/admin\/?/, '').split('/').filter(Boolean);
  const [head, id, action] = segments;
  const method = req.method.toUpperCase();

  try {
    if (!head || head === 'session') return json({ ok: true });
    if (head === 'dashboard') return await dashboard();
    if (head === 'stats') return await stats(url);

    if (head === 'leads') {
      if (method === 'GET' && !id) return await listLeads(url);
      if (method === 'GET' && id) return await getLead(id);
      if (method === 'POST' && id && action === 'status') return await updateLeadStatus(id, req);
      return json({ error: 'method_not_allowed' }, 405);
    }

    if (head === 'uploads') {
      if (method === 'POST') return await uploadImage(req);
      return json({ error: 'method_not_allowed' }, 405);
    }

    const resource = RESOURCES[head];
    if (resource) {
      if (method === 'GET' && !id) return await resource.list();
      if (method === 'GET' && id) return await resource.get(id);
      if (method === 'POST' && !id) return await resource.create(req);
      if ((method === 'PATCH' || method === 'PUT') && id) return await resource.update(id, req);
      if (method === 'DELETE' && id) return await resource.remove(id);
      return json({ error: 'method_not_allowed' }, 405);
    }

    return json({ error: 'not_found', path: url.pathname }, 404);
  } catch (error) {
    console.error('[admin-api]', error);
    return json({ error: 'internal_error', message: error.message }, 500);
  }
}
