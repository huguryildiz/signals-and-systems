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
  {t:'title', level:1, text:'What a signal is,<br>and what it carries'},
  {t:'lede', text:'Before any system acts on a signal, four questions need answers. How much energy or power does it carry? How does it move under shifting and scaling? Does it repeat? What happens when it is built out of exponentials?'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'body', html:`<p style="color:#CFC5B4">This module runs from the first definitions to the discrete-time periodicity condition. Two results here cause most of the later mistakes:</p>`},
    {t:'note', kind:'warn', head:'Result 1', html:'<span style="color:#DED5C6">A signal is <em>energy-type</em>, <em>power-type</em>, or <em>neither</em>. These are not opposites and the third case is real.</span>'},
    {t:'note', kind:'warn', head:'Result 2', html:'<span style="color:#DED5C6">A discrete-time sinusoid is periodic only when $\\omega_0/2\\pi$ is rational. Continuous-time sinusoids carry no such condition.</span>'}
  ], right:[
    /* The page under these two figures is navy, so the axis, the tick numbers
       and the axis names are drawn in the ink of that page. */
    {t:'grid', cols:1, gap:'24px', items:[
      [{t:'fig', svg:()=>{
        const a=P.Axes({w:760,h:300,xr:[0,14],yr:[-1.15,1.15],grid:false,
          xlabel:'t',ylabel:'x(t)=e^{-t/6}\\cos(2t)',
          chrome:{axis:'rgba(239,231,216,.34)',tick:'#9EACB9',name:'#EFE7D8'},
          pad:{l:46,r:30,t:22,b:34},xstep:2,ytarget:3});
        a.curve(t=>Math.exp(-t/6)*Math.cos(2*t),{color:'#7FC3CE',width:2.4});
        return a.svg();
      }}],
      [{t:'fig', svg:()=>{
        const a=P.Axes({w:760,h:300,xr:[0,27],yr:[-1.15,1.15],grid:false,
          xlabel:'n',ylabel:'x[n]=\\cos(2\\pi n/9)',
          chrome:{axis:'rgba(239,231,216,.34)',tick:'#9EACB9',name:'#EFE7D8'},
          pad:{l:46,r:30,t:22,b:34},xstep:9,ytarget:3});
        a.stem(disc(n=>Math.cos(2*Math.PI*n/9),0,27),{color:'#E3B45E',r:4.2,width:1.8});
        return a.svg();
      }}]
    ]}
  ]}
]},

{ id:'m1-def', module:'M1', nav:'Definitions and notation', title:'Definitions and notation', src:'p. 2',
  objective:'Fix the CT/DT notation and the meaning of the independent variable.',
  keywords:'x(t) x[n] notation integer time index continuous discrete stem', steps:2, blocks:[
  {t:'eyebrow', text:'Module 1 · Foundations', src:'p. 2'},
  {t:'title', text:'Two notations, held apart on purpose'},
  {t:'cols', ratio:'c-5-7', left:[
    {t:'eq', tex:'x(t),\\qquad \\forall t\\in\\mathbb{R}', label:'Continuous time',
      note:'Round brackets. The signal is defined at every real instant.'},
    {t:'eq', tex:'x[n],\\qquad \\forall n\\in\\mathbb{Z}', label:'Discrete time',
      note:'Square brackets. {{sym:xn|The index $n$}} is an <b>integer time index</b> — not a time in seconds. Plotted with <code>stem(·)</code>.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'err', head:'Notation is not decoration', html:'Writing $x[t]$ or $x(n)$ is not just a typing slip. It states the wrong domain. Every later statement about periodicity, convolution limits and transform periodicity then breaks.'}]},
    {t:'reveal', at:2, items:[
      {t:'body', html:'A signal need not be a function of time. An image is a signal of two space variables. The same algebra applies, so <em>spatial</em> aliasing appears in Module 7 next to the time-domain kind.'}]}
  ], right:[
    {t:'grid', cols:1, gap:'10px', items:[
      [{t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:230,xr:[0,20],yr:[-1.35,1.35],xlabel:'t',ylabel:'x(t)=\\cos(t)',
          pad:{l:56,r:26,t:22,b:38},xtarget:6,ytarget:3});
        a.curve(t=>Math.cos(t),{color:C.in}); return a.svg();
      }}],
      [{t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:230,xr:[0,20],yr:[-1.35,1.35],xlabel:'n',ylabel:'x[n]=\\cos(n)',
          pad:{l:56,r:26,t:22,b:38},xtarget:6,ytarget:3});
        a.stem(disc(n=>Math.cos(n),0,20),{color:C.mid}); return a.svg();
      }, caption:'The discrete signal is <b>only</b> the dots. A curve drawn through them is a separate object, and it has to be justified. Module 7 does that.'}]
    ]}
  ]}
]},

{ id:'m1-power', module:'M1', nav:'Instantaneous power', title:'From circuit power to signal power', src:'p. 2',
  objective:'Derive the normalised energy/power definitions from the physical ones.',
  keywords:'instantaneous power energy resistor normalised R=1 joule watt', steps:3, blocks:[
  {t:'eyebrow', text:'Module 1 · Energy and power', src:'p. 2'},
  {t:'title', text:'Where $|x|^2$ comes from'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:'Start from a resistor, not from an abstraction. For a voltage $v(t)$ across a resistance $R$:'},
    {t:'eq', tex:'p(t)=v(t)\\,i(t)=v(t)\\left(\\frac{v(t)}{R}\\right)=\\frac{1}{R}\\,v^{2}(t)',
      label:'Instantaneous power', note:'Units: watts. The square of the voltage signal is what carries the power.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'E=\\int_{t_1}^{t_2}p(t)\\,\\d t=\\int_{t_1}^{t_2}\\frac{1}{R}v^{2}(t)\\,\\d t',
        label:'Energy over a finite window', note:'Energy = power × time, integrated because the power varies.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'The convention used from here on', html:'From here on the factor $1/R$ is dropped and the power is written $|x(t)|^{2}$. This is the <b>normalised</b> convention, $R=1\\ \\Omega$. It is standard, and it is why energies are quoted in joules with no resistance named. Put the $1/R$ back whenever you need a physical number.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Why the modulus', html:'Signals may be complex-valued, and $|x(t)|^{2}=x(t)\\,x^{*}(t)$ is the quantity that is real and non-negative. Writing $x^{2}(t)$ instead is correct only for real signals.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:760,h:270,xr:[0,8],yr:[-1.5,1.5],xlabel:'t',pad:{l:52,r:26,t:20,b:38},xtarget:5,ytarget:3});
      a.curve(t=>Math.cos(1.7*t),{color:C.in});
      a.note(7.8,1.15,'v(t)',{anchor:'end',color:C.in,fs:15,tex:true});
      return a.svg(); }},
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:760,h:270,xr:[0,8],yr:[-0.15,1.62],xlabel:'t',pad:{l:52,r:26,t:20,b:38},xtarget:5,ytarget:3});
      a.area(t=>Math.pow(Math.cos(1.7*t),2),1.2,4.4,{color:'rgba(190,85,57,.18)'});
      a.curve(t=>Math.pow(Math.cos(1.7*t),2),{color:C.coral});
      a.note(7.8,1.05,'p(t)=v^{2}(t)\\;\\;(R=1)',{anchor:'end',color:C.coral,fs:15,tex:true});
      a.span(1.2,4.4,1.30,'\\text{energy}=\\text{shaded area}',{color:C.coral,tex:true});
      return a.svg(); },
      caption:'Energy is the area under the instantaneous-power curve. Everything that follows asks one question: does that area stay finite as the window grows?'}
  ]}
]},

