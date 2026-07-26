/* ==========================================================================
   Module 4 — Fourier Series  [Source: 22–41]
   ========================================================================== */
(function(){
const P = PLOT, C = P.COL;

/* stems over an integer range */
const D = (f,a,b)=>{const o=[];for(let n=Math.ceil(a);n<=b;n++)o.push([n,f(n)]);return o;};

/* the periodic rectangular wave of this module: 1 on |t| < T1, zero to T/2 */
const rectWave = (t,T,T1)=>{ let u = t - T*Math.round(t/T); return Math.abs(u) < T1 ? 1 : 0; };
/* its partial sum, built from the coefficients this module derives */
const rectPS = (t,N,T,T1)=>{ let s = 2*T1/T;
  for(let k=1;k<=N;k++) s += 2*Math.sin(2*Math.PI*k*T1/T)/(Math.PI*k)*Math.cos(2*Math.PI*k*t/T);
  return s; };
/* the sawtooth of this module: x(t) = t on -T/2 < t < T/2, repeated */
const sawWave = (t,T)=>{ let u = t - T*Math.round(t/T); return u; };
const sawPS = (t,N,T)=>{ let s = 0;
  for(let k=1;k<=N;k++) s += -(T/(k*Math.PI))*Math.cos(k*Math.PI)*Math.sin(2*Math.PI*k*t/T);
  return s; };
/* discrete-time rectangular wave coefficients, both branches */
const dtRect = (k,N,N1)=>{ const r = k/N;
  if(Math.abs(r - Math.round(r)) < 1e-12) return (2*N1+1)/N;
  return Math.sin(2*Math.PI*k*(N1+0.5)/N)/(N*Math.sin(Math.PI*k/N)); };

Object.assign(CONTENT.GLOSS, {
  ak:{ s:'a_k', d:'Fourier series coefficient of harmonic index k. It is a complex number: |a_k| is the amplitude of the k-th harmonic and ∠a_k is its phase.', go:'m4-fs-synth' },
  bk:{ s:'b_k', d:'Fourier series coefficient of the output of a linear time-invariant system, b_k = a_k H(jkω₀).', go:'m4-lti' },
  Hs:{ s:'H(s)', d:'Transfer function of a continuous-time linear time-invariant system: the eigenvalue attached to the eigenfunction e^{st}.', go:'m4-eigen-ct' },
  Hz:{ s:'H(z)', d:'Transfer function of a discrete-time linear time-invariant system: the eigenvalue attached to the eigenfunction zⁿ.', go:'m4-eigen-dt' },
  Hjw:{ s:'H(j\\omega)', d:'Frequency response of a continuous-time system, H(s) evaluated at s = jω. It reports what the system does to the complex exponential of angular frequency ω rad/s.', go:'m4-lti' },
  Hejw:{ s:'H(e^{j\\omega})', d:'Frequency response of a discrete-time system, H(z) evaluated at z = e^{jω}. It is periodic in ω with period 2π.', go:'m4-dt-filt' },
  eigen:{ s:'\\text{eigenfunction}', d:'A signal that a system returns unchanged in shape, scaled by a constant. For every linear time-invariant system the complex exponentials are the eigenfunctions.', go:'m4-eigen-ct' },
  mse:{ s:'\\text{MSE}', d:'Mean-square error between a signal and a truncated Fourier series, averaged over one period.', go:'m4-howmany' }
});

const SC = [

{ id:'m4-open', module:'M4', nav:'Module 4 opening', title:'Fourier Series', src:'pp. 22–41',
  dark:true, keywords:'module 4 fourier series harmonics eigenfunction overview periodic', steps:0, blocks:[
  {t:'eyebrow', text:'Module 4 · Fourier Series', src:'pp. 22–41'},
  {t:'title', level:1, text:'One family of signals<br>that every system leaves alone.'},
  {t:'lede', text:'A linear time-invariant system returns a complex exponential unchanged in shape, scaled by a single number. Write a periodic signal as a sum of complex exponentials and the hardest operation in Module 3 becomes multiplication.'},
  {t:'cols', ratio:'c-5-7', left:[
    {t:'raw', html:`<div style="margin-top:16px">
      <div style="font-family:var(--mono);font-size:12.5px;letter-spacing:.14em;color:#8FA8BF;margin-bottom:10px">THE ENTIRE MODULE, IN TWO LINES</div></div>`},
    {t:'eq', tex:'x(t)=\\sum_{k=-\\infty}^{\\infty}a_k\\,e^{jk\\omega_0 t}', label:'Synthesis'},
    {t:'eq', tex:'a_k=\\frac{1}{T_0}\\int_{T_0}x(t)\\,e^{-jk\\omega_0 t}\\,\\d t', label:'Analysis'},
    {t:'note', kind:'ok', head:'What this buys', html:'<span style="color:#DED5C6">Convolution with the impulse response becomes one multiplication per harmonic. The system is described by how it treats each frequency, and nothing else.</span>'}
  ], right:[
    {t:'fig', svg:()=>{
      const a=P.Axes({w:800,h:430,xr:[-4,4],yr:[-0.35,4.1],grid:false,zeroAxes:false,arrows:false,
        pad:{l:20,r:20,t:20,b:20},xticksOverride:[],yticksOverride:[]});
      a.curve(t=>rectWave(t,4,1)+3,{color:'#7FC3CE',width:2.4,n:2400});
      a.curve(t=>rectPS(t,1,4,1)+2,{color:'#AC99DC',width:2.2});
      a.curve(t=>rectPS(t,5,4,1)+1,{color:'#E5B255',width:2.2});
      a.curve(t=>rectPS(t,25,4,1),{color:'#8FBF8A',width:2.2,n:2400});
      return a.svg(); }}
  ]}
]},

{ id:'m4-eigen-ct', module:'M4', nav:'Eigenfunctions · continuous time', title:'Complex exponentials pass through unchanged', src:'p. 22',
  objective:'Derive the eigenfunction property in continuous time and name the eigenvalue.',
  keywords:'eigenfunction eigenvalue complex exponential transfer function H(s) laplace continuous', steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Foundation', src:'p. 22'},
  {t:'title', text:'One input shape the system cannot change'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'note', kind:'def', head:'Definition', html:'A signal is an <b>{{sym:eigen|eigenfunction}}</b> of a system when the output is the same signal multiplied by a constant. That constant is the <b>eigenvalue</b>.'},
    {t:'body', html:'Put $x(t)=e^{st}$, with $s$ any complex number, into the convolution integral of Module 3:'},
    {t:'reveal', at:1, items:[
      {t:'eq', size:'sm', tex:'y(t)=\\int_{-\\infty}^{\\infty}h(\\tau)\\,e^{s(t-\\tau)}\\,\\d\\tau=e^{st}\\underbrace{\\int_{-\\infty}^{\\infty}h(\\tau)\\,e^{-s\\tau}\\,\\d\\tau}_{\\text{a number, not a signal}}',
        note:'The factor $e^{st}$ does not depend on $\\tau$, so it comes out of the integral. What is left is a number that depends on $s$ alone.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, size:'lg', tex:'e^{st}\\;\\to\\;h(t)\\;\\to\\;H(s)\\,e^{st},\\qquad H(s)=\\int_{-\\infty}^{\\infty}h(\\tau)\\,e^{-s\\tau}\\,\\d\\tau',
        label:'Eigenfunction property, continuous time',
        note:'{{sym:Hs|$H(s)$}} is the <b>transfer function</b> of the system. The shape of the input survives; only its size and phase change.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'Write the limits', html:'Both integrals run over all time, $-\\infty$ to $\\infty$. A convolution or transform integral written with a bare $\\int$ leaves the reader to guess, and the guess is wrong as soon as a one-sided signal appears.'},
      {t:'note', kind:'ok', head:'The case that matters most', html:'Take $s=j\\omega$ with $\\omega$ real. Then $x(t)=e^{j\\omega t}$ is a periodic complex exponential and<br>$H(j\\omega)=\\int_{-\\infty}^{\\infty}h(\\tau)e^{-j\\omega\\tau}\\d\\tau$ is the <b>frequency response</b>.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>P.blocks({w:820,h:180,items:[
      {t:'arrow',x1:90,y1:95,x2:310,y2:95},
      {t:'box',x:310,y:60,w:180,h:70,label:'h(t)',tex:true,fs:18},
      {t:'arrow',x1:490,y1:95,x2:720,y2:95},
      {t:'text',x:200,y:78,label:'e^{st}',tex:true,fs:18,color:'#14707F'},
      {t:'text',x:200,y:130,label:'eigenfunction',fs:12},
      {t:'text',x:605,y:78,label:'H(s)\\,e^{st}',tex:true,fs:18,color:'#4A7A46'},
      {t:'text',x:605,y:130,label:'same shape',fs:12}
    ]}), caption:'The system multiplies by a complex constant. It does not reshape, delay differently or spread the signal.'},
    {t:'reveal', at:2, items:[
      {t:'grid', cols:2, gap:'16px', items:[
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:420,h:210,xr:[0,8],yr:[-1.4,1.4],xlabel:'t',ylabel:'\\operatorname{Re}\\{x(t)\\}',pad:{l:46,r:20,t:22,b:34},xtarget:5,ytarget:3});
          a.curve(t=>Math.cos(2*t),{color:C.in}); return a.svg(); },
          caption:'Input, $\\operatorname{Re}\\{e^{j2t}\\}$.'}],
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:420,h:210,xr:[0,8],yr:[-1.4,1.4],xlabel:'t',ylabel:'\\operatorname{Re}\\{y(t)\\}',pad:{l:46,r:20,t:22,b:34},xtarget:5,ytarget:3});
          a.curve(t=>0.6*Math.cos(2*t-0.9),{color:C.out}); return a.svg(); },
          caption:'Output. Same frequency, new amplitude and phase.'}]
      ]}]}
  ]}
]},

{ id:'m4-eigen-dt', module:'M4', nav:'Eigenfunctions · discrete time', title:'The discrete-time statement', src:'p. 23',
  objective:'Derive the discrete-time eigenfunction property and keep it separate from the continuous-time one.',
  keywords:'discrete eigenfunction z^n transfer function H(z) DTFT frequency response', steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Foundation', src:'p. 23'},
  {t:'title', text:'The same argument, with a sum'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:'In discrete time the eigenfunction is a geometric sequence, $x[n]=z^{n}$, with $z$ any complex number. Put it into the convolution sum:'},
    {t:'eq', size:'sm', tex:'y[n]=\\sum_{k=-\\infty}^{\\infty}h[k]\\,z^{\\,n-k}=z^{n}\\underbrace{\\sum_{k=-\\infty}^{\\infty}h[k]\\,z^{-k}}_{\\text{a number}}'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, size:'lg', tex:'z^{n}\\;\\to\\;h[n]\\;\\to\\;H(z)\\,z^{n},\\qquad H(z)=\\sum_{k=-\\infty}^{\\infty}h[k]\\,z^{-k}',
        label:'Eigenfunction property, discrete time',
        note:'{{sym:Hz|$H(z)$}} is the transfer function of the discrete-time system.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Keep the two statements apart', html:'The discrete-time output is a <b>sequence</b>: $y[n]=H(z)z^{n}$. Writing $y(t)=H(s)e^{st}$ on this line carries the continuous-time result into a discrete-time argument, where no $t$ and no $s$ exist. The block diagram below is the check: what enters is $z^{n}$, so what leaves must be a multiple of $z^{n}$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'The periodic case', html:'Take $z=e^{j\\omega}$ with $\\omega$ real. Then $x[n]=e^{j\\omega n}$ and<br>$H(e^{j\\omega})=\\sum_{k=-\\infty}^{\\infty}h[k]e^{-j\\omega k}$ is the discrete-time frequency response. It repeats every $2\\pi$ in $\\omega$, because $e^{j(\\omega+2\\pi)k}=e^{j\\omega k}$ for integer $k$.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>P.blocks({w:820,h:180,items:[
      {t:'arrow',x1:90,y1:95,x2:310,y2:95},
      {t:'box',x:310,y:60,w:180,h:70,label:'h[n]',tex:true,fs:18},
      {t:'arrow',x1:490,y1:95,x2:720,y2:95},
      {t:'text',x:200,y:78,label:'z^{n}',tex:true,fs:18,color:'#14707F'},
      {t:'text',x:200,y:130,label:'eigenfunction',fs:12},
      {t:'text',x:605,y:78,label:'H(z)\\,z^{n}',tex:true,fs:18,color:'#4A7A46'},
      {t:'text',x:605,y:130,label:'same sequence',fs:12}
    ]}), caption:'A sequence enters and a sequence leaves. Nothing in this diagram is a function of a continuous variable.'},
    {t:'reveal', at:3, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:250,xr:[-2,14],yr:[-1.35,1.35],xlabel:'n',ylabel:'\\operatorname{Re}\\{e^{j\\omega n}\\}',pad:{l:52,r:24,t:24,b:34},xtarget:8,ytarget:3});
        a.stem(D(n=>Math.cos(0.6*n),-2,14),{color:C.in});
        a.curve(t=>Math.cos(0.6*t),{color:C.in,width:1,dash:'3 5',opacity:.45});
        return a.svg(); },
        caption:'A discrete-time complex exponential is a sampled sequence, not a curve. The dashed line is drawn only to show which samples belong together.'}]}
  ]}
]},

{ id:'m4-eigen-why', module:'M4', nav:'Why eigenfunctions matter', title:'Why this one property is worth a whole module', src:'p. 24',
  objective:'Show that a linear combination of eigenfunctions needs no convolution.',
  keywords:'linear combination superposition eigenvalue transfer function no convolution', steps:2, blocks:[
  {t:'eyebrow', text:'Module 4 · Motivation', src:'p. 24'},
  {t:'title', text:'No convolution, only bookkeeping'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'Suppose the input is a sum of complex exponentials, $x(t)=a_1e^{s_1t}+a_2e^{s_2t}+a_3e^{s_3t}$. Each term is an eigenfunction, so linearity finishes the problem at once:'},
    {t:'eq', tex:'y(t)=a_1H(s_1)e^{s_1t}+a_2H(s_2)e^{s_2t}+a_3H(s_3)e^{s_3t}'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'x(t)=\\sum_{k=-\\infty}^{\\infty}a_k e^{s_kt}\\;\\longrightarrow\\;y(t)=\\sum_{k=-\\infty}^{\\infty}a_k H(s_k)\\,e^{s_kt}',
        note:'The same statement in discrete time is $x[n]=\\sum_k a_k z_k^{\\,n}\\to y[n]=\\sum_k a_k H(z_k)z_k^{\\,n}$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'The one question left', html:'Everything now depends on writing $x$ as a linear combination of complex exponentials. That is what the rest of this module does, for periodic signals.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>P.blocks({w:840,h:260,items:[
      {t:'text',x:50,y:44,label:'a_1e^{s_1t}',anchor:'start',tex:true,fs:16,color:'#14707F'},
      {t:'arrow',x1:170,y1:38,x2:330,y2:38},{t:'box',x:330,y:16,w:120,h:44,label:'H(s)',tex:true},
      {t:'arrow',x1:450,y1:38,x2:590,y2:38},
      {t:'text',x:640,y:44,label:'a_1H(s_1)e^{s_1t}',anchor:'start',tex:true,fs:16,color:'#4A7A46'},
      {t:'text',x:50,y:134,label:'a_2e^{s_2t}',anchor:'start',tex:true,fs:16,color:'#14707F'},
      {t:'arrow',x1:170,y1:128,x2:330,y2:128},{t:'box',x:330,y:106,w:120,h:44,label:'H(s)',tex:true},
      {t:'arrow',x1:450,y1:128,x2:590,y2:128},
      {t:'text',x:640,y:134,label:'a_2H(s_2)e^{s_2t}',anchor:'start',tex:true,fs:16,color:'#4A7A46'},
      {t:'text',x:50,y:224,label:'a_3e^{s_3t}',anchor:'start',tex:true,fs:16,color:'#14707F'},
      {t:'arrow',x1:170,y1:218,x2:330,y2:218},{t:'box',x:330,y:196,w:120,h:44,label:'H(s)',tex:true},
      {t:'arrow',x1:450,y1:218,x2:590,y2:218},
      {t:'text',x:640,y:224,label:'a_3H(s_3)e^{s_3t}',anchor:'start',tex:true,fs:16,color:'#4A7A46'}
    ]}), caption:'Every rung is settled by one multiplication. Superposition then adds the rungs.'}
  ]}
]},

