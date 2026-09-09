const REQUEST_TIMEOUT_MS = 12_000;

function parseResponseBody(response) {
  return response.text().then((text) => {
    if (!text) return null;
    try { return JSON.parse(text); } catch { return null; }
  });
}

export async function submitLead(payload) {
  const endpoint = import.meta.env.VITE_LEAD_API_URL;
  if (!endpoint) return { ok: false, type: 'configuration' };

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const body = await parseResponseBody(response);

    if (
      (response.status === 201 || response.status === 200)
      && body?.ok
      && body.leadId
      && body.submissionId === payload.submissionId
      && typeof body.replayed === 'boolean'
    ) {
      return { ok: true, leadId: body.leadId, trackingId: body.trackingId || payload.trackingId, submissionId: body.submissionId, replayed: body.replayed === true };
    }
    if (response.status === 204) return { ok: true, ignored: true };
    if (response.status === 400) return { ok: false, type: 'validation', fields: body?.fields || {} };
    if (response.status === 429) return { ok: false, type: 'rate_limit' };
    return { ok: false, type: 'server' };
  } catch (error) {
    return { ok: false, type: error?.name === 'AbortError' ? 'timeout' : 'network' };
  } finally {
    window.clearTimeout(timeout);
  }
}

// Compatibility export for the existing Contact form.
export const submitContactLead = submitLead;
