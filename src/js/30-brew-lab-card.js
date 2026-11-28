function mixRead(m){const t=mixType(m),I=INK[t],kd=mixKind(m),juice=Math.max(0,(m.thin-m.bind*.5)/100)+(m.add.has('surf')?.25:0)+(m.add.has('methl')?.24:0)+(m.add.has('garvey')?.18:0)+(m.add.has('ret')?.12:0)+(m.add.has('dot3')?.14:0)+(m.add.has('pen')?.12:0)+(m.add.has('fish')?.08:0)-(m.add.has('bitu')?.1:0)-(m.add.has('silica')?.26:0)-(m.add.has('wax')?.18:0);const SM=stainModel(m),stain=SM.ghost,stWhy=(SM.dom?PIGS[SM.dom].n.split(' /')[0].toLowerCase():'no dye')+' in '+m.base+' · '+(SM.P>=.75?'deep':SM.P>=.45?'medium':'shallow')+' penetration'+(SM.L>=.3?' · binder locks it in':'');const bar=v=>'▮'.repeat(Math.round(clamp(v)*5))+'▯'.repeat(5-Math.round(clamp(v)*5));const mc=mixColor(m),pr=mixProps(m);const dryTxt=pr.tauMul<=.65?'flash-dry (evaporates mid-run)':pr.tauMul>=1.7?'very slow (stays wet & tacky)':pr.tauMul>=1.25?'slow — runs longer':m.base==='paint'?'medium (opaque paint)':m.base==='water'?'medium, re-wets in water':'fast (alcohol)';const viscTxt=pr.viscMul>=1.4?'thick & syrupy':pr.viscMul<=.75?'thin & runny':'balanced';const ingTxt=[...m.pigs].map(id=>PIGS[id]?.n).filter(Boolean).join(' + ')||'No pigment (clear base)';return {t,juice,mc,pr,kd,html:`<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px"><i style="width:28px;height:28px;border-radius:50%;flex:none;background:${mc};border:2px solid #555"></i><div><b style="font-size:15px">${kd==='dye'&&m.base!=='alcohol'&&/alcohol/i.test(I.label)?I.label.replace(/alcohol/i,m.base==='oil'?'oil':m.base):I.label}</b><div style="opacity:.75;font-size:12px">${ingTxt} · ${viscTxt}</div></div></div>
 Stain&nbsp;&nbsp; ${bar(stain)} &nbsp;${stain>=.55?'hard — bites deep':stain>=.3?'medium':'light'} <span style="opacity:.6">(${stWhy})</span><br>
 Cover&nbsp;&nbsp; ${bar(kd==='paint'||kd==='metal'?.65+m.pot/250:I.opacity*.7)}<br>
 Runny&nbsp; ${bar(.25+juice*.9+(I.drip||0)*.2+(1-pr.viscMul)*.25)} &nbsp;${pr.viscMul>=1.4?'heavy slow runs':juice>.4?'very drippy':juice>.15?'juicy':'holds its line'}<br>
 Dry&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${dryTxt}${pr.matte?' · matte hydrophobic':(m.bind>50||m.add.has('fish')||m.add.has('rosin'))?' · glossy finish':''}${pr.pearl?' · pearl shimmer':''}${pr.photoDark?' · photo-darkens':''}<br>
${pr.corrosive>0?` Bite&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${bar(pr.corrosive)} &nbsp;${pr.corrosive>=.6?'corrosive — etches & permanently stains':'hot solvent bite'}<br>`:''} Buff&nbsp;&nbsp;&nbsp;&nbsp; ${buffTxt(buffOf(t,pr))}${(m.add.has('hum')||m.add.has('dot3'))?'<br>Nib&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; stays wet uncapped':''}${pr.warns&&pr.warns.length?'<div style="margin-top:6px;padding:6px 8px;border-radius:6px;background:rgba(214,64,34,.18);border:1px solid rgba(214,64,34,.45);color:#ffb4a2;font-size:12px">⚠ '+pr.warns.join('<br>⚠ ')+'</div>':''}`}}
function renderMix(){for(const b of document.querySelectorAll('#mxBase .btn'))b.setAttribute('aria-pressed',b.dataset.v===MX.base);for(const b of document.querySelectorAll('#mxAdd .btn')){b.setAttribute('aria-pressed',MX.add.has(b.dataset.v));let cl=false;if(!MX.add.has(b.dataset.v)){try{const n0=mixCompat(MX).warns.length,a2=new Set(MX.add);a2.add(b.dataset.v);cl=mixCompat(Object.assign({},MX,{add:a2})).warns.length>n0}catch(_){}}b.classList.toggle('clash',cl)}$('#mxAddTxt').innerHTML=[...MX.add].map(k=>ADD[k]).join('<br>')||'Tap to add. Each one changes how the ink behaves.';
 $('#mxPotV').textContent=MX.pot+'%';$('#mxBindV').textContent=MX.bind+'%';$('#mxThinV').textContent=MX.thin+'%';
 $('#mxSw').innerHTML=Object.entries(PIGS).map(([id,g])=>`<button class="btn" data-p="${id}" aria-pressed="${MX.pigs.has(id)}" style="display:inline-flex;align-items:center;gap:6px"><i style="width:12px;height:12px;border-radius:50%;background:${g.c};border:1px solid #666;flex:none"></i>${g.n}</button>`).join('');
 const pt=$('#mxPigTxt');if(pt)pt.innerHTML=[...MX.pigs].filter(id=>PIGS[id]).map(id=>'<b>'+PIGS[id].n+':</b> '+PIGS[id].d).join('<br>')||'Tap one or more raw colourants/pigments to mix your colour from scratch.';
 renderAmt();$('#mxOut').innerHTML=mixRead(MX).html}
function renderMine(){const mine=BOTTLES.filter(b=>b.brand==='Brew Lab'||b.brand==='Ink bench'),el=$('#mxMine');if(!el)return;
 el.innerHTML=mine.length?'<span class="lbl">Your inks</span>'+mine.map(b=>`<div class="row" style="align-items:center;justify-content:space-between;gap:10px;margin:0 0 6px"><span style="display:flex;align-items:center;gap:10px;min-width:0"><i style="width:22px;height:22px;border-radius:50%;flex:none;background:${b.colors[0]};border:1px solid #444"></i><span class="small" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${b.name.replace(/</g,'&lt;')}</span></span><span style="display:flex;gap:6px">${b.recipe?`<button class="btn" data-edit="${b.id}">Edit</button>`:''}<button class="btn" data-del="${b.id}" aria-label="Delete ${b.name.replace(/"/g,'')}">Delete</button></span></div>`).join(''):''}
function delMix(id){const i=BOTTLES.findIndex(b=>b.id===id);if(i<0)return;const n=BOTTLES[i].name;BOTTLES.splice(i,1);try{const mx=JSON.parse(localStorage.getItem('rlMixes')||'[]').filter(m=>m.id!==id);localStorage.setItem('rlMixes',JSON.stringify(mx))}catch(_){}
 renderMine();renderFill();toast(`${n} deleted — pens already filled with it keep the ink until they run dry`)}
function openMix(){renderMix();renderMine();openSheet('mixSheet')}
/* PARTS: how much of each colourant goes in — drives the colour, the stain and the buff, not just which ones are ticked */
function renderAmt(){const el=$('#mxAmt');if(!el)return;const ids=[...MX.pigs].filter(id=>PIGS[id]);if(ids.length<1){el.innerHTML='';return}const sh=pShares(MX);
 el.innerHTML='<span class="lbl" style="display:block;margin:2px 0 4px">Amounts (parts)</span>'+ids.map(id=>{const g=PIGS[id],v=Math.round((MX.amt[id]||1));return `<div class="amtR"><i style="background:${g.c}"></i><span>${g.n}</span><input type="range" min="1" max="10" step="1" value="${v}" data-amt="${id}" aria-label="${g.n} parts"><b data-amtv="${id}">${v} · ${Math.round((sh[id]||0)*100)}%</b></div>`}).join('')}
function amtLabels(){const sh=pShares(MX);for(const b of document.querySelectorAll('#mxAmt [data-amtv]')){const id=b.dataset.amtv;b.textContent=`${Math.round(MX.amt[id]||1)} · ${Math.round((sh[id]||0)*100)}%`}}
function bottleMix(){const r=mixRead(MX),n=($('#mxName').value||'').trim()||'My mix '+(BOTTLES.filter(b=>b.brand==='Brew Lab'||b.brand==='Ink bench').length+1);
 const _pp=[...MX.pigs].filter(id=>PIGS[id]),_eq=_pp.every(id=>(MX.amt[id]||1)===(MX.amt[_pp[0]]||1)),pList=_pp.map(id=>PIGS[id].n+(!_eq?' ×'+(MX.amt[id]||1):'')).join(' + ')||'clear base';
 const B={id:'mix'+Date.now().toString(36),brand:'Brew Lab',name:n,ink:r.t,colors:[r.mc],props:r.pr,humect:(MX.add.has('hum')||MX.add.has('dot3'))?1:0,gloss:(MX.bind>50||MX.add.has('rosin')||MX.add.has('fish'))&&!MX.add.has('wax')&&r.kd!=='metal'?1:0,shift:MX.add.has('shift')?1:0,shake:(r.kd==='paint'||r.kd==='metal'||MX.pigs.has('pearl'))?1:0,juice:+r.juice.toFixed(2),label:`${n} — homemade: ${MX.base} base, ${pList}, ${MX.pot}% load, ${MX.bind}% binder, ${MX.thin}% thinner${MX.add.size?', + '+[...MX.add].map(k=>({hum:'glycerin',surf:'flow agent',ret:'retarder',methl:'methanol',pen:'penetrant',vio:'violet booster',oil:'oil stain',dot3:'brake fluid',meth:'blue booster',xylene:'xylene',mek:'acetone',acid:'acid bite',fecl:'rust etch',agno3:'silver darkener',garvey:'Garvey ink',bitu:'tar',rosin:'rosin',fish:'Penetrol',silica:'gel thickener',wax:'beeswax',silic:'silicone',uv:'UV brightener',shift:'colour shift',etch:'glass etch'})[k]||k).join(', '):''}`,note:`${INK[r.t].label}${r.juice>.15?' · juicy':''}`,recipe:{base:MX.base,pot:MX.pot,bind:MX.bind,thin:MX.thin,pigs:[..._pp],amt:Object.fromEntries(_pp.map(id=>[id,MX.amt[id]||1])),add:[...MX.add]}};
 BOTTLES.unshift(B);try{const mx=JSON.parse(localStorage.getItem('rlMixes')||'[]');mx.unshift(B);localStorage.setItem('rlMixes',JSON.stringify(mx.slice(0,20)))}catch(_){}
 if(pen.empty||pen.fillReq){fillPen(pen,B);toast(`${n} bottled and loaded into the ${penNm(pen)}`)}else toast(`${n} bottled — pick an empty marker to fill it`);
 closeSheets();if(pen.empty||pen.fillReq)setTimeout(()=>{renderFill()},0)}
