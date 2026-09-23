/* ==========================================================================
   Module 0 — Why Signals and Systems?
   ========================================================================== */
(function(){
const P = PLOT, C = P.COL;
/* photographs and book covers live in 77_images.js as data URIs */
const photo = (k, alt) => `<img class="photo" src="${IMG[k]}" alt="${alt}">`;
const cover = (k, alt) => `<img class="cover" src="${IMG['book_'+k]}" alt="${alt}">`;

/* --- original focal motif: a signal entering a system and leaving as a
       spectrum. Mathematically meaningful, not decorative. The two signals are
       shown on cathode-ray screens, the way they are met on a bench: a scope on
       the input, an analyser on the output, the system itself between them. The
       figure draws itself once, then a highlight travels the route the
       information takes: waveform, input wire, system, output wire, spectrum.
       Nothing moves out of place, so the resting state is the complete figure.

       A screen is dark whatever page it sits on, so this one figure carries its
       own screen colours instead of taking them from the palette. The signal
       semantics survive the change: the scope has a cyan phosphor for the input,
       the analyser a green one for the output. --- */
const SCR = { bg:'#0A0F12', grat:'#1E2A2E', scan:'#060B0D',
              edge:'#25343A', base:'#31474B', chrome:'#6B8189' };
const PH  = { in:'#4FBECE', inHot:'#CFF3FA', out:'#82C27B', outHot:'#DCF2D6' };
const SCRY = 10, SCRH = 280;   /* every screen spans the same band of the figure */
let MTFN = 0;                  /* one serial per figure, so two live copies never share an id */

function motifSignalSystem(){
  const a = P.Axes({w:1180,h:300,xr:[0,26],yr:[-1.5,1.5],grid:false,zeroAxes:false,
    pad:{l:10,r:10,t:20,b:20},xticksOverride:[],yticksOverride:[],arrows:false});
  const uid = 'mtf'+(++MTFN);
  /* the glow of a phosphor trace is a blur of the trace itself; the crisp core is
     drawn over it afterwards, so the line stays readable at any size. The blur
     region is given in the coordinates of the figure rather than as a percentage
     of what is being blurred: a stem is a line of zero width, and a region set as
     a fraction of that is empty, which cuts the glow into a square. */
  const blur = (id,x,sd) => `<filter id="${id}" filterUnits="userSpaceOnUse"
      x="${x}" y="-20" width="410" height="340"><feGaussianBlur stdDeviation="${sd}"/></filter>`;
  a.raw(`<defs>
    ${blur(uid+'b1',0,6)}${blur(uid+'b2',770,5)}
    <clipPath id="${uid}s1"><rect x="4" y="${SCRY}" width="396" height="${SCRH}"/></clipPath>
    <clipPath id="${uid}s2"><rect x="782" y="${SCRY}" width="394" height="${SCRH}"/></clipPath>
  </defs>`);
  /* ---- the two screens: face, graticule, edge ---- */
  function face(x,w){
    const o = [`<rect x="${x}" y="${SCRY}" width="${w}" height="${SCRH}" rx="7"
      fill="${SCR.bg}" stroke="${SCR.edge}" stroke-width="1.4"/>`];
    for(let i=1;i<10;i++){ const gx=(x+w*i/10).toFixed(1);
      o.push(`<line x1="${gx}" y1="${SCRY+5}" x2="${gx}" y2="${SCRY+SCRH-5}"
        stroke="${SCR.grat}" stroke-width="${i===5?1.1:0.7}"/>`); }
    for(let j=1;j<8;j++){ const gy=(SCRY+SCRH*j/8).toFixed(1);
      o.push(`<line x1="${x+5}" y1="${gy}" x2="${x+w-5}" y2="${gy}"
        stroke="${SCR.grat}" stroke-width="${j===4?1.1:0.7}"/>`); }
    return o.join('');
  }
  /* the shadow mask of a tube, drawn over the trace as it is on the glass. It has
     to stay faint: a mask heavy enough to see on its own chops the trace into
     dashes and the signal stops reading as one line. */
  function scanlines(x,w){
    const o=[]; for(let y=SCRY+2;y<SCRY+SCRH;y+=5)
      o.push(`<line x1="${x+1}" y1="${y}" x2="${x+w-1}" y2="${y}" stroke="${SCR.scan}" stroke-width="0.9"/>`);
    return `<g opacity=".3">${o.join('')}</g>`;
  }
  a.raw(face(4,396));
  a.raw(face(782,394));
  /* the analyser draws its own baseline on its own screen */
  a.raw(`<line x1="${a.sx(17.6).toFixed(1)}" y1="${a.sy(0)}" x2="${a.sx(25.8).toFixed(1)}" y2="${a.sy(0)}"
     stroke="${SCR.base}" stroke-width="1.2"/>`);
  /* the input trace is sampled here rather than through curve(), so its drawn
     length is known and the travelling beam can ride the same path */
  const xin = t => 0.86*(Math.cos(1.6*t)+0.45*Math.cos(4.1*t+1));
  const pts = []; for(let i=0;i<=480;i++){ const t=8.5*i/480; pts.push([a.sx(t),a.sy(xin(t))]); }
  const dTrace = 'M'+pts.map(p=>p[0].toFixed(2)+','+p[1].toFixed(2)).join('L');
  let len=0; for(let i=1;i<pts.length;i++) len += Math.hypot(pts[i][0]-pts[i-1][0], pts[i][1]-pts[i-1][1]);
  /* the beam is a bright head with a fading tail behind it. Both are one dash on
     the same path; the tail is longer and starts further back, so the two share a
     leading edge for the whole sweep. */
  const run = `--len:${len.toFixed(1)};--len-neg:${(-len).toFixed(1)};--tail-e:${(140-len).toFixed(1)}`;
  const cap = 'stroke-linejoin="round" stroke-linecap="round"';
  /* the settled trace is the persistence left on the phosphor: the phosphor colour
     and its glow, no white. The white core belongs to the beam, which is how the
     beam is visible at all against a trace that is already drawn. */
  a.raw(`<g clip-path="url(#${uid}s1)" style="${run}">
     <path class="mtf-trace" d="${dTrace}" fill="none" stroke="${PH.in}" stroke-width="8" opacity=".4"
       filter="url(#${uid}b1)" ${cap}/>
     <path class="mtf-trace" d="${dTrace}" fill="none" stroke="${PH.in}" stroke-width="2.4" ${cap}/></g>`);
  a.raw(`<g class="mtf-sparkwrap" clip-path="url(#${uid}s1)" style="${run}">
     <path class="mtf-beam-tail" d="${dTrace}" fill="none" stroke="${PH.in}" stroke-width="5" opacity=".6"
       filter="url(#${uid}b1)" ${cap}/>
     <path class="mtf-beam" d="${dTrace}" fill="none" stroke="${PH.inHot}" stroke-width="17" opacity=".5"
       filter="url(#${uid}b1)" ${cap}/>
     <path class="mtf-beam" d="${dTrace}" fill="none" stroke="${PH.inHot}" stroke-width="3" ${cap}/></g>`);
  [[18.6,1.05],[20.2,0.62],[21.8,0.30],[23.4,0.14],[25.0,0.06]].forEach(([x,h],i)=>{
    a.raw(`<g class="mtf-stem" clip-path="url(#${uid}s2)"
           style="--i:${i};transform-origin:${a.sx(x).toFixed(1)}px ${a.sy(0).toFixed(1)}px">
           <line x1="${a.sx(x)}" y1="${a.sy(0)}" x2="${a.sx(x)}" y2="${a.sy(h)}" stroke="${PH.out}"
             stroke-width="6" opacity=".4" filter="url(#${uid}b2)"/>
           <line x1="${a.sx(x)}" y1="${a.sy(0)}" x2="${a.sx(x)}" y2="${a.sy(h)}" stroke="${PH.out}" stroke-width="2.4"/>
           <circle cx="${a.sx(x)}" cy="${a.sy(h)}" r="7" fill="${PH.out}" opacity=".4" filter="url(#${uid}b2)"/>
           <circle class="mtf-stem-dot" cx="${a.sx(x)}" cy="${a.sy(h)}" r="4" fill="${PH.out}"/></g>`);
  });
  a.raw(scanlines(4,396));
  a.raw(scanlines(782,394));
  /* the animated parts read their resting colours from the palette in force, so
     everything outside the two screens follows the theme it is drawn in */
  a.raw(`<g class="mtf-fade" style="--mtf-ink:${C.ink};--mtf-in:${C.in};--mtf-h:${C.h};--mtf-out:${C.out}">`);
  a.raw(`<rect class="mtf-box" x="${a.sx(10.2).toFixed(1)}" y="${a.sy(0.95).toFixed(1)}"
     width="${(a.sx(15.8)-a.sx(10.2)).toFixed(1)}" height="${(a.sy(-0.95)-a.sy(0.95)).toFixed(1)}"
     fill="none" stroke="${C.ink}" stroke-width="1.6" rx="2"/>`);
  a.note(13,0.12,'LTI system',{anchor:'middle',fs:19,color:C.ink});
  /* the impulse response is set in the same type as every other equation */
  a.raw(`<foreignObject x="${(a.sx(13)-100).toFixed(1)}" y="${(a.sy(-0.42)-23).toFixed(1)}" width="200" height="34"
     style="pointer-events:none">
     <div xmlns="http://www.w3.org/1999/xhtml" class="mtf-h" style="color:${C.h}">${
       katex.renderToString('h(t)', {throwOnError:false, output:'html'})}</div></foreignObject>`);
  a.raw(`<line class="mtf-wire-in" x1="${a.sx(9.1)}" y1="${a.sy(0)}" x2="${a.sx(10.0)}" y2="${a.sy(0)}" stroke="${C.ink}" stroke-width="1.4"/>
         <path class="mtf-wire-in" d="M${a.sx(10.2)},${a.sy(0)} l-9,-4.5 v9 Z" fill="${C.ink}"/>
         <line class="mtf-wire-out" x1="${a.sx(15.8)}" y1="${a.sy(0)}" x2="${a.sx(16.8)}" y2="${a.sy(0)}" stroke="${C.ink}" stroke-width="1.4"/>
         <path class="mtf-wire-out" d="M${a.sx(17.0)},${a.sy(0)} l-9,-4.5 v9 Z" fill="${C.ink}"/>`);
  /* the readout each instrument carries in the corner of its own screen; the halo
     is the screen, so a graticule line behind a word is interrupted by it */
  const readout = (x,txt) => `<text x="${x}" y="36" paint-order="stroke" stroke="${SCR.bg}"
     stroke-width="3.6" stroke-linejoin="round" font-size="12" letter-spacing="1.6"
     fill="${SCR.chrome}">${txt}</text>`;
  a.raw(readout(22,'TIME DOMAIN'));
  a.raw(readout(800,'FREQUENCY DOMAIN'));
  a.raw(`</g>`);
  return a.svg();
}

/* --- course concept map: the nodes form the teaching path, and selecting one
       names the prerequisite it uses and the next question it unlocks. --- */
const COURSE_PATH = CONTENT.COURSE_PATH = [
  {m:'M1', t:'Signals', s:'energy · power · time',
   dep:'Start here: a signal gives us a quantity that can be described and measured.',
   add:'Build the time-domain language: energy, power, transformations and periodicity.',
   next:'That language lets Module 2 ask what a system does to a signal.'},
  {m:'M2', t:'Systems', s:'six properties',
   dep:'Use the signal descriptions from Module 1 as system inputs and outputs.',
   add:'Test memory, invertibility, causality, stability, time invariance and linearity.',
   next:'Linearity and time invariance identify the special systems in Module 3.'},
  {m:'M3', t:'LTI systems', s:'impulse response · convolution',
   dep:'Carry forward the linearity and time-invariance tests from Module 2.',
   add:'Describe an LTI system by its impulse response and calculate outputs by convolution.',
   next:'Complex exponentials make convolution easier to analyse in Module 4.'},
  {m:'M4', t:'Fourier series', s:'periodic signals · harmonics',
   dep:'Use the LTI description from Module 3 and the complex exponentials from Module 1.',
   add:'Represent periodic continuous- and discrete-time signals as sums of harmonics.',
   next:'The limiting case of the series leads to the continuous-time transform.'},
  {m:'M5', t:'CT Fourier transform', label:['CT Fourier','transform'], s:'continuous-time spectra',
   dep:'Extend the Fourier-series view of periodic signals to continuous-time signals.',
   add:'Work with spectra, transform properties, and differential equations.',
   next:'The same frequency-domain reasoning is rebuilt for sequences in Module 6.'},
  {m:'M6', t:'DT Fourier transform', label:['DT Fourier','transform'], s:'discrete-time spectra',
   dep:'Keep the transform viewpoint, but return to the discrete-time model.',
   add:'Analyse sequences, filters and difference equations in the frequency domain.',
   next:'Those spectra explain what sampling preserves and what aliasing destroys.'},
  {m:'M7', t:'Sampling', s:'replication · aliasing · recovery',
   dep:'Combine the continuous-time and discrete-time spectrum models.',
   add:'Relate a continuous signal to its samples, reconstruction and aliasing.',
   next:'The path closes by connecting the two time models introduced at the start.'}
];

/* A node label is drawn over its own disc, with the orbit and a spoke behind it,
   so it carries the halo every figure label carries. The halo is written as an
   attribute, as `60_plot.js` writes it, because that is what the label reads. */
const MAPHALO = 'paint-order="stroke" stroke="var(--fig-halo,#FFFFFF)"'
  + ' stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round"';

function conceptMap(){
  const cx=500, cy=300, R=215, nodeR=67;
  const g=[];
  /* The orbit runs through the centre of every node, so a full ring is drawn
     across each node's title. It is cut into one arc between neighbours, each
     stopping clear of the disc it runs into: R7, nothing drawn crosses a label. */
  const N=COURSE_PATH.length, ang=i=>(-90+i*360/N)*Math.PI/180;
  const gap=Math.asin(Math.min(1,(nodeR+6)/R));
  for(let i=0;i<N;i++){
    const a0=ang(i)+gap, a1=ang(i+1)-gap;
    if(a1<=a0) continue;
    const p0=[cx+R*Math.cos(a0), cy+R*Math.sin(a0)], p1=[cx+R*Math.cos(a1), cy+R*Math.sin(a1)];
    g.push(`<path class="course-orbit" d="M${p0[0].toFixed(1)},${p0[1].toFixed(1)} A${R},${R} 0 0 1 ${p1[0].toFixed(1)},${p1[1].toFixed(1)}"/>`);
  }
  g.push(`<circle class="course-core" cx="${cx}" cy="${cy}" r="84"/>`);
  g.push(`<text class="course-core-k" x="${cx}" y="${cy-10}" text-anchor="middle">M0</text>`);
  g.push(`<text class="course-core-t" x="${cx}" y="${cy+20}" text-anchor="middle">orientation</text>`);
  COURSE_PATH.forEach((n,i)=>{
    const a=(-90+i*360/COURSE_PATH.length)*Math.PI/180;
    const x=cx+R*Math.cos(a), y=cy+R*Math.sin(a);
    const x0=cx+86*Math.cos(a), y0=cy+86*Math.sin(a);
    const x1=cx+(R-nodeR-4)*Math.cos(a), y1=cy+(R-nodeR-4)*Math.sin(a);
    g.push(`<line class="course-spoke" style="--i:${i}" x1="${x0.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}"/>`);
    const lines=n.label||[n.t];
    const title=lines.map((line,j)=>`<text class="course-node-title" ${MAPHALO} x="${x.toFixed(1)}" y="${(y-(lines.length===1?3:16)+j*25).toFixed(1)}" text-anchor="middle">${line}</text>`).join('');
    const idY=y+(lines.length===1?24:40);
    g.push(`<g class="course-node${i===0?' is-active':''}" style="--i:${i}" data-course-node="${n.m}" role="button" tabindex="0" aria-label="${n.m}: ${n.t}" aria-pressed="${i===0?'true':'false'}">
      <circle class="course-node-disc" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${nodeR}"/>
      ${title}
      <text class="course-node-id" ${MAPHALO} x="${x.toFixed(1)}" y="${idY.toFixed(1)}" text-anchor="middle">${n.m}</text>
    </g>`);
  });
  return `<svg class="course-map-svg" viewBox="0 0 1000 620" xmlns="http://www.w3.org/2000/svg" aria-label="Interactive course map. Select a module to read its place in the course." font-family="var(--sans)">${g.join('')}</svg>`;
}

function courseMapPanel(){
  const buttons = COURSE_PATH.map((n,i)=>`<button class="course-path-btn${i===0?' is-active':''}" data-course-node="${n.m}" aria-pressed="${i===0?'true':'false'}">${n.m}</button>`).join('');
  return `<section class="course-map-panel" data-course-map-panel aria-live="polite">
    <p class="course-map-kicker">THE LEARNING PATH <span>01 / 07</span></p>
    <h3>${COURSE_PATH[0].t}</h3>
    <p class="course-map-topic">${COURSE_PATH[0].s}</p>
    <div class="course-map-copy"><p><b>Uses.</b> ${COURSE_PATH[0].dep}</p><p><b>Adds.</b> ${COURSE_PATH[0].add}</p><p><b>Leads to.</b> ${COURSE_PATH[0].next}</p></div>
    <div class="course-map-controls" aria-label="Choose a module">${buttons}</div>
    <p class="course-map-hint">Select a node or module label to follow the dependency chain.</p>
  </section>`;
}

/* --- circuit sketches for the black-box slide. Each returns SVG path data in
       figure coordinates; the wiring is drawn in the ink colour, so the boxes
       read as the same kind of object whatever sits inside them. */
const CK = {
  wire:(x1,y1,x2,y2)=>`M${x1},${y1}L${x2},${y2}`,
  res:(x,y,L)=>{ let d=`M${x},${y}h8`; const n=6, s=(L-16)/n;
    for(let i=0;i<n;i++) d+=`l${(s/2).toFixed(2)},${i%2?7:-7}l${(s/2).toFixed(2)},${i%2?-7:7}`; return d+'h8'; },
  resV:(x,y,L)=>{ let d=`M${x},${y}v8`; const n=6, s=(L-16)/n;
    for(let i=0;i<n;i++) d+=`l${i%2?7:-7},${(s/2).toFixed(2)}l${i%2?-7:7},${(s/2).toFixed(2)}`; return d+'v8'; },
  cap:(x,y,L)=>{ const m=x+L/2; return `M${x},${y}H${m-4}M${m-4},${y-11}v22M${m+4},${y-11}v22M${m+4},${y}H${x+L}`; },
  capV:(x,y,L)=>{ const m=y+L/2; return `M${x},${y}V${m-4}M${x-11},${m-4}h22M${x-11},${m+4}h22M${x},${m+4}V${y+L}`; },
  indV:(x,y,L)=>{ const r=(L-8)/8; let d=`M${x},${y}v4`; for(let i=0;i<4;i++) d+=`a${r},${r} 0 0 1 0,${2*r}`; return d+'v4'; },
  gnd:(x,y)=>`M${x},${y}v6M${x-10},${y+6}h20M${x-6},${y+10}h12M${x-2},${y+14}h4`,
  dot:(x,y)=>`M${x-2},${y}a2,2 0 1 0 4,0a2,2 0 1 0 -4,0`
};

function blackBoxFig(){
  const bx=150, bw=420, rows=[90,255,420], it=[];
  const L=d=>it.push({t:'line',d}), T=(x,y,label,o)=>it.push(Object.assign({t:'text',x,y,label,tex:true,fs:14},o||{}));
  rows.forEach((cy,k)=>{
    it.push({t:'arrow',x1:30,y1:cy,x2:bx,y2:cy}, {t:'arrow',x1:bx+bw,y1:cy,x2:690,y2:cy});
    it.push({t:'box',x:bx,y:cy-45,w:bw,h:110});
    T(90,cy-16,'x(t)',{fs:18}); T(630,cy-16,'y(t)',{fs:18});
    it.push({t:'text',x:bx+6,y:cy-54,label:['Low-pass filter','High-pass filter','A complicated circuit'][k],fs:14,anchor:'start'});
  });
  /* low-pass: series R, shunt C */
  let cy=rows[0];
  L(CK.wire(bx,cy,250,cy)); L(CK.res(250,cy,70)); L(CK.wire(320,cy,bx+bw,cy));
  L(CK.dot(390,cy)); L(CK.capV(390,cy,36)); L(CK.gnd(390,cy+36));
  T(285,cy-16,'R'); T(416,cy+22,'C');
  /* high-pass: series C, shunt R */
  cy=rows[1];
  L(CK.wire(bx,cy,250,cy)); L(CK.cap(250,cy,70)); L(CK.wire(320,cy,bx+bw,cy));
  L(CK.dot(390,cy)); L(CK.resV(390,cy,40)); L(CK.gnd(390,cy+40));
  T(285,cy-20,'C'); T(416,cy+24,'R');
  /* a tangle: two RC sections, a coil, an op-amp buffer with feedback, an output RC */
  cy=rows[2];
  L(CK.wire(bx,cy,168,cy)); L(CK.res(168,cy,50)); L(CK.wire(218,cy,262,cy));
  L(CK.dot(240,cy)); L(CK.indV(240,cy,36)); L(CK.gnd(240,cy+36));
  L(CK.capV(240,cy-32,32)); L(CK.wire(240,cy-32,425,cy-32));
  L(CK.res(262,cy,46)); L(CK.wire(308,cy,345,cy));
  L(CK.dot(322,cy)); L(CK.capV(322,cy,30)); L(CK.gnd(322,cy+30));
  L(`M345,${cy-16}V${cy+34}L400,${cy+9}Z`);
  L(CK.wire(335,cy+22,345,cy+22)); L(`M335,${cy+22}V${cy+56}H425V${cy+9}`);
  L(CK.wire(400,cy+9,425,cy+9)); L(CK.wire(425,cy-32,425,cy+9)); L(CK.dot(425,cy+9));
  L(CK.wire(425,cy,440,cy)); L(CK.res(440,cy,50)); L(CK.wire(490,cy,bx+bw,cy));
  L(CK.dot(522,cy)); L(CK.capV(522,cy,30)); L(CK.gnd(522,cy+30));
  T(193,cy+24,'R_1'); T(285,cy-16,'R_2'); T(465,cy-16,'R_3');
  T(224,cy-18,'C_1',{anchor:'end'}); T(258,cy+26,'L',{anchor:'start'});
  T(296,cy+26,'C_2',{anchor:'end'}); T(540,cy+22,'C_3',{anchor:'start'});
  T(352,cy+1,'+',{fs:12,anchor:'start'}); T(352,cy+24,'-',{fs:12,anchor:'start'});
  return P.blocks({w:720,h:500,items:it});
}

/* --- everyday signals for the CT/DT examples slide. The shapes are schematic;
       each keeps the feature a student would recognise on a real trace. */
function signalExamples(){
  const opt=(o)=>Object.assign({w:520,h:250,pad:{l:56,r:26,t:24,b:40},ytarget:3},o);
  const beat=t=>{ const u=((t%0.8)+0.8)%0.8, g=(c,w,a)=>a*Math.exp(-(((u-c)/w)**2));
    return g(0.16,0.035,0.15)-g(0.285,0.008,0.12)+g(0.30,0.011,1.1)-g(0.318,0.01,0.25)+g(0.52,0.05,0.3); };
  const a=P.Axes(opt({xr:[0,2.4],yr:[-0.4,1.3],xlabel:'t\\;(\\text{s})',ylabel:'v(t)\\;(\\text{mV})',xstep:0.8}));
  a.curve(beat,{color:C.in,n:1200});
  const voice=t=>Math.sin(2*Math.PI*t/8)**2*(Math.sin(2*Math.PI*0.5*t)+0.6*Math.sin(2*Math.PI*1.5*t+1)+0.35*Math.sin(2*Math.PI*2.5*t+2));
  const b=P.Axes(opt({xr:[0,8],yr:[-2,2],xlabel:'t\\;(\\text{ms})',ylabel:'p(t)',xstep:2}));
  b.curve(voice,{color:C.in,n:900});
  const temp=n=>18+4*Math.sin(2*Math.PI*(n-3)/14)+1.6*Math.sin(2.7*n)+0.9*Math.cos(5.1*n);
  const c=P.Axes(opt({xr:[0,30],yr:[0,28],xlabel:'n\\;(\\text{day})',ylabel:'T[n]\\;(^\\circ\\text{C})',xstep:10,ytarget:3}));
  const pc=[]; for(let n=1;n<=30;n++) pc.push([n,temp(n)]); c.stem(pc,{color:C.mid});
  const d=P.Axes(opt({xr:[0,32],yr:[-2,2],xlabel:'n',ylabel:'p[n]=p(nT)',xstep:8}));
  const pd=[]; for(let n=0;n<=32;n++) pd.push([n,voice(n*0.25)]); d.stem(pd,{color:C.mid});
  return {a:a.svg(),b:b.svg(),c:c.svg(),d:d.svg()};
}

function ctdtPair(){
  const a=P.Axes({w:560,h:230,xr:[0,20],yr:[-1.4,1.4],xlabel:'t',ylabel:'x(t)',pad:{l:44,r:24,t:22,b:34},xtarget:6,ytarget:3});
  a.curve(t=>Math.cos(t),{color:C.in});
  const b=P.Axes({w:560,h:230,xr:[0,20],yr:[-1.4,1.4],xlabel:'n',ylabel:'x[n]',pad:{l:44,r:24,t:22,b:34},xtarget:6,ytarget:3});
  const pts=[]; for(let n=0;n<=20;n++) pts.push([n,Math.cos(n)]); b.stem(pts,{color:C.mid});
  return {a:a.svg(), b:b.svg()};
}

/* --- signals of one, two and three independent variables, on one figure.
       1-D: the air pressure of a spoken vowel, made the way a voice makes it:
       a pulse from the vocal folds every pitch period, each one ringing the
       three resonances of the mouth and throat. The same formula is drawn and
       played, so what the reader hears is the trace on the page.
       2-D: the brightness of a small landscape image, one square a pixel.
       3-D: a video of the same landscape with a ball bouncing across it, drawn
       as a stack of frames along t. The slider picks the frame that is shown. --- */
const VOWEL = { f0:120, F:[730,1090,2440], B:[90,110,170], g:[1,0.5,0.25] };
function vowelRaw(t){
  const T0 = 1/VOWEL.f0, tau = ((t % T0) + T0) % T0;
  let y = 0;
  for(let m=0;m<3;m++){ const s = tau + m*T0;
    for(let i=0;i<3;i++) y += VOWEL.g[i]*Math.exp(-Math.PI*VOWEL.B[i]*s)*Math.sin(2*Math.PI*VOWEL.F[i]*s); }
  return y;
}
const VOWEL_PEAK = (()=>{ let p=0; for(let i=0;i<4000;i++) p=Math.max(p,Math.abs(vowelRaw(i/(4000*VOWEL.f0)))); return p; })();
const vowel = t => vowelRaw(t)/VOWEL_PEAK;

/* brightness in [0,1] at (u,v), u left to right, v bottom to top; `ball` is
   the ball's position in the same coordinates, or null for the still image */
const hash = (i,j) => { const s = Math.sin(i*12.9898 + j*78.233)*43758.5453; return s - Math.floor(s); };
function scene2d(u, v, i, j, ball){
  const r1 = 0.40 + 0.07*Math.sin(2*Math.PI*(1.3*u+0.1)) + 0.04*Math.sin(2*Math.PI*(3.1*u+0.6));
  const r2 = 0.20 + 0.06*Math.sin(2*Math.PI*(0.8*u+0.3));
  let I;
  if(v > r1){
    const d = Math.hypot(u-0.74, (v-0.78)*0.75);
    I = 0.42 + 0.36*(1-(v-r1)/(1-r1)) + 0.30*Math.exp(-((d/0.16)**2));
    if(d < 0.07) I = 0.98;
  } else if(v > r2) I = 0.30 + 0.10*(v-r2)/(r1-r2) + 0.06*hash(i,j);
  else I = 0.12 + 0.08*hash(i+7,j+3);
  if(ball){ const db = Math.hypot(u-ball[0], (v-ball[1])*0.75);
    if(db < 0.09) I = 1; else if(db < 0.12) I = 0.05; }
  return Math.max(0, Math.min(1, I));
}
const ballAt = t => [0.12 + 0.72*t, 0.24 + 0.46*Math.abs(Math.cos(Math.PI*1.2*t))];
/* An image is a record of light, so its pixels are grey on either page; the
   brightness is the value of the signal and does not follow the theme. */
const grey = I => { const c = Math.round(18 + 225*I); return `rgb(${c},${c},${c})`; };
function pixels(x0, yTop, nx, ny, cell, ball){
  const o = [];
  for(let j=0;j<ny;j++) for(let i=0;i<nx;i++){
    const I = scene2d((i+0.5)/nx, 1-(j+0.5)/ny, i, j, ball);
    o.push(`<rect x="${(x0+i*cell).toFixed(2)}" y="${(yTop+j*cell).toFixed(2)}" width="${(cell+0.6).toFixed(2)}"
      height="${(cell+0.6).toFixed(2)}" fill="${grey(I)}"/>`);
  }
  return `<g shape-rendering="crispEdges">${o.join('')}</g>`;
}
function arrowLine(xa, ya, xb, yb){
  const ang = Math.atan2(yb-ya, xb-xa), L = 9, W = 4.5;
  const p = (a,b) => `${(xb - L*Math.cos(ang) + b*Math.sin(ang)).toFixed(2)},${(yb - L*Math.sin(ang) - b*Math.cos(ang)).toFixed(2)}`;
  return `<line x1="${xa.toFixed(2)}" y1="${ya.toFixed(2)}" x2="${(xb-L*0.8*Math.cos(ang)).toFixed(2)}" y2="${(yb-L*0.8*Math.sin(ang)).toFixed(2)}"
      stroke="${C.axis}" stroke-width="1.5"/>
    <path d="M${xb.toFixed(2)},${yb.toFixed(2)} L${p(0,W)} L${p(0,-W)} Z" fill="${C.axis}"/>`;
}
function dimensionsFigure(v){
  P.hOverride = null;                    /* the height below is fixed by the layout */
  const t = v ? v.t : 0.4, W = 1000, H = 668;
  const k = Math.round(t/0.2);
  const g = [];
  const name = (src, at, base, size, color) => g.push(P.texName(src,
    Object.assign({ baseline:base, size:size||15, color:color||C.ink, figW:W }, at)));
  /* ---- 1-D: sound ---- */
  /* the trace crosses its zero line everywhere, so the time numbers are set
     under the data area instead of on the axis */
  const a = P.Axes({w:W, h:268, xr:[0,25], yr:[-1.3,1.3], xlabel:'t\\;(\\text{ms})', ylabel:'x(t)',
    pad:{l:56,r:30,t:22,b:38}, xtarget:6, ytarget:3, xtickfmt:()=>''});
  a.curve(tt=>vowel(tt/1000), {color:C.in, n:900});
  [5,10,15,20].forEach(m => a.note(m, -1.3, String(m), {dy:20, anchor:'middle', fs:13.5}));
  const tp = 11.6;
  a.point(tp, vowel(tp/1000), {color:C.coral});
  a.note(tp+0.5, -1.05, '\\text{one instant}\\to\\text{one value}', {fs:14, color:C.coral, tex:true});
  g.push(a.svg().replace(/^<svg[^>]*>/, '<g>').replace(/<\/svg>$/, '</g>'));
  name('\\text{1-D}\\quad x(t)\\text{: air pressure of a spoken vowel}', {xRight:W-8}, 28, 16);
  /* ---- 2-D: image ---- */
  const Y0 = 284, NX = 48, NY = 36, CELL = 8.25;
  const ix = 62, iy = Y0 + 44, iw = NX*CELL, ih = NY*CELL;
  name('\\text{2-D}\\quad I(x,y)\\text{: brightness of an image}', {xMid:ix+iw/2}, Y0+22, 16);
  g.push(pixels(ix, iy, NX, NY, CELL, null));
  g.push(arrowLine(ix, iy+ih, ix+iw+26, iy+ih), arrowLine(ix, iy+ih, ix, iy-20));
  name('x', {xMid:ix+iw+20}, iy+ih+28, 16);
  name('y', {xRight:ix-12}, iy-4, 16);
  /* ---- 3-D: video, frames stacked along t ---- */
  const NF = 6, FX = 30, FY = 22, FC = 8, fw = FX*FC, fh = FY*FC, dx = 30, dy = -20;
  const fx0 = 560, fyB = iy + ih;                      /* bottom-left corner of the frame at t = 0 */
  const corner = m => [fx0 + m*dx, fyB + m*dy];
  const outline = (m, col, wd) => { const [cx, cy] = corner(m);
    return `<rect x="${cx}" y="${cy-fh}" width="${fw}" height="${fh}" fill="none" stroke="${col}" stroke-width="${wd}"/>`; };
  name('\\text{3-D}\\quad I(x,y,t)\\text{: a video}', {xMid:fx0 + (fw + (NF-1)*dx)/2}, Y0+22, 16);
  for(let m=NF-1;m>k;m--) g.push(outline(m, C.muted, 1.2));
  const [sxk, syk] = corner(k);
  g.push(pixels(sxk, syk-fh, FX, FY, FC, ballAt(k*0.2)));
  g.push(outline(k, C.coral, 2.4));
  for(let m=k-1;m>=0;m--) g.push(outline(m, C.muted, 1.2));
  g.push(arrowLine(fx0, fyB, fx0+fw+24, fyB), arrowLine(fx0, fyB, fx0, fyB-fh-22));
  const [ex, ey] = corner(NF-1);
  g.push(arrowLine(fx0+fw, fyB, ex+fw+34, ey-23));
  name('x', {xMid:fx0+fw+18}, fyB+28, 16);
  name('y', {xRight:fx0-12}, fyB-fh-6, 16);
  name('t', {xLeft:ex+fw+30}, ey-24, 16);
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img"
    aria-label="A spoken vowel as a function of time, an image as a function of two space variables, and a video as a stack of images along time."
    font-family="Inter,-apple-system,'Segoe UI',sans-serif">${g.join('')}</svg>`;
}

const SC = [
{ id:'title', module:'M0', nav:'Title', title:'Signals and Systems', src:'p. 1',
  keywords:'title cover version', steps:0, blocks:[
  {t:'stack', style:'justify-content:center;flex:1;align-items:flex-start', items:[
    {t:'eyebrow', text:'Interactive learning artifact · Modules 0–3'},
    {t:'title', level:1, text:'Signals and Systems'},
    {t:'lede', text:'This course uses two ideas to describe and analyse physical processes. A signal is a function that carries information. A system is a rule that turns an input signal into an output signal. Energy, convolution, spectra and sampling let us calculate with signals and systems.'},
    {t:'raw', html:()=>`<div style="margin:22px 0 26px;width:1360px;max-width:100%">${motifSignalSystem()}</div>`},
  ]}
]},

{ id:'m0-signal', module:'M0', nav:'Signal representation', title:'Signal representation', src:'p. 2',
  objective:'Establish the physical meaning of a signal before any formalism.',
  keywords:'signal definition independent variable information', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 0 · Orientation', src:'p. 2'},
  {t:'title', text:'Signal Representation'},
  {t:'cols', ratio:'c-7-5', fill:true, left:[
    {t:'fig', frame:true, svg:dimensionsFigure,
      live:{controls:[{k:'t', label:'video time $t$', min:0, max:1, step:0.2, v:0.4,
        show:v=>'$'+v.toFixed(1)+'\\ \\text{s}$'}]},
      listen:{items:[{label:'Play the vowel $x(t)$', sound:()=>({f:vowel, dur:1.2})}]},
      caption:'Sound has one independent variable, an image two, and a video three. Each frame of the video is an image at one time $t$.'}
  ], right:[
    {t:'note', kind:'def', head:'Definition', html:'A signal is a <b>physical variation that carries information</b>. As mathematics, it is a <b>function of one or more independent variables</b>.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Two views', html:'The physical view tells us what to measure: a voltage, a pressure or a pixel intensity. The function lets us differentiate, integrate, shift or transform it.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Use both definitions', html:'Each operation in this course acts on the function. The result must still describe the physical variation.'}]}
  ]}
]},

{ id:'m0-system', module:'M0', nav:'System representation', title:'System representation', src:'p. 11',
  objective:'Introduce the input–output abstraction that Module 2 formalises.',
  keywords:'system black box transformation input output', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 0 · Orientation', src:'p. 11'},
  {t:'title', text:'System Representation'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>P.blocks({w:560,h:460,items:[
      {t:'arrow',x1:40,y1:135,x2:180,y2:135}, {t:'box',x:180,y:90,w:200,h:90,label:'CT system'},
      {t:'arrow',x1:380,y1:135,x2:520,y2:135},
      {t:'text',x:110,y:119,label:'x(t)',tex:true,fs:18}, {t:'text',x:450,y:119,label:'y(t)',tex:true,fs:18},
      {t:'text',x:110,y:159,label:'input',fs:13}, {t:'text',x:450,y:159,label:'output',fs:13},
      {t:'arrow',x1:40,y1:325,x2:180,y2:325}, {t:'box',x:180,y:280,w:200,h:90,label:'DT system'},
      {t:'arrow',x1:380,y1:325,x2:520,y2:325},
      {t:'text',x:110,y:309,label:'x[n]',tex:true,fs:18}, {t:'text',x:450,y:309,label:'y[n]',tex:true,fs:18},
      {t:'text',x:110,y:349,label:'input',fs:13}, {t:'text',x:450,y:349,label:'output',fs:13}
    ]}), caption:'A system maps an input to an output, in continuous time or in discrete time.'}
  ], right:[
    {t:'note', kind:'def', head:'Definition', html:'A system applies a rule to an input signal and produces an output signal. The rule is <b>deterministic</b>: the same input always gives the same output.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Why a fixed rule', html:'We can apply an input and calculate the output. Module 2 uses this to test six system properties.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'A rule, not a circuit', html:'The diagram is a map $S:\\;x\\mapsto y$ from input signals to output signals. An amplifier and a numerical filter can realise the same rule.'}]}
  ]}
]},

{ id:'m0-blackbox', module:'M0', nav:'The system as a black box', title:'The system as a black box', src:'p. 11',
  objective:'Show that very different hardware sits behind the same input–output picture.',
  keywords:'black box low-pass high-pass filter circuit op-amp input output', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 0 · Orientation', src:'p. 11'},
  {t:'title', text:'The System as a Black Box'},
  {t:'cols', ratio:'c-7-5', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:blackBoxFig,
      caption:'Three boxes with different wiring inside. From outside, each one only takes $x(t)$ in and gives $y(t)$ out.'}
  ], right:[
    {t:'note', kind:'def', head:'Inside the box', html:'An RC low-pass filter, a CR high-pass filter and a tangle of resistors, capacitors, a coil and an op-amp are all systems.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Seen from outside', html:'We close the lid. Only the input $x(t)$ and the output $y(t)$ are visible, and the course studies the rule $S$ that links them.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Same rule, same system', html:'Two different circuits that give the same output for every input are the same system for us. The wiring matters only when we build it.'}]}
  ]}
]},

{ id:'m0-ctdt', module:'M0', nav:'Continuous and discrete time', title:'Two viewpoints, one theory', src:'p. 2',
  objective:'Fix the CT/DT notational split that persists through the whole course.',
  keywords:'continuous discrete time stem MATLAB integer index', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 0 · Orientation', src:'p. 2'},
  {t:'title', text:'Continuous and Discrete Time'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=P.Axes({w:560,h:380,xr:[0,20],yr:[-1.45,1.45],xlabel:'t,\\;n',ylabel:'\\text{amplitude}',
        pad:{l:56,r:26,t:22,b:38},xtarget:6,ytarget:3});
      a.curve(t=>Math.cos(t),{color:C.in});
      const pts=[]; for(let n=0;n<=20;n++) pts.push([n,Math.cos(n)]);
      a.stem(pts,{color:C.mid});
      return a.svg();
    }, caption:'The stems are the values of $x[n]$ at the integers. No value of $x[n]$ exists between two integers.'},
    {t:'legend', items:[['in','$x(t)=\\cos(t)$'],['mid','$x[n]=\\cos(n)$']]}
  ], right:[
    {t:'note', kind:'def', head:'Continuous time', html:'$x(t)$ is defined for every $t\\in\\mathbb{R}$. We draw it as an unbroken curve.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Discrete time', html:'$x[n]$ is defined only at integers $n\\in\\mathbb{Z}$. We draw its values as stems, as <code>stem(·)</code> does in MATLAB.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Integrals and sums', html:'Most continuous-time results use integrals. The matching discrete-time results use sums.'}]}
  ]}
]},

{ id:'m0-examples', module:'M0', nav:'Signals around us', title:'Signals around us', src:'p. 2',
  objective:'Connect the CT/DT split to signals students already know.',
  keywords:'examples ECG heartbeat speech microphone temperature daily sampling digital audio',
  budget:'A gallery of four everyday signals, two continuous and two discrete; each figure is one example.',
  slide:true, steps:1, blocks:[
  {t:'eyebrow', text:'Module 0 · Orientation', src:'p. 2'},
  {t:'title', text:'Signals Around Us'},
  {t:'cols', ratio:'c-8-4', fill:true, left:[
    {t:'grid', cols:2, gap:'18px 22px', items:[
      [{t:'fig', frame:true, svg:()=>signalExamples().a, caption:'Heartbeat (ECG): the voltage between two electrodes on the chest.'}],
      [{t:'fig', frame:true, svg:()=>signalExamples().b, caption:'Speech: the air pressure at a microphone while a vowel is sung.'}],
      [{t:'fig', frame:true, svg:()=>signalExamples().c, caption:'Daily high temperature over one month: one number per day.'}],
      [{t:'fig', frame:true, svg:()=>signalExamples().d, caption:'Digital audio: the same speech signal read every $T$ seconds.'}]
    ]}
  ], right:[
    {t:'note', kind:'def', head:'Continuous time', html:'A heartbeat and a voice exist at every instant. Voltages, pressures and positions measured by a sensor are continuous-time signals $x(t)$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Discrete time', html:'A daily temperature, a monthly bill or a digital audio file holds one value per step, so it is a sequence $x[n]$. Many such sequences come from reading a continuous signal every $T$ seconds: $x[n]=x(nT)$.'}]}
  ]}
]},

{ id:'m0-apps', module:'M0', nav:'Signals and systems in daily life', title:'Signals and systems in daily life', src:'—',
  objective:'Show the fields where the input–output tools of the course are used every day.',
  keywords:'applications audio equaliser wireless phone ECG medicine radar car image camera seismometer earthquake',
  budget:'A gallery of six photographs, one field each; each caption names the signal and the system.',
  slide:true, steps:1, blocks:[
  {t:'eyebrow', text:'Module 0 · Orientation'},
  {t:'title', text:'Signals and Systems in Daily Life'},
  {t:'cols', ratio:'c-8-4', fill:true, left:[
    {t:'grid', cols:3, gap:'16px 20px', items:[
      [{t:'fig', svg:()=>photo('audio','Headphones and an audio interface in a recording room'), caption:'Audio: an equaliser changes the level of each frequency in a music signal.'}],
      [{t:'fig', svg:()=>photo('telecom','A cellular base-station mast and a phone'), caption:'Wireless: a phone and a base station carry speech and data as radio signals.'}],
      [{t:'fig', svg:()=>photo('medical','A bedside monitor showing ECG traces'), caption:'Medicine: an ECG monitor filters the voltage of the heart to remove noise.'}],
      [{t:'fig', svg:()=>photo('automotive','A car on a highway with radar waves ahead'), caption:'Cars: a radar measures the delay of an echo to find the distance ahead.'}],
      [{t:'fig', svg:()=>photo('imaging','A laptop showing a blurred and a sharpened photograph'), caption:'Images: a filter sharpens or smooths an image, a signal of two variables.'}],
      [{t:'fig', svg:()=>photo('seismic','A seismometer station with a seismogram on a laptop'), caption:'Geophysics: a seismometer records ground motion to locate an earthquake.'}]
    ]}
  ], right:[
    {t:'note', kind:'def', head:'One picture for all', html:'Each photograph hides the same diagram: an input signal, a system and an output signal.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'One set of tools', html:'Convolution, the Fourier transform and sampling describe all six systems. The course builds these tools step by step.'}]}
  ]}
]},

{ id:'m0-books', module:'M0', nav:'Course textbooks', title:'Course textbooks', src:'—',
  objective:'Name the main textbook and two books for further reading.',
  keywords:'textbook book reference Oppenheim Willsky Nawab McClellan Schafer Yoder Tervo MATLAB reading',
  budget:'Three book covers with their full references.',
  slide:true, steps:0, blocks:[
  {t:'eyebrow', text:'Module 0 · Orientation'},
  {t:'title', text:'Course Textbooks'},
  {t:'grid', cols:3, gap:'28px 40px', style:'flex:1;min-height:0;align-items:start;', items:[
    [{t:'fig', svg:()=>cover('oppenheim','Cover of Signals and Systems, second edition'),
      caption:'<b>Main textbook.</b> A. V. Oppenheim and A. S. Willsky, with S. H. Nawab, <i>Signals and Systems</i>, 2nd ed. Upper Saddle River, NJ: Prentice Hall, 1997.'}],
    [{t:'fig', svg:()=>cover('mcclellan','Cover of Signal Processing First'),
      caption:'<b>Further reading.</b> J. H. McClellan, R. W. Schafer and M. A. Yoder, <i>Signal Processing First</i>. Upper Saddle River, NJ: Pearson Prentice Hall, 2003.'}],
    [{t:'fig', svg:()=>cover('tervo','Cover of Practical Signals Theory with MATLAB Applications'),
      caption:'<b>Further reading.</b> R. J. Tervo, <i>Practical Signals Theory with MATLAB Applications</i>. Hoboken, NJ: Wiley, 2014.'}]
  ]}
]},

{ id:'m0-map', module:'M0', nav:'Course concept map', title:'How the course fits together', src:'pp. 2–88',
  objective:'Give a single mental picture of the dependency structure.',
  keywords:'map overview dependencies modules', slide:true, steps:1, blocks:[
  {t:'eyebrow', text:'Module 0 · Orientation'},
  {t:'title', text:'Course Structure'},
  {t:'cols', ratio:'c-7-5', vcenter:true, left:[
    {t:'fig', svg:conceptMap}
  ], right:[
    {t:'raw', html:courseMapPanel}
  ]}
]},

{ id:'m0-howto', module:'M0', nav:'Using the course artifact', title:'Using the course artifact', src:'—',
  objective:'Explain modes, controls and the definition-citation policy.',
  keywords:'help navigation modes instructor student reduced motion privacy', slide:true, steps:0, blocks:[
  {t:'eyebrow', text:'Module 0 · Orientation'},
  {t:'title', text:'Using the Course Artifact'},
  {t:'grid', cols:3, gap:'30px 28px', style:'flex:1;min-height:0;grid-auto-rows:1fr;', items:[
    [{t:'note', kind:'def', head:'Navigation', html:'<kbd>→</kbd> or <kbd>space</kbd> gives the next state, and <kbd>←</kbd> goes back one. <kbd>↑</kbd> and <kbd>↓</kbd> move a whole scene, and <kbd>Home</kbd> returns to the title.'}],
    [{t:'note', kind:'def', head:'Keys', html:'<kbd>M</kbd> map, <kbd>/</kbd> search, <kbd>G</kbd> glossary, <kbd>?</kbd> help. <kbd>L</kbd> study mode, <kbd>I</kbd> edition, <kbd>R</kbd> reduced motion.'}],
    [{t:'note', kind:'def', head:'Two modes', html:'<b>Lecture mode</b> returns to the last state of the previous scene, so a finished derivation stays finished. <b>Self-study mode</b> returns to the first state, so you can work through it again.'}],
    [{t:'note', kind:'def', head:'Two editions', html:'The <b>student edition</b> hides solutions until you ask for them. The <b>instructor edition</b> shows presenter notes, error warnings and every solution.'}],
    [{t:'note', kind:'warn', head:'Textbook anchors', html:'The band above the title gives the course address. An open book and a number such as <b>CH1.1.2</b> give the matching address in Oppenheim and Willsky, <em>Signals and Systems</em>, second edition.'}],
    [{t:'note', kind:'warn', head:'Conventions', html:'Energy and power use the <b>normalised</b> convention $R=1\\ \\Omega$, and the imaginary unit is $j$. Angular frequency $\\omega$ is in rad/s in continuous time and in rad/sample in discrete time.'}]
  ]},
  {t:'note', kind:'ok', head:'Privacy and offline use', html:'The artifact is one file. It uses no network and keeps your progress only on this device. <button class="btn" data-act="reset" style="margin-left:14px">Reset all local progress</button>'}
]}
];

window.SCENES_M0 = SC;
})();
