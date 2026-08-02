/* ==========================================================================
   web/build-site.js — assemble the public site in `site/`.

   The published site is not the same set of files as the working tree. Three
   of the four documents are gitignored intermediates, so they are built here
   rather than committed; the instructor solutions are built by the same
   command and deliberately left behind; and the artifact is published with
   its instructor edition removed.

   Removed, not hidden. In the artifact the instructor material is separated
   from the student material by CSS alone — `body[data-edition=instructor]`
   reveals it — so anything that reaches the file reaches the reader who
   presses `I`. What this script strips from the published copy is:

     · every `{t:'instr'}` block, which is where presenter notes and the
       production record live;
     · the `src` field of every scene, laboratory item and question, which
       names the source page or the paper question it came from;
     · the `teach` field of every question, which is the teaching note;
     · the edition control itself — the toolbar button, the `I` shortcut,
       the help-screen line and the saved-state path that could restore it.

   Nothing in `build/src` is modified and nothing in `dist/` is overwritten.
   The transforms run over the built artifact in memory, one script module at
   a time, so `30_katex.js` and `60_plot.js` are never touched. Every one of
   them asserts its own hit count: a transform that stops matching stops the
   build instead of quietly publishing the material it was meant to remove.
   ========================================================================== */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT  = path.join(__dirname, '..');
const DIST  = path.join(ROOT, 'dist');
const SITE  = path.join(ROOT, 'site');

const log = m => console.log(m);
const fail = m => { throw new Error('build-site: ' + m); };

/* ---------------------------------------------------------------- 1. build */

function run(cwd, script) {
  log('  · ' + path.relative(ROOT, path.join(cwd, script)));
  execFileSync(process.execPath, [script], { cwd, stdio: ['ignore', 'pipe', 'inherit'] });
}

log('Building the pipeline');
run(path.join(ROOT, 'build'), 'build.js');      /* → dist/Signals_and_Systems.html */
run(path.join(ROOT, 'notes'), 'build.js');      /* → dist/Lecture_Notes.html       */
run(path.join(ROOT, 'notes'), 'editions.js');   /* → the three printed editions    */

/* ------------------------------------------------- 2. scanning primitives */

/* Walks JavaScript from `i`, skipping over string literals, template
   literals and comments, and returns the index just past the construct that
   starts there. Everything below needs this: a scene carries TeX in single
   quotes, and TeX is full of braces and apostrophes that must not be read as
   code. */
function skipAt(s, i) {
  const c = s[i];
  if (c === "'" || c === '"' || c === '`') {
    for (let k = i + 1; k < s.length; k++) {
      if (s[k] === '\\') { k++; continue; }
      if (s[k] === c) return k + 1;
    }
    fail('unterminated string literal at ' + i);
  }
  if (c === '/' && s[i + 1] === '/') {
    const nl = s.indexOf('\n', i);
    return nl === -1 ? s.length : nl + 1;
  }
  if (c === '/' && s[i + 1] === '*') {
    const end = s.indexOf('*/', i + 2);
    return end === -1 ? s.length : end + 2;
  }
  return i + 1;
}

/* The end of the string literal that starts at `i` (which must be a quote). */
function endOfString(s, i) { return skipAt(s, i); }

/* The index just past the `}` that closes the `{` at `i`. */
function endOfObject(s, i) {
  if (s[i] !== '{') fail('expected { at ' + i);
  let depth = 0;
  for (let k = i; k < s.length;) {
    const c = s[k];
    if (c === '{') { depth++; k++; continue; }
    if (c === '}') { depth--; k++; if (depth === 0) return k; continue; }
    k = skipAt(s, k);
  }
  fail('unbalanced object starting at ' + i);
}

/* Eat a trailing comma and the whitespace around it, so removing a field or
   an array element leaves valid JavaScript behind. */
function eatComma(s, end) {
  let k = end;
  while (k < s.length && /\s/.test(s[k])) k++;
  return s[k] === ',' ? k + 1 : end;
}

/* ------------------------------------------------------ 3. the transforms */

/* Remove `name:'...'` wherever it appears as an object field. */
function stripField(code, name) {
  const re = new RegExp('(^|[{,\\s])' + name + ':\\s*', 'g');
  let out = '', last = 0, hits = 0, m;
  while ((m = re.exec(code)) !== null) {
    const lead = m[1];
    const fieldStart = m.index + lead.length;
    const valStart = m.index + m[0].length;
    if (code[valStart] !== "'") fail(name + ' field is not a plain string literal at ' + valStart);
    const end = eatComma(code, endOfString(code, valStart));
    out += code.slice(last, fieldStart);
    last = end;
    hits++;
    re.lastIndex = end;
  }
  out += code.slice(last);
  return { code: out, hits };
}

