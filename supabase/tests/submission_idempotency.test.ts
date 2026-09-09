import { assertEquals, assertRejects } from "jsr:@std/assert@1";
import postgres from "npm:postgres@3.4.7";
import { contactPayload } from "../functions/create-lead/fixtures.ts";
import { validateSubmission } from "../functions/create-lead/validation.ts";
import { rpcParameters } from "../functions/create-lead/rpcParameters.ts";
import { createLeadHandler } from "../functions/create-lead/handler.ts";

const url = Deno.env.get("B3_DB_URL");
Deno.test({
  name:
    "PostgreSQL réel : concurrence, rollback, enfants, email simulé, RLS et grants",
  ignore: !url,
  fn: async () => {
    // Dedicated LOCAL migrated database only. No real email provider is called.
    const sql = postgres(url!, { max: 4 });
    const ids = [crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID()];
    function args(id: string) {
      const result = validateSubmission({
        ...contactPayload,
        submissionId: id,
      });
      if (!result.ok) throw Error("Invalid synthetic fixture");
      return rpcParameters(result.value, "B3 integration test");
    }
    async function rpc(parameters: Record<string, unknown>, client = sql) {
      const entries = Object.entries(parameters);
      const query = `select * from public.create_lead_submission(${
        entries.map(([key], i) =>
          `${key} => $${i + 1}${key === "p_equipment" ? "::jsonb" : ""}`
        ).join(",")
      })`;
      return await client.unsafe(
        query,
        entries.map(([key, value]) =>
          key === "p_equipment" ? JSON.stringify(value) : value
        ) as never[],
      );
    }
    try {
      // Hold A's transaction open so B encounters a genuinely uncommitted conflict.
      let concurrent: ReturnType<typeof rpc>;
      let first: Awaited<ReturnType<typeof rpc>>;
      await sql.begin(async (tx) => {
        first = await rpc(args(ids[0]), tx as unknown as typeof sql);
        concurrent = rpc(args(ids[0]));
        await new Promise((resolve) => setTimeout(resolve, 150));
      });
      const replay = await concurrent!;
      assertEquals(first![0].lead_id, replay[0].lead_id);
      assertEquals(first![0].replayed, false);
      assertEquals(replay[0].replayed, true);
      const leadId = first![0].lead_id;
      for (const table of ["leads", "lead_needs", "acquisitions", "consents"]) {
        const count = await sql.unsafe(
          `select count(*)::int as n from public.${table} where ${
            table === "leads" ? "id" : "lead_id"
          }=$1`,
          [leadId],
        );
        assertEquals(count[0].n, 1, table);
      }
      assertEquals(
        (await sql`select count(*)::int as n from public.lead_events where lead_id=${leadId} and event_type='lead_created'`)[
          0
        ].n,
        1,
      );
      // New submission, identical prospect and tracking; actual handler + DB + fake email.
      let emails = 0;
      const handler = createLeadHandler({
        env: () => "integration",
        logger: { info() {}, error() {} },
        createClient: () => ({
          rpc: async (_name, parameters) => ({
            data: await rpc(parameters),
            error: null,
          }),
          from: () => ({
            insert: async (row) => {
              await sql`insert into public.lead_events ${sql(row)}`;
              return { error: null };
            },
          }),
        }),
        notify: async () => {
          emails++;
          return { ok: true, providerMessageId: "b3-fake-email" };
        },
      });
      const request = () =>
        handler(
          new Request("http://local", {
            method: "POST",
            body: JSON.stringify({ ...contactPayload, submissionId: ids[1] }),
          }),
        );
      const responses = await Promise.all([request(), request()]);
      assertEquals(responses.map((r) => r.status).sort(), [200, 201]);
      assertEquals(emails, 1);
      const a = await responses[0].json(), b = await responses[1].json();
      assertEquals(a.leadId, b.leadId);
      assertEquals(a.leadId === leadId, false);
      assertEquals(
        (await sql`select count(*)::int as n from public.lead_events where lead_id=${a.leadId} and event_type='lead_notification_sent'`)[
          0
        ].n,
        1,
      );
      for (const table of ["lead_needs", "acquisitions", "consents"]) {
        assertEquals(
          (await sql.unsafe(
            `select count(*)::int as n from public.${table} where lead_id=$1`,
            [a.leadId],
          ))[0].n,
          1,
        );
      }
      // A failing child insert must roll back the lead AND free its submission UUID.
      await assertRejects(() => rpc({ ...args(ids[2]), p_consent_type: "" }));
      assertEquals(
        (await sql`select count(*)::int as n from public.leads where submission_id=${
          ids[2]
        }`)[0].n,
        0,
      );
      assertEquals((await rpc(args(ids[2])))[0].replayed, false);
      const functions =
        await sql`select p.oid, p.prosecdef, p.proconfig from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='create_lead_submission'`;
      assertEquals(functions.length, 1);
      assertEquals(functions[0].prosecdef, true);
      assertEquals(
        functions[0].proconfig.includes(
          "search_path=pg_catalog, public, pg_temp",
        ),
        true,
      );
      const oid = functions[0].oid;
      for (const role of ["anon", "authenticated"]) {
        assertEquals(
          (await sql`select has_function_privilege(${role},${oid},'EXECUTE') as allowed`)[
            0
          ].allowed,
          false,
        );
      }
      assertEquals(
        (await sql`select has_function_privilege('service_role',${oid},'EXECUTE') as allowed`)[
          0
        ].allowed,
        true,
      );
      const tables =
        await sql`select relname,relrowsecurity from pg_class where relnamespace='public'::regnamespace and relname in ('leads','lead_needs','acquisitions','consents','lead_events')`;
      assertEquals(tables.length, 5);
      tables.forEach((t) => assertEquals(t.relrowsecurity, true, t.relname));
    } finally {
      await sql`delete from public.leads where submission_id in ${sql(ids)}`;
      await sql.end();
    }
  },
});
