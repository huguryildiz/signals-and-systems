/* ==========================================================================
   EE311 · Module 2 — Systems and Their Properties   [Source: PDF pp. 11–14]
   ========================================================================== */
(function(){
const P = PLOT, C = P.COL;
const disc=(f,a,b)=>{const o=[];for(let n=Math.ceil(a);n<=b;n++)o.push([n,f(n)]);return o;};

const SC = [

{ id:'m2-open', module:'M2', nav:'Module 2 opening', title:'Systems and Their Properties', src:'pp. 11–14',
  dark:true, keywords:'module 2 systems properties overview', steps:0, blocks:[
  {t:'eyebrow', text:'Module 2 · Systems and Their Properties', src:'pp. 11–14'},
  {t:'title', level:1, text:'Six questions,<br>asked in a fixed order'},
  {t:'lede', text:'A system is characterised by what it does to signals, not by what it is made of. Six properties decide almost everything that follows — and two of them, together, are the entire content of Module 3.'},
  {t:'raw', html:`<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:22px;margin-top:34px;max-width:1500px">
    ${['Memoryless','Invertible','Causal','BIBO stable','Time invariant','Linear'].map((n,i)=>
      `<div style="border-top:2px solid ${i>=4?'#BE5539':'rgba(239,231,216,.35)'};padding-top:14px">
        <div style="font-family:var(--mono);font-size:12px;letter-spacing:.14em;color:#8FA8BF">0${i+1}</div>
        <div style="font-family:var(--serif);font-size:25px;margin-top:6px;color:#EFE7D8">${n}</div>
        ${i>=4?'<div style="font-size:14px;color:#BE7A63;margin-top:8px">required for convolution</div>':''}
      </div>`).join('')}
  </div>`},
  {t:'raw', html:'<div style="margin-top:auto"></div>'},
  {t:'note', kind:'warn', head:'Method, not intuition', html:'<span style="color:#DED5C6">Each property is settled either by a proof that holds for <em>every</em> input, or by a single explicit counterexample. Nothing in this module is decided by inspecting a block diagram.</span>'}
]},

{ id:'m2-abstraction', module:'M2', nav:'Input–output abstraction', title:'The input–output abstraction', src:'p. 11',
  objective:'Define a system as a deterministic map between signals.',
  keywords:'system black box deterministic input output CT DT', steps:2, blocks:[
  {t:'eyebrow', text:'Module 2 · Abstraction', src:'p. 11'},
  {t:'title', text:'A system is a map between signals'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'note', kind:'def', head:'Definition (source)', html:'A system is a <b>quantitative description of a physical process</b> which transforms input signals into output signals — a “black box”, viewed as a mathematical abstraction, that <b>deterministically</b> transforms input signals into output signals.'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'Write it as an operator: {{sym:S|$S$}} maps a whole signal to a whole signal, $y=S\\{x\\}$. Not a number to a number — the entire function is the argument. That is why memory, causality and time invariance are even expressible.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Two systems are equal when they act identically', html:'An RC circuit, a numerical filter and a pencil-and-paper integrator can be the <em>same</em> system. Physical realisation is irrelevant to every property in this module — which is precisely what makes the theory portable.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>P.blocks({w:760,h:300,items:[
      {t:'arrow',x1:70,y1:100,x2:250,y2:100},{t:'box',x:250,y:60,w:200,h:80,label:'S'},
      {t:'arrow',x1:450,y1:100,x2:640,y2:100},
      {t:'text',x:150,y:86,label:'x(t)',italic:true,fs:18},{t:'text',x:545,y:86,label:'y(t)',italic:true,fs:18},
      {t:'arrow',x1:70,y1:225,x2:250,y2:225},{t:'box',x:250,y:185,w:200,h:80,label:'S'},
      {t:'arrow',x1:450,y1:225,x2:640,y2:225},
      {t:'text',x:150,y:211,label:'x[n]',italic:true,fs:18},{t:'text',x:545,y:211,label:'y[n]',italic:true,fs:18}
    ]}), caption:'The same operator viewpoint in continuous and discrete time. Redrawn from the source block diagrams (PDF p. 11).'}
  ]}
]},

