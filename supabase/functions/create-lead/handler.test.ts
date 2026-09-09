import { assertEquals } from "jsr:@std/assert@1";
import { createLeadHandler } from "./handler.ts";
import { contactPayload } from "./fixtures.ts";

function harness(failEmail = false) {
  const rows = new Map<
    string,
    { lead_id: string; tracking_id: string; submission_id: string }
  >();
  let emails = 0, writes = 0;
  const events: Record<string, unknown>[] = [];
  const handler = createLeadHandler({
    env: () => "test-config",
    logger: { info() {}, error() {} },
    createClient: () => ({
      // This fake tests HTTP orchestration, NOT PostgreSQL concurrency.
      rpc: async (_name, args) => {
        const id = String(args.p_submission_id);
        const existing = rows.get(id);
        if (existing) {
          return { data: [{ ...existing, replayed: true }], error: null };
        }
        const row = {
          lead_id: crypto.randomUUID(),
          tracking_id: String(args.p_tracking_id),
          submission_id: id,
        };
        rows.set(id, row);
        writes++;
        return { data: [{ ...row, replayed: false }], error: null };
      },
      from: () => ({
        insert: async (row) => {
          events.push(row);
          return { error: null };
        },
      }),
    }),
    notify: async () => {
      emails++;
      return failEmail
        ? { ok: false, errorCode: "EMAIL_NETWORK_ERROR" }
        : { ok: true, providerMessageId: "synthetic-email" };
    },
  });
  const request = (payload: unknown = contactPayload) =>
    handler(
      new Request("http://local/create-lead", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    );
  return { request, handler, rows, events, counts: () => ({ emails, writes }) };
}
Deno.test("HTTP création 201 puis replay 200 : mêmes identifiants et aucun deuxième email/événement", async () => {
  const h = harness();
  const first = await h.request();
  const a = await first.json();
  const replay = await h.request();
  const b = await replay.json();
  assertEquals(first.status, 201);
  assertEquals(replay.status, 200);
  assertEquals(a.replayed, false);
  assertEquals(b, { ...a, replayed: true });
  assertEquals(h.counts(), { emails: 1, writes: 1 });
  assertEquals(h.events.length, 1);
  assertEquals(h.events[0].event_type, "lead_notification_sent");
});
Deno.test("nouvel UUID, même identité et tracking : nouvelle création", async () => {
  const h = harness();
  const a = await (await h.request()).json();
  const b = await (await h.request({
    ...contactPayload,
    submissionId: crypto.randomUUID(),
  })).json();
  assertEquals(a.leadId === b.leadId, false);
  assertEquals(h.counts(), { emails: 2, writes: 2 });
});
Deno.test("orchestration concurrente avec RPC simulée : une notification", async () => {
  const h = harness();
  const replies = await Promise.all([h.request(), h.request()]);
  assertEquals(replies.map((x) => x.status).sort(), [200, 201]);
  assertEquals(h.counts(), { emails: 1, writes: 1 });
  assertEquals(h.events.length, 1);
});
Deno.test("échec Resend : succès lead et replay sans nouvelle tentative email", async () => {
  const h = harness(true);
  assertEquals((await h.request()).status, 201);
  assertEquals((await h.request()).status, 200);
  assertEquals(h.counts(), { emails: 1, writes: 1 });
  assertEquals(h.events.length, 1);
  assertEquals(h.events[0].event_type, "lead_notification_failed");
});
Deno.test("honeypot sans UUID : 204, aucune RPC, aucun email", async () => {
  const h = harness();
  assertEquals(
    (await h.request({
      ...contactPayload,
      submissionId: undefined,
      website: "bot",
    })).status,
    204,
  );
  assertEquals(h.counts(), { emails: 0, writes: 0 });
  assertEquals(h.events.length, 0);
});
Deno.test("contrats Contact et Éligibilité acceptés", async () => {
  for (const sourceForm of ["contact", "eligibility"]) {
    assertEquals(
      (await harness().request({ ...contactPayload, sourceForm })).status,
      201,
    );
  }
});
Deno.test("400 et validation existante conservées, aucun appel DB", async () => {
  for (
    const change of [
      { submissionId: undefined },
      { submissionId: "not-uuid" },
      { contact: { email: "invalid" } },
      { consent: { accepted: false } },
    ]
  ) {
    const h = harness();
    assertEquals(
      (await h.request({ ...contactPayload, ...change })).status,
      400,
    );
    assertEquals(h.counts(), { emails: 0, writes: 0 });
  }
});
Deno.test("limite body, JSON invalide, méthode et rate limit conservés", async () => {
  const h = harness();
  assertEquals(
    (await h.handler(new Request("http://local", { method: "GET" }))).status,
    405,
  );
  assertEquals(
    (await h.handler(
      new Request("http://local", { method: "POST", body: "not json" }),
    )).status,
    400,
  );
  assertEquals(
    (await h.request({ ...contactPayload, padding: "x".repeat(26000) })).status,
    413,
  );
  const limited = harness();
  for (let i = 0; i < 5; i++) await limited.request();
  assertEquals((await limited.request()).status, 429);
});
