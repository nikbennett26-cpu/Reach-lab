/* ---------- rain: water keeps hitting the tag, so ink washes down in curtains of runs ----------
   still-wet ink runs freely; dry water-based paint re-dissolves; dry dye/alcohol inks only weep a little;
   oil paint, chrome and etch barely move once dry. Each spot washes out over time. */
const RSOL={solid:[.1,0],water:[1,.75],flow:[1,.12],alcohol:[1,.14],stain:[1,.16],bleed:[1,.18],future:[1,.15],alcpaint:[.85,.05],oil:[.55,.02],fluid:[.4,.02],chrome:[.5,.02],etch:[0,0]};
let rainSpT=0;
/* rain soaks the ink: bleeds spread outward through the water film around the letters, then run */
function rainSpread(i,ty,sol){const cx=(i%GW)*C+C/2,cy=Math.floor(i/GW)*C+C/2,R0=46,x0=Math.max(0,Math.floor(cx-R0)),y0=Math.max(0,Math.floor(cy-R0)),w=Math.min(W,Math.ceil(cx+R0))-x0,h=Math.min(H,Math.ceil(cy+R0*1.4))-y0;if(w<8||h<8)return;
 const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.drawImage(baked.c,x0*dpr,y0*dpr,w*dpr,h*dpr,0,0,w,h);x.globalCompositeOperation='destination-in';x.drawImage(idm.c,x0*dpr,y0*dpr,w*dpr,h*dpr,0,0,w,h);
 const g=x.createRadialGradient(cx-x0,cy-y0,0,cx-x0,cy-y0,R0*.9);g.addColorStop(0,'#000');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,w,h);
 const n0=spreads.length;addSpread(c,x0,y0,w,h,ty,surfAt(cx,cy),.38*sol);const sp=spreads[n0];if(sp){sp.D*=1.25;sp.T*=1.3;sp.keep=1}}
function runRain(dt){if(!rainSet.has(cur.id)||!upright)return;
 if((rainSpT-=dt)<=0&&rainCells&&rainCells.length&&spreads.length<12){rainSpT=.7;const keys=Object.keys(INK);for(let k=0;k<1;k++){const i=rainCells[Math.floor(Math.random()*rainCells.length)],ty=keys[inkG[i]-1],so=RSOL[ty]||[.5,.05],sol=(wg[i]>.05?so[0]:so[1]*1.6)*rainLeft[i];if(sol>.12&&SPD[ty]){rainSpread(i,ty,Math.min(1,sol));rainLeft[i]*=.8}}}
 if((rainScan-=dt)<=0){rainScan=.4;rainCells=[];for(let i=0;i<inkG.length;i++)if(inkG[i]&&rainLeft[i]>.04)rainCells.push(i)}
 if(!rainCells.length)return;rainAcc+=dt*Math.min(6,1.5+rainCells.length*.02);const keys=Object.keys(INK);
 while(rainAcc>=1){rainAcc--;const i=rainCells[Math.floor(Math.random()*rainCells.length)],ty=keys[inkG[i]-1],sol=RSOL[ty]||[.5,.05],p=(wg[i]>.05?sol[0]:sol[1])*rainLeft[i];
  if(Math.random()>p)continue;const x=(i%GW)*C+Math.random()*C,y=Math.floor(i/GW)*C+Math.random()*C,col=colG[i];if(!col||col[0]!=='#')continue;
  drip(x,y,.25+Math.random()*.6*rainLeft[i],{ty,col,al:.5,r:.4+Math.random()*Math.random()*1.1,delay:Math.random()*250});
  rainLeft[i]*=.3;for(const o of [-2,-1,1,2]){const j=i+o;if(j>=0&&j<rainLeft.length)rainLeft[j]*=.5}if(Math.random()<.2)restoreBg({x,y},.012*sol[0],4)}}
/* RUNS MERGE: a run just behind another is pulled sideways into its wet path (surface tension), and when they touch they
   join — the leading run carries on with both runs' paint. It only gets a little fuller (≤15% wider), never a fat stripe. */
function mergeRuns(dt){const G=gDir(),gm=Math.hypot(G.x,G.y)||1,ux=G.x/gm,uy=G.y/gm,nx=-uy,ny=ux,now=performance.now(),A=[];
 for(const d of drips)if(!(d.t0&&now<d.t0)&&!d.et&&!d.soft&&!d.wash&&!d.dead&&d.sy!==undefined&&d.vol>0&&Math.hypot(d.x-d.sx,d.y-d.sy)>d.r*5+10)A.push(d);/* only once clear of the fat root */if(A.length<2)return;
 for(let a=0;a<A.length;a++)for(let b=a+1;b<A.length;b++){const p=A[a],q=A[b];if(p.dead||q.dead)continue;const dx=q.x-p.x,dy=q.y-p.y,lat=dx*nx+dy*ny,alo=dx*ux+dy*uy,rr=p.r+q.r;
  if(Math.abs(lat)>rr*1.9+2||Math.abs(alo)>34)continue;const lead=alo>=0?q:p,tail=lead===q?p:q,gap=Math.abs(alo),side=tail===p?Math.sign(lat):-Math.sign(lat);
  if(Math.abs(lat)<rr*.7&&gap<Math.max(lead.r,tail.r)*5+3){const w=tail.vol/(lead.vol+tail.vol+1e-6);{const add=tail.vol*.55,rt=clamp(lead.vol/lead.v0,.05,1);lead.vol+=add;lead.v0=lead.vol/rt}/* Volume-conserving head swell (r ~ V^(1/3)) + Kubelka-Munk pigment mixing */
   const rSw=Math.min(3.8,Math.cbrt(lead.r*lead.r*lead.r+tail.r*tail.r*tail.r*.52));lead.r=Math.max(lead.r,rSw*.94);lead.rT=rSw;
   if(typeof lead.col==='string'&&typeof tail.col==='string'&&lead.col[0]==='#'&&tail.col[0]==='#'&&lead.col!==tail.col){lead.col=typeof kmMix==='function'?kmMix([{c:lead.col,ts:Math.max(.1,1-w)},{c:tail.col,ts:Math.max(.1,w*.85)}]):mixHex(lead.col,tail.col,Math.min(.45,w));if(lead.pg&&lead.wall)lead.pg={lite:lead.col,deep:lead.col,root:lead.pg.root}}
   /* the joining run tapers into the other one — a smooth Y, not a stub with a round head */
   {const tc=tail.pg?tail.pg.lite:tail.col,hid=(x,y)=>lmOwn(x|0,y|0,tail.sid)||smAt(x|0,y|0);/* a join under a letter stays out of sight like the runs themselves */if(typeof tc==='string'&&tc[0]==='#'&&!hid(tail.x,tail.y)&&!hid(lead.x,lead.y)){const w0=Math.max(.5,tail.r*(.4+.6*clamp(tail.vol/tail.v0))*.85),w1=Math.max(.4,lead.r*.5),bx=baked.x,ex=lead.x-ux*Math.min(gap*.5,lead.r*2),ey=lead.y-uy*Math.min(gap*.5,lead.r*2),ddx=ex-tail.x,ddy=ey-tail.y,L=Math.hypot(ddx,ddy)||1,px=-ddy/L,py=ddx/L;
    bx.save();bx.globalAlpha=Math.min(.97,tail.ink?tail.ink.opacity:1);bx.fillStyle=tc;bx.beginPath();bx.moveTo(tail.x+px*w0,tail.y+py*w0);bx.quadraticCurveTo(tail.x+ux*L*.6+px*w0*.7,tail.y+uy*L*.6+py*w0*.7,ex+px*w1,ey+py*w1);bx.lineTo(ex-px*w1,ey-py*w1);bx.quadraticCurveTo(tail.x+ux*L*.6-px*w0*.7,tail.y+uy*L*.6-py*w0*.7,tail.x-px*w0,tail.y-py*w0);bx.closePath();bx.fill();bx.restore()}}
   lead.spd=Math.max(lead.spd||0,(tail.spd||0)*1.15)*1.25;if(lead.stl){lead.stl=0;lead.rBk=lead.rS}tail.dead=1}
  else if(gap<Math.max(3.5,(lead.r+tail.r)*1.35)&&!tail.et&&!lead.et&&!tail.wash&&!lead.wash&&tail.vol>0&&lead.vol>0){/* two active runs crossing paths fuse into a swollen bead with Kubelka-Munk colour blend */const bx=baked.x,wM=Math.max(.6,Math.min(tail.r,lead.r)*.95),wC=tail.vol/(lead.vol+tail.vol+1e-6);if(typeof lead.col==='string'&&typeof tail.col==='string'&&lead.col[0]==='#'&&tail.col[0]==='#'&&lead.col!==tail.col){lead.col=typeof kmMix==='function'?kmMix([{c:lead.col,ts:Math.max(.1,1-wC)},{c:tail.col,ts:Math.max(.1,wC*.85)}]):mixHex(lead.col,tail.col,Math.min(.45,wC))}if(typeof tail.col==='string'&&tail.col[0]==='#'){bx.save();bx.globalAlpha=Math.min(.97,tail.ink?tail.ink.opacity:1);bx.strokeStyle=tail.col;bx.beginPath();bx.moveTo(tail.x,tail.y);bx.lineTo(lead.x,lead.y);bx.lineWidth=wM*1.6;bx.lineCap='round';bx.stroke();bx.restore()}lead.vol=Math.min(lead.v0*1.5,lead.vol+tail.vol*.65);lead.r=Math.min(3.8,Math.cbrt(lead.r*lead.r*lead.r+tail.r*tail.r*tail.r*.58));tail.vol=-1;tail.dead=1}
  else if(gap>1&&(tail.ph%1)<.45){/* only some runs get drawn across — most hang straight */const m=Math.min(Math.abs(lat),dt*(6+10*(1-Math.abs(lat)/(rr*1.9+2))))*side;tail.x+=nx*m;tail.y+=ny*m}}}
