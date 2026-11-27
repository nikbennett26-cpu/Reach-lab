/* BUFF BEHAVIOUR (researched): dye inks soak in and ghost back — buff-proof stain dyes hardest; pigment paints sit on top and wipe clean;
   glass etch is damage to the glass itself and can't be buffed. GH = residue straight after buffing, GHOST = how strongly the tag comes back. */

const GHOST={stain:.34,bleed:.3,future:.16,alcohol:.13,flow:.09};

function addWater(p,r,amt){for(let gy=Math.max(0,Math.floor((p.y-r)/C));gy<=Math.min(GH_-1,Math.floor((p.y+r)/C));gy++)for(let gx=Math.max(0,Math.floor((p.x-r)/C));gx<=Math.min(GW-1,Math.floor((p.x+r)/C));gx++){const d=Math.hypot(gx*C+C/2-p.x,gy*C+C/2-p.y)/r;if(d<1){const i=gy*GW+gx;water[i]=Math.min(1,water[i]+amt*(1-d))}}waterOn=true}
let bgPat=null,bgPatW=0;
/* diluted dye: the ink's colour, more saturated and much lighter — the lilac of a purple wash, the pink of a red one */
const washTint=c=>{const h=hex(c),m=(h[0]+h[1]+h[2])/3,sat=h.map(v=>Math.max(0,Math.min(255,m+(v-m)*2.4)));return mixHex('#'+sat.map(v=>Math.round(v).toString(16).padStart(2,'0')).join(''),'#ffffff',.12)};

/* the buff's ghost (what's left after scrubbing) is worked out only where the rag goes, a tile at a time, just before
   the rag first touches it — not the whole wall at once, which stalled the first rub after every tag */

/* GHOST VISIBILITY: the ghost is soaked into the wall UNDER the ink. It stays hidden while ink covers it and only
   reads where the buff has lifted the ink. ghostV = ghostC minus (live ink, softly dilated), rebuilt in dirty rects. */
var gvR,grainV;
function gvMark(a,b,c,d){if(!gvR)gvR=[a,b,c,d];else{if(a<gvR[0])gvR[0]=a;if(b<gvR[1])gvR[1]=b;if(c>gvR[2])gvR[2]=c;if(d>gvR[3])gvR[3]=d}}
function gvAll(){gvR=[-1e9,-1e9,1e9,1e9]}
function gvUpdate(){const Wc=ghostC.c.width,Hc=ghostC.c.height;if(!Wc||!Hc)return;
 if(ghostV.c.width!==Wc||ghostV.c.height!==Hc){ghostV.c.width=Wc;ghostV.c.height=Hc;gvAll()}if(!gvR)return;
 const P=dpr,pd=Math.ceil(8*P),X0=Math.max(0,Math.floor(gvR[0]*P)-pd),Y0=Math.max(0,Math.floor(gvR[1]*P)-pd),X1=Math.min(Wc,Math.ceil(gvR[2]*P)+pd),Y1=Math.min(Hc,Math.ceil(gvR[3]*P)+pd);gvR=null;if(X1<=X0||Y1<=Y0)return;
 const w=X1-X0,h=Y1-Y0,g=ghostV.x,bp=Math.ceil(5*P),sx0=Math.max(0,X0-bp),sy0=Math.max(0,Y0-bp),sw=Math.min(Wc,X1+bp)-sx0,sh=Math.min(Hc,Y1+bp)-sy0;
 g.save();g.setTransform(1,0,0,1,0,0);g.beginPath();g.rect(X0,Y0,w,h);g.clip();g.clearRect(X0,Y0,w,h);g.globalCompositeOperation='source-over';g.globalAlpha=1;g.drawImage(ghostC.c,X0,Y0,w,h,X0,Y0,w,h);
 if(idm.c.width===Wc&&idm.c.height===Hc){g.globalCompositeOperation='destination-out';g.drawImage(idm.c,X0,Y0,w,h,X0,Y0,w,h);
  try{g.filter=`blur(${(1.6*P).toFixed(1)}px)`}catch(_){}g.drawImage(idm.c,sx0,sy0,sw,sh,sx0,sy0,sw,sh);g.drawImage(idm.c,sx0,sy0,sw,sh,sx0,sy0,sw,sh);g.filter='none'}
 g.restore()}