/* Remove every `{t:'instr', ...}` block object. */
function stripInstrBlocks(code) {
  const re = /\{\s*t:\s*'instr'/g;
  let out = '', last = 0, hits = 0, m;
  while ((m = re.exec(code)) !== null) {
    const end = eatComma(code, endOfObject(code, m.index));
    out += code.slice(last, m.index);
    last = end;
    hits++;
    re.lastIndex = end;
  }
  out += code.slice(last);
  return { code: out, hits };
}

/* A replacement that must happen exactly `n` times or the build stops. */
function replaceExactly(text, find, into, n, what) {
  const parts = text.split(find);
  if (parts.length - 1 !== n)
    fail(what + ': expected ' + n + ' occurrence(s), found ' + (parts.length - 1));
  return parts.join(into);
}

/* ------------------------------------- 4. sanitise the artifact in memory */

log('Removing the instructor edition from the published artifact');

let art = fs.readFileSync(path.join(DIST, 'Signals_and_Systems.html'), 'utf8');

/* `build/build.js` labels every script module it concatenates, so the module
   boundaries survive into the built file. The content transforms are applied
   to the modules that carry authored content and to nothing else — KaTeX and
   the plotting library are left exactly as built. */
const MODULE_RE = /(<script>\n\/\* ==== )([0-9A-Za-z_.]+\.js)( ==== \*\/\n)([\s\S]*?)(\n<\/script>)/g;
const CONTENT_MODULE = /^(7|8|9)[0-9]_/;

let instrBlocks = 0, srcFields = 0, teachFields = 0, seen = 0;

art = art.replace(MODULE_RE, (whole, open, name, mid, body, close) => {
  if (!CONTENT_MODULE.test(name)) return whole;
  seen++;
  let r = stripInstrBlocks(body);  instrBlocks += r.hits;  body = r.code;
  r = stripField(body, 'src');     srcFields   += r.hits;  body = r.code;
  r = stripField(body, 'teach');   teachFields += r.hits;  body = r.code;
  return open + name + mid + body + close;
});

if (seen < 20) fail('found only ' + seen + ' content modules in the built artifact');
if (instrBlocks < 3) fail('found only ' + instrBlocks + ' instructor blocks');
if (srcFields < 600) fail('found only ' + srcFields + ' src fields');
if (teachFields < 200) fail('found only ' + teachFields + ' teaching notes');

/* The edition control. Removing the data is what matters; removing the
   control is what stops a reader from looking for it. */
art = replaceExactly(art,
  `    <button id="btn-edition" data-act="edition" title="Student / instructor (I)">Student</button>\n`,
  '', 1, 'toolbar edition button');

art = replaceExactly(art,
  `['L','Lecture ⇄ self-study'],['I','Student ⇄ instructor edition'],['R','Reduced motion'],`,
  `['L','Lecture ⇄ self-study'],['R','Reduced motion'],`,
  1, 'help-screen shortcut line');

art = replaceExactly(art,
  `        case 'i': case 'I': toggleEdition(); break;\n`,
  '', 1, 'I keyboard shortcut');

/* A reader whose device already holds `edition:'instructor'` from an earlier
   visit would otherwise come back into a mode that no longer has content. */
art = replaceExactly(art,
  `      edition: saved.edition || 'student',`,
  `      edition: 'student',`,
  1, 'saved edition restore');

/* Belt and braces: the renderer for an instructor block now draws nothing,
   so a block that some later edit reintroduces still cannot reach the page. */
art = replaceExactly(art,
  `    instr:   b => \`<div class="instr"><div class="instr-panel">
        <span class="note-h">\${md(b.head||'Instructor note')}</span>\${symLinks(md(b.html))}</div></div>\`,`,
  `    instr:   () => '',`,
  1, 'instructor block renderer');

/* The help scene described two editions. On the published copy there is one,
   so the card says what is actually true of it. */
art = replaceExactly(art,
  `    [{t:'card', head:'Two editions', items:[
      {t:'body', html:\`<p>The <b>student edition</b> hides solutions until you request them. It also hides teaching comments. The <b>instructor edition</b> shows presenter notes, error warnings and every solution.</p>\`}
    ]}],`,
  `    [{t:'card', head:'Worked solutions', items:[
      {t:'body', html:\`<p>Every practice question carries a full worked solution, and it stays hidden until you ask for it. Work the question first, then open the solution and compare the method, not only the answer.</p>\`}
    ]}],`,
  1, 'help scene editions card');

/* The teaching note behind each question is gone with its `teach` field, so
   the branch that would have drawn it is emptied too — otherwise the words
   survive in the renderer and turn up in a source search. */
art = replaceExactly(art,
  '${q.teach?`<div class="instr"><div class="instr-panel"><span class="note-h">Teaching note</span>${md(q.teach)}</div></div>`:\'\'}',
  '', 1, 'question teaching-note renderer');

/* The help scene is findable by keyword; two of its keywords named the mode
   that is no longer there. */
art = replaceExactly(art,
  `keywords:'help navigation modes instructor student reduced motion privacy'`,
  `keywords:'help navigation modes reduced motion privacy'`,
  1, 'help scene keywords');

/* With the button, the shortcut and the saved state gone, the toggle can
   still be reached from a console. It is emptied so the mode cannot be
   entered at all, rather than entered and found empty. */
art = replaceExactly(art,
  `  function toggleEdition(){ state.edition = state.edition==='student'?'instructor':'student'; applyBodyFlags(); persist(); onRender(); }`,
  `  function toggleEdition(){ /* the published copy has one edition */ }`,
  1, 'edition toggle');

/* Nothing that names the removed edition may survive as something a reader
   can see. What is left after the transforms above is code and comments —
   a state field and its comment, a CSS rule and a stylesheet comment, two
   emptied checks — none of which puts a character on the page. Each is
   listed here by its own signature rather than waved through by keyword, so
   a new occurrence anywhere else stops the build. */
const RESIDUE = [
  /kept for the instructor edition \*\//,              /* stylesheet comment      */
  /body\[data-edition=instructor\]/,                   /* rules that select nothing */
  /instructor-only material/,                          /* stylesheet section head */
  /\/\/ 'student' \| 'instructor'/,                    /* state field comment     */
  /the published copy has one edition/,                /* the emptied toggle      */
  /S\.edition==='instructor'/                          /* checks that stay false  */
];
const leaks = [];
const lower = art.toLowerCase();
for (const word of ['instructor', 'presenter note', 'teaching note']) {
  let from = 0, i;
  while ((i = lower.indexOf(word, from)) !== -1) {
    const around = art.slice(Math.max(0, i - 70), i + 70).replace(/\s+/g, ' ');
    if (!RESIDUE.some(r => r.test(around))) leaks.push(around);
    from = i + word.length;
  }
}
if (leaks.length) {
  console.error(leaks.slice(0, 5).join('\n---\n'));
  fail(leaks.length + ' reference(s) to the instructor edition survived');
}

log('  · ' + instrBlocks + ' instructor blocks, ' + srcFields + ' source references, '
    + teachFields + ' teaching notes removed from ' + seen + ' content modules');

/* --------------------------------------------------------- 5. assemble it */

fs.rmSync(SITE, { recursive: true, force: true });
fs.mkdirSync(SITE, { recursive: true });

const copy = (from, to) => {
  fs.copyFileSync(from, path.join(SITE, to));
  log('  · ' + to + '  ' + (fs.statSync(from).size / 1048576).toFixed(2) + ' MB');
};

log('Assembling site/');
fs.writeFileSync(path.join(SITE, 'Signals_and_Systems.html'), art);
log('  · Signals_and_Systems.html  ' + (art.length / 1048576).toFixed(2) + ' MB  (sanitised)');

copy(path.join(DIST, 'Lecture_Notes.html'), 'Lecture_Notes.html');
copy(path.join(DIST, 'Student_Workbook.html'), 'Student_Workbook.html');
copy(path.join(DIST, 'Formula_Reference.html'), 'Formula_Reference.html');

/* Of the four printed editions only the lecture notes are tracked, and only
   they can be published without a Playwright run. */
const notesPdf = path.join(DIST, 'Lecture_Notes.pdf');
if (fs.existsSync(notesPdf)) copy(notesPdf, 'Lecture_Notes.pdf');
else log('  · Lecture_Notes.pdf missing — the cover will link to the HTML edition only');

/* The cover page and the two instruments on it. */
for (const f of ['index.html', 'site.css', 'hero-scope.js', 'sampler.js'])
  copy(path.join(__dirname, f), f);
copy(path.join(ROOT, 'assets', 'icon.svg'), 'icon.svg');

/* ------------------------------------------------------------ 6. last look */

const published = fs.readdirSync(SITE).sort();
const forbidden = published.filter(f => /instructor/i.test(f));
if (forbidden.length) fail('instructor material reached the site: ' + forbidden.join(', '));

const workbook = fs.readFileSync(path.join(SITE, 'Student_Workbook.html'), 'utf8');
if (/Teaching note|Not for distribution/i.test(workbook))
  fail('the student workbook carries instructor material');

log('site/ holds ' + published.length + ' files: ' + published.join(', '));
