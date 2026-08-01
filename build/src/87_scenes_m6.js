/* ==========================================================================
   Module 6 — Discrete-Time Fourier Transform  [Source: 64–79]
   ========================================================================== */
(function(){
const P = PLOT, C = P.COL;
const PI = Math.PI;

/* stems over an integer range */
const D = (f,a,b)=>{const o=[];for(let n=Math.ceil(a);n<=b;n++)o.push([n,f(n)]);return o;};

/* A frequency axis is read in multiples of pi, so every spectrum in this module
   carries its tick row that way. A tick number is part of the scale of the
   frame rather than of the running mathematics, so it stays plain text; every
   axis name, annotation and bracket label around it is typeset. */
const piTick = v => {
  const r = v/PI;
  if(Math.abs(r) < 1e-9) return '0';
  for(const den of [1,2,3,4,6,8,12]){
    const num = r*den;
    if(Math.abs(num-Math.round(num)) < 1e-7){
      const k = Math.round(num), sg = k<0?'-':'', m = Math.abs(k);
      const head = m===1 ? 'π' : m+'π';
      return den===1 ? sg+head : sg+head+'/'+den;
    }
  }
  return P.fmt(v,2);
};
/* ticks at every `step` radians across the drawn range */
const wTicks = (lo,hi,step) => { const o=[];
  for(let k=Math.ceil(lo/step-1e-9); k<=hi/step+1e-9; k++) o.push(k*step); return o; };

/* Every spectrum in this module is drawn over more than one period of 2*pi, and
   the period itself is marked on the figure. That is the subject of the module,
   not a decoration: it is the one property that separates this transform from
   the continuous-time one.
   The name of the dependent variable is laid out above the data area, anchored on
   the zero line — which on a symmetric frequency axis is the middle of the figure.
   The bracket is therefore drawn without a label and the words are set to the left
   of it, so the two never share a column. */
const markPeriod = (a, v, o) => {
  o = o || {};
  const lo = o.lo!=null ? o.lo : -PI, hi = o.hi!=null ? o.hi : PI;
  a.vline(lo,{color:C.coral,opacity:.5}); a.vline(hi,{color:C.coral,opacity:.5});
  a.span(lo,hi,v,'',{color:C.coral});
  a.note(lo,v,'\\text{one period},\\;2\\pi',{tex:true,color:C.coral,fs:13,anchor:'end',dx:-8,dy:-3});
  return a;
};
/* A frequency tick is crossed by the data whenever the quantity drawn changes
   sign, because the tick row sits on the zero line. Those figures label the axis
   at the two ends of the marked period only; the dashed period markers carry the
   rest of the scale. */
const wPi = v => Math.abs(Math.abs(v)-PI) < 1e-9 ? piTick(v) : '';

/* ---- the transforms this module derives, as functions of omega ---- */
/* rectangular pulse, 1 on |n| <= N1: the Dirichlet kernel */
const dirich = (w,N1)=>{ const s=Math.sin(w/2);
  return Math.abs(s) < 1e-9 ? 2*N1+1 : Math.sin(w*(N1+0.5))/s; };
/* a^n u[n] */
const geoRe = (w,a)=>1-a*Math.cos(w), geoIm = (w,a)=>a*Math.sin(w);
const geoMag = (w,a)=>1/Math.sqrt(1-2*a*Math.cos(w)+a*a);
const geoPh  = (w,a)=>-Math.atan2(geoIm(w,a), geoRe(w,a));
/* a^{|n|} */
const twoSide = (w,a)=>(1-a*a)/(1-2*a*Math.cos(w)+a*a);
/* the ideal low-pass spectrum, periodic by 2*pi */
const wrap = w => w - 2*PI*Math.round(w/(2*PI));
const lpf = (w,W)=>Math.abs(wrap(w)) <= W ? 1 : 0;
/* its inverse transform */
const lpfInv = (n,W)=> n===0 ? W/PI : Math.sin(W*n)/(PI*n);
/* one copy of the convolution of two rectangular bands, scaled by 1/2pi, and
   the periodic convolution that adds every copy of it */
const rectConv = (w,W1,W2)=>{ const lo=Math.max(w-W1,-W2), hi=Math.min(w+W1,W2);
  return hi>lo ? (hi-lo)/(2*PI) : 0; };
const perConv = (w,W1,W2)=>{ let s=0;
  for(let k=-3;k<=3;k++) s += rectConv(w-2*PI*k,W1,W2); return s; };
/* discrete-time square-wave series coefficients */
const dtRect = (k,N,N1)=>{ const r=k/N;
  if(Math.abs(r-Math.round(r)) < 1e-12) return (2*N1+1)/N;
  return Math.sin(2*PI*k*(N1+0.5)/N)/(N*Math.sin(PI*k/N)); };

Object.assign(CONTENT.GLOSS, {
  Xejw:{ s:'X(e^{j\\omega})', d:'Discrete-time Fourier transform of the sequence x[n]. It is a continuous function of ω and it repeats every 2π.', go:'m6-pair' },
  dtftper:{ s:'2\\pi\\text{-periodicity}', d:'X(e^{j(ω+2π)}) = X(e^{jω}) for every sequence, because e^{−j2πn} = 1 at every integer n.', go:'m6-periodic' },
  dirk:{ s:'\\frac{\\sin(\\omega(N_1+\\frac12))}{\\sin(\\omega/2)}', d:'Dirichlet kernel: the transform of the rectangular pulse that is 1 on −N₁ ≤ n ≤ N₁. It is real and it changes sign.', go:'m6-ex-rect' },
  pconv:{ s:'\\circledast', d:'Periodic convolution: an integral over one period of 2π, not over all frequencies. It is what the multiplication property produces in discrete time.', go:'m6-mult' },
  zsub:{ s:'z=e^{-j\\omega}', d:'A named algebraic variable used to run partial fractions on a discrete-time transform. Substituting a value for z is algebra in z, not an evaluation of the unit-modulus quantity e^{−jω}.', go:'m6-conv' },
  expan:{ s:'x_{(k)}[n]', d:'Time expansion of x[n] by an integer factor k: x[n/k] when n is a multiple of k, and zero otherwise.', go:'m6-expansion' }
});

const SC = [

/* ============================================================ opening ==== */
{ id:'m6-open', module:'M6', nav:'Module 6 opening', title:'Discrete-Time Fourier Transform', src:'pp. 64–79',
  dark:true, keywords:'module 6 discrete time fourier transform DTFT periodic 2pi overview aperiodic sequence', steps:0, blocks:[
  {t:'eyebrow', text:'Module 6 · Discrete-Time Fourier Transform', src:'pp. 64–79'},
  {t:'title', level:1, text:'A spectrum that<br>repeats for ever.'},
  {t:'lede', text:'An aperiodic sequence has a spectrum, and that spectrum is a continuous function of frequency. It is also periodic: every value it takes at $\\omega$ it takes again at $\\omega+2\\pi$. Everything this module does follows from that one fact.'},
  {t:'cols', ratio:'c-5-7', left:[
    {t:'raw', html:`<div style="margin-top:16px">
      <div style="font-family:var(--mono);font-size:12.5px;letter-spacing:.14em;color:var(--slate);margin-bottom:10px">THE ENTIRE MODULE, IN TWO LINES</div></div>`},
    {t:'eq', tex:'X(e^{j\\omega})=\\sum_{n=-\\infty}^{\\infty}x[n]\\,e^{-j\\omega n}', label:'Analysis'},
    {t:'eq', tex:'x[n]=\\frac{1}{2\\pi}\\int_{2\\pi}X(e^{j\\omega})\\,e^{j\\omega n}\\,\\d\\omega', label:'Synthesis'},
    {t:'note', kind:'ok', head:'Why the second line has a finite range', html:'<span style="color:var(--graphite)">The spectrum repeats every $2\\pi$, so it carries no information outside one period. Integrating over one period recovers the whole sequence; integrating over all frequencies would count the same information again and again.</span>'}
  ], right:[
    {t:'fig', svg:()=>{
      const a=P.Axes({w:820,h:430,xr:[-3*PI,3*PI],yr:[-0.55,4.6],grid:false,zeroAxes:false,arrows:false,
        pad:{l:24,r:24,t:24,b:24},xticksOverride:[],yticksOverride:[]});
      a.curve(w=>twoSide(w,0.6)*0.62+3.0,{color:'#7FC3CE',width:2.4,n:2400});
      a.curve(w=>dirich(wrap(w),2)*0.16+1.85,{color:'#AC99DC',width:2.2,n:2400});
      a.curve(w=>geoMag(w,0.7)*0.30+0.75,{color:'#E5B255',width:2.2,n:2400});
      a.curve(w=>lpf(w,PI/2)*0.55-0.15,{color:'#8FBF8A',width:2.4,n:4000});
      for(const m of [-3,-1,1,3]) a.vline(m*PI,{color:'#6D7F8C',dash:'2 6',opacity:.7});
      return a.svg(); },
      caption:'Four different sequences, four different spectra, one shared property: each picture repeats itself every $2\\pi$ along the frequency axis.'}
  ]}
]},

/* ============================================== from the series to the transform */
{ id:'m6-derive', module:'M6', nav:'Building the transform', title:'From a periodic sequence to an aperiodic one', src:'p. 64',
  objective:'Build the periodic replication of a finite-support sequence and state the condition it needs.',
  keywords:'periodic replication finite support N > 2N1 aperiodic derivation discrete fourier series extension', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Construction', src:'p. 64'},
  {t:'title', text:'Make it periodic first, then let the period grow'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:'Take a sequence $x[n]$ of finite support: $x[n]=0$ for $|n|>N_1$. The discrete-time Fourier series of Module 4 applies to periodic sequences only, so build a periodic one out of $x$ first.'},
    {t:'eq', key:true, tex:'\\tilde{x}[n]=\\sum_{r=-\\infty}^{\\infty}x[n-rN]', label:'Periodic replication',
      note:'This is <b>replication</b>: the same finite sequence laid down again every $N$ samples. Nothing is inserted and nothing is padded.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'The condition the construction needs', html:'The copies must not overlap, so the period must be longer than the support:<br>$N>2N_1$. Only then is $\\tilde{x}[n]=x[n]$ for $-N_1\\le n\\le N_1$. With $N\\le 2N_1$ the tails of neighbouring copies add, and the middle period is no longer $x$.'}]},
    {t:'reveal', at:2, items:[
      {t:'body', html:'Both ends of the interval must point the same way. The statement is $-N_1\\le n\\le N_1$: a band of $2N_1+1$ samples centred on the origin. Reversing the second sign gives an interval with nothing in it.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'Where this is going', html:'As $N$ grows, the copies move apart and the middle one stops being disturbed at all. In the limit $N\\to\\infty$ the periodic sequence <i>is</i> $x$, and the series coefficients turn into a continuous function of frequency.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const f=n=>Math.abs(n)<=2?1:0;
      const a=P.Axes({w:800,h:200,xr:[-16,16],yr:[-0.25,1.45],xlabel:'n',ylabel:'x[n]',pad:{l:52,r:26,t:26,b:34},xtarget:8,ytarget:2});
      a.stem(D(f,-16,16),{color:C.in,showZero:true});
      a.span(-2,2,1.18,'2N_1+1\\;\\text{samples}',{tex:true,color:C.slate,fs:13});
      return a.svg(); },
      caption:'The finite-support sequence, here with $N_1=2$.'},
    {t:'reveal', at:1, items:[
      {t:'fig', frame:true, svg:()=>{
        const f=n=>{const m=n-9*Math.round(n/9); return Math.abs(m)<=2?1:0;};
        const a=P.Axes({w:800,h:200,xr:[-16,16],yr:[-0.25,1.45],xlabel:'n',ylabel:'\\tilde{x}[n]',pad:{l:52,r:26,t:26,b:34},xtarget:8,ytarget:2});
        a.stem(D(f,-16,16),{color:C.mid,showZero:true});
        a.span(-4.5,4.5,1.22,'N=9>2N_1',{tex:true,color:C.out,fs:13});
        return a.svg(); },
        caption:'Replication with $N=9$. The copies stand clear of one another, so the middle period reproduces $x[n]$ exactly.'}]},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const g=n=>{let s=0; for(let r=-6;r<=6;r++){const m=n-4*r; if(Math.abs(m)<=2) s+=1;} return s;};
        const a=P.Axes({w:800,h:200,xr:[-16,16],yr:[-0.35,2.85],xlabel:'n',ylabel:'\\tilde{x}[n]',pad:{l:52,r:26,t:26,b:34},xtarget:8,ytarget:3});
        a.stem(D(g,-16,16),{color:C.err,showZero:true});
        a.note(-15.4,2.38,'N=4\\le 2N_1',{tex:true,color:C.err,fs:14});
        return a.svg(); },
        caption:'The same replication with $N=4$. Neighbouring copies overlap and add, so no period of this sequence equals $x[n]$ any more.'}]}
  ]}
]},

/* ============================================================ the series step */
{ id:'m6-dtfs-link', module:'M6', nav:'Series coefficients as samples', title:'The coefficients are samples of one function', src:'p. 64',
  objective:'Write the series analysis equation with the correct sign and identify the envelope it samples.',
  keywords:'discrete fourier series analysis equation negative exponent envelope samples a_k sign', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Construction', src:'p. 64'},
  {t:'title', text:'One envelope, sampled every $\\omega_0$'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'eq', key:true, tex:'\\tilde{x}[n]=\\sum_{k=\\langle N\\rangle}a_k\\,e^{jk\\omega_0 n},\\qquad a_k=\\frac{1}{N}\\sum_{n=\\langle N\\rangle}\\tilde{x}[n]\\,e^{-jk\\omega_0 n},\\qquad \\omega_0=\\frac{2\\pi}{N}',
      label:'Discrete-time Fourier series'},
    {t:'note', kind:'err', head:'The sign in the analysis equation', html:'The analysis exponent is <b>negative</b>: $e^{-jk\\omega_0n}$. Synthesis builds the signal up from exponentials and carries $e^{+jk\\omega_0n}$; analysis takes the signal apart and carries the conjugate. Writing a plus in both places makes the two equations undo each other only by accident, and it breaks the identity derived on this page.'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'Over one period $\\tilde{x}[n]=x[n]$, and $x$ vanishes outside $-N_1\\le n\\le N_1$, so the sum may as well run over all $n$:'},
      {t:'eq', size:'sm', tex:'a_k=\\frac{1}{N}\\sum_{n=-N_1}^{N_1}x[n]\\,e^{-jk\\omega_0 n}=\\frac{1}{N}\\sum_{n=-\\infty}^{\\infty}x[n]\\,e^{-jk\\omega_0 n}'}]},
    {t:'reveal', at:2, items:[
      {t:'body', html:'The last sum is one function of a continuous frequency, evaluated at $\\omega=k\\omega_0$. Give it a name:'},
      {t:'eq', key:true, tex:'X(e^{j\\omega})=\\sum_{n=-\\infty}^{\\infty}x[n]\\,e^{-j\\omega n}\\qquad\\Longrightarrow\\qquad a_k=\\frac{1}{N}X(e^{jk\\omega_0})',
        note:'{{sym:Xejw|$X(e^{j\\omega})$}} is the <b>envelope</b>. The series coefficients are samples of it, spaced $\\omega_0=2\\pi/N$ apart and scaled by $1/N$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'The identity is a check on the sign', html:'$a_k=\\tfrac1N X(e^{jk\\omega_0})$ holds only when the two exponents match. The envelope is defined with $e^{-j\\omega n}$, so the analysis equation must carry $e^{-jk\\omega_0n}$ as well. A plus in one and a minus in the other breaks this line.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:205,xr:[-2*PI,2*PI],yr:[-1.6,6.1],xlabel:'\\omega',ylabel:'X(e^{j\\omega})',
        pad:{l:56,r:28,t:30,b:38},xticksOverride:wTicks(-2*PI,2*PI,PI),xtickfmt:piTick,ytarget:3});
      a.curve(w=>dirich(w,2),{color:C.in,n:2400});
      markPeriod(a,5.2);
      return a.svg(); },
      caption:'The envelope of the rectangular pulse with $N_1=2$, drawn over two periods. Its value at $\\omega=0$ is $2N_1+1=5$.'},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:205,xr:[-2*PI,2*PI],yr:[-0.30,0.80],xlabel:'\\omega',ylabel:'a_k',
          pad:{l:58,r:28,t:30,b:38},xticksOverride:wTicks(-2*PI,2*PI,PI),xtickfmt:piTick,ytarget:3});
        a.curve(w=>dirich(w,2)/9,{color:C.muted,n:2400,width:1.3,dash:'4 5'});
        const pts=[]; for(let k=-9;k<=9;k++) pts.push([k*2*PI/9, dtRect(k,9,2)]);
        a.stem(pts,{color:C.mid,showZero:true});
        markPeriod(a,0.63);
        return a.svg(); },
        caption:'The coefficients for $N=9$, drawn against the same frequency axis. Each stem is the dashed envelope divided by $N$, taken at $\\omega=k\\omega_0$.'}]},
    {t:'reveal', at:3, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:205,xr:[-2*PI,2*PI],yr:[-0.16,0.42],xlabel:'\\omega',ylabel:'a_k',
          pad:{l:58,r:28,t:30,b:38},xticksOverride:wTicks(-2*PI,2*PI,PI),xtickfmt:piTick,ytarget:3});
        a.curve(w=>dirich(w,2)/20,{color:C.muted,n:2400,width:1.3,dash:'4 5'});
        const pts=[]; for(let k=-20;k<=20;k++) pts.push([k*2*PI/20, dtRect(k,20,2)]);
        a.stem(pts,{color:C.mid,showZero:true,r:2.6});
        markPeriod(a,0.335);
        return a.svg(); },
        caption:'The same envelope with $N=20$. The stems crowd together and shrink; the shape they trace does not move.'}]}
  ]}
]},

/* ============================================================ the limit */
{ id:'m6-limit', module:'M6', nav:'Letting the period grow', title:'The sum becomes an integral', src:'pp. 64–65',
  objective:'Take the limit N to infinity and produce the synthesis equation.',
  keywords:'limit N infinity riemann sum integral 2pi omega0 to zero synthesis derivation', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Construction', src:'pp. 64–65'},
  {t:'title', text:'Spacing goes to zero, the sum goes to an integral'},
  {t:'cols', ratio:'c-7-5', left:[
    {t:'body', html:'Put $a_k=\\tfrac1N X(e^{jk\\omega_0})$ back into the synthesis equation, and write $\\tfrac1N$ as $\\tfrac{\\omega_0}{2\\pi}$:'},
    {t:'eq', tex:'\\tilde{x}[n]=\\sum_{k=\\langle N\\rangle}\\frac{1}{N}X(e^{jk\\omega_0})e^{jk\\omega_0 n}=\\frac{1}{2\\pi}\\sum_{k=\\langle N\\rangle}X(e^{jk\\omega_0})e^{jk\\omega_0 n}\\,\\omega_0'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'Read the right-hand side as a sum of rectangles: each term is a value of the function $X(e^{j\\omega})e^{j\\omega n}$ multiplied by the width $\\omega_0$. The $N$ terms of one period span an interval of length $N\\omega_0=2\\pi$.'},
      {t:'note', kind:'def', head:'Two limits at once', html:'As $N\\to\\infty$: the replication no longer disturbs the middle period, so $\\tilde{x}[n]\\to x[n]$; and the spacing $\\omega_0=2\\pi/N\\to0$, so the sum of rectangles becomes an integral over an interval of length $2\\pi$.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, size:'lg', tex:'x[n]=\\frac{1}{2\\pi}\\int_{2\\pi}X(e^{j\\omega})\\,e^{j\\omega n}\\,\\d\\omega',
        label:'Synthesis equation, discrete time',
        note:'The symbol $\\int_{2\\pi}$ means an integral over any interval of length $2\\pi$ — usually $-\\pi$ to $\\pi$, or $0$ to $2\\pi$. Which one is chosen makes no difference, and the next scene says why.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'Nothing was lost on the way', html:'The finite support was used once, to make the replication faithful. It is not part of the result: the analysis sum is written over all $n$ and applies to any sequence for which it converges.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:700,h:230,xr:[-PI,PI],yr:[-1.6,5.9],xlabel:'\\omega',pad:{l:52,r:26,t:30,b:38},
        xticksOverride:wTicks(-PI,PI,PI/2),xtickfmt:wPi,ytarget:3});
      const N=9, w0=2*PI/N;
      for(let k=-4;k<=4;k++){ const wc=k*w0, v=dirich(wc,2);
        a.rect(wc-w0/2, 0, wc+w0/2, v, {fill:'rgba(106,90,146,.20)', stroke:C.mid, width:1}); }
      a.curve(w=>dirich(w,2),{color:C.in,n:2400});
      return a.svg(); },
      caption:'One period at $N=9$. Each rectangle is one term of the sum: height $X(e^{jk\\omega_0})e^{jk\\omega_0n}$, width $\\omega_0$.'},
    {t:'reveal', at:1, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:700,h:230,xr:[-PI,PI],yr:[-1.6,5.9],xlabel:'\\omega',pad:{l:52,r:26,t:30,b:38},
          xticksOverride:wTicks(-PI,PI,PI/2),xtickfmt:wPi,ytarget:3});
        const N=32, w0=2*PI/N;
        for(let k=-16;k<=15;k++){ const wc=k*w0+w0/2, v=dirich(wc,2);
          a.rect(wc-w0/2, 0, wc+w0/2, v, {fill:'rgba(106,90,146,.20)', stroke:C.mid, width:0.6}); }
        a.curve(w=>dirich(w,2),{color:C.in,n:2400});
        return a.svg(); },
        caption:'The same period at $N=32$. The rectangles are narrower and there are more of them; their total is closer to the area under the curve.'}]}
  ]}
]},

