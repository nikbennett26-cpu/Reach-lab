/* ---------- canvases ---------- */
const cv=$('#cv');let dctx=null;try{dctx=cv.getContext('2d',{desynchronized:true})}catch(_){}if(!dctx)dctx=cv.getContext('2d');
/* iPad Safari keeps a dropped canvas's memory until it is resized to zero — free them explicitly */
const freeC=c=>{if(c&&c.width){c.width=0;c.height=0}};
const mk=(rf)=>{const c=document.createElement('canvas');return{c,x:c.getContext('2d',rf?{willReadFrequently:true}:undefined)}};
const bg=mk(),baked=mk(1),stk=mk(),idm=mk(1),tmp=mk(),rimA=mk(),rimB=mk(),ghost=mk(),ghostC=mk(),ghostV=mk(),grainM=mk(),smearC=mk(),tmp2=mk(),metal=mk(),shine=mk(),pool=mk(),etchL=mk(),ovl=mk(),fjL=mk();let fjOn=false;
let g3All=null,g3Opq=null,g3Dye=null,g3Out=null,g3Mul=null,g3Tmp=null,g3Key='',g3At=0,g3Dirty=true;
INK.future=Object.assign({},INK.alcohol,{label:'Colour-shifting alcohol ink',opacity:.93,bead:.15,bleed:.5,tau:.9,comp:'source-over',rem:[.04,0],drip:1.3,future:1});TAUS.future=.9;INK.solid=Object.assign({},INK.oil,{label:'Solidified paint stick',opacity:.9,bead:.05,bleed:0,tau:3,raise:.3,comp:'source-over',rem:[.05,0],drip:0,solid:1});TAUS.solid=3;INK.etch=Object.assign({},INK.alcohol,{label:'Glass etching fluid',opacity:.08,bead:.35,bleed:.05,tau:1.5,comp:'source-over',rem:[.3,.05],drip:.9,etch:1});TAUS.etch=1.5;
/* special-ink layers stay unallocated until that ink is used (saves 5 full-screen layers of GPU memory) */
const RUNL=mk();RUNL.c.width=RUNL.c.height=0;/* wet etch runs: drawn in the pen's own colour at full strength here, shown at the same see-through strength as the wet tag, then baked in and frosted when they stop */const EWET=mk();EWET.c.width=EWET.c.height=0;let ewOn=false,ewA=.1;const ewRuns=[];/* EMASK: everything written in the current etch session (strokes + runs, one union — no overlaps); it frosts as ONE on one clock. etchL keeps the finished etch as a union mask too; ETV is the frosted look rendered from both */const EMASK=mk();EMASK.c.width=EMASK.c.height=0;const ETV=document.createElement('canvas'),ETR=document.createElement('canvas'),ETB=document.createElement('canvas');let etS=null,etvP=0,etvDirty=false,etK=.95;/* where runs have been drawn on bare wall */const LAZY=[metal,shine,pool,etchL,fjL];/* shine is only used by Future Juice now */for(const o of LAZY){o.c.width=o.c.height=0}
function need(o){if(o.c.width!==baked.c.width||o.c.height!==baked.c.height){o.c.width=baked.c.width;o.c.height=baked.c.height;o.x.setTransform(dpr,0,0,dpr,0,0)}return o}
const WET={};for(const k in TAUS){WET[k]={...mk(),active:false,acc:0,until:0};WET[k].c.width=WET[k].c.height=1}
function wetC(k){const w=WET[k];if(w.c.width!==baked.c.width||w.c.height!==baked.c.height){w.c.width=baked.c.width;w.c.height=baked.c.height;w.x.setTransform(dpr,0,0,dpr,0,0)}return w}
let W=0,H=0,bands=[],compare=false,cur=SURF.find(s=>s.id==='wplastic')||SURF.find(s=>s.id==='glass'),cmpSet=['wplastic'];
let pen=PENS.find(p=>p.id==='gdl04')||PENS.find(p=>p.id==='ept10')||PENS[0],color=pen.colors[0],tool='draw',angle=40;
try{const st=JSON.parse(localStorage.getItem('mtb')||'{}');/* new defaults (4 mm ball squeezer on white plastic): applied once, then your own last pen/wall is remembered again */if(!localStorage.getItem('rlDef46')){delete st.pen;delete st.color;delete st.cur;delete st.cmp}if(Array.isArray(st.wet))wetSet=new Set(st.wet);if(st.pen)pen=PENS.find(p=>p.id===st.pen)||pen;color=pen.colors.includes(st.color)?st.color:pen.colors[0];if(st.cmp)cmpSet=st.cmp;if(st.cur)cur=SURF.find(s=>s.id===st.cur)||cur;if(st.wear)for(const p of PENS){const w=st.wear[p.id];if(w){p.life=w[0];p.fray=w[1];p.round=w[2]||0;p.mush=w[3]||0}}}catch(e){}
const save=()=>{try{localStorage.setItem('mtb',JSON.stringify({wet:[...wetSet],pen:pen.id,color,cmp:cmpSet,cur:cur.id,compare,fills:Object.fromEntries(PENS.filter(p=>p.fill).map(p=>[p.id,p.fill])),wear:Object.fromEntries(PENS.map(p=>[p.id,[+p.life.toFixed(3),+p.fray.toFixed(3),+(p.round||0).toFixed(3),+(p.mush||0).toFixed(3)]]))}))}catch(e){}};

