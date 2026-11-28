/* ---------- TRACE: a faint guide on the wall to practise a handstyle over ----------
   The guide is drawn over the wall on screen only. It is not ink: it never dries, drips, buffs or shows in a saved picture.
   The tag already on the wall is lifted off as a guide and the wall wiped, so you write it again over it. */
var TRACE={c:null,w:0,h:0,on:false,a:.35,col:'#2f8cff'};
function traceMk(w,h){const c=document.createElement('canvas');c.width=Math.max(1,w|0);c.height=Math.max(1,h|0);return c}
/* tint a mask (alpha only) in the guide colour */
function traceTint(c){const x=c.getContext('2d');x.save();x.setTransform(1,0,0,1,0,0);x.globalCompositeOperation='source-in';x.fillStyle=TRACE.col;x.fillRect(0,0,c.width,c.height);x.restore();return c}
function traceSet(c){if(TRACE.c)freeC(TRACE.c);TRACE.c=c;TRACE.w=W;TRACE.h=H;TRACE.on=true;traceUI();dirty=true;try{compose()}catch(_){}}
function traceClear(){if(TRACE.c)freeC(TRACE.c);TRACE.c=null;TRACE.on=false;traceUI();dirty=true;try{compose()}catch(_){}}
/* the wall's ink as a guide: the ink map holds every mark and run on the wall */
function traceFromWall(){if(!idm.c.width)return false;const c=traceMk(idm.c.width,idm.c.height),x=c.getContext('2d');x.drawImage(idm.c,0,0);
 let any=false;try{const d=x.getImageData(0,0,c.width,c.height).data;for(let i=3;i<d.length;i+=64)if(d[i]>20){any=true;break}}catch(_){any=true}
 if(!any){freeC(c);return false}traceSet(traceTint(c));return true}
/* drawn by compose(), last, over everything on the wall */
function drawTrace(x){if(!TRACE||!TRACE.on||!TRACE.c)return;const P=dpr,cw=Math.round(W*P),ch=Math.round(H*P);x.save();x.setTransform(1,0,0,1,0,0);x.globalCompositeOperation='source-over';x.globalAlpha=TRACE.a;
 if(TRACE.w===W&&TRACE.h===H)x.drawImage(TRACE.c,0,0);else{/* the screen has turned since the guide was made: fit it, don't stretch it */const s=Math.min(cw/TRACE.c.width,ch/TRACE.c.height),dw=TRACE.c.width*s,dh=TRACE.c.height*s;x.drawImage(TRACE.c,(cw-dw)/2,(ch-dh)/2,dw,dh)}
 x.restore()}
function traceUI(){const t=document.getElementById('traceToggle'),r=document.getElementById('traceA'),v=document.getElementById('traceAV');
 if(t){t.disabled=!TRACE.c;t.textContent=TRACE.c?(TRACE.on?'Guide: on':'Guide: off'):'Guide: none';t.setAttribute('aria-pressed',TRACE.on?'true':'false')}
 if(r)r.disabled=!TRACE.c;if(v)v.textContent=Math.round(TRACE.a*100)+'%';const cl=document.getElementById('traceClear');if(cl)cl.disabled=!TRACE.c}
(()=>{const q=id=>document.getElementById(id);
 q('traceWall')&&q('traceWall').addEventListener('click',()=>{if(!traceFromWall()){toast('Write a tag first, then trace it');return}closeSheets();q('wipeT').click();toast('Your tag is the guide now — write it again over the top')});
 q('traceToggle')&&q('traceToggle').addEventListener('click',()=>{if(!TRACE.c)return;TRACE.on=!TRACE.on;traceUI();dirty=true;try{compose()}catch(_){}});
 q('traceClear')&&q('traceClear').addEventListener('click',()=>traceClear());
 q('traceA')&&q('traceA').addEventListener('input',e=>{TRACE.a=clamp(+e.target.value/100,.05,.8);traceUI();dirty=true;try{compose()}catch(_){}});
 traceUI()})();
