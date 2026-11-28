/* one shared curve for 'how much does gravity pull': the sag solver, the runs and the landing blob all agree on when a tilt is enough */const gEffOf=m=>Math.max(0,(m-.12)/.88);
/* FULLY JUICED RUNS (from reference photos of flooded squeezer / paint-marker tags): the runs are fat — roughly a third to
   half the stroke's width — the same solid colour as the letter, hang in a close comb under every horizontal and curve bottom,
   and most are short stubby teeth a few stroke-widths long while about a third run the full height. The more the pen is
   juiced over 100%, the closer the runs get to that look; at normal flow they stay as they were. */
function juiceK(){return pen.squeeze?clamp(((pen.sat??0)-1)/.33):pen.valve?clamp(((pen.flow??1)-1)/.4):0}
function refRun(R0,r0,J){if(J<=.02)return {r:r0};const wide=R0*(.17+Math.random()*.15),stub=Math.random()<.68*Math.min(1,J*1.4);
 return {r:r0+(wide-r0)*J,rMax:Math.max(1.9,R0*.36),maxT:stub?R0*(1.1+Math.pow(Math.random(),1.6)*5):0,volK:stub?.9:1+.8*J}}
function drip(x,y,vol,o){if(!upright||drips.length>(o&&o.wash?340:240)||vol<.1)return;const dsid=(o&&o.sid)||((stroke&&stroke.sid)||lmSeq);/* a run can only leave from the UNDERSIDE of its own stroke: slide down to its bottom edge, not through older tags */if(!(o&&(o.soft||o.wash||o.et))){/* slide downhill along the actual pull of gravity - straight down, sideways or diagonal - to where the paint ends: the lowest point of the letter for this tilt */const G=gDir(),gm=Math.hypot(G.x,G.y);if(gm>.05){const ux=G.x/gm*2,uy=G.y/gm*2;let k=0;while(k<90&&(lmOwn((x+ux)|0,(y+uy)|0,dsid)||smAt((x+ux)|0,(y+uy)|0))){x+=ux;y+=uy;k+=2}}}const s=surfAt(x,y);if(s.absorb>.8)return;/* dry walls: 10% fewer runs start (full length when they do) */if(!s.wet&&!(o&&(o.wash||o.et||o.pool))&&Math.random()<.1)return;/* a bead that has sat and swelled always goes */const ty=o?o.ty:pen.ink;
 /* ONE BEAD, ONE RUN: ink collecting at the same low point (the foot of a stem, the bottom of a bowl) gathers into a single bead.
    A second run starting right beside one that has only just left joins it as extra volume, instead of the two running side by
    side as a wide, straight-edged curtain. And a run is never wider than about a third of the line it leaves. */
 if(!(o&&(o.soft||o.wash||o.et||o.pickUp))){const Rl=Math.max(2.5,(o&&o.w)||R()),near=Math.max(6,Rl*1.05),now=performance.now();
  for(const d of drips){if(d.wash||d.soft||d.et||d.done||d.vol<=0)continue;if(Math.abs(d.x-x)>near)continue;const y0=d.y0s!==undefined?d.y0s:d.y,dy=y-y0;if(dy<-Rl*2.5||dy>Rl*2.5)continue;if(d.y-y0>Rl*6||now-(d.tc||now)>2200)continue;
   d.vol+=vol*.7;if(d.v0!==undefined)d.v0+=vol*.7;if(d.maxT)d.maxT*=1.18;const cap=Rl*.38;d.rMax=Math.min(cap,Math.max(d.rMax||d.r,d.r*1.08));return}
  if(o){const cap=Rl*.38;if(o.r>cap)o.r=Math.max(.6,cap);if(o.rMax>cap)o.rMax=cap}}
 if(o&&o.et)etchOn=true;const _dbp=(o&&o.bp)||(!(o&&(o.soft||o.wash||o.et))?buffOf(ty,(o&&o.props)||(pen&&pen.props)||null):null);drips.push({y0s:y,pickUp:!!(o&&o.pickUp),sid:dsid,bp:_dbp,props:(o&&o.props)||(pen&&pen.props)||null,srcCell:(o&&o.srcCell!=null)?o.srcCell:-1,wash:o&&o.wash,et:o&&o.et,x,y,vol,v0:vol,wet:s.wet,t0:o&&o.delay?performance.now()+o.delay:0,tc:performance.now(),al:o&&o.al,thick:o?!!o.thick:THICK(),visc:o&&o.visc?o.visc:1,soft:!!(o&&o.soft),pigRun:!!(o&&o.pigRun),w:o&&o.w?o.w:R(),r:Math.min(o&&o.rMax?o.rMax:o&&o.thick?3.6:!o&&THICK()?2.8:1.9,o&&o.r?o.r:!o&&THICK()?Math.max(1.5,Math.min(2.8,R()*(.09+Math.random()*.08))):DYEINK[ty]?Math.max(.5,Math.min(1.3,R()*(.025+Math.random()*.05))):Math.max(.7,Math.min(1.9,R()*(.04+Math.random()*.09)))),ek:o&&o.ek,col:o?o.col:INK[ty]&&INK[ty].etch&&ETCHABLE[s.id]?color:(INK[ty]&&INK[ty].future&&Math.random()<.65?color:color),ink:INK[ty],comp:(o&&o.comp)?o.comp:null,wk:o?(ty==='fluid'?'fluid':ty):pen.wet||pen.ink,id:Object.keys(INK).indexOf(ty)+1,ty,ph:Math.random()*9,st0:(o&&o.st0)||(stroke&&stroke.dryT0)||performance.now(),yFrac:(wetSpan&&wetSpan.y1>wetSpan.y0+8)?clamp((y-wetSpan.y0)/Math.max(40,wetSpan.y1-wetSpan.y0)):.5,ov:pen.valve?clamp((pen.flow-.95)/.35):pen.squeeze?clamp(((pen.sat??0)-.98)/.25):clamp((flowNow(null)-.95)/.4),pts:[],/* on a wet wall each run has its own reach: some die out a short way down, most get partway, a few go the distance */lk:s.wet?1/(.45+.55*Math.random()):1,maxT:o&&o.maxT?o.maxT:s.wet&&Math.random()>.16?Math.max(12,(H-y)*(.07+.93*Math.pow(Math.random(),2.1))):0});
 {const d=drips[drips.length-1],k=sinkOf(ty);/* DYE RUNS carry the heavy settled pigment: as dark as the tag's settled bottom and rim, darker still from a flooded nib */if(k>0&&!d.wash&&!d.et&&!d.soft&&!d.al&&typeof d.col==='string'&&d.col[0]==='#'){const kk=Math.min(.6,k*(d.wet?1.3:1)),wall='#'+s.mean.map(v=>Math.round(v).toString(16).padStart(2,'0')).join('');
  d.wall=wall;d.kk=kk;d.pg={lite:d.col,deep:d.col,root:d.r*4+4};if(o&&o.src&&pigQ.length<80)pigQ.push({x,y,vol,col:d.col,k,w:o.w||R()})}}}
