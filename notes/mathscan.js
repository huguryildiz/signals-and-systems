/* Lecture notes — mathematics gate.
   The counterpart of build/mathscan.js, for the other half of the pipeline.

   It reports the one class of damage every other check is blind to: mathematics
   that reaches the page as source instead of as type. A block renderer passes
   most of its text through md(), which turns $...$ into KaTeX; a field that the
   renderer interpolates raw prints the dollar signs. Nothing else notices. The
   layout is intact, the numbers are right, the wording is right, and the page
   reads `Rectangular wave, $T_0=4T_1$`.

   Three findings, all failures:
     · a formula KaTeX could not parse            (.katex-error, console error)
     · mathematics left as literal $...$          (a raw field)
     · a TeX macro or an HTML entity left in text (a lost backslash, a bad escape)

   Run it through build/pw.js, as the other Playwright gates are run:
       cd build && node pw.js ../notes/mathscan.js                              */
const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright');
const path = require('path');

(async () => {
  const file = 'file://' + path.resolve(__dirname, '..', 'dist', 'Lecture_Notes.html');
  const b = await chromium.launch();
  const page = await b.newPage({ viewport:{width:1200,height:1600} });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if(m.type()==='error') errs.push('CONSOLE: ' + m.text()); });
  await page.goto(file, {waitUntil:'load'});
  await page.waitForTimeout(800);

  const r = await page.evaluate(() => {
    const doc = document.getElementById('doc');
    const out = { pages:doc.querySelectorAll('.page').length, katexErr:[], raw:[] };
    doc.querySelectorAll('.katex-error').forEach(e =>
      out.katexErr.push(e.textContent.slice(0,90)));

    /* Walk the text of the page and ignore whatever KaTeX itself laid out: a
       typeset formula carries its own source in an <annotation>, and reading
       that back would report every equation on the page as raw. */
    const w = document.createTreeWalker(doc, NodeFilter.SHOW_TEXT);
    let n;
    while((n = w.nextNode())){
      const host = n.parentElement;
      if(!host || host.closest('.katex')) continue;
      const t = n.nodeValue;
      const hit = t.match(/\$[^$\n]{1,90}\$|\\[a-zA-Z]{2,}|&lt;|&amp;/);
      if(!hit) continue;
      /* name the block the text sits in, so the report points at a field */
      let el = host, where = host.tagName.toLowerCase();
      while(el && el !== doc){
        if(el.className && typeof el.className === 'string' && el.className.trim()){
          where = el.className.trim().split(/\s+/)[0] + ' > ' + where; break;
        }
        el = el.parentElement;
      }
      out.raw.push(where + '  ::  ' + t.trim().slice(0,90));
    }
    return out;
  });

  const rawU = [...new Set(r.raw)];
  rawU.forEach(x => console.log('RAW: ' + x));
  r.katexErr.forEach(x => console.log('KATEX-ERR: ' + x));
  errs.forEach(x => console.log(x));

  console.log(`\nPAGES: ${r.pages}`);
  console.log(`LITERAL MATH IN NOTES: ${rawU.length}`);
  console.log(`KATEX ERRORS: ${r.katexErr.length + errs.length}`);
  await b.close();
  process.exitCode = (rawU.length || r.katexErr.length || errs.length) ? 1 : 0;
})();
