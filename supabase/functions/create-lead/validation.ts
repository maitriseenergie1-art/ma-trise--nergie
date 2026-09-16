export type SourceForm = 'contact' | 'eligibility' | 'landing_page' | 'campaign';

export const SOURCE_FORMS: readonly SourceForm[] = ['contact', 'eligibility', 'landing_page', 'campaign'];

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
type RecordValue = Record<string, unknown>;

export type LeadSubmission = {
  submissionId: string;
  trackingId: string;
  sourceForm: SourceForm;
  contact: {
    firstName: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
    companyName: string | null;
  };
  need: {
    sector: string | null;
    buildingType: string | null;
    siteSize: string | null;
    projectType: string | null;
    solutionSlug: string | null;
    equipment: JsonValue;
    projectTimeline: string | null;
    message: string | null;
    qualificationScore: number | null;
  };
  acquisition: {
    landingPage: string | null;
    referrer: string | null;
    ctaSource: string | null;
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
    utmTerm: string | null;
    utmContent: string | null;
    gclid: string | null;
    gbraid: string | null;
    wbraid: string | null;
    fbclid: string | null;
  };
  consent: { policyVersion: string | null };
};

export type ValidationResult =
  | { ok: true; value: LeadSubmission; honeypotFilled: boolean }
  | { ok: false; fields: Record<string, string>; honeypotFilled: false };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^(?:0[1-9]\d{8}|\+33[1-9]\d{8})$/;
const STRING_LIMITS = {
  trackingId: 128,
  firstName: 100,
  lastName: 100,
  phone: 64,
  companyName: 180,
  sector: 100,
  buildingType: 120,
  siteSize: 100,
  projectType: 160,
  solutionSlug: 120,
  projectTimeline: 120,
  message: 4000,
  landingPage: 2048,
  referrer: 2048,
  ctaSource: 160,
  utm: 255,
  clickId: 255,
  policyVersion: 100,
} as const;

function isRecord(value: unknown): value is RecordValue {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isJsonValue(value: unknown, depth = 0): value is JsonValue {
  if (depth > 8 || value === null) return depth <= 8;
  if (['string', 'number', 'boolean'].includes(typeof value)) return true;
  if (Array.isArray(value)) return value.every((entry) => isJsonValue(entry, depth + 1));
  if (!isRecord(value)) return false;
  return Object.values(value).every((entry) => isJsonValue(entry, depth + 1));
}

function normaliseString(value: unknown, maxLength: number, field: string, fields: Record<string, string>, collapseSpaces = false): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') {
    fields[field] = 'INVALID_STRING';
    return null;
  }
  const trimmed = (collapseSpaces ? value.replace(/\s+/g, ' ') : value).trim();
  if (!trimmed) return null;
  if (trimmed.length > maxLength) {
    fields[field] = 'TOO_LONG';
    return null;
  }
  return trimmed;
}

function requiredRecord(value: unknown, field: string, fields: Record<string, string>): RecordValue {
  if (isRecord(value)) return value;
  fields[field] = 'INVALID_OBJECT';
  return {};
}

function requiredEmail(value: unknown, fields: Record<string, string>): string | null {
  const email = normaliseString(value, 254, 'email', fields);
  if (!email) {
    fields.email ||= 'REQUIRED';
    return null;
  }
  const lower = email.toLowerCase();
  if (!EMAIL_PATTERN.test(lower)) {
    fields.email = 'INVALID_EMAIL';
    return null;
  }
  return lower;
}

function requiredPhone(value: unknown, fields: Record<string, string>): string | null {
  const phone = normaliseString(value, STRING_LIMITS.phone, 'phone', fields, true);
  if (!phone) {
    fields.phone ||= 'REQUIRED';
    return null;
  }
  const digits = phone.replace(/[\s.\-()]/g, '');
  if (!PHONE_PATTERN.test(digits)) {
    fields.phone = 'INVALID_PHONE';
    return null;
  }
  return phone;
}

function requiredString(value: unknown, maxLength: number, field: string, fields: Record<string, string>): string | null {
  const result = normaliseString(value, maxLength, field, fields);
  if (!result) {
    fields[field] ||= 'REQUIRED';
    return null;
  }
  return result;
}

function optionalJson(value: unknown, fields: Record<string, string>): JsonValue {
  if (value === undefined || value === null) return [];
  if (!isJsonValue(value)) {
    fields.equipment = 'INVALID_JSON';
    return [];
  }
  if (Array.isArray(value) && value.length > 100) {
    fields.equipment = 'TOO_MANY_ITEMS';
    return [];
  }
  if (JSON.stringify(value).length > 5000) {
    fields.equipment = 'TOO_LARGE';
    return [];
  }
  return value;
}

