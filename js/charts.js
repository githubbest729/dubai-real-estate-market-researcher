// Dependency-free canvas bar charts with detailed gridlines and CSS-class-driven HTML tooltips.
// Colours/fonts come from CSS variables; tooltip layout and position come from classes in styles.css
// (no inline style attributes or CSSOM mutation). Bars are drawn on canvas; an overlay of buttons provides
// hover, keyboard-focus and tap targets, each containing its own tooltip element.
const cs=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const font=(w,s)=>`${w} ${s}px ${cs('--font')}`;
function setup(c,h){const dpr=devicePixelRatio||1,w=c.clientWidth;c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);const g=c.getContext('2d');g.scale(dpr,dpr);return {g,w}}
const grad=(g,x0,y0,x1,y1,a,b)=>{const k=g.createLinearGradient(x0,y0,x1,y1);k.addColorStop(0,cs(a));k.addColorStop(1,cs(b));return k};
const bar=(g,x,y,w,h,r)=>{g.beginPath();if(g.roundRect)g.roundRect(x,y,w,h,r);else g.rect(x,y,w,h);g.fill()};

// "Nice" axis: rounds to 1/2/2.5/5 x 10^k steps so gridlines land on readable values.
function nice(min,max,count=5){const span=(max-min)||1,raw=span/count,p=10**Math.floor(Math.log10(raw)),f=raw/p,
 step=(f<=1?1:f<=2?2:f<=2.5?2.5:f<=5?5:10)*p,lo=Math.floor(min/step+1e-9)*step,hi=Math.ceil(max/step-1e-9)*step,ticks=[];
 for(let v=lo;v<=hi+step/2;v+=step)ticks.push(+v.toFixed(10));return {lo,hi,step,ticks}}
const compact=v=>{const a=Math.abs(v);return a>=1e6?+(v/1e6).toFixed(1)+'M':a>=1e3?+(v/1e3).toFixed(1)+'k':String(+v.toFixed(2))};
// Major gridlines are solid; minor lines sit halfway between majors and are dashed and fainter.
function line(g,x0,y0,x1,y1,minor){g.save();g.strokeStyle=cs('--line');g.lineWidth=1;if(minor){g.globalAlpha=.55;g.setLineDash([3,4])}
 g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke();g.restore()}

// Builds the tooltip overlay (all layout via classes: .chart .tip-grid .tip-hit .tip .lv-N .cols-N .edge-l/.edge-r).
function overlay(c,{items,fmt,kind,cols,lv,enter,leave,click}){
 let wrap=c.parentNode;
 if(!wrap.classList.contains('chart')){wrap=document.createElement('div');wrap.className='chart';c.parentNode.insertBefore(wrap,c);wrap.appendChild(c)}
 const old=wrap.querySelector('.tip-grid');if(old)old.remove();
 const grid=document.createElement('div');grid.className=`tip-grid ${kind} cols-${cols}`;
 items.forEach((it,i)=>{
  const b=document.createElement('button');b.type='button';
  b.className='tip-hit'+(lv?` lv-${lv(it)}`:'')+(kind==='v'&&i===0?' edge-l':'')+(kind==='v'&&i===items.length-1?' edge-r':'');
  const name=it.label.replace(/\n/g,' ');
  b.setAttribute('aria-label',`${name}: ${fmt(it.value)}. ${it.note||''}`);
  const tip=document.createElement('span');tip.className='tip';tip.setAttribute('aria-hidden','true');
  const t=document.createElement('strong');t.className='tip-t';t.textContent=name;
  const v=document.createElement('span');v.className='tip-v';v.textContent=fmt(it.value);
  tip.append(t,v);
  if(it.note){const n=document.createElement('span');n.className='tip-n';n.textContent=it.note;tip.append(n)}
  b.append(tip);
  b.onmouseenter=()=>enter(i);b.onmouseleave=leave;b.onfocus=()=>enter(i);b.onblur=leave;b.onclick=()=>click(i);
  grid.append(b)});
 wrap.append(grid)}

