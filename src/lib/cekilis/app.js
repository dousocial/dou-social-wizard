export const DEFAULTS = { mentions:1, keyword:'', unique:true, ignoreReplies:true, exclude:'', cutoff:'', winners:1, backups:2, follow:false, like:false };
export const handle = s => s.trim().replace(/^@/,'').toLowerCase();
export function instagramUrl(input) { try { const u=new URL(input.trim()),m=u.pathname.match(/^\/(p|reel|reels)\/([A-Za-z0-9_-]+)\/?$/); return u.protocol==='https:'&&['instagram.com','www.instagram.com'].includes(u.hostname)&&!u.username&&!u.password&&!u.port&&m?`https://www.instagram.com/${m[1]==='reels'?'reel':m[1]}/${m[2]}/`:null; }catch{return null;} }
export function normalizeComments(raw) {
  if(!Array.isArray(raw)||raw.length>20000)throw Error('En fazla 20.000 yorum içeren bir JSON dizisi yükleyin.');
  const ids=new Set();return raw.map((r,i)=>{if(!r||typeof r!=='object')throw Error(`${i+1}. yorum geçersiz.`);const username=handle(String(r.username||r.ownerUsername||'')),text=String(r.text||''),timestamp=String(r.timestamp||'');if(!/^[a-z0-9._]{1,30}$/.test(username)||!text.trim()||text.length>10000||!Number.isFinite(Date.parse(timestamp)))throw Error(`${i+1}. yorum için username, text ve geçerli timestamp gerekiyor.`);const id=String(r.id||`import-${i}`);if(ids.has(id))return null;ids.add(id);return{id,username,text,timestamp,reply:Boolean(r.reply||r.parentId||r.parent_id)};}).filter(Boolean);
}
export function validateRules(r) {
  if(!r||typeof r!=='object')throw Error('Çekiliş kuralları eksik.');
  for(const [key,min,max] of [['mentions',0,10],['winners',1,20],['backups',0,20]])if(!Number.isInteger(r[key])||r[key]<min||r[key]>max)throw Error('Kazanan, yedek veya etiket sayısı geçersiz.');
  for(const key of ['unique','ignoreReplies','follow','like'])if(typeof r[key]!=='boolean')throw Error('Katılım ayarı geçersiz.');
  if(typeof r.keyword!=='string'||r.keyword.length>100||typeof r.exclude!=='string'||r.exclude.length>3000||typeof r.cutoff!=='string')throw Error('Katılım filtresi geçersiz.');
  if(r.cutoff&&(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(r.cutoff)||!Number.isFinite(Date.parse(r.cutoff+':00+03:00'))))throw Error('Son katılım tarihi geçersiz.');
  return Object.fromEntries(Object.keys(DEFAULTS).map(k=>[k,r[k]]));
}
export function filterComments(comments,rules) {
  const excluded=new Set(rules.exclude.split(/[\s,;]+/).map(handle).filter(Boolean)),seen=new Set(),ids=new Set(),cutoff=rules.cutoff?Date.parse(rules.cutoff+':00+03:00'):Infinity;
  return [...comments].sort((a,b)=>Date.parse(a.timestamp)-Date.parse(b.timestamp)||a.id.localeCompare(b.id)).map(c=>{const user=handle(c.username),tags=new Set((c.text.match(/(?<![a-zA-Z0-9._])@[a-zA-Z0-9._]{1,30}/g)||[]).map(handle).filter(t=>t!==user&&!excluded.has(t)));let reason='';if(ids.has(c.id))reason='Tekrarlanan kayıt';else if(excluded.has(user))reason='Hariç tutulan hesap';else if(rules.ignoreReplies&&c.reply)reason='Yorum yanıtı';else if(Date.parse(c.timestamp)>cutoff)reason='Tarih dışında';else if(tags.size<rules.mentions)reason='Yetersiz farklı etiket';else if(rules.keyword&&!c.text.toLocaleLowerCase('tr').includes(rules.keyword.toLocaleLowerCase('tr')))reason='Kelime eksik';else if(rules.unique&&seen.has(user))reason='Tek katılım sınırı';ids.add(c.id);if(!reason)seen.add(user);return{...c,tags:tags.size,eligible:!reason,reason};});
}
export function randomIndex(size) { if(!Number.isSafeInteger(size)||size<1||size>0xffffffff)throw Error('Geçersiz havuz.');const limit=Math.floor(0x100000000/size)*size,n=new Uint32Array(1);do{crypto.getRandomValues(n);}while(n[0]>=limit);return n[0]%size; }
export function draw(comments,winners,backups) { if(![winners,backups].every(Number.isInteger)||winners<1||backups<0||winners>20||backups>20)throw Error('Geçersiz kazanan sayısı.');if(new Set(comments.map(c=>handle(c.username))).size<winners+backups)throw Error('Kazanan ve yedek toplamı kadar farklı katılımcı bulunmuyor.');let pool=[...comments];const picked=[];for(let i=0;i<winners+backups;i++){const chosen=pool[randomIndex(pool.length)];picked.push(chosen);pool=pool.filter(c=>handle(c.username)!==handle(chosen.username));}return{winners:picked.slice(0,winners),backups:picked.slice(winners)}; }
export function demoComments() {const names=['elif.yilmaz','emre.kaya','zeynep.demir','mert.aydin','selin.koc','burak.celik','deniz.arslan','ece.yildiz','can.ozturk','ayse.aksoy','onur.sahin','irem.kurt','buse.kaplan','kerem.oz','dilan.gunes','alp.eren','ceren.uzun','berk.tas','sude.avci','arda.akin','melis.sari','furkan.kilic','naz.ates','umut.sen','yasemin.yalcin','ali.efe','damla.tuna','kaan.tekin','gizem.bulut','tolga.ipek','asli.deniz','enes.akin'];return Array.from({length:96},(_,i)=>({id:`demo-${i}`,username:names[i%32],text:i%7===0?'Harika bir hediye! 💜':i%5===0?'@arkadasim @arkadasim Ben de katılıyorum! ✨':`@${names[(i+3)%32]} @${names[(i+9)%32]} @${names[(i+17)%32]} Birlikte kazanalım! 💜 #cekilis`,timestamp:new Date(Date.UTC(2026,9,20+Math.floor(i/24),9,i%60)).toISOString(),reply:i%13===0}));}
const JSON_HEADERS={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{...JSON_HEADERS,...headers}});
async function provider(path,token,init={}) {const r=await fetch('https://api.apify.com/v2/'+path,{...init,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'}});if(!r.ok)throw Error(r.status===401?'Yorum servisinin API anahtarı geçersiz.':r.status===402?'Yorum servisinin bakiyesi yetersiz.':'Yorum servisi isteği tamamlanamadı.');return r;}
const hex=bytes=>Array.from(new Uint8Array(bytes)).map(n=>n.toString(16).padStart(2,'0')).join('');
async function signature(value,secret) {const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return hex(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(value)));}
async function jobCookie(request,secret) {const value=(request.headers.get('cookie')||'').split('; ').find(c=>c.startsWith('draw_job='))?.slice(9);if(!value)return null;const [id,expiry,mode,sig]=value.split('.');if(!/^[A-Za-z0-9]+$/.test(id)||!['preview','thousand'].includes(mode)||Number(expiry)<Date.now()||await signature(id+'.'+expiry+'.'+mode,secret)!==sig)return null;return {id,mode};}
export function providerComment(c,reply=false) {const time=c.timestamp??c.created_at??c.createdAt;return {id:String(c.id??c.pk??''),username:c.ownerUsername||c.owner?.username||c.user?.username||c.username,text:c.text??c.message,timestamp:typeof time==='number'?new Date(time*1000).toISOString():time,reply:Boolean(reply||c.parentId||c.parent_id||c.parentCommentUrl)};}
async function api(request,env,url) {
  const origin=request.headers.get('origin');if(origin&&origin!==url.origin)return json({error:'Geçersiz istek kaynağı.'},403);
  if(url.pathname==='/api/cekilisyap/status'&&request.method==='GET')return json({configured:Boolean(env.APIFY_API_TOKEN)});
  if(url.pathname==='/api/cekilisyap/draw'&&request.method==='POST') {
    const body=await limitedBody(request),comments=normalizeComments(body.comments),rules=validateRules(body.rules),eligible=filterComments(comments,rules).filter(c=>c.eligible),result=draw(eligible,rules.winners,rules.backups);
    const snapshot=JSON.stringify({rules,comments:eligible.map(({id,username,text,timestamp})=>({id,username,text,timestamp}))});
    return json({...result,id:crypto.randomUUID(),date:new Date().toISOString(),hash:hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(snapshot))),count:new Set(eligible.map(c=>c.username)).size,rules});
  }
  if(url.pathname==='/api/cekilisyap/comments') {
    const token=env.APIFY_API_TOKEN;if(!token)return json({error:'Canlı yorum servisi henüz bağlı değil. Demo çekilişini deneyebilir veya yorumlarını JSON olarak yükleyebilirsin.'},503);
    if(request.method==='POST') {
      const body=await limitedBody(request),clean=instagramUrl(String(body.url||''));if(!clean)return json({error:'Geçerli bir Instagram post veya Reels bağlantısı girin.'},400);
      const mode=body.mode||'preview';if(!['preview','thousand'].includes(mode))return json({error:'Yorum toplama seçeneği geçersiz.'},400);const active=await jobCookie(request,token);if(active){const old=(await(await provider('actor-runs/'+active.id,token)).json()).data;if(['READY','RUNNING'].includes(old.status)){if(active.mode!==mode)return json({error:'Önce devam eden yorum aktarımının bitmesini bekleyin.'},409);return json({id:active.id,status:old.status});}}
      const deep=mode==='thousand',actor=deep?'louisdeconinck~instagram-comments-scraper':'apify~instagram-comment-scraper',input=deep?{urls:[clean],maxComments:1000}:{directUrls:[clean],resultsLimit:10000,includeReplies:true};
      const r=await provider('acts/'+actor+'/runs?timeout=480&memory=256&maxTotalChargeUsd=2',token,{method:'POST',body:JSON.stringify(input)}),{data}=await r.json(),expiry=Date.now()+3600000,value=data.id+'.'+expiry+'.'+mode;
      const cookie=`draw_job=${value}.${await signature(value,token)}; HttpOnly; SameSite=Strict; Path=/api/cekilisyap/comments; Max-Age=3600${url.protocol==='https:'?'; Secure':''}`;
      return json({id:data.id,status:data.status},202,{'Set-Cookie':cookie});
    }
    if(request.method==='GET') {
      const job=await jobCookie(request,token);if(!job)return json({error:'Yorum aktarımı oturumu bulunamadı. Bağlantıyı yeniden gönderin.'},400);
      const {data:run}=await(await provider('actor-runs/'+job.id,token)).json();if(['FAILED','ABORTED','TIMED-OUT'].includes(run.status))return json({error:'Yorum servisi aktarımı tamamlayamadı. Yeniden deneyin.'},502);
      if(run.status!=='SUCCEEDED')return json({status:run.status,count:run.stats?.outputItems||0});
      const offset=Number(url.searchParams.get('offset')||0);if(!Number.isInteger(offset)||offset<0||offset>20000)return json({error:'Geçersiz sayfa.'},400);
      const r=await provider(`datasets/${run.defaultDatasetId}/items?format=json&offset=${offset}&limit=1000`,token),items=await r.json(),total=Number(r.headers.get('x-apify-pagination-total')||items.length);
      if(total>=10000)return json({error:'Yorum toplama sınırına ulaşıldı. Eksik listeyle çekiliş başlatılmadı.'},422);
      if(items.some(c=>c.error))return json({error:'Gönderiye veya yorumlara erişilemedi. Herkese açık bir gönderi kullanın.'},422);
      if(job.mode==='thousand'&&(total<1000||total>1000||offset!==0))return json({error:`1.000 yorum hedefi karşılanmadı: servis ${total} kayıt döndürdü. Bu sağlayıcı ücretsiz Apify hesaplarında 15 yorumla sınırlıdır; ücretli planı ve gönderinin yorum sayısını kontrol edin. Eksik liste çekilişe alınmadı.`},422);
      const comments=items.flatMap(c=>[providerComment(c),...(c.replies||[]).map(r=>providerComment(r,true))]);
      if(comments.some(c=>!c.id))return json({error:'Yorum servisi kimliği eksik kayıt döndürdü; liste yüklenmedi.'},422);
      if(job.mode==='thousand'&&normalizeComments(comments).length<1000)return json({error:'1.000 farklı yorum alınamadı. Tekrarlanan kayıtlar hedefe sayılmadı; eksik liste yüklenmedi.'},422);
      return json({status:'SUCCEEDED',comments,count:total,nextOffset:offset+items.length<total?offset+items.length:null,capped:total>=10000});
    }
  }
  return json({error:'Bu uç nokta veya yöntem desteklenmiyor.'},404);
}
async function limitedBody(request) {if(Number(request.headers.get('content-length'))>12000000)throw Error('İstek en fazla 12 MB olabilir.');const text=await request.text();if(text.length>12000000)throw Error('İstek en fazla 12 MB olabilir.');return JSON.parse(text);}

