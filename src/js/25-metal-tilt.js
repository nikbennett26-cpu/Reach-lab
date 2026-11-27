/* ---------- metallic shine: silver / gold / chrome catch a light that moves with the phone ---------- */
const METAL={'#b9bdc2':'silver','#c4c8cc':'silver','#c9a24a':'gold','#a3a8ad':'silver'};
let metalOn=false;const tilt={x:0,y:0,tx:0,ty:0};let gyro=false,gyroAsked=false,flakeC=null;
function cloneC(c){const k=document.createElement('canvas');k.width=c.width;k.height=c.height;k.getContext('2d').drawImage(c,0,0);return k}
function putMetal(c){shineDirty=true;if(!c&&!metal.c.width)return;if(c)need(metal);const x=metal.x;x.save();x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,metal.c.width,metal.c.height);if(c)x.drawImage(c,0,0);x.restore();metalOn=!!c;dirty=true}
const oriB={g:null,b:null};addEventListener('orientationchange',()=>{oriB.g=null;motB.x=null;grav.live=false;gCal.k=-1});try{screen.orientation&&screen.orientation.addEventListener('change',()=>{oriB.g=null;motB.x=null;grav.live=false;gCal.k=-1})}catch(e){}addEventListener('deviceorientation',e=>{if(e.gamma==null&&e.beta==null)return;gyro=true;sensorAt=performance.now();const g=e.gamma||0,b=e.beta||0;if(oriB.g===null){oriB.g=g;oriB.b=b}oriB.g+=(g-oriB.g)*.008;oriB.b+=(b-oriB.b)*.008;{const r=scrRot((g-oriB.g)/18,(b-oriB.b)/18);tilt.tx=Math.max(-1.5,Math.min(1.5,r.x));tilt.ty=Math.max(-1.5,Math.min(1.5,r.y))}});
let motionOK=false,sensorAt=0,toldNoSensor=0;
function askGyro(){if(motionOK)return;try{const D=window.DeviceOrientationEvent,M=window.DeviceMotionEvent;
 if(D&&typeof D.requestPermission==='function')D.requestPermission().then(r=>{if(r==='granted')motionOK=true}).catch(()=>{});
 if(M&&typeof M.requestPermission==='function')M.requestPermission().then(r=>{if(r==='granted')motionOK=true}).catch(()=>{});
 else if(!(D&&typeof D.requestPermission==='function'))motionOK=true}catch(_){}}
for(const ev of ['click','touchend'])addEventListener(ev,askGyro,{capture:true,passive:true});
const motB={x:null,y:null};addEventListener('devicemotion',e=>{const a=e.accelerationIncludingGravity;if(!a||a.x==null)return;sensorAt=performance.now();if(gyro)return;
 const gx=a.x/9.81*90,gy=a.y/9.81*90;if(motB.x===null){motB.x=gx;motB.y=gy}motB.x+=(gx-motB.x)*.008;motB.y+=(gy-motB.y)*.008;
 {const r=scrRot(-(gx-motB.x)/18,(gy-motB.y)/18);tilt.tx=Math.max(-1.5,Math.min(1.5,r.x));tilt.ty=Math.max(-1.5,Math.min(1.5,r.y))}tilt.live=true});
addEventListener('pointermove',e=>{if(gyro||tilt.live||down)return;/* the light holds still while you're writing: no shine rebuilds mid-stroke */tilt.tx=(e.clientX/innerWidth-.5)*1.6;tilt.ty=(e.clientY/innerHeight-.5)*1.2},{passive:true});
function flakes(){if(flakeC)return flakeC;const S=96,c=document.createElement('canvas');c.width=c.height=S;const x=c.getContext('2d');let r=987654321;const rnd=()=>(r=(Math.imul(r,1103515245)+12345)>>>0)/4294967296;
 for(let i=0;i<260;i++){x.fillStyle=`rgba(255,255,255,${.25+.75*rnd()})`;const z=.6+rnd()*1.4;x.fillRect(rnd()*S,rnd()*S,z,z)}return flakeC=c}
