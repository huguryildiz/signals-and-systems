/* Builds the three document editions that sit beside the lecture notes.

   All three are generated from the content the artifact already carries — the
   exam drills, the glossary and the conventions manifest — so a question id
   means the same thing in every edition, and nothing here is a second copy of
   anything that would have to be kept in step by hand.

     Student_Workbook.html    every question, no answers and no solutions
     Instructor_Solutions.html every question with its full solution, plus provenance
     Formula_Reference.html   the conventions, the summary of formulas, the glossary
     PDF_VERSIONS.md          the version history of the PDFs, as a table

   The renderer, the stylesheet and the KaTeX build are the ones the lecture notes
   use, so the four documents are one typographic family.

     cd notes && node editions.js     ->  ../dist/*.html
     cd build && node pw.js ../notes/topdf.js   renders every one of them to PDF   */
const fs = require('fs'), path = require('path');
const S = p => fs.readFileSync(path.join(__dirname, p), 'utf8');
const B = path.join(__dirname, '..', 'build', 'src');
const R = p => fs.readFileSync(path.join(B, p), 'utf8');
const g = s => s.replace(/<\/script>/gi, '<\\/script>');

/* the exam drills and the glossary, loaded the way the artifact loads them */
const DRILL_FILES = fs.readdirSync(B).filter(f => /^9[2-8]_drill_m\d\.js$/.test(f)).sort();

const doc = (title, builder, extra = '') => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="author" content="Hüseyin Uğur Yıldız"><meta name="license" content="Course content: CC BY-NC-SA 4.0; software: MIT License">
<title>${title}</title>
<style>${R('20_katex.css')}</style>
<style>${S('src/notes.css')}</style>
<style>
.qcard{ break-inside:avoid; margin:0 0 13pt; }
.qcard .qh{ font-family:var(--mono); font-size:8.2pt; letter-spacing:.16em; text-transform:uppercase;
  color:var(--slate); margin-bottom:3pt; }
/* The frame must not rewrite the mathematics a type name carries: uppercase
   would turn a_k into A_K and the tracking would pull an expression apart
   glyph by glyph. Both are reset inside the typeset subtree. */
.qcard .qh .katex{ text-transform:none; letter-spacing:normal; font-size:1.05em; }
.qcard .opts{ margin:5pt 0 0 0; padding:0; list-style:none; }
.qcard .opts li{ margin:2.5pt 0 2.5pt 14pt; text-indent:-14pt; }
.qcard .opts li b{ font-family:var(--mono); font-size:8.6pt; color:var(--slate); }
.qcard .key{ border-left:2px solid var(--accent); padding-left:8pt; margin-top:6pt; }
.qcard .why{ margin-top:4pt; }
.workspace{ border:1px dashed var(--rule2); height:58pt; margin-top:6pt; border-radius:2px; }
/* The worked solution as information cards, the print form of the artifact's
   slide card: a tinted panel with a coloured left edge and a filled tab. */
