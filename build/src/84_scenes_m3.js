/* ==========================================================================
   Module 3 — Linear Time-Invariant Systems  [Source: 14–21]
   ========================================================================== */
(function(){
const P = PLOT, C = P.COL;
const disc=(f,a,b)=>{const o=[];for(let n=Math.ceil(a);n<=b;n++)o.push([n,f(n)]);return o;};
const convDT=(x,h,n,lo,hi)=>{let s=0;for(let k=lo;k<=hi;k++)s+=x(k)*h(n-k);return s;};
const num=v=>String(Math.round(v*100)/100);
const cl=u=>Math.max(0,Math.min(1,u));
/* a group drawn at an opacity: the faint given signal on a sketch slide, or a
   state fading in or out while a figure plays between frames */
const fade=(a,o,f)=>{ if(o<=0) return; a.raw(`<g opacity="${o.toFixed(3)}">`); f(); a.raw('</g>'); };
/* the invisible data area a sketch is drawn in */
const skArea=a=>a.raw(`<rect class="sk-area" x="${a.x0}" y="${a.y1}" width="${a.x1-a.x0}" height="${a.y0-a.y1}" fill="none"/>`);

/* module-opening figure: y = x * h, computed rather than drawn by hand */
const x3f=n=>[1,2,1][n]||0, h3f=n=>n>=0&&n<=3?Math.pow(0.5,n):0;
const x3=[x3f,'x[n]','#7FC3CE',[-0.3,2.4],.2],
      h3=[h3f,'h[n]','#E3B45E',[-0.3,1.25],.7],
      y3=[n=>convDT(x3f,h3f,n,0,2),'y[n]=(x*h)[n]','#8FBF8A',[-0.3,3.1],1.3];

/* ---- everyday systems, one gallery slide at the end of each teaching
       section. The traces are schematic; each keeps the feature its section
       is about. A figure with two traces carries its legend as a third entry. */
const EXO = o => Object.assign({w:520,h:250,pad:{l:60,r:26,t:24,b:40},ytarget:3}, o);
function realGallery(cfg){
  return { id:cfg.id, module:'M3', nav:cfg.nav, title:cfg.title, src:cfg.src,
    objective:cfg.objective, keywords:cfg.keywords,
    budget:cfg.budget||'A gallery of four everyday systems; each figure is one example.',
    slide:true, steps:cfg.notes.length-1, blocks:[
    {t:'eyebrow', text:cfg.eyebrow, src:cfg.src},
    {t:'title', text:cfg.title},
    {t:'cols', ratio:'c-8-4', fill:true, left:[
      {t:'grid', cols:2, gap:'18px 22px', items:cfg.figs.map(([svg,cap,lg])=>
        [{t:'fig', frame:true, svg, caption:cap}].concat(lg?[{t:'legend', items:lg}]:[]))}
    ], right:cfg.notes.map((n,i)=>i ? {t:'reveal', at:i, items:[n]} : n)}
  ]};
}

/* one heartbeat, repeated every 0.8 s on the gallery of section 3.2 */
const ecgBeat = t => { const u=((t%0.8)+0.8)%0.8, g=(c,w,a)=>a*Math.exp(-(((u-c)/w)**2));
  return g(0.16,0.035,0.15)-g(0.285,0.008,0.12)+g(0.30,0.011,1.1)-g(0.318,0.01,0.25)+g(0.52,0.05,0.3); };

const REAL_IMPULSE = realGallery({ id:'m3-real-impulse', nav:'Impulse responses around us',
  title:'Impulse Responses Around Us', eyebrow:'Module 3 · Impulse response', src:'pp. 14–15',
  objective:'Recognise impulse responses in systems students meet every day.',
  keywords:'examples impulse response car suspension pothole RC filter moving average echo',
  figs:[
    [()=>{ const a=P.Axes(EXO({xr:[0,3],yr:[-2,4],xlabel:'t\\;(\\text{s})',ylabel:'y(t)\\;(\\text{cm})',xstep:1}));
      a.curve(t=>5*Math.exp(-2*t)*Math.sin(2*Math.PI*t),{color:C.h,n:900});
      return a.svg(); }, 'A car wheel drops into a pothole: $y(t)=5\\,e^{-2t}\\sin(2\\pi t)$ cm.'],
    [()=>{ const a=P.Axes(EXO({xr:[-1,5],yr:[-0.2,1.3],xlabel:'t\\;(\\text{ms})',ylabel:'h(t)\\;(1/\\text{ms})',xstep:1}));
      a.curve(t=>t>=0?Math.exp(-t):0,{color:C.h,n:900});
      return a.svg(); }, 'An RC low-pass filter, $RC=1$ ms: $h(t)=\\tfrac{1}{RC}\\,e^{-t/RC}\\,u(t)$.'],
    [()=>{ const a=P.Axes(EXO({xr:[-2,8],yr:[-0.05,0.5],xlabel:'n\\;(\\text{day})',ylabel:'h[n]',xstep:2}));
      a.stem(disc(n=>(n>=0&&n<=2)?1/3:0,-2,8),{color:C.h});
      return a.svg(); }, 'A three-day average: $h[n]=\\tfrac13$ for $n=0,1,2$.'],
    [()=>{ const a=P.Axes(EXO({xr:[-2,34],yr:[-0.1,1.3],xlabel:'n\\;(\\text{ms})',ylabel:'h[n]',xstep:10}));
      a.stem(disc(n=>(n>=0&&n%10===0)?Math.pow(0.5,n/10):0,-2,34),{color:C.h,r:3});
      return a.svg(); }, 'An echo every 10 ms at half level: $h[n]=\\sum_{m\\ge0}0.5^{m}\\,\\delta[n-10m]$.']
  ],
  notes:[
    {t:'note', kind:'def', head:'One experiment each', html:'A tap, a click or a short voltage pulse is close to an impulse. The recorded output is then close to $h$.'},
    {t:'note', kind:'warn', head:'Short enough', html:'A pulse acts like an impulse when it is much shorter than the response it produces.'}
  ]});

const REAL_CONVSUM = realGallery({ id:'m3-real-convsum', nav:'Convolution sums around us',
  title:'Convolution Sums Around Us', eyebrow:'Module 3 · The convolution sum', src:'pp. 15–17',
  objective:'Recognise an output built from shifted copies of one response.',
  keywords:'examples moving average temperature echo clicks footsteps bridge ECG heartbeat copies',
  figs:[
    [()=>{ const x=n=>n<5?10:20;
      const a=P.Axes(EXO({xr:[-1,12],yr:[0,24],xlabel:'n\\;(\\text{day})',ylabel:'y[n]\\;(^{\\circ}\\text{C})',xstep:2}));
      a.stem(disc(n=>(x(n)+x(n-1)+x(n-2))/3,-1,12),{color:C.out,r:3});
      return a.svg(); }, 'A jump from 10 °C to 20 °C, averaged over three days: $y[n]=\\tfrac13\\sum_{k=0}^{2}x[n-k]$.'],
    [()=>{ const a=P.Axes(EXO({xr:[-2,26],yr:[-0.1,1.3],xlabel:'n\\;(\\text{ms})',ylabel:'y[n]',xstep:5}));
      a.stem(disc(n=>(n===0||n===15)?1:(n===6||n===21)?0.5:0,-2,26),{color:C.out,r:3});
      return a.svg(); }, 'Two clicks through the echo $h[n]=\\delta[n]+0.5\\,\\delta[n-6]$: $y[n]=h[n]+h[n-15]$.'],
    [()=>{ const h=t=>t>=0?Math.exp(-t)*Math.sin(4*Math.PI*t):0;
      const a=P.Axes(EXO({xr:[0,4],yr:[-1.5,1.8],xlabel:'t\\;(\\text{s})',ylabel:'y(t)\\;(\\text{mm})',xstep:1}));
      a.curve(t=>h(t)+h(t-0.5)+h(t-1)+h(t-1.5),{color:C.out,n:1400});
      return a.svg(); }, 'Four footsteps on a bridge: $y(t)=\\sum_{k=0}^{3}h(t-0.5k)$, with $h(t)=e^{-t}\\sin(4\\pi t)\\,u(t)$.'],
    [()=>{ const a=P.Axes(EXO({xr:[0,3.2],yr:[-0.5,1.4],xlabel:'t\\;(\\text{s})',ylabel:'v(t)\\;(\\text{mV})',xstep:0.8}));
      a.curve(ecgBeat,{color:C.out,n:1600});
      return a.svg(); }, 'An ECG repeats one heartbeat $p(t)$: $v(t)=\\sum_{k}p(t-0.8k)$.']
  ],
  notes:[
    {t:'note', kind:'def', head:'Shifted copies', html:'Each output is a sum of shifted, weighted copies of one response, one copy for each input sample.'},
    {t:'note', kind:'warn', head:'Few terms', html:'A moving average or an echo uses only a few past samples, so each output sum has only a few terms.'}
  ]});

/* the rain rate behind the hourly totals, and its integral over one hour */
const rainRate = t => t>0 ? 6*(t/3)*Math.exp(1-t/3) : 0;
const hourTotal = n => { const N=200, d=1/N; let s=0;
  for(let i=0;i<=N;i++) s += (i===0||i===N?1:(i%2?4:2))*rainRate(n-1+i*d);
  return s*d/3; };

const REAL_CONVINT = realGallery({ id:'m3-real-convint', nav:'Convolution integrals around us',
  title:'Convolution Integrals Around Us', eyebrow:'Module 3 · The convolution integral', src:'pp. 17–20',
  objective:'Recognise an output that is a moving, weighted area of the input.',
  keywords:'examples thermometer lag RC pulse rain gauge hourly total blurred edge moving integral',
  figs:[
    [()=>{ const a=P.Axes(EXO({xr:[0,60],yr:[15,42],xlabel:'t\\;(\\text{s})',ylabel:'T(t)\\;(^{\\circ}\\text{C})',xstep:10}));
      a.curve(()=>30,{color:C.in,dash:'9 6'});
      a.curve(t=>20+10*(1-Math.exp(-t/10)),{color:C.out});
      return a.svg(); }, 'A thermometer lags the air: $y(t)=20+10\\bigl(1-e^{-t/10}\\bigr)$ °C for $t\\ge0$.',
      [['in','$x(t)$',true],['out','$y(t)$']]],
    [()=>{ const v=t=>t<0?0:t<1?5*(1-Math.exp(-t)):5*(1-Math.exp(-1))*Math.exp(-(t-1));
      const a=P.Axes(EXO({xr:[-0.5,5],yr:[-0.5,7],xlabel:'t\\;(\\text{ms})',ylabel:'v(t)\\;(\\text{V})',xstep:1}));
      a.curve(t=>(t>=0&&t<1)?5:0,{color:C.in,dash:'9 6',n:1200});
      a.curve(v,{color:C.out,n:1200});
      return a.svg(); }, 'A 1 ms pulse into an RC circuit: $v_C(t)=5\\bigl(1-e^{-t}\\bigr)$ for $t<1$, then a decay.',
      [['in','$v_s(t)$',true],['out','$v_C(t)$']]],
    [()=>{ const a=P.Axes(EXO({xr:[0,16],yr:[0,7.5],xlabel:'n\\;(\\text{h})',ylabel:'r[n]\\;(\\text{mm})',xstep:4}));
      a.stem(disc(n=>n>=1?hourTotal(n):0,0,16),{color:C.out,r:3});
      return a.svg(); }, 'Hourly rain totals from the rain rate $\\rho(t)$: $r[n]=\\int_{n-1}^{n}\\rho(t)\\,\\d t$.'],
    [()=>{ const a=P.Axes(EXO({xr:[-3,3],yr:[-0.2,1.9],xlabel:'s\\;(\\text{mm})',ylabel:'b(s)',xstep:1}));
      a.curve(s=>s>=0?1:0,{color:C.in,dash:'9 6',n:1200});
      a.curve(s=>s<-1?0:s<1?(s+1)/2:1,{color:C.out,n:1200});
      return a.svg(); }, 'A lens blurs a sharp edge: $b(s)=\\tfrac{s+1}{2}$ on $-1<s<1$.',
      [['in','$u(s)$',true],['out','$b(s)$']]]
  ],
  notes:[
    {t:'note', kind:'def', head:'An area at each time', html:'Each output value is an area: the input, weighted by $h(t-\\tau)$, integrated over $\\tau$.'},
    {t:'note', kind:'warn', head:'Wide response, smooth output', html:'A wide impulse response averages over a long window, so fast changes in the input are smoothed out.'}
  ]});

const REAL_PROPS = realGallery({ id:'m3-real-props', nav:'Interconnections around us',
  title:'Interconnections Around Us', eyebrow:'Module 3 · Properties of LTI systems', src:'pp. 20–21',
  objective:'See cascades, parallel paths and stability in everyday systems.',
  keywords:'examples cascade RC stages multipath radio reflection moving average feedback howl stable unstable',
  figs:[
    [()=>{ const a=P.Axes(EXO({xr:[-0.5,6],yr:[-0.05,0.5],xlabel:'t\\;(\\text{ms})',ylabel:'h(t)\\;(1/\\text{ms})',xstep:1}));
      a.curve(t=>t>=0?t*Math.exp(-t):0,{color:C.h,n:900});
      return a.svg(); }, 'Two RC stages in cascade: $h(t)=e^{-t}u(t)*e^{-t}u(t)=t\\,e^{-t}u(t)$.'],
    [()=>{ const a=P.Axes(EXO({xr:[-0.5,5],yr:[-0.1,1.35],xlabel:'t\\;(\\mu\\text{s})',ylabel:'h(t)',xstep:1}));
      a.impulse(1,1,{color:C.h}); a.impulse(3,0.5,{color:C.h});
      return a.svg(); }, 'A direct path and a reflection in parallel: $h(t)=\\delta(t-1)+0.5\\,\\delta(t-3)$.'],
    [()=>{ const a=P.Axes(EXO({xr:[-1,20],yr:[-0.02,0.25],xlabel:'n\\;(\\text{s})',ylabel:'h[n]',xstep:5}));
      a.stem(disc(n=>n>=0?0.2*Math.pow(0.8,n):0,-1,20),{color:C.out,r:3});
      return a.svg(); }, 'A stable smoother: $h[n]=0.2\\,(0.8)^{n}u[n]$, and $\\sum_n|h[n]|=1$.'],
    [()=>{ const a=P.Axes(EXO({xr:[-1,30],yr:[0,10.5],xlabel:'n\\;(\\text{ms})',ylabel:'h[n]',xstep:10}));
      a.stem(disc(n=>n>=0?Math.pow(1.08,n):0,-1,29),{color:C.err,r:2.6});
      return a.svg(); }, 'Feedback howl: $h[n]=(1.08)^{n}u[n]$ grows, so $\\sum_n|h[n]|$ diverges.']
  ],
  notes:[
    {t:'note', kind:'def', head:'Blocks combine', html:'A cascade convolves its impulse responses. Parallel paths add them.'},
    {t:'note', kind:'warn', head:'Stable or not', html:'A decaying impulse response has a finite sum of $|h|$. A growing one, like a feedback howl, does not.'}
  ]});

const REAL_DIFFEQ = realGallery({ id:'m3-real-diffeq', nav:'Recursions around us',
  title:'Recursions Around Us', eyebrow:'Module 3 · Difference and differential equations', src:'—',
  objective:'Recognise systems whose output is updated from its own last value.',
  keywords:'examples savings interest sensor smoothing RC charging car drag recursion feedback first order',
  figs:[
    [()=>{ const a=P.Axes(EXO({xr:[-1,36],yr:[0,4400],xlabel:'n\\;(\\text{month})',ylabel:'y[n]\\;(\\text{EUR})',xstep:12}));
      a.stem(disc(n=>n>=0?20000*(Math.pow(1.005,n+1)-1):0,-1,35),{color:C.out,r:2.2});
      return a.svg(); }, 'A deposit of 100 EUR each month at 0.5 % interest: $y[n]=1.005\\,y[n-1]+100\\,u[n]$.'],
    [()=>{ const a=P.Axes(EXO({xr:[-1,20],yr:[0,29],xlabel:'n\\;(\\text{s})',ylabel:'y[n]\\;(^{\\circ}\\text{C})',xstep:5}));
      a.stem(disc(n=>n>=0?25*(1-Math.pow(0.8,n+1)):0,-1,20),{color:C.out,r:3});
      return a.svg(); }, 'A display smooths a reading that jumps to 25 °C: $y[n]=0.8\\,y[n-1]+0.2\\,x[n]$.'],
    [()=>{ const a=P.Axes(EXO({xr:[-0.5,5],yr:[-0.5,6.5],xlabel:'t\\;(\\text{ms})',ylabel:'v_C(t)\\;(\\text{V})',xstep:1}));
      a.curve(t=>t>=0?5:0,{color:C.in,dash:'9 6',n:1200});
      a.curve(t=>t>=0?5*(1-Math.exp(-t)):0,{color:C.out,n:1200});
      return a.svg(); }, 'An RC circuit switched on at $t=0$: $\\frac{\\d v_C}{\\d t}+v_C=5\\,u(t)$ with $t$ in ms, so $v_C(t)=5\\bigl(1-e^{-t}\\bigr)$ V.',
      [['in','$v_s(t)$',true],['out','$v_C(t)$']]],
    [()=>{ const a=P.Axes(EXO({xr:[-2,40],yr:[-2,34],xlabel:'t\\;(\\text{s})',ylabel:'v(t)\\;(\\text{m/s})',xstep:10}));
      a.curve(t=>t>=0?30*(1-Math.exp(-t/10)):0,{color:C.out,n:1200});
      return a.svg(); }, 'A car pulls away against drag: $10\\,\\frac{\\d v}{\\d t}+v=30\\,u(t)$, so $v(t)=30\\bigl(1-e^{-t/10}\\bigr)$ m/s.']
  ],
  notes:[
    {t:'note', kind:'def', head:'One rule, run forward', html:'Each output is updated from its own last value and the new input. The rule is a difference equation or a differential equation.'},
    {t:'note', kind:'warn', head:'Feedback can grow', html:'The balance grows without bound, because its feedback gain is $1.005>1$. The other three settle at a final level.'}
  ]});

/* Small sketches for the summary and project cards. Both pages are navy, so
   they are drawn in the dark-page signal tints. */
const G = (()=>{
  const sv = b => `<svg viewBox="0 0 92 44">${b}</svg>`;
  const ln = (d,c,w) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w||2}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const dot = (x,y,c) => `<circle cx="${x}" cy="${y}" r="2.4" fill="${c}"/>`;
  const st = (x,y,c,base) => ln(`M${x} ${base||40} V${y}`,c,1.8)+dot(x,y,c);
  const AX='rgba(239,231,216,.30)', CY='#4FBECE', GR='#82C27B', RD='#E8785F', VI='#AC99DC', AM='#E5B255';
  return {
    imp:    sv(ln('M1 40 H91',AX,1)+st(10,8,CY)+ln('M20 24 H32 M28 20 L32 24 L28 28',AX,1.4)
               +[0,1,2,3,4,5].map(i=>st(42+i*9,40-30*Math.pow(0.72,i),AM)).join('')),
    rep:    sv(ln('M1 40 H91',AX,1)+[[14,22],[30,8],[46,22],[62,8]].map(([x,y],i)=>st(x,y,i===1?VI:CY)).join('')),
    sum:    sv(ln('M1 40 H91',AX,1)+[[10,30],[24,14],[38,14],[52,14],[66,22]].map(([x,y])=>st(x,y,GR)).join('')),
    integ:  sv(ln('M1 40 H91',AX,1)+`<path d="M30 40 L30 24 Q46 8 62 20 L62 40 Z" fill="${GR}" fill-opacity=".30"/>`
               +ln('M2 38 Q18 36 30 24 Q46 8 62 20 T90 36',GR,1.8)),
    flip:   sv(ln('M1 40 H91 M46 4 V42',AX,1)+st(54,10,AM)+st(62,22,AM)+st(70,32,AM)
               +st(38,10,VI)+st(30,22,VI)+st(22,32,VI)),
    cases:  sv(ln('M1 40 H91',AX,1)+ln('M4 40 Q20 40 30 22 T56 12 T88 40',GR,1.8)
               +ln('M30 4 V42 M56 4 V42',RD,1.2)),
    check:  sv(ln('M22 24 L34 36 L56 10',GR,2.6)+ln('M64 30 H88',AX,1.2)),
    inter:  sv(ln('M2 14 H12 M30 14 H40 M58 14 H70 M2 32 H90',AX,1.3)
               +`<rect x="12" y="8" width="18" height="12" fill="none" stroke="${AM}" stroke-width="1.6"/>`
               +`<rect x="40" y="8" width="18" height="12" fill="none" stroke="${AM}" stroke-width="1.6"/>`
               +`<rect x="70" y="26" width="18" height="12" fill="none" stroke="${AM}" stroke-width="1.6"/>`),
    caus:   sv(ln('M1 40 H91',AX,1)+ln('M40 4 V42',RD,1.6)+[0,1,2,3,4].map(i=>st(48+i*9,40-30*Math.pow(0.7,i),AM)).join('')),
    stab:   sv(ln('M1 40 H91',AX,1)+[0,1,2,3,4,5,6].map(i=>st(8+i*12,40-30*Math.pow(0.65,i),GR)).join('')),
    step:   sv(ln('M1 40 H91',AX,1)+[0,1,2,3,4,5,6].map(i=>st(8+i*12,40-30*(1-Math.pow(0.55,i+1)),GR)).join('')
               +ln('M4 10 H90',RD,1)),
    recur:  sv(ln('M2 16 H35 M47 16 H90 M72 16 V28 M62 34 H41 V22',AX,1.3)
               +`<circle cx="41" cy="16" r="6" fill="none" stroke="${CY}" stroke-width="1.6"/>`
               +`<rect x="62" y="28" width="20" height="12" fill="none" stroke="${AM}" stroke-width="1.6"/>`),
    clap:   sv(ln('M1 23 H91',AX,1)+ln('M'+[...Array(86)].map((_,k)=>{ const x=4+k;
               return x+','+(23-17*Math.exp(-k/22)*Math.sin(k*1.9)*Math.cos(k*0.7)).toFixed(1); }).join('L'),AM,1.3)),
    smooth: sv(ln('M'+[...Array(86)].map((_,k)=>(4+k)+','+(24-8*Math.sin(k/9)-5*Math.sin(k*1.7)).toFixed(1)).join('L'),CY,1.1)
               +ln('M'+[...Array(86)].map((_,k)=>(4+k)+','+(24-8*Math.sin((k-3)/9)).toFixed(1)).join('L'),GR,2)),
    inverse:sv(ln('M2 22 H12 M32 22 H42 M62 22 H74',AX,1.3)
               +`<rect x="12" y="15" width="20" height="14" fill="none" stroke="${AM}" stroke-width="1.6"/>`
               +`<rect x="42" y="15" width="20" height="14" fill="none" stroke="${VI}" stroke-width="1.6"/>`
               +st(84,8,CY,36)+ln('M76 36 H91',AX,1)),
    loops:  sv(ln('M28 8 L14 22 L28 36 M64 8 L78 22 L64 36',AM,2)+ln('M52 6 L40 38',CY,1.6))
  };
})();

const SC = [

{ id:'m3-open', module:'M3', nav:'Module 3 opening', title:'Linear Time-Invariant Systems', src:'pp. 14–21',
  dark:true, keywords:'module 3 LTI convolution impulse response overview', steps:0, blocks:[
  {t:'eyebrow', text:'Module 3 · Linear Time-Invariant Systems', src:'pp. 14–21'},
  {t:'title', level:1, text:'Linear Time-Invariant Systems'},
  {t:'lede', text:'This module develops a direct way to find the output of a linear time-invariant system. Such a system is fully described by its response to one unit impulse. Convolution then uses that response to find the output for any input.'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'raw', html:`<div style="margin-top:20px">
      <div style="font-family:var(--mono);font-size:12.5px;letter-spacing:.14em;color:var(--slate);margin-bottom:10px">THE ENTIRE MODULE, IN TWO LINES</div></div>`},
    {t:'eq', tex:'y[n]=\\sum_{k=-\\infty}^{\\infty}x[k]\\,h[n-k]', label:'Convolution sum'},
    {t:'eq', tex:'y(t)=\\int_{-\\infty}^{\\infty}x(\\tau)\\,h(t-\\tau)\\,\\d\\tau', label:'Convolution integral'},
    {t:'note', kind:'err', head:'Check the system before using convolution', html:'<span style="color:var(--graphite)">Convolution gives the system output only when the system is linear and time invariant. If either property fails, the convolution result is not the output of that system.</span>'}
  ], right:[
    /* x[n] and h[n] rise first, then their convolution y[n] rises under them,
       on the same n axis. Each signal has its own panel, so no stem hides
       another. The motion is the stem() anim of the other module openings. */
    {t:'grid', cols:1, gap:'14px', items:[x3,h3,y3].map(([f,lab,col,yr,d])=>[{t:'fig', svg:()=>{
      const a=P.Axes({w:520,h:124,xr:[-1,9],yr,grid:false,xlabel:'n',ylabel:lab,xnameDrop:32,
        chrome:{axis:'rgba(239,231,216,.34)',tick:'#9EACB9',name:'#E6E2D9'},
        pad:{l:46,r:30,t:14,b:28},xstep:2,ytarget:2});
      a.stem(disc(f,-1,8),{color:col,r:4.5,width:2,anim:{delay:d,step:.1,tip:true}});
      return a.svg(); }}])}
  ]}
]},

