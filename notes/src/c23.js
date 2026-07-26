/* Course notes — Chapters 2 and 3, and Appendix A */
(function(){
const P=PLOT, C=P.COL;
const D=(f,a,b)=>{const o=[];for(let n=Math.ceil(a);n<=b;n++)o.push([n,f(n)]);return o;};
const ax=o=>P.Axes(Object.assign({w:700,h:200,pad:{l:44,r:20,t:16,b:30},xtarget:8,ytarget:3},o));

window.C23 = [
{t:'page'},

/* ================= CHAPTER 2 ================= */
{t:'h1', num:'CHAPTER 2', text:'Systems and their properties'},
{t:'p', lead:true, text:'A system is judged by what it does to signals, not by what it is made of. Six properties decide almost everything that follows, and two of them are the whole of Chapter 3.'},

{t:'h2', num:'2.1', text:'What a system is'},
{t:'p', text:'A system is a rule that turns an input signal into an output signal. The rule is deterministic: the same input, applied twice, must give the same output. Without that, none of the tests below would even make sense.'},
{t:'p', text:'Write it as an operator, $y=S\\{x\\}$. The argument is a whole function, not a number. That is why questions about memory, causality and time shifts can be asked at all.'},
{t:'fig', svg:()=>P.blocks({w:700,h:190,items:[
  {t:'arrow',x1:60,y1:60,x2:230,y2:60},{t:'box',x:230,y:34,w:170,h:52,label:'continuous-time system',fs:13},
  {t:'arrow',x1:400,y1:60,x2:570,y2:60},
  {t:'text',x:140,y:48,label:'x(t)',tex:true,fs:15},{t:'text',x:490,y:48,label:'y(t)',tex:true,fs:15},
  {t:'arrow',x1:60,y1:140,x2:230,y2:140},{t:'box',x:230,y:114,w:170,h:52,label:'discrete-time system',fs:13},
  {t:'arrow',x1:400,y1:140,x2:570,y2:140},
  {t:'text',x:140,y:128,label:'x[n]',tex:true,fs:15},{t:'text',x:490,y:128,label:'y[n]',tex:true,fs:15}
]}), cap:'The same picture in both domains. An amplifier, a numerical filter and a pencil-and-paper integrator can all be the same system.'},

{t:'h2', num:'2.2', text:'Memory'},
{t:'box', html:'<span class="t">Criterion</span>A system is <b>memoryless</b> if the output at time $t$ (or $n$) depends only on the input at that same time.'},
{t:'table', head:['System','Verdict','Reason'], rows:[
 ['$y(t)=\\bigl[2x(t)-x^{2}(t)\\bigr]^{2}$','memoryless','Only $x(t)$ appears. There is no $x(t+1)$ or $x(t-2)$ term.'],
 ['$y[n]=x[n]$','memoryless','The identity system.'],
 ['$y[n]=x[n-1]$','has memory','The output at $n$ uses the sample at $n-1$.'],
 ['$y[n]=x[n]+y[n-1]$','has memory','See the derivation below.']
]},
{t:'p', text:'The last one is worth doing carefully, because the memory is hidden in the feedback. Substitute repeatedly:'},
{t:'eq', tex:'y[n-1]=x[n-1]+y[n-2],\\qquad y[n-2]=x[n-2]+y[n-3],\\qquad\\dots'},
{t:'eq', tex:'\\Longrightarrow\\quad y[n]=x[n]+x[n-1]+x[n-2]+\\cdots=\\sum_{k=0}^{\\infty}x[n-k].'},
{t:'p', text:'The output depends on the whole past of the input. Feedback on the output is memory just as surely as an explicit delay on the input.'},
{t:'box', kind:'ok', html:'<span class="t">Circuit reading</span>A resistor, $v(t)=R\\,i(t)$, is memoryless. A capacitor, $v(t)=\\frac{1}{C}\\int_{-\\infty}^{t}i(\\tau)\\,\\d\\tau$, is not. Memory is stored energy.'},

{t:'h2', num:'2.3', text:'Invertibility'},
{t:'box', html:'<span class="t">Criterion</span>A system is <b>invertible</b> if distinct inputs always produce distinct outputs. The map must be one-to-one.'},
{t:'p', text:'There are two ways to settle it, and they cost very different amounts of work. To prove invertibility, find an inversion formula that works for every input. To disprove it, find one pair of inputs that collide.'},
{t:'ex', hd:'Example 2.1', rows:[
 ['Given','$y(t)=\\bigl[\\cos(t)+2\\bigr]x(t)$.'],
 ['Find','Is the system invertible?'],
 ['Solution','Yes. The gain satisfies $1\\le\\cos(t)+2\\le3$, so it never vanishes and $$x(t)=\\frac{y(t)}{\\cos(t)+2}.$$'],
 ['Check','Substituting back gives $\\bigl[\\cos t+2\\bigr]\\dfrac{y(t)}{\\cos t+2}=y(t)$. Had the gain been $\\cos(t)$ alone, the system would fail at every zero of the cosine.']
]},
{t:'ex', hd:'Example 2.2', rows:[
 ['Given','$y(t)=x^{2}(t)$.'],
 ['Find','Is the system invertible?'],
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
{t:'p', text:'A system that must run in real time has to be causal, because the future has not happened yet. Non-causal systems are perfectly useful whenever the whole record already exists, as in offline audio or image processing.'},

{t:'h2', num:'2.5', text:'Stability'},
{t:'p', text:'A signal is <b>bounded</b> if there is a constant $B<\\infty$ with $|x(t)|<B$ for all $t$.'},
{t:'box', html:'<span class="t">Criterion</span>A system is <b>BIBO stable</b> if every bounded input produces a bounded output. Bounded Input, Bounded Output.'},
{t:'box', kind:'warn', html:'<span class="t">The two directions cost differently</span>To prove stability you must bound the output for <b>every</b> bounded input. To disprove it you need <b>one</b> bounded input whose output is unbounded. Testing a single well-behaved input and concluding "stable" proves nothing.'},
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
 ['Solution','Path 1: with $x_2(t)=x_1(t-t_0)$ we get $y_2(t)=\\sin\\bigl(x_1(t-t_0)\\bigr)$.<br>Path 2: $y_1(t)=\\sin\\bigl(x_1(t)\\bigr)$, so $y_1(t-t_0)=\\sin\\bigl(x_1(t-t_0)\\bigr)$.<br>They agree for every $t_0$, so the system is time invariant.'],
 ['Check','The rule contains no explicit $t$. That is usually a reliable sign.']
]},
{t:'ex', hd:'Example 2.6', rows:[
 ['Given','$y[n]=n\\,x[n]$.'],
 ['Find','Is the system time invariant?'],
 ['Method','Look for a counterexample using an impulse.'],
 ['Solution','Take $x_1[n]=\\delta[n]$. Then $y_1[n]=n\\,\\delta[n]=0$ for every $n$.<br>Now delay by one: $x_2[n]=\\delta[n-1]$ gives $y_2[n]=n\\,\\delta[n-1]=\\delta[n-1]$, which equals 1 at $n=1$.<br>Time invariance would require $y_2[n]=y_1[n-1]=0$. It does not. The system is <b>not</b> time invariant.'],
 ['Check','One counterexample settles it. Note that the impulse is the cheapest test signal available, because it isolates a single index.']
]},
{t:'box', kind:'ok', html:'<span class="t">The pattern behind every failure</span>A system fails time invariance exactly when its rule contains the time variable explicitly: a coefficient $n$, a gain $\\cos(t)$, or a scaled argument $x(3t)$. If $t$ or $n$ appears anywhere outside the input, be suspicious at once.'},

{t:'h2', num:'2.7', text:'Linearity'},
{t:'eqbox', cap:'Criterion', tex:'a\\,x_1+b\\,x_2\\;\\longrightarrow\\;a\\,y_1+b\\,y_2\\qquad\\text{for all }a,b\\in\\mathbb{C}',
 after:'where $x_1\\to y_1$ and $x_2\\to y_2$. This is additivity and homogeneity in one statement.'},
{t:'ex', hd:'Example 2.7', rows:[
 ['Given','$y(t)=2\\pi\\,x(t)$.'],
 ['Find','Is the system linear?'],
 ['Solution','With $x_3=ax_1+bx_2$: $$y_3=2\\pi(ax_1+bx_2)=a\\underbrace{2\\pi x_1}_{y_1}+b\\underbrace{2\\pi x_2}_{y_2}=ay_1+by_2.$$ The system is linear. It is also time invariant, so it is the simplest possible LTI system.']
]},
{t:'ex', hd:'Example 2.8', rows:[
 ['Given','$y[n]=\\bigl(x[2n]\\bigr)^{2}$.'],
 ['Find','Is the system linear?'],
 ['Solution','With $x_3[n]=ax_1[n]+bx_2[n]$: $$y_3[n]=\\bigl(ax_1[2n]+bx_2[2n]\\bigr)^{2}=a^{2}x_1^{2}[2n]+2ab\\,x_1[2n]x_2[2n]+b^{2}x_2^{2}[2n],$$ while $ay_1[n]+by_2[n]=a\\,x_1^{2}[2n]+b\\,x_2^{2}[2n]$. The powers of $a$ and $b$ differ and a cross term appears, so the system is <b>not</b> linear.'],
 ['Check','A quicker route: scaling the input by $a$ scales this output by $a^{2}$. Homogeneity alone already fails.']
]},
{t:'box', kind:'err', html:'<span class="t">Linear does not mean straight line</span>$y(t)=x(t)+5$ is not linear, because the zero input does not give the zero output. Any linear system must satisfy $S\\{0\\}=0$. That is a five-second first test.'},

{t:'h2', num:'2.8', text:'How to classify an unfamiliar system'},
{t:'ol', items:[
 '<b>Look for an explicit $t$ or $n$.</b> A coefficient like $n$, a gain like $\\cos t$, or a scaled argument like $x(3t)$ makes time invariance the first thing to test, and usually the first thing to fail.',
 '<b>Look for nonlinearity.</b> Squares, products of the input with itself, $\\sin(x)$, absolute values, saturation. Test homogeneity with a single scalar; it is the cheapest disproof available.',
 '<b>Read the arguments.</b> Anything other than $x$ evaluated exactly at $t$ or $n$ breaks memorylessness. Future arguments break causality.',
 '<b>Try to bound the output.</b> Assume $|x|\\le B$ and look for a finite bound. If the attempt fails, the failure usually shows you the counterexample.',
 '<b>Leave invertibility to last.</b> It is needed least often and argued badly most often.'
]},
{t:'box', kind:'ok', html:'<span class="t">The only free implication</span><b>Memoryless implies causal.</b> Everything else must be established on its own. In particular, causal does not imply stable, linear does not imply time invariant, and stable does not imply memoryless.'},
{t:'table', head:['System','Memoryless','Invertible','Causal','Stable','Time inv.','Linear'], rows:[
 ['$y(t)=2\\pi x(t)$','yes','yes','yes','yes','yes','yes'],
 ['$y[n]=x[n-1]$','no','yes','yes','yes','yes','yes'],
 ['$y(t)=x^{2}(t)$','yes','no','yes','yes','yes','no'],
 ['$y[n]=n\\,x[n]$','yes','no','yes','no','no','yes'],
 ['$y[n]=\\sum_{k\\le n}x[k]$','no','yes','yes','no','yes','yes'],
 ['$y[n]=x[-n]$','no','yes','no','yes','no','yes'],
 ['$y[n]=(x[2n])^{2}$','no','no','no','yes','no','no']
]},
{t:'p', text:'Read this table down the columns, not across the rows. No column is determined by another, which is why six separate tests are needed.'},

{t:'h3', text:'Exercises'},
{t:'q', n:'2.1', text:'Classify $y(t)=x(t)\\,u(t)$ against all six properties.', ans:'Memoryless, not invertible, causal, stable, not time invariant, linear.'},
{t:'q', n:'2.2', text:'Show that $y[n]=x[n]-x[n-1]$ is invertible on inputs that are zero for $n<0$, and give the inverse.', ans:'$x[n]=\\sum_{k=0}^{n}y[k]$.'},
{t:'q', n:'2.3', text:'Give a system that is linear and causal but not stable, and one that is stable and time invariant but not linear.'},
{t:'q', n:'2.4', text:'Is $y(t)=x(t/2)$ time invariant? Prove or give a counterexample.', ans:'No. Path 1 gives $x(t/2-t_0)$ and path 2 gives $x((t-t_0)/2)$.'},

{t:'page'},

/* ================= CHAPTER 3 ================= */
{t:'h1', num:'CHAPTER 3', text:'Linear time-invariant systems'},
{t:'p', lead:true, text:'Impose linearity and time invariance together, and a whole system is described by its response to a single impulse. This chapter derives that result and shows how to use it.'},

{t:'h2', num:'3.1', text:'The impulse response'},
{t:'box', html:'<span class="t">Definition</span>The <b>impulse response</b> is the output when the input is a unit impulse: $x[n]=\\delta[n]$ gives $y[n]=h[n]$. In continuous time, $x(t)=\\delta(t)$ gives $y(t)=h(t)$.'},
{t:'p', text:'For a general system this is one measurement among infinitely many. Knowing the response to $\\delta[n]$ says nothing about the response to anything else.'},
{t:'p', text:'For a linear time-invariant system it is everything. Time invariance turns one impulse response into a response for every shift. Linearity turns those into a response for every weighted sum. And Chapter 1 showed that every signal <b>is</b> a weighted sum of shifted impulses. Those three facts close the loop.'},
{t:'fig', svg:()=>P.blocks({w:700,h:110,items:[
  {t:'arrow',x1:80,y1:56,x2:260,y2:56},{t:'box',x:260,y:32,w:150,h:48,label:'S',tex:true,fs:16},
  {t:'arrow',x1:410,y1:56,x2:600,y2:56},
  {t:'text',x:170,y:44,label:'\\delta[n]',tex:true,fs:15,color:'#14707F'},
  {t:'text',x:505,y:44,label:'h[n]',tex:true,fs:15,color:'#A9741C'}
]}), cap:'One experiment defines the whole system, provided the system is linear and time invariant.'},

{t:'h2', num:'3.2', text:'Deriving the convolution sum'},
{t:'p', text:'Start from the representation property of Chapter 1 and push it through the system.'},
{t:'eq', tex:'x[n]=\\sum_{k=-\\infty}^{\\infty}x[k]\\,\\delta[n-k]\\quad\\longrightarrow\\quad S\\quad\\longrightarrow\\quad y[n]=\\;?'},
{t:'ol', items:[
 '<b>Time invariance.</b> Since $\\delta[n]\\to h[n]$, we also have $\\delta[n-k]\\to h[n-k]$.',
 '<b>Homogeneity.</b> The number $x[k]$ does not depend on $n$, so $x[k]\\delta[n-k]\\to x[k]h[n-k]$.',
 '<b>Additivity.</b> The response to the sum is the sum of the responses.'
]},
{t:'eqbox', cap:'Convolution sum', big:true, tex:'y[n]=\\sum_{k=-\\infty}^{\\infty}x[k]\\,h[n-k]\\;=\\;x[n]*h[n]'},
{t:'p', text:'Substituting $m=n-k$ gives an equivalent form, which is already the statement that convolution is commutative:'},
{t:'eq', tex:'\\sum_{k=-\\infty}^{\\infty}x[k]h[n-k]=\\sum_{m=-\\infty}^{\\infty}x[n-m]h[m].'},
{t:'box', kind:'err', html:'<span class="t">The precondition is not optional</span>Convolution applies only when the system is linear and time invariant. The derivation used time invariance once and linearity twice. Remove either property and no step survives. Applying convolution anyway produces a confident number that means nothing.'},

{t:'h2', num:'3.3', text:'How to compute a convolution'},
{t:'ol', items:[
 '<b>Flip.</b> Reverse $h[k]$ to get $h[-k]$.',
 '<b>Shift.</b> Move it by $n$ to get $h[n-k]$.',
 '<b>Multiply and add.</b> Form $x[k]h[n-k]$ and sum over $k$.',
 'Repeat for every $n$.'
]},
{t:'p', text:'Build $h[n-k]$ the same way you built $x(at-b)$ in Chapter 1. Treat $k$ as the variable: shift $h[k]$ by $n$, then reverse in $k$.'},
{t:'box', kind:'err', html:'<span class="t">What happens if you skip the flip</span>Sliding an unflipped $h$ computes $\\sum_k x[k]h[k-n]$, which is the cross-correlation of $x$ and $h$, not the convolution. When $h$ is symmetric the two agree, which is why this mistake often survives until an asymmetric $h$ appears in an exam.'},
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
 ['Method','Expand the sum over the four non-zero samples of $x$ and add the shifted copies of $h$.'],
 ['Solution','$$y[n]=x[0]h[n]+x[1]h[n-1]+x[2]h[n-2]+x[3]h[n-3]=h[n]+2h[n-1]+h[n-2]+2h[n-3]$$ Adding the four copies sample by sample gives $y=\\{1,3,3,3,2\\}$ on $n=0,\\dots,4$.'],
 ['Check','Two independent checks. <b>Length:</b> $4+2-1=5$ samples, and the support is $[0,4]$. <b>Sum:</b> $\\sum_n y[n]$ must equal $\\bigl(\\sum_n x[n]\\bigr)\\bigl(\\sum_n h[n]\\bigr)$, and $12=6\\times2$. Also note that $h=\\{1,1\\}$ is a two-point moving sum, so each output is the total of an adjacent input pair, which is what the numbers show.']
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
 ['Method','$h[n-k]$ equals 1 exactly when $k\\le n$. Split on the sign of $n$.'],
 ['Solution','<b>Case 1, $n<0$.</b> The supports do not overlap: $x[k]$ needs $k\\ge0$ and $h[n-k]$ needs $k\\le n<0$. So $y[n]=0$.<br><b>Case 2, $n\\ge0$.</b> The overlap is $0\\le k\\le n$, so $$y[n]=\\sum_{k=0}^{n}\\left(\\tfrac12\\right)^{k}=\\frac{1-\\left(\\tfrac12\\right)^{n+1}}{1-\\tfrac12}=2-\\left(\\tfrac12\\right)^{n}.$$ Together, $y[n]=\\left(2-\\left(\\tfrac12\\right)^{n}\\right)u[n]$.'],
 ['Check','$y[0]=1$, and directly $y[0]=x[0]h[0]=1$. As $n\\to\\infty$, $y[n]\\to2$, which is the total sum of the input. That is what an accumulator should do.']
]},
{t:'box', html:'<span class="t">Geometric sum</span>$\\displaystyle\\sum_{k=m}^{n}a\\,r^{k}=\\frac{a\\bigl(r^{m}-r^{n+1}\\bigr)}{1-r}$. The finite sum needs only $r\\neq1$. The condition $|r|<1$ is needed only when the sum runs to infinity.'},

{t:'h2', num:'3.4', text:'The convolution integral'},
{t:'p', text:'The continuous-time version follows the same three steps. Sifting gives the representation of $x$ as a continuum of weighted impulses,'},
{t:'eq', tex:'x(t)=\\int_{-\\infty}^{\\infty}x(\\tau)\\,\\delta(t-\\tau)\\,\\d\\tau,'},
{t:'p', text:'using $\\delta(t)=\\delta(-t)$. Pushing this through a linear time-invariant system gives:'},
{t:'eqbox', cap:'Convolution integral', big:true,
 tex:['y(t)=\\int_{-\\infty}^{\\infty}x(\\tau)\\,h(t-\\tau)\\,\\d\\tau\\;=\\;x(t)*h(t)',
      'y(t)=\\int_{-\\infty}^{\\infty}h(\\tau)\\,x(t-\\tau)\\,\\d\\tau'],
 after:'The two forms are equal. Flip whichever signal has the simpler shape.'},
{t:'box', kind:'warn', html:'<span class="t">Building the flipped, shifted h</span>Do it by shift, then scale, in the variable $\\tau$. For example, to plot $\\delta(-t+5)$: first $v(t)=\\delta(t+5)$, then $y(t)=v(-t)=\\delta(-t+5)$, an impulse at $t=+5$, not at $t=-5$. Sign errors here are the main source of wrong integration limits.'},

{t:'ex', hd:'Example 3.3', rows:[
 ['Given','$x(t)=e^{2t}u(-t)$ and $h(t)=u(t-3)$.'],
 ['Find','$y(t)=x(t)*h(t)$.'],
 ['Method','$x(\\tau)$ is non-zero for $\\tau\\le0$. And $h(t-\\tau)=u(t-\\tau-3)$ is non-zero for $\\tau\\le t-3$. So the overlap ends at $\\min(0,\\,t-3)$, and that is what creates two cases.'],
 ['Solution','<b>Case 1, $t<3$.</b> The binding limit is $t-3$: $$y(t)=\\int_{-\\infty}^{t-3}e^{2\\tau}\\,\\d\\tau=\\tfrac12 e^{2(t-3)}.$$ <b>Case 2, $t>3$.</b> The binding limit is 0, so the whole of $x$ is covered: $$y(t)=\\int_{-\\infty}^{0}e^{2\\tau}\\,\\d\\tau=\\tfrac12.$$'],
 ['Check','Both branches give $0.5$ at $t=3$, so $y$ is continuous. And $y(\\infty)$ equals the total area of $x$, which is $1/2$. The system is a delayed integrator: it collects the area of $x$ up to three seconds ago.']
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
 ['Method','Use $y(t)=\\int h(\\tau)x(t-\\tau)\\,\\d\\tau$ and flip the rectangle, which is the simpler shape. Its support becomes $[t-1,\\,t]$: a window of width 1 sliding across the ramp on $[0,2]$.'],
 ['Solution','The window edges are $t-1$ and $t$. The ramp edges are $0$ and $2$. Setting them equal gives $t=0,1,2,3$: four boundaries, so five cases.<br><br>$t<0$: no overlap, $y=0$.<br>$0<t<1$: $y=\\int_{0}^{t}\\tau\\,\\d\\tau=\\tfrac12 t^{2}$.<br>$1<t<2$: $y=\\int_{t-1}^{t}\\tau\\,\\d\\tau=t-\\tfrac12$.<br>$2<t<3$: $y=\\int_{t-1}^{2}\\tau\\,\\d\\tau=-\\tfrac12 t^{2}+t+\\tfrac32$.<br>$t>3$: no overlap, $y=0$.'],
 ['Check','Three checks. <b>Continuity:</b> at $t=1$ both branches give $0.5$; at $t=2$ both give $1.5$; at $t=3$ both give 0. <b>Support:</b> $[0,1]$ and $[0,2]$ give $[0,3]$, because supports add. <b>Area:</b> $\\int y=\\bigl(\\int x\\bigr)\\bigl(\\int h\\bigr)=1\\times2=2$, and $\\tfrac16+1+\\tfrac56=2$.']
]},
{t:'box', kind:'ok', html:'<span class="t">Find the boundaries before integrating</span>List the moving edges and the fixed edges, then set them equal. That produces the complete list of cases in one line, and no case can be lost by accident.'},
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
{t:'p', text:'Combining the last two with commutativity means the order of cascaded systems does not matter. That freedom is bought with linearity and time invariance, and it disappears the moment either is lost. A saturating amplifier followed by a filter is not the same system as the filter followed by the amplifier.'},

{t:'h2', num:'3.6', text:'System properties in terms of $h$'},
{t:'p', text:'Every test of Chapter 2 becomes a statement about the single function $h$.'},
{t:'table', head:['Property','Criterion','Reason'], rows:[
 ['Memoryless','$h(t)=a\\,\\delta(t)$, or $h[n]=a\\,\\delta[n]$','Then $y[n]=a\\sum_k x[k]\\delta[n-k]=a\\,x[n]$, a pure gain.'],
 ['Invertible','$h*g=\\delta$ for some $g$','$g$ is the impulse response of the inverse system, and $\\delta$ is the identity system.'],
 ['Causal','$h(t)=0$ for $t<0$, or $h[n]=0$ for $n<0$','The sum collapses to $y[n]=h[0]x[n]+h[1]x[n-1]+\\cdots$, which uses only present and past inputs.'],
 ['BIBO stable','$\\sum_k|h[k]|<\\infty$, or $\\int|h(t)|\\,\\d t<\\infty$','See the proof below.']
]},
{t:'p', text:'The stability condition is worth proving in one line. Assume $|x[n]|\\le B$ for all $n$. Then'},
{t:'eq', tex:'\\bigl|y[n]\\bigr|=\\left|\\sum_{k}h[k]x[n-k]\\right|\\;\\le\\;\\sum_{k}\\bigl|h[k]\\bigr|\\,\\bigl|x[n-k]\\bigr|\\;\\le\\;B\\sum_{k}\\bigl|h[k]\\bigr|<\\infty.'},
{t:'p', text:'This proves that absolute summability is <b>sufficient</b> for stability. It is also necessary; that direction is stated here without proof.'},
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
 'Confirm the system is linear and time invariant. Nothing below is valid otherwise.',
 'Choose which signal to flip. Pick the simpler one.',
 'Write the support of each factor as an inequality in the dummy variable.',
 'Set the moving edges equal to the fixed edges to list every case boundary, before integrating anything.',
 'Integrate or sum, case by case.',
 'Check continuity at every boundary, check that the supports add, and check that the total area or total sum multiplies.'
]},
{t:'box', kind:'ok', html:'<span class="t">What the three final checks catch</span>A discontinuity at a boundary means a limit is wrong. A support that is too wide or too narrow means a flip or a shift is wrong. A total area that does not multiply means an integrand is wrong.'},

