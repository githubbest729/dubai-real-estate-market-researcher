// Gumloop client. Posts to a same-origin proxy (no CORS), which forwards to the Gumloop webhook.
export async function sendQuery(url,payload,timeout=30000){
 const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),timeout);
 try{
  const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:ctl.signal,referrerPolicy:'no-referrer',credentials:'omit'});
  const raw=await res.text();
  if(res.status===404||res.status===405)throw new Error('Proxy not found. Run "npm start" locally or deploy to Vercel or Netlify (GitHub Pages cannot proxy).');
  if(res.status===429)throw new Error('Too many requests. Wait a minute and try again.');
  if(!res.ok)throw new Error(`Agent returned ${res.status}`);
  let data;try{data=JSON.parse(raw)}catch{data=raw}return {ok:true,text:format(data),raw:data}
 }catch(e){
  if(e.name==='AbortError')throw new Error('The agent took too long to respond. Try again.');
  throw e}finally{clearTimeout(t)}}
function format(d){if(typeof d==='string')return d||'The agent accepted the request.';
 for(const k of ['output','result','response','answer','message','text'])if(typeof d?.[k]==='string')return d[k];
 if(d?.run_id)return `Agent run started.\nRun ID: ${d.run_id}${d.url?'\nTrack it in Gumloop: '+d.url:''}`;
 return JSON.stringify(d,null,2)}
