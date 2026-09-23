/* ==========================================================================
   Module 1 — Signal Foundations            [Source: 2–10]
   ========================================================================== */
(function(){
const P = PLOT, C = P.COL;
const disc=(f,a,b)=>{const o=[];for(let n=Math.ceil(a);n<=b;n++)o.push([n,f(n)]);return o;};

const SC = [

{ id:'m1-open', module:'M1', nav:'Module 1 opening', title:'Signal Foundations', src:'pp. 2–10',
  dark:true, keywords:'module 1 overview signals', steps:0, blocks:[
  {t:'eyebrow', text:'Module 1 · Signal Foundations', src:'pp. 2–10'},
  {t:'title', level:1, text:'Signal Foundations'},
  {t:'lede', text:'This module gives the signal descriptions needed before we study systems. It defines energy and power, explains changes to the time axis, tests periodicity and introduces complex exponential signals.'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'note', kind:'warn', head:'Result 1', html:'<span style="color:var(--graphite)">A signal is <em>energy-type</em>, <em>power-type</em>, or <em>neither</em>. These are not opposites and the third case is real.</span>'},
    {t:'note', kind:'warn', head:'Result 2', html:'<span style="color:var(--graphite)">A discrete-time sinusoid is periodic only when $\\omega_0/2\\pi$ is rational. Continuous-time sinusoids carry no such condition.</span>'}
  ], right:[
    /* The page under these two figures is navy, so the axis, the tick numbers
       and the axis names are drawn in the ink of that page. */
    {t:'grid', cols:1, gap:'24px', items:[
      [{t:'fig', svg:()=>{
        const a=P.Axes({w:760,h:300,xr:[0,14],yr:[-1.15,1.15],grid:false,
          xlabel:'t',ylabel:'x(t)=e^{-t/6}\\cos(2t)',
          chrome:{axis:'rgba(239,231,216,.34)',tick:'#9EACB9',name:'#E6E2D9'},
          pad:{l:46,r:30,t:22,b:34},xstep:2,ytarget:3});
        a.curve(t=>Math.exp(-t/6)*Math.cos(2*t),{color:'#7FC3CE',width:2.4});
        return a.svg();
      }}],
      [{t:'fig', svg:()=>{
        const a=P.Axes({w:760,h:300,xr:[0,27],yr:[-1.15,1.15],grid:false,
          xlabel:'n',ylabel:'x[n]=\\cos(2\\pi n/9)',
          chrome:{axis:'rgba(239,231,216,.34)',tick:'#9EACB9',name:'#E6E2D9'},
          pad:{l:46,r:30,t:22,b:34},xstep:9,ytarget:3});
        a.stem(disc(n=>Math.cos(2*Math.PI*n/9),0,27),{color:'#E3B45E',r:4.2,width:1.8});
        return a.svg();
      }}]
    ]}
  ]}
]},

{ id:'m1-def', module:'M1', nav:'Definitions and notation', title:'Definitions and notation', src:'p. 2',
  objective:'Fix the CT/DT notation and the meaning of the independent variable.',
  keywords:'x(t) x[n] notation integer time index continuous discrete stem',
  slide:true, steps:1, blocks:[
  {t:'eyebrow', text:'Module 1 · Foundations', src:'p. 2'},
  {t:'title', text:'Continuous-Time Notation'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=P.Axes({w:560,h:380,xr:[0,20],yr:[-1.35,1.35],xlabel:'t',ylabel:'x(t)=\\cos(t)',
        pad:{l:56,r:26,t:22,b:38},xtarget:6,ytarget:3});
      a.curve(t=>Math.cos(t),{color:C.in}); return a.svg();
    }, caption:'A continuous-time cosine is drawn as a curve. It has a value at every real $t$.'}
  ], right:[
    {t:'eq', tex:'x(t),\\qquad \\forall t\\in\\mathbb{R}', label:'Continuous time',
      note:'Round brackets. The signal is defined at every real instant.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'err', head:'The brackets state the domain',
        html:'Writing $x[t]$ states the wrong domain. The domain decides the periodicity test, the convolution limits and the transform.'}]}
  ]}
]},

{ id:'m1-def-b', module:'M1', nav:'Discrete-time notation', title:'Discrete-time notation', src:'p. 2',
  objective:'Fix discrete-time notation and the meaning of the index n.',
  keywords:'x[n] square brackets integer index stem',
  slide:true, steps:1, blocks:[
  {t:'eyebrow', text:'Module 1 · Foundations', src:'p. 2'},
  {t:'title', text:'Discrete-Time Notation'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=P.Axes({w:560,h:380,xr:[0,20],yr:[-1.35,1.35],xlabel:'n',ylabel:'x[n]=\\cos(n)',
        pad:{l:56,r:26,t:22,b:38},xtarget:6,ytarget:3});
      a.stem(disc(n=>Math.cos(n),0,20),{color:C.mid}); return a.svg();
    }, caption:'The dots are the discrete-time signal values. A curve through the dots is a separate continuous-time signal. Module 7 gives the conditions under which the samples determine that curve uniquely.'}
  ], right:[
    {t:'eq', tex:'x[n],\\qquad \\forall n\\in\\mathbb{Z}', label:'Discrete time',
      note:'Square brackets. The index $n$ is an integer, not a time in seconds.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'err', head:'The brackets state the domain',
        html:'Writing $x(n)$ states the wrong domain. The dots are the signal. A curve through the dots is a different signal.'}]}
  ]}
]},

{ id:'m1-power', module:'M1', nav:'Instantaneous power', title:'From circuit power to signal power', src:'p. 2',
  objective:'Derive the normalised energy/power definitions from the physical ones.',
  keywords:'instantaneous power energy resistor normalised R=1 joule watt',
  slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 1 · Energy and power', src:'p. 2'},
  {t:'title', text:'Instantaneous Signal Power'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=P.Axes({w:560,h:380,xr:[0,8],yr:[-0.15,1.62],xlabel:'t',ylabel:'p(t)',pad:{l:52,r:26,t:20,b:38},xtarget:5,ytarget:3});
      a.area(t=>Math.pow(Math.cos(1.7*t),2),1.2,4.4,{color:'rgba(190,85,57,.18)'});
      a.curve(t=>Math.pow(Math.cos(1.7*t),2),{color:C.coral});
      a.vline(1.2,{color:C.coral}); a.vline(4.4,{color:C.coral});
      a.note(7.8,1.05,'p(t)=v^{2}(t)\\;\\;(R=1)',{anchor:'end',color:C.coral,fs:15,tex:true});
      a.span(1.2,4.4,1.30,'\\text{energy}=\\text{shaded area}',{color:C.coral,tex:true});
      /* a sticky note: the constant-power rule the integral generalises */
      const nx=a.sx(6.55), ny=a.sy(1.43);
      a.raw(`<g transform="rotate(-3 ${nx} ${ny})" style="--fig-halo:#F3DC7A">
        <rect x="${nx-104}" y="${ny-26}" width="212" height="56" rx="2" fill="rgba(0,0,0,.28)"/>
        <rect x="${nx-108}" y="${ny-30}" width="212" height="56" rx="2" fill="#F3DC7A"/>`);
      a.note(6.55,1.43,'\\text{Energy}=\\text{Power}\\times\\text{Time}',{anchor:'middle',color:'#232B33',fs:15,tex:true,dx:-2,dy:4});
      a.raw('</g>');
      return a.svg(); },
      caption:'Energy over a time interval is the area under the instantaneous-power curve. Total energy is finite only if this area approaches a finite value as the interval grows.'}
  ], right:[
    {t:'eq', tex:'\\begin{aligned}p(t)&=v(t)\\,i(t)\\\\&=v(t)\\left(\\dfrac{v(t)}{R}\\right)\\\\&=\\dfrac{1}{R}v^{2}(t)\\end{aligned}', label:'Instantaneous power',
      note:'Units: watts. The square of the voltage carries the power.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'E=\\int_{t_1}^{t_2}p(t)\\,\\d t=\\int_{t_1}^{t_2}\\dfrac{1}{R}v^{2}(t)\\,\\d t',
        label:'Energy over a window', note:'Integrate the power, because the power varies.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Normalised convention', html:'From here, set $R=1\\ \\Omega$ and write power as $|x(t)|^{2}$. Restore the factor $1/R$ when the resistance is different.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Why the modulus', html:'$|x(t)|^{2}=x(t)\\,x^{*}(t)$ is real and non-negative. Writing $x^{2}(t)$ is correct only for a real signal.'}]}
  ]}
]},

{ id:'m1-energy-inf', module:'M1', nav:'Total energy', title:'Total energy over an infinite interval', src:'p. 2',
  objective:'State E∞ in both domains and flag non-convergence.',
  keywords:'E infinity total energy integral summation converge',
  slide:true, steps:1, blocks:[
  {t:'eyebrow', text:'Module 1 · Energy and power', src:'p. 2'},
  {t:'title', text:'Total Signal Energy'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=P.Axes({w:560,h:380,xr:[-6,6],yr:[-0.1,1.15],xlabel:'t',ylabel:'|x(t)|^{2}',pad:{l:52,r:26,t:22,b:38},xtarget:7,ytarget:3});
      a.area(t=>Math.exp(-Math.abs(t)),-4,4,{color:'rgba(20,112,127,.16)'});
      a.curve(t=>Math.exp(-Math.abs(t)),{color:C.in});
      a.vline(-4,{color:C.coral}); a.vline(4,{color:C.coral});
      a.span(-4,4,1.06,'\\text{window }-T\\ldots T',{color:C.coral,tex:true});
      return a.svg(); },
      caption:'<b>Converging.</b> As $T$ grows the shaded area approaches a finite limit. The tails contribute less and less.'}
  ], right:[
    {t:'eq', key:true, tex:'E_\\infty\\;\\triangleq\\;\\lim_{T\\to\\infty}\\int_{-T}^{T}|x(t)|^{2}\\,\\d t\\;=\\;\\int_{-\\infty}^{\\infty}|x(t)|^{2}\\,\\d t',
      label:'Continuous time'},
    {t:'eq', key:true, tex:'E_\\infty\\;\\triangleq\\;\\lim_{N\\to\\infty}\\sum_{n=-N}^{N}|x[n]|^{2}\\;=\\;\\sum_{n=-\\infty}^{\\infty}|x[n]|^{2}',
      label:'Discrete time'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Use a symmetric window', html:'Integrate from $-T$ to $T$, so a two-sided signal is included on both sides. Average power uses the same window.'}]}
  ]}
]},

