/* ---------- WET-INK FLOW (thin-film model) ----------
   Ink lands as a film of some height in each 8px cell. A thin film is pinned by surface tension; anything above that
   is mobile and runs downhill, so ink collects at the bottom edges of letters, at slow spots, stroke ends and where you
   held the pen still. When a cell's surplus reaches bare wall below, it leaves as a drip — so drips start where the ink
   actually piled up. Pen speed throws some ink forward. Every cell dries on its own clock: as it dries the ink thickens
   (mobility falls with wetness²) until it freezes in place. */
let fh,fw,ft,fid,fcol,fRad,fk,fcd,fax,fay,frt,fpl,flowOn=false;const FPIN=.32;
function flowAlloc(){const n=GW*GH_;fh=new Float32Array(n);fw=new Float32Array(n);ft=new Float32Array(n).fill(3);fid=new Uint8Array(n);fcol=new Array(n);fRad=new Float32Array(n);fk=new Uint8Array(n);fcd=new Float32Array(n);fax=new Float32Array(n);fay=new Float32Array(n);frt=new Float32Array(n);fpl=new Float32Array(n);flowOn=false}
let LD=null;function ldCtx(){const w=Math.max(1,Math.ceil(baked.c.width/2)),h=Math.max(1,Math.ceil(baked.c.height/2));if(!LD||LD.width!==w||LD.height!==h){LD=document.createElement('canvas');LD.width=w;LD.height=h;const x=LD.getContext('2d');x.setTransform(dpr/2,0,0,dpr/2,0,0)}return LD.getContext('2d')}
/* INK LOAD: how much ink actually soaked into the wall at each spot — this is what a buff can't get out, so the ghost
   follows it (references: buffed stain tags). Light or fast strokes put little down and fade almost away; slow, heavy
   pressure soaks in; and where the nib lands to start a letter it floods, so letter starts stain hardest. */
function loadDeposit(x,y,spd,f){if(demo)return;const c=ldCtx(),r=pen.w*MM/2*curScale;const pe=lastPT==='pen'?pressNow:.45+.55*pressNow;
 let st=1;if(stroke){const lp=stroke.ldP;stroke.ldL=(stroke.ldL||0)+(lp?Math.hypot(x-lp.x,y-lp.y):0);stroke.ldP={x,y};st=1+2.4*Math.exp(-stroke.ldL/(r*1.6+2))}
 c.globalAlpha=Math.min(.6,(.003+.2*Math.pow(pe,2.4))*Math.min(1.4,f)*st/(1+Math.min(3,spd)*1.7));c.fillStyle='#fff';c.beginPath();c.arc(x,y,r*(st>1.4?1.08:1),0,TAU);c.fill();c.globalAlpha=1}
/* steel-tip paint pens lay a thick self-levelling line of enamel-like paint: glossy, with a raised edge */
function metalPaint(){return !!pen.metal&&!DYEINK[pen.ink]&&!INK[pen.ink].chrome&&!INK[pen.ink].solid}
function flowable(){const k=INK[pen.ink];return !!k&&!k.solid&&!k.etch&&!pen.dauber&&(!pen.metal||metalPrimed())}
/* a steel rollerball only feeds a run once it's fully primed — then the ball floods and it drips like any other pen, just a bit less */
function metalPrimed(){return pen.squeeze?(pen.sat??0)>=.9:flowNow(null)>=.95}
/* where the painted edge of the current nib is, below a point: walks across the tip at the given offset and returns the
   lowest point that is still ink (just inside it), using the real tip shape — a rotated chisel or a round nib */
