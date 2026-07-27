/* DOM sanity sweep: renders every scene at every reveal state and reports any
   element whose tag name is not valid HTML. A stray "<" in authored text (for
   example "$0<t<1$" written inside a label) is parsed as the start of a tag and
   silently swallows the markup that follows it, which destroys the layout
   without raising a console error. This catches that class of defect. */
const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright');
const path = require('path');

const OK = new Set(('html head body div span p a b i em strong sup sub br hr ul ol li dl dt dd '
  + 'h1 h2 h3 h4 h5 h6 figure figcaption img svg g path line circle rect text tspan polyline polygon '
  + 'defs clippath marker button input label select option table thead tbody tr td th kbd code pre '
  /* foreignobject holds every typeset figure label: texName() lays a KaTeX formula out in one so it
     reads in the same type as the running mathematics. Its absence here made this sweep report every
     scene carrying a typeset label as malformed — 151 of them, all correct. */
  + 'foreignobject ellipse use symbol title desc filter fegaussianblur lineargradient stop '
  + 'section header footer nav main article aside form fieldset legend small mark abbr time '
  + 'math semantics mrow mi mn mo msup msub mfrac msqrt mtable mtr mtd mspace mstyle mtext '
  + 'annotation mpadded mover munder munderover msubsup menclose mphantom moperator').split(/\s+/));

(async () => {
  const file = 'file://' + path.resolve(__dirname, '..', 'dist', 'Signals_and_Systems.html');
  const target = process.argv[2] ? 'file://' + path.resolve(process.argv[2]) : file;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(target, { waitUntil: 'load' });
  await page.waitForTimeout(400);
  const scenes = await page.evaluate(() => APP.scenes().map(s => ({ id: s.id, steps: s.steps || 0 })));
  const bad = [];
  for (const s of scenes) {
    for (let st = 0; st <= s.steps; st++) {
      await page.evaluate(([id, step]) => { APP.goId(id, step); }, [s.id, st]);
      await page.waitForTimeout(60);
      const tags = await page.evaluate(() => {
        const host = document.getElementById('scene-host');
        const seen = new Set();
        host.querySelectorAll('*').forEach(e => seen.add(e.tagName.toLowerCase()));
        return [...seen];
      });
      const off = tags.filter(t => !OK.has(t));
      if (off.length) bad.push({ id: s.id, step: st, tags: off });
    }
  }
  console.log(JSON.stringify({ scenes: scenes.length, malformed: bad }, null, 1));
  console.log('MALFORMED SCENES: ' + bad.length);
  await browser.close();
})();
