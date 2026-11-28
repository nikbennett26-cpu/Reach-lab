function stamp(x,y,spd,e){if(stroke){stroke.pk=Math.max(stroke.pk||0,pressNow);if(!stroke.p0t)stroke.p0t=performance.now()}if(stroke&&stroke.air&&performance.now()<stroke.air&&Math.random()<.65)return;if(!demo&&pen.props&&pen.props.clog>0&&Math.random()<pen.props.clog*.32){if(!stamp._clogT++){toast('Thick/incompatible mix is clogging the nib — thin it out or shake hard')}return}if(!demo&&pen.props&&pen.props.curdle>0&&Math.random()<pen.props.curdle*.26){if(Math.random()<.35)sputter(x,y,R()*.65);return}if(pen.multi&&stroke)stroke.mDist=(stroke.mDist||0)+1;const s=surfAt(x,y),ink=INK[pen.ink];
 /* a new paint stick is shaped to a bullet point: thin line at first, wearing to a flat circle the full stick width */
 const f=flowNow(e),starve=clamp((.55-f)*1.8+pen.tipDry*.95+(ink.solid?s.rough*1.2:0)+(pen.metal||ink.solid||pen.squeeze?0:Math.pow(clamp(spd/3),2)*.25*clamp((1.05-f)/.4))),fast=clamp(spd/3);/* a fast stroke outruns the nib's flow: thinner and a little starved */
 curScale=tipScale*(pen.metal||ink.solid||pen.squeeze?1:1-clamp(spd/3)*.08)*(pen.adjust?.9+clamp(f-.5,0,.8)*.22:1)*(pen.ink==='alcohol'&&!pen.squeeze?1-fast*.12:1)*(pen.dauber?.38+pressNow*.55:!pen.metal?.85+pressNow*.43:1)*(spd<.12&&f>.7&&s.absorb<.3&&!pen.metal?1.05:1)*(1+(pen.mush||0)*.35)*(ink.solid?.42+.58*Math.sqrt(pen.sw||0):1)*(pen.ink==='fluid'||(pen.metal&&pen.squeeze)?(stroke?(stroke.fw=(stroke.fw||1.15)*.94+(1.32-.72*clamp(((stroke.v||0)*.7+Math.min(spd,3)*.3-.06)/.9))*.06):1.15):1);
 if(!demo&&!pen.metal&&!ink.solid&&pressNow>.72){const m0=pen.mush||0;pen.mush=Math.min(1,m0+(pressNow-.72)*.0011*(1+s.rough));if(m0<.3&&pen.mush>=.3&&!saidMush++)toast('Pressing hard has mushed the nib down — lines stay fatter now')}
 if(!demo&&pen.squeeze&&!pen.dauber&&pressNow>.9&&!stroke.sunk&&performance.now()-downT>250){stroke.sunk=performance.now();blob(x,y,R()*1.7,s);if(!saidSunk++)toast('Pressed too hard — the nib sank into the body: a blot, then it starves')}
 let t=pen.ink==='fluid'?Math.round(clamp((spd-1.8)*.15)*4)/4:leanNow*(pen.metal?.05:.2)+s.rough*(pen.ruff?.3:1)*(starve*.42+leanNow*.3)/* Ruff Stuff grips rough walls */+(pen.ink==='alcohol'?s.rough*Math.min(spd/2,1)*.08:0);
 const q=SMOOTH(s)||(pen.tip==='bullet'&&!pen.metal&&f>=.98)?0:Math.min(.95,Math.round(t*12)/12);
 if(starve>.35)stroke.low=1;
 const b=(ink.bleed+(pen.props&&pen.props.bleedAdd?pen.props.bleedAdd:0))*s.absorb+(pen.ink==='alcohol'?s.wick||0:0)+(pen.props&&pen.props.bleedAdd>.15?pen.props.bleedAdd*.18:0)+(s.wet?(1-ink.wrep)*.5:0);if(b>.03&&(stroke.n++%2===0))s.wet?bleedAt(x,y+R()*.45,R()*(1+b*1.3),b*.045,1,1.7):bleedAt(x,y,R()*(1+b*1.1),b*.05,s.gx);
 if(!FLOWDRIPS&&pen.adjust&&!demo&&f>.8&&Math.random()<.022*Math.pow(pen.vs/5,2)*(1.15-fast)*(1-s.absorb))drip(x+(Math.random()-.5)*R()*.9,y+R()*.3,.6+Math.random()*.9*(pen.vs/5));
 if(s.wet&&!demo){stroke.wp=stroke.wp||[];if(!stroke.lw||Math.hypot(x-stroke.lw.x,y-stroke.lw.y)>4){stroke.lw={x,y};if(stroke.wp.length<500)stroke.wp.push({x,y})}}
 if(false&&s.wet&&!demo&&Math.random()<.018*ink.run)drip(x+(Math.random()-.5)*R()*1.4,y+R()*.42,.25+Math.random()*Math.random()*1.3);
 /* smooth walls take a solid film: a flat colour fill is far cheaper on the GPU than a texture pattern */const lc=lowCol(s);stk.x.fillStyle=pen.multi?multiFill(x,y):SMOOTH(s)?lc:inkPat(s,lc,q);tipPath(0,x,y);if(!demo&&DYEINK[pen.ink]&&!pen.multi){/* fast flicks thin out to bright translucent dye; slow turns & overlaps pool deep */const vThin=clamp((spd-.45)/2.4),isDkInk=typeof lc==='string'&&lc[0]==='#'&&lum(hex(lc))<.22,dA=isDkInk?clamp(1-vThin*.14,.86,1):clamp(1-vThin*(.36-.12*clamp(f-.8,0,.6)),.56,1);stk.x.globalAlpha=dA;stk.x.fill();stk.x.globalAlpha=1;}else{stk.x.fill()}if(!demo&&pen.squeeze&&!ink.solid){const ov=Math.max(0,f-1),low=clamp((.18-(pen.life??1))/.18);if(f>1.08&&Math.random()<ov*.025)sputter(x,y,R()*curScale)}if(!demo)markTipSM(x,y);if(ink.solid&&pen.tip!=='chisel')stickDrag(x,y,s,fast);flowDeposit(x,y,spd,f,s);loadDeposit(x,y,spd,f);rewet(x,y);
 if(!demo&&DYEINK[pen.ink]){const n=stroke.sn=(stroke.sn||0)+1,ck=((x/5)|0)*4099+((y/5)|0),cm=stroke.cm||(stroke.cm=new Map()),gap=R()*2.6/Math.max(.6,pen.w*MM*.28)+10,o=cm.get(ck);if(o===undefined)cm.set(ck,n);else if(n-o>gap){tipCtx=ovl.x;ovl.x.fillStyle=inkPat(s,curCol(),q);tipPath(0,x,y);ovl.x.fill();tipCtx=null;stroke.ov=1}}if(stroke.ink.future)poolAt(x,y,R(),stroke.v);
 if(!FLOWDRIPS&&!demo&&(pen.valve||pen.squeeze)&&!FLOWDRIPS&&pressNow>.62&&f>.75&&Math.random()<.03*(pressNow-.55)*ink.drip*(1-s.absorb))drip(x+(Math.random()-.5)*R()*.8,y+R()*.35,.5+pressNow*.7);/* super-juiced nib (flow over ~95%): excess ink sheds as drips along the line, more the wetter it is */if(!FLOWDRIPS&&!demo&&!ink.solid&&pen.ink!=='fluid'&&f>.95&&Math.random()<(f-.9)*.2*(ink.drip||.6)*(1-s.absorb)*(pen.w>8?1.3:1))drip(x+(Math.random()-.5)*R()*.9,y+R()*.4,.5+(f-.9)*2.2+Math.random()*.6);if(!stroke.lp||Math.abs(x-stroke.lp.x)+Math.abs(y-stroke.lp.y)>3){stroke.lp={x,y};(stroke.pts=stroke.pts||[]).push(x,y);/* how hard and slow the nib was pressed here — where the sag will happen */(stroke.pw=stroke.pw||[]).push(clamp((pressNow-.56)/.36)*(1/(1+Math.min(3,spd||0)*1.1))+(stroke.dwell>.40?.72:0))}{const r=R()*3+6;stroke.x0=Math.min(stroke.x0,x-r);stroke.y0=Math.min(stroke.y0,y-r);stroke.x1=Math.max(stroke.x1,x+r);stroke.y1=Math.max(stroke.y1,y+r)}
 /* thick squeeze paint barely drips on a normal squeeze — it only lets go once you've pressed well past what the line needs */
 if(!FLOWDRIPS&&pen.squeeze&&pen.ink!=='fluid'&&f>.85&&!FLOWDRIPS&&!demo&&Math.random()<.012*ink.drip*(1-s.absorb)*Math.pow(clamp((pressNow-.4)/.55),1.6)*2.6)drip(x,y+R()*.4,.4+Math.random()*.6)}
/* AIR IN THE BOTTLE: squeeze markers suck air back in when you let go. Next squeeze, the trapped bubble reaches the nib
   first and the pen 'burps' — a spit of paint with a spray of droplets round it. More likely after a pause, and the emptier
   the bottle (more air inside) */
let lastUpT=0,saidBurp=0;
/* HARD TAP: slam the nib into the wall and the ink bursts — a ragged splat with a crown of spikes, a spray of droplets
   thrown out all round (stretched along their flight, smaller the further they go) and runs from the heavy middle.
   Juicier pens and fatter nibs burst bigger. */
function splatBurst(x,y,s,k){const X=stk.x,r=R()*(1+.45*k)*(pen.squeeze?1.15:1)*(.65+.4*clamp(flowNow(null))),col=curCol();if(stroke){const e=r*(4.2+2.8*k)+4;stroke.x0=Math.min(stroke.x0,x-e);stroke.y0=Math.min(stroke.y0,y-e);stroke.x1=Math.max(stroke.x1,x+e);stroke.y1=Math.max(stroke.y1,y+e)}X.save();X.fillStyle=inkPat(s,col,0);
 X.beginPath();puddlePath(X,x,y,r,upright?.2:0,(Math.random()*1e6)|0,.2,.18);X.fill();
 const ns=4+Math.round(Math.random()*4*(1+k));for(let i=0;i<ns;i++){const a=Math.random()*TAU,ca=Math.cos(a),sa=Math.sin(a),l0=r*.85,l1=r*(1.25+Math.random()*.9*(1+k)),wd=Math.max(.4,r*(.035+Math.random()*.045));X.beginPath();X.moveTo(x+ca*l0-sa*wd*1.6,y+sa*l0+ca*wd*1.6);X.quadraticCurveTo(x+ca*(l1-wd*2),y+sa*(l1-wd*2),x+ca*l1,y+sa*l1);X.quadraticCurveTo(x+ca*(l1-wd*2),y+sa*(l1-wd*2),x+ca*l0+sa*wd*1.6,y+sa*l0-ca*wd*1.6);X.fill();X.beginPath();X.arc(x+ca*l1,y+sa*l1,wd*1.3,0,TAU);X.fill()}
 const nd=Math.round((14+Math.random()*20)*(.6+k));X.beginPath();for(let i=0;i<nd;i++){const a=Math.random()*TAU,d=r*(1.15+Math.pow(Math.random(),.8)*(2+1.6*k)),h=Math.max(.3,r*(.025+Math.random()*Math.random()*.075)*(1.4-d/(r*6))),el=1+Math.min(1.6,d/r*.28),cx=x+Math.cos(a)*d,cy=y+Math.sin(a)*d;X.moveTo(cx+Math.cos(a)*h*el,cy+Math.sin(a)*h*el);X.ellipse(cx,cy,h*el,h/Math.sqrt(el),a,0,TAU)}X.fill();X.restore();
 if(upright&&flowable()&&s.absorb<.6){const n=1+Math.round(Math.random()*2+k*2);for(let i=0;i<n;i++)drip(x+(Math.random()-.5)*r*1.2,y+r*.8,.5+Math.random()*.8+k*.6)}
 if(!splatBurst.said++)toast('Splat — a hard tap bursts the ink');dirty=true}
splatBurst.said=0;
function burp(x,y,s){const pr=clamp(pressNow||.5),r=R()*(.75+pr*.6),X=stk.x;/* squeeze harder and the bubble blows out a bigger splat and more spray */X.save();X.fillStyle=inkPat(s,curCol(),0);X.beginPath();puddlePath(X,x,y,r*(1.2+Math.random()*.7),upright?.25:0,(Math.random()*1e6)|0,.16,.22);X.fill();if(stroke)stroke.air=performance.now()+110+Math.random()*120;/* air through the nib: the line sputters for a moment after */
 const n=Math.round((5+Math.random()*10)*(.6+pr*.8)),G=gDir(),bx=G.x*.35,by=G.y*.35,a0=Math.random()*TAU,gs=()=>(Math.random()+Math.random()+Math.random()-1.5)*1.1;X.beginPath();
 /* the bubble bursts one way: the spray fans out in a cone, not all round */for(let i=0;i<n;i++){const a=a0+gs(),d=r*(1.3+Math.pow(Math.random(),.7)*2.6),cx=x+Math.cos(a)*d+bx*d*.3,cy=y+Math.sin(a)*d+by*d*.3,h=Math.max(.35,r*(.05+Math.random()*Math.random()*.2)),el=1+Math.min(1.6,d/r*.35);/* flying droplets stretch along their flight */X.moveTo(cx+Math.cos(a)*h*el,cy+Math.sin(a)*h*el);X.ellipse(cx,cy,h*el,h/Math.sqrt(el),a,0,TAU)}
 X.fill();/* the odd streaky spit flung further out along the burst */for(let i=0,ns=Math.random()<.5?1:Math.random()<.5?2:0;i<ns;i++){const a=a0+gs()*.6,d0=r*1.5,d1=r*(2+Math.random()*1.1),w=Math.max(.4,r*.1),ca=Math.cos(a),sa=Math.sin(a),nx=-sa,ny=ca;/* a tapered tear-drop spit, fat end outward */X.beginPath();X.moveTo(x+ca*d0,y+sa*d0);X.quadraticCurveTo(x+ca*(d1-w*2)+nx*w*1.4,y+sa*(d1-w*2)+ny*w*1.4,x+ca*d1,y+sa*d1);X.quadraticCurveTo(x+ca*(d1-w*2)-nx*w*1.4,y+sa*(d1-w*2)-ny*w*1.4,x+ca*d0,y+sa*d0);X.fill();X.beginPath();X.arc(x+ca*d1,y+sa*d1,w*1.3,0,TAU);X.fill()}
 X.restore();if(upright&&flowable()&&s.absorb<.6&&Math.random()<.6)drip(x,y+r*1.1,.6+Math.random()*.6);if(!saidBurp++)toast('Air in the bottle — it burped. Squeeze out the air to stop it spitting');dirty=true}
/* NEARLY EMPTY SQUEEZER: air and ink come out in turns — the line breaks into dashes with dry gaps, and it spits */
function sputterCut(){if(!stroke||!pen.squeeze||pen.dauber||pen.life>=.22||demo)return;const P=stroke.pts||[];if(P.length<8)return;const k=clamp((.22-pen.life)/.17),r=R()*1.1,x=stk.x;x.save();x.setTransform(dpr,0,0,dpr,0,0);x.globalCompositeOperation='destination-out';x.lineCap='round';x.lineWidth=r*2.3;x.strokeStyle='rgba(0,0,0,.7)';x.filter='blur(1.5px)';let off=0,bx=[];
 for(let i=2;i<P.length;i+=2){const dx=P[i]-P[i-2],dy=P[i+1]-P[i-1],dd=Math.hypot(dx,dy);if(off>0){const t=Math.min(1,off/Math.max(.01,dd));x.beginPath();x.moveTo(P[i-2],P[i-1]);x.lineTo(P[i-2]+dx*t,P[i-1]+dy*t);x.stroke();off-=dd;if(off<=0&&Math.random()<.12)bx.push(P[i],P[i+1])}else if(Math.random()<dd*.016*k){off=2+Math.random()*12*k;const t=Math.random();x.beginPath();x.moveTo(P[i-2]+dx*t,P[i-1]+dy*t);x.lineTo(P[i],P[i+1]);x.stroke();off-=dd*(1-t)}}
 x.restore();for(let i=0;i<bx.length;i+=2)burp(bx[i],bx[i+1],stroke.s)}
