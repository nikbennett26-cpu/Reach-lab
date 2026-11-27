/* ---------- frame loop: dwell bleed, drying sheen ---------- */
let prev=performance.now(),bgTick=0;
let mixT=0,uiDirty=false,uiT=0,fricS=null,fricV=0;let lastSnapAt=0;
/* once the tag is finished (pen off the wall ~1 s), the wet look (sheen and wet patches) dries DRYK x faster — drips keep running in real time; touching the wall again puts it straight back to real time */
const DRYK=4.5;let DRYALL=2.8;/* all inks dry this much quicker than their base times; drips keep running at their own pace */let upT=0;
function frameBody(now){const dt=(now-prev)/1000;prev=now;if(down){upT=now;fastDry=false}else if(!upT)upT=now;const fd=fastDry?6:1,dryDone=(!down&&!drips.length)?2.6:1,dk=(1+(DRYK-1)*clamp((now-upT-500)/500))*fd,ddt=dt*dk*dryDone;if(!down&&wgOn2)glossFade(dk*DRYALL*dryDone);let anyW=false;for(const k in WET)if(WET[k].active&&k!=='etch'){if((dryDone>1||fastDry)&&WET[k].until>now)WET[k].until-=dt*(fastDry?4500:1650);anyW=true}if(fastDry&&!down){const adv=dt*5000;for(const L of bleedL)L.t0-=adv;for(const c of chromes)c.t0-=adv;for(const p of shifts)p.t0-=adv;for(const p of etches)p.t0-=adv;if(etS)etS.e=(etS.e||0)+dt*5;for(const p of spreads)p.t0-=adv;for(const b of blooms)b.t0-=adv}if(!down&&(wgOn2||anyW)&&lightOn&&now-lAt>(LOWGPU?65:42))dirty=true;/* smoothly melt the wet sheen while drying */if(!down&&!drips.length&&now-lastSnapAt>1400&&(etches.length||shifts.length||spreads.length||chromes.length||bleedL.length)){lastSnapAt=now;prepSnap()}if(!down||((++bgTick&1)===0)){runRain(dt);if(fastDry&&!down){for(let _k=0;_k<4;_k++)flowStep(Math.min(dt,.035))}else flowStep(down?dt*2:dt);runSpreads(now);runShifts(now);runEtches(now)}stepTilt(now);
 for(const p of PENS)if(p.shake&&p.mix>.25){const heavy=['alcpaint','oil','water'].includes(p.ink)||!!p.gloss;const rate=heavy?1/210:1/360;p.mix=Math.max(.25,p.mix-dt*(down&&p===pen?rate*.15:rate))};mixT+=dt;if(mixT>.25){mixT=0;showMix()}
 if(down&&tool==='buff'&&last){const idleMs=now-(pad.lt||now);pad.holdT=(pad.holdT||0)+dt;if(idleMs>140){pad.holdSq=clamp((pad.holdSq||0)+dt*1.35,0,1);pad.sqAcc=(pad.sqAcc||0)+dt;if(pad.sqAcc>.19){pad.sqAcc=0;buffAt(last,{x:last.x+(Math.random()-.5)*1.5,y:last.y+(Math.random()-.5)*1.5})}}else{pad.holdSq=Math.max(0,(pad.holdSq||0)-dt*.9);pad.sqAcc=0}}
 if(waterOn){let any=false;const k=dt*(fastDry?6:1)*(bands[0]&&bands[0].s.absorb>.3?.06:.04);for(let i=0;i<water.length;i++)if(water[i]>0){water[i]=Math.max(0,water[i]-k);if(water[i]>0)any=true}
  if(!any)waterOn=false;const im=wctx.createImageData(GW,GH_);for(let i=0;i<water.length;i++){im.data[i*4+1]=8;im.data[i*4+2]=16;im.data[i*4+3]=Math.min(255,water[i]*12)}wctx.putImageData(im,0,0);dirty=true}
 if(mist.length){for(let i=mist.length-1;i>=0;i--)if(now-mist[i].t0>420)mist.splice(i,1);dirty=true}
 if(down&&stroke&&now-lastMove>220&&last){stroke.dwell+=dt;if(tool==='draw'&&!stroke.ink.solid&&!stroke.ink.etch&&!stroke.ink.fluid&&now-(stroke.wbT||0)>90){stroke.wbT=now;wetBleed(last.x,last.y,stroke.dwell)}if(tool==='draw'&&stroke.dwell<3){const f0=flowNow(null);if(f0>.3)flowDeposit(last.x,last.y,0,f0*1.15,surfAt(last.x,last.y),stroke.dwell)}/* BLOB WHEN YOU PAUSE: hold the nib still and ink keeps wicking out of it — the dot grows (fast at first, then slower, like
   a capillary spread ~ sqrt(time)), sags downward on an upright wall, and once it's heavy enough it lets go as a run */
if(tool==='draw'&&!pen.squeeze&&!stroke.ink.solid&&!pen.dauber&&stroke.dwell>.25&&stroke.dwell<4.5){const f=flowNow(null);if(f>.35){const ty=pen.ink,cap=(stroke.ink.fluid?.08:pen.metal?.3:{alcohol:.95,stain:.95,bleed:.95,flow:.9,future:.85,water:.75,alcpaint:.6,oil:.38,chrome:.45,etch:.7}[ty]??.6)*Math.min(1.3,f)*(1-stroke.s.absorb*.6),g=cap*Math.sqrt(Math.min(1,(stroke.dwell-.25)/2.6)),sg=upright?R()*g*.22:0;
  tipScale=1+Math.min(g,.15);stamp(last.x,last.y,0,null);tipScale=1;if(g>.06){if(!stroke.bseed||Math.hypot(last.x-stroke.bx,last.y-stroke.by)>2){stroke.bseed=(Math.random()*1e6)|0;stroke.bx=last.x;stroke.by=last.y}const X=stk.x;X.save();X.fillStyle=inkPat(stroke.s,curCol(),0);X.beginPath();puddlePath(X,last.x,last.y+sg*.5,R()*(1+g),upright?g*.55:0,stroke.bseed,.06+g*.05,0);X.fill();X.restore()}
  if(upright&&flowable()&&!stroke.ink.fluid&&g>.5&&stroke.s.absorb<.6&&(!stroke.bdT||stroke.dwell-stroke.bdT>1.6)){stroke.bdT=stroke.dwell;drip(last.x+(Math.random()-.5)*R()*.4,last.y+sg+R()*(1+g)*.85,.45+g*.9*(stroke.ink.drip??.6))}}}if(pen.valve){stroke.priming=1;stroke.primeAcc=(stroke.primeAcc||0)+dt;if(stroke.primeAcc>(stroke.pumped?.28:.3)){stroke.primeAcc=0;stroke.pumped=1;pump(last)}dirty=true}const s=surfAt(last.x,last.y),ink=stroke.ink,b=ink.bleed*s.absorb;
  if(b>.03&&stroke.dwell<4){bleedAt(last.x,last.y,R()*(1+b*(1.1+stroke.dwell*1.4)),b*.035,s.gx);dirty=true}
  if(ink.future)poolAt(last.x,last.y,R()*1.25,0);if(pen.squeeze&&!pen.dauber&&!stroke.bu&&stroke.dwell>.8&&Math.random()<dt*(.03+clamp(1-pen.life)*.12)){stroke.bu=1;burp(last.x,last.y,s)}if(pen.squeeze&&!demo&&pen.life>0&&stroke.dwell>.12){const lScale=.25+.75*Math.pow(clamp(pen.life),.7);pen.sat=Math.min(1.6,(pen.sat??0)+dt*((.2+.16*clamp(pressNow/.45))+Math.max(0,pressNow-.30)*1.15)*lScale);const nowF=performance.now();if(!pen._sfT||nowF-pen._sfT>60){pen._sfT=nowF;showFlow()}}if(pen.squeeze&&stroke.dwell>.6&&stroke.dwell<2.5){blob(last.x,last.y,R()*(pen.dauber?Math.min(.45,.25+stroke.dwell*.1):ink.fluid?Math.min(.95,.6+stroke.dwell*.25):pen.w>8?.55+stroke.dwell*.35:1+stroke.dwell*1.6),s);if(!ink.fluid&&(!FLOWDRIPS||!flowable())&&Math.random()<dt*ink.drip*(.4+Math.pow(Math.max(0,pressNow-.35)/.65,1.6)*3.4))drip(last.x+(Math.random()-.5)*R(),last.y+R()*.5,.6+stroke.dwell*.5);dirty=true}}
 if(!down)for(const k in WET){const w=WET[k];if(!w.active)continue;w.acc+=ddt*DRYALL;w.until-=(dk*DRYALL-1)*dt*1000;const kk=1-Math.exp(-w.acc/(TAUS[k]*(bands[0]&&bands[0].s.wet?2.5:1)));
  if(kk>(LOWGPU&&drips.length?.1:.035)){w.x.save();w.x.setTransform(1,0,0,1,0,0);w.x.globalCompositeOperation='destination-out';w.x.globalAlpha=kk;w.x.fillRect(0,0,w.c.width,w.c.height);w.x.restore();w.acc=0;dirty=true}
  if(now>w.until){/* the last of the wet sheen fades out over half a second rather than vanishing */w.fo=(w.fo||0)+1;w.x.save();w.x.setTransform(1,0,0,1,0,0);w.x.globalCompositeOperation='destination-out';w.x.globalAlpha=.14;w.x.fillRect(0,0,w.c.width,w.c.height);w.x.restore();dirty=true;if(w.fo>=30){w.fo=0;w.c.width=w.c.height=1;w.active=false}}else w.fo=0}
 if(wgOn){let any=false;for(let i=0;i<wg.length;i++){if(wg[i]>0){wg[i]*=Math.exp(-ddt*DRYALL/wt[i]);if(wg[i]<.02)wg[i]=0;else any=true}}wgOn=any}
 if(uiDirty&&now-uiT>140){uiDirty=false;uiT=now;showFlow()}if(down&&stroke&&fricS)friction(true,fricV,fricS);
 for(let i=bleedL.length-1;i>=0;i--){const L=bleedL[i];if(now-L.t0>=L.dur&&!(L.top&&(now-L.t0<9000||bleedL.some(q=>!q.top)))){const g=baked.x;g.save();g.setTransform(1,0,0,1,0,0);g.globalAlpha=L.a;g.drawImage(L.c,L.x,L.y);g.restore();bleedL.splice(i,1);freeC(L.c)}dirty=true}
 if(pickQ.length&&!stroke&&!down&&!bleedL.some(L=>!L.top&&!L.slow))layPick();if(pigQ.length&&!stroke&&!down){for(const q of pigQ.splice(0,6))thinAbove(q)}if(!down||(bgTick&1)===0){if(fastDry&&!down){const _ds=Math.min(dt,.03);for(let _k=0;_k<5;_k++){runDrips(_ds);wetStep()}runBlooms(now);runBleed(now)}else{runDrips(Math.min(down?dt*2:dt,.05));wetStep();runBlooms(now);runBleed(now)}}if(fastDry&&!down&&!drips.length&&!flowOn&&!wgOn&&!wgOn2&&!anyW&&!bleedL.length&&!chromes.length&&!shifts.length&&!etches.length&&!spreads.length&&!blooms.length&&!wetQ.length&&!waterOn){fastDry=false;prepSnap();dirty=true;toast('Ink set — fully dry')}
 for(const p of PENS){if(p.drain&&!(down&&p===pen))p.drain=Math.max(0,p.drain-dt*900)}for(const p of PENS)if(!p.capped&&!(down&&p===pen)){p.idle=(p.idle||0)+dt;if(p.idle>8){const heavyP=['alcpaint','oil','water','fluid'].includes(p.ink)||!!p.gloss;p.tipDry=Math.min(1,p.tipDry+dt*(p.humect?.35:1)*(heavyP?1.4:1)/(p.metal?450:p.squeeze?65:55))}}if(FLK.length&&(Math.abs(tilt.x-flkTx)>.004||Math.abs(tilt.y-flkTy)>.004))dirty=true;for(let i=chromes.length-1;i>=0;i--){if(now-chromes[i].t0>=chromes[i].dur){finChrome(chromes[i]);chromes.splice(i,1)}dirty=true}if(dirty){compose();dirty=false}}