export function validateSubmission(payload: unknown): ValidationResult {
  const fields: Record<string, string> = {};
  if (!isRecord(payload)) return { ok: false, fields: { payload: 'INVALID_OBJECT' }, honeypotFilled: false };

  const sourceForm = payload.sourceForm;
  if (typeof sourceForm !== 'string' || !SOURCE_FORMS.includes(sourceForm as SourceForm)) fields.sourceForm = 'INVALID_SOURCE_FORM';

  const website = normaliseString(payload.website, 255, 'website', fields);
  const contact = requiredRecord(payload.contact, 'contact', fields);
  const need = requiredRecord(payload.need, 'need', fields);
  const acquisition = payload.acquisition === undefined || payload.acquisition === null ? {} : requiredRecord(payload.acquisition, 'acquisition', fields);
  const consent = requiredRecord(payload.consent, 'consent', fields);

  const email = requiredEmail(contact.email, fields);
  const accepted = consent.accepted;
  if (accepted !== true) fields.consent = 'CONSENT_REQUIRED';

  const qualificationScore = need.qualificationScore;
  const hasValidQualificationScore = typeof qualificationScore === 'number' && Number.isInteger(qualificationScore) && qualificationScore >= 0 && qualificationScore <= 100;
  if (qualificationScore !== undefined && qualificationScore !== null && !hasValidQualificationScore) {
    fields.qualificationScore = 'INVALID_SCORE';
  }

  const trackingId = normaliseString(payload.trackingId, STRING_LIMITS.trackingId, 'trackingId', fields) || `lead_${crypto.randomUUID()}`;
  const firstName = normaliseString(contact.firstName, STRING_LIMITS.firstName, 'firstName', fields);
  const lastName = requiredString(contact.lastName, STRING_LIMITS.lastName, 'lastName', fields);
  const phone = requiredPhone(contact.phone, fields);
  const companyName = normaliseString(contact.companyName, STRING_LIMITS.companyName, 'companyName', fields);
  const equipment = optionalJson(need.equipment, fields);

  // UUID v4 only, exactly 36 characters; never derived from commercial identity.
  const submissionId = payload.submissionId;
  if (!website) {
    if (submissionId === undefined || submissionId === null || submissionId === '') fields.submissionId = 'SUBMISSION_ID_REQUIRED';
    else if (typeof submissionId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(submissionId)) fields.submissionId = 'INVALID_SUBMISSION_ID';
  }

  const value: LeadSubmission = {
    submissionId: typeof submissionId === 'string' ? submissionId.toLowerCase() : '', 
    trackingId,
    sourceForm: sourceForm as SourceForm,
    contact: { firstName, lastName, email: email || '', phone, companyName },
    need: {
      sector: normaliseString(need.sector, STRING_LIMITS.sector, 'sector', fields),
      buildingType: normaliseString(need.buildingType, STRING_LIMITS.buildingType, 'buildingType', fields),
      siteSize: normaliseString(need.siteSize, STRING_LIMITS.siteSize, 'siteSize', fields),
      projectType: normaliseString(need.projectType, STRING_LIMITS.projectType, 'projectType', fields),
      solutionSlug: normaliseString(need.solutionSlug, STRING_LIMITS.solutionSlug, 'solutionSlug', fields),
      equipment,
      projectTimeline: normaliseString(need.projectTimeline, STRING_LIMITS.projectTimeline, 'projectTimeline', fields),
      message: normaliseString(need.message, STRING_LIMITS.message, 'message', fields),
      qualificationScore: hasValidQualificationScore ? qualificationScore : null,
    },
    acquisition: {
      landingPage: normaliseString(acquisition.landingPage, STRING_LIMITS.landingPage, 'landingPage', fields),
      referrer: normaliseString(acquisition.referrer, STRING_LIMITS.referrer, 'referrer', fields),
      ctaSource: normaliseString(acquisition.ctaSource, STRING_LIMITS.ctaSource, 'ctaSource', fields),
      utmSource: normaliseString(acquisition.utmSource, STRING_LIMITS.utm, 'utmSource', fields),
      utmMedium: normaliseString(acquisition.utmMedium, STRING_LIMITS.utm, 'utmMedium', fields),
      utmCampaign: normaliseString(acquisition.utmCampaign, STRING_LIMITS.utm, 'utmCampaign', fields),
      utmTerm: normaliseString(acquisition.utmTerm, STRING_LIMITS.utm, 'utmTerm', fields),
      utmContent: normaliseString(acquisition.utmContent, STRING_LIMITS.utm, 'utmContent', fields),
      gclid: normaliseString(acquisition.gclid, STRING_LIMITS.clickId, 'gclid', fields),
      gbraid: normaliseString(acquisition.gbraid, STRING_LIMITS.clickId, 'gbraid', fields),
      wbraid: normaliseString(acquisition.wbraid, STRING_LIMITS.clickId, 'wbraid', fields),
      fbclid: normaliseString(acquisition.fbclid, STRING_LIMITS.clickId, 'fbclid', fields),
    },
    consent: { policyVersion: normaliseString(consent.policyVersion, STRING_LIMITS.policyVersion, 'policyVersion', fields) },
  };

  if (Object.keys(fields).length) return { ok: false, fields, honeypotFilled: false };
  return { ok: true, value, honeypotFilled: Boolean(website) };
}
