/* BREW CHEMISTRY — one stain model used by the Brew Lab card, the ink type AND the buff tool.
   Each colourant: how it dissolves (basic/cationic dye, solvent dye, acid dye, or insoluble pigment/flake) and how hard
   it binds to a surface once dissolved (affinity). A dye only stains if the base can dissolve it; the base + thinner
   (and penetrant solvents) decide how deep the dissolved dye is driven in; binder locks dye into a surface film instead.
   Stain = (colourant affinity, weighted by how much of each you use) x load x carrier penetration x (1 - binder lock),
   then stain additives build on that rather than being bolted on flat. */
const PCHEM={nig:['solvent',.8],gv:['basic',.97],rhod:['basic',.9],sred:['solvent',.75],pblu:['solvent',.62],syel:['solvent',.5],tio2:['pigment',.03],cblk:['pigment',.12],iron:['pigment',.08],pgrn:['pigment',.12],hansa:['pigment',.05],alu:['metal',.02],bronze:['metal',.03],pruss:['pigment',.2],malg:['basic',.93],indg:['acid',.55],ochre:['pigment',.08],ultrab:['pigment',.06],cadred:['pigment',.06],umbe:['pigment',.12],graphite:['metal',.15],bism:['basic',.85],sorng:['solvent',.7],fluor:['acid',.35],qmag:['pigment',.12],diox:['pigment',.15],crox:['pigment',.05],dayglo:['pigment',.08],pearl:['metal',.01]};
const SOLB={alcohol:{basic:1,solvent:1,acid:.55},water:{basic:.85,solvent:.12,acid:1},oil:{basic:.15,solvent:.85,acid:.05},paint:{basic:.45,solvent:.5,acid:.35}};
/* share of each colourant by the parts you set (old recipes without parts: equal shares); pearl is a sparkle, not a colourant, once anything else is in */
function pShares(m){const o={};let t=0;for(const id of m.pigs){if(!PIGS[id]||(id==='pearl'&&m.pigs.size>1))continue;const a=Math.max(.1,(m.amt&&+m.amt[id])||1);o[id]=a;t+=a}for(const k in o)o[k]/=t||1;return o}
function stainModel(m){const a=m.add,P=k=>a.has(k)?1:0,sh=pShares(m),base=m.base||'alcohol',SB=SOLB[base]||SOLB.alcohol,hot=P('xylene')||P('mek');
 let S=0,dom=null,domV=0;const undis=[];
 for(const id in sh){const [sol,aff]=PCHEM[id]||['pigment',.05],w=sh[id];
  if(sol==='pigment'||sol==='metal'){/* insoluble particles only lodge in pores */S+=w*aff*.6;if(w*aff*.3>domV){domV=w*aff*.3;dom=id}continue}
  let d=SB[sol]??.5;if(hot&&sol==='solvent')d=Math.max(d,.9);if(P('pen'))d=Math.min(1,d+.15);
  S+=w*aff*(d+(1-d)*.15);if(d<.4&&w>.15)undis.push(PIGS[id].n);const v=w*aff*d;if(v>domV){domV=v;dom=id}}
 const C=Math.pow(clamp((m.pot||0)/100),.7);
 const Pn=clamp(({alcohol:.75,water:.4,oil:.55,paint:.3}[base]??.6)+((m.thin??35)-35)/150+.25*P('pen')+.22*P('xylene')+.25*P('mek')+.2*P('dot3')+.1*P('surf')+.15*P('garvey')+.06*P('methl')-.08*P('silica')-.1*P('wax'),.05,1);
 const L=clamp(clamp(((m.bind??25)-25)/100*.9,0,.6)+.15*P('rosin')+.2*P('wax')+.1*P('silica')+.06*P('fish')+(base==='paint'?.15:0),0,.8);
 let ghost=C*S*(.35+.85*Pn)*(1-L*.7);
 for(const b of [.55*P('vio'),.6*P('meth'),.55*P('garvey'),.35*P('bitu'),.2*P('oil'),.6*P('agno3'),.45*P('fecl'),.25*P('acid'),.3*P('dot3'),.12*P('silic'),.1*P('fish')])if(b)ghost=1-(1-ghost)*(1-b*(.55+.45*Pn)*(1-L*.5));
 ghost=clamp(ghost);
 const bite=clamp(.75*P('acid')+.5*P('mek')+.45*P('fecl')+.35*P('agno3')+.3*P('xylene')+.25*P('dot3'));
 const hold=clamp(ghost*.5+Pn*.25*ghost+bite*.35+.35*P('agno3')+.2*P('fecl')+.1*P('bitu')+(base==='oil'?.06:0),0,.95);
 return {S,C,P:Pn,L,ghost,hold,bite,dom,undis,sh}}
