import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert';
const bad=/trigger_incoming_webhook\/[A-Za-z0-9]{10,}\//,skip=new Set(['node_modules','.git']),hits=[];
(function walk(d){for(const f of fs.readdirSync(d,{withFileTypes:true})){if(skip.has(f.name)||f.name==='.env')continue;const p=path.join(d,f.name);
 if(f.isDirectory())walk(p);else if(!/\.(png|ico|zip)$/.test(f.name)&&bad.test(fs.readFileSync(p,'utf8')))hits.push(p)}})('.');
assert.deepEqual(hits,[],'Webhook URL found in tracked files: '+hits.join(', '));
console.log('no-secrets test passed');