/* ======================================================= 3.1 impulse response */

{ id:'m3-impulse', module:'M3', nav:'Impulse response', title:'Impulse Response', src:'p. 14',
  objective:'Define h and explain why one experiment describes a whole LTI system.',
  keywords:'impulse response h[n] h(t) unit impulse characterisation LTI', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 3 · Impulse response', src:'p. 14'},
  {t:'title', text:'Impulse Response'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      /* the input is drawn up to n = 0 and the response from n = 1, so the two
         sets of stems never share a position */
      const a=P.Axes({w:560,h:380,xr:[-2,9],yr:[-0.3,1.4],xlabel:'n',ylabel:'\\text{amplitude}',pad:{l:50,r:24,t:20,b:34},xtarget:11,ytarget:3});
      a.stem(disc(n=>n===0?1:0,-2,0),{color:C.in});
      a.stem(disc(n=>Math.pow(0.8,n-1),1,9),{color:C.h});
      return a.svg(); },
      caption:'The input is one unit sample at $n=0$. This system answers one step later, and its answer dies away.'},
    {t:'legend', items:[['in','$x[n]=\\delta[n]$'],['h','$y[n]=h[n]$']]}
  ], right:[
    {t:'note', kind:'def', head:'Definition', html:'The impulse response $h[n]$ is the output when the input is the unit impulse $\\delta[n]$. In continuous time, $\\delta(t)$ gives $h(t)$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'Why one response is enough', html:'Time invariance gives the response to each shifted impulse. Linearity then gives the response to any weighted sum of them, and every signal is such a sum.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Only for LTI systems', html:'For a system that is not LTI, the impulse gives one input–output pair and nothing more.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'An LTI system has impulse response $h[n]$. The input is $\\delta[n-3]$.<div class="nsep"></div>What is the output?',
        ask:{key:'m3-impulse', choices:['$h[n-3]$','$h[n+3]$','$3\\,h[n]$'], answer:0,
          why:'Time invariance: a delay of the input by 3 delays the output by 3.'}}]}
  ]}
]},