function renderFill(){const box=$('#fillBox');if(!box)return;box.hidden=!(pen.empty||pen.fillReq);if(!(pen.empty||pen.fillReq))return;
 const el=$('#bottles');if(!BOTTLES.length){el.innerHTML=`<div class="small" style="opacity:.75;padding:6px 0">No store refills — mix a custom batch in the <b>Brew Lab</b> to fill this pen.</div>`;return}
 el.innerHTML=BOTTLES.map(b=>`<button class="bt" data-bt="${b.id}" aria-pressed="${pen.fill===b.id}"><i style="background:${b.colors[0]}"></i><b>${b.brand} ${b.name}</b><span>${b.note}</span></button>`).join('')}
/* Future Juice: thin, fast ink dries to a surface-dependent colour; pooled ink stays violet-blue */
const FJ={glass:['#b8ae4e','#bab6df'],wplastic:['#b3aa4c','#b6b2dc'],plastic:['#a9a24c','#a9a5d2']};
const futDry=s=>FJ[s.id]||FJ.glass;const shifts=[];
function poolAt(x,y,r,v){const a=v===0?.18:.004+.05*Math.pow(clamp(1-(v||0)/.9),2),p=need(pool).x;p.fillStyle=`rgba(0,0,0,${a.toFixed(3)})`;p.beginPath();p.arc(x,y,r*.85,0,TAU);p.fill()}

const inc=(t,a,b)=>{const c0=t*a,c1=t*b;return c1>=1?1:Math.max(0,(c1-c0)/(1-c0))};
function runShifts(now){for(let i=shifts.length-1;i>=0;i--){const p=shifts[i],pr=sm(clamp((now-p.t0)/p.T)),d=pr-p.done;if(d<.012&&pr<1)continue;
 const bx=baked.x;bx.save();bx.globalAlpha=inc(.97,p.done,pr);bx.drawImage(p.lay,p.x,p.y,p.w,p.h);bx.globalAlpha=inc(.6,p.done,pr);bx.drawImage(p.ed,p.x,p.y,p.w,p.h);bx.restore();p.done=pr;dirty=true;if(pr>=1)shifts.splice(i,1)}}
/* PEN SHELF: grouped by what kind of tool it is (that's how you'd reach for one), then by brand and size */
const PTYPES=[['marker','Markers'],['squeeze','Squeezers'],['mop','Mops & daubers'],['stick','Paint sticks']];let typeF='all';
function ptype(p){const k=penKind(p);if(k==='stick')return'stick';if(k==='mop')return'mop';if(k==='squeeze'||k==='needle')return'squeeze';return'marker'}
function renderTypes(){$('#ptypes').innerHTML=[['all','All types'],...PTYPES].filter(([k])=>k==='all'||PENS.some(p=>ptype(p)===k)).map(([k,n])=>`<button class="t solo bf" data-pt="${k}" aria-pressed="${k===typeF}">${n}</button>`).join('')}
function renderRack(){const card=p=>`<button class="pen" data-id="${p.id}" aria-pressed="${p===pen}">${penSVG(p)}<b>${p.brand} ${penNm(p)}</b><span>${p.w} mm ${p.tip} · ${(p.inkLabel||INK[p.ink].label).replace(/ \(.*\)/,'')}</span>${p.metal?'<i class="gh own">Metal tip</i>':''}${(()=>{const g=ghostTag(p),d=drippyTag(p);return(g||d)?`<span class="tags">${d}${g}</span>`:''})()}</button>`;
 const list=PENS.filter(p=>(brandF==='All'||p.brand===brandF)&&(typeF==='all'||ptype(p)===typeF)).sort((a,b)=>a.brand.localeCompare(b.brand)||a.w-b.w);
 if(typeF!=='all'){$('#rack').innerHTML=list.map(card).join('')||'<p class="hint">Nothing of that kind from this brand.</p>';return}
 $('#rack').innerHTML=PTYPES.map(([k,n])=>{const g=list.filter(p=>ptype(p)===k);return g.length?`<h3 class="rackH">${n} <small>${g.length}</small></h3>`+g.map(card).join(''):''}).join('')}

const CNAMES=[['Black','#121212'],['White','#f6f6f2'],['Silver','#b9bdc2'],['Gold','#c9a24a'],['Red','#d62b1f'],['Blue','#1f4fbf'],['Cyan','#19b8e6'],['Yellow','#ffd400'],['Pink','#ff4fa3'],['Magenta','#c0157a'],['Green','#2a8a3a'],['Olive','#5a5a28'],['Purple','#6a3aa8'],['Orange','#f07a1a'],['Rust','#8a3418'],['Brown','#5a3420'],['Grey','#8a8d90'],['Copper black','#2b1a12'],['Violet-blue','#3b2fc0'],['Cream frost','#ece6d6'],['Neon green','#3dff6a'],['Neon yellow','#e8ff2a']];
/* nearest colour name by hue first (weighted by how saturated each side is), then lightness and saturation —
   catches sky blues, cyans, olives and browns that a plain RGB-distance match used to call "Chrome" or "Grey" */
function rgb2hls(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2;if(mx===mn)return[0,l,0];const d=mx-mn,s=l>.5?d/(2-mx-mn):d/(mx+mn);let h;if(mx===r)h=(g-b)/d+(g<b?6:0);else if(mx===g)h=(b-r)/d+2;else h=(r-g)/d+4;return[h/6,l,s]}
const CNHLS=CNAMES.map(([n,h])=>{const v=hex(h);return[n,...rgb2hls(v[0],v[1],v[2])]});
function cname(c){if(pen.fb2&&FB2[c])return FB2[c][1];if(pen.ink==='chrome')return'Chrome';if(pen.ink==='etch')return'Frost etch';if(pen.ink==='future')return'Colour shift';
 const v=hex(c),[h,l,sat]=rgb2hls(v[0],v[1],v[2]);let best='',bd=1e9;
 for(const[n,h2,l2,s2]of CNHLS){const dh=Math.min(Math.abs(h-h2),1-Math.abs(h-h2)),satW=Math.max(sat,s2)>0?Math.sqrt(Math.min(sat,s2)):0,d=(dh*2.2)**2*satW*3+(l-l2)**2+(sat-s2)**2*1.2;if(d<bd){bd=d;best=n}}
 return best}
function renderCSheet(){const html=pen.colors.map(c=>`<button class="cs" data-c="${c}" aria-pressed="${c===color}"><i style="background:${pen.fb2&&FB2[c]?`linear-gradient(135deg,${FB2[c][0]} 50%,${c} 50%)`:c}"></i>${cname(c)}${METAL[c]?' · metallic':''}</button>`).join('');
 $('#cgrid').innerHTML=html;$('#colTitle').textContent='Colours';$('#colHint').textContent=`${pen.brand} ${penNm(pen)} — ${pen.colors.length} colour${pen.colors.length>1?'s':''}`+((pen.empty||pen.fillReq)&&!pen.fill?'. Fill it with an ink first.':'');const _cd=$('#colDot');if(_cd)_cd.style.background=color}
function renderColors(){renderFill();renderCSheet();$('#colors').innerHTML=`<button class="sw" style="background:${color}" data-c="${color}" aria-label="Colour: ${cname(color)} — change" aria-pressed="true"></button>${pen.colors.length>1?`<span class="ccount">${pen.colors.length}</span>`:''}`;
 $('#angleBox').style.display=pen.tip==='chisel'?'':'none';$('#angleV').innerHTML=angleArt(angle);const fb=$('#flip');fb.hidden=!pen.ends;$('#newnib').hidden=!!(pen.metal||INK[pen.ink].solid||pen.ink==='etch'&&pen.tip==='needle');$('#vsBox').hidden=!pen.adjust;if(pen.adjust){$('#vs').value=pen.vs;$('#vsV').textContent=['Trickle','Low','Medium','High','Flood'][pen.vs-1]}if(pen.ends)fb.textContent='Flip to '+pen.ends[1-(pen.end||0)].tip;showFlow();showMix();showHint()}
