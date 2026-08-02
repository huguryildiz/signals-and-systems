/* ==========================================================================
   Module 2 — Systems and Their Properties   [Source: 11–14]
   ========================================================================== */
(function(){
const P = PLOT, C = P.COL;
const disc=(f,a,b)=>{const o=[];for(let n=Math.ceil(a);n<=b;n++)o.push([n,f(n)]);return o;};

const SC = [

{ id:'m2-open', module:'M2', nav:'Module 2 opening', title:'Systems and Their Properties', src:'pp. 11–14',
  dark:true, keywords:'module 2 systems properties overview', steps:0, blocks:[
  {t:'eyebrow', text:'Module 2 · Systems and Their Properties', src:'pp. 11–14'},
  {t:'title', level:1, text:'Six properties<br>of a system'},
  {t:'lede', text:'This module gives tests for memory, invertibility, causality, stability, time invariance and linearity. These tests describe a system by its input and output signals.'},
  {t:'raw', html:`<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:22px;margin:auto 0;max-width:1500px">
    ${['Memoryless','Invertible','Causal','BIBO stable','Time invariant','Linear'].map((n,i)=>
      `<div style="border-top:2px solid ${i>=4?'var(--coral)':'rgba(233,236,242,.35)'};padding-top:14px">
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
  keywords:'system black box deterministic input output CT DT', steps:2, blocks:[
  {t:'eyebrow', text:'Module 2 · Abstraction', src:'p. 11'},
  {t:'title', text:'A system is a map between signals'},
  {t:'cols', ratio:'c-6-6', vcenter:true, left:[
    {t:'note', kind:'def', head:'Definition', html:'A system is a rule that turns an input signal into an output signal. The rule is <b>deterministic</b>: the same input always gives the same output.'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'Write the rule as an operator: $y=S\\{x\\}$. The operator {{sym:S|$S$}} maps the whole input signal to the whole output signal. This form lets us ask whether the output uses other input times or changes when the input is shifted.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Equality of systems', html:'Two systems are equal when they give the same output for every input. Their physical construction may differ, but their input-output rule is the same.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>P.blocks({w:760,h:300,items:[
      {t:'arrow',x1:70,y1:100,x2:250,y2:100},{t:'box',x:250,y:60,w:200,h:80,label:'S',tex:true},
      {t:'arrow',x1:450,y1:100,x2:640,y2:100},
      {t:'text',x:150,y:86,label:'x(t)',tex:true,fs:18},{t:'text',x:545,y:86,label:'y(t)',tex:true,fs:18},
      {t:'arrow',x1:70,y1:225,x2:250,y2:225},{t:'box',x:250,y:185,w:200,h:80,label:'S',tex:true},
      {t:'arrow',x1:450,y1:225,x2:640,y2:225},
      {t:'text',x:150,y:211,label:'x[n]',tex:true,fs:18},{t:'text',x:545,y:211,label:'y[n]',tex:true,fs:18}
    ]}), caption:'The same operator viewpoint in continuous time and in discrete time.'}
  ]}
]},

{ id:'m2-memory', module:'M2', nav:'Memory', title:'Memoryless systems and systems with memory', src:'p. 11',
  objective:'Define memorylessness and test it on the definition examples.',
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
        ['Conclusion','$y[n]$ depends on $x[n-k]$ for every $k\\ge0$, so it depends on the whole past. Output feedback can therefore give a system memory.']
      ]}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Circuit examples', html:'A resistor, $v(t)=R\\,i(t)$, is memoryless because its voltage at $t$ uses only its current at $t$. A capacitor is not memoryless because $v(t)=\\frac1C\\int_{-\\infty}^{t}i(\\tau)\\d\\tau$ uses the current history.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>P.blocks({w:760,h:150,items:[
      {t:'line',d:'M60 75 h60 l12 -22 l24 44 l24 -44 l24 44 l24 -44 l12 22 h60'},
      {t:'text',x:340,y:52,label:'v(t)=R\\,i(t)',fs:16,tex:true},
      {t:'text',x:340,y:96,label:'memoryless — output now, input now',fs:13},
      {t:'arrow',x1:400,y1:75,x2:470,y2:75}
    ]}), caption:'Resistor: no stored energy, therefore no memory.'},
    {t:'fig', frame:true, svg:()=>P.blocks({w:760,h:150,items:[
      {t:'line',d:'M60 75 h110 M170 45 v60 M198 45 v60 M198 75 h110'},
      {t:'text',x:430,y:52,label:'v(t)=\\tfrac{1}{C}\\int i(\\tau)\\,d\\tau',fs:16,tex:true},
      {t:'text',x:430,y:96,label:'not memoryless — the whole past enters',fs:13}
    ]}), caption:'Capacitor: stored charge is memory.'},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:760,h:230,xr:[-2,9],yr:[-0.4,6.5],xlabel:'n',pad:{l:50,r:24,t:20,b:34},xtarget:7,ytarget:3});
        a.stem(disc(n=>(n>=0&&n<=5)?1:0,-2,9),{color:C.in});
        a.stem(disc(n=>n<0?0:Math.min(n+1,6),-2,9),{color:C.out,r:3});
        a.note(4.2,5.6,'y[n]=\\sum_k x[k]',{anchor:'end',color:C.out,fs:14,tex:true});
        a.note(8.6,1.4,'x[n]',{anchor:'end',color:C.in,fs:14,tex:true});
        return a.svg(); },
        caption:'The accumulator of (d): each output carries every earlier input.'}]}
  ]}
]},