/* END SIZE: every run's end is its own size, set by how much paint it still carries when it stops — a stub that stopped soon
   after leaving the letter ends in a small rounded tip, a run that ran out of paint tapers almost to nothing, a long run that
   arrives with paint to spare ends a little fuller, and now and then a bead gathers where one paused */
function endSize(d){if(d.endK)return d.endK;const vr=clamp((d.vol||0)/(d.v0||1)),stub=d.maxT&&(d.tr||0)<=d.maxT*1.2;let k=vr<.08?.55+Math.random()*.2:.78+.5*clamp(vr*1.6);if(stub)k*=.82;if(Math.random()<.08)k*=1.3;return d.endK=clamp(k*(.9+Math.random()*.2),.5,1.45)}
function runHaze(xa,ya,xb,yb,r,a,col){const P=dpr,pad=Math.ceil(16+r*2),X=Math.max(0,Math.floor((Math.min(xa,xb)-pad)*P)),Y=Math.max(0,Math.floor((Math.min(ya,yb)-pad)*P)),w=Math.ceil((Math.abs(xb-xa)+pad*2)*P),h=Math.ceil((Math.abs(yb-ya)+pad*2)*P);if(w<2||h<2)return;
 const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');try{x.filter=`blur(${(4.2+r*.55)*P}px)`}catch(_){}x.strokeStyle=col||'#5a3aa8';x.lineCap='round';x.lineWidth=(r*2.4+3.5)*P;x.beginPath();x.moveTo(xa*P-X,ya*P-Y);x.lineTo(xb*P-X,yb*P-Y);x.stroke();x.filter='none';
 bleedL.push({c,x:X,y:Y,t0:performance.now()+140,dur:1700,a,comp:'multiply'})}
/* smooth 1-D value noise for drip wander */
function vnz(t,sd){const i=Math.floor(t),f=t-i,u=f*f*(3-2*f),h=k=>{let v=Math.imul((k+sd*7919)|0,374761393)>>>0;v=Math.imul(v^(v>>>13),1274126177)>>>0;return((v^(v>>>16))>>>0)/4294967296};return h(i)+(h(i+1)-h(i))*u}
/* DROPS THAT LET GO: a bead hanging off an overhang (a ledge or cill edge) swells until its weight beats surface tension,
   pinches off and falls clear of the wall — you see it drop, it doesn't paint the wall on the way down */
const falls=[];
function dropFall(x,y,r,col){if(falls.length>40||!col||col[0]!=='#')return;falls.push({x,y,r:Math.max(1,r),col,vy:20,vx:0,t:0,hang:.18+Math.random()*.35})}
/* A FULL LEDGE LETS GO IN DROPLETS: paint that spills off the lip hangs as a bead and falls clear as round drops (one to three,
   staggered) — it doesn't start a new run down the wall below the ledge */
function ledgeLetGo(x,y,vol,r,col){const n=vol>1.3?3:vol>.7?2:1;for(let k=0;k<n;k++){const rr=Math.min(4.2,Math.max(1.5,(r||1)*1.25+vol*(k?.5:.7))),b=falls.length;
  dropFall(x+(k?(Math.random()-.5)*7:0),y,rr,col);if(falls.length>b)falls[falls.length-1].hang+=k*(.25+Math.random()*.35)}}
function runFalls(dt){for(let i=falls.length-1;i>=0;i--){const f=falls[i];f.t+=dt;if(f.t<f.hang)continue;const G=gDir(),gm=Math.hypot(G.x,G.y)||1;f.vy+=980*dt*(G.y/gm);f.vx+=980*dt*(G.x/gm);f.x+=f.vx*dt;f.y+=f.vy*dt;if(f.y>H+30||f.x<-30||f.x>W+30)falls.splice(i,1)}if(falls.length)dirty=true}
function drawFalls(x){if(!falls.length)return;x.save();x.setTransform(dpr,0,0,dpr,0,0);for(const f of falls){const hang=f.t<f.hang,k=hang?f.t/f.hang:1,sp=Math.hypot(f.vx,f.vy),st=Math.min(5,sp*.012),r=f.r*(hang?.7+.45*k:1);
  x.fillStyle=f.col;x.globalAlpha=.95;x.beginPath();x.ellipse(f.x,f.y+(hang?r*.6*k:0),r*(hang?1:.85),r*(hang?1+.4*k:1+st*.35),0,0,TAU);x.fill();
  if(!hang&&st>.3){x.globalAlpha=.35;x.beginPath();x.ellipse(f.x,f.y-r*st*.8,r*.5,r*st,0,0,TAU);x.fill()}
  x.globalAlpha=.5;x.fillStyle='#ffffff';x.beginPath();x.arc(f.x-r*.35,f.y-r*.25,Math.max(.4,r*.25),0,TAU);x.fill()}x.restore()}
/* RUN CHANNELS: every run leaves a slick paint track; a later run that passes close is pulled into it and slides faster
   down the same path — so drips gather into the same lines the way they do on a real wall */
const RCH=new Map();let rchN=0,rchId=0;
/* each track point remembers when it was laid and how long that ink stays wet: a run is only drawn into a track that is still wet
   (a dried run is just a ridge), and the wetter the track the harder it pulls, the faster it slides and the fatter the run gets */
function chanAdd(x,y,id,life){if(rchN>24000)return;const b=Math.floor(y/8);let a=RCH.get(b);if(!a)RCH.set(b,a=[]);const l=a[a.length-1];if(l&&l[1]===id&&Math.abs(l[0]-x)<1){l[2]=performance.now();return}a.push([x,id,performance.now(),life||9000]);rchN++}
/* RAISED BEAD: a bulb or bead of ink stands up off the wall, so it catches the light on its upper side and shades on its lower
   side, unlike the flat run beside it. Glossy inks get a crisp glint, matte ones only the shading. */
function beadLight(ctx,x,y,r,fs,d,an){if(r<1.2||typeof fs!=='string'||fs[0]!=='#'||DYEINK[d.ty]||d.wash)return;const lv=lum(hex(fs)),sh=SHEEN[d.ty]??.4;ctx.save();ctx.lineCap='round';
 ctx.globalCompositeOperation='source-over';ctx.globalAlpha=lv>.45?.14+.1*lv:.16;ctx.strokeStyle=lv>.45?'#222938':mixHex(fs,'#000000',.45);ctx.lineWidth=Math.max(.6,r*.26);ctx.beginPath();ctx.arc(x,y,r*.82,an-.45,an+1.15);ctx.stroke();
 if(sh>.5&&r>1.6){ctx.globalAlpha=Math.min(.42,(.1+.35*sh)*(lv>.8?.5:1));ctx.fillStyle='#ffffff';ctx.beginPath();ctx.ellipse(x-r*.38,y-r*.42,Math.max(.4,r*.28),Math.max(.3,r*.18),-.6,0,TAU);ctx.fill()}
 ctx.restore()}
let chW=0;function chanNear(x,y,rad,id){let best=null,bd=rad,bw=0;const now=performance.now();for(const b of [Math.floor(y/8),Math.floor(y/8)+1]){const a=RCH.get(b);if(!a)continue;for(const e of a){if(e[1]===id)continue;const w=1-(now-(e[2]||0))/(e[3]||9000);if(w<.04)continue;const d=Math.abs(e[0]-x)-w*2;if(d<bd){bd=d;best=e[0];bw=w}}}chW=bw;return best}
function chanClear(){RCH.clear();rchN=0}
function surfGrad(s,x,y){if(!s||!s.h)return{gx:0,gy:0};const ix=((Math.round(x*dpr)%TS)+TS)%TS,iy=((Math.round(y*dpr)%TS)+TS)%TS;const xp=(ix+1)%TS,xm=(ix-1+TS)%TS,yp=(iy+1)%TS,ym=(iy-1+TS)%TS;return{gx:s.h[iy*TS+xp]-s.h[iy*TS+xm],gy:s.h[yp*TS+ix]-s.h[ym*TS+ix]}}
/* LEDGE FEED: after a run's head lands on the ledge, the wet run above it keeps draining into the pool in a few pulses, so the pool
   keeps growing for a moment and can fill up and spill over the front later, not only at the instant of arrival */