function mixKind(m){const sh=pShares(m);let p=0,mt=0;for(const id in sh){const g=PIGS[id];if(g.k==='paint')p+=sh[id];else if(g.k==='metal')mt+=sh[id]}/* a dash of opaque pigment tints a dye; it takes about a quarter of the colourant to make it an opaque paint */return m.base==='paint'||p>=.25?'paint':mt>=.5?'metal':'dye'}
function kmMix(items){/* True Kubelka-Munk (K/S) pigment/dye mixing weighted by real tinting strength */let ksR=0,ksG=0,ksB=0,wSum=0;const toLin=v=>Math.pow(clamp(v/255,.015,.985),2.2);const toKS=R=>(1-R)*(1-R)/(2*R);const fromKS=ks=>clamp(1+ks-Math.sqrt(ks*ks+2*ks),0,1);const toSRGB=v=>clamp(Math.round(Math.pow(v,1/2.2)*255),0,255);for(const it of items){const [r,g,b]=hex(it.c),w=it.ts||1;ksR+=toKS(toLin(r))*w;ksG+=toKS(toLin(g))*w;ksB+=toKS(toLin(b))*w;wSum+=w}if(!wSum)return '#d8dce0';return '#'+[toSRGB(fromKS(ksR/wSum)),toSRGB(fromKS(ksG/wSum)),toSRGB(fromKS(ksB/wSum))].map(v=>v.toString(16).padStart(2,'0')).join('')}
/* COLOUR MIXING — two-constant Kubelka-Munk. Every colourant ABSORBS (K) and solid paints also SCATTER (S); dyes are
   see-through and only absorb. A mix's K and S are the sums of each colourant's K and S times how much of it is in
   (its parts x the load), and the colour is a film of that mix over a white wall. So white really lightens (it
   scatters), a dash of a strong dye tints rather than takes over, a dye in white paint goes pastel, complementary
   colours grey each other out, and a light load looks see-through. Each colourant on its own, at the default
   load, comes out as its own swatch colour. */
const KM_H=4,KM_RG=.9,KM_C0=.65;
/* RGB only has three numbers, so mixing blue and yellow pigment in RGB gives grey. Instead each colour is turned into a
   smooth reflectance spectrum (Smits' RGB->spectrum method, 10 bands 380-720 nm, resampled to 18), the paints are mixed
   band by band, and the result is turned back into a colour with the CIE colour-matching functions (Wyman-Sloan-Shirley fit). */
const SMITS={w:[1,1,1,1,1,1,1,1,1,1],c:[.971,.9426,1.0007,1.0007,1.0007,1.0007,.1564,0,0,0],m:[1,1,.9685,.2229,0,.0458,.8369,1,1,.9959],y:[.0001,0,.1088,.6651,1,1,.9996,.9586,.9685,.984],
 r:[.1012,.0515,0,0,0,0,.8325,1.0149,1.0149,1.0149],g:[0,0,.0273,.7937,1,.9418,.1719,0,0,.0025],b:[1,1,.97,.62,.17,.02,.0003,.0369,.0483,.0496]};/* blue basis centred near 460 nm rather than in the violet: Smits' original reads violet once white lifts it, so blue + white went lilac */