{ id:'m2-memory', module:'M2', nav:'Memory', title:'Memoryless systems and systems with memory', src:'p. 11',
  objective:'Define memorylessness and test it on the source examples.',
  keywords:'memoryless memory instantaneous resistor capacitor accumulator', steps:3, blocks:[
  {t:'eyebrow', text:'Module 2 · Property 1', src:'p. 11'},
  {t:'title', text:'Memoryless'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'note', kind:'def', head:'Criterion', html:'A system is <b>memoryless</b> if the output at time $t$ (or $n$) depends <b>only</b> on the input at that same time.'},
    {t:'reveal', at:1, items:[
      {t:'wex', rows:[
        ['(a)','$y(t)=\\bigl[2x(t)-x^{2}(t)\\bigr]^{2}$ — <b>memoryless</b>. Only $x(t)$ appears; there is no $x(t+1)$ or $x(t-2)$ term.'],
        ['(b)','$y[n]=x[n]$ — <b>memoryless</b> (the identity system).'],
        ['(c)','$y[n]=x[n-1]$ — <b>not memoryless</b>: the $n$-th output uses the $(n-1)$-th input.']
      ]}]},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['(d)','$y[n]=x[n]+y[n-1]$ — <b>not memoryless</b>.'],
        ['Proof','Substituting repeatedly: $y[n-1]=x[n-1]+y[n-2]$, $y[n-2]=x[n-2]+y[n-3]$, … so<br>$y[n]=x[n]+x[n-1]+x[n-2]+\\cdots=\\displaystyle\\sum_{k=0}^{\\infty}x[n-k]$.'],
        ['Conclusion','$y[n]$ depends on $x[n-k]$ for every $k\\ge0$ — the whole past. Feedback on the <em>output</em> is memory just as surely as an explicit delay on the input.']
      ]}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'The circuit reading', html:'A resistor, $v(t)=R\\,i(t)$, is memoryless: the voltage now depends only on the current now. A capacitor, $v(t)=\\frac1C\\int_{-\\infty}^{t}i(\\tau)\\d\\tau$, is not: the voltage now encodes the entire current history. Memory is stored energy.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>P.blocks({w:760,h:150,items:[
      {t:'line',d:'M60 75 h60 l12 -22 l24 44 l24 -44 l24 44 l24 -44 l12 22 h60'},
      {t:'text',x:340,y:52,label:'v(t) = R i(t)',fs:16,italic:true},
      {t:'text',x:340,y:96,label:'memoryless — output now, input now',fs:13},
      {t:'arrow',x1:400,y1:75,x2:470,y2:75}
    ]}), caption:'Resistor: no stored energy, therefore no memory.'},
    {t:'fig', frame:true, svg:()=>P.blocks({w:760,h:150,items:[
      {t:'line',d:'M60 75 h110 M170 45 v60 M198 45 v60 M198 75 h110'},
      {t:'text',x:430,y:52,label:'v(t) = (1/C) ∫ i(τ) dτ',fs:16,italic:true},
      {t:'text',x:430,y:96,label:'not memoryless — the whole past enters',fs:13}
    ]}), caption:'Capacitor: stored charge is memory. Redrawn from the source sketches (PDF p. 11).'},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:760,h:230,xr:[-2,9],yr:[-0.4,6.5],xlabel:'n',pad:{l:50,r:24,t:20,b:34},xtarget:7,ytarget:3});
        a.stem(disc(n=>(n>=0&&n<=5)?1:0,-2,9),{color:C.in});
        a.stem(disc(n=>n<0?0:Math.min(n+1,6),-2,9),{color:C.out,r:3});
        a.note(8.6,6.0,'y[n] = Σ x[k]',{anchor:'end',color:C.out,fs:14,italic:true});
        a.note(8.6,1.4,'x[n]',{anchor:'end',color:C.in,fs:14,italic:true});
        return a.svg(); },
        caption:'The accumulator of (d): each output carries every earlier input. <b>Editorial illustration</b> of the source proof.'}]}
  ]}
]},

