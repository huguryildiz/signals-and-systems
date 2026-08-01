/* ==========================================================================
   Exam drill — Module 3.
   The module opens with two scenes: a taxonomy of the question types that
   recur in examinations, and a pager of twenty open-ended questions in that
   form. The worked solution of every question is hidden until the reader
   asks for it, so a first pass shows the target and not the answer.
   ========================================================================== */
(function(){
const P = PLOT, C = P.COL;
const disc=(f,a,b)=>{const o=[];for(let n=Math.ceil(a);n<=b;n++)o.push([n,f(n)]);return o;};
const seq =(vals,n0)=>vals.map((v,i)=>[n0+i,v]);
const pair=(a,b)=>`<div class="dr-pair"><div>${a}</div><div>${b}</div></div>`;

/* ======================================================================
   MODULE 3 — Linear Time-Invariant Systems
   ====================================================================== */

CONTENT.DRILLTYPES.M3 = [
  { k:'dt-h', name:'Impulse response from a difference equation',
    asks:'A discrete-time system is given as a relation between $x[n]$ and $y[n]$. Find $h[n]$, then use it.',
    method:['Set $x[n]=\\delta[n]$ and read the relation as it stands.',
            'For a non-recursive relation, $h[n]$ is the list of coefficients placed at their delays.',
            'For a recursive relation, iterate from rest: $h[0]$, then $h[1]$, then the pattern.',
            'State the support of $h$ before using it in any convolution.'],
    go:'m3-impulse' },
  { k:'dt-conv', name:'Convolution sum',
    asks:'Two sequences are given. Compute $y[n]=x[n]*h[n]$ and plot it.',
    method:['Write both sequences with their supports as inequalities in $k$.',
            'Decide which one to flip. Flip the shorter or simpler one.',
            'List every case boundary before summing anything.',
            'Check: the supports add, and the totals multiply.'],
    go:'m3-convsum' },
  { k:'ct-conv', name:'Convolution integral',
    asks:'Two continuous-time signals are given. Compute $y(t)=x(t)*h(t)$ and plot it, marking every breakpoint.',
    method:['Write $y(t)=\\int x(\\tau)h(t-\\tau)\\,\\d\\tau$ and mark the support of each factor in $\\tau$.',
            'Equate every moving edge with every fixed edge. Those equations are the case boundaries.',
            'Integrate case by case, with the limits read off the overlap.',
            'Check continuity at each boundary, that the supports add, and that the areas multiply.'],
    go:'m3-convint' },
  { k:'graph-h', name:'Recovering the impulse response from an input-output pair',
    asks:'One input and its output are given as plots. Find $h[n]$.',
    method:['Write the input as a sum of shifted impulses.',
            'That turns $y[n]$ into a sum of shifted copies of $h[n]$.',
            'Solve the resulting equations from the earliest sample forward.',
            'Check by convolving the recovered $h$ with the given input.'],
    go:'m3-convsum' },
  { k:'h-props', name:'Reading causality and stability off the impulse response',
    asks:'An impulse response is given. Decide whether the system is causal and whether it is stable.',
    method:['Causal exactly when $h[n]=0$ for $n<0$, or $h(t)=0$ for $t<0$.',
            'Stable exactly when $\\sum_n|h[n]|<\\infty$, or $\\int|h(t)|\\,\\d t<\\infty$.',
            'A one-sided geometric or exponential is summable only when it decays away from its edge.',
            'The two properties are independent. Neither implies the other.'],
    go:'m3-lti-props' }
];

CONTENT.DRILL = CONTENT.DRILL.concat([

/* ---------- Type A — impulse response from a difference equation ---------- */

{ id:'D3-01', module:'M3', type:'dt-h', src:'MT1 Q3',
  stem:'The input and output of a discrete-time LTI system are related by $$y[n]=2x[n]-x[n-1]+3x[n-3].$$',
  parts:['Determine and plot the impulse response $h[n]$.',
         'For the input $x[n]=u[n]-u[n-3]$, compute and plot $y[n]=x[n]*h[n]$.'],
  sol:'<b>Given.</b> A non-recursive relation with three terms, at delays $0$, $1$ and $3$.<br>'
     +'<b>Find.</b> $h[n]$, then the response to a three-sample rectangular input.<br>'
     +'<b>Method.</b> Set $x[n]=\\delta[n]$. Each term $c\\,x[n-n_0]$ contributes $c\\,\\delta[n-n_0]$, so the coefficients land at their own delays.<br>'
     +'<b>Solution — part (a).</b>$$h[n]=2\\delta[n]-\\delta[n-1]+3\\delta[n-3],$$that is $h[0]=2$, $h[1]=-1$, $h[2]=0$, $h[3]=3$, and zero elsewhere. The support is $0\\le n\\le3$.<br>'
     +'<b>Solution — part (b).</b> The input is $x[n]=1$ for $n=0,1,2$ and zero elsewhere, so$$y[n]=h[n]+h[n-1]+h[n-2].$$Sliding the three-term window across $h$:$$y[0]=2,\\quad y[1]=1,\\quad y[2]=1,\\quad y[3]=2,\\quad y[4]=3,\\quad y[5]=3,$$and $y[n]=0$ otherwise.<br>'
     +'<b>Check.</b> The supports add: $x$ occupies $0\\le n\\le2$ and $h$ occupies $0\\le n\\le3$, so $y$ must occupy $0\\le n\\le5$ — six samples, which is what came out. The totals multiply: $\\sum h[n]=2-1+0+3=4$ and $\\sum x[n]=3$, so $\\sum y[n]$ must be $12$, and $2+1+1+2+3+3=12$.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-1.6,4.6],yr:[-2.6,3.8],xlabel:'n',ylabel:'h[n]',
      pad:{l:46,r:26,t:30,b:34},xstep:1,ystep:1});
      a.stem(seq([2,-1,0,3],0),{color:C.h}); return a.svg();})(),
    (()=>{const H=[2,-1,0,3];const y=n=>[0,1,2].reduce((s,k)=>s+((n-k>=0&&n-k<=3)?H[n-k]:0),0);
      const a=P.Axes({w:520,h:250,xr:[-1.6,7.6],yr:[-1.6,4.6],xlabel:'n',ylabel:'y[n]',
      pad:{l:46,r:26,t:30,b:34},xstep:1,ystep:1});
      a.stem(disc(y,-1,7),{color:C.out}); return a.svg();})()),
  err:'Placing the coefficients at the wrong index, most often by reading $3x[n-3]$ as a value at $n=-3$. The delay in the argument is the position in $h$, and its sign is not flipped.',
  teach:'Ask for the support of $h$ before part (b) is attempted. A student who cannot state $0\\le n\\le3$ will not predict the support of $y$ either, and will lose the only cheap check available.' },

{ id:'D3-02', module:'M3', type:'dt-h', src:'MT1 Q3',
  stem:'A discrete-time LTI system is described by $$y[n]=\\tfrac14\\,y[n-1]+x[n],$$and is initially at rest.',
  parts:['Determine and plot the impulse response $h[n]$.',
         'For the input $x[n]=u[n]$, compute and plot $y[n]$.',
         'State the limit of $y[n]$ as $n\\to\\infty$ and say what it means.'],
  sol:'<b>Given.</b> A first-order recursion with constant coefficients, at rest before the input arrives.<br>'
     +'<b>Find.</b> $h[n]$, the step response, and its limit.<br>'
     +'<b>Method.</b> Set $x[n]=\\delta[n]$ and iterate forward from rest. Then convolve with the step, which for a causal $h$ is a running sum.<br>'
     +'<b>Solution — part (a).</b> With $y[-1]=0$:$$h[0]=\\tfrac14(0)+1=1,\\quad h[1]=\\tfrac14(1)=\\tfrac14,\\quad h[2]=\\tfrac14\\!\\left(\\tfrac14\\right)=\\tfrac{1}{16},$$so$$h[n]=\\left(\\tfrac14\\right)^{\\!n}u[n].$$'
     +'<b>Solution — part (b).</b> With $x[n]=u[n]$,$$y[n]=\\sum_{k=0}^{n}\\left(\\tfrac14\\right)^{\\!n-k}=\\sum_{m=0}^{n}\\left(\\tfrac14\\right)^{\\!m}=\\frac{1-\\left(\\tfrac14\\right)^{n+1}}{1-\\tfrac14}$$for $n\\ge0$, that is$$y[n]=\\frac43\\left[1-\\left(\\tfrac14\\right)^{\\!n+1}\\right]u[n].$$'
     +'<b>Solution — part (c).</b> $\\left(\\tfrac14\\right)^{n+1}\\to0$, so $y[n]\\to\\tfrac43$. The system settles at $4/3$ times the height of the step.<br>'
     +'<b>Check.</b> Iterating the recursion directly with $x[n]=u[n]$ gives $y[0]=1$, $y[1]=\\tfrac14+1=\\tfrac54$, $y[2]=\\tfrac14\\!\\left(\\tfrac54\\right)+1=\\tfrac{21}{16}$, and the closed form returns $1$, $\\tfrac54$, $\\tfrac{21}{16}$ in turn — a route that never used the finite-geometric-sum formula. The limit also agrees with $\\sum_n h[n]=\\dfrac{1}{1-1/4}=\\dfrac43$, the response to a step once the transient has died, computed without taking any limit at all.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:260,xr:[-1.6,6.6],yr:[-0.2,1.3],xlabel:'n',ylabel:'h[n]',
      pad:{l:46,r:26,t:30,b:34},xstep:1,ystep:0.5});
      a.stem(disc(n=>n>=0?Math.pow(0.25,n):0,-1,6),{color:C.h}); return a.svg();})(),
    (()=>{const y=n=>n<0?0:(4/3)*(1-Math.pow(0.25,n+1));
      const a=P.Axes({w:520,h:260,xr:[-1.6,8.6],yr:[-0.2,1.7],xlabel:'n',ylabel:'y[n]',
      pad:{l:46,r:26,t:30,b:34},xstep:1,ystep:0.5});
      a.hline(4/3,{color:C.muted,dash:'4 5'});
      a.stem(disc(y,-1,8),{color:C.out});
      a.note(8.2,1.46,'\\tfrac{4}{3}',{anchor:'end',color:C.muted,fs:14,tex:true});
      return a.svg();})()),
  err:'Writing $h[n]=(1/4)^{n}$ without the step, which makes the impulse response non-zero for every negative $n$ and turns a stable causal system into one with no well-defined support.',
  teach:'The rest condition is what makes the iteration well posed. A student who starts the recursion without stating $y[-1]=0$ has assumed it silently and should be asked where it came from.' },