function tipEdge(cx,cy,ox,oy,jit){const G=gDir(),vt=Math.abs(G.y)>=Math.abs(G.x),ux=vt?0:Math.sign(G.x)||1,uy=vt?Math.sign(G.y)||1:0,nx=-uy,ny=ux,sc=curScale;let dx=(ox-cx)*nx+(oy-cy)*ny+(jit||0),lo,hi;
 if(pen.tip==='chisel'){const a=angle*Math.PI/180,ca=Math.cos(a),sa=Math.sin(a),hw=pen.w*MM*sc*(1-leanNow*.28)/2,ht=Math.max(.5,pen.th*MM*Math.max(.35,sc)*(1-leanNow*.6)/2),K=[[nx*ca+ny*sa,ux*ca+uy*sa,hw],[-nx*sa+ny*ca,-ux*sa+uy*ca,ht]],ext=hw*Math.abs(K[0][0])+ht*Math.abs(K[1][0]);
  dx=clamp(dx,-ext*.8,ext*.8);lo=-1e9;hi=1e9;for(const [na,ga,h] of K){if(Math.abs(ga)<1e-4)continue;const u=(h-dx*na)/ga,v=(-h-dx*na)/ga;lo=Math.max(lo,Math.min(u,v));hi=Math.min(hi,Math.max(u,v))}if(hi<lo||hi>1e8){lo=hi=0}}
 else{const r=pen.w*MM/2*sc*(pen.metal?1:1-leanNow*.32);dx=clamp(dx,-r*.8,r*.8);hi=Math.sqrt(r*r-dx*dx);lo=-hi}
 const sAl=hi-Math.min(1.5,(hi-lo)*.25);return [cx+dx*nx+sAl*ux,cy+dx*ny+sAl*uy]}
