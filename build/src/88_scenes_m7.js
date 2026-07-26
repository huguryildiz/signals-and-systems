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
  ws:{ s:'\\omega_s', d:'Sampling angular frequency, ω_s = 2π/T, in radians per second. It is not the sampling frequency in hertz.', go:'m7-rates' },
  fs:{ s:'f_s', d:'Sampling frequency, f_s = 1/T, in hertz. It counts samples per second, and ω_s = 2πf_s.', go:'m7-rates' },
  wM:{ s:'\\omega_M', d:'Highest angular frequency a band-limited signal carries: X(jω) = 0 for |ω| > ω_M.', go:'m7-theorem' },
  wc:{ s:'\\omega_c', d:'Cutoff of the reconstruction filter, in rad/s. It must satisfy ω_M < ω_c < ω_s − ω_M.', go:'m7-recon' },
  pt:{ s:'p(t)', d:'Impulse train of period T, used as the sampling function.', go:'m7-sampler' },
  xp:{ s:'x_p(t)', d:'Impulse-train sampled signal: an impulse at every nT whose weight is x(nT).', go:'m7-sampler' },
  xr:{ s:'x_r(t)', d:'Output of the reconstruction filter. It equals x(t) only when the sampling theorem is satisfied.', go:'m7-recon' },
  replica:{ s:'\\text{replica}', d:'A copy of X(jω) centred at a multiple of ω_s in the sampled spectrum. Copies appear at every sampling rate.', go:'m7-replicas' },
  alias:{ s:'\\text{aliasing}', d:'The overlap of neighbouring copies. It happens only when ω_s < 2ω_M, and no filter can undo it.', go:'m7-aliasing' },
  guard:{ s:'\\omega_s-2\\omega_M', d:'Guard band: the empty gap between the top of the baseband and the bottom of the first copy.', go:'m7-three' },
  zoh:{ s:'H_0(j\\omega)', d:'Frequency response of the zero-order hold, which holds each sample until the next one arrives.', go:'m7-zoh' },
  foh:{ s:'H_1(j\\omega)', d:'Frequency response of the first-order hold, which joins consecutive samples by a straight line.', go:'m7-foh' }
});

const SC = [

/* ------------------------------------------------------------------ opening */
{ id:'m7-open', module:'M7', nav:'Module 7 opening', title:'Sampling and Aliasing', src:'pp. 80–88',
  dark:true, keywords:'module 7 sampling aliasing nyquist replication reconstruction overview', steps:0, blocks:[
  {t:'eyebrow', text:'Module 7 · Sampling and Aliasing', src:'pp. 80–88'},
  {t:'title', level:1, text:'A signal measured at instants,<br>and the question of what was missed.'},
  {t:'lede', text:'Keep only the value of a signal every $T$ seconds and everything between the instants is gone. This module says exactly when nothing was lost, and exactly what is lost when something was.'},
  {t:'cols', ratio:'c-5-7', left:[
    {t:'raw', html:`<div style="margin-top:16px">
      <div style="font-family:var(--mono);font-size:12.5px;letter-spacing:.14em;color:#8FA8BF;margin-bottom:10px">THE ENTIRE MODULE, IN TWO LINES</div></div>`},
    {t:'eq', tex:'X_p(j\\omega)=\\frac{1}{T}\\sum_{k=-\\infty}^{\\infty}X\\bigl(j(\\omega-k\\omega_s)\\bigr)', label:'Sampling replicates the spectrum'},
    {t:'eq', tex:'\\omega_s>2\\omega_M\\;\\Longrightarrow\\;x(t)\\ \\text{is recoverable}', label:'and the copies stay apart'},
    {t:'note', kind:'ok', head:'Two words that are not the same', html:'<span style="color:#DED5C6">Sampling always makes <b>copies</b>. Copies that reach each other <b>overlap</b>, and only that overlap is aliasing. Keeping the two apart is most of this module.</span>'}
  ], right:[
    {t:'fig', svg:()=>{
      const a=P.Axes({w:820,h:430,xr:[-8.5*PI,8.5*PI],yr:[-0.3,4.9],grid:false,zeroAxes:false,arrows:false,
        pad:{l:20,r:20,t:20,b:20},xticksOverride:[],yticksOverride:[]});
      /* three rates, one above the other: apart, touching, overlapping */
      [[6*PI,3.4],[4*PI,1.75],[2.8*PI,0.1]].forEach(([ws,base],i)=>{
        const pk=1.05;
        for(let k=-3;k<=3;k++)
          a.curve(w=>{ const v=tri(w-k*ws,WM,pk); return isFinite(v)? v+base : NaN; },
            {color:k===0?'#7FC3CE':(Math.abs(k)===1?'#AC99DC':'#8FA9C2'),width:i===2?1.3:2.2,dash:i===2?'4 4':null,n:1400});
        if(i===2) a.curve(w=>{ const v=rep(w,WM,pk,ws,4); return v>0.002? v+base : NaN; },{color:'#E8785F',width:2.6,n:1800});
      });
      return a.svg(); }}
  ]}
]},

/* ---------------------------------------------------------------- sampler */
{ id:'m7-sampler', module:'M7', nav:'The sampler', title:'What a sampler actually produces', src:'p. 80',
  objective:'Define impulse-train sampling and read the weight of each impulse off the sifting property.',
  keywords:'impulse train sampling p(t) x_p(t) sifting sample weight nT sequence', steps:3, blocks:[
  {t:'eyebrow', text:'Module 7 · The operation', src:'p. 80'},
  {t:'title', text:'Multiply by a train of impulses'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:'Sampling is modelled as a multiplication. The sampling function is the <b>{{sym:pt|impulse train}}</b> of period $T$, and the sampled signal is the product:'},
    {t:'eq', key:true, tex:'p(t)=\\sum_{n=-\\infty}^{\\infty}\\delta(t-nT),\\qquad x_p(t)=x(t)\\,p(t)', label:'Impulse-train sampling'},
    {t:'reveal', at:1, items:[
      {t:'eq', size:'sm', tex:'x_p(t)=x(t)\\sum_{n=-\\infty}^{\\infty}\\delta(t-nT)=\\sum_{n=-\\infty}^{\\infty}x(nT)\\,\\delta(t-nT)',
        note:'The middle step is the sifting property of Module 1: $x(t)\\delta(t-nT)=x(nT)\\delta(t-nT)$, because the impulse is zero everywhere except at $t=nT$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'How an impulse is drawn', html:'An impulse is drawn as an arrow whose <b>height is its weight</b>. So in the picture of {{sym:xp|$x_p(t)$}} the arrow at $t=nT$ reaches the value $x(nT)$, and the outline traced by the arrowheads is the signal itself. The arrows are not values of a function; they are weights.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'The sequence behind the impulses', html:'The numbers $x(nT)$ are all that survives. Written as a sequence they are $x_p[n]=x(nT)$, and this is where a discrete-time signal comes from in practice. Everything between two instants has been discarded, and the whole module is about when that loss is reversible.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:175,xr:[-3.4,3.4],yr:[-0.2,1.35],xlabel:'t\\;[\\text{s}]',ylabel:'x(t)',pad:{l:52,r:26,t:26,b:34},xtarget:7,ytarget:3});
      a.curve(xB,{color:C.in,n:2000});
      return a.svg(); },
      caption:'The signal before the sampler.'},
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:165,xr:[-3.4,3.4],yr:[-0.2,1.35],xlabel:'t\\;[\\text{s}]',ylabel:'p(t)',pad:{l:52,r:26,t:26,b:34},xtarget:7,ytarget:3});
      for(let n=-6;n<=6;n++) a.impulse(n*0.5,1,{color:C.h,label:false});
      return a.svg(); },
      caption:'The impulse train, drawn here with $T=0.5$ s. Every impulse carries weight 1.'},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:185,xr:[-3.4,3.4],yr:[-0.2,1.35],xlabel:'t\\;[\\text{s}]',ylabel:'x_p(t)',pad:{l:52,r:26,t:26,b:34},xtarget:7,ytarget:3});
        a.curve(xB,{color:C.in,width:1.1,dash:'3 5',opacity:.55,n:2000});
        samp(xB,0.5,-3.3,3.3).forEach(pr=>a.impulse(pr[0],pr[1],{color:C.mid,label:false}));
        return a.svg(); },
        caption:'The product. Each arrow reaches $x(nT)$, so the arrowheads trace the dashed original.'}]}
  ]}
]},

/* ------------------------------------------------------------------ rates */
{ id:'m7-rates', module:'M7', nav:'Rate in rad/s and in hertz', title:'Two numbers describe the same rate', src:'p. 81',
  objective:'Separate the sampling angular frequency in rad/s from the sampling frequency in hertz.',
  keywords:'sampling frequency angular rad/s hertz omega_s f_s 2 pi conversion units', steps:3, blocks:[
  {t:'eyebrow', text:'Module 7 · Notation', src:'p. 81'},
  {t:'title', text:'Radians per second is not hertz'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:'One sampler, one period $T$, and two ways of naming how fast it runs. Both are used in this module, so both are defined here and kept apart afterwards.'},
    {t:'eq', key:true, tex:'\\omega_s=\\frac{2\\pi}{T}\\ \\left[\\frac{\\text{rad}}{\\text{s}}\\right],\\qquad f_s=\\frac{1}{T}\\ [\\text{Hz}],\\qquad \\omega_s=2\\pi f_s',
      label:'Sampling rate, both readings',
      note:'{{sym:ws|$\\omega_s$}} is the sampling <b>angular</b> frequency. {{sym:fs|$f_s$}} is the sampling frequency in hertz, the number of samples taken per second.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'err', head:'The factor of $2\\pi$ is not decoration', html:'Calling $2\\pi/T$ "the sampling frequency" and then reading it in hertz is the most expensive slip in this module. With $T=0.25$ ms the two readings are $\\omega_s=8000\\pi$ rad/s and $f_s=4000$ Hz. They differ by $2\\pi$, and an answer that mixes them is wrong by that factor everywhere it is used.'}]},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Rule','Every rate carries its unit. A number written without one is not a rate.'],
        ['Check','$\\omega_sT=2\\pi$ always, and $f_sT=1$ always. One multiplication tests any pair of values.'],
        ['Same for the signal','A signal whose highest angular frequency is $\\omega_M$ rad/s has highest frequency $f_M=\\omega_M/2\\pi$ Hz.']
      ]}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'Which one this module uses', html:'Spectra are drawn against $\\omega$ in rad/s, so $\\omega_s$ is the working symbol. The hertz reading appears whenever a physical rate is quoted, and never inside a spectrum.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>P.blocks({w:820,h:240,items:[
      {t:'text',x:410,y:34,label:'T=0.25\\ \\text{ms}',tex:true,fs:19,color:C.ink},
      {t:'line',d:'M410,46 L410,74'},
      {t:'line',d:'M180,74 L640,74'},
      {t:'arrow',x1:180,y1:74,x2:180,y2:112},
      {t:'arrow',x1:640,y1:74,x2:640,y2:112},
      {t:'box',x:70,y:112,w:220,h:60,label:'\\omega_s=2\\pi/T',tex:true,fs:18},
      {t:'box',x:530,y:112,w:220,h:60,label:'f_s=1/T',tex:true,fs:18},
      {t:'text',x:180,y:206,label:'8000\\pi\\ \\text{rad/s}',tex:true,fs:17,color:C.in},
      {t:'text',x:640,y:206,label:'4000\\ \\text{Hz}',tex:true,fs:17,color:C.out},
      {t:'text',x:410,y:150,label:'\\times\\,2\\pi',tex:true,fs:16,color:C.coral}
    ]}), caption:'One period, two rates. The step between them is the whole conversion.'},
    {t:'reveal', at:3, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:215,xr:[0.08,1.05],yr:[0,52000],xlabel:'T\\;[\\text{ms}]',ylabel:'\\text{rate}',
          pad:{l:78,r:26,t:28,b:36},xtarget:5,ytarget:4,ytickfmt:v=>v===0?'0':String(Math.round(v/1000))+'k'});
        a.curve(Tm=>2*PI/(Tm*1e-3),{color:C.in,n:900});
        a.curve(Tm=>1/(Tm*1e-3),{color:C.out,n:900});
        a.note(0.30,30000,'\\omega_s\\;[\\text{rad/s}]',{anchor:'start',color:C.in,fs:14,tex:true});
        a.note(0.30,6000,'f_s\\;[\\text{Hz}]',{anchor:'start',color:C.out,fs:14,tex:true});
        return a.svg(); },
        caption:'Both fall as $1/T$, and the upper curve is exactly $2\\pi$ times the lower one at every period.'}]}
  ]}
]},

