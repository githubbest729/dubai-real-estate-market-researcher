// Linear-trend forecast with widening confidence band (illustrative, not financial advice).
export function forecast(v,h){const n=v.length,xs=v.map((_,i)=>i),mx=(n-1)/2,my=v.reduce((a,b)=>a+b,0)/n;
 const b=xs.reduce((s,x,i)=>s+(x-mx)*(v[i]-my),0)/xs.reduce((s,x)=>s+(x-mx)**2,0),a=my-b*mx;
 const sd=Math.sqrt(v.reduce((s,y,i)=>s+(y-(a+b*i))**2,0)/(n-2))||1;
 const fc=[],lo=[],hi=[];for(let i=1;i<=h;i++){const m=a+b*(n-1+i),w=1.28*sd*Math.sqrt(1+i/n);fc.push(Math.round(m));lo.push(Math.round(m-w));hi.push(Math.round(m+w))}
 return {fc,lo,hi,slope:b}}
