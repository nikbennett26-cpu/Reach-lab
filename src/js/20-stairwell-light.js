/* ---------- STAIRWELL LIGHT INTERACTION: strip-light specular sheen on wet/glossy tags, directional falloff, ribbed concrete bump, & 3D backlit fixture ---------- */
let slC=null,slSp=null,slRib=null,slKey='',slAt=0,slTilt=[0,0],slForce=true;slForce=true;
let slFixBg=null,slLensM=null,slFMask=null,slFRel=null,slFBack=null,slFCore=null,slFixKey='',slFixDirty=true,slFixTouched=false,slFixAt=0;
/* the stairwell strip light: the photo's tube is blown out and blooms over its housing. Pull the highlights back so the metal housing reads
   again, then sit a louvred diffuser panel in it — the light stays inside its box instead of glaring across the wall */
function stairsLamp(x,g){const F=stairsFixtureGeom(g),P=dpr,m=F.fh*.9;
 try{const X0=Math.max(0,Math.floor((F.fx0-m)*P)),Y0=Math.max(0,Math.floor((F.fy0-m)*P)),X1=Math.min(bg.c.width,Math.ceil((F.fx0+F.fw+m)*P)),Y1=Math.min(bg.c.height,Math.ceil((F.fy0+F.fh+m)*P)),w=X1-X0,h=Y1-Y0;
  if(w>4&&h>4){const c=bg.c.getContext('2d');c.save();c.setTransform(1,0,0,1,0,0);const im=c.getImageData(X0,Y0,w,h),d=im.data,fx0=F.fx0*P-X0,fy0=F.fy0*P-Y0,fx1=fx0+F.fw*P,fy1=fy0+F.fh*P,mm=m*P;
   for(let y=0;y<h;y++)for(let i=0;i<w;i++){const dx=Math.max(fx0-i,0,i-fx1),dy=Math.max(fy0-y,0,y-fy1),k=Math.max(0,1-Math.hypot(dx,dy)/mm);if(k<=0)continue;const q=(y*w+i)*4,L=d[q]*.299+d[q+1]*.587+d[q+2]*.114;
    /* soft knee: anything brighter than mid-grey is compressed hard (the bloom), the darker housing edges barely change */
    const t=L>120?120+(L-120)*.42:L,f=L>0?1+(t/L-1)*k:1;d[q]*=f;d[q+1]*=f;d[q+2]*=f}
   c.putImageData(im,X0,Y0);c.restore()}}catch(_){}
 const lx=F.tx0-F.tw*.07,ly=F.ty0,lw=F.tw*1.135,lh=F.th;x.save();
 /* the recess the panel sits in: a dark gap all round, so the light is clearly inside the housing */
 x.save();try{x.filter='blur(.8px)'}catch(_){}x.fillStyle='rgba(22,22,24,.6)';x.fillRect(lx-2,ly-1.6,lw+4,lh+3.2);x.filter='none';x.restore();
 /* diffuser: warm white, brightest in the middle, dimmer to the ends and edges */
 let gr=x.createLinearGradient(0,ly,0,ly+lh);gr.addColorStop(0,'#cfc8b6');gr.addColorStop(.3,'#f1ecdd');gr.addColorStop(.6,'#f6f1e3');gr.addColorStop(1,'#bdb6a4');x.fillStyle=gr;x.fillRect(lx,ly,lw,lh);
 gr=x.createLinearGradient(lx,0,lx+lw,0);gr.addColorStop(0,'rgba(60,55,45,.35)');gr.addColorStop(.12,'rgba(60,55,45,0)');gr.addColorStop(.88,'rgba(60,55,45,0)');gr.addColorStop(1,'rgba(60,55,45,.35)');x.fillStyle=gr;x.fillRect(lx,ly,lw,lh);
 /* the louvre slats across the panel, each catching a little shadow */
 const n=Math.max(14,Math.round(lw/7)),sw=lw/n;for(let i=1;i<n;i++){const sx=lx+i*sw;x.fillStyle='rgba(70,64,52,.2)';x.fillRect(sx-.5,ly,1,lh);x.fillStyle='rgba(255,255,255,.22)';x.fillRect(sx+.5,ly,.5,lh)}
 /* the housing lip shades the top of the panel */x.fillStyle='rgba(0,0,0,.25)';x.fillRect(lx,ly,lw,Math.max(1,lh*.14));
 /* only a faint glow escapes onto the housing right round the panel */
 x.globalCompositeOperation='screen';x.globalAlpha=.18;try{x.filter='blur('+(lh*.35).toFixed(1)+'px)'}catch(_){}x.fillStyle='#fff6e2';x.fillRect(lx-1,ly-1,lw+2,lh+2);x.filter='none';
 x.restore()}