function meter(id,lbl,txt,w,cls){$(id).style.width=clamp(w)*100+'%';$(id).className=cls||'';$(lbl).textContent=txt}
function showMix(){if(pen.shake)meter('#mixI','#mixLbl',`Mixed ${Math.round(pen.mix*100)}%`,pen.mix,pen.mix<.5?'low':'');else meter('#mixI','#mixLbl','No mixing ball',0)}
function showFlow(){
 if(pen.valve)meter('#flowI','#flowLbl',`Ink flow ${Math.round(pen.flow*100)}%`,pen.flow/1.5,pen.flow>1.1?'hot':pen.flow<.4?'low':'');
 else if(pen.squeeze){const sat=pen.sat??0;meter('#flowI','#flowLbl',`Squeeze ${Math.round(sat*100)}%`,sat/1.6,sat>1.15?'hot':sat<.45?'low':'')}else meter('#flowI','#flowLbl','Felt: steady flow',.66*lifeF());
 meter('#lifeI','#lifeLbl',`Ink left ${Math.round(pen.life*100)}%`,pen.life,pen.life<.15?'low':'');
 if(pen.tipDry>.2)meter('#frayI','#frayLbl',pen.tipDry>.7?'Tip: dried out':'Tip: drying',1-pen.tipDry,'low');else if(pen.metal)meter('#frayI','#frayLbl','Tip: metal, no wear',1);else if(INK[pen.ink].solid){const w=pen.sw||0;meter('#frayI','#frayLbl',w<.12?'Tip: bullet point':w<.55?'Tip: wearing flat':w<.97?'Tip: nearly flat':'Tip: flat face',1-w*.6,'')}else if((pen.mush||0)>.3)meter('#frayI','#frayLbl','Tip: mushed down',1-pen.mush*.7,pen.mush>.6?'low':'');else if((pen.round||0)>.3&&pen.fray<.3)meter('#frayI','#frayLbl','Tip: corners rounded',1-pen.round*.6,pen.round>.7?'low':'');else{if(pen.fray>.7&&!saidNib++)toast('Nib\u2019s wrecked \u2014 Pens \u203a New nib swaps it');meter('#frayI','#frayLbl',pen.fray<.05?'Tip: fresh':pen.fray<.3?'Tip: bedded in':pen.fray<.7?'Tip: fraying':'Tip: wrecked',1-pen.fray,pen.fray>.3?'low':'')}}
var saidNib=0;
function showHint(){const h=[];if(pen.shake)h.push('<b>Tap the pen card</b> to shake');if(pen.valve)h.push('<b>hold the tip still</b> on the board to prime');if(pen.squeeze)h.push('<b>hold still</b> to squeeze out more'+(upright&&INK[pen.ink].drip>.5?' (it drips)':''));if(pen.ends)h.push('<b>Flip</b> switches ends');if(pen.adjust)h.push('<b>Flow valve</b> below: high flow and slow strokes drip, quick strokes stay clean');if(pen.tip==='chisel')h.push('<b>twist two fingers</b> to turn the chisel');$('#hint').innerHTML=h.join(' · ')}
function swatch(s){ensure(s);const c=document.createElement('canvas');c.width=c.height=68;const x=c.getContext('2d');x.drawImage(s.tile,0,0,TS*.3,TS*.3,0,0,68,68);const im=PHI[s.id];if(im)drawPhoto(x,im,0,0,68,68);else if(s.scene)s.scene(x,0,0,68,68);return c}
function renderSurfs(){const box=$('#surfs');box.innerHTML='';for(const s of SURF){const b=document.createElement('button');b.className='sc';b.dataset.id=s.id;
 b.setAttribute('aria-pressed',s===cur);b.append(swatch(s),s.name);box.append(b)}
 const wt=wetSet.has(cur.id),rn=wt&&rainSet.has(cur.id),wb=$('#wetBtn');$('#wetTxt').textContent=rn?'Rain':wt?'Wet':'Dry';wb.setAttribute('aria-pressed',wt);
 $('#sName').innerHTML=`<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/></svg><span class="snm">${cur.name}</span>`;$('#sName').title=`Surface ${SURF.indexOf(cur)+1}/${SURF.length}`}
function renderCap(){const b=$('#capBtn');if(!b)return;b.setAttribute('aria-pressed',pen.capped);b.title=pen.capped?'Capped':'Cap off — the tip dries if left'}
function renderTop(){renderCap();$('#penMini').innerHTML=penSVG(pen);$('#penName').textContent=`${pen.brand} ${penNm(pen)}`;$('#penTip').textContent=`${pen.w}mm ${pen.tip==='chisel'?'chisel':pen.tip==='needle'?'needle':pen.tip==='roller'?'roller':'round'} · ${(pen.inkLabel||INK[pen.ink].label).replace(/ \(.*\)/,'')}`;$('#shakeBtn').style.display=pen.shake?'':'none'}
const boards={},recent=[];
function freeBoard(b){if(b)for(const k of [0,1,4,5,6])if(b[k]&&b[k].getContext)freeC(b[k])}
function snap(){const c=document.createElement('canvas'),i=document.createElement('canvas');c.width=i.width=baked.c.width;c.height=i.height=baked.c.height;c.getContext('2d').drawImage(baked.c,0,0);i.getContext('2d').drawImage(idm.c,0,0);return[c,i,inkG.slice(),colG.slice(),metalOn&&metal.c.width?cloneC(metal.c):null,etchOn&&etchL.c.width?cloneC(etchL.c):null,fjOn&&fjL.c.width?cloneC(fjL.c):null,LM.slice(),satOn&&SAT?cloneC(SAT):null]}
const bkey=()=>cur.id;
window.__rlSel=(id,sid)=>{if(id){pen=PENS.find(p=>p.id===id);color=pen.colors[0];pen.life=1;pen.mix=1;pen.flow=1;pen.capped=false;pen.tipDry=0;renderTop()}if(sid)goSurface(SURF.find(q=>q.id===sid))};
function goSurface(a,b,c){ageDrop();const r=goSurfaceInner(a,b,c);prepSnap();return r}
function goSurfaceInner(s){if(s===cur)return;for(const L of bleedL){const g=baked.x;g.save();g.setTransform(1,0,0,1,0,0);g.globalAlpha=L.a*(L.slow?sm(clamp((performance.now()-L.t0)/L.dur)):1);g.drawImage(L.c,L.x,L.y);g.restore();freeC(L.c)}bleedL.length=0;wetQ.length=0;chromes.forEach(finChrome);chromes.length=0;const k0=bkey();freeBoard(boards[k0]);boards[k0]=snap();recent.unshift(k0);for(const id of recent.splice(6))if(!recent.includes(id))delete boards[id];
cur=s;resetBoard();const b=boards[bkey()];if(b){for(const [o,c] of [[baked,b[0]],[idm,b[1]]]){o.x.save();o.x.setTransform(1,0,0,1,0,0);o.x.drawImage(c,0,0);o.x.restore()}if(b[2]&&b[2].length===inkG.length){inkG.set(b[2]);colG=b[3]}if(b[7]&&b[7].length===LM.length)LM.set(b[7]);if(b[8]){const c=satC().getContext('2d');c.save();c.setTransform(1,0,0,1,0,0);c.drawImage(b[8],0,0);c.restore();satOn=true}putMetal(b[4]);putFJ(b[6]);putEtch(b[5])}
 renderSurfs();renderReact();save();compose();dirty=false}
const sheets=['penSheet','surfSheet','moreSheet','infoSheet','colorSheet','mixSheet'];
function openSheet(id){$('#'+id).scrollTop=0;for(const x of sheets)$('#'+x).classList.toggle('open',x===id);$('#scrim').classList.add('on')}
(()=>{let y0=null,el=null;document.addEventListener('touchstart',e=>{const sh=e.target.closest&&e.target.closest('.sheet.open');if(!sh||sh.scrollTop>0){y0=null;return}el=sh;y0=e.touches[0].clientY},{passive:true});document.addEventListener('touchmove',e=>{if(y0===null||!el)return;const d=e.touches[0].clientY-y0;if(d>0&&el.scrollTop<=0){el.style.transition='none';el.style.transform=`translateY(${d}px)`}},{passive:true});document.addEventListener('touchend',e=>{if(y0===null||!el)return;const d=(e.changedTouches[0]||{}).clientY-y0;el.style.transition='';el.style.transform='';if(d>90)closeSheets();y0=null;el=null})})();
function closeSheets(){for(const x of sheets)$('#'+x).classList.remove('open');$('#scrim').classList.remove('on')}
function dryRem(ink,s){return ink.rem[s.absorb>.3?1:0]}
function react(s){const ink=INK[pen.ink],rgb=hex(color),bead=s.repel*ink.bead,cov=inkAlpha(ink,s)*mixF()*(1-bead*.6)*(1-s.rough*.25),m=s.mean,
 eff=ink.comp==='multiply'?m.map((v,i)=>v*rgb[i]/255):m.map((v,i)=>v+(rgb[i]-v)*cov);
 return{vis:clamp(Math.abs(lum(eff)-lum(m))*1.6),hold:1-dryRem(ink,s),bleed:clamp(ink.bleed*s.absorb),skip:clamp(s.rough*.8+bead*.5),dry:3*TAUS[pen.wet||pen.ink]*(1-s.absorb*.5)}}
function notes(s){const ink=INK[pen.ink],o=[buffTxt(buffOf(pen.ink,pen.props))+'.'],bead=s.repel*ink.bead;
 if(bead>.3)o.push(`Beads on ${s.name.toLowerCase()} — expect patchy cover; let it dry and add a second coat.`);
 if(pen.ink==='alcohol'&&lum(s.mean)<.3)o.push('Translucent dye ink — hardly shows on a dark surface.');
 if(pen.ink==='oil'&&s.repel>0)o.push('Oil-based paint grips clean non-porous surfaces well and cures permanent.');
 if(ink.bleed*s.absorb>.3)o.push(`Absorbent: ink wicks into the ${s.gx>1.5?'grain and spreads along it':'fibres and feathers'}. Hold still and watch it spread.`);
 if(s.rough>.5)o.push('Rough texture: the tip skips over low spots — slow down or re-prime for solid cover.');
 if(s.wet)o.unshift(INK[pen.ink].wrep>.4?'Wet surface: water repels this paint — it skips over the beads and thins out.':'Wet surface: the ink mixes with the water, thins and runs.');
 if(INK[pen.ink].chrome){const q=CHQ[s.id]??.3;o.unshift(q>.8?'Smooth, non-porous: the pigments align into a mirror as the solvent evaporates.':'Texture or porosity breaks the pigment alignment — expect dull silver, not chrome.');o.push('One even pass: overlaps go dull, and touching it before it dries ruins the mirror.')}
 if(pen.ink==='stain')o.push('Hard-staining dye: it soaks in — scrubbing leaves a heavy ghost and it bleeds back up through paint as a purple-brown shadow.');
 if(pen.ink==='bleed')o.push('Bleed Thru ink: paint over it (especially oil paint) and it resurfaces through the coat.');
 if(pen.ink==='alcpaint')o.push('Alcohol-based paint: opaque like a paint marker but touch-dry in seconds.');
 if(pen.squeeze&&pen.ink!=='fluid')o.push('Squeeze body: hold longer for more paint — on an upright board it runs and drips.');
 if(pen.best&&!pen.best.includes(s.id))o.push(`${s.name} isn’t on the maker’s recommended list.`);
 if(pen.ink==='fluid'&&s.flex>.5)o.push('Correction fluid dries brittle — it will crack if this surface flexes.');
 if(pen.ink==='water'&&s.absorb<.3)o.push('Dry water-based paint still wipes off here with a damp cloth.');
 if(pen.valve)o.push('Valve tip: hold the tip still to prime it. Keep holding past full and it floods a blob.');
 return o.slice(0,4)}