function begin(p,e){if(tool==='draw'&&pad.dampT&&performance.now()-pad.dampT<30000&&waterAt(p.x,p.y)>.15)buffSay('damp','Still damp from the buff — fresh ink feathers and runs');ageDrop();/* SITTING NIB: between strokes the ink keeps feeding the felt; after a long pause the first touch blots */{const idle=(performance.now()-(lastUpT||performance.now()))/1000;if(lastUpT&&idle>7&&!pen.squeeze&&!pen.metal&&!pen.capped&&!INK[pen.ink].solid&&!INK[pen.ink].etch&&(pen.valve?pen.flow>.8:true)&&tiltFeed()>.9)setTimeout(()=>{if(stroke)blob(p.x,p.y,R()*(1.15+Math.min(.9,(idle-7)/25)),stroke.s)},0)}leanSen=0;leanNow=leanSet;lmSeq=(lmSeq>=65000?1:lmSeq+1);stroke={dirt0:pen.dirtAmt||0,dirtCol0:pen.dirtCol,sid:lmSeq,p0:{x:p.x,y:p.y},x0:1e9,y0:1e9,x1:-1e9,y1:-1e9,ink:INK[pen.ink],n:0,s:surfAt(p.x,p.y),dwell:0,bead:0,low:0,gaps:[...Array.from({length:Math.max(3,Math.min(pen.dauber?18:16,Math.round(R()/(pen.dauber?5:2.2))))},()=>({o:Math.random()*2-1,w:.5+Math.random()*1.4,s:.4+Math.random()*.6}))]};downT=performance.now();lastMove=downT;
 saidSolv=0;if(pen.capped){pen.capped=false;renderCap()}pen.idle=0;if(pen.tipDry>.25)toast(pen.tipDry>.7?'Left uncapped — the tip has dried out. Keep drawing to wet it again':'The tip has started to dry — the first strokes come out scratchy');
 if(pen.valve&&pen.flow>1.1){blob(p.x,p.y,R()*(1.2+(pen.flow-1.1)*5),stroke.s);toast('Over-primed — the valve dumped a blob');pen.flow=1;showFlow()}
 if(pen.squeeze&&!demo&&(pen.sat??0)<.14&&!pen._saidPrime0){pen._saidPrime0=1;toast('Squeeze is at 0% — tap the wall or drag Squeeze % to prime the nib')}
 stamp(p.x,p.y,0,e);stroke.vx=stroke.vy=stroke.v=0;
 /* FIRM LANDING: judged ~90 ms after touchdown, when the finger's contact patch has grown — see landPulse */{const S0=stroke;S0.pPeak=Math.max(S0.pPeak||0,pressNow);S0.tDown=(e&&e.timeStamp)||performance.now();setTimeout(()=>{if(stroke===S0)landPulse(S0)},160)}
 /* Nib landing contact spike: initial touchdown deposits a brief meniscus pulse into fh */
 if(!demo&&upright&&flowable()){const _fL=flowNow(e),_jL=pen.valve?pen.flow:pen.squeeze?(pen.sat??0):0,_jK=clamp((_jL-.88)/.12,0,1);if(_fL>.35)flowDeposit(p.x,p.y,.03,_fL*(1.14+.34*_jK),stroke.s,.24+.22*_jK)}
 /* correction-fluid pens lay a thick dollop wherever the tip first presses down — the rounded "blob start" seen in real correction-pen tags */
 if(pen.ink==='fluid'&&!demo)blob(p.x,p.y,R()*(1.15+Math.random()*.25),stroke.s);
 if(pen.squeeze&&!pen.dauber&&!demo&&!INK[pen.ink].solid&&(pen.sat||0)>1.05){const ch=Math.min(.09,((pen.sat??0)-1.05)*.16);if(lastUpT&&Math.random()<ch)burp(p.x,p.y,stroke.s)}
 dirty=true}
function feed(p,ev){const S=stroke;if(!S.sp){S.sp={x:p.x,y:p.y,t:p.t};S.q0=S.q1=S.cp=S.sp;return}
 S.sp={x:p.x,y:p.y,t:p.t};const q0=S.q0,q1=S.q1,q2=S.sp,m1={x:(q0.x+q1.x)/2,y:(q0.y+q1.y)/2},m2={x:(q1.x+q2.x)/2,y:(q1.y+q2.y)/2};
 const L=Math.hypot(q1.x-m1.x,q1.y-m1.y)+Math.hypot(m2.x-q1.x,m2.y-q1.y);if(L<.4){S.q0=q1;S.q1=q2;return}const n=Math.max(1,Math.ceil(L/2.5)),dt=Math.max(4,q2.t-q1.t);let prev=S.cp;
 for(let i=1;i<=n;i++){const t=i/n,A=(1-t)*(1-t),B=2*(1-t)*t,Cc=t*t,pt={x:A*m1.x+B*q1.x+Cc*m2.x,y:A*m1.y+B*q1.y+Cc*m2.y,t:q1.t+dt*t};seg(prev,pt,ev,dt/n);prev=pt}
 S.cp=prev;S.q0=q1;S.q1=q2}
function feedEnd(){const S=stroke;if(!S||!S.sp||!S.cp)return;const e={x:S.sp.x,y:S.sp.y,t:S.sp.t};if(Math.hypot(e.x-S.cp.x,e.y-S.cp.y)>.3)seg(S.cp,e,null,8);last={x:e.x,y:e.y,t:e.t}}
function streaks(a,b,sv){if(!stroke||!stroke.gaps)return;if(pen.tip==='bullet'&&!pen.metal&&flowNow(null)>=.98)return;/* a bullet nib at full flow is saturated end to end: solid, no streaks */const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d<.3)return;const nx=-dy/d,ny=dx/d;let hw;
 if(pen.tip==='chisel'){const an=angle*Math.PI/180,w=pen.w*MM*curScale/2,t=pen.th*MM/2,ux=Math.cos(an),uy=Math.sin(an);hw=Math.abs(w*(nx*ux+ny*uy))+Math.abs(t*(-nx*uy+ny*ux))}else hw=pen.w*MM/2*curScale;
 const rail=(pen.metal||pen.dauber||INK[pen.ink].solid||pen.w<4)?0:clamp((.3-pen.life)/.3*1.1+(pen.valve?(.42-pen.flow)*1.8:0)+(pen.squeeze?clamp((.72-(pen.sat??0))/.45)*1.15:0)+(pen.props&&pen.props.curdle?pen.props.curdle*.75:0)+(pen.tipDry>.4?(pen.tipDry-.4):0));
 (stroke.sq=stroke.sq||[]).push({a,b,nx,ny,hw,sv,rail});flushStreaks(b,false)}
function flushStreaks(cur,all){if(!stroke||!stroke.sq)return;const depth=(pen.tip==='chisel'?Math.max(pen.w,pen.th):pen.w)*MM*.6+2,x=stk.x;
 while(stroke.sq.length&&(all||Math.hypot(stroke.sq[0].b.x-cur.x,stroke.sq[0].b.y-cur.y)>depth)){const q=stroke.sq.shift();
  if(q.sv<.15){for(const g of stroke.gaps)g.lx=undefined;continue}
  /* streaks wander, swell and fade along the stroke like real starved/unshaken ink; erased at full strength
     with round caps so overlapping pieces never double up into a hatch pattern */
  x.save();x.globalCompositeOperation='destination-out';x.lineCap='round';x.lineJoin='round';x.globalAlpha=1;
  const sl=Math.hypot(q.b.x-q.a.x,q.b.y-q.a.y);
  for(const g of stroke.gaps){if(g.ph===undefined){g.ph=Math.random()*6.283;g.f1=1/(18+Math.random()*30);g.f2=1/(30+Math.random()*50);g.dist=0}g.dist+=sl;
   const o=clamp(g.o+.22*Math.sin(g.dist*g.f1+g.ph),-1,1)*q.hw*.7,/* kept off the very edge so a streak never reads as an outline */ex=q.b.x+q.nx*o,ey=q.b.y+q.ny*o,sx=g.lx===undefined?q.a.x+q.nx*o:g.lx,sy=g.lx===undefined?q.a.y+q.ny*o:g.ly;g.lx=ex;g.ly=ey;
   const fade=Math.max(0,Math.sin(g.dist*g.f2+g.ph*1.7)*.6+.4),w=g.w*(.25+q.sv*1.3)*g.s*fade;if(w<.35)continue;
   x.lineWidth=Math.min(q.hw*.5,w);x.beginPath();x.moveTo(sx,sy);x.lineTo(ex,ey);x.stroke()}
  if(q.rail>.04){const S=stroke;x.globalAlpha=clamp(q.rail*1.1);x.lineWidth=q.hw*2*(.35+.45*q.rail);x.lineCap='round';x.beginPath();x.moveTo(S.rlx===undefined?q.a.x:S.rlx,S.rlx===undefined?q.a.y:S.rly);x.lineTo(q.b.x,q.b.y);x.stroke();S.rlx=q.b.x;S.rly=q.b.y}else stroke.rlx=undefined;
  x.restore()}}
function seg(a,b,e,dt){const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d<.01)return;if(!demo&&INK[pen.ink].solid)pen.sw=Math.min(1,(pen.sw||0)+d*.00009*(.35+pressNow)*(1+surfAt(b.x,b.y).rough*2));
 const step=pen.tip==='chisel'?Math.max(.9,pen.th*MM*.11):Math.max(.6,INK[pen.ink].solid?pen.w*MM*.1*(.42+.58*Math.sqrt(pen.sw||0)):pen.w*MM*(pen.dauber?.18:pen.w>12?.12:.28)),spd=d/Math.max(dt,1);
 const ivx=dx/Math.max(dt,1),ivy=dy/Math.max(dt,1);stroke.vx=.6*stroke.vx+.4*ivx;stroke.vy=.6*stroke.vy+.4*ivy;stroke.v=Math.hypot(stroke.vx,stroke.vy);
 if(!demo){const sf=surfAt(b.x,b.y);fricS=sf;fricV=fricV*.7+spd*.3;
  if(sf.id==='stairs'){const _smS=TS*.5/dpr,rk=Math.floor(b.x/_smS)+','+Math.floor(b.y/_smS);if(stroke.ridge!==undefined&&rk!==stroke.ridge){tick();try{navigator.vibrate&&navigator.vibrate(4)}catch(_){}}stroke.ridge=rk}
  stroke.wd=(stroke.wd||0)+d;if(stroke.wd>6){stroke.wd=0;const w=wetAt(b.x,b.y);
   if(w>.25&&stroke.n>6){const sol=['alcohol','alcpaint','flow','chrome','fluid','oil'].includes(pen.ink);smear(baked,a,b,w*(sol?.5:.32),R()*1.1);if(sol){restoreBg(b,w*.05,R()*.8);if(!saidSolv++)toast('The solvent is lifting the wet ink underneath')}}
   const wc=colG[inkCell(b.x,b.y)],ownDye=!!CAST(pen.ink,color);if(w>.12&&wc&&wc[0]==='#'&&!(ownDye&&stroke&&stroke.s&&stroke.s.wet)){const d0=hex(wc),C=hex(color),dist=Math.abs(d0[0]-C[0])+Math.abs(d0[1]-C[1])+Math.abs(d0[2]-C[2]);
    if(dist>90&&!sameHue(d0,C)){const hx='#'+[d0[0],d0[1],d0[2]].map(v=>Math.min(255,Math.round(v/24)*24).toString(16).padStart(2,'0')).join('');pen.dirtCol=pen.dirtAmt>.05?mixHex(pen.dirtCol,hx,.3):hx;const a0=pen.dirtAmt||0;pen.dirtAmt=Math.min(carrier()==='alcohol'?.25:.55,a0+w*(carrier()==='alcohol'?.04:.08));
     if(a0<.2&&pen.dirtAmt>=.2)toast('The nib picked up wet colour — it runs clean as you keep drawing')}}}
  if(pen.dirtAmt>0)pen.dirtAmt=Math.max(0,pen.dirtAmt-d*.0012);pen.idle=0;if(pen.tipDry>0)pen.tipDry=Math.max(0,pen.tipDry-d*.0035);
  if(pen.tip==='chisel'&&!pen.metal){const r0=pen.round||0;pen.round=Math.min(1,r0+d*(1+surfAt(b.x,b.y).rough*2)/(pen.ink==='oil'&&pen.valve?7000:40000));if(r0<.4&&pen.round>=.4)toast((pen.ink==='oil'&&pen.valve?'The nib is wearing — rounder and fatter now. ':'')+'The chisel corners are rounding off — thick-to-thin is fading')}}
 if(!demo){const ux=dx/d,uy=dy/d;if(stroke.pdx!==undefined&&ux*stroke.pdx+uy*stroke.pdy<-.25&&stroke.n>4)stroke.rev=30;stroke.pdx=stroke.pdx===undefined?ux:stroke.pdx*.7+ux*.3;stroke.pdy=stroke.pdy===undefined?uy:stroke.pdy*.7+uy*.3;
  if(stroke.rev>0&&!stroke.ink.solid){stroke.rev-=d;const w=wetAt(b.x,b.y);if(w>.15){smear(baked,a,b,.55*w,R()*1.2);if(!saidRev++)toast('Going back over wet ink drags it along')}}}
 stroke.acc=(stroke.acc||0)+d;let k=0;
 while(stroke.acc>=step){stroke.acc-=step;k+=step;const t=Math.min(1,k/d);stamp(a.x+dx*t,a.y+dy*t,spd,e)}
 {const f=flowNow(e),s2=surfAt(b.x,b.y),ik=INK[pen.ink],fs=clamp(spd/3);/* streaks only when the pen genuinely needs it: under-shaken (<65% mixed), starved of ink, running dry or a dried tip — never from speed */
 pen.drain=(pen.drain||0)+d;if(pen.squeeze&&!demo){const sCur=pen.sat??0,wK=Math.max(.55,Math.min(1.8,Math.pow(pen.w/10,.65))),dr=d*(sCur>1?.00007:.00012)*wK+(sCur>1.02?d*.001*(sCur-1.02):0);/* slow, steady use below 100%; a flooded bottle (over 100%) gives up its excess quickly over the first few marks */let sNext=Math.max(0,sCur-dr);/* pressing harder on the screen squeezes the bottle and pushes Squeeze % back up */if(pressNow>.32&&pen.life>0&&sNext<1.3){const pk=Math.pow(clamp((pressNow-.32)/.6),1.05),room=sNext<1.05?1:clamp((1.3-sNext)/.25);sNext=Math.min(1.3,sNext+d*(sNext<1.05?.0026:.0016)*pk*room*lifeF())}/* squeezing as you draw pushes it up: quickly to about full, then more slowly towards 130%. Going higher than that takes juicing the bottle again */pen.sat=sNext;const nowF=performance.now();if(!pen._sfT||nowF-pen._sfT>60){pen._sfT=nowF;showFlow()}}
 /* the nib drains as you draw and refills while it's off the wall: about one and a half tags of non-stop
    drawing before it starts to starve. Felt starves a little sooner; low ink starves much sooner */
 const L0=(DYEINK[pen.ink]?4200:pen.dauber?5000:pen.valve?5600:pen.squeeze?6000:4800)*(.3+Math.min(1,pen.life)*.7),runS=clamp((pen.drain-L0)/(L0*.6))*.28*(pen.valve?clamp((.7-f)/.4):1),/* a primed valve keeps pumping paint into the nib: no drain streaks at full flow */
  wornS=pen.metal?0:clamp(pen.fray-.3)*.75*(pen.tip==='chisel'?1:.5);/* a round bullet wears evenly: far less streaking than a chisel's corners */
 const nibWear=pen.metal?0:Math.max(pen.fray||0,(pen.round||0)*.75,(pen.mush||0)*.65),unmix=(pen.shake?clamp(.72-pen.mix)*1.65:0)+runS+wornS+nibWear*.45,dryT=clamp(pen.tipDry-.25)*1.25,low=pen.life<.35?(.35-pen.life)*1.6:0;
 {/* a squeezed body pushes paint into the nib the whole time: it lays one solid block, it can't starve — only a
   slight bead-streak on glass, where paint pulls back off the very smooth face */const sqF=pen.squeeze?clamp((1.02-(pen.sat??0))/.32):1,gl=pen.squeeze&&!ik.fluid&&!ik.chrome&&(s2.id==='glass'||s2.id==='bus'||s2.id==='mirror')?.075:0;
 streaks(a,b,gl+sqF*(pen.dauber?clamp(.45-pen.life)*1.4+clamp(.4-f)*1.4+dryT+unmix:ik.fluid?dryT+unmix+low:clamp((.32-f)*2.4)+(pen.metal?0:clamp(leanNow-.25)*.6)+(ik.solid?s2.rough*1.5:0)+dryT+unmix+low)+(1-sqF)*(dryT+unmix))}}
 if(!demo){const s=surfAt(b.x,b.y),use=d*Math.sqrt(R()/6)*(.5+s.absorb*1.4)*(1+s.rough*.5);
  if(pen.valve){pen.flow=Math.max(0,pen.flow-use*.0004);{/* the valve only tops the tip up slowly while you write: flow runs down and you pump to bring it back */const tg=(pen.adjust?.4+pen.vs*.13:.6)+(pressNow-.35)*.4;if(pen.flow<tg)pen.flow+=(tg-pen.flow)*Math.min(1,d*.003)*lifeF();else if(pen.adjust&&pen.flow>tg)pen.flow=Math.max(tg,pen.flow-d*.002)}}
  const L0=pen.life;pen.life=Math.max(0,pen.life-use/(7500*(pen.cap||10)));if(L0>.15&&pen.life<=.15)toast('Running low — the barrel is nearly empty');if(L0>0&&pen.life===0)toast('Empty. Time for a new pen');
  if(!pen.metal){const F0=pen.fray;pen.fray=Math.min(1,pen.fray+d*s.rough*s.rough*Math.min(spd,3)/2600+d*(1+Math.min(spd,3)*.25)*(DYEINK[pen.ink]?6e-6:pen.dauber?2.5e-6:pen.squeeze?3e-6:4e-6)*(1+pressNow*.6));if(F0<.3&&pen.fray>=.3)toast('The tip is starting to fray');if(F0<.7&&pen.fray>=.7)toast('Tip badly frayed — lines go ragged')}}
 dirty=true}
