// Guided tour. CSP-safe by design: no inline attributes and no CSSOM writes. The highlight ring, backdrop,
// arrows and card position come entirely from classes in styles.css. Arrows are children of the target, so
// they follow it with no coordinate maths. Every node is built with createElement / createElementNS / text nodes.
import {$} from './ui.js';
const KEY='dmd_tour_completed',SVGNS='http://www.w3.org/2000/svg';
const nav=t=>$(`.tabs button[data-tab="${t}"]`);
export const STEPS=[
 {title:'Top controls and reporting',dir:'up',targets:()=>[$('.top .actions')],
  text:'The status pill shows whether you are online or offline. PDF opens your browser\'s print dialog so you can save the current dashboard as a PDF. Share sends a text summary through your device\'s share sheet, or copies it. The ? button reopens this guide.'},
 {title:'Pinned snapshot and communities',dir:'up',targets:()=>[$('#prefArea')?.closest('label')],
  text:'Communities marked ✓ have figures in the pinned 10 October 2026 snapshot. Any other community shows a "not available" card with a button that takes you to the live agent. Pick one to highlight it in the rent chart.'},
 {title:'Market benchmark charts',dir:'up',targets:()=>[$('#kpis')],
  text:'These cards summarise September sales, value, price per sq ft and rents. The charts below compare price sources, off-plan versus ready sales, and rents by community and size. Hover, focus or tap any bar to see its figure and source. Use "Rent chart" to switch between % change and median rent.'},
 {title:'Live AI research desk',dir:'down',targets:()=>[nav('ask')],
  text:'The dashboard shows a fixed snapshot. The Ask tab sends your question to your Gumloop research agent, which tracks 85+ Dubai communities. Choose which agents work on it, dictate with Voice, or tap Request snapshot.'},
 {title:'Compliance and audit trail',dir:'down',targets:()=>[nav('comp'),nav('audit')],
  text:'Compliance shows the UAE PDPL (Federal Decree-Law No. 45 of 2021) checklist and lets you download or erase your data. Personal identifiers are masked on your device before a query is sent. Audit lists every action in a SHA-256 hash chain you can export as JSON or CSV.'}];

export const tourDone=()=>{try{return localStorage.getItem(KEY)==='1'}catch{return false}};
const mark=()=>{try{localStorage.setItem(KEY,'1')}catch{}};
export const resetTour=()=>{try{localStorage.removeItem(KEY)}catch{}};

const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.append(document.createTextNode(text));return e};
function arrow(dir){const s=el('span',`tour-arrow tour-arrow-${dir}`);s.setAttribute('aria-hidden','true');
 const svg=document.createElementNS(SVGNS,'svg'),p=document.createElementNS(SVGNS,'path');
 svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('class','tour-arrow-svg');p.setAttribute('d','M12 21V5M5 12l7-7 7 7');
 svg.append(p);s.append(svg);return s}
const calm=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;

let S=null;
function clearStep(){if(!S)return;
 S.marked.forEach(e=>e.classList.remove('tour-highlight-active'));S.lifted.forEach(e=>e.classList.remove('tour-lift'));
 S.arrows.forEach(a=>a.remove());S.marked=[];S.lifted=[];S.arrows=[]}

function show(i){
 clearStep();S.i=i;const step=STEPS[i];
 if(!$('#tab-dash').classList.contains('active'))nav('dash')?.click();
 const targets=step.targets().filter(Boolean);
 for(const t of targets){t.classList.add('tour-highlight-active');S.marked.push(t);
  const lift=t.closest('.top,.tabs');if(lift){lift.classList.add('tour-lift');S.lifted.push(lift)}
  const a=arrow(step.dir);t.append(a);S.arrows.push(a)}
 const first=targets[0],behavior=calm()?'auto':'smooth';
 if(first&&!first.closest('.top,.tabs'))first.scrollIntoView?.({block:'start',behavior});else scrollTo?.({top:0,behavior});
 S.count.textContent=`Step ${i+1} of ${STEPS.length}`;S.title.textContent=step.title;S.body.textContent=step.text;
 S.dots.forEach((d,k)=>{d.classList.toggle('is-on',k===i);d.classList.toggle('is-done',k<i)});
 S.back.hidden=i===0;S.next.textContent=i===STEPS.length-1?'Done':'Next';S.skip.textContent=i===STEPS.length-1?'Close':'Skip';
 S.next.focus()}

function next(){S.i>=STEPS.length-1?finish('completed'):show(S.i+1)}
function finish(reason){if(!S)return;const {onEnd,opener}=S;clearStep();
 S.card.remove();S.backdrop.remove();document.body.classList.remove('tour-on');document.removeEventListener('keydown',S.key,true);
 mark();S=null;opener?.focus?.();onEnd?.(reason)}

export function startTour({onEnd}={}){
 if(S)return;
 const backdrop=el('div','tour-backdrop');backdrop.setAttribute('aria-hidden','true');
 const card=el('div','tour-card');card.setAttribute('role','dialog');card.setAttribute('aria-modal','true');card.setAttribute('aria-labelledby','tour-title');card.setAttribute('aria-describedby','tour-body');
 const meta=el('div','tour-meta'),count=el('span','tour-step'),skip=el('button','tour-skip','Skip');skip.type='button';meta.append(count,skip);
 const title=el('h2','tour-title');title.id='tour-title';const body=el('p','tour-body');body.id='tour-body';
 const dotsWrap=el('div','tour-dots'),dots=STEPS.map(()=>{const d=el('span','tour-dot');dotsWrap.append(d);return d});
 const actions=el('div','tour-actions'),back=el('button','btn ghost tour-back','Back'),nx=el('button','btn primary tour-next','Next');back.type='button';nx.type='button';actions.append(back,nx);
 card.append(meta,title,body,dotsWrap,actions);
 const key=e=>{
  if(e.key==='Escape'){e.preventDefault();finish('skipped')}
  else if(e.key==='ArrowRight'){e.preventDefault();next()}
  else if(e.key==='ArrowLeft'&&S.i>0){e.preventDefault();show(S.i-1)}
  else if(e.key==='Tab'){const f=[skip,back,nx].filter(b=>!b.hidden),a=document.activeElement,i=f.indexOf(a);
   if(i===-1||(e.shiftKey&&i===0)||(!e.shiftKey&&i===f.length-1)){e.preventDefault();f[e.shiftKey?f.length-1:0].focus()}}};
 S={i:0,card,backdrop,count,title,body,dots,back,next:nx,skip,marked:[],lifted:[],arrows:[],key,onEnd,opener:document.activeElement};
 skip.onclick=()=>finish(S.i===STEPS.length-1?'completed':'skipped');back.onclick=()=>show(S.i-1);nx.onclick=next;
 document.body.append(backdrop,card);document.body.classList.add('tour-on');document.addEventListener('keydown',key,true);
 show(0)}
