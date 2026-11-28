/* ---------- photo surfaces (from the user's reference photos) ---------- */
const PHSRC={stairs:'@@DATAURI:image/jpeg:photo-stairs.jpg@@',glass:'@@DATAURI:image/jpeg:photo-glass.jpg@@'};
const PHI={};for(const id in PHSRC){const im=new Image();im.onload=()=>{PHI[id]=im;const s=SURF.find(q=>q.id===id);if(s){const c=document.createElement('canvas');c.width=c.height=24;const x=c.getContext('2d');x.drawImage(im,0,0,24,24);const d=x.getImageData(0,0,24,24).data;const m=[0,0,0];for(let i=0;i<d.length;i+=4){m[0]+=d[i];m[1]+=d[i+1];m[2]+=d[i+2]}s.mean=m.map(v=>v/576);s.pats={}}
 if(typeof bands!=='undefined'&&bands.length&&bands[0].s.id===id&&W){renderBg();if(!inkG.some(v=>v)){baked.x.save();baked.x.setTransform(1,0,0,1,0,0);baked.x.clearRect(0,0,baked.c.width,baked.c.height);baked.x.drawImage(bg.c,0,0);baked.x.restore();dirty=true}}try{renderSurfs()}catch(_){}};im.src=PHSRC[id]}
const CILL=822/1024,CILLD=56/1024;/* back edge of the stone cill (where it meets the frame) and the depth of its flat top, as fractions of the photo *//* glass window photo: top of the stone cill, as a fraction of the photo's height */
function cillBase(H2=H){const b=ldgY!=null&&ldgY>H2*.45&&ldgY<H2-20?ldgY:Math.round(H2-Math.max(48,H2*.08));return b}
/* where a surface photo is drawn: cover the wall in portrait, and in landscape keep natural aspect while framing the cill/stairs cleanly */
function photoRect(id,im,W2,H2){
 if(id==='glass'){
  const base=cillBase(H2),r=Math.max(W2/im.width,base/(im.height*CILL)),w=im.width*r,h=im.height*r;
  /* in landscape, cap excessive zoom so you still see plenty of window height above the cill */
  const yTop=W2>H2?Math.max(base-h*CILL,-h*.38):base-h*CILL;
  return{x:(W2-w)/2,y:yTop,w,h};
 }
 if(id==='stairs'&&W2>H2){
  /* in landscape, frame the wall, handrail and upper steps cleanly without zooming into a tiny horizontal sliver */
  const r=Math.max(W2/im.width,H2/im.height),w=im.width*r,h=im.height*r;
  return{x:(W2-w)/2,y:-h*.24,w,h};
 }
 const r=Math.max(W2/im.width,H2/im.height),w=im.width*r,h=im.height*r;
 return{x:(W2-w)/2,y:(H2-h)/2,w,h};
}
function drawPhoto(x,im,X,Y,W2,H2,id){const q=photoRect(id,im,W2,H2);x.drawImage(im,X+q.x,Y+q.y,q.w,q.h);if(q.y+q.h<H2){/* run the bottom edge on down cleanly */const sh=im.height*.06;x.drawImage(im,0,im.height-sh,im.width,sh,X+q.x,Y+q.y+q.h-1,q.w,H2-(q.y+q.h)+2)}}
function stairsRailGeom(){
 const im=PHI.stairs;
 if(im&&W&&H){
  const q=photoRect('stairs',im,W,H),w=q.w,h=q.h,ox=q.x,oy=q.y;
  /* dropped a little below the photo's own line, to leave room to write above it */const dy=W>H?0:Math.max(0,Math.min(h*.075,H*.83-(oy+h*(452/598)))),x0=ox,y0=oy+h*(229/598)+dy,x1=ox+w*(372/452),y1=oy+h*(452/598)+dy,x2=ox+w*(400/452),y2=oy+h*(454/598)+dy;
  const sl=(y1-y0)/Math.max(1,x1-x0),yc=y0+sl*(W/2-x0),rh=Math.max(9,Math.min(16,Math.min(W,H)*0.026));
  return {y:yc,h:rh,sl,x0,y0,x1,y1,x2,y2,w,h_im:h,ox,oy,photo:1};
 }
 const base=ldgY!=null&&ldgY>H*.45&&ldgY<H-20?ldgY:Math.round(H-Math.max(56,H*.07));
 return {y:Math.round(base-Math.min(70,H*.07)),h:11,sl:.42,photo:0};
}
/* Concrete stair treads in the bottom-left of the subway stairwell photo (normalized u0,u1,vTop,vFront) */
/* SUBWAY STAIR TREADS, measured off the photo (u = across, v = down, as fractions of the photo). Each tread meets the
   wall along a short level back edge [u0..u1] at height v; the tread itself runs out toward the camera, which in the
   picture is down-and-left (TREAD_SK = dx/dy along it). Everything below a tread's back edge is tread, not wall. */
const STAIR_STEPS=[[0,.107,.703],[.107,.229,.757],[.229,.345,.811],[.345,.463,.865],[.463,.588,.920],[.588,.708,.974]],TREAD_SK=-.37;
function stairsStepAt(x,y){const g=stairsRailGeom();if(!g.photo)return null;
 for(let i=0;i<STAIR_STEPS.length;i++){const [u0,u1,v]=STAIR_STEPS[i],x0=g.ox+g.w*u0,x1=g.ox+g.w*u1,y0=g.oy+g.h_im*v;
  if(x>=x0-1&&x<=x1+1&&y>=y0-1&&y<=y0+Math.max(10,g.h_im*.03))return {idx:i,x0,x1,y0,y1:y0+10}}
 return null}
