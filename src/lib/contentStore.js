// Shared cache for content loaded from Supabase.
// - During the build-time prerender, entries are seeded before rendering so
//   pages render synchronously with real data.
// - In the browser, entries seeded from window.__PRELOADED_CONTENT__ avoid a
//   redundant fetch on first paint; anything missing is fetched on mount.

const cache = new Map();

export function seedContent(entries) {
  if (!entries) return;
  for (const [key, value] of Object.entries(entries)) {
    cache.set(key, { status: 'success', data: value });
  }
}

export function getCachedContent(key) {
  return cache.get(key);
}

export function setCachedContent(key, entry) {
  cache.set(key, entry);
}

export function dumpContent() {
  const out = {};
  for (const [key, entry] of cache.entries()) {
    if (entry.status === 'success') out[key] = entry.data;
  }
  return out;
}

// Hydrate from the payload the prerender injected into the page.
if (typeof window !== 'undefined' && window.__PRELOADED_CONTENT__) {
  seedContent(window.__PRELOADED_CONTENT__);
}
