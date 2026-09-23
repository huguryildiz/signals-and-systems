/* Laboratory walk — the check no other gate performs.

   The default invocation is exhaustive. For the local edit loop, pass --smoke:
   it keeps both themes but samples the first control combination, the midpoint
   of each slider and the first item in each pager. Pass --labs=B,F to run the
   exhaustive walk only for selected laboratories. Neither option changes the
   default release gate.

   mathscan.js only ever sees whatever a laboratory shows first: it does not drive
   [data-nav], [data-case], [data-wave], [data-fac] or a segmented control, so damage
   in the second and later signals, systems, cases or presets of a laboratory is
   invisible to it. This script opens every such item of every laboratory, in both
   themes, moves each slider to the bottom, middle and top of its range, and reads
   the resulting state back out.

   A state fails on any of: a KaTeX error node, mathematics left as literal $...$
   outside a .katex subtree, a TeX macro left in the running text, a readout that has
   gone to NaN / Infinity / undefined, a panel that drew no figure where one belongs,
   or a console or page error logged while the state was open.

   **Nothing about the laboratories is written down here.** The list of laboratories
   comes from the scene list, and each one's controls are read off its own rendered
   DOM: the item selectors, the segmented controls, the item list and the sliders.
   An earlier version carried a hand-written table of all four, which meant a
   laboratory that gained a control the table did not name was walked without it and
   nothing said so. Discovery removes that failure mode; the cost is that a control
   using an attribute this file does not know about is still invisible, so ATTRS is
   the one thing to extend when the design system gains a new kind of control.

   Run it through pw.js like the gates:
     cd build && node pw.js labwalk.js
     cd build && node pw.js labwalk.js --smoke
     cd build && node pw.js labwalk.js --labs=B,F                              */
const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright');
const path = require('path');

/* Attributes that select one item out of a mutually exclusive set. Each distinct
   attribute becomes one dimension of the walk; each of its values, one position. */
const ATTRS = ['data-case', 'data-wave', 'data-fac', 'data-cls', 'data-prop', 'data-stage'];
const MAX_COMBOS = 60;      /* per laboratory; a breach is reported, never silent */
const ARGS = process.argv.slice(2);
const SMOKE = ARGS.includes('--smoke');
const LABS_ARG = ARGS.find(a => a.startsWith('--labs='));
const REQUESTED_LABS = LABS_ARG
  ? new Set(LABS_ARG.slice('--labs='.length).split(',').map(x => x.trim().toUpperCase()).filter(Boolean))
  : null;
const WAIT = SMOKE
  ? { startup: 250, theme: 140, scene: 180, control: 55, slider: 35 }
  : { startup: 400, theme: 260, scene: 340, control: 110, slider: 70 };