export function vbars(c,{items,fmt,h:h0=230,onPick}){
 let sel=-1,hov=-1;const P={l:44,r:10,t:30,b:48},vals=items.map(i=>i.value),T=nice(0,Math.max(...vals)*1.06);
 const draw=()=>{const h=c.clientHeight||h0,{g,w}=setup(c,h),bw=(w-P.l-P.r)/items.length,base=h-P.b,Y=v=>base-(base-P.t)*(v-T.lo)/(T.hi-T.lo),act=hov>=0?hov:sel;
  g.textBaseline='middle';
  T.ticks.forEach((t,k)=>{const y=Math.round(Y(t))+.5;
   if(k<T.ticks.length-1)line(g,P.l,Math.round(Y(t+T.step/2))+.5,w-P.r,Math.round(Y(t+T.step/2))+.5,true);
   line(g,P.l,y,w-P.r,y,false);
   g.font=font(500,10.5);g.fillStyle=cs('--mute');g.textAlign='right';g.fillText(compact(t),P.l-7,y)});
  g.textBaseline='alphabetic';
  items.forEach((it,i)=>{const y=Y(it.value),bh=Math.max(2,base-y),wd=Math.min(bw*.62,72),x=P.l+i*bw+(bw-wd)/2,hl=i===act||it.hl;
   g.fillStyle=grad(g,0,base-bh,0,base,hl?'--bar-hl-a':'--bar-a',hl?'--bar-hl-b':'--bar-b');bar(g,x,base-bh,wd,bh,[6,6,0,0]);
   g.textAlign='center';g.fillStyle=cs('--ink');g.font=font(700,12.5);g.fillText(fmt(it.value),x+wd/2,base-bh-7);
   g.fillStyle=cs('--mute');g.font=font(500,11);it.label.split('\n').forEach((s,k)=>g.fillText(s,x+wd/2,base+17+k*13))})};
 overlay(c,{items,fmt,kind:'v',cols:items.length,lv:it=>Math.max(0,Math.min(20,Math.round(20*(it.value-T.lo)/(T.hi-T.lo)))),
  enter:i=>{hov=i;draw()},leave:()=>{hov=-1;draw()},click:i=>{sel=i;draw();onPick?.(items[i])}});
 c._redraw=draw;draw()}

export function hbars(c,{items,fmt,onPick}){
 let sel=-1,hov=-1;const top=6,ax=26,vals=items.map(i=>i.value),H=()=>c.clientHeight||items.length*34+top+ax,RH=()=>(H()-top-ax)/items.length;
 const draw=()=>{const h=H(),rh=RH(),{g,w}=setup(c,h),x0=132,x1=w-58,T=nice(Math.min(0,...vals),Math.max(0,...vals),Math.max(2,Math.floor((x1-x0)/56))),
  X=a=>x0+(a-T.lo)/(T.hi-T.lo)*(x1-x0),z=X(0),yb=top+items.length*rh,act=hov>=0?hov:sel;
  T.ticks.forEach((t,k)=>{const x=Math.round(X(t))+.5;
   if(k<T.ticks.length-1){const m=Math.round(X(t+T.step/2))+.5;line(g,m,top,m,yb,true)}
   line(g,x,top,x,yb,false);
   g.font=font(500,10.5);g.fillStyle=cs('--mute');g.textAlign='center';g.textBaseline='alphabetic';g.fillText(fmt(t),Math.min(Math.max(x,18),w-18),yb+17)});
  g.save();g.strokeStyle=cs('--mute');g.globalAlpha=.7;g.beginPath();g.moveTo(Math.round(z)+.5,top);g.lineTo(Math.round(z)+.5,yb);g.stroke();g.restore();
  g.textBaseline='middle';
  items.forEach((it,i)=>{const y=top+i*rh+rh/2,a=it.value,xa=Math.min(z,X(a)),bw=Math.max(2,Math.abs(X(a)-z)),hl=i===act||it.hl,neg=a<0;
   if(i===act){g.save();g.globalAlpha=.07;g.fillStyle=cs('--ink');g.fillRect(0,top+i*rh,w,rh);g.restore()}
   g.font=font(500,11.5);g.textAlign='left';g.fillStyle=cs(hl?'--ink':'--mute');g.fillText(it.label,4,y);
   g.fillStyle=grad(g,xa,0,xa+bw,0,hl?'--bar-hl-a':neg?'--neg-a':'--bar-a',hl?'--bar-hl-b':neg?'--neg-b':'--bar-b');
   bar(g,xa,y-9,bw,18,neg?[5,0,0,5]:[0,5,5,0]);
   g.font=font(700,11.5);g.fillStyle=cs('--ink');g.textAlign=neg?'right':'left';g.fillText(fmt(a),neg?xa-5:xa+bw+5,y)})};
 overlay(c,{items,fmt,kind:'h',cols:1,enter:i=>{hov=i;draw()},leave:()=>{hov=-1;draw()},click:i=>{sel=i;draw();onPick?.(items[i])}});
 c._redraw=draw;draw()}