{ id:'D3-03', module:'M3', type:'dt-h',
  stem:'A discrete-time LTI system is described by $$y[n]=x[n+1]-2x[n]+x[n-1],$$which uses a future value of the input and is therefore not causal.',
  parts:['Determine and plot the impulse response $h[n]$.',
         'For the input $x[n]=u[n+1]-u[n-2]$ (equal to $1$ at $n=-1,0,1$), compute and plot $y[n]=x[n]*h[n]$.',
         'Using only $\\sum_n h[n]$ and $\\sum_n x[n]$, state $\\sum_n y[n]$ without adding the samples of part (b), and confirm the two agree.'],
  sol:'<b>Given.</b> A three-tap, non-causal relation — the discrete second difference — and a three-sample rectangular input.<br>'
     +'<b>Find.</b> $h[n]$, $y[n]$, and a sum check that needs no addition of individual samples.<br>'
     +'<b>Method.</b> Set $x[n]=\\delta[n]$; the term $x[n+1]$ contributes at $n=-1$, not at $n=+1$, because $\\delta[n+1]$ is non-zero where $n+1=0$.<br>'
     +'<b>Solution — part (a).</b>$$h[n]=\\delta[n+1]-2\\delta[n]+\\delta[n-1],$$that is $h[-1]=1$, $h[0]=-2$, $h[1]=1$, and zero elsewhere.<br>'
     +'<b>Solution — part (b).</b> With $x[n]=1$ for $n=-1,0,1$, $y[n]=h[n+1]+h[n]+h[n-1]$. Sliding the window:$$y[-2]=1,\\quad y[-1]=-1,\\quad y[0]=0,\\quad y[1]=-1,\\quad y[2]=1,$$and $y[n]=0$ otherwise.<br>'
     +'<b>Solution — part (c).</b> $\\sum_n h[n]=1-2+1=0$ and $\\sum_n x[n]=3$, so $\\sum_n y[n]=0\\cdot3=0$ — true whatever the exact shape of $x$ happens to be. Adding the table of part (b) directly, $1-1+0-1+1=0$, which agrees.<br>'
     +'<b>Check.</b> A direct value at $n=0$, read off the original relation rather than the table: $y[0]=x[1]-2x[0]+x[-1]=1-2(1)+1=0$, matching the entry in part (b). Because $\\sum_n h[n]=0$, this system passes a constant input through as zero — it responds only to *changes* in $x[n]$, which is exactly what a discrete second difference measures.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:260,xr:[-2.6,2.6],yr:[-2.6,1.6],xlabel:'n',ylabel:'h[n]',
      pad:{l:46,r:26,t:30,b:34},xstep:1,ystep:1});
      a.stem(seq([1,-2,1],-1),{color:C.h}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:260,xr:[-3.6,3.6],yr:[-1.6,1.6],xlabel:'n',ylabel:'y[n]',
      pad:{l:46,r:26,t:30,b:34},xstep:1,ystep:1});
      a.stem(seq([1,-1,0,-1,1],-2),{color:C.out}); return a.svg();})()),
  err:'Placing the $x[n+1]$ term at $n=+1$ in $h$ instead of $n=-1$, reversing the direction of a look-ahead shift because delays are usually positive.',
  teach:'Point out that this system is non-causal — it needs $x[n+1]$ to form $y[n]$ — and ask what that means for building it in real time. Module 3 returns to this exact question under causality.' },

{ id:'D3-04', module:'M3', type:'dt-h',
  stem:'Two discrete-time LTI systems are described by their own difference equations,$$y_1[n]=x[n]+x[n-1]\\qquad\\text{and}\\qquad y_2[n]=x[n]-x[n-1].$$',
  parts:['Determine $h_1[n]$ and $h_2[n]$.',
         'The two systems are placed in cascade. Determine and plot the impulse response of the cascade, $h_c[n]=h_1[n]*h_2[n]$.',
         'The same two systems are placed in parallel instead, outputs summed. Determine $h_p[n]=h_1[n]+h_2[n]$, and use it to find the response to $x[n]=3\\delta[n-4]$.'],
  sol:'<b>Given.</b> A two-tap sum operator and a two-tap difference operator, each defined by its own relation.<br>'
     +'<b>Find.</b> Their impulse responses, and the impulse response of the cascade and of the parallel combination.<br>'
     +'<b>Method.</b> Set $x[n]=\\delta[n]$ in each relation for part (a). The associative property gives the impulse response of a cascade as $h_1*h_2$; the distributive property gives the impulse response of a parallel combination as $h_1+h_2$.<br>'
     +'<b>Solution — part (a).</b>$$h_1[n]=\\delta[n]+\\delta[n-1],\\qquad h_2[n]=\\delta[n]-\\delta[n-1],$$that is $h_1[0]=h_1[1]=1$ and $h_2[0]=1,\\,h_2[1]=-1$.<br>'
     +'<b>Solution — part (b).</b>$$h_c[0]=h_1[0]h_2[0]=1,\\quad h_c[1]=h_1[0]h_2[1]+h_1[1]h_2[0]=-1+1=0,\\quad h_c[2]=h_1[1]h_2[1]=-1,$$so$$h_c[n]=\\delta[n]-\\delta[n-2].$$'
     +'<b>Solution — part (c).</b>$$h_p[0]=1+1=2,\\qquad h_p[1]=1-1=0,$$so $h_p[n]=2\\delta[n]$ — a pure gain of $2$. The response to $x[n]=3\\delta[n-4]$ is $y[n]=h_p[n]*x[n]=2\\cdot3\\,\\delta[n-4]=6\\delta[n-4]$.<br>'
     +'<b>Check.</b> Cascade order should not matter: computing $h_2*h_1$ instead gives $h_2[0]h_1[0]=1$, $h_2[0]h_1[1]+h_2[1]h_1[0]=1-1=0$, $h_2[1]h_1[1]=-1$ — the same three numbers as $h_1*h_2$. A sum check: $\\sum h_1=2$ and $\\sum h_2=0$, so $\\sum h_c$ must be $2\\cdot0=0$ regardless of the details of either factor, and indeed $1+0-1=0$.',
  figSol:()=>{const a=P.Axes({w:1080,h:260,xr:[-1.6,3.6],yr:[-1.6,1.6],xlabel:'n',ylabel:'h_c[n]',
      pad:{l:52,r:28,t:30,b:34},xstep:1,ystep:1});
    a.stem(seq([1,0,-1],0),{color:C.h}); return a.svg();},
  err:'Computing $h_c$ or $h_p$ pointwise — multiplying or adding $h_1[n]$ and $h_2[n]$ sample by sample at matching indices — instead of carrying out the actual convolution for the cascade and the plain sum for the parallel combination.',
  teach:'Ask which property — commutative, distributive or associative — is used in each part before any arithmetic starts. Confusing the parallel sum with the cascade convolution is the single most common error in this question.' },

/* ---------- Type B — convolution sum, from given figures ---------- */

{ id:'D3-05', module:'M3', type:'dt-conv', src:'MT1 Q3',
  stem:'The sequences $x[n]$ and $h[n]$ of a discrete-time LTI system are shown below.',
  figure:()=>pair(
    (()=>{const a=P.Axes({w:520,h:230,xr:[-1.6,3.6],yr:[-0.6,3.6],xlabel:'n',ylabel:'x[n]',
      pad:{l:44,r:24,t:26,b:32},xstep:1,ystep:1});
      a.stem(seq([1,2,3],0),{color:C.in}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:230,xr:[-1.6,2.6],yr:[-1.6,1.6],xlabel:'n',ylabel:'h[n]',
      pad:{l:44,r:24,t:26,b:32},xstep:1,ystep:1});
      a.stem(seq([1,-1],0),{color:C.h}); return a.svg();})()),
  parts:['Compute and plot $y[n]=x[n]*h[n]$.',
         'State which sample of $y[n]$ has the largest magnitude, and explain why.'],
  sol:'<b>Given.</b> $x[n]$ a three-sample ramp pulse, $1,2,3$ at $n=0,1,2$; $h[n]$ the two-tap difference filter, $1$ at $n=0$ and $-1$ at $n=1$.<br>'
     +'<b>Find.</b> $y[n]=x*h$, and where its largest sample sits.<br>'
     +'<b>Method.</b> $h[n]=\\delta[n]-\\delta[n-1]$, so convolving with it computes the first difference of $x$: $y[n]=x[n]-x[n-1]$. Read the values off the given sequence, extended by zero outside its support.<br>'
     +'<b>Solution — part (a).</b> $y[0]=x[0]-x[-1]=1-0=1$; $y[1]=x[1]-x[0]=2-1=1$; $y[2]=x[2]-x[1]=3-2=1$; $y[3]=x[3]-x[2]=0-3=-3$; zero elsewhere.<br>'
     +'<b>Solution — part (b).</b> $|y[3]|=3$ is the largest, at the point where $x$ falls abruptly from $3$ to $0$. Everywhere $x$ changes at the constant rate $+1$ per sample, $y$ is the constant $1$; only the artificial jump at the trailing edge of the pulse produces a different value.<br>'
     +'<b>Check.</b> Supports add: $x$ occupies $0\\le n\\le2$ (width $3$) and $h$ occupies $0\\le n\\le1$ (width $2$), so $y$ must occupy $0\\le n\\le3$ (width $4=3+2-1$), matching the computed range. Totals multiply: $\\sum h=0$, so $\\sum y$ must be $0$ whatever $x$ is, and $1+1+1-3=0$ confirms it.',
  figSol:()=>{const a=P.Axes({w:1080,h:260,xr:[-1.6,4.6],yr:[-3.6,1.6],xlabel:'n',ylabel:'y[n]',
      pad:{l:52,r:28,t:30,b:34},xstep:1,ystep:1});
    a.stem(seq([1,1,1,-3],0),{color:C.out}); return a.svg();},
  err:'Computing $y[n]=x[n]-x[n+1]$ — differencing in the wrong direction by flipping the sign convention of $h$ — which shifts every sample of the answer by one place and reverses its sign.',
  teach:'Ask for the general claim "$\\sum h=0$ forces $\\sum y=0$, for any $x$" to be stated before the numeric check is carried out.' },

