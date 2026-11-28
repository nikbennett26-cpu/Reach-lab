/* ---------- 3D GLASS REFLECTION & SHADOW (opaque dark shadow + alcohol colour-tinted shadow + back-surface reflection) ---------- */
/* Each ink is different on glass. A thick, opaque film blocks the light, so it casts a darker shadow on whatever is behind the glass.
   A thin dye only tints the light passing through it. How strongly the tag shows in the reflection depends on how glossy the dried
   film is: enamel and high-gloss inks are mirror-like, satin paint less so, and matte water-based paint and plain dye least. */
const G3SHADOW={oil:1,fluid:.95,alcpaint:.9,chrome:.88,water:.74},G3TINT={stain:1.2,bleed:1.1,flow:1.05,alcohol:.9,future:.85},
 G3REFL={flow:1.25,chrome:1.35,oil:1.15,alcpaint:.85,fluid:.7,future:.75,stain:.6,bleed:.55,alcohol:.5,water:.4};
function rebuildGlass3D(){
 const BW=baked.c.width,BH=baked.c.height;if(!BW||!BH)return;
 const hw=Math.max(1,Math.ceil(BW/2)),hh=Math.max(1,Math.ceil(BH/2));
 const mkC=(c,w,h)=>{if(!c)c=document.createElement('canvas');if(c.width!==w||c.height!==h){c.width=w;c.height=h}return c};
 g3All=mkC(g3All,hw,hh);g3Opq=mkC(g3Opq,hw,hh);g3Dye=mkC(g3Dye,hw,hh);g3Tmp=mkC(g3Tmp,hw,hh);
 const ax=g3All.getContext('2d');ax.setTransform(1,0,0,1,0,0);
 const ox=g3Opq.getContext('2d',{willReadFrequently:true}),dx=g3Dye.getContext('2d',{willReadFrequently:true}),tx=g3Tmp.getContext('2d',{willReadFrequently:true});
 ox.setTransform(1,0,0,1,0,0);ox.clearRect(0,0,hw,hh);
 dx.setTransform(1,0,0,1,0,0);dx.globalCompositeOperation='copy';dx.drawImage(baked.c,0,0,BW,BH,0,0,hw,hh);
 tx.setTransform(1,0,0,1,0,0);tx.globalCompositeOperation='copy';tx.drawImage(idm.c,0,0,BW,BH,0,0,hw,hh);
 try{
  const idD=tx.getImageData(0,0,hw,hh).data,bkI=dx.getImageData(0,0,hw,hh),bkD=bkI.data;
  const opI=ox.createImageData(hw,hh),opD=opI.data,rfI=ax.createImageData(hw,hh),rfD=rfI.data;
  const keys=Object.keys(INK);
  for(let i=0;i<idD.length;i+=4){
   const a=idD[i+3];if(a<10){bkD[i+3]=0;continue}
   const idx=Math.round(idD[i]/20)-1,ty=keys[idx];
   if(!ty||ty==='etch'){bkD[i+3]=0;continue}
   rfD[i]=bkD[i];rfD[i+1]=bkD[i+1];rfD[i+2]=bkD[i+2];rfD[i+3]=Math.min(255,a*(G3REFL[ty]??.7));
   if(DYEINK[ty]){
    const r=bkD[i],g=bkD[i+1],b=bkD[i+2],m=(r+g+b)/3;
    bkD[i]=clamp(Math.round(m+(r-m)*1.35),0,255);
    bkD[i+1]=clamp(Math.round(m+(g-m)*1.35),0,255);
    bkD[i+2]=clamp(Math.round(m+(b-m)*1.35),0,255);
    bkD[i+3]=Math.min(255,a*(G3TINT[ty]??1));
   }else{
    bkD[i+3]=0;
    opD[i]=4;opD[i+1]=5;opD[i+2]=8;opD[i+3]=a*(G3SHADOW[ty]??.85);
   }
  }
  ox.putImageData(opI,0,0);dx.putImageData(bkI,0,0);ax.putImageData(rfI,0,0);
 }catch(_){}
 g3Dirty=false;g3At=performance.now();
}
function drawGlass3D(x){
 if(!W||!lightOn)return;
 const sf=bands&&bands[0]&&bands[0].s;if(!sf||(sf.id!=='glass'&&sf.base!=='glass'))return;
 const BW=baked.c.width,BH=baked.c.height;if(!BW||!BH)return;
 const k=BW+'x'+BH;if(g3Key!==k){g3Key=k;g3Dirty=true}
 if(g3Dirty&&(!down||performance.now()-g3At>110))rebuildGlass3D();
 if(!g3All||!g3Opq||!g3Dye)return;
 const P=dpr,tx=clamp((tilt&&tilt.x)||0,-1,1),ty=clamp((tilt&&tilt.y)||0,-1,1);
 const rx=(3.6+tx*6.5)*P,ry=(4.8+ty*6.5)*P;
 const sx=rx*1.48,sy=ry*1.48;
 const clipY=(ledgeOn&&isGlassPhoto())?Math.round(LDG().y*P):BH;
 const mkC=(c,w,h)=>{if(!c)c=document.createElement('canvas');if(c.width!==w||c.height!==h){c.width=w;c.height=h}return c};
 g3Out=mkC(g3Out,BW,BH);g3Mul=mkC(g3Mul,BW,BH);
 const ox=g3Out.getContext('2d'),mx=g3Mul.getContext('2d');
 const hasLive=!!(stroke&&!(INK[pen.ink]&&INK[pen.ink].etch));
 const liveDye=hasLive&&!!DYEINK[pen.ink];
 mx.setTransform(1,0,0,1,0,0);mx.clearRect(0,0,BW,BH);
 mx.save();mx.beginPath();mx.rect(0,0,BW,clipY);mx.clip();
 mx.imageSmoothingEnabled=true;
 mx.globalCompositeOperation='source-over';mx.globalAlpha=0.58;
 mx.drawImage(g3Dye,0,0,g3Dye.width,g3Dye.height,sx,sy,BW,BH);
 if(liveDye){mx.globalAlpha=0.52*(G3TINT[pen.ink]??1);mx.drawImage(stk.c,sx,sy)}
 mx.globalCompositeOperation='destination-out';mx.globalAlpha=1;
 mx.drawImage(idm.c,0,0);if(hasLive)mx.drawImage(stk.c,0,0);
 mx.restore();
 ox.setTransform(1,0,0,1,0,0);ox.clearRect(0,0,BW,BH);
 ox.save();ox.beginPath();ox.rect(0,0,BW,clipY);ox.clip();
 ox.imageSmoothingEnabled=true;
 ox.globalCompositeOperation='source-over';ox.globalAlpha=0.84;
 ox.drawImage(g3Opq,0,0,g3Opq.width,g3Opq.height,sx,sy,BW,BH);
 if(hasLive&&!liveDye){
  const lx=g3Tmp.getContext('2d');lx.setTransform(1,0,0,1,0,0);lx.globalCompositeOperation='copy';lx.drawImage(stk.c,0,0,BW,BH,0,0,g3Tmp.width,g3Tmp.height);
  lx.globalCompositeOperation='source-in';lx.fillStyle='#040508';lx.fillRect(0,0,g3Tmp.width,g3Tmp.height);
  ox.globalAlpha=0.84*(G3SHADOW[pen.ink]??.85);ox.drawImage(g3Tmp,0,0,g3Tmp.width,g3Tmp.height,sx,sy,BW,BH);
 }
 ox.globalAlpha=0.16;ox.drawImage(g3All,0,0,g3All.width,g3All.height,rx,ry,BW,BH);
 if(hasLive){ox.globalAlpha=0.15*(G3REFL[pen.ink]??.7);ox.drawImage(stk.c,rx,ry)}
 ox.globalCompositeOperation='destination-out';ox.globalAlpha=1;
 ox.drawImage(idm.c,0,0);if(hasLive)ox.drawImage(stk.c,0,0);
 ox.restore();
 x.save();x.setTransform(1,0,0,1,0,0);
 x.globalCompositeOperation='multiply';x.globalAlpha=1;x.drawImage(g3Mul,0,0);
 x.globalCompositeOperation='source-over';x.globalAlpha=1;x.drawImage(g3Out,0,0);
 x.restore();
}
function compose(){const x=dctx;x.save();x.setTransform(1,0,0,1,0,0);x.globalCompositeOperation='source-over';x.globalAlpha=1;x.drawImage(baked.c,0,0);{const dkSurf=cur&&cur.id==='plastic';x.save();x.globalCompositeOperation=dkSurf?'source-over':'multiply';x.globalAlpha=1;gvUpdate();x.drawImage(ghostV.c,0,0);x.globalCompositeOperation=dkSurf?'source-over':'multiply';x.globalAlpha=1;x.drawImage(smearC.c,0,0);x.restore()}if(waterOn){x.imageSmoothingEnabled=true;x.drawImage(waterCv,0,0,GW*C*dpr,GH_*C*dpr)}for(const m of mist){x.globalAlpha=.7*(1-(performance.now()-m.t0)/420);x.fillStyle='#e6f2ff';x.beginPath();x.arc(m.x*dpr,m.y*dpr,m.s*dpr,0,TAU);x.fill()}x.globalAlpha=1;for(const L of bleedL){if(L.live){L.upd(performance.now());x.globalAlpha=L.a}else x.globalAlpha=L.a*sm(clamp((performance.now()-L.t0)/L.dur));if(L.comp)x.globalCompositeOperation=L.comp;x.drawImage(L.c,L.x,L.y);if(L.comp)x.globalCompositeOperation='source-over'}x.globalAlpha=1;for(const p of chromes){x.globalAlpha=sm(clamp((performance.now()-p.t0)/p.dur));x.drawImage(p.c,p.x,p.y)}x.globalAlpha=1;if(ewOn&&EWET.c.width){x.globalAlpha=ewA;x.drawImage(EWET.c,0,0);x.globalAlpha=1}if((etchOn&&etchL.c.width)||etS){if(etvDirty||ETV.width!==baked.c.width)renderETV(etS?etvP:0);x.globalAlpha=etK;x.drawImage(ETV,0,0);x.globalAlpha=1;if(etS)x.drawImage(ETW,0,0)}drawFJ(x);drawShift(x);drawFalls(x);drawLiveDrips(x);x.setTransform(1,0,0,1,0,0);drawShine(x);drawGloss(x);drawLight(x);
 if(stroke){x.save();applyInk(x,stroke.ink,stroke.s);x.drawImage(stk.c,0,0);
  if(down&&stroke.cp&&livePt){const a=stroke.cp,b=predPt||livePt,d=Math.hypot(b.x-a.x,b.y-a.y);if(d>.5&&d<120){x.setTransform(dpr,0,0,dpr,0,0);x.fillStyle=inkPat(stroke.s,curCol(),0);tipCtx=x;const n=Math.ceil(d/Math.max(.8,R()*.5));for(let i=1;i<=n;i++){const t=i/n;tipPath(0,a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t);x.fill()}tipCtx=null;x.setTransform(1,0,0,1,0,0)}}
  x.restore()}
 drawGlints(x);flkTx=tilt.x;flkTy=tilt.y;
 drawGlass3D(x);
 drawStairsLight(x);
 if(isGlassPhoto()&&CP.v){if(typeof tilt!=='undefined'&&tilt&&Math.abs((tilt.x||0)-cillTilt)>.04)cillDirty=true;{const dk=poolDry(CP);if(dk<1&&performance.now()-(CP.rt||0)>350){CP.rt=performance.now();cillDirty=true;dirty=true}}drawCill();x.setTransform(1,0,0,1,0,0);x.globalAlpha=1;x.globalCompositeOperation='source-over';x.drawImage(cillC,0,0)}
 if(SPOOL.length&&bands[0]&&bands[0].s.id==='stairs'){for(const P of SPOOL)if(P&&poolDry(P)<1&&performance.now()-(P.rt||0)>350){P.rt=performance.now();stDirty=true;dirty=true}drawStairPools();x.setTransform(1,0,0,1,0,0);x.globalAlpha=1;x.globalCompositeOperation='source-over';x.drawImage(stC,0,0)}
 if(railC&&railC.width&&ledgeLive()&&LDG().sl){x.setTransform(1,0,0,1,0,0);x.globalAlpha=1;x.globalCompositeOperation='source-over';x.drawImage(railC,0,0)}
 if(stroke&&stroke.priming&&down&&last&&pen.flow<.6){x.save();x.setTransform(dpr,0,0,dpr,0,0);const r=R()+10;x.lineWidth=3;x.strokeStyle='rgba(0,0,0,.35)';x.beginPath();x.arc(last.x,last.y,r,0,TAU);x.stroke();x.strokeStyle='#ff5a1f';x.beginPath();x.arc(last.x,last.y,r,-Math.PI/2,-Math.PI/2+TAU*clamp(pen.flow/.55));x.stroke();x.restore()}
 if(twist){x.save();x.setTransform(dpr,0,0,dpr,0,0);x.translate(twist.mid.x,twist.mid.y);x.rotate(angle*Math.PI/180);const w=pen.w*MM,t=pen.th*MM;x.fillStyle='rgba(255,90,31,.25)';x.strokeStyle='#ff5a1f';x.lineWidth=2;x.fillRect(-w/2,-t/2,w,t);x.strokeRect(-w/2,-t/2,w,t);x.rotate(-angle*Math.PI/180);x.fillStyle='#ff5a1f';x.font='600 14px Archivo,sans-serif';x.textAlign='center';x.fillText(angle+'°',0,-w/2-10);x.restore()}
 if(!(LOWGPU&&down)&&!lightOn)for(const k in WET){const w=WET[k];if(!w.active)continue;x.globalCompositeOperation='screen';if(!LOWGPU){x.globalAlpha=.025;x.drawImage(w.c,0,0)}x.globalAlpha=.07;x.drawImage(w.c,-dpr,-dpr)}
 x.restore()}