function renderBg(){grainV=(grainV||0)+1;const x=bg.x;x.clearRect(0,0,W,H);for(const b of bands){ensure(b.s);const p=x.createPattern(b.s.tile,'repeat');p.setTransform(new DOMMatrix([1/dpr,0,0,1/dpr,0,0]));x.fillStyle=p;x.fillRect(b.x,b.y,b.w,b.h);const im=PHI[b.s.id];if(im){x.save();drawPhoto(x,im,b.x,b.y,b.w,b.h,b.s.id);if(b.s.id!=='stairs'){x.globalCompositeOperation='overlay';x.globalAlpha=.22;x.fillStyle=p;x.fillRect(b.x,b.y,b.w,b.h)}else{const g=stairsRailGeom(),lx=g.ox+g.w*.56,ly=g.oy+g.h_im*.20,lr=Math.max(W,H)*.48,lg=x.createRadialGradient(lx,ly,lr*.04,lx,ly,lr);lg.addColorStop(0,'rgba(255,255,248,.05)');lg.addColorStop(.35,'rgba(255,255,245,.015)');lg.addColorStop(1,'rgba(0,0,0,.20)');x.fillStyle=lg;x.fillRect(b.x,b.y,b.w,b.h);stairsLamp(x,g)}x.restore()}else if(b.s.scene)b.s.scene(x,b.x,b.y,b.w,b.h)}if(bands[0]&&bands[0].s.wet)drawWetField(x);/* broad light from the upper left, baked into the wall */if(lightOn&&!(bands[0]&&bands[0].s.id==='stairs'&&PHI.stairs)){if(!LIT||LIT.width!==Math.ceil(W/2))buildLit();x.drawImage(LIT,0,0,W,H)}if(ledgeLive()){if(LDG().sl){/* the handrail stands in front of the wall: it lives on its own layer above everything painted, so ink, buffs and runs all go behind it */if(!railC)railC=document.createElement('canvas');railC.width=Math.round(W*dpr);railC.height=Math.round(H*dpr);const rx=railC.getContext('2d');rx.setTransform(dpr,0,0,dpr,0,0);drawLedge(rx)}else drawLedge(x)}}
let railC=null;
function drawLedge(x){if(isGlassPhoto())return;/* the photo's own stone cill is the ledge */const L=LDG(),m=(bands[0]&&bands[0].s.mean)||[140,140,140],c=k=>'rgb('+m.map(v=>Math.round(Math.max(0,Math.min(255,v*k)))).join(',')+')';x.save();
 if(L.sl){/* a brushed stainless handrail standing ~6cm off the wall on round-rose brackets: soft shadow on the wall (and any paint) below it, a cylinder lit from the ceiling strip lights, worn bright on top where hands slide, grubby underneath */
  const an=Math.atan(L.sl),rh=L.h,xs=L.photo?L.x0-40:-W,xe=L.photo?L.x1:W*2,ys=L.photo?L.y0-40*L.sl:ledgeY(xs),ye=L.photo?L.y1:ledgeY(xe),len=Math.hypot(xe-xs,ye-ys),off=rh*1.35;
  let sd=91173;const R=()=>(sd=(Math.imul(sd,1103515245)+12345)>>>0)/4294967296;
  const tube=(g,y0,h)=>{g.addColorStop(0,'#1c1e21');g.addColorStop(.07,'#6d7277');g.addColorStop(.17,'#d9dde0');g.addColorStop(.25,'#f2f4f5');g.addColorStop(.34,'#b9bec2');g.addColorStop(.5,'#80868b');g.addColorStop(.66,'#4a4f54');g.addColorStop(.8,'#3a3e43');g.addColorStop(.9,'#5e6368');g.addColorStop(1,'#1a1c1f');return g};
  /* 1. soft cast shadow on the wall, offset down because the rail stands proud of it */
  x.save();x.translate(xs,ys);x.rotate(an);try{x.filter='blur('+(rh*.45).toFixed(1)+'px)'}catch(_){}x.fillStyle='rgba(0,0,0,.30)';x.fillRect(0,off,len,rh*.85);x.fillStyle='rgba(0,0,0,.14)';x.fillRect(0,off-rh*.2,len,rh*1.4);x.filter='none';x.restore();
  if(L.photo){x.save();try{x.filter='blur('+(rh*.45).toFixed(1)+'px)'}catch(_){}x.fillStyle='rgba(0,0,0,.26)';x.fillRect(L.x1,L.y1+off,L.x2-L.x1,rh*.85);x.filter='none';x.restore()}
  /* 2. brackets: a round rose screwed to the wall below the rail, a bent arm up into a saddle under the tube */
  const bFracs=L.photo?[0.2,0.55,0.9]:[0.22,0.55,0.85];
  for(const f of bFracs){const bx=xs+(xe-xs)*f,by=ys+(ye-ys)*f,ry=rh+rh*1.25,rr=rh*.62;
   x.save();x.translate(bx,by);
   x.save();try{x.filter='blur(2px)'}catch(_){}x.fillStyle='rgba(0,0,0,.32)';x.beginPath();x.ellipse(1.5,ry+2.5,rr*1.05,rr*.95,0,0,TAU);x.fill();x.fillRect(.5,rh*.6+3,rh*.32,ry-rh*.6);x.filter='none';x.restore();
   const fg=x.createRadialGradient(-rr*.35,ry-rr*.45,rr*.1,0,ry,rr);fg.addColorStop(0,'#e3e6e8');fg.addColorStop(.45,'#9ba0a5');fg.addColorStop(.85,'#565b60');fg.addColorStop(1,'#2a2d30');x.fillStyle=fg;x.beginPath();x.ellipse(0,ry,rr,rr*.92,0,0,TAU);x.fill();
   x.fillStyle='rgba(0,0,0,.35)';x.beginPath();x.arc(0,ry,rr*.12,0,TAU);x.fill();
   const aw=rh*.36,ag=x.createLinearGradient(-aw/2,0,aw/2,0);ag.addColorStop(0,'#3a3e42');ag.addColorStop(.3,'#d2d6d9');ag.addColorStop(.55,'#8d9297');ag.addColorStop(1,'#2e3135');x.fillStyle=ag;
   x.beginPath();x.moveTo(-aw/2,ry);x.lineTo(-aw/2,rh*.75);x.quadraticCurveTo(-aw/2,rh*.45,-aw*1.3,rh*.5);x.lineTo(aw*1.3,rh*.5);x.quadraticCurveTo(aw/2,rh*.45,aw/2,rh*.75);x.lineTo(aw/2,ry);x.closePath();x.fill();
   x.restore()}
  /* 3. the tube */
  x.save();x.translate(xs,ys);x.rotate(an);
  x.fillStyle=tube(x.createLinearGradient(0,0,0,rh));x.beginPath();x.roundRect?x.roundRect(0,0,len,rh,rh/2):x.rect(0,0,len,rh);x.fill();
  x.save();x.beginPath();x.rect(0,0,len,rh);x.clip();
  /* light falls off along the run: brighter under the ceiling lights, duller where it dips into the shadow of the stairs */
  const sh=x.createLinearGradient(0,0,len,0);sh.addColorStop(0,'rgba(0,0,0,.28)');sh.addColorStop(.3,'rgba(0,0,0,.05)');sh.addColorStop(.55,'rgba(255,255,255,.06)');sh.addColorStop(.8,'rgba(0,0,0,.08)');sh.addColorStop(1,'rgba(0,0,0,.22)');x.fillStyle=sh;x.fillRect(0,0,len,rh);
  /* the strip lights reflected along the top as a broken, slightly wavy specular */
  for(let px=0;px<len;){const sl=20+R()*90,ga=10+R()*40;x.globalAlpha=.25+R()*.45;x.fillStyle='#ffffff';x.fillRect(px,rh*(.2+R()*.04),sl,Math.max(.7,rh*.07));px+=sl+ga}x.globalAlpha=1;
  /* brushed grain running along the tube */
  for(let n=0;n<len/6;n++){const gy=R()*rh,gl=30+R()*160;x.globalAlpha=.04+R()*.06;x.fillStyle=gy<rh*.45?'#ffffff':'#000000';x.fillRect(R()*len,gy,gl,.6)}x.globalAlpha=1;
  /* grime underneath where hands don't polish it; a few dull spots and dark finger marks */
  const gg=x.createLinearGradient(0,rh*.55,0,rh);gg.addColorStop(0,'rgba(40,34,26,0)');gg.addColorStop(1,'rgba(40,34,26,.35)');x.fillStyle=gg;x.fillRect(0,rh*.55,len,rh*.45);
  for(let n=0;n<len/28;n++){x.globalAlpha=.06+R()*.1;x.fillStyle=R()<.7?'#2b2620':'#d8dcdf';x.beginPath();x.ellipse(R()*len,rh*(.35+R()*.55),2+R()*7,.5+R()*1.2,0,0,TAU);x.fill()}x.globalAlpha=1;
  x.restore();x.restore();
  /* 4. the short horizontal return into the right-hand wall, with a bent elbow joining the two */
  if(L.photo){const tx0=L.x1-2,tx1=L.x2,ty=L.y1;x.save();
   x.fillStyle=tube(x.createLinearGradient(0,ty,0,ty+rh));x.beginPath();x.roundRect?x.roundRect(tx0,ty,tx1-tx0,rh,rh/2):x.rect(tx0,ty,tx1-tx0,rh);x.fill();
   const eg=x.createRadialGradient(tx0-rh*.15,ty+rh*.3,rh*.05,tx0,ty+rh/2,rh*.6);eg.addColorStop(0,'#eef0f1');eg.addColorStop(.5,'#8a9095');eg.addColorStop(1,'#25282b');x.fillStyle=eg;x.beginPath();x.arc(tx0,ty+rh/2,rh/2,0,TAU);x.fill();
   const fr=rh*.75,fx=tx1;const rg=x.createRadialGradient(fx-fr*.3,ty+rh/2-fr*.3,1,fx,ty+rh/2,fr);rg.addColorStop(0,'#cfd3d6');rg.addColorStop(1,'#3b3f43');x.fillStyle=rg;x.beginPath();x.ellipse(fx,ty+rh/2,fr*.35,fr,0,0,TAU);x.fill();
   x.restore()}
  x.restore();return}
 let g=x.createLinearGradient(0,L.y+L.h,0,L.y+L.h+28);g.addColorStop(0,'rgba(0,0,0,.60)');g.addColorStop(.16,'rgba(0,0,0,.32)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,L.y+L.h,W,28);
 g=x.createLinearGradient(0,L.y,0,L.y+L.h);g.addColorStop(0,c(1.24));g.addColorStop(.14,c(1.06));g.addColorStop(.68,c(.84));g.addColorStop(1,c(.62));x.fillStyle=g;x.fillRect(0,L.y,W,L.h);
 if(lightOn){const lg=x.createLinearGradient(0,L.y,W,L.y);lg.addColorStop(0,'rgba(255,255,255,.16)');lg.addColorStop(.55,'rgba(255,255,255,0)');lg.addColorStop(1,'rgba(0,0,0,.18)');x.fillStyle=lg;x.fillRect(0,L.y,W,L.h)}
 x.globalAlpha=.09;for(let i=0;i<W;i+=6){const k=((i*73)%17)/17;x.fillStyle=k>.5?'#fff':'#000';x.fillRect(i,L.y+2+((i*29)%Math.max(1,L.h-4)),3+k*5,1)}x.globalAlpha=1;
 x.fillStyle='rgba(255,255,255,.55)';x.fillRect(0,L.y,W,1.4);x.fillStyle='rgba(255,255,255,.16)';x.fillRect(0,L.y+1.4,W,2.6);x.fillStyle='rgba(0,0,0,.55)';x.fillRect(0,L.y+L.h-1.4,W,1.4);x.restore()}
let ldgDrawn=null;function refreshLedge(){const L=LDG(),sp=ledgeSpan(),y0=Math.max(0,sp.y0-4),h=sp.y1-sp.y0+32;renderBg();
 /* the ledge moved (dock shown/hidden, full screen): paint the old one out of the wall too, keeping any ink there */
 if(ldgDrawn!=null&&Math.abs(ldgDrawn-y0)>1){const oy=ldgDrawn,t2=document.createElement('canvas');t2.width=Math.round(W*dpr);t2.height=Math.round(h*dpr);const t2x=t2.getContext('2d');t2x.drawImage(bg.c,0,oy*dpr,W*dpr,h*dpr,0,0,t2.width,t2.height);t2x.globalCompositeOperation='destination-out';t2x.drawImage(idm.c,0,oy*dpr,W*dpr,h*dpr,0,0,t2.width,t2.height);baked.x.save();baked.x.setTransform(1,0,0,1,0,0);baked.x.drawImage(t2,0,oy*dpr);baked.x.restore();freeC(t2)}ldgDrawn=y0;const t=document.createElement('canvas');t.width=Math.round(W*dpr);t.height=Math.round(h*dpr);const tx=t.getContext('2d');tx.drawImage(bg.c,0,y0*dpr,W*dpr,h*dpr,0,0,t.width,t.height);tx.globalCompositeOperation='destination-out';tx.drawImage(idm.c,0,y0*dpr,W*dpr,h*dpr,0,0,t.width,t.height);baked.x.save();baked.x.setTransform(1,0,0,1,0,0);baked.x.drawImage(t,0,y0*dpr);baked.x.restore();freeC(t);dirty=true}
/* STONE CILL POOL: the cill is a deep flat shelf. Runs land at the back (where it meets the window frame) and their
   paint levels out into ONE puddle: it spreads sideways and merges with its neighbours, creeps forward across the top,
   and only when it reaches the front edge does it spill over and drip down the face. Kept in photo coordinates so it
   stays put if the screen resizes. */
const CP={n:290,v:null,c:null,sp:null,in:null};let cillC=null,cillDirty=false,cillTilt=0;
function cillReset(){CP.v=CP.c=CP.sp=CP.in=null;cillDirty=true;chanClear();SPOOL.length=0;stDirty=true}
/* SUBWAY STAIRS: every concrete tread is a level shelf of its own — runs from the wall hit the back of the tread, pool,
   spread and join along it, creep to the nosing, then spill over and run down the riser onto the next tread, and so on */
const SPOOL=[];let stC=null,stDirty=false;
function stairL(i){const g=stairsRailGeom();if(!g.photo)return null;const [u0,u1,v]=STAIR_STEPS[i],x0=g.ox+g.w*u0,x1=g.ox+g.w*u1,y0=g.oy+g.h_im*v;
 /* a level tread: paint pools at the wall and spreads out across it toward you; it never runs off the side in view */
 return {y:y0,top:Math.max(6,g.h_im*.055),h:10,px:x0,pw:x1-x0,q:{x:g.ox,y:g.oy,w:g.w,h:g.h_im},sk:TREAD_SK,len:g.h_im*.3}}
function stairHit(d,st,col){const L=stairL(st.idx);if(!L)return true;const P=SPOOL[st.idx]||(SPOOL[st.idx]={n:Math.max(40,Math.round(L.pw/1.4)),v:null,c:null,sp:null,in:null});
 poolHit(P,d,Math.max(L.px+1,Math.min(L.px+L.pw-1,d.x)),col,d.r,L);/* the tread just takes it: an over-full pool spreads further out toward you, off the bottom of the view */if(P.sp)P.sp.fill(0);if(P.v)for(let k=0;k<P.n;k++)P.v[k]=Math.min(P.v[k],1.25);return true}
function drawStairPools(){if(!stDirty)return;stDirty=false;if(!stC)stC=document.createElement('canvas');if(stC.width!==Math.round(W*dpr)||stC.height!==Math.round(H*dpr)){stC.width=Math.round(W*dpr);stC.height=Math.round(H*dpr)}
 const x=stC.getContext('2d');x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,stC.width,stC.height);if(!(bands[0]&&bands[0].s.id==='stairs'))return;
 for(let i=0;i<SPOOL.length;i++){const P=SPOOL[i];if(!P||!P.v)continue;const L=stairL(i);if(!L)continue;const yB=L.y,sk=L.sk,X0=L.px,X1=L.px+L.pw,dy=L.len;
  x.save();x.setTransform(dpr,0,0,dpr,0,0);/* keep it on this tread's top face */x.beginPath();x.moveTo(X0-1,yB-2);x.lineTo(X1+1,yB-2);x.lineTo(X1+1+sk*dy,yB+dy);x.lineTo(X0-1+sk*dy,yB+dy);x.closePath();x.clip();
  /* draw the puddle in the tread's own frame: 'forward' (away from the wall) is sheared down-and-left like the step */
  x.setTransform(dpr,0,dpr*sk,dpr,-dpr*sk*yB,0);drawPoolSegs(x,P,L,null,null);x.restore()}}
