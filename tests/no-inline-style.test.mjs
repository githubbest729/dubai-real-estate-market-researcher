import fs from 'node:fs';import assert from 'node:assert';
const files=['index.html','offline.html','404.html','privacy.html','terms.html','app.js',...fs.readdirSync('js').filter(f=>f.endsWith('.js')).map(f=>'js/'+f)];
const bad=/style\s*=|\.style\b|setAttribute\(\s*['"]style|cssText/;
const hits=files.filter(f=>bad.test(fs.readFileSync(f,'utf8')));
assert.deepEqual(hits,[],'Inline style usage found (violates CSP style-src self): '+hits.join(', '));
console.log('no-inline-style test passed');