const ledFeed=[];function runLedFeed(){if(!ledFeed.length)return;const now=performance.now();for(let i=ledFeed.length-1;i>=0;i--){const f=ledFeed[i];if(now<f.next)continue;if(!ledgeLive()){ledFeed.splice(i,1);continue}f.d.vol=f.dv;f.d.v0=Math.max(f.d.v0||0,f.dv);try{ledgeHit(f.d,f.x,f.col,f.r*(.7+.3*f.n/6))}catch(_){}dirty=true;f.n--;f.next=now+f.gap;f.gap*=1.25;if(f.n<=0)ledFeed.splice(i,1)}}
function runDrips(dt){runFalls(dt);runLedFeed();if(!drips.length)return;mergeRuns(dt);
 for(let i=drips.length-1;i>=0;i--){const d=drips[i];if(d.dead){drips.splice(i,1);continue}if(d.t0&&performance.now()<d.t0)continue;if(d.srcCell>=0&&fh&&d.vol<d.v0*1.65){/* 3x3 coupled meniscus basin: drip pulls live fluid volume from the wet bead above its neck */
 let pulled=0;const sc0=d.srcCell,sx0=sc0%GW,sy0=(sc0/GW)|0; for(let oy=-1;oy<=1;oy++)for(let ox=-1;ox<=1;ox++){  const nx=sx0+ox,ny=sy0+oy;if(nx<0||nx>=GW||ny<0||ny>=GH_)continue;  const ni=ny*GW+nx,hN=fh[ni];if(hN>.07){const wN=(ox===0&&oy===0)?.24:.08,pN=Math.min(hN*wN,dt*.36*wN*3.5);fh[ni]-=pN;pulled+=pN} } if(pulled>0){d.vol+=pulled*.78;d.r=Math.min(d.thick?3.8:2.4,d.r+pulled*.08)}}
  /* A RUN ALWAYS HANGS OFF PAINT — the finished letters, or the one being written right now — from the paint's lower edge.
     Any tag drip (including wet-wall wash runs and etch runs; only buff/solvent runs have soft:1) that lands on bare wall is
     pulled straight back into the paint edge above it — or dropped if there's no paint there. No drips starting in mid-air. */
  if(d.sy===undefined&&!d.soft&&!d.led){if(!d.snap){d.snap=1;const onP=(px,py)=>lmOwn(px|0,py|0,d.sid)||smAt(px|0,py|0);
   if(!onP(d.x,d.y)){const G0=gDir(),gm=Math.hypot(G0.x,G0.y)||1,ux=G0.x/gm,uy=G0.y/gm,lim=Math.max(24,(d.w||R())*1.3);let f=-1;
    for(let k=1;k<=lim;k++)if(onP(d.x-ux*k,d.y-uy*k)){f=k;break}
    if(f<0){d.dead=1;continue}
    d.x-=ux*f;d.y-=uy*f}}}
  const s=surfAt(d.x,d.y),_smP=TS*.5/dpr,gr=(s.id==='stairs'&&(((d.y%_smP)<3.2)||((d.x%_smP)<2.2))),G=gDir(),still=G.m<.18;
  /* Smooth, fluid motion (not a sped-up timelapse): gentle ease-in as surface tension gives way at the edge, steady natural
     flow, and smooth deceleration as the bead runs out of paint — with vol decay scaled to match so total run length stays true */
  const fl=fluidOf(d.ty),vr=clamp(d.vol/(d.v0||1)),easeIn=d.em?(.26+.74*sm(clamp((d.tr||0)/10))):.85,easeOut=.20+.80*Math.pow(vr,.48),
   wf=d.wet?wetF(d.x,d.y):1,gEff=gEffOf(G.m);
  /* Navier-Stokes creeping-bead balance: terminal speed v ~ (rho*g*r^2)/(3*mu_app), with shear-thinning & drying viscosity */
  const dryMu=1/(0.28+0.72*Math.pow(clamp(d.visc||1,.15,1),1.4)),shearThin=1/(1+(d.spd||0)*(fl.ty>.1?.0065:.0015)),muApp=fl.mu*dryMu*shearThin*(d.thick?1.35:1),
   headDrive=(18+d.vol*28)*(fl.rho/Math.max(.35,muApp))*(.65+.35*clamp(d.r/1.5,.5,2.1)),
   vTerm=clamp(headDrive,6,115)*(1-s.absorb*.58)*(1-s.rough*.48)*(d.wet?(.95+wf*.95):1)*(gr?.18:1)*gEff*easeIn*easeOut,y0=d.y,x0=d.x;
  if(!d.gx){d.gx=G.x;d.gy=G.y;d.spd=vTerm*.35}if(ledgeLive()&&!d.led&&!d.et&&d.y<ledgeY(d.x))d.preL=1;const nowT=performance.now();
  const pz=d.pz&&nowT<d.pz;if(d.pz&&!pz){d.pz=0;d.bd=0}if(d.visc<1)d.visc=Math.max(.22,d.visc-dt*.028);
  /* PINCH-OFF LURCH: once a heavy head has swollen enough it breaks away from the run and surges ahead on a thin thread *//* SKINNING: the run's surface dries as it goes — fast for alcohol dyes, slow for paint, faster on a thirsty wall, slower
     on a wet one and for a fat run. It slows as it skins and stops where it is, leaving the paint still in its head as a fat bulb */
  d.age=(d.age||0)+dt;const _skO=!!(d.props&&d.props.skinOver),dryT=(TAUS[d.ty]||1.5)*2.2*(_skO?.68:1)*(d.wet?3:1)*(1-s.absorb*.5)*(1+Math.min(1.5,(d.v0||.5)*.6)),skin=d.soft||d.et||d.led||d.wash?0:clamp((d.age-dryT)/(dryT*(_skO?1.05:1.5)));
  if(skin>=1&&d.em&&!d.sk){d.sk=1;d.skv=clamp(d.vol/(d.v0||1));d.vol=0}
  const chBoost=1+.55*(d.inCh||0),pinBurst=(d.pin&&d.pin<1)?(1.85+.75*Math.sin(d.pin*Math.PI)):1;/* STOP-START: a run that's losing ink catches on the wall, stalls while its head swells, then lets go and lurches on - leaving a bulge where it waited. Gritty walls and paints with body catch more; a run fed from above lets go sooner */
  const _tk=DYEINK[d.ty]?0:clamp((fl.mu-1.1)/.8)*.6+clamp((fl.ty-.15)/.3)*.4+(d.thick?.2:0);/* how much body the ink has: thick paint stutters all the way down, thin dye mostly near the end */
  if(d.em&&!d.soft&&!d.et&&!d.wash&&!d.led&&!d.sk&&!still&&!pz&&!d.stl&&(d.inCh||0)<.5&&vr<(.8+.18*_tk)&&vr>.06&&(d.tr||0)>d.r*6+8&&nowT>(d.stlN||0)&&Math.random()<dt*(.25+1.1*(1-vr)+.35*_tk)*(.7+fl.ty*1.6+s.rough*1.5)*(s.wet?.6:1)){d.stl=nowT+260+Math.random()*(500+700*Math.min(1.6,fl.mu));d.rS=d.r;d.stk=_tk}
  let stalled=false;if(d.stl){if(nowT<d.stl){stalled=true;d.r=Math.min(d.rS*(1.32+.22*(d.stk||0))+.25,d.r+dt*(.5+.3*fl.gamma+.8*(d.stk||0)))}else{d.stl=0;/* lets go with a surge, and leaves the swollen bead where it waited */d.spd=Math.max(d.spd||0,vTerm*(1.55+.5*(d.stk||0)));d.rBk=d.rS;if(d.stk>.35&&Math.random()<.5)d.bdq={x:d.x,y:d.y,r:d.r};d.stlN=nowT+900+Math.random()*1400}}
  if(d.rBk){d.r=Math.max(d.rBk,d.r-dt*1.6);if(d.r<=d.rBk)d.rBk=0}
  const vGoal=(still||stalled?0:(pz?vTerm*.22:vTerm))*pinBurst*(1-skin*skin*.92)*chBoost;const resp=2.2+3.6/Math.max(.35,muApp);d.spd+=(vGoal-(d.spd||0))*Math.min(1,dt*resp);const sp2=d.spd;/* inertia-weighted gravity steering: heavy paints curve in wider arcs on tilt, thin inks turn sharply */const steer=Math.min(1,dt*(1.9+2.6/Math.max(.4,fl.mu)));d.gx+=(G.x-d.gx)*steer;d.gy+=(G.y-d.gy)*steer;const gm2=Math.hypot(d.gx,d.gy)||1;if(gm2>.01){d.gx/=gm2;d.gy/=gm2}d.x+=d.gx*sp2*dt;d.y+=d.gy*sp2*dt;
  /* WANDER: a real run never goes laser-straight — it drifts a little side to side, more on rough walls and when it's slow,
     and grit kicks it sideways in short jinks (it hesitates for a moment as it goes round) */
  if(d.em&&!d.soft&&!d.onStep&&!d.led&&s.h){
   const _hg=surfGrad(s,d.x,d.y),_nxH=-d.gy,_nyH=d.gx,_latH=-(_hg.gx*_nxH+_hg.gy*_nyH)*sp2*dt*(s.id==='stairs'?1.35:(.35+s.rough*1.8));
   d.x+=_nxH*clamp(_latH,-1.1,1.1);d.y+=_nyH*clamp(_latH,-1.1,1.1);
  }
  if(d.em&&!d.soft&&!d.onStep&&!d.led&&s.id!=='stairs'){const stp=sp2*dt,tv=(d.tr||0),A=(.07+s.rough*.6+s.absorb*.2)*(d.wet?.55:1)*(1+18/(sp2+12))*(d.thick?.8:1),
    lat=(vnz(tv/26,(d.ph*997)|0)-.5)*2*A*stp*.55;let kick=0;if(d.kq>0){const q=Math.min(d.kq,stp*.6);kick=q*d.kqd;d.kq-=q}else if(Math.random()<stp*(.006+s.rough*.03)){d.kq=.6+Math.random()*(1.2+s.rough*2);d.kqd=Math.random()<.5?-1:1;d.spd*=.55}
    const nx=-d.gy,ny=d.gx;d.x+=nx*(lat+kick);d.y+=ny*(lat+kick)}
  /* BRANCHING: a fat run meeting a bump or rib on a rough wall can split around it - part of the bead goes one way, part the other. Never on glass or smooth plastic */
  if(d.em&&!d.soft&&!d.et&&!d.wash&&!d.led&&!d.onStep&&!stalled&&!d.brn&&d.r>1.35&&d.vol>.45&&vr>.3&&drips.length<220&&(s.rough>.08||s.id==='stairs')){const hg=s.h?surfGrad(s,d.x,d.y):{gx:0,gy:0},bump=Math.hypot(hg.gx,hg.gy),pB=sp2*dt*.0035*(s.rough*2.2+(s.id==='stairs'?.6:0))*(1+bump*6)*clamp((d.r-1.2)/1.4)*(fl.mu>1.4?.6:1);
   if(Math.random()<pB){d.brn=1;const side=Math.random()<.5?-1:1,nx=-d.gy,ny=d.gx,sh=.42+Math.random()*.16,kid=Object.assign({},d,{x:d.x+nx*side*d.r*.9,y:d.y+ny*side*d.r*.9,lx:d.x,ly:d.y,vol:d.vol*sh,v0:d.v0*sh,r:Math.max(.6,d.r*.78),rT:0,rS:0,rBk:0,stl:0,pts:[],uid:0,hz:null,brn:1,kq:1.4+Math.random()*2.2,kqd:side,spd:(d.spd||0)*.8,gx:d.gx+nx*side*.35,gy:d.gy+ny*side*.35,pg:d.pg?Object.assign({},d.pg):null,settled:0});
    d.vol*=1-sh;d.v0*=1-sh;d.r=Math.max(.6,d.r*.86);d.kq=1+Math.random()*1.6;d.kqd=-side;drips.push(kid)}}
  /* PICK-UP: a run crossing paint that's still wet takes some of that colour with it, so it streaks two-tone below */
  if(d.em&&!d.et&&(!d.soft||d.pickUp)&&typeof d.col==='string'&&d.col[0]==='#'&&(d.pick=(d.pick||0)+dt)>.05){d.pick=0;const ci=inkCell(d.x,d.y+d.r),cc=colG[ci],wv=wetAt(d.x,d.y+d.r);if(cc&&typeof cc==='string'&&cc[0]==='#'&&cc!==d.col&&wv>.25&&!d.c0){d.c0=d.col}if(cc&&typeof cc==='string'&&cc[0]==='#'&&cc!==d.col&&wv>.25){d.col=mixHex(d.col,cc,Math.min(d.pickUp?.5:.35,(d.pickUp?.22:.12)*wv));if(d.pg){d.pg.lite=mixHex(d.pg.lite,cc,.1);d.pg.deep=mixHex(d.pg.deep,cc,.1)}}}
  if(d.em&&!d.soft&&!d.et&&!d.led&&!d.stp&&Math.abs(d.gy)>.6){if(!d.uid)d.uid=++rchId;const c=rchN?chanNear(d.x,d.y,d.r+3.5,d.uid):null;if(c!=null){const w=clamp(chW*1.25);d.x+=(c-d.x)*Math.min(1,dt*7*(.35+.65*w));d.inCh=w;d.kq=0;
   /* riding a wet track: it picks up the ink lying in it and fattens, up to a third of the line it came from */if(w>.25){const cap=Math.max(1.1,(d.w||R())*.55);if(d.r<cap)d.r=Math.min(cap,d.r+dt*.35*w);d.vol+=dt*.05*w}}else d.inCh=0;
   chanAdd(d.x,d.y,d.uid,(TAUS[d.ty]||1.5)*4200*(d.wet?2.5:1)*((typeof CARRY_WET!=='undefined'&&d.props&&CARRY_WET[d.props.base])||1))}
  
  if(still)d.vol-=dt*.07;if(d.maxT&&(d.tr||0)>d.maxT&&!d.led)d.vol-=dt*(1.4+d.vol*.8);/* this run has reached as far as its share of the water will carry it: it slows and stops with a bead */if(!stalled)d.vol-=(d.lk||1)*dt*.58*(1-.45*(d.inCh||0))*((.26+s.absorb*.9+s.rough*.5)*(d.wet?(1.20-wf*.70):1)+(gr?.68:0));
  if(d.rT&&d.r<d.rT)d.r=Math.min(d.rT,d.r+dt*.6);if(d.wet)d.r=Math.max(.8,d.r*(1-dt*.02));if(d.et)d.r=Math.max(.45,d.r*(1-dt*.6));
  if(d.sy===undefined){d.sy=y0;d.sx=x0;d.fq=.025+Math.random()*.035}
  /* EMERGING: use ONLY actual painted pixels (lmAt / smAt — never the coarse 8px fh grid, which hid drips 8-16px below the tag!).
     When the drip crosses out of the paint edge, it anchors right at (x0, y0) with zero initial wobble so the neck always touches. */
  {const lm=lmOwn(d.x|0,d.y|0,d.sid)||smAt(d.x|0,d.y|0);if(lm)d.uc=(d.uc||0)+1;else d.uc=0;
   if(!lm&&!d.em){d.em=1;d.jn=1;const far=Math.hypot(x0-d.sx,y0-d.sy)>Math.max(16,(d.w||R())*1.6);d.ex=far?d.sx:x0;d.ey=far?d.sy:y0;d.lx=x0;d.ly=y0}}
  const trav=d.em?Math.hypot(d.x-d.ex,d.y-d.ey):0,travP=d.em?Math.max(0,trav-Math.hypot(d.x-x0,d.y-y0)):0;d.tr=trav;
  const caNeck=1/(1+clamp((d.spd||0)*.0055/Math.max(.5,fl.gamma),0,.38)),headSwell=1+(d.em&&!d.soft?(1-vr)*.36*(fl.gamma/Math.max(.6,fl.rho))*(d.thick?1.15:.75):0),shp=t=>(d.soft?1:1+1.5*Math.exp(-t/(d.r*1.8+2.2)))*(fl.mu<.75?.5+.5*vr:fl.mu>1.4?.86+.14*vr:.76+.24*vr)*caNeck*headSwell*(1+.05*Math.sin(t*.09+d.ph)),re=d.r*shp(trav),reP=d.r*shp(travP);
  if(d.em&&!d.pin&&!d.soft&&!d.et&&!d.led&&(d.v0>=.55||d.thick)&&vr<.6&&trav>14+d.r*6){d.pin=Math.random()<.6?.001:2;if(d.pin<1){d.pinY=trav;d.vol=Math.max(d.vol,d.v0*.32)}}
  if(d.pin&&d.pin<1){d.pin=Math.min(1,(trav-d.pinY)/(22+d.v0*20));if(d.pin>=1){d.pin=1.5;/* the thread has snapped: the bead goes on alone and the trail it came from stays where it is */d.gapB=trav+13+Math.random()*24+d.r*3}}const thr=!d.pin||d.pin>=2?1:d.pin<1?1-.55*sm(clamp(d.pin/.3))+.4*sm(clamp((d.pin-.7)/.3)):.5,reD=re*thr,rePD=reP*thr;
  if(ledgeLive()&&(d.preL||(y0<ledgeY(x0)&&!d.led))&&!d.led&&d.y>=ledgeY(d.x)&&Math.abs(d.gy||gDir().y)>.5&&!LDG().sl){/* any run crossing the ledge line is caught, even one that started out of sight or arrived in a single big step */const dc0=dcolNow(d,trav,true),col=typeof dc0==='string'?dc0:'#808080';if(!d.settled){d.settled=1;dripSettle(d,s,d.x,ledgeY(d.x),0,1)}const stop=ledgeHit(d,d.x,col[0]==='#'?col:'#808080',d.r);d.preL=0;if(stop){/* the run's still-wet trail keeps draining into the pool after the head arrives */if(!LDG().sl&&!d.et&&(trav>30||d.v0>.6)&&ledFeed.length<40){const n=3+Math.round(Math.min(5,trav/60)),mu=clamp(fl.mu,.4,2.2);ledFeed.push({d:Object.assign({},d,{pts:null,vol:0}),x:d.x,col:col[0]==='#'?col:'#808080',r:d.r,n,dv:Math.min(1.4,d.v0*.45+trav/400)/n,next:performance.now()+260*mu,gap:(220+Math.random()*180)*mu})}d.vol=-1;drips.splice(i,1);continue}continue}
  /* ribbed panels: a run is drawn into the nearest groove and follows it down */if(s.id==='stairs'&&!d.et&&!d.onStep&&Math.abs(d.gy)>.8){const P=TS/(40*dpr),g=(Math.round(d.x/P-.5)+.5)*P;d.x+=(g-d.x)*.18}
  /* subway stairs interaction: drips hit the concrete tread, pool at the wall seam, and if wet/heavy creep across the tread & cascade over the riser lip */
  if(s.id==='stairs'&&!d.et&&!d.soft&&Math.abs(d.gy)>.55){const st=stairsStepAt(d.x,d.y);if(st&&d.onStep!==st.idx+1){d.onStep=st.idx+1;const colS=typeof d.col==='string'&&d.col[0]==='#'?d.col:'#808080';if(stairHit(d,st,colS)){d.vol=-1;drips.splice(i,1);continue}continue}}
  /* ramp wobble smoothly from 0 at the exit edge so the neck stays dead-on the paint, and stitch continuously from d.lx,d.ly */
  const wScale=d.em?sm(clamp(trav/(d.r*3+5))):0,wob=((Math.sin((d.x+d.y)*d.fq+d.ph)*.7+Math.sin((d.x+d.y)*d.fq*2.3+d.ph*1.7)*.3)*(d.wet?.85:.5+d.r*.24)*(1+s.rough*2.2)+/* a slow sway as well, so even a fat run on smooth plastic meanders a little instead of falling ruler-straight */Math.sin(d.y*d.fq*.31+d.ph*.6)*(1.1+d.r*.45))*wScale,
   xw=d.x-d.gy*wob,yw=d.y+d.gx*wob,px0=d.lx!==undefined?d.lx:x0-d.gy*wob,py0=d.ly!==undefined?d.ly:y0+d.gx*wob,done=d.vol<=0||d.y>H+16||d.y<-16||d.x<-16||d.x>W+16;
  if(d.oy0===undefined){d.oy0=yw;d.out=0}if(!d.out&&!lmOwn(xw|0,yw|0,d.sid)&&!smAt(xw|0,yw|0)){d.out=1;d.outY=yw}if(d.out===1&&Math.abs(yw-d.outY)>d.r*2+5)d.out=2;/* it has left its own letter */const hitWetSame=d.em&&d.out===2&&!d.soft&&!d.et&&!d.wash&&!!lmAt(xw|0,yw|0)&&wetAt(xw,yw)>.12&&(()=>{const hc=colG[inkCell(xw,yw)];return !hc||hc===d.col||lmOwn(xw|0,yw|0,d.sid)})();if(hitWetSame){/* wet run meets wet ink of the same tag: blend cleanly at the top edge & transfer volume into the lower bar's fluid grid */const jCol=dcolNow(d,trav,false),bx=baked.x;if(typeof jCol==='string'&&jCol[0]==='#'){bx.save();if(d.ink&&d.ink.comp==='multiply')bx.globalCompositeOperation='multiply';bx.globalAlpha=inkAlpha(d.ink,s);bx.fillStyle=jCol;let ey=yw,k=0;for(;k<12&&lmAt(xw|0,(ey-1)|0);k++)ey-=1;if(k<12){bx.beginPath();bx.ellipse(xw,ey-d.r*.25,d.r*1.35,d.r*.95,0,0,TAU);bx.fill()}bx.restore()}if(fh){const gx=clamp(Math.floor(xw/C),0,GW-1),gy=clamp(Math.floor((yw+d.r*1.5)/C),0,GH_-1),fi=gy*GW+gx;fh[fi]+=Math.min(1.8,.35+d.vol*.95);fw[fi]=Math.max(fw[fi]||0,.95);ft[fi]=ft[fi]||(TAUS[d.ty]||1.5);fid[fi]=fid[fi]||d.id;fcol[fi]=fcol[fi]||d.col;fRad[fi]=fRad[fi]||d.w||R();fk[fi]=d.thick?1:0;flowOn=true}if(!d.settled){d.settled=1;dripSettle(d,s,xw,yw,0,1)}d.vol=-1;drips.splice(i,1);continue}const mergeIn=false;
   const under=mergeIn||(d.em?(lmOwn(xw|0,yw|0,d.sid)&&lmOwn(d.x|0,d.y|0,d.sid)&&lmOwn(px0|0,py0|0,d.sid))||!!smAt(xw|0,yw|0):true)||(ledgeLive()&&LDG().sl>0&&yw>ledgeY(xw)-1.5&&yw<ledgeY(xw)+LDG().h+1.5);
  if(typeof d.col==='string'&&d.col[0]==='#'&&!d.et){const lc=colG[inkCell(xw,yw)];if(lc&&lc[0]==='#'&&lc!==d.col){const wv=wetAt(xw,yw);if(under||wv>.3){const k=Math.min(.5,(under?.05+.3*wv:.2*wv)*dt*20);if(k>.002){if(d.mlc!==lc){d.mlc=lc;d.c0=d.col;d.mx=0}d.mx+=k;const cap=lum(hex(d.c0))<lum(hex(lc))?.4:.65;d.col=mixHex(d.c0,lc,Math.min(cap,d.mx));if(d.pg&&d.wall)d.pg={lite:d.col,deep:d.col,root:d.pg.root}}}}}
  if(!LOWGPU&&!under&&!d.et&&!d.soft&&(d.ty==='stain'||d.ty==='bleed'||d.wet||(pen&&pen.props&&((pen.props.bleedAdd||0)>=.15||(pen.props.ghostBoost||0)>=.18)))){if(!d.hz)d.hz=[px0,py0];if(Math.hypot(xw-d.hz[0],yw-d.hz[1])>28){const dCol=(pen&&pen.props&&pen.props.ghostCol)||((typeof d.col==='string'&&d.col[0]==='#'&&lum(hex(d.col))<.22)?'#5a35a6':(typeof d.col==='string'&&d.col[0]==='#'?d.col:'#5a3aa8'));const dAl=d.wet?(d.wash?.24:.38):.18;runHaze(d.hz[0],d.hz[1],xw,yw,re,dAl,dCol);d.hz=[xw,yw]}}
  let skip=false,dot=false;if(!under&&!done&&!d.soft&&!d.wash&&!d.et&&d.v0>0){const _slk=SLICK[s.id]||.4,_bkThr=clamp((.11+.11*(fl.gamma/Math.max(.55,fl.mu))+.08*_slk)*(d.thick?.42:1),.06,.32),_bkMaxR=d.thick?.95:1.15+.32*_slk;if(d.r<_bkMaxR&&d.vol/d.v0<_bkThr){d.bk=(d.bk||0)+Math.hypot(xw-px0,yw-py0);if(d.bk<2.8+d.r*(4.4+fl.gamma*.9))skip=true;else{d.bk=0;dot=true}}}
  if(d.gapB&&trav<d.gapB&&!done&&!under){skip=true;dot=false;if(!d.gapM&&d.pts){d.gapM=1;d.pts.push(xw,yw,-1)}}/* no ink is laid across the break */
  const jb=d.jn&&!under?Math.max(3,reP*1.5):0;if(!under)d.jn=0;
  /* batch auxiliary mask writes every ~3px of travel (and on done) so 60fps stays silky smooth even with dozens of live drips */
  const stepD=Math.hypot(xw-px0,yw-py0);d.auxA=(d.auxA||0)+stepD;const doAux=done||d.auxA>=3||jb>0;if(doAux)d.auxA=0;
  const ax0=d.alx!==undefined?d.alx:px0,ay0=d.aly!==undefined?d.aly:py0;if(doAux&&!under){d.alx=xw;d.aly=yw}
  if(!under&&!skip){
   if(d.et){if(!d.ewr){d.ewr=1;ewRuns.push(d)}if(!etS)etchAdd(d.ek||1,d.wet)}const targets=[[d.et?need(EMASK).x:baked.x,d.et?'#fff':dcolNow(d,trav,done),d.et?'source-over':d.comp||d.ink.comp,d.et?1:(d.wet?(d.ink===INK.water||d.ink===INK.alcohol||d.ink===INK.flow?inkAlpha(d.ink,s)*(.55+.45*clamp(d.vol/d.v0)):Math.min(.97,d.ink.opacity)):(isOpaqueInk(d.ink)?Math.max(inkAlpha(d.ink,s),Math.min(.97,d.ink.opacity)):inkAlpha(d.ink,s))),px0,py0]];/* opaque paint runs are as solid as the letter they hang from (reference photos), not a see-through grey film */
   if(doAux){targets.push([idm.x,`rgb(${d.id*20},0,0)`,'source-over',1,ax0,ay0]);if(!(d.soft||d.et)){const gW=d.wash?.76:1;if(!d.wash){targets.push([need(RUNL).x,'#fff','source-over',1,ax0,ay0]);runlV++}if(lightOn){const BW=baked.c.width,BH=baked.c.height;if(!GLW||GLW.width!==BW||GLW.height!==BH){GLW=document.createElement('canvas');GLW.width=BW;GLW.height=BH}const gx=GLW.getContext('2d');gx.save();gx.setTransform(dpr,0,0,dpr,0,0);targets.push([gx,'#fff','source-over',gW,ax0,ay0,1]);wgT2=performance.now();GLW.age=0;GLW.fade=1;wgOn2=true;lForce=true;slForce=true}const shK=SHEEN[d.ty]||0;if(shK>0){const sx=satC().getContext('2d');sx.save();sx.setTransform(dpr,0,0,dpr,0,0);targets.push([sx,'#fff','source-over',shK*(d.ink&&d.ink.gloss?1:.85)*gW,ax0,ay0,1]);satOn=true;lForce=true;slForce=true}if(d.ink&&(d.ink.gloss||pen.gloss)){targets.push([needGl().x,'#fff','source-over',gW,ax0,ay0]);glossOn=true;glDirty=true}}targets.push([wetC(d.wk).x,'#fff','source-over',.9,ax0,ay0]);if(d.ink.future)targets.push([need(fjL).x,'#fff','source-over',1,ax0,ay0]);const _prlD=!!(d.props&&d.props.pearl),_mtD=(d.ink&&(d.ink.chrome||d.ink.future||METAL[d.col]))||_prlD;if(_mtD&&!(d.soft||d.et)){targets.push([need(metal).x,'#fff','source-over',d.ink&&d.ink.chrome?1:_prlD?.62:d.ink&&d.ink.future?.2:.85,ax0,ay0]);metalOn=true;shineDirty=true}}
   if(!d.wallHex){const wm=s.mean||[128,128,128];d.wallHex='#'+wm.map(v=>Math.round(v).toString(16).padStart(2,'0')).join('');d.wallLum=lum(wm)}
   for(const [ctx,st,comp,al,sx0,sy0,rst] of targets){if(ctx===fjL.x)fjOn=true;
    let ea=al*(ctx===baked.x&&d.al?d.al:1),fs=st;if(d.ink.chrome&&ctx===baked.x&&typeof fs==='string'&&fs[0]==='#')fs=mixHex(fs,'#7f8fa3',.42);/* a chrome run is finished the same cool, slightly dark way as the letter it hangs from */let tint=false;
    if(ctx===baked.x&&ea<.97&&typeof st==='string'&&st[0]==='#'&&comp==='source-over'){
     const darkDye=d.ink.comp==='multiply'||d.wash;
     if(darkDye){fs=mixHex(st,'#ffffff',1-ea);ea=1;tint=true}
     else{fs=mixHex(st,d.wallHex,1-ea);ea=1}
    }
    if(d.et&&ctx===EMASK.x){etGrow(Math.min(xw,sx0)-re-14,Math.min(yw,sy0)-re-14,Math.max(xw,sx0)+re+14,Math.max(yw,sy0)+re+14);const m=re+3,b=d.eb||(d.eb=[1e9,1e9,-1e9,-1e9]);b[0]=Math.min(b[0],xw-m,sx0-m);b[1]=Math.min(b[1],yw-m,sy0-m);b[2]=Math.max(b[2],xw+m,sx0+m);b[3]=Math.max(b[3],yw+m*1.6,sy0+m)}
    ctx.save();ctx.globalCompositeOperation=tint?'multiply':comp;ctx.globalAlpha=ea;ctx.fillStyle=fs;
    if(dot){ctx.beginPath();ctx.ellipse(xw,yw,reD*1.05,reD*1.35,0,0,TAU);ctx.fill()}
    else if(!tint&&jb===0&&Math.abs(reD-rePD)<.18){ctx.strokeStyle=fs;ctx.lineWidth=((ctx===baked.x||ctx===EWET.x||ctx===EMASK.x)?reD:reD+.3)*2;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(sx0,sy0);ctx.lineTo(xw,yw);ctx.stroke()}
    else{const nx=-d.gy,ny=d.gx,w0=(ctx===baked.x||ctx===EWET.x||ctx===EMASK.x)?rePD:rePD+.3,w1=(ctx===baked.x||ctx===EWET.x||ctx===EMASK.x)?reD:reD+.3;ctx.beginPath();ctx.moveTo(sx0-d.gx*jb+nx*w0,sy0-d.gy*jb+ny*w0);ctx.lineTo(xw+nx*w1,yw+ny*w1);ctx.lineTo(xw-nx*w1,yw-ny*w1);ctx.lineTo(sx0-d.gx*jb-nx*w0,sy0-d.gy*jb-ny*w0);ctx.closePath();ctx.fill();if(!tint){ctx.beginPath();ctx.arc(xw,yw,w1,0,TAU);ctx.fill()}}
    if(pz&&!d.bd&&ctx===baked.x){d.bd=1;ctx.beginPath();ctx.ellipse(xw,yw+re*.15,re*1.06,re*1.18,0,0,TAU);ctx.fill()}
    if(d.bdq&&ctx===baked.x&&!d.wash&&!d.et){const q=d.bdq;d.bdq=null;if(!lmOwn(q.x|0,q.y|0,d.sid)){const br=Math.max(reD*1.15,q.r*.95);ctx.beginPath();ctx.ellipse(q.x,q.y,br,br*1.22,Math.atan2(d.gy,d.gx)-Math.PI/2,0,TAU);ctx.fill();beadLight(ctx,q.x,q.y,br,fs,d,Math.atan2(d.gy,d.gx))}}
    if(ctx===baked.x&&re>1.1&&!d.et&&!d.wash&&typeof fs==='string'&&fs[0]==='#'){const lv=lum(hex(fs));/* subtle 3D side-bevel shading along thick/light paint trails */if(d.thick&&lv>.55&&(d.sn=(d.sn||0)+1)%2===0){/* drawn every other step and the steps overlap, so it builds up: kept faint, or a light run turns grey all over */ctx.globalAlpha=.03;ctx.strokeStyle='#262e3d';ctx.lineWidth=Math.max(.5,re*.26);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(sx0+reP*.62,sy0);ctx.lineTo(xw+re*.62,yw);ctx.stroke()}if(d.thick&&re>1.4){ctx.globalAlpha=Math.min(.07,ea*.07);ctx.strokeStyle='#ffffff';ctx.lineWidth=Math.max(.45,re*.26);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(sx0-reP*.34,sy0);ctx.lineTo(xw-re*.34,yw);ctx.stroke()}/* Rayleigh-Plateau capillary pearl micro-swell along stretching runs */if(trav>18&&vr>.18&&vr<.82&&Math.sin(trav*.22+d.ph)>.965){ctx.globalAlpha=ea;ctx.fillStyle=fs;ctx.beginPath();ctx.ellipse(xw,yw,reD*1.16,reD*1.28,Math.atan2(d.gy,d.gx)-Math.PI/2,0,TAU);ctx.fill()}ctx.globalAlpha=ea}
    if(done&&!d.soft){if(d.wash&&ctx===baked.x&&typeof st==='string'&&st[0]==='#'&&lum(hex(st))<.6)ctx.fillStyle=mixHex(fs,'#000000',.25);const hd=d.thick?1.2:d.et?1.04:d.wet&&!d.al&&d.ink.opacity>.9?1.16:1.12,rb=Math.max(reD,d.r*(d.pin?.8:.62))*(d.sk?1.05+.18*(d.skv||0):1)*endSize(d),/* the dried end is only a little wider than the run and a bit longer than wide (reference photos) */an=Math.atan2(d.gy,d.gx),nxB=-d.gy,nyB=d.gx,bxC=xw+d.gx*rb*.28,byC=yw+d.gy*rb*.28;if(ctx===baked.x&&!d.et&&!d.wash&&rb>1.0){/* soft contact shadow under the resting liquid bulb */ctx.save();ctx.globalAlpha=Math.min(.26,ea*.28);ctx.fillStyle='#0a0c10';ctx.beginPath();ctx.ellipse(bxC+1.1,byC+1.5,rb*hd*1.04,rb*hd*1.42,an-Math.PI/2,0,TAU);ctx.fill();ctx.restore()}if(d.sk&&ctx===baked.x&&typeof ctx.fillStyle==='string'&&ctx.fillStyle[0]==='#')ctx.fillStyle=mixHex(ctx.fillStyle,'#000000',.08);/* smooth teardrop neck tapering into the resting bulb */ctx.beginPath();ctx.moveTo(xw-d.gx*rb*2.5,yw-d.gy*rb*2.5);ctx.quadraticCurveTo(xw-d.gx*rb*.4+nxB*rb*hd*.98,yw-d.gy*rb*.4+nyB*rb*hd*.98,bxC,byC);ctx.quadraticCurveTo(xw-d.gx*rb*.4-nxB*rb*hd*.98,yw-d.gy*rb*.4-nyB*rb*hd*.98,xw-d.gx*rb*2.5,yw-d.gy*rb*2.5);ctx.fill();ctx.beginPath();ctx.ellipse(bxC,byC,rb*hd,rb*hd*1.38,an-Math.PI/2,0,TAU);ctx.fill();if(ctx===baked.x&&!d.et&&!d.wash&&rb>1.05&&typeof fs==='string'&&fs[0]==='#')beadLight(ctx,bxC,byC,rb*hd,fs,d,an);if(false){/* 3D meniscus shading on resting bulb: cool lower-right bevel for light paints + upper-left specular glint */const lv=lum(hex(fs));if(lv>.45){ctx.save();ctx.globalAlpha=.16+.12*lv;ctx.strokeStyle='#222938';ctx.lineWidth=Math.max(.7,rb*.28);ctx.beginPath();ctx.arc(bxC,byC,rb*hd*.84,an-.45,an+1.15);ctx.stroke();ctx.restore()}}}ctx.restore();if(rst)ctx.restore()}}
  if(!under){d.lx=xw;d.ly=yw;d.lre=reD;d.lcol=dcolNow(d,trav,false);d.lvis=1;if(d.pts&&!d.soft&&!d.et&&!d.wash){const pl=d.pts.length;if(!pl||Math.hypot(xw-d.pts[pl-3],yw-d.pts[pl-2])>=3.5)d.pts.push(xw,yw,reD)}}else{d.lx=undefined;d.ly=undefined;d.alx=undefined;d.aly=undefined;d.lvis=0}
  if(!under&&!skip&&d.ink.chrome&&(CHQ[s.id]??.3)>.7){const bx=baked.x;bx.save();bx.fillStyle='rgba(255,255,255,.8)';if(Math.abs(d.gy)>.97){bx.fillRect(xw-d.r*.55,y0,Math.max(.6,d.r*.45),d.y-y0+.3);bx.fillStyle='rgba(40,44,50,.45)';bx.fillRect(xw+d.r*.35,y0,Math.max(.5,d.r*.4),d.y-y0+.3)}bx.restore()}
  if(!under&&doAux){/* a run dries from the top down: each stretch goes wet as the head passes, and a fat, full stretch holds its liquid longer than the thin tail of a spent run */const _cw=(typeof CARRY_WET!=='undefined'&&d.props&&CARRY_WET[d.props.base])||1;markWet(xw,yw,d.r+2,.9,TAUS[d.wk]*(d.wet?2.5:1)*1.3*_cw*(.6+.7*clamp(vr*1.2)+.15*Math.min(2,d.r)));if(d.col&&d.col[0]==='#')markInk(xw,yw,d.r+1,d.id,d.col);stampDripBuff(d,px0,py0,xw,yw,re,s);/* Wet surface: dye blooms organically at random spots along the drip as it crosses wet beads */
if((s.wet||d.wet)&&d.em&&!d.soft&&!d.et&&!d.pigRun&&(DYEINK[d.ty]||(d.bp&&d.bp.ghost>=.42))&&blooms.length<850){ const wfB=typeof wetF==='function'?wetF(xw,yw):.55; d.blmD=(d.blmD||0)+Math.hypot(xw-px0,yw-py0); if(d.blmD>(14+Math.random()*28)&&Math.random()<(.16+wfB*.34)){  d.blmD=0;  const dTint=(d.bp&&d.bp.tint)||((d.ty==='stain'||d.ty==='bleed')&&typeof d.col==='string'&&d.col[0]==='#'&&lum(hex(d.col))<.24?'#5e24c4':d.col);  if(typeof dTint==='string'&&dTint[0]==='#'){   const bCol=washTint(dTint),bRad=Math.max(2.6,re*(2.2+Math.random()*4.2)*(0.7+wfB*.7));   blooms.push({x:xw+(Math.random()-.5)*re*1.8,y:yw,r:bRad,t0:performance.now(),life:1100+Math.random()*1300,col:bCol,ty:d.ty||'stain',next:0,dripped:1,drip:1,al:.036+Math.random()*.028,sx:.65+Math.random()*.55});  } }}}
  const w=WET[d.wk];w.active=true;w.until=Math.max(w.until,performance.now()+TAUS[d.wk]*4500);if(done){if(d.et)etchRunDry(d);if(d.led&&!d.stp&&!d.et&&d.v0>.35&&d.vol<=0&&Math.random()<.8)dropFall(xw,yw+d.r,d.r*(1.1+Math.min(1,d.v0*.4)),typeof d.col==='string'?d.col:null);if(!d.settled){d.settled=1;dripSettle(d,s,xw,yw,Math.max(reD,d.r*(d.pin?.8:.62))*endSize(d),d.thick?1.2:1.12)}if(!d.et&&!d.wash){/* the bulb at the end is the last of the liquid: it stays wet well after the run above has skinned over */const _cw=(typeof CARRY_WET!=='undefined'&&d.props&&CARRY_WET[d.props.base])||1;markWet(xw,yw+d.r*.4,Math.max(3,d.r*2.2),1,TAUS[d.wk]*(d.wet?2.5:1)*3.2*_cw)}drips.splice(i,1)}}
 dirty=true}