{ id:'m2-invertible', module:'M2', nav:'Invertibility', title:'Invertibility', src:'pp. 11–12',
  objective:'Define invertibility and demonstrate both proof strategies.',
  keywords:'invertible one-to-one inversion formula counterexample distinct inputs', steps:3, blocks:[
  {t:'eyebrow', text:'Module 2 · Property 2', src:'pp. 11–12'},
  {t:'title', text:'Invertible'},
  {t:'cols', ratio:'c-5-7', left:[
    {t:'note', kind:'def', head:'Criterion', html:'A system is <b>invertible</b> if distinct input signals produce distinct output signals. This property is also called a <b>one-to-one</b> map.'},
    {t:'note', kind:'warn', head:'Two methods', html:'To prove invertibility, find a formula that recovers every input from its output. To disprove invertibility, find two distinct inputs that give the same output.'},
    {t:'reveal', at:1, items:[
      {t:'wex', rows:[
        ['(a)','$y(t)=\\bigl[\\cos(t)+2\\bigr]x(t)$ — <b>invertible</b>.'],
        ['Inversion','$x(t)=\\dfrac{y(t)}{\\cos(t)+2}$.'],
        ['Why it is safe','$\\cos(t)+2\\in[1,3]$, so the divisor is never zero. If the gain were $\\cos(t)$, the system would fail at every zero of the cosine.'],
        ['Verification','Substituting back: $[\\cos t+2]\\dfrac{y(t)}{\\cos t+2}=y(t)$ ✓']
      ]}]},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['(b)','$y(t)=x^{2}(t)$ — <b>not invertible</b>.'],
        ['Counterexample','$x_1(t)=1\\;\\forall t$ and $x_2(t)=-1\\;\\forall t$ are distinct, yet $y_1(t)=y_2(t)=1\\;\\forall t$.'],
        ['Conclusion','Two inputs, one output ⇒ the map is not one-to-one. The sign information is destroyed and cannot be recovered from $y$ alone.']
      ]}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'Not an inverse', html:'$x(t)=\\sqrt{y(t)}$ does not invert $y=x^{2}$. It selects only one of the two possible inputs. An inversion formula must recover the actual input for every allowed input.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>P.blocks({w:800,h:230,items:[
      {t:'line',d:'M120 115 m-70,0 a70,70 0 1,0 140,0 a70,70 0 1,0 -140,0'},
      {t:'line',d:'M560 115 m-70,0 a70,70 0 1,0 140,0 a70,70 0 1,0 -140,0'},
      {t:'text',x:120,y:20,label:'inputs',fs:14},{t:'text',x:560,y:20,label:'outputs',fs:14},
      {t:'line',d:'M120 85 C 250 60, 430 60, 560 85',color:'#14707F'},
      {t:'line',d:'M120 145 C 250 170, 430 170, 560 145',color:'#4A7A46'},
      {t:'text',x:340,y:52,label:'\\text{one-to-one}\\Rightarrow\\text{invertible}',fs:14,color:C.slate,tex:true}
    ]}), caption:'Invertibility is a statement about the <em>map</em>, not about any single signal.'},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:800,h:260,xr:[-1,6],yr:[-1.6,1.6],xlabel:'t',pad:{l:50,r:24,t:20,b:34},xtarget:7,ytarget:3});
        a.curve(()=>1,{color:C.in}); a.curve(()=>-1,{color:C.mid});
        a.curve(()=>1,{color:C.err,dash:'7 5',width:3});
        a.note(5.7,1.28,'x_1=1\\;\\text{and}\\;y=1',{anchor:'end',color:C.err,fs:14,tex:true});
        a.note(5.7,-1.3,'x_2=-1',{anchor:'end',color:C.mid,fs:14,tex:true});
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
      {t:'note', kind:'warn', head:'Why example (e) is causal', html:'$\\cos(t+1)$ is not constant. It is a known function fixed before the input is applied. The system remains causal because it uses no input value after time $t$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Use of causality', html:'A real-time system must be causal because future input values are not available. A non-causal system can be used when the complete signal has already been stored, as in offline audio and image processing.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:300,xr:[-5,5],yr:[-0.15,1.25],xlabel:'\\text{time relative to the output instant}',
        pad:{l:50,r:24,t:26,b:44},xtarget:11,ytarget:2,yticksOverride:[]});
      a.rect(-5,0,0,1,{fill:'rgba(74,122,70,.14)'});
      a.rect(0,0,5,1,{fill:'rgba(166,59,42,.13)'});
      a.vline(0,{color:C.coral,dash:'0',width:1.6,opacity:1});
      a.note(-2.5,0.55,'available to a causal system',{anchor:'middle',color:C.out,fs:15});
      a.note(2.5,0.55,'forbidden — the future',{anchor:'middle',color:C.err,fs:15});
      a.note(0,1.12,'now',{anchor:'middle',color:C.coral,fs:14});
      return a.svg(); },
      caption:'Causality limits which part of the input axis the output is allowed to use.'},
    {t:'reveal', at:1, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:240,xr:[-4,4],yr:[-0.3,1.4],xlabel:'n',pad:{l:50,r:24,t:20,b:34},xtarget:9,ytarget:2});
        a.stem(disc(n=>n===1?1:0,-4,4),{color:C.in});
        a.stem(disc(n=>n===-1?1:0,-4,4),{color:C.err});
        a.note(-1,1.22,'y[-1]',{anchor:'middle',color:C.err,fs:14,tex:true});
        a.note(1,1.22,'x[1]',{anchor:'middle',color:C.in,fs:14,tex:true});
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
      {t:'note', kind:'err', head:'Proof and counterexample', html:'To prove stability, find an output bound for every bounded input. To disprove stability, find one bounded input that produces an unbounded output. One bounded example cannot prove stability.'}]},
    {t:'reveal', at:4, items:[
      {t:'note', kind:'warn', head:'Causal ≠ stable', html:'The accumulator is causal and unstable. $y[n]=x[-n]$ is stable and non-causal. The six properties are logically independent, except where a proof connects them. Memoryless ⇒ causal is the one implication that always holds.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:250,xr:[-2,12],yr:[-0.4,1.5],xlabel:'n',pad:{l:50,r:24,t:20,b:34},xtarget:8,ytarget:3});
      a.stem(disc(n=>n>=0?1:0,-2,12),{color:C.in});
      a.hline(1,{color:C.in,dash:'2 5'});
      a.note(11.6,1.32,'\\text{bounded input }u[n]',{anchor:'end',color:C.in,fs:14,tex:true});
      return a.svg(); }},
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:290,xr:[-2,12],yr:[-1,14],xlabel:'n',pad:{l:52,r:24,t:20,b:34},xtarget:8,ytarget:4});
      a.stem(disc(n=>n>=0?n+1:0,-2,12),{color:C.err});
      a.note(11.6,12.6,'y[n]=n+1\\to\\infty',{anchor:'end',color:C.err,fs:14,tex:true});
      return a.svg(); },
      caption:'The counterexample, drawn. The input never exceeds 1, but the output grows without bound. <b>The system is not stable.</b>'}
  ]}
]},