{ id:'m3-representation', module:'M3', nav:'Representation property', title:'Every Signal Is a Sum of Impulses', src:'pp. 14–15',
  objective:'Derive the representation property from the sampling property.',
  keywords:'representation property weighted shifted impulses sum delta sampling', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 3 · Impulse response', src:'pp. 14–15'},
  {t:'title', text:'Every Signal Is a Sum of Impulses'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$x[n]$','$x[0]\\,\\delta[n]$','$+\\,x[1]\\,\\delta[n-1]$','$+\\,x[2]\\,\\delta[n-2]$','$+\\,x[3]\\,\\delta[n-3]$']},
      svg:v=>{
      /* Frame 0 is x[n]. Going to frame 1 lowers every sample but n = 0, which
         is x[0]δ[n]; from there the term m rises while the frame runs from m
         to m+1 and keeps the violet of the current term until the next one
         starts. Frame 4 is x[n] again. */
      const xs=[1,2,1,2];
      const a=P.Axes({w:560,h:380,xr:[-2,6],yr:[-0.3,2.9],xlabel:'n',ylabel:'x[n]',pad:{l:48,r:24,t:20,b:34},xtarget:9,ytarget:3});
      const k=v?v.frame:0, done=k<=1e-9||k>=4-1e-9;
      const cur=done?-1:k<=1?0:Math.ceil(k-1e-9)-1;
      a.stem(disc(()=>0,-2,6),{color:C.in});
      for(let m=0;m<=3;m++){
        const f=m===0?1:k<=1?1-k:cl(k-m);
        if(f<=0) continue;
        a.stem([[m,xs[m]*f]],{color:m===cur?C.mid:C.in});
      }
      if(cur>=0) a.note(cur===0?0.12:cur,2.6,'x['+cur+']\\,\\delta[n'+(cur?'-'+cur:'')+']',{anchor:cur===0?'start':'middle',color:C.mid,fs:15,tex:true});
      return a.svg(); },
      caption:'Step through the frames. Each sample of $x[n]$ is one impulse, weighted by the value of that sample.'},
    {t:'legend', items:[['in','$x[n]$'],['mid','$x[k]\\,\\delta[n-k]$']]}
  ], right:[
    {t:'eq', side:true, tex:'x[n]\\,\\delta[n-k]=x[k]\\,\\delta[n-k]', label:'Sampling',
      note:'The product keeps one sample, at $n=k$, with weight $x[k]$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'x[n]=x[n]\\underbrace{\\sum_{k=-\\infty}^{\\infty}\\delta[n-k]}_{=\\,1}=\\sum_{k=-\\infty}^{\\infty}x[k]\\,\\delta[n-k]', label:'Representation property',
        note:'The sum of shifted impulses is 1 at every $n$, because only the term $k=n$ is non-zero. Sampling turns each $x[n]\\,\\delta[n-k]$ into $x[k]\\,\\delta[n-k]$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'$x[n]=3\\,\\delta[n+1]-\\delta[n-2]$.<div class="nsep"></div>What is $x[-1]$?',
        ask:{key:'m3-representation', choices:['$3$','$-1$','$0$'], answer:0,
          why:'At $n=-1$ only the term $3\\,\\delta[n+1]$ is non-zero, and its weight is 3.'}}]}
  ]}
]},

REAL_IMPULSE,

{ id:'m3-lab-m', module:'M3', nav:'Laboratory {lab} · Black box', title:'Laboratory {lab} — Impulse Response of a Black Box', src:'pp. 14–15',
  objective:'Measure h with one impulse, then predict other outputs from it.',
  slide:true, keywords:'laboratory impulse response black box superposition prediction LTI', steps:0, blocks:[
  {t:'eyebrow', text:'Interactive laboratory', src:'pp. 14–15'},
  {t:'title', text:'Laboratory {lab} · Impulse Response'},
  {t:'lab', id:'M'}
]},

{ id:'m3-code-impulse', module:'M3', nav:'Code · Impulse response', title:'Impulse Response in Code', src:'pp. 14–15',
  objective:'Measure an impulse response and predict outputs from it in MATLAB and in Python, and predict each result before running it.',
  keywords:'code matlab python impulse response superposition representation LTI run',
  slide:true, steps:0, budget:'a code page: the program draws its own figure', blocks:[
  {t:'eyebrow', text:'Module 3 · Impulse response in code', src:'pp. 14–15'},
  {t:'title', text:'Impulse Response in Code'},
  {t:'raw', html:()=>CODEBANK.page('m3-code-impulse')}
]},

/* ===================================================== 3.2 the convolution sum */

{ id:'m3-convsum', module:'M3', nav:'The convolution sum', title:'Deriving the Convolution Sum', src:'p. 15',
  objective:'Derive the convolution sum and name where each LTI property is used.',
  keywords:'convolution sum derivation linearity time invariance additivity homogeneity', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 3 · The convolution sum', src:'p. 15'},
  {t:'title', text:'Deriving the Convolution Sum'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const rows=[
        ['\\delta[n]','h[n]','definition'],
        ['\\delta[n-k]','h[n-k]','time invariance'],
        ['x[k]\\,\\delta[n-k]','x[k]\\,h[n-k]','homogeneity'],
        ['\\sum_k x[k]\\,\\delta[n-k]','\\sum_k x[k]\\,h[n-k]','additivity']];
      const items=[];
      rows.forEach(([i,o,p],j)=>{ const y=66+j*100;
        items.push({t:'text',x:14,y:y+6,label:i,anchor:'start',tex:true,fs:16,color:C.in},
          {t:'arrow',x1:196,y1:y,x2:246,y2:y},{t:'box',x:246,y:y-24,w:70,h:48,label:'S',tex:true},
          {t:'arrow',x1:316,y1:y,x2:366,y2:y},
          {t:'text',x:376,y:y+6,label:o,anchor:'start',tex:true,fs:16,color:j===3?C.out:C.h},
          {t:'text',x:281,y:y-36,label:p,fs:13,color:C.slate}); });
      return P.blocks({w:560,h:400,items}); },
      caption:'Each row applies one property to the row above it. The last row is the convolution sum.'}
  ], right:[
    {t:'eq', tex:'\\begin{aligned}y[n]&=S\\Bigl\\{\\sum_{k}x[k]\\,\\delta[n-k]\\Bigr\\}\\\\&=\\sum_{k}S\\bigl\\{x[k]\\,\\delta[n-k]\\bigr\\}&&\\text{additivity}\\\\&=\\sum_{k}x[k]\\,S\\bigl\\{\\delta[n-k]\\bigr\\}&&\\text{homogeneity}\\\\&=\\sum_{k}x[k]\\,h[n-k]&&\\text{time invariance}\\end{aligned}', label:'Apply the system'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, result:true, tex:'y[n]=\\sum_{k=-\\infty}^{\\infty}x[k]\\,h[n-k]=x[n]*h[n]', label:'Key result · Convolution sum',
        note:'The symbol $*$ denotes convolution. It gives the output only when the system is LTI.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'A system is linear but not time invariant, and $\\delta[n]$ gives $h[n]$.<div class="nsep"></div>Does $x[n]*h[n]$ give its output?',
        ask:{key:'m3-convsum', choices:['Yes','No'], answer:1,
          why:'The step $\\delta[n-k]\\to h[n-k]$ needs time invariance.'}}]}
  ]}
]},

{ id:'m3-convsum-b', module:'M3', nav:'Either signal can be flipped', title:'Either Signal Can Be Flipped', src:'p. 15',
  objective:'Show by a change of index that either factor may be the shifted and reversed one.',
  keywords:'convolution commutative equivalent form change of index m=n-k', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 3 · The convolution sum', src:'p. 15'},
  {t:'title', text:'Either Signal Can Be Flipped'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$x[k]$ and $h[3-k]$','$h[m]$ and $x[3-m]$']},
      svg:v=>{
      /* x = {1,2,1,2} and h = {1,0.6,0.3} at n = 3. Frame 0 flips h, frame 1
         flips x; between them every sample moves to its mirror position about
         1.5, so the pairs that multiply stay together. */
      const xs=[1,2,1,2], hs=[1,0.6,0.3], f=cl(v?v.frame:0);
      const a=P.Axes({w:560,h:380,xr:[-2,6],yr:[-0.3,2.9],xlabel:f<0.5?'k':'m',ylabel:'\\text{amplitude}',pad:{l:48,r:24,t:20,b:34},xtarget:9,ytarget:3});
      xs.forEach((val,j)=>a.stem([[j+(3-2*j)*f,val]],{color:C.in}));
      hs.forEach((val,j)=>a.stem([[(3-j)+(2*j-3)*f,val]],{color:C.h}));
      a.note(5.7,2.55,'y[3]=3.2',{anchor:'end',color:C.out,fs:16,tex:true});
      return a.svg(); },
      caption:'Frame 1 flips $h$ and frame 2 flips $x$. The same pairs meet, so both sums give 3.2 at $n=3$.'},
    {t:'legend', items:[['in','$x$'],['h','$h$']], at:'tl'}
  ], right:[
    {t:'eq', tex:'\\begin{aligned}\\sum_{k}x[k]\\,h[n-k]&=\\sum_{m}x[n-m]\\,h[n-(n-m)]\\\\&=\\sum_{m}h[m]\\,x[n-m]=h[n]*x[n]\\end{aligned}', label:'Change the index',
      note:'Put $m=n-k$. As $k$ runs over all integers, so does $m$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'Choose the easier flip', html:'Flip the signal whose support gives the simpler limits. The output is the same.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'$h[n]=\\delta[n-2]$.<div class="nsep"></div>What is $x[n]*h[n]$?',
        ask:{key:'m3-convsum-b', choices:['$x[n-2]$','$x[n+2]$','$x[2-n]$'], answer:0,
          why:'In $\\sum_m h[m]\\,x[n-m]$ only $m=2$ survives, which leaves $x[n-2]$.'}}]}
  ]}
]},

{ id:'m3-steps', module:'M3', nav:'Flip, shift, multiply, add', title:'Flip, Shift, Multiply, Add', src:'p. 15',
  objective:'Name the procedure and explain the role of the flip.',
  keywords:'flip shift multiply add steps of convolution procedure correlation', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 3 · The convolution sum', src:'p. 15'},
  {t:'title', text:'Flip, Shift, Multiply, Add'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$h[k]$','flip: $h[-k]$','shift: $h[3-k]$']},
      svg:v=>{
      /* Frame 0 is h[k]. Going to frame 1 mirrors every sample about k = 0;
         going to frame 2 moves the mirrored samples 3 to the right. */
      const hs=[1,0.6,0.3], k=v?v.frame:0, f=cl(k), s=cl(k-1);
      const a=P.Axes({w:560,h:380,xr:[-4,6],yr:[-0.25,1.45],xlabel:'k',ylabel:'\\text{amplitude}',pad:{l:50,r:24,t:20,b:34},xtarget:11,ytarget:3});
      hs.forEach((val,j)=>a.stem([[j*(1-2*f)+3*s,val]],{color:C.h}));
      if(s>0) fade(a,s,()=>{ a.vline(3,{color:C.coral,dash:'4 4'});
        a.note(3.15,1.18,'k=n=3',{anchor:'start',color:C.coral,fs:15,tex:true}); });
      a.note(5.7,1.33,k<0.5?'h[k]':k<1.5?'h[-k]':'h[3-k]',{anchor:'end',color:C.h,fs:16,tex:true});
      return a.svg(); },
      caption:'An asymmetric $h$ shows the flip. After the shift, the sample $h[0]$ sits at $k=n$.'}
  ], right:[
    {t:'note', kind:'def', head:'Method', html:'<ol class="steps"><li>Flip: reverse $h[k]$ to get $h[-k]$.</li><li>Shift: move it by $n$ to get $h[n-k]$.</li><li>Multiply by $x[k]$ and add over $k$.</li><li>Repeat for every $n$.</li></ol>'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'Read the argument', html:'In $h[n-k]$ the variable is $k$. The sample $h[0]$ sits where $n-k=0$, that is at $k=n$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Do not skip the flip', html:'Without the flip the sum $\\sum_k x[k]\\,h[k-n]$ is a correlation, not a convolution. A symmetric $h$ hides this error.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$h[k]=\\{1,\\,0.6,\\,0.3\\}$ on $k=0,1,2$, and $n=3$.<div class="nsep"></div>Where is the sample $0.3$ of $h[n-k]$?',
        ask:{key:'m3-steps', choices:['$k=1$','$k=3$','$k=5$'], answer:0,
          why:'$h[3-k]=h[2]=0.3$ when $3-k=2$, that is at $k=1$.'}}]}
  ]}
]},

{ id:'m3-ex-dt1', module:'M3', nav:'Worked example · finite sequences', title:'Convolution as a Sum of Copies', src:'pp. 15–16',
  objective:'Write the convolution of two finite sequences as a sum of shifted copies of h.',
  keywords:'example convolution finite sequences superposition shifted impulse responses copies', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 3 · Worked example', src:'pp. 15–16'},
  {t:'title', text:'Convolution as a Sum of Copies'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$x[n]$','$x[0]\\,h[n]$','$+\\,2h[n-1]$','$+\\,h[n-2]$','$+\\,2h[n-3]$']},
      svg:v=>{
      /* Frame 0 is the input. From frame 1 the output is built one copy at a
         time: copy m rises while the frame runs from m to m+1. The part just
         added is violet and the sum so far is green. */
      const xs=[1,2,1,2], h=n=>(n===0||n===1)?1:0, k=v?v.frame:0;
      const a=P.Axes({w:560,h:380,xr:[-1,6],yr:[-0.3,3.9],xlabel:'n',ylabel:'\\text{amplitude}',pad:{l:48,r:24,t:20,b:34},xtarget:8,ytarget:3});
      fade(a,1-cl(k),()=>a.stem(disc(n=>(n>=0&&n<=3)?xs[n]:0,-1,6),{color:C.in}));
      if(k>0){
        const g=j=>j===0?cl(k):cl(k-j), cur=k>=4-1e-9?-1:k<=1?0:Math.ceil(k-1e-9)-1;
        const upto=(n,last)=>{ let s=0; for(let j=0;j<=last;j++) s+=g(j)*xs[j]*h(n-j); return s; };
        if(cur>=0) a.stem(disc(n=>upto(n,cur),-1,6).filter(p=>p[1]>1e-9),{color:C.mid});
        a.stem(disc(n=>upto(n,cur>=0?cur-1:3),-1,6).filter(p=>p[1]>1e-9),{color:C.out,r:cur>=0?0.01:undefined});
      }
      return a.svg(); },
      caption:'Step through the frames. Each sample of $x$ adds one copy of $h$, delayed to that sample and scaled by its value.'},
    {t:'legend', items:[['in','$x[n]$'],['mid','$\\text{new copy}$'],['out','$\\text{sum so far}$']]}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x[n]=\\{1,2,1,2\\}$ on $n=0,\\dots,3$ and $h[n]=\\{1,1\\}$ on $n=0,1$.<div class="nsep"></div>How many shifted copies of $h$ make up $y[n]$?',
      ask:{key:'m3-ex-dt1', choices:['$2$','$4$','$5$'], answer:1}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'Write the sum term by term. Only $k=0,1,2,3$ have $x[k]\\neq0$, so four terms remain.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'\\begin{aligned}y[n]&=\\sum_{k}x[k]\\,h[n-k]\\\\&=x[0]h[n]+x[1]h[n-1]+x[2]h[n-2]+x[3]h[n-3]\\\\&=h[n]+2h[n-1]+h[n-2]+2h[n-3]\\end{aligned}', label:'Expand the sum'}]}
  ]}
]},

