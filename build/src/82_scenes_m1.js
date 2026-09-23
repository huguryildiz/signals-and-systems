/* ==========================================================================
   Module 1 — Signal Foundations            [Source: 2–10]
   ========================================================================== */
(function(){
const P = PLOT, C = P.COL;
const disc=(f,a,b)=>{const o=[];for(let n=Math.ceil(a);n<=b;n++)o.push([n,f(n)]);return o;};
/* ---- everyday examples, one gallery slide at the end of each section. The
       traces are schematic; each keeps the feature the section is about. */
const EXO = o => Object.assign({w:520,h:250,pad:{l:60,r:26,t:24,b:40},ytarget:3}, o);
const ecgBeat = t => { const u=((t%0.8)+0.8)%0.8, g=(c,w,a)=>a*Math.exp(-(((u-c)/w)**2));
  return g(0.16,0.035,0.15)-g(0.285,0.008,0.12)+g(0.30,0.011,1.1)-g(0.318,0.01,0.25)+g(0.52,0.05,0.3); };
function realGallery(cfg){
  return { id:cfg.id, module:'M1', nav:cfg.nav, title:cfg.title, src:cfg.src,
    objective:cfg.objective, keywords:cfg.keywords,
    budget:cfg.budget||'A gallery of four everyday signals; each figure is one example.',
    slide:true, steps:cfg.notes.length-1, blocks:[
    {t:'eyebrow', text:cfg.eyebrow, src:cfg.src},
    {t:'title', text:cfg.title},
    {t:'cols', ratio:'c-8-4', fill:true, left:[
      {t:'grid', cols:2, gap:'18px 22px', items:cfg.figs.map(([svg,cap,listen])=>
        [Object.assign({t:'fig', frame:true, svg, caption:cap}, listen?{listen}:{})])}
    ], right:cfg.notes.map((n,i)=>i ? {t:'reveal', at:i, items:[n]} : n)}
  ]};
}

const REAL_ENERGY = realGallery({ id:'m1-real-energy', nav:'Energy and power around us',
  title:'Energy and Power Around Us', eyebrow:'Module 1 · Energy and power', src:'pp. 2–3',
  objective:'Attach the energy/power classification to signals students meet every day.',
  keywords:'examples clap mains voltage capacitor discharge rainfall energy power',
  figs:[
    [()=>{ const a=P.Axes(EXO({xr:[0,60],yr:[-1.6,1.6],xlabel:'t\\;(\\text{ms})',ylabel:'p(t)',xstep:20}));
      a.curve(t=>Math.exp(-t/12)*(Math.sin(2*Math.PI*0.3*t)+0.5*Math.sin(2*Math.PI*0.55*t+1)),{color:C.in,n:1500});
      return a.svg(); }, 'A hand clap dies out within a few tens of milliseconds, so its energy is finite.'],
    [()=>{ const a=P.Axes(EXO({xr:[0,60],yr:[-400,400],xlabel:'t\\;(\\text{ms})',ylabel:'v(t)\\;(\\text{V})',xstep:20}));
      a.curve(t=>325*Math.cos(2*Math.PI*0.05*t),{color:C.in,n:900});
      return a.svg(); }, 'Mains voltage $325\\cos(2\\pi\\,50\\,t)$ never stops: infinite energy, finite average power.'],
    [()=>{ const a=P.Axes(EXO({xr:[0,5],yr:[0,6],xlabel:'t\\;(\\text{ms})',ylabel:'v(t)\\;(\\text{V})',xstep:1}));
      a.curve(t=>5*Math.exp(-t),{color:C.in});
      return a.svg(); }, 'A capacitor discharging: $v(t)=5e^{-t/\\tau}$ for $t\\ge 0$ has energy $25\\tau/2$.'],
    [()=>{ const r=[0,0,0,0,5,18,32,12,3,0,0,0,0,0,0];
      const a=P.Axes(EXO({xr:[0,14],yr:[0,36],xlabel:'n\\;(\\text{day})',ylabel:'r[n]\\;(\\text{mm})',xstep:7}));
      a.stem(r.map((v,n)=>[n,v]),{color:C.mid});
      return a.svg(); }, 'Daily rainfall during one storm: a few nonzero days, so the sum of squares is finite.']
  ],
  notes:[
    {t:'note', kind:'def', head:'Energy signals', html:'A clap, a discharge or a single storm ends. The total energy is finite and the average power is zero.'},
    {t:'note', kind:'def', head:'Power signals', html:'The mains hum or a radio carrier goes on. The energy grows without bound, but the energy per second settles to a finite average power.'}
  ]});

const REAL_TRANSFORM = realGallery({ id:'m1-real-transform', nav:'Transformations around us',
  title:'Transformations Around Us', eyebrow:'Module 1 · Signal operations', src:'pp. 3–4',
  objective:'Recognise shift, reversal and scaling in everyday sound and video.',
  keywords:'examples thunder delay echo reverse playback double speed frames decimation',
  figs:[
    [()=>{ const g=t=>t<0?NaN:Math.exp(-t/0.4)*Math.sin(2*Math.PI*6*t);
      const a=P.Axes(EXO({xr:[-0.5,5],yr:[-1.3,1.3],xlabel:'t\\;(\\text{s})',ylabel:'p(t)',xstep:1}));
      a.curve(g,{color:C.muted,dash:'5 4',n:900}); a.curve(t=>g(t-3),{color:C.in,n:900});
      a.note(0.25,1.05,'x(t)',{tex:true,color:C.muted}); a.note(3.25,1.05,'x(t-3)',{tex:true,color:C.in});
      return a.svg(); }, 'Thunder from a strike 1 km away arrives about 3 s after the flash: $y(t)=x(t-3)$.'],
    [()=>{ const g=t=>t<0?NaN:Math.exp(-1.5*t)*Math.sin(2*Math.PI*5*t);
      const a=P.Axes(EXO({xr:[-2,2],yr:[-1.3,1.3],xlabel:'t\\;(\\text{s})',ylabel:'p(t)',xstep:1}));
      a.curve(g,{color:C.muted,dash:'5 4',n:900}); a.curve(t=>g(-t),{color:C.in,n:900});
      a.note(0.45,1.05,'x(t)',{tex:true,color:C.muted}); a.note(-1.5,1.05,'x(-t)',{tex:true,color:C.in});
      return a.svg(); }, 'A piano note played backwards: $x(-t)$ swells slowly and stops at once.'],
    [()=>{ const g=t=>Math.exp(-(((t-2)/0.8)**2))*Math.sin(2*Math.PI*1.5*t);
      const a=P.Axes(EXO({xr:[0,4],yr:[-1.3,1.3],xlabel:'t\\;(\\text{s})',ylabel:'p(t)',xstep:1}));
      a.curve(g,{color:C.muted,dash:'5 4',n:900}); a.curve(t=>g(2*t),{color:C.in,n:900});
      a.note(2.75,1.05,'x(t)',{tex:true,color:C.muted}); a.note(0.35,1.05,'x(2t)',{tex:true,color:C.in});
      return a.svg(); }, 'Double-speed playback: $x(2t)$ lasts half as long and every pitch doubles.'],
    [()=>{ const f=n=>Math.cos(2*Math.PI*n/16)+0.3*Math.sin(2*Math.PI*n/5);
      const a=P.Axes(EXO({xr:[0,24],yr:[-1.5,1.5],xlabel:'n',ylabel:'\\text{frame value}',xstep:8}));
      a.stem(disc(f,0,24),{color:C.muted}); a.stem(disc(n=>f(2*n),0,12),{color:C.mid});
      return a.svg(); }, 'Keeping every second video frame: grey stems are $x[n]$, coloured stems $x[2n]$.']
  ],
  notes:[
    {t:'note', kind:'def', head:'Shift, flip, stretch', html:'A delay, a tape played backwards and fast-forward are the three operations of this section: $x(t-t_0)$, $x(-t)$ and $x(at)$.'},
    {t:'note', kind:'warn', head:'Discrete time drops samples', html:'$x[2n]$ throws away every odd sample. A video played at double speed drops frames the same way, and they cannot be recovered.'}
  ]});

const REAL_PERIODIC = realGallery({ id:'m1-real-periodic', nav:'Periodic signals around us',
  title:'Periodic Signals Around Us', eyebrow:'Module 1 · Periodicity', src:'p. 5',
  objective:'Show periodicity as a model of signals that repeat in practice.',
  keywords:'examples heartbeat mains tides monthly temperature period',
  figs:[
    [()=>{ const a=P.Axes(EXO({xr:[0,3.2],yr:[-0.4,1.5],xlabel:'t\\;(\\text{s})',ylabel:'v(t)\\;(\\text{mV})',xstep:0.8}));
      a.curve(ecgBeat,{color:C.in,n:1400}); a.span(1.1,1.9,1.35,'T\\approx 0.8\\;\\text{s}',{tex:true});
      return a.svg(); }, 'A resting heartbeat repeats about every 0.8 s. A real heart is only nearly periodic.'],
    [()=>{ const a=P.Axes(EXO({xr:[0,60],yr:[-400,480],xlabel:'t\\;(\\text{ms})',ylabel:'v(t)\\;(\\text{V})',xstep:20}));
      a.curve(t=>325*Math.cos(2*Math.PI*0.05*t),{color:C.in,n:900}); a.span(0,20,380,'T=20\\;\\text{ms}',{tex:true});
      return a.svg(); }, 'Mains voltage at 50 Hz repeats every 20 ms.'],
    [()=>{ const a=P.Axes(EXO({xr:[0,48],yr:[-2,2.4],xlabel:'t\\;(\\text{h})',ylabel:'h(t)\\;(\\text{m})',xstep:12}));
      a.curve(t=>1.5*Math.cos(2*Math.PI*t/12.42),{color:C.in}); a.span(0,12.42,1.9,'T\\approx 12.4\\;\\text{h}',{tex:true});
      return a.svg(); }, 'Sea level in a harbour: the tide repeats about every 12.4 hours.'],
    [()=>{ const a=P.Axes(EXO({xr:[0,36],yr:[0,34],xlabel:'n\\;(\\text{month})',ylabel:'T[n]\\;(^\\circ\\text{C})',xstep:12}));
      a.stem(disc(n=>14-10*Math.cos(2*Math.PI*(n-0.5)/12),0,35),{color:C.mid}); a.span(12,24,31,'N=12',{tex:true});
      return a.svg(); }, 'Monthly mean temperature over three years: period $N=12$ months.']
  ],
  notes:[
    {t:'note', kind:'def', head:'Periodic in practice', html:'Heartbeats, the mains, tides and the seasons repeat. The period $T$ or $N$ is the time for one repetition.'},
    {t:'note', kind:'warn', head:'A model, not a fact', html:'No real signal repeats exactly or forever. A periodic model describes a stretch that is long compared with one period.'}
  ]});

const REAL_IMPULSE = realGallery({ id:'m1-real-impulse', nav:'Impulses and steps around us',
  title:'Impulses and Steps Around Us', eyebrow:'Module 1 · Impulse and step', src:'pp. 6–7',
  objective:'Connect the step and the impulse to switching and to short, strong events.',
  keywords:'examples switch battery hammer tap deposit subscription step impulse',
  figs:[
    [()=>{ const a=P.Axes(EXO({xr:[-2,6],yr:[-1,15],xlabel:'t\\;(\\text{s})',ylabel:'v(t)\\;(\\text{V})',xstep:2}));
      a.curve(t=>t<0?0:NaN,{color:C.in}); a.curve(t=>t<0?NaN:12,{color:C.in});
      return a.svg(); }, 'Closing a switch on a 12 V battery at $t=0$: $v(t)=12\\,u(t)$.'],
    [()=>{ const a=P.Axes(EXO({xr:[-5,5],yr:[0,1.25],xlabel:'t\\;(\\text{ms})',ylabel:'F(t)',xstep:5}));
      a.curve(t=>Math.exp(-((t/0.35)**2)),{color:C.in,n:1200});
      a.note(0.7,0.9,'F(t)\\approx I\\,\\delta(t)',{tex:true,color:C.in});
      return a.svg(); }, 'A hammer tap: a large force for about a millisecond, modelled by an impulse of area $I$.'],
    [()=>{ const a=P.Axes(EXO({xr:[0,10],yr:[0,120],xlabel:'n\\;(\\text{month})',ylabel:'x[n]',xstep:2}));
      a.stem(disc(n=>n===3?100:0,0,10),{color:C.mid});
      return a.svg(); }, 'One deposit of 100 in month 3: $x[n]=100\\,\\delta[n-3]$.'],
    [()=>{ const a=P.Axes(EXO({xr:[0,10],yr:[0,12],xlabel:'n\\;(\\text{month})',ylabel:'x[n]',xstep:2}));
      a.stem(disc(n=>n>=2?10:0,0,10),{color:C.mid});
      return a.svg(); }, 'A monthly fee of 10 from month 2: $x[n]=10\\,u[n-2]$.']
  ],
  notes:[
    {t:'note', kind:'def', head:'Steps', html:'Something switches on and stays on: a battery, a heater, a new monthly fee. The unit step $u$ is its shape.'},
    {t:'note', kind:'def', head:'Impulses', html:'Something short and strong: a tap, a clap, a single payment. When only its area matters, we model it by $\\delta$ scaled to that area.'}
  ]});

const REAL_CEXP = realGallery({ id:'m1-real-cexp', nav:'Exponentials around us',
  title:'Exponentials Around Us', eyebrow:'Module 1 · Complex exponentials', src:'pp. 7–9',
  objective:'Show growth, decay and damped oscillation as exponentials in everyday signals.',
  keywords:'examples cooling coffee plucked string savings interest car suspension damped exponential',
  figs:[
    [()=>{ const a=P.Axes(EXO({xr:[0,60],yr:[0,70],xlabel:'t\\;(\\text{min})',ylabel:'\\Delta T(t)\\;(^\\circ\\text{C})',xstep:20}));
      a.curve(t=>60*Math.exp(-t/15),{color:C.in});
      return a.svg(); }, 'Cooling coffee: the excess over room temperature is $60\\,e^{-t/15}$.'],
    [()=>{ const a=P.Axes(EXO({xr:[0,1.5],yr:[-1.2,1.2],xlabel:'t\\;(\\text{s})',ylabel:'\\text{displacement}',xstep:0.5}));
      a.curve(t=>Math.exp(-t/0.35)*Math.cos(2*Math.PI*8*t),{color:C.in,n:1200});
      a.curve(t=>Math.exp(-t/0.35),{color:C.muted,dash:'4 4'}); a.curve(t=>-Math.exp(-t/0.35),{color:C.muted,dash:'4 4'});
      return a.svg(); }, 'A plucked string: $e^{-t/\\tau}\\cos(\\omega_0 t)$, the real part of $e^{(-1/\\tau+j\\omega_0)t}$.'],
    [()=>{ const a=P.Axes(EXO({xr:[0,20],yr:[0,3000],xlabel:'n\\;(\\text{year})',ylabel:'x[n]',xstep:5}));
      a.stem(disc(n=>1000*1.05**n,0,20),{color:C.mid});
      return a.svg(); }, 'Savings at 5 % a year grow as $x[n]=1000\\,(1.05)^n$.'],
    [()=>{ const a=P.Axes(EXO({xr:[0,24],yr:[-1.2,1.2],xlabel:'n',ylabel:'x[n]',xstep:8}));
      a.stem(disc(n=>0.85**n*Math.cos(0.6*n),0,24),{color:C.mid});
      return a.svg(); }, 'A car body after a bump, sampled: $x[n]=(0.85)^n\\cos(0.6\\,n)$.']
  ],
  notes:[
    {t:'note', kind:'def', head:'Real exponentials', html:'Cooling and savings follow $Ce^{at}$ or $Ca^n$. The sign of $a$, or whether $|a|$ exceeds 1, decides growth or decay.'},
    {t:'note', kind:'def', head:'Complex exponentials', html:'A string or a car spring oscillates while it decays. That is the real part of $Ce^{st}$ with $s=\\sigma+j\\omega_0$ and $\\sigma<0$.'}
  ]});

/* ---- a catalogue of common signals, section 1.7. Four gallery slides of the
       signals the later modules keep using. Each figure states its formula in
       the caption; where a signal can be heard, its button plays it. */
const rectP = t => Math.abs(t)<0.5 ? 1 : 0;
const triP  = t => Math.abs(t)<=1 ? 1-Math.abs(t) : 0;
const sincP = t => t===0 ? 1 : Math.sin(Math.PI*t)/(Math.PI*t);
const gaussP= t => Math.exp(-Math.PI*t*t);
/* the pulse p(t - t0) sets the loudness of a 440 Hz tone */
const toneIn = (p,t0,dur) => ({items:[{label:'Play as a tone',
  sound:()=>({f:t=>p(t-t0)*Math.cos(2*Math.PI*440*t), dur})}]});
/* one period of each waveform, A = 1 and T0 = 1, repeated */
const fr = t => t-Math.floor(t);
const WAVE = {
  sine:  t => Math.sin(2*Math.PI*t),
  square:t => fr(t)<0.5 ? 1 : -1,
  tri:   t => { const u=fr(t+0.5)-0.5; return 1-4*Math.abs(u); },
  saw:   t => 2*fr(t)-1
};
const at220 = w => ({items:[{label:'Play at 220 Hz', sound:()=>({f:t=>w(220*t), dur:1.2})}]});
/* a fixed pseudo-random sequence in [-1,1], so the figure and the build are
   the same every time */
const hiss = i => { const s=Math.sin(i*12.9898+78.233)*43758.5453; return 2*(s-Math.floor(s))-1; };

const CAT_BLOCKS = realGallery({ id:'m1-cat-blocks', nav:'Step, ramp, sign, exponential',
  title:'Building Blocks: Step, Ramp, Sign and Exponential', eyebrow:'Module 1 · Common signals', src:'pp. 2–10',
  objective:'Name the four elementary signals from which many others are built, with their formulas.',
  keywords:'catalogue common signals unit step ramp sign signum sgn one-sided exponential building blocks',
  budget:'A catalogue of four elementary signals; each figure carries its formula.',
  figs:[
    [()=>{ const a=P.Axes(EXO({xr:[-2,3],yr:[-0.3,1.4],xlabel:'t',ylabel:'u(t)',xstep:1}));
      a.curve(t=>t<0?0:1,{color:C.in,n:1000});
      return a.svg(); }, 'Unit step: $u(t)=1$ for $t>0$ and $u(t)=0$ for $t<0$.'],
    [()=>{ const a=P.Axes(EXO({xr:[-2,3],yr:[-0.3,3.2],xlabel:'t',ylabel:'r(t)',xstep:1}));
      a.curve(t=>t<0?0:t,{color:C.in});
      return a.svg(); }, 'Unit ramp: $r(t)=t\\,u(t)$. Its slope is $1$ for $t>0$, so $\\dfrac{\\d r}{\\d t}=u(t)$.'],
    [()=>{ const a=P.Axes(EXO({xr:[-2,3],yr:[-1.4,1.4],xlabel:'t',ylabel:'\\operatorname{sgn}(t)',xstep:1}));
      a.curve(t=>t<0?-1:1,{color:C.in,n:1000});
      return a.svg(); }, 'Sign: $\\operatorname{sgn}(t)=1$ for $t>0$ and $-1$ for $t<0$, so $\\operatorname{sgn}(t)=2u(t)-1$ for $t\\ne0$.'],
    [()=>{ const a=P.Axes(EXO({xr:[-1,4],yr:[-0.2,1.3],xlabel:'t',ylabel:'x(t)',xstep:1}));
      a.curve(t=>t<0?0:Math.exp(-t),{color:C.in,n:1000});
      a.curve(t=>t<0?0:Math.exp(-2*t),{color:C.mid,n:1000,dash:'6 4'});
      a.note(1.05,0.52,'e^{-t}u(t)',{tex:true,color:C.in}); a.note(2.0,0.3,'e^{-2t}u(t)',{tex:true,color:C.mid});
      return a.svg(); }, 'One-sided exponential: $x(t)=e^{-at}u(t)$ with $a>0$. Its energy is $1/(2a)$; a larger $a$ decays faster.']
  ],
  notes:[
    {t:'note', kind:'def', head:'Why these four', html:'Many signals are sums, shifts and products of these shapes. A voltage switched on at $t_0$ is $V\\,u(t-t_0)$.'},
    {t:'note', kind:'def', head:'How they relate', html:'The ramp is the running integral of the step: $r(t)=\\int_{-\\infty}^{t}u(\\tau)\\,\\d\\tau$. The step is the running integral of $\\delta(t)$.'}
  ]});

const CAT_PULSE = realGallery({ id:'m1-cat-pulse', nav:'Rectangle, triangle, sinc, Gaussian',
  title:'Pulses: Rectangle, Triangle, Sinc and Gaussian', eyebrow:'Module 1 · Common signals', src:'pp. 2–10',
  objective:'Give the formulas of four standard pulses and hear each one shape a tone.',
  keywords:'catalogue common signals pulse rect rectangle triangle tri sinc gaussian window energy tone sound',
  budget:'A catalogue of four pulses; each figure carries its formula and a sound button.',
  figs:[
    [()=>{ const a=P.Axes(EXO({xr:[-2,2],yr:[-0.3,1.3],xlabel:'t',ylabel:'\\operatorname{rect}(t)',xstep:1}));
      a.curve(rectP,{color:C.in,n:1000});
      return a.svg(); }, 'Rectangle: $\\operatorname{rect}(t)=1$ for $|t|<\\tfrac12$ and $0$ for $|t|>\\tfrac12$. Energy $1$.',
      toneIn(rectP,0.75,1.5)],
    [()=>{ const a=P.Axes(EXO({xr:[-2,2],yr:[-0.3,1.3],xlabel:'t',ylabel:'\\operatorname{tri}(t)',xstep:1}));
      a.curve(triP,{color:C.in});
      return a.svg(); }, 'Triangle: $\\operatorname{tri}(t)=1-|t|$ for $|t|\\le1$ and $0$ otherwise. Energy $2/3$.',
      toneIn(triP,1.2,2.4)],
    [()=>{ const a=P.Axes(EXO({xr:[-5,5],yr:[-0.4,1.2],xlabel:'t',ylabel:'x(t)',xstep:1}));
      a.hline(0,{color:C.muted});
      a.curve(sincP,{color:C.in,n:1000});
      return a.svg(); }, '$x(t)=\\operatorname{sinc}(\\pi t)$, with $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$. Peak $1$ at $t=0$; zeros at $t=\\pm1,\\pm2,\\dots$',
      toneIn(sincP,2,4)],
    [()=>{ const a=P.Axes(EXO({xr:[-2,2],yr:[-0.3,1.3],xlabel:'t',ylabel:'x(t)',xstep:1}));
      a.curve(gaussP,{color:C.in});
      return a.svg(); }, 'Gaussian: $x(t)=e^{-\\pi t^2}$. It is smooth everywhere and its area is $1$.',
      toneIn(gaussP,1,2)]
  ],
  notes:[
    {t:'note', kind:'def', head:'Heard as a tone', html:'Each button plays $p(t-t_0)\\cos(2\\pi\\cdot440\\,t)$: the pulse sets the loudness of a 440 Hz tone. The jumps of the rectangle are heard as clicks; the Gaussian starts and ends softly.'},
    {t:'note', kind:'def', head:'They come back', html:'The triangle is the rectangle convolved with itself (Module 3). The rectangle and the sinc are a transform pair (Module 5).'}
  ]});

const CAT_WAVE = realGallery({ id:'m1-cat-wave', nav:'Sine, square, triangle, sawtooth',
  title:'Periodic Waveforms: Sine, Square, Triangle and Sawtooth', eyebrow:'Module 1 · Common signals', src:'pp. 2–10',
  objective:'Give one period of four standard waveforms with their average power, and hear that equal period means equal pitch.',
  keywords:'catalogue common signals periodic waveform sine square triangle sawtooth average power pitch timbre harmonics sound',
  budget:'A catalogue of four periodic waveforms; each figure carries its formula and a sound button.',
  figs:[
    [()=>{ const a=P.Axes(EXO({xr:[0,3],yr:[-1.4,1.4],xlabel:'t/T_0',ylabel:'x(t)/A',xstep:1}));
      a.curve(WAVE.sine,{color:C.in,n:900});
      return a.svg(); }, 'Sine: $x(t)=A\\sin(2\\pi t/T_0)$. Average power $A^2/2$.', at220(WAVE.sine)],
    [()=>{ const a=P.Axes(EXO({xr:[0,3],yr:[-1.4,1.4],xlabel:'t/T_0',ylabel:'x(t)/A',xstep:1}));
      a.curve(WAVE.square,{color:C.in,n:1800});
      return a.svg(); }, 'Square: $x(t)=A$ for $0\\le t<T_0/2$ and $-A$ for $T_0/2\\le t<T_0$. Average power $A^2$.', at220(WAVE.square)],
    [()=>{ const a=P.Axes(EXO({xr:[0,3],yr:[-1.4,1.4],xlabel:'t/T_0',ylabel:'x(t)/A',xstep:1}));
      a.curve(WAVE.tri,{color:C.in,n:900});
      return a.svg(); }, 'Triangle: $x(t)=A\\,(1-4|t|/T_0)$ for $|t|\\le T_0/2$. Average power $A^2/3$.', at220(WAVE.tri)],
    [()=>{ const a=P.Axes(EXO({xr:[0,3],yr:[-1.4,1.4],xlabel:'t/T_0',ylabel:'x(t)/A',xstep:1}));
      a.curve(WAVE.saw,{color:C.in,n:1800});
      return a.svg(); }, 'Sawtooth: $x(t)=A\\,(2t/T_0-1)$ for $0\\le t<T_0$. Average power $A^2/3$.', at220(WAVE.saw)]
  ],
  notes:[
    {t:'note', kind:'def', head:'Same pitch', html:'All four buttons use $T_0=1/220$ s, so all four have the same pitch. The shape changes the colour of the sound. Module 4 explains this with harmonics.'},
    {t:'note', kind:'def', head:'Same power, other sound', html:'The triangle and the sawtooth have the same average power, $A^2/3$, and still sound different. Power does not fix the shape.'}
  ]});

const CAT_SOUND = realGallery({ id:'m1-cat-sound', nav:'Chirp, beats, AM, FM',
  title:'Signals for the Ear: Chirp, Beats, AM and FM', eyebrow:'Module 1 · Common signals', src:'pp. 2–10',
  objective:'Give the formulas of four signals whose behaviour is easiest to hear: a chirp, beats, amplitude modulation and frequency modulation.',
  keywords:'catalogue common signals chirp sweep instantaneous frequency beats amplitude modulation AM tremolo frequency modulation FM vibrato siren sound',
  budget:'A catalogue of four audible signals; each figure carries its formula and a sound button.',
  figs:[
    [()=>{ const a=P.Axes(EXO({xr:[0,6],yr:[-1.4,1.4],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',xstep:1}));
      a.curve(t=>Math.cos(2*Math.PI*(0.3*t+0.25*t*t)),{color:C.in,n:1600});
      return a.svg(); }, 'Chirp: $x(t)=\\cos\\!\\big(2\\pi(f_0t+\\tfrac{k}{2}t^2)\\big)$. Its frequency $f_0+kt$ rises with time. Drawn with $f_0=0.3$ Hz, $k=0.5$ Hz/s.',
      {items:[{label:'Play 200 Hz to 2 kHz', sound:()=>({f:t=>Math.cos(2*Math.PI*(200*t+450*t*t)), dur:2})}]}],
    [()=>{ const a=P.Axes(EXO({xr:[0,2],yr:[-2.4,2.4],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',xstep:0.5}));
      a.curve(t=>2*Math.cos(Math.PI*t),{color:C.muted,dash:'4 4'}); a.curve(t=>-2*Math.cos(Math.PI*t),{color:C.muted,dash:'4 4'});
      a.curve(t=>Math.cos(2*Math.PI*10*t)+Math.cos(2*Math.PI*11*t),{color:C.in,n:1600});
      return a.svg(); }, 'Beats: $\\cos(2\\pi f_1t)+\\cos(2\\pi f_2t)=2\\cos(\\pi(f_1-f_2)t)\\cos(\\pi(f_1+f_2)t)$. The loudness peaks $|f_1-f_2|$ times a second.',
      {items:[{label:'Play 440 Hz + 444 Hz', sound:()=>({f:t=>Math.cos(2*Math.PI*440*t)+Math.cos(2*Math.PI*444*t), dur:3})}]}],
    [()=>{ const a=P.Axes(EXO({xr:[0,2],yr:[-2.1,2.1],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',xstep:0.5}));
      const env=t=>1+0.8*Math.cos(2*Math.PI*t);
      a.curve(env,{color:C.muted,dash:'4 4'}); a.curve(t=>-env(t),{color:C.muted,dash:'4 4'});
      a.curve(t=>env(t)*Math.cos(2*Math.PI*12*t),{color:C.in,n:1600});
      return a.svg(); }, 'AM: $x(t)=\\big(1+m\\cos(2\\pi f_mt)\\big)\\cos(2\\pi f_ct)$ with $0<m\\le1$. The dashed envelope is $\\pm\\big(1+m\\cos(2\\pi f_mt)\\big)$.',
      {items:[{label:'Play $f_c=440$ Hz, $f_m=3$ Hz', sound:()=>({f:t=>(1+0.8*Math.cos(2*Math.PI*3*t))*Math.cos(2*Math.PI*440*t), dur:3})}]}],
    [()=>{ const a=P.Axes(EXO({xr:[0,2],yr:[-1.4,1.4],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',xstep:0.5}));
      a.curve(t=>Math.cos(2*Math.PI*10*t+5*Math.sin(2*Math.PI*t)),{color:C.in,n:1600});
      return a.svg(); }, 'FM: $x(t)=\\cos\\!\\big(2\\pi f_ct+\\beta\\sin(2\\pi f_mt)\\big)$. The amplitude stays fixed; the frequency $f_c+\\beta f_m\\cos(2\\pi f_mt)$ swings about $f_c$. Drawn with $f_c=10$ Hz, $f_m=1$ Hz, $\\beta=5$.',
      {items:[{label:'Play $f_c=440$ Hz, $f_m=3$ Hz, $\\beta=30$', sound:()=>({f:t=>Math.cos(2*Math.PI*440*t+30*Math.sin(2*Math.PI*3*t)), dur:3})}]}]
  ],
  notes:[
    {t:'note', kind:'def', head:'Frequency that changes', html:'A chirp sweeps its frequency, as a bird call or a radar pulse does. FM swings it back and forth about $f_c$. Beats and AM keep the tone and move its loudness.'},
    {t:'note', kind:'def', head:'Tuning by ear', html:'Two strings a few hertz apart beat. A musician turns the peg until the beats slow down and stop, which means $f_1=f_2$.'}
  ]});

/* random signals: each is built from the fixed sequence `hiss`, so a figure
   is the same on every build. `walk` and `telegraph` are made once per play. */
const walkSeq = (n,k) => { const o=[0]; for(let i=1;i<=n;i++) o.push(k*o[i-1]+hiss(i+5000)); return o; };
const telegraph = (rate,dur) => { const T=[]; let t=0, i=0;
  while(t<dur){ const u=(hiss(9000+i++)+1)/2; t+=-Math.log(Math.max(u,1e-9))/rate; T.push(t); }
  return t0 => { let c=0; while(c<T.length && T[c]<=t0) c++; return c%2 ? -1 : 1; }; };
const TEL = telegraph(2.5,4);

const CAT_RANDOM = realGallery({ id:'m1-cat-random', nav:'Noise, noisy tone, random walk, telegraph',
  title:'Random Signals: Noise, a Noisy Tone, a Random Walk and a Telegraph Signal', eyebrow:'Module 1 · Common signals', src:'pp. 2–10',
  objective:'Show four signals whose values are not given by a formula but drawn at random, and hear them.',
  keywords:'catalogue common signals random signal noise white noise noisy sinusoid signal plus noise random walk brown noise random telegraph sound',
  budget:'A catalogue of four random signals; each figure carries its rule and a sound button.',
  figs:[
    [()=>{ const a=P.Axes(EXO({xr:[0,40],yr:[-1.2,1.2],xlabel:'n',ylabel:'w[n]',xstep:10}));
      a.stem(disc(hiss,0,40),{color:C.mid});
      return a.svg(); }, 'White noise $w[n]$: the samples are independent, with zero mean and the same variance. No sample predicts the next one.',
      {items:[{label:'Play noise', sound:()=>({f:t=>hiss(Math.floor(16000*t)), dur:1.5})}]}],
    [()=>{ const a=P.Axes(EXO({xr:[0,3],yr:[-1.8,1.8],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',xstep:1}));
      a.curve(t=>Math.cos(2*Math.PI*t),{color:C.muted,dash:'4 4'});
      a.curve(t=>Math.cos(2*Math.PI*t)+0.35*hiss(Math.floor(60*t)),{color:C.in,n:1800});
      return a.svg(); }, 'Signal plus noise: $x(t)=\\cos(2\\pi f_0t)+\\sigma\\,w(t)$. The dashed curve is the tone alone. A measured signal almost always looks like this.',
      {items:[{label:'Play 440 Hz + noise', sound:()=>({f:t=>Math.cos(2*Math.PI*440*t)+0.5*hiss(Math.floor(16000*t)), dur:2})}]}],
    [()=>{ const w=walkSeq(60,1), a=P.Axes(EXO({xr:[0,60],yr:[-6,6],xlabel:'n',ylabel:'x[n]',xstep:20}));
      a.stem(w.map((v,n)=>[n,v]),{color:C.mid,r:2.6});
      return a.svg(); }, 'Random walk: $x[n]=x[n-1]+w[n]$ with $x[0]=0$. Each step is random, but the sum wanders far from zero.',
      {items:[{label:'Play a random walk', sound:()=>{ const w=walkSeq(16000*2,0.995); return {f:t=>w[Math.floor(16000*t)]||0, dur:2}; }}]}],
    [()=>{ const a=P.Axes(EXO({xr:[0,4],yr:[-1.5,1.5],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',xstep:1}));
      a.curve(TEL,{color:C.in,n:2000});
      return a.svg(); }, 'Random telegraph: $x(t)$ is $+1$ or $-1$ and flips sign at random times. Only the times of the flips are random.',
      {items:[{label:'Play a telegraph signal', sound:()=>{ const f=telegraph(400,1.5); return {f, dur:1.5}; }}]}]
  ],
  notes:[
    {t:'note', kind:'def', head:'No formula for the values', html:'A random signal has a rule for how it is made, not a formula for each value. Run the rule again and the waveform changes; its average behaviour does not.'},
    {t:'note', kind:'def', head:'What we hear', html:'White noise is a hiss. The random walk is a low rumble, because it changes slowly. The telegraph signal crackles.'}
  ]});

/* Small sketches for the summary cards. The summary page is always navy, so
   they are drawn in the dark-page signal tints. */
const G = (()=>{
  const sv = b => `<svg viewBox="0 0 92 44">${b}</svg>`;
  const ln = (d,c,w) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w||2}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const AX='rgba(239,231,216,.30)', CY='#4FBECE', GR='#82C27B', RD='#E8785F', VI='#AC99DC', AM='#E5B255';
  const dots = [...Array(13)].map((_,k)=>{ const x=4+7*k, y=23-13*Math.cos(Math.PI*k/4);
    return ln(`M${x} 23 V${y.toFixed(1)}`,CY,1.4)+`<circle cx="${x}" cy="${y.toFixed(1)}" r="2.2" fill="${CY}"/>`; }).join('');
  return {
    types:  sv(ln('M1 38 H90',AX,1)+ln('M1 38 H7 Q12 38 13 12 Q14 38 22 38',CY)
               +ln('M33 25 Q36 12 39.5 25 T46 25 T52.5 25 T59 25',GR)+ln('M68 38 L90 6',RD)),
    shift:  sv(ln('M1 38 H90',AX,1)+ln('M3 38 H8 V14 H28 V38',CY,1.6)
               +ln('M36 24 H48 M44 20 L48 24 L44 28',AX,1.4)+ln('M56 38 H66 V14 H76 V38 H90',VI)),
    period: sv(ln('M2 26 Q9.5 6 17 26 T32 26 T47 26 T62 26 T77 26 T92 26',GR)
               +ln('M2 9 V4 H32 V9',AM,1.6)),
    impulse:sv(ln('M2 38 H40 M52 38 H90',AX,1)+ln('M21 38 V14',CY)+`<circle cx="21" cy="14" r="3" fill="${CY}"/>`
               +ln('M71 38 V8 M66 14 L71 8 L76 14',AM)),
    dtper:  sv(ln('M1 23 H91',AX,1)+dots),
    bursts: sv(ln('M1 23 H91',AX,1)+[6,36,66].map(x0=>ln('M'+[...Array(21)].map((_,k)=>
               (x0+k).toFixed(1)+','+(23-15*Math.sin(Math.PI*k/20)*Math.sin(1.6*k)).toFixed(1)).join('L'),CY,1.4)).join('')),
    wheel:  sv(`<circle cx="46" cy="22" r="19" fill="none" stroke="${AX}" stroke-width="1.4"/>`
               +[1,2,3,4,5].map(k=>{ const a=k*Math.PI/3; return ln(`M46 22 L${(46+19*Math.cos(a)).toFixed(1)} ${(22-19*Math.sin(a)).toFixed(1)}`,AX,1.2); }).join('')
               +ln('M46 22 L65 22',AM)+`<circle cx="65" cy="22" r="3" fill="${AM}"/>`)
  };
})();
/* Sounds for the slides that play their signal. Each function is the signal
   itself, with t in seconds; the renderer samples it and plays it once. */
const SND = {
  /* a plucked note: three harmonics of f0 under the envelope e^{-dt} */
  pluck:(f0,d)=>t=>Math.exp(-d*t)*(Math.sin(2*Math.PI*f0*t)
    +0.5*Math.sin(4*Math.PI*f0*t)+0.25*Math.sin(6*Math.PI*f0*t)),
  /* four plucked notes 0.4 s apart (C5 E5 G5 C6); it lasts 2 s */
  phrase:t=>{ const F=[523.25,659.25,783.99,1046.5]; let y=0;
    for(let k=0;k<4;k++){ const u=t-0.4*k; if(u>=0) y+=SND.pluck(F[k],6)(u); } return y; }
};
/* An audio signal oscillates too fast to draw cycle by cycle. It is drawn as a
   sound editor draws it: in each pixel column, the band between the lowest and
   the highest value the signal takes there. It lies under the axes, so the
   tick numbers stay readable where the band covers them. */
const waveBand=(a,f,t0,t1,col)=>{
  const lo=Math.max(t0,a.o.xr[0]), hi=Math.min(t1,a.o.xr[1]);
  const n=Math.max(1,Math.round(a.sx(hi)-a.sx(lo))), up=[], dn=[];
  for(let i=0;i<n;i++){ let mx=-Infinity, mn=Infinity;
    for(let j=0;j<=48;j++){ const v=f(lo+(hi-lo)*(i+j/48)/n); if(v>mx) mx=v; if(v<mn) mn=v; }
    const X=a.sx(lo+(hi-lo)*(i+0.5)/n).toFixed(2);
    up.push(X+','+a.sy(mx).toFixed(2)); dn.unshift(X+','+a.sy(mn).toFixed(2)); }
  return a.under(`<path d="M${up.join('L')}L${dn.join('L')}Z" fill="${col}" stroke="${col}" stroke-width="0.6"/>`);
};
/* a number as the slides print it: 0.5, 1.25, -2 */
const num=v=>String(Math.round(v*100)/100);

const SC = [

{ id:'m1-open', module:'M1', nav:'Module 1 opening', title:'Signal Foundations', src:'pp. 2–10',
  dark:true, keywords:'module 1 overview signals', steps:0, blocks:[
  {t:'eyebrow', text:'Module 1 · Signal Foundations', src:'pp. 2–10'},
  {t:'title', level:1, text:'Signal Foundations'},
  {t:'lede', text:'This module gives the signal descriptions needed before we study systems. It defines energy and power, explains changes to the time axis, tests periodicity and introduces complex exponential signals.'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'stack', style:'--ts:1.6;gap:34px', items:[
    {t:'note', kind:'warn', head:'Result 1', html:'<span style="color:var(--graphite)">A signal is <em>energy-type</em>, <em>power-type</em>, or <em>neither</em>. These are not opposites and the third case is real.</span>'},
    {t:'note', kind:'warn', head:'Result 2', html:'<span style="color:var(--graphite)">A discrete-time sinusoid is periodic only when $\\omega_0/2\\pi$ is rational. Continuous-time sinusoids carry no such condition.</span>'}
    ]}
  ], right:[
    /* The page under these two figures is navy, so the axis, the tick numbers
       and the axis names are drawn in the ink of that page. */
    {t:'grid', cols:1, gap:'24px', items:[
      /* The two signals are drawn in rather than shown at rest: the curve traces
         itself and a bright beam then sweeps it every few seconds; the stems rise
         one by one and a wave passes along their tips. The motion reuses the
         module-0 figure classes, so reduced motion and print show the still
         figure. The canvas is narrower than the column, which enlarges the
         labels on screen. */
      [{t:'fig', svg:()=>{
        const a=P.Axes({w:520,h:215,xr:[0,14],yr:[-1.15,1.15],grid:false,
          xlabel:'t',ylabel:'x(t)=e^{-t/6}\\cos(2t)',
          chrome:{axis:'rgba(239,231,216,.34)',tick:'#9EACB9',name:'#E6E2D9'},
          pad:{l:46,r:30,t:22,b:34},xstep:2,ytarget:3});
        const pts=[]; for(let i=0;i<=520;i++){ const t=14*i/520; pts.push([a.sx(t),a.sy(Math.exp(-t/6)*Math.cos(2*t))]); }
        const d='M'+pts.map(p=>p[0].toFixed(2)+','+p[1].toFixed(2)).join('L');
        let len=0; for(let i=1;i<pts.length;i++) len+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);
        const cap='fill="none" stroke-linejoin="round" stroke-linecap="round"';
        a.raw(`<g style="--len:${len.toFixed(1)};--len-neg:${(-len).toFixed(1)};--tail-e:${(140-len).toFixed(1)}">
          <path class="mtf-trace" d="${d}" stroke="#7FC3CE" stroke-width="2.4" ${cap}/>
          <g class="mtf-sparkwrap">
            <path class="mtf-beam-tail" d="${d}" stroke="#7FC3CE" stroke-width="4.5" opacity=".55" ${cap}/>
            <path class="mtf-beam" d="${d}" stroke="#D9F3F7" stroke-width="3" ${cap}/></g></g>`);
        return a.svg();
      }}],
      [{t:'fig', svg:()=>{
        const a=P.Axes({w:520,h:215,xr:[0,27],yr:[-1.15,1.15],grid:false,
          xlabel:'n',ylabel:'x[n]=\\cos(2\\pi n/9)',
          chrome:{axis:'rgba(239,231,216,.34)',tick:'#9EACB9',name:'#E6E2D9'},
          pad:{l:46,r:30,t:22,b:34},xstep:9,ytarget:3});
        disc(n=>Math.cos(2*Math.PI*n/9),0,27).forEach(([n,v])=>{
          const X=a.sx(n).toFixed(2), Y0=a.sy(0).toFixed(2), Y=a.sy(v).toFixed(2);
          a.raw(`<g class="mtf-stem" style="--i:${n};transform-origin:${X}px ${Y0}px">
            <line x1="${X}" y1="${Y0}" x2="${X}" y2="${Y}" stroke="#E3B45E" stroke-width="1.8"/>
            <circle class="mtf-stem-dot" cx="${X}" cy="${Y}" r="4" fill="#E3B45E"/></g>`);
        });
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
      const a=P.Axes({w:560,h:442,xr:[0,8],yr:[-0.15,1.62],xlabel:'t',ylabel:'p(t)',pad:{l:52,r:26,t:20,b:100},xtarget:5,ytarget:3});
      a.area(t=>Math.pow(Math.cos(1.7*t),2),1.2,4.4,{color:'rgba(190,85,57,.18)'});
      a.curve(t=>Math.pow(Math.cos(1.7*t),2),{color:C.coral});
      a.vline(1.2,{color:C.coral}); a.vline(4.4,{color:C.coral});
      a.note(7.8,1.05,'p(t)=v^{2}(t)\\;\\;(R=1)',{anchor:'end',color:C.coral,fs:15,tex:true});
      a.span(1.2,4.4,1.30,'\\text{energy}=\\text{shaded area}',{color:C.coral,tex:true});
      /* a sticky note below the plot: the constant-power rule the integral generalises */
      const nx=a.sx(4), ny=a.sy(-0.5), nw=212*P.labelScale();   /* the text grows with the label scale */
      a.raw(`<g style="--fig-halo:#F3DC7A">
        <rect x="${nx-nw/2+4}" y="${ny-26}" width="${nw}" height="56" rx="2" fill="rgba(0,0,0,.28)"/>
        <rect x="${nx-nw/2}" y="${ny-30}" width="${nw}" height="56" rx="2" fill="#F3DC7A"/>
        <ellipse cx="${nx+3}" cy="${ny-25}" rx="6" ry="3" fill="rgba(0,0,0,.3)"/>
        <circle cx="${nx}" cy="${ny-29}" r="7" fill="#D13B3B"/>
        <circle cx="${nx-2.2}" cy="${ny-31.2}" r="2.2" fill="rgba(255,255,255,.55)"/>`);
      a.note(4,-0.5,'\\text{Energy}=\\text{Power}\\times\\text{Time}',{anchor:'middle',color:'#232B33',fs:15,tex:true,dx:-2,dy:4});
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
      a.note(-6.8,1.28,'\\text{square wave}',{anchor:'start',color:C.in,fs:14,tex:true});
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
    {t:'note', kind:'ok', head:'Energy signal', html:'A signal with finite total energy, $E_\\infty<\\infty$. Its average power then tends to zero, $P_\\infty\\to 0$.'},
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
    {t:'note', kind:'warn', head:'Power signal', html:'A signal with finite, non-zero average power, $0<P_\\infty<\\infty$. Its total energy then diverges, $E_\\infty\\to\\infty$.'},
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
    {t:'fig', code:'energy-pulse', frame:true, grow:true, svg:()=>{
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
      {t:'note', kind:'ok', head:'Solution', html:'$E_\\infty=1$ J and $P_\\infty=0$ W.<span class="chips"><span class="chip yes">Energy signal</span><span class="chip no">Power signal</span></span>'}]},
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
    {t:'note', kind:'def', head:'Given', html:'$x[n]=4$ for every integer $n$.<div class="nsep"></div>Is $x[n]$ an energy signal or a power signal?',
      ask:{key:'m1-ex-energy-b', choices:['Energy signal','Power signal','Neither'], answer:1,
        why:'Every sample adds 16 to the energy sum, so the energy diverges. The next slide shows that the average power is finite.'}},
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

REAL_ENERGY,

{ id:'m1-lab-b', module:'M1', nav:'Laboratory {lab} · Energy and power', title:'Laboratory {lab} — Energy and Power Classifier', src:'pp. 2–3, 7, 16–18',
  objective:'Classify source-grounded signals before seeing the calculation.',
  slide:true, keywords:'laboratory classifier energy power neither interactive', steps:0, blocks:[
  {t:'eyebrow', text:'Interactive laboratory', src:'pp. 2–3'},
  {t:'title', text:'Laboratory {lab} · Energy and Power'},
  {t:'lede', text:'Predict the class from the signal shape. Then use the definitions to test the prediction.'},
  {t:'lab', id:'B'}
]},

{ id:'m1-code-energy', module:'M1', nav:'Code · Energy and power', title:'Energy and Power in Code', src:'pp. 2–3',
  objective:'Compute energy and average power in MATLAB and in Python, and predict each result before running it.',
  keywords:'code matlab python program energy power pulse constant sequence run',
  slide:true, steps:0, budget:'a code page: the program draws its own figure', blocks:[
  {t:'eyebrow', text:'Module 1 · Energy and power in code', src:'pp. 2–3'},
  {t:'title', text:'Energy and Power in Code'},
  {t:'raw', html:()=>CODEBANK.page('m1-code-energy')}
]},

{ id:'m1-shift', module:'M1', nav:'Time shifting', title:'Time shifting', src:'p. 3',
  objective:'Fix the delay/advance sign convention.',
  keywords:'time shift delay advance t0 x(t-t0)',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 1 · Signal operations', src:'p. 3'},
  {t:'title', text:'Time Shifting'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', code:'ops-shift', frame:true, grow:true,
      live:{controls:[{k:'t0', label:'$t_0$', min:-4, max:4, step:0.5, v:3, show:v=>'$'+num(v)+'$ s'}]},
      svg:v=>{
      const t0=v?v.t0:3, tri=t=>Math.abs(t)<=1?1-Math.abs(t):0;
      const a=P.Axes({w:560,h:380,xr:[-5,5],yr:[-0.55,1.7],xlabel:'t',ylabel:'\\text{amplitude}',pad:{l:50,r:26,t:24,b:40},xtarget:11,ytarget:3});
      a.curve(tri,{color:C.ink});
      a.note(0,1.14,'x(t)',{anchor:'middle',color:C.ink,fs:15,tex:true});
      if(t0!==0){
        a.curve(t=>tri(t-t0),{color:C.mid});
        a.note(t0,Math.abs(t0)>=1.5?1.14:1.46,t0>0?'x(t-'+num(t0)+')':'x(t+'+num(-t0)+')',{anchor:'middle',color:C.mid,fs:15,tex:true});
      }
      if(t0!==0){
        const lbl=(t0>0?'delay by ':'advance by ')+num(Math.abs(t0))+' s';
        if(Math.abs(t0)>=2) a.span(Math.min(0,t0),Math.max(0,t0),-0.38,lbl,{color:C.mid});
        else {   // short bracket: set the label beside it, clear of the vertical axis
          a.span(Math.min(0,t0),Math.max(0,t0),-0.38,'',{color:C.mid});
          a.note(t0+(t0>0?0.15:-0.15),-0.38,lbl,{anchor:t0>0?'start':'end',color:C.mid,dy:-2});
        }
      }
      return a.svg(); },
      caption:'Drag $t_0$. The pulse keeps its shape and only its position changes. A positive $t_0$ moves it to the right.'},
    {t:'legend', items:[['muted','$x(t)$'],['mid','$x(t-t_0)$']]}
  ], right:[
    {t:'eq', key:true, tex:'x(t)\\;\\longrightarrow\\;x(t-t_0)', label:'Time shift'},
    {t:'note', kind:'def', head:'Sign convention', html:'$t_0>0$ delays the signal, so the graph moves right. $t_0<0$ advances it, so the graph moves left.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'Read the argument', html:'At time $t$ the shifted signal has the value $x$ had at $t-t_0$. A delay reaches each value later.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'A radar sends the pulse $x(t)$. The echo returns $0.2$ ms later, with $t$ in ms.<div class="nsep"></div>Which signal is the echo?',
        ask:{key:'m1-shift', choices:['$x(t-0.2)$','$x(t+0.2)$'], answer:0,
          why:'The echo arrives later, so it is a delay: $t_0=0.2>0$.'}}]}
  ]}
]},

{ id:'m1-shift-dt', module:'M1', nav:'Time shifting in discrete time', title:'Time shifting in discrete time', src:'p. 3',
  objective:'Apply the delay/advance convention to a sequence with an integer shift.',
  keywords:'time shift discrete sequence delay advance n0 x[n-n0] samples',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 1 · Signal operations', src:'p. 3'},
  {t:'title', text:'Time Shifting in Discrete Time'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', code:'ops-dt', frame:true, grow:true,
      live:{controls:[{k:'n0', label:'$n_0$', min:-4, max:4, step:1, v:2, show:v=>'$'+num(v)+'$'}]},
      svg:v=>{
      const n0=v?v.n0:2, x=n=>n>=0&&n<=3?1-n/4:0, pts=f=>{const r=[];for(let n=-7;n<=7;n++)r.push([n,f(n)]);return r;};
      const a=P.Axes({w:560,h:380,xr:[-7.5,7.5],yr:[-0.55,1.7],xlabel:'n',ylabel:'\\text{amplitude}',pad:{l:50,r:26,t:24,b:40},xstep:1,ytarget:3});
      if(n0!==0) a.stem(pts(n=>x(n-n0)),{color:C.mid});
      a.stem(pts(x),{color:C.ink});
      a.note(0,1.14,'x[n]',{anchor:'middle',color:C.ink,fs:15,tex:true});
      if(n0!==0){
        a.note(n0,Math.abs(n0)>=2?1.14:1.46,n0>0?'x[n-'+num(n0)+']':'x[n+'+num(-n0)+']',{anchor:'middle',color:C.mid,fs:15,tex:true});
        const lbl=(n0>0?'delay by ':'advance by ')+num(Math.abs(n0))+(Math.abs(n0)===1?' sample':' samples');
        if(Math.abs(n0)>=2) a.span(Math.min(0,n0),Math.max(0,n0),-0.38,lbl,{color:C.mid});
        else {   // short bracket: set the label beside it, clear of the vertical axis
          a.span(Math.min(0,n0),Math.max(0,n0),-0.38,'',{color:C.mid});
          a.note(n0+(n0>0?0.3:-0.3),-0.38,lbl,{anchor:n0>0?'start':'end',color:C.mid,dy:-2});
        }
      }
      return a.svg(); },
      caption:'Drag $n_0$. Every sample moves by the same whole number of steps. A positive $n_0$ moves the sequence to the right.'},
    {t:'legend', items:[['muted','$x[n]$'],['mid','$x[n-n_0]$']]}
  ], right:[
    {t:'eq', key:true, tex:'x[n]\\;\\longrightarrow\\;x[n-n_0],\\qquad n_0\\in\\mathbb{Z}', label:'Discrete-time shift'},
    {t:'note', kind:'def', head:'Sign convention', html:'The rule is the same as in continuous time. $n_0>0$ delays the sequence, so the stems move right. $n_0<0$ advances it, so they move left.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Given', html:'$x[n]$ is the sequence drawn here: $x[n]=1-n/4$ for $n=0,1,2,3$.<div class="nsep"></div>What is $y[3]$ for $y[n]=x[n-2]$?',
        ask:{key:'m1-shift-dt', choices:['$x[1]=0.75$','$x[3]=0.25$','$x[5]=0$'], answer:0,
          why:'$y[3]=x[3-2]=x[1]=1-\\tfrac14=0.75$.'}}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Only whole-number shifts', html:'A sequence has values only at integers. So $x[n-\\tfrac12]$ is not defined, and $n_0$ must be an integer.'}]}
  ]}
]},

{ id:'m1-reverse', module:'M1', nav:'Time reversal', title:'Time reversal', src:'pp. 3–4',
  objective:'State time reversal as a reflection about the vertical axis.',
  keywords:'time reversal flip x(-t) reflection support',
  slide:true, steps:2, blocks:[
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
      caption:'Reversal moves the pulse on $[1,3]$ to $[-3,-1]$. The shape is kept; only the order in time changes.'},
    {t:'legend', items:[['muted','$x(t)$'],['mid','$x(-t)$']]}
  ], right:[
    {t:'eq', key:true, tex:'x(t)\\;\\longrightarrow\\;x(-t)\\qquad\\bigl(x[n]\\to x[-n]\\bigr)',
      label:'Time reversal'},
    {t:'note', kind:'def', head:'What it does',
      html:'Reflect the signal about the vertical axis. The value at time $t$ moves to time $-t$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'The support',
        html:'A pulse on $[1,3]$ moves to $[-3,-1]$. The width stays 2.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'$x(t)$ is non-zero only on $[-1,4]$.<div class="nsep"></div>Where is $x(-t)$ non-zero?',
        ask:{key:'m1-reverse', choices:['$[-4,1]$','$[-1,4]$','$[1,4]$'], answer:0,
          why:'$-t$ must lie in $[-1,4]$, so $t$ lies in $[-4,1]$.'}}]}
  ]}
]},

{ id:'m1-reverse-b', module:'M1', nav:'Time reversal: a plucked note', title:'Time reversal: a plucked note', src:'pp. 3–4',
  objective:'Hear time reversal on a signal that is not symmetric in time.',
  keywords:'time reversal plucked note sound backwards decay swell x(-t)',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 1 · Signal operations', src:'pp. 3–4'},
  {t:'title', text:'Time Reversal: a Plucked Note'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const x=t=>t<0?0:SND.pluck(220,4)(t);
      const a=P.Axes({w:560,h:380,xr:[-1.7,1.7],yr:[-2,2.3],xlabel:'t\\ (\\text{s})',ylabel:'\\text{amplitude}',pad:{l:50,r:26,t:24,b:40},xtarget:7,ytarget:5});
      waveBand(a,x,0,1.7,C.ink); waveBand(a,t=>x(-t),-1.7,0,C.mid);
      a.note(0.75,2.05,'x(t)',{anchor:'middle',color:C.ink,fs:15,tex:true});
      a.note(-0.75,2.05,'x(-t)',{anchor:'middle',color:C.mid,fs:15,tex:true});
      return a.svg(); },
      listen:{items:[
          {label:'Play $x(t)$', sound:()=>({f:SND.pluck(220,4), dur:1.5})},
          {label:'Play $x(-t)$', sound:()=>({f:t=>SND.pluck(220,4)(1.5-t), dur:1.5})}]},
      caption:'A plucked guitar string at 220 Hz. Played forwards it starts loud and dies away; played backwards it swells and stops at once. The $x(-t)$ button starts at $t=-1.5$ s, where the note is already too quiet to hear.'},
    {t:'legend', items:[['muted','$x(t)$'],['mid','$x(-t)$']]}
  ], right:[
    {t:'eq', key:true, tex:'x(t)=e^{-4t}\\bigl[\\sin(2\\pi\\,220\\,t)+\\tfrac12\\sin(2\\pi\\,440\\,t)+\\tfrac14\\sin(2\\pi\\,660\\,t)\\bigr],\\quad t\\ge 0',
      label:'The note', note:'The note starts at $t=0$, so $x(t)=0$ for $t<0$.'},
    {t:'note', kind:'def', head:'What you hear',
      html:'$x(t)$ is loudest at $t=0$ and decays. $x(-t)$ is loudest at $t=0$ too, but it grows towards that instant and then stops.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Why a pulse is not enough',
        html:'The pulse on the last slide is the same backwards and forwards in shape. A note that decays is not, so reversal changes what you hear.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'Two sounds: the plucked note $x(t)$ and the steady tone $\\cos(2\\pi\\,440\\,t)$.<div class="nsep"></div>Which one sounds the same played backwards?',
        ask:{key:'m1-reverse-b', choices:['The steady tone','The plucked note'], answer:0,
          why:'$\\cos(-2\\pi\\,440\\,t)=\\cos(2\\pi\\,440\\,t)$, so reversal leaves the tone unchanged.'}}]}
  ]}
]},

{ id:'m1-scale', module:'M1', nav:'Time scaling', title:'Time scaling', src:'pp. 3–4',
  objective:'State time scaling and its effect on the support.',
  keywords:'time scaling compression expansion support width x(at) decimation',
  slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 1 · Signal operations', src:'pp. 3–4'},
  {t:'title', text:'Time Scaling'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', code:'ops-scale', frame:true, grow:true,
      live:{controls:[{k:'a', label:'$a$', min:0.5, max:2.5, step:0.25, v:2, show:v=>'$'+num(v)+'$'}]},
      svg:v=>{
      const k=v?v.a:2, r=t=>(t>=1&&t<=3)?1:0;
      const a=P.Axes({w:560,h:380,xr:[-1,7],yr:[-0.45,2.15],xlabel:'t',ylabel:'\\text{amplitude}',pad:{l:48,r:24,t:20,b:34},xtarget:9,ytarget:3});
      a.curve(r,{color:C.ink});
      a.note(2,1.2,'x(t)',{anchor:'middle',color:C.ink,fs:15,tex:true});
      if(k!==1){
        a.curve(t=>r(k*t),{color:C.mid});
        a.note(2/k,1.62,'x('+num(k)+'t)',{anchor:'middle',color:C.mid,fs:15,tex:true});
      }
      return a.svg(); },
      caption:'Drag $a$. The pulse on $[1,3]$ moves to $[1/a,\\,3/a]$. Its height does not change.'},
    {t:'legend', items:[['muted','$x(t)$'],['mid','$x(at)$']]}
  ], right:[
    {t:'eq', key:true, tex:'y(t)=x(at),\\qquad a>0', label:'Time scaling'},
    {t:'note', kind:'warn', head:'Name the new signal', html:'Write $y(t)=x(at)$. The equation $x(t)=x(at)$ would force $a=1$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\begin{aligned}at&\\in[\\alpha,\\beta]\\\\\\alpha&\\le at\\le\\beta\\\\\\dfrac{\\alpha}{a}&\\le t\\le\\dfrac{\\beta}{a}\\end{aligned}', label:'Map the support',
        note:'For $a>0$, $x(at)$ is non-zero on $[\\alpha/a,\\beta/a]$. The width is divided by $a$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Discrete time is different', html:'$x[2n]$ keeps the even samples and drops the odd ones. $x[n/2]$ is undefined at odd $n$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$x(t)$ is non-zero only on $[2,6]$.<div class="nsep"></div>Where is $y(t)=x(2t)$ non-zero?',
        ask:{key:'m1-scale', choices:['$[1,3]$','$[2,6]$','$[4,12]$'], answer:0,
          why:'$2\\le 2t\\le 6$ gives $1\\le t\\le 3$. The width is halved.'}}]}
  ]}
]},

{ id:'m1-scale-b', module:'M1', nav:'Time scaling: a short melody', title:'Time scaling: a short melody', src:'pp. 3–4',
  objective:'Hear time scaling change both the length and the pitch of a signal.',
  keywords:'time scaling melody sound speed pitch octave frequency x(at)',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 1 · Signal operations', src:'pp. 3–4'},
  {t:'title', text:'Time Scaling: a Short Melody'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=P.Axes({w:560,h:150,xr:[-0.25,4.3],yr:[-2,2],ylabel:'x(t)',pad:{l:48,r:24,t:16,b:14},xtarget:9,ytarget:3});
      waveBand(a,SND.phrase,0,4.3,C.ink);
      return a.svg(); }},
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'a', label:'$a$', min:0.5, max:2.5, step:0.25, v:2, show:v=>'$'+num(v)+'$'}]},
      listen:{items:[
          {label:'Play $x(t)$', sound:()=>({f:SND.phrase, dur:2})},
          {label:'Play $x(at)$', sound:v=>({f:t=>SND.phrase(v.a*t), dur:2/v.a})}]},
      svg:v=>{
      const k=v?v.a:2;
      const a=P.Axes({w:560,h:180,xr:[-0.25,4.3],yr:[-2,2],xlabel:'t\\ (\\text{s})',ylabel:'x('+num(k)+'t)',pad:{l:48,r:24,t:16,b:34},xtarget:9,ytarget:3});
      waveBand(a,t=>SND.phrase(k*t),0,4.3,C.mid);
      return a.svg(); },
      caption:'Four plucked notes, 0.4 s apart. At $a=2$ the melody is twice as fast and an octave higher, like a voice message at double speed.'},
    {t:'legend', items:[['muted','$x(t)$'],['mid','$x(at)$']]}
  ], right:[
    {t:'eq', key:true, tex:'\\sin(2\\pi f_0 t)\\;\\longrightarrow\\;\\sin(2\\pi\\,a f_0\\,t)', label:'One tone under $t\\to at$'},
    {t:'note', kind:'def', head:'What you hear',
      html:'The notes start at $0.4k/a$ s instead of $0.4k$ s, so the melody lasts $2/a$ s. Each pitch is also multiplied by $a$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Why the pitch moves',
        html:'Scaling time by $a$ multiplies every frequency by $a$. At $a=2$ each frequency doubles, which is one octave up.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'A $440$ Hz tone is played as $x(at)$ with $a=\\tfrac12$.<div class="nsep"></div>What pitch do you hear?',
        ask:{key:'m1-scale-b', choices:['$220$ Hz','$440$ Hz','$880$ Hz'], answer:0,
          why:'Scaling time by $a$ multiplies every frequency by $a$: $\\tfrac12\\cdot 440=220$ Hz.'}}]}
  ]}
]},

