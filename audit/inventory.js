/* Regenerates audit/scenes.json from the built artifact.

   The file it writes is an instructor-grade inventory: one row per scene and one
   per question, with the fields an auditor reads before opening the artifact —
   what a scene is called, which module and source pages it belongs to, how many
   reveal steps it has, and what it is for. It is a *derived* record. It was left
   behind once already, describing 58 scenes and 36 questions long after the build
   had 220 and 84, which is worse than having no inventory at all.

   It reads the built file rather than the sources, so it cannot drift from the
   artifact: whatever the artifact assembles is what gets written down.

     cd build && node pw.js ../audit/inventory.js                              */
const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const file = 'file://' + path.resolve(__dirname, '..', 'dist', 'Signals_and_Systems.html');
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(file, { waitUntil: 'load' });
  await p.waitForTimeout(500);

  const data = await p.evaluate(() => {
    const S = [].concat(
      window.SCENES_M0 || [], window.SCENES_M1 || [], window.SCENES_M2 || [],
      window.SCENES_M3 || [], window.SCENES_M4 || [], window.SCENES_M5 || [],
      window.SCENES_M6 || [], window.SCENES_M7 || [], window.SCENES_END || []
    );
    return {
      scenes: S.map((s, i) => ({
        i: i + 1, id: s.id, module: s.module, nav: s.nav || '', title: s.title || '',
        src: s.src || '', steps: s.steps || 0, obj: s.objective || ''
      })),
      q: (CONTENT.QBANK || []).map(q => ({
        id: q.id, module: q.module, kind: q.kind, src: q.src || '',
        opts: (q.opts || []).length, hints: (q.hints || []).length,
        hasSol: !!q.sol, hasErr: !!q.err
      }))
    };
  });

  if (errs.length) { console.error('PAGE ERRORS:', errs.slice(0, 3)); process.exit(1); }

  const out = path.resolve(__dirname, 'scenes.json');
  fs.writeFileSync(out, JSON.stringify(data, null, 1) + '\n');
  const byModule = {};
  data.scenes.forEach(s => { byModule[s.module] = (byModule[s.module] || 0) + 1; });
  console.log('scenes.json written:', data.scenes.length, 'scenes,', data.q.length, 'questions');
  console.log('per module:', JSON.stringify(byModule));
  await b.close();
})();