{ id:'m3-ex-dt1-b', module:'M3', nav:'Worked example · adding the copies', title:'Adding the Four Copies', src:'pp. 15–16',
  objective:'Add the shifted impulse responses and check the result two ways.',
  keywords:'convolution superposition sum support length moving sum check', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 3 · Worked example', src:'pp. 15–16'},
  {t:'title', text:'Adding the Four Copies'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, sketch:{label:'Sketch $y[n]$ on the axes, then check it.'}, svg:()=>{
      const a=P.Axes({w:560,h:380,xr:[-1,6],yr:[-0.3,3.9],xlabel:'n',ylabel:'y[n]',pad:{l:48,r:24,t:20,b:34},xtarget:8,ytarget:3});
      skArea(a);
      fade(a,0.35,()=>a.stem(disc(n=>(n>=0&&n<=3)?[1,2,1,2][n]:0,-1,6),{color:C.ink}));
      a.note(3.2,2.25,'x[n]',{anchor:'start',color:C.ink,fs:15,tex:true});
      a.raw('<g class="sk-key">');
      a.stem(disc(n=>(n>=0&&n<=4)?[1,3,3,3,2][n]:0,-1,6),{color:C.out});
      a.note(5.7,3.55,'y[n]',{anchor:'end',color:C.out,fs:15,tex:true});
      a.raw('</g>');
      return a.svg(); },
      caption:'The faint stems are $x[n]$. Add the four copies at each $n$, sketch $y[n]$, then show the answer.'}
  ], right:[
    {t:'eq', tex:'\\begin{aligned}y[0]&=x[0]h[0]=1\\\\y[1]&=x[0]h[1]+x[1]h[0]=1+2=3\\\\y[2]&=x[1]h[1]+x[2]h[0]=2+1=3\\\\y[3]&=x[2]h[1]+x[3]h[0]=1+2=3\\\\y[4]&=x[3]h[1]=2\\end{aligned}', label:'Evaluate at each n',
      note:'$h[n-k]$ is non-zero only for $n-k=0$ or $1$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'Solution', html:'$y[n]=\\{1,3,3,3,2\\}$ on $n=0,\\dots,4$, and $0$ elsewhere.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Check', html:'The support has $4+2-1=5$ samples. The sums agree: $1+3+3+3+2=12=6\\times2$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'A two-point moving sum', html:'With $h=\\{1,1\\}$ each output adds two neighbouring inputs: $1$, $1+2$, $2+1$, $1+2$, $2$.'}]}
  ]}
]},

{ id:'m3-ex-dt2', module:'M3', nav:'Worked example · geometric', title:'Two Infinite Sequences', src:'pp. 16–17',
  objective:'Set up the geometric example and split it into two cases by the overlap.',
  keywords:'geometric series convolution u[n] (1/2)^n case split overlap support', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 3 · Worked example', src:'pp. 16–17'},
  {t:'title', text:'Two Infinite Sequences'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$n=-2$: no overlap','$n=4$: overlap $0\\le k\\le 4$']},
      svg:v=>{
      /* the reversed step h[n-k] slides from n = -2 to n = 4; its samples sit
         at k = n - m for m >= 0 */
      const f=cl(v?v.frame:0), nn=-2+6*f;
      const a=P.Axes({w:560,h:380,xr:[-6,8],yr:[-0.2,1.5],xlabel:'k',ylabel:'\\text{amplitude}',pad:{l:48,r:24,t:20,b:34},xtarget:8,ytarget:3});
      const hp=[]; for(let m=0;nn-m>=-6;m++) hp.push([nn-m,1]);
      a.stem(hp,{color:C.h,r:2.6,width:1.4});
      a.stem(disc(k=>k>=0?Math.pow(0.5,k):0,-6,8),{color:C.in});
      a.vline(nn,{color:C.coral,dash:'4 4'});
      a.note(nn+0.2,1.3,'k=n',{anchor:'start',color:C.coral,fs:15,tex:true});
      return a.svg(); },
      caption:'The reversed step $h[n-k]$ is 1 for $k\\le n$. It meets $x[k]$ only when $n\\ge0$.'},
    {t:'legend', items:[['in','$x[k]$'],['h','$h[n-k]$']]}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x[n]=\\left(\\tfrac12\\right)^{n}u[n]$ and $h[n]=u[n]$.<div class="nsep"></div>As $n\\to\\infty$, what does $y[n]$ approach?',
      ask:{key:'m3-ex-dt2', choices:['$1$','$2$','$\\infty$'], answer:1}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'<ol class="steps"><li>$u[k]$ keeps only $k\\ge0$.</li><li>$u[n-k]$ keeps only $k\\le n$.</li><li>Split by the sign of $n$.</li></ol>'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'y[n]=\\sum_{k}\\left(\\tfrac12\\right)^{k}u[k]\\,u[n-k]=0', label:'Case I · $n<0$',
        note:'No $k$ satisfies both $k\\ge0$ and $k\\le n<0$.'}]},
    {t:'reveal', at:3, items:[
      {t:'eq', tex:'y[n]=\\sum_{k=0}^{n}\\left(\\tfrac12\\right)^{k}', label:'Case II · $n\\ge0$',
        note:'Both steps equal 1 on $0\\le k\\le n$.'}]}
  ]}
]},

{ id:'m3-ex-dt2-b', module:'M3', nav:'Worked example · the geometric sum', title:'Summing the Geometric Series', src:'pp. 16–17',
  objective:'Evaluate the finite geometric sum and check the result.',
  keywords:'finite geometric sum ratio accumulator running sum limit check', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 3 · Worked example', src:'pp. 16–17'},
  {t:'title', text:'Summing the Geometric Series'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, sketch:{label:'Sketch $y[n]$ on the axes, then check it.'}, svg:()=>{
      const a=P.Axes({w:560,h:380,xr:[-2,11],yr:[-0.2,2.5],xlabel:'n',ylabel:'y[n]',pad:{l:48,r:24,t:20,b:34},xtarget:8,ytarget:3});
      skArea(a);
      fade(a,0.35,()=>a.stem(disc(n=>n>=0?Math.pow(0.5,n):0,-2,11),{color:C.ink}));
      a.note(1.2,0.75,'x[n]',{anchor:'start',color:C.ink,fs:15,tex:true});
      a.raw('<g class="sk-key">');
      a.hline(2,{color:C.coral,dash:'3 5'});
      a.stem(disc(n=>n>=0?2-Math.pow(0.5,n):0,-2,11),{color:C.out,r:3});
      a.note(10.7,2.2,'y[n]\\to 2',{anchor:'end',color:C.coral,fs:15,tex:true});
      a.raw('</g>');
      return a.svg(); },
      caption:'The faint stems are $x[n]$. The output is the running sum of the input. Sketch it, then show the answer.'}
  ], right:[
    {t:'eq', side:true, tex:'\\sum_{k=m}^{n}a\\,r^{k}=\\frac{a\\bigl(r^{m}-r^{n+1}\\bigr)}{1-r}', label:'Finite geometric sum',
      note:'This needs only $r\\neq1$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\begin{aligned}y[n]&=\\frac{1-\\left(\\tfrac12\\right)^{n+1}}{1-\\tfrac12}\\\\&=2-2\\left(\\tfrac12\\right)^{n+1}\\\\&=2-\\left(\\tfrac12\\right)^{n}\\end{aligned}', label:'Case II, evaluated',
        note:'Here $a=1$, $m=0$ and $r=\\tfrac12$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Solution and check', html:'$y[n]=\\left(2-\\left(\\tfrac12\\right)^{n}\\right)u[n]$. At $n=0$ it gives $1=x[0]h[0]$, and $y[n]\\to2$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'The accumulator', html:'$h[n]=u[n]$ forms the running sum of the input. This input has a finite sum, but the accumulator is still not BIBO stable.'}]}
  ]}
]},

REAL_CONVSUM,

{ id:'m3-lab-e', module:'M3', nav:'Laboratory {lab} · Convolution sum', title:'Laboratory {lab} — Convolution Sum, Step by Step', src:'pp. 15–17',
  objective:'Flip, shift, multiply and add for three discrete-time cases.',
  slide:true, keywords:'laboratory convolution sum flip shift multiply add', steps:0, blocks:[
  {t:'eyebrow', text:'Interactive laboratory', src:'pp. 15–17'},
  {t:'title', text:'Laboratory {lab} · Convolution Sum'},
  {t:'lab', id:'E'}
]},

{ id:'m3-code-convsum', module:'M3', nav:'Code · Convolution sum', title:'Convolution Sum in Code', src:'pp. 15–17',
  objective:'Compute convolution sums in MATLAB and in Python, and predict each result before running it.',
  keywords:'code matlab python conv convolve flip shift multiply add geometric correlation run',
  slide:true, steps:0, budget:'a code page: the program draws its own figure', blocks:[
  {t:'eyebrow', text:'Module 3 · The convolution sum in code', src:'pp. 15–17'},
  {t:'title', text:'Convolution Sum in Code'},
  {t:'raw', html:()=>CODEBANK.page('m3-code-convsum')}
]},

/* ================================================ 3.3 the convolution integral */

{ id:'m3-convint', module:'M3', nav:'The convolution integral', title:'Deriving the Convolution Integral', src:'pp. 17–18',
  objective:'Transfer the derivation of the convolution sum to continuous time.',
  keywords:'convolution integral continuous time sifting narrow pulses derivation', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 3 · The convolution integral', src:'pp. 17–18'},
  {t:'title', text:'Deriving the Convolution Integral'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$x(\\tau)$','$\\Delta=1$','$\\Delta=0.5$','$\\Delta=0.25$']},
      svg:v=>{
      /* Frame 0 is x(τ). Frames 1–3 cover it with pulses of width Δ whose
         height is the value of x at the left edge; between two frames the two
         pulse trains cross-fade. */
      const x=t=>t>0?2.2*t*Math.exp(-t):0, k=v?v.frame:0;
      const a=P.Axes({w:560,h:380,xr:[-1,7],yr:[-0.1,1.1],xlabel:'\\tau',ylabel:'\\text{amplitude}',pad:{l:50,r:24,t:20,b:34},xtarget:9,ytarget:3});
      const train=D=>{ const pts=[[0,0]]; for(let t=0;t<7-1e-9;t+=D){ pts.push([t,x(t)],[Math.min(t+D,7),x(t)]); }
        pts.push([7,0]); for(let t=0;t<7-1e-9;t+=D) a.rect(t,0,Math.min(t+D,7),x(t),{fill:'rgba(106,90,146,.16)'});
        a.poly(pts,{color:C.mid,width:1.6}); };
      const lo=Math.floor(k), w=k-lo, Ds=[0,1,0.5,0.25];
      if(lo>=1) fade(a,1-w,()=>train(Ds[lo]));
      if(lo+1<=3&&w>0) fade(a,w,()=>train(Ds[lo+1]));
      a.curve(x,{color:C.in,n:900});
      return a.svg(); },
      caption:'Each pulse has area $x(k\\Delta)\\,\\Delta$. As $\\Delta\\to0$ the pulses become impulses of weight $x(\\tau)\\,\\d\\tau$.'},
    {t:'legend', items:[['in','$x(\\tau)$'],['mid','$\\text{pulses of width }\\Delta$']]}
  ], right:[
    {t:'eq', tex:'x(t)=\\int_{-\\infty}^{\\infty}x(\\tau)\\,\\delta(t-\\tau)\\,\\d\\tau', label:'Represent the input',
      note:'This is sifting with the names changed, and $\\delta(\\tau-t)=\\delta(t-\\tau)$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'\\begin{aligned}y(t)&=\\int x(\\tau)\\,S\\bigl\\{\\delta(t-\\tau)\\bigr\\}\\,\\d\\tau\\\\&=\\int_{-\\infty}^{\\infty}x(\\tau)\\,h(t-\\tau)\\,\\d\\tau=x(t)*h(t)\\end{aligned}', label:'Convolution integral',
        note:'Apply $S$ to both sides. Linearity takes the integral and the weight $x(\\tau)$ outside $S$. Time invariance gives $h(t-\\tau)$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'$h(t)=\\delta(t-2)$.<div class="nsep"></div>What is $x(t)*h(t)$?',
        ask:{key:'m3-convint', choices:['$x(t-2)$','$x(t+2)$','$x(2)$'], answer:0,
          why:'Sifting keeps only $\\tau=t-2$, so the system is a delay by 2.'}}]}
  ]}
]},

{ id:'m3-convint-b', module:'M3', nav:'The second form', title:'The Second Form of the Integral', src:'pp. 17–18',
  objective:'Derive the second form by substitution and build a reversed argument in the right order.',
  keywords:'convolution integral commutative substitution sigma reversal shift delta(-t+5)', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 3 · The convolution integral', src:'pp. 17–18'},
  {t:'title', text:'The Second Form of the Integral'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$v(t)=\\delta(t+5)$','$v(-t)=\\delta(-t+5)$']},
      svg:v=>{
      /* the reversal mirrors the impulse about t = 0, from -5 to +5 */
      const f=cl(v?v.frame:0), p=-5*(1-2*f);
      const a=P.Axes({w:560,h:380,xr:[-8,8],yr:[-0.25,1.5],xlabel:'t',ylabel:'\\text{amplitude}',pad:{l:48,r:24,t:20,b:34},xtarget:9,ytarget:3});
      a.impulse(p,1,{color:C.mid,labelText:'1'});
      a.note(p,1.3,f<0.5?'\\delta(t+5)':'\\delta(-t+5)',{anchor:'middle',color:C.mid,fs:16,tex:true});
      return a.svg(); },
      caption:'Shift first, then reverse. The impulse of $\\delta(-t+5)$ sits at $t=+5$, not at $t=-5$.'}
  ], right:[
    {t:'eq', tex:'\\begin{aligned}\\int_{-\\infty}^{\\infty}x(\\tau)\\,h(t-\\tau)\\,\\d\\tau&=\\int_{+\\infty}^{-\\infty}x(t-\\sigma)\\,h(\\sigma)\\,(-\\d\\sigma)\\\\&=\\int_{-\\infty}^{\\infty}h(\\sigma)\\,x(t-\\sigma)\\,\\d\\sigma\\end{aligned}', label:'Substitute $\\sigma=t-\\tau$',
      note:'The limits swap, and $\\d\\tau=-\\d\\sigma$ swaps them back. So $x*h=h*x$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'Shift, then reverse', html:'For $\\delta(-t+5)$, first form $v(t)=\\delta(t+5)$, then $v(-t)$. Writing both moves prevents a sign error in the limits.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'The impulse $\\delta(3-t)$.<div class="nsep"></div>Where is it?',
        ask:{key:'m3-convint-b', choices:['$t=3$','$t=-3$'], answer:0,
          why:'The argument $3-t$ is zero at $t=3$.'}}]}
  ]}
]},

