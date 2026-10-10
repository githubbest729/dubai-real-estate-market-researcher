// Dependency-free canvas bar charts. All colours and fonts come from CSS variables in styles.css;
// the canvas size is set via width/height attributes (no inline styles). Tap a bar to read its detail via onPick.
const cs=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const font=(w,s)=>`${w} ${s}px ${cs('--font')}`;
function setup(c,h){const dpr=devicePixelRatio||1,w=c.clientWidth;c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);const g=c.getContext('2d');g.scale(dpr,dpr);return {g,w}}
const grad=(g,x0,y0,x1,y1,a,b)=>{const k=g.createLinearGradient(x0,y0,x1,y1);k.addColorStop(0,cs(a));k.addColorStop(1,cs(b));return k};
const bar=(g,x,y,w,h,r)=>{g.beginPath();if(g.roundRect)g.roundRect(x,y,w,h,r);else g.rect(x,y,w,h);g.fill()};
export function vbars(c,{items,fmt,h=230,onPick}){let sel=-1;const P={l:8,r:8,t:28,b:48};
 const draw=()=>{const {g,w}=setup(c,h),bw=(w-P.l-P.r)/items.length,mx=Math.max(...items.map(i=>i.value))*1.12,base=h-P.b;
  g.strokeStyle=cs('--line');g.lineWidth=1;g.beginPath();g.moveTo(P.l,base+.5);g.lineTo(w-P.r,base+.5);g.stroke();
  items.forEach((it,i)=>{const bh=Math.max(2,(base-P.t)*it.value/mx),wd=Math.min(bw*.62,72),x=P.l+i*bw+(bw-wd)/2,y=base-bh,hl=i===sel||it.hl;
   g.fillStyle=grad(g,0,y,0,base,hl?'--bar-hl-a':'--bar-a',hl?'--bar-hl-b':'--bar-b');bar(g,x,y,wd,bh,[6,6,0,0]);
   g.textAlign='center';g.fillStyle=cs('--ink');g.font=font(700,12.5);g.fillText(fmt(it.value),x+wd/2,y-7);
   g.fillStyle=cs('--mute');g.font=font(500,11);it.label.split('\n').forEach((t,k)=>g.fillText(t,x+wd/2,base+16+k*13))})};
 c.onpointerdown=e=>{const i=Math.floor((e.clientX-c.getBoundingClientRect().left-P.l)/((c.clientWidth-P.l-P.r)/items.length));if(i>=0&&i<items.length){sel=i;draw();onPick?.(items[i])}};
 c._redraw=draw;draw()}
export function hbars(c,{items,fmt,onPick}){let sel=-1;const rh=34,h=items.length*rh+12;
 const draw=()=>{const {g,w}=setup(c,h),x0=132,x1=w-58,v=items.map(i=>i.value),mn=Math.min(0,...v),mx=Math.max(0,...v),X=a=>x0+(a-mn)/((mx-mn)||1)*(x1-x0),z=X(0);
  g.textBaseline='middle';
  items.forEach((it,i)=>{const y=6+i*rh+rh/2,a=it.value,xa=Math.min(z,X(a)),bw=Math.max(2,Math.abs(X(a)-z)),hl=i===sel||it.hl,neg=a<0;
   g.font=font(500,11.5);g.textAlign='left';g.fillStyle=cs(hl?'--ink':'--mute');g.fillText(it.label,4,y);
   g.fillStyle=grad(g,xa,0,xa+bw,0,hl?'--bar-hl-a':neg?'--neg-a':'--bar-a',hl?'--bar-hl-b':neg?'--neg-b':'--bar-b');
   bar(g,xa,y-9,bw,18,neg?[5,0,0,5]:[0,5,5,0]);
   g.font=font(700,11.5);g.fillStyle=cs('--ink');g.textAlign=neg?'right':'left';g.fillText(fmt(a),neg?xa-5:xa+bw+5,y)});
  g.strokeStyle=cs('--line');g.beginPath();g.moveTo(z+.5,2);g.lineTo(z+.5,h-2);g.stroke()};
 c.onpointerdown=e=>{const i=Math.floor((e.clientY-c.getBoundingClientRect().top-6)/rh);if(i>=0&&i<items.length){sel=i;draw();onPick?.(items[i])}};
 c._redraw=draw;draw()}