/* PIGMENT IN A RUN: the heavy pigment rides down in the bulge at the front of a run, so the trail it leaves is a thinner,
   paler film (the wall shows through), the root where it hangs off the letter stays full colour, and the pigment piles
   up in the bead where the run stops — the same flow that leaves a dark ring round a dried drop. Dyes move with their
   solvent and settle less than heavy pigment paints. */
const SINK={oil:.2,alcpaint:.17,water:.2,/* paint runs stay as solid as the letter all the way down (reference photos): only a slight thinning */alcohol:.2,stain:.22,bleed:.22,flow:.24,future:.18,fluid:.16,solid:0,chrome:0,etch:0},pigQ=[];
const sinkOf=ty=>{const k=SINK[ty];if(k!==undefined)return k;const I=INK[ty];return !I||I.chrome||I.etch||I.solid?0:.3};
function dcolNow(d,trav,done){const base=(d.pg?(done?d.pg.deep:d.col):d.col);if(!DYEINK[d.ty]||d.soft||d.et||d.wash||d.wet||typeof base!=='string'||base[0]!=='#')return base;const pDry=sm(clamp((performance.now()-((d.st0||0)+500))/8600));if(pDry<=.01)return base;const O=Math.min(1,d.ov||0),dk=lum(hex(base))<.3,deep=dyeDeep(base,1.9+((dk?.72:.55)+.25*O)*1.4);const u0=d.yFrac??.5,u=clamp(u0+((trav||0)/Math.max(90,(wetSpan&&wetSpan.y1>wetSpan.y0+8)?wetSpan.y1-wetSpan.y0:140)),0,1);const sStart=Math.max(0,.4-.15*O),loc=clamp((u-sStart)/Math.max(.15,(.75-.1*O)-sStart),0,1);return mixHex(base,deep,pDry*loc*Math.min(1,.95+.05*O))}
/* where a run drains out of a letter, the paint just above it has gone with it: a paler patch fading up into the letter */
function thinAbove(q){const G=gDir(),gm=Math.hypot(G.x,G.y)||1,ux=G.x/gm,uy=G.y/gm,L=Math.min(46,10+q.vol*12),w=Math.max(4,Math.min(16,q.w*.7)),D=Math.ceil(2*(L+w)*dpr),cx=q.x-ux*L*.45,cy=q.y-uy*L*.45,X=Math.round((cx-(L+w))*dpr),Y=Math.round((cy-(L+w))*dpr),t=tcan(D,'pg');
 const cc=colG[inkCell(q.x-ux*3,q.y-uy*3)];if(cc&&cc!==q.col)return;{const ty=inkAt(q.x-ux*3,q.y-uy*3);if(ty&&INK[ty]&&INK[ty].opacity>.85&&!DYEINK[ty])return}/* opaque paint stays solid where a run drained: no pale patch or visible join */const wall='#'+surfAt(q.x,q.y).mean.map(v=>Math.round(v).toString(16).padStart(2,'0')).join(''),lite=mixHex(q.col,wall,.45);
 t.x.setTransform(1,0,0,1,0,0);t.x.globalCompositeOperation='copy';t.x.globalAlpha=1;t.x.clearRect(0,0,D,D);t.x.globalCompositeOperation='source-over';
 t.x.save();t.x.translate((q.x-X/dpr)*dpr,(q.y-Y/dpr)*dpr);t.x.rotate(Math.atan2(uy,ux)+Math.PI/2);t.x.translate(0,-L*.3*dpr);t.x.scale(w/L,1);const g=t.x.createRadialGradient(0,0,0,0,0,L*.75*dpr);g.addColorStop(0,lite);g.addColorStop(.45,lite+'aa');g.addColorStop(1,lite+'00');t.x.fillStyle=g;t.x.fillRect(-L*dpr,-L*dpr,2*L*dpr,2*L*dpr);t.x.restore();
 {/* letters only — never the runs hanging below them */const mw=Math.ceil(D/dpr/2)+1,mc=document.createElement('canvas');mc.width=mc.height=mw;const mx=mc.getContext('2d'),im=mx.createImageData(mw,mw),bx0=X/dpr,by0=Y/dpr;for(let j=0;j<mw;j++)for(let i2=0;i2<mw;i2++)im.data[(j*mw+i2)*4+3]=lmAt(Math.round(bx0+i2*2),Math.round(by0+j*2))?255:0;mx.putImageData(im,0,0);t.x.globalCompositeOperation='destination-in';t.x.imageSmoothingEnabled=true;t.x.drawImage(mc,0,0,mw,mw,0,0,mw*2*dpr,mw*2*dpr);freeC(mc)}t.x.globalCompositeOperation='source-over';
 baked.x.save();baked.x.setTransform(1,0,0,1,0,0);baked.x.globalAlpha=Math.min(.35,(.15+q.vol*.06)*q.k*2);baked.x.drawImage(t.c,0,0,D,D,X,Y,D,D);baked.x.restore();dirty=true}