{ id:'m1-combined', module:'M1', nav:'Combined transformations', title:'Combining operations: shift, then scale', src:'p. 4',
  objective:'Establish the correct two-step order for x(at−b).',
  keywords:'combination shift then scale order x(at-b) intermediate v(t)',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 1 · Signal operations', src:'p. 4'},
  {t:'title', text:'Combined Time Transformations'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[
        {k:'b', label:'(1) shift $b$', min:0, max:4, step:0.25, v:0, show:v=>'$'+num(v)+'$'},
        {k:'a', label:'(2) scale $a$', min:1, max:3, step:0.25, v:1, show:v=>'$'+num(v)+'$'}]},
      svg:v=>{
      /* x(t) stays put. The shift slider moves a copy to v(t)=x(t-b); the scale
         slider then compresses v toward t=0 to y(t)=v(at)=x(at-b). */
      const b=v?v.b:0, k=v?v.a:1;
      const x=t=> t<-2?0 : t<0?1 : t<2?2 : t<4?(4-t) : 0;
      const a=P.Axes({w:560,h:380,xr:[-3,10],yr:[-0.3,2.5],xlabel:'t',ylabel:'x(t)',pad:{l:48,r:24,t:18,b:32},xtarget:9,ytarget:3});
      const arg=b>0?num(k)+'t-'+num(b):num(k)+'t';
      a.curve(x,{color:C.ink,opacity:k>1||b>0?.45:1,n:1200});
      a.note(9.6,2.2,'x(t)',{anchor:'end',color:C.ink,fs:15,tex:true});
      if(b>0){ a.curve(t=>x(t-b),{color:C.mid,dash:k>1?'6 5':null,n:1200});
        a.note(9.6,1.75,'v(t)=x(t-'+num(b)+')',{anchor:'end',color:C.mid,fs:15,tex:true}); }
      if(k>1){ a.curve(t=>x(k*t-b),{color:C.out,n:1200});
        a.note(9.6,1.3,'y(t)=x('+arg+')',{anchor:'end',color:C.out,fs:15,tex:true}); }
      return a.svg(); },
      caption:'Zero for $t<-2$, height 1 on $[-2,0]$, height 2 on $[0,2]$, then a straight fall to 0 at $t=4$. Move $b$ to shift $x(t)$ right, then move $a$ to compress the shifted signal toward $t=0$.'}
  ], right:[
    {t:'eq', key:true, tex:'\\text{(1)}\\quad v(t)=x(t-b)\\qquad\\text{(2)}\\quad y(t)=v(at)=x(at-b)',
      label:'Shift, then scale', note:'Shift by $b$ first. Then scale the result by $a$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'err', head:'The other order', html:'Scaling first, then shifting by $b$, gives $x(at-ab)$. Unless $a=1$, that is a different signal.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'$x(t)$ is the signal drawn here.<div class="nsep"></div>Plot $x(3t-5)$.',
        ask:{key:'m1-combined', q:'Predict first: at what time does $y(t)$ take the value $x(0)$?',
          choices:['$t=-5/3$','$t=5/3$','$t=5$','$t=15$'], answer:1,
          why:'The value $x(0)$ appears where the argument is zero: $3t-5=0$ gives $t=5/3$.'}}]}
  ]}
]},

