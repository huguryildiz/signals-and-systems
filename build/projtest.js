const {chromium}=require('/home/claude/.npm-global/lib/node_modules/playwright');
const path=require('path');
(async()=>{
 const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1920,height:1080}});
 const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.resolve(__dirname,'..','dist','EE311_Signals_and_Systems.html'),{waitUntil:'load'});
 await p.waitForTimeout(500);
 const res={};
 for(const mode of ['normal','projector']){
   await p.evaluate(m=>{ APP.state.display=m; APP.state.sidebar = m==='projector'?'off':'on';
     document.body.dataset.display=m; document.body.dataset.sidebar=APP.state.sidebar; APP.fit(); }, mode);
   await p.waitForTimeout(250);
   const scenes=await p.evaluate(()=>APP.scenes().map(s=>({id:s.id,steps:s.steps||0})));
   const rows=[];
   for(const s of scenes){
     await p.evaluate(([id,st])=>APP.goId(id,st),[s.id,s.steps]);
     await p.waitForTimeout(120);
     const m=await p.evaluate(()=>{
       const host=document.getElementById('scene-host');
       const fit=+(host.dataset.fit||1);
       const el=host.querySelector('.body, .wex-v, .note, .small')||host.querySelector('p');
       const px=el?parseFloat(getComputedStyle(el).fontSize):0;
       const inner=host.firstElementChild.getBoundingClientRect();
       return {fit, px, over: Math.round(inner.height-host.clientHeight)};
     });
     rows.push({id:s.id, eff:+(m.px*m.fit).toFixed(1), fit:m.fit, over:m.over});
   }
   res[mode]=rows;
 }
 const rank=r=>1080/r.eff;
 for(const mode of ['normal','projector']){
   const rows=res[mode].filter(r=>r.eff>0);
   const med=rows.map(r=>r.eff).sort((a,b)=>a-b)[Math.floor(rows.length/2)];
   const worst=rows.slice().sort((a,b)=>a.eff-b.eff).slice(0,6);
   console.log(`\n${mode.toUpperCase()}  median body text = ${med}px on a 1080 stage  →  H/${(1080/med).toFixed(0)}`);
   console.log('  worst scenes:', worst.map(w=>`${w.id} ${w.eff}px (H/${(1080/w.eff).toFixed(0)}, fit ${w.fit})`).join('  |  '));
   console.log('  scenes below H/45 threshold:', rows.filter(r=>1080/r.eff>45).length, '/', rows.length);
 }
 console.log('\nerrors:', errs.length?errs.slice(0,3):'none');
 await b.close();
})();