{ id:'m1-energy-div', module:'M1', nav:'Energy that diverges', title:'When total energy diverges', src:'p. 2',
  objective:'Recognise a signal whose total energy has no finite value.',
  keywords:'diverge E infinity cosine average power',
  slide:true, steps:1, blocks:[
  {t:'eyebrow', text:'Module 1 · Energy and power', src:'p. 2'},
  {t:'title', text:'When Total Energy Diverges'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=P.Axes({w:560,h:380,xr:[-6,6],yr:[-1.4,1.4],xlabel:'t',ylabel:'x(t)=\\cos(2t)',pad:{l:52,r:26,t:22,b:38},xtarget:7,ytarget:3});
      a.area(t=>Math.pow(Math.cos(2*t),2),-4,4,{color:'rgba(166,59,42,.15)'});
      a.curve(t=>Math.cos(2*t),{color:C.err});
      a.vline(-4,{color:C.coral}); a.vline(4,{color:C.coral});
      return a.svg(); },
      caption:'<b>Diverging.</b> Each new period adds the same area, so $E_\\infty\\to\\infty$. Average power measures the energy added per unit time.'}
  ], right:[
    {t:'note', kind:'err', head:'Check convergence',
      html:'The integral or the sum may not converge. Calculate the finite-window energy before taking its limit.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\begin{aligned}E_T&=\\int_{-T}^{T}\\cos^{2}(2t)\\,\\d t\\\\&=\\int_{-T}^{T}\\dfrac{1+\\cos(4t)}{2}\\,\\d t\\\\&=T+\\dfrac{\\sin(4T)}{4}\\;\\longrightarrow\\;\\infty\\end{aligned}',
        label:'Energy over the window', note:'The sine term stays bounded while $T$ grows.'}]}
  ]}
]},

{ id:'m1-avgpower', module:'M1', nav:'Average power', title:'Average power', src:'p. 2',
  objective:'State P over a window and P∞ in both domains, with the 2N+1 count.',
  keywords:'average power P infinity 2N+1 time averaged',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 1 · Energy and power', src:'p. 2'},
  {t:'title', text:'Average Signal Power'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, svg:()=>{
      const sq=[[-7,0]];
      for(let k=-3;k<=3;k++){ const c=2*k; sq.push([c-0.5,0],[c-0.5,1],[c+0.5,1],[c+0.5,0]); }
      sq.push([7,0]);
      const a=P.Axes({w:560,h:190,xr:[-7,7],yr:[-0.2,1.55],xlabel:'t',ylabel:'x(t)',pad:{l:52,r:26,t:18,b:30},xtarget:7,ytarget:1});
      a.area(t=>Math.abs(t)<0.5?1:0,-7,7,{color:'rgba(130,194,123,.45)',n:1400});
      a.poly(sq,{color:C.in});
      a.note(6.8,1.28,'\\text{square wave}',{anchor:'end',color:C.in,fs:14,tex:true});
      a.note(0.7,1.28,'\\text{single pulse}',{anchor:'start',color:C.out,fs:14,tex:true});
      return a.svg(); }},
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=P.Axes({w:560,h:280,xr:[0,20],yr:[-0.06,1.15],xlabel:'T\\;(\\text{half-window})',
        ylabel:'\\text{running average power}',pad:{l:60,r:26,t:22,b:40},xtarget:5,ytarget:4});
      const pts=[],qts=[];
      for(let i=1;i<=1000;i++){ const T=i*0.02, k=Math.floor(T/2), r=T-2*k;
        pts.push([T, (k + Math.min(r,0.5) + Math.max(r-1.5,0))/T]);
        qts.push([T, T<=0.5 ? 1 : 1/(2*T)]); }
      a.poly(qts,{color:C.out}); a.poly(pts,{color:C.in});
      a.poly(qts.filter(p=>p[0]<=1.5),{color:C.out,dash:'6 6'});
      a.hline(0.5,{color:C.in,dash:'2 5'});
      a.note(19.5,0.62,'\\text{square wave}:\\;P_\\infty=1/2',{anchor:'end',color:C.in,fs:14,tex:true});
      a.note(19.5,0.12,'\\text{single pulse}:\\;P_\\infty=0',{anchor:'end',color:C.out,fs:14,tex:true});
      return a.svg(); },
      caption:'The single pulse is the shaded pulse at $t=0$, with energy $1$. Both averages agree until $T=3/2$. The square wave keeps adding energy, so its average approaches $1/2$. The pulse adds none, so $1/(2T)\\to0$.'}
  ], right:[
    {t:'eq', tex:'P=\\dfrac{1}{t_2-t_1}\\int_{t_1}^{t_2}p(t)\\,\\d t', label:'Average over a window',
      note:'Divide the energy by the length of the window.'},
    {t:'eq', key:true, tex:'P_\\infty\\;\\triangleq\\;\\lim_{T\\to\\infty}\\frac{1}{2T}\\int_{-T}^{T}|x(t)|^{2}\\,\\d t',
      label:'Continuous time'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'P_\\infty\\;\\triangleq\\;\\lim_{N\\to\\infty}\\frac{1}{2N+1}\\sum_{n=-N}^{N}|x[n]|^{2}',
        label:'Discrete time'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Why the count is 2N+1', html:'$2N+1$ is the number of samples from $-N$ to $N$, with both ends included. Using $2N$ gives the same limit, but the wrong value at a finite $N$.'}]}
  ]}
]},

{ id:'m1-classify', module:'M1', nav:'Energy signals', title:'Energy signals', src:'p. 3',
  objective:'Define an energy signal and show that a finite pulse has finite energy and zero average power.',
  keywords:'energy signal classification finite energy zero power pulse',
  slide:true, steps:1, blocks:[
  {t:'eyebrow', text:'Module 1 · Energy and power', src:'p. 3'},
  {t:'title', text:'Energy Signals'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=P.Axes({w:560,h:380,xr:[-2,3],yr:[-0.3,1.5],xlabel:'t',ylabel:'x(t)',pad:{l:50,r:24,t:20,b:36},xtarget:6,ytarget:3});
      a.area(t=>(t>=0&&t<=1)?1:0,0,1,{color:'rgba(74,122,70,.18)'});
      a.curve(t=>(t>=0&&t<=1)?1:0,{color:C.out});
      a.span(0,1,1.25,'E_\\infty=1',{color:C.out,tex:true});
      return a.svg(); },
      caption:'The pulse $x(t)=1$ for $0\\le t\\le 1$ and $x(t)=0$ elsewhere. The shaded area is its total energy.'}
  ], right:[
    {t:'note', kind:'ok', head:'Energy signal', html:'A signal with finite total energy, $E_\\infty<\\infty$. Its average power is then zero, $P_\\infty=0$.'},
    {t:'eq', tex:'E_\\infty=\\int_{-\\infty}^{\\infty}|x(t)|^{2}\\,\\d t=\\int_{0}^{1}1^{2}\\,\\d t=1',
      label:'Total energy', note:'The integrand is zero outside $0\\le t\\le 1$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'P_\\infty=\\lim_{T\\to\\infty}\\dfrac{E_T}{2T}=\\lim_{T\\to\\infty}\\dfrac{1}{2T}=0',
        label:'Average power', note:'For $T\\ge 1$ the window holds the whole pulse, so $E_T=1$.'}]}
  ]}
]},

{ id:'m1-classify-b', module:'M1', nav:'Power signals', title:'Power signals', src:'p. 3',
  objective:'Define a power signal and show that a constant has infinite energy and finite average power.',
  keywords:'power signal classification infinite energy finite power constant',
  slide:true, steps:1, blocks:[
  {t:'eyebrow', text:'Module 1 · Energy and power', src:'p. 3'},
  {t:'title', text:'Power Signals'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=P.Axes({w:560,h:380,xr:[-4,4],yr:[-0.3,1.6],xlabel:'t',ylabel:'x(t)',pad:{l:50,r:24,t:20,b:36},xtarget:8,ytarget:3,
        ytickfmt:v=>Math.abs(v-1)<1e-9?'':String(v)});
      a.area(t=>1,-2,2,{color:'rgba(190,85,57,.15)'});
      a.curve(t=>1,{color:C.h});
      a.note(3.9,1.1,'x(t)=1',{anchor:'end',color:C.h,fs:15,tex:true});
      a.vline(-2,{color:C.coral}); a.vline(2,{color:C.coral});
      a.span(-2,2,1.3,'\\text{window }-T\\ldots T',{color:C.coral,tex:true});
      return a.svg(); },
      caption:'The constant $x(t)=1$. The energy in the window grows with the window, so the total energy is infinite.'}
  ], right:[
    {t:'note', kind:'warn', head:'Power signal', html:'A signal with finite, non-zero average power, $0<P_\\infty<\\infty$. Its total energy is then infinite, $E_\\infty=\\infty$.'},
    {t:'eq', tex:'E_T=\\int_{-T}^{T}1^{2}\\,\\d t=2T\\;\\to\\;\\infty',
      label:'Energy in the window', note:'The energy grows without limit as $T\\to\\infty$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'P_\\infty=\\lim_{T\\to\\infty}\\dfrac{E_T}{2T}=\\lim_{T\\to\\infty}\\dfrac{2T}{2T}=1',
        label:'Average power', note:'The window length cancels, so the limit is finite.'}]}
  ]}
]},

