/* ==========================================================================
   web/sitecheck.js — what the published site actually renders.

   `build-site.js` asserts over the text of the files it writes. This opens
   them in a browser and asserts over the pages they produce, which is the
   only place the two questions that matter can be answered: does the
   sanitised artifact still run, and can the removed edition be reached.

   Run it the way the other Playwright gates are run:
       cd build && node pw.js ../web/sitecheck.js
   ========================================================================== */

const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright');
const path = require('path');
const fs = require('fs');

const SITE = path.join(__dirname, '..', 'site');
const url = f => 'file://' + path.join(SITE, f);
const problems = [];
const note = m => console.log('  ' + m);

(async () => {
  const browser = await chromium.launch();

  /* ---------------------------------------------------- the artifact ---- */
  {
    const page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push(String(e)));

    await page.goto(url('Signals_and_Systems.html'));
    await page.waitForTimeout(1200);

    const scenes = await page.evaluate(() => APP.scenes().map(s => ({ id: s.id, steps: s.steps || 0 })));
    note('artifact loaded · ' + scenes.length + ' scenes');
    if (scenes.length < 200) problems.push('only ' + scenes.length + ' scenes loaded');

    /* The control is gone. */
    if (await page.$('#btn-edition')) problems.push('the edition button is still in the toolbar');

    /* The shortcut does nothing. */
    await page.keyboard.press('i');
    await page.waitForTimeout(200);
    const ed = await page.evaluate(() => document.body.getAttribute('data-edition'));
    if (ed === 'instructor') problems.push('pressing I still enters the instructor edition');
    note('after pressing I the edition is ' + ed);

    /* Forcing the flag by hand reveals nothing, because nothing is there. */
    const forced = await page.evaluate(() => {
      document.body.setAttribute('data-edition', 'instructor');
      const vis = [].concat(
        [...document.querySelectorAll('.instr')],
        [...document.querySelectorAll('.instr-inline')]
      ).filter(e => e.textContent.trim().length);
      const out = vis.slice(0, 3).map(e => e.textContent.trim().slice(0, 80));
      document.body.setAttribute('data-edition', 'student');
      return out;
    });
    if (forced.length) problems.push('instructor material is still in the page: ' + forced.join(' | '));

    /* It still walks. Every scene, at its last reveal state. */
    let steps = 0, katex = 0, literal = 0;
    for (const s of scenes) {
      await page.evaluate(([id, st]) => { APP.goId(id, st); }, [s.id, s.steps]);
      await page.waitForTimeout(6);
      const r = await page.evaluate(() => {
        const host = document.getElementById('scene-host');
        const bad = host.querySelectorAll('.katex-error').length;
        const txt = [...host.querySelectorAll('*')]
          .filter(e => !e.closest('.katex'))
          .map(e => [...e.childNodes].filter(n => n.nodeType === 3).map(n => n.nodeValue).join(''))
          .join(' ');
        return { bad, lit: /\$[^$]{1,120}\$/.test(txt) };
      });
      katex += r.bad;
      if (r.lit) literal++;
      steps++;
    }
    note('walked ' + steps + ' scenes · katex errors ' + katex + ' · scenes with literal $...$ ' + literal);
    if (katex) problems.push(katex + ' KaTeX error node(s) in the sanitised artifact');
    if (literal) problems.push(literal + ' scene(s) render mathematics as source text');

    /* The practice questions still carry their solutions, and no question
       carries a teaching note or a source reference. Every module's pager is
       walked from the first question to the last, because it is the opened
       solution that would show a teaching note if one survived. */
    let pages = 0, solutions = 0, teaching = 0, refs = 0;
    for (const m of ['M1','M2','M3','M4','M5','M6','M7']) {
      await page.evaluate(id => { APP.goId(id, 0); }, m.toLowerCase() + '-drill');
      await page.waitForTimeout(120);
      const n = await page.evaluate(mm => CONTENT.DRILL.filter(q => q.module === mm).length, m);
      if (!n) { problems.push('module ' + m + ' has no practice questions'); continue; }
      for (let i = 0; i < n; i++) {
        const b = await page.$('#scene-host .drill [data-sol]');
        if (b) { await b.click(); await page.waitForTimeout(90); }
        else problems.push('question ' + m + ' #' + (i + 1) + ' has no solution button');
        const r = await page.evaluate(() => {
          const h = document.getElementById('scene-host');
          return {
            sol: h.querySelectorAll('.drill .note.ok').length,
            teach: /Teaching note/i.test(h.textContent),
            ref: /·\s*ref\s|\[ref\s/i.test(h.textContent)
          };
        });
        solutions += r.sol; if (r.teach) teaching++; if (r.ref) refs++;
        pages++;
        const nx = await page.$('#scene-host .dr-pager [data-step="1"]:not([disabled])');
        if (!nx) break;
        await nx.click(); await page.waitForTimeout(90);
      }
    }
    note('walked ' + pages + ' questions · solutions shown ' + solutions
         + ' · teaching notes ' + teaching + ' · source refs ' + refs);
    if (pages < 210) problems.push('only ' + pages + ' of 210 questions were reached');
    if (teaching) problems.push(teaching + ' question(s) still show a teaching note');
    if (refs) problems.push(refs + ' question(s) still show a source reference');

    if (errors.length) problems.push(errors.length + ' console error(s): ' + errors[0]);
    note('console errors ' + errors.length);
    await page.close();
  }

  /* --------------------------------------------------------- the cover -- */
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push(String(e)));

    await page.goto(url('index.html'));
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(__dirname, '..', 'shots', 'cover-light.png') });

    await page.screenshot({ path: path.join(__dirname, '..', 'shots', 'cover-full.png'),
                            fullPage: true });

    /* Every link on the cover resolves to a file that was published. */
    const hrefs = await page.evaluate(() =>
      [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')));
    const files = hrefs.filter(h => !/^https?:/.test(h) && !h.startsWith('#') && h !== '/');
    const anchors = hrefs.filter(h => h.startsWith('#'));
    const missing = files.filter(h => !fs.existsSync(path.join(SITE, h)));
    const dangling = [];
    for (const a of anchors)
      if (!(await page.$(a))) dangling.push(a);
    note('cover links ' + files.length + ' files (missing ' + missing.length + '), '
         + anchors.length + ' anchors (dangling ' + dangling.length + ')');
    if (missing.length) problems.push('cover links to files that were not published: ' + missing.join(', '));
    if (dangling.length) problems.push('cover links to sections that do not exist: ' + dangling.join(', '));

    /* Both canvases have to have painted something. A canvas that stayed
       blank is the failure this page can have without erroring. The backdrop
       is a WebGL context and the instrument a 2D one, so each is read the way
       its own context allows — a 2D read of a WebGL canvas returns null and
       would report the blank it was meant to catch. */
    /* The backdrop is WebGL and asks for no preserved drawing buffer, so its
       pixels cannot be read back outside the frame that drew them — a
       readPixels here returns zeros however well it is painting. What is
       checkable is that the context exists, the program linked and is the one
       currently bound, and the viewport has a size: a shader that failed to
       compile leaves no current program, which is the failure this catches. */
    const bg = await page.evaluate(() => {
      const c = document.getElementById('backdrop');
      if (!c) return { ok: false, why: 'no canvas' };
      const gl = c.getContext('webgl') || c.getContext('webgl2');
      if (!gl) return { ok: false, why: 'no webgl context' };
      const prog = gl.getParameter(gl.CURRENT_PROGRAM);
      if (!prog) return { ok: false, why: 'no program bound' };
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
        return { ok: false, why: 'program did not link' };
      const vp = gl.getParameter(gl.VIEWPORT);
      return { ok: vp[2] > 0 && vp[3] > 0, why: 'viewport ' + vp[2] + '×' + vp[3],
               w: c.width, h: c.height };
    });
    note('backdrop shader ' + (bg.ok ? 'live · ' : 'FAILED · ') + bg.why
         + (bg.w ? ' · canvas ' + bg.w + '×' + bg.h : ''));
    if (!bg.ok) problems.push('the backdrop shader is not running: ' + bg.why);

    {
      const ink = await page.evaluate(() => {
        const c = document.getElementById('scope');
        if (!c || !c.width || !c.height) return -1;
        const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
        let lit = 0;
        for (let i = 0; i < d.length; i += 4 * 97)
          if (d[i] > 40 || d[i + 1] > 40 || d[i + 2] > 40) lit++;
        return lit;
      });
      note('canvas #scope lit samples ' + ink);
      if (ink <= 0) problems.push('the #scope canvas drew nothing');
    }

    /* The readout is computed from the same model that draws the trace, so it
       has to move with the sweep and it has to call aliasing when the rate is
       below the Nyquist rate of the 1 kHz cosine. */
    const read = () => page.evaluate(() => ({
      fs: parseFloat(document.getElementById('hud-fs').textContent),
      fr: parseFloat(document.getElementById('hud-fr').textContent),
      aliased: document.getElementById('hud-out').classList.contains('is-aliased')
    }));
    const a = await read();
    await page.waitForTimeout(2200);
    const b = await read();
    note('sampler ' + a.fs.toFixed(2) + ' → ' + b.fs.toFixed(2) + ' kHz · rebuilt '
         + b.fr.toFixed(2) + ' kHz · aliased ' + b.aliased);
    if (a.fs === b.fs) problems.push('the sampling rate did not move');
    for (const s of [a, b]) {
      const shouldAlias = s.fs < 2 - 1e-9;
      if (s.aliased !== shouldAlias)
        problems.push('at fs=' + s.fs + ' kHz the readout says aliased=' + s.aliased);
      if (!shouldAlias && Math.abs(s.fr - 1) > 1e-6)
        problems.push('above the Nyquist rate the rebuilt frequency is ' + s.fr + ' kHz, not 1');
      if (s.fr > s.fs / 2 + 1e-6)
        problems.push('the rebuilt frequency ' + s.fr + ' is above fs/2');
    }

    /* The sweep starts at the bottom of its range, which is below the Nyquist
       rate, so a fresh load is where the aliased branch can be caught. */
    await page.reload();
    await page.waitForTimeout(250);
    const first = await read();
    note('first frame ' + first.fs.toFixed(2) + ' kHz · rebuilt ' + first.fr.toFixed(2)
         + ' kHz · aliased ' + first.aliased);
    if (!first.aliased)
      problems.push('the sweep does not start below the Nyquist rate, so aliasing is never shown');
    if (Math.abs(first.fr - Math.abs(1 - Math.round(1 / first.fs) * first.fs)) > 1e-6)
      problems.push('the rebuilt frequency does not match the folding of 1 kHz at fs='
                    + first.fs + ' kHz');

    if (errors.length) problems.push('cover console error(s): ' + errors[0]);
    note('cover console errors ' + errors.length);
    await page.close();
  }

  /* -------------------------------------------------- the three editions */
  /* The floor is per document, because these are three different lengths:
     80 pages of notes, 83 of questions, and an 11-page reference that is
     mostly typeset mathematics and therefore short in plain characters. */
  const FLOOR = {
    'Lecture_Notes.html': 150000,
    'Student_Workbook.html': 60000,
    'Formula_Reference.html': 12000
  };
  for (const f of Object.keys(FLOOR)) {
    const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(url(f));
    await page.waitForTimeout(1500);
    const r = await page.evaluate(() => ({
      chars: document.body.innerText.length,
      katex: document.querySelectorAll('.katex-error').length,
      teach: /Teaching note|Not for distribution/i.test(document.body.innerText)
    }));
    note(f + ' · ' + r.chars + ' characters · katex errors ' + r.katex + ' · instructor text ' + r.teach);
    if (r.chars < FLOOR[f]) problems.push(f + ' rendered ' + r.chars
      + ' characters, below its floor of ' + FLOOR[f]);
    if (r.katex) problems.push(f + ' has ' + r.katex + ' KaTeX error node(s)');
    if (r.teach) problems.push(f + ' carries instructor material');
    if (errors.length) problems.push(f + ' console error(s): ' + errors[0]);
    await page.close();
  }

  await browser.close();
  console.log('\nPROBLEMS: ' + (problems.length ? '\n  - ' + problems.join('\n  - ') : 'none'));
  process.exit(problems.length ? 1 : 0);
})();