const chromes=[],CHQ={glass:1,plastic:.95,wplastic:.95};
function makeChrome(s){const pad=4,x0=Math.max(0,Math.floor((stroke.x0-pad)*dpr)),y0=Math.max(0,Math.floor((stroke.y0-pad)*dpr)),x1=Math.min(stk.c.width,Math.ceil((stroke.x1+pad)*dpr)),y1=Math.min(stk.c.height,Math.ceil((stroke.y1+pad)*dpr)),w=x1-x0,h=y1-y0;if(w<2||h<2)return;
 const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.drawImage(stk.c,x0,y0,w,h,0,0,w,h);
 x.globalCompositeOperation='source-in';const gw=baked.c.width,gh=baked.c.height,shX=(tilt&&tilt.x?clamp(tilt.x,-.6,.6):grav.live?clamp(grav.x,-.5,.5):0)*gw*.12,shY=(tilt&&tilt.y?clamp(tilt.y,-.6,.6):grav.live?clamp(grav.y-1,-.5,.5):0)*gh*.14,g=x.createLinearGradient(-x0+shX,-y0+shY,gw*.14-x0+shX,gh-y0+shY);[[0,'#f3f7fa'],[.22,'#d5dde5'],[.42,'#9fa8b2'],[.485,'#f7f9fb'],[.515,'#3c424a'],[.58,'#555d66'],[.74,'#9aa2ab'],[.88,'#e3e8ed'],[1,'#7c838b']].forEach(([o,k])=>g.addColorStop(o,k));x.fillStyle=g;x.fillRect(0,0,w,h);
 const t=document.createElement('canvas');t.width=w;t.height=h;const tx=t.getContext('2d'),d=Math.max(2,Math.round(2*dpr));
 const layer=(fill,al,mask)=>{x.globalCompositeOperation='source-atop';x.globalAlpha=al;try{x.filter=`blur(${dpr}px)`}catch(_){}x.drawImage(t,0,0);x.filter='none';x.globalAlpha=1};
 const inv=(dx,dy,col)=>{tx.globalCompositeOperation='source-over';tx.clearRect(0,0,w,h);tx.fillStyle=col;tx.fillRect(0,0,w,h);tx.globalCompositeOperation='destination-out';tx.drawImage(stk.c,x0,y0,w,h,dx,dy,w,h)};
 inv(-d,-d,'#000');layer(0,.45);inv(d,d,'#fff');layer(0,.75);
 let wetUnder=0;{const P=stroke.pts||[];let n=0,w=0;for(let i=0;i<P.length;i+=2){n++;const t=inkAt(P[i],P[i+1]);if(t&&t!=='chrome'&&wetAt(P[i],P[i+1])>.3)w++}wetUnder=n?w/n:0}/* chrome over wet ink can't align: dull where it crossed */
 const q=(CHQ[s.id]??.3)*(pen.shake?.25+.75*pen.mix:1)*(s.wet?.35:1)*(1-.65*wetUnder);
 x.globalCompositeOperation='source-atop';x.globalAlpha=(1-q)*.88;x.fillStyle='#8e9398';x.fillRect(0,0,w,h);x.globalAlpha=1;
 tx.globalCompositeOperation='source-over';tx.clearRect(0,0,w,h);tx.drawImage(idm.c,x0,y0,w,h,0,0,w,h);tx.globalCompositeOperation='source-in';tx.fillStyle='#8a8f95';tx.fillRect(0,0,w,h);
 x.globalCompositeOperation='source-atop';x.globalAlpha=pen.ink==='chrome'||pen.fill==='mcp'?.22:.85;/* thick mercury gel levels over what's under it and stays mirror-bright */x.drawImage(t,0,0);
 /* MERCURY TEXTURE (Grog MCP, from reference clips): a thick gel that stands proud — a bright rolled edge just inside
    both sides of the line with a dark lip outside it, a frosty grey film where it's laid thin, lumpy edge, small air
    bubbles caught in it, and the edge of a stroke underneath still showing as a ridge where it's crossed */
 if(pen.ink==='chrome'||pen.fill==='mcp'){try{const A=x.getImageData(0,0,w,h),ad=A.data,sk=document.createElement('canvas');sk.width=w;sk.height=h;const sx=sk.getContext('2d');sx.drawImage(stk.c,x0,y0,w,h,0,0,w,h);
   const bl=document.createElement('canvas');bl.width=w;bl.height=h;const bx=bl.getContext('2d');try{bx.filter=`blur(${2.4*dpr}px)`}catch(_){}bx.drawImage(sk,0,0);bx.filter='none';
   const S=sx.getImageData(0,0,w,h).data,B=bx.getImageData(0,0,w,h).data,old=(()=>{try{return idm.x.getImageData(x0,y0,w,h).data}catch(_){return null}})(),G=gDir();
   let sd=(x0*73856093^y0*19349663)>>>0;const rnd=()=>(sd=(Math.imul(sd,1664525)+1013904223)>>>0)/4294967296;const nz=new Float32Array(Math.ceil(w/8+2)*Math.ceil(h/8+2)).map(()=>rnd()),nw=Math.ceil(w/8+2),N=(i,j)=>{const fx=i/8,fy=j/8,ix=fx|0,iy=fy|0,tx=fx-ix,ty=fy-iy;return nz[iy*nw+ix]*(1-tx)*(1-ty)+nz[iy*nw+ix+1]*tx*(1-ty)+nz[(iy+1)*nw+ix]*(1-tx)*ty+nz[(iy+1)*nw+ix+1]*tx*ty};
   for(let j=0;j<h;j++)for(let i=0;i<w;i++){const k=(j*w+i)*4,a=S[k+3]/255;if(a<.05)continue;const b=B[k+3]/255,edge=Math.max(0,Math.min(1,(.92-b)/.4)),n=N(i,j);
    /* thin film: frosty, a little see-through */const thin=Math.max(0,.55-n)*.5*(1-edge);let r=ad[k],g=ad[k+1],bb=ad[k+2];r+= (176-r)*thin;g+=(184-g)*thin;bb+=(192-bb)*thin;ad[k+3]=Math.round(ad[k+3]*(1-thin*.35));
    /* rolled edge: bright just inside, a dark lip right at the rim (lit from the upper left) */const lit=.55+.45*Math.sign((i-w/2)*-0.3+(j-h/2)*-0.7+1e-6)*Math.min(1,edge*1.5);if(edge>.05){const hi=edge*(1-edge)*4;r+=(255-r)*hi*.55*lit;g+=(255-g)*hi*.55*lit;bb+=(255-bb)*hi*.55*lit;if(edge>.75){const dk=(edge-.75)*2.2;r*=1-dk*.45;g*=1-dk*.45;bb*=1-dk*.4}}
    /* ridge where it crosses dry ink from an earlier stroke */if(old&&old[k+3]>40&&edge<.3){const ob=old[k+3]/255;r+=(240-r)*.08*ob;g+=(244-g)*.08*ob;bb+=(248-bb)*.08*ob}
    ad[k]=r;ad[k+1]=g;ad[k+2]=bb}
   x.putImageData(A,0,0);
   /* air bubbles: a dark ring with a pinpoint highlight, more where the gel is thick */const nb=Math.round(w*h/(dpr*dpr)/900);x.globalCompositeOperation='source-atop';for(let n=0;n<nb;n++){const i=rnd()*w|0,j=rnd()*h|0,k=(j*w+i)*4;if(S[k+3]<200||B[k+3]<215)continue;const rr=(.5+rnd()*rnd()*1.8)*dpr;
    x.globalAlpha=.55;x.strokeStyle='rgba(60,66,74,.9)';x.lineWidth=Math.max(.6,rr*.45);x.beginPath();x.arc(i,j,rr,0,TAU);x.stroke();x.fillStyle='rgba(255,255,255,.95)';x.beginPath();x.arc(i-rr*.35,j-rr*.35,Math.max(.5,rr*.35),0,TAU);x.fill()}x.globalAlpha=1;x.globalCompositeOperation='source-over';freeC(sk);freeC(bl)}catch(_){}}
 chromes.push({c,x:x0,y:y0,w,h,t0:performance.now(),dur:TAUS.chrome*3000,q});if(chromes.length>24){/* too many curing at once: hurry the oldest along, but still as a fade */const o=chromes[0],nw=performance.now();o.dur=Math.min(o.dur,Math.max(0,nw-o.t0)+1200)}
 if(q<.5)toast(s.wet?'Water on the surface breaks the chrome — it stays dull':s.absorb>.3||s.rough>.3?'Texture is breaking the pigment alignment — dull silver':'Not enough shaking — the chrome will stay dull')}
/* GLASS SHADOW: paint sits on the front of a clear pane, so light coming through throws a faint, soft copy of the
   tag onto what's behind — offset down and away from the light, never on top of paint */
function glassShadow(s){if(INK[pen.ink]&&INK[pen.ink].etch&&ETCHABLE[s.id])return;if(demo||!stroke||!(s.id==='bus'||s.id==='stairs'))return;const st=s.id==='stairs',P=dpr,o=st?{x:1.4,y:5.2}:{x:2.6,y:3.6},pad=10,x0=Math.max(0,Math.floor((stroke.x0-pad)*P)),y0=Math.max(0,Math.floor((stroke.y0-pad)*P)),x1=Math.min(stk.c.width,Math.ceil((stroke.x1+pad+o.x)*P)),y1=Math.min(stk.c.height,Math.ceil((stroke.y1+pad+o.y)*P)),w=x1-x0,h=y1-y0;if(w<2||h<2)return;
 const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');try{x.filter=`blur(${2.2*P}px)`}catch(_){}x.drawImage(stk.c,x0,y0,w,h,o.x*P,o.y*P,w,h);x.filter='none';
 x.globalCompositeOperation='source-in';x.fillStyle='#000';x.fillRect(0,0,w,h);x.globalCompositeOperation='destination-out';x.drawImage(stk.c,x0,y0,w,h,0,0,w,h);x.drawImage(idm.c,x0,y0,w,h,0,0,w,h);
 const b=baked.x;b.save();b.setTransform(1,0,0,1,0,0);b.globalAlpha=(INK[pen.ink].chrome?.13:.1)*(st?1.9:1);b.drawImage(c,x0,y0);b.restore();freeC(c)}
function finChrome(p){const b=baked.x;b.save();b.setTransform(1,0,0,1,0,0);b.drawImage(p.c,p.x,p.y);b.restore();freeC(p.c)}
function ruinChrome(pt){const X=pt.x*dpr,Y=pt.y*dpr;for(let i=chromes.length-1;i>=0;i--){const p=chromes[i];if(X>=p.x&&X<p.x+p.w&&Y>=p.y&&Y<p.y+p.h){chromes.splice(i,1);toast('Touched before it dried — the mirror is ruined')}}}
/* The stroke-end passes only change the area around the letter just finished, so they are clipped to its box.
   Full-screen passes were what made lifting the pen hitch. */
function sBox(){const P=dpr,p=R()*3+14,X=Math.max(0,Math.floor((stroke.x0-p)*P)),Y=Math.max(0,Math.floor((stroke.y0-p)*P));return [X,Y,Math.ceil((stroke.x1+p)*P)-X,Math.ceil((stroke.y1+p*1.6)*P)-Y]}
function sClip(c){if(!stroke||!isFinite(stroke.x0)||!isFinite(stroke.x1))return;const b=sBox();c.beginPath();c.rect(b[0],b[1],b[2],b[3]);c.clip()}
/* WET DYE INTO WET DYE: a see-through ink drawn over a line that is still wet doesn't sit on top as a second film (that is what
   makes dried crossings darker). Its solvent opens up the wet ink and the two run together, so the crossing only darkens a
   little. The stroke is baked with its density cut back where it lies over still-wet ink, in proportion to how wet that is. */
function sameHue(a,b){/* the same colour, just lighter or darker (your own runs and pools): picking it up doesn't change the nib's colour */const hs=c=>{const r=c[0]/255,g=c[1]/255,bb=c[2]/255,mx=Math.max(r,g,bb),mn=Math.min(r,g,bb),d=mx-mn;if(d<.06)return [0,0];let h=mx===r?((g-bb)/d)%6:mx===g?(bb-r)/d+2:(r-g)/d+4;return [(h*60+360)%360,d/(mx||1)]};const A=hs(a),B=hs(b);if(A[1]<.12&&B[1]<.12)return true;if(A[1]<.12||B[1]<.12)return false;const dh=Math.abs(A[0]-B[0]);return Math.min(dh,360-dh)<28}
/* what the ink is carried in: decides how long it stays wet and what happens when you cross it wet.
   Alcohol flashes off in seconds and re-dissolves; oil stays open for ages and really mixes; water paint is in between. */
function carrier(){const p=pen.props;if(p&&p.base)return p.base;const m=/homemade: (\w+) base/.exec(pen.inkLabel||'');if(m)return m[1];return pen.ink==='oil'?'oil':pen.ink==='water'?'water':pen.ink==='fluid'?'solvent':'alcohol'}
const CARRY_WET={oil:4,water:1.6,paint:1.6,alcohol:1,solvent:1.4};
/* how wet the ink already on the wall is, as a soft mask over a box (device px): from the wet grid, only where there is ink */
function wetMaskC(X,Y,w,h,k){const P=dpr,m=document.createElement('canvas');m.width=w;m.height=h;const mx=m.getContext('2d');let any=false;
 const gx0=Math.max(0,Math.floor(X/P/C)),gy0=Math.max(0,Math.floor(Y/P/C)),gx1=Math.min(GW-1,Math.ceil((X+w)/P/C)),gy1=Math.min(GH_-1,Math.ceil((Y+h)/P/C));
 for(let gy=gy0;gy<=gy1;gy++)for(let gx=gx0;gx<=gx1;gx++){const i=gy*GW+gx,wv=wg[i]||0;if(!inkG[i]||wv<.03)continue;any=true;mx.fillStyle=`rgba(0,0,0,${(k*clamp(wv/.16)).toFixed(3)})`;mx.fillRect(gx*C*P-X,gy*C*P-Y,C*P+1,C*P+1)}
 if(!any){freeC(m);return null}const o=document.createElement('canvas');o.width=w;o.height=h;const ox=o.getContext('2d');try{ox.filter=`blur(${(C*P*.6).toFixed(1)}px)`}catch(_){}ox.drawImage(m,0,0);freeC(m);return o}
function wetSoak(){if(demo||!stroke||!DYEINK[pen.ink]||carrier()==='alcohol')return null;/* alcohol dye stacks even wet: the crossing shows both dyes */const b=sBox(),X=b[0],Y=b[1],w=Math.min(b[2],stk.c.width-X),h=Math.min(b[3],stk.c.height-Y);if(w<4||h<4)return null;
 const m=wetMaskC(X,Y,w,h,.62);if(!m)return null;
 const o=document.createElement('canvas');o.width=w;o.height=h;const ox=o.getContext('2d');ox.drawImage(stk.c,X,Y,w,h,0,0,w,h);ox.globalCompositeOperation='destination-out';ox.drawImage(m,0,0);freeC(m);
 return {c:o,x:X,y:Y}}
/* WET-ON-WET MERGE: where a fresh stroke crosses a line that is still wet, the two don't stack like dried layers. The nib picks up
   the wet ink underneath and drags it a little way along the new stroke, so the crossing becomes a mix of both colours with
   streaks of the old colour pulled through it. Paint drags in visible streaks; dye just blends into the other dye. The colour
   underneath is read from the ink grid before this stroke is recorded, and the wetness from the wet grid. */
function wetMerge(s){if(demo||!stroke)return;const ink=INK[pen.ink];if(!ink||ink.etch||ink.chrome||ink.solid||pen.multi||s.absorb>.55)return;
 const P0=stroke.pts||[],r=R(),newC=curCol();if(P0.length<6||typeof newC!=='string'||newC[0]!=='#')return;
 const hits=[];let lastI=-1;
 for(let k=2;k<P0.length-2;k+=2){const x=P0[k],y=P0[k+1],gx=Math.floor(x/C),gy=Math.floor(y/C);if(gx<0||gy<0||gx>=GW||gy>=GH_)continue;const i=gy*GW+gx;if(i===lastI)continue;lastI=i;
  /* the wet grid dries fast once the pen is up, so anything still above a few % is visibly wet */const w=clamp((wg[i]||0)/.16),oc=colG[i];if(w<.2||!inkG[i]||typeof oc!=='string'||oc[0]!=='#'||oc===newC)continue;
  const dx=P0[k+2]-P0[k-2],dy=P0[k+3]-P0[k-1],dl=Math.hypot(dx,dy)||1;hits.push({x,y,oc,w,ux:dx/dl,uy:dy/dl})}
 if(!hits.length)return;
 const P=dpr,b=sBox(),X=b[0],Y=b[1],W=Math.min(b[2],stk.c.width-X),H=Math.min(b[3],stk.c.height-Y);if(W<4||H<4)return;
 const snap=document.createElement('canvas');snap.width=W;snap.height=H;snap.getContext('2d').drawImage(stk.c,X,Y,W,H,0,0,W,H);const snapRaw=document.createElement('canvas');snapRaw.width=W;snapRaw.height=H;snapRaw.getContext('2d').drawImage(snap,0,0);
 const car=carrier(),paint=!DYEINK[pen.ink],oily=car==='oil',drag=paint||oily,alc=car==='alcohol'&&!paint,st=stroke;
 /* alcohol re-dissolving wet dye pushes it aside: a slightly lighter, frilly fringe round the crossing, on the old line */
 let idS=null;if(alc){idS=document.createElement('canvas');idS.width=W;idS.height=H;idS.getContext('2d').drawImage(idm.c,X,Y,W,H,0,0,W,H)}
 const wall=(s.mean?'#'+s.mean.map(v=>Math.round(v).toString(16).padStart(2,'0')).join(''):'#ffffff');
 liftJob(()=>{const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');x.setTransform(P,0,0,P,-X,-Y);x.lineCap='round';
  for(const h of hits){const mix=kmMix([{c:h.oc,ts:1},{c:newC,ts:1}]),len=r*(drag?(oily?2.2+3*h.w:1.6+2.4*h.w):.9+.8*h.w);
   /* the blended body of the crossing */
   x.globalAlpha=(drag?.5:.22)*h.w;x.fillStyle=mix;x.beginPath();x.arc(h.x,h.y,r*.95,0,TAU);x.fill();
   /* streaks of the wet ink underneath, dragged along the direction the nib was travelling */
   const n=drag?(oily?4:3)+Math.round(Math.random()*3):2;
   for(let j=0;j<n;j++){const off=(Math.random()-.5)*r*1.5,px=-h.uy*off,py=h.ux*off,l=len*(.45+Math.random()*.7);
    x.globalAlpha=(drag?.55:.22)*h.w*(.5+Math.random()*.5);x.strokeStyle=Math.random()<.55?h.oc:mix;x.lineWidth=Math.max(.6,r*(drag?.12+Math.random()*.22:.3));
    x.beginPath();x.moveTo(h.x+px-h.ux*r*.4,h.y+py-h.uy*r*.4);x.lineTo(h.x+px+h.ux*l,h.y+py+h.uy*l);x.stroke()}}
  x.setTransform(1,0,0,1,0,0);x.globalAlpha=1;
  /* soften, then keep it inside the new stroke */
  const o=document.createElement('canvas');o.width=W;o.height=H;const ox=o.getContext('2d');try{ox.filter=`blur(${((drag?.5:1.1)*P).toFixed(1)}px)`}catch(_){}ox.drawImage(c,0,0);ox.filter='none';ox.globalCompositeOperation='destination-in';ox.drawImage(snap,0,0);
  freeC(c);freeC(snap);bleedL.push({sid:st,c:o,x:X,y:Y,t0:performance.now(),dur:drag?260:700,a:1});
  if(idS){/* the lifted fringe: a ring just outside the new stroke, only on the old wet line */const f=document.createElement('canvas');f.width=W;f.height=H;const fx=f.getContext('2d');fx.setTransform(P,0,0,P,-X,-Y);fx.strokeStyle=wall;for(const h of hits){fx.globalAlpha=.3*h.w;fx.lineWidth=r*.45;fx.beginPath();for(let a=0;a<=TAU+.01;a+=TAU/14){const rr=r*(1.18+Math.random()*.18),px=h.x+Math.cos(a)*rr,py=h.y+Math.sin(a)*rr;a?fx.lineTo(px,py):fx.moveTo(px,py)}fx.stroke()}fx.setTransform(1,0,0,1,0,0);fx.globalAlpha=1;try{fx.filter=`blur(${(.8*P).toFixed(1)}px)`}catch(_){}fx.globalCompositeOperation='destination-in';fx.drawImage(idS,0,0);fx.filter='none';fx.globalCompositeOperation='destination-out';fx.drawImage(snapRaw,0,0);freeC(idS);freeC(snapRaw);bleedL.push({sid:st,c:f,x:X,y:Y,t0:performance.now(),dur:500,a:1})}else freeC(snapRaw)});
}
function rimEdge(ink,s){/* an etch tag is one even frost — and opaque paint merges seamlessly with no overlap rim */if(INK[pen.ink]&&INK[pen.ink].etch&&ETCHABLE[s.id])return;if(ink.chrome||isOpaqueInk(ink))return;if(DYEINK[pen.ink]&&stroke&&stroke.sagF)return;if(pen.ink==='solid'||pen.multi)return;if(s.absorb>.3)return;const d=Math.max(1,Math.round(1.4*dpr));
 for(const o of [rimA,rimB]){o.x.save();o.x.setTransform(1,0,0,1,0,0);sClip(o.x);o.x.globalCompositeOperation='copy';o.x.drawImage(stk.c,0,0);o.x.restore()}
 const e=rimB.x;e.save();e.setTransform(1,0,0,1,0,0);sClip(e);e.globalCompositeOperation='destination-in';for(const [dx,dy] of [[d,0],[-d,0],[0,d],[0,-d]])e.drawImage(stk.c,dx,dy);e.restore();
 const r=rimA.x;r.save();r.setTransform(1,0,0,1,0,0);sClip(r);r.globalCompositeOperation='destination-out';r.drawImage(rimB.c,0,0);r.drawImage(idm.c,0,0);if(stroke&&stroke.sagF&&stroke.sagF.c){const sf=stroke.sagF;r.drawImage(sf.c,sf.x,sf.y);r.drawImage(sf.c,sf.x,sf.y-Math.max(3,3.5*dpr));r.drawImage(sf.c,sf.x,sf.y-Math.max(5,6*dpr))}r.restore();
 const bx=baked.x;bx.save();bx.setTransform(1,0,0,1,0,0);sClip(bx);
 const lf=.25+.75*clamp(pen.life/.3);if(ink.comp==='multiply'){bx.globalCompositeOperation='multiply';bx.globalAlpha=.5*lf}else{bx.globalAlpha=(ink===INK.water||metalPaint()?.45:.25)*lf}
 bx.drawImage(rimA.c,0,0);bx.restore()}