/* ------------------------------------------------- the frequency-domain law */
{ id:'m7-freq', module:'M7', nav:'The sampled spectrum', title:'What multiplication in time does in frequency', src:'pp. 80–81',
  objective:'Derive the sampled spectrum and account for the factor 1/T.',
  keywords:'multiplication property convolution impulse train transform 1/T derivation X_p sifting', steps:3, blocks:[
  {t:'eyebrow', text:'Module 7 · Derivation', src:'pp. 80–81'},
  {t:'title', text:'Three steps to the sampled spectrum'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Step 1','Multiplication in time is convolution in frequency, with the factor $1/2\\pi$ the transform pair carries: $X_p(j\\omega)=\\tfrac{1}{2\\pi}\\bigl[X(j\\omega)*P(j\\omega)\\bigr]$.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'wex', rows:[
        ['Step 2','The transform of an impulse train is an impulse train: $P(j\\omega)=\\dfrac{2\\pi}{T}\\displaystyle\\sum_{k=-\\infty}^{\\infty}\\delta(\\omega-k\\omega_s)$, with $\\omega_s=2\\pi/T$.']
      ]},
      {t:'small', html:'Spacing $T$ in time gives spacing $\\omega_s=2\\pi/T$ in frequency: the closer the samples, the further apart the impulses of $P$.'}]},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Step 3','Convolving with a shifted impulse shifts the function: $X(j\\omega)*\\delta(\\omega-k\\omega_s)=X\\bigl(j(\\omega-k\\omega_s)\\bigr)$.']
      ]},
      {t:'eq', key:true, size:'lg', tex:'X_p(j\\omega)=\\frac{1}{T}\\sum_{k=-\\infty}^{\\infty}X\\bigl(j(\\omega-k\\omega_s)\\bigr)',
        label:'Spectrum of the sampled signal',
        note:'The $1/2\\pi$ of Step 1 and the $2\\pi/T$ of Step 2 combine, and what is left in front is $1/T$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'Do not lose the $1/T$', html:'Every copy is $X(j\\omega)$ scaled by $1/T$, not by 1. Sample twice as fast and the copies are twice as tall and twice as far apart. The reconstruction filter later carries gain $T$, which is exactly the inverse of this factor, so the two have to be kept together or the recovered signal comes out with the wrong size.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:190,xr:[-4*PI,4*PI],yr:[-0.15,1.35],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X(j\\omega)',
        pad:{l:60,r:26,t:26,b:36},xticksOverride:wTicks(-4*PI,4*PI,PI),xtickfmt:piTick,ytarget:3});
      a.curve(w=>tri(w,WM,1),{color:C.in,n:1600});
      return a.svg(); },
      caption:'The spectrum before sampling. It reaches zero at $\\pm2\\pi$ rad/s, so $\\omega_M=2\\pi$ rad/s.'},
    {t:'reveal', at:1, items:[
      {t:'fig', frame:true, svg:()=>{
        const ws=5*PI;
        const a=P.Axes({w:820,h:170,xr:[-11*PI,11*PI],yr:[-0.4,3.6],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'P(j\\omega)',
          pad:{l:60,r:26,t:26,b:36},xticksOverride:wTicks(-10*PI,10*PI,5*PI),xtickfmt:piTick,ytarget:3});
        for(let k=-2;k<=2;k++) a.impulse(k*ws,2.9,{color:C.h,label:false});
        a.note(0.5*PI,3.05,'\\text{weight}\\;2\\pi/T',{anchor:'start',color:C.h,fs:13,tex:true});
        return a.svg(); },
        caption:'Its transform: impulses every $\\omega_s$, here with $T=0.4$ s so $\\omega_s=5\\pi$ rad/s.'}]},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const ws=5*PI, pk=2.5;
        const a=P.Axes({w:820,h:195,xr:[-11*PI,11*PI],yr:[-0.25,3.2],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X_p(j\\omega)',
          pad:{l:60,r:26,t:26,b:36},xticksOverride:wTicks(-10*PI,10*PI,5*PI),xtickfmt:piTick,ytarget:3});
        for(let k=-2;k<=2;k++) a.curve(w=>tri(w-k*ws,WM,pk),{color:KCOL(k),n:1400});
        return a.svg(); },
        caption:'The result: one copy per multiple of $\\omega_s$, each standing $1/T=2.5$ times the original peak.'}]}
  ]}
]},

/* --------------------------------------------------------------- replicas */
{ id:'m7-replicas', module:'M7', nav:'Replication', title:'Copies appear at every rate', src:'p. 81',
  objective:'Establish that replication is unconditional and name the baseband apart from the copies.',
  keywords:'replication replicas copies baseband k index unconditional every rate spectrum', steps:3, blocks:[
  {t:'eyebrow', text:'Module 7 · The first of two ideas', src:'p. 81'},
  {t:'title', text:'Replication is unconditional'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:'The sum $X_p(j\\omega)=\\frac{1}{T}\\sum_kX(j(\\omega-k\\omega_s))$ runs over every integer $k$, for <b>every</b> value of $T$. There is no rate at which the copies fail to appear and no rate at which they disappear.'},
    {t:'note', kind:'def', head:'Naming the pieces', html:'The term $k=0$ is $X(j\\omega)/T$: the spectrum of the signal itself, sitting where it always sat. Call it the <b>baseband</b>. The terms $k=\\pm1,\\pm2,\\dots$ are the <b>{{sym:replica|copies}}</b>, centred at $\\pm\\omega_s,\\pm2\\omega_s,\\dots$'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'err', head:'The centre group is not the first copy', html:'Counting the group at the origin as "the first replica" makes the group at $\\omega_s$ the second, and every later statement about which copy a frequency came from is then off by one. The baseband is numbered $k=0$ and is not a copy of anything.'}]},
    {t:'reveal', at:2, items:[
      {t:'body', html:'Two things change with the rate, and only these two:'},
      {t:'wex', rows:[
        ['Spacing','The copies sit $\\omega_s=2\\pi/T$ apart. A slower sampler puts them closer together.'],
        ['Height','Every copy is scaled by $1/T$. A slower sampler makes them shorter.']
      ]}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'What has not been said yet', html:'Nothing here decides whether $x(t)$ can be recovered. Copies that sit clear of one another can be separated by a filter; copies that reach each other cannot. That distinction is the next scene but one, and it is the only place the word aliasing belongs.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const ws=6*PI, pk=3;
      const a=P.Axes({w:820,h:220,xr:[-13*PI,13*PI],yr:[-0.25,3.9],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X_p(j\\omega)',
        pad:{l:58,r:26,t:26,b:36},xticksOverride:wTicks(-12*PI,12*PI,6*PI),xtickfmt:piTick,ytarget:3});
      for(let k=-2;k<=2;k++) a.curve(w=>tri(w-k*ws,WM,pk),{color:KCOL(k),n:1600});
      a.note(0,3.42,'k=0',{anchor:'middle',color:C.in,fs:14,tex:true});
      a.note(6*PI,3.42,'k=1',{anchor:'middle',color:C.mid,fs:14,tex:true});
      a.note(-6*PI,3.42,'k=-1',{anchor:'middle',color:C.mid,fs:14,tex:true});
      a.note(12*PI,3.42,'k=2',{anchor:'middle',color:C.slate,fs:14,tex:true});
      a.note(-12*PI,3.42,'k=-2',{anchor:'middle',color:C.slate,fs:14,tex:true});
      return a.svg(); },
      caption:'The centre group is the baseband. Everything else is a numbered copy of it.'},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const ws=9*PI, pk=4.5;
        const a=P.Axes({w:820,h:175,xr:[-13*PI,13*PI],yr:[-0.35,5.6],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X_p(j\\omega)',
          pad:{l:58,r:26,t:26,b:36},xticksOverride:wTicks(-9*PI,9*PI,9*PI),xtickfmt:piTick,ytarget:3});
        for(let k=-1;k<=1;k++) a.curve(w=>tri(w-k*ws,WM,pk),{color:KCOL(k),n:1600});
        return a.svg(); },
        caption:'A faster sampler, $T=2/9$ s: the same copies, further apart and taller.'},
      {t:'fig', frame:true, svg:()=>{
        const ws=4.4*PI, pk=2.2;
        const a=P.Axes({w:820,h:175,xr:[-13*PI,13*PI],yr:[-0.35,5.6],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X_p(j\\omega)',
          pad:{l:58,r:26,t:26,b:36},xticksOverride:wTicks(-8.8*PI,8.8*PI,4.4*PI),xtickfmt:v=>piTick(v),ytarget:3});
        for(let k=-2;k<=2;k++) a.curve(w=>tri(w-k*ws,WM,pk),{color:KCOL(k),n:1600});
        return a.svg(); },
        caption:'A slower sampler, $T=5/11$ s: still the same copies, now closer together and shorter.'}]}
  ]}
]},

/* ----------------------------------------------------------- the three cases */
{ id:'m7-three', module:'M7', nav:'Three sampling rates', title:'The guard band, and what closes it', src:'p. 81',
  objective:'Compare the three rates by the width of the gap between neighbouring copies.',
  keywords:'oversampling critical nyquist undersampling guard band gap omega_s 2 omega_M three cases', steps:3, blocks:[
  {t:'eyebrow', text:'Module 7 · Three rates', src:'p. 81'},
  {t:'title', text:'One number decides everything'},
  {t:'cols', ratio:'c-5-7', left:[
    {t:'body', html:'The baseband occupies $|\\omega|\\le\\omega_M$. The copy at $k=1$ occupies $|\\omega-\\omega_s|\\le\\omega_M$, so its lowest point is $\\omega_s-\\omega_M$. The gap between them is'},
    {t:'eq', key:true, tex:'(\\omega_s-\\omega_M)-\\omega_M=\\omega_s-2\\omega_M',
      label:'Guard band', note:'{{sym:guard|This width}} is positive, zero or negative, and those are the three cases.'},
    {t:'reveal', at:1, items:[
      {t:'wex', rows:[
        ['$\\omega_s>2\\omega_M$','Oversampling. A gap of width $\\omega_s-2\\omega_M$ separates the copies, and a filter can cut the baseband out untouched.'],
        ['$\\omega_s=2\\omega_M$','The Nyquist rate. The gap has closed to zero and the copies touch at $\\pm\\omega_M$.'],
        ['$\\omega_s<2\\omega_M$','Undersampling. The gap is negative: the copies have moved into one another and add.']
      ]}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'The copies never vanish', html:'All three pictures carry the same copies. Lowering the rate slides them together; it does not remove any of them and it does not create any. The only thing that changes is whether they touch.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'Touching is already too late', html:'The middle case looks safe and is not. A filter that keeps $|\\omega|<\\omega_M$ loses the component at $\\omega_M$ itself, and a filter that keeps $|\\omega|\\le\\omega_M$ takes the edge of the neighbouring copy with it. The theorem on the next scene therefore asks for a strict inequality.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const ws=5*PI, pk=2.5;
      const a=P.Axes({w:840,h:185,xr:[-8*PI,8*PI],yr:[-0.2,3.5],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X_p(j\\omega)',
        pad:{l:58,r:26,t:26,b:36},xticksOverride:wTicks(-8*PI,8*PI,PI),xtickfmt:v=>Math.abs(Math.round(v/PI))%2?'':piTick(v),ytarget:3});
      for(let k=-2;k<=2;k++) a.curve(w=>tri(w-k*ws,WM,pk),{color:KCOL(k),n:1400});
      a.span(WM,ws-WM,3.0,'\\omega_s-2\\omega_M=\\pi',{color:C.out,fs:13,tex:true});
      return a.svg(); },
      caption:'Oversampling, $\\omega_s=5\\pi$ rad/s against a Nyquist rate of $4\\pi$. The gap is $\\pi$ rad/s wide.'},
    {t:'reveal', at:1, items:[
      {t:'fig', frame:true, svg:()=>{
        const ws=4*PI, pk=2;
        const a=P.Axes({w:840,h:175,xr:[-8*PI,8*PI],yr:[-0.2,3.0],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X_p(j\\omega)',
          pad:{l:58,r:26,t:26,b:36},xticksOverride:wTicks(-8*PI,8*PI,PI),xtickfmt:v=>Math.abs(Math.round(v/PI))%2?'':piTick(v),ytarget:3});
        for(let k=-2;k<=2;k++) a.curve(w=>tri(w-k*ws,WM,pk),{color:KCOL(k),n:1400});
        a.vline(WM,{color:C.coral}); a.vline(-WM,{color:C.coral});
        return a.svg(); },
        caption:'The Nyquist rate, $\\omega_s=2\\omega_M=4\\pi$ rad/s. The copies meet at the marked lines and the gap is exactly zero.'}]},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const ws=3*PI, pk=1.5;
        const a=P.Axes({w:840,h:175,xr:[-8*PI,8*PI],yr:[-0.2,3.0],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X_p(j\\omega)',
          pad:{l:58,r:26,t:26,b:36},xticksOverride:wTicks(-8*PI,8*PI,PI),xtickfmt:v=>Math.abs(Math.round(v/PI))%2?'':piTick(v),ytarget:3});
        for(let k=-3;k<=3;k++) a.curve(w=>tri(w-k*ws,WM,pk),{color:KCOL(k),width:1.4,dash:'4 4',n:1400});
        a.curve(w=>rep(w,WM,pk,ws,4),{color:C.err,width:2.6,n:1800});
        return a.svg(); },
        caption:'Undersampling, $\\omega_s=3\\pi$ rad/s. The dashed copies are unchanged; the solid curve is their sum, which is what the sampler actually produces.'}]}
  ]}
]},

