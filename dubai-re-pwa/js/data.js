// Illustrative sample data (not live). Replace with DLD / RERA feeds or agent output.
export const AREAS={
 'Downtown Dubai':{apt:2650,villa:0,g:.0095,ya:5.4,yv:0},
 'Dubai Marina':{apt:2050,villa:0,g:.008,ya:6.1,yv:0},
 'Palm Jumeirah':{apt:3300,villa:4700,g:.011,ya:4.9,yv:3.8},
 'Business Bay':{apt:2150,villa:0,g:.009,ya:6.4,yv:0},
 'Jumeirah Village Circle':{apt:1250,villa:1500,g:.0075,ya:7.2,yv:5.6},
 'Dubai Hills Estate':{apt:2100,villa:2400,g:.0105,ya:5.8,yv:4.6}};
export function months(n=12){const d=new Date(),out=[];for(let i=n-1;i>=0;i--){const x=new Date(d.getFullYear(),d.getMonth()-i,1);out.push(x.toLocaleString('en',{month:'short',year:'2-digit'}))}return out}
export function series(area,type){const a=AREAS[area],vals=[];
 for(let i=0;i<12;i++){const f=(b)=>b*Math.pow(1+a.g,i-11)*(1+Math.sin(i*1.7+b)*.004);
  const apt=f(a.apt),vil=a.villa?f(a.villa):apt;
  vals.push(Math.round(type==='apartment'?apt:type==='villa'?vil:(a.villa?(apt+vil)/2:apt)))}return vals}
export const yieldFor=(a,t)=>t==='villa'&&a.yv?a.yv:t==='apartment'||!a.yv?a.ya:(a.ya+a.yv)/2;
