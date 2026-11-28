/* ---------- DYE SEPARATION: a staining dark ink on a wet wall splits — the black body sets crisp where it was drawn,
   while its violet (or blue) dye dissolves into the water film, seeps out of both edges of every line and runs down
   as a curtain of fine see-through streaks. Wetter patches bleed further and run longer. Paint blacks don't split. ---------- */
/* finished overlay layers are pressed into the wall (in order), so buffing and wiping act on them like any other ink */
/* A letter's paint layers (its rim, sag, contact shadow and bevel) fade in over a second or two, and in that time runs are already
   leaving the letter. Those layers sit on top of the wall, so they must never be laid over a run: that greyed the top of every run
   (the shadow under the letter) and the run changed colour where the layer ended. Runs are cut out of them as they're painted. */
let runlV=0;function runCut(L){if(!L.tk||!RUNL.c.width||L.rv===runlV)return;L.rv=runlV;try{const x=L.c.getContext('2d');x.save();x.globalCompositeOperation='destination-out';x.drawImage(RUNL.c,-L.x,-L.y);x.restore()}catch(_){}}
function flushBleed(all,full){for(const L of bleedL)runCut(L);if(!bleedL.length)return;const now=performance.now(),keep=[];for(const L of bleedL)if(L.live&&all)L.upd(L.t0+L.dur+1);for(const L of bleedL){const done=all||(L.top?now>L.t0+9000:now>L.t0+L.dur+300);if(done&&!keep.some(k=>!k.slow)){baked.x.save();baked.x.setTransform(1,0,0,1,0,0);if(L.comp)baked.x.globalCompositeOperation=L.comp;baked.x.globalAlpha=L.a*(L.slow&&all&&!full?sm(clamp((now-L.t0)/L.dur)):1);/* a slow bleed caught part-way keeps only what had come through so far; it no longer holds up the others */baked.x.drawImage(L.c,L.x,L.y);baked.x.restore();freeC(L.c);dirty=true}else keep.push(L)}bleedL.length=0;bleedL.push(...keep)}
function runHaze(x0,y0,w,dye,s){if(!RUNL.c.width||!s||!s.wet)return;const P=dpr,h=Math.max(4,RUNL.c.height-y0);if(w<4)return;
 const sc=4,bw=Math.max(8,Math.ceil(w/sc)),bh=Math.max(8,Math.ceil(h/sc)),dc=document.createElement('canvas');dc.width=bw;dc.height=bh;const dx=dc.getContext('2d');
 try{dx.filter=`blur(${(5*P/sc*2).toFixed(1)}px)`}catch(_){}dx.drawImage(RUNL.c,x0,y0,w,h,0,0,bw,bh);dx.drawImage(RUNL.c,x0,y0,w,h,0,0,bw,bh);dx.drawImage(idm.c,x0,y0,w,h,0,0,bw,bh);dx.filter='none';
 try{const im=dx.getImageData(0,0,bw,bh),dd=im.data,rgb=hex(dye);for(let j=0;j<bh;j++)for(let i=0;i<bw;i++){const q=(j*bw+i)*4,al=dd[q+3]/255,dens=clamp((al-.18)/.6);if(dens<=0){dd[q+3]=0;continue}
   const X=(x0+i*sc)/P,Y=(y0+j*sc)/P,wf=wetF(X,Y),pt=vnz(X/45+Y/160,7)*vnz(Y/70,13);/* patchy: how wet it is here decides how far the dye spreads */
   const a=Math.min(1,dens*(.1+1.5*wf*wf)*(.15+1.6*pt*pt));dd[q]=rgb[0];dd[q+1]=rgb[1];dd[q+2]=rgb[2];dd[q+3]=Math.round(255*a)}dx.putImageData(im,0,0)}catch(_){freeC(dc);return}
 const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.imageSmoothingEnabled=true;x.drawImage(dc,0,0,bw,bh,0,0,w,h);freeC(dc);
 /* it sits under the black letters, not over them */x.globalCompositeOperation='destination-out';x.drawImage(idm.c,x0,y0,w,h,0,0,w,h);
 bleedL.push({c,x:x0,y:y0,t0:performance.now(),dur:3500,a:.68});dirty=true}