const DRYFULL=1.55,FULLK=1.65;function flowDeposit(x,y,spd,f,s,dwell){if(!fh||demo||!upright||!flowable())return;/* Bernoulli nozzle discharge + speed/dwell local wetness: fast light dry strokes stay clean; slow, pressed, or paused spots pool and drip */const ink=INK[pen.ink],fl=fluidOf(pen.ink),r=R()*curScale*.9,
  dw=Math.max(0,dwell||(stroke&&stroke.dwell)||0),
  /* Kinematic turn/corner pooling: sharp bends & reversals decelerate the nib and pile up 2.4x film thickness */
  turnBoost=(()=>{if(!stroke||!stroke.pts||stroke.pts.length<6)return 1;const P=stroke.pts,n=P.length;const ax=P[n-4]-P[n-6],ay=P[n-3]-P[n-5],bx=P[n-2]-P[n-4],by=P[n-1]-P[n-3],la=Math.hypot(ax,ay),lb=Math.hypot(bx,by);if(la<1.5||lb<1.5)return 1;const dot=clamp((ax*bx+ay*by)/(la*lb),-1,1);return 1+Math.pow(clamp((.78-dot)/1.78,0,1),1.25)*1.40})(),
  /* Wide speed-to-thickness contrast (h ~ Q/v): fast whips stay lean unless heavy over-squeeze (>108%) floods the nozzle */
  sqFlood=pen.squeeze?clamp(((pen.sat??0)-1)/.5,0,1):0,/* any squeeze over 100% floods the nib a little: more the higher it goes */
  slowBase=1/(1+Math.pow(Math.min(4.0,spd)*1.85,1.62)),
  /* a full bottle (100%) still lays down a wet film at tag speed: it shouldn't take slowing down to get a few drips at the end */satFloor=pen.squeeze?clamp(((pen.sat??0)-.9)/.1)*.55+((pen.sat??0)>1?.14:0):0,
  slow=Math.max(slowBase,sqFlood*.68,satFloor)*turnBoost,dwellBoost=1+Math.min(2.6,dw*2.15),
  dP=Math.max(.05,(pen.squeeze?(.28+pressNow*1.35)*(0.45+.55*(pen.sat??0)):pen.valve?(.22+Math.max(0,pen.flow-.4)*1.35+pressNow*.6):(.18+pressNow*.42))*(pen.adjust?Math.pow((pen.vs||3)/3,1.25):1)),
  vBern=fl.cd*Math.sqrt(2*dP/Math.max(.4,fl.rho)),
  juice=(pen.valve?.65+Math.max(0,pen.flow-.65)*1.4:1)*(pen.squeeze?.68+(pen.sat??0)*.32+pressNow*.52:1)*(pen.adjust?Math.pow((pen.vs||3)/5,1.5)*1.5:1)*clamp(.56+.44*vBern,.48,1.5),
  lvl=pen.valve?pen.flow:pen.squeeze?(pen.sat??0):0,pF=clamp((pressNow-.42)/.45),prK=clamp((lvl-.90)/.10),sqOver=pen.squeeze?Math.max(0,lvl-1):0,sqDrip=pen.squeeze?(lvl<.16?0:lvl<1?(clamp((lvl-.14)/.22,0,1)*(.56+.44*Math.pow(clamp(lvl),.85))):(1.45+sqOver*1.3)):1,
  /* on dry walls, require either real pressure, slow speed, or dwell to flood; wet walls still run freely */
  fw0=prK*(s.wet?(.65+.35*pF):(.24+.76*Math.max(pF,pen.squeeze?.3:0,clamp(sqOver*1.6),clamp(1-spd*1.4)*.55,clamp(dw/.35)*.85))),
  dryCalm=s.wet?1:.62,
  dk0=ink.drip??.6,amt=.078*sqDrip*dryCalm*dwellBoost*Math.pow(clamp(f,0,1.6),2)*(.55+pressNow*.85)*(.28+.72*Math.max(pF,prK*.68))*(1+prK*.38)*Math.pow(dripLife(),1.3)*juice*(dk0+fw0*(Math.max(dk0,.55)*FULLK*(1.2+Math.max(0,lvl-1)*1.7)-dk0))*(1-s.absorb*.85)*slow*(R()/7.5+.42+fw0*Math.max(0,DRYFULL-R()/7.5-.42))*(s.wet?2.1:1)*WX.run*(ink.chrome?.5:1)*(pen.metal?.65:pen.tip==='bullet'&&!s.wet?1.2:1)*(pen.squeeze&&lvl>1?1+.3*clamp(sqOver/.1):1),tau=(2.2+(TAUS[pen.ink]||1.5)*2.6)*(pen.props&&pen.props.tauMul?pen.props.tauMul:1),id=Object.keys(INK).indexOf(pen.ink)+1,col=curCol(),thick=THICK()?1:0;
 /* momentum: part of the ink is thrown ahead along the stroke */if(stroke){stroke.lv=Math.max(stroke.lv||0,lvl);stroke.pmax=Math.max(stroke.pmax||0,pressNow)}const S=stroke,v=S&&S.v?Math.min(2.5,S.v):0,ax=v>.05?S.vx/v:0,ay=v>.05?S.vy/v:0,ahead=Math.min(r*1.1,v*r*.7);
 const put=(px,py,a,rr,own)=>{for(let gy=Math.max(0,Math.floor((py-rr)/C));gy<=Math.min(GH_-1,Math.floor((py+rr)/C));gy++)for(let gx=Math.max(0,Math.floor((px-rr)/C));gx<=Math.min(GW-1,Math.floor((px+rr)/C));gx++){const d=Math.hypot(gx*C+C/2-px,gy*C+C/2-py);if(d>rr+C*.5)continue;const i=gy*GW+gx,_ov=(inkG[i]||fh[i]>.05)?(1.45+.55*prK):1;fh[i]+=a*(1-d/(rr+C))*_ov;fw[i]=1;ft[i]=tau;fid[i]=id;fcol[i]=thinCol(pen.ink,col,.3);fRad[i]=R();fk[i]=thick;if(own||!frt[i]||fh[i]<=a){const e=tipEdge(x,y,gx*C+C/2,gy*C+C/2,(Math.random()-.5)*C*.6);fax[i]=e[0];fay[i]=e[1];frt[i]=1}}};
 put(x,y,amt*.7,r,1);if(ahead>1)put(x+ax*ahead,y+ay*ahead,amt*.3,r*.7,0);flowOn=true}
/* A FIRM TOUCHDOWN STARTS A DRIP. Pressure at the very instant of contact is unreliable (the finger patch is still small and the reading is
   averaged with the last lift-off), so the landing is judged from the raw peak over the first ~90 ms. If it was a firm press and the nib
   has ink, a bead is seeded on the nib's lower edge, sized against this ink's own breakaway threshold (so thick paint makes a slow fat
   drop and thin ink a small one) and the thin-film solver releases it. It does NOT need the squeeze above 100%: a new letter re-grabs flow.
   A firm touchdown also tops the squeeze back up toward (never past) 100%, so a long tag doesn't run the bar flat. */
