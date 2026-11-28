/* ---------- drawing ---------- */
let demo=false,stroke=null,dirty=true,downT=0,lastMove=0,last=null;
const R=()=>pen.tip==='chisel'?pen.w*MM/2:pen.w*MM/2;
const lifeF=()=>Math.min(1,pen.life/.15);
/* HOW THE PEN IS HELD: ink is a liquid in the barrel. Point the tip uphill (phone tipped so gravity runs up the wall)
   and it drains back from the nib — the line starves; tip down, it feeds harder. */
function tiltFeed(){if(!grav.live||gMode!=='auto')return 1;const G=gDir();return clamp(1+G.y*.12+(G.y<0?G.y*.75:0),.25,1.12)}
function flowNow(e){return flowNow0(e)*tiltFeed()}
function flowNow0(e){
 if(pen.valve)return pen.flow;
 if(pen.squeeze){const sk=stroke&&stroke.sunk&&performance.now()-stroke.sunk<750?.28:1,sat=pen.sat??0,satK=clamp(.14+sat*.86,.14,1),extra=Math.max(0,sat-1)*.9;if(e&&e.pointerType==='pen'&&e.pressure>0)return (clamp(.3+e.pressure)*satK+extra)*lifeF()*sk;return (Math.min(1,.85+(performance.now()-downT)/120)*satK+extra)*lifeF()*sk}
 return lifeF()}
const DYEINK={alcohol:1,stain:1,bleed:1,flow:1,future:1};let tipCtx=null,saidMush=0,saidSunk=0,saidRev=0;
let leanSet=0,leanSen=0,leanNow=0;
let curScale=1,tipScale=1,flickStarve=0,pressNow=.35,pBase=0,saidPress=0,saidSolv=0;
/* Apple Pencil: a normal grip already sits 30-55 deg off upright. Only a deliberate extra lean past that counts as leaning the nib. */
function readLean(e){let l=-1;if(e.pointerType==='pen'){let tl=-1;if(typeof e.altitudeAngle==='number'&&e.altitudeAngle>0&&e.altitudeAngle<Math.PI/2+.01)tl=90-e.altitudeAngle*180/Math.PI;else if(e.tiltX||e.tiltY){const tx=Math.tan((e.tiltX||0)*Math.PI/180),ty=Math.tan((e.tiltY||0)*Math.PI/180);tl=Math.atan(Math.hypot(tx,ty))*180/Math.PI}if(tl>=0)l=clamp((tl-55)/25)}if(l>=0)leanSen=leanSen*.7+l*.3;leanNow=Math.max(leanSet,leanSen)}
let lastPT='pen';function readPress(e){if(!e)return;lastPT=e.pointerType||lastPT;readLean(e);let p=-1;if(e.pointerType==='pen'&&e.pressure>0)p=e.pressure;else if(e.pointerType==='touch'){const sz=((e.width||0)+(e.height||0))/2;
 if(sz>2){if(!pBase||sz<pBase)pBase=sz;else pBase+=(sz-pBase)*.0008;p=clamp((sz/pBase-1)/.42)*.82+.18}if(e.pressure>0&&e.pressure!==.5&&e.pressure!==1)p=Math.max(p,e.pressure)}
 if(p>=0){if(stroke&&!stroke.landDone){stroke.pPeak=Math.max(stroke.pPeak||0,p);if(stroke.tDown&&(e.timeStamp||performance.now())-stroke.tDown>=90){const S1=stroke;setTimeout(()=>{if(stroke===S1)landPulse(S1)},0)}}pressNow=pressNow*.6+p*.4;if(!saidPress&&p>.65){saidPress=1;toast('Pressure picked up — press harder for fatter, wetter lines')}}}
