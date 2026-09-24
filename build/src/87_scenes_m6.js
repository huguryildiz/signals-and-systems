/* ==========================================================================
   Module 6 — Discrete-Time Fourier Transform  [Source: 64–79]
   ========================================================================== */
(function(){
const P = PLOT, C = P.COL;
const PI = Math.PI;

/* stems over an integer range */
const D = (f,a,b)=>{const o=[];for(let n=Math.ceil(a);n<=b;n++)o.push([n,f(n)]);return o;};

/* A frequency axis is read in multiples of pi, so every spectrum in this module
   carries its tick row that way. A tick number is part of the scale of the
   frame rather than of the running mathematics, so it stays plain text; every
   axis name, annotation and bracket label around it is typeset. */
const piTick = v => {
  const r = v/PI;
  if(Math.abs(r) < 1e-9) return '0';
  for(const den of [1,2,3,4,6,8,12]){
    const num = r*den;
    if(Math.abs(num-Math.round(num)) < 1e-7){
      const k = Math.round(num), sg = k<0?'-':'', m = Math.abs(k);
      const head = m===1 ? 'π' : m+'π';
      return den===1 ? sg+head : sg+head+'/'+den;
    }
  }
  return P.fmt(v,2);
};
/* ticks at every `step` radians across the drawn range */
const wTicks = (lo,hi,step) => { const o=[];
  for(let k=Math.ceil(lo/step-1e-9); k<=hi/step+1e-9; k++) o.push(k*step); return o; };

/* Every spectrum in this module is drawn over more than one period of 2*pi, and
   the period itself is marked on the figure. That is the subject of the module,
   not a decoration: it is the one property that separates this transform from
   the continuous-time one.
   The name of the dependent variable is laid out above the data area, anchored on
   the zero line — which on a symmetric frequency axis is the middle of the figure.
   The bracket is therefore drawn without a label and the words are set to the left
   of it, so the two never share a column. */
const markPeriod = (a, v, o) => {
  o = o || {};
  const lo = o.lo!=null ? o.lo : -PI, hi = o.hi!=null ? o.hi : PI;
  a.vline(lo,{color:C.coral,opacity:.5}); a.vline(hi,{color:C.coral,opacity:.5});
  a.span(lo,hi,v,'',{color:C.coral});
  a.note(lo,v,'\\text{one period},\\;2\\pi',{tex:true,color:C.coral,fs:13,anchor:'end',dx:-8,dy:-3});
  return a;
};
/* A frequency tick is crossed by the data whenever the quantity drawn changes
   sign, because the tick row sits on the zero line. Those figures label the axis
   at the two ends of the marked period only; the dashed period markers carry the
   rest of the scale. */
const wPi = v => Math.abs(Math.abs(v)-PI) < 1e-9 ? piTick(v) : '';

/* ---- the transforms this module derives, as functions of omega ---- */
/* rectangular pulse, 1 on |n| <= N1: the Dirichlet kernel */
const dirich = (w,N1)=>{ const s=Math.sin(w/2);
  return Math.abs(s) < 1e-9 ? 2*N1+1 : Math.sin(w*(N1+0.5))/s; };
/* a^n u[n] */
const geoRe = (w,a)=>1-a*Math.cos(w), geoIm = (w,a)=>a*Math.sin(w);
const geoMag = (w,a)=>1/Math.sqrt(1-2*a*Math.cos(w)+a*a);
const geoPh  = (w,a)=>-Math.atan2(geoIm(w,a), geoRe(w,a));
/* a^{|n|} */
const twoSide = (w,a)=>(1-a*a)/(1-2*a*Math.cos(w)+a*a);
/* the ideal low-pass spectrum, periodic by 2*pi */
const wrap = w => w - 2*PI*Math.round(w/(2*PI));
const lpf = (w,W)=>Math.abs(wrap(w)) <= W ? 1 : 0;
/* its inverse transform */
const lpfInv = (n,W)=> n===0 ? W/PI : Math.sin(W*n)/(PI*n);
/* one copy of the convolution of two rectangular bands, scaled by 1/2pi, and
   the periodic convolution that adds every copy of it */
const rectConv = (w,W1,W2)=>{ const lo=Math.max(w-W1,-W2), hi=Math.min(w+W1,W2);
  return hi>lo ? (hi-lo)/(2*PI) : 0; };
const perConv = (w,W1,W2)=>{ let s=0;
  for(let k=-3;k<=3;k++) s += rectConv(w-2*PI*k,W1,W2); return s; };
/* discrete-time square-wave series coefficients */
const dtRect = (k,N,N1)=>{ const r=k/N;
  if(Math.abs(r-Math.round(r)) < 1e-12) return (2*N1+1)/N;
  return Math.sin(2*PI*k*(N1+0.5)/N)/(N*Math.sin(PI*k/N)); };

Object.assign(CONTENT.GLOSS, {
  Xejw:{ s:'X(e^{j\\omega})', d:'Discrete-time Fourier transform of the sequence $x[n]$. It is a continuous function of $\\omega$ and it repeats every $2\\pi$.', go:'m6-pair' },
  dtftper:{ s:'2\\pi\\text{-periodicity}', d:'$X(e^{j(\\omega+2\\pi)})=X(e^{j\\omega})$ for every sequence, because $e^{-j2\\pi n}=1$ at every integer $n$.', go:'m6-periodic' },
  dirk:{ s:'\\frac{\\sin(\\omega(N_1+\\frac12))}{\\sin(\\omega/2)}', d:'Dirichlet kernel: the transform of the rectangular pulse that is $1$ on $-N_1\\le n\\le N_1$. It is real and it changes sign.', go:'m6-ex-rect' },
  pconv:{ s:'\\circledast', d:'Periodic convolution: an integral over one period of $2\\pi$, not over all frequencies. It is what the multiplication property produces in discrete time.', go:'m6-mult' },
  zsub:{ s:'z=e^{-j\\omega}', d:'A named algebraic variable used to run partial fractions on a discrete-time transform. Substituting a value for $z$ is algebra in $z$, not an evaluation of the unit-modulus quantity $e^{-j\\omega}$.', go:'m6-conv' },
  expan:{ s:'x_{(k)}[n]', d:'Time expansion of $x[n]$ by an integer factor $k$: $x[n/k]$ when $n$ is a multiple of $k$, and zero otherwise.', go:'m6-expansion' }
});

const cl = u=>Math.max(0,Math.min(1,u));
/* a group drawn at an opacity: the faint given signal on a sketch slide, or a
   state fading in or out while a figure plays between frames */
const fade=(a,o,f)=>{ if(o<=0) return; a.raw(`<g opacity="${o.toFixed(3)}">`); f(); a.raw('</g>'); };
/* the invisible data area a sketch is drawn in */
const skArea=a=>a.raw(`<rect class="sk-area" x="${a.x0}" y="${a.y1}" width="${a.x1-a.x0}" height="${a.y0-a.y1}" fill="none"/>`);
/* the standard slide axes: one figure in the left column of a 5:7 slide.
   A spectrum drawn about the origin puts its tick numbers on the left edge
   (yticksLeft), so they do not sit on the central peak. */
const AX = o => P.Axes(Object.assign({w:560,h:380,pad:{l:52,r:24,t:20,b:34},xtarget:7,ytarget:3,yticksLeft:true}, o));
/* the same axes for a spectrum over omega, with the tick row in multiples of pi */
const AXW = (lo,hi,step,o) => AX(Object.assign({xr:[lo,hi],xlabel:'\\omega',xticksOverride:wTicks(lo,hi,step),xtickfmt:piTick}, o));

/* ---- everyday signals, one gallery slide at the end of each teaching
       section. The traces are schematic; each keeps the feature its section
       is about. A figure with two traces carries its legend as a third entry. */
const EXO = o => Object.assign({w:520,h:250,pad:{l:60,r:26,t:24,b:40},ytarget:3}, o);
function realGallery(cfg){
  return { id:cfg.id, module:'M6', nav:cfg.nav, title:cfg.title, src:cfg.src,
    objective:cfg.objective, keywords:cfg.keywords,
    budget:cfg.budget||'A gallery of four everyday signals; each figure is one example.',
    slide:true, steps:cfg.notes.length-1, blocks:[
    {t:'eyebrow', text:cfg.eyebrow, src:cfg.src},
    {t:'title', text:cfg.title},
    {t:'cols', ratio:'c-8-4', fill:true, left:[
      {t:'grid', cols:2, gap:'18px 22px', items:cfg.figs.map(([svg,cap,lg,at])=>
        [{t:'fig', frame:true, svg, caption:cap}].concat(lg?[Object.assign({t:'legend', items:lg}, at?{at}:{})]:[]))}
    ], right:cfg.notes.map((n,i)=>i ? {t:'reveal', at:i, items:[n]} : n)}
  ]};
}
/* a laboratory scene: the title, then the laboratory itself */
function labScene(cfg){
  return { id:cfg.id, module:'M6', nav:'Laboratory {lab} · '+cfg.nav, title:'Laboratory {lab} — '+cfg.title, src:cfg.src,
    objective:cfg.objective, slide:true, keywords:cfg.keywords, steps:0, blocks:[
    {t:'eyebrow', text:'Interactive laboratory', src:cfg.src},
    {t:'title', text:'Laboratory {lab} · '+cfg.nav},
    {t:'lab', id:cfg.lab}
  ]};
}
/* a code page: the programs of one section, paged one at a time */
function codeScene(cfg){
  return { id:cfg.id, module:'M6', nav:'Code · '+cfg.nav, title:cfg.title, src:cfg.src,
    objective:cfg.objective, keywords:cfg.keywords,
    slide:true, steps:0, budget:'a code page: the program draws its own figure', blocks:[
    {t:'eyebrow', text:'Module 6 · '+cfg.eyebrow, src:cfg.src},
    {t:'title', text:cfg.title},
    {t:'raw', html:()=>CODEBANK.page(cfg.id)}
  ]};
}

/* Helpers that belong to one section only. Each section keeps its own between
   its markers. */
/* <m6-s1-helpers> */
/* Two panels in one figure: the upper one takes the fraction `fr` of the
   height. Each builder takes a height and returns an svg; the two are placed
   as nested svgs. A grown figure hands its height through P.hOverride, which
   is taken here and split, so neither panel claims the whole of it. */
const s1Stack = (H0, fr, top, bot)=>{
  const H = P.hOverride || H0, h1 = Math.round(H*fr), h2 = H - h1; P.hOverride = null;
  return `<svg viewBox="0 0 560 ${H}" xmlns="http://www.w3.org/2000/svg" role="img">`
    + top(h1).replace('<svg ',`<svg x="0" y="0" width="560" height="${h1}" `)
    + bot(h2).replace('<svg ',`<svg x="0" y="${h1}" width="560" height="${h2}" `) + '</svg>'; };
/* The same, side by side: the left panel is `wl` wide, both take the full
   height. */
const s1Side = (H0, wl, left, right)=>{
  const H = P.hOverride || H0; P.hOverride = null;
  return `<svg viewBox="0 0 560 ${H}" xmlns="http://www.w3.org/2000/svg" role="img">`
    + left(wl, H).replace('<svg ',`<svg x="0" y="0" width="${wl}" height="${H}" `)
    + right(560-wl, H).replace('<svg ',`<svg x="${wl}" y="0" width="${560-wl}" height="${H}" `) + '</svg>'; };

/* The unit circle and the samples cos(wn), stepped in n (frames) with w on a
   slider. The renderer hands a figure with frames only {frame}, so the slider
   value is read from the block itself, where the renderer keeps it.
   Frame 0 is the printed figure: all nine samples, the point at n = 0.
   Frame m >= 1 is n = m-1; between two frames the point turns by w, eased,
   and a red ring turns by w + 2pi, one extra full turn, to the same place. */
const s1NMAX = 8;
function s1CircleSvg(v, b){
  const f = v && v.frame!=null ? v.frame : 0;
  const w = ((b.live && b.live.v) ? b.live.v.w : 0.25)*PI;
  const t = Math.max(0, f-1);                    /* n, running continuously */
  const dim = k => k===0 ? 1 : (f<=1 ? 1-0.72*f : 0.28+0.72*cl(t-k+1));
  const th = w*t, tg = (w+2*PI)*t, moving = Math.abs(t-Math.round(t)) > 0.02;
  return s1Side(380, 250, (wd,h)=>{
    const base = {w:wd, h, pad:{l:14,r:20,t:16,b:24}, xlabel:'\\operatorname{Re}', ylabel:'\\operatorname{Im}',
      xticksOverride:[], yticksOverride:[], yticksLeft:false, ynameAtAxis:true, grid:false};
    /* one scale on both axes, the circle centred in the data area */
    const a0 = AX(Object.assign({xr:[-1.3,1.3], yr:[-1.3,1.3]}, base));
    const dw = a0.x1-a0.x0, dh = a0.y0-a0.y1, s = Math.min(dw, dh)/2.8;
    const a = AX(Object.assign({xr:[-dw/2/s,dw/2/s], yr:[-dh/2/s,dh/2/s]}, base));
    const R = a.sx(1)-a.sx(0);
    a.raw(`<circle cx="${a.sx(0).toFixed(2)}" cy="${a.sy(0).toFixed(2)}" r="${R.toFixed(2)}" fill="none" stroke="${C.axis}" stroke-width="1.6"/>`);
    a.note(1,0,'1',{tex:true,anchor:'start',dx:11,dy:22,color:C.muted,fs:14});
    a.note(-1,0,'-1',{tex:true,anchor:'end',dx:-9,dy:22,color:C.muted,fs:14});
    /* the turn w between n = 0 and n = 1 */
    if(w > 1e-6){
      const arc=[]; for(let i=0;i<=60;i++){ const q=w*i/60; arc.push([0.3*Math.cos(q),0.3*Math.sin(q)]); }
      a.poly(arc,{color:C.coral,width:1.6});
      /* beside the imaginary axis the label moves off it */
      const side = Math.abs(Math.cos(w/2)) < 0.3;
      if(w >= 0.2*PI) a.note(0.52*Math.cos(w/2),0.52*Math.sin(w/2),'\\omega',{tex:true,anchor:side?'start':'middle',dx:side?8:0,color:C.coral,fs:17,dy:4});
    }
    /* the nine points e^{jwk}; the ones not yet reached are hollow */
    for(let k=s1NMAX;k>=0;k--){ const o=dim(k), X=a.sx(Math.cos(w*k)), Y=a.sy(Math.sin(w*k));
      a.raw(`<circle cx="${X.toFixed(2)}" cy="${Y.toFixed(2)}" r="4.2" fill="${o>0.99?C.in:'none'}" stroke="${C.in}" stroke-width="1.6" opacity="${Math.max(o,0.45).toFixed(3)}"/>`); }
    /* the real part, cos(wn), dropped onto the real axis */
    const cx=Math.cos(th), cy=Math.sin(th);
    if(Math.abs(cy) > 0.02) a.poly([[cx,cy],[cx,0]],{color:C.coral,width:1.4,dash:'4 4'});
    a.point(cx,0,{color:C.coral,r:4.6});
    if(moving) a.poly([[0,0],[Math.cos(tg),Math.sin(tg)]],{color:C.err,width:1.6,dash:'5 4'});
    a.poly([[0,0],[cx,cy]],{color:C.in,width:2.4});
    a.point(cx,cy,{color:C.in,r:6.4});
    a.raw(`<circle cx="${a.sx(Math.cos(tg)).toFixed(2)}" cy="${a.sy(Math.sin(tg)).toFixed(2)}" r="10.5" fill="none" stroke="${C.err}" stroke-width="2.2"/>`);
    return a.svg(); }, (wd,h)=>{
    /* the top of the range is left free for the legend */
    const a = AX({w:wd, h, pad:{l:44,r:20,t:16,b:28}, xr:[-0.6,s1NMAX+0.6], yr:[-1.3,2.1], xlabel:'n', ylabel:'\\cos(\\omega n)',
      xticksOverride:D(n=>n,0,s1NMAX).map(p=>p[0]), yticksOverride:[-1,0,1]});
    for(let k=0;k<=s1NMAX;k++) fade(a,dim(k),()=>a.stem([[k,Math.cos(w*k)]],{color:C.in,showZero:true}));
    /* the sample the point stands on, once it has arrived */
    const nr=Math.round(t), o=f<1 ? 1 : cl(1-4*Math.abs(t-nr));
    fade(a,o,()=>a.point(nr,Math.cos(w*nr),{color:C.coral,r:5.4}));
    return a.svg(); });
}
const s1Circle = {t:'fig', frame:true, grow:true,
  frames:{labels:['all nine samples, $n=0,\\dots,8$','$n=0$: the point starts at $1$','$n=1$: turned by $\\omega$']
    .concat(D(n=>n,2,s1NMAX).map(p=>'$n='+p[0]+'$: turned by $'+p[0]+'\\omega$'))},
  live:{controls:[{k:'w', label:'$\\omega/\\pi$', min:0, max:2, step:0.05, v:0.25, show:v=>'$'+(Math.round(v*100)/100)+'$'}]},
  svg:v=>s1CircleSvg(v, s1Circle),
  caption:'The point $e^{j\\omega n}$ turns by $\\omega$ at each step. Its real part, dropped onto the axis, is the stem $\\cos(\\omega n)$ at the right. Press Next to step $n$; move $\\omega$ to change the turn.'};

/* The short sequence of the DFT slides and the two-cosine record. Each
   magnitude is the analysis sum itself, evaluated at w. */
const s1Mag = (x, w)=>{ let re=0, im=0;
  for(let n=0;n<x.length;n++){ re += x[n]*Math.cos(w*n); im -= x[n]*Math.sin(w*n); }
  return Math.hypot(re, im); };
const s1W1 = 0.3*PI, s1W2 = 0.4*PI;
const s1Rec = L => D(n=>Math.cos(s1W1*n)+Math.cos(s1W2*n),0,L-1).map(p=>p[1]);
/* DFT values drawn as stems at w_k = 2pi k/N across the drawn range; the
   ones with 0 <= k <= N-1 are strong, their repeats faint */
const s1DftStems = (a, N, mag, lo, hi, r)=>{
  const strong=[], faint=[];
  for(let k=Math.ceil(lo*N/(2*PI)-1e-9); k<=Math.floor(hi*N/(2*PI)+1e-9); k++){
    const wk=2*PI*k/N, m=mag(wk), p=[wk, m<1e-9 ? 0 : m];
    (k>=0 && k<N ? strong : faint).push(p); }
  fade(a,0.4,()=>a.stem(faint,{color:C.in,r}));
  a.stem(strong,{color:C.in,r});
};
/* </m6-s1-helpers> */

/* <m6-s2-helpers> */
/* Sound. A sequence is played at s2FS = 8000 samples per second, so omega = pi
   is 4 kHz; between samples the sound is joined by straight lines. Each press
   computes the whole sequence once. The noise comes from a seeded generator
   (mulberry32), so a press plays the same sound every time and the build stays
   reproducible. Sections 6.2 and 6.6 use these. */
const s2FS = 8000;
const s2rand = seed => () => { seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
/* N samples of white noise, uniform on [-1, 1] */
const s2noise = (N, seed) => { const r = s2rand(seed), x = new Float64Array(N);
  for(let i=0;i<N;i++) x[i] = 2*r()-1;
  return x; };
/* the sequence as a function of seconds, for fig.listen */
const s2play = y => t => { const u = t*s2FS, i = Math.floor(u), r = u-i;
  return i+1 < y.length ? (1-r)*y[i] + r*y[i+1] : (y[y.length-1] || 0); };
/* y[n] = a y[n-1] + x[n], from rest: the impulse response is a^n u[n] */
const s2first = (x, a) => { const y = new Float64Array(x.length); let p = 0;
  for(let i=0;i<x.length;i++){ p = a*p + x[i]; y[i] = p; }
  return y; };
/* noise that holds only |omega| <= W: a sum of K cosines, one at a random
   frequency in each of K equal slices of (0, W), each with a random phase.
   Each cosine is advanced by rotating a unit phasor, so no cosine is called
   inside the loop. */
const s2band = (N, W, seed) => { const r = s2rand(seed), y = new Float64Array(N), K = 300;
  for(let k=0;k<K;k++){ const w = W*(k + r())/K, ph = 2*PI*r();
    let c = Math.cos(ph), s = Math.sin(ph); const cw = Math.cos(w), sw = Math.sin(w);
    for(let n=0;n<N;n++){ y[n] += c; const c2 = c*cw - s*sw; s = s*cw + c*sw; c = c2; } }
  return y; };
/* </m6-s2-helpers> */

/* <m6-s3-helpers> */
/* impulses of weight wt at w0 + 2*pi*k, every copy strictly inside (-3pi, 3pi);
   one on the edge of the frame would sit on the tick rule */
const s3train = (a, w0, wt, o) => {
  for(let k=Math.ceil((-3*PI-w0)/(2*PI)); w0+2*PI*k < 3*PI-1e-6; k++)
    if(w0+2*PI*k > -3*PI+1e-6) a.impulse(w0+2*PI*k, wt, Object.assign({label:false}, o)); };
/* the spectrum axes of this section: three periods, ticks at multiples of pi */
const s3SP = (yr, o) => AXW(-3*PI, 3*PI, PI, Object.assign({yr, ylabel:'X(e^{j\\omega})'}, o));
/* the periodic square wave: 1 on |n| <= N1 in each period N */
const s3sq = (n,N,N1) => { const m = n - N*Math.round(n/N); return Math.abs(m) <= N1 ? 1 : 0; };
/* the unit-sample train: 1 at every multiple of N */
const s3imp = (n,N) => (((n % N) + N) % N) === 0 ? 1 : 0;
/* the square-wave line spectrum: weight 2*pi*a_k at 2*pi*k/N, strictly inside (-3pi, 3pi) */
const s3sqLines = (a, N, N1, o) => {
  const K = Math.floor(1.5*N);
  for(let k=-K; k<=K; k++){ const v = 2*PI*dtRect(k,N,N1);
    if(Math.abs(v) > 1e-9 && Math.abs(k/N) < 1.5-1e-9) a.impulse(2*PI*k/N, v, Object.assign({color:C.in, label:false}, o)); } };
/* </m6-s3-helpers> */

/* <m6-s4-helpers> */
/* Section 6.4: a spectrum over three periods with the tick row in multiples
   of pi, the phase wrapped into (-pi, pi], and the one-sided exponential
   a^n u[n] that most of the section's figures use. */
const s4AX = o => AXW(-3*PI,3*PI,PI,o);
const s4wrap = v => v - 2*PI*Math.round(v/(2*PI));
const bGeoS4 = (n,a) => n>=0 ? Math.pow(a,n) : 0;
/* </m6-s4-helpers> */

/* <m6-s5-helpers> */
/* A half-width in multiples of pi, read from a slider in eighths of pi, as TeX */
const s5Frac = v => { let n=Math.round(v*8), d=8;
  while(n%2===0 && d>1){ n/=2; d/=2; }
  const head = n===1 ? '\\pi' : n+'\\pi';
  return d===1 ? head : head+'/'+d; };
/* The period of a sampled-audio spectrum drawn against frequency in kHz: the
   same marks as markPeriod, with the period named in kHz to the right of the
   bracket, clear of the tick numbers on the left edge */
const s5PeriodKHz = (a, v, half) => {
  a.vline(-half,{color:C.coral,opacity:.5}); a.vline(half,{color:C.coral,opacity:.5});
  a.span(-half,half,v,'',{color:C.coral});
  a.note(half,v,'\\text{period},\\;'+(2*half)+'\\ \\text{kHz}',{tex:true,color:C.coral,fs:13,anchor:'start',dx:8,dy:-3});
  return a; };
/* the named algebraic variable is introduced on the worked example */
Object.assign(CONTENT.GLOSS, { zsub: Object.assign({}, CONTENT.GLOSS.zsub, { go:'m6-conv-ex' }) });
/* Two panels in one figure, the upper over the lower. A grown or redrawn figure hands its height
   through P.hOverride, which is taken here and split, so neither panel claims
   the whole of it. Two panels carry two sets of axis names and tick rows, which
   grow with the label scale of lecture mode, so lecture mode takes its own base
   height H0 and its own share r of the upper panel, each [normal, lecture]. */
const s5Stack = (H0, r, top, bot) => {
  const L = P.labelScale() > 1 ? 1 : 0, H = P.hOverride || H0[L]; P.hOverride = null;
  const h1 = Math.round(H*r[L]), h2 = H - h1;
  return `<svg viewBox="0 0 560 ${H}" xmlns="http://www.w3.org/2000/svg" role="img">`
    + top(h1).replace('<svg ', `<svg x="0" y="0" width="560" height="${h1}" `)
    + bot(h2).replace('<svg ', `<svg x="0" y="${h1}" width="560" height="${h2}" `) + '</svg>'; };
/* a value given in multiples of pi, as TeX: 0.25 -> \pi/4 */
const s5PiTex = v => {
  if(Math.abs(v) < 1e-9) return '0';
  for(const d of [1,2,3,4,6,8,12,16,24,32]){ const x = v*d;
    if(Math.abs(x-Math.round(x)) < 1e-7){ const k = Math.round(x), m = Math.abs(k);
      const head = m===1 ? '\\pi' : m+'\\pi';
      return (k<0?'-':'') + (d===1 ? head : head+'/'+d); } }
  return v.toFixed(2)+'\\pi'; };
/* |X(e^{jw})| of a finite record x[0..], placed so that x[0] sits at n = n0 */
const s5Mag = (x, w, n0) => { let re = 0, im = 0; n0 = n0||0;
  for(let i=0;i<x.length;i++){ const p = w*(n0+i); re += x[i]*Math.cos(p); im -= x[i]*Math.sin(p); }
  return Math.hypot(re, im); };
/* the Hann window of length L, sin^2(pi n / L) on 0 <= n <= L-1 */
const s5Hann = (n, L) => (n<0 || n>L-1) ? 0 : Math.pow(Math.sin(PI*n/L), 2);
/* the record of the window slides: a strong cosine and one 40 dB weaker */
const S5L = 32, S5W1 = PI/4, S5W2 = 21*PI/32, S5A2 = 0.01;
/* the sequence of the spectrogram slide: four notes of 48 samples, each one
   tone from a low group and one from a high group, in multiples of pi */
const S5NOTES = [[0.15,0.55],[0.35,0.80],[0.15,0.80],[0.35,0.55]], S5SEG = 48, S5N = 192, S5HOP = 8;
const s5Tones = n => { if(n<0 || n>=S5N) return 0;
  const [a,b] = S5NOTES[Math.floor(n/S5SEG)]; return Math.cos(a*PI*n) + Math.cos(b*PI*n); };
/* one column of the spectrogram: |X_m| in dB against the peak of a full note,
   at `rows` frequencies across 0 <= w <= pi */
const s5Column = (m, rows) => {
  const x = []; for(let i=0;i<S5L;i++) x.push(s5Tones(m+i)*s5Hann(i,S5L));
  const ref = S5L/4, o = [];
  for(let r=0;r<rows;r++) o.push(20*Math.log10(Math.max(s5Mag(x,(r+0.5)*PI/rows,m)/ref, 1e-9)));
  return o; };
/* </m6-s5-helpers> */

/* <m6-s6-helpers> */
/* The echo slide. Its sounds are played at s2FS = 8000 samples per second
   (6.2 helpers) with a delay of s6D = 2000 samples, 0.25 s; the figure draws
   D = 3 so that the teeth of the comb can be seen. */
const s6D = 2000;
/* a plucked note: three harmonics of 440 Hz under the envelope e^{-14t}, N samples */
const s6pluck = N => { const x = new Float64Array(N);
  for(let i=0;i<N;i++){ const t = i/s2FS;
    x[i] = Math.exp(-14*t)*(Math.sin(2*PI*440*t) + 0.5*Math.sin(4*PI*440*t) + 0.25*Math.sin(6*PI*440*t)); }
  return x; };
/* the echo y[n] = x[n] + al x[n-D] */
const s6echo = (x, al, D) => x.map((v,n) => v + (n >= D ? al*x[n-D] : 0));
/* the recursion that removes it, w[n] = y[n] - al w[n-D], from rest */
const s6undo = (y, al, D) => { const w = new Float64Array(y.length);
  for(let n=0;n<y.length;n++) w[n] = y[n] - (n >= D ? al*w[n-D] : 0);
  return w; };
/* </m6-s6-helpers> */

/* Small sketches for the summary and project cards. Both pages are navy, so
   they are drawn in the dark-page signal tints. */
/* <m6-s7-helpers> */
const G = (()=>{
  const sv = b => `<svg viewBox="0 0 92 44">${b}</svg>`;
  const ln = (d,c,w) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w||2}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const dot = (x,y,c) => `<circle cx="${x}" cy="${y}" r="2.4" fill="${c}"/>`;
  const st = (x,y,c,base) => ln(`M${x} ${base||40} V${y}`,c,1.8)+dot(x,y,c);
  const tr = (f,c,w,x0,x1) => ln('M'+[...Array(Math.round((x1||90)-(x0||2))+1)].map((_,i)=>{ const x=(x0||2)+i; return x+','+f(x).toFixed(1); }).join('L'),c,w||1.8);
  const imp = (x,y,c) => ln(`M${x} 40 V${y}`,c,1.8)+`<path d="M${x} ${y-2} l-3,6 h6 Z" fill="${c}"/>`;
  const box = (x,y,w,h,c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${c}" stroke-width="1.6"/>`;
  const AX='rgba(239,231,216,.30)', CY='#4FBECE', GR='#82C27B', RD='#E8785F', VI='#AC99DC', AM='#E5B255';
  /* one period of a spectrum is 30 units wide: x = 46 is omega = 0 and the
     copies sit at x = 16 and x = 76 */
  const per = u => { const p=((u-46)%30+45)%30-15; return p; };
  const bump = (x,h) => 40-h/(1+Math.pow(per(x)/4,2));
  const dir = x => { const w=per(x)*Math.PI/15, s=Math.sin(w/2); return Math.abs(s)<1e-6 ? 5 : Math.sin(2.5*w)/s; };
  return {
    limit:  sv(ln('M1 40 H91',AX,1)+tr(x=>40-30/(1+Math.pow((x-46)/9,2)),VI,1.2)+[-4,-3,-2,-1,0,1,2,3,4].map(k=>st(46+k*9,40-30/(1+k*k),CY)).join('')),
    pair:   sv(ln('M1 36 H40 M50 36 H91',AX,1)+[0,1,2,3,4,5].map(k=>st(6+k*6,36-22*Math.pow(0.6,k),CY,36)).join('')+tr(x=>36-22*(0.4/Math.sqrt(1-1.2*Math.cos((x-70)*Math.PI/10)+0.36))/1.0,GR,1.6,50,90)),
    period: sv(ln('M1 40 H91',AX,1)+tr(x=>bump(x,28),AM,1.8)+ln('M31 6 V42 M61 6 V42',RD,1)+ln('M31 8 H61',RD,1.2)),
    expo:   sv(ln('M1 40 H91',AX,1)+[0,1,2,3,4,5,6,7,8,9,10].map(k=>st(8+k*8,40-30*Math.pow(0.7,k),CY)).join('')),
    dirich: sv(ln('M1 26 H91',AX,1)+tr(x=>26-3.6*dir(x),AM,1.6)),
    lines:  sv(ln('M1 40 H91',AX,1)+[-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6].map(k=>imp(46+k*6.5,[30,12,20,12][((k%4)+4)%4],CY)).join('')),
    shift:  sv(ln('M1 22 H91 M46 4 V42',AX,1)+ln('M8 6 L84 38',VI,1.8)),
    conv:   sv(ln('M2 22 H24 M54 22 H70',AX,1.3)+box(24,12,30,20,AM)+[0,1,2,3].map(k=>st(4+k*5,22-8*Math.pow(0.6,k),CY,22)).join('')+[0,1,2,3].map(k=>st(74+k*5,22-6*Math.pow(0.8,k),GR,22)).join('')),
    energy: sv(ln('M1 40 H91',AX,1)+`<path d="M31 40 ${[...Array(31)].map((_,i)=>'L'+(31+i)+' '+bump(31+i,30).toFixed(1)).join(' ')} L61 40 Z" fill="${AM}" fill-opacity=".35"/>`
               +tr(x=>bump(x,30),AM,1.6)),
    diffeq: sv(ln('M1 40 H91',AX,1)+[0,1,2,3,4,5,6,7,8,9,10].map(k=>st(8+k*8,40-14*(4*Math.pow(0.5,k)-2*Math.pow(0.25,k)),AM)).join('')),
    ema:    sv(ln('M1 40 H91',AX,1)+[...Array(15)].map((_,k)=>st(6+k*6,40-(8+k*1.3+[5,-4,6,-3,2,-5,4,-2,5,-4,3,-3,6,-2,4][k]),CY)).join('')+tr(x=>40-(8+(x-6)*1.3/6),GR,1.8,6,90)),
    beep:   sv(ln('M1 22 H91',AX,1)+[...Array(21)].map((_,k)=>st(6+k*4,22-14*Math.cos(Math.PI*k/4),CY,22)).join('')),
    echo:   sv(ln('M1 40 H40 M50 40 H91',AX,1)+st(12,10,CY)+st(26,25,CY)+tr(x=>40-8-16*Math.abs(1+0.5*Math.cos((x-50)*Math.PI/10))/1.5,AM,1.6,50,90)),
    cascade:sv(ln('M2 22 H14 M34 22 H46 M66 22 H78',AX,1.3)+box(14,12,20,20,AM)+box(46,12,20,20,AM)+[0,1,2].map(k=>st(80+k*5,22-14*(k+1)*Math.pow(0.5,k)/1.5,GR,22)).join(''))
  };
})();
/* </m6-s7-helpers> */

const SC = [


/* ============================================================ opening ==== */
{ id:'m6-open', module:'M6', nav:'Module 6 opening', title:'Discrete-Time Fourier Transform', src:'pp. 64–79',
  dark:true, keywords:'module 6 discrete time fourier transform DTFT periodic 2pi overview aperiodic sequence', steps:0, blocks:[
  {t:'eyebrow', text:'Module 6 · Discrete-Time Fourier Transform', src:'pp. 64–79'},
  {t:'title', level:1, text:'The Discrete-Time Fourier Transform'},
  {t:'lede', text:'The discrete-time Fourier transform describes the frequency content of an aperiodic sequence. Its spectrum is a continuous function of frequency, but it repeats every $2\\pi$. This module develops the transform and uses that periodicity in each property.'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'raw', html:`<div style="margin-top:16px">
      <div style="font-family:var(--mono);font-size:12.5px;letter-spacing:.14em;color:var(--slate);margin-bottom:10px">THE ENTIRE MODULE, IN TWO LINES</div></div>`},
    {t:'eq', tex:'X(e^{j\\omega})=\\sum_{n=-\\infty}^{\\infty}x[n]\\,e^{-j\\omega n}', label:'Analysis'},
    {t:'eq', tex:'x[n]=\\frac{1}{2\\pi}\\int_{2\\pi}X(e^{j\\omega})\\,e^{j\\omega n}\\,\\d\\omega', label:'Synthesis'},
    {t:'note', kind:'ok', head:'Why the second line has a finite range', html:'<span style="color:var(--graphite)">The spectrum repeats every $2\\pi$, so it carries no information outside one period. Integrating over one period recovers the whole sequence; integrating over all frequencies would count the same information again and again.</span>'}
  ], right:[
    /* Four spectra over three periods. The canvas is narrower than the
       column, so the traces read at back-row size on the navy page. */
    {t:'fig', svg:()=>{
      const a=P.Axes({w:520,h:330,xr:[-3*PI,3*PI],yr:[-0.55,4.6],grid:false,zeroAxes:false,arrows:false,
        pad:{l:14,r:14,t:14,b:14},xticksOverride:[],yticksOverride:[]});
      a.curve(w=>twoSide(w,0.6)*0.62+3.0,{color:'#7FC3CE',width:2.4,n:2400,anim:{delay:0,sweep:'#D9F3F7'}});
      a.curve(w=>dirich(wrap(w),2)*0.16+1.85,{color:'#AC99DC',width:2.2,n:2400,anim:{delay:.35,sweep:'#E6DEF7'}});
      a.curve(w=>geoMag(w,0.7)*0.30+0.75,{color:'#E5B255',width:2.2,n:2400,anim:{delay:.7,sweep:'#F7E6C2'}});
      a.curve(w=>lpf(w,PI/2)*0.55-0.15,{color:'#8FBF8A',width:2.4,n:4000,anim:{delay:1.05,sweep:'#E4F4E1'}});
      for(const m of [-3,-1,1,3]) a.vline(m*PI,{color:'#6D7F8C',dash:'2 6',opacity:.7});
      return a.svg(); },
      caption:'Four different sequences, four different spectra, one shared property: each picture repeats itself every $2\\pi$ along the frequency axis.'}
  ]}
]},

/* <m6-s1> ============================================ 6.1 building the transform */

{ id:'m6-derive', module:'M6', nav:'Periodic replication', title:'Periodic Replication of a Sequence', src:'p. 64',
  objective:'Build the periodic replication of a finite-support sequence and state the condition it needs.',
  keywords:'periodic replication finite support N > 2N1 aperiodic derivation discrete fourier series extension', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Building the transform', src:'p. 64'},
  {t:'title', text:'Periodic Replication of a Sequence'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$x[n]$: one pulse','$\\tilde{x}[n]$ with $N=9$','$\\tilde{x}[n]$ with $N=4$: overlap']},
      svg:v=>{
      /* frame 0 is the pulse; frame 1 brings in the copies at N = 9; frame 2
         packs them at N = 4, where neighbouring copies overlap and add */
      const f=v?v.frame:0;
      const near=cl(f)*(1-cl(f-1)), far=cl(f-1);
      const a=AX({xr:[-13,13],yr:[-0.3,2.75],xlabel:'n',ylabel:'\\tilde{x}[n]',yticksOverride:[0,1,2],xtarget:9});
      const rep=(n,N)=>{ let s=0; for(let r=-8;r<=8;r++) if(Math.abs(n-r*N)<=2) s+=1; return s; };
      fade(a,1-far,()=>{ a.stem(D(n=>Math.abs(n)<=2?1:0,-2,2),{color:C.in});
        a.span(-2,2,1.3,'',{color:C.coral});
        a.note(2.6,1.3,'2N_1+1\\;\\text{samples}',{color:C.coral,tex:true,fs:15}); });
      fade(a,near,()=>{ a.stem(D(n=>Math.abs(n)>2?rep(n,9):NaN,-13,13).filter(p=>isFinite(p[1])),{color:C.mid,showZero:true});
        a.span(0,9,1.75,'N=9',{color:C.coral,tex:true,fs:15}); });
      fade(a,far,()=>{ a.stem(D(n=>rep(n,4),-13,13),{color:C.err});
        a.span(0,4,2.35,'N=4',{color:C.err,tex:true,fs:15}); });
      return a.svg(); },
      caption:'The pulse is $1$ on $|n|\\le N_1$ with $N_1=2$, and $0$ elsewhere. With $N=9$ the copies stand apart. With $N=4$ they overlap and add.'}
  ], right:[
    {t:'eq', tex:'\\tilde{x}[n]=\\sum_{r=-\\infty}^{\\infty}x[n-rN],\\qquad \\tilde{x}[n+N]=\\tilde{x}[n]', label:'Periodic replication',
      note:'Here $x[n]=0$ for $|n|>N_1$. The copies repeat every $N$ samples, so the series of Module 4 applies to $\\tilde{x}$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'Required condition', html:'The copies must not overlap, so $N>2N_1$. Then $\\tilde{x}[n]=x[n]$ for $-N_1\\le n\\le N_1$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'The limit', html:'Let $N$ grow with $x$ fixed. The copies move out, and $\\tilde{x}[n]\\to x[n]$ at every $n$ as $N\\to\\infty$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'A sequence is zero outside $|n|\\le3$. It is repeated every $N$ samples.<div class="nsep"></div>Which period keeps the copies apart?',
        ask:{key:'m6-derive', choices:['$N=4$','$N=6$','$N=9$'], answer:2,
          why:'The copies stay apart only for $N>2N_1=6$.'}}]}
  ]}
]},