function applyInk(x,ink,s){x.globalCompositeOperation=ink.comp;const base=inkAlpha(ink,s)*mixF()*primeF();x.globalAlpha=(isOpaqueInk(ink)&&(!s.wet||pen.ruff)&&mixF()*primeF()>.82)?1:base;}

/* wet non-porous wall: the film repels the ink — it reticulates into droplets (pinholes inside, satellite beads at the edge) */
const THICK=()=>['oil','alcpaint','water','solid','fluid'].includes(pen.ink)||!!pen.gloss;
/* HEAVY INK: thick paint sits proud — darker settled rim, a slow sag along the bottom edge, a soft shadow under it and a small highlight on top */
function thickLook(col){if(!THICK()||demo)return;if(pen.ink==='solid'||pen.multi)return;const pf=primeF();if(pf<.62)return;/* paint sticks are rubbed on as a thin waxy film: they dry flat, not as a raised bevel */const P=dpr,x0=Math.max(0,Math.floor((stroke.x0-6)*P)),y0=Math.max(0,Math.floor((stroke.y0-6)*P)),w=Math.min(stk.c.width-x0,Math.ceil((stroke.x1-stroke.x0+12)*P)),h=Math.min(stk.c.height-y0,Math.ceil((stroke.y1-stroke.y0+18)*P));if(w<4||h<4)return;
 const mk=()=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
 /* the bevel, sag and shadow layers are built a frame or two later from snapshots, so lifting the pen stays smooth */
 const stS=mk();stS.getContext('2d').drawImage(stk.c,x0,y0,w,h,0,0,w,h);const idS=document.createElement('canvas');idS.width=w;idS.height=h+40;idS.getContext('2d').drawImage(idm.c,x0,y0,w,h+40,0,0,w,h+40);const stroke0=stroke,penInk=pen.ink;
 const paintNow=!DYEINK[pen.ink]&&!INK[pen.ink].chrome&&!INK[pen.ink].etch&&INK[pen.ink].comp!=='multiply';
 liftJob(()=>{const stroke=stroke0;
 /* these layers used to be built before the stroke-end pass that clears fresh paint out of older layers, so they lost the part
    over the letter itself; that look is kept (only the edges, sag and shadow outside the letter show) */
 const bleedL={push:L=>{if(paintNow&&!L.slow&&!L.stain){const lx=L.c.getContext('2d');lx.save();lx.globalCompositeOperation='destination-out';lx.drawImage(stS,x0-L.x,y0-L.y);lx.restore()}_bleedL.push(L)}};
 const src=(x,dx,dy)=>x.drawImage(stS,dx,dy),now=performance.now(),k=Math.max(1.5,R()*.16)*P,bl=(c,b,oy=0)=>{const o=mk(),x=o.getContext('2d');try{x.filter=`blur(${b}px)`}catch(_){}x.drawImage(c,0,0);freeC(c);/* wet ink flows into wet/old ink underneath: no rim, sag, shadow or catch-light over an existing line */x.filter='none';x.globalCompositeOperation='destination-out';x.drawImage(idS,0,oy,w,h,0,0,w,h);return o};
 /* 1 rim skipped for opaque paints so overlapping strokes fuse seamlessly without dark seams */
 if(!isOpaqueInk(INK[penInk])){const e=mk(),ex=e.getContext('2d');src(ex,0,0);ex.globalCompositeOperation='destination-in';for(const [dx,dy] of [[k,0],[-k,0],[0,k],[0,-k]])src(ex,dx,dy);const r=mk(),rx=r.getContext('2d');src(rx,0,0);rx.globalCompositeOperation='destination-out';rx.drawImage(e,0,0);freeC(e);rx.globalCompositeOperation='source-in';rx.fillStyle=mixHex(col,'#000000',lum(hex(col))>.7?.16:.28);rx.fillRect(0,0,w,h);bleedL.push({tk:stroke,c:bl(r,.7*P),x:x0,y:y0,t0:now+150,dur:1400,a:.75})}
 /* 2 sag: the bottom edge slumps down a little on an upright wall — scaled by how drippy the ink actually is, so a thick low-drip fluid (correction pens) barely sags instead of growing little hanging legs */
 const sagK=Math.min(1,.1+(((INK[penInk]&&INK[penInk].drip)??1)*2.5));
 if(upright&&sagK>.08){const sg=Math.max(1.2,R()*.18)*P*sagK,c=mk(),x=c.getContext('2d');for(let i=1;i<=4;i++)src(x,0,sg*i/4);x.globalCompositeOperation='destination-out';src(x,0,0);x.globalCompositeOperation='source-in';x.fillStyle=col;x.fillRect(0,0,w,h);bleedL.push({tk:stroke,c:bl(c,.5*P),x:x0,y:y0,t0:now+500,dur:4500,a:sagK})}
 /* 6 shadow just below the lower edge */
 {const sd=Math.max(1.2,R()*.12)*P,c=mk(),x=c.getContext('2d');src(x,sd*.3,sd);x.globalCompositeOperation='destination-out';src(x,0,0);x.globalCompositeOperation='source-in';x.fillStyle='#000';x.fillRect(0,0,w,h);bleedL.push({tk:stroke,c:bl(c,1.4*P,Math.round(sd*.6)),x:x0,y:y0+Math.round(sd*.6),t0:now+300,dur:2000,a:lum(hex(surfAt(stroke.x0,stroke.y0).mean.map(v=>Math.round(v).toString(16).padStart(2,'0')).join('').replace(/^/,'#')))>.5?.38:.5})}
 /* raised bevel: inner bottom-right thickness shadow + diagonal top-left catchlight scaled by ink.raise (masked against idm.c so overlapping paint merges seamlessly) */
 const rz=Math.max(.14,(INK[penInk]&&INK[penInk].raise)||.22),isLt=lum(hex(col))>.72,isFluid=pen.ink==='fluid',isGlossy=(SHEEN[penInk]||0)>=.5;
 /* correction fluid is thick and glossy enough that even a near-white stroke should show a visible satin sheen —
    plain white-on-white is invisible, so its catchlight gets a faint cool tint and a stronger contact shadow */
 {const bk=Math.max(1.1,(0.8+rz*2.4+R()*.06))*P,c=mk(),x=c.getContext('2d');src(x,0,0);x.globalCompositeOperation='destination-out';src(x,-bk*.65,-bk);x.globalCompositeOperation='source-in';x.fillStyle='#000000';x.fillRect(0,0,w,h);bleedL.push({tk:stroke,c:bl(c,.7*P),x:x0,y:y0,t0:now+240,dur:1400,a:Math.min(.68,rz*(isLt?(isFluid?.92:.68):.95)*(isGlossy?1.15:1))})}
 {const hk=Math.max(1,(0.7+rz*2.0+R()*.07))*P*(isGlossy?1.4:1),c=mk(),x=c.getContext('2d');src(x,0,0);x.globalCompositeOperation='destination-out';src(x,hk*.65,hk);x.globalCompositeOperation='source-in';x.fillStyle=isLt&&isFluid?'#eaf4ff':'#ffffff';x.fillRect(0,0,w,h);bleedL.push({tk:stroke,c:bl(c,isGlossy?.45*P:.6*P),x:x0,y:y0,t0:now+200,dur:1200,a:Math.min(.88,(isLt?(isFluid?.62:.42):Math.min(.82,.55+rz*.55))*(isGlossy?1.25:1))})}
 /* Tactile opaque paint texture & layered overlap depth (subtle pigment mottle, micro-drag ridges, and soft shadow cast onto strokes underneath) */
 if(isOpaqueInk(INK[penInk])&&!INK[penInk].chrome&&!INK[penInk].solid){
  /* A. Soft overlap contact shadow ONLY over already-dried paint underneath — wet-on-wet paint coalesces into one continuous mark */
  {const sdO=Math.max(1.4,R()*.14)*P,c=mk(),x=c.getContext('2d');
   try{x.filter=`blur(${(1.3*P).toFixed(1)}px)`}catch(_){}
   src(x,sdO*.45,sdO*1.05);x.filter='none';
   x.globalCompositeOperation='destination-out';src(x,0,0);
   x.globalCompositeOperation='destination-in';x.drawImage(idS,0,0,w,h,0,0,w,h);
   x.globalCompositeOperation='destination-out';
   for(const k in WET){const wk=WET[k];if(wk.active&&wk.c.width===baked.c.width)x.drawImage(wk.c,x0,y0,w,h,0,0,w,h)}
   x.globalCompositeOperation='source-in';x.fillStyle='#0a0c10';x.fillRect(0,0,w,h);
   bleedL.push({tk:stroke,c,x:x0,y:y0,t0:now+180,dur:950,a:isLt?.36:.26});
  }
  /* B. Subtle organic pigment mottle & micro-blemish texture inside the thick paint body */
  {if(!thickLook._pt){
    const S=160,tc=document.createElement('canvas');tc.width=tc.height=S;const tx=tc.getContext('2d'),im=tx.createImageData(S,S),dd=im.data;
    let rs=41927;const rnd=()=>(rs=(Math.imul(rs,1664525)+1013904223)>>>0)/4294967296;
    for(let y=0;y<S;y++)for(let x2=0;x2<S;x2++){
     const u=x2/S,v=y/S,m=n(14,14,u,v)*.58+n(36,36,u,v)*.28+n(72,72,u,v)*.14;
     const q=(y*S+x2)*4;
     /* subtle dark mottle + rare tiny air-pinhole/ridge speck */
     const dark=m<.42?Math.pow((.42-m)/.42,1.4)*.55:0;
     const speck=rnd()<.0045?(.45+rnd()*.45):0;
     const a=Math.min(1,dark+speck);
     dd[q]=28;dd[q+1]=30;dd[q+2]=34;dd[q+3]=Math.round(a*255);
    }
    tx.putImageData(im,0,0);thickLook._pt=tc;
   }
   const c=mk(),x=c.getContext('2d');
   src(x,0,0);
   x.globalCompositeOperation='source-in';
   const pat=x.createPattern(thickLook._pt,'repeat');
   const ox=(Math.random()*160)|0,oy=(Math.random()*160)|0;
   x.save();x.translate(ox,oy);x.fillStyle=pat;x.fillRect(-ox,-oy,w,h);x.restore();
   /* faint lighter ridge highlights on dark paints, subtle warm-cool shadow mottle on light paints */
   const tAl=isLt?.17:(lum(hex(col))<.22?.10:.14);
   bleedL.push({tk:stroke,c,x:x0,y:y0,t0:now+140,dur:1100,a:tAl,comp:'multiply'});
  }
  /* C. Delicate inner edge ridge so thick paint reads with a proud physical lip */
  {const ek=Math.max(1.0,R()*.11)*P,e=mk(),ex=e.getContext('2d');
   src(ex,0,0);ex.globalCompositeOperation='destination-in';
   for(const [dx,dy] of [[ek,0],[-ek,0],[0,ek],[0,-ek]])src(ex,dx,dy);
   const r=mk(),rx=r.getContext('2d');src(rx,0,0);rx.globalCompositeOperation='destination-out';rx.drawImage(e,0,0);freeC(e);
   rx.globalCompositeOperation='source-in';rx.fillStyle=isLt?'#8e949c':mixHex(col,'#000000',.22);rx.fillRect(0,0,w,h);
   bleedL.push({tk:stroke,c:bl(r,.55*P),x:x0,y:y0,t0:now+160,dur:1100,a:isLt?.26:.22});
  }
 }
;freeC(stS);freeC(idS)})}
/* SETTLING: runny ink on an upright wall — the dense dye sinks while it's wet, so each mark dries thin and lighter
   at the top and deep and dark at the bottom (pigment piles up low) */
let wetSpan={x0:0,y0:0,x1:0,y1:0,t:0};
function rgbaOf(hx,a){const c=hex(hx);return `rgba(${c[0]},${c[1]},${c[2]},${a})`}
/* a dye film made more concentrated: each colour channel's transmission raised to a power (Beer's law), so yellow deepens to amber
   and blue to navy, keeping its hue, instead of greying toward black (mixing with black turned yellow olive) */
function dyeDeep(col,k){const L=hex(col).map(v=>Math.pow(clamp(v/255,.002,1),2.2));return '#'+L.map(v=>Math.round(Math.pow(Math.pow(v,k),1/2.2)*255).toString(16).padStart(2,'0')).join('')}
function settle(col,s){if(demo||!upright||s.absorb>.5)return;const ink=INK[pen.ink];if((!DYEINK[pen.ink]&&!s.wet)||ink.solid||ink.chrome||ink.etch)return;/* paint only settles when the wall is wet: the water film lets the pigment sink before the binder grabs */
 const P=dpr,x0=Math.max(0,Math.floor(stroke.x0*P)),y0=Math.max(0,Math.floor(stroke.y0*P)),w=Math.min(stk.c.width-x0,Math.ceil((stroke.x1-stroke.x0)*P)),h=Math.min(stk.c.height-y0,Math.ceil((stroke.y1-stroke.y0)*P));if(w<3||h<6)return;
 const span=Math.max(h,90*P),top0=y0+h-span,now=(stroke.dryT0=stroke.dryT0||performance.now()),dark=lum(hex(col))<.3,str=(DYEINK[pen.ink]?1:.7)*(1-s.absorb)*dripLife()*(s.wet?1:.5);if(str<.03)return;/* on a wet wall the dye has water to sink through, so it settles a long way down the letter; on a dry wall it mostly sets where it lands */
 /* OVER-PRIMED: a flooded nib lays a much heavier wet film, so gravity drags far more of the dye down — the top thins right out and the bottom goes near-black */
 const ov=pen.valve?clamp((pen.flow-.95)/.35):pen.squeeze?clamp(((pen.sat??0)-.98)/.25):clamp((flowNow(null)-.95)/.4),wv=s.wet?.4:0,O=Math.min(1,ov+wv);
 /* light end / dark end follow gravity, and span every stroke that's still wet together, so a crossbar added
   to fresh letters takes the tone of where it sits in the tag */
 {const t=now;if(t-wetSpan.t>(TAUS[pen.ink]||1.5)*3500){wetSpan={x0:stroke.x0,y0:stroke.y0,x1:stroke.x1,y1:stroke.y1,t}}else{wetSpan.x0=Math.min(wetSpan.x0,stroke.x0);wetSpan.y0=Math.min(wetSpan.y0,stroke.y0);wetSpan.x1=Math.max(wetSpan.x1,stroke.x1);wetSpan.y1=Math.max(wetSpan.y1,stroke.y1);wetSpan.t=t}}
 const Gd=gDir(),cxw=(wetSpan.x0+wetSpan.x1)/2,cyw=(wetSpan.y0+wetSpan.y1)/2,gexw=(Math.abs(Gd.x)*(wetSpan.x1-wetSpan.x0)+Math.abs(Gd.y)*(wetSpan.y1-wetSpan.y0))/2,gspw=Math.max(2*gexw,90),ewx=cxw+Gd.x*gexw,ewy=cyw+Gd.y*gexw,
  GS={ex:ewx*P-x0,ey:ewy*P-y0,sx:(ewx-Gd.x*gspw)*P-x0,sy:(ewy-Gd.y*gspw)*P-y0};
 const mk=()=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
 /* light top: the thinned film lets the wall and the dye's own hue through */
 {const c=mk(),x=c.getContext('2d');x.drawImage(stk.c,x0,y0,w,h,0,0,w,h);x.globalCompositeOperation='source-in';const g=x.createLinearGradient(GS.sx,GS.sy,GS.ex,GS.ey),wall='#'+s.mean.map(v=>Math.round(v).toString(16).padStart(2,'0')).join(''),lite=dark?(CAST(pen.ink,col)?mixHex(col,CAST(pen.ink,col),.5+.35*O):mixHex(col,wall,.36+.42*O)):mixHex(col,wall,.58+.3*O);
  g.addColorStop(0,lite);g.addColorStop(.55,lite);g.addColorStop(1,col);x.fillStyle=g;x.fillRect(0,0,w,h);x.globalCompositeOperation='destination-in';const m=x.createLinearGradient(GS.sx,GS.sy,GS.ex,GS.ey);m.addColorStop(0,'rgba(0,0,0,1)');m.addColorStop(.6-.12*O,`rgba(0,0,0,${(.35-.1*O).toFixed(2)})`);m.addColorStop(.75-.1*O,'rgba(0,0,0,0)');x.fillStyle=m;x.fillRect(0,0,w,h);/* overlaps only ever go darker: the thinned light top never lightens ink that was already there */x.globalCompositeOperation='destination-out';x.drawImage(idm.c,x0,y0,w,h,0,0,w,h);bleedL.push({sid:stroke,c,x:x0,y:y0,t0:now+300,dur:8200,a:Math.min(1,(.92+.08*O)*str)})}
 /* dark bottom: pigment piles up */
 {const c=mk(),x=c.getContext('2d');x.drawImage(stk.c,x0,y0,w,h,0,0,w,h);x.globalCompositeOperation='source-in';x.fillStyle=dyeDeep(col,1.6+((dark?.72:.55)+.25*O)*.9);x.fillRect(0,0,w,h);x.globalCompositeOperation='destination-in';const m=x.createLinearGradient(GS.sx,GS.sy,GS.ex,GS.ey);m.addColorStop(.4-.15*O,'rgba(0,0,0,0)');m.addColorStop(.75-.1*O,`rgba(0,0,0,${(.85+.15*O).toFixed(2)})`);m.addColorStop(1,'rgba(0,0,0,1)');x.fillStyle=m;x.fillRect(0,0,w,h);stroke.settleL={sid:stroke,c,x:x0,y:y0,t0:now+500,dur:8600,a:Math.min(1,(.95+.05*O)*str)}}}

