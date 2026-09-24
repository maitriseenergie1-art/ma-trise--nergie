const PIXEL_ID = '52KLrR3qwRDL3WJyDtXN5Z';
const CONSENT_KEY = 'me-openai-ads-consent-v1';
export const OPENAI_ADS_CONSENT_EVENT = 'me:openai-ads-consent-changed';

let initialized = false;
let sessionConsent = null;

const hasBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined';

export function getOpenAIAdsConsent() {
  if (!hasBrowser()) return null;
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === 'granted' || value === 'denied' ? value : sessionConsent;
  } catch {
    return sessionConsent;
  }
}

function installQueue() {
  if (window.oaiq) return;
  const queue = (...args) => queue.q.push(args);
  queue.q = [];
  window.oaiq = queue;
}

function installScript() {
  if (document.querySelector('script[data-openai-ads-pixel]')) return;
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://bzrcdn.openai.com/sdk/oaiq.min.js';
  script.dataset.openaiAdsPixel = 'true';
  document.head.appendChild(script);
}

export function initOpenAIAdsPixel() {
  if (!hasBrowser() || initialized) return;
  installQueue();
  window.oaiq('consent', getOpenAIAdsConsent() === 'granted');
  window.oaiq('init', {
    pixelId: PIXEL_ID,
    debug: Boolean(import.meta.env?.DEV),
  });
  installScript();
  initialized = true;
}

export function setOpenAIAdsConsent(granted) {
  if (!hasBrowser()) return;
  const value = granted ? 'granted' : 'denied';
  sessionConsent = value;
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // The visitor's choice still applies to the current page when storage is unavailable.
  }
  initOpenAIAdsPixel();
  window.oaiq?.('consent', granted);
  window.dispatchEvent(new CustomEvent(OPENAI_ADS_CONSENT_EVENT, { detail: value }));
}

export function trackOpenAILeadCreated(eventId) {
  if (!hasBrowser() || getOpenAIAdsConsent() !== 'granted' || !eventId) return false;
  initOpenAIAdsPixel();
  window.oaiq?.(
    'measure',
    'lead_created',
    { type: 'customer_action' },
    { event_id: String(eventId) },
  );
  return true;
}

export function getOpenAIAdsMeasurementContext() {
  if (!hasBrowser() || getOpenAIAdsConsent() !== 'granted') {
    return { consentGranted: false, browserRef: null };
  }
  const browserRef = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('__obref='))
    ?.slice('__obref='.length) || null;
  return { consentGranted: true, browserRef };
}
