/* seedable randomness: every stroke reseeds it with a number saved in its recording, so a replay rolls the same splats, drips and wobbles */
const _rngNative=Math.random;let _rngS=(_rngNative()*4294967296)>>>0;Math.random=function(){_rngS=(_rngS+0x6D2B79F5)>>>0;let t=_rngS;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296};
function rngSeed(s){_rngS=(s>>>0)||1}function rngFresh(){return((_rngNative()*4294967296)>>>0)||1}

/* safety net: some embedded viewers (in-app previews, hidden tabs) hand the page a 0-size canvas; drawing from one throws
   on every frame. An empty canvas has nothing to draw, so just skip it. */
{const P=CanvasRenderingContext2D.prototype,d0=P.drawImage;P.drawImage=function(im){if(im&&(im instanceof HTMLCanvasElement||(typeof OffscreenCanvas!=='undefined'&&im instanceof OffscreenCanvas))&&(!im.width||!im.height))return;return d0.apply(this,arguments)};
 const cp0=P.createPattern;P.createPattern=function(im,r){if(im&&im instanceof HTMLCanvasElement&&(!im.width||!im.height))return null;return cp0.call(this,im,r)}}
{
const MM=4, TAU=Math.PI*2, LOWGPU=/Android/i.test(navigator.userAgent),dpr=Math.max(1,Math.min(2,window.devicePixelRatio||1,Math.sqrt((LOWGPU?.75e6:1.35e6)/Math.max(1,innerWidth*innerHeight)))), TS=Math.round(256*dpr);
const $=s=>document.querySelector(s);
const clamp=(v,a=0,b=1)=>v<a?a:v>b?b:v;
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const lum=c=>(0.2126*c[0]+0.7152*c[1]+0.0722*c[2])/255;