{ id:'m2-invertible', module:'M2', nav:'Invertibility', title:'Invertibility', src:'pp. 11–12',
  objective:'Define invertibility and demonstrate both proof strategies.',
  keywords:'invertible one-to-one inversion formula counterexample distinct inputs', steps:3, blocks:[
  {t:'eyebrow', text:'Module 2 · Property 2', src:'pp. 11–12'},
  {t:'title', text:'Invertible'},
  {t:'cols', ratio:'c-5-7', left:[
    {t:'note', kind:'def', head:'Criterion', html:'A system is <b>invertible</b> if <b>distinct input signals produce distinct output signals</b> — the map is one-to-one.'},
    {t:'note', kind:'warn', head:'Two ways to settle it (source)', html:'<b>(1)</b> Find an inversion formula. <b>(2)</b> Find a counterexample showing the system is not invertible.<br>These are not symmetric in cost: one formula proves invertibility for all inputs; one counterexample destroys it.'},
    {t:'reveal', at:1, items:[
      {t:'wex', rows:[
        ['(a)','$y(t)=\\bigl[\\cos(t)+2\\bigr]x(t)$ — <b>invertible</b>.'],
        ['Inversion','$x(t)=\\dfrac{y(t)}{\\cos(t)+2}$.'],
        ['Why it is safe','$\\cos(t)+2\\in[1,3]$, so the divisor never vanishes. Had the gain been $\\cos(t)$ the system would fail at every zero of the cosine.'],
        ['Verification','Substituting back: $[\\cos t+2]\\dfrac{y(t)}{\\cos t+2}=y(t)$ ✓']
      ]}]},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['(b)','$y(t)=x^{2}(t)$ — <b>not invertible</b>.'],
        ['Counterexample','$x_1(t)=1\\;\\forall t$ and $x_2(t)=-1\\;\\forall t$ are distinct, yet $y_1(t)=y_2(t)=1\\;\\forall t$.'],
        ['Conclusion','Two inputs, one output ⇒ the map is not one-to-one. The sign information is destroyed and cannot be recovered from $y$ alone.']
      ]}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'A trap worth naming', html:'“$x(t)=\\sqrt{y(t)}$” is <b>not</b> an inversion formula. It selects one of two pre-images by convention; it does not recover the input. An inversion formula must return the actual input for every admissible input.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>P.blocks({w:800,h:230,items:[
      {t:'line',d:'M120 115 m-70,0 a70,70 0 1,0 140,0 a70,70 0 1,0 -140,0'},
      {t:'line',d:'M560 115 m-70,0 a70,70 0 1,0 140,0 a70,70 0 1,0 -140,0'},
      {t:'text',x:120,y:20,label:'inputs',fs:14},{t:'text',x:560,y:20,label:'outputs',fs:14},
      {t:'line',d:'M120 85 C 250 60, 430 60, 560 85',color:'#14707F'},
      {t:'line',d:'M120 145 C 250 170, 430 170, 560 145',color:'#4A7A46'},
      {t:'text',x:340,y:52,label:'one-to-one ⇒ invertible',fs:14,color:'#4A657F'}
    ]}), caption:'Invertibility is a statement about the <em>map</em>, not about any single signal. Redrawn from the source sketch (PDF p. 11).'},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:800,h:260,xr:[-1,6],yr:[-1.6,1.6],xlabel:'t',pad:{l:50,r:24,t:20,b:34},xtarget:7,ytarget:3});
        a.curve(()=>1,{color:C.in}); a.curve(()=>-1,{color:C.mid});
        a.curve(()=>1,{color:C.err,dash:'7 5',width:3});
        a.note(5.7,1.28,'x₁ = 1  and  y = 1',{anchor:'end',color:C.err,fs:14});
        a.note(5.7,-1.3,'x₂ = −1',{anchor:'end',color:C.mid,fs:14});
        return a.svg(); },
        caption:'The counterexample for $y=x^{2}$: two distinct inputs collapse onto one output.'}]}
  ]}
]},