{ id:'m4-eigen-ex', module:'M4', nav:'Worked example · a pure delay', title:'Worked example — a pure delay', src:'pp. 24–25',
  objective:'Work the delay example through the eigenfunction route and verify it directly.',
  keywords:'worked example delay y(t)=x(t-3) sifting transfer function cosine expansion verify', steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Worked example', src:'pp. 24–25'},
  {t:'title', text:'A delay, settled without convolving'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','An LTI system with $y(t)=x(t-3)$: a pure delay of three seconds.'],
      ['Find','The output for $x(t)=e^{j2t}$, and then for $x(t)=\\cos(4t)+\\cos(7t)$, using eigenfunctions only.'],
      ['Method','Get $h$ from the definition, get $H(s)$ from $h$, then read the output off the eigenfunction property.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'eq', size:'sm', tex:'h(t)=\\delta(t-3),\\qquad H(s)=\\int_{-\\infty}^{\\infty}\\delta(\\tau-3)e^{-s\\tau}\\,\\d\\tau=e^{-3s}',
        note:'The second step is the sifting property of Module 1.'},
      {t:'eq', key:true, tex:'e^{j2t}\\;\\to\\;H(j2)\\,e^{j2t}=e^{-3(j2)}e^{j2t}=e^{j2(t-3)}', label:'Solution, first input'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', size:'sm', tex:'\\cos(4t)=\\tfrac12 e^{j4t}+\\tfrac12 e^{-j4t},\\qquad \\cos(7t)=\\tfrac12 e^{j7t}+\\tfrac12 e^{-j7t}'},
      {t:'eq', key:true, tex:'y(t)=\\cos\\bigl(4(t-3)\\bigr)+\\cos\\bigl(7(t-3)\\bigr)', label:'Solution, second input'}]},
    {t:'reveal', at:3, items:[
      {t:'wex', rows:[
        ['Check','Apply the rule $y(t)=x(t-3)$ directly to each input. Both answers agree, which is what the eigenfunction route had to reproduce.'],
        ['Reading','$|H(j\\omega)|=1$ at every frequency and $\\angle H(j\\omega)=-3\\omega$. A delay changes no amplitude; it adds a phase proportional to frequency.']
      ]}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>P.blocks({w:840,h:150,items:[
      {t:'arrow',x1:90,y1:80,x2:320,y2:80},
      {t:'box',x:320,y:52,w:190,h:58,label:'\\delta(t-3)',tex:true,fs:17},
      {t:'arrow',x1:510,y1:80,x2:750,y2:80},
      {t:'text',x:205,y:62,label:'x(t)',tex:true,fs:16,color:'#14707F'},
      {t:'text',x:630,y:62,label:'y(t)=x(t-3)',tex:true,fs:16,color:'#4A7A46'}
    ]}), caption:'The impulse response of a pure delay is an impulse, moved.'},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:250,xr:[-1,9],yr:[-3.3,3.0],xlabel:'t',pad:{l:50,r:24,t:24,b:34},xtarget:7,ytarget:3});
        a.curve(t=>Math.cos(4*t)+Math.cos(7*t),{color:C.in,n:1600});
        a.curve(t=>Math.cos(4*(t-3))+Math.cos(7*(t-3)),{color:C.out,n:1600});
        a.note(8.8,2.62,'x(t)',{anchor:'end',color:C.in,fs:15,tex:true});
        a.note(8.8,-2.75,'y(t)',{anchor:'end',color:C.out,fs:15,tex:true});
        return a.svg(); },
        caption:'The output is the input moved three seconds to the right. Every harmonic is delayed by the same three seconds, which is why the shape survives.'}]}
  ]}
]},

{ id:'m4-fs-exist', module:'M4', nav:'When a series exists', title:'Which signals can be written this way', src:'pp. 25–26',
  objective:'State the three Dirichlet conditions and show one signal violating each.',
  keywords:'dirichlet conditions absolutely integrable bounded variation discontinuities pathological existence', steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Existence', src:'pp. 25–26'},
  {t:'title', text:'Three conditions, three counterexamples'},
  {t:'cols', ratio:'c-5-7', left:[
    {t:'body', html:'Not every signal can be decomposed into complex exponentials. Periodic signals can, provided they meet three conditions. Let $x(t)=x(t+T)$ for every $t$.'},
    {t:'note', kind:'def', head:'Condition 1 — absolutely integrable', html:'Over one period, $\\displaystyle\\int_{T}|x(t)|\\,\\d t<\\infty$.'},
    {t:'note', kind:'def', head:'Condition 2 — bounded variation', html:'In any finite interval, $x$ has only a finite number of maxima and minima.'},
    {t:'note', kind:'def', head:'Condition 3 — finite jumps', html:'In any finite interval, $x$ has only a finite number of discontinuities, and each one is finite.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'They are sufficient, not necessary', html:'A signal meeting all three has a Fourier series that converges to it wherever $x$ is continuous, and to the midpoint of the jump at a discontinuity. A signal failing one of them may still have a series; the conditions guarantee, they do not exclude.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'The conditions are independent', html:'The second signal below satisfies Condition 1 and fails Condition 2. The third satisfies Conditions 1 and 2 and fails Condition 3. No one of them implies another.'}]},
    {t:'reveal', at:3, items:[
      {t:'small', html:'Every signal used in the rest of this module — square waves, sawtooths, impulse trains, sums of sinusoids — meets all three. The counterexamples are here so that the conditions are read as statements about signals rather than as ritual.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:800,h:190,xr:[0,4],yr:[-4,42],xlabel:'t',pad:{l:56,r:24,t:22,b:34},xtarget:5,ytarget:3});
      a.curve(t=>{const u=t-Math.floor(t); return u<1e-4?NaN:1/u;},{color:C.err,n:3000});
      return a.svg(); },
      caption:'$x_1(t)=1/t$ on each period. The area under one period is infinite, so <b>Condition 1</b> fails.'},
    {t:'reveal', at:1, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:800,h:190,xr:[0,4],yr:[-1.4,1.4],xlabel:'t',pad:{l:56,r:24,t:22,b:34},xtarget:5,ytarget:3});
        a.curve(t=>{const u=t-Math.floor(t); return u<1e-4?0:Math.sin(2*Math.PI/u);},{color:C.err,n:6000});
        return a.svg(); },
        caption:'$x_2(t)=\\sin(2\\pi/t)$ on each period. Its area is finite, but it oscillates infinitely often near the start of the period, so <b>Condition 2</b> fails.'}]},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:800,h:190,xr:[0,16],yr:[-0.2,1.3],xlabel:'t',pad:{l:56,r:24,t:22,b:34},xtarget:5,ytarget:3});
        a.curve(t=>{ let u=t-8*Math.floor(t/8); let v=1, w=4;
          for(let i=0;i<9;i++){ if(u<w) return v; v/=2; u-=w; w/=2; } return 0; },{color:C.err,n:6000});
        return a.svg(); },
        caption:'A staircase whose steps halve in height and in width. Its area is finite and it never oscillates, but it has infinitely many jumps in one period, so <b>Condition 3</b> fails.'}]}
  ]}
]},

{ id:'m4-fs-synth', module:'M4', nav:'Synthesis equation', title:'Writing a periodic signal as harmonics', src:'pp. 26–27',
  objective:'State the synthesis equation and read the coefficients off a sum of sinusoids.',
  keywords:'synthesis equation harmonic component a_k euler worked example DC term average', steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · The representation', src:'pp. 26–27'},
  {t:'title', text:'Every harmonic gets one number'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'eq', key:true, size:'lg', tex:'x(t)=\\sum_{k=-\\infty}^{\\infty}a_k\\,e^{jk\\omega_0 t},\\qquad \\omega_0=\\frac{2\\pi}{T_0}',
      label:'Synthesis equation',
      note:'The term $\\phi_k(t)=e^{jk\\omega_0t}$ is the $k$-th <b>harmonic component</b>. The complex numbers {{sym:ak|$a_k$}} are the Fourier series coefficients.'},
    {t:'reveal', at:1, items:[
      {t:'wex', rows:[
        ['Given','$x(t)=1+\\tfrac12\\cos(2\\pi t)+\\sin(3\\pi t)$.'],
        ['Find','The Fourier series coefficients, their magnitudes and their phases.'],
        ['Method','Find $T_0$, hence $\\omega_0$. Rewrite every term with Euler’s relations, then match each exponent against $jk\\omega_0t$ and read off $k$.']
      ]}]},
    {t:'reveal', at:2, items:[
      {t:'small', html:'The component periods are $1$ and $2/3$ seconds, and the next scene shows why they combine to $T_0=2$ s. So $\\omega_0=2\\pi/T_0=\\pi$ rad/s.'},
      {t:'eq', size:'sm', tex:'x(t)=\\underbrace{1\\,e^{j0\\omega_0t}}_{k=0}+\\underbrace{\\tfrac14 e^{j2\\omega_0t}}_{k=2}+\\underbrace{\\tfrac14 e^{-j2\\omega_0t}}_{k=-2}+\\underbrace{\\tfrac{1}{2j}e^{j3\\omega_0t}}_{k=3}\\underbrace{-\\tfrac{1}{2j}e^{-j3\\omega_0t}}_{k=-3}',
        note:'$\\cos\\theta=\\tfrac12(e^{j\\theta}+e^{-j\\theta})$ and $\\sin\\theta=\\tfrac{1}{2j}(e^{j\\theta}-e^{-j\\theta})$.'}]},
    {t:'reveal', at:3, items:[
      {t:'eq', key:true, tex:'a_0=1,\\qquad a_2=a_{-2}=\\tfrac14,\\qquad a_3=\\frac{1}{2j},\\qquad a_{-3}=-\\frac{1}{2j},\\qquad a_k=0\\ \\text{otherwise}',
        label:'Solution'},
      {t:'note', kind:'err', head:'Read the constant term as a harmonic', html:'The constant $1$ is the $k=0$ term, $1\\cdot e^{j0\\omega_0t}$, so $a_0=1$. Reporting $a_0=0$ here contradicts both the expansion above and the stem of height 1 at $k=0$ in the plot. The next scene gives the general reading: $a_0$ is the average value of $x$ over one period, and the average of this signal is 1.'}]},
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:220,xr:[-4,4],yr:[-1.1,2.6],xlabel:'t',ylabel:'x(t)',pad:{l:52,r:24,t:24,b:34},xtarget:7,ytarget:3});
      a.curve(t=>1+0.5*Math.cos(2*Math.PI*t)+Math.sin(3*Math.PI*t),{color:C.in,n:2000});
      return a.svg(); },
      caption:'The signal. It repeats every 2 seconds.'},
    {t:'reveal', at:3, items:[
      {t:'grid', cols:2, gap:'16px', items:[
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:220,xr:[-4,4],yr:[-0.15,1.25],xlabel:'k',ylabel:'|a_k|',pad:{l:50,r:18,t:24,b:32},xtarget:5,ytarget:3});
          a.stem(D(k=>k===0?1:(Math.abs(k)===2?0.25:(Math.abs(k)===3?0.5:0)),-4,4),{color:C.in}); return a.svg(); }}],
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:220,xr:[-4,4],yr:[-2.0,2.0],xlabel:'k',ylabel:'\\angle a_k\\;[\\text{rad}]',pad:{l:56,r:18,t:24,b:32},xtarget:5,
            yticksOverride:[-Math.PI/2,0,Math.PI/2],ytickfmt:v=>v.toFixed(2)});
          a.stem(D(k=>k===3?-Math.PI/2:(k===-3?Math.PI/2:0),-4,4),{color:C.mid,showZero:true}); return a.svg(); }}]
      ]},
      {t:'small', html:'$|a_0|=1$, $|a_{\\pm2}|=1/4$, $|a_{\\pm3}|=1/2$. Only $k=\\pm3$ carries a phase, because only the sine term needed the factor $1/2j$: $\\angle a_3=\\angle1-\\angle2j=-\\pi/2$ and $\\angle a_{-3}=\\angle(-1)-\\angle2j=+\\pi/2$, that is $\\mp1.57$ rad. Since $x$ is real, magnitude is even in $k$ and phase is odd.'}]}
  ]}
]},

{ id:'m4-period', module:'M4', nav:'Fundamental period of a sum', title:'Combining periods correctly', src:'pp. 26–27, 38',
  objective:'Give the general rule for the fundamental period of a sum and show where the shortcut fails.',
  keywords:'fundamental period least common multiple LCM GCD rational periods common denominator', steps:2, blocks:[
  {t:'eyebrow', text:'Module 4 · Technique', src:'pp. 26–27, 38'},
  {t:'title', text:'A least common multiple of fractions'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:'A sum of periodic signals is periodic when every component period is a rational multiple of every other. The fundamental period of the sum is the smallest positive $T_0$ that is an integer multiple of each component period.'},
    {t:'eq', key:true, tex:'T_0=\\operatorname{LCM}\\!\\left(\\frac{p_1}{q_1},\\ \\frac{p_2}{q_2},\\dots\\right)=\\frac{\\operatorname{LCM}(p_1,p_2,\\dots)}{\\operatorname{GCD}(q_1,q_2,\\dots)}',
      label:'Period of a sum',
      note:'Each component period is first written as a fraction in lowest terms. A constant term has no period and is left out of the calculation.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'It need not be an integer', html:'The result is a least common multiple of <b>fractions</b>, so it is a fraction. Defining it as “the smallest integer that is a multiple of both” excludes answers such as $T_0=24/5$ s, which is exactly the answer the second example below produces.'}]},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Route A · common denominator','Put every period over one denominator, then take the least common multiple of the numerators and divide by that denominator.'],
        ['Route B · the rule above','Take $\\operatorname{LCM}$ of the numerators over $\\operatorname{GCD}$ of the denominators.'],
        ['They agree','Route A works because after the rewrite all denominators are equal, and for equal denominators $\\operatorname{LCM}(d,d)=\\operatorname{GCD}(d,d)=d$. Applying $\\operatorname{LCM}$ to the denominators <em>without</em> that rewrite gives a wrong answer.']
      ]}]},
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:200,xr:[-0.4,5],yr:[-1.4,1.4],xlabel:'t',pad:{l:50,r:24,t:24,b:34},xtarget:7,ytarget:3});
      a.curve(t=>Math.cos(2*Math.PI*t/(2/9)),{color:C.in,n:3000});
      a.curve(t=>Math.cos(2*Math.PI*t/(8/21)),{color:C.h,n:3000});
      a.span(0,2/9,1.16,'T_1=2/9',{color:C.in,fs:13,tex:true});
      return a.svg(); },
      caption:'Two components, of periods $2/9$ s and $8/21$ s.'}
  ]}
]},

{ id:'m4-period-ex', module:'M4', nav:'Period of a sum · examples', title:'The period rule, applied', src:'pp. 26–27, 38',
  objective:'Work three period examples and show the failure the rule prevents.',
  keywords:'period examples LCM GCD 24/5 8/3 check by division common period smallest', steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Technique', src:'pp. 26–27, 38'},
  {t:'title', text:'Three answers, and one wrong turn'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Example 1','Periods $1$ and $2/3$. Numerators $1,2$; denominators $1,3$. $T_0=\\operatorname{LCM}(1,2)/\\operatorname{GCD}(1,3)=2$ s, so $\\omega_0=\\pi$ rad/s.'],
      ['Example 2','Periods $3/5$ and $8/5$. $T_0=\\operatorname{LCM}(3,8)/\\operatorname{GCD}(5,5)=24/5$ s, so $\\omega_0=2\\pi\\big/(24/5)=5\\pi/12$ rad/s.'],
      ['Example 3','Periods $2$, $1$ and $2/3$. $T_0=\\operatorname{LCM}(2,1,2)/\\operatorname{GCD}(1,1,3)=2$ s.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'small', html:'The second answer is not an integer. Any definition that asks for “the smallest integer that is a multiple of both” would reject it, and it is correct.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Where the denominators matter', html:'Take periods $2/9$ and $8/21$. The rule gives $\\operatorname{LCM}(2,8)/\\operatorname{GCD}(9,21)=8/3$. Dividing by the least common multiple of the denominators instead — $\\operatorname{LCM}(9,21)=63$ — would give $8/63$, which is not a multiple of either period at all.'}]},
    {t:'reveal', at:3, items:[
      {t:'wex', rows:[
        ['Check the answer, always','$\\dfrac{8/3}{2/9}=12$ and $\\dfrac{8/3}{8/21}=7$. Both whole numbers, so $8/3$ is a common period; and $\\gcd(12,7)=1$, so it is the smallest one.']
      ]}]}
  ], right:[
    {t:'reveal', at:3, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:250,xr:[-0.4,5],yr:[-2.4,2.4],xlabel:'t',pad:{l:50,r:24,t:24,b:34},xtarget:7,ytarget:3});
        a.curve(t=>Math.cos(2*Math.PI*t/(2/9))+Math.cos(2*Math.PI*t/(8/21)),{color:C.out,n:4000});
        a.vline(0,{color:C.coral}); a.vline(8/3,{color:C.coral});
        a.span(0,8/3,2.05,'T_0=8/3',{color:C.coral,fs:14,tex:true});
        return a.svg(); },
        caption:'The sum of the two components. It first repeats after $8/3$ s — twelve cycles of the first and seven of the second.'}]}
  ]}
]},

{ id:'m4-fs-coef', module:'M4', nav:'Analysis equation', title:'Finding the coefficients of any periodic signal', src:'p. 28',
  objective:'State and prove the analysis equation through the orthogonality of complex exponentials.',
  keywords:'analysis equation orthogonality complex exponentials spectral coefficients pair', steps:2, blocks:[
  {t:'eyebrow', text:'Module 4 · The theorem', src:'p. 28'},
  {t:'title', text:'One integral per coefficient'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:'Reading coefficients off a sum of sinusoids works only when the signal is already written as one. For every other periodic signal there is a formula.'},
    {t:'eq', key:true, size:'lg', tex:'a_k=\\frac{1}{T_0}\\int_{T_0}x(t)\\,e^{-jk\\omega_0 t}\\,\\d t,\\qquad \\omega_0=\\frac{2\\pi}{T_0}',
      label:'Analysis equation',
      note:'$\\int_{T_0}$ means over any one full period; the integrand is periodic, so the choice of period does not matter. One period symbol is used throughout: $T_0$, with $\\omega_0=2\\pi/T_0$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'The pair, and nothing between', html:'Synthesis builds the signal from the coefficients; analysis extracts the coefficients from the signal. Both use the same $\\omega_0$, and the sign of the exponent is the one thing that separates them: $+jk\\omega_0t$ in the synthesis sum, $-jk\\omega_0t$ in the analysis integral.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'What makes it work', html:'Each harmonic is used as a probe. Multiplying by $e^{-jk\\omega_0t}$ and averaging over a period picks out the amount of $e^{jk\\omega_0t}$ present and rejects every other harmonic exactly. The next scene proves that.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:190,xr:[-1.2,1.2],yr:[-1.4,1.4],xlabel:'t',pad:{l:50,r:24,t:22,b:32},xtarget:7,ytarget:3});
      a.curve(t=>Math.cos(2*Math.PI*t),{color:C.in,n:1200});
      a.curve(t=>Math.cos(4*Math.PI*t),{color:C.h,n:1200});
      a.note(-1.05,1.22,'k=1',{anchor:'start',color:C.in,fs:14,tex:true});
      a.note(1.05,1.22,'k=2',{anchor:'end',color:C.h,fs:14,tex:true});
      return a.svg(); },
      caption:'Two different harmonics on one period, $T_0=1$.'}
  ]}
]},

