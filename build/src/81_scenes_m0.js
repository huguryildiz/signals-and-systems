/* ==========================================================================
   Module 0 — Why Signals and Systems?
   ========================================================================== */
(function(){
const P = PLOT, C = P.COL;

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

function conceptMap(){
  const cx=500, cy=300, R=215, nodeR=58;
  const g=[];
  g.push(`<circle class="course-orbit" cx="${cx}" cy="${cy}" r="${R}"/>`);
  g.push(`<circle class="course-core" cx="${cx}" cy="${cy}" r="84"/>`);
  g.push(`<text class="course-core-k" x="${cx}" y="${cy-10}" text-anchor="middle">M0</text>`);
  g.push(`<text class="course-core-t" x="${cx}" y="${cy+16}" text-anchor="middle">orientation</text>`);
  COURSE_PATH.forEach((n,i)=>{
    const a=(-90+i*360/COURSE_PATH.length)*Math.PI/180;
    const x=cx+R*Math.cos(a), y=cy+R*Math.sin(a);
    const x0=cx+86*Math.cos(a), y0=cy+86*Math.sin(a);
    const x1=cx+(R-nodeR-4)*Math.cos(a), y1=cy+(R-nodeR-4)*Math.sin(a);
    g.push(`<line class="course-spoke" style="--i:${i}" x1="${x0.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}"/>`);
    const lines=n.label||[n.t];
    const title=lines.map((line,j)=>`<text class="course-node-title" x="${x.toFixed(1)}" y="${(y-(lines.length===1?3:11)+j*17).toFixed(1)}" text-anchor="middle">${line}</text>`).join('');
    const idY=y+(lines.length===1?21:31);
    g.push(`<g class="course-node${i===0?' is-active':''}" style="--i:${i}" data-course-node="${n.m}" role="button" tabindex="0" aria-label="${n.m}: ${n.t}" aria-pressed="${i===0?'true':'false'}">
      <circle class="course-node-disc" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${nodeR}"/>
      ${title}
      <text class="course-node-id" x="${x.toFixed(1)}" y="${idY.toFixed(1)}" text-anchor="middle">${n.m}</text>
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

function ctdtPair(){
  const a=P.Axes({w:560,h:230,xr:[0,20],yr:[-1.4,1.4],xlabel:'t',ylabel:'x(t)',pad:{l:44,r:24,t:22,b:34},xtarget:6,ytarget:3});
  a.curve(t=>Math.cos(t),{color:C.in});
  const b=P.Axes({w:560,h:230,xr:[0,20],yr:[-1.4,1.4],xlabel:'n',ylabel:'x[n]',pad:{l:44,r:24,t:22,b:34},xtarget:6,ytarget:3});
  const pts=[]; for(let n=0;n<=20;n++) pts.push([n,Math.cos(n)]); b.stem(pts,{color:C.mid});
  return {a:a.svg(), b:b.svg()};
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
  keywords:'signal definition independent variable information', steps:2, blocks:[
  {t:'eyebrow', text:'Module 0 · Orientation', src:'p. 2'},
  {t:'title', text:'Signal Representation'},
  {t:'cols', ratio:'c-5-7', vcenter:true, left:[
    {t:'body', html:'We use a signal to represent information in a form that we can calculate with. The physical and mathematical definitions describe the same signal in two ways.'},
    {t:'note', kind:'def', head:'Definition', html:'A signal is a <b>physical variation that carries information</b>. A signal is a <b>function of one or more independent variables</b>.'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'The physical definition tells us what to measure. The measured quantity may be a voltage, a pressure or a pixel intensity. The mathematical definition writes that measurement as a function. We can then differentiate, integrate, shift or transform the function.'},
    ]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Use both definitions', html:'Each operation in this course acts on the <em>function</em>. The result must still describe the <em>physical variation</em>. A correct calculation is useful only when its physical meaning is also clear.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:660,h:300,xr:[0,10],yr:[-1.6,1.6],xlabel:'t\\;(\\text{independent variable})',ylabel:'x(t)',
        pad:{l:52,r:26,t:22,b:44},xtarget:6,ytarget:4});
      a.curve(t=>Math.sin(1.9*t)*Math.exp(-0.12*t)+0.25*Math.sin(6.4*t),{color:C.in});
      a.point(3.2, Math.sin(1.9*3.2)*Math.exp(-0.12*3.2)+0.25*Math.sin(6.4*3.2),{color:C.coral});
      a.note(3.35,1.15,'\\text{one instant}\\to\\text{one value}',{fs:13,color:C.coral,tex:true});
      return a.svg();
    }, caption:'This one-dimensional signal uses time as its independent variable. The measured quantity is the dependent variable. An image instead uses two space variables. Video uses two space variables and time.'}
  ]}
]},

{ id:'m0-system', module:'M0', nav:'System representation', title:'System representation', src:'p. 11',
  objective:'Introduce the input–output abstraction that Module 2 formalises.',
  keywords:'system black box transformation input output', steps:2, blocks:[
  {t:'eyebrow', text:'Module 0 · Orientation', src:'p. 11'},
  {t:'title', text:'System Representation'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'note', kind:'def', head:'Definition', html:'A system is a <b>quantitative description of a physical process</b>. It applies a rule to an input signal and produces an output signal. The rule is <b>deterministic</b>: the same input always produces the same output.'},
    {t:'reveal', at:1, items:[{t:'body', html:'The deterministic rule lets us test the system. We can apply an input, calculate the output and compare that output with the requirements for the six properties in Module 2.'}]},
    {t:'reveal', at:2, items:[{t:'note', kind:'warn', head:'Read the diagram as a rule', html:'The block diagram does not have to represent a circuit. It represents a <em>map between function spaces</em>: $S:\\;x\\mapsto y$. A function space is a set of possible signals. The map assigns one output signal to each input signal. An amplifier, a numerical filter and a differentiator can therefore represent the same rule.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>P.blocks({w:660,h:300,items:[
      {t:'arrow',x1:60,y1:90,x2:210,y2:90}, {t:'box',x:210,y:52,w:180,h:76,label:'CT system'},
      {t:'arrow',x1:390,y1:90,x2:560,y2:90},
      {t:'text',x:120,y:76,label:'x(t)',tex:true,fs:17}, {t:'text',x:470,y:76,label:'y(t)',tex:true,fs:17},
      {t:'text',x:120,y:112,label:'input',fs:12}, {t:'text',x:470,y:112,label:'output',fs:12},
      {t:'arrow',x1:60,y1:220,x2:210,y2:220}, {t:'box',x:210,y:182,w:180,h:76,label:'DT system'},
      {t:'arrow',x1:390,y1:220,x2:560,y2:220},
      {t:'text',x:120,y:206,label:'x[n]',tex:true,fs:17}, {t:'text',x:470,y:206,label:'y[n]',tex:true,fs:17},
      {t:'text',x:120,y:242,label:'input',fs:12}, {t:'text',x:470,y:242,label:'output',fs:12}
    ]}), caption:'A system maps an input to an output in continuous time or discrete time. Module 2 tests six system properties. Module 3 uses two of them, linearity and time invariance, to describe a system with one function.'}
  ]}
]},

{ id:'m0-ctdt', module:'M0', nav:'Continuous and discrete time', title:'Two viewpoints, one theory', src:'p. 2',
  objective:'Fix the CT/DT notational split that persists through the whole course.',
  keywords:'continuous discrete time stem MATLAB integer index', steps:1, blocks:[
  {t:'eyebrow', text:'Module 0 · Orientation', src:'p. 2'},
  {t:'title', text:'Continuous and Discrete Time'},
  {t:'lede', text:'We need separate models for signals defined at every time and signals defined only at integer times. Most continuous-time results use integrals. The matching discrete-time results use sums.'},
  {t:'grid', cols:2, gap:'52px', items:[
    [ {t:'fig', frame:true, svg:()=>ctdtPair().a, caption:'<b>Continuous time.</b> The signal $x(t)$ is defined for every $t\\in\\mathbb{R}$. We draw it as an unbroken curve.'} ],
    [ {t:'fig', frame:true, svg:()=>ctdtPair().b, caption:'<b>Discrete time.</b> The signal $x[n]$ is defined only at integers $n\\in\\mathbb{Z}$. We draw its samples with stems, as <code>stem(·)</code> does in MATLAB. The dots are the signal values. No signal value exists between adjacent integers.'} ]
  ]}
]},

{ id:'m0-map', module:'M0', nav:'Course concept map', title:'How the course fits together', src:'pp. 2–88',
  objective:'Give a single mental picture of the dependency structure.',
  keywords:'map overview dependencies modules', steps:1, blocks:[
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
  keywords:'help navigation modes instructor student reduced motion privacy', steps:0, blocks:[
  {t:'eyebrow', text:'Module 0 · Orientation'},
  {t:'title', text:'Using the Course Artifact'},
  {t:'grid', cols:2, gap:'24px', style:'flex:1;min-height:0;grid-auto-rows:1fr;', items:[
    [{t:'card', head:'Navigation', items:[
      {t:'body', html:`<p>Use <kbd>→</kbd> or <kbd>space</kbd> for the next reveal state, then the next scene. Use <kbd>←</kbd> to go back one state. <kbd>↑</kbd> and <kbd>↓</kbd> move by a whole scene. <kbd>Home</kbd> returns to the title.</p>
        <p><kbd>M</kbd> opens the map, <kbd>/</kbd> search, <kbd>G</kbd> the glossary and <kbd>?</kbd> help. <kbd>L</kbd> changes the study mode, <kbd>I</kbd> changes the edition and <kbd>R</kbd> reduces motion.</p>`}
    ]}],
    [{t:'card', head:'Two modes', items:[
      {t:'body', html:`<p><b>Lecture mode</b> returns to the last reveal state of the previous scene, so a completed derivation stays complete. <b>Self-study mode</b> returns to the first state so you can work through the scene again.</p>`}
    ]}],
    [{t:'card', head:'Two editions', items:[
      {t:'body', html:`<p>The <b>student edition</b> hides solutions until you request them. It also hides teaching comments. The <b>instructor edition</b> shows presenter notes, error warnings and every solution.</p>`}
    ]}],
    [{t:'card', head:'How the material is organised', items:[
      {t:'body', html:`<p>Each module uses earlier material. A topic starts with a picture and a definition. An equation and a step-by-step derivation follow. A worked example then uses Given, Find, Method, Solution and Check.</p>
        <p>The band above the title gives the course address. An open book and a number such as <b>CH1.1.2</b> give the matching address in Oppenheim and Willsky, <em>Signals and Systems</em>, second edition. The open book separates the two numbering systems.</p>`}
    ]}],
    [{t:'card', head:'Conventions fixed for the whole artifact', items:[
      {t:'body', html:`<p>Energy and power use the <b>normalised</b> convention $R=1\\ \\Omega$. The imaginary unit is $j$. Angular frequency $\\omega$ uses rad/s in continuous time and rad/sample in discrete time. Frequency in hertz is labelled explicitly.</p>`}
    ]}],
    [{t:'card', head:'Privacy and offline use', items:[
      {t:'body', html:`<p>The artifact is one self-contained file. It does not use the network or collect analytics. It stores progress only on this device. Without browser storage, it runs but does not keep progress after you close it.</p>`},
      {t:'raw', html:'<div><button class="btn" data-act="reset">Reset all local progress</button></div>'}
    ]}]
  ]}
]}
];

window.SCENES_M0 = SC;
})();