{ id:'m1-energy-inf', module:'M1', nav:'Total energy', title:'Total energy over an infinite interval', src:'p. 2',
  objective:'State E∞ in both domains and flag non-convergence.',
  keywords:'E infinity total energy integral summation converge', steps:2, blocks:[
  {t:'eyebrow', text:'Module 1 · Energy and power', src:'p. 2'},
  {t:'title', text:'Opening the window'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'eq', key:true, size:'lg',
      tex:'E_\\infty\\;\\triangleq\\;\\lim_{T\\to\\infty}\\int_{-T}^{T}|x(t)|^{2}\\,\\d t\\;=\\;\\int_{-\\infty}^{\\infty}|x(t)|^{2}\\,\\d t',
      label:'Continuous time'},
    {t:'eq', key:true, size:'lg',
      tex:'E_\\infty\\;\\triangleq\\;\\lim_{N\\to\\infty}\\sum_{n=-N}^{N}|x[n]|^{2}\\;=\\;\\sum_{n=-\\infty}^{\\infty}|x[n]|^{2}',
      label:'Discrete time'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'err', head:'Two warnings belong here', html:'<b>The integral may not converge. The summation may not converge.</b> $E_\\infty$ is defined as a limit. A limit that does not exist is not a large number. It is the absence of an answer. That failure is useful information: it is what makes a signal power-type.'}]},
    {t:'reveal', at:2, items:[
      {t:'body', html:'The symmetric limit $\\lim_{T\\to\\infty}\\int_{-T}^{T}$ matters. It is what lets a two-sided signal be treated at all. The same symmetric limit returns in the definition of average power.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:780,h:300,xr:[-6,6],yr:[-0.1,1.15],xlabel:'t',pad:{l:52,r:26,t:22,b:38},xtarget:7,ytarget:3});
      a.area(t=>Math.exp(-Math.abs(t)),-4,4,{color:'rgba(20,112,127,.16)'});
      a.curve(t=>Math.exp(-Math.abs(t)),{color:C.in});
      a.vline(-4,{color:C.coral}); a.vline(4,{color:C.coral});
      a.span(-4,4,1.06,'\\text{window }-T\\ldots T',{color:C.coral,tex:true});
      return a.svg(); },
      caption:'<b>Converging.</b> As $T$ grows the shaded area approaches a finite limit. The tails contribute less and less.'},
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:780,h:300,xr:[-6,6],yr:[-1.4,1.4],xlabel:'t',pad:{l:52,r:26,t:22,b:38},xtarget:7,ytarget:3});
      a.area(t=>Math.pow(Math.cos(2*t),2),-4,4,{color:'rgba(166,59,42,.15)'});
      a.curve(t=>Math.cos(2*t),{color:C.err});
      a.vline(-4,{color:C.coral}); a.vline(4,{color:C.coral});
      return a.svg(); },
      caption:'<b>Diverging.</b> Every new period adds the same area, so $E_\\infty\\to\\infty$. The useful question is now the <em>rate</em> at which area builds up. That rate is average power.'}
  ]}
]},

{ id:'m1-avgpower', module:'M1', nav:'Average power', title:'Average power', src:'p. 2',
  objective:'State P over a window and P∞ in both domains, with the 2N+1 count.',
  keywords:'average power P infinity 2N+1 time averaged', steps:2, blocks:[
  {t:'eyebrow', text:'Module 1 · Energy and power', src:'p. 2'},
  {t:'title', text:'Energy per unit time'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'eq', tex:'P=\\frac{1}{t_2-t_1}\\int_{t_1}^{t_2}p(t)\\,\\d t', label:'Average power over a finite window',
      note:'Divide the energy by the length of the window.'},
    {t:'eq', key:true, tex:'P_\\infty\\;\\triangleq\\;\\lim_{T\\to\\infty}\\frac{1}{2T}\\int_{-T}^{T}|x(t)|^{2}\\,\\d t', label:'Continuous time'},
    {t:'eq', key:true, tex:'P_\\infty\\;\\triangleq\\;\\lim_{N\\to\\infty}\\frac{1}{2N+1}\\sum_{n=-N}^{N}|x[n]|^{2}', label:'Discrete time'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Why the count is 2N + 1', html:'$2N+1$ is the <b>number of samples</b> from $-N$ to $+N$, with both ends included. Using $2N$ gives the same limit, but the wrong value at finite $N$. That difference shows up at once in estimates from short records.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Reading the definition correctly', html:'$P_\\infty$ is <em>not</em> "the energy divided by infinity". It is the limit of a ratio. That ratio can settle at any value greater than or equal to zero. Zero is what happens for every energy-type signal.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:780,h:340,xr:[0,40],yr:[-0.06,0.62],xlabel:'T\\;(\\text{half-window})',
        ylabel:'\\text{running average power}',pad:{l:60,r:26,t:22,b:40},xtarget:5,ytarget:4});
      const pts=[],qts=[];
      for(let i=1;i<=200;i++){ const T=i*0.2;
        pts.push([T, 0.5 - Math.sin(4*T)/(8*T)]);
        qts.push([T, 1/(2*T)]); }
      a.poly(pts,{color:C.in}); a.poly(qts,{color:C.out});
      a.hline(0.5,{color:C.in,dash:'2 5'});
      a.note(38,0.545,'u(t):\\;P_\\infty=1/2',{anchor:'end',color:C.in,fs:14,tex:true});
      a.note(38,0.09,'\\text{rectangular pulse}:\\;P_\\infty=0',{anchor:'end',color:C.out,fs:14,tex:true});
      return a.svg(); },
      caption:'The two limits, as functions of the window half-width $T$. A power signal settles on a non-zero value. An energy signal is driven to zero by the $1/2T$ factor, however large its energy is.'}
  ]}
]},

{ id:'m1-classify', module:'M1', nav:'Energy, power, or neither', title:'Energy, power, or neither', src:'p. 3',
  objective:'State the two classifications and the third case that is not  list.',
  keywords:'energy signal power signal neither classification finite infinite', steps:3, blocks:[
  {t:'eyebrow', text:'Module 1 · Energy and power', src:'p. 3'},
  {t:'title', text:'Three outcomes, not two'},
  {t:'cols', ratio:'c-5-7', left:[
    {t:'note', kind:'ok', head:'Energy signals', html:'Finite energy $\\bigl(E_\\infty<\\infty\\bigr)$ <b>and</b> zero average power $\\bigl(P_\\infty=0\\bigr)$.'},
    {t:'note', kind:'warn', head:'Power signals', html:'Finite power $\\bigl(P_\\infty<\\infty\\bigr)$ <b>and</b> infinite energy $\\bigl(E_\\infty\\to\\infty\\bigr)$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'err', head:'Neither: the case the two lines above miss', html:'If a signal grows without bound, <em>both</em> quantities diverge. $x(t)=t\\,u(t)$ has $E_\\infty\\to\\infty$ and $P_\\infty\\to\\infty$. It is neither an energy signal nor a power signal.'}]},
    {t:'reveal', at:2, items:[
      {t:'body', html:'Look at the logic. The two conditions in each definition are <b>not independent</b>. Finite energy forces $P_\\infty=0$, because a finite numerator divided by $2T\\to\\infty$ goes to zero. The second condition follows from the first. It is not an extra test.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Engineering reading', html:'Energy-type signals are transients: pulses, decaying responses, anything that ends. Power-type signals are steady states: sinusoids, constants, noise that runs on without end. The class tells you which quantity is worth measuring.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:840,h:250,xr:[-2,3],yr:[-0.3,1.4],xlabel:'t',pad:{l:50,r:24,t:20,b:36},xtarget:6,ytarget:3});
      a.area(t=>(t>=0&&t<=1)?1:0,0,1,{color:'rgba(74,122,70,.18)'});
      a.curve(t=>(t>=0&&t<=1)?1:0,{color:C.out});
      a.note(2.8,1.15,'energy-type',{anchor:'end',color:C.out,fs:15,italic:true});
      return a.svg(); }},
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:840,h:250,xr:[-6,6],yr:[-0.6,5.2],xlabel:'n',pad:{l:50,r:24,t:20,b:36},xtarget:7,ytarget:3});
      a.stem(disc(()=>4,-6,6),{color:C.h});
      a.note(5.6,4.7,'power-type',{anchor:'end',color:C.h,fs:15,italic:true});
      return a.svg(); }},
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:840,h:250,xr:[-2,4],yr:[-0.4,4.4],xlabel:'t',pad:{l:50,r:24,t:20,b:36},xtarget:6,ytarget:3});
      a.curve(t=>t>=0?t:0,{color:C.err});
      a.note(2.0,3.9,'neither',{anchor:'end',color:C.err,fs:15,italic:true});
      return a.svg(); }}
  ]}
]},

