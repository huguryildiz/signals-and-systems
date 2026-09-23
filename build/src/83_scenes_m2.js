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
  keywords:'system black box deterministic input output CT DT', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 2 · Abstraction', src:'p. 11'},
  {t:'title', text:'Input–Output Abstraction'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>P.blocks({w:560,h:520,items:[
      {t:'arrow',x1:40,y1:190,x2:180,y2:190},{t:'box',x:180,y:145,w:200,h:90,label:'S',tex:true},
      {t:'arrow',x1:380,y1:190,x2:520,y2:190},
      {t:'text',x:110,y:174,label:'x(t)',tex:true,fs:18},{t:'text',x:450,y:174,label:'y(t)',tex:true,fs:18},
      {t:'arrow',x1:40,y1:450,x2:180,y2:450},{t:'box',x:180,y:405,w:200,h:90,label:'S',tex:true},
      {t:'arrow',x1:380,y1:450,x2:520,y2:450},
      {t:'text',x:110,y:434,label:'x[n]',tex:true,fs:18},{t:'text',x:450,y:434,label:'y[n]',tex:true,fs:18}
    ]}), caption:'The same operator in continuous time and in discrete time.'}
  ], right:[
    {t:'note', kind:'def', head:'Definition', html:'A system turns an input signal into an output signal. The same input always gives the same output.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'y=S\\{x\\}', label:'The operator', note:'$S$ acts on the whole input signal.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Equality', html:'Two systems are equal when they give the same output for every input. Their construction may differ.'}]}
  ]}
]},

{ id:'m2-memory', module:'M2', nav:'Memory', title:'Memoryless systems and systems with memory', src:'p. 11',
  objective:'Define memorylessness and test it on the definition examples.',
  keywords:'memoryless memory instantaneous resistor capacitor accumulator', slide:true, steps:2, blocks:[
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
      {t:'note', kind:'err', head:'Has memory', html:'$y[n]=x[n-1]$ uses the previous input. The output at $n$ depends on $n-1$.'}]}
  ]}
]},

{ id:'m2-memory-b', module:'M2', nav:'Accumulator', title:'Feedback Gives Memory', src:'p. 11',
  objective:'Show that output feedback can make a system remember its input.',
  keywords:'accumulator feedback memory sum', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 2 · Property 1', src:'p. 11'},
  {t:'title', text:'Feedback Gives Memory'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=P.Axes({w:560,h:380,xr:[-2,9],yr:[-0.4,6.5],xlabel:'n',ylabel:'\\text{amplitude}',pad:{l:50,r:24,t:20,b:34},xtarget:7,ytarget:3});
      a.stem(disc(n=>(n>=0&&n<=5)?1:0,-2,9),{color:C.in});
      a.stem(disc(n=>n<0?0:Math.min(n+1,6),-2,9),{color:C.out,r:3});
      a.note(4.2,5.6,'y[n]=\\sum_k x[k]',{anchor:'end',color:C.out,fs:14,tex:true});
      a.note(-1.8,1.4,'x[n]',{anchor:'start',color:C.in,fs:14,tex:true});
      return a.svg(); },
      caption:'Each output of the accumulator carries every earlier input.'},
    {t:'legend', items:[['in','$x[n]$'],['out','$y[n]$']]}
  ], right:[
    {t:'eq', tex:'y[n]=x[n]+y[n-1]', label:'Feedback'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'\\begin{aligned}y[n]&=x[n]+y[n-1]\\\\&=x[n]+x[n-1]+y[n-2]\\\\&=x[n]+x[n-1]+x[n-2]+\\cdots\\\\&=\\sum_{k=0}^{\\infty}x[n-k]\\end{aligned}', label:'The past', note:'This form assumes initial rest, so no stored initial value remains.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'The whole past', html:'The output uses $x[n-k]$ for every $k\\ge 0$. Feedback can give a system memory.'}]}
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
      {t:'text',x:280,y:138,label:'\\text{one-to-one}\\Rightarrow\\text{invertible}',fs:14,color:C.slate,tex:true}
    ]}), caption:'Invertibility is a property of the map. Distinct inputs must land on distinct outputs.'}
  ], right:[
    {t:'note', kind:'def', head:'Criterion', html:'A system is invertible if distinct inputs produce distinct outputs. The map is one-to-one.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'Two methods', html:'To prove it, recover every input from its output. To disprove it, find two distinct inputs with the same output.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'$y(t)=\\bigl[\\cos(t)+2\\bigr]x(t)$.<div class="nsep"></div>Is the system invertible?'}]},
    {t:'reveal', at:3, items:[
      {t:'eq', tex:'\\begin{aligned}-1&\\le\\cos(t)\\le1\\\\1&\\le\\cos(t)+2\\le3\\\\y(t)&=[\\cos(t)+2]x(t)\\\\x(t)&=\\dfrac{y(t)}{\\cos(t)+2}\\end{aligned}', label:'Recover the input',
        note:'The divisor is never zero, so the system is invertible.'}]}
  ]}
]},