/* SURFACE GRAIN: alpha map of where the wall holds pigment — grout lines, pits and grain (darker than the local mean)
   hold ~100%, flat faces ~90%, raised highlights down to 60%. Built once per wall render. */
function needGrain(){const Wc=bg.c.width,Hc=bg.c.height,key=(grainV||0)+'|'+Wc+'x'+Hc;if(!Wc||!Hc||grainM.key===key)return grainM;grainM.key=key;
 const c=grainM.c,x=grainM.x;c.width=Wc;c.height=Hc;x.setTransform(1,0,0,1,0,0);
 const sw=Math.max(1,Math.round(Wc/8)),sh=Math.max(1,Math.round(Hc/8)),sm=document.createElement('canvas');sm.width=sw;sm.height=sh;const smx=sm.getContext('2d');smx.imageSmoothingEnabled=true;smx.drawImage(bg.c,0,0,sw,sh);
 x.imageSmoothingEnabled=true;x.drawImage(sm,0,0,Wc,Hc);
 let M,B;try{M=x.getImageData(0,0,Wc,Hc);B=bg.x.getImageData(0,0,Wc,Hc).data}catch(_){x.clearRect(0,0,Wc,Hc);x.fillStyle='rgba(0,0,0,.9)';x.fillRect(0,0,Wc,Hc);return grainM}
 const m=M.data;for(let i=0;i<m.length;i+=4){const lm=m[i]*.3+m[i+1]*.59+m[i+2]*.11,lb=B[i]*.3+B[i+1]*.59+B[i+2]*.11,d=Math.max(-1,Math.min(1,(lm-lb)/28));m[i]=m[i+1]=m[i+2]=0;m[i+3]=Math.round(255*Math.max(.6,Math.min(1,.9+.3*d)))}
 x.putImageData(M,0,0);return grainM}
/* lock an untransformed temp canvas (whose 0,0 sits at device px X0,Y0) into the wall texture */
function grainLock(tx,X0,Y0,w,h){const gm=needGrain();if(!gm.c.width)return;tx.save();tx.setTransform(1,0,0,1,0,0);tx.globalCompositeOperation='destination-in';tx.drawImage(gm.c,X0,Y0,w,h,0,0,w,h);tx.restore()}
/* low-frequency cloud breakup so a solvent smear is uneven, never a clean airbrushed oval */
var CLOUDN;
function surfPorosity(s){
 const id=(s&&s.id)||(cur&&cur.id)||'';
 if(id==='wplastic'||id==='stairs')return 1.0;
 if(id==='plastic')return .68;
 if(id==='glass')return .25;
 return .85;
}
function surfGhostErode(s){
 const id=(s&&s.id)||(cur&&cur.id)||'';
 if(id==='wplastic'||id==='stairs')return .05;
 if(id==='plastic')return .15;
 if(id==='glass')return .60;
 return .10;
}
/* BUFF CHEMISTRY — how a solvent rag treats an ink depends on what is in it.
   lift  share of the film the rag dissolves off in one pass (solvent + binder decide)
   ghost how much colourant has soaked into the wall (dye solubility & stain strength, penetrants, bites)
   hold  how hard that ghost resists more buffing (0 rubs away, ~1 permanent)
   smear how much dissolved colour the rag drags out into a haze
   stick greasy / tacky haze that clings and takes many passes (oil, tar, silicone, rosin, wax sticks)
   bite  chemical bite into smooth surfaces, so even glass & plastic keep the ghost
   tint  colour of the ghost & haze (a dye's undertone), null = the ink's own colour */
/* SMEAR BODY (what the rag actually drags about): body = how much dissolved colour/solids it carries (pigment load, binder,
   tar/rosin) -> a thick, opaque smear; spread = how thin and far the solvent carries it (thinner, flow agents) -> a wide,
   see-through haze; drag = how long and tacky the smear trails behind the rag (binder, oils, tar) */
