import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {
  fetchBlogCategories,
  fetchPublishedBlogPosts,
  fetchPublishedCaseStudies,
} from './lib/supabaseContent.mjs';
import { solutions } from '../src/data/solutions.js';
import { sectors } from '../src/data/sectors.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = path.join(root, 'dist');
const template = await readFile(path.join(dist, 'index.html'), 'utf8');
const { render } = await import(path.join(dist, 'server', 'entry-server.js'));

const [caseStudies, blogPosts, blogCategories] = await Promise.all([
  fetchPublishedCaseStudies(),
  fetchPublishedBlogPosts(),
  fetchBlogCategories(),
]);

const keys = {
  caseStudyList: 'case-studies:list',
  caseStudy: (slug) => `case-study:${slug}`,
  blogList: 'blog:list',
  blogCategories: 'blog:categories',
  blogPost: (slug) => `blog-post:${slug}`,
};

// Route -> content-store payload used during SSR and shipped for hydration.
const routes = [
  { url: '/', preload: { [keys.caseStudyList]: caseStudies, [keys.blogList]: blogPosts } },
  { url: '/solutions', preload: {} },
  { url: '/secteurs', preload: {} },
  { url: '/financement-cee', preload: {} },
  { url: '/eligibilite', preload: {} },
  { url: '/a-propos', preload: {} },
  { url: '/contact', preload: {} },
  { url: '/faq', preload: {} },
  { url: '/plan-du-site', preload: {} },
  ...solutions.map((item) => ({ url: `/solutions/${item.slug}`, preload: {} })),
  ...sectors.map((item) => ({ url: `/secteurs/${item.slug}`, preload: {} })),
  {
    url: '/realisations',
    preload: { [keys.caseStudyList]: caseStudies },
  },
  {
    url: '/ressources',
    preload: { [keys.blogList]: blogPosts, [keys.blogCategories]: blogCategories },
  },
  ...caseStudies.map((item) => ({
    url: `/realisations/${item.slug}`,
    preload: { [keys.caseStudy(item.slug)]: item },
  })),
  ...blogPosts.map((post) => ({
    url: `/ressources/${post.slug}`,
    preload: { [keys.blogPost(post.slug)]: post },
  })),
];

function esc(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function headMarkup(head) {
  if (!head) return '';
  const tags = [];
  if (head.title) tags.push(`<title>${esc(head.title)}</title>`);
  if (head.description) tags.push(`<meta name="description" content="${esc(head.description)}" />`);
  if (head.canonical) tags.push(`<link rel="canonical" href="${esc(head.canonical)}" />`);
  tags.push(`<meta name="robots" content="${head.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'}" />`);
  tags.push(`<meta name="author" content="${esc(head.siteName)}" />`);
  tags.push(`<meta property="og:title" content="${esc(head.title)}" />`);
  if (head.description) tags.push(`<meta property="og:description" content="${esc(head.description)}" />`);
  tags.push(`<meta property="og:type" content="${esc(head.type || 'website')}" />`);
  if (head.canonical) tags.push(`<meta property="og:url" content="${esc(head.canonical)}" />`);
  tags.push(`<meta property="og:site_name" content="${esc(head.siteName)}" />`);
  tags.push('<meta property="og:locale" content="fr_FR" />');
  if (head.image) tags.push(`<meta property="og:image" content="${esc(head.image)}" />`);
  if (head.imageAlt) tags.push(`<meta property="og:image:alt" content="${esc(head.imageAlt)}" />`);
  tags.push('<meta name="twitter:card" content="summary_large_image" />');
  tags.push(`<meta name="twitter:title" content="${esc(head.title)}" />`);
  if (head.description) tags.push(`<meta name="twitter:description" content="${esc(head.description)}" />`);
  if (head.image) tags.push(`<meta name="twitter:image" content="${esc(head.image)}" />`);
  if (head.imageAlt) tags.push(`<meta name="twitter:image:alt" content="${esc(head.imageAlt)}" />`);
  if (head.article) {
    const a = head.article;
    if (a.publishedTime) tags.push(`<meta property="article:published_time" content="${esc(a.publishedTime)}" />`);
    if (a.modifiedTime) tags.push(`<meta property="article:modified_time" content="${esc(a.modifiedTime)}" />`);
    if (a.section) tags.push(`<meta property="article:section" content="${esc(a.section)}" />`);
    (a.tags || []).forEach((t) => tags.push(`<meta property="article:tag" content="${esc(t)}" />`));
  }
  if (head.schema) {
    const list = Array.isArray(head.schema) ? head.schema : [head.schema];
    list.forEach((entry) => {
      tags.push(`<script type="application/ld+json">${JSON.stringify(entry).replace(/</g, '\\u003c')}</script>`);
    });
  }
  return tags.join('\n    ');
}

let ok = 0;
let failed = 0;
for (const route of routes) {
  try {
    const { html, head } = render(route.url, route.preload);
    const preloadScript = `<script>window.__PRELOADED_CONTENT__=${JSON.stringify(route.preload).replace(/</g, '\\u003c')}</script>`;
    // Drop the template's default <title> / meta description so the per-page
    // ones injected below are the only ones.
    const cleanedTemplate = head
      ? template
          .replace(/\s*<title>[^<]*<\/title>/i, '')
          .replace(/\s*<meta name="description"[^>]*>/i, '')
      : template;
    const page = cleanedTemplate
      .replace('<!--app-head-->', `${headMarkup(head)}\n    ${preloadScript}`)
      .replace('<!--app-html-->', html);
    const outDir = route.url === '/' ? dist : path.join(dist, route.url);
    await mkdir(outDir, { recursive: true });
    await writeFile(path.join(outDir, 'index.html'), page);
    ok += 1;
  } catch (error) {
    failed += 1;
    console.warn(`[prerender] ${route.url} → ${error.message}`);
  }
}

// SPA fallback + API passthroughs live in netlify.toml (order matters), so the
// _redirects file is intentionally not written here.
console.log(`[prerender] ${ok} pages générées, ${failed} échecs.`);
if (failed && process.env.PRERENDER_STRICT === '1') process.exit(1);