/* --------------------------------------------------------------- aliasing */
{ id:'m7-aliasing', module:'M7', nav:'Aliasing', title:'Aliasing is the overlap, not the copying', src:'pp. 81, 86',
  objective:'Define aliasing as the overlap of copies and show why no filter can undo it.',
  keywords:'aliasing overlap sum irreversible filter cannot undo replication distinct definition', steps:3, blocks:[
  {t:'eyebrow', text:'Module 7 · The second of two ideas', src:'pp. 81, 86'},
  {t:'title', text:'What a filter can and cannot undo'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'note', kind:'def', head:'Definition', html:'<b>{{sym:alias|Aliasing}}</b> is the overlap of neighbouring copies in $X_p(j\\omega)$. It occurs exactly when $\\omega_s<2\\omega_M$, and at no other time.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'err', head:'Two statements that are often confused', html:'"Below the Nyquist rate the spectrum is no longer replicated" is <b>false</b>. The formula $X_p(j\\omega)=\\frac{1}{T}\\sum_kX(j(\\omega-k\\omega_s))$ carries no condition, so the copies are there at every rate. What changes below the Nyquist rate is that they <b>overlap</b>. Replication is what sampling does; aliasing is what happens to the copies when the rate is too low.'}]},
    {t:'reveal', at:2, items:[
      {t:'body', html:'Why the overlap cannot be repaired: in the overlap region the sampler hands over a <b>sum</b>. At a frequency where the baseband and the $k=1$ copy both contribute, the value stored is'},
      {t:'eq', size:'sm', tex:'X_p(j\\omega)=\\frac{1}{T}\\Bigl[\\,\\underbrace{X(j\\omega)}_{\\text{wanted}}+\\underbrace{X\\bigl(j(\\omega-\\omega_s)\\bigr)}_{\\text{intruder}}\\,\\Bigr]',
        note:'One number, two contributions. A filter selects intervals of $\\omega$; it cannot split a single value back into the two numbers that were added to make it.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'The one honest repair', html:'Because the overlap is irreversible, the only cure is to prevent it: raise $\\omega_s$ above $2\\omega_M$, or remove the offending high frequencies from $x(t)$ <b>before</b> the sampler. The second is the anti-aliasing filter, later in this module.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const ws=2.6*PI, pk=1.3;
      const a=P.Axes({w:840,h:225,xr:[-6*PI,6*PI],yr:[-0.2,2.4],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X_p(j\\omega)',
        pad:{l:58,r:26,t:26,b:36},xticksOverride:wTicks(-6*PI,6*PI,PI),xtickfmt:v=>Math.abs(Math.round(v/PI))%2?'':piTick(v),ytarget:3});
      a.area(w=>rep(w,WM,pk,ws,3),ws-WM,WM,{color:'rgba(166,59,42,.20)'});
      a.area(w=>rep(w,WM,pk,ws,3),-WM,WM-ws,{color:'rgba(166,59,42,.20)'});
      for(let k=-2;k<=2;k++) a.curve(w=>tri(w-k*ws,WM,pk),{color:KCOL(k),width:1.4,dash:'4 4',n:1400});
      a.curve(w=>rep(w,WM,pk,ws,3),{color:C.err,width:2.6,n:1800});
      a.span(ws-WM,WM,2.05,'\\text{overlap}',{color:C.err,fs:13,tex:true});
      return a.svg(); },
      caption:'The shaded intervals are where two copies add. Only there is anything lost.'},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:205,xr:[-1.15,1.15],yr:[-0.15,1.45],xlabel:'\\omega/\\omega_M',ylabel:'\\text{contribution}',
          pad:{l:74,r:26,t:28,b:36},xtarget:5,ytarget:3});
        a.curve(u=>tri(u*WM,WM,1),{color:C.in,n:900});
        a.curve(u=>tri(u*WM-2.6*PI,WM,1),{color:C.mid,n:900});
        a.curve(u=>{const v=tri0(u*WM,WM,1)+tri0(u*WM-2.6*PI,WM,1); return v>0.002?v:NaN;},{color:C.err,width:2.6,n:1400});
        a.note(-1.08,1.24,'\\text{baseband}',{anchor:'start',color:C.in,fs:13,tex:true});
        a.note(1.08,1.24,'\\text{copy}\\;k=1',{anchor:'end',color:C.mid,fs:13,tex:true});
        return a.svg(); },
        caption:'A close view of the baseband. Where the two thin curves both exist, the sampler stores only their sum.'}]}
  ]}
]},

/* ---------------------------------------------------------------- theorem */
{ id:'m7-theorem', module:'M7', nav:'The sampling theorem', title:'The sampling theorem, with its hypothesis', src:'p. 82',
  objective:'State the theorem with the strict inequality and show that equality empties the cutoff interval.',
  keywords:'sampling theorem nyquist band limited strict inequality cutoff interval gain T recoverable', steps:3, blocks:[
  {t:'eyebrow', text:'Module 7 · The theorem', src:'p. 82'},
  {t:'title', text:'Strictly above twice the highest frequency'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'note', kind:'def', head:'Sampling theorem', html:'Let $x(t)$ be <b>band-limited</b>: $X(j\\omega)=0$ for $|\\omega|>\\omega_M$. If $\\omega_s>2\\omega_M$, then $x(t)$ is determined uniquely by its samples $x(nT)$, $n=0,\\pm1,\\pm2,\\dots$, and is recovered by passing $x_p(t)$ through an ideal lowpass filter of gain $T$ and cutoff $\\omega_c$ with $\\omega_M<\\omega_c<\\omega_s-\\omega_M$.'},
    {t:'reveal', at:1, items:[
      {t:'wex', rows:[
        ['Hypothesis','$x$ is band-limited. Without it there is no $\\omega_M$ and the theorem says nothing.'],
        ['Rate','$\\omega_s>2\\omega_M$, strictly. The quantity $2\\omega_M$ is the <b>Nyquist rate</b> of the signal.'],
        ['Filter','Gain $T$, cutoff anywhere strictly inside the interval $\\omega_M<\\omega_c<\\omega_s-\\omega_M$.']
      ]}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Why the inequality has to be strict', html:'Put $\\omega_s=2\\omega_M$ into the cutoff condition. It becomes $\\omega_M<\\omega_c<\\omega_M$, an interval with nothing in it. There is no admissible cutoff at the Nyquist rate, so the theorem cannot be satisfied at its own boundary. Writing $\\omega_s\\ge2\\omega_M$ promises a filter that the same sentence then rules out.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'Read it as a design rule', html:'Choose the rate first: fix $\\omega_s$ comfortably above $2\\omega_M$, so that the guard band is wide enough for a real filter, whose transition from pass to stop is not vertical. Then place $\\omega_c$ in the middle of that gap.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const ws=6*PI, pk=3, Tv=2/6;
      const a=P.Axes({w:840,h:245,xr:[-9*PI,9*PI],yr:[-0.25,4.0],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X_p(j\\omega)',
        pad:{l:58,r:26,t:26,b:36},xticksOverride:wTicks(-8*PI,8*PI,2*PI),xtickfmt:piTick,ytarget:3});
      for(let k=-1;k<=1;k++) a.curve(w=>tri(w-k*ws,WM,pk),{color:KCOL(k),n:1400});
      a.rect(-3*PI,0,3*PI,3.3,{stroke:C.h,dash:'6 4',width:1.8});
      a.note(3.3*PI,2.95,'\\text{gain}\\;T',{anchor:'start',color:C.h,fs:13,tex:true});
      a.span(WM,ws-WM,3.62,'\\text{admissible}\\;\\omega_c',{color:C.out,fs:13,tex:true});
      return a.svg(); },
      caption:'The dashed box is the reconstruction filter, drawn here with $\\omega_c=3\\pi$ rad/s. Its edge may stand anywhere in the marked interval.'},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const ws=4*PI, pk=2;
        const a=P.Axes({w:840,h:215,xr:[-9*PI,9*PI],yr:[-0.25,3.2],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X_p(j\\omega)',
          pad:{l:58,r:26,t:26,b:36},xticksOverride:wTicks(-8*PI,8*PI,2*PI),xtickfmt:piTick,ytarget:3});
        for(let k=-2;k<=2;k++) a.curve(w=>tri(w-k*ws,WM,pk),{color:KCOL(k),n:1400});
        a.vline(WM,{color:C.err,width:2,dash:'2 3'});
        a.note(WM+0.4,2.72,'\\omega_M=\\omega_s-\\omega_M',{anchor:'start',color:C.err,fs:13,tex:true});
        return a.svg(); },
        caption:'At the Nyquist rate the two ends of the cutoff interval have met, and there is no room left between them.'}]}
  ]}
]},

/* -------------------------------------------------------- the boundary case */
{ id:'m7-boundary', module:'M7', nav:'The boundary is not safe', title:'A signal the Nyquist rate throws away', src:'p. 82',
  objective:'Show quantitatively that a sine at the band edge is annihilated by sampling at exactly the Nyquist rate.',
  keywords:'nyquist boundary counterexample sine cancellation zero samples guard band critical rate', steps:4, blocks:[
  {t:'eyebrow', text:'Module 7 · Counter-example', src:'p. 82'},
  {t:'title', text:'Two arrows that cancel exactly'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','$x(t)=1+\\cos(2000\\pi t)+\\sin(4000\\pi t)$, so $\\omega_M=4000\\pi$ rad/s.'],
      ['Sample at','Exactly the Nyquist rate, $\\omega_s=2\\omega_M=8000\\pi$ rad/s, hence $T=2\\pi/\\omega_s=0.25$ ms.'],
      ['Find','What happens to the term $\\sin(4000\\pi t)$.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'body', html:'The transform of the sine term is $\\frac{\\pi}{j}[\\delta(\\omega-4000\\pi)-\\delta(\\omega+4000\\pi)]$. Look at the single frequency $\\omega=+4000\\pi$ in the sampled spectrum. Two terms of the sum land there:'},
      {t:'eq', size:'sm', tex:'\\underbrace{\\tfrac{1}{T}\\cdot\\tfrac{\\pi}{j}=+\\tfrac{4000\\pi}{j}}_{k=0,\\ \\text{baseband}}\\qquad\\text{and}\\qquad \\underbrace{\\tfrac{1}{T}\\cdot\\bigl(-\\tfrac{\\pi}{j}\\bigr)=-\\tfrac{4000\\pi}{j}}_{k=1,\\ \\text{carried in from }-4000\\pi}'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'+\\frac{4000\\pi}{j}\\;-\\;\\frac{4000\\pi}{j}\\;=\\;0', label:'Sum at $\\omega=4000\\pi$',
        note:'The same cancellation happens at $\\omega=-4000\\pi$. The sine component is not merely damaged; it is absent from the sampled signal.'}]},
    {t:'reveal', at:3, items:[
      {t:'body', html:'The time domain says the same thing in one line. With $T=1/4000$ s,'},
      {t:'eq', size:'sm', tex:'\\sin(4000\\pi\\,nT)=\\sin\\!\\left(4000\\pi\\cdot\\frac{n}{4000}\\right)=\\sin(\\pi n)=0\\quad\\text{for every integer } n',
        note:'Every sample of the sine term is taken at a zero crossing. No sampler can report a component it never sees.'}]},
    {t:'reveal', at:4, items:[
      {t:'note', kind:'ok', head:'The repair', html:'Add a <b>guard band</b>. Choosing $\\omega_g=1000\\pi$ rad/s gives $\\omega_s=2\\omega_M+\\omega_g=9000\\pi$ rad/s, so $T=2\\pi/9000\\pi=1/4500$ s, about $222.2\\ \\mu$s. The admissible cutoff interval is then $4000\\pi<\\omega_c<5000\\pi$ rad/s, which is not empty, and the samples of the sine term are no longer all zero.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:840,h:225,xr:[-KP(6500),KP(6500)],yr:[-2.25,1.75],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'\\text{sine term of }X_p(j\\omega)',
        pad:{l:80,r:26,t:28,b:36},ytarget:3,yticksOverride:[],
        xticksOverride:[0],xtickfmt:kpiTick});
      a.impulse(KP(4000),1.15,{color:C.in,label:false});
      a.impulse(-KP(4000),-1.15,{color:C.in,label:false});
      a.impulse(KP(4000),-1.15,{color:C.mid,label:false});
      a.impulse(-KP(4000),1.15,{color:C.mid,label:false});
      a.note(KP(4300),1.32,'k=0',{anchor:'start',color:C.in,fs:13,tex:true});
      a.note(KP(4300),-1.05,'k=1',{anchor:'start',color:C.mid,fs:13,tex:true});
      a.note(KP(4000),-1.82,'4000\\pi',{anchor:'middle',color:C.muted,fs:13,tex:true});
      a.note(-KP(4000),-1.82,'-4000\\pi',{anchor:'middle',color:C.muted,fs:13,tex:true});
      return a.svg(); },
      caption:'At $\\omega=\\pm4000\\pi$ the baseband arrow and the arrow brought in by the neighbouring copy have the same length and point in opposite directions.'},
    {t:'reveal', at:3, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:215,xr:[-0.0006,0.0016],yr:[-1.4,1.4],xlabel:'t\\;[\\text{ms}]',ylabel:'\\sin(4000\\pi t)',
          pad:{l:64,r:26,t:28,b:36},xtarget:5,ytarget:3,xtickfmt:v=>Math.abs(v)<1e-9?'0':(v*1000).toFixed(1)});
        a.curve(t=>Math.sin(4000*PI*t),{color:C.in,n:2400});
        for(let n=-2;n<=6;n++){ const tt=n/4000; if(tt<-0.0006||tt>0.0016) continue; a.point(tt,0,{color:C.err,r:5}); }
        return a.svg(); },
        caption:'The dots are the sample instants, with the axis read in milliseconds. Every one of them falls on a zero crossing.'}]}
  ]}
]},

/* --------------------------------------------------- the three-rate example */
{ id:'m7-ex-rates', module:'M7', nav:'Worked example · three rates', title:'Worked example — one signal at three rates', src:'p. 82',
  objective:'Compute the rate, the guard band and the copy height for three sampling periods of the same signal.',
  keywords:'worked example T1 T2 T3 guard band replica height oversampling undersampling boundary', steps:3, blocks:[
  {t:'eyebrow', text:'Module 7 · Worked example', src:'p. 82'},
  {t:'title', text:'Three periods, three verdicts'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','$x(t)=\\left(\\dfrac{\\sin\\pi t}{\\pi t}\\right)^{2}$, whose transform is a triangle of peak 1 reaching zero at $\\pm2\\pi$. So $\\omega_M=2\\pi$ rad/s and the Nyquist rate is $4\\pi$ rad/s.'],
      ['Find','For $T_1=0.40$ s, $T_2=0.50$ s and $T_3=2/3$ s: the rate $\\omega_s$, the guard band, and the height of each copy.'],
      ['Method','$\\omega_s=2\\pi/T$, guard band $\\omega_s-2\\omega_M$, copy height $1/T$ times the original peak.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, size:'sm', tex:'\\begin{aligned}T_1=0.40\\ \\text{s}:&\\quad \\omega_s=5\\pi,\\quad 5\\pi>4\\pi,\\quad \\text{guard}=+\\pi,\\quad 1/T_1=2.5\\\\[2pt]T_2=0.50\\ \\text{s}:&\\quad \\omega_s=4\\pi,\\quad 4\\pi=4\\pi,\\quad \\text{guard}=0,\\quad 1/T_2=2.0\\\\[2pt]T_3=2/3\\ \\text{s}:&\\quad \\omega_s=3\\pi,\\quad 3\\pi<4\\pi,\\quad \\text{guard}=-\\pi,\\quad 1/T_3=1.5\\end{aligned}',
        label:'Solution'}]},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Check','$\\omega_sT=2\\pi$ in each row: $5\\pi\\times0.4=2\\pi$, $4\\pi\\times0.5=2\\pi$, $3\\pi\\times2/3=2\\pi$.'],
        ['Reading','Only the first row is safe. The second sits on the boundary the previous scene ruled out, and the third overlaps by $\\pi$ rad/s on each side.']
      ]}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'Height and spacing move together', html:'The copies do not only slide as $T$ grows; they also shrink, because each is scaled by $1/T$. Between the first row and the third the height falls from 2.5 to 1.5 while the spacing falls from $5\\pi$ to $3\\pi$. A picture drawn with a fixed height for every rate hides half of what sampling does.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const rows=[[0.4,'T_1=0.40\\;\\text{s}'],[0.5,'T_2=0.50\\;\\text{s}'],[2/3,'T_3=2/3\\;\\text{s}']];
      return rows.map(function(r,i){
        const T=r[0], lab=r[1], ws=2*PI/T, pk=1/T;
        const a=P.Axes({w:840,h:i===2?170:146,xr:[-8*PI,8*PI],yr:[-0.25,3.6],
          xlabel:i===2?'\\omega\\;[\\text{rad/s}]':'',ylabel:'X_p(j\\omega)',
          pad:{l:58,r:26,t:26,b:i===2?36:14},ytarget:3,
          xticksOverride:wTicks(-8*PI,8*PI,PI),
          xtickfmt:v=>(i<2 || Math.abs(Math.round(v/PI))%2)?'':piTick(v)});
        for(let k=-3;k<=3;k++) a.curve(w=>tri(w-k*ws,WM,pk),{color:KCOL(k),width:i===2?1.4:2.2,dash:i===2?'4 4':null,n:1400});
        if(i===2) a.curve(w=>rep(w,WM,pk,ws,4),{color:C.err,width:2.6,n:1600});
        a.note(-7.6*PI,3.05,lab,{anchor:'start',color:C.muted,fs:13,tex:true});
        return a.svg(); }).join(''); },
      caption:'The same signal at three rates. The copies keep their identity throughout; only the gap between them changes, and in the last row it has closed.'}
  ]}
]},

