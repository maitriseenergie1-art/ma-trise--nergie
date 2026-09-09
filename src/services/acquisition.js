import { readSession, removeSession, writeSession } from '../utils/storage';

const STORAGE_KEY = 'me-acquisition-context';
const SESSION_KEY = 'me-lead-tracking-id';
const acquisitionParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'gbraid', 'wbraid', 'fbclid'];

const makeId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return `lead_${crypto.randomUUID()}`;
  return `lead_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

export function getLeadTrackingId() {
  const saved = readSession(SESSION_KEY, null);
  let id = typeof saved === 'string' ? saved : null;
  if (!id) { id = makeId(); writeSession(SESSION_KEY, id); }
  return id;
}

export function getAcquisitionContext() {
  const params = new URLSearchParams(window.location.search);
  const saved = readSession(STORAGE_KEY, {});
  const queryContext = Object.fromEntries(acquisitionParams.map((key) => [key, params.get(key) || undefined]));
  return {
    ...queryContext,
    ...saved,
    leadTrackingId: getLeadTrackingId(),
    landingPage: saved.landingPage || window.location.pathname,
    referrer: saved.referrer || document.referrer || undefined,
  };
}

export function rememberAcquisitionContext(update = {}) {
  const context = { ...getAcquisitionContext(), ...update };
  writeSession(STORAGE_KEY, context);
  return context;
}

export const updateAcquisitionContext = rememberAcquisitionContext;
export function captureInitialAcquisition() { return rememberAcquisitionContext(); }
export function clearAcquisitionContext() { removeSession(STORAGE_KEY); removeSession(SESSION_KEY); }