{ id:'D3-06', module:'M3', type:'dt-conv', src:'MT1 Q3',
  stem:'The sequences $x[n]$ and $h[n]$ of a discrete-time LTI system are shown below.',
  figure:()=>pair(
    (()=>{const a=P.Axes({w:520,h:230,xr:[-3.6,3.6],yr:[-0.6,3.6],xlabel:'n',ylabel:'x[n]',
      pad:{l:44,r:24,t:26,b:32},xstep:1,ystep:1});
      a.stem(seq([1,2,3,2,1],-2),{color:C.in}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:230,xr:[-1.6,2.6],yr:[-0.6,1.6],xlabel:'n',ylabel:'h[n]',
      pad:{l:44,r:24,t:26,b:32},xstep:1,ystep:1});
      a.stem(seq([1,1],0),{color:C.h}); return a.svg();})()),
  parts:['Compute and plot $y[n]=x[n]*h[n]$.',
         'Verify that $y[n]$ is symmetric about $n=0.5$, and say why that point is expected.'],
  sol:'<b>Given.</b> $x[n]$ a symmetric triangular pulse, $1,2,3,2,1$ at $n=-2,\\dots,2$; $h[n]$ the two-tap sum operator, $1$ at $n=0$ and $n=1$.<br>'
     +'<b>Find.</b> $y[n]=x*h$, and its axis of symmetry.<br>'
     +'<b>Method.</b> $h$ adds each sample to its neighbour: $y[n]=x[n]+x[n-1]$. Read the values off the given sequence.<br>'
     +'<b>Solution — part (a).</b>$$y[n]=1,\\,3,\\,5,\\,5,\\,3,\\,1\\quad\\text{for}\\quad n=-2,-1,0,1,2,3,$$and zero elsewhere.<br>'
     +'<b>Solution — part (b).</b> $y[-2]=y[3]=1$, $y[-1]=y[2]=3$, $y[0]=y[1]=5$: symmetric about $n=\\tfrac12$. $x$ is symmetric about $n=0$ and $h$ is symmetric about its own midpoint $n=\\tfrac12$; the convolution of a signal symmetric about $a$ with one symmetric about $b$ is symmetric about $a+b$, here $0+\\tfrac12=\\tfrac12$.<br>'
     +'<b>Check.</b> Supports add: $x$ has width $5$ ($-2$ to $2$), $h$ has width $2$, so $y$ must have width $6=5+2-1$, matching the six non-zero samples found. Totals multiply: $\\sum x=1+2+3+2+1=9$, $\\sum h=2$, product $18$; $\\sum y=1+3+5+5+3+1=18$.',
  figSol:()=>{const a=P.Axes({w:1080,h:260,xr:[-3.6,4.6],yr:[-0.6,5.6],xlabel:'n',ylabel:'y[n]',
      pad:{l:52,r:28,t:30,b:34},xstep:1,ystep:1});
    a.stem(seq([1,3,5,5,3,1],-2),{color:C.out}); return a.svg();},
  err:'Placing the axis of symmetry at $n=0$, the centre of $x$ alone, and ignoring the half-sample offset $h$ itself contributes to the sum.',
  teach:'Ask for the general symmetry-addition rule — "centre of $x$ plus centre of $h$" — before the numbers are checked, so the rule is stated rather than only observed after the fact.' },

{ id:'D3-07', module:'M3', type:'dt-conv', src:'MT1 Q3',
  stem:'The sequences $x[n]$ and $h[n]$ of a discrete-time LTI system are shown below.',
  figure:()=>pair(
    (()=>{const a=P.Axes({w:520,h:230,xr:[-1.6,4.6],yr:[-0.6,1.6],xlabel:'n',ylabel:'x[n]',
      pad:{l:44,r:24,t:26,b:32},xstep:1,ystep:1});
      a.stem(seq([1,1,1,1],0),{color:C.in}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:230,xr:[-1.6,3.6],yr:[-0.6,2.6],xlabel:'n',ylabel:'h[n]',
      pad:{l:44,r:24,t:26,b:32},xstep:1,ystep:1});
      a.stem(seq([1,2,1],0),{color:C.h}); return a.svg();})()),
  parts:['Compute and plot $y[n]=x[n]*h[n]$.',
         'Confirm that the peak value of $y[n]$ equals $\\sum_n h[n]$, and state the two indices where the peak occurs.'],
  sol:'<b>Given.</b> $x[n]$ a rectangular pulse of height $1$ on $0\\le n\\le3$; $h[n]$ a weighted three-tap filter, $1,2,1$ on $n=0,1,2$.<br>'
     +'<b>Find.</b> $y[n]=x*h$ and its peak.<br>'
     +'<b>Method.</b> Since $x[n]=1$ on its support, $y[n]$ is the sum of $h$ over whichever four consecutive delays currently overlap that support: $y[n]=h[n]+h[n-1]+h[n-2]+h[n-3]$.<br>'
     +'<b>Solution — part (a).</b>$$y[n]=1,\\,3,\\,4,\\,4,\\,3,\\,1\\quad\\text{for}\\quad n=0,1,2,3,4,5,$$and zero elsewhere.<br>'
     +'<b>Solution — part (b).</b> $\\sum_n h[n]=1+2+1=4$, matching the peak value $4$, reached at $n=2$ and $n=3$ — the two positions where all three non-zero taps of $h$ sit inside the four-sample window where $x=1$, so every term of $h$ contributes at once.<br>'
     +'<b>Check.</b> Supports add: $x$ has width $4$, $h$ has width $3$, so $y$ has width $6=4+3-1$, matching the six samples found. Totals multiply: $\\sum x=4$, $\\sum h=4$, product $16$; $\\sum y=1+3+4+4+3+1=16$. The sequence is also a palindrome, $y[n]=y[5-n]$, consistent with the symmetry-addition rule of the previous question: $x$ is symmetric about $n=1.5$ and $h$ about $n=1$, so $y$ must be symmetric about $2.5$.',
  figSol:()=>{const a=P.Axes({w:1080,h:260,xr:[-1.6,6.6],yr:[-0.6,4.6],xlabel:'n',ylabel:'y[n]',
      pad:{l:52,r:28,t:30,b:34},xstep:1,ystep:1});
    a.stem(seq([1,3,4,4,3,1],0),{color:C.out}); return a.svg();},
  err:'Reading the peak as occurring at $n=0$ or $n=5$, the edges of $y$\'s support. The samples nearest the edges of a convolution of two non-negative signals are always the smallest, not the largest.',
  teach:'Ask the student to mark, before computing, at which shifts the shorter signal (here $h$) lies entirely inside the support of the longer one. That is where the peak must be.' },

