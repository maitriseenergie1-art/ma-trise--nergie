// Classify an inbound referrer / landing URL into a traffic source.
// Special attention to AI answer engines (ChatGPT, Gemini, Google AI, …).

const RULES = [
  { source: 'chatgpt', label: 'ChatGPT', hosts: ['chat.openai.com', 'chatgpt.com'], params: [] },
  { source: 'openai', label: 'OpenAI', hosts: ['openai.com'], params: [] },
  { source: 'perplexity', label: 'Perplexity', hosts: ['perplexity.ai', 'www.perplexity.ai'], params: [] },
  { source: 'gemini', label: 'Gemini', hosts: ['gemini.google.com', 'bard.google.com'], params: [] },
  { source: 'copilot', label: 'Copilot', hosts: ['copilot.microsoft.com', 'www.bing.com/chat'], params: [] },
  { source: 'claude', label: 'Claude', hosts: ['claude.ai'], params: [] },
  { source: 'google_ai', label: 'Google AI (AI Overviews / AI Mode)', hosts: [], params: ['udm=14', 'aep=', 'sei='] },
  { source: 'google', label: 'Google', hosts: ['google.', 'www.google.'], params: [] },
  { source: 'bing', label: 'Bing', hosts: ['bing.com'], params: [] },
  { source: 'duckduckgo', label: 'DuckDuckGo', hosts: ['duckduckgo.com'], params: [] },
  { source: 'yahoo', label: 'Yahoo', hosts: ['search.yahoo.', 'yahoo.'], params: [] },
  { source: 'ecosia', label: 'Ecosia', hosts: ['ecosia.org'], params: [] },
  { source: 'qwant', label: 'Qwant', hosts: ['qwant.com'], params: [] },
  { source: 'linkedin', label: 'LinkedIn', hosts: ['linkedin.com', 'lnkd.in'], params: [] },
  { source: 'facebook', label: 'Facebook', hosts: ['facebook.com', 'fb.com', 'm.facebook.com'], params: [] },
  { source: 'instagram', label: 'Instagram', hosts: ['instagram.com'], params: [] },
  { source: 'youtube', label: 'YouTube', hosts: ['youtube.com', 'youtu.be'], params: [] },
  { source: 'x', label: 'X / Twitter', hosts: ['twitter.com', 't.co', 'x.com'], params: [] },
  { source: 'reddit', label: 'Reddit', hosts: ['reddit.com'], params: [] },
];

const SEARCH_SOURCES = new Set(['google', 'google_ai', 'bing', 'duckduckgo', 'yahoo', 'ecosia', 'qwant']);
const AI_SOURCES = new Set(['chatgpt', 'openai', 'perplexity', 'gemini', 'copilot', 'claude', 'google_ai']);
const SOCIAL_SOURCES = new Set(['linkedin', 'facebook', 'instagram', 'youtube', 'x', 'reddit']);

export function classifyTraffic({ referrer, landingUrl, utmSource, utmMedium } = {}) {
  const utm = (utmSource || '').toLowerCase();
  const landing = safeUrl(landingUrl);
  const landingSearch = landing ? landing.search.toLowerCase() : '';

  // 1) Explicit UTM wins.
  if (utm) {
    const byUtm = RULES.find((r) => r.source === utm || r.hosts.some((h) => utm.includes(h.replace(/\.$/, ''))));
    if (byUtm) return decorate(byUtm.source, byUtm.label, utmMedium);
    return decorate(utm, capitalize(utm), utmMedium);
  }

  const ref = safeUrl(referrer);

  // 2) Google AI: google referrer/landing carrying AI markers (udm=14 = AI Mode).
  if (ref && /(^|\.)google\./.test(ref.hostname)) {
    if (/[?&]udm=14(&|$)/.test(ref.search) || /[?&]udm=14(&|$)/.test(landingSearch)) {
      return decorate('google_ai', 'Google AI (AI Mode)', utmMedium);
    }
    return decorate('google', 'Google', utmMedium);
  }

  // 3) Host-based rules.
  if (ref) {
    const host = ref.hostname.toLowerCase();
    const full = host + ref.pathname.toLowerCase();
    const match = RULES.find((r) => r.hosts.some((h) => full.includes(h) || host.includes(h)));
    if (match) return decorate(match.source, match.label, utmMedium);
    return decorate('referral', host, utmMedium || 'referral');
  }

  // 4) No referrer.
  return decorate('direct', 'Accès direct', utmMedium || 'none');
}

function decorate(source, label, medium) {
  let group = 'other';
  if (AI_SOURCES.has(source)) group = 'ai';
  else if (SEARCH_SOURCES.has(source)) group = 'search';
  else if (SOCIAL_SOURCES.has(source)) group = 'social';
  else if (source === 'direct') group = 'direct';
  else if (source === 'referral') group = 'referral';
  else if (medium && /cpc|paid|ppc|ads?/.test(medium)) group = 'paid';
  return { source, label, group, medium: medium || null };
}

function safeUrl(value) {
  if (!value) return null;
  try {
    return new URL(value);
  } catch {
    try {
      return new URL(`https://${value}`);
    } catch {
      return null;
    }
  }
}

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
