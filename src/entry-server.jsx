import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { AppShell } from './app/AppShell';
import { seedContent } from './lib/contentStore';
import { ssrHead } from './lib/headCollector';

/**
 * Render one route to an HTML string for the build-time prerender.
 * @param {string} url - path to render, e.g. "/blog/mon-article"
 * @param {object} preloaded - content-store entries keyed by contentKeys
 * @returns {{ html: string, head: object|null }}
 */
export function render(url, preloaded) {
  seedContent(preloaded);
  ssrHead.current = null;
  const html = renderToString(
    <StaticRouter location={url}>
      <AppShell />
    </StaticRouter>,
  );
  return { html, head: ssrHead.current };
}