/* ------------------------------------------------------ example, part (a) */
{ id:'m7-ex-73a', module:'M7', nav:'Worked example · a line spectrum', title:'Worked example — a signal made of three lines', src:'p. 82',
  objective:'Draw the spectrum of a constant plus a cosine plus a sine, with exact impulse locations and weights.',
  keywords:'worked example line spectrum impulse weights cosine sine bandwidth nyquist rate hertz', steps:3, blocks:[
  {t:'eyebrow', text:'Module 7 · Worked example', src:'p. 82'},
  {t:'title', text:'Every impulse, located and weighed'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','$x(t)=1+\\cos(2000\\pi t)+\\sin(4000\\pi t)$.'],
      ['Find','$X(j\\omega)$, the highest angular frequency $\\omega_M$, and the Nyquist rate.'],
      ['Method','Transform each term separately. A constant gives one impulse at the origin, a cosine gives a symmetric pair, a sine gives an antisymmetric pair.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'eq', size:'sm', tex:'1\\;\\longleftrightarrow\\;2\\pi\\delta(\\omega),\\qquad \\cos(\\omega_0t)\\;\\longleftrightarrow\\;\\pi\\bigl[\\delta(\\omega-\\omega_0)+\\delta(\\omega+\\omega_0)\\bigr],\\qquad \\sin(\\omega_0t)\\;\\longleftrightarrow\\;\\frac{\\pi}{j}\\bigl[\\delta(\\omega-\\omega_0)-\\delta(\\omega+\\omega_0)\\bigr]'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, size:'sm', tex:'X(j\\omega)=2\\pi\\delta(\\omega)+\\pi\\delta(\\omega-2000\\pi)+\\pi\\delta(\\omega+2000\\pi)+\\frac{\\pi}{j}\\delta(\\omega-4000\\pi)-\\frac{\\pi}{j}\\delta(\\omega+4000\\pi)',
        label:'Solution',
        note:'Five impulses. The two at $\\pm4000\\pi$ are imaginary and point in opposite directions, which is what makes the sine odd.'}]},
    {t:'reveal', at:3, items:[
      {t:'wex', rows:[
        ['Bandwidth','The furthest impulse from the origin sits at $4000\\pi$, so $\\omega_M=4000\\pi$ rad/s, that is $f_M=2000$ Hz.'],
        ['Nyquist rate','$2\\omega_M=8000\\pi$ rad/s, that is $4000$ Hz. Any working rate has to be strictly above it.'],
        ['Check','Every impulse is written as a function of $\\omega$. Something like $\\pi\\delta(2000\\pi)$ is a constant, not an impulse, and locates nothing.']
      ]}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:840,h:235,xr:[-KP(6200),KP(6200)],yr:[-1.7,2.9],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X(j\\omega)',
        pad:{l:64,r:26,t:28,b:36},ytarget:3,
        xticksOverride:[-KP(2000),0,KP(2000),KP(4000)],xtickfmt:kpiTick});
      a.impulse(0,2,{color:C.in,labelText:'2π'});
      a.impulse(KP(2000),1,{color:C.in,labelText:'π'});
      a.impulse(-KP(2000),1,{color:C.in,labelText:'π'});
      a.impulse(KP(4000),1,{color:C.h,labelText:'π/j'});
      a.impulse(-KP(4000),-1,{color:C.h,labelText:'-π/j'});
      a.note(-KP(4000),0.42,'-4000\\pi',{anchor:'middle',color:C.muted,fs:13,tex:true});
      return a.svg(); },
      caption:'The five impulses. The cyan ones are real and the amber pair is imaginary; an arrow drawn downward carries a negative weight.'},
    {t:'reveal', at:3, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:200,xr:[-0.0004,0.0016],yr:[-1.6,3.4],xlabel:'t\\;[\\text{ms}]',ylabel:'x(t)',
          pad:{l:58,r:26,t:28,b:36},xtarget:5,ytarget:3,xtickfmt:v=>Math.abs(v)<1e-9?'0':(v*1000).toFixed(1)});
        a.curve(t=>1+Math.cos(2000*PI*t)+Math.sin(4000*PI*t),{color:C.in,n:2400});
        return a.svg(); },
        caption:'The signal itself, with the axis read in milliseconds. It repeats every 1 ms.'}]}
  ]}
]},

/* ------------------------------------------------------ example, part (b) */
{ id:'m7-ex-73b', module:'M7', nav:'Worked example · the period', title:'Worked example — the sampling period, checked three ways', src:'p. 83',
  objective:'Compute the sampling period from the rate and defend it with three independent checks.',
  keywords:'sampling period milliseconds factor thousand check omega_s T = 2 pi replica height ratio', steps:4, blocks:[
  {t:'eyebrow', text:'Module 7 · Worked example', src:'p. 83'},
  {t:'title', text:'A period is a small number'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','The signal of the previous scene, with $\\omega_M=4000\\pi$ rad/s, sampled at its Nyquist rate $\\omega_s=8000\\pi$ rad/s.'],
      ['Find','The sampling period $T$.'],
      ['Method','$T=2\\pi/\\omega_s$, then check the answer before using it.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'T=\\frac{2\\pi}{\\omega_s}=\\frac{2\\pi}{8000\\pi}=\\frac{1}{4000}\\ \\text{s}=2.5\\times10^{-4}\\ \\text{s}=0.25\\ \\text{ms}',
        label:'Solution', note:'The matching rate in hertz is $f_s=1/T=4000$ Hz.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'A quarter of a millisecond, not a quarter of a second', html:'Cancelling the $\\pi$ but not the thousand gives $0.25$ s, and every later number in the problem is then wrong by a factor of 1000. A quarter of a second between samples would be four samples per second for a signal carrying 2000 Hz. Read the size of the answer before writing it down.'}]},
    {t:'reveal', at:3, items:[
      {t:'wex', rows:[
        ['Check 1','$\\omega_sT=8000\\pi\\times2.5\\times10^{-4}=2\\pi$. With $T=0.25$ s the product would be $2000\\pi$.'],
        ['Check 2','The copies in $X_p(j\\omega)$ are scaled by $1/T=4000$. With $T=0.25$ s the scale would be 4.'],
        ['Check 3','Doubling the rate must halve the period. At $\\omega_s=16000\\pi$ the period is $125\\ \\mu$s, and $0.25\\ \\text{ms}$ divided by $125\\ \\mu\\text{s}$ is exactly 2.']
      ]}]},
    {t:'reveal', at:4, items:[
      {t:'note', kind:'ok', head:'Make the check part of the work', html:'Every sampling period computed in this module is followed by $\\omega_sT=2\\pi$. It costs one multiplication and it catches a factor of $2\\pi$, a factor of 1000, and a reciprocal taken the wrong way round.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:840,h:245,xr:[-0.0002,0.0014],yr:[-1.6,3.4],xlabel:'t\\;[\\text{ms}]',ylabel:'x(t),\\;x_p(t)',
        pad:{l:62,r:26,t:28,b:36},xtarget:5,ytarget:3,xtickfmt:v=>Math.abs(v)<1e-9?'0':(v*1000).toFixed(2)});
      const f=t=>1+Math.cos(2000*PI*t)+Math.sin(4000*PI*t);
      a.curve(f,{color:C.in,width:1.4,dash:'3 5',opacity:.7,n:2400});
      samp(f,1/4000,-0.0002,0.0014).forEach(pr=>a.impulse(pr[0],pr[1],{color:C.mid,label:false}));
      return a.svg(); },
      caption:'Sampling every $0.25$ ms, with the axis read in milliseconds. Four samples cover one cycle of the 1 kHz cosine.'},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:195,xr:[-0.0002,0.0014],yr:[-1.6,3.4],xlabel:'t\\;[\\text{ms}]',ylabel:'x(t)',
          pad:{l:62,r:26,t:28,b:36},xtarget:5,ytarget:3,xtickfmt:v=>Math.abs(v)<1e-9?'0':(v*1000).toFixed(2)});
        const f=t=>1+Math.cos(2000*PI*t)+Math.sin(4000*PI*t);
        a.curve(f,{color:C.in,width:1.4,dash:'3 5',opacity:.7,n:2400});
        a.impulse(0,f(0),{color:C.err,label:false});
        return a.svg(); },
        caption:'What a period of $0.25$ s would mean on the same axis: the next sample lies a thousand cycles beyond the right-hand edge.'}]}
  ]}
]},

/* ------------------------------------------------------ example, part (c) */
{ id:'m7-ex-73c', module:'M7', nav:'Worked example · a triangular spectrum', title:'Worked example — area, peak, and the height of a copy', src:'p. 83',
  objective:'Separate the area of a convolution from the peak of the spectrum it produces.',
  keywords:'triangular spectrum convolution rectangles area peak replica height microseconds squaring', steps:4, blocks:[
  {t:'eyebrow', text:'Module 7 · Worked example', src:'p. 83'},
  {t:'title', text:'Two different numbers, both called the size'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','$x(t)=\\left(\\dfrac{\\sin(4000\\pi t)}{\\pi t}\\right)^{2}$, the square of a signal whose transform is a rectangle of height 1 on $|\\omega|\\le4000\\pi$.'],
      ['Find','$X(j\\omega)$, its peak, $\\omega_M$, the Nyquist period, and the height of one copy after sampling.'],
      ['Method','Squaring in time convolves in frequency and divides by $2\\pi$.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'eq', size:'sm', tex:'A=\\bigl[R*R\\bigr](0)=\\int_{-4000\\pi}^{4000\\pi}(1)(1)\\,\\d\\tau=8000\\pi,\\qquad X_{\\max}=X(0)=\\frac{A}{2\\pi}=4000',
        note:'$A$ is the <b>area</b> of the overlap of the two rectangles at zero shift. $X_{\\max}$ is the <b>peak of the spectrum</b>. They are different quantities, and $2\\pi$ separates them.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'One symbol, two meanings', html:'Writing $A=8000\\pi$ and then substituting 4000 wherever $A$ appears silently swaps the area for the peak. Give the peak its own name. Every later formula in this problem uses $X_{\\max}$, never $A$.'}]},
    {t:'reveal', at:3, items:[
      {t:'wex', rows:[
        ['Bandwidth','The triangle reaches zero at twice the rectangle half-width, so $\\omega_M=8000\\pi$ rad/s.'],
        ['Nyquist rate','$2\\omega_M=16000\\pi$ rad/s, hence $T=2\\pi/16000\\pi=1.25\\times10^{-4}$ s, that is $125\\ \\mu$s.'],
        ['Copy height','$X_{\\max}/T=4000\\times8000=3.2\\times10^{7}$.']
      ]}]},
    {t:'reveal', at:4, items:[
      {t:'note', kind:'ok', head:'Check the pair against the earlier part', html:'This bandwidth is twice the one in the line-spectrum problem, so this period must be half of it: $125\\ \\mu$s against $0.25$ ms. And $\\omega_sT=16000\\pi\\times1.25\\times10^{-4}=2\\pi$, as always.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:840,h:200,xr:[-KP(10500),KP(10500)],yr:[-300,5400],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X(j\\omega)',
        pad:{l:76,r:26,t:28,b:36},ytarget:3,
        xticksOverride:[-KP(8000),-KP(4000),0,KP(4000),KP(8000)],xtickfmt:kpiTick});
      a.curve(w=>tri(w,KP(8000),4000),{color:C.in,n:1600});
      a.point(0,4000,{color:C.coral,r:5});
      a.note(KP(400),4620,'X_{\\max}=4000',{anchor:'start',color:C.coral,fs:14,tex:true});
      return a.svg(); },
      caption:'The triangular spectrum. Its peak is 4000, while the area under the convolution that produced it is $8000\\pi$.'},
    {t:'reveal', at:3, items:[
      {t:'fig', frame:true, svg:()=>{
        const ws=KP(16000), pk=3.2e7;
        const a=P.Axes({w:840,h:210,xr:[-KP(35000),KP(35000)],yr:[-2.4e6,4.4e7],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X_p(j\\omega)\\;[\\times10^{7}]',
          pad:{l:76,r:26,t:28,b:36},ytarget:3,yticksOverride:[0,1e7,2e7,3e7],ytickfmt:v=>String(Math.round(v/1e7)),
          xticksOverride:[-KP(32000),-KP(16000),0,KP(16000),KP(32000)],xtickfmt:kpiTick});
        for(let k=-2;k<=2;k++) a.curve(w=>tri(w-k*ws,KP(8000),pk),{color:KCOL(k),n:1400});
        return a.svg(); },
        caption:'After sampling at the Nyquist rate the copies just touch, and each stands $3.2\\times10^{7}$ tall.'}]}
  ]}
]}

