/* Course notes — Chapters 2 and 3 */
(function(){
const P=PLOT, C=P.COL;
const D=(f,a,b)=>{const o=[];for(let n=Math.ceil(a);n<=b;n++)o.push([n,f(n)]);return o;};
const ax=o=>P.Axes(Object.assign({w:700,h:200,pad:{l:44,r:20,t:16,b:30},xtarget:8,ytarget:3},o));

window.C23 = [
{t:'page'},

/* ================= CHAPTER 2 ================= */
{t:'h1', num:'CHAPTER 2', text:'Systems and their properties'},
{t:'p', lead:true, text:'This chapter gives tests for memory, invertibility, causality, stability, time invariance and linearity. Each test describes a system through its input and output signals.'},

{t:'h2', num:'2.1', text:'What a system is'},
{t:'p', text:'A system is a rule that turns an input signal into an output signal. The rule is deterministic: the same input always gives the same output.'},
{t:'p', text:'Write the rule as an operator, $y=S\\{x\\}$. The operator acts on the whole input signal. This form lets us test which input times affect an output and how the system responds to a time shift.'},
{t:'fig', svg:()=>P.blocks({w:700,h:190,items:[
  {t:'arrow',x1:60,y1:60,x2:230,y2:60},{t:'box',x:230,y:34,w:170,h:52,label:'continuous-time system',fs:13},
  {t:'arrow',x1:400,y1:60,x2:570,y2:60},
  {t:'text',x:140,y:48,label:'x(t)',tex:true,fs:15},{t:'text',x:490,y:48,label:'y(t)',tex:true,fs:15},
  {t:'arrow',x1:60,y1:140,x2:230,y2:140},{t:'box',x:230,y:114,w:170,h:52,label:'discrete-time system',fs:13},
  {t:'arrow',x1:400,y1:140,x2:570,y2:140},
  {t:'text',x:140,y:128,label:'x[n]',tex:true,fs:15},{t:'text',x:490,y:128,label:'y[n]',tex:true,fs:15}
]}), cap:'The operator description applies in continuous time and discrete time.'},

{t:'h2', num:'2.2', text:'Memory'},
{t:'box', html:'<span class="t">Criterion</span>A system is <b>memoryless</b> if the output at time $t$ (or $n$) depends only on the input at that same time.'},
{t:'table', head:['System','Verdict','Reason'], rows:[
 ['$y(t)=\\bigl[2x(t)-x^{2}(t)\\bigr]^{2}$','memoryless','Only $x(t)$ appears. There is no $x(t+1)$ or $x(t-2)$ term.'],
 ['$y[n]=x[n]$','memoryless','The identity system.'],
 ['$y[n]=x[n-1]$','has memory','The output at $n$ uses the sample at $n-1$.'],
 ['$y[n]=x[n]+y[n-1]$','has memory','See the derivation below.']
]},
{t:'p', text:'For the last system, expose the memory by substituting the feedback relation repeatedly:'},
{t:'eq', tex:'y[n-1]=x[n-1]+y[n-2],\\qquad y[n-2]=x[n-2]+y[n-3],\\qquad\\dots'},
{t:'eq', tex:'\\Longrightarrow\\quad y[n]=x[n]+x[n-1]+x[n-2]+\\cdots=\\sum_{k=0}^{\\infty}x[n-k].'},
{t:'p', text:'The result uses $x[n-k]$ for every $k\\ge0$, so the output depends on the whole input history. Output feedback can therefore give a system memory.'},
{t:'box', kind:'ok', html:'<span class="t">Circuit examples</span>A resistor, $v(t)=R\\,i(t)$, is memoryless because the voltage at $t$ uses only the current at $t$. A capacitor is not memoryless because $v(t)=\\frac{1}{C}\\int_{-\\infty}^{t}i(\\tau)\\,\\d\\tau$ uses the current history.'},

{t:'h2', num:'2.3', text:'Invertibility'},
{t:'box', html:'<span class="t">Criterion</span>A system is <b>invertible</b> if distinct inputs always produce distinct outputs. The map must be one-to-one.'},
{t:'p', text:'To prove invertibility, find a formula that recovers every input from its output. To disprove invertibility, find two distinct inputs that give the same output.'},
{t:'ex', hd:'Example 2.1', rows:[
 ['Given','$y(t)=\\bigl[\\cos(t)+2\\bigr]x(t)$.'],
 ['Find','Is the system invertible?'],
 ['Method','Solve the system rule for $x(t)$ and verify that the divisor never vanishes.'],
 ['Solution','Yes. The gain satisfies $1\\le\\cos(t)+2\\le3$, so it never vanishes and $$x(t)=\\frac{y(t)}{\\cos(t)+2}.$$'],
 ['Check','Substituting back gives $\\bigl[\\cos t+2\\bigr]\\dfrac{y(t)}{\\cos t+2}=y(t)$. Had the gain been $\\cos(t)$ alone, the system would fail at every zero of the cosine.']
]},
{t:'ex', hd:'Example 2.2', rows:[
 ['Given','$y(t)=x^{2}(t)$.'],
 ['Find','Is the system invertible?'],
 ['Method','Search for two distinct inputs that lose the same information under squaring.'],
 ['Solution','No. Take $x_1(t)=1$ and $x_2(t)=-1$ for all $t$. These are different inputs, but $y_1(t)=y_2(t)=1$.'],
 ['Check','One counterexample is enough. The sign information is destroyed and cannot be recovered from $y$ alone.']
]},
{t:'box', kind:'err', html:'<span class="t">Not an inversion formula</span>Writing $x(t)=\\sqrt{y(t)}$ does not invert $y=x^{2}$. It picks one of two possible inputs by convention. An inversion formula must return the actual input, for every admissible input.'},

{t:'h2', num:'2.4', text:'Causality'},
{t:'box', html:'<span class="t">Criterion</span>A system is <b>causal</b> if the output at time $t$ (or $n$) depends only on inputs at times $\\le t$: the present and the past.'},
{t:'table', head:['System','Verdict','Reason'], rows:[
 ['$y[n]=x[n-1]$','causal','Uses only a past sample.'],
 ['$y[n]=x[n]+x[n+1]$','not causal','$x[n+1]$ is a future sample.'],
 ['$y(t)=\\int_{-\\infty}^{t}x(\\tau)\\,\\d\\tau$','causal','The upper limit is $t$, so only $\\tau\\le t$ contributes.'],
 ['$y[n]=x[-n]$','not causal','$y[-1]=x[1]$. The output at $n=-1$ needs a future input.'],
 ['$y(t)=x(t)\\cos(t+1)$','causal','Uses only $x(t)$. The factor $\\cos(t+1)$ is a known function of $t$, fixed in advance, not a future input.']
]},
{t:'fig', svg:()=>{const a=ax({xr:[-5,5],yr:[-0.1,1.2],xlabel:'\\text{time relative to the output instant}',w:700,h:150,pad:{l:30,r:20,t:20,b:34},xtarget:11,ytarget:2,yticksOverride:[]});
  a.rect(-5,0,0,1,{fill:'rgba(63,108,59,.13)'}); a.rect(0,0,5,1,{fill:'rgba(152,53,39,.12)'});
  a.vline(0,{color:C.err,dash:'0',width:1.4,opacity:1});
  a.note(-2.5,0.52,'available to a causal system',{anchor:'middle',color:C.out,fs:13});
  a.note(2.5,0.52,'forbidden: the future',{anchor:'middle',color:C.err,fs:13});
  a.note(0,1.1,'now',{anchor:'middle',color:C.err,fs:12}); return a.svg();},
 cap:'Causality restricts which part of the input axis the output is allowed to consult.'},
{t:'p', text:'A real-time system must be causal because future input values are not available. A non-causal system can be used when the complete signal has already been stored, as in offline audio or image processing.'},

{t:'h2', num:'2.5', text:'Stability'},
{t:'p', text:'A signal is <b>bounded</b> if there is a constant $B<\\infty$ with $|x(t)|<B$ for all $t$.'},
{t:'box', html:'<span class="t">Criterion</span>A system is <b>BIBO stable</b> if every bounded input produces a bounded output. Bounded Input, Bounded Output.'},
{t:'box', kind:'warn', html:'<span class="t">Proof and counterexample</span>To prove stability, derive an output bound for every bounded input. To disprove stability, find one bounded input that produces an unbounded output. One bounded example cannot prove stability.'},
{t:'ex', hd:'Example 2.3', rows:[
 ['Given','$y(t)=2x^{2}(t-1)+x(3t)$.'],
 ['Find','Is the system stable?'],
 ['Method','Assume $|x(t)|\\le B<\\infty$ and bound $|y|$ with the triangle inequality.'],
 ['Solution','$$|y(t)|\\le\\bigl|2x^{2}(t-1)\\bigr|+\\bigl|x(3t)\\bigr|\\le 2B^{2}+B<\\infty.$$ The system is stable.'],
 ['Check','Shifting and scaling the time axis cannot change the set of values a signal takes, so $x(t-1)$ and $x(3t)$ are bounded by the same $B$.']
]},
{t:'ex', hd:'Example 2.4', rows:[
 ['Given','$y[n]=\\sum_{k=-\\infty}^{n}x[k]$, the accumulator.'],
 ['Find','Is the system stable?'],
 ['Method','Look for one bounded input with an unbounded output.'],
 ['Solution','Take $x[n]=u[n]$, so $|x[n]|\\le1$. Then $$y[n]=\\sum_{k=0}^{n}1=n+1\\longrightarrow\\infty.$$ The system is <b>not</b> stable.'],
 ['Check','The input never exceeds 1 and the output grows without bound. That is exactly the failure BIBO stability forbids.']
]},
{t:'figrow', items:[
 {svg:()=>{const a=ax({xr:[-2,12],yr:[-0.3,1.4],xlabel:'n',w:340,h:130,pad:{l:36,r:14,t:12,b:26},xtarget:4,ytarget:2});
   a.stem(D(n=>n>=0?1:0,-2,12),{color:C.in,r:2.6}); a.hline(1,{color:C.in,dash:'2 5'}); return a.svg();},
  cap:'Bounded input $u[n]$.'},
 {svg:()=>{const a=ax({xr:[-2,12],yr:[-1,14],xlabel:'n',w:340,h:130,pad:{l:36,r:14,t:12,b:26},xtarget:4,ytarget:3});
   a.stem(D(n=>n>=0?n+1:0,-2,12),{color:C.err,r:2.6}); return a.svg();},
  cap:'Unbounded output $n+1$.'}
]},
{t:'box', kind:'warn', html:'<span class="t">Causal does not mean stable</span>The accumulator is causal and unstable. The reversal $y[n]=x[-n]$ is stable and not causal. The six properties are independent except where a proof links them.'},

{t:'h2', num:'2.6', text:'Time invariance'},
{t:'box', html:'<span class="t">Criterion</span>If $x(t)\\to y(t)$, the system is <b>time invariant</b> when $x(t-t_0)\\to y(t-t_0)$ for every $t_0$.'},
{t:'p', text:'The test is a comparison of two computed signals.'},
{t:'ol', items:[
 '<b>Path 1.</b> Shift the input, then run the system: $y_2=S\\{x(t-t_0)\\}$.',
 '<b>Path 2.</b> Run the system, then shift the output: $y_1(t-t_0)$.'
]},
{t:'p', text:'The system is time invariant exactly when the two agree, for every input and every $t_0$.'},
{t:'ex', hd:'Example 2.5', rows:[
 ['Given','$y(t)=\\sin\\bigl(x(t)\\bigr)$.'],
 ['Find','Is the system time invariant?'],
 ['Method','Compute the response to a shifted input and compare it with the shifted response.'],
 ['Solution','Path 1: with $x_2(t)=x_1(t-t_0)$ we get $y_2(t)=\\sin\\bigl(x_1(t-t_0)\\bigr)$.<br>Path 2: $y_1(t)=\\sin\\bigl(x_1(t)\\bigr)$, so $y_1(t-t_0)=\\sin\\bigl(x_1(t-t_0)\\bigr)$.<br>They agree for every $t_0$, so the system is time invariant.'],
 ['Check','Both paths give the same expression for every input and every $t_0$.']
]},
{t:'ex', hd:'Example 2.6', rows:[
 ['Given','$y[n]=n\\,x[n]$.'],
 ['Find','Is the system time invariant?'],
 ['Method','Look for a counterexample using an impulse.'],
 ['Solution','Take $x_1[n]=\\delta[n]$. Then $y_1[n]=n\\,\\delta[n]=0$ for every $n$.<br>Now delay by one: $x_2[n]=\\delta[n-1]$ gives $y_2[n]=n\\,\\delta[n-1]=\\delta[n-1]$, which equals 1 at $n=1$.<br>Time invariance would require $y_2[n]=y_1[n-1]=0$. It does not. The system is <b>not</b> time invariant.'],
 ['Check','The impulse isolates one index, so the unequal outputs form a complete counterexample.']
]},
{t:'box', kind:'ok', html:'<span class="t">When to apply the test first</span>An explicit time-dependent coefficient such as $n$ or $\\cos(t)$ usually breaks time invariance. A scaled input argument such as $x(3t)$ also changes input shifts. In either case, use the two-path test.'},

{t:'h2', num:'2.7', text:'Linearity'},
{t:'eqbox', cap:'Criterion', tex:'a\\,x_1+b\\,x_2\\;\\longrightarrow\\;a\\,y_1+b\\,y_2\\qquad\\text{for all }a,b\\in\\mathbb{C}',
 after:'where $x_1\\to y_1$ and $x_2\\to y_2$. This is additivity and homogeneity in one statement.'},
{t:'ex', hd:'Example 2.7', rows:[
 ['Given','$y(t)=2\\pi\\,x(t)$.'],
 ['Find','Is the system linear?'],
 ['Method','Apply the system to a weighted sum and compare the result with the same weighted sum of the two outputs.'],
 ['Solution','With $x_3=ax_1+bx_2$: $$y_3=2\\pi(ax_1+bx_2)=a\\underbrace{2\\pi x_1}_{y_1}+b\\underbrace{2\\pi x_2}_{y_2}=ay_1+by_2.$$ The system is linear. It is also time invariant, so it is the simplest possible LTI system.']
]},
{t:'ex', hd:'Example 2.8', rows:[
 ['Given','$y[n]=\\bigl(x[2n]\\bigr)^{2}$.'],
 ['Find','Is the system linear?'],
 ['Method','Apply superposition and compare the powers and cross term with the required linear result.'],
 ['Solution','With $x_3[n]=ax_1[n]+bx_2[n]$: $$y_3[n]=\\bigl(ax_1[2n]+bx_2[2n]\\bigr)^{2}=a^{2}x_1^{2}[2n]+2ab\\,x_1[2n]x_2[2n]+b^{2}x_2^{2}[2n],$$ while $ay_1[n]+by_2[n]=a\\,x_1^{2}[2n]+b\\,x_2^{2}[2n]$. The powers of $a$ and $b$ differ and a cross term appears, so the system is <b>not</b> linear.'],
 ['Check','Scaling the input by $a$ scales this output by $a^{2}$, so homogeneity also fails.']
]},
{t:'box', kind:'err', html:'<span class="t">Zero-input test</span>$y(t)=x(t)+5$ is not linear because the zero input does not give the zero output. Every linear system must satisfy $S\\{0\\}=0$.'},

{t:'h2', num:'2.8', text:'How to classify an unfamiliar system'},
{t:'ol', items:[
 '<b>Test time invariance.</b> Apply the two-path test when the rule contains an explicit $t$ or $n$, a time-dependent gain, or a scaled argument.',
 '<b>Test linearity.</b> Look for squares, products, $\\sin(x)$, absolute values or saturation. Test homogeneity with one scalar first.',
 '<b>Inspect every input argument.</b> An argument different from $t$ or $n$ gives memory. An argument later than the output time gives non-causality.',
 '<b>Test stability.</b> Assume $|x|\\le B$ and derive a finite output bound. To disprove stability, choose a bounded input that makes the output unbounded.',
 '<b>Test invertibility.</b> Find an inverse formula or two distinct inputs with the same output.'
]},
{t:'box', kind:'ok', html:'<span class="t">One general implication</span><b>Memoryless implies causal.</b> Establish the other properties independently. A causal system need not be stable, a linear system need not be time invariant, and a stable system need not be memoryless.'},
{t:'table', head:['System','Memoryless','Invertible','Causal','Stable','Time inv.','Linear'], rows:[
 ['$y(t)=2\\pi x(t)$','yes','yes','yes','yes','yes','yes'],
 ['$y[n]=x[n-1]$','no','yes','yes','yes','yes','yes'],
 ['$y(t)=x^{2}(t)$','yes','no','yes','yes','yes','no'],
 ['$y[n]=n\\,x[n]$','yes','no','yes','no','no','yes'],
 ['$y[n]=\\sum_{k\\le n}x[k]$','no','yes','yes','no','yes','yes'],
 ['$y[n]=x[-n]$','no','yes','no','yes','no','yes'],
 ['$y[n]=(x[2n])^{2}$','no','no','no','yes','no','no']
]},
{t:'p', text:'Read each property down its column. The examples show why the six properties require separate tests.'},

{t:'h3', text:'Exercises'},
{t:'q', n:'2.1', text:'Classify $y(t)=x(t)\\,u(t)$ against all six properties.', ans:'Memoryless, not invertible, causal, stable, not time invariant, linear.'},
{t:'q', n:'2.2', text:'Show that $y[n]=x[n]-x[n-1]$ is invertible on inputs that are zero for $n<0$, and give the inverse.', ans:'$x[n]=\\sum_{k=0}^{n}y[k]$.'},
{t:'q', n:'2.3', text:'Give a system that is linear and causal but not stable, and one that is stable and time invariant but not linear.'},
{t:'q', n:'2.4', text:'Is $y(t)=x(t/2)$ time invariant? Prove or give a counterexample.', ans:'No. Path 1 gives $x(t/2-t_0)$ and path 2 gives $x((t-t_0)/2)$.'},

{t:'page'},

/* ================= CHAPTER 3 ================= */
{t:'h1', num:'CHAPTER 3', text:'Linear time-invariant systems'},
{t:'p', lead:true, text:'This chapter develops a direct way to find the output of a linear time-invariant system. Its impulse response describes the system, and convolution uses that response to find the output for any input.'},

{t:'h2', num:'3.1', text:'The impulse response'},
{t:'box', html:'<span class="t">Definition</span>The <b>impulse response</b> is the output when the input is a unit impulse: $x[n]=\\delta[n]$ gives $y[n]=h[n]$. In continuous time, $x(t)=\\delta(t)$ gives $y(t)=h(t)$.'},
{t:'p', text:'For a general system, this experiment gives only one input-output pair. It does not determine the response to another input.'},
{t:'p', text:'For a linear time-invariant system, one impulse response is enough. Time invariance gives the response to every shifted impulse. Linearity gives the response to every weighted sum of those impulses. Chapter 1 showed that every discrete-time signal can be written as such a sum. Therefore $h[n]$ determines the response to every input.'},
{t:'fig', svg:()=>P.blocks({w:700,h:110,items:[
  {t:'arrow',x1:80,y1:56,x2:260,y2:56},{t:'box',x:260,y:32,w:150,h:48,label:'S',tex:true,fs:16},
  {t:'arrow',x1:410,y1:56,x2:600,y2:56},
  {t:'text',x:170,y:44,label:'\\delta[n]',tex:true,fs:15,color:'#14707F'},
  {t:'text',x:505,y:44,label:'h[n]',tex:true,fs:15,color:'#A9741C'}
]}), cap:'For an LTI system, one impulse experiment determines the response to every input.'},

{t:'h2', num:'3.2', text:'Deriving the convolution sum'},
{t:'p', text:'The purpose of this derivation is to obtain the output from $h[n]$. Start with the representation property from Chapter 1, then apply the system to both sides.'},
{t:'eq', tex:'x[n]=\\sum_{k=-\\infty}^{\\infty}x[k]\\,\\delta[n-k]\\quad\\longrightarrow\\quad S\\quad\\longrightarrow\\quad y[n]=\\;?'},
{t:'ol', items:[
 '<b>Time invariance.</b> Since $\\delta[n]\\to h[n]$, we also have $\\delta[n-k]\\to h[n-k]$.',
 '<b>Homogeneity.</b> The number $x[k]$ does not depend on $n$, so $x[k]\\delta[n-k]\\to x[k]h[n-k]$.',
 '<b>Additivity.</b> The response to the sum is the sum of the responses.'
]},
{t:'eqbox', cap:'Convolution sum', big:true, tex:'y[n]=\\sum_{k=-\\infty}^{\\infty}x[k]\\,h[n-k]\\;=\\;x[n]*h[n]'},
{t:'p', text:'Next, replace the summation index by $m=n-k$. This gives an equivalent form and shows that convolution is commutative:'},
{t:'eq', tex:'\\sum_{k=-\\infty}^{\\infty}x[k]h[n-k]=\\sum_{m=-\\infty}^{\\infty}x[n-m]h[m].'},
{t:'box', kind:'err', html:'<span class="t">Check the system before using convolution</span>Convolution gives the system output only when the system is linear and time invariant. The derivation uses time invariance to shift $h$ and linearity to scale and add the responses. If either property fails, the convolution result is not the output of that system.'},

{t:'h2', num:'3.3', text:'How to compute a convolution'},
{t:'ol', items:[
 '<b>Flip.</b> Reverse $h[k]$ to get $h[-k]$.',
 '<b>Shift.</b> Move it by $n$ to get $h[n-k]$.',
 '<b>Multiply and add.</b> Form $x[k]h[n-k]$ and sum over $k$.',
 'Repeat for every $n$.'
]},
{t:'p', text:'Construct $h[n-k]$ in a fixed order. Treat $k$ as the variable, shift $h[k]$ by $n$, and then reverse it in $k$. This is the shift-then-scale procedure from Chapter 1.'},
{t:'box', kind:'err', html:'<span class="t">Do not omit the reversal</span>Using an unreversed $h$ gives $\\sum_k x[k]h[k-n]$, which is the cross-correlation of $x$ and $h$, not their convolution. A symmetric $h$ can hide this error because reversal does not change it. Use an asymmetric example to check the construction.'},
{t:'figrow', n:3, items:[
 {svg:()=>{const h=k=>(k>=0&&k<=2)?[1,0.6,0.3][k]:0;
   const a=ax({xr:[-5,7],yr:[-0.2,1.25],xlabel:'k',w:230,h:120,pad:{l:32,r:12,t:12,b:24},xtarget:3,ytarget:2});
   a.stem(D(h,-5,7),{color:C.h,r:2.4,width:1.4}); return a.svg();}, cap:'$h[k]$'},
 {svg:()=>{const h=k=>(k>=0&&k<=2)?[1,0.6,0.3][k]:0;
   const a=ax({xr:[-5,7],yr:[-0.2,1.25],xlabel:'k',w:230,h:120,pad:{l:32,r:12,t:12,b:24},xtarget:3,ytarget:2});
   a.stem(D(k=>h(-k),-5,7),{color:C.mid,r:2.4,width:1.4}); return a.svg();}, cap:'$h[-k]$: flip'},
 {svg:()=>{const h=k=>(k>=0&&k<=2)?[1,0.6,0.3][k]:0;
   const a=ax({xr:[-5,7],yr:[-0.2,1.25],xlabel:'k',w:230,h:120,pad:{l:32,r:12,t:12,b:24},xtarget:3,ytarget:2});
   a.stem(D(k=>h(3-k),-5,7),{color:C.out,r:2.4,width:1.4}); a.vline(3,{color:C.err}); return a.svg();},
  cap:'$h[n-k]$ at $n=3$: shift'}
]},

{t:'ex', hd:'Example 3.1', rows:[
 ['Given','$x[n]=\\{1,2,1,2\\}$ for $n=0,1,2,3$, and $h[n]=\\{1,1\\}$ for $n=0,1$. Both zero elsewhere.'],
 ['Find','$y[n]=x[n]*h[n]$.'],
 ['Method','Because $x$ has four non-zero samples, expand the convolution sum into four terms. Each term is a shifted copy of $h$ weighted by the corresponding sample of $x$.'],
 ['Solution','$$y[n]=x[0]h[n]+x[1]h[n-1]+x[2]h[n-2]+x[3]h[n-3]=h[n]+2h[n-1]+h[n-2]+2h[n-3]$$ Add these four copies at each value of $n$. This gives $y=\\{1,3,3,3,2\\}$ on $n=0,\\dots,4$.'],
 ['Check','The support must contain $4+2-1=5$ samples and run from $0$ to $4$, which the result does. The total must satisfy $\\sum_n y[n]=\\bigl(\\sum_n x[n]\\bigr)\\bigl(\\sum_n h[n]\\bigr)$, and $12=6\\times2$. Also, $h=\\{1,1\\}$ forms a two-point moving sum, so each output is the sum of two adjacent input samples. This gives the same values.']
]},
{t:'figrow', items:[
 {svg:()=>{const a=ax({xr:[-1,6],yr:[-0.3,2.4],xlabel:'n',w:340,h:130,pad:{l:36,r:14,t:12,b:26},xtarget:4,ytarget:2});
   a.stem(D(n=>(n>=0&&n<=3)?[1,2,1,2][n]:0,-1,6),{color:C.in,r:2.6}); return a.svg();}, cap:'$x[n]$'},
 {svg:()=>{const a=ax({xr:[-1,6],yr:[-0.3,3.7],xlabel:'n',w:340,h:130,pad:{l:36,r:14,t:12,b:26},xtarget:4,ytarget:3});
   a.stem(D(n=>(n>=0&&n<=4)?[1,3,3,3,2][n]:0,-1,6),{color:C.out,r:2.6}); return a.svg();}, cap:'$y[n]=x[n]*h[n]$'}
]},

{t:'ex', hd:'Example 3.2', rows:[
 ['Given','$x[n]=\\left(\\tfrac12\\right)^{n}u[n]$ and $h[n]=u[n]$.'],
 ['Find','$y[n]=x[n]*h[n]$.'],
 ['Method','Use the support of $h[n-k]$ to set the summation limits: it equals 1 exactly when $k\\le n$. The overlap changes when $n$ changes sign, so treat $n<0$ and $n\\ge0$ separately.'],
 ['Solution','<b>Case 1, $n<0$.</b> The supports do not overlap: $x[k]$ needs $k\\ge0$ and $h[n-k]$ needs $k\\le n<0$. So $y[n]=0$.<br><b>Case 2, $n\\ge0$.</b> The overlap is $0\\le k\\le n$, so $$y[n]=\\sum_{k=0}^{n}\\left(\\tfrac12\\right)^{k}=\\frac{1-\\left(\\tfrac12\\right)^{n+1}}{1-\\tfrac12}=2-\\left(\\tfrac12\\right)^{n}.$$ Together, $y[n]=\\left(2-\\left(\\tfrac12\\right)^{n}\\right)u[n]$.'],
 ['Check','At $n=0$, the formula gives $y[0]=1$, and direct substitution gives $x[0]h[0]=1$. As $n\\to\\infty$, $y[n]\\to2$, which equals the total sum of the input. This agrees with the interpretation of $h[n]=u[n]$ as an accumulator.']
]},
{t:'box', html:'<span class="t">Geometric sum</span>$\\displaystyle\\sum_{k=m}^{n}a\\,r^{k}=\\frac{a\\bigl(r^{m}-r^{n+1}\\bigr)}{1-r}$. The finite sum needs only $r\\neq1$. The condition $|r|<1$ is needed only when the sum runs to infinity.'},

{t:'h2', num:'3.4', text:'The convolution integral'},
{t:'p', text:'The continuous-time derivation has the same purpose and uses the same three LTI moves. First, the sifting property represents $x$ as continuously indexed weighted impulses:'},
{t:'eq', tex:'x(t)=\\int_{-\\infty}^{\\infty}x(\\tau)\\,\\delta(t-\\tau)\\,\\d\\tau,'},
{t:'p', text:'The equality uses $\\delta(t)=\\delta(-t)$. Now apply time invariance, homogeneity, and additivity to obtain:'},
{t:'eqbox', cap:'Convolution integral', big:true,
 tex:['y(t)=\\int_{-\\infty}^{\\infty}x(\\tau)\\,h(t-\\tau)\\,\\d\\tau\\;=\\;x(t)*h(t)',
      'y(t)=\\int_{-\\infty}^{\\infty}h(\\tau)\\,x(t-\\tau)\\,\\d\\tau'],
 after:'The two forms are equal. Choose the form that makes the support conditions easier to write.'},
{t:'box', kind:'warn', html:'<span class="t">Build the reversed and shifted response explicitly</span>Use $\\tau$ as the variable and apply the shift before the reversal. For $\\delta(-t+5)$, first form $v(t)=\\delta(t+5)$ and then form $y(t)=v(-t)=\\delta(-t+5)$. The result is an impulse at $t=+5$. Writing both moves prevents a sign error in the integration limits.'},

{t:'ex', hd:'Example 3.3', rows:[
 ['Given','$x(t)=e^{2t}u(-t)$ and $h(t)=u(t-3)$.'],
 ['Find','$y(t)=x(t)*h(t)$.'],
 ['Method','Use the two support conditions to set the integration limit. $x(\\tau)$ is non-zero for $\\tau\\le0$, and $h(t-\\tau)=u(t-\\tau-3)$ is non-zero for $\\tau\\le t-3$. The overlap ends at $\\min(0,\\,t-3)$, so the active upper limit changes at $t=3$.'],
 ['Solution','<b>Case 1, $t<3$.</b> The binding limit is $t-3$: $$y(t)=\\int_{-\\infty}^{t-3}e^{2\\tau}\\,\\d\\tau=\\tfrac12 e^{2(t-3)}.$$ <b>Case 2, $t>3$.</b> The binding limit is 0, so the whole of $x$ is covered: $$y(t)=\\int_{-\\infty}^{0}e^{2\\tau}\\,\\d\\tau=\\tfrac12.$$'],
 ['Check','Both branches give $0.5$ at $t=3$, so they join continuously. Also, $y(\\infty)$ equals the total area of $x$, which is $1/2$. This agrees with the system interpretation: the delayed step makes the output the area of $x$ collected up to three seconds earlier.']
]},
{t:'figrow', items:[
 {svg:()=>{const a=ax({xr:[-6,8],yr:[-0.1,1.2],xlabel:'\\tau',w:340,h:130,pad:{l:36,r:14,t:12,b:26},xtarget:4,ytarget:2});
   const t=1.2; a.area(x=>x<=Math.min(0,t-3)?Math.exp(2*x):0,-6,Math.min(0,t-3),{color:'rgba(20,112,127,.2)'});
   a.curve(x=>x<=0?Math.exp(2*x):0,{color:C.in}); a.curve(x=>x<=t-3?1:0,{color:C.h});
   a.vline(t-3,{color:C.err}); return a.svg();}, cap:'Case 1: $t<3$. The shaded area is $y(t)$.'},
 {svg:()=>{const a=ax({xr:[-1,7],yr:[-0.05,0.62],xlabel:'t',w:340,h:130,pad:{l:40,r:14,t:12,b:26},xtarget:4,ytarget:3});
   a.curve(t=>t<3?0.5*Math.exp(2*(t-3)):0.5,{color:C.out}); a.point(3,0.5,{color:C.err}); return a.svg();},
  cap:'The result $y(t)$, continuous at $t=3$.'}
]},

{t:'ex', hd:'Example 3.4', rows:[
 ['Given','$x(t)=1$ on $0<t<1$ and zero elsewhere. $h(t)=t$ on $0<t<2$ and zero elsewhere.'],
 ['Find','$y(t)=x(t)*h(t)$.'],
 ['Method','Use $y(t)=\\int h(\\tau)x(t-\\tau)\\,\\d\\tau$. This form reverses the rectangle, whose constant height makes the overlap limits easy to identify. Its support becomes $[t-1,\\,t]$, a window of width 1 moving across the ramp on $[0,2]$.'],
 ['Solution','The moving window has edges $t-1$ and $t$, and the fixed ramp has edges $0$ and $2$. Set each moving edge equal to each fixed edge. This gives $t=0,1,2,3$, which divides the calculation into five cases.<br><br>$t<0$: there is no overlap, so $y=0$.<br>$0<t<1$: the overlap is $0<\\tau<t$, so $y=\\int_{0}^{t}\\tau\\,\\d\\tau=\\tfrac12 t^{2}$.<br>$1<t<2$: the overlap is $t-1<\\tau<t$, so $y=\\int_{t-1}^{t}\\tau\\,\\d\\tau=t-\\tfrac12$.<br>$2<t<3$: the overlap is $t-1<\\tau<2$, so $y=\\int_{t-1}^{2}\\tau\\,\\d\\tau=-\\tfrac12 t^{2}+t+\\tfrac32$.<br>$t>3$: there is no overlap, so $y=0$.'],
 ['Check','Three checks. <b>Continuity:</b> at $t=1$ both branches give $0.5$; at $t=2$ both give $1.5$; at $t=3$ both give 0. <b>Support:</b> $[0,1]$ and $[0,2]$ give $[0,3]$, because supports add. <b>Area:</b> $\\int y=\\bigl(\\int x\\bigr)\\bigl(\\int h\\bigr)=1\\times2=2$, and $\\tfrac16+1+\\tfrac56=2$.']
]},
{t:'box', kind:'ok', html:'<span class="t">Find the boundaries before integrating</span>List the moving edges and the fixed edges, then set each moving edge equal to each fixed edge. The resulting values divide the calculation into all required cases.'},
{t:'figrow', n:3, items:[
 [0.6,'0<t<1'],[1.5,'1<t<2'],[2.5,'2<t<3']
].map(([tv,lab])=>({svg:()=>{
   const a=ax({xr:[-1.2,3.6],yr:[-0.15,2.3],xlabel:'\\tau',w:230,h:125,pad:{l:32,r:12,t:12,b:24},xtarget:3,ytarget:2});
   const lo=Math.max(0,tv-1), hi=Math.min(2,tv);
   if(hi>lo) a.area(x=>x,lo,hi,{color:'rgba(169,80,47,.2)'});
   a.curve(x=>(x>0&&x<2)?x:0,{color:C.h}); a.curve(x=>(x>tv-1&&x<tv)?1:0,{color:C.in});
   return a.svg();}, cap:lab})) },
{t:'fig', svg:()=>{const a=ax({xr:[-0.5,3.5],yr:[-0.12,1.75],xlabel:'t',w:700,h:170,xtarget:5,ytarget:3});
  a.curve(t=> t<0?0 : t<1?0.5*t*t : t<2?t-0.5 : t<3?(-0.5*t*t+t+1.5) : 0,{color:C.out,n:1400});
  [1,2,3].forEach(b=>a.vline(b,{color:C.muted,opacity:.5})); a.point(2,1.5,{color:C.err}); return a.svg();},
 cap:'The complete result. The peak is $1.5$ at $t=2$. A unit-width rectangle acts as a one-second moving sum, so the output rises while the window fills, grows linearly while it is full, and falls as it leaves the ramp.'},

{t:'h2', num:'3.5', text:'Properties of convolution'},
{t:'table', head:['Property','Statement','What it means for interconnections'], rows:[
 ['Commutative','$x*h=h*x$','Input and impulse response play symmetric roles in the algebra.'],
 ['Distributive','$x*(h_1+h_2)=x*h_1+x*h_2$','Two systems in <b>parallel</b>, outputs added, equal one system with impulse response $h_1+h_2$.'],
 ['Associative','$x*(h_1*h_2)=(x*h_1)*h_2$','Two systems in <b>cascade</b> equal one system with impulse response $h_1*h_2$.']
]},
{t:'p', text:'Associativity and commutativity show that the order of cascaded LTI systems does not change their combined impulse response. This conclusion requires both systems to be linear and time invariant. For example, a saturating amplifier followed by a filter is not generally equivalent to the filter followed by the amplifier.'},

{t:'h2', num:'3.6', text:'System properties in terms of $h$'},
{t:'p', text:'For an LTI system, each property test from Chapter 2 can be applied directly to the impulse response $h$.'},
{t:'table', head:['Property','Criterion','Reason'], rows:[
 ['Memoryless','$h(t)=a\\,\\delta(t)$, or $h[n]=a\\,\\delta[n]$','Then $y[n]=a\\sum_k x[k]\\delta[n-k]=a\\,x[n]$, a pure gain.'],
 ['Invertible','$h*g=\\delta$ for some $g$','$g$ is the impulse response of the inverse system, and $\\delta$ is the identity system.'],
 ['Causal','$h(t)=0$ for $t<0$, or $h[n]=0$ for $n<0$','The sum collapses to $y[n]=h[0]x[n]+h[1]x[n-1]+\\cdots$, which uses only present and past inputs.'],
 ['BIBO stable','$\\sum_k|h[k]|<\\infty$, or $\\int|h(t)|\\,\\d t<\\infty$','See the proof below.']
]},
{t:'p', text:'To show why absolute summability is sufficient for stability, assume $|x[n]|\\le B$ for all $n$. Then apply the triangle inequality:'},
{t:'eq', tex:'\\bigl|y[n]\\bigr|=\\left|\\sum_{k}h[k]x[n-k]\\right|\\;\\le\\;\\sum_{k}\\bigl|h[k]\\bigr|\\,\\bigl|x[n-k]\\bigr|\\;\\le\\;B\\sum_{k}\\bigl|h[k]\\bigr|<\\infty.'},
{t:'p', text:'This proves sufficiency: an absolutely summable $h[n]$ maps every bounded input to a bounded output. Necessity follows by choosing the bounded input $x[n]=\\operatorname{sgn}h[-n]$, which gives $y[0]=\\sum_k|h[k]|$.'},
{t:'figrow', items:[
 {svg:()=>{const a=ax({xr:[-2,10],yr:[-0.2,1.2],xlabel:'n',w:340,h:125,pad:{l:36,r:14,t:12,b:26},xtarget:4,ytarget:2});
   a.stem(D(n=>n>=0?Math.pow(0.7,n):0,-2,10),{color:C.out,r:2.4}); return a.svg();},
  cap:'$h[n]=0.7^{\\,n}u[n]$. Here $\\sum|h|=1/0.3<\\infty$: stable and causal.'},
 {svg:()=>{const a=ax({xr:[-2,10],yr:[-0.2,1.2],xlabel:'n',w:340,h:125,pad:{l:36,r:14,t:12,b:26},xtarget:4,ytarget:2});
   a.stem(D(n=>n>=0?1:0,-2,10),{color:C.err,r:2.4}); return a.svg();},
  cap:'$h[n]=u[n]$, the accumulator. Here $\\sum|h|\\to\\infty$: causal but not stable.'}
]},

{t:'h2', num:'3.7', text:'A convolution checklist'},
{t:'ol', items:[
 'Confirm that the system is linear and time invariant. Convolution gives the system output only under this condition.',
 'Choose the factor whose reversal gives simpler support conditions.',
 'Write the support of each factor as an inequality in the dummy variable.',
 'Set the moving edges equal to the fixed edges to list every case boundary, before integrating anything.',
 'Integrate or sum, case by case.',
 'Check continuity at every boundary, check that the supports add, and check that the total area or total sum multiplies.'
]},
{t:'box', kind:'ok', html:'<span class="t">Use each final check for a specific purpose</span>A mismatch at a case boundary indicates an incorrect limit. An incorrect output support indicates an error in a shift, reversal, or support condition. An incorrect total area or sum indicates an error in the integrand or summand.'},

{t:'h3', text:'Exercises'},
{t:'q', n:'3.1', text:'Compute $\\{1,2,3\\}*\\{1,-1\\}$ with both sequences starting at $n=0$, and check your answer with the sum rule.', ans:'$\\{1,1,1,-3\\}$; the sums are $6\\times0=0$.'},
{t:'q', n:'3.2', text:'Let $h[n]=\\left(\\tfrac13\\right)^{n}u[n]$. Is the system stable? Is it causal? Is it memoryless?', ans:'Stable ($\\sum|h|=3/2$), causal, not memoryless.'},
{t:'q', n:'3.3', text:'Find $y(t)=u(t)*u(t)$ and sketch it.', ans:'$y(t)=t\\,u(t)$.'},
{t:'q', n:'3.4', text:'Two systems with $h_1[n]=\\delta[n]-\\delta[n-1]$ and $h_2[n]=u[n]$ are cascaded. Find the impulse response of the cascade and identify the resulting system.', ans:'$\\delta[n]$: the two systems are inverses.'},
{t:'q', n:'3.5', text:'$x(t)=1$ on $0<t<3$ and $h(t)=t$ on $0<t<2$. List the case boundaries before computing anything, then find $y(t)$.', ans:'Boundaries at $t=0,2,3,5$; four cases.'},

{t:'page'}
];
})();