{ id:'m2-invertible-b', module:'M2', nav:'Squaring', title:'Squaring Is Not Invertible', src:'pp. 11–12',
  objective:'Disprove invertibility with two inputs that share an output.',
  keywords:'square counterexample sign not invertible', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 2 · Property 2', src:'pp. 11–12'},
  {t:'title', text:'Squaring Is Not Invertible'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=P.Axes({w:560,h:380,xr:[-1,6],yr:[-1.6,1.6],xlabel:'t',ylabel:'\\text{amplitude}',pad:{l:50,r:24,t:20,b:34},xtarget:7,ytarget:3});
      a.curve(()=>1,{color:C.in}); a.curve(()=>-1,{color:C.mid});
      a.curve(()=>1,{color:C.err,dash:'7 5',width:3});
      a.note(5.7,1.28,'x_1=1\\;\\text{and}\\;y=1',{anchor:'end',color:C.err,fs:14,tex:true});
      a.note(5.7,-1.3,'x_2=-1',{anchor:'end',color:C.mid,fs:14,tex:true});
      return a.svg(); },
      caption:'Two distinct inputs collapse onto one output, so squaring is not invertible.'},
    {t:'legend', items:[['in','$x_1(t)$'],['mid','$x_2(t)$'],['err','$y(t)$']]}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$y(t)=x^{2}(t)$.<div class="nsep"></div>Is the system invertible?'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\begin{aligned}x_1(t)&=1&\\Longrightarrow\\quad S\\{x_1\\}&=1^2=1\\\\x_2(t)&=-1&\\Longrightarrow\\quad S\\{x_2\\}&=(-1)^2=1\\end{aligned}', label:'Two inputs, one output',
        note:'The inputs are distinct, but their outputs are equal. The sign is lost.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Not an inverse', html:'$x(t)=\\sqrt{y(t)}$ keeps only one of the two inputs. An inverse must recover the actual input.'}]}
  ]}
]},

{ id:'m2-causal', module:'M2', nav:'Causality', title:'Causality', src:'p. 12',
  objective:'Define causality and work all five source examples.',
  keywords:'causal non-causal future past present real-time', slide:true, steps:0, blocks:[
  {t:'eyebrow', text:'Module 2 · Property 3', src:'p. 12'},
  {t:'title', text:'Causality'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=P.Axes({w:560,h:380,xr:[-5,5],yr:[-0.15,1.25],xlabel:'\\text{time relative to the output instant}',ylabel:'\\text{input access}',
        pad:{l:50,r:24,t:26,b:44},xtarget:11,ytarget:2,yticksOverride:[]});
      a.rect(-5,0,0,1,{fill:'rgba(74,122,70,.14)'});
      a.rect(0,0,5,1,{fill:'rgba(166,59,42,.13)'});
      a.vline(0,{color:C.coral,dash:'0',width:1.6,opacity:1});
      a.note(-2.5,0.55,'available to a causal system',{anchor:'middle',color:C.out,fs:15});
      a.note(2.5,0.55,'forbidden — the future',{anchor:'middle',color:C.err,fs:15});
      a.note(0,1.12,'now',{anchor:'middle',color:C.coral,fs:14});
      return a.svg(); },
      caption:'A causal system may use the past and the present. It may not use the future.'}
  ], right:[
    {t:'note', kind:'def', head:'Criterion', html:'A system is causal if the output at time $t$, or at $n$, depends only on inputs at times up to $t$. That is the present and the past.'}
  ]}
]},