{ id:'m2-ti', module:'M2', nav:'Time invariance', title:'Time invariance', src:'p. 13',
  objective:'State the test as a comparison of two computed signals and work both examples.',
  keywords:'time invariance shift test two paths sin worked example', steps:2, blocks:[
  {t:'eyebrow', text:'Module 2 · Property 5', src:'p. 13'},
  {t:'title', text:'Time invariant'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'note', kind:'def', head:'Criterion', html:'A system is <b>time invariant</b> if a time shift of the input produces the <b>same</b> time shift of the output:<br>if $x(t)\\to y(t)$ then $x(t-t_0)\\to y(t-t_0)$ for every $t_0\\in\\mathbb{R}$.'},
    {t:'note', kind:'warn', head:'Method', html:'Compute two signals.<br><b>Path 1.</b> Shift the input and apply the system: $y_2 = S\\{x(t-t_0)\\}$.<br><b>Path 2.</b> Apply the system and shift its output: $y_1(t-t_0)$.<br>The system is time invariant only if the results agree for every input and every $t_0$.'},
    {t:'reveal', at:1, items:[
      {t:'wex', rows:[
        ['(a)','$y(t)=\\sin\\bigl(x(t)\\bigr)$ — <b>time invariant</b>.'],
        ['Path 1','$x_2(t)=x_1(t-t_0)\\;\\Rightarrow\\; y_2(t)=\\sin\\bigl(x_2(t)\\bigr)=\\sin\\bigl(x_1(t-t_0)\\bigr)$.'],
        ['Path 2','$y_1(t)=\\sin\\bigl(x_1(t)\\bigr)\\;\\Rightarrow\\; y_1(t-t_0)=\\sin\\bigl(x_1(t-t_0)\\bigr)$.'],
        ['Compare','Identical for every $t_0$ ⇒ time invariant.']
      ]}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'One shift cannot prove the property', html:'The comparison must hold for every $t_0$. The rule $y[n]=(-1)^{n}x[n]$ passes a shift of two and fails a shift of one. Agreement for one shift is not a proof, but disagreement for one shift is a valid counterexample.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>P.blocks({w:820,h:300,items:[
      {t:'arrow',x1:60,y1:80,x2:200,y2:80},{t:'box',x:200,y:48,w:150,h:64,label:'\\text{shift}\\;t_0',tex:true},
      {t:'arrow',x1:350,y1:80,x2:470,y2:80},{t:'box',x:470,y:48,w:150,h:64,label:'S',tex:true},
      {t:'arrow',x1:620,y1:80,x2:770,y2:80},
      {t:'text',x:130,y:66,label:'x(t)',tex:true,fs:17},{t:'text',x:695,y:66,label:'y_2(t)',tex:true,fs:17},
      {t:'text',x:60,y:150,label:'PATH 1 — shift, then process',fs:14,anchor:'start',color:C.slate},
      {t:'arrow',x1:60,y1:230,x2:200,y2:230},{t:'box',x:200,y:198,w:150,h:64,label:'S',tex:true},
      {t:'arrow',x1:350,y1:230,x2:470,y2:230},{t:'box',x:470,y:198,w:150,h:64,label:'\\text{shift}\\;t_0',tex:true},
      {t:'arrow',x1:620,y1:230,x2:770,y2:230},
      {t:'text',x:130,y:216,label:'x(t)',tex:true,fs:17},{t:'text',x:690,y:216,label:'y_1(t-t_0)',tex:true,fs:17},
      {t:'text',x:60,y:288,label:'PATH 2 — process, then shift',fs:14,anchor:'start',color:C.slate}
    ]}), caption:'The test as two chains. A time-invariant system is one whose two chains produce the same signal, for every input and every shift.'}
  ]}
]},