function cillHit(d,xw,col,re,L){return poolHit(CP,d,xw,col,re,{...L,px:L.q.x,pw:L.q.w})}
/* one level shelf (the cill, a stair tread): runs land at the back edge, level out sideways into one puddle, creep forward, and spill over the front */
function poolHit(CP,d,xw,col,re,L){CP.t=performance.now();CP.ty=d.ty||CP.ty;if(!CP.v){CP.v=new Float32Array(CP.n);CP.c=new Array(CP.n).fill(null);CP.sp=new Float32Array(CP.n);CP.in=new Float32Array(CP.n)}
 const q={x:L.px,w:L.pw},ix=Math.round((xw-q.x)/q.w*CP.n);if(ix<0||ix>=CP.n)return true;const a0=d.al&&d.al<.97?d.al:1,c0=col[0]==='#'?col:'#808080',fc=c0;
 CP.in[ix]=Math.max(CP.in[ix],Math.min(2.5,re||d.r||1));const add=Math.max(.18,d.vol)*(0.45+0.65*a0),sg=2+Math.min(7,d.vol*5);for(let k=-Math.ceil(sg*2.5);k<=Math.ceil(sg*2.5);k++){const j=ix+k;if(j<0||j>=CP.n)continue;const w=Math.exp(-k*k/(2*sg*sg));CP.v[j]+=add*w/(sg*2.5066)*3;if(w>.25)CP.c[j]=CP.c[j]?mixHex(CP.c[j],fc,Math.min(.6,w*.5)):fc}
 /* the paint levels out: it flows from deeper to shallower neighbours, so close puddles join into one */
 for(let it=0;it<6;it++){for(let j=1;j<CP.n-1;j++){const f=(CP.v[j-1]+CP.v[j+1]-2*CP.v[j])*.18;CP.v[j]+=f}for(let j=1;j<CP.n;j++)if(!CP.c[j]&&CP.v[j]>.04)CP.c[j]=CP.c[j-1]||CP.c[j+1];for(let j=CP.n-2;j>=0;j--)if(!CP.c[j]&&CP.v[j]>.04)CP.c[j]=CP.c[j+1]}
 cillDirty=true;stDirty=true;dirty=true;markInk(xw,L.y+2,re*2,d.id,col);
 /* full to the front edge: the excess spills over and runs down the stone face */
 const FULL=1.6;let mx=-1,mv=0;for(let k=-8;k<=8;k++){const j=ix+k;if(j>=0&&j<CP.n&&CP.v[j]>mv){mv=CP.v[j];mx=j}}
 if(mv>FULL){const ex=Math.min(1.2,mv-FULL);CP.v[mx]-=ex*.7;CP.sp[mx]=Math.min(1,CP.sp[mx]+.35);const sx=q.x+(mx+.5)/CP.n*q.w,fy=L.y+L.top;ledgeLetGo(sx,fy+4+CP.sp[mx]*4,Math.max(.5,ex+.3),d.r,(CP.c[mx]&&CP.c[mx][0]==='#')?CP.c[mx]:c0);return true}
 return true}