/* ============================================================ the pair */
{ id:'m6-pair', module:'M6', nav:'The transform pair', title:'Analysis and synthesis, named the right way round', src:'p. 65',
  objective:'State the DTFT pair with the two names attached correctly and state the convergence condition.',
  keywords:'DTFT pair analysis synthesis equation naming convergence absolutely summable inverse transform', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · The pair', src:'p. 65'},
  {t:'title', text:'Two equations, two names, no room for a swap'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'eq', key:true, size:'lg', tex:'X(e^{j\\omega})=\\sum_{n=-\\infty}^{\\infty}x[n]\\,e^{-j\\omega n}',
      label:'Analysis equation — the discrete-time Fourier transform',
      note:'Analysis takes the sequence apart. It starts from $x[n]$ and produces the spectrum.'},
    {t:'eq', key:true, size:'lg', tex:'x[n]=\\frac{1}{2\\pi}\\int_{2\\pi}X(e^{j\\omega})\\,e^{j\\omega n}\\,\\d\\omega',
      label:'Synthesis equation — the inverse transform',
      note:'Synthesis builds the sequence back up. It starts from the spectrum and produces $x[n]$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'err', head:'The one confusion worth naming', html:'The forward sum is <b>analysis</b> and the integral is <b>synthesis</b>. The names go by what the equation does, never by which one is written first. Attaching them the other way round survives a whole page unnoticed, because both equations stay correct while everything said about them is wrong.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'When the sum converges', html:'A sufficient condition is that $x$ is <b>absolutely summable</b>:<br>$\\sum_{n=-\\infty}^{\\infty}|x[n]|<\\infty$. Then the analysis sum converges for every $\\omega$, and $X(e^{j\\omega})$ is a continuous function. Finite-energy sequences also have a transform, in a mean-square sense.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'Three things that are not in the continuous-time pair', html:'The factor $\\tfrac{1}{2\\pi}$ sits on the synthesis side. The integration range is one period, $\\int_{2\\pi}$, not $-\\infty$ to $\\infty$. And the left-hand side is written $X(e^{j\\omega})$, not $X(j\\omega)$, precisely to record that it is a function of $e^{j\\omega}$ and therefore repeats.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>P.blocks({w:820,h:250,items:[
      {t:'text',x:120,y:52,label:'\\text{sequence}',tex:true,fs:16,color:C.slate},
      {t:'box',x:40,y:70,w:160,h:64,label:'x[n]',tex:true,fs:19},
      {t:'text',x:700,y:52,label:'\\text{spectrum}',tex:true,fs:16,color:C.slate},
      {t:'box',x:620,y:70,w:160,h:64,label:'X(e^{j\\omega})',tex:true,fs:19},
      {t:'arrow',x1:210,y1:88,x2:610,y2:88,color:'#14707F',label:'\\text{analysis}',tex:true},
      {t:'line',d:'M610,120 L215,120',color:'#4A7A46'},
      {t:'line',d:'M215,120 l9,-4.5 v9 Z',color:'#4A7A46'},
      {t:'text',x:412,y:150,label:'\\text{synthesis}',tex:true,fs:15,color:'#4A7A46'},
      {t:'text',x:412,y:205,label:'\\text{one is a sum over }n,\\;\\text{the other an integral over }\\omega',tex:true,fs:14,color:C.muted}
    ]}), caption:'The direction of the arrow is the definition of the name.'},
    {t:'reveal', at:3, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:250,xr:[-3*PI,3*PI],yr:[-0.55,2.65],xlabel:'\\omega',ylabel:'|X(e^{j\\omega})|',
          pad:{l:58,r:28,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI),xtickfmt:piTick,ytarget:3});
        a.curve(w=>geoMag(w,0.5),{color:C.in,n:3000});
        markPeriod(a,2.22);
        return a.svg(); },
        caption:'Three periods of one spectrum. Everything outside the marked period is a copy, which is why one period is enough to rebuild the sequence.'}]}
  ]}
]},

/* ============================================================ periodicity */
{ id:'m6-periodic', module:'M6', nav:'Why the spectrum repeats', title:'Why $X(e^{j\\omega})$ repeats every $2\\pi$', src:'p. 65',
  objective:'Prove the 2pi-periodicity and contrast it with the continuous-time case.',
  keywords:'periodicity 2pi proof e^{-j2pi n}=1 integer contrast continuous time not periodic aliasing frequency', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · The central property', src:'p. 65'},
  {t:'title', text:'One line of algebra, and the whole module follows'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'eq', key:true, size:'lg', tex:'X(e^{j(\\omega+2\\pi)})=\\sum_{n}x[n]e^{-j(\\omega+2\\pi)n}=\\sum_{n}x[n]e^{-j\\omega n}\\underbrace{e^{-j2\\pi n}}_{=\\,1}=X(e^{j\\omega})',
      label:'2π-periodicity'},
    {t:'body', html:'The whole argument is the underbrace. The time index $n$ is an <b>integer</b>, so $e^{-j2\\pi n}=1$ for every term of the sum, and the extra factor disappears term by term.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'The continuous-time transform does not do this', html:'There the same step reads $\\int x(t)e^{-j\\omega t}e^{-j2\\pi t}\\d t$, and $t$ runs over the reals. $e^{-j2\\pi t}$ equals 1 only at integer $t$, so it cannot be taken out of the integral. Nothing forces $X(j\\omega)$ to repeat, and in general it does not.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'What frequency means in discrete time', html:'A sequence $e^{j\\omega n}$ is unchanged when $\\omega$ moves by $2\\pi$, because it is only ever sampled at integers. High frequency therefore means $\\omega$ near $\\pm\\pi$, not $\\omega$ large. The fastest sequence a discrete-time signal can carry is $e^{j\\pi n}=(-1)^{n}$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'Which period to draw', html:'Any interval of length $2\\pi$ holds all the information. This module draws more than one, every time, so that the repetition stays in view; a single period drawn on its own is the picture a student later mistakes for a spectrum that stops.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:260,xr:[-14,14],yr:[-1.45,1.45],xlabel:'n',ylabel:'\\operatorname{Re}\\{e^{j\\omega n}\\}',
        pad:{l:62,r:28,t:30,b:36},xtarget:8,ytarget:3});
      a.curve(t=>Math.cos(0.4*t),{color:C.in,width:1.1,dash:'3 5',opacity:.5});
      a.curve(t=>Math.cos((0.4+2*PI)*t),{color:C.err,width:1.1,dash:'3 5',opacity:.5});
      a.stem(D(n=>Math.cos(0.4*n),-14,14),{color:C.in});
      return a.svg(); },
      caption:'Two continuous curves, $\\omega=0.4$ and $\\omega=0.4+2\\pi$, and the one stem sequence they share. At the integers the two agree exactly, so no sequence can tell them apart.'},
    {t:'reveal', at:3, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:250,xr:[-3*PI,3*PI],yr:[-0.55,5.9],xlabel:'\\omega',ylabel:'X(e^{j\\omega})',
          pad:{l:56,r:28,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI),xtickfmt:piTick,ytarget:3});
        a.curve(w=>dirich(wrap(w),2),{color:C.in,n:4000});
        markPeriod(a,5.1);
        a.point(0.9,dirich(0.9,2)); a.point(0.9+2*PI,dirich(0.9,2)); a.point(0.9-2*PI,dirich(0.9,2));
        return a.svg(); },
        caption:'The three marked points are the same value of the spectrum, read at $\\omega$, $\\omega+2\\pi$ and $\\omega-2\\pi$.'}]}
  ]}
]},

/* ============================================================ shifted sample */
{ id:'m6-ex-shift', module:'M6', nav:'Worked example · shifted sample', title:'Worked example — a shifted unit sample', src:'p. 65',
  objective:'Transform a shifted unit sample and read the linear phase off the picture.',
  keywords:'worked example unit sample delta shifted transform linear phase sawtooth wrap magnitude one', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Worked example', src:'p. 65'},
  {t:'title', text:'A single sample, moved'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','$x[n]=\\delta[n-n_0]$, a unit sample at index $n_0$.'],
      ['Find','$X(e^{j\\omega})$, its magnitude and its phase.'],
      ['Method','Put the sequence into the analysis sum. Only one term survives.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'X(e^{j\\omega})=\\sum_{n=-\\infty}^{\\infty}\\delta[n-n_0]e^{-j\\omega n}=e^{-j\\omega n_0}',
        label:'Solution',
        note:'Every term with $n\\neq n_0$ carries a factor zero. The surviving term is the exponential at $n=n_0$.'}]},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Magnitude','$|X(e^{j\\omega})|=1$ at every frequency. A pure shift changes no amplitude.'],
        ['Phase','$\\angle X(e^{j\\omega})=-n_0\\omega$: a straight line through the origin with slope $-n_0$.'],
        ['Check','At $n_0=0$ the sequence is $\\delta[n]$ and the transform is the constant 1, which is what the sum gives directly.']
      ]}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'Where the periodicity shows', html:'A straight line is not periodic, and yet $X$ is. There is no contradiction: the transform is $e^{-j\\omega n_0}$, which does repeat. It is the <i>principal value</i> of the phase that is drawn, and it jumps by $2\\pi$ whenever the line leaves $(-\\pi,\\pi]$. The sawtooth below is that wrapping, and its period is $2\\pi/n_0$.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:190,xr:[-8,10],yr:[-0.25,1.35],xlabel:'n',ylabel:'x[n]',pad:{l:52,r:28,t:28,b:34},xtarget:8,ytarget:2});
      a.stem(D(n=>n===3?1:0,-8,10),{color:C.in,showZero:true});
      a.note(3.4,1.12,'n_0=3',{tex:true,color:C.in,fs:14});
      return a.svg(); },
      caption:'The sequence, with $n_0=3$.'},
    {t:'reveal', at:1, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:200,xr:[-3*PI,3*PI],yr:[-0.25,1.75],xlabel:'\\omega',ylabel:'|X(e^{j\\omega})|',
          pad:{l:58,r:28,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI),xtickfmt:piTick,ytarget:2});
        a.curve(()=>1,{color:C.in,n:800});
        markPeriod(a,1.32);
        return a.svg(); },
        caption:'The magnitude is 1 everywhere, drawn over three periods.'}]},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:250,xr:[-3*PI,3*PI],yr:[-4.9,6.0],xlabel:'\\omega',ylabel:'\\angle X(e^{j\\omega})\\;[\\text{rad}]',
          pad:{l:70,r:28,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI),xtickfmt:wPi,
          yticksOverride:[-PI,-PI/2,0,PI/2,PI],ytickfmt:v=>v.toFixed(2)});
        a.curve(w=>-3*w,{color:C.muted,width:1.2,dash:'4 5'});
        a.curve(w=>{const v=-3*w; return v-2*PI*Math.round(v/(2*PI));},{color:C.mid,n:6000});
        markPeriod(a,4.55);
        return a.svg(); },
        caption:'The unwrapped phase $-n_0\\omega$ is the dashed line; the principal value is the sawtooth. Both describe the same transform.'}]}
  ]}
]},

/* ============================================================ a^n u[n] */
{ id:'m6-ex-anun', module:'M6', nav:'Worked example · $a^{n}u[n]$', title:'Worked example — the one-sided exponential', src:'p. 66',
  objective:'Transform a^n u[n] and state the condition the geometric sum needs.',
  keywords:'worked example a^n u[n] geometric series convergence |a|<1 one sided exponential transform', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Worked example', src:'p. 66'},
  {t:'title', text:'The sequence every later example is built from'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','$x[n]=a^{n}u[n]$, with $|a|<1$.'],
      ['Find','$X(e^{j\\omega})$.'],
      ['Method','Put the sequence into the analysis sum, collect the exponentials into one ratio, and sum the geometric series.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'eq', size:'sm', tex:'X(e^{j\\omega})=\\sum_{n=0}^{\\infty}a^{n}e^{-j\\omega n}=\\sum_{n=0}^{\\infty}\\bigl(ae^{-j\\omega}\\bigr)^{n}',
        note:'The step $u[n]$ takes is to cut the lower limit from $-\\infty$ to $0$.'},
      {t:'eq', key:true, size:'lg', tex:'X(e^{j\\omega})=\\frac{1}{1-ae^{-j\\omega}},\\qquad |a|<1',
        label:'Solution'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Where $|a|<1$ is used, and where it is not', html:'This is an <b>infinite</b> geometric series, so the ratio must have modulus strictly below 1 for it to converge at all:<br>$|ae^{-j\\omega}|=|a|\\,|e^{-j\\omega}|=|a|<1$. Drop the condition and the sum has no value, whatever the closed form says. A <i>finite</i> geometric sum is a different matter and needs only ratio $\\neq1$; that case appears two scenes further on.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'Reading the answer', html:'Write the denominator as $1-a\\cos\\omega+ja\\sin\\omega$. As $\\omega$ runs over a period this traces a circle of radius $|a|$ centred at 1. The whole behaviour of the magnitude and the phase is the behaviour of $1/z$ on that circle, and the next scene reads both extremes straight off it.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:210,xr:[-6,16],yr:[-0.22,1.30],xlabel:'n',ylabel:'x[n]',pad:{l:52,r:28,t:28,b:34},xtarget:8,ytarget:3});
      a.stem(D(n=>n>=0?Math.pow(0.5,n):0,-6,16),{color:C.in,showZero:true});
      a.note(6.2,0.92,'a=\\tfrac12',{tex:true,color:C.in,fs:15});
      return a.svg(); },
      caption:'The sequence for $a=\\tfrac12$. It is one-sided and it decays, which is what makes it absolutely summable.'},
    {t:'reveal', at:3, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:300,xr:[-0.35,1.85],yr:[-0.85,0.85],xlabel:'\\operatorname{Re}',
          ylabel:'\\operatorname{Im}',pad:{l:60,r:30,t:30,b:40},xtarget:5,ytarget:3});
        const pts=[]; for(let i=0;i<=400;i++){const w=-PI+2*PI*i/400; pts.push([geoRe(w,0.5),geoIm(w,0.5)]);}
        a.poly(pts,{color:C.mid});
        a.poly([[0,0],[0.75,0.4330]],{color:C.coral,width:1.6,dash:'4 4'});
        a.point(0.5,0); a.point(1.5,0);
        a.note(0.30,0.60,'\\text{radius }|a|',{tex:true,color:C.mid,fs:13});
        a.note(1.22,0.58,'\\angle=\\arcsin a',{tex:true,color:C.coral,fs:13});
        return a.svg(); },
        caption:'The denominator, drawn in the complex plane over one period. The two marked points are $1-a$ and $1+a$; the dashed ray is the tangent, and the angle it makes is $\\arcsin a$.'}]}
  ]}
]},

{ id:'m6-ex-anun-b', module:'M6', nav:'$a^{n}u[n]$ · magnitude and phase', title:'Its magnitude and phase, with the extremes in closed form', src:'pp. 66–67',
  objective:'Derive the closed forms for the extremes of magnitude and phase and check them on the figures.',
  keywords:'magnitude phase extremes 1/(1-a) 1/(1+a) arcsin a closed form axis limits exact values', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Worked example', src:'pp. 66–67'},
  {t:'title', text:'Every extreme has a closed form, so print it'},
  {t:'cols', ratio:'c-5-7', left:[
    {t:'eq', tex:'|X(e^{j\\omega})|=\\frac{1}{\\sqrt{1-2a\\cos\\omega+a^{2}}},\\qquad \\angle X(e^{j\\omega})=-\\arctan\\!\\frac{a\\sin\\omega}{1-a\\cos\\omega}'},
    {t:'reveal', at:1, items:[
      {t:'wex', rows:[
        ['Magnitude, largest','At $\\omega=0$ the denominator is $1-a$, so $|X|_{\\max}=\\dfrac{1}{1-a}$.'],
        ['Magnitude, smallest','At $\\omega=\\pm\\pi$ the denominator is $1+a$, so $|X|_{\\min}=\\dfrac{1}{1+a}$.'],
        ['Phase, largest','The tangent from the origin to the circle of radius $a$ about 1 gives $\\max|\\angle X|=\\arcsin a$, reached where $\\cos\\omega=a$.'],
        ['If $a$ is negative','The two ends swap: the largest magnitude moves to $\\omega=\\pm\\pi$ and the smallest to $\\omega=0$. Written for either sign, $|X|_{\\max}=1/(1-|a|)$ and $|X|_{\\min}=1/(1+|a|)$, and $\\max|\\angle X|=\\arcsin|a|$.']
      ]}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'The numbers for two values of $a$', html:'$a=\\tfrac12$: $|X|$ between $\\tfrac23$ and $2$, and $\\max|\\angle X|=\\arcsin\\tfrac12=\\pi/6$ exactly, which is $0.5236$ rad — not $0.16\\pi$.<br>$a=\\tfrac18$: $|X|$ between $\\tfrac89$ and $\\tfrac87$, and $\\max|\\angle X|=\\arcsin\\tfrac18=0.1253$ rad.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'An axis limit is not a measurement', html:'When the extreme of a curve lands exactly on the frame of its box, the number printed beside it is the limit of the axis and not the value of the signal. Read $\\pi/6=0.16667\\pi$ off the closed form; truncating it to $0.16\\pi$ is $4\\%$ low, and no plot will show the difference.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:840,h:189,xr:[-3*PI,3*PI],yr:[-0.30,2.62],xlabel:'\\omega',ylabel:'|X(e^{j\\omega})|',
        pad:{l:66,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI),xtickfmt:piTick,
        yticksOverride:[2/3,2],ytickfmt:v=>v.toFixed(4)});
      a.curve(w=>geoMag(w,0.5),{color:C.in,n:3000});
      a.hline(2,{color:C.coral,opacity:.6}); a.hline(2/3,{color:C.coral,opacity:.6});
      markPeriod(a,2.24);
      return a.svg(); },
      caption:'Magnitude for $a=\\tfrac12$, over three periods. The two guide lines are $1/(1-a)=2$ and $1/(1+a)=2/3$, and the curve touches both.'},
    {t:'reveal', at:1, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:189,xr:[-3*PI,3*PI],yr:[-0.95,1.02],xlabel:'\\omega',ylabel:'\\angle X(e^{j\\omega})\\;[\\text{rad}]',
          pad:{l:74,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI),xtickfmt:wPi,
          yticksOverride:[-0.5236,0,0.5236],ytickfmt:v=>v.toFixed(4)});
        a.curve(w=>geoPh(w,0.5),{color:C.mid,n:3000});
        a.hline(0.5236,{color:C.coral,opacity:.6}); a.hline(-0.5236,{color:C.coral,opacity:.6});
        markPeriod(a,0.80);
        return a.svg(); },
        caption:'Phase for $a=\\tfrac12$. The guide lines are $\\pm\\arcsin\\tfrac12=\\pm0.5236$ rad, touched at $\\omega=\\mp\\pi/3$.'}]},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:180,xr:[-3*PI,3*PI],yr:[0.80,1.24],xlabel:'\\omega',ylabel:'|X(e^{j\\omega})|',
          pad:{l:66,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI),xtickfmt:piTick,
          yticksOverride:[8/9,1,8/7],ytickfmt:v=>v.toFixed(4)});
        a.curve(w=>geoMag(w,0.125),{color:C.in,n:3000});
        markPeriod(a,1.19);
        return a.svg(); },
        caption:'The same construction with $a=\\tfrac18$. The extremes are $8/7=1.1429$ and $8/9=0.8889$, and both are labelled rather than left on the frame.'}]}
  ]}
]},

/* ============================================================ a^{|n|} */
{ id:'m6-ex-absn', module:'M6', nav:'Worked example · $a^{|n|}$', title:'Worked example — the two-sided exponential', src:'p. 67',
  objective:'Transform a^{|n|} by splitting the sum and show the result is real and positive.',
  keywords:'two sided exponential a^{|n|} real spectrum positive even sequence extremes (1+a)/(1-a)', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Worked example', src:'p. 67'},
  {t:'title', text:'An even sequence has a real spectrum'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','$x[n]=a^{|n|}$, with $|a|<1$.'],
      ['Find','$X(e^{j\\omega})$, and its largest and smallest values.'],
      ['Method','Split the sum at $n=0$, sum each side as a geometric series, and add.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'eq', size:'sm', tex:'X(e^{j\\omega})=\\sum_{n=0}^{\\infty}a^{n}e^{-j\\omega n}+\\sum_{n=-\\infty}^{-1}a^{-n}e^{-j\\omega n}=\\frac{1}{1-ae^{-j\\omega}}+\\frac{ae^{j\\omega}}{1-ae^{j\\omega}}',
        note:'The second sum is the first one with $n$ replaced by $-n$, so it is the same series in $ae^{j\\omega}$ starting at $n=1$.'},
      {t:'eq', key:true, size:'lg', tex:'X(e^{j\\omega})=\\frac{1-a^{2}}{1-2a\\cos\\omega+a^{2}}',
        label:'Solution'}]},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Largest','At $\\omega=0$: $\\dfrac{1-a^{2}}{(1-a)^{2}}=\\dfrac{1+a}{1-a}$.'],
        ['Smallest','At $\\omega=\\pm\\pi$: $\\dfrac{1-a^{2}}{(1+a)^{2}}=\\dfrac{1-a}{1+a}$.'],
        ['Check','For $a=\\tfrac12$ these are $3$ and $\\tfrac13$; for $a=\\tfrac14$ they are $\\tfrac53=1.6667$ and $\\tfrac35=0.6$.']
      ]}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'Real, and here also positive', html:'The denominator is $|1-ae^{-j\\omega}|^{2}$, which is real and positive, and $1-a^{2}>0$ for $|a|<1$. So this spectrum is real <b>and</b> strictly positive, and $|X|=X$ with $\\angle X=0$ throughout. That is a property of this example, not of real spectra in general — the next scene is the counterexample.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:200,xr:[-10,10],yr:[-0.20,1.30],xlabel:'n',ylabel:'x[n]',pad:{l:52,r:28,t:28,b:34},xtarget:8,ytarget:3});
      a.stem(D(n=>Math.pow(0.5,Math.abs(n)),-10,10),{color:C.in,showZero:true});
      return a.svg(); },
      caption:'The sequence for $a=\\tfrac12$: even about $n=0$.'},
    {t:'reveal', at:1, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:250,xr:[-3*PI,3*PI],yr:[-0.40,3.75],xlabel:'\\omega',ylabel:'X(e^{j\\omega})',
          pad:{l:60,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI),xtickfmt:piTick,
          yticksOverride:[1/3,1,3],ytickfmt:v=>v.toFixed(4)});
        a.curve(w=>twoSide(w,0.5),{color:C.in,n:3000});
        markPeriod(a,3.24);
        return a.svg(); },
        caption:'The spectrum for $a=\\tfrac12$, over three periods. It runs between $\\tfrac13$ and $3$ and never reaches zero.'}]},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:230,xr:[-3*PI,3*PI],yr:[-0.22,2.06],xlabel:'\\omega',ylabel:'X(e^{j\\omega})',
          pad:{l:60,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI),xtickfmt:piTick,
          yticksOverride:[0.6,1,5/3],ytickfmt:v=>v.toFixed(4)});
        a.curve(w=>twoSide(w,0.25),{color:C.in,n:3000});
        markPeriod(a,1.83);
        return a.svg(); },
        caption:'The same spectrum for $a=\\tfrac14$, between $0.6$ and $1.6667$. Both extremes are labelled on the axis, not left sitting on the frame.'}]}
  ]}
]},

