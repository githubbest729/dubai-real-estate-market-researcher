// Tamper-evident audit log: each entry hashes the previous one (SHA-256 chain). Stores no raw query text.
import {secureGet,secureSet,sha256} from './security.js';
const DAY=864e5,RETAIN=30*DAY;
let store={base:'0',entries:[]};
export async function loadAudit(){store=await secureGet('audit',store);
 const cut=Date.now()-RETAIN;while(store.entries.length&&store.entries[0].ts<cut){store.base=store.entries.shift().hash}
 await secureSet('audit',store);return store.entries}
export async function log(action,detail={}){const prev=store.entries.length?store.entries.at(-1).hash:store.base;
 const e={ts:Date.now(),action,detail,prev};e.hash=await sha256(prev+e.ts+action+JSON.stringify(detail));
 store.entries.push(e);await secureSet('audit',store);return e}
export async function verify(){let p=store.base;for(const e of store.entries){if(e.prev!==p||e.hash!==await sha256(p+e.ts+e.action+JSON.stringify(e.detail)))return false;p=e.hash}return true}
export const entries=()=>store.entries;
export const toJSON=()=>JSON.stringify(store,null,2);
export const toCSV=()=>'timestamp,action,detail,hash\n'+store.entries.map(e=>[new Date(e.ts).toISOString(),e.action,JSON.stringify(e.detail).replace(/"/g,'""'),e.hash].map(v=>`"${v}"`).join(',')).join('\n');
