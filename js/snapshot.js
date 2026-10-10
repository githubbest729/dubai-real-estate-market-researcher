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
 dldQ1:{value:252,valueYoY:31,tx:60303,txYoY:6},
 src:{pro:PRO}};
export const ALIASES={'Dubai Investment Park Second':['dubai investment park','dip'],'Dubai Silicon Oasis':['silicon oasis','dso'],'Jumeirah Village Circle':['jvc'],'Dubai Hills Estate':['dubai hills'],'Downtown Dubai':['downtown'],'Dubai Marina':['marina'],'Jumeirah Beach Residence':['jbr']};
export const allCommunities=()=>[...SNAP.rent.communities.map(c=>c.name),...SNAP.rent.notInTable];
