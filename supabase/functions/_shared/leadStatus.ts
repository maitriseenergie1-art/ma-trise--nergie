export const LEAD_STATUSES = [
  'new',
  'to_contact',
  'contacted',
  'qualified',
  'appointment',
  'proposal',
  'won',
  'lost',
  'completed',
] as const;

export const LOST_REASONS = ['budget', 'timing', 'not_qualified', 'no_response', 'competitor', 'other'] as const;

export type LeadStatus = typeof LEAD_STATUSES[number];
export type LostReason = typeof LOST_REASONS[number];

type StatusUpdate = { leadId: string; status: LeadStatus; lostReason: LostReason | null };
type ValidationResult = { ok: true; value: StatusUpdate } | { ok: false; field: 'leadId' | 'status' | 'lostReason'; code: string };

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const transitions: Record<LeadStatus, readonly LeadStatus[]> = {
  new: ['to_contact', 'contacted', 'qualified', 'appointment', 'proposal', 'lost'],
  to_contact: ['contacted', 'qualified', 'appointment', 'proposal', 'lost'],
  contacted: ['qualified', 'appointment', 'proposal', 'lost'],
  qualified: ['appointment', 'proposal', 'lost'],
  appointment: ['proposal', 'lost'],
  proposal: ['won', 'lost'],
  won: ['completed'],
  lost: ['to_contact', 'contacted', 'qualified'],
  completed: [],
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
export const isLeadStatus = (value: unknown): value is LeadStatus => typeof value === 'string' && LEAD_STATUSES.includes(value as LeadStatus);
export const isLostReason = (value: unknown): value is LostReason => typeof value === 'string' && LOST_REASONS.includes(value as LostReason);

export function isAllowedStatusTransition(from: LeadStatus, to: LeadStatus) {
  return transitions[from].includes(to);
}

export function validateStatusUpdate(payload: unknown): ValidationResult {
  if (!isRecord(payload)) return { ok: false, field: 'leadId', code: 'INVALID_PAYLOAD' };
  const leadId = payload.leadId;
  const status = payload.status;
  const lostReason = payload.lostReason;

  if (typeof leadId !== 'string' || !UUID_PATTERN.test(leadId)) return { ok: false, field: 'leadId', code: 'INVALID_UUID' };
  if (!isLeadStatus(status)) return { ok: false, field: 'status', code: 'INVALID_STATUS' };
  if (lostReason !== undefined && lostReason !== null && !isLostReason(lostReason)) return { ok: false, field: 'lostReason', code: 'INVALID_LOST_REASON' };
  if (status === 'lost' && !isLostReason(lostReason)) return { ok: false, field: 'lostReason', code: 'LOST_REASON_REQUIRED' };
  if (status !== 'lost' && lostReason !== undefined && lostReason !== null) return { ok: false, field: 'lostReason', code: 'LOST_REASON_REQUIRES_LOST_STATUS' };

  return { ok: true, value: { leadId, status, lostReason: isLostReason(lostReason) ? lostReason : null } };
}