{ id:'m3-ex-ct1', module:'M3', nav:'Worked example · limits from the overlap', title:'Limits from the Overlap', src:'pp. 18–19',
  objective:'Read the limits of both cases of the exponential and step example off the overlap.',
  keywords:'continuous convolution example e^{2t}u(-t) u(t-3) cases limits overlap', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 3 · Worked example', src:'pp. 18–19'},
  {t:'title', text:'Limits from the Overlap'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'t', label:'$t$', min:-2, max:6, step:0.25, v:1.5, show:v=>'$'+num(v)+'$'}]},
      svg:v=>{
      const t=v?v.t:1.5, e=t-3, hi=Math.min(0,e);
      const a=P.Axes({w:560,h:380,xr:[-5,7],yr:[-0.1,1.4],xlabel:'\\tau',ylabel:'\\text{amplitude}',pad:{l:50,r:24,t:22,b:34},xtarget:7,yticksOverride:[1]});
      a.area(z=>z<=hi?Math.exp(2*z):0,-5,hi,{color:'rgba(74,122,70,.22)'});
      a.curve(z=>z<=0?Math.exp(2*z):0,{color:C.in,n:1200});
      a.curve(z=>z<=e?1:0,{color:C.h,n:1200});
      a.vline(e,{color:C.coral,dash:'4 4'});
      a.note(e>-3?e-0.15:e+0.15,1.25,'\\tau=t-3',{anchor:e>-3?'end':'start',color:C.coral,fs:15,tex:true});
      return a.svg(); },
      caption:'Drag $t$ and watch the edge $\\tau=t-3$ of $h(t-\\tau)$. The shaded area is $y(t)$.'},
    {t:'legend', items:[['in','$x(\\tau)$'],['h','$h(t-\\tau)$']]}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x(t)=e^{2t}u(-t)$ and $h(t)=u(t-3)$.<div class="nsep"></div>At which $t$ does the upper limit of the integral change?',
      ask:{key:'m3-ex-ct1', choices:['$t=0$','$t=3$','$t=-3$'], answer:1}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'<ol class="steps"><li>$x(\\tau)\\neq0$ for $\\tau\\le0$.</li><li>$h(t-\\tau)\\neq0$ for $\\tau\\le t-3$.</li><li>The overlap ends at $\\min(0,\\,t-3)$.</li></ol>'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'y(t)=\\int_{-\\infty}^{t-3}e^{2\\tau}\\,\\d\\tau=\\Bigl[\\tfrac12e^{2\\tau}\\Bigr]_{-\\infty}^{t-3}=\\tfrac12e^{2(t-3)}', label:'Case I · $t<3$'}]},
    {t:'reveal', at:3, items:[
      {t:'eq', tex:'y(t)=\\int_{-\\infty}^{0}e^{2\\tau}\\,\\d\\tau=\\Bigl[\\tfrac12e^{2\\tau}\\Bigr]_{-\\infty}^{0}=\\tfrac12', label:'Case II · $t>3$'}]}
  ]}
]},

{ id:'m3-ex-ct1-b', module:'M3', nav:'Worked example · the two branches', title:'Assembling the Two Branches', src:'pp. 18–19',
  objective:'Assemble the two cases into one answer and check it.',
  keywords:'continuous convolution solution continuity final value delayed integrator', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 3 · Worked example', src:'pp. 18–19'},
  {t:'title', text:'Assembling the Two Branches'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, sketch:{label:'Sketch $y(t)$ on the axes, then check it.'}, svg:()=>{
      const a=P.Axes({w:560,h:380,xr:[-3,7],yr:[-0.1,1.2],xlabel:'t',ylabel:'y(t)',pad:{l:50,r:24,t:20,b:34},xtarget:11,ytarget:3});
      skArea(a);
      a.curve(t=>t<=0?Math.exp(2*t):0,{color:C.ink,opacity:.35,dash:'6 5',n:1200});
      a.note(-0.2,1.05,'x(t)',{anchor:'end',color:C.ink,fs:15,tex:true});
      a.raw('<g class="sk-key">');
      a.curve(t=>t<3?0.5*Math.exp(2*(t-3)):0.5,{color:C.out,n:1200});
      a.point(3,0.5,{color:C.coral});
      a.note(6.7,0.62,'y(t)',{anchor:'end',color:C.out,fs:15,tex:true});
      a.raw('</g>');
      return a.svg(); },
      caption:'The dashed trace is $x(t)$. Sketch $y(t)$ from the two cases, then show the answer.'}
  ], right:[
    {t:'eq', tex:'y(t)=\\begin{cases}\\tfrac12\\,e^{2(t-3)},& t<3\\\\[2pt] \\tfrac12,& t>3\\end{cases}', label:'Solution'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Check', html:'Both branches give $\\tfrac12$ at $t=3$. The final value is the area of $x$: $\\int_{-\\infty}^{0}e^{2\\tau}\\,\\d\\tau=\\tfrac12$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'A delayed integrator', html:'The delayed step adds up the area of $x$ until $t-3$. After $t=3$ it holds all of it, so the output stays at $\\tfrac12$.'}]}
  ]}
]},

{ id:'m3-ex-ct2', module:'M3', nav:'Worked example · a moving window', title:'A Window Across a Ramp', src:'pp. 19–20',
  objective:'Set up the rectangle and ramp example and find every case boundary.',
  keywords:'piecewise convolution rectangle ramp window boundaries cases', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 3 · Worked example', src:'pp. 19–20'},
  {t:'title', text:'A Window Across a Ramp'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'t', label:'$t$', min:-0.5, max:3.5, step:0.05, v:1.5, show:v=>'$'+num(v)+'$'}]},
      svg:v=>{
      const t=v?v.t:1.5, lo=Math.max(0,t-1), hi=Math.min(2,t);
      const a=P.Axes({w:560,h:380,xr:[-1.5,4],yr:[-0.15,2.4],xlabel:'\\tau',ylabel:'\\text{amplitude}',pad:{l:50,r:24,t:20,b:34},xtarget:7,ytarget:3});
      if(hi>lo) a.area(z=>z,lo,hi,{color:'rgba(74,122,70,.22)'});
      a.curve(z=>(z>0&&z<2)?z:0,{color:C.h,n:1200});
      a.curve(z=>(z>t-1&&z<t)?1:0,{color:C.in,n:1200});
      return a.svg(); },
      caption:'Drag $t$. The window $t-1<\\tau<t$ moves across the ramp, and the shaded area is $y(t)$.'},
    {t:'legend', items:[['h','$h(\\tau)$'],['in','$x(t-\\tau)$']]}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x(t)=1$ on $0<t<1$ and $h(t)=t$ on $0<t<2$, both zero elsewhere.<div class="nsep"></div>At which $t$ is $y(t)$ largest?',
      ask:{key:'m3-ex-ct2', choices:['$t=1$','$t=2$','$t=3$'], answer:1}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'Use $y(t)=\\int h(\\tau)\\,x(t-\\tau)\\,\\d\\tau$ and reverse the rectangle. Its support is the window $t-1<\\tau<t$.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'\\begin{aligned}t-1=0&\\;\\Rightarrow\\;t=1, & t=0&\\;\\Rightarrow\\;t=0\\\\t-1=2&\\;\\Rightarrow\\;t=3, & t=2&\\;\\Rightarrow\\;t=2\\end{aligned}', label:'Case boundaries',
        note:'Set each moving edge equal to each fixed edge. The values $t=0,1,2,3$ give five cases.'}]}
  ]}
]},

{ id:'m3-ex-ct2-b', module:'M3', nav:'Worked example · five cases', title:'The Five Cases', src:'pp. 19–20',
  objective:'Evaluate the integral in each case of the rectangle and ramp example.',
  keywords:'piecewise convolution five cases integral limits antiderivative', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 3 · Worked example', src:'pp. 19–20'},
  {t:'title', text:'The Five Cases'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$0<t<1$','$1<t<2$','$2<t<3$']},
      svg:v=>{
      const t=0.6+0.95*(v?v.frame:0), lo=Math.max(0,t-1), hi=Math.min(2,t);
      const a=P.Axes({w:560,h:380,xr:[-1.5,4],yr:[-0.15,2.4],xlabel:'\\tau',ylabel:'\\text{amplitude}',pad:{l:50,r:24,t:20,b:34},xtarget:7,ytarget:3});
      if(hi>lo) a.area(z=>z,lo,hi,{color:'rgba(74,122,70,.22)'});
      a.curve(z=>(z>0&&z<2)?z:0,{color:C.h,n:1200});
      a.curve(z=>(z>t-1&&z<t)?1:0,{color:C.in,n:1200});
      return a.svg(); },
      caption:'Step through the three overlapping cases. The shaded region is the interval of integration.'},
    {t:'legend', items:[['h','$h(\\tau)$'],['in','$x(t-\\tau)$']]}
  ], right:[
    {t:'note', kind:'def', head:'No overlap', html:'For $t<0$ and for $t>3$ the window misses the ramp, so $y(t)=0$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'y(t)=\\int_{0}^{t}\\tau\\,\\d\\tau=\\Bigl[\\tfrac12\\tau^{2}\\Bigr]_{0}^{t}=\\tfrac12t^{2}', label:'Case II · $0<t<1$'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'\\begin{aligned}y(t)&=\\int_{t-1}^{t}\\tau\\,\\d\\tau=\\tfrac12t^{2}-\\tfrac12(t-1)^{2}\\\\&=t-\\tfrac12\\end{aligned}', label:'Case III · $1<t<2$'}]},
    {t:'reveal', at:3, items:[
      {t:'eq', tex:'\\begin{aligned}y(t)&=\\int_{t-1}^{2}\\tau\\,\\d\\tau=2-\\tfrac12(t-1)^{2}\\\\&=-\\tfrac12t^{2}+t+\\tfrac32\\end{aligned}', label:'Case IV · $2<t<3$'}]}
  ]}
]},

{ id:'m3-ex-ct2-c', module:'M3', nav:'Worked example · the result', title:'Assembling the Five Cases', src:'pp. 19–20',
  objective:'Assemble the five cases and check continuity, support and area.',
  keywords:'piecewise convolution solution continuity support area moving integral', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 3 · Worked example', src:'pp. 19–20'},
  {t:'title', text:'Assembling the Five Cases'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, sketch:{label:'Sketch $y(t)$ on the axes, then check it.'}, svg:()=>{
      const a=P.Axes({w:560,h:380,xr:[-0.5,3.6],yr:[-0.15,2.3],xlabel:'t',ylabel:'y(t)',pad:{l:50,r:24,t:20,b:34},xtarget:9,ytarget:3});
      skArea(a);
      a.curve(t=>(t>0&&t<2)?t:0,{color:C.ink,opacity:.35,dash:'6 5',n:1200});
      a.note(0.9,1.3,'h(t)',{anchor:'end',color:C.ink,fs:15,tex:true});
      a.raw('<g class="sk-key">');
      a.curve(t=> t<0?0 : t<1?0.5*t*t : t<2?t-0.5 : t<3?(-0.5*t*t+t+1.5) : 0,{color:C.out,n:1400});
      [1,2,3].forEach(b=>a.vline(b,{color:C.out,opacity:.5}));
      a.point(2,1.5,{color:C.coral});
      a.note(3.5,1.9,'y(t)',{anchor:'end',color:C.out,fs:15,tex:true});
      a.raw('</g>');
      return a.svg(); },
      caption:'The dashed trace is $h(t)$. Sketch $y(t)$ from the five cases, then show the answer.'}
  ], right:[
    {t:'eq', tex:'y(t)=\\begin{cases}0,&t<0\\\\ \\tfrac12t^{2},&0<t<1\\\\ t-\\tfrac12,&1<t<2\\\\ -\\tfrac12t^{2}+t+\\tfrac32,&2<t<3\\\\ 0,&t>3\\end{cases}', label:'Solution'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Check', html:'The branches agree at $t=1,2,3$, where they give $\\tfrac12$, $\\tfrac32$ and $0$. The areas add to $\\tfrac16+1+\\tfrac56=2=\\bigl(\\int x\\bigr)\\bigl(\\int h\\bigr)$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'A moving integral', html:'A unit-width rectangle adds up one second of the input. The output rises while the window fills, and falls as the window leaves the ramp.'},
      {t:'instr', head:'Exercise', html:'Repeat with $x(t)=1$ on $0<t<3$ and the same $h$. The window is now <em>wider</em> than the ramp, which changes the middle case. That tests whether the boundary list was understood rather than memorised.'}]}
  ]}
]},

REAL_CONVINT,

{ id:'m3-lab-n', module:'M3', nav:'Laboratory {lab} · Convolution integral', title:'Laboratory {lab} — Convolution Integral, Step by Step', src:'pp. 17–20',
  objective:'Watch the overlap set the limits of the convolution integral.',
  slide:true, keywords:'laboratory convolution integral overlap limits cases', steps:0, blocks:[
  {t:'eyebrow', text:'Interactive laboratory', src:'pp. 17–20'},
  {t:'title', text:'Laboratory {lab} · Convolution Integral'},
  {t:'lab', id:'N'}
]},

{ id:'m3-code-convint', module:'M3', nav:'Code · Convolution integral', title:'Convolution Integral in Code', src:'pp. 17–20',
  objective:'Approximate convolution integrals by sums in MATLAB and in Python, and predict each result before running it.',
  keywords:'code matlab python convolution integral riemann sum step size area rule run',
  slide:true, steps:0, budget:'a code page: the program draws its own figure', blocks:[
  {t:'eyebrow', text:'Module 3 · The convolution integral in code', src:'pp. 17–20'},
  {t:'title', text:'Convolution Integral in Code'},
  {t:'raw', html:()=>CODEBANK.page('m3-code-convint')}
]},

/* ================================================== 3.4 properties of convolution */