const wetQ=[];
function wetReact(rc,gain=1){const FW=baked.c.width,FH=baked.c.height,keys=Object.keys(INK);let id,bk;
 const X0=rc?Math.max(0,Math.floor(rc.x*dpr)):0,Y0=rc?Math.max(0,Math.floor(rc.y*dpr)):0,W2=rc?Math.min(FW-X0,Math.ceil(rc.w*dpr)):FW,H2=rc?Math.min(FH-Y0,Math.ceil(rc.h*dpr)):FH;if(W2<1||H2<1)return;
 try{id=idm.x.getImageData(X0,Y0,W2,H2).data;bk=baked.x.getImageData(X0,Y0,W2,H2).data}catch(_){return}
 const wets=Object.keys(WET).filter(k=>WET[k].active).map(k=>WET[k].x.getImageData(X0,Y0,W2,H2).data),st=Math.round((rc?9:15)*dpr);if(!rc)wetQ.length=0;const n0=wetQ.length;
 for(let y=0;y<H2;y+=st)for(let x=0;x<W2;x+=st){const j=(y*W2+x)*4;if(rc&&(Math.random()>.55||Math.hypot(x-W2/2,y-H2/2)>W2/2))continue;if(id[j+3]<80)continue;const ty=keys[Math.round(id[j]/20)-1];if(!ty)continue;
  let w=0;for(const d of wets)w=Math.max(w,d[j+3]/255);const ink=INK[ty],str=w>.05?(1-ink.wrep)*Math.min(1,w*1.5)*.85+.15:(ty==='water'?.32:0);
  if(str>0)wetQ.push({x:(X0+x)/dpr+(Math.random()-.5)*6,y:(Y0+y)/dpr+(Math.random()-.5)*6,str:str*gain,ty,col:`rgb(${bk[j]},${bk[j+1]},${bk[j+2]})`})}
 if(rc)return wetQ.length>n0;
 for(let i=wetQ.length-1;i>0;i--){const k=Math.floor(Math.random()*(i+1));[wetQ[i],wetQ[k]]=[wetQ[k],wetQ[i]]}
 const wv=Object.keys(WET).some(k=>WET[k].active);
 toast(wetQ.length?(wv?'Water hits the wet ink — it thins and runs':'Dry water-based paint softens and runs'):'All the ink is dry and waterproof — nothing moves')}
