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

/* --- course concept map: radial composition, used only for overview scenes --- */
function conceptMap(){
  const cx=590, cy=300, R=210;
  const nodes = [
    {a:-90, t:'Signals',      s:'energy · power · periodicity', m:'M1'},
    {a:-18, t:'Systems',      s:'six formal properties',        m:'M2'},
    {a: 54, t:'LTI',          s:'impulse response · convolution', m:'M3'},
    {a:126, t:'Fourier',      s:'series · CTFT · DTFT',         m:'M4+'},
    {a:198, t:'Sampling',     s:'replication · aliasing',       m:'M4+'}
  ];
  const g=[];
  g.push(`<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${C.rule}" stroke-width="1" stroke-dasharray="2 6"/>`);
  g.push(`<circle cx="${cx}" cy="${cy}" r="86" fill="${C.plate}" stroke="${C.ruleStrong}" stroke-width="1"/>`);
  g.push(`<text x="${cx}" y="${cy-6}" text-anchor="middle" font-size="21" font-family="Georgia,serif" fill="${C.ink}">signal</text>`);
  g.push(`<text x="${cx}" y="${cy+20}" text-anchor="middle" font-size="21" font-family="Georgia,serif" fill="${C.ink}">↔ system</text>`);
  nodes.forEach((n,i)=>{
    const r=n.a*Math.PI/180, x=cx+R*Math.cos(r), y=cy+R*Math.sin(r);
    const x0=cx+88*Math.cos(r), y0=cy+88*Math.sin(r);
    g.push(`<line x1="${x0.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${(cx+(R-46)*Math.cos(r)).toFixed(1)}" y2="${(cy+(R-46)*Math.sin(r)).toFixed(1)}" stroke="${C.ruleStrong}" stroke-width="1" stroke-dasharray="1 5"/>`);
    g.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="42" fill="${C.canvas}" stroke="${i<3?C.coral:C.slate}" stroke-width="1.4"/>`);
    g.push(`<text x="${x.toFixed(1)}" y="${(y+2).toFixed(1)}" text-anchor="middle" font-size="16" font-family="Georgia,serif" fill="${C.ink}">${n.t}</text>`);
    g.push(`<text x="${x.toFixed(1)}" y="${(y+18).toFixed(1)}" text-anchor="middle" font-size="10.5" font-family="ui-monospace,monospace" letter-spacing="1.4" fill="${C.muted}">${n.m}</text>`);
    const ly = y + (Math.sin(r)>0.2? 66 : Math.sin(r)<-0.2? -56 : 66);
    g.push(`<text x="${x.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" font-size="13" fill="${C.muted}">${n.s}</text>`);
  });
  return `<svg viewBox="0 0 1180 620" xmlns="http://www.w3.org/2000/svg" font-family="Inter,-apple-system,sans-serif">${g.join('')}</svg>`;
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
    {t:'lede', text:'Two ideas carry the whole course. A signal is a function that carries information. A system is a rule that turns one signal into another. Energy, convolution, spectra and sampling are all ways of making these two ideas computable.'},
    {t:'raw', html:()=>`<div style="margin:22px 0 26px;width:1360px;max-width:100%">${motifSignalSystem()}</div>`},
    {t:'raw', html:`<div style="display:flex;gap:56px;align-items:flex-start;font-size:16px;color:var(--muted);
        border-top:1px solid var(--rule);padding-top:20px;max-width:1360px">
      <div><b style="color:var(--graphite)">Course</b><br>Signals and Systems</div>
      <div><b style="color:var(--graphite)">Level</b><br>Undergraduate, second year</div>
      <div><b style="color:var(--graphite)">Covers</b><br>Modules 1–3: signals, systems, LTI systems</div>
      <div><b style="color:var(--graphite)">Conventions</b><br>Normalised energy (R = 1 Ω); j is the imaginary unit</div>
      <div><b style="color:var(--graphite)">Navigate</b><br><kbd>→</kbd> advance · <kbd>M</kbd> map · <kbd>/</kbd> search · <kbd>?</kbd> help</div>
    </div>`}
  ]}
]},

{ id:'m0-signal', module:'M0', nav:'What a signal represents', title:'What a signal represents', src:'p. 2',
  objective:'Establish the physical meaning of a signal before any formalism.',
  keywords:'signal definition independent variable information', steps:2, blocks:[
  {t:'eyebrow', text:'Module 0 · Orientation', src:'p. 2'},
  {t:'title', text:'A signal is information written as a function'},
  {t:'cols', ratio:'c-5-7', vcenter:true, left:[
    {t:'body', html:'Two definitions carry the whole idea:'},
    {t:'note', kind:'def', head:'Definition', html:'A signal is a <b>physical variation that carries information</b>. A signal is a <b>function of one or more independent variables</b>.'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'The first sentence is physical. Something measurable changes: a voltage, a pressure, a pixel intensity. The second sentence is mathematical. That change is written as a function, so it can be differentiated, integrated, shifted and transformed.'},
    ]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Why this matters later', html:'Every operation in this course acts on the <em>function</em>. Every interpretation goes back to the <em>physical variation</em>. Keep both halves. A calculation can be correct and still mean nothing if you drop the physical side.'}
    ]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:660,h:300,xr:[0,10],yr:[-1.6,1.6],xlabel:'t\\;(\\text{independent variable})',ylabel:'x(t)',
        pad:{l:52,r:26,t:22,b:44},xtarget:6,ytarget:4});
      a.curve(t=>Math.sin(1.9*t)*Math.exp(-0.12*t)+0.25*Math.sin(6.4*t),{color:C.in});
      a.point(3.2, Math.sin(1.9*3.2)*Math.exp(-0.12*3.2)+0.25*Math.sin(6.4*3.2),{color:C.coral});
      a.note(3.35,1.15,'\\text{one instant}\\to\\text{one value}',{fs:13,color:C.coral,tex:true});
      return a.svg();
    }, caption:'A one-dimensional signal. The independent variable is time and the dependent variable is the measured quantity. An image is a signal of two space variables, and video adds time as a third.'}
  ]}
]},

{ id:'m0-system', module:'M0', nav:'What a system does', title:'What a system does', src:'p. 11',
  objective:'Introduce the input–output abstraction that Module 2 formalises.',
  keywords:'system black box transformation input output', steps:2, blocks:[
  {t:'eyebrow', text:'Module 0 · Orientation', src:'p. 11'},
  {t:'title', text:'A system is a rule, not a box'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'note', kind:'def', head:'Definition', html:'A system is a <b>quantitative description of a physical process</b> that turns input signals into output signals. It is a “black box” that maps one signal to another <b>deterministically</b>.'},
    {t:'reveal', at:1, items:[{t:'body', html:'“Deterministically” is the word that does the work here. The same input, given twice, must give the same output. Without that, the six properties of Module 2 could not be tested at all.'}]},
    {t:'reveal', at:2, items:[{t:'note', kind:'warn', head:'A common misreading', html:'The block diagram is not a circuit. It describes a <em>map between function spaces</em>: $S:\\;x\\mapsto y$. An amplifier, a numerical filter and a pencil-and-paper differentiator can all be the same system.'}]}
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
    ]}), caption:'The same idea in continuous time and in discrete time. Module 2 turns it into six questions with definite answers. Module 3 shows that two of those answers, linear and time invariant, reduce the whole description to one function.'}
  ]}
]},

{ id:'m0-ctdt', module:'M0', nav:'Continuous and discrete time', title:'Two viewpoints, one theory', src:'p. 2',
  objective:'Fix the CT/DT notational split that persists through the whole course.',
  keywords:'continuous discrete time stem MATLAB integer index', steps:1, blocks:[
  {t:'eyebrow', text:'Module 0 · Orientation', src:'p. 2'},
  {t:'title', text:'Continuous time and discrete time'},
  {t:'lede', text:'The course runs two parallel tracks. Almost every result appears twice, once with an integral and once with a sum. The few results that do not translate are the interesting ones.'},
  {t:'grid', cols:2, gap:'52px', items:[
    [ {t:'fig', frame:true, svg:()=>ctdtPair().a, caption:'<b>Continuous time.</b> $x(t)$, defined for every $t\\in\\mathbb{R}$. Drawn as an unbroken curve.'} ],
    [ {t:'fig', frame:true, svg:()=>ctdtPair().b, caption:'<b>Discrete time.</b> $x[n]$, defined only at integers $n\\in\\mathbb{Z}$. Drawn with stems, as <code>stem(·)</code> does in MATLAB. The dots are the signal. The space between them is not.'} ]
  ]},
  {t:'reveal', at:1, items:[
    {t:'note', kind:'warn', head:'Where the two tracks really differ', html:'There are three places, and they are worth learning now. (i) A discrete-time sinusoid need not be periodic. (ii) Discrete-time frequency only has meaning modulo $2\\pi$. (iii) The discrete-time Fourier transform is itself $2\\pi$-periodic. Everything else translates directly.'}
  ]}
]},

{ id:'m0-map', module:'M0', nav:'Course concept map', title:'How the course fits together', src:'pp. 2–88',
  objective:'Give a single mental picture of the dependency structure.',
  keywords:'map overview dependencies modules', steps:1, blocks:[
  {t:'eyebrow', text:'Module 0 · Orientation'},
  {t:'title', text:'The shape of the course'},
  {t:'cols', ratio:'c-7-5', vcenter:true, left:[
    {t:'fig', svg:conceptMap}
  ], right:[
    {t:'lede', text:'Each ring depends on the one inside it. Nothing here can be safely skipped.'},
    {t:'body', html:`<p><b>M1 · Signals.</b> What a signal is, how much energy or power it carries, how it behaves under shifting, reversal and scaling, and when it repeats.</p>
      <p><b>M2 · Systems.</b> Six properties, each with a formal test. Two of them, linearity and time invariance, are needed for everything that follows.</p>
      <p><b>M3 · LTI systems.</b> A system with both of those properties is described completely by one function, $h$, and one operation, convolution.</p>
      <p><b>M4+ · Fourier and sampling.</b> Complex exponentials are the eigenfunctions of LTI systems. This one fact turns convolution into multiplication and opens the frequency domain. It also explains what is lost when a continuous signal is sampled.</p>`},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'What is covered here', html:'Modules 0 to 7 are complete, with ten laboratories, A to J, and twenty worked practice questions in every module from 1 onwards.'}
    ]}
  ]}
]},

{ id:'m0-howto', module:'M0', nav:'Using this artifact', title:'How to use this artifact', src:'—',
  objective:'Explain modes, controls and the definition-citation policy.',
  keywords:'help navigation modes instructor student reduced motion privacy', steps:0, blocks:[
  {t:'eyebrow', text:'Module 0 · Orientation'},
  {t:'title', text:'How to use this artifact'},
  {t:'grid', cols:2, gap:'24px', style:'flex:1;min-height:0;grid-auto-rows:1fr;', items:[
    [{t:'card', head:'Navigation', items:[
      {t:'body', html:`<p><kbd>→</kbd> / <kbd>space</kbd> advances one <em>reveal state</em>, then one scene. <kbd>←</kbd> steps back.
        <kbd>↑</kbd> <kbd>↓</kbd> jump whole scenes. <kbd>Home</kbd> returns to the title.</p>
        <p><kbd>M</kbd> opens the module map, <kbd>/</kbd> the full-text search, <kbd>G</kbd> the notation glossary, <kbd>?</kbd> this help.</p>
        <p><kbd>L</kbd> toggles lecture / self-study, <kbd>I</kbd> student / instructor, <kbd>R</kbd> reduced motion.</p>`}
    ]}],
    [{t:'card', head:'Two modes', items:[
      {t:'body', html:`<p><b>Lecture mode</b> steps back into the last reveal state of the previous scene, so a derivation on screen stays complete. <b>Self-study mode</b> always re-enters a scene at its first state.</p>`}
    ]}],
    [{t:'card', head:'Two editions', items:[
      {t:'body', html:`<p>The <b>student edition</b> hides full solutions until they are requested and shows no teaching commentary. The <b>instructor edition</b> exposes presenter notes, misconception warnings and every solution immediately.</p>`}
    ]}],
    [{t:'card', head:'How the material is organised', items:[
      {t:'body', html:`<p>Each module builds only on the modules before it. Inside a module, a concept is first shown
        visually. It is then defined, written as an equation, and derived one step at a time. After that it is used in a
        worked example and tested with a short check. Worked examples always use the same five headings:
        Given, Find, Method, Solution, Check.</p>`}
    ]}],
    [{t:'card', head:'Conventions fixed for the whole artifact', items:[
      {t:'body', html:`<p>Energy and power are <b>normalised</b>, with $R=1\\ \\Omega$. The imaginary unit is written $j$. Angular frequency $\\omega$ is in rad/s in continuous time and in rad/sample in discrete time. Frequency in hertz is always written as such.</p>`}
    ]}],
    [{t:'card', head:'Privacy and offline use', items:[
      {t:'body', html:`<p>The artifact is a single self-contained file. It makes no network requests, collects no analytics, and stores optional progress only on this device. If browser storage is unavailable the artifact still runs and simply forgets progress when closed.</p>`},
      {t:'raw', html:'<div><button class="btn" data-act="reset">Reset all local progress</button></div>'}
    ]}]
  ]}
]}
];

window.SCENES_M0 = SC;
})();