{ id:'m6-dtfs-link', module:'M6', nav:'Coefficients as samples', title:'DTFS Coefficients as Samples', src:'p. 64',
  objective:'Show that N·a_k is one function of ω, sampled at multiples of ω₀ = 2π/N.',
  keywords:'discrete fourier series analysis equation negative exponent envelope samples a_k N a_k spacing', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 6 · Building the transform', src:'p. 64'},
  {t:'title', text:'DTFS Coefficients as Samples'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'N', label:'$N$', min:5, max:40, step:1, v:9, show:v=>'$'+v+'$'}]},
      svg:v=>{
      const N=v?v.N:9, w0=2*PI/N, st=[];
      const a=AXW(-2.2*PI,2.2*PI,PI,{yr:[-1.9,8.2],ylabel:'Na_k',yticksOverride:[0,2,4]});
      a.curve(w=>dirich(w,2),{color:C.mid,width:1.8,dash:'7 6',n:2400});
      for(let k=-Math.floor(2*PI/w0+1e-9);k<=Math.floor(2*PI/w0+1e-9);k++) st.push([k*w0, N*dtRect(k,N,2)]);
      a.stem(st,{color:C.in,r:N>20?2.6:3.6,showZero:true});
      markPeriod(a,6.3);
      return a.svg(); },
      caption:'The stems are $Na_k$ for the pulse with $N_1=2$, repeated every $N$ samples. Move $N$: the stems crowd together on one curve.'},
    {t:'legend', items:[['in','$Na_k$'],['mid','$X(e^{j\\omega})$',true]]}
  ], right:[
    {t:'eq', tex:'a_k=\\frac{1}{N}\\sum_{n=\\langle N\\rangle}\\tilde{x}[n]\\,e^{-jk\\omega_0n}=\\frac{1}{N}\\sum_{n=-\\infty}^{\\infty}x[n]\\,e^{-jk\\omega_0n}',
      note:'Sum over the period that holds $|n|\\le N_1$. There $\\tilde{x}=x$, and $x=0$ outside it, so the sum opens to all $n$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'X(e^{j\\omega})=\\sum_{n=-\\infty}^{\\infty}x[n]\\,e^{-j\\omega n}\\quad\\Longrightarrow\\quad N\\,a_k=X(e^{jk\\omega_0})', label:'The coefficients are samples',
        note:'{{sym:Xejw|$X(e^{j\\omega})$}} is defined for every real $\\omega$ and does not depend on $N$. A larger $N$ only makes the spacing $\\omega_0=2\\pi/N$ smaller.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'The pulse has $N_1=2$ and period $N=10$.<div class="nsep"></div>What is $10\\,a_0$?',
        ask:{key:'m6-dtfs-link', choices:['$5$','$0.5$','$10$'], answer:0,
          why:'$10\\,a_0=X(e^{j0})=2N_1+1=5$, the same at every period.'}}]}
  ]}
]},

{ id:'m6-limit', module:'M6', nav:'The sum becomes an integral', title:'The Limit from DTFS to DTFT', src:'pp. 64–65',
  objective:'Carry the synthesis sum to the limit and produce the 1/2π and the one-period range explicitly.',
  keywords:'limit N infinity riemann sum integral 2pi omega0 to zero synthesis derivation one period', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 6 · Building the transform', src:'pp. 64–65'},
  {t:'title', text:'The Limit from DTFS to DTFT'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'N', label:'$N$', min:5, max:40, step:1, v:9, show:v=>'$'+v+'$'}]},
      svg:v=>{
      /* N strips of width w0 = 2pi/N, centred on k*w0, cover one period */
      const N=v?v.N:9, w0=2*PI/N, k0=-Math.floor((N-1)/2);
      const a=AXW(-2.2*PI,2.2*PI,PI,{yr:[-1.9,8.2],ylabel:'X(e^{j\\omega})',yticksOverride:[0,2,4]});
      for(let k=k0;k<k0+N;k++){ const wv=k*w0;
        a.rect(wv-w0/2,0,wv+w0/2,dirich(wv,2),{fill:C.in+'2E',stroke:C.in,width:N>20?0.6:1}); }
      a.curve(w=>dirich(w,2),{color:C.mid,width:2.4,n:2400});
      markPeriod(a,6.3);
      return a.svg(); },
      caption:'Each strip has height $X(e^{jk\\omega_0})$ and width $\\omega_0$; together they are the sum at $n=0$. $N$ strips cover one period. Move $N$: they fill the area under it.'},
    {t:'legend', items:[['in','$X(e^{jk\\omega_0})\\,\\omega_0$'],['mid','$X(e^{j\\omega})$']]}
  ], right:[
    {t:'eq', tex:'\\begin{aligned}\\tilde{x}[n]&=\\sum_{k=\\langle N\\rangle}\\frac{1}{N}\\,X(e^{jk\\omega_0})\\,e^{jk\\omega_0n}\\\\&=\\frac{1}{2\\pi}\\sum_{k=\\langle N\\rangle}X(e^{jk\\omega_0})\\,e^{jk\\omega_0n}\\,\\omega_0\\end{aligned}',
      label:'Put $a_k=\\tfrac{1}{N}X(e^{jk\\omega_0})$, then $\\tfrac{1}{N}=\\tfrac{\\omega_0}{2\\pi}$',
      note:'This is the synthesis sum of Module 4, exact at every $N$. Its $N$ strips of width $\\omega_0$ span $N\\omega_0=2\\pi$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'x[n]=\\frac{1}{2\\pi}\\int_{2\\pi}X(e^{j\\omega})\\,e^{j\\omega n}\\,\\d\\omega', label:'Let $N\\to\\infty$: the synthesis equation',
        note:'$\\tilde{x}\\to x$, and the width $\\omega_0$ becomes $\\d\\omega$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'A student integrates the synthesis equation from $-2\\pi$ to $2\\pi$.<div class="nsep"></div>What does the result equal?',
        ask:{key:'m6-limit', choices:['$x[n]$','$2x[n]$','$x[n]/2$'], answer:1,
          why:'The range holds two periods, so each one is counted twice.'}}]}
  ]}
]},

{ id:'m6-pair', module:'M6', nav:'Analysis and synthesis', title:'DTFT Analysis and Synthesis', src:'p. 65',
  objective:'Name both equations correctly and state what separates them from the continuous-time pair.',
  keywords:'DTFT pair analysis synthesis equation naming inverse transform direction one period 1/2pi', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 6 · Building the transform', src:'p. 65'},
  {t:'title', text:'DTFT Analysis and Synthesis'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>P.blocks({w:560,h:380,items:[
      {t:'box',x:24,y:70,w:176,h:74,label:'x[n]',tex:true,fs:22,color:C.in},
      {t:'box',x:360,y:70,w:176,h:74,label:'X(e^{j\\omega})',tex:true,fs:22,color:C.mid},
      {t:'arrow',x1:200,y1:92,x2:360,y2:92,label:'\\text{analysis}',tex:true,color:C.coral},
      {t:'line',d:'M360,124 L210,124',color:C.slate},
      {t:'line',d:'M200,124 l10,-5 v10 Z',color:C.slate},
      {t:'text',x:280,y:160,label:'\\text{synthesis}',tex:true,fs:17,color:C.slate},
      {t:'text',x:280,y:250,label:'\\text{sum over all }n\\;\\Rightarrow\\;\\text{a function of }\\omega',tex:true,fs:17,color:C.coral},
      {t:'text',x:280,y:310,label:'\\text{integrate over }2\\pi\\;\\Rightarrow\\;\\text{a sequence in }n',tex:true,fs:17,color:C.slate}
    ]}), caption:'The pair is written $x[n]\\leftrightarrow X(e^{j\\omega})$. Each equation removes the variable it sums or integrates over.'}
  ], right:[
    {t:'eq', tex:'X(e^{j\\omega})=\\sum_{n=-\\infty}^{\\infty}x[n]\\,e^{-j\\omega n}', label:'Analysis · the DTFT',
      note:'A sequence goes in; a spectrum comes out.'},
    {t:'eq', tex:'x[n]=\\frac{1}{2\\pi}\\int_{2\\pi}X(e^{j\\omega})\\,e^{j\\omega n}\\,\\d\\omega', label:'Synthesis · the inverse DTFT',
      note:'A spectrum goes in; a sequence comes out.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'Not the continuous-time pair', html:'The integral covers one period only. $X(e^{j\\omega})$ is a function of $e^{j\\omega}$, so it repeats every $2\\pi$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'A student writes $x[n]=\\int_{-\\infty}^{\\infty}X(e^{j\\omega})\\,e^{j\\omega n}\\,\\d\\omega$.<div class="nsep"></div>How many errors does the line contain?',
        ask:{key:'m6-pair', choices:['none','one','two'], answer:2,
          why:'The factor $1/2\\pi$ is missing, and the range must be one period of length $2\\pi$.'}}]}
  ]}
]},

{ id:'m6-pair-b', module:'M6', nav:'Existence conditions', title:'Existence of the DTFT', src:'p. 65',
  objective:'State when the analysis sum converges, and why finite support is not required.',
  keywords:'convergence absolutely summable finite energy mean square existence sufficient condition finite support', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Building the transform', src:'p. 65'},
  {t:'title', text:'Existence of the DTFT'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$(0.8)^{n}u[n]$: absolutely summable','$\\sin(\\pi n/2)/(\\pi n)$: finite energy only']},
      svg:v=>{
      /* one sequence for each case, cross-faded */
      const f=cl(v?v.frame:0);
      if(f<0.5){
        const a=AX({xr:[-4,16],yr:[-0.25,1.2],xlabel:'n',ylabel:'x[n]',yticksOverride:[0,0.5,1],xtarget:6});
        fade(a,1-2*f,()=>a.stem(D(n=>n<0?0:Math.pow(0.8,n),-4,16),{color:C.in}));
        return a.svg();
      }
      /* the samples are zero at every even n, so the tick numbers sit there,
         clear of the negative stems at odd n */
      const a=AX({xr:[-16,16],yr:[-0.25,0.62],xlabel:'n',ylabel:'x[n]',yticksOverride:[0,0.25,0.5],xticksOverride:[-12,-8,-4,4,8,12]});
      fade(a,2*f-1,()=>a.stem(D(n=>lpfInv(n,PI/2),-16,16),{color:C.in}));
      return a.svg(); },
      caption:'For $(0.8)^{n}u[n]$ the moduli add to $5$. The samples $\\sin(\\pi n/2)/(\\pi n)$ fall off like $1/|n|$: their squares add to $0.5$, their moduli have no finite sum.'}
  ], right:[
    {t:'eq', side:true, tex:'\\sum_{n=-\\infty}^{\\infty}|x[n]|<\\infty', label:'Sufficient condition',
      note:'Then the sum converges at every $\\omega$, and $X(e^{j\\omega})$ is continuous.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'Finite energy is weaker', html:'If only $\\sum|x[n]|^{2}<\\infty$, the sum converges in mean square: the energy of the error goes to zero. The transform may then have jumps.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Finite support is not needed', html:'Finite support only kept the copies apart in the construction. The pair holds whenever the analysis sum converges.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$x[n]=(0.5)^{n}u[n]$.<div class="nsep"></div>What is $\\sum_{n}|x[n]|$?',
        ask:{key:'m6-pair-b', choices:['$2$','$1$','$\\infty$'], answer:0,
          why:'A geometric series with ratio $0.5$ sums to $1/(1-0.5)=2$, so the transform exists.'}}]}
  ]}
]},

{ id:'m6-periodic', module:'M6', nav:'Periodicity of the DTFT', title:'Periodicity of the DTFT', src:'p. 65',
  objective:'Prove the 2π-periodicity and contrast it with the continuous-time case.',
  keywords:'periodicity 2pi proof e^{-j2pi n}=1 integer contrast continuous time not periodic', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Building the transform', src:'p. 65'},
  {t:'title', text:'Periodicity of the DTFT'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'w', label:'$\\omega/\\pi$', min:-1, max:1, step:0.05, v:0.3, show:v=>'$'+(Math.round(v*100)/100)+'$'}]},
      svg:v=>{
      /* one value of the spectrum, read at omega and at omega +- 2pi */
      const w=(v?v.w:0.3)*PI, X=dirich(w,2);
      const a=AXW(-3*PI,3*PI,PI,{yr:[-1.9,8.2],ylabel:'X(e^{j\\omega})',yticksOverride:[0,2,4]});
      a.curve(w=>dirich(w,2),{color:C.in,n:4000});
      a.hline(X,{color:C.mid,opacity:.6});
      for(const m of [-1,0,1]) a.point(w+2*PI*m,X,{color:C.mid});
      markPeriod(a,6.3);
      return a.svg(); },
      caption:'The spectrum of the pulse with $N_1=2$, over three periods. Move $\\omega$: the three marked points, at $\\omega$ and $\\omega\\pm2\\pi$, always share one value.'},
    {t:'legend', items:[['in','$X(e^{j\\omega})$'],['mid','$X$ at $\\omega$ and $\\omega\\pm2\\pi$']]}
  ], right:[
    {t:'eq', key:true, result:true, tex:'\\begin{aligned}X(e^{j(\\omega+2\\pi)})&=\\sum_{n=-\\infty}^{\\infty}x[n]\\,e^{-j(\\omega+2\\pi)n}\\\\&=\\sum_{n=-\\infty}^{\\infty}x[n]\\,e^{-j\\omega n}\\,\\underbrace{e^{-j2\\pi n}}_{=\\,1}=X(e^{j\\omega})\\end{aligned}',
      label:'Key result · $2\\pi$-periodicity',
      note:'The time index $n$ is an integer, so $e^{-j2\\pi n}=1$ in every term.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'Not in continuous time', html:'There $e^{-j2\\pi t}$ equals $1$ only at integer $t$, so $X(j\\omega)$ need not repeat.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'One period holds everything', html:'Any interval of length $2\\pi$ holds all of $X$. This module draws more than one period so that the repetition stays in view.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$X(e^{j\\omega})=3$ at $\\omega=\\pi/4$.<div class="nsep"></div>What is $X(e^{j\\omega})$ at $\\omega=-7\\pi/4$?',
        ask:{key:'m6-periodic', choices:['$3$','$-3$','$0$'], answer:0,
          why:'$-7\\pi/4=\\pi/4-2\\pi$, and the transform repeats every $2\\pi$.'}}]}
  ]}
]},

{ id:'m6-periodic-b', module:'M6', nav:'Frequency in discrete time', title:'Frequency in Discrete Time', src:'p. 65',
  objective:'Explain why a sequence cannot tell ω from ω + 2π, and where the high frequencies lie.',
  keywords:'discrete time frequency e^{j omega n} omega plus 2pi same samples high frequency near pi (-1)^n', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 6 · Building the transform', src:'p. 65'},
  {t:'title', text:'Frequency in Discrete Time'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$1+\\cos(0.4t)$ through the samples','$1+\\cos((0.4+2\\pi)t)$ through the same samples']},
      svg:v=>{
      /* the offset keeps every trace above the zero line, so the tick row
         under it is never crossed */
      const f=cl(v?v.frame:0);
      const a=AX({xr:[-8,8],yr:[-0.3,3.3],xlabel:'n',ylabel:'x[n]',yticksOverride:[0,1,2],xtarget:9});
      a.curve(t=>1+Math.cos(0.4*t),{color:C.in,width:1.6,dash:'9 6',n:1200});
      fade(a,f,()=>a.curve(t=>1+Math.cos((0.4+2*PI)*t),{color:C.err,width:1.4,dash:'5 4',n:3000}));
      a.stem(D(n=>1+Math.cos(0.4*n),-8,8),{color:C.in,showZero:true});
      return a.svg(); },
      caption:'The stems are $x[n]=1+\\cos(0.4n)$. Curves of frequency $0.4$ and $0.4+2\\pi$ pass through every stem, so the sequence cannot tell them apart.'},
    {t:'legend', items:[['in','$1+\\cos(0.4t)$',true],['err','$1+\\cos((0.4+2\\pi)t)$',true]]}
  ], right:[
    {t:'eq', tex:'e^{j(\\omega+2\\pi)n}=e^{j\\omega n}\\,\\underbrace{e^{j2\\pi n}}_{=\\,1}=e^{j\\omega n}', label:'Same samples',
      note:'A sequence is seen only at integer $n$. So $\\omega$ and $\\omega+2\\pi$ give the same sequence.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'High and low frequency', html:'Low frequencies lie near $\\omega=0$ and its copies at multiples of $2\\pi$. High frequencies lie near $\\omega=\\pm\\pi$; the fastest sequence is $e^{j\\pi n}=(-1)^{n}$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'Three sequences: $\\cos(0.2\\pi n)$, $\\cos(1.9\\pi n)$ and $\\cos(0.9\\pi n)$.<div class="nsep"></div>Which one changes fastest from sample to sample?',
        ask:{key:'m6-periodic-b', choices:['$\\cos(0.2\\pi n)$','$\\cos(1.9\\pi n)$','$\\cos(0.9\\pi n)$'], answer:2,
          why:'$1.9\\pi$ is $-0.1\\pi$ after a shift of $2\\pi$; only $0.9\\pi$ lies near $\\pm\\pi$.'}}]}
  ]}
]},

{ id:'m6-circle', module:'M6', nav:'Frequency on the unit circle', title:'Frequency on the Unit Circle', src:'p. 65',
  objective:'See a discrete-time frequency as a turn of a point on the unit circle, and read off why ω, ω + 2π and 2π − ω look alike.',
  keywords:'unit circle e^{j omega n} rotation turn angle per sample cos(omega n) real part omega plus 2pi alias 2pi minus omega (-1)^n fastest pi animation', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Building the transform', src:'p. 65'},
  {t:'title', text:'Frequency on the Unit Circle'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    s1Circle,
    {t:'legend', items:[['in','$e^{j\\omega n}$, $\\cos(\\omega n)$'],['err','$e^{j(\\omega+2\\pi)n}$']]}
  ], right:[
    {t:'eq', tex:'e^{j\\omega(n+1)}=e^{j\\omega n}\\,e^{j\\omega}', label:'One step, one turn',
      note:'Each step multiplies by $e^{j\\omega}$, so the point turns by $\\omega$. The red ring turns by $\\omega+2\\pi$, one full turn more, and lands on the same point.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'Fastest at $\\omega=\\pi$', html:'Set $\\omega/\\pi=1$. The point jumps between $1$ and $-1$, so the stems are $(-1)^{n}$. No sequence changes faster.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'$\\omega$ and $2\\pi-\\omega$', html:'Set $\\omega/\\pi=0.25$, then $1.75$. The point turns the other way, but its real part is the same, so the stems do not change.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'A point turns by $3\\pi/2$ at every step.<div class="nsep"></div>Which smaller turn gives the same stems $\\cos(\\omega n)$?',
        ask:{key:'m6-circle', choices:['$\\pi/2$','$3\\pi/4$','$\\pi$'], answer:0,
          why:'$2\\pi-3\\pi/2=\\pi/2$: the point turns the other way by $\\pi/2$, and its real part is the same.'}}]}
  ]}
]},

{ id:'m6-dft', module:'M6', nav:'Samples of the transform', title:'The Discrete Fourier Transform',
  objective:'Define the DFT as N equally spaced samples of the DTFT of a short sequence, and relate it to the series coefficients of its periodic extension.',
  keywords:'DFT discrete fourier transform fft samples of the DTFT omega_k 2 pi k / N N points X[k] = N a_k periodic extension short sequence four ones', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Building the transform'},
  {t:'title', text:'The Discrete Fourier Transform'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'N', label:'$N$', min:4, max:32, step:1, v:8, show:v=>'$'+v+'$'}]},
      svg:v=>{
      const N=v?v.N:8, x=[1,1,1,1], mag=w=>s1Mag(x,w);
      const a=AXW(-1.25*PI,2.25*PI,PI/2,{yr:[0,6.4],ylabel:'|X(e^{j\\omega})|',yticksOverride:[0,2,4]});
      a.curve(mag,{color:C.mid,width:1.8,dash:'7 6',n:2400});
      s1DftStems(a,N,mag,-1.25*PI,2.25*PI,N>16?2.8:3.8);
      markPeriod(a,4.7,{lo:0,hi:2*PI});
      return a.svg(); },
      caption:'Four ones, $x[n]=1$ for $0\\le n\\le3$. The stems are $|X[k]|$ at $\\omega_k=2\\pi k/N$: strong for $k=0,\\dots,N-1$, faint where they repeat. Move $N$: the stems stay on the curve.'},
    {t:'legend', items:[['in','$|X[k]|$'],['mid','$|X(e^{j\\omega})|$',true]]}
  ], right:[
    {t:'eq', key:true, tex:'X[k]=X(e^{j2\\pi k/N})=\\sum_{n=0}^{N-1}x[n]\\,e^{-j2\\pi kn/N}', label:'The DFT · $N$ samples of the DTFT',
      note:'This holds when $x[n]$ is zero outside $0\\le n\\le N-1$. The function fft computes these $N$ numbers, $k=0,\\dots,N-1$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'The same numbers as the series', html:'Repeat $x[n]$ every $N$ samples. Its series coefficients are $a_k=X[k]/N$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Too few samples', html:'Set $N=4$. The stems read $4,0,0,0$: they land on the zeros of the curve and hide its shape.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'Five ones, $x[n]=1$ for $0\\le n\\le4$, and $N=5$.<div class="nsep"></div>How many of the five values $X[k]$ are zero?',
        ask:{key:'m6-dft', choices:['$0$','$1$','$4$'], answer:2,
          why:'For $k=1,\\dots,4$ the points $2\\pi k/5$ are zeros of the curve; only $X[0]=5$ is not zero.'}}]}
  ]}
]},

{ id:'m6-dft-b', module:'M6', nav:'Zero padding · points, not detail', title:'Zero Padding and Resolution',
  objective:'See that zero padding only samples the same DTFT more densely, while a longer record narrows its peaks and separates two close frequencies.',
  keywords:'zero padding DFT resolution record length L padded length N two close cosines peak width 4 pi / L more points not more detail', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Building the transform'},
  {t:'title', text:'Zero Padding and Resolution'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'L', label:'$L$', min:8, max:48, step:1, v:12, show:v=>'$'+v+'$'},
        {k:'Z', label:'$N-L$', min:0, max:64, step:4, v:36, show:v=>'$'+v+'$'}]},
      svg:v=>{
      const L=v?v.L:12, Z=v?v.Z:36, N=L+Z, x=s1Rec(L), mag=w=>s1Mag(x,w)/L;
      return s1Stack(405, 0.58, h=>{
        const a=AXW(-1.25*PI,2.25*PI,PI/2,{h,pad:{l:52,r:24,t:16,b:28},xnameDrop:42,yr:[0,1.3],ylabel:'|X(e^{j\\omega})|/L',yticksOverride:[0,0.5,1]});
        a.curve(mag,{color:C.mid,width:1.8,dash:'7 6',n:2400});
        s1DftStems(a,N,mag,-1.25*PI,2.25*PI,N>40?2.3:3.2);
        markPeriod(a,1.0,{lo:0,hi:2*PI});
        return a.svg(); }, h=>{
        const a=AX({h,pad:{l:52,r:24,t:14,b:26},xr:[-2,114],yr:[-2.3,2.9],xlabel:'n',ylabel:'x[n]',
          yticksOverride:[-2,0,2],xticksOverride:[20,40,60,80,100]});
        a.stem(D(n=>n<L?x[n]:0,0,N-1),{color:C.in,r:2.6});
        if(Z>=16) a.span(L,N-1,2.45,'\\text{zeros}',{color:C.coral,tex:true,fs:15});
        return a.svg(); }); },
      caption:'The record $\\cos(0.3\\pi n)+\\cos(0.4\\pi n)$ has $L$ samples, then zeros up to $N$. More zeros give more stems on the same curve; a longer record changes the curve.'},
    {t:'legend', items:[['in','$|X[k]|/L$'],['mid','$|X(e^{j\\omega})|/L$',true]]}
  ], right:[
    {t:'note', kind:'warn', head:'Zero padding', html:'Zeros added to the record raise $N$. The stems move closer together, but they stay on the same curve.'},
    {t:'reveal', at:1, items:[
      {t:'eq', side:true, tex:'\\Delta\\omega=\\frac{4\\pi}{L}', label:'Width of one peak',
        note:'One cosine gives a peak this wide between its first zeros. Only more signal makes it narrower.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Two peaks', html:'The cosines are $0.1\\pi$ apart. At $L=12$ each peak is $\\pi/3$ wide and the two merge. At $L=40$ each is $0.1\\pi$ wide and they stand apart.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The same two cosines. Record A: $L=10$, padded to $N=128$. Record B: $L=30$, no padding.<div class="nsep"></div>Whose curve $|X(e^{j\\omega})|$ has two separate peaks?',
        ask:{key:'m6-dft-b', choices:['A only','B only','both'], answer:1,
          why:'Padding only adds stems to the same curve. The longer record narrows the peaks, and they part.'}}]}
  ]}
]},

realGallery({ id:'m6-real-transform', nav:'Single records around us',
  title:'Single Sequences Around Us', eyebrow:'Module 6 · Building the transform', src:'pp. 64–65',
  objective:'See everyday records that happen once: they stop or die out, and never repeat.',
  keywords:'examples conference badges downloads lightning current cooling tea single event aperiodic absolutely summable',
  figs:[
    [()=>{ const a=P.Axes(EXO({xr:[-2,9],yr:[0,520],xlabel:'n\\;(\\text{day})',ylabel:'b[n]',xstep:2,yticksOverride:[0,200,400]}));
      a.stem(D(n=>(n>=0&&n<=4)?400:0,-2,9),{color:C.in,r:3});
      return a.svg(); }, 'Badges scanned each day at a five-day conference: $b[n]=400$ for $0\\le n\\le4$.'],
    [()=>{ const a=P.Axes(EXO({xr:[-10,200],yr:[0,26],xlabel:'t\\;(\\mu\\text{s})',ylabel:'i(t)\\;(\\text{kA})',xstep:50}));
      a.curve(t=>t<0?0:30*(Math.exp(-t/50)-Math.exp(-t/5)),{color:C.in,n:2400});
      return a.svg(); }, 'A lightning stroke current: $i(t)=30\\,(e^{-t/50}-e^{-t/5})\\,u(t)$ kA, $t$ in $\\mu$s.'],
    [()=>{ const a=P.Axes(EXO({xr:[-1,12],yr:[0,5600],xlabel:'n\\;(\\text{day})',ylabel:'d[n]',xstep:2,yticksOverride:[0,2500,5000]}));
      a.stem(D(n=>n<0?0:5000*Math.pow(0.6,n),0,11),{color:C.in,r:3});
      return a.svg(); }, 'Downloads each day after an app update: $d[n]=5000\\,(0.6)^{n}u[n]$.'],
    [()=>{ const a=P.Axes(EXO({xr:[-5,60],yr:[0,70],xlabel:'t\\;(\\text{min})',ylabel:'\\Delta\\theta(t)\\;(^{\\circ}\\text{C})',xstep:15}));
      a.curve(t=>t<0?0:60*Math.exp(-t/15),{color:C.in,n:2400});
      return a.svg(); }, 'A cup of tea cooling, its temperature above the room: $\\Delta\\theta(t)=60\\,e^{-t/15}u(t)$ °C, $t$ in min.']
  ],
  notes:[
    {t:'note', kind:'def', head:'It happens once', html:'None of these records repeats. Each stops or dies out, so the two sequences are absolutely summable: $\\sum b[n]=2000$ and $\\sum d[n]=12500$.'},
    {t:'note', kind:'warn', head:'Why this matters', html:'A record that happens once is the limit of a periodic one whose period $N$ grows. Its spectrum is continuous in $\\omega$, and for a sequence it repeats every $2\\pi$.'}
  ]}),

labScene({ id:'m6-lab-i1', lab:'I1', nav:'Series to Transform', title:'From Line Spectrum to DTFT', src:'pp. 64–65',
  objective:'Let the period of a replicated sequence grow and watch N·a_k close onto the transform over more than one period.',
  keywords:'laboratory period N grows coefficients samples envelope DTFT limit riemann sum synthesis periodic 2pi' }),

codeScene({ id:'m6-code-transform', nav:'Building the transform', title:'The DTFT in Code', src:'pp. 64–65', eyebrow:'Building the transform in code',
  objective:'Build the DTFT as the limit of a series in MATLAB and in Python, and predict each result before running it.',
  keywords:'code matlab python dtft limit coefficients samples analysis sum synthesis riemann periodicity run' }),

/* </m6-s1> */

/* <m6-s2> ============================================ 6.2 the standard pairs */


/* ============================================================ shifted sample */
{ id:'m6-ex-shift', module:'M6', nav:'Worked example · shifted sample', title:'Transform of a Shifted Impulse', src:'p. 65',
  objective:'Transform a shifted unit sample and read the linear phase off the picture.',
  keywords:'worked example unit sample delta shifted transform linear phase sawtooth wrap principal value magnitude one', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Worked example', src:'p. 65'},
  {t:'title', text:'Transform of a Shifted Impulse'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$-3\\omega$: the angle as one line','$\\angle X(e^{j\\omega})$: folded into $(-\\pi,\\pi]$']},
      svg:v=>{
      /* n0 = 3: the straight phase line -3w is folded, piece by piece, into
         its principal value in (-pi, pi] */
      const f=cl(v?v.frame:0);
      const a=AXW(-3*PI,3*PI,PI,{yr:[-4.4,6.6],ylabel:'\\angle X(e^{j\\omega})\\;(\\text{rad})',xtickfmt:wPi,
        yticksOverride:[-PI,PI],ytickfmt:v=>v.toFixed(2)});
      a.curve(w=>-3*w,{color:C.in,width:1.6,dash:'9 6',n:600});
      a.curve(w=>{ const u=-3*w, r=wrap(u);
        return f>0 && Math.abs(Math.abs(r)-PI)<0.05 ? NaN : (1-f)*u+f*r; },{color:C.mid,n:6000});
      markPeriod(a,4.2);
      return a.svg(); },
      caption:'The phase of $e^{-j3\\omega}$, the transform of $\\delta[n-3]$, over three periods. Frame 2 folds the line $-3\\omega$ into $(-\\pi,\\pi]$, which gives the sawtooth.'},
    {t:'legend', items:[['in','$-3\\omega$',true],['mid','$\\angle X(e^{j\\omega})$']]}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x[n]=\\delta[n-n_0]$, a unit sample at the integer index $n_0$.<div class="nsep"></div>What is $|X(e^{j\\omega})|$?',
      ask:{key:'m6-ex-shift', choices:['$1$','$n_0$','$|n_0\\omega|$'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'<ol class="steps"><li>Put the sequence into the analysis sum.</li><li>Keep the one term where $\\delta[n-n_0]$ is not zero.</li></ol>'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'X(e^{j\\omega})=\\sum_{n=-\\infty}^{\\infty}\\delta[n-n_0]\\,e^{-j\\omega n}=e^{-j\\omega n_0}', label:'Solution',
        note:'Every term with $n\\neq n_0$ is zero. So $|X(e^{j\\omega})|=1$ and $\\angle X(e^{j\\omega})=-n_0\\omega$. At $n_0=0$ the transform is $1$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'Principal value', html:'A phase plot shows the angle in $(-\\pi,\\pi]$. The line $-n_0\\omega$ drops by $2\\pi$ every $2\\pi/|n_0|$ in $\\omega$, and each drop is folded back, so the plot is a sawtooth of period $2\\pi/|n_0|$.'}]}
  ]}
]},

