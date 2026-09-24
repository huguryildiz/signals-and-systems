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
/* </m7-s4-helpers> */
/* <m7-s5-helpers> */
/* </m7-s5-helpers> */
/* <m7-s6-helpers> */
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
    rates:  sv(ln('M1 40 H91',AX,1)+[0,1,2,3,4,5,6].map(k=>imp(10+k*12,20,AM)).join('')+ln('M34 11 V7 H46 V11',MK,1.3)),
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
    /* project cards */
    tone:   sv(ln('M1 40 H91',AX,1)+ln('M52 4 V42',AM,1.3,'3 3')+imp(72,10,CY)+imp(32,10,RD)+ln('M70 6 C62 0, 42 0, 34 6',MK,1.1,'2 3')),
    moire:  sv([...Array(46)].map((_,i)=>{ const x=2+i*1.95, o=0.15+0.8*Math.pow(Math.cos(Math.PI*(x-2)/88*2),2);
               return `<path d="M${x.toFixed(2)} 5 V39" stroke="${CY}" stroke-width="1.1" stroke-opacity="${o.toFixed(2)}"/>`; }).join('')),
    wheel:  sv(`<circle cx="46" cy="22" r="16" fill="none" stroke="${MK}" stroke-width="1.4"/>`+ln('M46 22 L57 11',CY,2.2)+dot(46,22,CY)
               +ln('M29 16 A18 18 0 0 1 40 5',RD,1.8)+`<path d="M27 21 l-2.2,-7.4 l6.8,1.6 Z" fill="${RD}"/>`),
    dac:    sv(tr(sig,GR,1.9)+ln(stair,AM,1.5)+XS.map(x=>dot(x,sig(x),VI)).join(''))
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
  keywords:'code matlab python nyquist rate sampling period guard band overlap width boundary sine zero samples triangular spectrum peak' }),

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

/* </m7-s5> */

/* <m7-s6> ============================================ 7.6 sampling a sequence: decimation and interpolation */

/* </m7-s6> */

/* <m7-s7> ============================================ 7.7 summary */

/* ============================================================ summary */
{ id:'m7-tables', module:'M7', nav:'Result summary', title:'Sampling Result Summary', src:'pp. 80–88',
  objective:'Collect the sampling, reconstruction and aliasing results of the module for reference.',
  keywords:'summary table reference sampler rates sampled spectrum guard band theorem nyquist reconstruction filter interpolation zero-order hold first-order hold alias anti-aliasing',
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
      ['Nyquist rate','$2\\omega_M$ rad/s; the rate must be strictly above it']
    ]}
  ], right:[
    {t:'sub', text:'Reconstruction and aliasing'},
    {t:'wex', rows:[
      ['Ideal filter','$H_r(j\\omega)=T$ for $|\\omega|<\\omega_c$, $0$ for $|\\omega|>\\omega_c$, with $\\omega_M<\\omega_c<\\omega_s-\\omega_M$'],
      ['Interpolation','$x_r(t)=\\sum_nx(nT)\\,\\frac{T\\sin(\\omega_c(t-nT))}{\\pi(t-nT)}$'],
      ['Zero-order hold','$H_0(j\\omega)=e^{-j\\omega T/2}\\,\\frac{2\\sin(\\omega T/2)}{\\omega}$, with $H_0(j0)=T$'],
      ['First-order hold','$H_1(j\\omega)=\\frac{1}{T}\\bigl[\\frac{\\sin(\\omega T/2)}{\\omega/2}\\bigr]^{2}$, with $H_1(j0)=T$'],
      ['Alias of a cosine','$\\frac{\\omega_s}{2}<\\omega_0<\\omega_s$ and $\\omega_c=\\frac{\\omega_s}{2}$: $x_r(t)=\\cos\\bigl((\\omega_s-\\omega_0)t\\bigr)$'],
      ['Anti-aliasing','A lowpass with cutoff $\\omega_s/2$, placed before the sampler']
    ]}
  ]},
  {t:'reveal', at:1, items:[
    {t:'note', kind:'warn', head:'Rows with a condition', html:'The <b>theorem</b> needs a band-limited $x(t)$, and a signal of finite duration never is. With $\\omega_c=\\pi/T$ the <b>interpolation</b> kernel is $\\operatorname{sinc}(\\pi t/T)$, where $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$.'}]}
]},

