/* Visual + functional QA harness: renders every scene, captures console errors,
   checks for clipping/overflow, and writes screenshots. */
const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');

(async () => {
  const only = process.argv[2] ? process.argv[2].split(',') : null;
  const file = 'file://' + path.resolve(__dirname, '..', 'dist', 'Signals_and_Systems.html');
  const outDir = path.resolve(__dirname, '..', 'shots');
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  await page.goto(file, { waitUntil: 'load' });
  await page.waitForTimeout(500);

  const ids = await page.evaluate(() => (window.__SCENE_IDS || []).length ? window.__SCENE_IDS
    : Array.from({ length: 0 }));
  const scenes = await page.evaluate(() => APP.scenes().map(s => ({ id: s.id, steps: s.steps || 0, title: s.title })));
  const report = [];
  for (const s of scenes) {
    if (only && !only.includes(s.id)) continue;
    const maxStep = s.steps || 0;
    for (const st of [maxStep]) {
      await page.evaluate(([id, step]) => { APP.goId(id, step); }, [s.id, st]);
      await page.waitForTimeout(190);
      const metrics = await page.evaluate(() => {
        const host = document.getElementById('scene-host');
        const inner = host.firstElementChild;
        const sc = host.querySelector('.qb-scroll');
        /* the scene box carries the page margin as padding, so the room the
           inner column actually has is the content box, not clientHeight */
        const cs = getComputedStyle(host);
        const availH = host.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
        const availW = host.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
        const k = host.dataset.fit ? +host.dataset.fit : 1;
        const vy = Math.round(inner.scrollHeight * k - availH);
        const vx = Math.round(inner.scrollWidth * k - availW);
        return { overflow: (!sc && (vy > 2 || vx > 2)), vy: sc?0:vy, vx: sc?0:vx,
                 fit: k, capped: host.dataset.capped ? +host.dataset.capped : 0 };
      });
      report.push({ id: s.id, step: st, ...metrics });
      if (!only) await page.screenshot({ path: path.join(outDir, `${s.id}__s${st}.png`) });
      else await page.screenshot({ path: path.join(outDir, `${s.id}__s${st}.png`) });
    }
  }
  /* A scene held together by a scale factor below 0.90, or one the figure cap had
     to rescue, is carrying more than one page holds. Neither is a layout error —
     nothing is clipped — so neither turns the sweep red; both are named, because a
     scene that needs them is a scene to split. */
  const dense = report.filter(r => r.fit < 0.90 || r.capped)
                      .map(r => [r.id, r.step, r.fit,
                                 r.capped ? `figures cut ${Math.round(r.capped*100)}%` : 'scaled']);
  console.log(JSON.stringify({ sceneCount: scenes.length, errors: errors.slice(0, 25),
    overflow: report.filter(r => r.overflow), dense,
    scaled: report.filter(r=>r.fit<0.999).map(r=>[r.id,r.step,r.fit]) }, null, 1));
  await browser.close();
})();