/* ============================================================ a^n u[n] */
{ id:'m6-ex-anun', module:'M6', nav:'Worked example · one-sided exponential', title:'Transform of $a^{n}u[n]$', src:'p. 66',
  objective:'Transform a^n u[n] and state the condition the geometric sum needs.',
  keywords:'worked example a^n u[n] geometric series convergence |a|<1 one sided exponential transform', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Worked example', src:'p. 66'},
  {t:'title', text:'Transform of $a^{n}u[n]$'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'a', label:'$a$', min:-0.9, max:0.9, step:0.05, v:0.5, show:v=>'$'+(+v.toFixed(2))+'$'}]},
      svg:v=>{
      const av=v?v.a:0.5;
      const a=AX({xr:[-4,16],yr:[-1.1,1.3],xlabel:'n',ylabel:'x[n]',yticksOverride:[-1,-0.5,0.5,1]});
      a.stem(D(n=>n>=0?Math.pow(av,n):0,-4,16),{color:C.in,showZero:true});
      return a.svg(); },
      caption:'The sequence $a^{n}u[n]$. It is $1$ at $n=0$ and decays when $|a|<1$. A negative $a$ makes the sign alternate.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x[n]=a^{n}u[n]$, with $a$ a real constant.<div class="nsep"></div>For which $a$ does $X(e^{j\\omega})$ exist?',
      ask:{key:'m6-ex-anun', choices:['$|a|<1$','$a>0$','every $a$'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'<ol class="steps"><li>The step makes $x[n]=0$ for $n<0$, so the sum starts at $n=0$.</li><li>Write each term as a power of one ratio $r$, and sum the series.</li></ol>'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'X(e^{j\\omega})=\\sum_{n=0}^{\\infty}a^{n}e^{-j\\omega n}=\\sum_{n=0}^{\\infty}\\bigl(\\underbrace{ae^{-j\\omega}}_{r}\\bigr)^{n}', label:'The sum',
        note:'$|r|=|a|$, and an infinite geometric series converges only for $|r|<1$.'}]},
    {t:'reveal', at:3, items:[
      {t:'eq', key:true, tex:'a^{n}u[n]\\;\\longleftrightarrow\\;\\frac{1}{1-ae^{-j\\omega}},\\qquad |a|<1', label:'Solution',
        note:'The sum of $r^{n}$ from $n=0$ is $1/(1-r)$.'}]}
  ]}
]},

{ id:'m6-ex-anun-b', module:'M6', nav:'One-sided exponential · the magnitude', title:'Magnitude of the Transform of $a^{n}u[n]$', src:'pp. 66–67',
  objective:'Derive the magnitude of 1/(1−a e^{−jω}) and its largest and smallest values in closed form.',
  keywords:'magnitude extremes 1/(1-a) 1/(1+a) closed form cos omega denominator negative a', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 6 · Worked example', src:'pp. 66–67'},
  {t:'title', text:'Magnitude of the Transform of $a^{n}u[n]$'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'a', label:'$a$', min:-0.9, max:0.9, step:0.05, v:0.5, show:v=>'$'+(+v.toFixed(2))+'$'}]},
      listen:{items:[
          {label:'Play noise $x[n]$', sound:()=>({f:s2play(s2noise(12000,62)), dur:1.5})},
          {label:'Play $y[n]$', sound:v=>({f:s2play(s2first(s2noise(12000,62),v.a)), dur:1.5})}]},
      svg:v=>{
      const av=v?v.a:0.5, m=Math.abs(av), hi=1/(1-m), lo=1/(1+m);
      const a=AXW(-3*PI,3*PI,PI,{h:306,yr:[-0.14*hi,1.42*hi],ylabel:'|X(e^{j\\omega})|',pad:{l:76,r:24,t:20,b:34},
        yticksOverride:m<0.01?[1]:[lo,hi],ytickfmt:v=>''+(+v.toFixed(4))});
      if(m>=0.01){ a.hline(hi,{color:C.coral,opacity:.6}); a.hline(lo,{color:C.coral,opacity:.6}); }
      a.curve(w=>geoMag(w,av),{color:C.in,n:3000});
      markPeriod(a,1.22*hi);
      return a.svg(); },
      caption:'$|X(e^{j\\omega})|$ over three periods. The guide lines are $1/(1-|a|)$ and $1/(1+|a|)$, and the curve touches both in every period. At $8000$ samples per second ($\\omega=\\pi$ is $4$ kHz), noise through $y[n]=a\\,y[n-1]+x[n]$ sounds dull for $a>0$ and hissy for $a<0$.'}
  ], right:[
    {t:'eq', tex:'|X(e^{j\\omega})|=\\frac{1}{|1-a\\cos\\omega+ja\\sin\\omega|}=\\frac{1}{\\sqrt{1-2a\\cos\\omega+a^{2}}}', label:'Magnitude',
      note:'Use $e^{-j\\omega}=\\cos\\omega-j\\sin\\omega$. Then $(1-a\\cos\\omega)^{2}+a^{2}\\sin^{2}\\omega=1-2a\\cos\\omega+a^{2}$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'Largest and smallest', html:'The root is $|1-a|$ at $\\omega=0$ and $|1+a|$ at $\\omega=\\pm\\pi$. So $|X|$ runs from $1/(1+|a|)$ to $1/(1-|a|)$: from $\\tfrac23$ to $2$ at $a=\\tfrac12$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'$x[n]=a^{n}u[n]$ with $a=\\tfrac18$.<div class="nsep"></div>What is the largest value of $|X(e^{j\\omega})|$?',
        ask:{key:'m6-ex-anun-b', choices:['$8/7$','$8/9$','$1$'], answer:0,
          why:'At $\\omega=0$, $|X|=1/(1-\\tfrac18)=8/7\\approx1.1429$.'}}]}
  ]}
]},

{ id:'m6-ex-anun-c', module:'M6', nav:'One-sided exponential · the phase', title:'Phase of the Transform of $a^{n}u[n]$', src:'pp. 66–67',
  objective:'Find the largest phase of 1/(1−a e^{−jω}) from the circle traced by its denominator.',
  keywords:'phase arctan largest phase arcsin a tangent circle denominator complex plane geometry', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 6 · Worked example', src:'pp. 66–67'},
  {t:'title', text:'Phase of the Transform of $a^{n}u[n]$'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'w', label:'$\\omega/\\pi$', min:-1, max:1, step:0.01, v:0.33, show:v=>'$'+(+v.toFixed(2))+'$'}]},
      svg:v=>{
      /* the denominator 1 - a e^{-jw} for a = 1/2: a circle of radius a about 1 */
      const w=(v?v.w:0.33)*PI, A=0.5;
      const a=AX({xr:[-0.3,1.9],yr:[-0.8,0.8],xlabel:'\\operatorname{Re}',ylabel:'\\operatorname{Im}',
        xticksOverride:[1],yticksOverride:[-0.5,0.5],yticksLeft:false});
      const pts=[]; for(let i=0;i<=400;i++){ const u=-PI+2*PI*i/400; pts.push([geoRe(u,A),geoIm(u,A)]); }
      a.poly(pts,{color:C.mid});
      const tx=1-A*A, ty=A*Math.sqrt(1-A*A);
      a.poly([[0,0],[1.45*tx,1.45*ty]],{color:C.coral,width:1.5,dash:'5 5'});
      a.note(1.45*tx+0.03,1.45*ty,'\\arcsin a',{tex:true,color:C.coral,fs:15});
      a.poly([[0,0],[geoRe(w,A),geoIm(w,A)]],{color:C.in});
      a.point(geoRe(w,A),geoIm(w,A),{color:C.in,r:4.6});
      a.point(1,0,{color:C.muted,r:3.4});
      return a.svg(); },
      caption:'The denominator $1-ae^{-j\\omega}$ for $a=\\tfrac12$: a circle of radius $a$ about $1$. The phase of $X$ is minus the angle of the cyan ray. The dashed ray touches the circle, and its angle is the largest.'},
    {t:'legend', items:[['mid','$1-ae^{-j\\omega}$'],['in','$\\text{ray at }\\omega$']]}
  ], right:[
    {t:'eq', tex:'\\angle X(e^{j\\omega})=-\\angle\\bigl(1-ae^{-j\\omega}\\bigr)=-\\arctan\\frac{a\\sin\\omega}{1-a\\cos\\omega}', label:'Phase',
      note:'The angle of $1/D$ is minus the angle of $D$. For $|a|<1$ the real part $1-a\\cos\\omega$ is positive, so the arctangent gives the angle directly.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'Largest phase', html:'The largest angle is on the ray that touches the circle. That right triangle has hypotenuse $1$ and opposite side $|a|$, so $\\max|\\angle X|=\\arcsin|a|$, where $\\cos\\omega=a$. At $a=\\tfrac12$: $\\pi/6=0.5236$ rad, at $\\omega=\\pm\\pi/3$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'$x[n]=a^{n}u[n]$ with $a=\\tfrac18$.<div class="nsep"></div>What is the largest value of $|\\angle X(e^{j\\omega})|$?',
        ask:{key:'m6-ex-anun-c', choices:['$\\arcsin\\tfrac18$','$\\arctan\\tfrac18$','$\\pi/8$'], answer:0,
          why:'The touching ray gives $\\arcsin\\tfrac18=0.1253$ rad, where $\\cos\\omega=\\tfrac18$.'}}]}
  ]}
]},

/* ============================================================ a^{|n|} */
{ id:'m6-ex-absn', module:'M6', nav:'Worked example · two-sided exponential', title:'Transform of $a^{|n|}$', src:'p. 67',
  objective:'Transform a^{|n|} by splitting the sum at n = 0.',
  keywords:'two sided exponential a^{|n|} split the sum geometric series even sequence', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Worked example', src:'p. 67'},
  {t:'title', text:'Transform of $a^{|n|}$'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'a', label:'$a$', min:0.05, max:0.9, step:0.05, v:0.5, show:v=>'$'+(+v.toFixed(2))+'$'}]},
      svg:v=>{
      const av=v?v.a:0.5;
      const a=AX({xr:[-10,10],yr:[-0.18,1.3],xlabel:'n',ylabel:'x[n]',yticksOverride:[0.5,1]});
      a.stem(D(n=>Math.pow(av,Math.abs(n)),-10,10),{color:C.in,showZero:true});
      return a.svg(); },
      caption:'The sequence $a^{|n|}$ for $0<a<1$. It is even about $n=0$ and decays on both sides.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x[n]=a^{|n|}$, with $|a|<1$.<div class="nsep"></div>Is $X(e^{j\\omega})$ real?',
      ask:{key:'m6-ex-absn', choices:['yes','no'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'<ol class="steps"><li>Split the sum at $n=0$, where $|n|$ changes formula.</li><li>Sum each half.</li></ol>'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'X(e^{j\\omega})=\\sum_{n=0}^{\\infty}a^{n}e^{-j\\omega n}+\\sum_{n=-\\infty}^{-1}a^{-n}e^{-j\\omega n}', label:'Two halves',
        note:'For $n\\le-1$, $|n|=-n$. Put $m=-n$, from $1$ to $\\infty$.'}]},
    {t:'reveal', at:3, items:[
      {t:'eq', tex:'X(e^{j\\omega})=\\frac{1}{1-ae^{-j\\omega}}+\\frac{ae^{j\\omega}}{1-ae^{j\\omega}}', label:'Each half summed',
        note:'Ratios $ae^{\\mp j\\omega}$, modulus $|a|<1$. From $m=1$ the sum is $r/(1-r)$.'}]}
  ]}
]},

{ id:'m6-ex-absn-b', module:'M6', nav:'Two-sided exponential · the spectrum', title:'Spectrum of $a^{|n|}$', src:'p. 67',
  objective:'Combine the two halves into one real, positive transform and find its extremes.',
  keywords:'two sided exponential real positive spectrum extremes (1+a)/(1-a) (1-a)/(1+a) common denominator', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 6 · Worked example', src:'p. 67'},
  {t:'title', text:'Spectrum of $a^{|n|}$'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'a', label:'$a$', min:0.05, max:0.9, step:0.05, v:0.5, show:v=>'$'+(+v.toFixed(2))+'$'}]},
      svg:v=>{
      const av=v?v.a:0.5, hi=(1+av)/(1-av), lo=(1-av)/(1+av);
      const a=AXW(-3*PI,3*PI,PI,{yr:[-0.14*hi,1.42*hi],ylabel:'X(e^{j\\omega})',pad:{l:76,r:24,t:20,b:34},
        yticksOverride:[lo,hi],ytickfmt:v=>''+(+v.toFixed(4))});
      a.hline(hi,{color:C.coral,opacity:.6}); a.hline(lo,{color:C.coral,opacity:.6});
      a.curve(w=>twoSide(w,av),{color:C.in,n:3000});
      markPeriod(a,1.22*hi);
      return a.svg(); },
      caption:'$X(e^{j\\omega})$ over three periods. It is real and never reaches zero. The guide lines are $(1+a)/(1-a)$ and $(1-a)/(1+a)$.'}
  ], right:[
    {t:'eq', tex:'\\begin{aligned}(1-ae^{-j\\omega})(1-ae^{j\\omega})&=1-2a\\cos\\omega+a^{2}\\\\(1-ae^{j\\omega})+ae^{j\\omega}(1-ae^{-j\\omega})&=1-a^{2}\\end{aligned}', label:'Common denominator',
      note:'Expand each product and use $e^{j\\omega}+e^{-j\\omega}=2\\cos\\omega$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'a^{|n|}\\;\\longleftrightarrow\\;\\frac{1-a^{2}}{1-2a\\cos\\omega+a^{2}},\\qquad |a|<1', label:'Solution',
        note:'The imaginary parts cancel. The denominator is $|1-ae^{-j\\omega}|^{2}>0$ and $1-a^{2}>0$, so the transform is real and positive.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Largest and smallest', html:'For $0<a<1$: at $\\omega=0$, $\\frac{1-a^{2}}{(1-a)^{2}}=\\frac{1+a}{1-a}$; at $\\omega=\\pm\\pi$, $\\frac{1-a}{1+a}$. At $a=\\tfrac12$ these are $3$ and $\\tfrac13$.'}]}
  ]}
]},

/* ============================================================ rectangular pulse */
{ id:'m6-ex-rect', module:'M6', nav:'Worked example · rectangular pulse', title:'Transform of a Rectangular Sequence', src:'p. 67',
  objective:'Set up the finite geometric sum of the rectangular sequence and state the one condition it needs.',
  keywords:'rectangular pulse finite geometric sum r not 1 2N1+1 terms condition', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Worked example', src:'p. 67'},
  {t:'title', text:'Transform of a Rectangular Sequence'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=AX({xr:[-9,9],yr:[-0.2,1.5],xlabel:'n',ylabel:'x[n]',yticksOverride:[1]});
      a.stem(D(n=>Math.abs(n)<=2?1:0,-9,9),{color:C.in,showZero:true});
      a.span(-2,2,1.2,'',{color:C.slate});
      a.note(2.5,1.2,'2N_1+1=5',{tex:true,color:C.slate,fs:15});
      return a.svg(); },
      caption:'The rectangular sequence for $N_1=2$: five samples of height $1$, from $n=-2$ to $n=2$.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x[n]=1$ for $-N_1\\le n\\le N_1$ and $0$ elsewhere.<div class="nsep"></div>What is $X(e^{j0})$?',
      ask:{key:'m6-ex-rect', choices:['$2N_1+1$','$2N_1$','$1$'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'<ol class="steps"><li>Sum the $2N_1+1$ powers of $r=e^{-j\\omega}$ as a finite geometric sum.</li><li>Balance the exponents so that both ends become sines.</li></ol>'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', side:true, tex:'\\sum_{n=p}^{q}r^{n}=\\frac{r^{p}-r^{q+1}}{1-r},\\quad r\\neq1', label:'Finite geometric sum',
        note:'Only the division can fail. Here $|r|=1$, so $|r|<1$ would exclude every $\\omega$.'}]},
    {t:'reveal', at:3, items:[
      {t:'eq', tex:'X(e^{j\\omega})=\\sum_{n=-N_1}^{N_1}e^{-j\\omega n}=\\frac{e^{j\\omega N_1}-e^{-j\\omega(N_1+1)}}{1-e^{-j\\omega}}', label:'The sum',
        note:'Here $p=-N_1$, $q=N_1$ and $r=e^{-j\\omega}$.'}]}
  ]}
]},

{ id:'m6-ex-rect-b', module:'M6', nav:'Rectangular pulse · the kernel', title:'The Dirichlet Kernel', src:'p. 67',
  objective:'Balance the exponents to reach the Dirichlet kernel, and handle the points where the formula is 0/0.',
  keywords:'dirichlet kernel balance exponents 2j sin excluded points 0/0 2N1+1 real transform', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 6 · Worked example', src:'p. 67'},
  {t:'title', text:'The Dirichlet Kernel'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=AXW(-3*PI,3*PI,PI,{yr:[-2.0,7.2],ylabel:'X(e^{j\\omega})',
        yticksOverride:[-1.25,5],ytickfmt:v=>''+v});
      a.curve(w=>dirich(wrap(w),2),{color:C.in,n:5000});
      for(const k of [-1,0,1]) a.point(2*PI*k,5,{color:C.coral,r:4.4});
      markPeriod(a,6.2);
      return a.svg(); },
      caption:'The Dirichlet kernel for $N_1=2$, over three periods. The marked peaks are $2N_1+1=5$; the least value is $-1.25$.'}
  ], right:[
    {t:'eq', tex:'\\frac{e^{j\\omega N_1}-e^{-j\\omega(N_1+1)}}{1-e^{-j\\omega}}\\cdot\\frac{e^{j\\omega/2}}{e^{j\\omega/2}}=\\frac{e^{j\\omega(N_1+\\frac12)}-e^{-j\\omega(N_1+\\frac12)}}{e^{j\\omega/2}-e^{-j\\omega/2}}', label:'Balance the exponents',
      note:'Each bracket is now $e^{j\\theta}-e^{-j\\theta}=2j\\sin\\theta$: $\\theta=\\omega(N_1+\\tfrac12)$ on top and $\\theta=\\omega/2$ below.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'X(e^{j\\omega})=\\frac{\\sin\\bigl(\\omega(N_1+\\frac12)\\bigr)}{\\sin(\\omega/2)}', label:'Solution',
        note:'The factors $2j$ cancel, so the transform is real. This ratio is the <b>Dirichlet kernel</b>.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Where $r=1$', html:'At $\\omega=0,\\pm2\\pi,\\dots$ the formula is $0/0$. Go back to the sum: every term is $1$, so $X=2N_1+1$, which is $5$ for $N_1=2$.'}]}
  ]}
]},

{ id:'m6-ex-rect-c', module:'M6', nav:'Rectangular pulse · reading it', title:'Reading the Dirichlet Kernel', src:'p. 67',
  objective:'Locate the zeros of the Dirichlet kernel and compare two pulse widths.',
  keywords:'dirichlet kernel zeros 2 pi k/(2N1+1) main lobe width not a sinc periodic wider pulse narrower lobe', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · The standard pairs', src:'p. 67'},
  {t:'title', text:'Reading the Dirichlet Kernel'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$N_1=2$: peak $5$, first zero $2\\pi/5$','$N_1=4$: peak $9$, first zero $2\\pi/9$']},
      svg:v=>{
      const f=cl(v?v.frame:0);
      const a=AXW(-3*PI,3*PI,PI,{yr:[-3.2,12.4],ylabel:'X(e^{j\\omega})',
        yticksOverride:[5,9],ytickfmt:v=>''+v});
      fade(a,1-f,()=>{ a.curve(w=>dirich(wrap(w),2),{color:C.in,n:5000});
        a.point(2*PI/5,0,{color:C.err,r:4.4}); a.point(-2*PI/5,0,{color:C.err,r:4.4}); });
      fade(a,f,()=>{ a.curve(w=>dirich(wrap(w),4),{color:C.out,n:6000});
        a.point(2*PI/9,0,{color:C.err,r:4.4}); a.point(-2*PI/9,0,{color:C.err,r:4.4}); });
      markPeriod(a,10.9);
      return a.svg(); },
      caption:'The kernel for $N_1=2$ and for $N_1=4$. Red marks the first zero on each side of $\\omega=0$. Both repeat every $2\\pi$.'}
  ], right:[
    {t:'eq', tex:'\\omega=\\frac{2\\pi k}{2N_1+1},\\qquad k\\ \\text{not a multiple of}\\ 2N_1+1', label:'Zeros',
      note:'The numerator is zero where $\\omega(N_1+\\tfrac12)=\\pi k$. When $k$ is a multiple of $2N_1+1$, $\\omega$ is a multiple of $2\\pi$ and the value is the peak $2N_1+1$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'Not a sinc', html:'The denominator is $\\sin(\\omega/2)$, not $\\omega/2$. A ratio of two sines repeats every $2\\pi$. The unnormalised sinc, $\\sin\\theta/\\theta$, decays and never repeats.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Wider pulse, narrower lobe', html:'From $N_1=2$ to $N_1=4$ the peak rises from $5$ to $9$, and the first zero moves in from $2\\pi/5$ to $2\\pi/9$. The period stays $2\\pi$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'A rectangular sequence with $N_1=3$.<div class="nsep"></div>Where is the first zero of $X(e^{j\\omega})$ with $\\omega>0$?',
        ask:{key:'m6-ex-rect-c', choices:['$2\\pi/7$','$\\pi/3$','$2\\pi/3$'], answer:0,
          why:'The zeros are at $2\\pi k/(2N_1+1)$, and $2N_1+1=7$.'}}]}
  ]}
]},

/* ============================================================ real vs zero phase */
{ id:'m6-phase-real', module:'M6', nav:'Real is not zero-phase', title:'Real Spectra and Zero Phase', src:'p. 67',
  objective:'Separate real from non-negative and give the phase of a sign-changing real spectrum.',
  keywords:'real spectrum phase zero or pi misconception magnitude absolute value dirichlet negative sign change', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · The standard pairs', src:'p. 67'},
  {t:'title', text:'Real Spectra and Zero Phase'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$X(e^{j\\omega})$: real, changes sign','$|X(e^{j\\omega})|$: the negative lobes folded up']},
      svg:v=>{
      /* the Dirichlet kernel for N1 = 2 turns into its magnitude */
      const f=cl(v?v.frame:0), X=w=>dirich(wrap(w),2);
      const g=w=>{ const x=X(w); return x<0 ? (1-2*f)*x : x; };
      const a=AXW(-3*PI,3*PI,PI,{yr:[-2.0,7.9],ylabel:f<0.5?'X(e^{j\\omega})':'|X(e^{j\\omega})|',
        yticksOverride:[-1.25,1.25,5],ytickfmt:v=>''+v});
      a.curve(w=>X(w)>=0?g(w):NaN,{color:C.in,n:6000});
      a.curve(w=>X(w)<0?g(w):NaN,{color:C.err,n:6000});
      markPeriod(a,6.0);
      return a.svg(); },
      caption:'The kernel for $N_1=2$. Red marks the lobes where $X<0$: there the angle is $\\pi$. Taking the magnitude folds them above the axis.'},
    {t:'legend', items:[['in','$X\\ge0$'],['err','$X<0$']]}
  ], right:[
    {t:'note', kind:'err', head:'The claim to reject', html:'“$X(e^{j\\omega})$ is real, so $\\angle X(e^{j\\omega})=0$.” Realness says the imaginary part is zero. The angle depends on the sign, and realness does not fix the sign.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'X\\ \\text{real}:\\qquad \\angle X=\\begin{cases}0,&X>0\\\\ \\pi,&X<0\\end{cases}\\qquad |X|=\\begin{cases}X,&X\\ge0\\\\ -X,&X<0\\end{cases}', label:'What realness gives',
        note:'The Dirichlet kernel is real and negative on part of every period. For $N_1=2$ its least value is $-1.25$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Contrast', html:'The transform of $a^{|n|}$ is real <b>and</b> positive, so there $|X|=X$ and $\\angle X=0$. Positivity gives zero phase; realness alone does not.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'For $N_1=2$ the kernel at $\\omega=0.6\\pi$ is $-1.236$.<div class="nsep"></div>What is $\\angle X(e^{j\\omega})$ at $\\omega=0.6\\pi$?',
        ask:{key:'m6-phase-real', choices:['$\\pi$','$0$','$-1.236$ rad'], answer:0,
          why:'A negative real number has angle $\\pi$.'}}]}
  ]}
]},

/* ============================================================ ideal low-pass */
{ id:'m6-ex-lpf', module:'M6', nav:'Worked example · ideal low-pass', title:'Inverse Transform of an Ideal Low-Pass Band', src:'p. 68',
  objective:'Invert the ideal discrete-time low-pass spectrum over one period.',
  keywords:'ideal low pass inverse transform synthesis integral one period sin(Wn)/(pi n) W/pi cutoff', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Worked example', src:'p. 68'},
  {t:'title', text:'Inverse Transform of an Ideal Low-Pass Band'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'W', label:'$W/\\pi$', min:0.1, max:1, step:0.05, v:0.25, show:v=>'$'+(+v.toFixed(2))+'$'}]},
      listen:{items:[
          {label:'Play noise', sound:()=>({f:s2play(s2noise(12000,68)), dur:1.5})},
          {label:'Play the band $|\\omega|\\le W$', sound:v=>({f:s2play(s2band(12000,v.W*PI,68)), dur:1.5})}]},
      svg:v=>{
      const W=(v?v.W:0.25)*PI;
      const a=AXW(-3*PI,3*PI,PI,{h:350,yr:[-0.28,1.72],ylabel:'X(e^{j\\omega})',yticksOverride:[1]});
      a.curve(w=>lpf(w,W),{color:C.in,n:8000});
      markPeriod(a,1.38);
      return a.svg(); },
      caption:'The ideal low-pass spectrum, $1$ on $|\\omega|\\le W$ in each period, drawn over three periods. The band repeats; it does not stop at $\\pm\\pi$. At $8000$ samples per second, $\\omega=\\pi$ is $4$ kHz and the band keeps the noise below $4W/\\pi$ kHz.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$X(e^{j\\omega})=1$ for $|\\omega|\\le W$ and $0$ for $W<|\\omega|\\le\\pi$, repeated every $2\\pi$.<div class="nsep"></div>What is $x[0]$?',
      ask:{key:'m6-ex-lpf', choices:['$W/\\pi$','$2W$','$1$'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'<ol class="steps"><li>Use the synthesis integral over the period $-\\pi\\le\\omega\\le\\pi$.</li><li>Integrate $e^{j\\omega n}$ over the band $|\\omega|\\le W$ only.</li></ol>'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'x[n]=\\frac{1}{2\\pi}\\int_{-W}^{W}e^{j\\omega n}\\,\\d\\omega=\\frac{1}{2\\pi}\\left[\\frac{e^{j\\omega n}}{jn}\\right]_{-W}^{W}=\\frac{1}{2\\pi}\\cdot\\frac{e^{jWn}-e^{-jWn}}{jn}', label:'The integral',
        note:'For $n\\neq0$. At $n=0$ the integral is $2W$, so $x[0]=W/\\pi$.'}]},
    {t:'reveal', at:3, items:[
      {t:'eq', key:true, tex:'x[n]=\\frac{\\sin(Wn)}{\\pi n},\\qquad x[0]=\\frac{W}{\\pi}', label:'Solution',
        note:'Use $e^{j\\theta}-e^{-j\\theta}=2j\\sin\\theta$ with $\\theta=Wn$.'}]}
  ]}
]},

{ id:'m6-ex-lpf-b', module:'M6', nav:'Ideal low-pass · the sequence', title:'The Ideal Low-Pass Sequence', src:'p. 68',
  objective:'Write the low-pass sequence with the course sinc, check its prefactor, and relate band width to length.',
  keywords:'ideal low pass sequence sinc unnormalised convention W/pi prefactor band width decay delta', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · The standard pairs', src:'p. 68'},
  {t:'title', text:'The Ideal Low-Pass Sequence'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'W', label:'$W/\\pi$', min:0.1, max:1, step:0.05, v:0.25, show:v=>'$'+(+v.toFixed(2))+'$'}]},
      svg:v=>{
      const k=v?v.W:0.25, W=k*PI;
      const a=AX({xr:[-16,16],yr:[-0.3*k-0.03,1.3*k],xlabel:'n',ylabel:'x[n]',
        yticksOverride:[k],ytickfmt:v=>''+(+v.toFixed(4))});
      a.stem(D(n=>lpfInv(n,W),-16,16),{color:C.in,showZero:true});
      a.point(0,k,{color:C.coral,r:4.4});
      return a.svg(); },
      caption:'$x[n]=\\sin(Wn)/(\\pi n)$. The marked sample is $x[0]=W/\\pi$. Widen the band and the sequence gets shorter.'}
  ], right:[
    {t:'note', kind:'def', head:'Sinc convention', html:'With the unnormalised sinc, $\\operatorname{sinc}\\theta=\\sin\\theta/\\theta$, the same sequence is $x[n]=\\frac{W}{\\pi}\\operatorname{sinc}(Wn)$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'err', head:'A lost $\\pi$', html:'$\\sin(Wn)/n$ drops the $\\pi$ and is $\\pi$ times too large. For $W=\\pi/4$, $x[1]=0.225079$, not $0.707107$. Check $x[0]$: it must equal $W/\\pi$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Band and length', html:'A narrow band gives a slowly decaying sequence, and a wide band a short one. At $W=\\pi$ the band fills the period and $x[n]=\\delta[n]$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'An ideal low-pass band with $W=\\pi/2$.<div class="nsep"></div>What is $x[2]$?',
        ask:{key:'m6-ex-lpf-b', choices:['$0$','$1/(2\\pi)$','$1/2$'], answer:0,
          why:'$x[2]=\\sin(\\pi)/(2\\pi)=0$.'}}]}
  ]}
]},

realGallery({ id:'m6-real-pairs', nav:'Standard pairs around us',
  title:'Standard Pairs Around Us', eyebrow:'Module 6 · The standard pairs', src:'pp. 65–68',
  objective:'Meet the standard sequences of this section in everyday records.',
  keywords:'examples capacitor discharge meter rainfall window car headlights sensor two-sided geiger counter click unit sample',
  figs:[
    [()=>{ const a=P.Axes(EXO({xr:[-3,15],yr:[0,6.2],xlabel:'n\\;(\\text{ms})',ylabel:'v[n]\\;(\\text{V})',xstep:3,yticksLeft:true}));
      a.stem(D(n=>n>=0?5*Math.pow(0.8,n):0,-2,14),{color:C.in,r:3});
      return a.svg(); }, 'A capacitor discharging, read by a meter once a millisecond: $v[n]=5(0.8)^{n}u[n]$ V.'],
    [()=>{ const a=P.Axes(EXO({xr:[-6,6],yr:[0,5.2],xlabel:'n\\;(\\text{h})',ylabel:'r[n]\\;(\\text{mm})',xstep:2,yticksLeft:true}));
      a.stem(D(n=>Math.abs(n)<=2?4:0,-6,6),{color:C.in,r:3});
      return a.svg(); }, 'Rain in each hour of a five-hour storm: $r[n]=4$ mm for $|n|\\le2$.'],
    [()=>{ const a=P.Axes(EXO({xr:[-5,5],yr:[-15,245],xlabel:'t\\;(\\text{s})',ylabel:'L(t)\\;(\\text{lx})',yticksLeft:true}));
      a.curve(t=>200*Math.exp(-Math.abs(t)),{color:C.in,n:2400});
      return a.svg(); }, 'Light on a roadside sensor as a car passes at $t=0$: $L(t)=200e^{-|t|}$ lx.'],
    [()=>{ const a=P.Axes(EXO({xr:[-2,9],yr:[0,1.3],xlabel:'n\\;(\\text{s})',ylabel:'c[n]\\;(\\text{counts})',xstep:2,yticksOverride:[1],yticksLeft:true}));
      a.stem(D(n=>n===3?1:0,-2,9),{color:C.in,r:3});
      return a.svg(); }, 'A Geiger counter records one click in second $3$: $c[n]=\\delta[n-3]$.']
  ],
  notes:[
    {t:'note', kind:'def', head:'Four standard shapes', html:'A one-sided decay, a window, a two-sided decay and a single event. Read at integer steps, each has a transform from this section, and each transform repeats every $2\\pi$.'},
    {t:'note', kind:'warn', head:'Why this matters', html:'Most problems start from one of these pairs. A property then turns it into the transform that is needed.'}
  ]}),

labScene({ id:'m6-lab-i', lab:'I', nav:'Standard Pairs', title:'The Standard Pairs Explorer', src:'pp. 65–68',
  objective:'Change one parameter of a standard sequence and watch its transform over three periods.',
  keywords:'laboratory DTFT standard pairs unit sample shifted sample rectangular window dirichlet exponential two-sided ideal low pass periodicity' }),

codeScene({ id:'m6-code-pairs', nav:'Standard pairs', title:'Standard Pairs in Code', src:'pp. 65–68', eyebrow:'Standard pairs in code',
  objective:'Compute the standard DTFT pairs numerically in MATLAB and in Python, and predict each result before running it.',
  keywords:'code matlab python dtft pairs shifted sample exponential rectangular dirichlet ideal low pass run' }),


/* </m6-s2> */

/* <m6-s3> ============================================ 6.3 periodic sequences */


/* ============================================================ complex exponential */
{ id:'m6-cexp', module:'M6', nav:'Transform of a complex exponential', title:'Transform of a Complex Exponential', src:'p. 68',
  objective:'State and prove the impulse-train transform of a discrete-time complex exponential.',
  keywords:'complex exponential impulse train 2pi delta transform periodic copies sifting weight height synthesis', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 6 · Periodic sequences', src:'p. 68'},
  {t:'title', text:'Transform of a Complex Exponential'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'w', label:'$\\omega_0/\\pi$', min:-1, max:3, step:0.25, v:0.25, show:v=>'$'+v+'$'}]},
      svg:v=>{
      const w0=(v?v.w:0.25)*PI;
      const a=s3SP([-0.9,8.6],{yticksOverride:[0,2*PI],ytickfmt:piTick});
      s3train(a,w0,2*PI,{color:C.in});
      markPeriod(a,7.6);
      return a.svg(); },
      caption:'Weight $2\\pi$ at $\\omega_0+2\\pi k$ for every integer $k$; the arrow height is the weight. Move $\\omega_0$: a shift of $2\\pi$ lands the train on itself.'}
  ], right:[
    {t:'eq', tex:'e^{j\\omega_0 n}\\;\\longleftrightarrow\\;\\sum_{k=-\\infty}^{\\infty}2\\pi\\,\\delta(\\omega-\\omega_0-2\\pi k)', label:'Transform pair',
      note:'The sum $\\sum_n|e^{j\\omega_0 n}|$ diverges, so the transform is a train of impulses. It repeats every $2\\pi$ because $e^{j(\\omega_0+2\\pi)n}=e^{j\\omega_0 n}$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi}2\\pi\\,\\delta(\\omega-\\omega_0)\\,e^{j\\omega n}\\,\\d\\omega=e^{j\\omega_0 n}', label:'Check with the synthesis equation',
        note:'Integrate over $-\\pi<\\omega\\le\\pi$ with $\\omega_0$ inside. Only the $k=0$ impulse lies there, and sifting sets $\\omega=\\omega_0$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'$x[n]=3e^{j(\\pi/2)n}$.<div class="nsep"></div>What weight does each impulse carry?',
        ask:{key:'m6-cexp', choices:['$6\\pi$','$3$','$2\\pi$'], answer:0,
          why:'The factor $3$ multiplies the pair, so each weight is $3\\cdot2\\pi=6\\pi$.'}}]}
  ]}
]},