{ id:'m1-classify-c', module:'M1', nav:'Neither class', title:'A signal in neither class', src:'p. 3',
  objective:'Show a signal whose energy and average power both diverge.',
  keywords:'neither ramp unbounded infinite energy infinite power classification',
  slide:true, steps:1, blocks:[
  {t:'eyebrow', text:'Module 1 · Energy and power', src:'p. 3'},
  {t:'title', text:'Neither an Energy Signal nor a Power Signal'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=P.Axes({w:560,h:380,xr:[-2,4],yr:[-0.4,4.4],xlabel:'t',ylabel:'x(t)',pad:{l:50,r:24,t:20,b:36},xtarget:6,ytarget:3});
      a.curve(t=>t>=0?t:0,{color:C.err});
      return a.svg(); },
      caption:'The ramp grows without bound. Both its energy and its average power diverge.'}
  ], right:[
    {t:'note', kind:'err', head:'Neither class',
      html:'The ramp$$x(t)=\\begin{cases}t, & t\\ge 0\\\\0, & t<0\\end{cases}$$grows without bound. Compute both limits before you assign a class.'},
    {t:'eq', tex:'E_T=\\int_{0}^{T}t^{2}\\,\\d t=\\left.\\dfrac{t^{3}}{3}\\right|_{0}^{T}=\\dfrac{T^{3}}{3}\\;\\to\\;\\infty',
      label:'Energy in the window', note:'The lower limit is $0$ because $x(t)=0$ for $t<0$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'P_\\infty=\\lim_{T\\to\\infty}\\dfrac{E_T}{2T}=\\lim_{T\\to\\infty}\\dfrac{T^{2}}{6}=\\infty',
        label:'Average power', note:'Both quantities diverge, so the ramp is in neither class.'}]}
  ]}
]},

{ id:'m1-ex-energy', module:'M1', nav:'Worked example · classification', title:'Worked example — classify two signals', src:'p. 3',
  objective:'Reproduce both source examples with full method and sanity checks.',
  keywords:'example rectangular pulse constant sequence energy power worked',
  slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 1 · Worked example', src:'p. 3'},
  {t:'title', text:'Energy and Power Classification Examples'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=P.Axes({w:560,h:380,xr:[-2,3],yr:[-0.3,1.4],xlabel:'t',ylabel:'x(t)',pad:{l:50,r:24,t:20,b:36},xtarget:6,ytarget:3});
      a.area(t=>(t>=0&&t<=1)?1:0,0,1,{color:'rgba(74,122,70,.18)'});
      a.curve(t=>(t>=0&&t<=1)?1:0,{color:C.out});
      a.note(2.8,1.15,'energy-type',{anchor:'end',color:C.out,fs:15,italic:true});
      return a.svg(); },
      caption:'The integrand is 1 on $[0,1]$ and 0 elsewhere, so the energy is the length of that interval.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x(t)=1$ for $0\\le t\\le 1$, and $0$ otherwise.<div class="nsep"></div>Is $x(t)$ an energy signal or a power signal?'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\begin{aligned}E_\\infty&=\\int_{-\\infty}^{\\infty}|x(t)|^{2}\\,\\d t\\\\&=\\int_{0}^{1}1^{2}\\,\\d t\\\\&=\\left.t\\right|_{0}^{1}=1\\end{aligned}', label:'Total energy'},
      {t:'eq', tex:'\\begin{aligned}P_\\infty&=\\lim_{T\\to\\infty}\\dfrac{1}{2T}\\int_{-T}^{T}|x(t)|^{2}\\,\\d t\\\\&=\\lim_{T\\to\\infty}\\dfrac{1}{2T}\\int_{0}^{1}1\\,\\d t\\\\&=\\lim_{T\\to\\infty}\\dfrac{1}{2T}=0\\end{aligned}', label:'Average power'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Solution', html:'$E_\\infty=1$ J and $P_\\infty=0$ W, so $x(t)$ is an energy signal.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Check', html:'Halving the amplitude divides the energy by four. $\\int_0^1 (1/2)^{2}\\,\\d t=1/4$.'}]}
  ]},
  {t:'instr', head:'Presenter cue', html:'Ask the class to predict $P_\\infty$ for $x[n]=4$ <em>before</em> revealing step 3. The common guesses are 4 and ∞. Both are worth discussing.'}
]},

{ id:'m1-ex-energy-b', module:'M1', nav:'Constant sequence · energy', title:'Total energy of a constant sequence', src:'p. 3',
  objective:'Show why the total energy of a non-zero constant sequence diverges.',
  keywords:'constant sequence total energy divergence',
  slide:true, steps:1, blocks:[
  {t:'eyebrow', text:'Module 1 · Worked example', src:'p. 3'},
  {t:'title', text:'Total Energy of a Constant Sequence'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=P.Axes({w:560,h:380,xr:[-6,6],yr:[-0.6,5.2],xlabel:'n',ylabel:'x[n]',pad:{l:50,r:24,t:20,b:36},xtarget:7,ytarget:3});
      a.stem(disc(()=>4,-6,6),{color:C.h});
      a.note(5.6,4.7,'power-type',{anchor:'end',color:C.h,fs:15,italic:true});
      return a.svg(); },
      caption:'Every sample has the same energy, so the energy sum diverges. The average power is the sample value squared.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x[n]=4$ for every integer $n$.<div class="nsep"></div>Is $x[n]$ an energy signal or a power signal?'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\begin{aligned}E_\\infty&=\\sum_{n=-\\infty}^{\\infty}|x[n]|^{2}\\\\&=\\sum_{n=-\\infty}^{\\infty}|4|^{2}\\\\&=\\sum_{n=-\\infty}^{\\infty}16\\to\\infty\\end{aligned}', label:'Total energy'},
      {t:'note', kind:'warn', head:'Next step', html:'Infinite energy does not determine the class. Calculate the average power next.'}]}
  ]}
]},

{ id:'m1-ex-energy-c', module:'M1', nav:'Constant sequence · power', title:'Average power of a constant sequence', src:'p. 3',
  objective:'Calculate the average power of a constant sequence from the definition.',
  keywords:'constant sequence average power 2N+1 classification',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 1 · Worked example', src:'p. 3'},
  {t:'title', text:'Average Power of a Constant Sequence'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=P.Axes({w:560,h:380,xr:[-6,6],yr:[-0.6,5.2],xlabel:'n',ylabel:'x[n]',pad:{l:50,r:24,t:20,b:36},xtarget:7,ytarget:3});
      a.stem(disc(()=>4,-6,6),{color:C.h});
      a.note(5.6,4.7,'P_\\infty=16',{anchor:'end',color:C.h,fs:15,tex:true});
      return a.svg(); },
      caption:'The finite window contains $2N+1$ samples. Each sample contributes 16.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x[n]=4$ and $E_\\infty\\to\\infty$.<div class="nsep"></div>Calculate $P_\\infty$ and classify the signal.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\begin{aligned}P_\\infty&=\\lim_{N\\to\\infty}\\dfrac{1}{2N+1}\\sum_{n=-N}^{N}|x[n]|^{2}\\\\&=\\lim_{N\\to\\infty}\\dfrac{1}{2N+1}\\sum_{n=-N}^{N}16\\\\&=\\lim_{N\\to\\infty}\\dfrac{(2N+1)16}{2N+1}\\\\&=\\lim_{N\\to\\infty}16=16\\end{aligned}', label:'Average power'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Solution and check', html:'$E_\\infty\\to\\infty$ and $P_\\infty=16$, so $x[n]$ is a power signal. In general, a constant of amplitude $A$ has power $A^{2}$.'}]}
  ]}
]},

{ id:'m1-lab-b', module:'M1', nav:'Laboratory B · Energy and power', title:'Laboratory B — Energy and Power Classifier', src:'pp. 2–3, 7, 16–18',
  objective:'Classify source-grounded signals before seeing the calculation.',
  keywords:'laboratory classifier energy power neither interactive', steps:0, blocks:[
  {t:'eyebrow', text:'Interactive laboratory B', src:'pp. 2–3'},
  {t:'title', text:'Laboratory B · Energy and Power'},
  {t:'lede', text:'Predict the class from the signal shape. Then use the definitions to test the prediction.'},
  {t:'lab', id:'B'}
]},