function landPulse(S){
 if(!S||S.landDone)return;S.landDone=1;
 /* RE-GRAB: every new stroke squeezes the bottle again as the finger lands. How far it pulls Squeeze % back up depends on how hard
    you press: a light touch tops it up a little, a firm one brings it most of the way back. Only ever lifts a level that has sagged. */
 if(pen.squeeze&&!demo&&pen.life>0){const pk0=Math.max(S.pPeak||0,pressNow),h0=clamp((pk0-.2)/.6),s0=pen.sat??0,tgt=Math.min(1.05,.5+.55*h0);
  if(s0<tgt){pen.sat=Math.min(1.6,s0+(tgt-s0)*(.3+.5*h0)*lifeF());S.regrab=pen.sat-s0;showFlow()}
  /* a firm landing is a priming squeeze: every new letter put down with pressure pushes Squeeze % further up (a light touch adds nothing) */
  if(h0>.25){const s1=pen.sat??0;if(s1<1)pen.sat=Math.min(1,s1+(.04+.16*h0)*lifeF());S.regrab=(S.regrab||0)+(pen.sat-s1);showFlow()}}
 if(demo||!fh||!upright||!S.p0||!flowable())return;
 /* how hard the nib met the wall. A phone only reports pressure from how much fingertip is on the glass, so an ordinary firm landing
    counts from about a third of the scale. On a squeezer above 100% the bottle is already pushing ink into the ball, so even a light
    touchdown puts a bead on the wall (most letters, not every one) */
 const sat=pen.squeeze?(pen.sat??0):pen.valve?pen.flow:1,pk=Math.max(S.pPeak||0,pressNow),
  hard=Math.max(clamp((pk-.32)/.33),pen.squeeze?clamp((sat-.98)/.14)*.75:0);if(hard<=.05||Math.random()>.4+.6*hard)return;
 const
  load=pen.squeeze?clamp((sat-.2)/.35):pen.valve?clamp((pen.flow-.3)/.45):clamp(flowNow(null)),
  land=hard*load*dripLife()*Math.min(1.2,INK[pen.ink].drip??.6)*(pen.valve?.7:1)*(pen.metal?.65:1);S.land=land;
 if(land<.12)return;
 const G=gDir();if(G.flat||G.m<.14)return;
 const s=S.s||surfAt(S.p0.x,S.p0.y),fl=fluidOf(pen.ink),thick=THICK()?1:0,gEff=Math.max(.3,gEffOf(G.m)),
  pin=FPIN*(.68+.32*fl.gamma),thr=(s.wet?(thick?.74:.42):(thick?.92:.58))*fl.gamma+fl.ty*.60,
  target=pin+(thr/(fl.rho*gEff))*(1.04+.45*land)*(.94+Math.random()*.12),
  e=tipEdge(S.p0.x,S.p0.y,S.p0.x,S.p0.y,0),gx=Math.floor(e[0]/C),gy=Math.floor(e[1]/C),
  vt=Math.abs(G.y)>=Math.abs(G.x),lx=vt?1:0,ly=vt?0:1,
  tau=(2.2+(TAUS[pen.ink]||1.5)*2.6)*(pen.props&&pen.props.tauMul?pen.props.tauMul:1),id=Object.keys(INK).indexOf(pen.ink)+1,col=curCol();
 for(const k of [0,-1,1]){const x=gx+lx*k,y=gy+ly*k;if(x<0||y<0||x>=GW||y>=GH_)continue;const i=y*GW+x,t=k?target*.55:target;
  if(fh[i]<t)fh[i]=t;fw[i]=1;ft[i]=tau;fid[i]=id;fcol[i]=thinCol(pen.ink,col,.3);fRad[i]=R();fk[i]=thick;
  if(!k){fax[i]=e[0];fay[i]=e[1];frt[i]=1}}
 flowOn=true;dirty=true}
/* ...and when a firmly-landed stroke is finished without a run of its own, the ink that pooled where it touched down gutters down its own
   stroke and lets go from the lowest edge (drip() walks down the stroke's own ink to its underside) */
function landRun(S){
 if(!S||!S.land||S.landRan||demo||!upright||!S.p0||tool!=='draw'||!flowable())return;S.landRan=1;
 if(Math.random()>clamp((S.land-.18)/.45))return;
 if(drips.some(d=>d.sid===S.sid&&!d.soft&&!d.wash))return;
 drip(S.p0.x,S.p0.y+R()*.4,Math.min(1.6,.5+.8*S.land))}
