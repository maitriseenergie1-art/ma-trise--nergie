const developmentOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];

export function allowedOrigins() {
  const configured = Deno.env.get('ALLOWED_ORIGINS')?.split(',').map((origin) => origin.trim()).filter(Boolean);
  return configured?.length ? configured : developmentOrigins;
}

export function isAllowedOrigin(origin: string | null) {
  return !origin || allowedOrigins().includes(origin);
}

export function corsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
  if (origin && isAllowedOrigin(origin)) headers['Access-Control-Allow-Origin'] = origin;
  return headers;
}
