/* ---------- Blackbook: save pages, compare two side by side ---------- */
const usedPens=new Set();


function bookSnap(big){const tw=big?Math.min(1080,W*dpr):Math.min(540,W),sc=tw/W,c=document.createElement('canvas');c.width=Math.round(W*sc);c.height=Math.round(H*sc);const x=c.getContext('2d');
 for(const L of bleedL){baked.x.save();baked.x.setTransform(1,0,0,1,0,0);baked.x.globalAlpha=L.a;baked.x.drawImage(L.c,L.x,L.y);baked.x.restore()}bleedL.length=0;chromes.forEach(finChrome);chromes.length=0;
 x.drawImage(baked.c,0,0,c.width,c.height);{const dkSurf=cur&&cur.id==='plastic';x.save();x.globalCompositeOperation=dkSurf?'source-over':'multiply';gvUpdate();x.drawImage(ghostV.c,0,0,c.width,c.height);x.drawImage(smearC.c,0,0,c.width,c.height);x.restore()}if(etchOn&&etchL.c.width){renderETV(etS?etvP:0);x.globalAlpha=etK;x.drawImage(ETV,0,0,c.width,c.height);x.globalAlpha=1}return c.toDataURL('image/jpeg',.8)}

