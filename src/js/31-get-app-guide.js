/* ---------- "Get the app" pop-up: install / Add to Home Screen / download ---------- */
const PUBLIC_URL='https://raw.githack.com/nikbennett26-cpu/reach-lab/main/index.html';/* a fresh stamp on every link so a phone browser never reopens an old saved copy */const liveURL=()=>PUBLIC_URL+'?v='+Date.now().toString(36);
const onWeb=/githack\.com$|github\.io$/.test(location.hostname);
if(onWeb){const l=document.createElement('link');l.rel='manifest';l.href='manifest.webmanifest';document.head.appendChild(l)}
let bip=null;addEventListener('beforeinstallprompt',e=>{e.preventDefault();bip=e});addEventListener('appinstalled',()=>{bip=null;$('#getApp').hidden=true;toast('Reach Lab installed')});
const isStandalone=()=>{try{return navigator.standalone||matchMedia('(display-mode: standalone)').matches||matchMedia('(display-mode: fullscreen)').matches}catch(_){return false}};
const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const inClaude=!onWeb&&!!(window.claude||/claude|anthropic/.test(location.hostname));
function openGetApp(){if(/androidplatform/.test(location.host))return;const g=$('#getApp');const can=!!bip;
 $('#gaInstall').hidden=!can;$('#gaGo').hidden=!can;$('#gaIOS').hidden=can||inClaude||!isIOS;$('#gaOther').hidden=can||inClaude||isIOS;
 $('#gaClaude').hidden=!inClaude;{const u=liveURL(),a=$('#gaLink');a.textContent=PUBLIC_URL;a.href=u}$('#gaCopy').hidden=!inClaude;$('#gaDl').hidden=!dlNS;$('#gaOk').hidden=can||inClaude?true:false;
 g.hidden=false}
