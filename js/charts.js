// Dependency-free canvas bar charts; tap/click a bar to read its detail via onPick.
const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
function setup(c,h){const dpr=devicePixelRatio||1,w=c.clientWidth;c.style.height=h+'px';c.width=w*dpr;c.height=h*dpr;const g=c.getContext('2d');g.scale(dpr,dpr);g.textBaseline='alphabetic';return {g,w}}
export function vbars(c,{items,fmt,h=230,onPick}){let sel=-1;const P={l:8,r:8,t:26,b:46};
 const draw=()=>{const {g,w}=setup(c,h),bw=(w-P.l-P.r)/items.length,mx=Math.max(...items.map(i=>i.value))*1.12;
  items.forEach((it,i)=>{const bh=(h-P.t-P.b)*it.value/mx,wd=bw*.72,x=P.l+i*bw+bw*.14,y=h-P.b-bh;
   g.fillStyle=i===sel||it.hl?css('--acc2'):css('--acc');g.fillRect(x,y,wd,bh);g.textAlign='center';
   g.fillStyle=css('--ink');g.font='bold 12px system-ui';g.fillText(fmt(it.value),x+wd/2,y-6);
   g.fillStyle=css('--mute');g.font='10.5px system-ui';it.label.split('\n').forEach((t,k)=>g.fillText(t,x+wd/2,h-P.b+14+k*12))})};
 c.onpointerdown=e=>{const i=Math.floor((e.clientX-c.getBoundingClientRect().left-P.l)/((c.clientWidth-P.l-P.r)/items.length));if(i>=0&&i<items.length){sel=i;draw();onPick?.(items[i])}};
 c._redraw=draw;draw()}
export function hbars(c,{items,fmt,onPick}){let sel=-1;const rh=32,h=items.length*rh+12;
 const draw=()=>{const {g,w}=setup(c,h),x0=142,x1=w-54,v=items.map(i=>i.value),mn=Math.min(0,...v),mx=Math.max(0,...v),X=a=>x0+(a-mn)/((mx-mn)||1)*(x1-x0),z=X(0);
  g.textBaseline='middle';
  items.forEach((it,i)=>{const y=6+i*rh+rh/2,a=it.value,xa=Math.min(z,X(a)),bw=Math.max(2,Math.abs(X(a)-z));
   g.font='11px system-ui';g.textAlign='left';g.fillStyle=css('--mute');g.fillText(it.label,4,y);
   g.fillStyle=i===sel||it.hl?css('--acc2'):a<0?css('--bad'):css('--acc');g.fillRect(xa,y-9,bw,18);
   g.font='bold 11px system-ui';g.fillStyle=css('--ink');g.textAlign=a<0?'right':'left';g.fillText(fmt(a),a<0?xa-4:xa+bw+4,y)});
  g.strokeStyle=css('--line');g.beginPath();g.moveTo(z,2);g.lineTo(z,h-2);g.stroke()};
 c.onpointerdown=e=>{const i=Math.floor((e.clientY-c.getBoundingClientRect().top-6)/rh);if(i>=0&&i<items.length){sel=i;draw();onPick?.(items[i])}};
 c._redraw=draw;draw()}