export function createService(standalone,fetcher,protocol='https:') {
  return async function service(path,init={}) {
    if(!standalone&&protocol!=='file:'){
      try{const response=await fetcher(path,init);if(response.status===413)return Response.json({error:'Yorum listesi sunucu sınırını aşıyor. Daha küçük bir liste kullanın.'},{status:413});const text=await response.text();let data;try{data=JSON.parse(text);}catch{return Response.json({error:'Bu önizlemede yorum sunucusu bağlı değil. İndirilebilir sürümü kullanabilir veya demo ve JSON aktarımıyla devam edebilirsin.'},{status:502});}
        if(!data||typeof data!=='object')return Response.json({error:'Sunucudan geçerli bir yanıt alınamadı. Daha sonra yeniden dene.'},{status:502});
        return Response.json(data,{status:response.status});
      }catch{return Response.json({error:'Sunucuya bağlanılamadı. Bağlantını kontrol et veya indirilebilir sürümü kullan.'},{status:503});}
    }
    if(path==='/api/cekilisyap/status')return Response.json({configured:false});
    if(path==='/api/cekilisyap/draw')try{const body=JSON.parse(init.body),comments=normalizeComments(body.comments),rules=validateRules(body.rules),eligible=filterComments(comments,rules).filter(c=>c.eligible),selected=draw(eligible,rules.winners,rules.backups),snapshot=JSON.stringify({rules,comments:eligible.map(({id,username,text,timestamp})=>({id,username,text,timestamp}))}),bytes=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(snapshot)));return Response.json({...selected,id:crypto.randomUUID(),date:new Date().toISOString(),hash:Array.from(bytes).map(n=>n.toString(16).padStart(2,'0')).join(''),count:new Set(eligible.map(c=>c.username)).size,rules,engine:'browser'});}catch(e){return Response.json({error:e.message},{status:400});}
    return Response.json({error:'Bu dosya arayüz önizlemesidir; Instagram yorumlarını canlı çekmez. Canlı aktarım sunucu ve yorum servisi bağlantısı gerektirir. Demo veya JSON aktarımını kullanabilirsin.'},{status:503});
  };
}

export default {async fetch(request,env={}) {const url=new URL(request.url);try{if(url.pathname.startsWith('/api/cekilisyap/'))return await api(request,env,url);return json({error:'Bulunamadı.'},404);}catch(e){return json({error:e instanceof SyntaxError?'Geçersiz JSON.':e.message||'İstek tamamlanamadı.'},400);}}};