/* ============================================================ rectangular pulse */
{ id:'m6-ex-rect', module:'M6', nav:'Worked example · rectangular pulse', title:'Worked example — the rectangular pulse', src:'p. 67',
  objective:'Sum the finite geometric series correctly and obtain the Dirichlet kernel.',
  keywords:'rectangular pulse dirichlet kernel finite geometric sum r not 1 indeterminate 2N1+1 sine ratio', steps:2, blocks:[
  {t:'eyebrow', text:'Module 6 · Worked example', src:'p. 67'},
  {t:'title', text:'A finite sum, and the one value it cannot take'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','$x[n]=1$ for $-N_1\\le n\\le N_1$, and $x[n]=0$ elsewhere.'],
      ['Find','$X(e^{j\\omega})$ in closed form, and its value at $\\omega=0$.'],
      ['Method','Sum the finite geometric series, then balance the exponents so that both ends become sines.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'The condition a finite sum needs', html:'$\\displaystyle\\sum_{n=p}^{q}r^{\\,n}=\\frac{r^{p}-r^{\\,q+1}}{1-r}$ requires $r\\neq1$, and nothing else. There are finitely many terms, so nothing has to converge; the division at the end is the only step that can fail. Here $r=e^{-j\\omega}$ has $|r|=1$ exactly, so a condition $|r|<1$ would exclude the sum altogether, while $|r|\\le1$ would admit the one value that breaks it.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', size:'sm', tex:'X(e^{j\\omega})=\\sum_{n=-N_1}^{N_1}e^{-j\\omega n}=\\frac{e^{j\\omega N_1}-e^{-j\\omega(N_1+1)}}{1-e^{-j\\omega}}',
        note:'Multiply numerator and denominator by $e^{j\\omega/2}$. The numerator becomes $e^{j\\omega(N_1+\\frac12)}-e^{-j\\omega(N_1+\\frac12)}=2j\\sin\\bigl(\\omega(N_1+\\tfrac12)\\bigr)$ and the denominator $e^{j\\omega/2}-e^{-j\\omega/2}=2j\\sin(\\omega/2)$. The <b>minus</b> in each bracket is what turns the pair into a sine; a plus would give a cosine and a different function altogether.'},
      {t:'eq', key:true, size:'lg', tex:'X(e^{j\\omega})=\\frac{\\sin\\bigl(\\omega(N_1+\\frac12)\\bigr)}{\\sin(\\omega/2)}',
        label:'Solution — the Dirichlet kernel'}]},
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:190,xr:[-9,9],yr:[-0.22,1.35],xlabel:'n',ylabel:'x[n]',pad:{l:52,r:28,t:28,b:34},xtarget:8,ytarget:2});
      a.stem(D(n=>Math.abs(n)<=2?1:0,-9,9),{color:C.in,showZero:true});
      a.span(-2,2,1.12,'2N_1+1=5',{tex:true,color:C.slate,fs:13});
      return a.svg(); },
      caption:'The pulse for $N_1=2$: five samples of height 1.'},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:260,xr:[-3*PI,3*PI],yr:[-2.4,6.6],xlabel:'\\omega',ylabel:'X(e^{j\\omega})',
          pad:{l:56,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI),xtickfmt:piTick,
          yticksOverride:[-1.25,0,2.5,5],ytickfmt:v=>v.toFixed(4)});
        a.curve(w=>dirich(wrap(w),2),{color:C.in,n:5000});
        markPeriod(a,5.72);
        return a.svg(); },
        caption:'The Dirichlet kernel for $N_1=2$, over three periods. Peak $2N_1+1=5$, least value $-1.2500$.'}]}
  ]}
]},

{ id:'m6-ex-rect-b', module:'M6', nav:'Rectangular pulse · reading it', title:'Reading the Dirichlet kernel', src:'p. 67',
  objective:'Handle the excluded points, and compare two pulse widths.',
  keywords:'dirichlet kernel excluded points 2N1+1 limit not a sinc width narrower main lobe expansion compression', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Worked example', src:'p. 67'},
  {t:'title', text:'Where the closed form fails, and what it looks like'},
  {t:'cols', ratio:'c-5-7', left:[
    {t:'wex', rows:[
      ['Excluded points','$r=e^{-j\\omega}=1$ at $\\omega=0,\\pm2\\pi,\\pm4\\pi,\\dots$, and those are exactly where $\\sin(\\omega/2)=0$ as well.'],
      ['Value there','Go back to the sum: every term is 1, so $X=2N_1+1$. The same number comes out of the closed form as a limit, since $\\sin(\\omega(N_1+\\frac12))/\\sin(\\omega/2)\\to(2N_1+1)$ as $\\omega\\to0$.'],
      ['Check','For $N_1=2$: $X(e^{j0})=5$. For $N_1=4$: $X(e^{j0})=9$.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'Not a sinc', html:'The denominator is $\\sin(\\omega/2)$, not $\\omega/2$. That is what makes the function periodic: the ratio of two sines repeats, while a sine over a straight line decays. Calling this a sinc loses the one property the whole module is about.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Wider in time, narrower in frequency', html:'Doubling the width of the pulse doubles the peak, from $5$ to $9$, and halves the width of the main lobe. The zero crossings of the kernel sit at $\\omega=2\\pi k/(2N_1+1)$, so they crowd together as $N_1$ grows. The period never moves: it is $2\\pi$ for both.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'The least value moves too', html:'The deepest negative lobe is $-1.2500$ for $N_1=2$ and $-2.0391$ for $N_1=4$. Both are values of a real function, and neither is a magnitude — which is what the next scene is about.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:840,h:230,xr:[-3*PI,3*PI],yr:[-2.4,6.6],xlabel:'\\omega',ylabel:'X(e^{j\\omega})',
        pad:{l:56,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI),xtickfmt:piTick,
        yticksOverride:[-1.25,0,2.5,5],ytickfmt:v=>v.toFixed(4)});
      a.curve(w=>dirich(wrap(w),2),{color:C.in,n:5000});
      markPeriod(a,5.72);
      return a.svg(); },
      caption:'$N_1=2$: peak $5$, least value $-1.2500$.'},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:230,xr:[-3*PI,3*PI],yr:[-3.9,11.7],xlabel:'\\omega',ylabel:'X(e^{j\\omega})',
          pad:{l:58,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI),xtickfmt:piTick,
          yticksOverride:[-2.0391,0,4.5,9],ytickfmt:v=>v.toFixed(4)});
        a.curve(w=>dirich(wrap(w),4),{color:C.h,n:6000});
        markPeriod(a,10.2);
        return a.svg(); },
        caption:'$N_1=4$: peak $9$, least value $-2.0391$, and a main lobe half as wide.'}]}
  ]}
]},

/* ============================================================ real vs zero phase */
{ id:'m6-real-phase', module:'M6', nav:'Real is not zero-phase', title:'A real spectrum does not have zero phase', src:'p. 67',
  objective:'Separate real from non-negative and give the phase of a sign-changing real spectrum.',
  keywords:'real spectrum phase zero or pi misconception magnitude absolute value dirichlet negative sign change', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · A distinction worth the scene', src:'p. 67'},
  {t:'title', text:'Real means the phase is $0$ or $\\pi$'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'note', kind:'err', head:'The claim to reject', html:'“$X(e^{j\\omega})$ is real, therefore $|X(e^{j\\omega})|=X(e^{j\\omega})$ and $\\angle X(e^{j\\omega})=0$.” The first half of the sentence is a hypothesis about the imaginary part. The conclusion is about the <b>sign</b>, and nothing in the hypothesis fixes it.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'X\\text{ real}\\;\\Longrightarrow\\;|X|=|X|,\\qquad \\angle X=\\begin{cases}0,&X>0\\\\ \\pi,&X<0\\end{cases}',
        label:'What realness actually gives',
        note:'$|X|=X$ needs the extra hypothesis $X\\ge0$. A real number that is negative has modulus $-X$ and angle $\\pi$.'}]},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Counterexample','The Dirichlet kernel of the previous scene. It is real at every $\\omega$, and it is negative on part of every period.'],
        ['Numbers','$N_1=2$: peak $5$, least value $-1.2500$. $N_1=4$: peak $9$, least value $-2.0391$.'],
        ['Contrast','The two-sided exponential $a^{|n|}$ has $X=(1-a^{2})/(1-2a\\cos\\omega+a^{2})$, which is real <i>and</i> strictly positive. There $|X|=X$ and $\\angle X=0$ really do hold — because of positivity, not because of realness.']
      ]}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'How to say it in one line', html:'A real spectrum has an <b>even</b> magnitude and a phase that takes only the values $0$ and $\\pi$. The phase is still odd, since $0=-0$ and $\\pi$ and $-\\pi$ are the same angle.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:840,h:220,xr:[-3*PI,3*PI],yr:[-2.4,6.4],xlabel:'\\omega',ylabel:'X(e^{j\\omega})',
        pad:{l:58,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI),xtickfmt:piTick,
        yticksOverride:[-1.25,0,2.5,5],ytickfmt:v=>v.toFixed(4)});
      a.curve(w=>dirich(wrap(w),2),{color:C.in,n:5000});
      a.hline(0,{color:C.err,opacity:.7});
      markPeriod(a,5.55);
      return a.svg(); },
      caption:'The spectrum itself. Below the zero line it is negative, and that happens inside every period.'},
    {t:'reveal', at:1, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:200,xr:[-3*PI,3*PI],yr:[-0.55,6.4],xlabel:'\\omega',ylabel:'|X(e^{j\\omega})|',
          pad:{l:60,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI),xtickfmt:piTick,
          yticksOverride:[0,1.25,2.5,5],ytickfmt:v=>v.toFixed(4)});
        a.curve(w=>Math.abs(dirich(wrap(w),2)),{color:C.h,n:5000});
        markPeriod(a,5.6);
        return a.svg(); },
        caption:'Its magnitude. The lobes that were below the axis have been folded up, so the two pictures differ wherever the spectrum was negative.'}]},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:200,xr:[-3*PI,3*PI],yr:[-0.75,4.3],xlabel:'\\omega',ylabel:'\\angle X(e^{j\\omega})\\;[\\text{rad}]',
          pad:{l:74,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI),xtickfmt:piTick,
          yticksOverride:[0,PI],ytickfmt:v=>v.toFixed(4)});
        a.curve(w=>dirich(wrap(w),2)>=0?0:PI,{color:C.mid,n:6000});
        markPeriod(a,3.72);
        return a.svg(); },
        caption:'And its phase: zero where the spectrum is positive, $\\pi$ where it is negative. Never anything else, and never zero throughout.'}]}
  ]}
]},

/* ============================================================ ideal low-pass */
{ id:'m6-ex-lpf', module:'M6', nav:'Worked example · ideal low-pass', title:'Worked example — inverting an ideal low-pass spectrum', src:'p. 68',
  objective:'Invert the ideal discrete-time low-pass spectrum and state the sinc convention.',
  keywords:'ideal low pass inverse transform sin(Wn)/(pi n) sinc unnormalised convention W/pi cutoff', steps:4, blocks:[
  {t:'eyebrow', text:'Module 6 · Worked example', src:'p. 68'},
  {t:'title', text:'Going the other way, from spectrum to sequence'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','$X(e^{j\\omega})=1$ for $|\\omega|\\le W$ and $0$ for $W<|\\omega|\\le\\pi$, repeated with period $2\\pi$.'],
      ['Find','$x[n]$.'],
      ['Method','Integrate over the period $-\\pi\\le\\omega\\le\\pi$, where the spectrum is 1 on a single band.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'eq', size:'sm', tex:'x[n]=\\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi}X(e^{j\\omega})e^{j\\omega n}\\,\\d\\omega=\\frac{1}{2\\pi}\\int_{-W}^{W}e^{j\\omega n}\\,\\d\\omega=\\frac{1}{2\\pi}\\,\\frac{e^{j W n}-e^{-j W n}}{jn}'},
      {t:'eq', key:true, size:'lg', tex:'x[n]=\\frac{\\sin(Wn)}{\\pi n},\\qquad x[0]=\\frac{W}{\\pi}',
        label:'Solution',
        note:'At $n=0$ the integrand is 1 and the integral is $2W$, giving $x[0]=W/\\pi$. That is the value the ratio approaches as $n\\to0$, so the two agree.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'The sinc convention used here', html:'This course uses the <b>unnormalised</b> sinc,<br>$\\operatorname{sinc}\\theta=\\dfrac{\\sin\\theta}{\\theta}$. With it, and with no $\\pi$ inside the argument,<br>$x[n]=\\dfrac{W}{\\pi}\\operatorname{sinc}(Wn)$, which is the same sequence written a second way. The convention is restated at every later point of use, because the other common definition puts a $\\pi$ inside the argument and moves every zero crossing.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'A prefactor that is easy to lose', html:'The prefactor is $W/\\pi$, a constant. Writing $W/n$ instead makes the expression depend on $n$ twice and is wrong at every index: for $W=\\pi/4$ the true $x[1]=0.225079$, while $(W/n)\\operatorname{sinc}(Wn/\\pi)$ gives $0.707107$ — larger by a factor $\\pi$. The fastest check is $x[0]$, which must equal the fraction $W/\\pi$ of the band that is passed.'}]},
    {t:'reveal', at:4, items:[
      {t:'note', kind:'ok', head:'Two readings of the same picture', html:'A narrow band in frequency gives a slowly decaying sequence in time, and a wide band gives a fast one. At $W=\\pi$ the band is the whole period, $x[n]=\\delta[n]$, and the sequence is as short as it can be.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:840,h:210,xr:[-3*PI,3*PI],yr:[-0.30,1.72],xlabel:'\\omega',ylabel:'X(e^{j\\omega})',
        pad:{l:58,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI/2),xtickfmt:piTick,ytarget:2});
      a.curve(w=>lpf(w,PI/4),{color:C.in,n:8000});
      markPeriod(a,1.30);
      a.note(-8.5,1.36,'W=\\pi/4',{tex:true,color:C.in,fs:14});
      return a.svg(); },
      caption:'The spectrum for $W=\\pi/4$, drawn over three periods. The band repeats; it does not stop at $\\pm\\pi$.'},
    {t:'reveal', at:1, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:210,xr:[-18,18],yr:[-0.10,0.34],xlabel:'n',ylabel:'x[n]',
          pad:{l:60,r:30,t:30,b:34},xtarget:8,yticksOverride:[0,0.1,0.25],ytickfmt:v=>v.toFixed(4)});
        a.stem(D(n=>lpfInv(n,PI/4),-18,18),{color:C.out,showZero:true});
        a.curve(t=>lpfInv(t===0?1e-9:t,PI/4),{color:C.out,width:1,dash:'3 5',opacity:.45,n:2000});
        return a.svg(); },
        caption:'Its inverse transform for $W=\\pi/4$: $x[0]=0.25$, $x[1]=0.225079$, $x[2]=0.159155$, $x[3]=0.075026$.'}]},
    {t:'reveal', at:4, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:210,xr:[-18,18],yr:[-0.20,0.66],xlabel:'n',ylabel:'x[n]',
          pad:{l:60,r:30,t:30,b:34},xtarget:8,yticksOverride:[-0.106103,0,0.31831,0.5],ytickfmt:v=>v.toFixed(4)});
        a.stem(D(n=>lpfInv(n,PI/2),-18,18),{color:C.h,showZero:true});
        return a.svg(); },
        caption:'The same construction with $W=\\pi/2$: $x[0]=0.5$, $x[1]=0.318310$, $x[2]=0$, $x[3]=-0.106103$. Twice the band, half the width in time.'}]}
  ]}
]},

/* ============================================================ complex exponential */
{ id:'m6-cexp', module:'M6', nav:'Transform of a complex exponential', title:'The transform of $e^{j\\omega_0 n}$', src:'p. 68',
  objective:'State and prove the impulse-train transform of a discrete-time complex exponential.',
  keywords:'complex exponential impulse train 2pi delta transform periodic copies sifting weight height', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Periodic sequences', src:'p. 68'},
  {t:'title', text:'One frequency, and all its copies'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:'A complex exponential is not absolutely summable, so the analysis sum does not converge in the ordinary sense. The transform exists as a train of impulses, and it is defined by the synthesis equation working correctly.'},
    {t:'eq', key:true, size:'lg', tex:'e^{j\\omega_0 n}\\;\\longleftrightarrow\\;X(e^{j\\omega})=\\sum_{k=-\\infty}^{\\infty}2\\pi\\,\\delta(\\omega-\\omega_0-2\\pi k)',
      label:'Transform pair'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'Proof by substitution into the synthesis equation. Integrate over the period that contains $\\omega_0$; exactly one impulse of the train lies in it, and the sifting property does the rest:'},
      {t:'eq', size:'sm', tex:'\\frac{1}{2\\pi}\\int_{2\\pi}\\Bigl[\\sum_{k}2\\pi\\delta(\\omega-\\omega_0-2\\pi k)\\Bigr]e^{j\\omega n}\\,\\d\\omega=\\frac{1}{2\\pi}\\cdot2\\pi\\,e^{j\\omega_0 n}=e^{j\\omega_0 n}'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Why the copies must be there', html:'$X$ has to be $2\\pi$-periodic, and a single impulse at $\\omega_0$ is not. The train is the smallest $2\\pi$-periodic object that puts an impulse at $\\omega_0$. It is also the correct answer for a second reason: $e^{j(\\omega_0+2\\pi)n}=e^{j\\omega_0n}$, so a sequence cannot distinguish $\\omega_0$ from $\\omega_0+2\\pi$, and neither may its spectrum.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'Weight, not height', html:'An impulse has no value at a point; it has a <b>weight</b>, the number that comes out when it is integrated. Every figure in this module draws an impulse as an arrow whose height <i>is</i> its weight, so the two can be read off the same axis. An arrow drawn to a fixed height with the weight written beside it hides exactly the comparison these pictures are for.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:840,h:250,xr:[-3*PI,3*PI],yr:[-1.4,9.4],xlabel:'\\omega',ylabel:'X(e^{j\\omega})',
        pad:{l:64,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI),xtickfmt:piTick,
        yticksOverride:[0,2*PI],ytickfmt:piTick});
      for(let k=-2;k<=2;k++){ const w=PI/4+2*PI*k;
        if(w>=-3*PI && w<=3*PI) a.impulse(w,2*PI,{color:C.in,label:false}); }
      markPeriod(a,7.9);
      return a.svg(); },
      caption:'The transform of $e^{j\\omega_0 n}$ with $\\omega_0=\\pi/4$. The impulses sit at $\\pi/4$, $\\pi/4\\pm2\\pi$, $\\pi/4\\pm4\\pi$, and each carries weight $2\\pi$ — which is the height of the arrow.'},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:250,xr:[-3*PI,3*PI],yr:[-1.4,9.4],xlabel:'\\omega',ylabel:'X(e^{j\\omega})',
          pad:{l:64,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI/2),xtickfmt:piTick,
          yticksOverride:[0,2*PI],ytickfmt:piTick});
        for(let k=-2;k<=2;k++){ const w=PI/2+2*PI*k;
          if(w>=-3*PI && w<=3*PI) a.impulse(w,2*PI,{color:C.h,label:false}); }
        markPeriod(a,7.9);
        return a.svg(); },
        caption:'The same picture for $\\omega_0=\\pi/2$: impulses at $\\pi/2$, $-3\\pi/2$, $5\\pi/2$, and so on. Moving $\\omega_0$ slides the whole train.'}]}
  ]}
]},

