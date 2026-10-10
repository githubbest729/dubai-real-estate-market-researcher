import {$,$$,esc,lite,toast} from './js/ui.js';
import {sanitize,redact,secureGet,secureSet,wipeAll,cryptoOk} from './js/security.js';
import * as audit from './js/audit.js';
import {AREAS,months,series,yieldFor} from './js/data.js';
import {forecast} from './js/forecast.js';
import {lineChart,barChart} from './js/charts.js';
import {sendQuery} from './js/api.js';
import {createVoice,voiceSupported} from './js/voice.js';
import {exportPdf,shareReport,download} from './js/export.js';

// Gumloop AI agent webhook – user inputs are transmitted here (after PII redaction).
const WEBHOOK_URL='https://api.gumloop.com/trigger_incoming_webhook/DUDswynapjkVUwbVHzY8BR/wXH7zl-JYywwBTkx68pS8S9Qj8r7CtpUywpuRuBh4uU';

const AGENTS=[{id:'market',name:'Market Analyst',task:'Analyse prices, supply and trends'},{id:'compliance',name:'Compliance Reviewer',task:'Check RERA/DLD and data-protection considerations'},{id:'invest',name:'Investment Advisor',task:'Assess yield, risk and entry timing'}];
const state={prefs:{area:'auto',type:'all',horizon:'6',theme:'auto',agents:['market'],hits:{}},history:[],notes:'',consent:false,lastReport:''};
const session=crypto.randomUUID?crypto.randomUUID():String(Date.now());

async function savePrefs(){await secureSet('prefs',state.prefs)}
const currentArea=()=>{if(state.prefs.area!=='auto')return state.prefs.area;const h=Object.entries(state.prefs.hits).sort((a,b)=>b[1]-a[1])[0];return h?h[0]:'Downtown Dubai'};

function applyTheme(){document.documentElement.dataset.theme=state.prefs.theme;$('meta[name=theme-color]').content=state.prefs.theme==='dark'?'#09151D':'#0B1F2A'}

function renderDashboard(){
 const area=currentArea(),a=AREAS[area],h=+state.prefs.horizon,type=state.prefs.type,v=series(area,type),f=forecast(v,h),lab=months(12),
  fl=[...Array(h)].map((_,i)=>{const d=new Date();d.setMonth(d.getMonth()+i+1);return d.toLocaleString('en',{month:'short',year:'2-digit'})}),
  cur=v.at(-1),yoy=((cur/v[0]-1)*100),fch=((f.fc.at(-1)/cur-1)*100);
 $('#kpis').innerHTML=[['AED '+cur.toLocaleString()+'/sqft',area],[(yoy>=0?'+':'')+yoy.toFixed(1)+'%','12-month change'],[yieldFor(a,type).toFixed(1)+'%','Gross rental yield'],[(fch>=0?'+':'')+fch.toFixed(1)+'%','Forecast, '+h+' months']]
  .map(([b,s])=>`<div class="kpi"><b>${esc(b)}</b><span>${esc(s)}</span></div>`).join('');
 lineChart($('#trend'),{labels:[...lab,...fl],hist:v,fc:f.fc,lo:f.lo,hi:f.hi});
 $('#trendNote').textContent=`Dashed line: linear-trend forecast with 80% range. Touch the chart to inspect values.`;
 const names=Object.keys(AREAS);barChart($('#yield'),{labels:names,values:names.map(n=>yieldFor(AREAS[n],type)),highlight:area});
 state.lastReport=`Dubai Market Desk report (${new Date().toLocaleDateString()})\nArea: ${area} | Type: ${type}\nPrice: AED ${cur}/sqft | 12m: ${yoy.toFixed(1)}% | Yield: ${yieldFor(a,type).toFixed(1)}%\nForecast (${h}m): AED ${f.fc.at(-1)}/sqft (range ${f.lo.at(-1)}–${f.hi.at(-1)})\n`+state.history.slice(0,1).map(x=>`\nLatest agent insight:\n${x.text}`).join('')+'\n\nSample data is illustrative. Not investment advice.';
}

function renderPrefs(){
 $('#prefArea').innerHTML='<option value="auto">Auto (most asked)</option>'+Object.keys(AREAS).map(n=>`<option>${esc(n)}</option>`).join('');
 for(const k of ['Area','Type','Horizon','Theme']){const el=$('#pref'+k);el.value=state.prefs[k.toLowerCase()];
  el.onchange=async()=>{state.prefs[k.toLowerCase()]=el.value;await savePrefs();applyTheme();renderDashboard();audit.log('preference_changed',{key:k.toLowerCase()});renderAudit()}}
}

