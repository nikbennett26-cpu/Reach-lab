/* ---------- PLAYBACK RECORDING, TILT REPLAY, SAVED LIBRARY & VIDEO EXPORT ---------- */
const recLogs={};
let playTail=false,recCur=null,recLastT=0,playOn=false,playRaf=0,playSaved=null,playRecMR=null,playRecChunks=[];
const playSpd=1;
function recKey(){return typeof bkey==='function'?bkey():(cur&&cur.id||'wall')}
function recList(){const k=recKey();if(!recLogs[k])recLogs[k]=[];return recLogs[k]}
function recClear(){recLogs[recKey()]=[];recCur=null;recLastT=0}
function recStart(p){
 if(playOn||demo||(tool!=='draw'&&tool!=='buff')||!W||!H)return;
 const now=performance.now(),G=gDir();
 const gap=recLastT?Math.min(750,Math.max(60,now-recLastT)):0,gapReal=recLastT?Math.min(600000,Math.max(0,now-recLastT)):0,seed=rngFresh();rngSeed(seed);
 recCur={
  seed,gapReal,wet:wetSet.has(cur.id),bm:typeof buffMode!=='undefined'?buffMode:null,rc:typeof rollCol!=='undefined'?rollCol:null,
  tool,penId:pen.id,fill:pen.fill||null,col:color,angle,leanSet,
  sat:pen.sat??0,flow:pen.flow??1,mix:pen.mix??1,vs:pen.vs??3,life:pen.life??1,
  gap,t0:now,
  pts:[[+(p.x/W).toFixed(4),+(p.y/H).toFixed(4),0,+(pressNow||.35).toFixed(3),+(leanNow||0).toFixed(3),+G.x.toFixed(3),+G.y.toFixed(3),+G.m.toFixed(2)]]
 };
}
function recPt(p){
 if(!recCur||playOn||!W||!H)return;
 const dt=Math.max(0,Math.round(performance.now()-recCur.t0));
 const nx=+(p.x/W).toFixed(4),ny=+(p.y/H).toFixed(4);
 const prev=recCur.pts[recCur.pts.length-1];
 if(prev&&Math.hypot((nx-prev[0])*W,(ny-prev[1])*H)<1.2&&dt-prev[2]<18)return;
 const G=gDir();
 recCur.pts.push([nx,ny,dt,+(pressNow||.35).toFixed(3),+(leanNow||0).toFixed(3),+G.x.toFixed(3),+G.y.toFixed(3),+G.m.toFixed(2)]);
}
function recEnd(){
 if(!recCur||playOn)return;
 recLastT=performance.now();
 const list=recList();
 list.push(recCur);
 if(list.length>180)list.shift();
 recCur=null;
}
function updatePlaySpdBtn(){const l=$('#playLbl');if(l)l.textContent='Replaying'}
function snapshotPlayState(){
 return {
  wet:wetSet.has(cur.id),rain:rainSet.has(cur.id),bm:typeof buffMode!=='undefined'?buffMode:null,rc:typeof rollCol!=='undefined'?rollCol:null,
  tool,pen,color,angle,leanSet,
  sat:pen.sat,flow:pen.flow,mix:pen.mix,vs:pen.vs,life:pen.life
 };
}
function restorePlayState(st){
 if(!st)return;
 tool=st.tool;pen=st.pen;color=st.color;angle=st.angle;leanSet=st.leanSet;
 if(st.bm){buffMode=st.bm;rollCol=st.rc}
 if(st.wet!==undefined&&st.wet!==wetSet.has(cur.id)){if(st.wet){wetSet.add(cur.id);if(st.rain)rainSet.add(cur.id)}else{wetSet.delete(cur.id);rainSet.delete(cur.id)}try{bands[0].s=V(cur);renderSurfs();renderReact()}catch(_){}}
 if(st.sat!==undefined)pen.sat=st.sat;
 if(st.flow!==undefined)pen.flow=st.flow;
 if(st.mix!==undefined)pen.mix=st.mix;
 if(st.vs!==undefined)pen.vs=st.vs;
 if(st.life!==undefined)pen.life=st.life;
 document.querySelectorAll('[data-tool]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.tool===tool));
 try{renderTop();renderColors();showFlow()}catch(_){}
}
const REC_HOLD_MS=4000,REC_MAX_MS=30000;/* min hold on the finished tag; fresh ink keeps recording (drips, drying) up to the max */ /* how long the finished tag stays on screen at the end of a recorded replay */
let lastVidBlob=null,lastVidName='reachlab-replay.mp4',lastVidUrl='';
/* fixed in-app: a fragmented MP4 from MediaRecorder carries a wrong/zero duration in its header; players then show only the first seconds */
function mp4FixDuration(u8){try{const d=new DataView(u8.buffer,u8.byteOffset,u8.byteLength),N=u8.length,u32=o=>d.getUint32(o),typ=o=>String.fromCharCode(u8[o+4],u8[o+5],u8[o+6],u8[o+7]);
 const kids=(s,e)=>{const r=[];let o=s;while(o+8<=e){let sz=u32(o),h=8;if(sz===1){sz=Number(d.getBigUint64(o+8));h=16}else if(sz===0)sz=e-o;if(sz<8||o+sz>e)break;r.push({o,sz,h,t:typ(o)});o+=sz}return r};
 const top=kids(0,N),moov=top.find(b=>b.t==='moov');if(!moov)return u8;const mk=kids(moov.o+8,moov.o+moov.sz),mvhd=mk.find(b=>b.t==='mvhd'),mvex=mk.find(b=>b.t==='mvex'),trak=mk.find(b=>b.t==='trak');if(!mvhd||!trak)return u8;
 const v0=u8[mvhd.o+8],mts=u32(mvhd.o+(v0?28:20));const tk=kids(trak.o+8,trak.o+trak.sz),tkhd=tk.find(b=>b.t==='tkhd'),mdia=tk.find(b=>b.t==='mdia');if(!tkhd||!mdia)return u8;const mdhd=kids(mdia.o+8,mdia.o+mdia.sz).find(b=>b.t==='mdhd');if(!mdhd)return u8;
 const vm=u8[mdhd.o+8],ts=u32(mdhd.o+(vm?28:20));let defDur=0;if(mvex){const trex=kids(mvex.o+8,mvex.o+mvex.sz).find(b=>b.t==='trex');if(trex)defDur=u32(trex.o+20)}
 let end=0;for(const mf of top.filter(b=>b.t==='moof'))for(const tf of kids(mf.o+8,mf.o+mf.sz).filter(b=>b.t==='traf')){const tb=kids(tf.o+8,tf.o+tf.sz);let base=0,dd=defDur,sum=0;
  const tfhd=tb.find(b=>b.t==='tfhd');if(tfhd){const fl=u32(tfhd.o+8)&0xffffff;let p=tfhd.o+16;if(fl&1)p+=8;if(fl&2)p+=4;if(fl&8)dd=u32(p)}
  const tfdt=tb.find(b=>b.t==='tfdt');if(tfdt)base=u8[tfdt.o+8]?Number(d.getBigUint64(tfdt.o+12)):u32(tfdt.o+12);
  for(const tr of tb.filter(b=>b.t==='trun')){const fl=u32(tr.o+8)&0xffffff,n=u32(tr.o+12);let p=tr.o+16;if(fl&1)p+=4;if(fl&4)p+=4;const per=((fl&0x100)?4:0)+((fl&0x200)?4:0)+((fl&0x400)?4:0)+((fl&0x800)?4:0);
   for(let i=0;i<n;i++){sum+=(fl&0x100)?u32(p+i*per):dd}}
  end=Math.max(end,base+sum)}
 if(!end||!ts)return u8;const mDur=Math.round(end/ts*mts);
 const put=(o,v,big)=>{if(big)d.setBigUint64(o,BigInt(v));else d.setUint32(o,Math.min(v,0xffffffff))};
 put(mvhd.o+(v0?32:24),mDur,v0);const vt=u8[tkhd.o+8];put(tkhd.o+(vt?36:28),mDur,vt);put(mdhd.o+(vm?32:24),end,vm);
 if(!mvex||kids(mvex.o+8,mvex.o+mvex.sz).some(b=>b.t==='mehd')){return u8}
 /* add the movie-extends header so players that read it know the full length up front */
 const out=new Uint8Array(N+16),od=new DataView(out.buffer);out.set(u8.subarray(0,mvex.o+8),0);od.setUint32(mvex.o+8,16);out.set([109,101,104,100],mvex.o+12);od.setUint32(mvex.o+16,0);od.setUint32(mvex.o+20,mDur);out.set(u8.subarray(mvex.o+8),mvex.o+24);
 od.setUint32(moov.o,moov.sz+16);od.setUint32(mvex.o,mvex.sz+16);return out}catch(_){return u8}}
function openVidModal(blob,name){
 lastVidBlob=blob;lastVidName=name;
 if(lastVidUrl){try{URL.revokeObjectURL(lastVidUrl)}catch(_){}}
 lastVidUrl=URL.createObjectURL(blob);
 const vp=$('#vidPrev');if(vp){vp.src=lastVidUrl;vp.load();vp.play().catch(()=>{})}
 const vv=$('#vidView');if(vv)vv.hidden=false;
}
function closeVidModal(){
 const vv=$('#vidView');if(vv)vv.hidden=true;
 const vp=$('#vidPrev');if(vp){try{vp.pause()}catch(_){}vp.removeAttribute('src');vp.load()}
}
bindTap($('#vidClose'),closeVidModal);
bindTap($('#vidShareBtn'),async()=>{if(lastVidBlob)await saveOrShareBlob(lastVidBlob,lastVidName,true)});
bindTap($('#vidSaveBtn'),async()=>{if(lastVidBlob)await saveOrShareBlob(lastVidBlob,lastVidName,false)});
function stopPlayVideo(){
 if(playRecMR&&playRecMR.state==='recording'){try{playRecMR.stop()}catch(_){}}
 const vb=$('#playVidBtn');if(vb)vb.textContent='Rec video';
}
function startPlayVideo(){
 if(!cv.captureStream||typeof MediaRecorder==='undefined'){toast('Video recording not supported in this browser');return false}
 if(playRecMR&&playRecMR.state==='recording'){stopPlayVideo();return false}
 try{
  const stream=cv.captureStream(24);
  const mime=['video/mp4;codecs=avc1.42E01E','video/mp4','video/webm;codecs=vp8','video/webm'].find(m=>{try{return MediaRecorder.isTypeSupported(m)}catch(_){return false}})||'';
  playRecChunks=[];
  playRecMR=mime?new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:2500000}):new MediaRecorder(stream);
  playRecMR.ondataavailable=e=>{if(e.data&&e.data.size)playRecChunks.push(e.data)};
  playRecMR.onstop=()=>{
   try{stream.getTracks().forEach(t=>t.stop())}catch(_){}
   if(!playRecChunks.length)return;
   const mType=playRecMR.mimeType||mime||'video/webm';
   const blob0=new Blob(playRecChunks,{type:mType});
   const ext=mType.includes('mp4')?'mp4':'webm';
   const ts=new Date().toISOString().slice(0,16).replace(/[:T]/g,'-');
   /* the recorder writes the MP4 in pieces and leaves the header saying it's only a few seconds long: write the real length in */
   const done=b=>openVidModal(b,'reachlab-'+ts+'.'+ext);
   if(ext==='mp4')blob0.arrayBuffer().then(ab=>done(new Blob([mp4FixDuration(new Uint8Array(ab))],{type:mType}))).catch(()=>done(blob0));else done(blob0);
  };
  playRecMR.start(500);
  const vb=$('#playVidBtn');if(vb)vb.textContent='Stop rec';
  toast('Recording replay video…');
  return true;
 }catch(_){toast('Could not start video capture on this device');return false}
}
function stopPlayback(showMsg){
 if(playTail&&!playOn){const sv=playTail;playTail=false;if(sv&&sv!==true)restorePlayState(sv);prepSnap();dirty=true;const h=$('#playHud');if(h)h.classList.remove('on');hudFade(false);return}
 if(!playOn)return;
 playOn=false;playGrav=null;
 if(playRaf){cancelAnimationFrame(playRaf);playRaf=0}
 if(stroke){try{feedEnd();end()}catch(_){}}
 down=false;
 stopPlayVideo();
 const hud=$('#playHud');if(hud)hud.classList.remove('on');
 hudFade(false);
 restorePlayState(playSaved);playSaved=null;
 dirty=true;
 if(showMsg)toast('Playback stopped');
}
function runPlaybackSeq(seq,extraBrews){
 if(!seq||!seq.length){toast('Nothing recorded on this wall yet — draw a tag first');return}
 if(playOn||playTail)stopPlayback(false);
 closeSheets();
 playSaved=snapshotPlayState();
 resetBoard();compose();dirty=false;
 playOn=true;playGrav=null;
 hudFade(true);
 updatePlaySpdBtn();
 const hud=$('#playHud');if(hud)hud.classList.add('on');
 const vb=$('#playVidBtn');if(vb)vb.hidden=!(cv.captureStream&&typeof MediaRecorder!=='undefined');
 let si=0,pi=0,phase='gap',tPhase=performance.now(),curS=null,curLast=null;
 const findBottle=id=>BOTTLES.find(x=>x.id===id)||(extraBrews&&extraBrews.find(x=>x.id===id))||null;
 const applyStrokeMeta=s=>{
  const targetPen=PENS.find(x=>x.id===s.penId)||pen;
  pen=targetPen;
  if(s.fill&&pen.fill!==s.fill){const b=findBottle(s.fill);if(b)fillPen(pen,b,true)}
  tool=s.tool;color=s.col;angle=s.angle;leanSet=s.leanSet;
  if(s.bm){buffMode=s.bm;rollCol=s.rc||null}
  /* the wall was wet or dry when this stroke was written */if(s.wet!==undefined&&s.wet!==wetSet.has(cur.id)){if(s.wet)wetSet.add(cur.id);else{wetSet.delete(cur.id);rainSet.delete(cur.id)}try{bands[0].s=V(cur);renderSurfs();renderReact()}catch(_){}}
  if(pen.squeeze)pen.sat=s.sat;
  pen.flow=s.flow;pen.mix=s.mix;if(s.vs!==undefined)pen.vs=s.vs;pen.life=s.life;
 };
 const setGravFromPt=q=>{
  if(q.length>=8){const m=q[7];playGrav={x:q[5],y:q[6],m,flat:m<.18?1:0}}
  else playGrav=null;
 };
 const step=()=>{
  if(!playOn)return;
  const now=performance.now();
  if(si>=seq.length){
   playOn=false;playGrav=null;playRaf=0;down=false;
   if(playRecMR&&playRecMR.state==='recording'){
    /* hold on the finished tag so the video doesn't cut straight back to a blank wall */
    const holdEnd=performance.now()+REC_HOLD_MS,maxEnd=performance.now()+REC_MAX_MS,fresh=()=>{try{const t=performance.now();return flowOn||drips.some(d=>!d.dead&&d.vol>.02)||(typeof falls!=='undefined'&&falls.length>0)||Object.values(WET).some(w=>w.active)||bleedL.some(b=>b.dur&&t<b.t0+b.dur)}catch(_){return false}};
    const saved=playSaved;playSaved=null;let restored=false;
    const restore=()=>{if(restored)return;restored=true;restorePlayState(saved);prepSnap();dirty=true};
    const keep=()=>{if(!(playRecMR&&playRecMR.state==='recording')){restore();return}dirty=true;
     try{const tr=playRecMR.stream&&playRecMR.stream.getVideoTracks()[0];if(tr&&tr.requestFrame)tr.requestFrame()}catch(_){}
     const tn=performance.now();if(tn<holdEnd||(tn<maxEnd&&fresh()))requestAnimationFrame(keep);else{stopPlayVideo();setTimeout(restore,350)}};
    requestAnimationFrame(keep);
   }else{
    /* keep the replay going until the drips, runs and blooms have played out too, the same as the video does */
    const saved=playSaved,maxEnd=performance.now()+REC_MAX_MS,minEnd=performance.now()+3000;playSaved=null;playTail=saved||true;
    const fresh=()=>{try{const t=performance.now();return flowOn||drips.some(d=>!d.dead&&d.vol>.02)||bleedL.some(b=>b.dur&&t<b.t0+b.dur)||(typeof falls!=='undefined'&&falls.length>0)}catch(_){return false}};
    const tail=()=>{if(!playTail)return;dirty=true;const tn=performance.now();if(tn<minEnd||(tn<maxEnd&&fresh())){requestAnimationFrame(tail);return}
     playTail=false;restorePlayState(saved);prepSnap();dirty=true;if(hud)hud.classList.remove('on');hudFade(false);toast('Replay finished')};
    requestAnimationFrame(tail);return;
   }
   if(hud)hud.classList.remove('on');
   hudFade(false);
   toast('Replay finished');
   return;
  }
  curS=seq[si];
  if(phase==='gap'){
   const gR=curS.gapReal??curS.gap??0;if(gR>2500&&!curS._ff){curS._ff=1;fastDry=true}
   const wait=Math.min(gR,2500)/playSpd,ffWait=gR>2500?Math.min(5000,(gR-2500)/6):0;
   if(now-tPhase>=wait&&(!fastDry||now-tPhase>=wait+ffWait||!curS._ff)){if(curS._ff){fastDry=false;curS._ff=0}
    applyStrokeMeta(curS);if(curS.seed)rngSeed(curS.seed);
    const pt0=curS.pts[0];
    setGravFromPt(pt0);
    const p={x:pt0[0]*W,y:pt0[1]*H,t:now};
    pressNow=pt0[3];leanNow=pt0[4];
    down=true;last=curLast=p;
    if(curS.tool==='draw'){
     begin(p,null);feed(p,null);
     if(stroke&&!(pen.valve&&pen.flow<.35))stamp(p.x,p.y,0,null);
    }else if(curS.tool==='buff'){
     ageDrop();pad.load=0;pad.col=null;pad.stk=null;pad.sb=null;pad.passId=(pad.passId||0)+1;pad.pool=0;pad.ptT=0;pad.runX=null;pad.holdT=0;pad.holdSq=0;pad.sqAcc=0;buffAt(p,p);
    }
    pi=1;phase='draw';tPhase=now;dirty=true;
   }
  }else if(phase==='draw'){
   const elapsed=(now-tPhase)*playSpd;
   while(pi<curS.pts.length&&curS.pts[pi][2]<=elapsed){
    const q=curS.pts[pi];
    setGravFromPt(q);
    const p={x:q[0]*W,y:q[1]*H,t:now};
    pressNow=q[3];leanNow=q[4];
    if(curS.tool==='draw'&&stroke){
     feed(p,null);
     if(!stroke.anc||Math.hypot(p.x-stroke.anc.x,p.y-stroke.anc.y)>5){stroke.anc={x:p.x,y:p.y};lastMove=now;stroke.dwell=0}
    }else if(curS.tool==='buff'){
     toolMove(curLast,p);
    }
    curLast=last=p;pi++;dirty=true;
   }
   if(pi>=curS.pts.length){
    down=false;
    if(curS.tool==='draw'){if(stroke)feedEnd();end()}
    else if(curS.tool==='buff'){lForce=true;g3Dirty=true;slForce=true;dirty=true}
    si++;phase='gap';tPhase=now;
   }
  }
  playRaf=requestAnimationFrame(step);
 };
 playRaf=requestAnimationFrame(step);
}
function startPlayback(){runPlaybackSeq(recList().slice(),null)}
