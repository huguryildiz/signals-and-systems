const {chromium}=require('/home/claude/.npm-global/lib/node_modules/playwright');
const path=require('path');
(async()=>{const b=await chromium.launch();
 const cases=[['dark','normal','m1-classify',3,'dark_normal'],
              ['dark','normal','m2-open',0,'dark_m2open']];
 for(const [th,dp,id,st,name] of cases){
   const p=await b.newPage({viewport:{width:1920,height:1080}});
   await p.goto('file://'+path.resolve(__dirname,'..','dist','Signals_and_Systems.html'),{waitUntil:'load'});
   await p.waitForTimeout(400);
   await p.evaluate(t=>{APP.state.theme=t;APP.state.sidebar='on';
     document.body.dataset.theme=t;document.body.dataset.sidebar='on';APP.fit();},th);
   await p.waitForTimeout(200);
   await p.evaluate(([i,s])=>APP.goId(i,s),[id,st]); await p.waitForTimeout(350);
   await p.screenshot({path:path.resolve(__dirname,'..','shots',name+'.png')});
   await p.close();
 }
 await b.close(); console.log('shots done');})();
