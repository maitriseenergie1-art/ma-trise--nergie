// One controller per logical form. Marketing identity is deliberately not involved.
export function createSubmissionAttempt(initialId = null, randomUUID = () => crypto.randomUUID()) {
  let id = initialId;
  return {
    getId() { return id ||= randomUUID(); },
    confirm() { id = null; },
  };
}