function mixHex(a,b,t){const A=hex(a),B=hex(b);return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('')}
/* BLACK INK UNDERTONES (real formulation data): dye blacks are blends — a yellow-brown dye with black, violet and/or blue
   dyes. Fresh and thick they read black; where the film is thin (edges, runs, buff washes) or after the yellow-brown part
   fades, the undertone shows. Staining/buff-proof blacks lean on crystal/methyl violet -> violet; general alcohol dye blacks
   -> blue-black; pigment paints (carbon black in oil/acrylic/paint sticks) don't shift at all. */
const CAST=(ty,col)=>{if(!col||col[0]!=='#'||lum(hex(col))>.22)return null;if(ty==='stain'||ty==='bleed')return '#4a3592';if(ty==='alcohol'||ty==='flow'||ty==='future')return '#2c3d84';return null};
const thinCol=(ty,col,k)=>{const c=CAST(ty,col);return c?mixHex(col,c,k):col};
/* a nib that picked up another wet colour writes a mix of the two (pigment mixing, so yellow + blue goes green, not grey), clearing as it writes on */
const _ccK={k:'',v:''};const curCol=()=>{if(!(pen.dirtAmt>.05))return color;const t=Math.round(pen.dirtAmt*10)/10,k=color+pen.dirtCol+t;if(_ccK.k!==k){_ccK.k=k;try{_ccK.v=kmMix([{c:color,ts:1-t},{c:pen.dirtCol,ts:t}])}catch(_){_ccK.v=mixHex(color,pen.dirtCol,t)}}return _ccK.v};
function tipPath(x,c,y){const ctx=tipCtx||stk.x,fr=pen.metal?0:pen.fray,sc=curScale;ctx.beginPath();
 if(pen.tip==='chisel'){const rd=pen.round||0,a=angle*Math.PI/180,w=pen.w*MM*(1+fr*.15)*sc*(1+rd*.1)*(1-leanNow*.28),t=pen.th*MM*(1+fr*.5)*Math.max(.35,sc)*(1+rd*.8)*(1-leanNow*.6);ctx.save();ctx.translate(c,y);ctx.rotate(a);if(rd>.05&&ctx.roundRect)ctx.roundRect(-w/2,-t/2,w,t,Math.min(t,w)/2*rd);else ctx.rect(-w/2,-t/2,w,t);
  if(fr>.4&&Math.random()<(fr-.4)*.35){/* a loose fibre on a wrecked nib: the odd fleck right at the edge, not a spray */const u=(Math.random()-.5)*w,v=(Math.random()<.5?-1:1)*(t/2+Math.random()*fr*1.6),rr=.4+fr*.6;ctx.moveTo(u+rr,v);ctx.arc(u,v,rr,0,TAU)}ctx.restore()}
 else{const r=pen.w*MM/2*(1+fr*.3)*sc*(pen.metal?1:1-leanNow*.32);if(leanNow>.05&&!pen.metal&&ctx.ellipse){const la=stroke&&stroke.v>.05?Math.atan2(stroke.vy,stroke.vx):0;ctx.ellipse(c,y,r,r*(1-leanNow*.45),la,0,TAU)}else ctx.arc(c,y,r,0,TAU);if(fr>.4&&Math.random()<(fr-.4)*.35){const a=Math.random()*TAU,d=r+Math.random()*fr*1.6,rr=.4+fr*.5;ctx.moveTo(c+Math.cos(a)*d+rr,y+Math.sin(a)*d);ctx.arc(c+Math.cos(a)*d,y+Math.sin(a)*d,rr,0,TAU)}}}
function bleedAt(x,y,r,al,gx,gy=1){const ctx=stk.x,g=ctx.createRadialGradient(0,0,0,0,0,r),rgb=hex(color).join(',');
 g.addColorStop(0,`rgba(${rgb},${al})`);g.addColorStop(.6,`rgba(${rgb},${al*.6})`);g.addColorStop(1,`rgba(${rgb},0)`);
 ctx.save();ctx.translate(x,y);ctx.scale(gx,gy);ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.fill();ctx.restore()}