/* ROTATION CHECK: Android can quietly drop a canvas's drawing surface under memory pressure (no error is raised — the wall
   just stops updating while the buttons carry on). Watch for that, recover it, and after a rotation show a small readout
   of what the wall sees for the next couple of touches so a stuck state can be diagnosed from a screenshot. */
let ctxLost=0,dgN=0,dgT=0;
try{cv.addEventListener('contextlost',()=>{ctxLost++});cv.addEventListener('contextrestored',()=>{dirty=true;try{toast('Android reset the display (low memory) — redrawn')}catch(_){}})}catch(_){}
function lostList(){const L=[];try{for(const [n,o] of [['cv',{x:dctx}],['baked',baked],['idm',idm],['bg',bg],['stk',stk]])if(o.x&&o.x.isContextLost&&o.x.isContextLost())L.push(n)}catch(_){}return L}
function dgArm(){dgN=2;dgT=performance.now();setTimeout(()=>{const L=lostList();if(L.length){try{toast('Display layers lost after rotating: '+L.join(', '))}catch(_){}}},900)}
addEventListener('orientationchange',dgArm);try{screen.orientation&&screen.orientation.addEventListener('change',dgArm)}catch(_){}
/* the animation loop must never die: one bad frame (e.g. a drip caught mid-rotation) used to stop everything — drips froze and the wall
   stopped taking ink while the buttons still worked. Now a failing frame is skipped, and if it keeps failing the stuck drips are cleared */
