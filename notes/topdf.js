/* Renders every document edition to PDF, and reports any that the browser logged
   an error while building. Run through pw.js like the gates:

     cd build && node pw.js ../notes/topdf.js                                   */
const {chromium}=require('/home/claude/.npm-global/lib/node_modules/playwright');
const path=require('path');

const EDITIONS = [
  ['Lecture_Notes',        'Signals and Systems — Lecture Notes'],
  ['Student_Workbook',     'Signals and Systems — Student Workbook'],
  ['Instructor_Solutions', 'Signals and Systems — Instructor Solutions'],
  ['Formula_Reference',    'Signals and Systems — Formula and Notation Reference']
];

(async()=>{ const b=await chromium.launch(); let bad=0;
 for(const [name,footer] of EDITIONS){
   const p=await b.newPage();
   const errs=[]; p.on('pageerror',e=>errs.push(e.message));
   p.on('console',m=>{ if(m.type()==='error') errs.push('CONSOLE: '+m.text()); });
   await p.goto('file://'+path.resolve(__dirname,'..','dist',name+'.html'),{waitUntil:'load'});
   await p.waitForTimeout(900);
   const n=await p.evaluate(()=>document.querySelectorAll('.page').length);
   const ke=await p.evaluate(()=>document.querySelectorAll('.katex-error').length);
   await p.pdf({ path: path.resolve(__dirname,'..','dist',name+'.pdf'),
     format:'A4', printBackground:true, displayHeaderFooter:true,
     headerTemplate:'<div></div>',
     footerTemplate:'<div style="width:100%;font-family:-apple-system,sans-serif;font-size:7.5pt;color:#8A8478;padding:0 17mm;display:flex;justify-content:space-between"><span>'+footer+'</span><span class="pageNumber"></span></div>',
     margin:{top:'19mm',bottom:'20mm',left:'17mm',right:'17mm'} });
   if(errs.length||ke) bad++;
   console.log(name.padEnd(22),'sections',String(n).padStart(3),
     '| katex errors',ke,'| page errors',errs.length?errs.slice(0,3):'none');
   await p.close();
 }
 await b.close(); process.exit(bad?1:0); })();
