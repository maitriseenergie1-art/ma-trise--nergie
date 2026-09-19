import { siteConfig } from '../../config/siteConfig';
import { getAcquisitionContext } from '../../services/acquisition';
import { submitLead } from '../../services/leadService';

const clean = (value) => (typeof value === 'string' && value.trim() ? value.trim() : null);

// Builds and submits a quick-form lead. sourceForm is "landing_page" so these
// contextual conversions are distinguishable from the main /contact form in the
// back office; ctaSource records which page/variant produced the lead.
export function submitQuickLead({ submissionId, variant, context = {}, identity, message, consent, website = '', captchaToken = '' }) {
  const acq = getAcquisitionContext();
  const key = context.key ? `_${context.key}` : '';
  return submitLead({
    submissionId,
    sourceForm: 'landing_page',
    trackingId: acq.leadTrackingId,
    contact: {
      firstName: clean(identity.firstName),
      lastName: clean(identity.lastName),
      email: clean(identity.email),
      phone: clean(identity.phone),
      companyName: clean(identity.company),
    },
    need: {
      sector: clean(context.sector),
      buildingType: null,
      siteSize: null,
      projectType: clean(context.projectType),
      solutionSlug: clean(context.solutionSlug),
      equipment: [],
      projectTimeline: null,
      message: clean(message),
    },
    acquisition: {
      landingPage: clean(acq.landingPage),
      referrer: clean(acq.referrer),
      ctaSource: `quick_${variant}${key}`,
      utmSource: clean(acq.utm_source),
      utmMedium: clean(acq.utm_medium),
      utmCampaign: clean(acq.utm_campaign),
      utmTerm: clean(acq.utm_term),
      utmContent: clean(acq.utm_content),
      gclid: clean(acq.gclid),
      gbraid: clean(acq.gbraid),
      wbraid: clean(acq.wbraid),
      fbclid: clean(acq.fbclid),
    },
    consent: { accepted: consent === true, policyVersion: siteConfig.privacyPolicyVersion },
    website,
    turnstileToken: clean(captchaToken),
  });
}
