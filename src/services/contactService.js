import { siteConfig } from '../config/siteConfig';
import { getAcquisitionContext } from './acquisition';
import { submitContactLead } from './leadService';
import { getOpenAIAdsMeasurementContext } from './openaiAdsPixel';

const emptyToNull = (value) => typeof value === 'string' && value.trim() ? value.trim() : null;

export function buildContactLeadPayload({ submissionId, identity, need, consent, website = '', captchaToken = '' }) {
  const acquisition = getAcquisitionContext();
  const adsMeasurement = getOpenAIAdsMeasurementContext();
  return {
    submissionId,
    sourceForm: 'contact',
    trackingId: acquisition.leadTrackingId,
    contact: {
      firstName: emptyToNull(identity.firstName),
      lastName: emptyToNull(identity.lastName),
      email: emptyToNull(identity.email),
      phone: emptyToNull(identity.phone),
      companyName: emptyToNull(identity.company),
    },
    need: {
      sector: null,
      buildingType: null,
      siteSize: null,
      projectType: emptyToNull(need.projectType),
      solutionSlug: null,
      equipment: [],
      projectTimeline: null,
      message: emptyToNull(need.message),
    },
    acquisition: {
      landingPage: emptyToNull(acquisition.landingPage),
      referrer: emptyToNull(acquisition.referrer),
      ctaSource: emptyToNull(acquisition.sourceCta) || 'direct_contact',
      utmSource: emptyToNull(acquisition.utm_source),
      utmMedium: emptyToNull(acquisition.utm_medium),
      utmCampaign: emptyToNull(acquisition.utm_campaign),
      utmTerm: emptyToNull(acquisition.utm_term),
      utmContent: emptyToNull(acquisition.utm_content),
      gclid: emptyToNull(acquisition.gclid),
      gbraid: emptyToNull(acquisition.gbraid),
      wbraid: emptyToNull(acquisition.wbraid),
      fbclid: emptyToNull(acquisition.fbclid),
      oppref: emptyToNull(acquisition.oppref),
      openaiBrowserRef: emptyToNull(adsMeasurement.browserRef),
    },
    consent: {
      accepted: consent.privacy === true,
      policyVersion: siteConfig.privacyPolicyVersion,
      adsMeasurement: adsMeasurement.consentGranted,
    },
    website,
    turnstileToken: emptyToNull(captchaToken),
  };
}

export const contactService = {
  submit: (form) => submitContactLead(buildContactLeadPayload(form)),
};