function wetStep(){if(!wetQ.length)return;const n=Math.max(4,Math.ceil(wetQ.length/90));
 for(const q of wetQ.splice(0,n)){const s=surfAt(q.x,q.y),ink=INK[q.ty],p={x:q.x,y:q.y};
  restoreBg(p,q.str*.06,9);smear(baked,p,{x:q.x+(Math.random()-.5)*2,y:q.y+2+q.str*3*(1-s.absorb*.6)},q.str*.25,8);
  if(Math.random()<q.str*.05*ink.run*(1-s.absorb))drip(q.x,q.y+2,.2+q.str*.45,{ty:q.ty,col:q.col,al:.55,r:.45+q.str*.9})}
 dirty=true}
const blooms=[],feathC={};
let feathM=null;function feather(col){if(feathC[col])return feathC[col];const S=96;
 if(!feathM){feathM=document.createElement('canvas');feathM.width=feathM.height=S;const x=feathM.getContext('2d'),im=x.createImageData(S,S);
  for(let j=0;j<S;j++)for(let i=0;i<S;i++){const dx=(i-S/2)/(S/2),dy=(j-S/2)/(S/2),d=Math.hypot(dx,dy),a=(Math.atan2(dy,dx)/TAU+1)%1,edge=Math.min(.84,.48+.24*n(18,1,a,.5)+.12*n(64,64,i/S,j/S)),v=clamp(1-d/edge)*clamp((.94-d)/.22),k=(j*S+i)*4;
   im.data[k]=im.data[k+1]=im.data[k+2]=255;im.data[k+3]=255*v*v*(.55+.45*n(32,32,i/S,j/S))}
  x.putImageData(im,0,0)}
 const ks=Object.keys(feathC);if(ks.length>48)delete feathC[ks[0]];
 const c=document.createElement('canvas');c.width=c.height=S;const x=c.getContext('2d');x.drawImage(feathM,0,0);x.globalCompositeOperation='source-in';x.fillStyle=col;x.fillRect(0,0,S,S);return feathC[col]=c}
function runBlooms(now){if(!blooms.length)return;const bx=baked.x;let k=0;
 for(let i=blooms.length-1;i>=0;i--){const b=blooms[i];if(now<b.t0)continue;const p=(now-b.t0)/b.life;if(p>=1){blooms.splice(i,1);continue}
  if(now<b.next)continue;b.next=now+110+Math.random()*80;if(++k>70)break;const ink=INK[b.ty],s=surfAt(b.x,b.y);
  const rad=b.r*(1.2+p*(b.drip?2.9:3.6))*(s.absorb>.3?.8:1),cy=b.y+b.r*(.3+p*(b.drip?1.8:2.6))*(1-s.absorb*.5);
  bx.save();bx.globalCompositeOperation=(s.id==='plastic'?'source-over':(ink.comp==='multiply'||b.drip?'multiply':'source-over'));bx.globalAlpha=(b.al||.022)*(1-p)*(1-ink.wrep*.7);
  bx.translate(b.x+(Math.random()-.5)*b.r*.55,cy);bx.scale(b.sx||1,1+p*(b.drip?.9:.7));bx.rotate(Math.random()*TAU);bx.drawImage(feather(qh(...hex(b.col))),-rad,-rad,2*rad,2*rad);bx.restore();
  if(!b.dripped&&p>.25&&Math.random()<.075*ink.run*(1-s.absorb)){b.dripped=1;drip(b.x+(Math.random()-.5)*rad,cy+rad*.6,.4+Math.random()*.7,{ty:b.ty,col:b.col,r:Math.min(1.5,Math.max(.6,b.r*.04+Math.random()*.6)),al:.6+Math.random()*.3})}}
 dirty=true}