const bar=v=>`<div class="bar2"><i style="width:${Math.round(v*100)}%"></i></div>`;
/* INFO CARD — how this pen's liquid behaves here (kept in step with the physics) */
function behaveHTML(){const ink=INK[pen.ink],s=cur?V(cur):null,o=[];if(!ink||!s)return'';const t=pen.ink;
 if(ink.etch)o.push(ETCHABLE[s.id]?'Goes on as a clear wet line. About 5 s after you lift, the whole tag frosts together — thin edges and runs first.':'Etch only bites glass, bus windows and glazed tiles — here it just leaves a faint residue.');
 else{
  if(!ink.solid&&!pen.dauber){const cap={alcohol:'a lot',stain:'a lot',bleed:'a lot',flow:'a lot',future:'a lot',water:'quite a bit',alcpaint:'a little',oil:'only slightly',chrome:'a little'}[t]||'a little';o.push(pen.squeeze?'Hold still to squeeze out more — it blots, and on an upright wall it runs.':`Hold the tip still and the dot keeps spreading (${cap}), sags on an upright wall and lets go as a run once it's heavy.`)}
  if(pen.squeeze&&!pen.dauber)o.push('Air gets back into the bottle: now and then it burps a splat and spray, more after a pause or when it’s nearly empty.');
  if(!ink.solid&&!ink.chrome&&(ink.drip||0)>.2&&s.absorb<.8){const dt=(TAUS[t]||1.5)*2.2*(s.wet?3:1)*(1-s.absorb*.5);o.push(`Runs wander and catch on grit, then skin over and stop with a fat bead — on this surface after roughly ${Math.round(dt*1.5)}–${Math.round(dt*2.5)} s. Heavy runs can surge ahead on a thin thread.`)}
  
  const f=FAM(t);if(f==='dye'||f==='stain')o.push('Over dry alcohol ink it re-dissolves the old line — drags its colour along and feathers a soft halo where you cross.');
 }
 if(isGlassPhoto&&isGlassPhoto())o.push('Runs that reach the stone cill pool there, join up, creep forward and spill over the front edge — drops fall from it.');
 if(s.id==='stairs')o.push('Runs that reach the steps pool on each tread, spill over the nosing and cascade down onto the next.');
 return o.length?`<h2 style="margin-top:14px">How it behaves</h2><ul class="notes">${o.map(x=>`<li>${x}</li>`).join('')}</ul>`:''}
function renderReact(){const list=bands.map(b=>b.s),ink=INK[pen.ink],pr=pen.props;
 const chemRows=pr?`<dt>Dry rate</dt><dd>${pr.tauMul>=1.7?'Very slow (tacky)':pr.tauMul>=1.25?'Slow (runs longer)':'Fast'}${pr.skinOver?' · skins over mid-cure':''}</dd><dt>Viscosity</dt><dd>${pr.viscMul>=1.4?'Thick &amp; syrupy':pr.viscMul<=.75?'Thin &amp; runny':'Balanced'}</dd><dt>Stain &amp; buff</dt><dd>${buffTxt(buffOf(pen.ink,pr))}</dd>`:`<dt>Buff</dt><dd>${buffTxt(buffOf(pen.ink,null))}</dd>`;
 const warnHtml=pr&&pr.warns&&pr.warns.length?`<p class="warn">⚠ ${pr.warns.join('<br>⚠ ')}</p>`:'';
 $('#spec').innerHTML=`<h2>${pen.brand} ${penNm(pen)}</h2><p class="lbl">${pen.model}</p><dl><dt>Tip</dt><dd>${pen.tip}</dd><dt>Line width</dt><dd>${pen.width}</dd><dt>Loaded brew</dt><dd>${pen.inkLabel||ink.label}</dd>${chemRows}${pen.cap?`<dt>Capacity</dt><dd>${pen.cap} ml</dd>`:''}${pen.body?`<dt>Body &amp; flow</dt><dd>${pen.body}</dd>`:''}</dl><ul class="notes">${pen.facts.map(f=>`<li>${f}</li>`).join('')}</ul>${warnHtml}${behaveHTML()}`+
  (pen.sds?`<p class="warn">${pen.sds}</p>`:'')+
  (pen.ink==='oil'&&!pen.dauber?`<p class="warn">Solvent paint mix — shakes to suspend pigment and skins over as it cures.</p>`:'');
 const rows=list.map(s=>{const r=react(s);return`<tr><td>${s.name}</td><td data-l="Visibility">${bar(r.vis)}</td><td data-l="Holds when dry">${bar(r.hold)}</td><td data-l="Bleed">${bar(r.bleed)}</td><td data-l="Skips">${bar(r.skip)}</td><td class="num" data-l="Dry (sim)">${r.dry.toFixed(1)} s</td></tr>`}).join('');
 const nt=[...new Set(list.flatMap(notes))].slice(0,5);
 $('#react').innerHTML=`<h2>How this brew reacts</h2><p class="lbl">${penNm(pen)} on ${cur.name.toLowerCase()}</p><table><thead><tr><th>Surface</th><th>Shows</th><th>Holds dry</th><th>Bleed</th><th>Skips</th><th class="num">Dry*</th></tr></thead><tbody>${rows}</tbody></table><p class="lbl">*Simulated touch-dry time (scaled by your base, additives &amp; weather).</p><ul class="notes">${nt.map(t=>`<li>${t}</li>`).join('')}</ul>`}

$('#rack').addEventListener('click',e=>{const b=e.target.closest('.pen');if(!b)return;if(b.dataset.id===pen.id){shake();return}pen=PENS.find(p=>p.id===b.dataset.id);color=pen.colors[0];renderRack();renderColors();renderReact();renderTop();save();if((pen.empty||pen.fillReq)&&(!pen.fill||pen.life<=0)){showRefills(`${pen.brand} ${penNm(pen)} is empty — pick an ink to fill it`);return}closeSheets();toast(`${pen.brand} ${penNm(pen)}`+(pen.shake&&pen.mix<.6?' — shake it first':''))});
const fsOn=on=>{document.body.classList.toggle('fs',on);const el=document.documentElement;try{if(on&&!document.fullscreenElement&&el.requestFullscreen)el.requestFullscreen({navigationUI:'hide'}).catch(()=>{});else if(!on&&document.fullscreenElement)document.exitFullscreen().catch(()=>{})}catch(_){}if(on)(()=>{try{if(localStorage.getItem('rlFsTip'))return;localStorage.setItem('rlFsTip','1')}catch(_){}toast('Full screen — tap the corner button to bring the tools back')})()/* said once, the first time only */};
$('#fsBtn').addEventListener('click',()=>{closeSheets();fsOn(true)});$('#fsTop').addEventListener('click',()=>fsOn(true));const fsToolsOff=()=>{document.body.classList.remove('fs-tools');const b=$('#fsTools');b.textContent='Tools ▲';b.setAttribute('aria-expanded','false');document.body.style.removeProperty('--fstB')};
$('#fsTools').addEventListener('click',e=>{e.stopPropagation();const on=!document.body.classList.contains('fs-tools');if(!on){fsToolsOff();return}document.body.classList.add('fs-tools');const b=$('#fsTools');b.textContent='Hide ▼';b.setAttribute('aria-expanded','true');const d=document.querySelector('.dock');const hh=d?Math.ceil(d.getBoundingClientRect().height):0;const bm=d?Math.max(0,innerHeight-d.getBoundingClientRect().bottom):0;document.body.style.setProperty('--fstB',(hh+bm+8)+'px')});
$('#fsExit').addEventListener('click',()=>{fsToolsOff();fsOn(false)});
cv.addEventListener('pointerdown',()=>{if(document.body.classList.contains('fs-tools'))fsToolsOff()},true);
document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&document.body.classList.contains('fs')){document.body.classList.remove('fs');fsToolsOff()}});
$('#dryNow').addEventListener('click',()=>{closeSheets();dryNow()});
(async()=>{for(let i=0;i<40&&dlNS===null;i++)await new Promise(r=>setTimeout(r,250));if(dlNS&&!document.documentElement.classList.contains('inapp')&&!(typeof isStandalone==='function'&&isStandalone()))$('#dlApp').hidden=false})();
$('#dlApp').addEventListener('click',async()=>{if(!dlNS)return;let html=null;try{const r=await fetch(location.href,{cache:'no-store'});const t=await r.text();if(/^\s*<!DOCTYPE html>/i.test(t)&&t.includes('Reach Lab'))html=t}catch(_){}
 if(!html){toast('Couldn’t read the app file here');return}try{await dlNS.save({filename:'reach-lab.html',data:new Blob([html],{type:'text/html'})});toast('App saved — open the file in a browser to use it offline')}catch(e){if(e&&e.code!=='declined')toast('Saving isn’t available here')}});
