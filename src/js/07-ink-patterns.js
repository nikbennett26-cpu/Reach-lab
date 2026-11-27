/* ---------- ink patterns: ink colour with surface-height holes ---------- */
const IP_MAT=new DOMMatrix([1/dpr,0,0,1/dpr,0,0]);
function inkPat(s,col,q){const qk=Math.round(clamp(q)*20)/20,key=col+'|'+qk;if(s.pats[key])return s.pats[key];{const ks=Object.keys(s.pats);if(ks.length>160)for(const k of ks.slice(0,40))delete s.pats[k]}
 const c=document.createElement('canvas');c.width=c.height=TS;const x=c.getContext('2d'),im=x.createImageData(TS,TS),rgb=hex(col),lo=qk*1.15-.16;
 for(let k=0;k<s.h.length;k++){const a=clamp((s.h[k]-lo)/.14);im.data[k*4]=rgb[0];im.data[k*4+1]=rgb[1];im.data[k*4+2]=rgb[2];im.data[k*4+3]=255*a*a*(3-2*a)}
 x.putImageData(im,0,0);const p=stk.x.createPattern(c,'repeat');p.setTransform(IP_MAT);return s.pats[key]=p}
function isOpaqueInk(ink){return ink===INK.oil||ink===INK.alcpaint||ink===INK.water||ink===INK.fluid||ink===INK.solid}
function inkAlpha(ink,s){if(isOpaqueInk(ink))return (!s.wet||pen.ruff)?1:ink.wthin;if(ink.gloss)return (s.absorb>.3||lum(s.mean)>.6?.97:.8)*(s.wet&&!pen.ruff?ink.wthin:1);return ink.opacity*(s.wet&&!pen.ruff?ink.wthin:1)*(ink.comp!=='multiply'&&!ink.chrome&&lum(s.mean)<.3?.88:1)}