function maybeGetApp(){if(isStandalone()||!$('#coach').hidden)return;let n=null;try{n=localStorage.getItem('rlGetApp')}catch(_){}if(n)return;openGetApp()}
const gaClose=()=>{$('#getApp').hidden=true;try{localStorage.setItem('rlGetApp','1')}catch(_){}};
$('#gaLater').addEventListener('click',gaClose);$('#gaOk').addEventListener('click',gaClose);
$('#gaGo').addEventListener('click',async()=>{if(!bip)return;bip.prompt();try{await bip.userChoice}catch(_){}bip=null;gaClose()});
$('#gaDl').addEventListener('click',()=>{gaClose();$('#dlApp').click()});
$('#gaCopy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(liveURL());toast('Link copied — paste it into Safari or Chrome')}catch(_){const r=document.createRange();r.selectNodeContents($('#gaLink'));const sl=getSelection();sl.removeAllRanges();sl.addRange(r);toast('Press and hold the link to copy it')}});
$('#getApp').addEventListener('click',e=>{if(e.target.id==='getApp')gaClose()});
$('#getAppBtn').addEventListener('click',()=>{closeSheets();openGetApp()});
setTimeout(maybeGetApp,2500);

/* FIRST-RUN GUIDE: one small callout at a time, pointing at a real button. A step finishes when that button is used (or Next);
   once every step is done or skipped it never shows again (Quick start in More replays it). */
const GSTEPS=[
 ['#penBtn','Pick a pen','Tap to choose a marker or squeezer. Empty ones need ink from the Brew Lab.'],
 ['#brewBtn','Brew your own ink','Mix a bottle from bases, pigments and additives, then fill an empty pen with it.'],
 ['#status','Pen gauges','Mixed, flow, ink left and tip wear. Tap to open them; drag the flow bar to squeeze harder.'],
 ['#cv','Write on the wall','Draw with your finger. Tilt the phone to steer the drips.'],
 ['#wipeT','Wipe','Clears the wall when you want a fresh start.'],
 ['#moreBtn','More','Replay your tag, record a video, age the wall, full screen and settings.']
];
let gI=-1,gOff=null,gT=0;
function guideDone(){try{localStorage.setItem('rlGuide','1')}catch(_){}gI=-1;clearTimeout(gT);if(gOff){gOff();gOff=null}$('#guide').hidden=true;$('#gRing').hidden=true}
function guideShow(i){
 clearTimeout(gT);if(gOff){gOff();gOff=null}
 if(i>=GSTEPS.length){guideDone();return}
 gI=i;const [sel,t,b]=GSTEPS[i],el=document.querySelector(sel),g=$('#guide'),ring=$('#gRing');
 if(!el||el.offsetParent===null&&sel!=='#cv'){guideShow(i+1);return}
 if(document.querySelector('.sheet.open,.coach:not([hidden])')){g.classList.add('off');ring.hidden=true;gT=setTimeout(()=>guideShow(i),400);return}
 $('#gT').textContent=t;$('#gB').textContent=b;$('#gN').textContent=(i+1)+' / '+GSTEPS.length;$('#gNext').textContent=i===GSTEPS.length-1?'Done':'Next';
 g.hidden=false;g.classList.remove('off');
 const r=sel==='#cv'?{left:innerWidth*.2,top:innerHeight*.38,width:innerWidth*.6,height:innerHeight*.2}:el.getBoundingClientRect();
 ring.hidden=false;Object.assign(ring.style,{left:r.left-4+'px',top:r.top-4+'px',width:r.width+8+'px',height:r.height+8+'px'});
 const gw=g.offsetWidth,gh=g.offsetHeight,below=r.top+r.height/2<innerHeight/2;
 g.style.left=Math.max(12,Math.min(innerWidth-gw-12,r.left+r.width/2-gw/2))+'px';
 g.style.top=Math.max(8,Math.min(innerHeight-gh-8,below?r.top+r.height+14:r.top-gh-14))+'px';
 const adv=()=>{gT=setTimeout(()=>guideShow(i+1),sel==='#cv'?1200:350)};
 el.addEventListener('pointerdown',adv,{once:true,capture:true});gOff=()=>el.removeEventListener('pointerdown',adv,{capture:true});
}
function startGuide(){guideShow(0)}
$('#gNext').addEventListener('click',()=>guideShow(gI+1));$('#gSkip').addEventListener('click',guideDone);
addEventListener('resize',()=>{if(gI>=0)guideShow(gI)});
let guideAsk=!seen;$('#coachBtn').addEventListener('click',()=>{closeSheets();guideAsk=true;coach.hidden=false});
$('#shakeBtn').addEventListener('click',()=>shake());
$('#scrim').addEventListener('click',closeSheets);
document.addEventListener('keydown',e=>{if(e.key==='ArrowRight')step(1);if(e.key==='ArrowLeft')step(-1);if(e.key==='Escape')closeSheets();if(e.key==='p'||e.key==='P'){audio();pump(null)}if(e.key==='s'||e.key==='S')shake();if((e.ctrlKey||e.metaKey)&&e.key==='z'){e.preventDefault()}});
let oriT=0;const onRot=()=>{clearTimeout(oriT);oriT=setTimeout(()=>{cvR=null;layout()},120)};addEventListener('orientationchange',onRot);try{screen.orientation&&screen.orientation.addEventListener('change',onRot)}catch(_){}const ro=new ResizeObserver(()=>{layout()});ro.observe(cv.parentElement||cv);

/* brews bottled before the shared stain model: read the recipe back out of the bottle label and re-work the stain & buff from it */
function mixMigrate(){const AN={hum:'humectant',surf:'flow agent',ret:'retarder',vio:'violet booster',oil:'oil stain',dot3:'brake fluid (DOT 3)',meth:'methylene blue',bitu:'bitumen / tar',pen:'solvent penetrant',xylene:'xylene / naphtha',fecl:'ferric chloride',acid:'phosphoric acid',mek:'MEK / acetone',silic:'silicone oil',rosin:'pine rosin',fish:'fish oil / Penetrol',garvey:'Garvey concentrate',silica:'fumed silica',wax:'beeswax / matte',methl:'methanol flash cut',agno3:'silver nitrate',uv:'UV brightener',shift:'colour shift',etch:'etching agent'},AI=Object.fromEntries(Object.entries(AN).map(([k,v])=>[v,k])),PI={};for(const id in PIGS)PI[PIGS[id].n]=id;PI['Prussian blue dye']='pruss';let ch=0;
 for(const B of BOTTLES){if(B.brand!=='Brew Lab'||B.recipe||!B.label)continue;const mt=B.label.match(/homemade: (\w+) base, (.*?), (\d+)% load, (\d+)% binder, (\d+)% thinner(?:, \+ (.*))?$/);if(!mt)continue;
  const pigs=[],amt={};let ok=true;if(mt[2]!=='clear base')for(const t of mt[2].split(' + ')){const m2=t.match(/^(.*?)(?: ×(\d+))?$/),id=PI[m2[1]];if(!id){ok=false;break}pigs.push(id);amt[id]=+(m2[2]||1)}
  const add=[];if(ok&&mt[6])for(const t of mt[6].split(', ')){const k=AI[t];if(!k){ok=false;break}add.push(k)}if(!ok)continue;
  const R={base:mt[1],pot:+mt[3],bind:+mt[4],thin:+mt[5],pigs,amt,add};try{const m={base:R.base,pot:R.pot,bind:R.bind,thin:R.thin,pigs:new Set(pigs),amt,add:new Set(add)},pr=mixProps(m);B.recipe=R;B.ink=mixType(m);B.props=Object.assign({},B.props||{},{buff:pr.buff,ghostCol:pr.ghostCol,ghostBoost:pr.ghostBoost,warns:pr.warns});B.note=INK[B.ink].label;ch++}catch(_){}}
 if(ch)try{const mx=JSON.parse(localStorage.getItem('rlMixes')||'[]');for(const m of mx){const B=BOTTLES.find(b=>b.id===m.id);if(B&&B.recipe){m.recipe=B.recipe;m.ink=B.ink;m.props=B.props;m.note=B.note}}localStorage.setItem('rlMixes',JSON.stringify(mx))}catch(_){}}
try{mixMigrate()}catch(_){}