/* RESIZE: switching apps, the app switcher, bars showing/hiding and rotation all resize the page. Nothing is touched
   while the page is hidden or mid-transition; a real resize carries EVERYTHING on the wall across — the ink, buff
   smudges and washes, the stored ghost, and the maps that say where ink is (so a later buff still finds the tag) */
let rotS=1,rotMin0=0;let layT=0,layPend=false;function layout(){if(!W)return doLayout();if(document.hidden){layPend=true;return}clearTimeout(layT);layT=setTimeout(doLayout,280)}
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&layPend){layPend=false;layout()}});
function doLayout(){
 cvR=null;const r=(cv.parentElement||cv).getBoundingClientRect();const w=Math.round(r.width),h=Math.round(r.height);if(w<10||h<10)return;
 /* the viewer's own bars/banners coming and going only nudge the height: keep the wall exactly as it is (pin the canvas
    to its size) rather than rebuilding it — rebuilding is only for a real change (rotation, new window width) */
 if(W&&w===W&&Math.abs(h-H)<H*.22){if(h!==H){cv.style.height=H+'px';cv.style.bottom='auto'}else{cv.style.height='';cv.style.bottom=''}cvR=null;return}
 cv.style.height='';cv.style.bottom='';
 const keep=W&&(w===W&&h===H);if(keep)return;if(down)resetPointerState();
 /* an aged wall is rebuilt from its un-aged state, then aged again at the same setting — otherwise the whole-wall wear gets carried over as a box */
 const aged=typeof ageSnap!=='undefined'&&!!ageSnap;if(aged)ageDrop();/* an aged wall's whole-surface wear isn't carried as a box: only the (aged) paint moves across */
 try{flushBleed(true)}catch(_){}
 for(const k0 of Object.keys(TC)){freeC(TC[k0].c);delete TC[k0]}
 for(const o of [stk,rimA,rimB,ovl,tmp,tmp2,ghostV,shine])freeC(o.c);for(const wt of Object.values(WET)){wt.c.width=wt.c.height=1;wt.active=false}try{if(_e2){freeC(_e2.canvas);_e2=null}}catch(_){}
 for(const g of [g3All,g3Opq,g3Dye,g3Out,g3Mul,g3Tmp])if(g&&g.width)freeC(g);g3All=g3Opq=g3Dye=g3Out=g3Mul=g3Tmp=null;g3Key='';g3Dirty=true;/* scratch tiles of every size ever used: free them before the rotation copies are made (mobile OOM) */
 const cp=o=>{if(!o||!o.c||!o.c.width||!o.c.height)return null;const c=document.createElement('canvas');c.width=o.c.width;c.height=o.c.height;c.getContext('2d').drawImage(o.c,0,0);return c};
 let old=null,olds=null,grids=null,ldBand=null;
 const oldW=W,oldH=H;
 let bMinX=1e9,bMinY=1e9,bMaxX=-1,bMaxY=-1;
 if(oldW&&oldH){
  /* extract only painted work without allocating two giant full-screen ImageData JS arrays (prevents mobile OOM crash on rotation) */
  old=cp(baked);
  if(old){
   try{if(aged)throw 0;
    const ww=old.width,hh=old.height,ox=old.getContext('2d',{willReadFrequently:true}),bgx=bg.x,strip=Math.max(32,Math.min(128,hh));let lbTop=1e9;try{if(typeof ledgeOn!=='undefined'&&ledgeOn&&!ledgeSlope()&&!isGlassPhoto())lbTop=Math.round((ledgeSpan().y0-30)*dpr)}catch(_){}/* paint pooled on the ledge goes to the new ledge, so it doesn't count toward the tag's size */
    for(let y0=0;y0<hh;y0+=strip){
     const sh=Math.min(strip,hh-y0),a=ox.getImageData(0,y0,ww,sh),bgd=bgx.getImageData(0,y0,ww,sh).data,d=a.data;
     for(let p=0,i=0;i<d.length;i+=4,p++){
      const df=Math.abs(d[i]-bgd[i])+Math.abs(d[i+1]-bgd[i+1])+Math.abs(d[i+2]-bgd[i+2]);
      if(df<5)d[i+3]=0;
      else{
       if(df<20)d[i+3]=Math.round(d[i+3]*(df-5)/15);
       if(d[i+3]>12){
        const px=p%ww,py=y0+((p/ww)|0);if(py>=lbTop)continue;
        if(px<bMinX)bMinX=px;if(px>bMaxX)bMaxX=px;
        if(py<bMinY)bMinY=py;if(py>bMaxY)bMaxY=py;
       }
      }
     }
     ox.putImageData(a,0,y0);
    }
    if(typeof ledgeOn!=='undefined'&&ledgeOn&&!ledgeSlope()&&!isGlassPhoto()){const oS=ledgeSpan(),top=oS.y0-30,y0=Math.max(0,Math.round(top*dpr)),lh=Math.min(old.height-y0,Math.round((oS.y1-top+40)*dpr));if(lh>0){const bd=document.createElement('canvas');bd.width=ww;bd.height=lh;const bdx=bd.getContext('2d');bdx.drawImage(old,0,y0,ww,lh,0,0,ww,lh);const bi=document.createElement('canvas');bi.width=ww;bi.height=lh;bi.getContext('2d').drawImage(idm.c,0,y0,ww,lh,0,0,ww,lh);ox.clearRect(0,y0,ww,lh);ldBand={c:bd,i:bi,oy0:oS.y0,top,y0px:y0,lh}}}
   }catch(_){try{const m=old.getContext('2d');m.globalCompositeOperation='destination-in';m.drawImage(idm.c,0,0)}catch(__){}}
  }
  const idmC=cp(idm);if(ldBand&&idmC)idmC.getContext('2d').clearRect(0,ldBand.y0px,idmC.width,ldBand.lh);
  olds=[[idm,idmC],[ghost,cp(ghost)],[ghostC,cp(ghostC)],[smearC,cp(smearC)],[metal,metal.c.width?cp(metal):null],[etchL,etchL.c.width?cp(etchL):null],[fjL,fjL.c.width?cp(fjL):null]];
  grids={GW,GH_,inkG,colG,washG,LM,LMW,LMH,LD:LD?(()=>{const c=document.createElement('canvas');c.width=LD.width;c.height=LD.height;c.getContext('2d').drawImage(LD,0,0);return c})():null};
 }
 /* compute old photo frame before mutating W, H */
 const im0=PHI[cur&&cur.id];
 const q0=(oldW&&oldH&&im0&&im0.width&&im0.height)?photoRect(cur.id,im0,oldW,oldH):null;
 W=w;H=h;
 for(const wt of Object.values(WET)){wt.c.width=wt.c.height=1;wt.active=false}
 for(const o of [{c:cv,x:dctx},bg,baked,stk,idm,rimA,rimB,ghost,ghostC,smearC,ovl]){o.c.width=Math.round(W*dpr);o.c.height=Math.round(H*dpr);o.x.setTransform(dpr,0,0,dpr,0,0)}
 for(const o of LAZY)if(o.c.width)need(o);
 measureLdg();buildBands();renderBg();initWater();let ldNewY0=0;try{if(ldBand)ldNewY0=ledgeSpan().y0}catch(_){ldBand=null}
 baked.x.drawImage(bg.c,0,0,W,H);
 let dx0=0,dy0=0,sc=1,dw0=old?old.width/dpr:W,dh0=old?old.height/dpr:H;
 if(old&&oldW&&oldH){
  if(q0&&im0&&im0.width&&im0.height){
   const q1=photoRect(cur.id,im0,W,H);sc=Math.min(q1.w/q0.w,q1.h/q0.h);
   const cx0=q0.x+q0.w/2,cy0=q0.y+q0.h*(cur.id==='glass'?CILL:.5);
   const cx1=q1.x+q1.w/2,cy1=q1.y+q1.h*(cur.id==='glass'?CILL:.5);
   dx0=cx1-cx0*sc;dy0=cy1-cy0*sc;
  }else{
   /* rotating keeps the tag its own size (a flip is not a zoom); it only shrinks if it would not fit, and grows back to its original size when there is room again */
   if(!rotMin0)rotMin0=Math.min(oldW,oldH);const sN=Math.min(1,Math.min(W,H)/rotMin0);sc=Math.max(.05,sN/rotS);dx0=(W-oldW*sc)/2;dy0=(H-oldH*sc)/2;
  }
  /* guarantee the entire painted tag fits inside the new viewport without cropping any edges on landscape<->portrait flips */
  if(bMaxX>bMinX&&bMaxY>bMinY){
   const minX=bMinX/dpr,maxX=bMaxX/dpr,minY=bMinY/dpr,maxY=bMaxY/dpr,tw=maxX-minX,th=maxY-minY,pad=8;
   /* keep the tag clear of the top bar and above the ledge */let topY=pad,botY=H-pad;try{const tb=document.querySelector('.bar.top'),cr=cv.getBoundingClientRect();if(tb){const r=tb.getBoundingClientRect();if(r.height>10&&r.bottom-cr.top<H*.4)topY=Math.max(pad,r.bottom-cr.top+6)}}catch(_){}if(ldBand)botY=Math.min(botY,ldNewY0-6);if(botY-topY<H*.35){topY=pad;botY=H-pad}
   const maxSc=Math.min((W-pad*2)/Math.max(1,tw),(botY-topY)/Math.max(1,th));
   if(sc>maxSc){
    const oCx=(minX+maxX)/2,oCy=(minY+maxY)/2;
    const nCx=dx0+oCx*sc,nCy=dy0+oCy*sc;
    sc=maxSc;
    dx0=nCx-oCx*sc;dy0=nCy-oCy*sc;
   }
   const l=dx0+minX*sc,ri=dx0+maxX*sc,t=dy0+minY*sc,bt=dy0+maxY*sc;
   if(l<pad)dx0+=(pad-l);else if(ri>W-pad)dx0-=(ri-(W-pad));
   if(bt>botY)dy0-=(bt-botY);if(dy0+minY*sc<topY)dy0+=(topY-(dy0+minY*sc));
   /* a tag whose runs reach the ledge stays sitting on the ledge: keep the same (scaled) gap between its lowest point and the ledge,
      so the runs still meet their pools after a turn, and a round trip puts it back where it was */
   if(ldBand){const gapOld=ldBand.oy0-maxY;if(gapOld>=0&&gapOld<70){const want=ldNewY0-gapOld*sc;dy0+=want-(dy0+maxY*sc);if(dy0+minY*sc<topY)dy0+=(topY-(dy0+minY*sc))}}
  }else{
   const maxSc=Math.min(W/oldW,H/oldH);
   if(sc>maxSc){sc=maxSc;dx0=(W-oldW*sc)/2;dy0=(H-oldH*sc)/2}
  }
  if(bMaxX>bMinX&&bMaxY>bMinY)rotS=Math.max(.05,Math.min(1.5,rotS*sc));else rotS=1;
  dw0=oldW*sc;dh0=oldH*sc;
  /* keep active mid-flight drips and wet reactions locked to the transformed tag */
  if(typeof drips!=='undefined'&&drips.length){
   const lmap=ldBand?(y=>ldNewY0+(y-ldBand.oy0)*sc):null,onL=y=>ldBand&&y>=ldBand.top;
   for(const d of drips){
    if(onL(d.y)){const ny=lmap(d.y);d.x=dx0+d.x*sc;if(d.sy!==undefined)d.sy=ny-(d.y-d.sy)*sc;d.y=ny;if(d.lx!==undefined){d.lx=d.x;d.ly=d.y}if(d.alx!==undefined){d.alx=d.x;d.aly=d.y}d.r=Math.max(.35,d.r*sc);d.onStep=0;continue}
    if(d.sx!==undefined)d.sx=dx0+d.sx*sc;if(d.oy0!==undefined)d.oy0=dy0+d.oy0*sc;if(d.outY!==undefined)d.outY=dy0+d.outY*sc;
    d.x=dx0+d.x*sc;d.y=dy0+d.y*sc;d.r=Math.max(.35,d.r*sc);
    if(d.lx!==undefined){d.lx=dx0+d.lx*sc;d.ly=dy0+d.ly*sc}
    if(d.alx!==undefined){d.alx=dx0+d.alx*sc;d.aly=dy0+d.aly*sc}
    if(d.sy!==undefined)d.sy=dy0+d.sy*sc;
    d.onStep=0;
   }
  }
  if(typeof wetQ!=='undefined'&&wetQ.length){for(const q of wetQ){q.x=dx0+q.x*sc;q.y=dy0+q.y*sc}}
  if(typeof falls!=='undefined')falls.length=0;/* drops already falling clear of the wall don't survive the turn */
  try{chanClear()}catch(_){}
  if(typeof ewRuns!=='undefined'&&ewRuns.length){for(const e of ewRuns){if(e.x!==undefined){e.x=dx0+e.x*sc;e.y=dy0+e.y*sc}}}
 }
 if(grids){
  const mapG=(A,B,w0,h0,w1,h1)=>{if(!A||!B)return;for(let y=0;y<h1;y++){const oy=Math.round((y*C-dy0)/(sc*C));if(oy<0||oy>=h0)continue;for(let x=0;x<w1;x++){const ox=Math.round((x*C-dx0)/(sc*C));if(ox<0||ox>=w0)continue;B[y*w1+x]=A[oy*w0+ox]}}};
  mapG(grids.inkG,inkG,grids.GW,grids.GH_,GW,GH_);mapG(grids.colG,colG,grids.GW,grids.GH_,GW,GH_);mapG(grids.washG,washG,grids.GW,grids.GH_,GW,GH_);
  const cpM=(A,B,w0,h0,w1,h1)=>{if(!A||!B)return;for(let y=0;y<Math.min(h0,h1);y++)for(let x=0;x<Math.min(w0,w1);x++)B[y*w1+x]=A[y*w0+x]};
  {const A=grids.LM,B=LM,w0=grids.LMW,h0=grids.LMH;if(A&&B)for(let y=0;y<LMH;y++){const oy=Math.round((y*2-dy0)/(sc*2));if(oy<0||oy>=h0)continue;for(let x=0;x<LMW;x++){const ox2=Math.round((x*2-dx0)/(sc*2));if(ox2<0||ox2>=w0)continue;B[y*LMW+x]=A[oy*w0+ox2]}}}
  if(grids.LD){const x=ldCtx();x.save();x.setTransform(1,0,0,1,0,0);x.drawImage(grids.LD,dx0*dpr/2,dy0*dpr/2,grids.LD.width*sc,grids.LD.height*sc);x.restore();freeC(grids.LD)}
  grids=null;
 }
 if(old){baked.x.drawImage(old,dx0,dy0,dw0,dh0);freeC(old);old=null}
 if(olds){for(const [o,c] of olds){if(c){o.x.drawImage(c,dx0,dy0,dw0,dh0);freeC(c)}}olds=null}
 if(ldBand){try{const yy=ldNewY0-(ldBand.oy0-ldBand.top)*sc,hh=ldBand.lh/dpr*sc;baked.x.drawImage(ldBand.c,dx0,yy,dw0,hh);idm.x.drawImage(ldBand.i,dx0,yy,dw0,hh)}catch(_){}freeC(ldBand.c);freeC(ldBand.i);ldBand=null}
 cillDirty=true;stDirty=true;dirty=true;lForce=true;g3Dirty=true;slForce=true;
}
function buildBands(){
 const list=[V(cur)];
 const rows=H>=W*.8,k=list.length;bands=list.map((s,i)=>rows?{s,x:0,y:Math.round(i*H/k),w:W,h:Math.round((i+1)*H/k)-Math.round(i*H/k)}:{s,x:Math.round(i*W/k),y:0,w:Math.round((i+1)*W/k)-Math.round(i*W/k),h:H});
 $('#labels').innerHTML=compare?bands.map(b=>`<div style="left:${b.x}px;top:${b.y}px">${b.s.name}</div>`).join(''):'';}