function stairsFixtureGeom(g){
 const fx0=g.ox+g.w*.334,fy0=g.oy+g.h_im*.196,fw=g.w*.460,fh=g.h_im*.086;
 const tx0=g.ox+g.w*.396,ty0=g.oy+g.h_im*.212,tw=g.w*.342,th=g.h_im*.043;
 return {fx0,fy0,fw,fh,tx0,ty0,tw,th};
}
function ensureStairsFixture(g){
 const F=stairsFixtureGeom(g),P=dpr;
 const FX=Math.max(0,Math.floor(F.fx0*P)),FY=Math.max(0,Math.floor(F.fy0*P)),FW=Math.max(8,Math.min(bg.c.width-FX,Math.ceil(F.fw*P))),FH=Math.max(8,Math.min(bg.c.height-FY,Math.ceil(F.fh*P)));
 const TX=Math.max(0,Math.floor(F.tx0*P)),TY=Math.max(0,Math.floor(F.ty0*P)),TW=Math.max(8,Math.min(bg.c.width-TX,Math.ceil(F.tw*P))),TH=Math.max(6,Math.min(bg.c.height-TY,Math.ceil(F.th*P)));
 const fk=FX+','+FY+','+FW+','+FH+':'+W+'x'+H;
 if(slFixKey===fk&&slFixBg)return {FX,FY,FW,FH,TX,TY,TW,TH,F};
 slFixKey=fk;slFixDirty=true;
 if(!slFixBg)slFixBg=document.createElement('canvas');slFixBg.width=FW;slFixBg.height=FH;
 const bx=slFixBg.getContext('2d');bx.setTransform(1,0,0,1,0,0);bx.clearRect(0,0,FW,FH);
 bx.drawImage(bg.c,FX,FY,FW,FH,0,0,FW,FH);
 try{
  const im=bx.getImageData(0,0,FW,FH),d=im.data;
  for(let y=0;y<FH;y++)for(let i=0;i<FW;i++){
   const q=(y*FW+i)*4;
   let L=d[q]*.299+d[q+1]*.587+d[q+2]*.114;
   let v=128+(L-148)*1.55;
   const gx=FX+i,gy=FY+y;
   if(gx>=TX&&gx<TX+TW&&gy>=TY&&gy<TY+TH){
    const fl=Math.sin((i/Math.max(1,P))*1.7)*14+Math.sin((y/Math.max(1,P))*2.4)*6;
    v=128+(v-128)*.45+fl;
   }
   v=Math.max(12,Math.min(248,v));
   d[q]=v;d[q+1]=v;d[q+2]=v;d[q+3]=255;
  }
  bx.putImageData(im,0,0);
 }catch(_){}
 if(!slLensM)slLensM=document.createElement('canvas');slLensM.width=TW;slLensM.height=TH;
 const lx=slLensM.getContext('2d'),lim=lx.createImageData(TW,TH),ld=lim.data;
 for(let y=0;y<TH;y++){
  const ny=(y/(TH-1||1))*2-1,vy=Math.exp(-ny*ny*2.1);
  for(let i=0;i<TW;i++){
   const nx=(i/(TW-1||1))*2-1,vx=1-Math.pow(Math.abs(nx),3.6);
   const flute=.90+.10*Math.sin((i/Math.max(1,P))*1.8);
   const a=Math.max(0,Math.min(1,vx*vy*flute));
   const q=(y*TW+i)*4;
   ld[q]=255;ld[q+1]=253;ld[q+2]=242;ld[q+3]=Math.round(a*255);
  }
 }
 lx.putImageData(lim,0,0);
 for(const pair of [[0,FW,FH],[1,FW,FH],[2,TW,TH],[3,TW,TH]]){
  const [idx,cw,ch]=pair;
  if(idx===0){if(!slFMask)slFMask=document.createElement('canvas');slFMask.width=cw;slFMask.height=ch}
  if(idx===1){if(!slFRel)slFRel=document.createElement('canvas');slFRel.width=cw;slFRel.height=ch}
  if(idx===2){if(!slFBack)slFBack=document.createElement('canvas');slFBack.width=cw;slFBack.height=ch}
  if(idx===3){if(!slFCore)slFCore=document.createElement('canvas');slFCore.width=cw;slFCore.height=ch}
 }
 return {FX,FY,FW,FH,TX,TY,TW,TH,F};
}
function drawStairsFixture(x,g){
 const B=ensureStairsFixture(g);if(!B)return;
 const {FX,FY,FW,FH,TX,TY,TW,TH,F}=B,ox=TX-FX,oy=TY-FY,pad=24;
 /* check if the active live stroke actually overlaps the fixture box */
 let liveHit=false;
 if(stroke&&stroke.x1>=stroke.x0){
  liveHit=!(stroke.x1+pad<F.fx0||stroke.x0-pad>F.fx0+F.fw||stroke.y1+pad<F.fy0||stroke.y0-pad>F.fy0+F.fh);
  if(liveHit)slFixTouched=true;
 }
 if(!slFixTouched&&!slFixDirty)return;
 const now=performance.now();
 const needRebuild=slFixDirty||(liveHit&&now-slFixAt>(LOWGPU?48:24))||(drips.length&&!down&&now-slFixAt>180);
 if(needRebuild){
  slFixDirty=false;slFixAt=now;
  /* 1. Build ink mask inside fixture rect (offscreen only — never read from live screen canvas!) */
  const mx=slFMask.getContext('2d');
  mx.setTransform(1,0,0,1,0,0);mx.globalCompositeOperation='copy';mx.clearRect(0,0,FW,FH);
  mx.globalCompositeOperation='source-over';
  mx.drawImage(idm.c,FX,FY,FW,FH,0,0,FW,FH);
  if(liveHit)mx.drawImage(stk.c,FX,FY,FW,FH,0,0,FW,FH);
  /* 2. Emboss 3D metal bezel & frosted diffuser texture onto ink */
  const rx=slFRel.getContext('2d');
  rx.setTransform(1,0,0,1,0,0);rx.globalCompositeOperation='copy';rx.drawImage(slFixBg,0,0);
  rx.globalCompositeOperation='destination-in';rx.drawImage(slFMask,0,0);
  /* 3. Backlit fluorescent transmission built purely from offscreen baked.c + stk.c (zero GPU readback stall) */
  const bx=slFBack.getContext('2d');
  bx.setTransform(1,0,0,1,0,0);bx.globalCompositeOperation='copy';
  bx.drawImage(baked.c,TX,TY,TW,TH,0,0,TW,TH);
  if(liveHit){bx.save();applyInk(bx,stroke.ink,stroke.s);bx.drawImage(stk.c,TX,TY,TW,TH,0,0,TW,TH);bx.restore()}
  bx.globalCompositeOperation='destination-in';bx.drawImage(slFMask,ox,oy,TW,TH,0,0,TW,TH);
  bx.globalCompositeOperation='destination-in';bx.drawImage(slLensM,0,0);
  /* 4. Warm-white fluorescent core punch-through mask */
  const cx=slFCore.getContext('2d');
  cx.setTransform(1,0,0,1,0,0);cx.globalCompositeOperation='copy';cx.drawImage(slLensM,0,0);
  cx.globalCompositeOperation='destination-in';cx.drawImage(slFMask,ox,oy,TW,TH,0,0,TW,TH);
 }
 if(!slFixTouched)return;
 x.save();x.setTransform(1,0,0,1,0,0);
 x.globalCompositeOperation='hard-light';x.globalAlpha=.68;x.drawImage(slFRel,FX,FY);
 x.globalCompositeOperation='multiply';x.globalAlpha=.42;x.drawImage(slFRel,FX,FY);
 x.globalCompositeOperation='lighter';x.globalAlpha=.26;x.drawImage(slFBack,TX,TY);
 x.imageSmoothingEnabled=true;x.globalAlpha=.10;x.drawImage(slFBack,TX-TW*.04,TY-TH*.22,TW*1.08,TH*1.44);
 x.globalCompositeOperation='screen';x.globalAlpha=.10;x.drawImage(slFCore,TX,TY);
 x.restore();
}
function drawStairsLight(x){
 if(!W||!lightOn||!(bands[0]&&bands[0].s.id==='stairs'&&PHI.stairs))return;
 const g=stairsRailGeom(),F=stairsFixtureGeom(g),P=dpr,w=Math.max(8,Math.ceil(W/2)),h=Math.max(8,Math.ceil(H/2)),k=w+'x'+h;
 if(slKey!==k||!slC){
  slKey=k;
  if(!slC)slC=document.createElement('canvas');slC.width=w;slC.height=h;
  /* precompute vertical ribbed concrete normal-bump strip (light-side / shadow-side flutes) */
  if(!slRib)slRib=document.createElement('canvas');slRib.width=64;slRib.height=4;
  const rx=slRib.getContext('2d'),im=rx.createImageData(64,4),d=im.data;
  for(let i=0;i<64;i++){
   const ph=(i/64)*TAU*8,v=Math.sin(ph);
   /* warm lit edge on one side of each rib, cool shadow on the other */
   const r=v>0?255:20,gr=v>0?252:24,b=v>0?244:30,a=Math.round(Math.abs(v)*44);
   for(let j=0;j<4;j++){const q=(j*64+i)*4;d[q]=r;d[q+1]=gr;d[q+2]=b;d[q+3]=a}
  }
  rx.putImageData(im,0,0);
  slRib.pat=slC.getContext('2d').createPattern(slRib,'repeat');
  slForce=true;
 }
 const now=performance.now();
 if(slForce||(!down&&drips.length>0&&now-slAt>(LOWGPU?140:100))){
  slAt=now;slForce=false;
  const sx=slC.getContext('2d');
  const lx=(g.ox+g.w*.56)/2,ly=(g.oy+g.h_im*.23)/2,lr=Math.max(w,h)*.58;
  /* Directional overhead shadow falloff + ribbed concrete bump masked to painted tags (idm.c) */
  sx.setTransform(1,0,0,1,0,0);sx.globalCompositeOperation='copy';sx.drawImage(idm.c,0,0,w,h);
  sx.globalCompositeOperation='source-in';
  const dg=sx.createRadialGradient(lx,ly,lr*.06,lx,ly,lr*1.18);
  dg.addColorStop(0,'rgba(255,252,240,0.0)');dg.addColorStop(.28,'rgba(0,0,0,0.06)');dg.addColorStop(.68,'rgba(0,0,0,0.26)');dg.addColorStop(1,'rgba(0,0,0,0.48)');
  sx.fillStyle=dg;sx.fillRect(0,0,w,h);
  const pat=slRib.pat||(slRib.pat=sx.createPattern(slRib,'repeat'));
  if(pat){sx.globalCompositeOperation='source-atop';sx.fillStyle=pat;sx.fillRect(0,0,w,h)}
  /* keep concrete ribs off the metal light fixture */
  sx.clearRect(F.fx0/2,F.fy0/2,F.fw/2,F.fh/2);
 }
 x.save();x.setTransform(1,0,0,1,0,0);x.imageSmoothingEnabled=true;
 /* apply directional shadow + rib bump over the painted wall ink */
 x.globalCompositeOperation='source-over';x.globalAlpha=1;x.drawImage(slC,0,0,W*P,H*P);
 x.restore();
 /* apply 3D bezel relief + backlit colour-tinted light shining through any ink on the fixture (works live mid-stroke too) */
 drawStairsFixture(x,g);
}