/* ============================================================ periodic sequences */
{ id:'m6-dt-periodic', module:'M6', nav:'Transform of a periodic sequence', title:'Transform of a Periodic Sequence', src:'pp. 68–69',
  objective:'Turn a discrete-time Fourier series into a train of impulses of weight 2π a_k.',
  keywords:'periodic sequence impulse spectrum 2pi a_k delta harmonics N impulses per period series term by term', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 6 · Periodic sequences', src:'pp. 68–69'},
  {t:'title', text:'Transform of a Periodic Sequence'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$x[n]$: period $N=4$','$X(e^{j\\omega})$: weights $2\\pi a_k$']},
      svg:v=>{
      /* x[n] = 1 + cos(pi n/2) + (1/4)(-1)^n, so a_0..a_3 = 1, 1/2, 1/4, 1/2 */
      const f=cl(v?v.frame:0), ak=[1,0.5,0.25,0.5];
      if(f<0.5){
        const a=AX({xr:[-9,13],yr:[-0.4,3.1],xlabel:'n',ylabel:'x[n]',yticksOverride:[0,1,2],xtarget:8});
        fade(a,1-2*f,()=>{
          a.stem(D(n=>1+Math.cos(PI*n/2)+0.25*(n%2===0?1:-1),-9,13),{color:C.in});
          a.span(0,4,2.65,'N=4',{tex:true,color:C.coral}); });
        return a.svg();
      }
      const a=s3SP([-0.9,8.6],{yticksOverride:[0,PI/2,PI,2*PI],ytickfmt:piTick});
      fade(a,2*f-1,()=>{
        for(let k=-5;k<=5;k++) a.impulse(k*PI/2,2*PI*ak[((k%4)+4)%4],{color:C.in,label:false});
        markPeriod(a,7.6); });
      return a.svg(); },
      caption:'$x[n]=1+\\cos(\\pi n/2)+\\tfrac14(-1)^n$ has $N=4$ and $a_0,a_1,a_2,a_3=1,\\tfrac12,\\tfrac14,\\tfrac12$. Its transform has four impulses in each period, $\\pi/2$ apart, of weights $2\\pi$, $\\pi$, $\\pi/2$, $\\pi$.'}
  ], right:[
    {t:'eq', tex:'\\begin{aligned}x[n]&=\\sum_{k=0}^{N-1}a_k\\,e^{jk(2\\pi/N)n}\\\\X(e^{j\\omega})&=\\sum_{k=0}^{N-1}a_k\\sum_{l=-\\infty}^{\\infty}2\\pi\\,\\delta\\!\\left(\\omega-\\frac{2\\pi(k+lN)}{N}\\right)\\end{aligned}', label:'Transform the series term by term',
      note:'Linearity, and the pair of the last slide with $\\omega_0=2\\pi k/N$ for each term.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, result:true, tex:'X(e^{j\\omega})=\\sum_{k=-\\infty}^{\\infty}2\\pi a_k\\,\\delta\\!\\left(\\omega-\\frac{2\\pi k}{N}\\right)', label:'Key result · Transform of a periodic sequence',
        note:'Put $m=k+lN$ and use $a_{k+lN}=a_k$: one sum over all $m$, renamed $k$. The impulses are $2\\pi/N$ apart, $N$ to a period.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'A sequence has period $N=6$.<div class="nsep"></div>How far apart are the impulses of its transform?',
        ask:{key:'m6-dt-periodic', choices:['$\\pi/3$','$\\pi/6$','$6$'], answer:0,
          why:'The spacing is $2\\pi/N=2\\pi/6=\\pi/3$.'}}]}
  ]}
]},

{ id:'m6-dt-periodic-b', module:'M6', nav:'Cosine and sine sequences', title:'Cosine and Sine Sequences', src:'pp. 68–69',
  objective:'Transform a cosine and a sine sequence and keep both signs of frequency.',
  keywords:'cosine sine sequence transform impulses pi pi/j imaginary odd both signs of frequency euler', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Periodic sequences', src:'pp. 68–69'},
  {t:'title', text:'Cosine and Sine Sequences'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$\\cos(\\pi n/4)$: weights $\\pi$','$\\sin(\\pi n/4)$: weights $\\mp j\\pi$']},
      svg:v=>{
      const f=cl(v?v.frame:0);
      if(f<0.5){
        const a=s3SP([-0.9,4.9],{yticksOverride:[0,PI],ytickfmt:piTick});
        fade(a,1-2*f,()=>{
          for(const s of [1,-1]) s3train(a,s*PI/4,PI,{color:C.in});
          markPeriod(a,4.25); });
        return a.svg();
      }
      const a=s3SP([-4.6,4.9],{ylabel:'\\operatorname{Im}\\{X(e^{j\\omega})\\}',yticksOverride:[-PI,PI],ytickfmt:piTick,xtickfmt:wPi});
      fade(a,2*f-1,()=>{
        for(const s of [1,-1]) s3train(a,s*PI/4,-s*PI,{color:C.in});
        markPeriod(a,4.25); });
      return a.svg(); },
      caption:'For $\\cos(\\pi n/4)$: weight $\\pi$ at $\\pm\\pi/4$ and at every copy $2\\pi$ away. For $\\sin(\\pi n/4)$: $-j\\pi$ at $\\pi/4$ and $+j\\pi$ at $-\\pi/4$, drawn as the imaginary part.'}
  ], right:[
    {t:'eq', tex:'\\begin{aligned}\\cos\\omega_0 n&=\\tfrac12e^{j\\omega_0n}+\\tfrac12e^{-j\\omega_0n}\\\\&\\longleftrightarrow\\;\\underbrace{\\tfrac12\\cdot2\\pi}_{\\pi}\\sum_{k=-\\infty}^{\\infty}\\bigl[\\delta(\\omega-\\omega_0-2\\pi k)+\\delta(\\omega+\\omega_0-2\\pi k)\\bigr]\\end{aligned}', label:'Cosine'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\sin\\omega_0 n\\;\\longleftrightarrow\\;\\frac{\\pi}{j}\\sum_{k=-\\infty}^{\\infty}\\bigl[\\delta(\\omega-\\omega_0-2\\pi k)-\\delta(\\omega+\\omega_0-2\\pi k)\\bigr]', label:'Sine',
        note:'Same steps with $\\tfrac{1}{2j}$: the weight $\\pi/j=-j\\pi$ is imaginary.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Keep both signs of frequency', html:'Without its twin at $-\\omega_0$, the impulse at $+\\omega_0$ gives $\\tfrac12e^{j\\omega_0n}$, a complex sequence.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$x[n]=3\\cos(\\pi n/3)$.<div class="nsep"></div>What weight sits at $\\omega=\\pi/3$?',
        ask:{key:'m6-dt-periodic-b', choices:['$3\\pi$','$6\\pi$','$3/2$'], answer:0,
          why:'The cosine pair gives $\\pi$, and the amplitude $3$ makes it $3\\pi$.'}}]}
  ]}
]},

/* ============================================================ square wave */
{ id:'m6-sqwave', module:'M6', nav:'Periodic square wave', title:'Line Spectrum of a Square Wave', src:'p. 69',
  objective:'Compute the square-wave impulse weights and draw them unequal, with their signs.',
  keywords:'periodic square wave coefficients impulse weights unequal negative zero N=10 N1=2 dirichlet', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Periodic sequences', src:'p. 69'},
  {t:'title', text:'Line Spectrum of a Square Wave'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$x[n]$: $N=10$, $N_1=2$','$X(e^{j\\omega})$: weights $2\\pi a_k$']},
      svg:v=>{
      const f=cl(v?v.frame:0);
      if(f<0.5){
        const a=AX({xr:[-13,23],yr:[-0.3,1.55],xlabel:'n',ylabel:'x[n]',yticksOverride:[0,1],xtarget:8});
        fade(a,1-2*f,()=>{
          a.stem(D(n=>s3sq(n,10,2),-13,23),{color:C.in});
          a.span(0,10,1.3,'N=10',{tex:true,color:C.coral}); });
        return a.svg();
      }
      const a=s3SP([-1.3,4.3],{yticksOverride:[-0.7766,2.0333,PI],ytickfmt:v=>v.toFixed(2),xtickfmt:wPi});
      fade(a,2*f-1,()=>{ s3sqLines(a,10,2); markPeriod(a,3.75); });
      return a.svg(); },
      caption:'The square wave is $1$ on $|n|\\le2$ in each period of $10$. In its spectrum the weights at $\\pm2\\pi/5$ and $\\pm4\\pi/5$ are zero, and the arrows at $\\pm3\\pi/5$ point down.'}
  ], right:[
    {t:'eq', tex:'a_k=\\frac{1}{N}\\,\\frac{\\sin\\bigl(2\\pi k(N_1+\\frac12)/N\\bigr)}{\\sin(\\pi k/N)},\\qquad a_0=\\frac{2N_1+1}{N}', label:'Series coefficients',
      note:'Found in Module 4. The $a_0$ form holds whenever $N$ divides $k$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\begin{aligned}2\\pi a_0&=2\\pi\\cdot\\tfrac{5}{10}=\\pi=3.1416\\\\2\\pi a_{\\pm1}&=2.0333,\\qquad 2\\pi a_{\\pm3}=-0.7766\\end{aligned}', label:'Impulse weights · $N=10$, $N_1=2$',
        note:'The weights at $k=\\pm2,\\pm4$ are zero, and $2\\pi a_5=0.6283$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Draw the weights as they are', html:'Weights differ, some are zero, and a negative weight points down.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The same wave with $N_1=3$, still $N=10$.<div class="nsep"></div>What weight sits at $\\omega=0$?',
        ask:{key:'m6-sqwave', choices:['$7\\pi/5$','$\\pi$','$7\\pi/10$'], answer:0,
          why:'$2\\pi a_0=2\\pi\\cdot7/10=7\\pi/5$.'}}]}
  ]}
]},

{ id:'m6-sqwave-b', module:'M6', nav:'Square wave · a longer period', title:'Square Wave with a Longer Period', src:'p. 69',
  objective:'See the square-wave weights as samples of one envelope that shrink like 1/N.',
  keywords:'square wave longer period envelope dirichlet kernel samples weights shrink 1/N spacing 2pi/N', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 6 · Periodic sequences', src:'p. 69'},
  {t:'title', text:'Square Wave with a Longer Period'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'N', label:'$N$', min:10, max:40, step:1, v:10, show:v=>'$'+v+'$'}]},
      svg:v=>{
      const N=v?v.N:10;
      const a=s3SP([-1.0,4.8],{yticksOverride:[0,1,2,3],ytickfmt:v=>String(v),xtickfmt:wPi});
      a.curve(w=>2*PI*dirich(wrap(w),2)/N,{color:C.mid,width:1.6,dash:'7 6',n:4000});
      s3sqLines(a,N,2,{width:N>24?1.5:2.1});
      markPeriod(a,3.9);
      return a.svg(); },
      caption:'$N_1=2$. Move $N$: the impulses crowd together and shrink, and they stay on one dashed curve.'},
    {t:'legend', items:[['in','$2\\pi a_k$'],['mid','$\\text{envelope}$',true]]}
  ], right:[
    {t:'eq', tex:'2\\pi a_k=\\frac{2\\pi}{N}\\,\\underbrace{\\frac{\\sin\\bigl(\\omega(N_1+\\frac12)\\bigr)}{\\sin(\\omega/2)}}_{\\text{envelope}}\\Bigg|_{\\omega=2\\pi k/N}', label:'Weights on one curve',
      note:'Put $\\omega=2\\pi k/N$ into the envelope and the coefficient formula comes back. The envelope is the transform of one pulse, $1$ on $|n|\\le N_1$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'As $N$ grows', html:'The spacing $2\\pi/N$ and every weight shrink like $1/N$. The envelope keeps its shape.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'$N_1=2$ and $N=50$.<div class="nsep"></div>What weight sits at $\\omega=0$?',
        ask:{key:'m6-sqwave-b', choices:['$\\pi/5$','$\\pi$','$2\\pi/5$'], answer:0,
          why:'$2\\pi a_0=2\\pi\\cdot5/50=\\pi/5$.'}}]}
  ]}
]},

/* ============================================================ impulse train */
{ id:'m6-ex-imptrain', module:'M6', nav:'Worked example · impulse train', title:'Transform of an Impulse Train', src:'p. 70',
  objective:'Transform the unit-sample train and keep the summation index apart from the sequence index.',
  keywords:'impulse train delta[n-mN] coefficients 1/N transform 2pi/N index summation variable worked example', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Worked example', src:'p. 70'},
  {t:'title', text:'Transform of an Impulse Train'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$x[n]$: $N=5$','$X(e^{j\\omega})$: weight $2\\pi/5$']},
      svg:v=>{
      const f=cl(v?v.frame:0);
      if(f<0.5){
        const a=AX({xr:[-12,13],yr:[-0.3,1.5],xlabel:'n',ylabel:'x[n]',yticksOverride:[0,1],xtarget:8});
        fade(a,1-2*f,()=>{
          a.stem(D(n=>s3imp(n,5),-12,13),{color:C.in});
          a.span(0,5,1.25,'N=5',{tex:true,color:C.coral}); });
        return a.svg();
      }
      const a=s3SP([-0.35,1.95],{yticksOverride:[0,2*PI/5],ytickfmt:v=>v.toFixed(4)});
      fade(a,2*f-1,()=>{
        for(let k=-7;k<=7;k++) a.impulse(2*PI*k/5,2*PI/5,{color:C.in,label:false});
        markPeriod(a,1.65); });
      return a.svg(); },
      caption:'A unit sample every $5$ indices, and its transform: impulses of weight $2\\pi/5$, spaced $2\\pi/5$ apart, five to a period.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x[n]=\\sum_{m=-\\infty}^{\\infty}\\delta[n-mN]$, a unit sample every $N$ indices. Find $a_k$ and $X(e^{j\\omega})$.<div class="nsep"></div>If $N$ doubles, each impulse weight',
      ask:{key:'m6-ex-imptrain', choices:['halves','doubles','stays the same'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'<ol class="steps"><li>Find $a_k$ over $0\\le n\\le N-1$, where only $x[0]=1$ is nonzero.</li><li>Use $X(e^{j\\omega})=\\sum_k2\\pi a_k\\,\\delta(\\omega-2\\pi k/N)$.</li></ol>'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'a_k=\\frac{1}{N}\\sum_{n=0}^{N-1}x[n]\\,e^{-jk(2\\pi/N)n}=\\frac{1}{N}\\,x[0]\\,e^{0}=\\frac{1}{N}', label:'Coefficients'}]},
    {t:'reveal', at:3, items:[
      {t:'eq', key:true, tex:'X(e^{j\\omega})=\\frac{2\\pi}{N}\\sum_{k=-\\infty}^{\\infty}\\delta\\!\\left(\\omega-\\frac{2\\pi k}{N}\\right)', label:'Solution',
        note:'Every weight is $2\\pi a_k=2\\pi/N$, which is $1.2566$ for $N=5$.'}]}
  ]}
]},

{ id:'m6-ex-imptrain-b', module:'M6', nav:'Impulse train · weights and spacing', title:'Impulse Train Weights and Spacing', src:'p. 70',
  objective:'Read the weights and the spacing of the impulse-train transform as N changes.',
  keywords:'impulse train weight spacing 2pi/N sparse dense check sum of weights 2pi index clash common error', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 6 · Worked example', src:'p. 70'},
  {t:'title', text:'Impulse Train Weights and Spacing'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'N', label:'$N$', min:3, max:16, step:1, v:5, show:v=>'$'+v+'$'}]},
      svg:v=>{
      const N=v?v.N:5;
      const a=s3SP([-0.35,2.75],{yticksOverride:[0,2*PI/N],ytickfmt:v=>v.toFixed(4)});
      for(let k=-Math.ceil(1.5*N)+1;k<=Math.ceil(1.5*N)-1;k++) a.impulse(2*PI*k/N,2*PI/N,{color:C.in,label:false,width:N>10?1.6:2.1});
      markPeriod(a,2.4);
      return a.svg(); },
      caption:'The transform of a unit sample every $N$ indices. Move $N$: the impulses come closer together and shorter, and each period holds $N$ of them.'}
  ], right:[
    {t:'eq', tex:'\\frac{2\\pi}{5}=1.2566,\\qquad\\frac{2\\pi}{10}=0.6283,\\qquad\\frac{2\\pi}{15}=0.4189', label:'Weights',
      note:'A sparser train in time gives a denser train in frequency, with smaller impulses.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Check', html:'One period holds $N$ impulses of weight $2\\pi/N$, so they add to $2\\pi$ for every $N$. The synthesis equation at $n=0$ asks for exactly $2\\pi\\,x[0]=2\\pi$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Common error', html:'Writing the train as $\\sum_n\\delta[n-nN]$. Then $n$ has two jobs in one line; the copies need their own index.'}]}
  ]}
]},

/* ============================================================ two cosines */
{ id:'m6-ex-cos', module:'M6', nav:'Worked example · two cosines', title:'Reducing a Frequency into Range', src:'pp. 70–71',
  objective:'Reduce two out-of-range frequencies into one period before placing the impulses.',
  keywords:'worked example two cosines 5pi/3 7pi/4 reduce frequency into range pi/3 pi/4 same samples', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Worked example', src:'pp. 70–71'},
  {t:'title', text:'Reducing a Frequency into Range'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$2\\cos(5\\pi n/3)$ on a fast curve','the same stems on $2\\cos(\\pi t/3)$','$\\cos(7\\pi n/4)$ on a fast curve','the same stems on $\\cos(\\pi t/4)$']},
      svg:v=>{
      /* each term drawn with a fast guide curve at its given frequency, then
         a slow one at the reduced frequency; the stems never move */
      const f=Math.max(0,Math.min(3,v?v.frame:0));
      const T=[{A:2,w:5*PI/3,r:PI/3,lab:'x_1[n]'},{A:1,w:7*PI/4,r:PI/4,lab:'x_2[n]'}];
      const i=f<1.5?0:1, s=T[i], g=f-2*i;
      const a=AX({xr:[-9,9],yr:[-2.6,2.9],xlabel:'n',ylabel:s.lab,yticksOverride:[-2,-1,1,2],xticksOverride:i===0?[-6,6]:[-8,8]});
      const o=i===0 ? 1-cl(4*(f-1.25)) : cl(4*(f-1.5));
      fade(a,o*(1-cl(g)),()=>a.curve(t=>s.A*Math.cos(s.w*t),{color:C.muted,width:1.3,dash:'4 5',n:3000}));
      fade(a,o*cl(g),()=>a.curve(t=>s.A*Math.cos(s.r*t),{color:C.mid,width:1.8,dash:'7 6',n:1500}));
      fade(a,o,()=>a.stem(D(n=>s.A*Math.cos(s.w*n),-9,9),{color:C.in}));
      return a.svg(); },
      caption:'The dashed curves are guides through the samples, not signals. Each set of stems lies on the fast curve and on the slow one.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x[n]=2\\cos\\!\\left(\\tfrac{5\\pi}{3}n\\right)+\\cos\\!\\left(\\tfrac{7\\pi}{4}n\\right)$. Find $X(e^{j\\omega})$.<div class="nsep"></div>In $-\\pi<\\omega\\le\\pi$, the impulses of the first term sit at',
      ask:{key:'m6-ex-cos', choices:['$\\pm\\pi/3$','$\\pm5\\pi/3$','$\\pm2\\pi/3$'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'<ol class="steps"><li>Subtract $2\\pi$ to bring each frequency into $-\\pi<\\omega\\le\\pi$.</li><li>Apply the cosine pair to each term.</li></ol>'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'\\cos\\!\\left(\\tfrac{5\\pi}{3}n\\right)=\\cos\\!\\left(2\\pi n-\\tfrac{\\pi}{3}n\\right)=\\cos\\!\\left(-\\tfrac{\\pi}{3}n\\right)=\\cos\\!\\left(\\tfrac{\\pi}{3}n\\right)', label:'Reduce the first frequency',
        note:'Write $\\tfrac{5\\pi}{3}=2\\pi-\\tfrac{\\pi}{3}$. The term $2\\pi n$ is a whole number of turns, and the cosine is even.'}]},
    {t:'reveal', at:3, items:[
      {t:'eq', tex:'\\cos\\!\\left(\\tfrac{7\\pi}{4}n\\right)=\\cos\\!\\left(2\\pi n-\\tfrac{\\pi}{4}n\\right)=\\cos\\!\\left(\\tfrac{\\pi}{4}n\\right)', label:'Reduce the second frequency',
        note:'The same two moves, with $\\tfrac{7\\pi}{4}=2\\pi-\\tfrac{\\pi}{4}$.'}]}
  ]}
]},

{ id:'m6-ex-cos-c', module:'M6', nav:'Two cosines · the spectrum', title:'Line Spectrum of Two Cosines', src:'pp. 70–71',
  objective:'Place the impulses of two reduced cosines with their weights and every 2π copy.',
  keywords:'two cosines spectrum solution weight 2pi pi impulses pi/3 pi/4 copies every 2pi real even', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 6 · Worked example', src:'pp. 70–71'},
  {t:'title', text:'Line Spectrum of Two Cosines'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['both terms','$2\\cos(5\\pi n/3)$: weight $2\\pi$','$\\cos(7\\pi n/4)$: weight $\\pi$']},
      svg:v=>{
      const f=Math.max(0,Math.min(2,v?v.frame:0));
      const oA=1-cl(f-1), oB=f<=1 ? 1-f : f-1;
      const a=s3SP([-0.9,8.6],{yticksOverride:[0,PI,2*PI],ytickfmt:piTick});
      fade(a,oA,()=>{ for(const s of [1,-1]) s3train(a,s*PI/3,2*PI,{color:C.in}); });
      fade(a,oB,()=>{ for(const s of [1,-1]) s3train(a,s*PI/4,PI,{color:C.in}); });
      markPeriod(a,7.6);
      return a.svg(); },
      caption:'The spectrum over three periods. The tall arrows carry weight $2\\pi$ at $\\pm\\pi/3$, the short ones $\\pi$ at $\\pm\\pi/4$, and each pattern repeats every $2\\pi$.'}
  ], right:[
    {t:'eq', key:true, tex:'\\begin{aligned}X(e^{j\\omega})={}&2\\pi\\sum_{k=-\\infty}^{\\infty}\\Bigl[\\delta\\bigl(\\omega-\\tfrac{\\pi}{3}-2\\pi k\\bigr)+\\delta\\bigl(\\omega+\\tfrac{\\pi}{3}-2\\pi k\\bigr)\\Bigr]\\\\&+\\pi\\sum_{k=-\\infty}^{\\infty}\\Bigl[\\delta\\bigl(\\omega-\\tfrac{\\pi}{4}-2\\pi k\\bigr)+\\delta\\bigl(\\omega+\\tfrac{\\pi}{4}-2\\pi k\\bigr)\\Bigr]\\end{aligned}', label:'Solution',
      note:'The cosine pair gives weight $\\pi$. The amplitude $2$ of the first term doubles it to $2\\pi$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Check', html:'$x[n]$ is real and even, so $X(e^{j\\omega})$ must be real and even. Each impulse at $+\\omega$ has a twin of the same weight at $-\\omega$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Common error', html:'Drawing impulses only at $\\pm5\\pi/3$ and $\\pm7\\pi/4$. In $-\\pi<\\omega\\le\\pi$ they sit at $\\pm\\pi/3$ and $\\pm\\pi/4$, and every copy $2\\pi$ away belongs to the answer.'}]}
  ]}
]},

{ id:'m6-ex-cos-b', module:'M6', nav:'Two cosines · the fundamental period', title:'Fundamental Period of Two Cosines', src:'p. 71',
  objective:'Apply the discrete-time fundamental-period rule to two cosines and to their sum.',
  keywords:'fundamental period discrete time N0 = 2pi m / omega0 smallest integer m LCM 6 8 24 rational', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Worked example', src:'p. 71'},
  {t:'title', text:'Fundamental Period of Two Cosines'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$x_1[n]=2\\cos(5\\pi n/3)$: $N_0=6$','$x_2[n]=\\cos(7\\pi n/4)$: $N_0=8$','$x[n]=x_1[n]+x_2[n]$: $N_0=24$']},
      svg:v=>{
      const f=Math.max(0,Math.min(2,v?v.frame:0));
      const x1=n=>2*Math.cos(5*PI*n/3), x2=n=>Math.cos(7*PI*n/4);
      const S=[[x1,6,'x_1[n]'],[x2,8,'x_2[n]'],[n=>x1(n)+x2(n),24,'x[n]']];
      const o=[1-cl(f), cl(f)*(1-cl(f-1)), cl(f-1)];
      const a=AX({xr:[-3,27],yr:[-3.4,4.4],xlabel:'n',ylabel:S[Math.round(f)][2],yticksOverride:[-3,-2,-1,1,2,3],xticksOverride:Math.round(f)===1?[8,16,24]:[6,12,18,24]});
      S.forEach(([g,N],i)=>fade(a,o[i],()=>{
        a.stem(D(g,-3,27),{color:C.in});
        a.span(0,N,3.75,'N_0='+N,{tex:true,color:C.coral}); }));
      return a.svg(); },
      caption:'Each term repeats on its own period. The sum repeats only when both terms do, after $24$ samples and not before.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'The same $x[n]=2\\cos\\!\\left(\\tfrac{5\\pi}{3}n\\right)+\\cos\\!\\left(\\tfrac{7\\pi}{4}n\\right)$.<div class="nsep"></div>What is its fundamental period?',
      ask:{key:'m6-ex-cos-b', choices:['$24$','$48$','$14$'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'N_0=\\frac{2\\pi}{\\omega_0}\\,m', label:'Fundamental period, discrete time',
        note:'$m$ is the smallest positive integer that makes $N_0$ an integer. No such $m$ exists when $\\omega_0/2\\pi$ is irrational.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'\\begin{aligned}\\omega_0=\\tfrac{5\\pi}{3}:&\\quad\\tfrac{2\\pi}{\\omega_0}=\\tfrac{6}{5},\\;\\;m=5,\\;\\;N_0=6\\\\\\omega_0=\\tfrac{7\\pi}{4}:&\\quad\\tfrac{2\\pi}{\\omega_0}=\\tfrac{8}{7},\\;\\;m=7,\\;\\;N_0=8\\end{aligned}', label:'Each term'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'Solution', html:'The sum repeats when both terms do, at $\\operatorname{LCM}(6,8)=24$. Since $24/6=4$ and $24/8=3$ share no factor, nothing smaller works.<span class="val"><b>$N_0=24$</b><small>fundamental period</small></span>'}]}
  ]}
]},

/* ============================================================ closing the section */
realGallery({ id:'m6-real-periodic', nav:'Periodic sequences around us',
  title:'Periodic Sequences Around Us', eyebrow:'Module 6 · Periodic sequences', src:'pp. 68–71',
  objective:'See everyday records that repeat, and whose spectra are trains of impulses.',
  keywords:'examples electric load hourly metronome click train sampled tone blinking light periodic sequence impulse spectrum',
  figs:[
    [()=>{ const a=P.Axes(EXO({xr:[-1,49],yr:[0,1.9],xlabel:'n\\;(\\text{h})',ylabel:'P[n]\\;(\\text{kW})',xstep:12}));
      a.stem(D(n=>1+0.6*Math.cos(2*PI*(n-19)/24),0,48),{color:C.in,r:2.6});
      return a.svg(); }, 'A home’s electric load, read every hour: $P[n]=1+0.6\\cos(2\\pi(n-19)/24)$ kW, period $N=24$.'],
    [()=>{ const a=P.Axes(EXO({xr:[-1,31],yr:[0,1.35],xlabel:'n\\;(0.1\\,\\text{s})',ylabel:'m[n]\\;(\\text{V})',xstep:5,yticksOverride:[0,1]}));
      a.stem(D(n=>s3imp(n,5),0,30),{color:C.in,r:3});
      return a.svg(); }, 'A metronome at $120$ beats per minute, sampled every $0.1$ s: $m[n]=\\sum_{k}\\delta[n-5k]$ V, period $N=5$.'],
    [()=>{ const a=P.Axes(EXO({xr:[-1,25],yr:[-0.7,0.7],xlabel:'n\\;(0.125\\,\\text{ms})',ylabel:'v[n]\\;(\\text{V})',xstep:8,yticksOverride:[-0.5,0,0.5]}));
      a.stem(D(n=>0.5*Math.cos(PI*n/4),0,24),{color:C.in,r:3});
      return a.svg(); }, 'A $1$ kHz tone sampled at $8$ kHz: $v[n]=0.5\\cos(\\pi n/4)$ V, period $N=8$.'],
    [()=>{ const a=P.Axes(EXO({xr:[0,2],yr:[-0.2,1.35],xlabel:'t\\;(\\text{s})',ylabel:'b(t)\\;(\\text{W})',xstep:0.5,yticksOverride:[0,1]}));
      a.curve(t=>((t%0.5)+0.5)%0.5<0.2?1:0,{color:C.in,n:2400});
      return a.svg(); }, 'A bicycle light blinking twice a second: $b(t)=1$ W for the first $0.2$ s of every $0.5$ s.']
  ],
  notes:[
    {t:'note', kind:'def', head:'It repeats', html:'Each record repeats with a fixed period: $N$ samples for a sequence, $T$ seconds for the light. Its spectrum is a train of impulses, $2\\pi/N$ apart for a sequence.'},
    {t:'note', kind:'warn', head:'Why this matters', html:'The spacing of the impulses gives the period. Their weights, $2\\pi a_k$, give the shape of one period.'}
  ]}),

labScene({ id:'m6-lab-i3', lab:'I3', nav:'Periodic Sequences', title:'Periodic Sequences and Their Impulse Spectra', src:'pp. 68–71',
  objective:'Choose a periodic sequence, read its impulse weights 2π a_k at 2πk/N, and reduce a frequency into one period.',
  keywords:'laboratory periodic sequence complex exponential cosine square wave impulse train impulse weights 2 pi a_k reduce frequency period' }),

codeScene({ id:'m6-code-periodic', nav:'Periodic sequences', title:'Periodic Sequences in Code', src:'pp. 68–71', eyebrow:'Periodic sequences in code',
  objective:'Compute the impulse weights of periodic sequences in MATLAB and in Python, and predict each result before running it.',
  keywords:'code matlab python periodic sequence impulse weights square wave impulse train reduce frequency fundamental period run' }),


/* </m6-s3> */

/* <m6-s4> ============================================ 6.4 properties */

/* ============================================================ linearity and time shift */
{ id:'m6-props-1', module:'M6', nav:'Properties · linearity, time shift', title:'Linearity and Time Shift', src:'p. 72',
  objective:'State linearity and prove the time-shift property by an index change.',
  keywords:'linearity time shift delay linear phase e^{-j omega n0} magnitude unchanged proof index change', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Properties', src:'p. 72'},
  {t:'title', text:'Linearity and Time Shift'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'n0', label:'$n_0$', min:-3, max:3, step:1, v:2, show:v=>'$'+v+'$'}]},
      svg:v=>{
      const n0=v?v.n0:2;
      const a=s4AX({yr:[-4.9,6.2],ylabel:'\\angle X(e^{j\\omega})\\;(\\text{rad})',yticksOverride:[-PI,0,PI],ytickfmt:piTick,xtickfmt:wPi});
      a.curve(w=>s4wrap(geoPh(w,0.5)),{color:C.in,dash:'9 6',n:3000});
      a.curve(w=>s4wrap(geoPh(w,0.5)-n0*w),{color:C.out,n:6000});
      markPeriod(a,4.7);
      return a.svg(); },
      caption:'The phase of $x[n]=(0.5)^{n}u[n]$ and of its delay $x[n-n_0]$. The delay adds $-\\omega n_0$, wrapped into $(-\\pi,\\pi]$; the magnitude does not change.'},
    {t:'legend', items:[['in','$\\angle X(e^{j\\omega})$',true],['out','$\\angle X(e^{j\\omega})-\\omega n_0$']]}
  ], right:[
    {t:'eq', tex:'a\\,x_1[n]+b\\,x_2[n]\\;\\longleftrightarrow\\;a\\,X_1(e^{j\\omega})+b\\,X_2(e^{j\\omega})', label:'Linearity',
      note:'The analysis equation is a sum, and a sum is linear.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\sum_{n}x[n-n_0]\\,e^{-j\\omega n}=\\sum_{m}x[m]\\,e^{-j\\omega(m+n_0)}=e^{-j\\omega n_0}X(e^{j\\omega})', label:'Put $m=n-n_0$',
        note:'$m$ runs over all integers as $n$ does, so the limits do not change.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'x[n-n_0]\\;\\longleftrightarrow\\;e^{-j\\omega n_0}X(e^{j\\omega})', label:'Time shift',
        note:'$|e^{-j\\omega n_0}|=1$, so $|X|$ does not change. The phase gains $-\\omega n_0$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$x[n]\\leftrightarrow X(e^{j\\omega})$ and $y[n]=x[n-2]$.<div class="nsep"></div>What is $\\angle Y(e^{j0.5})-\\angle X(e^{j0.5})$?',
        ask:{key:'m6-props-1', choices:['$-1$ rad','$+1$ rad','$0$'], answer:0,
          why:'The delay adds $-\\omega n_0=-0.5\\cdot2=-1$ rad at $\\omega=0.5$.'}}]}
  ]}
]},

/* ============================================================ frequency shift */
{ id:'m6-props-1-b', module:'M6', nav:'Properties · frequency shift', title:'Frequency Shift', src:'p. 72',
  objective:'Prove the frequency-shift property and see a shifted spectrum wrap round the period.',
  keywords:'frequency shift modulation e^{j omega0 n} X(e^{j(omega-omega0)}) periodic wrap (-1)^n', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Properties', src:'p. 72'},
  {t:'title', text:'Frequency Shift'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'k', label:'$\\omega_0/\\pi$', min:-1, max:1, step:0.25, v:0.5, show:v=>'$'+v+'$'}]},
      svg:v=>{
      const w0=(v?v.k:0.5)*PI;
      const a=s4AX({yr:[-0.35,3.6],ylabel:'|X(e^{j\\omega})|',yticksOverride:[0,1,2]});
      a.curve(w=>geoMag(w,0.5),{color:C.in,dash:'9 6',n:3000});
      a.curve(w=>geoMag(w-w0,0.5),{color:C.out,n:3000});
      markPeriod(a,2.45);
      return a.svg(); },
      caption:'The magnitude for $(0.5)^{n}u[n]$, and after multiplying by $e^{j\\omega_0n}$. Every copy moves by $\\omega_0$.'},
    {t:'legend', items:[['in','$|X(e^{j\\omega})|$',true],['out','$|X(e^{j(\\omega-\\omega_0)})|$']]}
  ], right:[
    {t:'eq', key:true, tex:'e^{j\\omega_0 n}x[n]\\;\\longleftrightarrow\\;X\\bigl(e^{j(\\omega-\\omega_0)}\\bigr)', label:'Frequency shift',
      note:'The factor is $e^{+j\\omega_0n}$, a sequence of fixed frequency $\\omega_0$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\sum_{n}e^{j\\omega_0n}x[n]\\,e^{-j\\omega n}=\\sum_{n}x[n]\\,e^{-j(\\omega-\\omega_0)n}=X\\bigl(e^{j(\\omega-\\omega_0)}\\bigr)', label:'Proof',
        note:'Combine the two exponentials. The result is the analysis sum at $\\omega-\\omega_0$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'The shift wraps round', html:'A peak pushed past $\\omega=\\pi$ comes back in at $-\\pi$, because the spectrum repeats every $2\\pi$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$|X(e^{j\\omega})|$ is largest at $\\omega=0$ in $-\\pi<\\omega\\le\\pi$, and $y[n]=(-1)^{n}x[n]$.<div class="nsep"></div>Where is $|Y(e^{j\\omega})|$ largest in that period?',
        ask:{key:'m6-props-1-b', choices:['$\\omega=\\pi$','$\\omega=0$','$\\omega=\\pi/2$'], answer:0,
          why:'$(-1)^{n}=e^{j\\pi n}$, so the peak moves by $\\omega_0=\\pi$.'}}]}
  ]}
]},

/* ============================================================ conjugation and symmetry */
{ id:'m6-props-2', module:'M6', nav:'Properties · conjugation and symmetry', title:'Conjugation and Spectral Symmetry', src:'pp. 72–73',
  objective:'State the conjugation property and derive the symmetry of the transform of a real sequence.',
  keywords:'conjugation conjugate symmetry real sequence even real part odd imaginary part magnitude phase half period', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Properties', src:'pp. 72–73'},
  {t:'title', text:'Conjugation and Spectral Symmetry'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=s4AX({yr:[-0.9,3.6],ylabel:'\\text{spectrum}',yticksOverride:[-0.5,0,1,2],ytickfmt:v=>String(v),xtickfmt:wPi});
      a.curve(w=>(1-0.5*Math.cos(w))/(1-Math.cos(w)+0.25),{color:C.in,n:3000});
      a.curve(w=>-0.5*Math.sin(w)/(1-Math.cos(w)+0.25),{color:C.mid,n:3000});
      markPeriod(a,2.45);
      return a.svg(); },
      caption:'The transform of the real sequence $(0.5)^{n}u[n]$. Its real part is even in $\\omega$ and its imaginary part is odd, about $0$ and about every multiple of $2\\pi$.'},
    {t:'legend', items:[['in','$\\operatorname{Re}\\{X(e^{j\\omega})\\}$'],['mid','$\\operatorname{Im}\\{X(e^{j\\omega})\\}$']]}
  ], right:[
    {t:'eq', tex:'x^{*}[n]\\;\\longleftrightarrow\\;X^{*}(e^{-j\\omega})', label:'Conjugation',
      note:'Conjugating the analysis sum changes the sign of $j$ in every term.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'x[n]\\ \\text{real}\\quad\\Longrightarrow\\quad X(e^{-j\\omega})=X^{*}(e^{j\\omega})', label:'Conjugate symmetry',
        note:'Put $x^{*}=x$. So $\\operatorname{Re}\\{X\\}$ and $|X|$ are even; $\\operatorname{Im}\\{X\\}$ and $\\angle X$ are odd.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Half a period is enough', html:'For a real sequence, the values on $0\\le\\omega\\le\\pi$ fix those on $-\\pi\\le\\omega<0$. A complex sequence needs the whole period.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$x[n]$ is real and $X(e^{j0.4})=1.2-0.5j$.<div class="nsep"></div>What is $X\\bigl(e^{j(2\\pi-0.4)}\\bigr)$?',
        ask:{key:'m6-props-2', choices:['$1.2+0.5j$','$1.2-0.5j$','$-1.2+0.5j$'], answer:0,
          why:'The period makes it $X(e^{-j0.4})$, and conjugate symmetry makes that $X^{*}(e^{j0.4})$.'}}]}
  ]}
]},