{ id:'m3-props', module:'M3', nav:'Commutative and distributive', title:'Commutative and Distributive', src:'p. 20',
  objective:'State commutativity and distributivity and read the second as a parallel connection.',
  keywords:'commutative distributive parallel interconnection sum of impulse responses', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 3 · Properties of convolution', src:'p. 20'},
  {t:'title', text:'Commutative and Distributive'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>P.blocks({w:560,h:400,items:[
      {t:'arrow',x1:20,y1:110,x2:110,y2:110},
      {t:'line',d:'M110 110 v-55 h40 M110 110 v55 h40'},
      {t:'box',x:150,y:33,w:120,h:44,label:'h_1',tex:true},{t:'box',x:150,y:143,w:120,h:44,label:'h_2',tex:true},
      {t:'line',d:'M270 55 h70 v41 M270 165 h70 v-41'},
      {t:'sum',x:340,y:110},
      {t:'arrow',x1:354,y1:110,x2:450,y2:110},
      {t:'text',x:60,y:96,label:'x',tex:true,fs:17},{t:'text',x:410,y:96,label:'y',tex:true,fs:17},
      {t:'text',x:280,y:240,label:'\\equiv',tex:true,fs:26},
      {t:'arrow',x1:60,y1:320,x2:190,y2:320},
      {t:'box',x:190,y:296,w:150,h:48,label:'h_1+h_2',tex:true},
      {t:'arrow',x1:340,y1:320,x2:470,y2:320},
      {t:'text',x:120,y:306,label:'x',tex:true,fs:17},{t:'text',x:410,y:306,label:'y',tex:true,fs:17}
    ]}), caption:'Two systems in parallel, with their outputs added, act as one system with impulse response $h_1+h_2$.'}
  ], right:[
    {t:'eq', side:true, tex:'x*h=h*x', label:'Commutative',
      note:'The input and the impulse response play the same role in the algebra.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'\\begin{aligned}x*(h_1+h_2)&=\\sum_k x[k]\\bigl(h_1[n-k]+h_2[n-k]\\bigr)\\\\&=x*h_1+x*h_2\\end{aligned}', label:'Distributive',
        note:'Split the sum term by term. The same step works for the integral.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'$h_1[n]=\\delta[n]$ and $h_2[n]=\\delta[n-1]$ are connected in parallel.<div class="nsep"></div>What is the combined impulse response?',
        ask:{key:'m3-props', choices:['$\\delta[n]+\\delta[n-1]$','$\\delta[n-1]$','$\\delta[n]\\,\\delta[n-1]$'], answer:0,
          why:'Parallel paths add their impulse responses.'}}]}
  ]}
]},

{ id:'m3-props-b', module:'M3', nav:'Cascades and inverses', title:'Cascades and Inverses', src:'pp. 20–21',
  objective:'State associativity, read it as a cascade, and define the inverse system.',
  keywords:'associative cascade series interconnection order inverse system h*g=delta', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 3 · Properties of convolution', src:'pp. 20–21'},
  {t:'title', text:'Cascades and Inverses'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>P.blocks({w:560,h:420,items:[
      {t:'arrow',x1:20,y1:110,x2:110,y2:110},{t:'box',x:110,y:86,w:100,h:48,label:'h_1',tex:true},
      {t:'arrow',x1:210,y1:110,x2:300,y2:110},{t:'box',x:300,y:86,w:100,h:48,label:'h_2',tex:true},
      {t:'arrow',x1:400,y1:110,x2:490,y2:110},
      {t:'text',x:60,y:96,label:'x',tex:true,fs:17},{t:'text',x:255,y:96,label:'w',tex:true,fs:17},{t:'text',x:450,y:96,label:'y',tex:true,fs:17},
      {t:'text',x:280,y:220,label:'\\equiv',tex:true,fs:26},
      {t:'arrow',x1:60,y1:320,x2:190,y2:320},
      {t:'box',x:190,y:296,w:150,h:48,label:'h_1*h_2',tex:true},
      {t:'arrow',x1:340,y1:320,x2:470,y2:320},
      {t:'text',x:120,y:306,label:'x',tex:true,fs:17},{t:'text',x:410,y:306,label:'y',tex:true,fs:17}
    ]}), caption:'Two systems in cascade act as one system with impulse response $h_1*h_2$.'}
  ], right:[
    {t:'eq', key:true, tex:'x*(h_1*h_2)=(x*h_1)*h_2', label:'Associative',
      note:'With commutativity, the order of two LTI systems in cascade does not matter.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'err', head:'LTI systems only', html:'A saturating amplifier followed by a filter is not the filter followed by the amplifier. Reordering needs both systems to be LTI.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', side:true, tex:'h*g=\\delta', label:'Inverse system',
        note:'$g$ undoes $h$: the cascade returns the input unchanged.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$h_1[n]=\\delta[n]-\\delta[n-1]$ and $h_2[n]=u[n]$ are in cascade.<div class="nsep"></div>What is $h_1*h_2$?',
        ask:{key:'m3-props-b', choices:['$\\delta[n]$','$u[n]$','$\\delta[n-1]$'], answer:0,
          why:'$u[n]-u[n-1]=\\delta[n]$, so the two systems are inverses of each other.'}}]}
  ]}
]},

{ id:'m3-lti-props', module:'M3', nav:'Memory and causality from h', title:'Memory and Causality from h', src:'p. 21',
  objective:'Give the impulse-response tests for a memoryless and for a causal LTI system.',
  keywords:'LTI memoryless causal impulse response criterion h=a delta h=0 for n<0', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 3 · Properties of LTI systems', src:'p. 21'},
  {t:'title', text:'Memory and Causality from $h$'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=P.Axes({w:560,h:380,xr:[-6,9],yr:[-0.3,1.5],xlabel:'n',ylabel:'h[n]',pad:{l:50,r:24,t:20,b:34},xtarget:8,ytarget:3});
      a.rect(-6,-0.3,-0.5,1.5,{fill:'rgba(166,59,42,.08)'});
      a.stem(disc(n=>n>=0?Math.pow(0.7,n):0,-6,9),{color:C.h});
      a.note(-3.25,1.25,'\\text{zero for a causal }h',{anchor:'middle',color:C.err,fs:15,tex:true});
      return a.svg(); },
      caption:'$h[n]=0.7^{\\,n}u[n]$ is zero for every $n<0$, so the system is causal. It is not memoryless.'}
  ], right:[
    {t:'eq', tex:'y[n]=\\sum_k x[k]\\,a\\,\\delta[n-k]=a\\,x[n]', label:'Memoryless · $h[n]=a\\,\\delta[n]$',
      note:'A non-zero $h$ away from $n=0$ reads another time. In continuous time the test is $h(t)=a\\,\\delta(t)$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\begin{aligned}y[n]&=\\sum_{k=0}^{\\infty}h[k]\\,x[n-k]\\\\&=h[0]x[n]+h[1]x[n-1]+\\cdots\\end{aligned}', label:'Causal · $h[n]=0$ for $n<0$',
        note:'Every input index $n-k$ is at most $n$. In continuous time the test is $h(t)=0$ for $t<0$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'$h[n]=\\delta[n+1]$.<div class="nsep"></div>Is the system causal?',
        ask:{key:'m3-lti-props', choices:['Causal','Not causal'], answer:1,
          why:'$h[-1]=1\\neq0$. The output is $y[n]=x[n+1]$, a future sample.'}}]}
  ]}
]},

{ id:'m3-lti-stable', module:'M3', nav:'Stability from h', title:'Stability from h', src:'p. 21',
  objective:'State the stability test in h and prove that it is sufficient.',
  keywords:'BIBO stable absolutely summable integrable triangle inequality sufficiency', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 3 · Properties of LTI systems', src:'p. 21'},
  {t:'title', text:'Stability from $h$'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=P.Axes({w:560,h:380,xr:[-1,12],yr:[0,18],xlabel:'N',ylabel:'S_N',pad:{l:52,r:24,t:20,b:34},xtarget:8,ytarget:4});
      a.stem(disc(N=>N+1,0,12),{color:C.err,r:3});
      a.stem(disc(N=>(1-Math.pow(0.7,N+1))/0.3,0,12),{color:C.out});
      a.hline(10/3,{color:C.coral,dash:'4 4'});
      a.note(1.5,4.25,'\\tfrac{10}{3}',{anchor:'middle',color:C.coral,fs:16,tex:true});
      return a.svg(); },
      caption:'The partial sums $S_N=\\sum_{k=0}^{N}|h[k]|$ of $0.7^{\\,k}$ settle at $10/3$. Those of $u[k]$ grow without bound.'},
    {t:'legend', items:[['out','$h=0.7^{\\,n}u[n]$'],['err','$h=u[n]$']]}
  ], right:[
    {t:'eq', key:true, side:true, tex:'\\sum_{k=-\\infty}^{\\infty}\\bigl|h[k]\\bigr|<\\infty', label:'BIBO stable · the test',
      note:'$h$ must be absolutely summable. In continuous time, $\\int|h(t)|\\,\\d t<\\infty$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\begin{aligned}|y[n]|&=\\Bigl|\\sum_k h[k]\\,x[n-k]\\Bigr|\\\\&\\le\\sum_k|h[k]|\\,|x[n-k]|\\\\&\\le B\\sum_k|h[k]|<\\infty\\end{aligned}', label:'Why it is enough',
        note:'The triangle inequality gives the second line, and $|x|\\le B$ gives the third.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'$h[n]=\\left(-\\tfrac12\\right)^{n}u[n]$.<div class="nsep"></div>Is the system BIBO stable?',
        ask:{key:'m3-lti-stable', choices:['Stable','Not stable'], answer:0,
          why:'$\\sum_{n\\ge0}\\left(\\tfrac12\\right)^{n}=2<\\infty$.'}}]}
  ]}
]},

{ id:'m3-lti-stable-b', module:'M3', nav:'Why the test is needed', title:'A Bounded Input That Reaches the Sum', src:'p. 21',
  objective:'Prove that absolute summability of h is also necessary for BIBO stability.',
  keywords:'BIBO stability necessity sign input sgn h[-n] unbounded y[0]', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 3 · Properties of LTI systems', src:'p. 21'},
  {t:'title', text:'A Bounded Input That Reaches the Sum'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$h[n]=(-0.8)^{n}u[n]$','$x[n]=\\operatorname{sgn}h[-n]$']},
      svg:v=>{
      /* frame 0 is h; going to frame 1 lowers h and raises the sign input,
         which is h reversed in time with every sample set to +1 or -1 */
      const f=cl(v?v.frame:0), h=n=>n>=0?Math.pow(-0.8,n):0, sg=n=>n<=0?Math.sign(h(-n)):0;
      const a=P.Axes({w:560,h:380,xr:[-8,8],yr:[-1.3,1.45],xlabel:'n',ylabel:'\\text{amplitude}',pad:{l:50,r:24,t:20,b:34},xtarget:9,ytarget:3});
      if(f<1) fade(a,1-f,()=>a.stem(disc(h,-8,8),{color:C.h}));
      if(f>0) fade(a,f,()=>a.stem(disc(sg,-8,8),{color:C.in}));
      return a.svg(); },
      caption:'The input copies only the sign of $h$, reversed in time. It never exceeds 1.'},
    {t:'legend', items:[['h','$h[n]$'],['in','$x[n]$']]}
  ], right:[
    {t:'eq', tex:'x[n]=\\operatorname{sgn}h[-n],\\qquad |x[n]|\\le1', label:'Choose the input',
      note:'$\\operatorname{sgn}$ is $+1$ for a positive argument, $-1$ for a negative one and $0$ at zero.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\begin{aligned}y[0]&=\\sum_k h[k]\\,x[-k]\\\\&=\\sum_k h[k]\\operatorname{sgn}h[k]\\\\&=\\sum_k\\bigl|h[k]\\bigr|\\end{aligned}', label:'Evaluate at $n=0$',
        note:'If $\\sum|h|$ diverges, this bounded input gives an unbounded output, so the test is also necessary.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'$h[n]=(-0.8)^{n}u[n]$ and $x[n]=\\operatorname{sgn}h[-n]$.<div class="nsep"></div>What is $y[0]$?',
        ask:{key:'m3-lti-stable-b', choices:['$5$','$1$','$-5$'], answer:0,
          why:'$y[0]=\\sum_{k\\ge0}0.8^{k}=\\frac{1}{1-0.8}=5$.'}}]}
  ]}
]},

{ id:'m3-step', module:'M3', nav:'Step response', title:'The Step Response', src:'—',
  objective:'Define the step response, and recover h from it by a difference or a derivative.',
  keywords:'step response s=h*u running sum running integral first difference derivative measure h', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 3 · Properties of LTI systems', src:'—'},
  {t:'title', text:'The Step Response'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'t', label:'$t$', min:0, max:4, step:0.25, v:1, show:v=>'$'+num(v)+'$'}]},
      svg:v=>{
      const t=v?v.t:1, h=z=>z>=0?Math.exp(-z):0, s=z=>z>=0?1-Math.exp(-z):0;
      const a=P.Axes({w:560,h:380,xr:[-1,4.5],yr:[-0.1,1.3],xlabel:'t',ylabel:'\\text{amplitude}',pad:{l:50,r:24,t:20,b:34},xtarget:6,ytarget:3});
      if(t>0) a.area(h,0,t,{color:'rgba(74,122,70,.22)'});
      a.curve(h,{color:C.h,n:1200});
      a.curve(s,{color:C.out,n:1200});
      a.vline(t,{color:C.coral,dash:'4 4'});
      a.point(t,s(t),{color:C.out});
      return a.svg(); },
      caption:'Drag $t$. The shaded area under $h$ is the height of $s(t)$: $\\int_0^{t}e^{-\\tau}\\,\\d\\tau=1-e^{-t}$ for $t>0$.'},
    {t:'legend', items:[['h','$h(t)=e^{-t}u(t)$'],['out','$s(t)$']]}
  ], right:[
    {t:'eq', tex:'s(t)=\\int_{-\\infty}^{\\infty}h(\\tau)\\,u(t-\\tau)\\,\\d\\tau=\\int_{-\\infty}^{t}h(\\tau)\\,\\d\\tau', label:'Step response · $s=h*u$',
      note:'$u(t-\\tau)=1$ for $\\tau<t$ and $0$ after, so $s(t)$ is the area of $h$ up to $t$. In discrete time, $s[n]=\\sum_{k=-\\infty}^{n}h[k]$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'h(t)=\\frac{\\d s(t)}{\\d t},\\qquad h[n]=s[n]-s[n-1]', label:'Back to $h$',
        note:'The derivative undoes the running integral, and the first difference undoes the running sum. A step is easier to apply than an impulse, so $h$ is often measured this way.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'$h[n]=\\delta[n]-\\delta[n-2]$.<div class="nsep"></div>What is the step response $s[n]$?',
        ask:{key:'m3-step', choices:['$\\delta[n]+\\delta[n-1]$','$u[n]$','$\\delta[n]-\\delta[n-1]$'], answer:0,
          why:'The running sum is $1$ at $n=0$ and at $n=1$, then $1-1=0$ from $n=2$ on.'}}]}
  ]}
]},