{ id:'D3-08', module:'M3', type:'dt-conv', src:'MT1 Q3',
  stem:'The sequences $x[n]$ and $h[n]$ of a discrete-time LTI system are shown below.',
  figure:()=>pair(
    (()=>{const a=P.Axes({w:520,h:230,xr:[-1.6,3.6],yr:[-1.6,3.6],xlabel:'n',ylabel:'x[n]',
      pad:{l:44,r:24,t:26,b:32},xstep:1,ystep:1});
      a.stem(seq([2,-1,3],0),{color:C.in}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:230,xr:[-2.6,2.6],yr:[-1.6,1.6],xlabel:'n',ylabel:'h[n]',
      pad:{l:44,r:24,t:26,b:32},xstep:1,ystep:1});
      a.stem(seq([1,0,-1],-1),{color:C.h}); return a.svg();})()),
  parts:['Compute and plot $y[n]=x[n]*h[n]$.',
         'Show that $y[n]=x[n+1]-x[n-1]$ directly from the two non-zero locations of $h[n]$, and use it to check one sample of part (a) without repeating the full sum.'],
  sol:'<b>Given.</b> An asymmetric three-sample $x[n]$; the non-causal two-tap filter $h[n]=\\delta[n+1]-\\delta[n-1]$, a central-difference operator.<br>'
     +'<b>Find.</b> $y[n]=x*h$, and a shortcut formula for it.<br>'
     +'<b>Method.</b> Sift out the two non-zero locations of $h$ directly in the convolution sum, rather than flipping and sliding by eye.<br>'
     +'<b>Solution — part (a).</b>$$y[n]=2,\\,-1,\\,1,\\,1,\\,-3\\quad\\text{for}\\quad n=-1,0,1,2,3,$$and zero elsewhere.<br>'
     +'<b>Solution — part (b).</b> $y[n]=\\sum_k x[k]h[n-k]$, and $h[n-k]$ is non-zero only at $k=n+1$ (weight $1$) and $k=n-1$ (weight $-1$), so $y[n]=x[n+1]-x[n-1]$ for every $n$. At $n=1$: $x[2]-x[0]=3-2=1$, matching $y[1]=1$ in the table without summing over $k$ at all.<br>'
     +'<b>Check.</b> Supports add: $x$ has width $3$, $h$ has width $3$, so $y$ has width $5=3+3-1$, matching the five non-zero samples. Totals multiply: $\\sum h=1-1=0$, so $\\sum y$ must be $0$ regardless of $x$, and $2-1+1+1-3=0$ confirms it.',
  figSol:()=>{const a=P.Axes({w:1080,h:260,xr:[-2.6,4.6],yr:[-3.6,2.6],xlabel:'n',ylabel:'y[n]',
      pad:{l:52,r:28,t:30,b:34},xstep:1,ystep:1});
    a.stem(seq([2,-1,1,1,-3],-1),{color:C.out}); return a.svg();},
  err:'Writing $y[n]=x[n-1]-x[n+1]$, reversing the sign because the flipped $h$ was built by shifting first and reflecting second instead of the other way round.',
  teach:'Ask for the shortcut formula of part (b) to be derived before part (a) is attempted by the full sum. It turns a five-term computation into two lookups.' },

/* ---------- Type C — the convolution integral, closed form ---------- */

{ id:'D3-09', module:'M3', type:'ct-conv', src:'MT1 Q4',
  stem:'Let $x(t)=e^{-t}u(t)$ and $h(t)=u(t)-u(t-2)$.',
  figure:()=>pair(
    (()=>{const a=P.Axes({w:520,h:220,xr:[-1,5],yr:[-0.15,1.25],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',
      pad:{l:46,r:24,t:22,b:32},xstep:1,ystep:0.5});
      a.curve(t=>t>=0?Math.exp(-t):0,{color:C.in}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:220,xr:[-1,5],yr:[-0.15,1.25],xlabel:'t\\;(\\text{s})',ylabel:'h(t)',
      pad:{l:46,r:24,t:22,b:32},xstep:1,ystep:0.5});
      a.curve(t=>(t>=0&&t<=2)?1:0,{color:C.h}); return a.svg();})()),
  parts:['Compute $y(t)=x(t)*h(t)$ for $0\\le t<2$.',
         'Compute $y(t)$ for $t\\ge2$.',
         'Confirm the two branches agree at $t=2$, and state $\\lim_{t\\to\\infty}y(t)$.'],
  sol:'<b>Given.</b> A causal decaying exponential and a unit-height rectangular pulse on $[0,2]$.<br>'
     +'<b>Find.</b> $y(t)$ in both regions, and its behaviour at the join and at infinity.<br>'
     +'<b>Method.</b> $y(t)=\\int x(\\tau)h(t-\\tau)\\,\\d\\tau$; $h(t-\\tau)$ is non-zero for $t-2<\\tau<t$. Intersect that with $\\tau\\ge0$, the support of $x$.<br>'
     +'<b>Solution — part (a).</b> For $0\\le t<2$, $t-2<0$, so the overlap is $0\\le\\tau\\le t$:$$y(t)=\\int_0^t e^{-\\tau}\\,\\d\\tau=1-e^{-t}.$$'
     +'<b>Solution — part (b).</b> For $t\\ge2$, $t-2\\ge0$, so the overlap is $t-2\\le\\tau\\le t$:$$y(t)=\\int_{t-2}^{t}e^{-\\tau}\\,\\d\\tau=e^{-(t-2)}-e^{-t}=e^{-t}\\bigl(e^{2}-1\\bigr).$$'
     +'<b>Solution — part (c).</b> At $t=2$: branch (a) gives $1-e^{-2}$; branch (b) gives $e^{-2}(e^2-1)=1-e^{-2}$, equal. As $t\\to\\infty$, both terms of branch (b) vanish, so $y(t)\\to0$.<br>'
     +'<b>Check.</b> Because $h(t)=u(t)-u(t-2)$, the distributive property gives $y(t)=s(t)-s(t-2)$, where $s(t)=(1-e^{-t})u(t)$ is the step response of $x(t)$ alone. For $t\\ge2$: $s(t)-s(t-2)=(1-e^{-t})-(1-e^{-(t-2)})=e^{-(t-2)}-e^{-t}$, matching branch (b). For $0\\le t<2$: $s(t-2)=0$ since $t-2<0$, so $y(t)=s(t)=1-e^{-t}$, matching branch (a) — a route that never used the convolution integral directly.',
  figSol:()=>{const y=t=>t<0?0:(t<2?1-Math.exp(-t):Math.exp(-t)*(Math.exp(2)-1));
    const a=P.Axes({w:1080,h:270,xr:[-1,6],yr:[-0.1,1.05],xlabel:'t\\;(\\text{s})',ylabel:'y(t)',
      pad:{l:52,r:28,t:30,b:36},xstep:1,ystep:0.25});
    a.curve(y,{color:C.out,n:900});
    a.vline(2,{color:C.muted,opacity:.5});
    a.point(2,1-Math.exp(-2),{color:C.coral});
    return a.svg();},
  err:'Integrating over $0\\le\\tau\\le2$ for every $t\\ge2$, forgetting that the lower edge of the pulse, $\\tau=t-2$, has itself moved past $0$ and now sets the lower limit.',
  teach:'Have the student find the case boundary by equating the moving edge $t-2$ with the fixed edge $0$ before any integral is written. That single equation, $t=2$, is the whole of the case split.' },

{ id:'D3-10', module:'M3', type:'ct-conv', src:'MT1 Q4',
  stem:'Let $x(t)=1$ for $0<t<2$ and $h(t)=1$ for $0<t<3$, both zero elsewhere.',
  figure:()=>pair(
    (()=>{const a=P.Axes({w:520,h:220,xr:[-1,6],yr:[-0.15,1.25],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',
      pad:{l:46,r:24,t:22,b:32},xstep:1,ystep:0.5});
      a.curve(t=>(t>0&&t<2)?1:0,{color:C.in}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:220,xr:[-1,6],yr:[-0.15,1.25],xlabel:'t\\;(\\text{s})',ylabel:'h(t)',
      pad:{l:46,r:24,t:22,b:32},xstep:1,ystep:0.5});
      a.curve(t=>(t>0&&t<3)?1:0,{color:C.h}); return a.svg();})()),
  parts:['List the four case boundaries and say where each comes from.',
         'Compute $y(t)=x(t)*h(t)$ in each of the three non-zero cases.',
         'Verify that the total area under $y(t)$ equals the product of the two pulse widths.'],
  sol:'<b>Given.</b> Two rectangular pulses of unit height, widths $2$ and $3$.<br>'
     +'<b>Find.</b> The case boundaries, $y(t)$ in each region, and an area check.<br>'
     +'<b>Method.</b> $y(t)=\\int x(\\tau)h(t-\\tau)\\,\\d\\tau$; $x(\\tau)$ is non-zero on $(0,2)$, and $h(t-\\tau)$ is non-zero for $\\tau\\in(t-3,t)$. Equate the moving edges $t-3,t$ with the fixed edges $0,2$.<br>'
     +'<b>Solution — part (a).</b> $t-3=0\\Rightarrow t=3$; $t-3=2\\Rightarrow t=5$; and the edges of $x$ give $t=0$, $t=2$ directly. Four boundaries: $t=0,2,3,5$.<br>'
     +'<b>Solution — part (b).</b> The overlap length is the answer. $0<t<2$: overlap $(0,t)$, so $y(t)=t$. $2<t<3$: overlap $(0,2)$, so $y(t)=2$. $3<t<5$: overlap $(t-3,2)$, length $5-t$, so $y(t)=5-t$. Outside $[0,5]$, $y(t)=0$.<br>'
     +'<b>Solution — part (c).</b> The area is a rising triangle ($\\tfrac12\\cdot2\\cdot2=2$), a flat rectangle ($1\\cdot2=2$) and a falling triangle ($\\tfrac12\\cdot2\\cdot2=2$), total $6$. The two pulse widths are $2$ and $3$, and $2\\times3=6$.<br>'
     +'<b>Check.</b> Continuity at every boundary: $t=2$ gives $2$ from both branches, $t=3$ gives $2$ from both, $t=5$ gives $0$ from both — a convolution of two bounded signals cannot jump. Independently, the peak height, $2=\\min(2,3)$, must be the shorter of the two widths, reached whenever the shorter pulse sits entirely inside the longer one, which is exactly what happens for $2<t<3$.',
  figSol:()=>{const y=t=>t<0?0:(t<2?t:(t<3?2:(t<5?5-t:0)));
    const a=P.Axes({w:1080,h:270,xr:[-1,6],yr:[-0.2,2.5],xlabel:'t\\;(\\text{s})',ylabel:'y(t)',
      pad:{l:52,r:28,t:30,b:36},xstep:1,ystep:0.5});
    a.curve(y,{color:C.out,n:900});
    [2,3,5].forEach(b=>a.vline(b,{color:C.muted,opacity:.5}));
    return a.svg();},
  err:'Treating the middle case as $0<t<3$ by using only the edges of the longer pulse, and missing that the shorter pulse\'s own trailing edge, $t=2$, is a boundary too.',
  teach:'Ask for all four boundary equations to be written down before any case is integrated. A student who lists fewer than four boundaries has already lost a case.' },

