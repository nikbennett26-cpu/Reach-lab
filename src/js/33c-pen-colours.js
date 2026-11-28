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
 const _r=renderCSheet;renderCSheet=function(){_r.apply(this,arguments);renderBrewPick()};
 q('cbrews')&&q('cbrews').addEventListener('click',e=>{const b=e.target.closest('[data-brew]');if(b)pickBrew(b.dataset.brew)});
 try{renderBrewPick()}catch(_){}
 /* stock colours added in 7.98.79-81 are gone: forget them */try{localStorage.removeItem('rlCols')}catch(_){}})();