const KM_L=Array.from({length:18},(_,i)=>395+i*18.5),KM_N=KM_L.length;
const kmSmAt=(arr,l)=>{const t=clamp((l-380)/340*9.999,0,9.999)-.5,i=Math.floor(t);if(i<0)return arr[0];if(i>=9)return arr[9];const f=t-i;return arr[i]*(1-f)+arr[i+1]*f};
const KM_SMB=Object.fromEntries(Object.entries(SMITS).map(([k,a])=>[k,KM_L.map(l=>kmSmAt(a,l))]));
function kmSpec(rgb){const [r,g,b]=rgb,S=KM_SMB;let o=new Array(KM_N).fill(0);const add=(k,v)=>{if(v>0)for(let i=0;i<KM_N;i++)o[i]+=S[k][i]*v};
 if(r<=g&&r<=b){add('w',r);if(g<=b){add('c',g-r);add('b',b-g)}else{add('c',b-r);add('g',g-b)}}
 else if(g<=r&&g<=b){add('w',g);if(r<=b){add('m',r-g);add('b',b-r)}else{add('m',b-g);add('r',r-b)}}
 else{add('w',b);if(r<=g){add('y',r-b);add('g',g-r)}else{add('y',g-b);add('r',r-g)}}
 return o.map(v=>clamp(v,.003,.995))}
const kmG=(l,u,a,b)=>Math.exp(-.5*((l-u)/(l<u?a:b))**2);
const KM_CMF=KM_L.map(l=>[1.056*kmG(l,599.8,37.9,31)+.362*kmG(l,442,16,26.7)-.065*kmG(l,501.1,20.4,26.2),.821*kmG(l,568.8,46.9,40.5)+.286*kmG(l,530.9,16.3,31.1),1.217*kmG(l,437,11.8,36)+.681*kmG(l,459,26,13.8)]);
function kmXYZ(sp){const o=[0,0,0];sp.forEach((r,i)=>{for(let k=0;k<3;k++)o[k]+=r*KM_CMF[i][k]});return o}
const kmToRGB=x=>[3.2406*x[0]-1.5372*x[1]-.4986*x[2],-.9689*x[0]+1.8758*x[1]+.0415*x[2],.0557*x[0]-.204*x[1]+1.057*x[2]];
const KM_WB=kmToRGB(kmXYZ(new Array(KM_N).fill(1)));
function kmRGB(sp){return kmToRGB(kmXYZ(sp)).map((v,i)=>v/KM_WB[i])}
function kmLin(hx,lo=.004){return hex(hx).map(v=>clamp(Math.pow(v/255,2.2),lo,.97))}
function kmParts(g){/* per-colourant K and S per band, calibrated so the colourant alone at the default load ~ its swatch */
 if(g._km)return g._km;const R=kmSpec(kmLin(g.c,g.k==='dye'?.004:.012));let K,S;
 if(g.k==='dye'){S=R.map(()=>0);K=R.map(r=>Math.max(0,-Math.log(Math.min(r,KM_RG*.999)/KM_RG)/(2*KM_H)))}
 else{const s0=g===PIGS.tio2?2.4:g===PIGS.cblk?.2:g.k==='metal'?(g===PIGS.pearl?.08:.5):.38;/* white scatters several times harder than coloured pigments */S=R.map(()=>s0);K=R.map(r=>s0*(1-r)*(1-r)/(2*r))}
 /* Calibrate the absorption so this colourant on its own lands on its swatch. The RGB->spectrum step leaves a dark colour's
    weak channel too dark or too light; fixing that afterwards by multiplying the mixed colour blows the error up in pale mixes
    (a deep blue dye with white came out pink). So the fix goes into K itself, band by band, weighted by which RGB channel each
    band feeds: then every mix that contains it is corrected in proportion to how much of it there is. */
 {const t=kmLin(g.c,g.k==='dye'?.004:.012),W=kmBandW(),C0=1/KM_C0;
  for(let it=0;it<4;it++){const one=kmRGB(K.map((k,i)=>kmFilm(k*C0,S[i]*C0,KM_RG))).map(v=>clamp(v/KM_RG*.995,1e-4,.999));
   const f=[0,1,2].map(c=>g.k==='dye'?clamp(Math.log(t[c])/Math.log(one[c]),.2,5):clamp(((1-t[c])**2/(2*t[c]))/((1-one[c])**2/(2*one[c])),.2,5));
   for(let i=0;i<KM_N;i++)K[i]*=Math.pow(f[0],W[i][0])*Math.pow(f[1],W[i][1])*Math.pow(f[2],W[i][2])}}
 return g._km={K,S}}