function drawCill(){if(!cillDirty)return;cillDirty=false;if(!cillC)cillC=document.createElement('canvas');if(cillC.width!==Math.round(W*dpr)||cillC.height!==Math.round(H*dpr)){cillC.width=Math.round(W*dpr);cillC.height=Math.round(H*dpr)}
 const x=cillC.getContext('2d');x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,cillC.width,cillC.height);if(!CP.v||!isGlassPhoto())return;const L0=LDG();x.setTransform(dpr,0,0,dpr,0,0);drawPoolSegs(x,CP,{...L0,px:L0.q.x,pw:L0.q.w},PHI.glass,L0.q)}
/* how far a pool has dried: wet it mirrors the sky and the frame; as the solvent goes it skins over and turns matte */
function poolDry(P){return P&&P.t?clamp((performance.now()-P.t)/(1000*(TAUS[P.ty]||1.5)*14)):0}
function drawPoolSegs(x,CP,L,IM,IR){const q={x:L.px,w:L.pw},cw=q.w/CP.n,gl=1-poolDry(CP)*.88;
 const EPS=.1,hs=k=>{let h=(k*374761393)>>>0;h=Math.imul(h^(h>>>13),1274126177)>>>0;return((h^(h>>>16))>>>0)/4294967296},
  sn=(k,sc)=>{const u=k/sc,i0=Math.floor(u),t=u-i0,t2=t*t*(3-2*t);return hs(i0*7+sc)+(hs(i0*7+7+sc)-hs(i0*7+sc))*t2},
  /* how far the paint has crept across the top: a dome by volume, made uneven by the stone — it runs on further into dips and stops short at grit */
  reach=k=>{const v=Math.max(0,CP.v[k]-EPS)/(1.6-EPS);if(v<=0)return 0;const r=L.top*.95*Math.sqrt(Math.min(1,v));const cap=L.top*(.86+.12*sn(k+40,7)+.05*sn(k+90,2));return Math.min(cap,Math.max(1,r*(.78+.34*sn(k,9)+.14*sn(k,3))+(hs(k)-.5)*.9))};/* even a full cill's front edge is ragged */
 const tx=(typeof tilt!=='undefined'&&tilt)?tilt.x||0:0;cillTilt=tx;
 let j=0;while(j<CP.n){if(CP.v[j]<EPS){j++;continue}let e=j;while(e<CP.n&&CP.v[e]>=EPS)e++;
  let best=j;for(let k=j;k<e;k++)if(CP.v[k]>CP.v[best])best=k;const c=CP.c[best]||'#ffffff',X0=q.x+j*cw,X1=q.x+e*cw,yB=L.y,yF=L.y+L.top,
   deep=mixHex(c,'#000000',.3),edge=mixHex(c,'#000000',.16);
  /* damp stain soaking into the stone round it */x.save();x.globalCompositeOperation='multiply';x.globalAlpha=.22;x.fillStyle='#5a4c3a';try{x.filter='blur(3px)'}catch(_){}x.beginPath();x.moveTo(X0-4,yB);for(let k=j;k<e;k++)x.lineTo(q.x+(k+.5)*cw,yB+reach(k)+4+(CP.sp[k]?L.h*.45:0));x.lineTo(X1+4,yB);x.closePath();x.fill();x.restore();
  /* the outline: back edge tucked into the frame's shadow, an irregular creeping front */
  const P2=new Path2D(),pts=[];for(let k=e-1;k>=j;k--)pts.push([q.x+(k+.5)*cw,yB+reach(k)]);P2.moveTo(X0-1,yB-1.5);P2.lineTo(X1+1,yB-1.5);P2.quadraticCurveTo(X1+1.5,(pts[0][1]+yB)/2,pts[0][0],pts[0][1]);
  for(let k=1;k<pts.length;k++){const m0=(pts[k-1][0]+pts[k][0])/2,m1=(pts[k-1][1]+pts[k][1])/2;P2.quadraticCurveTo(pts[k-1][0],pts[k-1][1],m0,m1)}const pl=pts[pts.length-1];P2.quadraticCurveTo(X0-1.5,(pl[1]+yB)/2,X0-1,yB-1.5);P2.closePath();
  /* body: richer and darker where it's deep (the back, where the runs pour in), lighter where it's thin at the front */
  x.save();x.fillStyle=c;x.fill(P2);x.clip(P2);
   {const g=x.createLinearGradient(0,yB-1.5,0,yF);g.addColorStop(0,deep);g.addColorStop(.35,mixHex(c,'#000000',.12));g.addColorStop(.75,c);g.addColorStop(1,mixHex(c,'#ffffff',.06));x.globalAlpha=.85;x.fillStyle=g;x.fillRect(X0-3,yB-2,X1-X0+6,L.top+4);x.globalAlpha=1}
   /* deeper still right under each pour */for(let k=j;k<e;k++)if(CP.in&&CP.in[k]>0){const xx=q.x+(k+.5)*cw,rw=3+CP.in[k]*2.5,rg=x.createRadialGradient(xx,yB,0,xx,yB,rw*2.2);rg.addColorStop(0,deep+'aa');rg.addColorStop(1,deep+'00');x.fillStyle=rg;x.fillRect(xx-rw*2.2,yB-2,rw*4.4,rw*2.4)}
   /* the stone's texture faintly through the film */{const im=IM;if(im&&IR){x.globalCompositeOperation='soft-light';x.globalAlpha=.35;x.drawImage(im,IR.x,IR.y,IR.w,IR.h);x.globalCompositeOperation='source-over';x.globalAlpha=1}}
   /* a slight unevenness where it levelled */{let r=(j*7919+e*104729)>>>0;const R2=()=>(r=(Math.imul(r,1103515245)+12345)>>>0)/4294967296;for(let n=0;n<(X1-X0)/7;n++){const bx2=X0+R2()*(X1-X0),by2=yB+2+R2()*L.top*.8,rw=2+R2()*6;x.globalAlpha=.06+R2()*.07;x.fillStyle=R2()<.5?mixHex(c,'#ffffff',.4):deep;x.beginPath();x.ellipse(bx2,by2,rw,rw*.3,0,0,TAU);x.fill()}x.globalAlpha=1}
   /* REFLECTIONS (move as the phone tilts): the dark window frame mirrored just in front of the back edge, and a few soft patches of grey sky further forward */
   {const g=x.createLinearGradient(0,yB,0,yB+Math.min(5,L.top*.4));g.addColorStop(0,`rgba(18,22,26,${(.32*gl).toFixed(3)})`);g.addColorStop(1,'rgba(18,22,26,0)');x.fillStyle=g;x.fillRect(X0,yB,X1-X0,Math.min(5,L.top*.4))}
   {let r2=(j*31+e*17)>>>0;const R3=()=>(r2=(Math.imul(r2,1103515245)+12345)>>>0)/4294967296;for(let n=0;n<Math.max(1,(X1-X0)/38);n++){const gx=X0+8+R3()*(X1-X0-16)+tx*22,gw=7+R3()*16,gy=yB+L.top*(.32+R3()*.16),gh=.9+R3()*.9;x.save();x.translate(gx,gy);x.scale(gw,gh);const rg=x.createRadialGradient(0,0,0,0,0,1);rg.addColorStop(0,`rgba(226,232,236,${(.62*gl).toFixed(3)})`);rg.addColorStop(.5,`rgba(226,232,236,${(.24*gl).toFixed(3)})`);rg.addColorStop(1,'rgba(226,232,236,0)');x.fillStyle=rg;x.beginPath();x.arc(0,0,1,0,TAU);x.fill();x.restore()}}
   /* the rim is the thinnest film: the stone shows through it, so it melts into the cill — no outline */x.globalCompositeOperation='destination-out';x.globalAlpha=.45;try{x.filter='blur(1.4px)'}catch(_){}x.lineWidth=3.2;x.strokeStyle='#000';x.stroke(P2);x.filter='none';x.globalCompositeOperation='source-over';
   /* just inside it, the meniscus reads a touch darker and more saturated */x.globalAlpha=.35;x.lineWidth=2.2;x.strokeStyle=edge;x.translate(0,-.8);x.stroke(P2);x.globalAlpha=1;
  x.restore();
  /* the runs pour in: each one widens into the puddle — one liquid, no join line */
  if(CP.in)for(let k=j;k<e;k++)if(CP.in[k]>0){const xx=q.x+(k+.5)*cw,w0=Math.max(.4,Math.min(1.6,CP.in[k]*.38)),w1=w0*1.65+.6,h=Math.min(5,Math.max(2.2,w0*3.2));x.fillStyle=CP.c[k]||c;x.beginPath();x.moveTo(xx-w0,yB-h);x.bezierCurveTo(xx-w0,yB-h*.35,xx-w0*1.1,yB-.8,xx-w1*1.2,yB+1.2);x.lineTo(xx+w1*1.2,yB+1.2);x.bezierCurveTo(xx+w0*1.1,yB-.8,xx+w0,yB-h*.35,xx+w0,yB-h);x.closePath();x.fill()}
  /* SPILL: a rounded lip of paint bulges over the front edge and the drip hangs from it */
  for(let k=j;k<e;k++)if(CP.sp[k]>0){const xx=q.x+(k+.5)*cw,sp=CP.sp[k],w=3+sp*4.5,lip=3+sp*4;x.fillStyle=mixHex(c,'#000000',.08);x.beginPath();x.moveTo(xx-w*1.6,yF-2.2);x.bezierCurveTo(xx-w*1.1,yF-1,xx-w,yF+lip*.6,xx-w*.55,yF+lip*.9);x.quadraticCurveTo(xx,yF+lip*1.25,xx+w*.55,yF+lip*.9);x.bezierCurveTo(xx+w,yF+lip*.6,xx+w*1.1,yF-1,xx+w*1.6,yF-2.2);x.closePath();x.fill();
   x.save();x.globalAlpha=.3*gl;x.fillStyle='rgba(226,232,236,1)';x.beginPath();x.ellipse(xx-w*.25+tx*3,yF+lip*.35,w*.35,.8,0,0,TAU);x.fill();x.restore()}
  j=e}}
