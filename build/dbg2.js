const {chromium}=require('/home/claude/.npm-global/lib/node_modules/playwright');
const path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
 await p.goto('file://'+path.resolve(__dirname,'..','dist','EE311_Signals_and_Systems.html'),{waitUntil:'load'});
 await p.waitForTimeout(400);
 await p.evaluate(()=>{APP.state.theme='dark';APP.state.display='projector';APP.state.sidebar='off';
   document.body.dataset.theme='dark';document.body.dataset.display='projector';document.body.dataset.sidebar='off';});
 await p.evaluate(()=>APP.goId('m3-ex-dt1',3)); await p.waitForTimeout(400);
 const o=await p.evaluate(()=>{
   const svg=document.querySelector('#scene-host figure svg');
   const el=svg.querySelectorAll('*');
   const big=[...el].map(e=>({t:e.tagName,sw:e.getAttribute('stroke-width'),r:e.getAttribute('r'),fill:e.getAttribute('fill')}))
     .filter(x=>(x.sw&&parseFloat(x.sw)>6)||(x.r&&parseFloat(x.r)>10));
   return {count:el.length, big:big.slice(0,6), head:svg.outerHTML.slice(0,300),
     box:svg.getBoundingClientRect().width+'x'+svg.getBoundingClientRect().height,
     vb:svg.getAttribute('viewBox')};
 });
 console.log(JSON.stringify(o,null,1));
 await b.close();})();