{ id:'m2-causal', module:'M2', nav:'Causality', title:'Causality', src:'p. 12',
  objective:'Define causality and work all five source examples.',
  keywords:'causal non-causal future past present real-time', steps:3, blocks:[
  {t:'eyebrow', text:'Module 2 · Property 3', src:'p. 12'},
  {t:'title', text:'Causal'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'note', kind:'def', head:'Criterion', html:'A system is <b>causal</b> if the output at time $t$ (or $n$) depends only on inputs at times $\\le t$ — the present and the past.'},
    {t:'reveal', at:1, items:[
      {t:'wex', rows:[
        ['(a)','$y[n]=x[n-1]$ — <b>causal</b>: only the past sample $x[n-1]$ is used.'],
        ['(b)','$y[n]=x[n]+x[n+1]$ — <b>not causal</b>: $x[n+1]$ is a future value.'],
        ['(c)','$y(t)=\\displaystyle\\int_{-\\infty}^{t}x(\\tau)\\d\\tau$ — <b>causal</b>: the upper limit is $t$, so $-\\infty<\\tau\\le t$.'],
        ['(d)','$y[n]=x[-n]$ — <b>not causal</b>: $y[-1]=x[1]$, so the output at $n=-1$ needs an input from the future.'],
        ['(e)','$y(t)=x(t)\\cos(t+1)$ — <b>causal</b>: $y(t)$ uses only $x(t)$; $\\cos(t+1)$ is a known deterministic function of $t$, not a future input.']
      ]}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'A wording correction', html:'The source justifies (e) by writing that $\\cos(t+1)$ “is constant”. It is not constant — it is a <em>known function of $t$</em>, fixed in advance and requiring no knowledge of the input. That is what preserves causality. <span class="small">(Ambiguity A-06 in the source ledger.)</span>'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Why engineers care', html:'A system that must run in real time <b>has</b> to be causal — the future has not happened. Non-causal systems are legitimate and useful whenever the record already exists: offline audio, image processing, and any smoothing filter that looks both ways along a stored signal.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:300,xr:[-5,5],yr:[-0.15,1.25],xlabel:'time relative to the output instant',
        pad:{l:50,r:24,t:26,b:44},xtarget:11,ytarget:2,yticksOverride:[]});
      a.rect(-5,0,0,1,{fill:'rgba(74,122,70,.14)'});
      a.rect(0,0,5,1,{fill:'rgba(166,59,42,.13)'});
      a.vline(0,{color:C.coral,dash:'0',width:1.6,opacity:1});
      a.note(-2.5,0.55,'available to a causal system',{anchor:'middle',color:C.out,fs:15});
      a.note(2.5,0.55,'forbidden — the future',{anchor:'middle',color:C.err,fs:15});
      a.note(0,1.12,'now',{anchor:'middle',color:C.coral,fs:14});
      return a.svg(); },
      caption:'Causality is a constraint on which part of the input axis the output may consult.'},
    {t:'reveal', at:1, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:240,xr:[-4,4],yr:[-0.3,1.4],xlabel:'n',pad:{l:50,r:24,t:20,b:34},xtarget:9,ytarget:2});
        a.stem(disc(n=>n===1?1:0,-4,4),{color:C.in});
        a.stem(disc(n=>n===-1?1:0,-4,4),{color:C.err});
        a.note(-1,1.22,'y[−1]',{anchor:'middle',color:C.err,fs:14});
        a.note(1,1.22,'x[1]',{anchor:'middle',color:C.in,fs:14});
        a.raw(`<path d="M${a.sx(0.9)},${a.sy(1.05)} C ${a.sx(0.3)},${a.sy(1.32)} ${a.sx(-0.3)},${a.sy(1.32)} ${a.sx(-0.9)},${a.sy(1.05)}"
                fill="none" stroke="${C.err}" stroke-width="1.4" stroke-dasharray="4 3"/>`);
        return a.svg(); },
        caption:'Example (d), $y[n]=x[-n]$: the output at $n=-1$ reads the input at $n=+1$. Time reversal cannot be causal.'}]}
  ]}
]},

{ id:'m2-stable', module:'M2', nav:'BIBO stability', title:'BIBO stability', src:'pp. 12–13',
  objective:'Define boundedness and BIBO stability; prove one case, disprove another.',
  keywords:'BIBO bounded input bounded output stability triangle inequality accumulator', steps:4, blocks:[
  {t:'eyebrow', text:'Module 2 · Property 4', src:'pp. 12–13'},
  {t:'title', text:'BIBO stable'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'note', kind:'def', head:'Bounded signal', html:'$x(t)$ (or $x[n]$) is <b>bounded</b> if there exists a constant $B<\\infty$ with $|x(t)|<B$ for all $t$.'},
    {t:'note', kind:'def', head:'BIBO stability', html:'A system is <b>stable</b> if a bounded input <b>always</b> produces a bounded output: if $|x(t)|<B$ for some $B<\\infty$, then $|y(t)|<\\infty$. <b>B</b>ounded <b>I</b>nput ⇒ <b>B</b>ounded <b>O</b>utput.'},
    {t:'reveal', at:1, items:[
      {t:'wex', rows:[
        ['Claim','$y(t)=2x^{2}(t-1)+x(3t)$ is <b>stable</b>.'],
        ['Method','Assume $|x(t)|\\le B<\\infty$ and bound $|y|$ using the triangle inequality.'],
        ['Proof','$|y(t)|=\\bigl|2x^{2}(t-1)+x(3t)\\bigr|\\le\\bigl|2x^{2}(t-1)\\bigr|+\\bigl|x(3t)\\bigr|\\le 2B^{2}+B<\\infty$.'],
        ['Note','Time shifting and time scaling cannot break boundedness: $x(t-1)$ and $x(3t)$ take exactly the same set of values as $x$.']
      ]}]},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Claim','$y[n]=\\displaystyle\\sum_{k=-\\infty}^{n}x[k]$ is <b>not stable</b>.'],
        ['Method','Exhibit one bounded input whose output is unbounded.'],
        ['Counterexample','$x[n]=u[n]$, so $|x[n]|\\le1$. Then $y[n]=\\displaystyle\\sum_{k=0}^{n}1=n+1$, and $y[n]\\to\\infty$ as $n\\to\\infty$.'],
        ['Conclusion','One bounded input with unbounded output is enough. The accumulator is unstable.']
      ]}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'The asymmetry that catches people out', html:'To <em>prove</em> stability you must bound the output for <b>every</b> bounded input. To <em>disprove</em> it you need <b>one</b>. Testing a single well-behaved input and concluding “stable” is the most common false positive in this module.'}]},
    {t:'reveal', at:4, items:[
      {t:'note', kind:'warn', head:'Causal ≠ stable', html:'The accumulator is causal and unstable. $y[n]=x[-n]$ is stable and non-causal. The six properties are logically independent except where a proof connects them — memoryless ⇒ causal is the one implication that always holds.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:250,xr:[-2,12],yr:[-0.4,1.5],xlabel:'n',pad:{l:50,r:24,t:20,b:34},xtarget:8,ytarget:3});
      a.stem(disc(n=>n>=0?1:0,-2,12),{color:C.in});
      a.hline(1,{color:C.in,dash:'2 5'});
      a.note(11.6,1.32,'bounded input  u[n]',{anchor:'end',color:C.in,fs:14});
      return a.svg(); }},
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:290,xr:[-2,12],yr:[-1,14],xlabel:'n',pad:{l:52,r:24,t:20,b:34},xtarget:8,ytarget:4});
      a.stem(disc(n=>n>=0?n+1:0,-2,12),{color:C.err});
      a.note(11.6,12.6,'y[n] = n + 1  → ∞',{anchor:'end',color:C.err,fs:14});
      return a.svg(); },
      caption:'The source counterexample, drawn: the input never exceeds 1, the output grows without bound. <b>The system is not stable.</b>'}
  ]}
]},