{ id:'m2-ti-b', module:'M2', nav:'Time invariance · the counterexample', title:'Where time invariance fails', src:'p. 13',
  objective:'Work the n·x[n] counterexample and name the pattern behind every failure.',
  keywords:'time invariance counterexample n x[n] explicit time variable independent of linearity', steps:2, blocks:[
  {t:'eyebrow', text:'Module 2 · Property 5', src:'p. 13'},
  {t:'title', text:'One counterexample is enough'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['(b)','$y[n]=n\\,x[n]$ — <b>not time invariant</b>.'],
      ['Counterexample','$x_1[n]=\\delta[n]\\;\\Rightarrow\\; y_1[n]=n\\,\\delta[n]=0$ for every $n$ (at $n=0$ the factor is 0; elsewhere $\\delta$ is 0).'],
      ['Shift by 1','$x_2[n]=x_1[n-1]=\\delta[n-1]\\;\\Rightarrow\\; y_2[n]=n\\,\\delta[n-1]=\\delta[n-1]$, i.e. the value 1 at $n=1$.'],
      ['Compare','$y_1[n-1]=0$ but $y_2[n]=\\delta[n-1]\\neq0$. One counterexample settles it.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'When to test first', html:'An explicit time-dependent coefficient such as $n$ or $\\cos(t)$ usually breaks time invariance. A scaled input argument such as $x(3t)$ also changes input shifts. In either case, apply the two-path test.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Not the same as linearity', html:'$y[n]=n\\,x[n]$ is linear and <em>not</em> time invariant. $y(t)=x^{2}(t)$ is time invariant and <em>not</em> linear. The two properties are independent, and Module 3 needs both.'}]}
  ], right:[
    {t:'grid', cols:2, gap:'10px', items:[
      [{t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:420,h:165,xr:[-3,4],yr:[-0.3,1.5],xlabel:'n',pad:{l:40,r:16,t:14,b:28},xtarget:4,ytarget:2});
        a.stem(disc(n=>n===0?1:0,-3,4),{color:C.in,r:3});
        a.note(3.6,1.28,'x_1[n]=\\delta[n]',{anchor:'end',color:C.in,fs:12,tex:true}); return a.svg(); }}],
      [{t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:420,h:165,xr:[-3,4],yr:[-0.3,1.5],xlabel:'n',pad:{l:40,r:16,t:14,b:28},xtarget:4,ytarget:2});
        a.stem(disc(()=>0,-3,4),{color:C.out,showZero:true,r:3});
        a.note(3.6,1.28,'y_1[n]=n\\,\\delta[n]=0',{anchor:'end',color:C.out,fs:12,tex:true}); return a.svg(); }}]
    ]},
    {t:'reveal', at:1, items:[
      {t:'grid', cols:2, gap:'10px', items:[
        [{t:'fig', frame:true, svg:()=>{
          const a=P.Axes({w:420,h:165,xr:[-3,4],yr:[-0.3,1.5],xlabel:'n',pad:{l:40,r:16,t:14,b:28},xtarget:4,ytarget:2});
          a.stem(disc(n=>n===1?1:0,-3,4),{color:C.h,r:3});
          a.note(3.6,1.28,'x_2[n]=\\delta[n-1]',{anchor:'end',color:C.h,fs:12,tex:true}); return a.svg(); }}],
        [{t:'fig', frame:true, svg:()=>{
          const a=P.Axes({w:420,h:165,xr:[-3,4],yr:[-0.3,1.5],xlabel:'n',pad:{l:40,r:16,t:14,b:28},xtarget:4,ytarget:2});
          a.stem(disc(n=>n===1?1:0,-3,4),{color:C.err,r:3});
          a.note(3.6,1.28,'y_2[n]=\\delta[n-1]',{anchor:'end',color:C.err,fs:12,tex:true}); return a.svg(); }}]
      ]},
      {t:'small', html:'Top row: the impulse and the zero output it produces. Bottom row: the shifted impulse and the output it produces. Path 2 would give $y_1[n-1]=0$; path 1 gives $\\delta[n-1]$. The two disagree, so the system is not time invariant.'}]}
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
        ['Bonus','This system is also time invariant, so it is <b>LTI</b>. It is the simplest member of the family that Module 3 studies.']
      ]}]},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['(b)','$y[n]=\\bigl(x[2n]\\bigr)^{2}$ — <b>not linear</b>.'],
        ['Setup','$x_3[n]=a x_1[n]+b x_2[n]\\;\\Rightarrow\\; y_3[n]=\\bigl(a x_1[2n]+b x_2[2n]\\bigr)^{2}$.'],
        ['Expand','$y_3[n]=a^{2}x_1^{2}[2n]+\\underbrace{2ab\\,x_1[2n]x_2[2n]}_{\\text{cross term}}+b^{2}x_2^{2}[2n]$.'],
        ['Compare','$a y_1[n]+b y_2[n]=a\\,x_1^{2}[2n]+b\\,x_2^{2}[2n]$. The powers of $a,b$ differ <em>and</em> a cross term appears ⇒ not linear.']
      ]}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'A shorter disproof', html:'Test homogeneity first. Scaling the input by $a$ scales this output by $a^{2}$, not by $a$. Setting $a=2$ and $b=0$ disproves linearity. A failure of either homogeneity or additivity is enough.'}]},
    {t:'reveal', at:4, items:[
      {t:'note', kind:'err', head:'Zero-input test', html:'$y(t)=x(t)+5$ is not linear because the zero input does not give the zero output. Every linear system must satisfy $S\\{0\\}=0$, so this test rules out any non-zero constant offset.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>P.blocks({w:820,h:330,items:[
      {t:'text',x:100,y:34,label:'PATH 1 — combine, then process',fs:14,anchor:'start',color:C.slate},
      {t:'arrow',x1:100,y1:90,x2:280,y2:90},{t:'box',x:280,y:58,w:150,h:64,label:'S',tex:true},
      {t:'arrow',x1:430,y1:90,x2:610,y2:90},
      {t:'text',x:190,y:78,label:'a\\,x_1+b\\,x_2',tex:true,fs:15},
      {t:'text',x:520,y:78,label:'y_3',tex:true,fs:15},
      {t:'text',x:100,y:186,label:'PATH 2 — process, then combine',fs:14,anchor:'start',color:C.slate},
      {t:'arrow',x1:100,y1:240,x2:280,y2:240},{t:'box',x:280,y:208,w:150,h:64,label:'S',tex:true},
      {t:'arrow',x1:430,y1:240,x2:610,y2:240},
      {t:'text',x:190,y:228,label:'x_1,\\;x_2',tex:true,fs:15},
      {t:'text',x:520,y:228,label:'a\\,y_1+b\\,y_2',tex:true,fs:15},
      {t:'text',x:660,y:170,label:'equal?',fs:16,color:C.coral},
      {t:'line',d:'M640 90 h40 v150 h-40',color:C.coral}
    ]}), caption:'A linear system gives the same result when signals are combined before or after the system.'}
  ]}
]},