{ id:'D3-11', module:'M3', type:'ct-conv', src:'MT1 Q4',
  stem:'Let $x(t)=e^{-2t}u(t)$ and $h(t)=e^{-3t}u(t)$.',
  parts:['Compute $y(t)=x(t)*h(t)$ for $t\\ge0$, stating the case for $t<0$ separately.',
         'Find the time $t^{*}$ at which $y(t)$ is maximum, and the peak value.',
         'Evaluate $y(0)$ directly from the convolution integral, without using the closed form of part (a).'],
  sol:'<b>Given.</b> Two causal decaying exponentials with different rates.<br>'
     +'<b>Find.</b> $y(t)$, its peak, and a direct check at $t=0$.<br>'
     +'<b>Method.</b> For $t<0$ the two supports never overlap, so $y(t)=0$. For $t\\ge0$: $y(t)=\\int_0^t e^{-2\\tau}e^{-3(t-\\tau)}\\,\\d\\tau=e^{-3t}\\displaystyle\\int_0^t e^{\\tau}\\,\\d\\tau$.<br>'
     +'<b>Solution — part (a).</b> $e^{-3t}\\bigl[e^{\\tau}\\bigr]_0^{t}=e^{-3t}(e^{t}-1)=e^{-2t}-e^{-3t}$, for $t\\ge0$; $y(t)=0$ for $t<0$.<br>'
     +'<b>Solution — part (b).</b>$$\\frac{\\d y}{\\d t}=-2e^{-2t}+3e^{-3t}=0\\;\\Longrightarrow\\;e^{-t}=\\tfrac23\\;\\Longrightarrow\\;t^{*}=\\ln\\tfrac32.$$The peak value is $y(t^{*})=\\left(\\tfrac23\\right)^{2}-\\left(\\tfrac23\\right)^{3}=\\tfrac49-\\tfrac{8}{27}=\\tfrac{4}{27}$.<br>'
     +'<b>Solution — part (c).</b> At $t=0$ the interval of integration $[0,0]$ has zero length, so $y(0)=\\int_0^0(\\cdots)\\,\\d\\tau=0$ directly, without evaluating any antiderivative.<br>'
     +'<b>Check.</b> $y(t)\\ge0$ for every $t\\ge0$, since $e^{-2t}\\ge e^{-3t}$ there — the output of a positive input convolved with a positive impulse response is never negative. A bound: dropping the subtracted term, $y(t)\\le e^{-2t}$ for all $t\\ge0$, and the peak $4/27\\approx0.148$ sits comfortably below $e^{-2t^{*}}=(2/3)^{2}=4/9\\approx0.444$.',
  figSol:()=>{const y=t=>t<0?0:Math.exp(-2*t)-Math.exp(-3*t);
    const a=P.Axes({w:1080,h:270,xr:[-1,4],yr:[-0.02,0.2],xlabel:'t\\;(\\text{s})',ylabel:'y(t)',
      pad:{l:52,r:28,t:30,b:36},xstep:1,ystep:0.05});
    a.curve(y,{color:C.out,n:900});
    a.point(Math.log(1.5),4/27,{color:C.coral});
    return a.svg();},
  err:'Integrating $e^{-2\\tau}e^{-3(t-\\tau)}$ over $0\\le\\tau\\le t$ but treating $e^{-3(t-\\tau)}$ as a constant with respect to $\\tau$, which drops the term $e^{3\\tau}$ that makes the antiderivative elementary in the first place.',
  teach:'This is the canonical exponential-times-exponential convolution. Ask the student to state the general result $y(t)=\\dfrac{e^{-at}-e^{-bt}}{b-a}u(t)$ for $x=e^{-at}u(t)$, $h=e^{-bt}u(t)$, $a\\ne b$, and check it against this specific case.' },

{ id:'D3-12', module:'M3', type:'ct-conv', src:'MT1 Q4',
  stem:'Let $x(t)=e^{3t}u(-t)$ and $h(t)=u(t-2)$.',
  figure:()=>pair(
    (()=>{const a=P.Axes({w:520,h:220,xr:[-3,4],yr:[-0.15,1.25],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',
      pad:{l:46,r:24,t:22,b:32},xstep:1,ystep:0.5});
      a.curve(t=>t<=0?Math.exp(3*t):0,{color:C.in}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:220,xr:[-3,4],yr:[-0.15,1.25],xlabel:'t\\;(\\text{s})',ylabel:'h(t)',
      pad:{l:46,r:24,t:22,b:32},xstep:1,ystep:0.5});
      a.curve(t=>t>=2?1:0,{color:C.h}); return a.svg();})()),
  parts:['Compute $y(t)=x(t)*h(t)$ for $t<2$.',
         'Compute $y(t)$ for $t\\ge2$.',
         'Confirm the two branches agree at $t=2$, and interpret the system as a delayed accumulator.'],
  sol:'<b>Given.</b> An anti-causal exponential rising toward $t=0$; a unit step switched on two seconds after the origin.<br>'
     +'<b>Find.</b> $y(t)$ in both regions and their join.<br>'
     +'<b>Method.</b> $y(t)=\\int x(\\tau)h(t-\\tau)\\,\\d\\tau$; $x(\\tau)$ is non-zero for $\\tau\\le0$, and $h(t-\\tau)=u(t-\\tau-2)$ is non-zero for $\\tau\\le t-2$. The overlap ends at $\\min(0,t-2)$.<br>'
     +'<b>Solution — part (a).</b> For $t<2$, $t-2<0$, so the overlap is $\\tau\\le t-2$:$$y(t)=\\int_{-\\infty}^{t-2}e^{3\\tau}\\,\\d\\tau=\\tfrac13e^{3(t-2)}.$$'
     +'<b>Solution — part (b).</b> For $t\\ge2$, $t-2\\ge0$, so the overlap is the whole support of $x$, $\\tau\\le0$:$$y(t)=\\int_{-\\infty}^{0}e^{3\\tau}\\,\\d\\tau=\\tfrac13.$$'
     +'<b>Solution — part (c).</b> At $t=2$: branch (a) gives $\\tfrac13e^{0}=\\tfrac13$, matching branch (b). $h(t)=u(t-2)$ is a step delayed by two seconds, so the system accumulates the whole area of $x$ up to two seconds ago; once the step edge has swept past the support of $x$ entirely, the output stops growing and holds at the total area.<br>'
     +'<b>Check.</b> The total area under $x$ is $\\int_{-\\infty}^{0}e^{3\\tau}\\,\\d\\tau=\\tfrac13$, exactly the level $y(t)$ settles at for $t\\ge2$ — a route that never split the integral into two cases. Branch (a) must be increasing, since the accumulator is still collecting area as the step edge sweeps rightward: $\\dfrac{\\d}{\\d t}\\left[\\tfrac13e^{3(t-2)}\\right]=e^{3(t-2)}>0$ for every $t$, confirming the branch never decreases before $t=2$.',
  figSol:()=>{const y=t=>t<2?(1/3)*Math.exp(3*(t-2)):1/3;
    const a=P.Axes({w:1080,h:270,xr:[-3,5],yr:[-0.03,0.42],xlabel:'t\\;(\\text{s})',ylabel:'y(t)',
      pad:{l:52,r:28,t:30,b:36},xstep:1,ystep:0.1});
    a.curve(y,{color:C.out,n:900});
    a.point(2,1/3,{color:C.coral});
    return a.svg();},
  err:'Writing the overlap as $\\tau\\le t-2$ for every $t$, including $t<2$ where the whole of $x$ (all of $\\tau\\le0$) actually lies to the *right* of $t-2$ and so is fully inside the window, which inverts which region is binding.',
  teach:'Ask for the two edges, $0$ (from $x$) and $t-2$ (from $h$, moving), to be compared before the integral is set up. Whichever is smaller sets the upper limit.' },

/* ---------- Type D — recovering h from an input-output pair ---------- */