{ id:'m4-fs-proof', module:'M4', nav:'Orthogonality', title:'Why the analysis equation works', src:'p. 28',
  objective:'Prove the analysis equation through the orthogonality of complex exponentials.',
  keywords:'proof orthogonality complex exponentials integral over one period l hopital derivation', steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Proof', src:'p. 28'},
  {t:'title', text:'One probe per harmonic'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:'Start from the synthesis equation, multiply both sides by $e^{-jn\\omega_0t}$ and integrate over one period:'},
    {t:'eq', size:'sm', tex:'\\int_{T_0}x(t)e^{-jn\\omega_0t}\\,\\d t=\\sum_{k=-\\infty}^{\\infty}a_k\\int_{T_0}e^{j(k-n)\\omega_0t}\\,\\d t'},
    {t:'reveal', at:1, items:[
      {t:'eq', size:'sm', tex:'\\int_{T_0}e^{j(k-n)\\omega_0t}\\,\\d t=\\frac{T_0\\sin\\bigl((k-n)\\pi\\bigr)}{(k-n)\\pi}',
        note:'Integrate over $-T_0/2$ to $T_0/2$ and use $\\omega_0T_0=2\\pi$.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'\\int_{T_0}e^{j(k-n)\\omega_0t}\\,\\d t=\\begin{cases}T_0,&k=n\\\\[2pt]0,&k\\neq n\\end{cases}',
        label:'Orthogonality of complex exponentials',
        note:'For $k\\neq n$ the sine of an integer multiple of $\\pi$ is zero. For $k=n$ the expression is $0/0$; one application of l’Hôpital’s rule in the variable $(k-n)$ gives $T_0$.'}]},
    {t:'reveal', at:3, items:[
      {t:'body', html:'Every term of the sum vanishes except the one with $k=n$, which leaves $\\int_{T_0}x(t)e^{-jn\\omega_0t}\\d t=T_0\\,a_n$. Renaming $n$ back to $k$ gives the analysis equation.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:210,xr:[-1.2,1.2],yr:[-1.4,1.4],xlabel:'t',pad:{l:50,r:24,t:24,b:32},xtarget:7,ytarget:3});
      a.area(t=>Math.cos(2*Math.PI*t)*Math.cos(4*Math.PI*t),-0.5,0.5,{color:'rgba(166,59,42,.20)'});
      a.curve(t=>Math.cos(2*Math.PI*t)*Math.cos(4*Math.PI*t),{color:C.err,n:1600});
      a.vline(-0.5,{color:C.coral}); a.vline(0.5,{color:C.coral});
      return a.svg(); },
      caption:'Two different harmonics multiplied together, over one period. The shaded area is zero: the positive and negative lobes cancel exactly. That cancellation is what orthogonality states.'},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:210,xr:[-1.2,1.2],yr:[-0.3,1.4],xlabel:'t',pad:{l:50,r:24,t:24,b:32},xtarget:7,ytarget:3});
        a.area(t=>Math.cos(2*Math.PI*t)*Math.cos(2*Math.PI*t),-0.5,0.5,{color:'rgba(74,122,70,.22)'});
        a.curve(t=>Math.cos(2*Math.PI*t)*Math.cos(2*Math.PI*t),{color:C.out,n:1600});
        a.vline(-0.5,{color:C.coral}); a.vline(0.5,{color:C.coral});
        return a.svg(); },
        caption:'A harmonic multiplied by itself never changes sign, so its area over a period is not zero. That is the one surviving term.'}]}
  ]}
]},

{ id:'m4-dc', module:'M4', nav:'The DC term', title:'The coefficient with no frequency', src:'p. 29',
  objective:'Interpret a₀ as the average value over one period.',
  keywords:'DC term a_0 average value zero frequency mean over one period', steps:2, blocks:[
  {t:'eyebrow', text:'Module 4 · Reading a coefficient', src:'p. 29'},
  {t:'title', text:'What $a_0$ always means'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:'Put $k=0$ in the analysis equation. The exponential becomes $e^{0}=1$ and the integral collapses:'},
    {t:'eq', key:true, size:'lg', tex:'a_0=\\frac{1}{T_0}\\int_{T_0}x(t)\\,\\d t', label:'DC term',
      note:'The average value of $x$ over one period. It is the only coefficient that is always real when $x$ is real.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'Use it as a check', html:'Before computing any other coefficient, look at the signal and estimate its average by eye. A signal that spends half its period at 1 and half at 0 has $a_0=1/2$. A signal symmetric about the time axis has $a_0=0$. If the formula disagrees with the picture, the formula was applied wrongly.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Zero frequency is still a harmonic', html:'The $k=0$ term is $a_0e^{j0\\omega_0t}=a_0$, a constant. It is a legitimate member of the family, not something outside the series, and dropping it shifts the whole reconstruction off the signal by exactly the average value.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:230,xr:[-4.5,4.5],yr:[-0.35,1.4],xlabel:'t',ylabel:'x(t)',pad:{l:52,r:24,t:24,b:34},xtarget:7,ytarget:3});
      a.curve(t=>rectWave(t,4,1),{color:C.in,n:3000});
      a.hline(0.5,{color:C.coral,dash:'4 5'});
      a.note(4.2,0.62,'a_0=1/2',{anchor:'end',color:C.coral,fs:15,tex:true});
      return a.svg(); },
      caption:'A wave that is 1 for half of each period and 0 for the other half. Its average, and therefore $a_0$, is $1/2$.'},
    {t:'reveal', at:1, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:230,xr:[-2.2,2.2],yr:[-0.9,0.9],xlabel:'t',ylabel:'x(t)',pad:{l:52,r:24,t:24,b:34},xtarget:7,ytarget:3});
        a.curve(t=>sawWave(t,1),{color:C.in,n:3000});
        a.hline(0,{color:C.coral,dash:'4 5'});
        a.note(2.05,0.16,'a_0=0',{anchor:'end',color:C.coral,fs:15,tex:true});
        return a.svg(); },
        caption:'A sawtooth that is odd about the middle of each period. The positive and negative halves cancel, so $a_0=0$.'}]}
  ]}
]},

{ id:'m4-rect', module:'M4', nav:'Rectangular wave · coefficients', title:'The periodic rectangular wave', src:'p. 29',
  objective:'Derive the coefficients of the periodic rectangular wave, both branches.',
  keywords:'periodic rectangular wave square pulse train coefficients sin(2 pi k T1/T)/(pi k) duty cycle', steps:4, blocks:[
  {t:'eyebrow', text:'Module 4 · Worked example', src:'p. 29'},
  {t:'title', text:'One integral, two branches'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','$x(t)=1$ for $|t|<T_1$ and $x(t)=0$ for $T_1<|t|<T_0/2$, repeated with period $T_0$.'],
      ['Find','All Fourier series coefficients.'],
      ['Method','Apply the analysis equation over the period $-T_0/2$ to $T_0/2$. Inside it the signal is 1 only on $[-T_1,T_1]$, so those become the limits. Treat $k=0$ separately, because the exponent vanishes there.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'eq', size:'sm', tex:'a_k=\\frac{1}{T_0}\\int_{-T_1}^{T_1}e^{-jk\\omega_0t}\\,\\d t=\\frac{-1}{jk\\omega_0T_0}\\Bigl[e^{-jk\\omega_0t}\\Bigr]_{-T_1}^{T_1}=\\frac{1}{jk\\omega_0T_0}\\Bigl(e^{jk\\omega_0T_1}-e^{-jk\\omega_0T_1}\\Bigr)',
        note:'Valid for $k\\neq0$ only: the antiderivative divides by $k$.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', size:'sm', tex:'=\\frac{2}{k\\omega_0T_0}\\,\\frac{e^{jk\\omega_0T_1}-e^{-jk\\omega_0T_1}}{2j}=\\frac{2\\sin(k\\omega_0T_1)}{k\\omega_0T_0}',
        note:'Then use $\\omega_0T_0=2\\pi$ in the denominator and $\\omega_0=2\\pi/T_0$ inside the sine.'},
      {t:'eq', key:true, tex:'a_k=\\frac{\\sin\\!\\left(2\\pi k\\,T_1/T_0\\right)}{\\pi k},\\qquad k\\neq0', label:'Coefficients'}]},
    {t:'reveal', at:3, items:[
      {t:'eq', key:true, size:'sm', tex:'a_k=\\begin{cases}\\dfrac{2T_1}{T_0},&k=0\\\\[10pt]\\dfrac{\\sin\\!\\left(2\\pi k\\,T_1/T_0\\right)}{\\pi k},&k\\neq0\\end{cases}', label:'Solution',
        note:'The $k=0$ branch is $a_0=\\frac{1}{T_0}\\int_{-T_1}^{T_1}1\\,\\d t=2T_1/T_0$: the fraction of each period that the pulse occupies, which is the average value.'}]},
    {t:'reveal', at:4, items:[
      {t:'small', html:'<b>Check the join.</b> As $k\\to0$ the second branch tends to $2T_1/T_0$, because $\\sin\\theta/\\theta\\to1$, so the split is bookkeeping and not a discontinuity. <b>Check reality.</b> $x$ is real and even, so every $a_k$ is real and even in $k$ — and it is, because $\\sin$ and $k$ are both odd. The zeros fall wherever $k$ is a non-zero multiple of $T_0/(2T_1)$.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:166,xr:[-5,5],yr:[-0.3,1.85],xlabel:'t',ylabel:'x(t)',pad:{l:52,r:24,t:24,b:32},xtarget:7,ytarget:2});
      a.curve(t=>rectWave(t,4,1),{color:C.in,n:3000});
      a.vline(-1,{color:C.coral}); a.vline(1,{color:C.coral});
      a.span(-1,1,1.16,'2T_1',{color:C.coral,fs:14,tex:true});
      return a.svg(); },
      caption:'Here $T_0=4T_1$. The pulse fills a quarter of each period, so $a_0=2T_1/T_0=1/2$.'},
    {t:'reveal', at:3, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:185,xr:[-12,12],yr:[-0.16,0.58],xlabel:'k',ylabel:'a_k',pad:{l:56,r:24,t:26,b:32},xtarget:7,ytarget:4});
        a.stem(D(k=>k===0?0.5:Math.sin(Math.PI*k/2)/(Math.PI*k),-12,12),{color:C.in,showZero:true});
        return a.svg(); },
        caption:'The coefficients for $T_0=4T_1$. They are real, so no separate phase plot is needed; a negative stem is a phase of $\\pi$. Every fourth coefficient is zero.'}]}
  ]}
]},

{ id:'m4-rect-sample', module:'M4', nav:'Rectangular wave · envelope', title:'The envelope, and where it is sampled', src:'p. 29',
  objective:'Separate the continuous envelope from the discrete samples that are the coefficients.',
  keywords:'envelope function sampling harmonic spacing 2 pi / T sinc duty cycle wide narrow', steps:4, blocks:[
  {t:'eyebrow', text:'Module 4 · Structure', src:'p. 29'},
  {t:'title', text:'A curve in $\\omega$, read at the harmonics'},
  {t:'cols', ratio:'c-5-7', left:[
    {t:'body', html:'The coefficients of the rectangular wave are values of one continuous function, taken at equally spaced points. Write that function first, in the continuous variable $\\omega$:'},
    {t:'eq', key:true, tex:'E(\\omega)=\\int_{-T_1}^{T_1}e^{-j\\omega t}\\,\\d t=\\frac{2\\sin(\\omega T_1)}{\\omega}',
      label:'Envelope', note:'It depends on the shape of one pulse, and not at all on how often the pulse repeats.'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'Now sample it. The harmonics sit at $\\omega=k\\omega_0$, so'},
      {t:'eq', key:true, tex:'a_k=\\frac{1}{T_0}\\,E(k\\omega_0)=\\frac{1}{T_0}\\cdot\\frac{2\\sin(k\\omega_0T_1)}{k\\omega_0}=\\frac{\\sin\\!\\left(2\\pi k\\,T_1/T_0\\right)}{\\pi k}',
        label:'Sampling the envelope'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Do not collapse the two steps', html:'$E(\\omega)$ is a function of a continuous variable; $a_k$ is a sequence. Evaluating the envelope at the single point $\\omega=\\omega_0$ gives $T_0\\sin(2\\pi T_1/T_0)/\\pi$, which is $T_0a_1$ — the first harmonic only. As a function of the harmonic index the coefficient is $T_0a_k=T_0\\sin(2\\pi kT_1/T_0)/(\\pi k)$, with the $k$ present in both places.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'What changes when $T_0$ grows', html:'Widen the period and keep the pulse fixed. The envelope does not move. Only the sample spacing $\\omega_0=2\\pi/T_0$ shrinks, so the same curve is read at more, closer points, and every coefficient falls as $1/T_0$. That observation is the whole idea behind the Fourier transform of the next module.'}]},
    {t:'reveal', at:4, items:[
      {t:'small', html:'The sinc convention used here is the <b>unnormalised</b> one, $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$. In that notation $E(\\omega)=2T_1\\operatorname{sinc}(\\omega T_1)$.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const T0=4, T1=1, w0=2*Math.PI/T0;
      const a=P.Axes({w:800,h:200,xr:[-10,10],yr:[-0.7,2.3],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'E(\\omega)',pad:{l:56,r:24,t:26,b:36},xtarget:7,ytarget:4});
      a.curve(w=>Math.abs(w)<1e-6?2*T1:2*Math.sin(w*T1)/w,{color:C.mid,n:1600});
      for(let k=-6;k<=6;k++){ const w=k*w0; a.point(w, Math.abs(w)<1e-6?2*T1:2*Math.sin(w*T1)/w,{color:C.coral,r:3.4}); }
      return a.svg(); },
      caption:'The envelope $E(\\omega)$ for $T_1=1$, with the sampling points $\\omega=k\\omega_0$ marked for $T_0=4$.'},
    {t:'reveal', at:1, items:[
      {t:'grid', cols:1, gap:'6px', items:[
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:800,h:135,xr:[-24,24],yr:[-0.16,0.58],xlabel:'k',ylabel:'a_k',pad:{l:56,r:22,t:24,b:30},xtarget:7,ytarget:3});
          a.stem(D(k=>k===0?0.5:Math.sin(Math.PI*k/2)/(Math.PI*k),-24,24),{color:C.in,r:2.6,showZero:true}); return a.svg(); },
          caption:'$T_0=4T_1$.'}],
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:800,h:135,xr:[-24,24],yr:[-0.08,0.29],xlabel:'k',ylabel:'a_k',pad:{l:56,r:22,t:24,b:30},xtarget:7,ytarget:3});
          a.stem(D(k=>k===0?0.25:Math.sin(Math.PI*k/4)/(Math.PI*k),-24,24),{color:C.in,r:2.6,showZero:true}); return a.svg(); },
          caption:'$T_0=8T_1$. Same envelope, twice as many samples across it, half the height. Doubling the period again halves it once more.'}]
      ]}]}
  ]}
]},

