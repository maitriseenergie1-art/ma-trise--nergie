import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getAllowedTurnstileHostnames,
  getClientIp,
  getExpectedTurnstileHostname,
  verifyTurnstile,
} from '../netlify/functions/_lib/turnstile.mjs';

const request = (headers = {}) => new Request('https://api.example.test/api/lead', { headers });

test('utilise le domaine configuré plutôt que l’en-tête Origin contrôlé par le client', () => {
  const hostname = getExpectedTurnstileHostname(
    request({ origin: 'https://attacker.example' }),
    { SITE_URL: 'https://maitrise-energie.fr' },
  );
  assert.equal(hostname, 'maitrise-energie.fr');
});

test('transmet l’adresse IP et exige action et domaine exacts', async () => {
  let submitted;
  const valid = await verifyTurnstile({
    token: 'valid-token',
    secret: 'test-secret',
    expectedAction: 'lead',
    expectedHostname: 'maitrise-energie.fr',
    remoteIp: '203.0.113.10',
    fetchImpl: async (_url, options) => {
      submitted = Object.fromEntries(options.body);
      return new Response(JSON.stringify({ success: true, action: 'lead', hostname: 'maitrise-energie.fr' }));
    },
  });
  assert.equal(valid, true);
  assert.equal(submitted.remoteip, '203.0.113.10');
});

test('refuse un jeton absent, une mauvaise action ou un mauvais domaine', async () => {
  const fetchImpl = async () => new Response(JSON.stringify({ success: true, action: 'other', hostname: 'other.example' }));
  assert.equal(await verifyTurnstile({ token: '', secret: 'secret', expectedAction: 'lead', fetchImpl }), false);
  assert.equal(await verifyTurnstile({ token: 'token', secret: 'secret', expectedAction: 'lead', expectedHostname: 'maitrise-energie.fr', fetchImpl }), false);
});

test('préfère l’adresse IP fournie par Netlify', () => {
  assert.equal(getClientIp(request({
    'x-nf-client-connection-ip': '203.0.113.20',
    'x-forwarded-for': '198.51.100.5, 198.51.100.6',
  })), '203.0.113.20');
});

test('accepte le domaine avec et sans www, refuse les autres', async () => {
  const hostnames = getAllowedTurnstileHostnames(request(), { SITE_URL: 'https://maitrise-energie.fr' });
  assert.deepEqual(hostnames, ['maitrise-energie.fr', 'www.maitrise-energie.fr']);
  const verify = (hostname) => verifyTurnstile({
    token: 'token', secret: 'secret', expectedAction: 'lead', expectedHostname: hostnames,
    fetchImpl: async () => new Response(JSON.stringify({ success: true, action: 'lead', hostname })),
  });
  assert.equal(await verify('www.maitrise-energie.fr'), true);
  assert.equal(await verify('maitrise-energie.fr'), true);
  assert.equal(await verify('attacker.example'), false);
});
