// Explicit manual smoke test: creates three synthetic leads and can send three emails.
// No admin key is needed: create-lead is the existing public submit endpoint.
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
const endpoint=process.env.B3_LEAD_API_URL;
if(!endpoint)throw new Error('Set B3_LEAD_API_URL to the create-lead endpoint.');
if(!process.argv.includes('--send-test-leads'))throw new Error('Pass --send-test-leads to create synthetic leads and trigger configured notifications.');
const runId=crypto.randomUUID();
const payload={submissionId:crypto.randomUUID(),sourceForm:'contact',trackingId:`b3_${runId}`,contact:{firstName:'Test',lastName:'B3',email:'b3@example.test',phone:'+33 6 00 00 00 00',companyName:'B3 synthetic'},need:{projectType:'B3 technical test',equipment:[],message:'Synthetic idempotency smoke test'},acquisition:{landingPage:'/',ctaSource:'b3_remote_test'},consent:{accepted:true,policyVersion:'b3-test-v1'},website:''};
async function send(body){
  const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(30000)});
  const data=await response.json();
  assert.ok(response.status===200||response.status===201,`HTTP ${response.status}; code=${data.error || 'unknown'}`);
  assert.equal(data.ok,true);assert.equal(data.submissionId,body.submissionId);
  return {status:response.status,...data};
}
const a=await send(payload);assert.equal(a.status,201);assert.equal(a.replayed,false);
const b=await send(payload);assert.equal(b.status,200);assert.equal(b.replayed,true);assert.equal(b.leadId,a.leadId);assert.equal(b.trackingId,a.trackingId);
const second={...payload,submissionId:crypto.randomUUID()};const c=await send(second);assert.equal(c.status,201);assert.notEqual(c.leadId,a.leadId);
const concurrent={...payload,submissionId:crypto.randomUUID()};const [d,e]=await Promise.all([send(concurrent),send(concurrent)]);assert.equal(d.leadId,e.leadId);assert.deepEqual([d.status,e.status].sort(),[200,201]);
const result={submissionIds:[payload.submissionId,second.submissionId,concurrent.submissionId],leadIds:[a.leadId,c.leadId,d.leadId],trackingId:a.trackingId};
await writeFile('b3-remote-result.json',JSON.stringify(result,null,2)+'\n',{mode:0o600});
const idList=result.submissionIds.map(id=>`'${id}'::uuid`).join(', ');
const query=`-- Verify after the initial request/email processing has finished. No PII selected.
select l.id, l.submission_id,
 (select count(*) from public.lead_needs n where n.lead_id=l.id) as needs,
 (select count(*) from public.acquisitions a where a.lead_id=l.id) as acquisitions,
 (select count(*) from public.consents c where c.lead_id=l.id) as consents,
 (select count(*) from public.lead_events e where e.lead_id=l.id and e.event_type='lead_created') as created_events,
 (select count(*) from public.lead_events e where e.lead_id=l.id and e.event_type='lead_notification_sent') as sent_events,
 (select count(*) from public.lead_events e where e.lead_id=l.id and e.event_type='lead_notification_failed') as failed_events
from public.leads l where l.submission_id in (${idList});
-- Expected: three rows, each needs=acquisitions=consents=created_events=1;
-- sent_events + failed_events = 1, never two for a replay.
select lead_id,event_type,metadata from public.lead_events where lead_id in
 (select id from public.leads where submission_id in (${idList})) order by created_at;
`;
await writeFile('b3-remote-verify.sql',query,{mode:0o600});
console.log('PASS A creation / B replay / C new submission / concurrent pair.');
console.log('DB verification still required: b3-remote-verify.sql. Resend dashboard verification still required.');
console.log(JSON.stringify(result));