$('#wallShare').addEventListener('click',()=>{closeSheets();shareWall()});
$('#shareClose').addEventListener('click',()=>{$('#shareView').hidden=true});
function blobToB64(blob){
 return new Promise((res,rej)=>{
  const r=new FileReader();
  r.onload=()=>{const s=String(r.result||'');const i=s.indexOf(',');res(i>=0?s.slice(i+1):s)};
  r.onerror=rej;
  r.readAsDataURL(blob);
 });
}
function bindTap(el,fn){
 if(!el)return;
 let lastFire=0;
 const run=e=>{
  if(e&&e.cancelable)e.preventDefault();
  if(e&&e.stopPropagation)e.stopPropagation();
  const t=Date.now();
  if(t-lastFire<350)return;
  lastFire=t;
  fn(e);
 };
 el.addEventListener('click',run,true);
 el.addEventListener('touchend',run,{passive:false,capture:true});
}
/* native Android save/share: stream the blob over in chunks; native writes to Gallery (Movies|Pictures/ReachLab) or opens the share sheet */
let rlSaving=false;
async function nativeSave(blob,filename,mime,wantShare){
 if(rlSaving){toast('Still saving the last file…');return false}
 const B=window.AndroidBridge,CH=768*1024;
 const m=String(mime||'').split(';')[0].trim().toLowerCase()||(/\.mp4$/i.test(filename)?'video/mp4':/\.webm$/i.test(filename)?'video/webm':/\.jpe?g$/i.test(filename)?'image/jpeg':'application/octet-stream');
 const n=String(filename||'reachlab-file').replace(/[\\/:*?"<>|]/g,'_');
 rlSaving=true;
 try{
  toast(wantShare?'Preparing to share…':'Saving to phone…');
  if(B.begin(n,m)!=='1'){toast('Couldn’t start saving on this phone');return false}
  for(let o=0;o<blob.size;o+=CH){
   const b64=await blobToB64(blob.slice(o,o+CH));
   if(!B.append(b64)){B.cancel();toast('Saving failed — phone storage may be full');return false}
  }
  const r=String(B.finish(!!wantShare)||'0Couldn’t save');
  const ok=r.charAt(0)==='1',msg=r.slice(1).replace(/\//g,' › ');
  if(msg)toast(msg);
  return ok;
 }finally{rlSaving=false}
}
async function saveOrShareBlob(blob,filename,wantShare){
 if(!blob)return false;
 const mime=blob.type||'application/octet-stream';
 try{
  if(window.AndroidBridge&&typeof window.AndroidBridge.begin==='function'){
   return await nativeSave(blob,filename,mime,!!wantShare);
  }
  if(/[?&]app=android/.test(location.search)){
   toast('Update the ReachLab app to save videos — this build has no save bridge');
   return false;
  }
  if(dlNS&&!wantShare){
   await dlNS.save({filename,data:blob});
   toast('Saved '+filename);
   return true;
  }
  if(wantShare&&navigator.share){
   const file=new File([blob],filename,{type:mime});
   if(!navigator.canShare||navigator.canShare({files:[file]})){
    await navigator.share({files:[file],title:'Reach Lab'});
    return true;
   }
  }
  const u=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=u;a.download=filename;a.rel='noopener';
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(u),8000);
  toast('Saved '+filename);
  return true;
 }catch(e){
  if(e&&e.name==='AbortError')return false;
  toast('Open this HTML in Chrome/Safari to save or share directly');
  return false;
 }
}
bindTap($('#shareSend'),async()=>{
 if(!shareFile)return;
 const blob=await (await fetch(shareFile.url)).blob();
 await saveOrShareBlob(blob,shareFile.name,true);
});
bindTap($('#shareDl'),async()=>{
 if(!shareFile)return;
 const blob=await (await fetch(shareFile.url)).blob();
 await saveOrShareBlob(blob,shareFile.name,false);
});
$('#bottles').addEventListener('click',e=>{const b=e.target.closest('.bt');if(!b)return;const B=BOTTLES.find(q=>q.id===b.dataset.bt),had=pen.fill&&pen.fill!==B.id;fillPen(pen,B);toast(`${had?'Emptied and refilled':'Filled'} ${penNm(pen)} with ${B.brand} ${B.name} — squeeze to start`);setTimeout(closeSheets,350)});
$('#colors').addEventListener('click',()=>{renderCSheet();openSheet('colorSheet')});
const pickC=close=>e=>{const b=e.target.closest('.cs');if(!b)return;color=b.dataset.c;renderColors();renderReact();save();if(close){closeSheets();toast(cname(color))}};
$('#cgrid').addEventListener('click',pickC(true));
$('#lean').addEventListener('input',e=>{leanSet=+e.target.value/60;leanNow=Math.max(leanSet,leanSen);$('#leanV').innerHTML=leanArt(+e.target.value/60);try{localStorage.setItem('mtbLean',e.target.value)}catch(_){}});
try{const v=+(localStorage.getItem('mtbLean')||0);leanSet=v/60;$('#lean').value=v}catch(_){}$('#leanV').innerHTML=leanArt(leanSet);
$('#angle').addEventListener('input',e=>{angle=+e.target.value;$('#angleV').innerHTML=angleArt(angle)});
document.querySelectorAll('[data-tool]').forEach(b=>b.addEventListener('click',ev=>{tool=b.dataset.tool;document.querySelectorAll('[data-tool]').forEach(x=>x.setAttribute('aria-pressed',x===b))}));
$('#brands').addEventListener('click',e=>{const b=e.target.closest('[data-b]');if(!b)return;brandF=b.dataset.b;renderBrands();renderRack()});$('#ptypes').addEventListener('click',e=>{const b=e.target.closest('[data-pt]');if(!b)return;typeF=b.dataset.pt;renderTypes();renderBrands();renderRack()});
$('#flip').addEventListener('click',()=>{if(!pen.ends)return;audio();pen.end=1-(pen.end||0);applyEnd(pen);clack();renderRack();renderTop();renderColors();renderReact();toast(`Now using the ${pen.tip} end`)});
{const b=$('#lightBtn');const sync=()=>{b.textContent=lightOn?'Light & reflections: on':'Light & reflections: off';b.setAttribute('aria-pressed',lightOn)};sync();b.addEventListener('click',()=>{lightOn=!lightOn;try{localStorage.setItem('rlLight',lightOn?'1':'0')}catch(e){}sync();renderBg();const t=document.createElement('canvas');t.width=bg.c.width;t.height=bg.c.height;const tx=t.getContext('2d');tx.drawImage(bg.c,0,0);tx.globalCompositeOperation='destination-out';tx.drawImage(idm.c,0,0);baked.x.save();baked.x.setTransform(1,0,0,1,0,0);baked.x.drawImage(t,0,0);baked.x.restore();freeC(t);lForce=true;g3Dirty=true;slForce=true;dirty=true})}
{const gb=$('#gravBtn');if(gb){const order=['auto','down','left','right','up'];gb.textContent=GMODES[gMode];gb.addEventListener('click',()=>{gMode=order[(order.indexOf(gMode)+1)%order.length];try{localStorage.setItem('rlGrav',gMode)}catch(e){}gb.textContent=GMODES[gMode];for(const d of drips){d.gx=undefined;d.gy=undefined}if(ledgeOn)refreshLedge();
 toast(gMode==='auto'?'Drips follow the motion sensor':gMode==='down'?'Drips run to the bottom of the screen':gMode==='left'?'Phone turned left (top of phone to the left): drips run to the right edge':gMode==='right'?'Phone turned right (top of phone to the right): drips run to the left edge':'Upside down: drips run to the top of the screen')})}}
DRYALL=1.8;
/* AGEING: slide to see the wall weeks/months on — sun fades the inks and dark dyes turn purple-brown, rain leaches
   colour down from the letters in streaks, grime builds (most near the ground). Reversible while sliding; the next
   mark you make keeps the age. */
var ageSnap=null;
function ageDrop(){if(etchAgeA){etchAgeA=0;etvDirty=true}if(ageSnap){snapPool.push(ageSnap);ageSnap=null;const r=$('#ageR');if(r){r.value=0;$('#ageV').textContent='fresh'}}}
/* AGE THE WALL — real weathering, at full resolution (nothing blurred):
   · UV fade: pigments bleach at different rates — reds/pinks/purples go first, yellows next, blues and blacks hold
     longest (blacks drift to a brownish grey); the wall starts to show through thin colour
   · chalking: the paint surface erodes into crisp pinholes, worst at thin edges, so the wall speckles through
   · leaching: rain carries a little colour out of the bottom edges as fine 'tear' streaks
   · grime: crisp dust speckle and dirty rain tracks running down the wall, heavier towards the ground
   · the surface itself: glass gets a dusty film, water-spot rings and fine scratches; plastic yellows, chalks and
     scuffs; concrete darkens with ground-in dirt */
let _ar=1,AGS=12345;const AR=()=>(_ar=(Math.imul(_ar,1103515245)+12345)>>>0)/4294967296,ARs=(l,i)=>{_ar=(Math.imul(l+1,2654435761)^Math.imul(i+7,40503)^AGS)>>>0;AR();AR()};
function ageHash(x,y){let h=Math.imul(x|0,374761393)^Math.imul(y|0,668265263);h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296}
let etchAgeA=0;function ageApply(v){const a=v/100;if(etchAgeA!==a){etchAgeA=a;etvDirty=true}$('#ageV').textContent=a===0?'fresh':a<.2?'a few days':a<.45?'a few weeks':a<.75?'a couple of months':'half a year';if(a>0&&(ghostRet.t||bleedL.some(L=>L.slow))){if(ageSnap){snapPool.push(ageSnap);ageSnap=null}ghostFire(true)}
 if(!ageSnap){if(a===0)return;flushBleed(true,true);ageSnap=poolC(baked.c);AGS=(AR()*4294967295)>>>0}
 const b=baked.x,w=baked.c.width,h=baked.c.height,P=dpr;b.save();b.setTransform(1,0,0,1,0,0);b.globalCompositeOperation='copy';b.globalAlpha=1;b.drawImage(ageSnap,0,0);b.globalCompositeOperation='source-over';
 if(a<=0){b.restore();dirty=true;return}
 const sid=cur?cur.id:'';let D,M,G;try{D=b.getImageData(0,0,w,h);M=idm.x.getImageData(0,0,w,h).data;G=bg.x.getImageData(0,0,w,h).data}catch(_){b.restore();return}
 let RZd=null;try{if(RZ&&RZ.width===w&&RZ.height===h)RZd=RZ.getContext('2d').getImageData(0,0,w,h).data}catch(_){}const flk=(sid==='glass'||sid==='plastic'||sid==='wplastic'||(cur&&cur.absorb<.08))?clamp((a-.3)/.7):(cur&&cur.absorb<.3?clamp((a-.6)/.4)*.4:0);const d=D.data,edges=[],tops=[],IK=Object.keys(INK),CHALK=IK.map(k=>/^(alcpaint|water|oil|chrome|fluid|solid)$/.test(k)||(INK[k]&&(INK[k].solid||INK[k].chrome))?1:0);/* only paint chalks into pinholes — dyes soak in and just fade */
 /* 1+2: fade and chalk, pixel by pixel inside the ink */
 for(let y=0;y<h;y++){const row=y*w;for(let x=0;x<w;x++){const q=(row+x)*4;let ia=M[q+3];if(ia<8){/* the anti-aliased fringe of a stroke isn't in the ink map: catch it by its difference from the bare wall */const df=Math.abs(d[q]-G[q])+Math.abs(d[q+1]-G[q+1])+Math.abs(d[q+2]-G[q+2]);if(df<24)continue;ia=-Math.min(140,df)}/* negative = fringe/haze: fades, but no pinholes */
   const fr=ia<0;if(fr)ia=-ia;let r=d[q],g=d[q+1],bl=d[q+2];const mx=Math.max(r,g,bl),mn=Math.min(r,g,bl),l=(mx+mn)/510,sat=mx?(mx-mn)/mx:0;
   let hue=0;if(mx!==mn){hue=mx===r?((g-bl)/(mx-mn))%6:mx===g?(bl-r)/(mx-mn)+2:(r-g)/(mx-mn)+4;hue=(hue*60+360)%360}
   /* how fast this colour bleaches */const rate=sat<.12?(l<.25?.32:.2):(hue<20||hue>290)?1:hue<65?.62:hue<170?.45:.36;
   const ty0=IK[(inkG[inkCell(x/P,y/P)]||0)-1],kInk=DYEINK[ty0]?1.55:/^(alcpaint|oil|solid|fluid)$/.test(ty0||'')?.5:1,/* the top of a wall gets more sun than the bottom, and fading is never even */sun=(.72+.5*(1-y/h))*(.75+.5*n(5,7,x/w,y/h));
   const f=Math.min(.95,a*rate*(.55+.45*sat)*kInk*sun),Y=.3*r+.59*g+.11*bl;
   r+=(Y-r)*f*.62;g+=(Y-g)*f*.62;bl+=(Y-bl)*f*.62;/* bleached pigment goes paler and chalky… */const wh=f*.28;r+=(236-r)*wh;g+=(232-g)*wh;bl+=(224-bl)*wh;/* …and thin colour lets the wall through */const k=f*.2*(1-(ia/255)*.3);r+=(G[q]-r)*k;g+=(G[q+1]-g)*k;bl+=(G[q+2]-bl)*k;
   const tyk=IK[(inkG[inkCell(x/P,y/P)]||0)-1];if((tyk==='stain'||tyk==='bleed')&&l<.45){/* staining blacks are built on a violet dye that outlasts the others in sunlight: they drift purple, deepest where the ink was heaviest */const v=a*(1-l)*(.9+.3*(ia/255));r+=(92-r)*v*.55;g+=(52-g)*v*.4;bl+=(150-bl)*v*.62}else if(sat<.12&&l<.25){r+=a*14;g+=a*10;bl+=a*4}/* other old blacks go brown-grey */
   /* chalking pinholes: crisp, clustered, worst on thin edges */const n1=ageHash(x,y),n2=ageHash((x/(5*P))|0,(y/(5*P))|0),n3=ageHash((x/(17*P))|0,(y/(17*P))|0);const pin=a*a*(.004+.16*(1-ia/255))*(n2>.82?3.2:.35)*(n3>.6?1.6:.5);
   if(!fr&&n1<pin&&CHALK[(inkG[inkCell(x/P,y/P)]||0)-1]){r=G[q]*.92;g=G[q+1]*.92;bl=G[q+2]*.92}
   /* FLAKING: paint on glass and plastic has nothing to key into - after a few months it lifts and chips off in flakes, crisp lifted lips catch the light on top and cast a hairline shadow below */
   if(flk>0&&!fr&&ia>40&&CHALK[(inkG[inkCell(x/P,y/P)]||0)-1]){const cs=6.5*P,gx=Math.floor(x/cs),gy=Math.floor(y/cs);let d1=1e9,d2=1e9,c1=0,c2=0;for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const ii=gx+di,jj=gy+dj,qx=(ii+.08+.84*ageHash(ii*3+11,jj*5+3))*cs,qy=(jj+.08+.84*ageHash(ii*7+2,jj*3+17))*cs,dx=x-qx,dy=y-qy,dd=dx*dx+dy*dy,id=ii*7919+jj*104729;if(dd<d1){d2=d1;c2=c1;d1=dd;c1=id}else if(dd<d2){d2=dd;c2=id}}d1=Math.sqrt(d1);d2=Math.sqrt(d2);const gap=d2-d1,clu=clamp((n(6,9,x/w,y/h)-.3)*2.4),edg=1-ia/255,pf=flk*flk*(.03+.34*clu*clu+.45*edg*edg),gone=id=>ageHash(id&65535,(id>>>16)+313)<pf;if(gone(c1)){r=G[q]*.95+r*.05;g=G[q+1]*.95+g*.05;bl=G[q+2]*.95+bl*.05}else if(gap<1.5*P&&gone(c2)){/* the broken edge of the paint film: a raised lip */const lip=gap<.6*P?1.18:.7;r*=lip;g*=lip;bl*=lip}else if(gap<.55*P&&flk>.2){/* hairline crazing across the paint that's still holding */const cz=1-.14*flk;r*=cz;g*=cz;bl*=cz}}
   /* PINE ROSIN VARNISH: yellows and crazes into a fine crackle as it ages */
   if(RZd&&RZd[q+3]>60&&a>.15){const ka=clamp((a-.15)/.6),cs=5*P,gx=Math.floor(x/cs),gy=Math.floor(y/cs);let d1=1e9,d2=1e9;for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const ii=gx+di,jj=gy+dj,qx=(ii+.1+.8*ageHash(ii*5+3,jj*7+1))*cs,qy=(jj+.1+.8*ageHash(ii*3+9,jj*11+4))*cs,dd=(x-qx)*(x-qx)+(y-qy)*(y-qy);if(dd<d1){d2=d1;d1=dd}else if(dd<d2)d2=dd}
    const gp=Math.sqrt(d2)-Math.sqrt(d1);r*=1-.04*ka;g*=1-.07*ka;bl*=1-.22*ka;if(gp<.5*P){const cz=1-.4*ka*(1-gp/(.5*P));r*=cz;g*=cz;bl*=cz}}
   d[q]=r;d[q+1]=g;d[q+2]=bl;
   if(x%Math.max(2,Math.round(2*P))===0&&y+2<h&&M[q+3+w*4*2]<8&&ia>150)edges.push(x,y);if(x%Math.max(3,Math.round(3*P))===0&&y>2&&M[q+3-w*4*2]<8&&ia>150)tops.push(x,y)}}
 b.putImageData(D,0,0);
 /* 3: leaching tears from the bottom edges of the letters */
 b.lineCap='round';for(let i=0;i<edges.length;i+=2){ARs(1,i);if(AR()>a*.28)continue;const x=edges[i],y=edges[i+1],q=(y*w+x)*4,L=(6+AR()*AR()*70)*a*P,wd=(.5+AR()*1.1)*P;
  const g2=b.createLinearGradient(0,y,0,y+L);g2.addColorStop(0,`rgba(${d[q]},${d[q+1]},${d[q+2]},${(.18+AR()*.2).toFixed(2)})`);g2.addColorStop(1,`rgba(${d[q]},${d[q+1]},${d[q+2]},0)`);b.strokeStyle=g2;b.lineWidth=wd;b.beginPath();b.moveTo(x,y);b.quadraticCurveTo(x+(AR()-.5)*2*P,y+L*.5,x+(AR()-.5)*3*P,y+L);b.stroke()}
 /* 4: grime — dirty rain tracks down the wall, then fine dust speckle, heavier low down */
 const nT=Math.round(70*a*w/(400*P));for(let i=0;i<nT;i++){ARs(2,i);const x=AR()*w,y0=AR()*h*.7,L=(40+AR()*260)*P*a,g3=b.createLinearGradient(0,y0,0,y0+L),al=(.05+AR()*.12)*a;g3.addColorStop(0,'rgba(40,34,26,0)');g3.addColorStop(.25,`rgba(40,34,26,${al.toFixed(3)})`);g3.addColorStop(1,'rgba(40,34,26,0)');b.strokeStyle=g3;b.lineWidth=(.6+AR()*2.2)*P;b.beginPath();b.moveTo(x,y0);b.lineTo(x+(AR()-.5)*4*P,y0+L);b.stroke()}
 const sp=Math.round(w*h/(P*P)*.0035*a);b.fillStyle='#2a251d';for(let i=0;i<sp;i++){ARs(3,i);const x=AR()*w,y=Math.pow(AR(),.7)*h;b.globalAlpha=(.08+AR()*.3)*a*(.5+y/h);const r=(.3+AR()*AR()*1.4)*P;b.fillRect(x,y,r,r)}b.globalAlpha=1;
 {const g4=b.createLinearGradient(0,0,0,h);g4.addColorStop(0,'rgba(60,52,40,0)');g4.addColorStop(.55,`rgba(60,52,40,${(.05*a).toFixed(3)})`);g4.addColorStop(1,`rgba(60,52,40,${(.22*a).toFixed(3)})`);b.globalCompositeOperation='multiply';b.fillStyle=g4;b.fillRect(0,0,w,h);b.globalCompositeOperation='source-over'}
 /* 4b: RAIN MARKS — rain sheets off ledges and cills and runs down from the top edges of the letters, carrying dirt:
    long grey streaks hanging under every ledge, a wavy tide line where the wet front stopped, more in damp weather */
 {const wk=WX&&WX.k==='cold'?1.5:WX&&WX.k==='hot'?.6:1;const L=typeof ledgeLive==='function'&&ledgeLive()?LDG():null;
  if(L&&!L.sl){const y0=(L.y+(L.top||0)+(L.h||8))*P;for(let i=0,n=Math.round(90*a*wk*w/(400*P));i<n;i++){ARs(4,i);const x=AR()*w,ln=(15+AR()*AR()*220)*P*a,g=b.createLinearGradient(0,y0,0,y0+ln),al=(.05+AR()*.14)*a*wk;g.addColorStop(0,`rgba(55,48,38,${al.toFixed(3)})`);g.addColorStop(1,'rgba(55,48,38,0)');b.strokeStyle=g;b.lineWidth=(.6+AR()*2.4)*P;b.beginPath();b.moveTo(x,y0);b.lineTo(x+(AR()-.5)*2*P,y0+ln);b.stroke()}
   b.strokeStyle=`rgba(70,60,46,${(.16*a*wk).toFixed(3)})`;b.lineWidth=1.2*P;b.beginPath();for(let x=0;x<=w;x+=6*P){const yy=y0+(18+40*a+8*Math.sin(x/(37*P))+5*Math.sin(x/(11*P)))*P;x?b.lineTo(x,yy):b.moveTo(x,yy)}b.stroke()}
  /* streaks down from the tops of letters: dirt the rain lifts off the paint edge */
  for(let i=0;i<tops.length;i+=2){ARs(5,i);if(AR()>a*.12*wk)continue;const x=tops[i],y=tops[i+1],ln=(10+AR()*80)*a*P,g=b.createLinearGradient(0,y,0,y+ln);g.addColorStop(0,`rgba(60,52,40,${(.1+AR()*.12)*a*wk})`);g.addColorStop(1,'rgba(60,52,40,0)');b.strokeStyle=g;b.lineWidth=(.5+AR())*P;b.beginPath();b.moveTo(x,y);b.lineTo(x,y+ln);b.stroke()}}
 /* 5: the surface itself */
 if(sid==='glass'){/* dust film: heavier low down where splash-back lands, and thick in the bottom corners */const gd=b.createLinearGradient(0,0,0,h);gd.addColorStop(0,`rgba(205,200,188,${(.05*a).toFixed(3)})`);gd.addColorStop(.6,`rgba(205,200,188,${(.1*a).toFixed(3)})`);gd.addColorStop(1,`rgba(196,188,170,${(.26*a).toFixed(3)})`);b.fillStyle=gd;b.fillRect(0,0,w,h);for(const cx of [0,w]){const rg=b.createRadialGradient(cx,h,0,cx,h,w*.45);rg.addColorStop(0,`rgba(150,140,120,${(.22*a).toFixed(3)})`);rg.addColorStop(1,'rgba(150,140,120,0)');b.fillStyle=rg;b.fillRect(0,0,w,h)}/* dried water spots */for(let i=0,n=Math.round(55*a);i<n;i++){ARs(6,i);const x=AR()*w,y=AR()*h,r=(1+AR()*AR()*4)*P,a0=AR()*TAU;b.strokeStyle=`rgba(225,222,212,${(.06+AR()*.1)*a})`;b.lineWidth=Math.max(.5,r*.22);b.beginPath();b.arc(x,y,r,a0,a0+TAU*(.45+AR()*.45));b.stroke()}}
 if(sid==='plastic'||sid==='wplastic'){b.globalCompositeOperation='multiply';{const gy=b.createLinearGradient(0,0,0,h);gy.addColorStop(0,`rgba(244,226,180,${(.7*a).toFixed(3)})`);gy.addColorStop(1,`rgba(248,238,212,${(.35*a).toFixed(3)})`);b.fillStyle=gy;b.fillRect(0,0,w,h)}/* yellows most where the sun hits: the top */b.globalCompositeOperation='source-over';b.fillStyle=`rgba(240,238,232,${(.07*a).toFixed(3)})`;b.fillRect(0,0,w,h)}
 if(sid==='stairs'){b.globalCompositeOperation='multiply';b.fillStyle=`rgba(150,138,120,${(.3*a).toFixed(3)})`;b.fillRect(0,0,w,h);b.globalCompositeOperation='source-over'}
 if(sid!=='stairs'){/* fine scratches and scuffs */for(let i=0,n=Math.round(28*a);i<n;i++){ARs(7,i);const x=AR()*w,y=AR()*h,an=(AR()-.5)*.9+(AR()<.5?0:Math.PI/2)*(AR()<.25?1:0),L=(6+AR()*AR()*45)*P,dx=Math.cos(an)*L,dy=Math.sin(an)*L;
  b.lineWidth=Math.max(.5,.5*P);b.strokeStyle=`rgba(255,255,255,${(.07+AR()*.12)*a})`;b.beginPath();b.moveTo(x,y);b.lineTo(x+dx,y+dy);b.stroke();b.strokeStyle=`rgba(0,0,0,${(.08+AR()*.1)*a})`;b.beginPath();b.moveTo(x+.7*P,y+.7*P);b.lineTo(x+dx+.7*P,y+dy+.7*P);b.stroke()}}
 b.restore();dirty=true}
