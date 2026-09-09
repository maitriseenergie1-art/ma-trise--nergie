// Run against an isolated Vite server configured with VITE_LEAD_API_URL=<base>/b3-api.
// All API requests are intercepted. No lead or email is created.
import assert from 'node:assert/strict';
const { chromium }=await import(process.env.B3_PLAYWRIGHT_MODULE || 'playwright');
const base=process.env.B3_BROWSER_URL || 'http://127.0.0.1:5174';
const browser=await chromium.launch({channel:process.env.B3_BROWSER_CHANNEL || 'chrome'});
try {
 const page=await browser.newPage();const requests=[];let mode='timeout';
 await page.route(`${base}/b3-api`,async route=>{
   const payload=route.request().postDataJSON();requests.push(payload);
   if(mode==='timeout')return; // Browser's actual 12-second AbortController must fire.
   if(mode==='network')return route.abort('failed');
   return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,leadId:'synthetic-lead',trackingId:payload.trackingId,submissionId:payload.submissionId,replayed:true})});
 });
 async function fillContact(){for(const [field,value] of [['first-name','Test'],['last-name','B3'],['email','b3@example.test']])await page.locator(`#contact-${field}`).fill(value);await page.locator('#contact-need').selectOption('etude');await page.locator('input[name="privacy"]').check();}
 await page.goto(base+'/contact');await fillContact();await page.getByRole('button',{name:'Être rappelé',exact:true}).click();
 await page.locator('.error').waitFor({timeout:16000});assert.equal(requests.length,1);
 mode='success';await page.getByRole('button',{name:'Être rappelé',exact:true}).click();await page.locator('.form-success').waitFor();
 assert.equal(requests[0].submissionId,requests[1].submissionId);assert.deepEqual(requests[0],requests[1]);
 await page.goto(base+'/contact');await fillContact();await page.getByRole('button',{name:'Être rappelé',exact:true}).click();await page.locator('.form-success').waitFor();assert.notEqual(requests[2].submissionId,requests[0].submissionId);
 await page.goto(base+'/eligibilite');for(let i=0;i<5;i++){await page.locator('.choice-option').first().click();await page.getByRole('button',{name:'Continuer',exact:true}).click();}
 for(const [field,value] of [['first-name','Test'],['last-name','B3'],['email','b3@example.test']])await page.locator(`#eligibility-${field}`).fill(value);
 await page.locator('input[name="privacy"]').check();mode='network';await page.getByRole('button',{name:'Transmettre ma demande',exact:true}).click();await page.locator('.error').waitFor();
 const first=requests.at(-1);await page.reload();assert.equal(await page.locator('#eligibility-email').inputValue(),'b3@example.test');
 await page.getByRole('button',{name:'Retour',exact:true}).click();await page.getByRole('button',{name:'Continuer',exact:true}).click();
 mode='success';await page.getByRole('button',{name:'Transmettre ma demande',exact:true}).click();await page.locator('.result').waitFor();
 assert.equal(first.submissionId,requests.at(-1).submissionId);assert.deepEqual(first,requests.at(-1));
 assert.equal(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('me-eligibility-draft-v2')).submissionId),null);
 console.log('PASS Contact real 12s timeout → same payload/UUID retry → replay accepted → new form/new UUID.');
 console.log('PASS Eligibility network failure → reload → previous/next → same payload/UUID retry → draft ID cleared.');
} finally {await browser.close();}
