/* ---------- share: caption the image, use the phone's share sheet, else show it to long-press ---------- */
let dlNS=null,shareFile=null;(async()=>{try{if(window.claude&&claude.use)dlNS=await claude.use('downloads')}catch(_){}})();
function loadImg(src){return new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.onerror=()=>r(null);i.src=src})}
async function captioned(srcs,cap){const ims=(await Promise.all(srcs.map(loadImg))).filter(Boolean);if(!ims.length)return null;const h=Math.max(...ims.map(i=>i.height)),gap=ims.length>1?Math.round(h*.02):0,w=ims.reduce((a,i)=>a+i.width*(h/i.height),0)+gap*(ims.length-1);
 const c=document.createElement('canvas');c.width=Math.round(w);c.height=h;const x=c.getContext('2d');x.fillStyle='#0b0b0b';x.fillRect(0,0,c.width,h);let px0=0;for(const i of ims){const iw=i.width*(h/i.height);x.drawImage(i,px0,0,iw,h);px0+=iw+gap}
 const fs=Math.max(14,Math.round(h*.026)),g=x.createLinearGradient(0,h-fs*4,0,h);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.72)');x.fillStyle=g;x.fillRect(0,h-fs*4,c.width,fs*4);
 x.font=`700 ${fs}px 'Barlow Condensed',sans-serif`;x.fillStyle='#f2efe8';x.textBaseline='bottom';x.fillText('REACH LAB BY RSM',fs*.8,h-fs*1.75);x.font=`500 ${Math.round(fs*.78)}px Barlow,sans-serif`;x.fillStyle='rgba(242,239,232,.82)';x.fillText(cap,fs*.8,h-fs*.6);
 return c.toDataURL('image/jpeg',.9)}
async function shareImg(url,name){try{const blob=await (await fetch(url)).blob(),file=new File([blob],name,{type:'image/jpeg'});
  if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:'Reach Lab by RSM'});return}}catch(e){if(e&&e.name==='AbortError')return}
 shareFile={url,name};const v=$('#shareView');$('#shareImg').src=url;$('#shareDl').hidden=false;v.hidden=false}
async function shareWall(){const cap=`${cur.name} · ${fmtT(new Date().toISOString())}`;const u=await captioned([bookSnap(true)],cap);if(u)shareImg(u,'reach-lab-wall.jpg')}


/* fast-forward every drying process on the wall */
let fastDry=false;
function dryNow(){
 const wasWet=wetSet.has(cur.id);if(wasWet){wetSet.delete(cur.id);rainSet.delete(cur.id);bands[0].s=V(cur);renderSurfs();renderReact();save()}
 fastDry=true;dirty=true;
 toast(wasWet?'Wall drying off — speeding up ink cure…':'Fast-drying…');
}

function fmtT(t){const d=new Date(t);return d.toLocaleDateString(undefined,{day:'numeric',month:'short'})+' '+d.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'})}

const BOTTLES=[];
try{const mx=JSON.parse(localStorage.getItem('rlMixes')||'[]');for(const m of mx)if(m&&m.id&&!BOTTLES.find(b=>b.id===m.id))BOTTLES.unshift(m)}catch(_){}
/* an empty squeezer stops calling itself empty once it has ink in it */
function penNm(p){const n=p.name||'';return p.empty&&p.fill&&(p.life??1)>0?n.replace(/^Empty\s+/i,'').replace(/^./,c=>c.toUpperCase()):n}
function fillPen(p,b,quiet){p.humect=b.humect||0;p.gloss=b.gloss||0;p.ruff=b.ruff||0;p.shift=b.shift||0;p.props=b.props?Object.assign({},b.props):null;if(p.squeeze)p.sat=0;if(b.juice&&p.valve)p.flow=Math.min(1.5,.9+b.juice*.6);p.fill=b.id;p.ink=b.ink;p.colors=b.colors.slice();p.inkLabel=b.label;p.shake=b.shake||p.ball?1:0;p.mix=p.shake?.12:1;/* the empty bullet has its own mixing ball: a fresh fill needs shaking */if(!quiet){p.life=1;p.flow=.35}if(p===pen&&!quiet){color=p.colors[0];renderRack();renderColors();renderReact();renderTop();save()}}
function showRefills(msg){renderFill();openSheet('penSheet');const fb=$('#fillBox');if(!fb||fb.hidden)return;requestAnimationFrame(()=>{fb.scrollIntoView({block:'start',behavior:'smooth'});fb.classList.remove('pulse');void fb.offsetWidth;fb.classList.add('pulse')});if(msg)toast(msg)}
