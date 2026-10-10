// Netlify function. Set GUMLOOP_WEBHOOK_URL in Site settings > Environment variables.
const {handle}=require('../../server/guard');
exports.handler=async event=>{const h=event.headers||{};
 const bodyText=event.isBase64Encoded?Buffer.from(event.body||'','base64').toString('utf8'):(event.body||'');
 const ip=h['x-nf-client-connection-ip']||String(h['x-forwarded-for']||'').split(',')[0].trim()||'unknown';
 const r=await handle({method:event.httpMethod,headers:h,ip,bodyText});
 return {statusCode:r.status,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...(r.headers||{})},body:JSON.stringify(r.body)}};