const SMOOTH=s=>s.absorb<.05&&s.rough<.05;
/* HAND MIXED: colours lie side by side across the stick face at a fixed angle (how you hold it), drifting a little as the stick twists */
function multiFill(x,y){const M=pen.multi,n=M.length,r=R()*1.02,st=stroke||{};
 /* motion direction (smoothed) */let dx=x-(st.mX??x),dy=y-(st.mY??y);const L=Math.hypot(dx,dy);
 if(L>.3){st.mDx=(st.mDx??dx/L)*.86+dx/L*.14;st.mDy=(st.mDy??dy/L)*.86+dy/L*.14}st.mX=x;st.mY=y;
 let mx=st.mDx??1,my=st.mDy??0;const ml=Math.hypot(mx,my)||1;mx/=ml;my/=ml;const nx=-my,ny=mx;
 /* pie-slice core (how Hand Mixed cores are assembled), twisting slowly with distance */
 const a=(pen.mAng??.7)+(st.mDist||0)*.0012,ux=Math.cos(a),uy=Math.sin(a);
 /* each lateral offset takes the colour of the face's trailing edge there */
 const g=stk.x.createLinearGradient(x-nx*r,y-ny*r,x+nx*r,y+ny*r),K=24;let prev=-1;
 for(let k=0;k<=K;k++){const l=(k/K*2-1)*r,b=Math.sqrt(Math.max(0,r*r-l*l)),px=-mx*b+nx*l,py=-my*b+ny*l,t=(((Math.atan2(py,px)-a)/6.2832)%1+1)%1,ci=Math.min(n-1,Math.floor(t*n));
  if(ci!==prev&&k>0)g.addColorStop(Math.max(0,(k-.5)/K-.001),M[prev]);g.addColorStop(k===0?0:(k-.5)/K,M[ci]);prev=ci}
 g.addColorStop(1,M[prev]);return g}
