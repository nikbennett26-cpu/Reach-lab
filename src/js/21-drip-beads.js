/* ---------- LIVE 3D LIQUID DRIP BEADS (plump moving teardrop meniscus + tilt specular glint) ---------- */
function drawLiveDrips(x){
 if(!drips.length)return;
 const P=dpr,tx=clamp((tilt&&tilt.x)||0,-1,1),ty=clamp((tilt&&tilt.y)||0,-1,1);
 x.save();x.setTransform(P,0,0,P,0,0);
 for(let i=0;i<drips.length;i++){
  const d=drips[i];
  if(!d.lvis||d.dead||d.soft||d.et||d.wash||d.vol<=0||!d.lre)continue;
  const col=d.lcol||d.col;if(typeof col!=='string'||col[0]!=='#')continue;
  const vr=clamp(d.vol/(d.v0||1)),hd=d.thick?1.42:1.26;
  const rb=Math.max(1.05,d.lre*(.95+.28*(1-vr))*hd);
  const gx=d.gx||0,gy=d.gy||1,an=Math.atan2(gy,gx);
  const bx=d.lx+gx*rb*.34,by=d.ly+gy*rb*.34;
  const nx=-gy,ny=gx,lv=lum(hex(col));
  /* 1. Soft contact shadow under the swollen liquid head */
  x.globalAlpha=.24;x.fillStyle='#080a0e';
  x.beginPath();x.ellipse(bx+1.1+tx*1.2,by+1.5+ty*1.2,rb*1.04,rb*1.32,an-Math.PI/2,0,TAU);x.fill();
  /* 2. Plump gravity-elongated liquid teardrop meniscus */
  const liveMul=d.ink&&d.ink.comp==='multiply';  x.globalCompositeOperation=liveMul?'multiply':'source-over';  x.globalAlpha=d.ink?Math.min(1,d.ink.opacity+.04):1;x.fillStyle=col;
  x.beginPath();
  x.moveTo(d.lx-gx*rb*2.2,d.ly-gy*rb*2.2);
  x.quadraticCurveTo(d.lx-gx*rb*.3+nx*rb*.98,d.ly-gy*rb*.3+ny*rb*.98,bx,by);
  x.quadraticCurveTo(d.lx-gx*rb*.3-nx*rb*.98,d.ly-gy*rb*.3-ny*rb*.98,d.lx-gx*rb*2.2,d.ly-gy*rb*2.2);
  x.fill();
  x.beginPath();x.ellipse(bx,by,rb,rb*1.28,an-Math.PI/2,0,TAU);x.fill();
  /* 3. Cool lower-right rim shading so light/white beads read as glossy 3D drops */
  if(lv>.45){
   x.globalAlpha=.18+.14*lv;x.strokeStyle='#1f2636';x.lineWidth=Math.max(.65,rb*.26);
   x.beginPath();x.arc(bx,by,rb*.82,an-.4,an+1.15);x.stroke();
  }
  /* 4. Curved-bead Fresnel rim + tilt-driven overhead Blinn-Phong specular matching paintOverheadGlare() */
  if(lightOn){
   const gxL=W*(.50+tx*.82),gyL=H*(.36+ty*.72),dxL=(bx-gxL)/Math.max(1,W*.275),dyL=(by-gyL)/Math.max(1,H*.198),d2L=dxL*dxL+dyL*dyL;
   const fallL=d2L<2.6?Math.exp(-d2L*1.1):0;
   let lxL=-tx*1.35+.12,lyL=-ty*1.35-.42,lzL=1.0;const lML=Math.hypot(lxL,lyL,lzL)||1;lxL/=lML;lyL/=lML;lzL/=lML;
   const lAng=Math.atan2(lyL,lxL),fRim=clamp((.24+.76*fallL)*(d.thick?.85:.68),0,.95);
   x.globalCompositeOperation='screen';
   /* Grazing Schlick Fresnel rim wrapping the light-facing curved edge of the teardrop meniscus */
   x.globalAlpha=fRim*.48;x.strokeStyle='rgba(245,250,255,1)';x.lineWidth=Math.max(.55,rb*.22);x.lineCap='round';
   x.beginPath();x.arc(bx,by,rb*.86,lAng-.95,lAng+.95);x.stroke();
   /* Tight Blinn-Phong specular glint shifted along the curved dome toward the light vector */
   x.globalAlpha=fRim*(d.thick?.82:.62);x.fillStyle='#f8fbff';
   x.beginPath();x.ellipse(bx+lxL*rb*.42,by+lyL*rb*.48,Math.max(.4,rb*.22),Math.max(.6,rb*.40),an-Math.PI/2-.2,0,TAU);x.fill();
   x.globalCompositeOperation='source-over';
  }
 }
 x.restore();
}