let ageT=0,ageV2=0;function ageQueue(v){ageV2=v;if(ageT)return;ageT=setTimeout(()=>{ageT=0;ageApply(ageV2)},110)}
$('#ageR').addEventListener('input',e=>ageQueue(+e.target.value));$('#ageR').addEventListener('change',e=>{clearTimeout(ageT);ageT=0;ageApply(+e.target.value)});
{const lb=$('#ledgeBtn');const sync=()=>{lb.textContent=ledgeOn?'Ledge: on':'Ledge: off';lb.setAttribute('aria-pressed',ledgeOn)};sync();lb.addEventListener('click',()=>{ledgeOn=!ledgeOn;ledP={};try{localStorage.setItem('rlLedge',ledgeOn?'1':'0')}catch(e){}sync();refreshLedge()})}
$('#upright').addEventListener('click',e=>{upright=!upright;e.currentTarget.textContent=upright?'Drips: on':'Flat: no drips';e.currentTarget.setAttribute('aria-pressed',upright);showHint()});
$('#vs').addEventListener('input',e=>{pen.vs=+e.target.value;$('#vsV').textContent=['Trickle','Low','Medium','High','Flood'][pen.vs-1];audio();clack();showHint()});
$('#capBtn').addEventListener('click',()=>{audio();pen.capped=!pen.capped;pen.idle=0;clack();renderCap();toast(pen.capped?'Capped':'Cap off — leave it open and the tip dries')});