/* ============================================================ time reversal */
{ id:'m6-props-2-b', module:'M6', nav:'Properties · time reversal', title:'Time Reversal', src:'pp. 72–73',
  objective:'Prove the time-reversal property and read what it does to magnitude and phase.',
  keywords:'time reversal x[-n] X(e^{-j omega}) mirror index change real sequence phase negated', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Properties', src:'pp. 72–73'},
  {t:'title', text:'Time Reversal'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$x[n]=(0.5)^{n}u[n]$','$x[-n]$']},
      svg:v=>{
      const f=cl(v?v.frame:0);
      const a=AX({xr:[-8.5,8.5],yr:[-0.2,1.3],xlabel:'n',ylabel:'\\text{value}',yticksOverride:[0,0.5,1],ytickfmt:v=>String(v),xtarget:9});
      fade(a,1-f,()=>a.stem(D(n=>bGeoS4(n,0.5),-8,8),{color:C.in}));
      fade(a,f,()=>a.stem(D(n=>bGeoS4(-n,0.5),-8,8),{color:C.out}));
      return a.svg(); },
      caption:'A one-sided sequence and its reversal. Each sample keeps its value and moves from $n$ to $-n$.'}
  ], right:[
    {t:'eq', tex:'\\sum_{n}x[-n]\\,e^{-j\\omega n}=\\sum_{m}x[m]\\,e^{-j(-\\omega)m}=X(e^{-j\\omega})', label:'Put $m=-n$',
      note:'$m$ runs over all integers as $n$ does, so this is the analysis sum at $-\\omega$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'x[-n]\\;\\longleftrightarrow\\;X(e^{-j\\omega})', label:'Time reversal',
        note:'For a real $x$, $X(e^{-j\\omega})=X^{*}(e^{j\\omega})$: the magnitude stays and the phase changes sign.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'An even sequence', html:'If $x[-n]=x[n]$, reversal changes nothing, so $X(e^{-j\\omega})=X(e^{j\\omega})$: the transform is even in $\\omega$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$x[n]=\\delta[n]+2\\delta[n-1]$, so $X(e^{j\\omega})=1+2e^{-j\\omega}$.<div class="nsep"></div>What is the transform of $x[-n]$?',
        ask:{key:'m6-props-2-b', choices:['$1+2e^{j\\omega}$','$1+2e^{-j\\omega}$','$1-2e^{-j\\omega}$'], answer:0,
          why:'$x[-n]=\\delta[n]+2\\delta[n+1]$, which is $X(e^{-j\\omega})$.'}}]}
  ]}
]},

/* ============================================================ even and odd parts */
{ id:'m6-props-evenodd', module:'M6', nav:'Properties · even and odd parts', title:'Even and Odd Parts', src:'p. 73',
  objective:'Relate the even and odd parts of a real sequence to the real and imaginary parts of its transform.',
  keywords:'even odd decomposition real even sequence real transform real odd purely imaginary Ev Od real part imaginary part', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Properties', src:'p. 73'},
  {t:'title', text:'Even and Odd Parts'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$x[n]=(0.6)^{n}u[n]$','$\\Ev\\{x[n]\\}$','$\\Od\\{x[n]\\}$']},
      svg:v=>{
      const f=v?v.frame:0, x=n=>bGeoS4(n,0.6);
      const a=AX({xr:[-8.5,8.5],yr:[-0.65,1.3],xlabel:'n',ylabel:'\\text{value}',yticksOverride:[-0.5,0,0.5,1],ytickfmt:v=>String(v),xtarget:9});
      fade(a,1-cl(f),()=>a.stem(D(x,-8,8),{color:C.in}));
      fade(a,cl(f)*(1-cl(f-1)),()=>a.stem(D(n=>0.5*(x(n)+x(-n)),-8,8),{color:C.mid}));
      fade(a,cl(f-1),()=>a.stem(D(n=>0.5*(x(n)-x(-n)),-8,8),{color:C.out}));
      return a.svg(); },
      caption:'A one-sided sequence and the two parts it splits into. The even part is $1$ at $n=0$, where both halves meet; the odd part is $0$ there.'}
  ], right:[
    {t:'eq', key:true, tex:'\\begin{aligned}\\Ev\\{x[n]\\}&\\;\\longleftrightarrow\\;\\operatorname{Re}\\{X(e^{j\\omega})\\}\\\\\\Od\\{x[n]\\}&\\;\\longleftrightarrow\\;j\\operatorname{Im}\\{X(e^{j\\omega})\\}\\end{aligned}', label:'For a real $x$'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\Ev\\{x\\}=\\tfrac12\\bigl(x[n]+x[-n]\\bigr)\\;\\longleftrightarrow\\;\\tfrac12\\bigl[X+X^{*}\\bigr]=\\operatorname{Re}\\{X\\}', label:'Proof',
        note:'Linearity and time reversal give $\\tfrac12[X(e^{j\\omega})+X(e^{-j\\omega})]$, and a real $x$ has $X(e^{-j\\omega})=X^{*}(e^{j\\omega})$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Two special cases', html:'A real, even sequence has a real, even transform. A real, odd sequence has an imaginary, odd transform.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$x[n]=\\delta[n+1]-\\delta[n-1]$, which is real and odd.<div class="nsep"></div>What is $X(e^{j\\pi/2})$?',
        ask:{key:'m6-props-evenodd', choices:['$2j$','$2$','$0$'], answer:0,
          why:'$X(e^{j\\omega})=e^{j\\omega}-e^{-j\\omega}=2j\\sin\\omega$, which is $2j$ at $\\omega=\\pi/2$.'}}]}
  ]}
]},

{ id:'m6-props-evenodd-b', module:'M6', nav:'Worked example · even part', title:'Even Part of a One-Sided Sequence', src:'p. 73',
  objective:'Transform the even part of a^n u[n] term by term and recover the real part of its transform.',
  keywords:'worked example even part a^n u[n] a^{|n|} delta overlap real part 1 - a cos omega', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Worked example', src:'p. 73'},
  {t:'title', text:'Even Part of a One-Sided Sequence'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=s4AX({yr:[-0.4,3.4],ylabel:'\\operatorname{Re}\\{X(e^{j\\omega})\\}',yticksOverride:[0,0.625,2.5],ytickfmt:v=>String(v)});
      a.curve(w=>(1-0.6*Math.cos(w))/(1-1.2*Math.cos(w)+0.36),{color:C.mid,n:3000});
      markPeriod(a,2.95);
      return a.svg(); },
      caption:'$\\operatorname{Re}\\{X(e^{j\\omega})\\}$ for $a=0.6$: even in $\\omega$, $2.5$ at $\\omega=0$ and $0.625$ at $\\omega=\\pm\\pi$.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x[n]=a^{n}u[n]$, $0<a<1$, so $X(e^{j\\omega})=1/(1-ae^{-j\\omega})$. Find the transform of $\\Ev\\{x\\}$.<div class="nsep"></div>What is $\\Ev\\{x[n]\\}$ at $n=0$?',
      ask:{key:'m6-props-evenodd-b', choices:['$1$','$\\tfrac12$','$2$'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\Ev\\{x[n]\\}=\\tfrac12\\bigl(a^{n}u[n]+a^{-n}u[-n]\\bigr)=\\tfrac12a^{|n|}+\\tfrac12\\delta[n]', label:'Even part',
        note:'The two halves overlap at $n=0$, where the sum is $\\tfrac12+\\tfrac12=1$.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'\\tfrac12\\cdot\\frac{1-a^{2}}{1-2a\\cos\\omega+a^{2}}+\\tfrac12=\\frac{(1-a^{2})+(1-2a\\cos\\omega+a^{2})}{2\\,(1-2a\\cos\\omega+a^{2})}', label:'Transform term by term',
        note:'Use $a^{|n|}\\leftrightarrow(1-a^{2})/(1-2a\\cos\\omega+a^{2})$ and $\\delta[n]\\leftrightarrow1$.'}]},
    {t:'reveal', at:3, items:[
      {t:'eq', key:true, tex:'\\frac{2-2a\\cos\\omega}{2\\,(1-2a\\cos\\omega+a^{2})}=\\frac{1-a\\cos\\omega}{1-2a\\cos\\omega+a^{2}}=\\operatorname{Re}\\{X(e^{j\\omega})\\}', label:'Solution',
        note:'Check: at $\\omega=0$ both sides are $1/(1-a)$.'}]}
  ]}
]},

/* ============================================================ time expansion */
{ id:'m6-expansion', module:'M6', nav:'Properties · time expansion', title:'Time Expansion', src:'p. 72',
  objective:'Define the time expansion of a sequence and prove its property by an index change.',
  keywords:'time expansion x_(k)[n] zero insertion X(e^{jk omega}) proof index change', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Properties', src:'p. 72'},
  {t:'title', text:'Time Expansion'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$y[n]$','$y_{(2)}[n]$','$y_{(3)}[n]$']},
      svg:v=>{
      const f=v?v.frame:0, y=n=>(n>=0&&n<=4)?1:0, yk=(n,k)=>(n%k===0)?y(n/k):0;
      const a=AX({xr:[-1.5,13.5],yr:[-0.2,1.3],xlabel:'n',ylabel:'\\text{value}',yticksOverride:[0,1],xtarget:8});
      fade(a,1-cl(f),()=>a.stem(D(n=>yk(n,1),-1,13),{color:C.in}));
      fade(a,cl(f)*(1-cl(f-1)),()=>a.stem(D(n=>yk(n,2),-1,13),{color:C.mid}));
      fade(a,cl(f-1),()=>a.stem(D(n=>yk(n,3),-1,13),{color:C.out}));
      return a.svg(); },
      caption:'The five-point pulse $y[n]$, and its expansions by $k=2$ and $k=3$. The same five values, with $k-1$ zeros between each pair.'}
  ], right:[
    {t:'note', kind:'def', head:'Expansion by $k$', html:'For an integer $k\\ge1$, {{sym:expan|$x_{(k)}[n]$}} is $x[n/k]$ when $n$ is a multiple of $k$, and $0$ otherwise.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\sum_{n}x_{(k)}[n]\\,e^{-j\\omega n}=\\sum_{r}x[r]\\,e^{-j\\omega kr}=X\\bigl(e^{jk\\omega}\\bigr)', label:'Put $n=rk$',
        note:'Only $n=rk$ contributes, and there $x_{(k)}[rk]=x[r]$.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'x_{(k)}[n]\\;\\longleftrightarrow\\;X\\bigl(e^{jk\\omega}\\bigr)', label:'Time expansion'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$x[n]=1$ on $0\\le n\\le2$ and $0$ elsewhere.<div class="nsep"></div>Where is the last nonzero sample of $x_{(2)}[n]$?',
        ask:{key:'m6-expansion', choices:['$n=4$','$n=5$','$n=2$'], answer:0,
          why:'The sample $x[2]$ moves to $n=2\\cdot2=4$.'}}]}
  ]}
]},

{ id:'m6-expansion-c', module:'M6', nav:'Time expansion · the spectrum', title:'Expansion Compresses the Spectrum', src:'p. 72',
  objective:'Read the period of the transform of an expanded sequence off its formula and its picture.',
  keywords:'time expansion spectrum period 2 pi / k copies compressed energy unchanged height', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 6 · Properties', src:'p. 72'},
  {t:'title', text:'Expansion Compresses the Spectrum'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$k=1$: period $2\\pi$','$k=2$: period $\\pi$','$k=3$: period $2\\pi/3$']},
      svg:v=>{
      const f=v?v.frame:0;
      const a=s4AX({yr:[-0.6,7.0],ylabel:'|Y_{(k)}(e^{j\\omega})|',yticksOverride:[0,1,5]});
      [[1,C.in,1-cl(f)],[2,C.mid,cl(f)*(1-cl(f-1))],[3,C.out,cl(f-1)]].forEach(([k,col,o])=>fade(a,o,()=>
        a.curve(w=>Math.abs(dirich(wrap(k*w),2)),{color:col,n:9000})));
      markPeriod(a,6.0);
      return a.svg(); },
      caption:'$|Y_{(k)}(e^{j\\omega})|=|Y(e^{jk\\omega})|$ for the five-point pulse. Each peak is $5$ high, and one period of $2\\pi$ holds $k$ copies.'}
  ], right:[
    {t:'eq', tex:'X\\bigl(e^{jk(\\omega+2\\pi/k)}\\bigr)=X\\bigl(e^{jk\\omega+j2\\pi}\\bigr)=X\\bigl(e^{jk\\omega}\\bigr)', label:'Period $2\\pi/k$',
      note:'So $X(e^{jk\\omega})$ repeats every $2\\pi/k$: the frequency axis is compressed by $k$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'Same height, same energy', html:'The inserted zeros add no energy, so $x_{(k)}$ has the energy of $x$. Each copy keeps the height of the original peak.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'$X(e^{j\\omega})$ has one peak in $-\\pi<\\omega\\le\\pi$, at $\\omega=0$.<div class="nsep"></div>How many peaks does the transform of $x_{(4)}[n]$ have in that period?',
        ask:{key:'m6-expansion-c', choices:['$4$','$1$','$2$'], answer:0,
          why:'The peaks sit at multiples of $2\\pi/4$: $-\\pi/2$, $0$, $\\pi/2$ and $\\pi$.'}}]}
  ]}
]},

{ id:'m6-expansion-b', module:'M6', nav:'Worked example · an expansion', title:'Time-Expansion Example', src:'p. 72',
  objective:'Build a transform from a pulse by one shift, one expansion and one weighted sum.',
  keywords:'worked example five point pulse shift expand build sin(5 omega)/sin(omega) 15', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Worked example', src:'p. 72'},
  {t:'title', text:'Time-Expansion Example'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$|G(e^{j\\omega})|$','$|Y_{(2)}(e^{j\\omega})|$','$|X(e^{j\\omega})|$']},
      svg:v=>{
      const f=v?v.frame:0;
      const a=s4AX({yr:[-1.2,20.5],ylabel:'\\text{magnitude}',yticksOverride:[0,5,15]});
      fade(a,1-cl(f),()=>a.curve(w=>Math.abs(dirich(wrap(w),2)),{color:C.in,n:6000}));
      fade(a,cl(f)*(1-cl(f-1)),()=>a.curve(w=>Math.abs(dirich(wrap(2*w),2)),{color:C.mid,n:9000}));
      fade(a,cl(f-1),()=>a.curve(w=>Math.sqrt(5+4*Math.cos(w))*Math.abs(dirich(wrap(2*w),2)),{color:C.out,n:9000}));
      markPeriod(a,17.6);
      return a.svg(); },
      caption:'The pulse, its shifted expansion, and the built sequence. The peak grows from $5$ to $3\\cdot5=15$ at $\\omega=0$.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$g[n]=1$ on $|n|\\le2$ has $G(e^{j\\omega})=\\sin(5\\omega/2)/\\sin(\\omega/2)$. Let $y[n]=g[n-2]$ and $x[n]=y_{(2)}[n]+2y_{(2)}[n-1]$.<div class="nsep"></div>What is $|X(e^{j0})|$?',
      ask:{key:'m6-expansion-b', choices:['$15$','$5$','$10$'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'<ol class="steps"><li>Shift $g$ by $2$, then expand by $k=2$.</li><li>Add a copy delayed by $1$, with weight $2$.</li></ol>'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'\\begin{aligned}Y(e^{j\\omega})&=e^{-j2\\omega}\\,G(e^{j\\omega})\\\\Y_{(2)}(e^{j\\omega})&=Y(e^{j2\\omega})=e^{-j4\\omega}\\,\\frac{\\sin(5\\omega)}{\\sin\\omega}\\end{aligned}', label:'Shift, then expand'}]},
    {t:'reveal', at:3, items:[
      {t:'eq', key:true, tex:'X(e^{j\\omega})=\\bigl(1+2e^{-j\\omega}\\bigr)\\,e^{-j4\\omega}\\,\\frac{\\sin(5\\omega)}{\\sin\\omega}', label:'Solution',
        note:'Check: at $\\omega=0$, $|1+2|\\cdot5=15=5+2\\cdot5$, the sum of the samples.'}]}
  ]}
]},

{ id:'m6-expansion-d', module:'M6', nav:'Expansion · the denominator', title:'Denominator of the Pulse Transform', src:'p. 72',
  objective:'Tell the transform of the pulse from the transform of its expansion by the argument of the denominator.',
  keywords:'common error denominator sin(omega/2) sin(omega) pole at pi Dirichlet expansion argument doubled', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 6 · Worked example', src:'p. 72'},
  {t:'title', text:'Denominator of the Pulse Transform'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=s4AX({yr:[-2.6,8.6],ylabel:'\\text{value}',yticksOverride:[-1,0,1,5]});
      a.curve(w=>dirich(wrap(w),2),{color:C.in,n:6000});
      a.curve(w=>{ const s=Math.sin(w); return Math.abs(s)<1e-3?NaN:Math.sin(2.5*w)/s; },{color:C.err,dash:'9 6',n:9000});
      markPeriod(a,6.6);
      return a.svg(); },
      caption:'The true $G(e^{j\\omega})$ is $1$ at $\\omega=\\pm\\pi$. The wrong form runs off to infinity there, and it does not even repeat every $2\\pi$.'},
    {t:'legend', items:[['in','$\\dfrac{\\sin(5\\omega/2)}{\\sin(\\omega/2)}$'],['err','$\\dfrac{\\sin(5\\omega/2)}{\\sin\\omega}$',true]]}
  ], right:[
    {t:'note', kind:'err', head:'Common error', html:'Writing $\\sin\\omega$ in the denominator puts a pole at $\\omega=\\pi$, where $G(e^{j\\pi})=1$. At $\\omega=\\pi/2$ it gives $-0.7071$ against the true $-1.0000$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'Where the argument doubled', html:'$\\sin(5\\omega)/\\sin\\omega$ is $G$ with $\\omega$ replaced by $2\\omega$. It is right for $y_{(2)}$ and wrong for $g$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'$G(e^{j\\omega})=\\dfrac{\\sin(5\\omega/2)}{\\sin(\\omega/2)}$.<div class="nsep"></div>What is $G(e^{j\\pi})$?',
        ask:{key:'m6-expansion-d', choices:['$1$','$5$','$-1$'], answer:0,
          why:'$\\sin(5\\pi/2)/\\sin(\\pi/2)=1$, and also $\\sum_{n=-2}^{2}(-1)^{n}=1$.'}}]}
  ]}
]},

/* ============================================================ first difference */
{ id:'m6-props-3', module:'M6', nav:'Properties · first difference', title:'First Difference', src:'pp. 72–73',
  objective:'Name the first difference correctly and derive its transform from the time shift.',
  keywords:'first difference differencing not differentiation 1 - e^{-j omega} 2|sin(omega/2)| high-pass', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Properties', src:'pp. 72–73'},
  {t:'title', text:'First Difference'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=s4AX({yr:[-0.3,3.0],ylabel:'|1-e^{-j\\omega}|',yticksOverride:[0,1,2]});
      a.curve(w=>2*Math.abs(Math.sin(w/2)),{color:C.h,n:4000});
      markPeriod(a,2.5);
      return a.svg(); },
      caption:'The factor a first difference applies, $|1-e^{-j\\omega}|=2|\\sin(\\omega/2)|$: zero at $\\omega=0$ and largest at $\\omega=\\pm\\pi$.'}
  ], right:[
    {t:'note', kind:'err', head:'Not a derivative', html:'$x[n]-x[n-1]$ is the <b>first difference</b>. A sequence has no values between $n$ and $n+1$, so there is no limit to take.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'x[n]-x[n-1]\\;\\longleftrightarrow\\;\\bigl(1-e^{-j\\omega}\\bigr)X(e^{j\\omega})', label:'First difference',
        note:'Linearity and the time shift: $x[n-1]\\leftrightarrow e^{-j\\omega}X(e^{j\\omega})$, then subtract.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Reading', html:'The factor is $0$ at $\\omega=0$ and $2$ at $\\omega=\\pm\\pi$. A first difference removes the average and lifts the fastest changes.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$y[n]=x[n]-x[n-1]$ and $X(e^{j\\pi})=0.5$.<div class="nsep"></div>What is $Y(e^{j\\pi})$?',
        ask:{key:'m6-props-3', choices:['$1$','$0$','$0.5$'], answer:0,
          why:'$1-e^{-j\\pi}=2$, so $Y(e^{j\\pi})=2\\cdot0.5=1$.'}}]}
  ]}
]},

{ id:'m6-props-3-b', module:'M6', nav:'Properties · accumulation', title:'Accumulation', src:'pp. 72–73',
  objective:'State the accumulation property with its impulse train and show where the train comes from.',
  keywords:'accumulation running sum impulse train pi X(e^{j0}) convolution with u[n] reciprocal of the first difference', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Properties', src:'pp. 72–73'},
  {t:'title', text:'Accumulation'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$x[n]=(0.5)^{n}u[n]$','$\\sum_{m=-\\infty}^{n}x[m]$']},
      svg:v=>{
      const f=cl(v?v.frame:0);
      const a=AX({xr:[-3.5,12.5],yr:[-0.2,2.5],xlabel:'n',ylabel:'\\text{value}',yticksOverride:[0,1,2],xtarget:8});
      fade(a,1-f,()=>a.stem(D(n=>bGeoS4(n,0.5),-3,12),{color:C.in}));
      fade(a,f,()=>{ a.hline(2,{color:C.muted}); a.stem(D(n=>n<0?0:2-Math.pow(0.5,n),-3,12),{color:C.out}); });
      return a.svg(); },
      caption:'A sequence and its running sum. The sum settles at $\\sum_n x[n]=X(e^{j0})=2$, a constant that differencing cannot see.'}
  ], right:[
    {t:'eq', key:true, tex:'\\sum_{m=-\\infty}^{n}x[m]\\;\\longleftrightarrow\\;\\frac{X(e^{j\\omega})}{1-e^{-j\\omega}}+\\pi X(e^{j0})\\sum_{k=-\\infty}^{\\infty}\\delta(\\omega-2\\pi k)', label:'Accumulation'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\sum_{m=-\\infty}^{n}x[m]=x[n]*u[n],\\qquad u[n]\\;\\longleftrightarrow\\;\\frac{1}{1-e^{-j\\omega}}+\\pi\\sum_{k}\\delta(\\omega-2\\pi k)', label:'Proof',
        note:'Transforms of a convolution multiply (Section 6.5). Each impulse keeps only $X(e^{j2\\pi k})=X(e^{j0})$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Keep the impulse train', html:'The running sum settles at $X(e^{j0})=\\sum_n x[n]$. A constant has an impulse at every multiple of $2\\pi$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$x[n]=(0.75)^{n}u[n]$.<div class="nsep"></div>What weight does each impulse in the transform of its running sum carry?',
        ask:{key:'m6-props-3-b', choices:['$4\\pi$','$\\pi$','$4$'], answer:0,
          why:'$X(e^{j0})=1/(1-0.75)=4$, so $\\pi X(e^{j0})=4\\pi$.'}}]}
  ]}
]},

{ id:'m6-props-3-c', module:'M6', nav:'Properties · differentiation in frequency', title:'Differentiation in Frequency', src:'pp. 72–73',
  objective:'Prove the differentiation-in-frequency property and use it to transform n a^n u[n].',
  keywords:'differentiation in frequency n x[n] j dX/domega derivative omega continuous n a^n u[n] repeated factor', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Properties', src:'pp. 72–73'},
  {t:'title', text:'Differentiation in Frequency'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$(0.7)^{n}u[n]$','$n\\,(0.7)^{n}u[n]$']},
      svg:v=>{
      const f=cl(v?v.frame:0);
      const a=AX({xr:[-2.5,14.5],yr:[-0.15,1.3],xlabel:'n',ylabel:'\\text{value}',yticksOverride:[0,0.5,1],ytickfmt:v=>String(v),xtarget:8});
      fade(a,1-f,()=>a.stem(D(n=>bGeoS4(n,0.7),-2,14),{color:C.in}));
      fade(a,f,()=>a.stem(D(n=>n*bGeoS4(n,0.7),-2,14),{color:C.out}));
      return a.svg(); },
      caption:'Multiplying by $n$ zeroes the sample at $n=0$ and lifts the later ones.'}
  ], right:[
    {t:'eq', tex:'\\frac{\\d X(e^{j\\omega})}{\\d\\omega}=\\sum_{n}(-jn)\\,x[n]\\,e^{-j\\omega n}', label:'Differentiate the analysis sum',
      note:'Only $e^{-j\\omega n}$ depends on $\\omega$, and $\\omega$ is continuous: a true derivative.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'n\\,x[n]\\;\\longleftrightarrow\\;j\\,\\frac{\\d X(e^{j\\omega})}{\\d\\omega}', label:'Differentiation in frequency'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'n\\,a^{n}u[n]\\;\\longleftrightarrow\\;j\\cdot\\frac{-jae^{-j\\omega}}{(1-ae^{-j\\omega})^{2}}=\\frac{ae^{-j\\omega}}{(1-ae^{-j\\omega})^{2}}', label:'Use it on $a^{n}u[n]$',
        note:'Multiply by $j$, since $j\\cdot(-j)=1$, and differentiate $1/(1-ae^{-j\\omega})$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$x[n]=n\\,(0.5)^{n}u[n]$.<div class="nsep"></div>What is $X(e^{j0})$?',
        ask:{key:'m6-props-3-c', choices:['$2$','$1$','$4$'], answer:0,
          why:'$a/(1-a)^{2}=0.5/0.25=2$, and $\\sum_n n\\,(0.5)^{n}=2$ as well.'}}]}
  ]}
]},

/* ============================================================ Parseval */
{ id:'m6-parseval', module:'M6', nav:'Parseval', title:'Parseval’s Relation', src:'p. 73',
  objective:'Prove Parseval for the DTFT and fix its integration range and its factor.',
  keywords:'parseval energy density spectrum |X|^2 one period 1/2pi proof exchange sum integral', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Properties', src:'p. 73'},
  {t:'title', text:'Parseval’s Relation'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=s4AX({yr:[-0.5,5.6],ylabel:'|X(e^{j\\omega})|^{2}',yticksOverride:[0,1,2,3,4]});
      a.area(w=>geoMag(w,0.5)**2,-PI,PI,{color:C.in+'29',n:900});
      a.curve(w=>geoMag(w,0.5)**2,{color:C.in,n:4000});
      markPeriod(a,4.7);
      return a.svg(); },
      caption:'The energy-density spectrum of $(0.5)^{n}u[n]$. The shaded area over one period, divided by $2\\pi$, is the energy $4/3$.'}
  ], right:[
    {t:'eq', key:true, tex:'\\sum_{n=-\\infty}^{\\infty}|x[n]|^{2}=\\frac{1}{2\\pi}\\int_{2\\pi}|X(e^{j\\omega})|^{2}\\,\\d\\omega', label:'Parseval’s relation'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\begin{aligned}\\sum_{n}x[n]\\,x^{*}[n]&=\\sum_{n}x[n]\\,\\frac{1}{2\\pi}\\int_{2\\pi}X^{*}(e^{j\\omega})\\,e^{-j\\omega n}\\,\\d\\omega\\\\&=\\frac{1}{2\\pi}\\int_{2\\pi}X^{*}(e^{j\\omega})\\,X(e^{j\\omega})\\,\\d\\omega\\end{aligned}', label:'Proof',
        note:'Write $|x|^{2}=x\\,x^{*}$, use synthesis for $x^{*}$, swap sum and integral.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'One period, and keep $1/2\\pi$', html:'Over all $\\omega$ the integral diverges. Without $1/2\\pi$ it gives $2\\pi$ times the energy.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$x[n]=\\delta[n]+\\delta[n-1]$.<div class="nsep"></div>What is $\\tfrac{1}{2\\pi}\\int_{-\\pi}^{\\pi}|X(e^{j\\omega})|^{2}\\,\\d\\omega$?',
        ask:{key:'m6-parseval', choices:['$2$','$4\\pi$','$1$'], answer:0,
          why:'It equals the energy, $1^{2}+1^{2}=2$.'}}]}
  ]}
]},

{ id:'m6-parseval-b', module:'M6', nav:'Parseval · both domains', title:'Energy in Both Domains', src:'p. 73',
  objective:'Compute the energy of two sequences as a sum and as an integral over one period.',
  keywords:'parseval check a^n u[n] 4/3 rectangular pulse 5 energy both domains synthesis at n = 0', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 6 · Properties', src:'p. 73'},
  {t:'title', text:'Energy in Both Domains'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$(0.5)^{n}u[n]$: energy $4/3$','$\\text{pulse},\\;N_1=2$: energy $5$']},
      svg:v=>{
      const f=cl(v?v.frame:0), top=5.6+f*(31-5.6);
      const a=s4AX({yr:[-0.1*top,top],ylabel:'|X(e^{j\\omega})|^{2}',ytarget:3});
      fade(a,1-f,()=>{ a.area(w=>geoMag(w,0.5)**2,-PI,PI,{color:C.in+'29',n:900}); a.curve(w=>geoMag(w,0.5)**2,{color:C.in,n:4000}); });
      fade(a,f,()=>{ a.area(w=>dirich(wrap(w),2)**2,-PI,PI,{color:C.h+'29',n:900}); a.curve(w=>dirich(wrap(w),2)**2,{color:C.h,n:6000}); });
      markPeriod(a,0.84*top);
      return a.svg(); },
      caption:'The two energy-density spectra. Each shaded area over one period, divided by $2\\pi$, is the energy of the sequence.'}
  ], right:[
    {t:'eq', tex:'\\begin{aligned}\\sum_{n\\ge0}\\bigl(\\tfrac14\\bigr)^{n}&=\\frac{1}{1-\\frac14}=\\frac43\\\\\\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi}\\frac{\\d\\omega}{1-2a\\cos\\omega+a^{2}}&=\\frac{1}{1-a^{2}}=\\frac43\\end{aligned}', label:'Check 1 · $(0.5)^{n}u[n]$',
      note:'The integrand is $\\tfrac{1}{1-a^{2}}$ times the transform of $a^{|n|}$; synthesis at $n=0$ gives $1$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\sum_{n=-2}^{2}1^{2}=5,\\qquad \\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi}\\Bigl|\\sum_{n=-2}^{2}e^{-j\\omega n}\\Bigr|^{2}\\d\\omega=5', label:'Check 2 · pulse, $N_1=2$',
        note:'Of the terms $e^{-j\\omega(n-m)}$, only the $5$ with $m=n$ survive one period.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'$x[n]=(0.8)^{n}u[n]$.<div class="nsep"></div>What is its energy?',
        ask:{key:'m6-parseval-b', choices:['$2.78$','$5$','$1.25$'], answer:0,
          why:'$\\sum_{n\\ge0}(0.64)^{n}=1/(1-0.64)=2.78$.'}}]}
  ]}
]},

/* ============================================================ duality */
{ id:'m6-duality', module:'M6', nav:'Duality', title:'Duality', src:'p. 77',
  objective:'Rule out a duality inside the DTFT pair and state the duality of the discrete-time series.',
  keywords:'duality DTFS self dual no DTFT duality sum integral impulse train coefficients 1/N x[-k]', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 6 · Duality', src:'p. 77'},
  {t:'title', text:'Duality'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$x[n]$: impulse train, $N=8$','$a_k=1/8$ for every $k$']},
      svg:v=>{
      const f=cl(v?v.frame:0);
      const a=AX({xr:[-10.5,10.5],yr:[-0.15,1.3],xlabel:f<0.5?'n':'k',ylabel:'\\text{value}',yticksOverride:[0,0.125,1],ytickfmt:v=>String(v),xtarget:8});
      fade(a,1-f,()=>a.stem(D(n=>((n%8)+8)%8===0?1:0,-10,10),{color:C.in}));
      fade(a,f,()=>a.stem(D(()=>1/8,-10,10),{color:C.mid}));
      return a.svg(); },
      caption:'An impulse train of period $N=8$ and its series coefficients, all $1/8$. Read as a sequence, the constant $1/8$ has the train, scaled by $1/8$, as its coefficients.'}
  ], right:[
    {t:'note', kind:'err', head:'No duality inside the DTFT pair', html:'Analysis is a sum over integer $n$; synthesis is an integral over continuous $\\omega$. No renaming turns one into the other.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'x[n]\\;\\longleftrightarrow\\;a_k\\quad\\Longrightarrow\\quad a[n]\\;\\longleftrightarrow\\;\\frac{1}{N}\\,x[-k]', label:'Duality of the discrete-time series',
        note:'Both domains are discrete and both have period $N$, so the coefficients can be read as a sequence.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'$x[n]=1$ for every $n$, with $N=4$, so $a_0=1$ and $a_1=a_2=a_3=0$.<div class="nsep"></div>What are the series coefficients of the sequence $a[n]$?',
        ask:{key:'m6-duality', choices:['$\\tfrac14$ for every $k$','$1$ for every $k$','$1$ at $k=0$ only'], answer:0,
          why:'Duality gives $\\tfrac14x[-k]=\\tfrac14$ at every $k$.'}}]}
  ]}
]},

{ id:'m6-duality-b', module:'M6', nav:'Duality · the transform as a series', title:'The Transform as a Fourier Series', src:'p. 77',
  objective:'Read the transform of a sequence as a continuous-time Fourier series in omega and check it on a band.',
  keywords:'duality DTFT continuous time Fourier series coefficients a_k = x[-k] square wave in omega sin(k pi/2)/(k pi)', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Duality', src:'p. 77'},
  {t:'title', text:'The Transform as a Fourier Series'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=s4AX({yr:[-0.3,1.75],ylabel:'X(e^{j\\omega})',yticksOverride:[0,1]});
      a.curve(w=>lpf(w,PI/2),{color:C.in,n:9000});
      markPeriod(a,1.35);
      return a.svg(); },
      caption:'A $2\\pi$-periodic square wave in $\\omega$: $1$ on $|\\omega|\\le\\pi/2$ in every period. Read it as a signal in the variable $\\omega$.'}
  ], right:[
    {t:'eq', key:true, tex:'X(e^{j\\omega})=\\sum_{n}x[n]\\,e^{-j\\omega n}=\\sum_{k}\\underbrace{x[-k]}_{a_k}\\,e^{jk\\omega}', label:'A series in $\\omega$',
      note:'Put $k=-n$: a Fourier series of period $2\\pi$ with $a_k=x[-k]$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'a_k=\\frac{1}{2\\pi}\\int_{-\\pi/2}^{\\pi/2}e^{-jk\\omega}\\,\\d\\omega=\\frac{1}{2\\pi}\\cdot\\frac{2\\sin(k\\pi/2)}{k}=\\frac{\\sin(k\\pi/2)}{k\\pi}', label:'Its coefficients',
        note:'$a_0=0.5$, $a_1=0.3183$, $a_2=0$, $a_3=-0.1061$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'The same numbers', html:'The inverse transform of the band is $x[n]=\\sin(\\pi n/2)/(\\pi n)$, the same list: $a_k=x[-k]=x[k]$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$X(e^{j\\omega})=3e^{-j2\\omega}$, read as a $2\\pi$-periodic function of $\\omega$.<div class="nsep"></div>Which series coefficient is not zero?',
        ask:{key:'m6-duality-b', choices:['$a_{-2}=3$','$a_{2}=3$','$a_{0}=3$'], answer:0,
          why:'$x[n]=3\\delta[n-2]$, so $a_k=x[-k]$ is $3$ at $k=-2$.'}}]}
  ]}
]},