function flowStep(dt){if(!flowOn||!fh)return;dt=Math.min(dt,.05);const G=gDir(),vert=Math.abs(G.y)>=Math.abs(G.x),ddx=vert?0:Math.sign(G.x),ddy=vert?Math.sign(G.y):0,ldx=-ddy,ldy=ddx,keys=Object.keys(INK),now=performance.now();let any=false;
 /* Navier-Stokes thin-film lubrication solver: flux Q ~ (rho*g*h^3)/(3*mu_eff) + lateral pressure-gradient spreading */
 const ys=ddy>0?[GH_-1,-1,-1]:[0,GH_,1],xs=ddx>0?[GW-1,-1,-1]:[0,GW,1];
 for(let gy=ys[0];gy!==ys[1];gy+=ys[2])for(let gx=xs[0];gx!==xs[1];gx+=xs[2]){const i=gy*GW+gx;if(fh[i]<=0)continue;any=true;
  fw[i]*=Math.exp(-dt/(ft[i]*(fpl[i]>0?4:1)));/* a swelling bead is thick enough to hold its solvent, so it doesn't dry out while it waits to drop */if(fw[i]<.04){fh[i]=0;fid[i]=0;fcol[i]=null;fRad[i]=0;fk[i]=0;frt[i]=0;continue}
  const ty=keys[fid[i]-1]||pen.ink,fl=fluidOf(ty),pin=FPIN*(.68+.32*fl.gamma);
  const ex=fh[i]-pin;if(ex<=0)continue;
  const s=surfAt(gx*C+C/2,gy*C+C/2),muEff=fl.mu/Math.max(.08,Math.pow(fpl[i]>0?Math.max(fw[i],.6):fw[i],1.65));
  /* Phone laid flat: no downhill pull — excess wet ink pools & melts isotropically into the tag */
  if(G.flat||G.m<.14){
   if(ex>.08){
    for(const [ox,oy,wt] of [[-1,0,1],[1,0,1],[0,-1,1],[0,1,1],[-1,-1,.7],[1,-1,.7],[-1,1,.7],[1,1,.7]]){const lx=gx+ox,ly=gy+oy;if(lx>=0&&lx<GW&&ly>=0&&ly<GH_){const lj=ly*GW+lx;if(inkG[lj]&&fh[i]-fh[lj]>.06){const ql=(fh[i]-fh[lj])*Math.min(.14,(.34/muEff)*dt*(1-s.rough*.35))*wt;const wasE=fh[lj]<=0;fh[i]-=ql;fh[lj]+=ql;fw[lj]=Math.max(fw[lj],fw[i]*.97);ft[lj]=ft[i];fid[lj]=wasE?fid[i]:(fid[lj]||fid[i]);fcol[lj]=wasE?fcol[i]:(fcol[lj]||fcol[i]);fRad[lj]=wasE?fRad[i]:(fRad[lj]||fRad[i]);fk[lj]=wasE?fk[i]:(fk[lj]||fk[i])}}}
   }
   continue;
  }
  /* cubic thin-film scaling (h^3) from Poiseuille/Navier-Stokes wall boundary condition */
  const hEff=Math.min(2.2,ex+.18),gEff=gEffOf(G.m),flux=(fl.rho*gEff*hEff*hEff*hEff)/(3*muEff)*(1-s.absorb*.82)*(1-s.rough*.52);
  const noFall=flux<.008;
  /* lateral pressure equalization inside wet letters (dP ~ rho*dh) */
  if(ex>.16){for(const sd of [-1,1]){const lx=gx+ldx*sd,ly=gy+ldy*sd;if(lx>=0&&lx<GW&&ly>=0&&ly<GH_){const lj=ly*GW+lx;if(inkG[lj]&&fh[i]-fh[lj]>.12){const ql=(fh[i]-fh[lj])*Math.min(.22,(.42/muEff)*dt*(1-s.rough*.4));const wasE=fh[lj]<=0;fh[i]-=ql;fh[lj]+=ql;fw[lj]=Math.max(fw[lj],fw[i]*.96);ft[lj]=ft[i];fid[lj]=wasE?fid[i]:(fid[lj]||fid[i]);fcol[lj]=wasE?fcol[i]:(fcol[lj]||fcol[i]);fRad[lj]=wasE?fRad[i]:(fRad[lj]||fRad[i]);fk[lj]=wasE?fk[i]:(fk[lj]||fk[i])}}}}
  if(noFall){if(fpl[i]>0)fpl[i]=Math.max(0,fpl[i]-dt);continue}const nx=gx+ddx,ny=gy+ddy;if(nx<0||ny<0||nx>=GW||ny>=GH_){fh[i]=pin;continue}const j=ny*GW+nx;let q=ex*Math.min(1,flux*8.8*dt);
  /* DIAGONAL TILT: gravity has a sideways part too. Hand that share of the sag to the neighbour on the other axis (only while it's still inside the letter) */
  {const gd=vert?Math.abs(G.y):Math.abs(G.x),gs=vert?Math.abs(G.x):Math.abs(G.y);if(gs>.12){const sh=gs/(gd+gs),n2x=gx+(vert?(G.x>0?1:-1):0),n2y=gy+(vert?0:(G.y>0?1:-1));if(n2x>=0&&n2y>=0&&n2x<GW&&n2y<GH_){const j2=n2y*GW+n2x;if(inkG[j2]||fh[j2]>0){const q2=q*sh,wasE2=fh[j2]<=0;fh[i]-=q2;fh[j2]+=q2;fw[j2]=Math.max(fw[j2],fw[i]*.98);ft[j2]=ft[i];fid[j2]=wasE2?fid[i]:(fid[j2]||fid[i]);fcol[j2]=wasE2?fcol[i]:(fcol[j2]||fcol[i]);fRad[j2]=wasE2?fRad[i]:(fRad[j2]||fRad[i]);fk[j2]=wasE2?fk[i]:(fk[j2]||fk[i]);q*=1-sh}}}}
  if(inkG[j]||fh[j]>0){/* still inside the letter: surplus sags down the wet film */const wasE=fh[j]<=0;if(wasE)frt[j]=0;fh[i]-=q;fh[j]+=q;fw[j]=Math.max(fw[j],fw[i]*.98);ft[j]=ft[i];fid[j]=wasE?fid[i]:(fid[j]||fid[i]);fcol[j]=wasE?fcol[i]:(fcol[j]||fcol[i]);fRad[j]=wasE?fRad[i]:(fRad[j]||fRad[i]);fk[j]=wasE?fk[i]:(fk[j]||fk[i])}
  /* Bond-number breakaway: gravitational head rho*g*ex must overcome capillary pinning gamma + yield stress ty */
  /* POOL FIRST, THEN RUN: surplus that reaches the letter's lower edge doesn't fall the instant it arrives. It gathers into a swelling
     bead held by surface tension, and only lets go once it has sat there long enough to get heavy: a heavier overload goes sooner,
     thick or syrupy ink hangs on longer, and while it waits more ink sags down into it, so the run that finally drops is a fuller one */
  else if(ex*fl.rho*gEff>(s.wet?(fk[i]?.74:.42):(fk[i]?.92:.58))*fl.gamma+fl.ty*.60&&now>fcd[i]&&(frt[i]>0||lmAt(gx*C+C/2,gy*C+C/2))&&(()=>{const thrV=(s.wet?(fk[i]?.74:.42):(fk[i]?.92:.58))*fl.gamma+fl.ty*.60,over=ex*fl.rho*gEff/Math.max(.05,thrV),muP=clamp(fl.mu,.4,2.2),poolT=(1.25+.75*muP)*(fk[i]?1.4:1)*(s.wet?.75:1)/Math.min(1.45,Math.max(1,over));/* even thin, flooded ink sits on the edge for about a second before it lets go; thick paint for two or more */fpl[i]+=dt;return fpl[i]>=poolT})()){
   const pooled=Math.min(2.5,fpl[i]);fpl[i]=0;
   const vol=(fk[i]?Math.min(3.6,.65+ex*1.45):Math.min(3.0,.32+ex*1.1))*(.45+.55*fw[i]),rr=fk[i]?Math.max(1.5,Math.min(2.8,fRad[i]*(.09+Math.random()*.08))):DYEINK[ty]?Math.max(.5,Math.min(1.3,fRad[i]*(.025+Math.random()*.05))):Math.max(.7,Math.min(1.9,fRad[i]*(.04+Math.random()*.09)));
   let ox=gx*C+C/2+(Math.random()-.5)*C*.55-ddx*C*.45,oy=gy*C+C/2-ddy*C*.45;if(frt[i]>0){ox=fax[i];oy=fay[i]}
   /* pigment drag: gravity pulls pigment downward through the wet letter body into the drip neck */
   /* Rayleigh-Taylor capillary spacing: surface tension pulls underside beads into spaced lobes (lambda ~ sqrt(gamma/rho)) */
   const muK=clamp(fl.mu,.4,2.2),rtMin=Math.max(5.5,Math.min(24,7.5*Math.sqrt(Math.max(.35,fl.gamma)/Math.max(.5,fl.rho))*(.72+.3*muK)));/* thick paints hang in fewer, wider-spaced lobes; thin dyes in many close ones */
   let tooClose=false;for(let q=drips.length-1;q>=0;q--){const dq=drips[q];if(!dq.soft&&!dq.wash&&Math.hypot(dq.x-ox,dq.y-oy)<rtMin){tooClose=true;break}}
   if(tooClose){fcd[i]=now+220;continue}
   const _J=fk[i]||DYEINK[ty]||ty===pen.ink?juiceK():0,_rf=refRun(fRad[i],Math.min(4.4,rr*1.32*(.72+.3*muK)),_J);
   /* the run belongs to the letter it hangs from, not to whatever letter is being drawn now (a pooled bead often lets go while you're
      already on the next one, and a run tagged with the new letter is thrown away because it isn't on that letter's ink) */
   let _sid=0;for(let k=0;k<=8&&!_sid;k+=2)_sid=lmAt((ox-ddx*k)|0,(oy-ddy*k)|0);
   drip(ox,oy,vol*(.78+.26*muK)*(1+.18*pooled)*(_rf.volK||1),{sid:_sid||undefined,ty,col:fcol[i]||curCol(),r:_rf.r*(1+.22*clamp(pooled-.6,0,1)),rMax:_rf.rMax,maxT:_rf.maxT,thick:!!fk[i],visc:.35+.65*fw[i],src:1,pool:1,srcCell:i,w:fRad[i]});fh[i]-=Math.min(ex,vol*(fk[i]?.8:.55));fcd[i]=now+(fk[i]?820:360)+Math.random()*540}}
 flowOn=any}