const bleedQ=[],ghostSeen=new Set(),qh=(r,g,b)=>'#'+[r,g,b].map(v=>Math.min(255,Math.round(v/16)*16).toString(16).padStart(2,'0')).join('');
const bleedL=[],_bleedL=bleedL;
function queueBleed(){if(INK[pen.ink].comp==='multiply'||INK[pen.ink].etch)return;/* etch doesn't bleed — no extra overlay layers on it */const light=lum(hex(color))>=.68,x0=Math.max(0,Math.floor(stroke.x0*dpr)),y0=Math.max(0,Math.floor(stroke.y0*dpr)),w=Math.min(stk.c.width-x0,Math.ceil((stroke.x1-stroke.x0)*dpr)),h=Math.min(stk.c.height-y0,Math.ceil((stroke.y1-stroke.y0)*dpr));if(w<2||h<2)return;
 let a,id,bk;try{a=stk.x.getImageData(x0,y0,w,h).data;id=idm.x.getImageData(x0,y0,w,h).data;bk=baked.x.getImageData(x0,y0,w,h).data}catch(_){return}
 const keys=Object.keys(INK),out=new ImageData(w,h),o=out.data;let nh=0,nd=0,nb=0;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const j=(y*w+x)*4;if(a[j+3]<40||id[j+3]<60)continue;const ty=keys[Math.round(id[j]/20)-1],bkk=bleedK(pen.ink,ty);if(!bkk)continue;/* how strongly this dye comes up through this top ink (LAYER table) */const hard=(ty==='stain'||ty==='bleed')&&lum(hex(color))>=.4;const r=bk[j],g=bk[j+1],bb=bk[j+2];
  const mx0=Math.max(r,g,bb),ch=mx0-Math.min(r,g,bb);if(!hard&&ch<16)continue;/* any coloured dye comes through, dark reds included — not just bright ones */
  const gr=.5+.32*n(48,48,(x0+x)/TS,(y0+y)/TS)+.18*Math.random();
  if(ty==='bleed'){o[j]=r*.78+52;o[j+1]=g*.62+44;o[j+2]=bb*.72+62;nh++;nb++}else if(hard){const L=(r+g+bb)/3;o[j]=72+L*.28+(r-L)*.25;o[j+1]=56+L*.22;o[j+2]=168+L*.22;nh++}else{const k=Math.min(3.2,215/Math.max(20,mx0));o[j]=Math.min(255,r*k);o[j+1]=Math.min(255,g*k*.92);o[j+2]=Math.min(255,bb*k);nd++}
  o[j+3]=Math.min(255,(a[j+3]/255)*(id[j+3]/255)*255*gr*bkk*(hard?1:Math.min(1,.35+ch/70)))}
 if(nh+nd<30)return;const c0=document.createElement('canvas');c0.width=w;c0.height=h;c0.getContext('2d').putImageData(out,0,0);
 const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');
 try{x.filter=`blur(${7*dpr}px)`;x.globalAlpha=.5;x.drawImage(c0,0,0);x.filter=`blur(${1.1*dpr}px)`;x.globalAlpha=1;x.drawImage(c0,0,0);x.filter='none'}catch(_){x.drawImage(c0,0,0)}freeC(c0);
 const st=nh>nd?(nb>nh/2?(pen.ink==='oil'?.85:.7):.68):.38;bleedL.push({c,x:x0,y:y0,t0:performance.now()+2500,dur:26000,a:st,slow:1});/* bleed-through takes time: it creeps up over the next while, not in a flash */
 setTimeout(()=>toast(nh>nd?'The stain will creep back up through the paint — violet, it won’t stay hidden':'The dye underneath will slowly bleed up through the paint'),2200)}
/* WET WALL: the fresh mark's ink slides down with the water film as a soft curtain — densest at the mark,
   fading into uneven vertical fringes (like ink on wet canvas). A little of the mark itself goes with it. */