{ id:'m1-combined-b', module:'M1', nav:'Plotting the result', title:'Plotting $x(3t-5)$', src:'p. 4',
  objective:'Plot $x(3t-5)$ by shifting right by 5 and then compressing by 3.',
  keywords:'x(3t-5) shift compress corners support width check',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 1 · Signal operations', src:'p. 4'},
  {t:'title', text:'Plotting $x(3t-5)$'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, sketch:{label:'Sketch $y(t)$ on the axes, then check it.'}, code:'ops-combined', svg:()=>{
      /* x(t) is the faint reference. The answer is the .sk-key group, which the
         slide keeps hidden until the reader asks for it. */
      const x=t=> t<-2?0 : t<0?1 : t<2?2 : t<4?(4-t) : 0;
      const a=P.Axes({w:560,h:380,xr:[-3,10],yr:[-0.3,2.5],xlabel:'t',ylabel:'y(t)',pad:{l:48,r:24,t:18,b:32},xtarget:9,ytarget:3});
      a.raw(`<rect class="sk-area" x="${a.x0}" y="${a.y1}" width="${a.x1-a.x0}" height="${a.y0-a.y1}" fill="none"/>`);
      a.curve(x,{color:C.ink,opacity:.35,dash:'6 5',n:1200});
      a.note(4.3,1.2,'x(t)',{color:C.ink,fs:15,tex:true});
      a.raw('<g class="sk-key">');
      a.curve(t=>x(3*t-5),{color:C.out,n:1200});
      a.note(9.6,2.2,'y(t)=x(3t-5)',{anchor:'end',color:C.out,fs:15,tex:true});
      [1,5/3,7/3,3].forEach(b=>a.vline(b,{color:C.out,opacity:.5}));
      a.raw('</g>');
      return a.svg(); },
      caption:'The dashed trace is $x(t)$. Draw where each of its corners lands, then show the answer.'}
  ], right:[
    {t:'note', kind:'def', head:'Method', html:'Each original corner $c$ moves to the time that satisfies $3t-5=c$.<ol class="steps"><li>Read the corners of $x(t)$: $c=-2,0,2,4$.</li><li>Solve $3t-5=c$ for $t$ at each corner.</li><li>Carry each height to its new time and join the points.</li></ol>'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\begin{aligned}3t-5&=c\\\\t&=\\dfrac{c+5}{3}\\\\c=-2,0,2,4&\\;\\Longrightarrow\\;t=1,\\dfrac53,\\dfrac73,3\\end{aligned}', label:'Map every corner'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Solution and check', html:'The support is $[1,3]$, so its width is $2=6/3$. At $t=5/3$, $3t-5=0$, so $y(5/3)=x(0)=2$.'}]}
  ]}
]},

