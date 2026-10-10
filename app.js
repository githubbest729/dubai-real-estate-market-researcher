import {$,$$,esc,lite,toast} from './js/ui.js';
import {sanitize,redact,secureGet,secureSet,wipeAll,cryptoOk} from './js/security.js';
import * as audit from './js/audit.js';
import {SNAP,ALIASES,allCommunities,n,pct} from './js/snapshot.js';
import {vbars,hbars} from './js/charts.js';
import {sendQuery} from './js/api.js';
import {createVoice,voiceSupported} from './js/voice.js';
import {exportPdf,shareReport,download} from './js/export.js';

// The Gumloop webhook URL is a server-side secret (GUMLOOP_WEBHOOK_URL). The browser only talks to this same-origin proxy.
const PROXY_PATH='/api/gumloop';

const AGENTS=[{id:'market',name:'Market Analyst',task:'Analyse prices, supply and trends'},{id:'compliance',name:'Compliance Reviewer',task:'Check RERA/DLD and data-protection considerations'},{id:'invest',name:'Investment Advisor',task:'Assess yield, risk and entry timing'}];
const state={prefs:{area:'all',rent:'chg',theme:'auto',agents:['market'],hits:{}},history:[],notes:'',consent:false,lastReport:''};
const session=crypto.randomUUID?crypto.randomUUID():String(Date.now());

async function savePrefs(){await secureSet('prefs',state.prefs)}
const currentArea=()=>{const p=state.prefs.area;if(p==='auto'){const h=Object.entries(state.prefs.hits).sort((x,y)=>y[1]-x[1])[0];return h?h[0]:'all'}return allCommunities().includes(p)?p:'all'};

function applyTheme(){document.documentElement.dataset.theme=state.prefs.theme;$('meta[name=theme-color]').content=state.prefs.theme==='dark'?'#09151D':'#0B1F2A'}

