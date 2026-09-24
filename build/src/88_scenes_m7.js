/* ==========================================================================
   Module 7 — Sampling and Aliasing  [Source: 80–88]
   ========================================================================== */
(function(){
const P = PLOT, C = P.COL, PI = Math.PI;

/* ---------- helpers shared by the figures of this module ---------- */

/* stems over an integer range */
const D = (f,a,b)=>{const o=[];for(let n=Math.ceil(a);n<=b;n++)o.push([n,f(n)]);return o;};

/* A frequency axis is read in multiples of pi. A tick number is part of the
   scale of the frame rather than of the running mathematics, so it stays plain
   text; every axis name, annotation and bracket label around it is typeset. */
const piTick = v => {
  const r = v/PI;
  if(Math.abs(r) < 1e-9) return '0';
  for(const den of [1,2,3,4,5,6]){
    const num = r*den;
    if(Math.abs(num-Math.round(num)) < 1e-7){
      const k = Math.round(num), sg = k<0?'-':'', m = Math.abs(k);
      const head = m===1 ? 'π' : m+'π';
      return den===1 ? sg+head : sg+head+'/'+den;
    }
  }
  return P.fmt(v,2);
};
/* the same reading for the large rates of the worked examples, where the
   multiple of pi runs into the thousands */
const kpiTick = v => {
  const r = Math.round(v/PI);
  return r===0 ? '0' : (r<0?'-':'') + Math.abs(r) + 'π';
};
const KP = v => v*PI;
/* ticks at every `step` radians across the drawn range */
const wTicks = (lo,hi,step)=>{ const o=[];
  for(let k=Math.ceil(lo/step-1e-9); k<=hi/step+1e-9; k++) o.push(k*step); return o; };

/* The running band-limited signal of the module: x(t) = (sin(pi t)/(pi t))^2.
   Its transform is a triangle of peak 1 reaching zero at |w| = 2 pi, so the
   highest angular frequency it carries is wM = 2 pi rad/s. */
const xB = t=>{ const u=PI*t; return Math.abs(u)<1e-9 ? 1 : Math.pow(Math.sin(u)/u,2); };
const WM = 2*PI;

/* one triangular copy: peak `pk` at the centre, zero at a distance `wm`.
   Outside its own band the value is undefined rather than zero, so a copy drawn
   on its own shows exactly the interval it occupies and nothing else. */
const tri  = (w,wm,pk)=> Math.abs(w)<=wm ? pk*(1-Math.abs(w)/wm) : NaN;
const tri0 = (w,wm,pk)=> Math.abs(w)<=wm ? pk*(1-Math.abs(w)/wm) : 0;
/* the replicated spectrum: every copy, added */
const rep = (w,wm,pk,ws,K)=>{ let s=0; for(let k=-K;k<=K;k++) s+=tri0(w-k*ws,wm,pk); return s; };

/* samples of a continuous signal over a window, as [t, x(t)] pairs */
const samp = (f,T,a,b)=>{ const o=[]; for(let n=Math.ceil(a/T);n<=b/T;n++) o.push([n*T,f(n*T)]); return o; };

/* Colours for the copies. The baseband is the signal itself, so it keeps the
   input colour; the copies are intermediate objects. Red is reserved for the
   overlap and is used for nothing else in this module. */
const KCOL = k => k===0 ? C.in : (Math.abs(k)===1 ? C.mid : C.slate);

Object.assign(CONTENT.GLOSS, {
  Tsamp:{ s:'T', d:'Sampling period: the time between two consecutive samples, in seconds.', go:'m7-sampler' },
  ws:{ s:'\\omega_s', d:'Sampling angular frequency, $\\omega_s=2\\pi/T$, in radians per second. It is not the sampling frequency in hertz.', go:'m7-rates' },
  fs:{ s:'f_s', d:'Sampling frequency, $f_s=1/T$, in hertz. It counts samples per second, and $\\omega_s=2\\pi f_s$.', go:'m7-rates' },
  wM:{ s:'\\omega_M', d:'Highest angular frequency a band-limited signal carries: $X(j\\omega)=0$ for $|\\omega|>\\omega_M$.', go:'m7-theorem' },
  wc:{ s:'\\omega_c', d:'Cutoff of the reconstruction filter, in rad/s. It must satisfy $\\omega_M<\\omega_c<\\omega_s-\\omega_M$.', go:'m7-recon' },
  pt:{ s:'p(t)', d:'Impulse train of period $T$, used as the sampling function.', go:'m7-sampler' },
  xp:{ s:'x_p(t)', d:'Impulse-train sampled signal: an impulse at every $nT$ whose weight is $x(nT)$.', go:'m7-sampler' },
  xr:{ s:'x_r(t)', d:'Output of the reconstruction filter. It equals $x(t)$ only when the sampling theorem is satisfied.', go:'m7-recon' },
  replica:{ s:'\\text{replica}', d:'A copy of $X(j\\omega)$ centred at a multiple of $\\omega_s$ in the sampled spectrum. Copies appear at every sampling rate.', go:'m7-replicas' },
  alias:{ s:'\\text{aliasing}', d:'The overlap of neighbouring copies. It happens only when $\\omega_s<2\\omega_M$, and no filter can undo it.', go:'m7-aliasing' },
  guard:{ s:'\\omega_s-2\\omega_M', d:'Guard band: the empty gap between the top of the baseband and the bottom of the first copy.', go:'m7-three' },
  zoh:{ s:'H_0(j\\omega)', d:'Frequency response of the zero-order hold, which holds each sample until the next one arrives.', go:'m7-zoh' },
  foh:{ s:'H_1(j\\omega)', d:'Frequency response of the first-order hold, which joins consecutive samples by a straight line.', go:'m7-foh' }
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
  return { id:cfg.id, module:'M7', nav:cfg.nav, title:cfg.title, src:cfg.src,
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
  return { id:cfg.id, module:'M7', nav:'Laboratory {lab} · '+cfg.nav, title:'Laboratory {lab} — '+cfg.title, src:cfg.src,
    objective:cfg.objective, slide:true, keywords:cfg.keywords, steps:0, blocks:[
    {t:'eyebrow', text:'Interactive laboratory', src:cfg.src},
    {t:'title', text:'Laboratory {lab} · '+cfg.nav},
    {t:'lab', id:cfg.lab}
  ]};
}
/* a code page: the programs of one section, paged one at a time */
function codeScene(cfg){
  return { id:cfg.id, module:'M7', nav:'Code · '+cfg.nav, title:cfg.title, src:cfg.src,
    objective:cfg.objective, keywords:cfg.keywords,
    slide:true, steps:0, budget:'a code page: the program draws its own figure', blocks:[
    {t:'eyebrow', text:'Module 7 · '+cfg.eyebrow, src:cfg.src},
    {t:'title', text:cfg.title},
    {t:'raw', html:()=>CODEBANK.page(cfg.id)}
  ]};
}

/* Helpers that belong to one section only. Each section keeps its own between
   its markers. */
/* <m7-s1-helpers> */
/* Two panels in one figure: the upper one takes the fraction `fr` of the
   height. Each builder takes a height and returns an svg; the two are placed
   as nested svgs. A grown figure hands its height through P.hOverride, which
   is taken here and split, so neither panel claims the whole of it. */
const s1Stack = (H0, fr, top, bot)=>{
  const H = P.hOverride || H0, h1 = Math.round(H*fr), h2 = H - h1; P.hOverride = null;
  return `<svg viewBox="0 0 560 ${H}" xmlns="http://www.w3.org/2000/svg" role="img">`
    + top(h1).replace('<svg ',`<svg x="0" y="0" width="560" height="${h1}" `)
    + bot(h2).replace('<svg ',`<svg x="0" y="${h1}" width="560" height="${h2}" `) + '</svg>'; };
/* An impulse of zero weight is no impulse at all, so it is not drawn: an
   arrow of zero length would still show its head pointing down. */
const s1Imp = (a,t,wt,col)=>{ if(Math.abs(wt) > 0.012) a.impulse(t,wt,{color:col,label:false}); };
/* a number for a figure label: an integer stays an integer, otherwise d places */
const s1Num = (v,d)=>{ const r=Math.round(v); return Math.abs(v-r)<1e-9 ? String(r) : v.toFixed(d); };
/* a multiple of pi as TeX: 1 -> \pi, 0 -> 0, 2.5 -> 2.5\pi */
const s1Pi = v=>{ const s=s1Num(v,2); return s==='0' ? '0' : s==='1' ? '\\pi' : s==='-1' ? '-\\pi' : s+'\\pi'; };
/* the copies of the running spectrum, each drawn on its own: the baseband in
   the input colour, every other copy in the intermediate colour */
const s1Copies = (a,ws,pk,K,o)=>{ o=o||{};
  for(let k=-K;k<=K;k++) a.curve(w=>tri(w-k*ws,WM,pk),
    Object.assign({color:k===0?C.in:C.mid, n:1400}, o)); };
/* </m7-s1-helpers> */
/* <m7-s2-helpers> */
/* A multiple of pi as TeX, for slider readouts: 2.6 -> 2.6\pi, 1 -> \pi */
const s2Pi = v => { const r = Math.round(v*100)/100;
  if(Math.abs(r) < 1e-9) return '0';
  const m = Math.abs(r), head = Math.abs(m-1) < 1e-9 ? '\\pi' : (+m.toFixed(2))+'\\pi';
  return (r<0?'-':'')+head; };
/* A signal colour as a translucent wash, rgba, so that a label resting on
   the wash reads as sitting on a plate rather than on a trace */
const s2Wash = (c, a) => { const n = parseInt(c.slice(1), 16);
  return `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`; };
/* Is w inside an overlap of two neighbouring copies of the triangle of
   half-width wm replicated every ws? Valid for ws >= wm, where at most two
   copies meet. The overlap in each period runs from ws - wm to wm. */
const s2InOv = (w,ws,wm) => { if(ws >= 2*wm - 1e-9) return false;
  const r = w - Math.floor(w/ws)*ws; return r >= ws-wm-1e-9 && r <= wm+1e-9; };
/* The replicated triangle drawn the way this section reads it: every copy
   solid in its own colour where it stands alone, thin and dashed inside an
   overlap, and there the stored sum in the aliasing colour over a red wash.
   The baseband keeps the input colour; every other copy is violet. */
const s2Copies = (a, ws, pk, K, wm) => {
  wm = wm || WM;
  const ov = w => s2InOv(w, ws, wm);
  if(ws < 2*wm - 1e-9) for(let k=-K-1;k<=K;k++)
    a.area(w=>rep(w,wm,pk,ws,K+1), (k+1)*ws-wm, k*ws+wm, {color:s2Wash(C.err,.22), n:120});
  for(let k=-K;k<=K;k++){
    const col = k ? C.mid : C.in;
    a.curve(w=> ov(w) ? NaN : tri(w-k*ws,wm,pk), {color:col, n:1600});
    a.curve(w=> ov(w) ? tri(w-k*ws,wm,pk) : NaN, {color:col, n:1600, width:1.4, dash:'4 4'});
  }
  a.curve(w=> ov(w) ? rep(w,wm,pk,ws,K+1) : NaN, {color:C.err, n:2400, width:2.6});
  return a; };
/* Two panels in one figure, the upper over the lower, as on the Module 6
   scrubber slides. A grown or redrawn figure hands its height through
   P.hOverride, which is taken here and split between the panels. Lecture
   mode takes its own base height and its own share of the upper panel,
   each given as [normal, lecture]. */
const s2Stack = (H0, r, top, bot) => {
  const L = P.labelScale() > 1 ? 1 : 0, H = P.hOverride || H0[L]; P.hOverride = null;
  const h1 = Math.round(H*r[L]), h2 = H - h1;
  return `<svg viewBox="0 0 560 ${H}" xmlns="http://www.w3.org/2000/svg" role="img">`
    + top(h1).replace('<svg ', `<svg x="0" y="0" width="560" height="${h1}" `)
    + bot(h2).replace('<svg ', `<svg x="0" y="${h1}" width="560" height="${h2}" `) + '</svg>'; };
/* The band-edge sine of the boundary example, sampled at fs hertz and held
   until the next sample. A sample that is zero up to rounding is set to
   zero, so a sampler that sees only zeros plays silence rather than the
   rounding error made loud. */
const s2Held = fs => t => { const n = Math.floor(t*fs + 1e-9), v = Math.sin(4000*PI*n/fs);
  return Math.abs(v) < 1e-9 ? 0 : v; };
/* ms tick numbers for a time axis in seconds */
const s2ms = d => v => Math.abs(v) < 1e-12 ? '0' : (v*1000).toFixed(d);
/* Band-pass sampling. The band fills 8 pi < |w| < 10 pi rad/s, width
   B = 2 pi, so its lower edge is 4B. Its shape is a leaning triangle, zero at
   both edges and highest 0.7 of the way up, so a copy of the positive band
   and a copy of the negative band can be told apart. */
const S2BL = 8*PI, S2BH = 10*PI, S2BB = 2*PI;
const s2Lean = u => u<=1e-9 || u>=1-1e-9 ? NaN : (u<0.7 ? u/0.7 : (1-u)/0.3);
/* copy k of the positive band (s = 1) or of the negative band (s = -1) */
const s2BpCopy = (w, ws, k, s) => { const c = w - k*ws; return s2Lean(((s>0 ? c : -c) - S2BL)/S2BB); };
/* the copies that reach the drawn range [-span, span] */
const s2BpK = (ws, span) => Math.ceil((span + S2BH)/ws) + 1;
/* how many copies are non-zero at w: two or more is an overlap */
const s2BpN = (w, ws, K) => { let n=0;
  for(let k=-K;k<=K;k++) for(const s of [1,-1]) if(isFinite(s2BpCopy(w,ws,k,s))) n++; return n; };
const s2BpSum = (w, ws, K) => { let y=0;
  for(let k=-K;k<=K;k++) for(const s of [1,-1]){ const v=s2BpCopy(w,ws,k,s); if(isFinite(v)) y+=v; } return y; };
/* The verdict at the rate ws: 1 apart, 0 touching, -1 overlapping. Taken
   modulo ws, a copy of the positive band starts at a and a copy of the
   negative band at b; both are B wide, so they fit when the shorter way
   round from one start to the other is at least B. */
const s2BpVerdict = ws => { if(ws < 2*S2BB - 1e-9) return -1;
  const m = x => x - Math.floor(x/ws)*ws, d = m(m(-S2BH) - m(S2BL)), g = Math.min(d, ws-d) - S2BB;
  return g > 1e-9 ? 1 : (g > -1e-9 ? 0 : -1); };
/* the rates at which the copies fit, in multiples of pi: the point 4 pi,
   then four windows, the last running on past the slider */
const S2BPW = [[4,4],[5,16/3],[20/3,8],[10,16],[20,23]];
/* </m7-s2-helpers> */
/* <m7-s3-helpers> */
/* Section 7.3. The unnormalised sinc, sinc(theta) = sin(theta)/theta, used by
   every interpolation kernel of the section. */
const s3sinc = u => Math.abs(u) < 1e-9 ? 1 : Math.sin(u)/u;
/* the kernel of the ideal filter with gain T and cutoff wc: T sin(wc t)/(pi t) */
const s3h = (t,T,wc) => Math.abs(t) < 1e-12 ? T*wc/PI : T*Math.sin(wc*t)/(PI*t);
/* zero-order hold of f with period T: the sample at the start of each
   interval, held until the next one */
const s3zoh = (f,T) => t => f(Math.floor(t/T + 1e-9)*T);
/* the staircase and the straight lines through the samples of f over [a, b],
   as polyline points */
const s3stair = (f,T,a,b) => { const o=[];
  for(let n=Math.floor(a/T)-1; n*T<=b+1e-9; n++){ const y=f(n*T); o.push([n*T,y],[(n+1)*T,y]); }
  return o; };
const s3lines = (f,T,a,b) => { const o=[];
  for(let n=Math.floor(a/T)-1; (n-1)*T<=b+1e-9; n++) o.push([n*T,f(n*T)]);
  return o; };
/* the magnitudes of the zero-order hold and of the first-order hold */
const s3H0 = (w,T) => Math.abs(w) < 1e-9 ? T : Math.abs(2*Math.sin(w*T/2)/w);
const s3H1 = (w,T) => Math.abs(w) < 1e-9 ? T : Math.pow(Math.sin(w*T/2)/(w/2),2)/T;
/* the tone of the listening slide, in hertz */
const S3F0 = 300;
const s3tone = t => Math.cos(2*PI*S3F0*t);
/* </m7-s3-helpers> */
/* <m7-s4-helpers> */
/* Section 7.4, aliasing in practice.
   The frequency a sampled tone comes back at: the distance from f0 to the
   nearest multiple of fs, which lies in [0, fs/2]. floor(x + 1/2) rounds a
   tie up, the same rule the code pages use in both languages. */
const s4fold = (f0,fs)=>Math.abs(f0 - fs*Math.floor(f0/fs+0.5));
/* The rotation a camera shows, signed, in turns per second: the turn between
   two frames, taken the short way round, times the frame rate. */
const s4seen = (r,fs)=>{ const u=r/fs; return (u-Math.floor(u+0.5))*fs; };
/* A number for a figure note: at most two decimals, no trailing zeros. */
const s4n = (v,d)=>String(+v.toFixed(d==null?2:d));
/* The lines of a sum of cosines after sampling at ws, drawn over |w| < span.
   A cosine at w0 puts a line at every k*ws +- w0. Before the filter (o.pre)
   the baseband lines are cyan and the copies violet; after it, a line inside
   |w| < ws/2 is kept: cyan when it is the signal's own line (k = 0), red when
   a copy brought it; every rejected line is grey. o.copies fades the copies,
   o.box the dashed filter. */
function s4lines(a, ws, comps, span, o){
  o = o||{};
  const wc = ws/2, K = Math.ceil((span+Math.max(...comps))/ws)+1;
  for(let k=-K;k<=K;k++) for(const w0 of comps) for(const s of [1,-1]){
    const pos = k*ws+s*w0; if(Math.abs(pos) > span-1e-9) continue;
    const keep = Math.abs(pos) < wc-1e-9;
    const col = o.pre ? (k===0 ? C.in : C.mid) : (keep ? (k===0 ? C.in : C.err) : C.muted);
    fade(a, k===0 ? 1 : (o.copies==null ? 1 : o.copies), ()=>a.impulse(pos,1,{color:col,label:false}));
  }
  fade(a, o.box==null ? 1 : o.box, ()=>a.rect(-wc,0,wc,1.25,{stroke:C.h,dash:'6 4',width:1.6}));
}
/* Two panels in one figure, one above the other: the upper takes the fraction
   `fr` of the height. A grown figure hands its height through P.hOverride,
   which is taken here and split, so neither panel claims the whole of it. */
const s4Stack = (H0, fr, top, bot)=>{
  const H = P.hOverride || H0, h1 = Math.round(H*fr), h2 = H - h1; P.hOverride = null;
  return `<svg viewBox="0 0 560 ${H}" xmlns="http://www.w3.org/2000/svg" role="img">`
    + top(h1).replace('<svg ',`<svg x="0" y="0" width="560" height="${h1}" `)
    + bot(h2).replace('<svg ',`<svg x="0" y="${h1}" width="560" height="${h2}" `) + '</svg>'; };
/* A strip of stripes drawn from a brightness b(x) in [0, 1], between the
   heights ya and yb: dark where b is small. `px` gives the width of one
   piece, so the same call draws a fine pattern or the pixels of a grid. */
const s4strip = (a, b, xa, xb, px, ya, yb)=>{
  for(let x=xa; x<xb-1e-9; x+=px){ const v=b(x+px/2), d=Math.max(0,Math.min(1,1-v));
    if(d>0.004) a.raw(`<rect x="${a.sx(x).toFixed(2)}" y="${a.sy(yb).toFixed(2)}" width="${(a.sx(Math.min(x+px,xb))-a.sx(x)+0.3).toFixed(2)}" height="${(a.sy(ya)-a.sy(yb)).toFixed(2)}" fill="${C.ink}" fill-opacity="${d.toFixed(3)}"/>`); }
  a.raw(`<rect x="${a.sx(xa).toFixed(2)}" y="${a.sy(yb).toFixed(2)}" width="${(a.sx(xb)-a.sx(xa)).toFixed(2)}" height="${(a.sy(ya)-a.sy(yb)).toFixed(2)}" fill="none" stroke="${C.axis}" stroke-width="1.2"/>`);
};
/* Bars of period q: dark on the first half of every period, from xa to xb. */
const s4bars = (a, q, xa, xb, ya, yb)=>{
  for(let x=xa; x<xb-1e-9; x+=q){ const e=Math.min(x+q/2, xb);
    a.raw(`<rect x="${a.sx(x).toFixed(2)}" y="${a.sy(yb).toFixed(2)}" width="${(a.sx(e)-a.sx(x)).toFixed(2)}" height="${(a.sy(ya)-a.sy(yb)).toFixed(2)}" fill="${C.ink}"/>`); }
};
/* The anti-aliasing example: a triangular spectrum of peak 1 that reaches
   zero at 3 pi rad/s, sampled at ws = 4 pi rad/s. The filter H_AA keeps
   |w| < wa; the reconstruction keeps |w| < ws/2 = 2 pi with gain T, so the
   recovered spectrum is the sum of the filtered copies inside that band. */
const s4AAB = 3*PI, s4AAWS = 4*PI;
const s4X  = w => tri0(w, s4AAB, 1);
const s4Y  = (w,wa) => Math.abs(w) < wa ? s4X(w) : 0;
const s4Xr = (w,wa) => { if(Math.abs(w) >= s4AAWS/2) return 0; let s=0;
  for(let k=-2;k<=2;k++) s += s4Y(w-k*s4AAWS, wa); return s; };
/* error energy (1/2pi) * integral |X - X_r|^2 dw, by the midpoint rule */
const s4Err = wa => { const N=6000, lo=-s4AAB, h=2*s4AAB/N; let s=0;
  for(let i=0;i<N;i++){ const w=lo+(i+0.5)*h, d=s4X(w)-s4Xr(w,wa); s+=d*d; }
  return s*h/(2*PI); };
/* the spoke of the wagon wheel: 9 turns a second, 10 frames a second */
const s4R = 9, s4FS = 10;
/* Hearing aliasing with a chirp. x(t) = cos(2 pi 1000 t^2): its frequency
   f(t) = 2000 t Hz rises from 0 to 6 kHz in 3 s. It is sampled at 4 kHz. */
const S4CFS = 4000, S4CD = 3;
const s4chirp = t => Math.cos(2*PI*1000*t*t);
/* The samples played back through the ideal low-pass filter of cutoff fs/2:
   x_r(t) = sum_n x[n] sinc(pi (fs t - n)), sinc(theta) = sin(theta)/theta.
   The sum keeps 32 terms on each side under the taper (1 - (d/L)^2)^2, and
   sin(pi (u - n)) = (-1)^n sin(pi u) saves a sine a term. */
const s4Recon = (x, fs, dur) => {
  const L = 32, N = Math.ceil(dur*fs), xs = new Float64Array(N+1);
  for(let n=0;n<=N;n++) xs[n] = x(n/fs);
  return t => { const u = t*fs, r = Math.round(u);
    if(Math.abs(u-r) < 1e-9) return r>=0 && r<=N ? xs[r] : 0;
    const s = Math.sin(PI*u), n0 = Math.floor(u); let y = 0;
    for(let n=Math.max(0,n0-L+1); n<=Math.min(N,n0+L); n++){ const d = u-n;
      const q = 1-(d/L)*(d/L); y += xs[n]*q*q*((n&1) ? -s : s)/(PI*d); }
    return y; }; };
/* Why 44.1 kHz. The anti-aliasing filter passes 0 to 20 kHz and falls in a
   straight line to its stop level at 20 + D kHz. A flat input leaves it with
   the shape of the filter; sampling at fs puts a copy of that at every k fs. */
const s4Trap = (c, D) => [[c-20-D,0],[c-20,1],[c+20,1],[c+20+D,0]];
const s4AAf = (f, D) => { const a = Math.abs(f); return a <= 20 ? 1 : (a >= 20+D ? 0 : (20+D-a)/D); };
/* </m7-s4-helpers> */
/* <m7-s5-helpers> */
/* Section 7.5, discrete-time processing of continuous-time signals.
   Both frequencies appear together here, so this section writes omega for
   continuous-time frequency in rad/s and Omega for discrete-time frequency
   in rad/sample, with Omega = omega T. The worked chain uses the running
   signal (w_M = 2 pi rad/s) and T = 0.25 s, so Omega = pi is omega = 4 pi. */
const S5T = 0.25;
/* Two panels in one figure, the upper over the lower. A grown or redrawn
   figure hands its height through P.hOverride, which is taken here and split.
   Lecture mode takes its own base height and share, each [normal, lecture]. */
const s5Stack = (H0, r, top, bot) => {
  const L = P.labelScale() > 1 ? 1 : 0, H = P.hOverride || H0[L]; P.hOverride = null;
  const h1 = Math.round(H*r[L]), h2 = H - h1;
  return `<svg viewBox="0 0 560 ${H}" xmlns="http://www.w3.org/2000/svg" role="img">`
    + top(h1).replace('<svg ', `<svg x="0" y="0" width="560" height="${h1}" `)
    + bot(h2).replace('<svg ', `<svg x="0" y="${h1}" width="560" height="${h2}" `) + '</svg>'; };
/* The period of a discrete-time spectrum: dashed marks at -pi and pi and a
   bracket between them, named to the left of -pi, where a legend in the
   upper right corner never sits. */
const s5Period = (a, v, txt) => {
  a.vline(-PI,{color:C.coral,opacity:.5}); a.vline(PI,{color:C.coral,opacity:.5});
  a.span(-PI,PI,v,'',{color:C.coral});
  a.note(-PI,v,txt||'\\text{one period},\\;2\\pi',{tex:true,color:C.coral,fs:13,anchor:'end',dx:-8,dy:-3});
  return a; };
/* the tick numbers of an axis drawn in Omega but read in omega = Omega/T */
const s5wTick = v => piTick(v/S5T);
/* One triangular copy of peak 1 and half-width h, centred at c; the sum of
   the copies centred at every multiple of 2 pi; and whether a point lies
   where two copies meet. */
const s5Tri = (x,c,h) => Math.abs(x-c) < h ? 1-Math.abs(x-c)/h : 0;
const s5Sum = (x,h) => { let s=0; for(let k=-4;k<=4;k++) s+=s5Tri(x,2*PI*k,h); return s; };
const s5Ov  = (x,h) => { let m=0; for(let k=-4;k<=4;k++) if(s5Tri(x,2*PI*k,h) > 1e-9) m++; return m > 1; };
/* The chain as a block diagram, drawn `h` tall. The stage that the frame is
   at is outlined in coral: 0 the input, 1 the C/D converter, 2 the
   discrete-time system, 3 the D/C converter. */
const s5Chain = (h, stage) => {
  const cy = Math.round(h*0.40), bh = 46, by = cy - bh/2;
  const box = (x,w,label,i) => ({t:'box', x, y:by, w, h:bh, label, tex:true, fs:16, color: stage===i ? C.coral : C.ink});
  const arr = (x1,x2,label,i) => ({t:'arrow', x1, y1:cy, x2, y2:cy, label, tex:true, color: stage===i ? C.coral : C.ink});
  return P.blocks({w:560, h, items:[
    arr(4,74,'x_c(t)',0), box(74,70,'\\text{C/D}',1), arr(144,212,'x_d[n]',-1),
    box(212,136,'H_d(e^{j\\Omega})',2), arr(348,416,'y_d[n]',-1), box(416,70,'\\text{D/C}',3),
    arr(486,556,'y_c(t)',-1),
    {t:'text', x:109, y:by+bh+26, label:'T', tex:true, fs:15},
    {t:'text', x:451, y:by+bh+26, label:'T', tex:true, fs:15}]}); };
/* The three-point average of the equivalent-system slide:
   y_d[n] = x_d[n+1]/4 + x_d[n]/2 + x_d[n-1]/4, so H_d = (1 + cos Omega)/2. */
const s5Avg = W => 0.5*(1+Math.cos(W));
/* The quantizer of a converter with B bits over the range -1 to 1: 2^B levels
   a step D = 2/2^B apart, at +-D/2, +-3D/2, ...; each value goes to the level
   of its step, and the two end levels take everything beyond them. */
const s5Q = (x,B) => { const D = 2/Math.pow(2,B), q = D*(Math.floor(x/D)+0.5);
  return Math.max(-1+D/2, Math.min(1-D/2, q)); };
/* The signal-to-noise ratio in dB measured on 200 000 samples of a full-scale
   sine whose frequency is not a simple fraction of the rate. */
const s5SnrM = (()=>{ const memo = {};
  return B => { if(memo[B] != null) return memo[B];
    let ps = 0, pe = 0;
    for(let n=0;n<200000;n++){ const x = Math.sin(2*PI*0.0123456789*n), e = s5Q(x,B)-x; ps += x*x; pe += e*e; }
    return (memo[B] = 10*Math.log10(ps/pe)); }; })();
/* the half-sample-delay input, t in ms: band-limited to 320 Hz, sampled at 1 kHz */
const s5Xh = t => Math.sin(2*PI*0.15*t) + 0.5*Math.cos(2*PI*0.32*t);
/* the unnormalised sinc, sinc(theta) = sin(theta)/theta */
const s5Sinc = u => Math.abs(u) < 1e-9 ? 1 : Math.sin(u)/u;
/* the frequency a sampled tone comes back at, in [0, fs/2] */
const s5fold = (f0,fs) => Math.abs(f0 - fs*Math.floor(f0/fs+0.5));
/* a number for a figure note: at most d decimals, no trailing zeros */
const s5n = (v,d) => String(+v.toFixed(d==null?2:d));
/* </m7-s5-helpers> */
/* <m7-s6-helpers> */
/* Section 7.6, sampling a sequence: decimation and interpolation.
   Every spectrum here is a discrete-time transform, so it is drawn over more
   than one period of 2 pi and the period is marked, as in Module 6. The words
   of the bracket sit to the left of it, so they never share a column with the
   name of the vertical axis. */
const s6Period = (a, v) => {
  a.vline(-PI,{color:C.coral,opacity:.5}); a.vline(PI,{color:C.coral,opacity:.5});
  a.span(-PI,PI,v,'',{color:C.coral});
  a.note(-PI,v,'\\text{one period},\\;2\\pi',{tex:true,color:C.coral,fs:13,anchor:'end',dx:-8,dy:-3});
  return a; };
/* the spectrum axes of the section: -3 pi to 3 pi, a tick at every pi */
const s6AX = o => AXW(-3*PI,3*PI,PI,o);
/* the frequency taken into one period, -pi to pi */
const s6wrap = w => w - 2*PI*Math.round(w/(2*PI));
/* The running sequence x[n] = (sin(pi n/8)/(pi n/8))^2, with the value 1 at
   n = 0. Its transform is a triangle of peak 8 that reaches zero at |w| = pi/4
   and repeats every 2 pi, so its band edge is wM = pi/4. */
const s6x = n => { const u = PI*n/8; return Math.abs(u) < 1e-12 ? 1 : Math.pow(Math.sin(u)/u, 2); };
const S6W = PI/4, S6PK = 8;
/* one triangle of the periodic spectrum, centred at c (and at every c + 2 pi m),
   of half-width W and peak pk; undefined outside its band, so a copy drawn on
   its own shows only the interval it occupies */
const s6tri = (w,c,W,pk) => { const u = Math.abs(s6wrap(w-c)); return u < W ? pk*(1-u/W) : NaN; };
const s6tri0 = (w,c,W,pk) => { const v = s6tri(w,c,W,pk); return isFinite(v) ? v : 0; };
/* The sampled spectrum (1/N) sum_k X(e^{j(w - 2 pi k/N)}), copy by copy. The
   copy k = 0 is X/N itself and keeps the input colour; the others are violet.
   Where two copies meet, their sum is drawn in the aliasing colour over a red
   wash. `s` stretches the frequency axis (decimation, s = N), and `o.h`
   changes the height of every copy. */
const s6Copies = (a, N, W, pk, s, o) => {
  o = o||{}; s = s||1;
  const h = o.h!=null ? o.h : pk/N, K = N;
  const n0 = w => { let c=0; for(let k=0;k<K;k++) if(s6tri0(w/s,2*PI*k/N,W,h)>1e-12) c++; return c; };
  const sum = w => { let v=0; for(let k=0;k<K;k++) v += s6tri0(w/s,2*PI*k/N,W,h); return v; };
  if(W > PI/N + 1e-9)
    a.area(w => n0(w)>=2 ? sum(w) : 0, -3*PI, 3*PI, {color:s6Wash(C.err,.22), n:1600});
  for(let k=0;k<K;k++)
    a.curve(w => s6tri(w/s,2*PI*k/N,W,h), {color:k?C.mid:C.in, n:2400, width:(W>PI/N+1e-9)?1.6:2.4});
  if(W > PI/N + 1e-9)
    a.curve(w => n0(w)>=2 ? sum(w) : NaN, {color:C.err, n:2400, width:2.6});
  return a; };
/* a signal colour as a translucent wash, rgba */
const s6Wash = (c, al) => { const n = parseInt(c.slice(1), 16);
  return `rgba(${n>>16&255},${n>>8&255},${n&255},${al})`; };
/* the tone mixture of the listening slides: 500 Hz and 3 kHz sampled at
   8 kHz, so w1 = pi/8 and w2 = 3 pi/4 rad/sample */
const S6W1 = PI/8, S6W2 = 3*PI/4;
const s6cos = f => t => Math.cos(2*PI*f*t);
/* the lines of a line spectrum at every w0 + 2 pi m in the drawn range */
const s6lines = (a, w0, ht, col) => { for(let m=-3;m<=3;m++) for(const sg of [1,-1]){
  const p = sg*w0 + 2*PI*m; if(Math.abs(p) <= 3*PI+1e-9) a.impulse(p, ht, {color:col, label:false}); } };
/* a filter band of height ht on |wrap(w)| < wc, in every period */
const s6band = (a, wc, ht) => { for(let m=-1;m<=1;m++){
  const lo = Math.max(-3*PI, 2*PI*m-wc), hi = Math.min(3*PI, 2*PI*m+wc);
  a.rect(lo, 0, hi, ht, {stroke:C.h, dash:'6 4', width:1.6}); } };
/* the stems of f over the integer range [lo, hi], each at position pos(n) */
const s6stems = (a, f, lo, hi, col, pos, r) => a.stem(D(f,lo,hi).filter(p=>isFinite(p[1])).map(([n,v])=>[pos?pos(n):n, v]), {color:col, r:r||4});
/* </m7-s6-helpers> */
/* <m7-s7-helpers> */
/* Small sketches for the summary and project cards. Both pages are navy, so
   they are drawn in the dark-page signal tints: cyan the signal, violet the
   samples and the copies, amber a filter or a hold, green an output, red an
   overlap or an alias. */
const G7 = (()=>{
  const sv = b => `<svg viewBox="0 0 92 44">${b}</svg>`;
  const ln = (d,c,w,dash) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w||2}" stroke-linecap="round" stroke-linejoin="round"${dash?` stroke-dasharray="${dash}"`:''}/>`;
  const dot = (x,y,c) => `<circle cx="${x}" cy="${y.toFixed(1)}" r="2.3" fill="${c}"/>`;
  const st = (x,y,c,base) => ln(`M${x} ${base||40} V${y.toFixed(1)}`,c,1.6)+dot(x,y,c);
  const tr = (f,c,w,x0,x1,dash) => { const a=x0==null?2:x0, b=x1==null?90:x1, o=[];
    for(let x=a;x<=b+1e-9;x+=0.5){ const y=f(x); if(isFinite(y)) o.push((o.length?'L':'M')+x+','+y.toFixed(1)); }
    return ln(o.join(''),c,w||1.8,dash); };
  const imp = (x,y,c,base) => ln(`M${x} ${base||40} V${y+3}`,c,1.6)+`<path d="M${x} ${y-2} l-3,6 h6 Z" fill="${c}"/>`;
  const box = (x,y,w,h,c,dash) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${c}" stroke-width="1.5"${dash?` stroke-dasharray="${dash}"`:''}/>`;
  const AX='rgba(239,231,216,.30)', MK='rgba(239,231,216,.70)', CY='#4FBECE', GR='#82C27B', RD='#E8785F', VI='#AC99DC', AM='#E5B255';
  /* a triangular copy centred at c, half-width h, peak height p above y = 40 */
  const tri = (c,h,p) => x => Math.abs(x-c)<=h ? 40-p*(1-Math.abs(x-c)/h) : NaN;
  const tri0 = (c,h,p) => x => Math.abs(x-c)<=h ? p*(1-Math.abs(x-c)/h) : 0;
  const snc = u => Math.abs(u)<1e-9 ? 1 : Math.sin(Math.PI*u)/(Math.PI*u);
  /* the smooth signal of the reconstruction sketches, sampled every 12 units */
  const sig = x => 24-11*Math.sin((x-4)/12)-4*Math.cos((x-4)/7);
  const XS = [6,18,30,42,54,66,78,90];
  const stair = XS.map((x,i)=> (i?'L':'M')+x+','+sig(x).toFixed(1)+' H'+Math.min(x+12,90)).join(' ');
  return {
    samp:   sv(ln('M1 40 H91',AX,1)+tr(x=>40-30*Math.pow(snc((x-46)/22),2),CY,1.2)+[-5,-4,-3,-2,-1,0,1,2,3,4,5].map(k=>st(46+k*8,40-30*Math.pow(snc(k*8/22),2),VI)).join('')),
    copies: sv(ln('M1 40 H91',AX,1)+tr(tri(46,11,26),CY,1.9)+tr(tri(16,11,26),VI,1.9)+tr(tri(76,11,26),VI,1.9)),
    guard:  sv(ln('M1 40 H91',AX,1)+tr(tri(30,12,26),CY,1.9)+tr(tri(62,12,26),VI,1.9)+ln('M42 30 V26 H50 V30',MK,1.3)),
    alias:  sv(ln('M1 40 H91',AX,1)+tr(tri(46,15,20),CY,1.2,null,null,'3 3')+tr(tri(26,15,20),VI,1.2,null,null,'3 3')+tr(tri(66,15,20),VI,1.2,null,null,'3 3')
               +tr(x=>{ const s=tri0(46,15,20)(x)+tri0(26,15,20)(x)+tri0(66,15,20)(x); return s>0.01 ? 40-s : NaN; },RD,2,12,80)),
    theorem:sv(ln('M1 40 H91',AX,1)+tr(tri(46,10,24),CY,1.9)+tr(tri(14,10,24),VI,1.9)+tr(tri(78,10,24),VI,1.9)+box(30,8,32,32,AM,'4 3')),
    interp: sv(ln('M1 24 H91',AX,1)+XS.map(xk=>tr(x=>24-(24-sig(xk))*snc((x-xk)/12),AX,1,Math.max(2,xk-26),Math.min(90,xk+26))).join('')
               +tr(sig,GR,1.9)+XS.map(x=>dot(x,sig(x),VI)).join('')),
    zoh:    sv(tr(sig,CY,1.2,2,90,'3 3')+ln(stair,GR,1.9)+XS.map(x=>dot(x,sig(x),VI)).join('')),
    foh:    sv(tr(sig,CY,1.2,2,90,'3 3')+ln(XS.map((x,i)=>(i?'L':'M')+x+','+sig(x).toFixed(1)).join(' '),GR,1.9)+XS.map(x=>dot(x,sig(x),VI)).join('')),
    alcos:  sv(ln('M1 22 H91',AX,1)+tr(x=>22-15*Math.cos(2*Math.PI*0.9*(x-6)/8),CY,1,2,90)+tr(x=>22-15*Math.cos(2*Math.PI*0.1*(x-6)/8),RD,2)
               +[0,1,2,3,4,5,6,7,8,9,10].map(k=>dot(6+k*8,22-15*Math.cos(2*Math.PI*0.1*k),VI)).join('')),
    /* a signal, its samples, a digital system, the output */
    dtproc: sv(ln('M1 40 H91',AX,1)+tr(x=>26-9*Math.sin(x/5),CY,1.8,2,20)+[26,32,38].map(x=>st(x,26-9*Math.sin(x/5),VI)).join('')
               +box(45,12,18,20,AM)+ln('M40 22 H45 M63 22 H68',MK,1.2)+tr(x=>26-7*Math.sin((x-70)/5),GR,1.8,70,90)),
    /* a sine whose samples snap to the levels of a coarse grid */
    quant:  sv([4,10,16,28,34,40].map(y=>ln(`M1 ${y} H91`,AX,0.8,'2 3')).join('')+ln('M1 22 H91',AX,1)
               +tr(x=>22-17*Math.sin((x-2)/88*2*Math.PI),CY,1.2,2,90,'3 3')
               +[6,14,22,30,38,46,54,62,70,78,86].map(x=>st(x,22+6*Math.round(-17*Math.sin((x-2)/88*2*Math.PI)/6),VI,22)).join('')),
    /* every third sample kept */
    decim:  sv(ln('M1 40 H91',AX,1)+[...Array(13)].map((_,k)=>{ const x=4+7*k, y=26-11*Math.cos((x-4)/13);
               return k%3 ? ln(`M${x} 40 V${y.toFixed(1)}`,CY,1.2)+`<circle cx="${x}" cy="${y.toFixed(1)}" r="1.6" fill="${CY}"/>` : st(x,y,GR); }).join('')),
    /* project cards */
    tone:   sv(ln('M1 40 H91',AX,1)+ln('M52 4 V42',AM,1.3,'3 3')+imp(72,10,CY)+imp(32,10,RD)+ln('M70 6 C62 0, 42 0, 34 6',MK,1.1,'2 3')),
    moire:  sv([...Array(46)].map((_,i)=>{ const x=2+i*1.95, o=0.15+0.8*Math.pow(Math.cos(Math.PI*(x-2)/88*2),2);
               return `<path d="M${x.toFixed(2)} 5 V39" stroke="${CY}" stroke-width="1.1" stroke-opacity="${o.toFixed(2)}"/>`; }).join('')),
    wheel:  sv(`<circle cx="46" cy="22" r="16" fill="none" stroke="${MK}" stroke-width="1.4"/>`+ln('M46 22 L57 11',CY,2.2)+dot(46,22,CY)
               +ln('M29 16 A18 18 0 0 1 40 5',RD,1.8)+`<path d="M27 21 l-2.2,-7.4 l6.8,1.6 Z" fill="${RD}"/>`),
    dac:    sv(tr(sig,GR,1.9)+ln(stair,AM,1.5)+XS.map(x=>dot(x,sig(x),VI)).join('')),
    /* the measured SNR against the number of bits, on a line of about 6 dB a bit */
    bits:   sv(ln('M6 4 V40 H91',AX,1)+ln('M10 36 L88 6',MK,1.2,'3 3')+[0,1,2,3,4,5,6].map(k=>dot(14+12*k,34.5-4.6*k+(k<2?1.6-0.8*k:0),GR)).join(''))
  };
})();
/* </m7-s7-helpers> */

const SC = [

/* ------------------------------------------------------------------ opening */
{ id:'m7-open', module:'M7', nav:'Module 7 opening', title:'Sampling and Aliasing', src:'pp. 80–88',
  dark:true, keywords:'module 7 sampling aliasing nyquist replication reconstruction overview', steps:0, blocks:[
  {t:'eyebrow', text:'Module 7 · Sampling and Aliasing', src:'pp. 80–88'},
  {t:'title', level:1, text:'Sampling and Aliasing'},
  {t:'lede', text:'Sampling keeps the value of a signal every $T$ seconds and discards the values between those instants. This module gives the condition for exact recovery and shows how a signal changes when that condition fails.'},
  {t:'cols', ratio:'c-5-7', left:[
    {t:'raw', html:`<div style="margin-top:16px">
      <div style="font-family:var(--mono);font-size:12.5px;letter-spacing:.14em;color:var(--slate);margin-bottom:10px">THE ENTIRE MODULE, IN TWO LINES</div></div>`},
    {t:'eq', tex:'X_p(j\\omega)=\\frac{1}{T}\\sum_{k=-\\infty}^{\\infty}X\\bigl(j(\\omega-k\\omega_s)\\bigr)', label:'Sampling replicates the spectrum'},
    {t:'eq', tex:'\\omega_s>2\\omega_M\\;\\Longrightarrow\\;x(t)\\ \\text{is recoverable}', label:'and the copies stay apart'},
    {t:'note', kind:'ok', head:'Two words that are not the same', html:'<span style="color:var(--graphite)">Sampling always makes <b>copies</b>. Copies that reach each other <b>overlap</b>, and only that overlap is aliasing. Keeping the two apart is most of this module.</span>'}
  ], right:[
    {t:'fig', svg:()=>{
      const a=P.Axes({w:820,h:430,xr:[-8.5*PI,8.5*PI],yr:[-0.3,4.9],grid:false,zeroAxes:false,arrows:false,
        pad:{l:20,r:20,t:20,b:20},xticksOverride:[],yticksOverride:[]});
      /* three rates, one above the other: apart, touching, overlapping */
      [[6*PI,3.4],[4*PI,1.75],[2.8*PI,0.1]].forEach(([ws,base],i)=>{
        const pk=1.05;
        for(let k=-3;k<=3;k++)
          a.curve(w=>{ const v=tri(w-k*ws,WM,pk); return isFinite(v)? v+base : NaN; },
            {color:k===0?'#7FC3CE':(Math.abs(k)===1?'#AC99DC':C.slate),width:i===2?1.3:2.2,dash:i===2?'4 4':null,n:1400,anim:i===2?null:{delay:i*.6}});
        if(i===2) a.curve(w=>{ const v=rep(w,WM,pk,ws,4); return v>0.002? v+base : NaN; },{color:'#E8785F',width:2.6,n:1800,anim:{delay:1.4,sweep:'#FFD9CE'}});
      });
      return a.svg(); }}
  ]}
]},

/* <m7-s1> ============================================ 7.1 the sampler and the sampled spectrum */

/* ---------------------------------------------------------------- sampler */
{ id:'m7-sampler', module:'M7', nav:'The sampler', title:'Ideal Impulse-Train Sampling', src:'p. 80',
  objective:'Model sampling as multiplication by an impulse train and read the weight of each impulse off the sifting property.',
  keywords:'impulse train sampling p(t) x_p(t) multiplication sifting sample weight nT', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 7 · The sampler', src:'p. 80'},
  {t:'title', text:'Ideal Impulse-Train Sampling'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$x(t)$: the signal','$p(t)$: an impulse every $T$','$x_p(t)=x(t)\\,p(t)$']},
      svg:v=>{
      /* frame 0 is the signal; frame 1 brings in the impulse train; frame 2
         shrinks every impulse from weight 1 to x(nT) */
      const f=v?v.frame:0, T=0.25, u1=cl(f), u2=cl(f-1);
      const a=AX({h:340,xr:[-2.2,2.2],yr:[-0.15,1.45],xlabel:'t\\;[\\text{s}]',
        ylabel:f<0.5?'x(t)':(f<1.5?'x(t),\\;p(t)':'x_p(t)'),yticksOverride:[0,0.5,1],xtarget:9});
      fade(a,1-u2,()=>a.curve(xB,{color:C.in,n:1600}));
      fade(a,u2,()=>a.curve(xB,{color:C.in,width:1.3,dash:'4 5',n:1600}));
      const hts=D(n=>1+u2*(xB(n*T)-1),-8,8);
      fade(a,u1*(1-u2),()=>hts.forEach(([n,h])=>s1Imp(a,n*T,h,C.h)));
      fade(a,u2,()=>hts.forEach(([n,h])=>s1Imp(a,n*T,h,C.mid)));
      return a.svg(); },
      caption:'The signal $x(t)=\\bigl(\\sin(\\pi t)/(\\pi t)\\bigr)^{2}$ and an impulse train with $T=0.25$ s. Press Next: each impulse shrinks to the value of $x$ at its own instant.'},
    {t:'legend', items:[['in','$x(t)$'],['h','$p(t)$'],['mid','$x_p(t)$']]}
  ], right:[
    {t:'eq', tex:'p(t)=\\sum_{n=-\\infty}^{\\infty}\\delta(t-nT),\\qquad x_p(t)=x(t)\\,p(t)', label:'Impulse-train sampling',
      note:'The sampler multiplies $x(t)$ by the {{sym:pt|impulse train}} of period {{sym:Tsamp|$T$}}.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'x_p(t)=\\sum_{n}x(t)\\,\\delta(t-nT)=\\sum_{n}x(nT)\\,\\delta(t-nT)',
        label:'Each impulse keeps one value',
        note:'Put $p(t)$ in, then sift: $x(t)\\delta(t-nT)=x(nT)\\delta(t-nT)$, since the impulse is zero except at $t=nT$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'$x(t)=\\cos(2\\pi t)$ is sampled with $T=0.25$ s.<div class="nsep"></div>What weight does the impulse at $t=0.5$ s carry?',
        ask:{key:'m7-sampler', choices:['$-1$','$0$','$1$'], answer:0,
          why:'The weight is $x(0.5)=\\cos(\\pi)=-1$, so that arrow points down.'}}]}
  ]}
]},

{ id:'m7-sampler-b', module:'M7', nav:'Samples as a sequence', title:'Samples as a Sequence', src:'p. 80',
  objective:'Read the weights of the sampled signal as a sequence x_p[n] = x(nT), and see how T spreads them in time.',
  keywords:'sampled signal sequence x_p[n] = x(nT) impulse weight arrow height sampling period', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 7 · The sampler', src:'p. 80'},
  {t:'title', text:'Samples as a Sequence'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'T', label:'$T$', min:0.1, max:0.5, step:0.05, v:0.25, show:v=>'$'+v.toFixed(2)+'\\ \\text{s}$'}]},
      svg:v=>{
      const T=v?v.T:0.25, N=Math.floor(2.2/T+1e-9);
      return s1Stack(370, 0.5, h=>{
        const a=AX({h,pad:{l:52,r:24,t:16,b:28},xnameDrop:54,xr:[-2.2,2.2],yr:[-0.15,1.3],xlabel:'t\\;[\\text{s}]',ylabel:'x_p(t)',yticksOverride:[0,1],xtarget:9});
        a.curve(xB,{color:C.in,width:1.3,dash:'4 5',n:1600});
        D(n=>xB(n*T),-N,N).forEach(([n,x])=>s1Imp(a,n*T,x,C.mid));
        return a.svg(); }, h=>{
        const a=AX({h,pad:{l:52,r:24,t:16,b:28},xnameDrop:54,xr:[-N-0.8,N+0.8],yr:[-0.15,1.3],xlabel:'n',ylabel:'x_p[n]',yticksOverride:[0,1],xtarget:9});
        a.stem(D(n=>xB(n*T),-N,N),{color:C.mid,r:N>12?2.6:3.4});
        return a.svg(); }); },
      caption:'Top: the arrows of $x_p(t)$ over $t$. Bottom: the same weights as a sequence over $n$. Move $T$: the arrows spread out in time, and the sequence keeps one number for each arrow.'},
    {t:'legend', items:[['in','$x(t)$',true],['mid','$x_p(t)$ and $x_p[n]$']]}
  ], right:[
    {t:'note', kind:'def', head:'How an impulse is drawn', html:'An arrow&rsquo;s height is its <b>weight</b>, not a value of a function. The arrow at $t=nT$ reaches $x(nT)$, so the arrowheads trace $x(t)$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'x_p[n]=x(nT),\\qquad n=0,\\pm1,\\pm2,\\dots', label:'The sequence of samples',
        note:'The sampler keeps only these numbers. The rest of the module asks when they are enough to rebuild {{sym:xp|$x(t)$}}.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'$x(t)=\\bigl(\\sin(\\pi t)/(\\pi t)\\bigr)^{2}$ is sampled with $T=0.2$ s.<div class="nsep"></div>Which is the first sample after $n=0$ that equals zero?',
        ask:{key:'m7-sampler-b', choices:['$x_p[1]$','$x_p[2]$','$x_p[5]$'], answer:2,
          why:'$x(t)$ is first zero at $t=1$ s, and $nT=1$ gives $n=5$.'}}]}
  ]}
]},

/* ------------------------------------------------------------------ rates */
{ id:'m7-rates', module:'M7', nav:'Rate in rad/s and in hertz', title:'Sampling Rate in Radians and Hertz', src:'p. 81',
  objective:'Separate the sampling angular frequency in rad/s from the sampling frequency in hertz.',
  keywords:'sampling frequency angular rad/s hertz omega_s f_s 2 pi conversion units samples per second', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 7 · Notation', src:'p. 81'},
  {t:'title', text:'Sampling Rate in Radians and Hertz'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'T', label:'$T$', min:0.1, max:1, step:0.05, v:0.25, show:v=>'$'+v.toFixed(2)+'\\ \\text{ms}$'}]},
      svg:v=>{
      /* T in milliseconds: omega_s = 2 pi / T = (2000/T) pi rad/s, f_s = 1000/T Hz */
      const Tm=v?v.T:0.25;
      const a=AX({h:340,xr:[-0.15,2.1],yr:[-1.35,3.2],xlabel:'t\\;[\\text{ms}]',ylabel:'\\cos(\\omega_s t)',
        yticksOverride:[-1,0,1],xticksOverride:[0.5,1,1.5,2]});
      a.curve(t=>Math.cos(2*PI*t/Tm),{color:C.in,n:2400});
      for(let n=0;n*Tm<=2.05;n++) a.impulse(n*Tm,1,{color:C.h,label:false});
      a.note(0.07,2.62,'\\omega_s='+s1Num(2000/Tm,1)+'\\pi\\ \\text{rad/s}',{tex:true,anchor:'start',color:C.ink,fs:17});
      a.note(0.07,1.92,'f_s='+s1Num(1000/Tm,1)+'\\ \\text{Hz}',{tex:true,anchor:'start',color:C.ink,fs:17});
      return a.svg(); },
      caption:'$\\cos(\\omega_s t)$ turns through $2\\pi$ rad in each period $T$. Move $T$: fewer samples fit into $2$ ms, and both rates fall.'},
    {t:'legend', items:[['in','$\\cos(\\omega_s t)$'],['h','$p(t)$']]}
  ], right:[
    {t:'eq', tex:'\\omega_s=\\frac{2\\pi}{T}\\ \\left[\\frac{\\text{rad}}{\\text{s}}\\right],\\qquad f_s=\\frac{1}{T}\\ [\\text{Hz}],\\qquad \\omega_s=2\\pi f_s',
      label:'Sampling rate, both readings',
      note:'{{sym:ws|$\\omega_s$}} is an <b>angular</b> rate. {{sym:fs|$f_s$}} counts samples per second.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'err', head:'The factor $2\\pi$', html:'$T=0.25$ ms gives $\\omega_s=8000\\pi$ rad/s and $f_s=4000$ Hz. Reading $2\\pi/T$ in hertz is wrong by $2\\pi$. Check: $\\omega_sT=2\\pi$, $f_sT=1$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'The same for the signal', html:'$\\omega_M$ rad/s is $f_M=\\omega_M/2\\pi$ Hz. Spectra here are drawn against $\\omega$ in rad/s.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'A sensor takes $200$ samples per second.<div class="nsep"></div>What is $\\omega_s$?',
        ask:{key:'m7-rates', choices:['$200$ rad/s','$400\\pi$ rad/s','$100/\\pi$ rad/s'], answer:1,
          why:'$f_s=200$ Hz, so $\\omega_s=2\\pi f_s=400\\pi$ rad/s.'}}]}
  ]}
]},

/* ------------------------------------------------- the frequency-domain law */
{ id:'m7-freq', module:'M7', nav:'Transform of the impulse train', title:'Transform of the Impulse Train', src:'p. 80',
  objective:'Write the sampled spectrum as a convolution and give the transform of the impulse train.',
  keywords:'multiplication property convolution impulse train transform P(jw) 2pi/T spacing omega_s derivation', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 7 · The sampled spectrum', src:'p. 80'},
  {t:'title', text:'Transform of the Impulse Train'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'T', label:'$T$', min:0.25, max:1, step:0.05, v:0.4, show:v=>'$'+v.toFixed(2)+'\\ \\text{s}$'}]},
      svg:v=>{
      const T=v?v.T:0.4, ws=2*PI/T;
      return s1Stack(370, 0.42, h=>{
        const a=AX({h,pad:{l:52,r:24,t:16,b:28},xnameDrop:54,xr:[-2.2,2.2],yr:[-0.15,1.35],xlabel:'t\\;[\\text{s}]',ylabel:'p(t)',yticksOverride:[0,1],xtarget:9});
        for(let n=-Math.floor(2.2/T+1e-9);n*T<=2.2+1e-9;n++) a.impulse(n*T,1,{color:C.h,label:false});
        return a.svg(); }, h=>{
        const a=AXW(-20*PI,20*PI,8*PI,{h,pad:{l:52,r:24,t:16,b:28},xnameDrop:54,yr:[-1.2,34],ylabel:'P(j\\omega)',yticksOverride:[0,10,20]});
        for(let k=-Math.floor(20*PI/ws+1e-9);k*ws<=20*PI+1e-9;k++) a.impulse(k*ws,ws,{color:C.h,label:false});
        a.note(-18.8*PI,30,'\\text{weight}\\;\\tfrac{2\\pi}{T}='+s1Pi(2/T),{tex:true,anchor:'start',color:C.h,fs:15});
        return a.svg(); }); },
      caption:'Top: $p(t)$, weight $1$ every $T$ seconds. Bottom: $P(j\\omega)$, weight $2\\pi/T$ every $\\omega_s$. Move $T$: closer samples push the impulses of $P$ apart and up.'}
  ], right:[
    {t:'eq', tex:'X_p(j\\omega)=\\frac{1}{2\\pi}\\bigl[X(j\\omega)*P(j\\omega)\\bigr]', label:'Step 1 · Multiplication property',
      note:'$x_p=x\\,p$. Multiplication in time is convolution in frequency, with the factor $1/2\\pi$ of the transform pair.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'P(j\\omega)=\\frac{2\\pi}{T}\\sum_{k=-\\infty}^{\\infty}\\delta(\\omega-k\\omega_s),\\qquad \\omega_s=\\frac{2\\pi}{T}', label:'Step 2 · Transform of the impulse train',
        note:'Spacing $T$ in time gives spacing $\\omega_s$ in frequency. Every impulse has weight $2\\pi/T$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'The sampling period is $T=0.1$ s.<div class="nsep"></div>How far apart are the impulses of $P(j\\omega)$?',
        ask:{key:'m7-freq', choices:['$0.1$ rad/s','$10$ rad/s','$20\\pi$ rad/s'], answer:2,
          why:'$\\omega_s=2\\pi/T=2\\pi/0.1=20\\pi$ rad/s.'}}]}
  ]}
]},

{ id:'m7-freq-b', module:'M7', nav:'The sampled spectrum', title:'Spectrum of a Sampled Signal', src:'p. 81',
  objective:'Carry out the convolution with the impulse train and account for the factor 1/T.',
  keywords:'convolution shifted impulse sifting theta copies 1/T sampled spectrum X_p derivation replicas', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 7 · The sampled spectrum', src:'p. 81'},
  {t:'title', text:'Spectrum of a Sampled Signal'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$X(j\\omega)$: the signal','$k=0$: scaled by $1/T$','$k=\\pm1$: shifted by $\\pm\\omega_s$','$k=\\pm2$: shifted by $\\pm2\\omega_s$']},
      svg:v=>{
      /* T = 0.4 s, so omega_s = 5 pi rad/s and 1/T = 2.5. Frame 1 lifts the
         baseband to 1/T; frames 2 and 3 slide the copies out to k omega_s. */
      const f=v?v.frame:0, ws=5*PI, pk=2.5, u0=cl(f), u1=cl(f-1), u2=cl(f-2);
      const a=AXW(-11*PI,11*PI,5*PI,{h:340,yr:[-0.25,4.0],ylabel:'X_p(j\\omega)',yticksOverride:[0,1,2]});
      if(f>1) for(const s of [-1,1]) fade(a,cl(3*u1),()=>a.curve(w=>tri(w-s*ws*u1,WM,pk),{color:C.mid,n:1400}));
      if(f>2) for(const s of [-1,1]) fade(a,cl(3*u2),()=>a.curve(w=>tri(w-s*ws*(1+u2),WM,pk),{color:C.mid,n:1400}));
      a.curve(w=>tri(w,WM,1+1.5*u0),{color:C.in,n:1400});
      fade(a,u0,()=>a.note(0.45*PI,2.62,'\\tfrac{1}{T}=2.5',{tex:true,anchor:'start',color:C.in,fs:15}));
      return a.svg(); },
      caption:'Here $T=0.4$ s, so $\\omega_s=5\\pi$ rad/s and $1/T=2.5$. Press Next: each impulse of $P$ places one copy of $X$, scaled by $1/T$. The rebuilding filter later has gain $T$ to undo it.'},
    {t:'legend', items:[['in','$k=0$'],['mid','$k\\neq0$']]}
  ], right:[
    {t:'eq', tex:'\\begin{aligned}X_p(j\\omega)&=\\frac{1}{2\\pi}\\int X(j\\theta)\\,P\\bigl(j(\\omega-\\theta)\\bigr)\\,\\d\\theta\\\\&=\\frac{1}{2\\pi}\\cdot\\frac{2\\pi}{T}\\sum_{k}\\int X(j\\theta)\\,\\delta\\bigl(\\theta-(\\omega-k\\omega_s)\\bigr)\\,\\d\\theta\\end{aligned}',
      label:'Step 3 · Convolve with each impulse',
      note:'Put in Step 2, swap $\\sum$ and $\\int$ (over all $\\theta$); $\\delta$ is even.'},
    {t:'reveal', at:1, items:[
      {t:'eq', result:true, tex:'X_p(j\\omega)=\\frac{1}{T}\\sum_{k=-\\infty}^{\\infty}X\\bigl(j(\\omega-k\\omega_s)\\bigr)', label:'Key result · Spectrum of the sampled signal',
        note:'Sifting picks $X$ at $\\theta=\\omega-k\\omega_s$: every copy is $X$ times $1/T$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'$X(j0)=2$, $T=0.05$ s, and the copies do not overlap.<div class="nsep"></div>What is $X_p(j0)$?',
        ask:{key:'m7-freq-b', choices:['$2$','$0.1$','$40$'], answer:2,
          why:'Only the $k=0$ copy reaches $\\omega=0$, so $X_p(j0)=X(j0)/T=2/0.05=40$.'}}]}
  ]}
]},

/* --------------------------------------------------------------- replicas */
{ id:'m7-replicas', module:'M7', nav:'Replication', title:'Spectral Replication', src:'p. 81',
  objective:'Establish that the copies appear at every rate, name the baseband apart from the copies, and see how T moves and scales them.',
  keywords:'replication replicas copies baseband k index unconditional every rate spacing height 1/T spectrum', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 7 · The sampled spectrum', src:'p. 81'},
  {t:'title', text:'Spectral Replication'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'T', label:'$T$', min:0.25, max:0.48, step:0.01, v:0.4, show:v=>'$'+v.toFixed(2)+'\\ \\text{s}$'}]},
      svg:v=>{
      const T=v?v.T:0.4, ws=2*PI/T, pk=1/T;
      const a=AXW(-13*PI,13*PI,4*PI,{h:340,yr:[-0.3,7.2],ylabel:'X_p(j\\omega)',yticksOverride:[0,2,4]});
      s1Copies(a,ws,pk,3);
      /* the baseband label sits a row higher, right of the vertical axis, so
         it never meets the label of a copy however close the copies come */
      a.note(0,pk+1.15,'k=0',{tex:true,anchor:'start',dx:9,color:C.in,fs:14});
      for(const k of [-1,1]) a.note(k*ws,pk+0.32,'k='+k,{tex:true,anchor:'middle',color:C.mid,fs:14});
      return a.svg(); },
      caption:'The sampled spectrum of $x(t)=\\bigl(\\sin(\\pi t)/(\\pi t)\\bigr)^{2}$. Move $T$: slower sampling slides the copies together and shrinks them; none vanishes.'},
    {t:'legend', items:[['in','$k=0$'],['mid','$k\\neq0$']]}
  ], right:[
    {t:'note', kind:'def', head:'Naming the pieces', html:'At every $T$, the term $k=0$, $X(j\\omega)/T$, is the <b>baseband</b>. The terms $k=\\pm1,\\pm2,\\dots$ are the <b>{{sym:replica|copies}}</b>, centred at $k\\omega_s$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'err', head:'The centre is not the first copy', html:'The baseband is $k=0$, not a copy. Calling it the first copy puts every later count off by one.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'What $T$ changes', html:'<div class="cmp"><div><span class="cmp-h">Spacing</span>$\\omega_s=2\\pi/T$. A slower sampler brings the copies closer.</div><div><span class="cmp-h">Height</span>$1/T$. A slower sampler makes every copy shorter.</div></div>'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The sampling period $T$ is halved.<div class="nsep"></div>What happens to the copies?',
        ask:{key:'m7-replicas', choices:['$2\\times$ apart, $2\\times$ taller','$2\\times$ apart, same height','closer, shorter'], answer:0,
          why:'Both the spacing $2\\pi/T$ and the height $1/T$ double.'}}]}
  ]}
]},

/* ----------------------------------------------------------- the three cases */
{ id:'m7-three', module:'M7', nav:'Sampling rate and guard band', title:'Sampling Rate and Guard Band', src:'p. 81',
  objective:'Compare three sampling rates by the width of the gap between neighbouring copies.',
  keywords:'oversampling critical nyquist undersampling guard band gap omega_s 2 omega_M three cases touching overlap', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 7 · Three rates', src:'p. 81'},
  {t:'title', text:'Sampling Rate and Guard Band'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['oversampling, $\\omega_s=5\\pi$','the Nyquist rate, $\\omega_s=4\\pi$','undersampling, $\\omega_s=3\\pi$']},
      svg:v=>{
      /* omega_s falls from 5 pi to 3 pi across the frames; 1/T = omega_s/2pi */
      const f=v?v.frame:0, ws=(5-Math.min(2,Math.max(0,f)))*PI, pk=ws/(2*PI), gap=ws-2*WM;
      const a=AXW(-8*PI,8*PI,2*PI,{h:340,yr:[-0.25,5.0],ylabel:'X_p(j\\omega)',yticksOverride:[0,1,2]});
      if(gap < -1e-6){
        s1Copies(a,ws,pk,3,{width:1.4,dash:'4 4'});
        a.curve(w=>rep(w,WM,pk,ws,4),{color:C.err,width:2.6,n:1800});
      } else {
        s1Copies(a,ws,pk,3);
        if(gap > 0.2*PI) a.span(WM,ws-WM,pk+0.45,'\\omega_s-2\\omega_M='+s1Pi(gap/PI),{color:C.out,fs:14,tex:true});
        else { a.vline(WM,{color:C.coral}); a.vline(-WM,{color:C.coral}); }
      }
      return a.svg(); },
      caption:'The spectrum of $x(t)=\\bigl(\\sin(\\pi t)/(\\pi t)\\bigr)^{2}$, with $\\omega_M=2\\pi$ rad/s. Press Next: lowering $\\omega_s$ slides the copies together, and none of them vanishes.'},
    {t:'legend', at:'tl', items:[['in','$k=0$'],['mid','$k\\neq0$'],['err','$\\text{sum of the copies}$']]}
  ], right:[
    {t:'eq', tex:'\\underbrace{(\\omega_s-\\omega_M)}_{\\text{copy }k=1\\text{ starts}}-\\underbrace{\\omega_M}_{\\text{baseband ends}}=\\omega_s-2\\omega_M',
      label:'Guard band', note:'The copy at $k=1$ fills $|\\omega-\\omega_s|\\le\\omega_M$. {{sym:guard|The gap}} can be positive, zero or negative.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Three cases', html:'$\\omega_s>2\\omega_M$: oversampling; the copies stand apart.<br>$\\omega_s=2\\omega_M$: the Nyquist rate; they touch at $\\pm\\omega_M$.<br>$\\omega_s<2\\omega_M$: undersampling; they overlap and add.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Touching is already too late', html:'At $\\omega_s=2\\omega_M$ a filter edge at $\\omega_M$ drops a component there or takes the edge of the next copy. So $\\omega_s>2\\omega_M$, strictly.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$\\omega_M=3\\pi$ rad/s and $\\omega_s=8\\pi$ rad/s.<div class="nsep"></div>How wide is the guard band?',
        ask:{key:'m7-three', choices:['$2\\pi$ rad/s','$5\\pi$ rad/s','$-2\\pi$ rad/s'], answer:0,
          why:'$\\omega_s-2\\omega_M=8\\pi-6\\pi=2\\pi$ rad/s.'}}]}
  ]}
]},

realGallery({ id:'m7-real-sampler', nav:'Sampling around us',
  title:'Sampling Around Us', eyebrow:'Module 7 · The sampler', src:'pp. 80–81',
  objective:'See everyday samplers: a continuous quantity read at a fixed rate.',
  keywords:'examples oven thermometer once a minute audio 44.1 kHz ECG 500 samples per second film 24 frames per second sampling rate',
  figs:[
    [()=>{ const a=P.Axes(EXO({xr:[-1,21],yr:[0,270],xlabel:'t\\;(\\text{min})',ylabel:'\\theta(t)\\;(^{\\circ}\\text{C})',xstep:5,yticksOverride:[0,100,200]}));
      a.curve(t=>t<0?NaN:20+160*Math.exp(-t/8),{color:C.in,n:800});
      a.stem(D(n=>20+160*Math.exp(-n/8),0,20),{color:C.mid,r:2.6});
      return a.svg(); }, 'A cooling oven, logged once a minute: $\\theta(t)=20+160\\,e^{-t/8}$ °C, $t$ in min.',
      [['in','$\\theta(t)$'],['mid','$\\theta(nT)$']]],
    [()=>{ const a=P.Axes(EXO({xr:[-0.02,0.52],yr:[-26,52],xticksOverride:[0.1,0.2,0.5],xlabel:'t\\;(\\text{ms})',ylabel:'v(t)\\;(\\text{mV})',xstep:0.1,yticksOverride:[-20,0,20]}));
      a.curve(t=>20*Math.sin(4*PI*t),{color:C.in,n:800});
      a.stem(D(n=>20*Math.sin(4*PI*n/44.1),0,22).map(([n,x])=>[n/44.1,x]),{color:C.mid,r:2.4});
      return a.svg(); }, 'A $2$ kHz tone sampled at $f_s=44.1$ kHz: $v(t)=20\\sin(4\\pi t)$ mV, $t$ in ms.',
      [['in','$v(t)$'],['mid','$v(nT)$']]],
    [()=>{ const a=P.Axes(EXO({xr:[-2,82],yr:[-0.15,2.1],xlabel:'t\\;(\\text{ms})',ylabel:'v(t)\\;(\\text{mV})',xstep:20,yticksOverride:[0,0.5,1]}));
      const ecg=t=>1.2*Math.exp(-Math.pow((t-40)/8,2));
      a.curve(ecg,{color:C.in,n:800});
      a.stem(D(n=>ecg(2*n),0,40).map(([n,x])=>[2*n,x]),{color:C.mid,r:2.2});
      return a.svg(); }, 'An ECG beat at $500$ samples/s ($T=2$ ms): $v(t)=1.2\\,e^{-((t-40)/8)^{2}}$ mV, $t$ in ms.',
      [['in','$v(t)$'],['mid','$v(nT)$']]],
    [()=>{ const a=P.Axes(EXO({xr:[-0.03,1.03],yr:[-26,52],xticksOverride:[0.25,0.5,1],xlabel:'t\\;(\\text{s})',ylabel:'\\theta(t)\\;(^{\\circ})',xstep:0.25,yticksOverride:[-20,0,20]}));
      a.curve(t=>20*Math.sin(2*PI*t),{color:C.in,n:800});
      a.stem(D(n=>20*Math.sin(2*PI*n/24),0,24).map(([n,x])=>[n/24,x]),{color:C.mid,r:2.4});
      return a.svg(); }, 'A pendulum filmed at $24$ frames/s: $\\theta(t)=20\\sin(2\\pi t)$ degrees, $t$ in s.',
      [['in','$\\theta(t)$'],['mid','$\\theta(nT)$']]]
  ],
  notes:[
    {t:'note', kind:'def', head:'Each keeps $x(nT)$', html:'The four rates are $1/60$ Hz, $44\\,100$ Hz, $500$ Hz and $24$ Hz. Between two instants the sampler records nothing.'},
    {t:'note', kind:'warn', head:'Samples per change', html:'The tone gets about $22$ samples a cycle and the pendulum $24$ a swing. Section 7.2 finds the lowest rate that still keeps $x(t)$.'}
  ]}),

labScene({ id:'m7-lab-j1', lab:'J1', nav:'The Sampler in Two Domains', title:'Sampling in Time and in Frequency', src:'pp. 80–81',
  objective:'Move the sampling period and watch the impulses sample x(t) in time while the copies of X(jω), each 1/T tall, slide in frequency.',
  keywords:'laboratory sampling period T impulse train x_p(t) copies spectrum omega_s f_s 1/T guard band triangle rectangle' }),

codeScene({ id:'m7-code-sampler', nav:'The sampler', title:'The Sampler in Code', src:'pp. 80–81', eyebrow:'The sampler in code',
  objective:'Sample a signal, convert its rate and build its sampled spectrum in MATLAB and in Python, and predict each result before running it.',
  keywords:'code matlab python sampling x(nT) omega_s f_s sampled spectrum copies 1/T guard band run' }),

/* </m7-s1> */

/* <m7-s2> ============================================ 7.2 aliasing and the sampling theorem */

/* --------------------------------------------------------------- aliasing */
{ id:'m7-aliasing', module:'M7', nav:'Aliasing', title:'Aliasing', src:'pp. 81, 86',
  objective:'Define aliasing as the overlap of copies and see the overlap grow as the rate falls.',
  keywords:'aliasing overlap copies replicas slider sampling rate omega_s nyquist rate 2 omega_M definition replication at every rate',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 7 · Aliasing and the sampling theorem', src:'pp. 81, 86'},
  {t:'title', text:'Aliasing'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'ws', label:'$\\omega_s$', min:2, max:5, step:0.1, v:2.6, show:v=>'$'+s2Pi(v)+'\\ \\text{rad/s}$'}]},
      svg:v=>{
      const ws=(v?v.ws:2.6)*PI, pk=ws/(2*PI);
      const a=AXW(-6*PI,6*PI,2*PI,{xlabel:'\\omega\\;[\\text{rad/s}]',yr:[-0.3,4.2],ylabel:'X_p(j\\omega)',
        yticksOverride:[1,2],ytickfmt:v=>String(v)});
      s2Copies(a,ws,pk,Math.ceil(6*PI/ws)+1);
      return a.svg(); },
      caption:'$x(t)=\\bigl(\\tfrac{\\sin\\pi t}{\\pi t}\\bigr)^{2}$, so $\\omega_M=2\\pi$ rad/s; each copy stands $1/T=\\omega_s/2\\pi$ tall. Lower $\\omega_s$ and watch the red overlap grow.'},
    {t:'legend', items:[['in','baseband'],['mid','copies'],['err','overlap sum']]}
  ], right:[
    {t:'note', kind:'def', head:'Definition', html:'<b>{{sym:alias|Aliasing}}</b> is the overlap of neighbouring copies in $X_p(j\\omega)$. The baseband ends at $\\omega_M$ and the copy $k=1$ starts at $\\omega_s-\\omega_M$, so they overlap exactly when $\\omega_s<2\\omega_M$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'err', head:'Copies are not aliasing', html:'$X_p(j\\omega)=\\frac{1}{T}\\sum_kX\\bigl(j(\\omega-k\\omega_s)\\bigr)$ holds at every rate, so the spectrum is replicated below the Nyquist rate too. What changes there is that the copies overlap.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'The same signal, $\\omega_M=2\\pi$ rad/s, sampled at $\\omega_s=3.5\\pi$ rad/s.<div class="nsep"></div>How wide is each overlap region?',
        ask:{key:'m7-aliasing', choices:['$0.5\\pi$ rad/s','$1.5\\pi$ rad/s','$3.5\\pi$ rad/s'], answer:0,
          why:'The overlap runs from $\\omega_s-\\omega_M=1.5\\pi$ to $\\omega_M=2\\pi$, a width of $2\\omega_M-\\omega_s=0.5\\pi$.'}}]}
  ]}
]},

{ id:'m7-aliasing-b', module:'M7', nav:'Aliasing cannot be undone', title:'Why Aliasing Cannot Be Undone', src:'pp. 81, 86',
  objective:'Show that the sampler stores one sum in the overlap, so no filter can separate the two contributions.',
  keywords:'aliasing irreversible sum overlap wanted intruder filter cannot separate prevention anti-aliasing filter raise rate',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 7 · Aliasing and the sampling theorem', src:'pp. 81, 86'},
  {t:'title', text:'Why Aliasing Cannot Be Undone'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['two contributions','what the sampler stores: their sum']},
      svg:v=>{
      const f=cl(v?v.frame:0), ws=2.6*PI, pk=1.3, ov=w=>s2InOv(w,ws,WM);
      const a=AXW(-2.4*PI,2.4*PI,PI,{xlabel:'\\omega\\;[\\text{rad/s}]',yr:[-0.2,1.75],ylabel:'X_p(j\\omega)',
        yticksOverride:[0.65,1.3],ytickfmt:v=>String(v)});
      a.area(w=>rep(w,WM,pk,ws,2),ws-WM,WM,{color:s2Wash(C.err,.22),n:120});
      a.area(w=>rep(w,WM,pk,ws,2),-WM,WM-ws,{color:s2Wash(C.err,.22),n:120});
      fade(a,1-0.7*f,()=>{ for(let k=-1;k<=1;k++)
        a.curve(w=>tri(w-k*ws,WM,pk),{color:k?C.mid:C.in,n:1600,width:1.6,dash:f>0.02?'4 4':null}); });
      fade(a,f,()=>{
        for(let k=-1;k<=1;k++) a.curve(w=>ov(w)?NaN:tri(w-k*ws,WM,pk),{color:k?C.mid:C.in,n:1600});
        a.curve(w=>ov(w)?rep(w,WM,pk,ws,2):NaN,{color:C.err,n:1600,width:2.6}); });
      return a.svg(); },
      caption:'Near the baseband at $\\omega_s=2.6\\pi$ rad/s. Inside the red intervals the baseband and a copy both contribute; the sampler keeps only their sum.'},
    {t:'legend', items:[['in','baseband'],['mid','copies $k=\\pm1$'],['err','stored sum']]}
  ], right:[
    {t:'eq', tex:'X_p(j\\omega)=\\frac{1}{T}\\Bigl[\\,\\underbrace{X(j\\omega)}_{\\text{wanted}}+\\underbrace{X\\bigl(j(\\omega-\\omega_s)\\bigr)}_{\\text{intruder}}\\,\\Bigr]', label:'One number, two contributions',
      note:'A filter keeps or removes whole intervals of $\\omega$. It cannot split one stored value into the two numbers that made it.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'The only repair is prevention', html:'Raise $\\omega_s$ above $2\\omega_M$, or remove the high frequencies of $x(t)$ <b>before</b> the sampler. The second is the anti-aliasing filter, later in this module.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'The same signal, $\\omega_M=2\\pi$ rad/s, sampled at $\\omega_s=3.4\\pi$ rad/s.<div class="nsep"></div>Where does $X_p(j\\omega)$ still equal $\\frac{1}{T}X(j\\omega)$ alone?',
        ask:{key:'m7-aliasing-b', choices:['$|\\omega|<1.4\\pi$','$|\\omega|<2\\pi$','$|\\omega|<0.6\\pi$'], answer:0,
          why:'The nearest copy starts at $\\omega_s-\\omega_M=3.4\\pi-2\\pi=1.4\\pi$.'}}]}
  ]}
]},

/* ---------------------------------------------------------------- theorem */
{ id:'m7-theorem', module:'M7', nav:'The sampling theorem', title:'The Sampling Theorem', src:'p. 82',
  objective:'State the sampling theorem with its hypothesis and move the cutoff of the reconstruction filter through its admissible interval.',
  keywords:'sampling theorem nyquist rate band limited strict inequality cutoff interval omega_c gain T recoverable slider',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 7 · Aliasing and the sampling theorem', src:'p. 82'},
  {t:'title', text:'The Sampling Theorem'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'wc', label:'$\\omega_c$', min:1, max:5, step:0.1, v:3, show:v=>{
        const e = Math.abs(v-2)<1e-9 || Math.abs(v-4)<1e-9;
        const t = e ? 'on the edge' : v<2 ? 'cuts the baseband' : (v>4 ? 'lets a copy through' : 'recovers $x(t)$');
        return '$'+s2Pi(v)+'$ · '+t; }}]},
      svg:v=>{
      const ws=6*PI, pk=3, wc=(v?v.wc:3)*PI;
      const a=AXW(-9*PI,9*PI,2*PI,{xlabel:'\\omega\\;[\\text{rad/s}]',yr:[-0.3,4.3],ylabel:'X_p(j\\omega)',
        yticksOverride:[3],ytickfmt:v=>String(v)});
      a.area(w=>rep(w,WM,pk,ws,2),-wc,wc,{color:s2Wash(C.out,.25),n:900});
      for(let k=-1;k<=1;k++) a.curve(w=>tri(w-k*ws,WM,pk),{color:k?C.mid:C.in,n:1600});
      a.rect(-wc,0,wc,3.45,{stroke:C.h,dash:'7 5',width:2});
      a.span(WM,ws-WM,3.85,'\\omega_c',{color:C.coral,fs:14,tex:true});
      return a.svg(); },
      caption:'$\\omega_M=2\\pi$ and $\\omega_s=6\\pi$ rad/s. The amber box is the low-pass filter of gain $T$, the green area what it passes, and the coral bracket the admissible $\\omega_c$.'},
    {t:'legend', items:[['in','baseband'],['mid','copies']]}
  ], right:[
    {t:'eq', key:true, result:true, tex:'\\begin{aligned}&X(j\\omega)=0\\ \\text{for}\\ |\\omega|>\\omega_M\\ \\text{and}\\ \\omega_s>2\\omega_M\\\\&\\Longrightarrow\\ x(t)\\ \\text{is determined by}\\ x(nT),\\ n=0,\\pm1,\\pm2,\\ldots\\end{aligned}', label:'Key result · Sampling theorem',
      note:'Recovery: pass $x_p(t)$ through an ideal low-pass filter of gain $T$ and cutoff $\\omega_M<\\omega_c<\\omega_s-\\omega_M$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Nyquist rate', html:'$2\\omega_M$ is the <b>Nyquist rate</b> of the signal, and $\\omega_s$ must be strictly above it. Without a band limit there is no $\\omega_M$, and the theorem says nothing.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'$\\omega_M=2\\pi$ rad/s and $\\omega_s=7\\pi$ rad/s.<div class="nsep"></div>Which cutoff recovers $x(t)$?',
        ask:{key:'m7-theorem', choices:['$\\omega_c=4\\pi$','$\\omega_c=1.5\\pi$','$\\omega_c=5.5\\pi$'], answer:0,
          why:'The interval is $2\\pi<\\omega_c<7\\pi-2\\pi=5\\pi$, and only $4\\pi$ lies inside it.'}}]}
  ]}
]},

{ id:'m7-theorem-b', module:'M7', nav:'Why the inequality is strict', title:'Why the Inequality Is Strict', src:'p. 82',
  objective:'Show that the cutoff interval closes as the rate falls to the Nyquist rate, so the theorem needs a strict inequality.',
  keywords:'strict inequality nyquist rate empty interval cutoff omega_M omega_s - omega_M guard band design rule transition band',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 7 · Aliasing and the sampling theorem', src:'p. 82'},
  {t:'title', text:'Why the Inequality Is Strict'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$\\omega_s=6\\pi$','$\\omega_s=5\\pi$','$\\omega_s=4\\pi=2\\omega_M$']},
      svg:v=>{
      const f=v?v.frame:0, ws=(6-f)*PI, pk=ws/(2*PI), g=ws-2*WM;
      const a=AXW(-9*PI,9*PI,2*PI,{xlabel:'\\omega\\;[\\text{rad/s}]',yr:[-0.3,4.3],ylabel:'X_p(j\\omega)',
        yticksOverride:[2,3],ytickfmt:v=>String(v)});
      for(let k=-2;k<=2;k++) a.curve(w=>tri(w-k*ws,WM,pk),{color:k?C.mid:C.in,n:1600});
      if(g > 0.05*PI) a.span(WM,ws-WM,3.75,'\\omega_c',{color:C.coral,fs:13,tex:true});
      else { a.vline(WM,{color:C.coral,width:2,dash:'4 3',opacity:1});
        a.note(WM+0.35*PI,3.7,'\\omega_M=\\omega_s-\\omega_M',{anchor:'start',color:C.coral,fs:13,tex:true}); }
      return a.svg(); },
      caption:'The coral bracket is the interval where $\\omega_c$ may stand. As $\\omega_s$ falls to $2\\omega_M=4\\pi$ rad/s it shrinks to nothing.'},
    {t:'legend', items:[['in','baseband'],['mid','copies']]}
  ], right:[
    {t:'eq', tex:'\\omega_M<\\omega_c<\\underbrace{2\\omega_M-\\omega_M}_{\\omega_s-\\omega_M}=\\omega_M', label:'Set $\\omega_s=2\\omega_M$',
      note:'No $\\omega_c$ satisfies $\\omega_M<\\omega_c<\\omega_M$, so there is no filter at the Nyquist rate itself.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'err', head:'Not $\\omega_s\\ge2\\omega_M$', html:'With $\\ge$ the theorem would promise a filter that its own cutoff condition rules out. A real filter also needs room to go from pass to stop, so choose a guard band above $2\\omega_M$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'$\\omega_M=2\\pi$ rad/s, and the filter needs a gap of at least $\\pi$ rad/s.<div class="nsep"></div>What is the smallest usable $\\omega_s$?',
        ask:{key:'m7-theorem-b', choices:['$5\\pi$ rad/s','$4\\pi$ rad/s','$4.5\\pi$ rad/s'], answer:0,
          why:'The gap is $\\omega_s-2\\omega_M$, and $\\omega_s-4\\pi\\ge\\pi$ gives $\\omega_s\\ge5\\pi$.'}}]}
  ]}
]},

/* -------------------------------------------------------- the boundary case */
{ id:'m7-boundary', module:'M7', nav:'The boundary is not safe', title:'The Nyquist-Rate Boundary', src:'p. 82',
  objective:'Show in the spectrum that a sine at the band edge cancels when the signal is sampled at exactly the Nyquist rate.',
  keywords:'nyquist boundary counterexample sine cancellation band edge 4000 pi copy k=1 lines cancel critical rate',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 7 · Worked example', src:'p. 82'},
  {t:'title', text:'The Nyquist-Rate Boundary'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['the sine term, $k=0$','copies $k=\\pm1$ move in by $\\omega_s$','the sum at $\\pm4000\\pi$']},
      svg:v=>{
      const f=v?v.frame:0, sh=cl(f)*KP(8000), gone=cl(f-1), h=1.15;
      const a=AX({xr:[-KP(10000),KP(10000)],yr:[-1.75,1.75],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'j\\,X_p(j\\omega)',
        ytarget:3,yticksOverride:[],xticksOverride:[-KP(8000),KP(8000)],xtickfmt:kpiTick});
      a.note(KP(4000),-0.42,'4000\\pi',{anchor:'start',dx:10,color:C.muted,fs:13,tex:true});
      a.note(-KP(4000),0.3,'-4000\\pi',{anchor:'end',dx:-10,color:C.muted,fs:13,tex:true});
      const imp=(w,y,col)=>{ if(Math.abs(w)<=KP(10000)) a.impulse(w,y,{color:col,label:false}); };
      /* the baseband pair and the two copies that carry a line onto it */
      fade(a,1-0.75*gone,()=>{ imp(KP(4000),h,C.in); imp(-KP(4000),-h,C.in);
        if(f>0.02){ imp(-KP(4000)+sh,-h,C.mid); imp(KP(4000)+sh,h,C.mid);
          imp(KP(4000)-sh,h,C.mid); imp(-KP(4000)-sh,-h,C.mid); } });
      if(gone>0.02){
        fade(a,gone,()=>{
          a.point(KP(4000),0,{color:C.coral,r:6}); a.point(-KP(4000),0,{color:C.coral,r:6});
          a.note(KP(4000)+KP(350),0.62,'0',{anchor:'start',color:C.coral,fs:15,tex:true});
          a.note(-KP(4000)+KP(350),-0.9,'0',{anchor:'start',color:C.coral,fs:15,tex:true}); }); }
      return a.svg(); },
      caption:'Only the sine term is drawn, times $j$. The copy $k=1$ brings a line of the opposite sign onto $+4000\\pi$, and $k=-1$ does the same at $-4000\\pi$.'},
    {t:'legend', items:[['in','baseband'],['mid','copies $k=\\pm1$']]}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x(t)=1+\\cos(2000\\pi t)+\\sin(4000\\pi t)$, so $\\omega_M=4000\\pi$ rad/s. It is sampled at exactly $\\omega_s=2\\omega_M=8000\\pi$ rad/s, $T=0.25$ ms.<div class="nsep"></div>What is left of the sine term after sampling?',
      ask:{key:'m7-boundary', choices:['Nothing','Half of it','All of it'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\underbrace{\\tfrac{1}{T}\\cdot\\tfrac{\\pi}{j}=\\tfrac{4000\\pi}{j}}_{k=0}\\qquad\\underbrace{\\tfrac{1}{T}\\cdot\\bigl(-\\tfrac{\\pi}{j}\\bigr)=-\\tfrac{4000\\pi}{j}}_{k=1,\\ \\text{from}\\ -4000\\pi}', label:'Step 1 · Two lines at $\\omega=4000\\pi$',
        note:'The sine gives $\\frac{\\pi}{j}$ at $+4000\\pi$ and $-\\frac{\\pi}{j}$ at $-4000\\pi$. The copy $k=1$ moves the second line by $8000\\pi$.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'\\frac{4000\\pi}{j}-\\frac{4000\\pi}{j}=0', label:'Step 2 · Their sum',
        note:'The same happens at $\\omega=-4000\\pi$. The sine term is absent from the sampled signal.'}]}
  ]}
]},

{ id:'m7-boundary-b', module:'M7', nav:'Samples at the zeros', title:'Samples Taken at the Zeros', src:'p. 82',
  objective:'See and hear every sample of the band-edge sine fall on a zero crossing, and repair it with a guard band.',
  keywords:'boundary sine zero crossings sin(pi n) = 0 guard band 1000 pi 9000 pi 222.2 us slider sound held samples cosine survives',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 7 · Worked example', src:'p. 82'},
  {t:'title', text:'Samples Taken at the Zeros'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'ws', label:'$\\omega_s$', min:8, max:10, step:0.25, v:8, show:v=>'$'+Math.round(v*1000)+'\\pi\\ \\text{rad/s}$'}]},
      listen:{items:[
        {label:'Play the tone', sound:()=>({f:t=>Math.sin(4000*PI*t), dur:1})},
        {label:'Play the samples', sound:v=>({f:s2Held(500*v.ws), dur:1})}]},
      svg:v=>{
      const ws=(v?v.ws:8)*KP(1000), T=2*PI/ws;
      const a=AX({xr:[0,0.0016],yr:[-1.45,1.6],xlabel:'t\\;[\\text{ms}]',ylabel:'x(t)',
        xtarget:5,ytarget:3,yticksOverride:[-1,1],ytickfmt:v=>String(v),xticksOverride:[0.000375,0.000875,0.001375],xtickfmt:s2ms(3)});
      a.curve(t=>Math.sin(4000*PI*t),{color:C.in,n:1600,dash:'9 6'});
      a.stem(samp(t=>{ const y=Math.sin(4000*PI*t); return Math.abs(y)<1e-9?0:y; },T,0,0.0016+1e-12),{color:C.mid,r:4.5,showZero:true});
      return a.svg(); },
      caption:'The $2$ kHz band-edge tone and its samples. At $\\omega_s=8000\\pi$ every sample sits on a zero crossing, and the samples play silence.'},
    {t:'legend', items:[['in','$\\sin(4000\\pi t)$',true],['mid','samples']]}
  ], right:[
    {t:'eq', tex:'\\sin(4000\\pi\\,nT)=\\sin\\Bigl(4000\\pi\\cdot\\frac{n}{4000}\\Bigr)=\\sin(\\pi n)=0', label:'Every sample is zero',
      note:'With $T=1/4000$ s this holds for every integer $n$. A sampler cannot report a term it never sees.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'The repair: a guard band', html:'Add $\\omega_g=1000\\pi$ rad/s: $\\omega_s=9000\\pi$ rad/s, $T=1/4500$ s $\\approx222.2\\ \\mu\\text{s}$, and $4000\\pi<\\omega_c<5000\\pi$ is not empty.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'The sine is replaced by $\\cos(4000\\pi t)$, sampled at the same $\\omega_s=8000\\pi$ rad/s.<div class="nsep"></div>What are its samples?',
        ask:{key:'m7-boundary-b', choices:['$+1$ and $-1$ in turn','All zero','All $+1$'], answer:0,
          why:'$\\cos(4000\\pi n/4000)=\\cos(\\pi n)=(-1)^{n}$: the cosine survives where the sine vanishes, so the boundary rate cannot be trusted.'}}]}
  ]}
]},

/* --------------------------------------------------- the three-rate example */
{ id:'m7-ex-rates', module:'M7', nav:'Worked example · three rates', title:'Sampling at Three Rates', src:'p. 82',
  objective:'Compute the rate, the guard band and the copy height for three sampling periods of the same signal.',
  keywords:'worked example T1 T2 T3 0.40 0.50 2/3 guard band replica height oversampling undersampling boundary frames',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 7 · Worked example', src:'p. 82'},
  {t:'title', text:'Sampling at Three Rates'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$T_1=0.40$ s','$T_2=0.50$ s','$T_3=2/3$ s']},
      svg:v=>{
      const f=Math.max(0,Math.min(2,v?v.frame:0)), T=f<=1 ? 0.4+0.1*f : 0.5+(f-1)/6;
      const ws=2*PI/T, pk=1/T, g=ws-2*WM;
      const a=AXW(-8*PI,8*PI,2*PI,{xlabel:'\\omega\\;[\\text{rad/s}]',yr:[-0.3,3.3],ylabel:'X_p(j\\omega)',
        yticksOverride:[1,2],ytickfmt:v=>String(v)});
      s2Copies(a,ws,pk,4);
      if(g > 0.05*PI) a.span(WM,ws-WM,2.95,'\\text{guard}',{color:C.coral,fs:13,tex:true});
      return a.svg(); },
      caption:'One signal at three periods. As $T$ grows the copies move closer and shrink, since each stands $1/T$ tall.'},
    {t:'legend', items:[['in','baseband'],['mid','copies'],['err','overlap']]}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x(t)=\\bigl(\\tfrac{\\sin\\pi t}{\\pi t}\\bigr)^{2}$: a triangle spectrum of peak 1 with $\\omega_M=2\\pi$ rad/s. Periods $T_1=0.40$ s, $T_2=0.50$ s, $T_3=2/3$ s.<div class="nsep"></div>Which period lets $x(t)$ be recovered?',
      ask:{key:'m7-ex-rates', choices:['$T_1$ only','$T_1$ and $T_2$','All three'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'<ol class="steps"><li>Rate: $\\omega_s=2\\pi/T$.</li><li>Guard band: $\\omega_s-2\\omega_M$, which must be positive.</li><li>Copy height: $1/T$ times the peak of $X$.</li></ol>'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'\\begin{aligned}T_1&:\\ \\omega_s=5\\pi,\\ \\text{guard}=+\\pi,\\ 1/T_1=2.5\\\\T_2&:\\ \\omega_s=4\\pi,\\ \\text{guard}=0,\\ 1/T_2=2\\\\T_3&:\\ \\omega_s=3\\pi,\\ \\text{guard}=-\\pi,\\ 1/T_3=1.5\\end{aligned}', label:'Solution',
        note:'Only $T_1$ is safe. $T_2$ sits on the boundary, and at $T_3$ the copies overlap by $\\pi$ rad/s.'}]}
  ]}
]},

{ id:'m7-ex-rates-b', module:'M7', nav:'Three rates · the check', title:'Rate Against Period', src:'p. 82',
  objective:'Check the three rates with omega_s T = 2 pi and read every period against the Nyquist rate on one curve.',
  keywords:'check omega_s T = 2 pi hyperbola rate against period nyquist line 4 pi height and spacing move together',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 7 · Worked example', src:'p. 82'},
  {t:'title', text:'Rate Against Period'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=AX({xr:[0,0.9],yr:[0,10.5*PI],xlabel:'T\\;[\\text{s}]',ylabel:'\\omega_s\\;[\\text{rad/s}]',yticksLeft:false,
        xticksOverride:[0.2,0.4,0.6,0.8],xtickfmt:v=>v.toFixed(1),yticksOverride:[2*PI,4*PI,6*PI,8*PI,10*PI],ytickfmt:piTick});
      a.rect(0,4*PI,0.9,10.5*PI,{fill:s2Wash(C.out,.11)});
      a.hline(4*PI,{color:C.coral,width:1.6,dash:'6 4',opacity:1});
      a.note(0.88,4.35*PI,'2\\omega_M=4\\pi',{anchor:'end',color:C.coral,fs:14,tex:true});
      a.curve(T=>T<0.19?NaN:2*PI/T,{color:C.in,n:900});
      [[0.4,'T_1',C.out],[0.5,'T_2',C.coral],[2/3,'T_3',C.err]].forEach(([T,l,c])=>{
        a.point(T,2*PI/T,{color:c,r:6,ring:C.plate});
        a.note(T+0.025,2*PI/T+(T>0.6?-1.1:0.45)*PI,l,{anchor:'start',color:c,fs:15,tex:true}); });
      return a.svg(); },
      caption:'$\\omega_s=2\\pi/T$ against $T$. A period is safe while its point lies above the coral line, in the green band.'}
  ], right:[
    {t:'note', kind:'def', head:'Check', html:'$\\omega_sT=2\\pi$ in each row: $5\\pi\\times0.4=2\\pi$, $4\\pi\\times0.5=2\\pi$, $3\\pi\\times\\tfrac23=2\\pi$. The curve is this product held at $2\\pi$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'Height and spacing move together', html:'From $T_1$ to $T_3$ the spacing falls from $5\\pi$ to $3\\pi$ and the height from $2.5$ to $1.5$. A sketch with the same height at every rate hides half of what sampling does.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'The same signal is sampled with $T=0.25$ s.<div class="nsep"></div>How wide is the guard band?',
        ask:{key:'m7-ex-rates-b', choices:['$4\\pi$ rad/s','$2\\pi$ rad/s','$0$'], answer:0,
          why:'$\\omega_s=2\\pi/0.25=8\\pi$ rad/s, and $8\\pi-4\\pi=4\\pi$.'}}]}
  ]}
]},

/* ------------------------------------------------------ example, part (a) */
{ id:'m7-ex-73a', module:'M7', nav:'Worked example · a line spectrum', title:'Spectrum of a Line Signal', src:'p. 82',
  objective:'Build the spectrum of a constant plus a cosine plus a sine, term by term, with exact impulse locations and weights.',
  keywords:'worked example line spectrum impulse weights constant cosine sine 2000 pi 4000 pi bandwidth frames',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 7 · Worked example', src:'p. 82'},
  {t:'title', text:'Spectrum of a Line Signal'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$1$','$+\\cos(2000\\pi t)$','$+\\sin(4000\\pi t)$']},
      svg:v=>{
      const f=v?v.frame:0, c1=cl(f), c2=cl(f-1);
      const a=AX({xr:[-KP(5200),KP(5200)],yr:[-1.6,2.7],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X(j\\omega)',
        ytarget:3,yticksOverride:[],xticksOverride:[-KP(2000),0,KP(2000),KP(4000)],xtickfmt:kpiTick});
      a.note(-KP(4000),0.3,'-4000\\pi',{anchor:'middle',color:C.muted,fs:13,tex:true});
      a.impulse(0,2,{color:C.in,labelText:'2π'});
      if(c1>0.02){ a.impulse(KP(2000),c1,{color:C.in,labelText:'π',label:c1>0.98?undefined:false});
        a.impulse(-KP(2000),c1,{color:C.in,labelText:'π',label:c1>0.98?undefined:false}); }
      if(c2>0.02){ a.impulse(KP(4000),c2,{color:C.mid,labelText:'π/j',label:c2>0.98?undefined:false});
        a.impulse(-KP(4000),-c2,{color:C.mid,labelText:'-π/j',label:c2>0.98?undefined:false}); }
      return a.svg(); },
      caption:'The spectrum, one term at a time. The violet pair is imaginary, drawn up for $+\\pi/j$ and down for $-\\pi/j$.'},
    {t:'legend', items:[['in','real weights'],['mid','imaginary weights']]}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x(t)=1+\\cos(2000\\pi t)+\\sin(4000\\pi t)$.<div class="nsep"></div>What is $\\omega_M$, the highest angular frequency in $x(t)$?',
      ask:{key:'m7-ex-73a', choices:['$2000\\pi$ rad/s','$4000\\pi$ rad/s','$8000\\pi$ rad/s'], answer:1}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'Transform term by term with three standard pairs:<ol class="steps"><li>$1\\leftrightarrow2\\pi\\delta(\\omega)$</li><li>$\\cos(\\omega_0t)\\leftrightarrow\\pi[\\delta(\\omega-\\omega_0)+\\delta(\\omega+\\omega_0)]$</li><li>$\\sin(\\omega_0t)\\leftrightarrow\\frac{\\pi}{j}[\\delta(\\omega-\\omega_0)-\\delta(\\omega+\\omega_0)]$</li></ol>'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'\\begin{aligned}X(j\\omega)&=2\\pi\\delta(\\omega)+\\pi\\bigl[\\delta(\\omega-2000\\pi)+\\delta(\\omega+2000\\pi)\\bigr]\\\\&\\quad+\\frac{\\pi}{j}\\bigl[\\delta(\\omega-4000\\pi)-\\delta(\\omega+4000\\pi)\\bigr]\\end{aligned}', label:'Solution',
        note:'Five impulses. The farthest from the origin sit at $\\pm4000\\pi$, so $\\omega_M=4000\\pi$ rad/s.'}]}
  ]}
]},

{ id:'m7-ex-73a-b', module:'M7', nav:'Line spectrum · the Nyquist rate', title:'Bandwidth and Nyquist Rate', src:'p. 82',
  objective:'Read the bandwidth and the Nyquist rate off the line spectrum, in rad/s and in hertz, and check the transform by inverting it.',
  keywords:'bandwidth nyquist rate 8000 pi rad/s 4000 Hz f_M 2000 Hz check inverse transform impulse function of omega',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 7 · Worked example', src:'p. 82'},
  {t:'title', text:'Bandwidth and Nyquist Rate'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=AX({xr:[0,0.002],yr:[-1.6,3.4],xlabel:'t\\;[\\text{ms}]',ylabel:'x(t)',
        xtarget:5,ytarget:3,yticksLeft:false,xticksOverride:[0.00025,0.00075,0.00125,0.00175],xtickfmt:s2ms(2),yticksOverride:[-1,0,1,2,3],ytickfmt:v=>String(v)});
      a.curve(t=>1+Math.cos(2000*PI*t)+Math.sin(4000*PI*t),{color:C.in,n:2400});
      a.span(0,0.001,3.05,'1\\ \\text{ms}',{color:C.coral,fs:13,tex:true});
      return a.svg(); },
      caption:'The signal repeats every 1 ms. Its fastest term, $\\sin(4000\\pi t)$, runs at $2000$ Hz.'}
  ], right:[
    {t:'eq', key:true, tex:'\\begin{aligned}\\omega_M&=4000\\pi\\ \\text{rad/s},&f_M&=2000\\ \\text{Hz}\\\\2\\omega_M&=8000\\pi\\ \\text{rad/s},&2f_M&=4000\\ \\text{Hz}\\end{aligned}', label:'Bandwidth and Nyquist rate',
      note:'Divide by $2\\pi$ to go from rad/s to hertz. Any working rate must be strictly above $8000\\pi$ rad/s.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Check', html:'Invert the impulses with $\\frac{1}{2\\pi}\\int X(j\\omega)e^{j\\omega t}\\d\\omega$: $\\frac{2\\pi}{2\\pi}=1$, $\\frac{\\pi}{2\\pi}\\,2\\cos(2000\\pi t)$ and $\\frac{\\pi}{2\\pi j}\\,2j\\sin(4000\\pi t)$ give back $x(t)$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'The sine term is changed to $\\sin(6000\\pi t)$.<div class="nsep"></div>What is the Nyquist rate now?',
        ask:{key:'m7-ex-73a-b', choices:['$12000\\pi$ rad/s','$8000\\pi$ rad/s','$6000\\pi$ rad/s'], answer:0,
          why:'The farthest line moves to $6000\\pi$, so $2\\omega_M=12000\\pi$ rad/s.'}}]}
  ]}
]},

/* ------------------------------------------------------ example, part (b) */
{ id:'m7-ex-73b', module:'M7', nav:'Worked example · the period', title:'Sampling Period at the Nyquist Rate', src:'p. 83',
  objective:'Compute the sampling period at the Nyquist rate of a band-limited sinc signal and see its copies touch.',
  keywords:'sampling period nyquist rate sinc rectangle 4000 pi 0.25 ms copies height 1/T = 4000 touch frames',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 7 · Worked example', src:'p. 83'},
  {t:'title', text:'Sampling Period at the Nyquist Rate'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$X(j\\omega)$','$X_p(j\\omega)$ at $\\omega_s=8000\\pi$']},
      svg:v=>{
      const f=cl(v?v.frame:0), W=KP(4000), ws=KP(8000);
      const box=(c,col,dash)=>a.poly([[c-W,0],[c-W,1],[c+W,1],[c+W,0]],{color:col,dash});
      const a=AX({xr:[-KP(13000),KP(13000)],yr:[-0.15,1.45],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:f<0.5?'X(j\\omega)':'X_p(j\\omega)',
        ytarget:3,yticksOverride:[1],ytickfmt:()=>f<0.5?'1':'4000',
        xticksOverride:[-KP(8000),-KP(4000),0,KP(4000),KP(8000)],xtickfmt:kpiTick});
      box(0,C.in);
      fade(a,f,()=>{ box(ws,C.mid,'8 5'); box(-ws,C.mid,'8 5'); });
      return a.svg(); },
      caption:'The rectangle of height 1 on $|\\omega|\\le4000\\pi$, then its copies at the Nyquist rate. Each stands $1/T=4000$ tall, and neighbours touch at $\\pm4000\\pi$.'},
    {t:'legend', items:[['in','baseband'],['mid','copies',true]]}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x(t)=\\dfrac{\\sin(4000\\pi t)}{\\pi t}$, whose transform is 1 on $|\\omega|\\le4000\\pi$ and 0 outside.<div class="nsep"></div>What is $T$ at the Nyquist rate?',
      ask:{key:'m7-ex-73b', choices:['$0.25$ ms','$0.25$ s','$39.8\\ \\mu\\text{s}$'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'<ol class="steps"><li>The rectangle ends at $\\omega_M=4000\\pi$, so $\\omega_s=2\\omega_M=8000\\pi$ rad/s.</li><li>$T=2\\pi/\\omega_s$, then check $\\omega_sT=2\\pi$.</li></ol>'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'\\begin{aligned}T&=\\frac{2\\pi}{\\omega_s}=\\frac{2\\pi}{8000\\pi}=\\frac{1}{4000}\\ \\text{s}\\\\&=2.5\\times10^{-4}\\ \\text{s}=0.25\\ \\text{ms}\\end{aligned}', label:'Solution',
        note:'In hertz the rate is $f_s=1/T=4000$ Hz, and each copy is scaled by $1/T=4000$.'}]}
  ]}
]},

{ id:'m7-ex-73b-b', module:'M7', nav:'The period · three checks', title:'Checking the Sampling Period', src:'p. 83',
  objective:'Defend a sampling period with three independent checks and catch the factor of 1000.',
  keywords:'check omega_s T = 2 pi factor 1000 milliseconds seconds 1/T replica scale doubling the rate halves the period',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 7 · Worked example', src:'p. 83'},
  {t:'title', text:'Checking the Sampling Period'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$T=0.25$ ms','$T=0.25$ s']},
      svg:v=>{
      const f=cl(v?v.frame:0);
      const a=AX({xr:[0,0.002],yr:[-1.3,2.9],xlabel:'t\\;[\\text{ms}]',ylabel:'p(t)',
        xtarget:5,ytarget:3,yticksOverride:[],xticksOverride:[0.0005,0.001,0.0015,0.002],xtickfmt:s2ms(1)});
      a.curve(t=>Math.cos(4000*PI*t),{color:C.in,n:1600,dash:'9 6'});
      a.impulse(0,1.2,{color:C.mid,label:false});
      fade(a,1-f,()=>{ for(let n=1;n<=8;n++) a.impulse(n*0.00025,1.2,{color:C.mid,label:false}); });
      if(f>0.02) fade(a,f,()=>a.note(0.00196,1.3,'\\text{next sample at}\\ t=250\\ \\text{ms}\\;\\rightarrow',{anchor:'end',color:C.coral,fs:14,tex:true}));
      return a.svg(); },
      caption:'Sampling instants against a $2000$ Hz tone, $\\cos(4000\\pi t)$. With $T=0.25$ s the next instant comes $500$ cycles of the tone later.'},
    {t:'legend', items:[['mid','$p(t)$'],['in','$\\cos(4000\\pi t)$',true]]}
  ], right:[
    {t:'note', kind:'err', head:'A quarter of a millisecond', html:'Cancelling the $\\pi$ but not the thousand gives $0.25$ s. That is four samples a second for a signal that carries $2000$ Hz, and every later number is wrong by 1000.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Check', html:'<ol class="steps"><li>$\\omega_sT=8000\\pi\\times2.5\\times10^{-4}=2\\pi$; with $0.25$ s it is $2000\\pi$.</li><li>Copy scale $1/T=4000$; with $0.25$ s it would be $4$.</li><li>At $16000\\pi$ rad/s, $T=125\\ \\mu\\text{s}$, exactly half of $0.25$ ms.</li></ol>'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'A signal is sampled at $\\omega_s=12000\\pi$ rad/s.<div class="nsep"></div>What is $T$?',
        ask:{key:'m7-ex-73b-b', choices:['$166.7\\ \\mu\\text{s}$','$0.1667$ s','$26.5\\ \\mu\\text{s}$'], answer:0,
          why:'$T=2\\pi/12000\\pi=1/6000$ s $\\approx166.7\\ \\mu\\text{s}$, and $\\omega_sT=2\\pi$.'}}]}
  ]}
]},

/* ------------------------------------------------------ example, part (c) */
{ id:'m7-ex-73c', module:'M7', nav:'Worked example · a triangular spectrum', title:'Area and Peak of a Triangular Spectrum', src:'p. 83',
  objective:'Build the triangular spectrum of a squared sinc as a convolution of two rectangles, and separate its area from its peak.',
  keywords:'triangular spectrum squaring convolution rectangles slide overlap area 8000 pi peak 4000 divide by 2 pi slider',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 7 · Worked example', src:'p. 83'},
  {t:'title', text:'Area and Peak of a Triangular Spectrum'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'w', label:'$\\omega$', min:-10, max:10, step:0.5, v:-4,
        show:v=>'$'+(v===0?'0':(v<0?'-':'')+Math.abs(v)*1000+'\\pi')+',\\;X(j\\omega)='+Math.round(Math.max(0,8000-Math.abs(v)*1000)/2)+'$'}]},
      svg:v=>{
      const w0=(v?v.w:-4)*KP(1000), W=KP(4000), R=t=>Math.abs(t)<=W?1:0, X=w=>Math.max(0,KP(8000)-Math.abs(w))/(2*PI);
      const XT=[-KP(8000),0,KP(8000)];
      return s2Stack([400,416],[0.5,0.52], h=>{
        const a=AX({h,xr:[-KP(13000),KP(13000)],yr:[-0.2,1.6],xlabel:'\\theta',ylabel:'R(j\\theta),\\ R\\bigl(j(\\omega-\\theta)\\bigr)',
          ytarget:3,yticksOverride:[1],ytickfmt:v=>String(v),xticksOverride:XT,xtickfmt:kpiTick});
        a.area(t=>R(t)*R(w0-t),-KP(13000),KP(13000),{color:s2Wash(C.out,.25),n:1600});
        a.poly([[-W,0],[-W,1],[W,1],[W,0]],{color:C.in});
        a.poly([[w0-W,0],[w0-W,1],[w0+W,1],[w0+W,0]],{color:C.h,dash:'9 6'});
        return a.svg(); }, h=>{
        const a=AX({h,xr:[-KP(13000),KP(13000)],yr:[-300,5600],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X(j\\omega)',
          ytarget:3,yticksOverride:[2000],ytickfmt:v=>String(v),xticksOverride:XT,xtickfmt:kpiTick});
        a.curve(w=>w<=w0+1e-6?X(w):NaN,{color:C.out,n:1600});
        a.vline(w0,{color:C.muted,opacity:.6});
        a.point(w0,X(w0),{color:C.out,ring:C.plate,r:5.2});
        return a.svg(); }); },
      caption:'Slide $R\\bigl(j(\\omega-\\theta)\\bigr)$ across $R(j\\theta)$. The green overlap, divided by $2\\pi$, is the dot that traces $X(j\\omega)$.'},
    {t:'legend', items:[['in','$R(j\\theta)$'],['h','$R\\bigl(j(\\omega-\\theta)\\bigr)$',true],['out','$X(j\\omega)$']]}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x(t)=\\bigl(\\sin(4000\\pi t)/\\pi t\\bigr)^{2}$, the square of the signal whose transform $R(j\\omega)$ is 1 on $|\\omega|\\le4000\\pi$.<div class="nsep"></div>What is the peak of $X(j\\omega)$?',
      ask:{key:'m7-ex-73c', choices:['$4000$','$8000\\pi$','$1$'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'Squaring in time convolves in frequency: $X(j\\omega)=\\frac{1}{2\\pi}\\,[R*R](\\omega)$, a triangle that peaks at zero shift.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'\\begin{aligned}A&=[R*R](0)=\\int_{-4000\\pi}^{4000\\pi}(1)(1)\\,\\d\\tau=8000\\pi\\\\X_{\\max}&=X(j0)=\\frac{A}{2\\pi}=\\frac{8000\\pi}{2\\pi}=4000\\end{aligned}', label:'Step 1 · Area, then peak',
        note:'$A$ is an area and $X_{\\max}$ is a height; $2\\pi$ separates them. Every later formula uses $X_{\\max}$, never $A$.'}]}
  ]}
]},

{ id:'m7-ex-73c-b', module:'M7', nav:'Triangular spectrum · the copies', title:'Height of a Spectral Replica', src:'p. 83',
  objective:'Compute the bandwidth, the Nyquist period and the height of a copy, and check them against the previous part.',
  keywords:'bandwidth 8000 pi nyquist rate 16000 pi period 125 us copy height 3.2e7 X_max / T check half the period',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 7 · Worked example', src:'p. 83'},
  {t:'title', text:'Height of a Spectral Replica'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const ws=KP(16000), pk=3.2e7;
      const a=AX({xr:[-KP(34000),KP(34000)],yr:[-2.4e6,4.3e7],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X_p(j\\omega)\\;[\\times10^{7}]',
        ytarget:3,yticksOverride:[1e7,2e7,3.2e7],ytickfmt:v=>String(+(v/1e7).toFixed(1)),
        xticksOverride:[-KP(32000),-KP(16000),0,KP(16000),KP(32000)],xtickfmt:kpiTick});
      for(let k=-2;k<=2;k++) a.curve(w=>tri(w-k*ws,KP(8000),pk),{color:k?C.mid:C.in,n:1600});
      return a.svg(); },
      caption:'The copies at the Nyquist rate $\\omega_s=16000\\pi$ rad/s. Each stands $3.2\\times10^{7}$ tall, and neighbours just touch.'},
    {t:'legend', items:[['in','baseband'],['mid','copies']]}
  ], right:[
    {t:'eq', key:true, tex:'\\begin{aligned}\\omega_M&=2\\times4000\\pi=8000\\pi\\ \\text{rad/s}\\\\2\\omega_M&=16000\\pi\\ \\text{rad/s},\\quad T=\\frac{2\\pi}{16000\\pi}=125\\ \\mu\\text{s}\\\\X_{\\max}/T&=4000\\times8000=3.2\\times10^{7}\\end{aligned}', label:'Solution',
      note:'The triangle reaches zero at twice the half-width of the rectangle.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Check', html:'The bandwidth is twice that of the sinc signal, so the period must be half: $125\\ \\mu\\text{s}$ against $0.25$ ms. Also $\\omega_sT=16000\\pi\\times1.25\\times10^{-4}=2\\pi$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'The same signal is sampled at $\\omega_s=32000\\pi$ rad/s.<div class="nsep"></div>How tall is each copy?',
        ask:{key:'m7-ex-73c-b', choices:['$6.4\\times10^{7}$','$3.2\\times10^{7}$','$1.6\\times10^{7}$'], answer:0,
          why:'$T=2\\pi/32000\\pi=1/16000$ s, so $X_{\\max}/T=4000\\times16000=6.4\\times10^{7}$.'}}]}
  ]}
]},

/* ------------------------------------------------------- band-pass sampling */
{ id:'m7-bandpass', module:'M7', nav:'Band-pass sampling', title:'Band-Pass Sampling', src:'—',
  objective:'Sample a narrow band far above zero well below twice its top frequency, because the copies fit into the empty gaps.',
  keywords:'band-pass sampling bandpass narrow band 8 pi 10 pi width B rate 2B 4 pi copies fit gaps windows below 2 omega_H slider',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 7 · Aliasing and the sampling theorem', src:'—'},
  {t:'title', text:'Band-Pass Sampling'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'ws', label:'$\\omega_s$', min:3, max:22, step:0.1, v:4, show:v=>{
        const r=s2BpVerdict(v*PI);
        return '$'+s2Pi(v)+'$ · '+(r>0 ? 'copies apart' : r<0 ? 'copies overlap' : 'copies touch'); }}]},
      svg:v=>{
      const ws=(v?v.ws:4)*PI, span=12*PI, K=s2BpK(ws,span), L=P.labelScale()>1 ? 1 : 0;
      return s2Stack([360,340],[0.64,0.62], h=>{
        const a=AXW(-span,span,4*PI,{h,xlabel:'\\omega\\;[\\text{rad/s}]',yr:[-0.15,L?3:2.45],ylabel:'T\\,X_p(j\\omega)',
          yticksOverride:[1],ytickfmt:v=>String(v)});
        /* the intervals where two copies meet */
        const N=2400, ov=[]; let st=null;
        for(let i=0;i<=N;i++){ const w=-span+2*span*i/N, o=s2BpN(w,ws,K)>=2;
          if(o && st===null) st=w;
          if((!o || i===N) && st!==null){ ov.push([st,w]); st=null; } }
        const inOv = w => ov.some(([p,q])=>w>=p && w<=q);
        ov.forEach(([p,q])=>a.area(w=>s2BpSum(w,ws,K),p,q,{color:s2Wash(C.err,.22),n:60}));
        for(let k=-K;k<=K;k++) for(const s of [1,-1]){
          const col = k ? C.mid : C.in;
          a.curve(w=>inOv(w) ? NaN : s2BpCopy(w,ws,k,s),{color:col,n:2400});
          if(ov.length) a.curve(w=>inOv(w) ? s2BpCopy(w,ws,k,s) : NaN,{color:col,n:2400,width:1.4,dash:'4 4'});
        }
        if(ov.length) a.curve(w=>inOv(w) ? s2BpSum(w,ws,K) : NaN,{color:C.err,n:2400,width:2.6});
        return a.svg(); }, h=>{
        /* the rates: green where the copies fit, red where they overlap */
        const a=AX({h,xr:[2*PI,23*PI],yr:[0,1],xlabel:'\\omega_s\\;[\\text{rad/s}]',grid:false,yticksLeft:false,
          yticksOverride:[],xticksOverride:[4*PI,8*PI,12*PI,16*PI,20*PI],xtickfmt:piTick,pad:{l:52,r:24,t:14,b:34}});
        a.rect(3*PI,0.28,22*PI,0.72,{fill:s2Wash(C.err,.2)});
        S2BPW.forEach(([p,q])=>{ const lo=p*PI, hi=Math.min(q,22)*PI, e=hi-lo<1e-9 ? 0.07*PI : 0;
          a.rect(lo-e,0.28,hi+e,0.72,{fill:s2Wash(C.out,.62)}); });
        a.poly([[ws,0.12],[ws,0.88]],{color:C.coral,width:2.6});
        a.point(ws,0.5,{color:C.coral,r:6.5,ring:C.plate});
        return a.svg(); }); },
      caption:'A band on $8\\pi<|\\omega|<10\\pi$ rad/s, drawn times $T$. Below it, every rate on the slider: green where the copies fit, red where they overlap. Move $\\omega_s$.'},
    {t:'legend', items:[['in','the band'],['mid','copies'],['err','overlap sum']]}
  ], right:[
    {t:'eq', label:'Where the copies land at $\\omega_s=2B=4\\pi$', tex:'\\begin{aligned}8\\pi<\\omega<10\\pi\\;&\\xrightarrow{\\;-2\\omega_s\\;}\\;0<\\omega<2\\pi\\\\-10\\pi<\\omega<-8\\pi\\;&\\xrightarrow{\\;+3\\omega_s\\;}\\;2\\pi<\\omega<4\\pi\\end{aligned}',
      note:'The band is $B=2\\pi$ wide and starts at $4B$. At $2B$ the copies of its two halves take turns and fill the axis, so a band-pass filter of gain $T$ on the band returns $x(t)$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'Faster is not always safer', html:'The copies fit only at $4\\pi$, $5\\pi$ to $5.33\\pi$, $6.67\\pi$ to $8\\pi$, $10\\pi$ to $16\\pi$, and from $2\\omega_H=20\\pi$ up. So $7\\pi$ works and $9\\pi$ does not. At a window’s edge the copies touch.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'The band moves up to $12\\pi<|\\omega|<14\\pi$ rad/s, starting at $6B$.<div class="nsep"></div>What is the lowest rate at which the copies fit?',
        ask:{key:'m7-bandpass', choices:['$4\\pi$ rad/s','$28\\pi$ rad/s','$12\\pi$ rad/s'], answer:0,
          why:'The lower edge is again a whole multiple of $B=2\\pi$, so at $2B=4\\pi$ the two halves take turns; below $2B$ two bands of width $B$ cannot fit in one spacing.'}}]}
  ]}
]},

/* ------------------------------------------------ everyday signals, lab, code */
realGallery({ id:'m7-real-nyquist', nav:'Sampling rates around us',
  title:'Sampling Rates Around Us', eyebrow:'Module 7 · Aliasing and the sampling theorem', src:'pp. 81–82',
  objective:'Recognise the Nyquist test in the sampling rates of everyday devices.',
  keywords:'examples telephone 8 kHz 3.4 kHz CD audio 44.1 kHz 20 kHz heart rate watch temperature logger nyquist rate guard band',
  figs:[
    [()=>{ const x=t=>0.7*Math.cos(PI*t)+0.3*Math.cos(6.8*PI*t);
      const a=P.Axes(EXO({xr:[0,2.05],yr:[-1.3,2.9],xlabel:'t\\;(\\text{ms})',ylabel:'x(t)',xticksOverride:[0,0.5,1,1.5,2],xtickfmt:v=>String(v),yticksOverride:[-1,0,1],ytickfmt:v=>String(v)}));
      a.curve(x,{color:C.in,dash:'9 6',n:900});
      a.stem(samp(x,1/8,0,2.0001),{color:C.mid,r:3});
      return a.svg(); }, 'Phone speech, below $3.4$ kHz: $x(t)=0.7\\cos(\\pi t)+0.3\\cos(6.8\\pi t)$, $t$ in ms.',
      [['in','$x(t)$',true],['mid','$x(n/8)$']]],
    [()=>{ const x=t=>Math.cos(40*PI*t);
      const a=P.Axes(EXO({xr:[0,0.255],yr:[-1.3,2.9],xlabel:'t\\;(\\text{ms})',ylabel:'x(t)',xticksOverride:[0,0.05,0.1,0.15,0.2,0.25],xtickfmt:v=>String(+v.toFixed(2)),yticksOverride:[-1,0,1],ytickfmt:v=>String(v)}));
      a.curve(x,{color:C.in,dash:'9 6',n:1200});
      a.stem(samp(x,1/44.1,0,0.2501),{color:C.mid,r:3});
      return a.svg(); }, 'The top tone a CD keeps, $20$ kHz: $x(t)=\\cos(40\\pi t)$, $t$ in ms.',
      [['in','$x(t)$',true],['mid','$x(n/44.1)$']]],
    [()=>{ const a=P.Axes(EXO({xr:[-0.5,30.5],yr:[-6.5,7],xlabel:'n\\;(\\text{s})',ylabel:'h[n]-72\\;(\\text{bpm})',xstep:5,yticksOverride:[-5,0,5],ytickfmt:v=>String(v)}));
      a.stem(D(n=>5*Math.cos(0.4*PI*n),0,30),{color:C.in,r:2.8});
      return a.svg(); }, 'Heart rate on a watch, swinging with breath: $h[n]=72+5\\cos(0.4\\pi n)$ bpm.'],
    [()=>{ const th=t=>3*Math.cos(PI*(t-15)/12);
      const a=P.Axes(EXO({xr:[-0.5,24.5],yr:[-4,8.4],xlabel:'t\\;(\\text{h})',ylabel:'\\theta-21\\;(^{\\circ}\\text{C})',xstep:6,yticksOverride:[-3,0,3],ytickfmt:v=>String(v)}));
      a.curve(th,{color:C.in,dash:'9 6',n:600});
      a.stem(D(th,0,24),{color:C.mid,r:2.6});
      return a.svg(); }, 'Room temperature: $\\theta(t)=21+3\\cos\\bigl(\\pi(t-15)/12\\bigr)$ °C, $t$ in h.',
      [['in','$\\theta(t)-21$',true],['mid','hourly samples']]]
  ],
  notes:[
    {t:'note', kind:'def', head:'One test, four rates', html:'Each device samples above twice its highest frequency: a phone at $8$ kHz against $3.4$ kHz, a CD at $44.1$ kHz against $20$ kHz, a watch at $1$ Hz against $0.2$ Hz, a logger once an hour against one cycle a day.'},
    {t:'note', kind:'warn', head:'Room for a real filter', html:'The margins are not zero: $8>6.8$ kHz and $44.1>40$ kHz. The guard band gives a real filter room to cut off.'}
  ]}),

labScene({ id:'m7-lab-j2', lab:'J2', nav:'The Nyquist Test', title:'Copies Apart, Touching or Overlapping', src:'pp. 81–82',
  objective:'Slide the sampling rate and watch the copies of a band-limited spectrum part, touch and overlap.',
  keywords:'laboratory nyquist test sampling rate slider triangle line spectrum overlap width guard band verdict apart touching overlapping' }),

codeScene({ id:'m7-code-nyquist', nav:'The Nyquist test', title:'The Nyquist Test in Code', src:'pp. 82–83', eyebrow:'The Nyquist test in code',
  objective:'Compute sampling rates, guard bands, Nyquist periods and copy heights in MATLAB and in Python, and predict each result before running it.',
  keywords:'code matlab python nyquist rate sampling period guard band overlap width boundary sine zero samples triangular spectrum peak band-pass sampling windows' }),

/* </m7-s2> */

/* <m7-s3> ============================================ 7.3 reconstruction */

/* --------------------------------------------------------- reconstruction */
{ id:'m7-recon', module:'M7', nav:'Reconstruction', title:'Ideal Reconstruction Filter', src:'p. 83',
  objective:'Specify the reconstruction filter and justify its gain and its cutoff.',
  keywords:'reconstruction ideal lowpass filter gain T cutoff omega_c baseband copies guard band', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 7 · Reconstruction', src:'p. 83'},
  {t:'title', text:'Ideal Reconstruction Filter'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$X_p(j\\omega)$: copies of height $1/T=3$','$H_r(j\\omega)$: gain $T$ on $|\\omega|<3\\pi$','$X_r(j\\omega)=X(j\\omega)$: height $1$']},
      svg:v=>{
      /* frame 0: the sampled spectrum; frame 1: the filter window; frame 2:
         the neighbours are gone and the baseband is multiplied by T */
      const f=v?v.frame:0, ws=6*PI, box=cl(f), out=cl(f-1), pk=3-2*out;
      const a=AXW(-9*PI,9*PI,3*PI,{h:330,yr:[-0.3,5.9],ylabel:out>0.5?'X_r(j\\omega)':'X_p(j\\omega)',yticksOverride:[1,3]});
      fade(a,1-out,()=>{
        for(const k of [-1,1]) a.curve(w=>tri(w-k*ws,WM,3),{color:C.mid,n:1400});
        a.curve(w=>tri(w,WM,pk),{color:C.in,n:1400}); });
      fade(a,out,()=>a.curve(w=>tri(w,WM,pk),{color:C.out,width:2.8,n:1400}));
      fade(a,box,()=>a.rect(-3*PI,0,3*PI,3.6,{stroke:C.h,dash:'7 5',width:2}));
      return a.svg(); },
      caption:'$x(t)=\\bigl(\\sin(\\pi t)/(\\pi t)\\bigr)^2$ has $\\omega_M=2\\pi$ rad/s. With $T=1/3$ s, $\\omega_s=6\\pi$ rad/s and each copy has height $3$.'},
    {t:'legend', items:[['in','$X(j\\omega)/T$'],['mid','copies at $\\pm\\omega_s$'],['h','$H_r(j\\omega)$',true],['out','$X_r(j\\omega)$']]}
  ], right:[
    {t:'eq', tex:'H_r(j\\omega)=\\begin{cases}T,&|\\omega|<\\omega_c\\\\[2pt]0,&|\\omega|>\\omega_c\\end{cases}\\qquad \\omega_M<\\omega_c<\\omega_s-\\omega_M',
      label:'Ideal reconstruction filter',
      note:'The cutoff {{sym:wc|$\\omega_c$}} sits in the guard band.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'X_r(j\\omega)=H_r(j\\omega)\\,X_p(j\\omega)=T\\cdot\\tfrac{1}{T}\\,X(j\\omega)=X(j\\omega)', label:'Why the gain is $T$',
        note:'Only the baseband copy $X(j\\omega)/T$ lies in $|\\omega|<\\omega_c$, so $x_r(t)=x(t)$, if the copies do not overlap.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Common error', html:'Gain $1$ returns $x(t)/T$, not $x(t)$, and the error changes with $T$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$x(t)$ has $\\omega_M=2\\pi$ rad/s and is sampled at $\\omega_s=10\\pi$ rad/s.<div class="nsep"></div>Which cutoff recovers $x(t)$?',
        ask:{key:'m7-recon', choices:['$\\omega_c=\\pi$ rad/s','$\\omega_c=5\\pi$ rad/s','$\\omega_c=9\\pi$ rad/s'], answer:1,
          why:'The cutoff must lie in $2\\pi<\\omega_c<10\\pi-2\\pi=8\\pi$ rad/s.'}}]}
  ]}
]},

{ id:'m7-recon-b', module:'M7', nav:'The chain in time', title:'Sampling and Reconstruction in Time', src:'p. 85',
  objective:'Follow one signal through the sampler and the reconstruction filter, and name each stage.',
  keywords:'reconstruction chain sampler impulse train x_p x_r time domain filter output naming', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 7 · Reconstruction', src:'p. 85'},
  {t:'title', text:'Sampling and Reconstruction in Time'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$x(t)$: the signal','$x_p(t)$: impulses of weight $x(nT)$','$x_r(t)$: the filter output']},
      svg:v=>{
      const f=v?v.frame:0, T=0.25, s1=cl(f), s2=cl(f-1);
      const a=AX({h:330,xr:[-2,2],yr:[-0.3,1.6],xlabel:'t\\;[\\text{s}]',ylabel:'x(t),\\;x_p(t),\\;x_r(t)',yticksOverride:[0,0.5,1]});
      a.curve(xB,{color:C.in,width:s1>0.5?1.5:2.4,dash:s1>0.5?'9 6':null,n:1000});
      fade(a,s1*(1-0.55*s2),()=>{ for(let n=-8;n<=8;n++){ const y=xB(n*T);
        if(y>0.02) a.impulse(n*T,y,{color:C.mid,label:false}); } });
      fade(a,s2,()=>a.curve(t=>{ let s=0; for(let n=-60;n<=60;n++) s+=xB(n*T)*s3sinc(PI*(t-n*T)/T); return s; },
        {color:C.out,width:2.6,n:800}));
      return a.svg(); },
      caption:'The same $x(t)$ with $T=0.25$ s. The filter, with $\\omega_c=\\pi/T=4\\pi$ rad/s, returns a curve that lies on $x(t)$.'},
    {t:'legend', items:[['in','$x(t)$',true],['mid','$x_p(t)$'],['out','$x_r(t)$']]}
  ], right:[
    {t:'note', kind:'def', head:'The chain', html:'<ol class="steps"><li>The sampler turns $x(t)$ into {{sym:xp|$x_p(t)$}}.</li><li>The filter $H_r(j\\omega)$ turns $x_p(t)$ into {{sym:xr|$x_r(t)$}}.</li></ol>'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'x_p(t)=\\sum_{n=-\\infty}^{\\infty}x(nT)\\,\\delta(t-nT)', label:'The sampler output',
        note:'An impulse train of period $T$, weighted by the samples.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Name the signals apart', html:'A diagram that labels the sampler output $x_r(t)$ has skipped the filter.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'Look halfway between two samples, at $t=nT+T/2$.<div class="nsep"></div>What is $x_p(t)$ there?',
        ask:{key:'m7-recon-b', choices:['$0$','$x(nT)$','$\\tfrac12\\bigl[x(nT)+x((n+1)T)\\bigr]$'], answer:0,
          why:'An impulse train is zero between its impulses. Only the filter output has a value there.'}}]}
  ]}
]},

/* ------------------------------------------------------------ interpolation */
{ id:'m7-interp', module:'M7', nav:'Band-limited interpolation', title:'Band-Limited Interpolation', src:'pp. 85–86',
  objective:'Write the filter output as a sum of shifted kernels, one for each sample.',
  keywords:'band limited interpolation kernel sum shifted sinc convolution impulse train samples', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 7 · Interpolation', src:'pp. 85–86'},
  {t:'title', text:'Band-Limited Interpolation'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['the samples $x(nT)$, $T=0.25$ s','$n=0$: the kernel $x(0)\\,h_{LP}(t)$','add $n=\\pm1$','add $n=\\pm2$','add $n=\\pm3$','every term: $x_r(t)$']},
      svg:v=>{
      /* each press brings in the kernels of one more pair of samples; the
         last frame brings in all the rest */
      const f=v?v.frame:0, T=0.25, wc=PI/T;
      const wt=n=>cl(f-Math.min(Math.abs(n),4));
      const a=AX({h:330,xr:[-1.5,1.5],yr:[-0.35,1.55],xlabel:'t\\;[\\text{s}]',ylabel:'x(t),\\;x_r(t)',yticksOverride:[0,0.5,1]});
      a.curve(xB,{color:C.in,width:1.5,dash:'9 6',n:900});
      for(let n=-6;n<=6;n++){ const y=xB(n*T), o=wt(n); if(y<1e-6||o<=0) continue;
        fade(a,o,()=>a.curve(t=>y*s3sinc(wc*(t-n*T)),{color:C.h,width:1.5,n:700})); }
      fade(a,cl(f),()=>a.curve(t=>{ let s=0;
        for(let n=-40;n<=40;n++){ const o=wt(n); if(o>0) s+=o*xB(n*T)*s3sinc(wc*(t-n*T)); }
        return s; },{color:C.out,width:2.8,n:800}));
      a.stem(D(n=>xB(n*T),-6,6).map(p=>[p[0]*T,p[1]]).filter(p=>p[1]>1e-6),{color:C.mid,r:4});
      return a.svg(); },
      caption:'Each sample adds its kernel $x(nT)\\operatorname{sinc}\\bigl(\\pi(t-nT)/T\\bigr)$, where $\\operatorname{sinc}\\theta=\\sin\\theta/\\theta$. The sum grows onto the dashed $x(t)$.'},
    {t:'legend', items:[['in','$x(t)$',true],['mid','$x(nT)$'],['h','$x(nT)\\,h_{LP}(t-nT)$'],['out','$\\text{sum}$']]}
  ], right:[
    {t:'eq', tex:'\\begin{aligned}x_r(t)&=x_p(t)*h_{LP}(t)=\\Bigl[\\sum_{n}x(nT)\\,\\delta(t-nT)\\Bigr]*h_{LP}(t)\\\\&=\\sum_{n}x(nT)\\,\\bigl[\\delta(t-nT)*h_{LP}(t)\\bigr]\\end{aligned}',
      label:'Filtering is convolution with $h_{LP}(t)$'},
    {t:'reveal', at:1, items:[
      {t:'eq', result:true, tex:'x_r(t)=\\sum_{n=-\\infty}^{\\infty}x(nT)\\,h_{LP}(t-nT)', label:'Key result · Band-limited interpolation',
        note:'$h_{LP}(t)$ is the impulse response of the filter, and $\\delta(t-nT)*h_{LP}(t)=h_{LP}(t-nT)$: one kernel per sample, scaled by it.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'A fault doubles one sample: $x(0)$ becomes $2x(0)$.<div class="nsep"></div>How does $x_r(t)$ change?',
        ask:{key:'m7-interp', choices:['$x(0)\\,h_{LP}(t)$ is added','Every kernel doubles','Only $x_r(0)$ changes'], answer:0,
          why:'The sum is linear in the samples. The change is $x(0)\\,h_{LP}(t)$, and it spreads over all $t$.'}}]}
  ]}
]},

{ id:'m7-interp-b', module:'M7', nav:'The interpolation kernel', title:'The Interpolation Kernel', src:'p. 85',
  objective:'Derive the kernel of the ideal filter, restate the sinc convention and see why the cutoff pi/T is special.',
  keywords:'interpolation kernel h_LP inverse transform sinc unnormalised omega_c pi over T sample instants zero', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 7 · Interpolation', src:'p. 85'},
  {t:'title', text:'The Interpolation Kernel'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'c', label:'$\\omega_c$', min:0.5, max:2, step:0.05, v:1, show:v=>'$'+(+v).toFixed(2)+'\\,\\pi/T$'}]},
      svg:v=>{
      /* drawn against t/T, so T = 1; the peak is T wc / pi = c */
      const c=v?v.c:1;
      const a=AX({h:330,xr:[-4.4,4.4],yr:[-0.55,2.3],xlabel:'t/T',ylabel:'h_{LP}(t)',yticksOverride:[0,1,2]});
      a.curve(u=>s3h(u,1,c*PI),{color:C.h,n:1600});
      for(let m=-4;m<=4;m++) a.point(m,s3h(m,1,c*PI),{color:C.coral,r:4.5});
      return a.svg(); },
      caption:'The kernel $T\\sin(\\omega_c t)/(\\pi t)$ against $t/T$, with its values at the sample instants marked. Move $\\omega_c$: only at $\\omega_c=\\pi/T$ is it $1$ at $t=0$ and $0$ at every other instant.'}
  ], right:[
    {t:'eq', tex:'\\begin{aligned}h_{LP}(t)&=\\frac{1}{2\\pi}\\int_{-\\omega_c}^{\\omega_c}T\\,e^{j\\omega t}\\,\\d\\omega=\\frac{T}{2\\pi}\\left[\\frac{e^{j\\omega t}}{jt}\\right]_{-\\omega_c}^{\\omega_c}\\\\&=\\frac{T}{\\pi t}\\cdot\\frac{e^{j\\omega_ct}-e^{-j\\omega_ct}}{2j}=\\frac{T\\sin(\\omega_ct)}{\\pi t}\\end{aligned}',
      label:'The kernel',
      note:'Use $e^{j\\theta}-e^{-j\\theta}=2j\\sin\\theta$. At $t=0$ the integral gives $h_{LP}(0)=T\\omega_c/\\pi$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'The choice $\\omega_c=\\pi/T$', html:'$\\pi/T=\\omega_s/2$ is the middle of $\\omega_M<\\omega_c<\\omega_s-\\omega_M$. Then $h_{LP}(t)=\\operatorname{sinc}(\\pi t/T)$, with the unnormalised $\\operatorname{sinc}\\theta=\\sin\\theta/\\theta$: $1$ at $t=0$, $0$ at every other $t=mT$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'The cutoff is raised to $\\omega_c=1.5\\pi/T$.<div class="nsep"></div>What is $h_{LP}(0)$?',
        ask:{key:'m7-interp-b', choices:['$1$','$1.5$','$1.5\\,T$'], answer:1,
          why:'$h_{LP}(0)=T\\omega_c/\\pi=T\\cdot1.5\\pi/(\\pi T)=1.5$.'}}]}
  ]}
]},

{ id:'m7-interp-c', module:'M7', nav:'The kernel · a dropped pi', title:'Keep the Pi Inside the Sine', src:'p. 85',
  objective:'See why the kernel must be sinc(pi t/T) and what a kernel with the pi dropped does to the samples.',
  keywords:'interpolation kernel sinc unnormalised pi dropped common error sample instants zeros leak', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 7 · Interpolation', src:'p. 85'},
  {t:'title', text:'Keep the $\\pi$ Inside the Sine'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['the kernel $\\operatorname{sinc}(\\pi t/T)$','the $\\pi$ dropped: $\\sin(t/T)/(\\pi t/T)$']},
      svg:v=>{
      /* drawn against t/T, so T = 1 */
      const f=cl(v?v.frame:0), bad=u=>Math.abs(u)<1e-9 ? 1/PI : Math.sin(u)/(PI*u);
      const a=AX({h:330,xr:[-4.4,4.4],yr:[-0.42,1.45],xlabel:'t/T',ylabel:'\\text{kernel}',yticksOverride:[0,0.5,1]});
      a.curve(u=>s3sinc(PI*u),{color:C.h,n:1600});
      for(let m=-4;m<=4;m++) a.point(m,m===0?1:0,{color:C.coral,r:4.5});
      fade(a,f,()=>{ a.curve(bad,{color:C.err,width:2.6,n:1600});
        for(let m=-4;m<=4;m++) a.point(m,bad(m),{color:C.err,r:4.5}); });
      return a.svg(); },
      caption:'The kernel with $\\omega_c=\\pi/T$, amber, is $1$ at its own instant and $0$ at every other one. With the $\\pi$ dropped, red, it misses every marked instant.'},
    {t:'legend', items:[['h','$\\operatorname{sinc}(\\pi t/T)$'],['err','$\\sin(t/T)/(\\pi t/T)$']]}
  ], right:[
    {t:'eq', tex:'\\operatorname{sinc}\\Bigl(\\frac{\\pi t}{T}\\Bigr)=\\frac{\\sin(\\pi t/T)}{\\pi t/T}\\qquad\\text{against}\\qquad\\frac{\\sin(t/T)}{\\pi t/T}',
      label:'Two kernels, one letter apart',
      note:'Here $\\operatorname{sinc}\\theta=\\sin\\theta/\\theta$. The first is zero at $t=mT$, $m\\neq0$; the second at $t=m\\pi T$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'err', head:'Common error', html:'With $T=1$ the kernel at $t=1$ is $\\sin(\\pi)/\\pi=0$. Dropping the $\\pi$ gives $\\sin(1)/\\pi=0.267849$, so that sample leaks into its neighbour.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'The $\\pi$ is dropped and $T=1$.<div class="nsep"></div>What is the damaged kernel at $t=0$?',
        ask:{key:'m7-interp-c', choices:['$1/\\pi\\approx0.318$','$1$','$0$'], answer:0,
          why:'Near $t=0$, $\\sin t\\approx t$, so $\\sin(t)/(\\pi t)\\to1/\\pi$.'}}]}
  ]}
]},

/* ------------------------------------------------------- the zero-order hold */
{ id:'m7-zoh', module:'M7', nav:'The zero-order hold', title:'Zero-Order Hold', src:'pp. 83–84',
  objective:'Describe the zero-order hold and watch its staircase approach the signal as the period shrinks.',
  keywords:'zero order hold staircase h_0 practical converter hold each sample approximation period', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 7 · Practical reconstruction', src:'pp. 83–84'},
  {t:'title', text:'Zero-Order Hold'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'T', label:'$T$', min:0.05, max:0.5, step:0.05, v:0.5, show:v=>'$'+(+v).toFixed(2)+'$ s'}]},
      svg:v=>{
      const T=v?v.T:0.5;
      const a=AX({h:330,xr:[-2.5,2.5],yr:[-0.25,1.6],xlabel:'t\\;[\\text{s}]',ylabel:'x(t),\\;x_0(t)',yticksOverride:[0,0.5,1]});
      a.curve(xB,{color:C.in,width:1.6,dash:'9 6',n:1000});
      a.poly(s3stair(xB,T,-2.5,2.5),{color:C.out,width:2.6});
      if(T>0.12) for(let n=Math.ceil(-2.5/T-1e-9);n*T<=2.5+1e-9;n++) a.point(n*T,xB(n*T),{color:C.mid,r:3.8});
      return a.svg(); },
      caption:'The dashed $x(t)$ and the hold output $x_0(t)$. Move $T$: the treads shorten and the staircase closes on $x(t)$. The converter in a music player makes such a staircase.'},
    {t:'legend', items:[['in','$x(t)$',true],['mid','$x(nT)$'],['out','$x_0(t)$']]}
  ], right:[
    {t:'note', kind:'def', head:'Why hold', html:'$h_{LP}(t)$ starts before $t=0$ and never ends, so it cannot be built. A converter holds each sample instead.'},
    {t:'eq', tex:'h_0(t)=\\begin{cases}1,&0\\le t<T\\\\[2pt]0,&\\text{otherwise}\\end{cases}\\qquad x_0(t)=x(nT),\\;\\;nT\\le t<(n+1)T',
      label:'Zero-order hold',
      note:'Each impulse $x(nT)\\,\\delta(t-nT)$ becomes a rectangle of height $x(nT)$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'err', head:'A hold is not a reconstruction', html:'The staircase is not $x(t)$. Its error shrinks with $T$ but is not zero.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'$T$ is halved, from $0.2$ s to $0.1$ s.<div class="nsep"></div>What happens to the largest gap between $x_0(t)$ and $x(t)$?',
        ask:{key:'m7-zoh', choices:['It about halves','It stays the same','It about quarters'], answer:0,
          why:'Over one tread a smooth signal moves by about $|x\'(t)|\\,T$, so the largest gap scales with $T$.'}}]}
  ]}
]},

{ id:'m7-zoh-b', module:'M7', nav:'Hold · frequency response', title:'Frequency Response of the Hold', src:'p. 83',
  objective:'Derive the frequency response of the zero-order hold and compare it with the ideal filter.',
  keywords:'zero order hold frequency response H_0 sinc delay T/2 sag leakage magnitude', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 7 · Practical reconstruction', src:'p. 83'},
  {t:'title', text:'Frequency Response of the Hold'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$|H_0(j\\omega)|$ with $T=0.5$ s','against the ideal filter: sag and leakage']},
      svg:v=>{
      const f=cl(v?v.frame:0), T=0.5, e=PI/T;
      const a=AXW(-10*PI,10*PI,4*PI,{h:330,yr:[-0.05,0.8],ylabel:'|H_0(j\\omega)|',yticksOverride:[0.25,0.5]});
      fade(a,f,()=>{
        a.area(()=>T,-e,e,{color:C.h+'22'});
        a.rect(-e,0,e,T,{stroke:C.h,dash:'7 5',width:2});
        a.area(w=>s3H0(w,T),e,10*PI,{color:C.err+'40'});
        a.area(w=>s3H0(w,T),-10*PI,-e,{color:C.err+'40'}); });
      a.curve(w=>s3H0(w,T),{color:C.h,n:2000});
      return a.svg(); },
      caption:'With $T=0.5$ s, $\\omega_s=4\\pi$ rad/s. The ideal filter is flat at $T$ up to $\\omega_s/2=2\\pi$ and zero beyond. The hold sags inside that band and leaks outside it.'},
    {t:'legend', items:[['h','$|H_0(j\\omega)|$'],['h','ideal, gain $T$',true],['err','leakage']]}
  ], right:[
    {t:'eq', tex:'\\begin{aligned}H_0(j\\omega)&=\\int_{0}^{T}e^{-j\\omega t}\\,\\d t=\\frac{1-e^{-j\\omega T}}{j\\omega}\\\\&=e^{-j\\omega T/2}\\,\\frac{e^{j\\omega T/2}-e^{-j\\omega T/2}}{j\\omega}=e^{-j\\omega T/2}\\,\\frac{2\\sin(\\omega T/2)}{\\omega}\\end{aligned}',
      label:'Frequency response of the hold',
      note:'Factor out $e^{-j\\omega T/2}$, then use $e^{j\\theta}-e^{-j\\theta}=2j\\sin\\theta$. The factor $e^{-j\\omega T/2}$ is a delay of $T/2$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'Reading $|H_0|$', html:'At $\\omega=0$ {{sym:zoh|$|H_0|$}} equals $T$, the gain the ideal filter needs. Inside the band it sags: at $\\omega_s/2$ it is $2T/\\pi\\approx0.64\\,T$. Outside the band it is small but not zero, so parts of the copies remain.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'The hold uses $T=0.1$ s.<div class="nsep"></div>Where is the first zero of $|H_0(j\\omega)|$ for $\\omega>0$?',
        ask:{key:'m7-zoh-b', choices:['$20\\pi$ rad/s','$10\\pi$ rad/s','$\\pi/10$ rad/s'], answer:0,
          why:'$\\sin(\\omega T/2)=0$ first at $\\omega T/2=\\pi$, so $\\omega=2\\pi/T=\\omega_s=20\\pi$ rad/s.'}}]}
  ]}
]},

{ id:'m7-zoh-hear', module:'M7', nav:'Hold · hearing it', title:'Hearing the Hold', src:'pp. 83–84',
  objective:'Hear the copies a zero-order hold leaves in a tone, and predict their level from the hold response.',
  keywords:'zero order hold sound tone buzz copies f_s level f0/(fs-f0) audio converter listen', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 7 · Practical reconstruction', src:'pp. 83–84'},
  {t:'title', text:'Hearing the Hold'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'fs', label:'$f_s$', min:1000, max:8000, step:500, v:2000, show:v=>'$'+v+'$ Hz'}]},
      listen:{items:[
          {label:'Play $x(t)$', sound:()=>({f:s3tone, dur:1.5})},
          {label:'Play $x_0(t)$', sound:v=>({f:s3zoh(s3tone,1/v.fs), dur:1.5})}]},
      svg:v=>{
      /* time in milliseconds */
      const fs=v?v.fs:2000, T=1000/fs, x=t=>s3tone(t/1000);
      const a=AX({h:330,xr:[0,10],yr:[-1.3,2.15],xlabel:'t\\;[\\text{ms}]',ylabel:'x(t),\\;x_0(t)',yticksOverride:[-1,0,1]});
      a.curve(x,{color:C.in,width:1.6,dash:'9 6',n:1200});
      a.poly(s3stair(x,T,0,10).slice(2),{color:C.out,width:2.4});
      return a.svg(); },
      caption:'A $300$ Hz tone $x(t)=\\cos(2\\pi\\,300\\,t)$ over $10$ ms, and its hold output at $f_s$ samples per second. Play both, then move $f_s$ and play again.'},
    {t:'legend', items:[['in','$x(t)$',true],['out','$x_0(t)$']]}
  ], right:[
    {t:'note', kind:'def', head:'What you hear', html:'$x(t)$ is a pure tone. The hold output also carries copies of it near $f_s\\pm300$ Hz, $2f_s\\pm300$ Hz, and so on. They sound as a buzz on top of the tone.'},
    {t:'eq', tex:'\\frac{|H_0(j2\\pi(f_s-f_0))|}{|H_0(j2\\pi f_0)|}=\\frac{f_0}{f_s-f_0}', label:'Level of the first copy',
      note:'With $\\omega=2\\pi f$, $|H_0|=|\\sin(\\pi f/f_s)|/(\\pi f)$, and $\\sin(\\pi-\\theta)=\\sin\\theta$. At $f_s=2000$ Hz the copy at $1700$ Hz has $300/1700\\approx0.18$ of the level of the tone.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'Raise the rate', html:'A higher $f_s$ moves the copies up and makes them weaker. The buzz rises in pitch and fades.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'The tone stays at $f_0=300$ Hz and $f_s$ is raised to $8000$ Hz.<div class="nsep"></div>What is the level of the first copy, relative to the tone?',
        ask:{key:'m7-zoh-hear', choices:['About $0.04$','About $0.18$','Exactly $0$'], answer:0,
          why:'$f_0/(f_s-f_0)=300/7700\\approx0.039$.'}}]}
  ]}
]},

{ id:'m7-zoh-c', module:'M7', nav:'Hold · the compensator', title:'Compensating the Hold', src:'p. 83',
  objective:'Derive the filter that would turn the hold into ideal reconstruction, and see why it is hard to build.',
  keywords:'compensator H_r = H/H_0 zero order hold boost pi/2 time advance equaliser', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 7 · Practical reconstruction', src:'p. 83'},
  {t:'title', text:'Compensating the Hold'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$|H_0(j\\omega)|$ and the target $|H(j\\omega)|$','$|H_r(j\\omega)|=|H(j\\omega)|/|H_0(j\\omega)|$','$|H_0(j\\omega)|\\,|H_r(j\\omega)|=|H(j\\omega)|$']},
      svg:v=>{
      const f=v?v.frame:0, T=0.5, e=PI/T;
      const box=[[-4*PI,0],[-e,0],[-e,T],[e,T],[e,0],[4*PI,0]];
      const a=AXW(-4*PI,4*PI,2*PI,{h:330,yr:[-0.08,2.6],ylabel:'\\text{magnitude}',yticksOverride:[0.5,1,1.5]});
      a.poly(box,{color:C.h,width:1.8,dash:'7 5'});
      a.curve(w=>s3H0(w,T),{color:C.h,n:1600});
      fade(a,cl(f),()=>{ a.curve(w=>Math.abs(w)<e ? T/s3H0(w,T) : NaN,{color:C.mid,n:1600});
        a.hline(PI/2,{color:C.mid,opacity:.55});
        a.note(2.6*PI,PI/2,'\\pi/2',{tex:true,color:C.mid,anchor:'start',dy:-8,fs:15}); });
      fade(a,cl(f-1),()=>a.poly(box,{color:C.out,width:3}));
      return a.svg(); },
      caption:'$T=0.5$ s. The target is gain $T$ up to $\\omega_s/2=2\\pi$ rad/s. The compensator lifts the sagging hold to a flat band.'},
    {t:'legend', items:[['h','$|H_0(j\\omega)|$'],['h','target $|H(j\\omega)|$',true],['mid','$|H_r(j\\omega)|$'],['out','$|H_0|\\,|H_r|$']]}
  ], right:[
    {t:'eq', tex:'H_0(j\\omega)\\,H_r(j\\omega)=H(j\\omega)\\;\\Longrightarrow\\;H_r(j\\omega)=\\frac{H(j\\omega)}{H_0(j\\omega)}=\\frac{e^{j\\omega T/2}\\,H(j\\omega)\\,\\omega}{2\\sin(\\omega T/2)}',
      label:'The compensator',
      note:'The hold then $H_r$ must act as the ideal $H$. Divide by $H_0=e^{-j\\omega T/2}\\,2\\sin(\\omega T/2)/\\omega$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'How much boost', html:'With gain $T$ up to $\\pi/T$, $|H_r|=T\\omega/\\bigl(2\\sin(\\omega T/2)\\bigr)$ rises from $1$ to $\\pi/2\\approx1.57$ at the edge.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Hard to build', html:'$e^{j\\omega T/2}$ is a time advance and $H$ is ideal. Converters approximate $H_r$, or use the hold output as it is.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The band is narrowed: the target $H$ now stops at $\\omega_c=\\omega_s/4$.<div class="nsep"></div>What is the largest boost $|H_r|$ now needs?',
        ask:{key:'m7-zoh-c', choices:['Less than $\\pi/2$','Exactly $\\pi/2$','More than $\\pi/2$'], answer:0,
          why:'$|H_0|$ sags less over a narrower band. At $\\omega=\\omega_s/4$ the boost is $\\pi/(2\\sqrt2)\\approx1.11$.'}}]}
  ]}
]},

/* ------------------------------------------------------ the first-order hold */
{ id:'m7-foh', module:'M7', nav:'The first-order hold', title:'First-Order Hold', src:'p. 84',
  objective:'Join the samples by straight lines and watch the result approach the signal as the period shrinks.',
  keywords:'first order hold linear interpolation straight lines samples period approximation', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 7 · Practical reconstruction', src:'p. 84'},
  {t:'title', text:'First-Order Hold'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'T', label:'$T$', min:0.05, max:0.5, step:0.05, v:0.5, show:v=>'$'+(+v).toFixed(2)+'$ s'}]},
      svg:v=>{
      const T=v?v.T:0.5;
      const a=AX({h:330,xr:[-2.5,2.5],yr:[-0.25,1.6],xlabel:'t\\;[\\text{s}]',ylabel:'x(t),\\;x_1(t)',yticksOverride:[0,0.5,1]});
      a.curve(xB,{color:C.in,width:1.6,dash:'9 6',n:1000});
      a.poly(s3lines(xB,T,-2.5,2.5),{color:C.out,width:2.6});
      if(T>0.12) for(let n=Math.ceil(-2.5/T-1e-9);n*T<=2.5+1e-9;n++) a.point(n*T,xB(n*T),{color:C.mid,r:3.8});
      return a.svg(); },
      caption:'The samples of $x(t)$ joined by straight lines. Move $T$: the lines close on $x(t)$ faster than the staircase did. A chart that joins table values with a ruler does the same.'},
    {t:'legend', items:[['in','$x(t)$',true],['mid','$x(nT)$'],['out','$x_1(t)$']]}
  ], right:[
    {t:'note', kind:'def', head:'Straight lines', html:'The first-order hold joins consecutive samples by a straight line. It is also called linear interpolation.'},
    {t:'eq', tex:'x_1(t)=x(nT)+\\frac{t-nT}{T}\\bigl[x((n+1)T)-x(nT)\\bigr],\\quad nT\\le t<(n+1)T',
      label:'First-order hold',
      note:'The output $x_1(t)$ is $x(nT)$ at $t=nT$ and $x((n+1)T)$ at $t=(n+1)T$, and it is a line in between.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'Timing', html:'Between $nT$ and $(n+1)T$ the line needs the next sample $x((n+1)T)$. A real system waits for it, so its output is $x_1(t)$ delayed by $T$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'$T$ is halved, from $0.2$ s to $0.1$ s.<div class="nsep"></div>What happens to the largest gap between $x_1(t)$ and $x(t)$?',
        ask:{key:'m7-foh', choices:['It about quarters','It about halves','It stays the same'], answer:0,
          why:'A line through two samples misses a smooth curve by about $|x\'\'(t)|\\,T^2/8$, so the gap scales with $T^2$.'}}]}
  ]}
]},

{ id:'m7-foh-b', module:'M7', nav:'First-order hold · the triangle', title:'Impulse Response of the First-Order Hold', src:'p. 84',
  objective:'Build the triangular impulse response of the first-order hold as a convolution of two rectangles.',
  keywords:'first order hold triangle h_1 convolution two rectangles g*g peak T overlap', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 7 · Practical reconstruction', src:'p. 84'},
  {t:'title', text:'Impulse Response of the First-Order Hold'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$g(t)$: $1$ on $|t|\\le T/2$','$(g*g)(t)$: a triangle of peak $T$','$h_1(t)=(g*g)(t)/T$: peak $1$']},
      svg:v=>{
      const f=v?v.frame:0, T=0.5, g1=cl(f), g2=cl(f-1), pk=g1*T+g2*(1-T);
      const trg=t=>Math.abs(t)<=T ? pk*(1-Math.abs(t)/T) : 0;
      const a=AX({h:330,xr:[-0.9,0.9],yr:[-0.2,1.55],xlabel:'t\\;[\\text{s}]',ylabel:'g(t),\\;h_1(t)',
        yticksOverride:[0,0.5,1],xticksOverride:[-0.5,-0.25,0,0.25,0.5]});
      fade(a,1-0.6*g1,()=>a.poly([[-0.9,0],[-T/2,0],[-T/2,1],[T/2,1],[T/2,0],[0.9,0]],{color:C.mid}));
      fade(a,g1*(1-g2),()=>a.curve(trg,{color:C.mid,width:2.4,dash:'8 5',n:600}));
      fade(a,g2,()=>a.curve(trg,{color:C.h,width:2.8,n:600}));
      return a.svg(); },
      caption:'With $T=0.5$ s. $g$ convolved with itself is a triangle of peak $T$; divided by $T$ it is $h_1$, peak $1$. The axis is time.'},
    {t:'legend', items:[['mid','$g(t)$'],['mid','$(g*g)(t)$',true],['h','$h_1(t)$']]}
  ], right:[
    {t:'eq', tex:'h_1(t)=\\frac{1}{T}\\,(g*g)(t),\\qquad g(t)=\\begin{cases}1,&|t|\\le T/2\\\\[2pt]0,&\\text{otherwise}\\end{cases}',
      label:'Built from the hold rectangle',
      note:'$g$ is the hold rectangle, centred on $t=0$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'(g*g)(t)=\\int_{-\\infty}^{\\infty}g(\\tau)\\,g(t-\\tau)\\,\\d\\tau=\\begin{cases}T-|t|,&|t|\\le T\\\\[2pt]0,&|t|>T\\end{cases}',
        label:'The convolution',
        note:'For $0\\le t\\le T$ the rectangles overlap on $[t-T/2,\\,T/2]$, of length $T-t$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Why this joins the samples', html:'By symmetry $h_1(t)=1-|t|/T$. Neighbouring kernels $x(nT)\\,h_1(t-nT)$ add to the line between their samples.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The hold uses $T=0.2$ s.<div class="nsep"></div>What is $h_1(t)$ at $t=0.1$ s?',
        ask:{key:'m7-foh-b', choices:['$0.5$','$0.1$','$1$'], answer:0,
          why:'$h_1(t)=1-|t|/T=1-0.1/0.2=0.5$.'}}]}
  ]}
]},

{ id:'m7-foh-c', module:'M7', nav:'Two holds compared', title:'Two Holds Compared', src:'pp. 84–85',
  objective:'Derive the frequency response of the first-order hold and compare the two holds inside and outside the band.',
  keywords:'first order hold frequency response H_1 squared sinc zero order hold comparison 1/omega 1/omega^2 sag', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 7 · Practical reconstruction', src:'pp. 84–85'},
  {t:'title', text:'Two Holds Compared'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$|H_0(j\\omega)|$, $T=0.5$ s','$H_1(j\\omega)$ beside it']},
      svg:v=>{
      const f=cl(v?v.frame:0), T=0.5;
      const a=AXW(-10*PI,10*PI,4*PI,{h:330,yr:[-0.04,0.8],ylabel:'|H_0(j\\omega)|,\\;H_1(j\\omega)',yticksOverride:[0.25,0.5]});
      a.vline(-PI/T,{color:C.muted,opacity:.6}); a.vline(PI/T,{color:C.muted,opacity:.6});
      a.curve(w=>s3H0(w,T),{color:C.h,width:1.9,dash:'8 5',n:2000});
      fade(a,f,()=>a.curve(w=>s3H1(w,T),{color:C.h,width:2.8,n:2000}));
      return a.svg(); },
      caption:'Both holds with $T=0.5$ s, so the band edge $\\omega_s/2$ is at $\\pm2\\pi$ rad/s, marked. Both start at $T$. The first-order hold falls away faster on both sides of the edge.'},
    {t:'legend', items:[['h','$|H_0(j\\omega)|$',true],['h','$H_1(j\\omega)$']]}
  ], right:[
    {t:'eq', tex:'G(j\\omega)=\\frac{2\\sin(\\omega T/2)}{\\omega}\\;\\Longrightarrow\\;H_1(j\\omega)=\\frac{1}{T}\\,G^{2}(j\\omega)=\\frac{1}{T}\\left[\\frac{\\sin(\\omega T/2)}{\\omega/2}\\right]^{2}',
      label:'Frequency response of the first-order hold',
      note:'$G=\\int_{-T/2}^{T/2}e^{-j\\omega t}\\,\\d t$ is centred on $t=0$, so it has no delay factor. Convolution in time is a product in frequency, so {{sym:foh|$H_1$}} is real, $H_1\\ge0$ and $H_1(0)=T$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'Two holds', html:'<div class="cmp"><div><span class="cmp-h">Zero-order</span>Falls off as $1/\\omega$ and leaves jumps. $|H_0|=0.64\\,T$ at $\\omega_s/2$.</div><div><span class="cmp-h">First-order</span>Falls off as $1/\\omega^{2}$, with no jumps. $H_1=0.41\\,T$ at $\\omega_s/2$: a larger sag.</div></div>'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'Both holds use $T=0.5$ s.<div class="nsep"></div>At $\\omega=6\\pi$ rad/s, which response is larger?',
        ask:{key:'m7-foh-c', choices:['$|H_0(j6\\pi)|$','$H_1(j6\\pi)$','They are equal'], answer:0,
          why:'$|H_0(j6\\pi)|=1/(3\\pi)\\approx0.106$ and $H_1(j6\\pi)=2/(9\\pi^2)\\approx0.023$.'}}]}
  ]}
]},

/* ------------------------------------------------------ perfect reconstruction */
{ id:'m7-perfect', module:'M7', nav:'Conditions for exact reconstruction', title:'Conditions for Exact Reconstruction', src:'p. 85',
  objective:'Restate the band-limited hypothesis and show what happens when it fails.',
  keywords:'band limited hypothesis perfect reconstruction rectangular pulse not band limited anti-aliasing', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 7 · The hypothesis', src:'p. 85'},
  {t:'title', text:'Conditions for Exact Reconstruction'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$x(t)$: $1$ on $|t|\\le0.5$ s','$|X(j\\omega)|=|2\\sin(\\omega/2)/\\omega|$','$|X_p(j\\omega)|$ with $T=0.25$ s']},
      svg:v=>{
      const f=v?v.frame:0;
      if(f<0.5){
        const a=AX({h:330,xr:[-1.6,1.6],yr:[-0.2,1.45],xlabel:'t\\;[\\text{s}]',ylabel:'x(t)',yticksOverride:[0,1]});
        fade(a,1-2*cl(f),()=>a.curve(t=>Math.abs(t)<=0.5?1:0,{color:C.in,n:2400}));
        return a.svg(); }
      const g=w=>Math.abs(w)<1e-9 ? 1 : 2*Math.sin(w*0.5)/w;
      if(f<1.5){
        const a=AXW(-16*PI,16*PI,8*PI,{h:330,yr:[-0.05,1.35],ylabel:'|X(j\\omega)|',yticksOverride:[0.5,1]});
        fade(a,Math.min(2*f-1,3-2*f),()=>a.curve(w=>Math.abs(g(w)),{color:C.in,n:3000}));
        return a.svg(); }
      const a=AXW(-16*PI,16*PI,8*PI,{h:330,yr:[-0.2,5.4],ylabel:'|X_p(j\\omega)|',yticksOverride:[2,4]});
      fade(a,2*f-3,()=>a.curve(w=>{ let s=0; for(let k=-6;k<=6;k++) s+=4*g(w-k*8*PI); return Math.abs(s); },{color:C.err,width:2.4,n:3000}));
      return a.svg(); },
      caption:'A rectangular pulse is zero outside a finite interval of time. Its transform never settles to zero. Sampled with $T=0.25$ s, the tails of all the copies add everywhere.'}
  ], right:[
    {t:'note', kind:'def', head:'Three conditions', html:'<b>Band-limited:</b> $X(j\\omega)=0$ for $|\\omega|>\\omega_M$.<br><b>Rate:</b> $\\omega_s>2\\omega_M$.<br><b>Filter:</b> gain $T$, cutoff $\\omega_M<\\omega_c<\\omega_s-\\omega_M$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'err', head:'A pulse of finite length is never band-limited', html:'A rectangular pulse of width $2T_1$ has $X(j\\omega)=2\\sin(\\omega T_1)/\\omega$. It crosses zero but is never zero on a whole interval, so no rate keeps the copies apart.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'What is done instead', html:'A filter first removes what lies above the chosen $\\omega_M$. The filtered signal is then recovered exactly; the original is not.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'Two signals: $\\cos(10\\pi t)$ and a rectangular pulse of width $0.2$ s.<div class="nsep"></div>Which one can a high enough rate recover exactly?',
        ask:{key:'m7-perfect', choices:['The cosine','The pulse','Both'], answer:0,
          why:'The cosine has $\\omega_M=10\\pi$ rad/s, so any $\\omega_s>20\\pi$ rad/s works. The pulse has no $\\omega_M$.'}}]}
  ]}
]},

/* ----------------------------------------------------------- around us */
realGallery({ id:'m7-real-recon', nav:'Reconstruction around us',
  title:'Reconstruction Around Us', eyebrow:'Module 7 · Reconstruction', src:'pp. 83–86',
  objective:'Recognise a hold, straight lines and a smoothing filter in everyday devices.',
  keywords:'examples converter staircase audio player LED dimmer temperature chart straight lines phone smoothing filter',
  figs:[
    [()=>{ const T=1/16, x=t=>Math.sin(2*PI*t);
      const a=P.Axes(EXO({xr:[0,2],yr:[-1.35,2.2],xlabel:'t\\;(\\text{ms})',ylabel:'v\\;(\\text{V})',xstep:0.5,yticksOverride:[-1,0,1]}));
      a.curve(x,{color:C.in,dash:'9 6',width:1.6,n:600});
      a.poly(s3stair(x,T,0,2).slice(2),{color:C.out,width:2.2});
      return a.svg(); }, 'A music player holds each sample of a $1$ kHz tone for $T=62.5\\ \\mu\\text{s}$: $v(t)=\\sin(2\\pi\\,1000\\,nT)$.',
      [['in','$x(t)$',true],['out','$v(t)$']]],
    [()=>{ const b=n=>100*(1-Math.pow(0.7,n));
      const a=P.Axes(EXO({xr:[-0.05,1.5],yr:[0,185],xlabel:'t\\;(\\text{s})',ylabel:'\\text{brightness}\\;(\\%)',xstep:0.5,yticksOverride:[0,50,100]}));
      const st=[]; for(let n=0;n<15;n++) st.push([n*0.1,b(n)],[(n+1)*0.1,b(n)]);
      a.poly(st,{color:C.out,width:2.2});
      a.stem(D(b,0,14).map(p=>[p[0]*0.1,p[1]]),{color:C.mid,r:3});
      return a.svg(); }, 'A dimmer sends $b[n]=100\\,(1-0.7^{n})\\,\\%$ every $0.1$ s, and the LED holds it: $L(t)=b[n]$.',
      [['mid','$b[n]$'],['out','$L(t)$']]],
    [()=>{ const th=t=>18+6*Math.sin(2*PI*(t-9)/24);
      const a=P.Axes(EXO({xr:[-0.5,24.5],yr:[0,38],xlabel:'t\\;(\\text{h})',ylabel:'\\theta\\;(^{\\circ}\\text{C})',xstep:6,yticksOverride:[0,10,20,30]}));
      const pts=[]; for(let n=0;n<=8;n++) pts.push([3*n,th(3*n)]);
      a.poly(pts,{color:C.out,width:2.2});
      a.stem(pts,{color:C.mid,r:3.2});
      return a.svg(); }, 'Readings every $3$ h, $\\theta[n]=18+6\\sin\\bigl(2\\pi(3n-9)/24\\bigr)\\ ^{\\circ}\\text{C}$, joined by straight lines.',
      [['mid','$\\theta[n]$'],['out','joined by lines']]],
    [()=>{ const T=1/8, x=t=>Math.sin(2*PI*t);
      const a=P.Axes(EXO({xr:[0,2],yr:[-1.35,2.2],xlabel:'t\\;(\\text{ms})',ylabel:'y(t)\\;(\\text{V})',xstep:0.5,yticksOverride:[-1,0,1]}));
      a.curve(x,{color:C.out,width:2.4,n:600});
      a.stem(D(n=>x(n*T),0,16).map(p=>[p[0]*T,p[1]]),{color:C.mid,r:3});
      return a.svg(); }, 'A phone filters samples $T=125\\ \\mu\\text{s}$ apart: $y(t)=\\sum_n x(nT)\\operatorname{sinc}\\bigl(\\pi(t-nT)/T\\bigr)=\\sin(2\\pi\\,1000\\,t)$.',
      [['mid','$x(nT)$'],['out','$y(t)$']]]
  ],
  notes:[
    {t:'note', kind:'def', head:'Four ways back', html:'A converter holds, a chart joins by lines, a phone filters with the kernel $\\operatorname{sinc}\\theta=\\sin\\theta/\\theta$. Each turns samples back into a continuous signal.'},
    {t:'note', kind:'warn', head:'Why this matters', html:'Only the smoothing filter can return the signal exactly. A hold leaves steps and straight lines leave corners.'}
  ]}),

labScene({ id:'m7-lab-j', lab:'J', nav:'Reconstruction', title:'Rebuilding a Signal from Its Samples', src:'pp. 83–86',
  objective:'Rebuild a sampled signal with the ideal filter, a zero-order hold or a first-order hold, at a rate above, at or below the Nyquist rate, and read the error.',
  keywords:'laboratory reconstruction ideal filter zero order hold first order hold oversampling critical undersampling error rms' }),

codeScene({ id:'m7-code-recon', nav:'Reconstruction', title:'Reconstruction in Code', src:'pp. 83–86', eyebrow:'Reconstruction in code',
  objective:'Rebuild a sampled signal by interpolation and by the two holds in MATLAB and in Python, and predict each result before running it.',
  keywords:'code matlab python interpolation sinc zero order hold first order hold frequency response run' }),

/* </m7-s3> */

/* <m7-s4> ============================================ 7.4 aliasing in practice */

/* --------------------------------------------------------- aliasing of a cosine */
{ id:'m7-alias-cos', module:'M7', nav:'Aliasing of a sampled cosine', title:'Aliasing of a Sampled Cosine', src:'p. 86',
  objective:'Track a single cosine through three rates and identify the surviving line.',
  keywords:'cosine three rates surviving line omega_s minus omega_0 lower frequency cutoff assumption copies filter frames',
  slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 7 · The alias frequency', src:'p. 86'},
  {t:'title', text:'Aliasing of a Sampled Cosine'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$\\omega_s=6\\omega_0$: the line at $\\omega_0$ is kept','$\\omega_s=3\\omega_0$: the line at $\\omega_0$ is kept','$\\omega_s=1.5\\omega_0$: a line at $0.5\\omega_0$ is kept']},
      svg:v=>{
      /* the rate falls from 6 w0 to 3 w0 to 1.5 w0 as the frame runs; the
         copies slide in and the filter narrows with it */
      const f=Math.max(0,Math.min(2,v?v.frame:0)), w0=2*PI, span=7.5*w0;
      const r = f<=1 ? 6-3*f : 3-1.5*(f-1);
      const a=AXW(-span,span,4*PI,{yr:[-0.3,2.5],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X_p(j\\omega)',yticksOverride:[]});
      s4lines(a, r*w0, [w0], span);
      return a.svg(); },
      caption:'Here $\\omega_0=2\\pi$ rad/s. Press Next to lower the rate: the copies move in and the filter narrows. Grey lines are rejected.'},
    {t:'legend', items:[['in','kept, from $X(j\\omega)$'],['err','kept, from a copy'],['h','filter, $|\\omega|<\\omega_s/2$',true]]}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x(t)=\\cos(\\omega_0t)$, so $X(j\\omega)=\\pi\\delta(\\omega-\\omega_0)+\\pi\\delta(\\omega+\\omega_0)$. The filter cutoff is $\\omega_c=\\omega_s/2$.<div class="nsep"></div>At $\\omega_s=1.5\\omega_0$, which frequency comes out?',
      ask:{key:'m7-alias-cos', choices:['$\\omega_0$','$0.5\\omega_0$','$1.5\\omega_0$'], answer:1}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'<ol class="steps"><li>Sampling puts a line at every $k\\omega_s\\pm\\omega_0$.</li><li>The filter keeps the lines with $|\\omega|<\\omega_c$.</li><li>The kept lines are the output.</li></ol>'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', label:'Solution · three rates', tex:'\\begin{aligned}\\omega_s=6\\omega_0:&\\;\\;\\omega_c=3\\omega_0,\\;\\;\\text{kept }\\pm\\omega_0&&\\Rightarrow\\;x_r(t)=\\cos(\\omega_0t)\\\\\\omega_s=3\\omega_0:&\\;\\;\\omega_c=1.5\\omega_0,\\;\\;\\text{kept }\\pm\\omega_0&&\\Rightarrow\\;x_r(t)=\\cos(\\omega_0t)\\\\\\omega_s=1.5\\omega_0:&\\;\\;\\omega_c=0.75\\omega_0,\\;\\;\\text{kept }\\pm0.5\\omega_0&&\\Rightarrow\\;x_r(t)=\\cos(0.5\\omega_0t)\\end{aligned}'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'The original frequency was removed', html:'At $\\omega_s=1.5\\omega_0$ the line at $\\omega_0$ lies outside the filter. The line at $\\omega_s-\\omega_0=0.5\\omega_0$ comes from the $k=1$ copy, and it lies inside.'}]}
  ]}
]},

/* ------------------------------------------------ the alias frequency, heard */
{ id:'m7-alias-cos-b', module:'M7', nav:'The alias frequency', title:'The Alias Frequency', src:'p. 86',
  objective:'Move a tone past half the sampling rate, see the curve through the samples drop to the alias frequency, and hear both.',
  keywords:'alias frequency tone kHz slider sound listen f_s minus f_0 undersampled case identity of a lower frequency',
  slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 7 · The alias frequency', src:'p. 86'},
  {t:'title', text:'The Alias Frequency'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'f', label:'$f_0$', min:0.5, max:5.5, step:0.1, v:4, show:v=>'$'+s4n(v,1)+'$ kHz'}]},
      listen:{items:[
        {label:'Play $x(t)$', sound:v=>({f:t=>Math.cos(2*PI*1000*v.f*t), dur:1.2})},
        {label:'Play $x_r(t)$', sound:v=>({f:t=>Math.cos(2*PI*1000*s4fold(v.f,6)*t), dur:1.2})}]},
      svg:v=>{
      /* t in ms and f in kHz, so 2 pi f t needs no factor; f_s = 6 kHz */
      const f0=v?v.f:4, fs=6, fa=s4fold(f0,fs);
      const a=AX({xr:[-0.05,2.05],yr:[-1.4,2.7],xlabel:'t\\;[\\text{ms}]',ylabel:'x(t),\\;x_r(t)',
        yticksOverride:[-1,0,1],xticksOverride:[0,0.5,1,1.5,2]});
      a.curve(t=>Math.cos(2*PI*f0*t),{color:C.in,width:1.5,dash:'5 5',n:3000});
      a.curve(t=>Math.cos(2*PI*fa*t),{color:C.err,width:2.4,n:1500});
      samp(t=>Math.cos(2*PI*f0*t),1/fs,-0.05,2.05).forEach(p=>a.point(p[0],p[1],{color:C.mid,r:5}));
      a.note(0,2.0,'x_r\\ \\text{at}\\ '+s4n(fa,1)+'\\;\\text{kHz}',{tex:true,anchor:'start',dx:14,color:C.err,fs:15});
      return a.svg(); },
      caption:'Samples at $f_s=6$ kHz. Move $f_0$ past $3$ kHz: the red curve through the same samples drops to $f_s-f_0$. A $4$ kHz whistle recorded this way plays back at $2$ kHz.'},
    {t:'legend', items:[['in','$x(t)$',true],['err','$x_r(t)$'],['mid','$x(nT)$']]}
  ], right:[
    {t:'eq', key:true, label:'The undersampled case', tex:'\\begin{aligned}X_r(j\\omega)&=\\pi\\delta\\bigl(\\omega-(\\omega_s-\\omega_0)\\bigr)+\\pi\\delta\\bigl(\\omega+(\\omega_s-\\omega_0)\\bigr)\\\\\\Longrightarrow\\;x_r(t)&=\\cos\\bigl((\\omega_s-\\omega_0)t\\bigr)\\end{aligned}',
      note:'This holds for $\\omega_s/2<\\omega_0<\\omega_s$. Each impulse is written as a function of $\\omega$; $\\pi\\delta(\\omega_s-\\omega_0)$ would be a constant and would locate nothing.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'Nothing in the samples marks it', html:'The output is a clean cosine at the wrong frequency. The samples of $\\cos(\\omega_0t)$ and of $\\cos\\bigl((\\omega_s-\\omega_0)t\\bigr)$ are the same numbers.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'The alias frequency', html:'In hertz the tone returns at $|f_0-kf_s|$, with the integer $k$ that brings it into $0\\le f\\le f_s/2$. It is the one line the filter keeps.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$f_s=6$ kHz. A tone at $f_0=5$ kHz is sampled and filtered.<div class="nsep"></div>Which tone comes out?',
        ask:{key:'m7-alias-cos-b', choices:['$1$ kHz','$5$ kHz','$11$ kHz'], answer:0,
          why:'$|5-6|=1$ kHz is the only line inside $|f|<3$ kHz.'}}]}
  ]}
]},

/* ------------------------------------------------ a rising tone, heard folding */
{ id:'m7-chirp', module:'M7', nav:'Hearing aliasing with a chirp', title:'Hearing Aliasing with a Chirp', src:'—',
  objective:'Hear a tone that rises steadily, sampled at a fixed rate, and see the heard pitch fold back at half the sampling rate.',
  keywords:'chirp sweep rising tone frequency at a moment 2000 t Hz 6 kHz sampled 4 kHz folding zig-zag heard pitch falls sound listen slider',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 7 · The alias frequency', src:'—'},
  {t:'title', text:'Hearing Aliasing with a Chirp'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'t', label:'$t$', min:0, max:3, step:0.05, v:1.5,
        show:v=>'$'+s4n(v,2)+'$ s · tone $'+s4n(2*v,1)+'$ kHz, heard $'+s4n(s4fold(2*v,4),1)+'$ kHz'}]},
      listen:{items:[
        {label:'Play $x(t)$', sound:()=>({f:s4chirp, dur:S4CD})},
        {label:'Play $x_r(t)$', sound:()=>({f:s4Recon(s4chirp,S4CFS,S4CD), dur:S4CD})}]},
      svg:v=>{
      /* t in s and f in kHz: the tone is at 2t kHz, heard at its fold */
      const t0=v?v.t:1.5, fa=t=>s4fold(2*t,4);
      const a=AX({xr:[0,3.1],yr:[0,8.2],xlabel:'t\\;[\\text{s}]',ylabel:'f\\;[\\text{kHz}]',yticksLeft:false,
        xticksOverride:[0,1,2,3],xtickfmt:v=>String(v),yticksOverride:[2,4,6],ytickfmt:v=>String(v)});
      a.rect(0,0,3.1,2,{fill:s2Wash(C.out,.13)});
      a.hline(2,{color:C.coral,width:1.6,dash:'6 4',opacity:1});
      a.hline(4,{color:C.muted,width:1.2,dash:'6 4',opacity:.9});
      a.note(2,2.45,'f_s/2',{anchor:'middle',color:C.coral,fs:15,tex:true});
      a.note(0.08,4.45,'f_s',{anchor:'start',color:C.muted,fs:15,tex:true});
      a.curve(t=>t<=3+1e-9 ? 2*t : NaN,{color:C.in,width:1.8,dash:'9 6',n:620});
      a.curve(t=>t<=3+1e-9 ? fa(t) : NaN,{color:C.err,width:2.6,n:1240});
      a.point(t0,2*t0,{color:C.in,r:6,ring:C.plate});
      a.point(t0,fa(t0),{color:C.err,r:6,ring:C.plate});
      return a.svg(); },
      caption:'The tone rises by $2$ kHz each second and is sampled at $f_s=4$ kHz. The red line is the pitch that comes out: it folds at $f_s/2$ and runs back down. The green band is what the filter keeps.'},
    {t:'legend', at:'tl', items:[['in','the tone, $f(t)$',true],['err','heard, from $x_r(t)$']]}
  ], right:[
    {t:'eq', label:'A tone that rises', tex:'\\begin{aligned}x(t)&=\\cos\\bigl(2\\pi\\cdot1000\\,t^{2}\\bigr)\\\\f(t)&=\\frac{1}{2\\pi}\\,\\frac{d}{dt}\\bigl(2\\pi\\cdot1000\\,t^{2}\\bigr)=2000\\,t\\ \\text{Hz}\\end{aligned}',
      note:'The frequency at a moment is the rate of change of the phase, divided by $2\\pi$. In $3$ s it rises from $0$ to $6$ kHz.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'What comes out', html:'Each moment follows the fold rule $|f-kf_s|$. The heard pitch rises to $2\\ \\text{kHz}$ at $t=1\\ \\text{s},$ falls to $0$ at $t=2\\ \\text{s},$ where $f=f_s$, and then rises again.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'The same chirp is sampled at $f_s=3$ kHz instead.<div class="nsep"></div>What pitch is heard at $t=2$ s?',
        ask:{key:'m7-chirp', choices:['$1$ kHz','$4$ kHz','$2$ kHz'], answer:0,
          why:'At $t=2$ s the tone is at $4$ kHz, and $|4-3|=1$ kHz lies inside $0$ to $1.5$ kHz.'}}]}
  ]}
]},

/* ------------------------------------------------------ the p.87 style example */
{ id:'m7-ex-alias', module:'M7', nav:'Worked example · three periods', title:'Aliasing at Three Sampling Periods', src:'p. 87',
  objective:'Test three sampling periods against the Nyquist rate of the signal actually being sampled.',
  keywords:'worked example cos(2 pi t) three periods verdict comparison bandwidth nyquist rate 4 pi alias cos(pi t)',
  slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 7 · Worked example', src:'p. 87'},
  {t:'title', text:'Aliasing at Three Sampling Periods'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$T_1=1/4$ s: $\\omega_s=8\\pi$ rad/s','$T_2=1/3$ s: $\\omega_s=6\\pi$ rad/s','$T_3=2/3$ s: $\\omega_s=3\\pi$ rad/s']},
      svg:v=>{
      /* the period grows from T1 to T2 to T3 as the frame runs; the red curve
         is the lowest-frequency cosine through the samples */
      const f=Math.max(0,Math.min(2,v?v.frame:0)), Ts=[1/4,1/3,2/3];
      const T = f<=1 ? Ts[0]+(Ts[1]-Ts[0])*f : Ts[1]+(Ts[2]-Ts[1])*(f-1), fr=s4fold(1,1/T);
      const a=AX({xr:[-0.05,3.05],yr:[-1.4,2.7],xlabel:'t\\;[\\text{s}]',ylabel:'x(t),\\;x_r(t)',
        yticksOverride:[-1,0,1],xticksOverride:[0,1,2,3]});
      a.curve(t=>Math.cos(2*PI*t),{color:C.in,width:1.5,dash:'5 5',n:2400});
      a.curve(t=>Math.cos(2*PI*fr*t),{color:C.err,width:2.4,n:2400});
      samp(t=>Math.cos(2*PI*t),T,-0.05,3.05).forEach(p=>a.point(p[0],p[1],{color:C.mid,r:5}));
      return a.svg(); },
      caption:'The dots are the samples, and the red curve is what the filter returns. Press Next to lengthen $T$.'},
    {t:'legend', items:[['in','$x(t)=\\cos(2\\pi t)$',true],['err','$x_r(t)$'],['mid','$x(nT)$']]}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x(t)=\\cos(2\\pi t)$, $\\omega_M=2\\pi$ rad/s, sampled with $T_1=\\tfrac14$, $T_2=\\tfrac13$, $T_3=\\tfrac23$ s; $\\omega_c=\\omega_s/2$.<div class="nsep"></div>Which periods recover $x(t)$?',
      ask:{key:'m7-ex-alias', choices:['all three','$T_1$ and $T_2$','$T_1$ only'], answer:1}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'<ol class="steps"><li>Compute $\\omega_s=2\\pi/T$.</li><li>Compare it with the Nyquist rate $2\\omega_M=4\\pi$ rad/s.</li><li>If it fails, find the line inside $|\\omega|<\\omega_s/2$.</li></ol>'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', label:'Solution', tex:'\\begin{aligned}T_1=\\tfrac14:&\\;\\;\\omega_s=8\\pi>4\\pi\\;\\checkmark,&&\\omega_c=4\\pi,&&x_r(t)=\\cos(2\\pi t)\\\\T_2=\\tfrac13:&\\;\\;\\omega_s=6\\pi>4\\pi\\;\\checkmark,&&\\omega_c=3\\pi,&&x_r(t)=\\cos(2\\pi t)\\\\T_3=\\tfrac23:&\\;\\;\\omega_s=3\\pi<4\\pi\\;\\times,&&\\omega_c=1.5\\pi,&&x_r(t)=\\cos(\\pi t)\\end{aligned}'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'Common error', html:'Using another signal’s Nyquist rate. Against $6\\pi$, row two becomes the boundary $6\\pi\\ge6\\pi$, which the theorem excludes.'}]}
  ]}
]},

{ id:'m7-ex-alias-b', module:'M7', nav:'Three periods · the alias', title:'The Alias at $T_3=2/3$ s', src:'p. 87',
  objective:'Locate the surviving line at the undersampled period and check it against the samples.',
  keywords:'alias line omega_s minus omega_0 pi inside cutoff 1.5 pi check samples cos(4 pi n/3) cos(2 pi n/3) same numbers',
  slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 7 · Worked example', src:'p. 87'},
  {t:'title', text:'The Alias at $T_3=2/3$ s'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const span=5.5*PI;
      const a=AXW(-span,span,PI,{yr:[-0.3,2.4],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X_p(j\\omega)',yticksOverride:[]});
      s4lines(a, 3*PI, [2*PI], span);
      return a.svg(); },
      caption:'The lines after sampling at $T_3$, with $\\omega_s=3\\pi$ rad/s. Only the pair at $\\pm\\pi$ lies inside the filter, and it comes from the copies. Grey lines are rejected.'},
    {t:'legend', items:[['err','kept, from a copy'],['h','filter, $|\\omega|<1.5\\pi$',true]]}
  ], right:[
    {t:'eq', label:'The alias', tex:'\\omega_s-\\omega_0=3\\pi-2\\pi=\\pi<\\omega_c=1.5\\pi',
      note:'The baseband line at $2\\pi$ is removed; the copy line is kept.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Check · the samples agree', tex:'\\begin{aligned}\\cos(2\\pi nT_3)&=\\cos\\bigl(\\tfrac{4\\pi n}{3}\\bigr)=\\cos\\bigl(2\\pi n-\\tfrac{2\\pi n}{3}\\bigr)\\\\&=\\cos\\bigl(\\tfrac{2\\pi n}{3}\\bigr)=\\cos(\\pi nT_3)\\end{aligned}',
        note:'$2\\pi n$ is whole turns; the cosine is even.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'What the samples cannot tell', html:'The samples of $\\cos(2\\pi t)$ and $\\cos(\\pi t)$ are the same numbers. The filter returns the lower one.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$\\cos(2\\pi t)$ is sampled with $T=0.8$ s, so $\\omega_s=2.5\\pi$ rad/s.<div class="nsep"></div>What does the filter return?',
        ask:{key:'m7-ex-alias-b', choices:['$\\cos(0.5\\pi t)$','$\\cos(2\\pi t)$','$\\cos(4.5\\pi t)$'], answer:0,
          why:'$2\\pi$ lies outside $\\omega_c=1.25\\pi$; the copy line at $2.5\\pi-2\\pi=0.5\\pi$ lies inside.'}}]}
  ]}
]},

/* ------------------------------------------------------------ two components */
{ id:'m7-hw-alias', module:'M7', nav:'Worked example · partial aliasing', title:'Partial Aliasing of Two Cosines', src:'p. 87',
  objective:'Sample a two-component signal below its Nyquist rate and identify both surviving lines.',
  keywords:'two components cos(pi t) cos(3 pi t) T = 2/5 omega_s 5 pi cutoff 2.5 pi baseband copy lines alias 2 pi frames',
  slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 7 · Worked example', src:'p. 87'},
  {t:'title', text:'Partial Aliasing of Two Cosines'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$X(j\\omega)$: lines at $\\pm\\pi$ and $\\pm3\\pi$','sampling at $\\omega_s=5\\pi$ adds the copies','the filter keeps $|\\omega|<2.5\\pi$']},
      svg:v=>{
      const f=Math.max(0,Math.min(2,v?v.frame:0)), ws=5*PI, span=5.5*PI;
      const a=AXW(-span,span,PI,{yr:[-0.3,2.9],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X_p(j\\omega)',yticksOverride:[]});
      fade(a,1-cl(f-1),()=>s4lines(a,ws,[PI,3*PI],span,{pre:true,copies:cl(f),box:0}));
      fade(a,cl(f-1),()=>s4lines(a,ws,[PI,3*PI],span));
      return a.svg(); },
      caption:'The two cosines are sampled at $T=2/5$ s. Press Next to add the copies, then the filter. Grey lines are rejected.'},
    {t:'legend', items:[['in','$X(j\\omega)$'],['mid','copies'],['err','kept copy'],['h','filter',true]]}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x(t)=\\cos(\\pi t)+\\cos(3\\pi t)$, so $\\omega_M=3\\pi$ and the Nyquist rate is $6\\pi$ rad/s. It is sampled at $T=2/5$ s.<div class="nsep"></div>Which frequencies does $x_r(t)$ contain?',
      ask:{key:'m7-hw-alias', choices:['$\\pi$ and $3\\pi$','$\\pi$ and $2\\pi$','$\\pi$ only'], answer:1}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'<ol class="steps"><li>$\\omega_s=2\\pi/T=5\\pi<6\\pi$, so aliasing occurs.</li><li>The cutoff is $\\omega_c=\\omega_s/2=2.5\\pi$.</li><li>List the lines inside $|\\omega|<2.5\\pi$.</li></ol>'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Which lines survive', html:'<div class="cmp"><div><span class="cmp-h">Baseband</span>$\\pi$ is inside and kept. $3\\pi$ is outside and removed.</div><div><span class="cmp-h">Copies</span>$\\omega_s-3\\pi=2\\pi$ is inside and kept. $\\omega_s-\\pi=4\\pi$ is removed.</div></div>'}]},
    {t:'reveal', at:3, items:[
      {t:'eq', label:'Solution · recovered spectrum', tex:'\\begin{aligned}X_r(j\\omega)={}&\\pi\\bigl[\\delta(\\omega-\\pi)+\\delta(\\omega+\\pi)\\bigr]\\\\&+\\pi\\bigl[\\delta(\\omega-2\\pi)+\\delta(\\omega+2\\pi)\\bigr]\\end{aligned}'}]}
  ]}
]},

{ id:'m7-hw-alias-b', module:'M7', nav:'Partial aliasing · the recovered signal', title:'Recovered Signal of Two Cosines', src:'p. 87',
  objective:'Invert the recovered spectrum, check it against the samples, and name which component moved.',
  keywords:'inverse transform x_r(t) cos(pi t) + cos(2 pi t) check samples cos(6 pi n/5) cos(4 pi n/5) identify each component',
  slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 7 · Worked example', src:'p. 87'},
  {t:'title', text:'Recovered Signal of Two Cosines'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$x(t)$ and its samples, $T=2/5$ s','$x_r(t)$ through the same samples']},
      svg:v=>{
      const f=cl(v?v.frame:0);
      const a=AX({xr:[-0.05,4.05],yr:[-2.4,3.9],xlabel:'t\\;[\\text{s}]',ylabel:'x(t),\\;x_r(t)',
        yticksOverride:[-2,0,2],xticksOverride:[0,1,2,3,4]});
      a.curve(t=>Math.cos(PI*t)+Math.cos(3*PI*t),{color:C.in,width:1.6,dash:'5 5',n:2600});
      fade(a,f,()=>a.curve(t=>Math.cos(PI*t)+Math.cos(2*PI*t),{color:C.err,width:2.4,n:2600}));
      samp(t=>Math.cos(PI*t)+Math.cos(3*PI*t),0.4,-0.05,4.05).forEach(p=>a.point(p[0],p[1],{color:C.mid,r:5}));
      return a.svg(); },
      caption:'Press Next: the red $x_r(t)$, what the filter returns, passes through the same samples.'},
    {t:'legend', items:[['in','$x(t)$',true],['err','$x_r(t)$'],['mid','$x(nT)$']]}
  ], right:[
    {t:'eq', key:true, label:'Recovered signal', tex:'X_r(j\\omega)\\;\\xrightarrow{\\ \\mathcal{F}^{-1}\\ }\\;x_r(t)=\\cos(\\pi t)+\\cos(2\\pi t)',
      note:'Inverse transform: each pair $\\pi[\\delta(\\omega-a)+\\delta(\\omega+a)]$ returns $\\cos(at)$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Check · samples at $T=2/5$ s', tex:'\\begin{aligned}\\cos(3\\pi nT)&=\\cos\\bigl(\\tfrac{6\\pi n}{5}\\bigr)=\\cos\\bigl(2\\pi n-\\tfrac{4\\pi n}{5}\\bigr)\\\\&=\\cos\\bigl(\\tfrac{4\\pi n}{5}\\bigr)=\\cos(2\\pi nT)\\end{aligned}'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Common error', html:'Saying only that aliasing occurred. $\\cos(\\pi t)$ keeps its frequency; $\\cos(3\\pi t)$ returns at $\\omega_s-3\\pi=2\\pi$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'Now $T=1/2$ s, so $\\omega_s=4\\pi$ rad/s.<div class="nsep"></div>What does the filter return?',
        ask:{key:'m7-hw-alias-b', choices:['$2\\cos(\\pi t)$','$\\cos(\\pi t)+\\cos(2\\pi t)$','$\\cos(\\pi t)$'], answer:0,
          why:'The copy line at $4\\pi-3\\pi=\\pi$ lands on the kept line at $\\pi$, so the two add.'}}]}
  ]}
]},

/* ---------------------------------------------------------- anti-aliasing */
{ id:'m7-antialias', module:'M7', nav:'The anti-aliasing filter', title:'Anti-Aliasing Filtering', src:'p. 88',
  objective:'Place the anti-aliasing filter before the sampler and see, as its cutoff moves, that ω_s/2 gives the smallest error.',
  keywords:'anti aliasing filter before sampler order chain cutoff slider error energy halves not band-limited triangle spectrum',
  slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 7 · Design', src:'p. 88'},
  {t:'title', text:'Anti-Aliasing Filtering'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'wa', label:'$\\omega_a$', min:1, max:3, step:0.1, v:3, show:v=>'$'+s4n(v,1)+'\\pi$'}]},
      svg:v=>{
      /* X reaches 3 pi, past ws/2 = 2 pi; H_AA keeps |w| < wa */
      const wa=(v?v.wa:3)*PI, span=6.5*PI;
      const a=AXW(-span,span,2*PI,{yr:[-0.1,2.3],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'\\text{spectra}',yticksOverride:[0,1]});
      /* the error: between X and X_r, red */
      const pts=[]; for(let i=0;i<=900;i++){ const w=-s4AAB+2*s4AAB*i/900; pts.push([w,s4X(w)]); }
      for(let i=900;i>=0;i--){ const w=-s4AAB+2*s4AAB*i/900; pts.push([w,s4Xr(w,wa)]); }
      a.raw(`<path d="M${pts.map(p=>a.sx(p[0]).toFixed(2)+','+a.sy(p[1]).toFixed(2)).join('L')}Z" fill="${C.err}" fill-opacity=".30" stroke="none"/>`);
      for(const k of [-1,1]) a.curve(w=>{ const y=s4Y(w-k*s4AAWS,wa); return y>0 ? y : NaN; },{color:C.mid,width:1.6,n:1800});
      a.curve(s4X,{color:C.in,width:1.8,dash:'7 6',n:1800});
      a.curve(w=>Math.abs(w)<s4AAWS/2 ? s4Xr(w,wa) : NaN,{color:C.out,width:2.4,n:1800});
      a.rect(-wa,0,wa,1.2,{stroke:C.h,dash:'6 4',width:1.6});
      a.note(-span+0.3*PI,1.95,'\\text{error energy}\\;'+s4Err(wa).toFixed(3),{tex:true,anchor:'start',color:C.err,fs:15});
      return a.svg(); },
      caption:'$X(j\\omega)$ reaches $3\\pi$, past $\\omega_s/2=2\\pi$ for $\\omega_s=4\\pi$. Move the cutoff $\\omega_a$ of $H_{AA}$. Red marks the error.'},
    {t:'legend', items:[['in','$X(j\\omega)$',true],['mid','copies'],['out','$X_r(j\\omega)$'],['h','$H_{AA}(j\\omega)$',true]]}
  ], right:[
    {t:'eq', label:'The chain', tex:'x(t)\\to\\boxed{H_{AA}(j\\omega)}\\to\\boxed{\\text{sampler}}\\to\\boxed{H_r(j\\omega)}\\to x_r(t)',
      note:'$H_{AA}$ removes everything above $\\omega_s/2$ before the sampler. No real signal is strictly band-limited.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'err', head:'Place the filter before the sampler', html:'After sampling, a folded frequency sits on wanted content. No later filter can separate them.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'What the filter buys', html:'Move $\\omega_a$ from $3\\pi$ to $2\\pi$: the folded part goes, and the error energy halves.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The same signal and rate. The cutoff of $H_{AA}$ is set to $\\omega_a=\\pi$.<div class="nsep"></div>Compared with $\\omega_a=2\\pi$, the error energy is',
        ask:{key:'m7-antialias', choices:['larger','smaller','the same'], answer:0,
          why:'A cutoff below $\\omega_s/2$ also removes wanted content, and there was no folded part left to remove.'}}]}
  ]}
]},

{ id:'m7-antialias-b', module:'M7', nav:'Anti-aliasing · two cosines', title:'Anti-Aliasing for Two Cosines', src:'p. 88',
  objective:'Compare the mean-square error with and without the anti-aliasing filter for the two-cosine signal.',
  keywords:'error signal mean square error one period 2 s cross term product to sum filtered first halves 1 1/2',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 7 · Design', src:'p. 88'},
  {t:'title', text:'Anti-Aliasing for Two Cosines'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=AX({xr:[-0.05,4.05],yr:[-2.3,4.0],xlabel:'t\\;[\\text{s}]',ylabel:'e(t)',
        yticksOverride:[-2,-1,0,1,2],xticksOverride:[0,1,2,3,4]});
      a.curve(t=>Math.cos(3*PI*t)-Math.cos(2*PI*t),{color:C.err,width:2.4,n:2600});
      a.curve(t=>Math.cos(3*PI*t),{color:C.out,width:2.2,n:2600});
      return a.svg(); },
      caption:'The two errors $e(t)=x(t)-x_r(t)$. Both repeat every $2$ s.'},
    {t:'legend', items:[['err','no filter'],['out','filtered first']]}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$\\cos(\\pi t)+\\cos(3\\pi t)$ at $T=2/5$ s; a low-pass at $2.5\\pi$ rad/s may come first.<div class="nsep"></div>With the filter, the mean-square error',
      ask:{key:'m7-antialias-b', choices:['halves','doubles','does not change'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'The two errors', html:'<div class="cmp"><div><span class="cmp-h">No filter</span>$3\\pi$ returns at $2\\pi$: $e=\\cos3\\pi t-\\cos2\\pi t$.</div><div><span class="cmp-h">Filtered first</span>$\\cos(\\pi t)$ returns exactly: $e=\\cos3\\pi t$.</div></div>'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', label:'Solution · mean-square error over $2$ s', tex:'\\begin{aligned}\\overline{e^{2}}\\big|_{\\text{no filter}}&=\\overline{\\cos^{2}3\\pi t}+\\overline{\\cos^{2}2\\pi t}-\\overline{\\cos\\pi t+\\cos5\\pi t}\\\\&=\\tfrac12+\\tfrac12-0=1\\\\\\overline{e^{2}}\\big|_{\\text{filtered}}&=\\overline{\\cos^{2}3\\pi t}=\\tfrac12\\end{aligned}',
        note:'$2\\cos A\\cos B=\\cos(A-B)+\\cos(A+B)$; whole cycles average to $0$.'}]}
  ]}
]},

/* -------------------------------------------- the transition band, 44.1 kHz */
{ id:'m7-aa-band', module:'M7', nav:'Why 44.1 kHz', title:'Why 44.1 kHz', src:'—',
  objective:'Find the lowest sampling rate a real anti-aliasing filter allows from the width of its transition band.',
  keywords:'44.1 kHz CD audio hearing 20 kHz transition band real anti-aliasing filter stop level copy overlap minimum rate 40 + 2 Delta slider',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 7 · Design', src:'—'},
  {t:'title', text:'Why 44.1 kHz'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'D', label:'$\\Delta$', min:0, max:5, step:0.05, v:2.05,
        show:v=>'$'+s4n(v,2)+'$ kHz · needs $f_s\\ge'+s4n(40+2*v,2)+'$ kHz'}]},
      svg:v=>{
      /* f in kHz; the copies are those of the CD rate, fs = 44.1 kHz */
      const D=v?v.D:2.05, fs=44.1, lo=fs-20-D, hi=20+D;
      const a=AX({xr:[-26,54],yr:[-0.12,2.1],xlabel:'f\\;[\\text{kHz}]',ylabel:'\\text{spectrum}',
        xticksOverride:[-20,0,20,44.1],xtickfmt:v=>String(v),yticksOverride:[1],ytickfmt:v=>String(v)});
      /* the baseband and the copy at fs overlap on lo < |f| < hi */
      if(hi-lo > 1e-9) for(const s of [1,-1])
        a.area(f=>s4AAf(f,D)+s4AAf(f-s*fs,D), s>0?lo:-hi, s>0?hi:-lo, {color:s2Wash(C.err,.24),n:80});
      for(let k=-1;k<=1;k++) a.poly(s4Trap(k*fs,D),{color:k ? C.mid : C.in});
      if(hi-lo > 1e-9) a.curve(f=>Math.abs(f)>lo && Math.abs(f)<hi ? s4AAf(f,D)+s4AAf(f-Math.sign(f)*fs,D) : NaN,{color:C.err,width:2.6,n:1600});
      a.vline(fs/2,{color:C.coral,width:1.6,dash:'5 4',opacity:1});
      a.note(fs/2,1.3,'f_s/2',{anchor:'start',dx:8,color:C.coral,fs:15,tex:true});
      return a.svg(); },
      caption:'A flat input after $H_{AA}$, with its copies at the CD rate $f_s=44.1$ kHz. The filter falls to its stop level over $\\Delta$. Move $\\Delta$ past $2.05$ kHz and the copies overlap.'},
    {t:'legend', at:'tl', items:[['in','after $H_{AA}$'],['mid','copies'],['err','overlap']]}
  ], right:[
    {t:'note', kind:'def', head:'A real filter', html:'Hearing ends near $20$ kHz, so $H_{AA}$ passes $0$ to $20$ kHz. A real filter cannot drop at once: it needs a width $\\Delta$ to fall to its stop level at $20+\\Delta$ kHz.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, label:'The copy starts where the filter has stopped', tex:'\\begin{aligned}f_s-(20+\\Delta)&\\ge20+\\Delta\\\\\\Longrightarrow\\;f_s&\\ge2(20+\\Delta)=40+2\\Delta\\ \\text{kHz}\\end{aligned}',
        note:'The copy at $f_s$ begins to rise at $f_s-(20+\\Delta)$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'A cheaper filter needs $\\Delta=3$ kHz to reach its stop level.<div class="nsep"></div>What is the lowest rate it allows?',
        ask:{key:'m7-aa-band', choices:['$46$ kHz','$43$ kHz','$44.1$ kHz'], answer:0,
          why:'$f_s\\ge2(20+3)=46$ kHz; at $44.1$ kHz its copies would overlap.'}}]}
  ]}
]},

{ id:'m7-aa-band-b', module:'M7', nav:'Why 44.1 kHz · three rates', title:'The Transition Band of Three Rates', src:'—',
  objective:'Read the transition width that 40, 44.1 and 48 kHz leave a real anti-aliasing filter.',
  keywords:'40 kHz 44.1 kHz CD 48 kHz film video transition width 2.05 kHz 22.05 kHz 4 kHz ideal filter telephone 8 kHz 3.4 kHz frames',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 7 · Design', src:'—'},
  {t:'title', text:'The Transition Band of Three Rates'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$40$ kHz: $\\Delta=0$','$44.1$ kHz, the CD: $\\Delta=2.05$ kHz','$48$ kHz: $\\Delta=4$ kHz']},
      svg:v=>{
      const f=Math.max(0,Math.min(2,v?v.frame:0)), D=f<=1 ? 2.05*f : 2.05+1.95*(f-1);
      const a=AX({xr:[0,5.25],yr:[38,51.5],xlabel:'\\Delta\\;[\\text{kHz}]',ylabel:'\\text{lowest}\\ f_s\\;[\\text{kHz}]',yticksLeft:false,
        xticksOverride:[0,1,2,3,4,5],xtickfmt:v=>String(v),yticksOverride:[40,44.1,48],ytickfmt:v=>String(v)});
      [40,44.1,48].forEach(r=>a.hline(r,{color:r===44.1 ? C.coral : C.muted,width:1.3,dash:'6 4',opacity:.9}));
      a.note(0.12,44.1,'\\text{CD}',{anchor:'start',dy:-12,color:C.coral,fs:15,tex:true});
      a.curve(d=>40+2*d,{color:C.in,n:200});
      a.poly([[D,38],[D,40+2*D]],{color:C.coral,width:1.4});
      a.point(D,40+2*D,{color:C.coral,r:6.5,ring:C.plate});
      return a.svg(); },
      caption:'The lowest rate $f_s=40+2\\Delta$ kHz for each transition width $\\Delta$. Press Next to move from $40$ to $44.1$ to $48$ kHz.'},
  ], right:[
    {t:'eq', label:'The width a rate leaves', tex:'\\begin{aligned}\\Delta&=\\tfrac{f_s}{2}-20\\\\f_s=44.1:\\;\\;\\Delta&=22.05-20=2.05\\ \\text{kHz}\\\\f_s=48:\\;\\;\\Delta&=24-20=4\\ \\text{kHz}\\end{aligned}',
      note:'Solve $f_s=2(20+\\Delta)$ for $\\Delta$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'Three rates in use', html:'$40$ kHz would need $\\Delta=0$, a filter no circuit can build. The CD’s $44.1$ kHz leaves $2.05$ kHz, from $20$ to $22.05$ kHz. The $48$ kHz of film and video sound leaves $4$ kHz.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'A telephone line keeps speech up to $3.4$ kHz and samples at $8$ kHz.<div class="nsep"></div>How wide may its filter’s transition band be?',
        ask:{key:'m7-aa-band-b', choices:['$0.6$ kHz','$4.6$ kHz','$1.2$ kHz'], answer:0,
          why:'$\\Delta=\\tfrac{8}{2}-3.4=0.6$ kHz.'}}]}
  ]}
]},

/* --------------------------------------------------------- temporal aliasing */
{ id:'m7-temporal', module:'M7', nav:'Aliasing in time', title:'A Wheel That Turns Backwards', src:'p. 88',
  objective:'Apply the alias rule to a rotating spoke observed frame by frame, including the direction of rotation.',
  keywords:'temporal aliasing wagon wheel stroboscopic frames per second backwards rotation complex exponential negative frequency frames',
  slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 7 · Aliasing outside a circuit', src:'p. 88'},
  {t:'title', text:'A Wheel That Turns Backwards'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['frame $0$: the spoke at the top'].concat([1,2,3,4,5].map(n=>
        'frame $'+n+'$: $'+s4n(0.9*n,1)+'$ '+(n===1?'turn':'turns')+' on, seen $'+s4n(0.1*n,1)+'$ back'))},
      svg:v=>{
      /* one scale on both axes; the wheel of radius 1 sits in the middle */
      const f=Math.max(0,Math.min(5,v?v.frame:0)), H=P.hOverride||380; P.hOverride=null;
      const base={h:H,pad:{l:14,r:14,t:14,b:14},grid:false,zeroAxes:false,arrows:false,xticksOverride:[],yticksOverride:[],yticksLeft:false};
      const a0=AX(Object.assign({xr:[-1,1],yr:[-1,1]},base));
      const dw=a0.x1-a0.x0, dh=a0.y0-a0.y1, s=dh/2.9;
      const a=AX(Object.assign({h:H,xr:[-dw/2/s,dw/2/s],yr:[-dh/2/s,dh/2/s]},base));
      const R=a.sx(1)-a.sx(0), cx=a.sx(0), cy=a.sy(0), P2=(r,t)=>[r*Math.cos(t),r*Math.sin(t)];
      a.raw(`<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${R.toFixed(2)}" fill="none" stroke="${C.axis}" stroke-width="3"/>`);
      a.raw(`<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${(0.07*R).toFixed(2)}" fill="${C.axis}"/>`);
      const n=Math.floor(f+1e-6), th=PI/2+2*PI*(s4R/s4FS)*f, moving=f-n>0.02;
      /* the motion the film shows: 0.1 turn back per frame, in red */
      if(n>=1){ const arc=[]; for(let i=0;i<=60;i++) arc.push(P2(0.72,PI/2-2*PI*0.1*n*i/60));
        a.poly(arc,{color:C.err,width:2.6}); }
      /* while the spoke turns between frames, the true path, faint */
      if(moving){ const arc=[], t0=PI/2+2*PI*(s4R/s4FS)*n; for(let i=0;i<=80;i++) arc.push(P2(0.5,t0+(th-t0)*i/80));
        fade(a,0.55,()=>a.poly(arc,{color:C.in,width:1.8,dash:'5 4'})); }
      /* where each frame found the spoke */
      for(let k=0;k<=n;k++){ const t=PI/2-2*PI*0.1*k, q=P2(1,t);
        a.point(q[0],q[1],{color:C.mid,r:7});
        a.note(1.2*Math.cos(t),1.2*Math.sin(t),String(k),{tex:true,anchor:'middle',dy:5,color:C.muted,fs:15}); }
      const tip=P2(0.93,th);
      a.poly([[0,0],tip],{color:C.in,width:4});
      a.point(tip[0],tip[1],{color:C.in,r:6});
      return a.svg(); },
      caption:'The cyan spoke turns $0.9$ of a turn between frames. The violet dots mark where each frame finds it; the red arc is the motion the film shows.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'A marked spoke turns at $9$ revolutions per second. A camera records $10$ frames per second.<div class="nsep"></div>What does the recording show?',
      ask:{key:'m7-temporal', choices:['$9$ rev/s forward','$1$ rev/s forward','$1$ rev/s backwards'], answer:2}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'The tip of the spoke is $e^{j\\theta(t)}$ with $\\theta(t)=2\\pi(9)t$: one line at $\\omega_0=18\\pi$ rad/s. The camera samples at $f_s=10$ Hz, so $\\omega_s=20\\pi$ rad/s.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', label:'Solution', tex:'\\omega_s=20\\pi<2\\omega_0=36\\pi\\;\\Longrightarrow\\;\\omega_0-\\omega_s=-2\\pi\\ \\text{rad/s}',
        note:'The kept line is at $-2\\pi$ rad/s: $1$ revolution per second, and the minus sign means the other direction.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'Frame by frame', html:'Between frames the spoke turns $9/10$ of a turn. The eye reads that as $1/10$ of a turn backwards, because it takes the shorter way round.'}]}
  ]}
]},

{ id:'m7-temporal-b', module:'M7', nav:'Aliasing in time · the frame rate', title:'Frame Rate and Apparent Rotation', src:'p. 88',
  objective:'Change the frame rate of the camera and read the rotation the frames show.',
  keywords:'frame rate slider apparent rotation standing still stroboscope strobe lamp faster camera 20 frames per second check samples',
  slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 7 · Aliasing outside a circuit', src:'p. 88'},
  {t:'title', text:'Frame Rate and Apparent Rotation'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'fs', label:'$f_s$', min:5, max:30, step:0.5, v:10, show:v=>'$'+s4n(v,1)+'$ frames/s'}]},
      svg:v=>{
      const fs=v?v.fs:10, fa=s4fold(s4R,fs), sn=s4seen(s4R,fs), half=Math.abs(Math.abs(sn)-fs/2)<1e-9;
      const a=AX({xr:[-0.03,1.03],yr:[-1.4,2.8],xlabel:'t\\;[\\text{s}]',ylabel:'\\cos\\theta(t)',
        yticksOverride:[-1,0,1],xticksOverride:[0,0.25,0.5,0.75,1]});
      a.curve(t=>Math.cos(2*PI*s4R*t),{color:C.in,width:1.4,dash:'5 5',n:3000});
      a.curve(t=>Math.cos(2*PI*fa*t),{color:C.err,width:2.4,n:2000});
      samp(t=>Math.cos(2*PI*s4R*t),1/fs,-0.03,1.03).forEach(p=>a.point(p[0],p[1],{color:C.mid,r:5}));
      const txt = Math.abs(sn)<1e-9 ? '\\text{seen: standing still}'
        : '\\text{seen: }'+s4n(Math.abs(sn),2)+'\\;\\text{rev/s}'+(half?'\\text{, either way}':(sn<0?'\\text{, backwards}':'\\text{, forwards}'));
      a.note(0,2.2,txt,{tex:true,anchor:'start',dx:14,color:C.err,fs:15});
      return a.svg(); },
      caption:'The spoke turns $9$ times a second. Move the frame rate: at $9$ frames per second it stands still, and above $18$ it turns the right way.'},
    {t:'legend', items:[['in','$\\cos\\theta(t)$',true],['err','seen'],['mid','frames']]}
  ], right:[
    {t:'eq', label:'Check · the frames agree', tex:'\\cos\\bigl(18\\pi\\tfrac{n}{10}\\bigr)=\\cos\\bigl(2\\pi n-\\tfrac{2\\pi n}{10}\\bigr)=\\cos\\bigl(\\tfrac{2\\pi n}{10}\\bigr)',
      note:'This is the sequence a $1$ Hz rotation gives at $10$ frames per second.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'A faster camera', html:'At $20$ frames per second $\\omega_s=40\\pi>36\\pi$. The film shows $9$ rev/s in the right direction.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Nothing here is new', html:'A camera is a sampler with $T=1/f_s$, and a strobe lamp is the same device built from light. What is seen follows the rule of this module, applied to an angle.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'A fan turns at $25$ rev/s. A camera records $24$ frames per second.<div class="nsep"></div>What does the recording show?',
        ask:{key:'m7-temporal-b', choices:['$1$ rev/s forward','$1$ rev/s backwards','$25$ rev/s forward'], answer:0,
          why:'Each frame the fan turns $1\\tfrac{1}{24}$ turns, seen as $\\tfrac{1}{24}$ turn forward: $25-24=1$ rev/s.'}}]}
  ]}
]},

/* ---------------------------------------------------------- spatial aliasing */
{ id:'m7-spatial', module:'M7', nav:'Aliasing in space', title:'Spatial Aliasing', src:'p. 88',
  objective:'Apply the alias rule to a stripe pattern recorded on a regular grid of points.',
  keywords:'spatial aliasing stripes cycles per millimetre pixels grid 10 per mm recorded pattern 1 cycle/mm slider',
  slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 7 · Aliasing outside a circuit', src:'p. 88'},
  {t:'title', text:'Spatial Aliasing'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'fx', label:'$f_x$', min:1, max:19, step:0.5, v:9, show:v=>'$'+s4n(v,1)+'$ cycles/mm'}]},
      svg:v=>{
      /* 10 grid points per millimetre, over 2 mm */
      const fx=v?v.fx:9, fa=s4fold(fx,10), b=x=>0.5+0.5*Math.cos(2*PI*fx*x), br=x=>0.5+0.5*Math.cos(2*PI*fa*x);
      const pad={l:96,r:24,t:20,b:34}, xr=[-0.05,2.05];
      return s4Stack(400, 0.66, h=>{
        const a=AX({h,pad,xr,yr:[-0.15,2.05],xlabel:'x\\;[\\text{mm}]',ylabel:'\\text{brightness}',
          yticksOverride:[0,0.5,1],xticksOverride:[0,0.5,1,1.5,2]});
        a.curve(b,{color:C.in,width:1.3,n:4000});
        a.curve(br,{color:C.err,width:2.4,n:1500});
        samp(b,0.1,-0.05,2.05).forEach(p=>a.point(p[0],p[1],{color:C.mid,r:4.4}));
        a.note(0,1.62,'\\text{recorded: }'+s4n(fa,1)+'\\;\\text{'+(Math.abs(fa-1)<1e-9?'cycle':'cycles')+'/mm}',{tex:true,anchor:'start',dx:14,color:C.err,fs:15});
        return a.svg(); }, h=>{
        const a=AX({h,pad:{l:96,r:24,t:8,b:8},xr,yr:[0,1],grid:false,zeroAxes:false,arrows:false,xticksOverride:[],yticksOverride:[],yticksLeft:false});
        s4strip(a,b,-0.05,2.05,0.0035,0.55,0.95);
        s4strip(a,x=>b(0.1*Math.round(x/0.1)),-0.05,2.05,0.1,0.05,0.45);
        a.note(-0.05,0.75,'\\text{object}',{tex:true,anchor:'end',dx:-10,dy:4,color:C.muted,fs:14});
        a.note(-0.05,0.25,'\\text{pixels}',{tex:true,anchor:'end',dx:-10,dy:4,color:C.muted,fs:14});
        return a.svg(); }); },
      caption:'A grid of $10$ points per millimetre records stripes of $f_x$ cycles per millimetre. Below: the stripes and the pixels the grid keeps. Move $f_x$ past $5$.'},
    {t:'legend', items:[['in','the object'],['mid','grid points'],['err','recorded']]}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'Stripes of $9$ cycles per millimetre are recorded on a grid of $10$ points per millimetre.<div class="nsep"></div>What pattern does the grid record?',
      ask:{key:'m7-spatial', choices:['$9$ cycles/mm','$1$ cycle/mm','$19$ cycles/mm'], answer:1}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'Position takes the place of time. The pattern has $9$ cycles/mm and the grid takes $10$ samples/mm, so the same comparison applies with millimetres in place of seconds.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', label:'Solution', tex:'2\\times9=18>10\\;\\Longrightarrow\\;\\text{recorded at }|10-9|=1\\ \\text{cycle/mm}',
        note:'A fine pattern is recorded as a coarse one. The coarse bands are in the samples, not in the object.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'Why it looks real', html:'The bands are smooth and regular, and nothing marks them as false. The cure is the one used in time: blur the detail slightly before it is recorded, not after.'}]}
  ]}
]},

{ id:'m7-spatial-b', module:'M7', nav:'Aliasing in space · moiré', title:'Moiré: Two Patterns Overlaid', src:'p. 88',
  objective:'Compute the beat period of two overlaid stripe patterns and relate it to a pixel grid.',
  keywords:'moire beat two stripe patterns 1.0 mm 1.1 mm spatial frequencies difference 11 mm slider pixel grid photographed screen',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 7 · Aliasing outside a circuit', src:'p. 88'},
  {t:'title', text:'Moiré: Two Patterns Overlaid'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'p', label:'$p$', min:1.05, max:1.3, step:0.01, v:1.1, show:v=>'$'+s4n(v,2)+'$ mm'}]},
      svg:v=>{
      const p=v?v.p:1.1, Pb=p/(p-1);
      const a=AX({xr:[0,24],yr:[0,4.6],xlabel:'x\\;[\\text{mm}]',grid:false,yticksOverride:[],yticksLeft:false,
        xticksOverride:[0,4,8,12,16,20,24],pad:{l:104,r:24,t:20,b:34}});
      s4bars(a,1.0,0,24,2.75,3.55); s4bars(a,p,0,24,2.75,3.55);
      s4bars(a,1.0,0,24,1.55,2.35);
      s4bars(a,p,0,24,0.35,1.15);
      if(Pb<=24) a.span(0,Pb,3.9,'P='+s4n(Pb,1)+'\\;\\text{mm}',{tex:true,color:C.coral,fs:15});
      a.note(0,3.15,'\\text{both}',{tex:true,anchor:'end',dx:-12,dy:4,color:C.muted,fs:14});
      a.note(0,1.95,'1.0\\;\\text{mm}',{tex:true,anchor:'end',dx:-12,dy:4,color:C.muted,fs:14});
      a.note(0,0.75,s4n(p,2)+'\\;\\text{mm}',{tex:true,anchor:'end',dx:-12,dy:4,color:C.muted,fs:14});
      return a.svg(); },
      caption:'Stripes of period $1.0$ mm and of period $p$, alone and laid over each other. The overlay is dark where the bars disagree, and that repeats every $P$. Move $p$.'}
  ], right:[
    {t:'eq', key:true, label:'The beat period', tex:'\\begin{aligned}f_1&=\\tfrac{1}{1.0}=1.000,\\quad f_2=\\tfrac{1}{1.1}=0.909\\ \\text{cycles/mm}\\\\P&=\\frac{1}{f_1-f_2}=\\frac{1}{1-\\tfrac{1}{1.1}}=\\frac{1.1}{0.1}=11\\ \\text{mm}\\end{aligned}',
      note:'Two close spatial frequencies beat at their difference, as two close tones do.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'A grid is one of the two patterns', html:'Two regular patterns make a beat with no sampler at all. When an image is recorded, the pixel grid is one of them: that is the moiré on a photographed screen.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'Stripes of period $1.0$ mm lie over stripes of period $1.25$ mm.<div class="nsep"></div>How far apart are the dark bands of the beat?',
        ask:{key:'m7-spatial-b', choices:['$5$ mm','$0.25$ mm','$2.25$ mm'], answer:0,
          why:'$f_2=1/1.25=0.8$ cycle/mm, so $P=1/(1-0.8)=5$ mm.'}}]}
  ]}
]},

/* ============================================================ closing the section */
realGallery({ id:'m7-real-alias', nav:'Aliasing around us',
  title:'Aliasing Around Us', eyebrow:'Module 7 · Aliasing in practice', src:'pp. 86–88',
  objective:'Recognise everyday recordings in which a frequency above half the rate is reported as a lower one.',
  keywords:'examples car wheel video backwards striped shirt photo bands fluorescent lamp flicker 100 Hz 24 frames tone 7 kHz sampled 8 kHz alias',
  figs:[
    [()=>{ const a=P.Axes(EXO({xr:[-0.6,11.6],yr:[-0.2,3.4],xlabel:'n\\;(\\text{frame})',ylabel:'\\phi[n]\\;(\\text{rad})',xstep:2,yticksOverride:[0,1,2,3]}));
      /* the angle the frame shows, measured backwards from the start */
      a.stem(D(n=>{ const u=23*n/24; return -2*PI*(u-Math.floor(u+0.5)); },0,11),{color:C.in,r:3,showZero:true});
      return a.svg(); }, 'A wheel at $23$ turns/s, filmed at $24$ frames/s, slips back by $\\phi[n]=2\\pi n/24$ rad.'],
    [()=>{ const a=P.Axes(EXO({xr:[-0.03,2.03],yr:[-0.1,1.75],xlabel:'x\\;(\\text{cm})',ylabel:'b\\;(\\text{norm.})',xstep:0.5,yticksOverride:[0,0.5,1]}));
      a.curve(x=>0.5+0.5*Math.cos(2*PI*x),{color:C.err,width:2,dash:'7 5',n:1200});
      a.stem(D(n=>0.5+0.5*Math.cos(2*PI*9*n/10),0,20).map(p=>[p[0]/10,p[1]]),{color:C.in,r:3});
      return a.svg(); }, 'A shirt, $9$ stripes/cm, at $10$ pixels/cm: $b[n]=0.5+0.5\\cos(2\\pi\\cdot9n/10)$.',
      [['in','$b[n]$'],['err','bands seen',true]]],
    [()=>{ const a=P.Axes(EXO({xr:[-0.02,1.02],yr:[-0.1,1.75],xlabel:'t\\;(\\text{s})',ylabel:'\\ell\\;(\\text{norm.})',xstep:0.25,yticksOverride:[0,0.5,1]}));
      a.curve(t=>0.5-0.5*Math.cos(2*PI*4*t),{color:C.err,width:2,dash:'7 5',n:1200});
      a.stem(D(n=>0.5-0.5*Math.cos(2*PI*100*n/24),0,24).map(p=>[p[0]/24,p[1]]),{color:C.in,r:3});
      return a.svg(); }, 'A $100$ Hz lamp flicker at $24$ frames/s: $\\ell[n]=0.5-0.5\\cos(2\\pi\\cdot100\\,n/24)$.',
      [['in','$\\ell[n]$'],['err','$4$ Hz seen',true]]],
    [()=>{ const a=P.Axes(EXO({xr:[-0.05,2.05],yr:[-1.3,2.3],xlabel:'t\\;(\\text{ms})',ylabel:'v\\;(\\text{V})',xticksOverride:[0.25,0.75,1.25,1.75],yticksOverride:[-1,0,1]}));
      a.curve(t=>Math.cos(2*PI*t),{color:C.err,width:2,dash:'7 5',n:1200});
      a.stem(D(n=>Math.cos(2*PI*7*n/8),0,16).map(p=>[p[0]/8,p[1]]),{color:C.in,r:3,showZero:true});
      return a.svg(); }, 'A $7$ kHz tone at $8$ kHz: $v[n]=\\cos(2\\pi\\cdot7n/8)=\\cos(2\\pi n/8)$ V.',
      [['in','$v[n]$'],['err','$1$ kHz heard',true]]]
  ],
  notes:[
    {t:'note', kind:'def', head:'One rule', html:'Each record is sampled below twice its frequency, so $f$ is seen at $|f-kf_s|\\le f_s/2$: $1$ turn/s back, $1$ band/cm, $4$ Hz, $1$ kHz.'},
    {t:'note', kind:'warn', head:'Why this matters', html:'The false frequency looks as real as the true one. Only a faster rate, or a filter before the sampler, prevents it.'}
  ]}),

labScene({ id:'m7-lab-j4', lab:'J4', nav:'Folding of a Tone', title:'The Folding of a Sampled Tone', src:'pp. 86–88',
  objective:'Move a tone and the sampling rate, watch the tone fold into 0 to f_s/2, hear the tone and what comes out, and switch on an anti-aliasing filter.',
  keywords:'laboratory folding diagram apparent frequency alias tone kHz sampling rate anti-aliasing filter sound zig-zag' }),

codeScene({ id:'m7-code-alias', nav:'Aliasing in practice', title:'Aliasing in Code', src:'pp. 86–88', eyebrow:'Aliasing in practice in code',
  objective:'Compute alias frequencies, recovered lines, error powers and the apparent rotation of a wheel in MATLAB and in Python, and predict each result before running it.',
  keywords:'code matlab python alias frequency fold three periods two cosines anti-aliasing error wagon wheel run' }),

/* </m7-s4> */

/* <m7-s5> ============================================ 7.5 discrete-time processing of continuous-time signals */

/* ------------------------------------------------------------- the chain */
{ id:'m7-dtproc', module:'M7', nav:'The processing chain', title:'Processing a Signal as Numbers', src:'—',
  objective:'Follow a band-limited signal through a C/D converter, a discrete-time system and a D/C converter, and read its spectrum at each stage.',
  keywords:'discrete-time processing continuous-time signal C/D D/C converter chain x_d[n] = x_c(nT) spectrum stage rad/s rad/sample Omega notation frames',
  slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 7 · Discrete-time processing', src:'—'},
  {t:'title', text:'Processing a Signal as Numbers'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$X_c(j\\omega)$: the input, in rad/s','C/D samples: a copy every $\\omega_s$',
        'C/D renames the axis: $\\Omega=\\omega T$','$H_d(e^{j\\Omega})$ keeps $|\\Omega|<\\pi/4$','D/C keeps $|\\omega|<\\omega_s/2$: $Y_c(j\\omega)$']},
      svg:v=>{
      /* frame 0 the input; 1 the copies of the sampler; 2 the same drawing
         read in Omega; 3 the digital low-pass; 4 back in rad/s. Every
         spectrum is drawn at peak 1: the copies carry the factor 1/T, so
         the stages that hold them are drawn times T. */
      const f=Math.max(0,Math.min(4,v?v.frame:0)), u1=cl(f), u2=cl(f-1), u3=cl(f-2), u4=cl(f-3);
      const hM=WM*S5T, Wc=PI/4, dt=f>=1.5 && f<3.5;
      const stage = f<0.5 ? 0 : f<2.5 ? 1 : f<3.5 ? 2 : 3;
      const ylab = f<0.5 ? 'X_c(j\\omega)' : f<1.5 ? 'T\\,X_p(j\\omega)' : f<2.5 ? 'T\\,X_d(e^{j\\Omega})' : f<3.5 ? 'T\\,Y_d(e^{j\\Omega})' : 'Y_c(j\\omega)';
      return s5Stack([390,400],[0.7,0.66], h=>{
        const a=AX({h,xr:[-3*PI,3*PI],yr:[-0.25,2.2],yticksOverride:[1],ytickfmt:()=>'1',
          xlabel: dt ? '\\Omega\\;[\\text{rad/sample}]' : '\\omega\\;[\\text{rad/s}]', ylabel:ylab,
          xticksOverride:wTicks(-3*PI,3*PI,PI), xtickfmt: dt ? piTick : s5wTick});
        /* the copies: in from frame 1, out again in frame 4 */
        fade(a,u1*(1-u4),()=>{ for(const k of [-1,1]) a.curve(W=>{ const y=s5Tri(W,2*PI*k,hM); return y>0?y:NaN; },{color:C.mid,n:1400,width:u3>0.02?1.5:2.2}); });
        a.curve(W=>{ const y=s5Tri(W,0,hM); return y>0?y:NaN; },{color:C.in,n:1400,width:u3>0.02?1.5:2.2,dash:u4>0.5?'6 5':null});
        fade(a,u2*(1-u4),()=>s5Period(a,1.4));
        /* the digital filter, periodic, and what it keeps */
        fade(a,u3*(1-u4),()=>{ for(const k of [-1,0,1]) a.rect(2*PI*k-Wc,0,2*PI*k+Wc,1,{stroke:C.h,dash:'6 4',width:1.8}); });
        fade(a,u3*(1-u4),()=>{ for(const k of [-1,1]) a.curve(W=>Math.abs(W-2*PI*k)<Wc ? s5Tri(W,2*PI*k,hM) : NaN,{color:C.out,width:3.2,n:1400}); });
        fade(a,u3,()=>a.curve(W=>Math.abs(W)<Wc ? s5Tri(W,0,hM) : NaN,{color:C.out,width:3.2,n:1400}));
        /* D/C: the band it keeps, |omega| < omega_s/2 */
        fade(a,u4,()=>{ a.vline(-PI,{color:C.muted}); a.vline(PI,{color:C.muted});
          a.note(-PI,1.4,'|\\omega|<\\omega_s/2',{tex:true,color:C.muted,fs:13,anchor:'end',dx:-8,dy:-3}); });
        return a.svg(); }, h=>s5Chain(h,stage)); },
      caption:'The running signal, $\\omega_M=2\\pi$ rad/s, with $T=0.25$ s and a digital low-pass. Each spectrum is drawn at peak $1$. Press Next.'},
    {t:'legend', items:[['in','$k=0$'],['mid','copies'],['h','$H_d(e^{j\\Omega})$',true],['out','kept']]}
  ], right:[
    {t:'note', kind:'def', head:'Two frequency variables', html:'<div class="cmp"><div><span class="cmp-h">Continuous time</span>$\\omega$ in rad/s, with $X_c(j\\omega)$.</div><div><span class="cmp-h">Discrete time</span>$\\Omega$ in rad/sample, with $X_d(e^{j\\Omega})=\\sum_n x_d[n]e^{-j\\Omega n}$.</div></div>'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'The two converters', tex:'x_d[n]=x_c(nT),\\qquad y_c(nT)=y_d[n]',
        note:'C/D keeps the samples. D/C rebuilds the band-limited signal through them, as in Section 7.3.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'One step does the work', html:'Only $H_d(e^{j\\Omega})$ changes the spectrum. The converters sample and rebuild.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$y_d[n]=x_d[n]$, a band-limited input and $\\omega_s>2\\omega_M$.<div class="nsep"></div>What is $y_c(t)$?',
        ask:{key:'m7-dtproc', choices:['$x_c(t)$','$x_c(t-T)$','$x_c(nT)$'], answer:0,
          why:'Sampling, then ideal reconstruction, returns $x_c(t)$.'}}]}
  ]}
]},

/* ------------------------------------------------------- the frequency map */
{ id:'m7-dtproc-map', module:'M7', nav:'From rad/s to rad/sample', title:'From Radians per Second to Radians per Sample', src:'—',
  objective:'See the frequency map Omega = omega T stretch the spectrum of the samples as T changes, with a copy every 2π.',
  keywords:'frequency map Omega = omega T rad/sample rad/s periodic 2 pi band edge Omega_M = omega_M T overlap slider sampling period',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 7 · Discrete-time processing', src:'—'},
  {t:'title', text:'From Radians per Second to Radians per Sample'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'T', label:'$T$', min:0.1, max:0.7, step:0.01, v:0.25, show:v=>'$'+v.toFixed(2)+'$ s'}]},
      svg:v=>{
      const T=v?v.T:0.25, hM=WM*T, ov=hM>PI+1e-9;
      const a=AX({xr:[-3*PI,3*PI],yr:[-0.25,2.2],yticksOverride:[1],ytickfmt:()=>'1',
        xlabel:'\\Omega\\;[\\text{rad/sample}]',ylabel:'T\\,X_d(e^{j\\Omega})',xticksOverride:wTicks(-3*PI,3*PI,PI),xtickfmt:piTick});
      for(let k=-3;k<=3;k++) a.curve(W=>{ const y=s5Tri(W,2*PI*k,hM); return y>0 && !s5Ov(W,hM) ? y : NaN; },{color:k?C.mid:C.in,n:1800});
      if(ov){ for(let k=-3;k<=3;k++) a.curve(W=>{ const y=s5Tri(W,2*PI*k,hM); return y>0 && s5Ov(W,hM) ? y : NaN; },{color:k?C.mid:C.in,n:1800,width:1.3,dash:'4 4'});
        a.curve(W=>s5Ov(W,hM) ? s5Sum(W,hM) : NaN,{color:C.err,n:2400,width:2.6}); }
      s5Period(a,1.35);
      a.note(-3*PI,1.85,'\\Omega_M=\\omega_MT='+s5n(2*T,2)+'\\pi',{tex:true,color:ov?C.err:C.muted,fs:15,anchor:'start',dx:14,dy:-3});
      return a.svg(); },
      caption:'The running signal, $\\omega_M=2\\pi$ rad/s, sampled every $T$ and drawn times $T$ against $\\Omega$. Move $T$ past $0.5$ s: $\\Omega_M$ passes $\\pi$.'},
    {t:'legend', items:[['in','copy $k=0$'],['mid','copies $k\\neq0$'],['err','overlap sum']]}
  ], right:[
    {t:'eq', label:'Frequency map', tex:'\\underbrace{\\Omega}_{\\text{rad/sample}}=\\underbrace{\\omega}_{\\text{rad/s}}\\;T',
      note:'$T$ is seconds per sample. So $\\omega_s=2\\pi/T$ lands on $\\Omega=2\\pi$, and $\\omega_s/2$ on $\\Omega=\\pi$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'The band edge', html:'$\\omega_M$ lands on $\\Omega_M=\\omega_MT$. The copies stay apart while $\\Omega_M<\\pi$, which is $\\omega_s>2\\omega_M$ again.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'The running signal, $\\omega_M=2\\pi$ rad/s, is sampled with $T=0.2$ s.<div class="nsep"></div>Where does its band edge land?',
        ask:{key:'m7-dtproc-map', choices:['$\\Omega_M=0.4\\pi$','$\\Omega_M=2\\pi$','$\\Omega_M=10\\pi$'], answer:0,
          why:'$\\Omega_M=\\omega_MT=2\\pi\\cdot0.2=0.4\\pi$.'}}]}
  ]}
]},

{ id:'m7-dtproc-map-b', module:'M7', nav:'The spectrum of the samples', title:'Spectrum of the Sequence of Samples', src:'—',
  objective:'Derive X_d(e^{jΩ}) from the transform of the impulse-train sampled signal by the change of variable ω = Ω/T.',
  keywords:'spectrum of x_d[n] X_d(e^{j Omega}) = X_p(j Omega/T) = (1/T) sum X_c(j(Omega - 2 pi k)/T) impulse train to sequence normalisation of time frames',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 7 · Discrete-time processing', src:'—'},
  {t:'title', text:'Spectrum of the Sequence of Samples'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$x_p(t)$: impulses every $T=0.25$ s','$x_d[n]$: the same weights, one per integer $n$']},
      svg:v=>{
      /* the t axis is relabelled n = t/T: the same heights, one step apart */
      const f=cl(v?v.frame:0), sq=f>=0.5;
      const a=AX({h:360,xr:[-2.2,2.2],yr:[-0.15,1.4],xlabel: sq ? 'n' : 't\\;[\\text{s}]', ylabel: sq ? 'x_d[n]' : 'x_p(t)',
        yticksOverride:[0.5,1],ytickfmt:v=>String(v),xticksOverride:[-2,-1,0,1,2].map(x=>x),
        xtickfmt: sq ? (x=>String(Math.round(x/S5T))) : (x=>String(x))});
      a.curve(xB,{color:C.in,width:1.3,dash:'4 5',n:1600});
      fade(a,1-f,()=>D(n=>xB(n*S5T),-8,8).forEach(([n,y])=>{ if(y>0.012) a.impulse(n*S5T,y,{color:C.mid,label:false}); }));
      fade(a,f,()=>a.stem(D(n=>xB(n*S5T),-8,8).map(([n,y])=>[n*S5T,Math.abs(y)<1e-9?0:y]),{color:C.mid,r:5}));
      return a.svg(); },
      caption:'The running signal $x_c(t)$ dashed. Press Next: the impulses become a sequence, and $t=nT$ becomes the integer $n$.'},
    {t:'legend', items:[['in','$x_c(t)$',true],['mid','$x_p(t)$, then $x_d[n]$']]}
  ], right:[
    {t:'eq', label:'Step 1 · Two sums', tex:'\\begin{aligned}X_p(j\\omega)&=\\sum_n x_c(nT)\\,e^{-j\\omega nT}\\\\X_d(e^{j\\Omega})&=\\sum_n x_c(nT)\\,e^{-j\\Omega n}\\end{aligned}',
      note:'$\\delta(t-nT)$ has transform $e^{-j\\omega nT}$; the second line is the DTFT of $x_d[n]$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, label:'Step 2 · Put $\\omega=\\Omega/T$', tex:'\\begin{aligned}X_d(e^{j\\Omega})&=X_p\\bigl(j\\tfrac{\\Omega}{T}\\bigr)=\\frac{1}{T}\\sum_k X_c\\Bigl(j\\bigl(\\tfrac{\\Omega}{T}-k\\omega_s\\bigr)\\Bigr)\\\\&=\\frac{1}{T}\\sum_k X_c\\Bigl(j\\,\\frac{\\Omega-2\\pi k}{T}\\Bigr)\\end{aligned}',
        note:'The sampled spectrum of Section 7.1, then $k\\omega_sT=2\\pi k$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'The same signal is sampled with $T=0.5$ s.<div class="nsep"></div>At which $\\Omega$ does the copy $k=1$ sit?',
        ask:{key:'m7-dtproc-map-b', choices:['$2\\pi$','$4\\pi$','$\\pi$'], answer:0,
          why:'$\\omega_sT=2\\pi$ for every $T$.'}}]}
  ]}
]},

/* ----------------------------------------------- the equivalent system */
{ id:'m7-dtproc-eq', module:'M7', nav:'The equivalent system', title:'The Equivalent Continuous-Time System', src:'—',
  objective:'Show that the chain acts on a band-limited input as one continuous-time LTI system, H_eff(jω) = H_d(e^{jωT}) inside the band.',
  keywords:'equivalent continuous-time system H_eff(j omega) = H_d(e^{j omega T}) band |omega| < omega_s/2 three-point average (1 + cos Omega)/2 time-invariant band-limited frames',
  slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 7 · Discrete-time processing', src:'—'},
  {t:'title', text:'The Equivalent Continuous-Time System'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$H_d(e^{j\\Omega})$: period $2\\pi$','rename the axis: $\\omega=\\Omega/T$','D/C keeps $|\\omega|<\\omega_s/2$: $H_{\\text{eff}}(j\\omega)$']},
      svg:v=>{
      const f=Math.max(0,Math.min(2,v?v.frame:0)), u2=cl(f-1), dt=f<0.5;
      const a=AX({h:350,xr:[-3*PI,3*PI],yr:[-0.25,1.75],yticksOverride:[0.5,1],ytickfmt:v=>String(v),
        xlabel: dt ? '\\Omega\\;[\\text{rad/sample}]' : '\\omega\\;[\\text{rad/s}]',
        ylabel: f<0.5 ? '|H_d(e^{j\\Omega})|' : f<1.5 ? '|H_d(e^{j\\omega T})|' : '|H_{\\text{eff}}(j\\omega)|',
        xticksOverride:wTicks(-3*PI,3*PI,PI), xtickfmt: dt ? piTick : s5wTick});
      /* inside the band the response stays; outside, it fades to a grey
         dashed trace, and H_eff is zero there */
      a.curve(W=>Math.abs(W)<=PI ? s5Avg(W) : NaN,{color:C.h,n:900});
      fade(a,1-u2,()=>a.curve(W=>Math.abs(W)>=PI ? s5Avg(W) : NaN,{color:C.h,n:1800}));
      fade(a,u2,()=>{ a.curve(W=>Math.abs(W)>=PI ? s5Avg(W) : NaN,{color:C.muted,n:1800,width:1.3,dash:'4 4'});
        a.poly([[-3*PI,0],[-PI,0]],{color:C.h}); a.poly([[PI,0],[3*PI,0]],{color:C.h}); });
      fade(a,1-u2,()=>s5Period(a,1.35));
      fade(a,u2,()=>s5Period(a,1.35,'|\\omega|<\\omega_s/2=4\\pi'));
      return a.svg(); },
      caption:'The three-point average $y_d[n]=\\tfrac14x_d[n+1]+\\tfrac12x_d[n]+\\tfrac14x_d[n-1]$ has $H_d(e^{j\\Omega})=\\tfrac12(1+\\cos\\Omega)$. Here $T=0.25$ s. Press Next.'}
  ], right:[
    {t:'eq', key:true, result:true, label:'Key result · Equivalent system', tex:'H_{\\text{eff}}(j\\omega)=\\begin{cases}H_d\\bigl(e^{j\\omega T}\\bigr),&|\\omega|<\\omega_s/2\\\\0,&|\\omega|>\\omega_s/2\\end{cases}',
      note:'For every input with $X_c(j\\omega)=0$ at $|\\omega|>\\omega_s/2$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Why · follow the band', tex:'\\begin{aligned}Y_c(j\\omega)&=T\\,Y_d(e^{j\\omega T})=T\\,H_d(e^{j\\omega T})\\,X_d(e^{j\\omega T})\\\\&=T\\,H_d(e^{j\\omega T})\\cdot\\tfrac{1}{T}X_c(j\\omega)=H_d(e^{j\\omega T})\\,X_c(j\\omega)\\end{aligned}',
        note:'D/C has gain $T$ and keeps $|\\omega|<\\omega_s/2$, where only the copy $k=0$ lies.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Only for band-limited inputs', html:'Otherwise the chain is not even time-invariant: a short pulse may fall between two samples.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The same average, $T=0.25$ s, so $\\omega_s/2=4\\pi$ rad/s.<div class="nsep"></div>What is $|H_{\\text{eff}}(j\\omega)|$ at $\\omega=6\\pi$ rad/s?',
        ask:{key:'m7-dtproc-eq', choices:['$0$','$0.5$','$1$'], answer:0,
          why:'$6\\pi>\\omega_s/2=4\\pi$: D/C removes it.'}}]}
  ]}
]},

{ id:'m7-dtproc-eq-b', module:'M7', nav:'A digital cutoff in hertz', title:'A Digital Cutoff in Hertz', src:'—',
  objective:'Map the cutoff of a digital low-pass filter to hertz and see it move with the sampling rate.',
  keywords:'digital low-pass cutoff Omega_c = pi/4 equivalent cutoff omega_c = Omega_c / T f_c = Omega_c f_s / 2 pi hertz sampling rate slider 8 kHz 44.1 kHz',
  slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 7 · Discrete-time processing', src:'—'},
  {t:'title', text:'A Digital Cutoff in Hertz'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'fs', label:'$f_s$', min:4, max:48, step:0.5, v:8, show:v=>'$'+s5n(v,1)+'$ kHz'}]},
      svg:v=>{
      /* f in kHz; the digital filter keeps |Omega| < pi/4, so f_c = f_s/8 */
      const fs=v?v.fs:8, fc=fs/8, F=26;
      const a=AX({xr:[-F,F],yr:[-0.2,1.75],yticksOverride:[1],ytickfmt:()=>'1',
        xlabel:'f\\;[\\text{kHz}]',ylabel:'|H_{\\text{eff}}(j2\\pi f)|',xticksOverride:[-24,-16,-8,0,8,16,24]});
      /* the copies of the digital filter that D/C removes, faint */
      for(let k=-8;k<=8;k++) if(k && Math.abs(k*fs)-fc < F) a.rect(k*fs-fc,0,k*fs+fc,1,{stroke:C.muted,dash:'4 4',width:1.2});
      /* the band D/C keeps, |f| < fs/2, marked by short dashes that stop
         below the note */
      for(const e of [-fs/2,fs/2]) if(Math.abs(e) < F) a.poly([[e,0],[e,1.2]],{color:C.muted,width:1.4,dash:'3 4'});
      a.poly([[-F,0],[-fc,0],[-fc,1],[fc,1],[fc,0],[F,0]],{color:C.h,width:2.6});
      a.note(-F,1.45,'f_c=f_s/8='+s5n(fc,3)+'\\;\\text{kHz}',{tex:true,anchor:'start',dx:14,color:C.coral,fs:15});
      return a.svg(); },
      caption:'A digital low-pass with $\\Omega_c=\\pi/4$, read in hertz. Grey: $\\pm f_s/2$ and the copies D/C removes. Move $f_s$.'}
  ], right:[
    {t:'eq', label:'The cutoff in rad/s and in Hz', tex:'\\omega_c=\\frac{\\Omega_c}{T}=\\Omega_c\\,f_s,\\qquad f_c=\\frac{\\omega_c}{2\\pi}=\\frac{\\Omega_c}{2\\pi}\\,f_s',
      note:'The filter stores only $\\Omega_c$. The sampling rate decides where it acts.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'Solution · $\\Omega_c=\\pi/4$', html:'At $f_s=8$ kHz, $\\omega_c=\\tfrac{\\pi}{4}\\cdot8000=2000\\pi$ rad/s and $f_c=1$ kHz. At $44.1$ kHz the same filter cuts at $5.5125$ kHz.<span class="val"><b>$f_c=f_s/8$</b><small>for $\\Omega_c=\\pi/4$</small></span>'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Same numbers, another filter', html:'A sound card that changes its rate moves every cutoff with it. A digital filter is designed for the rate it runs at.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'A digital low-pass keeps $|\\Omega|<\\pi/2$ and runs at $f_s=16$ kHz.<div class="nsep"></div>What is its cutoff in hertz?',
        ask:{key:'m7-dtproc-eq-b', choices:['$4$ kHz','$8$ kHz','$2$ kHz'], answer:0,
          why:'$f_c=\\tfrac{\\Omega_c}{2\\pi}f_s=\\tfrac14\\cdot16=4$ kHz.'}}]}
  ]}
]},

/* ------------------------------------------------ the digital differentiator */
{ id:'m7-diff', module:'M7', nav:'Digital differentiator', title:'Digital Differentiator', src:'—',
  objective:'Find the discrete-time filter that differentiates a band-limited signal and see its response repeat every 2π.',
  keywords:'digital differentiator band-limited H_eff = j omega H_d(e^{j Omega}) = j Omega / T ramp magnitude pi/T periodic repetition phase plus minus pi/2 frames',
  slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 7 · Discrete-time processing', src:'—'},
  {t:'title', text:'Digital Differentiator'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$|H_{\\text{eff}}(j\\omega)|=|\\omega|$ on $|\\omega|<\\omega_s/2$','rename the axis: $|H_d(e^{j\\Omega})|=|\\Omega|/T$','$H_d(e^{j\\Omega})$ repeats every $2\\pi$']},
      svg:v=>{
      /* T = 0.25 s: the ramp reaches pi/T = 4 pi at the band edge */
      const f=Math.max(0,Math.min(2,v?v.frame:0)), u2=cl(f-1), dt=f>=0.5, top=PI/S5T;
      const a=AX({xr:[-3*PI,3*PI],yr:[-0.12*top,1.62*top],yticksOverride:[],
        xlabel: dt ? '\\Omega\\;[\\text{rad/sample}]' : '\\omega\\;[\\text{rad/s}]',
        ylabel: dt ? '|H_d(e^{j\\Omega})|' : '|H_{\\text{eff}}(j\\omega)|',
        xticksOverride:wTicks(-3*PI,3*PI,PI), xtickfmt: dt ? piTick : s5wTick});
      a.curve(W=>Math.abs(W)<=PI ? Math.abs(W)/S5T : NaN,{color:C.h,n:900});
      fade(a,1-u2,()=>{ a.poly([[-3*PI,0],[-PI,0]],{color:C.h}); a.poly([[PI,0],[3*PI,0]],{color:C.h}); });
      fade(a,u2,()=>{ a.curve(W=>{ const r=W-2*PI*Math.round(W/(2*PI)); return Math.abs(W)>=PI ? Math.abs(r)/S5T : NaN; },{color:C.h,n:1800});
        s5Period(a,1.3*top); });
      a.note(PI,top,dt?'\\pi/T':'4\\pi',{tex:true,anchor:'middle',dy:-16,color:C.muted,fs:14});
      return a.svg(); },
      caption:'The magnitude of the differentiator for $T=0.25$ s. It ramps up to $\\pi/T=4\\pi$ at the band edge. Press Next to read it in $\\Omega$ and to let it repeat.'}
  ], right:[
    {t:'eq', label:'Band-limited differentiator', tex:'H_{\\text{eff}}(j\\omega)=\\begin{cases}j\\omega,&|\\omega|<\\omega_s/2\\\\0,&|\\omega|>\\omega_s/2\\end{cases}',
      note:'$j\\omega X_c(j\\omega)$ is the transform of $dx_c/dt$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Step · read it in $\\Omega$', tex:'H_d(e^{j\\Omega})=H_{\\text{eff}}\\bigl(j\\tfrac{\\Omega}{T}\\bigr)=j\\,\\frac{\\Omega}{T},\\qquad|\\Omega|<\\pi',
        note:'The key result read backwards. Outside $|\\Omega|<\\pi$ it repeats every $2\\pi$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'A jump at the band edge', html:'The response goes from $j\\pi/T$ to $-j\\pi/T$ at $\\Omega=\\pi$. The magnitude is a ramp; the phase is $\\pm\\pi/2$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The same differentiator, $T=0.25$ s.<div class="nsep"></div>What is $|H_d(e^{j\\Omega})|$ at $\\Omega=\\pi/2$?',
        ask:{key:'m7-diff', choices:['$2\\pi$','$\\pi/2$','$8\\pi$'], answer:0,
          why:'$|\\Omega|/T=(\\pi/2)/0.25=2\\pi$.'}}]}
  ]}
]},

{ id:'m7-diff-b', module:'M7', nav:'Differentiator · a tone', title:'The Differentiator on a Tone', src:'—',
  objective:'Pass a tone through the digital differentiator and see the output become the derivative below half the rate and the derivative of the alias above it.',
  keywords:'differentiator tone cos(omega_0 t) output -omega_0 sin(omega_0 t) amplitude 2 pi f_0 slider sampling 1 kHz alias above f_s/2 wrong frequency wrong size',
  slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 7 · Discrete-time processing', src:'—'},
  {t:'title', text:'The Differentiator on a Tone'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'f0', label:'$f_0$', min:50, max:950, step:10, v:100, show:v=>'$'+v+'$ Hz'}]},
      svg:v=>{
      /* t in ms and f in kHz, so a derivative is per ms; f_s = 1 kHz */
      /* a tone exactly at f_s/2 sits on the band edge: the chain is not
         defined there, and nothing is drawn as its output */
      const f0=(v?v.f0:100)/1000, edge=Math.abs(f0-0.5)<1e-9, fa=s5fold(f0,1), wa=edge?0:2*PI*fa, al=f0>0.5+1e-9;
      const a=AX({xr:[-0.2,10.2],yr:[-3.6,7.4],yticksOverride:[-3,-1,0,1,3],ytickfmt:v=>String(v),
        xlabel:'t\\;[\\text{ms}]',ylabel:'x_c(t),\\;y_c(t)',xticksOverride:[0,2,4,6,8,10]});
      a.curve(t=>Math.cos(2*PI*f0*t),{color:C.in,width:1.5,dash:'5 5',n:3000});
      a.curve(t=>-wa*Math.sin(wa*t),{color:C.out,width:2.4,n:2000});
      for(let n=0;n<=10;n++) a.point(n,-wa*Math.sin(wa*n),{color:C.out,r:5});
      a.note(-0.2,5.9,edge?'\\text{on the band edge: not defined}':al?'\\text{derivative of the alias at }'+Math.round(fa*1000)+'\\;\\text{Hz}':'\\text{peak }2\\pi f_0='+s5n(wa,2)+'\\;\\text{ms}^{-1}',
        {tex:true,anchor:'start',dx:14,color:al||edge?C.err:C.out,fs:15});
      return a.svg(); },
      caption:'The tone $x_c(t)=\\cos(2\\pi f_0t)$ through the differentiator at $f_s=1$ kHz, $y_c$ per ms. Move $f_0$ past $500$ Hz.'},
    {t:'legend', items:[['in','$x_c(t)$',true],['out','$y_c(t)$ and $y_d[n]$']]}
  ], right:[
    {t:'eq', label:'One tone through the chain', tex:'\\begin{aligned}x_d[n]&=\\cos(\\Omega_0n),\\qquad\\Omega_0=\\omega_0T\\\\y_d[n]&=\\tfrac{\\Omega_0}{T}\\cos\\bigl(\\Omega_0n+\\tfrac{\\pi}{2}\\bigr)=-\\omega_0\\sin(\\omega_0nT)\\end{aligned}',
      note:'The gain is $\\Omega_0/T=\\omega_0$ and the phase $\\pi/2$. D/C returns $-\\omega_0\\sin(\\omega_0t)=dx_c/dt$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Check · $f_0=100$ Hz', html:'$\\omega_0=200\\pi\\approx628.3$ rad/s: the output peaks at $0.628$ per ms, as drawn.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Above $f_s/2$', html:'Past $500$ Hz the tone folds to $f_s-f_0$ first. The output is the derivative of the alias.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$f_s=1$ kHz and a tone at $f_0=700$ Hz.<div class="nsep"></div>What peak does $y_c(t)$ reach?',
        ask:{key:'m7-diff-b', choices:['$2\\pi\\cdot300\\ \\text{s}^{-1}$','$2\\pi\\cdot700\\ \\text{s}^{-1}$','$0$'], answer:0,
          why:'The filter differentiates the $300$ Hz alias.'}}]}
  ]}
]},

/* ------------------------------------------------------ half-sample delay */
{ id:'m7-halfdelay', module:'M7', nav:'Half-sample delay', title:'Half-Sample Delay', src:'—',
  objective:'Delay a band-limited signal by half a sampling period with a discrete-time filter, and see the new samples fall between the old ones.',
  keywords:'half-sample delay H_d(e^{j Omega}) = e^{-j Omega/2} delay T/2 band-limited interpolation midpoints y_d[n] = x_c(nT - T/2) frames linear phase',
  slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 7 · Discrete-time processing', src:'—'},
  {t:'title', text:'Half-Sample Delay'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$x_d[n]=x_c(nT)$','the curve read halfway, at $(n-\\tfrac12)T$','$y_d[n]$ at $nT$: $y_c(t)=x_c(t-T/2)$']},
      svg:v=>{
      /* T = 1 ms; the new samples appear at the midpoints, then the curve and
         they move right by T/2 together */
      const f=Math.max(0,Math.min(2,v?v.frame:0)), u1=cl(f), u2=cl(f-1), sh=0.5*u2;
      const a=AX({xr:[-0.6,8.6],yr:[-1.9,3.3],yticksOverride:[-1,0,1],ytickfmt:v=>String(v),
        xlabel:'t\\;[\\text{ms}]',ylabel:'x_c(t),\\;y_c(t)',xticksOverride:[0,2,4,6,8]});
      a.curve(s5Xh,{color:C.in,width:1.5,dash:'5 5',n:1600});
      fade(a,u2,()=>a.curve(t=>s5Xh(t-sh),{color:C.out,n:1600}));
      fade(a,1-0.65*u2,()=>a.stem(D(n=>s5Xh(n),0,8),{color:C.mid,r:5}));
      fade(a,u1,()=>a.stem(D(n=>s5Xh(n-0.5),0,9).map(([n,y])=>[n-0.5+sh,y]),{color:C.out,r:5}));
      return a.svg(); },
      caption:'$x_c(t)=\\sin(2\\pi\\,0.15t)+0.5\\cos(2\\pi\\,0.32t)$, $t$ in ms, sampled at $T=1$ ms. Press Next: the new samples are the curve read between the old ones.'},
    {t:'legend', items:[['in','$x_c(t)$',true],['mid','$x_d[n]$'],['out','$y_d[n]$, $y_c(t)$']]}
  ], right:[
    {t:'eq', label:'Delay by $T/2$', tex:'\\begin{aligned}H_{\\text{eff}}(j\\omega)&=e^{-j\\omega T/2},\\quad|\\omega|<\\omega_s/2\\\\\\Longrightarrow\\;H_d(e^{j\\Omega})&=e^{-j\\frac{\\Omega}{T}\\cdot\\frac{T}{2}}=e^{-j\\Omega/2},\\quad|\\Omega|<\\pi\\end{aligned}',
      note:'A delay $\\Delta$ multiplies the transform by $e^{-j\\omega\\Delta}$; here $\\Delta=T/2$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'$x_d[n-\\tfrac12]$ does not exist', html:'A sequence has no value at $n-\\tfrac12$. $y_d[n]$ is the curve through the samples, read half a step earlier: $x_c(nT-T/2)$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Gain and phase', html:'$|H_d|=1$, and the phase $-\\Omega/2$ is a line: every frequency is delayed by half a sample.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$T=1$ ms and $x_c(t)=\\cos(2\\pi\\cdot250\\,t)$, $t$ in seconds.<div class="nsep"></div>What is $y_d[0]$?',
        ask:{key:'m7-halfdelay', choices:['$0.707$','$1$','$0$'], answer:0,
          why:'$y_d[0]=x_c(-T/2)=\\cos(-\\pi/4)\\approx0.707$.'}}]}
  ]}
]},

{ id:'m7-halfdelay-b', module:'M7', nav:'Half-sample delay · impulse response', title:'Impulse Response of the Half-Sample Delay', src:'—',
  objective:'Find the impulse response of the half-sample delay from a sinc input, and see why it uses every sample.',
  keywords:'half-sample delay impulse response h[n] = sin(pi(n - 1/2))/(pi(n - 1/2)) sinc shifted half sample every sample nonzero decays 1/n frames',
  slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 7 · Discrete-time processing', src:'—'},
  {t:'title', text:'Impulse Response of the Half-Sample Delay'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['the kernel at integers: only $n=0$ is nonzero','shifted by half a sample: every $n$ carries a value']},
      svg:v=>{
      const s=0.5*cl(v?v.frame:0);
      const a=AX({h:350,xr:[-5.6,6.6],yr:[-0.45,1.55],yticksOverride:[0,0.5,1],ytickfmt:v=>String(v),
        xlabel:'n',ylabel:'h[n]',xticksOverride:[-4,-2,0,2,4,6]});
      a.curve(t=>s5Sinc(PI*(t-s)),{color:C.mid,width:1.5,dash:'6 5',n:1600});
      a.stem(D(n=>{ const y=s5Sinc(PI*(n-s)); return Math.abs(y)<1e-9?0:y; },-5,6),{color:C.h,r:5});
      return a.svg(); },
      caption:'The stems are $\\operatorname{sinc}\\bigl(\\pi(n-s)\\bigr)$ with $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$. Press Next to move $s$ from $0$ to $\\tfrac12$.'},
    {t:'legend', items:[['h','$h[n]$'],['mid','$\\operatorname{sinc}\\bigl(\\pi(t-s)\\bigr)$',true]]}
  ], right:[
    {t:'eq', label:'A sinc input', tex:'x_c(t)=\\frac{\\sin(\\pi t/T)}{\\pi t}\\;\\Longrightarrow\\;x_d[n]=\\frac{\\sin(\\pi n)}{\\pi nT}=\\frac{1}{T}\\,\\delta[n]',
      note:'$\\sin(\\pi n)=0$ for $n\\neq0$ and $x_c(0)=1/T$; the band is $|\\omega|<\\pi/T$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Impulse response', tex:'h[n]=T\\,y_d[n]=T\\,x_c\\bigl(nT-\\tfrac{T}{2}\\bigr)=\\frac{\\sin\\bigl(\\pi(n-\\frac12)\\bigr)}{\\pi(n-\\frac12)}',
        note:'The input is $\\tfrac1T\\delta[n]$, so the output is $\\tfrac1Th[n]$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Every sample is used', html:'$\\sin\\bigl(\\pi(n-\\tfrac12)\\bigr)=(-1)^{n+1}$, so $h[n]=(-1)^{n+1}/\\bigl(\\pi(n-\\tfrac12)\\bigr)$: never zero, and decaying only like $1/n$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The same $h[n]$.<div class="nsep"></div>How does $h[1]$ compare with $h[0]$?',
        ask:{key:'m7-halfdelay-b', choices:['They are equal','$h[1]=0$','$h[1]=-h[0]$'], answer:0,
          why:'$h[0]=\\tfrac{-1}{-\\pi/2}=\\tfrac{2}{\\pi}=\\tfrac{1}{\\pi/2}=h[1]$.'}}]}
  ]}
]},

/* ------------------------------------------------------------ quantization */
{ id:'m7-quant', module:'M7', nav:'Quantization', title:'Quantization', src:'—',
  objective:'See a converter round each sample to one of 2^B levels, and read the size of the rounding error off the step.',
  keywords:'quantization bits B levels 2^B step Delta = 2/2^B rounding error at most Delta/2 staircase analog-to-digital converter slider',
  slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 7 · Quantization', src:'—'},
  {t:'title', text:'Quantization'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'B', label:'$B$', min:1, max:8, step:1, v:3, show:v=>'$'+v+'$ '+(v===1?'bit':'bits')}]},
      svg:v=>{
      /* one cycle of a 1 kHz sine, t in ms, sampled 16 times a cycle; the
         staircase is the whole curve rounded, which shows the levels a
         sample can take; the error is drawn at the samples */
      const B=v?v.B:3, L=Math.pow(2,B), Dl=2/L, x=t=>Math.sin(2*PI*t);
      const dTex = Math.abs(+Dl.toFixed(4)-Dl)<1e-12 ? '='+s5n(Dl,4) : '\\approx'+s5n(Dl,4);
      const pad={l:74,r:24,t:20,b:34};
      return s5Stack([380,400],[0.6,0.6], h=>{
        const a=AX({h,pad,xr:[-0.02,1.02],yr:[-1.25,2.55],yticksOverride:[-1,0,1],ytickfmt:v=>String(v),
          xlabel:'t\\;[\\text{ms}]',ylabel:'x(t),\\;Q\\bigl(x(t)\\bigr)',xticksOverride:[0,0.25,0.5,0.75,1]});
        if(B<=4) for(let i=0;i<L;i++) a.hline(-1+Dl*(i+0.5),{color:C.muted,opacity:.45});
        a.curve(x,{color:C.in,width:1.5,dash:'5 5',n:1600});
        a.curve(t=>s5Q(x(t),B),{color:C.out,width:2.4,n:3200});
        for(let n=0;n<=16;n++) a.point(n/16,s5Q(x(n/16),B),{color:C.mid,r:4.6});
        a.note(-0.02,1.95,L+'\\;\\text{levels},\\;\\Delta'+dTex,{tex:true,anchor:'start',dx:14,color:C.coral,fs:15});
        return a.svg(); }, h=>{
        const a=AX({h,pad,xr:[-0.02,1.02],yr:[-0.8*Dl,0.8*Dl],yticksOverride:[-Dl/2,Dl/2],ytickfmt:v=>s5n(v,4),
          xlabel:'t\\;[\\text{ms}]',ylabel:'e[n]',xticksOverride:[0,0.25,0.5,0.75,1]});
        a.hline(Dl/2,{color:C.err,opacity:.6}); a.hline(-Dl/2,{color:C.err,opacity:.6});
        a.stem(D(n=>s5Q(x(n/16),B)-x(n/16),0,16).map(([n,e])=>[n/16,e]),{color:C.err,r:4});
        return a.svg(); }); },
      caption:'A full-scale $1$ kHz sine, $x(t)=\\sin(2\\pi t)$ with $t$ in ms, and its samples rounded to $2^{B}$ levels. Below, the error $e[n]=x_q[n]-x[n]$. Move $B$.'},
    {t:'legend', items:[['in','$x(t)$',true],['out','$Q\\bigl(x(t)\\bigr)$'],['mid','$x_q[n]$'],['err','$e[n]$']]}
  ], right:[
    {t:'note', kind:'def', head:'What a real converter adds', html:'A C/D converter with $B$ bits rounds each sample to one of $2^{B}$ levels. The result $x_q[n]$ is a number the computer can store.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Step and error', tex:'\\Delta=\\frac{2}{2^{B}},\\qquad|e[n]|=\\bigl|x_q[n]-x[n]\\bigr|\\le\\frac{\\Delta}{2}',
        note:'For a range from $-1$ to $1$. One more bit halves $\\Delta$, and with it the largest error.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'A second loss, besides aliasing', html:'Rounding cannot be undone, and no sampling rate removes it. Only more bits make it smaller.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'A converter has $B=4$ bits over the range $-1$ to $1$.<div class="nsep"></div>What is the largest rounding error?',
        ask:{key:'m7-quant', choices:['$1/16$','$1/8$','$1/4$'], answer:0,
          why:'$\\Delta=2/2^{4}=1/8$, so $|e|\\le\\Delta/2=1/16$.'}}]}
  ]}
]},

{ id:'m7-quant-b', module:'M7', nav:'About 6 dB per bit', title:'About Six Decibels per Bit', src:'—',
  objective:'Derive the signal-to-noise ratio of a quantized full-scale sine, check it against measured values, and hear 3, 8 and 16 bits.',
  keywords:'signal to noise ratio SNR 6.02 B + 1.76 dB per bit quantization noise power Delta^2/12 full-scale sine 3 bits 8 bits 16 bits CD sound listen',
  slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 7 · Quantization', src:'—'},
  {t:'title', text:'About Six Decibels per Bit'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      listen:{items:[
        {label:'Play $3$ bits', sound:()=>({f:t=>s5Q(Math.sin(2*PI*440*t),3), dur:1.2})},
        {label:'Play $8$ bits', sound:()=>({f:t=>s5Q(Math.sin(2*PI*440*t),8), dur:1.2})},
        {label:'Play $16$ bits', sound:()=>({f:t=>s5Q(Math.sin(2*PI*440*t),16), dur:1.2})}]},
      svg:()=>{
      const a=AX({xr:[0,17],yr:[0,128],yticksOverride:[0,20,40,60,80,100],ytickfmt:v=>String(v),yticksLeft:false,
        xlabel:'B\\;[\\text{bits}]',ylabel:'\\text{SNR}\\;[\\text{dB}]',xticksOverride:[1,4,8,12,16]});
      a.curve(B=>6.02*B+1.76,{color:C.mid,width:1.8,dash:'7 5',n:200});
      for(let B=1;B<=16;B++) a.point(B,s5SnrM(B),{color:C.out,r:[3,8,16].includes(B)?6.5:4.2});
      for(const B of [3,8,16]) a.note(B,s5SnrM(B),'B='+B,{tex:true,anchor:'end',dx:-14,dy:-12,color:C.out,fs:14});
      return a.svg(); },
      caption:'Dots: the SNR measured on a sampled full-scale sine. Dashed: the rule. Play a $440$ Hz tone at $3$, $8$ and $16$ bits.'},
    {t:'legend', at:'tl', items:[['out','measured'],['mid','$6.02B+1.76$',true]]}
  ], right:[
    {t:'eq', label:'Step 1 · Noise power', tex:'\\overline{e^{2}}=\\frac{1}{\\Delta}\\int_{-\\Delta/2}^{\\Delta/2}e^{2}\\,de=\\frac{1}{\\Delta}\\Bigl[\\frac{e^{3}}{3}\\Bigr]_{-\\Delta/2}^{\\Delta/2}=\\frac{1}{\\Delta}\\cdot\\frac{\\Delta^{3}}{12}=\\frac{\\Delta^{2}}{12}',
      note:'The error is taken as spread evenly over $\\pm\\Delta/2$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', label:'Step 2 · Signal to noise', tex:'\\begin{aligned}\\text{SNR}&=10\\log_{10}\\frac{1/2}{\\Delta^{2}/12}=10\\log_{10}\\frac{6}{\\Delta^{2}}=10\\log_{10}\\bigl(1.5\\cdot2^{2B}\\bigr)\\\\&=10\\log_{10}1.5+20B\\log_{10}2\\approx6.02B+1.76\\ \\text{dB}\\end{aligned}',
        note:'A full-scale sine has power $1/2$, and $\\Delta^{2}=4/2^{2B}$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Check · the three sounds', html:'$19.8$ dB at $3$ bits, $49.9$ at $8$, $98.1$ at $16$, the CD format. From $3$ bits up the dots lie within $1$ dB.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'A converter is changed from $12$ to $14$ bits.<div class="nsep"></div>By about how much does the SNR rise?',
        ask:{key:'m7-quant-b', choices:['$12$ dB','$2$ dB','$6$ dB'], answer:0,
          why:'Two bits add $2\\times6.02\\approx12$ dB.'}}]}
  ]}
]},

/* ============================================================ closing the section */
realGallery({ id:'m7-real-dtproc', nav:'Digital processing around us',
  title:'Digital Processing Around Us', eyebrow:'Module 7 · Discrete-time processing', src:'—',
  objective:'Recognise everyday devices that sample a signal, process the numbers and convert back.',
  keywords:'examples phone hum 50 Hz 8 kHz equaliser bass 48 kHz ABS wheel speed sensor moving average 400 Hz camera sharpening edge pixels',
  figs:[
    [()=>{ const a=P.Axes(EXO({xr:[-0.05,2.55],yr:[-1.5,3.4],xlabel:'t\\;(\\text{ms})',ylabel:'v\\;(\\text{V})',xticksOverride:[0.5,1,1.5,2],yticksOverride:[-1,0,1]}));
      a.curve(t=>Math.sin(2*PI*0.8*t)+0.8*Math.sin(2*PI*0.05*t),{color:C.in,width:1.6,dash:'6 5',n:1200});
      a.stem(D(n=>Math.sin(2*PI*800*n/8000),0,20).map(([n,y])=>[n/8,Math.abs(y)<1e-9?0:y]),{color:C.out,r:3});
      return a.svg(); }, 'A phone at $8$ kHz removes the $50$ Hz hum: $y[n]=\\sin(2\\pi\\,800n/8000)$ V.',
      [['in','$x(t)$, with hum',true],['out','$y[n]$']]],
    [()=>{ const a=P.Axes(EXO({xr:[-0.2,10.2],yr:[-3.4,6.6],xlabel:'t\\;(\\text{ms})',ylabel:'v\\;(\\text{V})',xstep:2,yticksOverride:[-2,0,2]}));
      a.curve(t=>Math.cos(2*PI*0.1*t)+Math.cos(2*PI*t),{color:C.in,width:1.6,dash:'6 5',n:1600});
      a.curve(t=>2*Math.cos(2*PI*0.1*t)+Math.cos(2*PI*t),{color:C.out,n:1600});
      return a.svg(); }, 'An equaliser at $48$ kHz doubles the bass: $y(t)=2\\cos(2\\pi\\,100t)+\\cos(2\\pi\\,1000t)$.',
      [['in','$x(t)$',true],['out','$y(t)$']]],
    [()=>{ const a=P.Axes(EXO({xr:[-0.001,0.051],yr:[17.8,24.8],xlabel:'t\\;(\\text{s})',ylabel:'v\\;(\\text{m/s})',xticksOverride:[0.01,0.02,0.03,0.04,0.05],yticksOverride:[18,20,22]}));
      const sp=t=>20-8*t+1.5*Math.sin(2*PI*100*t);
      a.curve(sp,{color:C.in,width:1.6,n:1200});
      for(let n=3;n<=20;n++){ const t=n*0.0025; let q=0; for(let k=0;k<4;k++) q+=sp(t-k*0.0025); a.point(t,q/4,{color:C.out,r:3.8}); }
      return a.svg(); }, 'An ABS wheel sensor at $400$ Hz: $y[n]=\\tfrac14\\sum_{k=0}^{3}v[n-k]$ removes the $100$ Hz ripple.',
      [['in','$v(t)$'],['out','$y[n]$']]],
    [()=>{ const a=P.Axes(EXO({xr:[-0.6,16.6],yr:[-0.3,1.9],xlabel:'n\\;(\\text{pixel})',ylabel:'b\\;(\\text{norm.})',xstep:4,yticksOverride:[0,0.5,1]}));
      const b=x=>0.5+0.5*Math.tanh((x-8)/2.5);
      a.curve(b,{color:C.in,width:1.6,dash:'6 5',n:800});
      a.stem(D(n=>5*b(n)-2*(b(n-1)+b(n+1)),0,16),{color:C.out,r:3});
      return a.svg(); }, 'A camera sharpens a soft edge $b$: $y[n]=5b[n]-2\\bigl(b[n-1]+b[n+1]\\bigr)$.',
      [['in','$b$, soft edge',true],['out','$y[n]$']]]
  ],
  notes:[
    {t:'note', kind:'def', head:'Sample, compute, convert back', html:'Each device reads its signal at a fixed rate: $8$ kHz, $48$ kHz, $400$ Hz, one sample a pixel. The processing is arithmetic on the numbers.'},
    {t:'note', kind:'warn', head:'The rate sets the frequency', html:'The four-sample average has zeros at $\\Omega=\\pi/2$ and $\\pi$. At $f_s=400$ Hz these are $100$ and $200$ Hz, so it removes the $100$ Hz ripple.'}
  ]}),

labScene({ id:'m7-lab-j5', lab:'J5', nav:'The Whole Chain', title:'Discrete-Time Processing End to End', src:'—',
  objective:'Choose two input tones, a sampling rate and a digital filter, and follow the spectrum from the input through the discrete-time filter to the output, with the equivalent cutoff in rad/s and Hz.',
  keywords:'laboratory chain C/D D/C digital low-pass cutoff Omega_c differentiator half-sample delay equivalent cutoff rad/s Hz band-limited warning alias' }),

codeScene({ id:'m7-code-dtproc', nav:'Discrete-time processing', title:'Discrete-Time Processing in Code', src:'—', eyebrow:'Discrete-time processing in code',
  objective:'Map frequencies to rad/sample, run a digital low-pass, differentiator and half-sample delay, and measure quantization noise in MATLAB and in Python, predicting each result first.',
  keywords:'code matlab python frequency map Omega = omega T digital low-pass fft differentiator half-sample delay quantization SNR 6.02 B + 1.76 run' }),

/* </m7-s5> */

/* <m7-s6> ============================================ 7.6 sampling a sequence: decimation and interpolation */

/* ------------------------------------------------------- sampling a sequence */
{ id:'m7-dtsamp', module:'M7', nav:'Sampling a sequence', title:'Sampling a Sequence', src:'—',
  objective:'Sample a sequence by multiplying it with a unit-sample train of period N, and read off which values survive.',
  keywords:'discrete-time sampling sequence p[n] unit sample train period N x_p[n] multiplication zeros between samples',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 7 · Sampling a sequence', src:'—'},
  {t:'title', text:'Sampling a Sequence'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$x[n]$: the sequence','$p[n]$: a one every $N=3$ samples','$x_p[n]=x[n]\\,p[n]$']},
      svg:v=>{
      /* frame 1 brings in the train; frame 2 shrinks each unit sample to x[n]
         and sets every value between the marks to zero */
      const f=v?v.frame:0, N=3, u1=cl(f), u2=cl(f-1);
      const on = n => ((n%N)+N)%N===0;
      const a=AX({h:340,xr:[-12.6,12.6],yr:[-0.2,1.45],xlabel:'n',
        ylabel:f<0.5?'x[n]':(f<1.5?'x[n],\\;p[n]':'x_p[n]'),yticksOverride:[0,0.5,1],xticksOverride:[-12,-9,-6,-3,0,3,6,9,12]});
      /* the values between the marks shrink to zero */
      fade(a,1,()=>s6stems(a,n=>on(n)?NaN:s6x(n)*(1-u2),-12,12,u2>0.98?C.mid:C.in));
      fade(a,1-u2,()=>s6stems(a,n=>on(n)?s6x(n):NaN,-12,12,C.in));
      /* the unit samples at the marks, shrinking to the value of x there */
      fade(a,u1*(1-u2),()=>s6stems(a,n=>on(n)?1+(s6x(n)-1)*u2:NaN,-12,12,C.h));
      fade(a,u2,()=>s6stems(a,n=>on(n)?1+(s6x(n)-1)*u2:NaN,-12,12,C.mid));
      return a.svg(); },
      caption:'The sequence $x[n]=\\bigl(\\sin(\\pi n/8)/(\\pi n/8)\\bigr)^{2}$, with $x[0]=1$, and a one every $N=3$ samples. Press Next: the values between the marks become zero.'},
    {t:'legend', items:[['in','$x[n]$'],['h','$p[n]$'],['mid','$x_p[n]$']]}
  ], right:[
    {t:'eq', tex:'p[n]=\\sum_{k=-\\infty}^{\\infty}\\delta[n-kN],\\qquad x_p[n]=x[n]\\,p[n]', label:'Sampling a sequence',
      note:'The sampler multiplies $x[n]$ by a unit sample every $N$ samples. The integer $N$ is the sampling period.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'x_p[n]=\\sum_{k}x[kN]\\,\\delta[n-kN]=\\begin{cases}x[n], & n=kN\\\\ 0, & \\text{otherwise}\\end{cases}',
        label:'What survives',
        note:'$x[n]\\,\\delta[n-kN]=x[kN]\\,\\delta[n-kN]$, because $\\delta[n-kN]$ is zero except at $n=kN$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'$x[n]=(0.5)^{|n|}$ is sampled with $N=3$.<div class="nsep"></div>What is $x_p[4]$?',
        ask:{key:'m7-dtsamp', choices:['$0$','$(0.5)^{4}$','$(0.5)^{3}$'], answer:0,
          why:'$4$ is not a multiple of $3$, so the sampler sets $x_p[4]=0$.'}}]}
  ]}
]},

{ id:'m7-dtsamp-b', module:'M7', nav:'The sampled spectrum of a sequence', title:'Spectrum of a Sampled Sequence', src:'—',
  objective:'Set up the transform of a sampled sequence from the impulse-train pair and the multiplication property of Module 6.',
  keywords:'sampled sequence spectrum P(e^{jw}) impulse train 2 pi/N multiplication property periodic convolution copies 1/N omega_s',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 7 · Sampling a sequence', src:'—'},
  {t:'title', text:'Spectrum of a Sampled Sequence'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$X(e^{j\\omega})$: peak $8$','$k=0$: scaled by $1/N$','$k=1$: shifted by $\\omega_s=2\\pi/3$','$k=2$: shifted by $2\\omega_s$']},
      svg:v=>{
      /* N = 3. Frame 1 lowers the baseband to 8/3; frames 2 and 3 slide the
         copies k = 1 and k = 2 out to k*2pi/3. Every copy repeats every 2 pi. */
      const f=v?v.frame:0, N=3, u0=cl(f), u1=cl(f-1), u2=cl(f-2), ws=2*PI/N;
      const a=s6AX({h:330,yr:[-0.6,12.4],ylabel:f<0.5?'X(e^{j\\omega})':'X_p(e^{j\\omega})',yticksOverride:[0,8/3,8],
        ytickfmt:y=>y<1e-9?'0':(y>7?'8':'8/3')});
      if(f>1) fade(a,cl(3*u1),()=>a.curve(w=>s6tri(w,ws*u1,S6W,S6PK/N),{color:C.mid,n:2400}));
      if(f>2) fade(a,cl(3*u2),()=>a.curve(w=>s6tri(w,ws*(1+u2),S6W,S6PK/N),{color:C.mid,n:2400}));
      a.curve(w=>s6tri(w,0,S6W,S6PK*(1-(1-1/N)*u0)),{color:C.in,n:2400});
      s6Period(a,10.1);
      return a.svg(); },
      caption:'The running sequence has a triangle of peak $8$ reaching zero at $\\omega_M=\\pi/4$. With $N=3$, press Next: each impulse of $P(e^{j\\omega})$ in one period places one copy, scaled by $1/3$.'},
    {t:'legend', items:[['in','$k=0$'],['mid','$k=1,2$']]}
  ], right:[
    {t:'eq', tex:'P(e^{j\\omega})=\\frac{2\\pi}{N}\\sum_{k=-\\infty}^{\\infty}\\delta(\\omega-k\\omega_s),\\qquad\\omega_s=\\frac{2\\pi}{N}',
      label:'Step 1 · The sampling sequence',
      note:'This is the impulse-train pair of Module 6. One period of $2\\pi$ holds the $N$ impulses $k=0,1,\\dots,N-1$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'X_p(e^{j\\omega})=\\frac{1}{2\\pi}\\int_{0}^{2\\pi}P(e^{j\\theta})\\,X\\bigl(e^{j(\\omega-\\theta)}\\bigr)\\,\\d\\theta',
        label:'Step 2 · Multiply in time, convolve over one period',
        note:'The multiplication property of Module 6: $x_p[n]=x[n]\\,p[n]$ becomes a periodic convolution over one period of $2\\pi$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'Take $N=4$ in Step 1.<div class="nsep"></div>What weight does each impulse of $P(e^{j\\omega})$ carry?',
        ask:{key:'m7-dtsamp-b', choices:['$\\pi/2$','$2\\pi$','$1/4$'], answer:0,
          why:'The weight is $2\\pi/N=2\\pi/4=\\pi/2$, and one period holds four of them.'}}]}
  ]}
]},

{ id:'m7-dtsamp-c', module:'M7', nav:'Copies and aliasing', title:'The Copies, and When They Overlap', src:'—',
  objective:'Finish the derivation of the sampled spectrum, then move N and find the largest one for which the copies stay apart.',
  keywords:'aliasing discrete time sampling period N slider band edge omega_M pi/N condition overlap copies 2 pi/N',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 7 · Sampling a sequence', src:'—'},
  {t:'title', text:'The Copies, and When They Overlap'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'N', label:'$N$', min:2, max:6, step:1, v:3, show:v=>'$'+v+'$'}]},
      svg:v=>{
      const N=v?Math.round(v.N):3, over=S6W>PI/N+1e-9, edge=Math.abs(S6W-PI/N)<1e-9;
      const a=s6AX({h:320,yr:[-0.35,7.4],ylabel:'X_p(e^{j\\omega})',yticksOverride:[0,8/N],
        ytickfmt:y=>y<1e-9?'0':'8/'+N});
      s6Copies(a,N,S6W,S6PK);
      s6Period(a,5.0);
      a.note(-3*PI,6.5,'\\omega_M=\\tfrac{\\pi}{4}\\;'+(over?'>':(edge?'=':'<'))+'\\;\\tfrac{\\pi}{N}=\\tfrac{\\pi}{'+N+'}',{tex:true,
        anchor:'start',dx:12,color:over?C.err:C.muted,fs:15});
      return a.svg(); },
      caption:'The copies of the running sequence, $\\omega_M=\\pi/4$, height $8/N$. Move $N$: at $N=4$ the copies just touch, and from $N=5$ they overlap.'},
    {t:'legend', items:[['in','$k=0$'],['mid','$k\\neq0$'],['err','overlap']]}
  ], right:[
    {t:'eq', result:true, tex:'\\begin{aligned}X_p(e^{j\\omega})&=\\frac{1}{N}\\sum_{k=0}^{N-1}\\int_{0}^{2\\pi}\\delta(\\theta-k\\omega_s)\\,X\\bigl(e^{j(\\omega-\\theta)}\\bigr)\\,\\d\\theta\\\\&=\\frac{1}{N}\\sum_{k=0}^{N-1}X\\bigl(e^{j(\\omega-k\\omega_s)}\\bigr)\\end{aligned}',
      label:'Key result · Spectrum of a sampled sequence',
      note:'Step 3: put Step 1 into Step 2, $\\tfrac{1}{2\\pi}\\cdot\\tfrac{2\\pi}{N}=\\tfrac{1}{N}$, then sift at $\\theta=k\\omega_s$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\omega_s>2\\omega_M\\;\\Longleftrightarrow\\;\\frac{2\\pi}{N}>2\\omega_M\\;\\Longleftrightarrow\\;\\omega_M<\\frac{\\pi}{N}',
        label:'No aliasing',
        note:'Copies sit $2\\pi/N$ apart and reach $\\omega_M$ on each side.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'A sequence has $X(e^{j\\omega})=0$ for $2\\pi/7\\le|\\omega|\\le\\pi$.<div class="nsep"></div>What is the largest $N$ with no aliasing?',
        ask:{key:'m7-dtsamp-c', choices:['$3$','$4$','$7$'], answer:0,
          why:'$2\\pi/7<\\pi/N$ needs $N<3.5$, so $N=3$.'}}]}
  ]}
]},

{ id:'m7-dtsamp-rec', module:'M7', nav:'Recovering the sequence', title:'Recovering the Sequence', src:'—',
  objective:'Recover a sampled sequence with an ideal discrete-time low-pass filter of gain N and cutoff pi/N.',
  keywords:'recovery reconstruction ideal low-pass discrete time gain N cutoff pi/N omega_s/2 copies removed X_r',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 7 · Sampling a sequence', src:'—'},
  {t:'title', text:'Recovering the Sequence'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$X_p(e^{j\\omega})$: copies of height $8/3$','$H(e^{j\\omega})$: gain $3$ on $|\\omega|<\\pi/3$','$X_r(e^{j\\omega})=X(e^{j\\omega})$: height $8$']},
      svg:v=>{
      /* N = 3: the filter comes in, removes the copies k = 1, 2 and lifts the
         baseband from 8/3 to 8 */
      const f=v?v.frame:0, N=3, u1=cl(f), u2=cl(f-1), ws=2*PI/N;
      const a=s6AX({yr:[-0.6,14],ylabel:'\\text{spectra}',yticksOverride:[0,8/3,8],
        ytickfmt:y=>y<1e-9?'0':(y>7?'8':'8/3')});
      fade(a,1-u2,()=>{ for(const k of [1,2]) a.curve(w=>s6tri(w,k*ws,S6W,S6PK/N),{color:C.mid,n:2400}); });
      const pk=S6PK/N+(S6PK-S6PK/N)*u2;
      fade(a,1-u2,()=>a.curve(w=>s6tri(w,0,S6W,pk),{color:C.in,n:2400}));
      fade(a,u2,()=>a.curve(w=>s6tri(w,0,S6W,pk),{color:C.out,n:2400}));
      fade(a,u1,()=>{ s6band(a,PI/N,N); a.note(PI/N,N,'N='+N,{tex:true,anchor:'start',dx:6,dy:-6,color:C.h,fs:14}); });
      s6Period(a,11.2);
      return a.svg(); },
      caption:'Here $N=3$. Press Next: the low-pass keeps $|\\omega|<\\pi/3$ in every period, removes the copies, and its gain $3$ restores the height $8$.'},
    {t:'legend', items:[['in','$k=0$'],['mid','$k\\neq0$'],['h','$H(e^{j\\omega})$',true],['out','$X_r(e^{j\\omega})$']]}
  ], right:[
    {t:'eq', tex:'H(e^{j\\omega})=\\begin{cases}N, & |\\omega|<\\omega_c\\\\ 0, & \\omega_c<|\\omega|\\le\\pi\\end{cases},\\qquad\\omega_M<\\omega_c<\\omega_s-\\omega_M',
      label:'The recovery filter',
      note:'It repeats every $2\\pi$, like every discrete-time frequency response. With no aliasing, $\\omega_c=\\pi/N=\\omega_s/2$ always lies in the range.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'Why the gain is $N$', html:'Each copy carries the factor $1/N$. The gain $N$ undoes it, so $X_r(e^{j\\omega})=X(e^{j\\omega})$ and $x_r[n]=x[n]$ for every $n$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'The running sequence, $\\omega_M=\\pi/4$, is sampled with $N=2$.<div class="nsep"></div>Which cutoff recovers it?',
        ask:{key:'m7-dtsamp-rec', choices:['$\\omega_c=\\pi/2$','$\\omega_c=\\pi/8$','$\\omega_c=7\\pi/8$'], answer:0,
          why:'It needs $\\pi/4<\\omega_c<\\pi-\\pi/4=3\\pi/4$, and only $\\pi/2$ lies inside.'}}]}
  ]}
]},

/* ------------------------------------------------------------------ decimation */
{ id:'m7-decim', module:'M7', nav:'Decimation', title:'Decimation', src:'—',
  objective:'Form the decimated sequence by keeping every N-th value of the sampled sequence and closing the gaps.',
  keywords:'decimation downsampling x_b[n] = x_p[nN] = x[nN] keep every N-th sample discard zeros rate falls by N',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 7 · Decimation', src:'—'},
  {t:'title', text:'Decimation'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$x[n]$','$x_p[n]$: zeros between the samples','$x_b[n]=x_p[nN]$: the zeros removed']},
      svg:v=>{
      /* N = 3: frame 1 zeros the values between the marks; frame 2 moves the
         sample at n = 3m to n = m and lets the zeros go */
      const f=v?v.frame:0, N=3, u1=cl(f), u2=cl(f-1);
      const on = n => ((n%N)+N)%N===0;
      const a=AX({h:340,xr:[-12.6,12.6],yr:[-0.2,1.45],xlabel:'n',
        ylabel:f<0.5?'x[n]':(f<1.5?'x_p[n]':'x_b[n]'),yticksOverride:[0,0.5,1],xticksOverride:[-12,-9,-6,-3,0,3,6,9,12]});
      fade(a,1-u2,()=>s6stems(a,n=>on(n)?NaN:s6x(n)*(1-u1),-12,12,u1>0.98?C.mid:C.in));
      const col=u2>0.5?C.out:(u1>0.5?C.mid:C.in);
      s6stems(a,n=>on(n)?s6x(n):NaN,-12,12,col,n=>n*(1-u2)+(n/N)*u2);
      return a.svg(); },
      caption:'The running sequence, with $N=3$. Press Next: the values between the marks become zero, then the zeros are removed and the kept samples close up.'},
    {t:'legend', items:[['in','$x[n]$'],['mid','$x_p[n]$'],['out','$x_b[n]$']]}
  ], right:[
    {t:'eq', tex:'x_b[n]=x_p[nN]=x[nN]', label:'Decimation by $N$',
      note:'Keep every $N$-th value and close the gaps. The zeros of $x_p[n]$ carry nothing, so storing them wastes memory.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'Downsampling', html:'If $x[n]$ holds samples of $x(t)$ taken every $T$, then $x_b[n]$ holds samples taken every $NT$. The sampling rate falls by the factor $N$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'$x[n]=n$ for $0\\le n\\le11$, and $N=4$.<div class="nsep"></div>What is $x_b[2]$?',
        ask:{key:'m7-decim', choices:['$8$','$2$','$6$'], answer:0,
          why:'$x_b[2]=x[2\\cdot4]=x[8]=8$.'}}]}
  ]}
]},

{ id:'m7-decim-b', module:'M7', nav:'Decimation · the spectrum', title:'Decimation Stretches the Spectrum', src:'—',
  objective:'Derive X_b(e^{jw}) = X_p(e^{jw/N}) by an index change and watch the sampled spectrum stretch by N.',
  keywords:'decimation spectrum stretch X_b(e^{jw}) = X_p(e^{jw/N}) index change n = kN band edge N omega_M period 2 pi',
  slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 7 · Decimation', src:'—'},
  {t:'title', text:'Decimation Stretches the Spectrum'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$X_p(e^{j\\omega})$ with $N=3$','$X_b(e^{j\\omega})=X_p(e^{j\\omega/3})$: stretched by $3$']},
      svg:v=>{
      /* the frequency axis of X_p is stretched from 1 to N as the frame runs */
      const f=v?v.frame:0, N=3, s=1+(N-1)*cl(f);
      const a=s6AX({h:320,yr:[-0.2,4.3],ylabel:f<0.5?'X_p(e^{j\\omega})':'X_b(e^{j\\omega})',yticksOverride:[0,8/3],
        ytickfmt:y=>y<1e-9?'0':'8/3'});
      s6Copies(a,N,S6W,S6PK,s);
      s6Period(a,3.3);
      return a.svg(); },
      caption:'Press Next to decimate the running sequence by $N=3$. The copies at $2\\pi/3$ and $4\\pi/3$ move out to $2\\pi$ and $4\\pi$; the band $\\pi/4$ widens to $3\\pi/4$.'},
    {t:'legend', items:[['in','$k=0$'],['mid','$k=1,2$']]}
  ], right:[
    {t:'eq', tex:'X_b(e^{j\\omega})=\\sum_{k}x_b[k]\\,e^{-j\\omega k}=\\sum_{k}x_p[kN]\\,e^{-j\\omega k}',
      label:'Step 1 · The definition',
      note:'Put $x_b[k]=x_p[kN]$ into the definition.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\sum_{k}x_p[kN]\\,e^{-j(\\omega/N)kN}=\\sum_{n}x_p[n]\\,e^{-j(\\omega/N)n}',
        label:'Step 2 · Put $n=kN$',
        note:'$\\omega k=(\\omega/N)(kN)$; every other term of $x_p[n]$ is zero.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'X_b(e^{j\\omega})=X_p\\bigl(e^{j\\omega/N}\\bigr)', label:'Decimation stretches the spectrum',
        note:'A band edge $\\omega_M$ moves to $N\\omega_M$; the period stays $2\\pi$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The running sequence, $\\omega_M=\\pi/4$, is decimated with $N=2$.<div class="nsep"></div>Where is the band edge of $X_b(e^{j\\omega})$?',
        ask:{key:'m7-decim-b', choices:['$\\pi/2$','$\\pi/8$','$\\pi/4$'], answer:0,
          why:'$N\\omega_M=2\\cdot\\pi/4=\\pi/2$.'}}]}
  ]}
]},

{ id:'m7-decim-c', module:'M7', nav:'Decimation · the prefilter', title:'Filter Before You Decimate', src:'—',
  objective:'See and hear why a sequence is low-pass filtered at pi/N before it is decimated.',
  keywords:'decimation prefilter anti-aliasing low-pass pi/N tone mixture 500 Hz 3 kHz 8 kHz alias 1 kHz sound listen',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 7 · Decimation', src:'—'},
  {t:'title', text:'Filter Before You Decimate'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$X(e^{j\\omega})$','$\\downarrow2$ with no filter','low-pass first, then $\\downarrow2$']},
      listen:{items:[
        {label:'Play $x[n]$', sound:()=>({f:t=>s6cos(500)(t)+s6cos(3000)(t), dur:1.2})},
        {label:'No filter', sound:()=>({f:t=>s6cos(500)(t)+s6cos(1000)(t), dur:1.2})},
        {label:'Filtered', sound:()=>({f:s6cos(500), dur:1.2})}]},
      svg:v=>{
      /* frame 1 stretches every line by 2 and lets the copies shifted by 2 pi
         fade in; the 3 pi/4 line turns red, since 3 pi/2 is -pi/2 in the next
         period. Frame 2 removes it, as the low-pass would before the sampler. */
      const f=v?v.frame:0, u=cl(f), g=cl(f-1), s=1+u;
      const a=s6AX({h:300,yr:[-0.3,2.4],ylabel:f<0.5?'X(e^{j\\omega})':'X_b(e^{j\\omega})',yticksOverride:[]});
      fade(a,1-u,()=>s6band(a,PI/2,1.3));
      const put=(w0,col,op)=>fade(a,op,()=>{ for(let m=-4;m<=4;m++) for(const sg of [1,-1]){
        const p0=sg*w0+2*PI*m, p=p0*s;
        if(Math.abs(p)<=3*PI+1e-9) a.impulse(p,1,{color:col,label:false});
        /* the copy of the decimator, one period of the input to the side */
        const q=(p0+PI)*s; if(u>0.02 && Math.abs(q)<=3*PI+1e-9) fade(a,u,()=>a.impulse(q,1,{color:col,label:false})); } });
      put(S6W1,C.in,1-g); put(S6W1,C.out,g);
      put(S6W2,C.in,1-u); put(S6W2,C.err,u*(1-g));
      s6Period(a,1.95);
      return a.svg(); },
      caption:'$500$ Hz and $3$ kHz at $8$ kHz: $x[n]=\\cos(\\pi n/8)+\\cos(3\\pi n/4)$. Press Next to decimate by $2$; each button plays at its own rate.'},
    {t:'legend', items:[['in','tones of $x[n]$'],['err','alias of $3$ kHz'],['out','after the filter'],['h','$|\\omega|<\\pi/2$',true]]}
  ], right:[
    {t:'eq', tex:'x[n]\\to\\boxed{H_d(e^{j\\omega})}\\to\\boxed{\\downarrow N}\\to x_b[n],\\qquad H_d=\\begin{cases}1, & |\\omega|<\\pi/N\\\\ 0, & \\text{otherwise}\\end{cases}',
      label:'Decimate with a prefilter',
      note:'After the low-pass the band edge is at most $\\pi/N$, so the stretch by $N$ keeps it inside $|\\omega|\\le\\pi$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'err', head:'The filter comes first', html:'Here $2\\cdot3\\pi/4=3\\pi/2$, which is $-\\pi/2$ in the next period: the $3$ kHz tone is heard at $1$ kHz. After the decimator no filter can separate it from wanted content.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'The same $8$ kHz mixture is decimated with $N=4$ and no filter.<div class="nsep"></div>Which tone keeps its pitch?',
        ask:{key:'m7-decim-c', choices:['$500$ Hz','$3$ kHz','neither'], answer:0,
          why:'The new rate is $2$ kHz. Only $500$ Hz stays inside: $4\\cdot\\pi/8=\\pi/2<\\pi$, while $4\\cdot3\\pi/4=3\\pi$.'}}]}
  ]}
]},

/* --------------------------------------------------------------- interpolation */
{ id:'m7-upsamp', module:'M7', nav:'Interpolation', title:'Interpolation: Zeros, Then a Filter', src:'—',
  objective:'Raise the rate of a sequence by inserting N - 1 zeros between its samples and filling them with a low-pass filter.',
  keywords:'interpolation upsampling insert zeros time expansion x_(N)[n] low-pass fill in kept samples y[kN] = x_b[k] rate rises by N',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 7 · Interpolation', src:'—'},
  {t:'title', text:'Interpolation: Zeros, Then a Filter'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$x_b[n]$: the samples','$x_{(3)}[n]$: two zeros in each gap','$y[n]$: the zeros filled in']},
      svg:v=>{
      /* N = 3: frame 1 moves the sample at n = m out to n = 3m and puts zeros
         between; frame 2 grows each zero to the band-limited value */
      const f=v?v.frame:0, N=3, u1=cl(f), u2=cl(f-1);
      const on = n => ((n%N)+N)%N===0, y = n => s6x(n/N);
      const a=AX({h:340,xr:[-18.6,18.6],yr:[-0.2,1.45],xlabel:'n',
        ylabel:f<0.5?'x_b[n]':(f<1.5?'x_{(3)}[n]':'y[n]'),yticksOverride:[0,0.5,1],xticksOverride:[-18,-12,-6,0,6,12,18]});
      if(u1>0.98) s6stems(a,n=>on(n)?NaN:y(n)*u2,-18,18,u2>0.02?C.out:C.mid,null,3.6);
      s6stems(a,n=>s6x(n),-6,6,u1>0.5?C.mid:C.in,n=>n*(1+(N-1)*u1),4.6);
      return a.svg(); },
      caption:'The samples $x_b[n]=\\bigl(\\sin(\\pi n/8)/(\\pi n/8)\\bigr)^{2}$ and $N=3$. Press Next: two zeros go into each gap, and the low-pass fills them in. The kept samples do not move.'},
    {t:'legend', items:[['in','$x_b[n]$'],['mid','$x_{(3)}[n]$'],['out','new values of $y[n]$']]}
  ], right:[
    {t:'eq', tex:'x_{(N)}[n]=\\begin{cases}x_b[n/N], & n=0,\\pm N,\\pm2N,\\dots\\\\ 0, & \\text{otherwise}\\end{cases}',
      label:'Step 1 · Insert $N-1$ zeros',
      note:'This is the {{sym:expan|time expansion}} of Module 6, with the transform $X_b\\bigl(e^{jN\\omega}\\bigr)$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'y[n]=\\bigl(x_{(N)}*h\\bigr)[n],\\qquad H(e^{j\\omega})=\\begin{cases}N, & |\\omega|<\\pi/N\\\\ 0, & \\pi/N<|\\omega|\\le\\pi\\end{cases}',
        label:'Step 2 · Filter',
        note:'The low-pass fills every zero. Its impulse response is $1$ at $n=0$ and $0$ at the other multiples of $N$, so $y[kN]=x_b[k]$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'A sequence is interpolated with $N=4$.<div class="nsep"></div>How many zeros go between two neighbouring samples?',
        ask:{key:'m7-upsamp', choices:['$3$','$4$','$1$'], answer:0,
          why:'$N-1=3$ zeros fill each gap, so the rate rises by $4$.'}}]}
  ]}
]},

{ id:'m7-upsamp-b', module:'M7', nav:'Interpolation · images', title:'Images, and the Filter That Removes Them', src:'—',
  objective:'See and hear the images that zero insertion creates, and remove them with a low-pass filter of gain N and cutoff pi/N.',
  keywords:'interpolation images X(e^{jNw}) period 2 pi/N compressed spectrum low-pass gain N cutoff pi/N tone 500 Hz 3.5 kHz sound',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 7 · Interpolation', src:'—'},
  {t:'title', text:'Images, and the Filter That Removes Them'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$X_b(e^{j\\omega})$','$X_b(e^{j2\\omega})$: images','the low-pass, gain $2$']},
      listen:{items:[
        {label:'Play $x_b[n]$', sound:()=>({f:s6cos(500), dur:1.2})},
        {label:'Zeros in', sound:()=>({f:t=>0.5*s6cos(500)(t)+0.5*s6cos(3500)(t), dur:1.2})},
        {label:'Filtered', sound:()=>({f:s6cos(500), dur:1.2})}]},
      svg:v=>{
      /* frame 1 compresses the axis by 2: a line at pi/4 + 2 pi m moves to
         pi/8 + pi m, and the ones with m odd are images. Frame 2 brings in the
         filter, removes the images and doubles what is kept. */
      const f=v?v.frame:0, u=cl(f), g=cl(f-1), s=1+u;
      const a=s6AX({h:300,yr:[-0.3,3.3],ylabel:f<0.5?'X_b(e^{j\\omega})':'X_{(2)}(e^{j\\omega})',yticksOverride:[]});
      fade(a,g,()=>s6band(a,PI/2,2));
      for(let m=-5;m<=5;m++) for(const sg of [1,-1]){
        const p=(sg*PI/4+2*PI*m)/s; if(Math.abs(p)>3*PI+1e-9) continue;
        const img=Math.abs(m)%2===1, h=1/s;
        if(img){ fade(a,1-u,()=>a.impulse(p,h,{color:C.in,label:false}));
                 fade(a,u*(1-g),()=>a.impulse(p,h,{color:C.err,label:false})); }
        else { fade(a,1-g,()=>a.impulse(p,h,{color:C.in,label:false}));
               fade(a,g,()=>a.impulse(p,h*(1+g),{color:C.out,label:false})); }
      }
      s6Period(a,2.45);
      return a.svg(); },
      caption:'$500$ Hz at $4$ kHz, $x_b[n]=\\cos(\\pi n/4)$, interpolated by $N=2$. The images at $\\pm7\\pi/8$ sound as a $3.5$ kHz whistle.'},
    {t:'legend', items:[['in','$x_b[n]$'],['err','image'],['out','kept'],['h','$H(e^{j\\omega})$',true]]}
  ], right:[
    {t:'eq', tex:'x_{(N)}[n]\\;\\longleftrightarrow\\;X_b\\bigl(e^{jN\\omega}\\bigr),\\qquad\\text{period }\\frac{2\\pi}{N}',
      label:'The images',
      note:'One period of $2\\pi$ now holds $N$ copies: the wanted one at $\\omega=0$ and $N-1$ images centred at $2\\pi k/N$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'The filter', html:'A low-pass of gain $N$ and cutoff $\\pi/N$ keeps the copy at $\\omega=0$ and removes the images. The gain keeps the old samples at their values.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'$x_b[n]=\\cos(\\pi n/4)$ is interpolated with $N=4$ and no filter.<div class="nsep"></div>How many copies of the tone does one period of $2\\pi$ hold?',
        ask:{key:'m7-upsamp-b', choices:['$4$','$1$','$2$'], answer:0,
          why:'The spectrum repeats every $2\\pi/4$, so a period holds the wanted copy and $3$ images.'}}]}
  ]}
]},

/* ------------------------------------------------------------ rational factor */
{ id:'m7-rational', module:'M7', nav:'A rate change by L/M', title:'Changing the Rate by $L/M$', src:'—',
  objective:'Change the rate of a sequence by a rational factor: up by L, one low-pass filter, down by M.',
  keywords:'rational rate change L/M upsample filter downsample 48 kHz 44.1 kHz 147/160 greatest common divisor 300 cutoff min pi/L pi/M',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 7 · Rate change', src:'—'},
  {t:'title', text:'Changing the Rate by $L/M$'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$x[n]$: one sample per unit','$\\uparrow3$: two zeros in each gap','the low-pass fills the gaps','$\\downarrow2$: every second kept']},
      svg:v=>{
      /* L = 3, M = 2 on one time axis measured in units of the old sample
         spacing: x[n] = cos(pi n/5) at t = n, the fine sequence at t = n/3,
         the output y[m] = cos(2 pi m/15) at t = 2m/3 */
      const f=v?v.frame:0, u1=cl(f), u2=cl(f-1), u3=cl(f-2);
      const a=AX({h:340,xr:[-0.4,10.4],yr:[-1.35,2.3],xlabel:'t/T',ylabel:f<2.5?'\\text{samples}':'y[m]',
        yticksOverride:[-1,0,1],xticksOverride:[0,2,4,6,8,10]});
      a.curve(t=>Math.cos(PI*t/5),{color:C.in,width:1.3,dash:'5 5',n:800});
      const fine = D(i=>i,0,30);
      /* the new points: zero after the insertion, filled by the filter */
      fade(a,u1,()=>{ const keepOut=i=>i%2===0;
        fine.forEach(([i])=>{ if(i%3===0) return;
          const val=Math.cos(PI*i/15)*u2, col=u3>0.5?(keepOut(i)?C.out:C.mid):C.mid, op=u3>0 && !keepOut(i) ? 1-u3 : 1;
          fade(a,op,()=>a.stem([[i/3,val]],{color:col,r:3.8})); }); });
      /* the old samples: they stay, and those at even i are kept by the down-sampler */
      fine.forEach(([i])=>{ if(i%3) return;
        const col=u3>0.5?(i%2===0?C.out:C.mid):(u1>0.5?C.mid:C.in), op=u3>0 && i%2 ? 1-u3 : 1;
        fade(a,op,()=>a.stem([[i/3,Math.cos(PI*i/15)]],{color:col,r:4.4})); });
      return a.svg(); },
      caption:'$x[n]=\\cos(\\pi n/5)$ lies on the dashed curve, and $L/M=3/2$. Press Next: up by $3$, fill, then keep every second value. The output has $3$ samples in every $2$ units of time.'},
    {t:'legend', items:[['in','$x[n]$'],['mid','after $\\uparrow3$ and the filter'],['out','$y[m]$']]}
  ], right:[
    {t:'eq', tex:'x[n]\\to\\boxed{\\uparrow L}\\to\\boxed{H,\\ \\text{gain }L,\\ \\omega_c=\\min\\bigl(\\tfrac{\\pi}{L},\\tfrac{\\pi}{M}\\bigr)}\\to\\boxed{\\downarrow M}\\to y[m]',
      label:'Up by $L$, filter, down by $M$',
      note:'The rate changes by $L/M$. One filter does both jobs: it removes the images of $\\uparrow L$ and prevents the aliasing of $\\downarrow M$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\frac{44100}{48000}=\\frac{44100/300}{48000/300}=\\frac{147}{160}\\;\\Longrightarrow\\;L=147,\\;M=160',
        label:'From $48$ kHz to $44.1$ kHz',
        note:'$300$ is the greatest common divisor. The filter runs at $48\\cdot147=7056$ kHz with cutoff $\\pi/160$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'A $44.1$ kHz recording is converted to $48$ kHz.<div class="nsep"></div>Which ratio $L/M$ does it use?',
        ask:{key:'m7-rational', choices:['$160/147$','$147/160$','$48/44$'], answer:0,
          why:'The rate rises by $48000/44100=160/147$: up by $160$, down by $147$.'}}]}
  ]}
]},

/* ============================================================ closing the section */
realGallery({ id:'m7-real-rate', nav:'Rate changes around us',
  title:'Rate Changes Around Us', eyebrow:'Module 7 · Decimation and interpolation', src:'—',
  objective:'Recognise everyday devices that lower or raise the rate of a sequence, each with its filter.',
  keywords:'examples audio resampling 48 kHz 44.1 kHz thumbnail photo pixels slow motion frame interpolation data logger every tenth reading average',
  figs:[
    [()=>{ const a=P.Axes(EXO({xr:[-0.02,1.02],yr:[-1.3,2.3],xlabel:'t\\;(\\text{ms})',ylabel:'v\\;(\\text{V})',xticksOverride:[0,0.25,0.5,0.75,1],yticksOverride:[-1,0,1]}));
      a.curve(t=>Math.cos(2*PI*t),{color:C.in,width:1.6,dash:'7 5',n:600});
      a.stem(D(n=>Math.cos(2*PI*1000*n/44100),0,44).map(p=>[p[0]*1000/44100,p[1]]),{color:C.out,r:2.6,showZero:true});
      return a.svg(); }, 'A $1$ kHz tone moved to $44.1$ kHz: $v[n]=\\cos(2\\pi\\cdot1000\\,n/44100)$ V.',
      [['in','$v(t)$',true],['out','$v[n]$']]],
    [()=>{ const b=x=>0.5+0.25*Math.cos(2*PI*x/32)+0.15*Math.cos(2*PI*x/3);
      const a=P.Axes(EXO({xr:[-0.8,32.8],yr:[-0.05,1.5],xlabel:'x\\;(\\text{pixel})',ylabel:'b\\;(\\text{norm.})',xticksOverride:[0,8,16,24,32],yticksOverride:[0,0.5,1]}));
      a.stem(D(i=>b(i),0,31),{color:C.in,r:2.2,width:1.3});
      a.stem(D(m=>(b(4*m)+b(4*m+1)+b(4*m+2)+b(4*m+3))/4,0,7).map(p=>[4*p[0]+1.5,p[1]]),{color:C.out,r:4,width:2.4});
      return a.svg(); }, 'A thumbnail pixel is the mean of four: $b_t[m]=\\tfrac14\\sum_{i=0}^{3}b[4m+i]$.',
      [['in','$b[x]$'],['out','$b_t[m]$']]],
    [()=>{ const h=t=>1.2-4.9*t*t;
      const a=P.Axes(EXO({xr:[-0.01,0.43],yr:[-0.1,1.85],xlabel:'t\\;(\\text{s})',ylabel:'h\\;(\\text{m})',xticksOverride:[0,0.1,0.2,0.3,0.4],yticksOverride:[0,0.5,1]}));
      a.stem(D(n=>h(n/120),0,48).filter(p=>p[0]%4).map(p=>[p[0]/120,p[1]]),{color:C.out,r:2.2,width:1.3});
      a.stem(D(n=>h(n/30),0,12).map(p=>[p[0]/30,p[1]]),{color:C.in,r:3.6});
      return a.svg(); }, 'Slow motion, $30$ to $120$ frames/s: $h[n]=1.2-4.9\\,(n/120)^{2}$ m.',
      [['in','filmed'],['out','made']]],
    [()=>{ const th=n=>1.2+0.8*Math.sin(2*PI*n/200)+0.5*Math.cos(2*PI*0.37*n);
      const a=P.Axes(EXO({xr:[-1.5,101.5],yr:[-0.3,3.5],xlabel:'t\\;(\\text{s})',ylabel:'\\theta\\;(^{\\circ}\\text{C})',xticksOverride:[0,20,40,60,80,100],yticksOverride:[0,1,2]}));
      a.stem(D(th,0,99),{color:C.in,r:1.5,width:0.9});
      a.stem(D(m=>{ let s=0; for(let i=0;i<10;i++) s+=th(10*m+i); return s/10; },0,9).map(p=>[10*p[0]+4.5,p[1]]),{color:C.out,r:4,width:2.4});
      return a.svg(); }, 'A logger keeps the mean of ten readings: $\\theta_{10}[m]=\\tfrac{1}{10}\\sum_{i=0}^{9}\\theta[10m+i]$.',
      [['in','$\\theta[n]$'],['out','$\\theta_{10}[m]$']]]
  ],
  notes:[
    {t:'note', kind:'def', head:'One operation, one filter', html:'Each device changes the rate of a sequence: by $147/160$, $1/4$, $4$ and $1/10$. Each keeps a low-pass beside it: the mean over the dropped samples, or the fill between new ones. Here $\\theta$ is the rise above $20^{\\circ}$C.'},
    {t:'note', kind:'warn', head:'Why the filter matters', html:'Without the mean, the fine stripes of the photo and the fast wobble of the reading would return as coarse false patterns. That is aliasing, one sequence at a time.'}
  ]}),

labScene({ id:'m7-lab-j6', lab:'J6', nav:'Decimation and Interpolation', title:'Decimation and Interpolation', src:'—',
  objective:'Choose a sequence and a factor N, decimate or interpolate it with the filter on or off, and read the new band edge and the verdict.',
  keywords:'laboratory decimate interpolate factor N filter on off band edge aliasing images spectrum period time sequence triangle two tones' }),

codeScene({ id:'m7-code-rate', nav:'Decimation and interpolation', title:'Decimation and Interpolation in Code', src:'—', eyebrow:'Decimation and interpolation in code',
  objective:'Sample, decimate, interpolate and change the rate of a sequence in MATLAB and in Python, and predict each result before running it.',
  keywords:'code matlab python sampled sequence decimate prefilter alias interpolate images rational rate change 147/160 run' }),

/* </m7-s6> */

/* <m7-s7> ============================================ 7.7 summary */

/* ============================================================ summary */
{ id:'m7-tables', module:'M7', nav:'Result summary', title:'Sampling Result Summary', src:'pp. 80–88',
  objective:'Collect the sampling, reconstruction and aliasing results of the module for reference.',
  keywords:'summary table reference sampler rates sampled spectrum guard band theorem nyquist band-pass sampling reconstruction filter interpolation zero-order hold first-order hold alias chirp anti-aliasing transition band 44.1 kHz',
  budget:'A reference table of results in two columns, with one closing note.',
  slide:true, steps:1, blocks:[
  {t:'eyebrow', text:'Module 7 · Reference', src:'pp. 80–88'},
  {t:'title', text:'Sampling Result Summary'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'sub', text:'Sampling and the theorem'},
    {t:'wex', rows:[
      ['Sampler','$x_p(t)=x(t)\\sum_n\\delta(t-nT)=\\sum_nx(nT)\\,\\delta(t-nT)$'],
      ['Rates','$\\omega_s=2\\pi/T$ in rad/s, $f_s=1/T$ in Hz, $\\omega_s=2\\pi f_s$'],
      ['Sampled spectrum','$X_p(j\\omega)=\\frac{1}{T}\\sum_kX\\bigl(j(\\omega-k\\omega_s)\\bigr)$ at every rate'],
      ['Guard band','$\\omega_s-2\\omega_M$: positive, zero at the Nyquist rate, negative when the copies overlap'],
      ['Sampling theorem','$X(j\\omega)=0$ for $|\\omega|>\\omega_M$ and $\\omega_s>2\\omega_M$: the samples $x(nT)$ fix $x(t)$'],
      ['Nyquist rate','$2\\omega_M$ rad/s; the rate must be strictly above it'],
      ['Band-pass sampling','$\\omega_L<|\\omega|<\\omega_L+B$ with $\\omega_L$ a whole multiple of $B$: the copies fit at $\\omega_s=2B$']
    ]}
  ], right:[
    {t:'sub', text:'Reconstruction and aliasing'},
    {t:'wex', rows:[
      ['Ideal filter','$H_r(j\\omega)=T$ for $|\\omega|<\\omega_c$, $0$ for $|\\omega|>\\omega_c$, with $\\omega_M<\\omega_c<\\omega_s-\\omega_M$'],
      ['Interpolation','$x_r(t)=\\sum_nx(nT)\\,\\frac{T\\sin(\\omega_c(t-nT))}{\\pi(t-nT)}$'],
      ['Zero-order hold','$H_0(j\\omega)=e^{-j\\omega T/2}\\,\\frac{2\\sin(\\omega T/2)}{\\omega}$, with $H_0(j0)=T$'],
      ['First-order hold','$H_1(j\\omega)=\\frac{1}{T}\\bigl[\\frac{\\sin(\\omega T/2)}{\\omega/2}\\bigr]^{2}$, with $H_1(j0)=T$'],
      ['Alias of a cosine','$\\frac{\\omega_s}{2}<\\omega_0<\\omega_s$ and $\\omega_c=\\frac{\\omega_s}{2}$: $x_r(t)=\\cos\\bigl((\\omega_s-\\omega_0)t\\bigr)$'],
      ['Chirp','$\\cos\\phi(t)$: frequency $f=\\frac{1}{2\\pi}\\frac{d\\phi}{dt}$ at each moment, heard at the fold $|f-kf_s|<f_s/2$'],
      ['Anti-aliasing','A lowpass with cutoff $\\omega_s/2$, placed before the sampler'],
      ['Transition band','A real filter that passes $|f|<f_M$ and stops above $f_M+\\Delta$ needs $f_s\\ge2(f_M+\\Delta)$']
    ]}
  ]},
  {t:'reveal', at:1, items:[
    {t:'note', kind:'warn', head:'Rows with a condition', html:'The <b>theorem</b> needs a band-limited $x(t)$, and a signal of finite duration never is. With $\\omega_c=\\pi/T$ the <b>interpolation</b> kernel is $\\operatorname{sinc}(\\pi t/T)$, where $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$.'}]}
]},

{ id:'m7-tables-b', module:'M7', nav:'Result summary · discrete time', title:'Discrete-Time Result Summary', src:'—',
  objective:'Collect the results on processing samples and on changing the rate of a sequence for reference.',
  keywords:'summary table reference C/D D/C converter frequency map Omega = omega T rad/sample equivalent system digital cutoff differentiator half-sample delay quantization step SNR 6 dB per bit sampling a sequence decimation prefilter interpolation images rate change L/M',
  budget:'A reference table of results in two columns, with one closing note.',
  slide:true, steps:1, blocks:[
  {t:'eyebrow', text:'Module 7 · Reference', src:'—'},
  {t:'title', text:'Discrete-Time Result Summary'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'sub', text:'Processing the samples'},
    {t:'wex', rows:[
      ['Converters','$x_d[n]=x_c(nT)$ at C/D, $y_c(nT)=y_d[n]$ at D/C'],
      ['Frequency map','$\\Omega=\\omega T$ in rad/sample, so $\\omega_s$ lands on $2\\pi$'],
      ['Spectrum of $x_d[n]$','$X_d(e^{j\\Omega})=\\frac{1}{T}\\sum_kX_c\\bigl(j\\,\\frac{\\Omega-2\\pi k}{T}\\bigr)$'],
      ['Equivalent system','$H_{\\text{eff}}(j\\omega)=H_d(e^{j\\omega T})$ for $|\\omega|<\\omega_s/2$, $0$ above'],
      ['Digital cutoff','$f_c=\\frac{\\Omega_c}{2\\pi}f_s$ in Hz: it moves with $f_s$'],
      ['Differentiator','$H_d(e^{j\\Omega})=j\\Omega/T$ for $|\\Omega|<\\pi$'],
      ['Half-sample delay','$H_d(e^{j\\Omega})=e^{-j\\Omega/2}$, $h[n]=\\frac{\\sin(\\pi(n-1/2))}{\\pi(n-1/2)}$'],
      ['Quantization','$B$ bits over $-1$ to $1$: $\\Delta=2/2^{B}$, $|e[n]|\\le\\Delta/2$, noise power $\\Delta^{2}/12$'],
      ['Signal to noise','$\\text{SNR}\\approx6.02B+1.76$ dB for a full-scale sine']
    ]}
  ], right:[
    {t:'sub', text:'Changing the rate of a sequence'},
    {t:'wex', rows:[
      ['Sampling','$x_p[n]=x[n]\\sum_k\\delta[n-kN]$: $x[n]$ at $n=kN$, $0$ elsewhere'],
      ['Its spectrum','$X_p(e^{j\\omega})=\\frac{1}{N}\\sum_{k=0}^{N-1}X\\bigl(e^{j(\\omega-k\\omega_s)}\\bigr)$, $\\omega_s=2\\pi/N$'],
      ['No aliasing','$\\omega_M<\\pi/N$, that is $\\omega_s>2\\omega_M$'],
      ['Recovery','A low-pass of gain $N$ with $\\omega_M<\\omega_c<\\omega_s-\\omega_M$'],
      ['Decimation','$x_b[n]=x[nN]$ and $X_b(e^{j\\omega})=X_p(e^{j\\omega/N})$'],
      ['Prefilter','A low-pass with cutoff $\\pi/N$, placed before $\\downarrow N$'],
      ['Interpolation','$N-1$ zeros give $X_b(e^{jN\\omega})$; then a low-pass of gain $N$ and cutoff $\\pi/N$'],
      ['Rate $L/M$','$\\uparrow L$, one low-pass of gain $L$ and cutoff $\\min(\\pi/L,\\pi/M)$, then $\\downarrow M$']
    ]}
  ]},
  {t:'reveal', at:1, items:[
    {t:'note', kind:'warn', head:'Read the frequency variable', html:'On the left, $\\omega$ is in rad/s and $\\Omega$ in rad/sample; the <b>equivalent system</b> needs a band-limited input and $\\omega_s>2\\omega_M$. On the right, $\\omega$ is the frequency of a sequence, in rad/sample, and every spectrum repeats every $2\\pi$.'}]}
]},

{ id:'m7-quick', module:'M7', nav:'Quick check', title:'Quick check', src:'pp. 80–88',
  objective:'Check the module ideas with twelve short predictions, two from each teaching section.',
  keywords:'quick check predict sampling frequency hertz rad/s copy height 1/T nyquist rate boundary cutoff zero-order hold alias wheel digital cutoff hertz bits SNR decimation band edge rate change L/M low-pass cutoff',
  budget:'A set of twelve prediction cards; the questions carry no figure.',
  slide:true, steps:0, blocks:[
  {t:'eyebrow', text:'Module 7 · Quick check', src:'pp. 80–88'},
  {t:'title', text:'Quick Check'},
  {t:'grid', cols:4, gap:'22px 20px', style:'flex:1;grid-auto-rows:1fr;padding-bottom:8px', items:[
    [{t:'note', kind:'def', head:'Units', html:'$T=0.1$ ms. In hertz, the sampling frequency $f_s$ is',
      ask:{key:'m7-qc0', choices:['$20000\\pi$','$10000$','$1000$'], answer:1,
        why:'$f_s=1/T$ in hertz.'}}],
    [{t:'note', kind:'def', head:'Copy height', html:'$X(j\\omega)$ peaks at $1$ and $T=0.2$ s. Each copy in $X_p(j\\omega)$ peaks at',
      ask:{key:'m7-qc1', choices:['$0.2$','$1$','$5$'], answer:2,
        why:'Each copy is scaled by $1/T$.'}}],
    [{t:'note', kind:'def', head:'Nyquist rate', html:'In rad/s, the Nyquist rate of $\\cos(300\\pi t)+\\cos(700\\pi t)$ is',
      ask:{key:'m7-qc2', choices:['$1000\\pi$','$1400\\pi$','$700\\pi$'], answer:1,
        why:'Twice $700\\pi$.'}}],
    [{t:'note', kind:'def', head:'Boundary', html:'$\\sin(50\\pi t)$ is sampled at exactly $\\omega_s=100\\pi$ rad/s. Every sample is',
      ask:{key:'m7-qc3', choices:['$0$','$1$','$\\pm1$ in turn'], answer:0,
        why:'Each sample is $\\sin(\\pi n)=0$.'}}],
    [{t:'note', kind:'def', head:'Cutoff', html:'$\\omega_M=3\\pi$ and $\\omega_s=10\\pi$ rad/s. A working cutoff $\\omega_c$ is',
      ask:{key:'m7-qc4', choices:['$2\\pi$','$5\\pi$','$8\\pi$'], answer:1,
        why:'It needs $3\\pi<\\omega_c<7\\pi$.'}}],
    [{t:'note', kind:'def', head:'Zero-order hold', html:'$T=1$ ms. In rad/s, $|H_0(j\\omega)|$ first reaches zero at',
      ask:{key:'m7-qc5', choices:['$1000\\pi$','$1000$','$2000\\pi$'], answer:2,
        why:'The first zero is at $\\omega_s$.'}}],
    [{t:'note', kind:'def', head:'Alias', html:'$\\cos(10\\pi t)$, $\\omega_s=16\\pi$ rad/s, $\\omega_c=8\\pi$. The output is $\\cos(\\omega t)$ with $\\omega=$',
      ask:{key:'m7-qc6', choices:['$10\\pi$','$6\\pi$','$26\\pi$'], answer:1,
        why:'$16\\pi-10\\pi=6\\pi<8\\pi$.'}}],
    [{t:'note', kind:'def', head:'Wheel', html:'A wheel turns at $23$ rev/s, filmed at $24$ frames/s. On film, its rate in rev/s is',
      ask:{key:'m7-qc7', choices:['$23$','$1$','$-1$'], answer:2,
        why:'It turns back: $23-24$.'}}],
    [{t:'note', kind:'def', head:'Digital cutoff', html:'A digital low-pass keeps $|\\Omega|<\\pi/3$ at $f_s=48$ kHz. In kHz, it cuts off at',
      ask:{key:'m7-qc8', choices:['$8$','$16$','$24$'], answer:0,
        why:'$f_c=\\tfrac{\\Omega_c}{2\\pi}f_s=\\tfrac16\\cdot48$ kHz.'}}],
    [{t:'note', kind:'def', head:'Bits', html:'A full-scale sine is rounded to $B=10$ bits. In dB, its SNR is about',
      ask:{key:'m7-qc9', choices:['$31$','$62$','$124$'], answer:1,
        why:'$6.02\\cdot10+1.76\\approx62$ dB.'}}],
    [{t:'note', kind:'def', head:'Decimation', html:'Decimation by $N=3$ moves the band edge $\\omega_M=\\pi/8$ of a sequence to',
      ask:{key:'m7-qc10', choices:['$\\pi/24$','$\\pi/8$','$3\\pi/8$'], answer:2,
        why:'It is $N\\omega_M$.'}}],
    [{t:'note', kind:'def', head:'Rate change', html:'$32$ kHz becomes $48$ kHz with $L=3$, $M=2$. The low-pass cuts off at',
      ask:{key:'m7-qc11', choices:['$\\pi/3$','$\\pi/2$','$2\\pi/3$'], answer:0,
        why:'It is $\\min(\\pi/L,\\pi/M)$.'}}]
  ]}
]},

{ id:'m7-synth', module:'M7', nav:'Module 7 synthesis', title:'Module 7 — what to carry forward', src:'pp. 80–88',
  dark:true, objective:'Consolidate the module and lead into the closing synthesis of the course.',
  keywords:'synthesis summary module 7 sampling impulse train rates replication guard band aliasing theorem reconstruction interpolation zero-order hold first-order hold alias discrete-time processing equivalent system quantization bits decimation interpolation rate change', steps:1, blocks:[
  {t:'eyebrow', text:'Module 7 · Synthesis', src:'pp. 80–88'},
  {t:'title', text:'Module 7 Summary'},
  /* Twelve results as prompts, in the order of the module: the student
     answers each one, then opens the card. The sketch on each card is the
     picture to remember. */
  {t:'raw', html:()=>RECALL.deck('m7', [
    {q:'What does an ideal sampler produce?', glyph:G7.samp,
     a:'$x_p(t)=\\sum_nx(nT)\\,\\delta(t-nT)$: an impulse at every $nT$ weighted by $x(nT)$. The rate is $\\omega_s=2\\pi/T$ rad/s, or $f_s=1/T$ Hz.'},
    {q:'The spectrum of the samples', glyph:G7.copies,
     a:'$X_p(j\\omega)=\\frac{1}{T}\\sum_kX\\bigl(j(\\omega-k\\omega_s)\\bigr)$: a copy at every multiple of $\\omega_s$, scaled by $1/T$, at every rate.'},
    {q:'The guard band', glyph:G7.guard,
     a:'The gap $\\omega_s-2\\omega_M$ between the baseband and the first copy. It is positive, zero at the Nyquist rate, or negative.'},
    {q:'What is aliasing?', glyph:G7.alias,
     a:'Neighbouring copies overlap, only when $\\omega_s<2\\omega_M$. No filter after the sampler undoes it; a lowpass before it prevents it.'},
    {q:'The sampling theorem', glyph:G7.theorem,
     a:'If $X(j\\omega)=0$ for $|\\omega|>\\omega_M$ and $\\omega_s>2\\omega_M$, the samples fix $x(t)$. Equality is not enough.'},
    {q:'Ideal reconstruction', glyph:G7.interp,
     a:'A lowpass of gain $T$ with $\\omega_M<\\omega_c<\\omega_s-\\omega_M$. In time, $x_r(t)=\\sum_nx(nT)\\,\\frac{T\\sin(\\omega_c(t-nT))}{\\pi(t-nT)}$.'},
    {q:'The zero-order hold', glyph:G7.zoh,
     a:'It holds each sample for $T$. $H_0(j\\omega)=e^{-j\\omega T/2}\\,\\frac{2\\sin(\\omega T/2)}{\\omega}$ equals $T$ at $\\omega=0$, sags in the band and leaks outside it.'},
    {q:'The first-order hold', glyph:G7.foh,
     a:'It joins the samples by straight lines. $H_1(j\\omega)=\\frac{1}{T}\\bigl[\\frac{\\sin(\\omega T/2)}{\\omega/2}\\bigr]^{2}$ falls off like $1/\\omega^{2}$, and the output is delayed by $T$.'},
    {q:'A cosine sampled too slowly', glyph:G7.alcos,
     a:'For $\\frac{\\omega_s}{2}<\\omega_0<\\omega_s$ and $\\omega_c=\\frac{\\omega_s}{2}$, $\\cos(\\omega_0t)$ comes back as $\\cos\\bigl((\\omega_s-\\omega_0)t\\bigr)$. A wheel on film and stripes on a pixel grid follow the same rule.'},
    {q:'Processing samples with numbers', glyph:G7.dtproc,
     a:'For a band-limited input and $\\omega_s>2\\omega_M$, C/D, $H_d$ and D/C act as $H_{\\text{eff}}(j\\omega)=H_d(e^{j\\omega T})$ for $|\\omega|<\\omega_s/2$, and $0$ above.'},
    {q:'Rounding to $B$ bits', glyph:G7.quant,
     a:'Over $-1$ to $1$ the step is $\\Delta=2/2^{B}$ and the error is at most $\\Delta/2$. A full-scale sine gets $\\text{SNR}\\approx6.02B+1.76$ dB.'},
    {q:'Changing the rate of a sequence', glyph:G7.decim,
     a:'Decimation keeps $x[nN]$ after a low-pass with cutoff $\\pi/N$. Interpolation adds $N-1$ zeros, then a low-pass of gain $N$, cutoff $\\pi/N$.'}
  ], {cols:2})},
  {t:'reveal', at:1, items:[
    {t:'note', kind:'ok', head:'After Module 7', html:'<span style="color:var(--graphite)">The closing synthesis joins the seven modules into one chain: signals, LTI systems and convolution, the transforms, and sampling as the bridge from continuous to discrete time.</span>'}]}
]},

/* Five optional projects for students who want to try the module on their own
   computer. They carry no grade and no code: each card gives an aim, what it
   practises, a few steps and what to look for. The briefs state no numerical
   answer beyond ones checked in verify/. */
{ id:'m7-projects', module:'M7', nav:'Projects to try', title:'Projects to Try', src:'pp. 80–88',
  dark:true, objective:'Offer five optional projects that show sampling and aliasing in sound, in images, on film and in a converter, and quantization in sound.',
  keywords:'projects matlab python audio resample decimate alias tone moire stripes camera wheel fan frame rate zero-order hold dac staircase sinc interpolation quantization bits SNR 6 dB per bit',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 7 · Projects', src:'pp. 80–88'},
  {t:'title', text:'Projects to Try'},
  {t:'raw', html:()=>PROJECTS.deck('m7', [
    {title:'Hearing a tone change pitch', glyph:G7.tone,
     aim:'Hear aliasing: lower the sampling rate of a tone and listen to it move to a different pitch.',
     learn:['A sampling rate in Hz and its half, $f_s/2$.',
            'Why a tone above $f_s/2$ comes back below it.',
            'Reading a pitch off a spectrum.'],
     steps:['Make one second of $\\cos(2\\pi\\cdot11000\\,t)$ at $48$ kHz.',
            'Keep every third sample. The new rate is $16$ kHz.',
            'Play both versions, each at its own rate, and plot the magnitude of their FFTs.',
            'Repeat with a $6$ kHz tone.'],
     look:'The $11$ kHz tone comes back at $16-11=5$ kHz. The $6$ kHz tone is below $f_s/2=8$ kHz and keeps its pitch.'},
    {title:'Moiré from fine stripes', glyph:G7.moire,
     aim:'See spatial aliasing: record fine stripes on a coarse grid and watch broad bands appear.',
     learn:['Position in place of time, cycles/mm in place of Hz.',
            'The alias of a pattern: $|f_s-f_0|$.',
            'Blurring before sampling as an anti-aliasing filter.'],
     steps:['Photograph a striped shirt or a fine mesh, stepping back until broad bands appear.',
            'On the computer, make $s(x)=\\cos(2\\pi\\cdot19\\,x)$ with $x$ in mm, on a fine grid over $5$ mm.',
            'Keep one point every $0.05$ mm, that is $20$ samples/mm, and plot them.',
            'Average $s(x)$ over each $0.05$ mm cell before keeping one point, and plot again.'],
     look:'The kept points trace one band per millimetre: $20-19=1$ cycle/mm. With the averaging first, the bands shrink to about $5\\,\\%$ of their depth.'},
    {title:'A wheel that turns backwards', glyph:G7.wheel,
     aim:'Film a turning wheel or fan and explain the motion the video shows.',
     learn:['A camera as a sampler with $T=1/f_s$.',
            'Rotation as a signal of angle against time.',
            'Taking the shortest way round between frames.'],
     steps:['Put one strip of tape on a fan blade or a bicycle wheel and film it at $30$ frames/s.',
            'Change the speed slowly and note when the tape seems to stop or run backwards.',
            'On the computer, plot the tape angle once per frame for $28$, $30$ and $32$ rev/s.',
            'Wrap each change of angle into half a turn either way.'],
     look:'At $28$ rev/s the tape seems to turn backwards at $2$ rev/s. At $30$ rev/s it stands still, and at $32$ rev/s it turns forwards at $2$ rev/s.'},
    {title:'A staircase against the ideal', glyph:G7.dac,
     aim:'Build the output of a zero-order hold converter and compare it with ideal reconstruction.',
     learn:['The zero-order hold as a filter with gain $T$ at $\\omega=0$.',
            'The interpolation sum with $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$.',
            'The error of a hold, measured as a number.'],
     steps:['Sample $x(t)=\\cos(2\\pi t)$ every $T=0.1$ s, for $|n|\\le200$.',
            'Hold each sample for $T$ on a fine time grid to make the staircase.',
            'Form $\\sum_nx(nT)\\operatorname{sinc}\\bigl(\\pi(t-nT)/T\\bigr)$ for $|t|\\le1$ s.',
            'Measure the RMS error of each against $x(t)$, then repeat with $T=0.05$ s.'],
     look:'The sinc sum stays within $10^{-4}$ of the cosine. The staircase lags by $T/2$ and has an RMS error near $0.25$; halving $T$ halves it to about $0.13$.'},
    {title:'Hearing the bits', glyph:G7.bits,
     aim:'Hear and measure quantization: round a tone to fewer and fewer bits and track the noise.',
     learn:['The step $\\Delta$ and the largest error $\\Delta/2$.',
            'The signal-to-noise ratio in dB.',
            'Why each extra bit adds about $6$ dB.'],
     steps:['Make two seconds of $x[n]=\\sin(2\\pi\\cdot441\\,n/8000)$, a tone sampled at $8$ kHz.',
            'Round it to $B$ bits over $-1$ to $1$: with $\\Delta=2/2^{B}$, take $\\Delta\\bigl(\\lfloor x[n]/\\Delta\\rfloor+\\tfrac12\\bigr)$, kept between $-1+\\Delta/2$ and $1-\\Delta/2$.',
            'Play the result for $B=8$, $4$ and $2$, and plot the error $x_q[n]-x[n]$ of each.',
            'Measure $10\\log_{10}\\bigl(\\sum x^{2}/\\sum(x_q-x)^{2}\\bigr)$ for $B=2$ to $12$ and plot it against $6.02B+1.76$ dB.'],
     look:'From $3$ bits up the measured SNR lies within $1$ dB of $6.02B+1.76$: each bit adds about $6$ dB. At $8$ bits it is near $50$ dB.'}
  ])}
]}

/* </m7-s7> */
];
window.SCENES_M7 = SC;
})();
