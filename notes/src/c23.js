/* Course notes — Chapters 2 and 3 */
(function(){
const P=PLOT, C=P.COL;
const D=(f,a,b)=>{const o=[];for(let n=Math.ceil(a);n<=b;n++)o.push([n,f(n)]);return o;};
const ax=o=>P.Axes(Object.assign({w:700,h:200,pad:{l:44,r:20,t:16,b:30},xtarget:8,ytarget:3,xnameDrop:44},o));
/* a small plot for a row of two or three figures */
const sm=o=>ax(Object.assign({w:340,h:150,pad:{l:40,r:14,t:12,b:26},xtarget:4,ytarget:2,xnameDrop:40},o));
/* a group drawn faint, for the part of a figure that is context only */
const faint=(a,f)=>{ a.raw('<g opacity=".3">'); f(); a.raw('</g>'); };
/* the blocks helper draws right-pointing arrows only; other arrowheads are added here */
const heads=(svg,ds)=>svg.replace(/<\/svg>\s*$/, ds.map(d=>`<path d="${d}" fill="${C.ink}"/>`).join('')+'</svg>');

window.C23 = [
{t:'page'},

/* ================= CHAPTER 2 ================= */
{t:'h1', num:'CHAPTER 2', text:'Systems and their properties'},
{t:'p', lead:true, text:'A system turns an input signal into an output signal. This chapter describes a system only through its input and its output. It gives tests for six properties: memory, invertibility, causality, stability, time invariance and linearity. For each property it shows how to prove it for every input, and how to disprove it with one counterexample.'},

{t:'h2', num:'2.1', text:'The input–output abstraction'},
{t:'p', text:'A system is a rule that turns an input signal into an output signal. The rule is deterministic: the same input always gives the same output.'},
{t:'p', text:'Write the rule as an operator, $y=S\\{x\\}$. The operator acts on the whole input signal, not on one value of it. So the output at one time may depend on input values at other times. This form lets us ask which input times affect an output, and how the system responds to a time shift.'},
{t:'fig', svg:()=>P.blocks({w:700,h:190,items:[
  {t:'arrow',x1:60,y1:60,x2:230,y2:60},{t:'box',x:230,y:34,w:170,h:52,label:'continuous-time system',fs:13},
  {t:'arrow',x1:400,y1:60,x2:570,y2:60},
  {t:'text',x:140,y:48,label:'x(t)',tex:true,fs:15},{t:'text',x:490,y:48,label:'y(t)',tex:true,fs:15},
  {t:'arrow',x1:60,y1:140,x2:230,y2:140},{t:'box',x:230,y:114,w:170,h:52,label:'discrete-time system',fs:13},
  {t:'arrow',x1:400,y1:140,x2:570,y2:140},
  {t:'text',x:140,y:128,label:'x[n]',tex:true,fs:15},{t:'text',x:490,y:128,label:'y[n]',tex:true,fs:15}
]}), cap:'The same operator description applies in continuous time and in discrete time.'},
{t:'box', html:'<span class="t">Equal systems</span>Two systems are equal when they give the same output for every input. How they are built does not matter. Let $S_1$ double its input with an amplifier, and let $S_2$ add its input to itself. Then $S_1\\{x\\}=2x$ and $S_2\\{x\\}=x+x=2x$ for every input $x$, so $S_1$ and $S_2$ are the same system.'},

{t:'h3', text:'One equation, many systems'},
{t:'p', text:'Different physical systems can share one input–output equation. Two examples show this.'},
{t:'p', text:'<b>An RC circuit.</b> A source voltage $v_s(t)$ drives a resistor $R$ in series with a capacitor $C$. The output is the capacitor voltage $v_C(t)$. Kirchhoff’s voltage law around the loop gives $v_s=R\\,i+v_C$, where $i$ is the loop current. The capacitor current is $i=C\\,\\d v_C/\\d t$. Substitute it:'},
{t:'eq', tex:'\\begin{aligned}v_s(t)&=R\\,i(t)+v_C(t)\\\\&=RC\\,\\frac{\\d v_C(t)}{\\d t}+v_C(t).\\end{aligned}'},
{t:'p', text:'Divide both sides by $RC$ and exchange the two sides:'},
{t:'eq', tex:'\\frac{\\d v_C(t)}{\\d t}+\\frac{1}{RC}\\,v_C(t)=\\frac{1}{RC}\\,v_s(t).'},
{t:'p', text:'<b>A car.</b> A force $f(t)$ pushes a car of mass $m$. Friction opposes the motion with the force $\\rho\\,v(t)$, where $v$ is the speed. Newton’s second law gives $m\\,\\d v/\\d t=f-\\rho\\,v$. Move the friction term to the left and divide by $m$:'},
{t:'eq', tex:'\\frac{\\d v(t)}{\\d t}+\\frac{\\rho}{m}\\,v(t)=\\frac{1}{m}\\,f(t).'},
{t:'eqbox', cap:'One form', tex:['\\frac{\\d y(t)}{\\d t}+a\\,y(t)=b\\,x(t)','y[n]+a\\,y[n-1]=b\\,x[n]'],
 after:'The circuit has the first form with $a=b=1/RC$. The car has it with $a=\\rho/m$ and $b=1/m$. The second line is the discrete-time form. One method of analysis then serves every system of the same form; Section 3.5 gives it.'},
{t:'p', text:'A savings account has the discrete-time form. With 1 % interest a month, the balance is $y[n]=1.01\\,y[n-1]+x[n]$, where $x[n]$ is the deposit in month $n$. Move $1.01\\,y[n-1]$ to the left: $y[n]-1.01\\,y[n-1]=x[n]$. So $a=-1.01$ and $b=1$.'},
{t:'p', text:'With equal time constants $\\tau=RC=m/\\rho$, the circuit and the car respond in the same way. Switch on a constant input at $t=0$, with the system at rest. In both systems the output, divided by its final value, is $1-e^{-t/\\tau}$ for $t>0$. For the circuit with $v_s(t)=1$ for $t>0$, substitute $v_C=1-e^{-t/\\tau}$ into the left side of the equation:'},
{t:'eq', tex:'\\begin{aligned}\\frac{\\d}{\\d t}\\bigl(1-e^{-t/\\tau}\\bigr)+\\frac{1}{\\tau}\\bigl(1-e^{-t/\\tau}\\bigr)&=\\frac{1}{\\tau}\\,e^{-t/\\tau}+\\frac{1}{\\tau}-\\frac{1}{\\tau}\\,e^{-t/\\tau}\\\\&=\\frac{1}{\\tau}=\\frac{1}{RC}\\,v_s(t).\\end{aligned}'},
{t:'p', text:'The left side equals the right side, so the curve solves the equation. It also starts at $v_C(0)=1-1=0$, as a system at rest must. Section 3.5 shows how to find such a solution.'},
{t:'fig', svg:()=>{const a=ax({xr:[-0.6,5.4],yr:[-0.15,1.35],xlabel:'t/\\tau',ylabel:'\\text{normalized amplitude}',h:170,pad:{l:52,r:20,t:14,b:34},xstep:1,ytarget:3});
  a.curve(t=>t>=0?1:0,{color:C.in,dash:'9 6',n:900});
  a.curve(t=>t>=0?1-Math.exp(-t):0,{color:C.out});
  a.note(3.6,1.14,'input',{color:C.in,fs:13});
  a.note(1.4,0.5,'1-e^{-t/\\tau}',{tex:true,color:C.out,fs:14});
  return a.svg();},
 cap:'A constant input switched on at rest. The capacitor voltage and the speed of the car both follow $1-e^{-t/\\tau}$.'},
{t:'box', kind:'warn', html:'<span class="t">A model has limits</span>Ohm’s law and linear friction are idealizations. An analysis holds only while the signals stay in the range where the model is accurate. An amplifier is linear only until it clips. A circuit that warms up is only close to time invariant.'},

{t:'h3', text:'Connecting systems'},
{t:'p', text:'Larger systems are built by connecting smaller ones. Three connections occur again and again.'},
{t:'ul', items:[
 '<b>Series</b>, or cascade: the output of $S_1$ is the input of $S_2$.',
 '<b>Parallel</b>: both systems get the same input, and their outputs add.',
 '<b>Feedback</b>: the output of $S_1$ passes through $S_2$ and is added to the input of $S_1$.'
]},
{t:'fig', svg:()=>heads(P.blocks({w:900,h:190,items:[
  {t:'text',x:145,y:26,label:'series',fs:13,color:C.slate},
  {t:'arrow',x1:10,y1:100,x2:60,y2:100},{t:'box',x:60,y:78,w:70,h:44,label:'S_1',tex:true},
  {t:'arrow',x1:130,y1:100,x2:170,y2:100},{t:'box',x:170,y:78,w:70,h:44,label:'S_2',tex:true},
  {t:'arrow',x1:240,y1:100,x2:290,y2:100},
  {t:'text',x:34,y:86,label:'x',tex:true,fs:16},{t:'text',x:266,y:86,label:'y',tex:true,fs:16},
  {t:'text',x:455,y:26,label:'parallel',fs:13,color:C.slate},
  {t:'line',d:'M318 100 H350 M350 65 V135'},
  {t:'arrow',x1:350,y1:65,x2:400,y2:65},{t:'box',x:400,y:43,w:70,h:44,label:'S_1',tex:true},
  {t:'arrow',x1:350,y1:135,x2:400,y2:135},{t:'box',x:400,y:113,w:70,h:44,label:'S_2',tex:true},
  {t:'line',d:'M470 65 H525 V86 M470 135 H525 V114'},{t:'sum',x:525,y:100},
  {t:'arrow',x1:539,y1:100,x2:595,y2:100},
  {t:'text',x:330,y:86,label:'x',tex:true,fs:16},{t:'text',x:572,y:86,label:'y',tex:true,fs:16},
  {t:'text',x:760,y:26,label:'feedback',fs:13,color:C.slate},
  {t:'arrow',x1:622,y1:80,x2:656,y2:80},{t:'sum',x:670,y:80},
  {t:'arrow',x1:684,y1:80,x2:730,y2:80},{t:'box',x:730,y:58,w:70,h:44,label:'S_1',tex:true},
  {t:'arrow',x1:800,y1:80,x2:892,y2:80},
  {t:'line',d:'M855 80 V150 H814 M735 150 H670 V103'},{t:'box',x:735,y:128,w:70,h:44,label:'S_2',tex:true},
  {t:'text',x:638,y:66,label:'x',tex:true,fs:16},{t:'text',x:872,y:66,label:'y',tex:true,fs:16}
]}), ['M525,86 l-4.5,-9 h9 Z','M525,114 l-4.5,9 h9 Z','M805,150 l9,-4.5 v9 Z','M670,94 l-4.5,9 h9 Z'])+
  '', cap:'Series, parallel and feedback connections of two systems. The circle adds the signals that enter it.'},
{t:'p', text:'In the feedback connection, let $S_1$ pass its input unchanged and let $S_2$ be a one-sample delay. The signal that enters $S_1$ is then $x[n]+y[n-1]$, and $S_1$ passes it on:'},
{t:'eq', tex:'y[n]=x[n]+y[n-1].'},
{t:'p', text:'This system is the accumulator. Section 2.2 shows that it remembers every earlier input.'},
{t:'p', text:'The order of a series connection can change the result. Squaring and then doubling gives $2x^{2}$. Doubling and then squaring gives $(2x)^{2}=4x^{2}$.'},
{t:'ex', hd:'Example 2.1', rows:[
 ['Given','$S_1$: $y[n]=x[n-1]$, followed in series by $S_2$: $y[n]=2\\,x[n]$.'],
 ['Find','The rule of the whole connection.'],
 ['Method','Name the signal between the two systems. Write each system rule for it, then substitute one rule into the other.'],
 ['Solution','Call the output of $S_1$ $w[n]$. Then $w[n]=x[n-1]$. The system $S_2$ doubles its own input, which is $w[n]$: $$\\begin{aligned}y[n]&=2\\,w[n]\\\\&=2\\,x[n-1].\\end{aligned}$$ The connection delays the input by one sample and doubles it.'],
 ['Check','Take $x[n]=\\delta[n]$. Then $w[n]=\\delta[n-1]$ and $y[n]=2\\,\\delta[n-1]$. The rule $y[n]=2\\,x[n-1]$ gives $2\\,\\delta[n-1]$ for the same input.']
]},

{t:'h2', num:'2.2', text:'The six properties'},
{t:'p', text:'Each property is a statement about every input. To prove a property, give an argument that holds for every input. To disprove it, give one explicit input for which it fails. One example that works cannot prove a property.'},

{t:'h3', text:'Memory'},
{t:'box', html:'<span class="t">Criterion</span>A system is <b>memoryless</b> if the output at time $t$, or at $n$, depends only on the input at that same time.'},
{t:'table', head:['System','Verdict','Reason'], rows:[
 ['$y(t)=\\bigl[2x(t)-x^{2}(t)\\bigr]^{2}$','memoryless','Only $x(t)$ appears. There is no $x(t+1)$ or $x(t-2)$ term.'],
 ['$y[n]=x[n]$','memoryless','The identity system.'],
 ['$y[n]=x[n-1]$','has memory','The output at $n$ uses the sample at $n-1$.'],
 ['$y(t)=x(t/2)$','has memory','At $t=2$ the output uses $x(1)$, an input at a different time.'],
 ['$y[n]=x[n]+y[n-1]$','has memory','See the derivation below.']
]},
{t:'p', text:'The last system is the accumulator from Section 2.1. Assume initial rest: the output is zero until the input starts. Then substitute the feedback relation into itself, again and again:'},
{t:'eq', tex:'\\begin{aligned}y[n]&=x[n]+y[n-1]\\\\&=x[n]+x[n-1]+y[n-2]\\\\&=x[n]+x[n-1]+x[n-2]+y[n-3]\\\\&\\;\\;\\vdots\\\\&=x[n]+x[n-1]+x[n-2]+\\cdots\\\\&=\\sum_{k=0}^{\\infty}x[n-k].\\end{aligned}'},
{t:'p', text:'The result uses $x[n-k]$ for every $k\\ge0$, so the output depends on the whole input history. Output feedback gives the system memory. For the impulse input $x[n]=\\delta[n]$, the term $\\delta[n-k]$ is 1 only at $k=n$, and such a $k\\ge0$ exists only for $n\\ge0$:'},
{t:'eq', tex:'y[n]=\\sum_{k=0}^{\\infty}\\delta[n-k]=\\begin{cases}1,&n\\ge0\\\\0,&n<0\\end{cases}\\;=\\;u[n].'},
{t:'p', text:'The impulse enters once, and the feedback keeps it. So $y[3]=1$.'},
{t:'box', kind:'ok', html:'<span class="t">Circuit examples</span>A resistor, $v(t)=R\\,i(t)$, is memoryless: the voltage at $t$ uses only the current at $t$. A capacitor is not memoryless, because $v(t)=\\frac{1}{C}\\int_{-\\infty}^{t}i(\\tau)\\,\\d\\tau$ uses the whole current history.'},

{t:'h3', text:'Invertibility'},
{t:'box', html:'<span class="t">Criterion</span>A system is <b>invertible</b> if distinct inputs always produce distinct outputs. The map from inputs to outputs must be one-to-one.'},
{t:'p', text:'To prove invertibility, find a formula that recovers every input from its output. To disprove invertibility, find two distinct inputs that give the same output.'},
{t:'ex', hd:'Example 2.2', rows:[
 ['Given','$y(t)=\\bigl[\\cos(t)+2\\bigr]x(t)$.'],
 ['Find','Is the system invertible?'],
 ['Method','Solve the system rule for $x(t)$, and show that the divisor is never zero.'],
 ['Solution','First bound the gain. Add 2 to each part of the bound on the cosine: $$\\begin{aligned}-1&\\le\\cos(t)\\le1\\\\1&\\le\\cos(t)+2\\le3.\\end{aligned}$$ The gain is never zero. Now divide the system equation by it: $$y(t)=\\bigl[\\cos(t)+2\\bigr]x(t)\\quad\\Longrightarrow\\quad x(t)=\\frac{y(t)}{\\cos(t)+2}.$$ Every input is recovered from its output, so the system is invertible.'],
 ['Check','Substitute the formula back: $\\bigl[\\cos t+2\\bigr]\\dfrac{y(t)}{\\cos t+2}=y(t)$. With the gain $\\cos(t)$ alone, the system would lose the input at every zero of the cosine.']
]},
{t:'ex', hd:'Example 2.3', rows:[
 ['Given','$y(t)=x^{2}(t)$.'],
 ['Find','Is the system invertible?'],
 ['Method','Look for two distinct inputs that squaring maps to the same output.'],
 ['Solution','Take $x_1(t)=1$ and $x_2(t)=-1$ for all $t$. Then $$\\begin{aligned}S\\{x_1\\}&=1^{2}=1,\\\\S\\{x_2\\}&=(-1)^{2}=1.\\end{aligned}$$ The inputs are different, but their outputs are equal. The system is <b>not</b> invertible.'],
 ['Check','One counterexample is enough. The sign of the input is lost and cannot be recovered from $y$ alone.']
]},
{t:'box', kind:'err', html:'<span class="t">Not an inversion formula</span>Writing $x(t)=\\sqrt{y(t)}$ does not invert $y=x^{2}$. It keeps only one of the two possible inputs. An inversion formula must return the actual input, for every input.'},

{t:'h3', text:'Inverse systems'},
{t:'p', text:'An invertible system $S$ has an <b>inverse system</b>. Placed in series after $S$, the inverse returns the input: its output $w$ equals $x$ for every input $x$.'},
{t:'p', text:'The accumulator $y[n]=\\sum_{k=-\\infty}^{n}x[k]$ has the first difference $w[n]=y[n]-y[n-1]$ as its inverse. To show this, split the last term off the first sum. Every other term then appears in both sums and cancels:'},
{t:'eq', tex:'\\begin{aligned}w[n]&=y[n]-y[n-1]\\\\&=\\sum_{k=-\\infty}^{n}x[k]-\\sum_{k=-\\infty}^{n-1}x[k]\\\\&=\\Bigl(\\sum_{k=-\\infty}^{n-1}x[k]+x[n]\\Bigr)-\\sum_{k=-\\infty}^{n-1}x[k]\\\\&=x[n].\\end{aligned}'},
{t:'figrow', n:3, items:(()=>{
  const xs=[0,0,1,2,-1,1,0,0,0,0,0], ys=xs.map((_,i)=>xs.slice(0,i+1).reduce((p,q)=>p+q,0));
  const pl=(v,col,yl)=>()=>{const a=sm({xr:[-2.5,8.5],yr:[-1.6,3.6],xlabel:'n',ylabel:yl,w:230,h:160,pad:{l:40,r:12,t:12,b:24},xtarget:4,ystep:1});
    a.stem(v.map((y,j)=>[j-2,y]),{color:col,r:2.4,width:1.4}); return a.svg();};
  return [{svg:pl(xs,C.in,'x[n]'),cap:'The input $x[n]$.'},{svg:pl(ys,C.out,'y[n]'),cap:'The accumulator output $y[n]$.'},
          {svg:pl(xs,C.mid,'w[n]'),cap:'The first difference: $w[n]=x[n]$.'}];})()},
{t:'p', text:'A lossless encoder must be invertible. The decoder is its inverse system and recovers the message exactly.'},
{t:'ex', hd:'Example 2.4', rows:[
 ['Given','$y(t)=3\\,x(t-2)$.'],
 ['Find','The inverse system.'],
 ['Method','The system delays the input by 2 and then multiplies it by 3. Undo the two operations in reverse order: divide by 3, then advance by 2.'],
 ['Solution','The inverse is $$w(t)=\\tfrac13\\,y(t+2).$$'],
 ['Check','Substitute the system rule, evaluated at $t+2$: $$\\begin{aligned}w(t)&=\\tfrac13\\,y(t+2)\\\\&=\\tfrac13\\cdot3\\,x\\bigl((t+2)-2\\bigr)\\\\&=x(t).\\end{aligned}$$ The cascade returns the input. The candidates $\\tfrac13\\,y(t-2)$ and $3\\,y(t+2)$ return $x(t-4)$ and $9\\,x(t)$ instead.']
]},

{t:'h3', text:'Causality'},
{t:'box', html:'<span class="t">Criterion</span>A system is <b>causal</b> if the output at time $t$, or at $n$, depends only on inputs at times up to $t$: the present and the past.'},
{t:'table', head:['System','Verdict','Reason'], rows:[
 ['$y[n]=x[n-1]$','causal','Uses only a past sample.'],
 ['$y[n]=x[n]+x[n+1]$','not causal','$x[n+1]$ is a future sample.'],
 ['$y(t)=\\int_{-\\infty}^{t}x(\\tau)\\,\\d\\tau$','causal','The upper limit is $t$, so only $\\tau\\le t$ contributes.'],
 ['$y[n]=x[-n]$','not causal','$y[-1]=x[-(-1)]=x[1]$. The output at $n=-1$ needs a future input.'],
 ['$y(t)=x(2t)$','not causal','At $t=1$ the output uses $x(2)$, a future value.'],
 ['$y(t)=x(t)\\cos(t+1)$','causal','Uses only $x(t)$. The factor $\\cos(t+1)$ is a known function of $t$, fixed in advance. It is not a future input.']
]},
{t:'p', text:'For $y(t)=x(2t)$ and $t<0$, the output uses $2t<t$, which is the past. One output time that needs the future is enough to make a system non-causal.'},
{t:'fig', svg:()=>{const a=ax({xr:[-5,5],xlabel:'\\text{time relative to the output instant}',w:700,h:150,pad:{l:30,r:20,t:24,b:34},xtarget:11,ytarget:2,yticksOverride:[],yr:[-0.1,1.3]});
  a.rect(-5,0,0,1,{fill:'rgba(63,108,59,.13)'}); a.rect(0,0,5,1,{fill:'rgba(152,53,39,.12)'});
  a.vline(0,{color:C.err,dash:'0',width:1.4,opacity:1});
  a.note(-2.5,0.52,'available to a causal system',{anchor:'middle',color:C.out,fs:13});
  a.note(2.5,0.52,'forbidden: the future',{anchor:'middle',color:C.err,fs:13});
  a.note(0,1.1,'now',{anchor:'middle',color:C.err,fs:12}); return a.svg();},
 cap:'A causal system may use the past and the present of the input. It may not use the future.'},
{t:'p', text:'A system that works while the signal arrives must be causal, because future input values are not yet available. A program that processes a stored recording may use later samples.'},

{t:'h3', text:'Stability'},
{t:'p', text:'A signal is <b>bounded</b> if some finite constant $B$ satisfies $|x(t)|\\le B$ for every $t$.'},
{t:'box', html:'<span class="t">Criterion</span>A system is <b>BIBO stable</b> if every bounded input produces a bounded output. BIBO stands for bounded input, bounded output.'},
{t:'box', kind:'warn', html:'<span class="t">Proof and counterexample</span>To prove stability, derive an output bound that holds for every bounded input. To disprove stability, find one bounded input that produces an unbounded output.'},
{t:'ex', hd:'Example 2.5', rows:[
 ['Given','$y(t)=2x^{2}(t-1)+x(3t)$.'],
 ['Find','Is the system BIBO stable?'],
 ['Method','Assume $|x(t)|\\le B$ for every $t$, and bound $|y|$ with the triangle inequality: the modulus of a sum is at most the sum of the moduli.'],
 ['Solution','Start from the system rule, apply the triangle inequality, then use the input bound: $$\\begin{aligned}|y(t)|&=\\bigl|2x^{2}(t-1)+x(3t)\\bigr|\\\\&\\le\\bigl|2x^{2}(t-1)\\bigr|+|x(3t)|\\\\&=2|x(t-1)|^{2}+|x(3t)|\\\\&\\le2B^{2}+B<\\infty.\\end{aligned}$$ The output has the finite bound $2B^{2}+B$, so the system is stable.'],
 ['Check','A shift or a scale of the time axis does not change the set of values a signal takes. So $x(t-1)$ and $x(3t)$ are bounded by the same $B$.']
]},
{t:'ex', hd:'Example 2.6', rows:[
 ['Given','$y[n]=\\sum_{k=-\\infty}^{n}x[k]$, the accumulator.'],
 ['Find','Is the system BIBO stable?'],
 ['Method','Look for one bounded input with an unbounded output.'],
 ['Solution','Take $x[n]=u[n]$, so $|x[n]|\\le1$. The factor $u[k]$ removes every $k<0$. For $n\\ge0$, $$\\begin{aligned}y[n]&=\\sum_{k=-\\infty}^{n}u[k]\\\\&=\\sum_{k=0}^{n}1\\\\&=n+1\\longrightarrow\\infty.\\end{aligned}$$ The input is bounded and the output is not. The system is <b>not</b> stable.'],
 ['Check','The input never exceeds 1, and the output passes every bound. That is exactly the failure that BIBO stability rules out.']
]},
{t:'figrow', items:[
 {svg:()=>{const a=sm({xr:[-2,12],yr:[-0.3,1.4],xlabel:'n',ylabel:'x[n]'});
   a.stem(D(n=>n>=0?1:0,-2,12),{color:C.in,r:2.6}); a.hline(1,{color:C.in,dash:'2 5'}); return a.svg();},
  cap:'The bounded input $u[n]$.'},
 {svg:()=>{const a=sm({xr:[-2,12],yr:[-1,14],xlabel:'n',ylabel:'y[n]',ytarget:3});
   a.stem(D(n=>n>=0?n+1:0,-2,12),{color:C.err,r:2.6}); return a.svg();},
  cap:'The unbounded output $n+1$.'}
]},
{t:'box', kind:'warn', html:'<span class="t">Two separate tests</span>Causality and stability are separate tests. The accumulator is causal and not stable. The time reversal $y[n]=x[-n]$ is stable and not causal.'},

{t:'h3', text:'Time invariance'},
{t:'box', html:'<span class="t">Criterion</span>If $x(t)$ produces $y(t)$, the system is <b>time invariant</b> when $x(t-t_0)$ produces $y(t-t_0)$, for every shift $t_0$.'},
{t:'p', text:'The test compares two computed signals.'},
{t:'ol', items:[
 '<b>Path 1.</b> Shift the input, then apply the system: $y_2=S\\{x(t-t_0)\\}$.',
 '<b>Path 2.</b> Apply the system, then shift the output: $y_1(t-t_0)$.'
]},
{t:'p', text:'The system is time invariant exactly when the two agree, for every input and every $t_0$.'},
{t:'ex', hd:'Example 2.7', rows:[
 ['Given','$y(t)=\\sin\\bigl(x(t)\\bigr)$.'],
 ['Find','Is the system time invariant?'],
 ['Method','Compute both paths of the test for an arbitrary input $x_1$ and an arbitrary shift $t_0$.'],
 ['Solution','Path 1 shifts the input and then applies the system: $$\\begin{aligned}x_2(t)&=x_1(t-t_0),\\\\y_2(t)&=\\sin\\bigl(x_2(t)\\bigr)=\\sin\\bigl(x_1(t-t_0)\\bigr).\\end{aligned}$$ Path 2 applies the system and then shifts its output: $$\\begin{aligned}y_1(t)&=\\sin\\bigl(x_1(t)\\bigr),\\\\y_1(t-t_0)&=\\sin\\bigl(x_1(t-t_0)\\bigr).\\end{aligned}$$ So $y_2(t)=y_1(t-t_0)$. The system is time invariant.'],
 ['Check','Both paths give the same expression, and neither step used a special input or a special $t_0$.']
]},
{t:'ex', hd:'Example 2.8', rows:[
 ['Given','$y[n]=n\\,x[n]$.'],
 ['Find','Is the system time invariant?'],
 ['Method','Look for a counterexample with an impulse input and a one-sample shift.'],
 ['Solution','Take $x_1[n]=\\delta[n]$. Path 2 applies the system and then shifts: $$\\begin{aligned}y_1[n]&=n\\,\\delta[n]=0,\\\\y_1[n-1]&=0.\\end{aligned}$$ Path 1 shifts the input first: $$\\begin{aligned}x_2[n]&=\\delta[n-1],\\\\y_2[n]&=n\\,\\delta[n-1]\\\\&=1\\cdot\\delta[n-1]=\\delta[n-1].\\end{aligned}$$ The step $n\\,\\delta[n]=0$ holds because $\\delta[n]$ is non-zero only at $n=0$, where the factor $n$ is 0. The step $n\\,\\delta[n-1]=\\delta[n-1]$ holds because $\\delta[n-1]$ is non-zero only at $n=1$. So $y_2[n]\\neq y_1[n-1]$, and the system is <b>not</b> time invariant.'],
 ['Check','The two outputs differ at $n=1$: path 1 gives 1 there, and path 2 gives 0. The explicit $n$ in the rule does not move with the input.']
]},
{t:'ex', hd:'Example 2.9', rows:[
 ['Given','$y(t)=x(2t)$.'],
 ['Find','Is the system time invariant?'],
 ['Method','Compute both paths for an arbitrary input. Then make the difference visible with the pulse $x_1(t)=1$ for $|t|<2$, zero elsewhere, and the shift $t_0=2$.'],
 ['Solution','Path 1 shifts the input and then applies the system. The system replaces $t$ by $2t$ in its input $x_2$: $$\\begin{aligned}x_2(t)&=x_1(t-t_0),\\\\y_2(t)&=x_2(2t)=x_1(2t-t_0).\\end{aligned}$$ Path 2 applies the system and then shifts the output: $$\\begin{aligned}y_1(t)&=x_1(2t),\\\\y_1(t-t_0)&=x_1\\bigl(2(t-t_0)\\bigr)=x_1(2t-2t_0).\\end{aligned}$$ The two shifts differ: $t_0$ against $2t_0$. For the pulse with $t_0=2$, $y_2(t)=1$ when $|2t-2|<2$. Add 2 to each side of $-2<2t-2<2$ and divide by 2: $0<t<2$. Likewise $y_1(t-2)=1$ when $|2t-4|<2$, that is $-2<2t-4<2$, so $1<t<3$. The two pulses differ, so the system is <b>not</b> time invariant.'],
 ['Check','The unshifted output $y_1(t)=x_1(2t)$ is the pulse $-1<t<1$. Path 1 moves it by $t_0/2=1$, to $0<t<2$. Path 2 moves it by $t_0=2$, to $1<t<3$.']
]},
{t:'fig', svg:()=>{const a=ax({xr:[-2.5,4.5],yr:[-0.3,1.5],xlabel:'t',ylabel:'\\text{amplitude}',h:170,pad:{l:50,r:20,t:14,b:32},xstep:1,ytarget:2});
  const p1=t=>(t>0&&t<2)?1:0, p2=t=>(t>1&&t<3)?1:0;
  a.area(p1,0,2,{color:'rgba(166,59,42,.12)'}); a.area(p2,1,3,{color:'rgba(74,122,70,.14)'});
  a.curve(p1,{color:C.err,n:1400}); a.curve(p2,{color:C.out,dash:'8 5',n:1400});
  a.note(-0.15,0.62,'y_2(t)',{anchor:'end',tex:true,color:C.err,fs:14});
  a.note(3.15,0.62,'y_1(t-2)',{anchor:'start',tex:true,color:C.out,fs:14});
  return a.svg();},
 cap:'Example 2.9 with $t_0=2$. Path 1 gives the pulse on $0<t<2$; path 2 gives the dashed pulse on $1<t<3$.'},
{t:'box', kind:'ok', html:'<span class="t">Two patterns that break time invariance</span>An explicit time variable in the rule, such as the $n$ in $n\\,x[n]$ or the $\\cos(t)$ in $x(t)\\cos(t)$, does not move with the input. A scaled or reversed argument, such as $x(2t)$ or $x[-n]$, changes the size or the direction of every shift. In either case, apply the two-path test.'},

{t:'h3', text:'Linearity'},
{t:'eqbox', cap:'Criterion: superposition', tex:'a\\,x_1+b\\,x_2\\;\\longrightarrow\\;a\\,y_1+b\\,y_2\\qquad\\text{for all complex }a,b',
 after:'Here $x_1\\to y_1$ and $x_2\\to y_2$. The statement combines two conditions. <b>Additivity:</b> $x_1+x_2\\to y_1+y_2$. <b>Homogeneity:</b> $a\\,x\\to a\\,y$ for every complex $a$.'},
{t:'ex', hd:'Example 2.10', rows:[
 ['Given','$y(t)=2\\pi\\,x(t)$.'],
 ['Find','Is the system linear?'],
 ['Method','Apply the system to a weighted sum and compare the result with the same weighted sum of the two outputs.'],
 ['Solution','Let $x_3=a\\,x_1+b\\,x_2$. Apply the system and distribute the constant: $$\\begin{aligned}S\\{x_3\\}&=S\\{a\\,x_1+b\\,x_2\\}\\\\&=2\\pi(a\\,x_1+b\\,x_2)\\\\&=a(2\\pi x_1)+b(2\\pi x_2)\\\\&=a\\,y_1+b\\,y_2.\\end{aligned}$$ Superposition holds, so the system is linear. It is also time invariant, so it is LTI (linear and time invariant).'],
 ['Check','The final expression is $a\\,S\\{x_1\\}+b\\,S\\{x_2\\}$ for arbitrary inputs and arbitrary complex scalars.']
]},
{t:'ex', hd:'Example 2.11', rows:[
 ['Given','$y[n]=\\bigl(x[2n]\\bigr)^{2}$.'],
 ['Find','Is the system linear?'],
 ['Method','Compute both sides of the superposition test and compare them term by term.'],
 ['Solution','Let $x_3[n]=a\\,x_1[n]+b\\,x_2[n]$. Combining first and then applying the system gives $$\\begin{aligned}y_3[n]&=\\bigl(x_3[2n]\\bigr)^{2}\\\\&=\\bigl(a\\,x_1[2n]+b\\,x_2[2n]\\bigr)^{2}\\\\&=a^{2}x_1^{2}[2n]+2ab\\,x_1[2n]\\,x_2[2n]+b^{2}x_2^{2}[2n].\\end{aligned}$$ Applying the system first and then combining gives $$a\\,y_1[n]+b\\,y_2[n]=a\\,x_1^{2}[2n]+b\\,x_2^{2}[2n].$$ The first expression has a cross term, and its powers of $a$ and $b$ differ. The system is <b>not</b> linear.'],
 ['Check','Scaling the input by $a$ scales this output by $a^{2}$, so homogeneity fails on its own.']
]},

{t:'h3', text:'Complex scale factors'},
{t:'p', text:'Additivity and homogeneity are separate conditions. A system can pass one and fail the other. Homogeneity must hold for every complex $a$, and a real $a$ can hide a failure.'},
{t:'ex', hd:'Example 2.12', rows:[
 ['Given','$y[n]=\\mathrm{Re}\\{x[n]\\}$, with complex inputs.'],
 ['Find','Is the system linear?'],
 ['Method','Additivity holds, because the real part of a sum is the sum of the real parts. Test homogeneity with the complex scale factor $a=j$.'],
 ['Solution','Write $x_1[n]=r[n]+j\\,s[n]$, where $r[n]$ and $s[n]$ are its real and imaginary parts. Then $y_1[n]=r[n]$. Scale the input by $j$ and use $j^{2}=-1$: $$\\begin{aligned}x_2[n]&=j\\,x_1[n]\\\\&=j\\,r[n]+j^{2}s[n]\\\\&=-s[n]+j\\,r[n].\\end{aligned}$$ The output is its real part, $y_2[n]=-s[n]$. Homogeneity asks for $a\\,y_1[n]=j\\,r[n]$. A real $-s[n]$ cannot equal an imaginary $j\\,r[n]$ unless both are zero. So $y_2\\neq a\\,y_1$, and the system is <b>not</b> linear.'],
 ['Check','Take the single value $x_1=2+j$. Then $y_1=2$ and $a\\,y_1=2j$. The scaled input is $j(2+j)=2j+j^{2}=-1+2j$, whose real part is $y_2=-1\\neq2j$. For a real $a$, $\\mathrm{Re}\\{a\\,x\\}=a\\,\\mathrm{Re}\\{x\\}$, so the test with a real scalar passes.']
]},
{t:'fig', svg:()=>{const a=ax({xr:[-3.2,3.2],yr:[-1.2,2.7],xlabel:'\\mathrm{Re}',ylabel:'\\mathrm{Im}',h:215,pad:{l:50,r:20,t:14,b:32},xstep:1,ystep:1});
  a.poly([[2,1],[2,0]],{color:C.in,dash:'4 4',width:1.4}); a.poly([[-1,2],[-1,0]],{color:C.mid,dash:'4 4',width:1.4});
  a.poly([[0,0],[2,1]],{color:C.in}); a.poly([[0,0],[-1,2]],{color:C.mid});
  a.point(2,1,{color:C.in}); a.point(-1,2,{color:C.mid}); a.point(2,0,{color:C.out}); a.point(0,2,{color:C.out}); a.point(-1,0,{color:C.err});
  a.note(2,1,'x_1=2+j',{tex:true,dx:10,dy:4,color:C.in,fs:14});
  a.note(-1,2,'a\\,x_1=-1+2j',{tex:true,anchor:'end',dx:-10,dy:4,color:C.mid,fs:14});
  a.note(0,2,'a\\,y_1=2j',{tex:true,dx:10,dy:-6,color:C.out,fs:14});
  a.note(2,0,'y_1=2',{tex:true,dx:8,dy:-12,color:C.out,fs:14});
  a.note(-1,0,'y_2=-1',{tex:true,anchor:'end',dx:-8,dy:-10,color:C.err,fs:14});
  return a.svg();},
 cap:'Example 2.12 in the complex plane with $a=j$. The output $y_2=\\mathrm{Re}\\{a\\,x_1\\}$ is $-1$, but $a\\,y_1$ is $2j$.'},

{t:'h3', text:'Incrementally linear systems'},
{t:'p', text:'Every linear system maps the zero input to the zero output. Put $a=0$ in homogeneity: $S\\{0\\cdot x\\}=0\\cdot y=0$. So a rule with an added constant cannot be linear. For example, $y(t)=x(t)+1$ gives $y=1$ for the zero input.'},
{t:'ex', hd:'Example 2.13', rows:[
 ['Given','$y[n]=3\\,x[n]+2$, with the constant inputs $x_1[n]=1$ and $x_2[n]=2$.'],
 ['Find','Does $x_1+x_2$ give $y_1+y_2$?'],
 ['Method','Compute the three outputs directly from the rule.'],
 ['Solution','$$\\begin{aligned}y_1[n]&=3\\cdot1+2=5,\\\\y_2[n]&=3\\cdot2+2=8,\\\\y_3[n]&=3\\cdot(1+2)+2=11.\\end{aligned}$$ But $y_1+y_2=5+8=13\\neq11$. Additivity fails, so the system is not linear.'],
 ['Check','The gap $13-11=2$ is the added constant. It enters $y_3$ once but $y_1+y_2$ twice.']
]},
{t:'p', text:'Split the output into a linear part and a part that does not depend on the input:'},
{t:'eq', tex:'y[n]=\\underbrace{3\\,x[n]}_{\\text{linear}}+\\underbrace{2}_{y_0[n]}.'},
{t:'p', text:'The term $y_0[n]$ is the <b>zero-input response</b>, the output when $x[n]=0$. The difference of two outputs is linear in the difference of the inputs, because the constant cancels:'},
{t:'eq', tex:'\\begin{aligned}y_1[n]-y_2[n]&=\\bigl(3\\,x_1[n]+2\\bigr)-\\bigl(3\\,x_2[n]+2\\bigr)\\\\&=3\\bigl(x_1[n]-x_2[n]\\bigr).\\end{aligned}'},
{t:'p', text:'A system with this property is called <b>incrementally linear</b>. It is a linear system plus a zero-input response.'},

{t:'h2', num:'2.3', text:'Classification in practice'},
{t:'p', text:'Test an unfamiliar system in a fixed order. The order puts the tests that most often fail first.'},
{t:'ol', items:[
 '<b>Time invariance.</b> Look for an explicit $t$ or $n$, or a scaled or reversed argument. If you find one, apply the two-path test.',
 '<b>Linearity.</b> Test with one scalar and one sum. Squares, products, $\\sin(x)$, absolute values, saturation and added constants usually fail.',
 '<b>Memory and causality.</b> Read every input argument. An argument different from $t$ or $n$ gives memory. An argument later than the output time gives non-causality.',
 '<b>Stability, then invertibility.</b> Assume $|x|\\le B$ and derive a finite output bound, or find a bounded input with an unbounded output. Then find an inverse formula, or two distinct inputs with the same output.'
]},
{t:'box', kind:'ok', html:'<span class="t">One general implication</span><b>Memoryless implies causal</b>, because a memoryless system uses only the present input. The converse fails: $y[n]=x[n-1]$ is causal and has memory. A causal system need not be stable, and a linear system need not be time invariant.'},
{t:'table', head:['System','Memoryless','Invertible','Causal','Stable','Time inv.','Linear'], rows:[
 ['$y(t)=2\\pi x(t)$','yes','yes','yes','yes','yes','yes'],
 ['$y[n]=x[n-1]$','no','yes','yes','yes','yes','yes'],
 ['$y(t)=x^{2}(t)$','yes','no','yes','yes','yes','no'],
 ['$y[n]=n\\,x[n]$','yes','no','yes','no','no','yes'],
 ['$y[n]=\\sum_{k\\le n}x[k]$','no','yes','yes','no','yes','yes'],
 ['$y[n]=x[-n]$','no','yes','no','yes','no','yes'],
 ['$y[n]=(x[2n])^{2}$','no','no','no','yes','no','no']
]},
{t:'p', text:'Read each property down its column. Every pattern of verdicts occurs, so each property needs its own test.'},
{t:'p', text:'Everyday systems carry the same properties. An RC circuit, $v_C(t)=5\\,(1-e^{-t/\\tau})$ for a supply switched to 5 V, is causal and has memory. A guitar overdrive, $y(t)=\\tanh\\bigl(2x(t)\\bigr)$, is memoryless and not linear. A savings account with 1 % a month, $y[n]=1.01\\,y[n-1]+x[n]$, is linear and time invariant, but a deposit of 100 each month makes its balance grow without bound. A digital echo, $y[n]=x[n]+0.6\\,x[n-8]$, is linear and time invariant.'},

{t:'h2', num:'2.4', text:'Summary'},
{t:'table', head:['Property','Definition','How to disprove it'], rows:[
 ['Memoryless','The output at $t$ uses only the input at the same $t$.','Find an output that uses the input at another time.'],
 ['Invertible','Distinct inputs give distinct outputs.','Find two distinct inputs with the same output.'],
 ['Causal','The output at $t$ uses only $x(\\tau)$ for $\\tau\\le t$.','Find an output that uses a future input.'],
 ['BIBO stable','Every bounded input gives a bounded output.','Find one bounded input with an unbounded output.'],
 ['Time invariant','$x(t-t_0)\\to y(t-t_0)$ for every $t_0$.','Find one input and one shift where the two paths differ.'],
 ['Linear','$a\\,x_1+b\\,x_2\\to a\\,y_1+b\\,y_2$ for all complex $a$, $b$.','Find inputs and scalars where superposition fails.']
]},
{t:'box', kind:'ok', html:'<span class="t">What Chapter 3 proves</span>If a system is linear and time invariant, its response to <b>one</b> input, the unit impulse, determines its response to <b>every</b> input.'},

{t:'h3', text:'Exercises'},
{t:'q', n:'2.1', text:'Classify $y(t)=x(t)\\,u(t)$ against all six properties.', ans:'Memoryless, not invertible, causal, stable, not time invariant, linear.'},
{t:'q', n:'2.2', text:'Show that $y[n]=x[n]-x[n-1]$ is invertible on inputs that are zero for $n<0$, and give the inverse.', ans:'$x[n]=\\sum_{k=0}^{n}y[k]$.'},
{t:'q', n:'2.3', text:'Give a system that is linear and causal but not stable, and one that is stable and time invariant but not linear.'},
{t:'q', n:'2.4', text:'Is $y(t)=x(t/2)$ time invariant? Prove it or give a counterexample.', ans:'No. Path 1 gives $x(t/2-t_0)$ and path 2 gives $x\\bigl((t-t_0)/2\\bigr)$.'},

{t:'page'},

/* ================= CHAPTER 3 ================= */
{t:'h1', num:'CHAPTER 3', text:'Linear time-invariant systems'},
{t:'p', lead:true, text:'This chapter develops a direct way to find the output of a linear time-invariant (LTI) system. Its response to one unit impulse describes the system completely. Convolution then uses that response to find the output for any input. The chapter ends with systems given by difference and differential equations.'},

{t:'h2', num:'3.1', text:'Impulse response and the representation property'},
{t:'box', html:'<span class="t">Definition</span>The <b>impulse response</b> is the output when the input is a unit impulse: $x[n]=\\delta[n]$ gives $y[n]=h[n]$. In continuous time, $x(t)=\\delta(t)$ gives $y(t)=h(t)$.'},
{t:'fig', svg:()=>{const a=ax({xr:[-4,9],yr:[-0.3,1.4],xlabel:'n',ylabel:'\\text{amplitude}',h:170,pad:{l:50,r:20,t:14,b:32},xtarget:13,ytarget:3});
  a.stem(D(n=>n===0?1:0,-4,0),{color:C.in}); a.stem(D(n=>Math.pow(0.8,n-1),1,9),{color:C.h});
  a.note(-2.4,0.3,'x[n]=\\delta[n]',{tex:true,anchor:'middle',color:C.in,fs:14});
  a.note(2.3,0.95,'y[n]=h[n]',{tex:true,color:C.h,fs:14});
  return a.svg();},
 cap:'The input is one unit sample at $n=0$. This system answers one step later, and its answer dies away.'},
{t:'p', text:'For a general system, this experiment gives one input–output pair and nothing more. It does not determine the response to another input.'},
{t:'p', text:'For an LTI system, one impulse response is enough. Time invariance gives the response to every shifted impulse: the input $\\delta[n-3]$ gives the output $h[n-3]$. Linearity then gives the response to every weighted sum of shifted impulses. The next result shows that every discrete-time signal is such a sum. Therefore $h[n]$ determines the response to every input.'},

{t:'h3', text:'Every signal is a sum of impulses'},
{t:'p', text:'Start from the sampling property of Chapter 1. A product with a shifted impulse keeps one sample, at $n=k$, with the weight $x[k]$:'},
{t:'eq', tex:'x[n]\\,\\delta[n-k]=x[k]\\,\\delta[n-k].'},
{t:'p', text:'Next, the sum of all shifted impulses is 1 at every $n$: in $\\sum_k\\delta[n-k]$ only the term $k=n$ is non-zero, and it equals 1. Multiply $x[n]$ by this sum, move $x[n]$ inside, and apply the sampling property to each term:'},
{t:'eq', tex:'\\begin{aligned}x[n]&=x[n]\\underbrace{\\sum_{k=-\\infty}^{\\infty}\\delta[n-k]}_{=\\,1}\\\\&=\\sum_{k=-\\infty}^{\\infty}x[n]\\,\\delta[n-k]\\\\&=\\sum_{k=-\\infty}^{\\infty}x[k]\\,\\delta[n-k].\\end{aligned}'},
{t:'eqbox', cap:'Representation property', tex:'x[n]=\\sum_{k=-\\infty}^{\\infty}x[k]\\,\\delta[n-k]',
 after:'Every sequence is a sum of shifted impulses. The impulse at $n=k$ carries the weight $x[k]$.'},
{t:'figrow', items:[
 {svg:()=>{const a=sm({xr:[-2,6],yr:[-0.3,2.6],xlabel:'n',ylabel:'x[n]',xtarget:8,ytarget:3});
   a.stem(D(n=>(n>=0&&n<=3)?[1,2,1,2][n]:0,-2,6),{color:C.in,r:2.6}); return a.svg();},
  cap:'The sequence $x[n]=\\{1,2,1,2\\}$ on $n=0,\\dots,3$.'},
 {svg:()=>{const a=sm({xr:[-2,6],yr:[-0.3,2.6],xlabel:'n',ylabel:'\\text{amplitude}',xtarget:8,ytarget:3});
   faint(a,()=>a.stem(D(n=>(n===0||n===2||n===3)?[1,2,1,2][n]:0,-2,6),{color:C.in,r:2.6}));
   a.stem([[1,2]],{color:C.mid,r:2.6}); a.note(1.2,2.35,'x[1]\\,\\delta[n-1]',{tex:true,color:C.mid,fs:13});
   return a.svg();},
  cap:'One term of the sum: $x[1]\\,\\delta[n-1]=2\\,\\delta[n-1]$.'}
]},
{t:'p', text:'Read a signal off this form one index at a time. For $x[n]=3\\,\\delta[n+1]-\\delta[n-2]$, at $n=-1$ only the first impulse is non-zero:'},
{t:'eq', tex:'\\begin{aligned}x[-1]&=3\\,\\delta[-1+1]-\\delta[-1-2]\\\\&=3\\,\\delta[0]-\\delta[-3]\\\\&=3\\cdot1-0=3.\\end{aligned}'},

{t:'h2', num:'3.2', text:'The convolution sum'},
{t:'p', text:'The purpose of this section is to obtain the output of an LTI system from $h[n]$. Start with the representation property, then apply the system to both sides.'},
{t:'eq', tex:'x[n]=\\sum_{k=-\\infty}^{\\infty}x[k]\\,\\delta[n-k]\\quad\\longrightarrow\\quad S\\quad\\longrightarrow\\quad y[n]=\\;?'},
{t:'ol', items:[
 '<b>Time invariance.</b> Since $\\delta[n]\\to h[n]$, also $\\delta[n-k]\\to h[n-k]$.',
 '<b>Homogeneity.</b> The number $x[k]$ does not depend on $n$, so $x[k]\\,\\delta[n-k]\\to x[k]\\,h[n-k]$.',
 '<b>Additivity.</b> The response to a sum is the sum of the responses.'
]},
{t:'p', text:'Write the three moves as one chain. Apply the system to the representation. Take the sum outside the system by additivity, take each weight outside by homogeneity, and replace each shifted impulse response by time invariance:'},
{t:'eq', tex:'\\begin{aligned}y[n]&=S\\Bigl\\{\\sum_{k=-\\infty}^{\\infty}x[k]\\,\\delta[n-k]\\Bigr\\}\\\\&=\\sum_{k=-\\infty}^{\\infty}S\\bigl\\{x[k]\\,\\delta[n-k]\\bigr\\}&&\\text{(additivity)}\\\\&=\\sum_{k=-\\infty}^{\\infty}x[k]\\,S\\bigl\\{\\delta[n-k]\\bigr\\}&&\\text{(homogeneity)}\\\\&=\\sum_{k=-\\infty}^{\\infty}x[k]\\,h[n-k]&&\\text{(time invariance).}\\end{aligned}'},
{t:'eqbox', cap:'Convolution sum', big:true, tex:'y[n]=\\sum_{k=-\\infty}^{\\infty}x[k]\\,h[n-k]\\;=\\;x[n]*h[n]', after:'The symbol $*$ denotes convolution.'},
{t:'box', kind:'err', html:'<span class="t">Check the system before using convolution</span>Convolution gives the system output only when the system is linear and time invariant. The derivation uses time invariance to shift $h$, and linearity to scale and add the responses. For a system that is linear but not time invariant, the step $\\delta[n-k]\\to h[n-k]$ fails, and $x*h$ is not its output.'},

{t:'h3', text:'Either signal can be flipped'},
{t:'p', text:'Replace the summation index by $m=n-k$, so $k=n-m$. As $k$ runs over all integers, $m$ also runs over all integers, only in the opposite direction. The sum has the same terms, so its value is unchanged:'},
{t:'eq', tex:'\\begin{aligned}\\sum_{k=-\\infty}^{\\infty}x[k]\\,h[n-k]&=\\sum_{m=-\\infty}^{\\infty}x[n-m]\\,h[n-(n-m)]\\\\&=\\sum_{m=-\\infty}^{\\infty}h[m]\\,x[n-m]\\;=\\;h[n]*x[n].\\end{aligned}'},
{t:'p', text:'So convolution is commutative, and either factor may be the reversed and shifted one. Choose the signal whose support gives the simpler limits. For example, take $x[n]=\\{1,2,1,2\\}$ on $n=0,\\dots,3$ and $h[n]=\\{1,\\,0.6,\\,0.3\\}$ on $n=0,1,2$, and evaluate both forms at $n=3$. In the first form $x[0]h[3]=0$, because $h[3]=0$:'},
{t:'eq', tex:'\\begin{aligned}\\sum_{k}x[k]\\,h[3-k]&=x[1]h[2]+x[2]h[1]+x[3]h[0]\\\\&=2(0.3)+1(0.6)+2(1)=3.2,\\\\\\sum_{m}h[m]\\,x[3-m]&=h[0]x[3]+h[1]x[2]+h[2]x[1]\\\\&=1(2)+0.6(1)+0.3(2)=3.2.\\end{aligned}'},
{t:'p', text:'The same pairs of samples meet in both sums. The second form also gives the effect of a shifted impulse at once. If $h[n]=\\delta[n-2]$, only the term $m=2$ survives:'},
{t:'eq', tex:'x[n]*\\delta[n-2]=\\sum_{m=-\\infty}^{\\infty}\\delta[m-2]\\,x[n-m]=x[n-2].'},
{t:'p', text:'Convolution with a shifted impulse shifts the signal.'},

{t:'h3', text:'Flip, shift, multiply, add'},
{t:'ol', items:[
 '<b>Flip.</b> Reverse $h[k]$ to get $h[-k]$.',
 '<b>Shift.</b> Move it by $n$ to get $h[n-k]$.',
 '<b>Multiply and add.</b> Form $x[k]\\,h[n-k]$ and sum over $k$.',
 'Repeat for every $n$.'
]},
{t:'p', text:'In $h[n-k]$ the variable is $k$, and $n$ is fixed. The sample $h[0]$ sits where $n-k=0$, that is at $k=n$. With $h=\\{1,\\,0.6,\\,0.3\\}$ and $n=3$, the sample $0.3=h[2]$ sits where $3-k=2$, that is at $k=1$.'},
{t:'box', kind:'err', html:'<span class="t">Do not skip the flip</span>Without the flip the sum is $\\sum_k x[k]\\,h[k-n]$. This is the cross-correlation of $x$ and $h$, not their convolution. A symmetric $h$ hides this error, because reversal does not change it. Use an asymmetric example to check the construction.'},
{t:'figrow', n:3, items:[
 {svg:()=>{const h=k=>(k>=0&&k<=2)?[1,0.6,0.3][k]:0;
   const a=sm({xr:[-5,7],yr:[-0.2,1.25],xlabel:'k',w:230,h:120,pad:{l:32,r:12,t:12,b:24},xtarget:3});
   a.stem(D(h,-5,7),{color:C.h,r:2.4,width:1.4}); return a.svg();}, cap:'$h[k]$'},
 {svg:()=>{const h=k=>(k>=0&&k<=2)?[1,0.6,0.3][k]:0;
   const a=sm({xr:[-5,7],yr:[-0.2,1.25],xlabel:'k',w:230,h:120,pad:{l:32,r:12,t:12,b:24},xtarget:3});
   a.stem(D(k=>h(-k),-5,7),{color:C.mid,r:2.4,width:1.4}); return a.svg();}, cap:'Flip: $h[-k]$'},
 {svg:()=>{const h=k=>(k>=0&&k<=2)?[1,0.6,0.3][k]:0;
   const a=sm({xr:[-5,7],yr:[-0.2,1.25],xlabel:'k',w:230,h:120,pad:{l:32,r:12,t:12,b:24},xtarget:3});
   a.stem(D(k=>h(3-k),-5,7),{color:C.out,r:2.4,width:1.4}); a.vline(3,{color:C.err}); return a.svg();},
  cap:'Shift: $h[3-k]$, with $h[0]$ at $k=3$'}
]},

{t:'ex', hd:'Example 3.1', rows:[
 ['Given','$x[n]=\\{1,2,1,2\\}$ on $n=0,1,2,3$, and $h[n]=\\{1,1\\}$ on $n=0,1$. Both are zero elsewhere.'],
 ['Find','$y[n]=x[n]*h[n]$.'],
 ['Method','Only four samples of $x$ are non-zero, so the convolution sum has four terms. Each term is a copy of $h$, delayed to one sample of $x$ and scaled by its value.'],
 ['Solution','Start from the convolution sum and keep the terms $k=0,1,2,3$: $$\\begin{aligned}y[n]&=\\sum_{k=-\\infty}^{\\infty}x[k]\\,h[n-k]\\\\&=x[0]h[n]+x[1]h[n-1]+x[2]h[n-2]+x[3]h[n-3]\\\\&=h[n]+2h[n-1]+h[n-2]+2h[n-3].\\end{aligned}$$ Now evaluate at each $n$. Since $h[m]=1$ only for $m=0$ and $m=1$, the factor $h[n-k]$ is non-zero only when $n-k=0$ or $n-k=1$. Keep only those terms: $$\\begin{aligned}y[0]&=x[0]h[0]=1\\cdot1=1,\\\\y[1]&=x[0]h[1]+x[1]h[0]=1\\cdot1+2\\cdot1=3,\\\\y[2]&=x[1]h[1]+x[2]h[0]=2\\cdot1+1\\cdot1=3,\\\\y[3]&=x[2]h[1]+x[3]h[0]=1\\cdot1+2\\cdot1=3,\\\\y[4]&=x[3]h[1]=2\\cdot1=2.\\end{aligned}$$ For $n<0$ and $n>4$ no term survives, so $y[n]=0$. The result is $y=\\{1,3,3,3,2\\}$ on $n=0,\\dots,4$.'],
 ['Check','The support must hold $4+2-1=5$ samples, from $0$ to $4$, which it does. The sums must multiply: $\\sum_n y[n]=1+3+3+3+2=12$, and $\\bigl(\\sum_n x[n]\\bigr)\\bigl(\\sum_n h[n]\\bigr)=6\\times2=12$. Also, $h=\\{1,1\\}$ is a two-point moving sum, so each output adds two neighbouring inputs: $1$, $1+2$, $2+1$, $1+2$, $2$.']
]},
{t:'figrow', items:[
 {svg:()=>{const a=sm({xr:[-1,6],yr:[-0.3,2.4],xlabel:'n',ylabel:'x[n]'});
   a.stem(D(n=>(n>=0&&n<=3)?[1,2,1,2][n]:0,-1,6),{color:C.in,r:2.6}); return a.svg();}, cap:'$x[n]$'},
 {svg:()=>{const a=sm({xr:[-1,6],yr:[-0.3,3.7],xlabel:'n',ylabel:'y[n]',ytarget:3});
   a.stem(D(n=>(n>=0&&n<=4)?[1,3,3,3,2][n]:0,-1,6),{color:C.out,r:2.6}); return a.svg();}, cap:'$y[n]=x[n]*h[n]$'}
]},

{t:'ex', hd:'Example 3.2', rows:[
 ['Given','$x[n]=\\left(\\tfrac12\\right)^{n}u[n]$ and $h[n]=u[n]$.'],
 ['Find','$y[n]=x[n]*h[n]$.'],
 ['Method','Use the supports to set the summation limits. $u[k]$ keeps only $k\\ge0$, and $u[n-k]$ keeps only $k\\le n$. The overlap changes when $n$ changes sign, so treat $n<0$ and $n\\ge0$ separately.'],
 ['Solution','Substitute the two signals into the convolution sum: $$y[n]=\\sum_{k=-\\infty}^{\\infty}x[k]\\,h[n-k]=\\sum_{k=-\\infty}^{\\infty}\\left(\\tfrac12\\right)^{k}u[k]\\,u[n-k].$$ The factor $u[k]$ is 1 only for $k\\ge0$. The factor $u[n-k]$ is 1 only for $n-k\\ge0$, that is for $k\\le n$. A term survives only when both hold.<br><b>Case 1, $n<0$.</b> No $k$ satisfies both $k\\ge0$ and $k\\le n<0$. No term survives, so $y[n]=0$.<br><b>Case 2, $n\\ge0$.</b> The surviving terms are $0\\le k\\le n$, and on this range both steps equal 1: $$y[n]=\\sum_{k=0}^{n}\\left(\\tfrac12\\right)^{k}.$$ This is a finite geometric sum with first term 1, ratio $r=\\tfrac12$ and $n+1$ terms. Apply the formula in the box below with $a=1$ and $m=0$: $$\\begin{aligned}y[n]&=\\frac{1-\\left(\\tfrac12\\right)^{n+1}}{1-\\tfrac12}\\\\&=\\frac{1-\\left(\\tfrac12\\right)^{n+1}}{\\tfrac12}\\\\&=2-2\\left(\\tfrac12\\right)^{n+1}\\\\&=2-\\left(\\tfrac12\\right)^{n}.\\end{aligned}$$ The last line uses $2\\left(\\tfrac12\\right)^{n+1}=\\left(\\tfrac12\\right)^{n}$: the factor 2 cancels one factor of $\\tfrac12$.<br>Together, $y[n]=\\left(2-\\left(\\tfrac12\\right)^{n}\\right)u[n]$.'],
 ['Check','At $n=0$ the formula gives $2-1=1$, and direct substitution gives $x[0]h[0]=1\\cdot1=1$. As $n\\to\\infty$, $y[n]\\to2$, the total sum of the input: $\\sum_{k\\ge0}\\left(\\tfrac12\\right)^{k}=1/(1-\\tfrac12)=2$. This fits $h[n]=u[n]$, which forms the running sum of its input.']
]},
{t:'box', html:'<span class="t">Geometric sum</span>$\\displaystyle\\sum_{k=m}^{n}a\\,r^{k}=\\frac{a\\bigl(r^{m}-r^{n+1}\\bigr)}{1-r}$. The finite sum needs only $r\\neq1$. The condition $|r|<1$ is needed only when the sum runs to infinity.'},
{t:'box', kind:'warn', html:'<span class="t">The accumulator</span>In Example 3.2 the input has a finite sum, so the output stays bounded. The accumulator $h[n]=u[n]$ is still not BIBO stable: Example 2.6 gave it the bounded input $u[n]$ and an unbounded output.'},

{t:'h2', num:'3.3', text:'The convolution integral'},
{t:'p', text:'The continuous-time derivation has the same purpose and uses the same three LTI moves. First, the sifting property represents $x$ as a continuum of weighted impulses:'},
{t:'eq', tex:'x(t)=\\int_{-\\infty}^{\\infty}x(\\tau)\\,\\delta(t-\\tau)\\,\\d\\tau.'},
{t:'p', text:'This form comes from the sifting property of Chapter 1, $x(t_0)=\\int x(t)\\,\\delta(t-t_0)\\,\\d t$. Rename the integration variable $t$ as $\\tau$, and the instant $t_0$ as $t$. This gives $x(t)=\\int x(\\tau)\\,\\delta(\\tau-t)\\,\\d\\tau$. The impulse is even, $\\delta(\\tau-t)=\\delta(t-\\tau)$, which gives the form above.'},
{t:'h3', text:'Pulses of width $\\Delta$'},
{t:'p', text:'A staircase shows where the continuum of impulses comes from. Let $\\delta_\\Delta(t)$ be a pulse of height $1/\\Delta$ on $0\\le t<\\Delta$, so its area is 1. On the interval $k\\Delta\\le t<(k+1)\\Delta$, the staircase below keeps only its term $k$, which equals $x(k\\Delta)\\cdot\\frac{1}{\\Delta}\\cdot\\Delta=x(k\\Delta)$:'},
{t:'eq', tex:'\\hat{x}(t)=\\sum_{k=-\\infty}^{\\infty}x(k\\Delta)\\,\\delta_\\Delta(t-k\\Delta)\\,\\Delta.'},
{t:'p', text:'Each pulse has area $x(k\\Delta)\\,\\Delta$. Let $\\hat{h}_\\Delta(t)$ be the response of the system to $\\delta_\\Delta(t)$. Time invariance and linearity give the response to the staircase. As $\\Delta\\to0$, $k\\Delta$ becomes the continuous variable $\\tau$, $\\Delta$ becomes $\\d\\tau$, the pulse becomes the impulse, $\\hat{h}_\\Delta$ becomes $h$, and the sum becomes an integral:'},
{t:'eq', tex:'\\hat{y}(t)=\\sum_{k=-\\infty}^{\\infty}x(k\\Delta)\\,\\hat{h}_\\Delta(t-k\\Delta)\\,\\Delta\\;\\xrightarrow{\\;\\Delta\\to0\\;}\\;\\int_{-\\infty}^{\\infty}x(\\tau)\\,h(t-\\tau)\\,\\d\\tau.'},
{t:'figrow', items:[1,0.25].map(Dl=>({svg:()=>{
   const x=t=>t>0?2.2*t*Math.exp(-t):0;
   const a=sm({xr:[-1,7],yr:[-0.1,1.05],xlabel:'\\tau',ylabel:'x(\\tau)',xtarget:7,ytarget:2});
   const pts=[[0,0]]; for(let t=0;t<7-1e-9;t+=Dl){ a.rect(t,0,Math.min(t+Dl,7),x(t),{fill:'rgba(106,90,146,.16)'}); pts.push([t,x(t)],[Math.min(t+Dl,7),x(t)]); }
   pts.push([7,0]); a.poly(pts,{color:C.mid,width:1.4}); a.curve(x,{color:C.in,n:900}); return a.svg();},
  cap:Dl===1?'Pulses of width $\\Delta=1$.':'Pulses of width $\\Delta=0.25$: the staircase follows $x(\\tau)$ closely.'}))},
{t:'p', text:'The direct derivation applies the system to the sifting form. Additivity takes the integral outside the system, because an integral is a limit of sums. Homogeneity takes the weight $x(\\tau)\\,\\d\\tau$ outside, because it does not depend on $t$. Time invariance replaces $S\\{\\delta(t-\\tau)\\}$ by $h(t-\\tau)$:'},
{t:'eq', tex:'\\begin{aligned}y(t)&=S\\Bigl\\{\\int_{-\\infty}^{\\infty}x(\\tau)\\,\\delta(t-\\tau)\\,\\d\\tau\\Bigr\\}\\\\&=\\int_{-\\infty}^{\\infty}x(\\tau)\\,S\\bigl\\{\\delta(t-\\tau)\\bigr\\}\\,\\d\\tau&&\\text{(additivity, homogeneity)}\\\\&=\\int_{-\\infty}^{\\infty}x(\\tau)\\,h(t-\\tau)\\,\\d\\tau&&\\text{(time invariance).}\\end{aligned}'},
{t:'eqbox', cap:'Convolution integral', big:true,
 tex:['y(t)=\\int_{-\\infty}^{\\infty}x(\\tau)\\,h(t-\\tau)\\,\\d\\tau\\;=\\;x(t)*h(t)',
      'y(t)=\\int_{-\\infty}^{\\infty}h(\\tau)\\,x(t-\\tau)\\,\\d\\tau'],
 after:'The two forms are equal. Choose the form that makes the support conditions easier to write.'},
{t:'p', text:'To pass from the first form to the second, substitute $\\sigma=t-\\tau$. Then $\\tau=t-\\sigma$ and $\\d\\tau=-\\d\\sigma$. As $\\tau$ goes from $-\\infty$ to $+\\infty$, $\\sigma$ goes from $+\\infty$ to $-\\infty$. Swapping the limits back removes the minus sign:'},
{t:'eq', tex:'\\begin{aligned}\\int_{-\\infty}^{\\infty}x(\\tau)\\,h(t-\\tau)\\,\\d\\tau&=\\int_{+\\infty}^{-\\infty}x(t-\\sigma)\\,h(\\sigma)\\,(-\\d\\sigma)\\\\&=\\int_{-\\infty}^{\\infty}h(\\sigma)\\,x(t-\\sigma)\\,\\d\\sigma.\\end{aligned}'},
{t:'p', text:'The name of the integration variable does not matter, so $\\sigma$ can be written as $\\tau$ again. This is the second form, and it shows that $x*h=h*x$.'},
{t:'p', text:'A shifted impulse again gives a shift. If $h(t)=\\delta(t-2)$, the impulse $\\delta(t-\\tau-2)$ sits where $t-\\tau-2=0$, that is at $\\tau=t-2$, and sifting keeps the value of $x$ there:'},
{t:'eq', tex:'x(t)*\\delta(t-2)=\\int_{-\\infty}^{\\infty}x(\\tau)\\,\\delta(t-\\tau-2)\\,\\d\\tau=x(t-2).'},
{t:'box', kind:'warn', html:'<span class="t">Shift, then reverse</span>Build a reversed and shifted signal in a fixed order: apply the shift before the reversal. For $\\delta(-t+5)$, first form $v(t)=\\delta(t+5)$, an impulse at $t=-5$. Then form $v(-t)=\\delta(-t+5)$, which moves it to $t=+5$. An impulse sits where its argument is zero, so $\\delta(3-t)$ sits at $t=3$. Writing both moves prevents a sign error in the integration limits.'},

{t:'ex', hd:'Example 3.3', rows:[
 ['Given','$x(t)=e^{2t}u(-t)$ and $h(t)=u(t-3)$.'],
 ['Find','$y(t)=x(t)*h(t)$.'],
 ['Method','Use the two support conditions to set the integration limit. $x(\\tau)$ is non-zero for $\\tau\\le0$, and $h(t-\\tau)=u(t-\\tau-3)$ is non-zero for $\\tau\\le t-3$. The overlap ends at $\\min(0,\\,t-3)$, so the upper limit changes at $t=3$.'],
 ['Solution','Substitute the two signals into the convolution integral: $$y(t)=\\int_{-\\infty}^{\\infty}x(\\tau)\\,h(t-\\tau)\\,\\d\\tau=\\int_{-\\infty}^{\\infty}e^{2\\tau}u(-\\tau)\\,u(t-\\tau-3)\\,\\d\\tau.$$ The factor $u(-\\tau)$ is 1 only for $\\tau\\le0$. The factor $u(t-\\tau-3)$ is 1 only for $t-\\tau-3\\ge0$, that is for $\\tau\\le t-3$. Both must hold, so the integrand is $e^{2\\tau}$ for $\\tau\\le\\min(0,\\,t-3)$ and zero elsewhere. The antiderivative of $e^{2\\tau}$ is $\\tfrac12e^{2\\tau}$, and $e^{2\\tau}\\to0$ as $\\tau\\to-\\infty$, so the lower limit contributes zero.<br><b>Case 1, $t<3$.</b> Here $t-3<0$, so the upper limit is $t-3$: $$\\begin{aligned}y(t)&=\\int_{-\\infty}^{t-3}e^{2\\tau}\\,\\d\\tau\\\\&=\\Bigl[\\tfrac12e^{2\\tau}\\Bigr]_{-\\infty}^{t-3}\\\\&=\\tfrac12e^{2(t-3)}-0=\\tfrac12e^{2(t-3)}.\\end{aligned}$$ <b>Case 2, $t>3$.</b> Here $t-3>0$, so the upper limit is 0 and the whole of $x$ is covered: $$\\begin{aligned}y(t)&=\\int_{-\\infty}^{0}e^{2\\tau}\\,\\d\\tau\\\\&=\\Bigl[\\tfrac12e^{2\\tau}\\Bigr]_{-\\infty}^{0}\\\\&=\\tfrac12e^{0}-0=\\tfrac12.\\end{aligned}$$ Together, $y(t)=\\tfrac12e^{2(t-3)}$ for $t<3$ and $y(t)=\\tfrac12$ for $t>3$.'],
 ['Check','At $t=3$ the first branch gives $\\tfrac12e^{0}=\\tfrac12$, the value of the second, so the branches join continuously. The final value is the area of $x$, $\\int_{-\\infty}^{0}e^{2\\tau}\\,\\d\\tau=\\tfrac12$. This fits the system: the delayed step adds up the area of $x$ until $t-3$, and after $t=3$ it holds all of it.']
]},
{t:'figrow', items:[
 {svg:()=>{const a=sm({xr:[-6,8],yr:[-0.1,1.2],xlabel:'\\tau',ylabel:'\\text{amplitude}'});
   const t=1.2; a.area(x=>x<=Math.min(0,t-3)?Math.exp(2*x):0,-6,Math.min(0,t-3),{color:'rgba(20,112,127,.2)'});
   a.curve(x=>x<=0?Math.exp(2*x):0,{color:C.in}); a.curve(x=>x<=t-3?1:0,{color:C.h});
   a.vline(t-3,{color:C.err}); return a.svg();}, cap:'Case 1, $t<3$: $x(\\tau)$ and $h(t-\\tau)$. The shaded area is $y(t)$.'},
 {svg:()=>{const a=sm({xr:[-1,7],yr:[-0.05,0.62],xlabel:'t',ylabel:'y(t)',ytarget:3});
   a.curve(t=>t<3?0.5*Math.exp(2*(t-3)):0.5,{color:C.out}); a.point(3,0.5,{color:C.err}); return a.svg();},
  cap:'The result $y(t)$, continuous at $t=3$.'}
]},

{t:'ex', hd:'Example 3.4', rows:[
 ['Given','$x(t)=1$ on $0<t<1$ and zero elsewhere. $h(t)=t$ on $0<t<2$ and zero elsewhere.'],
 ['Find','$y(t)=x(t)*h(t)$.'],
 ['Method','Use $y(t)=\\int h(\\tau)\\,x(t-\\tau)\\,\\d\\tau$. This form reverses the rectangle, whose constant height makes the overlap easy to read. Its support becomes the window $t-1<\\tau<t$, of width 1, which moves across the ramp on $0<\\tau<2$.'],
 ['Solution','Substitute into the chosen form: $$y(t)=\\int_{-\\infty}^{\\infty}h(\\tau)\\,x(t-\\tau)\\,\\d\\tau.$$ Here $h(\\tau)=\\tau$ for $0<\\tau<2$. The factor $x(t-\\tau)$ equals 1 when $0<t-\\tau<1$. Solve this pair of inequalities for $\\tau$: subtract $t$ to get $-t<-\\tau<1-t$, then multiply by $-1$, which reverses both inequalities: $t-1<\\tau<t$. So the integrand is $\\tau$ on the overlap of $0<\\tau<2$ with $t-1<\\tau<t$, and zero elsewhere.<br>The window has the moving edges $t-1$ and $t$. The ramp has the fixed edges $0$ and $2$. Set each moving edge equal to each fixed edge: $t-1=0$, $t-1=2$, $t=0$ and $t=2$. This gives $t=0,1,2,3$, which divide the calculation into five cases. In every case the antiderivative of $\\tau$ is $\\tfrac12\\tau^{2}$.<br><b>$t<0$:</b> the window lies left of the ramp. There is no overlap, so $y=0$.<br><b>$0<t<1$:</b> the left edge $t-1$ is below 0, so the overlap is $0<\\tau<t$: $$y(t)=\\int_{0}^{t}\\tau\\,\\d\\tau=\\Bigl[\\tfrac12\\tau^{2}\\Bigr]_{0}^{t}=\\tfrac12t^{2}-0=\\tfrac12t^{2}.$$ <b>$1<t<2$:</b> the whole window lies on the ramp, so the overlap is $t-1<\\tau<t$: $$\\begin{aligned}y(t)&=\\int_{t-1}^{t}\\tau\\,\\d\\tau=\\Bigl[\\tfrac12\\tau^{2}\\Bigr]_{t-1}^{t}\\\\&=\\tfrac12t^{2}-\\tfrac12(t-1)^{2}\\\\&=\\tfrac12t^{2}-\\tfrac12\\bigl(t^{2}-2t+1\\bigr)\\\\&=t-\\tfrac12.\\end{aligned}$$ <b>$2<t<3$:</b> the right edge $t$ is past 2, so the overlap is $t-1<\\tau<2$: $$\\begin{aligned}y(t)&=\\int_{t-1}^{2}\\tau\\,\\d\\tau=\\Bigl[\\tfrac12\\tau^{2}\\Bigr]_{t-1}^{2}\\\\&=\\tfrac12\\cdot4-\\tfrac12(t-1)^{2}\\\\&=2-\\tfrac12\\bigl(t^{2}-2t+1\\bigr)\\\\&=-\\tfrac12t^{2}+t+\\tfrac32.\\end{aligned}$$ <b>$t>3$:</b> the window lies right of the ramp. There is no overlap, so $y=0$.'],
 ['Check','<b>Continuity.</b> At $t=1$: $\\tfrac12\\cdot1^{2}=\\tfrac12$ and $1-\\tfrac12=\\tfrac12$. At $t=2$: $2-\\tfrac12=\\tfrac32$ and $-\\tfrac12\\cdot4+2+\\tfrac32=\\tfrac32$. At $t=3$: $-\\tfrac12\\cdot9+3+\\tfrac32=0$. Every pair of branches agrees. <b>Support.</b> The supports $[0,1]$ and $[0,2]$ add to $[0,3]$. <b>Area.</b> The areas must multiply: $\\int y=\\bigl(\\int x\\bigr)\\bigl(\\int h\\bigr)=1\\times2=2$. Integrate each branch: $$\\begin{aligned}\\int_{0}^{1}\\tfrac12t^{2}\\,\\d t&=\\Bigl[\\tfrac16t^{3}\\Bigr]_{0}^{1}=\\tfrac16,\\\\\\int_{1}^{2}\\bigl(t-\\tfrac12\\bigr)\\,\\d t&=\\Bigl[\\tfrac12t^{2}-\\tfrac12t\\Bigr]_{1}^{2}=(2-1)-\\bigl(\\tfrac12-\\tfrac12\\bigr)=1,\\\\\\int_{2}^{3}\\bigl(-\\tfrac12t^{2}+t+\\tfrac32\\bigr)\\,\\d t&=\\Bigl[-\\tfrac16t^{3}+\\tfrac12t^{2}+\\tfrac32t\\Bigr]_{2}^{3}\\\\&=\\bigl(-\\tfrac{27}{6}+\\tfrac92+\\tfrac92\\bigr)-\\bigl(-\\tfrac86+2+3\\bigr)=\\tfrac92-\\tfrac{11}{3}=\\tfrac56.\\end{aligned}$$ The total is $\\tfrac16+1+\\tfrac56=2$, as required.']
]},
{t:'box', kind:'ok', html:'<span class="t">Find the boundaries before integrating</span>List the moving edges and the fixed edges, then set each moving edge equal to each fixed edge. The resulting values divide the calculation into all the cases it needs.'},
{t:'figrow', n:3, items:[
 [0.6,'$0<t<1$'],[1.5,'$1<t<2$'],[2.5,'$2<t<3$']
].map(([tv,lab])=>({svg:()=>{
   const a=sm({xr:[-1.2,3.6],yr:[-0.15,2.3],xlabel:'\\tau',w:230,h:125,pad:{l:32,r:12,t:12,b:24},xtarget:3});
   const lo=Math.max(0,tv-1), hi=Math.min(2,tv);
   if(hi>lo) a.area(x=>x,lo,hi,{color:'rgba(169,80,47,.2)'});
   a.curve(x=>(x>0&&x<2)?x:0,{color:C.h}); a.curve(x=>(x>tv-1&&x<tv)?1:0,{color:C.in});
   return a.svg();}, cap:lab})) },
{t:'fig', svg:()=>{const a=ax({xr:[-0.5,3.5],yr:[-0.12,1.75],xlabel:'t',ylabel:'y(t)',h:170,pad:{l:48,r:20,t:14,b:30},xtarget:5,ytarget:3});
  a.curve(t=> t<0?0 : t<1?0.5*t*t : t<2?t-0.5 : t<3?(-0.5*t*t+t+1.5) : 0,{color:C.out,n:1400});
  [1,2,3].forEach(b=>a.vline(b,{color:C.muted,opacity:.5})); a.point(2,1.5,{color:C.err}); return a.svg();},
 cap:'The complete result. The peak is $1.5$ at $t=2$. A unit-width rectangle adds up one second of the input, so the output rises while the window fills and falls as it leaves the ramp.'},

{t:'h3', text:'A convolution checklist'},
{t:'ol', items:[
 'Confirm that the system is linear and time invariant. Convolution gives the system output only under this condition.',
 'Choose the factor whose reversal gives the simpler support conditions.',
 'Write the support of each factor as an inequality in the dummy variable.',
 'Set each moving edge equal to each fixed edge to list every case boundary, before integrating anything.',
 'Integrate or sum, case by case.',
 'Check continuity at every boundary, check that the supports add, and check that the total areas or sums multiply.'
]},
{t:'box', kind:'ok', html:'<span class="t">What each check finds</span>A mismatch at a case boundary points to a wrong limit. A wrong output support points to an error in a shift, a reversal or a support condition. A wrong total area or sum points to an error in the integrand or the summand.'},

{t:'h2', num:'3.4', text:'Properties of convolution'},
{t:'table', head:['Property','Statement','What it means for interconnections'], rows:[
 ['Commutative','$x*h=h*x$','The input and the impulse response play the same role in the algebra.'],
 ['Distributive','$x*(h_1+h_2)=x*h_1+x*h_2$','Two systems in <b>parallel</b>, outputs added, act as one system with impulse response $h_1+h_2$.'],
 ['Associative','$x*(h_1*h_2)=(x*h_1)*h_2$','Two systems in <b>cascade</b> act as one system with impulse response $h_1*h_2$.']
]},
{t:'p', text:'Commutativity was derived in Sections 3.2 and 3.3 by a change of variable. The distributive property follows because a sum of two sequences can be split term by term:'},
{t:'eq', tex:'\\begin{aligned}\\bigl(x*(h_1+h_2)\\bigr)[n]&=\\sum_{k=-\\infty}^{\\infty}x[k]\\bigl(h_1[n-k]+h_2[n-k]\\bigr)\\\\&=\\sum_{k=-\\infty}^{\\infty}x[k]\\,h_1[n-k]+\\sum_{k=-\\infty}^{\\infty}x[k]\\,h_2[n-k]\\\\&=(x*h_1)[n]+(x*h_2)[n].\\end{aligned}'},
{t:'p', text:'So parallel paths add their impulse responses. For example, $h_1[n]=\\delta[n]$ and $h_2[n]=\\delta[n-1]$ in parallel act as one system with $h[n]=\\delta[n]+\\delta[n-1]$. The same steps with integrals in place of sums give the continuous-time result.'},
{t:'fig', svg:()=>P.blocks({w:900,h:150,items:[
  {t:'text',x:215,y:22,label:'parallel',fs:13,color:C.slate},
  {t:'arrow',x1:20,y1:85,x2:90,y2:85},{t:'line',d:'M90 85 V50 H130 M90 85 V120 H130'},
  {t:'box',x:130,y:30,w:100,h:40,label:'h_1',tex:true},{t:'box',x:130,y:100,w:100,h:40,label:'h_2',tex:true},
  {t:'line',d:'M230 50 H300 V71 M230 120 H300 V99'},{t:'sum',x:300,y:85},{t:'arrow',x1:314,y1:85,x2:390,y2:85},
  {t:'text',x:420,y:92,label:'\\equiv',tex:true,fs:22},
  {t:'arrow',x1:450,y1:85,x2:530,y2:85},{t:'box',x:530,y:62,w:130,h:46,label:'h_1+h_2',tex:true},{t:'arrow',x1:660,y1:85,x2:740,y2:85},
  {t:'text',x:50,y:71,label:'x',tex:true,fs:16},{t:'text',x:360,y:71,label:'y',tex:true,fs:16},
  {t:'text',x:490,y:71,label:'x',tex:true,fs:16},{t:'text',x:700,y:71,label:'y',tex:true,fs:16}
]}).replace(/<\/svg>\s*$/,`<path d="M300,71 l-4.5,-9 h9 Z" fill="${C.ink}"/><path d="M300,99 l-4.5,9 h9 Z" fill="${C.ink}"/></svg>`),
 cap:'Two systems in parallel, with their outputs added, act as one system with impulse response $h_1+h_2$.'},
{t:'p', text:'For the associative property, write the cascade $(x*h_1)*h_2$ as a double sum, exchange the order of the two sums, and change the inner index. Let $w=x*h_1$ be the output of the first system. The inner sum over $m$ uses the substitution $p=m-k$, so $m=p+k$ and $n-m=(n-k)-p$:'},
{t:'eq', tex:'\\begin{aligned}\\bigl((x*h_1)*h_2\\bigr)[n]&=\\sum_{m=-\\infty}^{\\infty}w[m]\\,h_2[n-m]\\\\&=\\sum_{m=-\\infty}^{\\infty}\\Bigl(\\sum_{k=-\\infty}^{\\infty}x[k]\\,h_1[m-k]\\Bigr)h_2[n-m]\\\\&=\\sum_{k=-\\infty}^{\\infty}x[k]\\sum_{m=-\\infty}^{\\infty}h_1[m-k]\\,h_2[n-m]\\\\&=\\sum_{k=-\\infty}^{\\infty}x[k]\\sum_{p=-\\infty}^{\\infty}h_1[p]\\,h_2[(n-k)-p]\\\\&=\\sum_{k=-\\infty}^{\\infty}x[k]\\,(h_1*h_2)[n-k]\\\\&=\\bigl(x*(h_1*h_2)\\bigr)[n].\\end{aligned}'},
{t:'p', text:'The third line moves $x[k]$ outside the sum over $m$, because $x[k]$ does not depend on $m$. The fifth line recognises the inner sum as the convolution $h_1*h_2$ evaluated at $n-k$. Exchanging the two sums is allowed when the double sum converges absolutely, which holds for finite-length or absolutely summable sequences.'},
{t:'p', text:'With commutativity, associativity shows that the order of two LTI systems in cascade does not change the combined impulse response.'},
{t:'box', kind:'err', html:'<span class="t">LTI systems only</span>Reordering a cascade needs both systems to be linear and time invariant. A saturating amplifier followed by a filter is in general not the same system as the filter followed by the amplifier.'},

{t:'h3', text:'Inverse systems'},
{t:'p', text:'An LTI system with impulse response $g$ is the inverse of the system with impulse response $h$ when the cascade returns its input unchanged. The identity system has impulse response $\\delta$, so the condition is'},
{t:'eq', tex:'h*g=\\delta.'},
{t:'ex', hd:'Example 3.5', rows:[
 ['Given','$h_1[n]=\\delta[n]-\\delta[n-1]$ and $h_2[n]=u[n]$ are connected in cascade.'],
 ['Find','The impulse response $h_1*h_2$ of the cascade.'],
 ['Method','Distribute the convolution over the two impulses of $h_1$. Convolution with $\\delta[n-n_0]$ shifts a signal by $n_0$ (Section 3.2).'],
 ['Solution','$$\\begin{aligned}h_1*h_2&=\\bigl(\\delta[n]-\\delta[n-1]\\bigr)*u[n]\\\\&=\\delta[n]*u[n]-\\delta[n-1]*u[n]\\\\&=u[n]-u[n-1].\\end{aligned}$$ Evaluate the difference region by region. For $n<0$ both steps are 0. At $n=0$ it is $1-0=1$. For $n\\ge1$ it is $1-1=0$. So $h_1*h_2=\\delta[n]$: the two systems are inverses of each other.'],
 ['Check','$h_2$ is the accumulator and $h_1$ is the first difference, and Section 2.2 showed that the first difference undoes the accumulator.']
]},

{t:'h3', text:'System properties from the impulse response'},
{t:'p', text:'For an LTI system, each property test of Chapter 2 becomes a test on $h$.'},
{t:'table', head:['Property','Criterion','Reason'], rows:[
 ['Memoryless','$h[n]=a\\,\\delta[n]$, or $h(t)=a\\,\\delta(t)$','Then $y[n]=a\\,x[n]$, a pure gain.'],
 ['Invertible','$h*g=\\delta$ for some $g$','$g$ is the impulse response of the inverse system.'],
 ['Causal','$h[n]=0$ for $n<0$, or $h(t)=0$ for $t<0$','The output uses only present and past inputs.'],
 ['BIBO stable','$\\sum_k|h[k]|<\\infty$, or $\\int|h(t)|\\,\\d t<\\infty$','See the proof below.']
]},
{t:'p', text:'<b>Memoryless.</b> Substitute $h[n-k]=a\\,\\delta[n-k]$ into the convolution sum. The impulse keeps only the term $k=n$:'},
{t:'eq', tex:'\\begin{aligned}y[n]&=\\sum_{k=-\\infty}^{\\infty}x[k]\\,a\\,\\delta[n-k]\\\\&=a\\sum_{k=-\\infty}^{\\infty}x[k]\\,\\delta[n-k]\\\\&=a\\,x[n].\\end{aligned}'},
{t:'p', text:'A non-zero value of $h$ at some $n\\neq0$ would make the output read the input at another time.'},
{t:'p', text:'<b>Causal.</b> Use the second form of the sum, $y[n]=\\sum_k h[k]\\,x[n-k]$. If $h[k]=0$ for $k<0$, every term with a negative $k$ vanishes and the sum starts at $k=0$:'},
{t:'eq', tex:'\\begin{aligned}y[n]&=\\sum_{k=-\\infty}^{\\infty}h[k]\\,x[n-k]\\\\&=\\sum_{k=0}^{\\infty}h[k]\\,x[n-k]\\\\&=h[0]x[n]+h[1]x[n-1]+h[2]x[n-2]+\\cdots\\end{aligned}'},
{t:'p', text:'Every input index $n-k$ with $k\\ge0$ satisfies $n-k\\le n$, so the output uses only present and past inputs. For example, $h[n]=\\delta[n+1]$ has $h[-1]=1\\neq0$, and its output is $y[n]=x[n+1]$, a future sample. That system is not causal.'},
{t:'p', text:'<b>Stable, sufficiency.</b> Assume $|x[n]|\\le B$ for all $n$. Take the modulus of the convolution sum, apply the triangle inequality, and then use the input bound on every term:'},
{t:'eq', tex:'\\begin{aligned}\\bigl|y[n]\\bigr|&=\\Bigl|\\sum_{k=-\\infty}^{\\infty}h[k]\\,x[n-k]\\Bigr|\\\\&\\le\\sum_{k=-\\infty}^{\\infty}\\bigl|h[k]\\bigr|\\,\\bigl|x[n-k]\\bigr|&&\\text{(triangle inequality)}\\\\&\\le\\sum_{k=-\\infty}^{\\infty}\\bigl|h[k]\\bigr|\\,B&&\\text{(since }|x[n-k]|\\le B)\\\\&=B\\sum_{k=-\\infty}^{\\infty}\\bigl|h[k]\\bigr|<\\infty.\\end{aligned}'},
{t:'p', text:'An absolutely summable $h[n]$ therefore maps every bounded input to a bounded output. The bound $B\\sum_k|h[k]|$ does not depend on $n$. For example, $h[n]=\\left(-\\tfrac12\\right)^{n}u[n]$ gives the geometric sum $\\sum_{n\\ge0}\\left(\\tfrac12\\right)^{n}=1/(1-\\tfrac12)=2<\\infty$, so that system is stable.'},
{t:'p', text:'<b>Stable, necessity.</b> Suppose instead that $\\sum_k|h[k]|$ is infinite. Choose the input $x[n]=\\operatorname{sgn}h[-n]$, where $\\operatorname{sgn}$ is $+1$ for a positive argument, $-1$ for a negative one and $0$ at zero. This input is bounded, because $|x[n]|\\le1$. Evaluate the output at $n=0$. Since $x[-k]=\\operatorname{sgn}h[k]$, and a number times its own sign is its modulus:'},
{t:'eq', tex:'\\begin{aligned}y[0]&=\\sum_{k=-\\infty}^{\\infty}h[k]\\,x[0-k]\\\\&=\\sum_{k=-\\infty}^{\\infty}h[k]\\operatorname{sgn}h[k]\\\\&=\\sum_{k=-\\infty}^{\\infty}\\bigl|h[k]\\bigr|\\to\\infty.\\end{aligned}'},
{t:'p', text:'A bounded input gives an unbounded output, so the system is not stable. Absolute summability is therefore also necessary. The same input reaches the sum when it is finite. For $h[n]=(-0.8)^{n}u[n]$, the input $x[n]=\\operatorname{sgn}h[-n]$ is $(-1)^{n}$ for $n\\le0$ and 0 for $n>0$, and'},
{t:'eq', tex:'y[0]=\\sum_{k=0}^{\\infty}(-0.8)^{k}(-1)^{k}=\\sum_{k=0}^{\\infty}0.8^{k}=\\frac{1}{1-0.8}=5.'},
{t:'figrow', items:[
 {svg:()=>{const a=sm({xr:[-2,10],yr:[-0.2,1.2],xlabel:'n',ylabel:'h[n]'});
   a.stem(D(n=>n>=0?Math.pow(0.7,n):0,-2,10),{color:C.out,r:2.4}); return a.svg();},
  cap:'$h[n]=0.7^{\\,n}u[n]$. Here $\\sum_n|h[n]|=\\sum_{n=0}^{\\infty}0.7^{\\,n}=\\frac{1}{1-0.7}=\\frac{10}{3}<\\infty$: stable and causal.'},
 {svg:()=>{const a=sm({xr:[-2,10],yr:[-0.2,1.2],xlabel:'n',ylabel:'h[n]'});
   a.stem(D(n=>n>=0?1:0,-2,10),{color:C.err,r:2.4}); return a.svg();},
  cap:'$h[n]=u[n]$, the accumulator. Here $\\sum_n|h[n]|$ diverges: causal but not stable.'}
]},

{t:'h3', text:'The step response'},
{t:'p', text:'The <b>step response</b> $s$ is the output of an LTI system when the input is the unit step. By the convolution integral, $s=h*u$. The factor $u(t-\\tau)$ is 1 for $\\tau<t$ and 0 for $\\tau>t$, so it cuts the integral off at $\\tau=t$:'},
{t:'eq', tex:'\\begin{aligned}s(t)&=\\int_{-\\infty}^{\\infty}h(\\tau)\\,u(t-\\tau)\\,\\d\\tau\\\\&=\\int_{-\\infty}^{t}h(\\tau)\\,\\d\\tau.\\end{aligned}'},
{t:'p', text:'The step response is the running integral of $h$: its value at $t$ is the area of $h$ up to $t$. In discrete time, $u[n-k]$ is 1 for $k\\le n$, and the step response is the running sum of $h$:'},
{t:'eq', tex:'\\begin{aligned}s[n]&=\\sum_{k=-\\infty}^{\\infty}h[k]\\,u[n-k]\\\\&=\\sum_{k=-\\infty}^{n}h[k].\\end{aligned}'},
{t:'p', text:'Both operations can be undone. The derivative of a running integral is its integrand, and a first difference removes all but the last term of a running sum:'},
{t:'eq', tex:'\\begin{aligned}\\frac{\\d s(t)}{\\d t}&=\\frac{\\d}{\\d t}\\int_{-\\infty}^{t}h(\\tau)\\,\\d\\tau=h(t),\\\\s[n]-s[n-1]&=\\sum_{k=-\\infty}^{n}h[k]-\\sum_{k=-\\infty}^{n-1}h[k]=h[n].\\end{aligned}'},
{t:'p', text:'A step is easier to apply than an impulse, so $h$ is often measured this way: record the step response, then differentiate it or take its first difference.'},
{t:'p', text:'For example, let $h(t)=e^{-t}u(t)$. For $t<0$ the running integral covers no part of $h$, so $s(t)=0$. For $t>0$, integrate from 0 to $t$ with the antiderivative $-e^{-\\tau}$:'},
{t:'eq', tex:'\\begin{aligned}s(t)&=\\int_{0}^{t}e^{-\\tau}\\,\\d\\tau\\\\&=\\Bigl[-e^{-\\tau}\\Bigr]_{0}^{t}\\\\&=-e^{-t}-(-1)=1-e^{-t}.\\end{aligned}'},
{t:'p', text:'The derivative of $1-e^{-t}$ is $e^{-t}$, which returns $h(t)$ for $t>0$. The final value, 1, is the total area of $h$.'},
{t:'fig', svg:()=>{const t=1, h=z=>z>=0?Math.exp(-z):0, s=z=>z>=0?1-Math.exp(-z):0;
  const a=ax({xr:[-1,4.5],yr:[-0.1,1.3],xlabel:'t',ylabel:'\\text{amplitude}',h:180,pad:{l:50,r:20,t:14,b:32},xtarget:6,ytarget:3});
  a.area(h,0,t,{color:'rgba(74,122,70,.22)'}); a.curve(h,{color:C.h,n:1200}); a.curve(s,{color:C.out,n:1200});
  a.vline(t,{color:C.coral,dash:'4 4'}); a.point(t,s(t),{color:C.out});
  a.note(2.4,0.22,'h(t)=e^{-t}u(t)',{tex:true,color:C.h,fs:14}); a.note(2.4,1.08,'s(t)=1-e^{-t}',{tex:true,color:C.out,fs:14});
  return a.svg();},
 cap:'The shaded area under $h$ from 0 to $t=1$ is the height of $s(1)=1-e^{-1}$.'},
{t:'ex', hd:'Example 3.6', rows:[
 ['Given','$h[n]=\\delta[n]-\\delta[n-2]$.'],
 ['Find','The step response $s[n]$.'],
 ['Method','Form the running sum $s[n]=\\sum_{k\\le n}h[k]$ region by region.'],
 ['Solution','The sum collects the samples of $h$ at $k\\le n$. The only non-zero samples are $h[0]=1$ and $h[2]=-1$. $$\\begin{aligned}n<0:&\\quad s[n]=0,\\\\n=0:&\\quad s[0]=h[0]=1,\\\\n=1:&\\quad s[1]=h[0]+h[1]=1+0=1,\\\\n\\ge2:&\\quad s[n]=h[0]+h[1]+h[2]=1+0-1=0.\\end{aligned}$$ So $s[n]=\\delta[n]+\\delta[n-1]$.'],
 ['Check','Recover $h$ with the first difference: $s[0]-s[-1]=1-0=1$, $s[1]-s[0]=1-1=0$, $s[2]-s[1]=0-1=-1$, and $0$ after that. This is $\\delta[n]-\\delta[n-2]$.']
]},

{t:'h3', text:'The integrator and the differentiator'},
{t:'p', text:'Two basic operations of calculus are LTI systems. The <b>integrator</b> has the output $y(t)=\\int_{-\\infty}^{t}x(\\tau)\\,\\d\\tau$. It is convolution with the unit step, because $u(t-\\tau)$ cuts the integral off at $\\tau=t$:'},
{t:'eq', tex:'\\begin{aligned}x(t)*u(t)&=\\int_{-\\infty}^{\\infty}x(\\tau)\\,u(t-\\tau)\\,\\d\\tau\\\\&=\\int_{-\\infty}^{t}x(\\tau)\\,\\d\\tau.\\end{aligned}'},
{t:'p', text:'So the integrator has $h(t)=u(t)$: the running integral of $\\delta(t)$ is $u(t)$. The step response $s=h*u$ is therefore $h$ passed through an integrator. The integrator is not BIBO stable, because $\\int_{-\\infty}^{\\infty}|u(t)|\\,\\d t$ diverges.'},
{t:'p', text:'The <b>differentiator</b> has the output $y(t)=\\d x(t)/\\d t$. Its impulse response is the output for $x=\\delta$, the derivative of the impulse. It is called the <b>unit doublet</b>:'},
{t:'eq', tex:'u_1(t)=\\frac{\\d\\delta(t)}{\\d t}.'},
{t:'p', text:'Like $\\delta$, the doublet is defined by what it does under convolution, not by its values. Differentiate the sifting form of $x$ with respect to $t$. Only the factor $\\delta(t-\\tau)$ depends on $t$:'},
{t:'eq', tex:'\\begin{aligned}\\frac{\\d x(t)}{\\d t}&=\\frac{\\d}{\\d t}\\int_{-\\infty}^{\\infty}x(\\tau)\\,\\delta(t-\\tau)\\,\\d\\tau\\\\&=\\int_{-\\infty}^{\\infty}x(\\tau)\\,u_1(t-\\tau)\\,\\d\\tau\\\\&=x(t)*u_1(t).\\end{aligned}'},
{t:'p', text:'Put $x=u$ into this rule. The derivative of the step is the impulse, so'},
{t:'eq', tex:'u(t)*u_1(t)=\\frac{\\d u(t)}{\\d t}=\\delta(t).'},
{t:'p', text:'The cascade of an integrator and a differentiator has impulse response $\\delta$. The differentiator is the inverse of the integrator, as the first difference is the inverse of the accumulator.'},
{t:'figrow', items:[
 {svg:()=>{const a=sm({xr:[-1.5,3.5],yr:[-0.2,1.45],xlabel:'t',ylabel:'\\text{amplitude}',xtarget:5});
   a.curve(t=>t>=0?1:0,{color:C.out,n:1200}); a.impulse(0,1,{color:C.in,label:false});
   a.note(0.15,1.3,'\\delta(t)',{tex:true,color:C.in,fs:13}); a.note(2.2,1.15,'u(t)',{tex:true,color:C.out,fs:13}); return a.svg();},
  cap:'Integrator: the input $\\delta(t)$ gives the output $u(t)$.'},
 {svg:()=>{const a=sm({xr:[-1.5,3.5],yr:[-0.2,1.45],xlabel:'t',ylabel:'\\text{amplitude}',xtarget:5});
   a.curve(t=>t>=0?1:0,{color:C.in,n:1200}); a.impulse(0,1,{color:C.out,label:false});
   a.note(0.15,1.3,'\\delta(t)',{tex:true,color:C.out,fs:13}); a.note(2.2,1.15,'u(t)',{tex:true,color:C.in,fs:13}); return a.svg();},
  cap:'Differentiator: the input $u(t)$ gives the output $\\delta(t)$.'}
]},

{t:'h2', num:'3.5', text:'Difference and differential equations'},
{t:'p', text:'Many systems are given by an equation that links the output to its own earlier values. This section shows when such an equation describes an LTI system, and how to find its impulse response.'},

{t:'h3', text:'Difference equations and initial rest'},
{t:'p', text:'A linear constant-coefficient difference equation has the form'},
{t:'eqbox', cap:'Difference equation', tex:'\\sum_{k=0}^{N}a_k\\,y[n-k]=\\sum_{k=0}^{M}b_k\\,x[n-k]',
 after:'The coefficients $a_k$ and $b_k$ are constants, and $a_0\\neq0$.'},
{t:'p', text:'Move every term except $a_0\\,y[n]$ to the right and divide by $a_0$. This gives a recursion that computes each output from earlier outputs and inputs:'},
{t:'eq', tex:'y[n]=\\frac{1}{a_0}\\Bigl(\\sum_{k=0}^{M}b_k\\,x[n-k]-\\sum_{k=1}^{N}a_k\\,y[n-k]\\Bigr).'},
{t:'p', text:'The recursion needs $N$ earlier outputs before it can start. So the equation alone does not fix the system; a starting condition is also needed.'},
{t:'box', html:'<span class="t">Initial rest</span>If $x[n]=0$ for $n<n_0$, take $y[n]=0$ for $n<n_0$. With this condition the system is causal and LTI. A non-zero start would give an output with no input, and a linear system maps the zero input to the zero output.'},
{t:'ex', hd:'Example 3.7', rows:[
 ['Given','$y[n]=\\tfrac12\\,y[n-1]+x[n]$, at initial rest.'],
 ['Find','The impulse response $h[n]$.'],
 ['Method','Put $x[n]=\\delta[n]$, so $y[n]=h[n]$. Initial rest gives $h[n]=0$ for $n<0$. Run the recursion forward from $n=0$.'],
 ['Solution','The recursion is $h[n]=\\tfrac12\\,h[n-1]+\\delta[n]$. Start from $h[-1]=0$: $$\\begin{aligned}h[0]&=\\tfrac12\\,h[-1]+\\delta[0]=\\tfrac12\\cdot0+1=1,\\\\h[1]&=\\tfrac12\\,h[0]+\\delta[1]=\\tfrac12\\cdot1+0=\\tfrac12,\\\\h[2]&=\\tfrac12\\,h[1]+\\delta[2]=\\tfrac12\\cdot\\tfrac12+0=\\tfrac14.\\end{aligned}$$ For $n\\ge1$ the impulse term is 0, so each step halves the last sample: $h[n]=\\tfrac12\\,h[n-1]$. Starting from $h[0]=1$, this gives $h[n]=\\left(\\tfrac12\\right)^{n}$ for $n\\ge0$. Together, $h[n]=\\left(\\tfrac12\\right)^{n}u[n]$.'],
 ['Check','The formula gives $h[0]=1$, $h[1]=\\tfrac12$ and $h[2]=\\tfrac14$, as the recursion did. With the feedback coefficient $-\\tfrac12$ instead, $y[n]=-\\tfrac12\\,y[n-1]+x[n]$ gives $h[0]=1$, $h[1]=-\\tfrac12$ and $h[2]=-\\tfrac12\\cdot\\left(-\\tfrac12\\right)=\\tfrac14$.']
]},

{t:'h3', text:'Non-recursive and recursive equations'},
{t:'p', text:'If the equation has no earlier outputs ($N=0$ and $a_0=1$), it is <b>non-recursive</b>: $y[n]=\\sum_{k=0}^{M}b_k\\,x[n-k]$. Put $x=\\delta$. Each term $b_k\\,\\delta[n-k]$ places the value $b_k$ at $n=k$:'},
{t:'eq', tex:'h[n]=\\sum_{k=0}^{M}b_k\\,\\delta[n-k]=\\begin{cases}b_n,&0\\le n\\le M\\\\0,&\\text{otherwise.}\\end{cases}'},
{t:'p', text:'So $h$ has at most $M+1$ non-zero samples. Such a system has a <b>finite impulse response</b> (FIR). For example, $y[n]=x[n]+2\\,x[n-1]-x[n-3]$ has $h[n]=\\delta[n]+2\\,\\delta[n-1]-\\delta[n-3]$. Its coefficient $b_2$ is 0, so $h[2]=0$ and $h$ has three non-zero samples.'},
{t:'p', text:'If the equation feeds earlier outputs back, it is <b>recursive</b>. Take the first-order case $y[n]=a\\,y[n-1]+b\\,x[n]$, at rest. As in Example 3.7, $h[0]=a\\cdot0+b=b$, and for $n\\ge1$ each step multiplies the last sample by $a$:'},
{t:'eq', tex:'\\begin{aligned}h[n]&=a\\,h[n-1],\\quad n\\ge1\\\\\\Longrightarrow\\quad h[n]&=b\\,a^{n}u[n].\\end{aligned}'},
{t:'p', text:'One impulse keeps producing samples for ever. Such a system has an <b>infinite impulse response</b> (IIR). It is BIBO stable exactly when $|a|<1$ (with $b\\neq0$). For $|a|<1$ the geometric sum gives $\\sum_n|h[n]|=|b|\\sum_{n\\ge0}|a|^{n}=|b|/(1-|a|)$, which is finite. For $|a|\\ge1$ every term satisfies $|b|\\,|a|^{n}\\ge|b|>0$, so the terms do not go to zero and the sum diverges.'},
{t:'p', text:'Two smoothers show the difference. The three-sample average $y[n]=\\tfrac13\\bigl(x[n]+x[n-1]+x[n-2]\\bigr)$ is non-recursive, with $h[n]=\\tfrac13$ for $n=0,1,2$. The recursive smoother $y[n]=0.8\\,y[n-1]+0.2\\,x[n]$ has $a=0.8$ and $b=0.2$, so $h[n]=0.2\\,(0.8)^{n}u[n]$. Both impulse responses sum to 1: $3\\cdot\\tfrac13=1$, and $0.2/(1-0.8)=1$. So a constant input $c$ gives the output $c\\sum_n h[n]=c$ once each smoother has settled.'},
{t:'figrow', items:[
 {svg:()=>{const a=sm({xr:[-2.5,16.5],yr:[-0.05,0.45],xlabel:'n',ylabel:'h[n]',xtarget:5,ytarget:3});
   a.stem(D(n=>(n>=0&&n<=2)?1/3:0,-2,16),{color:C.h,r:2.4}); return a.svg();},
  cap:'Non-recursive: $h[n]=\\tfrac13\\bigl(\\delta[n]+\\delta[n-1]+\\delta[n-2]\\bigr)$ stops after three samples.'},
 {svg:()=>{const a=sm({xr:[-2.5,16.5],yr:[-0.05,0.45],xlabel:'n',ylabel:'h[n]',xtarget:5,ytarget:3});
   a.stem(D(n=>n>=0?0.2*Math.pow(0.8,n):0,-2,16),{color:C.out,r:2.4}); return a.svg();},
  cap:'Recursive: $h[n]=0.2\\,(0.8)^{n}u[n]$ never stops.'}
]},
{t:'ex', hd:'Example 3.8', rows:[
 ['Given','A display smooths a sensor reading with $y[n]=0.8\\,y[n-1]+0.2\\,x[n]$, at rest. The reading jumps to 25 °C at $n=0$: $x[n]=25\\,u[n]$.'],
 ['Find','The displayed value $y[n]$.'],
 ['Method','The system is LTI, so $y=x*h=25\\,(u*h)=25\\,s[n]$, where $s$ is the step response. Find $s$ as the running sum of $h[n]=0.2\\,(0.8)^{n}u[n]$.'],
 ['Solution','For $n<0$ no sample of $h$ is included, so $s[n]=0$. For $n\\ge0$, apply the finite geometric sum with $a=0.2$, $r=0.8$, $m=0$: $$\\begin{aligned}s[n]&=\\sum_{k=0}^{n}0.2\\,(0.8)^{k}\\\\&=\\frac{0.2\\bigl(1-0.8^{\\,n+1}\\bigr)}{1-0.8}\\\\&=1-0.8^{\\,n+1}.\\end{aligned}$$ So $y[n]=25\\bigl(1-0.8^{\\,n+1}\\bigr)u[n]$ °C.'],
 ['Check','Run the recursion from rest with $x[n]=25$: $y[0]=0.8\\cdot0+0.2\\cdot25=5$, and the formula gives $25(1-0.8)=5$. Next, $y[1]=0.8\\cdot5+5=9$, and $25(1-0.64)=9$. Next, $y[2]=0.8\\cdot9+5=12.2$, and $25(1-0.512)=12.2$. As $n\\to\\infty$, $0.8^{\\,n+1}\\to0$ and the display settles at 25 °C.']
]},

{t:'h3', text:'Block diagrams'},
{t:'p', text:'A difference equation can be drawn with three kinds of block: an adder, a gain, and a unit delay $D$, which outputs its input one sample late. For the first-order equation, the adder output is $y[n]$. The delay holds it for one sample, and the gain $a$ sends it back to the adder:'},
{t:'eq', tex:'y[n]=\\underbrace{b\\,x[n]}_{\\text{forward path}}+\\underbrace{a\\,y[n-1]}_{\\text{feedback}}.'},
{t:'fig', svg:()=>heads(P.blocks({w:900,h:240,items:[
  {t:'text',x:220,y:24,label:'discrete time',fs:13,color:C.slate},
  {t:'arrow',x1:10,y1:100,x2:70,y2:100},{t:'box',x:70,y:78,w:50,h:44,label:'b',tex:true},
  {t:'arrow',x1:120,y1:100,x2:176,y2:100},{t:'sum',x:190,y:100},{t:'arrow',x1:204,y1:100,x2:430,y2:100},
  {t:'line',d:'M340 100 V161'},{t:'box',x:315,y:170,w:50,h:44,label:'D',tex:true},
  {t:'line',d:'M315 192 H224'},{t:'box',x:165,y:170,w:50,h:44,label:'a',tex:true},{t:'line',d:'M190 170 V123'},
  {t:'text',x:40,y:86,label:'x[n]',tex:true,fs:15},{t:'text',x:395,y:86,label:'y[n]',tex:true,fs:15},
  {t:'text',x:268,y:180,label:'y[n-1]',tex:true,fs:14},
  {t:'text',x:680,y:24,label:'continuous time',fs:13,color:C.slate},
  {t:'arrow',x1:470,y1:100,x2:530,y2:100},{t:'box',x:530,y:78,w:50,h:44,label:'b',tex:true},
  {t:'arrow',x1:580,y1:100,x2:636,y2:100},{t:'sum',x:650,y:100},{t:'arrow',x1:664,y1:100,x2:720,y2:100},
  {t:'box',x:720,y:78,w:56,h:44,label:'\\int',tex:true,fs:18},{t:'arrow',x1:776,y1:100,x2:892,y2:100},
  {t:'line',d:'M840 100 V192 H684'},{t:'box',x:625,y:170,w:50,h:44,label:'-a',tex:true},{t:'line',d:'M650 170 V123'},
  {t:'text',x:500,y:86,label:'x(t)',tex:true,fs:15},{t:'text',x:692,y:86,label:'y^{\\prime}(t)',tex:true,fs:14},
  {t:'text',x:860,y:86,label:'y(t)',tex:true,fs:15}
]}), ['M340,170 l-4.5,-9 h9 Z','M215,192 l9,-4.5 v9 Z','M190,114 l-4.5,9 h9 Z','M675,192 l9,-4.5 v9 Z','M650,114 l-4.5,9 h9 Z'])
  .replace(/<\/svg>\s*$/,`<circle cx="340" cy="100" r="3.5" fill="${C.ink}"/><circle cx="840" cy="100" r="3.5" fill="${C.ink}"/></svg>`),
 cap:'Left: $y[n]=b\\,x[n]+a\\,y[n-1]$ with an adder, two gains and a unit delay. Right: $y^{\\prime}(t)=b\\,x(t)-a\\,y(t)$, where an integrator takes the place of the delay.'},
{t:'p', text:'Every linear constant-coefficient difference equation can be drawn with adders, gains and unit delays. The diagram is also a program: one pass of the loop computes one sample. With $x[n]=\\delta[n]$, $b=1$ and $a=\\tfrac12$, the passes give the impulse response of Example 3.7:'},
{t:'table', head:['$n$','$x[n]$','$y[n-1]$','$a\\,y[n-1]$','$y[n]=x[n]+a\\,y[n-1]$'], rows:[
 ['$0$','$1$','$0$','$0$','$1$'],
 ['$1$','$0$','$1$','$\\tfrac12$','$\\tfrac12$'],
 ['$2$','$0$','$\\tfrac12$','$\\tfrac14$','$\\tfrac14$'],
 ['$3$','$0$','$\\tfrac14$','$\\tfrac18$','$\\tfrac18$'],
 ['$4$','$0$','$\\tfrac18$','$\\tfrac1{16}$','$\\tfrac1{16}$']
]},
{t:'p', text:'With $b=1$ and $a=1$ the diagram computes $y[n]=y[n-1]+x[n]$. Each new input is added to the total so far, so the system is the accumulator, with $h[n]=1^{n}u[n]=u[n]$.'},
{t:'p', text:'In continuous time an integrator takes the place of the delay. For $y^{\\prime}(t)=b\\,x(t)-a\\,y(t)$, the adder forms $b\\,x-a\\,y$, which is $y^{\\prime}$. The integrator turns $y^{\\prime}$ into $y$, and the gain $-a$ feeds $y$ back.'},

{t:'h3', text:'A first-order differential equation'},
{t:'p', text:'The continuous-time counterpart of the first-order recursion is'},
{t:'eq', tex:'\\frac{\\d y(t)}{\\d t}+2\\,y(t)=x(t).'},
{t:'p', text:'Initial rest is defined as in discrete time: if $x(t)=0$ for $t<t_0$, then $y(t)=0$ for $t<t_0$. This again makes the system causal and LTI.'},
{t:'p', text:'<b>The impulse response.</b> Put $x=\\delta$, so $h^{\\prime}+2h=\\delta$. For $t<0$ the input is zero, and at rest $h(t)=0$. For $t>0$ the impulse is zero too, so $h^{\\prime}=-2h$. A function whose derivative is $-2$ times itself is $A\\,e^{-2t}$, because $\\frac{\\d}{\\d t}\\bigl(A\\,e^{-2t}\\bigr)=-2A\\,e^{-2t}$. To find $A$, integrate both sides of $h^{\\prime}+2h=\\delta$ over a short interval $-\\varepsilon<t<\\varepsilon$:'},
{t:'eq', tex:'\\begin{aligned}\\int_{-\\varepsilon}^{\\varepsilon}h^{\\prime}(t)\\,\\d t+2\\int_{-\\varepsilon}^{\\varepsilon}h(t)\\,\\d t&=\\int_{-\\varepsilon}^{\\varepsilon}\\delta(t)\\,\\d t\\\\h(\\varepsilon)-h(-\\varepsilon)+2\\int_{-\\varepsilon}^{\\varepsilon}h(t)\\,\\d t&=1.\\end{aligned}'},
{t:'p', text:'Here $h(-\\varepsilon)=0$ at rest. The function $h$ contains no impulse: an impulse in $h$ would put a doublet in $h^{\\prime}$, and the right side has none. So $h$ stays finite, and its integral over the shrinking interval goes to zero as $\\varepsilon\\to0$. What remains is $h(0^{+})=1$, which gives $A=1$ and'},
{t:'eqbox', cap:'Impulse response', tex:'h(t)=e^{-2t}u(t)'},
{t:'p', text:'Check it by substitution. Use the product rule, the derivative $u^{\\prime}(t)=\\delta(t)$ from Chapter 1, and the sampling property $e^{-2t}\\delta(t)=e^{0}\\delta(t)=\\delta(t)$:'},
{t:'eq', tex:'\\begin{aligned}\\frac{\\d h}{\\d t}&=-2e^{-2t}u(t)+e^{-2t}\\delta(t)\\\\&=-2\\,h(t)+\\delta(t).\\end{aligned}'},
{t:'p', text:'So $h^{\\prime}+2h=\\delta$, with $h=0$ for $t<0$.'},
{t:'p', text:'<b>The step response.</b> Integrate $h$. For $t<0$, $s(t)=0$. For $t>0$, use the antiderivative $-\\tfrac12e^{-2\\tau}$:'},
{t:'eq', tex:'\\begin{aligned}s(t)&=\\int_{0}^{t}e^{-2\\tau}\\,\\d\\tau\\\\&=\\Bigl[-\\tfrac12e^{-2\\tau}\\Bigr]_{0}^{t}\\\\&=-\\tfrac12e^{-2t}+\\tfrac12=\\tfrac12\\bigl(1-e^{-2t}\\bigr).\\end{aligned}'},
{t:'p', text:'Check: for $t>0$, $s^{\\prime}+2s=e^{-2t}+\\bigl(1-e^{-2t}\\bigr)=1$, which is the step input. The output settles at $\\tfrac12$.'},
{t:'p', text:'The same steps with 2 replaced by any $a>0$ give, for $y^{\\prime}+a\\,y=x$ at rest, $h(t)=e^{-at}u(t)$ and $s(t)=\\frac1a\\bigl(1-e^{-at}\\bigr)u(t)$. A larger $a$ makes $h$ decay faster and makes $s$ settle lower, at $1/a$. For example, $y^{\\prime}+5\\,y=x$ has $h(t)=e^{-5t}u(t)$. With an input gain $b$, as in $y^{\\prime}+a\\,y=b\\,x$, linearity multiplies both responses by $b$. The RC circuit of Section 2.1 has $a=b=1/RC$, so its impulse response is $h(t)=\\frac{1}{RC}\\,e^{-t/RC}u(t)$. Chapter 5 finds these systems again from their frequency response.'},
{t:'fig', svg:()=>{const c=2;
  const a=ax({xr:[-0.5,3.2],yr:[-0.08,1.18],xlabel:'t',ylabel:'\\text{amplitude}',h:180,pad:{l:50,r:20,t:14,b:32},xtarget:8,ytarget:3});
  a.hline(1/c,{color:C.coral,dash:'4 4'});
  a.curve(t=>t>=0?Math.exp(-c*t):0,{color:C.h,n:1200}); a.curve(t=>t>=0?(1-Math.exp(-c*t))/c:0,{color:C.out,n:1200});
  a.note(1.9,0.07,'h(t)=e^{-2t}u(t)',{tex:true,color:C.h,fs:14}); a.note(1.6,0.64,'s(t)=\\tfrac12\\bigl(1-e^{-2t}\\bigr)',{tex:true,color:C.out,fs:14});
  return a.svg();},
 cap:'The impulse response and the step response of $y^{\\prime}+2y=x$ at rest. The step response settles at $\\tfrac12$, the dashed line.'},
{t:'ex', hd:'Example 3.9', rows:[
 ['Given','A car pulls away against drag: $10\\,\\dfrac{\\d v}{\\d t}+v=30\\,u(t)$, with $t$ in seconds and $v$ in m/s, at rest.'],
 ['Find','The speed $v(t)$.'],
 ['Method','Divide by 10 to reach the form $v^{\\prime}+a\\,v=x$. The input is then a scaled step, so the output is the same multiple of the step response.'],
 ['Solution','Dividing by 10 gives $v^{\\prime}+0.1\\,v=3\\,u(t)$, so $a=0.1$. The step response of $v^{\\prime}+0.1\\,v=x$ is $s(t)=\\frac{1}{0.1}\\bigl(1-e^{-0.1t}\\bigr)u(t)$. By linearity the input $3\\,u(t)$ gives $$\\begin{aligned}v(t)&=3\\,s(t)\\\\&=\\frac{3}{0.1}\\bigl(1-e^{-0.1t}\\bigr)u(t)\\\\&=30\\bigl(1-e^{-t/10}\\bigr)u(t)\\ \\text{m/s}.\\end{aligned}$$'],
 ['Check','Substitute into the original equation for $t>0$: $10\\cdot\\frac{30}{10}e^{-t/10}+30-30\\,e^{-t/10}=30$. The speed starts at 0 and settles at 30 m/s. After one time constant, $v(10)=30(1-e^{-1})\\approx18.96$ m/s.']
]},
{t:'figrow', items:[
 {svg:()=>{const a=sm({xr:[-1,20],yr:[0,29],xlabel:'n',ylabel:'y[n]',xtarget:5,ytarget:3});
   a.hline(25,{color:C.coral,dash:'4 4'}); a.stem(D(n=>n>=0?25*(1-Math.pow(0.8,n+1)):0,-1,20),{color:C.out,r:2.4}); return a.svg();},
  cap:'Example 3.8: $y[n]=25\\bigl(1-0.8^{\\,n+1}\\bigr)u[n]$ settles at 25 °C.'},
 {svg:()=>{const a=sm({xr:[-2,40],yr:[-2,34],xlabel:'t',ylabel:'v(t)',xtarget:4,ytarget:3});
   a.hline(30,{color:C.coral,dash:'4 4'}); a.curve(t=>t>=0?30*(1-Math.exp(-t/10)):0,{color:C.out,n:1200}); return a.svg();},
  cap:'Example 3.9: $v(t)=30\\bigl(1-e^{-t/10}\\bigr)$ m/s settles at 30 m/s.'}
]},

{t:'h2', num:'3.6', text:'Summary'},
{t:'table', head:['Result','Statement'], rows:[
 ['Impulse response','The output $h$ when the input is $\\delta[n]$, or $\\delta(t)$.'],
 ['Representation','$x[n]=\\sum_k x[k]\\,\\delta[n-k]$, and $x(t)=\\int x(\\tau)\\,\\delta(t-\\tau)\\,\\d\\tau$.'],
 ['Convolution','$y[n]=\\sum_k x[k]\\,h[n-k]$ and $y(t)=\\int x(\\tau)\\,h(t-\\tau)\\,\\d\\tau$, for LTI systems only.'],
 ['Building $h[n-k]$','Flip, then shift. The sample $h[0]$ sits at $k=n$. Without the flip the sum is a correlation.'],
 ['Three checks','Continuity at each boundary. Supports add. Areas, or sums, multiply.'],
 ['Interconnections','Parallel: $h_1+h_2$. Cascade: $h_1*h_2$, in either order, for LTI systems only.'],
 ['Memoryless, causal','Memoryless if and only if $h=a\\,\\delta$. Causal if and only if $h=0$ for negative time.'],
 ['BIBO stable','If and only if $\\sum_k|h[k]|<\\infty$, or $\\int|h(t)|\\,\\d t<\\infty$.'],
 ['Step response','$s=h*u$, the running sum or running integral of $h$. Back to $h$: $h[n]=s[n]-s[n-1]$ and $h(t)=s^{\\prime}(t)$.'],
 ['Difference equations','At initial rest the system is causal and LTI. $y[n]=a\\,y[n-1]+x[n]$ has $h[n]=a^{n}u[n]$.']
]},
{t:'box', kind:'ok', html:'<span class="t">Where Chapter 4 begins</span>Put $x(t)=e^{j\\omega t}$ into the second form of the convolution integral: $$\\begin{aligned}y(t)&=\\int_{-\\infty}^{\\infty}h(\\tau)\\,e^{j\\omega(t-\\tau)}\\,\\d\\tau\\\\&=e^{j\\omega t}\\int_{-\\infty}^{\\infty}h(\\tau)\\,e^{-j\\omega\\tau}\\,\\d\\tau.\\end{aligned}$$ The integral does not depend on $t$. The output is the input times one number, so a complex exponential passes through an LTI system unchanged in form.'},

{t:'h3', text:'Exercises'},
{t:'q', n:'3.1', text:'Compute $\\{1,2,3\\}*\\{1,-1\\}$ with both sequences starting at $n=0$, and check your answer with the sum rule.', ans:'$\\{1,1,1,-3\\}$; the sums multiply as $6\\times0=0$.'},
{t:'q', n:'3.2', text:'Let $h[n]=\\left(\\tfrac13\\right)^{n}u[n]$. Is the system stable? Is it causal? Is it memoryless?', ans:'Stable ($\\sum|h|=3/2$), causal, not memoryless.'},
{t:'q', n:'3.3', text:'Find $y(t)=u(t)*u(t)$ and sketch it. This is the step response of the integrator.', ans:'$y(t)=t\\,u(t)$.'},
{t:'q', n:'3.4', text:'Two systems with $h_1[n]=\\delta[n]+\\delta[n-1]$ and $h_2[n]=\\delta[n]-\\delta[n-1]$ are cascaded. Find the impulse response of the cascade.', ans:'$\\delta[n]-\\delta[n-2]$.'},
{t:'q', n:'3.5', text:'$x(t)=1$ on $0<t<3$ and $h(t)=t$ on $0<t<2$. List the case boundaries before computing anything, then find $y(t)$. The window is now wider than the ramp, which changes the middle case.', ans:'Boundaries at $t=0,2,3,5$; five cases. $y=0$, $\\tfrac12t^{2}$, $2$, $2-\\tfrac12(t-3)^{2}$, $0$.'},
{t:'q', n:'3.6', text:'A causal LTI system has the step response $s(t)=\\bigl(1-e^{-3t}\\bigr)u(t)$. Find $h(t)$.', ans:'$h(t)=3\\,e^{-3t}u(t)$.'},
{t:'q', n:'3.7', text:'Find the impulse response of $y[n]=0.9\\,y[n-1]+x[n]$ at initial rest. Is the system BIBO stable?', ans:'$h[n]=0.9^{\\,n}u[n]$. Stable: $\\sum_n|h[n]|=10$.'}
];
})();
