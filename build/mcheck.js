/* Portrait-phone sweep. Not one of the eleven gates — those measure the wide
   page, where the scene is a fixed drawing scaled to fit, and none of them
   knows the phone layout exists. This walks every scene at every reveal state
   on a 390-point screen and reports the three things that layout can get
   wrong: a page that scrolls sideways, an element wider than the screen that
   is not inside something built to be panned, and a control too small to hit.

   Usage: node pw.js mcheck.js [--w=390] [--h=844] [--dark]  */
const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright');
const path = require('path');

(async () => {
  const args = process.argv.slice(2);
  const num = (k,d)=>{const a=args.find(x=>x.startsWith('--'+k+'='));return a?+a.split('=')[1]:d;};
  const W = num('w',390), H = num('h',844), dark = args.includes('--dark');

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport:{width:W,height:H}, deviceScaleFactor:2,
    isMobile:true, hasTouch:true });
  const errors = [];
  page.on('console', m=>{ if(m.type()==='error') errors.push(m.text()); });
  page.on('pageerror', e=>errors.push('PAGEERROR: '+e.message));
  await page.goto('file://'+path.resolve(__dirname,'..','dist','Signals_and_Systems.html'));
  await page.waitForTimeout(600);
  if(dark) await page.evaluate(()=>document.getElementById('btn-theme').click());

  const layout = await page.evaluate(()=>document.body.dataset.layout);
  const scenes = await page.evaluate(()=>APP.scenes().map(s=>({id:s.id, steps:s.steps||0})));

  const sideways = [], spilled = [], small = [];
  for(const s of scenes){
    for(let st=0; st<=s.steps; st++){
      await page.evaluate(([id,step])=>APP.goId(id,step), [s.id,st]);
      await page.waitForTimeout(60);
      const r = await page.evaluate(()=>{
        const vw = document.documentElement.clientWidth;
        const out = { over: document.documentElement.scrollWidth - vw, spill:[], small:[] };
        const scrolls = e => { const o=getComputedStyle(e).overflowX; return o==='auto'||o==='scroll'; };
        document.querySelectorAll('#scene-host *').forEach(e=>{
          /* the shapes inside a drawing are laid out by its viewBox and clipped
             by it; the box that belongs to the page is the svg itself */
          if(e.ownerSVGElement) return;
          const b = e.getBoundingClientRect();
          if(b.width <= vw + 1) return;
          for(let p=e.parentElement; p; p=p.parentElement){ if(scrolls(p)) return; }
          out.spill.push((e.tagName+'.'+(typeof e.className==='string'?e.className:'svg')).trim()+' '+Math.round(b.width));
        });
        document.querySelectorAll('#appheader button, #chrome button, .btn, .seg button, .runbar button')
          .forEach(e=>{ const b=e.getBoundingClientRect();
            if(b.width && (b.height < 38 || b.width < 32))
              out.small.push((e.id||e.textContent.trim().slice(0,18))+' '+Math.round(b.width)+'x'+Math.round(b.height)); });
        return out;
      });
      const at = s.id+'/'+st;
      if(r.over > 1) sideways.push(at+' by '+r.over+'px');
      if(r.spill.length) spilled.push(at+' → '+r.spill.slice(0,3).join(', '));
      r.small.forEach(t=>small.push(at+' → '+t));
    }
  }
  const list = (n,a)=>console.log(n+': '+(a.length? a.length+'\n  '+a.slice(0,14).join('\n  ') : 'none'));
  console.log('VIEWPORT: '+W+'x'+H+(dark?' dark':'')+'   LAYOUT: '+layout);
  console.log('SCENES WALKED: '+scenes.length+', states '+scenes.reduce((a,s)=>a+s.steps+1,0));
  list('PAGE SCROLLS SIDEWAYS', sideways);
  list('SPILLED OUT OF THE COLUMN', spilled);
  list('TARGETS UNDER 38 POINTS', [...new Set(small)]);
  console.log('CONSOLE ERRORS: '+(errors.length? errors.length+'\n  '+errors.slice(0,6).join('\n  ') : 'none'));
  await browser.close();
})();
