const {chromium}=require('/home/claude/.npm-global/lib/node_modules/playwright');
const path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1600,height:900}});
 await p.goto('file://'+path.resolve(__dirname,'..','dist','Signals_and_Systems.html'),{waitUntil:'load'});
 await p.waitForTimeout(400);
 const out=await p.evaluate(()=>{
   const r={};
   PLOT.setTheme({dark:false, scale:1});
   const a=PLOT.Axes({w:300,h:120,xr:[-1,4],yr:[-1,2]}); a.stem([[0,1],[1,2]]);
   r.light=a.svg().slice(0,420);
   PLOT.setTheme({dark:true, scale:1.36});
   const c=PLOT.Axes({w:300,h:120,xr:[-1,4],yr:[-1,2]}); c.stem([[0,1],[1,2]]);
   r.dark=c.svg().slice(0,420);
   r.col=JSON.stringify(PLOT.COL);
   return r;});
 console.log('COL:',out.col,'\n\nLIGHT:\n',out.light,'\n\nDARK:\n',out.dark);
 await b.close();})();