{ id:'m1-shift', module:'M1', nav:'Time shifting', title:'Time shifting', src:'p. 3',
  objective:'Fix the delay/advance sign convention.',
  keywords:'time shift delay advance t0 x(t-t0)',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 1 · Signal operations', src:'p. 3'},
  {t:'title', text:'Time Shifting'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const tri=t=>Math.abs(t)<=1?1-Math.abs(t):0;
      const a=P.Axes({w:560,h:380,xr:[-5,5],yr:[-0.55,1.35],xlabel:'t',ylabel:'\\text{amplitude}',pad:{l:50,r:26,t:24,b:40},xtarget:11,ytarget:3});
      a.curve(t=>tri(t+3),{color:C.out}); a.curve(tri,{color:C.ink});
      a.curve(t=>tri(t-3),{color:C.in});
      a.note(-3,1.14,'x(t+3)',{anchor:'middle',color:C.out,fs:15,tex:true});
      a.note(0,1.14,'x(t)',{anchor:'middle',color:C.ink,fs:15,tex:true});
      a.note(3,1.14,'x(t-3)',{anchor:'middle',color:C.in,fs:15,tex:true});
      a.span(-3,0,-0.38,'advance by 3 s',{color:C.out});
      a.span(0,3,-0.38,'delay by 3 s',{color:C.in});
      return a.svg(); },
      caption:'The pulse shape does not change. Only its position on the time axis changes.'},
    {t:'legend', items:[['out','$x(t+3)$'],['muted','$x(t)$'],['in','$x(t-3)$']]}
  ], right:[
    {t:'eq', key:true, tex:'x(t)\\;\\longrightarrow\\;x(t-t_0)', label:'Time shift'},
    {t:'note', kind:'def', head:'Sign convention', html:'$t_0>0$ delays the signal, so the graph moves right. $t_0<0$ advances it, so the graph moves left.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'Read the argument', html:'At time $t$ the shifted signal has the value $x$ had at $t-t_0$. A delay reaches each value later.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Discrete time', html:'$x[n]\\to x[n-n_0]$ with $n_0$ an integer. The delay $x[n-1]$ is the memory element of a difference equation.'}]}
  ]}
]},

{ id:'m1-reverse', module:'M1', nav:'Time reversal', title:'Time reversal', src:'pp. 3–4',
  objective:'State time reversal as a reflection about the vertical axis.',
  keywords:'time reversal flip x(-t) reflection support',
  slide:true, steps:1, blocks:[
  {t:'eyebrow', text:'Module 1 · Signal operations', src:'pp. 3–4'},
  {t:'title', text:'Time Reversal'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const r=t=>(t>=1&&t<=3)?1:0;
      const a=P.Axes({w:560,h:380,xr:[-4.5,4.5],yr:[-0.35,1.55],xlabel:'t',ylabel:'\\text{amplitude}',pad:{l:50,r:26,t:24,b:40},xtarget:10,ytarget:3});
      a.curve(r,{color:C.ink}); a.curve(t=>r(-t),{color:C.mid});
      a.note(2,1.28,'x(t)',{anchor:'middle',color:C.ink,fs:15,tex:true});
      a.note(-2,1.28,'x(-t)',{anchor:'middle',color:C.mid,fs:15,tex:true});
      return a.svg(); },
      caption:'Reversal reflects the pulse about $t=0$. The pulse on $[1,3]$ moves to $[-3,-1]$.'},
    {t:'legend', items:[['muted','$x(t)$'],['mid','$x(-t)$']]}
  ], right:[
    {t:'eq', key:true, tex:'x(t)\\;\\longrightarrow\\;x(-t)\\qquad\\bigl(x[n]\\to x[-n]\\bigr)',
      label:'Time reversal'},
    {t:'note', kind:'def', head:'What it does',
      html:'Reflect the signal about the vertical axis. The value at time $t$ moves to time $-t$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'The support',
        html:'A pulse on $[1,3]$ moves to $[-3,-1]$. The width stays 2.'}]}
  ]}
]},

{ id:'m1-scale', module:'M1', nav:'Time scaling', title:'Time scaling', src:'pp. 3–4',
  objective:'State time scaling and its effect on the support.',
  keywords:'time scaling compression expansion support width x(at) decimation',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 1 · Signal operations', src:'pp. 3–4'},
  {t:'title', text:'Time Scaling'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const r=t=>(t>=1&&t<=3)?1:0;
      const a=P.Axes({w:560,h:380,xr:[-1,7],yr:[-0.45,2.15],xlabel:'t',ylabel:'\\text{amplitude}',pad:{l:48,r:24,t:20,b:34},xtarget:9,ytarget:3});
      a.curve(r,{color:C.ink});
      a.curve(t=>r(2*t),{color:C.mid});
      a.curve(t=>r(0.5*t),{color:C.h});
      a.note(2.2,1.85,'x(t)',{anchor:'middle',color:C.ink,fs:15,tex:true});
      a.note(1.0,1.5,'x(2t)',{anchor:'middle',color:C.mid,fs:15,tex:true});
      a.note(5.0,1.5,'x(0.5t)',{anchor:'middle',color:C.h,fs:15,tex:true});
      return a.svg(); },
      caption:'Compression by 2 maps $[1,3]$ to $[0.5,1.5]$. Expansion by 2 maps $[1,3]$ to $[2,6]$.'},
    {t:'legend', items:[['muted','$x(t)$'],['mid','$x(2t)$'],['h','$x(0.5t)$']]}
  ], right:[
    {t:'eq', key:true, tex:'y(t)=x(at),\\qquad a>0', label:'Time scaling'},
    {t:'note', kind:'warn', head:'Name the new signal', html:'Write $y(t)=x(at)$. The equation $x(t)=x(at)$ would force $a=1$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\begin{aligned}at&\\in[\\alpha,\\beta]\\\\\\alpha&\\le at\\le\\beta\\\\\\dfrac{\\alpha}{a}&\\le t\\le\\dfrac{\\beta}{a}\\end{aligned}', label:'Map the support',
        note:'For $a>0$, $x(at)$ is non-zero on $[\\alpha/a,\\beta/a]$. The width is divided by $a$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Discrete time is different', html:'$x[2n]$ keeps the even samples and drops the odd ones. $x[n/2]$ is undefined at odd $n$.'}]}
  ]}
]},

{ id:'m1-combined', module:'M1', nav:'Combined transformations', title:'Combining operations: shift, then scale', src:'p. 4',
  objective:'Establish the correct two-step order for x(at−b).',
  keywords:'combination shift then scale order x(at-b) intermediate v(t)',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 1 · Signal operations', src:'p. 4'},
  {t:'title', text:'Combined Time Transformations'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const x=t=> t<-2?0 : t<0?1 : t<2?2 : t<4?(4-t) : 0;
      const a=P.Axes({w:560,h:380,xr:[-3,10],yr:[-0.3,2.5],xlabel:'t',ylabel:'x(t)',pad:{l:48,r:24,t:18,b:32},xtarget:9,ytarget:3});
      a.curve(x,{color:C.ink}); a.note(9.6,2.2,'x(t)',{anchor:'end',color:C.ink,fs:15,tex:true});
      return a.svg(); },
      caption:'Zero for $t<-2$, height 1 on $[-2,0]$, height 2 on $[0,2]$, then a straight fall to 0 at $t=4$.'}
  ], right:[
    {t:'eq', key:true, tex:'\\text{(1)}\\quad v(t)=x(t-b)\\qquad\\text{(2)}\\quad y(t)=v(at)=x(at-b)',
      label:'Shift, then scale', note:'Shift by $b$ first. Then scale the result by $a$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'err', head:'The other order', html:'Scaling first, then shifting by $b$, gives $x(at-ab)$. Unless $a=1$, that is a different signal.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'$x(t)$ is the signal drawn here.<div class="nsep"></div>Plot $x(3t-5)$.'}]}
  ]}
]},

{ id:'m1-combined-b', module:'M1', nav:'Plotting the result', title:'Plotting $x(3t-5)$', src:'p. 4',
  objective:'Plot $x(3t-5)$ by shifting right by 5 and then compressing by 3.',
  keywords:'x(3t-5) shift compress corners support width check',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 1 · Signal operations', src:'p. 4'},
  {t:'title', text:'Plotting $x(3t-5)$'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const x=t=> t<-2?0 : t<0?1 : t<2?2 : t<4?(4-t) : 0;
      const a=P.Axes({w:560,h:380,xr:[-3,10],yr:[-0.3,2.5],xlabel:'t',ylabel:'y(t)',pad:{l:48,r:24,t:18,b:32},xtarget:9,ytarget:3});
      a.curve(t=>x(3*t-5),{color:C.out});
      a.note(9.6,2.2,'y(t)=x(3t-5)',{anchor:'end',color:C.out,fs:15,tex:true});
      [1,5/3,7/3,3].forEach(b=>a.vline(b,{color:C.out,opacity:.5}));
      return a.svg(); },
      caption:'The corners land at $1$, $5/3$, $7/3$ and $3$.'}
  ], right:[
    {t:'note', kind:'def', head:'Method', html:'Each original corner $c$ moves to the time that satisfies $3t-5=c$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\begin{aligned}3t-5&=c\\\\t&=\\dfrac{c+5}{3}\\\\c=-2,0,2,4&\\;\\Longrightarrow\\;t=1,\\dfrac53,\\dfrac73,3\\end{aligned}', label:'Map every corner'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Solution and check', html:'The support is $[1,3]$, so its width is $2=6/3$. At $t=5/3$, $3t-5=0$, so $y(5/3)=x(0)=2$.'}]}
  ]}
]},

{ id:'m1-lab-a', module:'M1', nav:'Laboratory A · Transformations', title:'Laboratory A — Signal Transformation Laboratory', src:'pp. 3–4',
  objective:'Explore x(at−b) with live support and critical-point tracking.',
  keywords:'laboratory transformation shift scale reversal support critical points', steps:0, blocks:[
  {t:'eyebrow', text:'Interactive laboratory A', src:'pp. 3–4'},
  {t:'title', text:'Laboratory A · Signal Transformations'},
  {t:'lab', id:'A'}
]},

