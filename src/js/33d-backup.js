/* ---------- BACK UP YOUR BREWS ----------
   Your brews live in the app's own storage. Moving to the Play Store version (or a new phone) means a fresh install, which starts
   empty, so they can be saved to a file and loaded back in. Loading adds brews; it never deletes the ones you have. */
function brewBackupBlob(){let mx=[];try{mx=JSON.parse(localStorage.getItem('rlMixes')||'[]')}catch(_){}
 return new Blob([JSON.stringify({app:'reachlab',kind:'brews',v:1,saved:new Date().toISOString(),brews:mx},null,1)],{type:'application/json'})}
function brewRestore(txt){let o;try{o=JSON.parse(txt)}catch(_){toast('That file isn\'t a Reach Lab backup');return}
 const L=Array.isArray(o)?o:(o&&Array.isArray(o.brews)?o.brews:null);if(!L){toast('That file isn\'t a Reach Lab backup');return}
 let mx=[];try{mx=JSON.parse(localStorage.getItem('rlMixes')||'[]')}catch(_){}let added=0;
 for(const b of L){if(!b||!b.id||!Array.isArray(b.colors))continue;if(mx.some(m=>m.id===b.id)||BOTTLES.some(q=>q.id===b.id))continue;mx.push(b);BOTTLES.unshift(b);added++}
 try{localStorage.setItem('rlMixes',JSON.stringify(mx))}catch(_){}try{mixMigrate()}catch(_){}try{renderMine();renderFill();renderCSheet()}catch(_){}
 toast(added?`${added} brew${added>1?'s':''} loaded`:'Those brews are already here')}
(()=>{const q=id=>document.getElementById(id);
 q('brewSave')&&q('brewSave').addEventListener('click',async()=>{const n=(()=>{try{return JSON.parse(localStorage.getItem('rlMixes')||'[]').length}catch(_){return 0}})();if(!n){toast('No brews to back up yet');return}
  const d=new Date(),stamp=d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0');await saveOrShareBlob(brewBackupBlob(),`reachlab-brews-${stamp}.json`,false)});
 const fi=q('brewFile');q('brewLoad')&&q('brewLoad').addEventListener('click',()=>fi&&fi.click());
 fi&&fi.addEventListener('change',()=>{const f=fi.files&&fi.files[0];fi.value='';if(!f)return;f.text().then(brewRestore).catch(()=>toast('Couldn\'t read that file'))})})();
/* ---------- SAVE / PLAY A TAG RECORDING ----------
   Every stroke on the wall is recorded (pen, colour, pressure, lean, timing, gravity) in screen-relative coordinates,
   so a tag saved on one phone replays at the same place and pace on any other screen. */
function tagBlob(){const seq=recList().slice();if(!seq.length)return null;/* carry the brews it was written with, so it replays in the same inks on a phone that doesn't have them */const ids=new Set(seq.map(r=>r.fill).filter(Boolean)),brews=BOTTLES.filter(b=>ids.has(b.id)&&/^mix/.test(b.id));
 return new Blob([JSON.stringify({app:'reachlab',kind:'tag',v:1,saved:new Date().toISOString(),wall:cur&&cur.id,w:W,h:H,brews,seq})],{type:'application/json'})}
function tagPlay(txt){let o;try{o=JSON.parse(txt)}catch(_){toast('That file isn\'t a Reach Lab tag');return}
 if(o&&o.kind==='brews'){brewRestore(txt);return}
 const seq=o&&Array.isArray(o.seq)?o.seq:null;if(!seq||!seq.length){toast('That file isn\'t a Reach Lab tag');return}
 if(o.wall&&cur&&o.wall!==cur.id){const sf=SURF.find(q=>q.id===o.wall);if(sf){try{goSurface(sf)}catch(_){}}}
 setTimeout(()=>runPlaybackSeq(seq,Array.isArray(o.brews)?o.brews:null),250)}
(()=>{const q=id=>document.getElementById(id);
 q('tagSave')&&q('tagSave').addEventListener('click',async()=>{const b=tagBlob();if(!b){toast('Write a tag on this wall first');return}
  const d=new Date(),stamp=d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0')+'-'+String(d.getHours()).padStart(2,'0')+String(d.getMinutes()).padStart(2,'0');await saveOrShareBlob(b,`reachlab-tag-${stamp}.json`,false)});
 const fi=q('tagFile');q('tagLoad')&&q('tagLoad').addEventListener('click',()=>fi&&fi.click());
 fi&&fi.addEventListener('change',()=>{const f=fi.files&&fi.files[0];fi.value='';if(!f)return;f.text().then(tagPlay).catch(()=>toast('Couldn\'t read that file'))})})();