/* ============================================================ periodic sequences */
{ id:'m6-dt-periodic', module:'M6', nav:'Transform of a periodic sequence', title:'A periodic sequence has an impulse spectrum', src:'pp. 68–69',
  objective:'Turn a discrete-time Fourier series into a train of impulses and specialise to cosine and sine.',
  keywords:'periodic sequence impulse spectrum 2pi a_k delta cosine sine transform harmonics N impulses', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Periodic sequences', src:'pp. 68–69'},
  {t:'title', text:'One impulse for every harmonic'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:'Let $x[n]$ be periodic with period $N$, and let $a_k$ be its Fourier series coefficients. Write the series and transform it term by term, using the pair of the previous scene on each $e^{jk(2\\pi/N)n}$:'},
    {t:'eq', key:true, size:'lg', tex:'x[n]=\\sum_{k=\\langle N\\rangle}a_k e^{jk\\frac{2\\pi}{N}n}\\;\\longleftrightarrow\\;X(e^{j\\omega})=\\sum_{k=-\\infty}^{\\infty}2\\pi a_k\\,\\delta\\!\\left(\\omega-\\frac{2\\pi k}{N}\\right)',
      label:'Transform of a periodic sequence',
      note:'The sum on the left runs over one period of $k$; the sum on the right runs over all $k$, with $a_k$ extended periodically, $a_{k+N}=a_k$. That is how the spectrum comes out $2\\pi$-periodic.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'How many impulses in one period', html:'The spacing is $2\\pi/N$, so an interval of length $2\\pi$ holds exactly $N$ impulses. A short period in time gives few, widely spaced impulses; a long period gives many, closely spaced ones.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'\\cos\\omega_0 n\\;\\longleftrightarrow\\;\\pi\\sum_{k=-\\infty}^{\\infty}\\bigl[\\delta(\\omega-\\omega_0-2\\pi k)+\\delta(\\omega+\\omega_0-2\\pi k)\\bigr]', label:'Cosine'},
      {t:'eq', tex:'\\sin\\omega_0 n\\;\\longleftrightarrow\\;\\frac{\\pi}{j}\\sum_{k=-\\infty}^{\\infty}\\bigl[\\delta(\\omega-\\omega_0-2\\pi k)-\\delta(\\omega+\\omega_0-2\\pi k)\\bigr]', label:'Sine'},
      {t:'small', html:'Both follow from $\\cos\\theta=\\tfrac12(e^{j\\theta}+e^{-j\\theta})$ and $\\sin\\theta=\\tfrac{1}{2j}(e^{j\\theta}-e^{-j\\theta})$: each exponential brings its own train of weight $2\\pi$, and the prefactor $\\tfrac12$ or $\\tfrac{1}{2j}$ turns it into $\\pi$ or $\\pi/j$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'Both signs of frequency, always', html:'A real sequence always produces the pair at $+\\omega_0$ and $-\\omega_0$. Dropping the negative one halves the signal: the synthesis integral then rebuilds $\\tfrac12 e^{j\\omega_0n}$, which is complex, not $\\cos\\omega_0 n$.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:840,h:172,xr:[-16,16],yr:[-1.45,1.45],xlabel:'n',ylabel:'x[n]',pad:{l:52,r:30,t:28,b:34},xtarget:8,ytarget:3});
      a.stem(D(n=>Math.cos(PI*n/4),-16,16),{color:C.in,showZero:true});
      return a.svg(); },
      caption:'$x[n]=\\cos(\\pi n/4)$, a periodic sequence with $N=8$.'},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:215,xr:[-3*PI,3*PI],yr:[-0.75,4.85],xlabel:'\\omega',ylabel:'X(e^{j\\omega})',
          pad:{l:64,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI/4),
          xtickfmt:v=>Math.abs(v/PI-Math.round(v/PI))<1e-9?piTick(v):'',
          yticksOverride:[0,PI],ytickfmt:piTick});
        for(let k=-2;k<=2;k++){
          for(const s of [1,-1]){ const w=s*PI/4+2*PI*k;
            if(w>=-3*PI && w<=3*PI) a.impulse(w,PI,{color:C.in,label:false}); } }
        markPeriod(a,4.06);
        return a.svg(); },
        caption:'Its spectrum. Each impulse has weight $\\pi$, and one period holds $N=8$ of them — here the pair at $\\pm\\pi/4$ and the six others that the period contains.'}]},
    {t:'reveal', at:3, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:198,xr:[-3*PI,3*PI],yr:[-4.6,4.85],xlabel:'\\omega',ylabel:'\\operatorname{Im}\\{X(e^{j\\omega})\\}',
          pad:{l:78,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI/4),
          xtickfmt:v=>Math.abs(v/PI-Math.round(v/PI))<1e-9?piTick(v):'',
          yticksOverride:[-PI,0,PI],ytickfmt:piTick});
        for(let k=-2;k<=2;k++){
          for(const s of [1,-1]){ const w=s*PI/4+2*PI*k;
            if(w>=-3*PI && w<=3*PI) a.impulse(w,-s*PI,{color:C.mid,label:false}); } }
        markPeriod(a,4.06);
        return a.svg(); },
        caption:'For $\\sin(\\pi n/4)$ the weights are $\\pi/j=-j\\pi$ and $-\\pi/j=+j\\pi$, so the spectrum is purely imaginary and odd. The arrows show the imaginary part.'}]}
  ]}
]},

/* ============================================================ square wave */
{ id:'m6-sqwave', module:'M6', nav:'Periodic square wave', title:'The periodic square wave, weight by weight', src:'p. 69',
  objective:'Compute the square-wave coefficients and draw the impulse weights unequally and with their signs.',
  keywords:'periodic square wave coefficients unequal weights negative sign N=10 20 30 envelope dirichlet', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Periodic sequences', src:'p. 69'},
  {t:'title', text:'Impulses of different sizes, and some of them negative'},
  {t:'cols', ratio:'c-5-7', left:[
    {t:'body', html:'Take the periodic square wave: $x[n]=1$ for $|n|\\le N_1$ inside each period of length $N$, and $0$ over the rest of the period. Its Fourier series coefficients are the Dirichlet kernel again, sampled and divided by $N$:'},
    {t:'eq', key:true, tex:'a_k=\\frac{1}{N}\\,\\frac{\\sin\\bigl(\\frac{2\\pi k}{N}(N_1+\\frac12)\\bigr)}{\\sin(\\pi k/N)},\\qquad a_k=\\frac{2N_1+1}{N}\\ \\text{ when }k\\equiv0\\ (\\mathrm{mod}\\ N)'},
    {t:'reveal', at:1, items:[
      {t:'wex', rows:[
        ['Numbers, $N_1=2$','$N=10$: $a_0=0.5000$, $a_1=0.3236$. $N=20$: $a_0=0.2500$, $a_1=0.2260$. $N=30$: $a_0=0.1667$, $a_1=0.1594$.'],
        ['A negative one','$N=10$, $k=3$: $a_3=-0.1236$. The coefficient is negative, and the impulse of weight $2\\pi a_3$ points downwards.'],
        ['Reading','As $N$ grows the coefficients shrink like $1/N$ while the shape they trace stays put. That shape is the envelope, and it is the transform of the single pulse.']
      ]}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Draw the weights as they are', html:'Sketching the impulses all the same length hides both facts that matter here: the weights differ from one harmonic to the next, and some of them are negative. An impulse spectrum drawn with equal arrows is a picture of the frequencies present, not of the signal.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'The transform of the periodic wave', html:'Putting the coefficients into the previous scene gives<br>$X(e^{j\\omega})=\\sum_k 2\\pi a_k\\,\\delta(\\omega-2\\pi k/N)$: $N$ impulses per period, weights $2\\pi a_k$, spacing $2\\pi/N$.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:840,h:148,xr:[-16,16],yr:[-0.25,1.42],xlabel:'n',ylabel:'x[n]',pad:{l:52,r:30,t:28,b:34},xtarget:8,ytarget:2});
      a.stem(D(n=>{const m=n-10*Math.round(n/10); return Math.abs(m)<=2?1:0;},-16,16),{color:C.in,showZero:true});
      a.span(0,10,1.18,'N=10',{tex:true,color:C.slate,fs:13});
      return a.svg(); },
      caption:'The periodic square wave with $N=10$ and $N_1=2$.'},
    {t:'reveal', at:1, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:213,xr:[-3*PI,3*PI],yr:[-1.55,4.35],xlabel:'\\omega',ylabel:'X(e^{j\\omega})',
          pad:{l:64,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI),xtickfmt:piTick,
          yticksOverride:[-2*PI*0.123607,0,2*PI*0.5],ytickfmt:v=>v.toFixed(3)});
        a.curve(w=>2*PI*dirich(wrap(w),2)/10,{color:C.muted,width:1.3,dash:'4 5',n:4000});
        for(let k=-15;k<=15;k++){ const w=2*PI*k/10;
          if(w>=-3*PI && w<=3*PI){ const v=2*PI*dtRect(k,10,2);
            if(Math.abs(v)>1e-9) a.impulse(w,v,{color:v>=0?C.in:C.err,label:false}); } }
        markPeriod(a,3.62);
        return a.svg(); },
        caption:'Its spectrum over three periods. The dashed line is the envelope $\\tfrac{2\\pi}{N}\\sin(\\omega(N_1+\\frac12))/\\sin(\\omega/2)$; the red arrows are the harmonics whose weight is negative.'}]},
    {t:'reveal', at:3, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:189,xr:[-3*PI,3*PI],yr:[-0.80,2.20],xlabel:'\\omega',ylabel:'X(e^{j\\omega})',
          pad:{l:64,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI),xtickfmt:piTick,ytarget:3});
        a.curve(w=>2*PI*dirich(wrap(w),2)/30,{color:C.muted,width:1.3,dash:'4 5',n:4000});
        for(let k=-45;k<=45;k++){ const w=2*PI*k/30;
          if(w>=-3*PI && w<=3*PI){ const v=2*PI*dtRect(k,30,2);
            if(Math.abs(v)>1e-9) a.impulse(w,v,{color:v>=0?C.in:C.err,label:false,width:1.4}); } }
        markPeriod(a,1.84);
        return a.svg(); },
        caption:'The same wave with $N=30$: three times as many impulses per period, each a third the size, tracing the same envelope.'}]}
  ]}
]},

/* ============================================================ impulse train */
{ id:'m6-ex-imptrain', module:'M6', nav:'Worked example · impulse train', title:'Worked example — the discrete-time impulse train', src:'p. 70',
  objective:'Transform the impulse train and keep the summation index distinct from the free variable.',
  keywords:'impulse train delta[n-kN] coefficients 1/N transform 2pi/N index clash summation variable', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Worked example', src:'p. 70'},
  {t:'title', text:'A train in time gives a train in frequency'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','$x[n]=\\displaystyle\\sum_{k=-\\infty}^{\\infty}\\delta[n-kN]$: a unit sample every $N$ indices.'],
      ['Find','The Fourier series coefficients and the transform.'],
      ['Method','Take one period, use the analysis equation of the series, then apply the impulse-spectrum result.']
    ]},
    {t:'note', kind:'warn', head:'One letter per job', html:'The free variable of the sequence is $n$; the index that runs over the copies is $k$. Writing the summation index as $n$ as well makes the left and right sides of the definition share a symbol that means two different things, and every later step has to guess which is which.'},
    {t:'reveal', at:1, items:[
      {t:'eq', size:'sm', tex:'a_k=\\frac{1}{N}\\sum_{n=\\langle N\\rangle}x[n]e^{-jk\\frac{2\\pi}{N}n}=\\frac{1}{N}\\,e^{-jk\\frac{2\\pi}{N}\\cdot 0}=\\frac{1}{N}',
        note:'Take the period $-\\lfloor N/2\\rfloor\\le n\\le\\dots$ that contains $n=0$. Exactly one sample of the train is in it, at $n=0$, and the sifting reduces the sum to a single term.'},
      {t:'eq', key:true, size:'lg', tex:'X(e^{j\\omega})=\\frac{2\\pi}{N}\\sum_{k=-\\infty}^{\\infty}\\delta\\!\\left(\\omega-\\frac{2\\pi k}{N}\\right)',
        label:'Solution'}]},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Weights','Every impulse carries the same weight $2\\pi/N$: $2\\pi/5=1.2566$ for $N=5$, $2\\pi/10=0.6283$ for $N=10$, $2\\pi/15=0.4189$ for $N=15$.'],
        ['Spacing','The impulses are $2\\pi/N$ apart, so one period holds $N$ of them.'],
        ['Trade','A sparser train in time is a denser train in frequency, and each of its impulses is smaller. One period always holds $N$ impulses of weight $2\\pi/N$, so their weights add to $2\\pi$ whatever $N$ is.']
      ]}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'A check that costs nothing', html:'The train is its own kind of signal: all its coefficients are equal. That is the discrete-time echo of the impulse having a flat spectrum, and it is the reason the same sequence appears again in Module 7 as the sampling signal.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:840,h:170,xr:[-16,16],yr:[-0.25,1.42],xlabel:'n',ylabel:'x[n]',pad:{l:52,r:30,t:28,b:34},xtarget:8,ytarget:2});
      a.stem(D(n=>n%5===0?1:0,-16,16),{color:C.in,showZero:true});
      a.span(0,5,1.16,'N=5',{tex:true,color:C.slate,fs:13});
      return a.svg(); },
      caption:'The train for $N=5$.'},
    {t:'reveal', at:1, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:220,xr:[-3*PI,3*PI],yr:[-0.30,1.86],xlabel:'\\omega',ylabel:'X(e^{j\\omega})',
          pad:{l:66,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI),xtickfmt:piTick,
          yticksOverride:[0,2*PI/5],ytickfmt:v=>v.toFixed(4)});
        for(let k=-8;k<=8;k++){ const w=2*PI*k/5;
          if(w>=-3*PI && w<=3*PI) a.impulse(w,2*PI/5,{color:C.in,label:false}); }
        markPeriod(a,1.56);
        return a.svg(); },
        caption:'Its transform: impulses of weight $2\\pi/5=1.2566$, spaced $2\\pi/5$ apart, five to a period.'}]},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:220,xr:[-3*PI,3*PI],yr:[-0.20,0.95],xlabel:'\\omega',ylabel:'X(e^{j\\omega})',
          pad:{l:66,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI),xtickfmt:piTick,
          yticksOverride:[0,2*PI/15],ytickfmt:v=>v.toFixed(4)});
        for(let k=-23;k<=23;k++){ const w=2*PI*k/15;
          if(w>=-3*PI && w<=3*PI) a.impulse(w,2*PI/15,{color:C.h,label:false,width:1.5}); }
        markPeriod(a,0.80);
        return a.svg(); },
        caption:'For $N=15$: fifteen impulses per period, each of weight $2\\pi/15=0.4189$.'}]}
  ]}
]},

/* ============================================================ two cosines */
{ id:'m6-ex-cos', module:'M6', nav:'Worked example · two cosines', title:'Worked example — reducing a frequency into range', src:'pp. 70–71',
  objective:'Reduce two out-of-range frequencies into one period and place the impulses.',
  keywords:'worked example two cosines 5pi/3 7pi/4 reduce frequency into range pi/3 pi/4 impulse positions', steps:4, blocks:[
  {t:'eyebrow', text:'Module 6 · Worked example', src:'pp. 70–71'},
  {t:'title', text:'Two frequencies that are not what they look like'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','$x[n]=2\\cos\\!\\left(\\tfrac{5\\pi}{3}n\\right)+\\cos\\!\\left(\\tfrac{7\\pi}{4}n\\right)$.'],
      ['Find','$X(e^{j\\omega})$: where the impulses sit and what each one weighs.'],
      ['Method','Bring each frequency into $-\\pi<\\omega\\le\\pi$ first, then apply the cosine pair to each term.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'eq', size:'sm', tex:'\\cos\\!\\left(\\tfrac{5\\pi}{3}n\\right)=\\cos\\!\\left(\\bigl(2\\pi-\\tfrac{\\pi}{3}\\bigr)n\\right)=\\cos\\!\\left(2\\pi n-\\tfrac{\\pi}{3}n\\right)=\\cos\\!\\left(\\tfrac{\\pi}{3}n\\right)',
        note:'$2\\pi n$ is a whole number of turns at every integer $n$, and the cosine is even, so both the shift and the sign disappear.'},
      {t:'eq', size:'sm', tex:'\\cos\\!\\left(\\tfrac{7\\pi}{4}n\\right)=\\cos\\!\\left(\\bigl(2\\pi-\\tfrac{\\pi}{4}\\bigr)n\\right)=\\cos\\!\\left(\\tfrac{\\pi}{4}n\\right)'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'The two sequences are identical', html:'$\\cos(\\tfrac{5\\pi}{3}n)$ and $\\cos(\\tfrac{\\pi}{3}n)$ are not merely similar: they take the same value at every integer $n$. Nothing distinguishes them, and any correct spectrum must be the same for both.'}]},
    {t:'reveal', at:3, items:[
      {t:'eq', key:true, size:'lg', tex:'X(e^{j\\omega})=2\\pi\\sum_{k}\\Bigl[\\delta\\bigl(\\omega-\\tfrac{\\pi}{3}-2\\pi k\\bigr)+\\delta\\bigl(\\omega+\\tfrac{\\pi}{3}-2\\pi k\\bigr)\\Bigr]+\\pi\\sum_{k}\\Bigl[\\delta\\bigl(\\omega-\\tfrac{\\pi}{4}-2\\pi k\\bigr)+\\delta\\bigl(\\omega+\\tfrac{\\pi}{4}-2\\pi k\\bigr)\\Bigr]',
        label:'Solution',
        note:'The amplitude 2 in front of the first cosine doubles its weight from $\\pi$ to $2\\pi$; the second cosine keeps $\\pi$.'}]},
    {t:'reveal', at:4, items:[
      {t:'wex', rows:[
        ['Weight $2\\pi$','at $\\pm\\pi/3$, and therefore also at $\\pm5\\pi/3$ and $\\pm7\\pi/3$, and so on every $2\\pi$.'],
        ['Weight $\\pi$','at $\\pm\\pi/4$, and therefore also at $\\pm7\\pi/4$ and $\\pm9\\pi/4$.'],
        ['Order','On the positive axis: $\\pi/4<\\pi/3<5\\pi/3<7\\pi/4<2\\pi<9\\pi/4<7\\pi/3$. The two trains interleave, and the order flips on either side of $2\\pi$.']
      ]}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:840,h:220,xr:[-14,14],yr:[-3.2,3.4],xlabel:'n',ylabel:'x[n]',pad:{l:52,r:30,t:28,b:34},xtarget:8,ytarget:3});
      a.curve(t=>2*Math.cos(5*PI*t/3)+Math.cos(7*PI*t/4),{color:C.muted,width:1,dash:'3 5',opacity:.45,n:4000});
      a.stem(D(n=>2*Math.cos(5*PI*n/3)+Math.cos(7*PI*n/4),-14,14),{color:C.in,showZero:true});
      return a.svg(); },
      caption:'The sequence. The dashed curve is drawn through the samples only to show which stems belong together; it is not the signal.'},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:200,xr:[-14,14],yr:[-1.45,1.75],xlabel:'n',ylabel:'\\cos(\\tfrac{5\\pi}{3}n)',
          pad:{l:70,r:30,t:32,b:34},xtarget:8,ytarget:3});
        a.curve(t=>Math.cos(PI*t/3),{color:C.out,width:1,dash:'3 5',opacity:.5,n:2000});
        a.stem(D(n=>Math.cos(5*PI*n/3),-14,14),{color:C.out,showZero:true});
        return a.svg(); },
        caption:'The first cosine, with the slow curve $\\cos(\\pi t/3)$ drawn through its samples. Every stem lands on it.'}]},
    {t:'reveal', at:3, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:270,xr:[-3*PI,3*PI],yr:[-1.5,9.4],xlabel:'\\omega',ylabel:'X(e^{j\\omega})',
          pad:{l:66,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI),xtickfmt:piTick,
          yticksOverride:[0,PI,2*PI],ytickfmt:piTick});
        for(let k=-2;k<=2;k++) for(const s of [1,-1]){
          const w=s*PI/3+2*PI*k; if(w>=-3*PI&&w<=3*PI) a.impulse(w,2*PI,{color:C.in,label:false}); }
        for(let k=-2;k<=2;k++) for(const s of [1,-1]){
          const w=s*PI/4+2*PI*k; if(w>=-3*PI&&w<=3*PI) a.impulse(w,PI,{color:C.h,label:false}); }
        markPeriod(a,7.9);
        return a.svg(); },
        caption:'The spectrum over three periods. The tall arrows carry weight $2\\pi$, the short ones $\\pi$; each pattern repeats every $2\\pi$.'}]}
  ]}
]},

{ id:'m6-ex-cos-b', module:'M6', nav:'Two cosines · the period', title:'The period of the sum, from the same two frequencies', src:'p. 71',
  objective:'State the discrete-time fundamental-period rule and apply it to the two components and their sum.',
  keywords:'fundamental period discrete time N0 = 2pi m / omega0 smallest integer m LCM 6 8 24 rational', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Worked example', src:'p. 71'},
  {t:'title', text:'How long before the sequence repeats'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'eq', key:true, tex:'N_0=\\frac{2\\pi}{\\omega_0}\\,m', label:'Fundamental period, discrete time',
      note:'Here $m$ is the <b>smallest positive integer</b> that makes $N_0$ an integer. The definition of $m$ is the whole rule; without it the equation says nothing, because $2\\pi/\\omega_0$ is usually not a whole number.'},
    {t:'note', kind:'def', head:'Why an extra integer is needed at all', html:'A discrete-time sequence repeats only at integer shifts. $e^{j\\omega_0 n}$ returns to its starting value when $\\omega_0 N_0$ is a multiple of $2\\pi$, that is when $N_0=(2\\pi/\\omega_0)m$ for some integer $m$. If no integer $m$ makes $N_0$ an integer, the sequence is not periodic at all — which happens exactly when $\\omega_0/2\\pi$ is irrational.'},
    {t:'reveal', at:1, items:[
      {t:'wex', rows:[
        ['First component','$\\omega_1=5\\pi/3$, so $2\\pi/\\omega_1=6/5$. The smallest $m$ that clears the denominator is $m=5$, giving $N_0=6$.'],
        ['Second component','$\\omega_2=7\\pi/4$, so $2\\pi/\\omega_2=8/7$, $m=7$, and $N_0=8$.'],
        ['Cross-reading','The reduced frequencies give the same answers directly: $2\\pi/(\\pi/3)=6$ and $2\\pi/(\\pi/4)=8$, both already integers with $m=1$.']
      ]}]},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Sum','The sum repeats when both components do, so its period is the least common multiple: $N_0=\\operatorname{LCM}(6,8)=24$.'],
        ['Check','$24/6=4$ and $24/8=3$, both whole; and $\\gcd(4,3)=1$, so nothing smaller works.']
      ]}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'The same machinery as in continuous time', html:'Writing $2\\pi/\\omega_0$ as a fraction in lowest terms turns this into the rule already used for a sum of continuous-time signals: $\\operatorname{LCM}$ of the numerators over $\\operatorname{GCD}$ of the denominators. What is new in discrete time is only that the answer must land on an integer.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:840,h:200,xr:[-4,28],yr:[-3.2,3.9],xlabel:'n',ylabel:'x[n]',pad:{l:52,r:30,t:30,b:34},xtarget:8,ytarget:3});
      a.stem(D(n=>2*Math.cos(5*PI*n/3)+Math.cos(7*PI*n/4),-4,28),{color:C.in,showZero:true});
      a.span(0,24,3.32,'N_0=24',{tex:true,color:C.coral,fs:14});
      a.vline(0,{color:C.coral}); a.vline(24,{color:C.coral});
      return a.svg(); },
      caption:'The sum repeats after 24 samples, and not before.'},
    {t:'reveal', at:1, items:[
      {t:'grid', cols:2, gap:'14px', items:[
        [{t:'fig', frame:true, svg:()=>{
          const a=P.Axes({w:420,h:190,xr:[-2,14],yr:[-1.45,1.85],xlabel:'n',ylabel:'x_1[n]',
            pad:{l:52,r:22,t:32,b:34},xtarget:5,ytarget:3});
          a.stem(D(n=>Math.cos(5*PI*n/3),-2,14),{color:C.out,showZero:true});
          a.span(0,6,1.44,'N_0=6',{tex:true,color:C.coral,fs:12});
          return a.svg(); },
          caption:'$x_1[n]=\\cos(\\tfrac{5\\pi}{3}n)$, period 6.'}],
        [{t:'fig', frame:true, svg:()=>{
          const a=P.Axes({w:420,h:190,xr:[-2,14],yr:[-1.45,1.85],xlabel:'n',ylabel:'x_2[n]',
            pad:{l:52,r:22,t:32,b:34},xtarget:5,ytarget:3});
          a.stem(D(n=>Math.cos(7*PI*n/4),-2,14),{color:C.h,showZero:true});
          a.span(0,8,1.44,'N_0=8',{tex:true,color:C.coral,fs:12});
          return a.svg(); },
          caption:'$x_2[n]=\\cos(\\tfrac{7\\pi}{4}n)$, period 8.'}]
      ]}]}
  ]}
]},