/* FRAME TIME readout (More > Physics): how long each frame takes to work out, how often frames come, the worst one, and how much
   canvas memory the wall is holding — so slow spots on a real phone can be measured, not guessed */
let perfOn=false,perfEl=null,pfL=0,pfW=[],pfGap=[],pfT=0,pfWorst=0;
function perfToggle(on){perfOn=on;try{localStorage.setItem('rlPerf',on?'1':'0')}catch(_){}if(on&&!perfEl){perfEl=document.createElement('div');perfEl.id='perfHud';perfEl.style.cssText='position:fixed;left:8px;bottom:calc(env(safe-area-inset-bottom,0px) + 96px);z-index:30;background:rgba(0,0,0,.78);color:#8f8;font:11px/1.35 ui-monospace,monospace;padding:6px 8px;border-radius:8px;pointer-events:none;white-space:pre';document.body.appendChild(perfEl)}if(perfEl)perfEl.style.display=on?'block':'none';const b=document.getElementById('perfBtn');if(b){b.textContent='Frame time: '+(on?'on':'off');b.setAttribute('aria-pressed',on)}}
function perfMem(){let px=0;try{for(const c of document.querySelectorAll('canvas'))px+=c.width*c.height;for(const o of [bg,baked,stk,idm,tmp,rimA,rimB,ghost,ghostC,ghostV,grainM,smearC,tmp2,metal,shine,pool,etchL,ovl,fjL,RUNL,EWET])if(o&&o.c&&!o.c.isConnected)px+=o.c.width*o.c.height;for(const k in WET)px+=WET[k].c.width*WET[k].c.height;for(const k in TC)px+=TC[k].c.width*TC[k].c.height}catch(_){}return px*4/1048576}
function perfTick(now,work){if(pfL)pfGap.push(now-pfL);pfL=now;pfW.push(work);pfWorst=Math.max(pfWorst,work);if(now-pfT<500)return;const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0,g=avg(pfGap),w=avg(pfW),slow=pfGap.filter(x=>x>34).length;
 if(perfEl)perfEl.textContent=`${g?Math.round(1000/g):0} fps   frame ${w.toFixed(1)} ms   worst ${pfWorst.toFixed(0)} ms\nslow frames ${slow}/${pfGap.length}   drips ${drips.length}   tool ${tool}\ncanvas memory ≈ ${perfMem().toFixed(0)} MB   wall ${Math.round(W)}×${Math.round(H)} @${dpr.toFixed(2)}`;
 pfT=now;pfW=[];pfGap=[];pfWorst=0}
