// Pinned figures from the Gumloop "City snapshot", 10 October 2026. Only numbers stated there; nothing extrapolated.
export const n=v=>v.toLocaleString('en-US');
export const pct=(v,d=1)=>(v>0?'+':v<0?'−':'')+Math.abs(v).toFixed(d)+'%';
const PRO='Projectory, DLD home sales report, Sep 2026 (data as at 2 Oct 2026)';
export const SNAP={
 date:'10 October 2026',through:'30 September 2026',
 sep:{count:10108,value:21.30,countMoM:-9.5,valueMoM:-2.0,medPrice:1.28,medPriceMoM:10.7,psf:1639,psfAug:1692,psfMoM:-3.1,countYoY:-46.9,valueYoY:-51.3,
  azizi:{aug:1503,sep:454},rest:{aug:9660,sep:9654},
  off:{count:6960,share:68.9,countMoM:-15.7,value:12.27,valueMoM:-19.8},
  ready:{count:3148,countMoM:8.3,value:9.04,valueMoM:40.3}},
 pix:{index:205.8,mom:-0.5,yoy:-4.0,psf:1652,sales:10011,ready:{yoy:1.8,psf:1356},off:{yoy:-1.6,psf:1716},apt:-4.5,villa:-1.2},
 q3:{sales:32385,value:56.0,salesYoY:-35.8,valueYoY:-44.7,psf:1685,psfYoY:-2.0,apt:1693,villa:1555,medPrice:1.15,medPricePrev:1.32,offShare:73},
 rent:{apt:5.0,yield:5.6,
  beds:[{l:'Studio',rent:41000,chg:5.1},{l:'1-bed',rent:59999,chg:9.1},{l:'2-bed',rent:78000,chg:6.1},{l:'3-bed',rent:120000,chg:4.9}],
  communities:[
   {name:'Dubai Investment Park Second',short:'DIP Second',rent:62000,chg:19.2},
   {name:'Liwan',short:'Liwan',rent:54000,chg:11.3},
   {name:'Dubai Silicon Oasis',short:'Silicon Oasis',rent:55000,chg:9.6},
   {name:'Dubai Hills Estate',short:'Dubai Hills',rent:110000,chg:7.8},
   {name:'Jumeirah Village Circle',short:'JVC',rent:65000,chg:0.0},
   {name:'Business Bay',short:'Business Bay',rent:95000,chg:-1.0},
   {name:'Downtown Dubai',short:'Downtown',rent:144570,chg:-1.0},
   {name:'Dubai Marina',short:'Dubai Marina',rent:120000,chg:-1.1}],
  notInTable:['Palm Jumeirah','Jumeirah Beach Residence','Arabian Ranches']},
 communityDetail:{ // Per-community figures supplied by the Gumloop agent; a different window from the 10 Oct snapshot tables.
  'Downtown Jebel Ali':{asOf:'7 October 2026',source:'Dubai Data / Heart Homes (DLD registrations through 7 Oct 2026)',
   sales12m:3306,sales12mYoY:278.7,sepSales:498,sepSalesMcCone:464,medPrice:747000,medPriceYoY:-22.3,psf:1660,psfYoY:26.6,offShare:95.0,rent:51000,yield:8.80},
  'Jebel Ali':{asOf:'7 October 2026',source:'Dubai Data / DLD open data through 7 Oct 2026 (Unverified against official index. Ready apartments mapping to Discovery Gardens)',
   sales12m:172,sales12mYoY:-73.5,sepSales:0,medPrice:575000,medPriceYoY:-9.4,psf:967,psfYoY:15.5,offShare:0.0,rent:52000}
  },
 dldQ1:{value:252,valueYoY:31,tx:60303,txYoY:6},
 src:{pro:PRO}};