function stepTilt(now){if(!metalOn&&!fjOn&&!glossOn&&!shiftOn&&!(lightOn&&(satOn||wgOn2)))return;let tx=tilt.tx,ty=tilt.ty;if(!gyro&&!tilt.live&&!toldNoSensor&&(metalOn||fjOn)&&performance.now()>9000){toldNoSensor=1;toast('Tilt isn’t reaching Reach Lab here — drag to move the light, or open it in Safari/Chrome to use your phone’s motion')}
 const nx=tilt.x+(tx-tilt.x)*.16,ny=tilt.y+(ty-tilt.y)*.16;if(Math.abs(nx-tilt.x)+Math.abs(ny-tilt.y)>.0006){tilt.x=nx;tilt.y=ny;dirty=true}}
let fjCol='#a9b03c';
/* Future Juice is dichroic: face-on it reads violet-blue; change the viewing angle and the whole tag flips to yellow-green */
function drawFJ(x){if(!fjOn)return;need(shine);need(fjL);const t=Math.hypot(tilt.x,tilt.y),k=sm(clamp((t-.12)/.45));if(k<.02)return;const w=shine.c.width,h=shine.c.height,sx=shine.x;sx.save();sx.setTransform(1,0,0,1,0,0);sx.globalCompositeOperation='source-over';sx.globalAlpha=1;sx.clearRect(0,0,w,h);sx.drawImage(fjL.c,0,0);sx.globalCompositeOperation='source-in';
 const g=sx.createLinearGradient(0,0,w*(.5+tilt.x*.5),h*(.5+tilt.y*.5));g.addColorStop(0,mixHex(fjCol,'#c9d43a',.35));g.addColorStop(1,mixHex(fjCol,'#6fa83a',.35));sx.fillStyle=g;sx.fillRect(0,0,w,h);sx.restore();x.save();x.globalAlpha=k;x.drawImage(shine.c,0,0);x.restore()}
/* METAL SHINE: built at half resolution into one cached glint image, rebuilt only when the metal or the tilt
   changes (max ~15/s); every other frame is a single cheap composite. Keeps the GPU from choking (black screen). */
