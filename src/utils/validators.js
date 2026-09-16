export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_PATTERN = /^(?:0[1-9]\d{8}|\+33[1-9]\d{8})$/;

export function isValidEmail(value) {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= 254 && EMAIL_PATTERN.test(trimmed);
}

export function isValidPhone(value) {
  if (typeof value !== 'string') return false;
  const digits = value.trim().replace(/[\s.\-()]/g, '');
  return PHONE_PATTERN.test(digits);
}