REAL_TRANSFORM,

{ id:'m1-lab-a', module:'M1', nav:'Laboratory {lab} · Transformations', title:'Laboratory {lab} — Signal Transformation Laboratory', src:'pp. 3–4',
  objective:'Explore x(at−b) with live support and critical-point tracking.',
  slide:true, keywords:'laboratory transformation shift scale reversal support critical points', steps:0, blocks:[
  {t:'eyebrow', text:'Interactive laboratory', src:'pp. 3–4'},
  {t:'title', text:'Laboratory {lab} · Signal Transformations'},
  {t:'lab', id:'A'}
]},

{ id:'m1-code-ops', module:'M1', nav:'Code · Signal operations', title:'Signal Operations in Code', src:'pp. 3–4',
  objective:'Shift, reverse and scale a signal in MATLAB and in Python, and predict each result before running it.',
  keywords:'code matlab python program shift reversal scaling x(3t-5) run',
  slide:true, steps:0, budget:'a code page: the program draws its own figure', blocks:[
  {t:'eyebrow', text:'Module 1 · Signal operations in code', src:'pp. 3–4'},
  {t:'title', text:'Signal Operations in Code'},
  {t:'raw', html:()=>CODEBANK.page('m1-code-ops')}
]},

{ id:'m1-periodic', module:'M1', nav:'Periodicity', title:'Periodicity', src:'p. 5',
  objective:'Define CT and DT periodicity and the fundamental period.',
  keywords:'periodic aperiodic fundamental period T0 N0 omega0 fundamental frequency',
  slide:true, steps:3, blocks:[
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
        note:'$T_0$ is the smallest such $T$. Every positive integer multiple of $T_0$ is also a period.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$x(t)=\\cos(\\pi t/3)$.<div class="nsep"></div>What is its fundamental period?',
        ask:{key:'m1-periodic', choices:['$T_0=3$','$T_0=6$','$T_0=\\pi/3$'], answer:1,
          why:'$\\omega_0=\\pi/3$, so $T_0=2\\pi/\\omega_0=6$.'}}]}
  ]}
]},