/* DRIP SETTLING: dye runs go through the exact same drying & heavy-pigment settling stages as the main tag */
function dripSettle(d,s,ex,ey,rb,hd){
 if(demo||!upright||!d||!d.pts||d.pts.length<2||d.soft||d.et||d.wash||d.wet||s.absorb>.5)return;
 if(!d.ink||d.ink.solid||d.ink.etch)return;const dye=!!DYEINK[d.ty],chr=!!d.ink.chrome;
 const col=typeof d.col==='string'&&d.col[0]==='#'?d.col:null;if(!col)return;
 const P=dpr,pts=d.pts;
 let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
 for(let i=0;i<pts.length;i+=3){const px=pts[i],py=pts[i+1],pr=pts[i+2]+2;if(px-pr<x0)x0=px-pr;if(py-pr<y0)y0=py-pr;if(px+pr>x1)x1=px+pr;if(py+pr>y1)y1=py+pr}
 if(rb){const mr=rb*(hd||1.15)*1.6+3;x0=Math.min(x0,ex-mr);y0=Math.min(y0,ey-mr);x1=Math.max(x1,ex+mr);y1=Math.max(y1,ey+mr)}
 const X=Math.max(0,Math.floor(x0*P)),Y=Math.max(0,Math.floor(y0*P)),w=Math.min(baked.c.width-X,Math.ceil((x1-x0)*P)),h=Math.min(baked.c.height-Y,Math.ceil((y1-y0)*P));
 if(w<3||h<4)return;
 const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');
 x.setTransform(P,0,0,P,-X,-Y);x.lineCap='round';x.lineJoin='round';x.strokeStyle='#000';x.fillStyle='#000';
 for(let i=3;i<pts.length;i+=3){
  if(pts[i+2]<0||pts[i-1]<0)continue;
  x.lineWidth=Math.max(.7,(pts[i-1]+pts[i+2]))*1.02;
  x.beginPath();x.moveTo(pts[i-3],pts[i-2]);x.lineTo(pts[i],pts[i+1]);x.stroke();
 }
 if(rb){
  const an=Math.atan2(d.gy||1,d.gx||0),bxC=ex+(d.gx||0)*rb*.28,byC=ey+(d.gy||1)*rb*.28;
  x.beginPath();x.ellipse(bxC,byC,rb*(hd||1.15),rb*(hd||1.15)*1.38,an-Math.PI/2,0,TAU);x.fill();
 }
 x.setTransform(1,0,0,1,0,0);x.globalCompositeOperation='source-in';
 const O=Math.min(1,(d.ov||0)+(s.wet?.4:0)),dark=lum(hex(col))<.3,str=(1-s.absorb)*dripLife();
 /* the run is where the ink pooled: it dries with more pigment per area than the letter, so darker - dyes a lot, paints less, chrome goes to a dark gunmetal */const deepCol=dye?dyeDeep(col,1.45+((dark?.72:.55)+.25*O)*.7):chr?mixHex(col,'#2b2f35',.68+.15*O):mixHex(col,'#000000',((dark?.4:.3)+.15*O)*Math.pow(1-lum(hex(col)),1.5));/* extra pigment makes a paint run richer, not greyer: a white or pale run dries as solid as the letter (reference photos) */
 const wy0=(wetSpan&&wetSpan.y1>wetSpan.y0+8)?wetSpan.y0*P:Y,wy1=(wetSpan&&wetSpan.y1>wetSpan.y0+8)?Math.max(wy0+90*P,wetSpan.y1*P):Y+Math.max(h,90*P);
 const g=x.createLinearGradient(0,wy0-Y,0,wy1-Y);
 /* fade from the SAME colour at zero alpha: fading from transparent black makes the in-between a semi-transparent grey,
    which is what turned light runs grey part-way down */g.addColorStop(Math.max(0,.4-.15*O),rgbaOf(deepCol,0));
 g.addColorStop(.75-.1*O,deepCol);
 g.addColorStop(1,deepCol);
 x.fillStyle=g;x.fillRect(0,0,w,h);
 bleedL.push({c,x:X,y:Y,t0:(d.st0||performance.now())+500,dur:8600,a:Math.min(1,(.95+.05*O)*str)});
}
/* FAST FLICK: when the hand whips off the wall the nib is still moving but leaving it — the line thins out and
   breaks into dry scratches along the exit direction. Slow lifts keep the blunt end. */
function flickTail(){const S=stroke,P=S.sp||last;if(!P||demo||pen.metal||pen.dauber)return;const v=S.v||0;if(v<(window.__flickMin??.85))return;
 const vm=Math.hypot(S.vx||0,S.vy||0)||1,ux=(S.vx||0)/vm,uy=(S.vy||0)/vm,nx=-uy,ny=ux,r0=pen.w*MM/2*curScale*.92,len=Math.min(130,(v-.55)*48)*(.8+Math.random()*.4),n=Math.max(3,Math.min(9,Math.round(r0/1.6)+2)),X=stk.x,solid=INK[pen.ink].solid,dry=solid?1.4:1;
 const curl=(Math.random()-.5)*.35;X.save();X.lineCap='round';
 for(let j=0;j<n;j++){const o=(j/(n-1)*2-1),stop=(1-Math.abs(o)*.55)*(.45+Math.random()*.55),w=Math.max(.45,r0*2/n*1.35);let px=P.x+nx*o*r0*.85,py=P.y+ny*o*r0*.85,on=true;
  X.strokeStyle=pen.multi?pen.multi[(j*pen.multi.length/n)|0]:curCol();
  for(let t=0;t<stop;t+=2/len){const t2=Math.min(stop,t+2/len),a=curl*t2*t2,cx=ux*Math.cos(a)-uy*Math.sin(a),cy=ux*Math.sin(a)+uy*Math.cos(a),sq=1-t2*.55,
    qx=P.x+cx*len*t2+nx*o*r0*.85*sq,qy=P.y+cy*len*t2+ny*o*r0*.85*sq;
   /* dry-out: gaps get more frequent toward the end of each strand */if(Math.random()<.06+Math.pow(t2/stop,2)*.55*dry)on=!on;
   if(on){X.globalAlpha=Math.min(1,1.15-t2*.6);X.lineWidth=w*(1-t2*.75);X.beginPath();X.moveTo(px,py);X.lineTo(qx,qy);X.stroke()}px=qx;py=qy}}
 X.restore();S.x0=Math.min(S.x0,P.x-len-r0);S.y0=Math.min(S.y0,P.y-len-r0);S.x1=Math.max(S.x1,P.x+len+r0);S.y1=Math.max(S.y1,P.y+len+r0)}
/* flow / squeeze at 100%+ on a dry upright wall: a few runs break off the lower edge of the stroke when you lift —
   sparser than on a wet wall, more the further past 100% you've pushed it */
/* WET-ON-WET BLEED: hold the nib still on a line of another colour that's still wet and the new colour seeps into it —
   feathered tongues that follow the old paint (they stop at its edge), the longer you hold, the further they go */
/* a rag, roller or jet passing over a run that's still moving: a rag or solvent soaks the head up and the run stops dead; the roller
   paints it over; the jet blasts it on down the wall, thinned */
function liveRunHit(a,b,mode){const R0=mode==='paint'?26:mode==='jet'?18:16,mx=b.x-a.x,my=b.y-a.y;for(const d of drips){if(d.dead||d.soft||!d.em)continue;const dx=d.x-b.x,dy=d.y-b.y;if(dx*dx+dy*dy>(R0+d.r)*(R0+d.r))continue;
 if(mode==='jet'){d.vol*=.45;d.spd=(d.spd||0)+120;d.wet=1}else{d.vol*=mode==='paint'?0:.15;if(d.vol<.06){d.vol=-1;d.dead=1}d.lx=d.x;d.ly=d.y}}}
function wetBleed(x,y,dw){const nc=curCol();if(!nc||nc[0]!=='#')return;const r0=R();let oc=null,wv=0;
 for(let i=0;i<10&&!oc;i++){const a=i/10*TAU,dd=r0*(1.2+Math.random()*1.3),px=x+Math.cos(a)*dd,py=y+Math.sin(a)*dd,c=colG[inkCell(px,py)],w=wetAt(px,py);if(c&&typeof c==='string'&&c[0]==='#'&&c!==nc&&w>.25){oc=c;wv=w}}
 if(!oc)return;const rad=r0*(1.5+Math.min(4,dw*2.2)),P=dpr,D=Math.ceil(rad*2*P)+4,t=tcan(D,'wb'),X=Math.round((x-rad)*P)-2,Y=Math.round((y-rad)*P)-2,cc=hex(nc);
 t.x.setTransform(1,0,0,1,0,0);t.x.globalCompositeOperation='source-over';t.x.clearRect(0,0,D,D);
 for(let i=0;i<5;i++){const a=Math.random()*TAU,dd=r0*1.5+Math.random()*Math.max(0,rad-r0*1.5),cx=(x+Math.cos(a)*dd)*P-X,cy=(y+Math.sin(a)*dd)*P-Y,rr=r0*(.45+Math.random()*.9)*P,g=t.x.createRadialGradient(cx,cy,0,cx,cy,rr);g.addColorStop(0,`rgba(${cc[0]},${cc[1]},${cc[2]},${(.34*wv).toFixed(3)})`);g.addColorStop(1,`rgba(${cc[0]},${cc[1]},${cc[2]},0)`);t.x.fillStyle=g;t.x.fillRect(cx-rr,cy-rr,rr*2,rr*2)}
 t.x.globalCompositeOperation='destination-in';t.x.drawImage(idm.c,X,Y,D,D,0,0,D,D);t.x.globalCompositeOperation='source-over';
 const b=baked.x;b.save();b.setTransform(1,0,0,1,0,0);b.drawImage(t.c,X,Y);b.restore();
 const ci=inkCell(x+(Math.random()-.5)*rad,y+(Math.random()-.5)*rad);if(colG[ci]&&colG[ci]!==nc&&typeof colG[ci]==='string'&&colG[ci][0]==='#')colG[ci]=mixHex(colG[ci],nc,.2);dirty=true}
/* SAGGING CURTAIN: a heavy wet film doesn't just throw out drips — the whole lower edge of the stroke slides down the
   wall. The bottom edge stretches into a scalloped curtain: deep tongues where the paint was heaviest, shallow webbing
   between them, so the bars themselves morph downward and fuse with their runs (reference: heavy squeezer tags) */
function sagCurtain(s){if(demo||!stroke||!upright||s.absorb>.5)return;const ink=INK[pen.ink];if(!ink||ink.solid||ink.etch||ink.chrome||pen.dauber)return;
 const ov=pen.valve?clamp((pen.flow-.75)/.5):pen.squeeze?clamp(((pen.sat??0)-.85)/.4):clamp((flowNow(null)-.8)/.4),K=clamp((.45+.7*ov)*(ink.drip??.6)*(s.wet?1.4:1)*(WX&&WX.run||1));if(K<.1)return;
 const G=gDir();if(Math.abs(G.y)<Math.abs(G.x))return;const P=dpr,r=R(),tkSag=THICK()||pen.tip==='chisel',L=r*(tkSag?(1.2+4.6*K):(.8+3.6*K))*P,pad=2*P,X=Math.max(0,Math.floor(stroke.x0*P-pad)),Y=Math.max(0,Math.floor(stroke.y0*P-pad)),w=Math.min(stk.c.width-X,Math.ceil((stroke.x1-stroke.x0)*P+pad*2)),h=Math.min(stk.c.height-Y,Math.ceil((stroke.y1-stroke.y0)*P+pad*2));if(w<4||h<4)return;
 const H2=Math.min(stk.c.height-Y,h+Math.ceil(L)+2),sd=(Math.random()*1e5)|0,sc=Math.max(2.5,r*.75);
 const PW=stroke.pw||[],PT=stroke.pts||[],rr=r*1.1,colL=new Float32Array(w);for(let i=0;i<PW.length;i++){let hv=PW[i];if(hv<=.05)continue;/* suppress sag along vertical stems — ink only sags off horizontal/shallow undersides & bottom tips */if(PT.length>=4){const i0=Math.max(0,i-1)*2,i1=Math.min(PW.length-1,i+1)*2,dx=PT[i1]-PT[i0],dy=PT[i1+1]-PT[i0+1],sl=Math.hypot(dx,dy);if(sl>1){const hz=Math.abs(dx)/sl;hv*=clamp((hz-.35)/.45,0,1)}}if(hv<=.05)continue;const cx=PT[i*2]*P-X;for(let q=Math.max(0,Math.floor(cx-rr*2.2*P));q<Math.min(w,Math.ceil(cx+rr*2.2*P));q++){const fall=1-Math.abs(q-cx)/(rr*2.2*P);if(fall>0)colL[q]=Math.max(colL[q],hv*fall*fall*(3-2*fall))}}
 let anyL=0;for(let q=0;q<w;q++)anyL=Math.max(anyL,colL[q]);if(anyL<.08)return;
 /* build the full-depth curtain once: each column's own copy of the stroke stretched down by its depth d[i] */
 const st=Math.max(1,Math.round(P)),D=new Float32Array(w),C=document.createElement('canvas');C.width=w;C.height=H2;const cx=C.getContext('2d');
 for(let i=0;i<w;i+=st){const xp=(X+i)/P,n=vnz(xp/sc,sd),n2=vnz(xp/(sc*.35),sd+3),scallop=tkSag?(.38+.62*Math.pow(Math.abs(Math.sin(xp/(Math.max(3.5,r*.62))+sd)),1.5)):1,d=L*(.14+.86*Math.pow(n,1.85))*(.62+.38*n2)*scallop*Math.min(1.15,colL[i]*1.35);if(d<1)continue;D[i]=d;for(let k=0;k<=d;k+=Math.max(1,P*1.15))cx.drawImage(stk.c,X+i,Y,st,h,i,k,st,h)}/* wet specular glint along the raised scalloped underside & stubby hanging legs */if(tkSag&&!ink.etch&&!ink.chrome){cx.save();cx.globalCompositeOperation='source-atop';cx.fillStyle='rgba(255,255,255,0.22)';for(let i=0;i<w;i+=st*2){if(D[i]<2*P)continue;cx.fillRect(i,Math.max(0,h-2.5*P)+D[i]*.55,Math.max(1,st*.9),Math.max(1.5*P,D[i]*.36))}cx.restore()}
 const cut=(x)=>{x.globalCompositeOperation='destination-out';x.drawImage(stk.c,X,Y,w,h,0,-Math.max(1,1.1*P),w,h);x.globalCompositeOperation='source-over'};
 /* the stroke's own mask, kept: the live curtain is re-cut against it every frame (stk is cleared after the stroke) */
 const SM2=document.createElement('canvas');SM2.width=w;SM2.height=H2;SM2.getContext('2d').drawImage(stk.c,X,Y,w,h,0,-Math.max(1,1.1*P),w,h);
 const F=document.createElement('canvas');F.width=w;F.height=H2;{const fx=F.getContext('2d');fx.drawImage(C,0,0);cut(fx);stroke.sagF={c:F,x:X,y:Y};if(lightOn&&!ink.etch){const BW=baked.c.width,BH=baked.c.height;if(!GLW||GLW.width!==BW||GLW.height!==BH){GLW=document.createElement('canvas');GLW.width=BW;GLW.height=BH}const gx=GLW.getContext('2d');gx.save();gx.setTransform(1,0,0,1,0,0);gx.drawImage(F,X,Y);gx.restore();wgOn2=true;lForce=true;slForce=true}{const shK=SHEEN[pen.ink]||0;if(shK>0){const sx=satC().getContext('2d');sx.save();sx.setTransform(1,0,0,1,0,0);sx.globalAlpha=shK*(ink.gloss?1:.85);sx.drawImage(F,X,Y);sx.restore();satOn=true;lForce=true;slForce=true}}for(const Lb of bleedL)if((Lb.tk===stroke||Lb.rim===stroke)&&Lb.c){const lx=Lb.c.getContext('2d');lx.save();lx.globalCompositeOperation='destination-out';lx.drawImage(F,X-Lb.x,Y-Lb.y);if(Lb.rim===stroke){lx.drawImage(F,X-Lb.x,Y-Lb.y-Math.max(3,3.5*P));lx.drawImage(F,X-Lb.x,Y-Lb.y-Math.max(5,6*P))}lx.restore()}}
 /* LIVE: sag curtain slides downward inside F and shares the EXACT same settle() drying curve, gradient & opacity as the letter */
 const Wc=document.createElement('canvas');Wc.width=w;Wc.height=H2;const wx=Wc.getContext('2d'),now=stroke.dryT0||performance.now(),T=(2600+L/P*55)*(s.wet?1.5:1)/(WX&&WX.dry||1),t0=now+120;let lastF=-1,lastS=-1;
 const baseA=Math.min(1,inkAlpha(ink,s)*mixF()*primeF()),isDyeSag=!!DYEINK[pen.ink]&&s.absorb<=.5,sCol=lowCol(s),sDark=lum(hex(sCol))<.3,sOv=pen.valve?clamp((pen.flow-.95)/.35):pen.squeeze?clamp(((pen.sat??0)-.98)/.25):clamp((flowNow(null)-.95)/.4),sO=Math.min(1,sOv),sStr=(1-s.absorb)*dripLife()*(s.wet?1:.5)/* same as settle(): strong on a wet wall, light on a dry one */,sDeep=mixHex(sCol,'#000000',(sDark?.72:.55)+.25*sO),sWall='#'+s.mean.map(v=>Math.round(v).toString(16).padStart(2,'0')).join(''),sLite=sDark?(CAST(pen.ink,sCol)?mixHex(sCol,CAST(pen.ink,sCol),.5+.35*sO):mixHex(sCol,sWall,.36+.42*sO)):mixHex(sCol,sWall,.58+.3*sO),sDur=isDyeSag?Math.max(T,9100):T;
 const wy0=(wetSpan&&wetSpan.y1>wetSpan.y0+8)?wetSpan.y0*P:Y,wy1=(wetSpan&&wetSpan.y1>wetSpan.y0+8)?Math.max(wy0+90*P,wetSpan.y1*P):Y+Math.max(h,90*P);
 const Lr={sid:stroke,c:Wc,x:X,y:Y,t0,dur:sDur,a:1,live:1,upd(t){const f=1-Math.pow(1-clamp((t-t0)/T),2.2),sp=isDyeSag?sm(clamp((t-(now+500))/8600)):0,spL=isDyeSag?sm(clamp((t-(now+300))/8200)):0;if(Math.abs(f-lastF)<.012&&Math.abs(sp-lastS)<.018&&(f<1||sp<1))return;lastF=f;lastS=sp;wx.globalCompositeOperation='copy';wx.clearRect(0,0,w,H2);wx.globalCompositeOperation='source-over';wx.globalAlpha=baseA;
   for(let i=0;i<w;i+=st){if(!D[i])continue;wx.drawImage(C,i,0,st,H2,i,-(1-f)*D[i],st,H2)}wx.globalAlpha=1;wx.globalCompositeOperation='destination-in';wx.drawImage(F,0,0);
   if(isDyeSag&&spL>.01){wx.globalCompositeOperation='source-atop';wx.globalAlpha=spL*Math.min(1,(.92+.08*sO)*sStr);const lg=wx.createLinearGradient(0,wy0-Y,0,wy1-Y);lg.addColorStop(0,sLite);lg.addColorStop(.55,sLite);lg.addColorStop(.75-.1*sO,'rgba(0,0,0,0)');wx.fillStyle=lg;wx.fillRect(0,0,w,H2)}
   if(isDyeSag&&sp>.01){wx.globalCompositeOperation='source-atop';wx.globalAlpha=sp*Math.min(1,(.95+.05*sO)*sStr);const sg=wx.createLinearGradient(0,wy0-Y,0,wy1-Y);sg.addColorStop(Math.max(0,.4-.15*sO),'rgba(0,0,0,0)');sg.addColorStop(.75-.1*sO,sDeep);sg.addColorStop(1,sDeep);wx.fillStyle=sg;wx.fillRect(0,0,w,H2)}
   wx.globalAlpha=1;wx.globalCompositeOperation='source-over';dirty=true}};
 Lr.upd(now);bleedL.push(Lr)}