{ id:'m2-causal-b', module:'M2', nav:'Five tests', title:'Causal and Not Causal', src:'p. 12',
  objective:'Apply the causality test to five system rules.',
  keywords:'causal future reversal cosine', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 2 · Property 3', src:'p. 12'},
  {t:'title', text:'Causal and Not Causal'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=P.Axes({w:560,h:380,xr:[-4,4],yr:[-0.3,1.4],xlabel:'n',ylabel:'\\text{amplitude}',pad:{l:50,r:24,t:20,b:34},xtarget:9,ytarget:2});
      a.stem(disc(n=>n===1?1:0,-4,4),{color:C.in});
      a.stem(disc(n=>n===-1?1:0,-4,4),{color:C.err});
      a.note(-1,1.22,'y[-1]',{anchor:'middle',color:C.err,fs:14,tex:true});
      a.note(1,1.22,'x[1]',{anchor:'middle',color:C.in,fs:14,tex:true});
      a.raw(`<path d="M${a.sx(0.9)},${a.sy(1.05)} C ${a.sx(0.3)},${a.sy(1.32)} ${a.sx(-0.3)},${a.sy(1.32)} ${a.sx(-0.9)},${a.sy(1.05)}"
              fill="none" stroke="${C.err}" stroke-width="1.4" stroke-dasharray="4 3"/>`);
      return a.svg(); },
      caption:'$y[n]=x[-n]$: the output at $n=-1$ reads the input at $n=1$.'},
    {t:'legend', items:[['in','$x[1]$'],['err','$y[-1]$']]}
  ], right:[
    {t:'note', kind:'ok', head:'Causal', html:'$y[n]=x[n-1]$ uses a past sample. $\\displaystyle y(t)=\\int_{-\\infty}^{t}x(\\tau)\\,\\d\\tau$ stops at $t$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'err', head:'Not causal', html:'$y[n]=x[n]+x[n+1]$ uses a future sample.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'y[-1]=x[-(-1)]=x[1]', label:'Reversal',
        note:'The output at $n=-1$ reads a future input.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'A known function', html:'$y(t)=x(t)\\cos(t+1)$ uses only $x(t)$. The cosine is a fixed function of $t$, not a future input.'}]}
  ]}
]},

{ id:'m2-stable', module:'M2', nav:'BIBO stability', title:'BIBO stability', src:'pp. 12–13',
  objective:'Define boundedness and BIBO stability; prove one case, disprove another.',
  keywords:'BIBO bounded input bounded output stability triangle inequality accumulator', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 2 · Property 4', src:'pp. 12–13'},
  {t:'title', text:'BIBO Stability'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>P.blocks({w:560,h:420,items:[
      {t:'arrow',x1:35,y1:210,x2:170,y2:210},
      {t:'box',x:170,y:165,w:220,h:90,label:'2x^{2}(t-1)+x(3t)',tex:true,fs:16},
      {t:'arrow',x1:390,y1:210,x2:525,y2:210},
      {t:'text',x:102,y:194,label:'x(t)',tex:true,fs:18},
      {t:'text',x:458,y:194,label:'y(t)',tex:true,fs:18}
    ]}), caption:'The bound $2B^{2}+B$ holds for every input that stays within $B$.'}
  ], right:[
    {t:'note', kind:'def', head:'Bounded', html:'A signal is bounded if some finite $B$ satisfies $|x(t)|<B$ for every $t$. The same word applies to $x[n]$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'BIBO stability', html:'Every bounded input must produce a bounded output. One bounded example cannot prove this.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'\\begin{aligned}|y(t)|&=|2x^{2}(t-1)+x(3t)|\\\\&\\le2|x(t-1)|^{2}+|x(3t)|\\\\&\\le2B^{2}+B<\\infty\\end{aligned}', label:'A stable rule', note:'The first inequality is the triangle inequality. The second uses $|x|\\le B$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Check', html:'$x(t-1)$ and $x(3t)$ take the same values as $x$. A shift or a scale cannot break the bound.'}]}
  ]}
]},

