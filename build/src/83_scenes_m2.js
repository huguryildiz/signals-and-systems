/* ==========================================================================
   Module 2 — Systems and Their Properties   [Source: 11–14]
   ========================================================================== */
(function(){
const P = PLOT, C = P.COL;
const disc=(f,a,b)=>{const o=[];for(let n=Math.ceil(a);n<=b;n++)o.push([n,f(n)]);return o;};
const num=v=>String(Math.round(v*100)/100);
/* A figure played in frames that highlights one group at a time: group g is
   fully drawn at frame g (and at frame 0, where every group is), faded
   otherwise, with the opacity eased between neighbouring frames. */
const groupOp=(k,g)=>{ const at=i=>(i===0||i===g)?1:0.18, i0=Math.floor(k), i1=Math.ceil(k);
  return at(i0)+(at(i1)-at(i0))*(k-i0); };
const inner=s=>s.replace(/^<svg[^>]*>/,'').replace(/<\/svg>\s*$/,'');
/* ---- everyday systems, one gallery slide at the end of the teaching
       sections. The traces are schematic; each keeps the property it shows.
       A figure with two traces carries its legend as a third entry. */
const EXO = o => Object.assign({w:520,h:250,pad:{l:60,r:26,t:24,b:40},ytarget:3}, o);
function realGallery(cfg){
  return { id:cfg.id, module:'M2', nav:cfg.nav, title:cfg.title, src:cfg.src,
    objective:cfg.objective, keywords:cfg.keywords,
    budget:cfg.budget||'A gallery of four everyday systems; each figure is one example.',
    slide:true, steps:cfg.notes.length-1, blocks:[
    {t:'eyebrow', text:cfg.eyebrow, src:cfg.src},
    {t:'title', text:cfg.title},
    {t:'cols', ratio:'c-8-4', fill:true, left:[
      {t:'grid', cols:2, gap:'18px 22px', items:cfg.figs.map(([svg,cap,lg])=>
        [{t:'fig', frame:true, svg, caption:cap}].concat(lg?[{t:'legend', items:lg}]:[]))}
    ], right:(cfg.photos ? [{t:'grid', cols:cfg.photos.length, gap:'12px 14px', items:cfg.photos.map(([k,alt,cap])=>
        [{t:'fig', svg:()=>`<img class="photo" src="${IMG[k]}" alt="${alt}">`, caption:cap}])}] : [])
      .concat(cfg.notes.map((n,i)=>i ? {t:'reveal', at:i, items:[n]} : n))}
  ]};
}

const REAL_SYSTEMS = realGallery({ id:'m2-real-systems', nav:'Systems around us',
  title:'Systems Around Us', eyebrow:'Module 2 · Systems in practice', src:'pp. 11–14',
  objective:'Attach the six properties to systems students meet every day.',
  keywords:'examples RC circuit overdrive clipping savings account echo memory linear stable',
  photos:[['m2_rc','A resistor and a capacitor on a breadboard with a probe','An RC circuit remembers its past through the capacitor.'],['m2_overdrive','A guitar overdrive pedal on a stage floor','An overdrive pedal clips the guitar signal at each instant.']],
  figs:[
    [()=>{ const a=P.Axes(EXO({xr:[-1,5],yr:[-0.8,9],xlabel:'t\\;(\\text{ms})',ylabel:'v(t)\\;(\\text{V})',xstep:1}));
      a.curve(t=>t>=0?5:0,{color:C.in,dash:'9 6'});
      a.curve(t=>t>=0?5*(1-Math.exp(-t)):0,{color:C.out});
      return a.svg(); }, 'An RC circuit smooths a switched supply, $v_C(t)=5\\,(1-e^{-t/\\tau})$: causal, with memory.',
      [['in','$v_s(t)$',true],['out','$v_C(t)$']]],
    [()=>{ const a=P.Axes(EXO({xr:[0,2],yr:[-2.4,3.6],xlabel:'t\\;(\\text{ms})',ylabel:'v(t)\\;(\\text{V})',xstep:0.5}));
      a.curve(t=>1.5*Math.sin(2*Math.PI*t),{color:C.in,dash:'9 6',n:900});
      a.curve(t=>Math.tanh(3*Math.sin(2*Math.PI*t)),{color:C.out,n:900});
      return a.svg(); }, 'A guitar overdrive flattens the peaks, $y(t)=\\tanh\\bigl(2x(t)\\bigr)$: memoryless, not linear.',
      [['in','$x(t)$',true],['out','$y(t)$']]],
    [()=>{ const y=[]; let prev=0; for(let n=0;n<=24;n++){ prev=1.01*prev+100; y.push([n,prev]); }
      const a=P.Axes(EXO({xr:[-1,25],yr:[0,3400],xlabel:'n\\;(\\text{month})',ylabel:'y[n]\\;(\\text{EUR})',xstep:6}));
      a.stem([[-1,0]].concat(y),{color:C.out,r:3});
      return a.svg(); }, 'Savings with 1 % a month, $y[n]=1.01\\,y[n-1]+x[n]$: a deposit of 100 a month grows without bound.'],
    [()=>{ const a=P.Axes(EXO({xr:[-2,14],yr:[-0.2,1.3],xlabel:'n\\;(\\text{ms})',ylabel:'y[n]\\;(\\text{V})',xstep:4}));
      a.stem(disc(n=>n===0?1:n===8?0.6:0,-2,14),{color:C.out});
      return a.svg(); }, 'A digital echo turns a click into two pulses, $y[n]=x[n]+0.6\\,x[n-8]$: linear, time invariant.']
  ],
  notes:[
    {t:'note', kind:'def', head:'Properties in practice', html:'The RC circuit and the echo are linear and time invariant. The overdrive is memoryless but not linear.'},
    {t:'note', kind:'warn', head:'Only approximately', html:'An amplifier is linear only until it clips. A circuit that warms up is only close to time invariant.'}
  ]});

/* Small sketches for the summary and project cards. Both pages are navy, so
   they are drawn in the dark-page signal tints. */
const G = (()=>{
  const sv = b => `<svg viewBox="0 0 92 44">${b}</svg>`;
  const ln = (d,c,w) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w||2}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const AX='rgba(239,231,216,.30)', CY='#4FBECE', GR='#82C27B', RD='#E8785F', VI='#AC99DC', AM='#E5B255';
  const wave = (x0,x1,y0,amp,c,w) => ln('M'+[...Array(41)].map((_,k)=>{ const x=x0+(x1-x0)*k/40;
    return x.toFixed(1)+','+(y0-amp*Math.sin(Math.PI*k/10)).toFixed(1); }).join('L'),c,w);
  return {
    mem:    sv(ln('M1 16 H91 M1 38 H91',AX,1)+wave(2,90,16,9,CY,1.6)+wave(2,90,38,5,GR,1.6)
               +ln('M46 6 V42',AM,1.4)),
    inv:    sv(ln('M2 30 H8 V12 H20 V30',CY,1.6)+ln('M26 21 H36 M32 17 L36 21 L32 25',AX,1.4)
               +ln('M42 30 H48 V20 H54 V30',VI,1.6)+ln('M60 21 H70 M66 17 L70 21 L66 25',AX,1.4)+ln('M76 30 H80 V12 H90',CY,1.6)),
    caus:   sv(ln('M1 38 H91',AX,1)+ln('M2 30 Q14 8 28 26 T56 22',CY)+ln('M56 22 Q66 14 76 26 T90 20',AX,1.4)
               +ln('M56 4 V42',RD,1.6)),
    stab:   sv(ln('M1 8 H91 M1 38 H91',AM,1.2)+wave(2,90,23,11,GR,1.8)),
    lin:    sv(ln('M8 40 V4 M4 36 H88',AX,1)+ln('M8 36 L84 8',GR)+`<circle cx="46" cy="22" r="2.6" fill="${GR}"/>`),
    ti:     sv(ln('M1 36 H91',AX,1)+ln('M4 36 H10 V14 H22 V36',CY,1.6)+ln('M30 24 H48 M44 20 L48 24 L44 28',AX,1.4)
               +ln('M60 36 H66 V14 H78 V36 H90',GR,1.6)),
    proof:  sv(ln('M12 24 L22 34 L40 10',GR,2.4)+ln('M58 10 L80 34 M80 10 L58 34',RD,2.4)),
    imply:  sv(`<ellipse cx="46" cy="22" rx="40" ry="19" fill="none" stroke="${CY}" stroke-width="1.6"/>`
               +`<ellipse cx="34" cy="22" rx="17" ry="10" fill="none" stroke="${GR}" stroke-width="1.6"/>`),
    listen: sv(ln('M1 23 H91',AX,1)+wave(2,44,23,14,CY,1.4)+ln('M48 23 H56',AX,1.4)
               +ln('M'+[...Array(35)].map((_,k)=>{ const x=58+k; return x+','+(23-14*Math.tanh(2.5*Math.sin(Math.PI*k/8))).toFixed(1); }).join('L'),GR,1.4)),
    sat:    sv(ln('M46 4 V42 M2 23 H90',AX,1)+ln('M'+[...Array(89)].map((_,k)=>(2+k)+','+(23-17*Math.tanh((k-44)/14)).toFixed(1)).join('L'),GR)
               +ln('M30 39 L62 7',AX,1.2)),
    fade:   sv(ln('M1 23 H91',AX,1)+ln('M2 6 Q46 30 90 14 M2 40 Q46 16 90 32',AM,1.2)
               +ln('M'+[...Array(89)].map((_,k)=>(2+k)+','+(23-(12-7*Math.sin(k/14))*Math.sin(k/2.2)).toFixed(1)).join('L'),CY,1.4))
  };
})();

const SC = [

{ id:'m2-open', module:'M2', nav:'Module 2 opening', title:'Systems and Their Properties', src:'pp. 11–14',
  dark:true, keywords:'module 2 systems properties overview', steps:0, blocks:[
  {t:'eyebrow', text:'Module 2 · Systems and Their Properties', src:'pp. 11–14'},
  {t:'title', level:1, text:'Systems and Their Properties'},
  {t:'lede', text:'This module gives tests for memory, invertibility, causality, stability, time invariance and linearity. These tests describe a system by its input and output signals.'},
  {t:'raw', html:`<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:22px;margin:auto 0;max-width:1500px">
    ${['Memoryless','Invertible','Causal','BIBO stable','Time invariant','Linear'].map((n,i)=>
      `<div class="mtf-fade" style="animation-delay:${(.2+i*.16).toFixed(2)}s;border-top:2px solid ${i>=4?'var(--coral)':'rgba(233,236,242,.35)'};padding-top:14px">
        <div style="font-family:var(--mono);font-size:12px;letter-spacing:.14em;color:var(--slate)">0${i+1}</div>
        <div style="font-family:var(--serif);font-size:25px;margin-top:6px;color:var(--ink)">${n}</div>
        ${i>=4?'<div style="font-size:14px;color:var(--terracotta);margin-top:8px">required for convolution</div>':''}
      </div>`).join('')}
  </div>`},
  {t:'raw', html:'<div style="margin-top:auto"></div>'},
  {t:'note', kind:'warn', head:'How to decide a property', html:'<span style="color:var(--graphite)">To establish a property, give a proof that holds for every input. To disprove a property, give one explicit counterexample.</span>'}
]},

{ id:'m2-abstraction', module:'M2', nav:'Input–output abstraction', title:'The input–output abstraction', src:'p. 11',
  objective:'Define a system as a deterministic map between signals.',
  keywords:'system black box deterministic input output CT DT', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 2 · Abstraction', src:'p. 11'},
  {t:'title', text:'Input–Output Abstraction'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>P.blocks({w:560,h:380,items:[
      {t:'arrow',x1:40,y1:110,x2:180,y2:110},{t:'box',x:180,y:65,w:200,h:90,label:'S',tex:true},
      {t:'arrow',x1:380,y1:110,x2:520,y2:110},
      {t:'text',x:110,y:94,label:'x(t)',tex:true,fs:18},{t:'text',x:450,y:94,label:'y(t)',tex:true,fs:18},
      {t:'arrow',x1:40,y1:280,x2:180,y2:280},{t:'box',x:180,y:235,w:200,h:90,label:'S',tex:true},
      {t:'arrow',x1:380,y1:280,x2:520,y2:280},
      {t:'text',x:110,y:264,label:'x[n]',tex:true,fs:18},{t:'text',x:450,y:264,label:'y[n]',tex:true,fs:18}
    ]}), caption:'The same operator in continuous time and in discrete time.'}
  ], right:[
    {t:'note', kind:'def', head:'Definition', html:'A system turns an input signal into an output signal. The same input always gives the same output.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'y=S\\{x\\}', label:'The operator', note:'$S$ acts on the whole input signal.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Equality', html:'Two systems are equal when they give the same output for every input. Their construction may differ.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$S_1$ doubles its input with an amplifier. $S_2$ adds its input to itself.<div class="nsep"></div>Are $S_1$ and $S_2$ the same system?',
        ask:{key:'m2-abstraction', choices:['Yes','No'], answer:0,
          why:'Both give $y=2x$ for every input, so they are equal, although they are built differently.'}}]}
  ]}
]},

