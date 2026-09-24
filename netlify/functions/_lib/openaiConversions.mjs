const DEFAULT_PIXEL_ID = '52KLrR3qwRDL3WJyDtXN5Z';
const DEFAULT_SITE_URL = 'https://maitrise-energie.fr';
const CONVERSIONS_API_URL = 'https://bzr.openai.com/v1/events';

const clean = (value, max = 2048) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed && trimmed.length <= max ? trimmed : null;
};

export function buildOpenAISourceUrl(landingPage, siteUrl = DEFAULT_SITE_URL) {
  let base;
  try {
    base = new URL(siteUrl || DEFAULT_SITE_URL);
  } catch {
    base = new URL(DEFAULT_SITE_URL);
  }

  try {
    const candidate = new URL(landingPage || '/', base);
    if (!['http:', 'https:'].includes(candidate.protocol) || candidate.origin !== base.origin) {
      return new URL('/', base).toString();
    }
    candidate.hash = '';
    return candidate.toString();
  } catch {
    return new URL('/', base).toString();
  }
}

export async function sendOpenAILeadCreated({
  eventId,
  sourceUrl,
  siteUrl = DEFAULT_SITE_URL,
  oppref,
  browserRef,
  apiKey = process.env.OPENAI_CONVERSIONS_API_KEY,
  pixelId = process.env.OPENAI_ADS_PIXEL_ID || DEFAULT_PIXEL_ID,
  timestampMs = Date.now(),
  fetchImpl = globalThis.fetch,
}) {
  const safeEventId = clean(eventId, 128);
  const safeApiKey = clean(apiKey, 4096);
  const safePixelId = clean(pixelId, 128);

  if (!safeApiKey) return { ok: false, skipped: 'missing_api_key' };
  if (!safeEventId || !safePixelId || typeof fetchImpl !== 'function') {
    return { ok: false, skipped: 'invalid_configuration' };
  }

  const event = {
    id: safeEventId,
    type: 'lead_created',
    timestamp_ms: timestampMs,
    source_url: buildOpenAISourceUrl(sourceUrl, siteUrl),
    action_source: 'web',
    data: { type: 'customer_action' },
  };

  const safeOppref = clean(oppref);
  const safeBrowserRef = clean(browserRef, 512);
  if (safeOppref) event.oppref = safeOppref;
  if (safeBrowserRef) event.user = { obref: safeBrowserRef };

  try {
    const response = await fetchImpl(`${CONVERSIONS_API_URL}?pid=${encodeURIComponent(safePixelId)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${safeApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ validate_only: false, events: [event] }),
      signal: typeof AbortSignal?.timeout === 'function' ? AbortSignal.timeout(4000) : undefined,
    });

    return response.ok
      ? { ok: true, status: response.status }
      : { ok: false, status: response.status };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.name : 'request_failed' };
  }
}