{ id:'m7-quick', module:'M7', nav:'Quick check', title:'Quick check', src:'pp. 80–88',
  objective:'Check the module ideas with twelve short predictions.',
  keywords:'quick check predict sampling frequency hertz rad/s copy height 1/T replica nyquist rate boundary triangle cutoff zero-order hold first-order hold alias anti-aliasing wheel',
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
    [{t:'note', kind:'def', head:'Replicas', html:'$T=0.125$ s. In rad/s, the copy $k=2$ is centred at',
      ask:{key:'m7-qc2', choices:['$32\\pi$','$16\\pi$','$16$'], answer:0,
        why:'$2\\omega_s$, with $\\omega_s=16\\pi$.'}}],
    [{t:'note', kind:'def', head:'Nyquist rate', html:'In rad/s, the Nyquist rate of $\\cos(300\\pi t)+\\cos(700\\pi t)$ is',
      ask:{key:'m7-qc3', choices:['$1000\\pi$','$1400\\pi$','$700\\pi$'], answer:1,
        why:'Twice $700\\pi$.'}}],
    [{t:'note', kind:'def', head:'Boundary', html:'$\\sin(50\\pi t)$ is sampled at exactly $\\omega_s=100\\pi$ rad/s. Every sample is',
      ask:{key:'m7-qc4', choices:['$0$','$1$','$\\pm1$ in turn'], answer:0,
        why:'Each sample is $\\sin(\\pi n)=0$.'}}],
    [{t:'note', kind:'def', head:'Triangle', html:'$x(t)=\\bigl(\\sin(50t)/(\\pi t)\\bigr)^{2}$. In rad/s, its $\\omega_M$ is',
      ask:{key:'m7-qc5', choices:['$50$','$2500$','$100$'], answer:2,
        why:'The band doubles.'}}],
    [{t:'note', kind:'def', head:'Cutoff', html:'$\\omega_M=3\\pi$ and $\\omega_s=10\\pi$ rad/s. A working cutoff $\\omega_c$ is',
      ask:{key:'m7-qc6', choices:['$2\\pi$','$5\\pi$','$8\\pi$'], answer:1,
        why:'It needs $3\\pi<\\omega_c<7\\pi$.'}}],
    [{t:'note', kind:'def', head:'Zero-order hold', html:'$T=1$ ms. In rad/s, $|H_0(j\\omega)|$ first reaches zero at',
      ask:{key:'m7-qc7', choices:['$1000\\pi$','$1000$','$2000\\pi$'], answer:2,
        why:'The first zero is at $\\omega_s$.'}}],
    [{t:'note', kind:'def', head:'First-order hold', html:'Far above the band, $|H_1(j\\omega)|$ falls off like',
      ask:{key:'m7-qc8', choices:['$1/\\omega$','$1/\\omega^{2}$','$1/\\omega^{3}$'], answer:1,
        why:'Two factors of $1/\\omega$.'}}],
    [{t:'note', kind:'def', head:'Alias', html:'$\\cos(10\\pi t)$, $\\omega_s=16\\pi$ rad/s, $\\omega_c=8\\pi$. The output is $\\cos(\\omega t)$ with $\\omega=$',
      ask:{key:'m7-qc9', choices:['$10\\pi$','$6\\pi$','$26\\pi$'], answer:1,
        why:'$16\\pi-10\\pi=6\\pi<8\\pi$.'}}],
    [{t:'note', kind:'def', head:'Anti-aliasing', html:'$\\omega_s=12\\pi$ rad/s. In rad/s, the lowpass before the sampler cuts off at',
      ask:{key:'m7-qc10', choices:['$6\\pi$','$12\\pi$','$24\\pi$'], answer:0,
        why:'It keeps $|\\omega|<\\omega_s/2$.'}}],
    [{t:'note', kind:'def', head:'Wheel', html:'A wheel turns at $23$ rev/s, filmed at $24$ frames/s. On film, its rate in rev/s is',
      ask:{key:'m7-qc11', choices:['$23$','$1$','$-1$'], answer:2,
        why:'It turns back: $23-24$.'}}]
  ]}
]},