{ id:'m3-singular', module:'M3', nav:'Integrator and differentiator', title:'The Integrator and the Differentiator', src:'—',
  objective:'Write the integrator and the differentiator as LTI systems, with impulse responses u(t) and the unit doublet.',
  keywords:'integrator differentiator unit doublet u1 singularity function derivative of delta inverse system u*u1=delta', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 3 · Properties of LTI systems', src:'—'},
  {t:'title', text:'The Integrator and the Differentiator'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>P.blocks({w:560,h:360,items:[
      {t:'text',x:235,y:70,label:'integrator',fs:15},
      {t:'arrow',x1:24,y1:120,x2:170,y2:120},{t:'box',x:170,y:92,w:130,h:56,label:'h(t)=u(t)',tex:true},
      {t:'arrow',x1:300,y1:120,x2:536,y2:120},
      {t:'text',x:97,y:104,label:'x(t)',tex:true,fs:17},
      {t:'text',x:418,y:100,label:'\\int_{-\\infty}^{t}x(\\tau)\\,\\d\\tau',tex:true,fs:16},
      {t:'text',x:235,y:230,label:'differentiator',fs:15},
      {t:'arrow',x1:24,y1:280,x2:170,y2:280},{t:'box',x:170,y:252,w:130,h:56,label:'h(t)=u_1(t)',tex:true},
      {t:'arrow',x1:300,y1:280,x2:536,y2:280},
      {t:'text',x:97,y:264,label:'x(t)',tex:true,fs:17},
      {t:'text',x:418,y:264,label:'x^{\\prime}(t)',tex:true,fs:17}
    ]}), caption:'Two LTI systems. Each is fixed by its impulse response, as every LTI system is.'}
  ], right:[
    {t:'eq', tex:'\\int_{-\\infty}^{t}x(\\tau)\\,\\d\\tau=x(t)*u(t)', label:'Integrator',
      note:'Put $x=\\delta$: the running integral of $\\delta(t)$ is $u(t)$, so $h=u$. The step response $s=h*u$ is $h$ passed through an integrator.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\frac{\\d x(t)}{\\d t}=x(t)*u_1(t),\\qquad u_1(t)=\\frac{\\d\\delta(t)}{\\d t}', label:'Differentiator · the unit doublet',
        note:'$u_1$ is called the unit doublet. Like $\\delta$, it is defined by what it does under convolution, not by its values.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'An LTI system has $h(t)=u_1(t)$. The input is $x(t)=u(t)$.<div class="nsep"></div>What is the output?',
        ask:{key:'m3-singular', choices:['$\\delta(t)$','$u(t)$','$t\\,u(t)$'], answer:0,
          why:'The derivative of the step is the impulse, so $u*u_1=\\delta$: the differentiator undoes the integrator.'}}]}
  ]}
]},

REAL_PROPS,

{ id:'m3-lab-o', module:'M3', nav:'Laboratory {lab} · Properties from h', title:'Laboratory {lab} — System Properties from h', src:'p. 21',
  objective:'Predict memory, causality and stability from the impulse response.',
  slide:true, keywords:'laboratory impulse response memoryless causal stable absolutely summable', steps:0, blocks:[
  {t:'eyebrow', text:'Interactive laboratory', src:'p. 21'},
  {t:'title', text:'Laboratory {lab} · Properties from $h$'},
  {t:'lab', id:'O'}
]},

{ id:'m3-code-props', module:'M3', nav:'Code · Properties', title:'Convolution Properties in Code', src:'pp. 20–21',
  objective:'Check commutativity, parallel and cascade connections and stability in MATLAB and in Python, and predict each result before running it.',
  keywords:'code matlab python commutative parallel cascade inverse stability partial sums run',
  slide:true, steps:0, budget:'a code page: the program draws its own figure', blocks:[
  {t:'eyebrow', text:'Module 3 · Properties in code', src:'pp. 20–21'},
  {t:'title', text:'Convolution Properties in Code'},
  {t:'raw', html:()=>CODEBANK.page('m3-code-props')}
]},

/* ========================== 3.5 difference and differential equations */

{ id:'m3-diffeq', module:'M3', nav:'Difference equations', title:'A System Given by a Difference Equation', src:'—',
  objective:'Read a linear constant-coefficient difference equation as a system, state initial rest, and find h by recursion.',
  keywords:'difference equation linear constant coefficient recursion initial rest causal LTI impulse response iterate', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 3 · Difference and differential equations', src:'—'},
  {t:'title', text:'A System Given by a Difference Equation'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$h[n]=\\left(\\tfrac12\\right)^{n}u[n]$','$h[0]=\\tfrac12\\,h[-1]+1$','$h[1]=\\tfrac12\\,h[0]$','$h[2]=\\tfrac12\\,h[1]$','$h[3]=\\tfrac12\\,h[2]$']},
      svg:v=>{
      /* Frame 0 is the whole impulse response. Frame k (k >= 1) computes
         h[k-1]: the new sample is violet, the one it is computed from keeps
         the h colour, the samples not yet computed are faint. */
      const k=v?Math.round(v.frame):0, cur=k-1, h=n=>n>=0?Math.pow(0.5,n):0;
      const a=P.Axes({w:560,h:380,xr:[-2.5,8.5],yr:[-0.15,1.35],xlabel:'n',ylabel:'h[n]',pad:{l:50,r:24,t:20,b:34},xtarget:11,ytarget:3});
      if(k===0){ a.stem(disc(h,-2,8),{color:C.h}); return a.svg(); }
      fade(a,0.3,()=>a.stem(disc(n=>n>cur?h(n):0,cur+1,8),{color:C.h}));
      a.stem(disc(h,-2,cur-1),{color:C.h});
      a.stem([[cur,h(cur)]],{color:C.mid});
      a.note(cur,h(cur)+0.13,cur===0?'1':'\\tfrac12\\,h['+(cur-1)+']',{anchor:'middle',color:C.mid,fs:15,tex:true});
      return a.svg(); },
      caption:'Step through the frames. At rest $h[-1]=0$, and each new sample is half of the one before.'},
    {t:'legend', items:[['h','$h[n]$'],['mid','$\\text{sample being computed}$']]}
  ], right:[
    {t:'eq', tex:'\\sum_{k=0}^{N}a_k\\,y[n-k]=\\sum_{k=0}^{M}b_k\\,x[n-k]', label:'Difference equation',
      note:'The output at $n$ uses earlier outputs and inputs, so a starting condition is also needed.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Initial rest', html:'If $x[n]=0$ for $n<n_0$, take $y[n]=0$ for $n<n_0$. Then the system is causal and LTI. A non-zero start gives an output with no input, which a linear system cannot do.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'\\begin{aligned}h[n]&=\\tfrac12\\,h[n-1]+\\delta[n]\\\\h[0]&=\\tfrac12\\cdot0+1=1\\\\h[1]&=\\tfrac12\\cdot1+0=\\tfrac12\\\\h[n]&=\\left(\\tfrac12\\right)^{n},\\quad n\\ge0\\end{aligned}', label:'Impulse response by recursion',
        note:'Put $x=\\delta$ into $y[n]=\\tfrac12\\,y[n-1]+x[n]$ and start from $h[-1]=0$. For $n\\ge1$ each step halves the last sample.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$y[n]=-\\tfrac12\\,y[n-1]+x[n]$, at rest.<div class="nsep"></div>What is $h[2]$?',
        ask:{key:'m3-diffeq', choices:['$\\tfrac14$','$-\\tfrac14$','$-\\tfrac12$'], answer:0,
          why:'$h[0]=1$, $h[1]=-\\tfrac12$, and $h[2]=-\\tfrac12\\cdot\\left(-\\tfrac12\\right)=\\tfrac14$.'}}]}
  ]}
]},

{ id:'m3-fir-iir', module:'M3', nav:'Non-recursive and recursive', title:'Non-recursive and Recursive Equations', src:'—',
  objective:'Tell a finite impulse response from an infinite one by the form of the difference equation.',
  keywords:'non-recursive recursive FIR IIR finite infinite impulse response feedback coefficients stability |a|<1', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 3 · Difference and differential equations', src:'—'},
  {t:'title', text:'Non-recursive and Recursive Equations'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$h[n]=\\tfrac13\\bigl(\\delta[n]+\\delta[n-1]+\\delta[n-2]\\bigr)$','$h[n]=0.2\\,(0.8)^{n}u[n]$']},
      svg:v=>{
      /* frame 0 is the three-sample average; going to frame 1 lowers it and
         raises the recursive smoother, whose samples never end */
      const f=cl(v?v.frame:0);
      const a=P.Axes({w:560,h:380,xr:[-2.5,16.5],yr:[-0.05,0.45],xlabel:'n',ylabel:'h[n]',pad:{l:56,r:24,t:20,b:34},xtarget:10,ytarget:3});
      if(f<1) fade(a,1-f,()=>a.stem(disc(n=>(n>=0&&n<=2)?1/3:0,-2,16),{color:C.h}));
      if(f>0) fade(a,f,()=>a.stem(disc(n=>n>=0?0.2*Math.pow(0.8,n):0,-2,16),{color:C.out}));
      return a.svg(); },
      caption:'Both average the input. The non-recursive one stops after three samples. The recursive one feeds its output back and never stops.'},
    {t:'legend', items:[['h','$\\text{non-recursive}$'],['out','$\\text{recursive}$']]}
  ], right:[
    {t:'eq', tex:'y[n]=\\sum_{k=0}^{M}b_k\\,x[n-k]\\quad\\Rightarrow\\quad h[n]=b_n', label:'Non-recursive · finite $h$',
      note:'Put $x=\\delta$: each term $b_k\\,\\delta[n-k]$ places $b_k$ at $n=k$. So $h$ has at most $M+1$ samples, a finite impulse response (FIR).'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'y[n]=a\\,y[n-1]+b\\,x[n]\\quad\\Rightarrow\\quad h[n]=b\\,a^{n}u[n]', label:'Recursive · infinite $h$',
        note:'The output feeds back, so one impulse keeps producing samples: an infinite impulse response (IIR). It is BIBO stable exactly when $|a|<1$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'$y[n]=x[n]+2\\,x[n-1]-x[n-3]$.<div class="nsep"></div>How many non-zero samples does $h[n]$ have?',
        ask:{key:'m3-fir-iir', choices:['$3$','$4$','infinitely many'], answer:0,
          why:'$h[n]=\\delta[n]+2\\,\\delta[n-1]-\\delta[n-3]$, and $h[2]=0$.'}}]}
  ]}
]},

{ id:'m3-blockdiag', module:'M3', nav:'Block diagrams', title:'Block Diagrams', src:'—',
  objective:'Draw a first-order difference equation with an adder, a gain and a unit delay, and read the equation back.',
  keywords:'block diagram adder gain unit delay D feedback first order integrator continuous time accumulator', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 3 · Difference and differential equations', src:'—'},
  {t:'title', text:'Block Diagrams'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      /* x[n] -> gain b -> adder -> y[n]; y is tapped, delayed by D, scaled by a
         and fed back into the adder. The blocks helper draws right-pointing
         arrows only, so the three heads of the feedback path are added here. */
      const ink=C.ink, head=d=>`<path d="${d}" fill="${ink}"/>`;
      return P.blocks({w:560,h:300,items:[
        {t:'arrow',x1:30,y1:110,x2:110,y2:110},{t:'box',x:110,y:86,w:60,h:48,label:'b',tex:true},
        {t:'arrow',x1:170,y1:110,x2:236,y2:110},{t:'sum',x:250,y:110},
        {t:'arrow',x1:264,y1:110,x2:536,y2:110},
        {t:'line',d:'M420,110 V191'},{t:'box',x:390,y:200,w:60,h:48,label:'D',tex:true},
        {t:'line',d:'M390,224 H289'},{t:'box',x:220,y:200,w:60,h:48,label:'a',tex:true},
        {t:'line',d:'M250,200 V133'},
        {t:'text',x:62,y:94,label:'x[n]',tex:true,fs:17},
        {t:'text',x:203,y:94,label:'b\\,x[n]',tex:true,fs:15},
        {t:'text',x:480,y:94,label:'y[n]',tex:true,fs:17},
        {t:'text',x:335,y:212,label:'y[n-1]',tex:true,fs:15},
        {t:'text',x:262,y:170,label:'a\\,y[n-1]',tex:true,fs:15,anchor:'start'}
      ]}).replace('</svg>', head('M420,200 l-4.5,-9 h9 Z')+head('M280,224 l9,-4.5 v9 Z')+head('M250,124 l-4.5,9 h9 Z')
        +`<circle cx="420" cy="110" r="3.5" fill="${ink}"/></svg>`); },
      caption:'An adder, a gain and a unit delay $D$, which outputs its input one sample late.'}
  ], right:[
    {t:'eq', tex:'y[n]=\\underbrace{b\\,x[n]}_{\\text{forward path}}+\\underbrace{a\\,y[n-1]}_{\\text{feedback}}', label:'Read the diagram',
      note:'The adder output is $y[n]$. The delay holds it for one sample, and the gain $a$ sends it back to the adder.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Three blocks are enough', html:'Every linear constant-coefficient difference equation can be drawn with adders, gains and unit delays. The diagram is also a program: one pass of the loop per sample.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'In continuous time', html:'An integrator takes the place of the delay. For $y^{\\prime}(t)=b\\,x(t)-a\\,y(t)$, the integrator input is $b\\,x-a\\,y$ and its output is $y$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'In the diagram, $b=1$ and $a=1$.<div class="nsep"></div>What does the system compute?',
        ask:{key:'m3-blockdiag', choices:['a running sum','a one-sample delay','a gain of 2'], answer:0,
          why:'$y[n]=y[n-1]+x[n]$ adds each new input to the total so far, so $h[n]=u[n]$.'}}]}
  ]}
]},

