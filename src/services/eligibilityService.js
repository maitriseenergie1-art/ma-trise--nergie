import { siteConfig } from '../config/siteConfig';
import { getAcquisitionContext } from './acquisition';
import { submitLead } from './leadService';

const emptyToNull = (value) => typeof value === 'string' && value.trim() ? value.trim() : null;

export function buildEligibilityLeadPayload(answers, submissionId) {
  const acquisition = getAcquisitionContext();
  const siteType = emptyToNull(answers.building);

  return {
    submissionId,
    sourceForm: 'eligibility',
    trackingId: acquisition.leadTrackingId,
    contact: {
      firstName: emptyToNull(answers.firstName),
      lastName: emptyToNull(answers.lastName),
      email: emptyToNull(answers.email),
      phone: emptyToNull(answers.phone),
      companyName: emptyToNull(answers.company),
    },
    need: {
      // The current first step uses one shared taxonomy for activity/site type.
      sector: siteType,
      buildingType: siteType,
      siteSize: emptyToNull(answers.size),
      projectType: emptyToNull(answers.project),
      solutionSlug: null,
      equipment: answers.equipment ? [answers.equipment] : [],
      projectTimeline: emptyToNull(answers.timeline),
      message: null,
      qualificationScore: null,
    },
    acquisition: {
      landingPage: emptyToNull(acquisition.landingPage),
      referrer: emptyToNull(acquisition.referrer),
      ctaSource: emptyToNull(acquisition.sourceCta) || 'direct_eligibility',
      utmSource: emptyToNull(acquisition.utm_source),
      utmMedium: emptyToNull(acquisition.utm_medium),
      utmCampaign: emptyToNull(acquisition.utm_campaign),
      utmTerm: emptyToNull(acquisition.utm_term),
      utmContent: emptyToNull(acquisition.utm_content),
      gclid: emptyToNull(acquisition.gclid),
      gbraid: emptyToNull(acquisition.gbraid),
      wbraid: emptyToNull(acquisition.wbraid),
      fbclid: emptyToNull(acquisition.fbclid),
    },
    consent: {
      accepted: answers.privacy === true,
      policyVersion: siteConfig.privacyPolicyVersion,
    },
    website: answers.website || '',
  };
}

export const eligibilityService = {
  submit: (answers, submissionId) => submitLead(buildEligibilityLeadPayload(answers, submissionId)),
};