{ id:'m1-ex-energy', module:'M1', nav:'Worked example · classification', title:'Worked example — classify two signals', src:'p. 3',
  objective:'Reproduce both source examples with full method and sanity checks.',
  keywords:'example rectangular pulse constant sequence energy power worked', steps:4, blocks:[
  {t:'eyebrow', text:'Module 1 · Worked example', src:'p. 3'},
  {t:'title', text:'Two examples, worked in full'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given', '$x(t)=\\begin{cases}1,&0\\le t\\le 1\\\\ 0,&\\text{otherwise}\\end{cases}$'],
      ['Find', 'Is $x(t)$ an energy signal or a power signal?'],
      ['Method', 'Evaluate $E_\\infty$ first. If it is finite, $P_\\infty=0$ follows and the classification is settled.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'eq', size:'sm', tex:'E_\\infty=\\int_{-\\infty}^{\\infty}|x(t)|^{2}\\d t=\\int_{0}^{1}|1|^{2}\\d t = 1<\\infty'},
      {t:'eq', size:'sm', tex:'P_\\infty=\\lim_{T\\to\\infty}\\frac{1}{2T}\\int_{-T}^{T}|x(t)|^{2}\\d t=\\lim_{T\\to\\infty}\\frac{1}{2T}\\underbrace{\\int_{0}^{1}1\\,\\d t}_{=1}=\\lim_{T\\to\\infty}\\frac{1}{2T}=0'},
      {t:'wex', rows:[
        ['Solution','$E_\\infty=1$ J, $P_\\infty=0$ W ⇒ <b>energy-type signal</b>.'],
        ['Interpretation','A finite pulse delivers a fixed amount of energy and then stops. Averaged over all time it delivers no power.'],
        ['Sanity check','Halving the amplitude must divide the energy by four, and $\\int_0^1(1/2)^2\\d t=1/4$. The dependence is quadratic, as it must be for a squared quantity.']
      ]}]}
  ], right:[
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given','$x[n]=4,\\quad \\forall n\\in\\mathbb{Z}$'],
        ['Find','Is $x[n]$ an energy signal or a power signal?'],
        ['Method','$E_\\infty$ clearly diverges, so go straight to $P_\\infty$ and use the count $2N+1$.']
      ]}]},
    {t:'reveal', at:3, items:[
      {t:'eq', size:'sm', tex:'E_\\infty=\\sum_{n=-\\infty}^{\\infty}|4|^{2}\\;\\to\\;\\infty'},
      {t:'eq', size:'sm', tex:'P_\\infty=\\lim_{N\\to\\infty}\\frac{1}{2N+1}\\sum_{n=-N}^{N}|4|^{2}=\\lim_{N\\to\\infty}\\frac{(2N+1)\\cdot16}{2N+1}=16<\\infty'},
      {t:'wex', rows:[
        ['Solution','$E_\\infty\\to\\infty$, $P_\\infty=16$ ⇒ <b>power-type signal</b>.'],
        ['Sanity check','A constant of amplitude $A$ must have $P_\\infty=A^{2}$, and $A=4$ gives 16. The factor $2N+1$ cancels exactly, which confirms that the count was right.']
      ]}]},
    {t:'reveal', at:4, items:[
      {t:'note', kind:'err', head:'Most common error on this pair', html:'Concluding "infinite energy, therefore infinite power". The factor $1/(2N+1)$ does the work here. A diverging sum divided by a diverging count can converge, and here it does.'}]}
  ]},
  {t:'instr', head:'Presenter cue', html:'Ask the class to predict $P_\\infty$ for $x[n]=4$ <em>before</em> revealing step 3. The common guesses are 4 and ∞. Both are worth discussing.'}
]},

{ id:'m1-lab-b', module:'M1', nav:'Laboratory B · Energy and power', title:'Laboratory B — Energy and Power Classifier', src:'pp. 2–3, 7, 16–18',
  objective:'Classify source-grounded signals before seeing the calculation.',
  keywords:'laboratory classifier energy power neither interactive', steps:0, blocks:[
  {t:'eyebrow', text:'Interactive laboratory B', src:'pp. 2–3'},
  {t:'title', text:'Classify first, then verify'},
  {t:'lede', text:'Choose a class before the integral appears. The aim is to learn to read convergence off the shape of a signal.'},
  {t:'lab', id:'B'}
]},

{ id:'m1-shift', module:'M1', nav:'Time shifting', title:'Time shifting', src:'p. 3',
  objective:'Fix the delay/advance sign convention.',
  keywords:'time shift delay advance t0 x(t-t0)', steps:2, blocks:[
  {t:'eyebrow', text:'Module 1 · Signal operations', src:'p. 3'},
  {t:'title', text:'Delay is a subtraction'},
  {t:'cols', ratio:'c-4-8', vcenter:true, left:[
    {t:'eq', key:true, tex:'x(t)\\;\\longrightarrow\\;x(t-t_0)', label:'Time shift'},
    {t:'note', kind:'def', head:'Sign convention', html:'$t_0>0$ ⇒ <b>delay</b> (the signal moves right, later).<br>$t_0<0$ ⇒ <b>advance</b> (the signal moves left, earlier).'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'Why it feels backwards', html:'The graph moves right, but the argument is $t-t_0$. Read it as a question about <em>when</em>. The output at time $t$ shows what the input did at the earlier time $t-t_0$. The value has been held back by $t_0$ seconds.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Discrete time works the same way', html:'$x[n]\\to x[n-n_0]$ with $n_0\\in\\mathbb{Z}$. A one-sample delay, $x[n-1]$, is the basic memory element in every difference equation in Module 3.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const tri=t=>Math.abs(t)<=1?1-Math.abs(t):0;
      const a=P.Axes({w:1000,h:320,xr:[-5,5],yr:[-0.55,1.35],xlabel:'t',pad:{l:50,r:26,t:24,b:40},xtarget:11,ytarget:3});
      a.curve(t=>tri(t+3),{color:C.out}); a.curve(tri,{color:C.ink});
      a.curve(t=>tri(t-3),{color:C.in});
      a.note(-3,1.14,'x(t+3)',{anchor:'middle',color:C.out,fs:15,tex:true});
      a.note(0,1.14,'x(t)',{anchor:'middle',color:C.ink,fs:15,tex:true});
      a.note(3,1.14,'x(t-3)',{anchor:'middle',color:C.in,fs:15,tex:true});
      a.span(-3,0,-0.38,'advance by 3 s',{color:C.out});
      a.span(0,3,-0.38,'delay by 3 s',{color:C.in});
      return a.svg(); },
      caption:'The pulse shape does not change. Only its position on the time axis changes.'}
  ]}
]},

{ id:'m1-reverse-scale', module:'M1', nav:'Reversal and scaling', title:'Reversal and scaling', src:'pp. 3–4',
  objective:'State reversal and scaling and their effect on the support.',
  keywords:'time reversal flip scaling decimation expansion a>1 compression', steps:3, blocks:[
  {t:'eyebrow', text:'Module 1 · Signal operations', src:'pp. 3–4'},
  {t:'title', text:'Reversal and scaling'},
  {t:'cols', ratio:'c-5-7', left:[
    {t:'eq', tex:'x(t)\\;\\longrightarrow\\;x(-t)\\qquad\\bigl(x[n]\\to x[-n]\\bigr)', label:'Time reversal',
      note:'A reflection about the vertical axis.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'y(t)=x(at),\\qquad a>0', label:'Time scaling',
        note:'$a>1$ ⇒ <b>decimation</b> (compressed, sped up). $0<a<1$ ⇒ <b>expansion</b> (stretched, slowed down).'},
      {t:'note', kind:'warn', head:'A notation caution', html:'Scaling is often written “$x(t)=x(at)$”. Read it as the definition of a <em>new</em> signal, $y(t)=x(at)$. Taken literally, that equation would force $a=1$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'What scaling does to the support', html:'If $x$ is supported on $[\\alpha,\\beta]$, then $x(at)$ is supported on $[\\alpha/a,\\beta/a]$. The <em>width</em> scales by $1/a$, so compressing in time by 2 halves the duration. Module 5 shows that the spectrum does the opposite.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'Discrete time is not symmetric', html:'$x[2n]$ <b>throws away</b> the odd-indexed samples. This is real decimation, and it destroys information. $x[n/2]$ is not even defined at odd $n$ without a rule for interpolation. Continuous-time scaling can be undone. Discrete-time decimation cannot.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const r=t=>(t>=1&&t<=3)?1:0;
      const a=P.Axes({w:900,h:210,xr:[-1,7],yr:[-0.2,1.35],xlabel:'t',pad:{l:48,r:24,t:20,b:34},xtarget:9,ytarget:2});
      a.curve(r,{color:C.ink}); a.note(2,1.16,'x(t)',{anchor:'middle',color:C.ink,fs:15,tex:true});
      return a.svg(); }},
    {t:'fig', frame:true, svg:()=>{
      const r=t=>(t>=1&&t<=3)?1:0;
      const a=P.Axes({w:900,h:210,xr:[-1,7],yr:[-0.2,1.35],xlabel:'t',pad:{l:48,r:24,t:20,b:34},xtarget:9,ytarget:2});
      a.curve(t=>r(2*t),{color:C.mid}); a.note(1,1.16,'x(2t)\\;\\text{— decimation}',{anchor:'middle',color:C.mid,fs:15,tex:true});
      a.span(0.5,1.5,-0.12,'width halved',{color:C.mid});
      return a.svg(); }},
    {t:'fig', frame:true, svg:()=>{
      const r=t=>(t>=1&&t<=3)?1:0;
      const a=P.Axes({w:900,h:210,xr:[-1,7],yr:[-0.2,1.35],xlabel:'t',pad:{l:48,r:24,t:20,b:34},xtarget:9,ytarget:2});
      a.curve(t=>r(0.5*t),{color:C.h}); a.note(4,1.16,'x(0.5t)\\;\\text{— expansion}',{anchor:'middle',color:C.h,fs:15,tex:true});
      a.span(2,6,-0.12,'width doubled',{color:C.h});
      return a.svg(); },
      caption:'Scaling moves the support. Compression by 2 maps $[1,3]\\to[0.5,1.5]$, and expansion by 2 maps $[1,3]\\to[2,6]$.'}
  ]}
]},