{ id:'m1-periodic', module:'M1', nav:'Periodicity', title:'Periodicity', src:'p. 5',
  objective:'Define CT and DT periodicity and the fundamental period.',
  keywords:'periodic aperiodic fundamental period T0 N0 omega0 fundamental frequency',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 1 · Periodicity', src:'p. 5'},
  {t:'title', text:'Signal Periodicity'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const saw=t=>{const u=((t%4)+4)%4; return u/2-1;};
      const a=P.Axes({w:560,h:380,xr:[0,20],yr:[-1.4,2.05],xlabel:'t',ylabel:'x(t)',pad:{l:56,r:26,t:22,b:36},xtarget:10,ytarget:3});
      a.curve(saw,{color:C.in,n:2000});
      a.span(8,12,1.12,'T_0=4',{color:C.coral,tex:true}); a.span(8,16,1.76,'T=8',{color:C.muted,tex:true});
      return a.svg(); },
      caption:'A period of 8 works as well, but the fundamental period is the smallest one, $T_0=4$.'}
  ], right:[
    {t:'note', kind:'def', head:'Continuous time', html:'$x(t)$ is periodic if some $T>0$ satisfies $x(t)=x(t+T)$ for every real $t$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Aperiodic', html:'A signal that is not periodic is aperiodic. The equality has to hold for every $t$, not just for some of them.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'\\omega_0=\\dfrac{2\\pi}{T_0}', label:'Fundamental frequency',
        note:'$T_0$ is the smallest such $T$. Every positive integer multiple of $T_0$ is also a period.'}]}
  ]}
]},

{ id:'m1-periodic-b', module:'M1', nav:'Discrete-time period', title:'A Discrete-Time Period', src:'p. 5',
  objective:'State the discrete-time period and the fundamental frequency.',
  keywords:'periodic N0 integer fundamental frequency',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 1 · Periodicity', src:'p. 5'},
  {t:'title', text:'A Discrete-Time Period'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const f=n=>{const u=((n%8)+8)%8; return [1,3,5,3,1,0,-1,0][u];};
      const a=P.Axes({w:560,h:380,xr:[-16,16],yr:[-1.8,6],xlabel:'n',ylabel:'y[n]',pad:{l:56,r:26,t:22,b:36},xtarget:9,ytarget:4});
      a.stem(disc(f,-16,16),{color:C.mid});
      a.span(0,8,5.4,'N_0=8',{color:C.coral,tex:true});
      return a.svg(); },
      caption:'Periods $N=8,16,24,\\dots$; the fundamental period is $N_0=8$.'}
  ], right:[
    {t:'note', kind:'def', head:'Discrete time', html:'$x[n]$ is periodic if some integer $N>0$ satisfies $x[n]=x[n+N]$ for every integer $n$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'The period is an integer', html:'The sequence exists only at integer indices. A value such as 3.5 samples cannot be a period.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'\\omega_0=\\dfrac{2\\pi}{N_0}', label:'Fundamental frequency',
        note:'$N_0$ is the smallest such positive integer.'}]}
  ]}
]},

{ id:'m1-evenodd', module:'M1', nav:'Even and odd', title:'Even and odd parts', src:'pp. 5–6',
  objective:'Define even/odd and the unique decomposition.',
  keywords:'even odd decomposition Ev Od symmetry x(0)=0',
  slide:true, steps:1, blocks:[
  {t:'eyebrow', text:'Module 1 · Symmetry', src:'pp. 5–6'},
  {t:'title', text:'Even and Odd Decomposition'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=P.Axes({w:560,h:380,xr:[-1,1],yr:[-1.15,1.15],xlabel:'t',ylabel:'x(t)',pad:{l:44,r:20,t:20,b:34},xtarget:3,ytarget:3});
      a.curve(t=>t*t*t,{color:C.mid}); a.vline(0,{color:C.err,dash:'4 4'}); return a.svg(); },
      caption:'$t^3$ is odd, so its value at $t=0$ is 0.'}
  ], right:[
    {t:'note', kind:'def', head:'Definitions', html:'Even: $x(t)=x(-t)$. Odd: $x(t)=-x(-t)$. The same two tests apply to $x[n]$, with $n$ in place of $t$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'Check the origin', html:'An odd signal satisfies $x(0)=-x(0)$, so $x(0)=0$. A signal with $x(0)\\neq 0$ is not odd.'}]}
  ]}
]},

{ id:'m1-evenodd-b', module:'M1', nav:'Even–odd decomposition', title:'Even and Odd Parts', src:'pp. 5–6',
  objective:'Split a signal into its even and odd parts.',
  keywords:'even part odd part decomposition Ev Od',
  slide:true, steps:1, blocks:[
  {t:'eyebrow', text:'Module 1 · Symmetry', src:'pp. 5–6'},
  {t:'title', text:'Even and Odd Parts'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const x=t=>Math.exp(-t);
      const a=P.Axes({w:560,h:380,xr:[-1.5,1.5],yr:[-2.2,3.4],xlabel:'t',ylabel:'\\text{amplitude}',xnameRight:14,pad:{l:52,r:24,t:20,b:36},xtarget:7,ytarget:4});
      a.curve(x,{color:C.h,dash:'4 4'});
      a.curve(t=>0.5*(x(t)+x(-t)),{color:C.in});
      a.curve(t=>0.5*(x(t)-x(-t)),{color:C.mid});
      a.note(-1.42,2.6,'x',{color:C.h,fs:14,tex:true});
      a.note(1.42,2.5,'\\operatorname{Ev}\\{x\\}=\\cosh t',{anchor:'end',color:C.in,fs:14,tex:true});
      a.note(-0.25,-1.5,'\\operatorname{Od}\\{x\\}=-\\sinh t',{anchor:'end',color:C.mid,fs:14,tex:true});
      return a.svg(); },
      caption:'The decomposition of $e^{-t}$. Adding the cyan and violet curves reproduces the dashed original at every $t$.'},
    {t:'legend', items:[['h','$x(t)$'],['in','$\\Ev\\{x\\}(t)$'],['mid','$\\Od\\{x\\}(t)$']]}
  ], right:[
    {t:'eq', tex:'\\Ev\\{x(t)\\}=\\tfrac12 x(t)+\\tfrac12 x(-t),\\qquad \\Od\\{x(t)\\}=\\tfrac12 x(t)-\\tfrac12 x(-t)',
      label:'Even and odd parts'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'\\begin{aligned}\\Ev\\{x(t)\\}+\\Od\\{x(t)\\}&=\\tfrac12[x(t)+x(-t)]+\\tfrac12[x(t)-x(-t)]\\\\&=\\tfrac12[2x(t)]\\\\&=x(t)\\end{aligned}', label:'Decomposition',
        note:'The $x(-t)$ terms cancel. The same construction works for $x[n]$.'}]}
  ]}
]},

{ id:'m1-dt-impulse', module:'M1', nav:'DT impulse and step', title:'The discrete-time impulse and step', src:'p. 6',
  objective:'Define δ[n], u[n], the first difference and the running sum.',
  keywords:'delta[n] u[n] unit impulse step first difference running sum representation',
  slide:true, steps:1, blocks:[
  {t:'eyebrow', text:'Module 1 · Impulse and step', src:'p. 6'},
  {t:'title', text:'Discrete-Time Impulse and Step'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=P.Axes({w:560,h:380,xr:[-3,5],yr:[-0.25,1.35],xlabel:'n',ylabel:'\\delta[n]',pad:{l:48,r:24,t:20,b:34},xtarget:9,ytarget:2});
      a.stem(disc(n=>n===0?1:0,-3,5),{color:C.in,showZero:false});
      a.note(4.6,1.15,'\\delta[n]',{anchor:'end',color:C.in,fs:16,tex:true});
      return a.svg(); },
      caption:'The discrete-time impulse is the sequence that equals 1 at $n=0$ and 0 elsewhere.'}
  ], right:[
    {t:'eq', tex:'\\delta[n]=\\begin{cases}1,&n=0\\\\0,&\\text{otherwise}\\end{cases}', label:'Unit impulse',
      note:'An ordinary sequence. Nothing here is infinite.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'u[n]=\\begin{cases}1,&n\\ge 0\\\\0,&\\text{otherwise}\\end{cases}', label:'Unit step'}]}
  ]}
]},

{ id:'m1-dt-impulse-b', module:'M1', nav:'First difference', title:'Difference and Running Sum', src:'p. 6',
  objective:'Relate the discrete-time step and impulse by a difference and a sum.',
  keywords:'first difference running sum u[n] delta[n]',
  slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 1 · Impulse and step', src:'p. 6'},
  {t:'title', text:'Difference and Running Sum'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=P.Axes({w:560,h:380,xr:[-3,5],yr:[-1.35,1.35],xlabel:'n',ylabel:'\\text{amplitude}',pad:{l:48,r:24,t:20,b:34},xtarget:9,ytarget:3});
      a.stem(disc(n=>n>=0?1:0,-3,5),{color:C.h});
      a.stem(disc(n=>n>=1?-1:0,-3,5),{color:C.mid});
      a.note(4.6,1.15,'u[n]',{anchor:'end',color:C.h,fs:15,tex:true});
      a.note(-2.85,-1.1,'-u[n-1]',{color:C.mid,fs:15,tex:true});
      return a.svg(); },
      caption:'The two sequences cancel for every $n\\ge1$. Only $n=0$ survives, and it gives $\\delta[n]$.'},
    {t:'legend', items:[['h','$u[n]$'],['mid','$-u[n-1]$']]}
  ], right:[
    {t:'eq', key:true, tex:'\\delta[n]=u[n]-u[n-1]', label:'First difference',
      note:'A delay of one sample cancels the flat part of the step and leaves a single sample.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'u[n]=\\sum_{k=0}^{\\infty}\\delta[n-k]', label:'Running sum'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'The two operations invert each other', html:'A first difference reverses a running sum. A running sum reverses a first difference. They are the discrete-time forms of differentiation and integration.'}]},
    {t:'reveal', at:3, items:[
      {t:'eq', key:true, tex:'u[n]=\\sum_{k=-\\infty}^{\\infty}u[k]\\,\\delta[n-k]', label:'Representation',
        note:'Each shifted impulse places one sample at its index.'}]}
  ]}
]},