{ id:'m4-howmany', module:'M4', nav:'How many harmonics', title:'How many coefficients are enough', src:'p. 30',
  objective:'Define the truncated series and the mean-square error, and describe the Gibbs phenomenon.',
  keywords:'truncation partial sum mean square error MSE convergence Gibbs phenomenon overshoot ringing', steps:4, blocks:[
  {t:'eyebrow', text:'Module 4 · Convergence', src:'p. 30'},
  {t:'title', text:'The error, measured'},
  {t:'cols', ratio:'c-5-7', left:[
    {t:'eq', tex:'x_N(t)=\\sum_{k=-N}^{N}a_k\\,e^{jk\\omega_0t}', label:'Truncated series',
      note:'Keep the $2N+1$ coefficients nearest to zero frequency and discard the rest.'},
    {t:'eq', key:true, tex:'e_N(t)=x(t)-x_N(t),\\qquad \\text{MSE}=\\frac{1}{T_0}\\int_{T_0}\\bigl|e_N(t)\\bigr|^{2}\\,\\d t',
      label:'Approximation error', note:'{{sym:mse|Mean-square error}}: square the error, then average it over one period.'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'As $N\\to\\infty$ the mean-square error goes to zero for every signal meeting the Dirichlet conditions. Convergence <em>in the mean</em> is what the series guarantees.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'The Gibbs phenomenon', html:'Near a jump the partial sum overshoots, and the overshoot does <b>not</b> shrink as $N$ grows. Its height settles at about <b>9% of the size of the jump</b>. What does shrink is its width: the ripple is squeezed into an ever narrower band around the discontinuity. That is why the mean-square error still goes to zero while the largest error does not.'}]},
    {t:'reveal', at:3, items:[
      {t:'wex', rows:[
        ['Rectangular wave, $T_0=4T_1$','MSE $=0.025$ at $N=3$; $0.010$ at $N=9$; $0.004$ at $N=27$; $0.001$ at $N=81$.']
      ]},
      {t:'small', html:'The error falls steadily, but the height of the spike beside each jump does not.'}]},
    {t:'reveal', at:4, items:[
      {t:'note', kind:'ok', head:'Why the error falls so slowly', html:'The discarded power is $\\sum_{|k|>N}|a_k|^{2}$, and for a signal with a jump the coefficients only decay like $1/k$. Doubling $N$ therefore roughly halves the error. A signal with no jumps has faster-decaying coefficients and needs far fewer harmonics.'}]}
  ], right:[
    {t:'grid', cols:1, gap:'5px', items:[
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:800,h:118,xr:[-6,6],yr:[-0.35,1.45],xlabel:'t',pad:{l:50,r:22,t:20,b:28},xtarget:7,ytarget:2});
        a.curve(t=>rectWave(t,4,1),{color:C.in,n:3000}); return a.svg(); }, caption:'The signal.'}],
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:800,h:118,xr:[-6,6],yr:[-0.35,1.45],xlabel:'t',pad:{l:50,r:22,t:20,b:28},xtarget:7,ytarget:2});
        a.curve(t=>rectPS(t,3,4,1),{color:C.mid,n:2400}); return a.svg(); }, caption:'$N=3$.'}],
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:800,h:118,xr:[-6,6],yr:[-0.35,1.45],xlabel:'t',pad:{l:50,r:22,t:20,b:28},xtarget:7,ytarget:2});
        a.curve(t=>rectPS(t,27,4,1),{color:C.out,n:5000}); return a.svg(); }, caption:'$N=27$.'}]
    ]},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:800,h:175,xr:[0.4,1.6],yr:[-0.25,1.35],xlabel:'t',pad:{l:50,r:22,t:22,b:32},xtarget:5,ytarget:3});
        a.curve(t=>rectWave(t,4,1),{color:C.in,n:4000});
        a.curve(t=>rectPS(t,27,4,1),{color:C.err,n:6000});
        a.hline(1.09,{color:C.coral,dash:'4 5'});
        a.note(1.55,1.21,'\\text{about }9\\%',{anchor:'end',color:C.coral,fs:14,tex:true});
        return a.svg(); },
        caption:'The jump at $t=1$, magnified, with $N=27$. The spike stands about 9% of the jump above the true level, and it will still be there at $N=1000$.'}]}
  ]}
]},

{ id:'m4-saw', module:'M4', nav:'Sawtooth wave', title:'The sawtooth wave', src:'pp. 30–31',
  objective:'Derive the sawtooth coefficients and read their purely imaginary structure.',
  keywords:'sawtooth wave coefficients integration by parts odd signal derivation', steps:2, blocks:[
  {t:'eyebrow', text:'Module 4 · Worked example', src:'pp. 30–31'},
  {t:'title', text:'An odd signal has imaginary coefficients'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','$x(t)=t$ for $-T_0/2<t<T_0/2$, repeated with period $T_0$.'],
      ['Find','All Fourier series coefficients.'],
      ['Method','The $k=0$ term first, then integration by parts for the rest.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'eq', size:'sm', tex:'a_0=\\frac{1}{T_0}\\int_{-T_0/2}^{T_0/2}t\\,\\d t=\\frac{1}{T_0}\\left[\\frac{t^{2}}{2}\\right]_{-T_0/2}^{T_0/2}=0',
        note:'The signal is odd about the middle of the period, so the two halves cancel.'},
      {t:'eq', size:'sm', tex:'\\int_b^{c} t\\,e^{at}\\,\\d t=\\frac{1}{a^{2}}\\Bigl[(at-1)e^{at}\\Bigr]_b^{c}', label:'Integration by parts'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', size:'sm', tex:'a_k=\\frac{1}{T_0}\\int_{-T_0/2}^{T_0/2}t\\,e^{-jk\\omega_0t}\\,\\d t=\\frac{-1}{T_0k^{2}\\omega_0^{2}}\\Bigl[(-jk\\omega_0t-1)e^{-jk\\omega_0t}\\Bigr]_{-T_0/2}^{T_0/2}',
        note:'Then use $\\omega_0T_0/2=\\pi$, so that each exponential becomes $e^{\\mp jk\\pi}$.'},
      {t:'eq', size:'sm', tex:'=\\frac{-1}{T_0k^{2}\\omega_0^{2}}\\Bigl[-2jk\\pi\\cos(k\\pi)+2j\\sin(k\\pi)\\Bigr]=\\frac{jT_0}{2k\\pi}\\cos(k\\pi)',
        note:'$\\sin(k\\pi)=0$ for every integer $k$, so the second term disappears.'}]},
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:200,xr:[-1.7,1.7],yr:[-0.8,0.8],xlabel:'t',ylabel:'x(t)',pad:{l:52,r:24,t:24,b:34},xtarget:7,ytarget:3});
      a.curve(t=>sawWave(t,1),{color:C.in,n:4000});
      a.curve(t=>sawPS(t,9,1),{color:C.out,n:4000});
      return a.svg(); },
      caption:'The sawtooth for $T_0=1$, with its truncation at $N=9$. The overshoot beside each jump is the same Gibbs spike.'}
  ]}
]},

{ id:'m4-saw-b', module:'M4', nav:'Sawtooth · result', title:'The sawtooth coefficients, and their symmetry', src:'p. 31',
  objective:'State the sawtooth result and read the odd-signal symmetry off it.',
  keywords:'sawtooth result purely imaginary magnitude 0.159 phase alternating symmetry real odd', steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Worked example', src:'p. 31'},
  {t:'title', text:'Reading the answer'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'eq', key:true, tex:'a_k=\\begin{cases}0,&k=0\\\\[6pt]\\dfrac{jT_0}{2k\\pi}\\cos(k\\pi)=\\dfrac{jT_0(-1)^{k}}{2k\\pi},&k\\neq0\\end{cases}', label:'Solution'},
    {t:'reveal', at:1, items:[
      {t:'wex', rows:[
        ['Magnitude','$|a_k|=\\dfrac{T_0}{2|k|\\pi}$. For $T_0=1$ the largest is $|a_{\\pm1}|=1/(2\\pi)\\approx0.159$.'],
        ['Phase','Every $a_k$ is purely imaginary, so every phase is $+\\pi/2$ or $-\\pi/2$. The sign alternates with $k$, because of the factor $(-1)^{k}$, and flips again with the sign of $k$.']
      ]}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'The symmetry, read off the answer', html:'$x$ is real and odd. Real forces $a_{-k}=a_k^{*}$; odd forces $a_{-k}=-a_k$. Together they give $a_k^{*}=-a_k$, so $a_k$ has no real part. The formula shows exactly that, and it is worth checking this way round before trusting any long integration.'}]},
    {t:'reveal', at:3, items:[
      {t:'small', html:'The mean-square error of the truncated sawtooth falls from about $0.0144$ at $N=3$ to $0.0006$ at $N=81$, and a Gibbs spike sits beside every jump. Compare the rectangular wave, whose coefficients decay at the same $1/k$ rate: both are signals with a discontinuity, and both pay for it in the same way.'}]}
  ], right:[
    {t:'reveal', at:1, items:[
      {t:'grid', cols:2, gap:'16px', items:[
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:190,xr:[-10,10],yr:[-0.02,0.19],xlabel:'k',ylabel:'|a_k|',pad:{l:58,r:18,t:24,b:32},xtarget:5,ytarget:3});
          a.stem(D(k=>k===0?0:1/(2*Math.abs(k)*Math.PI),-10,10),{color:C.in,r:3,showZero:true}); return a.svg(); },
          caption:'Peak $0.159$ at $k=\\pm1$.'}],
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:190,xr:[-10,10],yr:[-2.0,2.0],xlabel:'k',ylabel:'\\angle a_k\\;[\\text{rad}]',pad:{l:58,r:18,t:24,b:32},xtarget:5,
            yticksOverride:[-Math.PI/2,0,Math.PI/2],ytickfmt:v=>v.toFixed(2)});
          a.stem(D(k=>k===0?0:(Math.pow(-1,k)/k>0?Math.PI/2:-Math.PI/2),-10,10),{color:C.mid,r:3,showZero:true}); return a.svg(); },
          caption:'Every phase is $\\pm1.57$ rad.'}]
      ]}]},
  ]}
]},

{ id:'m4-imptrain', module:'M4', nav:'Impulse train', title:'The periodic impulse train', src:'p. 31',
  objective:'Compute the coefficients of the impulse train and read the flat spectrum.',
  keywords:'periodic impulse train delta comb sifting property flat spectrum a_k = 1/T', steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Worked example', src:'p. 31'},
  {t:'title', text:'Every harmonic, in equal measure'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','$x(t)=\\displaystyle\\sum_{m=-\\infty}^{\\infty}\\delta(t-mT_0)$.'],
      ['Find','All Fourier series coefficients.'],
      ['Method','Choose the period $-T_0/2$ to $+T_0/2$. Exactly one impulse falls inside it, the one at $t=0$, so the sifting property finishes the integral in one step.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'Set the limits before integrating', html:'Both limits must be written, and they must differ: $-T_0/2$ at the bottom, $+T_0/2$ at the top. An interval whose two ends are the same number has zero length and every integral over it is zero, impulse or not.'},
      {t:'eq', size:'sm', tex:'a_k=\\frac{1}{T_0}\\int_{-T_0/2}^{+T_0/2}\\delta(t)\\,e^{-jk\\omega_0t}\\,\\d t=\\frac{1}{T_0}\\,e^{-jk\\omega_0\\cdot 0}=\\frac{1}{T_0}',
        note:'The sifting property of Module 1 evaluates the smooth factor at the location of the impulse.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, size:'lg', tex:'a_k=\\frac{1}{T_0}\\quad\\text{for every }k', label:'Solution',
        note:'Real, positive, and the same at every harmonic.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'What a flat spectrum means', html:'Every harmonic is present with the same weight, and the phases are all zero. At $t=0$ they all add in step, which is the impulse; everywhere else they cancel. Concentrating a signal in time spreads it across frequency, and this is the extreme case of that trade.'},
      {t:'small', html:'This pair — an impulse train in time, an impulse train in frequency — returns in Module 7 as the mathematical core of sampling.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:220,xr:[-3.4,3.4],yr:[-0.25,1.5],xlabel:'t',pad:{l:52,r:24,t:24,b:34},xtarget:7,ytarget:2});
      [-3,-2,-1,0,1,2,3].forEach(m=>a.impulse(m,1,{color:C.in,labelText:'1'}));
      a.span(0,1,1.32,'T_0',{color:C.coral,fs:14,tex:true});
      return a.svg(); },
      caption:'The impulse train with $T_0=1$. Each arrow is an impulse of weight 1; the height of an arrow shows its weight, not a value of the signal.'},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:220,xr:[-9,9],yr:[-0.25,1.6],xlabel:'k',ylabel:'a_k',pad:{l:56,r:24,t:26,b:34},xtarget:7,ytarget:3});
        a.stem(D(k=>1,-9,9),{color:C.mid});
        return a.svg(); },
        caption:'The coefficients for $T_0=1$, so $a_k=1$ at every $k$. For a longer period every stem drops to $1/T_0$, but the picture stays flat.'}]}
  ]}
]},

{ id:'m4-dtfs', module:'M4', nav:'Discrete-time series', title:'The discrete-time Fourier series', src:'p. 32',
  objective:'State the DTFS pair and prove that the coefficients repeat with period N.',
  keywords:'DTFS discrete time fourier series finite sum periodic coefficients a_k = a_{k+N} proof', steps:4, blocks:[
  {t:'eyebrow', text:'Module 4 · Discrete time', src:'p. 32'},
  {t:'title', text:'A finite sum, and a spectrum that repeats'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:'Let $x[n]=x[n+N]$ for every $n$, with $N$ the period. Set $\\omega_0=2\\pi/N$ rad/sample.'},
    {t:'eq', key:true, tex:'x[n]=\\sum_{k=\\langle N\\rangle}a_k\\,e^{jk(2\\pi/N)n}', label:'Synthesis'},
    {t:'eq', key:true, tex:'a_k=\\frac{1}{N}\\sum_{n=\\langle N\\rangle}x[n]\\,e^{-jk(2\\pi/N)n}', label:'Analysis',
      note:'$\\langle N\\rangle$ means any $N$ consecutive values of the index. Both sums are finite, and there are exactly $N$ distinct coefficients.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, size:'lg', tex:'a_{k+N}=a_k', label:'The coefficients are periodic in $k$'}]},
    {t:'reveal', at:2, items:[
      {t:'body', html:'<b>Proof.</b> Replace $k$ by $k+N$ in the analysis sum:'},
      {t:'eq', size:'sm', tex:'a_{k+N}=\\frac{1}{N}\\sum_{n=\\langle N\\rangle}x[n]e^{-jk(2\\pi/N)n}\\underbrace{e^{-jN(2\\pi/N)n}}_{=\\,\\left(e^{-j2\\pi}\\right)^{n}=1}=a_k',
        note:'The extra factor is 1 because $n$ is an <b>integer</b>. That is the whole proof, and it is the only place the integer index is used.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'There is no continuous-time counterpart', html:'The same substitution in continuous time produces $e^{-j2\\pi t}$, which is 1 only when $t$ is an integer, and $t$ is not. Continuous-time coefficients therefore do <b>not</b> repeat: the continuous-time series runs over all $k$ from $-\\infty$ to $\\infty$ with no two coefficients forced to agree.'}]},
    {t:'reveal', at:4, items:[
      {t:'note', kind:'ok', head:'What the finiteness buys', html:'A periodic sequence of period $N$ is described by $N$ numbers, and its series has $N$ terms. There is no truncation, no limit and therefore no convergence question at all: a discrete-time Fourier series is an exact, finite identity.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:210,xr:[-9,17],yr:[-1.5,1.5],xlabel:'n',ylabel:'x[n]',pad:{l:52,r:24,t:26,b:34},xtarget:8,ytarget:3});
      a.stem(D(n=>Math.cos(2*Math.PI*n/8)+0.4*Math.sin(4*Math.PI*n/8),-9,17),{color:C.in,r:3});
      a.span(0,8,1.28,'N=8',{color:C.coral,fs:14,tex:true});
      a.vline(0,{color:C.coral}); a.vline(8,{color:C.coral});
      return a.svg(); },
      caption:'A periodic sequence with $N=8$. Eight samples describe it completely.'},
    {t:'reveal', at:1, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:230,xr:[-9,17],yr:[-0.1,0.65],xlabel:'k',ylabel:'|a_k|',pad:{l:56,r:24,t:26,b:34},xtarget:8,ytarget:3});
        const mag=k=>{ const m=((k%8)+8)%8; return (m===1||m===7)?0.5:((m===2||m===6)?0.2:0); };
        a.stem(D(mag,-9,17),{color:C.mid,r:3,showZero:true});
        a.vline(0,{color:C.coral}); a.vline(8,{color:C.coral});
        a.span(0,8,0.56,'N=8',{color:C.coral,fs:14,tex:true});
        return a.svg(); },
        caption:'Its coefficient magnitudes. The pattern repeats every eight steps in $k$, so one window of eight carries all the information.'}]}
  ]}
]},

