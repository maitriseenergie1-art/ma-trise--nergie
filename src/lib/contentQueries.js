// Isomorphic content queries. Each function takes a Supabase client so the same
// code runs in the browser (anon key) and in the build-time prerender (Node).

const CASE_STUDY_LIST_FIELDS =
  'slug,title,sector,tags,summary,cover_image_url,cover_image_alt,location,indexable,published_at';

const CASE_STUDY_DETAIL_FIELDS = `${CASE_STUDY_LIST_FIELDS},problem,diagnosis,solution,works,results,metrics,gallery,seo_title,seo_description`;

const BLOG_LIST_FIELDS =
  'slug,title,excerpt,tags,author_name,cover_image_url,cover_image_alt,reading_minutes,indexable,published_at,category:blog_categories(slug,name)';

const BLOG_DETAIL_FIELDS = `${BLOG_LIST_FIELDS},body_markdown,seo_title,seo_description,updated_at`;

export async function getPublishedCaseStudies(client) {
  const { data, error } = await client
    .from('case_studies')
    .select(CASE_STUDY_LIST_FIELDS)
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getCaseStudyBySlug(client, slug) {
  const { data, error } = await client
    .from('case_studies')
    .select(CASE_STUDY_DETAIL_FIELDS)
    .eq('status', 'published')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function getBlogCategories(client) {
  const { data, error } = await client
    .from('blog_categories')
    .select('slug,name,description')
    .order('name', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getPublishedBlogPosts(client) {
  const { data, error } = await client
    .from('blog_posts')
    .select(BLOG_LIST_FIELDS)
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getBlogPostBySlug(client, slug) {
  const { data, error } = await client
    .from('blog_posts')
    .select(BLOG_DETAIL_FIELDS)
    .eq('status', 'published')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}
