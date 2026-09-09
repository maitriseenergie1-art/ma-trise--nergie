import { getAcquisitionContext } from './acquisition';

export const analyticsEvents = Object.freeze([
  'cta_click', 'eligibility_started', 'eligibility_step_completed', 'eligibility_completed', 'eligibility_submit_attempt', 'eligibility_submit_success', 'eligibility_submit_error',
  'contact_started', 'contact_submitted', 'contact_submit_attempt', 'contact_submit_success', 'contact_submit_error',
  'phone_clicked', 'email_clicked', 'booking_clicked', 'case_study_viewed',
]);

// Point d’intégration unique pour un futur fournisseur, sans données personnelles.
export function trackEvent(name, properties = {}) {
  if (!analyticsEvents.includes(name)) return null;
  const context = getAcquisitionContext();
  const event = { name, properties: { ...properties, landingPage: context.landingPage, sourcePage: window.location.pathname, leadTrackingId: context.leadTrackingId } };
  window.dispatchEvent(new CustomEvent('maitrise-energie:analytics', { detail: event }));
  return event;
}
