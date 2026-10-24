import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import worker,{DEFAULTS,instagramUrl,normalizeComments,filterComments,draw,demoComments,validateRules,createService} from '../src/lib/cekilis/app.js';
import {GIVEAWAY_HTML} from '../src/lib/cekilis/client-document.js';
const documentHtml=()=>GIVEAWAY_HTML;
const comment=(id,username,text,time='2026-10-23T12:00:00Z')=>({id,username,text,timestamp:time});
test('Only canonical HTTPS Instagram post/reel URLs are accepted',()=>{
  assert.equal(instagramUrl('https://www.instagram.com/p/Ab_12/?igsh=foo'),'https://www.instagram.com/p/Ab_12/');
  for(const u of ['https://instagram.com.attacker.test/p/Ab/','https://instagram.com@attacker.test/p/Ab/','http://instagram.com/p/Ab/','https://instagram.com:444/p/Ab/','https://instagram.com/someone/','https://127.0.0.1/p/Ab/'])assert.equal(instagramUrl(u),null);
});
test('Distinct tags exclude self tags and repeated tags; first eligible comment wins',()=>{
  const c=[comment('1','elif','@elif @emre @emre'),comment('2','elif','@emre @zeynep'),comment('3','elif','@mert @ayse'),comment('4','mert','@emre @zeynep')];
  const f=filterComments(c,{...DEFAULTS,mentions:2});
  assert.deepEqual(f.map(c=>c.eligible),[false,true,false,true]);
  assert.equal(f[0].tags,1);assert.equal(f[2].reason,'Tek katılım sınırı');
});
test('Cutoff uses Istanbul time and excludes replies, keywords, blocked users',()=>{
  const comments=[comment('1','elif','@emre #cekilis','2026-10-23T14:00:00Z'),comment('2','ayse','@emre #cekilis','2026-10-23T14:00:01Z'),{...comment('3','mert','@emre #cekilis'),reply:true},comment('4','can','@emre'),comment('5','buse','@emre #cekilis')];
  const f=filterComments(comments,{...DEFAULTS,cutoff:'2026-10-23T17:00',keyword:'#cekilis',exclude:'@buse'});
  assert.deepEqual(f.filter(c=>c.eligible).map(c=>c.id),['1']);
});
test('A person can never appear twice among winners and backups even with multiple tickets',()=>{
  const c=Array.from({length:10},(_,i)=>comment(String(i),'elif','@mert')).concat([comment('20','ayse','@mert'),comment('21','can','@mert')]);
  for(let i=0;i<50;i++){const r=draw(c,1,2);assert.equal(new Set([...r.winners,...r.backups].map(c=>c.username)).size,3);}
  assert.throws(()=>draw(c,2,2));assert.throws(()=>draw(c,0,1));
});
test('Import rejects missing data and deduplicates comment IDs',()=>{
  assert.throws(()=>normalizeComments([{username:'elif',text:'hello'}]));
  const c=comment('1','elif','@emre');assert.equal(normalizeComments([c,c]).length,1);
  assert.equal(normalizeComments([{...c,username:undefined,ownerUsername:'Elif'}])[0].username,'elif');
  assert.throws(()=>validateRules({...DEFAULTS,winners:1.5}));assert.throws(()=>validateRules({...DEFAULTS,cutoff:'bad-date'}));
});
test('Rendered client script is syntactically valid and the API does not silently use demo data',async()=>{
  const response=new Response(GIVEAWAY_HTML);
  assert.equal(response.status,200);const html=await response.text(),script=html.match(/<script>([\s\S]*)<\/script>/)[1];new vm.Script(script);
  const shared=script.slice(0,script.indexOf(';(function client'));
  const previewCount=vm.runInNewContext(shared+';new Set(filterComments(demoComments(),DEFAULTS).filter(c=>c.eligible).map(c=>c.username)).size',{URL,crypto});
  assert.equal(previewCount,32);
  const unavailable=await worker.fetch(new Request('https://draw.test/api/cekilisyap/comments',{method:'POST',body:'{"url":"https://instagram.com/p/Ab/"}'}));assert.equal(unavailable.status,503);assert.match((await unavailable.json()).error,/henüz bağlı değil/);
});
test('Draw API re-applies rules and returns a result with a frozen-list hash',async()=>{
  const request=new Request('https://draw.test/api/cekilisyap/draw',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({comments:demoComments(),rules:{...DEFAULTS,winners:3,backups:4}})});
  const response=await worker.fetch(request);assert.equal(response.status,200);const r=await response.json();assert.equal(r.winners.length,3);assert.equal(r.backups.length,4);assert.match(r.hash,/^[a-f0-9]{64}$/);assert.equal(new Set([...r.winners,...r.backups].map(c=>c.username)).size,7);assert.equal(r.count,32);
  const bad=await worker.fetch(new Request('https://draw.test/api/cekilisyap/draw',{method:'POST',body:'{'}));assert.equal(bad.status,400);
  const cross=await worker.fetch(new Request('https://draw.test/api/cekilisyap/draw',{method:'POST',headers:{Origin:'https://evil.test'},body:'{}'}));assert.equal(cross.status,403);
});
test('Provider adapter starts an async job and binds polling to a signed HttpOnly cookie',async()=>{
  const original=globalThis.fetch,calls=[];
  globalThis.fetch=async(url,init)=>{calls.push({url,init});if(String(url).includes('/runs?'))return Response.json({data:{id:'job123',status:'READY'}});if(String(url).includes('/actor-runs/'))return Response.json({data:{status:'SUCCEEDED',defaultDatasetId:'dataset1'}});return Response.json([{id:'1',ownerUsername:'elif',text:'@emre',timestamp:'2026-10-23T12:00:00Z',replies:[]}],{headers:{'x-apify-pagination-total':'1001'}});};
  try{const start=await worker.fetch(new Request('https://draw.test/api/cekilisyap/comments',{method:'POST',body:JSON.stringify({url:'https://instagram.com/p/Ab/'})}),{APIFY_API_TOKEN:'test-secret'});assert.equal(start.status,202);const cookie=start.headers.get('set-cookie');assert.match(cookie,/HttpOnly/);assert.match(cookie,/SameSite=Strict/);const input=JSON.parse(calls[0].init.body);assert.deepEqual(input.directUrls,['https://www.instagram.com/p/Ab/']);
    const missing=await worker.fetch(new Request('https://draw.test/api/cekilisyap/comments'),{APIFY_API_TOKEN:'test-secret'});assert.equal(missing.status,400);
    const response=await worker.fetch(new Request('https://draw.test/api/cekilisyap/comments?offset=0',{headers:{cookie:cookie.split(';')[0]}}),{APIFY_API_TOKEN:'test-secret'});const data=await response.json();assert.equal(data.comments[0].username,'elif');assert.equal(data.nextOffset,1);
    const wrong=await worker.fetch(new Request('https://draw.test/api/cekilisyap/comments',{headers:{cookie:cookie.split(';')[0]+'broken'}}),{APIFY_API_TOKEN:'test-secret'});assert.equal(wrong.status,400);
  }finally{globalThis.fetch=original;}
});
test('Downloaded HTML works in HTTPS previews without calling nonexistent API routes',async()=>{
  let networkCalls=0;const service=createService(true,async()=>{networkCalls++;throw Error('Must not call');},'https:');
  assert.match(documentHtml(true),/const STANDALONE=false/);
  const status=await service('/api/cekilisyap/status');assert.equal((await status.json()).configured,false);
  const response=await service('/api/cekilisyap/draw',{body:JSON.stringify({comments:demoComments(),rules:DEFAULTS})});
  assert.equal(response.status,200);const result=await response.json();assert.equal(result.winners.length,1);assert.equal(result.engine,'browser');
  const comments=await service('/api/cekilisyap/comments',{body:JSON.stringify({url:'https://www.instagram.com/p/DejI3LbFeK3/'})});
  assert.equal(comments.status,503);assert.match((await comments.json()).error,/canlı çekmez/);assert.equal(networkCalls,0);
});
test('Empty, HTML and malformed backend responses show a readable error instead of a JSON exception',async()=>{
  for(const body of ['', '<html>preview</html>', '{', 'null']){
    const service=createService(false,async()=>new Response(body));
    const response=await service('/api/cekilisyap/comments');assert.equal(response.status,502);const data=await response.json();assert.equal(typeof data.error,'string');assert.ok(!data.error.includes('Unexpected'));
  }
  const offline=createService(false,async()=>{throw Error('Network unavailable');});assert.equal((await offline('/api/cekilisyap/status')).status,503);
});