/* PAINT-STICK DRAG: a solid stick only marks the high points of the wall's tooth. Grain is anchored to the wall
   (the same pits skip every pass), denser when pressing lightly, moving fast or on rough walls, and heaviest at the rim
   so edges break up into ragged crumbs like oil-stick/crayon tags */
let GRN=null;function grainPat(lv){if(!GRN){const N=256,v=new Float32Array(N*N),rnd=()=>Math.random();
  const oct=(cell,amp)=>{const g=N/cell,G=[];for(let i=0;i<g*g;i++)G.push(rnd());for(let y=0;y<N;y++)for(let x=0;x<N;x++){const fx=x/cell,fy=y/cell,x0=fx|0,y0=fy|0,tx=fx-x0,ty=fy-y0,sx=tx*tx*(3-2*tx),sy=ty*ty*(3-2*ty),a=G[(y0%g)*g+x0%g],b=G[(y0%g)*g+(x0+1)%g],c=G[((y0+1)%g)*g+x0%g],d=G[((y0+1)%g)*g+(x0+1)%g];v[y*N+x]+=amp*((a*(1-sx)+b*sx)*(1-sy)+(c*(1-sx)+d*sx)*sy)}};
  oct(32,.35);oct(8,.35);oct(2,.2);for(let i=0;i<N*N;i++)v[i]+=rnd()*.1;
  GRN=[];for(let L=0;L<10;L++){const c=document.createElement('canvas');c.width=c.height=N;const x=c.getContext('2d'),im=x.createImageData(N,N),th=.22+L*.045;
   for(let i=0;i<N*N;i++)im.data[i*4+3]=v[i]<th?255:v[i]<th+.02?120:0;x.putImageData(im,0,0);const p=stk.x.createPattern(c,'repeat');try{p.setTransform(new DOMMatrix().scale(.5))}catch(e){}GRN.push(p)}}
 return GRN[Math.max(0,Math.min(9,Math.round(lv*9)))]}