{ id:'m2-models', module:'M2', nav:'One equation, many systems', title:'One Equation, Many Systems', src:'p. 11',
  objective:'Show that different physical systems share one input–output equation.',
  keywords:'RC circuit car friction savings first-order differential difference equation model idealization',
  slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 2 · Abstraction', src:'p. 11'},
  {t:'title', text:'One Equation, Many Systems'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>P.blocks({w:560,h:390,items:[
      {t:'arrow',x1:20,y1:95,x2:150,y2:95,label:'v_s(t)',tex:true},
      {t:'box',x:150,y:15,w:270,h:160,label:''},
      {t:'arrow',x1:420,y1:95,x2:545,y2:95,label:'v_C(t)',tex:true},
      {t:'line',d:'M195,79 V45 H235 l5,-8 l10,16 l10,-16 l10,16 l10,-16 l10,16 l5,-8 H370 V87 M352,87 H388 M352,103 H388 M370,103 V145 H195 V111'},
      {t:'line',d:'M195,79 a16,16 0 1,0 0.01,0 M190,89 h10 M195,84 v10 M190,103 h10'},
      {t:'text',x:265,y:72,label:'R',tex:true,fs:16},
      {t:'text',x:402,y:99,label:'C',tex:true,fs:16},
      {t:'arrow',x1:20,y1:300,x2:150,y2:300,label:'f(t)',tex:true},
      {t:'box',x:150,y:215,w:270,h:160,label:''},
      {t:'arrow',x1:420,y1:300,x2:545,y2:300,label:'v(t)',tex:true},
      {t:'box',x:225,y:265,w:120,h:52,label:'m',tex:true},
      {t:'dot',x:250,y:328,r:10},{t:'dot',x:320,y:328,r:10},
      {t:'line',d:'M175,339 H395'},
      {t:'arrow',x1:172,y1:291,x2:223,y2:291,label:'f',tex:true},
      {t:'arrow',x1:290,y1:245,x2:345,y2:245,label:'v',tex:true},
      {t:'text',x:285,y:361,label:'\\text{friction }\\rho v',tex:true,fs:14}
    ]}), caption:'Each system drawn inside a box: one signal goes in, one comes out.'},
    {t:'reveal', at:1, items:[
      {t:'fig', frame:true, svg:()=>P.blocks({w:560,h:130,items:[
        {t:'arrow',x1:20,y1:65,x2:150,y2:65,label:'x(t)',tex:true},
        {t:'box',x:150,y:15,w:270,h:100,label:'\\dfrac{dy}{dt}+a\\,y=b\\,x',tex:true,fs:18},
        {t:'arrow',x1:420,y1:65,x2:545,y2:65,label:'y(t)',tex:true}
      ]}), caption:'Seen from outside, both boxes are the same box.'}]}
  ], right:[
    {t:'eq', tex:'\\begin{aligned}\\frac{dv_C(t)}{dt}+\\frac{1}{RC}\\,v_C(t)&=\\frac{1}{RC}\\,v_s(t)\\\\[10pt]\\frac{dv(t)}{dt}+\\frac{\\rho}{m}\\,v(t)&=\\frac{1}{m}\\,f(t)\\end{aligned}', label:'Two systems',
      note:'RC circuit: voltage $v_s$ in, $v_C$ out. Car of mass $m$: force $f$ in, speed $v$ out, friction $\\rho v$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\begin{aligned}\\frac{dy(t)}{dt}+a\\,y(t)&=b\\,x(t)\\\\[10pt]y[n]+a\\,y[n-1]&=b\\,x[n]\\end{aligned}', label:'One form',
        note:'RC circuit: $a=b=1/RC$. Car: $a=\\rho/m$, $b=1/m$. A savings account has the second line. One method serves every system of a form.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'A model has limits', html:'Ohm\'s law and linear friction are idealizations. An analysis holds only while the signals stay in the range where the model is accurate.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'A savings account with 1 % interest a month: $y[n]=1.01\\,y[n-1]+x[n]$.<div class="nsep"></div>Written as $y[n]+a\\,y[n-1]=b\\,x[n]$, what is $a$?',
        ask:{key:'m2-models', choices:['$-1.01$','$1.01$','$0.01$'], answer:0,
          why:'Move $1.01\\,y[n-1]$ to the left: $y[n]-1.01\\,y[n-1]=x[n]$, so $a=-1.01$ and $b=1$.'}}]}
  ]}
]},

{ id:'m2-interconnect', module:'M2', nav:'Connecting systems', title:'Connecting Systems', src:'p. 11',
  objective:'Define series, parallel and feedback connections of systems.',
  keywords:'interconnection series cascade parallel feedback block diagram accumulator',
  slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 2 · Abstraction', src:'p. 11'},
  {t:'title', text:'Connecting Systems'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['All three','Series','Parallel','Feedback']},
      svg:v=>{
      const k=v?v.frame:0, head=(x,y,d)=>`<path d="M${x},${y} ${d}" fill="${C.ink}"/>`;
      const tag=(y,txt,g)=>({t:'text',x:35,y,label:txt,fs:13,anchor:'start',color:Math.round(k)===g?C.coral:C.slate});
      const groups=[
        [[tag(26,'SERIES',1),
          {t:'arrow',x1:35,y1:78,x2:120,y2:78},{t:'box',x:120,y:52,w:100,h:52,label:'S_1',tex:true},
          {t:'arrow',x1:220,y1:78,x2:320,y2:78},{t:'box',x:320,y:52,w:100,h:52,label:'S_2',tex:true},
          {t:'arrow',x1:420,y1:78,x2:525,y2:78},
          {t:'text',x:70,y:62,label:'x',tex:true,fs:17},{t:'text',x:480,y:62,label:'y',tex:true,fs:17}], '', {t:'text',x:525,y:26,label:'y=S_2\\big(S_1(x)\\big)',tex:true,fs:15,anchor:'end',color:C.ink}],
        [[tag(146,'PARALLEL',2),
          {t:'line',d:'M35 215 H90 M90 185 V245'},
          {t:'arrow',x1:90,y1:185,x2:200,y2:185},{t:'box',x:200,y:163,w:100,h:44,label:'S_1',tex:true},
          {t:'arrow',x1:90,y1:245,x2:200,y2:245},{t:'box',x:200,y:223,w:100,h:44,label:'S_2',tex:true},
          {t:'line',d:'M300 185 H410 V201 M300 245 H410 V229'},{t:'sum',x:410,y:215},
          {t:'arrow',x1:424,y1:215,x2:525,y2:215},
          {t:'text',x:58,y:199,label:'x',tex:true,fs:17},{t:'text',x:480,y:199,label:'y',tex:true,fs:17}],
         head(410,201,'l-4.5,-9 h9 Z')+head(410,229,'l-4.5,9 h9 Z'),
         {t:'text',x:525,y:146,label:'y=S_1(x)+S_2(x)',tex:true,fs:15,anchor:'end',color:C.ink}],
        [[tag(296,'FEEDBACK',3),
          {t:'arrow',x1:35,y1:345,x2:86,y2:345},{t:'sum',x:100,y:345},
          {t:'arrow',x1:114,y1:345,x2:200,y2:345},{t:'box',x:200,y:323,w:100,h:44,label:'S_1',tex:true},
          {t:'arrow',x1:300,y1:345,x2:525,y2:345},
          {t:'line',d:'M430 345 V402 H330 M250 402 H100 V359'},{t:'box',x:250,y:380,w:80,h:44,label:'S_2',tex:true},
          {t:'text',x:58,y:329,label:'x[n]',tex:true,fs:17},{t:'text',x:480,y:329,label:'y[n]',tex:true,fs:17},
          {t:'text',x:175,y:388,label:'y[n-1]',tex:true,fs:15}],
         head(100,359,'l-4.5,9 h9 Z')+head(330,402,'l9,-4.5 v9 Z'),
         {t:'text',x:525,y:296,label:'y[n]=x[n]+y[n-1]',tex:true,fs:15,anchor:'end',color:C.ink}]
      ];
      // each relation appears once Next reaches its connection, and stays
      const body=groups.map(([items,extra,eq],i)=>`<g opacity="${groupOp(k,i+1).toFixed(3)}">${inner(P.blocks({w:560,h:440,items}))}${extra}<g opacity="${Math.min(1,Math.max(0,k-i)).toFixed(3)}">${inner(P.blocks({w:560,h:440,items:[eq]}))}</g></g>`).join('');
      return `<svg viewBox="0 0 560 440" xmlns="http://www.w3.org/2000/svg" role="img" font-family="Inter,-apple-system,sans-serif">${body}</svg>`; },
      caption:'Three ways to connect two systems, taken one at a time with Next. The circle adds the signals that enter it.'}
  ], right:[
    {t:'note', kind:'def', head:'Series and parallel', html:'In a series connection, or cascade, the output of $S_1$ is the input of $S_2$. In a parallel connection, both systems get the same input and their outputs add.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'y[n]=x[n]+y[n-1]', label:'Feedback',
        note:'The output of $S_2$ returns and adds to the input. With $S_1$ passing its input and $S_2$ a one-sample delay, the loop is the accumulator of the memory slides.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Order matters', html:'The order in a series connection can change the result. Squaring and then doubling gives $2x^2$. Doubling and then squaring gives $4x^2$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$S_1$: $y[n]=x[n-1]$, followed in series by $S_2$: $y[n]=2\\,x[n]$.<div class="nsep"></div>What is the overall rule?',
        ask:{key:'m2-interconnect', choices:['$y[n]=2\\,x[n-1]$','$y[n]=x[n-1]+2\\,x[n]$','$y[n]=2\\,x[n]$'], answer:0,
          why:'$S_1$ delays the input by one sample, and $S_2$ doubles the delayed signal.'}}]}
  ]}
]},

