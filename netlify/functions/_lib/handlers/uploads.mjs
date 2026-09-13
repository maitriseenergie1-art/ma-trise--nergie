import { admin } from '../supabaseAdmin.mjs';
import { json } from '../http.mjs';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'];
const MAX_BYTES = 5 * 1024 * 1024;
const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif', 'image/svg+xml': 'svg' };

export async function uploadImage(req) {
  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  if (!file || typeof file === 'string') return json({ error: 'file_required' }, 400);
  if (!ALLOWED.includes(file.type)) return json({ error: 'unsupported_type', allowed: ALLOWED }, 415);
  if (file.size > MAX_BYTES) return json({ error: 'too_large', maxBytes: MAX_BYTES }, 413);

  const ext = EXT[file.type] || 'bin';
  const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error } = await admin.storage.from('content-images').upload(path, bytes, {
    contentType: file.type,
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) return json({ error: error.message }, 500);

  const { data } = admin.storage.from('content-images').getPublicUrl(path);
  return json({ url: data.publicUrl, path }, 201);
}
