// Client-side data protection: PII redaction, input hygiene, encrypted local storage (AES-GCM, non-extractable key).
// Shared encoders and a lookup table avoid per-call allocations on the hot path (hashing, encrypt, decrypt).
const ENC=new TextEncoder(),DEC=new TextDecoder(),HEX=Array.from({length:256},(_,i)=>i.toString(16).padStart(2,'0'));
// Non-blocking helpers: yield to the browser between chunks of work, or run work when the main thread is idle.
export const yieldToMain=()=>globalThis.scheduler?.yield?globalThis.scheduler.yield():new Promise(r=>setTimeout(r,0));
export const idle=(fn,timeout=2000)=>new Promise(res=>{const run=()=>Promise.resolve().then(fn).then(res,e=>{console.warn('idle task failed',e);res()});
 typeof requestIdleCallback==='function'?requestIdleCallback(run,{timeout}):setTimeout(run,50)});
const PATTERNS=[
 ['email',/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi],
 ['emirates_id',/\b784[-\s]?\d{4}[-\s]?\d{7}[-\s]?\d\b/g],
 ['iban',/\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/g],
 ['card',/\b(?:\d[ -]?){13,16}\b/g],
 ['phone',/(?:\+|00)?971[\s-]?\d[\d\s-]{7,10}\d|\b0\d{2}[\s-]?\d{3}[\s-]?\d{4}\b/g],
 ['passport',/\b[A-Z]{1,2}\d{7,8}\b/g]
];
export function sanitize(t,max=1500){return String(t).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,'').replace(/\s+/g,' ').trim().slice(0,max)}
export function redact(text){let out=text,count=0;const types=new Set();
 for(const [n,re] of PATTERNS){out=out.replace(re,()=>{count++;types.add(n);return `[REDACTED_${n.toUpperCase()}]`})}
 return {text:out,count,types:[...types]}}
const idb=()=>new Promise((res,rej)=>{const r=indexedDB.open('dmd-keys',1);r.onupgradeneeded=()=>r.result.createObjectStore('k');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
let keyP;
function getKey(){return keyP||(keyP=(async()=>{const db=await idb();
 const get=()=>new Promise((res,rej)=>{const q=db.transaction('k').objectStore('k').get('main');q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)});
 let k=await get();if(k)return k;
 const fresh=await crypto.subtle.generateKey({name:'AES-GCM',length:256},false,['encrypt','decrypt']);
 return new Promise((res,rej)=>{let out;const t=db.transaction('k','readwrite'),st=t.objectStore('k'),q=st.get('main');
  q.onsuccess=()=>{if(q.result)out=q.result;else{st.put(fresh,'main');out=fresh}};t.oncomplete=()=>res(out);t.onerror=()=>rej(t.error)})})())}
const b64=b=>{const u=new Uint8Array(b);let s='';for(let i=0;i<u.length;i+=8192)s+=String.fromCharCode(...u.subarray(i,i+8192));return btoa(s)};
const aad=name=>ENC.encode('dmd:'+name);
const unb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
export const cryptoOk=()=>!!(globalThis.crypto&&crypto.subtle&&globalThis.indexedDB);
export async function secureSet(name,obj){if(!cryptoOk())return;const iv=crypto.getRandomValues(new Uint8Array(12));
 const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:aad(name)},await getKey(),ENC.encode(JSON.stringify(obj)));
 localStorage.setItem('dmd:'+name,b64(iv)+'.'+b64(ct))}
export async function secureGet(name,fallback=null){try{const v=localStorage.getItem('dmd:'+name);if(!v)return fallback;const [i,c]=v.split('.');
 const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(i),additionalData:aad(name)},await getKey(),unb64(c));return JSON.parse(DEC.decode(pt))}catch{return fallback}}
export async function wipeAll(){Object.keys(localStorage).filter(k=>k.startsWith('dmd:')).forEach(k=>localStorage.removeItem(k));
 await new Promise(r=>{const q=indexedDB.deleteDatabase('dmd-keys');q.onsuccess=q.onerror=q.onblocked=()=>r()});keyP=null}
export async function sha256(s){const u=new Uint8Array(await crypto.subtle.digest('SHA-256',ENC.encode(s)));let o='';for(let i=0;i<u.length;i++)o+=HEX[u[i]];return o}
// Creates or loads the AES-GCM key when the browser is idle, so first use does not wait on key generation.
export const warmKey=()=>idle(async()=>{if(cryptoOk())await getKey()});