{ id:'m2-memory', module:'M2', nav:'Memory', title:'Memoryless systems and systems with memory', src:'p. 11',
  objective:'Define memorylessness and test it on the definition examples.',
  keywords:'memoryless memory instantaneous resistor capacitor accumulator', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 2 · Property 1', src:'p. 11'},
  {t:'title', text:'Memoryless Systems'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>P.blocks({w:560,h:420,items:[
      {t:'line',d:'M40 210 h70 l14 -28 l28 56 l28 -56 l28 56 l28 -56 l14 28 h70'},
      {t:'text',x:420,y:185,label:'v(t)=R\\,i(t)',fs:17,tex:true},
      {t:'text',x:420,y:235,label:'memoryless: output now, input now',fs:13}
    ]}), caption:'A resistor is memoryless. The voltage at $t$ uses the current at $t$.'}
  ], right:[
    {t:'note', kind:'def', head:'Criterion', html:'A system is memoryless if the output at time $t$, or at $n$, depends only on the input at that same time.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'Memoryless', html:'$y(t)=\\bigl[2x(t)-x^{2}(t)\\bigr]^{2}$ uses only $x(t)$. The identity $y[n]=x[n]$ is memoryless.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Has memory', html:'$y[n]=x[n-1]$ uses the previous input. The output at $n$ depends on $n-1$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$y(t)=x(t/2)$.<div class="nsep"></div>Is the system memoryless?',
        ask:{key:'m2-memory', choices:['Memoryless','Has memory'], answer:1,
          why:'At $t=2$ the output uses $x(1)$, an input at a different time.'}}]}
  ]}
]},

{ id:'m2-memory-b', module:'M2', nav:'Accumulator', title:'Feedback Gives Memory', src:'p. 11',
  objective:'Show that output feedback can make a system remember its input.',
  keywords:'accumulator feedback memory sum', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 2 · Property 1', src:'p. 11'},
  {t:'title', text:'Feedback Gives Memory'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'n', label:'$n$', min:-3, max:9, step:1, v:-3,
        show:v=>v<-2?'input only':'$y['+v+']='+Math.min(Math.max(0,v+1),6)+'$'}]},
      svg:v=>{
      /* The slider runs the accumulator one sample at a time, as on the
         unbounded-output slide. At its left end only the input x[n] is drawn.
         At n the outputs up to n are drawn; the sample at n is the old level
         y[n-1] (dashed) with the piece x[n] stacked on it in the input colour.
         Past n=5 the input is 0 and y[n] only repeats y[n-1]. */
      const m=v?v.n:9;
      const a=P.Axes({w:590,h:360,xr:[-2,9],yr:[-0.4,9],xlabel:'n',ylabel:'\\text{amplitude}',pad:{l:50,r:24,t:20,b:34},xtarget:7,ystep:2});
      const X=n=>a.sx(n).toFixed(2), Y=u=>a.sy(u).toFixed(2);
      const x=n=>(n>=0&&n<=5)?1:0, y=n=>n<0?0:Math.min(n+1,6);
      a.raw(`<g opacity="${m<-2?1:0.35}">`); a.stem(disc(x,-2,9),{color:C.in}); a.raw('</g>');
      if(m>=-2){
        a.stem(disc(n=>n<m?y(n):y(n-1),-2,m),{color:C.h,r:3});
        if(m>=0){
          a.raw(`<line x1="${X(m-1)}" y1="${Y(y(m-1))}" x2="${X(m)}" y2="${Y(y(m-1))}" stroke="${C.h}" stroke-width="1.6" stroke-dasharray="5 4" opacity=".75"/>`);
          if(x(m)){
            a.raw(`<line x1="${X(m)}" y1="${Y(y(m-1))}" x2="${X(m)}" y2="${Y(y(m))}" stroke="${C.in}" stroke-width="3"/>`);
            a.raw(`<circle cx="${X(m)}" cy="${Y(y(m))}" r="4.6" fill="${C.in}"/>`);
          }
          const lab='y['+m+']=x['+m+']+y['+(m-1)+']='+y(m);
          if(m<4) a.note(m,y(m)+0.8,lab,{anchor:'middle',color:C.h,fs:15,tex:true});
          else a.note(m-0.5,y(m)+0.3,lab,{anchor:'end',color:C.h,fs:15,tex:true});
        }
      }
      return a.svg(); },
      caption:'Each output of the accumulator carries every earlier input. Drag $n$ to see $y[n]$ built one sample at a time.'},
    {t:'legend', items:[['in','$x[n]$'],['h','$y[n]$']]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The accumulator is at rest and $x[n]=\\delta[n]$.<div class="nsep"></div>What is $y[3]$?',
        ask:{key:'m2-memory-b', choices:['$0$','$1$','$3$'], answer:1,
          why:'The impulse enters once and the feedback keeps it, so $y[n]=u[n]$ and $y[3]=1$.'}}]}
  ], right:[
    {t:'eq', tex:'y[n]=x[n]+y[n-1]', label:'Feedback'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'y[n-1]=x[n-1]+y[n-2]', label:'Replace $n$ by $n-1$', note:'The equation holds at every time. Put $n-1$ where $n$ stands and it gives $y[n-1]$ in terms of $x[n-1]$ and $y[n-2]$.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'\\begin{aligned}y[n]&=x[n]+\\underbrace{y[n-1]}_{\\text{previous output}}\\\\&=x[n]+\\underbrace{x[n-1]+y[n-2]}_{y[n-1]}\\\\&=x[n]+x[n-1]+\\underbrace{x[n-2]+y[n-3]}_{y[n-2]}\\\\&=x[n]+x[n-1]+x[n-2]+\\cdots\\\\&=\\sum_{k=0}^{\\infty}x[n-k]\\end{aligned}', label:'The past', note:'The output uses $x[n-k]$ for every $k\\ge 0$, so feedback gives the system memory. This form assumes initial rest.'}]}

  ]}
]},

{ id:'m2-invertible', module:'M2', nav:'Invertibility', title:'Invertibility', src:'pp. 11–12',
  objective:'Define invertibility and demonstrate both proof strategies.',
  keywords:'invertible one-to-one inversion formula counterexample distinct inputs', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 2 · Property 2', src:'pp. 11–12'},
  {t:'title', text:'Invertibility'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>P.blocks({w:560,h:420,items:[
      {t:'line',d:'M105 210 m-70,0 a70,70 0 1,0 140,0 a70,70 0 1,0 -140,0'},
      {t:'line',d:'M455 210 m-70,0 a70,70 0 1,0 140,0 a70,70 0 1,0 -140,0'},
      {t:'text',x:105,y:95,label:'inputs',fs:14},{t:'text',x:455,y:95,label:'outputs',fs:14},
      {t:'line',d:'M105 180 C 210 150, 350 150, 455 180',color:C.in},
      {t:'line',d:'M105 240 C 210 270, 350 270, 455 240',color:C.out},
      {t:'dot',x:105,y:180,r:7,color:C.in},{t:'dot',x:455,y:180,r:7,color:C.in},
      {t:'dot',x:105,y:240,r:7,color:C.out},{t:'dot',x:455,y:240,r:7,color:C.out},
      {t:'text',x:93,y:186,label:'x_1',fs:19,tex:true,color:C.in,anchor:'end'},{t:'text',x:93,y:246,label:'x_2',fs:19,tex:true,color:C.out,anchor:'end'},
      {t:'text',x:467,y:186,label:'y_1',fs:19,tex:true,color:C.in,anchor:'start'},{t:'text',x:467,y:246,label:'y_2',fs:19,tex:true,color:C.out,anchor:'start'},
      {t:'text',x:280,y:138,label:'\\text{one-to-one}\\Rightarrow\\text{invertible}',fs:14,color:C.slate,tex:true}
    ]}), caption:'Invertibility is a property of the map. Distinct inputs must land on distinct outputs.'}
  ], right:[
    {t:'note', kind:'def', head:'Criterion', html:'A system is invertible if distinct inputs produce distinct outputs. The map is one-to-one.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'Two methods', html:'To prove it, recover every input from its output. To disprove it, find two distinct inputs with the same output.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'$y(t)=\\bigl[\\cos(t)+2\\bigr]x(t)$.<div class="nsep"></div>Is the system invertible?',
        ask:{key:'m2-invertible', choices:['Invertible','Not invertible'], answer:0}}]},
    {t:'reveal', at:3, items:[
      {t:'eq', tex:'\\begin{aligned}-1&\\le\\cos(t)\\le1\\\\1&\\le\\cos(t)+2\\le3\\\\x(t)&=\\dfrac{y(t)}{\\cos(t)+2}\\end{aligned}', label:'Recover the input',
        note:'The divisor is never zero, so the system is invertible.'}]}
  ]}
]},

