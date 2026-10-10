import {redact,sanitize} from '../js/security.js';
import {forecast} from '../js/forecast.js';
import assert from 'node:assert';
const r=redact('mail a@b.com, Emirates ID 784-1990-1234567-1, call +971 50 123 4567');
assert.ok(r.count>=3&&!r.text.includes('a@b.com'));
assert.equal(sanitize('hi\u0007  there'),'hi there');
assert.ok(forecast([1,2,3,4,5,6],3).fc[0]>=6);
console.log('all tests passed');