function busyHaze(x0,y0,w,h,dye,aMax,now){
 /* translucent haze pooled inside busy loops, tight turns, and overlapping strokes (fast 1/4-res density map) */
 const sc=4,bw=Math.max(8,Math.ceil(w/sc)),bh=Math.max(8,Math.ceil(h/sc)),dc=document.createElement('canvas');dc.width=bw;dc.height=bh;const dx=dc.getContext('2d');
 try{dx.filter=`blur(${Math.max(2.2,4.8*dpr/sc)}px)`}catch(_){}
 dx.drawImage(idm.c,x0,y0,w,h,0,0,bw,bh);
 dx.drawImage(stk.c,x0,y0,w,h,0,0,bw,bh);
 dx.drawImage(stk.c,x0,y0,w,h,0,0,bw,bh);
 dx.filter='none';
 try{
  const im=dx.getImageData(0,0,bw,bh),dd=im.data,rgb=hex(dye),P=dpr;
  for(let j=0;j<bh;j++)for(let i=0;i<bw;i++){
   const q=(j*bw+i)*4,al=dd[q+3]/255;
   /* threshold out isolated lone lines; keep busy clustered/overlapping zones */
   const dens=clamp((al-.28)/.56);
   if(dens<=0){dd[q+3]=0;continue}
   const wf=wetF((x0+i*sc)/P,(y0+j*sc)/P);
   const a=Math.min(1,dens*dens*(.28+1.1*wf));
   dd[q]=rgb[0];dd[q+1]=rgb[1];dd[q+2]=rgb[2];dd[q+3]=Math.round(255*a);
  }
  dx.putImageData(im,0,0);
 }catch(_){freeC(dc);return}
 const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');
 x.imageSmoothingEnabled=true;x.drawImage(dc,0,0,bw,bh,0,0,w,h);freeC(dc);
 /* the haze sits in the wet wall round the ink — never painted over letters already there */x.globalCompositeOperation='destination-out';x.drawImage(idm.c,x0,y0,w,h,0,0,w,h);
 bleedL.push({sid:stroke,c,x:x0,y:y0,t0:now+150,dur:1700,a:aMax});
}
function dyeSplit(s,col){const cast=CAST(pen.ink,col);if(!cast||demo||!upright)return false;buildWetField();
 /* reference wet tag: crisp black letter body on top, tight edge seep, translucent violet haze in busy overlapping parts, and patchy curtain of crisp runs */
 const wm=s.mean||[140,140,140],wl=(wm[0]*.3+wm[1]*.59+wm[2]*.11)/255,dye0=pen.ink==='stain'||pen.ink==='bleed'?'#6438b8':'#364ea8',dye=mixHex(dye0,'#000000',Math.max(0,.18-wl*.25)),P=dpr,pad=22,x0=Math.max(0,Math.floor((stroke.x0-pad)*P)),y0=Math.max(0,Math.floor((stroke.y0-pad)*P)),w=Math.min(stk.c.width-x0,Math.ceil((stroke.x1-stroke.x0+pad*2)*P)),h=Math.min(stk.c.height-y0,Math.ceil((stroke.y1-stroke.y0+pad*2)*P));if(w<4||h<4)return false;
 const now=performance.now();
 /* tight edge seep */
 {const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');try{x.filter=`blur(${2.6*P}px)`}catch(_){}x.drawImage(stk.c,x0,y0,w,h,0,0,w,h);x.filter='none';x.globalCompositeOperation='source-in';x.fillStyle=dye;x.fillRect(0,0,w,h);x.globalCompositeOperation='destination-out';x.drawImage(idm.c,x0,y0,w,h,0,0,w,h);bleedL.push({sid:stroke,c,x:x0,y:y0,t0:now+100,dur:1200,a:.14})}
 /* translucent haze pooled in busier/overlapping parts of the tag */
 busyHaze(x0,y0,w,h,dye,.64,now);
 /* once the runs have been going a while, the water they ran through carries dye out sideways: a hazy violet bloom where
    the runs are thick together, patchy because the wall is wetter in some places than others */
 {const bx0=x0,bw=w,by0=y0,s0=stroke.s;setTimeout(()=>runHaze(bx0,by0,bw,dye,s0),2400);setTimeout(()=>runHaze(bx0,by0,bw,dye,s0),5200)}
 /* patchy curtain of crisp violet/blue runs */
 wetWash(s,INK[pen.ink],col,{dye});
 /* crisp black letter body stays on top */
 {const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.drawImage(stk.c,x0,y0,w,h,0,0,w,h);x.drawImage(stk.c,x0,y0,w,h,0,0,w,h);x.globalCompositeOperation='source-in';x.fillStyle=col;x.fillRect(0,0,w,h);
  /* but on a wet wall the dye still sinks: thin the body where settle() lightened the top, so the light top isn't buried */
  const G=stroke.settleGS;if(G&&G.a>.03){x.globalCompositeOperation='destination-out';const m=x.createLinearGradient(G.sx-x0,G.sy-y0,G.ex-x0,G.ey-y0),O=G.O;m.addColorStop(0,`rgba(0,0,0,${G.a.toFixed(2)})`);m.addColorStop(G.LM1,`rgba(0,0,0,${(G.a*Math.min(1,G.LA1)).toFixed(2)})`);m.addColorStop(G.LM2,'rgba(0,0,0,0)');x.fillStyle=m;x.fillRect(0,0,w,h)}
  bleedL.push({c,x:x0,y:y0,t0:now,dur:1,a:1,top:1})}
 {const tops=bleedL.filter(q=>q.top),rest=bleedL.filter(q=>!q.top);bleedL.length=0;bleedL.push(...rest,...tops)}
 stroke.split=1;return true}
function wetDyeCurtain(s,ink,col,dcol){
 if(demo||!stroke||!upright||!s||!s.wet||ink.solid||ink.fluid||ink.etch)return;
 const Pt=stroke.pts||[],rr=R();if(Pt.length<4)return;
 const fl=fluidOf(pen.ink),pr=pen.props||{};
 /* Physics-driven dye split & capillary run-out:
    solK  = dye solubility in water (high for alcohol/stain/bleed dyes & penetrants; low for opaque oil/paint)
    flowK = fluidity from inverse viscosity (1/mu) + surfactant/penetrant surface-tension drop */
 const isDye=!!DYEINK[pen.ink]||pen.ink==='stain'||pen.ink==='bleed'||(pr.ghostBoost||0)>=.18;
 const solK=clamp((isDye?.95:(pen.ink==='water'?.85:.24))+(pr.bleedAdd||0)*.65+(pr.ghostBoost||0)*.55,.15,1.55);
 if(solK<.22)return;
 const flowK=clamp((1.12/Math.max(.42,fl.mu))*(1+(pr.bleedAdd||0)*.85+Math.max(0,1-fl.gamma)*.45),.42,1.95);
 const G=gDir();if(G.flat||G.m<.18)return;
 const gx=G.x/G.m,gy=G.y/G.m,nx=-gy,ny=gx;
 /* Build ragged, non-uniform tendril paths driven by local wetness wetF(x,y) & local ink load fh[ci] */
 const strands=[],baseStep=Math.max(2.2,Math.min(4.6,rr*.32));
 let t=baseStep*Math.random(),maxS=LOWGPU?190:340;
 for(let i=2;i<Pt.length&&strands.length<maxS;i+=2){
  const ax=Pt[i-2],ay=Pt[i-1],sl=Math.hypot(Pt[i]-ax,Pt[i+1]-ay);
  for(;t<=sl&&strands.length<maxS;t+=baseStep*(.45+Math.random()*1.15)){
   const k=sl?t/sl:0,px=ax+(Pt[i]-ax)*k,py=ay+(Pt[i+1]-ay)*k;
   const wk0=wetF(px,py);
   /* Dry patches on the wet wall (<0.20) barely bleed; soaked pockets (>0.50) pour out dense ragged curtains */
   if(wk0<.18&&Math.random()>.12)continue;
   const ci=inkCell(px,py),fhLoad=(fh&&fh[ci])?clamp(fh[ci],0,2.2):0;
   const loadK=.42+fhLoad*.72+Math.min(.45,Math.max(0,(pen.sat??0)-.65)*.55);
   const prob=clamp(Math.pow(wk0,1.15)*solK*loadK*.92,0,.95);
   if(Math.random()>prob)continue;
   const e=tipEdge(px,py,px,py,(Math.random()-.5)*rr*1.1);
   /* Power-law length distribution: dense ragged mid-curtains + occasional long weeping dye streams */
   const rL=Math.random();
   const lenBase=(rL<.16?(95+Math.random()*215):rL<.52?(34+Math.random()*92):(12+Math.random()*38));
   const len=clamp(lenBase*wk0*flowK*solK*(.52+fhLoad*.55),10,H*.72);
   const w0=Math.max(.75,Math.min(4.4,(.95+Math.random()*2.3)*(.55+wk0*.65)*(.7+fhLoad*.35)));
   const al=clamp((.22+Math.random()*.42)*Math.min(1.2,solK)*(.55+wk0*.55),.14,.74);
   const segs=Math.max(4,Math.min(18,Math.ceil(len/14)));
   const pts=[e[0],e[1]];
   let cx=e[0],cy=e[1],ph=Math.random()*TAU,wob=.6+Math.random()*1.6;
   for(let j=1;j<=segs;j++){
    const f=j/segs,st=len/segs;
    const drift=(Math.sin(f*6.5+ph)*.65+(Math.random()-.5)*1.1)*wob*(.35+f*.85);
    cx+=gx*st+nx*drift;cy+=gy*st+ny*drift;
    pts.push(cx,cy);
   }
   /* Optional fine horizontal capillary feather/wicking branch where a tendril crosses a wet bead */
   const tickAt=wk0>.42&&Math.random()<.34?(2+Math.floor(Math.random()*Math.max(1,segs-2))):-1;
   /* the dye travels down the wet film at the pace of the runs beside it (wet runs creep ~15-30 px/s), after the same pool-then-go wait, so curtain and drips move together */
   const vS=(13+Math.random()*13)*(.7+wk0*.5)*Math.min(1.3,flowK);
   strands.push({pts,w0,al,dly:650+Math.random()*1900,dur:Math.max(900,len/vS*1000),tickAt,tickW:(3+Math.random()*9)*(.6+wk0*.6)});
  }
  t-=sl;
 }
 /* the dye curtain runs in the wall's water film and stops at the ledge: cut each tendril where it meets it */
 if(ledgeLive()&&!LDG().sl){for(let k=strands.length-1;k>=0;k--){const p=strands[k].pts;let j=0;for(;j<p.length;j+=2)if(p[j+1]>ledgeY(p[j])-1)break;if(j<p.length){if(j<4){strands.splice(k,1);continue}strands[k].pts=p.slice(0,j)}}}
 if(!strands.length)return;
 /* Compute tight bounding box for the curtain canvas */
 let minX=1e9,minY=1e9,maxX=-1e9,maxY=-1e9;
 for(const st of strands){
  for(let j=0;j<st.pts.length;j+=2){
   const vx=st.pts[j],vy=st.pts[j+1];
   if(vx<minX)minX=vx;if(vx>maxX)maxX=vx;if(vy<minY)minY=vy;if(vy>maxY)maxY=vy;
  }
 }
 const P=dpr,pad=12,X0=Math.max(0,Math.floor((minX-pad)*P)),Y0=Math.max(0,Math.floor((minY-pad)*P));
 const X1=Math.min(baked.c.width,Math.ceil((maxX+pad)*P)),Y1=Math.min(baked.c.height,Math.ceil((maxY+pad)*P));
 const cw=X1-X0,ch=Y1-Y0;if(cw<4||ch<4)return;
 const c=document.createElement('canvas');c.width=cw;c.height=ch;const x=c.getContext('2d');
 const now=performance.now(),totalDur=strands.reduce((m,q)=>Math.max(m,q.dly+q.dur),0)+120,isDkSurf=s.id==='plastic';
 const baseCol=dcol||col,paleCol=washTint(baseCol);
 const L={
  sid:stroke,c,x:X0,y:Y0,t0:now,dur:totalDur,a:isDkSurf?.86:.92,
  comp:isDkSurf?'source-over':'multiply',live:1,lastT:0,
  upd(tNow){
   if(tNow-this.lastT<80&&tNow<this.t0+this.dur)return;
   this.lastT=tNow;
   x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,cw,ch);
   x.setTransform(P,0,0,P,-X0,-Y0);
   x.lineCap='round';x.lineJoin='round';
   for(let si=0;si<strands.length;si++){
    const st=strands[si],el=tNow-(now+st.dly);
    if(el<=0)continue;
    const u=clamp(el/st.dur,0,1),prog=u<.06?u*u/.12:1-Math.pow(1-u,1.45)*.97;/* a quick start once it lets go, a steady creep, then easing to a stop like a run */
    const nPts=st.pts.length/2,maxSeg=(nPts-1)*prog,full=Math.floor(maxSeg),frac=maxSeg-full;
    /* Soft capillary outer halo along the tendril so dense clusters merge into ragged vertical dye sheets */
    x.strokeStyle=paleCol;x.globalAlpha=st.al*.32;x.lineWidth=st.w0*2.15;
    x.beginPath();x.moveTo(st.pts[0],st.pts[1]);
    for(let j=1;j<=full;j++)x.lineTo(st.pts[j*2],st.pts[j*2+1]);
    if(full<nPts-1&&frac>.02){x.lineTo(st.pts[full*2]+(st.pts[(full+1)*2]-st.pts[full*2])*frac,st.pts[full*2+1]+(st.pts[(full+1)*2+1]-st.pts[full*2+1])*frac)}
    x.stroke();
    /* Core tapering watery dye filament (richer near stroke edge, thinner & fainter further down) */
    for(let j=0;j<full;j++){
     const f0=j/Math.max(1,nPts-1);
     x.strokeStyle=f0<.35?baseCol:paleCol;
     x.globalAlpha=st.al*(1-f0*.68);
     x.lineWidth=Math.max(.45,st.w0*(1-f0*.62));
     x.beginPath();x.moveTo(st.pts[j*2],st.pts[j*2+1]);x.lineTo(st.pts[(j+1)*2],st.pts[(j+1)*2+1]);x.stroke();
     if(j===st.tickAt){
      const tx0=st.pts[j*2],ty0=st.pts[j*2+1];
      x.globalAlpha=st.al*.28;x.lineWidth=.8;
      x.beginPath();x.moveTo(tx0-nx*st.tickW,ty0-ny*st.tickW);x.lineTo(tx0+nx*st.tickW,ty0+ny*st.tickW);x.stroke();
     }
    }
    if(full<nPts-1&&frac>.02){
     const f0=full/Math.max(1,nPts-1),xA=st.pts[full*2],yA=st.pts[full*2+1];
     const xB=xA+(st.pts[(full+1)*2]-xA)*frac,yB=yA+(st.pts[(full+1)*2+1]-yA)*frac;
     x.strokeStyle=f0<.35?baseCol:paleCol;x.globalAlpha=st.al*(1-f0*.68);x.lineWidth=Math.max(.45,st.w0*(1-f0*.62));
     x.beginPath();x.moveTo(xA,yA);x.lineTo(xB,yB);x.stroke();
    }
   }
   /* Cut out the crisp dark letter body so letters always sit razor-sharp on top of the weeping dye curtain */
   x.setTransform(1,0,0,1,0,0);x.globalAlpha=1;x.globalCompositeOperation='destination-out';
   x.drawImage(idm.c,X0,Y0,cw,ch,0,0,cw,ch);
   x.globalCompositeOperation='source-over';
  }
 };
 L.upd(now+60);
 bleedL.push(L);
}
function wetWash(s,ink,col,o){if(ink.solid||ink.fluid||ink.etch)return;const sp=o&&o.dye;
 const Pt=stroke.pts||[],rr=R();if(Pt.length<4)return;
 const stainy=(pen.ink==='stain'||pen.ink==='bleed')&&lum(hex(col))<.3,
  dcol=sp?mixHex(o.dye,col,.12):stainy?mixHex(pen.ink==='bleed'?'#6b42c8':'#5e38b8',col,.35):col,
  runK=Math.max(.75,ink.run||.9);
 buildWetField();
 wetDyeCurtain(s,ink,col,dcol);
 /* non-black wet inks also pool a translucent haze in busy overlapping parts */
 if(!sp){const P=dpr,pad=18,x0=Math.max(0,Math.floor((stroke.x0-pad)*P)),y0=Math.max(0,Math.floor((stroke.y0-pad)*P)),w=Math.min(stk.c.width-x0,Math.ceil((stroke.x1-stroke.x0+pad*2)*P)),h=Math.min(stk.c.height-y0,Math.ceil((stroke.y1-stroke.y0+pad*2)*P));if(w>=4&&h>=4)busyHaze(x0,y0,w,h,dcol,.36,performance.now())}
 /* walk the stroke at irregular spacing so wet patches burst with dense curtains while drier patches stay sparse */
 const baseStep=Math.max(4.5,Math.min(8,rr*.55));let t=baseStep*Math.random(),n=0,maxN=LOWGPU?74:120;
 for(let i=2;i<Pt.length&&n<maxN;i+=2){
  const ax=Pt[i-2],ay=Pt[i-1],sl=Math.hypot(Pt[i]-ax,Pt[i+1]-ay);
  for(;t<=sl&&n<maxN;t+=baseStep*(.65+Math.random()*.85)){
   const k=sl?t/sl:0,px=ax+(Pt[i]-ax)*k,py=ay+(Pt[i+1]-ay)*k,wk0=wetF(px,py);
   /* non-linear patchiness: dry zones (<0.18) barely drip, soaked zones (>0.65) pour */
   const wk=Math.pow(wk0,1.25),pScale=.08+wk*1.35,vScale=.22+wk0*1.45;
   const rPick=Math.random();
   if(rPick<.16*pScale&&wk0>.28){
    /* long skinny rain-curtain run reaching far down the wall (only in genuinely wet patches) */
    n++;const e=tipEdge(px,py,px,py,(Math.random()-.5)*rr*1.25);
    drip(e[0],e[1],(1.3+Math.pow(Math.random(),1.15)*3.1)*runK*vScale,{ty:pen.ink,col:dcol,r:.6+Math.random()*.75,al:sp?.9:.88,delay:60+Math.random()*1050,wash:1,w:rr});
   }else if(rPick<.36*pScale&&wk0>.16){
    /* chunkier real body drip hanging off the paint edge */
    n++;const e=tipEdge(px,py,px,py,(Math.random()-.5)*rr*1.15);
    drip(e[0],e[1],(.45+Math.random()*Math.random()*1.75)*runK*(.25+wk0*1.25),{ty:pen.ink,col:sp?mixHex(dcol,col,.25):dcol,r:Math.max(.85,Math.min(2.3,rr*(.05+Math.random()*.09))),delay:40+Math.random()*800,w:rr});
   }else if(rPick<.76*pScale){
    /* dense fine short-to-medium curtain drip */
    n++;const e=tipEdge(px,py,px,py,(Math.random()-.5)*rr*1.3);
    drip(e[0],e[1],(.18+Math.random()*.8)*runK*(.25+wk0*1.15),{ty:pen.ink,col:dcol,r:.5+Math.random()*.55,al:sp?.84:.8,delay:40+Math.random()*900,wash:1,w:rr});
   }
   /* Heavy ink pockets on the tag (overlaps, slow corners, heavy squeeze/dwell): pull down darker, thicker pigment runs too */
   const ciP=inkCell(px,py),fhLoad=(fh&&fh[ciP])?fh[ciP]:0;
   if(fhLoad>.24&&Math.random()<clamp((fhLoad-.20)*.58*(.45+wk0*.75),.06,.48)){
    n++;const e=tipEdge(px,py,px,py,(Math.random()-.5)*rr*.9);
    const pVol=(.42+Math.min(1.6,fhLoad*.85)+Math.random()*.75)*runK*(.45+wk0*.75);
    const pRad=Math.max(1.15,Math.min(2.8,rr*(.065+Math.random()*.085)+fhLoad*.35));
    drip(e[0],e[1],pVol,{ty:pen.ink,col:col,r:pRad,al:.96,thick:1,visc:1.22,pigRun:1,delay:90+Math.random()*750,w:rr});
   }
  }
  t-=sl;
 }
 /* mark the stroke area wet so it dries naturally */
 markWet((stroke.x0+stroke.x1)/2,(stroke.y0+stroke.y1)/2,Math.max(12,rr*1.5),.5,TAUS[pen.wet||pen.ink]*2)}