{ id:'m1-dt-sift', module:'M1', nav:'Sampling and sifting (DT)', title:'Sampling and sifting properties', src:'pp. 6–7',
  objective:'Distinguish the two properties and verify both on the definition example.',
  keywords:'sampling property sifting property delta n0 x[n0]',
  slide:true, steps:1, blocks:[
  {t:'eyebrow', text:'Module 1 · Impulse and step', src:'pp. 6–7'},
  {t:'title', text:'Discrete-Time Sampling and Sifting'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=P.Axes({w:560,h:380,xr:[-1,5],yr:[-0.3,3.6],xlabel:'n',ylabel:'x[n]',pad:{l:48,r:24,t:20,b:34},xtarget:7,ytarget:3});
      a.stem(disc(n=>[1,2,3][n]!==undefined&&n>=0&&n<=2?[1,2,3][n]:0,-1,5),{color:C.in});
      a.note(4.6,3.2,'x[n]',{anchor:'end',color:C.in,fs:15,tex:true});
      return a.svg(); },
      caption:'The sequence used below. Sampling keeps the sample at $n=2$.'}
  ], right:[
    {t:'eq', key:true, tex:'x[n]\\,\\delta[n-n_0]=x[n_0]\\,\\delta[n-n_0]', label:'Sampling property',
      note:'Both sides are sequences. The impulse keeps one sample and drops the rest.'},
    {t:'eq', key:true, tex:'x[n_0]=\\sum_{n=-\\infty}^{\\infty}x[n]\\,\\delta[n-n_0]', label:'Sifting property',
      note:'The right-hand side is a number.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'err', head:'Check the type of the result', html:'Sampling gives a sequence. Sifting gives one number. Sifting is sampling followed by a sum.'}]}
  ]}
]},

{ id:'m1-dt-sift-b', module:'M1', nav:'Sampling example', title:'Sampling and Sifting, Computed', src:'pp. 6–7',
  objective:'Compute one sampled sequence and one sifted value.',
  keywords:'sampling sifting example n0=2',
  slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 1 · Impulse and step', src:'pp. 6–7'},
  {t:'title', text:'Sampling and Sifting, Computed'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=P.Axes({w:560,h:380,xr:[-1,5],yr:[-0.3,3.6],xlabel:'n',ylabel:'x[n]\\delta[n-2]',ynameAtAxis:true,pad:{l:48,r:24,t:20,b:34},xtarget:7,ytarget:3});
      a.stem(disc(n=>n===2?3:0,-1,5),{color:C.out});
      a.note(4.6,3.2,'x[n]\\cdot\\delta[n-2]=3\\delta[n-2]',{anchor:'end',color:C.out,fs:15,tex:true});
      return a.svg(); },
      caption:'The product is a <em>sequence</em>. The sifting property gives the number obtained by summing it.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$n_0=2$, and $x[0]=1$, $x[1]=2$, $x[2]=3$.<div class="nsep"></div>Find the sampled sequence and the sifted value.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'Multiply by $\\delta[n-2]$ to keep the sample at $n=2$. Then sum that sequence.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'\\begin{aligned}x[n]\\delta[n-2]&=x[2]\\delta[n-2]=3\\delta[n-2]\\\\\\sum_{n=-\\infty}^{\\infty}x[n]\\delta[n-2]&=x[0](0)+x[1](0)+x[2](1)\\\\&=3\\end{aligned}', label:'Solution'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Check', html:'The sampled result is a sequence. The sifted result is the number 3.'}]}
  ]}
]},

{ id:'m1-ct-impulse', module:'M1', nav:'CT impulse and step', title:'The continuous-time impulse', src:'p. 7',
  objective:'Present δ(t) rigorously as a distribution while keeping the definition picture.',
  keywords:'dirac delta distribution generalized function unit step derivative area 1',
  slide:true, steps:1, blocks:[
  {t:'eyebrow', text:'Module 1 · Impulse and step', src:'p. 7'},
  {t:'title', text:'Continuous-Time Impulse and Step'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=P.Axes({w:560,h:380,xr:[-2,3],yr:[-0.25,1.45],xlabel:'t',ylabel:'\\text{weight}',pad:{l:48,r:24,t:22,b:34},xtarget:6,ytarget:2});
      a.impulse(0,1,{color:C.in,labelText:'1'});
      a.note(1.9,1.2,'\\delta(t)',{anchor:'end',color:C.in,fs:16,tex:true});
      return a.svg(); },
      caption:'The arrow label gives the impulse weight. This weight is its area in an integral, not a function value.'}
  ], right:[
    {t:'eq', tex:'\\delta(t)=\\begin{cases}\\infty,&t=0\\\\0,&\\text{otherwise}\\end{cases}\\qquad \\int_{-\\infty}^{\\infty}\\delta(t)\\,\\d t=1',
      label:'Informal picture', note:'A picture only. The arrow\'s weight is area, not a function value.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'err', head:'Define the impulse by its action', html:'An ordinary function that is zero except at one point has integral 0, not 1. The impulse is a distribution, and $\\int x(t)\\,\\delta(t-t_0)\\,\\d t=x(t_0)$.'}]}
  ]}
]},

{ id:'m1-ct-impulse-b', module:'M1', nav:'Impulse as a limit', title:'Picturing the Impulse', src:'p. 7',
  objective:'Picture the impulse as a unit-area rectangle made narrow.',
  keywords:'epsilon rectangle area distribution',
  slide:true, steps:0, blocks:[
  {t:'eyebrow', text:'Module 1 · Impulse and step', src:'p. 7'},
  {t:'title', text:'Picturing the Impulse'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=P.Axes({w:560,h:380,xr:[-1.2,1.2],yr:[-0.4,4.6],xlabel:'t',ylabel:'\\delta_\\varepsilon(t)',pad:{l:48,r:24,t:22,b:34},xtarget:5,ytarget:3});
      [[0.8,1.25],[0.4,2.5],[0.2,5]].forEach(([e,h],i)=>{
        const col=[ '#9BC4CB','#4E9AA6',C.in][i];
        a.poly([[-e/2,0],[-e/2,Math.min(h,4.4)],[e/2,Math.min(h,4.4)],[e/2,0]],{color:col,width:1.8}); });
      a.note(1.1,4.1,'\\text{width }\\varepsilon,\\;\\text{height }1/\\varepsilon',{anchor:'end',color:C.muted,fs:13,tex:true});
      return a.svg(); },
      caption:'Each rectangle has unit area. As the width decreases, its integral against a continuous test function approaches the sifting result.'}
  ], right:[
    {t:'note', kind:'def', head:'A unit-area picture', html:'A rectangle of width $\\varepsilon$ and height $1/\\varepsilon$ has area 1. As $\\varepsilon\\to 0$, its integral against a continuous test function approaches the sifting result.'}
  ]}
]},

{ id:'m1-ct-impulse-c', module:'M1', nav:'CT sampling and sifting', title:'Continuous-Time Sampling and Sifting', src:'p. 7',
  objective:'State the continuous-time sampling and sifting properties.',
  keywords:'sampling sifting delta(t) step derivative',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 1 · Impulse and step', src:'p. 7'},
  {t:'title', text:'Continuous-Time Sampling and Sifting'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=P.Axes({w:560,h:380,xr:[-1,6],yr:[-1.1,1.6],xlabel:'t',ylabel:'\\text{amplitude}',pad:{l:48,r:24,t:22,b:34},xtarget:7,ytarget:3});
      const x=t=>0.75*Math.cos(1.2*t-0.5);
      a.curve(x,{color:C.muted,width:1.6});
      a.impulse(3, x(3), {color:C.coral, label:false});
      a.point(3,x(3),{color:C.coral});
      a.note(4.55,-0.9,'(x(t_0))',{color:C.coral,fs:14,tex:true});
      a.note(5.7,1.35,'x(t)',{anchor:'end',color:C.muted,fs:15,tex:true});
      a.note(2.86,-0.28,'t_0',{anchor:'end',color:C.coral,fs:14,tex:true});
      return a.svg(); },
      caption:'Sifting, drawn. The impulse at $t_0$ is scaled by the value of $x$ there, and integration returns that single number.'}
  ], right:[
    {t:'eq', tex:'\\delta(t)=\\dfrac{\\d}{\\d t}u(t),\\qquad u(t)=\\int_{-\\infty}^{t}\\delta(\\tau)\\,\\d\\tau',
      label:'Step and impulse', note:'The pair $\\delta[n]=u[n]-u[n-1]$ is the discrete-time analogue.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'x(t)\\,\\delta(t-t_0)=x(t_0)\\,\\delta(t-t_0)', label:'Sampling'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'x(t_0)=\\int_{-\\infty}^{\\infty}x(t)\\,\\delta(t-t_0)\\,\\d t', label:'Sifting',
        note:'The discrete-time sum is an integral here.'}]}
  ]}
]},