{ id:'D3-13', module:'M3', type:'graph-h',
  stem:'A discrete-time LTI system has $x[n]=2\\delta[n+1]+\\delta[n]$ at its input. The measured output $y[n]$ is shown below. The system is known to be causal, with an impulse response at most three samples long.',
  figure:()=>pair(
    (()=>{const a=P.Axes({w:520,h:230,xr:[-2.6,2.6],yr:[-0.6,2.6],xlabel:'n',ylabel:'x[n]',
      pad:{l:44,r:24,t:26,b:32},xstep:1,ystep:1});
      a.stem(seq([2,1],-1),{color:C.in}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:230,xr:[-2.6,3.6],yr:[-1.6,5.6],xlabel:'n',ylabel:'y[n]',
      pad:{l:44,r:24,t:26,b:32},xstep:1,ystep:1});
      a.stem(seq([2,5,0,-1],-1),{color:C.out}); return a.svg();})()),
  parts:['Using $y[-1]$ alone, find $h[0]$.',
         'Using $y[0]$ and $h[0]$, find $h[1]$; then using $y[1]$, find $h[2]$.',
         'Confirm $h[2]$ against $y[2]$, without introducing a new unknown.'],
  sol:'<b>Given.</b> Input $x[n]=2\\delta[n+1]+\\delta[n]$; measured output non-zero at $n=-1,0,1,2$ with values $2,5,0,-1$; the system causal with taps $h[0],h[1],h[2]$ only.<br>'
     +'<b>Find.</b> $h[0]$, $h[1]$, $h[2]$.<br>'
     +'<b>Method.</b> Write $y[n]=\\sum_k x[k]h[n-k]=2h[n+1]+h[n]$, since $x[-1]=2$ and $x[0]=1$. Solve starting from the earliest non-zero sample of $y$, where only one unknown appears.<br>'
     +'<b>Solution — part (a).</b> At $n=-1$: $y[-1]=2h[0]+h[-1]=2h[0]$, because $h[-1]=0$ for a causal system. So $h[0]=\\dfrac{y[-1]}{2}=\\dfrac{2}{2}=1$.<br>'
     +'<b>Solution — part (b).</b> At $n=0$: $y[0]=2h[1]+h[0]=2h[1]+1=5$, so $h[1]=2$. At $n=1$: $y[1]=2h[2]+h[1]=2h[2]+2=0$, so $h[2]=-1$.<br>'
     +'<b>Solution — part (c).</b> With only three taps, $h[3]=0$, so $y[2]=2h[3]+h[2]=h[2]=-1$ — and the given value is $y[2]=-1$, confirming $h[2]$ without a new equation.<br>'
     +'<b>Check.</b> Supports add: $x$ occupies $-1\\le n\\le0$ (width $2$), $h$ occupies $0\\le n\\le2$ (width $3$), so $y$ must occupy $-1\\le n\\le2$ (width $4=2+3-1$), matching the four given samples. Totals multiply: $\\sum x=3$, $\\sum h=1+2-1=2$, product $6$; $\\sum y=2+5+0-1=6$.',
  figSol:()=>{const a=P.Axes({w:1080,h:260,xr:[-1.6,3.6],yr:[-1.6,2.6],xlabel:'n',ylabel:'h[n]',
      pad:{l:52,r:28,t:30,b:34},xstep:1,ystep:1});
    a.stem(seq([1,2,-1],0),{color:C.h}); return a.svg();},
  err:'Treating $y[-1]=2h[0]+h[-1]$ as an equation in two unknowns, by not using the given fact that the system is causal — which is exactly what sets $h[-1]=0$ and makes the first equation solvable on its own.',
  teach:'Ask why the earliest non-zero sample of $y$ is the one to start from, and what would go wrong starting from $y[1]$ instead, where two unknowns already appear together.' },

{ id:'D3-14', module:'M3', type:'graph-h', src:'MT1 Q3',
  stem:'A discrete-time LTI system has $x[n]=\\delta[n]+2\\delta[n-1]$ at its input. The measured output $y[n]$ is shown below. The system is known to be causal, with an impulse response at most three samples long.',
  figure:()=>pair(
    (()=>{const a=P.Axes({w:520,h:230,xr:[-1.6,2.6],yr:[-0.6,2.6],xlabel:'n',ylabel:'x[n]',
      pad:{l:44,r:24,t:26,b:32},xstep:1,ystep:1});
      a.stem(seq([1,2],0),{color:C.in}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:230,xr:[-1.6,4.6],yr:[-1.6,6.6],xlabel:'n',ylabel:'y[n]',
      pad:{l:44,r:24,t:26,b:32},xstep:1,ystep:1});
      a.stem(seq([2,3,1,6],0),{color:C.out}); return a.svg();})()),
  parts:['Using $y[0]$ alone, find $h[0]$.',
         'Using $y[1]$ and $h[0]$, find $h[1]$; then using $y[2]$, find $h[2]$.',
         'Confirm $h[2]$ against $y[3]$, without introducing a new unknown.'],
  sol:'<b>Given.</b> Input $x[n]=\\delta[n]+2\\delta[n-1]$; measured output non-zero at $n=0,1,2,3$ with values $2,3,1,6$; the system causal with taps $h[0],h[1],h[2]$ only.<br>'
     +'<b>Find.</b> $h[0]$, $h[1]$, $h[2]$.<br>'
     +'<b>Method.</b> $y[n]=\\sum_k x[k]h[n-k]=h[n]+2h[n-1]$, since $x[0]=1$, $x[1]=2$. Solve forward from $n=0$.<br>'
     +'<b>Solution — part (a).</b> $y[0]=h[0]+2h[-1]=h[0]$, using $h[-1]=0$, so $h[0]=2$.<br>'
     +'<b>Solution — part (b).</b> $y[1]=h[1]+2h[0]=h[1]+4=3$, so $h[1]=-1$. $y[2]=h[2]+2h[1]=h[2]-2=1$, so $h[2]=3$.<br>'
     +'<b>Solution — part (c).</b> With $h[3]=0$, $y[3]=h[3]+2h[2]=2h[2]=2(3)=6$, matching the given $y[3]=6$, an equation that was not used to find any of $h[0]$, $h[1]$, $h[2]$.<br>'
     +'<b>Check.</b> Supports add: $x$ occupies $0\\le n\\le1$ (width $2$), $h$ occupies $0\\le n\\le2$ (width $3$), so $y$ must occupy $0\\le n\\le3$ (width $4=2+3-1$), matching the four given samples. Totals multiply: $\\sum x=3$, $\\sum h=2-1+3=4$, product $12$; $\\sum y=2+3+1+6=12$.',
  figSol:()=>{const a=P.Axes({w:1080,h:260,xr:[-1.6,3.6],yr:[-1.6,3.6],xlabel:'n',ylabel:'h[n]',
      pad:{l:52,r:28,t:30,b:34},xstep:1,ystep:1});
    a.stem(seq([2,-1,3],0),{color:C.h}); return a.svg();},
  err:'Solving the equations out of order — starting from $y[2]$, which already involves both $h[1]$ and $h[2]$ together and cannot be solved on its own.',
  teach:'This question and the previous one use the same method with the roles of $x$ shifted. Ask whether the student can state the general rule — "the first non-zero sample of $y$ divided by the first non-zero sample of $x$" — before working through either by hand again.' },

{ id:'D3-15', module:'M3', type:'graph-h',
  stem:'A discrete-time LTI system has impulse response $h[n]=\\delta[n]-\\tfrac12\\delta[n-1]$, shown below.',
  figure:()=>{const a=P.Axes({w:1080,h:230,xr:[-1.6,2.6],yr:[-0.9,1.6],xlabel:'n',ylabel:'h[n]',
      pad:{l:52,r:28,t:26,b:32},xstep:1,ystep:0.5});
    a.stem(seq([1,-0.5],0),{color:C.h}); return a.svg();},
  parts:['Find the impulse response $g[n]$ of the causal inverse system, defined by $h[n]*g[n]=\\delta[n]$.',
         'Determine whether $g[n]$ is causal and whether it is stable.',
         'Verify $h[n]*g[n]=\\delta[n]$ directly at $n=0,1,2$.'],
  sol:'<b>Given.</b> A causal, two-tap FIR impulse response.<br>'
     +'<b>Find.</b> The causal inverse $g[n]$, its causality and stability, and a direct check that the cascade is the identity.<br>'
     +'<b>Method.</b> Impose $h[n]*g[n]=\\delta[n]$ and expand the sum at each $n$. Because $h$ has only two taps, this becomes a first-order recursion for $g[n]$, iterated from rest.<br>'
     +'<b>Solution — part (a).</b> $h[0]g[n]+h[1]g[n-1]=\\delta[n]\\;\\Longrightarrow\\;g[n]-\\tfrac12g[n-1]=\\delta[n]\\;\\Longrightarrow\\;g[n]=\\tfrac12g[n-1]+\\delta[n]$, with $g[-1]=0$. Iterating: $g[0]=1$, $g[1]=\\tfrac12$, $g[2]=\\tfrac14$, and in general$$g[n]=\\left(\\tfrac12\\right)^{\\!n}u[n].$$'
     +'<b>Solution — part (b).</b> $g[n]=0$ for $n<0$, so $g$ is <b>causal</b>. $\\sum_n|g[n]|=\\displaystyle\\sum_{n=0}^{\\infty}\\left(\\tfrac12\\right)^{n}=\\dfrac{1}{1-1/2}=2<\\infty$, so $g$ is <b>stable</b>.<br>'
     +'<b>Solution — part (c).</b> $n=0$: $h[0]g[0]+h[1]g[-1]=1(1)+\\left(-\\tfrac12\\right)(0)=1$. $n=1$: $h[0]g[1]+h[1]g[0]=1\\left(\\tfrac12\\right)+\\left(-\\tfrac12\\right)(1)=0$. $n=2$: $h[0]g[2]+h[1]g[1]=1\\left(\\tfrac14\\right)+\\left(-\\tfrac12\\right)\\left(\\tfrac12\\right)=0$. All three match $\\delta[n]$.<br>'
     +'<b>Check.</b> The recursion $g[n]=\\tfrac12g[n-1]$ for $n\\ge1$ is the impulse response of the recursive accumulator met earlier in the module, with feedback coefficient $\\tfrac12$: such a system is causal and stable exactly when that coefficient has magnitude less than $1$. That is a second, general route to the conclusion of part (b), without summing any series.',
  figSol:()=>{const a=P.Axes({w:1080,h:260,xr:[-1.6,6.6],yr:[-0.2,1.3],xlabel:'n',ylabel:'g[n]',
      pad:{l:52,r:28,t:30,b:34},xstep:1,ystep:0.5});
    a.stem(disc(n=>n>=0?Math.pow(0.5,n):0,-1,6),{color:C.h}); return a.svg();},
  err:'Writing $g[n]=\\delta[n]/h[n]$, treating $h$ and $g$ as if they were ordinary numbers to be divided, which is meaningless for signals and does not use the actual convolution equation at all.',
  teach:'Ask why a causal two-tap FIR generically has an infinite, recursive causal inverse rather than a finite one — a finite inverse would need one of $h$\'s own zeros to cancel exactly, which does not happen here.' },

