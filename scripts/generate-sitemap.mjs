import { writeFile } from 'node:fs/promises';
import { solutions } from '../src/data/solutions.js';
import { sectors } from '../src/data/sectors.js';
import { resources } from '../src/data/resources.js';
import { fetchPublishedBlogPosts, fetchPublishedCaseStudies } from './lib/supabaseContent.mjs';

const baseUrl = (process.env.SITE_URL || process.env.VITE_SITE_URL)?.replace(/\/$/, '');
const isProductionBuild = process.argv.includes('--production');
if (!baseUrl) {
  const message = 'SITE_URL is required for a production build. Define SITE_URL before running npm run build.';
  if (isProductionBuild) throw new Error(message);
  console.warn(message);
}

const [caseStudies, blogPosts] = await Promise.all([
  fetchPublishedCaseStudies(),
  fetchPublishedBlogPosts(),
]);

const staticPaths = [
  '/', '/solutions', '/secteurs', '/financement-cee',
  '/blog', '/ressources', '/a-propos', '/contact', '/faq', '/plan-du-site',
];

const contentPaths = [
  ...solutions.map(({ slug }) => ({ path: `/solutions/${slug}` })),
  ...sectors.map(({ slug }) => ({ path: `/secteurs/${slug}` })),
  ...resources.filter(({ indexable }) => indexable).map(({ slug, updatedAt }) => ({ path: `/ressources/${slug}`, lastmod: updatedAt })),
  ...blogPosts
    .filter((item) => item.indexable !== false)
    .map((item) => ({ path: `/blog/${item.slug}`, lastmod: item.updated_at || item.published_at })),
];

const entries = [
  ...staticPaths.map((path) => ({ path })),
  ...contentPaths,
];

const urls = baseUrl
  ? entries
      .map(({ path, lastmod }) => {
        const tag = lastmod ? `<lastmod>${new Date(lastmod).toISOString().slice(0, 10)}</lastmod>` : '';
        return `  <url><loc>${baseUrl}${path}</loc>${tag}</url>`;
      })
      .join('\n')
  : '';

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
await writeFile(new URL('../public/sitemap.xml', import.meta.url), xml);

const robots = `User-agent: *\nAllow: /\nDisallow: /admin\n${baseUrl ? `\nSitemap: ${baseUrl}/sitemap.xml\n` : ''}`;
await writeFile(new URL('../public/robots.txt', import.meta.url), robots);

console.log(`[sitemap] ${entries.length} URLs écrites (${caseStudies.length} réalisations, ${blogPosts.length} articles).`);
