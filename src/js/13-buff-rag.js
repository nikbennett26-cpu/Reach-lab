function buffAt(a,b){
 const _nowB=performance.now();
 if(_nowB-_bfT>140){_bfT=_nowB;lForce=true;g3Dirty=true;slForce=true}
 const R2=36,dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy),s=surfAt(b.x,b.y);
 {const r=30;for(let cy=Math.max(0,(b.y-r)>>1);cy<=Math.min(LMH-1,(b.y+r)>>1);cy++)for(let cx=Math.max(0,(b.x-r)>>1);cx<=Math.min(LMW-1,(b.x+r)>>1);cx++)if((cx*2-b.x)**2+(cy*2-b.y)**2<r*r)LM[cy*LMW+cx]=0}
 if(bleedL.length)flushBleed(true);
 {const R3=38;for(let i=drips.length-1;i>=0;i--){const d=drips[i];if(d.t0&&_nowB<d.t0)continue;if(Math.hypot(d.x-b.x,d.y-b.y)<R3){if(d.col&&d.col[0]==='#'){pad.col=pad.col?mixHex(pad.col,d.col,.35):d.col;pad.load=Math.min(1.8,(pad.load||0)+.24)}drips.splice(i,1)}}
  if(fh){for(let gy=Math.max(0,Math.floor((b.y-R3)/C));gy<=Math.min(GH_-1,Math.floor((b.y+R3)/C));gy++)for(let gx=Math.max(0,Math.floor((b.x-R3)/C));gx<=Math.min(GW-1,Math.floor((b.x+R3)/C));gx++){const i=gy*GW+gx;if(fh[i]>0){fh[i]*=.22;fw[i]*=.55}}}}
 stripSheen(b,R2*1.25);

 const ty=inkAt(b.x,b.y),samp=sampleInkRGB(b.x,b.y,R2*.95);
 const bm=buffMapAt(b.x,b.y,R2*.95)||(ty?buffOf(ty,null):null);
 /* the rag carries the smear character of whatever ink it has been lifting (from the brew's stats), blending as it moves between inks */
 if(bm){if(bm.body==null){const d=SMB[ty]||SMB.alcohol;bm.body=d[0];bm.spread=d[1];bm.drag=d[2]}const o=pad.sb;pad.sb=o?{body:o.body+(bm.body-o.body)*.35,spread:o.spread+(bm.spread-o.spread)*.35,drag:o.drag+(bm.drag-o.drag)*.35}:{body:bm.body,spread:bm.spread,drag:bm.drag}}
 const SB=pad.sb||{body:.5,spread:.5,drag:.3};
 if(bm&&samp){
  if(bm.lift<=.01)buffSay('etch','Etched — that’s damage to the surface, the rag can’t lift it');
  else if(bm.stick>=.55)buffSay('stick','Greasy binder — the rag skates and drags a sticky haze');
  else if(bm.lift<.4)buffSay('lift','Stubborn film — the solvent only softens it a little each pass');
  else if(bm.ghost>=.55&&bm.hold>=.45)buffSay('ghost','Staining dye — each pass thins it, but the stain bites deep');
  if(bm.bite>=.4&&(s.id==='glass'||s.id==='plastic'||s.id==='wplastic'))buffSay('bite','Chemical bite — the ghost is etched into the surface');
 }

 /* Track local buff layer count (how many chemical passes have scrubbed this patch) */
 let passAvg=0,passCnt=0;
 if(buffPass&&GW>1){
  const gy0=Math.max(0,Math.floor((b.y-R2*.75)/C)),gy1=Math.min(GH_-1,Math.floor((b.y+R2*.75)/C));
  const gx0=Math.max(0,Math.floor((b.x-R2*.75)/C)),gx1=Math.min(GW-1,Math.floor((b.x+R2*.75)/C));
  for(let gy=gy0;gy<=gy1;gy++)for(let gx=gx0;gx<=gx1;gx++){
   const i=gy*GW+gx;buffPass[i]=Math.min(12,(buffPass[i]||0)+.45);passAvg+=buffPass[i];passCnt++;
  }
 }
 const layerN=passCnt?passAvg/passCnt:1;
 const layerDecay=Math.exp(-(Math.max(0,layerN-.5))*.34); /* 1.0 on pass 1 -> ~0.71 pass 2 -> ~0.50 pass 3 -> fainter each layer */

 let hitCol=null;
 const smCol=sampleSmearRGB(b.x,b.y,R2*.85);
 if(samp){
  let rgbHex='#'+[samp[0],samp[1],samp[2]].map(v=>v.toString(16).padStart(2,'0')).join('');
  if(bm&&bm.tint){rgbHex=mixHex(rgbHex,bm.tint,lum([samp[0],samp[1],samp[2]])<.25?.76:.62)}
  else if((ty==='stain'||ty==='bleed')&&lum([samp[0],samp[1],samp[2]])<.22){rgbHex=mixHex(rgbHex,'#5e24c4',.58)}
  /* If wiping across an existing coloured smudge (e.g. red over blue), blend both colours via Kubelka-Munk */
  if(smCol&&typeof kmMix==='function'){rgbHex=kmMix([{c:rgbHex,ts:1.35},{c:smCol,ts:.85}])}
  hitCol=rgbHex;
  const gain=.28*(bm?.28+.82*bm.smear:1)*(.45+.55*layerDecay)*(.55+.9*SB.body)*(1+1.3*clamp(1.38-layerN*.54,0,1)*clamp((bm?bm.ghost:.5)*1.4)),/* the first swipe grabs a rich load of wet dissolved dye straight away */cap=1.65+(bm?bm.stick*.55:0);
  if(pad.col){
   const bW=clamp(.18+.14*(bm?bm.smear:1),.18,.34);
   pad.col=typeof kmMix==='function'?kmMix([{c:pad.col,ts:1-bW},{c:rgbHex,ts:bW}]):mixHex(pad.col,rgbHex,bW);
  }else pad.col=rgbHex;
  pad.load=Math.min(cap,(pad.load||0)+gain);pad.stick=bm?bm.stick:0;
 }else if(smCol){
  /* Rag wiping over an existing smudge picks up & blends that colour into the rag */
  if(pad.col){pad.col=typeof kmMix==='function'?kmMix([{c:pad.col,ts:.65},{c:smCol,ts:.35}]):mixHex(pad.col,smCol,.35)}
  else{pad.col=smCol}
  pad.load=Math.max(pad.load||0,.28)*(.95+.03*(pad.stick||0));
 }else{
  pad.load=Math.max(0,(pad.load||0)*(.92+.05*(pad.stick||0)));
 }

 /* SMOOTH FEATHERED RAG FOOTPRINT (round caps + soft multi-stop cross-fade + blur — zero boxy rectangular edges) */
 const nowR=performance.now(),p0=(pad.lp&&nowR-pad.lt<160&&Math.hypot(b.x-pad.lp.x,b.y-pad.lp.y)<95)?pad.lp:{x:b.x-dx,y:b.y-dy};pad.lp={x:b.x,y:b.y};pad.lt=nowR;
 const sl=Math.hypot(b.x-p0.x,b.y-p0.y),th=sl>.5?Math.atan2(b.y-p0.y,b.x-p0.x):(pad.th||0);pad.th=th;
 const slowSq=sl<22?clamp((22-sl)/22,0,1)*.48:0,pSq=clamp(Math.max((pressNow-.20)/.55,pad.holdSq||0,slowSq),0,1),RW=Math.round(50+pSq*24),RD=14,ux=Math.cos(th),uy=Math.sin(th),nx=-uy,ny=ux,P=dpr;
 const qa={x:p0.x-ux*RD*.35,y:p0.y-uy*RD*.35},qb={x:b.x+ux*RD*.35,y:b.y+uy*RD*.35},mx=(qa.x+qb.x)/2,my=(qa.y+qb.y)/2;
 const D=Math.ceil(((sl+RD)+RW+36)*P/32)*32,X0=Math.round(mx*P-D/2),Y0=Math.round(my*P-D/2);
 const M=tcan(D,'ragM'),mk=M.x,toL=(q)=>[q.x*P-X0,q.y*P-Y0];
 const skate=clamp((sl-16)/50,0,1)*(1-pSq),stK=clamp((.72+.4*skate)*(1-.2*pSq)*(.55+.45*clamp(pad.load,0,1)),.3,1);
 if(!pad.stk||Math.random()<.015)pad.stk=Array.from({length:18},()=>({o:Math.random()*2-1,w:.7+Math.random()*Math.random()*3.2,g:Math.random()<.6,a:.3+Math.random()*.6}));/* fast light swipe skates over the ink; slow firm scrub digs in */
 if(!pad.fib||Math.random()<.02)pad.fib=Array.from({length:10},()=>({o:Math.random()*2-1,w:.8+Math.random()*2.0,a:.08+Math.random()*.28}));
 {
  const [ax,ay]=toL(qa),[bx2,by2]=toL(qb),cx=(ax+bx2)/2,cy=(ay+by2)/2;
  const g=mk.createLinearGradient(cx-nx*RW*P*.55,cy-ny*RW*P*.55,cx+nx*RW*P*.55,cy+ny*RW*P*.55);
  g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.26,'rgba(255,255,255,.72)');
  g.addColorStop(.5,'rgba(255,255,255,1)');g.addColorStop(.74,'rgba(255,255,255,.72)');
  g.addColorStop(1,'rgba(255,255,255,0)');
  try{mk.filter=`blur(${(4.5*P).toFixed(1)}px)`}catch(_){}
  mk.strokeStyle=g;mk.lineCap='round';mk.lineJoin='round';mk.lineWidth=RW*P;
  mk.beginPath();mk.moveTo(ax,ay);mk.lineTo(bx2,by2);mk.stroke();mk.filter='none';
  /* subtle cloth-fibre texture inside the soft centre */
  mk.globalCompositeOperation='destination-out';mk.lineCap='round';
  for(const f of pad.fib){const o=f.o*RW*P*.36;mk.globalAlpha=f.a*.42;mk.lineWidth=f.w*P;mk.beginPath();mk.moveTo(ax+nx*o,ay+ny*o);mk.lineTo(bx2+nx*o,by2+ny*o);mk.stroke()}
  /* the rag doesn't wipe evenly: fibre tracks and folds leave lines along the rub where it lifts less */
  for(const f of pad.stk){if(!f.g)continue;const o=f.o*RW*P*.42,e=8*P;mk.globalAlpha=Math.min(.9,f.a*stK);mk.lineWidth=(f.w*1.2+.7)*P;mk.beginPath();mk.moveTo(ax-ux*e+nx*o,ay-uy*e+ny*o);mk.lineTo(bx2+ux*e+nx*o,by2+uy*e+ny*o);mk.stroke()}
  mk.globalAlpha=1;mk.globalCompositeOperation='source-over';
 }
 const band=(ctx,comp,al,src)=>{ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalCompositeOperation=comp;ctx.globalAlpha=al;ctx.drawImage(src||M.c,X0,Y0);ctx.restore()};
 gvMark(mx-(sl+RW)/2-14,my-(sl+RW)/2-14,mx+(sl+RW)/2+14,my+(sl+RW)/2+14);

 /* 1. PROGRESSIVE TAG THINNING: pass 1 only lifts the surface crust (~26-34%) so letters stay deep, dark & saturated;
    subsequent passes ramp up lift to thin them into lighter chromatic shades (never neutral grey). */
 const firstK=clamp(1.38-layerN*.54,0,1);
 const baseLift=bm?clamp(bm.lift*.68,0,.68):.58;
 /* pass 1 only shears the dry crust and dissolves the dye into a wet film: the letters stay ~88-95% as dark, edges blur and rag tracks cut faint streaks */
 /* how stubborn this ink is, from the brew's own stats: a staining, deep-bitten dye barely moves on pass 1; a non-staining ink wipes most of the way off */
 const stub=bm?clamp((bm.ghost||0)*.95+(bm.hold||0)*.55+(1-(bm.lift??.8))*.6):.5;
 const passCurve=firstK>.15?((.12+.6*(1-stub))+(1-firstK)*.62):(.82+.24*clamp((layerN-2)/2.5,0,1));
 /* staining dyes hold their dark core on the early passes: ghost (stain) and hold (bite) resist the lift, easy-lift inks still wipe clean */
 const early=clamp((2.6-layerN)/1.6,0,1),resist=bm?clamp(1-(bm.ghost*.45+bm.hold*.35)*early,.25,1):1;
 let lift=clamp(baseLift*passCurve*resist*(.86+.30*pSq)*(1-.42*skate),0,.88);if(!isFinite(lift))lift=.3;
 if(lift>0){
  const T=tcan(D,'ragB'),tx=T.x;
  tx.globalCompositeOperation='copy';tx.drawImage(bg.c,X0,Y0,D,D,0,0,D,D);
  tx.globalCompositeOperation='destination-in';tx.drawImage(M.c,0,0);tx.globalCompositeOperation='source-over';
  band(baked.x,'source-over',lift,T.c);
  /* pass 1: keep strokes deep, rich chromatic colour; later passes: lighten into a clean pale shade of the ink */
  const tintSrc=hitCol||pad.col;
  if(tintSrc&&tintSrc[0]==='#'){
   const deepCol=mixHex(tintSrc,'#0e0818',.16);
   const paleCol=mixHex(washTint(tintSrc),'#ffffff',.16);
   const strokeTint=firstK>.05?mixHex(paleCol,deepCol,.82*firstK):paleCol;
   const TC2=tcan(D,'ragT'),tx2=TC2.x;
   tx2.globalCompositeOperation='copy';tx2.drawImage(M.c,0,0);
   tx2.globalCompositeOperation='destination-in';tx2.drawImage(idm.c,X0,Y0,D,D,0,0,D,D);
   tx2.globalCompositeOperation='source-in';tx2.fillStyle=strokeTint;tx2.fillRect(0,0,D,D);
   tx2.globalCompositeOperation='source-over';
   band(baked.x,s.id==='plastic'?'source-over':'multiply',clamp(.26+.30*firstK,.14,.56),TC2.c);
  }
  band(idm.x,'destination-out',Math.min(.72,lift*(firstK>.2?.78:1.12)));
 }

 /* 2. LAYERED GHOST EVOLUTION: early buff passes drive/soften dissolved dye into the ghost; later passes gradually erode & shift it */
 const smooth=s.id==='glass'||s.id==='plastic'||s.id==='wplastic';
 const por=Math.max(surfPorosity(s),bm?(bm.bite||0):0);
 if(samp&&hitCol&&layerN<2.4&&por>.2&&(!bm||bm.ghost>.2)){
  /* chemical solvent pushes a faint softened bloom of the thinned undertone into the wall ghost */
  const gPush=clamp(.055*(bm?bm.ghost:.6)*por*layerDecay,0,.08);
  const T=tcan(D,'ragG'),tx=T.x;
  tx.globalCompositeOperation='copy';tx.drawImage(M.c,0,0);
  tx.globalCompositeOperation='source-in';tx.fillStyle=washTint(hitCol);tx.fillRect(0,0,D,D);
  tx.globalCompositeOperation='destination-in';tx.drawImage(idm.c,X0,Y0,D,D,0,0,D,D);
  tx.globalCompositeOperation='source-over';
  band(ghostC.x,'source-over',gPush,T.c);
 }
 /* progressive ghost erosion that ramps up on deeper layers, modulated by porosity & chemical hold/bite */
 const erScale=layerN<1.6?.45:layerN<3.2?.85:1.15;
 const gErode=clamp(surfGhostErode(s)*erScale*(1-(bm?bm.hold*.82:0))*(1-(smooth&&bm?.68*bm.bite:0)),.012,.65);
 band(ghostC.x,'destination-out',gErode);

 /* 3. SMOOTH, LAYERED CLOUDY CHEMICAL WASH ON smearC:
    First solvent contact smears a darker, concentrated dissolved-ink layer; subsequent passes smear lighter
    and blend smoothly into the darker base layers instead of wiping them out abruptly. */
 const stk2=pad.stick||0;
 const smErode=(layerN<1.6?.07:layerN<3.2?.16:.24)*(1-.52*stk2)*(1-.4*SB.drag)*(1-.3*SB.body);/* a heavy, tacky smear is harder to wipe back off */
 band(smearC.x,'destination-out',smErode);
 if((pad.load||0)>.025&&pad.col){
  const lightWc=washTint(pad.col);
  const deepSrc=hitCol?mixHex(pad.col,hitCol,.62):pad.col;
  /* pass 1: rich, dense saturated dye cloud hugging the letters; later passes: lighter, more transparent veil */
  const lateFade=clamp((layerN-2.0)*.12,0,.34);
  let wc=firstK>.04?mixHex(lightWc,deepSrc,.82*firstK):mixHex(lightWc,'#ffffff',lateFade*.75);
  /* a thick, loaded smear stays deep in colour; a thin, runny one goes pale and watery */
  wc=SB.body>.5?mixHex(wc,deepSrc,clamp((SB.body-.5)*.9,0,.45)):mixHex(wc,lightWc,clamp((.5-SB.body)*1.2,0,.5));
  const smK=bm?.35+.65*bm.smear:.85;
  const dep=clamp((.032+.088*pad.load*smK)*(.42+.45*layerDecay+.78*firstK)*(1+.28*stk2)*(1+.45*skate)*(.45+1.05*SB.body)*(1.18-.45*SB.spread)*(1+.85*firstK*clamp((bm?bm.ghost:.5)*1.4))*(bm?.45+.55*clamp(bm.ghost*1.2+.2):1),0,.58);/* pass 1 drags a dark ink-and-solvent smear out from the letter edges */
  const T=tcan(D,'ragW'),tx=T.x;
  tx.globalCompositeOperation='copy';tx.drawImage(M.c,0,0);
  tx.globalCompositeOperation='source-in';tx.fillStyle=wc;tx.fillRect(0,0,D,D);
  tx.globalCompositeOperation='source-over';
  grainLock(tx,X0,Y0,D,D);
  /* RAG STREAKS: fibre tracks and darker ridges where the rag edge pushes dissolved ink — lined along the rub, never an even haze */
  {const [sax,say]=toL(qa),[sbx,sby]=toL(qb),ridge=mixHex(deepSrc,'#10081a',.22);
   tx.save();tx.lineCap='round';
   for(const f of pad.stk){const o=f.o*RW*P*.4,e=8*P;tx.beginPath();tx.moveTo(sax-ux*e+nx*o,say-uy*e+ny*o);tx.lineTo(sbx+ux*e+nx*o,sby+uy*e+ny*o);tx.lineWidth=f.w*.9*P;
    if(f.g){tx.globalCompositeOperation='destination-out';tx.globalAlpha=Math.min(.85,f.a*stK)}else{tx.globalCompositeOperation='source-over';tx.strokeStyle=ridge;tx.globalAlpha=f.a*.5*stK}
    tx.stroke()}
   tx.restore()}
  band(smearC.x,'source-over',dep,T.c);
  /* DRAG: a tacky smear trails out behind the rag in the direction of the rub — further and heavier the more binder/oil/tar there is */
  if(SB.drag>.22&&sl>2){const off=(6+26*SB.drag)*P,sx2=smearC.x;sx2.save();sx2.setTransform(1,0,0,1,0,0);sx2.globalAlpha=clamp(dep*.6*SB.drag,0,.3);sx2.drawImage(T.c,X0+ux*off,Y0+uy*off);if(SB.drag>.55){sx2.globalAlpha=clamp(dep*.3*SB.drag,0,.16);sx2.drawImage(T.c,X0+ux*off*2,Y0+uy*off*2)}sx2.restore()}
  /* soft organic mist cloud: denser & tighter on pass 1, airier on later passes */
  const sx=smearC.x,rx=R2*(1.25+Math.random()*.75)*(.8+.9*SB.spread),ry=rx*(.36+Math.random()*.2)*(.8+.5*SB.spread);/* thin, runny brews spread the dissolved colour into a wide haze */
  sx.save();sx.globalCompositeOperation='source-over';
  sx.globalAlpha=clamp(dep*(.48+.24*firstK)*(.15+.75*SB.spread)*(1.1-.5*SB.body),0,.16);
  sx.translate(mx+(Math.random()-.5)*10,my+(Math.random()-.5)*10);
  sx.rotate(th+(Math.random()-.5)*.35);
  sx.drawImage(feather(qh(...hex(wc))),-rx,-ry,2*rx,2*ry);
  sx.restore();
  pad.load=Math.max(0,pad.load-dep*.28);
 }

 /* 4. PRESSURE-DRIVEN CHEMICAL BUFF RUN-OFF: balanced wash-off that ramps up cleanly when pressing harder or dwelling */
 /* solvent builds up in the wet patch while you work and only lets go from its LOWER EDGE, a few runs bunched where you dwelled or pressed:
    most are short and stall, a few go the distance; they're fat-headed and varied, and paler than the tag */
{const dtP=pad.ptT?Math.min(.3,Math.max(0,(_nowB-pad.ptT)/1000)):0;pad.ptT=_nowB;const soak=clamp(.35+waterAt(b.x,b.y)*.9,.3,1);pad.pool=(pad.pool||0)+dtP*(.16+1.9*pSq)*soak*(.5+.5*clamp(pad.load,0,1))*(samp?1:.45)}/* solvent soaks in with TIME on the spot: stay put and it builds fast, a quick wipe barely wets it enough to run */
 if(upright&&pad.pool>1.25&&pad.col&&(!bm||bm.lift>.05)&&_nowB-(pad.dripT||0)>340){
  const smMean=s.mean||[235,235,232];
  const wallHex='#'+smMean.map(v=>clamp(Math.round(v),0,255).toString(16).padStart(2,'0')).join('');
  const baseCol=hitCol?mixHex(pad.col,hitCol,.5):pad.col;
  const dilute=clamp(.12+(layerN-.6)*.08+pSq*.03+Math.random()*.1,.1,.62);
  const dripCol=mixHex(washTint(baseCol),wallHex,dilute);
  const dripAl=clamp((.62*layerDecay+(.1*pad.load))*(samp?1.05:.8)*(.9+.2*pSq),.28,.78);
  pad.pool-=1.25;pad.dripT=_nowB;
  /* find the bottom edge of the damp patch below the rag (follows gravity) */
  const Gd=gDir(),gm2=Math.hypot(Gd.x,Gd.y)||1,gx2=Gd.x/gm2,gy2=Gd.y/gm2;
  let sx0=b.x,sy0=b.y;
  if(pad.runX&&pad.runX.length&&Math.random()<.55){const rx0=pad.runX[Math.floor(Math.random()*pad.runX.length)];sx0=rx0+(Math.random()-.5)*10}else sx0=b.x+(Math.random()-.5)*RW*.5;
  let ex=sx0,ey=b.y,k2=0;while(k2<110&&waterAt(ex+gx2*3,ey+gy2*3)>.12){ex+=gx2*3;ey+=gy2*3;k2+=3}
  ex+=(Math.random()-.5)*3;ey-=gy2*(8+Math.random()*18);/* start a little inside the patch so the run crosses the dye above its edge */
  if(!pad.runX)pad.runX=[];pad.runX.push(ex);if(pad.runX.length>3)pad.runX.shift();
  const stall=Math.random()<.58;
  const rr=Math.random();
  const dr=stall?.7+rr*.45:.75+rr*rr*.9+pSq*.2;
  const vol=stall?.4+Math.random()*.5:.9+Math.random()*.9+pSq*.4;
  drip(ex,ey,Math.max(.3,vol*(.6+.4*clamp(pad.load,0,1.15))),{ty:ty||'stain',col:dripCol,al:dripAl,r:dr,soft:1,wash:1,pickUp:1,delay:60+Math.random()*260});
 }

 /* 5. Leave the scrubbed patch damp with solvent — harder press squeezes more cleaning agent onto the wall */
 const solvAmt=.20+pSq*.34;
 for(let k=0,n=Math.max(1,Math.ceil(sl/10));k<=n;k++){const f=k/n;addWater({x:p0.x+(b.x-p0.x)*f,y:p0.y+(b.y-p0.y)*f},RW*(.46+.12*pSq),solvAmt)}pad.dampT=nowR;
 dirty=true;
}