{ id:'D3-16', module:'M3', type:'graph-h',
  stem:'A discrete-time LTI system is driven by the unit step $x[n]=u[n]$. The measured output $y[n]$ is shown below.',
  figure:()=>pair(
    (()=>{const a=P.Axes({w:520,h:230,xr:[-1.6,5.6],yr:[-0.4,1.6],xlabel:'n',ylabel:'x[n]',
      pad:{l:44,r:24,t:26,b:32},xstep:1,ystep:1});
      a.stem(disc(n=>n>=0?1:0,-1,5),{color:C.in}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:230,xr:[-1.6,5.6],yr:[-0.6,5.6],xlabel:'n',ylabel:'y[n]',
      pad:{l:44,r:24,t:26,b:32},xstep:1,ystep:1});
      a.stem(seq([0,2,3,3,5,5,5],-1),{color:C.out}); return a.svg();})()),
  parts:['Explain why $h[n]=y[n]-y[n-1]$ when the input is $x[n]=u[n]$.',
         'Use that relation to find $h[0]$, $h[1]$, $h[2]$, $h[3]$.',
         'State $\\sum_n h[n]$ directly from the plotted $y[n]$, without adding the four values of part (b).'],
  sol:'<b>Given.</b> The standard step input $x[n]=u[n]$, and the measured step response $y[n]$, tabulated as $0,2,3,3,5,5,5,\\dots$ for $n=-1,0,1,2,3,4,5,\\dots$<br>'
     +'<b>Find.</b> $h[n]$, and its total by a shortcut.<br>'
     +'<b>Method.</b> For $x[n]=u[n]$, $y[n]=\\displaystyle\\sum_{k\\le n}h[k]$ is the running sum of $h$. Differencing a running sum recovers exactly the term that was just added.<br>'
     +'<b>Solution — part (a).</b> $y[n]-y[n-1]=\\displaystyle\\sum_{k\\le n}h[k]-\\sum_{k\\le n-1}h[k]=h[n]$, since every term but $k=n$ cancels.<br>'
     +'<b>Solution — part (b).</b> $h[0]=y[0]-y[-1]=2-0=2$. $h[1]=y[1]-y[0]=3-2=1$. $h[2]=y[2]-y[1]=3-3=0$. $h[3]=y[3]-y[2]=5-3=2$. ($h[4]=y[4]-y[3]=5-5=0$, confirming the response has settled.)<br>'
     +'<b>Solution — part (c).</b> $\\displaystyle\\sum_n h[n]$ is the final, settled level of the step response, $2+1+0+2=5$, because the running sum has, by the time it stops changing, picked up every non-zero term of $h$.<br>'
     +'<b>Check.</b> Rebuilding the running sum from the recovered taps $h=2,1,0,2$: the partial sums are $2,3,3,5$, exactly the table given, by a route that starts from $h$ instead of differencing $y$. The shortcut of part (c) — reading the plateau directly off the plot — agrees with the direct total $2+1+0+2=5$ found by adding four separate numbers.',
  figSol:()=>{const a=P.Axes({w:1080,h:260,xr:[-1.6,4.6],yr:[-0.6,2.6],xlabel:'n',ylabel:'h[n]',
      pad:{l:52,r:28,t:30,b:34},xstep:1,ystep:1});
    a.stem(seq([2,1,0,2],0),{color:C.h}); return a.svg();},
  err:'Differencing in the wrong direction, computing $y[n-1]-y[n]$, which produces $h[n]$ with every sign flipped and predicts a step response that falls where it should rise.',
  teach:'Ask what the plotted step response would look like if $h[n]$ had a negative sample, and have the student point to where in $y[n]$ that would show up — a level that drops, not one that simply rises less.' },

/* ---------- Type E — causality, stability, and the step response ---------- */

{ id:'D3-17', module:'M3', type:'h-props',
  stem:'Two discrete-time LTI systems have impulse responses $$h_1[n]=2^{\\,n}u[n]\\qquad\\text{and}\\qquad h_2[n]=\\left(\\tfrac13\\right)^{|n|}.$$$h_2[n]$ is shown below; it is two-sided.',
  figure:()=>{const a=P.Axes({w:1080,h:250,xr:[-4.6,4.6],yr:[-0.15,1.25],xlabel:'n',ylabel:'h_2[n]',
      pad:{l:52,r:28,t:26,b:32},xstep:1,ystep:0.5});
    a.stem(disc(n=>Math.pow(1/3,Math.abs(n)),-4,4),{color:C.h}); return a.svg();},
  parts:['Determine whether $h_1[n]$ is causal, and whether it is stable.',
         'Determine whether $h_2[n]$ is causal, and whether it is stable.',
         'Say what the pairing of these two results shows about the two properties.'],
  sol:'<b>Given.</b> A causal, growing geometric sequence, and a two-sided, decaying geometric sequence.<br>'
     +'<b>Find.</b> Causality and stability of each.<br>'
     +'<b>Method.</b> Causal exactly when $h[n]=0$ for $n<0$. Stable exactly when $\\sum_n|h[n]|<\\infty$.<br>'
     +'<b>Solution — part (a).</b> $h_1[n]=0$ for $n<0$, so $h_1$ is <b>causal</b>. $\\displaystyle\\sum_{n=0}^{\\infty}2^{\\,n}$ diverges, since the terms grow without bound, so $h_1$ is <b>not stable</b>.<br>'
     +'<b>Solution — part (b).</b> $h_2[-1]=\\tfrac13\\ne0$, so $h_2$ is <b>not causal</b>. $\\displaystyle\\sum_{n=-\\infty}^{\\infty}\\left(\\tfrac13\\right)^{|n|}=1+2\\sum_{n=1}^{\\infty}\\left(\\tfrac13\\right)^{n}=1+2\\cdot\\dfrac{1/3}{1-1/3}=1+1=2<\\infty$, so $h_2$ is <b>stable</b>.<br>'
     +'<b>Solution — part (c).</b> $h_1$ is causal but unstable; $h_2$ is stable but not causal. Each property holds for one system and fails for the other, so neither implies, nor forbids, the other.<br>'
     +'<b>Check.</b> An unstable system is one for which some bounded input produces an unbounded output. For $h_1$, the bounded input $x[n]=u[n]$ (bounded by $1$) gives $y[n]=\\displaystyle\\sum_{k=0}^{n}2^{\\,k}=2^{\\,n+1}-1$, which grows without bound as $n\\to\\infty$ — a concrete bounded-in, unbounded-out pair, confirming the instability by a route that never sums $|h_1|$ directly. For $h_2$, splitting the stability sum at $n=0$ and doubling the tail by the symmetry $h_2[n]=h_2[-n]$ is itself an independent way to total it: one centre term plus two identical geometric tails.',
  err:'Concluding that a two-sided impulse response must be unstable because "half of it is unbounded in extent" — length of support and stability are unrelated; a two-sided sequence that decays fast enough away from the origin, as here, is perfectly summable.',
  teach:'Ask for a third impulse response, causal and decaying, to be classified the same way, so the student sees a causal <em>and</em> stable case as well and does not associate one property with the other by pattern-matching these two examples alone.' },

{ id:'D3-18', module:'M3', type:'h-props',
  stem:'A continuous-time LTI system has impulse response $h(t)=e^{2t}u(-t)$.',
  parts:['Determine whether the system is causal.',
         'Determine whether it is stable.',
         'For the bounded input $x(t)=u(t)$, compute $y(t)=x(t)*h(t)$ explicitly and confirm it stays within the bound predicted by stability.'],
  sol:'<b>Given.</b> An anti-causal exponential impulse response.<br>'
     +'<b>Find.</b> Causality, stability, and an explicit bounded-input check.<br>'
     +'<b>Method.</b> Causal requires $h(t)=0$ for $t<0$; here $h$ is non-zero exactly there. Stability requires $\\int|h(t)|\\,\\d t<\\infty$.<br>'
     +'<b>Solution — part (a).</b> $h(t)=e^{2t}$ is non-zero for $t<0$, so the system is <b>not causal</b>.<br>'
     +'<b>Solution — part (b).</b>$$\\int_{-\\infty}^{\\infty}|h(t)|\\,\\d t=\\int_{-\\infty}^{0}e^{2t}\\,\\d t=\\left[\\tfrac12e^{2t}\\right]_{-\\infty}^{0}=\\tfrac12<\\infty,$$so the system is <b>stable</b>.<br>'
     +'<b>Solution — part (c).</b> $y(t)=\\displaystyle\\int_{-\\infty}^{0}e^{2\\tau}u(t-\\tau)\\,\\d\\tau$; the step is non-zero for $\\tau\\le t$, so the overlap with $\\tau\\le0$ ends at $\\min(0,t)$. For $t\\ge0$: $y(t)=\\int_{-\\infty}^{0}e^{2\\tau}\\,\\d\\tau=\\tfrac12$. For $t<0$: $y(t)=\\int_{-\\infty}^{t}e^{2\\tau}\\,\\d\\tau=\\tfrac12e^{2t}$.<br>'
     +'<b>Check.</b> The general BIBO bound is $|y(t)|\\le\\left(\\sup_t|x(t)|\\right)\\displaystyle\\int|h(\\tau)|\\,\\d\\tau=1\\cdot\\tfrac12=\\tfrac12$, for every $t$. The computed $y(t)$ never exceeds $\\tfrac12$: it equals $\\tfrac12$ for $t\\ge0$, and $\\tfrac12e^{2t}<\\tfrac12$ for $t<0$, since $e^{2t}<1$ there — the bound from part (b) and the direct computation of part (c) agree, without either being used to derive the other.',
  figSol:()=>{const y=t=>t<0?0.5*Math.exp(2*t):0.5;
    const a=P.Axes({w:1080,h:260,xr:[-3,3],yr:[-0.05,0.65],xlabel:'t\\;(\\text{s})',ylabel:'y(t)',
      pad:{l:52,r:28,t:30,b:34},xstep:1,ystep:0.2});
    a.hline(0.5,{color:C.muted,dash:'4 5'});
    a.curve(y,{color:C.out,n:700});
    return a.svg();},
  err:'Declaring the system unstable on sight, because $h(t)$ grows as $t\\to0^{-}$ from the left — but $h(t)$ is exactly zero for $t>0$, so the only question is whether the *area* under its non-zero part is finite, which it is.',
  teach:'This system is the continuous-time twin of $h_2[n]$ in the previous question: neither causal nor obviously bounded, yet stable, because stability is about the integral of the magnitude, not about the sign of $t$ where the response lives.' },

