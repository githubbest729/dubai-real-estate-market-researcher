// Client-side data protection: PII redaction, input hygiene, encrypted local storage (AES-GCM, non-extractable key).
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
 k=await crypto.subtle.generateKey({name:'AES-GCM',length:256},false,['encrypt','decrypt']);
 await new Promise((res,rej)=>{const t=db.transaction('k','readwrite');t.objectStore('k').put(k,'main');t.oncomplete=res;t.onerror=()=>rej(t.error)});return k})())}
const b64=b=>btoa(String.fromCharCode(...new Uint8Array(b)));
const unb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
export const cryptoOk=()=>!!(globalThis.crypto&&crypto.subtle&&globalThis.indexedDB);
export async function secureSet(name,obj){if(!cryptoOk())return;const iv=crypto.getRandomValues(new Uint8Array(12));
 const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},await getKey(),new TextEncoder().encode(JSON.stringify(obj)));
 localStorage.setItem('dmd:'+name,b64(iv)+'.'+b64(ct))}
export async function secureGet(name,fallback=null){try{const v=localStorage.getItem('dmd:'+name);if(!v)return fallback;const [i,c]=v.split('.');
 const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(i)},await getKey(),unb64(c));return JSON.parse(new TextDecoder().decode(pt))}catch{return fallback}}
export async function wipeAll(){Object.keys(localStorage).filter(k=>k.startsWith('dmd:')).forEach(k=>localStorage.removeItem(k));
 await new Promise(r=>{const q=indexedDB.deleteDatabase('dmd-keys');q.onsuccess=q.onerror=q.onblocked=()=>r()});keyP=null}
export async function sha256(s){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))].map(b=>b.toString(16).padStart(2,'0')).join('')}