/* an organic liquid outline: a smooth closed curve whose radius wanders with low-frequency noise (so it reads as a
   puddle, not a circle), stretched downhill by 'sag', optionally with a crown of tiny spikes (an impact splat).
   Same seed = same shape, so a growing blob grows smoothly instead of jittering */
function puddlePath(X,x,y,r,sag,seed,irr,crown){const N=36,G=gDir(),gm=Math.hypot(G.x,G.y)||1,gx=G.x/gm,gy=G.y/gm,pts=[];
 for(let i=0;i<N;i++){const a=i/N*TAU,ca=Math.cos(a),sa=Math.sin(a),nz=(vnz(i/N*6,seed)-.5)*2*.6+(vnz(i/N*13,seed+7)-.5)*2*.4,dn=ca*gx+sa*gy,k=1+irr*nz+(dn>0?sag*dn*dn:0)+(crown&&vnz(i*1.7,seed+3)>.78?crown:0);pts.push([x+ca*r*k,y+sa*r*k])}
 X.moveTo((pts[0][0]+pts[N-1][0])/2,(pts[0][1]+pts[N-1][1])/2);for(let i=0;i<N;i++){const p=pts[i],q=pts[(i+1)%N];X.quadraticCurveTo(p[0],p[1],(p[0]+q[0])/2,(p[1]+q[1])/2)}X.closePath()}
function blob(x,y,r,s){const ctx=stk.x;ctx.fillStyle=inkPat(s,color,0);ctx.beginPath();
 for(let i=0;i<7;i++){const a=i/7*TAU+Math.random(),d=r*.45*Math.random();ctx.moveTo(x+Math.cos(a)*d+r*.6,y+Math.sin(a)*d);ctx.arc(x+Math.cos(a)*d,y+Math.sin(a)*d,r*(.55+.35*Math.random()),0,TAU)}ctx.fill()}
