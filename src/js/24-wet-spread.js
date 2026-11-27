/* ---------- wet spread: ink diffuses into the water film ----------
   radius grows like sqrt(4*D*t) (diffusion / Washburn capillary flow), ink mass is conserved
   (halo density falls as it widens and the core thins), low-viscosity ink sags under gravity
   on non-absorbent walls, paper fibres feather the front, and evaporation at the pinned
   edge leaves a darker tide line (coffee-ring effect). */
const SPD={etch:3,future:14,water:30,bleed:26,flow:22,stain:18,alcohol:12,alcpaint:5,oil:4,fluid:2.5,chrome:2.5};
const SVIS={etch:.6,future:.25,water:.1,bleed:.15,flow:.2,stain:.25,alcohol:.3,alcpaint:.7,oil:.8,fluid:.95,chrome:.85};
const spreads=[];let fibreT=null,canFilter=null;
function fibres(){if(fibreT)return fibreT;const S=128,c=document.createElement('canvas');c.width=c.height=S;const x=c.getContext('2d'),im=x.createImageData(S,S);
 for(let j=0;j<S;j++)for(let i=0;i<S;i++){const u=i/S,v=j/S,f=.45*n(8,64,u,v)+.35*n(32,32,u,v)+.2*n(64,8,u,v),k=(j*S+i)*4;im.data[k]=im.data[k+1]=im.data[k+2]=0;im.data[k+3]=255*clamp(.5+.7*f)}
 x.putImageData(im,0,0);return fibreT=c}
function blurDraw(dx,src,r,w,h){ if(canFilter===null){try{const c=document.createElement('canvas');c.width=c.height=9;const t=c.getContext('2d');t.filter='blur(2px)';t.fillStyle='#000';t.fillRect(4,4,1,1);canFilter=t.getImageData(1,4,1,1).data[3]>0}catch(_){canFilter=false}}
 if(canFilter){dx.filter=`blur(${r.toFixed(1)}px)`;dx.drawImage(src,0,0,w,h);dx.filter='none';return}
 const f=Math.max(1,r/1.4),sw=Math.max(1,Math.round(w/f)),sh=Math.max(1,Math.round(h/f)),t=tcan(Math.max(sw,sh),'bl');t.x.imageSmoothingEnabled=true;t.x.drawImage(src,0,0,w,h,0,0,sw,sh);dx.imageSmoothingEnabled=true;dx.drawImage(t.c,0,0,sw,sh,0,0,w,h)}
function addSpread(src,x,y,w,h,ty,s,mass){const D=(SPD[ty]||10)*(.45+s.absorb*1.1),vis=SVIS[ty]||.5,T=Math.min(5,1.4+TAUS[ty]*.9)*(s.absorb>.3?.8:1.2);
 if(D<1.5)return;const c=document.createElement('canvas');c.width=w;c.height=h;const o=document.createElement('canvas');o.width=w;o.height=h;
 spreads.push({src,c,x,y,w,h,ty,s,D,T,g:(1-s.absorb)*(1-vis)*22,mass:mass*(1-vis*.6),t0:performance.now(),lr:0,ld:0,ox:Math.random()*128,oy:Math.random()*128,o})}

function spreadFromWall(){const s=bands[0].s;for(const k in WET){if(!WET[k].active||!SPD[k])continue;const sc=.5,w=Math.ceil(W*sc),h=Math.ceil(H*sc),c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');
  x.drawImage(baked.c,0,0,w,h);x.globalCompositeOperation='destination-in';x.drawImage(WET[k].c,0,0,w,h);x.drawImage(idm.c,0,0,w,h);
  const sp=(addSpread(c,0,0,w,h,k,s,.28),spreads[spreads.length-1]);if(sp){sp.sc=sc;sp.D*=.6}}}
function runSpreads(now){if(!spreads.length)return;const bx=baked.x;
 for(let i=spreads.length-1;i>=0;i--){const p=spreads[i],t=(now-p.t0)/1000,sc=p.sc||1;
  if(t>p.T){tideLine(p);spreads.splice(i,1);freeC(p.c);freeC(p.o);if(p.src!==p.c)freeC(p.src);continue}
  const r=Math.sqrt(4*p.D*t),dr=r-p.lr;if(dr<.45)continue;p.ox=Math.random()*128;p.oy=Math.random()*128;const rMax=Math.sqrt(4*p.D*p.T),drop=Math.min(.5*p.g*t*t,p.g*2.2);
  const x=p.c.getContext('2d');x.setTransform(1,0,0,1,0,0);x.globalCompositeOperation='source-over';x.globalAlpha=1;x.clearRect(0,0,p.w,p.h);
  blurDraw(x,p.src,r*sc,p.w,p.h);
  x.globalCompositeOperation='destination-in';x.fillStyle=x.createPattern(fibres(),'repeat');x.translate(-p.ox,-p.oy);x.fillRect(p.ox,p.oy,p.w,p.h);x.setTransform(1,0,0,1,0,0);
  const share=dr/rMax,ink=INK[p.ty];
  bx.save();bx.globalCompositeOperation=p.keep?'source-over':ink.comp||'source-over';bx.globalAlpha=Math.min(p.keep?.3:.5,p.mass*share*(p.s.absorb>.3?1.25:.9));bx.drawImage(p.c,p.x,p.y+drop*.6,p.w/sc,p.h/sc);
  if(p.g>2&&drop-p.ld>.8){bx.globalAlpha=Math.min(.35,p.mass*share*.7);bx.drawImage(p.c,p.x,p.y+drop,p.w/sc,p.h/sc);p.ld=drop}bx.restore();
  /* mass conservation: the original line thins as ink leaves it */
  const o=p.o.getContext('2d');o.globalCompositeOperation='source-over';o.globalAlpha=1;o.clearRect(0,0,p.w,p.h);o.drawImage(bg.c,p.x*dpr,p.y*dpr,p.w/sc*dpr,p.h/sc*dpr,0,0,p.w,p.h);o.globalCompositeOperation='destination-in';o.drawImage(p.src,0,0);
  const cap=DYEINK[p.ty]?.22:.04,th=Math.min(.07,p.mass*share*.2*(1-(SVIS[p.ty]||.5)),Math.max(0,cap-(p.thin||0)));p.thin=(p.thin||0)+th;if(!p.keep&&th>.002){bx.save();bx.globalAlpha=th;bx.drawImage(p.o,p.x,p.y,p.w/sc,p.h/sc);bx.restore()}
  p.lr=r;dirty=true}}
function tideLine(p){const sc=p.sc||1,r=Math.sqrt(4*p.D*p.T),x=p.c.getContext('2d');x.setTransform(1,0,0,1,0,0);x.globalCompositeOperation='source-over';x.globalAlpha=1;x.clearRect(0,0,p.w,p.h);
 blurDraw(x,p.src,r*.9*sc,p.w,p.h);x.globalCompositeOperation='destination-out';x.globalAlpha=.92;blurDraw(x,p.src,r*.55*sc,p.w,p.h);
 const bx=baked.x;bx.save();bx.globalCompositeOperation=p.keep?'source-over':INK[p.ty].comp||'source-over';bx.globalAlpha=Math.min(.32,.3*p.mass*(1-(SVIS[p.ty]||.5)*.5));const drop=Math.min(.5*p.g*p.T*p.T,p.g*2.2);bx.drawImage(p.c,p.x,p.y+drop*.6,p.w/sc,p.h/sc);bx.restore();dirty=true}

