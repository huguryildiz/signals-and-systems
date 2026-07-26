/* Interaction smoke test: exercise every laboratory control at nominal and
   boundary values and confirm the readouts change and nothing throws. */
const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright');
const path = require('path');
(async () => {
  const file = 'file://' + path.resolve(__dirname, '..', 'dist', 'Signals_and_Systems.html');
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await p.goto(file, { waitUntil: 'load' }); await p.waitForTimeout(400);

  const out = [];
  async function scene(id) { await p.evaluate(i => APP.goId(i, 0), id); await p.waitForTimeout(220); }

  // ---- Lab A : sliders at boundaries + every segmented control
  await scene('m1-lab-a');
  for (const [k, vals] of [['a', [-3, -0.25, 0.25, 1, 3]], ['b', [-6, 0, 6]]]) {
    for (const v of vals) {
      await p.$eval(`[data-v=${k}]`, (el, val) => { el.value = val; el.dispatchEvent(new Event('input', { bubbles: true })); }, v);
      await p.waitForTimeout(60);
      const ro = await p.$eval('.ro', e => e.innerText.replace(/\s+/g, ' '));
      out.push(`A ${k}=${v} :: ${ro.slice(0, 120)}`);
    }
  }
  for (const sel of ['[data-seg=dom][data-val=dt]', '[data-seg=proto][data-val=tri]', '[data-seg=stage][data-val="1"]']) {
    await p.click(sel); await p.waitForTimeout(80);
  }
  out.push('A segmented controls OK, plots=' + await p.$$eval('.plots svg', e => e.length));

  // ---- Lab B : classify every item, reveal, next
  await scene('m1-lab-b');
  for (let i = 0; i < 6; i++) {
    await p.click('[data-cls=energy]'); await p.waitForTimeout(70);
    const v = await p.$eval('.verdict', e => e.innerText.replace(/\s+/g, ' ').slice(0, 70));
    await p.click('[data-reveal]'); await p.waitForTimeout(70);
    const w = await p.$eval('.work', e => e.innerText.length);
    out.push(`B item${i + 1} verdict="${v}" workChars=${w}`);
    await p.click('[data-nav="1"]'); await p.waitForTimeout(90);
  }

  // ---- Lab C : rationality sweep incl. boundaries
  await scene('m1-lab-c');
  for (const [pv, qv] of [[1, 1], [3, 5], [12, 12], [7, 12], [12, 1]]) {
    await p.$eval('[data-v=p]', (el, v) => { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); }, pv);
    await p.$eval('[data-v=q]', (el, v) => { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); }, qv);
    await p.waitForTimeout(70);
    const ro = await p.$eval('.ro', e => e.innerText.replace(/\s+/g, ' '));
    out.push(`C w0=${pv}pi/${qv} :: ${ro}`);
  }
  await p.click('[data-seg=dom][data-val=ct]'); await p.waitForTimeout(90);
  out.push('C CT mode :: ' + await p.$eval('.ro', e => e.innerText.replace(/\s+/g, ' ')));

  // ---- Lab D : every system, open every property
  await scene('m2-lab-d');
  const nSys = await p.evaluate(() => CONTENT.SYSTEMS.length);
  for (let i = 0; i < nSys; i++) {
    const keys = await p.$$eval('[data-prop]', els => els.map(e => e.dataset.prop));
    for (const kk of keys) { await p.click(`[data-prop="${kk}"]`); await p.waitForTimeout(30); }
    await p.waitForTimeout(60);
    const txt = await p.$eval('.plist', e => e.innerText);
    const yes = (txt.match(/YES/g) || []).length, no = (txt.match(/NO/g) || []).length;
    out.push(`D sys${i + 1} verdicts YES=${yes} NO=${no} (expect 6)`);
    await p.click('[data-nav="1"]'); await p.waitForTimeout(90);
  }

  // ---- Lab E : all four cases, slider across the full range
  await scene('m3-lab-e');
  for (const c of ['dt1', 'dt2', 'ct1', 'ct2']) {
    await p.click(`[data-case=${c}]`); await p.waitForTimeout(90);
    const lim = await p.$eval('[data-v=pos]', e => [+e.min, +e.max]);
    for (const v of [lim[0], (lim[0] + lim[1]) / 2, lim[1]]) {
      await p.$eval('[data-v=pos]', (el, val) => { el.value = val; el.dispatchEvent(new Event('input', { bubbles: true })); }, v);
      await p.waitForTimeout(60);
      const ro = await p.$eval('.ro', e => e.innerText.replace(/\s+/g, ' '));
      out.push(`E ${c} pos=${v} :: ${ro}`);
    }
  }

  // ---- quiz engine
  await scene('m1-qbank');
  await p.click('.opt[data-q="Q1-01"][data-k="0"]'); await p.waitForTimeout(120);
  const fb = await p.$$eval('.fb', e => e.length);
  await p.click('[data-hint="Q1-02"]'); await p.waitForTimeout(120);
  const hint = await p.$$eval('.hintbox', e => e.length);
  await p.click('[data-sol="Q1-03"]'); await p.waitForTimeout(150);
  const sol = await p.$$eval('.note.ok', e => e.length);
  out.push(`QUIZ feedback=${fb} hint=${hint} solution=${sol}`);

  // ---- modes, overlays, deep links, reset
  await p.keyboard.press('i'); await p.waitForTimeout(120);
  const instr = await p.evaluate(() => document.body.dataset.edition);
  await p.keyboard.press('r'); await p.waitForTimeout(80);
  const motion = await p.evaluate(() => document.body.dataset.motion);
  await p.keyboard.press('l'); await p.waitForTimeout(80);
  const mode = await p.evaluate(() => document.body.dataset.mode);
  await p.keyboard.press('m'); await p.waitForTimeout(120);
  const mapOpen = await p.$$eval('#ov-map.open', e => e.length);
  await p.keyboard.press('Escape');
  await p.keyboard.press('/'); await p.waitForTimeout(120);
  await p.fill('#searchbox', 'convolution'); await p.waitForTimeout(150);
  const hits = await p.$$eval('#sresults .sres', e => e.length);
  await p.keyboard.press('Escape');
  await p.evaluate(() => { location.hash = '#m3-ex-ct2/3'; });
  await p.waitForTimeout(200);
  const deep = await p.evaluate(() => [APP.state.i, APP.state.step]);
  out.push(`MODES edition=${instr} motion=${motion} mode=${mode} map=${mapOpen} searchHits=${hits} deepLinkStep=${deep[1]}`);

  console.log(out.join('\n'));
  console.log('\nERRORS: ' + (errs.length ? errs.slice(0, 10).join(' | ') : 'none'));
  await b.close();
})();