(async () => {
  const file = 'file://' + path.resolve(__dirname, '..', 'dist', 'Signals_and_Systems.html');
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await p.goto(file, { waitUntil: 'load' });
  await p.waitForTimeout(WAIT.startup);

  const problems = [];
  const notes = [];
  let states = 0;

  /* ---- which scenes carry a laboratory, read off the scene list ---- */
  const LABS = await p.evaluate(() => {
    const S = [].concat(
      window.SCENES_M0 || [], window.SCENES_M1 || [], window.SCENES_M2 || [],
      window.SCENES_M3 || [], window.SCENES_M4 || [], window.SCENES_M5 || [],
      window.SCENES_M6 || [], window.SCENES_M7 || [], window.SCENES_END || []
    );
    const found = [];
    const walk = (blocks, sceneId) => (blocks || []).forEach(bl => {
      if (!bl || typeof bl !== 'object') return;
      if (bl.t === 'lab') found.push({ lab: bl.id, scene: sceneId });
      ['left', 'right', 'items', 'blocks'].forEach(k => {
        if (Array.isArray(bl[k])) bl[k].forEach(x => Array.isArray(x) ? walk(x, sceneId) : walk([x], sceneId));
      });
    });
    S.forEach(s => walk(s.blocks, s.id));
    return found;
  });
  if (!LABS.length) { console.log('NO LABORATORIES FOUND'); process.exit(1); }
  const availableLabs = new Set(LABS.map(x => x.lab.toUpperCase()));
  if (REQUESTED_LABS) {
    for (const requested of REQUESTED_LABS) {
      if (!availableLabs.has(requested)) problems.push(`unknown laboratory in --labs: ${requested}`);
    }
  }
  const WALK_LABS = REQUESTED_LABS
    ? LABS.filter(x => REQUESTED_LABS.has(x.lab.toUpperCase()))
    : LABS;
  if (!WALK_LABS.length) problems.push('no laboratories selected');

  /* ---- read one laboratory's controls off its own rendered DOM ---- */
  async function discover() {
    return p.evaluate(a => {
      const lab = document.querySelector('.lab');
      if (!lab) return null;
      const groups = [];
      a.forEach(attr => {
        const vals = [...new Set([...lab.querySelectorAll('[' + attr + ']')]
          .map(e => e.getAttribute(attr)))];
        if (vals.length) groups.push(vals.map(v => `[${attr}="${v}"]`));
      });
      /* a segmented control is one dimension per seg name */
      const segs = [...new Set([...lab.querySelectorAll('[data-seg]')].map(e => e.getAttribute('data-seg')))];
      segs.forEach(sg => {
        const vals = [...new Set([...lab.querySelectorAll(`[data-seg="${sg}"][data-val]`)]
          .map(e => e.getAttribute('data-val')))];
        if (vals.length) groups.push(vals.map(v => `[data-seg="${sg}"][data-val="${v}"]`));
      });
      return {
        groups,
        sliders: [...new Set([...lab.querySelectorAll('[data-v]')].map(e => e.getAttribute('data-v')))],
        hasNav: !!lab.querySelector('[data-nav]'),
        hasReveal: !!lab.querySelector('[data-reveal]'),
        figures: lab.querySelectorAll('svg').length > 0
      };
    }, ATTRS);
  }

  async function probe(tag, wantFigure) {
    states++;
    const r = await p.evaluate(() => {
      const lab = document.querySelector('.lab');
      if (!lab) return { noLab: true };
      const texts = [];
      const walk = document.createTreeWalker(lab, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = walk.nextNode())) {
        if (n.parentElement && n.parentElement.closest('.katex')) continue;
        const t = n.nodeValue.trim();
        if (t) texts.push(t);
      }
      const joined = texts.join('  ');
      return {
        katexErrors: lab.querySelectorAll('.katex-error').length,
        literalMath: (joined.match(/\$[^$]{1,120}\$/g) || []).slice(0, 3),
        rawMacro: (joined.match(/\\[a-zA-Z]{2,}/g) || []).slice(0, 3),
        badNum: (joined.match(/\b(NaN|Infinity|-Infinity|undefined)\b/g) || []).slice(0, 3),
        svgs: lab.querySelectorAll('svg').length,
        chars: joined.length
      };
    });
    if (r.noLab) { problems.push(`${tag}: no laboratory element on the page`); return; }
    if (r.katexErrors) problems.push(`${tag}: ${r.katexErrors} KaTeX error node(s)`);
    if (r.literalMath.length) problems.push(`${tag}: literal math ${JSON.stringify(r.literalMath)}`);
    if (r.rawMacro.length) problems.push(`${tag}: raw TeX macro ${JSON.stringify(r.rawMacro)}`);
    if (r.badNum.length) problems.push(`${tag}: bad readout ${JSON.stringify(r.badNum)}`);
    if (wantFigure && !r.svgs) problems.push(`${tag}: no figure drawn`);
    if (r.chars < 40) problems.push(`${tag}: laboratory rendered almost no text (${r.chars} chars)`);
  }

  async function click(sel) {
    const h = await p.$(sel);          // re-query every time: a redraw detaches handles
    if (!h) return false;
    await h.click().catch(() => {});
    await p.waitForTimeout(WAIT.control);
    return true;
  }
  async function sweep(keys, tag, wantFigure) {
    if (!keys.length) { await probe(tag, wantFigure); return; }
    for (const k of keys) {
      const rng = await p.$eval(`[data-v="${k}"]`, e => ({ min: +e.min, max: +e.max })).catch(() => null);
      if (!rng) continue;
      const values = SMOKE
        ? [(rng.min + rng.max) / 2]
        : [rng.min, (rng.min + rng.max) / 2, rng.max];
      for (const v of values) {
        await p.$eval(`[data-v="${k}"]`, (e, val) => {
          e.value = val; e.dispatchEvent(new Event('input', { bubbles: true }));
        }, v).catch(() => {});
        await p.waitForTimeout(WAIT.slider);
        await probe(`${tag} ${k}=${v}`, wantFigure);
      }
    }
  }
  const combos = gs => gs.reduce((acc, g) => acc.flatMap(a => g.map(x => a.concat([x]))), [[]]);

  for (const theme of ['light', 'dark']) {
    if (theme === 'dark') { await p.click('#btn-theme'); await p.waitForTimeout(WAIT.theme); }
    const shown = await p.$eval('#btn-theme', e => e.dataset.state);
    if (shown !== theme) problems.push(`theme switch did not take: asked ${theme}, button reads ${shown}`);

    for (const { lab, scene } of WALK_LABS) {
      await p.evaluate(i => APP.goId(i, 0), scene);
      await p.waitForTimeout(WAIT.scene);
      const d = await discover();
      if (!d) { problems.push(`${theme} ${lab}: laboratory did not mount in scene ${scene}`); continue; }
      if (theme === 'light') {
        notes.push(`LAB ${lab} (${scene}) groups=${d.groups.length}` +
          ` items=${d.groups.map(g => g.length).join('x') || '-'}` +
          ` sliders=${d.sliders.join(',') || '-'} nav=${d.hasNav ? 'yes' : 'no'}` +
          ` figures=${d.figures ? 'yes' : 'no'}`);
      }

      const cs = combos(d.groups);
      if (cs.length > MAX_COMBOS) {
        problems.push(`${theme} ${lab}: ${cs.length} control combinations exceeds the cap of ${MAX_COMBOS}` +
          ` — raise MAX_COMBOS deliberately rather than walking a subset`);
      }
      const comboLimit = SMOKE ? 1 : MAX_COMBOS;
      for (const combo of cs.slice(0, comboLimit)) {
        for (const sel of combo) await click(sel);
        if (d.hasReveal) await click('[data-reveal]');
        await sweep(d.sliders, `${theme} ${lab} ${combo.join(' ')}`.trim(), d.figures);
      }

      /* an item list traversed with [data-nav] */
      if (d.hasNav && !SMOKE) {
        for (let k = 0; k < 12; k++) {
          if (d.hasReveal) await click('[data-reveal]');
          await sweep(d.sliders, `${theme} ${lab} item${k + 1}`, d.figures);
          if (!await click('[data-nav="1"]')) break;
        }
        if (await click('[data-nav="-1"]')) await probe(`${theme} ${lab} back one item`, d.figures);
      }
    }
  }

  console.log('MODE: ' + (SMOKE ? 'smoke' : REQUESTED_LABS ? 'targeted' : 'full'));
  notes.forEach(n => console.log(n));
  console.log('LABORATORIES WALKED: ' + WALK_LABS.map(l => l.lab).join(' '));
  console.log('STATES WALKED: ' + states);
  console.log('PROBLEMS: ' + (problems.length ? '\n  ' + problems.join('\n  ') : 'none'));
  console.log('CONSOLE/PAGE ERRORS: ' + (errs.length ? '\n  ' + errs.slice(0, 20).join('\n  ') : 'none'));
  await b.close();
  process.exit(problems.length || errs.length ? 1 : 0);
})();
