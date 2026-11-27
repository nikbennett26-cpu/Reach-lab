/* ---------- finger & cloth ---------- */
function px(c,x,y){return c.x.getImageData(Math.round(x*dpr),Math.round(y*dpr),1,1).data}
function wetAt(x,y){const i=Math.floor(y/C)*GW+Math.floor(x/C);return wg[i]||0}
const inkCell=(x,y)=>Math.floor(y/C)*GW+Math.floor(x/C);
function inkAt(x,y){const t=inkG[inkCell(x,y)];return t?Object.keys(INK)[t-1]:null}
function soft(c,r){const x=c.getContext('2d'),g=x.createRadialGradient(r,r,0,r,r,r);g.addColorStop(0,'#000');g.addColorStop(.6,'rgba(0,0,0,.8)');g.addColorStop(1,'rgba(0,0,0,0)');x.globalCompositeOperation='destination-in';x.fillStyle=g;x.fillRect(0,0,2*r,2*r);x.globalCompositeOperation='source-over'}
const TC={};function tcan(D,k=''){const key=k+D;let t=TC[key];if(!t){const ks=Object.keys(TC);if(ks.length>24)for(const k0 of ks.slice(0,12)){freeC(TC[k0].c);delete TC[k0]}const c=document.createElement('canvas');c.width=c.height=D;t=TC[key]={c,x:c.getContext('2d')}}else{t.x.setTransform(1,0,0,1,0,0);t.x.globalCompositeOperation='source-over';t.x.globalAlpha=1;t.x.filter='none';t.x.clearRect(0,0,D,D)}return t}
function smear(o,a,b,al,r){const D=Math.round(2*r*dpr),t=tcan(D,'s');t.x.drawImage(o.c,(a.x-r)*dpr,(a.y-r)*dpr,D,D,0,0,D,D);soft(t.c,D/2);
 o.x.save();o.x.setTransform(1,0,0,1,0,0);o.x.globalAlpha=al;o.x.drawImage(t.c,(b.x-r)*dpr,(b.y-r)*dpr);o.x.restore()}
function erase(o,b,al,r){const x=o.x;x.save();x.globalCompositeOperation='destination-out';const g=x.createRadialGradient(b.x,b.y,0,b.x,b.y,r);g.addColorStop(0,`rgba(0,0,0,${al})`);g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(b.x-r,b.y-r,2*r,2*r);x.restore()}
function restoreBg(b,al,r){const D=Math.round(2*r*dpr),t=tcan(D,'r');t.x.drawImage(bg.c,(b.x-r)*dpr,(b.y-r)*dpr,D,D,0,0,D,D);soft(t.c,D/2);
 baked.x.save();baked.x.setTransform(1,0,0,1,0,0);baked.x.globalAlpha=al;baked.x.drawImage(t.c,(b.x-r)*dpr,(b.y-r)*dpr);baked.x.restore()}
let toolAcc=0,saidDry=0;

let sprayAcc=0,saidSpray=0;

function smearDir(o,a,b,al,r,fib){const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,th=Math.atan2(dy,dx),D=Math.round(2*r*dpr),t=tcan(D,'d');
 t.x.drawImage(o.c,(a.x-r)*dpr,(a.y-r)*dpr,D,D,0,0,D,D);soft(t.c,D/2);
 if(fib){const x=t.x;x.save();x.globalCompositeOperation='destination-out';x.translate(D/2,D/2);x.rotate(th);for(let k=-D/2;k<D/2;k+=Math.max(2,dpr*2.2)){x.globalAlpha=.15+Math.random()*.55;x.fillRect(-D,k,2*D,Math.max(1,dpr*.9))}x.restore()}
 const g=o.x;g.save();g.setTransform(1,0,0,1,0,0);g.translate(b.x*dpr,b.y*dpr);g.rotate(th);g.scale(1+Math.min(len,20)*.06,.9);g.globalAlpha=al;g.drawImage(t.c,-D/2,-D/2);g.restore()}
