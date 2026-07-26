const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright');
const path=require('path'), fs=require('fs');
const sizes=[[1920,1080],[1512,982],[1280,800],[2560,1440],[1100,1400],[1024,768]];
(async()=>{ const b=await chromium.launch(); const out=[];
 for(const [w,h] of sizes){
   const p=await b.newPage({viewport:{width:w,height:h}});
   await p.goto('file://'+path.resolve(__dirname,'..','dist','Signals_and_Systems.html'),{waitUntil:'load'});
   await p.waitForTimeout(500);
   await p.evaluate(()=>APP.goId('m1-classify',3)); await p.waitForTimeout(300);
   const m=await p.evaluate(()=>{
     const st=document.getElementById('stage').getBoundingClientRect();
     const wr=document.getElementById('stagewrap').getBoundingClientRect();
     return { k:+document.getElementById('stage').dataset.k,
       overRight: Math.round(st.right - wr.right), overBottom: Math.round(st.bottom - wr.bottom),
       overLeft: Math.round(wr.left - st.left), overTop: Math.round(wr.top - st.top),
       docScrollW: document.documentElement.scrollWidth - document.documentElement.clientWidth };
   });
   out.push(`${w}x${h}  k=${m.k}  clip L/R/T/B = ${m.overLeft}/${m.overRight}/${m.overTop}/${m.overBottom}  docOverflow=${m.docScrollW}`);
   if(w===1512||w===1100) await p.screenshot({path:path.resolve(__dirname,'..','shots','shell_'+w+'.png')});
   await p.close();
 }
 console.log(out.join('\n')); await b.close(); })();
