/* ---------- PATCHY WETNESS: a wet wall is never evenly wet — damp and soaked zones plus old water tracks ---------- */
let WF=null,WFk='',wetSeed=(Math.random()*1e9)>>>0;
let FGW=1,FGH=1;/* WET WALL: water never sits evenly — big soaked patches, near-dry islands, smaller puddles inside those, and trickle
   tracks where water has run down. A fresh pattern every time the wall gets wet. */
function buildWetField(){FGW=Math.ceil(W/C)+1;FGH=Math.ceil(H/C)+1;const k=(bands[0]?bands[0].s.id:'')+FGW+'x'+FGH+':'+wetSeed;if(WFk===k&&WF)return;WFk=k;WF=new Float32Array(FGW*FGH);let sd=wetSeed;for(const ch of k)sd=(sd*31+ch.charCodeAt(0))>>>0;const r=()=>{sd=(sd*1664525+1013904223)>>>0;return sd/4294967296};
 const mkN=S=>{const gw=Math.ceil(FGW/S)+2,gh=Math.ceil(FGH/S)+2,N=Array.from({length:gw*gh},r);return(x,y)=>{const fx=x/S,fy=y/S,ix=fx|0,iy=fy|0,tx=fx-ix,ty=fy-iy,sx=tx*tx*(3-2*tx),sy=ty*ty*(3-2*ty),a=N[iy*gw+ix],b=N[iy*gw+ix+1],c=N[(iy+1)*gw+ix],d=N[(iy+1)*gw+ix+1];return a+(b-a)*sx+(c-a)*sy+(a-b-c+d)*sx*sy}};
 const big=mkN(24),mid=mkN(9),fine=mkN(3),sm=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t)};
 /* random soaked blotches scattered across the wall so wetness is genuinely patchy, never uniform/linear */
 const blobs=[];const nb=12+Math.floor(r()*8);for(let i=0;i<nb;i++)blobs.push({x:r()*FGW,y:r()*FGH,rx:5+r()*18,ry:6+r()*22,w:.45+r()*.55,dry:r()<.28});
 const trk=new Float32Array(FGW),tst=new Float32Array(FGW);for(let x=0;x<FGW;x++){trk[x]=r()<.16?.3+r()*.55:0;tst[x]=r()*FGH*.65}for(let x=1;x<FGW-1;x++)trk[x]=Math.max(trk[x],(trk[x-1]+trk[x+1])*.28);
 for(let y=0;y<FGH;y++)for(let x=0;x<FGW;x++){
  const v=big(x,y)*.55+mid(x,y)*.32+fine(x,y)*.13;
  let val=Math.pow(sm(.24,.8,v),1.55)*(.72+.32*y/FGH);
  for(let i=0;i<blobs.length;i++){const b=blobs[i],dx=(x-b.x)/b.rx,dy=(y-b.y)/b.ry,d2=dx*dx+dy*dy;if(d2<1){const fall=Math.pow(1-d2,1.6)*b.w;val=b.dry?val*(1-fall*.75):Math.max(val,val*.45+fall*.9)}}
  const t=y>tst[x]?trk[x]*(.5+.5*fine(x*2.1,y*.22)):0;
  WF[y*FGW+x]=Math.max(.03,Math.min(1,val+t));
 }}
const wetF=(x,y)=>WF?WF[Math.max(0,Math.min(FGH-1,Math.floor(y/C)))*FGW+Math.max(0,Math.min(FGW-1,Math.floor(x/C)))]:1;
function drawWetField(x){buildWetField();const c=document.createElement('canvas');c.width=FGW;c.height=FGH;const g=c.getContext('2d'),im=g.createImageData(FGW,FGH);for(let i=0;i<WF.length;i++){im.data[i*4+3]=Math.round(255*Math.max(0,WF[i]-.2)*.13)}g.putImageData(im,0,0);x.save();x.imageSmoothingEnabled=true;x.drawImage(c,0,0,FGW*C,FGH*C);x.restore()}
