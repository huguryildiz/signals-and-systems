/* Exhaustive laboratory walk — the check no gate performs.

   mathscan.js only ever sees whatever a laboratory shows first: it does not drive
   [data-nav], [data-case], [data-wave], [data-fac] or a segmented control, so damage
   in the second and later signals, systems, cases or presets of a laboratory is
   invisible to it. This script opens every such item of every laboratory, in both
   themes, moves each slider to the bottom, middle and top of its range, and reads the
   resulting state back out.

   A state fails on any of: a KaTeX error node, mathematics left as literal $...$
   outside a .katex subtree, a TeX macro left in the running text, a readout that has
   gone to NaN / Infinity / undefined, a panel that drew no figure where one belongs,
   or a console or page error logged while the state was open.

   Run it through pw.js like the gates: cd build && node pw.js labwalk.js            */
const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright');
const path = require('path');

/* What each laboratory actually offers, read off the built artifact.
   items:   groups of mutually exclusive selectors, walked as a product
   sliders: data-v keys, each swept to min, middle and max
   figures: false for the one laboratory that draws no figure (D is a property table) */
const PLAN = {
  A: { id:'m1-lab-a', figures:true,
       items:[['[data-seg=proto][data-val=p4]','[data-seg=proto][data-val=tri]','[data-seg=proto][data-val=rect]'],
              ['[data-seg=dom][data-val=ct]','[data-seg=dom][data-val=dt]'],
              ['[data-seg=stage][data-val="0"]','[data-seg=stage][data-val="1"]','[data-seg=stage][data-val="2"]']],
       sliders:['a','b'] },
  B: { id:'m1-lab-b', figures:true, list:6, listClicks:['[data-cls=energy]','[data-reveal]'], sliders:[] },
  C: { id:'m1-lab-c', figures:true,
       items:[['[data-seg=dom][data-val=ct]','[data-seg=dom][data-val=dt]']], sliders:['p','q','th'] },
  D: { id:'m2-lab-d', figures:false, list:8,
       listClicks:['[data-prop=mem]','[data-prop=inv]','[data-prop=caus]','[data-prop=stab]','[data-prop=ti]','[data-prop=lin]'],
       sliders:[] },
  E: { id:'m3-lab-e', figures:true,
       items:[['[data-case=dt1]','[data-case=dt2]','[data-case=ct1]','[data-case=ct2]'],
              ['[data-stage="1"]','[data-stage="2"]','[data-stage="3"]']], sliders:['pos'] },
  F: { id:'m4-lab-f', figures:true,
       items:[['[data-wave=square]','[data-wave=saw]','[data-wave=tri]','[data-wave=imp]','[data-wave=dtsq]']],
       sliders:['N'] },
  G: { id:'m4-lab-g', figures:true,
       items:[['[data-case=ct-lp]','[data-case=ct-hp]','[data-case=dt-hp]','[data-case=dt-lp]'],
              ['[data-fac=on]','[data-fac=off]']], sliders:['par'] },
  H: { id:'m5-lab-h', figures:true,
       items:[['[data-case=rect]','[data-case=exp1]','[data-case=exp2]','[data-case=sinc]',
               '[data-case=gauss]','[data-case=cosine]','[data-case=train]'],
              ['[data-seg=mod][data-val=off]','[data-seg=mod][data-val=on]']], sliders:['par','wc'] },
  I: { id:'m6-lab-i', figures:true, list:7,
       items:[['[data-case=spec]','[data-case=shift]','[data-case=sys]'],
              ['[data-seg=hl][data-val=on]','[data-seg=hl][data-val=off]']], sliders:['par','w0','r'] },
  J: { id:'m7-lab-j', figures:true,
       items:[['[data-case=over]','[data-case=crit]','[data-case=under]',
               '[data-case=zoh]','[data-case=foh]','[data-case=ideal]']], sliders:['fM','fS'] }
};

(async () => {
  const file = 'file://' + path.resolve(__dirname, '..', 'dist', 'Signals_and_Systems.html');
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await p.goto(file, { waitUntil: 'load' });
  await p.waitForTimeout(400);

  const problems = [];
  let states = 0;

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
    await p.waitForTimeout(110);
    return true;
  }
  async function sweep(keys, tag, wantFigure) {
    if (!keys.length) { await probe(tag, wantFigure); return; }
    for (const k of keys) {
      const rng = await p.$eval(`[data-v=${k}]`, e => ({ min: +e.min, max: +e.max })).catch(() => null);
      if (!rng) continue;
      for (const v of [rng.min, (rng.min + rng.max) / 2, rng.max]) {
        await p.$eval(`[data-v=${k}]`, (e, val) => {
          e.value = val; e.dispatchEvent(new Event('input', { bubbles: true }));
        }, v).catch(() => {});
        await p.waitForTimeout(70);
        await probe(`${tag} ${k}=${v}`, wantFigure);
      }
    }
  }
  /* cartesian product of the item groups */
  function combos(groups) {
    return groups.reduce((acc, g) => acc.flatMap(a => g.map(x => a.concat([x]))), [[]]);
  }

  for (const theme of ['light', 'dark']) {
    if (theme === 'dark') { await p.click('#btn-theme'); await p.waitForTimeout(260); }
    const shown = await p.$eval('#btn-theme', e => e.textContent.trim().toLowerCase());
    if (shown !== theme) problems.push(`theme switch did not take: asked ${theme}, button reads ${shown}`);

    for (const [name, plan] of Object.entries(PLAN)) {
      await p.evaluate(i => APP.goId(i, 0), plan.id);
      await p.waitForTimeout(340);

      for (const combo of combos(plan.items || [])) {
        for (const sel of combo) await click(sel);
        await sweep(plan.sliders, `${theme} ${name} ${combo.join(' ')}`.trim(), plan.figures);
      }

      /* an item list traversed with [data-nav], plus whatever each item wants clicked */
      if (plan.list) {
        for (let k = 0; k < plan.list; k++) {
          for (const sel of (plan.listClicks || [])) await click(sel);
          await sweep(plan.sliders, `${theme} ${name} item${k + 1}`, plan.figures);
          if (!await click('[data-nav="1"]')) break;
        }
        if (await click('[data-nav="-1"]')) await probe(`${theme} ${name} back one item`, plan.figures);
      }
    }
  }

  console.log('STATES WALKED: ' + states);
  console.log('PROBLEMS: ' + (problems.length ? '\n  ' + problems.join('\n  ') : 'none'));
  console.log('CONSOLE/PAGE ERRORS: ' + (errs.length ? '\n  ' + errs.slice(0, 20).join('\n  ') : 'none'));
  await b.close();
  process.exit(problems.length || errs.length ? 1 : 0);
})();
