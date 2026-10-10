'use strict';
// Shared server-side gatekeeper for the Gumloop proxy (dev server, Vercel function, Netlify function).
// The webhook URL lives ONLY in the GUMLOOP_WEBHOOK_URL environment variable. It never appears in code.
const AGENTS=new Set(['Market Analyst','Compliance Reviewer','Investment Advisor']);
const MAX_BODY=16*1024;
const PII=[[/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,'[REDACTED_EMAIL]'],[/\b784[-\s]?\d{4}[-\s]?\d{7}[-\s]?\d\b/g,'[REDACTED_EMIRATES_ID]'],[/\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/g,'[REDACTED_IBAN]'],[/\b(?:\d[ -]?){13,16}\b/g,'[REDACTED_CARD]'],[/(?:\+|00)?971[\s-]?\d[\d\s-]{7,10}\d|\b0\d{2}[\s-]?\d{3}[\s-]?\d{4}\b/g,'[REDACTED_PHONE]']];
const clean=(v,max)=>{if(typeof v!=='string')return '';let s=v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,'').replace(/\s+/g,' ').trim().slice(0,max);for(const [re,t] of PII)s=s.replace(re,t);return s};
const deny=(status,error,extra)=>({error,status,...extra});

// Best-effort limiter (in memory: per server instance). Use a platform/WAF limit for hard guarantees.
const hits=new Map();let day={d:'',n:0};
function limit(ip){const now=Date.now(),max=+process.env.RATE_PER_MIN||5,cap=+process.env.DAILY_CAP||300;
 const a=(hits.get(ip)||[]).filter(t=>now-t<60000);
 if(a.length>=max)return deny(429,'Too many requests. Wait a minute and try again.',{retry:60});
 const d=new Date().toISOString().slice(0,10);if(day.d!==d)day={d,n:0};
 if(day.n>=cap)return deny(429,'Daily request budget reached.',{retry:3600});
 a.push(now);hits.set(ip,a);day.n++;if(hits.size>5000)hits.clear();return null}

function check({method,headers:h={},ip='unknown',bodyText=''}){
 if(method!=='POST')return deny(405,'Method not allowed',{allow:'POST'});
 if(!/^application\/json\b/i.test(h['content-type']||''))return deny(415,'Content-Type must be application/json');
 const host=String(h['x-forwarded-host']||h.host||'').split(',')[0].trim();
 if(h.origin){let o;try{o=new URL(h.origin).host}catch{return deny(403,'Forbidden')}
  const ok=(process.env.ALLOWED_ORIGINS||'').split(',').map(s=>s.trim()).filter(Boolean);
  if(o!==host&&!ok.includes(h.origin))return deny(403,'Forbidden')}
 if(h['sec-fetch-site']&&!['same-origin','none'].includes(h['sec-fetch-site']))return deny(403,'Forbidden');
 if(Buffer.byteLength(bodyText)>MAX_BODY)return deny(413,'Request too large');
 let b;try{b=JSON.parse(bodyText)}catch{return deny(400,'Invalid JSON')}
 if(!b||typeof b!=='object'||Array.isArray(b))return deny(400,'Invalid body');
 const c=b.context&&typeof b.context==='object'?b.context:{};
 const payload={message:clean(b.message,1500),query:clean(b.query,1500),
  agents:(Array.isArray(b.agents)?b.agents:[]).filter(a=>AGENTS.has(a)).slice(0,3),workflow:'sequential',
  context:{community:clean(c.community,60),snapshotDate:clean(c.snapshotDate,10),dataThrough:clean(c.dataThrough,10)},
  notes:clean(b.notes,2000),session:clean(b.session,64),sentAt:clean(b.sentAt,40),source:'dubai-market-desk-pwa'};
 if(!payload.message&&!payload.query)return deny(400,'Empty request');
 const lim=limit(ip);if(lim)return lim;
 return {payload}}

async function forward(payload){
 const url=process.env.GUMLOOP_WEBHOOK_URL;
 try{const u=new URL(url);if(u.protocol!=='https:'||u.hostname!=='api.gumloop.com')throw 0}catch{return {status:500,body:{error:'Proxy not configured'}}}
 try{const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(25000),redirect:'error'});
  if(!r.ok)return {status:502,body:{error:'Agent unavailable'}};
  const t=(await r.text()).slice(0,65536);let body;try{body=JSON.parse(t)}catch{body={message:t}}
  return {status:200,body}}catch{return {status:502,body:{error:'Agent unavailable'}}}}

async function handle(req){const c=check(req);
 if(c.error)return {status:c.status,body:{error:c.error},headers:{...(c.retry?{'Retry-After':String(c.retry)}:{}),...(c.allow?{Allow:c.allow}:{})}};
 return forward(c.payload)}
module.exports={handle,check,clean};
