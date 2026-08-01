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

  // ---- every laboratory in the build, found rather than listed
  /* The assertions above name five scenes. A laboratory authored after they
     were written is invisible to them, and the run stays green without having
     opened it. This sweep takes the laboratories from the scene list itself:
     every scene holding a `lab` block is opened, and whatever controls it
     presents are driven. It is the floor the named assertions sit on. */
  const CTRL = ['case', 'stage', 'nav', 'opt', 'wave', 'fac', 'cls', 'reveal', 'prop', 'seg'];

  async function sliderSweep(sel) {
    /* Each control is re-read before it is used: a laboratory redraws itself on
       every change, so a handle taken before the click is already detached. */
    const sl = await p.$$eval(sel + ' input[type=range]',
      els => els.map(e => ({ v: e.dataset.v, min: +e.min, max: +e.max })));
    for (const s of sl) {
      for (const val of [s.min, (s.min + s.max) / 2, s.max]) {
        const ok = await p.$eval(`${sel} [data-v="${s.v}"]`,
          (el, x) => { el.value = x; el.dispatchEvent(new Event('input', { bubbles: true })); return true; }, val)
          .catch(() => false);
        if (!ok) { errs.push(`LABSWEEP slider ${s.v} of ${sel} vanished mid-sweep`); break; }
        await p.waitForTimeout(35);
      }
    }
    return sl.length;
  }

  const found = await p.evaluate(() => APP.scenes()
    .map(s => ({ scene: s.id, labs: (s.blocks || []).filter(b => b.t === 'lab').map(b => b.id) }))
    .filter(o => o.labs.length)
    .map(o => ({ scene: o.scene, lab: o.labs[0] })));
  if (!found.length) errs.push('LABSWEEP no scene carries a lab block');

  for (const L of found) {
    const sel = `[data-lab="${L.lab}"]`;
    /* A laboratory that throws while mounting takes the render down with it.
       That is recorded and the sweep moves on, so one broken laboratory does
       not hide the state of the others. */
    const opened = await scene(L.scene).then(() => true)
      .catch(e => { errs.push(`LABSWEEP ${L.lab}: mount threw — ${String(e.message).split('\n')[0]}`); return false; });
    if (!opened) continue;
    const present = await p.$$eval(sel, e => e.length);
    if (!present) { errs.push(`LABSWEEP ${L.lab}: no [data-lab] element in ${L.scene}`); continue; }
    const missing = await p.$eval(sel, e => e.innerText.includes('Laboratory not available'));
    if (missing) { errs.push(`LABSWEEP ${L.lab}: not registered in LABS, scene ${L.scene}`); continue; }

    let nSlider = await sliderSweep(sel);
    const handles = await p.evaluate(([s, attrs]) => {
      const root = document.querySelector(s); const list = [];
      for (const a of attrs) root.querySelectorAll(`[data-${a}]`).forEach(el => {
        let q = `${s} [data-${a}="${el.dataset[a]}"]`;
        if (a === 'seg' && el.dataset.val != null) q += `[data-val="${el.dataset.val}"]`;
        if (!list.includes(q)) list.push(q);
      });
      return list;
    }, [sel, CTRL]);

    let clicked = 0, gone = 0;
    for (const q of handles) {
      const h = await p.$(q);
      if (!h) { gone++; continue; }                       // removed by an earlier click
      const hit = await h.click({ timeout: 1500 }).then(() => true).catch(() => false);
      if (!hit) { gone++; continue; }
      clicked++;
      await p.waitForTimeout(45);
      nSlider = Math.max(nSlider, await sliderSweep(sel));  // ranges change with the case
    }

    const svg = await p.$$eval(sel + ' svg', e => e.length);
    const chars = await p.$eval(sel, e => e.innerText.replace(/\s+/g, ' ').length);
    if (!svg) errs.push(`LABSWEEP ${L.lab}: draws no figure`);
    if (chars < 80) errs.push(`LABSWEEP ${L.lab}: mounted almost empty (${chars} chars)`);
    out.push(`LAB ${L.lab} (${L.scene}) sliders=${nSlider} controls=${clicked}/${handles.length}`
      + (gone ? ` detached=${gone}` : '') + ` svg=${svg} chars=${chars}`);
  }
  out.push('LABORATORIES SWEPT: ' + found.map(o => o.lab).join(' '));

  // ---- exam drills: every question is open-ended and one question is on screen
  //      at a time, so what there is to drive is the pager and the reveal of the
  //      worked solution. Every question of every module is opened, because a
  //      question left unpaged is a question no gate has ever rendered.
  let dpages = 0, dsol = 0, dparts = 0, dopts = 0;
  for (const m of ['M1','M2','M3','M4','M5','M6','M7']) {
    await scene(m.toLowerCase() + '-drill');
    const n = await p.evaluate(mm => CONTENT.DRILL.filter(q => q.module === mm).length, m);
    if (!n) { errs.push(`DRILL ${m}: no questions`); continue; }
    for (let i = 0; i < n; i++) {
      const shown = await p.$$eval('#scene-host .dr-page .drill', e => e.length);
      if (shown !== 1) errs.push(`DRILL ${m} q${i + 1}: ${shown} questions on screen, expected 1`);
      const b = await p.$('#scene-host .drill [data-sol]');
      if (!b) { errs.push(`DRILL ${m} q${i + 1}: no solution button`); }
      else {
        await b.click(); await p.waitForTimeout(120);
        dsol += await p.$$eval('#scene-host .drill .note.ok', e => e.length);
      }
      dparts += await p.$$eval('#scene-host .drill .dr-parts li', e => e.length);
      dopts += await p.$$eval('#scene-host .opt', e => e.length);
      dpages++;
      const nx = await p.$('#scene-host .dr-pager [data-step="1"]:not([disabled])');
      if (!nx) { if (i !== n - 1) errs.push(`DRILL ${m}: pager stopped at ${i + 1} of ${n}`); break; }
      await nx.click(); await p.waitForTimeout(120);
    }
  }
  out.push(`DRILL pages=${dpages} solutions=${dsol} parts=${dparts} options=${dopts}`);
  if (dopts !== 0) errs.push(`DRILL: ${dopts} answer options rendered — every question is open-ended`);

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