{t:'h3', text:'Exercises'},
{t:'q', n:'3.1', text:'Compute $\\{1,2,3\\}*\\{1,-1\\}$ with both sequences starting at $n=0$, and check your answer with the sum rule.', ans:'$\\{1,1,1,-3\\}$; the sums are $6\\times0=0$.'},
{t:'q', n:'3.2', text:'Let $h[n]=\\left(\\tfrac13\\right)^{n}u[n]$. Is the system stable? Is it causal? Is it memoryless?', ans:'Stable ($\\sum|h|=3/2$), causal, not memoryless.'},
{t:'q', n:'3.3', text:'Find $y(t)=u(t)*u(t)$ and sketch it.', ans:'$y(t)=t\\,u(t)$.'},
{t:'q', n:'3.4', text:'Two systems with $h_1[n]=\\delta[n]-\\delta[n-1]$ and $h_2[n]=u[n]$ are cascaded. Find the impulse response of the cascade and identify the resulting system.', ans:'$\\delta[n]$: the two systems are inverses.'},
{t:'q', n:'3.5', text:'$x(t)=1$ on $0<t<3$ and $h(t)=t$ on $0<t<2$. List the case boundaries before computing anything, then find $y(t)$.', ans:'Boundaries at $t=0,2,3,5$; four cases.'},

