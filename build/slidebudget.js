/* Slide budget — DESIGN.md, Layout › A slide › "Figure and card budget".

   A teaching slide (a scene with slide:true) carries exactly one figure ({t:'fig'})
   and two to four tabbed cards: every {t:'note'} and every {t:'eq'} with a label.
   The check reads the scene list off the built artifact once and counts blocks;
   it does not navigate or render.

   Outside the budget: navy scenes (dark:true, module openings and synthesis),
   scenes holding a laboratory, and any scene that states its reason in a
   `budget:'...'` field.

   By default the report is advisory and exits 0. Pass --strict to exit 1 on any
   violation, once the existing slides have been brought within the budget.

     cd build && node pw.js slidebudget.js
     cd build && node pw.js slidebudget.js --strict                              */
const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright');
const path = require('path');

const STRICT = process.argv.includes('--strict');

(async () => {
  const file = 'file://' + path.resolve(__dirname, '..', 'dist', 'Signals_and_Systems.html');
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto(file, { waitUntil: 'load' });

  const rows = await p.evaluate(() => {
    const S = [].concat(
      window.SCENES_M0 || [], window.SCENES_M1 || [], window.SCENES_M2 || [],
      window.SCENES_M3 || [], window.SCENES_M4 || [], window.SCENES_M5 || [],
      window.SCENES_M6 || [], window.SCENES_M7 || [], window.SCENES_END || []
    );
    return S.filter(s => s && s.slide).map(s => {
      const n = { fig: 0, note: 0, lab: 0, card: 0 };
      const walk = list => (list || []).forEach(x => {
        if (Array.isArray(x)) return walk(x);
        if (!x || typeof x !== 'object') return;
        if (x.t in n) n[x.t]++;
        if (x.t === 'note' || (x.t === 'eq' && x.label)) n.card++;
        ['left', 'right', 'items', 'blocks'].forEach(k => { if (Array.isArray(x[k])) walk(x[k]); });
      });
      walk(s.blocks);
      return { id: s.id, dark: !!s.dark, budget: s.budget || '', ...n };
    });
  });
  await b.close();

  let checked = 0, exempt = 0;
  const bad = [];
  for (const r of rows) {
    if (r.dark || r.lab || r.budget) { exempt++; continue; }
    checked++;
    const why = [];
    if (r.fig !== 1) why.push(`figures=${r.fig}`);
    if (r.card < 2 || r.card > 4) why.push(`cards=${r.card}`);
    if (why.length) bad.push(`${r.id}: ${why.join(' ')}`);
  }
  bad.forEach(l => console.log('  ' + l));
  console.log(`SLIDES CHECKED: ${checked}  EXEMPT: ${exempt}  OUTSIDE BUDGET: ${bad.length}` +
    (STRICT ? '' : '  (advisory)'));
  process.exit(STRICT && bad.length ? 1 : 0);
})();