{ id:'m2-stable-b', module:'M2', nav:'Unstable accumulator', title:'A Bounded Input, an Unbounded Output', src:'pp. 12–13',
  objective:'Disprove stability with one bounded input.',
  keywords:'accumulator BIBO counterexample n+1', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 2 · Property 4', src:'pp. 12–13'},
  {t:'title', text:'A Bounded Input, an Unbounded Output'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=P.Axes({w:560,h:380,xr:[-2,12],yr:[-1,14],xlabel:'n',ylabel:'y[n]',pad:{l:52,r:24,t:20,b:34},xtarget:8,ytarget:4});
      a.stem(disc(n=>n>=0?n+1:0,-2,12),{color:C.err});
      a.note(11.6,12.6,'y[n]=n+1\\to\\infty',{anchor:'end',color:C.err,fs:14,tex:true});
      return a.svg(); },
      caption:'The input never exceeds 1. The output grows without a bound, so the system is not stable.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$y[n]=\\displaystyle\\sum_{k=-\\infty}^{n}x[k]$.<div class="nsep"></div>Is the accumulator stable?'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\begin{aligned}y[n]&=\\sum_{k=-\\infty}^{n}u[k]\\\\&=\\sum_{k=0}^{n}1\\\\&=n+1\\;\\longrightarrow\\;\\infty,\\qquad n\\ge0\\end{aligned}', label:'Bounded input, unbounded output',
        note:'The input satisfies $|u[n]|\\le1$, but the output has no finite bound.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Causal is not stable', html:'The accumulator is causal and not stable. $y[n]=x[-n]$ is stable and not causal.'}]}
  ]}
]},

{ id:'m2-ti', module:'M2', nav:'Time invariance', title:'Time invariance', src:'p. 13',
  objective:'State the test as a comparison of two computed signals and work both examples.',
  keywords:'time invariance shift test two paths sin worked example', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 2 · Property 5', src:'p. 13'},
  {t:'title', text:'Time Invariance'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>P.blocks({w:560,h:520,items:[
      {t:'text',x:35,y:70,label:'PATH 1 — shift, then process',fs:14,anchor:'start',color:C.slate},
      {t:'arrow',x1:35,y1:160,x2:155,y2:160},{t:'box',x:155,y:125,w:120,h:70,label:'\\text{shift}\\;t_0',tex:true},
      {t:'arrow',x1:275,y1:160,x2:350,y2:160},{t:'box',x:350,y:125,w:100,h:70,label:'S',tex:true},
      {t:'arrow',x1:450,y1:160,x2:525,y2:160},
      {t:'text',x:95,y:144,label:'x(t)',tex:true,fs:17},{t:'text',x:488,y:144,label:'y_2(t)',tex:true,fs:17},
      {t:'text',x:35,y:350,label:'PATH 2 — process, then shift',fs:14,anchor:'start',color:C.slate},
      {t:'arrow',x1:35,y1:440,x2:155,y2:440},{t:'box',x:155,y:405,w:120,h:70,label:'S',tex:true},
      {t:'arrow',x1:275,y1:440,x2:350,y2:440},{t:'box',x:350,y:405,w:100,h:70,label:'\\text{shift}\\;t_0',tex:true},
      {t:'arrow',x1:450,y1:440,x2:525,y2:440},
      {t:'text',x:95,y:424,label:'x(t)',tex:true,fs:17},{t:'text',x:488,y:424,label:'y_1(t-t_0)',tex:true,fs:17}
    ]}), caption:'A time-invariant system makes the two paths agree, for every input and every shift.'}
  ], right:[
    {t:'note', kind:'def', head:'Criterion', html:'If $x(t)$ produces $y(t)$, then $x(t-t_0)$ must produce $y(t-t_0)$, for every shift $t_0$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'Two paths', html:'Path 1 shifts the input, then applies the system. Path 2 applies the system, then shifts the output.'}]},
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
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=P.Axes({w:560,h:380,xr:[-3,4],yr:[-0.3,1.5],xlabel:'n',ylabel:'\\text{amplitude}',pad:{l:40,r:16,t:14,b:28},xtarget:4,ytarget:2});
      a.stem(disc(()=>0,-3,4),{color:C.out,showZero:true,r:3});
      a.stem(disc(n=>n===1?1:0,-3,4),{color:C.err,r:3});
      a.note(3.6,0.42,'y_1[n]=0',{anchor:'end',color:C.out,fs:14,tex:true});
      a.note(3.6,1.28,'y_2[n]=\\delta[n-1]',{anchor:'end',color:C.err,fs:14,tex:true});
      return a.svg(); },
      caption:'Path 2 stays at 0. Path 1 puts a 1 at $n=1$.'},
    {t:'legend', items:[['out','$y_1[n]$'],['err','$y_2[n]$']]}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$y[n]=n\\,x[n]$.<div class="nsep"></div>Is the system time invariant?'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\begin{aligned}x_1[n]&=\\delta[n]\\\\y_1[n]&=n\\delta[n]=0\\\\y_1[n-1]&=0\\end{aligned}', label:'Path 2 · shift the output'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'\\begin{aligned}x_2[n]&=\\delta[n-1]\\\\y_2[n]&=n\\delta[n-1]\\\\&=1\\cdot\\delta[n-1]=\\delta[n-1]\\neq0\\end{aligned}', label:'Path 1 · shift the input',
        note:'The paths disagree, so the system is not time invariant.'}]}
  ]}
]},