var SMB={alcohol:[.45,.7,.25],stain:[.6,.75,.3],bleed:[.6,.85,.3],flow:[.4,.8,.25],future:[.45,.7,.25],water:[.35,.6,.15],alcpaint:[.7,.4,.35],oil:[.75,.35,.7],fluid:[.85,.2,.4],chrome:[.55,.35,.3],solid:[.9,.15,.85],etch:[0,0,0]};
function smb(b,ty){if(b&&b.body==null){const d=SMB[ty]||SMB.alcohol;b.body=d[0];b.spread=d[1];b.drag=d[2]}return b}
var BUFFK={
 alcohol:{lift:.9,ghost:.5,hold:.2,smear:.85,stick:.1,bite:0},
 stain:{lift:.86,ghost:.95,hold:.55,smear:.95,stick:.15,bite:.1},
 bleed:{lift:.86,ghost:.9,hold:.6,smear:1,stick:.15,bite:.1},
 flow:{lift:.8,ghost:.38,hold:.2,smear:.75,stick:.2,bite:0},
 future:{lift:.85,ghost:.5,hold:.25,smear:.75,stick:.1,bite:0},
 water:{lift:.9,ghost:.06,hold:0,smear:.35,stick:.05,bite:0},
 alcpaint:{lift:.72,ghost:.12,hold:.05,smear:.45,stick:.15,bite:0},
 oil:{lift:.45,ghost:.18,hold:.12,smear:.65,stick:.6,bite:0},
 fluid:{lift:.55,ghost:.03,hold:0,smear:.3,stick:.2,bite:0},
 chrome:{lift:.62,ghost:.05,hold:0,smear:.4,stick:.1,bite:0},
 solid:{lift:.3,ghost:.12,hold:.1,smear:.9,stick:.75,bite:0},
 etch:{lift:0,ghost:0,hold:1,smear:0,stick:0,bite:1}};
/* from a Brew Lab recipe: base, every colourant (dye vs mineral pigment vs metal flake, its stain strength), load,
   binder, thinner and each additive */