/* BUFF MODES (tap Buff again to switch): rag, solvent, paint-over roller, jet wash */
var buffMode='rag',rollCol=null,rollG=null;const BUFFN={rag:'Buff',solvent:'Solvent',paint:'Roller',jet:'Jet wash'},BUFFT={rag:'Rag buff',solvent:'Solvent rag: dissolves dye further, a wider haze, more runs',paint:'Paint-over: grey roller — staining inks creep back through',jet:'Jet wash: blasts paint off, barely touches stains'};
function rollerAt(a0,b){const now=performance.now(),a=rollerAt.p&&now-rollerAt.t<350?rollerAt.p:a0;rollerAt.p={x:b.x,y:b.y};rollerAt.t=now;const R2=60,bx=baked.x,dx=b.x-a.x,dy=b.y-a.y;if(!rollCol){const m=surfAt(b.x,b.y).mean||[150,150,150],wl='#'+m.map(v=>Math.round(v).toString(16).padStart(2,'0')).join('');rollCol=mixHex(wl,'#8f8d86',.6)}
 const ty=inkAt(b.x,b.y),P=dpr,X=Math.max(0,Math.floor((Math.min(a.x,b.x)-R2)*P)),Y=Math.max(0,Math.floor((Math.min(a.y,b.y)-R2)*P)),w=Math.min(baked.c.width-X,Math.ceil((Math.abs(dx)+R2*2)*P)),h=Math.min(baked.c.height-Y,Math.ceil((Math.abs(dy)+R2*2)*P));
 /* staining ink under the fresh paint: it migrates back through over the next while as a faint violet-grey ghost */
 if(ty&&(GHOST[ty]||0)>.2&&w>2&&h>2){if(!rollG||!bleedL.includes(rollG)){const c=document.createElement('canvas');c.width=baked.c.width;c.height=baked.c.height;rollG={c,x:0,y:0,t0:performance.now()+2500,dur:9000,a:.2,slow:1};bleedL.push(rollG)}const gx=rollG.c.getContext('2d'),t=tcan(Math.ceil(Math.max(w,h)/128)*128,'rg');t.x.setTransform(1,0,0,1,0,0);t.x.globalCompositeOperation='copy';t.x.drawImage(idm.c,X,Y,w,h,0,0,w,h);t.x.globalCompositeOperation='source-in';t.x.fillStyle='#4f4366';t.x.fillRect(0,0,w,h);t.x.globalCompositeOperation='source-over';gx.drawImage(t.c,0,0,w,h,X,Y,w,h)}
 stripSheen(b,R2*1.15);bx.save();bx.lineCap='butt';bx.lineJoin='round';bx.strokeStyle=rollCol;bx.globalAlpha=.93;bx.lineWidth=R2*2;bx.beginPath();bx.moveTo(a.x,a.y);bx.lineTo(b.x,b.y);bx.stroke();
 /* roller nap: a fine stipple, and lap marks where the edges of the roller press harder */bx.globalAlpha=.07;for(let i=0;i<40;i++){const t=Math.random(),q=(Math.random()-.5)*R2*2,nx=-dy/(Math.hypot(dx,dy)||1),ny=dx/(Math.hypot(dx,dy)||1);bx.fillStyle=Math.random()<.5?'#ffffff':'#000000';bx.fillRect(a.x+dx*t+nx*q,a.y+dy*t+ny*q,1.2,1.2)}
 bx.globalAlpha=.12;bx.lineWidth=2;bx.strokeStyle=mixHex(rollCol,'#000000',.25);const L=Math.hypot(dx,dy)||1,nx=-dy/L*R2,ny=dx/L*R2;for(const sg of [1,-1]){bx.beginPath();bx.moveTo(a.x+nx*sg,a.y+ny*sg);bx.lineTo(b.x+nx*sg,b.y+ny*sg);bx.stroke()}bx.restore();
 const ix=idm.x;ix.save();ix.lineCap='butt';ix.strokeStyle=`rgb(${(Object.keys(INK).indexOf('water')+1)*20},0,0)`;ix.lineWidth=R2*2;ix.beginPath();ix.moveTo(a.x,a.y);ix.lineTo(b.x,b.y);ix.stroke();ix.restore();
 for(let t=0;t<=1;t+=.25)markInk(a.x+dx*t,a.y+dy*t,R2,Object.keys(INK).indexOf('water')+1,rollCol);dirty=true}