const shC2=document.createElement('canvas'),shX2=shC2.getContext('2d');shC2.width=shC2.height=0;let specC=null,chQ=null;
const shC=document.createElement('canvas'),shX=shC.getContext('2d'),gC=document.createElement('canvas'),gX=gC.getContext('2d');shC.width=shC.height=gC.width=gC.height=0;
let shineDirty=true,shT={x:9,y:9,t:0};
function buildShine(){const w=shC.width,h=shC.height,sx=shX,a=.62,ux=Math.cos(a),uy=Math.sin(a),L=w*ux+h*uy,c=L*(.5+tilt.x*.55+tilt.y*.3);
 const band=(half)=>{const g=sx.createLinearGradient(0,0,ux*L,uy*L),per=L*.42,sd=half*.55;for(let i=0;i<=60;i++){const pos=i/60*L;let a=0;for(let k=-3;k<=3;k++){const d=pos-(c+k*per);a=Math.max(a,Math.exp(-d*d/(2*sd*sd))*(k?.75:1))}g.addColorStop(i/60,`rgba(0,0,0,${Math.min(1,a+.08).toFixed(3)})`)}return g};
 sx.save();sx.setTransform(1,0,0,1,0,0);gX.setTransform(1,0,0,1,0,0);gX.globalCompositeOperation='source-over';gX.globalAlpha=1;gX.clearRect(0,0,w,h);
 /* broad sheen in the metal's own hue */
 sx.globalCompositeOperation='source-over';sx.globalAlpha=1;sx.clearRect(0,0,w,h);sx.drawImage(metal.c,0,0,w,h);sx.globalCompositeOperation='destination-in';sx.fillStyle=band(L*.14);sx.fillRect(0,0,w,h);
 gX.globalCompositeOperation='lighter';gX.globalAlpha=.2;gX.drawImage(shC,0,0);
 /* tight specular streak */
 sx.globalCompositeOperation='source-over';sx.clearRect(0,0,w,h);sx.drawImage(metal.c,0,0,w,h);sx.globalCompositeOperation='source-in';sx.fillStyle='#fff';sx.fillRect(0,0,w,h);sx.globalCompositeOperation='destination-in';sx.fillStyle=band(L*.035);sx.fillRect(0,0,w,h);
 gX.globalAlpha=.26;gX.drawImage(shC,0,0);
 /* metal flakes glint as the angle changes */
 sx.globalCompositeOperation='source-over';sx.clearRect(0,0,w,h);sx.drawImage(metal.c,0,0,w,h);sx.globalCompositeOperation='destination-in';const p=sx.createPattern(flakes(),'repeat');sx.translate(tilt.x*30*dpr,tilt.y*30*dpr);sx.fillStyle=p;sx.fillRect(-100*dpr,-100*dpr,w+200*dpr,h+200*dpr);sx.setTransform(1,0,0,1,0,0);sx.fillStyle=band(L*.1);sx.fillRect(0,0,w,h);
 gX.globalAlpha=.4;gX.drawImage(shC,0,0);gX.globalAlpha=1;
 /* LIQUID-METAL TEXTURE: thick glassy rim, reflected-room horizon, pinhole bubbles — all read off the metal ink's own shape */
 {const s2=shX2,k=dpr/2;let br=10;try{br=R()}catch(_){}
  s2.setTransform(1,0,0,1,0,0);s2.globalCompositeOperation='source-over';s2.globalAlpha=1;s2.clearRect(0,0,w,h);blurDraw(s2,metal.c,Math.max(1.4,br*k*.34),w,h);
  /* 1. CHROME LIGHTING: the ink's own thickness (its blurred coverage) is the height-field; its slope gives a normal per pixel.
        Schlick Fresnel (F0 ~ .5 for mercury chrome) decides how much of a soft sky-to-ground reflection each pixel shows, and a
        Blinn-Phong half-vector highlight (tight + broad lobe) slides across the beads as the phone tilts. No hard horizon, no straight edges. */
  {const qw=Math.max(8,Math.ceil(w/2)),qh=Math.max(8,Math.ceil(h/2));
   if(!chQ){chQ={};for(const k of ['a','b','o']){chQ[k]=document.createElement('canvas');chQ[k+'x']=chQ[k].getContext('2d',{willReadFrequently:true})}}
   for(const k of ['a','b','o'])if(chQ[k].width!==qw||chQ[k].height!==qh){chQ[k].width=qw;chQ[k].height=qh}
   const ca=chQ.ax,cb=chQ.bx,co=chQ.ox,rq=Math.max(1,br*dpr/4);
   ca.setTransform(1,0,0,1,0,0);ca.globalCompositeOperation='copy';ca.globalAlpha=1;ca.drawImage(metal.c,0,0,qw,qh);
   cb.setTransform(1,0,0,1,0,0);cb.globalCompositeOperation='source-over';cb.globalAlpha=1;cb.clearRect(0,0,qw,qh);blurDraw(cb,metal.c,Math.max(1.1,rq*.55),qw,qh);
   const Mc=ca.getImageData(0,0,qw,qh).data,Hd=cb.getImageData(0,0,qw,qh).data,img=co.createImageData(qw,qh),O=img.data,Sg=Math.max(2.2,rq*1.7)/255*.5;
   const nrm=(x,y,z)=>{const l=Math.hypot(x,y,z)||1;return[x/l,y/l,z/l]};
   const [lx,ly,lz]=nrm(-.42+tilt.x*.85,-.5+tilt.y*.85,.78),[vx,vy,vz]=nrm(-tilt.x*.3,-tilt.y*.3,1),[hx,hy,hz]=nrm(lx+vx,ly+vy,lz+vz),F0=.5,tyT=tilt.y*.35;
   for(let y=0;y<qh;y++){const y1=y>0?y-1:0,y2=y<qh-1?y+1:y;for(let x=0;x<qw;x++){const i=y*qw+x,m=Mc[i*4+3];if(m<6)continue;
    const x1=x>0?x-1:0,x2=x<qw-1?x+1:x,gx=(Hd[(y*qw+x2)*4+3]-Hd[(y*qw+x1)*4+3])*Sg,gy=(Hd[(y2*qw+x)*4+3]-Hd[(y1*qw+x)*4+3])*Sg;
    const il=1/Math.sqrt(gx*gx+gy*gy+1),nx=-gx*il,ny=-gy*il,nz=il;
    let cv=nx*vx+ny*vy+nz*vz;if(cv<0)cv=0;const t=1-cv,t2=t*t,fr=F0+(1-F0)*t2*t2*t;
    let nh=nx*hx+ny*hy+nz*hz;if(nh<0)nh=0;const sp=.5*Math.pow(nh,80)+.07*Math.pow(nh,9);
    let u=.5+(2*cv*ny-vy)*.9+tyT;u=u<0?0:u>1?1:u;u=u*u*(3-2*u);
    const k=fr*.3,rr=(.6+.37*u)*k+sp,gg=(.74+.23*u)*k+sp,bb=(.93+.06*u)*k+sp;
    O[i*4]=rr>1?255:rr*255;O[i*4+1]=gg>1?255:gg*255;O[i*4+2]=bb>1?255:bb*255;O[i*4+3]=m}}
   co.putImageData(img,0,0);gX.save();gX.imageSmoothingEnabled=true;gX.globalAlpha=.8;gX.drawImage(chQ.o,0,0,w,h);gX.restore()}
  /* 3. pinhole bubbles & settled speckle on the thick middle of the ink */
  if(!specC){const S=170,c=document.createElement('canvas');c.width=c.height=S;const q=c.getContext('2d');let r=424242;const rnd=()=>(r=(Math.imul(r,1103515245)+12345)>>>0)/4294967296;
   for(let i=0;i<46;i++){const x=rnd()*S,y=rnd()*S,rr=.7+rnd()*rnd()*2.6;q.fillStyle=`rgba(255,255,255,${.35+rnd()*.5})`;q.beginPath();q.arc(x,y,rr,0,6.283);q.fill();if(rr>1.5){q.strokeStyle='rgba(255,255,255,.7)';q.lineWidth=.6;q.beginPath();q.arc(x-rr*.25,y-rr*.25,rr*.55,3.4,4.9);q.stroke()}}
   for(let i=0;i<260;i++){q.fillStyle=`rgba(255,255,255,${.12+rnd()*.25})`;q.fillRect(rnd()*S,rnd()*S,.8,.8)}specC=c}
  sx.globalCompositeOperation='source-over';sx.clearRect(0,0,w,h);sx.drawImage(metal.c,0,0,w,h);sx.globalCompositeOperation='destination-in';sx.save();sx.translate(tilt.x*9,tilt.y*9);sx.fillStyle=sx.createPattern(specC,'repeat');sx.fillRect(-60,-60,w+120,h+120);sx.restore();sx.globalCompositeOperation='destination-in';sx.drawImage(shC2,0,0);sx.drawImage(shC2,0,0);
  gX.globalAlpha=.85;gX.drawImage(shC,0,0);gX.globalAlpha=1}
 sx.restore()}