/* NEW NIB: pull the worn felt and push a fresh one in. The ink stays in the barrel, but a dry new nib has to soak up
   before it flows (valve pens need priming again); a nib that was dried out comes back too */
$('#newnib').addEventListener('click',()=>{if(pen.metal||INK[pen.ink].solid)return toast('That tip doesn\u2019t wear out');audio();pen.fray=0;pen.round=0;pen.mush=0;pen.tipDry=0;pen.dirtAmt=0;if(pen.valve)pen.flow=Math.min(pen.flow,.25);showFlow();save();toast(pen.valve?'New nib in \u2014 prime it on the wall to soak it':'New nib in \u2014 sharp edges again');rattle()});
$('#newpen').addEventListener('click',()=>{if((pen.empty||pen.fillReq)&&!pen.fill)return toast('Fill it with an ink first');audio();pen.life=1;pen.sw=0;pen.fray=0;pen.round=0;pen.mush=0;pen.tipDry=0;pen.dirtAmt=0;pen.capped=true;renderCap();pen.flow=.2;pen.mix=.2;showFlow();showMix();save();toast(`Fresh ${pen.brand} ${penNm(pen)} — shake and prime it`);rattle()});
$('#snd').addEventListener('click',e=>{muted=!muted;e.currentTarget.textContent=muted?'Sound off':'Sound on';e.currentTarget.setAttribute('aria-pressed',!muted);if(!muted)audio()});
$('#wipeT').addEventListener('click',()=>{stopPlayback(false);recClear();push();ledP={};cillReset();if(LD){const c=LD.getContext('2d');c.save();c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,LD.width,LD.height);c.restore()}if(fh){fh.fill(0);flowOn=false}fastDry=false;resetBoard();compose();dirty=false;toast('Wall wiped clean')});
$('#surfs').addEventListener('click',e=>{const b=e.target.closest('.sc');if(!b)return;goSurface(SURF.find(s=>s.id===b.dataset.id));closeSheets()});
const step=d=>{goSurface(SURF[(SURF.indexOf(cur)+d+SURF.length)%SURF.length]);toast(cur.name)};
$('#wetBtn').addEventListener('click',()=>{const was=wetSet.has(cur.id),rain=rainSet.has(cur.id);
 rainSet.clear();
 const on=!was;if(on)wetSeed=(Math.random()*1e9)>>>0;on?wetSet.add(cur.id):(wetSet.delete(cur.id),rainSet.delete(cur.id));bands[0].s=V(cur);renderSurfs();renderReact();save();
 if(on){spreadFromWall();wetReact()}else{wetQ.length=0;toast('Dry — the water’s gone, runs stop')}});
