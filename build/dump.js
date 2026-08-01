const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright');
const path=require('path'), fs=require('fs');
(async()=>{ const b=await chromium.launch(); const p=await b.newPage();
 await p.goto('file://'+path.resolve(__dirname,'..','dist','Signals_and_Systems.html'),{waitUntil:'load'});
 const d=await p.evaluate(()=>({
   scenes: APP.scenes().map((s,i)=>({i:i+1,id:s.id,module:s.module,nav:s.nav,title:s.title,src:s.src||'',steps:s.steps||0,obj:s.objective||''})),
   q: CONTENT.DRILL.map(q=>({id:q.id,module:q.module,type:q.type,src:q.src,parts:(q.parts||[]).length,hasFig:!!q.figure,hasFigSol:!!q.figSol,hasSol:!!q.sol,hasErr:!!q.err}))
 }));
 fs.writeFileSync(path.resolve(__dirname,'..','audit','scenes.json'), JSON.stringify(d,null,1));
 console.log('scenes',d.scenes.length,'questions',d.q.length);
 await b.close(); })();