function ledgeHit(d,xw,col,re){const L0=LDG();if(L0.stone)return cillHit(d,xw,col,re,L0);const L={...L0,y:ledgeY(xw)},k=Math.floor(xw/7),p=(ledP[k]||0)+d.vol,bx=baked.x;ledP[k]=p;ledP[k-1]=(ledP[k-1]||0)+d.vol*.35;ledP[k+1]=(ledP[k+1]||0)+d.vol*.35;
 /* SLOPING HANDRAIL: paint can't sit on a slope — it lands on the rail, runs down along the top of it (a thin wet
    streak following the rail), wraps round and drops off the underside further down. No pools. */
 if(L0.sl){const a0=d.al&&d.al<.97?d.al:1,c0=col[0]==='#'?col:'#808080',fc=a0<1?mixHex(c0,'#ffffff',1-a0):c0,dir=Math.sign(L0.sl)||1,run=8+d.vol*26+Math.random()*24,xe=Math.min(W-2,Math.max(2,xw+dir*run/Math.hypot(1,L0.sl))),w0=Math.max(.8,re*.9);
  bx.save();if(a0<1)bx.globalCompositeOperation='multiply';bx.fillStyle=fc;bx.strokeStyle=fc;bx.lineCap='round';
  /* the run arriving on the rail: a small wrap over the top */bx.beginPath();bx.ellipse(xw,L.y+1,w0*1.5,w0*1.1,Math.atan(L0.sl),0,TAU);bx.fill();
  /* streak along the upper face of the rail, thinning as it goes */const n=8;for(let q=0;q<n;q++){const t0=q/n,t1=(q+1)/n,x0=xw+(xe-xw)*t0,x1=xw+(xe-xw)*t1;bx.lineWidth=Math.max(.5,w0*.9*(1-t0*.6));bx.globalAlpha=.75*(1-t0*.5);bx.beginPath();bx.moveTo(x0,ledgeY(x0)+1.5);bx.lineTo(x1,ledgeY(x1)+1.5);bx.stroke()}
  bx.globalAlpha=1;/* gathers under the rail and hangs as a drop */const yb=ledgeY(xe)+L0.h;bx.beginPath();bx.moveTo(xe-w0*1.2,ledgeY(xe)+L0.h*.4);bx.quadraticCurveTo(xe-w0*1.3,yb+w0*1.2,xe,yb+w0*1.8);bx.quadraticCurveTo(xe+w0*1.3,yb+w0*1.2,xe+w0*1.2,ledgeY(xe)+L0.h*.4);bx.closePath();bx.fill();bx.restore();
  markInk(xw,L.y,re*2,d.id,col);markInk(xe,ledgeY(xe),re*2,d.id,col);
  if(d.vol>.25||Math.random()<.6){ledgeLetGo(xe,yb+w0*.5,Math.max(.45,d.vol*.85),d.r,fc);return true}return true}
 /* STONE CILL: porous — some of the liquid soaks in, leaving a darker damp stain spreading into the stone round the pool and down the face */
 if(L0.stone){const rr=8+d.vol*10+Math.min(14,p*2),g=bx.createRadialGradient(xw,L.y+4,0,xw,L.y+4,rr*1.6);g.addColorStop(0,'rgba(40,34,26,.22)');g.addColorStop(1,'rgba(40,34,26,0)');bx.save();bx.globalCompositeOperation='multiply';bx.fillStyle=g;bx.beginPath();bx.ellipse(xw,L.y+4+rr*.35,rr*1.6,rr*1.1,0,0,TAU);bx.fill();bx.restore()}
 /* paint spreads along the lip into one continuous bead (neighbouring arrivals merge), and coats the front face with a ragged lower edge */
 const sm=surfAt(xw,L.y-2).mean,a0=d.al&&d.al<.97?d.al:1,c0=col[0]==='#'?col:'#808080',fc=a0<1?mixHex(c0,'#ffffff',1-a0):c0,
  rx=L0.stone?re*2.2+Math.min(40,d.vol*6+p*5.5):re*1.7+Math.min(22,d.vol*4.5+p*3.2),ry=L0.stone?Math.max(1.4,re)+Math.min(3.6,p*.7):Math.max(1.1,re*.9)+Math.min(2.8,p*.5);/* the pool grows as more runs arrive at the same spot — a deep flat stone cill holds a much wider pool *//* the pool grows as more runs arrive at the same spot */
 /* the run lands on the lip and spreads sideways into a thin bead (soft ends, no hard box), then rolls over the
    front edge as short rounded drops — not a sheet with a cut hem */
 bx.save();
 bx.fillStyle='rgba(0,0,0,.32)';bx.beginPath();bx.ellipse(xw+1,L.y+ry*.95+1.2,rx*1.02,Math.max(1.2,ry*.7),0,0,TAU);bx.fill();
 const mulL=a0<1||(d.ink&&d.ink.comp==='multiply');if(mulL)bx.globalCompositeOperation='multiply';bx.fillStyle=fc;bx.beginPath();bx.ellipse(xw,L.y-ry*.2,rx,ry,0,0,TAU);bx.fill();/* a small rounded foot where the run sits on the lip, joined to the run above */bx.beginPath();bx.moveTo(xw-re,L.y-ry*2.4);bx.quadraticCurveTo(xw-re,L.y-ry*.6,xw-rx,L.y-ry*.2);bx.lineTo(xw+rx,L.y-ry*.2);bx.quadraticCurveTo(xw+re,L.y-ry*.6,xw+re,L.y-ry*2.4);bx.closePath();bx.fill();if(DYEINK[d.ty]&&!d.wet&&!L0.stone&&c0[0]==='#'){const P2=dpr,pw=Math.max(4,Math.ceil((rx*2.4+4)*P2)),ph=Math.max(4,Math.ceil((ry*4+6)*P2)),px0=Math.max(0,Math.floor((xw-rx*1.2-2)*P2)),py0=Math.max(0,Math.floor((L.y-ry*2.6-2)*P2));const pc=document.createElement('canvas');pc.width=pw;pc.height=ph;const px=pc.getContext('2d');px.setTransform(P2,0,0,P2,-px0,-py0);const lO=Math.min(1,d.ov||0),lDk=lum(hex(c0))<.3,lDeep=dyeDeep(c0,1.45+((lDk?.72:.55)+.25*lO)*.7);px.fillStyle=lDeep;px.beginPath();px.ellipse(xw,L.y-ry*.2,rx,ry,0,0,TAU);px.fill();px.beginPath();px.moveTo(xw-re,L.y-ry*2.4);px.quadraticCurveTo(xw-re,L.y-ry*.6,xw-rx,L.y-ry*.2);px.lineTo(xw+rx,L.y-ry*.2);px.quadraticCurveTo(xw+re,L.y-ry*.6,xw+re,L.y-ry*2.4);px.closePath();px.fill();bleedL.push({c:pc,x:px0,y:py0,t0:(d.st0||performance.now())+500,dur:8600,a:.95,comp:mulL?'multiply':null})}
 /* POOL: paint gathers on the lip and drapes over the front face — the more that arrives at a spot the deeper the drape
    hangs — with a soft, lobed lower edge (each lobe a drop about to fall), then it drips off the bottom */
 {const fw2=rx*.85,hem=L0.stone&&p<2.4?Math.min(L.h*.25,1.5+p*1.4):Math.min(L.h*1.05,L.h*.5+p*4+Math.random()*2),nl=Math.max(1,Math.min(4,Math.round(fw2/(re*2.2+2))));
  const drawPoolMask=(cx)=>{cx.beginPath();cx.ellipse(xw,L.y-ry*.2,rx,ry,0,0,TAU);cx.fill();cx.beginPath();cx.moveTo(xw-re,L.y-ry*2.4);cx.quadraticCurveTo(xw-re,L.y-ry*.6,xw-rx,L.y-ry*.2);cx.lineTo(xw+rx,L.y-ry*.2);cx.quadraticCurveTo(xw+re,L.y-ry*.6,xw+re,L.y-ry*2.4);cx.closePath();cx.fill();cx.beginPath();cx.moveTo(xw-fw2-ry,L.y-ry*.2);cx.quadraticCurveTo(xw-fw2,L.y,xw-fw2,L.y+hem*.35);for(let k2=0;k2<nl;k2++){const x0=xw-fw2+fw2*2*k2/nl,x1=xw-fw2+fw2*2*(k2+1)/nl,dep=hem*(k2===((nl/2)|0)?1:.6+.35*Math.abs(Math.sin(k2*2.1+d.ph)));cx.lineTo(x0,L.y+dep*.75);cx.bezierCurveTo(x0,L.y+dep*1.05,x1,L.y+dep*1.05,x1,L.y+dep*.75)}cx.quadraticCurveTo(xw+fw2,L.y,xw+fw2+ry,L.y-ry*.2);cx.closePath();cx.fill()};
  bx.beginPath();bx.moveTo(xw-fw2-ry,L.y-ry*.2);bx.quadraticCurveTo(xw-fw2,L.y,xw-fw2,L.y+hem*.35);
  for(let k2=0;k2<nl;k2++){const x0=xw-fw2+fw2*2*k2/nl,x1=xw-fw2+fw2*2*(k2+1)/nl,dep=hem*(k2===((nl/2)|0)?1:.6+.35*Math.abs(Math.sin(k2*2.1+d.ph)));bx.lineTo(x0,L.y+dep*.75);bx.bezierCurveTo(x0,L.y+dep*1.05,x1,L.y+dep*1.05,x1,L.y+dep*.75)}
  bx.quadraticCurveTo(xw+fw2,L.y,xw+fw2+ry,L.y-ry*.2);bx.closePath();bx.fill();
  /* Stamp exact pool & lobed drape into live tilt-reactive highlight layers (no static white patch shining over it) */
  if(!d.soft&&!d.wash&&!d.et){
   const wkKey=d.wk||d.ty||'stain',wObj=WET[wkKey]?wetC(wkKey):null;
   if(wObj){const wx=wObj.x;wx.save();wx.fillStyle='#fff';wx.globalAlpha=Math.min(1,.88*a0);drawPoolMask(wx);wx.restore();wObj.active=true;wObj.t0=performance.now();wObj.until=Math.max(wObj.until||0,performance.now()+(TAUS[wkKey]||1.5)*4800)}
   if(wgOn2&&GLW){const gx=GLW.getContext('2d');gx.save();gx.setTransform(dpr,0,0,dpr,0,0);gx.fillStyle='#fff';gx.globalAlpha=Math.min(1,.85*a0);drawPoolMask(gx);gx.restore()}
   if(satOn&&SAT&&!L0.stone){const sx=SAT.getContext('2d');sx.save();sx.setTransform(dpr,0,0,dpr,0,0);sx.fillStyle='#fff';sx.globalAlpha=Math.min(1,.82*a0);drawPoolMask(sx);sx.restore()}
   if(glossOn&&glL.c.width&&!L0.stone){const glx=glL.x;glx.save();glx.fillStyle='#fff';glx.globalAlpha=Math.min(1,.85*a0);drawPoolMask(glx);glx.restore();glDirty=true}
   if((d.ink&&(d.ink.chrome||d.ink.future||METAL[c0]))||(d.props&&d.props.pearl)){const _prlL=!!(d.props&&d.props.pearl),mxL=need(metal).x;mxL.save();mxL.fillStyle='#fff';mxL.globalAlpha=((d.ink&&d.ink.chrome?1:_prlL?.62:d.ink&&d.ink.future?.2:.85))*a0;drawPoolMask(mxL);mxL.restore();metalOn=true;shineDirty=true}
   lForce=true;slForce=true;
  }
 }
 bx.restore();
 markInk(xw,L.y,rx,d.id,col);{const ix=idm.x;ix.save();ix.fillStyle=`rgb(${d.id*20},0,0)`;ix.fillRect(xw-rx,L.y-ry,rx*2,L.h+ry);ix.restore()}
 const ovf=L0.stone?2.4:.55;/* the stone cill is deep and flat: it fills up and spreads before it spills over the edge */if(p>ovf&&Math.random()<.7+Math.min(.25,(p-ovf)*.3)){/* the pool overflows and drips off the front of the ledge */ledgeLetGo(xw,L.y+L.h*.95,Math.min(Math.max(d.v0*.9,.6),.5+(p-ovf)*.7+Math.random()*.6),d.r,col,ovf);ledP[k]=p*.55;return true}
 return true}