{ id:'m1-combined', module:'M1', nav:'Combined transformations', title:'Combining operations: shift, then scale', src:'p. 4',
  objective:'Establish the correct two-step order for x(at−b).',
  keywords:'combination shift then scale order x(at-b) intermediate v(t)', steps:4, blocks:[
  {t:'eyebrow', text:'Module 1 · Signal operations', src:'p. 4'},
  {t:'title', text:'The order is not negotiable'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:'Given $x(t)$, how do we find $x(at-b)$?'},
    {t:'eq', key:true, tex:'\\text{(1)}\\quad v(t)=x(t-b)\\qquad\\text{(2)}\\quad y(t)=v(at)=x(at-b)',
      label:'Shift, then scale', note:'Shift by $b$ first; scale the <em>result</em> by $a$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'err', head:'What the other order gives', html:'Scaling first gives $w(t)=x(at)$. Shifting that by $b$ gives $w(t-b)=x\\bigl(a(t-b)\\bigr)=x(at-ab)$. Unless $a=1$ this is a <b>different signal</b>. It is shifted by $b$ instead of by $b/a$.'}]},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Given','$x(t)$: 0 for $t<-2$; 1 on $[-2,0]$; 2 on $[0,2]$; falling linearly from 2 to 0 on $[2,4]$.'],
        ['Find','Plot $x(3t-5)$.'],
        ['Method','$a=3$, $b=5$. Shift right by 5, then compress by 3.']
      ]}]},
    {t:'reveal', at:3, items:[
      {t:'wex', rows:[
        ['Solution','$v(t)=x(t-5)$ has breakpoints at $3,5,7,9$. Then $y(t)=v(3t)$ has breakpoints at $1,\\;5/3,\\;7/3,\\;3$.'],
        ['Sanity check','The duration must shrink by exactly $a=3$. The original spans $[-2,4]$, a width of 6. The result spans $[1,3]$, a width of 2. ✓'],
        ['Interpretation','Neither operation changes the amplitude. Only the time axis is relabelled.']
      ]}]},
    {t:'reveal', at:4, items:[
      {t:'note', kind:'def', head:'A one-line check that always works', html:'Whichever route you take, check where the argument vanishes. $y$ takes the value $x(0)$ when $at-b=0$, that is at $t=b/a$. Here $t=5/3$, which is where the level $x(0)=2$ starts in the plotted result.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const x=t=> t<-2?0 : t<0?1 : t<2?2 : t<4?(4-t) : 0;
      const a=P.Axes({w:880,h:206,xr:[-3,10],yr:[-0.3,2.5],xlabel:'t',pad:{l:48,r:24,t:18,b:32},xtarget:9,ytarget:3});
      a.curve(x,{color:C.ink}); a.note(9.6,2.2,'x(t)',{anchor:'end',color:C.ink,fs:15,tex:true});
      return a.svg(); }},
    {t:'fig', frame:true, svg:()=>{
      const x=t=> t<-2?0 : t<0?1 : t<2?2 : t<4?(4-t) : 0;
      const a=P.Axes({w:880,h:206,xr:[-3,10],yr:[-0.3,2.5],xlabel:'t',pad:{l:48,r:24,t:18,b:32},xtarget:9,ytarget:3});
      a.curve(t=>x(t-5),{color:C.mid});
      a.note(9.6,2.2,'v(t)=x(t-5)',{anchor:'end',color:C.mid,fs:15,tex:true});
      [3,5,7,9].forEach(b=>a.vline(b,{color:C.mid,opacity:.5}));
      return a.svg(); }},
    {t:'fig', frame:true, svg:()=>{
      const x=t=> t<-2?0 : t<0?1 : t<2?2 : t<4?(4-t) : 0;
      const a=P.Axes({w:880,h:206,xr:[-3,10],yr:[-0.3,2.5],xlabel:'t',pad:{l:48,r:24,t:18,b:32},xtarget:9,ytarget:3});
      a.curve(t=>x(3*t-5),{color:C.out});
      a.note(9.6,2.2,'y(t)=x(3t-5)',{anchor:'end',color:C.out,fs:15,tex:true});
      [1,5/3,7/3,3].forEach(b=>a.vline(b,{color:C.out,opacity:.5}));
      return a.svg(); },
      caption:'Breakpoints map $3,5,7,9\\;\\to\\;1,\\,5/3,\\,7/3,\\,3$.'}
  ]}
]},

{ id:'m1-lab-a', module:'M1', nav:'Laboratory A · Transformations', title:'Laboratory A — Signal Transformation Laboratory', src:'pp. 3–4',
  objective:'Explore x(at−b) with live support and critical-point tracking.',
  keywords:'laboratory transformation shift scale reversal support critical points', steps:0, blocks:[
  {t:'eyebrow', text:'Interactive laboratory A', src:'pp. 3–4'},
  {t:'title', text:'Shift, then scale, with the controls in your hands'},
  {t:'lab', id:'A'}
]},

{ id:'m1-periodic', module:'M1', nav:'Periodicity', title:'Periodicity', src:'p. 5',
  objective:'Define CT and DT periodicity and the fundamental period.',
  keywords:'periodic aperiodic fundamental period T0 N0 omega0 fundamental frequency', steps:3, blocks:[
  {t:'eyebrow', text:'Module 1 · Periodicity', src:'p. 5'},
  {t:'title', text:'Repetition, defined carefully'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'note', kind:'def', head:'Continuous time', html:'$x(t)$ is <b>periodic</b> if there exists a constant $T>0$ such that $x(t)=x(t+T)$ for all $t\\in\\mathbb{R}$.'},
    {t:'note', kind:'def', head:'Discrete time', html:'$x[n]$ is <b>periodic</b> if there exists an <b>integer</b> constant $N>0$ such that $x[n]=x[n+N]$ for all $n\\in\\mathbb{Z}$.'},
    {t:'body', html:'A signal that is not periodic is <b>aperiodic</b>. Watch the two quantifiers. <em>There exists</em> a period, and it must work <em>for all</em> $t$ (or $n$). Both halves are needed.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'The integer requirement is the whole story', html:'In continuous time $T$ may be any positive real number. In discrete time $N$ must be an <b>integer</b>. There is no such thing as a period of 3.5 samples. Every discrete-time surprise in this course comes back to this one line.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'\\omega_0=\\frac{2\\pi}{T_0}\\qquad\\text{and}\\qquad \\omega_0=\\frac{2\\pi}{N_0}',
        label:'Fundamental frequency',
        note:'{{sym:T0|$T_0$}} is the <b>smallest</b> $T>0$ satisfying the periodicity condition; {{sym:N0|$N_0$}} is the smallest such positive integer.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Why "smallest" matters', html:'If $T$ is a period, then so is every $kT$. A signal with period 4 also has periods $8,12,16,\\dots$, and the smallest of them fixes $T_0=4$. Without the word "smallest", $\\omega_0$ would not be well defined, and the harmonic numbering of Module 4 would fail.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const saw=t=>{const u=((t%4)+4)%4; return u/2-1;};
      const a=P.Axes({w:900,h:250,xr:[0,20],yr:[-1.4,2.05],xlabel:'t',ylabel:'x(t)',pad:{l:56,r:26,t:22,b:36},xtarget:10,ytarget:3});
      a.curve(saw,{color:C.in,n:2000});
      a.span(8,12,1.12,'T_0=4',{color:C.coral,tex:true}); a.span(8,16,1.76,'T=8',{color:C.muted,tex:true});
      return a.svg(); },
      caption:'A period of 8 works as well, but the fundamental period is the smallest one, $T_0=4$.'},
    {t:'fig', frame:true, svg:()=>{
      const f=n=>{const u=((n%8)+8)%8; return [1,3,5,3,1,0,-1,0][u];};
      const a=P.Axes({w:900,h:250,xr:[-16,16],yr:[-1.8,6],xlabel:'n',ylabel:'y[n]',pad:{l:56,r:26,t:22,b:36},xtarget:9,ytarget:4});
      a.stem(disc(f,-16,16),{color:C.mid});
      a.span(0,8,5.4,'N_0=8',{color:C.coral,tex:true});
      return a.svg(); },
      caption:'Periods $N=8,16,24,\\dots$; the fundamental period is $N_0=8$.'}
  ]}
]},