{ id:'m4-dtfs-ex', module:'M4', nav:'Discrete-time example', title:'Worked example — a sum of two sequences', src:'p. 32',
  objective:'Find the period and the DTFS coefficients of a sum of a sine and a cosine sequence.',
  keywords:'discrete example period LCM 24 coefficients euler stem plot magnitude phase', steps:4, blocks:[
  {t:'eyebrow', text:'Module 4 · Worked example', src:'p. 32'},
  {t:'title', text:'Finding $N$ first, then the coefficients'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','$x[n]=\\sin\\!\\left(\\dfrac{5\\pi}{6}n\\right)+\\cos\\!\\left(\\dfrac{3\\pi}{4}n+\\dfrac{\\pi}{5}\\right)$.'],
      ['Find','The fundamental period and every Fourier series coefficient.'],
      ['Method','A discrete-time sinusoid repeats only if $N=(2\\pi/\\omega)k$ is a positive integer for some integer $k$. Get each component period, take their least common multiple, then expand with Euler’s relations.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'wex', rows:[
        ['First term','$\\omega=5\\pi/6$, so $N=\\dfrac{2\\pi k}{5\\pi/6}=\\dfrac{12k}{5}$. The first integer is at $k=5$, giving $N=12$.'],
        ['Second term','$\\omega=3\\pi/4$, so $N=\\dfrac{2\\pi k}{3\\pi/4}=\\dfrac{8k}{3}$. The first integer is at $k=3$, giving $N=8$.'],
        ['Together','$N_0=\\operatorname{LCM}(12,8)=24$, so $\\omega_0=2\\pi/24$ rad/sample.']
      ]}]},
    {t:'reveal', at:2, items:[
      {t:'small', html:'Both component periods are already whole numbers here, so the least common multiple is the ordinary one. The fractional rule of the earlier scene is needed only in continuous time, where a period may be any positive real number.'},
      {t:'eq', size:'sm', tex:'\\frac{5\\pi}{6}=10\\cdot\\frac{2\\pi}{24},\\qquad \\frac{3\\pi}{4}=9\\cdot\\frac{2\\pi}{24}',
        note:'Each component frequency is an exact multiple of $\\omega_0$. That is what makes them harmonics of one series.'}]},
    {t:'reveal', at:3, items:[
      {t:'eq', size:'sm', tex:'x[n]=\\frac{1}{2j}e^{j10\\omega_0n}-\\frac{1}{2j}e^{-j10\\omega_0n}+\\frac{1}{2}e^{j\\pi/5}e^{j9\\omega_0n}+\\frac{1}{2}e^{-j\\pi/5}e^{-j9\\omega_0n}'},
      {t:'eq', key:true, tex:'a_{10}=\\frac{1}{2j},\\quad a_{-10}=-\\frac{1}{2j},\\quad a_{9}=\\tfrac12 e^{j\\pi/5},\\quad a_{-9}=\\tfrac12 e^{-j\\pi/5}',
        label:'Solution', note:'Every other coefficient in one period of 24 is zero — and $a_k=a_{k+24}$ extends the answer to all $k$.'}]},
    {t:'reveal', at:4, items:[
      {t:'wex', rows:[
        ['Magnitudes','$|a_{\\pm9}|=|a_{\\pm10}|=1/2$.'],
        ['Phases','$\\angle a_9=\\pi/5$, $\\angle a_{-9}=-\\pi/5$, $\\angle a_{10}=-\\pi/2$, $\\angle a_{-10}=+\\pi/2$.'],
        ['Check','$x$ is real, so $a_{-k}=a_k^{*}$: magnitudes even, phases odd. All four values obey it.']
      ]}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const f=n=>Math.sin(5*Math.PI*n/6)+Math.cos(3*Math.PI*n/4+Math.PI/5);
      const a=P.Axes({w:820,h:220,xr:[-26,26],yr:[-2.3,2.3],xlabel:'n',ylabel:'x[n]',pad:{l:52,r:24,t:26,b:34},xtarget:7,ytarget:3});
      a.stem(D(f,-26,26),{color:C.in,r:2.6});
      return a.svg(); },
      caption:'The sequence. It repeats every 24 samples.'},
    {t:'reveal', at:3, items:[
      {t:'grid', cols:2, gap:'16px', items:[
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:215,xr:[-12,12],yr:[-0.08,0.62],xlabel:'k',ylabel:'|a_k|',pad:{l:56,r:18,t:24,b:32},xtarget:5,ytarget:3});
          a.stem(D(k=>(Math.abs(k)===9||Math.abs(k)===10)?0.5:0,-12,12),{color:C.in,r:2.6,showZero:true}); return a.svg(); }}],
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:215,xr:[-12,12],yr:[-2.0,2.0],xlabel:'k',ylabel:'\\angle a_k\\;[\\text{rad}]',pad:{l:58,r:18,t:24,b:32},xtarget:5,
            yticksOverride:[-Math.PI/2,0,Math.PI/2],ytickfmt:v=>v.toFixed(2)});
          a.stem(D(k=>k===9?Math.PI/5:(k===-9?-Math.PI/5:(k===10?-Math.PI/2:(k===-10?Math.PI/2:0))),-12,12),{color:C.mid,r:2.6,showZero:true}); return a.svg(); }}]
      ]},
      {t:'small', html:'One period of the coefficients, $-12\\le k\\le11$. Outside it the same four stems repeat every 24 steps.'}]}
  ]}
]},

{ id:'m4-dt-square', module:'M4', nav:'DT square wave · the sum', title:'The discrete-time square wave', src:'p. 33',
  objective:'Evaluate the finite geometric sum and state the condition it actually needs.',
  keywords:'discrete rectangular wave geometric sum finite r != 1 condition sign of exponent branches', steps:4, blocks:[
  {t:'eyebrow', text:'Module 4 · Worked example', src:'p. 33'},
  {t:'title', text:'A finite geometric sum, done carefully'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','$x[n]=1$ for $|n|\\le N_1$ and $x[n]=0$ for $N_1<|n|\\le N/2$, repeated with period $N$.'],
      ['Find','All Fourier series coefficients.'],
      ['Method','The analysis sum runs over one period; inside it the signal is 1 only for $-N_1\\le n\\le N_1$. What is left is a finite geometric sum with ratio $r=e^{-jk(2\\pi/N)}$.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'eq', size:'sm', tex:'a_k=\\frac{1}{N}\\sum_{n=-N_1}^{N_1}e^{-jk(2\\pi/N)n}'},
      {t:'eq', tex:'\\sum_{n=m}^{p}r^{\\,n}=\\frac{r^{m}-r^{\\,p+1}}{1-r}', label:'Finite geometric sum',
        note:'A finite sum needs only $r\\neq1$. The condition $|r|<1$ belongs to the <em>infinite</em> sum, where it is what makes the tail converge.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Here $|r|=1$ exactly', html:'The ratio $r=e^{-jk(2\\pi/N)}$ is a point on the unit circle, so $|r|=1$ at every $k$ and demanding $|r|<1$ would rule the sum out altogether. What must be checked is $r\\neq1$, which fails precisely when $k$ is a multiple of $N$ — the branch handled separately below. The distinction does real work here.'}]},
    {t:'reveal', at:3, items:[
      {t:'eq', size:'sm', tex:'\\sum_{n=-N_1}^{N_1}r^{\\,n}=\\frac{r^{-N_1}-r^{\\,N_1+1}}{1-r}=\\frac{e^{+jk(2\\pi/N)N_1}-e^{-jk(2\\pi/N)(N_1+1)}}{1-e^{-jk(2\\pi/N)}}',
        note:'The lower limit is $n=-N_1$, so the first numerator term is $r^{-N_1}=e^{+jk(2\\pi/N)N_1}$. The exponent is <b>positive</b>. Carrying a minus sign into it here is the single most common slip in this derivation, and it is invisible two lines later because the next step symmetrises the expression anyway.'}]},
    {t:'reveal', at:4, items:[
      {t:'eq', size:'sm', tex:'\\text{numerator}=e^{-jk\\frac{2\\pi}{2N}}\\cdot 2j\\sin\\!\\left(\\frac{2\\pi k}{N}\\Bigl(N_1+\\tfrac12\\Bigr)\\right),\\qquad \\text{denominator}=e^{-jk\\frac{2\\pi}{2N}}\\cdot 2j\\sin\\!\\left(\\frac{\\pi k}{N}\\right)',
        note:'Factor $e^{-jk(2\\pi/2N)}$ out of numerator and denominator; each bracket then becomes a difference of conjugate exponentials, that is $2j\\sin(\\cdot)$. The exponential and the factor $2j$ cancel, and the next scene collects the result.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:186,xr:[-16,16],yr:[-0.25,1.4],xlabel:'n',ylabel:'x[n]',pad:{l:52,r:24,t:26,b:32},xtarget:8,ytarget:2});
      a.stem(D(n=>{const m=n-10*Math.round(n/10); return Math.abs(m)<=2?1:0;},-16,16),{color:C.in,r:3,showZero:true});
      a.vline(-2,{color:C.coral}); a.vline(2,{color:C.coral});
      a.span(-2,2,1.16,'2N_1+1\\;\\text{samples}',{color:C.coral,fs:13,tex:true});
      return a.svg(); },
      caption:'The wave for $N=10$, $N_1=2$: five ones and five zeros in every period.'},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:212,xr:[-1.5,1.5],yr:[-1.35,1.35],xlabel:'\\operatorname{Re}\\{r\\}',ylabel:'\\operatorname{Im}\\{r\\}',pad:{l:56,r:24,t:28,b:36},xtarget:5,ytarget:3});
        a.curve(x=>Math.sqrt(Math.max(0,1-x*x)),{color:C.muted,width:1.2,dash:'4 4',n:600});
        a.curve(x=>-Math.sqrt(Math.max(0,1-x*x)),{color:C.muted,width:1.2,dash:'4 4',n:600});
        for(let k=0;k<10;k++){ const th=-2*Math.PI*k/10;
          a.point(Math.cos(th),Math.sin(th),{color:k===0?C.err:C.in,r:4.6}); }
        a.note(1.06,0.22,'r=1\\;\\text{at }k=0',{anchor:'start',color:C.err,fs:13,tex:true});
        return a.svg(); },
        caption:'The ten values of $r$ for $N=10$. All of them have $|r|=1$; only the one at $k=0$ equals 1, and that is the value the formula cannot take.'}]}
  ]}
]},

{ id:'m4-dt-square-b', module:'M4', nav:'DT square wave · result', title:'The result, and reading it off the axis', src:'pp. 33–34',
  objective:'State both branches of the discrete-time square-wave coefficients and reconstruct exactly.',
  keywords:'discrete square wave coefficients both branches (2N1+1)/N periodic in k no Gibbs exact', steps:4, blocks:[
  {t:'eyebrow', text:'Module 4 · Worked example', src:'pp. 33–34'},
  {t:'title', text:'Two branches, and no convergence problem'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'eq', key:true, size:'sm', tex:'a_k=\\begin{cases}\\dfrac{2N_1+1}{N},&k=0,\\pm N,\\pm 2N,\\dots\\\\[12pt]\\dfrac{1}{N}\\,\\dfrac{\\sin\\!\\left(\\dfrac{2\\pi k}{N}\\left(N_1+\\tfrac12\\right)\\right)}{\\sin\\!\\left(\\dfrac{\\pi k}{N}\\right)},&\\text{otherwise}\\end{cases}',
      label:'Solution'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'The first branch is the case $r=1$, where every term of the sum is 1 and there are $2N_1+1$ of them. It is also the average value of the sequence, exactly as the DC term must be.'},
      {t:'wex', rows:[
        ['Numbers','$N=10$, $N_1=2$ gives $a_0=(2\\cdot2+1)/10=0.5$, and the same value returns at $k=\\pm10,\\pm20,\\dots$'],
        ['Reading a plot','A peak of $0.5$ cannot be read off an axis whose highest label is $0.4$. Every plot here is scaled so that its largest value falls inside the labelled range.']
      ]}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'The shape, in one sentence', html:'The numerator counts the $2N_1+1$ ones and the denominator spreads them, so the coefficients trace a ratio of two sines that peaks wherever $k$ is a multiple of $N$ and decays between the peaks. Widening the pulse ($N_1$ up) narrows the central lobe; lengthening the period ($N$ up) puts more coefficients under the same lobe.'}]},
    {t:'reveal', at:3, items:[
      {t:'eq', size:'sm', tex:'x[n]=\\frac{2N_1+1}{N}+\\sum_{\\substack{k=\\langle N\\rangle\\\\ k\\neq0}}\\frac{1}{N}\\,\\frac{\\sin\\!\\left(\\dfrac{2\\pi k}{N}\\left(N_1+\\tfrac12\\right)\\right)}{\\sin\\!\\left(\\dfrac{\\pi k}{N}\\right)}\\,e^{jk(2\\pi/N)n}',
        label:'The reconstruction'},
      {t:'note', kind:'ok', head:'No Gibbs phenomenon here', html:'The sum has $N$ terms and stops. There is no truncation and no limit, so the reconstruction is not an approximation that improves — with all $N$ coefficients it is exactly $x[n]$, and its mean-square error is exactly zero.'}]},
    {t:'reveal', at:4, items:[
      {t:'small', html:'Keeping fewer than $N$ coefficients does produce an error, and the panels on the right show it falling from $0.045$ to $0$ as the last terms are added back. What never appears is an overshoot that refuses to shrink.'}]}
  ], right:[
    {t:'grid', cols:1, gap:'6px', items:[
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:800,h:130,xr:[-25,25],yr:[-0.18,0.58],xlabel:'k',ylabel:'a_k',pad:{l:56,r:22,t:24,b:30},xtarget:7,ytarget:3});
        a.stem(D(k=>dtRect(k,10,2),-25,25),{color:C.in,r:2.6,showZero:true}); return a.svg(); },
        caption:'$N=10$, $N_1=2$. Peak $0.5$, repeating every 10.'}],
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:800,h:130,xr:[-45,45],yr:[-0.09,0.3],xlabel:'k',ylabel:'a_k',pad:{l:56,r:22,t:24,b:30},xtarget:7,ytarget:3});
        a.stem(D(k=>dtRect(k,20,2),-45,45),{color:C.in,r:2,showZero:true}); return a.svg(); },
        caption:'$N=20$. Peak $0.25$, repeating every 20.'}],
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:800,h:130,xr:[-45,45],yr:[-0.06,0.2],xlabel:'k',ylabel:'a_k',pad:{l:56,r:22,t:24,b:30},xtarget:7,ytarget:3});
        a.stem(D(k=>dtRect(k,30,2),-45,45),{color:C.in,r:2,showZero:true}); return a.svg(); },
        caption:'$N=30$. Peak $1/6$, repeating every 30.'}]
    ]},
    {t:'reveal', at:3, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:800,h:168,xr:[-13,13],yr:[-0.3,1.4],xlabel:'n',pad:{l:52,r:22,t:24,b:32},xtarget:7,ytarget:2});
        const rec=(n,M)=>{ let s=dtRect(0,9,2); for(let k=1;k<=M;k++) s+=2*dtRect(k,9,2)*Math.cos(2*Math.PI*k*n/9); return s; };
        a.stem(D(n=>rec(n,4),-13,13),{color:C.out,r:3,showZero:true});
        return a.svg(); },
        caption:'A period-9 wave rebuilt from all of its coefficients. Every sample lands on 1 or 0 exactly.'}]}
  ]}
]},

{ id:'m4-dt-saw', module:'M4', nav:'DT sawtooth', title:'Worked example — a discrete sawtooth', src:'pp. 34–35',
  objective:'Compute the coefficients of an odd period-11 sequence by pairing terms.',
  keywords:'discrete sawtooth N=11 odd sequence purely imaginary pairing sine sum peak 1.7747', steps:4, blocks:[
  {t:'eyebrow', text:'Module 4 · Worked example', src:'pp. 34–35'},
  {t:'title', text:'Pairing $n$ with $-n$'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','$x[n]=n$ for $-5\\le n\\le5$, repeated with period $N=11$.'],
      ['Find','All Fourier series coefficients.'],
      ['Method','The sum has eleven terms. The sequence is odd, so pair the term at $n$ with the term at $-n$ before doing anything else.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'eq', size:'sm', tex:'a_0=\\frac{1}{11}\\sum_{n=-5}^{5}n=\\frac{1}{11}\\bigl(-5-4-3-2-1+0+1+2+3+4+5\\bigr)=0'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', size:'sm', tex:'n\\,e^{-jk\\omega_0n}+(-n)\\,e^{+jk\\omega_0n}=n\\Bigl(e^{-jk\\omega_0n}-e^{+jk\\omega_0n}\\Bigr)=-2jn\\sin(k\\omega_0 n)',
        note:'With $\\omega_0=2\\pi/11$. The $n=0$ term contributes nothing.'},
      {t:'eq', key:true, size:'sm', tex:'a_k=-\\frac{2j}{11}\\sum_{m=1}^{5}m\\,\\sin\\!\\left(\\frac{2\\pi km}{11}\\right)',
        label:'Solution', note:'Written out: $a_k=-j\\tfrac{2}{11}\\sin\\!\\left(\\tfrac{2\\pi}{11}k\\right)-j\\tfrac{4}{11}\\sin\\!\\left(\\tfrac{4\\pi}{11}k\\right)-j\\tfrac{6}{11}\\sin\\!\\left(\\tfrac{6\\pi}{11}k\\right)-j\\tfrac{8}{11}\\sin\\!\\left(\\tfrac{8\\pi}{11}k\\right)-j\\tfrac{10}{11}\\sin\\!\\left(\\tfrac{10\\pi}{11}k\\right)$.'}]},
    {t:'reveal', at:3, items:[
      {t:'wex', rows:[
        ['Structure','Every coefficient is purely imaginary, because the sequence is real and odd. So every phase is $+\\pi/2$ or $-\\pi/2$, and only the sign has to be tracked.'],
        ['Largest','$|a_{\\pm1}|=1.7747$, and by periodicity the same value returns at $k=\\pm10,\\pm12,\\pm21,\\dots$'],
        ['Periodicity','$a_k=a_{k+11}$, so the eleven coefficients from $k=-5$ to $k=5$ are the whole answer.']
      ]}]},
    {t:'reveal', at:4, items:[
      {t:'note', kind:'ok', head:'The pairing is the method, not a trick', html:'Any real odd sequence collapses this way: the exponentials combine into sines, the real part cancels, and a sum of $N$ complex terms becomes a sum of about $N/2$ real ones. Doing it before expanding saves the algebra rather than checking it afterwards.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const f=n=>{ let m=n-11*Math.round(n/11); return m; };
      const a=P.Axes({w:820,h:215,xr:[-17,17],yr:[-6.4,6.4],xlabel:'n',ylabel:'x[n]',pad:{l:52,r:24,t:26,b:34},xtarget:8,ytarget:3});
      a.stem(D(f,-17,17),{color:C.in,r:3,showZero:true});
      return a.svg(); },
      caption:'The sequence: a ramp from $-5$ to $5$, repeating every 11 samples.'},
    {t:'reveal', at:3, items:[
      {t:'grid', cols:2, gap:'16px', items:[
        [{t:'fig', frame:true, svg:()=>{
          const S=k=>{ let s=0; for(let m=1;m<=5;m++) s+=(2*m/11)*Math.sin(2*Math.PI*k*m/11); return s; };
          const a=P.Axes({w:410,h:215,xr:[-17,17],yr:[-0.15,2.1],xlabel:'k',ylabel:'|a_k|',pad:{l:56,r:18,t:24,b:32},xtarget:5,ytarget:3});
          a.stem(D(k=>Math.abs(S(k)),-17,17),{color:C.in,r:2.4,showZero:true}); return a.svg(); },
          caption:'Peak $1.7747$.'}],
        [{t:'fig', frame:true, svg:()=>{
          const S=k=>{ let s=0; for(let m=1;m<=5;m++) s+=(2*m/11)*Math.sin(2*Math.PI*k*m/11); return s; };
          const a=P.Axes({w:410,h:215,xr:[-17,17],yr:[-2.0,2.0],xlabel:'k',ylabel:'\\angle a_k\\;[\\text{rad}]',pad:{l:58,r:18,t:24,b:32},xtarget:5,
            yticksOverride:[-Math.PI/2,0,Math.PI/2],ytickfmt:v=>v.toFixed(2)});
          a.stem(D(k=>Math.abs(S(k))<1e-9?0:(S(k)>0?-Math.PI/2:Math.PI/2),-17,17),{color:C.mid,r:2.4,showZero:true}); return a.svg(); },
          caption:'Only two phase values occur.'}]
      ]}]}
  ]}
]},

