// Tamper-evident audit log: each entry hashes the previous one (SHA-256 chain). Stores no raw query text.
// Boot-time work is kept off the critical path: verification yields to the main thread and is computed once,
// and writes are batched so the whole store is not re-encrypted after every single event.
import {secureGet,secureSet,sha256,yieldToMain} from './security.js';
const DAY=864e5,RETAIN=30*DAY;
let store={base:'0',entries:[]},loading=Promise.resolve(),verified=null,timer=0;
const flush=()=>{clearTimeout(timer);timer=0;return secureSet('audit',store)};
const persist=()=>{clearTimeout(timer);timer=setTimeout(flush,400)};
if(typeof document!=='undefined')document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&timer)flush()});
export function loadAudit(){return loading=(async()=>{store=await secureGet('audit',store);verified=null;
 const cut=Date.now()-RETAIN;let purged=false;while(store.entries.length&&store.entries[0].ts<cut){store.base=store.entries.shift().hash;purged=true}
 if(purged)await flush();return store.entries})()}
export async function log(action,detail={}){await loading;const prev=store.entries.length?store.entries.at(-1).hash:store.base;
 const e={ts:Date.now(),action,detail,prev};e.hash=await sha256(prev+e.ts+action+JSON.stringify(detail));
 store.entries.push(e);persist();return e}
// Computed once per load (shared by every caller); appending via log() keeps the chain valid, so the result stays true.
export function verify(force=false){if(force)verified=null;
 return verified||(verified=(async()=>{await loading;let p=store.base,i=0;
  for(const e of store.entries){if(e.prev!==p||e.hash!==await sha256(p+e.ts+e.action+JSON.stringify(e.detail)))return false;p=e.hash;if(++i%20===0)await yieldToMain()}
  return true})())}
export const entries=()=>store.entries;
export const toJSON=()=>JSON.stringify(store,null,2);
export const toCSV=()=>'timestamp,action,detail,hash\n'+store.entries.map(e=>[new Date(e.ts).toISOString(),e.action,JSON.stringify(e.detail).replace(/"/g,'""'),e.hash].map(v=>`"${v}"`).join(',')).join('\n');