function fullDrips(ink,s){const L=stroke.lv||0,thr=(s.wet||SLICK[s.id])?.70:.86,pCtl=Math.max(clamp(((stroke.pmax||pressNow)-.52)/.38),stroke.dwell>.40?.75:0,L>1.15?clamp((L-1.15)/.35):0),w=dripLife()*clamp((L-thr)/(1-thr))*pCtl;if(demo||!upright||!w||!flowable()||pen.dauber||s.absorb>.6)return;
 const P=stroke.pts||[],r=R(),over=Math.max(0,L-1),gap=Math.max(10,r*(pen.tip==='chisel'?1.02:1.15)),pr=clamp(.85*w*(pen.metal?.75:1)*(s.wet?1.5:(pen.tip==='bullet'||pen.tip==='chisel')&&!pen.metal?1.45:1.15)*(1+over*4.5)*Math.max((ink.drip!=null&&ink.drip<.1)?ink.drip*3:.65,Math.min(1.35,ink.drip??.7))*(1-s.absorb));let len=0;for(let i=2;i<P.length;i+=2)len+=Math.hypot(P[i]-P[i-2],P[i+1]-P[i-1]);
 const cap=Math.min(42,Math.round((2+len/48)*(1+over*3.5)));let t=gap*Math.random(),n=0;/* walk the stroke at even spacing, between recorded points too (fast strokes record few) */
 const Gf=gDir(),gm=Math.hypot(Gf.x,Gf.y)||1,gx0=Gf.x/gm,gy0=Gf.y/gm;let vPool=0,vBestX=0,vBestY=-1e9,hasV=0;
 for(let i=2;i<P.length&&n<cap;i+=2){const ax=P[i-2],ay=P[i-1],dx=P[i]-ax,dy=P[i+1]-ay,sl=Math.hypot(dx,dy)||1;
  /* horiz = how perpendicular this segment is to gravity (1 = flat horizontal bar, 0 = straight vertical stem) */
  const horiz=Math.abs(dx*gy0-dy*gx0)/sl;
  if(horiz<.42){/* vertical/steep stem: liquid drains inside the stroke down to its lowest tip/vertex instead of jumping off the side */
   vPool+=sl*(1-horiz);if(P[i+1]>vBestY){vBestY=P[i+1];vBestX=P[i];hasV=1}if(ay>vBestY){vBestY=ay;vBestX=ax;hasV=1}
   t=Math.max(0,t-sl);continue}
  const segPr=pr*clamp((horiz-.35)/.45,0,1);
  for(;t<=sl&&n<cap;t+=gap){if(Math.random()>segPr)continue;n++;const k=t/sl,x=ax+dx*k,y=ay+dy*k,e=tipEdge(x,y,x,y,pen.tip==='chisel'?((Math.random()<.55?1:-1)*r*(.35+Math.random()*.45)):((Math.random()-.5)*r*1.1));
   const _rf=refRun(r,Math.max(1.15,Math.min(3.8,r*(.082+Math.random()*.14))),juiceK());drip(e[0],e[1],(.55+Math.random()*Math.random()*1.65)*(1+over*1.5)*(_rf.volK||1),{ty:pen.ink,col:curCol(),r:_rf.r,rMax:_rf.rMax,maxT:_rf.maxT,delay:(420+Math.random()*1300)*(.75+.35*clamp(fluidOf(pen.ink).mu,.4,2.2)),src:1,w:r,st0:stroke.dryT0||performance.now()})}t-=sl}
 /* release pooled vertical-stem ink cleanly from the bottom tip/vertex */
 if(hasV&&vPool>r*1.4&&n<cap&&Math.random()<clamp(pr*1.15,0,1)){const e=tipEdge(vBestX,vBestY,vBestX,vBestY,(Math.random()-.5)*r*.45);const _rv=refRun(r,Math.max(1.3,Math.min(4.0,r*(.095+Math.random()*.13))),juiceK());drip(e[0],e[1],Math.min(2.6,(.75+vPool/140)*(1+over*1.4))*(1+.5*juiceK()),{ty:pen.ink,col:curCol(),r:_rv.r*1.1,rMax:_rv.rMax&&_rv.rMax*1.15,delay:(520+Math.random()*900)*(.75+.35*clamp(fluidOf(pen.ink).mu,.4,2.2)),src:1,w:r,st0:stroke.dryT0||performance.now()})}}
/* OVERLAP: paint that isn't fully opaque lets the layer underneath count — where a new stroke crosses paint already
   on the wall the two films stack, so the crossing comes out a little darker (more so the more see-through the paint) */
function overlapDark(){const ink=INK[pen.ink];if(demo||!stroke||!DYEINK[pen.ink]||ink.chrome||ink.solid||ink.etch||ink.comp==='multiply')return null;const op=inkAlpha(ink,stroke.s),k=Math.max(.14,Math.min(.45,(1-op)*3.2));/* see-through inks read darker where they double up; an opaque paint going over itself just blends in — no line shows */
 const P=dpr,x0=Math.max(0,Math.floor(stroke.x0)),y0=Math.max(0,Math.floor(stroke.y0)),x1=Math.min(W-1,Math.ceil(stroke.x1)),y1=Math.min(H-1,Math.ceil(stroke.y1));if(x1<=x0||y1<=y0)return null;
 const mw=Math.ceil((x1-x0)/2)+1,mh=Math.ceil((y1-y0)/2)+1,m=document.createElement('canvas');m.width=mw;m.height=mh;const mx=m.getContext('2d'),im=mx.createImageData(mw,mh);let any=0;
 for(let j=0;j<mh;j++)for(let i=0;i<mw;i++)if(lmAt(x0+i*2,y0+j*2)){im.data[(j*mw+i)*4+3]=255;any=1}if(!any){freeC(m);return null}mx.putImageData(im,0,0);
 const X=Math.floor(x0*P),Y=Math.floor(y0*P),w=Math.min(stk.c.width-X,Math.ceil((x1-x0)*P)+2),h=Math.min(stk.c.height-Y,Math.ceil((y1-y0)*P)+2),c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');
 x.drawImage(stk.c,X,Y,w,h,0,0,w,h);x.globalCompositeOperation='source-in';x.fillStyle=mixHex(curCol(),'#000000',.45);x.fillRect(0,0,w,h);x.globalCompositeOperation='destination-in';x.imageSmoothingEnabled=true;
 /* crossing ink that's still wet: the double-up darkening feathers out into the wet line instead of showing as a hard-edged box */
 let wetX=false;if(wgOn){const gx0=Math.max(0,Math.floor(x0/C)),gx1=Math.min(GW-1,Math.floor(x1/C)),gy0=Math.max(0,Math.floor(y0/C)),gy1=Math.min(GH_-1,Math.floor(y1/C));for(let gy=gy0;gy<=gy1&&!wetX;gy++)for(let gx=gx0;gx<=gx1;gx++)if(wg[gy*GW+gx]>.05){wetX=true;break}}
 try{x.filter=`blur(${((wetX?4.2:1.6)*P).toFixed(1)}px)`}catch(_){}x.drawImage(m,0,0,mw,mh,0,0,mw*2*P,mh*2*P);x.filter='none';freeC(m);
 return {c,x:X,y:Y,t0:performance.now()+60,dur:500,a:wetX?k*.65:k}}
/* FADEBOMB two-tone: the metallic flake stays in the stroke as sparkly grain, the coloured dye wicks out to the edge
   as a thin outline (and shows most where the film is thinnest) */
