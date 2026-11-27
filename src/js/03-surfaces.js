/* ---------- surfaces ---------- */
const SURF=[
 {id:'glass',name:'Glass window',absorb:0,rough:0,repel:.8,flex:0,gx:1,gen(u,v){const k=n(32,32,u,v),f=n(128,128,u,v);return[k,104+6*f,110+6*f,114+6*f]},
  scene(x,X,Y,W,H){let r=11;const Q=()=>(r=(Math.imul(r,1103515245)+12345)>>>0)/4294967296;x.save();
   const g=x.createLinearGradient(X,Y,X,Y+H);g.addColorStop(0,'#c3c8ca');g.addColorStop(.42,'#8b9295');g.addColorStop(1,'#33383b');x.fillStyle=g;x.fillRect(X,Y,W,H);
   for(let i=0;i<16;i++){const cx=X+Q()*W,cy=Y+H*(.2+Q()*.8),rr=Math.min(W,H)*(.08+Q()*.3),warm=Q()<.25,rg=x.createRadialGradient(cx,cy,0,cx,cy,rr);
    rg.addColorStop(0,warm?'rgba(255,238,205,.32)':'rgba(18,22,25,.38)');rg.addColorStop(1,warm?'rgba(255,238,205,0)':'rgba(18,22,25,0)');x.fillStyle=rg;x.fillRect(cx-rr,cy-rr,2*rr,2*rr)}
   x.globalCompositeOperation='screen';for(let i=0;i<4;i++){const sx=X+Q()*W*1.2,wd=40+Q()*140;x.globalAlpha=.05+Q()*.08;x.fillStyle='#fff';x.beginPath();x.moveTo(sx,Y);x.lineTo(sx+wd,Y);x.lineTo(sx+wd-H*.55,Y+H);x.lineTo(sx-H*.55,Y+H);x.fill()}
   x.globalAlpha=.35;const e=x.createLinearGradient(X,Y,X,Y+H*.06);e.addColorStop(0,'rgba(255,255,255,.5)');e.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=e;x.fillRect(X,Y,W,H*.06);x.restore()}},
 {id:'plastic',name:'Black plastic',absorb:0,rough:.02,repel:.7,flex:.2,gx:1,gen(u,v){const k=n(128,128,u,v);return[n(20,20,u,v),38+5*k,40+5*k,45+5*k]}},
 {id:'wplastic',name:'White plastic',absorb:0,rough:.02,repel:.7,flex:.2,gx:1,gen(u,v){const k=n(128,128,u,v),m=n(16,16,u,v);return[n(20,20,u,v),238+6*k-4*m,238+6*k-4*m,234+6*k-4*m]}},
 {id:'stairs',name:'Subway stairwell',absorb:.06,rough:.28,repel:.15,flex:0,gx:1,
  /* ribbed grey panel lining an underground stairwell: fine vertical ribs, panel seams, grime that's been rubbed and rained on */
  gen(u,v){const rib=.5+.5*Math.cos(u*40*TAU+Math.sin(v*3*TAU)*.15),seam=(u*2%1)<.01||(v*2%1)<.008,g1=n(6,6,u,v),g2=n(24,48,u,v),f=n(128,128,u,v),dirt=Math.pow(g1,1.6)*.7+g2*.3,
    base=150-32*dirt+16*rib-10*(1-rib)+6*f;if(seam)return[.0,88+10*f,90+10*f,94+10*f];return[.25+.55*rib+.2*f,base,base+2,base+6]},
  scene(x,X,Y,W,H){x.save();/* overhead strip light: bright near the top, falling off down the wall */const g=x.createLinearGradient(X,Y,X,Y+H);g.addColorStop(0,'rgba(255,255,250,.22)');g.addColorStop(.35,'rgba(255,255,250,.05)');g.addColorStop(1,'rgba(0,0,0,.28)');x.globalCompositeOperation='soft-light';x.fillStyle=g;x.fillRect(X,Y,W,H);
   /* old buffed stains and water marks run down between the ribs */let r=7;const Q=()=>(r=(Math.imul(r,1103515245)+12345)>>>0)/4294967296;x.globalCompositeOperation='multiply';for(let i=0;i<40;i++){const cx=X+Q()*W,cy=Y+Q()*H*.6,w=6+Q()*46,h=H*(.15+Q()*.55),lg=x.createLinearGradient(0,cy,0,cy+h);lg.addColorStop(0,'rgba(60,62,66,0)');lg.addColorStop(.2,`rgba(60,62,66,${(.1+Q()*.2).toFixed(2)})`);lg.addColorStop(1,'rgba(60,62,66,0)');x.fillStyle=lg;x.fillRect(cx,cy,w,h)}x.restore()}}];
let wetSet=new Set();
function wetOf(s){ensure(s);if(!s.wv){s.wv=Object.create(s);Object.assign(s.wv,{name:'Wet '+s.name.toLowerCase(),wet:1,absorb:s.absorb>.3?Math.min(.8,s.absorb+.25):0})}return s.wv}
function V(s){return wetSet.has(s.id)?wetOf(s):s}
function ensure(s){if(s.tile)return s;const c=document.createElement('canvas');c.width=c.height=TS;const x=c.getContext('2d'),im=x.createImageData(TS,TS),h=new Float32Array(TS*TS);
 let mn=9,mx=-9,m=[0,0,0];
 for(let y=0;y<TS;y++)for(let i=0;i<TS;i++){const r=s.gen(i/TS,y/TS),k=y*TS+i;h[k]=r[0];if(r[0]<mn)mn=r[0];if(r[0]>mx)mx=r[0];
  im.data[k*4]=r[1];im.data[k*4+1]=r[2];im.data[k*4+2]=r[3];im.data[k*4+3]=255;m[0]+=r[1];m[1]+=r[2];m[2]+=r[3]}
 const sp=mx-mn||1;for(let k=0;k<h.length;k++)h[k]=(h[k]-mn)/sp;
 x.putImageData(im,0,0);s.tile=c;s.h=h;s.mean=m.map(v=>v/(TS*TS));s.pats={};return s}