function stickDrag(x,y,s,fast){const r=pen.w*MM/2*curScale,X=stk.x,op=pen.multi?.45:1,
  d=clamp((.04+(1-pressNow)*.34+fast*.14+s.rough*.6+(s.absorb||0)*.15)*op);
 X.save();X.globalCompositeOperation='destination-out';
 if(d>.05){X.fillStyle=grainPat(d);X.beginPath();X.arc(x,y,r*1.01,0,TAU);X.fill()}
 /* bitten edge: small nicks out of the rim */for(let i=0,k=1+Math.round(d*4);i<k;i++){const a=Math.random()*TAU,q=r*(.97+Math.random()*.08);X.beginPath();X.arc(x+Math.cos(a)*q,y+Math.sin(a)*q,.6+Math.random()*(1+d*2.2),0,TAU);X.fill()}
 X.restore();
 /* stray crumbs knocked off the stick */if(!demo&&Math.random()<.04+d*.1){const a=Math.random()*TAU,q=r*(1.08+Math.random()*.55);X.save();X.fillStyle=pen.multi?pen.multi[(Math.random()*pen.multi.length)|0]:curCol();X.beginPath();X.arc(x+Math.cos(a)*q,y+Math.sin(a)*q,.5+Math.random()*1.2,0,TAU);X.fill();X.restore()}}
