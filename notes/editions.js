/* Builds the three document editions that sit beside the lecture notes.

   All three are generated from the content the artifact already carries — the
   exam drills, the glossary and the conventions manifest — so a question id
   means the same thing in every edition, and nothing here is a second copy of
   anything that would have to be kept in step by hand.

     Student_Workbook.html    every question, no answers and no solutions
     Instructor_Solutions.html every question with its full solution, plus provenance
     Formula_Reference.html   the conventions, the summary of formulas, the glossary

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
.gloss dt{ font-family:var(--mono); font-size:9pt; margin-top:5pt; }
.gloss dd{ margin:0 0 0 22pt; }
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
/* A question-type name may carry mathematics — `Inverse transform from a
   rational $X(j\\omega)$` is one — so it goes through the same md() the running
   text uses. Interpolated raw it prints the dollar signs and the backslash on
   the page, which is the R8 failure in the one place nobody proofreads. The
   .qh frame is uppercase mono with wide tracking and both are reset on .katex
   below, so the typeset name keeps its own case and spacing. */
const KIND = `const KIND = (m,k)=>{ const t=(CONTENT.DRILLTYPES[m]||[]).find(x=>x.k===k);
  return t ? renderInline(t.name) : k; };`;
const GROUP = `const BY = {};
  CONTENT.DRILL.forEach(q=>{ (BY[q.module] = BY[q.module] || []).push(q); });
  const MODS = CONTENT.MODULES.map(m=>m.id).filter(id=>BY[id]);`;

/* ---------------------------------------------------------------- workbook */
const workbook = `
${MODULE_TITLE}${KIND}${GROUP}
const B = [
 {t:'title', kicker:'Signals and Systems', text:'Student Workbook',
  sub:'Every question in the course, with no answer and no solution. Work each one on the page, then check it against the artifact or against the instructor edition.',
  meta:[['Contains', CONTENT.DRILL.length + ' questions across ' + MODS.length + ' modules'],
        ['Level','Undergraduate'],
        ['Answers','Not printed in this edition']]},
 {t:'toc', items: MODS.map(id=>[id.replace('M',''), MT[id], BY[id].length + ' questions'])},
 {t:'h3', text:'How to use it'},
 {t:'p', text:'The questions are in the order the course meets them, and each is labelled with what it asks for. Only the statement and its lettered parts are printed; the reasoning stays for you to supply. The question numbers are shared with every other edition, so D5-04 is the same question in the artifact, in this workbook and in the instructor solutions.'},
 {t:'page'}
];
MODS.forEach((id,i)=>{
  B.push({t:'h1', num:'MODULE ' + id.replace('M',''), text: MT[id]});
  B.push({t:'p', lead:true, text:BY[id].length + ' questions on ' + MT[id].toLowerCase() + '. Write your reasoning in the space under each one.'});
  BY[id].forEach(q=>{
    B.push({t:'raw', html:'<div class="qcard"><div class="qh">' + q.id + ' &middot; ' + KIND(id,q.type) + '</div>'});
    B.push({t:'p', text:q.stem});
    if(q.figure) B.push({t:'fig', svg:q.figure});
    B.push({t:'raw', html:'<ul class="opts">' + (q.parts||[]).map((o,k)=>
      '<li><b>' + 'abcde'[k] + ')</b>&nbsp; ' + renderInline(o) + '</li>').join('') + '</ul>'});
    B.push({t:'raw', html:'<div class="workspace"></div></div>'});
  });
  if(i < MODS.length-1) B.push({t:'page'});
});
renderNotes(B, document.getElementById('doc'));`;

/* ------------------------------------------------------ instructor solutions */
const solutions = `
${MODULE_TITLE}${KIND}${GROUP}
const B = [
 {t:'title', kicker:'Signals and Systems', text:'Instructor Solutions',
  sub:'Every question with its worked solution, the error it is built to catch, and a teaching note. Not for distribution to students.',
  meta:[['Contains', CONTENT.DRILL.length + ' questions, fully worked'],
        ['Edition', CONTENT.META.version],
        ['Distribution','Instructor only']]},
 {t:'box', kind:'warn', hd:'Instructor edition', html:'This document prints the worked solution and the source pages behind every question. The student workbook contains the same questions with none of it. Question ids are shared, so a number quoted in class resolves in either document.'},
 {t:'toc', items: MODS.map(id=>[id.replace('M',''), MT[id], BY[id].length + ' questions'])},
 {t:'page'}
];
MODS.forEach((id,i)=>{
  B.push({t:'h1', num:'MODULE ' + id.replace('M',''), text: MT[id]});
  BY[id].forEach(q=>{
    B.push({t:'raw', html:'<div class="qcard"><div class="qh">' + q.id + ' &middot; ' + KIND(id,q.type) +
      (q.src ? ' &middot; ref ' + q.src : '') + '</div>'});
    B.push({t:'p', text:q.stem});
    if(q.figure) B.push({t:'fig', svg:q.figure});
    B.push({t:'raw', html:'<ul class="opts">' + (q.parts||[]).map((o,k)=>
      '<li><b>' + 'abcde'[k] + ')</b>&nbsp; ' + renderInline(o) + '</li>').join('') + '</ul>'});
    if(q.figSol) B.push({t:'fig', svg:q.figSol});
    if(q.sol) B.push({t:'raw', html:'<div class="why"><b>Worked solution.</b> ' + renderInline(q.sol) + '</div>'});
    if(q.err) B.push({t:'raw', html:'<div class="why"><b>The error this catches.</b> ' + renderInline(q.err) + '</div>'});
    if(q.teach) B.push({t:'raw', html:'<div class="why"><b>Teaching note.</b> ' + renderInline(q.teach) + '</div>'});
    B.push({t:'raw', html:'</div>'});
  });
  if(i < MODS.length-1) B.push({t:'page'});
});
renderNotes(B, document.getElementById('doc'));`;

/* -------------------------------------------------------- formula reference */
const reference = `
const B = [
 {t:'title', kicker:'Signals and Systems', text:'Formula and Notation Reference',
  sub:'The conventions used throughout the course, every formula it establishes, and every symbol it defines. Nothing here is derived; the derivations are in the lecture notes.',
  meta:[['Contains','Conventions, formulas, notation'],
        ['Edition','v1.0'],
        ['Companion','Lecture notes, Chapters 1 to 7']]},
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
B.push({t:'raw', html:'<dl class="gloss">' + Object.keys(CONTENT.GLOSS).map(k=>{
  const e = CONTENT.GLOSS[k];
  return '<dt>' + renderInline('$' + (e.s||'').replace(/\\$/g,'') + '$') + '</dt><dd>' + renderInline(e.d||'') + '</dd>';
}).join('') + '</dl>'});
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