{ id:'m2-invertible-b', module:'M2', nav:'Squaring', title:'Squaring Is Not Invertible', src:'pp. 11–12',
  objective:'Disprove invertibility with two inputs that share an output.',
  keywords:'square counterexample sign not invertible', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 2 · Property 2', src:'pp. 11–12'},
  {t:'title', text:'Squaring Is Not Invertible'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>P.blocks({w:560,h:420,items:[
      {t:'line',d:'M115 210 m-95,0 a95,125 0 1,0 190,0 a95,125 0 1,0 -190,0'},
      {t:'line',d:'M445 210 m-95,0 a95,125 0 1,0 190,0 a95,125 0 1,0 -190,0'},
      {t:'text',x:115,y:62,label:'\\text{inputs}',fs:16,tex:true},{t:'text',x:445,y:62,label:'\\text{outputs}',fs:16,tex:true},
      {t:'line',d:'M184 165 L385 210',color:C.in},
      {t:'line',d:'M184 255 L385 210',color:C.mid},
      {t:'dot',x:184,y:165,r:7,color:C.in},{t:'dot',x:184,y:255,r:7,color:C.mid},
      {t:'dot',x:385,y:210,r:8,color:C.err},
      {t:'text',x:174,y:171,label:'x_1(t)=1',fs:17,tex:true,color:C.in,anchor:'end'},
      {t:'text',x:174,y:261,label:'x_2(t)=-1',fs:17,tex:true,color:C.mid,anchor:'end'},
      {t:'text',x:399,y:216,label:'y(t)=1',fs:19,tex:true,color:C.err,anchor:'start'}
    ]}),
      caption:'Two distinct inputs map to one output, so squaring is not one-to-one and not invertible.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$y(t)=x^{2}(t)$.<div class="nsep"></div>Is the system invertible?',
      ask:{key:'m2-invertible-b', choices:['Invertible','Not invertible'], answer:1}},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\begin{aligned}x_1(t)&=1&\\Longrightarrow\\quad S\\{x_1\\}&=1^2=1\\\\x_2(t)&=-1&\\Longrightarrow\\quad S\\{x_2\\}&=(-1)^2=1\\end{aligned}', label:'Two inputs, one output',
        note:'The inputs are distinct, but their outputs are equal. The sign is lost.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Not an inverse', html:'$x(t)=\\sqrt{y(t)}$ keeps only one of the two inputs. An inverse must recover the actual input.'}]}
  ]}
]},

{ id:'m2-inverse', module:'M2', nav:'Inverse systems', title:'Inverse Systems', src:'pp. 11–12',
  objective:'Show that an invertible system has an inverse that undoes it in series.',
  keywords:'inverse system cascade identity accumulator first difference encoder decoder',
  slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 2 · Property 2', src:'pp. 11–12'},
  {t:'title', text:'Inverse Systems'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['input $x[n]$','accumulate $n=0$','accumulate $n=1$','accumulate $n=2$',
        'accumulate $n\\ge3$','difference $n=0$','difference $n=1$','difference $n=2$',
        'difference $n\\ge3$: $w[n]=x[n]$'], ms:700},
      svg:v=>{
      /* The chain on top, one line of working under it, the signal below. Frames
         1-4 build y[n]=y[n-1]+x[n] one sample at a time: the old level, then the
         piece x[n] stacked on it (dashed when x[n] is negative). Frames 5-8 take
         y[n]-y[n-1] one sample at a time: that piece slides down onto the axis and
         becomes w[n]. Frame 0 is the printed figure. */
      const k=v?v.frame:0, H=P.hOverride||420; P.hOverride=null;
      const xs=[0,0,1,1,1,0,0,0,0,0,0], n0=-2;                  /* x[n] for n = -2..8 */
      const ys=xs.map((_,i)=>xs.slice(0,i+1).reduce((p,q)=>p+q,0));
      const cl=u=>Math.max(0,Math.min(1,u));
      const stage=k<0.5?0:k<4.5?1:2, on=i=>stage===i;
      const top=P.blocks({w:560,h:140,items:[
        {t:'arrow',x1:15,y1:70,x2:85,y2:70,color:on(0)?C.coral:C.ink},
        {t:'box',x:85,y:35,w:190,h:70,label:'y[n]=\\sum_{k=-\\infty}^{n}x[k]',tex:true,fs:15,color:on(1)?C.coral:C.ink},
        {t:'arrow',x1:275,y1:70,x2:305,y2:70},
        {t:'box',x:305,y:35,w:190,h:70,label:'w[n]=y[n]-y[n-1]',tex:true,fs:15,color:on(2)?C.coral:C.ink},
        {t:'arrow',x1:495,y1:70,x2:550,y2:70},
        {t:'text',x:50,y:54,label:'x[n]',tex:true,fs:16},{t:'text',x:290,y:22,label:'y[n]',tex:true,fs:16},
        {t:'text',x:523,y:54,label:'w[n]',tex:true,fs:16}]});
      const work=['x[n]=\\delta[n]+\\delta[n-1]+\\delta[n-2]',
        'y[n]=x[n]+\\underbrace{x[n-1]+x[n-2]+\\cdots}_{y[n-1]},\\quad y[0]=x[0]+y[-1]=1+0=1','y[1]=y[0]+x[1]=1+1=2','y[2]=y[1]+x[2]=2+1=3',
        'y[n]=y[n-1]+0=3,\\quad n\\ge3',
        'w[0]=y[0]-y[-1]=1-0=1','w[1]=y[1]-y[0]=2-1=1','w[2]=y[2]-y[1]=3-2=1',
        'w[n]=y[n]-y[n-1]=3-3=0,\\quad n\\ge3'];
      const r=Math.round(k), wop=cl(1.6-3.2*Math.abs(k-r));
      const line=P.blocks({w:560,h:200,items:[{t:'text',x:280,y:148,label:work[r],tex:true,fs:13,color:C.coral}]});
      const a=P.Axes({w:560,h:H,xr:[-2.5,8.5],yr:[-0.6,3.8],xlabel:'n',ylabel:['x[n]','y[n]','w[n]'][stage],
        pad:{l:50,r:24,t:196,b:34},xtarget:11,ystep:1});
      const X=n=>a.sx(n).toFixed(2), Y=u=>a.sy(u).toFixed(2), SW=3;
      const seg=(n,u0,u1,col,dash)=>a.raw(`<line x1="${X(n)}" y1="${Y(u0)}" x2="${X(n)}" y2="${Y(u1)}" stroke="${col}" stroke-width="${SW}"${dash?' stroke-dasharray="6 4"':''}/>`);
      const dot=(n,u,col)=>a.raw(`<circle cx="${X(n)}" cy="${Y(u)}" r="4.6" fill="${col}"/>`);
      const lvl=(n,u,col)=>a.raw(`<line x1="${X(n-1)}" y1="${Y(u)}" x2="${X(n)}" y2="${Y(u)}" stroke="${col}" stroke-width="1.6" stroke-dasharray="5 4" opacity=".75"/>`);
      /* the input: full strength in frame 0, a ghost afterwards */
      a.raw(`<g opacity="${(1-.72*cl(k)).toFixed(3)}">`); a.stem(xs.map((_,j)=>[n0+j,xs[j]]),{color:C.in}); a.raw('</g>');
      if(k>0){
        /* the accumulator: the samples reached so far */
        const yo=1-.5*cl(k-4);
        a.raw(`<g opacity="${yo.toFixed(3)}">`);
        a.stem([[-2,0],[-1,0]],{color:C.out});
        for(let n=0;n<=8;n++){
          const j=n+2, am=cl(k-Math.min(n,3)); if(am<=0) continue;
          const pv=ys[j-1], tp=pv+(ys[j]-pv)*am;
          seg(n,0,Math.min(pv,tp),C.out);
          if(Math.abs(tp-pv)>1e-9) seg(n,Math.min(pv,tp),Math.max(pv,tp),C.in,tp<pv);
          if(n>=1&&n<=2&&k<=n+1+1e-9&&k>n+1e-9) lvl(n,pv,C.out);
          dot(n,tp,C.out);
        }
        a.raw('</g>');
      }
      if(k>4){
        /* the first difference: the piece between y[n-1] and y[n] slides down to the axis */
        a.stem([[-2,0],[-1,0]],{color:C.mid});
        for(let n=0;n<=8;n++){
          const j=n+2, b=cl(k-4-Math.min(n,3)); if(b<=0) continue;
          const pv=ys[j-1], sh=b*pv;
          if(n>=1&&n<=2&&k<=n+5+1e-9&&k>n+4+1e-9) lvl(n,pv,C.out);
          seg(n,pv-sh,ys[j]-sh,C.mid);
          dot(n,ys[j]-sh,C.mid);
        }
      }
      return a.svg().replace(/<\/svg>\s*$/, inner(top)+`<g opacity="${wop.toFixed(3)}">`+inner(line)+'</g></svg>'); },
      caption:'Step through the chain. The accumulator adds $x[n]$ to the previous output. The first difference takes it out again, so $w[n]$ equals $x[n]$.'}
  ], right:[
    {t:'note', kind:'def', head:'Inverse system', html:'An invertible system $S$ has an inverse system. Placed in series after $S$, the inverse returns the input: $w=x$ for every $x$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\begin{aligned}y[n]-y[n-1]&=\\sum_{k=-\\infty}^{n}x[k]-\\sum_{k=-\\infty}^{n-1}x[k]\\\\&=x[n]\\end{aligned}', label:'Undo the accumulator',
        note:'Every term except $x[n]$ is in both sums and cancels. The first difference is the inverse of the accumulator.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Where it is used', html:'A lossless encoder must be invertible. The decoder is its inverse system and recovers the message exactly.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$y(t)=3\\,x(t-2)$.<div class="nsep"></div>Which system is its inverse?',
        ask:{key:'m2-inverse', choices:['$w(t)=\\tfrac{1}{3}\\,y(t+2)$','$w(t)=\\tfrac{1}{3}\\,y(t-2)$','$w(t)=3\\,y(t+2)$'], answer:0,
          why:'Advance by 2 to undo the delay, then divide by 3: $\\tfrac{1}{3}\\,y(t+2)=\\tfrac{1}{3}\\cdot3\\,x(t)=x(t)$.'}}]}
  ]}
]},

