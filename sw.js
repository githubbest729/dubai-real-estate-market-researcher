const V='dubai-desk-v3',STATIC=['./','index.html','offline.html','styles.css','app.js','manifest.json','sw-register.js','js/api.js','js/audit.js','js/charts.js','js/snapshot.js','js/export.js','js/security.js','js/voice.js','js/ui.js','icons/icon-192.png','icons/icon-512.png','favicon.ico'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(STATIC)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin)return; // never cache webhook/API traffic
  if(r.mode==='navigate'){e.respondWith(fetch(r).catch(()=>caches.match(r).then(m=>m||caches.match('offline.html'))));return}
  e.respondWith(caches.match(r).then(m=>{const n=fetch(r).then(res=>{if(res.ok)caches.open(V).then(c=>c.put(r,res.clone()));return res}).catch(()=>m);return m||n}));
});