{ id:'m1-evenodd', module:'M1', nav:'Even and odd', title:'Even and odd parts', src:'pp. 5–6',
  objective:'Define even/odd and the unique decomposition.',
  keywords:'even odd decomposition Ev Od symmetry x(0)=0', steps:2, blocks:[
  {t:'eyebrow', text:'Module 1 · Symmetry', src:'pp. 5–6'},
  {t:'title', text:'Every signal splits, exactly once'},
  {t:'cols', ratio:'c-5-7', left:[
    {t:'note', kind:'def', head:'Definitions', html:'<b>Even</b>: $x(t)=x(-t)$ (or $x[n]=x[-n]$).<br><b>Odd</b>: $x(t)=-x(-t)$ (or $x[n]=-x[-n]$).'},
    {t:'note', kind:'warn', head:'An immediate consequence', html:'For an odd signal, setting $t=0$ gives $x(0)=-x(0)$, so $x(0)=0$. A signal with $x(0)\\neq0$ cannot be odd. That is a one-second test.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\Ev\\{x(t)\\}=\\tfrac12 x(t)+\\tfrac12 x(-t),\\qquad \\Od\\{x(t)\\}=\\tfrac12 x(t)-\\tfrac12 x(-t)'},
      {t:'eq', key:true, tex:'x(t)=\\Ev\\{x(t)\\}+\\Od\\{x(t)\\}', label:'Decomposition',
        note:'Adding the two definitions returns $x$ exactly. The same construction works without change for $x[n]$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Why this is worth carrying forward', html:'The decomposition is unique, and it works well with the Fourier transform. A real even signal has a purely real transform. A real odd signal has a purely imaginary one. The symmetry work done here pays off in Modules 5 and 6.'}]}
  ], right:[
    {t:'grid', cols:3, gap:'18px', items:[
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:420,h:250,xr:[-1,1],yr:[-0.15,1.15],xlabel:'t',pad:{l:44,r:20,t:20,b:34},xtarget:3,ytarget:3});
        a.curve(t=>t*t,{color:C.in}); a.vline(0,{color:C.err,dash:'4 4'}); return a.svg(); },
        caption:'$x_1(t)=t^2$ — <b>even</b>'}],
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:420,h:250,xr:[-1,1],yr:[-1.15,1.15],xlabel:'t',pad:{l:44,r:20,t:20,b:34},xtarget:3,ytarget:3});
        a.curve(t=>t*t*t,{color:C.mid}); a.vline(0,{color:C.err,dash:'4 4'}); return a.svg(); },
        caption:'$x_2(t)=t^3$ — <b>odd</b>'}],
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:420,h:250,xr:[-1,1],yr:[-0.2,3.1],xlabel:'t',pad:{l:44,r:20,t:20,b:34},xtarget:3,ytarget:3});
        a.curve(t=>Math.exp(-t),{color:C.h}); a.vline(0,{color:C.err,dash:'4 4'}); return a.svg(); },
        caption:'$x_3(t)=e^{-t}$ — <b>neither</b>'}]
    ]},
    {t:'reveal', at:1, items:[
      {t:'fig', frame:true, svg:()=>{
        const x=t=>Math.exp(-t);
        const a=P.Axes({w:900,h:270,xr:[-1.5,1.5],yr:[-2.2,3.4],xlabel:'t',pad:{l:52,r:24,t:20,b:36},xtarget:7,ytarget:4});
        a.curve(x,{color:C.h,dash:'4 4'});
        a.curve(t=>0.5*(x(t)+x(-t)),{color:C.in});
        a.curve(t=>0.5*(x(t)-x(-t)),{color:C.mid});
        a.note(-1.42,2.6,'x',{color:C.h,fs:14,tex:true});
        a.note(1.42,2.5,'\\operatorname{Ev}\\{x\\}=\\cosh t',{anchor:'end',color:C.in,fs:14,tex:true});
        a.note(-0.25,-1.5,'\\operatorname{Od}\\{x\\}=-\\sinh t',{anchor:'end',color:C.mid,fs:14,tex:true});
        return a.svg(); },
        caption:'The decomposition of $e^{-t}$. Adding the cyan and violet curves reproduces the dashed original at every $t$.'}]}
  ]}
]},

{ id:'m1-dt-impulse', module:'M1', nav:'DT impulse and step', title:'The discrete-time impulse and step', src:'p. 6',
  objective:'Define δ[n], u[n], the first difference and the running sum.',
  keywords:'delta[n] u[n] unit impulse step first difference running sum representation', steps:3, blocks:[
  {t:'eyebrow', text:'Module 1 · Impulse and step', src:'p. 6'},
  {t:'title', text:'Two sequences that generate everything else'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'eq', tex:'\\delta[n]=\\begin{cases}1,&n=0\\\\0,&\\text{otherwise}\\end{cases}', label:'Unit impulse',
      note:'An ordinary, well-behaved sequence. Nothing infinite happens here. Compare $\\delta(t)$ on the next scene.'},
    {t:'eq', tex:'u[n]=\\begin{cases}1,&n\\ge 0\\\\0,&\\text{otherwise}\\end{cases}', label:'Unit step'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'\\delta[n]=u[n]-u[n-1]', label:'First difference — the discrete derivative',
        note:'Subtracting a copy delayed by one sample cancels the flat part of the step and leaves a single sample.'},
      {t:'eq', key:true, tex:'u[n]=\\sum_{k=0}^{\\infty}\\delta[n-k]=\\delta[n]+\\delta[n-1]+\\delta[n-2]+\\cdots',
        label:'Running sum — the discrete integral'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'A duality worth naming', html:'Difference and accumulation are inverse operations, exactly as differentiation and integration are in continuous time. Module 3 shows that the accumulator and the differencer are inverse <em>systems</em>, with $h[n]*g[n]=\\delta[n]$.'}]},
    {t:'reveal', at:3, items:[
      {t:'eq', key:true, tex:'u[n]=\\sum_{k=-\\infty}^{\\infty}u[k]\\,\\delta[n-k]', label:'Representation property',
        note:'Expanding: $\\;\\underbrace{u[-1]}_{=0}\\delta[n+1]+\\underbrace{u[0]}_{=1}\\delta[n]+\\underbrace{u[1]}_{=1}\\delta[n-1]+\\cdots$ : the sequence is rebuilt from weighted, shifted impulses. This is the template for the convolution sum.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:840,h:220,xr:[-3,5],yr:[-0.25,1.35],xlabel:'n',pad:{l:48,r:24,t:20,b:34},xtarget:9,ytarget:2});
      a.stem(disc(n=>n===0?1:0,-3,5),{color:C.in,showZero:false}); a.note(4.6,1.15,'\\delta[n]',{anchor:'end',color:C.in,fs:16,tex:true}); return a.svg(); }},
    {t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:840,h:220,xr:[-3,5],yr:[-0.25,1.35],xlabel:'n',pad:{l:48,r:24,t:20,b:34},xtarget:9,ytarget:2});
      a.stem(disc(n=>n>=0?1:0,-3,5),{color:C.h}); a.note(4.6,1.15,'u[n]',{anchor:'end',color:C.h,fs:16,tex:true}); return a.svg(); }},
    {t:'reveal', at:1, items:[
      {t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:840,h:240,xr:[-3,5],yr:[-1.35,1.35],xlabel:'n',pad:{l:48,r:24,t:20,b:34},xtarget:9,ytarget:3});
        a.stem(disc(n=>n>=0?1:0,-3,5),{color:C.h}); a.stem(disc(n=>n>=1?-1:0,-3,5),{color:C.mid});
        a.note(4.6,1.15,'u[n]',{anchor:'end',color:C.h,fs:15,tex:true});
        a.note(-2.85,-1.1,'-u[n-1]',{color:C.mid,fs:15,tex:true});
        return a.svg(); },
        caption:'The two sequences cancel for every $n\\ge1$. Only $n=0$ survives, and it gives $\\delta[n]$.'}]}
  ]}
]},