{ id:'m4-props-1', module:'M4', nav:'Properties · linearity, shift', title:'Linearity and the time shift', src:'p. 35',
  objective:'State and prove linearity and the time-shift property, and read what a shift does to magnitude.',
  keywords:'linearity property time shift proof magnitude unchanged phase ramp change of variable', steps:4, blocks:[
  {t:'eyebrow', text:'Module 4 · Properties', src:'p. 35'},
  {t:'title', text:'Two properties that do most of the work'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:'Write $x(t)\\leftrightarrow a_k$ to mean that $a_k$ are the coefficients of the periodic signal $x$. Both signals below share one period $T_0$, so both series share one $\\omega_0$.'},
    {t:'eq', key:true, tex:'A\\,x_1(t)+B\\,x_2(t)\\;\\longleftrightarrow\\;A\\,a_k+B\\,b_k', label:'(1) Linearity',
      note:'The same statement holds sample for sample in discrete time: $Ax_1[n]+Bx_2[n]\\leftrightarrow Aa_k+Bb_k$. It follows at once, because the analysis equation is an integral or a sum, and both are linear.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'x(t-t_0)\\;\\longleftrightarrow\\;a_k\\,e^{-jk\\omega_0t_0},\\qquad x[n-n_0]\\;\\longleftrightarrow\\;a_k\\,e^{-jk\\omega_0n_0}',
        label:'(2) Time shift', note:'With $\\omega_0=2\\pi/T_0$ in continuous time and $\\omega_0=2\\pi/N$ in discrete time.'}]},
    {t:'reveal', at:2, items:[
      {t:'body', html:'<b>Proof.</b> Let $y(t)=x(t-t_0)$ and substitute $\\tau=t-t_0$, so $\\d\\tau=\\d t$:'},
      {t:'eq', size:'sm', tex:'b_k=\\frac{1}{T_0}\\int_{T_0}x(t-t_0)e^{-jk\\omega_0t}\\,\\d t=\\frac{1}{T_0}\\int_{T_0}x(\\tau)e^{-jk\\omega_0(\\tau+t_0)}\\,\\d\\tau=e^{-jk\\omega_0t_0}\\,a_k'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'A shift never changes a magnitude', html:'The factor $e^{-jk\\omega_0t_0}$ has modulus 1, so $|b_k|=|a_k|$ at every $k$. All that changes is the phase, and it changes by $-k\\omega_0t_0$: proportional to the harmonic index. That is the same statement as the delay example at the start of the module, now in coefficient form.'}]},
    {t:'reveal', at:4, items:[
      {t:'note', kind:'warn', head:'A magnitude plot hides the shift', html:'Two signals that differ only by a delay have identical magnitude plots. Everything that distinguishes them lives in the phase, which is why a phase plot is not decoration.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:190,xr:[-2.2,2.2],yr:[-0.35,1.4],xlabel:'t',pad:{l:52,r:24,t:24,b:32},xtarget:7,ytarget:2});
      a.curve(t=>rectWave(t,2,0.5),{color:C.in,n:3000});
      a.curve(t=>rectWave(t-0.4,2,0.5),{color:C.mid,n:3000,dash:'6 4'});
      a.note(2.05,1.16,'x(t)\\;\\text{and}\\;x(t-t_0)',{anchor:'end',color:C.muted,fs:14,tex:true});
      return a.svg(); },
      caption:'A wave and the same wave delayed by $t_0=0.4$ s.'},
    {t:'reveal', at:3, items:[
      {t:'grid', cols:2, gap:'16px', items:[
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:210,xr:[-8,8],yr:[-0.15,0.62],xlabel:'k',ylabel:'|a_k|',pad:{l:56,r:18,t:24,b:32},xtarget:5,ytarget:3});
          a.stem(D(k=>k===0?0.5:Math.abs(Math.sin(Math.PI*k/2)/(Math.PI*k)),-8,8),{color:C.in,r:3,showZero:true}); return a.svg(); },
          caption:'Magnitudes before the shift.'}],
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:210,xr:[-8,8],yr:[-0.15,0.62],xlabel:'k',ylabel:'|b_k|',pad:{l:56,r:18,t:24,b:32},xtarget:5,ytarget:3});
          a.stem(D(k=>k===0?0.5:Math.abs(Math.sin(Math.PI*k/2)/(Math.PI*k)),-8,8),{color:C.mid,r:3,showZero:true}); return a.svg(); },
          caption:'Magnitudes after it. Identical.'}]
      ]},
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:200,xr:[-8,8],yr:[-3.6,3.6],xlabel:'k',ylabel:'\\angle b_k-\\angle a_k\\;[\\text{rad}]',pad:{l:62,r:24,t:26,b:32},xtarget:5,ytarget:3});
        a.stem(D(k=>{ let p=-k*Math.PI*0.4; while(p>Math.PI)p-=2*Math.PI; while(p<-Math.PI)p+=2*Math.PI; return p; },-8,8),{color:C.coral,r:3,showZero:true});
        return a.svg(); },
        caption:'The phase change alone, $-k\\omega_0t_0$, wrapped into $[-\\pi,\\pi]$. It grows with the harmonic index.'}]}
  ]}
]},

{ id:'m4-props-2', module:'M4', nav:'Properties · reversal, conjugation, product', title:'Reversal, conjugation and multiplication', src:'p. 36',
  objective:'State the remaining properties and get the summation range of the discrete-time product right.',
  keywords:'time reversal conjugation real even odd purely imaginary symmetry', steps:2, blocks:[
  {t:'eyebrow', text:'Module 4 · Properties', src:'p. 36'},
  {t:'title', text:'What symmetry does to the coefficients'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'eq', tex:'x(-t)\\;\\longleftrightarrow\\;a_{-k},\\qquad x[-n]\\;\\longleftrightarrow\\;a_{-k}', label:'(3) Time reversal',
      note:'Reversing the signal reverses the index. So an even signal has even coefficients, $a_k=a_{-k}$, and an odd signal has $a_k=-a_{-k}$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'x^{*}(t)\\;\\longleftrightarrow\\;a_{-k}^{*},\\qquad x^{*}[n]\\;\\longleftrightarrow\\;a_{-k}^{*}', label:'(4) Conjugation'},
      {t:'note', kind:'ok', head:'The three cases worth memorising', html:'<b>Real:</b> $x=x^{*}$ gives $a_k=a_{-k}^{*}$, so $|a_k|=|a_{-k}|$ and $\\angle a_k=-\\angle a_{-k}$.<br><b>Real and even:</b> the coefficients are real and even.<br><b>Real and odd:</b> the coefficients are purely imaginary and odd.'}]},
    {t:'reveal', at:2, items:[
      {t:'body', html:'The last case is worth one line of proof. Real gives $a_{-k}=a_k^{*}$; odd gives $a_{-k}=-a_k$. So $a_k^{*}=-a_k$, which forces $\\operatorname{Re}\\{a_k\\}=-\\operatorname{Re}\\{a_k\\}=0$: the coefficient is $j\\operatorname{Im}\\{a_k\\}$, purely imaginary. Both worked sawtooths obeyed this.'}]},
  ], right:[
    {t:'grid', cols:2, gap:'16px', items:[
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:172,xr:[-2.2,2.2],yr:[-0.3,1.35],xlabel:'t',pad:{l:48,r:18,t:22,b:32},xtarget:5,ytarget:2});
        a.curve(t=>rectWave(t,2,0.5),{color:C.in,n:2400});
        a.note(2.05,1.14,'\\text{real and even}',{anchor:'end',color:C.muted,fs:13,tex:true}); return a.svg(); }}],
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:172,xr:[-8,8],yr:[-0.25,0.62],xlabel:'k',ylabel:'a_k',pad:{l:54,r:18,t:24,b:32},xtarget:4,ytarget:3});
        a.stem(D(k=>k===0?0.5:Math.sin(Math.PI*k/2)/(Math.PI*k),-8,8),{color:C.in,r:3,showZero:true});
        return a.svg(); },
        caption:'Real and even coefficients.'}],
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:172,xr:[-2.2,2.2],yr:[-0.75,0.75],xlabel:'t',pad:{l:48,r:18,t:22,b:32},xtarget:5,ytarget:3});
        a.curve(t=>sawWave(t,1),{color:C.err,n:3000});
        a.note(2.05,0.62,'\\text{real and odd}',{anchor:'end',color:C.muted,fs:13,tex:true}); return a.svg(); }}],
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:172,xr:[-8,8],yr:[-0.2,0.2],xlabel:'k',ylabel:'\\operatorname{Im}\\{a_k\\}',pad:{l:60,r:18,t:24,b:32},xtarget:4,ytarget:3});
        a.stem(D(k=>k===0?0:Math.pow(-1,k)/(2*k*Math.PI),-8,8),{color:C.err,r:3,showZero:true});
        return a.svg(); },
        caption:'Purely imaginary, odd coefficients.'}]
    ]},
  ]}
]},

{ id:'m4-props-mult', module:'M4', nav:'Properties · multiplication', title:'Multiplying two signals', src:'pp. 36–37',
  objective:'State the multiplication property and get the discrete-time summation range right.',
  keywords:'multiplication property convolution of coefficients periodic convolution summation range diverge', steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Properties', src:'pp. 36–37'},
  {t:'title', text:'A product in time is a convolution in frequency'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'eq', key:true, tex:'x(t)\\,y(t)\\;\\longleftrightarrow\\;\\sum_{\\ell=-\\infty}^{\\infty}a_\\ell\\,b_{k-\\ell}', label:'Continuous time',
      note:'The sum runs over all integers, because a continuous-time series has infinitely many distinct coefficients.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'x[n]\\,y[n]\\;\\longleftrightarrow\\;\\sum_{\\ell=\\langle N\\rangle}a_\\ell\\,b_{k-\\ell}', label:'Discrete time',
        note:'The same convolution, but <b>periodic</b>: the sum runs over one period of $N$ consecutive values of $\\ell$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Why the discrete range must be one period', html:'A discrete-time coefficient sequence repeats, $a_k=a_{k+N}$, so an infinite sum over $\\ell$ would add each of the $N$ distinct products over and over and diverge. Restricting $\\ell$ to one period counts each product once — and the product $x[n]y[n]$ is itself periodic with period $N$, so it has $N$ coefficients and no more. Carrying the continuous-time range across is the standard slip here, and the result it gives is not merely inelegant but infinite.'}]},
    {t:'reveal', at:3, items:[
      {t:'wex', rows:[
        ['Read the shape of the answer','The two indices $\\ell$ and $k-\\ell$ add to $k$. That is what makes the operation a convolution; a sum of $a_\\ell b_{\\ell-k}$ would be a correlation instead.'],
        ['The other half of the pair','Convolving two signals in time multiplies their coefficients. The two statements are the two directions of one correspondence.']
      ]}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>P.blocks({w:820,h:150,items:[
      {t:'text',x:60,y:66,label:'x[n]\\,y[n]',anchor:'start',tex:true,fs:17,color:'#14707F'},
      {t:'arrow',x1:230,y1:60,x2:360,y2:60},
      {t:'box',x:360,y:36,w:180,h:48,label:'\\text{one period of }\\ell',tex:true,fs:15},
      {t:'arrow',x1:540,y1:60,x2:660,y2:60},
      {t:'text',x:690,y:66,label:'\\sum_{\\ell=\\langle N\\rangle}a_\\ell b_{k-\\ell}',anchor:'start',tex:true,fs:16,color:'#4A7A46'},
      {t:'text',x:400,y:130,label:'the sum stops after N terms',fs:13,anchor:'start',color:'#4A657F'}
    ]}), caption:'The discrete-time product convolves the coefficients over one period, and one period only.'},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:220,xr:[-13,13],yr:[-0.1,0.92],xlabel:'\\ell',ylabel:'a_\\ell',pad:{l:58,r:24,t:26,b:34},xtarget:7,ytarget:3});
        a.stem(D(k=>{ const m=((k%5)+5)%5; return (m===0)?0.5:(m===1||m===4?0.3:0.15); },-13,13),{color:C.mid,r:3,showZero:true});
        a.vline(0.5,{color:C.coral}); a.vline(5.5,{color:C.coral});
        a.span(0.5,5.5,0.66,'\\text{one period}',{color:C.coral,fs:13,tex:true});
        return a.svg(); },
        caption:'A discrete-time coefficient sequence, here with $N=5$. Everything outside the marked window is a copy of what is inside it, so summing over all $\\ell$ adds each product without end.'}]}
  ]}
]},

{ id:'m4-parseval', module:'M4', nav:'Parseval', title:'Power, harmonic by harmonic', src:'p. 37',
  objective:'State Parseval’s relation in both domains and use it as an accounting identity.',
  keywords:'parseval relation average power per harmonic energy accounting square summable', steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Properties', src:'p. 37'},
  {t:'title', text:'Nothing is lost in the decomposition'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'eq', key:true, size:'lg', tex:'\\frac{1}{T_0}\\int_{T_0}\\bigl|x(t)\\bigr|^{2}\\,\\d t=\\sum_{k=-\\infty}^{\\infty}\\bigl|a_k\\bigr|^{2}',
      label:'Parseval’s relation, continuous time'},
    {t:'eq', key:true, tex:'\\frac{1}{N}\\sum_{n=\\langle N\\rangle}\\bigl|x[n]\\bigr|^{2}=\\sum_{k=\\langle N\\rangle}\\bigl|a_k\\bigr|^{2}',
      label:'Parseval’s relation, discrete time'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'How to read it', html:'The left side is the average power of the signal over one period, under the normalised convention $R=1\\,\\Omega$. The right side splits that power into a share for each harmonic, and $|a_k|^{2}$ is the average power carried by the $k$-th harmonic alone. The two sides are equal, so the decomposition neither creates nor destroys power.'}]},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Rectangular wave, $T_0=4T_1$','Power $=2T_1/T_0=0.5$ W. Coefficients: $a_0^{2}=0.25$ and $2\\sum_{k\\ \\text{odd}}1/(\\pi k)^{2}=0.25$. They add to $0.5$.'],
        ['Sawtooth, $T_0=1$','Power $=\\int_{-1/2}^{1/2}t^{2}\\d t=1/12$. Coefficients: $2\\sum_{k\\ge1}1/(2\\pi k)^{2}=\\dfrac{1}{2\\pi^{2}}\\cdot\\dfrac{\\pi^{2}}{6}=\\dfrac{1}{12}$.']
      ]}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'It measures truncation directly', html:'The power discarded by keeping only $|k|\\le N$ is $\\sum_{|k|>N}|a_k|^{2}$, and that is exactly the mean-square error of the earlier scene. Parseval turns a question about a difference of two signals into a question about a tail of a series.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:250,xr:[-12,12],yr:[-0.02,0.3],xlabel:'k',ylabel:'|a_k|^{2}',pad:{l:60,r:24,t:26,b:34},xtarget:7,ytarget:4});
      a.stem(D(k=>{ const v = k===0?0.5:Math.sin(Math.PI*k/2)/(Math.PI*k); return v*v; },-12,12),{color:C.in,r:3,showZero:true});
      return a.svg(); },
      caption:'Power per harmonic for the rectangular wave with $T_0=4T_1$. The stems add to $0.5$ W, the average power of the signal.'},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:230,xr:[0,26],yr:[-0.02,0.70],xlabel:'N',ylabel:'\\text{power kept}',pad:{l:66,r:24,t:26,b:34},xtarget:7,ytarget:4});
        const kept=N=>{ let s=0.25; for(let k=1;k<=N;k++){ const v=Math.sin(Math.PI*k/2)/(Math.PI*k); s+=2*v*v; } return s; };
        a.poly(Array.from({length:26},(_,i)=>[i,kept(i)]),{color:C.out});
        a.hline(0.5,{color:C.coral,dash:'4 5'});
        a.note(25,0.62,'\\text{total }0.5',{anchor:'end',color:C.coral,fs:14,tex:true});
        return a.svg(); },
        caption:'Power captured by the first $N$ harmonics. It climbs towards the total but never quite reaches it in a finite number of terms.'}]}
  ]}
]},

