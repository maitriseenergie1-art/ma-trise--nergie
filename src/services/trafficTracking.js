import { getAcquisitionContext } from './acquisition';
import { readSession, writeSession } from '../utils/storage';

// First-party, cookieless traffic tracking. Sends compact events to the
// /api/track Netlify Function, which classifies the source (incl. AI engines)
// and stores them. No personal data, no cross-site identifiers.

const SESSION_KEY = 'me-traffic-session';
const ENDPOINT = '/api/track';

function sessionId() {
  let id = readSession(SESSION_KEY, null);
  if (typeof id !== 'string') {
    id = (crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`).slice(0, 40);
    writeSession(SESSION_KEY, id);
  }
  return id;
}

function device() {
  if (typeof window === 'undefined') return null;
  const w = window.innerWidth;
  return w < 640 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop';
}

function send(payload) {
  if (typeof window === 'undefined') return;
  const ctx = getAcquisitionContext();
  const body = JSON.stringify({
    sessionId: sessionId(),
    device: device(),
    referrer: ctx.referrer || document.referrer || null,
    landingUrl: ctx.landingPage ? window.location.origin + ctx.landingPage : window.location.href,
    utmSource: ctx.utm_source || null,
    utmMedium: ctx.utm_medium || null,
    utmCampaign: ctx.utm_campaign || null,
    utmTerm: ctx.utm_term || null,
    utmContent: ctx.utm_content || null,
    ...payload,
  });

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'application/json' }));
      return;
    }
  } catch {
    /* fall through to fetch */
  }
  fetch(ENDPOINT, { method: 'POST', body, headers: { 'content-type': 'application/json' }, keepalive: true }).catch(() => {});
}

export function trackPageView(path, title) {
  send({ type: 'page_view', path: path || window.location.pathname, title: title || document.title });
}

export function trackClick({ target, targetKind, path }) {
  send({ type: 'click', path: path || window.location.pathname, target, targetKind });
}

export function trackFormEvent(type, { formType, path } = {}) {
  send({ type, path: path || window.location.pathname, target: formType, targetKind: 'form' });
}

let started = false;

// Bridge the existing in-app analytics CustomEvent to click tracking.
export function initTrafficTracking() {
  if (started || typeof window === 'undefined') return;
  started = true;

  window.addEventListener('maitrise-energie:analytics', (event) => {
    const { name, properties = {} } = event.detail || {};
    if (name === 'cta_click') {
      trackClick({ target: properties.sourceCta || properties.destination || 'cta', targetKind: 'cta' });
    } else if (name === 'phone_clicked') {
      trackClick({ target: 'phone', targetKind: 'contact' });
    } else if (name === 'email_clicked') {
      trackClick({ target: 'email', targetKind: 'contact' });
    } else if (name === 'booking_clicked') {
      trackClick({ target: 'booking', targetKind: 'contact' });
    } else if (name === 'contact_submit_success' || name === 'eligibility_submit_success') {
      trackFormEvent('form_submit', { formType: name.replace('_submit_success', '') });
    }
  });
}