{t:'page'},

/* ================= APPENDIX ================= */
{t:'h1', num:'APPENDIX A', text:'Summary of formulas'},
{t:'h2', num:'A.1', text:'Energy and power'},
{t:'table', head:['Quantity','Continuous time','Discrete time'], rows:[
 ['Total energy','$E_\\infty=\\int_{-\\infty}^{\\infty}|x(t)|^{2}\\d t$','$E_\\infty=\\sum_{n=-\\infty}^{\\infty}|x[n]|^{2}$'],
 ['Average power','$P_\\infty=\\lim\\limits_{T\\to\\infty}\\frac{1}{2T}\\int_{-T}^{T}|x(t)|^{2}\\d t$','$P_\\infty=\\lim\\limits_{N\\to\\infty}\\frac{1}{2N+1}\\sum_{n=-N}^{N}|x[n]|^{2}$'],
 ['Energy signal','$E_\\infty<\\infty$, $P_\\infty=0$','same'],
 ['Power signal','$E_\\infty\\to\\infty$, $0<P_\\infty<\\infty$','same']
]},
{t:'h2', num:'A.2', text:'Operations and periodicity'},
{t:'table', head:['Item','Statement'], rows:[
 ['Shift','$x(t-t_0)$: delay if $t_0>0$, advance if $t_0<0$'],
 ['Reversal','$x(-t)$, $x[-n]$'],
 ['Scaling','$y(t)=x(at)$: compressed if $a>1$, stretched if $0<a<1$; support divided by $a$'],
 ['Combination','$x(at-b)$: shift by $b$ first, then scale by $a$'],
 ['Periodicity','$x(t)=x(t+T)$; $x[n]=x[n+N]$ with $N$ an integer'],
 ['Fundamental frequency','$\\omega_0=2\\pi/T_0=2\\pi/N_0$'],
 ['Even and odd','$\\Ev\\{x\\}=\\tfrac12[x(t)+x(-t)]$, $\\Od\\{x\\}=\\tfrac12[x(t)-x(-t)]$']
]},
{t:'h2', num:'A.3', text:'Impulses and steps'},
{t:'table', head:['Item','Continuous time','Discrete time'], rows:[
 ['Step and impulse','$\\delta(t)=\\frac{\\d}{\\d t}u(t)$, $u(t)=\\int_{-\\infty}^{t}\\delta(\\tau)\\d\\tau$','$\\delta[n]=u[n]-u[n-1]$, $u[n]=\\sum_{k=0}^{\\infty}\\delta[n-k]$'],
 ['Sampling','$x(t)\\delta(t-t_0)=x(t_0)\\delta(t-t_0)$','$x[n]\\delta[n-n_0]=x[n_0]\\delta[n-n_0]$'],
 ['Sifting','$x(t_0)=\\int_{-\\infty}^{\\infty}x(t)\\delta(t-t_0)\\d t$','$x[n_0]=\\sum_{n}x[n]\\delta[n-n_0]$'],
 ['Representation','$x(t)=\\int x(\\tau)\\delta(t-\\tau)\\d\\tau$','$x[n]=\\sum_{k}x[k]\\delta[n-k]$']
]},
{t:'h2', num:'A.4', text:'Complex exponentials'},
{t:'table', head:['Item','Statement'], rows:[
 ['Continuous time','$x(t)=Ce^{at}$; with $C=Ae^{j\\theta}$ and $a=r+j\\omega_0$: $x(t)=Ae^{rt}e^{j(\\omega_0t+\\theta)}$'],
 ['Period','$T_0=2\\pi/\\omega_0$, always periodic for $\\omega_0\\neq0$'],
 ['Discrete time','$x[n]=C\\alpha^{n}$ with $\\alpha=e^{\\beta}$; growth boundary at $|\\alpha|=1$'],
 ['Period','$N=\\frac{2\\pi}{\\omega_0}k$; periodic only if $\\omega_0/2\\pi\\in\\mathbb{Q}$'],
 ['Frequency wrap-around','$e^{j(\\omega_0+2\\pi)n}=e^{j\\omega_0 n}$']
]},
{t:'h2', num:'A.5', text:'Systems and convolution'},
{t:'table', head:['Property','General criterion','LTI criterion in terms of $h$'], rows:[
 ['Memoryless','output at $t$ uses only input at $t$','$h(t)=a\\delta(t)$ or $h[n]=a\\delta[n]$'],
 ['Invertible','distinct inputs give distinct outputs','$h*g=\\delta$ for some $g$'],
 ['Causal','output uses only $\\tau\\le t$','$h(t)=0$ for $t<0$; $h[n]=0$ for $n<0$'],
 ['BIBO stable','bounded input gives bounded output','$\\int|h|\\,\\d t<\\infty$; $\\sum_k|h[k]|<\\infty$'],
 ['Time invariant','$x(t-t_0)\\to y(t-t_0)$','—'],
 ['Linear','$ax_1+bx_2\\to ay_1+by_2$','—']
]},
{t:'eqbox', cap:'Convolution',
 tex:['y[n]=\\sum_{k=-\\infty}^{\\infty}x[k]h[n-k]','y(t)=\\int_{-\\infty}^{\\infty}x(\\tau)h(t-\\tau)\\,\\d\\tau'],
 after:'Commutative, distributive and associative. Supports add. Total areas or total sums multiply.'},
{t:'h2', num:'A.6', text:'Symbols'},
{t:'table', head:['Symbol','Meaning'], rows:[
 ['$x(t)$, $x[n]$','input signal, continuous and discrete time'],
 ['$y(t)$, $y[n]$','output signal'],
 ['$h(t)$, $h[n]$','impulse response of a linear time-invariant system'],
 ['$\\delta(t)$, $\\delta[n]$','unit impulse'],
 ['$u(t)$, $u[n]$','unit step'],
 ['$E_\\infty$, $P_\\infty$','total energy and average power over all time'],
 ['$T_0$, $N_0$','fundamental period'],
 ['$\\omega_0$','fundamental angular frequency, rad/s or rad/sample'],
 ['$*$','convolution'],
 ['$j$','imaginary unit, $j^{2}=-1$']
]}
];
})();