{ id:'m1-periodic-b', module:'M1', nav:'Discrete-time period', title:'A Discrete-Time Period', src:'p. 5',
  objective:'State the discrete-time period and the fundamental frequency.',
  keywords:'periodic N0 integer fundamental frequency',
  slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 1 · Periodicity', src:'p. 5'},
  {t:'title', text:'A Discrete-Time Period'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const f=n=>{const u=((n%8)+8)%8; return [1,3,5,3,1,0,-1,0][u];};
      const a=P.Axes({w:560,h:460,xr:[-16,16],yr:[-1.8,7],xlabel:'n',ylabel:'y[n]',pad:{l:56,r:26,t:22,b:100},xtarget:9,ytarget:4});
      a.stem(disc(f,-16,16),{color:C.mid});
      a.span(0,8,5.4,'N_0=8',{color:C.coral,tex:true});
      /* sticky notes below the plot: the period is an integer; N0 is the smallest one */
      const sticky=(x,y,w,rot,tex)=>{
        const nx=a.sx(x), ny=a.sy(y);
        a.raw(`<g transform="rotate(${rot} ${nx} ${ny})" style="--fig-halo:#F3DC7A">
          <rect x="${nx-w/2+4}" y="${ny-26}" width="${w}" height="56" rx="2" fill="rgba(0,0,0,.28)"/>
          <rect x="${nx-w/2}" y="${ny-30}" width="${w}" height="56" rx="2" fill="#F3DC7A"/>
          <ellipse cx="${nx+3}" cy="${ny-25}" rx="6" ry="3" fill="rgba(0,0,0,.3)"/>
          <circle cx="${nx}" cy="${ny-29}" r="7" fill="#D13B3B"/>
          <circle cx="${nx-2.2}" cy="${ny-31.2}" r="2.2" fill="rgba(255,255,255,.55)"/>`);
        a.note(x,y,tex,{anchor:'middle',color:'#232B33',fs:15,tex:true,dx:-2,dy:4});
        a.raw('</g>'); };
      sticky(-8,-3.2,210,0,'N\\text{ must be an integer}');
      sticky(8,-3.2,210,0,'N_0=\\text{smallest }N>0');
      return a.svg(); },
      caption:'Periods $N=8,16,24,\\dots$; the fundamental period is $N_0=8$.'}
  ], right:[
    {t:'note', kind:'def', head:'Discrete time', html:'$x[n]$ is periodic if some integer $N>0$ satisfies $x[n]=x[n+N]$ for every integer $n$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'The period is an integer', html:'The sequence exists only at integer indices. A value such as 3.5 samples cannot be a period.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'\\omega_0=\\dfrac{2\\pi}{N_0}', label:'Fundamental frequency',
        note:'$N_0$ is the smallest such positive integer.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$x[n]=(-1)^{n}$.<div class="nsep"></div>What is its fundamental period?',
        ask:{key:'m1-periodic-b', choices:['$N_0=1$','$N_0=2$','Not periodic'], answer:1,
          why:'$(-1)^{n+2}=(-1)^{n}$ for every $n$, but $(-1)^{n+1}=-(-1)^{n}$, so $N=1$ fails.'}}]}
  ]}
]},

{ id:'m1-evenodd', module:'M1', nav:'Even and odd', title:'Even and odd parts', src:'pp. 5–6',
  objective:'Define even/odd and the unique decomposition.',
  keywords:'even odd decomposition Ev Od symmetry x(0)=0',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 1 · Symmetry', src:'pp. 5–6'},
  {t:'title', text:'Even and Odd Decomposition'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:560,h:218,xr:[-1,1],yr:[-1.15,1.15],xlabel:'t',ylabel:'x(t)',pad:{l:44,r:20,t:20,b:34},xtarget:3,ytarget:3});
      a.curve(t=>t*t,{color:C.in}); a.vline(0,{color:C.err,dash:'5 4',width:1.6,opacity:1});
      a.poly([[-0.7,0.49],[0.7,0.49]],{color:C.err,dash:'4 4',width:1.2});
      a.point(-0.7,0.49,{color:C.in}); a.point(0.7,0.49,{color:C.in});
      a.note(0.04,-0.62,'axis of symmetry, t = 0',{color:C.err,fs:13});
      return a.svg(); },
      caption:'$t^2$ is even: the graph is its own mirror image about the axis $t=0$.'},
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:560,h:218,xr:[-1,1],yr:[-1.15,1.15],xlabel:'t',ylabel:'x(t)',pad:{l:44,r:20,t:20,b:34},xtarget:3,ytarget:3});
      a.curve(t=>t*t*t,{color:C.mid});
      a.poly([[-0.8,-0.512],[0.8,0.512]],{color:C.err,dash:'4 4',width:1.2});
      a.point(-0.8,-0.512,{color:C.mid}); a.point(0.8,0.512,{color:C.mid}); a.point(0,0,{color:C.err});
      a.note(0.06,-0.62,'centre of symmetry: the origin',{color:C.err,fs:13});
      return a.svg(); },
      caption:'$t^3$ is odd: a half-turn about the origin maps the graph onto itself, so $x(0)=0$.'}
  ], right:[
    {t:'note', kind:'def', head:'Even signal', html:'$x(t)=x(-t)$ for every $t$. In discrete time, $x[n]=x[-n]$.'},
    {t:'note', kind:'def', head:'Odd signal', html:'$x(t)=-x(-t)$ for every $t$. In discrete time, $x[n]=-x[-n]$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'Check the origin', html:'An odd signal satisfies $x(0)=-x(0)$, so $x(0)=0$. A signal with $x(0)\\neq 0$ is not odd.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'$x(t)=t\\sin t$.<div class="nsep"></div>Is $x(t)$ even, odd, or neither?',
        ask:{key:'m1-evenodd', choices:['Even','Odd','Neither'], answer:0,
          why:'$x(-t)=(-t)\\sin(-t)=t\\sin t=x(t)$.'}}]}
  ]}
]},

