import { writeFile } from 'node:fs/promises';
import { solutions } from '../src/data/solutions.js';
import { sectors } from '../src/data/sectors.js';
import { caseStudies } from '../src/data/caseStudies.js';
import { resources } from '../src/data/resources.js';

const baseUrl = process.env.SITE_URL?.replace(/\/$/, '');
const isProductionBuild = process.argv.includes('--production');
if (!baseUrl) {
  const message = 'SITE_URL is required for a production build. Define SITE_URL before running npm run build.';
  if (isProductionBuild) throw new Error(message);
  console.warn(message);
}
const staticPaths = ['/', '/solutions', '/secteurs', '/financement-cee', '/eligibilite', '/realisations', '/ressources', '/a-propos', '/contact', '/faq', '/plan-du-site'];
const contentPaths = [
  ...solutions.map(({ slug }) => `/solutions/${slug}`), ...sectors.map(({ slug }) => `/secteurs/${slug}`),
  ...caseStudies.filter(({ indexable }) => indexable).map(({ slug }) => `/realisations/${slug}`),
  ...resources.filter(({ indexable }) => indexable).map(({ slug }) => `/ressources/${slug}`),
];
const urls = baseUrl ? [...staticPaths, ...contentPaths].map(path => `  <url><loc>${baseUrl}${path}</loc></url>`).join('\n') : '';
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
await writeFile(new URL('../public/sitemap.xml', import.meta.url), xml);