{ id:'m2-causal', module:'M2', nav:'Causality', title:'Causality', src:'p. 12',
  objective:'Define causality and say where it is required.',
  keywords:'causal non-causal future past present real-time', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 2 · Property 3', src:'p. 12'},
  {t:'title', text:'Causality'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=P.Axes({w:560,h:380,xr:[-5,5],yr:[-0.15,1.25],xlabel:'\\text{time relative to the output instant}',ylabel:'\\text{input access}',
        pad:{l:50,r:24,t:26,b:44},xtarget:11,ytarget:2,yticksOverride:[]});
      a.rect(-5,0,0,1,{fill:'rgba(74,122,70,.14)'});
      a.rect(0,0,5,1,{fill:'rgba(166,59,42,.13)'});
      a.vline(0,{color:C.coral,dash:'0',width:1.6,opacity:1});
      a.note(-2.5,0.6,'available to',{anchor:'middle',color:C.out,fs:15});
      a.note(-2.5,0.505,'a causal system',{anchor:'middle',color:C.out,fs:15});
      a.note(2.5,0.6,'forbidden:',{anchor:'middle',color:C.err,fs:15});
      a.note(2.5,0.505,'the future',{anchor:'middle',color:C.err,fs:15});
      a.note(0,1.12,'now',{anchor:'middle',color:C.coral,fs:14});
      return a.svg(); },
      caption:'A causal system may use the past and the present. It may not use the future.'}
  ], right:[
    {t:'note', kind:'def', head:'Criterion', html:'A system is causal if the output at time $t$, or at $n$, depends only on inputs at times up to $t$. That is the present and the past.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'Where it matters', html:'A system that works as the signal arrives must be causal. A program that processes a stored recording may use later samples.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'$y(t)=x(2t)$.<div class="nsep"></div>Is the system causal?',
        ask:{key:'m2-causal', choices:['Causal','Not causal'], answer:1,
          why:'At $t=1$ the output uses $x(2)$, a future value.'}}]}
  ]}
]},

{ id:'m2-causal-b', module:'M2', nav:'Causal and not causal', title:'Causal and Not Causal', src:'p. 12',
  objective:'Apply the causality test to five system rules.',
  keywords:'causal future reversal cosine', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 2 · Property 3', src:'p. 12'},
  {t:'title', text:'Causal and Not Causal'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=P.Axes({w:560,h:380,xr:[-4,4],yr:[-0.3,1.4],xlabel:'n',ylabel:'\\text{amplitude}',pad:{l:50,r:24,t:20,b:34},xtarget:9,ytarget:2});
      a.stem(disc(n=>n===1?1:0,-4,4),{color:C.in});
      a.stem(disc(n=>n===-1?1:0,-4,4),{color:C.err});
      a.raw(`<path d="M${a.sx(0.9)},${a.sy(1.05)} C ${a.sx(0.3)},${a.sy(1.32)} ${a.sx(-0.3)},${a.sy(1.32)} ${a.sx(-0.9)},${a.sy(1.05)}"
              fill="none" stroke="${C.err}" stroke-width="1.4" stroke-dasharray="4 3"/>`);
      return a.svg(); },
      caption:'$y[n]=x[-n]$: the output at $n=-1$ reads the input at $n=1$.'},
    {t:'legend', items:[['in','$x[1]$'],['err','$y[-1]$']], at:'tl'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$y[n]=x[-n]$.<div class="nsep"></div>Is the system causal?',
      ask:{key:'m2-causal-b', choices:['Causal','Not causal'], answer:1}},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'y[-1]=x[-(-1)]=x[1]', label:'Reversal',
        note:'The output at $n=-1$ reads a future input, so the system is not causal.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Causal', html:'$y[n]=x[n-1]$ and $\\displaystyle y(t)=\\int_{-\\infty}^{t}x(\\tau)\\,\\d\\tau$ use only the past. $y(t)=x(t)\\cos(t+1)$ uses only $x(t)$; the cosine is a known function of $t$, not a future input.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'Not causal', html:'$y[n]=x[n]+x[n+1]$ uses a future sample.'}]}
  ]}
]},

{ id:'m2-stable', module:'M2', nav:'BIBO stability', title:'BIBO stability', src:'pp. 12–13',
  objective:'Define boundedness and BIBO stability, and prove it for one system.',
  keywords:'BIBO bounded input bounded output stability triangle inequality', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 2 · Property 4', src:'pp. 12–13'},
  {t:'title', text:'BIBO Stability'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['input $x(t)$','output $y(t)$'], ms:900},
      svg:v=>{
      /* The system on top; below it the triangle x(t)=1-|t-1| on 0<=t<=2.
         Frame 0 draws x(t). Frame 1 fades x(t) to a dashed trace and brings in y(t):
         x(3t) is a narrow triangle on 0<=t<=2/3, and 2x^2(t-1) a curved bump of
         height 2 on 1<=t<=3. The two terms do not overlap. */
      const k=v?v.frame:0, H=P.hOverride||420; P.hOverride=null;
      const cl=u=>Math.max(0,Math.min(1,u)), b=cl(k);
      const top=P.blocks({w:560,h:130,items:[
        {t:'arrow',x1:35,y1:70,x2:170,y2:70,color:b<0.5?C.coral:C.ink},
        {t:'box',x:170,y:35,w:220,h:70,label:'2x^{2}(t-1)+x(3t)',tex:true,fs:16},
        {t:'arrow',x1:390,y1:70,x2:525,y2:70,color:b<0.5?C.ink:C.coral},
        {t:'text',x:102,y:54,label:'x(t)',tex:true,fs:18},
        {t:'text',x:458,y:54,label:'y(t)',tex:true,fs:18}]});
      const a=P.Axes({w:560,h:H,xr:[-1,4.5],yr:[-0.3,2.6],xlabel:'t',ylabel:'\\text{amplitude}',
        pad:{l:50,r:24,t:150,b:34},xstep:1,ystep:1});
      const x=t=>(t>=0&&t<=2)?1-Math.abs(t-1):0;
      const y=t=>2*x(t-1)*x(t-1)+x(3*t);
      a.raw(`<g opacity="${b.toFixed(3)}">`);
      a.area(y,0,3,{color:'rgba(74,122,70,.14)'});
      a.curve(y,{color:C.out,n:1400});
      a.note(2,2.3,'y(t)',{anchor:'middle',color:C.out,fs:16,tex:true});
      a.raw('</g>');
      a.raw(`<g opacity="${(1-.45*b).toFixed(3)}">`);
      a.curve(x,{color:C.in,dash:b>0.5?'8 5':null,n:1400});
      a.note(1.35,1.15,'x(t)',{anchor:'start',color:C.in,fs:16,tex:true});
      a.raw('</g>');
      return a.svg().replace(/<\/svg>\s*$/, inner(top)+'</svg>'); },
      caption:'Step through: first the input $x(t)$, a triangle of height $1$, then the output. The term $x(3t)$ gives a narrow triangle on $0\\le t\\le\\tfrac{2}{3}$; the term $2x^{2}(t-1)$ gives a bump of height $2$ on $1\\le t\\le3$. A proof of stability has to hold for every input that stays within $B$.'},
  ], right:[
    {t:'note', kind:'def', head:'BIBO stability', html:'A signal is bounded if some finite $B$ satisfies $|x(t)|<B$ for every $t$. A system is BIBO stable if every bounded input gives a bounded output.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Given', html:'$y(t)=2x^{2}(t-1)+x(3t)$ and $|x(t)|<B$.<div class="nsep"></div>Is the system BIBO stable?',
        ask:{key:'m2-stable', choices:['Stable','Not stable'], answer:0}}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'\\begin{aligned}|y(t)|&=|2x^{2}(t-1)+x(3t)|\\\\&\\le2|x(t-1)|^{2}+|x(3t)|\\\\&\\le2B^{2}+B<\\infty\\end{aligned}', label:'Bound the output', note:'The triangle inequality gives the second line. A shift or a scale of $x$ keeps $|x|<B$, which gives the third.'}]}
  ]}
]},

{ id:'m2-stable-b', module:'M2', nav:'Unstable accumulator', title:'A Bounded Input, an Unbounded Output', src:'pp. 12–13',
  objective:'Disprove stability with one bounded input.',
  keywords:'accumulator BIBO counterexample n+1', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 2 · Property 4', src:'pp. 12–13'},
  {t:'title', text:'A Bounded Input, an Unbounded Output'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'n', label:'$n$', min:-3, max:12, step:1, v:-3,
        show:v=>v<-2?'input only':'$y['+v+']='+Math.max(0,v+1)+'$'}]},
      svg:v=>{
      /* The slider runs the accumulator one sample at a time. At its left end
         only the input u[n] is drawn. At n the outputs up to n are drawn; the
         sample at n is the old level y[n-1] (dashed) with the piece u[n]=1
         stacked on it in the input colour. */
      const m=v?v.n:12;
      const a=P.Axes({w:560,h:380,xr:[-2,12],yr:[-1,18],xlabel:'n',ylabel:'\\text{amplitude}',pad:{l:52,r:24,t:20,b:34},xtarget:8,ytarget:4});
      const X=n=>a.sx(n).toFixed(2), Y=u=>a.sy(u).toFixed(2), y=n=>n>=0?n+1:0;
      a.raw(`<g opacity="${m<-2?1:0.35}">`); a.stem(disc(n=>n>=0?1:0,-2,12),{color:C.in}); a.raw('</g>');
      if(m>=-2){
        a.stem(disc(n=>n<m?y(n):y(n-1),-2,m),{color:C.err});
        if(m>=0){
          a.raw(`<line x1="${X(m-1)}" y1="${Y(y(m-1))}" x2="${X(m)}" y2="${Y(y(m-1))}" stroke="${C.err}" stroke-width="1.6" stroke-dasharray="5 4" opacity=".75"/>`);
          a.raw(`<line x1="${X(m)}" y1="${Y(y(m-1))}" x2="${X(m)}" y2="${Y(y(m))}" stroke="${C.in}" stroke-width="3"/>`);
          a.raw(`<circle cx="${X(m)}" cy="${Y(y(m))}" r="4.6" fill="${C.in}"/>`);
          const lab='y['+m+']=\\displaystyle\\sum_{k=-\\infty}^{'+m+'}u[k]='+y(m);
          if(m<6) a.note(m+0.4,y(m)+1.8,lab,{anchor:'start',color:C.err,fs:15,tex:true});
          else a.note(m-0.5,y(m)+1.5,lab,{anchor:'end',color:C.err,fs:15,tex:true});
        }
      }
      return a.svg(); },
      caption:'Drag $n$ to run the accumulator. Each step adds $u[n]=1$ to the previous output, so $y[n]=n+1$ grows without a bound while the input never exceeds 1.'},
    {t:'legend', items:[['in','$u[n]$'],['err','$y[n]$']]}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$y[n]=\\displaystyle\\sum_{k=-\\infty}^{n}x[k]$.<div class="nsep"></div>Is the accumulator BIBO stable?',
      ask:{key:'m2-stable-b', choices:['Stable','Not stable'], answer:1}},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\begin{aligned}y[n]&=\\sum_{k=-\\infty}^{n}u[k]\\\\&=\\sum_{k=0}^{n}1\\\\&=n+1\\;\\longrightarrow\\;\\infty,\\qquad n\\ge0\\end{aligned}', label:'Bounded input, unbounded output',
        note:'The input satisfies $|u[n]|\\le1$, but the output has no finite bound.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Two separate tests', html:'Causality and stability are separate tests.<div class="cmp"><div><span class="cmp-h">Accumulator</span><span class="chips"><span class="chip yes">Causal</span><span class="chip no">Stable</span></span></div><div><span class="cmp-h">Time reversal</span><span class="chips"><span class="chip yes">Stable</span><span class="chip no">Causal</span></span></div></div>'}]}
  ]}
]},