let AC=null,muted=false;
function audio(){if(muted)return;try{if(!AC)AC=new(window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();setTimeout(()=>{try{shkLoad()}catch(_){}},60)}catch(e){}}
function burst(t,dur,fq,q,gain){const b=AC.createBuffer(1,Math.ceil(AC.sampleRate*dur),AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,3);
 const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=b;f.type='bandpass';f.frequency.value=fq;f.Q.value=q;g.gain.value=gain;s.connect(f).connect(g).connect(AC.destination);s.start(t)}
/* MARKER SHAKE (paint marker with a steel agitator ball): no tones at all, only shaped noise, because a real one is a dense,
   irregular clatter, not a note. Each stroke of the shake sends the ball across the barrel: it hits an end hard, chatters
   (a burst of decaying knocks a few ms apart), rolls, and hits the other end. Every knock = a hard broadband tick + a
   plastic-barrel 'tock' (wide band, low Q so it never rings like a bell) + a dull ink-damped thud. Ink slosh sits underneath.
   Mixed paint is crisp; unmixed (ball stuck in settled paint) is muffled with fewer knocks; a near-empty pen is hollow and rattly. */
let NBUF=null;
function rattleOn(ctx,t,mix,emp){
 mix=Math.max(0,Math.min(1,mix));emp=Math.max(0,Math.min(1,emp));
 if(!NBUF||NBUF.sampleRate!==ctx.sampleRate){NBUF=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*.8),ctx.sampleRate);const d=NBUF.getChannelData(0);let l=0;for(let i=0;i<d.length;i++){const w=Math.random()*2-1;d[i]=w-.35*l;l=w}}/* slightly tilted white noise */
 const out=ctx.createGain();out.gain.value=2.5;
 const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=3800+mix*10500;lp.Q.value=.4;
 const cv=ctx.createConvolver(),ir=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*.05),ctx.sampleRate),id=ir.getChannelData(0);
 for(let i=0;i<id.length;i++)id[i]=(Math.random()*2-1)*Math.exp(-i/(ctx.sampleRate*.009))*(i<6?0:1);cv.buffer=ir;
 const wet=ctx.createGain();wet.gain.value=.3;
 lp.connect(out);lp.connect(cv);cv.connect(wet);wet.connect(out);out.connect(ctx.destination);
 const nz=(at,dur,type,f,q,peak,atk)=>{const s=ctx.createBufferSource(),fl=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=NBUF;fl.type=type;fl.frequency.value=f;fl.Q.value=q;g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(Math.max(.0002,peak),at+atk);g.gain.exponentialRampToValueAtTime(.0001,at+dur);s.connect(fl).connect(g).connect(lp);s.start(at,Math.random()*.6,dur+.02)};
 const hollow=1+emp*.25,body=(.45+.55*mix)*(.7+.5*emp),thud=(1-emp*.7)*(1-mix*.5);
 const knock=v=>{return at=>{
  const br=.75+Math.random()*.5;
  nz(at,.004,'bandpass',(3200+Math.random()*3200)*br,.9,v*.62,.0004);/* hard steel-on-plastic tick */
  nz(at,.011+Math.random()*.008,'bandpass',(1500+Math.random()*1300)*hollow,2.4,v*.5*body,.0007);/* barrel tock */
  nz(at,.02,'lowpass',380+Math.random()*260,.7,v*.38*thud,.001);/* ink-damped thud */
 }};
 const strokes=2+(Math.random()<.55?1:0),gap=.105-mix*.015;let tt=t;
 for(let s=0;s<strokes;s++){
  const base=tt+(Math.random()-.5)*.012,lead=.8+Math.random()*.2;
  /* end impact + chatter */
  const k0=3+Math.round(Math.random()*2+emp*2+mix*1);let at=base,iv=.004+Math.random()*.004,v=lead;
  for(let j=0;j<k0;j++){knock(v)(at);at+=iv*(.8+Math.random()*.5);iv*=1.38;v*=.66+Math.random()*.1}
  /* ball travelling: sparse small knocks against the walls and agitator while it rolls */
  const nm=2+Math.round(Math.random()*2+emp*2);
  for(let j=0;j<nm;j++)knock(.18+Math.random()*.22)(base+.03+Math.random()*(gap-.04));
  nz(base+.02,gap-.02,'bandpass',5200+Math.random()*1200,.8,(.05+emp*.05)*(.5+mix*.5),(gap-.02)*.7);/* rolling hiss */
  nz(base+.01,.17,'bandpass',420+Math.random()*220,.9,(.12+.1*(1-mix))*(1-emp*.75),.03);/* slosh */
  tt+=gap+(Math.random()-.5)*.022;
 }
}
window.__rlRattle=rattleOn;
/* REAL RECORDING: a cleaned recording of a marker being shaken, cut into single shakes. Each shake() plays one slice, tuned by how
   mixed / full the pen is. If the recording can't be decoded the synthesised rattle above takes over. */