{ id:'m1-dt-sift', module:'M1', nav:'Sampling and sifting (DT)', title:'Sampling and sifting properties', src:'pp. 6–7',
  objective:'Distinguish the two properties and verify both on the definition example.',
  keywords:'sampling property sifting property delta n0 x[n0]', steps:3, blocks:[
  {t:'eyebrow', text:'Module 1 · Impulse and step', src:'pp. 6–7'},
  {t:'title', text:'Sampling and sifting are different statements'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'eq', key:true, tex:'x[n]\\,\\delta[n-n_0]=x[n_0]\\,\\delta[n-n_0]', label:'Sampling property',
      note:'Both sides are <b>sequences</b>. Multiplying by a shifted impulse freezes the signal at one index and discards the rest.'},
    {t:'eq', key:true, tex:'x[n_0]=\\sum_{n=-\\infty}^{\\infty}x[n]\\,\\delta[n-n_0]', label:'Sifting property',
      note:'The right-hand side is a <b>number</b>. Summing the sampled sequence extracts the single value $x[n_0]$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'err', head:'The distinction students lose', html:'Sampling gives a signal. Sifting gives a number. Sifting is sampling <em>followed by summation</em>. Writing one where the other belongs is a dimensional error, and it carries silently into convolution.'}]},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Check','$n_0=2$ and $x[0]=1,\\;x[1]=2,\\;x[2]=3$.'],
        ['Sampling','$x[n]\\delta[n-2]=x[2]\\delta[n-2]=3\\,\\delta[n-2]$ — a single stem of height 3 at $n=2$.'],
        ['Sifting','$\\displaystyle\\sum_n x[n]\\delta[n-2]=x[0]\\underbrace{\\delta[-2]}_{0}+x[1]\\underbrace{\\delta[-1]}_{0}+x[2]\\underbrace{\\delta[0]}_{1}=3$.']
      ]}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Why this is the key step of the course', html:'The representation property $x[n]=\\sum_k x[k]\\delta[n-k]$ says that every signal is a sum of impulses. Feed that sum into a linear time-invariant system and the convolution sum follows in three lines. That is what Module 3 does.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:840,h:230,xr:[-1,5],yr:[-0.3,3.6],xlabel:'n',pad:{l:48,r:24,t:20,b:34},xtarget:7,ytarget:3});
      a.stem(disc(n=>[1,2,3][n]!==undefined&&n>=0&&n<=2?[1,2,3][n]:0,-1,5),{color:C.in});
      a.note(4.6,3.2,'x[n]',{anchor:'end',color:C.in,fs:15,tex:true}); return a.svg(); }},
    {t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:840,h:230,xr:[-1,5],yr:[-0.3,1.4],xlabel:'n',pad:{l:48,r:24,t:20,b:34},xtarget:7,ytarget:2});
      a.stem(disc(n=>n===2?1:0,-1,5),{color:C.h});
      a.note(4.6,1.2,'\\delta[n-2]',{anchor:'end',color:C.h,fs:15,tex:true}); return a.svg(); }},
    {t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:840,h:230,xr:[-1,5],yr:[-0.3,3.6],xlabel:'n',pad:{l:48,r:24,t:20,b:34},xtarget:7,ytarget:3});
      a.stem(disc(n=>n===2?3:0,-1,5),{color:C.out});
      a.note(4.6,3.2,'x[n]\\cdot\\delta[n-2]=3\\delta[n-2]',{anchor:'end',color:C.out,fs:15,tex:true}); return a.svg(); },
      caption:'The product is a <em>sequence</em>. The sifting property gives the number obtained by summing it.'}
  ]}
]},

{ id:'m1-ct-impulse', module:'M1', nav:'CT impulse and step', title:'The continuous-time impulse', src:'p. 7',
  objective:'Present δ(t) rigorously as a distribution while keeping the definition picture.',
  keywords:'dirac delta distribution generalized function unit step derivative area 1', steps:4, blocks:[
  {t:'eyebrow', text:'Module 1 · Impulse and step', src:'p. 7'},
  {t:'title', text:'$\\delta(t)$ is not a function'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'eq', tex:'\\delta(t)=\\begin{cases}\\infty,&t=0\\\\0,&\\text{otherwise}\\end{cases}\\qquad \\int_{-\\infty}^{\\infty}\\delta(t)\\,\\d t=1',
      label:'The usual definition', note:'The Dirac delta “function”. It is drawn as an arrow whose <b>area</b> is 1, not an arrow of height 1.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'err', head:'Why this definition cannot be taken literally', html:'No ordinary function is zero almost everywhere and still integrates to 1. The Lebesgue integral of such a function is 0. So $\\delta$ is a <b>distribution</b>, also called a generalized function. It is defined by what it <em>does</em> to well-behaved test functions: $\\int x(t)\\delta(t-t_0)\\d t=x(t_0)$.'}]},
    {t:'reveal', at:2, items:[
      {t:'body', html:'A cleaner construction starts from a rectangle of width $\\varepsilon$ and height $1/\\varepsilon$, so its area is 1 for every $\\varepsilon$, and then lets $\\varepsilon\\to0$. The limit does not exist pointwise. It exists only under an integral sign, and that is exactly the distributional statement.'}]},
    {t:'reveal', at:3, items:[
      {t:'eq', tex:'\\delta(t)=\\frac{\\d}{\\d t}u(t),\\qquad u(t)=\\int_{-\\infty}^{t}\\delta(\\tau)\\,\\d\\tau', label:'Step and impulse',
        note:'The discrete pair $\\delta[n]=u[n]-u[n-1]$ and $u[n]=\\sum\\delta[n-k]$ is the exact analogue.'}]},
    {t:'reveal', at:4, items:[
      {t:'eq', key:true, tex:'x(t)\\,\\delta(t-t_0)=x(t_0)\\,\\delta(t-t_0)\\qquad\\text{(sampling)}'},
      {t:'eq', key:true, tex:'x(t_0)=\\int_{-\\infty}^{\\infty}x(t)\\,\\delta(t-t_0)\\,\\d t\\qquad\\text{(sifting)}',
        note:'Same two statements as in discrete time, with the sum replaced by an integral.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:840,h:240,xr:[-2,3],yr:[-0.25,1.45],xlabel:'t',pad:{l:48,r:24,t:22,b:34},xtarget:6,ytarget:2});
      a.impulse(0,1,{color:C.in,labelText:'1'});
      a.note(1.9,1.2,'\\delta(t)',{anchor:'end',color:C.in,fs:16,tex:true});
      return a.svg(); },
      caption:'The height of the arrow shows the <b>area</b>, that is the weight. It never shows a value of the function.'},
    {t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:840,h:240,xr:[-1.2,1.2],yr:[-0.4,4.6],xlabel:'t',pad:{l:48,r:24,t:22,b:34},xtarget:5,ytarget:3});
      [[0.8,1.25],[0.4,2.5],[0.2,5]].forEach(([e,h],i)=>{
        const col=[ '#9BC4CB','#4E9AA6',C.in][i];
        a.poly([[-e/2,0],[-e/2,Math.min(h,4.4)],[e/2,Math.min(h,4.4)],[e/2,0]],{color:col,width:1.8}); });
      a.note(1.1,4.1,'\\text{width }\\varepsilon,\\;\\text{height }1/\\varepsilon',{anchor:'end',color:C.muted,fs:13,tex:true});
      return a.svg(); },
      caption:'The limiting construction. Each rectangle has unit area. Nothing converges pointwise. The family converges only when it is integrated against a continuous test function.'},
    {t:'reveal', at:4, items:[
      {t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:840,h:230,xr:[-1,6],yr:[-1.1,1.6],xlabel:'t',pad:{l:48,r:24,t:22,b:34},xtarget:7,ytarget:3});
        const x=t=>0.75*Math.cos(1.2*t-0.5);
        a.curve(x,{color:C.muted,width:1.6});
        a.impulse(3, x(3), {color:C.coral, labelText:'x(t₀)'});
        a.point(3,x(3),{color:C.coral});
        a.note(5.7,1.35,'x(t)',{anchor:'end',color:C.muted,fs:15,tex:true});
        a.note(2.86,-0.28,'t_0',{anchor:'end',color:C.coral,fs:14,tex:true});
        return a.svg(); },
        caption:'Sifting, drawn. The impulse at $t_0$ is scaled by the value of $x$ there, and integration returns that single number.'}]}
  ]}
]},

