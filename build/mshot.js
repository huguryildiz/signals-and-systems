/* Portrait-phone renderings — the phone counterpart of shot.js.

   Usage:  node pw.js mshot.js [id|state[,…]] [--w=390] [--h=844] [--dark] [--tag=x]

   Ids are scene ids, rendered at their last reveal state. Four names are not
   scenes but the states a phone reader passes through that no scene shows:
   `drawer` (the contents over the page), `search`, `notation` and `map`.
   With no argument it renders a short standing set of both kinds. Nothing here
   is a check — mcheck.js is the check; this exists to be looked at. */
const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');

const STATES = {
  drawer:   async p => { await p.evaluate(()=>APP.goId('m1-power',1));
                         await p.click('#sbtoggle'); },
  search:   async p => { await p.evaluate(()=>APP.open('ov-search'));
                         await p.fill('#searchbox','entropy'); },
  notation: async p => { await p.evaluate(()=>APP.open('ov-gloss')); },
  map:      async p => { await p.evaluate(()=>APP.open('ov-map')); }
};
const DEFAULT = ['title','m1-open','m1-lab-a','m1-drill','m6-lab-i',
                 'drawer','search','notation','map'];

(async () => {
  const args = process.argv.slice(2);
  const num = (k,d)=>{const a=args.find(x=>x.startsWith('--'+k+'='));return a?+a.split('=')[1]:d;};
  const dark = args.includes('--dark');
  const tag  = (args.find(a=>a.startsWith('--tag='))||'=').split('=')[1] || '';
  const W = num('w',390), H = num('h',844);
  const only = args.filter(a=>!a.startsWith('--'))[0];
  const names = only ? only.split(',') : DEFAULT;

  const outDir = path.resolve(__dirname,'..','shots-m');
  fs.mkdirSync(outDir,{recursive:true});
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport:{width:W,height:H}, deviceScaleFactor:2,
    isMobile:true, hasTouch:true });
  const errors = [];
  page.on('console', m=>{ if(m.type()==='error') errors.push(m.text()); });
  page.on('pageerror', e=>errors.push('PAGEERROR: '+e.message));
  await page.goto('file://'+path.resolve(__dirname,'..','dist','Signals_and_Systems.html'));
  await page.waitForTimeout(600);
  if(dark) await page.evaluate(()=>document.getElementById('btn-theme').click());

  const known = await page.evaluate(()=>APP.scenes().map(s=>({id:s.id, steps:s.steps||0})));
  const written = [];
  for(const n of names){
    if(STATES[n]){ await page.evaluate(()=>APP.closeAll()); await STATES[n](page); }
    else {
      const s = known.find(k=>k.id===n);
      if(!s){ written.push('(no scene '+n+')'); continue; }
      await page.evaluate(()=>APP.closeAll());
      await page.evaluate(([id,st])=>APP.goId(id,st), [s.id, s.steps]);
    }
    await page.waitForTimeout(340);
    const f = path.join(outDir, n + (tag?'__'+tag:'') + (dark?'__dark':'') + '.png');
    await page.screenshot({ path:f });
    written.push(path.basename(f));
  }
  console.log('SHOTS: ' + written.join(' '));
  console.log('CONSOLE ERRORS: ' + (errors.length ? errors.length+'\n  '+errors.slice(0,10).join('\n  ') : 'none'));
  await browser.close();
})();