/* RE-WETTING: alcohol is the solvent of alcohol dyes (and of the resin in alcohol paint), so fresh alcohol-borne ink
   re-dissolves dry dye where it crosses it — the line drags the old colour along and the nib picks it up and carries
   a fading tint of it out the other side. Oil and water-based paints don't dissolve it; they sit on top (stain inks
   still bleed up through light covers, handled elsewhere). */
/* LAYER: what an ink does when it goes over another, DRY (see the project doc "ink-behaviour-reference").
   The rule: can the top ink's solvent dissolve the binder underneath?  d = dissolves (drags/muddies/picks up the
   old colour), b = the old dye bleeds up into the new film, r = the new ink is repelled (beads and skips).
   Wet underneath is handled separately (WMIX): wet films always mix a bit. */
const FAM=t=>({alcohol:'dye',future:'dye',flow:'dye',stain:'stain',bleed:'stain',alcpaint:'apaint',oil:'oil',fluid:'oil',water:'water',chrome:'chrome',solid:'solid'})[t]||null;
const LAYER={
 dye:   {dye:{d:1},stain:{d:1},apaint:{d:.45},oil:{d:.3},water:{},chrome:{d:.9},solid:{r:.55}},
 stain: {dye:{d:1},stain:{d:1},apaint:{d:.45},oil:{d:.3},water:{},chrome:{d:.9},solid:{r:.55}},
 apaint:{dye:{d:.6,b:.35},stain:{d:.5,b:.75},apaint:{},oil:{d:.45},water:{},chrome:{d:.7},solid:{r:.45}},
 oil:   {dye:{d:.35,b:.3},stain:{d:.35,b:.6},apaint:{d:.32},oil:{d:.58},water:{},chrome:{d:.25},solid:{r:.2}},
 water: {dye:{b:.8},stain:{b:.95},apaint:{},oil:{r:.35},water:{},chrome:{},solid:{r:.6}},
 chrome:{dye:{d:.4},stain:{d:.4},apaint:{d:.2},oil:{d:.15},water:{},chrome:{},solid:{r:.4}},
 solid: {dye:{},stain:{b:.15},apaint:{},oil:{},water:{},chrome:{},solid:{}}};