const FB2={'#16130e':['#c9a24a','Gold/Black'],'#a3121c':['#c9a24a','Gold/Red'],'#1f3fb0':['#c9a24a','Gold/Blue'],'#1f7a3a':['#c9a24a','Gold/Green'],'#121418':['#c4c8cc','Silver/Black'],'#b0141f':['#c4c8cc','Silver/Red'],'#2a48c0':['#c4c8cc','Silver/Blue']};
function fadeLook(){const F=pen.fb2&&FB2[curCol()];if(!F||demo||!stroke)return;const P=dpr,pad=4,X=Math.max(0,Math.floor((stroke.x0-pad)*P)),Y=Math.max(0,Math.floor((stroke.y0-pad)*P)),w=Math.min(stk.c.width-X,Math.ceil((stroke.x1-stroke.x0+2*pad)*P)),h=Math.min(stk.c.height-Y,Math.ceil((stroke.y1-stroke.y0+2*pad)*P));if(w<3||h<3)return;
 let S,B;try{S=stk.x.getImageData(X,Y,w,h);const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');try{x.filter=`blur(${1.5*P}px)`}catch(_){}x.drawImage(stk.c,X,Y,w,h,0,0,w,h);B=x.getImageData(0,0,w,h).data;freeC(c)}catch(_){return}
 const d=S.data,m=hex(F[0]),dy=hex(curCol()),g=Math.max(1,Math.round(.9*P)),hs=(i,j)=>{let n=(i*374761393+j*668265263)>>>0;n=Math.imul(n^(n>>>13),1274126177)>>>0;return((n^(n>>>16))>>>0)/4294967296};
 for(let j=0;j<h;j++)for(let i=0;i<w;i++){const k=(j*w+i)*4,a=d[k+3],b=B[k+3]/255;
  if(a>20){const e=Math.max(0,Math.min(1,(.92-b)/.38)),r1=hs((X+i)/g|0,(Y+j)/g|0),r2=hs(X+i,Y+j),mf=.74-e*.62;
   if(r1<mf){const sh=.78+.42*r2;d[k]=Math.min(255,m[0]*sh);d[k+1]=Math.min(255,m[1]*sh);d[k+2]=Math.min(255,m[2]*sh)}else{const sh=.75+.4*r2;d[k]=dy[0]*sh;d[k+1]=dy[1]*sh;d[k+2]=dy[2]*sh}}
  else if(b>.05){d[k]=dy[0];d[k+1]=dy[1];d[k+2]=dy[2];d[k+3]=Math.round(255*Math.min(.95,b*2.6))}}
 stk.x.putImageData(S,X,Y)}
function repelSkips(){const q=stroke&&stroke.rp;if(!q||!q.length)return;const x=stk.x;x.save();x.globalCompositeOperation='destination-out';
 for(const p of q){const n=1+Math.round(p.r*5);for(let i=0;i<n;i++){if(Math.random()>p.r*.85)continue;const a=Math.random()*TAU,d=Math.random()*p.rr*.85;x.globalAlpha=.75+Math.random()*.25;x.beginPath();x.arc(p.x+Math.cos(a)*d,p.y+Math.sin(a)*d,p.rr*(.1+Math.random()*.24),0,TAU);x.fill()}}x.restore();
 if(!saidRepel++)toast('It won’t take over that — the ink is beading off the layer underneath')}
let saidRepel=0;
/* RUNS GO UNDER LETTERS: a run that crossed bare wall where a new letter now sits is wiped back to wall first, fully —
   even under a see-through dye — and forgotten from the ink map, so it never shows or bleeds up through the letter.
   Older letters underneath are left alone. */
let _e2=null;function tcan2(w,h){if(!_e2)_e2=document.createElement('canvas').getContext('2d');if(_e2.canvas.width!==w||_e2.canvas.height!==h){_e2.canvas.width=w;_e2.canvas.height=h}_e2.setTransform(1,0,0,1,0,0);return _e2}
/* CLEAN GLASS: a thin dye has nothing to soak into — the film pulls back (dewets) into patches and beads, leaving small
   bare holes, most where the nib was running dry */
/* DEWETTING: on slick, low-energy surfaces (plastic, greasy steel, glass, glaze) a thin film can't stay spread — surface
   tension pulls it back into islands, so the line breaks into a patchy, beaded film. Water-based paint (high surface
   tension) does it most, even at full flow; thin alcohol dyes when the nib is starved; heavy paint barely */
const SLICK={plastic:1,wplastic:1,glass:.6};
/* COFFEE RING: as a dye film dries, it evaporates fastest at the edge and the dye is carried there — a darker rim
   forms round the line on non-absorbent walls, fading in as it dries */
/* ===== BREW TEXTURES: what particular ingredients do to the dried film =====
   Each effect is built from the stroke's own shape once it's laid, and appears on its own clock (fisheyes and gel
   ridges straight away, bronzing and wrinkling as the film dries, ferric crust over many seconds). */
const FLK=[];let flkTx=9,flkTy=9;let RZ=null;
function texCov(m,w,h,r){const t=new Float32Array(w*h),o=new Float32Array(w*h);r=Math.max(1,Math.round(r));
 for(let y=0;y<h;y++){let a=0;const b=y*w;for(let x=-r;x<w;x++){if(x+r<w)a+=m[b+x+r];if(x-r-1>=0)a-=m[b+x-r-1];if(x>=0)t[b+x]=a/(2*r+1)}}
 for(let x=0;x<w;x++){let a=0;for(let y=-r;y<h;y++){if(y+r<h)a+=t[(y+r)*w+x];if(y-r-1>=0)a-=t[(y-r-1)*w+x];if(y>=0)o[y*w+x]=a/(2*r+1)}}return o}
function texPass(s,ink){if(demo||!stroke)return;const pr=pen.props&&pen.props.tex,chromeInk=!!ink.chrome;if(!pr&&!chromeInk)return;const T=pr||{};
 const P=dpr,Rc=R(),Rp=Rc*P,pad=Math.ceil(Rp*1.4+8*P),X=Math.max(0,Math.floor(stroke.x0*P)-pad),Y=Math.max(0,Math.floor(stroke.y0*P)-pad),w=Math.min(stk.c.width-X,Math.ceil((stroke.x1-stroke.x0)*P)+pad*2),h=Math.min(stk.c.height-Y,Math.ceil((stroke.y1-stroke.y0)*P)+pad*2);
 if(w<6||h<6||w*h>5e6)return;let Md,Bd,Gd;try{Md=stk.x.getImageData(X,Y,w,h).data;Bd=baked.x.getImageData(X,Y,w,h).data;Gd=bg.x.getImageData(X,Y,w,h).data}catch(_){return}
 const N=w*h,m=new Float32Array(N);let area=0;for(let i=0;i<N;i++){m[i]=Md[i*4+3]/255;area+=m[i]}if(area<20)return;
 const bl=texCov(m,w,h,Rp*.42),far=(T.level||T.bite||T.fecl)?texCov(m,w,h,Rp*.75+3*P):null,now=performance.now(),col=curCol(),ic=typeof col==='string'&&col[0]==='#'?hex(col):[30,30,30],seed=(Math.random()*1e6)|0,dry=(TAUS[pen.ink]||1.5)*900*((pen.props&&pen.props.tauMul)||1);
 const nz=(x,y,sc)=>n(8,8,(((x+X)/(sc)+seed*.013)%8)/8,(((y+Y)/(sc)+seed*.007)%8)/8);
 const layer=(fn,t0,dur)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d'),im=g.createImageData(w,h),d=im.data;let any=false;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x,r=fn(i,x,y);if(r&&r[3]>.004){const q=i*4;d[q]=r[0];d[q+1]=r[1];d[q+2]=r[2];d[q+3]=Math.round(255*Math.min(1,r[3]));any=true}}if(!any){freeC(c);return null}g.putImageData(im,0,0);bleedL.push({sid:stroke,c,x:X,y:Y,t0,dur,a:1,tex:1});return c};
 const pts=stroke.pts||[],polyOff=(g,off)=>{g.beginPath();for(let i=0;i+1<pts.length;i+=2){const j=Math.max(0,i-2),k=Math.min(pts.length-2,i+2),dx=pts[k]-pts[j],dy=pts[k+1]-pts[j+1],L=Math.hypot(dx,dy)||1,x=(pts[i]-dx/L*0-dy/L*off)*P-X,y=(pts[i+1]+dx/L*off)*P-Y;i?g.lineTo(x,y):g.moveTo(x,y)}};
 const pathLayer=(draw,t0,dur,blur)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.lineCap='round';g.lineJoin='round';if(blur){try{g.filter=`blur(${blur}px)`}catch(_){}}draw(g);g.filter='none';const mk=document.createElement('canvas');mk.width=w;mk.height=h;const mg=mk.getContext('2d'),mi=mg.createImageData(w,h);for(let i=0;i<N;i++)mi.data[i*4+3]=Md[i*4+3];mg.putImageData(mi,0,0);g.globalCompositeOperation='destination-in';g.drawImage(mk,0,0);freeC(mk);bleedL.push({sid:stroke,c,x:X,y:Y,t0,dur,a:1,tex:1})};
 /* BRONZING: an overloaded dye dries with a metallic green-gold sheen where it sits thickest */
 if(T.bronze){const bz=lum(ic)<.25?[132,128,62]:[Math.min(255,ic[0]*.5+110),Math.min(255,ic[1]*.5+100),Math.min(255,ic[2]*.3+40)];layer((i,x,y)=>{if(m[i]<.3)return null;const core=sm(clamp((bl[i]-.7)/.25)),pt=sm(clamp((nz(x,y,26*P)-.38)/.3)),fine=.75+.5*ageHash((x+X)>>1,(y+Y)>>1);return[bz[0],bz[1],bz[2],T.bronze*.7*core*pt*fine*m[i]]},now+dry*.8,dry*2.2)}
 /* PIGMENT FLOATING: a strong pigment in white separates and rides up in streaks */
 if(T.float&&pts.length>4){const fc=T.float;pathLayer(g=>{g.lineWidth=Rc*.32*P;g.globalAlpha=.42;g.strokeStyle=fc;for(const o of [-.45,.05,.5]){polyOff(g,o*Rc*(.8+Math.random()*.4));g.stroke()}g.globalAlpha=1},now+300,dry*1.5,1.6*P)}
 /* PINE ROSIN: a glassy amber varnish, brightest along the upper edge */
 if(T.rosin){layer((i,x,y)=>{if(m[i]<.2)return null;const q=i*4,kk=Math.round(Rp*.35)*w,up=bl[i]-bl[i-kk>=0?i-kk:i],hl=sm(clamp(up*3))*.45;return[Bd[q]*.88+40*.12+hl*200,Bd[q+1]*.82+20*.18+hl*190,Bd[q+2]*.6+hl*150,(.55+hl*.5)*m[i]]},now+300,dry*2);
  if(!RZ){RZ=document.createElement('canvas')}if(RZ.width!==baked.c.width||RZ.height!==baked.c.height){RZ.width=baked.c.width;RZ.height=baked.c.height}const rg=RZ.getContext('2d'),rm=document.createElement('canvas');rm.width=w;rm.height=h;const rmg=rm.getContext('2d'),ri=rmg.createImageData(w,h);for(let i=0;i<N;i++)ri.data[i*4+3]=Md[i*4+3];rmg.putImageData(ri,0,0);rg.drawImage(rm,X,Y);freeC(rm)}
 /* BITUMEN: dark tacky gloss that goes translucent amber-brown where it thins at the edges */
 if(T.bitu){layer((i,x,y)=>{if(m[i]<.1)return null;const edge=1-sm(clamp((bl[i]-.52)/.28)),kk=Math.round(Rp*.35)*w,up=bl[i]-bl[i-kk>=0?i-kk:i],hl=sm(clamp(up*3));if(edge<.02&&hl<.02)return null;return hl>edge?[235,225,205,.32*hl*m[i]]:[122,68,22,.6*edge*m[i]]},now+200,dry*1.5)}
 /* OVERLOADED PIGMENT: chalky and flat */
 if(T.chalk){layer((i,x,y)=>{if(m[i]<.2)return null;const g=ageHash(x+X,y+Y);return[232,230,224,(.13+.1*(g>.8?1:0))*T.chalk*m[i]]},now+dry*.6,dry*2.5)}
 /* METHANOL FLASH: it dries before it can level - fast strokes leave dry-brush streaks */
 if(T.flash&&pts.length>4){let fast=0;for(let i=2;i+1<pts.length;i+=2){if(Math.hypot(pts[i]-pts[i-2],pts[i+1]-pts[i-1])>Rc*.55)fast=1}
  if(fast){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d'),bgC=document.createElement('canvas');bgC.width=w;bgC.height=h;bgC.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(Gd),w,h),0,0);g.lineCap='round';g.lineJoin='round';g.strokeStyle='#000';
   /* DRY-BRUSH STREAKS: methanol flashes off before the ink can level, so the film parts into fine hairlines that run WITH the stroke.
      Each streak fades in and out smoothly along its length (no hard dashes), drifts a little sideways, and is strongest where the
      stroke was fast and towards the edges, which dry first. Some are bare-wall gaps, a few are thin starved film. */
   const NL=6+(Rc>5?4:0)+(Rc>9?3:0);
   for(let l=0;l<NL;l++){const u=Math.random()*2-1,o0=Math.sign(u)*Math.pow(Math.abs(u),.7)*Rc*.86,seed=Math.floor(Math.random()*9973),edgeK=.55+.45*Math.abs(u),wd=(.55+Math.random()*Math.random()*1.6)*P,aMax=(.5+Math.random()*.45)*edgeK,sc=Rc*(4+Math.random()*7);let sArc=0,px=null,py=null;
    g.lineWidth=wd;g.lineCap='butt';
    for(let i=2;i+1<pts.length;i+=2){const d=Math.hypot(pts[i]-pts[i-2],pts[i+1]-pts[i-1]);if(d<1e-3)continue;sArc+=d;
     const j=Math.max(0,i-2),k=Math.min(pts.length-2,i+2),dx=pts[k]-pts[j],dy=pts[k+1]-pts[j+1],L2=Math.hypot(dx,dy)||1,nx=-dy/L2,ny=dx/L2;
     const sp=clamp(.35+(d/Rc-.3)/.9),drift=(vnz(sArc/(Rc*9),seed+7)-.5)*Rc*.22,o=o0+drift,qx=(pts[i]+nx*o)*P-X,qy=(pts[i+1]+ny*o)*P-Y;
     const a=aMax*sp*clamp((vnz(sArc/sc,seed)-.25)/.3);
     if(px!==null&&a>.02){g.globalAlpha=a;g.beginPath();g.moveTo(px,py);g.lineTo(qx,qy);g.stroke()}
     px=qx;py=qy}}
   g.globalAlpha=1;
   g.globalCompositeOperation='source-in';g.drawImage(bgC,0,0);freeC(bgC);const mk=document.createElement('canvas');mk.width=w;mk.height=h;const mg=mk.getContext('2d'),mi=mg.createImageData(w,h);for(let i=0;i<N;i++)mi.data[i*4+3]=Md[i*4+3];mg.putImageData(mi,0,0);g.globalCompositeOperation='destination-in';g.drawImage(mk,0,0);freeC(mk);bleedL.push({sid:stroke,c,x:X,y:Y,t0:now,dur:150,a:1,tex:1})}}
 /* FLOW AGENT: levels out and feathers past the edge; too much and it dries with a tide line */
 if(T.level&&far){layer((i,x,y)=>{if(m[i]>.6)return null;const r=far[i];if(r<.02)return null;const fe=sm(clamp((r-.02)/.4))*(1-m[i])*.32*T.level,tide=T.level>.6&&r>.2&&r<.3?.24*(1-Math.abs(r-.25)/.05):0;return tide>fe?[ic[0]*.55,ic[1]*.55,ic[2]*.55,tide]:[ic[0],ic[1],ic[2],fe]},now+150,dry*2)}
 /* SOLVENT BITE: xylene / MEK soften plastic and glass coatings - a frosted haze round the letters */
 if(T.bite&&far&&s.absorb<.12){layer((i,x,y)=>{if(m[i]>.7)return null;const r=far[i];if(r<.015)return null;const hz=sm(clamp(r/.35))*(1-m[i])*(.55+.45*nz(x,y,6*P))*.26*T.bite;return[236,238,240,hz]},now+dry*.5,dry*3)}
 /* METAL FLAKE: individual flakes that catch the light and move with the phone */
 if(T.flake||chromeInk){const fl=T.flake||[[230,234,240]];const nF=Math.min(140,Math.round(area/(Rp*Rp)*(T.flake?9:5)));for(let k=0,tries=0;k<nF&&tries<nF*15;tries++){const x=Math.random()*w,y=Math.random()*h,i=(y|0)*w+(x|0);if(m[i]<.6)continue;k++;const a=Math.random()*TAU,t=Math.random()*.42,c=fl[(Math.random()*fl.length)|0];FLK.push({x:(x+X)/P,y:(y+Y)/P,nx:Math.cos(a)*t,ny:Math.sin(a)*t,s:.7+Math.random()*1.1,c,pr:c==='pearl'})}if(FLK.length>2600)FLK.splice(0,FLK.length-2600);dirty=true}}
function drawGlints(x){if(!FLK.length)return;const lx=-(tilt.x||0)*.55,ly=-(tilt.y||0)*.55-.3,lz=1,ll=Math.hypot(lx,ly,lz),hx=lx/ll,hy=ly/ll,hz0=lz/ll+1,hl=Math.hypot(hx,hy,hz0),Hx=hx/hl,Hy=hy/hl,Hz=hz0/hl;
 x.save();x.setTransform(dpr,0,0,dpr,0,0);x.globalCompositeOperation='lighter';let dead=0;
 for(const g of FLK){if(g.dead){dead++;continue}if(!inkG[inkCell(g.x,g.y)]){g.dead=1;dead++;continue}const nz2=Math.sqrt(Math.max(0,1-g.nx*g.nx-g.ny*g.ny)),d=g.nx*Hx+g.ny*Hy+nz2*Hz;if(d<.985)continue;const b=Math.pow((d-.985)/.015,2.2);
  let c=g.c;if(g.pr){const hu=((g.nx*3+g.ny*5+(tilt.x||0)*2)%1+1)%1;c=[200+55*Math.sin(hu*6.28),200+55*Math.sin(hu*6.28+2.1),200+55*Math.sin(hu*6.28+4.2)]}
  const r=g.s*(1+b*1.6);x.globalAlpha=Math.min(1,b*.9);x.fillStyle=`rgb(${c[0]|0},${c[1]|0},${c[2]|0})`;x.beginPath();x.arc(g.x,g.y,r*.45,0,TAU);x.fill();x.globalAlpha=Math.min(1,b*.45);x.fillRect(g.x-r*1.6,g.y-.18,r*3.2,.36);x.fillRect(g.x-.18,g.y-r*1.6,.36,r*3.2)}
 x.restore();if(dead>400){for(let i=FLK.length-1;i>=0;i--)if(FLK[i].dead)FLK.splice(i,1)}}
/* Work that can wait a frame or two after the pen lifts (its result only fades in hundreds of ms later) is queued here and run one
   job per frame, so lifting the pen doesn't stall a single frame. Each job works from snapshots, not from the live stroke canvas. */
const liftQ=[];function liftJob(fn){liftQ.push(fn)}function runLiftJob(){const t0=performance.now();while(liftQ.length){try{liftQ.shift()()}catch(e){console.warn(e)}if(performance.now()-t0>6)break}}
function coffeeRing(s){if(INK[pen.ink]&&INK[pen.ink].etch&&ETCHABLE[s.id])return;if(demo||!stroke||!DYEINK[pen.ink]||s.absorb>.4)return;const P=dpr,pad=2,sf=stroke.sagF&&stroke.sagF.c?stroke.sagF:null;let X=Math.max(0,Math.floor((stroke.x0-pad)*P)),Y=Math.max(0,Math.floor((stroke.y0-pad)*P)),X1=Math.min(stk.c.width,Math.ceil((stroke.x1+pad)*P)),Y1=Math.min(stk.c.height,Math.ceil((stroke.y1+pad)*P));if(sf){X=Math.min(X,sf.x);Y=Math.min(Y,sf.y);X1=Math.max(X1,Math.min(stk.c.width,sf.x+sf.c.width));Y1=Math.max(Y1,Math.min(stk.c.height,sf.y+sf.c.height))}const w=X1-X,h=Y1-Y;if(w<4||h<4)return;
 const ov=pen.valve?clamp((pen.flow-.7)/.6):pen.squeeze?clamp(((pen.sat??0)-.7)/.5):clamp((flowNow(null)-.6)/.6),sl=(SLICK[s.id]||.4),K=clamp((.35+.65*ov)*(.5+.5*sl)*(s.wet?.5:1)*(1-s.absorb*1.5));if(K<.05)return;
 const col=curCol(),rw=Math.max(1.6,Math.min(9,R()*(.16+.14*ov)))*P,mk=()=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
 /* Build ONE watertight silhouette combining the letter stroke AND its sag curtain so the coffee-ring rim wraps the outer edge of both with zero seam between them */
 const wetM=carrier()==='alcohol'?null:wetMaskC(X,Y,w,h,.85),st=stroke,src=mk(),sx=src.getContext('2d');sx.drawImage(stk.c,X,Y,w,h,0,0,w,h);const idmC=mk();idmC.getContext('2d').drawImage(idm.c,X,Y,w,h,0,0,w,h);if(sf){sx.drawImage(sf.c,sf.x-X,sf.y-Y);sx.drawImage(sf.c,sf.x-X,sf.y-Y-Math.max(1,Math.round(1.5*P)))}
 const erode=(x,d)=>{x.globalCompositeOperation='destination-in';const n=12;for(let i=0;i<n;i++){const a=i/n*TAU;x.drawImage(src,Math.cos(a)*d,Math.sin(a)*d)}x.globalCompositeOperation='source-over'};
 const baseT=stroke.dryT0||performance.now(),tRim=baseT+(sf?1300:500),dRim=sf?7600:8400;
 /* 1. the rim: dye carried out to the pinned outer edge of the combined letter + sag */
 liftJob(()=>{const c=mk(),x=c.getContext('2d');const steps=[[rw*.35,.55],[rw*.7,.3],[rw,.15]];
  for(const [d,a] of steps){const t=mk(),tx=t.getContext('2d');tx.drawImage(src,0,0);erode(tx,d);const e=mk(),ex=e.getContext('2d');ex.drawImage(src,0,0);ex.globalCompositeOperation='destination-out';ex.drawImage(t,0,0);x.globalAlpha=a;x.drawImage(e,0,0);freeC(t);freeC(e)}
  x.globalAlpha=1;x.globalCompositeOperation='source-in';x.fillStyle=mixHex(col,'#000000',.30);x.fillRect(0,0,w,h);x.globalCompositeOperation='destination-out';x.drawImage(idmC,0,0);bleedL.push({sid:st,rim:st,c,x:X,y:Y,t0:tRim,dur:dRim,a:Math.min(.75,.38+.38*K)*K})});
 /* 2. the middle: paler interior flowing continuously from the letter into the sag */
 liftJob(()=>{const c=mk(),x=c.getContext('2d');x.drawImage(src,0,0);erode(x,rw*1.1);x.globalCompositeOperation='source-in';const wall='#'+s.mean.map(v=>Math.round(v).toString(16).padStart(2,'0')).join('');x.fillStyle=mixHex(col,wall,.6);x.fillRect(0,0,w,h);x.globalCompositeOperation='destination-out';x.drawImage(idmC,0,0);{const G=gDir(),g=x.createLinearGradient(w/2-G.x*w/2,h/2-G.y*h/2,w/2+G.x*w/2,h/2+G.y*h/2);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(.35,'rgba(0,0,0,.7)');g.addColorStop(.6,'rgba(0,0,0,0)');x.globalCompositeOperation='destination-in';x.fillStyle=g;x.fillRect(0,0,w,h)}
  bleedL.push({sid:st,c,x:X,y:Y,t0:tRim+200,dur:dRim,a:.38*K})});
 /* 3. crossings: two wet dye films on top of each other */
 liftJob(()=>{const c=mk(),x=c.getContext('2d');x.drawImage(src,0,0);x.globalCompositeOperation='destination-in';x.drawImage(idmC,0,0);const b=mk(),bx2=b.getContext('2d');try{bx2.filter=`blur(${(1.2*P).toFixed(1)}px)`}catch(_){}bx2.drawImage(c,0,0);bx2.filter='none';bx2.globalCompositeOperation='source-in';bx2.fillStyle=mixHex(col,'#000000',.42);bx2.fillRect(0,0,w,h);bx2.globalCompositeOperation='destination-in';bx2.drawImage(src,0,0);/* a crossing over still-wet dye runs together instead of doubling up */if(wetM){bx2.globalCompositeOperation='destination-out';bx2.drawImage(wetM,0,0);freeC(wetM)}freeC(c);bleedL.push({sid:st,c:b,x:X,y:Y,t0:baseT+200,dur:6000,a:.75});freeC(src);freeC(idmC)})}