/* ============================================================ properties 1 */
{ id:'m6-props-1', module:'M6', nav:'Properties · shifts', title:'Linearity, time shift, frequency shift', src:'p. 72',
  objective:'State the three shift properties and show what each does to magnitude and phase.',
  keywords:'linearity time shift frequency shift modulation properties e^{-j omega n0} X(e^{j(omega-omega0)})', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Properties', src:'p. 72'},
  {t:'title', text:'Three properties that move things without changing them'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'eq', tex:'a\\,x_1[n]+b\\,x_2[n]\\;\\longleftrightarrow\\;a\\,X_1(e^{j\\omega})+b\\,X_2(e^{j\\omega})', label:'Linearity'},
    {t:'eq', tex:'x[n-n_0]\\;\\longleftrightarrow\\;e^{-j\\omega n_0}X(e^{j\\omega})', label:'Time shift'},
    {t:'eq', tex:'e^{j\\omega_0 n}x[n]\\;\\longleftrightarrow\\;X\\bigl(e^{j(\\omega-\\omega_0)}\\bigr)', label:'Frequency shift'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'Time shift leaves the magnitude alone', html:'$|e^{-j\\omega n_0}|=1$, so $|X|$ is untouched and only the phase changes, by the straight line $-n_0\\omega$. Delaying a sequence cannot change how much of each frequency it contains; it can only change when each frequency arrives.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Frequency shift wraps', html:'Sliding a $2\\pi$-periodic spectrum by $\\omega_0$ slides every copy at once. What leaves one end of a period enters the other end of the same period. There is no continuous-time picture of this, because there the spectrum has no copies to slide in from.'}]},
    {t:'reveal', at:3, items:[
      {t:'wex', rows:[
        ['Proof, time shift','$\\sum_n x[n-n_0]e^{-j\\omega n}$. Put $m=n-n_0$: the sum becomes $\\sum_m x[m]e^{-j\\omega(m+n_0)}=e^{-j\\omega n_0}X(e^{j\\omega})$.'],
        ['Proof, frequency shift','$\\sum_n e^{j\\omega_0n}x[n]e^{-j\\omega n}=\\sum_n x[n]e^{-j(\\omega-\\omega_0)n}=X(e^{j(\\omega-\\omega_0)})$.'],
        ['Symmetry','Each proof is the other one read backwards. A shift in one domain is a linear phase in the other.']
      ]}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:840,h:210,xr:[-3*PI,3*PI],yr:[-0.35,2.70],xlabel:'\\omega',ylabel:'|X(e^{j\\omega})|',
        pad:{l:62,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI),xtickfmt:piTick,ytarget:3});
      a.curve(w=>geoMag(w,0.5),{color:C.in,n:3000});
      a.curve(w=>geoMag(w,0.5),{color:C.out,n:3000,width:1.2,dash:'5 4'});
      markPeriod(a,2.30);
      return a.svg(); },
      caption:'A time shift moves nothing here: the magnitude of $x[n-n_0]$ (dashed) lies exactly on the magnitude of $x[n]$.'},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:230,xr:[-3*PI,3*PI],yr:[-0.35,2.70],xlabel:'\\omega',ylabel:'|X(e^{j\\omega})|',
          pad:{l:62,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI),xtickfmt:piTick,ytarget:3});
        a.curve(w=>geoMag(w,0.5),{color:C.muted,n:3000,width:1.2,dash:'4 5'});
        a.curve(w=>geoMag(w-PI/2,0.5),{color:C.mid,n:3000});
        markPeriod(a,2.30);
        return a.svg(); },
        caption:'A frequency shift by $\\omega_0=\\pi/2$. The dashed spectrum is the original; the solid one is the shifted spectrum, and the peak that left the right-hand edge of a period has come back in at the left.'}]},
    {t:'reveal', at:3, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:210,xr:[-3*PI,3*PI],yr:[-4.9,6.0],xlabel:'\\omega',ylabel:'\\angle X(e^{j\\omega})\\;[\\text{rad}]',
          pad:{l:74,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI),xtickfmt:wPi,
          yticksOverride:[-PI,0,PI],ytickfmt:v=>v.toFixed(2)});
        a.curve(w=>{const v=geoPh(w,0.5); return v-2*PI*Math.round(v/(2*PI));},{color:C.muted,n:4000,width:1.2,dash:'4 5'});
        a.curve(w=>{const v=geoPh(w,0.5)-2*w; return v-2*PI*Math.round(v/(2*PI));},{color:C.mid,n:8000});
        markPeriod(a,4.55);
        return a.svg(); },
        caption:'What the time shift does change: the phase gains the straight line $-n_0\\omega$, here with $n_0=2$, and the wrapped result is the solid sawtooth.'}]}
  ]}
]},

/* ============================================================ properties 2 */
{ id:'m6-props-2', module:'M6', nav:'Properties · symmetry', title:'Conjugation, real sequences, time reversal', src:'pp. 72–73',
  objective:'State the conjugate-symmetry properties and their consequences for a real sequence.',
  keywords:'conjugation conjugate symmetry real sequence even magnitude odd phase time reversal X(e^{-j omega})', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Properties', src:'pp. 72–73'},
  {t:'title', text:'What being real costs a spectrum'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'eq', tex:'x^{*}[n]\\;\\longleftrightarrow\\;X^{*}(e^{-j\\omega})', label:'Conjugation'},
    {t:'eq', tex:'x[-n]\\;\\longleftrightarrow\\;X(e^{-j\\omega})', label:'Time reversal'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, size:'lg', tex:'x[n]\\ \\text{real}\\;\\Longrightarrow\\;X(e^{-j\\omega})=X^{*}(e^{j\\omega})',
        label:'Conjugate symmetry',
        note:'Put $x^{*}=x$ into the conjugation property and compare with the transform of $x$ itself.'},
      {t:'grid', cols:2, gap:'10px', items:[
        [{t:'small', html:'$\\operatorname{Re}\\{X\\}$ is <b>even</b> in $\\omega$'}],
        [{t:'small', html:'$\\operatorname{Im}\\{X\\}$ is <b>odd</b> in $\\omega$'}],
        [{t:'small', html:'$|X|$ is <b>even</b> in $\\omega$'}],
        [{t:'small', html:'$\\angle X$ is <b>odd</b> in $\\omega$'}]
      ]}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Half a period is enough — for a real sequence only', html:'Conjugate symmetry means the values on $-\\pi\\le\\omega<0$ are determined by those on $0\\le\\omega\\le\\pi$. So a real sequence can be described by half a period. A complex sequence cannot, and drawing only $0$ to $\\pi$ for one throws information away.'}]},
    {t:'reveal', at:3, items:[
      {t:'wex', rows:[
        ['Real and even','$x[-n]=x[n]$ and $x$ real together force $X(e^{-j\\omega})=X(e^{j\\omega})=X^{*}(e^{j\\omega})$, so $X$ is real and even. The two-sided exponential $a^{|n|}$ is the example.'],
        ['Real and odd','The same two properties with a sign give a purely imaginary and odd spectrum. The sine of two scenes back is the example.'],
        ['Neither','A one-sided sequence such as $a^{n}u[n]$ is real but not symmetric, so its spectrum is complex — with an even magnitude and an odd phase.']
      ]}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:840,h:210,xr:[-3*PI,3*PI],yr:[-0.35,2.70],xlabel:'\\omega',ylabel:'|X(e^{j\\omega})|',
        pad:{l:62,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI),xtickfmt:piTick,ytarget:3});
      a.curve(w=>geoMag(w,0.5),{color:C.in,n:3000});
      markPeriod(a,2.30);
      return a.svg(); },
      caption:'Magnitude of the transform of $a^{n}u[n]$, a real sequence. It is symmetric about $\\omega=0$ and about every multiple of $2\\pi$.'},
    {t:'reveal', at:1, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:210,xr:[-3*PI,3*PI],yr:[-0.95,1.02],xlabel:'\\omega',ylabel:'\\angle X(e^{j\\omega})\\;[\\text{rad}]',
          pad:{l:74,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI),xtickfmt:wPi,
          yticksOverride:[-0.5236,0,0.5236],ytickfmt:v=>v.toFixed(4)});
        a.curve(w=>geoPh(w,0.5),{color:C.mid,n:3000});
        markPeriod(a,0.80);
        return a.svg(); },
        caption:'Its phase, over the same three periods: odd about the origin, and odd about every multiple of $2\\pi$ as well.'}]},
    {t:'reveal', at:3, items:[
      {t:'grid', cols:2, gap:'14px', items:[
        [{t:'fig', frame:true, svg:()=>{
          const a=P.Axes({w:420,h:190,xr:[-8,8],yr:[-0.2,1.25],xlabel:'n',ylabel:'x[n]',pad:{l:50,r:22,t:28,b:34},xtarget:5,ytarget:2});
          a.stem(D(n=>n>=0?Math.pow(0.5,n):0,-8,8),{color:C.in,showZero:true});
          return a.svg(); },
          caption:'Real, not symmetric.'}],
        [{t:'fig', frame:true, svg:()=>{
          const a=P.Axes({w:420,h:190,xr:[-8,8],yr:[-0.2,1.25],xlabel:'n',ylabel:'x[-n]',pad:{l:52,r:22,t:28,b:34},xtarget:5,ytarget:2});
          a.stem(D(n=>n<=0?Math.pow(0.5,-n):0,-8,8),{color:C.mid,showZero:true});
          return a.svg(); },
          caption:'Its reversal, whose transform is $X(e^{-j\\omega})$.'}]
      ]}]}
  ]}
]},

/* ============================================================ time expansion */
{ id:'m6-expansion', module:'M6', nav:'Properties · time expansion', title:'Time expansion compresses the frequency axis', src:'p. 72',
  objective:'State the expansion property, prove it by an index change, and read the halved period off the picture.',
  keywords:'time expansion x_(k)[n] zero insertion X(e^{jk omega}) compression period pi proof index change', steps:2, blocks:[
  {t:'eyebrow', text:'Module 6 · Properties', src:'p. 72'},
  {t:'title', text:'Insert zeros in time, squeeze the spectrum'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'note', kind:'def', head:'What expansion means here', html:'For a positive integer $k$, {{sym:expan|$x_{(k)}[n]$}} is $x[n/k]$ when $n$ is a multiple of $k$, and $0$ otherwise. It is a stretch with zeros inserted, not a stretch that interpolates. Discrete time has no operation that stretches a sequence without leaving gaps.'},
    {t:'eq', key:true, size:'lg', tex:'x_{(k)}[n]\\;\\longleftrightarrow\\;X\\bigl(e^{jk\\omega}\\bigr)', label:'Time expansion'},
    {t:'reveal', at:1, items:[
      {t:'wex', rows:[
        ['Proof','$\\sum_n x_{(k)}[n]e^{-j\\omega n}$. Only the indices $n=rk$ contribute, so put $n=rk$: the sum becomes $\\sum_r x[r]e^{-j\\omega k r}=X(e^{jk\\omega})$.'],
        ['Consequence','Replacing $\\omega$ by $k\\omega$ compresses the frequency axis by $k$. The spectrum was $2\\pi$-periodic; it is now $2\\pi/k$-periodic, so one period of length $2\\pi$ holds $k$ copies of the old picture.']
      ]}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Nothing is created', html:'The expanded sequence has the same values as the original, spread out with zeros between them. So its energy is unchanged, and the compressed spectrum has $k$ copies of the old picture inside one period rather than a taller one.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:840,h:200,xr:[-4,12],yr:[-0.25,1.42],xlabel:'n',ylabel:'y[n]',pad:{l:52,r:30,t:28,b:34},xtarget:8,ytarget:2});
      a.stem(D(n=>(n>=0&&n<=4)?1:0,-4,12),{color:C.in,showZero:true});
      return a.svg(); },
      caption:'A five-point pulse $y[n]$, here the pulse $g[n]=1$ on $|n|\\le2$ moved so that it starts at the origin.'},
    {t:'reveal', at:1, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:200,xr:[-4,12],yr:[-0.25,1.42],xlabel:'n',ylabel:'y_{(2)}[n]',pad:{l:60,r:30,t:28,b:34},xtarget:8,ytarget:2});
        a.stem(D(n=>(n>=0&&n<=8&&n%2===0)?1:0,-4,12),{color:C.mid,showZero:true});
        return a.svg(); },
        caption:'Its expansion by $k=2$: the same five values, with a zero inserted between each pair.'}]},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:200,xr:[-4,12],yr:[-0.25,1.42],xlabel:'n',ylabel:'y_{(3)}[n]',pad:{l:60,r:30,t:28,b:34},xtarget:8,ytarget:2});
        a.stem(D(n=>(n>=0&&n<=12&&n%3===0)?1:0,-4,12),{color:C.out,showZero:true});
        return a.svg(); },
        caption:'Expansion by $k=3$: two zeros between each pair, and a spectrum that repeats three times inside every $2\\pi$.'}]}
  ]}
]},

{ id:'m6-expansion-b', module:'M6', nav:'Time expansion · worked example', title:'Worked example — building a sequence out of an expansion', src:'p. 72',
  objective:'Apply the expansion property to the five-point pulse and watch the argument halve.',
  keywords:'worked example five point pulse sin(5 omega/2)/sin(omega/2) sin(5 omega)/sin(omega) denominator halved', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Worked example', src:'p. 72'},
  {t:'title', text:'The same expression, at twice the frequency'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:'Take the five-point rectangular pulse $g[n]=1$ on $|n|\\le2$. From the worked example already done,'},
    {t:'eq', size:'sm', tex:'G(e^{j\\omega})=\\frac{\\sin(5\\omega/2)}{\\sin(\\omega/2)}'},
    {t:'note', kind:'warn', head:'The denominator is $\\sin(\\omega/2)$', html:'Writing $\\sin(\\omega)$ there changes the function completely: it puts a pole at $\\omega=\\pi$, where the true value is $G(e^{j\\pi})=1$. At $\\omega=\\pi-10^{-3}$ the wrong form gives $1000.0$; at $\\omega=\\pi/2$ it gives $-0.7071$ against the true $-1.0000$.'},
    {t:'reveal', at:1, items:[
      {t:'wex', rows:[
        ['Shift','$y[n]=g[n-2]$, so $Y(e^{j\\omega})=e^{-j2\\omega}G(e^{j\\omega})$.'],
        ['Expand','$y_{(2)}[n]$ inserts a zero between every pair of samples, and $Y_{(2)}(e^{j\\omega})=Y(e^{j2\\omega})=e^{-j4\\omega}\\dfrac{\\sin(5\\omega)}{\\sin(\\omega)}$.'],
        ['Build','$x[n]=y_{(2)}[n]+2y_{(2)}[n-1]$, so $X(e^{j\\omega})=\\bigl(1+2e^{-j\\omega}\\bigr)Y_{(2)}(e^{j\\omega})$.']
      ]}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Where the argument halved', html:'$G$ has $\\sin(5\\omega/2)/\\sin(\\omega/2)$; $Y_{(2)}$ has $\\sin(5\\omega)/\\sin(\\omega)$. Both are the same expression, the second with $\\omega$ replaced by $2\\omega$. So a form with $\\sin(\\omega)$ in the denominator is right for the expanded sequence and wrong for the original — which is exactly the confusion the property exists to settle.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'The last step is a shift and a sum', html:'$1+2e^{-j\\omega}$ is what linearity and the time-shift property give for $y_{(2)}[n]+2y_{(2)}[n-1]$. No new property is needed: the whole sequence is built out of one pulse, one shift, one expansion and one weighted sum.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:840,h:210,xr:[-3*PI,3*PI],yr:[-0.75,6.5],xlabel:'\\omega',ylabel:'|G(e^{j\\omega})|',
        pad:{l:64,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI),xtickfmt:piTick,
        yticksOverride:[0,1,2.5,5],ytickfmt:v=>v.toFixed(2)});
      a.curve(w=>Math.abs(dirich(wrap(w),2)),{color:C.in,n:6000});
      markPeriod(a,5.72);
      return a.svg(); },
      caption:'$|G(e^{j\\omega})|$: peak 5 at $\\omega=0$, and the finite value 1 at $\\omega=\\pi$ where the wrong denominator would put a pole.'},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:210,xr:[-3*PI,3*PI],yr:[-0.75,6.5],xlabel:'\\omega',ylabel:'|Y_{(2)}(e^{j\\omega})|',
          pad:{l:70,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI),xtickfmt:piTick,
          yticksOverride:[0,1,2.5,5],ytickfmt:v=>v.toFixed(2)});
        a.curve(w=>Math.abs(dirich(wrap(2*w),2)),{color:C.mid,n:8000});
        markPeriod(a,5.72);
        return a.svg(); },
        caption:'$|Y_{(2)}(e^{j\\omega})|=|\\sin(5\\omega)/\\sin(\\omega)|$. The picture now repeats twice inside every $2\\pi$.'}]},
    {t:'reveal', at:3, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:210,xr:[-3*PI,3*PI],yr:[-1.5,17.5],xlabel:'\\omega',ylabel:'|X(e^{j\\omega})|',
          pad:{l:66,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI),xtickfmt:piTick,
          yticksOverride:[0,5,15],ytickfmt:v=>v.toFixed(2)});
        a.curve(w=>Math.sqrt(5+4*Math.cos(w))*Math.abs(dirich(wrap(2*w),2)),{color:C.out,n:8000});
        markPeriod(a,15.4);
        return a.svg(); },
        caption:'The assembled $|X(e^{j\\omega})|=|1+2e^{-j\\omega}|\\cdot|Y_{(2)}(e^{j\\omega})|$, peaking at $3\\times5=15$ at $\\omega=0$.'}]}
  ]}
]},

/* ============================================================ properties 3 */
{ id:'m6-props-3', module:'M6', nav:'Properties · differencing', title:'Differencing, accumulation, and differentiation in frequency', src:'pp. 72–73',
  objective:'Name the first difference correctly and separate it from the frequency derivative.',
  keywords:'differencing first difference not differentiation accumulation differentiation in frequency n x[n] derivative', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Properties', src:'pp. 72–73'},
  {t:'title', text:'Discrete time has a difference, not a derivative'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'note', kind:'err', head:'A name that has to be right', html:'The operation $x[n]-x[n-1]$ is the <b>first difference</b>. It is not a derivative, and calling it differentiation collapses the distinction between continuous and discrete time on the one page where that distinction is being built. A sequence has no derivative: there is nothing between $n$ and $n+1$ to take a limit over.'},
    {t:'eq', key:true, tex:'x[n]-x[n-1]\\;\\longleftrightarrow\\;\\bigl(1-e^{-j\\omega}\\bigr)X(e^{j\\omega})', label:'Differencing in time'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\sum_{m=-\\infty}^{n}x[m]\\;\\longleftrightarrow\\;\\frac{1}{1-e^{-j\\omega}}X(e^{j\\omega})+\\pi X(e^{j0})\\sum_{k=-\\infty}^{\\infty}\\delta(\\omega-2\\pi k)', label:'Accumulation'},
      {t:'small', html:'Accumulation undoes differencing, so the two transfer factors are reciprocals. The impulse train is the part differencing destroys: any constant offset in the running sum is invisible to the difference, and $X(e^{j0})=\\sum_n x[n]$ is what fixes it.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'n\\,x[n]\\;\\longleftrightarrow\\;j\\,\\frac{\\d X(e^{j\\omega})}{\\d\\omega}', label:'Differentiation in frequency'},
      {t:'note', kind:'ok', head:'This one really is a derivative', html:'The variable being differentiated is $\\omega$, which is continuous. So the module carries both words honestly: <b>differencing</b> in time, because $n$ is an integer, and <b>differentiation</b> in frequency, because $\\omega$ is not.'}]},
    {t:'reveal', at:3, items:[
      {t:'wex', rows:[
        ['Proof, differencing','Linearity plus the time-shift property: $x[n]\\to X$ and $x[n-1]\\to e^{-j\\omega}X$, and subtract.'],
        ['Proof, frequency derivative','Differentiate $X(e^{j\\omega})=\\sum_n x[n]e^{-j\\omega n}$ term by term. Each term gains $-jn$, so $\\d X/\\d\\omega=-j\\sum_n n\\,x[n]e^{-j\\omega n}$. Multiplying by $j$ gives the pair.'],
        ['Use','The frequency derivative is what produces the pair $(n+1)a^{n}u[n]$ later in this module, without quoting it from anywhere.']
      ]}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:840,h:200,xr:[-3*PI,3*PI],yr:[-0.35,2.55],xlabel:'\\omega',ylabel:'|1-e^{-j\\omega}|',
        pad:{l:66,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI),xtickfmt:piTick,
        yticksOverride:[0,1,2],ytickfmt:v=>v.toFixed(2)});
      a.curve(w=>2*Math.abs(Math.sin(w/2)),{color:C.h,n:4000});
      markPeriod(a,2.22);
      return a.svg(); },
      caption:'The factor differencing applies, $|1-e^{-j\\omega}|=2|\\sin(\\omega/2)|$. It is zero at $\\omega=0$ and largest at $\\omega=\\pm\\pi$: a first difference removes the average and emphasises the fastest part of a sequence.'},
    {t:'reveal', at:1, items:[
      {t:'grid', cols:2, gap:'14px', items:[
        [{t:'fig', frame:true, svg:()=>{
          const a=P.Axes({w:420,h:200,xr:[-4,14],yr:[-0.25,1.25],xlabel:'n',ylabel:'x[n]',pad:{l:50,r:22,t:28,b:34},xtarget:5,ytarget:2});
          a.stem(D(n=>n>=0?Math.pow(0.5,n):0,-4,14),{color:C.in,showZero:true});
          return a.svg(); },
          caption:'A sequence.'}],
        [{t:'fig', frame:true, svg:()=>{
          const a=P.Axes({w:420,h:200,xr:[-4,14],yr:[-0.65,1.25],xlabel:'n',ylabel:'x[n]-x[n-1]',pad:{l:58,r:22,t:28,b:34},xtarget:5,ytarget:3});
          const f=n=>n>=0?Math.pow(0.5,n):0;
          a.stem(D(n=>f(n)-f(n-1),-4,14),{color:C.out,showZero:true});
          return a.svg(); },
          caption:'Its first difference.'}]
      ]}]}
  ]}
]},

