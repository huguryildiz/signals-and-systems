const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright');
const path = require('path');
(async () => {
  const file = 'file://' + path.resolve(__dirname, '..', 'dist', 'EE311_Signals_and_Systems.html');
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
    const known=new Set(['DIV','SPAN','P','B','I','EM','BUTTON','SVG','PATH','G','TEXT','LINE','CIRCLE','RECT','DL','DT','DD','H1','H2','H3','H4','UL','LI','FIGURE','FIGCAPTION','INPUT','LABEL','TABLE','TR','TD','TH','TBODY','THEAD','SMALL','BR','A','SUP','SUB','MATH','SEMANTICS','MROW','MI','MO','MN','ANNOTATION','MSUB','MSUP','MFRAC','MSTYLE','TSPAN','POLYLINE','POLYGON','SELECT','OPTION','CANVAS','CODE','STRONG','HR','KBD','SECTION','ARTICLE','HEADER','FOOTER','NAV','IMG','MSQRT','MUNDER','MOVER','MUNDEROVER','MSUBSUP','MTABLE','MTR','MTD','MTEXT','MSPACE','MPADDED','MENCLOSE','MOPERATOR','DEFS','MARKER','ELLIPSE','USE','CLIPPATH','FOREIGNOBJECT','MARQUEE','DFN']);
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
    // click every option / expandable in labs to expose hidden content
    const clicks = await page.$$('#scene-host [data-cls], #scene-host [data-prop], #scene-host [data-reveal]');
    for(const c of clicks){ try{ await c.click({timeout:800}); }catch(e){} }
    await page.waitForTimeout(200);
    const r2 = await probe();
    const err=Math.max(r.err,r2.err);
    const raw=[...new Set([...r.raw,...r2.raw])];
    const bogus=[...new Set([...r.bogus,...r2.bogus])];
    if(err||raw.length||bogus.length){ bad++;
      console.log(`\n### ${s.id}  katex-errors=${err}`);
      raw.forEach(x=>console.log('   '+x));
      if(bogus.length) console.log('   BOGUS TAGS: '+bogus.join(', '));
    }
  }
  console.log(`\nSCENES WITH MATH DAMAGE: ${bad} / ${scenes.length}`);
  await b.close();
})();