{ id:'m2-ti', module:'M2', nav:'Time invariance', title:'Time invariance', src:'p. 13',
  objective:'State the test as a comparison of two computed signals and work one example.',
  keywords:'time invariance shift test two paths sin worked example', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 2 · Property 5', src:'p. 13'},
  {t:'title', text:'Time Invariance'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>P.blocks({w:560,h:380,items:[
      {t:'text',x:35,y:50,label:'PATH 1 — shift, then process',fs:14,anchor:'start',color:C.slate},
      {t:'arrow',x1:35,y1:125,x2:145,y2:125},{t:'box',x:145,y:90,w:120,h:70,label:'\\text{shift}\\;t_0',tex:true},
      {t:'arrow',x1:265,y1:125,x2:330,y2:125},{t:'box',x:330,y:90,w:100,h:70,label:'S',tex:true},
      {t:'arrow',x1:430,y1:125,x2:540,y2:125},
      {t:'text',x:90,y:109,label:'x(t)',tex:true,fs:17},{t:'text',x:485,y:109,label:'y_2(t)',tex:true,fs:17},
      {t:'text',x:35,y:235,label:'PATH 2 — process, then shift',fs:14,anchor:'start',color:C.slate},
      {t:'arrow',x1:35,y1:310,x2:145,y2:310},{t:'box',x:145,y:275,w:100,h:70,label:'S',tex:true},
      {t:'arrow',x1:245,y1:310,x2:310,y2:310},{t:'box',x:310,y:275,w:120,h:70,label:'\\text{shift}\\;t_0',tex:true},
      {t:'arrow',x1:430,y1:310,x2:540,y2:310},
      {t:'text',x:90,y:294,label:'x(t)',tex:true,fs:17},{t:'text',x:485,y:294,label:'y_1(t-t_0)',tex:true,fs:17}
    ]}), caption:'Path 1 shifts the input, then applies $S$. Path 2 applies $S$, then shifts the output. A time-invariant system makes them agree.'}
  ], right:[
    {t:'note', kind:'def', head:'Criterion', html:'If $x(t)$ produces $y(t)$, then $x(t-t_0)$ must produce $y(t-t_0)$, for every shift $t_0$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Given', html:'$y(t)=\\sin\\bigl(x(t)\\bigr)$.<div class="nsep"></div>Is the system time invariant?',
        ask:{key:'m2-ti', choices:['Time invariant','Not time invariant'], answer:0}}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'\\begin{aligned}x_2(t)&=x_1(t-t_0)\\\\y_2(t)&=\\sin(x_2(t))=\\sin(x_1(t-t_0))\\\\y_1(t-t_0)&=\\sin(x_1(t-t_0))\\\\y_2(t)&=y_1(t-t_0)\\end{aligned}', label:'Compare the two paths',
        note:'They agree for every input and every shift, so the system is time invariant.'}]}
  ]}
]},

{ id:'m2-ti-b', module:'M2', nav:'Time invariance · the counterexample', title:'Where time invariance fails', src:'p. 13',
  objective:'Work the n·x[n] counterexample and name the pattern behind every failure.',
  keywords:'time invariance counterexample n x[n] explicit time variable independent of linearity', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 2 · Property 5', src:'p. 13'},
  {t:'title', text:'Counterexamples to Time Invariance'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    /* Three panels on one n axis: the common input, then the result of each
       path in the order of the cards on the right. The dashed line at n = 1
       is where the two results differ. */
    {t:'fig', frame:true, grow:true, svg:()=>{
      const H = P.hOverride || 420, h = Math.round(H/3); P.hOverride = null;
      const panel = (ylabel, f, col, tag)=>{
        const a=P.Axes({w:560,h,xr:[-3,4],yr:[-0.3,1.4],grid:false,xlabel:'n',ylabel,xnameDrop:30,
          pad:{l:46,r:30,t:12,b:24},xticksOverride:[-3,-2,-1,0,1,2,3],yticksOverride:[0,1]});
        a.vline(1,{color:C.muted});
        a.stem(disc(f,-3,3),{color:col,r:4});
        if(tag) a.note(3.9,1.05,tag,{tex:true,color:col,fs:15,anchor:'end'});
        return a.svg(); };
      /* each panel is a nested svg; the inline size outweighs the
         figure.fig svg rule, which would stretch it to the whole figure */
      const place = (svg,y)=>svg.replace('<svg ',`<svg x="0" y="${y}" width="560" height="${h}" style="width:560px;height:${h}px" `);
      return `<svg viewBox="0 0 560 ${3*h}" xmlns="http://www.w3.org/2000/svg" role="img">`
        + place(panel('x_1[n]=\\delta[n]', n=>n===0?1:0, C.in, '\\text{input}'),0)
        + place(panel('y_1[n-1]=0', ()=>0, C.out, '\\text{path 2}'),h)
        + place(panel('y_2[n]=\\delta[n-1]', n=>n===1?1:0, C.err, '\\text{path 1}'),2*h)
        + '</svg>'; },
      caption:'The impulse $\\delta[n]$ sits at $n=0$, where the factor $n$ is 0, so path 2 returns zero everywhere. Path 1 moves the impulse to $n=1$, where the factor is 1, so it survives. The results differ at $n=1$.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$y[n]=n\\,x[n]$.<div class="nsep"></div>Is the system time invariant?',
      ask:{key:'m2-ti-b', choices:['Time invariant','Not time invariant'], answer:1}},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\begin{aligned}x_1[n]&=\\delta[n]\\\\y_1[n]&=n\\delta[n]=0\\\\y_1[n-1]&=0\\end{aligned}', label:'Path 2 · shift the output'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'\\begin{aligned}x_2[n]&=\\delta[n-1]\\\\y_2[n]&=n\\delta[n-1]\\\\&=1\\cdot\\delta[n-1]=\\delta[n-1]\\neq0\\end{aligned}', label:'Path 1 · shift the input',
        note:'The paths disagree, so the system is not time invariant. The explicit $n$ in the rule does not move with the input.'}]}
  ]}
]},

{ id:'m2-ti-c', module:'M2', nav:'Time invariance · time scaling', title:'Time Scaling Breaks Time Invariance', src:'p. 13',
  objective:'Show that a scaled argument breaks time invariance without an explicit time variable.',
  keywords:'time invariance time scaling compression x(2t) reversal counterexample two paths',
  slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 2 · Property 5', src:'p. 13'},
  {t:'title', text:'Time Scaling Breaks Time Invariance'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'t0', label:'$t_0$', min:0, max:3, step:0.25, v:2, show:v=>'$'+num(v)+'$ s'}]},
      svg:v=>{
      const t0=v?v.t0:2;
      const a=P.Axes({w:560,h:380,xr:[-2.5,4.5],yr:[-0.3,1.6],xlabel:'t\\;(\\text{s})',ylabel:'\\text{amplitude}',
        pad:{l:50,r:24,t:20,b:34},xstep:1,ytarget:2});
      const lo1=t0/2-1, hi1=t0/2+1, lo2=t0-1, hi2=t0+1;
      const p1=t=>(t>lo1&&t<hi1)?1:0, p2=t=>(t>lo2&&t<hi2)?1:0;
      a.area(p1,lo1,hi1,{color:'rgba(166,59,42,.12)'});
      a.area(p2,lo2,hi2,{color:'rgba(74,122,70,.14)'});
      a.curve(p1,{color:C.err,n:1400});
      a.curve(p2,{color:C.out,dash:'8 5',n:1400});
      return a.svg(); },
      caption:'With $x_1(t)=1$ for $|t|<2$, path 1 moves the output pulse by $t_0/2$ and path 2 by $t_0$. At $t_0=2$ they cover $0<t<2$ and $1<t<3$.'},
    {t:'legend', items:[['err','$y_2(t)$'],['out','$y_1(t-t_0)$',true]], at:'tl'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$y(t)=x(2t)$.<div class="nsep"></div>Is the system time invariant?',
      ask:{key:'m2-ti-c', choices:['Time invariant','Not time invariant'], answer:1}},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\begin{aligned}x_2(t)&=x_1(t-t_0)\\\\y_2(t)&=x_2(2t)=x_1(2t-t_0)\\end{aligned}', label:'Path 1 · shift the input'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'\\begin{aligned}y_1(t)&=x_1(2t)\\\\y_1(t-t_0)&=x_1\\bigl(2(t-t_0)\\bigr)=x_1(2t-2t_0)\\end{aligned}', label:'Path 2 · shift the output',
        note:'The shifts differ, $t_0$ against $2t_0$. The system is not time invariant.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'A second pattern', html:'The rule has no explicit $t$. The failure comes from the argument: a scale such as $x(2t)$ or a reversal such as $x[-n]$ changes the size or the direction of every shift.'}]}
  ]}
]},