// ---- Community directory (tiers) ----
// "Dubai Investment Park Second" is added to the mid tier because it is a community with figures in this snapshot.
export const TIERS=[
 {label:'High volume',names:["Jumeirah Village Circle (JVC)","Business Bay","Downtown Dubai","Dubai Marina","Arjan","Dubai Hills Estate","Dubai Creek Harbour","Mohammed Bin Rashid City","Meydan","Palm Jumeirah","Jumeirah Lake Towers (JLT)","Al Furjan","Bur Dubai","Al Satwa","Al Jaddaf","Jumeirah Beach Residence (JBR)","Dubai Sports City","Dubai Harbour","Dubai Silicon Oasis","Al Wasl","Sheikh Zayed Road","Dubai Science Park","Jumeirah Village Triangle (JVT)","Town Square","Dubai South","Dubai Production City (IMPZ)"]},
 {label:'Mid volume',names:["Zabeel","Damac Hills","Deira","Umm Suqeim","Al Barsha","International City Phase 2","Dubai Land Residence Complex","Jumeirah","DIFC","Dubai Studio City","Barsha Heights (Tecom)","The Views","International City","Majan","Discovery Gardens","The Greens","Motor City","Mina Rashid","Liwan","Al Nahda","Bluewaters","Dubai Maritime City","Culture Village","City of Arabia","Al Warqa'a","Al Sufouh","Remraam","Dubai Festival City","The Gardens","Downtown Jebel Ali","Al Barari","Wasl Gate","Al Qusais","Dubai Investment Park (DIP)","Dubai Investment Park Second","Expo City","Jumeirah Golf Estates","Rukan","The Hills"]},
 {label:'Emerging and low volume',names:["Al Garhoud","Damac Hills 2","World Trade Center","Living Legends","Dubai Media City","Al Muhaisnah","Dubai Islands","Dubai Internet City","Mirdif","Nadd Al Hammar","Al Quoz","Nad Al Sheba","Ras Al Khor","Liwan 2","Al Badaa","Jebel Ali","Jumeirah Islands","Mudon","Dubai Waterfront","Al Warsan","Umm Al Sheif","Umm Ramool","Al Safa","Al Twar","Al Waha Villas","Bukadra","Hadaeq Sheikh Mohammed Bin Rashid","Dubai Industrial City","Madinat Hind","Academic City","Al Aweer","Al Lisaili","Arabian Ranches 3","The Valley","Damac Lagoons"]}];
export const allCommunities=()=>TIERS.flatMap(t=>t.names);
// Snapshot figures are keyed by the plain name, so "(JVC)" style suffixes are stripped before lookup. No fuzzy matching.
export const dataKey=l=>l.replace(/\s*\([^)]*\)\s*$/,'');
export const communityData=l=>SNAP.rent.communities.find(c=>c.name===dataKey(l))||null;
export const communityDetail=l=>SNAP.communityDetail[dataKey(l)]||null;
export const hasData=l=>!!(communityData(l)||communityDetail(l));
export const absentFromTable=l=>SNAP.rent.notInTable.includes(dataKey(l));
// Restores older saved preferences (plain names) to the current labels; unknown values fall back to city-wide.
export function normalizeArea(v){if(v==='all'||v==='auto')return v;const all=allCommunities();
 return all.includes(v)?v:(all.find(l=>dataKey(l)===v)||'all')}
const esc=k=>k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
// Finds communities mentioned in free text (word-boundary match on name and bracketed abbreviation; longest match wins).
const EXTRA={'Dubai Hills Estate':['dubai hills'],'Downtown Dubai':['downtown'],'Dubai Marina':['marina'],'Dubai Silicon Oasis':['dso'],'Palm Jumeirah':['the palm']};
let KEYS;
export function matchCommunities(text){
 KEYS||(KEYS=allCommunities().flatMap(l=>{const k=[dataKey(l).toLowerCase()],m=l.match(/\(([^)]*)\)\s*$/);if(m)k.push(m[1].toLowerCase());k.push(...(EXTRA[l]||[]));
  return k.map(key=>({l,key,re:new RegExp('(?<![a-z0-9])'+esc(key)+'(?![a-z0-9])')}))}));
 const low=String(text).toLowerCase(),hit=KEYS.filter(k=>k.re.test(low));
 return [...new Set(hit.filter(h=>!hit.some(o=>o.key.length>h.key.length&&o.key.includes(h.key))).map(h=>h.l))]}