/* STAIN inks (OTR 070 etc.): the dark dye dries to a violet cast over the whole mark */
let BLOOMNZ=null;
function getBloomNoise(ctx){
 if(!BLOOMNZ){
  const s=128,c=document.createElement('canvas');c.width=s;c.height=s;
  const g=c.getContext('2d'),im=g.createImageData(s,s),d=im.data;
  /* smooth multi-octave tileable organic noise: breaks up bleed halo into wispy tendrils, never square */
  for(let y=0;y<s;y++)for(let x=0;x<s;x++){
   const u=x/s,v=y/s,n1=n(8,8,u,v),n2=n(20,20,u,v),n3=n(48,48,u,v);
   const val=clamp(.28+.54*n1+.28*n2+.18*n3-.22,0,1);
   const a=Math.round(Math.pow(val,1.15)*255),i=(y*s+x)*4;
   d[i]=255;d[i+1]=255;d[i+2]=255;d[i+3]=a;
  }
  g.putImageData(im,0,0);BLOOMNZ=c;
 }
 return ctx.createPattern(BLOOMNZ,'repeat');
}
function organicBloom(s,col){
 if(demo||!stroke||!s)return;
 const ink=INK[pen.ink];if(!ink||ink.solid||ink.etch||ink.chrome||ink.fluid)return;
 const juice=Math.max(stroke.lv||0,pen.squeeze?(pen.sat||0):pen.valve?(pen.flow||0):flowNow(null));
 const over=Math.max(0,juice-.96);
 const pr=pen.props||{};
 const chem=(pr.bleedAdd||0)+(pr.ghostBoost||0)*.55;
 let blurR=0,al=0;
 if(s.wet){
  /* wet surfaces: keep edge bloom tight & subtle so the gravity-driven wetDyeCurtain leads instead of a uniform airbrush halo */
  if(juice<.62)return;
  const wK=clamp((juice-.62)/.75);
  blurR=1.8+wK*2.2+Math.min(1.4,chem*1.8);
  al=clamp(.14+wK*.12+over*.16+chem*.12,.12,.34);
 }else{
  /* dry walls: only blooms modestly when over-juiced AND mixed with penetrating/staining chemistry */
  const hasChem=chem>=.16||pen.ink==='bleed'||(pen.ink==='stain'&&(s.absorb>.06||over>.14));
  if(over<=.04||!hasChem)return;
  const dK=clamp(over/.55);
  blurR=1.8+dK*3.2+Math.min(1.6,chem*2.1)+(s.absorb*1.8);
  al=clamp(.15+dK*.24+chem*.22,.14,.44);
 }
 const P=dpr,pad=Math.ceil((blurR*3.4+14)*P);
 const x0=Math.max(0,Math.floor(stroke.x0*P)-pad),y0=Math.max(0,Math.floor(stroke.y0*P)-pad);
 const w=Math.min(stk.c.width-x0,Math.ceil((stroke.x1-stroke.x0)*P)+pad*2);
 const h=Math.min(stk.c.height-y0,Math.ceil((stroke.y1-stroke.y0)*P)+pad*2);
 if(w<4||h<4)return;
 const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');
 /* two-pass padded blur along true stroke silhouette (zero square grid artifacts) */
 try{
  const _gB=s.wet&&upright?gDir():{x:0,y:0,m:0},_dxB=_gB.m>.15?(_gB.x/_gB.m)*blurR*.55*P:0,_dyB=_gB.m>.15?(_gB.y/_gB.m)*blurR*.55*P:0;
  x.filter=`blur(${(blurR*P).toFixed(1)}px)`;x.globalAlpha=.72;x.drawImage(stk.c,x0,y0,w,h,_dxB,_dyB,w,h);
  x.filter=`blur(${(blurR*.42*P).toFixed(1)}px)`;x.globalAlpha=.92;x.drawImage(stk.c,x0,y0,w,h,_dxB*.45,_dyB*.45,w,h);
  x.filter='none';
 }catch(_){x.drawImage(stk.c,x0,y0,w,h,0,0,w,h)}
 x.globalAlpha=1;
 /* tint with the ink's real chemical undertone */
 const isDk=typeof col==='string'&&col[0]==='#'&&lum(hex(col))<.22;
 const tint=pr.ghostCol||(isDk&&(pen.ink==='stain'||pen.ink==='bleed')?'#5a35a6':col);
 x.globalCompositeOperation='source-in';x.fillStyle=tint;x.fillRect(0,0,w,h);
 /* organic feathery edge breakup using randomized tile offset per stroke */
 x.save();x.globalCompositeOperation='destination-in';
 const ox=(Math.random()*128)|0,oy=(Math.random()*128)|0;
 x.translate(ox,oy);x.fillStyle=getBloomNoise(x);x.fillRect(-ox,-oy,w,h);x.restore();
 /* keep the crisp letter body clean on top — bloom only radiates outward onto the wall */
 x.globalCompositeOperation='destination-out';
 x.drawImage(stk.c,x0,y0,w,h,0,0,w,h);
 x.drawImage(idm.c,x0,y0,w,h,0,0,w,h);
 x.globalCompositeOperation='source-over';
 bleedL.push({sid:stroke,c,x:x0,y:y0,t0:performance.now()+120,dur:s.wet?1700:2600,a:al,comp:'multiply'});
}
function stainDry(){/* new ink covers the violet cast still forming underneath, so overlaps don't double up */for(const L of bleedL)if(L.stain){const x=L.c.getContext('2d');x.save();x.globalCompositeOperation='destination-out';x.drawImage(stk.c,-L.x,-L.y);x.restore()}
 if(!(pen.ink==='stain'||pen.ink==='bleed')||lum(hex(color))>.3||(stroke&&stroke.split))return;
 const P=dpr,pad=Math.ceil(4*P),x0=Math.max(0,Math.floor(stroke.x0*P)-pad),y0=Math.max(0,Math.floor(stroke.y0*P)-pad),w=Math.min(stk.c.width-x0,Math.ceil((stroke.x1-stroke.x0)*P)+pad*2),h=Math.min(stk.c.height-y0,Math.ceil((stroke.y1-stroke.y0)*P)+pad*2);if(w<2||h<2)return;
 const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');try{x.filter=`blur(${.8*P}px)`}catch(_){}x.drawImage(stk.c,x0,y0,w,h,0,0,w,h);x.filter='none';x.globalCompositeOperation='source-in';x.fillStyle=pen.ink==='bleed'?'#4a2f90':'#3b2a7c';x.fillRect(0,0,w,h);
 bleedL.push({c,x:x0,y:y0,t0:performance.now()+TAUS[pen.ink]*1400,dur:5000,a:.16,stain:1})}