,

/* --------------------------------------------------------- reconstruction */
{ id:'m7-recon', module:'M7', nav:'Reconstruction', title:'Cutting one copy out of the sum', src:'p. 83',
  objective:'Specify the reconstruction filter and justify its gain and its cutoff.',
  keywords:'reconstruction ideal lowpass filter gain T cutoff omega_c baseband selection chain', steps:3, blocks:[
  {t:'eyebrow', text:'Module 7 · Reconstruction', src:'p. 83'},
  {t:'title', text:'One filter, two numbers to choose'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:'Sampling put a copy of $X(j\\omega)$ at every multiple of $\\omega_s$ and scaled all of them by $1/T$. If the copies are separated, recovering $x(t)$ means keeping the one at the origin and discarding the rest.'},
    {t:'eq', key:true, tex:'H_r(j\\omega)=\\begin{cases}T,&|\\omega|<\\omega_c\\\\[2pt]0,&|\\omega|>\\omega_c\\end{cases}\\qquad \\omega_M<\\omega_c<\\omega_s-\\omega_M',
      label:'Ideal reconstruction filter',
      note:'{{sym:wc|The cutoff}} sits in the guard band. The gain is $T$, and the reason is arithmetic: the baseband is $X(j\\omega)/T$, so multiplying by $T$ returns $X(j\\omega)$ exactly.'},
    {t:'reveal', at:1, items:[
      {t:'wex', rows:[
        ['Why $T$ and not 1','$T\\cdot\\frac{1}{T}X(j\\omega)=X(j\\omega)$. A filter of gain 1 returns a signal $T$ times too small, and since $T$ changes with the rate the error changes with it.'],
        ['Why not $|\\omega|\\le\\omega_c$','At a single point the value of an ordinary spectrum does not matter. The care is needed at the band edge only in the boundary case, where the two copies meet at that very point.']
      ]}]},
    {t:'reveal', at:2, items:[
      {t:'eq', size:'sm', tex:'X_r(j\\omega)=H_r(j\\omega)X_p(j\\omega)=T\\cdot\\frac{1}{T}X(j\\omega)=X(j\\omega)\\quad\\Longrightarrow\\quad x_r(t)=x(t)',
        note:'This line is true only when the copies do not overlap. If they do, $X_p$ inside $|\\omega|<\\omega_c$ is already a sum, and multiplying it by $T$ returns that sum rather than $X(j\\omega)$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'Name the signals apart', html:'The sampler produces {{sym:xp|$x_p(t)$}}. The reconstruction filter produces {{sym:xr|$x_r(t)$}}. They are different signals at different points of the chain, and a diagram whose sampler output is labelled $x_r(t)$ has skipped the filter that gives that name its meaning.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>P.blocks({w:840,h:170,items:[
      {t:'arrow',x1:40,y1:96,x2:190,y2:96},
      {t:'box',x:190,y:66,w:170,h:60,label:'sampler',fs:15},
      {t:'arrow',x1:360,y1:96,x2:520,y2:96},
      {t:'box',x:520,y:66,w:200,h:60,label:'H_r(j\\omega)',tex:true,fs:17},
      {t:'arrow',x1:720,y1:96,x2:820,y2:96},
      {t:'text',x:115,y:78,label:'x(t)',tex:true,fs:16,color:C.in},
      {t:'text',x:440,y:78,label:'x_p(t)',tex:true,fs:16,color:C.mid},
      {t:'text',x:790,y:78,label:'x_r(t)',tex:true,fs:16,color:C.out},
      {t:'text',x:275,y:150,label:'period T',fs:12},
      {t:'text',x:620,y:150,label:'gain T, cutoff',fs:12}
    ]}), caption:'The chain, with every stage named. Nothing is called $x_r$ before the filter.'},
    {t:'fig', frame:true, svg:()=>{
      const ws=6*PI, pk=3;
      const a=P.Axes({w:840,h:210,xr:[-9*PI,9*PI],yr:[-0.25,4.0],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X_p(j\\omega)',
        pad:{l:58,r:26,t:26,b:36},xticksOverride:wTicks(-8*PI,8*PI,2*PI),xtickfmt:piTick,ytarget:3});
      for(let k=-1;k<=1;k++) a.curve(w=>tri(w-k*ws,WM,pk),{color:KCOL(k),n:1400});
      a.rect(-3*PI,0,3*PI,3.4,{stroke:C.h,dash:'6 4',width:1.8});
      a.note(3.3*PI,3.45,'H_r(j\\omega)',{anchor:'start',color:C.h,fs:13,tex:true});
      return a.svg(); },
      caption:'The filter keeps the baseband and rejects both neighbours.'},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:180,xr:[-9*PI,9*PI],yr:[-0.15,1.35],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X_r(j\\omega)',
          pad:{l:58,r:26,t:26,b:36},xticksOverride:wTicks(-8*PI,8*PI,2*PI),xtickfmt:piTick,ytarget:3});
        a.curve(w=>tri(w,WM,1),{color:C.out,n:1600});
        return a.svg(); },
        caption:'What comes out: the original spectrum, at its original height.'}]}
  ]}
]},

/* ------------------------------------------------------------ interpolation */
{ id:'m7-interp', module:'M7', nav:'Band-limited interpolation', title:'What the filter does in the time domain', src:'pp. 85–86',
  objective:'Derive the interpolation kernel, state the sinc convention, and make the cutoff choice explicit.',
  keywords:'band limited interpolation kernel sinc unnormalised omega_c pi over T sample instants zero', steps:4, blocks:[
  {t:'eyebrow', text:'Module 7 · Interpolation', src:'pp. 85–86'},
  {t:'title', text:'Every sample carries a curve'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:'Filtering is convolution, and $x_p$ is a train of impulses, so the output is a sum of shifted copies of the filter\u2019s impulse response:'},
    {t:'eq', key:true, tex:'x_r(t)=\\sum_{n=-\\infty}^{\\infty}x(nT)\\,h_{LP}(t-nT)',
      label:'Reconstruction as interpolation'},
    {t:'reveal', at:1, items:[
      {t:'eq', size:'sm', tex:'h_{LP}(t)=\\frac{1}{2\\pi}\\int_{-\\omega_c}^{\\omega_c}T\\,e^{j\\omega t}\\,\\d\\omega=\\frac{T\\sin(\\omega_ct)}{\\pi t}',
        note:'So each sample is replaced by a curve of its own height, and the curves are added.'},
      {t:'eq', size:'sm', tex:'x_r(t)=\\sum_{n=-\\infty}^{\\infty}x(nT)\\,\\frac{T}{\\pi}\\cdot\\frac{\\sin\\bigl(\\omega_c(t-nT)\\bigr)}{t-nT}',
        label:'Written out'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'The sinc convention, restated', html:'Throughout this course $\\operatorname{sinc}(\\theta)=\\dfrac{\\sin\\theta}{\\theta}$, <b>unnormalised</b>. With the choice $\\omega_c=\\pi/T$ the kernel becomes $h_{LP}(t)=\\dfrac{\\sin(\\pi t/T)}{\\pi t/T}=\\operatorname{sinc}(\\pi t/T)$. Any expression written as $\\operatorname{sinc}(t/T)$ belongs to the other convention and does not equal this one.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'The $\\pi$ inside the sine is load-bearing', html:'The kernel must be 1 at $t=0$ and exactly 0 at every other sample instant, so that each sample controls its own instant and no other. Drop the $\\pi$ from the numerator and that property is lost at once: with $T=1$, the correct kernel at $t=1$ is $\\sin(\\pi)/\\pi=0$, while $\\sin(1)/\\pi=0.267849$. A kernel that does not vanish at the neighbouring instants is not an interpolation at all.'}]},
    {t:'reveal', at:4, items:[
      {t:'note', kind:'warn', head:'What $\\omega_c=\\pi/T$ costs', html:'That choice is exactly half the sampling rate, $\\omega_c=\\omega_s/2$, which is the end of the admissible interval rather than a point inside it. It is convenient because the kernel is then a single sinc, and it is safe only when $\\omega_M$ is strictly below $\\omega_s/2$. Say which cutoff is being used; it is a choice, not a definition.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:840,h:200,xr:[-4.4,4.4],yr:[-0.42,1.28],xlabel:'t/T',ylabel:'h_{LP}(t)',
        pad:{l:60,r:26,t:28,b:36},xtarget:7,ytarget:3});
      a.curve(u=>hLP(u,1),{color:C.h,n:2400});
      for(let m=-4;m<=4;m++) a.point(m,m===0?1:0,{color:C.coral,r:4});
      return a.svg(); },
      caption:'The kernel with $\\omega_c=\\pi/T$, drawn against $t/T$. It is 1 at its own instant and zero at every other one.'},
    {t:'reveal', at:1, items:[
      {t:'fig', frame:true, svg:()=>{
        const T=0.5;
        const a=P.Axes({w:840,h:210,xr:[-3.2,3.2],yr:[-0.45,1.35],xlabel:'t\\;[\\text{s}]',ylabel:'x(t),\\;x_r(t)',
          pad:{l:60,r:26,t:28,b:36},xtarget:7,ytarget:3});
        const pts=samp(xB,T,-9,9);
        pts.forEach(pr=>{ if(Math.abs(pr[0])>3.3) return;
          a.curve(t=>pr[1]*hLP(t-pr[0],T),{color:C.slate,width:1,opacity:.5,n:1200}); });
        a.curve(t=>{ let s=0; for(let i=0;i<pts.length;i++) s+=pts[i][1]*hLP(t-pts[i][0],T); return s; },{color:C.out,width:2.4,n:2000});
        a.curve(xB,{color:C.in,width:1.2,dash:'3 5',opacity:.8,n:2000});
        return a.svg(); },
        caption:'One kernel per sample, in grey, and their sum in green. It lands on the dashed original.'}]},
    {t:'reveal', at:3, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:190,xr:[-4.4,4.4],yr:[-0.42,1.28],xlabel:'t/T',ylabel:'\\text{kernel}',
          pad:{l:66,r:26,t:28,b:36},xtarget:7,ytarget:3});
        a.curve(u=>hLP(u,1),{color:C.h,n:2400});
        a.curve(u=>Math.abs(u)<1e-9?1:Math.sin(u)/(PI*u),{color:C.err,n:2400});
        for(let m=-4;m<=4;m++) a.point(m,m===0?1:0,{color:C.coral,r:4});
        return a.svg(); },
        caption:'The correct kernel in amber against the one with the $\\pi$ dropped, in red. The red curve misses every marked instant.'}]}
  ]}
]},

/* ------------------------------------------------------- the zero-order hold */
{ id:'m7-zoh', module:'M7', nav:'The zero-order hold', title:'The circuit that actually gets built', src:'pp. 83–84',
  objective:'Derive the zero-order-hold response and show why it is not ideal reconstruction.',
  keywords:'zero order hold staircase H_0 transfer function compensator approximation practical', steps:4, blocks:[
  {t:'eyebrow', text:'Module 7 · Practical reconstruction', src:'pp. 83–84'},
  {t:'title', text:'Hold each sample until the next one'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:'The ideal filter is not buildable: its impulse response starts before $t=0$ and never ends. What hardware does instead is hold: the output keeps the value $x(nT)$ for the whole interval until the next sample arrives.'},
    {t:'eq', key:true, tex:'h_0(t)=\\begin{cases}1,&0\\le t<T\\\\[2pt]0,&\\text{otherwise}\\end{cases}',
      label:'Zero-order hold, impulse response'},
    {t:'reveal', at:1, items:[
      {t:'eq', size:'sm', tex:'H_0(j\\omega)=\\int_{0}^{T}e^{-j\\omega t}\\,\\d t=\\frac{1-e^{-j\\omega T}}{j\\omega}=e^{-j\\omega T/2}\\,\\frac{2\\sin(\\omega T/2)}{\\omega}',
        label:'and its frequency response',
        note:'{{sym:zoh|$H_0$}} has magnitude $|2\\sin(\\omega T/2)/\\omega|$ and a linear phase $-\\omega T/2$, which is a delay of half a sampling period.'}]},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['At the origin','$H_0(0)=T$, so the hold already supplies the gain the ideal filter needed.'],
        ['Inside the band','The magnitude sags away from $T$ as $\\omega$ grows, so the recovered signal is filtered as well as reconstructed.'],
        ['Outside the band','The magnitude is small but never zero, so parts of the neighbouring copies survive as a staircase edge.']
      ]}]},
    {t:'reveal', at:3, items:[
      {t:'eq', size:'sm', tex:'H_r(j\\omega)=\\frac{H(j\\omega)}{H_0(j\\omega)}=e^{j\\omega T/2}H(j\\omega)\\,\\frac{\\omega}{2\\sin(\\omega T/2)}',
        label:'The compensator that would fix it',
        note:'It has to advance in time and to rise without bound where $\\sin(\\omega T/2)$ vanishes, so an exact compensator is not built either. What is built is an approximation of it.'}]},
    {t:'reveal', at:4, items:[
      {t:'note', kind:'err', head:'A hold is not a reconstruction', html:'The staircase is a different signal from $x(t)$, and no argument about small steps makes them equal. It is an approximation whose error is visible in the figure and measurable as the difference between the two curves. Calling the hold output "the reconstructed signal" hides exactly that error.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const T=0.5, pts=samp(xB,T,-3.6,3.6);
      const a=P.Axes({w:840,h:200,xr:[-3.2,3.2],yr:[-0.2,1.35],xlabel:'t\\;[\\text{s}]',ylabel:'x(t),\\;\\text{hold output}',
        pad:{l:76,r:26,t:28,b:36},xtarget:7,ytarget:3});
      a.curve(xB,{color:C.in,width:1.3,dash:'3 5',opacity:.85,n:2000});
      const stair=[]; pts.forEach(pr=>{ stair.push([pr[0],pr[1]]); stair.push([pr[0]+T,pr[1]]); });
      a.poly(stair,{color:C.out,width:2.4});
      return a.svg(); },
      caption:'The staircase against the original. Each tread is one sample held for one period.'},
    {t:'reveal', at:1, items:[
      {t:'fig', frame:true, svg:()=>{
        const T=0.5;
        const a=P.Axes({w:840,h:195,xr:[-6*PI,6*PI],yr:[-0.06,0.62],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'|H_0(j\\omega)|',
          pad:{l:66,r:26,t:28,b:36},xticksOverride:wTicks(-6*PI,6*PI,2*PI),xtickfmt:piTick,ytarget:3});
        a.curve(w=>Math.abs(w)<1e-9?T:Math.abs(2*Math.sin(w*T/2)/w),{color:C.h,n:2000});
        a.hline(T,{color:C.slate});
        a.note(0.4*PI,0.545,'\\text{ideal gain}\\;T',{anchor:'start',color:C.slate,fs:13,tex:true});
        return a.svg(); },
        caption:'The magnitude, with $T=0.5$ s. It equals $T$ only at the origin and leaks past the first zero at $\\omega_s$.'}]}
  ]}
]},