const facts=(el,rows)=>{$(el).innerHTML=rows.map(([k,v,s])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}${s?`<small>${esc(s)}</small>`:''}</dd></div>`).join('')};
const B=v=>'AED '+v.toFixed(2)+' billion';

function renderDashboard(){
 const S=SNAP,s=S.sep,area=currentArea(),R=S.rent;
 $('#asof').textContent=`City snapshot, ${S.date} · data to ${S.through}`;
 const c=R.communities.find(x=>x.name===area);
 $('#selCard').innerHTML=area==='all'?`<h2>City-wide apartments</h2><p><strong>${pct(R.apt)}</strong> registered rent change over 12 months; indicative gross yield <strong>${R.yield}%</strong>.</p>`
  :c?`<h2>${esc(c.name)}</h2><p>Median annual rent <strong>AED ${n(c.rent)}</strong>, <strong>${pct(c.chg)}</strong> over 12 months to ${S.through}.</p>`
  :`<h2>${esc(area)}</h2><p>Not in the apartment rent table of this snapshot, so no figure is shown.</p>`;
 $('#kpis').innerHTML=[[n(s.count),'September home sales',pct(s.countMoM)+' vs August',s.countMoM],['AED '+s.value.toFixed(2)+'B','September sales value',pct(s.valueMoM)+' vs August',s.valueMoM],['AED '+n(s.psf),'Median price per sq ft',pct(s.psfMoM)+' vs August',s.psfMoM],[pct(R.apt),'Apartment rents, 12 months','Gross yield '+R.yield+'%',0]]
  .map(([b,l,sub,d])=>`<div class="kpi"><span class="kpi-l">${esc(l)}</span><b>${esc(b)}</b><span class="kpi-sub ${d>0?'up':d<0?'down':''}">${esc(sub)}</span></div>`).join('');
 const set=(id,t)=>it=>$(id).textContent=t(it);
 vbars($('#cPsf'),{fmt:v=>n(v),items:[
  {label:'Aug 26\nProjectory',value:s.psfAug,note:'August 2026, Projectory (DLD registrations): AED 1,692 per sq ft.'},
  {label:'Sep 26\nProjectory',value:s.psf,hl:1,note:'September 2026, Projectory: AED 1,639, −3.1% from August. Mix changed, so price per sq ft and median price moved in opposite directions.'},
  {label:'Sep 26\nPIX raw',value:S.pix.psf,note:'September 2026, PropertyIndex PIX©: raw median AED 1,652 across 10,011 sales. Differs from Projectory by AED 13.'},
  {label:'Q3 26\nProp971',value:S.q3.psf,note:'Q3 2026, Prop971: AED 1,685, −2.0% on Q3 2025. Apartments AED 1,693; villas and townhouses AED 1,555.'}],onPick:set('#psfNote',i=>i.note)});
 vbars($('#cCount'),{fmt:n,items:[
  {label:'Off-plan',value:s.off.count,note:`Off-plan: ${n(s.off.count)} homes (${s.off.share}% of registrations), ${pct(s.off.countMoM)} vs August.`},
  {label:'Ready',value:s.ready.count,note:`Ready: ${n(s.ready.count)} homes, ${pct(s.ready.countMoM)} vs August.`}],onPick:set('#countNote',i=>i.note)});
 vbars($('#cValue'),{fmt:v=>v.toFixed(2),items:[
  {label:'Off-plan',value:s.off.value,note:`Off-plan value ${B(s.off.value)}, ${pct(s.off.valueMoM)} vs August.`},
  {label:'Ready',value:s.ready.value,note:`Ready value ${B(s.ready.value)}, ${pct(s.ready.valueMoM)} vs August.`}],onPick:set('#valueNote',i=>i.note)});
 const med=state.prefs.rent==='median';
 $('#rentTitle').textContent=med?'Median annual apartment rent by community (AED)':'Apartment rent change by community, 12 months (%)';
 hbars($('#cRent'),{fmt:med?n:v=>pct(v),items:R.communities.map(x=>({label:x.short,value:med?x.rent:x.chg,hl:x.name===area,note:`${x.name}: median annual rent AED ${n(x.rent)}, ${pct(x.chg)} over 12 months (Prop971, Ejari export of 6 Oct 2026).`})),onPick:set('#rentNote',i=>i.note)});
 vbars($('#cBeds'),{fmt:n,items:R.beds.map(b=>({label:b.l,value:b.rent,note:`${b.l}: median annual rent AED ${n(b.rent)}, ${pct(b.chg)} over 12 months.`})),onPick:set('#bedNote',i=>i.note)});
 facts('#fSep',[['Home sales',n(s.count),pct(s.countMoM)+' vs Aug · '+pct(s.countYoY)+' vs Sep 2025'],['Sales value',B(s.value),pct(s.valueMoM)+' vs Aug · '+pct(s.valueYoY)+' vs Sep 2025'],['Median registered price','AED '+s.medPrice.toFixed(2)+' million',pct(s.medPriceMoM)+' vs Aug'],['Median price per sq ft','AED '+n(s.psf),'from AED '+n(s.psfAug)+' in Aug ('+pct(s.psfMoM)+')'],['Off-plan',n(s.off.count)+' homes',`${s.off.share}% of registrations · ${pct(s.off.countMoM)} · value ${B(s.off.value)} (${pct(s.off.valueMoM)})`],['Ready',n(s.ready.count)+' homes',`${pct(s.ready.countMoM)} · value ${B(s.ready.value)} (${pct(s.ready.valueMoM)})`],['Azizi Venice',`${n(s.azizi.aug)} → ${n(s.azizi.sep)}`,'August to September sales'],['Rest of Dubai',`${n(s.rest.aug)} → ${n(s.rest.sep)}`,'August to September sales']]);
 const p=S.pix;facts('#fPix',[['Mix-adjusted index',String(p.index),pct(p.mom)+' on the month · '+pct(p.yoy)+' year on year'],['Raw median','AED '+n(p.psf)+' per sq ft',n(p.sales)+' sales'],['Ready','AED '+n(p.ready.psf)+' per sq ft',pct(p.ready.yoy)+' year on year'],['Off-plan','AED '+n(p.off.psf)+' per sq ft',pct(p.off.yoy)+' year on year'],['Apartments',pct(p.apt),'year on year'],['Villas',pct(p.villa),'year on year']]);
 const q=S.q3;facts('#fQ3',[['Residential sales',n(q.sales),pct(q.salesYoY)+' on Q3 2025'],['Sales value','AED '+q.value.toFixed(1)+' billion',pct(q.valueYoY)+' on Q3 2025'],['Median per sq ft','AED '+n(q.psf),pct(q.psfYoY)+' on Q3 2025'],['Apartments / villas & townhouses',`AED ${n(q.apt)} / ${n(q.villa)}`,'per sq ft'],['Median sale price',`AED ${q.medPrice.toFixed(2)} million`,`vs AED ${q.medPricePrev.toFixed(2)} million in Q3 2025`],['Off-plan share of sales',q.offShare+'%','Transaction prices, not asking prices']]);
 facts('#fRent',[['Apartment rents',pct(R.apt),'registered contracts (Ejari), not asking rents'],['Indicative gross yield',R.yield+'%','Median rent ÷ median ready sale price, apartments. Excludes service charges, vacancy, financing'],['Not in the apartment table',R.notInTable.join(', '),'No figure shown'],['Asking rents','Not included','Bayut and Property Finder pages were blocked or not a current Q3 release']]);
 const d=S.dldQ1;facts('#fDld',[['Latest DLD release read','Q1 2026','9 April 2026 · all real estate activity, not homes only, not Q3'],['All procedures','AED '+d.value+' billion',pct(d.valueYoY,0)+' year on year'],['Transactions',n(d.tx),pct(d.txYoY,0)+' year on year'],['DLD Residential Sales Price Index','Published through 2022','No current index to confirm the September per-sq-ft move'],['Status','Unverified','September and Q3 figures are third-party counts of DLD and Ejari records']]);
 state.lastReport=`Dubai city snapshot, ${S.date} (data to ${S.through})\nSeptember 2026: ${n(s.count)} home sales, ${B(s.value)}; ${pct(s.countMoM)} count and ${pct(s.valueMoM)} value vs August.\nOff-plan ${n(s.off.count)} (${s.off.share}%), ready ${n(s.ready.count)}. Median price AED ${s.medPrice} million; median AED ${n(s.psf)}/sq ft (${pct(s.psfMoM)}).\nPIX index ${p.index} (${pct(p.mom)} m/m, ${pct(p.yoy)} y/y).\nQ3 2026: ${n(q.sales)} sales, AED ${q.value}B, median AED ${n(q.psf)}/sq ft.\nRegistered apartment rents ${pct(R.apt)} over 12 months; indicative gross yield ${R.yield}%.\nUnverified against a DLD index release. Not investment advice.`+state.history.slice(0,1).map(x=>`\n\nLatest agent reply:\n${x.text}`).join('');
}

function renderPrefs(){
 $('#prefArea').innerHTML='<option value="all">City-wide (no highlight)</option><option value="auto">Auto (most asked)</option>'+allCommunities().map(x=>`<option>${esc(x)}</option>`).join('');
 const bind=(id,key)=>{const el=$(id);el.value=state.prefs[key];el.onchange=async()=>{state.prefs[key]=el.value;await savePrefs();applyTheme();renderDashboard();audit.log('preference_changed',{key});renderAudit()}};
 bind('#prefArea','area');bind('#prefRent','rent');bind('#prefTheme','theme')}

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

async function run({text,message,names,logExtra}){
 const btn=$('#send');btn.disabled=true;$('#snapBtn').disabled=true;$('#status').textContent='Agents working…';
 const st={};state.prefs.agents.forEach(id=>st[id]='running');renderPipeline(st);
 try{
  await audit.log(message?'snapshot_requested':'query_sent',{agents:state.prefs.agents,...logExtra,destination:'api.gumloop.com'});
  const res=await sendQuery(PROXY_PATH,{message:message||text,query:text,agents:names,workflow:'sequential',context:{community:currentArea(),snapshotDate:'2026-10-10',dataThrough:'2026-09-30'},notes:redact(state.notes).text,session,sentAt:new Date().toISOString(),source:'dubai-market-desk-pwa'});
  state.history.unshift({ts:Date.now(),agents:message?'City snapshot request':names.join(' → '),text:res.text});state.history=state.history.slice(0,20);
  state.prefs.agents.forEach(id=>st[id]='done');renderPipeline(st);await secureSet('history',state.history);await savePrefs();
  await audit.log(res.opaque?'query_delivered_opaque':'response_received',{});toast(res.opaque?'Query delivered':'Response received');
 }catch(e){state.prefs.agents.forEach(id=>st[id]='error');renderPipeline(st);await audit.log('query_failed',{reason:String(e.message).slice(0,80)});
  state.history.unshift({ts:Date.now(),agents:'Error',text:e.message+' Check your connection and try again.'});toast('Request failed')}
 finally{btn.disabled=false;$('#snapBtn').disabled=false;$('#status').textContent='Ready';renderResults();renderDashboard();renderAudit();renderCompliance()}
}
async function submit(){
 const raw=sanitize($('#q').value);if(!raw){toast('Enter a question first');return}
 if(!state.prefs.agents.length){toast('Select at least one agent');return}
 const r=redact(raw);$('#redactNote').textContent=r.count?`${r.count} personal item(s) masked before sending.`:'';
 const low=raw.toLowerCase();
 for(const nm of allCommunities())if([nm.toLowerCase(),...(ALIASES[nm]||[])].some(k=>low.includes(k)))state.prefs.hits[nm]=(state.prefs.hits[nm]||0)+1;
 await run({text:r.text,names:AGENTS.filter(a=>state.prefs.agents.includes(a.id)).map(a=>a.name),logExtra:{chars:raw.length,redactions:r.types}})}
async function requestSnapshot(){if(!state.prefs.agents.length){toast('Select at least one agent');return}
 await run({text:'City snapshot',message:'City snapshot',names:AGENTS.filter(a=>state.prefs.agents.includes(a.id)).map(a=>a.name),logExtra:{}})}

function setupNav(){
 const go=t=>{$$('.tab').forEach(s=>s.classList.toggle('active',s.id==='tab-'+t));$$('.tabs button').forEach(b=>b.classList.toggle('on',b.dataset.tab===t));scrollTo(0,0);if(t==='dash')renderDashboard()};
 $$('.tabs button').forEach(b=>b.onclick=()=>go(b.dataset.tab));
 const q=new URLSearchParams(location.search).get('tab');if(q&&$('#tab-'+q))go(q)}

function setupVoice(){
 const mic=$('#mic'),v=createVoice({onText:t=>$('#q').value=t,onState:on=>{mic.setAttribute('aria-pressed',on);mic.textContent=on?'⏹ Listening…':'🎤 Voice'},onError:e=>toast('Voice input: '+e)});
 if(!v){mic.disabled=true;mic.title='Not supported in this browser';return}
 mic.onclick=()=>{v.toggle();audit.log('voice_toggled',{})}}

function setupActions(){
 $('#send').onclick=submit;$('#snapBtn').onclick=requestSnapshot;
 $('#btnPdf').onclick=()=>{audit.log('export_pdf',{});exportPdf()};
 $('#btnShare').onclick=async()=>{const r=await shareReport('Dubai Market Desk report',state.lastReport);audit.log('share_report',{result:r});toast(r==='copied'?'Report copied':r==='shared'?'Shared':'Share cancelled')};
 $('#saveNotes').onclick=async()=>{state.notes=sanitize($('#notes').value,2000);await secureSet('notes',state.notes);audit.log('notes_saved',{chars:state.notes.length});toast('Notes saved')};
 $('#auditJson').onclick=()=>download('audit-log.json',audit.toJSON(),'application/json');
 $('#auditCsv').onclick=()=>download('audit-log.csv',audit.toCSV(),'text/csv');
 $('#exportData').onclick=()=>{audit.log('data_export',{});download('my-data.json',JSON.stringify({prefs:state.prefs,history:state.history,notes:state.notes,audit:JSON.parse(audit.toJSON())},null,2),'application/json')};
 $('#wipe').onclick=async()=>{if(!confirm('Erase all saved preferences, history, notes and the audit log from this device?'))return;await wipeAll();toast('All local data erased');setTimeout(()=>location.reload(),800)};
 $('#consentOk').onclick=async()=>{state.consent=true;await secureSet('consent',{at:Date.now()});$('#consent').hidden=true;await audit.log('consent_granted',{});renderCompliance();renderAudit()};
 const net=()=>{const o=navigator.onLine;$('#net').textContent=o?'Online':'Offline';$('#net').className='pill '+(o?'ok':'bad')};addEventListener('online',net);addEventListener('offline',net);net();
 addEventListener('resize',()=>['#cPsf','#cCount','#cValue','#cRent','#cBeds'].forEach(i=>$(i)._redraw?.()));
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