function buffFromMix(m,t,tint){if(t==='etch')return Object.assign({tint:null},BUFFK.etch);
 const a=m.add,P=k=>a.has(k)?1:0;let dyeS=0,paintS=0;for(const id of m.pigs){const g=PIGS[id];if(!g)continue;if(g.k==='dye')dyeS=Math.max(dyeS,g.s||0);else if(g.k==='paint')paintS=Math.max(paintS,g.s||0)}
 const kd=mixKind(m),pot=clamp((m.pot||0)/100),bind=m.bind||25,thin=m.thin||35;
 /* solvent rag vs the film: alcohol & water films redissolve, opaque binders less, cured oil enamel least */
 let lift={alcohol:.9,water:.86,oil:.45,paint:.66}[m.base]??.8;if(kd==='paint')lift*=.88;if(kd==='metal')lift*=.8;
 lift+=(thin-35)/300-(bind-25)/260+.04*P('hum')+.05*P('surf')+.04*P('ret')+.03*P('xylene')+.03*P('mek')+.04*P('methl')-.3*P('bitu')-.2*P('rosin')-.35*P('silic')-.28*P('wax')-.14*P('fish')-.12*P('garvey')-.22*P('agno3')-.08*P('dot3')-.05*P('oil');
 /* dyes dissolve INTO the surface and stain; mineral pigments sit on top (carbon black still tints a little) */
 const SMb=stainModel(m);let ghost=SMb.ghost;/* same number the Brew Lab card shows */
 let hold=SMb.hold;
 let smear=(kd==='dye'?.85:kd==='paint'?.45:.35)+pot*.12+.15*P('surf')+.15*P('ret')+.2*P('oil')+.35*P('bitu')+.4*P('silic')+.15*P('xylene')+.2*P('rosin')+.05*P('hum')+(m.base==='oil'?.15:0);
 let stick=.1+.3*P('oil')+.5*P('bitu')+.55*P('silic')+.45*P('wax')+.28*P('fish')+.35*P('rosin')+.1*P('ret')+(m.base==='oil'?.3:0)+(kd==='paint'?.05:0);
 const bite=SMb.bite;
 /* smear body from the recipe itself: heavy pigment/dye load and binder make a thick, dense smear; thinner and flow agents
    spread it into a wide, thin haze; binder, oils and tar make it drag and trail */
 const body=.12+pot*.5+(kd==='paint'?.16:kd==='metal'?.1:0)+(bind-25)/180+.25*P('bitu')+.14*P('rosin')+.12*P('silica')+.1*P('wax')+.08*P('fish')+.06*P('garvey')+(m.base==='oil'?.1:m.base==='paint'?.12:0)-(thin-35)/260;
 const spread=.3+(thin-35)/110-(bind-25)/240+.18*P('surf')+.1*P('hum')+.12*P('methl')+.1*P('xylene')+.08*P('mek')+.06*P('ret')-.22*P('silica')-.15*P('wax')-.12*P('bitu')+(m.base==='alcohol'?.12:m.base==='water'?.05:m.base==='oil'?-.08:-.05);
 const drag=.15+(bind-25)/160+.35*P('bitu')+.22*P('rosin')+.2*P('oil')+.18*P('fish')+.15*P('silic')+.12*P('ret')+.1*P('wax')+(m.base==='oil'?.25:m.base==='paint'?.12:0)-(thin-35)/300;
 return {body:+clamp(body,.05,1).toFixed(2),spread:+clamp(spread,.05,1).toFixed(2),drag:+clamp(drag,0,1).toFixed(2),lift:+clamp(lift,.15,.95).toFixed(2),ghost:+clamp(ghost).toFixed(2),hold:+clamp(hold,0,.95).toFixed(2),smear:+clamp(smear,.1,1).toFixed(2),stick:+clamp(stick).toFixed(2),bite:+clamp(bite).toFixed(2),tint:tint||null}}
/* any loaded ink: a brewed bottle carries its own profile; stock inks and older saved brews fall back to the ink class */
function buffOf(ty,pr){if(pr&&pr.buff)return smb(pr.buff,ty);const b=smb(Object.assign({tint:null},BUFFK[ty]||BUFFK.alcohol),ty);
 if(pr){const gb=pr.ghostBoost||0,co=pr.corrosive||0;b.ghost=clamp(b.ghost+gb*.9);b.hold=clamp(b.hold+gb*.6+co*.4,0,.95);b.bite=clamp(b.bite+co*.8);b.tint=pr.ghostCol||null;if(pr.skinOver){b.stick=clamp(b.stick+.2);b.lift*=.85}if((pr.viscMul||1)>1.4){b.lift*=.85;b.stick=clamp(b.stick+.15)}{const vm=pr.viscMul||1;b.body=clamp(b.body*(.7+.3*vm));b.spread=clamp(b.spread/(.6+.4*vm));b.drag=clamp(b.drag+(vm-1)*.25)}}return b}
function buffTxt(b){if(!b)return '';if(b.lift<=.01)return 'Can’t be buffed — it’s damage to the surface itself';
 const st=clamp((b.ghost||0)*.95+(b.hold||0)*.55+(1-(b.lift??.8))*.6),L=b.lift<.35?'Barely shifts — the rag skates over it':st<.35?'Wipes off in a pass or two':st<.6?'Lifts with effort — 2–3 passes':st<.85?'Stubborn — the first pass only dissolves it, needs several':'Very stubborn — smears more than it lifts';
 const G=b.ghost>=.55?'strong ghost':b.ghost>=.3?'noticeable ghost':b.ghost>=.1?'faint ghost':'no ghost';
 const H=b.ghost>=.1?(b.hold>=.75?' that’s permanent':b.hold>=.4?' that resists buffing':''):'';
 const bo=b.body??.5,sp=b.spread??.5,dg=b.drag??.3,S=b.stick>=.55?' · greasy smear that clings':bo>=.7?' · thick, dense smear':sp>=.7?' · thin, wide haze':b.smear<=.4?' · little smear':' · medium smear';const D=dg>=.6?' that drags in long trails':sp>=.75&&bo<.7?' that spreads far':'';
 return L+' · '+G+H+S+D+(b.bite>=.4?' · bites into glass & plastic':'')}