$('#prevS').addEventListener('click',()=>step(-1));$('#nextS').addEventListener('click',()=>step(1));
$('#sName').addEventListener('click',()=>openSheet('surfSheet'));
$('#penBtn').addEventListener('click',()=>openSheet('penSheet'));
$('#infoBtn').addEventListener('click',()=>{renderReact();openSheet('infoSheet')});
$('#mixOpen').addEventListener('click',e=>{e.stopPropagation();openMix()});
$('#brewBtn').addEventListener('click',()=>{openMix()});
$('#mxCancel').addEventListener('click',()=>{closeSheets();openSheet('penSheet')});$('#mxBottle').addEventListener('click',bottleMix);
for(const [id,k] of [['#mxBase','base']])$(id).addEventListener('click',e=>{const b=e.target.closest('.btn');if(!b)return;MX[k]=b.dataset.v;renderMix()});
for(const [id,k] of [['#mxPot','pot'],['#mxBind','bind'],['#mxThin','thin']])$(id).addEventListener('input',e=>{MX[k]=+e.target.value;renderMix()});
$('#mxMine').addEventListener('click',e=>{const b=e.target.closest('[data-del]');if(b){delMix(b.dataset.del);return}const ed=e.target.closest('[data-edit]');if(ed){const B=BOTTLES.find(x=>x.id===ed.dataset.edit),R=B&&B.recipe;if(!R)return;MX.base=R.base;MX.pot=R.pot;MX.bind=R.bind;MX.thin=R.thin;MX.pigs=new Set(R.pigs);MX.amt=Object.assign({},R.amt||{});MX.add=new Set(R.add);for(const [id,k] of [['#mxPot','pot'],['#mxBind','bind'],['#mxThin','thin']]){const el=$(id);if(el)el.value=MX[k]}const nm=$('#mxName');if(nm)nm.value=B.name;renderMix();toast('Loaded '+B.name+' — change it and bottle it again');try{$('#mixSheet').scrollTo({top:0,behavior:'smooth'})}catch(_){}}});
$('#mxAdd').addEventListener('click',e=>{const b=e.target.closest('.btn');if(!b)return;const v=b.dataset.v;MX.add.has(v)?MX.add.delete(v):MX.add.add(v);renderMix()});
$('#mxSw').addEventListener('click',e=>{const b=e.target.closest('[data-p]');if(!b)return;const v=b.dataset.p;if(MX.pigs.has(v)){MX.pigs.delete(v);delete MX.amt[v]}else{MX.pigs.add(v);MX.amt[v]=MX.amt[v]||1}renderMix()});
 $('#mxAmt').addEventListener('input',e=>{const r=e.target.closest('[data-amt]');if(!r)return;MX.amt[r.dataset.amt]=+r.value;amtLabels();$('#mxOut').innerHTML=mixRead(MX).html});
{const C=$('#cal'),D=$('#calDot'),T=$('#calTxt');const spots=[[.3,.42],[.7,.58],[.5,.75]];let k=0,acc=[];
 const show=()=>{const [u,v]=spots[k];D.style.left=(u*innerWidth)+'px';D.style.top=(v*innerHeight)+'px';T.textContent=`Tap the centre of the dot with your finger, the way you'd start a tag (${k+1} of 3)`};
 $('#calBtn').addEventListener('click',()=>{closeSheets();k=0;acc=[];C.hidden=false;show()});
 C.addEventListener('pointerdown',e=>{if(e.target.id==='calReset')return;e.preventDefault();const [u,v]=spots[k];acc.push({x:u*innerWidth-e.clientX,y:v*innerHeight-e.clientY});k++;
  if(k<3){show();return}const ox=acc.reduce((a,b)=>a+b.x,0)/3,oy=acc.reduce((a,b)=>a+b.y,0)/3;touchOff={x:Math.max(-60,Math.min(60,ox)),y:Math.max(-60,Math.min(60,oy))};
  try{localStorage.setItem('rlTouchOff',JSON.stringify(touchOff))}catch(_){}C.hidden=true;toast(`Calibrated — finger offset ${Math.round(touchOff.x)}, ${Math.round(touchOff.y)} px`)});
 $('#calReset').addEventListener('click',e=>{e.stopPropagation();touchOff={x:0,y:0};try{localStorage.removeItem('rlTouchOff')}catch(_){}C.hidden=true;toast('Finger offset reset')})}
$('#moreBtn').addEventListener('click',()=>{$('#moreBtn').classList.remove('newtip');openSheet('moreSheet')});
$('#tipsClear').addEventListener('click',()=>{tips.length=0;$('#tipsList').innerHTML='<li style="opacity:.6">Tips from your drawing show up here.</li>'});
for(const ev of ['pointerdown','pointerup'])cv.addEventListener(ev,()=>{canvasT=performance.now()},true);
(()=>{const st=$('#status');let dragBar=null;const setFlowFromX=(el,cx)=>{const m=el.querySelector('.meter')||el,r=m.getBoundingClientRect(),t=clamp((cx-r.left)/Math.max(1,r.width));if(pen.squeeze){pen.sat=+Math.min(satCap(),t*1.6).toFixed(2);showFlow()}else if(pen.valve){pen.flow=+(0.1+t*1.4).toFixed(2);showFlow()}};{const tb=document.querySelector('.bar.top'),place=()=>{try{st.style.top=Math.round(tb.getBoundingClientRect().bottom+6)+'px'}catch(_){}};place();try{new ResizeObserver(place).observe(tb)}catch(_){}addEventListener('resize',place);setTimeout(place,300)}let moved=0;st.addEventListener('pointerdown',e=>{const b=e.target.closest('.sbar');if(!b)return;if(b.dataset.bar==='flow'&&(pen.squeeze||pen.valve)){e.stopPropagation();dragBar=b;moved=1;try{st.setPointerCapture(e.pointerId)}catch(_){}setFlowFromX(b,e.clientX)}});st.addEventListener('pointermove',e=>{if(dragBar){e.stopPropagation();setFlowFromX(dragBar,e.clientX)}});const endDrag=()=>{if(dragBar){dragBar=null;save();setTimeout(()=>{moved=0},350)}};st.addEventListener('pointerup',endDrag);st.addEventListener('pointercancel',endDrag);st.addEventListener('click',e=>{if(moved)return;if(st.classList.contains('min')){st.classList.remove('min');return}const b=e.target.closest('.sbar');if(!b){st.classList.add('min');return}const k=b.dataset.bar;if(k==='mix'){shake()}else if(k==='flow'){if(pen.squeeze||pen.valve){setFlowFromX(b,e.clientX);save()}else toast('Felt nib — steady flow')}else if(k==='life'){if(pen.empty||pen.fillReq){showRefills('Pick an ink to refill '+penNm(pen))}else{pen.life=1;showFlow();save();toast('Fresh barrel — 100% ink')}}else if(k==='fray'){if(pen.metal)toast('Metal tip — no wear');else{pen.fray=0;pen.tipDry=0;pen.mush=0;pen.round=0;showFlow();save();toast('Fresh nib fitted')}}});})();
const coach=$('#coach'),seen=(()=>{try{return localStorage.getItem('mtbCoach')}catch(_){return 1}})();
/* INTRO: a title card every time the app opens; the app starts when you press Start writing. The first time, the steps
   show and the quick-start card follows. */
{const it=$('#intro');let gone=false;
 const go=()=>{if(gone)return;gone=true;it.classList.add('out');setTimeout(()=>{it.hidden=true},500);if(!seen)coach.hidden=false};
 $('#introGo').addEventListener('click',go);if(seen)it.querySelector('.steps').hidden=true;/* the app starts when you press Start writing — every time */}
/* safety net: if Safari drops a layer (memory pressure / back from background), repaint the wall under whatever ink survived */
function healWall(){try{if(!W||!baked.c.width)return;const x=baked.x,w=baked.c.width,h=baked.c.height;let blank=0;
 for(const [u,v] of [[.1,.1],[.5,.5],[.9,.9],[.2,.8],[.8,.2]]){const d=x.getImageData(Math.floor(w*u),Math.floor(h*v),1,1).data;if(d[3]===0)blank++}
 if(blank>=3){renderBg();x.save();x.setTransform(1,0,0,1,0,0);x.globalCompositeOperation='destination-over';x.drawImage(bg.c,0,0,w,h);x.restore();dirty=true}}catch(_){}}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(healWall,60)});addEventListener('pageshow',()=>setTimeout(healWall,60));
setInterval(()=>{if(!down)healWall()},2500);
for(const c of document.querySelectorAll('canvas'))c.addEventListener('contextrestored',()=>{healWall();dirty=true});
/* a scroll bar for the quick-start card that shows on every phone (mobile browsers hide the native one) */
{const cd=document.querySelector('#coach .card'),bar=$('#coachBar'),th=bar.firstElementChild;const upd=()=>{if($('#coach').hidden)return;const r=cd.getBoundingClientRect(),over=cd.scrollHeight-cd.clientHeight;if(over<4){bar.hidden=true;return}bar.hidden=false;
 const top=r.top+12,h=r.height-24;bar.style.left=(r.right-9)+'px';bar.style.top=top+'px';bar.style.height=h+'px';const th0=Math.max(28,h*cd.clientHeight/cd.scrollHeight);th.style.height=th0+'px';th.style.top=((h-th0)*cd.scrollTop/over)+'px'};
 cd.addEventListener('scroll',upd,{passive:true});addEventListener('resize',upd);new MutationObserver(()=>requestAnimationFrame(upd)).observe($('#coach'),{attributes:true,attributeFilter:['hidden']});requestAnimationFrame(upd);setTimeout(upd,300)}
$('#coachOk').addEventListener('click',()=>{coach.hidden=true;try{localStorage.setItem('mtbCoach','1')}catch(_){}if(guideAsk){guideAsk=false;setTimeout(startGuide,500)}else setTimeout(()=>maybeGetApp(),900)});