{ id:'m4-lti', module:'M4', nav:'Series through an LTI system', title:'A periodic signal through an LTI system', src:'pp. 37–38',
  objective:'Derive b_k = a_k H(jkω₀) and give the conjugate-pair reassembly explicitly.',
  keywords:'frequency response b_k = a_k H(jk omega0) one product per harmonic', steps:2, blocks:[
  {t:'eyebrow', text:'Module 4 · The payoff', src:'pp. 37–38'},
  {t:'title', text:'One multiplication per harmonic'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:'Feed a periodic signal into an LTI system. Every harmonic is an eigenfunction, so each one comes out scaled by the frequency response evaluated at that harmonic’s frequency.'},
    {t:'eq', key:true, size:'lg', tex:'x(t)=\\sum_{k=-\\infty}^{\\infty}a_ke^{jk\\omega_0t}\\;\\longrightarrow\\;y(t)=\\sum_{k=-\\infty}^{\\infty}\\underbrace{a_kH(jk\\omega_0)}_{b_k}e^{jk\\omega_0t}',
      label:'Continuous time', note:'{{sym:bk|$b_k=a_kH(jk\\omega_0)$}}. The output is periodic with the same period as the input.'},
    {t:'eq', tex:'x[n]=\\sum_{k=\\langle N\\rangle}a_ke^{jk\\omega_0n}\\;\\longrightarrow\\;y[n]=\\sum_{k=\\langle N\\rangle}a_kH(e^{jk\\omega_0})e^{jk\\omega_0n}',
      label:'Discrete time'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'The whole of Module 3, replaced', html:'No flipping, no shifting, no case boundaries. The system is described by the single function $H$, and the calculation is one product per harmonic.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'What is being multiplied', html:'$a_k$ and $H(jk\\omega_0)$ are both complex. Magnitudes multiply and phases add: $|b_k|=|a_k||H(jk\\omega_0)|$ and $\\angle b_k=\\angle a_k+\\angle H(jk\\omega_0)$. A filter therefore reshapes a signal in two independent ways, and a magnitude plot alone shows only one of them.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>P.blocks({w:840,h:300,items:[
      {t:'text',x:50,y:44,label:'a_{-k}e^{-jk\\omega_0t}',anchor:'start',tex:true,fs:16,color:'#14707F'},
      {t:'arrow',x1:230,y1:38,x2:340,y2:38},{t:'box',x:340,y:16,w:130,h:44,label:'H(j\\omega)',tex:true},
      {t:'arrow',x1:470,y1:38,x2:560,y2:38},
      {t:'text',x:590,y:44,label:'b_{-k}e^{-jk\\omega_0t}',anchor:'start',tex:true,fs:16,color:'#4A7A46'},
      {t:'text',x:50,y:144,label:'a_0',anchor:'start',tex:true,fs:16,color:'#14707F'},
      {t:'arrow',x1:230,y1:138,x2:340,y2:138},{t:'box',x:340,y:116,w:130,h:44,label:'H(j\\omega)',tex:true},
      {t:'arrow',x1:470,y1:138,x2:560,y2:138},
      {t:'text',x:590,y:144,label:'a_0H(0)',anchor:'start',tex:true,fs:16,color:'#4A7A46'},
      {t:'text',x:50,y:244,label:'a_ke^{jk\\omega_0t}',anchor:'start',tex:true,fs:16,color:'#14707F'},
      {t:'arrow',x1:230,y1:238,x2:340,y2:238},{t:'box',x:340,y:216,w:130,h:44,label:'H(j\\omega)',tex:true},
      {t:'arrow',x1:470,y1:238,x2:560,y2:238},
      {t:'text',x:590,y:244,label:'b_ke^{jk\\omega_0t}',anchor:'start',tex:true,fs:16,color:'#4A7A46'},
      {t:'line',d:'M30 88 h780',color:'#D9D0BE'},
      {t:'line',d:'M30 188 h780',color:'#D9D0BE'}
    ]}), caption:'Each harmonic travels through the system on its own. Nothing crosses between the rows, which is what makes the method work.'}
  ]}
]},

{ id:'m4-pairing', module:'M4', nav:'Putting the output together', title:'Putting a real output back together', src:'p. 38',
  objective:'Derive the conjugate-pair reassembly and name the factor of two and the phase convention.',
  keywords:'conjugate pair reassembly factor of two phase convention real output positive index', steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · The step that is easy to skip', src:'p. 38'},
  {t:'title', text:'Two terms make one cosine'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:'The output above is a sum of complex terms, and a real system driven by a real signal gives a real output. For real $x$ and real $h$ both $a_{-k}=a_k^{*}$ and $H(-j\\omega)=H^{*}(j\\omega)$, so $b_{-k}=b_k^{*}$. Pair each $k$ with $-k$:'},
    {t:'eq', key:true, size:'lg', tex:'b_ke^{jk\\omega_0t}+b_{-k}e^{-jk\\omega_0t}=\\bigl|b_k\\bigr|e^{j(k\\omega_0t+\\angle b_k)}+\\bigl|b_k\\bigr|e^{-j(k\\omega_0t+\\angle b_k)}=2\\bigl|b_k\\bigr|\\cos\\bigl(k\\omega_0t+\\angle b_k\\bigr)',
      label:'Conjugate-pair reassembly'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'y(t)=b_0+\\sum_{k=1}^{\\infty}2\\bigl|b_k\\bigr|\\cos\\bigl(k\\omega_0t+\\angle b_k\\bigr)', label:'Real form of the output',
        note:'$b_0=a_0H(0)$ is real and stands alone: it has no partner to pair with, so it carries no factor of two.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'The factor of two, and whose phase to use', html:'The amplitude of the $k$-th cosine is $2|b_k|$, not $|b_k|$: both members of the pair contribute. And the phase is $\\angle b_k$, the one belonging to <b>positive</b> $k$; using $\\angle b_{-k}$ flips the sign of that cosine’s phase. Writing $|b_k|\\cos(k\\omega_0t+\\angle b_{-k})$ makes both errors at once, and the result has half the right swing and the wrong shape.'}]},
    {t:'reveal', at:3, items:[
      {t:'wex', rows:[
        ['Check','Set $H=1$, the identity system. The formula must return $x$ itself. It does, and any version missing the factor of two returns half of $x$ plus its full average — which is visibly not $x$.'],
        ['In discrete time','The same reassembly applies, with one exception: when $N$ is even the term at $k=N/2$ is its own partner and enters once, as $b_{N/2}(-1)^{n}$.']
      ]}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:840,h:250,xr:[0,4],yr:[-2.0,2.0],xlabel:'t',pad:{l:52,r:24,t:26,b:34},xtarget:7,ytarget:3});
      a.curve(t=>0.6*Math.cos(Math.PI*t-0.8)+0.6*Math.cos(-Math.PI*t+0.8),{color:C.out,n:1600});
      a.curve(t=>0.6*Math.cos(Math.PI*t-0.8),{color:C.err,n:1600,dash:'6 4'});
      a.note(3.9,1.72,'\\text{pair}',{anchor:'end',color:C.out,fs:14,tex:true});
      a.note(3.9,-1.76,'\\text{one term only}',{anchor:'end',color:C.err,fs:14,tex:true});
      return a.svg(); },
      caption:'The two members of a conjugate pair add to a cosine of twice the amplitude. Keeping one of them halves the answer.'},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:230,xr:[0,4],yr:[-2.0,2.0],xlabel:'t',pad:{l:52,r:24,t:26,b:34},xtarget:7,ytarget:3});
        a.curve(t=>1.2*Math.cos(Math.PI*t-0.8),{color:C.out,n:1600});
        a.curve(t=>0.6*Math.cos(Math.PI*t+0.8),{color:C.err,n:1600,dash:'6 4'});
        a.note(3.9,1.74,'\\text{correct}',{anchor:'end',color:C.out,fs:14,tex:true});
        a.note(3.9,-1.76,'\\text{halved and reflected}',{anchor:'end',color:C.err,fs:14,tex:true});
        return a.svg(); },
        caption:'Dropping the factor of two and reading the phase off the negative index at the same time. The period is right; nothing else is.'}]}
  ]}
]},

{ id:'m4-lpf', module:'M4', nav:'Worked example · low-pass', title:'Worked example — low-pass filtering', src:'pp. 38–39',
  objective:'Filter a four-term periodic signal and assemble the real output correctly.',
  keywords:'low pass filtering example e^{-t}u(t) H = 1/(1+j omega) coefficients output amplitudes phases', steps:4, blocks:[
  {t:'eyebrow', text:'Module 4 · Worked example', src:'pp. 38–39'},
  {t:'title', text:'A first-order low-pass filter'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','$x(t)=1+\\cos(\\pi t)+\\sin(2\\pi t)+\\cos\\!\\left(3\\pi t+\\dfrac{\\pi}{3}\\right)$ into a system with $h(t)=e^{-t}u(t)$.'],
      ['Find','The output signal and its Fourier series coefficients.'],
      ['Method','Get $H(j\\omega)$ from $h$. Get $T_0$ and the $a_k$ from $x$. Multiply, then reassemble in conjugate pairs.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'eq', size:'sm', tex:'H(j\\omega)=\\int_{0}^{\\infty}e^{-t}e^{-j\\omega t}\\,\\d t=\\frac{1}{1+j\\omega},\\qquad \\bigl|H(j\\omega)\\bigr|=\\frac{1}{\\sqrt{1+\\omega^{2}}},\\qquad \\angle H(j\\omega)=-\\arctan\\omega'},
      {t:'small', html:'The magnitude falls from 1 at $\\omega=0$ towards 0 as $\\omega\\to\\infty$: a low-pass filter.'}]},
    {t:'reveal', at:2, items:[
      {t:'small', html:'Component periods $2$, $1$ and $2/3$ s give $T_0=\\operatorname{LCM}(2,1,2)/\\operatorname{GCD}(1,1,3)=2$ s, so $\\omega_0=\\pi$ rad/s.'},
      {t:'eq', size:'sm', tex:'a_0=1,\\quad a_{\\pm1}=\\tfrac12,\\quad a_2=\\tfrac{1}{2j},\\quad a_{-2}=-\\tfrac{1}{2j},\\quad a_3=\\tfrac12 e^{j\\pi/3},\\quad a_{-3}=\\tfrac12 e^{-j\\pi/3}'}]},
    {t:'reveal', at:3, items:[
      {t:'wex', rows:[
        ['$b_0$','$1\\cdot H(0)=1$'],
        ['$b_1$','$\\tfrac12\\cdot\\dfrac{1}{1+j\\pi}=0.1517\\,e^{-j1.2626}$'],
        ['$b_2$','$\\tfrac{1}{2j}\\cdot\\dfrac{1}{1+j2\\pi}=0.0786\\,e^{-j2.9838}$'],
        ['$b_3$','$\\tfrac12 e^{j\\pi/3}\\cdot\\dfrac{1}{1+j3\\pi}=0.0528\\,e^{-j0.4178}$']
      ]}]},
    {t:'reveal', at:4, items:[
      {t:'eq', key:true, size:'sm', tex:'y(t)=1+0.303\\cos(\\pi t-1.263)+0.157\\cos(2\\pi t-2.984)+0.106\\cos(3\\pi t-0.418)',
        label:'Solution', note:'Each cosine amplitude is $2|b_k|$, and each phase is $\\angle b_k$ with $k$ positive. The constant term is $b_0$ on its own.'},
      {t:'wex', rows:[
        ['Check the amplitudes','$2\\times0.1517=0.303$, $2\\times0.0786=0.157$, $2\\times0.0528=0.106$. Reporting $0.15$, $0.08$ and $0.05$ instead means the pairing step was skipped.'],
        ['Check the shape','$y$ swings roughly from $0.62$ to $1.42$; halved amplitudes would give only $0.81$ to $1.21$. The average is untouched because $|H(0)|=1$, and the third harmonic is cut to about a tenth.']
      ]}]}
  ], right:[
    {t:'grid', cols:2, gap:'16px', items:[
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:175,xr:[0,20],yr:[-0.1,1.15],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'|H(j\\omega)|',pad:{l:60,r:18,t:26,b:36},xtarget:4,ytarget:3});
        a.curve(w=>1/Math.sqrt(1+w*w),{color:C.h,n:900}); return a.svg(); }}],
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:175,xr:[0,20],yr:[-1.75,0.3],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'\\angle H(j\\omega)\\;[\\text{rad}]',pad:{l:64,r:18,t:26,b:36},xtarget:4,ytarget:3});
        a.curve(w=>-Math.atan(w),{color:C.h,n:900}); return a.svg(); }}]
    ]},
    {t:'reveal', at:3, items:[
      {t:'grid', cols:2, gap:'16px', items:[
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:168,xr:[-4,4],yr:[-0.1,1.2],xlabel:'k',ylabel:'|a_k|',pad:{l:56,r:18,t:24,b:32},xtarget:5,ytarget:3});
          a.stem(D(k=>k===0?1:(Math.abs(k)<=3?0.5:0),-4,4),{color:C.in,r:3,showZero:true}); return a.svg(); }}],
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:168,xr:[-4,4],yr:[-0.1,1.2],xlabel:'k',ylabel:'|b_k|',pad:{l:56,r:18,t:24,b:32},xtarget:5,ytarget:3});
          const B=[0.0528,0.0786,0.1517,1,0.1517,0.0786,0.0528];
          a.stem(D(k=>Math.abs(k)<=3?B[k+3]:0,-4,4),{color:C.out,r:3,showZero:true}); return a.svg(); },
          caption:'The higher harmonics are cut hardest.'}]
      ]}]},
    {t:'reveal', at:4, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:192,xr:[-4,4],yr:[-1.4,3.6],xlabel:'t',pad:{l:52,r:24,t:26,b:34},xtarget:7,ytarget:4});
        a.curve(t=>1+Math.cos(Math.PI*t)+Math.sin(2*Math.PI*t)+Math.cos(3*Math.PI*t+Math.PI/3),{color:C.in,n:2400});
        a.curve(t=>1+0.303316*Math.cos(Math.PI*t-1.262627)+0.157177*Math.cos(2*Math.PI*t-2.983761)+0.105510*Math.cos(3*Math.PI*t-0.417840),{color:C.out,n:2400});
        a.note(3.9,3.3,'x(t)',{anchor:'end',color:C.in,fs:15,tex:true});
        a.note(3.9,-1.2,'y(t)',{anchor:'end',color:C.out,fs:15,tex:true});
        return a.svg(); },
        caption:'Input and output on one axis. The output keeps the same period and the same average, with its faster detail smoothed away.'}]}
  ]}
]},