/* ============================================================ Parseval */
{ id:'m6-parseval', module:'M6', nav:'Parseval', title:'Parseval — energy counted in either domain', src:'p. 73',
  objective:'State Parseval for the DTFT and check it on two sequences.',
  keywords:'parseval energy density spectrum |X|^2 one period 1/2pi sum energy check geometric rectangular', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Properties', src:'p. 73'},
  {t:'title', text:'The same energy, counted two ways'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'eq', key:true, size:'lg', tex:'\\sum_{n=-\\infty}^{\\infty}\\bigl|x[n]\\bigr|^{2}=\\frac{1}{2\\pi}\\int_{2\\pi}\\bigl|X(e^{j\\omega})\\bigr|^{2}\\,\\d\\omega',
      label:'Parseval’s relation'},
    {t:'note', kind:'def', head:'Energy-density spectrum', html:'$|X(e^{j\\omega})|^{2}$ is the <b>energy-density spectrum</b> of $x$. Integrating it over one period and dividing by $2\\pi$ gives the total energy. Integrating it over part of a period gives the energy carried by that band of frequencies.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'One period, and the $1/2\\pi$', html:'Both are load-bearing. Integrating over all $\\omega$ counts every copy of the same information and diverges. Dropping the $1/2\\pi$ multiplies the answer by $2\\pi$. Neither mistake shows up in the shape of the plot, so both survive until a number is needed.'}]},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Check 1','$x[n]=a^{n}u[n]$ with $a=\\tfrac12$. Time side: $\\sum_{n\\ge0}(\\tfrac14)^{n}=\\tfrac{1}{1-1/4}=\\tfrac43$. Frequency side: $\\dfrac{1}{2\\pi}\\displaystyle\\int_{-\\pi}^{\\pi}\\frac{\\d\\omega}{1-2a\\cos\\omega+a^{2}}=\\dfrac{1}{1-a^{2}}=\\tfrac43$.'],
        ['Check 2','The rectangular pulse with $N_1=2$. Time side: five samples of $1$, so the energy is $5$. Frequency side: $\\dfrac{1}{2\\pi}\\displaystyle\\int_{-\\pi}^{\\pi}\\left|\\frac{\\sin(5\\omega/2)}{\\sin(\\omega/2)}\\right|^{2}\\d\\omega=5$.'],
        ['Reading','Both checks are cheap and both catch the two errors above at once: a missing $1/2\\pi$ shows as a factor $2\\pi$, and a full-line integral does not converge.']
      ]}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'Why $|X|^{2}$ and not $X$', html:'The relation is about energy, which is a square. Nothing is claimed about $\\int X\\,\\d\\omega$: that integral is $2\\pi x[0]$ by the synthesis equation, which is a different and much weaker statement.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:840,h:230,xr:[-3*PI,3*PI],yr:[-0.75,5.4],xlabel:'\\omega',ylabel:'|X(e^{j\\omega})|^{2}',
        pad:{l:68,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI),xtickfmt:piTick,ytarget:3});
      a.area(w=>geoMag(w,0.5)**2,-PI,PI,{color:'rgba(20,112,127,.18)'});
      a.curve(w=>geoMag(w,0.5)**2,{color:C.in,n:4000});
      markPeriod(a,4.55);
      return a.svg(); },
      caption:'The energy-density spectrum of $a^{n}u[n]$ with $a=\\tfrac12$. The shaded area, divided by $2\\pi$, is the total energy $4/3$.'},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:230,xr:[-3*PI,3*PI],yr:[-3.5,31],xlabel:'\\omega',ylabel:'|X(e^{j\\omega})|^{2}',
          pad:{l:70,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI),xtickfmt:piTick,ytarget:3});
        a.area(w=>dirich(wrap(w),2)**2,-PI,PI,{color:'rgba(192,132,34,.18)'});
        a.curve(w=>dirich(wrap(w),2)**2,{color:C.h,n:6000});
        markPeriod(a,26.5);
        return a.svg(); },
        caption:'The same picture for the rectangular pulse with $N_1=2$. The shaded area divided by $2\\pi$ is $5$, which is the number of samples.'}]}
  ]}
]},

/* ============================================================ convolution */
{ id:'m6-conv', module:'M6', nav:'Properties · convolution', title:'Convolution in time is multiplication in frequency', src:'p. 73',
  objective:'State the convolution property and separate the magnitude and phase statements.',
  keywords:'convolution property Y = X H magnitude product phase sum LTI frequency response discrete', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Properties', src:'p. 73'},
  {t:'title', text:'The property the whole course was built towards'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'eq', key:true, size:'lg', tex:'y[n]=x[n]*h[n]\\;\\longleftrightarrow\\;Y(e^{j\\omega})=X(e^{j\\omega})\\,H(e^{j\\omega})',
      label:'Convolution property',
      note:'$x[n]\\leftrightarrow X(e^{j\\omega})$ and $h[n]\\leftrightarrow H(e^{j\\omega})$ are both declared before the conclusion is written. The output symbol $y$ is used for the output and for nothing else.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'Two statements, written separately', html:'A product of complex numbers gives<br>$|Y(e^{j\\omega})|=|X(e^{j\\omega})|\\cdot|H(e^{j\\omega})|$ and<br>$\\angle Y(e^{j\\omega})=\\angle X(e^{j\\omega})+\\angle H(e^{j\\omega})$.<br>Writing $|Y=XH|$ puts the modulus bars around a whole equation, which is not an operation on anything. The magnitudes multiply and the phases add, and those are two different facts.'}]},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Proof','Transform the convolution sum and change the order of summation: $\\sum_n\\bigl(\\sum_k x[k]h[n-k]\\bigr)e^{-j\\omega n}=\\sum_k x[k]\\sum_n h[n-k]e^{-j\\omega n}$. The inner sum is $e^{-j\\omega k}H(e^{j\\omega})$ by the time-shift property, and what is left is $X(e^{j\\omega})H(e^{j\\omega})$.'],
        ['Reading','$H(e^{j\\omega})$ is the frequency response of the system. It says, one frequency at a time, by how much the system scales and by how much it delays.']
      ]}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'Write $u[n]$ every time', html:'A one-sided sequence is $x[n]=\\left(\\tfrac12\\right)^{n}u[n]$, never $\\left(\\tfrac12\\right)^{n}$. Without the step the sequence is defined for negative $n$ too, where $\\left(\\tfrac12\\right)^{n}$ grows without bound and no transform exists. Plotting only $n\\ge0$ does not supply the missing factor.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>P.blocks({w:840,h:210,items:[
      {t:'arrow',x1:70,y1:100,x2:300,y2:100,color:'#14707F'},
      {t:'box',x:300,y:70,w:210,h:62,label:'H(e^{j\\omega})',tex:true,fs:18},
      {t:'arrow',x1:510,y1:100,x2:760,y2:100,color:'#4A7A46'},
      {t:'text',x:185,y:82,label:'X(e^{j\\omega})',tex:true,fs:16,color:'#14707F'},
      {t:'text',x:635,y:82,label:'X(e^{j\\omega})H(e^{j\\omega})',tex:true,fs:16,color:'#4A7A46'},
      {t:'text',x:420,y:175,label:'|Y|=|X|\\cdot|H|\\qquad \\angle Y=\\angle X+\\angle H',tex:true,fs:16,color:C.slate}
    ]}), caption:'One multiplication per frequency, in place of the whole convolution sum.'},
    {t:'reveal', at:1, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:250,xr:[-3*PI,3*PI],yr:[-0.55,3.30],xlabel:'\\omega',
          pad:{l:58,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI),xtickfmt:piTick,
          yticksOverride:[0.5333,1,2,2.6667],ytickfmt:v=>v.toFixed(4)});
        a.curve(w=>geoMag(w,0.5),{color:C.in,n:3000});
        a.curve(w=>geoMag(w,0.25),{color:C.h,n:3000});
        a.curve(w=>geoMag(w,0.5)*geoMag(w,0.25),{color:C.out,n:3000});
        a.note(-9.3,3.10,'|Y|',{tex:true,color:C.out,fs:15});
        a.note(-9.3,2.45,'|X|',{tex:true,color:C.in,fs:15});
        a.note(-9.3,1.80,'|H|',{tex:true,color:C.h,fs:15});
        markPeriod(a,2.92);
        return a.svg(); },
        caption:'Magnitudes for $x[n]=(\\tfrac12)^{n}u[n]$ and $h[n]=(\\tfrac14)^{n}u[n]$. The output magnitude is the product, peaking at $2.6667$ and dipping to $0.5333$; both extremes are labelled.'}]}
  ]}
]},

{ id:'m6-conv-ex', module:'M6', nav:'Worked example · two exponentials', title:'Worked example — convolving two exponentials', src:'p. 73',
  objective:'Run the partial fractions in a named variable and state the condition the expansion needs.',
  keywords:'worked example convolution a^n b^n partial fractions z = e^{-j omega} a not equal b cover up residue', steps:4, blocks:[
  {t:'eyebrow', text:'Module 6 · Worked example', src:'p. 73'},
  {t:'title', text:'Partial fractions, in a variable that is allowed to move'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','$x[n]=a^{n}u[n]$ and $h[n]=b^{n}u[n]$, with $|a|<1$, $|b|<1$ and $a\\neq b$.'],
      ['Find','$y[n]=x[n]*h[n]$.'],
      ['Method','Multiply the two transforms, split the product into partial fractions, and invert each piece with the pair already derived.']
    ]},
    {t:'note', kind:'def', head:'Name the algebraic variable', html:'Write {{sym:zsub|$z=e^{-j\\omega}$}}. Then $Y=\\dfrac{1}{(1-az)(1-bz)}$ is an ordinary rational function of $z$, and the cover-up rule may be used on it. Substituting $z=1/a$ is a step of algebra in $z$; it is not a claim that $e^{-j\\omega}$ ever takes the value $1/a$, which for $|a|<1$ it cannot.'},
    {t:'reveal', at:1, items:[
      {t:'eq', size:'sm', tex:'Y=\\frac{1}{(1-az)(1-bz)}=\\frac{A}{1-az}+\\frac{B}{1-bz}',
        note:'Cover up $1-az$ and set $z=1/a$: $A=\\dfrac{1}{1-b/a}=\\dfrac{a}{a-b}$. Cover up $1-bz$ and set $z=1/b$: $B=\\dfrac{1}{1-a/b}=\\dfrac{b}{b-a}=-\\dfrac{b}{a-b}$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'The condition the expansion needs', html:'Both coefficients divide by $a-b$, so the whole route requires $a\\neq b$. It is not a technicality to be waved through: at $a=b$ the two poles merge, the expansion above has no meaning, and the answer takes a completely different form. That case is worked separately later in this module.'}]},
    {t:'reveal', at:3, items:[
      {t:'eq', key:true, size:'lg', tex:'y[n]=\\frac{1}{a-b}\\Bigl[a^{\\,n+1}-b^{\\,n+1}\\Bigr]u[n]',
        label:'Solution',
        note:'Invert each term with $\\dfrac{1}{1-\\alpha e^{-j\\omega}}\\leftrightarrow\\alpha^{n}u[n]$ and collect: $Aa^{n}+Bb^{n}=\\dfrac{a^{n+1}-b^{n+1}}{a-b}$.'}]},
    {t:'reveal', at:4, items:[
      {t:'wex', rows:[
        ['Check','$a=\\tfrac12$, $b=\\tfrac14$: $y[0]=1$, $y[1]=0.75$, $y[2]=0.4375$, $y[3]=0.234375$.'],
        ['Cross-reading','Convolve directly: $y[0]=x[0]h[0]=1$; $y[1]=x[0]h[1]+x[1]h[0]=\\tfrac14+\\tfrac12=0.75$. The two routes agree, and the first value must be $x[0]h[0]$ for any pair of causal sequences.']
      ]}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:840,h:210,xr:[-4,16],yr:[-0.18,1.30],xlabel:'n',ylabel:'y[n]',pad:{l:54,r:30,t:28,b:34},xtarget:8,ytarget:3});
      const y=n=>n<0?0:(Math.pow(0.5,n+1)-Math.pow(0.25,n+1))/0.25;
      a.stem(D(y,-4,16),{color:C.out,showZero:true});
      return a.svg(); },
      caption:'The output for $a=\\tfrac12$, $b=\\tfrac14$. It starts at 1, rises to no maximum, and decays like the slower of the two exponentials.'},
    {t:'reveal', at:3, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:230,xr:[-3*PI,3*PI],yr:[-0.95,1.28],xlabel:'\\omega',ylabel:'\\angle(\\cdot)\\;[\\text{rad}]',
          pad:{l:74,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI),xtickfmt:wPi,
          yticksOverride:[-0.5236,0,0.5236],ytickfmt:v=>v.toFixed(4)});
        a.curve(w=>geoPh(w,0.5),{color:C.in,n:3000,width:1.6,dash:'5 4'});
        a.curve(w=>geoPh(w,0.25),{color:C.h,n:3000,width:1.6,dash:'5 4'});
        a.curve(w=>geoPh(w,0.5)+geoPh(w,0.25),{color:C.out,n:3000});
        markPeriod(a,1.06);
        return a.svg(); },
        caption:'The phases add. The two dashed curves are $\\angle X$ and $\\angle H$; the solid one is their sum, which is $\\angle Y$.'}]}
  ]}
]},

/* ============================================================ ideal filters */
{ id:'m6-conv-lpf', module:'M6', nav:'Worked example · filter cascade', title:'Worked example — a cascade of ideal low-pass filters', src:'p. 74',
  objective:'Multiply two ideal spectra, fix the band-edge convention, and finish the second problem.',
  keywords:'ideal low pass cascade narrower band edge convention half open interval sin(pi n/4)', steps:2, blocks:[
  {t:'eyebrow', text:'Module 6 · Worked example', src:'p. 74'},
  {t:'title', text:'Two filters in a row, and one open bracket'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','$H_1$ is ideal low-pass with cutoff $\\pi/2$; $H_2$ is ideal low-pass with cutoff $\\pi/4$. Both are $2\\pi$-periodic. The input is $x[n]=\\delta[n]$.'],
      ['Find','The output of the cascade.'],
      ['Method','Multiply the two frequency responses, then invert with the ideal low-pass pair.']
    ]},
    {t:'note', kind:'warn', head:'Close one branch, leave the other open', html:'Write the spectrum as $1$ for $|\\omega|\\le\\pi/4$ and $0$ for $\\pi/4<|\\omega|\\le\\pi$. Writing $\\pi/4\\le|\\omega|$ in the second branch defines the band edge twice, and for an ideal filter the edge is precisely where a convention is needed rather than assumed.'},
    {t:'reveal', at:1, items:[
      {t:'eq', size:'sm', tex:'H(e^{j\\omega})=H_1(e^{j\\omega})H_2(e^{j\\omega})=\\begin{cases}1,&|\\omega|\\le\\pi/4\\\\[2pt]0,&\\pi/4<|\\omega|\\le\\pi\\end{cases}',
        note:'The product of two rectangles is the narrower of the two. A cascade of ideal low-pass filters keeps only the band both of them pass.'},
      {t:'eq', key:true, tex:'y[n]=\\frac{\\sin(\\pi n/4)}{\\pi n},\\qquad y[0]=\\frac14',
        label:'Solution'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Same result, other order', html:'Multiplication commutes, so the two filters may be applied in either order and the wider one has no effect at all. In time this says $h_1*h_2=h_2*h_1$, which is much harder to see from the sums.'}]},
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:840,h:215,xr:[-3*PI,3*PI],yr:[-0.30,1.72],xlabel:'\\omega',ylabel:'H(e^{j\\omega})',
        pad:{l:62,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI/2),xtickfmt:piTick,ytarget:2});
      a.curve(w=>lpf(w,PI/2),{color:C.muted,n:8000,width:1.4,dash:'5 4'});
      a.curve(w=>lpf(w,PI/4),{color:C.h,n:8000});
      markPeriod(a,1.32);
      return a.svg(); },
      caption:'The two responses over three periods: the dashed one has cutoff $\\pi/2$, the solid one $\\pi/4$. Their product is the solid one.'},
    {t:'reveal', at:1, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:215,xr:[-18,18],yr:[-0.10,0.34],xlabel:'n',ylabel:'y[n]',
          pad:{l:60,r:30,t:30,b:34},xtarget:8,yticksOverride:[0,0.1,0.25],ytickfmt:v=>v.toFixed(4)});
        a.stem(D(n=>lpfInv(n,PI/4),-18,18),{color:C.out,showZero:true});
        return a.svg(); },
        caption:'The output of the cascade: the ideal low-pass sequence at the narrower cutoff, $y[0]=0.25$.'}]}
  ]}
]},

{ id:'m6-conv-lpf-b', module:'M6', nav:'Filtering · a stepped spectrum', title:'Worked example — a stepped spectrum through a filter', src:'p. 74',
  objective:'Split a stepped output spectrum into stacked ideal bands and write the sequence.',
  keywords:'stepped spectrum stacked bands ideal low pass product closed form y[0]=3/4 finish the answer', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Worked example', src:'p. 74'},
  {t:'title', text:'Two bands stacked, two terms in the answer'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','$X(e^{j\\omega})=2$ for $|\\omega|\\le\\pi/4$ and $1$ for $\\pi/4<|\\omega|\\le3\\pi/4$, zero to $\\pi$; $H$ is ideal low-pass with cutoff $\\pi/2$. Both repeat every $2\\pi$.'],
      ['Find','$y[n]$ in closed form.'],
      ['Method','Multiply the two spectra, then split the result into ideal bands that are stacked on one another.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'wex', rows:[
        ['Product','$Y(e^{j\\omega})=2$ for $|\\omega|\\le\\pi/4$ and $1$ for $\\pi/4<|\\omega|\\le\\pi/2$, and zero on the rest of the period.'],
        ['The stack','One band of height 1 out to $\\pi/2$, plus one more band of height 1 out to $\\pi/4$. Adding them gives height 2 on the inner band and height 1 on the outer, which is $Y$.']
      ]}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, size:'lg', tex:'y[n]=\\frac{\\sin(\\pi n/2)}{\\pi n}+\\frac{\\sin(\\pi n/4)}{\\pi n},\\qquad y[0]=\\frac12+\\frac14=\\frac34',
        label:'Solution',
        note:'Each band is inverted with the ideal low-pass pair, and linearity adds the two sequences.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'Finish the answer', html:'A sketch of a spectrum is not a solution. The closed form costs one line once the stack is seen, and $y[0]$ checks it independently: it must be the area of one period of $Y$ divided by $2\\pi$, which is $\\tfrac12+\\tfrac14$.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:840,h:210,xr:[-3*PI,3*PI],yr:[-0.45,2.95],xlabel:'\\omega',ylabel:'X(e^{j\\omega})',
        pad:{l:62,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI/2),xtickfmt:piTick,ytarget:3});
      a.curve(w=>lpf(w,3*PI/4)+lpf(w,PI/4),{color:C.in,n:9000});
      markPeriod(a,2.42);
      return a.svg(); },
      caption:'The input spectrum: height 2 out to $\\pi/4$ and height 1 from there to $3\\pi/4$.'},
    {t:'reveal', at:1, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:210,xr:[-3*PI,3*PI],yr:[-0.45,2.95],xlabel:'\\omega',ylabel:'Y(e^{j\\omega})',
          pad:{l:62,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI/2),xtickfmt:piTick,ytarget:3});
        a.curve(w=>2*lpf(w,PI/4),{color:C.muted,n:9000,width:1.3,dash:'4 5'});
        a.curve(w=>lpf(w,PI/2)+lpf(w,PI/4),{color:C.out,n:9000});
        markPeriod(a,2.42);
        return a.svg(); },
        caption:'The output: the outer step has been cut back to $\\pi/2$ by the filter, and the whole shape repeats every $2\\pi$.'}]},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:210,xr:[-18,18],yr:[-0.22,1.00],xlabel:'n',ylabel:'y[n]',
          pad:{l:60,r:30,t:30,b:34},xtarget:8,yticksOverride:[0,0.25,0.75],ytickfmt:v=>v.toFixed(4)});
        a.stem(D(n=>lpfInv(n,PI/2)+lpfInv(n,PI/4),-18,18),{color:C.out,showZero:true});
        return a.svg(); },
        caption:'The output sequence, with $y[0]=0.75$.'}]}
  ]}
]},