/* ============================================================ closing the section */
realGallery({ id:'m6-real-props', nav:'Properties around us',
  title:'Properties Around Us', eyebrow:'Module 6 · Properties', src:'pp. 72–77',
  objective:'Recognise a delay, a reversal, an expansion and an energy in everyday records.',
  keywords:'examples delivery delay reversed playback drum zero insertion upsampling touch sensor energy properties',
  figs:[
    [()=>{ const o=n=>400*Math.exp(-Math.pow(n-5,2)/8);
      const a=P.Axes(EXO({xr:[-0.5,14.5],yr:[0,520],xlabel:'n\\;(\\text{day})',ylabel:'\\text{parcels}',xstep:2,yticksOverride:[0,200,400]}));
      a.stem(D(o,0,14),{color:C.in,r:2.6});
      a.stem(D(n=>o(n-2),0,14),{color:C.out,r:2.6});
      return a.svg(); }, 'Orders $o[n]=400e^{-(n-5)^{2}/8}$ each day, delivered two days later: $d[n]=o[n-2]$.',
      [['in','$o[n]$'],['out','$d[n]$']]],
    [()=>{ const p=t=>t<0?0:Math.exp(-t/25)*Math.sin(2*PI*0.06*t);
      const a=P.Axes(EXO({xr:[-120,120],yr:[-1.2,1.7],xlabel:'t\\;(\\text{ms})',ylabel:'p\\;(\\text{Pa})',xstep:40}));
      a.curve(p,{color:C.in,n:3000});
      a.curve(t=>p(-t),{color:C.out,n:3000});
      return a.svg(); }, 'A drum hit $p(t)=e^{-t/25}\\sin(2\\pi\\,0.06\\,t)$, $t\\ge0$ in ms, played backwards: $p(-t)$.',
      [['out','$p(-t)$'],['in','$p(t)$']], 'tl'],
    [()=>{ const a=P.Axes(EXO({xr:[-0.5,24.5],yr:[-1.2,1.5],xlabel:'n\\;(\\text{sample at }16\\text{ kHz})',ylabel:'\\text{amplitude}',xstep:4}));
      a.stem(D(n=>n%2===0?Math.cos(PI*n/8):0,0,24),{color:C.out,r:2.6});
      return a.svg(); }, 'An $8$ kHz record with a zero after each sample, for $16$ kHz: $x_{(2)}[n]$, $x[m]=\\cos(\\pi m/4)$.'],
    [()=>{ const v=n=>bGeoS4(n,0.7);
      const a=P.Axes(EXO({xr:[-0.5,12.5],yr:[0,1.3],xlabel:'n\\;(\\text{sample})',ylabel:'\\text{V},\\;\\text{V}^{2}',xstep:2,yticksOverride:[0,0.5,1],ytickfmt:v=>String(v)}));
      a.stem(D(v,0,12),{color:C.in,r:2.6});
      a.stem(D(n=>v(n)**2,0,12),{color:C.mid,r:2.6});
      return a.svg(); }, 'A tap on a touch sensor, $v[n]=(0.7)^{n}u[n]$ V. Its energy is $\\sum_n v[n]^{2}=1/(1-0.49)=1.96$.',
      [['in','$v[n]$'],['mid','$v[n]^{2}$']]]
  ],
  notes:[
    {t:'note', kind:'def', head:'One operation, one rule', html:'A delay, a reversal and an expansion each change the transform in one fixed way. Parseval gives the energy from either domain.'},
    {t:'note', kind:'warn', head:'Why this matters', html:'With the rule known, one transform serves every delayed, reversed or expanded copy of a record.'}
  ]}),

labScene({ id:'m6-lab-i4', lab:'I4', nav:'Transform Properties', title:'One Operation, One Spectral Rule', src:'pp. 72–73',
  objective:'Apply one operation to a sequence and read what it does to the magnitude, the phase and the period of its transform.',
  keywords:'laboratory properties time shift frequency shift reversal conjugation time expansion first difference magnitude phase parseval' }),

codeScene({ id:'m6-code-props', nav:'Properties', title:'Properties in Code', src:'pp. 72–73', eyebrow:'Properties in code',
  objective:'Check transform properties of sequences numerically in MATLAB and in Python, and predict each result before running it.',
  keywords:'code matlab python properties time shift expansion first difference parseval energy run' }),


/* </m6-s4> */

/* <m6-s5> ============================================ 6.5 convolution and multiplication */


/* ============================================================ convolution */
{ id:'m6-conv', module:'M6', nav:'Convolution property', title:'Convolution Property', src:'p. 73',
  objective:'State and prove the convolution property for sequences.',
  keywords:'convolution property Y = X H frequency response LTI proof exchange sums discrete periodic product', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Convolution and multiplication', src:'p. 73'},
  {t:'title', text:'Convolution Property'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>P.blocks({w:560,h:380,items:[
      {t:'arrow',x1:20,y1:110,x2:170,y2:110},
      {t:'box',x:170,y:76,w:140,h:68,label:'h[n]',tex:true,fs:21,color:C.h},
      {t:'arrow',x1:310,y1:110,x2:540,y2:110},
      {t:'text',x:95,y:90,label:'x[n]',tex:true,fs:18,color:C.in},
      {t:'text',x:425,y:90,label:'x[n]*h[n]',tex:true,fs:18,color:C.out},
      {t:'arrow',x1:20,y1:280,x2:170,y2:280},
      {t:'box',x:170,y:246,w:140,h:68,label:'H(e^{j\\omega})',tex:true,fs:21,color:C.h},
      {t:'arrow',x1:310,y1:280,x2:540,y2:280},
      {t:'text',x:95,y:260,label:'X(e^{j\\omega})',tex:true,fs:18,color:C.in},
      {t:'text',x:425,y:260,label:'X(e^{j\\omega})H(e^{j\\omega})',tex:true,fs:18,color:C.out},
      {t:'text',x:280,y:195,label:'\\text{the same system, seen twice}',tex:true,fs:15,color:C.slate}
    ]}), caption:'One system in time and in frequency: a convolution sum becomes one product at each frequency.'}
  ], right:[
    {t:'eq', key:true, tex:'y[n]=x[n]*h[n]\\;\\longleftrightarrow\\;Y(e^{j\\omega})=X(e^{j\\omega})\\,H(e^{j\\omega})', label:'Convolution property',
      note:'$h$ is the impulse response and $H(e^{j\\omega})$ the frequency response.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\begin{aligned}Y(e^{j\\omega})&=\\sum_{n}\\Bigl(\\sum_{k}x[k]\\,h[n-k]\\Bigr)e^{-j\\omega n}=\\sum_{k}x[k]\\sum_{n}h[n-k]\\,e^{-j\\omega n}\\\\&=\\sum_{k}x[k]\\,e^{-j\\omega k}H(e^{j\\omega})=X(e^{j\\omega})H(e^{j\\omega})\\end{aligned}', label:'Proof',
        note:'Exchange the sums. The inner sum is $h$ shifted by $k$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'The product repeats too', html:'$X$ and $H$ repeat every $2\\pi$, so $Y$ does too: one period, $-\\pi<\\omega\\le\\pi$, is enough.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$X(e^{j\\pi/2})=2$ and $H(e^{j\\pi/2})=0.4$.<div class="nsep"></div>What is $Y(e^{j5\\pi/2})$?',
        ask:{key:'m6-conv', choices:['$0.8$','$0$','$2.4$'], answer:0,
          why:'$5\\pi/2=\\pi/2+2\\pi$ and $Y$ repeats every $2\\pi$, so $Y=2\\cdot0.4=0.8$.'}}]}
  ]}
]},

{ id:'m6-conv-b', module:'M6', nav:'Magnitudes and phases', title:'Magnitudes Multiply, Phases Add', src:'p. 73',
  objective:'Read the convolution property as a product of magnitudes and a sum of phases.',
  keywords:'magnitude product phase sum |Y| = |X||H| angle Y = angle X + angle H a=1/2 b=1/4 periodic', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Convolution and multiplication', src:'p. 73'},
  {t:'title', text:'Magnitudes Multiply, Phases Add'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$|X(e^{j\\omega})|$ and $|H(e^{j\\omega})|$','$|Y(e^{j\\omega})|=|X(e^{j\\omega})|\\,|H(e^{j\\omega})|$','$\\angle Y(e^{j\\omega})=\\angle X(e^{j\\omega})+\\angle H(e^{j\\omega})$']},
      svg:v=>{
      const f=v?v.frame:0;
      if(f<1.5){
        const a=AXW(-3*PI,3*PI,PI,{yr:[-0.3,4.3],ylabel:'\\text{magnitude}',yticksOverride:[0,1,2],ytickfmt:v=>String(v)});
        markPeriod(a,3.2);
        fade(a,f<=1?1:cl(1-2*(f-1)),()=>{
          a.curve(w=>geoMag(w,0.5),{color:C.in,n:3000});
          a.curve(w=>geoMag(w,0.25),{color:C.h,n:3000,dash:'9 6'});
          fade(a,cl(f),()=>a.curve(w=>geoMag(w,0.5)*geoMag(w,0.25),{color:C.out,n:3000})); });
        return a.svg(); }
      const a=AXW(-3*PI,3*PI,PI,{yr:[-1.0,1.5],ylabel:'\\text{phase}\\;(\\text{rad})',xtickfmt:wPi,yticksOverride:[-0.5,0,0.5],ytickfmt:v=>String(v)});
      markPeriod(a,1.12);
      fade(a,cl(2*(f-1.5)),()=>{
        a.curve(w=>geoPh(w,0.5),{color:C.in,n:3000});
        a.curve(w=>geoPh(w,0.25),{color:C.h,n:3000,dash:'9 6'});
        a.curve(w=>geoPh(w,0.5)+geoPh(w,0.25),{color:C.out,n:3000}); });
      return a.svg(); },
      caption:'For $x[n]=(\\tfrac12)^{n}u[n]$ and $h[n]=(\\tfrac14)^{n}u[n]$, over three periods.'},
    {t:'legend', items:[['in','input $X$'],['h','system $H$',true],['out','output $Y$']]}
  ], right:[
    {t:'eq', tex:'|Y(e^{j\\omega})|=|X(e^{j\\omega})|\\,|H(e^{j\\omega})|,\\qquad \\angle Y(e^{j\\omega})=\\angle X(e^{j\\omega})+\\angle H(e^{j\\omega})', label:'Magnitude and phase',
      note:'A product of complex numbers multiplies magnitudes and adds angles.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'|Y(e^{j0})|=\\frac{1}{1-\\frac12}\\cdot\\frac{1}{1-\\frac14}=2\\cdot\\frac43=\\frac83\\approx2.667', label:'At $\\omega=0$',
        note:'At $\\omega=0$, $e^{-j\\omega}=1$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'No bars around an equation', html:'$|Y=XH|$ puts bars around an equation, which is not an operation. Write the two lines separately.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The same $x[n]$ and $h[n]$.<div class="nsep"></div>What is $|Y(e^{j\\pi})|$?',
        ask:{key:'m6-conv-b', choices:['$8/15\\approx0.533$','$8/3\\approx2.667$','$0$'], answer:0,
          why:'At $\\omega=\\pi$, $e^{-j\\pi}=-1$: $|X|=1/(1+\\tfrac12)=\\tfrac23$ and $|H|=1/(1+\\tfrac14)=\\tfrac45$.'}}]}
  ]}
]},

{ id:'m6-conv-ex', module:'M6', nav:'Worked example · two exponentials', title:'Convolution of Two Exponential Sequences', src:'p. 73',
  objective:'Multiply two transforms and split the product into partial fractions in a named variable.',
  keywords:'worked example convolution a^n u[n] b^n u[n] partial fractions z = e^{-j omega} cover up coefficients', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Worked example', src:'p. 73'},
  {t:'title', text:'Convolution of Two Exponential Sequences'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$x[n]=(\\tfrac12)^{n}u[n]$','$h[n]=(\\tfrac14)^{n}u[n]$','$y[n]=x[n]*h[n]$']},
      svg:v=>{
      const f=v?v.frame:0;
      const a=AX({xr:[-3.5,12.5],yr:[-0.15,1.3],xlabel:'n',ylabel:'\\text{amplitude}',yticksOverride:[0,0.5,1],ytickfmt:v=>String(v),xtarget:8});
      const x=n=>n<0?0:Math.pow(0.5,n), h=n=>n<0?0:Math.pow(0.25,n),
            y=n=>n<0?0:(Math.pow(0.5,n+1)-Math.pow(0.25,n+1))/0.25;
      fade(a,cl(1-f),()=>a.stem(D(x,-3,12),{color:C.in}));
      fade(a,cl(1-Math.abs(f-1)),()=>a.stem(D(h,-3,12),{color:C.h}));
      fade(a,cl(f-1),()=>a.stem(D(y,-3,12),{color:C.out}));
      return a.svg(); },
      caption:'The two sequences for $a=\\tfrac12$ and $b=\\tfrac14$, then their convolution.'},
    {t:'legend', items:[['in','$x[n]$'],['h','$h[n]$'],['out','$y[n]$']]}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x[n]=a^{n}u[n]$ and $h[n]=b^{n}u[n]$, with $|a|<1$, $|b|<1$ and $a\\neq b$.<div class="nsep"></div>What is $y[0]$?',
      ask:{key:'m6-conv-ex', choices:['$1$','$0$','$a+b$'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'<ol class="steps"><li>Multiply the transforms and name {{sym:zsub|$z=e^{-j\\omega}$}}. Setting $z=1/a$ later is algebra in $z$ only.</li><li>Split into partial fractions and invert each term.</li></ol>'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'Y(e^{j\\omega})=\\frac{1}{(1-a\\underbrace{e^{-j\\omega}}_{z})(1-b\\,e^{-j\\omega})}=\\frac{1}{(1-az)(1-bz)}=\\frac{A}{1-az}+\\frac{B}{1-bz}', label:'Step 1 · Product'}]},
    {t:'reveal', at:3, items:[
      {t:'eq', tex:'A=\\frac{1}{1-b/a}=\\frac{a}{a-b},\\qquad B=\\frac{1}{1-a/b}=-\\frac{b}{a-b}', label:'Step 2 · Cover-up',
        note:'Cover $1-az$ and set $z=1/a$; cover $1-bz$ and set $z=1/b$.'}]}
  ]}
]},

{ id:'m6-conv-ex-b', module:'M6', nav:'Two exponentials · the output', title:'Output of the Two Exponentials', src:'p. 73',
  objective:'Invert the partial fractions, check the first samples and state the condition a ≠ b.',
  keywords:'solution (a^{n+1}-b^{n+1})/(a-b) check y[1]=0.75 direct convolution a not equal b u[n]', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Worked example', src:'p. 73'},
  {t:'title', text:'Output of the Two Exponentials'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'b', label:'$b$', min:0.05, max:0.45, step:0.05, v:0.25, show:v=>'$'+v.toFixed(2)+'$'}]},
      svg:v=>{
      const b=v?v.b:0.25, aa=0.5;
      const a=AX({xr:[-3.5,12.5],yr:[-0.15,1.3],xlabel:'n',ylabel:'y[n]',yticksOverride:[0,0.5,1],ytickfmt:v=>String(v),xtarget:8});
      a.stem(D(n=>n<0?0:(Math.pow(aa,n+1)-Math.pow(b,n+1))/(aa-b),-3,12),{color:C.out});
      return a.svg(); },
      caption:'The output for $a=\\tfrac12$. Every $b$ gives $y[0]=1$, and the tail decays like the slower sequence, $(\\tfrac12)^{n}$.'}
  ], right:[
    {t:'eq', key:true, tex:'y[n]=\\frac{1}{a-b}\\Bigl[a^{\\,n+1}-b^{\\,n+1}\\Bigr]u[n]', label:'Solution',
      note:'Invert each term and collect: $Aa^{n}+Bb^{n}=\\dfrac{a^{n+1}-b^{n+1}}{a-b}$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Check', html:'For $a=\\tfrac12$, $b=\\tfrac14$ the formula gives $y[0]=1$, $y[1]=0.75$, $y[2]=0.4375$. Directly, $y[1]=x[0]h[1]+x[1]h[0]=\\tfrac14+\\tfrac12=0.75$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'The condition $a\\neq b$', html:'Both coefficients divide by $a-b$. At $a=b$ the two factors are the same, and a later slide in this module derives the pair that replaces this expansion.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'Write $u[n]$ every time', html:'A one-sided sequence is $(\\tfrac12)^{n}u[n]$, never $(\\tfrac12)^{n}$. Without the step it grows without bound as $n\\to-\\infty$ and has no transform.'}]}
  ]}
]},

/* ============================================================ ideal filters */
{ id:'m6-conv-lpf', module:'M6', nav:'Worked example · filter cascade', title:'Cascade of Ideal Low-Pass Filters', src:'p. 74',
  objective:'Multiply two ideal responses, invert the product and check the centre sample.',
  keywords:'ideal low pass cascade narrower band product sin(pi n/4)/(pi n) y[0]=1/4 band edge half open', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Worked example', src:'p. 74'},
  {t:'title', text:'Cascade of Ideal Low-Pass Filters'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$H_1(e^{j\\omega})$ and $H_2(e^{j\\omega})$','$H=H_1H_2$','$y[n]$']},
      svg:v=>{
      const f=v?v.frame:0;
      if(f<1.5){
        const a=AXW(-3*PI,3*PI,PI,{yr:[-0.2,1.9],ylabel:'\\text{frequency response}',yticksOverride:[0,1],ytickfmt:v=>String(v)});
        markPeriod(a,1.24);
        fade(a,f<=1?1:cl(1-2*(f-1)),()=>{
          fade(a,cl(1-0.6*f),()=>{ a.curve(w=>lpf(w,PI/2),{color:C.h,n:8000,dash:'9 6'});
            a.curve(w=>lpf(w,PI/4),{color:C.h,n:8000}); });
          fade(a,cl(f),()=>{ a.area(w=>lpf(w,PI/4),-3*PI,3*PI,{color:C.out+'29',n:4000});
            a.curve(w=>lpf(w,PI/4),{color:C.out,n:8000}); }); });
        return a.svg(); }
      const a=AX({xr:[-16.5,16.5],yr:[-0.1,0.34],xlabel:'n',ylabel:'y[n]',yticksOverride:[0,0.1,0.25],ytickfmt:v=>String(v),xtarget:8});
      fade(a,cl(2*(f-1.5)),()=>a.stem(D(n=>lpfInv(n,PI/4),-16,16),{color:C.out}));
      return a.svg(); },
      caption:'The cutoffs are $\\pi/2$ (dashed) and $\\pi/4$. Only the band both filters pass survives, and it repeats every $2\\pi$.'},
    {t:'legend', items:[['h','$H_1(e^{j\\omega})$',true],['h','$H_2(e^{j\\omega})$'],['out','$H(e^{j\\omega})$ and $y[n]$']]}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$H_1$ is ideal low-pass with cutoff $\\pi/2$ and $H_2$ is ideal low-pass with cutoff $\\pi/4$, in cascade. The input is $x[n]=\\delta[n]$.<div class="nsep"></div>What is $y[0]$?',
      ask:{key:'m6-conv-lpf', choices:['$1/4$','$1/2$','$1/8$'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'Multiply the two responses, then invert with the ideal low-pass pair. Each band is $1$ for $|\\omega|\\le W$ and $0$ for $W<|\\omega|\\le\\pi$: the edge belongs to one branch only.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'H(e^{j\\omega})=\\begin{cases}1,&|\\omega|\\le\\pi/4\\\\0,&\\pi/4<|\\omega|\\le\\pi\\end{cases}\\qquad y[n]=\\frac{\\sin(\\pi n/4)}{\\pi n}', label:'Solution'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Check', html:'$y[0]=\\tfrac{1}{2\\pi}\\int_{-\\pi}^{\\pi}H\\,\\d\\omega=\\tfrac{\\pi/2}{2\\pi}=\\tfrac14$, the limit of $\\sin(\\pi n/4)/(\\pi n)$ at $n=0$. The product commutes, so the order of the filters does not matter.'}]}
  ]}
]},

{ id:'m6-conv-lpf-b', module:'M6', nav:'Worked example · a stepped spectrum', title:'Filtering of a Stepped Spectrum', src:'p. 74',
  objective:'Split a stepped output spectrum into stacked ideal bands and write the sequence.',
  keywords:'stepped spectrum stacked bands ideal low pass product closed form y[0]=3/4 sin(pi n/2) sin(pi n/4)', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Worked example', src:'p. 74'},
  {t:'title', text:'Filtering of a Stepped Spectrum'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$X(e^{j\\omega})$ and $H(e^{j\\omega})$','$Y=XH$','$y[n]$']},
      svg:v=>{
      const f=v?v.frame:0;
      if(f<1.5){
        const a=AXW(-3*PI,3*PI,PI,{yr:[-0.3,3.6],ylabel:'\\text{spectrum}',yticksOverride:[0,1,2],ytickfmt:v=>String(v)});
        markPeriod(a,2.45);
        fade(a,f<=1?1:cl(1-2*(f-1)),()=>{
          fade(a,cl(1-0.65*f),()=>{ a.curve(w=>lpf(w,3*PI/4)+lpf(w,PI/4),{color:C.in,n:9000});
            a.curve(w=>lpf(w,PI/2),{color:C.h,n:9000,dash:'9 6'}); });
          fade(a,cl(f),()=>{ a.area(w=>lpf(w,PI/2)+lpf(w,PI/4),-3*PI,3*PI,{color:C.out+'29',n:4000});
            a.curve(w=>lpf(w,PI/2)+lpf(w,PI/4),{color:C.out,n:9000}); }); });
        return a.svg(); }
      const a=AX({xr:[-16.5,16.5],yr:[-0.25,0.95],xlabel:'n',ylabel:'y[n]',yticksOverride:[0,0.25,0.75],ytickfmt:v=>String(v),xtarget:8});
      fade(a,cl(2*(f-1.5)),()=>a.stem(D(n=>lpfInv(n,PI/2)+lpfInv(n,PI/4),-16,16),{color:C.out}));
      return a.svg(); },
      caption:'The filter keeps the inner step of $X$ and cuts the outer step back to $\\pi/2$.'},
    {t:'legend', items:[['in','$X(e^{j\\omega})$'],['h','$H(e^{j\\omega})$',true],['out','$Y(e^{j\\omega})$ and $y[n]$']]}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$X=2$ on $|\\omega|\\le\\pi/4$, $1$ on $\\pi/4<|\\omega|\\le3\\pi/4$, $0$ up to $\\pi$; $H$ is ideal low-pass, cutoff $\\pi/2$.<div class="nsep"></div>What is $y[0]$?',
      ask:{key:'m6-conv-lpf-b', choices:['$3/4$','$1$','$1/2$'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'<ol class="steps"><li>Multiply: $Y=2$ on $|\\omega|\\le\\pi/4$, $1$ on $\\pi/4<|\\omega|\\le\\pi/2$, $0$ up to $\\pi$.</li><li>Read $Y$ as a band of height 1 out to $\\pi/2$ plus a band of height 1 out to $\\pi/4$.</li><li>Invert each band and add.</li></ol>'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'y[n]=\\frac{\\sin(\\pi n/2)}{\\pi n}+\\frac{\\sin(\\pi n/4)}{\\pi n}', label:'Solution'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Check', html:'$y[0]=\\tfrac12+\\tfrac14=\\tfrac34$. The area of one period of $Y$ is $2\\cdot\\tfrac{\\pi}{2}+1\\cdot\\tfrac{\\pi}{2}=\\tfrac{3\\pi}{2}$, and $\\tfrac{3\\pi/2}{2\\pi}=\\tfrac34$.'}]}
  ]}
]},

/* ============================================================ multiplication */
{ id:'m6-mult', module:'M6', nav:'Multiplication property', title:'Multiplication Property', src:'p. 75',
  objective:'State the multiplication property with the periodic convolution over one period.',
  keywords:'multiplication property periodic convolution one period 2pi 1/2pi integral overlap area z[0]', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Convolution and multiplication', src:'p. 75'},
  {t:'title', text:'Multiplication Property'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'w', label:'$\\omega$', min:-1, max:1, step:0.05, v:0, show:v=>'$'+v.toFixed(2)+'\\pi,\\;Z(e^{j\\omega})='+perConv(v*PI,3*PI/4,PI/2).toFixed(3)+'$'}]},
      svg:v=>{
      const w0=(v?v.w:0)*PI;
      const a=AXW(-3*PI,3*PI,PI,{xlabel:'\\theta',yr:[-0.25,1.9],ylabel:'\\text{spectrum}',yticksOverride:[0,1],ytickfmt:v=>String(v)});
      const Xf=t=>lpf(t,3*PI/4), Yf=t=>lpf(w0-t,PI/2);
      a.area(t=>Xf(t)*Yf(t),-PI,PI,{color:C.out+'40',n:2400});
      a.curve(Xf,{color:C.in,n:9000});
      a.curve(Yf,{color:C.h,n:9000,dash:'9 6'});
      markPeriod(a,1.25);
      return a.svg(); },
      caption:'$X$ has half-width $3\\pi/4$ and $Y$ half-width $\\pi/2$. For each $\\omega$, $Z(e^{j\\omega})$ is the shaded area inside one period divided by $2\\pi$.'},
    {t:'legend', items:[['in','$X(e^{j\\theta})$'],['h','$Y(e^{j(\\omega-\\theta)})$',true],['out','product over one period']]}
  ], right:[
    {t:'eq', key:true, tex:'z[n]=x[n]\\,y[n]\\;\\longleftrightarrow\\;Z(e^{j\\omega})=\\frac{1}{2\\pi}\\int_{2\\pi}X(e^{j\\theta})\\,Y\\bigl(e^{j(\\omega-\\theta)}\\bigr)\\,\\d\\theta', label:'Multiplication property',
      note:'This is {{sym:pconv|periodic convolution}}, $X\\circledast Y$: the integral covers one period of $2\\pi$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'err', head:'One period, not the whole line', html:'Both factors repeat every $2\\pi$. An integral over all $\\theta$ would count the same overlap once in every period and diverge.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Reading the figure', html:'Slide $Y$ to $\\omega$, multiply by $X$ over one period and divide the area by $2\\pi$. At $\\omega=0$ the overlap is $\\pi$ wide, so $Z(e^{j0})=\\tfrac12$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$x[0]=2$ and $y[0]=0.5$.<div class="nsep"></div>What is $\\frac{1}{2\\pi}\\int_{2\\pi}Z(e^{j\\omega})\\,\\d\\omega$?',
        ask:{key:'m6-mult', choices:['$1$','$2.5$','$2\\pi$'], answer:0,
          why:'By the synthesis equation at $n=0$ it is $z[0]=x[0]\\,y[0]=1$.'}}]}
  ]}
]},

{ id:'m6-mult-scrub', module:'M6', nav:'Periodic convolution · step by step', title:'Periodic Convolution, Step by Step', src:'p. 75',
  objective:'Trace the periodic convolution one frequency at a time: slide, multiply over one period, take the area.',
  keywords:'periodic convolution step by step slider trace overlap area one period Z repeats every 2pi bands 3pi/4 pi/2', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 6 · Convolution and multiplication', src:'p. 75'},
  {t:'title', text:'Periodic Convolution, Step by Step'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'w', label:'$\\omega$', min:-3, max:3, step:1/16, v:0.5,
        show:v=>'$'+s5PiTex(v)+',\\;Z(e^{j\\omega})='+perConv(v*PI,3*PI/4,PI/2).toFixed(3)+'$'}]},
      svg:v=>{
      const w0=(v?v.w:0.5)*PI, Zf=w=>perConv(w,3*PI/4,PI/2);
      return s5Stack([400,416], [0.56,0.56], h=>{
        const a=AXW(-3*PI,3*PI,PI,{h,xlabel:'\\theta',yr:[-0.2,P.labelScale()>1?1.9:1.6],ylabel:'\\text{spectrum}',yticksOverride:[0,1],ytickfmt:v=>String(v)});
        const Xf=t=>lpf(t,3*PI/4), Yf=t=>lpf(w0-t,PI/2);
        a.area(t=>Xf(t)*Yf(t),-PI,PI,{color:C.out+'40',n:2400});
        a.curve(Xf,{color:C.in,n:9000});
        a.curve(Yf,{color:C.h,n:9000,dash:'9 6'});
        markPeriod(a,1.38);
        return a.svg(); }, h=>{
        const a=AXW(-3*PI,3*PI,PI,{h,yr:[-0.08,0.8],ylabel:'Z(e^{j\\omega})',yticksOverride:P.labelScale()>1?[0.5]:[0.25,0.5],ytickfmt:v=>String(v)});
        markPeriod(a,0.68);
        fade(a,.28,()=>a.curve(Zf,{color:C.out,n:6000}));
        a.curve(w=>w<=w0+1e-9?Zf(w):NaN,{color:C.out,n:6000});
        a.vline(w0,{color:C.muted,opacity:.6});
        a.point(w0,Zf(w0),{color:C.out,ring:C.plate,r:5.2});
        return a.svg(); }); },
      caption:'$X$ has half-width $3\\pi/4$ and $Y$ half-width $\\pi/2$. Drag $\\omega$: the shaded overlap, over $2\\pi$, is the dot that traces $Z(e^{j\\omega})$.'},
    {t:'legend', items:[['in','$X(e^{j\\theta})$'],['h','$Y(e^{j(\\omega-\\theta)})$',true]]}
  ], right:[
    {t:'note', kind:'warn', head:'Two panels, one slider', html:'The upper panel is the integrand at one $\\omega$. Its shaded area divided by $2\\pi$ is one value of $Z$, the dot in the lower panel.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'Z\\bigl(e^{j(\\omega+2\\pi)}\\bigr)=Z(e^{j\\omega})', label:'The trace repeats',
        note:'Moving $\\omega$ by $2\\pi$ moves $Y$ by one whole period, so the overlap does not change.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'$X$ keeps half-width $3\\pi/4$; $Y$ is narrowed to half-width $\\pi/4$.<div class="nsep"></div>What is $Z(e^{j0})$?',
        ask:{key:'m6-mult-scrub', choices:['$1/4$','$1/2$','$1/8$'], answer:0,
          why:'At $\\omega=0$ the band of $Y$ lies inside $X$, so the overlap is $\\pi/2$ wide and $Z=\\frac{\\pi/2}{2\\pi}=\\tfrac14$.'}}]}
  ]}
]},

{ id:'m6-mult-b', module:'M6', nav:'Worked example · the overlap', title:'Spectral Overlap at a Band Edge', src:'pp. 75–76',
  objective:'Convolve two bands over one period, add the copy that crosses the boundary and check against z[0].',
  keywords:'periodic convolution overlap trapezoid 1/8 plus 1/8 = 1/4 band edge check z[0]=0.375 sketch', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Worked example', src:'pp. 75–76'},
  {t:'title', text:'Spectral Overlap at a Band Edge'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, sketch:{label:'Sketch $Z(e^{j\\omega})$ on the axes, then check it.'}, svg:()=>{
      const a=AXW(-3*PI,3*PI,PI,{yr:[-0.3,1.9],ylabel:'\\text{spectrum}',yticksOverride:[0,0.25,0.5,1],ytickfmt:v=>String(v)});
      skArea(a);
      fade(a,.4,()=>{ a.curve(w=>lpf(w,3*PI/4),{color:C.in,n:9000,dash:'9 6'});
        a.curve(w=>lpf(w,PI/2),{color:C.h,n:9000,dash:'4 5'}); });
      markPeriod(a,1.22);
      a.raw('<g class="sk-key">');
      for(let k=-2;k<=2;k++) a.curve(w=>rectConv(w-2*PI*k,3*PI/4,PI/2),{color:C.mid,n:4000,width:1.4,dash:'4 5'});
      a.curve(w=>perConv(w,3*PI/4,PI/2),{color:C.out,n:6000});
      a.raw('</g>');
      return a.svg(); },
      caption:'The faint bands are $X$ and $Y$. Sketch $Z$ over three periods, then show the answer.'},
    {t:'legend', items:[['in','$X(e^{j\\omega})$',true],['h','$Y(e^{j\\omega})$',true],['mid','one copy',true],['out','$Z(e^{j\\omega})$']]}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x[n]=\\dfrac{\\sin(3\\pi n/4)}{\\pi n}$ and $y[n]=\\dfrac{\\sin(\\pi n/2)}{\\pi n}$: bands of height 1 and half-widths $3\\pi/4$ and $\\pi/2$.<div class="nsep"></div>Find $Z(e^{j\\omega})$ for $z[n]=x[n]\\,y[n]$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'<ol class="steps"><li>Convolve the two bands as if on a line: a trapezoid, flat at $\\tfrac{\\pi}{2\\pi}=\\tfrac12$ on $|\\omega|\\le\\pi/4$ and zero from $|\\omega|=5\\pi/4$.</li><li>$5\\pi/4>\\pi$, so the copies centred at $\\pm2\\pi$ reach into this period. Add them.</li></ol>'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'Z(e^{j0})=\\tfrac12,\\quad Z(e^{j3\\pi/4})=\\tfrac14,\\quad Z(e^{j\\pi})=\\underbrace{\\tfrac18}_{\\text{own copy}}+\\underbrace{\\tfrac18}_{\\text{next copy}}=\\tfrac14', label:'Solution',
        note:'$Z$ falls in a straight line from $\\tfrac12$ at $\\pi/4$ to $\\tfrac14$ at $3\\pi/4$, then stays at $\\tfrac14$ across $\\pm\\pi$, where two copies meet.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Check', html:'$\\tfrac{1}{2\\pi}\\int_{-\\pi}^{\\pi}Z\\,\\d\\omega=0.375$, and the synthesis equation at $n=0$ needs $z[0]=x[0]\\,y[0]=\\tfrac34\\cdot\\tfrac12=0.375$.'}]}
  ]}
]},

{ id:'m6-mult-c', module:'M6', nav:'Multiplication · when copies meet', title:'When the Copies Overlap', src:'pp. 75–76',
  objective:'State when periodic and ordinary convolution agree, and separate this overlap from aliasing.',
  keywords:'periodic convolution ordinary convolution agree triangle fills one period W_X + W_Y > pi overlap not aliasing', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Convolution and multiplication', src:'pp. 75–76'},
  {t:'title', text:'When the Copies Overlap'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'wy', label:'$W_Y$', min:0.125, max:0.75, step:0.125, v:0.5, show:v=>'$'+s5Frac(v)+'$'}]},
      svg:v=>{
      const Wx=PI/2, Wy=(v?v.wy:0.5)*PI;
      const a=AXW(-3*PI,3*PI,PI,{yr:[-0.08,0.95],ylabel:'Z(e^{j\\omega})',yticksOverride:[0,0.25,0.5],ytickfmt:v=>String(v)});
      markPeriod(a,0.7);
      for(let k=-2;k<=2;k++) a.curve(w=>rectConv(w-2*PI*k,Wx,Wy),{color:C.mid,n:4000,width:1.4,dash:'4 5'});
      a.curve(w=>perConv(w,Wx,Wy),{color:C.out,n:6000});
      return a.svg(); },
      caption:'Bands of half-width $W_X=\\pi/2$ and $W_Y$. At $W_Y=\\pi/2$ each copy is a triangle of peak $\\tfrac12$ that ends exactly at $\\pm\\pi$.'},
    {t:'legend', items:[['mid','one copy',true],['out','$Z(e^{j\\omega})$']]}
  ], right:[
    {t:'note', kind:'ok', head:'When ordinary convolution is enough', html:'If each copy ends inside its own period, periodic and ordinary convolution give the same values on that period.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\text{copies overlap}\\iff W_X+W_Y>\\pi', label:'Overlap condition',
        note:'Each copy reaches $W_X+W_Y$ either side of its centre; the centres are $2\\pi$ apart.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'What this is not', html:'This overlap is between copies of a periodic spectrum, and it can happen for any product of sequences. Module 7 has a different overlap, between replicas made by sampling; only that one is aliasing.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$X$ has half-width $\\pi/4$ and $Y$ has half-width $\\pi/2$.<div class="nsep"></div>Do the copies of $Z$ overlap?',
        ask:{key:'m6-mult-c', choices:['No','Yes'], answer:0,
          why:'Each copy ends at $\\pi/4+\\pi/2=3\\pi/4$, which is less than $\\pi$.'}}]}
  ]}
]},