function renderAgents(){
 $('#agentPick').innerHTML=AGENTS.map(a=>`<label><input type="checkbox" value="${a.id}" ${state.prefs.agents.includes(a.id)?'checked':''}> ${esc(a.name)}</label>`).join('');
 $$('#agentPick input').forEach(i=>i.onchange=async()=>{state.prefs.agents=$$('#agentPick input:checked').map(x=>x.value);await savePrefs();renderPipeline()});
 renderPipeline()}
function renderPipeline(st={}){
 $('#pipeline').innerHTML=AGENTS.filter(a=>state.prefs.agents.includes(a.id)).map(a=>`<li><strong>${esc(a.name)}</strong><div class="st">${esc(a.task)} – ${esc(st[a.id]||'waiting')}</div></li>`).join('')||'<li class="sub">Select at least one agent on the Ask tab.</li>'}

function renderResults(){
 $('#results').innerHTML=state.history.slice(0,5).map(r=>`<div class="result"><h3>${esc(r.agents)} · ${new Date(r.ts).toLocaleTimeString()}</h3>${lite(r.text)}</div>`).join('')}

async function renderCompliance(){
 const ok=await audit.verify(),https=location.protocol==='https:'||location.hostname==='localhost';
 const rows=[
  [https?'ok':'bad','Encrypted transport (HTTPS)',https?'All traffic is TLS-protected.':'Serve over HTTPS before real use.'],
  [cryptoOk()?'ok':'bad','Encryption at rest','AES-GCM with a non-extractable device key.'],
  ['ok','PII redaction before send','Emails, phones, Emirates ID, IBAN, cards and passports are masked.'],
  [state.consent?'ok':'warn','User consent',state.consent?'Consent recorded.':'Awaiting consent.'],
  ['ok','30-day retention','History and audit log older than 30 days are deleted automatically.'],
  [ok?'ok':'bad','Audit chain integrity',ok?'Hash chain verified.':'Tampering detected.'],
  ['warn','Data residency','Gumloop processing location is not verified as UAE-resident. Review before handling regulated data.'],
  [voiceSupported?'warn':'ok','Voice input',voiceSupported?'Your browser may send audio to its speech vendor.':'Voice input unavailable.']];
 $('#checks').innerHTML=rows.map(([c,t,d])=>`<li><span class="dot ${c==='ok'?'':c}"></span><div><strong>${esc(t)}</strong><div class="sub">${esc(d)}</div></div></li>`).join('')}

async function renderAudit(){
 const e=audit.entries().slice().reverse();
 $('#chainState').textContent=(await audit.verify()?'Chain verified.':'Chain broken.')+` ${e.length} entries. Query text is never logged.`;
 $('#audit').innerHTML=e.slice(0,100).map(x=>`<li><div><strong>${esc(x.action)}</strong><time>${new Date(x.ts).toLocaleString()}</time><code>${esc(JSON.stringify(x.detail))} · ${x.hash.slice(0,12)}</code></div></li>`).join('')||'<li class="sub">No activity yet.</li>'}

async function submit(){
 const raw=sanitize($('#q').value);if(!raw){toast('Enter a question first');return}
 if(!state.prefs.agents.length){toast('Select at least one agent');return}
 const r=redact(raw);if(r.count)$('#redactNote').textContent=`${r.count} personal item(s) masked before sending.`;else $('#redactNote').textContent='';
 const btn=$('#send');btn.disabled=true;btn.textContent='Sending…';$('#status').textContent='Agents working…';
 const st={};state.prefs.agents.forEach(id=>st[id]='running');renderPipeline(st);
 const names=AGENTS.filter(a=>state.prefs.agents.includes(a.id)).map(a=>a.name);
 for(const n of Object.keys(AREAS))if(raw.toLowerCase().includes(n.toLowerCase()))state.prefs.hits[n]=(state.prefs.hits[n]||0)+1;
 try{
  await audit.log('query_sent',{agents:state.prefs.agents,chars:raw.length,redactions:r.types,destination:'api.gumloop.com'});
  const res=await sendQuery(WEBHOOK_URL,{query:r.text,agents:names,workflow:'sequential',context:{area:currentArea(),type:state.prefs.type,horizon:+state.prefs.horizon},notes:redact(state.notes).text,session,sentAt:new Date().toISOString(),source:'dubai-market-desk-pwa'});
  state.history.unshift({ts:Date.now(),agents:names.join(' → '),text:res.text});state.history=state.history.slice(0,20);
  state.prefs.agents.forEach(id=>st[id]='done');renderPipeline(st);await secureSet('history',state.history);await savePrefs();
  await audit.log(res.opaque?'query_delivered_opaque':'response_received',{});toast(res.opaque?'Query delivered':'Response received');
 }catch(e){state.prefs.agents.forEach(id=>st[id]='error');renderPipeline(st);await audit.log('query_failed',{reason:String(e.message).slice(0,80)});
  state.history.unshift({ts:Date.now(),agents:'Error',text:e.message+' Check your connection and try again.'});toast('Request failed')}
 finally{btn.disabled=false;btn.textContent='Send query';$('#status').textContent='Ready';renderResults();renderDashboard();renderAudit();renderCompliance()}
}

