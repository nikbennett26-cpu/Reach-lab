/* ---------- STOCK COLOURS ON THE COLOUR CIRCLE ----------
   Any pen can carry extra colours on top of the ones its ink came with: pick from a palette of common marker colours or mix
   any colour with the picker. They're kept per pen (localStorage), survive refills, and can be removed again.
   The ink's behaviour (flow, drips, stain, buff) still comes from what's in the pen; only the colour changes. */
const PEN_PAL=['#111111','#f4f3ee','#8a8d91','#d41414','#ff5a14','#ffb000','#f2e21a','#9ef01a','#14a046','#0d6e4e','#14b4c8','#1e64d2','#163aa8','#4b1498','#a01ea8','#ff3c9c','#c91c6e','#6e3416','#c48e2a','#e8d7b0','#7fd7f0','#c8a0f0','#ffc8d8','#c0c4c8'];
function penColStore(){try{return JSON.parse(localStorage.getItem('rlCols')||'{}')||{}}catch(_){return {}}}
function penColSave(o){try{localStorage.setItem('rlCols',JSON.stringify(o))}catch(_){}}
function penExtrasOf(p){const o=penColStore();return (p&&o[p.id])||[]}
/* fold a pen's added colours into its colour list (called after every fill and at start-up) */
function penExtras(p){if(!p||!p.colors)return;for(const c of penExtrasOf(p))if(!p.colors.includes(c))p.colors.push(c)}
function penColAdd(c){if(!/^#[0-9a-f]{6}$/i.test(c))return;c=c.toLowerCase();const o=penColStore(),L=o[pen.id]||(o[pen.id]=[]);if(!pen.colors.includes(c)){if(!L.includes(c))L.push(c);penColSave(o);pen.colors.push(c)}color=c;renderColors();renderReact();save();toast(cname(c)+' added to this pen')}
function penColDel(c){const o=penColStore(),L=o[pen.id]||[];const i=L.indexOf(c);if(i<0)return;L.splice(i,1);penColSave(o);const j=pen.colors.indexOf(c);if(j>=0&&pen.colors.length>1)pen.colors.splice(j,1);if(color===c)color=pen.colors[0];renderColors();renderReact();save()}
function renderColAdd(){const g=document.getElementById('cadd'),m=document.getElementById('cmine');if(!g)return;
 g.innerHTML=PEN_PAL.filter(c=>!pen.colors.includes(c)).map(c=>`<button class="cs" data-add="${c}" aria-label="Add ${cname(c)}"><i style="background:${c}"></i>${cname(c)}</button>`).join('');
 const mine=penExtrasOf(pen);if(m){m.hidden=!mine.length;m.querySelector('.cgrid').innerHTML=mine.map(c=>`<button class="cs" data-del="${c}" aria-label="Remove ${cname(c)}"><i style="background:${c}"></i>✕ ${cname(c)}</button>`).join('')}}
/* ---------- YOUR BREWS ON THE COLOUR CIRCLE ----------
   The colour sheet lists the inks you've made in Brew Lab, so you can swap the pen to one with a tap, the way you'd pick up the
   bottle and fill it. Squeeze level and how much ink is left stay as they were, so switching mid-tag doesn't empty the pen. */
function myBrews(){return BOTTLES.filter(b=>b.brand==='Brew Lab'||b.brand==='Ink bench')}
function renderBrewPick(){const g=document.getElementById('cbrews'),box=document.getElementById('cbrewBox');if(!g||!box)return;const L=myBrews();/* only pens you fill yourself (squeezers, empties) take a brew */box.hidden=!(pen.fill||pen.empty||pen.fillReq||pen.squeeze);if(box.hidden)return;
 g.innerHTML=L.length?L.map(b=>`<button class="cs" data-brew="${b.id}" aria-pressed="${pen.fill===b.id}"><i style="background:${b.colors[0]}"></i>${(b.name||'My mix').replace(/</g,'&lt;')}</button>`).join(''):'<p class="small" style="grid-column:1/-1;margin:0;opacity:.7">No brews yet — make one in Brew Lab and it shows up here.</p>'}
function pickBrew(id){const b=BOTTLES.find(q=>q.id===id);if(!b)return;
 const sat=pen.sat,life=pen.life,mix=pen.mix;fillPen(pen,b,false);if(pen.squeeze&&sat!=null)pen.sat=sat;if(life!=null)pen.life=Math.max(.05,life);if(pen.shake&&mix!=null)pen.mix=Math.max(pen.mix,mix*.9);
 showFlow();renderColors();renderReact();save();closeSheets();toast(b.name||'Brew loaded')}
(()=>{const q=id=>document.getElementById(id);
 /* the colour sheet is rebuilt by renderCSheet(); keep the brew and stock sections in step with it */
 const _r=renderCSheet;renderCSheet=function(){penExtras(pen);_r.apply(this,arguments);renderBrewPick();renderColAdd()};
 for(const p of PENS)penExtras(p);
 q('cbrews')&&q('cbrews').addEventListener('click',e=>{const b=e.target.closest('[data-brew]');if(b)pickBrew(b.dataset.brew)});
 q('cadd')&&q('cadd').addEventListener('click',e=>{const b=e.target.closest('[data-add]');if(b)penColAdd(b.dataset.add)});
 q('cmine')&&q('cmine').addEventListener('click',e=>{const b=e.target.closest('[data-del]');if(b)penColDel(b.dataset.del)});
 const pk=q('cPick');q('cCustom')&&q('cCustom').addEventListener('click',()=>{if(!pk)return;pk.value=/^#[0-9a-f]{6}$/i.test(color)?color:'#ff5a14';pk.click()});
 pk&&pk.addEventListener('change',()=>penColAdd(pk.value));
 try{renderBrewPick();renderColAdd()}catch(_){}})();