{ id:'m2-workflow', module:'M2', nav:'Classification workflow', title:'A workflow you can defend', src:'pp. 11–14',
  objective:'Give a repeatable order of attack for classifying an unfamiliar system.',
  keywords:'workflow classification order strategy checklist', steps:2, blocks:[
  {t:'eyebrow', text:'Module 2 · Method', src:'pp. 11–14'},
  {t:'title', text:'A method for classifying a system'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:`<p><b>Step 1: test time invariance.</b> Apply the two-path test when the rule contains an explicit $t$ or $n$, a time-dependent gain, or a scaled argument.</p>
      <p><b>Step 2: test linearity.</b> Look for squares, products, $\\sin(x)$, absolute values or saturation. Test homogeneity with one scalar first.</p>
      <p><b>Step 3: inspect every input argument.</b> An argument different from $t$ or $n$ gives memory. An argument later than the output time gives non-causality.</p>
      <p><b>Step 4: test stability.</b> Assume $|x|\\le B$ and derive a finite output bound. To disprove stability, choose a bounded input that makes the output grow without bound.</p>
      <p><b>Step 5: test invertibility.</b> Find an inverse formula or two distinct inputs with the same output.</p>`},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'One general implication', html:'<b>Memoryless ⇒ causal.</b> Establish the other properties independently. A causal system need not be stable, a linear system need not be time invariant, and a stable system need not be memoryless.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
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
      const W=820,H=360,x0=250,cw=88,rh=40;
      const g=[`<text x="8" y="30" font-size="13" fill="${C.slate}" font-family="ui-monospace,monospace" letter-spacing="1.4">SYSTEM</text>`];
      cols.forEach((c,i)=>g.push(`<text x="${x0+cw*i+cw/2}" y="30" font-size="12" fill="${C.slate}" text-anchor="middle" font-family="ui-monospace,monospace" letter-spacing="1.2">${c.toUpperCase()}</text>`));
      rows.forEach((r,j)=>{
        const y=58+rh*j;
        g.push(`<line x1="0" y1="${y-14}" x2="${W}" y2="${y-14}" stroke="${C.grid}"/>`);
        g.push(P.texName(r[0],{xLeft:8, baseline:y+9, size:14, color:C.ink, figW:x0-16}));
        r[1].forEach((v,i)=>g.push(`<text x="${x0+cw*i+cw/2}" y="${y+7}" font-size="16" text-anchor="middle"
          fill="${v?'#4A7A46':'#A63B2A'}">${v?'✓':'✗'}</text>`));
      });
      return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="Inter,-apple-system,sans-serif">${g.join('')}</svg>`;
    }, caption:'The examples show that the six properties require separate tests. Read each property down its column.'}
  ]}
]},

{ id:'m2-lab-d', module:'M2', nav:'Laboratory D · Property checker', title:'Laboratory D — System Property Checker', src:'pp. 11–14, 21',
  objective:'Apply the six formal tests to thirteen source systems.',
  keywords:'laboratory system property checker criterion counterexample', steps:0, blocks:[
  {t:'eyebrow', text:'Interactive laboratory D', src:'pp. 11–14, 21'},
  {t:'title', text:'Thirteen systems, six tests each'},
  {t:'lede', text:'Classify each system with a proof or an explicit counterexample. Predict all six results before opening the explanation.'},
  {t:'lab', id:'D'}
]},

{ id:'m2-synth', module:'M2', nav:'Module 2 synthesis', title:'Module 2 — what to carry forward', src:'pp. 11–14',
  dark:true, objective:'Consolidate and motivate the LTI restriction.',
  keywords:'synthesis summary module 2 LTI motivation', steps:2, blocks:[
  {t:'eyebrow', text:'Module 2 · Synthesis', src:'pp. 11–14'},
  {t:'title', text:'Why linearity and time invariance are used together'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:`<p style="color:var(--graphite)">Memory, causality, stability and invertibility describe limits on a system.</p>
      <p style="color:var(--graphite)">Linearity and time invariance give an additional result: one impulse response determines the output for every input.</p>`},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'The claim Module 3 proves', html:'<span style="color:var(--graphite)">If a system is linear and time invariant, then its response to <b>one</b> input, the unit impulse, determines its response to <b>every</b> input. The system reduces from an infinite-dimensional map to one function $h$.</span>'}]},
    {t:'reveal', at:2, items:[
      {t:'body', html:`<p style="color:var(--graphite)">Module 3 proves this result in three steps. Represent the input as weighted shifted impulses. Use time invariance to shift the impulse response. Then use linearity to pass the weights and sum through the system.</p>`}]}
  ], right:[
    {t:'raw', html:'<p class="eyebrow" style="margin-bottom:14px"><span class="tick"></span>Reflection</p>'},
    {t:'lede', text:'A saturating amplifier is time invariant but not linear. A fading radio channel is linear but not time invariant. Both are very common, and neither one has an impulse response. What does that cost you in practice? What do engineers do about it?'},
    {t:'reveal', at:2, items:[
      {t:'raw', html:`<div class="instr"><div class="instr-panel"><span class="note-h">Discussion guidance</span>
        <span style="color:var(--graphite)">Both are handled by <em>local</em> LTI approximations: small-signal linearisation about an operating point for the amplifier, and block-wise time invariance over a coherence interval for the channel. The engineering question is then how long the approximation stays valid. That is a quantitative version of “how badly is the property broken”.</span></div></div>`}]}
  ]}
]}
];
window.SCENES_M2 = SC;
})();
