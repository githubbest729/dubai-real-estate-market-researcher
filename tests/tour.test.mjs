import fs from 'node:fs';import assert from 'node:assert';
const js=fs.readFileSync('js/tour.js','utf8'),css=fs.readFileSync('styles.css','utf8'),html=fs.readFileSync('index.html','utf8');
const classes=new Set([...js.matchAll(/tour-[a-z-]+/g)].map(m=>m[0]).filter(c=>!/^tour-(title|body)$/.test(c)||true));
['up','down','left','right'].forEach(d=>classes.add('tour-arrow-'+d));
for(const c of classes){if(c==='tour-title'||c==='tour-body'||c==='tour-arrow-'||c==='tour-arrow-svg'&&false)continue;assert.ok(css.includes('.'+c),'missing CSS rule for .'+c)}
assert.ok(/id="btnGuide"/.test(html),'guide button missing');
assert.equal((js.match(/\n \{title:/g)||[]).length,5,'expected 5 steps');
assert.ok(css.includes('tour-highlight-active')&&css.includes('tour-backdrop')&&css.includes('tour-arrow-up')&&css.includes('tour-arrow-down'));
console.log('tour test passed');
