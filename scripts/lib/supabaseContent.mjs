// Build-time content fetch over the Supabase REST API using the public anon key.
// Resilient by design: if the project is unreachable or the tables do not exist
// yet, it returns empty arrays and logs a warning instead of failing the build.

const URL_BASE = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').replace(/\/$/, '');
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

export const supabaseContentConfigured = Boolean(URL_BASE && ANON_KEY);

async function rest(path) {
  if (!supabaseContentConfigured) {
    console.warn('[content] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY manquants — contenu Supabase ignoré.');
    return [];
  }
  try {
    const res = await fetch(`${URL_BASE}/rest/v1/${path}`, {
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
    });
    if (!res.ok) {
      console.warn(`[content] Supabase ${path} → HTTP ${res.status}. Contenu ignoré.`);
      return [];
    }
    return await res.json();
  } catch (error) {
    console.warn(`[content] Supabase ${path} injoignable (${error.message}). Contenu ignoré.`);
    return [];
  }
}

export function fetchPublishedCaseStudies() {
  return rest(
    'case_studies?status=eq.published&order=published_at.desc&select=slug,title,sector,tags,summary,cover_image_url,cover_image_alt,location,indexable,published_at,problem,diagnosis,solution,works,results,metrics,gallery,seo_title,seo_description',
  );
}

export function fetchBlogCategories() {
  return rest('blog_categories?order=name.asc&select=slug,name,description');
}

export function fetchPublishedBlogPosts() {
  return rest(
    'blog_posts?status=eq.published&order=published_at.desc&select=slug,title,excerpt,tags,author_name,cover_image_url,cover_image_alt,reading_minutes,indexable,published_at,updated_at,body_markdown,seo_title,seo_description,category:blog_categories(slug,name)',
  );
}