function setupNav(){
 const go=t=>{$$('.tab').forEach(s=>s.classList.toggle('active',s.id==='tab-'+t));$$('.tabs button').forEach(b=>b.classList.toggle('on',b.dataset.tab===t));scrollTo(0,0);if(t==='dash')renderDashboard()};
 $$('.tabs button').forEach(b=>b.onclick=()=>go(b.dataset.tab));
 const q=new URLSearchParams(location.search).get('tab');if(q&&$('#tab-'+q))go(q)}

function setupVoice(){
 const mic=$('#mic'),v=createVoice({onText:t=>$('#q').value=t,onState:on=>{mic.setAttribute('aria-pressed',on);mic.textContent=on?'⏹ Listening…':'🎤 Voice'},onError:e=>toast('Voice input: '+e)});
 if(!v){mic.disabled=true;mic.title='Not supported in this browser';return}
 mic.onclick=()=>{v.toggle();audit.log('voice_toggled',{})}}

function setupActions(){
 $('#send').onclick=submit;
 $('#btnPdf').onclick=()=>{audit.log('export_pdf',{});exportPdf()};
 $('#btnShare').onclick=async()=>{const r=await shareReport('Dubai Market Desk report',state.lastReport);audit.log('share_report',{result:r});toast(r==='copied'?'Report copied':r==='shared'?'Shared':'Share cancelled')};
 $('#saveNotes').onclick=async()=>{state.notes=sanitize($('#notes').value,2000);await secureSet('notes',state.notes);audit.log('notes_saved',{chars:state.notes.length});toast('Notes saved')};
 $('#auditJson').onclick=()=>download('audit-log.json',audit.toJSON(),'application/json');
 $('#auditCsv').onclick=()=>download('audit-log.csv',audit.toCSV(),'text/csv');
 $('#exportData').onclick=()=>{audit.log('data_export',{});download('my-data.json',JSON.stringify({prefs:state.prefs,history:state.history,notes:state.notes,audit:JSON.parse(audit.toJSON())},null,2),'application/json')};
 $('#wipe').onclick=async()=>{if(!confirm('Erase all saved preferences, history, notes and the audit log from this device?'))return;await wipeAll();toast('All local data erased');setTimeout(()=>location.reload(),800)};
 $('#consentOk').onclick=async()=>{state.consent=true;await secureSet('consent',{at:Date.now()});$('#consent').hidden=true;await audit.log('consent_granted',{});renderCompliance();renderAudit()};
 const net=()=>{const o=navigator.onLine;$('#net').textContent=o?'Online':'Offline';$('#net').className='pill '+(o?'ok':'bad')};addEventListener('online',net);addEventListener('offline',net);net();
 addEventListener('resize',()=>{$('#trend')._redraw?.();$('#yield')._redraw?.()});
 matchMedia('(prefers-color-scheme:dark)').onchange=()=>renderDashboard()}

async function init(){
 await audit.loadAudit();
 state.prefs={...state.prefs,...await secureGet('prefs',{})};
 state.history=(await secureGet('history',[])).filter(h=>Date.now()-h.ts<30*864e5);
 state.notes=await secureGet('notes','');$('#notes').value=state.notes;
 state.consent=!!await secureGet('consent');$('#consent').hidden=state.consent;
 applyTheme();renderPrefs();renderAgents();setupNav();setupVoice();setupActions();renderResults();renderDashboard();
 await audit.log('session_start',{});await renderCompliance();await renderAudit()}
init();
