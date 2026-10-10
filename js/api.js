// Gumloop webhook client.
export async function sendQuery(url,payload,timeout=30000){
 const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),timeout);
 try{
  const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:ctl.signal,referrerPolicy:'no-referrer',credentials:'omit'});
  const raw=await res.text();if(!res.ok)throw new Error(`Agent returned ${res.status}`);
  let data;try{data=JSON.parse(raw)}catch{data=raw}return {ok:true,text:format(data),raw:data}
 }catch(e){
  if(e.name==='AbortError')throw new Error('The agent took too long to respond. Try again.');
  if(e instanceof TypeError){ // likely CORS: dispatch anyway; response is unreadable
   await fetch(url,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain'},body:JSON.stringify(payload),credentials:'omit'});
   return {ok:true,opaque:true,text:'Query delivered to the Gumloop agent. The browser blocked reading the reply (CORS), so results will appear in your Gumloop run history or any destination configured in your flow.'}}
  throw e}finally{clearTimeout(t)}}
function format(d){if(typeof d==='string')return d;
 for(const k of ['output','result','response','answer','message','text'])if(typeof d?.[k]==='string')return d[k];
 if(d?.run_id)return `Agent run started.\nRun ID: ${d.run_id}${d.url?'\nTrack it in Gumloop: '+d.url:''}`;
 return JSON.stringify(d,null,2)}