/* after you stop buffing, the dye works back up through the wipe: a fainter ghost of the tag returns */
const ghostRet={t:0,x0:1e9,y0:1e9,x1:-1,y1:-1,k:0,cap:0,vio:0};
/* new paint goes ON TOP of a ghost that's still coming back: cut the fresh stroke out of the returning ghost, so every
   letter written over a buff looks the same however the timing fell */

function ghostFire(force){if(!ghostRet.t||(!force&&(performance.now()-ghostRet.t<350||down)))return;const x0=Math.max(0,Math.floor(ghostRet.x0)),y0=Math.max(0,Math.floor(ghostRet.y0)),w=Math.min(ghost.c.width,Math.ceil(ghostRet.x1))-x0,h=Math.min(ghost.c.height,Math.ceil(ghostRet.y1))-y0,k=ghostRet.k;
 const vio=ghostRet.vio;ghostRet.t=0;ghostRet.x0=ghostRet.y0=1e9;ghostRet.x1=ghostRet.y1=-1;ghostRet.k=0;ghostRet.cap=0;ghostRet.vio=0;if(w<4||h<4||k<.02)return;
 const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');try{x.filter=`blur(${1.4*dpr}px)`}catch(_){}x.drawImage(ghost.c,x0,y0,w,h,0,0,w,h);x.filter='none';
 try{const im=x.getImageData(0,0,w,h),dd=im.data,th=(pad.th||0)+Math.PI/2,cx=Math.cos(th),sy=Math.sin(th),ph=Math.random()*9,S=3.2*dpr;for(let i=0;i<dd.length;i+=4){if(!dd[i+3])continue;const px=(i>>2)%w,py=(i>>2)/w|0,u=(px*cx+py*sy)/S;dd[i+3]*=.62+.38*(.5+.5*Math.sin(u+ph))*(.6+.4*Math.sin(u*.37+ph*2))}x.putImageData(im,0,0)}catch(_){}
 const g=ghost.x;g.save();g.setTransform(1,0,0,1,0,0);g.clearRect(x0,y0,w,h);g.restore();
 {/* a stain doesn't jump back: a faint first show, then the dye keeps wicking up through the wiped film for minutes */const c2=document.createElement('canvas');c2.width=w;c2.height=h;c2.getContext('2d').drawImage(c,0,0);const n0=performance.now();
 bleedL.push({c,x:x0,y:y0,t0:n0+150,dur:2500,a:k*.4,slow:1},{c:c2,x:x0,y:y0,t0:n0+2650,dur:11500,a:k*.6/(1-k*.4),slow:1})}/* about 15 s from the last rub to the full ghost */if(!saidGhost++)toast('The tag is ghosting back through the buff')}
setInterval(()=>ghostFire(false),500);
let saidGhost=0;
function runBleed(now){if(!bleedQ.length)return;const bx=baked.x;
 for(let i=bleedQ.length-1;i>=0;i--){const q=bleedQ[i];if(now<q.t)continue;q.t=now+220+Math.random()*120;q.k++;if(q.ghost&&q.k===1&&!saidGhost++)toast('The dye ink is ghosting back through the buff');
  {const r=q.rr*2.2*Math.min(1.5,.7+q.k*.12);bx.save();bx.globalAlpha=q.ghost?.05:.06;bx.translate(q.x+(Math.random()-.5)*4,q.y+(Math.random()-.5)*4);bx.rotate(Math.random()*TAU);bx.drawImage(feather(q.col),-r,-r,2*r,2*r);bx.restore()}if(q.k>=q.max)bleedQ.splice(i,1)}
 dirty=true}

const DYEB={solid:.02,stain:1,bleed:.9,alcohol:.55,flow:.6,future:.7,water:.2,alcpaint:.12,oil:.05,fluid:.03,chrome:.05,etch:0},pad={load:0,col:null,th:0};