{ id:'m2-ti', module:'M2', nav:'Time invariance', title:'Time invariance', src:'p. 13',
  objective:'State the test as a comparison of two computed signals and work both examples.',
  keywords:'time invariance shift test counterexample n x[n] sin', steps:4, blocks:[
  {t:'eyebrow', text:'Module 2 · Property 5', src:'p. 13'},
  {t:'title', text:'Time invariant'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'note', kind:'def', head:'Criterion', html:'A system is <b>time invariant</b> if a time shift of the input produces the <b>same</b> time shift of the output:<br>if $x(t)\\to y(t)$ then $x(t-t_0)\\to y(t-t_0)$ for every $t_0\\in\\mathbb{R}$.'},
    {t:'note', kind:'warn', head:'The test, stated procedurally', html:'Compute two things and compare them.<br><b>Path 1.</b> Shift the input, then run the system: $y_2 = S\\{x(t-t_0)\\}$.<br><b>Path 2.</b> Run the system, then shift the output: $y_1(t-t_0)$.<br>Time invariant ⟺ the two agree for every input and every $t_0$.'},
    {t:'reveal', at:1, items:[
      {t:'wex', rows:[
        ['(a)','$y(t)=\\sin\\bigl(x(t)\\bigr)$ — <b>time invariant</b>.'],
        ['Path 1','$x_2(t)=x_1(t-t_0)\\;\\Rightarrow\\; y_2(t)=\\sin\\bigl(x_2(t)\\bigr)=\\sin\\bigl(x_1(t-t_0)\\bigr)$.'],
        ['Path 2','$y_1(t)=\\sin\\bigl(x_1(t)\\bigr)\\;\\Rightarrow\\; y_1(t-t_0)=\\sin\\bigl(x_1(t-t_0)\\bigr)$.'],
        ['Compare','Identical for every $t_0$ ⇒ time invariant.']
      ]}]},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['(b)','$y[n]=n\\,x[n]$ — <b>not time invariant</b>.'],
        ['Counterexample','$x_1[n]=\\delta[n]\\;\\Rightarrow\\; y_1[n]=n\\,\\delta[n]=0$ for every $n$ (at $n=0$ the factor is 0; elsewhere $\\delta$ is 0).'],
        ['Shift by 1','$x_2[n]=x_1[n-1]=\\delta[n-1]\\;\\Rightarrow\\; y_2[n]=n\\,\\delta[n-1]=\\delta[n-1]$, i.e. the value 1 at $n=1$.'],
        ['Compare','$y_1[n-1]=0$ but $y_2[n]=\\delta[n-1]\\neq0$. One counterexample settles it.']
      ]}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'The pattern behind every failure', html:'A system fails time invariance exactly when its rule contains the time variable <em>explicitly</em> — a coefficient $n$, a gain $\\cos(t)$, a scaled argument $x(3t)$. If $t$ or $n$ appears anywhere except inside the input, be suspicious immediately.'}]},
    {t:'reveal', at:4, items:[
      {t:'note', kind:'err', head:'Not the same as linearity', html:'$y[n]=n\\,x[n]$ is linear and <em>not</em> time invariant; $y(t)=x^{2}(t)$ is time invariant and <em>not</em> linear. Independent properties — Module 3 needs both.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:210,xr:[-3,4],yr:[-0.3,1.4],xlabel:'n',pad:{l:50,r:24,t:20,b:32},xtarget:8,ytarget:2});
      a.stem(disc(n=>n===0?1:0,-3,4),{color:C.in});
      a.note(3.6,1.2,'x₁[n] = δ[n]',{anchor:'end',color:C.in,fs:14,italic:true}); return a.svg(); }},
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:210,xr:[-3,4],yr:[-0.3,1.4],xlabel:'n',pad:{l:50,r:24,t:20,b:32},xtarget:8,ytarget:2});
      a.stem(disc(()=>0,-3,4),{color:C.out,showZero:true});
      a.note(3.6,1.2,'y₁[n] = n·δ[n] = 0',{anchor:'end',color:C.out,fs:14,italic:true}); return a.svg(); }},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:210,xr:[-3,4],yr:[-0.3,1.4],xlabel:'n',pad:{l:50,r:24,t:20,b:32},xtarget:8,ytarget:2});
        a.stem(disc(n=>n===1?1:0,-3,4),{color:C.h});
        a.note(3.6,1.2,'x₂[n] = δ[n−1]',{anchor:'end',color:C.h,fs:14,italic:true}); return a.svg(); }},
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:210,xr:[-3,4],yr:[-0.3,1.4],xlabel:'n',pad:{l:50,r:24,t:20,b:32},xtarget:8,ytarget:2});
        a.stem(disc(n=>n===1?1:0,-3,4),{color:C.err});
        a.note(3.6,1.2,'y₂[n] = δ[n−1]  ≠  y₁[n−1] = 0',{anchor:'end',color:C.err,fs:14,italic:true}); return a.svg(); },
        caption:'The source counterexample, drawn. Redrawn from PDF p. 13.'}]}
  ]}
]},

