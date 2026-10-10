// Zero-dependency dev server: serves this folder and proxies POST /api/gumloop to the Gumloop webhook.
// Usage: node dev-server.js  (PORT and GUMLOOP_WEBHOOK_URL can be overridden via environment)
const http=require('http'),https=require('https'),fs=require('fs'),path=require('path');
const PORT=process.env.PORT||3000;
const UPSTREAM=new URL(process.env.GUMLOOP_WEBHOOK_URL||'https://api.gumloop.com/trigger_incoming_webhook/DUDswynapjkVUwbVHzY8BR/wXH7zl-JYywwBTkx68pS8S9Qj8r7CtpUywpuRuBh4uU');
const TYPES={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.ico':'image/x-icon','.xml':'application/xml','.txt':'text/plain','.webmanifest':'application/manifest+json'};
const ROOT=__dirname;
http.createServer((req,res)=>{
 const u=new URL(req.url,'http://x');
 if(u.pathname==='/api/gumloop'){
  if(req.method!=='POST'){res.writeHead(405,{Allow:'POST'});return res.end()}
  const chunks=[];let size=0;
  req.on('data',c=>{size+=c.length;if(size>65536){res.writeHead(413);res.end();req.destroy()}else chunks.push(c)});
  req.on('end',()=>{
   const body=Buffer.concat(chunks);
   const up=https.request({hostname:UPSTREAM.hostname,path:UPSTREAM.pathname+UPSTREAM.search,method:'POST',headers:{'Content-Type':'application/json','Content-Length':body.length}},r=>{
    res.writeHead(r.statusCode,{'Content-Type':r.headers['content-type']||'application/json'});r.pipe(res)});
   up.on('error',e=>{res.writeHead(502,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Upstream unreachable',detail:e.code}))});
   up.setTimeout(25000,()=>up.destroy(new Error('timeout')));
   up.end(body)});
  return}
 let p=path.normalize(decodeURIComponent(u.pathname)).replace(/^(\.\.[\/\\])+/,'');
 if(p.endsWith('/'))p+='index.html';
 const f=path.join(ROOT,p);
 if(!f.startsWith(ROOT)||/(^|[\/\\])\.(git|env)/.test(p)){res.writeHead(403);return res.end()}
 fs.readFile(f,(e,d)=>{
  if(e){res.writeHead(404,{'Content-Type':'text/html'});return fs.createReadStream(path.join(ROOT,'404.html')).pipe(res)}
  res.writeHead(200,{'Content-Type':TYPES[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(d)});
}).listen(PORT,()=>console.log('Dubai Market Desk on http://localhost:'+PORT));