.qcard.sol{ break-inside:auto; }
.qcard.sol > .qh, .qcard.sol > p, .qcard.sol > .opts{ break-after:avoid; }
.sblk{ --c:var(--slate); margin:8pt 0 0; break-inside:avoid; }
.sblk.ok{ --c:var(--out); } .sblk.warn{ --c:#8A5E12; } .sblk.err{ --c:var(--err); }
.sblk > .tab{ display:inline-block; padding:1.6pt 7pt 1.4pt; background:var(--c); color:#fff;
  border-radius:2px 2px 0 0; font-family:var(--mono); font-size:7.4pt; font-weight:600;
  letter-spacing:.12em; text-transform:uppercase; white-space:nowrap; line-height:1.35; }
.sblk > .tab .katex{ text-transform:none; letter-spacing:normal; }
.scard{ padding:7pt 10pt 6pt; border:0.6pt solid var(--rule2); border-left:2.2pt solid var(--c);
  border-radius:0 2px 2px 2px; background:color-mix(in srgb, var(--c) 4%, #fff); }
.sblk.err .scard{ background:color-mix(in srgb, var(--err) 7%, #fff); }
.scard .nsep{ height:0; border-top:0.6pt solid var(--rule2); margin:5pt 0 4pt; }
.scard .fig, .scard figure{ margin-bottom:0; }
</style></head><body><div id="doc"></div>
<script>${g(R('30_katex.js'))}</script>
<script>${g(R('60_plot.js'))}</script>
<script>${g(S('src/render.js'))}</script>
<script>${g(R('80_content_core.js'))}</script>
${DRILL_FILES.map(f => `<script>${g(R(f))}</script>`).join('\n')}
${extra}
<script>${builder}</script>
</body></html>`;

const MODULE_TITLE = `const MT = Object.fromEntries(CONTENT.MODULES.map(m=>[m.id,m.title]));`;
const GROUP = `const BY = {};
  CONTENT.DRILL.forEach(q=>{ (BY[q.module] = BY[q.module] || []).push(q); });
  const MODS = CONTENT.MODULES.map(m=>m.id).filter(id=>BY[id]);`;

/* ---------------------------------------------------------------- workbook */
const workbook = `
${MODULE_TITLE}${GROUP}
const B = [
 {t:'cover', kicker:'Signals and Systems', text:'Signals, Systems and<br>Frequency-Domain Analysis', sub:'Student Workbook', foot:CONTENT.DRILL.length + ' questions &middot; Modules 1&ndash;7'},
 {t:'page'},
 {t:'h1', text:'Contents', rule:false},
 {t:'p', lead:true, text:'Every question in the course, with no answer and no solution. Work each one on the page, then check it against the artifact or against the instructor edition.'},
 {t:'toc', items: MODS.map(id=>[id.replace('M',''), MT[id], BY[id].length + ' questions'])},
 {t:'h3', text:'How to use it'},
 {t:'p', text:'The questions are in the order the course meets them, and each has a stable question number. Only the statement and its lettered parts are printed; the reasoning stays for you to supply. The question numbers are shared with every other edition, so D5-04 is the same question in the artifact, in this workbook and in the instructor solutions.'},
 {t:'page'}
];
MODS.forEach((id,i)=>{
  B.push({t:'h1', num:'MODULE ' + id.replace('M',''), text: MT[id]});
  B.push({t:'p', lead:true, text:BY[id].length + ' questions on ' + MT[id].toLowerCase() + '. Write your reasoning in the space under each one.'});
  BY[id].forEach(q=>{
    B.push({t:'raw', html:'<div class="qcard"><div class="qh">' + q.id + '</div>'});
    B.push({t:'p', text:q.stem});
    if(q.figure) B.push({t:'fig', svg:q.figure});
    B.push({t:'raw', html:'<ul class="opts">' + (q.parts||[]).map((o,k)=>
      '<li><b>' + 'abcde'[k] + ')</b>&nbsp; ' + renderInline(o) + '</li>').join('') + '</ul>'});
    B.push({t:'raw', html:'<div class="workspace"></div></div>'});
  });
  if(i < MODS.length-1) B.push({t:'page'});
});
B.push({t:'colophon', doc:'Student Workbook'});
renderNotes(B, document.getElementById('doc'));`;

/* The worked solution is one string of <b>Head.</b> sections (R7). It is
   printed as cards, as the artifact draws it: Given with Find under a hairline,
   Method, one green card per solved part, Check, and the common error. */
function solParts(sol){
  const parts = [];
  sol.split(/(?:<br>)?<b>(Given|Find|Method|Solution(?: — [^<]*)?|Check|Contrast with discrete time)\.<\/b>\s*/)
    .forEach((s,i,a)=>{ if(i%2) parts.push({head:s, html:a[i+1].replace(/(<br>\s*)+$/,'')}); });
  return parts;
}

/* ------------------------------------------------------ instructor solutions */
const solutions = `
${solParts.toString()}
const card = (kind, head, html) => '<div class="sblk ' + kind + '"><span class="tab">' + renderInline(head) + '</span><div class="scard">' + renderInline(html);
${MODULE_TITLE}${GROUP}
const B = [
 {t:'cover', kicker:'Signals and Systems', text:'Signals, Systems and<br>Frequency-Domain Analysis', sub:'Instructor Solutions', foot:'Instructor edition'},
 {t:'page'},
 {t:'h1', text:'Contents', rule:false},
 {t:'p', lead:true, text:'Every question with its worked solution, the error it is built to catch, and a teaching note. Not for distribution to students.'},
 {t:'box', kind:'warn', hd:'Instructor edition', html:'This document prints the worked solution and the source pages behind every question. The student workbook contains the same questions with none of it. Question ids are shared, so a number quoted in class resolves in either document.'},
 {t:'toc', items: MODS.map(id=>[id.replace('M',''), MT[id], BY[id].length + ' questions'])},
 {t:'page'}
];
MODS.forEach((id,i)=>{
  B.push({t:'h1', num:'MODULE ' + id.replace('M',''), text: MT[id]});
  BY[id].forEach(q=>{
    B.push({t:'raw', html:'<div class="qcard sol"><div class="qh">' + q.id +
      (q.src ? ' &middot; ref ' + q.src : '') + '</div>'});
    B.push({t:'p', text:q.stem});
    if(q.figure) B.push({t:'fig', svg:q.figure});
    B.push({t:'raw', html:'<ul class="opts">' + (q.parts||[]).map((o,k)=>
      '<li><b>' + 'abcde'[k] + ')</b>&nbsp; ' + renderInline(o) + '</li>').join('') + '</ul>'});
    const parts = solParts(q.sol||'');
    const lastOk = parts.map(p=>p.head.startsWith('Solution')).lastIndexOf(true);
    B.push({t:'raw', html:card('def','Given', parts.filter(p=>p.head==='Given'||p.head==='Find').map(p=>p.html).join('<div class="nsep"></div>')) + '</div></div>'});
    parts.forEach((p,k)=>{
      if(p.head==='Given'||p.head==='Find') return;
      const kind = p.head.startsWith('Solution') ? 'ok' : p.head==='Contrast with discrete time' ? 'warn' : 'def';
      B.push({t:'raw', html:card(kind, p.head, p.html)});
      if(k===lastOk && q.figSol) B.push({t:'fig', svg:q.figSol});
      B.push({t:'raw', html:'</div></div>'});
    });
    if(q.err) B.push({t:'raw', html:card('err','Common error', q.err) + '</div></div>'});
    if(q.teach) B.push({t:'raw', html:'<div class="why"><b>Teaching note.</b> ' + renderInline(q.teach) + '</div>'});
    B.push({t:'raw', html:'</div>'});
  });
  if(i < MODS.length-1) B.push({t:'page'});
});
B.push({t:'colophon', doc:'Instructor Solutions'});
renderNotes(B, document.getElementById('doc'));`;

/* -------------------------------------------------------- formula reference */
const reference = `
const B = [
 {t:'cover', kicker:'Signals and Systems', text:'Signals, Systems and<br>Frequency-Domain Analysis', sub:'Formula and Notation Reference', foot:'Conventions &middot; formulas &middot; notation'},
 {t:'page'},
 {t:'h1', text:'Contents', rule:false},
 {t:'p', lead:true, text:'The conventions used throughout the course, every formula it establishes, and every symbol it defines. Nothing here is derived; the derivations are in the lecture notes.'},
 {t:'toc', items:[['1','Conventions','Units, brackets, the imaginary unit, sinc, sampling, and the two transform pairs.',''],
   ['2','Summary of formulas','Everything the course establishes, in the order it establishes it.',''],
   ['3','Notation','Every symbol the course defines.','']]},
 {t:'h3', text:'How to read it'},
 {t:'p', text:'Part 1 states the conventions and the two transform pairs. Part 2 is the summary of formulas, in the order the course establishes them. Part 3 defines every symbol. Nothing here is derived: where a result needs an argument, the argument is in the lecture notes chapter named beside it.'},
 {t:'page'},
 {t:'h1', num:'PART 1', text:'Conventions'},
 {t:'p', lead:true, text:'These hold everywhere in the course, without local variation. Where a result depends on one of them, it is restated at that point rather than assumed.'},
 {t:'table', head:['Convention','Statement'], rows:[
   ['Energy and power','Normalised: the resistance is taken as $1\\\\ \\\\Omega$, so instantaneous power is $|x|^{2}$ and energy is its integral or sum.'],
   ['Imaginary unit','$j$, with $j^{2}=-1$.'],
   ['Angular frequency','$\\\\omega$ in rad/s in continuous time and rad/sample in discrete time. A frequency in hertz is written out as such, and $\\\\omega=2\\\\pi f$.'],
   ['Brackets','Round brackets for continuous time, $x(t)$. Square brackets for discrete time, $x[n]$, where $n$ is an integer.'],
   ['Convolution','$*$. It applies only to systems that are both linear and time invariant.'],
   ['sinc','Unnormalised, $\\\\operatorname{sinc}(\\\\theta)=\\\\sin\\\\theta/\\\\theta$, with zeros at $\\\\theta=\\\\pm k\\\\pi$. The convention is restated wherever sinc is used.'],
   ['Sampling','$\\\\omega_s=2\\\\pi/T$ rad/s and $f_s=1/T$ Hz. The sampling theorem is stated with a strict inequality, $\\\\omega_s>2\\\\omega_M$.']
 ]},
 {t:'eqbox', cap:'The continuous-time Fourier transform pair',
  tex:['X(j\\\\omega)=\\\\int_{-\\\\infty}^{\\\\infty}x(t)e^{-j\\\\omega t}\\\\,dt',
       'x(t)=\\\\frac{1}{2\\\\pi}\\\\int_{-\\\\infty}^{\\\\infty}X(j\\\\omega)e^{j\\\\omega t}\\\\,d\\\\omega'],
  after:'The first is the analysis equation and the second the synthesis equation. The factor $\\\\frac{1}{2\\\\pi}$ belongs to synthesis.'},
 {t:'eqbox', cap:'The discrete-time Fourier transform pair',
  tex:['X(e^{j\\\\omega})=\\\\sum_{n=-\\\\infty}^{\\\\infty}x[n]e^{-j\\\\omega n}',
       'x[n]=\\\\frac{1}{2\\\\pi}\\\\int_{2\\\\pi}X(e^{j\\\\omega})e^{j\\\\omega n}\\\\,d\\\\omega'],
  after:'The synthesis integral runs over one period, because the spectrum repeats every $2\\\\pi$.'},
 {t:'page'},
 {t:'h1', num:'PART 2', text:'Summary of formulas'},
 {t:'p', lead:true, text:'Everything the course establishes, in the order it establishes it.'}
];
/* Appendix A of the lecture notes is this part, verbatim: one source, not two. */
const APP = CA.slice(CA.findIndex(b=>b.t==='h1' && /APPENDIX/.test(b.num||'')) + 1);
B.push.apply(B, APP.filter(b=>b.t!=='title'));
B.push({t:'page'});
B.push({t:'h1', num:'PART 3', text:'Notation'});
B.push({t:'p', lead:true, text:'Every symbol the course defines, with the chapter that defines it. A symbol is never reused for a second meaning.'});
B.push({t:'table', head:['Symbol','Meaning'], rows: Object.keys(CONTENT.GLOSS).map(k=>{
  const e = CONTENT.GLOSS[k];
  return ['$' + (e.s||'').replace(/\\$/g,'') + '$', e.d||''];
})});
B.push({t:'colophon', doc:'Formula and Notation Reference'});
renderNotes(B, document.getElementById('doc'));`;

const OUT = path.join(__dirname, '..', 'dist');
fs.mkdirSync(OUT, { recursive: true });
const write = (name, html) => {
  fs.writeFileSync(path.join(OUT, name), html);
  console.log(name.padEnd(30), (html.length / 1048576).toFixed(2) + ' MB');
};
write('Student_Workbook.html', doc('Signals and Systems — Student Workbook', workbook));
write('Instructor_Solutions.html', doc('Signals and Systems — Instructor Solutions', solutions));
write('Formula_Reference.html', doc('Signals and Systems — Formula and Notation Reference', reference,
  `<script>${g(S('src/ca.js'))}</script>`));

/* The version history of the PDFs, as a table beside them. The rows are read
   from DOC_HISTORY in render.js, the list each PDF prints on its last page, so
   the two cannot disagree. */
const HIST = require('vm').runInNewContext(
  S('src/render.js').match(/window\.DOC_HISTORY\s*=\s*(\[[\s\S]*?\]);/)[1]);
write('PDF_VERSIONS.md', '# PDF version history\n\n' +
  'Applies to Lecture_Notes.pdf, Student_Workbook.pdf, Instructor_Solutions.pdf and Formula_Reference.pdf. Newest first.\n\n' +
  '| Version | Date | Description |\n| --- | --- | --- |\n' +
  HIST.map(r => '| ' + r.join(' | ') + ' |').join('\n') + '\n');
