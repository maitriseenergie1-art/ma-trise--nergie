export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Only French mobile numbers: 06, 07, +336 or +337 (separators are removed below).
export const PHONE_PATTERN = /^(?:0[67]\d{8}|\+33[67]\d{8})$/;

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