let _kmBW=null;function kmBandW(){/* how much each band feeds linear R, G and B */if(_kmBW)return _kmBW;_kmBW=KM_CMF.map(x=>{const v=kmToRGB(x).map((u,i)=>Math.max(0,u/KM_WB[i])),s=v[0]+v[1]+v[2]||1;return v.map(u=>u/s)});return _kmBW}
function kmFilm(K,S,Rg){/* reflectance of a KM layer of thickness KM_H over a backing of reflectance Rg */
 S=Math.max(S,1e-5);const a=1+K/S,b=Math.sqrt(a*a-1),x=b*S*KM_H;if(x>30)return a-b;const ct=Math.cosh(x)/Math.sinh(x);return (1-Rg*(a-b*ct))/(a-Rg+b*ct)}
/* the round trip RGB -> spectrum -> RGB isn't exact, so correct by what a plain white film does */
/* OKLab, for lightening a colour with white while keeping its hue */
function okFromLin(c){const l=Math.cbrt(.4122214708*c[0]+.5363325363*c[1]+.0514459929*c[2]),m=Math.cbrt(.2119034982*c[0]+.6806995451*c[1]+.1073969566*c[2]),s=Math.cbrt(.0883024619*c[0]+.2817188376*c[1]+.6299787005*c[2]);return [.2104542553*l+.793617785*m-.0040720468*s,1.9779984951*l-2.428592205*m+.4505937099*s,.0259040371*l+.7827717662*m-.808675766*s]}
function okToLin(o){const l=(o[0]+.3963377774*o[1]+.2158037573*o[2])**3,m=(o[0]-.1055613458*o[1]-.0638541728*o[2])**3,s=(o[0]-.0894841775*o[1]-1.291485548*o[2])**3;return [4.0767416621*l-3.3077115913*m+.2309699292*s,-1.2684380046*l+2.6097574011*m-.3413193965*s,-.0041960863*l-.7034186147*m+1.707614701*s]}
function mixColor(m){if(m.add.has('etch'))return '#ece6d6';
 /* WHITE IN A MIX. White pigment lightens a colour by scattering light back out of it; the colour's hue hardly moves (blue + white
    is light blue, red + white is pink). Pushing white through the spectral mix did move the hue (deep blue went lilac or pink),
    so the colourants are mixed with each other first and the white is then worked in as a tint: lightness rises and chroma
    falls by how much white there is against how strong the colourants are (a strong dye takes a lot of white to go pale). */
 if(!m._noWhite){const sh0=pShares(m),wSh=(sh0.tio2||0)+(m.base==='paint'&&!m.pigs.has('tio2')?.2:0);let cs=0;for(const id in sh0)if(id!=='tio2'&&PIGS[id]&&PIGS[id].k!=='metal')cs+=sh0[id]*(PIGS[id].ts||3)/3;
  if(wSh>.001&&cs>0){const pg=new Set([...m.pigs].filter(id=>id!=='tio2')),c0=mixColor({...m,pigs:pg,_noWhite:1}),ws=wSh*1.6,f=ws/(ws+cs);
   const o=okFromLin(kmLin(c0,1e-5)),w=okFromLin(kmLin(PIGS.tio2.c,1e-5)),L=o[0]+(w[0]-o[0])*Math.pow(f,.85),k=Math.pow(1-f,.6),o2=[L,o[1]*k+w[1]*(1-k),o[2]*k+w[2]*(1-k)];
   let c='#'+okToLin(o2).map(v=>clamp(Math.round(Math.pow(clamp(v,0,1),1/2.2)*255),0,255).toString(16).padStart(2,'0')).join('');return c}}const a=m.add,sh=pShares(m),C=clamp((m.pot||0)/100,.02,1)/KM_C0;
 const K=new Array(KM_N).fill(0),S=new Array(KM_N).fill(0);const put=(km,c)=>{for(let i=0;i<KM_N;i++){K[i]+=km.K[i]*c;S[i]+=km.S[i]*c}};
 for(const id in sh)put(kmParts(PIGS[id]),sh[id]*C);
 /* extras that colour the mix are colourants too, at their own strength */
 const EX={vio:['#3f108a','dye',.35],meth:['#0a2882','dye',.35],garvey:['#5e0c6e','dye',.35],bitu:['#20140a','dye',.55],oil:['#3d2b12','dye',.15],fecl:['#6e3416','dye',.25],agno3:['#cbc4b8','paint',.25]};
 for(const k in EX)if(a.has(k)){const [c,kd,amt]=EX[k];put(kmParts({c,k:kd}),amt)}
 if(m.base==='oil')put(kmParts({c:'#8a6a3a',k:'dye'}),.04);
 if(m.base==='paint'&&!m.pigs.has('tio2')&&!m._noWhite)put(kmParts({c:'#f2efe6',k:'paint'}),.35);/* paint base carries a little filler */
 if(!Object.keys(sh).length&&!Object.keys(EX).some(k=>a.has(k)))return m.base==='paint'?'#f2efe6':'#d8dce0';
 let out=kmRGB(K.map((k,i)=>kmFilm(k,S[i],KM_RG))).map(v=>v/KM_RG*.995);/* a clean white film reads as the wall's white */
 /* the spectrum round trip shifts some colours a little: correct by each colourant's own shift, weighted by its share squared, so a colour on its own is exact and an even mix keeps its mixed hue */
 {const cor=[1,1,1];for(const id in sh){const g=PIGS[id],km=kmParts(g);if(!km.cor){const one=kmRGB(km.K.map((k,i)=>kmFilm(k,km.S[i],KM_RG))).map(v=>Math.max(1e-4,v/KM_RG*.995)),t=kmLin(g.c,1e-4);km.cor=t.map((v,i)=>clamp(v/one[i],.7,1.4))}for(let i=0;i<3;i++)cor[i]*=Math.pow(km.cor[i],sh[id]*sh[id])}out=out.map((v,i)=>v*cor[i])}
 let c='#'+out.map(v=>clamp(Math.round(Math.pow(clamp(v,0,1),1/2.2)*255),0,255).toString(16).padStart(2,'0')).join('');
 if(a.has('uv')){const h=hex(c),avg=(h[0]+h[1]+h[2])/3;c='#'+h.map(v=>clamp(Math.round(avg+(v-avg)*1.45+12),0,255).toString(16).padStart(2,'0')).join('')}
 return c}