{ id:'m7-synth', module:'M7', nav:'Module 7 synthesis', title:'Module 7 — what to carry forward', src:'pp. 80–88',
  dark:true, objective:'Consolidate the module and lead into the closing synthesis of the course.',
  keywords:'synthesis summary module 7 sampling impulse train rates replication guard band aliasing theorem reconstruction interpolation zero-order hold first-order hold alias', steps:1, blocks:[
  {t:'eyebrow', text:'Module 7 · Synthesis', src:'pp. 80–88'},
  {t:'title', text:'Module 7 Summary'},
  /* Ten results as prompts, in the order of the module: the student answers
     each one, then opens the card. The sketch on each card is the picture to
     remember. */
  {t:'raw', html:()=>RECALL.deck('m7', [
    {q:'What does an ideal sampler produce?', glyph:G7.samp,
     a:'$x_p(t)=\\sum_nx(nT)\\,\\delta(t-nT)$: an impulse at every $nT$ whose weight is the sample $x(nT)$.'},
    {q:'One rate, two numbers', glyph:G7.rates,
     a:'$\\omega_s=2\\pi/T$ in rad/s and $f_s=1/T$ in Hz, so $\\omega_s=2\\pi f_s$. Check every period with $\\omega_sT=2\\pi$.'},
    {q:'The spectrum of the samples', glyph:G7.copies,
     a:'$X_p(j\\omega)=\\frac{1}{T}\\sum_kX\\bigl(j(\\omega-k\\omega_s)\\bigr)$: a copy at every multiple of $\\omega_s$, scaled by $1/T$, at every rate.'},
    {q:'The guard band', glyph:G7.guard,
     a:'The gap $\\omega_s-2\\omega_M$ between the baseband and the first copy. It is positive, zero at the Nyquist rate, or negative.'},
    {q:'What is aliasing?', glyph:G7.alias,
     a:'The overlap of neighbouring copies, which happens only when $\\omega_s<2\\omega_M$. No filter after the sampler can undo it; a lowpass before it prevents it.'},
    {q:'The sampling theorem', glyph:G7.theorem,
     a:'If $X(j\\omega)=0$ for $|\\omega|>\\omega_M$ and $\\omega_s>2\\omega_M$, the samples fix $x(t)$. Equality is not enough, and a signal of finite duration is never band-limited.'},
    {q:'Ideal reconstruction', glyph:G7.interp,
     a:'A lowpass of gain $T$ with $\\omega_M<\\omega_c<\\omega_s-\\omega_M$. In time, $x_r(t)=\\sum_nx(nT)\\,\\frac{T\\sin(\\omega_c(t-nT))}{\\pi(t-nT)}$.'},
    {q:'The zero-order hold', glyph:G7.zoh,
     a:'It holds each sample for $T$. $H_0(j\\omega)=e^{-j\\omega T/2}\\,\\frac{2\\sin(\\omega T/2)}{\\omega}$ equals $T$ at $\\omega=0$, sags in the band and leaks outside it.'},
    {q:'The first-order hold', glyph:G7.foh,
     a:'It joins the samples by straight lines. $H_1(j\\omega)=\\frac{1}{T}\\bigl[\\frac{\\sin(\\omega T/2)}{\\omega/2}\\bigr]^{2}$ falls off like $1/\\omega^{2}$, and the output is delayed by $T$.'},
    {q:'A cosine sampled too slowly', glyph:G7.alcos,
     a:'For $\\frac{\\omega_s}{2}<\\omega_0<\\omega_s$ and $\\omega_c=\\frac{\\omega_s}{2}$, $\\cos(\\omega_0t)$ comes back as $\\cos\\bigl((\\omega_s-\\omega_0)t\\bigr)$. A wheel on film and stripes on a pixel grid follow the same rule.'}
  ], {cols:2})},
  {t:'reveal', at:1, items:[
    {t:'note', kind:'ok', head:'After Module 7', html:'<span style="color:var(--graphite)">The closing synthesis joins the seven modules into one chain: signals, LTI systems and convolution, the transforms, and sampling as the bridge from continuous to discrete time.</span>'}]}
]},

/* Four optional projects for students who want to try the module on their own
   computer. They carry no grade and no code: each card gives an aim, what it
   practises, a few steps and what to look for. The briefs state no numerical
   answer beyond ones checked in verify/. */
{ id:'m7-projects', module:'M7', nav:'Projects to try', title:'Projects to Try', src:'pp. 80–88',
  dark:true, objective:'Offer four optional projects that show sampling and aliasing in sound, in images, on film and in a converter.',
  keywords:'projects matlab python audio resample decimate alias tone moire stripes camera wheel fan frame rate zero-order hold dac staircase sinc interpolation',
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
     look:'The sinc sum stays within $10^{-4}$ of the cosine. The staircase lags by $T/2$ and has an RMS error near $0.25$; halving $T$ halves it to about $0.13$.'}
  ])}
]}

/* </m7-s7> */
];
window.SCENES_M7 = SC;
})();
