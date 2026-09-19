import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { siteConfig } from '../config/siteConfig';
import { collectHead } from '../lib/headCollector';

const isBrowser = typeof document !== 'undefined';

const limit = (value = '', max) => value.length <= max ? value : `${value.slice(0, max - 1).replace(/\s+\S*$/, '').trim()}…`;

function absoluteUrl(path) {
  const base = (siteConfig.siteUrl || (isBrowser ? window.location.origin : '')).replace(/\/$/, '');
  if (!path) return base || undefined;
  if (/^https?:\/\//.test(path)) return path;
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}

function upsertMeta(kind, key, value) {
  if (!value) return;
  const attr = kind === 'property' ? 'property' : 'name';
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

function upsertLink(rel, href) {
  if (!href) return;
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

/**
 * Isomorphic SEO head manager.
 * - In the browser, patches document.head on every navigation.
 * - During the prerender, records the descriptor for scripts/prerender.mjs.
 */
export function Seo({
  title,
  description,
  noindex = false,
  schema,
  image,
  imageAlt,
  type = 'website',
  canonicalPath,
  article,
}) {
  const location = useLocation();
  const path = canonicalPath || location.pathname;
  const pageTitle = title
    ? limit(title.length <= 38 ? `${title} — ${siteConfig.name}` : title, 60)
    : siteConfig.name;
  const metaDescription = limit(description, 160);
  const shouldNoindex = noindex || path === '/eligibilite';
  const canonical = absoluteUrl(path);
  const ogImage = absoluteUrl(image || siteConfig.defaultShareImage || '/og-social.jpg');

  const descriptor = {
    title: pageTitle,
    description: metaDescription,
    canonical,
    noindex: shouldNoindex,
    image: ogImage,
    imageAlt: imageAlt || 'Maîtrise Énergie — performance énergétique des sites professionnels',
    type,
    siteName: siteConfig.name,
    schema: schema ?? null,
    article: article ?? null,
  };

  if (!isBrowser) {
    collectHead(descriptor);
  }

  useEffect(() => {
    if (!isBrowser) return;
    document.title = pageTitle;
    upsertMeta('name', 'description', metaDescription);
    upsertLink('canonical', canonical);

    upsertMeta('property', 'og:title', pageTitle);
    upsertMeta('property', 'og:description', metaDescription);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('property', 'og:site_name', siteConfig.name);
    upsertMeta('property', 'og:locale', 'fr_FR');
    upsertMeta('property', 'og:image', ogImage);
    upsertMeta('property', 'og:image:alt', imageAlt || 'Maîtrise Énergie — performance énergétique des sites professionnels');
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', pageTitle);
    upsertMeta('name', 'twitter:description', metaDescription);
    upsertMeta('name', 'twitter:image', ogImage);
    upsertMeta('name', 'twitter:image:alt', imageAlt || 'Maîtrise Énergie — performance énergétique des sites professionnels');
    upsertMeta('name', 'author', siteConfig.name);

    ['article:published_time', 'article:modified_time', 'article:section'].forEach((k) => {
      document.head.querySelector(`meta[property="${k}"]`)?.remove();
    });
    document.head.querySelectorAll('meta[property="article:tag"]').forEach((el) => el.remove());
    if (article) {
      upsertMeta('property', 'article:published_time', article.publishedTime);
      upsertMeta('property', 'article:modified_time', article.modifiedTime);
      upsertMeta('property', 'article:section', article.section);
      (article.tags || []).forEach((tag) => {
        const el = document.createElement('meta');
        el.setAttribute('property', 'article:tag');
        el.setAttribute('content', tag);
        document.head.appendChild(el);
      });
    }

    let robots = document.head.querySelector('meta[name="robots"]');
    if (shouldNoindex) {
      if (!robots) {
        robots = document.createElement('meta');
        robots.name = 'robots';
        document.head.appendChild(robots);
      }
      robots.content = 'noindex, nofollow';
    } else {
      if (!robots) {
        robots = document.createElement('meta');
        robots.name = 'robots';
        document.head.appendChild(robots);
      }
      robots.content = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
    }

    let json = document.getElementById('page-jsonld');
    if (schema) {
      if (!json) {
        json = document.createElement('script');
        json.id = 'page-jsonld';
        json.type = 'application/ld+json';
        document.head.appendChild(json);
      }
      json.textContent = JSON.stringify(schema);
    } else {
      json?.remove();
    }
  }, [pageTitle, metaDescription, canonical, shouldNoindex, schema, ogImage, imageAlt, type, article]);

  return null;
}