let LM=new Uint16Array(1),LMW=1,LMH=1,lmSeq=1;
function lmAlloc(){LMW=Math.ceil(W/2)+1;LMH=Math.ceil(H/2)+1;LM=new Uint16Array(LMW*LMH);SM=new Uint8Array(LMW*LMH)}
/* where the letter being written right now has paint (marked as the nib goes down), so a run never shows through it */
let SM=new Uint8Array(1),smDirty=false;function markSM(x,y,r){smDirty=true;const r2=Math.max(1,r);for(let cy=Math.max(0,(y-r2)>>1);cy<=Math.min(LMH-1,(y+r2)>>1);cy++)for(let cx=Math.max(0,(x-r2)>>1);cx<=Math.min(LMW-1,(x+r2)>>1);cx++){const dx=cx*2-x,dy=cy*2-y;if(dx*dx+dy*dy<=r2*r2)SM[cy*LMW+cx]=1}}
/* mark exactly the nib's footprint (a chisel is a thin rotated bar, not a disc) so a run beside the stroke isn't hidden
   where there's no paint — that left runs starting with a gap */
function markTipSM(x,y){if(pen.tip==='chisel'){const fr=pen.metal?0:pen.fray,rd=pen.round||0,a=angle*Math.PI/180,w=pen.w*MM*(1+fr*.15)*curScale*(1+rd*.1)*(1-leanNow*.28)*.92,t=Math.max(1.2,pen.th*MM*(1+fr*.5)*Math.max(.35,curScale)*(1+rd*.8)*(1-leanNow*.6)*.85),ca=Math.cos(a),sa=Math.sin(a),n=Math.max(1,Math.ceil(w/Math.max(1.5,t)));for(let i=0;i<=n;i++){const u=-w/2+w*i/n;markSM(x+ca*u,y+sa*u,t/2)}}
 else markSM(x,y,pen.w*MM/2*curScale*(pen.metal?1:1-leanNow*.32)*.88)}