/* ============================================================ modulation */
{ id:'m6-mult-ex', module:'M6', nav:'Worked example · modulation', title:'Discrete-Time Modulation', src:'p. 76',
  objective:'Take one period of an impulse train into a periodic convolution and sift.',
  keywords:'modulation cosine carrier impulse train one period sift pi/3 periodic convolution commutes', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Worked example', src:'p. 76'},
  {t:'title', text:'Discrete-Time Modulation'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$X(e^{j\\omega})$','$Y(e^{j\\omega})$: impulses at $\\pm\\pi/3$']},
      svg:v=>{
      const f=cl(v?v.frame:0);
      const a=AXW(-3*PI,3*PI,PI,{yr:[-0.3,5.3],ylabel:'\\text{spectrum}',yticksOverride:[0,1,PI],ytickfmt:piTick});
      markPeriod(a,3.75);
      fade(a,1-0.6*f,()=>a.curve(w=>lpf(w,PI/4),{color:C.in,n:9000}));
      fade(a,f,()=>{ for(let k=-2;k<=2;k++) for(const s of [1,-1]){ const w=s*PI/3+2*PI*k;
        if(Math.abs(w)<=3*PI) a.impulse(w,PI,{color:C.h,label:false}); } });
      return a.svg(); },
      caption:'The band of half-width $\\pi/4$, then the transform of $\\cos(\\pi n/3)$: impulses of weight $\\pi$. Only two of them lie inside the marked period.'},
    {t:'legend', items:[['in','$X(e^{j\\omega})$'],['h','$Y(e^{j\\omega})$']]}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$X(e^{j\\omega})=1$ on $|\\omega|\\le\\pi/4$, $0$ up to $\\pi$; $y[n]=\\cos(\\pi n/3)$.<div class="nsep"></div>Where is the upper band of $Z$ for $z[n]=x[n]\\,y[n]$?',
      ask:{key:'m6-mult-ex', choices:['$\\pi/12\\le\\omega\\le7\\pi/12$','$\\pi/3\\le\\omega\\le7\\pi/12$','$|\\omega|\\le7\\pi/12$'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'Write $Y$ as a train of impulses, keep the two inside one period and sift. Each impulse places a copy of $X$.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'Y(e^{j\\omega})=\\pi\\sum_{l=-\\infty}^{\\infty}\\Bigl[\\delta\\bigl(\\omega-\\tfrac{\\pi}{3}-2\\pi l\\bigr)+\\delta\\bigl(\\omega+\\tfrac{\\pi}{3}-2\\pi l\\bigr)\\Bigr]', label:'Step 1 · The carrier',
        note:'In one period only $l=0$ is left: weight $\\pi$ at $\\theta=\\pm\\pi/3$.'}]},
    {t:'reveal', at:3, items:[
      {t:'eq', tex:'\\begin{aligned}Z(e^{j\\omega})&=\\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi}Y(e^{j\\theta})\\,X\\bigl(e^{j(\\omega-\\theta)}\\bigr)\\,\\d\\theta\\\\&=\\frac{\\pi}{2\\pi}\\Bigl[X\\bigl(e^{j(\\omega-\\frac{\\pi}{3})}\\bigr)+X\\bigl(e^{j(\\omega+\\frac{\\pi}{3})}\\bigr)\\Bigr]\\end{aligned}', label:'Step 2 · Sift',
        note:'Periodic convolution commutes, so $Y$ may stand first.'}]}
  ]}
]},

{ id:'m6-mult-ex-b', module:'M6', nav:'Modulation · the spectrum', title:'Spectrum of the Modulated Sequence', src:'p. 76',
  objective:'Compute the band edges of the modulated spectrum and check them against z[0].',
  keywords:'modulated spectrum band edges pi/12 7pi/12 half height check z[0]=1/4 overlap near 0 and pi sketch', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Worked example', src:'p. 76'},
  {t:'title', text:'Spectrum of the Modulated Sequence'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, sketch:{label:'Sketch $Z(e^{j\\omega})$ on the axes, then check it.'}, svg:()=>{
      const a=AXW(-3*PI,3*PI,PI,{yr:[-0.3,1.6],ylabel:'\\text{spectrum}',yticksOverride:[0,0.5,1],ytickfmt:v=>String(v)});
      skArea(a);
      fade(a,.4,()=>a.curve(w=>lpf(w,PI/4),{color:C.in,n:9000,dash:'9 6'}));
      markPeriod(a,1.22);
      a.raw('<g class="sk-key">');
      a.curve(w=>0.5*lpf(w-PI/3,PI/4)+0.5*lpf(w+PI/3,PI/4),{color:C.out,n:12000});
      a.raw('</g>');
      return a.svg(); },
      caption:'The faint band is $X$. Sketch $Z$ for $\\omega_0=\\pi/3$ over three periods, then show the answer.'},
    {t:'legend', items:[['in','$X(e^{j\\omega})$',true],['out','$Z(e^{j\\omega})$']]}
  ], right:[
    {t:'eq', key:true, tex:'Z(e^{j\\omega})=\\tfrac12X\\bigl(e^{j(\\omega-\\omega_0)}\\bigr)+\\tfrac12X\\bigl(e^{j(\\omega+\\omega_0)}\\bigr)', label:'Solution',
      note:'The factor $\\tfrac{1}{2\\pi}\\cdot\\pi=\\tfrac12$ sets the height of each copy.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\frac{\\pi}{3}-\\frac{\\pi}{4}=\\frac{\\pi}{12},\\qquad \\frac{\\pi}{3}+\\frac{\\pi}{4}=\\frac{7\\pi}{12}', label:'Band edges',
        note:'The mirror copy covers $-7\\pi/12\\le\\omega\\le-\\pi/12$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Check', html:'$z[0]=x[0]\\cos0=\\tfrac14$. From $Z$: two bands of height $\\tfrac12$ and width $\\tfrac{\\pi}{2}$ have area $\\tfrac{\\pi}{2}$, and $\\tfrac{\\pi/2}{2\\pi}=\\tfrac14$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'Where the copies meet', html:'The copies stay apart only for $\\pi/4\\le\\omega_0\\le3\\pi/4$. A smaller $\\omega_0$ makes them overlap at $\\omega=0$; a larger one makes them overlap at $\\omega=\\pm\\pi$, with the copies of the next period.'}]}
  ]}
]},

/* ============================================================ windows */
{ id:'m6-leak', module:'M6', nav:'Leakage · a cosine through a window', title:'Seeing a Cosine Through a Window',
  objective:'See a cosine kept for L samples turn each spectral line into a main lobe of width 4π/L with side lobes.',
  keywords:'leakage window rectangular finite record cosine Dirichlet kernel main lobe 4pi/L side lobes multiplication property', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 6 · Convolution and multiplication'},
  {t:'title', text:'Seeing a Cosine Through a Window'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[
        {k:'w', label:'$\\omega_0$', min:1/8, max:7/8, step:1/16, v:1/4, show:v=>'$'+s5PiTex(v)+'$'},
        {k:'L', label:'$L$', min:8, max:32, step:1, v:16, show:v=>'$'+v+'$'}]},
      svg:v=>{
      const w0=(v?v.w:0.25)*PI, L=v?v.L:16;
      const x=[]; for(let n=0;n<L;n++) x.push(Math.cos(w0*n));
      return s5Stack([380,414], [0.36,0.48], h=>{
        const a=AX({h,xr:[-4.5,36.5],yr:[-1.35,1.35],xlabel:'n',ylabel:'x[n]',yticksOverride:[-1,0,1],ytickfmt:v=>String(v),xtarget:8});
        fade(a,.25,()=>a.stem(D(n=>n>=0&&n<L?NaN:Math.cos(w0*n),-4,36).filter(p=>isFinite(p[1])),{color:C.in,r:2.6}));
        a.stem(D(n=>Math.cos(w0*n),0,L-1),{color:C.in,r:3});
        return a.svg(); }, h=>{
        const a=AXW(-3*PI,3*PI,PI,{h,yr:[-0.1,1.45],ylabel:'\\tfrac{2}{L}\\,|X(e^{j\\omega})|',yticksOverride:[0,0.5,1],ytickfmt:v=>String(v)});
        for(let k=-1;k<=1;k++) for(const s of [1,-1]) a.poly([[s*w0+2*PI*k,0],[s*w0+2*PI*k,1.15]],{color:C.in,width:1,dash:'3 4'});
        markPeriod(a,1.3);
        a.curve(w=>2/L*s5Mag(x,w),{color:C.out,n:3600});
        return a.svg(); }); },
      caption:'The upper panel keeps $L$ samples of $\\cos(\\omega_0 n)$; the faint ones are discarded. The dashed lines mark $\\pm\\omega_0$, where the endless cosine has its impulses.'}
  ], right:[
    {t:'eq', tex:'X(e^{j\\omega})=\\tfrac12\\,W\\bigl(e^{j(\\omega-\\omega_0)}\\bigr)+\\tfrac12\\,W\\bigl(e^{j(\\omega+\\omega_0)}\\bigr)', label:'Window times cosine',
      note:'Here $x[n]=\\cos(\\omega_0 n)\\,w[n]$, with $w[n]=1$ for $0\\le n\\le L-1$. By the multiplication property, each line of the cosine becomes a copy of the window\'s transform $W$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'A line becomes a lobe', html:'$|W(e^{j\\omega})|=\\bigl|\\sin(\\omega L/2)/\\sin(\\omega/2)\\bigr|$ first reaches zero at $\\omega=\\pm2\\pi/L$, so each line spreads into a main lobe $4\\pi/L$ wide. Its side lobes leak into every other frequency.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'A cosine is kept for $L=16$ samples.<div class="nsep"></div>What happens to its main lobe when $L=32$?',
        ask:{key:'m6-leak', choices:['It is half as wide','It is twice as wide','It keeps its width'], answer:0,
          why:'The width is $4\\pi/L$: $\\pi/4$ for $L=16$ and $\\pi/8$ for $L=32$.'}}]}
  ]}
]},

{ id:'m6-leak-b', module:'M6', nav:'Leakage · a softer window', title:'A Softer Window',
  objective:'Compare the rectangular and the Hann window on a record that holds a strong and a weak cosine.',
  keywords:'Hann window rectangular window leakage side lobes dB main lobe 8pi/L -13 dB -31 dB weak cosine hidden spectral analysis', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 6 · Convolution and multiplication'},
  {t:'title', text:'A Softer Window'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['Rectangular window','Hann window']},
      svg:v=>{
      const f=cl(v?v.frame:0), L=S5L;
      const win=n=>(n<0||n>L-1)?0:(1-f)+f*s5Hann(n,L);
      const xr=n=>Math.cos(S5W1*n)+S5A2*Math.cos(S5W2*n);
      const x=[]; for(let n=0;n<L;n++) x.push(xr(n)*win(n));
      let pk=0; for(let i=0;i<=400;i++) pk=Math.max(pk,s5Mag(x,S5W1+(i-200)*PI/6400));
      const FL=100, dB=w=>Math.max(20*Math.log10(Math.max(s5Mag(x,w)/pk,1e-12)),-FL)+FL;
      return s5Stack([380,414], [0.34,0.42], h=>{
        const a=AX({h,xr:[-2.5,52.5],yr:[-1.35,1.35],xlabel:'n',ylabel:'x[n]\\,w[n]',yticksOverride:[-1,0,1],ytickfmt:v=>String(v),xtarget:8});
        a.curve(win,{color:C.h,n:1400,dash:'9 6'}); a.curve(t=>-win(t),{color:C.h,n:1400,dash:'9 6'});
        a.stem(D(n=>xr(n)*win(n),-2,52),{color:C.in,r:2.6});
        return a.svg(); }, h=>{
        const a=AXW(-2*PI,2*PI,PI/2,{h,yr:[-4,114],ylabel:'|X(e^{j\\omega})|\\;(\\text{dB})',yticksOverride:P.labelScale()>1?[20,60,100]:[20,40,60,80,100],ytickfmt:v=>String(v-FL)});
        markPeriod(a,108);
        a.curve(dB,{color:C.out,n:5200,width:1.8});
        a.poly([[S5W2,0],[S5W2,87]],{color:C.muted,width:1,dash:'3 4'});
        return a.svg(); }); },
      caption:'$x[n]=\\cos(\\pi n/4)+0.01\\cos(21\\pi n/32)$ kept for $L=32$ samples, in dB against the strong peak. The dashed line marks $\\omega_2=21\\pi/32$.'},
    {t:'legend', items:[['in','$x[n]\\,w[n]$'],['h','$\\pm w[n]$',true]]}
  ], right:[
    {t:'note', kind:'warn', head:'A weak cosine hides', html:'The second cosine is $40$ dB weaker than the first. Under the rectangular window its peak lies below the side lobes of the strong one, near $-21$ dB.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'What Hann trades', html:'<div class="cmp"><div><span class="cmp-h">Rectangular</span>Main lobe $4\\pi/L$ wide. Highest side lobe about $-13$ dB.</div><div><span class="cmp-h">Hann</span>$w[n]=\\sin^2(\\pi n/L)$. Main lobe $8\\pi/L$ wide. Highest side lobe about $-31$ dB.</div></div>'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'The weak cosine is made $10$ times weaker, $-60$ dB.<div class="nsep"></div>Does the Hann window still show it?',
        ask:{key:'m6-leak-b', choices:['No','Yes'], answer:0,
          why:'Near $\\omega_2$ the Hann side lobes of the strong cosine reach about $-54$ dB, above $-60$ dB.'}}]}
  ]}
]},

/* ============================================================ spectrogram */
{ id:'m6-stft', module:'M6', nav:'Spectrum over time', title:'Spectrum Over Time',
  objective:'Build a spectrogram one column at a time: slide a window along the sequence and take the DTFT magnitude of each piece.',
  keywords:'spectrogram short-time Fourier transform window slide column time frequency map tone pairs notes Hann', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 6 · Convolution and multiplication'},
  {t:'title', text:'Spectrum Over Time'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'m', label:'$m$', min:0, max:S5N-S5L, step:S5HOP, v:S5N-S5L, show:v=>'$n='+v+'\\ldots'+(v+S5L-1)+'$'}]},
      svg:v=>{
      const m=v?v.m:S5N-S5L, ROWS=48;
      return s5Stack([380,414], [0.38,0.47], h=>{
        const a=AX({h,xr:[-4,S5N+4],yr:[-2.4,2.4],xlabel:'n',ylabel:'x[n]',yticksOverride:[-2,0,2],ytickfmt:v=>String(v),xtarget:8});
        for(let k=1;k<4;k++) a.vline(k*S5SEG-0.5,{color:C.muted,opacity:.55});
        a.under(`<rect x="${a.sx(m-0.5).toFixed(2)}" y="${a.y1}" width="${(a.sx(m+S5L-0.5)-a.sx(m-0.5)).toFixed(2)}" height="${a.y0-a.y1}" fill="${C.h}" fill-opacity=".14"/>`);
        fade(a,.3,()=>a.stem(D(n=>n>=m&&n<m+S5L?NaN:s5Tones(n),0,S5N-1).filter(p=>isFinite(p[1])),{color:C.in,r:1.3,width:1}));
        a.stem(D(s5Tones,m,m+S5L-1),{color:C.in,r:1.6,width:1.2});
        a.curve(t=>t<m-0.5||t>m+S5L-0.5?NaN:2*s5Hann(t-m,S5L),{color:C.h,n:1600,dash:'9 6'});
        return a.svg(); }, h=>{
        const a=AX({h,xr:[-4,S5N+4],yr:[0,PI],xlabel:'n',ylabel:'\\omega',yticksOverride:[0,PI/4,PI/2,3*PI/4,PI],ytickfmt:piTick,xtarget:8,yticksLeft:false,grid:false});
        const cells=[];
        for(let mm=0;mm<=m;mm+=S5HOP){ const col=s5Column(mm,ROWS), c=mm+S5L/2;
          const xa=a.sx(c-S5HOP/2), xb=a.sx(c+S5HOP/2);
          col.forEach((d,r)=>{ const op=cl(1+d/30); if(op<=0.02) return;
            const ya=a.sy((r+1)*PI/ROWS), yb=a.sy(r*PI/ROWS);
            cells.push(`<rect x="${xa.toFixed(2)}" y="${ya.toFixed(2)}" width="${(xb-xa).toFixed(2)}" height="${(yb-ya).toFixed(2)}" fill="${C.in}" fill-opacity="${op.toFixed(3)}"/>`); }); }
        a.under('<g shape-rendering="crispEdges">'+cells.join('')+'</g>');
        for(let k=1;k<4;k++) a.vline(k*S5SEG-0.5,{color:C.muted,opacity:.55});
        const c=m+S5L/2;
        a.rect(c-S5HOP/2,0,c+S5HOP/2,PI,{stroke:C.h,width:2});
        return a.svg(); }); },
      caption:'Four notes of $48$ samples, each a pair of tones, seen through the shaded window. Stronger colour is a larger magnitude, over $30$ dB.'}
  ], right:[
    {t:'eq', tex:'X_m(e^{j\\omega})=\\sum_{n=m}^{m+L-1}x[n]\\,w[n-m]\\,e^{-j\\omega n}', label:'One column',
      note:'Column $m$ is $|X_m(e^{j\\omega})|$, for a Hann window of $L=32$. It is even in $\\omega$ and repeats every $2\\pi$, so $0\\le\\omega\\le\\pi$ is enough.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'Reading the map', html:'Time runs to the right and frequency upward. Each note shows as two bands, one for each of its tones. A window that spans two notes gives a blurred column.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'The same notes, seen through a Hann window of $L=64$.<div class="nsep"></div>What happens to the map?',
        ask:{key:'m6-stft', choices:['Narrower bands, more blur','Wider bands, less blur','No change'], answer:0,
          why:'The main lobe $8\\pi/L$ is half as wide, but a window of $64$ samples spans a note change in more columns.'}}]}
  ]}
]},

realGallery({ id:'m6-real-conv', nav:'Filters and products around us',
  title:'Filters and Products Around Us', eyebrow:'Module 6 · Convolution and multiplication', src:'pp. 73–76',
  objective:'Recognise convolution and multiplication of sequences in everyday signals.',
  keywords:'examples moving average electricity echo audio filter cascade chopper amplifier convolution multiplication',
  figs:[
    [()=>{ const x=n=>12+3*Math.sin(2*PI*n/7)+1.6*Math.sin(2.3*n+1)+1.1*Math.cos(1.7*n);
      const y=n=>{ let s=0; for(let k=0;k<7;k++) s+=x(n-k); return s/7; };
      const a=P.Axes(EXO({xr:[-1,29],xlabel:'n\\;(\\text{day})',ylabel:'\\text{energy}\\;(\\text{kWh})',xstep:7,yr:[0,27]}));
      a.stem(D(x,0,28),{color:C.in,r:2.4});
      a.stem(D(y,0,28),{color:C.out,r:2.6});
      return a.svg(); }, 'Daily electricity use and its $7$-day average $y[n]=\\tfrac17\\sum_{k=0}^{6}x[n-k]$: a convolution.',
      [['in','$x[n]$'],['out','$y[n]$']]],
    [()=>{ const x=n=>n<0?0:Math.pow(0.7,n)*Math.cos(1.2*n);
      const a=P.Axes(EXO({xr:[-1,25],yr:[-1.0,1.35],xlabel:'n\\;(\\text{ms})',ylabel:'y[n]',xstep:5}));
      a.stem(D(n=>x(n)+0.6*x(n-10),0,24),{color:C.out,r:2.4});
      return a.svg(); }, 'A clap $x[n]=0.7^{n}\\cos(1.2n)\\,u[n]$ and its echo $10\\ \\text{ms}$ later: $y[n]=x[n]+0.6\\,x[n-10]$.'],
    [()=>{ const H=f=>{ const w=2*PI*f/8; return 0.5/Math.sqrt(1.25-Math.cos(w))*Math.abs(Math.cos(w/2)); };
      const a=P.Axes(EXO({xr:[-12,12],yr:[-0.1,1.5],xlabel:'f\\;(\\text{kHz})',ylabel:'|H|',xstep:4,yticksLeft:true}));
      s5PeriodKHz(a,1.2,4);
      a.curve(H,{color:C.h,n:2400});
      return a.svg(); }, 'Two smoothers in cascade at $8\\ \\text{kHz}$: $|H|=|H_1|\\,|H_2|$, $H_1=\\tfrac{0.5}{1-0.5e^{-j\\omega}}$, $H_2=\\tfrac{1+e^{-j\\omega}}{2}$, $\\omega=\\tfrac{2\\pi f}{8}$.'],
    [()=>{ const x=t=>4+Math.sin(2*PI*t/24);
      const a=P.Axes(EXO({xr:[-1,25],xlabel:'n\\;(\\text{ms})',ylabel:'v[n]\\;(\\text{mV})',xstep:4,yr:[-6.2,8.4]}));
      a.curve(x,{color:C.in,dash:'9 6',n:600}); a.curve(t=>-x(t),{color:C.in,dash:'9 6',n:600});
      a.stem(D(n=>x(n)*Math.cos(PI*n),0,24),{color:C.out,r:2.4});
      return a.svg(); }, 'A chopper flips every other sample of a sensor voltage $x[n]=4+\\sin(2\\pi n/24)$: $v[n]=x[n]\\cos(\\pi n)$.',
      [['in','$\\pm x[n]$',true],['out','$v[n]$']]]
  ],
  notes:[
    {t:'note', kind:'def', head:'Two operations', html:'An average, an echo and a filter cascade convolve in time. A chopper multiplies in time.'},
    {t:'note', kind:'warn', head:'Why this matters', html:'The chopper moves the band of $x$ to $\\omega=\\pi$, next to the copy from the neighbouring period.'}
  ]}),

labScene({ id:'m6-lab-i5', lab:'I5', nav:'Filtering and Modulation', title:'Products and Periodic Convolution', src:'pp. 73–76',
  objective:'Filter or modulate a sequence and watch the product or the periodic convolution form over several periods.',
  keywords:'laboratory convolution multiplication filter ideal first order modulation carrier cos periodic convolution overlap copies' }),

codeScene({ id:'m6-code-conv', nav:'Convolution and multiplication', title:'Convolution and Multiplication in Code', src:'pp. 73–76', eyebrow:'Convolution and multiplication in code',
  objective:'Check the convolution and multiplication properties for sequences in MATLAB and in Python, and predict each result before running it.',
  keywords:'code matlab python convolution exponential sequences ideal low pass periodic convolution modulation run' }),


/* </m6-s5> */

/* <m6-s6> ============================================ 6.6 difference equations */


/* ============================================================ frequency response */
{ id:'m6-freqresp', module:'M6', nav:'Difference equations', title:'Frequency Response from a Difference Equation', src:'pp. 77–78',
  objective:'Transform a linear constant-coefficient difference equation into a ratio of polynomials in e^{-jω}.',
  keywords:'difference equation frequency response ratio polynomials e^{-j omega k} LCCDE causal stable', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Difference equations', src:'pp. 77–78'},
  {t:'title', text:'Frequency Response from a Difference Equation'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>P.blocks({w:560,h:380,items:[
      {t:'arrow',x1:14,y1:110,x2:150,y2:110,color:C.in},
      {t:'text',x:80,y:86,label:'X(e^{j\\omega})',tex:true,fs:16,color:C.in},
      {t:'box',x:150,y:36,w:260,h:148,label:'\\dfrac{\\sum_k b_k e^{-j\\omega k}}{\\sum_k a_k e^{-j\\omega k}}',tex:true,fs:17},
      {t:'arrow',x1:410,y1:110,x2:546,y2:110,color:C.out},
      {t:'text',x:478,y:86,label:'Y(e^{j\\omega})',tex:true,fs:16,color:C.out},
      {t:'text',x:280,y:206,label:'\\text{one ratio of polynomials in }e^{-j\\omega}',tex:true,fs:15,color:C.slate},
      {t:'box',x:20,y:262,w:170,h:66,label:'H(e^{j\\omega})',tex:true,fs:18},
      {t:'arrow',x1:190,y1:295,x2:370,y2:295,label:'\\text{partial fractions}',tex:true,color:C.coral},
      {t:'box',x:370,y:262,w:170,h:66,label:'h[n]',tex:true,fs:19,color:C.h},
      {t:'text',x:280,y:364,label:'\\text{each term inverts with }a^{n}u[n]\\leftrightarrow\\tfrac{1}{1-ae^{-j\\omega}}',tex:true,fs:14,color:C.slate}
    ]}), caption:'The recursion becomes one algebraic factor. Partial fractions then give the impulse response.'}
  ], right:[
    {t:'eq', tex:'\\sum\\nolimits_{k=0}^{N}a_k\\,y[n-k]=\\sum\\nolimits_{k=0}^{M}b_k\\,x[n-k]', label:'Linear, constant coefficients'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'\\begin{aligned}Y(e^{j\\omega})\\sum\\nolimits_{k=0}^{N}a_ke^{-j\\omega k}&=X(e^{j\\omega})\\sum\\nolimits_{k=0}^{M}b_ke^{-j\\omega k}\\\\ H(e^{j\\omega})=\\frac{Y(e^{j\\omega})}{X(e^{j\\omega})}&=\\frac{\\sum_{k=0}^{M}b_ke^{-j\\omega k}}{\\sum_{k=0}^{N}a_ke^{-j\\omega k}}\\end{aligned}', label:'Frequency response',
        note:'Take the DTFT of both sides. A shift by $k$ samples becomes the factor $e^{-j\\omega k}$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'When $H(e^{j\\omega})$ exists', html:'Only for a stable system, $\\sum_n|h[n]|<\\infty$. Here every factor has $|a|<1$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$y[n]-\\tfrac12y[n-1]=x[n]+x[n-1]$.<div class="nsep"></div>What is $H(e^{j\\pi})$?',
        ask:{key:'m6-freqresp', choices:['$0$','$4$','$4/3$'], answer:0,
          why:'At $\\omega=\\pi$, $e^{-j\\pi}=-1$, so the numerator $1+e^{-j\\pi}$ is $0$.'}}]}
  ]}
]},

{ id:'m6-ex-diff', module:'M6', nav:'Worked example · second order', title:'Second-Order Difference Equation', src:'p. 78',
  objective:'Read the frequency response off a second-order recursion, factor it and split it into partial fractions.',
  keywords:'worked example second order difference equation factor partial fractions A=4 B=-2 cover-up', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Worked example', src:'p. 78'},
  {t:'title', text:'Second-Order Difference Equation'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=AXW(-3*PI,3*PI,PI,{pad:{l:84,r:24,t:20,b:34},yr:[-0.75,7.6],ylabel:'|H(e^{j\\omega})|',
        yticksOverride:[1.0667,5.3333],ytickfmt:v=>v.toFixed(4)});
      a.curve(w=>2*geoMag(w,0.5)*geoMag(w,0.25),{color:C.h,n:4000});
      markPeriod(a,6.7);
      return a.svg(); },
      caption:'The magnitude of the frequency response over three periods. It is largest at $\\omega=0$ and smallest at $\\omega=\\pm\\pi$: a low-pass recursion.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'The causal system $y[n]-\\tfrac34y[n-1]+\\tfrac18y[n-2]=2x[n]$. Find $H(e^{j\\omega})$ and $h[n]$.<div class="nsep"></div>What is $h[0]$?',
      ask:{key:'m6-ex-diff', choices:['$2$','$4$','$0$'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'<ol class="steps"><li>Read $H(e^{j\\omega})$ off the coefficients and factor the denominator.</li><li>Split it into partial fractions in $z=e^{-j\\omega}$, a name for the algebra.</li></ol>'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'H(e^{j\\omega})=\\frac{2}{1-\\tfrac34e^{-j\\omega}+\\tfrac18e^{-j2\\omega}}=\\frac{2}{\\bigl(1-\\tfrac12e^{-j\\omega}\\bigr)\\bigl(1-\\tfrac14e^{-j\\omega}\\bigr)}', label:'Step 1 · Read and factor',
        note:'Check: $\\tfrac12+\\tfrac14=\\tfrac34$ and $\\tfrac12\\cdot\\tfrac14=\\tfrac18$.'}]},
    {t:'reveal', at:3, items:[
      {t:'eq', tex:'\\begin{gathered}\\frac{2}{\\bigl(1-\\tfrac12z\\bigr)\\bigl(1-\\tfrac14z\\bigr)}=\\frac{A}{1-\\tfrac12z}+\\frac{B}{1-\\tfrac14z}\\\\ A=\\frac{2}{1-\\tfrac14z}\\Big|_{z=2}=\\frac{2}{1-\\tfrac12}=4,\\qquad B=\\frac{2}{1-\\tfrac12z}\\Big|_{z=4}=\\frac{2}{1-2}=-2\\end{gathered}',
        label:'Step 2 · Partial fractions',
        note:'Cover up one factor and set $z$ where it vanishes.'}]}
  ]}
]},

{ id:'m6-ex-diff-c', module:'M6', nav:'Second order · the impulse response', title:'Impulse Response of the Example', src:'p. 78',
  objective:'Invert the partial fractions to the impulse response and check it in the recursion.',
  keywords:'worked example impulse response h[n] 4 (1/2)^n - 2 (1/4)^n check recursion stable low pass', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Worked example', src:'p. 78'},
  {t:'title', text:'Impulse Response of the Example'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$h[n]$','$4(\\tfrac12)^{n}u[n]$ and $-2(\\tfrac14)^{n}u[n]$']},
      svg:v=>{
      const f=cl(v?v.frame:0);
      const a=AX({pad:{l:84,r:24,t:20,b:34},xr:[-3,14],yr:[-2.5,4.6],xlabel:'n',ylabel:'h[n]',yticksOverride:[-2,0,0.875,2,4],
        ytickfmt:v=>String(v),xtarget:8});
      const h=n=>n<0?0:4*Math.pow(0.5,n)-2*Math.pow(0.25,n);
      fade(a,1-0.75*f,()=>a.stem(D(h,-3,14),{color:C.h,showZero:true}));
      fade(a,f,()=>{
        a.stem(D(n=>n<0?0:4*Math.pow(0.5,n),0,14).map(([n,y])=>[n-0.22,y]),{color:C.mid});
        a.stem(D(n=>n<0?0:-2*Math.pow(0.25,n),0,14).map(([n,y])=>[n+0.22,y]),{color:C.in}); });
      return a.svg(); },
      caption:'The impulse response and, in the second frame, the two terms it is made of. Their sum starts at $h[0]=2$.'},
    {t:'legend', items:[['h','$h[n]$'],['mid','$4(\\tfrac12)^{n}u[n]$'],['in','$-2(\\tfrac14)^{n}u[n]$']]}
  ], right:[
    {t:'eq', key:true, tex:'h[n]=4\\left(\\tfrac12\\right)^{n}u[n]-2\\left(\\tfrac14\\right)^{n}u[n]', label:'Solution',
      note:'Each fraction inverts with $a^{n}u[n]\\leftrightarrow\\frac{1}{1-ae^{-j\\omega}}$, $|a|<1$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\begin{aligned}h[0]&=4-2=2\\\\ h[1]-\\tfrac34h[0]&=1.5-1.5=0\\\\ h[2]-\\tfrac34h[1]+\\tfrac18h[0]&=0.875-1.125+0.25=0\\end{aligned}',
        label:'Check · the recursion with $x[n]=\\delta[n]$',
        note:'From the solution, $h[1]=2-0.5=1.5$ and $h[2]=1-0.125=0.875$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Reading', html:'Both factors have $|a|<1$, so both terms decay and the system is stable. $|H|$ falls from $5.3333$ at $\\omega=0$ to $1.0667$ at $\\omega=\\pm\\pi$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$y[n]-\\tfrac56y[n-1]+\\tfrac16y[n-2]=x[n]$.<div class="nsep"></div>Which exponentials make up $h[n]$?',
        ask:{key:'m6-ex-diff-c', choices:['$(\\tfrac12)^{n}$ and $(\\tfrac13)^{n}$','$(\\tfrac56)^{n}$ and $(\\tfrac16)^{n}$','$(\\tfrac12)^{n}$ and $(\\tfrac16)^{n}$'], answer:0,
          why:'$\\tfrac12+\\tfrac13=\\tfrac56$ and $\\tfrac12\\cdot\\tfrac13=\\tfrac16$.'}}]}
  ]}
]},

/* ============================================================ repeated pole */
{ id:'m6-ex-pair', module:'M6', nav:'The repeated-pole pair', title:'Repeated-Pole Transform Pair', src:'p. 79',
  objective:'Derive (n+1)a^n u[n] by differentiating the exponential pair with respect to a.',
  keywords:'repeated pole pair (n+1)a^n u[n] 1/(1-a e^{-j omega})^2 differentiate with respect to a shift index', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Difference equations', src:'p. 79'},
  {t:'title', text:'Repeated-Pole Transform Pair'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'a', label:'$a$', min:0.1, max:0.8, step:0.05, v:0.25, show:v=>'$'+(+v).toFixed(2)+'$'}]},
      listen:{items:[
          {label:'Play one stage', sound:v=>({f:s2play(s2first(s2noise(12000,79),v.a)), dur:1.5})},
          {label:'Play two stages', sound:v=>({f:s2play(s2first(s2first(s2noise(12000,79),v.a),v.a)), dur:1.5})}]},
      svg:v=>{
      const av=v?+v.a:0.25, s=D(n=>n<0?0:(n+1)*Math.pow(av,n),-3,20);
      const pk=Math.max(...s.map(p=>p[1]));
      const a=AX({h:320,xr:[-3,20],yr:[-0.12*pk,1.3*pk],xlabel:'n',ylabel:'(n+1)a^{n}u[n]',xtarget:8});
      a.stem(s,{color:C.mid,showZero:true});
      return a.svg(); },
      caption:'A repeated factor needs this sequence, $(n+1)a^{n}u[n]$. The factor $n+1$ lifts the early samples; the decay $a^{n}$ wins later. Move $a$. Two stages of $y[n]=a\\,y[n-1]+x[n]$ have this impulse response; at $8000$ samples per second, noise through two sounds duller than through one.'}
  ], right:[
    {t:'eq', tex:'\\sum_{n=0}^{\\infty}a^{n}e^{-j\\omega n}=\\frac{1}{1-ae^{-j\\omega}},\\qquad |a|<1', label:'Start · the exponential pair'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\sum_{n=1}^{\\infty}n\\,a^{n-1}e^{-j\\omega n}=\\frac{e^{-j\\omega}}{\\bigl(1-ae^{-j\\omega}\\bigr)^{2}}', label:'Step 1 · Differentiate in $a$',
        note:'$\\omega$ is fixed. The $n=0$ term does not depend on $a$ and drops out.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'\\sum_{m=0}^{\\infty}(m+1)\\,a^{m}e^{-j\\omega m}=\\frac{1}{\\bigl(1-ae^{-j\\omega}\\bigr)^{2}}', label:'Step 2 · Shift the index',
        note:'Put $m=n-1$. Then $e^{-j\\omega n}=e^{-j\\omega}e^{-j\\omega m}$, and $e^{-j\\omega}$ cancels on both sides.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The sequence $(n+1)\\left(\\tfrac12\\right)^{n}u[n]$.<div class="nsep"></div>What is $X(e^{j0})$?',
        ask:{key:'m6-ex-pair', choices:['$4$','$2$','$\\tfrac14$'], answer:0,
          why:'$1/(1-\\tfrac12)^{2}=4$, the sum of the samples.'}}]}
  ]}
]},