/* ------------------------------------------------------ the first-order hold */
{ id:'m7-foh', module:'M7', nav:'The first-order hold', title:'Joining the samples by straight lines', src:'p. 84',
  objective:'Build the first-order-hold response as a convolution of two rectangles and read its transform.',
  keywords:'first order hold triangle linear interpolation convolution rectangles H_1 squared response', steps:3, blocks:[
  {t:'eyebrow', text:'Module 7 · Practical reconstruction', src:'p. 84'},
  {t:'title', text:'One step better than a staircase'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:'The first-order hold joins consecutive samples by a straight line. Its impulse response is a triangle, and the triangle is built from the rectangle of the zero-order hold:'},
    {t:'eq', key:true, tex:'h_1(t)=\\frac{1}{T}\\bigl[g*g\\bigr](t),\\qquad g(t)=\\begin{cases}1,&|t|\\le T/2\\\\[2pt]0,&\\text{otherwise}\\end{cases}',
      label:'First-order hold, impulse response',
      note:'The convolution of the rectangle with itself is a triangle of peak $T$ on $|t|\\le T$, so $h_1$ is a triangle of peak 1 on the same interval. Every one of these is a function of $t$; the horizontal axis of all three sketches is time.'},
    {t:'reveal', at:1, items:[
      {t:'eq', size:'sm', tex:'G(j\\omega)=\\frac{2\\sin(\\omega T/2)}{\\omega}\\quad\\Longrightarrow\\quad H_1(j\\omega)=\\frac{1}{T}\\,G^{2}(j\\omega)=\\frac{1}{T}\\left[\\frac{\\sin(\\omega T/2)}{\\omega/2}\\right]^{2}',
        note:'{{sym:foh|$H_1$}} is real and non-negative, because a symmetric triangle has no phase. $H_1(0)=T$, the same gain as the zero-order hold.'}]},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Better','The response falls off as $1/\\omega^{2}$ instead of $1/\\omega$, so far less of the neighbouring copies survives and the output has no jumps.'],
        ['Worse','The sag inside the band is steeper, so the wanted part of the spectrum is shaped more heavily than by the zero-order hold.'],
        ['Not causal as drawn','The triangle is centred on $t=0$, so producing it needs the next sample as well as the present one. In practice the whole output is delayed by $T$.']
      ]}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'Where the holds sit', html:'Both holds are filters with a real, non-flat, non-band-limited response. They approximate the ideal reconstruction and they are what a converter actually contains. The distance between a hold output and the ideal interpolation is a number that can be computed, and it is what the laboratory of this module reports.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const T=1;
      const a=P.Axes({w:840,h:180,xr:[-1.8,1.8],yr:[-0.2,1.45],xlabel:'t\\;[\\text{s}]',ylabel:'g(t),\\;h_1(t)',
        pad:{l:66,r:26,t:28,b:36},xtarget:7,ytarget:3});
      a.curve(t=>Math.abs(t)<=T/2?1:0,{color:C.slate,n:2400});
      a.curve(t=>Math.abs(t)<=T?1-Math.abs(t)/T:0,{color:C.h,width:2.6,n:2400});
      a.note(1.72,1.24,'h_1',{anchor:'end',color:C.h,fs:14,tex:true});
      a.note(-1.72,1.24,'g',{anchor:'start',color:C.slate,fs:14,tex:true});
      return a.svg(); },
      caption:'With $T=1$ s: the rectangle $g$, and the triangle $h_1=(g*g)/T$ it produces. Both are functions of time.'},
    {t:'fig', frame:true, svg:()=>{
      const T=0.5, pts=samp(xB,T,-3.6,3.6);
      const a=P.Axes({w:840,h:190,xr:[-3.2,3.2],yr:[-0.2,1.35],xlabel:'t\\;[\\text{s}]',ylabel:'x(t),\\;\\text{hold output}',
        pad:{l:76,r:26,t:28,b:36},xtarget:7,ytarget:3});
      a.curve(xB,{color:C.in,width:1.3,dash:'3 5',opacity:.85,n:2000});
      a.poly(pts.filter(pr=>Math.abs(pr[0])<=3.3),{color:C.out,width:2.4});
      return a.svg(); },
      caption:'The output: the samples joined by straight lines.'},
    {t:'reveal', at:1, items:[
      {t:'fig', frame:true, svg:()=>{
        const T=0.5;
        const a=P.Axes({w:840,h:180,xr:[-6*PI,6*PI],yr:[-0.06,0.62],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'|H(j\\omega)|',
          pad:{l:66,r:26,t:28,b:36},xticksOverride:wTicks(-6*PI,6*PI,2*PI),xtickfmt:piTick,ytarget:3});
        a.curve(w=>Math.abs(w)<1e-9?T:Math.abs(2*Math.sin(w*T/2)/w),{color:C.slate,width:1.6,dash:'4 4',n:2000});
        a.curve(w=>Math.abs(w)<1e-9?T:Math.pow(Math.sin(w*T/2)/(w/2),2)/T,{color:C.h,width:2.4,n:2000});
        a.note(0.4*PI,0.545,'H_1',{anchor:'start',color:C.h,fs:14,tex:true});
        return a.svg(); },
        caption:'The first-order hold in amber against the zero-order hold, dashed. Both start at $T$; the amber one falls away faster.'}]}
  ]}
]},

/* ------------------------------------------------------ perfect reconstruction */
{ id:'m7-perfect', module:'M7', nav:'When recovery is exact', title:'The hypothesis that carries the whole theorem', src:'p. 85',
  objective:'Restate the band-limited hypothesis and show what happens when it fails.',
  keywords:'band limited hypothesis perfect reconstruction rectangular pulse not band limited practice', steps:3, blocks:[
  {t:'eyebrow', text:'Module 7 · The hypothesis', src:'p. 85'},
  {t:'title', text:'No band limit, no theorem'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:'Recovery is exact when three things hold together, and it is the first of them that is usually assumed without being checked.'},
    {t:'wex', rows:[
      ['1 · Band-limited','$X(j\\omega)=0$ for $|\\omega|>\\omega_M$, for some finite $\\omega_M$.'],
      ['2 · Rate','$\\omega_s>2\\omega_M$.'],
      ['3 · Filter','Gain $T$, cutoff strictly inside $\\omega_M<\\omega_c<\\omega_s-\\omega_M$.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'err', head:'A signal of finite duration is never band-limited', html:'Take a rectangular pulse of width $2T_1$. Its transform is $2\\sin(\\omega T_1)/\\omega$, which crosses zero again and again but is never zero on a whole interval. There is no $\\omega_M$ beyond which it vanishes, so no sampling rate makes the copies disjoint, and some aliasing is present at every rate.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'What is done instead', html:'A real signal is made band-limited before it is sampled, by a filter that removes what lies above the intended $\\omega_M$. What is then reconstructed exactly is the filtered signal, not the original, and the difference between them is a design decision rather than an accident.'}]},
    {t:'reveal', at:3, items:[
      {t:'small', html:'Two signals are worth keeping in mind as the extreme cases. A pure sinusoid is band-limited to a single frequency and is the easiest possible case, provided the rate is strictly above twice that frequency. A rectangular pulse is the hardest: it is exactly time-limited, and therefore never exactly band-limited.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:840,h:190,xr:[-1.6,1.6],yr:[-0.2,1.35],xlabel:'t\\;[\\text{s}]',ylabel:'x(t)',
        pad:{l:60,r:26,t:28,b:36},xtarget:7,ytarget:3});
      a.curve(t=>Math.abs(t)<=0.5?1:0,{color:C.in,n:2400});
      return a.svg(); },
      caption:'A rectangular pulse: exactly zero outside a finite interval of time.'},
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:840,h:210,xr:[-16*PI,16*PI],yr:[-0.04,1.25],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'|X(j\\omega)|',
        pad:{l:60,r:26,t:28,b:36},xticksOverride:wTicks(-16*PI,16*PI,4*PI),xtickfmt:piTick,ytarget:3});
      a.curve(w=>Math.abs(w)<1e-9?1:Math.abs(2*Math.sin(w*0.5)/w),{color:C.err,n:3000});
      return a.svg(); },
      caption:'Its transform never settles to zero. Whatever $\\omega_M$ is chosen, something is left beyond it.'},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const ws=8*PI, pk=4;
        const a=P.Axes({w:840,h:180,xr:[-16*PI,16*PI],yr:[-0.16,5.2],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'|X_p(j\\omega)|',
          pad:{l:60,r:26,t:28,b:36},xticksOverride:wTicks(-16*PI,16*PI,4*PI),xtickfmt:piTick,ytarget:3});
        const g=w=>Math.abs(w)<1e-9?1:2*Math.sin(w*0.5)/w;
        a.curve(w=>{ let s=0; for(let k=-4;k<=4;k++) s+=pk*g(w-k*ws); return Math.abs(s); },{color:C.err,width:2.4,n:3000});
        return a.svg(); },
        caption:'Sampled at any rate, the tails of the copies add everywhere. The overlap is small, not absent.'}]}
  ]}
]},