{ id:'m1-ct-cexp', module:'M1', nav:'CT complex exponentials', title:'Continuous-time complex exponentials', src:'pp. 7–9',
  objective:'Build x(t)=Ce^{at} from real to general complex, with Euler and periodicity.',
  keywords:'complex exponential Euler amplitude phase angular frequency growth decay envelope', steps:4, blocks:[
  {t:'eyebrow', text:'Module 1 · Complex exponentials', src:'pp. 7–9'},
  {t:'title', text:'One family, three behaviours'},
  {t:'cols', ratio:'c-5-7', left:[
    {t:'eq', key:true, tex:'x(t)=C\\,e^{at},\\qquad C,a\\in\\mathbb{C}', label:'Definition'},
    {t:'body', html:'The behaviour is decided entirely by where $a$ sits in the complex plane.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Case 1 · both parameters real', html:'Both $C$ and $a$ are real. Then $a<0$ gives decay, $a>0$ gives growth, and $a=0$ gives the constant $x(t)=C$. Larger $|a|$ means faster decay or growth.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Case 2 · a purely imaginary', html:'Here $a=j\\omega_0$. With $C=Ae^{j\\theta}$, Euler\'s relation $e^{jx}=\\cos x+j\\sin x$ gives<br>$x(t)=A\\cos(\\omega_0t+\\theta)+jA\\sin(\\omega_0t+\\theta)$,<br>where $\\omega_0$ is the angular frequency (rad/s), $\\theta$ the phase shift (rad) and $A$ the amplitude.'}]},
    {t:'reveal', at:3, items:[
      {t:'eq', tex:'A e^{j(\\omega_0 t+\\theta)}=A e^{j(\\omega_0(t+T)+\\theta)}\\;\\Rightarrow\\;1=e^{j\\omega_0 T}\\;\\Rightarrow\\; j2\\pi k=j\\omega_0T\\;\\Rightarrow\\; T=\\frac{2\\pi}{\\omega_0}k',
        label:'Periodicity, derived', note:'$k\\in\\mathbb{Z}$. Taking $k=1$ gives the fundamental period $T_0=2\\pi/\\omega_0$. <b>Every</b> continuous-time complex exponential with $\\omega_0\\neq0$ is periodic. There is no extra condition.'},
      {t:'wex', rows:[
        ['Example','$x(t)=e^{j0.5\\pi t}\\;\\Rightarrow\\; T_0=\\dfrac{2\\pi}{0.5\\pi}=4$ seconds.'],
        ['Sanity check','$0.5\\pi\\cdot4=2\\pi$ — one full turn of the phasor. ✓']
      ]}]},
    {t:'reveal', at:4, items:[
      {t:'note', kind:'warn', head:'Case 3 · a fully complex', html:'With $a=r+j\\omega_0$, $x(t)=Ae^{rt}\\cos(\\omega_0t+\\theta)+jAe^{rt}\\sin(\\omega_0t+\\theta)$. This is a sinusoid inside the envelope $\\pm Ae^{rt}$. Here $r<0$ gives damping, $r>0$ growth and $r=0$ a sustained oscillation. This is the natural response of every second-order circuit.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:900,h:250,xr:[0,6],yr:[-0.1,1.15],xlabel:'t',pad:{l:50,r:26,t:20,b:36},xtarget:6,ytarget:3});
      [[0.5,'#9BC4CB'],[1,'#3E8C9B'],[2,C.in]].forEach(([k,col])=>a.curve(t=>Math.exp(-k*t),{color:col}));
      a.note(5.7,1.02,'e^{-0.5t},\\;e^{-t},\\;e^{-2t}',{anchor:'end',color:C.in,fs:14,tex:true});
      return a.svg(); }, caption:'Real case, $a<0$: decay. Larger $|a|$ ⇒ faster.'},
    {t:'reveal', at:3, items:[
      {t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:900,h:250,xr:[0,12],yr:[-1.3,1.3],xlabel:'t',ylabel:'\\operatorname{Re}\\{x(t)\\}',pad:{l:60,r:26,t:20,b:36},xtarget:7,ytarget:3});
        a.curve(t=>Math.cos(0.5*Math.PI*t),{color:C.in});
        a.span(0,4,1.12,'T_0=4\\;\\text{s}',{color:C.coral,tex:true});
        return a.svg(); }, caption:'$x(t)=e^{j0.5\\pi t}$: real part, with the fundamental period marked.'}]},
    {t:'reveal', at:4, items:[
      {t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:900,h:260,xr:[0,5],yr:[-2.3,2.3],xlabel:'t',pad:{l:50,r:26,t:20,b:36},xtarget:6,ytarget:3});
        a.curve(t=>2*Math.exp(-0.5*t),{color:C.err,dash:'5 5',width:1.4});
        a.curve(t=>-2*Math.exp(-0.5*t),{color:C.err,dash:'5 5',width:1.4});
        a.curve(t=>2*Math.exp(-0.5*t)*Math.cos(2*Math.PI*t),{color:C.in,n:1400});
        a.note(4.8,2.05,'\\operatorname{Re}\\{2e^{-0.5t}e^{j2\\pi t}\\}',{anchor:'end',color:C.in,fs:14,tex:true});
        return a.svg(); },
        caption:'A damped case ($A=2$, $r=-0.5$): a sinusoid held inside the envelope $\\pm Ae^{rt}$.'}]}
  ]}
]},

{ id:'m1-dt-cexp', module:'M1', nav:'DT complex exponentials', title:'Discrete-time complex exponentials', src:'pp. 9–10',
  objective:'Introduce x[n]=Cα^n and the three envelope cases.',
  keywords:'discrete complex exponential alpha beta growing decaying envelope', steps:2, blocks:[
  {t:'eyebrow', text:'Module 1 · Complex exponentials', src:'pp. 9–10'},
  {t:'title', text:'From $e^{\\beta n}$ to $\\alpha^{n}$'},
  {t:'cols', ratio:'c-5-7', left:[
    {t:'eq', key:true, tex:'x[n]=C\\,e^{\\beta n},\\qquad C,\\beta\\in\\mathbb{C}'},
    {t:'eq', key:true, tex:'\\alpha=e^{\\beta}\\;\\Longrightarrow\\; x[n]=C\\,\\alpha^{n}',
      note:'The power form is the natural one in discrete time. It is what a difference equation produces.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Real case', html:'$0<\\alpha<1$ decreases monotonically. $\\alpha>1$ increases monotonically. The two plots opposite are $x[n]=0.5^n$ and $y[n]=2^n$.'},
      {t:'note', kind:'warn', head:'The boundary moved', html:'In continuous time the boundary between growth and decay is $\\operatorname{Re}\\{a\\}=0$. In discrete time it is $|\\alpha|=1$, the unit circle, not the imaginary axis. The map between the two is $\\alpha=e^{\\beta}$.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'C=|C|e^{j\\theta},\\;\\alpha=|\\alpha|e^{j\\omega_0}\\;\\Rightarrow\\; x[n]=|C||\\alpha|^{n}\\cos(\\omega_0 n+\\theta)+j\\,|C||\\alpha|^{n}\\sin(\\omega_0 n+\\theta)',
        label:'General complex case',
        note:'$|\\alpha|=1$ is sustained, $|\\alpha|>1$ is growing and $|\\alpha|<1$ is decaying. The three plots use $\\alpha=1,\\,1.05,\\,0.95$ at $\\omega_0=0.14\\pi$.'}]}
  ], right:[
    {t:'grid', cols:2, gap:'20px', items:[
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:520,h:230,xr:[0,10],yr:[-0.1,1.15],xlabel:'n',pad:{l:48,r:22,t:20,b:34},xtarget:5,ytarget:3});
        a.stem(disc(n=>Math.pow(0.5,n),0,10),{color:C.in}); return a.svg(); }, caption:'$x[n]=0.5^{\\,n}$ — decreasing'}],
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:520,h:230,xr:[0,10],yr:[-40,1100],xlabel:'n',pad:{l:64,r:22,t:20,b:34},xtarget:5,ytarget:3});
        a.stem(disc(n=>Math.pow(2,n),0,10),{color:C.h}); return a.svg(); }, caption:'$y[n]=2^{\\,n}$ — increasing'}]
    ]},
    {t:'reveal', at:2, items:[
      {t:'grid', cols:3, gap:'14px', items:[
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:400,h:220,xr:[-20,20],yr:[-1.5,1.5],xlabel:'n',pad:{l:42,r:18,t:18,b:32},xtarget:4,ytarget:3});
          a.stem(disc(n=>Math.cos(0.14*Math.PI*n),-20,20),{color:C.in,r:2.4,width:1.2}); return a.svg(); }, caption:'$|\\alpha|=1$'}],
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:400,h:220,xr:[-20,20],yr:[-2.6,2.6],xlabel:'n',pad:{l:42,r:18,t:18,b:32},xtarget:4,ytarget:3});
          a.stem(disc(n=>Math.pow(1.05,n)*Math.cos(0.14*Math.PI*n),-20,20),{color:C.h,r:2.4,width:1.2}); return a.svg(); }, caption:'$|\\alpha|=1.05$ — growing'}],
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:400,h:220,xr:[-20,20],yr:[-2.6,2.6],xlabel:'n',pad:{l:42,r:18,t:18,b:32},xtarget:4,ytarget:3});
          a.stem(disc(n=>Math.pow(0.95,n)*Math.cos(0.14*Math.PI*n),-20,20),{color:C.mid,r:2.4,width:1.2}); return a.svg(); }, caption:'$|\\alpha|=0.95$ — decaying'}]
      ]}]}
  ]}
]},