/* the wall remembers which ink went where: three small maps at CSS resolution
   A = lift, hold, smear   B = stick, bite, has-tint   C = tint colour */
var BM;function needBM(){const w=Math.max(1,Math.round(W)),h=Math.max(1,Math.round(H));if(BM&&BM.w===w&&BM.h===h)return BM;
 const n=[0,1,2,3].map(()=>{const c=document.createElement('canvas');c.width=w;c.height=h;return{c,x:c.getContext('2d',{willReadFrequently:true})}});
 if(BM)for(let i=0;i<4;i++)if(BM.m[i])n[i].x.drawImage(BM.m[i].c,0,0,w,h);BM={w,h,m:n};return BM}
function stampBuffMap(bp,x0,y0,w,h){const M=needBM(),P=dpr,cw=Math.max(1,Math.ceil(w/P)),ch=Math.max(1,Math.ceil(h/P)),t=document.createElement('canvas');t.width=cw;t.height=ch;const tx=t.getContext('2d');
 const fills=[`rgb(${[bp.lift,bp.hold,bp.smear].map(v=>Math.round(clamp(v)*255)).join(',')})`,`rgb(${Math.round(clamp(bp.stick)*255)},${Math.round(clamp(bp.bite)*255)},${Math.round(clamp(bp.ghost??.5)*255)})`,bp.tint||'#000000',`rgb(${[bp.body??.5,bp.spread??.5,bp.drag??.3].map(v=>Math.round(clamp(v)*255)).join(',')})`];
 for(let i=0;i<4;i++){tx.globalCompositeOperation='copy';tx.drawImage(stk.c,x0,y0,w,h,0,0,cw,ch);tx.globalCompositeOperation='source-in';tx.fillStyle=fills[i];tx.fillRect(0,0,cw,ch);M.m[i].x.drawImage(t,x0/P,y0/P)}}