const layerRule=(top,under)=>{const a=FAM(top),b=FAM(under);return a&&b?(LAYER[a][b]||{}):{}};
/* the bleed-thru ink is made to come up through oil paint */const bleedK=(top,under)=>{let b=layerRule(top,under).b||0;if(under==='bleed'&&FAM(top)==='oil')b=Math.max(b,.95);return b};
/* LIFT HALO: where fresh solvent ink crosses dry dye, the old dye re-dissolves and is carried outward with the solvent
   front, so the old line blurs and feathers into a soft halo just outside the new stroke's edges */
function liftHalo(L,s){if(s.absorb>.7)return;const bx=baked.x;bx.save();for(const q of L){const r0=q.r*1.05,r1=q.r*(1.4+s.absorb*.5),g=bx.createRadialGradient(q.x,q.y,r0,q.x,q.y,r1);const c=hex(q.col),a=(.055*q.a*(1-s.absorb*.4)).toFixed(3);g.addColorStop(0,`rgba(${c[0]},${c[1]},${c[2]},${a})`);g.addColorStop(1,`rgba(${c[0]},${c[1]},${c[2]},0)`);bx.fillStyle=g;bx.beginPath();bx.arc(q.x,q.y,r1,0,TAU);bx.arc(q.x,q.y,r0,0,TAU,true);bx.fill()}bx.restore();dirty=true}
const pickQ=[];/* the dye the nib picked up, laid into the fresh line once it's baked onto the wall */
function layPick(){const L=pickQ.splice(0,600);if(!L.length)return;let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const q of L){x0=Math.min(x0,q.x-q.r);y0=Math.min(y0,q.y-q.r);x1=Math.max(x1,q.x+q.r);y1=Math.max(y1,q.y+q.r)}
 const X=Math.max(0,Math.floor(x0*dpr)),Y=Math.max(0,Math.floor(y0*dpr)),w=Math.min(baked.c.width-X,Math.ceil((x1-x0)*dpr)+2),h=Math.min(baked.c.height-Y,Math.ceil((y1-y0)*dpr)+2);if(w<2||h<2)return;
 const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.setTransform(dpr,0,0,dpr,-X,-Y);
 for(const q of L){x.globalAlpha=q.a;const g=x.createRadialGradient(q.x,q.y,0,q.x,q.y,q.r);g.addColorStop(0,q.col);g.addColorStop(.5,q.col+'99');g.addColorStop(1,q.col+'00');x.fillStyle=g;x.beginPath();x.arc(q.x,q.y,q.r,0,TAU);x.fill()}
 /* only where there's ink: the tint lives in the fresh line, never on bare wall */x.setTransform(1,0,0,1,0,0);x.globalAlpha=1;{const m=document.createElement('canvas');m.width=w;m.height=h;const mx=m.getContext('2d');for(let k=0;k<5;k++)mx.drawImage(idm.c,X,Y,w,h,0,0,w,h);x.globalCompositeOperation='destination-in';x.drawImage(m,0,0);freeC(m)}
 const bx=baked.x;bx.save();bx.setTransform(1,0,0,1,0,0);bx.globalCompositeOperation=L[0].mul?'multiply':'source-over';bx.globalAlpha=L[0].mul?.9:.7;bx.drawImage(c,X,Y);bx.restore();freeC(c);dirty=true}

/* WET ON WET: lay a colour over ink that's still wet and they mix a bit where they meet — the nib drags some of the
   wet colour along and carries a fading tint of it. How much depends on the ink going on: thin dyes and water paint
   mix most, alcohol paint and oil less, chrome and solid sticks hardly at all. */
const WMIX={alcohol:.9,stain:.9,bleed:.9,future:.8,water:.85,flow:.7,alcpaint:.55,oil:.68,fluid:.6,chrome:.15,solid:.1,etch:0};
function rewet(x,y){if(demo||!stroke)return;const km=WMIX[pen.ink]??.5;if(!FAM(pen.ink)&&!km)return;const pv=stroke.rw;stroke.rw={x,y};if(!pv)return;const dd=Math.hypot(x-pv.x,y-pv.y);if(dd<.5)return;stroke.rwA=(stroke.rwA||0)+dd;
 const pk=stroke.pick;if(pk&&pk.a>.015){const q=stroke.pq||(stroke.pq=[]);if(q.length<600)q.push({x,y,r:R()*curScale*1.18,col:pk.col,a:pk.a,mul:INK[pen.ink].comp==='multiply'});pk.a*=Math.exp(-dd/(16+R()*1.5))}
 if(stroke.rwA<3.5)return;stroke.rwA=0;const cc=colG[inkCell(x,y)];if(!cc||cc[0]!=='#'||cc===curCol())return;const wv=wetAt(x,y),ty=inkAt(x,y);
 if(wv>.05){/* still wet/tacky: true wet-on-wet Kubelka-Munk colour mixing across both tags */
  const wEff=clamp((wv-.05)/.55,.22,1),m=Math.max(.35,km)*wEff;
  const blended=typeof kmMix==='function'?kmMix([{c:curCol(),ts:1.0},{c:cc,ts:1.25}]):mixHex(curCol(),cc,.52);
  smearDir(baked,pv,{x,y},.28*m,R()*.92,true);
  const prevA=(pk&&pk.col)?pk.a*.72:0;
  const nextCol=(pk&&pk.col)?mixHex(pk.col,blended,.55):blended;
  stroke.pick={col:nextCol,a:Math.min(.62,prevA+.22*m)};
  return}
 /* dry: the table decides */const L=layerRule(pen.ink,ty);
 if(L.r&&!stroke.s.wet){/* repelled: the new ink pulls back off the old film into beads, leaving skips (punched when the stroke is finished, so later stamps don't fill them) */const q=stroke.rp||(stroke.rp=[]);if(q.length<900)q.push({x,y,r:L.r,rr:R()*curScale})}
 const sol=L.d||0;if(!sol)return;
 smearDir(baked,pv,{x,y},.2*sol,R()*.9,true);if(sol>.55&&!stroke.s.wet){const hq=stroke.hq||(stroke.hq=[]);if(hq.length<500)hq.push({x,y,r:R()*curScale,col:cc,a:sol})}const cap=DYEINK[pen.ink]?.2:pen.ink==='oil'?.26:.1;stroke.pick={col:cc,a:Math.min(cap,(pk&&pk.col===cc?pk.a:0)+(pen.ink==='oil'?.075:.045)*sol)}}

/* RUNNING LOW: as the barrel empties there's less ink in the nib — the film gets thinner, so the wall shows through
   and the line goes lighter (below ~30% left), and there's no surplus to run, so drips die away first (gone by ~12%)
   while the line keeps going, streakier and paler, until it's dry */
/* how much spare ink the nib has to run — anything that makes the line streak (running low, valve not primed, a drying
   tip, an unshaken pen, a wrecked nib) means it's starved, and a starved nib hardly drips at all */
const dripLife=()=>clamp((pen.life-.12)/.33)*(pen.valve?clamp((pen.flow-.45)/.35):1)*clamp(1-((pen.tipDry||0)-.2)*2.2)*(pen.shake?clamp(((pen.mix??1)-.35)/.35):1)*clamp(1-((pen.fray||0)-.5)*1.5);
function lowCol(s){const c=curCol();if(pen.life>=.3||typeof c!=='string'||c[0]!=='#')return c;const k=Math.round(clamp((.3-pen.life)/.3)*.5*20)/20;if(k<=0)return c;
 const tgt=INK[pen.ink].comp==='multiply'?'#ffffff':'#'+s.mean.map(v=>Math.round(v).toString(16).padStart(2,'0')).join('');return mixHex(c,tgt,k)}