{ id:'m1-evenodd-quiz', module:'M1', nav:'Even or odd? · quiz', title:'Even, odd, or neither', src:'pp. 5–6',
  objective:'Classify four signals as even, odd, or neither from their graphs.',
  keywords:'quiz even odd neither symmetry classify graph',
  budget:'Four graph cards, each with a three-way prediction.',
  slide:true, steps:0, blocks:[
  {t:'eyebrow', text:'Module 1 · Quick check', src:'pp. 5–6'},
  {t:'title', text:'Even, Odd, or Neither?'},
  {t:'grid', cols:4, gap:'24px 22px', style:'flex:1;padding-bottom:8px', items:[
    [{t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:360,h:360,xr:[-2,2],yr:[-1.3,1.3],xlabel:'t',ylabel:'x_1(t)',pad:{l:40,r:18,t:20,b:34},xtarget:5,ytarget:3});
      a.curve(t=>Math.cos(Math.PI*t),{color:C.in}); return a.svg(); }},
     {t:'note', kind:'def', head:'Signal 1', html:'$x_1(t)=\\cos(\\pi t)$ is',
      ask:{key:'m1-eo-q1', choices:['Even','Odd','Neither'], answer:0,
        why:'$\\cos(-\\pi t)=\\cos(\\pi t)$: the graph mirrors about $t=0$.'}}],
    [{t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:360,h:360,xr:[-2,2],yr:[-1.3,1.3],xlabel:'t',ylabel:'x_2(t)',pad:{l:40,r:18,t:20,b:34},xtarget:5,ytarget:3});
      a.curve(t=>Math.sin(Math.PI*t),{color:C.in}); return a.svg(); }},
     {t:'note', kind:'def', head:'Signal 2', html:'$x_2(t)=\\sin(\\pi t)$ is',
      ask:{key:'m1-eo-q2', choices:['Even','Odd','Neither'], answer:1,
        why:'$\\sin(-\\pi t)=-\\sin(\\pi t)$: a half-turn about the origin maps the graph onto itself.'}}],
    [{t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:360,h:360,xr:[-2,2],yr:[-0.3,1.3],xlabel:'t',ylabel:'x_3(t)',pad:{l:40,r:18,t:20,b:34},xtarget:5,ytarget:2});
      a.curve(t=>t<0?0:Math.exp(-2*t),{color:C.in,n:1200}); return a.svg(); }},
     {t:'note', kind:'def', head:'Signal 3', html:'$x_3(t)=e^{-2t}u(t)$ is',
      ask:{key:'m1-eo-q3', choices:['Even','Odd','Neither'], answer:2,
        why:'$x_3(-1)=0$ but $x_3(1)=e^{-2}$, so it is not even; $x_3(0)=1\\neq0$, so it is not odd.'}}],
    [{t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:360,h:360,xr:[-4,4],yr:[-3.6,3.6],xlabel:'n',ylabel:'x_4[n]',pad:{l:40,r:18,t:20,b:34},xtarget:9,ytarget:3});
      a.stem(disc(n=>Math.abs(n)<=3?n:0,-4,4),{color:C.in}); return a.svg(); }},
     {t:'note', kind:'def', head:'Signal 4', html:'$x_4[n]=n$ for $|n|\\le 3$, else 0, is',
      ask:{key:'m1-eo-q4', choices:['Even','Odd','Neither'], answer:1,
        why:'$x_4[-n]=-x_4[n]$ at every $n$, and $x_4[0]=0$.'}}]
  ]}
]},

{ id:'m1-evenodd-b', module:'M1', nav:'Even–odd decomposition', title:'Even and Odd Parts', src:'pp. 5–6',
  objective:'Split a signal into its even and odd parts.',
  keywords:'even part odd part decomposition Ev Od',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 1 · Symmetry', src:'pp. 5–6'},
  {t:'title', text:'Even and Odd Parts'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', code:'evenodd-parts', frame:true, svg:()=>{
      const x=t=>(t>0&&t<1)?1:0;
      const rows=[
        [t=>x(t),'x(t)',C.h],
        [t=>0.5*(x(t)+x(-t)),'\\Ev\\{x(t)\\}',C.in],
        [t=>0.5*(x(t)-x(-t)),'\\Od\\{x(t)\\}',C.mid]];
      return rows.map(function(r,i){
        const odd=i===2;
        const a=P.Axes({w:560,h:odd?176:140,xr:[-2,2],yr:odd?[-1.2,1.0]:[-0.25,1.45],xlabel:'t',ylabel:r[1],
          xnameRight:22,xnameDrop:odd?44:40,pad:{l:52,r:24,t:26,b:24},xticksOverride:[-2,-1,1,2],
          yticksOverride:odd?[-0.5,0.5]:[0.5,1],xtickfmt:v=>odd?'':String(v),ytickfmt:()=>''});
        if(i===0) a.curve(t=>x(-t),{color:C.muted,dash:'4 4',n:1600});
        if(i>0){ const sg=odd?-1:1;
          a.area(t=>0.5,0,1,{color:C.h+'40'});
          a.area(t=>0.5*sg,-1,0,{color:C.muted+'40'});
          a.note(0.5,odd?0.72:0.8,'\\tfrac12\\,x(t)',{anchor:'middle',color:C.h,fs:14,tex:true});
          a.note(-0.5,odd?-0.9:0.8,(odd?'-':'')+'\\tfrac12\\,x(-t)',{anchor:'middle',color:C.muted,fs:14,tex:true}); }
        a.curve(r[0],{color:r[2],width:2.6,n:1600});
        if(i===0){ a.note(-0.5,1.25,'x(-t)',{anchor:'middle',color:C.muted,fs:13,tex:true});
          a.note(1.08,1,'1',{anchor:'start',color:r[2],fs:14,tex:true}); }
        return a.svg(); }).join(''); },
      caption:'A unit pulse on $0<t<1$ and its mirror $x(-t)$ (dashed). The shaded blocks are the two halves: $\\tfrac12 x(t)$ on the right and $\\tfrac12 x(-t)$ on the left. The even part adds them; the odd part subtracts the mirror, so the left block flips below the axis. Adding the second and third rows gives back the first at every $t$.'},
    {t:'legend', items:[['h','$x(t)$'],['in','$\\Ev\\{x(t)\\}$'],['mid','$\\Od\\{x(t)\\}$']]}
  ], right:[
    {t:'eq', tex:'\\Ev\\{x(t)\\}=\\tfrac12 x(t)+\\tfrac12 x(-t)', label:'Even part'},
    {t:'eq', tex:'\\Od\\{x(t)\\}=\\tfrac12 x(t)-\\tfrac12 x(-t)', label:'Odd part'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'\\begin{aligned}\\Ev\\{x(t)\\}+\\Od\\{x(t)\\}&=\\tfrac12[x(t)+x(-t)]+\\tfrac12[x(t)-x(-t)]\\\\&=\\tfrac12[2x(t)]\\\\&=x(t)\\end{aligned}', label:'Decomposition',
        note:'The $x(-t)$ terms cancel. The same construction works for $x[n]$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'$x(t)=t+1$.<div class="nsep"></div>What is $\\Od\\{x(t)\\}$?',
        ask:{key:'m1-evenodd-b', choices:['$t$','$1$','$t+1$'], answer:0,
          why:'$\\tfrac12(t+1)-\\tfrac12(-t+1)=t$.'}}]}
  ]}
]},

REAL_PERIODIC,

{ id:'m1-lab-k', module:'M1', nav:'Laboratory {lab} · Even and odd', title:'Laboratory {lab} — Even and Odd Parts', src:'pp. 5–6',
  objective:'Build the even and odd parts of a shifted signal and read its symmetry from them.',
  slide:true, keywords:'laboratory even odd parts decomposition symmetry shift origin', steps:0, blocks:[
  {t:'eyebrow', text:'Interactive laboratory', src:'pp. 5–6'},
  {t:'title', text:'Laboratory {lab} · Even and Odd Parts'},
  {t:'lede', text:'Shift the signal. Its even and odd parts come from $x(t)$ and $x(-t)$, not from the look of the graph.'},
  {t:'lab', id:'K'}
]},

{ id:'m1-code-periodic', module:'M1', nav:'Code · Periodicity and symmetry', title:'Periodicity and Symmetry in Code', src:'pp. 5–6',
  objective:'Find a period and split a signal into even and odd parts in MATLAB and in Python.',
  keywords:'code matlab python program period even odd parts run',
  slide:true, steps:0, budget:'a code page: the program draws its own figure', blocks:[
  {t:'eyebrow', text:'Module 1 · Periodicity and symmetry in code', src:'pp. 5–6'},
  {t:'title', text:'Periodicity and Symmetry in Code'},
  {t:'raw', html:()=>CODEBANK.page('m1-code-periodic')}
]},

{ id:'m1-dt-impulse', module:'M1', nav:'DT impulse', title:'The discrete-time impulse', src:'p. 6',
  objective:'Define the discrete-time unit impulse δ[n].',
  keywords:'delta[n] unit impulse discrete time sequence',
  slide:true, steps:0, blocks:[
  {t:'eyebrow', text:'Module 1 · Impulse and step', src:'p. 6'},
  {t:'title', text:'Discrete-Time Unit Impulse'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=P.Axes({w:560,h:380,xr:[-3,5],yr:[-0.25,1.35],xlabel:'n',ylabel:'\\delta[n]',pad:{l:48,r:24,t:20,b:34},xtarget:9,ytarget:2});
      a.stem(disc(n=>n===0?1:0,-3,5),{color:C.in,showZero:false});
      a.note(4.6,1.15,'\\delta[n]',{anchor:'end',color:C.in,fs:16,tex:true});
      return a.svg(); },
      caption:'The discrete-time impulse is the sequence that equals 1 at $n=0$ and 0 elsewhere.'}
  ], right:[
    {t:'eq', tex:'\\delta[n]=\\begin{cases}1,&n=0\\\\0,&\\text{otherwise}\\end{cases}', label:'Unit impulse',
      note:'An ordinary sequence. Nothing here is infinite.'}
  ]}
]},

{ id:'m1-dt-step', module:'M1', nav:'DT step', title:'The discrete-time step', src:'p. 6',
  objective:'Define the discrete-time unit step u[n].',
  keywords:'u[n] unit step discrete time sequence',
  slide:true, steps:0, blocks:[
  {t:'eyebrow', text:'Module 1 · Impulse and step', src:'p. 6'},
  {t:'title', text:'Discrete-Time Unit Step'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$u[n]$','$\\delta[n]$','$\\delta[n]+\\delta[n-1]$',
        '$\\delta[n]+\\cdots+\\delta[n-2]$','$\\delta[n]+\\cdots+\\delta[n-3]$',
        '$\\delta[n]+\\cdots+\\delta[n-4]$','$\\delta[n]+\\cdots+\\delta[n-5]$']},
      svg:v=>{
      const a=P.Axes({w:560,h:380,xr:[-3,5],yr:[-0.25,1.45],xlabel:'n',ylabel:'u[n]',pad:{l:48,r:24,t:20,b:34},xtarget:9,ytarget:2});
      /* Frame 0 is the printed step. Going to frame 1 lowers every sample but
         n=0, which is delta[n]; from there delta[n-m] rises while the frame
         runs from m to m+1 and keeps the impulse colour until the next one
         starts. Frame 6 is the step again. */
      const k=v?v.frame:0, done=k<=1e-9||k>=6-1e-9;
      const cur=done?-1:k<=1?0:Math.ceil(k-1e-9)-1;
      a.stem(disc(()=>0,-3,5),{color:C.h,showZero:false});
      for(let m=0;m<=5;m++){
        const f=m===0?1:k<=1?1-k:Math.max(0,Math.min(1,k-m));
        if(f<=0) continue;
        a.stem([[m,f]],{color:m===cur?C.in:C.h});
      }
      if(cur>=0) a.note(cur<5?cur:5.2,1.26,cur?'\\delta[n-'+cur+']':'\\delta[n]',{anchor:cur<5?'middle':'end',color:C.in,fs:15,tex:true});
      if(done) a.note(4.6,1.2,'u[n]',{anchor:'end',color:C.h,fs:16,tex:true});
      return a.svg(); },
      caption:'The discrete-time step equals 1 from $n=0$ onward and 0 before it. Step through the frames to build it one shifted impulse at a time.'},
    {t:'legend', items:[['h','$u[n]$'],['in','$\\delta[n-m]$']]}
  ], right:[
    {t:'eq', tex:'u[n]=\\begin{cases}1,&n\\ge 0\\\\0,&\\text{otherwise}\\end{cases}', label:'Unit step',
      note:'The sample at $n=0$ is included: $u[0]=1$.'},
    {t:'eq', tex:'u[n]=\\delta[n]+\\delta[n-1]+\\delta[n-2]+\\cdots', label:'A sum of impulses',
      note:'Each shifted impulse $\\delta[n-m]$ places one unit sample at $n=m$.'}
  ]}
]},

{ id:'m1-dt-impulse-b', module:'M1', nav:'First difference', title:'Difference and Running Sum', src:'p. 6',
  objective:'Relate the discrete-time step and impulse by a difference and a sum.',
  keywords:'first difference running sum u[n] delta[n]',
  slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 1 · Impulse and step', src:'p. 6'},
  {t:'title', text:'Difference and Running Sum'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$u[n]$ and $-u[n-1]$','cancel $n=1$','cancel through $n=2$','cancel through $n=3$',
        'cancel through $n=4$','$n=0$ is left: $\\delta[n]$']},
      svg:v=>{
      const a=P.Axes({w:560,h:380,xr:[-3,5],yr:[-1.35,1.35],xlabel:'n',ylabel:'\\text{amplitude}',pad:{l:48,r:24,t:20,b:34},xtarget:9,ytarget:3});
      /* The frames collapse the pairs u[n], -u[n-1] onto the axis one index at
         a time. Pair n shrinks while the frame runs from n-1 to n; once every
         pair is gone the sample left at n=0 is marked as delta[n]. Frame 0 is
         the printed figure. */
      const k=v?v.frame:0, done=k>=5-1e-9;
      a.stem(disc(n=>n>=0&&n<1?1:0,-3,0),{color:done?C.out:C.h,width:done?2.6:undefined});
      a.stem(disc(()=>0,-3,0),{color:C.mid});
      for(let n=1;n<=5;n++){
        const f=Math.max(0,Math.min(1,n-k));
        if(f>0){ a.stem([[n,f]],{color:C.h}); a.stem([[n,-f]],{color:C.mid}); }
        else a.raw(`<circle cx="${a.sx(n).toFixed(2)}" cy="${a.sy(0).toFixed(2)}" r="4.2" fill="none" stroke="${C.muted}" stroke-width="1.6"/>`);
      }
      if(done) a.note(0.25,1.15,'\\delta[n]',{color:C.out,fs:16,tex:true});
      else {
        a.note(4.6,1.15,'u[n]',{anchor:'end',color:C.h,fs:15,tex:true});
        a.note(-2.85,-1.1,'-u[n-1]',{color:C.mid,fs:15,tex:true});
      }
      return a.svg(); },
      caption:'The two sequences cancel for every $n\\ge1$. Only $n=0$ survives, and it gives $\\delta[n]$.'},
    {t:'legend', items:[['h','$u[n]$'],['mid','$-u[n-1]$']]}
  ], right:[
    {t:'eq', key:true, side:true, tex:'\\delta[n]=u[n]-u[n-1]', label:'First difference',
      note:'The delay cancels the flat part of the step and leaves one sample.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'u[n]=\\sum_{k=0}^{\\infty}\\delta[n-k]', label:'Running sum'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'The two operations invert each other', html:'A first difference reverses a running sum. A running sum reverses a first difference. They are the discrete-time forms of differentiation and integration.'}]}
  ]}
]},