/* GLOSS: wet-look highlight on glossy inks — a soft white specular that slides with tilt. No metal hue, no flakes. */
const glL={c:document.createElement('canvas')};glL.x=glL.c.getContext('2d');glL.c.width=glL.c.height=0;let glossOn=false,glDirty=true,glT={x:9,y:9,t:0};
const glC=document.createElement('canvas'),glX=glC.getContext('2d');glC.width=glC.height=0;
function needGl(){if(glL.c.width!==baked.c.width||glL.c.height!==baked.c.height){glL.c.width=baked.c.width;glL.c.height=baked.c.height;glL.x.setTransform(dpr,0,0,dpr,0,0)}return glL}
function drawGloss(x){if(!glossOn||!glL.c.width)return;const w=Math.ceil(glL.c.width/2),h=Math.ceil(glL.c.height/2);if(glC.width!==w||glC.height!==h){glC.width=w;glC.height=h;glDirty=true}
 const now=performance.now(),mv=Math.abs(tilt.x-glT.x)+Math.abs(tilt.y-glT.y)>.012;
 if((glDirty||mv)&&now-glT.t>55&&!down){paintOverheadGlare(glX,w,h,glL.c,.92);glDirty=false;glT={x:tilt.x,y:tilt.y,t:now}}
 x.save();x.globalCompositeOperation='screen';x.globalAlpha=.88;x.drawImage(glC,0,0,glL.c.width,glL.c.height);x.restore()}
