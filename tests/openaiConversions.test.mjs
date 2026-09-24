import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildOpenAISourceUrl,
  sendOpenAILeadCreated,
} from '../netlify/functions/_lib/openaiConversions.mjs';

test('la Conversions API est ignorée proprement sans clé serveur', async () => {
  let called = false;
  const result = await sendOpenAILeadCreated({
    eventId: '05f96b9d-741b-468f-b340-a526ed456f0c',
    sourceUrl: 'https://maitrise-energie.fr/eligibilite',
    apiKey: '',
    fetchImpl: async () => {
      called = true;
      return { ok: true, status: 200 };
    },
  });

  assert.deepEqual(result, { ok: false, skipped: 'missing_api_key' });
  assert.equal(called, false);
});

test('envoie lead_created avec le même identifiant et les références OpenAI', async () => {
  let request;
  const eventId = '05f96b9d-741b-468f-b340-a526ed456f0c';
  const result = await sendOpenAILeadCreated({
    eventId,
    sourceUrl: 'https://maitrise-energie.fr/eligibilite?utm_source=chatgpt#formulaire',
    oppref: 'op-click-reference',
    browserRef: 'browser-reference',
    apiKey: 'server-secret',
    pixelId: 'pixel-id',
    timestampMs: 1_795_000_000_000,
    fetchImpl: async (url, options) => {
      request = { url, options };
      return { ok: true, status: 200 };
    },
  });

  assert.deepEqual(result, { ok: true, status: 200 });
  assert.equal(request.url, 'https://bzr.openai.com/v1/events?pid=pixel-id');
  assert.equal(request.options.method, 'POST');
  assert.equal(request.options.headers.Authorization, 'Bearer server-secret');
  assert.deepEqual(JSON.parse(request.options.body), {
    validate_only: false,
    events: [{
      id: eventId,
      type: 'lead_created',
      timestamp_ms: 1_795_000_000_000,
      source_url: 'https://maitrise-energie.fr/eligibilite?utm_source=chatgpt',
      action_source: 'web',
      data: { type: 'customer_action' },
      oppref: 'op-click-reference',
      user: { obref: 'browser-reference' },
    }],
  });
});

test('refuse une URL de conversion provenant d’un autre domaine', () => {
  assert.equal(
    buildOpenAISourceUrl('https://malveillant.example/faux-lead', 'https://maitrise-energie.fr'),
    'https://maitrise-energie.fr/',
  );
});