function mixCompat(m){const a=m.add,warns=[];let curdle=0,clog=0;try{const u=stainModel(m).undis;if(u.length){clog=Math.max(clog,.2);warns.push(u.join(', ')+(u.length>1?' hardly dissolve':' hardly dissolves')+' in a '+m.base+' base — it sits as specks and barely stains')}}catch(_){}if(m.base==='water'&&(a.has('bitu')||a.has('oil'))){curdle=Math.max(curdle,.85);warns.push('Oil/bitumen separates in water — curdled, streaky flow')}if(m.base==='water'&&a.has('dot3')){curdle=Math.max(curdle,.65);warns.push('DOT 3 destabilises water-based binder — clumpy spits')}if((a.has('bitu')||m.bind>75)&&m.thin<25){clog=Math.max(clog,.75);warns.push('Too thick/unthinned — will starve & clog the nib')}if(a.has('etch')&&(m.base==='oil'||m.base==='paint')){curdle=Math.max(curdle,.5);warns.push('Oil/paint blocks etch acid from biting glass')}if(m.base==='water'&&[...m.pigs].some(id=>PIGS[id]&&PIGS[id].k==='metal')){clog=Math.max(clog,.45);warns.push('Metal flake settles & oxidises fast in water')}if(m.base==='water'&&(a.has('xylene')||a.has('mek')||a.has('silic'))){curdle=Math.max(curdle,.8);warns.push('Hot solvents / silicone separate in water — patchy, sputtery flow')}if(m.base==='water'&&a.has('rosin')){clog=Math.max(clog,.7);warns.push('Pine rosin precipitates in water — clogs the nib')}if(m.base==='water'&&(a.has('fish')||a.has('wax'))){curdle=Math.max(curdle,.78);warns.push('Fish oil / wax separates in water — patchy, hydrophobic flow')}if(a.has('silica')&&m.bind>65&&m.thin<25){clog=Math.max(clog,.65);warns.push('Heavy fumed silica + binder — thick gel may starve fine nibs')}if((a.has('fecl')||a.has('acid'))&&m.base==='paint'){curdle=Math.max(curdle,.55);warns.push('Strong acid coagulates opaque paint binder')}return {curdle,clog,warns}}
function mixProps(m){const a=m.add,cm=mixCompat(m);const tauMul=+((m.base==='oil'?1.4:m.base==='paint'?1.25:1)*(a.has('dot3')?1.85:1)*(a.has('ret')?1.55:1)*(a.has('fish')?1.48:1)*(a.has('bitu')?1.35:1)*(a.has('rosin')?1.30:1)*(a.has('silic')?1.22:1)*(a.has('pen')?.85:1)*(a.has('xylene')?.80:1)*(a.has('mek')?.70:1)*(a.has('methl')?.52:1)).toFixed(2);const viscMul=+((m.base==='oil'?1.25:m.base==='paint'?1.22:1)*(a.has('bitu')?1.6:1)*(a.has('silica')?1.55:1)*(a.has('rosin')?1.45:1)*(a.has('wax')?1.25:1)*(a.has('dot3')?1.15:1)*(a.has('fish')?.90:1)*(a.has('pen')?.78:1)*(a.has('xylene')?.78:1)*(a.has('garvey')?.76:1)*(a.has('mek')?.74:1)*(a.has('surf')?.72:1)*(a.has('methl')?.68:1)*(a.has('silic')?.86:1)*(1+(m.bind-m.thin)/220)).toFixed(2);const tyMul=+((a.has('silica')?2.35:1)*(a.has('wax')?1.55:1)*(a.has('methl')?.82:1)*(a.has('garvey')?.85:1)).toFixed(2);const cdMul=a.has('silica')?1.08:1;const bleedAdd=+((a.has('pen')?.35:0)+(a.has('xylene')?.30:0)+(a.has('garvey')?.26:0)+(a.has('surf')?.25:0)+(a.has('mek')?.24:0)+(a.has('dot3')?.18:0)+(a.has('methl')?.18:0)+(a.has('acid')?.16:0)+(a.has('fish')?.10:0)).toFixed(2);const corrosive=+(clamp((a.has('acid')?.68:0)+(a.has('fecl')?.64:0)+(a.has('mek')?.52:0)+(a.has('xylene')?.42:0)+(a.has('agno3')?.35:0)+(a.has('dot3')?.22:0)+(a.has('etch')?.85:0),0,1)).toFixed(2);const SMp=stainModel(m),pStain=SMp.ghost;const ghostBoost=+((a.has('agno3')?.36:0)+(a.has('garvey')?.34:0)+(a.has('fecl')?.30:0)+(a.has('acid')?.28:0)+(a.has('mek')?.24:0)+(a.has('meth')?.24:0)+(a.has('bitu')?.24:0)+(a.has('dot3')?.22:0)+(a.has('pen')?.22:0)+(a.has('xylene')?.20:0)+(a.has('vio')?.20:0)+(a.has('silic')?.16:0)+(a.has('oil')?.14:0)+(a.has('fish')?.12:0)+(pStain>.65?.12:0)).toFixed(2);const GHC={gv:'#5e24c4',malg:'#0c704c',fluor:'#76c814',bism:'#8f4a1c',rhod:'#c41868',pblu:'#1844b8',pruss:'#1844b8',indg:'#1844b8',sred:'#b81c22',sorng:'#d4520c',nig:'#4e2aa8',syel:'#b89a10'};/* the ghost takes the undertone of the colourant that actually stains most (by amount and how well it dissolves) */const ghostCol=a.has('garvey')?'#8a1698':a.has('agno3')?'#2c1e16':a.has('vio')?'#5e24c4':a.has('meth')?'#1844b8':(SMp.dom&&GHC[SMp.dom])?GHC[SMp.dom]:a.has('fecl')?'#6e3416':a.has('bitu')?'#3d2412':null;const skinOver=(m.base==='oil'||m.base==='paint'||a.has('bitu')||a.has('rosin')||a.has('fish')||m.bind>=58)?1:0;const matte=(a.has('wax')||(mixKind(m)==='paint'&&m.pot>=85))?1:0,pearl=m.pigs.has('pearl')?1:0,photoDark=a.has('agno3')?1:0;
 const kd=mixKind(m),strongDye=SMp.ghost>=.55||a.has('vio')||a.has('meth')||a.has('garvey'),FLC={alu:[232,236,242],bronze:[236,176,92],graphite:[170,178,190],pearl:'pearl'};
 let flt=null;if(kd==='paint'&&m.pigs.has('tio2')){let best=0;for(const id of m.pigs){const g=PIGS[id];if(id!=='tio2'&&g&&g.ts>=5&&g.ts>best){best=g.ts;flt=g.c}}}
 const fls=[...m.pigs].filter(id=>FLC[id]).map(id=>FLC[id]);
 const tex={bronze:kd==='dye'&&strongDye&&m.pot>=68?clamp((m.pot-60)/40):0,fish:0,wrinkle:0,gel:0,float:flt,rosin:a.has('rosin')?1:0,bitu:a.has('bitu')?1:0,chalk:kd==='paint'&&m.pot>=85?clamp((m.pot-80)/20):0,flash:a.has('methl')?1:0,level:a.has('surf')?clamp(.5+(m.thin-30)/60,.3,1):0,bite:(a.has('xylene')||a.has('mek'))?1:0,fecl:0,flake:fls.length?fls:null};
 return {tex,buff:buffFromMix(m,mixType(m),ghostCol),tauMul:clamp(tauMul,.42,3.2),viscMul:clamp(viscMul,.42,2.6),tyMul,cdMul,bleedAdd,corrosive,ghostBoost:clamp(ghostBoost,0,.85),ghostCol,curdle:cm.curdle,clog:cm.clog,warns:cm.warns,skinOver,matte,pearl,photoDark,base:m.base}}
function mixType(m){if(m.add.has('etch'))return 'etch';const kd=mixKind(m);if(kd==='metal')return 'chrome';if(kd==='paint')return m.base==='oil'?'oil':m.base==='water'?'water':'alcpaint';
 /* the base decides first: a water brew stays a water ink however strong the dye; in solvent bases the stain model picks the dye-ink type */
 if(m.base==='water')return 'water';const sm=stainModel(m);if(sm.ghost>=.55)return (sm.P>=.85&&(m.bind??25)<40&&(m.thin??35)>=50)?'bleed':'stain';if((m.pot||0)>=60&&sm.ghost>=.35)return (m.bind??25)>=45?'stain':'bleed';return (m.bind??25)>=60?'flow':'alcohol'}