{ id:'m1-ct-cexp', module:'M1', nav:'CT complex exponentials', title:'Continuous-time complex exponentials', src:'pp. 7–9',
  objective:'Build x(t)=Ce^{at} from real to general complex, with Euler and periodicity.',
  keywords:'complex exponential Euler amplitude phase angular frequency growth decay',
  slide:true, steps:1, blocks:[
  {t:'eyebrow', text:'Module 1 · Complex exponentials', src:'pp. 7–9'},
  {t:'title', text:'Continuous-Time Complex Exponentials'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=P.Axes({w:560,h:380,xr:[0,6],yr:[-0.1,1.15],xlabel:'t',ylabel:'x(t)',pad:{l:50,r:26,t:20,b:36},xtarget:6,ytarget:3});
      [[0.5,'#9BC4CB'],[1,'#3E8C9B'],[2,C.in]].forEach(([k,col])=>a.curve(t=>Math.exp(-k*t),{color:col}));
      a.note(5.7,1.02,'e^{-0.5t},\\;e^{-t},\\;e^{-2t}',{anchor:'end',color:C.in,fs:14,tex:true});
      return a.svg(); },
      caption:'Real case, $a<0$: decay. A larger $|a|$ decays faster.'}
  ], right:[
    {t:'eq', key:true, tex:'x(t)=C\\,e^{at},\\qquad C,a\\in\\mathbb{C}', label:'Definition',
      note:'The real and imaginary parts of $a$ decide growth, decay and oscillation.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Both parameters real', html:'If $a<0$ the signal decays. If $a>0$ it grows. If $a=0$ it is the constant $C$. A larger $|a|$ is faster.'}]}
  ]}
]},

{ id:'m1-ct-cexp-im', module:'M1', nav:'Imaginary exponent', title:'A Purely Imaginary Exponent', src:'pp. 7–9',
  objective:'Write a purely imaginary exponent as a sinusoid of constant amplitude.',
  keywords:'Euler omega0 amplitude phase rad/s',
  slide:true, steps:1, blocks:[
  {t:'eyebrow', text:'Module 1 · Complex exponentials', src:'pp. 7–9'},
  {t:'title', text:'A Purely Imaginary Exponent'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=P.Axes({w:560,h:380,xr:[0,12],yr:[-1.3,1.3],xlabel:'t',ylabel:'\\operatorname{Re}\\{x(t)\\}',pad:{l:60,r:26,t:20,b:36},xtarget:7,ytarget:3});
      a.curve(t=>Math.cos(0.5*Math.PI*t),{color:C.in});
      return a.svg(); },
      caption:'$x(t)=e^{j0.5\\pi t}$: the real part, $\\cos(0.5\\pi t)$, of constant amplitude.'}
  ], right:[
    {t:'eq', tex:'\\begin{aligned}x(t)&=Ce^{j\\omega_0t}\\\\&=Ae^{j\\theta}e^{j\\omega_0t}\\\\&=Ae^{j(\\omega_0t+\\theta)}\\\\&=A\\cos(\\omega_0t+\\theta)+jA\\sin(\\omega_0t+\\theta)\\end{aligned}', label:'Purely imaginary exponent',
      note:'$a=j\\omega_0$ and $C=Ae^{j\\theta}$. Here $\\omega_0$ is in rad/s and $\\theta$ is in radians.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Constant amplitude', html:'$|x(t)|=A$ for every $t$. The signal does not grow or decay.'}]}
  ]}
]},

{ id:'m1-ct-cexp-b', module:'M1', nav:'CT exponentials · period and envelope', title:'Period and envelope', src:'pp. 8–9',
  objective:'Derive the fundamental period and read the general complex case as a sinusoid in an envelope.',
  keywords:'fundamental period T0 2 pi omega envelope damping growing sinusoid second-order',
  slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 1 · Complex exponentials', src:'pp. 8–9'},
  {t:'title', text:'Period and Envelope of a Complex Exponential'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=P.Axes({w:560,h:380,xr:[0,12],yr:[-1.3,1.3],xlabel:'t',ylabel:'\\operatorname{Re}\\{x(t)\\}',pad:{l:60,r:26,t:20,b:36},xtarget:7,ytarget:3});
      a.curve(t=>Math.cos(0.5*Math.PI*t),{color:C.in});
      a.span(0,4,1.12,'T_0=4\\;\\text{s}',{color:C.coral,tex:true});
      return a.svg(); },
      caption:'$x(t)=e^{j0.5\\pi t}$: real part, with the fundamental period marked.'}
  ], right:[
    {t:'eq', key:true, tex:'\\begin{aligned}x(t+T)&=x(t)\\\\e^{j\\omega_0(t+T)}&=e^{j\\omega_0t}\\\\e^{j\\omega_0T}&=1\\\\\\omega_0T&=2\\pi k\\\\T&=\\dfrac{2\\pi k}{\\omega_0}\\end{aligned}', label:'Period condition',
      note:'The smallest positive choice is $k=1$, so $T_0=2\\pi/\\omega_0$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Given', html:'$x(t)=e^{j0.5\\pi t}$.<div class="nsep"></div>Find the fundamental period. Use $T_0=2\\pi/\\omega_0$.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'T_0=\\dfrac{2\\pi}{\\omega_0}=\\dfrac{2\\pi}{0.5\\pi}=\\dfrac{2}{0.5}=4\\;\\text{s}', label:'Solution'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Check', html:'$0.5\\pi\\cdot 4=2\\pi$. The phase advances one full turn over the period.'}]}
  ]}
]},

{ id:'m1-ct-cexp-c', module:'M1', nav:'Envelope', title:'Growth, Decay, and an Envelope', src:'pp. 8–9',
  objective:'Read a complex exponent as a sinusoid inside an exponential envelope.',
  keywords:'envelope damping r omega0',
  slide:true, steps:0, blocks:[
  {t:'eyebrow', text:'Module 1 · Complex exponentials', src:'pp. 8–9'},
  {t:'title', text:'Growth, Decay, and an Envelope'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=P.Axes({w:560,h:380,xr:[0,5],yr:[-2.3,2.3],xlabel:'t',ylabel:'\\operatorname{Re}\\{x(t)\\}',pad:{l:50,r:26,t:20,b:36},xtarget:6,ytarget:3});
      a.curve(t=>2*Math.exp(-0.5*t),{color:C.err,dash:'5 5',width:1.4});
      a.curve(t=>-2*Math.exp(-0.5*t),{color:C.err,dash:'5 5',width:1.4});
      a.curve(t=>2*Math.exp(-0.5*t)*Math.cos(2*Math.PI*t),{color:C.in,n:1400});
      a.note(4.8,2.05,'\\operatorname{Re}\\{2e^{-0.5t}e^{j2\\pi t}\\}',{anchor:'end',color:C.in,fs:14,tex:true});
      return a.svg(); },
      caption:'A damped case ($A=2$, $r=-0.5$): a sinusoid held inside the envelope $\\pm Ae^{rt}$.'},
    {t:'legend', items:[['in','$\\operatorname{Re}\\{x(t)\\}$'],['err','$\\pm2e^{-0.5t}$']]}
  ], right:[
    {t:'eq', tex:'\\begin{aligned}x(t)&=Ae^{j\\theta}e^{(r+j\\omega_0)t}\\\\&=Ae^{rt}e^{j(\\omega_0t+\\theta)}\\\\\\operatorname{Re}\\{x(t)\\}&=Ae^{rt}\\cos(\\omega_0t+\\theta)\\end{aligned}', label:'Separate envelope and oscillation'},
    {t:'note', kind:'warn', head:'Read the envelope', html:'The curves $\\pm Ae^{rt}$ bound the sinusoid. It decays for $r<0$, grows for $r>0$, and is sustained for $r=0$.'}
  ]}
]},

{ id:'m1-dt-cexp', module:'M1', nav:'DT complex exponentials', title:'Discrete-time complex exponentials', src:'pp. 9–10',
  objective:'Introduce x[n]=Cα^n and the three envelope cases.',
  keywords:'discrete complex exponential alpha beta growing decaying envelope',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 1 · Complex exponentials', src:'pp. 9–10'},
  {t:'title', text:'Discrete-Time Complex Exponentials'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=P.Axes({w:560,h:380,xr:[0,10],yr:[-0.1,1.15],xlabel:'n',ylabel:'x[n]',pad:{l:48,r:22,t:20,b:34},xtarget:5,ytarget:3});
      a.stem(disc(n=>Math.pow(0.5,n),0,10),{color:C.in});
      return a.svg(); },
      caption:'$x[n]=0.5^{n}$ decreases.'}
  ], right:[
    {t:'eq', key:true, tex:'x[n]=C\\,e^{\\beta n},\\qquad C,\\beta\\in\\mathbb{C}', label:'Definition'},
    {t:'eq', key:true, tex:'\\begin{aligned}\\alpha&=e^{\\beta}\\\\x[n]&=Ce^{\\beta n}=C\\bigl(e^{\\beta}\\bigr)^n=C\\alpha^n\\end{aligned}', label:'Power form',
      note:'A difference equation produces this form.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Real $\\alpha$', html:'If $0<\\alpha<1$ the sequence decreases. If $\\alpha>1$ it increases.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'The boundary moved', html:'In continuous time the boundary is $\\operatorname{Re}\\{a\\}=0$. In discrete time it is $|\\alpha|=1$, the unit circle.'}]}
  ]}
]},