const C=8;let GW=1,GH_=1,water=new Float32Array(1),waterOn=false;const waterCv=document.createElement('canvas'),wctx=waterCv.getContext('2d');const mist=[];
let wg=new Float32Array(1),wt=new Float32Array(1),wgOn=false;
function markWet(x,y,r,amt,tau){for(let gy=Math.max(0,Math.floor((y-r)/C));gy<=Math.min(GH_-1,Math.floor((y+r)/C));gy++)for(let gx=Math.max(0,Math.floor((x-r)/C));gx<=Math.min(GW-1,Math.floor((x+r)/C));gx++){if(Math.hypot(gx*C+C/2-x,gy*C+C/2-y)<r+C*.5){const i=gy*GW+gx;if(amt>=wg[i]){wg[i]=amt;wt[i]=tau}}}wgOn=true}
let washG=new Float32Array(1),buffPass=new Float32Array(1),inkG=new Uint8Array(1),colG=[],rainLeft=new Float32Array(1);const rainSet=new Set();let rainAcc=0,rainCells=[],rainScan=0;
function markInk(x,y,r,ti,col,fresh){for(let gy=Math.max(0,Math.floor((y-r)/C));gy<=Math.min(GH_-1,Math.floor((y+r)/C));gy++)for(let gx=Math.max(0,Math.floor((x-r)/C));gx<=Math.min(GW-1,Math.floor((x+r)/C));gx++){if(Math.hypot(gx*C+C/2-x,gy*C+C/2-y)<r+C*.5){const i=gy*GW+gx;inkG[i]=ti;colG[i]=col;if(fresh){rainLeft[i]=1;washG[i]=0}}}}
