import { assertEquals } from 'jsr:@std/assert@1';
import { hasValidInternalApiKey } from './internalAuth.ts';
import { isAllowedStatusTransition, validateStatusUpdate } from './leadStatus.ts';

const leadId = '00000000-0000-4000-8000-000000000001';

Deno.test('accepte un statut et une transition commerciale valides', () => {
  const result = validateStatusUpdate({ leadId, status: 'qualified' });
  assertEquals(result.ok, true);
  assertEquals(isAllowedStatusTransition('new', 'qualified'), true);
  assertEquals(isAllowedStatusTransition('contacted', 'appointment'), true);
});

Deno.test('rejette un UUID et un statut invalides', () => {
  assertEquals(validateStatusUpdate({ leadId: 'invalid', status: 'qualified' }), { ok: false, field: 'leadId', code: 'INVALID_UUID' });
  assertEquals(validateStatusUpdate({ leadId, status: 'anything' }), { ok: false, field: 'status', code: 'INVALID_STATUS' });
});

Deno.test('exige une raison standardisée pour une perte', () => {
  assertEquals(validateStatusUpdate({ leadId, status: 'lost' }), { ok: false, field: 'lostReason', code: 'LOST_REASON_REQUIRED' });
  assertEquals(validateStatusUpdate({ leadId, status: 'lost', lostReason: 'competitor' }).ok, true);
  assertEquals(validateStatusUpdate({ leadId, status: 'lost', lostReason: 'invalid' }), { ok: false, field: 'lostReason', code: 'INVALID_LOST_REASON' });
  assertEquals(validateStatusUpdate({ leadId, status: 'won', lostReason: 'competitor' }), { ok: false, field: 'lostReason', code: 'LOST_REASON_REQUIRES_LOST_STATUS' });
});

Deno.test('autorise won vers completed et interdit les transitions terminales absurdes', () => {
  assertEquals(isAllowedStatusTransition('won', 'completed'), true);
  assertEquals(isAllowedStatusTransition('completed', 'won'), false);
  assertEquals(isAllowedStatusTransition('proposal', 'qualified'), false);
});

Deno.test('autorise une réouverture contrôlée depuis lost', () => {
  assertEquals(isAllowedStatusTransition('lost', 'to_contact'), true);
  assertEquals(isAllowedStatusTransition('lost', 'contacted'), true);
  assertEquals(isAllowedStatusTransition('lost', 'qualified'), true);
  assertEquals(isAllowedStatusTransition('lost', 'proposal'), false);
});

Deno.test('refuse une clé interne absente ou incorrecte', () => {
  assertEquals(hasValidInternalApiKey(null, 'server-secret'), false);
  assertEquals(hasValidInternalApiKey('wrong-secret', 'server-secret'), false);
  assertEquals(hasValidInternalApiKey('server-secret', 'server-secret'), true);
});