let frErr=0,frSaid=0;function frame(now){try{const _t0=perfOn?performance.now():0;frameBody(now);frErr=0;if(perfOn)perfTick(now,performance.now()-_t0)}catch(e){frErr++;try{prev=now;console.error('FRAME',e&&e.stack)}catch(_){}
 if(frErr===4){try{drips.length=0;falls.length=0;bleedL.length=0;resetPointerState()}catch(_){}dirty=true}
 if(frErr>12){frErr=0;/* still failing after clearing the runs: rebuild the wall layers at the current size (what's drawn is kept where possible) */try{const w0=W;W=0;H=0;W=w0;H=1;doLayout()}catch(_){}dirty=true}
 if(!frSaid++)try{toast('Recovered from a glitch: '+(e&&e.message||e))}catch(_){}}requestAnimationFrame(frame)}
/* LIGHT & REFLECTIONS (preview): the wall sits in a street. Smooth walls mirror a soft street scene — bright sky and windows,
   dark buildings — which slides as you tilt the phone. Glossy/thick paint and chrome catch the bright parts as sharp highlights.
   A broad light falls from the upper left, so the wall is never lit flat. */
let ENV=null,ENVB=null,LIT=null,litKey='';
function buildEnv(){const w=Math.ceil(W*1.5/2),h=Math.ceil(H*1.3/2),c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');let sd=7;const r=()=>{sd=(sd*16807)%2147483647;return sd/2147483647};
 let g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#cfd8e2');g.addColorStop(.38,'#8e9aa6');g.addColorStop(.55,'#2a2e33');g.addColorStop(1,'#121416');x.fillStyle=g;x.fillRect(0,0,w,h);
 /* no street scene (it read as a blocky pattern on the walls): just open sky over a soft horizon, so paint and chrome still catch smooth highlights */
 /* soft bright window reflection — the big catch-light */g=x.createRadialGradient(w*.22,h*.18,0,w*.22,h*.18,w*.25);g.addColorStop(0,'rgba(255,255,255,.60)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,w,h);
 const b=document.createElement('canvas');b.width=w;b.height=h;const bx2=b.getContext('2d');try{bx2.filter='blur(1.6px)'}catch(e){}bx2.drawImage(c,0,0);ENV=b;
 /* bright-only copy for speculars on paint */const s=document.createElement('canvas');s.width=w;s.height=h;const sx=s.getContext('2d');sx.drawImage(b,0,0);const im=sx.getImageData(0,0,w,h),d=im.data;for(let i=0;i<d.length;i+=4){const l=(d[i]+d[i+1]+d[i+2])/765,row=((i>>2)/w|0)/h,k=Math.max(0,(l-.56)/.44)*(row<.42?.12:1);d[i]=d[i+1]=d[i+2]=255;d[i+3]=255*k*k}sx.putImageData(im,0,0);ENVB=s;freeC(c)}
function buildLit(){const c=document.createElement('canvas');c.width=Math.ceil(W/2);c.height=Math.ceil(H/2);const x=c.getContext('2d'),w=c.width,h=c.height;
 let g=x.createRadialGradient(w*.15,h*.05,0,w*.15,h*.05,Math.hypot(w,h)*1.05);g.addColorStop(0,'rgba(255,250,240,.10)');g.addColorStop(.4,'rgba(255,250,240,0)');g.addColorStop(.62,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.26)');x.fillStyle=g;x.fillRect(0,0,w,h);LIT=c}

let lightOn=(()=>{try{return localStorage.getItem('rlLight')!=='0'}catch(e){return true}})();/* wet gloss lives on the strokes themselves (not on the runs), and fades as each stroke dries */
let GLW=null,wgT2=0,wgOn2=false;/* CURING: fresh ink is wet-glossy; the solvent flashes off fast for alcohol dyes (matte in seconds) but paint takes
   minutes to skin and cure, settling to its own lasting finish — satin/gloss for paint markers, matte for dye inks */
const SHEEN={oil:.82,alcpaint:.88,flow:.92,stain:.78,bleed:.75,alcohol:.65,fluid:.45,water:.25,chrome:0,etch:0,solid:.15},CURE={oil:1.3,alcpaint:1,water:1,fluid:1.2,flow:.9,solid:1};let SAT=null,satOn=false;
function satC(){const BW=baked.c.width,BH=baked.c.height;if(!SAT||SAT.width!==BW||SAT.height!==BH){SAT=document.createElement('canvas');SAT.width=BW;SAT.height=BH;SAT.getContext('2d').setTransform(dpr,0,0,dpr,0,0);satOn=false}return SAT}
function stampFlowSheen(ctx,kBase,pts,rad){/* Build high-contrast, stroke-directional specular texture unique to each stroke */ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalCompositeOperation='copy';ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=Math.min(1,kBase*1.15);ctx.drawImage(stk.c,0,0);if(pts&&pts.length>=4){const P=dpr,sd=Math.random()*99;ctx.setTransform(P,0,0,P,0,0);ctx.lineCap='round';ctx.lineJoin='round';/* carve subtle organic nib-flow grooves out of the sheen so glare breaks up along the letter direction */ctx.globalCompositeOperation='destination-out';ctx.strokeStyle='#000';const nCut=2+((Math.random()*3)|0);for(let r=0;r<nCut;r++){const lat=(Math.random()-.5)*rad*1.15,wCut=Math.max(.6,rad*(.09+Math.random()*.16));ctx.lineWidth=wCut;ctx.globalAlpha=.35+Math.random()*.42;ctx.beginPath();for(let i=2;i<pts.length;i+=2){const ax=pts[i-2],ay=pts[i-1],bx=pts[i],by=pts[i+1],dx=bx-ax,dy=by-ay,l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;const jit=Math.sin(i*.42+sd+r*2.3)*rad*.16,ox=nx*(lat+jit),oy=ny*(lat+jit);if(i===2)ctx.moveTo(ax+ox,ay+oy);ctx.lineTo(bx+ox,by+oy)}ctx.stroke()}/* boost bright flow-following specular ribs inside the stroke */ctx.globalCompositeOperation='source-over';ctx.strokeStyle='#fff';const nRib=2+((Math.random()*2)|0);for(let r=0;r<nRib;r++){const lat=(Math.random()-.5)*rad*1.05,wRib=Math.max(.8,rad*(.14+Math.random()*.22));ctx.lineWidth=wRib;ctx.globalAlpha=Math.min(1,kBase*(.7+Math.random()*.3));ctx.beginPath();for(let i=2;i<pts.length;i+=2){const ax=pts[i-2],ay=pts[i-1],bx=pts[i],by=pts[i+1],dx=bx-ax,dy=by-ay,l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;const jit=Math.cos(i*.38+sd+r*1.9)*rad*.14,ox=nx*(lat+jit),oy=ny*(lat+jit);if(i===2)ctx.moveTo(ax+ox,ay+oy);ctx.lineTo(bx+ox,by+oy)}ctx.stroke()}}ctx.restore()}
function glossAdd(){if(INK[pen.ink]&&INK[pen.ink].etch)return;const pts=stroke&&stroke.pts,rad=R(),kSheen=(SHEEN[pen.ink]||0)*(pen.gloss?1.25:1);if(kSheen>0&&!demo){const c=satC().getContext('2d'),tmpS=document.createElement('canvas');tmpS.width=stk.c.width;tmpS.height=stk.c.height;const tx=tmpS.getContext('2d');stampFlowSheen(tx,Math.min(1,kSheen*(INK[pen.ink].gloss?1:.9)),pts,rad);tx.setTransform(1,0,0,1,0,0);tx.globalCompositeOperation='destination-in';tx.drawImage(stk.c,0,0);c.save();c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation='destination-out';c.drawImage(stk.c,0,0);c.globalCompositeOperation='source-over';c.globalAlpha=1;c.drawImage(tmpS,0,0);c.restore();freeC(tmpS);satOn=true}if(!lightOn)return;const BW=baked.c.width,BH=baked.c.height;if(!GLW||GLW.width!==BW||GLW.height!==BH){GLW=document.createElement('canvas');GLW.width=BW;GLW.height=BH}const g=GLW.getContext('2d'),tmpG=document.createElement('canvas');tmpG.width=BW;tmpG.height=BH;const gx=tmpG.getContext('2d');stampFlowSheen(gx,1,pts,rad);gx.setTransform(1,0,0,1,0,0);gx.globalCompositeOperation='destination-in';gx.drawImage(stk.c,0,0);g.save();g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='destination-out';g.globalAlpha=1;g.drawImage(stk.c,0,0);g.globalCompositeOperation='source-over';g.drawImage(tmpG,0,0);g.restore();freeC(tmpG);wgT2=performance.now();GLW.age=0;GLW.fade=1;GLW.tau=(.9+(TAUS[pen.ink]||1.5)*.7)*(CURE[pen.ink]||1);wgOn2=true;lForce=true;slForce=true}
function wetEnv(w,now){if(!w||!w.active)return 0;const dur=Math.max(400,(w.until||now)-(w.t0||now-1000)),rem=clamp(((w.until||now)-now)/dur,0,1);return rem>=.45?1:sm(rem/.45)}
function glossFade(rate){if(!wgOn2||!GLW)return;const now=performance.now(),dt=(now-wgT2)/1000;if(dt<.016)return;wgT2=now;const r=rate||DRYALL,ddt=dt*r,tau=GLW.tau||((.9+(TAUS[pen.ink]||1.5)*.7)*(CURE[pen.ink]||1)),maxAge=tau*4.2;GLW.age=(GLW.age||0)+ddt;const t=clamp(GLW.age/maxAge,0,1);GLW.fade=Math.exp(-GLW.age/(tau*1.15))*(1-sm(clamp((t-.55)/.45,0,1)));const g=GLW.getContext('2d'),k=1-Math.exp(-ddt/(tau*1.4));if(k>.035){g.globalCompositeOperation='destination-out';g.globalAlpha=Math.min(.5,k);g.fillRect(0,0,GLW.width,GLW.height);g.globalAlpha=1;g.globalCompositeOperation='source-over'}if(GLW.fade<.008||GLW.age>=maxAge){g.clearRect(0,0,GLW.width,GLW.height);GLW.fade=0;wgOn2=false}}
let LCOMB=null,LMASK=null,lAt=0,lTilt=[9,9],lForce=true;
/* one combined light layer at half resolution: wall reflection + catch-lights, added in one draw */
let GLGRAIN=null;
function getGlareGrain(ctx){
 if(!GLGRAIN){
  const s=128,c=document.createElement('canvas');c.width=s;c.height=s;
  const g=c.getContext('2d'),im=g.createImageData(s,s),d=im.data;
  let r=48271;const rnd=()=>(r=(Math.imul(r,16807))>>>0)/4294967296;
  const row=new Float32Array(s);for(let y=0;y<s;y++)row[y]=.84+.32*rnd();
  for(let y=0;y<s;y++)for(let x=0;x<s;x++){
   const i=(y*s+x)*4,n1=rnd(),n2=rnd(),st=row[(y+(x>>3))%s];
   /* high-contrast gritty specular pockets: bright silver peaks (0.85-1.0) next to dark micro-pits (0.18-0.35) */
   let v=(n1*.55+n2*.45)*st;
   v=v<.28?v*.55:v>.54?Math.min(1,.82+(v-.54)*.65):v*1.1;
   const a=Math.round(clamp(v,0,1)*255);
   d[i]=255;d[i+1]=255;d[i+2]=255;d[i+3]=a;
  }
  g.putImageData(im,0,0);
  g.globalCompositeOperation='destination-out';
  for(let k=0;k<28;k++){
   const bx=rnd()*s,by=rnd()*s,br=2+rnd()*7;
   const rg=g.createRadialGradient(bx,by,0,bx,by,br);
   rg.addColorStop(0,`rgba(0,0,0,${(.22+rnd()*.38).toFixed(2)})`);rg.addColorStop(1,'rgba(0,0,0,0)');
   g.fillStyle=rg;g.beginPath();g.arc(bx,by,br,0,TAU);g.fill();
  }
  g.globalCompositeOperation='source-over';GLGRAIN=c;
 }
 return ctx.createPattern(GLGRAIN,'repeat');
}
function paintOverheadGlare(ctx,cw,ch,maskCanvas,strength){
 const tx=clamp((tilt&&tilt.x)||0,-1,1),ty=clamp((tilt&&tilt.y)||0,-1,1);
 const gx=cw*(.50+tx*.82),gy=ch*(.36+ty*.72);
 const rx=cw*.15,ry=ch*.11;
 /* Full cw x ch height-field with tight 1.05px dome blur so thin 1-3px drips keep sharp 3D meniscus normals,
    accelerated by a coarse stride-4 bounding-box pass so blank wall pixels cost almost zero CPU */
 const nw=Math.max(16,cw),nh=Math.max(16,ch);
 if(!paintOverheadGlare._h){paintOverheadGlare._h=document.createElement('canvas');paintOverheadGlare._o=document.createElement('canvas')}
 const hc=paintOverheadGlare._h,oc=paintOverheadGlare._o;
 if(hc.width!==nw||hc.height!==nh){hc.width=nw;hc.height=nh;oc.width=nw;oc.height=nh}
 const hx=hc.getContext('2d',{willReadFrequently:true}),ox2=oc.getContext('2d');
 hx.setTransform(1,0,0,1,0,0);hx.globalCompositeOperation='copy';hx.clearRect(0,0,nw,nh);
 try{hx.filter='blur(1.05px)'}catch(_){}
 hx.drawImage(maskCanvas,0,0,maskCanvas.width,maskCanvas.height,0,0,nw,nh);
 hx.filter='none';
 ox2.setTransform(1,0,0,1,0,0);ox2.clearRect(0,0,nw,nh);
 /* Overhead light direction vector L driven by phone tilt + view vector V=(0,0,1) -> half-vector H */
 let lx=-tx*1.35+.12,ly=-ty*1.35-.42,lz=1.0;
 const lLen=Math.hypot(lx,ly,lz)||1;lx/=lLen;ly/=lLen;lz/=lLen;
 let hxV=lx,hyV=ly,hzV=lz+1.0;const hLen=Math.hypot(hxV,hyV,hzV)||1;hxV/=hLen;hyV/=hLen;hzV/=hLen;
 const invRx=1/Math.max(1,rx*1.1),invRy=1/Math.max(1,ry*1.1);
 try{
  const src=hx.getImageData(0,0,nw,nh).data;
  /* Fast stride-4 bounding box scan to skip blank wall */
  let xMin=nw,yMin=nh,xMax=-1,yMax=-1;
  for(let y=1;y<nh-1;y+=4){
   const row=y*nw;
   for(let x=1;x<nw-1;x+=4){
    if(src[(row+x)*4+3]>=5){if(x<xMin)xMin=x;if(x>xMax)xMax=x;if(y<yMin)yMin=y;if(y>yMax)yMax=y}
   }
  }
  if(xMax>=xMin){
   xMin=Math.max(1,xMin-4);yMin=Math.max(1,yMin-4);
   xMax=Math.min(nw-2,xMax+4);yMax=Math.min(nh-2,yMax+4);
   const bw=xMax-xMin+1,bh=yMax-yMin+1;
   const out=ox2.createImageData(bw,bh),od=out.data;
   const F0=0.04; /* physical dielectric Fresnel reflectance for liquid ink/resin */
   for(let y=yMin;y<=yMax;y++){
    const row=y*nw,oRow=(y-yMin)*bw;
    for(let x=xMin;x<=xMax;x++){
     const idx=(row+x)*4,aC=src[idx+3];
     if(aC<5)continue;
     const dhx=(src[idx+7]-src[idx-1])/255;
     const dhy=(src[idx+nw*4+3]-src[idx-nw*4+3])/255;
     let nx=-dhx*4.2,ny=-dhy*4.2,nz=0.58;
     const nLen=Math.hypot(nx,ny,nz)||1;nx/=nLen;ny/=nLen;nz/=nLen;
     const ndv=clamp(nz,0,1),fres=F0+(1-F0)*Math.pow(1-ndv,5);
     const ndh=Math.max(0,nx*hxV+ny*hyV+nz*hzV);
     const spec=Math.pow(ndh,26);
     const dxL=(x-gx)*invRx,dyL=(y-gy)*invRy,d2=dxL*dxL+dyL*dyL;
     const fall=d2<2.2?Math.exp(-d2*1.45):0;
     const val=clamp((spec*.96+fres*.72)*(0.26+0.96*fall)*strength*Math.min(1,(aC/255)*1.25),0,1);
     if(val>.012){
      const oIdx=(oRow+(x-xMin))*4;
      od[oIdx]=248;od[oIdx+1]=251;od[oIdx+2]=255;od[oIdx+3]=Math.round(val*255);
     }
    }
   }
   ox2.putImageData(out,xMin,yMin);
  }
 }catch(_){}
 ctx.setTransform(1,0,0,1,0,0);ctx.globalCompositeOperation='copy';ctx.clearRect(0,0,cw,ch);
 ctx.imageSmoothingEnabled=true;
 ctx.drawImage(oc,0,0,nw,nh,0,0,cw,ch);
 ctx.globalCompositeOperation='destination-in';
 ctx.fillStyle=getGlareGrain(ctx);ctx.fillRect(0,0,cw,ch);
 ctx.globalCompositeOperation='destination-in';
 ctx.drawImage(maskCanvas,0,0,maskCanvas.width,maskCanvas.height,0,0,cw,ch);
 ctx.globalCompositeOperation='source-over';
}
function lightLayers(){const P=dpr,sc=.5,cw=Math.ceil(W*P*sc),ch=Math.ceil(H*P*sc);if(!LCOMB||LCOMB.width!==cw||LCOMB.height!==ch){LCOMB=document.createElement('canvas');LCOMB.width=cw;LCOMB.height=ch;LMASK=document.createElement('canvas');LMASK.width=cw;LMASK.height=ch}
 const x=LCOMB.getContext('2d'),m=LMASK.getContext('2d'),nowL=performance.now(),gFade=(wgOn2&&GLW)?(GLW.fade??1):0;
 m.setTransform(1,0,0,1,0,0);m.globalCompositeOperation='copy';m.clearRect(0,0,cw,ch);m.globalCompositeOperation='source-over';
 let maxS=0;
 if(satOn&&SAT){m.globalAlpha=1;m.drawImage(SAT,0,0,SAT.width,SAT.height,0,0,cw,ch);maxS=Math.max(maxS,1)}
 if(gFade>.005){m.globalAlpha=gFade;m.drawImage(GLW,0,0,GLW.width,GLW.height,0,0,cw,ch);maxS=Math.max(maxS,gFade)}
 for(const k in WET){const wk=WET[k];if(k==='etch')continue;if(wk.active){const env=wetEnv(wk,nowL);if(env>.005){m.globalAlpha=.85*env;m.drawImage(wk.c,0,0,wk.c.width,wk.c.height,0,0,cw,ch);maxS=Math.max(maxS,env)}}}
 m.globalAlpha=1;
 if(maxS>.005){paintOverheadGlare(x,cw,ch,LMASK,Math.min(1,.95*maxS))}
 else{x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,cw,ch)}
 x.globalCompositeOperation='source-over'}
function drawLight(x){if(!W||!lightOn)return;const k=W+'x'+H;if(litKey!==k){litKey=k;freeC(ENV);freeC(ENVB);freeC(LIT);ENV=ENVB=LIT=null;lForce=true;slForce=true}if(!ENV)buildEnv();if(!LIT)buildLit();
 const now=performance.now(),tv=[tilt.x||0,tilt.y||0],moved=Math.abs(tv[0]-lTilt[0])+Math.abs(tv[1]-lTilt[1])>.01,busy=wgOn2||Object.values(WET).some(w=>w.active);
 /* never rebuild mid-stroke (keeps drawing smooth); while ink dries, refresh smoothly so wet sheen melts away */const lInt=(moved||busy)?(LOWGPU?50:33):(LOWGPU?220:140);if(!down&&(lForce||(now-lAt>lInt&&(moved||busy)))){lightLayers();lAt=now;lTilt=tv;lForce=false}
 const P=dpr;x.save();x.imageSmoothingEnabled=true;x.globalCompositeOperation='screen';x.drawImage(LCOMB,0,0,W*P,H*P);x.restore()}