{ id:'m1-dt-step-rep', module:'M1', nav:'Step as weighted impulses', title:'The step as a sum of weighted impulses', src:'p. 6',
  objective:'Read u[n] as a sum of shifted impulses weighted by its own samples.',
  keywords:'representation u[n] sum u[k] delta[n-k] weighted shifted impulses',
  slide:true, steps:0, blocks:[
  {t:'eyebrow', text:'Module 1 · Impulse and step', src:'p. 6'},
  {t:'title', text:'The Step as Weighted Impulses'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$u[n]$','$k=-2$: $u[-2]\\,\\delta[n+2]=0$','$k=-1$: $u[-1]\\,\\delta[n+1]=0$',
        '$k=0$: $u[0]\\,\\delta[n]$','$k=1$: $u[1]\\,\\delta[n-1]$','$k=2$: $u[2]\\,\\delta[n-2]$',
        '$k=3$: $u[3]\\,\\delta[n-3]$','$k=4$: $u[4]\\,\\delta[n-4]$','$\\sum_k u[k]\\,\\delta[n-k]=u[n]$']},
      svg:v=>{
      const a=P.Axes({w:560,h:380,xr:[-3,5],yr:[-0.25,1.45],xlabel:'n',ylabel:'\\text{amplitude}',pad:{l:48,r:24,t:20,b:34},xtarget:9,ytarget:2});
      /* Frame 0 and the last frame show u[n]. In between, frame i adds the
         term k=i-3: an impulse at n=k scaled by u[k]. For k<0 the weight is
         0, so the term is marked by an open circle on the axis and adds
         nothing; for k>=0 it rises to 1 while the frame runs from i-1 to i. */
      const k=v?v.frame:0, last=8, done=k<=1e-9||k>=last-1e-9;
      const c=Math.ceil(k-1e-9)-3, cur=done||c>4?null:c;
      a.stem(disc(()=>0,-3,5),{color:C.h,showZero:false});
      for(let m=-2;m<=4;m++){
        const f=done?1:Math.max(0,Math.min(1,k-(m+2)));
        if(f<=0) continue;
        const w=m>=0?1:0, col=m===cur?C.in:C.h;
        if(w) a.stem([[m,f]],{color:col});
        else if(m===cur) a.raw(`<circle cx="${a.sx(m).toFixed(2)}" cy="${a.sy(0).toFixed(2)}" r="5" fill="none" stroke="${C.in}" stroke-width="2" opacity="${f.toFixed(3)}"/>`);
      }
      const f5=done?1:Math.max(0,Math.min(1,k-7));
      if(f5>0) a.stem([[5,f5]],{color:C.h});
      if(cur!=null){
        const lab=cur===0?'u[0]\\,\\delta[n]':cur<0?'u['+cur+']\\,\\delta[n+'+(-cur)+']=0':'u['+cur+']\\,\\delta[n-'+cur+']';
        a.note(cur<3?cur:3.2,cur<0?0.32:1.26,lab,{anchor:cur<3?'middle':'end',color:C.in,fs:15,tex:true});
      }
      if(done||c>4) a.note(4.6,1.26,'u[n]',{anchor:'end',color:C.h,fs:16,tex:true});
      return a.svg(); },
      caption:'Each term is an impulse at $n=k$ scaled by the sample $u[k]$. Terms with $k<0$ have weight 0; terms with $k\\ge0$ add one unit sample.'},
    {t:'legend', items:[['h','$u[n]$'],['in','$u[k]\\,\\delta[n-k]$']]}
  ], right:[
    {t:'eq', key:true, tex:'u[n]=\\sum_{k=-\\infty}^{\\infty}u[k]\\,\\delta[n-k]', label:'Representation',
      note:'Each shifted impulse places one sample at its index.'},
    {t:'eq', tex:'u[k]\\,\\delta[n-k]=\\begin{cases}\\delta[n-k],&k\\ge0\\\\0,&k<0\\end{cases}', label:'One term',
      note:'The weights $u[k]$ switch off every term with $k<0$, so only the terms with $k\\ge0$ remain. That is the running sum of the previous slide.'}
  ]}
]},

{ id:'m1-dt-sift', module:'M1', nav:'Sampling and sifting (DT)', title:'Sampling and sifting properties', src:'pp. 6–7',
  objective:'Distinguish the two properties and verify both on the definition example.',
  keywords:'sampling property sifting property delta n0 x[n0]',
  slide:true, steps:1, blocks:[
  {t:'eyebrow', text:'Module 1 · Impulse and step', src:'pp. 6–7'},
  {t:'title', text:'Discrete-Time Sampling and Sifting'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$x[n]$','multiply by $\\delta[n-2]$','$x[n]\\,\\delta[n-2]=3\\,\\delta[n-2]$']},
      svg:v=>{
      const a=P.Axes({w:560,h:380,xr:[-1,5],yr:[-0.3,3.6],xlabel:'n',ylabel:'x[n]',pad:{l:48,r:24,t:20,b:34},xtarget:7,ytarget:3});
      /* Frame 0 shows x[n], the printed figure. Going to frame 1 fades the
         window delta[n-2] in over n=2; going to frame 2 lowers every other
         sample to zero and turns the kept one into the output. */
      const k=v?v.frame:0, cl=u=>Math.max(0,Math.min(1,u)), w=cl(k), d=cl(k-1);
      const g=(o,f)=>{ if(o<=0) return; a.raw(`<g opacity="${o.toFixed(3)}">`); f(); a.raw('</g>'); };
      g(w,()=>a.rect(1.72,0,2.28,3.4,{fill:C.h+'1F',stroke:C.h,width:1.6,dash:'5 4'}));
      a.stem(disc(n=>n>=0&&n<=1?(n+1)*(1-d):0,-1,5).filter(([n])=>n!==2),{color:C.in});
      a.stem([[2,3]],{color:d>0?C.out:C.in,width:d>0?2.6:undefined});
      g(Math.min(w,1-2*d),()=>a.note(2.45,3.2,'\\delta[n-2]',{color:C.h,fs:16,tex:true}));
      g(2*d-1,()=>a.note(2.45,3.2,'3\\,\\delta[n-2]',{color:C.out,fs:16,tex:true}));
      g(1-d,()=>a.note(4.6,3.2,'x[n]',{anchor:'end',color:C.in,fs:15,tex:true}));
      return a.svg(); },
      caption:'Multiplying by $\\delta[n-2]$ keeps the sample at $n=2$ and sets every other sample to zero.'}
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
    {t:'fig', code:'impulse-dt-sift', frame:true, grow:true, svg:()=>{
      const a=P.Axes({w:560,h:380,xr:[-1,5],yr:[-0.3,3.6],xlabel:'n',ylabel:'x[n]\\delta[n-2]',ynameAtAxis:true,pad:{l:48,r:24,t:20,b:34},xtarget:7,ytarget:3});
      a.stem(disc(n=>n===2?3:0,-1,5),{color:C.out});
      a.note(4.6,3.2,'x[n]\\cdot\\delta[n-2]=3\\delta[n-2]',{anchor:'end',color:C.out,fs:15,tex:true});
      return a.svg(); },
      caption:'The product is a <em>sequence</em>. The sifting property gives the number obtained by summing it.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$n_0=2$, and $x[0]=1$, $x[1]=2$, $x[2]=3$.<div class="nsep"></div>Find the sampled sequence and the sifted value.',
      ask:{key:'m1-dt-sift-b', q:'Predict: what is $\\sum_{n}x[n]\\,\\delta[n-2]$?',
        choices:['$3\\,\\delta[n-2]$','$3$','$2$','$6$'], answer:1}},
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
      a.note(0.07,1.3,'\\delta(t)',{anchor:'start',color:C.in,fs:16,tex:true});
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
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$\\varepsilon=1$','$\\varepsilon=1/2$','$\\varepsilon=1/4$','$\\varepsilon=1/8$','$\\varepsilon\\to 0$: $\\delta(t)$']},
      svg:v=>{
      const a=P.Axes({w:560,h:380,xr:[-1.2,1.2],yr:[-0.6,9.2],xlabel:'t',ylabel:'\\delta_\\varepsilon(t)',pad:{l:48,r:24,t:22,b:34},xtarget:5,ytarget:4,ytickfmt:()=>''});
      /* Frames 0-3 narrow the rectangle continuously, eps = 2^-k, height 1/eps;
         earlier widths stay as faint outlines. Heights are written beside each
         top, since a narrow rectangle would cover the y tick labels. Going to
         frame 4 fades the last rectangle into the unit impulse. */
      const k=v?v.frame:0, m=Math.min(k,3), f=Math.max(0,Math.min(1,k-3));
      for(let j=0;j<Math.floor(m);j++){ const e=Math.pow(2,-j);
        a.raw('<g opacity=".45">'); a.poly([[-e/2,0],[-e/2,1/e],[e/2,1/e],[e/2,0]],{color:C.muted,width:1.3});
        a.note(e/2+0.03,1/e,String(1/e),{anchor:'start',color:C.muted,fs:13}); a.raw('</g>'); }
      const e=Math.pow(2,-m);
      if(f<1){ a.raw(`<g opacity="${(0.16*(1-f)).toFixed(3)}">`); a.rect(-e/2,0,e/2,1/e,{fill:C.in}); a.raw('</g>');
        a.raw(`<g opacity="${(1-f).toFixed(3)}">`); a.poly([[-e/2,0],[-e/2,1/e],[e/2,1/e],[e/2,0]],{color:C.in,width:2});
        a.note(e/2+0.03,1/e,String(Math.round(1/e*10)/10),{anchor:'start',color:C.in,fs:13}); a.raw('</g>'); }
      if(f>0){ a.raw(`<g opacity="${f.toFixed(3)}">`); a.impulse(0,1,{top:8.6,color:C.in,labelText:'1'}); a.raw('</g>'); }
      a.note(1.1,8.2,'\\text{width }\\varepsilon,\\;\\text{height }1/\\varepsilon,\\;\\text{area }1',{anchor:'end',color:C.muted,fs:13,tex:true});
      return a.svg(); },
      caption:'Step through the frames. Each rectangle has unit area; as the width decreases, its integral against a continuous test function approaches the sifting result, and the limit is the impulse $\\delta(t)$, drawn as an arrow of weight 1.'}
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
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$x(t)$','multiply by $\\delta(t-t_0)$','$x(t_0)\\,\\delta(t-t_0)$']},
      svg:v=>{
      const a=P.Axes({w:560,h:380,xr:[-1,6],yr:[-1.1,1.6],xlabel:'t',ylabel:'\\text{amplitude}',pad:{l:48,r:24,t:22,b:34},xtarget:7,ytarget:3});
      /* Frame 0 is x(t), the printed figure. Going to frame 1 fades in a unit
         impulse at t0; going to frame 2 scales its weight from 1 to x(t0). */
      const x=t=>0.75*Math.cos(1.2*t-0.5);
      const k=v?v.frame:0, cl=u=>Math.max(0,Math.min(1,u)), w=cl(k), d=cl(k-1);
      const g=(o,f)=>{ if(o<=0) return; a.raw(`<g opacity="${o.toFixed(3)}">`); f(); a.raw('</g>'); };
      a.curve(x,{color:C.muted,width:1.6});
      g(w,()=>{ a.impulse(3, 1+(x(3)-1)*d, {color:d>0?C.coral:C.h, label:false});
        a.note(2.86,-0.28,'t_0',{anchor:'end',color:d>0?C.coral:C.h,fs:14,tex:true}); });
      g(Math.min(w,1-2*d),()=>a.note(3.14,1.18,'\\delta(t-t_0)',{color:C.h,fs:14,tex:true}));
      g(d,()=>{ a.point(3,x(3),{color:C.coral});
        a.note(4.4,-0.55,'x(t_0)\\,\\delta(t-t_0)',{anchor:'start',color:C.coral,fs:14,tex:true});
        a.note(2.86,-0.95,'x(t_0)\\ \\text{is a value}',{anchor:'end',color:C.coral,fs:13,tex:true}); });
      a.note(5.7,1.35,'x(t)',{anchor:'end',color:C.muted,fs:15,tex:true});
      return a.svg(); },
      caption:'Sifting, drawn. Step through the frames: the impulse at $t_0$ is scaled by the value of $x$ there, and integration returns that single number.'}
  ], right:[
    {t:'eq', tex:'\\delta(t)=\\dfrac{\\d}{\\d t}u(t),\\qquad u(t)=\\int_{-\\infty}^{t}\\delta(\\tau)\\,\\d\\tau',
      label:'Step and impulse', note:'The pair $\\delta[n]=u[n]-u[n-1]$ is the discrete-time analogue.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'x(t)\\,\\delta(t-t_0)=x(t_0)\\,\\delta(t-t_0)', label:'Sampling'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, result:true, tex:'x(t_0)=\\int_{-\\infty}^{\\infty}x(t)\\,\\delta(t-t_0)\\,\\d t', label:'Key result · Sifting',
        note:'The discrete-time sum is an integral here.'}]}
  ]}
]},

REAL_IMPULSE,

{ id:'m1-lab-l', module:'M1', nav:'Laboratory {lab} · Sifting', title:'Laboratory {lab} — Sifting with a Narrowing Pulse', src:'pp. 6–7',
  objective:'See the sifting integral approach x(t0) as a unit-area pulse narrows, and compare the exact discrete-time sum.',
  slide:true, keywords:'laboratory impulse sifting unit area pulse epsilon limit delta', steps:0, blocks:[
  {t:'eyebrow', text:'Interactive laboratory', src:'pp. 6–7'},
  {t:'title', text:'Laboratory {lab} · Sifting'},
  {t:'lede', text:'Replace $\\delta(t)$ by a pulse of width $\\varepsilon$ and height $1/\\varepsilon$. Narrow the pulse and watch the integral approach $x(t_0)$. In discrete time the sum is exact at once.'},
  {t:'lab', id:'L'}
]},

{ id:'m1-code-impulse', module:'M1', nav:'Code · Impulses and steps', title:'Impulses and Steps in Code', src:'pp. 6–7',
  objective:'Build the step from the impulse and check the sifting property in MATLAB and in Python.',
  keywords:'code matlab python program impulse step running sum first difference sifting run',
  slide:true, steps:0, budget:'a code page: the program draws its own figure', blocks:[
  {t:'eyebrow', text:'Module 1 · Impulses and steps in code', src:'pp. 6–7'},
  {t:'title', text:'Impulses and Steps in Code'},
  {t:'raw', html:()=>CODEBANK.page('m1-code-impulse')}
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
      listen:{items:[220,440,880].map(f0=>
          ({label:'$f_0='+f0+'$ Hz', sound:()=>({f:t=>Math.cos(2*Math.PI*f0*t), dur:1})}))},
      caption:'$x(t)=e^{j0.5\\pi t}$: the real part, $\\cos(0.5\\pi t)$, of constant amplitude. Each tone is $\\cos(2\\pi f_0 t)$ with $\\omega_0=2\\pi f_0$. Doubling $f_0$ halves the period and raises the pitch one octave.'}
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
    {t:'fig', code:'cexp-ct-period', frame:true, grow:true, svg:()=>{
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
    {t:'fig', code:'cexp-envelope', frame:true, grow:true,
      live:{controls:[{k:'r', label:'$r$', min:-1.5, max:0.5, step:0.25, v:-0.5, show:v=>'$'+num(v)+'$'}]},
      listen:{items:[
          {label:'Play $e^{rt}\\cos(2\\pi\\cdot 440\\,t)$', sound:v=>({f:t=>Math.exp(v.r*t)*Math.cos(2*Math.PI*440*t), dur:3})}]},
      svg:v=>{
      const r=v?v.r:-0.5, env=t=>2*Math.exp(r*t), top=2.3*Math.max(1,Math.exp(5*r));
      const a=P.Axes({w:560,h:380,xr:[0,5],yr:[-top,top],xlabel:'t',ylabel:'\\operatorname{Re}\\{x(t)\\}',pad:{l:50,r:26,t:20,b:36},xtarget:6,ytarget:3});
      a.curve(env,{color:C.err,dash:'5 5',width:1.4});
      a.curve(t=>-env(t),{color:C.err,dash:'5 5',width:1.4});
      a.curve(t=>env(t)*Math.cos(2*Math.PI*t),{color:C.in,n:1400});
      return a.svg(); },
      caption:'Drag $r$, with $A=2$ and $\\omega_0=2\\pi$ rad/s. The sinusoid stays inside $\\pm Ae^{rt}$. The tone uses the same $r$; a plucked string sounds like $r<0$.'},
    {t:'legend', items:[['in','$\\operatorname{Re}\\{x(t)\\}$'],['err','$\\pm2e^{rt}$']]}
  ], right:[
    {t:'eq', tex:'\\begin{aligned}x(t)&=Ae^{j\\theta}e^{(r+j\\omega_0)t}\\\\&=A\\underbrace{e^{rt}}_{\\text{envelope}}\\,\\underbrace{e^{j(\\omega_0t+\\theta)}}_{\\text{rotation}}\\\\\\operatorname{Re}\\{x(t)\\}&=Ae^{rt}\\cos(\\omega_0t+\\theta)\\end{aligned}', label:'Separate envelope and oscillation'},
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
      {t:'note', kind:'warn', head:'Continuous and discrete time', html:'<div class="cmp"><div><span class="cmp-h">Continuous time</span>$e^{j\\omega_0 t}$ is periodic for every $\\omega_0$, and each $\\omega_0$ gives a different signal.</div><div><span class="cmp-h">Discrete time</span>Periodic only if $\\omega_0/2\\pi$ is rational, and $e^{j(\\omega_0+2\\pi)n}=e^{j\\omega_0 n}$ for every integer $n$.</div></div>'}]}
  ]}
]},