{ id:'m1-dt-period', module:'M1', nav:'DT periodicity condition', title:'When is a discrete-time exponential periodic?', src:'p. 10',
  objective:'Derive N = 2πk/ω₀ and the rationality condition; work the definition example.',
  keywords:'discrete periodicity rational multiple 2pi N0 integer condition', steps:4, blocks:[
  {t:'eyebrow', text:'Module 1 · Periodicity in discrete time', src:'p. 10'},
  {t:'title', text:'The condition with no continuous-time counterpart'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'eq', tex:'x[n]=C e^{j\\omega_0 n}\\;\\text{periodic}\\;\\Longleftrightarrow\\; x[n]=x[n+N]', label:'Requirement'},
    {t:'reveal', at:1, items:[
      {t:'eq', size:'sm', tex:'Ce^{j\\omega_0 n}=Ce^{j\\omega_0(n+N)}\\;\\Rightarrow\\;1=e^{j\\omega_0 N}\\;\\Rightarrow\\;\\bigl(e^{j2\\pi}\\bigr)^{k}=e^{j\\omega_0N}\\;\\Rightarrow\\; j2\\pi k=j\\omega_0 N'},
      {t:'eq', key:true, tex:'N=\\frac{2\\pi}{\\omega_0}\\,k,\\qquad k\\in\\mathbb{Z}', label:'Result'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'The line the whole course turns on', html:'$N$ must be an <b>integer</b>. That is possible only if $\\dfrac{\\omega_0}{2\\pi}=\\dfrac{k}{N}$ is a <b>rational number</b>. In other words, $\\omega_0$ must be a rational multiple of $2\\pi$. If the ratio is irrational, no integer $N$ works and the sequence is <b>aperiodic</b>, however sinusoidal it looks when plotted.'}]},
    {t:'reveal', at:3, items:[
      {t:'wex', rows:[
        ['Given','$x[n]=e^{j\\frac{3\\pi}{5}n}$'],
        ['Find','The fundamental period $N_0$.'],
        ['Method','Apply $N=2\\pi k/\\omega_0$ and take the smallest $k$ that makes $N$ an integer.'],
        ['Solution','$N=\\dfrac{2\\pi}{3\\pi/5}k=\\dfrac{10\\pi}{3\\pi}k=\\dfrac{10}{3}k$. The smallest $k\\in\\mathbb{Z}^{+}$ giving an integer is $k=3$, so $\\boxed{N_0=10}$.'],
        ['Sanity check','$\\omega_0N_0=\\frac{3\\pi}{5}\\cdot10=6\\pi=2\\pi\\cdot3$ — exactly three full turns of the phasor in ten samples. ✓'],
        ['Interpretation','$k$ counts how many times the phasor wraps before the samples line up again. $k>1$ means the sequence does <em>not</em> trace one cycle per period.']
      ]}]},
    {t:'reveal', at:4, items:[
      {t:'note', kind:'warn', head:'A second discrete-time surprise, for later', html:'$e^{j(\\omega_0+2\\pi)n}=e^{j\\omega_0 n}$ for every integer $n$. So two discrete-time frequencies that differ by $2\\pi$ cannot be told apart. The same fact makes the DTFT $2\\pi$-periodic in Module 6, and makes aliasing unavoidable in Module 7.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:900,h:270,xr:[-20,20],yr:[-1.35,1.5],xlabel:'n',ylabel:'\\operatorname{Re}\\{x[n]\\}',pad:{l:60,r:26,t:22,b:36},xtarget:9,ytarget:3});
      a.stem(disc(n=>Math.cos(3*Math.PI*n/5),-20,20),{color:C.in,r:3});
      a.span(0,10,1.24,'N_0=10',{color:C.coral,tex:true});
      return a.svg(); },
      caption:'$x[n]=e^{j3\\pi n/5}$, real part. The samples repeat after $N_0=10$.'},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:900,h:250,xr:[-20,20],yr:[-1.35,1.35],xlabel:'n',pad:{l:52,r:26,t:20,b:36},xtarget:9,ytarget:3});
        a.stem(disc(n=>Math.cos(n),-20,20),{color:C.err,r:3});
        return a.svg(); },
        caption:'<b>Aperiodic.</b> $x[n]=\\cos(n)$ has $\\omega_0=1$, so $\\omega_0/2\\pi=1/(2\\pi)$ is irrational. The pattern never repeats exactly. It looks periodic, but it is not.'}]}
  ]}
]},

{ id:'m1-lab-c', module:'M1', nav:'Laboratory C · Periodicity', title:'Laboratory C — Periodicity Explorer', src:'pp. 5, 8, 10',
  objective:'Compare CT and DT periodicity with an exact rationality test.',
  keywords:'laboratory periodicity explorer rational frequency N0 T0', steps:0, blocks:[
  {t:'eyebrow', text:'Interactive laboratory C', src:'pp. 5, 8, 10'},
  {t:'title', text:'Periodicity, tested exactly'},
  {t:'lede', text:'$\\omega_0$ is entered as a rational multiple of $\\pi$, so the discrete-time test is exact and not numerical. Floating-point arithmetic can never decide whether a number is rational.'},
  {t:'lab', id:'C'}
]},

{ id:'m1-synth', module:'M1', nav:'Module 1 synthesis', title:'Module 1 — what to carry forward', src:'pp. 2–10',
  dark:true, objective:'Consolidate the module and connect to Module 2.',
  keywords:'synthesis summary module 1 review', steps:1, blocks:[
  {t:'eyebrow', text:'Module 1 · Synthesis', src:'pp. 2–10'},
  {t:'title', text:'Five results, and one habit'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:`<p style="color:#DED5C6"><b>1.</b> $E_\\infty$ and $P_\\infty$ are limits. Energy-type ⇒ $P_\\infty=0$; power-type ⇒ $E_\\infty\\to\\infty$; unbounded growth ⇒ neither.</p>
      <p style="color:#DED5C6"><b>2.</b> $x(at-b)$ requires <em>shift, then scale</em>. The other order gives $x(at-ab)$.</p>
      <p style="color:#DED5C6"><b>3.</b> $T_0$ and $N_0$ are the <em>smallest</em> positive periods; $\\omega_0=2\\pi/T_0=2\\pi/N_0$.</p>
      <p style="color:#DED5C6"><b>4.</b> $\\delta[n]$ is a sequence. $\\delta(t)$ is a distribution. Both are defined by their sifting action.</p>
      <p style="color:#DED5C6"><b>5.</b> A discrete-time exponential is periodic if and only if $\\omega_0/2\\pi$ is rational. A continuous-time one always is.</p>`},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'The habit', html:'<span style="color:#DED5C6">Every claim in this module was settled by going back to a definition and evaluating a limit or an integral. None was settled by looking at a picture. Module 2 makes that habit explicit and gives it six names.</span>'}]}
  ], right:[
    {t:'raw', html:'<p class="eyebrow" style="margin-bottom:14px"><span class="tick"></span>Reflection</p>'},
    {t:'lede', text:'A signal that carries finite energy delivers zero average power, and a signal that delivers finite average power carries infinite energy. Which quantity should you specify for a radio transmitter, and which for a radar pulse? What does that choice say about the measurement you would actually make?'},
    {t:'reveal', at:1, items:[
      {t:'raw', html:`<div class="instr"><div class="instr-panel"><span class="note-h">Discussion guidance</span>
        <span style="color:#DED5C6">A continuous transmitter is specified by average power in watts, because its energy is unbounded. A radar or ultrasound pulse is specified by pulse energy in joules, because its power only has meaning inside the pulse. The measurement follows. A power meter integrates over a window that is long compared with the signal. An energy meter integrates over the whole transient.</span></div></div>`}]}
  ]}
]},

{ id:'m1-qbank', module:'M1', nav:'Module 1 question bank', title:'Module 1 — question bank', src:'pp. 2–10',
  objective:'Twelve questions covering Module 1 outcomes.',
  keywords:'questions quiz Q1 bank module 1 exercises', steps:0, blocks:[
  {t:'eyebrow', text:'Module 1 · Question bank Q1-01 … Q1-12', src:'pp. 2–10'},
  {t:'title', text:'Question bank'},
  {t:'small', html:'Twelve questions: 3 conceptual, 3 short calculation, 2 misconception-diagnostic, 2 multi-step, 1 graph interpretation, 1 synthesis. Everything needed is in Module 1. Answers are checked immediately. Full solutions stay hidden until you ask for them.'},
  {t:'qbank', module:'M1'}
]}

];
window.SCENES_M1 = SC;
})();