/* COLOUR SHIFT: interference-pigment ink — the whole mark swings toward blue-violet as the viewing angle changes */
const shL={c:document.createElement('canvas')};shL.x=shL.c.getContext('2d');shL.c.width=shL.c.height=0;let shiftOn=false,shDirty=true,shT2={k:-1,t:0};
const sfC=document.createElement('canvas'),sfX=sfC.getContext('2d');sfC.width=sfC.height=0;
function needSh(){if(shL.c.width!==baked.c.width||shL.c.height!==baked.c.height){shL.c.width=baked.c.width;shL.c.height=baked.c.height;shL.x.setTransform(dpr,0,0,dpr,0,0)}return shL}
function drawShift(x){if(!shiftOn||!shL.c.width)return;const k=sm(clamp((Math.hypot(tilt.x,tilt.y)-.08)/.4));if(k<.02)return;const w=Math.ceil(shL.c.width/2),h=Math.ceil(shL.c.height/2);if(sfC.width!==w||sfC.height!==h){sfC.width=w;sfC.height=h;shDirty=true}
 if(shDirty){sfX.setTransform(1,0,0,1,0,0);sfX.globalCompositeOperation='copy';sfX.drawImage(shL.c,0,0,w,h);sfX.globalCompositeOperation='source-in';const g=sfX.createLinearGradient(0,0,w,h);g.addColorStop(0,'#3f6bff');g.addColorStop(.5,'#6a4fe0');g.addColorStop(1,'#2fa4ff');sfX.fillStyle=g;sfX.fillRect(0,0,w,h);sfX.globalCompositeOperation='source-over';shDirty=false}
 x.save();x.globalAlpha=.78*k;x.drawImage(sfC,0,0,shL.c.width,shL.c.height);x.restore()}
function drawShine(x){if(!metalOn||!metal.c.width)return;const w=Math.ceil(metal.c.width/2),h=Math.ceil(metal.c.height/2);
 if(gC.width!==w||gC.height!==h){shC.width=gC.width=shC2.width=w;shC.height=gC.height=shC2.height=h;shineDirty=true}
 const now=performance.now(),moved=Math.abs(tilt.x-shT.x)+Math.abs(tilt.y-shT.y)>.012;
 if((shineDirty||moved)&&now-shT.t>66&&!down){buildShine();shineDirty=false;shT={x:tilt.x,y:tilt.y,t:now}}
 x.save();x.globalCompositeOperation='lighter';x.globalAlpha=1-.6*(typeof etchAgeA==='number'?etchAgeA:0);/* old chrome oxidises and dulls */x.drawImage(gC,0,0,metal.c.width,metal.c.height);x.restore()}


/* Glass etch: eats into glass/glaze and frosts it — lives on its own layer that buffing can't touch */
const ETCHABLE={glass:1,bus:.9,tiles:.75},etches=[];let etchOn=false,frostT=null;
function frost(){if(frostT)return frostT;const S=128,c=document.createElement('canvas');c.width=c.height=S;const x=c.getContext('2d'),im=x.createImageData(S,S);let r=12345;const rnd=()=>(r=(Math.imul(r,1103515245)+12345)>>>0)/4294967296;
 for(let j=0;j<S;j++)for(let i=0;i<S;i++){const k=(j*S+i)*4,f=.6*n(64,64,i/S,j/S)+.4*rnd();im.data[k]=236;im.data[k+1]=230;im.data[k+2]=214;im.data[k+3]=255*(.62+.38*f)}x.putImageData(im,0,0);return frostT=c}