{ id:'m2-linear', module:'M2', nav:'Linearity', title:'Linearity', src:'p. 14',
  objective:'State superposition and work both source examples in full.',
  keywords:'linearity superposition additive homogeneous scalable cross term', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 2 · Property 6', src:'p. 14'},
  {t:'title', text:'Linearity'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>P.blocks({w:560,h:520,items:[
      {t:'text',x:35,y:70,label:'PATH 1 — combine, then process',fs:14,anchor:'start',color:C.slate},
      {t:'arrow',x1:35,y1:160,x2:190,y2:160},{t:'box',x:190,y:125,w:150,h:70,label:'S',tex:true},
      {t:'arrow',x1:340,y1:160,x2:500,y2:160},
      {t:'text',x:112,y:144,label:'a\\,x_1+b\\,x_2',tex:true,fs:15},
      {t:'text',x:420,y:144,label:'y_3',tex:true,fs:15},
      {t:'text',x:35,y:350,label:'PATH 2 — process, then combine',fs:14,anchor:'start',color:C.slate},
      {t:'arrow',x1:35,y1:440,x2:190,y2:440},{t:'box',x:190,y:405,w:150,h:70,label:'S',tex:true},
      {t:'arrow',x1:340,y1:440,x2:500,y2:440},
      {t:'text',x:112,y:424,label:'x_1,\\;x_2',tex:true,fs:15},
      {t:'text',x:420,y:424,label:'a\\,y_1+b\\,y_2',tex:true,fs:15},
      {t:'text',x:490,y:300,label:'equal?',fs:16,anchor:'end',color:C.coral},
      {t:'line',d:'M505 160 h20 v280 h-20',color:C.coral}
    ]}), caption:'A linear system gives the same result when the signals are combined before the system or after it.'}
  ], right:[
    {t:'eq', key:true, tex:'a\\,x_1+b\\,x_2\\;\\longrightarrow\\;a\\,y_1+b\\,y_2', label:'Superposition', note:'$a$ and $b$ are complex. $x_1$ produces $y_1$ and $x_2$ produces $y_2$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Given', html:'$y(t)=2\\pi\\,x(t)$.<div class="nsep"></div>Is the system linear?'}]},
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
    {t:'fig', frame:true, grow:true, svg:()=>P.blocks({w:560,h:520,items:[
      {t:'text',x:35,y:70,label:'PATH 1 — combine, then process',fs:14,anchor:'start',color:C.slate},
      {t:'arrow',x1:35,y1:160,x2:190,y2:160},{t:'box',x:190,y:125,w:150,h:70,label:'S',tex:true},
      {t:'arrow',x1:340,y1:160,x2:500,y2:160},
      {t:'text',x:112,y:144,label:'a\\,x_1+b\\,x_2',tex:true,fs:15},
      {t:'text',x:420,y:144,label:'y_3',tex:true,fs:15},
      {t:'text',x:35,y:350,label:'PATH 2 — process, then combine',fs:14,anchor:'start',color:C.slate},
      {t:'arrow',x1:35,y1:440,x2:190,y2:440},{t:'box',x:190,y:405,w:150,h:70,label:'S',tex:true},
      {t:'arrow',x1:340,y1:440,x2:500,y2:440},
      {t:'text',x:112,y:424,label:'x_1,\\;x_2',tex:true,fs:15},
      {t:'text',x:420,y:424,label:'a\\,y_1+b\\,y_2',tex:true,fs:15},
      {t:'text',x:490,y:300,label:'equal?',fs:16,anchor:'end',color:C.coral},
      {t:'line',d:'M505 160 h20 v280 h-20',color:C.coral}
    ]}), caption:'The two paths ask whether $y_3$ equals $a y_1+b y_2$. For this rule they do not.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$y[n]=\\bigl(x[2n]\\bigr)^{2}$.<div class="nsep"></div>Is the system linear?'},
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
  {t:'cols', ratio:'c-5-7-exception', fill:true, left:[
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
      const W=560,H=590,x0=190,cw=60,rh=70;
      const g=[`<text x="8" y="30" font-size="13" fill="${C.slate}" font-family="ui-monospace,monospace" letter-spacing="1.4">SYSTEM</text>`];
      cols.forEach((c,i)=>g.push(`<text x="${x0+cw*i+cw/2}" y="30" font-size="12" fill="${C.slate}" text-anchor="middle" font-family="ui-monospace,monospace" letter-spacing="1.2">${c.toUpperCase()}</text>`));
      rows.forEach((r,j)=>{
        const y=82+rh*j;
        g.push(`<line x1="0" y1="${y-14}" x2="${W}" y2="${y-14}" stroke="${C.grid}"/>`);
        g.push(P.texName(r[0],{xLeft:8, baseline:y+9, size:14, color:C.ink, figW:x0-16}));
        r[1].forEach((v,i)=>g.push(`<text x="${x0+cw*i+cw/2}" y="${y+7}" font-size="16" text-anchor="middle"
          fill="${v?'#4A7A46':'#A63B2A'}">${v?'✓':'✗'}</text>`));
      });
      return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="Inter,-apple-system,sans-serif">${g.join('')}</svg>`;
    }, caption:'Each column is one property. The rows show why the tests are separate.'}
  ], right:[
    {t:'note', kind:'def', head:'Order', html:'Test time invariance first when the rule has an explicit $t$ or $n$. Then test linearity, with one scalar.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Then', html:'Read every input argument for memory and causality. Then test stability, and then invertibility.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'One implication', html:'Memoryless implies causal. A causal system need not be stable, and a linear system need not be time invariant.'}]}
  ]}
]},

{ id:'m2-lab-d', module:'M2', nav:'Laboratory D · Property checker', title:'Laboratory D — System Property Checker', src:'pp. 11–14, 21',
  objective:'Apply the six formal tests to thirteen source systems.',
  keywords:'laboratory system property checker criterion counterexample', steps:0, blocks:[
  {t:'eyebrow', text:'Interactive laboratory D', src:'pp. 11–14, 21'},
  {t:'title', text:'Laboratory D · System Properties'},
  {t:'lede', text:'Classify each system with a proof or an explicit counterexample. Predict all six results before opening the explanation.'},
  {t:'lab', id:'D'}
]},

{ id:'m2-synth', module:'M2', nav:'Module 2 synthesis', title:'Module 2 — what to carry forward', src:'pp. 11–14',
  dark:true, objective:'Consolidate and motivate the LTI restriction.',
  keywords:'synthesis summary module 2 LTI motivation', steps:2, blocks:[
  {t:'eyebrow', text:'Module 2 · Synthesis', src:'pp. 11–14'},
  {t:'title', text:'Module 2 Summary'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:`<p style="color:var(--graphite)">Memory, causality, stability and invertibility describe limits on a system. Linearity and time invariance give an additional result: one impulse response determines the output for every input.</p>`},
    /* The six properties as prompts: name the test, then open the card. */
    {t:'raw', html:()=>RECALL.deck('m2', [
      {tag:'Limit', q:'Memoryless', a:'<b>Memoryless.</b> $y(t)$ uses only $x(t)$ at the same time.'},
      {tag:'Limit', q:'Causal', a:'<b>Causal.</b> $y(t)$ uses only $x(\\tau)$ for $\\tau\\le t$.'},
      {tag:'Limit', q:'Stable', a:'<b>Stable.</b> Every bounded input gives a bounded output.'},
      {tag:'Limit', q:'Invertible', a:'<b>Invertible.</b> Different inputs give different outputs.'},
      {tag:'LTI', q:'Linear', a:'<b>Linear.</b> $ax_1+bx_2\\;\\to\\;ay_1+by_2$.'},
      {tag:'LTI', q:'Time invariant', a:'<b>Time invariant.</b> $x(t-t_0)\\;\\to\\;y(t-t_0)$.'}
    ], {cols:2})},
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