function stampDripBuff(d,x0,y0,x1,y1,r,s){
 if(!d||!d.bp||d.et||d.soft||d.wash)return;
 const bp=d.bp,M=needBM(),lw=Math.max(2.2,r*2.4);
 const fills=[`rgb(${[bp.lift,bp.hold,bp.smear].map(v=>Math.round(clamp(v)*255)).join(',')})`,`rgb(${Math.round(clamp(bp.stick)*255)},${Math.round(clamp(bp.bite)*255)},${Math.round(clamp(bp.ghost??.5)*255)})`,bp.tint||'#000000',`rgb(${[bp.body??.5,bp.spread??.5,bp.drag??.3].map(v=>Math.round(clamp(v)*255)).join(',')})`];
 for(let i=0;i<4;i++){
  const mx=M.m[i].x;mx.save();mx.lineCap='round';mx.strokeStyle=fills[i];mx.lineWidth=lw;
  mx.beginPath();mx.moveTo(x0,y0);mx.lineTo(x1,y1);mx.stroke();mx.restore();
 }
 /* Also stamp a soft ghost of the drip onto ghostC using the brew's true undertone so drips ghost & buff in colour */
 const por=Math.max(surfPorosity(s),bp.bite||0),op=clamp(.22*bp.ghost*por,0,.22);
 if(op>=.008){
  const col=typeof d.col==='string'&&d.col[0]==='#'?d.col:'#18181c';
  const isDk=lum(hex(col))<.22;
  const gTint=bp.tint||(isDk&&(d.ty==='stain'||d.ty==='bleed')?'#5e24c4':isDk&&(d.ty==='alcohol'||d.ty==='flow')?'#2044a8':col);
  const gx=ghostC.x;gx.save();gx.lineCap='round';gx.strokeStyle=gTint;gx.globalAlpha=op;gx.lineWidth=Math.max(1.8,r*2.1);
  gx.beginPath();gx.moveTo(x0,y0);gx.lineTo(x1,y1);gx.stroke();gx.restore();
 }
}
function buffMapAt(x,y,r){const M=BM;if(!M)return null;const x0=Math.max(0,Math.floor(x-r)),y0=Math.max(0,Math.floor(y-r)),x1=Math.min(M.w,Math.ceil(x+r)),y1=Math.min(M.h,Math.ceil(y+r)),w=x1-x0,h=y1-y0;if(w<1||h<1)return null;
 let A,B,T,Q=null;try{A=M.m[0].x.getImageData(x0,y0,w,h).data;B=M.m[1].x.getImageData(x0,y0,w,h).data;T=M.m[2].x.getImageData(x0,y0,w,h).data;if(M.m[3])Q=M.m[3].x.getImageData(x0,y0,w,h).data}catch(_){return null}
 const v=[0,0,0,0,0,0];let tr=0,tg=0,tb=0,tn=0,n=0,qb=0,qs=0,qd=0,qn=0;const rr=r*r;
 for(let yy=0;yy<h;yy+=2)for(let xx=0;xx<w;xx+=2){const dx=x0+xx-x,dy=y0+yy-y;if(dx*dx+dy*dy>rr)continue;const k=(yy*w+xx)*4,a=A[k+3]/255;if(a<.15)continue;n+=a;v[0]+=A[k]*a;v[1]+=A[k+1]*a;v[2]+=A[k+2]*a;v[3]+=B[k]*a;v[4]+=B[k+1]*a;v[5]+=B[k+2]*a;if(Q&&Q[k+3]>40){qb+=Q[k]*a;qs+=Q[k+1]*a;qd+=Q[k+2]*a;qn+=a}if(T[k]+T[k+1]+T[k+2]>10){tr+=T[k]*a;tg+=T[k+1]*a;tb+=T[k+2]*a;tn+=a}}
 if(!n)return null;const f=1/(255*n);return {lift:v[0]*f,hold:v[1]*f,smear:v[2]*f,stick:v[3]*f,bite:v[4]*f,ghost:v[5]*f,body:qn?qb/(255*qn):null,spread:qn?qs/(255*qn):null,drag:qn?qd/(255*qn):null,tint:tn>n*.3?'#'+[tr,tg,tb].map(q=>Math.round(q/tn).toString(16).padStart(2,'0')).join(''):null,cov:n}}
