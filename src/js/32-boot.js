/* ---------- boot ---------- */
try{const st=JSON.parse(localStorage.getItem('mtb')||'{}');for(const p of PENS)if(p.empty||p.fillReq){const b=st.fills&&BOTTLES.find(q=>q.id===st.fills[p.id]);if(b)fillPen(p,b,true);else p.life=0}if(pen.fill)color=pen.colors.includes(st.color)?st.color:pen.colors[0]}catch(e){}
try{localStorage.setItem('rlDef46','1')}catch(_){}

renderTypes();renderBrands();renderRack();renderColors();renderSurfs();renderTop();doLayout();renderReact();
try{$('#perfBtn').addEventListener('click',()=>perfToggle(!perfOn));if(localStorage.getItem('rlPerf')==='1')perfToggle(true)}catch(_){}