/* --------------------------------------------------------- aliasing of a cosine */
{ id:'m7-alias-cos', module:'M7', nav:'A cosine below the rate', title:'A cosine returns as a lower frequency', src:'p. 86',
  objective:'Track a single cosine through three rates and identify the surviving line.',
  keywords:'cosine three rates surviving line omega_s minus omega_0 identity lower frequency cutoff assumption', steps:4, blocks:[
  {t:'eyebrow', text:'Module 7 · The alias frequency', src:'p. 86'},
  {t:'title', text:'Which line comes out of the filter'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','$x(t)=\\cos(\\omega_0t)$, so $X(j\\omega)=\\pi\\delta(\\omega-\\omega_0)+\\pi\\delta(\\omega+\\omega_0)$ and $\\omega_M=\\omega_0$.'],
      ['Assume','The reconstruction cutoff is $\\omega_c=\\omega_s/2$. This is a choice and it is used in all three cases below.'],
      ['Find','The output for $\\omega_s=6\\omega_0$, $\\omega_s=3\\omega_0$ and $\\omega_s=1.5\\omega_0$.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'body', html:'Sampling puts a line at every $k\\omega_s\\pm\\omega_0$. The filter keeps whatever lies in $|\\omega|<\\omega_c$ and discards the rest, so the question is only which of those positions falls inside.'},
      {t:'eq', size:'sm', tex:'\\begin{aligned}\\omega_s=6\\omega_0:&\\quad \\omega_c=3\\omega_0,\\quad \\text{inside}: \\pm\\omega_0\\quad\\Rightarrow\\quad x_r(t)=\\cos(\\omega_0t)\\\\[2pt]\\omega_s=3\\omega_0:&\\quad \\omega_c=1.5\\omega_0,\\quad \\text{inside}: \\pm\\omega_0\\quad\\Rightarrow\\quad x_r(t)=\\cos(\\omega_0t)\\\\[2pt]\\omega_s=1.5\\omega_0:&\\quad \\omega_c=0.75\\omega_0,\\quad \\text{inside}: \\pm0.5\\omega_0\\quad\\Rightarrow\\quad x_r(t)=\\cos(0.5\\omega_0t)\\end{aligned}'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'X_r(j\\omega)=\\pi\\delta\\bigl(\\omega-(\\omega_s-\\omega_0)\\bigr)+\\pi\\delta\\bigl(\\omega+(\\omega_s-\\omega_0)\\bigr)\\quad\\Longrightarrow\\quad x_r(t)=\\cos\\bigl((\\omega_s-\\omega_0)t\\bigr)',
        label:'The undersampled case',
        note:'Each impulse is written as a function of $\\omega$, so its position can be read. Writing $\\pi\\delta(\\omega_s-\\omega_0)$ instead would be a constant, and a constant locates nothing.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'The original frequency was removed', html:'In the third case the line at $\\omega_0$ lies outside the filter and is thrown away, while the line the $k=1$ copy contributed at $\\omega_s-\\omega_0$ lies inside and is kept. The output is a perfectly good cosine at the wrong frequency, and nothing in the samples says which frequency they came from.'}]},
    {t:'reveal', at:4, items:[
      {t:'note', kind:'ok', head:'The alias frequency', html:'When $\\omega_s<2\\omega_0$ the surviving line sits at $|\\omega_s-\\omega_0|$. The signal takes on the identity of a lower frequency, and this is read off the figure rather than remembered: it is the position of the nearest line the filter did not reject.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const w0=2*PI;
      const rows=[[6*w0,'\\omega_s=6\\omega_0'],[3*w0,'\\omega_s=3\\omega_0'],[1.5*w0,'\\omega_s=1.5\\omega_0']];
      return rows.map(function(r,i){
        const ws=r[0], lab=r[1], wc=ws/2, span=7*w0;
        const a=P.Axes({w:840,h:i===2?170:150,xr:[-span,span],yr:[-0.35,1.7],
          xlabel:i===2?'\\omega\\;[\\text{rad/s}]':'',ylabel:'X_p(j\\omega)',
          pad:{l:60,r:26,t:26,b:i===2?36:14},ytarget:2,yticksOverride:[],
          xticksOverride:wTicks(-span,span,2*PI),xtickfmt:v=>Math.abs(Math.round(v/PI))%4?'':piTick(v)});
        for(let k=-4;k<=4;k++) for(const s of [1,-1]){
          const pos=k*ws+s*w0; if(Math.abs(pos)>span) continue;
          a.impulse(pos,1.15,{color:Math.abs(pos)<wc?C.in:C.slate,label:false});
        }
        a.rect(-wc,0,wc,1.35,{stroke:C.h,dash:'6 4',width:1.6});
        a.note(-6.8*PI,1.5,lab,{anchor:'start',color:C.muted,fs:13,tex:true});
        return a.svg(); }).join(''); },
      caption:'Three rates with $\\omega_0=2\\pi$ rad/s. The dashed box is the filter; a line drawn in cyan is kept and a grey one is rejected. In the last row the kept line is not the one the signal started with.'}
  ]}
]},

/* ------------------------------------------------------ the p.87 style example */
{ id:'m7-ex-alias', module:'M7', nav:'Worked example · three periods', title:'Worked example — checking against the right bandwidth', src:'p. 87',
  objective:'Test three sampling periods against the Nyquist rate of the signal actually being sampled.',
  keywords:'worked example cos(2 pi t) three periods verdict comparison bandwidth alias cos(pi t)', steps:4, blocks:[
  {t:'eyebrow', text:'Module 7 · Worked example', src:'p. 87'},
  {t:'title', text:'Three periods, one signal, one bandwidth'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','$x(t)=\\cos(2\\pi t)$. Its only frequency is $2\\pi$ rad/s, so $\\omega_M=2\\pi$ and the Nyquist rate is $2\\omega_M=4\\pi$ rad/s.'],
      ['Find','Whether $T_1=1/4$ s, $T_2=1/3$ s and $T_3=2/3$ s recover the signal, and what is recovered when one of them does not.'],
      ['Method','Compute $\\omega_s=2\\pi/T$ and compare it with $4\\pi$. Take the cutoff at $\\omega_c=\\omega_s/2$.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, size:'sm', tex:'\\begin{aligned}T_1=1/4:&\\quad \\omega_s=8\\pi,\\quad 8\\pi>4\\pi\\ \\checkmark,\\quad \\omega_c=4\\pi,\\quad x_r(t)=\\cos(2\\pi t)\\\\[2pt]T_2=1/3:&\\quad \\omega_s=6\\pi,\\quad 6\\pi>4\\pi\\ \\checkmark,\\quad \\omega_c=3\\pi,\\quad x_r(t)=\\cos(2\\pi t)\\\\[2pt]T_3=2/3:&\\quad \\omega_s=3\\pi,\\quad 3\\pi<4\\pi\\ \\times,\\quad \\omega_c=1.5\\pi,\\quad x_r(t)=\\cos(\\pi t)\\end{aligned}',
        label:'Solution'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Compare against this signal, not a neighbouring one', html:'The whole verdict rests on the number the rate is compared with. For this signal that number is $2\\omega_M=4\\pi$. Comparing against $6\\pi$ instead makes the second row read $6\\pi\\ge6\\pi$, an equality — and the boundary case is exactly what the theorem excludes. Reading a bandwidth off the wrong signal turns a comfortable margin into a false boundary.'}]},
    {t:'reveal', at:3, items:[
      {t:'wex', rows:[
        ['The alias','In the third row the line at $2\\pi$ is outside $\\omega_c=1.5\\pi$ and is discarded; the line the first copy contributes at $\\omega_s-\\omega_0=3\\pi-2\\pi=\\pi$ is inside and is kept.'],
        ['Check','$\\cos(2\\pi\\,nT_3)=\\cos(4\\pi n/3)$ and $\\cos(\\pi\\,nT_3)=\\cos(2\\pi n/3)$. These agree for every integer $n$, because $4\\pi n/3=2\\pi n-2\\pi n/3$ and the cosine is even.']
      ]}]},
    {t:'reveal', at:4, items:[
      {t:'note', kind:'ok', head:'What the samples cannot tell you', html:'The samples of $\\cos(2\\pi t)$ at $T_3=2/3$ s and the samples of $\\cos(\\pi t)$ at the same instants are the same numbers. No reconstruction can prefer one over the other; the filter answers with the lower of the two, and the information that would have separated them was lost at the sampler.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:840,h:225,xr:[-0.3,3.1],yr:[-1.45,1.45],xlabel:'t\\;[\\text{s}]',ylabel:'x(t),\\;x_r(t)',
        pad:{l:66,r:26,t:28,b:36},xtarget:7,ytarget:3});
      a.curve(t=>Math.cos(2*PI*t),{color:C.in,width:1.4,dash:'3 5',opacity:.85,n:2400});
      a.curve(t=>Math.cos(PI*t),{color:C.err,width:2.4,n:2400});
      samp(t=>Math.cos(2*PI*t),2/3,-0.3,3.1).forEach(pr=>a.point(pr[0],pr[1],{color:C.mid,r:5}));
      a.note(3.0,1.24,'x_r',{anchor:'end',color:C.err,fs:14,tex:true});
      return a.svg(); },
      caption:'At $T_3=2/3$ s the dots are the samples. They lie on the dashed $\\cos(2\\pi t)$ and on the solid $\\cos(\\pi t)$ at the same time.'},
    {t:'reveal', at:3, items:[
      {t:'fig', frame:true, svg:()=>{
        const ws=3*PI, wc=1.5*PI, span=7*PI;
        const a=P.Axes({w:840,h:195,xr:[-span,span],yr:[-0.35,1.75],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X_p(j\\omega)',
          pad:{l:60,r:26,t:28,b:36},ytarget:2,yticksOverride:[],
          xticksOverride:wTicks(-span,span,PI),xtickfmt:piTick});
        for(let k=-3;k<=3;k++) for(const s of [1,-1]){
          const pos=k*ws+s*2*PI; if(Math.abs(pos)>span) continue;
          a.impulse(pos,1.15,{color:Math.abs(pos)<wc?C.err:C.slate,label:false});
        }
        a.rect(-wc,0,wc,1.4,{stroke:C.h,dash:'6 4',width:1.6});
        return a.svg(); },
        caption:'The lines after sampling at $T_3$. Only the pair at $\\pm\\pi$ survives the filter, and it came from the copies, not from the baseband.'}]}
  ]}
]},

/* ------------------------------------------------------------ two components */
{ id:'m7-hw-alias', module:'M7', nav:'Two components, one rate', title:'When only part of a signal aliases', src:'p. 87',
  objective:'Sample a two-component signal below its Nyquist rate and identify both surviving lines.',
  keywords:'two components cos(pi t) cos(3 pi t) alias 2 pi inverse transform separate bandwidths', steps:4, blocks:[
  {t:'eyebrow', text:'Module 7 · Worked example', src:'p. 87'},
  {t:'title', text:'One component survives, the other changes identity'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','$x(t)=\\cos(\\pi t)+\\cos(3\\pi t)$. The two component frequencies are $\\pi$ and $3\\pi$ rad/s, so $\\omega_M=3\\pi$ and the Nyquist rate is $6\\pi$ rad/s.'],
      ['Sample at','$T=2/5$ s, so $\\omega_s=2\\pi/T=5\\pi$ rad/s and $\\omega_c=\\omega_s/2=2.5\\pi$ rad/s.'],
      ['Find','$x_r(t)$.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'body', html:'First the verdict: $5\\pi<6\\pi$, so the rate is below the Nyquist rate of <b>this</b> signal and aliasing is expected. Note that $6\\pi$ is the Nyquist rate here and $4\\pi$ was the Nyquist rate of the single cosine in the previous scene. The two signals have different bandwidths and their tests are not interchangeable.'},
      {t:'wex', rows:[
        ['Baseband lines','$\\pi$ is inside $2.5\\pi$ and survives. $3\\pi$ is outside and is discarded.'],
        ['Copy lines','$\\omega_s-3\\pi=2\\pi$ is inside and survives. $\\omega_s-\\pi=4\\pi$ is outside and is discarded.']
      ]}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, size:'sm', tex:'X_r(j\\omega)=\\pi\\bigl[\\delta(\\omega-\\pi)+\\delta(\\omega+\\pi)\\bigr]+\\pi\\bigl[\\delta(\\omega-2\\pi)+\\delta(\\omega+2\\pi)\\bigr]',
        label:'Recovered spectrum'},
      {t:'eq', key:true, tex:'X_r(j\\omega)\\;\\xrightarrow{\\ \\mathcal{F}^{-1}\\ }\\;x_r(t)=\\cos(\\pi t)+\\cos(2\\pi t)',
        label:'Recovered signal',
        note:'The arrow is the <b>inverse</b> transform. Going from a spectrum back to a signal is $\\mathcal{F}^{-1}$; the forward $\\mathcal{F}$ points the other way and would leave the answer in the wrong domain.'}]},
    {t:'reveal', at:3, items:[
      {t:'wex', rows:[
        ['Reading','The low component came through untouched. The high one left at $3\\pi$ and came back at $2\\pi$, which is $\\omega_s-3\\pi$.'],
        ['Check','$\\cos(3\\pi nT)=\\cos(6\\pi n/5)$ and $\\cos(2\\pi nT)=\\cos(4\\pi n/5)$. Since $6\\pi n/5=2\\pi n-4\\pi n/5$, the two sequences are identical.']
      ]}]},
    {t:'reveal', at:4, items:[
      {t:'note', kind:'err', head:'Aliasing is not all-or-nothing', html:'A signal can be sampled too slowly for one of its components and fast enough for another. The output is then part signal and part impostor, and the impostor sits at a frequency the original never contained. Reporting "the signal was aliased" without saying which component moved where is not an answer.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const ws=5*PI, wc=2.5*PI, span=6.5*PI;
      const a=P.Axes({w:840,h:215,xr:[-span,span],yr:[-0.35,1.8],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X_p(j\\omega)',
        pad:{l:60,r:26,t:28,b:36},ytarget:2,yticksOverride:[],
        xticksOverride:wTicks(-span,span,PI),xtickfmt:piTick});
      for(let k=-2;k<=2;k++) for(const w0 of [PI,3*PI]) for(const s of [1,-1]){
        const pos=k*ws+s*w0; if(Math.abs(pos)>span) continue;
        const keep=Math.abs(pos)<wc;
        a.impulse(pos,1.15,{color:keep?(k===0?C.in:C.err):C.slate,label:false});
      }
      a.rect(-wc,0,wc,1.42,{stroke:C.h,dash:'6 4',width:1.6});
      return a.svg(); },
      caption:'The lines after sampling at $T=2/5$ s. Cyan is a baseband line that survived, red is a line brought in by a copy, grey is rejected.'},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:215,xr:[-0.3,4.3],yr:[-2.4,2.4],xlabel:'t\\;[\\text{s}]',ylabel:'x(t),\\;x_r(t)',
          pad:{l:60,r:26,t:28,b:36},xtarget:7,ytarget:3});
        a.curve(t=>Math.cos(PI*t)+Math.cos(3*PI*t),{color:C.in,width:1.4,dash:'3 5',opacity:.85,n:2600});
        a.curve(t=>Math.cos(PI*t)+Math.cos(2*PI*t),{color:C.err,width:2.4,n:2600});
        samp(t=>Math.cos(PI*t)+Math.cos(3*PI*t),0.4,-0.3,4.3).forEach(pr=>a.point(pr[0],pr[1],{color:C.mid,r:4.6}));
        return a.svg(); },
        caption:'Both curves pass through every sample. The solid one is what the filter returns.'}]}
  ]}
]},

/* ---------------------------------------------------------- anti-aliasing */
{ id:'m7-antialias', module:'M7', nav:'The anti-aliasing filter', title:'A filter that has to come first', src:'p. 88',
  objective:'Place the anti-aliasing filter before the sampler and compare the two error energies.',
  keywords:'anti aliasing filter before sampler order chain error energy comparison guard band design', steps:4, blocks:[
  {t:'eyebrow', text:'Module 7 · Design', src:'p. 88'},
  {t:'title', text:'Remove it before it can fold'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:'A real signal is not band-limited, and a sampler at a fixed rate cannot be helped after the fact. The repair is a lowpass filter placed <b>before</b> the sampler, which removes everything above $\\omega_s/2$ while it can still be removed cleanly.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'err', head:'The order of the stages is the whole point', html:'Put the same filter after the sampler and it does nothing useful: by then the high frequencies have already folded into the band and been added to the wanted content. A filter cannot separate two numbers that were added before it saw them. Anti-aliasing filtering is only anti-aliasing while it is upstream of the sampler.'}]},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Without the filter','$x(t)=\\cos(\\pi t)+\\cos(3\\pi t)$ at $T=2/5$ s gives $x_r(t)=\\cos(\\pi t)+\\cos(2\\pi t)$. The error is $e(t)=\\cos(3\\pi t)-\\cos(2\\pi t)$.'],
        ['With the filter','A lowpass at $\\omega_c=2.5\\pi$ ahead of the sampler removes the $3\\pi$ component first. What is then sampled is $\\cos(\\pi t)$ alone, and it is recovered exactly, so the error is $e(t)=\\cos(3\\pi t)$.']
      ]}]},
    {t:'reveal', at:3, items:[
      {t:'eq', key:true, tex:'\\overline{e^{2}}\\Big|_{\\text{no filter}}=\\tfrac12+\\tfrac12=1,\\qquad \\overline{e^{2}}\\Big|_{\\text{filtered}}=\\tfrac12',
        label:'Mean-square error, averaged over one period of 2 s',
        note:'The two cosines in the unfiltered error are at different harmonics of $\\pi$ rad/s, so their cross term averages to zero and the powers add. Filtering first halves the error power.'}]},
    {t:'reveal', at:4, items:[
      {t:'note', kind:'ok', head:'What the filter buys and what it costs', html:'It costs the component at $3\\pi$, which is lost either way. It buys the removal of the impostor at $2\\pi$, a frequency the signal never contained. Losing content is a known, bounded error; adding content that was never there is not, because nothing downstream can tell it apart from the signal.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>P.blocks({w:900,h:180,items:[
      {t:'arrow',x1:20,y1:96,x2:120,y2:96},
      {t:'box',x:120,y:66,w:170,h:60,label:'H_{AA}(j\\omega)',tex:true,fs:16},
      {t:'arrow',x1:290,y1:96,x2:400,y2:96},
      {t:'box',x:400,y:66,w:140,h:60,label:'sampler',fs:15},
      {t:'arrow',x1:540,y1:96,x2:650,y2:96},
      {t:'box',x:650,y:66,w:140,h:60,label:'H_r(j\\omega)',tex:true,fs:16},
      {t:'arrow',x1:790,y1:96,x2:880,y2:96},
      {t:'text',x:68,y:78,label:'x(t)',tex:true,fs:15,color:C.in},
      {t:'text',x:345,y:78,label:'\\tilde{x}(t)',tex:true,fs:15,color:C.h},
      {t:'text',x:595,y:78,label:'x_p(t)',tex:true,fs:15,color:C.mid},
      {t:'text',x:838,y:78,label:'x_r(t)',tex:true,fs:15,color:C.out},
      {t:'text',x:205,y:154,label:'cut above half the rate',fs:12},
      {t:'text',x:470,y:154,label:'period T',fs:12}
    ]}), caption:'The chain in the only order that works. The sampler output is $x_p(t)$; the name $x_r(t)$ belongs to the output of the reconstruction filter and to nothing before it.'},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:215,xr:[-0.2,4.2],yr:[-2.6,2.6],xlabel:'t\\;[\\text{s}]',ylabel:'\\text{error}\\;e(t)',
          pad:{l:70,r:26,t:28,b:36},xtarget:7,ytarget:3});
        a.curve(t=>Math.cos(3*PI*t)-Math.cos(2*PI*t),{color:C.err,width:2.4,n:2600});
        a.curve(t=>Math.cos(3*PI*t),{color:C.out,width:2.2,n:2600});
        a.note(4.1,2.28,'\\text{no filter}',{anchor:'end',color:C.err,fs:13,tex:true});
        a.note(4.1,-2.3,'\\text{filtered first}',{anchor:'end',color:C.out,fs:13,tex:true});
        return a.svg(); },
        caption:'The two error signals on the same axes. The red one swings twice as far in power as the green one.'}]}
  ]}
]},