{ id:'m4-hpf', module:'M4', nav:'Worked example · high-pass', title:'Worked example — high-pass filtering', src:'pp. 39–40',
  objective:'Repeat the calculation for a high-pass response and get every phase from the positive index.',
  keywords:'high pass filtering j omega/(1+j omega) DC removed phase convention positive index worked', steps:4, blocks:[
  {t:'eyebrow', text:'Module 4 · Worked example', src:'pp. 39–40'},
  {t:'title', text:'The same input, the opposite filter'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','The same $x(t)=1+\\cos(\\pi t)+\\sin(2\\pi t)+\\cos\\!\\left(3\\pi t+\\dfrac{\\pi}{3}\\right)$, now into a system with $H(j\\omega)=\\dfrac{j\\omega}{1+j\\omega}$.'],
      ['Find','The output signal.'],
      ['Method','Unchanged: multiply each $a_k$ by $H(jk\\omega_0)$, then reassemble in conjugate pairs. Only $H$ is different.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'eq', size:'sm', tex:'\\bigl|H(j\\omega)\\bigr|=\\frac{|\\omega|}{\\sqrt{1+\\omega^{2}}},\\qquad \\angle H(j\\omega)=\\frac{\\pi}{2}\\operatorname{sgn}(\\omega)-\\arctan\\omega'},
      {t:'note', kind:'ok', head:'The DC term disappears, and that is not an accident', html:'$H(j0)=0$ exactly, so $b_0=a_0H(0)=0$. The average of the output is zero for <em>every</em> input this system sees, and that is what a high-pass filter is for. Say it rather than leave a missing term to be noticed.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', size:'sm', tex:'b_0=0,\\qquad b_1=0.4764\\,e^{+j0.3082},\\qquad b_2=0.4938\\,e^{-j1.4130},\\qquad b_3=0.4972\\,e^{+j1.1530}',
        label:'One product per harmonic', note:'Each is $a_kH(jk\\pi)$, formed as $\\tfrac12\\cdot\\tfrac{j\\pi}{1+j\\pi}$, $\\tfrac{1}{2j}\\cdot\\tfrac{j2\\pi}{1+j2\\pi}$ and $\\tfrac12e^{j\\pi/3}\\cdot\\tfrac{j3\\pi}{1+j3\\pi}$.'}]},
    {t:'reveal', at:3, items:[
      {t:'eq', key:true, size:'sm', tex:'y(t)=0.953\\cos(\\pi t+0.308)+0.988\\cos(2\\pi t-1.413)+0.994\\cos(3\\pi t+1.153)',
        label:'Solution', note:'No constant term, because $b_0=0$.'}]},
    {t:'reveal', at:4, items:[
      {t:'note', kind:'err', head:'Two errors that arrive together', html:'The amplitudes are $2|b_k|$, so $0.953$, $0.988$, $0.994$ — not $0.48$, $0.49$, $0.50$. And the phases come from the <b>positive</b> index: $+0.308$, $-1.413$, $+1.153$. Reading them off $b_{-k}$ gives $-0.308$, $+1.413$, $-1.153$, which reverses the first and third while the middle term still looks plausible.'},
      {t:'small', html:'Check: $|H(jk\\pi)|$ is $0.953$, $0.988$ and $0.994$ for $k=1,2,3$ — nearly 1. The first three harmonics pass almost untouched and only the average is removed, so the output should look like $x$ with its DC level subtracted. It does.'}]}
  ], right:[
    {t:'grid', cols:2, gap:'16px', items:[
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:155,xr:[-20,20],yr:[-0.1,1.15],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'|H(j\\omega)|',pad:{l:60,r:18,t:26,b:36},xtarget:4,ytarget:3});
        a.curve(w=>Math.abs(w)/Math.sqrt(1+w*w),{color:C.h,n:1600}); return a.svg(); }}],
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:155,xr:[-20,20],yr:[-1.9,1.9],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'\\angle H(j\\omega)\\;[\\text{rad}]',pad:{l:64,r:18,t:26,b:36},xtarget:4,ytarget:3});
        a.curve(w=>Math.abs(w)<1e-9?0:(Math.PI/2)*Math.sign(w)-Math.atan(w),{color:C.h,n:2400}); return a.svg(); }}]
    ]},
    {t:'reveal', at:2, items:[
      {t:'grid', cols:2, gap:'16px', items:[
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:150,xr:[-4,4],yr:[-0.1,0.62],xlabel:'k',ylabel:'|b_k|',pad:{l:56,r:18,t:24,b:32},xtarget:5,ytarget:3});
          const B=[0.4972,0.4938,0.4764,0,0.4764,0.4938,0.4972];
          a.stem(D(k=>Math.abs(k)<=3?B[k+3]:0,-4,4),{color:C.out,r:3,showZero:true}); return a.svg(); },
          caption:'Only the stem at $k=0$ is removed.'}],
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:150,xr:[-4,4],yr:[-2.0,2.0],xlabel:'k',ylabel:'\\angle b_k\\;[\\text{rad}]',pad:{l:60,r:18,t:24,b:32},xtarget:5,
            yticksOverride:[-Math.PI/2,0,Math.PI/2],ytickfmt:v=>v.toFixed(2)});
          const Ph=[-1.1530,1.4130,-0.3082,0,0.3082,-1.4130,1.1530];
          a.stem(D(k=>Math.abs(k)<=3?Ph[k+3]:0,-4,4),{color:C.mid,r:3,showZero:true}); return a.svg(); },
          caption:'Odd in $k$.'}]
      ]}]},
    {t:'reveal', at:3, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:840,h:178,xr:[-4,4],yr:[-2.6,3.6],xlabel:'t',pad:{l:52,r:24,t:26,b:34},xtarget:7,ytarget:4});
        a.curve(t=>1+Math.cos(Math.PI*t)+Math.sin(2*Math.PI*t)+Math.cos(3*Math.PI*t+Math.PI/3),{color:C.in,n:2400});
        a.curve(t=>0.952891*Math.cos(Math.PI*t+0.308169)+0.987573*Math.cos(2*Math.PI*t-1.412965)+0.994418*Math.cos(3*Math.PI*t+1.152956),{color:C.out,n:2400});
        a.note(3.9,3.3,'x(t)',{anchor:'end',color:C.in,fs:15,tex:true});
        a.note(3.9,-2.4,'y(t)',{anchor:'end',color:C.out,fs:15,tex:true});
        return a.svg(); },
        caption:'Input and output. The shape survives almost unchanged; what has gone is the constant level of 1.'}]}
  ]}
]},

{ id:'m4-dt-filt', module:'M4', nav:'Worked example · discrete high-pass', title:'Worked example — a discrete first difference', src:'pp. 40–41',
  objective:'Filter a period-4 impulse train with a two-tap high-pass system.',
  keywords:'discrete filtering two tap first difference impulse train period 4 frequency response high pass', steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Worked example', src:'pp. 40–41'},
  {t:'title', text:'Two taps, and the average removed'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','$x[n]=\\displaystyle\\sum_{m=-\\infty}^{\\infty}\\delta[n-4m]$, an impulse train of period $N=4$, into $h_1[n]=0.5\\delta[n]-0.5\\delta[n-1]$.'],
      ['Find','The output signal.'],
      ['Method','The coefficients of the input first, then one product per harmonic, then the reassembly.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'eq', size:'sm', tex:'a_k=\\frac{1}{4}\\sum_{n=0}^{3}x[n]e^{-jk(2\\pi/4)n}=\\frac{1}{4}\\,x[0]=\\frac{1}{4}\\quad\\text{for every }k',
        note:'Only $n=0$ carries a sample inside the period, and its exponential is $e^{0}=1$. The discrete impulse train has a flat spectrum, exactly like its continuous-time counterpart. Here $\\omega_0=2\\pi/4=\\pi/2$ rad/sample.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', size:'sm', tex:'H_1(e^{j\\omega})=0.5-0.5e^{-j\\omega}=0.5\\bigl(1-e^{-j\\omega}\\bigr)',
        note:'$|H_1|=0$ at $\\omega=0$ and $|H_1|=1$ at $\\omega=\\pi$: a high-pass system, and a first difference.'},
      {t:'wex', rows:[
        ['$b_0$','$\\tfrac14\\cdot0.5(1-1)=0$'],
        ['$b_1$','$\\tfrac14\\cdot0.5(1-e^{-j\\pi/2})=0.125(1+j)=0.1768\\,e^{+j\\pi/4}$'],
        ['$b_2$','$\\tfrac14\\cdot0.5(1-e^{-j\\pi})=0.25$'],
        ['$b_{-1}=b_3$','$0.1768\\,e^{-j\\pi/4}$']
      ]}]},
    {t:'reveal', at:3, items:[
      {t:'eq', key:true, tex:'y[n]=0.36\\cos\\!\\left(\\frac{\\pi}{2}n+\\frac{\\pi}{4}\\right)+0.25(-1)^{n}', label:'Solution, high-pass'},
      {t:'small', html:'The pair $k=\\pm1$ gives $2|b_1|=0.354\\approx0.36$ with phase $+\\pi/4=0.79$ rad. The term $k=2$ sits at the edge of the period and has no distinct partner inside it, so it stands alone as $b_2e^{j\\pi n}=0.25(-1)^{n}$. The average is zero, as $b_0=0$ requires.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:170,xr:[-13,13],yr:[-0.2,1.3],xlabel:'n',ylabel:'x[n]',pad:{l:52,r:24,t:26,b:32},xtarget:7,ytarget:2});
      a.stem(D(n=>(((n%4)+4)%4===0)?1:0,-13,13),{color:C.in,r:3,showZero:true});
      return a.svg(); },
      caption:'The input: one impulse every four samples.'},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:820,h:190,xr:[-Math.PI,Math.PI],yr:[-0.1,1.15],xlabel:'\\omega\\;[\\text{rad/sample}]',ylabel:'|H_1(e^{j\\omega})|',pad:{l:62,r:24,t:26,b:36},xtarget:5,ytarget:3});
        a.curve(w=>Math.abs(0.5*Math.sqrt((1-Math.cos(w))*(1-Math.cos(w))+Math.sin(w)*Math.sin(w))),{color:C.h,n:900});
        for(let kk=-2;kk<=2;kk++){ const w=kk*Math.PI/2;
          a.point(w, Math.abs(0.5*Math.sqrt((1-Math.cos(w))*(1-Math.cos(w))+Math.sin(w)*Math.sin(w))),{color:C.coral,r:4}); }
        return a.svg(); },
        caption:'The response, with the four harmonics of the input marked. It repeats every $2\\pi$ in $\\omega$, so only $-\\pi<\\omega\\le\\pi$ needs drawing.'}]},
    {t:'reveal', at:3, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:180,xr:[-13,13],yr:[-0.75,0.75],xlabel:'n',ylabel:'y[n]',pad:{l:52,r:24,t:26,b:32},xtarget:7,ytarget:3});
        a.stem(D(n=>0.353553*Math.cos(Math.PI*n/2+Math.PI/4)+0.25*Math.pow(-1,n),-13,13),{color:C.out,r:3,showZero:true});
        return a.svg(); },
        caption:'Each impulse becomes a $+0.5$ followed by a $-0.5$, and the average is zero.'}]}
  ]}
]},

{ id:'m4-dt-filt-b', module:'M4', nav:'Worked example · discrete low-pass', title:'Worked example — a discrete two-point average', src:'p. 41',
  objective:'Repeat the discrete filtering calculation for the low-pass system and compare the two.',
  keywords:'discrete low pass two point average impulse train comparison DC term kept nyquist term', steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Worked example', src:'p. 41'},
  {t:'title', text:'The same input, the other two-tap system'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','The same impulse train of period $N=4$, now into $h_2[n]=0.5\\delta[n]+0.5\\delta[n-1]$.'],
      ['Find','The output signal.'],
      ['Method','Unchanged. Only the sign of the second tap is different.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'eq', size:'sm', tex:'H_2(e^{j\\omega})=0.5+0.5e^{-j\\omega}',
        note:'Now $|H_2|=1$ at $\\omega=0$ and $|H_2|=0$ at $\\omega=\\pi$: a low-pass system, and a two-point average.'},
      {t:'wex', rows:[
        ['$b_0$','$\\tfrac14\\cdot0.5(1+1)=0.25$'],
        ['$b_1$','$\\tfrac14\\cdot0.5(1+e^{-j\\pi/2})=0.125(1-j)=0.1768\\,e^{-j\\pi/4}$'],
        ['$b_2$','$\\tfrac14\\cdot0.5(1+e^{-j\\pi})=0$']
      ]}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'y[n]=0.25+0.36\\cos\\!\\left(\\frac{\\pi}{2}n-\\frac{\\pi}{4}\\right)', label:'Solution, low-pass'}]},
    {t:'reveal', at:3, items:[
      {t:'wex', rows:[
        ['Compare','The high-pass system kills $b_0$ and keeps $b_2$; the low-pass system keeps $b_0$ and kills $b_2$. Both amplitudes still carry the factor of two from the pairing, which is why $0.1768$ appears in the table and $0.36$ in the answer.'],
        ['Check both directly','Applying $0.5x[n]\\pm0.5x[n-1]$ to the impulse train reproduces each answer sample for sample.'],
        ['Both responses repeat','$H(e^{j\\omega})$ is periodic in $\\omega$ with period $2\\pi$, so only $-\\pi<\\omega\\le\\pi$ has to be plotted. There is no such repetition in continuous time.']
      ]}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:820,h:190,xr:[-Math.PI,Math.PI],yr:[-0.1,1.15],xlabel:'\\omega\\;[\\text{rad/sample}]',ylabel:'|H_2(e^{j\\omega})|',pad:{l:62,r:24,t:26,b:36},xtarget:5,ytarget:3});
      a.curve(w=>Math.abs(0.5*Math.sqrt((1+Math.cos(w))*(1+Math.cos(w))+Math.sin(w)*Math.sin(w))),{color:C.h,n:900});
      for(let kk=-2;kk<=2;kk++){ const w=kk*Math.PI/2;
        a.point(w, Math.abs(0.5*Math.sqrt((1+Math.cos(w))*(1+Math.cos(w))+Math.sin(w)*Math.sin(w))),{color:C.coral,r:4}); }
      return a.svg(); },
      caption:'The low-pass response, with the same four harmonics marked. The one at $\\omega=\\pi$ now falls on a zero.'},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:180,xr:[-13,13],yr:[-0.2,0.75],xlabel:'n',ylabel:'y[n]',pad:{l:52,r:24,t:26,b:32},xtarget:7,ytarget:3});
        a.stem(D(n=>0.25+0.353553*Math.cos(Math.PI*n/2-Math.PI/4),-13,13),{color:C.out,r:3,showZero:true});
        return a.svg(); },
        caption:'Each impulse is spread over two samples of $0.5$, and the average survives.'}]}
  ]}
]},

{ id:'m4-lab-f', module:'M4', nav:'Laboratory F · Reconstruction', title:'Laboratory F — Fourier-Series Reconstruction Studio', src:'pp. 29–35',
  objective:'Watch a partial sum approach a waveform, and watch the Gibbs overshoot refuse to.',
  keywords:'laboratory F reconstruction partial sum harmonics MSE gibbs overshoot square sawtooth triangle', steps:0, blocks:[
  {t:'eyebrow', text:'Interactive laboratory F', src:'pp. 29–35'},
  {t:'title', text:'Adding harmonics, one at a time'},
  {t:'lede', text:'Choose a waveform and a number of harmonics. The panels show the partial sum against the true signal, the coefficients as stems, and the two numbers that decide whether the approximation is good: the mean-square error, and the overshoot beside the jump.'},
  {t:'lab', id:'F'}
]},

{ id:'m4-lab-g', module:'M4', nav:'Laboratory G · Frequency response', title:'Laboratory G — LTI Frequency-Response Demonstrator', src:'pp. 37–41',
  objective:'Follow one signal through the chain a_k → H → b_k → y and expose the pairing step.',
  keywords:'laboratory G frequency response filtering chain b_k = a_k H cutoff low pass high pass reassembly', steps:0, blocks:[
  {t:'eyebrow', text:'Interactive laboratory G', src:'pp. 37–41'},
  {t:'title', text:'From coefficients to output, one step at a time'},
  {t:'lede', text:'Pick a system and a cutoff. The four panels follow the same signal through the whole chain, and the last step can be shown with or without the factor of two, so the size of that error is visible rather than described.'},
  {t:'lab', id:'G'}
]},

{ id:'m4-qbank', module:'M4', nav:'Module 4 question bank', title:'Module 4 — question bank', src:'pp. 22–41',
  objective:'Twelve questions covering Module 4 outcomes.',
  keywords:'questions quiz Q4 bank module 4 exercises fourier series', steps:0, blocks:[
  {t:'eyebrow', text:'Module 4 · Question bank Q4-01 … Q4-12', src:'pp. 22–41'},
  {t:'title', text:'Question bank'},
  {t:'small', html:'Everything needed is in Modules 1–4. Several questions target the missing factor of two when a real output is reassembled, and several test whether the discrete-time statements are being carried over from the continuous-time ones.'},
  {t:'qbank', module:'M4'}
]},

{ id:'m4-synth', module:'M4', nav:'Module 4 synthesis', title:'Module 4 — what to carry forward', src:'pp. 22–41',
  dark:true, objective:'Consolidate the module and open the question the Fourier transform answers.',
  keywords:'synthesis summary module 4 checklist aperiodic preview fourier transform envelope', steps:2, blocks:[
  {t:'eyebrow', text:'Module 4 · Synthesis', src:'pp. 22–41'},
  {t:'title', text:'A checklist, and the signal it cannot handle'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:`<p style="color:#DED5C6"><b>1.</b> Confirm the signal is periodic, and find $T_0$ or $N$ before anything else.</p>
      <p style="color:#DED5C6"><b>2.</b> Set $\\omega_0=2\\pi/T_0$ or $2\\pi/N$, and express every component frequency as a multiple of it. That multiple is $k$.</p>
      <p style="color:#DED5C6"><b>3.</b> If the signal is already a sum of sinusoids, read the coefficients off with Euler’s relations. Otherwise integrate or sum, and treat $k=0$ separately.</p>
      <p style="color:#DED5C6"><b>4.</b> Check $a_0$ against the average of the signal by eye, and check the symmetry: real gives $a_{-k}=a_k^{*}$.</p>
      <p style="color:#DED5C6"><b>5.</b> Through an LTI system, $b_k=a_kH(jk\\omega_0)$ — one product per harmonic.</p>
      <p style="color:#DED5C6"><b>6.</b> To return to a real signal, pair $k$ with $-k$: the amplitude is $2|b_k|$ and the phase is $\\angle b_k$. The term $b_0$ stands alone.</p>`},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'Two checks catch nearly every error', html:'<span style="color:#DED5C6">A coefficient plot that is not symmetric in the right way means the signal is not real, or the algebra is wrong. An output whose swing is half of what the harmonics suggest means the pairing step lost its factor of two.</span>'}]}
  ], right:[
    {t:'raw', html:'<p class="eyebrow" style="margin-bottom:14px"><span class="tick"></span>Where Module 5 begins</p>'},
    {t:'lede', text:'Everything here needed the signal to repeat. A single pulse does not repeat, has no fundamental period, and therefore has no harmonics to carry coefficients. So what happens to a Fourier series when the period is made longer and longer?'},
    {t:'reveal', at:2, items:[
      {t:'body', html:`<p style="color:#DED5C6">The rectangular wave already answered it. Its coefficients were samples of one envelope, $E(\\omega)$, taken every $\\omega_0=2\\pi/T_0$. Lengthen the period and the envelope does not move; only the samples crowd together and shrink as $1/T_0$.</p>`},
      {t:'eq', plain:true, tex:'T_0a_k=E(k\\omega_0)\\quad\\xrightarrow{\\;T_0\\to\\infty\\;}\\quad X(j\\omega)=\\int_{-\\infty}^{\\infty}x(t)e^{-j\\omega t}\\,\\d t'},
      {t:'body', html:`<p style="color:#DED5C6">In the limit the stems merge into the curve they were always sampling. That curve is the <b>Fourier transform</b>, and it is the whole of Module 5.</p>`}]}
  ]}
]}

];
window.SCENES_M4 = SC;
})();