/* ============================================================ multiplication */
{ id:'m6-mult', module:'M6', nav:'Properties · multiplication', title:'Multiplication in time is a periodic convolution', src:'pp. 75–76',
  objective:'State the multiplication property with the periodic convolution and show the replicas overlapping.',
  keywords:'multiplication property periodic convolution one period 2pi replica overlap trapezoid 1/2pi', steps:2, blocks:[
  {t:'eyebrow', text:'Module 6 · Properties', src:'pp. 75–76'},
  {t:'title', text:'An integral over one period, not over everything'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'eq', key:true, size:'lg', tex:'z[n]=x[n]\\,y[n]\\;\\longleftrightarrow\\;Z(e^{j\\omega})=\\frac{1}{2\\pi}\\int_{2\\pi}X(e^{j\\theta})\\,Y\\bigl(e^{j(\\omega-\\theta)}\\bigr)\\,\\d\\theta',
      label:'Multiplication property'},
    {t:'note', kind:'def', head:'Periodic convolution', html:'The integral runs over one period only, and both factors are $2\\pi$-periodic. That operation is {{sym:pconv|periodic convolution}}, written $X\\circledast Y$. It is not the ordinary convolution of two functions on the whole line, and the two give different answers whenever the shapes are wide enough to meet across a period boundary.'},
    {t:'reveal', at:1, items:[
      {t:'wex', rows:[
        ['Worked case','$X(e^{j\\omega})=1$ for $|\\omega|\\le3\\pi/4$ and $Y(e^{j\\omega})=1$ for $|\\omega|\\le\\pi/2$, both zero on the rest of their period and both repeated every $2\\pi$.'],
        ['Ordinary convolution first','Two rectangles of half-widths $3\\pi/4$ and $\\pi/2$ convolve to a trapezoid of height $\\tfrac{1}{2\\pi}\\cdot2\\cdot\\tfrac{\\pi}{2}=\\tfrac12$, flat on $|\\omega|\\le\\pi/4$ and reaching zero at $|\\omega|=5\\pi/4$.'],
        ['Then wrap','$5\\pi/4>\\pi$, so the trapezoid runs past the edge of a period. What leaves one end comes back at the other, and near $\\omega=\\pm\\pi$ two pieces add.']
      ]}]},
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:840,h:200,xr:[-3*PI,3*PI],yr:[-0.30,1.68],xlabel:'\\omega',ylabel:'X(e^{j\\omega})',
        pad:{l:62,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI/2),xtickfmt:piTick,ytarget:2});
      a.curve(w=>lpf(w,3*PI/4),{color:C.in,n:9000});
      markPeriod(a,1.28);
      return a.svg(); },
      caption:'$X$: band of half-width $3\\pi/4$, repeated every $2\\pi$.'},
    {t:'reveal', at:1, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:200,xr:[-3*PI,3*PI],yr:[-0.30,1.68],xlabel:'\\omega',ylabel:'Y(e^{j\\omega})',
          pad:{l:62,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI/2),xtickfmt:piTick,ytarget:2});
        a.curve(w=>lpf(w,PI/2),{color:C.h,n:9000});
        markPeriod(a,1.28);
        return a.svg(); },
        caption:'$Y$: band of half-width $\\pi/2$, repeated every $2\\pi$.'}]},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:220,xr:[-3*PI,3*PI],yr:[-0.16,0.78],xlabel:'\\omega',ylabel:'Z(e^{j\\omega})',
          pad:{l:66,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI/2),xtickfmt:piTick,
          yticksOverride:[0,0.125,0.25,0.5],ytickfmt:v=>v.toFixed(4)});
        a.curve(w=>perConv(w,3*PI/4,PI/2),{color:C.out,n:6000});
        markPeriod(a,0.665);
        return a.svg(); },
        caption:'The result of the periodic convolution, over three periods.'}]}
  ]}
]},

{ id:'m6-mult-b', module:'M6', nav:'Multiplication · the overlap', title:'Where the copies meet', src:'pp. 75–76',
  objective:'Read the doubled value at the period edge and check the result against z[0].',
  keywords:'periodic convolution overlap doubling 1/8 to 1/4 check z[0] triangle fills period aliasing distinction', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Properties', src:'pp. 75–76'},
  {t:'title', text:'The value at the edge is the sum of two pieces'},
  {t:'cols', ratio:'c-5-7', left:[
    {t:'wex', rows:[
      ['Values','$Z(e^{j0})=0.5$ and $Z(e^{j\\pi/4})=0.5$ on the flat top; $Z(e^{j3\\pi/4})=0.25$ on the slope.'],
      ['The overlap','At $\\omega=\\pi$ the trapezoid alone gives $\\tfrac18$, and the copy arriving from the other side gives another $\\tfrac18$. The value is $\\tfrac14$, twice what a non-periodic reading predicts.'],
      ['Check','$\\dfrac{1}{2\\pi}\\displaystyle\\int_{2\\pi}Z\\,\\d\\omega=0.375$, and by the synthesis equation this must equal $z[0]=x[0]\\,y[0]=\\tfrac34\\cdot\\tfrac12=0.375$.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'When the two agree', html:'If the two bands are narrow enough that the result fits inside one period, the periodic and the ordinary convolution give the same picture. Two identical bands of half-width $\\pi/2$ give a triangle of peak $\\tfrac12$ whose base is exactly $|\\omega|\\le\\pi$: it fills the period and touches zero at the edges, with nothing to wrap.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'What this is not', html:'The overlap here is between copies of a <b>spectrum</b> in a frequency-domain convolution. It is a consequence of the spectrum being periodic, and it happens for every sequence. Module 7 has a different overlap, between replicas produced by sampling, and only that one is aliasing.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:840,h:250,xr:[-3*PI,3*PI],yr:[-0.16,0.78],xlabel:'\\omega',ylabel:'Z(e^{j\\omega})',
        pad:{l:66,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI/2),xtickfmt:piTick,
        yticksOverride:[0,0.125,0.25,0.5],ytickfmt:v=>v.toFixed(4)});
      for(let k=-2;k<=2;k++) a.curve(w=>rectConv(w-2*PI*k,3*PI/4,PI/2),{color:C.muted,n:4000,width:1.2,dash:'4 5'});
      a.curve(w=>perConv(w,3*PI/4,PI/2),{color:C.out,n:6000});
      markPeriod(a,0.665);
      return a.svg(); },
      caption:'The dashed trapezoids are the individual copies; the solid curve is their sum. Where two copies meet, the value doubles from $0.125$ to $0.25$.'},
    {t:'reveal', at:1, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:230,xr:[-3*PI,3*PI],yr:[-0.16,0.78],xlabel:'\\omega',ylabel:'Z(e^{j\\omega})',
          pad:{l:66,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI/2),xtickfmt:piTick,
          yticksOverride:[0,0.25,0.5],ytickfmt:v=>v.toFixed(4)});
        a.curve(w=>perConv(w,PI/2,PI/2),{color:C.mid,n:6000});
        markPeriod(a,0.665);
        return a.svg(); },
        caption:'Two equal bands of half-width $\\pi/2$: a triangle of peak $0.5$ whose base fills exactly one period, so nothing wraps and no value doubles.'}]}
  ]}
]},

/* ============================================================ modulation */
{ id:'m6-mult-ex', module:'M6', nav:'Worked example · modulation', title:'Worked example — multiplying by a cosine', src:'p. 76',
  objective:'Take one period of an impulse train into a periodic convolution and compute the band edges.',
  keywords:'modulation cosine multiplication band edges pi/12 7pi/12 impulse train one period shift by omega0', steps:4, blocks:[
  {t:'eyebrow', text:'Module 6 · Worked example', src:'p. 76'},
  {t:'title', text:'Where the two bands land, and why'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','$X(e^{j\\omega})=1$ for $|\\omega|\\le\\pi/4$ and $0$ for $\\pi/4<|\\omega|\\le\\pi$, repeated every $2\\pi$. The second sequence is $y[n]=\\cos(\\omega_0 n)$ with $\\omega_0=\\pi/3$.'],
      ['Find','$Z(e^{j\\omega})$ for $z[n]=x[n]\\,y[n]$.'],
      ['Method','Write $Y$ as its impulse train, take one period of it into the periodic convolution, and sift.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'eq', size:'sm', tex:'Y(e^{j\\omega})=\\pi\\sum_{l=-\\infty}^{\\infty}\\Bigl[\\delta\\bigl(\\omega-\\tfrac{\\pi}{3}-2\\pi l\\bigr)+\\delta\\bigl(\\omega+\\tfrac{\\pi}{3}-2\\pi l\\bigr)\\Bigr]'},
      {t:'note', kind:'warn', head:'Only one period enters the integral', html:'The train has infinitely many impulses, but the periodic convolution integrates over a single period of length $2\\pi$. Choose $-\\pi<\\theta\\le\\pi$: exactly two impulses lie in it, at $\\theta=\\pm\\pi/3$, and only those two contribute. Taking the whole train into an ordinary convolution would count every copy and diverge.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', size:'sm', tex:'Z(e^{j\\omega})=\\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi}X(e^{j\\theta})\\,Y\\bigl(e^{j(\\omega-\\theta)}\\bigr)\\d\\theta=\\frac{1}{2\\pi}\\cdot\\pi\\Bigl[X\\bigl(e^{j(\\omega-\\frac{\\pi}{3})}\\bigr)+X\\bigl(e^{j(\\omega+\\frac{\\pi}{3})}\\bigr)\\Bigr]'},
      {t:'eq', key:true, size:'lg', tex:'Z(e^{j\\omega})=\\tfrac12X\\bigl(e^{j(\\omega-\\omega_0)}\\bigr)+\\tfrac12X\\bigl(e^{j(\\omega+\\omega_0)}\\bigr)',
        label:'Solution',
        note:'Convolving with an impulse at $\\omega_0$ shifts; the factor $\\tfrac{1}{2\\pi}\\cdot\\pi=\\tfrac12$ is where the height comes from.'}]},
    {t:'reveal', at:3, items:[
      {t:'wex', rows:[
        ['Band edges','The band $|\\omega|\\le\\pi/4$ moves to $\\omega_0\\mp\\pi/4$. With $\\omega_0=\\pi/3$: $\\dfrac{\\pi}{3}-\\dfrac{\\pi}{4}=\\dfrac{\\pi}{12}$ and $\\dfrac{\\pi}{3}+\\dfrac{\\pi}{4}=\\dfrac{7\\pi}{12}$.'],
        ['Mirror','The other copy occupies $-7\\pi/12\\le\\omega\\le-\\pi/12$.'],
        ['Height','$\\tfrac12$, on both bands.']
      ]}]},
    {t:'reveal', at:4, items:[
      {t:'note', kind:'ok', head:'The edges are computed, not quoted', html:'Both numbers come from $\\omega_0$ and the bandwidth, so a change in either moves them together. That is the check: with $\\omega_0$ smaller than $\\pi/4$ the two bands would overlap through the origin instead of sitting either side of it, and the picture would be a different one.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:840,h:190,xr:[-3*PI,3*PI],yr:[-0.30,1.68],xlabel:'\\omega',ylabel:'X(e^{j\\omega})',
        pad:{l:62,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI/2),xtickfmt:piTick,ytarget:2});
      a.curve(w=>lpf(w,PI/4),{color:C.in,n:9000});
      markPeriod(a,1.28);
      return a.svg(); },
      caption:'The band to be moved: half-width $\\pi/4$, height 1, repeated every $2\\pi$.'},
    {t:'reveal', at:1, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:220,xr:[-3*PI,3*PI],yr:[-0.55,4.75],xlabel:'\\omega',ylabel:'Y(e^{j\\omega})',
          pad:{l:64,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI),xtickfmt:piTick,
          yticksOverride:[0,PI],ytickfmt:piTick});
        for(let k=-2;k<=2;k++) for(const s of [1,-1]){ const w=s*PI/3+2*PI*k;
          if(w>=-3*PI&&w<=3*PI) a.impulse(w,PI,{color:C.h,label:false}); }
        markPeriod(a,3.96);
        return a.svg(); },
        caption:'The transform of $\\cos(\\pi n/3)$, drawn over three periods. Only the two impulses inside the marked period enter the integral.'}]},
    {t:'reveal', at:3, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:230,xr:[-3*PI,3*PI],yr:[-0.18,0.95],xlabel:'\\omega',ylabel:'Z(e^{j\\omega})',
          pad:{l:66,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI/4),
          xtickfmt:v=>{const r=v/PI; return Math.abs(r-Math.round(r))<1e-9?piTick(v):'';},
          yticksOverride:[0,0.5],ytickfmt:v=>v.toFixed(2)});
        a.curve(w=>0.5*lpf(w-PI/3,PI/4)+0.5*lpf(w+PI/3,PI/4),{color:C.out,n:12000});
        a.vline(PI/12,{color:C.coral}); a.vline(7*PI/12,{color:C.coral});
        markPeriod(a,0.855);
        return a.svg(); },
        caption:'The result: two bands of height $\\tfrac12$, on $\\pi/12\\le\\omega\\le7\\pi/12$ and its mirror image, and the whole picture repeated every $2\\pi$.'}]}
  ]}
]},

/* ============================================================ summary */
{ id:'m6-tables', module:'M6', nav:'Property summary', title:'The properties in one place', src:'p. 76',
  objective:'Collect the properties and the transform pairs derived in this module.',
  keywords:'summary table properties pairs list reference linearity shift expansion convolution multiplication parseval', steps:2, blocks:[
  {t:'eyebrow', text:'Module 6 · Summary', src:'p. 76'},
  {t:'title', text:'Everything this module proved'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'sub', text:'Properties'},
    {t:'wex', rows:[
      ['Linearity','$a\\,x_1[n]+b\\,x_2[n]\\leftrightarrow a\\,X_1+b\\,X_2$'],
      ['Time shift','$x[n-n_0]\\leftrightarrow e^{-j\\omega n_0}X(e^{j\\omega})$'],
      ['Frequency shift','$e^{j\\omega_0n}x[n]\\leftrightarrow X(e^{j(\\omega-\\omega_0)})$'],
      ['Conjugation','$x^{*}[n]\\leftrightarrow X^{*}(e^{-j\\omega})$'],
      ['Time reversal','$x[-n]\\leftrightarrow X(e^{-j\\omega})$'],
      ['Time expansion','$x_{(k)}[n]\\leftrightarrow X(e^{jk\\omega})$'],
      ['Differencing in time','$x[n]-x[n-1]\\leftrightarrow(1-e^{-j\\omega})X(e^{j\\omega})$'],
      ['Differentiation in frequency','$n\\,x[n]\\leftrightarrow j\\,\\d X(e^{j\\omega})/\\d\\omega$'],
      ['Convolution','$x[n]*h[n]\\leftrightarrow X(e^{j\\omega})H(e^{j\\omega})$'],
      ['Multiplication','$x[n]y[n]\\leftrightarrow\\frac{1}{2\\pi}\\int_{2\\pi}X(e^{j\\theta})Y(e^{j(\\omega-\\theta)})\\d\\theta$'],
      ['Parseval','$\\sum_n|x[n]|^{2}=\\frac{1}{2\\pi}\\int_{2\\pi}|X(e^{j\\omega})|^{2}\\d\\omega$']
    ]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Two names that must not be exchanged', html:'<b>Differencing</b> is the time-domain operation $x[n]-x[n-1]$; <b>differentiation</b> is the frequency-domain derivative $\\d X/\\d\\omega$. The first is a difference because $n$ is an integer; the second is a genuine derivative because $\\omega$ is not.'}]}
  ], right:[
    {t:'sub', text:'Transform pairs'},
    {t:'wex', rows:[
      ['Unit sample','$\\delta[n]\\leftrightarrow1$'],
      ['Shifted sample','$\\delta[n-n_0]\\leftrightarrow e^{-j\\omega n_0}$'],
      ['One-sided exponential','$a^{n}u[n]\\leftrightarrow\\dfrac{1}{1-ae^{-j\\omega}}$, $|a|<1$'],
      ['Repeated pole','$(n+1)a^{n}u[n]\\leftrightarrow\\dfrac{1}{\\bigl(1-ae^{-j\\omega}\\bigr)^{2}}$, $|a|<1$'],
      ['Two-sided exponential','$a^{|n|}\\leftrightarrow\\dfrac{1-a^{2}}{1-2a\\cos\\omega+a^{2}}$, $|a|<1$'],
      ['Rectangular pulse','$x[n]=1$ on $|n|\\le N_1$ $\\leftrightarrow\\dfrac{\\sin(\\omega(N_1+\\frac12))}{\\sin(\\omega/2)}$'],
      ['Ideal low-pass band','$\\dfrac{\\sin(Wn)}{\\pi n}\\leftrightarrow1$ on $|\\omega|\\le W$, $0$ on $W<|\\omega|\\le\\pi$'],
      ['Constant','$1\\leftrightarrow2\\pi\\sum_k\\delta(\\omega-2\\pi k)$'],
      ['Complex exponential','$e^{j\\omega_0n}\\leftrightarrow2\\pi\\sum_k\\delta(\\omega-\\omega_0-2\\pi k)$'],
      ['Cosine','$\\cos\\omega_0n\\leftrightarrow\\pi\\sum_k[\\delta(\\omega-\\omega_0-2\\pi k)+\\delta(\\omega+\\omega_0-2\\pi k)]$'],
      ['Impulse train','$\\sum_k\\delta[n-kN]\\leftrightarrow\\dfrac{2\\pi}{N}\\sum_k\\delta\\bigl(\\omega-\\tfrac{2\\pi k}{N}\\bigr)$']
    ]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'The sinc convention, once more', html:'Where the ideal low-pass sequence is written with a sinc, the convention is the unnormalised one, $\\operatorname{sinc}\\theta=\\sin\\theta/\\theta$, so the pair reads $\\tfrac{W}{\\pi}\\operatorname{sinc}(Wn)$ with no $\\pi$ inside the argument. Any table using the other convention has a $\\pi$ there and different zero crossings.'}]},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Which domain is which', html:'A <b>periodic</b> sequence has a discrete set of coefficients; an <b>aperiodic</b> sequence has a continuous spectrum. Both spectra are periodic in $\\omega$ with period $2\\pi$, because time is discrete in both cases. Discreteness in one domain is periodicity in the other, and that single sentence organises the whole table.'}]}
  ]}
]},

/* ============================================================ duality */
{ id:'m6-duality', module:'M6', nav:'Duality', title:'Which dualities hold, and which does not', src:'p. 77',
  objective:'Rule out a DTFT self-duality and state the two dualities that do hold.',
  keywords:'duality DFS self dual DTFT CTFS coefficients x[-k] no duality analysis synthesis square wave', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Duality', src:'p. 77'},
  {t:'title', text:'A sum and an integral cannot swap places'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'note', kind:'err', head:'No duality inside the DTFT pair', html:'The analysis equation is a <b>sum</b> over an integer $n$; the synthesis equation is an <b>integral</b> over a continuous $\\omega$. The two have different shapes, so no relabelling turns one into the other. Every other transform in this course has such a duality; this one does not, and the reason is that its two domains are of different kinds.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'x[n]\\;\\longleftrightarrow\\;a_k\\qquad\\Longrightarrow\\qquad a[n]\\;\\longleftrightarrow\\;\\frac{1}{N}\\,x[-k]',
        label:'Duality in the discrete-time Fourier series',
        note:'Here both domains are discrete and both objects are periodic with the same period $N$, so the coefficients may be read as a sequence and transformed again.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'X(e^{j\\omega})=\\sum_{n=-\\infty}^{\\infty}x[n]e^{-j\\omega n}\\quad\\text{is a }2\\pi\\text{-periodic function of }\\omega',
        label:'Duality between the DTFT and the continuous-time series',
        note:'A $2\\pi$-periodic function of a continuous variable has a continuous-time Fourier series. Comparing the two synthesis equations term by term identifies its coefficients as $x[-k]$: the spectrum of a sequence is a periodic signal whose series coefficients are the sequence itself, reversed.'}]},
    {t:'reveal', at:3, items:[
      {t:'wex', rows:[
        ['Worked check','Take the $2\\pi$-periodic square wave in $\\omega$: $X(e^{j\\omega})=1$ for $|\\omega|\\le\\pi/2$, zero over the rest of the period.'],
        ['Its series coefficients','$a_k=\\dfrac{1}{2\\pi}\\displaystyle\\int_{-\\pi}^{\\pi}X(e^{j\\omega})e^{-jk\\omega}\\d\\omega=\\dfrac{\\sin(k\\pi/2)}{k\\pi}$: $a_0=0.5$, $a_1=1/\\pi=0.3183$, $a_2=0$, $a_3=-1/(3\\pi)=-0.1061$.'],
        ['And the sequence','Its inverse transform is $x[n]=\\sin(\\pi n/2)/(\\pi n)$, which is the same list of numbers. So $a_k=x[-k]$, and here $x$ is even so $a_k=x[k]$ as well.']
      ]}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:840,h:200,xr:[-3*PI,3*PI],yr:[-0.30,1.68],xlabel:'\\omega',ylabel:'X(e^{j\\omega})',
        pad:{l:62,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI/2),xtickfmt:piTick,ytarget:2});
      a.curve(w=>lpf(w,PI/2),{color:C.in,n:9000});
      markPeriod(a,1.28);
      return a.svg(); },
      caption:'A $2\\pi$-periodic square wave, read as a signal in the variable $\\omega$.'},
    {t:'reveal', at:3, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:210,xr:[-11,11],yr:[-0.22,0.68],xlabel:'k',ylabel:'a_k',
          pad:{l:62,r:30,t:30,b:34},xtarget:8,yticksOverride:[-0.1061,0,0.3183,0.5],ytickfmt:v=>v.toFixed(4)});
        a.stem(D(k=>lpfInv(k,PI/2),-11,11),{color:C.mid,showZero:true});
        return a.svg(); },
        caption:'Its continuous-time series coefficients: $0.5$, $0.3183$, $0$, $-0.1061$, … — the same numbers as the sequence whose transform it is.'}]},
    {t:'reveal', at:1, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:210,xr:[-24,24],yr:[-0.02,0.075],xlabel:'k',ylabel:'a_k',
          pad:{l:70,r:30,t:30,b:34},xtarget:8,yticksOverride:[0,1/21],ytickfmt:v=>v.toFixed(4)});
        a.stem(D(k=>k%21===0?1/21:0,-24,24),{color:C.h,showZero:true});
        return a.svg(); },
        caption:'The series duality at work: the impulse train with $N=21$ has coefficients all equal to $1/21=0.0476$, and reading those constants back as a sequence returns an impulse train.'}]}
  ]}
]},