{ id:'D3-19', module:'M3', type:'h-props',
  stem:'A discrete-time LTI system has impulse response $h[n]=(0.6)^{n}u[n]$.',
  parts:['Find and plot the step response $s[n]=h[n]*u[n]$.',
         'Recover $h[n]$ from $s[n]$ using $h[n]=s[n]-s[n-1]$, and confirm it reproduces the given $h[n]$.',
         'State $\\lim_{n\\to\\infty}s[n]$ and identify it as $\\sum_n h[n]$.'],
  sol:'<b>Given.</b> A causal, decaying geometric impulse response with ratio $0.6$.<br>'
     +'<b>Find.</b> The step response, a check that differencing it recovers $h$, and its limit.<br>'
     +'<b>Method.</b> $s[n]=\\displaystyle\\sum_{k=-\\infty}^{n}h[k]$ is the running sum of $h$; for a causal geometric $h$ this is a finite geometric series.<br>'
     +'<b>Solution — part (a).</b>$$s[n]=\\sum_{k=0}^{n}(0.6)^{k}=\\frac{1-(0.6)^{n+1}}{1-0.6}=\\frac{1-(0.6)^{n+1}}{0.4}$$for $n\\ge0$; $s[n]=0$ for $n<0$.<br>'
     +'<b>Solution — part (b).</b>$$s[n]-s[n-1]=\\frac{\\bigl[1-(0.6)^{n+1}\\bigr]-\\bigl[1-(0.6)^{n}\\bigr]}{0.4}=\\frac{(0.6)^{n}(1-0.6)}{0.4}=(0.6)^{n},$$matching $h[n]$ for $n\\ge0$, and both $s[n]$ and $s[n-1]$ vanish for $n<0$, matching $h[n]=0$ there too.<br>'
     +'<b>Solution — part (c).</b> As $n\\to\\infty$, $(0.6)^{n+1}\\to0$, so $s[n]\\to\\dfrac{1}{0.4}=2.5$. This is exactly $\\displaystyle\\sum_{n=0}^{\\infty}h[n]$, since the running sum has, in the limit, added every term of $h$.<br>'
     +'<b>Check.</b> Iterating the recursion $s[n]=0.6\\,s[n-1]+1$ directly (from $s[-1]=0$): $s[0]=1$, $s[1]=1.6$, $s[2]=1.96$. The closed form gives $\\dfrac{1-0.6}{0.4}=1$, $\\dfrac{1-0.36}{0.4}=1.6$, $\\dfrac{1-0.216}{0.4}=1.96$ — the same three numbers, by a route that never used the closed-form derivation.',
  figSol:()=>{const s=n=>n<0?0:(1-Math.pow(0.6,n+1))/0.4;
    const a=P.Axes({w:1080,h:270,xr:[-1.6,10.6],yr:[-0.2,3.0],xlabel:'n',ylabel:'s[n]',
      pad:{l:52,r:28,t:30,b:34},xstep:1,ystep:0.5});
    a.hline(2.5,{color:C.muted,dash:'4 5'});
    a.stem(disc(s,-1,10),{color:C.out});
    a.note(10.2,2.66,'2.5',{anchor:'end',color:C.muted,fs:14});
    return a.svg();},
  err:'Confusing the step response with the impulse response itself, and plotting $s[n]$ as if it were $h[n]$ scaled — the step response of a decaying geometric $h$ rises monotonically to a plateau, it does not decay.',
  teach:'Part (b) is the general relation between the two: differencing the step response always recovers the impulse response, in either continuous or discrete time. Ask for the continuous-time analogue, $\\d s/\\d t=h(t)$, before the next question uses it.' },

{ id:'D3-20', module:'M3', type:'h-props',
  stem:'A continuous-time LTI system has impulse response $h(t)=e^{-4t}u(t)$.',
  parts:['Find and plot the step response $s(t)=h(t)*u(t)$.',
         'Recover $h(t)$ from $s(t)$ using $h(t)=\\d s/\\d t$, and confirm it reproduces the given $h(t)$ for $t>0$.',
         'State $\\lim_{t\\to\\infty}s(t)$ and identify it as $\\int h(t)\\,\\d t$.'],
  sol:'<b>Given.</b> A causal, decaying exponential impulse response with rate $4$.<br>'
     +'<b>Find.</b> The step response, a derivative check, and its final value.<br>'
     +'<b>Method.</b> $s(t)=\\displaystyle\\int_{-\\infty}^{t}h(\\tau)\\,\\d\\tau$ is the running integral of $h$.<br>'
     +'<b>Solution — part (a).</b>$$s(t)=\\int_0^t e^{-4\\tau}\\,\\d\\tau=\\left[-\\tfrac14e^{-4\\tau}\\right]_0^{t}=\\frac{1-e^{-4t}}{4}$$for $t\\ge0$; $s(t)=0$ for $t<0$.<br>'
     +'<b>Solution — part (b).</b> For $t>0$,$$\\frac{\\d s}{\\d t}=\\frac{\\d}{\\d t}\\left[\\frac{1-e^{-4t}}{4}\\right]=\\frac{4e^{-4t}}{4}=e^{-4t},$$matching $h(t)$ exactly.<br>'
     +'<b>Solution — part (c).</b> As $t\\to\\infty$, $e^{-4t}\\to0$, so $s(t)\\to\\dfrac14$. This limit equals $\\displaystyle\\int_0^{\\infty}e^{-4t}\\,\\d t=\\dfrac14$, the total area under $h(t)$, since the running integral has, in the limit, collected all of it.<br>'
     +'<b>Check.</b> A direct value: at $t=\\tfrac14$, $s\\!\\left(\\tfrac14\\right)=\\dfrac{1-e^{-1}}{4}\\approx0.158$. Differentiating the closed form at the same point gives $e^{-1}\\approx0.368=h\\!\\left(\\tfrac14\\right)$, matching part (b) at one specific instant rather than symbolically. The final value $\\tfrac14$ is also the standard total for an exponential pulse of unit initial height and rate $4$, worth checking on any first-order step response.',
  figSol:()=>{const s=t=>t<0?0:(1-Math.exp(-4*t))/4;
    const a=P.Axes({w:1080,h:270,xr:[-0.5,2.5],yr:[-0.02,0.34],xlabel:'t\\;(\\text{s})',ylabel:'s(t)',
      pad:{l:52,r:28,t:30,b:34},xstep:0.5,ystep:0.1});
    a.hline(0.25,{color:C.muted,dash:'4 5'});
    a.curve(s,{color:C.out,n:700});
    a.note(2.4,0.27,'0.25',{anchor:'end',color:C.muted,fs:14});
    return a.svg();},
  err:'Writing $s(t)=1-e^{-4t}$ without the factor $\\tfrac14$, by forgetting that integrating $e^{-4t}$ brings down a factor of $1/4$, not $1$.',
  teach:'Ask the student to state the discrete-time analogue from the previous question, $h[n]=s[n]-s[n-1]$, next to $h(t)=\\d s/\\d t$, side by side. A difference and a derivative are the same idea, once and for all, in the two settings the module keeps separate.' }

]);

window.DRILL_M3 = [

{ id:'m3-drill-map', module:'M3', nav:'Module 3 exam drill · question types',
  title:'Module 3 — what a question looks like', src:'pp. 14–21',
  objective:'Name the five recurring question shapes before the module is read.',
  keywords:'exam drill module 3 question types impulse response convolution causality stability taxonomy practice',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 3 · Exam drill', src:'pp. 14–21'},
  {t:'title', text:'Five shapes, and the method each one wants'},
  {t:'lede', text:'Questions on linear time-invariant systems come in five shapes. Read them now, before the module. You are not expected to be able to answer them yet — you are expected to recognise them when they arrive.'},
  {t:'raw', html:'<div style="height:10px"></div>'},
  {t:'drilltypes', module:'M3'}
]},

{ id:'m3-drill', module:'M3', nav:'Module 3 exam drill · questions',
  title:'Module 3 — exam drill', src:'pp. 14–21',
  objective:'Twenty open-ended questions in examination form, with worked solutions.',
  keywords:'exam drill module 3 questions practice impulse response convolution sum integral causality stability step response',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 3 · Exam drill D3-01 … D3-20', src:'pp. 14–21'},
  {t:'title', text:'Exam drill'},
  {t:'small', html:'Work each question on paper before opening its solution. Every solution ends with a <b>Check</b> step. In this module the cheap checks are: the supports of a convolution add and the totals multiply, a case boundary is continuous from both sides, and a running sum or integral settles at the total weight of the impulse response it was built from.'},
  {t:'rule', short:true},
  {t:'drill', module:'M3'}
]}

];
})();