function sputter(x,y,r){/* air in a squeezer: queue small spits so sagCurtain never stretches them into floating ticks */if(!stroke)return;const q=stroke.sput||(stroke.sput=[]),n=3+Math.floor(Math.random()*6);for(let i=0;i<n;i++){const a=Math.random()*TAU,d=r*(1.05+Math.random()*1.7),rr=Math.random()<.15?1.4+Math.random()*1.6:.35+Math.random()*.8;q.push(x+Math.cos(a)*d,y+Math.sin(a)*d,rr)}}
function flushSputter(s){if(!stroke||!stroke.sput||!stroke.sput.length)return;const c=stk.x,q=stroke.sput,lc=lowCol(s);for(let i=0;i<q.length;i+=3){stroke.x0=Math.min(stroke.x0,q[i]-q[i+2]);stroke.y0=Math.min(stroke.y0,q[i+1]-q[i+2]);stroke.x1=Math.max(stroke.x1,q[i]+q[i+2]);stroke.y1=Math.max(stroke.y1,q[i+1]+q[i+2])}c.save();c.fillStyle=SMOOTH(s)?lc:inkPat(s,lc,0);for(let i=0;i<q.length;i+=3){c.beginPath();c.arc(q[i],q[i+1],q[i+2],0,TAU);c.fill()}c.restore();stroke.sput=null}
function wipeRunsUnder(){if(!RUNL.c.width)return;const bx=baked.x;if(tmp.c.width!==bg.c.width||tmp.c.height!==bg.c.height){tmp.c.width=bg.c.width;tmp.c.height=bg.c.height}const tx=tmp.x;tx.save();tx.setTransform(1,0,0,1,0,0);sClip(tx);
 /* the letter's solid body only (shrunk a touch from its soft edge), so the bit of run right at the edge stays joined on */
 const e=tcan2(tmp.c.width,tmp.c.height);e.save();e.setTransform(1,0,0,1,0,0);sClip(e);e.globalCompositeOperation='copy';e.drawImage(stk.c,0,0);e.globalCompositeOperation='source-over';for(let q=0;q<5;q++)e.drawImage(stk.c,0,0);e.restore();
 const k=2.2*dpr;tx.globalCompositeOperation='copy';tx.drawImage(e.canvas,0,0);tx.globalCompositeOperation='destination-in';tx.drawImage(e.canvas,0,-k);/* only the letter's lower edge is kept back (where runs leave it); its sides are cleared fully, so a run grazing the side of a letter never shows */tx.drawImage(RUNL.c,0,0);
 const ix=idm.x;ix.save();ix.setTransform(1,0,0,1,0,0);sClip(ix);ix.globalCompositeOperation='destination-out';for(const [ox,oy] of [[0,0],[1,0],[-1,0],[0,1],[0,-1]])ix.drawImage(tmp.c,ox,oy);ix.restore();
 tx.globalCompositeOperation='source-in';tx.drawImage(bg.c,0,0);tx.restore();bx.save();bx.setTransform(1,0,0,1,0,0);sClip(bx);bx.drawImage(tmp.c,0,0);bx.restore();
 const rl=RUNL.x;rl.save();rl.setTransform(1,0,0,1,0,0);sClip(rl);rl.globalCompositeOperation='destination-out';rl.drawImage(stk.c,0,0);rl.drawImage(stk.c,0,0);rl.restore()}
/* colour picked up from wet ink part-way through a letter shows in the marks laid down after that point; the whole-letter passes at
   lift (settling, bevel, rims, blends) use the colour the nib had when the letter started, or they would recolour the start of it too */
function end(){if(!stroke)return;const dA=pen.dirtAmt,dC=pen.dirtCol;if(stroke.dirt0!==undefined){pen.dirtAmt=stroke.dirt0<.05?0:(stroke.dirt0+(dA||0))/2;pen.dirtCol=stroke.dirtCol0}try{endBody()}finally{pen.dirtAmt=dA;pen.dirtCol=dC}}
function endBody(){if(!stroke)return;landPulse(stroke);landRun(stroke);lastUpT=performance.now();{const Pp=stroke.pts||[];let mx=0;for(let i=2;i<Pp.length;i+=2)mx=Math.max(mx,Math.hypot(Pp[i]-Pp[0],Pp[i+1]-Pp[1]));const tap=mx<10&&performance.now()-(stroke.p0t||downT)<380;if(tap&&(stroke.pk||0)>.86&&tool==='draw'&&!demo&&!INK[pen.ink].solid&&!INK[pen.ink].etch&&flowNow(null)>.3&&last)splatBurst(last.x,last.y,stroke.s,clamp((stroke.pk-.86)/.14));
 /* correction-fluid pens round off every lift-off into a small teardrop blob instead of a blunt cut tip */
 else if(pen.ink==='fluid'&&!demo&&tool==='draw'&&last)blob(last.x,last.y,R()*.95,stroke.s)
 /* Nib lift-off contact spike: breaking contact leaves a small meniscus bead that feeds drips at stroke ends */
 if(!demo&&upright&&tool==='draw'&&last&&flowable()&&(stroke.n||0)>2){const _fE=flowNow(null);if(_fE>.35)flowDeposit(last.x,last.y,.06,_fE*1.08,stroke.s,.20)}}sputterCut();if(stroke.hq&&stroke.hq.length)liftHalo(stroke.hq,stroke.s);clearSM();repelSkips();{const o=overlapDark();if(o)bleedL.push(o)}markLetters();wipeRunsUnder();if(stroke.pq&&stroke.pq.length)pickQ.push(...stroke.pq);lForce=true;g3Dirty=true;slForce=true;if(slFixTouched)slFixDirty=true;if(!demo)glossAdd();flushStreaks(null,true);flickTail();const ink=stroke.ink,s=stroke.s,bx=baked.x;
 if(s.wet&&!demo){}else if(stroke.wp&&stroke.wp.length&&!['water','alcohol','flow'].includes(pen.ink)){for(const p of stroke.wp)if(Math.random()<.34*ink.run)drip(p.x+(Math.random()-.5)*R(),p.y+R()*.42,.25+Math.random()*Math.random()*1.4,{ty:pen.ink,col:curCol(),r:Math.max(.9,Math.min(3.6,R()*(.06+Math.random()*.16))),delay:Math.random()*900})}
 else if(stroke.wp&&stroke.wp.length&&blooms.length<900){if(s.absorb<.4)for(const p of stroke.wp)for(let j=0;j<2;j++)if(Math.random()<.5*(ink.run||.8))drip(p.x+(Math.random()-.5)*R()*1.6,p.y+R()*(Math.random()*.5),.3+Math.random()*Math.random()*1.6,{ty:pen.ink,col:curCol(),r:Math.max(.5,Math.min(1.4,R()*(.025+Math.random()*.06))),al:.5+Math.random()*.3,delay:200+Math.random()*1500});const now=performance.now(),r=R();stroke.wp.forEach((p,i)=>blooms.push({x:p.x,y:p.y,r,t0:now+i*9,life:2400+Math.random()*1200,col:color,ty:pen.ink,next:0,dripped:0}))}
 if(!demo&&!s.wet&&pen.life>.1)thickLook(lowCol(s));if(!demo)settle(lowCol(s),s);if(!demo&&s.wet&&!dyeSplit(s,curCol()))wetWash(s,ink,curCol());if(!demo){stainDry();organicBloom(s,curCol())}if(!demo&&pen.dauber&&s.absorb<.4&&!s.wet){const P=stroke.pts||[],L=clamp(pen.life*1.2);for(let i=0;i<P.length;i+=2)if(Math.random()<.18*L)drip(P[i]+(Math.random()-.5)*R()*1.7,P[i+1]+R()*(.25+Math.random()*.25),.35+Math.random()*Math.random()*1.5*L,{ty:pen.ink,col:curCol(),r:.7+Math.random()*1.3,delay:400+Math.random()*2600})}sagCurtain(s);coffeeRing(s);flushSputter(s);if(stroke.settleL){bleedL.push(stroke.settleL);stroke.settleL=null}fadeLook();fullDrips(ink,s);queueBleed();const isPaint=!DYEINK[pen.ink]&&!ink.chrome&&!ink.etch&&ink.comp!=='multiply';
 if(isPaint){for(const L of bleedL){if(L.slow||L.stain)continue;const lx=L.c.getContext('2d');lx.save();lx.globalCompositeOperation='destination-out';lx.drawImage(stk.c,-L.x,-L.y);lx.restore()}}
 const etW=ink.etch&&ETCHABLE[s.id];if(!isPaint&&ink.comp!=='multiply'&&!etW&&!DYEINK[pen.ink]){/* (dyes are transparent: a fresh dye stroke stacks on what's under it, so overlaps go darker) */if(tmp.c.width!==bg.c.width||tmp.c.height!==bg.c.height){tmp.c.width=bg.c.width;tmp.c.height=bg.c.height}const tx=tmp.x;tx.setTransform(1,0,0,1,0,0);tx.save();sClip(tx);tx.globalCompositeOperation='copy';tx.drawImage(stk.c,0,0);tx.globalCompositeOperation='source-in';tx.drawImage(bg.c,0,0);tx.globalCompositeOperation='source-over';tx.restore();bx.save();bx.setTransform(1,0,0,1,0,0);sClip(bx);bx.drawImage(tmp.c,0,0);bx.restore()}
 if(!etW&&RUNL.c.width&&!DYEINK[pen.ink]){const tx=tmp.x;if(tmp.c.width!==bg.c.width||tmp.c.height!==bg.c.height){tmp.c.width=bg.c.width;tmp.c.height=bg.c.height}tx.setTransform(1,0,0,1,0,0);tx.save();sClip(tx);tx.globalCompositeOperation='copy';tx.drawImage(stk.c,0,0);tx.globalCompositeOperation='destination-in';tx.drawImage(RUNL.c,0,0);tx.globalCompositeOperation='source-in';tx.drawImage(bg.c,0,0);tx.globalCompositeOperation='source-over';tx.restore();bx.save();bx.setTransform(1,0,0,1,0,0);sClip(bx);bx.drawImage(tmp.c,0,0);bx.restore();const rx=RUNL.x;rx.save();rx.setTransform(1,0,0,1,0,0);sClip(rx);rx.globalCompositeOperation='destination-out';rx.drawImage(stk.c,0,0);rx.restore()}
 if(etW)etchWet(s);else{const _sk=wetSoak();bx.save();bx.setTransform(1,0,0,1,0,0);sClip(bx);applyInk(bx,ink,s);if(_sk){bx.drawImage(_sk.c,_sk.x,_sk.y);freeC(_sk.c)}else bx.drawImage(stk.c,0,0);bx.restore();stampGhost(s,ink);try{texPass(s,ink)}catch(_){}}
 if(ink.future){const fx=need(fjL).x;fx.save();fx.setTransform(1,0,0,1,0,0);sClip(fx);fx.drawImage(stk.c,0,0);fx.restore();fjOn=true;fjCol=futDry(s)[0];const pl=pool.x;pl.save();pl.setTransform(1,0,0,1,0,0);sClip(pl);pl.clearRect(0,0,pool.c.width,pool.c.height);pl.restore()}usedPens.add(pen.brand+' '+pen.name);if(ink.etch)makeEtch(s);rimEdge(ink,s);glassShadow(s);if(ink.chrome)makeChrome(s);{const sh=pen.shift;if(shL.c.width||sh){const g=needSh().x;g.save();g.setTransform(1,0,0,1,0,0);sClip(g);g.globalCompositeOperation=sh?'source-over':'destination-out';g.drawImage(stk.c,0,0);g.restore();if(sh)shiftOn=true;shDirty=true}}if(glL.c.width&&!(ink.gloss||pen.gloss||metalPaint())){const g=glL.x;g.save();g.setTransform(1,0,0,1,0,0);sClip(g);g.globalCompositeOperation='destination-out';g.drawImage(stk.c,0,0);g.restore();glDirty=true}if((ink.gloss||pen.gloss||metalPaint())&&s.absorb<.3&&!ink.chrome){const g=needGl().x;g.save();g.setTransform(1,0,0,1,0,0);sClip(g);g.drawImage(stk.c,0,0);g.restore();glossOn=true;glDirty=true}if(ink.gloss&&s.absorb<.3){bx.save();bx.setTransform(1,0,0,1,0,0);sClip(bx);bx.globalCompositeOperation='screen';bx.globalAlpha=.22;bx.drawImage(stk.c,-dpr,-dpr);bx.restore()}
 for(const k in WET){const o=WET[k];if(!o.active||k===(pen.wet||pen.ink)||ink.opacity<.9)continue;o.x.save();o.x.setTransform(1,0,0,1,0,0);sClip(o.x);o.x.globalCompositeOperation='destination-out';o.x.drawImage(stk.c,0,0);o.x.restore()}
 const w=wetC(pen.wet||pen.ink);w.x.save();w.x.setTransform(1,0,0,1,0,0);sClip(w.x);w.x.globalAlpha=1-s.absorb*.5;w.x.drawImage(stk.c,0,0);w.x.globalAlpha=1;w.x.globalCompositeOperation='source-in';w.x.fillStyle='#fff';w.x.fillRect(0,0,w.c.width,w.c.height);w.x.restore();
 const _wt=performance.now();w.active=true;w.t0=_wt;w.until=_wt+TAUS[pen.wet||pen.ink]*4500*(s.wet?2.5:1);
 wetMerge(s);
 {const amt=1-s.absorb*.5,tau=TAUS[pen.wet||pen.ink]*(s.wet?2.5:1)*1.3*(CARRY_WET[carrier()]||1),r=R()*1.05+2,ti=Object.keys(INK).indexOf(pen.ink)+1,col=curCol();const P=stroke.pts||[];for(let i=0;i<P.length;i+=2){markWet(P[i],P[i+1],r,amt,tau);markInk(P[i],P[i+1],r*.8,ti,col,1)}}
 {const _isPearl=!!(pen.props&&pen.props.pearl),mt0=ink.chrome||ink.future||METAL[color]||_isPearl;if(mt0)need(metal);const mx=metal.x;mx.save();mx.setTransform(1,0,0,1,0,0);sClip(mx);const mt=mt0;mx.globalCompositeOperation=mt?'source-over':'destination-out';if(mt)mx.globalAlpha=ink.chrome?1:_isPearl?.62:ink.future?.2:.85;mx.drawImage(stk.c,0,0);mx.restore();if(mt)metalOn=true;shineDirty=true}
 /* Silver nitrate photo-reactive darkening: goes down pale, slowly develops into a deep brownish-black permanent stain */
 if(pen.props&&pen.props.photoDark&&!demo){const P=dpr,pad=4,x0=Math.max(0,Math.floor((stroke.x0-pad)*P)),y0=Math.max(0,Math.floor((stroke.y0-pad)*P)),w=Math.min(stk.c.width-x0,Math.ceil((stroke.x1-stroke.x0+pad*2)*P)),h=Math.min(stk.c.height-y0,Math.ceil((stroke.y1-stroke.y0+pad*2)*P));if(w>=4&&h>=4){const pc=document.createElement('canvas');pc.width=w;pc.height=h;const px=pc.getContext('2d');px.drawImage(stk.c,x0,y0,w,h,0,0,w,h);px.globalCompositeOperation='source-in';px.fillStyle='#261910';px.fillRect(0,0,w,h);bleedL.push({sid:stroke,c:pc,x:x0,y:y0,t0:performance.now()+400,dur:6500,a:.78,comp:'multiply',slow:1})}}
 if(DYEINK[pen.ink]&&ink.comp!=='multiply'){const o=ovl.x;o.save();o.setTransform(1,0,0,1,0,0);sClip(o);o.clearRect(0,0,ovl.c.width,ovl.c.height);o.drawImage(stk.c,0,0);o.globalCompositeOperation='destination-in';o.drawImage(idm.c,0,0);o.restore();o.save();o.setTransform(1,0,0,1,0,0);sClip(o);o.clearRect(0,0,ovl.c.width,ovl.c.height);o.restore()}
 const id=Object.keys(INK).indexOf(pen.ink)+1,sx=stk.x;sx.save();sx.setTransform(1,0,0,1,0,0);sClip(sx);sx.globalCompositeOperation='source-in';sx.fillStyle=`rgb(${id*20},0,0)`;sx.fillRect(0,0,stk.c.width,stk.c.height);sx.restore();
 idm.x.save();idm.x.setTransform(1,0,0,1,0,0);sClip(idm.x);idm.x.drawImage(stk.c,0,0);idm.x.restore();
 {const o=ovl.x;o.save();o.setTransform(1,0,0,1,0,0);o.clearRect(0,0,ovl.c.width,ovl.c.height);o.restore()}
 stk.x.save();stk.x.setTransform(1,0,0,1,0,0);stk.x.clearRect(0,0,stk.c.width,stk.c.height);stk.x.restore();
 if(stroke.bead)toast('Beading — this ink pulls away from the non-porous surface');else if(pen.shake&&pen.mix<.5)toast('Pigment has settled — shake the pen');else if(stroke.low&&pen.valve)toast('Running dry — hold the tip still to re-prime');
 stroke=null;dirty=true;showFlow();renderReact()}

