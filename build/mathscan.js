const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright');
const path = require('path');
(async () => {
  const file = 'file://' + path.resolve(__dirname, '..', 'dist', 'Signals_and_Systems.html');
  const b = await chromium.launch();
  const page = await b.newPage({ viewport:{width:1920,height:1080} });
  await page.goto(file,{waitUntil:'load'}); await page.waitForTimeout(400);
  const scenes = await page.evaluate(()=>APP.scenes().map(s=>({id:s.id,steps:s.steps||0})));
  const probe = () => page.evaluate(()=>{
    const host=document.getElementById('scene-host');
    const out={err:0,raw:[],bogus:[]};
    out.err = host.querySelectorAll('.katex-error').length;
    host.querySelectorAll('.katex-error').forEach(e=>out.raw.push('KATEX-ERR: '+e.textContent.slice(0,80)));
    const txt=host.innerText||'';
    const m=txt.match(/\$[^$\n]{1,80}\$|\\[a-zA-Z]{2,}|&lt;/g);
    if(m) out.raw.push(...[...new Set(m)].slice(0,8).map(x=>'RAW: '+x));
    const known=new Set(['DIV','SPAN','P','B','I','EM','BUTTON','SVG','PATH','G','TEXT','LINE','CIRCLE','RECT','DL','DT','DD','H1','H2','H3','H4','UL','OL','LI','FIGURE','FIGCAPTION','INPUT','LABEL','TABLE','TR','TD','TH','TBODY','THEAD','SMALL','BR','A','SUP','SUB','MATH','SEMANTICS','MROW','MI','MO','MN','ANNOTATION','MSUB','MSUP','MFRAC','MSTYLE','TSPAN','POLYLINE','POLYGON','SELECT','OPTION','CANVAS','CODE','STRONG','HR','KBD','SECTION','ARTICLE','HEADER','FOOTER','NAV','IMG','MSQRT','MUNDER','MOVER','MUNDEROVER','MSUBSUP','MTABLE','MTR','MTD','MTEXT','MSPACE','MPADDED','MENCLOSE','MOPERATOR','DEFS','MARKER','ELLIPSE','USE','CLIPPATH','FOREIGNOBJECT','MARQUEE','DFN',
      /* the title motif blurs its glow with an SVG filter */
      'FILTER','FEGAUSSIANBLUR']);
    host.querySelectorAll('*').forEach(e=>{ const t=e.tagName.toUpperCase();
      if(!known.has(t)) out.bogus.push(t); });
    out.bogus=[...new Set(out.bogus)];
    return out;
  });
  let bad=0;
  for(const s of scenes){
    await page.evaluate(([id,st])=>APP.goId(id,st),[s.id,s.steps]);
    await page.waitForTimeout(160);
    let r = await probe();
    /* Click every option and expandable in a laboratory to expose the content it
       hides. A laboratory redraws itself on each click, which detaches every
       handle collected before the first one, so the handles are re-queried per
       click and the page is probed after each — a panel that the next click
       closes again is still measured while it is open. Collecting the handles
       once and probing only at the end misses a whole panel of damage. */
    let err=r.err; const raw=[...r.raw], bogus=[...r.bogus];
    for(const sel of ['[data-cls]','[data-prop]','[data-reveal]']){
      const n = await page.$$eval('#scene-host '+sel, els=>els.length).catch(()=>0);
      for(let i=0;i<n;i++){
        const h = (await page.$$('#scene-host '+sel))[i];
        if(!h) continue;
        try{ await h.click({timeout:800}); }catch(e){ continue; }
        await page.waitForTimeout(80);
        const p2 = await probe();
        err = Math.max(err, p2.err); raw.push(...p2.raw); bogus.push(...p2.bogus);
      }
    }
    /* An exam drill shows one question at a time and hides its worked solution
       behind a button, and a solution is the longest piece of authored
       mathematics in the artifact. Left unpaged and unopened, nineteen of the
       twenty questions and every one of the solutions are invisible to this
       scan, so damage there would pass every gate. Each question is opened in
       turn and the pager advanced; the panel redraws on every click, so the
       handles are re-queried per click exactly as they are for a laboratory. */
    const ndrill = await page.evaluate(()=>{
      const el=document.querySelector('#scene-host .dr-page .drill'); if(!el) return 0;
      const q=CONTENT.DRILL.find(x=>x.id===el.dataset.qid);
      return q ? CONTENT.DRILL.filter(x=>x.module===q.module).length : 0; }).catch(()=>0);
    for(let i=0;i<ndrill;i++){
      const sol = await page.$('#scene-host .drill [data-sol]');
      if(sol){
        try{ await sol.click({timeout:800}); }catch(e){}
        await page.waitForTimeout(90);
        const p2 = await probe();
        err = Math.max(err, p2.err); raw.push(...p2.raw); bogus.push(...p2.bogus);
      }
      const nx = await page.$('#scene-host .dr-pager [data-step="1"]:not([disabled])');
      if(!nx) break;
      try{ await nx.click({timeout:800}); }catch(e){ break; }
      await page.waitForTimeout(90);
    }
    const rawU=[...new Set(raw)], bogusU=[...new Set(bogus)];
    if(err||rawU.length||bogusU.length){ bad++;
      console.log(`\n### ${s.id}  katex-errors=${err}`);
      rawU.forEach(x=>console.log('   '+x));
      if(bogusU.length) console.log('   BOGUS TAGS: '+bogusU.join(', '));
    }
  }
  console.log(`\nSCENES WITH MATH DAMAGE: ${bad} / ${scenes.length}`);
  await b.close();
})();