{ id:'m1-dt-period-b', module:'M1', nav:'A discrete period', title:'Computing a Discrete-Time Period', src:'p. 10',
  objective:'Find the fundamental period of a rational discrete-time exponential.',
  keywords:'N0 10 rational 3 pi over 5',
  slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 1 · Periodicity in discrete time', src:'p. 10'},
  {t:'title', text:'Computing a Discrete-Time Period'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', code:'cexp-dt-period', frame:true, grow:true, svg:()=>{
      const a=P.Axes({w:560,h:380,xr:[-20,20],yr:[-1.35,1.5],xlabel:'n',ylabel:'\\operatorname{Re}\\{x[n]\\}',pad:{l:60,r:26,t:22,b:36},xtarget:9,ytarget:3});
      a.stem(disc(n=>Math.cos(3*Math.PI*n/5),-20,20),{color:C.in,r:3});
      a.span(0,10,1.24,'N_0=10',{color:C.coral,tex:true});
      return a.svg(); },
      caption:'$x[n]=e^{j3\\pi n/5}$, real part. The samples repeat after $N_0=10$.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x[n]=e^{j(3\\pi/5)n}$.<div class="nsep"></div>Find $N_0$. Take the smallest positive integer $k$ that makes $N$ an integer.',
      ask:{key:'m1-dt-period-b', choices:['$N_0=10/3$','$N_0=5$','$N_0=10$','Not periodic'], answer:2}},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\begin{aligned}N&=\\dfrac{2\\pi k}{\\omega_0}\\\\&=\\dfrac{2\\pi k}{3\\pi/5}\\\\&=\\dfrac{10}{3}k\\end{aligned}', label:'Substitute the frequency'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Solution', html:'The smallest such $k$ is 3, so<span class="val"><b>$N_0=10$</b><small>fundamental period</small></span>'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Check', html:'$\\omega_0 N_0=6\\pi=2\\pi\\cdot 3$. The phase advances three full turns in ten samples.'}]}
  ]}
]},

REAL_CEXP,

{ id:'m1-lab-c', module:'M1', nav:'Laboratory {lab} · Periodicity', title:'Laboratory {lab} — Periodicity Explorer', src:'pp. 5, 8, 10',
  objective:'Compare CT and DT periodicity with an exact rationality test.',
  slide:true, keywords:'laboratory periodicity explorer rational frequency N0 T0', steps:0, blocks:[
  {t:'eyebrow', text:'Interactive laboratory', src:'pp. 5, 8, 10'},
  {t:'title', text:'Laboratory {lab} · Periodicity'},
  {t:'lede', text:'Enter $\\omega_0$ as a rational multiple of $\\pi$. The laboratory can then apply the discrete-time rationality test exactly. A rounded decimal cannot prove that a number is rational.'},
  {t:'lab', id:'C'}
]},

{ id:'m1-code-cexp', module:'M1', nav:'Code · Complex exponentials', title:'Complex Exponentials in Code', src:'pp. 7–10',
  objective:'Compute periods and envelopes of complex exponentials in MATLAB and in Python.',
  keywords:'code matlab python program complex exponential period envelope aperiodic run',
  slide:true, steps:0, budget:'a code page: the program draws its own figure', blocks:[
  {t:'eyebrow', text:'Module 1 · Complex exponentials in code', src:'pp. 7–10'},
  {t:'title', text:'Complex Exponentials in Code'},
  {t:'raw', html:()=>CODEBANK.page('m1-code-cexp')}
]},

CAT_BLOCKS,
CAT_PULSE,
CAT_WAVE,
CAT_SOUND,
CAT_RANDOM,

/* Six short predictions before the summary. Each takes a few seconds and
   needs no calculation on paper. The module's practice questions stay
   open-ended; this slide checks recognition only. */
{ id:'m1-quick', module:'M1', nav:'Quick check', title:'Quick check', src:'pp. 2–10',
  objective:'Check the module ideas with six short predictions.',
  keywords:'quick check predict energy power shift scaling periodicity',
  budget:'A set of six prediction cards; the questions carry no figure.',
  slide:true, steps:0, blocks:[
  {t:'eyebrow', text:'Module 1 · Quick check', src:'pp. 2–10'},
  {t:'title', text:'Quick Check'},
  {t:'grid', cols:3, gap:'30px 28px', style:'flex:1;grid-auto-rows:1fr;padding-bottom:8px', items:[
    [{t:'note', kind:'def', head:'Energy or power', html:'$x(t)=e^{-|t|}$ is',
      ask:{key:'m1-q1', choices:['Energy','Power','Neither'], answer:0,
        why:'$\\int_{-\\infty}^{\\infty}e^{-2|t|}\\,\\d t=1$ is finite.'}}],
    [{t:'note', kind:'def', head:'Energy or power', html:'$x(t)=5\\cos(3t)$ is',
      ask:{key:'m1-q2', choices:['Energy','Power','Neither'], answer:1,
        why:'Each period adds the same energy, so $E_\\infty\\to\\infty$. The average power is $25/2$.'}}],
    [{t:'note', kind:'def', head:'Time shift', html:'The graph of $x(t+2)$ is the graph of $x(t)$ moved',
      ask:{key:'m1-q3', choices:['2 to the left','2 to the right'], answer:0,
        why:'$x(t+2)=x(t-t_0)$ with $t_0=-2$. A negative $t_0$ is an advance.'}}],
    [{t:'note', kind:'def', head:'Time scaling', html:'$y[n]=x[2n]$ keeps',
      ask:{key:'m1-q4', choices:['the even-indexed samples','the odd-indexed samples'], answer:0,
        why:'$y[n]$ takes the value $x[2n]$, so only $x[0]$, $x[\\pm2]$, $x[\\pm4],\\dots$ remain.'}}],
    [{t:'note', kind:'def', head:'Periodicity', html:'Is $x[n]=\\cos(n/4)$ periodic?',
      ask:{key:'m1-q5', choices:['Yes, $N_0=8\\pi$','Yes, $N_0=8$','No'], answer:2,
        why:'$\\omega_0/2\\pi=1/(8\\pi)$ is irrational, so no integer period exists.'}}],
    [{t:'note', kind:'def', head:'Periodicity', html:'$x[n]=\\cos(\\pi n/4)$ has fundamental period',
      ask:{key:'m1-q6', choices:['$N_0=4$','$N_0=8$','$N_0=8\\pi$'], answer:1,
        why:'$\\omega_0/2\\pi=1/8$, so the sequence repeats first after 8 samples.'}}]
  ]}
]},

{ id:'m1-synth', module:'M1', nav:'Module 1 synthesis', title:'Module 1 — what to carry forward', src:'pp. 2–10',
  dark:true, objective:'Consolidate the module and connect to Module 2.',
  keywords:'synthesis summary module 1 review', steps:1, blocks:[
  {t:'eyebrow', text:'Module 1 · Synthesis', src:'pp. 2–10'},
  {t:'title', text:'Module 1 Summary'},
  {t:'cols', ratio:'c-6-6', left:[
    /* The five results as prompts: the student answers each one aloud, then
       opens the card. The sketch on each card is the picture to remember. */
    {t:'raw', html:()=>RECALL.deck('m1', [
      {q:'Energy-type, power-type, or neither?', glyph:G.types,
       a:'$E_\\infty$ and $P_\\infty$ are limits. Energy-type ⇒ $P_\\infty=0$; power-type ⇒ $E_\\infty\\to\\infty$; unbounded growth ⇒ neither.'},
      {q:'$x(at-b)$: which operation comes first?', glyph:G.shift,
       a:'<b>Shift, then scale.</b> The other order gives $x(at-ab)$.'},
      {q:'Which period is the fundamental period?', glyph:G.period,
       a:'$T_0$ and $N_0$ are the <b>smallest</b> positive periods; $\\omega_0=2\\pi/T_0=2\\pi/N_0$.'},
      {q:'What kind of object is $\\delta[n]$, and what is $\\delta(t)$?', glyph:G.impulse,
       a:'$\\delta[n]$ is a sequence. $\\delta(t)$ is a distribution. Both are defined by their sifting action.'},
      {q:'When is a discrete-time exponential periodic?', glyph:G.dtper,
       a:'If and only if $\\omega_0/2\\pi$ is <b>rational</b>. A continuous-time one always is.'}
    ])},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'Method', html:'<span style="color:var(--graphite)">Use a definition to test each claim. Evaluate the required limit, integral or sum. Use a plot to understand the result, but do not use its appearance as proof. Module 2 applies this method to six system properties.</span>'}]}
  ], right:[
    {t:'raw', html:'<p class="eyebrow hi hi-reflect" style="margin-bottom:14px">Reflection</p>'},
    {t:'lede', text:'Choose average power for a radio transmitter and pulse energy for a radar pulse. Explain why each quantity is finite, and state the time interval required for each measurement.'},
    {t:'reveal', at:1, items:[
      {t:'raw', html:`<div class="instr"><div class="instr-panel"><span class="note-h">Discussion guidance</span>
        <span style="color:var(--graphite)">A continuous transmitter is specified by average power in watts, because its energy is unbounded. A radar or ultrasound pulse is specified by pulse energy in joules, because its power only has meaning inside the pulse. The measurement follows. A power meter integrates over a window that is long compared with the signal. An energy meter integrates over the whole transient.</span></div></div>`}]}
  ]}
]},

/* Four optional projects for students who want to try the module on their own
   computer. They carry no grade and no code: each card gives an aim, what it
   practises, a few steps and what to look for. The briefs state no numerical
   answer, so they need no line in verify/. */
{ id:'m1-projects', module:'M1', nav:'Projects to try', title:'Projects to Try', src:'pp. 2–10',
  dark:true, objective:'Offer four optional projects that use the module on real and computed signals.',
  keywords:'projects matlab python energy power time scaling periodicity complex exponential wagon wheel',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 1 · Projects', src:'pp. 2–10'},
  {t:'title', text:'Projects to Try'},
  {t:'raw', html:()=>PROJECTS.deck('m1', [
    {title:'Find the loud parts of a recording', glyph:G.bursts,
     aim:'Use average power to find where a recording has sound and where it is silent.',
     learn:['The energy and the average power of a sequence.',
            'Average power over a short window of samples.',
            'A threshold that turns a number into a decision.'],
     steps:['Record a few seconds of your voice with pauses between the words.',
            'Cut the recording into windows of 20 ms. In each window compute $P=\\frac{1}{N}\\sum_{n}|x[n]|^2$, where $N$ is the number of samples in the window.',
            'Plot $P$ against time. Choose a threshold and mark each window as sound or silence.',
            'Repeat with windows of 5 ms and 200 ms.'],
     look:'Short windows follow the words closely but flicker. Long windows are smooth but blur where each word starts and ends. Ask why the total energy of the recording cannot answer the question.'},
    {title:'Play a word backwards, faster and later', glyph:G.shift,
     aim:'Hear the time operations on a real signal and check the order of shift and scale.',
     learn:['Reversal $x[-n]$, delay $x[n-n_0]$ and compression $x[2n]$ on recorded samples.',
            'The order rule for $x(at-b)$.',
            'Why compression in discrete time loses samples.'],
     steps:['Record one word as $x[n]$. Play $x[-n]$. Then play $x[2n]$ at the same sampling rate.',
            'Build $y(t)=x(2t-1)$ in two orders: delay by 1 s and then compress by 2, or compress by 2 and then delay by 0.5 s. Subtract the two results.',
            'Rebuild a signal from $x[2n]$ by repeating each sample twice. Play it and compare it with $x[n]$.'],
     look:'The two orders give the same samples. $x[2n]$ is shorter and higher in pitch. The rebuilt signal is not the original, because half of the samples are gone and no rule can return them.'},
    {title:'Hunt for the fundamental period', glyph:G.period,
     aim:'Find the fundamental period by hand and by program, and test the rational rule for discrete-time sinusoids.',
     learn:['The period of a sum of sinusoids from the least common multiple.',
            'The test that $\\omega_0/2\\pi$ is rational.',
            'A search for the smallest $N$ with $x[n+N]=x[n]$.'],
     steps:['Write a function that searches $N=1,2,\\dots,1000$ for the smallest $N$ with $x[n+N]=x[n]$ on a long range of $n$, up to rounding error.',
            'Predict on paper, then test: $\\cos(\\pi n/6)$, $\\cos(\\pi n/6)+\\sin(\\pi n/4)$, $\\cos(3\\pi n/10)$, $\\cos(n/2)$ and $e^{j2\\pi n/7}$.',
            'Sample $x(t)=\\cos(2\\pi t)$ with step $T_s=0.1$ s and with step $T_s=1/\\pi$ s. Test both sequences.'],
     look:'A continuous-time signal can be periodic while its samples are not. The program can only report that it found no period up to 1000. It cannot prove that none exists; the rational test can.'},
    {title:'Make a wagon wheel turn backwards', glyph:G.wheel,
     aim:'See why $e^{j\\omega_0 n}$ and $e^{j(\\omega_0+2\\pi)n}$ are the same sequence.',
     learn:['A discrete-time complex exponential as a point that moves on the unit circle.',
            'Frequency in rad/sample, taken modulo $2\\pi$.',
            'The rotation that the samples appear to show.'],
     steps:['Draw a wheel with one marked spoke. In frame $n$, turn it to the angle $\\omega_0 n$, as a camera would photograph it.',
            'Increase $\\omega_0$ slowly from $0$ to $4\\pi$ rad/sample and watch the marked spoke.',
            'For each $\\omega_0$, measure the angle the spoke seems to turn in one frame, taken between $-\\pi$ and $\\pi$. Plot it against $\\omega_0$.'],
     look:'The wheel seems to stop at $\\omega_0=2\\pi$ and to turn backwards just below it. The plot is a sawtooth. The wheels of a car in a film show the same effect.'}
  ])}
]}
];
window.SCENES_M1 = SC;
})();
