/* Renders every document edition to PDF, and reports any that the browser logged
   an error while building. Run through pw.js like the gates:

     cd build && node pw.js ../notes/topdf.js                                   */
const {chromium}=require('/home/claude/.npm-global/lib/node_modules/playwright');
const path=require('path');
const fs=require('fs');
const {execFileSync}=require('child_process');

const COURSE = 'Signals and Systems';
const EDITIONS = [
  ['Lecture_Notes',        'Lecture Notes'],
  ['Student_Workbook',     'Student Workbook'],
  ['Instructor_Solutions', 'Instructor Solutions'],
  ['Formula_Reference',    'Formula and Notation Reference']
];

/* The page size, the margins and the footer are the stylesheet's @page rules,
   so the whole document prints in one pass: the cover is a named page with no
   margin and no footer, and every other page keeps its margin boxes. One pass
   keeps what a join of two files would drop: the title, the tagged structure,
   the bookmarks and every internal link. */
const OPTS = { preferCSSPageSize:true, printBackground:true, outline:true, tagged:true };

/* Page numbers for the contents and the two lists. Chromium cannot resolve a
   reference to a page number, so the document is printed once with a marker
   string at every target, pdftotext finds the page of each marker, and the
   numbers are written into the empty slots before the final print. The slots
   have a fixed width, so filling them moves nothing. */
const mark = (p, on) => p.evaluate(on=>{
  document.querySelectorAll('.pgmark').forEach(e=>e.remove());
  if(!on) return [];
  const ids=[...new Set([...document.querySelectorAll('.pg[data-target]')].map(e=>e.dataset.target))];
  ids.forEach((id,i)=>{ const el=document.getElementById(id); if(!el) return;
    const m=document.createElement('span'); m.className='pgmark'; m.textContent='PGMK'+i+'KMGP';
    el.style.position='relative'; el.prepend(m); });
  return ids;
}, on);
const pagesOf = (file, ids) => {
  const pages = execFileSync('pdftotext',['-raw',file,'-'],{maxBuffer:1<<28}).toString().split('\f');
  const at = {};
  pages.forEach((t,i)=>{ for(const m of t.matchAll(/PGMK(\d+)KMGP/g)) at[ids[+m[1]]] = i+1; });
  return at;
};

(async()=>{ const b=await chromium.launch(); let bad=0;
 for(const [name,doc] of EDITIONS){
   const p=await b.newPage();
   const errs=[], warns=[]; p.on('pageerror',e=>errs.push(e.message));
   p.on('console',m=>{ if(m.type()==='error') errs.push('CONSOLE: '+m.text());
                       if(m.type()==='warning' && m.text().startsWith('NOTES:')) warns.push(m.text()); });
   await p.goto('file://'+path.resolve(__dirname,'..','dist',name+'.html'),{waitUntil:'load'});
   await p.waitForTimeout(900);
   await p.addStyleTag({content:`
     @page{ @top-right{ content:"${COURSE} — ${doc}"; font-family:-apple-system,"SF Pro Text","Segoe UI",Helvetica,Arial,sans-serif;
                        font-size:7.5pt; color:#8A8478; }
            @bottom-right{ content:"${doc} · " counter(page); } }
     .pgmark{ position:absolute; left:0; top:0; font-size:4pt; line-height:1; color:#fff; white-space:nowrap; }`});
   const n=await p.evaluate(()=>document.querySelectorAll('.page').length);
   const ke=await p.evaluate(()=>document.querySelectorAll('.katex-error').length);
   const out=path.resolve(__dirname,'..','dist',name+'.pdf'), tmp=out.replace(/\.pdf$/,'.pages.pdf');

   const ids=await mark(p,true); let missing=[], moved=[];
   if(ids.length){
     await p.pdf(Object.assign({path:tmp},OPTS));
     const at=pagesOf(tmp,ids);
     missing=ids.filter(id=>!at[id]);
     await p.evaluate(at=>document.querySelectorAll('.pg[data-target]').forEach(e=>{ e.textContent=at[e.dataset.target]||''; }),at);
     /* filling the numbers must not move a target: print once more and compare */
     await p.pdf(Object.assign({path:tmp},OPTS));
     const again=pagesOf(tmp,ids);
     moved=ids.filter(id=>at[id]!==again[id]);
     fs.unlinkSync(tmp);
   }
   await mark(p,false);
   await p.pdf(Object.assign({path:out},OPTS));
   if(errs.length||ke||missing.length||moved.length) bad++;
   console.log(name.padEnd(22),'sections',String(n).padStart(3),'| page refs',ids.length,
     missing.length?'MISSING '+missing.slice(0,5):'', moved.length?'MOVED '+moved.slice(0,5):'',
     '| katex errors',ke,'| page errors',errs.length?errs.slice(0,3):'none',
     warns.length?'| '+warns.length+' notes warnings: '+warns.slice(0,4).join('; '):'');
   await p.close();
 }
 await b.close(); process.exit(bad?1:0); })();
