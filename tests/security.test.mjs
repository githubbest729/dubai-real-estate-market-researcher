import {redact,sanitize} from '../js/security.js';
import {SNAP,pct} from '../js/snapshot.js';
import assert from 'node:assert';
const r=redact('mail a@b.com, Emirates ID 784-1990-1234567-1, call +971 50 123 4567');
assert.ok(r.count>=3&&!r.text.includes('a@b.com'));
assert.equal(sanitize('hi\u0007  there'),'hi there');
assert.equal(SNAP.sep.off.count+SNAP.sep.ready.count,SNAP.sep.count);
assert.equal(pct(-1.1),'−1.1%');
console.log('all tests passed');