const smAt=(x,y)=>smDirty&&x>=0&&y>=0&&x<W&&y<H?SM[(y>>1)*LMW+(x>>1)]:0;function clearSM(){if(smDirty){SM.fill(0);smDirty=false}}
const lmAt=(x,y)=>{const i=(y>>1)*LMW+(x>>1);return x>=0&&y>=0&&x<W&&y<H?LM[i]:0};const lmOwn=(x,y,sid)=>{const v=lmAt(x,y);return sid?v>=sid:!!v};
/* remember where this stroke's ink is (read once from the stroke layer when it's finished) */
function markLetters(){if(demo||!stroke)return;const P=dpr,x0=Math.max(0,Math.floor(stroke.x0)),y0=Math.max(0,Math.floor(stroke.y0)),x1=Math.min(W-1,Math.ceil(stroke.x1)),y1=Math.min(H-1,Math.ceil(stroke.y1));if(x1<=x0||y1<=y0)return;
 const X=Math.floor(x0*P),Y=Math.floor(y0*P),w=Math.max(1,Math.min(stk.c.width-X,Math.ceil((x1-x0)*P))),h=Math.max(1,Math.min(stk.c.height-Y,Math.ceil((y1-y0)*P)));let a;try{a=stk.x.getImageData(X,Y,w,h).data}catch(_){return}
 /* the letter's edge is where it visibly is: half the stroke's own strength, so a faint feathered fringe doesn't push the edge out (runs then start right at the paint) */let amx=0;for(let i=3;i<a.length;i+=16)if(a[i]>amx)amx=a[i];const thr=Math.max(22,amx*.45);
 for(let cy=y0>>1;cy<=y1>>1;cy++)for(let cx=x0>>1;cx<=x1>>1;cx++){const px=Math.floor((cx*2+1)*P)-X,py=Math.floor((cy*2+1)*P)-Y;if(px<0||py<0||px>=w||py>=h)continue;if(a[(py*w+px)*4+3]>thr)LM[cy*LMW+cx]=stroke.sid||lmSeq}/* low threshold: see-through dye inks are laid down faint in the stroke layer but still count as letter */
 /* close thin gaps (starved streaks, scratchy nib lines) so a run never 'comes out' through a hairline inside the letter */
 {const cy0=Math.max(0,(y0>>1)-1),cy1=Math.min(LMH-1,(y1>>1)+1),cx0=Math.max(0,(x0>>1)-1),cx1=Math.min(LMW-1,(x1>>1)+1),G=4;const add=[];
  for(let cy=cy0;cy<=cy1;cy++)for(let cx=cx0;cx<=cx1;cx++){const i=cy*LMW+cx;if(LM[i])continue;let u=0,d2=0,l=0,r=0;for(let k=1;k<=G;k++){if(!u&&cy-k>=0&&LM[i-k*LMW])u=1;if(!d2&&cy+k<LMH&&LM[i+k*LMW])d2=1;if(!l&&cx-k>=0&&LM[i-k])l=1;if(!r&&cx+k<LMW&&LM[i+k])r=1}if((u&&d2)||(l&&r))add.push(i)}for(const i of add)LM[i]=stroke.sid||lmSeq}}
function initWater(){GW=Math.ceil(W/C)+1;GH_=Math.ceil(H/C)+1;water=new Float32Array(GW*GH_);inkG=new Uint8Array(GW*GH_);colG=new Array(GW*GH_);washG=new Float32Array(GW*GH_);buffPass=new Float32Array(GW*GH_);rainLeft=new Float32Array(GW*GH_);wg=new Float32Array(GW*GH_);wt=new Float32Array(GW*GH_).fill(1);flowAlloc();lmAlloc();waterCv.width=GW;waterCv.height=GH_;waterOn=false}
const waterAt=(x,y)=>{const i=Math.floor(y/C)*GW+Math.floor(x/C);return water[i]||0};
const surfAt=(x,y)=>{let s=bands[bands.length-1].s;for(const b of bands)if(x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h){s=b.s;break}return !s.wet&&waterOn&&waterAt(x,y)>.15?wetOf(s):s};

