// Vercel serverless function. Set GUMLOOP_WEBHOOK_URL in Project Settings > Environment Variables.
const {handle}=require('../server/guard');
module.exports=async(req,res)=>{
 const bodyText=typeof req.body==='string'?req.body:req.body?JSON.stringify(req.body):'';
 const ip=String(req.headers['x-vercel-forwarded-for']||req.headers['x-forwarded-for']||'').split(',')[0].trim()||req.socket?.remoteAddress||'unknown';
 const r=await handle({method:req.method,headers:req.headers,ip,bodyText});
 res.status(r.status);res.setHeader('Cache-Control','no-store');
 for(const [k,v] of Object.entries(r.headers||{}))res.setHeader(k,v);
 res.json(r.body)};