{ id:'m3-diffeq-ct', module:'M3', nav:'Differential equations', title:'A First-Order Differential Equation', src:'—',
  objective:'Find the impulse and step responses of a first-order differential equation at rest, and check them by substitution.',
  keywords:'differential equation first order initial rest impulse response exponential step response check substitution RC', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 3 · Difference and differential equations', src:'—'},
  {t:'title', text:'A First-Order Differential Equation'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=P.Axes({w:560,h:380,xr:[-0.5,3.2],yr:[-0.08,1.18],xlabel:'t',ylabel:'\\text{amplitude}',pad:{l:50,r:24,t:20,b:34},xtarget:8,ytarget:3});
      a.hline(0.5,{color:C.coral,dash:'4 4'});
      a.curve(t=>t>=0?Math.exp(-2*t):0,{color:C.h,n:1200});
      a.curve(t=>t>=0?0.5*(1-Math.exp(-2*t)):0,{color:C.out,n:1200});
      return a.svg(); },
      caption:'The impulse response jumps to 1 and decays. The step response rises from 0 and settles at $\\tfrac12$.'},
    {t:'legend', items:[['h','$h(t)=e^{-2t}u(t)$'],['out','$s(t)$']]}
  ], right:[
    {t:'eq', tex:'\\frac{\\d y(t)}{\\d t}+2\\,y(t)=x(t)', label:'Differential equation · at rest',
      note:'Initial rest: if $x(t)=0$ for $t<t_0$, then $y(t)=0$ for $t<t_0$. As in discrete time, this makes the system causal and LTI.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\begin{aligned}h(t)&=e^{-2t}u(t)\\\\\\frac{\\d h}{\\d t}&=-2e^{-2t}u(t)+e^{-2t}\\delta(t)\\\\&=-2\\,h(t)+\\delta(t)\\end{aligned}', label:'Check · $x=\\delta$',
        note:'Product rule, then the sampling property $e^{-2t}\\delta(t)=\\delta(t)$. So $h^{\\prime}+2h=\\delta$, with $h=0$ for $t<0$.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'s(t)=\\int_{0}^{t}e^{-2\\tau}\\,\\d\\tau=\\Bigl[-\\tfrac12e^{-2\\tau}\\Bigr]_{0}^{t}=\\tfrac12\\bigl(1-e^{-2t}\\bigr),\\quad t>0', label:'Step response',
        note:'Integrate $h$. Module 5 finds this system again from its frequency response.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$y^{\\prime}(t)+5\\,y(t)=x(t)$, at rest.<div class="nsep"></div>What is $h(t)$?',
        ask:{key:'m3-diffeq-ct', choices:['$e^{-5t}u(t)$','$e^{5t}u(t)$','$5\\,e^{-t}u(t)$'], answer:0,
          why:'The same check with 2 replaced by 5 gives $h^{\\prime}+5h=\\delta$.'}}]}
  ]}
]},

REAL_DIFFEQ,

{ id:'m3-lab-t', module:'M3', nav:'Laboratory {lab} · Recursion', title:'Laboratory {lab} — A Difference Equation, Step by Step', src:'—',
  objective:'Run a first-order recursion from rest, compare it with convolution by h, and see where it becomes unstable.',
  slide:true, keywords:'laboratory difference equation recursion initial rest feedback gain convolution stable unstable', steps:0, blocks:[
  {t:'eyebrow', text:'Interactive laboratory', src:'—'},
  {t:'title', text:'Laboratory {lab} · Recursion'},
  {t:'lab', id:'T'}
]},

{ id:'m3-code-diffeq', module:'M3', nav:'Code · Difference equations', title:'Difference Equations in Code', src:'—',
  objective:'Run a difference equation as a loop, compare it with convolution, and approximate a differential equation by small steps, in MATLAB and in Python.',
  keywords:'code matlab python recursion loop impulse response step response convolution euler differential equation run',
  slide:true, steps:0, budget:'a code page: the program draws its own figure', blocks:[
  {t:'eyebrow', text:'Module 3 · Difference equations in code', src:'—'},
  {t:'title', text:'Difference Equations in Code'},
  {t:'raw', html:()=>CODEBANK.page('m3-code-diffeq')}
]},

/* ================================================================ 3.6 summary */

{ id:'m3-quick', module:'M3', nav:'Quick check', title:'Quick check', src:'pp. 14–21',
  objective:'Check the module ideas with twelve short predictions.',
  keywords:'quick check predict impulse response convolution support area flip cascade causal stable memoryless',
  budget:'A set of twelve prediction cards; the questions carry no figure.',
  slide:true, steps:0, blocks:[
  {t:'eyebrow', text:'Module 3 · Quick check', src:'pp. 14–21'},
  {t:'title', text:'Quick Check'},
  {t:'grid', cols:4, gap:'22px 20px', style:'flex:1;grid-auto-rows:1fr;padding-bottom:8px', items:[
    [{t:'note', kind:'def', head:'Impulse response', html:'The impulse response of $y[n]=x[n]-x[n-1]$ is',
      ask:{key:'m3-qc0', choices:['$\\delta[n]-\\delta[n-1]$','$u[n]$','$\\delta[n]$'], answer:0,
        why:'Put $x[n]=\\delta[n]$ into the rule.'}}],
    [{t:'note', kind:'def', head:'LTI', html:'Convolution with $h$ gives the output of',
      ask:{key:'m3-qc1', choices:['every linear system','every LTI system','every causal system'], answer:1,
        why:'The derivation uses both linearity and time invariance.'}}],
    [{t:'note', kind:'def', head:'Length', html:'$\\{1,2,3\\}*\\{1,1,1,1\\}$ has how many samples?',
      ask:{key:'m3-qc2', choices:['$4$','$6$','$7$'], answer:1,
        why:'The lengths give $3+4-1=6$.'}}],
    [{t:'note', kind:'def', head:'Sum rule', html:'If $\\sum_n x[n]=3$ and $\\sum_n h[n]=4$, then $\\sum_n y[n]$ is',
      ask:{key:'m3-qc3', choices:['$7$','$12$','$1$'], answer:1,
        why:'The sums multiply: $3\\times4=12$.'}}],
    [{t:'note', kind:'def', head:'The flip', html:'Forgetting to flip $h$ computes',
      ask:{key:'m3-qc4', choices:['the convolution','the cross-correlation'], answer:1,
        why:'$\\sum_k x[k]\\,h[k-n]$ is the cross-correlation of $x$ and $h$.'}}],
    [{t:'note', kind:'def', head:'Support', html:'$x$ is non-zero on $[0,2]$ and $h$ on $[1,4]$. Then $y$ is non-zero on',
      ask:{key:'m3-qc5', choices:['$[1,4]$','$[1,6]$','$[0,6]$'], answer:1,
        why:'Supports add: $[0+1,\\,2+4]=[1,6]$.'}}],
    [{t:'note', kind:'def', head:'Area', html:'$x(t)=u(t)-u(t-2)$ convolved with itself has area',
      ask:{key:'m3-qc6', choices:['$2$','$4$','$8$'], answer:1,
        why:'Areas multiply: $2\\times2=4$.'}}],
    [{t:'note', kind:'def', head:'Two steps', html:'$u(t)*u(t)$ equals',
      ask:{key:'m3-qc7', choices:['$u(t)$','$t\\,u(t)$','$\\delta(t)$'], answer:1,
        why:'For $t>0$ the integral is $\\int_0^t 1\\,\\d\\tau=t$.'}}],
    [{t:'note', kind:'def', head:'Cascade', html:'Swapping two LTI systems in a cascade gives',
      ask:{key:'m3-qc8', choices:['the same system','a different system'], answer:0,
        why:'$h_1*h_2=h_2*h_1$.'}}],
    [{t:'note', kind:'def', head:'Memory', html:'An LTI system with $h[n]=3\\,\\delta[n]$ is',
      ask:{key:'m3-qc9', choices:['memoryless','a system with memory'], answer:0,
        why:'It is the gain $y[n]=3\\,x[n]$.'}}],
    [{t:'note', kind:'def', head:'Causality', html:'$h(t)=e^{-t}u(t+1)$ is',
      ask:{key:'m3-qc10', choices:['causal','not causal'], answer:1,
        why:'$h(-0.5)=e^{0.5}\\neq0$.'}}],
    [{t:'note', kind:'def', head:'Stability', html:'$h[n]=u[n]-u[n-10]$ is',
      ask:{key:'m3-qc11', choices:['BIBO stable','not BIBO stable'], answer:0,
        why:'$\\sum_n|h[n]|=10<\\infty$.'}}]
  ]}
]},

{ id:'m3-synth', module:'M3', nav:'Module 3 synthesis', title:'Module 3 — what to carry forward', src:'pp. 14–21',
  dark:true, objective:'Consolidate the module and open the door to the frequency domain.',
  keywords:'synthesis summary module 3 impulse response convolution properties eigenfunction preview', steps:1, blocks:[
  {t:'eyebrow', text:'Module 3 · Synthesis', src:'pp. 14–21'},
  {t:'title', text:'Module 3 Summary'},
  /* Ten results as prompts, in the order of the module: the student answers
     each one, then opens the card. The sketch on each card is the picture to
     remember. */
  {t:'raw', html:()=>RECALL.deck('m3', [
    {q:'What is the impulse response?', glyph:G.imp,
     a:'<b>Impulse response.</b> The output $h$ when the input is $\\delta[n]$, or $\\delta(t)$.'},
    {q:'How is a sequence written with impulses?', glyph:G.rep,
     a:'$x[n]=\\sum_k x[k]\\,\\delta[n-k]$: a sum of impulses, each weighted by one sample.'},
    {q:'What is the convolution sum?', glyph:G.sum,
     a:'$y[n]=\\sum_k x[k]\\,h[n-k]$. It gives the output of an LTI system only.'},
    {q:'What is the convolution integral?', glyph:G.integ,
     a:'$y(t)=\\int x(\\tau)\\,h(t-\\tau)\\,\\d\\tau$, from the same three LTI steps.'},
    {q:'How do you build $h[n-k]$?', glyph:G.flip,
     a:'<b>Flip, then shift.</b> Its sample $h[0]$ sits at $k=n$. Without the flip the sum is a correlation.'},
    {q:'How do you find the cases?', glyph:G.cases,
     a:'Set each moving edge equal to each fixed edge. List every boundary before integrating.'},
    {q:'Which three checks close a convolution?', glyph:G.check,
     a:'Continuity at each boundary. Supports add. Areas, or sums, multiply.'},
    {q:'Parallel and cascade', glyph:G.inter,
     a:'<b>Parallel:</b> $h_1+h_2$. <b>Cascade:</b> $h_1*h_2$, in either order, for LTI systems only.'},
    {q:'Memoryless and causal', glyph:G.caus,
     a:'<b>Memoryless</b> if and only if $h=a\\,\\delta$. <b>Causal</b> if and only if $h=0$ for negative time.'},
    {q:'BIBO stable', glyph:G.stab,
     a:'<b>BIBO stable</b> if and only if $\\sum_k|h[k]|<\\infty$, or $\\int|h(t)|\\,\\d t<\\infty$.'},
    {q:'What is the step response?', glyph:G.step,
     a:'$s=h*u$, the running sum or running integral of $h$. Back to $h$: $h[n]=s[n]-s[n-1]$ and $h(t)=s^{\\prime}(t)$.'},
    {q:'When does a difference equation give an LTI system?', glyph:G.recur,
     a:'<b>At initial rest.</b> Then it is causal and LTI, and $y[n]=a\\,y[n-1]+x[n]$ has $h[n]=a^{n}u[n]$.'}
  ], {cols:2})},
  {t:'reveal', at:1, items:[
    {t:'note', kind:'ok', head:'Where Module 4 begins', html:'<span style="color:var(--graphite)">Put $x(t)=e^{j\\omega t}$ into the convolution integral: $y(t)=e^{j\\omega t}\\int h(\\tau)\\,e^{-j\\omega\\tau}\\,\\d\\tau$. The output is the input times one number, so a complex exponential passes through an LTI system unchanged in form.</span>'}]}
]},

/* Four optional projects for students who want to try the module on their own
   computer. They carry no grade and no code: each card gives an aim, what it
   practises, a few steps and what to look for. The briefs state no numerical
   answer, so they need no line in verify/. */
{ id:'m3-projects', module:'M3', nav:'Projects to try', title:'Projects to Try', src:'pp. 14–21',
  dark:true, objective:'Offer four optional projects that use convolution on recorded and computed signals.',
  keywords:'projects matlab python room impulse response reverb moving average smoothing inverse echo convolution loops',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 3 · Projects', src:'pp. 14–21'},
  {t:'title', text:'Projects to Try'},
  {t:'raw', html:()=>PROJECTS.deck('m3', [
    {title:'Measure a room with a clap', glyph:G.clap,
     aim:'Record the impulse response of a room and use it to add that room to a dry recording.',
     learn:['A short sound as an approximate impulse.',
            'Convolution with a measured $h$.',
            'How the length of $h$ is heard as reverberation.'],
     steps:['Clap once in a quiet room and record one second. Cut the recording from the clap onward and call it $h[n]$.',
            'Record a short sentence close to the microphone in a small, soft room. Call it $x[n]$.',
            'Compute $y=x*h$ and play it. Normalise $y$ so that its largest sample is 1.',
            'Repeat with a clap from a stairwell or a bathroom.'],
     look:'The voice seems to move into the room of the clap. A longer $h$ gives a longer tail after each word.'},
    {title:'Smooth a noisy record', glyph:G.smooth,
     aim:'Compare moving averages of different lengths on daily data.',
     learn:['A moving average as a convolution with a short $h$.',
            'The trade-off between smoothing and delay.',
            'Why a centred average is not causal.'],
     steps:['Take a year of daily temperatures or daily step counts, $x[n]$.',
            'Convolve with $h[n]=\\tfrac1L$ on $n=0,\\dots,L-1$ for $L=3$, $7$ and $30$.',
            'Plot $x$ and the three outputs on one axes.',
            'Shift the $L=7$ output back by 3 days and compare.'],
     look:'A longer window gives a smoother output that lags behind the data. The shifted output lines up, but it needs three days of future data.'},
    {title:'Undo an echo', glyph:G.inverse,
     aim:'Build the inverse of an echo and test when it is stable.',
     learn:['The inverse system, $h*g=\\delta$.',
            'An inverse found as a geometric series of impulses.',
            'Why an inverse can fail to be stable.'],
     steps:['Let $h[n]=\\delta[n]+a\\,\\delta[n-D]$ with $D=2000$ samples and $a=0.5$.',
            'Take $g[n]=\\sum_{m\\ge0}(-a)^{m}\\,\\delta[n-mD]$, cut after 20 terms.',
            'Check $h*g$ against $\\delta[n]$, then apply $h$ and then $g$ to a recording.',
            'Repeat with $a=1.5$.'],
     look:'For $a=0.5$ the echo disappears. For $a=1.5$ the terms of $g$ grow, $\\sum|g|$ diverges, and the output blows up.'},
    {title:'Write your own convolution', glyph:G.loops,
     aim:'Write convolution with two loops and compare it with the built-in function.',
     learn:['Flip, shift, multiply and add as code.',
            'The length rule $N_x+N_h-1$.',
            'How the cost grows with the lengths.'],
     steps:['Write a function that loops over $n$ and $k$ and returns $\\sum_k x[k]\\,h[n-k]$.',
            'Compare it with the built-in convolution on random sequences of several lengths.',
            'Time both for lengths 100, 1000 and 10000.',
            'Plot the time against the product of the two lengths.'],
     look:'The results agree to rounding error. The loop time grows with the product of the lengths.'}
  ])}
]}
];
window.SCENES_M3 = SC;
})();