var buffSaid=new Set();function buffSay(k,msg){if(buffSaid.has(k))return;buffSaid.add(k);toast(msg)}
function stampGhost(s,ink){
 if(stroke)gvMark(stroke.x0-10,stroke.y0-10,stroke.x1+10,stroke.y1+10);
 if(demo||!stroke||!ink)return;
 const bp=buffOf(pen.ink,pen.props);
 const P=dpr,pad=Math.ceil(6*P);
 const x0=Math.max(0,Math.floor(stroke.x0*P)-pad),y0=Math.max(0,Math.floor(stroke.y0*P)-pad);
 const w=Math.min(stk.c.width-x0,Math.ceil((stroke.x1-stroke.x0)*P)+pad*2);
 const h=Math.min(stk.c.height-y0,Math.ceil((stroke.y1-stroke.y0)*P)+pad*2);
 if(w<3||h<3)return;
 stampBuffMap(bp,x0,y0,w,h);
 if(ink.etch)return;
 /* how much colourant soaks in: the ink's chemistry x the surface's porosity — a chemical bite gets into glass & plastic too */
 const por=Math.max(surfPorosity(s),bp.bite||0);
 const op=clamp(.25*bp.ghost*por,0,.25);if(op<.008)return;
 const c=document.createElement('canvas');c.width=w;c.height=h;const tx=c.getContext('2d');
 try{tx.filter=`blur(${(2*P).toFixed(1)}px)`}catch(_){}
 tx.drawImage(stk.c,x0,y0,w,h,0,0,w,h);tx.filter='none';
 const col=curCol(),isDk=typeof col==='string'&&col[0]==='#'&&lum(hex(col))<.22;
 const gTint=bp.tint||(isDk&&(pen.ink==='stain'||pen.ink==='bleed')?'#5e24c4':isDk&&(pen.ink==='alcohol'||pen.ink==='flow')?'#2044a8':col);
 if(typeof gTint==='string'&&gTint[0]==='#'){
  tx.globalCompositeOperation='source-in';tx.fillStyle=gTint;tx.fillRect(0,0,w,h);
 }
 grainLock(tx,x0,y0,w,h);
 const gx=ghostC.x;gx.save();gx.setTransform(1,0,0,1,0,0);
 gx.globalCompositeOperation='source-over';gx.globalAlpha=op;
 gx.drawImage(c,x0,y0);gx.restore();freeC(c);
}
function stripSheen(b,r){if(satOn&&SAT){erase({x:SAT.getContext('2d')},b,1,r)}if(wgOn2&&GLW){erase({x:GLW.getContext('2d')},b,1,r)}for(const k in WET)if(WET[k].active)erase(WET[k],b,1,r);if(glL.c.width){erase(glL,b,1,r);glDirty=true}if(shL.c.width){erase(shL,b,1,r);shDirty=true}if(metal.c.width){erase(metal,b,1,r);shineDirty=true}if(fjL.c.width)erase(fjL,b,1,r);lForce=true;slForce=true;g3Dirty=true}
let _bfT=0;
function sampleSmearRGB(bx,by,r){
 const P=dpr,cx=Math.round(bx*P),cy=Math.round(by*P),rp=Math.max(4,Math.round(r*P));
 const x0=Math.max(0,cx-rp),y0=Math.max(0,cy-rp),x1=Math.min(smearC.c.width,cx+rp),y1=Math.min(smearC.c.height,cy+rp);
 const w=x1-x0,h=y1-y0;if(w<2||h<2)return null;
 let sd;try{sd=smearC.x.getImageData(x0,y0,w,h).data}catch(_){return null}
 const step=Math.max(2,Math.floor(Math.max(w,h)/10));
 let sr=0,sg=0,sb=0,wt=0;
 for(let y=0;y<h;y+=step)for(let x=0;x<w;x+=step){
  const dx=(x0+x)-cx,dy=(y0+y)-cy;if(dx*dx+dy*dy>rp*rp)continue;
  const k=(y*w+x)*4,a=sd[k+3]/255;
  if(a>.06){sr+=sd[k]*a;sg+=sd[k+1]*a;sb+=sd[k+2]*a;wt+=a}
 }
 if(wt<.15)return null;
 return '#'+[Math.round(sr/wt),Math.round(sg/wt),Math.round(sb/wt)].map(v=>clamp(v,0,255).toString(16).padStart(2,'0')).join('');
}
function sampleInkRGB(bx,by,r){
 const P=dpr,cx=Math.round(bx*P),cy=Math.round(by*P),rp=Math.max(4,Math.round(r*P));
 const x0=Math.max(0,cx-rp),y0=Math.max(0,cy-rp),x1=Math.min(baked.c.width,cx+rp),y1=Math.min(baked.c.height,cy+rp);
 const w=x1-x0,h=y1-y0;if(w<2||h<2)return null;
 let bd,id;try{bd=baked.x.getImageData(x0,y0,w,h).data;id=idm.x.getImageData(x0,y0,w,h).data}catch(_){return null}
 const step=Math.max(2,Math.floor(Math.max(w,h)/14));
 let sr=0,sg=0,sb=0,cnt=0;
 for(let y=0;y<h;y+=step)for(let x=0;x<w;x+=step){
  const dx=(x0+x)-cx,dy=(y0+y)-cy;if(dx*dx+dy*dy>rp*rp)continue;
  const k=(y*w+x)*4;
  if(id[k+3]>40){sr+=bd[k];sg+=bd[k+1];sb+=bd[k+2];cnt++}
 }
 if(!cnt)return null;
 return [Math.round(sr/cnt),Math.round(sg/cnt),Math.round(sb/cnt),cnt];
}
