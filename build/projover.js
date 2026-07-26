const {chromium}=require('/home/claude/.npm-global/lib/node_modules/playwright');
const path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
 await p.goto('file://'+path.resolve(__dirname,'..','dist','Signals_and_Systems.html'),{waitUntil:'load'});
 await p.waitForTimeout(400);
 await p.evaluate(()=>{APP.state.display='projector';APP.state.sidebar='off';
   document.body.dataset.display='projector';document.body.dataset.sidebar='off';APP.fit();});
 await p.waitForTimeout(250);
 const sc=await p.evaluate(()=>APP.scenes().map(s=>({id:s.id,steps:s.steps||0})));
 const bad=[];const fits=[];
 for(const s of sc){ await p.evaluate(([i,t])=>APP.goId(i,t),[s.id,s.steps]); await p.waitForTimeout(110);
   const m=await p.evaluate(()=>{const h=document.getElementById('scene-host');const q=h.querySelector('.qb-scroll');
     const inr=h.firstElementChild.getBoundingClientRect();
     return {fit:+(h.dataset.fit||1), over: q?0:Math.round(inr.height-h.clientHeight)};});
   fits.push(m.fit); if(m.over>2) bad.push(s.id+' +'+m.over+'px'); }
 fits.sort((a,b)=>a-b);
 console.log('projector: clipped scenes =', bad.length, bad.slice(0,6).join(', '));
 console.log('fit factors: min', fits[0], ' median', fits[Math.floor(fits.length/2)]);
 await b.close();})();
