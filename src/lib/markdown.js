import { marked } from 'marked';

marked.setOptions({ gfm: true, breaks: false });

// Blog bodies are authored by admins in the protected back office, so the
// Markdown source is trusted. We still strip raw <script>/<style>/<iframe>
// blocks as a defence-in-depth measure.
const DANGEROUS = /<\/?(script|style|iframe|object|embed|form)\b[^>]*>/gi;
const ON_ATTR = /\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;

export function renderMarkdown(source) {
  if (!source) return '';
  // Un « # Titre » en tête de contenu double le titre déjà affiché dans le hero de la page.
  const body = source.replace(/^\s*#[ \t]+[^\n]*\n?/, '');
  const html = marked.parse(body, { async: false });
  // Le <h1> de la page est le titre de l'article (PageHero) : un seul H1 par page.
  // Les articles mélangent « # » et « ## » pour leurs titres de section : les deux deviennent des <h2>.
  return String(html)
    .replace(DANGEROUS, '')
    .replace(ON_ATTR, '')
    .replace(/<(\/?)h1(?=[\s>])/gi, '<$1h2');
}

export function estimateReadingMinutes(source) {
  if (!source) return 1;
  const words = source.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}