function solventAt(a,b){if((solventAt.n=(solventAt.n||0)+1)%2)return;/* solvent re-dissolves the dye: it lifts further, smears wider and runs more */const ty=inkAt(b.x,b.y);if(!ty)return;stripSheen(b,36);smearDir(baked,a,b,.3,28,false);restoreBg(b,(GHOST[ty]?.1:.22),20);
 const c=colG[inkCell(b.x,b.y)];if(typeof c==='string'&&c[0]==='#'){const bx=baked.x,rr=70;bx.save();bx.globalCompositeOperation='multiply';bx.globalAlpha=.07;try{bx.drawImage(feather(washTint(c)),b.x-rr,b.y-rr*.7,rr*2,rr*1.4)}catch(_){}bx.restore();
  if(Math.random()<.5)drip(b.x+(Math.random()-.5)*40,b.y+10,.5+Math.random()*.6,{ty,col:c,wash:1,soft:1,al:.26,r:.6+Math.random()*.9,delay:120})}dirty=true}
function toolMove(a,b){toolAcc+=Math.hypot(b.x-a.x,b.y-a.y);const fing=tool==='smudge';if(toolAcc<(tool==='buff'&&!fing?14:3))return;toolAcc=0;if(tool==='buff')liveRunHit(a,b,buffMode);if(tool==='buff'&&!fing){const _bt=performance.now();if(_bt-(toolMove._bt||0)<24)return;toolMove._bt=_bt;buffAt(a,b);return}if(chromes.length)ruinChrome(b);
  const wet=wetAt(b.x,b.y),s=surfAt(b.x,b.y);
  if(fing){const tyF=inkAt(b.x,b.y),isSkin=tyF==='oil'||tyF==='alcpaint'||tyF==='fluid'||!!(pen&&pen.props&&pen.props.skinOver);if(wet<.05){if(!saidDry++)toast('Dry — nothing moves under your finger');return}
  if(isSkin&&wet<.62&&wet>.16){/* Skinned-over mid-cure phase: outer crust tears & wrinkles under a finger instead of gliding smoothly */
   if(!toolMove._skinT++){toast('Skinned over — rubbing tears the half-cured film')}
   smearDir(baked,a,b,wet*.55,10,true);restoreBg(b,(.62-wet)*.28,7);for(const k in WET)if(WET[k].active)smearDir(WET[k],a,b,.35,9,true);smearDir(idm,a,b,wet*.45,10,true)  }else{   smearDir(baked,a,b,wet*.85,12,false);for(const k in WET)if(WET[k].active)smearDir(WET[k],a,b,.6,12,false);smearDir(idm,a,b,wet*.8,12,false)  }}
 else{const ty=inkAt(b.x,b.y),ink=ty&&INK[ty],wa=waterAt(b.x,b.y)*(s.wet?1:0),ww=Math.max(wet,ty==='water'?wa*.9:wa*.2),dry=ink?ink.rem[s.absorb>.3?1:0]*(1+wa):0,rem=ink?Math.max(dry,ww*.6*(1-s.absorb*.7)):0;
  if(ww>.05){smearDir(baked,a,b,ww*.7,16,true);restoreBg(a,ww*.12,13);for(const k in WET)if(WET[k].active)smearDir(WET[k],a,b,.6,16,false);smearDir(idm,a,b,ww*.6,16,false)}
  if(rem>0){restoreBg(b,rem*.35,16);erase(idm,b,rem*.35,16);for(const k in WET)if(WET[k].active)erase(WET[k],b,.3,16)}
  else if(ink&&ww<.05&&!saidDry++)toast('Cured paint — the cloth does nothing')}
 gvMark(b.x-40,b.y-40,b.x+40,b.y+40);dirty=true}