{ id:'m1-dt-cexp-b', module:'M1', nav:'Growing sequence', title:'A Growing Real Sequence', src:'pp. 9–10',
  objective:'Show a real geometric sequence that grows.',
  keywords:'alpha greater than 1 geometric growth',
  slide:true, steps:0, blocks:[
  {t:'eyebrow', text:'Module 1 · Complex exponentials', src:'pp. 9–10'},
  {t:'title', text:'A Growing Real Sequence'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=P.Axes({w:560,h:380,xr:[0,10],yr:[-40,1100],xlabel:'n',ylabel:'y[n]',pad:{l:64,r:22,t:20,b:34},xtarget:5,ytarget:3});
      a.stem(disc(n=>Math.pow(2,n),0,10),{color:C.h});
      return a.svg(); },
      caption:'$y[n]=2^{n}$ increases.'}
  ], right:[
    {t:'note', kind:'def', head:'A growing sequence', html:'$\\alpha>1$ increases. The sequence drawn here is $2^{n}$.'}
  ]}
]},

{ id:'m1-dt-cexp-c', module:'M1', nav:'Complex envelope', title:'A Discrete-Time Envelope', src:'pp. 9–10',
  objective:'Read the modulus of alpha as growth, decay, or a sustained oscillation.',
  keywords:'alpha modulus envelope omega0 discrete',
  slide:true, steps:0, blocks:[
  {t:'eyebrow', text:'Module 1 · Complex exponentials', src:'pp. 9–10'},
  {t:'title', text:'A Discrete-Time Envelope'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=P.Axes({w:560,h:380,xr:[-20,20],yr:[-2.6,2.6],xlabel:'n',ylabel:'x[n]',pad:{l:42,r:18,t:18,b:32},xtarget:4,ytarget:3});
      a.stem(disc(n=>Math.pow(0.95,n)*Math.cos(0.14*Math.PI*n),-20,20),{color:C.mid,r:3.2,width:1.8});
      return a.svg(); },
      caption:'$|\\alpha|=0.95$ decays. The frequency is $0.14\\pi$ radians per sample.'}
  ], right:[
    {t:'eq', tex:'\\begin{aligned}x[n]&=C\\alpha^n\\\\&=|C|e^{j\\theta}\\bigl(|\\alpha|e^{j\\omega_0}\\bigr)^n\\\\&=|C||\\alpha|^ne^{j(\\omega_0n+\\theta)}\\\\&=|C||\\alpha|^n\\cos(\\omega_0n+\\theta)\\\\&\\quad+j|C||\\alpha|^n\\sin(\\omega_0n+\\theta)\\end{aligned}',
      label:'General complex case'},
    {t:'note', kind:'def', head:'Read $|\\alpha|$', html:'$|\\alpha|=1$ is sustained, $|\\alpha|>1$ grows, and $|\\alpha|<1$ decays. The figure uses $|\\alpha|=0.95$ and $\\omega_0=0.14\\pi$.'}
  ]}
]},

{ id:'m1-dt-period', module:'M1', nav:'DT periodicity condition', title:'When is a discrete-time exponential periodic?', src:'p. 10',
  objective:'Derive N = 2πk/ω₀ and the rationality condition; work the definition example.',
  keywords:'discrete periodicity rational multiple 2pi N0 integer condition',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 1 · Periodicity in discrete time', src:'p. 10'},
  {t:'title', text:'Discrete-Time Periodicity Condition'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=P.Axes({w:560,h:380,xr:[-20,20],yr:[-1.35,1.35],xlabel:'n',ylabel:'x[n]',pad:{l:52,r:26,t:20,b:36},xtarget:9,ytarget:3});
      a.stem(disc(n=>Math.cos(n),-20,20),{color:C.err,r:3});
      return a.svg(); },
      caption:'<b>Aperiodic.</b> $x[n]=\\cos(n)$ has $\\omega_0=1$, so $\\omega_0/2\\pi=1/(2\\pi)$ is irrational. The pattern never repeats exactly. It looks periodic, but it is not.'}
  ], right:[
    {t:'eq', key:true, tex:'\\begin{aligned}x[n+N]&=x[n]\\\\e^{j\\omega_0(n+N)}&=e^{j\\omega_0n}\\\\e^{j\\omega_0N}&=1\\\\\\omega_0N&=2\\pi k\\\\N&=\\dfrac{2\\pi k}{\\omega_0}\\end{aligned}', label:'Period condition'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\dfrac{\\omega_0}{2\\pi}=\\dfrac{k}{N}\\in\\mathbb{Q}', label:'Integer requirement',
        note:'Both $k$ and $N$ are integers. If the ratio is irrational, no integer period exists.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'A shift of $2\\pi$', html:'$e^{j(\\omega_0+2\\pi)n}=e^{j\\omega_0 n}$ for every integer $n$. Frequencies that differ by $2\\pi$ are the same sequence.'}]}
  ]}
]},

{ id:'m1-dt-period-b', module:'M1', nav:'A discrete period', title:'Computing a Discrete-Time Period', src:'p. 10',
  objective:'Find the fundamental period of a rational discrete-time exponential.',
  keywords:'N0 10 rational 3 pi over 5',
  slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 1 · Periodicity in discrete time', src:'p. 10'},
  {t:'title', text:'Computing a Discrete-Time Period'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=P.Axes({w:560,h:380,xr:[-20,20],yr:[-1.35,1.5],xlabel:'n',ylabel:'\\operatorname{Re}\\{x[n]\\}',pad:{l:60,r:26,t:22,b:36},xtarget:9,ytarget:3});
      a.stem(disc(n=>Math.cos(3*Math.PI*n/5),-20,20),{color:C.in,r:3});
      a.span(0,10,1.24,'N_0=10',{color:C.coral,tex:true});
      return a.svg(); },
      caption:'$x[n]=e^{j3\\pi n/5}$, real part. The samples repeat after $N_0=10$.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x[n]=e^{j(3\\pi/5)n}$.<div class="nsep"></div>Find $N_0$. Take the smallest positive integer $k$ that makes $N$ an integer.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\begin{aligned}N&=\\dfrac{2\\pi k}{\\omega_0}\\\\&=\\dfrac{2\\pi k}{3\\pi/5}\\\\&=\\dfrac{10}{3}k\\end{aligned}', label:'Substitute the frequency'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Solution', html:'The smallest such $k$ is 3, so $N_0=10$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Check', html:'$\\omega_0 N_0=6\\pi=2\\pi\\cdot 3$. The phase advances three full turns in ten samples.'}]}
  ]}
]},

{ id:'m1-lab-c', module:'M1', nav:'Laboratory C · Periodicity', title:'Laboratory C — Periodicity Explorer', src:'pp. 5, 8, 10',
  objective:'Compare CT and DT periodicity with an exact rationality test.',
  slide:true, keywords:'laboratory periodicity explorer rational frequency N0 T0', steps:0, blocks:[
  {t:'eyebrow', text:'Interactive laboratory C', src:'pp. 5, 8, 10'},
  {t:'title', text:'Laboratory C · Periodicity'},
  {t:'lede', text:'Enter $\\omega_0$ as a rational multiple of $\\pi$. The laboratory can then apply the discrete-time rationality test exactly. A rounded decimal cannot prove that a number is rational.'},
  {t:'lab', id:'C'}
]},

{ id:'m1-synth', module:'M1', nav:'Module 1 synthesis', title:'Module 1 — what to carry forward', src:'pp. 2–10',
  dark:true, objective:'Consolidate the module and connect to Module 2.',
  keywords:'synthesis summary module 1 review', steps:1, blocks:[
  {t:'eyebrow', text:'Module 1 · Synthesis', src:'pp. 2–10'},
  {t:'title', text:'Module 1 Summary'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:`<p style="color:var(--graphite)"><b>1.</b> $E_\\infty$ and $P_\\infty$ are limits. Energy-type ⇒ $P_\\infty=0$; power-type ⇒ $E_\\infty\\to\\infty$; unbounded growth ⇒ neither.</p>
      <p style="color:var(--graphite)"><b>2.</b> $x(at-b)$ requires <em>shift, then scale</em>. The other order gives $x(at-ab)$.</p>
      <p style="color:var(--graphite)"><b>3.</b> $T_0$ and $N_0$ are the <em>smallest</em> positive periods; $\\omega_0=2\\pi/T_0=2\\pi/N_0$.</p>
      <p style="color:var(--graphite)"><b>4.</b> $\\delta[n]$ is a sequence. $\\delta(t)$ is a distribution. Both are defined by their sifting action.</p>
      <p style="color:var(--graphite)"><b>5.</b> A discrete-time exponential is periodic if and only if $\\omega_0/2\\pi$ is rational. A continuous-time one always is.</p>`},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'Method', html:'<span style="color:var(--graphite)">Use a definition to test each claim. Evaluate the required limit, integral or sum. Use a plot to understand the result, but do not use its appearance as proof. Module 2 applies this method to six system properties.</span>'}]}
  ], right:[
    {t:'raw', html:'<p class="eyebrow" style="margin-bottom:14px"><span class="tick"></span>Reflection</p>'},
    {t:'lede', text:'Choose average power for a radio transmitter and pulse energy for a radar pulse. Explain why each quantity is finite, and state the time interval required for each measurement.'},
    {t:'reveal', at:1, items:[
      {t:'raw', html:`<div class="instr"><div class="instr-panel"><span class="note-h">Discussion guidance</span>
        <span style="color:var(--graphite)">A continuous transmitter is specified by average power in watts, because its energy is unbounded. A radar or ultrasound pulse is specified by pulse energy in joules, because its power only has meaning inside the pulse. The measurement follows. A power meter integrates over a window that is long compared with the signal. An energy meter integrates over the whole transient.</span></div></div>`}]}
  ]}
]}
];
window.SCENES_M1 = SC;
})();