function makeEtch(s){const pad=4,x=Math.max(0,Math.floor(stroke.x0-pad)),y=Math.max(0,Math.floor(stroke.y0-pad)),x1=Math.min(W,Math.ceil(stroke.x1+pad)),y1=Math.min(H,Math.ceil(stroke.y1+pad)),w=x1-x,h=y1-y;if(w<3||h<3)return;
 const k=ETCHABLE[s.id]||0,c=document.createElement('canvas');c.width=w*dpr;c.height=h*dpr;const cx=c.getContext('2d');cx.drawImage(stk.c,x*dpr,y*dpr,w*dpr,h*dpr,0,0,w*dpr,h*dpr);
 cx.globalCompositeOperation='source-in';if(k){cx.fillStyle=cx.createPattern(frost(),'repeat');cx.fillRect(0,0,w*dpr,h*dpr)}else{cx.fillStyle='#f2f0ea';cx.fillRect(0,0,w*dpr,h*dpr)}
 if(k){const rc=document.createElement('canvas');rc.width=c.width;rc.height=c.height;const rx=rc.getContext('2d');rx.drawImage(stk.c,x*dpr,y*dpr,w*dpr,h*dpr,0,0,w*dpr,h*dpr);
  const tc=document.createElement('canvas');tc.width=c.width;tc.height=c.height;const tx=tc.getContext('2d');tx.drawImage(stk.c,x*dpr,y*dpr,w*dpr,h*dpr,0,0,w*dpr,h*dpr);const bl=document.createElement('canvas');bl.width=c.width;bl.height=c.height;blurDraw(bl.getContext('2d'),tc,Math.max(1.2,R()*.18)*dpr,c.width,c.height);
  rx.clearRect(0,0,rc.width,rc.height);rx.globalCompositeOperation='source-over';rx.drawImage(tc,0,0);rx.globalCompositeOperation='destination-out';rx.globalAlpha=1;rx.drawImage(bl,0,0);rx.drawImage(bl,0,0);rx.globalAlpha=1;rx.globalCompositeOperation='source-in';rx.fillStyle='#fbf9f2';rx.fillRect(0,0,rc.width,rc.height);
  cx.globalCompositeOperation='source-over';cx.globalAlpha=.68;cx.globalCompositeOperation='destination-out';cx.fillStyle='#000';cx.fillRect(0,0,c.width,c.height);cx.globalAlpha=1;cx.globalCompositeOperation='source-over';cx.drawImage(rc,0,0);cx.drawImage(rc,0,0)}
 if(k){freeC(c);etchAdd(k,s.wet)}else etches.push({c,x,y,w,h,k,t0:performance.now()+300,T:2600*(s.wet?1.8:1),done:0,amt:.14*(s.wet?.6:1)});
 if(k&&upright){/* etch runs: a handful spaced along the stroke, hanging off its edge (not one per point) */const P=stroke.pts||[],r=R(),gap=Math.max(22,r*3.5);let len=0;for(let i=2;i<P.length;i+=2)len+=Math.hypot(P[i]-P[i-2],P[i+1]-P[i-1]);const cap=Math.min(10,2+Math.round(len/140));let acc=gap*Math.random(),n=0;
  for(let i=2;i<P.length&&n<cap;i+=2){acc+=Math.hypot(P[i]-P[i-2],P[i+1]-P[i-1]);if(acc<gap)continue;acc=0;if(Math.random()>.45)continue;n++;const long=Math.random()<.1,e=tipEdge(P[i],P[i+1],P[i],P[i+1],(Math.random()-.5)*r*2);
   drip(e[0],e[1],long?1+Math.random()*1.6:.15+Math.random()*.45,{ty:'etch',col:color,ek:k,wet:s.wet,r:Math.max(.8,Math.min(2.4,r*(.1+Math.random()*.15))),et:1,delay:250+Math.random()*2200})}}}
/* an etch run has stopped: its wet trace is baked into the wall exactly like the wet tag (same colour, same see-through strength),
   and the same frost then creeps through it on the same clock as the letters — so the runs end up the same frosted cream */
