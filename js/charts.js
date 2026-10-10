// Dependency-free canvas charts with touch/pointer tooltips.
const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
function setup(c){const dpr=devicePixelRatio||1,w=c.clientWidth,h=+c.getAttribute('height');c.width=w*dpr;c.height=h*dpr;const g=c.getContext('2d');g.scale(dpr,dpr);return {g,w,h}}
export function lineChart(c,{labels,hist,fc,lo,hi}){
 const draw=hx=>{const {g,w,h}=setup(c),P={l:46,r:12,t:12,b:26},all=[...hist,...hi,...lo],mn=Math.min(...all)*.98,mx=Math.max(...all)*1.02,N=labels.length;
  const X=i=>P.l+i*(w-P.l-P.r)/(N-1),Y=v=>P.t+(1-(v-mn)/(mx-mn))*(h-P.t-P.b);
  g.font='11px system-ui';g.fillStyle=css('--mute');g.strokeStyle=css('--line');
  for(let k=0;k<=4;k++){const v=mn+(mx-mn)*k/4,y=Y(v);g.beginPath();g.moveTo(P.l,y);g.lineTo(w-P.r,y);g.stroke();g.fillText(Math.round(v),4,y+4)}
  labels.forEach((l,i)=>{if(i%Math.ceil(N/6)===0||i===N-1)g.fillText(l,Math.min(X(i)-14,w-40),h-8)});
  const n=hist.length;
  g.fillStyle=css('--acc2')+'33';g.beginPath();g.moveTo(X(n-1),Y(hist[n-1]));fc.forEach((_,i)=>g.lineTo(X(n+i),Y(hi[i])));[...fc].reverse().forEach((_,j)=>{const i=fc.length-1-j;g.lineTo(X(n+i),Y(lo[i]))});g.closePath();g.fill();
  g.lineWidth=2.5;g.strokeStyle=css('--acc');g.beginPath();hist.forEach((v,i)=>i?g.lineTo(X(i),Y(v)):g.moveTo(X(i),Y(v)));g.stroke();
  g.strokeStyle=css('--acc2');g.setLineDash([6,5]);g.beginPath();g.moveTo(X(n-1),Y(hist[n-1]));fc.forEach((v,i)=>g.lineTo(X(n+i),Y(v)));g.stroke();g.setLineDash([]);
  if(hx!=null){const i=Math.max(0,Math.min(N-1,Math.round((hx-P.l)/((w-P.l-P.r)/(N-1))))),v=i<n?hist[i]:fc[i-n],x=X(i);
   g.strokeStyle=css('--ink');g.lineWidth=1;g.beginPath();g.moveTo(x,P.t);g.lineTo(x,h-P.b);g.stroke();
   const t=`${labels[i]}: AED ${v}${i>=n?' (forecast)':''}`,tw=g.measureText(t).width+14,tx=Math.min(Math.max(x-tw/2,2),w-tw-2);
   g.fillStyle=css('--ink');g.fillRect(tx,P.t,tw,22);g.fillStyle=css('--card');g.fillText(t,tx+7,P.t+15)}};
 draw();c.onpointermove=c.onpointerdown=e=>draw(e.clientX-c.getBoundingClientRect().left);c.onpointerleave=()=>draw();c._redraw=draw}
export function barChart(c,{labels,values,highlight}){
 const draw=hx=>{const {g,w,h}=setup(c),P={l:8,r:8,t:18,b:46},mx=Math.max(...values)*1.15,bw=(w-P.l-P.r)/values.length;
  values.forEach((v,i)=>{const bh=(h-P.t-P.b)*v/mx,x=P.l+i*bw+bw*.15,y=h-P.b-bh;
   g.fillStyle=labels[i]===highlight?css('--acc2'):css('--acc');g.fillRect(x,y,bw*.7,bh);
   g.fillStyle=css('--ink');g.font='bold 12px system-ui';g.textAlign='center';g.fillText(v.toFixed(1)+'%',x+bw*.35,y-4);
   g.fillStyle=css('--mute');g.font='10px system-ui';const w2=labels[i].split(' ');g.fillText(w2.slice(0,2).join(' '),x+bw*.35,h-P.b+14);g.fillText(w2.slice(2).join(' '),x+bw*.35,h-P.b+26)});g.textAlign='left'};
 draw();c._redraw=draw}
