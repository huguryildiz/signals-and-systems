const {chromium}=require('/home/claude/.npm-global/lib/node_modules/playwright');
const path=require('path');
(async()=>{ const b=await chromium.launch(); const p=await b.newPage();
 const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 p.on('console',m=>{ if(m.type()==='error') errs.push('CONSOLE: '+m.text()); });
 await p.goto('file://'+path.resolve(__dirname,'..','dist','Lecture_Notes.html'),{waitUntil:'load'});
 await p.waitForTimeout(600);
 const n=await p.evaluate(()=>document.querySelectorAll('.page').length);
 await p.pdf({ path: path.resolve(__dirname,'..','dist','Lecture_Notes.pdf'),
   format:'A4', printBackground:true, displayHeaderFooter:true,
   headerTemplate:'<div></div>',
   footerTemplate:'<div style="width:100%;font-family:-apple-system,sans-serif;font-size:7.5pt;color:#8A8478;padding:0 17mm;display:flex;justify-content:space-between"><span>Signals and Systems</span><span class="pageNumber"></span></div>',
   margin:{top:'19mm',bottom:'20mm',left:'17mm',right:'17mm'} });
 console.log('sections',n,'errors',errs.length?errs.slice(0,3):'none');
 await b.close(); })();