const SHK_SLICES=[[0,.55],[.565,.86],[.865,1.19],[1.195,1.49],[1.495,1.82],[1.82,2.34],[2.345,2.62]];
let SHK_BUF=null,SHK_LOADING=false,SHK_LAST=-1;
function shkLoad(){if(SHK_BUF||SHK_LOADING||!AC)return;SHK_LOADING=true;try{const bin=atob(SHK_B64),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);const pr=AC.decodeAudioData(u.buffer,b=>{SHK_BUF=b},()=>{SHK_LOADING=false});if(pr&&pr.catch)pr.catch(()=>{})}catch(_){SHK_LOADING=false}}
function rattle(){if(!AC||muted)return;shkLoad();const mix=clamp(pen&&pen.mix!=null?pen.mix:1,0,1),emp=clamp(1-(pen&&pen.life!=null?pen.life:1),0,1);
 if(!SHK_BUF){rattleOn(AC,AC.currentTime,mix,emp);return}
 let k;do{k=Math.floor(Math.random()*SHK_SLICES.length)}while(k===SHK_LAST&&SHK_SLICES.length>1);SHK_LAST=k;
 const [t0,t1]=SHK_SLICES[k],t=AC.currentTime+.005,dur=t1-t0,src=AC.createBufferSource(),g=AC.createGain(),lp=AC.createBiquadFilter(),pk=AC.createBiquadFilter();
 src.buffer=SHK_BUF;src.playbackRate.value=1+emp*.06-(1-mix)*.07+(Math.random()-.5)*.03;
 lp.type='lowpass';lp.frequency.value=1800+Math.pow(mix,1.3)*16000;lp.Q.value=.5;/* unmixed: ball stuck in settled paint, muffled */
 pk.type='peaking';pk.frequency.value=2100;pk.Q.value=.9;pk.gain.value=emp*5;/* near empty: hollow barrel */
 const vol=.9*(.5+.5*mix)*(1+emp*.15);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+.003);g.gain.setValueAtTime(vol,t+Math.max(.01,dur/src.playbackRate.value-.02));g.gain.linearRampToValueAtTime(.0001,t+dur/src.playbackRate.value);
 src.connect(pk).connect(lp).connect(g).connect(AC.destination);src.start(t,t0,dur+.02);src.stop(t+dur/src.playbackRate.value+.03)}