/* --------------------------------------------------------- temporal aliasing */
{ id:'m7-temporal', module:'M7', nav:'Aliasing in time', title:'A wheel that turns backwards', src:'p. 88',
  objective:'Apply the alias formula to a rotating object observed frame by frame.',
  keywords:'temporal aliasing stroboscopic wheel frames per second backwards rotation apparent frequency', steps:3, blocks:[
  {t:'eyebrow', text:'Module 7 · Aliasing outside a circuit', src:'p. 88'},
  {t:'title', text:'The same arithmetic, on a camera'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','A marked spoke turns at 9 revolutions per second. A camera records 10 frames per second.'],
      ['Find','The rotation the recording appears to show.'],
      ['Method','The angle of the spoke is a signal, $\\theta(t)=2\\pi(9)t$. The camera samples it at $f_s=10$ Hz, so $\\omega_s=20\\pi$ rad/s while the signal carries $\\omega_0=18\\pi$ rad/s.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'\\omega_s=20\\pi<2\\omega_0=36\\pi\\quad\\Longrightarrow\\quad \\text{alias at}\\ |\\omega_s-\\omega_0|=2\\pi\\ \\text{rad/s}',
        label:'Verdict', note:'That is 1 revolution per second, and the surviving line comes from the copy of the negative-frequency component, so the apparent rotation is in the opposite direction.'}]},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Frame by frame','Between frames the spoke advances $9/10$ of a turn. The eye reads that as $1/10$ of a turn backwards, because it always takes the shorter way round.'],
        ['Check','$\\cos(18\\pi\\,n/10)=\\cos(2\\pi n-2\\pi n/10)=\\cos(2\\pi n/10)$, which is exactly the sequence a 1 Hz rotation would produce.'],
        ['Faster camera','At 20 frames per second, $\\omega_s=40\\pi>36\\pi$, and the recording shows 9 revolutions per second in the correct direction.']
      ]}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'Nothing here is new', html:'A camera is a sampler with $T=1/f_s$, and a strobe lamp is the same device built from light. The rule that decides what is seen is the rule of this module, applied to a signal that happens to be an angle.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:840,h:215,xr:[-0.05,1.05],yr:[-1.45,1.45],xlabel:'t\\;[\\text{s}]',ylabel:'\\cos\\theta(t)',
        pad:{l:64,r:26,t:28,b:36},xtarget:6,ytarget:3});
      a.curve(t=>Math.cos(18*PI*t),{color:C.in,width:1.2,dash:'3 5',opacity:.8,n:3000});
      a.curve(t=>Math.cos(2*PI*t),{color:C.err,width:2.4,n:2000});
      samp(t=>Math.cos(18*PI*t),0.1,-0.05,1.05).forEach(pr=>a.point(pr[0],pr[1],{color:C.mid,r:5}));
      return a.svg(); },
      caption:'The true 9 Hz rotation, dashed, the ten frames per second as dots, and the 1 Hz rotation the frames describe.'},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:195,xr:[-0.5,10.5],yr:[-3.6,3.6],xlabel:'\\text{frame number}',ylabel:'\\text{apparent angle}\\;[\\text{rad}]',
          pad:{l:86,r:26,t:28,b:36},xtarget:6,ytarget:3});
        const wrap=v=>{ let u=v; while(u>PI) u-=2*PI; while(u<=-PI) u+=2*PI; return u; };
        a.stem(D(n=>wrap(2*PI*0.9*n),0,10),{color:C.mid,r:4});
        a.curve(n=>-2*PI*0.1*n,{color:C.err,width:1.8,dash:'5 4',n:600});
        return a.svg(); },
        caption:'The angle of the spoke as each frame records it, taken to the nearest turn. It walks steadily backwards along the dashed line.'}]}
  ]}
]},

/* ---------------------------------------------------------- spatial aliasing */
{ id:'m7-spatial', module:'M7', nav:'Aliasing in space', title:'The same arithmetic, on a grid of pixels', src:'p. 88',
  objective:'Apply the alias formula to a spatial pattern sampled on a regular grid.',
  keywords:'spatial aliasing moire grating pixels cycles per millimetre beat pattern sampling grid', steps:3, blocks:[
  {t:'eyebrow', text:'Module 7 · Aliasing outside a circuit', src:'p. 88'},
  {t:'title', text:'A pattern the grid cannot hold'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','A striped pattern of 9 cycles per millimetre, recorded on a grid of 10 sample points per millimetre.'],
      ['Find','The pattern the grid records.'],
      ['Method','Position takes the place of time. The spatial frequency is $9$ cycles/mm and the spatial sampling rate is $10$ samples/mm, so the same comparison applies with lengths in place of seconds.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'2\\times9=18>10\\quad\\Longrightarrow\\quad \\text{recorded pattern at}\\ |10-9|=1\\ \\text{cycle/mm}',
        label:'Verdict', note:'A fine stripe pattern is recorded as a coarse one. The recorded pattern is a real feature of the samples and does not exist in the object.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Why it looks like a new pattern rather than a mistake', html:'The broad bands the grid produces are smooth, regular and convincing. Nothing in the samples marks them as false. This is the same situation as the cosine that came back at a lower frequency, and it has the same cure: remove the fine detail before recording it, by blurring slightly, rather than after.'}]},
    {t:'reveal', at:3, items:[
      {t:'small', html:'Two regular patterns laid over one another produce the same effect without any sampler at all. Stripes at $1.0$ mm and stripes at $1.1$ mm have spatial frequencies $1.000$ and $0.909$ cycles/mm, and the pattern they make together repeats every $1/(1.000-0.909)=11$ mm. That is the beat, and a sampling grid is one of the two patterns whenever an image is recorded.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:840,h:215,xr:[-0.05,2.05],yr:[-0.15,1.25],xlabel:'x\\;[\\text{mm}]',ylabel:'\\text{brightness}',
        pad:{l:76,r:26,t:28,b:36},xtarget:6,ytarget:3});
      a.curve(x=>0.5+0.5*Math.cos(2*PI*9*x),{color:C.in,width:1.1,opacity:.7,n:4000});
      a.curve(x=>0.5+0.5*Math.cos(2*PI*x),{color:C.err,width:2.4,n:2000});
      samp(x=>0.5+0.5*Math.cos(2*PI*9*x),0.1,-0.05,2.05).forEach(pr=>a.point(pr[0],pr[1],{color:C.mid,r:4.4}));
      return a.svg(); },
      caption:'Nine cycles per millimetre in cyan, the grid points as dots, and the one cycle per millimetre they describe.'},
    {t:'reveal', at:3, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:180,xr:[0,22],yr:[0,1],grid:false,zeroAxes:false,arrows:false,
          pad:{l:20,r:20,t:14,b:14},xticksOverride:[],yticksOverride:[]});
        for(let i=0;i<=22;i++) a.rect(i*1.0,0.52,i*1.0+0.5,0.98,{fill:C.ink});
        for(let i=0;i<=20;i++) a.rect(i*1.1,0.02,i*1.1+0.5,0.48,{fill:C.ink});
        for(let i=0;i<=22;i++) a.rect(i*1.0,0.02,i*1.0+0.5,0.48,{fill:C.ink});
        return a.svg(); },
        caption:'Stripes at $1.0$ mm alone, above, and the same stripes overlaid with stripes at $1.1$ mm, below. The lower strip is dark where the two agree and grey where they do not, and that alternation repeats every $11$ mm.'}]}
  ]}
]},

/* -------------------------------------------------------------- laboratory */
{ id:'m7-lab-j', module:'M7', nav:'Laboratory J · Sampling studio', title:'Laboratory J — Sampling and Aliasing Studio', src:'pp. 80–88',
  objective:'Move the rate through the three cases and watch the copies, the overlap and the reconstruction error together.',
  keywords:'laboratory J sampling studio presets oversampling critical undersampling zero order first order ideal', steps:0, blocks:[
  {t:'eyebrow', text:'Interactive laboratory J', src:'pp. 80–88'},
  {t:'title', text:'One rate control, four linked pictures'},
  {t:'lede', text:'Choose a preset or move the two sliders. The copies are drawn at every setting, so the guard band can be watched shrinking to zero and then going negative. Every number in the readout is computed from the definitions at the moment you move a control.'},
  {t:'lab', id:'J'}
]},

/* ----------------------------------------------------------- question bank */
{ id:'m7-qbank', module:'M7', nav:'Module 7 question bank', title:'Module 7 — question bank', src:'pp. 80–88',
  objective:'Twelve questions covering Module 7 outcomes.',
  keywords:'questions quiz Q7 bank module 7 exercises sampling aliasing nyquist reconstruction', steps:0, blocks:[
  {t:'eyebrow', text:'Module 7 · Question bank Q7-01 … Q7-12', src:'pp. 80–88'},
  {t:'title', text:'Question bank'},
  {t:'small', html:'Everything needed is in Modules 1–7. Several questions separate replication from aliasing, several test whether the Nyquist boundary is being read as safe, and several ask for a rate in the unit it was requested in.'},
  {t:'qbank', module:'M7'}
]},

/* ------------------------------------------------------------- synthesis */
{ id:'m7-synth', module:'M7', nav:'Module 7 synthesis', title:'Module 7 — what to carry forward', src:'pp. 80–88',
  dark:true, objective:'Consolidate the module into a procedure and a short list of traps.',
  keywords:'synthesis summary module 7 checklist procedure sampling design traps carry forward', steps:2, blocks:[
  {t:'eyebrow', text:'Module 7 · Synthesis', src:'pp. 80–88'},
  {t:'title', text:'A procedure, and the four ways it goes wrong'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:`<p style="color:#DED5C6"><b>1.</b> Find $\\omega_M$, the highest angular frequency the signal carries. If there is none, the signal is not band-limited and has to be filtered before anything else.</p>
      <p style="color:#DED5C6"><b>2.</b> Choose $\\omega_s$ strictly above $2\\omega_M$, leaving a guard band $\\omega_s-2\\omega_M$ wide enough for a real filter.</p>
      <p style="color:#DED5C6"><b>3.</b> Compute $T=2\\pi/\\omega_s$ and check $\\omega_sT=2\\pi$. Quote $f_s=1/T$ in hertz only when hertz was asked for.</p>
      <p style="color:#DED5C6"><b>4.</b> Draw the copies at every multiple of $\\omega_s$, each $1/T$ times the original height. Mark the baseband $k=0$.</p>
      <p style="color:#DED5C6"><b>5.</b> Place the reconstruction filter: gain $T$, cutoff strictly inside $\\omega_M<\\omega_c<\\omega_s-\\omega_M$.</p>
      <p style="color:#DED5C6"><b>6.</b> If the copies overlap, say which line came from which copy, and give the alias frequency $|\\omega_s-\\omega_0|$ for each component that moved.</p>`},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'err', head:'The four traps, in one place', html:'<span style="color:#DED5C6">Saying the copies disappear below the Nyquist rate — they never do, they overlap. Treating $\\omega_s=2\\omega_M$ as safe — the admissible cutoff interval is empty there. Reading $2\\pi/T$ in hertz — that is rad/s, and the error is a factor of $2\\pi$. Calling a hold output the reconstructed signal — a hold is an approximation with a measurable error.</span>'}]}
  ], right:[
    {t:'raw', html:'<p class="eyebrow" style="margin-bottom:14px"><span class="tick"></span>What this module leaves you with</p>'},
    {t:'lede', text:'A continuous signal and a sequence of numbers are now the same object, provided one inequality holds. That equivalence is what lets every result of the earlier modules be carried out on a machine.'},
    {t:'reveal', at:2, items:[
      {t:'body', html:`<p style="color:#DED5C6">The sampled signal carries the whole of $x(t)$ when $\\omega_s>2\\omega_M$, and the interpolation formula says exactly how to get it back:</p>`},
      {t:'eq', plain:true, tex:'x(t)=\\sum_{n=-\\infty}^{\\infty}x(nT)\\,\\frac{\\sin\\bigl(\\omega_c(t-nT)\\bigr)}{\\pi(t-nT)/T}'},
      {t:'body', html:`<p style="color:#DED5C6">Every term is a sample, and every sample is a number. Between them there is nothing left to know.</p>`}]}
  ]}
]}

];
window.SCENES_M7 = SC;
})();
