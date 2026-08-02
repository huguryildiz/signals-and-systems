/* The gate for the contents addressing.

   Every scene must have exactly one address, addresses must not repeat, and
   each chapter's section numbers, scene ordinals, laboratory numbers and
   question numbers must run from their first value upward with no gap. A gap
   means a scene was dropped from the declaration in `89_sections.js` and is
   now unreachable from the contents; a repeat means two scenes answer to the
   same address, which is the failure a reader meets as a wrong link.

   It also holds the rule that keeps the two numbering systems apart: an
   anchor into the textbook is never rendered as a bare section mark. This
   course's chapter 5 is the continuous-time transform and the textbook's
   chapter 5 is the discrete-time one, so a bare number beside a scene title
   reads as this course's own address and is a factual error on the page. */
const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright');
const path = require('path');

(async () => {
  const file = 'file://' + path.resolve(__dirname, '..', 'dist', 'Signals_and_Systems.html');
  const b = await chromium.launch();
  const page = await b.newPage({ viewport:{width:1920,height:1080} });
  await page.goto(file,{waitUntil:'load'}); await page.waitForTimeout(400);

  const data = await page.evaluate(()=>({
    scenes: APP.scenes().map(s=>({id:s.id, module:s.module, sec:s.sec||null, book:s.book||null})),
    chapters: CONTENT.CHAPTERS.map(c=>({n:c.n, module:c.module, flat:!!c.flat})),
    sections: CONTENT.SECTIONS,
    mark: CONTENT.BOOKMARK
  }));

  const fail = [];
  const say  = m => fail.push(m);

  /* ---- every scene addressed, exactly once ---- */
  /* The artifact title scene is the cover and deliberately carries no address. */
  const COVER = 'title';
  const seen = new Map();
  for(const s of data.scenes){
    if(s.id === COVER){
      if(s.sec) say(`cover scene "${s.id}" should carry no address, has ${s.sec}`);
      continue;
    }
    if(!s.sec){ say(`scene "${s.id}" (${s.module}) has no address`); continue; }
    if(seen.has(s.sec)) say(`address ${s.sec} used by both "${seen.get(s.sec)}" and "${s.id}"`);
    else seen.set(s.sec, s.id);
  }

  /* ---- runs with no gap, per chapter ---- */
  const run = (label, nums) => {
    const sorted = [...nums].sort((a,b)=>a-b);
    sorted.forEach((v,k)=>{ if(v !== sorted[0]+k) say(`${label}: gap before ${v}`); });
  };
  for(const ch of data.chapters){
    const mine = data.scenes.filter(s=>s.sec && s.sec.split('.')[0] === ch.n);

    run(`chapter ${ch.n} laboratories`,
        mine.filter(s=>/\.L\d+$/.test(s.sec)).map(s=>+s.sec.match(/\.L(\d+)$/)[1]));
    run(`chapter ${ch.n} question sections`,
        mine.filter(s=>/\.Q\d+$/.test(s.sec)).map(s=>+s.sec.match(/\.Q(\d+)$/)[1]));

    if(ch.flat){
      run(`chapter ${ch.n} scenes`,
          mine.filter(s=>/^[^.]+\.\d+$/.test(s.sec)).map(s=>+s.sec.split('.')[1]));
      continue;
    }

    const secs = (data.sections[ch.module]||[]).map(x=>x.n);
    run(`chapter ${ch.n} sections`, secs.map(n=>+n.split('.')[1]));
    if(secs.length && +secs[0].split('.')[1] !== 0)
      say(`chapter ${ch.n} does not open at .0`);

    for(const sn of secs){
      const ords = mine.filter(s=>s.sec.startsWith(sn+'.') && /\.\d+$/.test(s.sec))
                       .map(s=>+s.sec.split('.').pop());
      if(!ords.length){ say(`section ${sn} has no scene`); continue; }
      if(Math.min(...ords) !== 1) say(`section ${sn} does not open at .1`);
      run(`section ${sn}`, ords);
    }
  }

  /* ---- the declaration and the scene set agree ---- */
  const ids = new Set(data.scenes.map(s=>s.id));
  const declared = new Map();
  for(const [mod, secs] of Object.entries(data.sections))
    for(const sec of secs)
      for(const id of sec.ids){
        if(!ids.has(id)) say(`declared id "${id}" (${mod} ${sec.n}) is not a scene`);
        if(declared.has(id)) say(`id "${id}" declared twice: ${declared.get(id)} and ${mod} ${sec.n}`);
        else declared.set(id, mod+' '+sec.n);
      }

  /* ---- anchors are well formed, and never bare on the page ---- */
  for(const s of data.scenes){
    if(s.book === null) continue;
    if(!/^\d+(\.\d+){0,2}(, \d+(\.\d+){0,2})*$/.test(s.book))
      say(`scene "${s.id}" has a malformed anchor: ${s.book}`);
  }
  /* On screen the anchor is the open-book icon followed by `CH1.1.2`, inside
     the chip. Outside that chip a `CH` reference, or a section mark of any
     kind, reads as this course's own numbering — the two systems do not agree,
     so either one is a factual error on the page rather than a style slip. */
  const anchors = await page.evaluate(()=>{
    const bad = [];
    document.querySelectorAll('#sidenav, #mapgrid, #scene-host').forEach(host=>{
      host.querySelectorAll('*').forEach(e=>{
        if(e.children.length) return;
        const t = (e.textContent||'').trim();
        if(/§/.test(t))
          bad.push(`section mark on the page: "${t.slice(0,60)}"`);
        if(/\bCH\s?\d/.test(t) && !e.closest('.ebbook'))
          bad.push(`textbook reference outside the chip: "${t.slice(0,60)}"`);
      });
      host.querySelectorAll('.ebbook').forEach(c=>{
        const t = (c.textContent||'').trim();
        if(!c.querySelector('svg'))
          bad.push(`chip without the book icon: "${t.slice(0,40)}"`);
        if(!/^CH\d/.test(t))
          bad.push(`chip address not written CH…: "${t.slice(0,40)}"`);
      });
    });
    return [...new Set(bad)];
  });
  anchors.forEach(say);

  console.log('SCENES: '+data.scenes.length);
  console.log('ADDRESSED: '+seen.size);
  console.log('ANCHORED: '+data.scenes.filter(s=>s.book).length);
  console.log('PROBLEMS: '+(fail.length? '\n  '+fail.join('\n  ') : 'none'));
  await b.close();
  process.exit(fail.length ? 1 : 0);
})();