const SHK_B64='@@B64:shake.m4a@@';
function clack(){return;if(!AC||muted)return;const t=AC.currentTime;burst(t,.02,1800,3,.7);const o=AC.createOscillator(),g=AC.createGain();o.frequency.setValueAtTime(220,t);o.frequency.exponentialRampToValueAtTime(90,t+.06);g.gain.setValueAtTime(.3,t);g.gain.exponentialRampToValueAtTime(.001,t+.08);o.connect(g).connect(AC.destination);o.start(t);o.stop(t+.1)}
const SND={wplastic:{f:2300,q:3,g:.2,sq:.4},glass:{f:3200,q:5,g:.16,sq:.55},plastic:{f:2300,q:3,g:.2,sq:.4}};
let fr=null;
function friction(on,spd,s){return;if(!AC||muted)return;try{
 if(!fr){const len=AC.sampleRate*2,b=AC.createBuffer(1,len,AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
  const src=AC.createBufferSource();src.buffer=b;src.loop=true;const f=AC.createBiquadFilter();f.type='bandpass';const g=AC.createGain();g.gain.value=0;src.connect(f).connect(g).connect(AC.destination);src.start();
  const o=AC.createOscillator();o.type='triangle';const og=AC.createGain();og.gain.value=0;o.connect(og).connect(AC.destination);o.start();fr={f,g,o,og}}
 const p=SND[s.id]||SND.paper,t=AC.currentTime,size=Math.sqrt(R()/6),tip=pen.metal?.55:pen.ink==='alcohol'?1:pen.valve?.8:.9;
 fr.f.frequency.setTargetAtTime(p.f*(pen.metal?1.5:1)/Math.sqrt(size),t,.03);fr.f.Q.value=p.q;
 fr.g.gain.setTargetAtTime(on?p.g*tip*clamp(spd/1.2)*Math.min(1.4,size)*(s.wet?.45:1):0,t,.03);
 const sl=s.wet?0:pen.ink==='alcohol'?1:pen.valve?.35:pen.metal?0:.5,sq=on&&p.sq?p.sq*sl*clamp(spd)*(Math.random()<.55?1:.15):0;
 fr.o.frequency.setTargetAtTime(650+Math.min(spd,3)*320,t,.02);fr.og.gain.setTargetAtTime(sq*.1,t,.015)}catch(_){}}
function tick(){if(muted||!AC)return;burst(AC.currentTime,.010,950+Math.random()*280,4,.22)}
/* TAP TO PRIME: dab the nib on the same spot. Each quick tap pushes ink into the tip — the line goes solid again,
   and the spot you're dabbing bleeds a blot that grows with each tap. Valve markers pump (and flood if you overdo it). */
const tapS={x:0,y:0,t:0,n:0};let saidTap=0;
function tapPrime(){if(tool!=='draw'||!stroke||!stroke.p0||!last)return;const now=performance.now(),mvd=Math.hypot(last.x-stroke.p0.x,last.y-stroke.p0.y);if(now-downT>650||mvd>26)return;
 const p={x:stroke.p0.x,y:stroke.p0.y};tapS.n=(now-tapS.t<1400&&Math.hypot(p.x-tapS.x,p.y-tapS.y)<64)?tapS.n+1:1;tapS.x=p.x;tapS.y=p.y;tapS.t=now;
 if((pen.empty||pen.fillReq)&&!pen.fill)return;if(pen.life<=0){toast('Empty — tapping can’t prime it. Refill it or grab a new pen');return}
 pen.drain=Math.max(0,(pen.drain||0)-2200*tapS.n);pen.tipDry=Math.max(0,pen.tipDry-.35);if(pen.flow!==undefined&&!pen.valve)pen.flow=Math.min(1,(pen.flow||.8)+.25);
 if(pen.valve)pump(p);
 if(pen.squeeze){const s0=pen.sat??0,bump=tapS.n>=2?.22:.14;pen.sat=Math.min(satCap(),s0+bump);showFlow();if(s0<1.05&&pen.sat>=1.05)toast('Juiced over 100% — ready to drip');else if(s0<1.35&&pen.sat>=1.35)toast('Felt soaked — super juicy, it’ll drip');if(pen.sat>1.25&&upright)drip(p.x,p.y+R()*.5,.65+(pen.sat-1)*1.8)}
 if(!pen.metal&&!INK[pen.ink].solid&&tapS.n>=2){const s=surfAt(p.x,p.y);blob(p.x,p.y,R()*Math.min(1.6,.55+.16*tapS.n),s);if(tapS.n>=4&&upright)drip(p.x,p.y+R()*.5,.5+.25*tapS.n*(INK[pen.ink].drip||.6))}
 if(!saidTap++)toast('Priming — dab the tip to push ink in. The line runs solid again');uiDirty=true}
function pump(p){if(!pen.valve)return;const lf=lifeF();if(lf<=0){toast('Empty — nothing left to prime. Grab a new pen');return}
 const was=pen.flow;pen.flow=Math.min(1.5,pen.flow+.14*lf);clack();
 if(p&&stroke){if(pen.flow>1.15){blob(p.x,p.y,R()*(.9+(pen.flow-1.1)*4),surfAt(p.x,p.y));drip(p.x,p.y+R()*.6,1.4*INK[pen.ink].drip);pen.flow=Math.max(1.05,pen.flow-.12);if(!stroke.flooded){stroke.flooded=1;toast('Flooding — lift the tip')}}
  else{if(pen.flow>=.55)stamp(p.x,p.y,0,null);if(was<.55&&pen.flow>=.55)toast('Valve open — ink is flowing')}}
 else if(pen.flow>1.1)toast('Flooded — the next touch will blob');showFlow();dirty=true}
let motionAsked=0;
function shake(){if(!pen.shake){toast('No mixing ball in this pen');return}audio();
 if(!motionAsked&&window.DeviceMotionEvent&&DeviceMotionEvent.requestPermission){motionAsked=1;DeviceMotionEvent.requestPermission().catch(()=>{})}
 const was=pen.mix;pen.mix=Math.min(1,pen.mix+.26);rattle();const c=document.querySelector('.pen[aria-pressed=true]');if(c){c.classList.remove('shaking');void c.offsetWidth;c.classList.add('shaking')}
 try{navigator.vibrate&&navigator.vibrate(30)}catch(e){}if(was<1&&pen.mix>=1)toast('Fully mixed — ready to prime');showMix()}
let lastShake=0;try{window.addEventListener('devicemotion',e=>{const a=e.acceleration||e.accelerationIncludingGravity;if(!a)return;const m=Math.hypot(a.x||0,a.y||0,a.z||0)-(e.acceleration?0:9.8);if(m>14&&performance.now()-lastShake>140){lastShake=performance.now();shake()}})}catch(e){}
let upright=true;const drips=[];
/* LEDGE: a sill/trim across the lower wall. Runs stop on it and gather into a thick bead of paint along the lip;
   once enough has collected at a spot it spills over and carries on below with a fresh fat root */
const FLOWDRIPS=true;
let ledgeOn=(()=>{try{return localStorage.getItem('rlLedge')!=='0'}catch(e){return true}})(),ledP={};
const ledgeLive=()=>ledgeOn&&(typeof gMode==='undefined'||gMode==='auto'||gMode==='down');/* sits just above the dock (surface switcher + tools); measured when the board is laid out, kept when the dock hides in full screen */
/* WEATHER: heat and wind dry ink fast and cut runs short; cold and damp keep it wet and running */
const WXS={mild:{k:'mild',n:'Weather: mild',dry:1,run:1},hot:{k:'hot',n:'Weather: hot & windy',dry:1.9,run:.55},cold:{k:'cold',n:'Weather: cold & damp',dry:.5,run:1.55}};const WX=WXS.mild;
let ldgY=null;function measureLdg(){ldgY=null;try{const d=document.querySelector('.dock'),r=d&&d.getBoundingClientRect();if(r&&r.height>20&&r.width>innerWidth*.5&&getComputedStyle(d).display!=='none'&&getComputedStyle(d).visibility!=='hidden'){const top=cv.getBoundingClientRect().top;ldgY=Math.round(r.top-top-16-10)}}catch(e){}}
const LDG=()=>{const sl=ledgeSlope();if(sl)return stairsRailGeom();if(isGlassPhoto()){const im=PHI.glass,q=photoRect('glass',im,W,H);return{y:Math.round(q.y+q.h*CILL),h:Math.max(24,Math.round(q.h*.06)),top:q.h*CILLD,sl:0,photo:1,stone:1,q}}const base=ldgY!=null&&ldgY>H*.45&&ldgY<H-20?ldgY:Math.round(H-Math.max(56,H*.07));return{y:base,h:16,sl:0}};
/* STAIRWELL: the 'ledge' is the handrail, running down with the stairs */
function isGlassPhoto(){try{const sf=bands&&bands[0]&&bands[0].s;return !!(sf&&(sf.id==='glass'||sf.base==='glass')&&PHI.glass)}catch(_){return false}}
function ledgeSlope(){try{const sf=bands&&bands[0]&&bands[0].s;return sf&&(sf.id==='stairs'||sf.base==='stairs')?.42:0}catch(_){return 0}}
const ledgeY=x=>{const L=LDG();return L.y+L.sl*(x-W/2)};
const ledgeSpan=()=>{const L=LDG(),a=ledgeY(0),b=ledgeY(W);return{y0:Math.min(a,b),y1:Math.max(a,b)+L.h}};
/* screen-plane gravity from the phone's accelerometer (low-passed so shaking doesn't jerk the runs) */
const grav={x:0,y:1,m:1,live:false};
/* device axes -> screen axes: in landscape the sensor's 'down' is the screen's side */
const scrAng=()=>{let a=0;try{a=(screen.orientation&&typeof screen.orientation.angle==='number')?screen.orientation.angle:(typeof window.orientation==='number'?window.orientation:0)}catch(e){}return((a%360)+360)%360*Math.PI/180};
const scrRot=(x,y)=>{const t=scrAng(),c=Math.cos(t),s=Math.sin(t);return{x:x*c+y*s,y:-x*s+y*c}};
/* self-calibrating: try the 4 possible sensor->screen rotations and keep the one whose 'down'
   sits lowest on screen on average. The OS rotates the UI to stay upright, so true gravity
   lives in the lower half of the screen; this survives any browser's axis/sign quirks. */
const gCal={ey:[0,0,0,0],k:-1};
const rotK=(x,y,k)=>k===0?{x,y}:k===1?{x:y,y:-x}:k===2?{x:-x,y:-y}:{x:-y,y:x};
addEventListener('devicemotion',e=>{const a=e.accelerationIncludingGravity;if(!a||a.x==null)return;const vx=-(a.x||0)/9.81,vy=(a.y||0)/9.81;
 if(gCal.k<0){const r=scrRot(vx,vy);let best=0,bd=-9;for(let k=0;k<4;k++){const q=rotK(vx,vy,k),d=-Math.hypot(q.x-r.x,q.y-r.y);if(d>bd){bd=d;best=k}}gCal.k=best;gCal.ey=[0,0,0,0];gCal.ey[best]=.25}
 /* The self-calibration assumes the screen turns itself to stay upright. In the phone app the screen is locked to portrait, so
    when you hold the phone sideways the 'down' really is the screen's side: keep the calibration from the first second and stop,
    or it would slowly re-learn sideways as 'down' and the runs would go straight down again. */
 gCal.n=(gCal.n||0)+1;const locked=document.documentElement.classList.contains('inapp')&&Math.min(screen.width||9e3,screen.height||9e3)<600;
 if(!locked||gCal.n<70){for(let k=0;k<4;k++)gCal.ey[k]+=(rotK(vx,vy,k).y-gCal.ey[k])*.03;
 let top=gCal.k;for(let k=0;k<4;k++)if(gCal.ey[k]>gCal.ey[top]+.3)top=k;gCal.k=top}
 const r0=rotK(vx,vy,gCal.k),gx=r0.x,gy=r0.y;if(!grav.live){grav.live=true;grav.x=gx;grav.y=gy}grav.x+=(gx-grav.x)*.08;grav.y+=(gy-grav.y)*.08;grav.m=Math.min(1,Math.hypot(grav.x,grav.y))});
window.__rlG=()=>[gDir(),gCal.k];window.__rlD=()=>({down,tool,stroke:!!stroke,ptrs:ptrs.size,upright,drips:drips.length,spreads:spreads.length,cells:rainCells.length});window.__rlP=()=>({PENS,pen,openSheet,fillPen,BOTTLES,TC});window.__rlCol=c=>{color=c};window.__rlT=()=>[tilt.x,tilt.y,tilt.tx,tilt.ty];/* manual hold: when the screen can't rotate (rotation lock, in-app browser) or there's no motion sensor, say how the phone is held */
let gMode=(()=>{try{return localStorage.getItem('rlGrav')||'auto'}catch(e){return 'auto'}})();const GMODES={auto:'Drips: auto (sensor)',down:'Drips: portrait',left:'Drips: phone turned left',right:'Drips: phone turned right',up:'Drips: upside down'},GVEC={down:{x:0,y:1},left:{x:1,y:0},right:{x:-1,y:0},up:{x:0,y:-1}};
let playGrav=null;
const gDir=()=>{if(typeof playOn!=='undefined'&&playOn&&playGrav)return playGrav;if(gMode!=='auto'){const v=GVEC[gMode];return{x:v.x,y:v.y,m:1,flat:0}}if(!grav.live)return{x:0,y:1,m:1,flat:0};if(grav.m<.24)return{x:0,y:1,m:0,flat:1};let x=grav.x,y=grav.y;if(y>0&&Math.abs(x)<y*.28){const k=clamp((Math.abs(x)/(y*.28)-.35)/.65);x*=k*k}const m=Math.hypot(x,y)||1e-6,mag=sm(clamp((grav.m-.24)/.36));return{x:x/m,y:y/m,m:mag,flat:0}};