{ id:'m6-ex-pair-b', module:'M6', nav:'Repeated pole · reading the pair', title:'Reading the Repeated-Pole Pair', src:'p. 79',
  objective:'State the repeated-pole pair and give its exponent and its sign a reason.',
  keywords:'repeated pole pair exponent 2 sign minus common error 16/9 0.64 sign reversed spectrum', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Difference equations', src:'p. 79'},
  {t:'title', text:'Reading the Repeated-Pole Pair'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['the pair, $a=\\tfrac14$','with the sign reversed']},
      svg:v=>{
      const f=cl(v?v.frame:0);
      const a=AXW(-3*PI,3*PI,PI,{pad:{l:84,r:24,t:20,b:34},yr:[-0.3,2.75],ylabel:'|X(e^{j\\omega})|',
        yticksOverride:[0.64,1.7778],ytickfmt:v=>v.toFixed(4)});
      a.curve(w=>geoMag(w,0.25)**2,{color:C.in,n:4000});
      fade(a,f,()=>a.curve(w=>1/(1+2*0.25*Math.cos(w)+0.0625),{color:C.err,n:4000,dash:'9 6'}));
      markPeriod(a,2.08);
      return a.svg(); },
      caption:'The correct spectrum peaks at $\\omega=0$. A reversed sign moves the peak to $\\omega=\\pm\\pi$; at $\\omega=0$ the two differ by a factor of $2.78$.'},
    {t:'legend', items:[['in','$1/(1-\\tfrac14e^{-j\\omega})^{2}$'],['err','$1/(1+\\tfrac14e^{-j\\omega})^{2}$',true]]}
  ], right:[
    {t:'eq', key:true, result:true, tex:'(n+1)a^{n}u[n]\\;\\longleftrightarrow\\;\\frac{1}{\\bigl(1-ae^{-j\\omega}\\bigr)^{2}},\\qquad |a|<1', label:'Key result · Repeated-pole pair'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'Where the details come from', html:'The exponent is $2$ because one derivative of $(1-ae^{-j\\omega})^{-1}$ gives the square. The sign stays minus because differentiating in $a$ does not change it.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Common error', html:'Writing $(1+ae^{-j\\omega})^{2}$ or $(1-ae^{-j\\omega})^{n}$. At $\\omega=0$ with $a=\\tfrac14$ the pair gives $\\tfrac{16}{9}=1.7778=\\sum_{n\\ge0}(n+1)(\\tfrac14)^{n}$, and a plus sign gives $0.64$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The pair with $a=-\\tfrac12$.<div class="nsep"></div>Where in $-\\pi<\\omega\\le\\pi$ is $|X(e^{j\\omega})|$ largest?',
        ask:{key:'m6-ex-pair-b', choices:['$\\omega=0$','$\\omega=\\pi$','$\\omega=\\pi/2$'], answer:1,
          why:'At $\\omega=\\pi$, $1+\\tfrac12e^{-j\\omega}=\\tfrac12$ is smallest, so $|X|=4$ there.'}}]}
  ]}
]},

{ id:'m6-ex-diff-b', module:'M6', nav:'Worked example · the output', title:'Output of a Repeated-Pole System', src:'p. 79',
  objective:'Multiply the input and system transforms and expand a transform with a repeated factor.',
  keywords:'worked example output repeated pole partial fractions A=-4 B=-2 C=8 Y=HX z=0', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 6 · Worked example', src:'p. 79'},
  {t:'title', text:'Output of a Repeated-Pole System'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=AXW(-3*PI,3*PI,PI,{pad:{l:84,r:24,t:20,b:34},yr:[-0.95,10.2],ylabel:'|Y(e^{j\\omega})|',
        yticksOverride:[0.8533,7.1111],ytickfmt:v=>v.toFixed(4)});
      a.curve(w=>2*geoMag(w,0.5)*geoMag(w,0.25)**2,{color:C.out,n:4000});
      markPeriod(a,8.9);
      return a.svg(); },
      caption:'The output spectrum over three periods. It is largest at $\\omega=0$, where it equals $7.1111$, and smallest at $\\omega=\\pm\\pi$, where it equals $0.8533$.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'The system of the example, with input $x[n]=\\left(\\tfrac14\\right)^{n}u[n]$. Find $y[n]$.<div class="nsep"></div>How many terms does $Y$ split into?',
      ask:{key:'m6-ex-diff-b', choices:['$3$','$2$','$4$'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\begin{aligned}Y&=\\frac{2}{\\bigl(1-\\tfrac12z\\bigr)\\bigl(1-\\tfrac14z\\bigr)}\\cdot\\frac{1}{1-\\tfrac14z}=\\frac{2}{\\bigl(1-\\tfrac12z\\bigr)\\bigl(1-\\tfrac14z\\bigr)^{2}}\\\\ &=\\frac{A}{1-\\tfrac14z}+\\frac{B}{\\bigl(1-\\tfrac14z\\bigr)^{2}}+\\frac{C}{1-\\tfrac12z}\\end{aligned}',
        label:'Method · $Y=HX$ with $z=e^{-j\\omega}$',
        note:'The factor $1-\\tfrac14z$ now appears twice.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'\\begin{aligned}C&=\\frac{2}{\\bigl(1-\\tfrac14z\\bigr)^{2}}\\Big|_{z=2}=\\frac{2}{(\\tfrac12)^{2}}=8\\\\ B&=\\frac{2}{1-\\tfrac12z}\\Big|_{z=4}=\\frac{2}{1-2}=-2\\\\ A&=2-B-C=2+2-8=-4\\end{aligned}',
        label:'Step 1 · The coefficients',
        note:'Cover-up gives $C$ and $B$. Setting $z=0$ in the identity gives $2=A+B+C$.'}]}
  ]}
]},

{ id:'m6-ex-diff-b2', module:'M6', nav:'Worked example · the output sequence', title:'Output Sequence and Its Check', src:'p. 79',
  objective:'Assemble the output with the repeated-pole pair and check it by direct convolution.',
  keywords:'worked example output sequence y[n] repeated pole pair check convolution y[0]=2 y[1]=2 decay', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Worked example', src:'p. 79'},
  {t:'title', text:'Output Sequence and Its Check'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=AX({pad:{l:84,r:24,t:20,b:34},xr:[-3,16],yr:[-0.3,2.6],xlabel:'n',ylabel:'y[n]',xtarget:8,
        yticksOverride:[0,0.8125,1.375,2],ytickfmt:v=>String(v)});
      const y=n=>n<0?0:-4*Math.pow(0.25,n)-2*(n+1)*Math.pow(0.25,n)+8*Math.pow(0.5,n);
      a.stem(D(y,-3,16),{color:C.out,showZero:true});
      return a.svg(); },
      caption:'The output. It equals $2$ at $n=0$ and at $n=1$, then decays like $\\left(\\tfrac12\\right)^{n}$, the slower factor.'}
  ], right:[
    {t:'eq', key:true, tex:'y[n]=-4\\left(\\tfrac14\\right)^{n}u[n]-2(n+1)\\left(\\tfrac14\\right)^{n}u[n]+8\\left(\\tfrac12\\right)^{n}u[n]', label:'Solution',
      note:'The middle term inverts with the repeated-pole pair.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'Check', html:'The solution gives $y[0]=-4-2+8=2$ and $y[1]=-1-1+4=2$. Directly, $y[0]=h[0]x[0]=2$ and $y[1]=h[0]x[1]+h[1]x[0]=0.5+1.5=2$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Reading', html:'The slower factor $\\tfrac12$ sets the decay: after a few samples only $8(\\tfrac12)^{n}$ is left. Without the repeated-pole pair the middle term could not be inverted.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The same system with input $x[n]=\\left(\\tfrac13\\right)^{n}u[n]$.<div class="nsep"></div>What partial fractions does $Y$ need?',
        ask:{key:'m6-ex-diff-b2', choices:['three simple terms','one squared term','two simple terms'], answer:0,
          why:'$\\tfrac13$ differs from both system factors $\\tfrac12$ and $\\tfrac14$, so each factor appears once.'}}]}
  ]}
]},

/* ============================================================ an echo */
{ id:'m6-echo', module:'M6', nav:'Hearing an echo', title:'Hearing an Echo and Removing It', src:'pp. 77–78',
  objective:'Hear an echo, see its frequency response as a comb, and remove it with a recursion that is stable for |α|<1.',
  keywords:'echo delay comb frequency response alpha D remove echo inverse system recursion stable sound listen plucked note',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 6 · Difference equations', src:'pp. 77–78'},
  {t:'title', text:'Hearing an Echo and Removing It'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'al', label:'$\\alpha$', min:0.1, max:0.8, step:0.05, v:0.5, show:v=>'$'+(+v.toFixed(2))+'$'}]},
      listen:{items:[
          {label:'Play $x[n]$', sound:()=>({f:s2play(s6pluck(8000)), dur:1})},
          {label:'Play $y[n]$', sound:v=>({f:s2play(s6echo(s6pluck(8000),v.al,s6D)), dur:1})},
          {label:'Play $w[n]$', sound:v=>({f:s2play(s6undo(s6echo(s6pluck(8000),v.al,s6D),v.al,s6D)), dur:1})}]},
      svg:v=>{
      /* D = 3 in the figure: |1 + al e^{-j w D}| and its reciprocal */
      const al=v?v.al:0.5, E=w=>Math.sqrt(1+2*al*Math.cos(3*w)+al*al), top=1/(1-al);
      const ticks=[1-al,1+al].concat(top-(1+al) > 0.14*top ? [top] : []);
      const a=AXW(-3*PI,3*PI,PI,{h:340,yr:[-0.12*top,1.36*top],ylabel:'|H(e^{j\\omega})|',
        yticksOverride:ticks,ytickfmt:v=>''+(+v.toFixed(4))});
      a.curve(E,{color:C.h,n:4000});
      a.curve(w=>1/E(w),{color:C.out,n:4000});
      markPeriod(a,1.2*top);
      return a.svg(); },
      caption:'The echo and the recursion that removes it, for $D=3$, over three periods; at every $\\omega$ the two values multiply to $1$. The sounds are a plucked note $x[n]$, its echo $y[n]$ and the output $w[n]$, at $8000$ samples per second with $D=2000$, a delay of $0.25$ s.'},
    {t:'legend', items:[['h','$|1+\\alpha e^{-j\\omega D}|$'],['out','$1/|1+\\alpha e^{-j\\omega D}|$']]}
  ], right:[
    {t:'eq', tex:'y[n]=x[n]+\\alpha\\,x[n-D]', label:'Echo',
      note:'A copy scaled by $\\alpha$ arrives $D$ samples later. Its response $1+\\alpha e^{-j\\omega D}$ swings between $1-\\alpha$ and $1+\\alpha$, $D$ times in each period.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'w[n]=y[n]-\\alpha\\,w[n-D]', label:'Removing it',
        note:'Its response is $1/(1+\\alpha e^{-j\\omega D})$, so it gives back $x[n]$. It is stable only for $|\\alpha|<1$, where its impulse response $(-\\alpha)^{k}$ at $n=kD$ decays.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'An echo with $\\alpha=0.8$.<div class="nsep"></div>What are the largest and the smallest values of $|1+\\alpha e^{-j\\omega D}|$?',
        ask:{key:'m6-echo', choices:['$1.8$ and $0.2$','$1.8$ and $0$','$1.64$ and $0.36$'], answer:0,
          why:'The two terms add to $1.8$ where $e^{-j\\omega D}=1$ and leave $0.2$ where $e^{-j\\omega D}=-1$.'}}]}
  ]}
]},

realGallery({ id:'m6-real-diffeq', nav:'Difference equations around us',
  title:'Difference Equations Around Us', eyebrow:'Module 6 · Difference equations', src:'pp. 77–79',
  objective:'Recognise first-order recursions in everyday sequences and read their factor a.',
  keywords:'examples savings interest exponential moving average cooling tea minute readings club membership recursion pole',
  figs:[
    [()=>{ const a=P.Axes(EXO({xr:[-1,20],yr:[0,3000],xlabel:'n\\;(\\text{years})',ylabel:'b[n]\\;(\\$)',xstep:5,yticksOverride:[0,1000,2000,3000]}));
      a.stem(D(n=>1000*Math.pow(1.05,n),0,20),{color:C.out,r:2.6});
      return a.svg(); }, 'Savings at $5\\%$ a year: $b[n]=1.05\\,b[n-1]$, so $b[n]=1000(1.05)^{n}$.'],
    [()=>{ const a=P.Axes(EXO({xr:[-6,20],yr:[0,36],xlabel:'n\\;(\\text{s})',ylabel:'y[n]\\;(^{\\circ}\\text{C})',xstep:5,yticksOverride:[0,10,20,30],yticksLeft:true}));
      a.hline(30,{color:C.muted});
      a.stem(D(n=>n<0?20:30-10*Math.pow(0.8,n+1),-5,20),{color:C.out,r:2.6});
      return a.svg(); }, 'A sensor smoothed by $y[n]=0.8\\,y[n-1]+0.2\\,x[n]$ after a jump to $30^{\\circ}$C: $y[n]=30-10(0.8)^{n+1}$.'],
    [()=>{ const a=P.Axes(EXO({xr:[-0.5,15],yr:[0,100],xlabel:'t\\;(\\text{min})',ylabel:'T\\;(^{\\circ}\\text{C})',xstep:5,yticksOverride:[0,22,50,90]}));
      a.curve(t=>t<0?NaN:22+68*Math.exp(-0.1625*t),{color:C.in,n:1200,dash:'9 6'});
      a.stem(D(n=>22+68*Math.pow(0.85,n),0,15),{color:C.out,r:2.6});
      return a.svg(); }, 'Tea read each minute: $T[n]=0.85\\,T[n-1]+3.3$, on $T(t)=22+68e^{-0.1625t}$.',
      [['in','$T(t)$',true],['out','$T[n]$']]],
    [()=>{ const a=P.Axes(EXO({xr:[-1,20],yr:[0,1150],xlabel:'n\\;(\\text{years})',ylabel:'p[n]\\;(\\text{members})',xstep:5,yticksOverride:[0,500,1000]}));
      a.stem(D(n=>1000*(1-Math.pow(0.7,n+1)),0,20),{color:C.out,r:2.6});
      a.hline(1000,{color:C.muted});
      return a.svg(); }, 'Club members: $p[n]=0.7\\,p[n-1]+300$, so $p[n]=1000(1-0.7^{n+1})$.']
  ],
  notes:[
    {t:'note', kind:'def', head:'One recursion, one factor', html:'Each sequence obeys a first-order recursion $y[n]=a\\,y[n-1]+b\\,x[n]$. The factor $a$ sets how fast it grows or settles.'},
    {t:'note', kind:'warn', head:'Why this matters', html:'The savings balance has $a=1.05>1$: it grows without bound and has no DTFT. The other three have $|a|<1$, so their frequency responses exist.'}
  ]}),

labScene({ id:'m6-lab-i6', lab:'I6', nav:'Difference Equations', title:'A Difference Equation and Its Response', src:'pp. 77–79',
  objective:'Place the two factors of a second-order recursion, choose an input, and read the frequency response, the impulse response and the output together.',
  keywords:'laboratory difference equation pole radius frequency response periodic impulse response partial fractions output repeated factor' }),

codeScene({ id:'m6-code-diffeq', nav:'Difference equations', title:'Difference Equations in Code', src:'pp. 77–79', eyebrow:'Difference equations in code',
  objective:'Run difference equations, their frequency responses and their partial fractions in MATLAB and in Python, and predict each result before running it.',
  keywords:'code matlab python difference equation recursion frequency response partial fractions repeated pole output run' }),


/* </m6-s6> */

/* <m6-s7> ============================================ 6.7 summary */


/* ============================================================ summary */
{ id:'m6-tables', module:'M6', nav:'Property summary', title:'DTFT Property Summary', src:'p. 76',
  objective:'Collect every property of the discrete-time Fourier transform for reference.',
  keywords:'summary table properties list reference linearity shift expansion convolution multiplication accumulation differencing symmetry parseval periodicity',
  budget:'A reference table of properties in two columns, with one closing note.',
  slide:true, steps:1, blocks:[
  {t:'eyebrow', text:'Module 6 · Reference', src:'p. 76'},
  {t:'title', text:'DTFT Property Summary'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'sub', text:'Operations on the sequence'},
    {t:'wex', rows:[
      ['Linearity','$ax_1[n]+bx_2[n]\\;\\leftrightarrow\\;aX_1(e^{j\\omega})+bX_2(e^{j\\omega})$'],
      ['Time shift','$x[n-n_0]\\;\\leftrightarrow\\;e^{-j\\omega n_0}X(e^{j\\omega})$'],
      ['Frequency shift','$e^{j\\omega_0n}x[n]\\;\\leftrightarrow\\;X\\bigl(e^{j(\\omega-\\omega_0)}\\bigr)$'],
      ['Conjugation','$x^{*}[n]\\;\\leftrightarrow\\;X^{*}(e^{-j\\omega})$'],
      ['Time reversal','$x[-n]\\;\\leftrightarrow\\;X(e^{-j\\omega})$'],
      ['Time expansion','$x_{(k)}[n]\\;\\leftrightarrow\\;X(e^{jk\\omega})$'],
      ['Convolution','$x[n]*h[n]\\;\\leftrightarrow\\;X(e^{j\\omega})H(e^{j\\omega})$'],
      ['Multiplication','$x[n]y[n]\\;\\leftrightarrow\\;\\frac{1}{2\\pi}\\int_{2\\pi}X(e^{j\\theta})Y\\bigl(e^{j(\\omega-\\theta)}\\bigr)\\,\\d\\theta$']
    ]}
  ], right:[
    {t:'sub', text:'Periodicity, sums, symmetry and energy'},
    {t:'wex', rows:[
      ['Periodicity','$X\\bigl(e^{j(\\omega+2\\pi)}\\bigr)=X(e^{j\\omega})$ for every sequence'],
      ['Differencing','$x[n]-x[n-1]\\;\\leftrightarrow\\;(1-e^{-j\\omega})X(e^{j\\omega})$'],
      ['Accumulation','$\\sum_{m=-\\infty}^{n}x[m]\\;\\leftrightarrow\\;\\frac{X(e^{j\\omega})}{1-e^{-j\\omega}}+\\pi X(e^{j0})\\sum_k\\delta(\\omega-2\\pi k)$'],
      ['Frequency derivative','$n\\,x[n]\\;\\leftrightarrow\\;j\\,\\d X(e^{j\\omega})/\\d\\omega$'],
      ['Real sequence','$X(e^{-j\\omega})=X^{*}(e^{j\\omega})$: $|X|$ even, $\\angle X$ odd'],
      ['Real and even','$X(e^{j\\omega})$ real and even'],
      ['Real and odd','$X(e^{j\\omega})$ purely imaginary and odd'],
      ['Even and odd parts','$\\Ev\\{x\\}\\leftrightarrow\\operatorname{Re}\\{X\\}$, $\\Od\\{x\\}\\leftrightarrow j\\operatorname{Im}\\{X\\}$'],
      ['Parseval','$\\sum_n|x[n]|^{2}=\\frac{1}{2\\pi}\\int_{2\\pi}|X(e^{j\\omega})|^{2}\\,\\d\\omega$']
    ]}
  ]},
  {t:'reveal', at:1, items:[
    {t:'note', kind:'warn', head:'Rows with a condition', html:'<b>Accumulation</b> keeps $\\pi X(e^{j0})\\sum_k\\delta(\\omega-2\\pi k)$ whenever $\\sum_nx[n]\\neq0$. <b>Multiplication</b> and <b>Parseval</b> integrate over one period of $2\\pi$ only, because every spectrum here repeats with that period.'}]}
]},

{ id:'m6-pairs', module:'M6', nav:'Transform pairs', title:'DTFT Pairs', src:'p. 76',
  objective:'Collect every standard discrete-time transform pair the course uses.',
  keywords:'transform pairs table reference unit sample step exponential repeated pole rectangular dirichlet low-pass impulse train cosine sine sinc convention',
  budget:'A reference table of pairs in two columns, with one closing note.',
  slide:true, steps:1, blocks:[
  {t:'eyebrow', text:'Module 6 · Reference', src:'p. 76'},
  {t:'title', text:'DTFT Pairs'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'sub', text:'Aperiodic sequences'},
    {t:'wex', rows:[
      ['Unit sample','$\\delta[n]\\;\\leftrightarrow\\;1$'],
      ['Shifted sample','$\\delta[n-n_0]\\;\\leftrightarrow\\;e^{-j\\omega n_0}$'],
      ['Unit step','$u[n]\\;\\leftrightarrow\\;\\frac{1}{1-e^{-j\\omega}}+\\pi\\sum_k\\delta(\\omega-2\\pi k)$'],
      ['One-sided exponential','$a^{n}u[n]\\;\\leftrightarrow\\;\\frac{1}{1-ae^{-j\\omega}}$, $|a|<1$'],
      ['Repeated pole','$(n+1)a^{n}u[n]\\;\\leftrightarrow\\;\\frac{1}{(1-ae^{-j\\omega})^{2}}$, $|a|<1$'],
      ['Pole of order $r$','$\\frac{(n+r-1)!}{n!\\,(r-1)!}a^{n}u[n]\\;\\leftrightarrow\\;\\frac{1}{(1-ae^{-j\\omega})^{r}}$, $|a|<1$'],
      ['Two-sided exponential','$a^{|n|}\\;\\leftrightarrow\\;\\frac{1-a^{2}}{1-2a\\cos\\omega+a^{2}}$, $|a|<1$'],
      ['Rectangular pulse','$1$ on $|n|\\le N_1\\;\\leftrightarrow\\;\\frac{\\sin(\\omega(N_1+\\frac12))}{\\sin(\\omega/2)}$'],
      ['Ideal low-pass band','$\\frac{\\sin(Wn)}{\\pi n}\\;\\leftrightarrow\\;1$ on $|\\omega|\\le W$, $0$ on $W<|\\omega|\\le\\pi$, $0<W<\\pi$']
    ]}
  ], right:[
    {t:'sub', text:'Periodic sequences and impulse trains'},
    {t:'wex', rows:[
      ['Constant','$1\\;\\leftrightarrow\\;2\\pi\\sum_k\\delta(\\omega-2\\pi k)$'],
      ['Complex exponential','$e^{j\\omega_0n}\\;\\leftrightarrow\\;2\\pi\\sum_k\\delta(\\omega-\\omega_0-2\\pi k)$'],
      ['Cosine','$\\cos(\\omega_0n)\\;\\leftrightarrow\\;\\pi\\sum_k\\bigl[\\delta(\\omega-\\omega_0-2\\pi k)+\\delta(\\omega+\\omega_0-2\\pi k)\\bigr]$'],
      ['Sine','$\\sin(\\omega_0n)\\;\\leftrightarrow\\;\\frac{\\pi}{j}\\sum_k\\bigl[\\delta(\\omega-\\omega_0-2\\pi k)-\\delta(\\omega+\\omega_0-2\\pi k)\\bigr]$'],
      ['Any periodic sequence','$\\sum_{k=\\langle N\\rangle}a_ke^{jk(2\\pi/N)n}\\;\\leftrightarrow\\;2\\pi\\sum_k a_k\\delta\\bigl(\\omega-\\frac{2\\pi k}{N}\\bigr)$'],
      ['Impulse train','$\\sum_k\\delta[n-kN]\\;\\leftrightarrow\\;\\frac{2\\pi}{N}\\sum_k\\delta\\bigl(\\omega-\\frac{2\\pi k}{N}\\bigr)$']
    ]}
  ]},
  {t:'reveal', at:1, items:[
    {t:'note', kind:'warn', head:'Carry with the table', html:'Every spectrum repeats every $2\\pi$: each sum over $k$ runs over all integers and puts a copy in every period, and $a_{k+N}=a_k$. The exponential pairs need $|a|<1$. Written with a sinc, the low-pass sequence is $\\frac{W}{\\pi}\\operatorname{sinc}(Wn)$, with $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$.'}]}
]},

{ id:'m6-quick', module:'M6', nav:'Quick check', title:'Quick check', src:'pp. 64–79',
  objective:'Check the module ideas with twelve short predictions.',
  keywords:'quick check predict periodicity unit step exponential pulse low-pass cosine impulse train real even parseval convolution expansion recursion',
  budget:'A set of twelve prediction cards; the questions carry no figure.',
  slide:true, steps:0, blocks:[
  {t:'eyebrow', text:'Module 6 · Quick check', src:'pp. 64–79'},
  {t:'title', text:'Quick Check'},
  {t:'grid', cols:4, gap:'22px 20px', style:'flex:1;grid-auto-rows:1fr;padding-bottom:8px', items:[
    [{t:'note', kind:'def', head:'Periodicity', html:'$X(e^{j0.3})=2-j$. Then $X\\bigl(e^{j(0.3+2\\pi)}\\bigr)$ is',
      ask:{key:'m6-qc0', choices:['$2-j$','$2+j$','$0$'], answer:0,
        why:'The period is $2\\pi$.'}}],
    [{t:'note', kind:'def', head:'Unit step', html:'$u[n]$ has spectral impulses of weight',
      ask:{key:'m6-qc1', choices:['$\\pi$','$2\\pi$','$1$'], answer:0,
        why:'The mean $\\tfrac12$ gives $2\\pi\\cdot\\tfrac12$.'}}],
    [{t:'note', kind:'def', head:'Exponential', html:'$x[n]=(0.2)^{n}u[n]$. Then $X(e^{j0})$ is',
      ask:{key:'m6-qc2', choices:['$1.25$','$0.8$','$5$'], answer:0,
        why:'$1/(1-0.2)=1.25$.'}}],
    [{t:'note', kind:'def', head:'Pulse', html:'$x[n]=1$ on $|n|\\le4$. Then $X(e^{j0})$ is',
      ask:{key:'m6-qc3', choices:['$9$','$4$','$8$'], answer:0,
        why:'$X(e^{j0})=\\sum_nx[n]$.'}}],
    [{t:'note', kind:'def', head:'Low-pass', html:'$\\sin(\\pi n/5)/(\\pi n)$ has its first zero at $n=$',
      ask:{key:'m6-qc4', choices:['$5$','$1$','$10$'], answer:0,
        why:'There $\\pi n/5=\\pi$.'}}],
    [{t:'note', kind:'def', head:'Cosine', html:'$\\cos(\\tfrac{9\\pi}{5}n)$ has impulses in $(-\\pi,\\pi]$ at $\\pm$',
      ask:{key:'m6-qc5', choices:['$\\pi/5$','$9\\pi/5$','$4\\pi/5$'], answer:0,
        why:'$\\tfrac{9\\pi}{5}-2\\pi=-\\tfrac{\\pi}{5}$.'}}],
    [{t:'note', kind:'def', head:'Impulse train', html:'$\\sum_k\\delta[n-5k]$ has impulses of weight',
      ask:{key:'m6-qc6', choices:['$2\\pi/5$','$5$','$1/5$'], answer:0,
        why:'$2\\pi/N$ with $N=5$.'}}],
    [{t:'note', kind:'def', head:'Real and even', html:'$x[n]$ is real and even. Then $\\operatorname{Im}X(e^{j\\omega})$ is',
      ask:{key:'m6-qc7', choices:['$0$','$|X|$','$X$'], answer:0,
        why:'Real, even $x$ gives real $X$.'}}],
    [{t:'note', kind:'def', head:'Parseval', html:'$x[n]=2\\delta[n]-\\delta[n-2]$. Then $\\frac{1}{2\\pi}\\int_{2\\pi}|X|^{2}\\,\\d\\omega$ is',
      ask:{key:'m6-qc8', choices:['$5$','$1$','$3$'], answer:0,
        why:'$\\sum_n|x[n]|^{2}=4+1$.'}}],
    [{t:'note', kind:'def', head:'Convolution', html:'$X(e^{j0})=4$ and $H(e^{j0})=0.5$. Then $Y(e^{j0})$ is',
      ask:{key:'m6-qc9', choices:['$2$','$4.5$','$8$'], answer:0,
        why:'$Y=XH$ at every $\\omega$.'}}],
    [{t:'note', kind:'def', head:'Expansion', html:'$X(e^{j3\\omega})$ repeats in $\\omega$ every',
      ask:{key:'m6-qc10', choices:['$2\\pi/3$','$2\\pi$','$6\\pi$'], answer:0,
        why:'$3\\omega$ must move by $2\\pi$.'}}],
    [{t:'note', kind:'def', head:'Recursion', html:'$y[n]-0.6\\,y[n-1]=x[n]$. Then $H(e^{j0})$ is',
      ask:{key:'m6-qc11', choices:['$2.5$','$1.6$','$0.4$'], answer:0,
        why:'$1/(1-0.6)=2.5$.'}}]
  ]}
]},

{ id:'m6-synth', module:'M6', nav:'Module 6 synthesis', title:'Module 6 — what to carry forward', src:'pp. 64–79',
  dark:true, objective:'Consolidate the module and open the door to sampling.',
  keywords:'synthesis summary module 6 DTFT periodicity pairs properties convolution multiplication parseval difference equation preview sampling', steps:1, blocks:[
  {t:'eyebrow', text:'Module 6 · Synthesis', src:'pp. 64–79'},
  {t:'title', text:'Module 6 Summary'},
  /* Ten results as prompts, in the order of the module: the student answers
     each one, then opens the card. The sketch on each card is the picture to
     remember. */
  {t:'raw', html:()=>RECALL.deck('m6', [
    {q:'Where does the DTFT come from?', glyph:G.limit,
     a:'Repeat a finite sequence with period $N$ and let $N$ grow. $Na_k$ samples one function of $\\omega$, and in the limit that function is $X(e^{j\\omega})$.'},
    {q:'What are the analysis and synthesis equations?', glyph:G.pair,
     a:'$X(e^{j\\omega})=\\sum_nx[n]e^{-j\\omega n}$ and $x[n]=\\frac{1}{2\\pi}\\int_{2\\pi}X(e^{j\\omega})e^{j\\omega n}\\,\\d\\omega$.'},
    {q:'Why does every DTFT repeat?', glyph:G.period,
     a:'$e^{-j2\\pi n}=1$ at every integer $n$, so $X\\bigl(e^{j(\\omega+2\\pi)}\\bigr)=X(e^{j\\omega})$. One period holds all the information.'},
    {q:'The one-sided exponential', glyph:G.expo,
     a:'$a^{n}u[n]\\leftrightarrow\\frac{1}{1-ae^{-j\\omega}}$, only for $|a|<1$.'},
    {q:'The rectangular pulse', glyph:G.dirich,
     a:'$1$ on $|n|\\le N_1$ gives $\\frac{\\sin(\\omega(N_1+\\frac12))}{\\sin(\\omega/2)}$: real, periodic, and it changes sign.'},
    {q:'A periodic sequence', glyph:G.lines,
     a:'Impulses of weight $2\\pi a_k$ at $\\omega=2\\pi k/N$ for every integer $k$. The weights repeat every $N$, so the picture repeats every $2\\pi$.'},
    {q:'A delay', glyph:G.shift,
     a:'$x[n-n_0]\\leftrightarrow e^{-j\\omega n_0}X(e^{j\\omega})$: the magnitude stays, the phase gains $-\\omega n_0$.'},
    {q:'Convolution and multiplication', glyph:G.conv,
     a:'$x*h\\leftrightarrow XH$. $xy\\leftrightarrow\\frac{1}{2\\pi}\\int_{2\\pi}X(e^{j\\theta})Y\\bigl(e^{j(\\omega-\\theta)}\\bigr)\\,\\d\\theta$, a periodic convolution.'},
    {q:'Parseval’s relation', glyph:G.energy,
     a:'$\\sum_n|x[n]|^{2}=\\frac{1}{2\\pi}\\int_{2\\pi}|X(e^{j\\omega})|^{2}\\,\\d\\omega$, with $R=1\\,\\Omega$.'},
    {q:'A difference equation', glyph:G.diffeq,
     a:'$H(e^{j\\omega})$ is a ratio of polynomials in $e^{-j\\omega}$. Partial fractions and the pairs give $h[n]$; a repeated factor needs $(n+1)a^{n}u[n]$.'}
  ], {cols:2})},
  {t:'reveal', at:1, items:[
    {t:'note', kind:'ok', head:'Where Module 7 begins', html:'<span style="color:var(--graphite)">Many sequences are samples of a continuous-time signal, $x[n]=x(nT)$. Module 7 relates the two spectra and states when the samples are enough to rebuild $x(t)$.</span>'}]}
]},

/* Four optional projects for students who want to try the module on their own
   computer. They carry no grade and no code: each card gives an aim, what it
   practises, a few steps and what to look for. The briefs state no numerical
   answer beyond ones checked in verify/. */
{ id:'m6-projects', module:'M6', nav:'Projects to try', title:'Projects to Try', src:'pp. 64–79',
  dark:true, objective:'Offer four optional projects that use the discrete-time Fourier transform on sensor data, tones, echoes and recursions.',
  keywords:'projects matlab python moving average smoothing beep spectrum echo inverse system cascade repeated pole',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 6 · Projects', src:'pp. 64–79'},
  {t:'title', text:'Projects to Try'},
  {t:'raw', html:()=>PROJECTS.deck('m6', [
    {title:'Smoothing a noisy reading', glyph:G.ema,
     aim:'Measure how an exponential moving average removes fast noise.',
     learn:['A first-order recursion as a filter.',
            '$H(e^{j\\omega})$ read at $\\omega=0$ and at $\\omega=\\pi$.',
            'Why the smoothed output lags the input.'],
     steps:['Record a sensor once a second, or make a slow ramp plus random noise.',
            'Run $y[n]=0.9\\,y[n-1]+0.1\\,x[n]$ over it.',
            'Plot $|H(e^{j\\omega})|=0.1/|1-0.9e^{-j\\omega}|$ from $-3\\pi$ to $3\\pi$.',
            'Try $0.5$ and $0.98$ in place of $0.9$.'],
     look:'$H(e^{j0})=1$, so the slow part passes unchanged. At $\\omega=\\pi$, $|H|=0.1/1.9\\approx0.053$. A larger factor smooths more and lags more.'},
    {title:'The spectrum of a short beep', glyph:G.beep,
     aim:'See how the length of a tone sets the width of its spectral peak.',
     learn:['The DTFT of a finite sequence.',
            'Periodicity: the picture repeats every $2\\pi$.',
            'Length against width, as for the rectangular pulse.'],
     steps:['Make $x[n]=\\cos(\\pi n/4)$ for $0\\le n<N$ with $N=32$.',
            'Evaluate $X(e^{j\\omega})=\\sum_nx[n]e^{-j\\omega n}$ on a fine grid from $-3\\pi$ to $3\\pi$.',
            'Plot $|X|$ and mark each period.',
            'Repeat with $N=128$.'],
     look:'Peaks at $\\omega=\\pm\\pi/4$ in every period, of height $N/2$: $16$, then $64$. Four times the length gives a peak four times narrower.'},
    {title:'Undoing an echo', glyph:G.echo,
     aim:'Remove a one-sample echo with a recursion.',
     learn:['A system read from its impulse response.',
            'An inverse system as a difference equation.',
            'Why the inverse needs $|a|<1$.'],
     steps:['Pass a short recording through $h[n]=\\delta[n]+0.5\\,\\delta[n-1]$ to get $v[n]$.',
            'Run $y[n]=-0.5\\,y[n-1]+v[n]$.',
            'Compare $y[n]$ with the recording.',
            'Plot $|1+0.5e^{-j\\omega}|$ and its reciprocal over three periods.'],
     look:'The recording comes back exactly. $|H|$ swings between $0.5$ and $1.5$, the inverse between $2/3$ and $2$. Its impulse response $(-0.5)^{n}u[n]$ decays because $|-0.5|<1$. Section 6.6, Hearing an Echo and Removing It, plays the same two systems with an echo you can hear.'},
    {title:'Two identical stages', glyph:G.cascade,
     aim:'Check the repeated-pole pair by running two first-order stages in a row.',
     learn:['A cascade as a convolution.',
            'The pair $(n+1)a^{n}u[n]\\leftrightarrow1/(1-ae^{-j\\omega})^{2}$.',
            'A sum of samples as the transform at $\\omega=0$.'],
     steps:['Run $w[n]=0.8\\,w[n-1]+\\delta[n]$, then $y[n]=0.8\\,y[n-1]+w[n]$.',
            'Compare $y[n]$ with $(n+1)(0.8)^{n}$.',
            'Add up $y[n]$ over $200$ samples.',
            'Evaluate $1/(1-0.8e^{-j\\omega})^{2}$ at $\\omega=0$.'],
     look:'The two sequences agree sample by sample. The sum and the value at $\\omega=0$ are both $25$.'}
  ])}
]}


/* </m6-s7> */
];

window.SCENES_M6 = SC;
})();
