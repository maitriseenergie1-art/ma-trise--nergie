import test from 'node:test';
import assert from 'node:assert/strict';

test('le Pixel reste sans consentement puis envoie un lead confirmé après acceptation', async () => {
  const stored = new Map();
  const appendedScripts = [];
  const dispatched = [];

  globalThis.CustomEvent = class CustomEvent {
    constructor(type, options = {}) {
      this.type = type;
      this.detail = options.detail;
    }
  };
  globalThis.window = {
    localStorage: {
      getItem: (key) => stored.get(key) ?? null,
      setItem: (key, value) => stored.set(key, value),
    },
    dispatchEvent: (event) => dispatched.push(event),
  };
  globalThis.document = {
    querySelector: () => null,
    createElement: () => ({ dataset: {} }),
    head: { appendChild: (script) => appendedScripts.push(script) },
  };

  const pixel = await import(`../src/services/openaiAdsPixel.js?test=${Date.now()}`);
  pixel.initOpenAIAdsPixel();

  assert.deepEqual(window.oaiq.q[0], ['consent', false]);
  assert.equal(pixel.trackOpenAILeadCreated('lead-before-consent'), false);
  assert.equal(appendedScripts.length, 1);
  assert.equal(appendedScripts[0].src, 'https://bzrcdn.openai.com/sdk/oaiq.min.js');

  pixel.setOpenAIAdsConsent(true);
  assert.equal(stored.get('me-openai-ads-consent-v1'), 'granted');
  assert.equal(dispatched.at(-1).detail, 'granted');
  assert.equal(pixel.trackOpenAILeadCreated('lead-confirmed-123'), true);
  assert.deepEqual(window.oaiq.q.at(-1), [
    'measure',
    'lead_created',
    { type: 'customer_action' },
    { event_id: 'lead-confirmed-123' },
  ]);

  delete globalThis.window;
  delete globalThis.document;
  delete globalThis.CustomEvent;
});