function etchRunDry(d){d.ewd=1}
/* ACID ETCH (researched): ammonium-bifluoride/HF etch goes on as a clear wet liquid — the glass looks untouched while it's wet.
   The acid eats a microscopic layer of the glass, but the frost only shows once the liquid has dried off: so the mark
   appears clear, then turns white from its thin outer edges inward (the thin film there evaporates first, the fat middle
   of a line and the end blobs last); thin runs frost before the letters. Everything written in one go dries as one. */
let etBB=null;const ETF=document.createElement('canvas'),ETW=document.createElement('canvas');
function etGrow(x0,y0,x1,y1){etBB=etBB?[Math.min(etBB[0],x0),Math.min(etBB[1],y0),Math.max(etBB[2],x1),Math.max(etBB[3],y1)]:[x0,y0,x1,y1]}
function etchWet(s){const m=need(EMASK).x;m.save();m.setTransform(1,0,0,1,0,0);m.globalCompositeOperation='source-over';m.drawImage(stk.c,0,0);m.restore();if(stroke)etGrow(stroke.x0-12,stroke.y0-12,stroke.x1+12,stroke.y1+12)}
function etchAdd(k,wet){const now=performance.now();/* drying is paused while you're still writing, so the first letter doesn't frost before the last */if(!etS)etS={e:0,tk:now,last:now,T:4200*(wet?1.3:1),p:0,r:0};etS.last=now;/* fully frosted ~5s after the pen lifts */etK=.95*k*(wet?.6:1);etvDirty=true}
function renderETV(p){etvDirty=false;etvP=p;const W2=baked.c.width,H2=baked.c.height,P=dpr;for(const c of [ETV,ETR,ETB,ETF,ETW])if(c.width!==W2||c.height!==H2){c.width=W2;c.height=H2}
 const f=ETF.getContext('2d',{willReadFrequently:true}),w=ETW.getContext('2d',{willReadFrequently:true});f.setTransform(1,0,0,1,0,0);w.setTransform(1,0,0,1,0,0);f.clearRect(0,0,W2,H2);w.clearRect(0,0,W2,H2);
 if(etS&&EMASK.c.width&&etBB){const X=Math.max(0,Math.floor(etBB[0]*P)),Y=Math.max(0,Math.floor(etBB[1]*P)),X1=Math.min(W2,Math.ceil(etBB[2]*P)),Y1=Math.min(H2,Math.ceil(etBB[3]*P)),bw=X1-X,bh=Y1-Y;
  if(bw>1&&bh>1){/* how 'deep' each spot of liquid is = how far it is inside the mark (blurred mask) */const b=ETB.getContext('2d',{willReadFrequently:true});b.setTransform(1,0,0,1,0,0);b.clearRect(0,0,W2,H2);blurDraw(b,EMASK.c,4.5*P,W2,H2);
   const A=EMASK.x.getImageData(X,Y,bw,bh).data,B=b.getImageData(X,Y,bw,bh).data,F=f.createImageData(bw,bh),Wt=w.createImageData(bw,bh),FD=F.data,WD=Wt.data,thr=-.15+1.3*p;
   for(let q=3;q<A.length;q+=4){const a=A[q];if(!a)continue;const bb=B[q]/255,fr=Math.max(0,Math.min(1,(thr-bb)/.16)),fa=a*fr;FD[q-3]=FD[q-2]=FD[q-1]=255;FD[q]=fa;WD[q-3]=244;WD[q-2]=242;WD[q-1]=236;WD[q]=(a-fa)*.09}
   f.putImageData(F,X,Y);w.putImageData(Wt,X,Y)}}
 const v=ETV.getContext('2d');v.setTransform(1,0,0,1,0,0);v.globalAlpha=1;v.globalCompositeOperation='source-over';v.clearRect(0,0,W2,H2);
 if(etchL.c.width)v.drawImage(etchL.c,0,0);v.drawImage(ETF,0,0);
 /* etched rim: only the union's own edge (and the drying front), so crossing strokes never show each other's outlines */
 const b=ETB.getContext('2d');b.setTransform(1,0,0,1,0,0);b.clearRect(0,0,W2,H2);blurDraw(b,ETV,Math.max(1.2,R()*.18)*P,W2,H2);
 const r=ETR.getContext('2d');r.setTransform(1,0,0,1,0,0);r.globalCompositeOperation='copy';r.drawImage(ETV,0,0);r.globalCompositeOperation='destination-out';r.drawImage(ETB,0,0);r.drawImage(ETB,0,0);r.globalCompositeOperation='source-in';r.fillStyle='#fbf9f2';r.fillRect(0,0,W2,H2);r.globalCompositeOperation='source-over';
 v.globalCompositeOperation='source-in';v.fillStyle=v.createPattern(frost(),'repeat');v.fillRect(0,0,W2,H2);v.globalCompositeOperation='destination-out';v.globalAlpha=.68;v.fillStyle='#000';v.fillRect(0,0,W2,H2);v.globalAlpha=1;v.globalCompositeOperation='source-over';v.drawImage(ETR,0,0);v.drawImage(ETR,0,0);
 /* AGED ETCH: the frosted pits trap grime the smooth glass sheds, so an old etch goes greyer and shows up more */if(etchAgeA>0){v.globalCompositeOperation='source-atop';v.fillStyle=`rgba(96,90,78,${(.55*etchAgeA).toFixed(3)})`;v.fillRect(0,0,W2,H2);for(let i=0,n=Math.round(W2*H2/(dpr*dpr)*.004*etchAgeA);i<n;i++){v.fillStyle=`rgba(50,44,34,${(.2+Math.random()*.4)*etchAgeA})`;const r=(.4+Math.random()*1.2)*dpr;v.fillRect(Math.random()*W2,Math.random()*H2,r,r)}v.globalCompositeOperation='source-over'}}