{ id:'m2-linear', module:'M2', nav:'Linearity', title:'Linearity', src:'p. 14',
  objective:'State superposition and work both source examples in full.',
  keywords:'linearity superposition additive homogeneous scalable cross term', steps:4, blocks:[
  {t:'eyebrow', text:'Module 2 · Property 6', src:'p. 14'},
  {t:'title', text:'Linear'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'eq', key:true, tex:'a\\,x_1(t)+b\\,x_2(t)\\;\\longrightarrow\\;a\\,y_1(t)+b\\,y_2(t),\\qquad a,b\\in\\mathbb{C}',
      label:'Superposition', note:'where $x_1\\to y_1$ and $x_2\\to y_2$. Additivity ($a=b=1$) and homogeneity ($b=0$) in one statement.'},
    {t:'reveal', at:1, items:[
      {t:'wex', rows:[
        ['(a)','$y(t)=2\\pi\\,x(t)$ — <b>linear</b>.'],
        ['Proof','$x_3=a x_1+b x_2 \\Rightarrow y_3=2\\pi x_3=2\\pi(ax_1+bx_2)=a\\underbrace{2\\pi x_1}_{y_1}+b\\underbrace{2\\pi x_2}_{y_2}=ay_1+by_2$ ✓'],
        ['Bonus','This system is also time invariant, hence <b>LTI</b> — the simplest possible member of the family Module 3 studies.']
      ]}]},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['(b)','$y[n]=\\bigl(x[2n]\\bigr)^{2}$ — <b>not linear</b>.'],
        ['Setup','$x_3[n]=a x_1[n]+b x_2[n]\\;\\Rightarrow\\; y_3[n]=\\bigl(a x_1[2n]+b x_2[2n]\\bigr)^{2}$.'],
        ['Expand','$y_3[n]=a^{2}x_1^{2}[2n]+\\underbrace{2ab\\,x_1[2n]x_2[2n]}_{\\text{cross term}}+b^{2}x_2^{2}[2n]$.'],
        ['Compare','$a y_1[n]+b y_2[n]=a\\,x_1^{2}[2n]+b\\,x_2^{2}[2n]$. The powers of $a,b$ differ <em>and</em> a cross term appears ⇒ not linear.']
      ]}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'A quicker disproof, when you want one', html:'Homogeneity alone often fails: scaling the input by $a$ scales this output by $a^{2}$. Testing $a=2,b=0$ settles it in one line. Additivity and homogeneity are each <em>necessary</em>; either failure is fatal.'}]},
    {t:'reveal', at:4, items:[
      {t:'note', kind:'err', head:'“Linear” does not mean “straight line”', html:'$y(t)=x(t)+5$ is <b>not</b> linear: the zero input does not give the zero output. Any system that is linear must satisfy $S\\{0\\}=0$ — a five-second first test that rules out every affine offset.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>P.blocks({w:820,h:330,items:[
      {t:'text',x:100,y:34,label:'PATH 1 — combine, then process',fs:14,anchor:'start',color:'#4A657F'},
      {t:'arrow',x1:100,y1:90,x2:280,y2:90},{t:'box',x:280,y:58,w:150,h:64,label:'S'},
      {t:'arrow',x1:430,y1:90,x2:610,y2:90},
      {t:'text',x:190,y:78,label:'a x₁ + b x₂',italic:true,fs:15},
      {t:'text',x:520,y:78,label:'y₃',italic:true,fs:15},
      {t:'text',x:100,y:186,label:'PATH 2 — process, then combine',fs:14,anchor:'start',color:'#4A657F'},
      {t:'arrow',x1:100,y1:240,x2:280,y2:240},{t:'box',x:280,y:208,w:150,h:64,label:'S'},
      {t:'arrow',x1:430,y1:240,x2:610,y2:240},
      {t:'text',x:190,y:228,label:'x₁, x₂',italic:true,fs:15},
      {t:'text',x:520,y:228,label:'a y₁ + b y₂',italic:true,fs:15},
      {t:'text',x:660,y:170,label:'equal?',fs:16,color:'#BE5539'},
      {t:'line',d:'M640 90 h40 v150 h-40',color:'#BE5539'}
    ]}), caption:'Linearity is the statement that these two routes always agree. Every proof in this module is a comparison of the two.'}
  ]}
]},