/* ============================================================ frequency response */
{ id:'m6-freqresp', module:'M6', nav:'Difference equations', title:'The frequency response of a difference equation', src:'pp. 77–78',
  objective:'Transform a linear constant-coefficient difference equation into a ratio of polynomials.',
  keywords:'difference equation frequency response ratio polynomials e^{-j omega k} LCCDE transfer causal stable', steps:3, blocks:[
  {t:'eyebrow', text:'Module 6 · Systems', src:'pp. 77–78'},
  {t:'title', text:'From a recursion to a ratio'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:'A linear constant-coefficient difference equation relates the output to the input by a finite recursion:'},
    {t:'eq', tex:'\\sum_{k=0}^{N}a_k\\,y[n-k]=\\sum_{k=0}^{M}b_k\\,x[n-k]'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'Transform both sides. Linearity acts term by term, and each shift brings out one factor $e^{-j\\omega k}$:'},
      {t:'eq', size:'sm', tex:'Y(e^{j\\omega})\\sum_{k=0}^{N}a_k e^{-j\\omega k}=X(e^{j\\omega})\\sum_{k=0}^{M}b_k e^{-j\\omega k}'},
      {t:'eq', key:true, size:'lg', tex:'H(e^{j\\omega})=\\frac{Y(e^{j\\omega})}{X(e^{j\\omega})}=\\frac{\\displaystyle\\sum_{k=0}^{M}b_k e^{-j\\omega k}}{\\displaystyle\\sum_{k=0}^{N}a_k e^{-j\\omega k}}',
        label:'Frequency response of a difference equation'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'What has been gained', html:'The impulse response of the recursion is now available without ever running the recursion: factor the denominator, split into partial fractions, and invert each piece with the exponential pair. Every step is algebra.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'What the ratio does not settle', html:'A difference equation with the same coefficients has more than one solution; the ratio above picks out the one for which the transform exists. For the examples in this module that solution is the causal and stable one, and its poles all satisfy $|a|<1$ — the same condition each exponential pair needs.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>P.blocks({w:840,h:230,items:[
      {t:'arrow',x1:60,y1:110,x2:280,y2:110,color:'#14707F'},
      {t:'box',x:280,y:62,w:280,h:96,label:'\\dfrac{\\sum_k b_k e^{-j\\omega k}}{\\sum_k a_k e^{-j\\omega k}}',tex:true,fs:16},
      {t:'arrow',x1:560,y1:110,x2:780,y2:110,color:'#4A7A46'},
      {t:'text',x:165,y:92,label:'X(e^{j\\omega})',tex:true,fs:16,color:'#14707F'},
      {t:'text',x:670,y:92,label:'Y(e^{j\\omega})',tex:true,fs:16,color:'#4A7A46'},
      {t:'text',x:420,y:196,label:'\\text{one ratio of polynomials in }e^{-j\\omega}',tex:true,fs:15,color:C.slate}
    ]}), caption:'The recursion has become a single algebraic factor.'}
  ]}
]},

{ id:'m6-ex-diff', module:'M6', nav:'Worked example · second order', title:'Worked example — a second-order difference equation', src:'p. 78',
  objective:'Factor the denominator, run the partial fractions in z, and invert to the impulse response.',
  keywords:'worked example second order difference equation factor partial fractions A=4 B=-2 impulse response check', steps:4, blocks:[
  {t:'eyebrow', text:'Module 6 · Worked example', src:'p. 78'},
  {t:'title', text:'Two poles, two exponentials'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','$y[n]-\\tfrac34y[n-1]+\\tfrac18y[n-2]=2x[n]$.'],
      ['Find','The frequency response and the impulse response.'],
      ['Method','Read the ratio off the equation, factor the denominator in $z=e^{-j\\omega}$, expand, and invert term by term.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'eq', size:'sm', tex:'H(e^{j\\omega})=\\frac{2}{1-\\tfrac34e^{-j\\omega}+\\tfrac18e^{-j2\\omega}}=\\frac{2}{\\bigl(1-\\tfrac12e^{-j\\omega}\\bigr)\\bigl(1-\\tfrac14e^{-j\\omega}\\bigr)}',
        note:'Check the factoring by multiplying out: $\\tfrac12+\\tfrac14=\\tfrac34$ and $\\tfrac12\\cdot\\tfrac14=\\tfrac18$. Both coefficients match.'}]},
    {t:'reveal', at:2, items:[
      {t:'body', html:'Set $z=e^{-j\\omega}$ and expand $\\dfrac{2}{(1-\\tfrac12z)(1-\\tfrac14z)}=\\dfrac{A}{1-\\tfrac12z}+\\dfrac{B}{1-\\tfrac14z}$.'},
      {t:'eq', size:'sm', tex:'A=\\left.\\frac{2}{1-\\tfrac14z}\\right|_{z=2}=\\frac{2}{1-\\tfrac12}=4,\\qquad B=\\left.\\frac{2}{1-\\tfrac12z}\\right|_{z=4}=\\frac{2}{1-2}=-2'}]},
    {t:'reveal', at:3, items:[
      {t:'eq', key:true, size:'lg', tex:'h[n]=4\\left(\\tfrac12\\right)^{n}u[n]-2\\left(\\tfrac14\\right)^{n}u[n]',
        label:'Solution'}]},
    {t:'reveal', at:4, items:[
      {t:'wex', rows:[
        ['Values','$h[0]=4-2=2$, $h[1]=2-0.5=1.5$, $h[2]=1-0.125=0.875$.'],
        ['Check','Put these into the equation with $x[n]=\\delta[n]$: $h[0]=2$; $h[1]-\\tfrac34h[0]=1.5-1.5=0$; $h[2]-\\tfrac34h[1]+\\tfrac18h[0]=0.875-1.125+0.25=0$. The recursion is satisfied at every index.'],
        ['Reading','Both poles have modulus below 1, so both exponentials decay and the system is stable.']
      ]}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:840,h:210,xr:[-4,16],yr:[-0.30,2.60],xlabel:'n',ylabel:'h[n]',pad:{l:54,r:30,t:28,b:34},xtarget:8,
        yticksOverride:[0,0.875,1.5,2],ytickfmt:v=>v.toFixed(3)});
      a.stem(D(n=>n<0?0:4*Math.pow(0.5,n)-2*Math.pow(0.25,n),-4,16),{color:C.h,showZero:true});
      return a.svg(); },
      caption:'The impulse response. Its first three values are $2$, $1.5$ and $0.875$.'},
    {t:'reveal', at:1, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:230,xr:[-3*PI,3*PI],yr:[-0.75,6.6],xlabel:'\\omega',ylabel:'|H(e^{j\\omega})|',
          pad:{l:64,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI),xtickfmt:piTick,
          yticksOverride:[0,1.0667,5.3333],ytickfmt:v=>v.toFixed(4)});
        a.curve(w=>2*geoMag(w,0.5)*geoMag(w,0.25),{color:C.h,n:4000});
        markPeriod(a,5.72);
        return a.svg(); },
        caption:'Its frequency response, over three periods. The largest value is $5.3333$ at $\\omega=0$ and the smallest $1.0667$ at $\\omega=\\pm\\pi$: this recursion is a low-pass filter.'}]}
  ]}
]},

/* ============================================================ repeated pole */
{ id:'m6-ex-pair', module:'M6', nav:'The repeated-pole pair', title:'Deriving the repeated-pole pair', src:'p. 79',
  objective:'Derive (n+1)a^n u[n] by differentiating the geometric pair, giving the exponent and the sign a reason.',
  keywords:'repeated pole pair (n+1)a^n u[n] 1/(1-a e^{-j omega})^2 differentiate with respect to a exponent sign', steps:4, blocks:[
  {t:'eyebrow', text:'Module 6 · A pair worth deriving', src:'p. 79'},
  {t:'title', text:'The pair that closes the loop with $a=b$'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:'The convolution example needed $a\\neq b$, because both of its partial-fraction coefficients divide by $a-b$. What happens at $a=b$ is a separate pair, and it is worth deriving rather than quoting.'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'Start from the pair already proved, written as a series in $a$:'},
      {t:'eq', size:'sm', tex:'\\sum_{n=0}^{\\infty}a^{n}e^{-j\\omega n}=\\frac{1}{1-ae^{-j\\omega}},\\qquad |a|<1'},
      {t:'body', html:'Differentiate both sides with respect to $a$. The frequency $\\omega$ is a parameter here, so it goes along for the ride:'},
      {t:'eq', size:'sm', tex:'\\sum_{n=1}^{\\infty}n\\,a^{\\,n-1}e^{-j\\omega n}=\\frac{e^{-j\\omega}}{\\bigl(1-ae^{-j\\omega}\\bigr)^{2}}'}]},
    {t:'reveal', at:2, items:[
      {t:'body', html:'Put $m=n-1$ on the left and cancel one factor $e^{-j\\omega}$ from both sides:'},
      {t:'eq', key:true, size:'lg', tex:'\\sum_{m=0}^{\\infty}(m+1)a^{m}e^{-j\\omega m}=\\frac{1}{\\bigl(1-ae^{-j\\omega}\\bigr)^{2}}\\qquad\\Longleftrightarrow\\qquad (n+1)a^{n}u[n]\\;\\longleftrightarrow\\;\\frac{1}{\\bigl(1-ae^{-j\\omega}\\bigr)^{2}}',
        label:'Repeated-pole pair'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'Now both details have a reason', html:'The exponent is <b>2</b> because one differentiation of $(1-ae^{-j\\omega})^{-1}$ produces it, and nothing in the argument could produce any other number. The sign inside the bracket is <b>minus</b> because it was minus in the pair being differentiated, and differentiating with respect to $a$ does not touch it.'}]},
    {t:'reveal', at:4, items:[
      {t:'note', kind:'err', head:'Two ways this pair is misremembered', html:'Writing $\\bigl(1+ae^{-j\\omega}\\bigr)^{2}$ or $\\bigl(1-ae^{-j\\omega}\\bigr)^{n}$ both give the wrong function. One number settles it: at $\\omega=0$ with $a=\\tfrac14$, the correct value is $\\bigl(1-\\tfrac14\\bigr)^{-2}=\\tfrac{16}{9}=1.7778$, which is also $\\sum_{n\\ge0}(n+1)(\\tfrac14)^{n}$. A plus sign gives $\\bigl(\\tfrac54\\bigr)^{-2}=0.6400$, and an exponent $n$ makes the right-hand side depend on the time index, which no transform may do.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:840,h:210,xr:[-3,14],yr:[-0.20,1.45],xlabel:'n',ylabel:'x[n]',pad:{l:54,r:30,t:28,b:34},xtarget:8,ytarget:3});
      a.stem(D(n=>n<0?0:(n+1)*Math.pow(0.25,n),-3,14),{color:C.mid,showZero:true});
      a.note(3.4,1.05,'a=\\tfrac14',{tex:true,color:C.mid,fs:14});
      return a.svg(); },
      caption:'$(n+1)a^{n}u[n]$ with $a=\\tfrac14$. The factor $n+1$ lifts the early samples; the geometric decay wins from $n=1$ onwards.'},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:230,xr:[-3*PI,3*PI],yr:[-0.35,2.30],xlabel:'\\omega',ylabel:'|X(e^{j\\omega})|',
          pad:{l:64,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI),xtickfmt:piTick,
          yticksOverride:[0.64,1,1.7778],ytickfmt:v=>v.toFixed(4)});
        a.curve(w=>geoMag(w,0.25)**2,{color:C.in,n:4000});
        a.curve(w=>1/(1+2*0.25*Math.cos(w)+0.0625),{color:C.err,n:4000,width:1.4,dash:'5 4'});
        a.note(-9.2,1.98,'\\text{correct}',{tex:true,color:C.in,fs:13});
        a.note(-9.2,0.10,'\\text{sign reversed}',{tex:true,color:C.err,fs:13});
        markPeriod(a,1.96);
        return a.svg(); },
        caption:'The correct spectrum and the one a reversed sign would give. They peak at opposite ends of the period, and at $\\omega=0$ they differ by a factor of $2.78$.'}]}
  ]}
]},

{ id:'m6-ex-diff-b', module:'M6', nav:'Worked example · the output', title:'Worked example — the output of that system', src:'p. 79',
  objective:'Expand a transform with a repeated pole and assemble the output sequence.',
  keywords:'worked example output repeated pole partial fractions A=-4 B=-2 C=8 y[n] check convolution', steps:4, blocks:[
  {t:'eyebrow', text:'Module 6 · Worked example', src:'p. 79'},
  {t:'title', text:'A repeated pole, in a problem that produces one'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','The system $y[n]-\\tfrac34y[n-1]+\\tfrac18y[n-2]=2x[n]$, driven by $x[n]=\\left(\\tfrac14\\right)^{n}u[n]$.'],
      ['Find','$y[n]$.'],
      ['Method','Multiply the two transforms, expand in $z=e^{-j\\omega}$ — the factor $1-\\tfrac14z$ now appears twice — and invert with the two exponential pairs.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'eq', size:'sm', tex:'Y=H\\,X=\\frac{2}{\\bigl(1-\\tfrac12z\\bigr)\\bigl(1-\\tfrac14z\\bigr)}\\cdot\\frac{1}{1-\\tfrac14z}=\\frac{2}{\\bigl(1-\\tfrac12z\\bigr)\\bigl(1-\\tfrac14z\\bigr)^{2}}',
        note:'The input contributes a pole at the same place as one of the system poles, so the expansion needs both a simple and a squared term for it.'},
      {t:'eq', size:'sm', tex:'Y=\\frac{A}{1-\\tfrac14z}+\\frac{B}{\\bigl(1-\\tfrac14z\\bigr)^{2}}+\\frac{C}{1-\\tfrac12z}'}]},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['$C$','Cover up $1-\\tfrac12z$ and set $z=2$: $C=\\dfrac{2}{\\bigl(1-\\tfrac12\\bigr)^{2}}=8$.'],
        ['$B$','Cover up $\\bigl(1-\\tfrac14z\\bigr)^{2}$ and set $z=4$: $B=\\dfrac{2}{1-2}=-2$.'],
        ['$A$','Set $z=0$ in the whole identity: $2=A+B+C=A-2+8$, so $A=-4$.']
      ]}]},
    {t:'reveal', at:3, items:[
      {t:'eq', key:true, size:'lg', tex:'y[n]=-4\\left(\\tfrac14\\right)^{n}u[n]-2(n+1)\\left(\\tfrac14\\right)^{n}u[n]+8\\left(\\tfrac12\\right)^{n}u[n]',
        label:'Solution',
        note:'The middle term comes from the squared factor, using the pair derived in the previous scene.'}]},
    {t:'reveal', at:4, items:[
      {t:'wex', rows:[
        ['Values','$y[0]=-4-2+8=2$; $y[1]=-1-1+4=2$; $y[2]=1.375$; $y[3]=0.8125$.'],
        ['Check','$y[0]$ must equal $h[0]x[0]=2\\cdot1=2$ for two causal sequences, and it does. Convolving $h$ and $x$ directly reproduces the whole sequence.'],
        ['Reading','Without the repeated-pole pair the middle term cannot be inverted at all, which is why the two scenes belong together.']
      ]}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:840,h:220,xr:[-3,16],yr:[-0.30,2.70],xlabel:'n',ylabel:'y[n]',pad:{l:54,r:30,t:28,b:34},xtarget:8,
        yticksOverride:[0,0.8125,1.375,2],ytickfmt:v=>v.toFixed(4)});
      const y=n=>n<0?0:-4*Math.pow(0.25,n)-2*(n+1)*Math.pow(0.25,n)+8*Math.pow(0.5,n);
      a.stem(D(y,-3,16),{color:C.out,showZero:true});
      return a.svg(); },
      caption:'The output. It holds the value 2 for two samples and then decays like $\\left(\\tfrac12\\right)^{n}$, which is the slower of the two poles.'},
    {t:'reveal', at:1, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:230,xr:[-3*PI,3*PI],yr:[-0.95,8.8],xlabel:'\\omega',ylabel:'|Y(e^{j\\omega})|',
          pad:{l:64,r:30,t:30,b:38},xticksOverride:wTicks(-3*PI,3*PI,PI),xtickfmt:piTick,
          yticksOverride:[0,0.8533,7.1111],ytickfmt:v=>v.toFixed(4)});
        a.curve(w=>2*geoMag(w,0.5)*geoMag(w,0.25)**2,{color:C.out,n:4000});
        markPeriod(a,7.62);
        return a.svg(); },
        caption:'Its spectrum: largest value $7.1111$ at $\\omega=0$, smallest $0.8533$ at $\\omega=\\pm\\pi$, and the picture repeated every $2\\pi$.'}]}
  ]}
]},

/* ============================================================ laboratory */
{ id:'m6-lab-i', module:'M6', nav:'Laboratory I · Periodicity', title:'Laboratory I — DTFT Periodicity Explorer', src:'pp. 65–79',
  objective:'See a sequence and its spectrum together, over more than one period, at every step.',
  keywords:'laboratory I DTFT periodicity explorer sequences magnitude phase shift wrap difference equation pole radius', steps:0, blocks:[
  {t:'eyebrow', text:'Interactive laboratory I', src:'pp. 65–79'},
  {t:'title', text:'One period is never the whole picture'},
  {t:'lede', text:'Choose a sequence and a parameter. The panels show the sequence as stems and its transform over three periods of $2\\pi$, with one period marked. The frequency-shift state slides the spectrum and lets what leaves a period come back at the other end.'},
  {t:'lab', id:'I'}
]},

/* ============================================================ question bank */
{ id:'m6-qbank', module:'M6', nav:'Module 6 question bank', title:'Module 6 — question bank', src:'pp. 64–79',
  objective:'Twelve questions covering Module 6 outcomes.',
  keywords:'questions quiz Q6 bank module 6 exercises discrete time fourier transform', steps:0, blocks:[
  {t:'eyebrow', text:'Module 6 · Question bank Q6-01 … Q6-12', src:'pp. 64–79'},
  {t:'title', text:'Question bank'},
  {t:'small', html:'Everything needed is in Modules 1–6. Several questions test whether the spectrum is being read as periodic; several test whether a continuous-time pair or property is being carried into a discrete-time problem.'},
  {t:'qbank', module:'M6'}
]},

/* ============================================================ synthesis */
{ id:'m6-synth', module:'M6', nav:'Module 6 synthesis', title:'Module 6 — what to carry forward', src:'pp. 64–79',
  dark:true, objective:'Consolidate the module and open the question Module 7 answers.',
  keywords:'synthesis summary module 6 checklist sampling preview periodicity carried forward', steps:2, blocks:[
  {t:'eyebrow', text:'Module 6 · Synthesis', src:'pp. 64–79'},
  {t:'title', level:1, text:'Discrete time makes<br>frequency a circle.'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'lede', text:'The frequency axis of a sequence is not a line. Move along it by $2\\pi$ and you are back where you started, so every spectrum in this module was drawn over more than one period with the period marked.'},
    {t:'note', kind:'ok', head:'Carry these forward', html:'<span style="color:var(--graphite)">The pair, with analysis as the sum and synthesis as the integral over one period. The $2\\pi$-periodicity and its one-line proof. Real means phase $0$ or $\\pi$, not phase zero. Multiplication in time is a <b>periodic</b> convolution. The unnormalised sinc, $\\operatorname{sinc}\\theta=\\sin\\theta/\\theta$. And discrete time has a difference, not a derivative.</span>'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'Three habits that fail here', html:'<span style="color:var(--graphite)">Reading a spectrum as though it stopped at $\\pm\\pi$. Taking the multiplication property as an integral over all frequencies. And using a continuous-time transform pair on a discrete-time problem, or the reverse — the two have different periodicity, a different scale factor and a different integration range.</span>'}]}
  ], right:[
    {t:'fig', svg:()=>{
      const a=P.Axes({w:800,h:300,xr:[-3*PI,3*PI],yr:[-1.1,6.4],grid:false,zeroAxes:false,arrows:false,
        pad:{l:24,r:24,t:24,b:24},xticksOverride:[],yticksOverride:[]});
      a.curve(w=>dirich(wrap(w),2),{color:'#7FC3CE',width:2.4,n:6000});
      for(const m of [-3,-1,1,3]) a.vline(m*PI,{color:'#6D7F8C',dash:'2 6',opacity:.8});
      return a.svg(); },
      caption:'One spectrum, three periods, and the same information in each of them.'},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'What comes next', html:'<span style="color:var(--graphite)">A sequence usually comes from somewhere: a continuous-time signal, read at regular instants. Module 7 asks what that reading costs. The answer is written in copies of a spectrum, spaced by the sampling frequency — and this module has already shown what happens when copies of a spectrum are allowed to meet.</span>'}]}
  ]}
]}

];

window.SCENES_M6 = SC;
})();