{ id:'m2-linear', module:'M2', nav:'Linearity', title:'Linearity', src:'p. 14',
  objective:'State superposition and work one example in full.',
  keywords:'linearity superposition additive homogeneous scalable cross term', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 2 · Property 6', src:'p. 14'},
  {t:'title', text:'Linearity'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>P.blocks({w:560,h:380,items:[
      {t:'text',x:35,y:50,label:'PATH 1 — combine, then process',fs:14,anchor:'start',color:C.slate},
      {t:'arrow',x1:35,y1:125,x2:190,y2:125},{t:'box',x:190,y:90,w:150,h:70,label:'S',tex:true},
      {t:'arrow',x1:340,y1:125,x2:500,y2:125},
      {t:'text',x:112,y:109,label:'a\\,x_1+b\\,x_2',tex:true,fs:15},
      {t:'text',x:420,y:109,label:'y_3',tex:true,fs:15},
      {t:'text',x:35,y:235,label:'PATH 2 — process, then combine',fs:14,anchor:'start',color:C.slate},
      {t:'arrow',x1:35,y1:310,x2:190,y2:310},{t:'box',x:190,y:275,w:150,h:70,label:'S',tex:true},
      {t:'arrow',x1:340,y1:310,x2:500,y2:310},
      {t:'text',x:112,y:294,label:'x_1,\\;x_2',tex:true,fs:15},
      {t:'text',x:420,y:294,label:'a\\,y_1+b\\,y_2',tex:true,fs:15},
      {t:'text',x:490,y:222,label:'equal?',fs:16,anchor:'end',color:C.coral},
      {t:'line',d:'M505 125 h20 v185 h-20',color:C.coral}
    ]}), caption:'A linear system gives the same result when the signals are combined before the system or after it.'}
  ], right:[
    {t:'eq', key:true, result:true, tex:'a\\,x_1+b\\,x_2\\;\\longrightarrow\\;a\\,y_1+b\\,y_2', label:'Key result · Superposition', note:'$a$ and $b$ are complex. $x_1$ produces $y_1$ and $x_2$ produces $y_2$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Given', html:'$y(t)=2\\pi\\,x(t)$.<div class="nsep"></div>Is the system linear?',
        ask:{key:'m2-linear', choices:['Linear','Not linear'], answer:0}}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'\\begin{aligned}S\\{ax_1+bx_2\\}&=2\\pi(ax_1+bx_2)\\\\&=a(2\\pi x_1)+b(2\\pi x_2)\\\\&=a\\,y_1+b\\,y_2\\end{aligned}', label:'Apply superposition',
        note:'The two paths agree, so the system is linear.'}]}
  ]}
]},

{ id:'m2-linear-b', module:'M2', nav:'A square', title:'A Rule That Is Not Linear', src:'p. 14',
  objective:'Show that a square of the input fails superposition.',
  keywords:'square cross term homogeneity not linear', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 2 · Property 6', src:'p. 14'},
  {t:'title', text:'A Rule That Is Not Linear'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>P.blocks({w:560,h:380,items:[
      {t:'text',x:35,y:50,label:'PATH 1 — combine, then process',fs:14,anchor:'start',color:C.slate},
      {t:'arrow',x1:35,y1:125,x2:190,y2:125},{t:'box',x:190,y:90,w:150,h:70,label:'S',tex:true},
      {t:'arrow',x1:340,y1:125,x2:500,y2:125},
      {t:'text',x:112,y:109,label:'a\\,x_1+b\\,x_2',tex:true,fs:15},
      {t:'text',x:420,y:109,label:'y_3',tex:true,fs:15},
      {t:'text',x:35,y:235,label:'PATH 2 — process, then combine',fs:14,anchor:'start',color:C.slate},
      {t:'arrow',x1:35,y1:310,x2:190,y2:310},{t:'box',x:190,y:275,w:150,h:70,label:'S',tex:true},
      {t:'arrow',x1:340,y1:310,x2:500,y2:310},
      {t:'text',x:112,y:294,label:'x_1,\\;x_2',tex:true,fs:15},
      {t:'text',x:420,y:294,label:'a\\,y_1+b\\,y_2',tex:true,fs:15},
      {t:'text',x:490,y:222,label:'equal?',fs:16,anchor:'end',color:C.coral},
      {t:'line',d:'M505 125 h20 v185 h-20',color:C.coral}
    ]}), caption:'The two paths ask whether $y_3$ equals $a y_1+b y_2$. For this rule they do not.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$y[n]=\\bigl(x[2n]\\bigr)^{2}$.<div class="nsep"></div>Is the system linear?',
      ask:{key:'m2-linear-b', choices:['Linear','Not linear'], answer:1}},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\begin{aligned}x_3[n]&=ax_1[n]+bx_2[n]\\\\y_3[n]&=\\bigl(x_3[2n]\\bigr)^2\\\\&=\\bigl(ax_1[2n]+bx_2[2n]\\bigr)^2\\\\&=a^2x_1^2[2n]+2ab\\,x_1[2n]x_2[2n]+b^2x_2^2[2n]\\end{aligned}', label:'Combine, then apply the system'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'a\\,y_1[n]+b\\,y_2[n]=a\\,x_1^2[2n]+b\\,x_2^2[2n]\\neq y_3[n]', label:'Apply, then combine',
        note:'There is no cross term, and the powers of $a$ and $b$ differ. The system is not linear.'}]}
  ]}
]},