{ id:'m2-workflow', module:'M2', nav:'Classification workflow', title:'A workflow you can defend', src:'pp. 11–14',
  objective:'Give a repeatable order of attack for classifying an unfamiliar system.',
  keywords:'workflow classification order strategy checklist', steps:2, blocks:[
  {t:'eyebrow', text:'Module 2 · Method', src:'pp. 11–14'},
  {t:'title', text:'The order in which to attack an unfamiliar system'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:`<p><b>Step 1 — Look for an explicit $t$ or $n$.</b> A coefficient like $n$, a gain like $\\cos t$, or a scaled argument like $x(3t)$ makes time invariance the first thing to test, and usually the first thing to fail.</p>
      <p><b>Step 2 — Look for nonlinearity.</b> Squares, products of the input with itself, $\\sin(x)$, absolute values, saturation. Test homogeneity with a single scalar $a$; it is the cheapest disproof available.</p>
      <p><b>Step 3 — Read the arguments.</b> $x(t+1)$, $x[n+1]$, $x[-n]$, $x(3t)$ for $t>0$ break causality. Anything other than $x$ evaluated exactly at $t$ (or $n$) breaks memorylessness.</p>
      <p><b>Step 4 — Bound the output.</b> Assume $|x|\\le B$ and try to produce a finite bound. If the attempt fails, the failure usually shows you the counterexample: accumulate a step, integrate a constant, multiply by an unbounded coefficient.</p>
      <p><b>Step 5 — Invertibility last.</b> It is the property least often needed and the one most often argued badly.</p>`},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'The only implication that is always free', html:'<b>Memoryless ⇒ causal.</b> Everything else must be established independently. In particular: causal does not imply stable, linear does not imply time invariant, and stable does not imply memoryless.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const rows=[
        ['y(t) = 2π x(t)',            [1,1,1,1,1,1]],
        ['y[n] = x[n−1]',             [0,1,1,1,1,1]],
        ['y(t) = x²(t)',              [1,0,1,1,1,0]],
        ['y[n] = n x[n]',             [1,0,1,0,0,1]],
        ['y[n] = Σ x[k]',             [0,1,1,0,1,1]],
        ['y[n] = x[−n]',              [0,1,0,1,0,1]],
        ['y[n] = (x[2n])²',           [0,0,0,1,0,0]]
      ];
      const cols=['mem','inv','caus','stab','TI','lin'];
      const W=820,H=360,x0=250,cw=88,rh=40;
      const g=[`<text x="8" y="30" font-size="13" fill="#4A657F" font-family="ui-monospace,monospace" letter-spacing="1.4">SYSTEM</text>`];
      cols.forEach((c,i)=>g.push(`<text x="${x0+cw*i+cw/2}" y="30" font-size="12" fill="#4A657F" text-anchor="middle" font-family="ui-monospace,monospace" letter-spacing="1.2">${c.toUpperCase()}</text>`));
      rows.forEach((r,j)=>{
        const y=58+rh*j;
        g.push(`<line x1="0" y1="${y-14}" x2="${W}" y2="${y-14}" stroke="#E2DACA"/>`);
        g.push(`<text x="8" y="${y+6}" font-size="14" fill="#1B1A17" font-style="italic">${r[0]}</text>`);
        r[1].forEach((v,i)=>g.push(`<text x="${x0+cw*i+cw/2}" y="${y+7}" font-size="16" text-anchor="middle"
          fill="${v?'#4A7A46':'#A63B2A'}">${v?'✓':'✗'}</text>`));
      });
      return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="Inter,-apple-system,sans-serif">${g.join('')}</svg>`;
    }, caption:'Cumulative classification of the source examples. Read the columns, not the rows: no column determines another, which is exactly why six separate tests are required.'}
  ]}
]},

{ id:'m2-lab-d', module:'M2', nav:'Laboratory D · Property checker', title:'Laboratory D — System Property Checker', src:'pp. 11–14, 21',
  objective:'Apply the six formal tests to thirteen source systems.',
  keywords:'laboratory system property checker criterion counterexample', steps:0, blocks:[
  {t:'eyebrow', text:'Interactive laboratory D', src:'pp. 11–14, 21'},
  {t:'title', text:'Thirteen systems, six tests each'},
  {t:'lede', text:'Every verdict below is backed by an argument or an explicit counterexample — never by inspection. Predict the six answers before opening them.'},
  {t:'lab', id:'D'}
]},

{ id:'m2-synth', module:'M2', nav:'Module 2 synthesis', title:'Module 2 — what to carry forward', src:'pp. 11–14',
  dark:true, objective:'Consolidate and motivate the LTI restriction.',
  keywords:'synthesis summary module 2 LTI motivation', steps:2, blocks:[
  {t:'eyebrow', text:'Module 2 · Synthesis', src:'pp. 11–14'},
  {t:'title', text:'Why two of the six matter more than the rest'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:`<p style="color:#DED5C6">Four of the six properties describe what a system is <em>allowed</em> to do: use memory, look ahead, amplify without bound, discard information. They constrain implementation.</p>
      <p style="color:#DED5C6">Two of them — <b>linearity</b> and <b>time invariance</b> — do something different. Together they make the system <em>completely determined by a single test</em>.</p>`},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'The claim Module 3 proves', html:'<span style="color:#DED5C6">If a system is linear and time invariant, then knowing its response to <b>one</b> input — the unit impulse — determines its response to <b>every</b> input. The system collapses from an infinite-dimensional map to one function $h$.</span>'}]},
    {t:'reveal', at:2, items:[
      {t:'body', html:`<p style="color:#CFC5B4">The argument is three lines long and uses only what you already have: the representation property from Module 1 ($x$ is a sum of weighted, shifted impulses), time invariance (a shifted impulse gives a shifted impulse response), and linearity (weights and sums pass through).</p>`}]}
  ], right:[
    {t:'raw', html:'<p class="eyebrow" style="margin-bottom:14px"><span class="tick"></span>Reflection</p>'},
    {t:'lede', text:'A saturating amplifier is time invariant but not linear; a fading radio channel is linear but not time invariant. Both are ubiquitous, and neither admits an impulse response. What does that cost you in practice — and what do engineers actually do about it?'},
    {t:'reveal', at:2, items:[
      {t:'raw', html:`<div class="instr"><div class="instr-panel"><span class="note-h">Discussion guidance</span>
        <span style="color:#DED5C6">Both are handled by <em>local</em> LTI approximations: small-signal linearisation about an operating point for the amplifier, and block-wise time invariance over a coherence interval for the channel. The engineering question then becomes how long the approximation stays valid — which is a quantitative version of “how badly is the property violated”.</span></div></div>`}]}
  ]}
]},

{ id:'m2-qbank', module:'M2', nav:'Module 2 question bank', title:'Module 2 — question bank', src:'pp. 11–14',
  objective:'Twelve editorially developed questions covering Module 2 outcomes.',
  keywords:'questions quiz Q2 bank module 2 exercises', steps:0, blocks:[
  {t:'eyebrow', text:'Module 2 · Question bank Q2-01 … Q2-12', src:'pp. 11–14'},
  {t:'title', text:'Question bank'},
  {t:'small', html:'All questions are <b>editorially developed</b> and solvable with Modules 1–2 material only. Distractors are built from the specific misconceptions this module targets: classifying without a formal test, and assuming that one property implies another.'},
  {t:'qbank', module:'M2'}
]}

];
window.SCENES_M2 = SC;
})();
