const storageBase = ((typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || '').replace(/\/$/, '');

// Public Supabase Storage for production media, with a local fallback for a
// fresh checkout or an offline development environment.
export function siteMedia(path, fallback) {
  return storageBase ? `${storageBase}/storage/v1/object/public/content-images/site/${path}` : fallback;
}
