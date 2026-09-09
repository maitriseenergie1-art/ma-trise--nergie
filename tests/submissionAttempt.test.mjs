import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createSubmissionAttempt} from '../src/services/submissionAttempt.js';
test('timeout/network retry keeps UUID, confirmation renews for a new project',()=>{
  const attempt=createSubmissionAttempt();const first=attempt.getId();
  assert.match(first,/^[0-9a-f-]{36}$/);assert.equal(attempt.getId(),first);assert.equal(attempt.getId(),first);
  attempt.confirm();assert.notEqual(attempt.getId(),first);
});
test('eligibility restored draft keeps UUID across steps/remount',()=>{
  const first=createSubmissionAttempt().getId();const restored=createSubmissionAttempt(first);
  assert.equal(restored.getId(),first);restored.confirm();assert.notEqual(restored.getId(),first);
});
test('separate Contact form instances do not share submission UUID',()=>{
  assert.notEqual(createSubmissionAttempt().getId(),createSubmissionAttempt().getId());
});
