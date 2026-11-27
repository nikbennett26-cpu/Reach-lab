/* ---------- tileable value noise ---------- */
const lats={};
function lat(nx,ny){const k=nx+'x'+ny;if(!lats[k]){let s=(nx*7919+ny*104729)>>>0;const d=new Float32Array(nx*ny);for(let i=0;i<d.length;i++){s=(Math.imul(s,1103515245)+12345)>>>0;d[i]=s/4294967296}lats[k]=d}return lats[k]}
const sm=t=>t*t*(3-2*t);
function n(nx,ny,u,v){const d=lat(nx,ny),x=u*nx,y=v*ny,xi=Math.floor(x),yi=Math.floor(y),fx=sm(x-xi),fy=sm(y-yi);
 const x0=((xi%nx)+nx)%nx,x1=(x0+1)%nx,y0=((yi%ny)+ny)%ny,y1=(y0+1)%ny,a=d[y0*nx+x0],b=d[y0*nx+x1],c=d[y1*nx+x0],e=d[y1*nx+x1];
 return a+(b-a)*fx+(c-a)*fy+(a-b-c+e)*fx*fy}