function etchSession(now){if(!etS)return;/* everything stays a clear wet line — strokes AND runs — until you've finished the tag and the runs have stopped; only then does it start drying onto the glass */const dt=Math.min(200,now-etS.tk);etS.tk=now;const live=drips.some(d=>d.et&&!d.dead);if(!down&&now-etS.last>800)etS.e+=dt;const p=sm(clamp(etS.e/etS.T));if(p-etvP>=.02||(p>=1&&etvP<1)||(live&&now-etS.r>140)){etS.r=now;renderETV(p)}dirty=true;
 if(p>=1&&!live){const L=need(etchL).x;L.save();L.setTransform(1,0,0,1,0,0);L.drawImage(EMASK.c,0,0);L.restore();const m=EMASK.x;m.save();m.setTransform(1,0,0,1,0,0);m.clearRect(0,0,EMASK.c.width,EMASK.c.height);m.restore();
  ewOn=false;ewRuns.length=0;etS=null;etBB=null;etchOn=true;renderETV(0)}}
function runEtches(now){/* every etch run dries the same way, however it stopped (ran out, caught on a ledge, pooled on a cill) */for(let i=ewRuns.length-1;i>=0;i--){const d=ewRuns[i];if(d.ewd||!drips.includes(d)||d.dead||d.vol<0){etchRunDry(d);ewRuns.splice(i,1)}}etchSession(now);for(let i=etches.length-1;i>=0;i--){const p=etches[i],pr=sm(clamp((now-p.t0)/p.T)),d=pr-p.done;if(d<.01&&pr<1)continue;
 const L=p.k?need(etchL).x:baked.x;L.save();L.setTransform(1,0,0,1,0,0);L.globalAlpha=inc(p.amt,p.done,pr);L.drawImage(p.c,p.x*dpr,p.y*dpr);L.restore();if(p.k)etchOn=true;p.done=pr;dirty=true;if(pr>=1){etches.splice(i,1);freeC(p.c)}}}
function putFJ(c){if(!c&&!fjL.c.width){fjOn=false;return}if(c)need(fjL);const x=fjL.x;x.save();x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,fjL.c.width,fjL.c.height);if(c)x.drawImage(c,0,0);x.restore();fjOn=!!c;dirty=true}
function putEtch(c){if(!c&&!etchL.c.width)return;if(c)need(etchL);const x=etchL.x;x.save();x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,etchL.c.width,etchL.c.height);if(c)x.drawImage(c,0,0);x.restore();etchOn=!!c;etvDirty=true;dirty=true}

