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
