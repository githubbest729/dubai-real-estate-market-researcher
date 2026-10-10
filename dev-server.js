// Local/Codespaces dev server. Serves ONLY the public app files (allowlist) and proxies POST /api/gumloop
// through server/guard.js. Reads GUMLOOP_WEBHOOK_URL from the environment or an untracked .env file.
const http=require('http'),fs=require('fs'),path=require('path');
try{for(const l of fs.readFileSync(path.join(__dirname,'.env'),'utf8').split(/\r?\n/)){const m=l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);if(m&&!(m[1] in process.env))process.env[m[1]]=m[2].replace(/^["']|["']$/g,'')}}catch{}
const {handle}=require('./server/guard');
const PORT=process.env.PORT||3000,HOST=process.env.HOST||'127.0.0.1',ROOT=__dirname;
const PUBLIC=/^\/(?:(?:index|offline|404|privacy|terms)\.html|styles\.css|app\.js|sw\.js|service-worker\.js|sw-register\.js|manifest\.(?:json|webmanifest)|browserconfig\.xml|robots\.txt|sitemap\.xml|humans\.txt|favicon[\w.-]*|[\w-]+\.png|js\/[\w-]+\.js|icons\/[\w-]+\.png)?$/;
const TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.ico':'image/x-icon','.xml':'application/xml','.txt':'text/plain'};
const SEC={'X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'no-referrer'};
const send=(res,s,h,b)=>{res.writeHead(s,{...SEC,...h});res.end(b)};
http.createServer((req,res)=>{
 const u=new URL(req.url,'http://localhost');
 if(u.pathname==='/api/gumloop'){
  const chunks=[];let n=0,dead=false;
  req.on('data',c=>{n+=c.length;if(n>20000&&!dead){dead=true;send(res,413,{'Content-Type':'application/json'},'{"error":"Request too large"}');req.destroy()}else if(!dead)chunks.push(c)});
  req.on('end',async()=>{if(dead)return;
   const r=await handle({method:req.method,headers:req.headers,ip:req.socket.remoteAddress,bodyText:Buffer.concat(chunks).toString('utf8')});
   send(res,r.status,{'Content-Type':'application/json','Cache-Control':'no-store',...(r.headers||{})},JSON.stringify(r.body))});
  return}
 let p;try{p=decodeURIComponent(u.pathname)}catch{return send(res,400,{},'')}
 if(!PUBLIC.test(p))return send(res,404,{'Content-Type':'text/plain'},'Not found');
 if(p==='/')p='/index.html';
 fs.readFile(path.join(ROOT,p),(e,d)=>e?send(res,404,{'Content-Type':'text/plain'},'Not found'):send(res,200,{'Content-Type':TYPES[path.extname(p)]||'application/octet-stream','Cache-Control':'no-cache'},d));
}).listen(PORT,HOST,()=>console.log(`Dubai Market Desk on http://${HOST}:${PORT}`+(process.env.GUMLOOP_WEBHOOK_URL?'':'  (GUMLOOP_WEBHOOK_URL not set: AI calls will fail)')));