{ id:'m2-workflow', module:'M2', nav:'Classification workflow', title:'A workflow you can defend', src:'pp. 11–14',
  objective:'Give a repeatable order of attack for classifying an unfamiliar system.',
  keywords:'workflow classification order strategy checklist', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 2 · Method', src:'pp. 11–14'},
  {t:'title', text:'System Classification Workflow'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const rows=[
        ['y(t)=2\\pi x(t)',           [1,1,1,1,1,1]],
        ['y[n]=x[n-1]',               [0,1,1,1,1,1]],
        ['y(t)=x^{2}(t)',             [1,0,1,1,1,0]],
        ['y[n]=n\\,x[n]',             [1,0,1,0,0,1]],
        ['y[n]=\\sum_{k\\le n}x[k]',  [0,1,1,0,1,1]],
        ['y[n]=x[-n]',                [0,1,0,1,0,1]],
        ['y[n]=(x[2n])^{2}',          [0,0,0,1,0,0]]
      ];
      const cols=['mem','inv','caus','stab','TI','lin'];
      const W=560,H=470,x0=190,cw=60,rh=56;
      const g=[`<text x="8" y="30" font-size="13" fill="${C.slate}" font-family="ui-monospace,monospace" letter-spacing="1.4">SYSTEM</text>`];
      cols.forEach((c,i)=>g.push(`<text x="${x0+cw*i+cw/2}" y="30" font-size="12" fill="${C.slate}" text-anchor="middle" font-family="ui-monospace,monospace" letter-spacing="1.2">${c.toUpperCase()}</text>`));
      rows.forEach((r,j)=>{
        const y=74+rh*j;
        g.push(`<line x1="0" y1="${y-14}" x2="${W}" y2="${y-14}" stroke="${C.grid}"/>`);
        g.push(P.texName(r[0],{xLeft:8, baseline:y+9, size:14, color:C.ink, figW:x0-16}));
        r[1].forEach((v,i)=>g.push(`<text x="${x0+cw*i+cw/2}" y="${y+7}" font-size="16" text-anchor="middle"
          fill="${v?'#4A7A46':'#A63B2A'}">${v?'✓':'✗'}</text>`));
      });
      return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="Inter,-apple-system,sans-serif">${g.join('')}</svg>`;
    }, caption:'Each column is one property. The rows show why the tests are separate.'}
  ], right:[
    {t:'note', kind:'def', head:'Method', html:'<ol class="steps"><li>Look for an explicit $t$ or $n$, or a scaled or reversed argument: test time invariance.</li><li>Test linearity with one scalar and one sum.</li><li>Read every input argument for memory and causality.</li><li>Test stability, then invertibility.</li></ol>'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'One implication', html:'Memoryless implies causal. A causal system need not be stable, and a linear system need not be time invariant.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'$y(t)=x(t)+1$.<div class="nsep"></div>Which property fails?',
        ask:{key:'m2-workflow', choices:['Linearity','Time invariance','Causality'], answer:0,
          why:'The zero input gives $y=1$, but a linear system maps the zero input to the zero output.'}}]}
  ]}
]},

REAL_SYSTEMS,

{ id:'m2-lab-d', module:'M2', nav:'Laboratory {lab} · Property checker', title:'Laboratory {lab} — System Property Checker', src:'pp. 11–14, 21',
  objective:'Predict the six properties of thirteen systems, then read each proof or counterexample.',
  slide:true, keywords:'laboratory system property checker criterion counterexample', steps:0, blocks:[
  {t:'eyebrow', text:'Interactive laboratory', src:'pp. 11–14, 21'},
  {t:'title', text:'Laboratory {lab} · System Properties'},
  {t:'lede', text:'Answer yes or no for each property first. The proof or the counterexample opens after your answer.'},
  {t:'lab', id:'D'}
]},

{ id:'m2-code-props', module:'M2', nav:'Code · System properties', title:'System Properties in Code', src:'pp. 11–14',
  objective:'Test memory, stability, time invariance and linearity in MATLAB and in Python, and predict each result before running it.',
  keywords:'code matlab python program accumulator memory stability time invariance superposition run',
  slide:true, steps:0, budget:'a code page: the program draws its own figure', blocks:[
  {t:'eyebrow', text:'Module 2 · System properties in code', src:'pp. 11–14'},
  {t:'title', text:'System Properties in Code'},
  {t:'raw', html:()=>CODEBANK.page('m2-code-props')}
]},

{ id:'m2-quick', module:'M2', nav:'Quick check', title:'Quick check', src:'pp. 11–14',
  objective:'Check the six properties with twelve short predictions.',
  keywords:'quick check predict memory invertible causal stable time invariant linear LTI',
  budget:'A set of twelve prediction cards; the questions carry no figure.',
  slide:true, steps:0, blocks:[
  {t:'eyebrow', text:'Module 2 · Quick check', src:'pp. 11–14'},
  {t:'title', text:'Quick Check'},
  {t:'grid', cols:4, gap:'22px 20px', style:'flex:1;grid-auto-rows:1fr;padding-bottom:8px', items:[
    [{t:'note', kind:'def', head:'Memory', html:'$y[n]=x[n]+x[n-2]$ is',
      ask:{key:'m2-qc0', choices:['memoryless','a system with memory'], answer:1,
        why:'The output at $n$ uses $x[n-2]$, an earlier sample.'}}],
    [{t:'note', kind:'def', head:'Memory', html:'A memoryless system is always',
      ask:{key:'m2-qc1', choices:['causal','stable','linear'], answer:0,
        why:'It uses only the present input, so it never uses a future one.'}}],
    [{t:'note', kind:'def', head:'Invertibility', html:'$y(t)=3x(t)-1$ is',
      ask:{key:'m2-qc2', choices:['invertible','not invertible'], answer:0,
        why:'The input is recovered as $x(t)=\\bigl(y(t)+1\\bigr)/3$.'}}],
    [{t:'note', kind:'def', head:'Invertibility', html:'$y[n]=x[2n]$ is',
      ask:{key:'m2-qc3', choices:['invertible','not invertible'], answer:1,
        why:'The odd-indexed samples never reach the output, so two inputs that differ only there give the same output.'}}],
    [{t:'note', kind:'def', head:'Causality', html:'$y[n]=\\sum_{k=n}^{\\infty}x[k]$ is',
      ask:{key:'m2-qc4', choices:['causal','not causal'], answer:1,
        why:'The sum uses $x[k]$ for $k>n$, which are future samples.'}}],
    [{t:'note', kind:'def', head:'Causality', html:'$y(t)=\\int_{t-1}^{t+1}x(\\tau)\\,\\d\\tau$ is',
      ask:{key:'m2-qc5', choices:['causal','not causal'], answer:1,
        why:'The integral reaches $\\tau=t+1$, one second into the future.'}}],
    [{t:'note', kind:'def', head:'Stability', html:'$y(t)=e^{x(t)}$ is',
      ask:{key:'m2-qc6', choices:['BIBO stable','not BIBO stable'], answer:0,
        why:'If $|x(t)|<B$, then $0<y(t)<e^{B}$.'}}],
    [{t:'note', kind:'def', head:'Stability', html:'$y[n]=x[n]+x[n-1]+x[n-2]$ is',
      ask:{key:'m2-qc7', choices:['BIBO stable','not BIBO stable'], answer:0,
        why:'If $|x[n]|<B$, then $|y[n]|<3B$ by the triangle inequality.'}}],
    [{t:'note', kind:'def', head:'Time invariance', html:'$y(t)=x(t)+t$ is',
      ask:{key:'m2-qc8', choices:['time invariant','not time invariant'], answer:1,
        why:'The input $x(t-t_0)$ gives $x(t-t_0)+t$, but $y(t-t_0)=x(t-t_0)+t-t_0$.'}}],
    [{t:'note', kind:'def', head:'Time invariance', html:'$y[n]=x[n]\\,x[n-1]$ is',
      ask:{key:'m2-qc9', choices:['time invariant','not time invariant'], answer:0,
        why:'The rule has no explicit $n$, so both factors shift with the input.'}}],
    [{t:'note', kind:'def', head:'Linearity', html:'$y(t)=t\\,x(t)$ is',
      ask:{key:'m2-qc10', choices:['linear','not linear'], answer:0,
        why:'$t\\,(ax_1+bx_2)=a\\,t\\,x_1+b\\,t\\,x_2$. It is linear but not time invariant.'}}],
    [{t:'note', kind:'def', head:'LTI', html:'Which system is linear and time invariant?',
      ask:{key:'m2-qc11', choices:['$y(t)=x(t-2)$','$y(t)=x(2t)$','$y(t)=x^{2}(t)$'], answer:0,
        why:'A delay passes sums and shifts. $x(2t)$ is not time invariant and $x^{2}(t)$ is not linear.'}}]
  ]}
]},

{ id:'m2-synth', module:'M2', nav:'Module 2 synthesis', title:'Module 2 — what to carry forward', src:'pp. 11–14',
  dark:true, objective:'Consolidate the six properties and motivate the LTI restriction.',
  keywords:'synthesis summary module 2 LTI motivation', steps:1, blocks:[
  {t:'eyebrow', text:'Module 2 · Synthesis', src:'pp. 11–14'},
  {t:'title', text:'Module 2 Summary'},
  /* Eight results as prompts, in the order of the module: the student names
     the test, then opens the card. The sketch on each card is the picture to
     remember. */
  {t:'raw', html:()=>RECALL.deck('m2', [
    {tag:'Limit', q:'Memoryless', glyph:G.mem,
     a:'<b>Memoryless.</b> The output at $t$ uses only the input at the same $t$.'},
    {tag:'Limit', q:'Invertible', glyph:G.inv,
     a:'<b>Invertible.</b> Different inputs give different outputs, so the input can be recovered from the output.'},
    {tag:'Limit', q:'Causal', glyph:G.caus,
     a:'<b>Causal.</b> The output at $t$ uses only $x(\\tau)$ for $\\tau\\le t$.'},
    {tag:'Limit', q:'BIBO stable', glyph:G.stab,
     a:'<b>BIBO stable.</b> Every bounded input gives a bounded output.'},
    {tag:'LTI', q:'Time invariant', glyph:G.ti,
     a:'<b>Time invariant.</b> $x(t-t_0)\\;\\to\\;y(t-t_0)$ for every shift $t_0$.'},
    {tag:'LTI', q:'Linear', glyph:G.lin,
     a:'<b>Linear.</b> $ax_1+bx_2\\;\\to\\;ay_1+by_2$ for all $a$ and $b$.'},
    {tag:'Method', q:'How do you prove or disprove a property?', glyph:G.proof,
     a:'A proof must hold for <b>every</b> input. <b>One</b> explicit counterexample disproves the property.'},
    {tag:'Method', q:'Does memoryless imply causal?', glyph:G.imply,
     a:'<b>Yes.</b> The converse fails: $y[n]=x[n-1]$ is causal and has memory.'}
  ], {cols:2})},
  {t:'reveal', at:1, items:[
    {t:'note', kind:'ok', head:'The claim Module 3 proves', html:'<span style="color:var(--graphite)">If a system is linear and time invariant, its response to <b>one</b> input, the unit impulse, determines its response to <b>every</b> input.</span>'}]}
]},

/* Four optional projects for students who want to try the module on their own
   computer. They carry no grade and no code: each card gives an aim, what it
   practises, a few steps and what to look for. The briefs state no numerical
   answer, so they need no line in verify/. */
{ id:'m2-projects', module:'M2', nav:'Projects to try', title:'Projects to Try', src:'pp. 11–14',
  dark:true, objective:'Offer four optional projects that test system properties on recorded and computed signals.',
  keywords:'projects matlab python linearity time invariance saturation fading channel property checker',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 2 · Projects', src:'pp. 11–14'},
  {t:'title', text:'Projects to Try'},
  {t:'raw', html:()=>PROJECTS.deck('m2', [
    {title:'Test superposition on a recording', glyph:G.listen,
     aim:'Use two recordings to test whether a sound effect is linear.',
     learn:['The superposition test with real signals.',
            'The difference between a linear effect and a clipping effect.',
            'How to measure a small error between two signals.'],
     steps:['Record two short sounds $x_1[n]$ and $x_2[n]$ of the same length.',
            'Apply an echo $y[n]=x[n]+0.5\\,x[n-4000]$ to $x_1$, to $x_2$ and to $x_1+x_2$. Compare $y_3$ with $y_1+y_2$.',
            'Repeat with a clipper that limits every sample to $\\pm0.3$.',
            'Play $y_3$ and $y_1+y_2$ for the clipper and listen to the difference.'],
     look:'The echo passes the test up to rounding error. The clipper fails it, and the error is largest where the two sounds overlap and are loud.'},
    {title:'Write a property checker', glyph:G.proof,
     aim:'Write a program that looks for counterexamples to linearity and time invariance.',
     learn:['The two-path tests written as code.',
            'Why a test on examples can disprove a property but cannot prove it.',
            'Random inputs as a search for counterexamples.'],
     steps:['Write a function that applies a system rule to a sequence, for example $y[n]=n\\,x[n]$ or $y[n]=x^{2}[n]$.',
            'Draw random inputs $x_1$, $x_2$ and random scalars $a$, $b$. Compare $S\\{ax_1+bx_2\\}$ with $aS\\{x_1\\}+bS\\{x_2\\}$.',
            'Shift a random input by $n_0$ and compare the two paths of the time-invariance test.',
            'Run both tests on the systems of the classification table.'],
     look:'A failed test is a proof that the property fails. A passed test on 1000 inputs is only evidence. Look for a system that passes every random test and still is not linear.'},
    {title:'How linear is a saturating amplifier?', glyph:G.sat,
     aim:'Measure how far $y=\\tanh(x)$ is from a linear system as the input grows.',
     learn:['A nonlinear system that is close to linear for small inputs.',
            'A linear approximation about an operating point.',
            'How to state the range where an approximation holds.'],
     steps:['Take $x(t)=A\\sin(2\\pi t)$ for several amplitudes $A$ between 0.01 and 3.',
            'For each $A$ compute $y=\\tanh(x)$ and compare it with the linear guess $y\\approx x$.',
            'Plot the largest error against $A$ on logarithmic axes.',
            'Choose the largest $A$ for which the error is below one per cent of $A$.'],
     look:'For small $A$ the amplifier is linear to a good approximation. The error grows quickly once the peaks reach the flat part of $\\tanh$.'},
    {title:'A channel that changes with time', glyph:G.fade,
     aim:'See why a fading radio channel is linear but not time invariant.',
     learn:['A system $y(t)=g(t)\\,x(t)$ with a slowly changing gain.',
            'The time-invariance test applied to a real model.',
            'Time invariance over a short block of time.'],
     steps:['Let $g(t)=1+0.5\\cos(2\\pi\\,0.2\\,t)$ and $y(t)=g(t)\\,x(t)$.',
            'Check linearity with two inputs and two scalars.',
            'Apply the two-path test for time invariance with a short pulse and shifts $t_0=0.1$ s and $t_0=2$ s.',
            'Find the largest shift for which the two paths differ by less than five per cent.'],
     look:'The channel passes the linearity test for every pair. It fails the time-invariance test, but only slightly for short shifts. Over a short block it can be treated as time invariant.'}
  ])}
]}
];
window.SCENES_M2 = SC;
})();
