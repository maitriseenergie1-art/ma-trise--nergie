import { marked } from 'marked';

marked.setOptions({ gfm: true, breaks: false });

// Blog bodies are authored by admins in the protected back office, so the
// Markdown source is trusted. We still strip raw <script>/<style>/<iframe>
// blocks as a defence-in-depth measure.
const DANGEROUS = /<\/?(script|style|iframe|object|embed|form)\b[^>]*>/gi;
const ON_ATTR = /\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;

export function renderMarkdown(source) {
  if (!source) return '';
  const html = marked.parse(source, { async: false });
  return String(html).replace(DANGEROUS, '').replace(ON_ATTR, '');
}

export function estimateReadingMinutes(source) {
  if (!source) return 1;
  const words = source.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}
