/* A look at the contents rail and the course map, in both palettes. Scratch
   tool, not a gate. */
const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright');
const path = require('path');
const OUT = process.argv[2] || '/tmp';

(async () => {
  const file = 'file://' + path.resolve(__dirname, '..', 'dist', 'Signals_and_Systems.html');
  const b = await chromium.launch();
  const page = await b.newPage({ viewport:{width:1920,height:1080} });
  await page.goto(file,{waitUntil:'load'}); await page.waitForTimeout(400);
  await page.evaluate(()=>APP.goId('m1-energy-inf',0));
  await page.waitForTimeout(300);

  for(const theme of ['light','dark']){
    await page.evaluate(t=>{ document.body.dataset.theme=t;
      if(window.PLOT&&PLOT.setTheme) PLOT.setTheme({dark:t==='dark'}); RENDER.draw(); APP.buildSidebar(); },theme);
    await page.waitForTimeout(400);
    const rail = await page.$('#sidebar');
    if(rail) await rail.screenshot({ path: path.join(OUT, `rail-${theme}.png`) });
    await page.screenshot({ path: path.join(OUT, `scene-${theme}.png`) });
  }

  await page.evaluate(()=>{ document.body.dataset.theme='light'; APP.open('map'); APP.buildMap(); });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, 'map.png') });
  await b.close();
})();
