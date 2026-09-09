import { rpcParameters } from "./rpcParameters.ts";
import { corsHeaders, isAllowedOrigin } from "./cors.ts";
import { validateSubmission } from "./validation.ts";
import {
  type LeadNotificationInput,
  type LeadNotificationResult,
  sendLeadNotification,
} from "../_shared/email.ts";

const MAX_BODY_BYTES = 25_000;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
type DbError = { code?: string } | null;
type DbClient = {
  rpc(
    name: string,
    args: Record<string, unknown>,
  ): PromiseLike<{ data: unknown; error: DbError }>;
  from(
    name: string,
  ): { insert(row: Record<string, unknown>): PromiseLike<{ error: DbError }> };
};
export function createLeadHandler(dependencies: {
  createClient: (
    url: string,
    key: string,
    options: { auth: { autoRefreshToken: boolean; persistSession: boolean } },
  ) => DbClient;
  notify?: (input: LeadNotificationInput) => Promise<LeadNotificationResult>;
  env?: (key: string) => string | undefined;
  logger?: Pick<Console, "info" | "error">;
}) {
  const {
    createClient,
    notify = sendLeadNotification,
    env = (key: string) => Deno.env.get(key),
    logger = console,
  } = dependencies;
  const rateLimit = new Map<string, number[]>();

  type JsonBody = Record<string, unknown>;

  function json(
    body: JsonBody,
    status: number,
    origin: string | null,
    extraHeaders: Record<string, string> = {},
  ) {
    return new Response(JSON.stringify(body), {
      status,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders(origin),
        ...extraHeaders,
      },
    });
  }

  function clientKey(request: Request) {
    const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]
      ?.trim();
    return forwarded || request.headers.get("cf-connecting-ip") || "unknown";
  }

  function isRateLimited(request: Request) {
    const key = clientKey(request);
    const now = Date.now();
    const recent = (rateLimit.get(key) || []).filter((timestamp) =>
      now - timestamp < RATE_LIMIT_WINDOW_MS
    );
    if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
      rateLimit.set(key, recent);
      return true;
    }
    recent.push(now);
    rateLimit.set(key, recent);
    return false;
  }

  function serverKey() {
    const legacyKey = env("SUPABASE_SERVICE_ROLE_KEY");
    if (legacyKey) return legacyKey;
    try {
      return JSON.parse(env("SUPABASE_SECRET_KEYS") || "{}").default || null;
    } catch {
      return null;
    }
  }

  return async (request: Request) => {
    const origin = request.headers.get("origin");

    if (!isAllowedOrigin(origin)) {
      return json({ ok: false, error: "FORBIDDEN_ORIGIN" }, 403, origin);
    }
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (request.method !== "POST") {
      return json({ ok: false, error: "METHOD_NOT_ALLOWED" }, 405, origin, {
        Allow: "POST, OPTIONS",
      });
    }
    if (isRateLimited(request)) {
      return json({ ok: false, error: "RATE_LIMITED" }, 429, origin, {
        "Retry-After": "600",
      });
    }

    const contentLength = Number(request.headers.get("content-length") || 0);
    if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
      return json({ ok: false, error: "PAYLOAD_TOO_LARGE" }, 413, origin);
    }

    let payload: unknown;
    try {
      const body = await request.text();
      if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) {
        return json({ ok: false, error: "PAYLOAD_TOO_LARGE" }, 413, origin);
      }
      payload = JSON.parse(body);
    } catch {
      return json({ ok: false, error: "INVALID_JSON" }, 400, origin);
    }

    const validation = validateSubmission(payload);
    if (!validation.ok) {
      return json(
        { ok: false, error: "VALIDATION_ERROR", fields: validation.fields },
        400,
        origin,
      );
    }

    // A filled honeypot is accepted silently and intentionally produces no database write.
    if (validation.honeypotFilled) {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    const supabaseUrl = env("SUPABASE_URL");
    const serviceRoleKey = serverKey();
    if (!supabaseUrl || !serviceRoleKey) {
      logger.error("create-lead configuration error", {
        sourceForm: validation.value.sourceForm,
        code: "MISSING_SERVER_CONFIG",
      });
      return json({ ok: false, error: "INTERNAL_ERROR" }, 500, origin);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const input = validation.value;
    const { data, error } = await supabase.rpc(
      "create_lead_submission",
      rpcParameters(
        input,
        request.headers.get("user-agent")?.slice(0, 512) || null,
      ),
    );

    if (
      error || !Array.isArray(data) || !data[0]?.lead_id ||
      !data[0]?.tracking_id || data[0]?.submission_id !== input.submissionId ||
      typeof data[0]?.replayed !== "boolean"
    ) {
      logger.error("create-lead database error", {
        sourceForm: input.sourceForm,
        code: error?.code || "INVALID_RPC_RESPONSE",
      });
      return json({ ok: false, error: "INTERNAL_ERROR" }, 500, origin);
    }

    const result = data[0] as {
      lead_id: string;
      tracking_id: string;
      submission_id: string;
      replayed: boolean;
    };
    logger.info("create-lead success", {
      sourceForm: input.sourceForm,
      leadId: result.lead_id,
      submissionId: result.submission_id,
      replayed: result.replayed,
    });

    if (!result.replayed) {
      try {
        const notification = await notify({
          leadId: result.lead_id,
          trackingId: result.tracking_id,
          sourceForm: input.sourceForm,
          contact: input.contact,
          need: input.need,
          acquisition: input.acquisition,
        });
        const notificationEvent = notification.ok
          ? {
            eventType: "lead_notification_sent",
            metadata: {
              channel: "email",
              provider: "resend",
              provider_message_id: notification.providerMessageId,
            },
          }
          : {
            eventType: "lead_notification_failed",
            metadata: {
              channel: "email",
              provider: "resend",
              reason: notification.errorCode,
              provider_status: notification.providerStatus ?? null,
            },
          };

        if (notification.ok) {
          logger.info("lead notification sent", {
            sourceForm: input.sourceForm,
            leadId: result.lead_id,
            provider: "resend",
            providerMessageId: notification.providerMessageId,
          });
        } else {
          logger.error("lead notification failed", {
            sourceForm: input.sourceForm,
            leadId: result.lead_id,
            provider: "resend",
            code: notification.errorCode,
            providerStatus: notification.providerStatus ?? null,
          });
        }

        const { error: notificationEventError } = await supabase.from(
          "lead_events",
        ).insert({
          lead_id: result.lead_id,
          event_type: notificationEvent.eventType,
          metadata: notificationEvent.metadata,
        });
        if (notificationEventError) {
          logger.error("lead notification event error", {
            sourceForm: input.sourceForm,
            leadId: result.lead_id,
            code: notificationEventError.code || "UNKNOWN",
          });
        }
      } catch {
        logger.error("lead notification processing error", {
          sourceForm: input.sourceForm,
          leadId: result.lead_id,
          code: "NOTIFICATION_PROCESSING_ERROR",
        });
      }
    }

    return json(
      {
        ok: true,
        leadId: result.lead_id,
        trackingId: result.tracking_id,
        submissionId: result.submission_id,
        replayed: result.replayed,
      },
      result.replayed ? 200 : 201,
      origin,
    );
  };
}
