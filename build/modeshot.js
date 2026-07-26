const {chromium}=require('/home/claude/.npm-global/lib/node_modules/playwright');
const path=require('path');
(async()=>{const b=await chromium.launch();
 const cases=[['dark','normal','m1-classify',3,'dark_normal'],
              ['dark','projector','m3-ex-dt1',3,'dark_proj'],
              ['light','projector','m1-combined',4,'light_proj'],
              ['dark','normal','m2-open',0,'dark_m2open']];
 for(const [th,dp,id,st,name] of cases){
   const p=await b.newPage({viewport:{width:1920,height:1080}});
   await p.goto('file://'+path.resolve(__dirname,'..','dist','Signals_and_Systems.html'),{waitUntil:'load'});
   await p.waitForTimeout(400);
   await p.evaluate(([t,d])=>{APP.state.theme=t;APP.state.display=d;APP.state.sidebar=d==='projector'?'off':'on';
     document.body.dataset.theme=t;document.body.dataset.display=d;document.body.dataset.sidebar=APP.state.sidebar;APP.fit();},[th,dp]);
   await p.waitForTimeout(200);
   await p.evaluate(([i,s])=>APP.goId(i,s),[id,st]); await p.waitForTimeout(350);
   await p.screenshot({path:path.resolve(__dirname,'..','shots',name+'.png')});
   await p.close();
 }
 await b.close(); console.log('shots done');})();
