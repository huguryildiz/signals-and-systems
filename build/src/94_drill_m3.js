/* ==========================================================================
   Practice questions — Module 3.
   The module opens with two scenes: a taxonomy of the question types that
   keep coming back, and a pager of twenty open-ended questions in that
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
    asks:'A difference equation gives the relation between $x[n]$ and $y[n]$. Find the impulse response $h[n]$, then use it to find another output.',
    method:['Set $x[n]=\\delta[n]$ and read the relation as it stands.',
            'For a non-recursive relation, $h[n]$ is the list of coefficients placed at their delays.',
            'For a recursive relation, state the rest condition and compute $h[0]$, $h[1]$, and enough later samples to identify the pattern.',
            'State the support of $h$ before using it in any convolution.'],
    go:'m3-impulse' },
  { k:'dt-conv', name:'Convolution sum',
    asks:'Two sequences are given. Compute $y[n]=x[n]*h[n]$ and plot it.',
    method:['Write both sequences with their supports as inequalities in $k$.',
            'Decide which one to flip. Flip the shorter or simpler one.',
            'Find every case boundary from the support conditions before evaluating the sum.',
            'Check that the output support is the sum of the input supports and that the sample totals multiply.'],
    go:'m3-convsum' },
  { k:'ct-conv', name:'Convolution integral',
    asks:'Two continuous-time signals are given. Compute $y(t)=x(t)*h(t)$ and plot it, marking every breakpoint.',
    method:['Write $y(t)=\\int x(\\tau)h(t-\\tau)\\,\\d\\tau$ and mark the support of each factor in $\\tau$.',
            'Set each moving support edge equal to each fixed support edge. The resulting values are the case boundaries.',
            'Integrate case by case, with the limits read off the overlap.',
            'Check that adjacent formulas agree at each boundary, that the supports add, and that the areas multiply.'],
    go:'m3-convint' },
  { k:'graph-h', name:'Recovering the impulse response from an input-output pair',
    asks:'One input and its output are given as plots. Find $h[n]$.',
    method:['Write the input as a sum of shifted impulses.',
            'That turns $y[n]$ into a sum of shifted copies of $h[n]$.',
            'Start with the earliest output sample, because it contains the fewest unknown samples of $h[n]$, and solve forward.',
            'Check by convolving the recovered $h$ with the given input.'],
    go:'m3-convsum' },
  { k:'h-props', name:'Reading causality and stability off the impulse response',
    asks:'An impulse response is given. Decide whether the system is causal and whether it is stable.',
    method:['Causal exactly when $h[n]=0$ for $n<0$, or $h(t)=0$ for $t<0$.',
            'Stable exactly when $\\sum_n|h[n]|<\\infty$, or $\\int|h(t)|\\,\\d t<\\infty$.',
            'For a one-sided geometric sequence or exponential, test whether its magnitude decays away from the support edge.',
            'The two properties are independent. Neither implies the other.'],
    go:'m3-lti-props' },
  { k:'full', name:'A full-length question that combines several of the types above',
    asks:'A full question asks for the impulse response, the output for a given input, and one or more system properties.',
    method:['Find $h$ first because every later output is a convolution with it.',
            'For a difference equation, apply an impulse and iterate from rest. For an input-output pair, use the support widths to find the number of unknown samples of $h$, then solve from the earliest sample.',
            'If the input is a sum of impulses, form one shifted and scaled copy of $h$ for each impulse. If the input is a pulse, use the support overlap to set the convolution limits.',
            'Check the total and the support. In discrete time $\\sum_n y[n]=\\left(\\sum_n x[n]\\right)\\left(\\sum_n h[n]\\right)$, and the areas multiply in the same way in continuous time.'] }
];

CONTENT.DRILL = CONTENT.DRILL.concat([

/* ---------- Type A — impulse response from a difference equation ---------- */

{ id:'D3-01', module:'M3', type:'dt-h', src:'MT1 Q3',
  stem:'The input and output of a discrete-time LTI system are related by $$y[n]=2x[n]-x[n-1]+3x[n-3].$$',
  parts:['Determine and plot the impulse response $h[n]$.',
         'For the input $x[n]=u[n]-u[n-3]$, compute and plot $y[n]=x[n]*h[n]$.'],
  sol:'<b>Given.</b> A non-recursive relation with three terms, at delays $0$, $1$ and $3$.<br>'
     +'<b>Find.</b> $h[n]$, then the response to a three-sample rectangular input.<br>'
     +'<b>Method.</b> The impulse response is the output for $x[n]=\\delta[n]$, so substitute that input into the relation. Each term $c\\,x[n-n_0]$ then becomes $c\\,\\delta[n-n_0]$, which places the coefficient at its stated delay.<br>'
     +'<b>Solution — part (a).</b>$$h[n]=2\\delta[n]-\\delta[n-1]+3\\delta[n-3],$$that is $h[0]=2$, $h[1]=-1$, $h[2]=0$, $h[3]=3$, and zero elsewhere. The support is $0\\le n\\le3$.<br>'
     +'<b>Solution — part (b).</b> The input is $x[n]=1$ for $n=0,1,2$ and zero elsewhere, so$$y[n]=h[n]+h[n-1]+h[n-2].$$Sliding the three-term window across $h$:$$y[0]=2,\\quad y[1]=1,\\quad y[2]=1,\\quad y[3]=2,\\quad y[4]=3,\\quad y[5]=3,$$and $y[n]=0$ otherwise.<br>'
     +'<b>Check.</b> The support must be $0\\le n\\le5$ because $[0,2]+[0,3]=[0,5]$; the six computed samples have this support. The totals must multiply: $\\sum h[n]=2-1+0+3=4$ and $\\sum x[n]=3$, so $\\sum y[n]=12$. The computed samples give $2+1+1+2+3+3=12$.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-1.6,4.6],yr:[-2.6,3.8],xlabel:'n',ylabel:'h[n]',
      pad:{l:46,r:26,t:30,b:34},xstep:1,ystep:1});
      a.stem(seq([2,-1,0,3],0),{color:C.h}); return a.svg();})(),
    (()=>{const H=[2,-1,0,3];const y=n=>[0,1,2].reduce((s,k)=>s+((n-k>=0&&n-k<=3)?H[n-k]:0),0);
      const a=P.Axes({w:520,h:250,xr:[-1.6,7.6],yr:[-1.6,4.6],xlabel:'n',ylabel:'y[n]',
      pad:{l:46,r:26,t:30,b:34},xstep:1,ystep:1});
      a.stem(disc(y,-1,7),{color:C.out}); return a.svg();})()),
  err:'Placing the coefficients at the wrong index, most often by reading $3x[n-3]$ as a value at $n=-3$. The delay in the argument is the position in $h$, and its sign is not flipped.',
  teach:'Have the student state the support of $h$ before part (b). This support is needed to predict the support of $y$ and provides an independent check on the convolution.' },

{ id:'D3-02', module:'M3', type:'dt-h', src:'MT1 Q3',
  stem:'A discrete-time LTI system is described by $$y[n]=\\tfrac14\\,y[n-1]+x[n],$$and is initially at rest.',
  parts:['Determine and plot the impulse response $h[n]$.',
         'For the input $x[n]=u[n]$, compute and plot $y[n]$.',
         'State the limit of $y[n]$ as $n\\to\\infty$ and say what it means.'],
  sol:'<b>Given.</b> A first-order recursion with constant coefficients, at rest before the input arrives.<br>'
     +'<b>Find.</b> $h[n]$, the step response, and its limit.<br>'
     +'<b>Method.</b> Use $x[n]=\\delta[n]$ because the resulting output is $h[n]$, and iterate from the stated rest condition. For the second part, convolution with $u[n]$ forms the running sum of a causal $h[n]$.<br>'
     +'<b>Solution — part (a).</b> With $y[-1]=0$:$$h[0]=\\tfrac14(0)+1=1,\\quad h[1]=\\tfrac14(1)=\\tfrac14,\\quad h[2]=\\tfrac14\\!\\left(\\tfrac14\\right)=\\tfrac{1}{16},$$so$$h[n]=\\left(\\tfrac14\\right)^{\\!n}u[n].$$'
     +'<b>Solution — part (b).</b> With $x[n]=u[n]$,$$y[n]=\\sum_{k=0}^{n}\\left(\\tfrac14\\right)^{\\!n-k}=\\sum_{m=0}^{n}\\left(\\tfrac14\\right)^{\\!m}=\\frac{1-\\left(\\tfrac14\\right)^{n+1}}{1-\\tfrac14}$$for $n\\ge0$, that is$$y[n]=\\frac43\\left[1-\\left(\\tfrac14\\right)^{\\!n+1}\\right]u[n].$$'
     +'<b>Solution — part (c).</b> $\\left(\\tfrac14\\right)^{n+1}\\to0$, so $y[n]\\to\\tfrac43$. The system settles at $4/3$ times the height of the step.<br>'
     +'<b>Check.</b> Direct recursion with $x[n]=u[n]$ gives $y[0]=1$, $y[1]=\\tfrac14+1=\\tfrac54$, and $y[2]=\\tfrac14\\!\\left(\\tfrac54\\right)+1=\\tfrac{21}{16}$. The closed form gives the same three values. Its limit also equals $\\sum_n h[n]=\\dfrac{1}{1-1/4}=\\dfrac43$, as required for the final value of the step response.',
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
  teach:'The rest condition makes the recursion well posed. Require the student to state $y[-1]=0$ before the iteration so that the initial value is explicit.' },

{ id:'D3-03', module:'M3', type:'dt-h',
  stem:'A discrete-time LTI system is described by $$y[n]=x[n+1]-2x[n]+x[n-1],$$which uses a future value of the input and is therefore not causal.',
  parts:['Determine and plot the impulse response $h[n]$.',
         'For the input $x[n]=u[n+1]-u[n-2]$ (equal to $1$ at $n=-1,0,1$), compute and plot $y[n]=x[n]*h[n]$.',
         'Using only $\\sum_n h[n]$ and $\\sum_n x[n]$, state $\\sum_n y[n]$ without adding the samples of part (b), and confirm the two agree.'],
  sol:'<b>Given.</b> A three-tap, non-causal relation — the discrete second difference — and a three-sample rectangular input.<br>'
     +'<b>Find.</b> $h[n]$, $y[n]$, and a sum check that needs no addition of individual samples.<br>'
     +'<b>Method.</b> Substitute $x[n]=\\delta[n]$ because the output is then $h[n]$. Locate each impulse by setting its argument to zero. In particular, $\\delta[n+1]$ is non-zero at $n=-1$.<br>'
     +'<b>Solution — part (a).</b>$$h[n]=\\delta[n+1]-2\\delta[n]+\\delta[n-1],$$that is $h[-1]=1$, $h[0]=-2$, $h[1]=1$, and zero elsewhere.<br>'
     +'<b>Solution — part (b).</b> With $x[n]=1$ for $n=-1,0,1$, $y[n]=h[n+1]+h[n]+h[n-1]$. Sliding the window:$$y[-2]=1,\\quad y[-1]=-1,\\quad y[0]=0,\\quad y[1]=-1,\\quad y[2]=1,$$and $y[n]=0$ otherwise.<br>'
     +'<b>Solution — part (c).</b> $\\sum_n h[n]=1-2+1=0$ and $\\sum_n x[n]=3$, so $\\sum_n y[n]=0\\cdot3=0$ for this input. Adding the samples from part (b) gives $1-1+0-1+1=0$, which agrees.<br>'
     +'<b>Check.</b> Substitute the input directly into the original relation at $n=0$: $y[0]=x[1]-2x[0]+x[-1]=1-2(1)+1=0$, which matches part (b). Also, $\\sum_n h[n]=0$, so a constant input produces zero output. This agrees with the interpretation of the system as a discrete second difference.',
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
     +'<b>Method.</b> Apply an impulse to each system to find $h_1$ and $h_2$. For the cascade, convolve them because cascaded LTI systems have impulse response $h_1*h_2$. For the parallel connection, add them because the two outputs are added.<br>'
     +'<b>Solution — part (a).</b>$$h_1[n]=\\delta[n]+\\delta[n-1],\\qquad h_2[n]=\\delta[n]-\\delta[n-1],$$that is $h_1[0]=h_1[1]=1$ and $h_2[0]=1,\\,h_2[1]=-1$.<br>'
     +'<b>Solution — part (b).</b>$$h_c[0]=h_1[0]h_2[0]=1,\\quad h_c[1]=h_1[0]h_2[1]+h_1[1]h_2[0]=-1+1=0,\\quad h_c[2]=h_1[1]h_2[1]=-1,$$so$$h_c[n]=\\delta[n]-\\delta[n-2].$$'
     +'<b>Solution — part (c).</b>$$h_p[0]=1+1=2,\\qquad h_p[1]=1-1=0,$$so $h_p[n]=2\\delta[n]$ — a pure gain of $2$. The response to $x[n]=3\\delta[n-4]$ is $y[n]=h_p[n]*x[n]=2\\cdot3\\,\\delta[n-4]=6\\delta[n-4]$.<br>'
     +'<b>Check.</b> Commutativity requires $h_2*h_1$ to give the same result. It gives $h_2[0]h_1[0]=1$, $h_2[0]h_1[1]+h_2[1]h_1[0]=1-1=0$, and $h_2[1]h_1[1]=-1$. The total also agrees: $\\sum h_1=2$ and $\\sum h_2=0$, so $\\sum h_c=2\\cdot0=0$, and $1+0-1=0$.',
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
     +'<b>Method.</b> Use the two impulse terms in $h[n]$ directly. Convolution with $\\delta[n]$ returns $x[n]$, and convolution with $-\\delta[n-1]$ returns $-x[n-1]$. Therefore $y[n]=x[n]-x[n-1]$; extend $x[n]$ by zero outside its support before evaluating it.<br>'
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
     +'<b>Method.</b> The two impulses in $h[n]$ make $y[n]=x[n]+x[n-1]$. This form is shorter than evaluating the full sum and shows directly how each adjacent pair contributes.<br>'
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
     +'<b>Method.</b> Write the rectangular input as four shifted impulses of unit weight. Linearity then gives $y[n]=h[n]+h[n-1]+h[n-2]+h[n-3]$, so each output sample is the sum of the overlapping samples of $h$.<br>'
     +'<b>Solution — part (a).</b>$$y[n]=1,\\,3,\\,4,\\,4,\\,3,\\,1\\quad\\text{for}\\quad n=0,1,2,3,4,5,$$and zero elsewhere.<br>'
     +'<b>Solution — part (b).</b> $\\sum_n h[n]=1+2+1=4$, which equals the peak value. The peak occurs at $n=2$ and $n=3$, where all three non-zero samples of $h$ overlap the interval on which $x=1$.<br>'
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
     +'<b>Method.</b> Because $h$ has only two non-zero samples, use the sifting property in the convolution sum. This gives a two-term expression for $y[n]$ and avoids a longer shift table.<br>'
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
     +'<b>Method.</b> Use $y(t)=\\int x(\\tau)h(t-\\tau)\\,\\d\\tau$ because both factors have simple support conditions in $\\tau$. The shifted pulse is non-zero for $t-2<\\tau<t$; intersect this interval with $\\tau\\ge0$, the support of $x$.<br>'
     +'<b>Solution — part (a).</b> For $0\\le t<2$, $t-2<0$, so the overlap is $0\\le\\tau\\le t$:$$y(t)=\\int_0^t e^{-\\tau}\\,\\d\\tau=1-e^{-t}.$$'
     +'<b>Solution — part (b).</b> For $t\\ge2$, $t-2\\ge0$, so the overlap is $t-2\\le\\tau\\le t$:$$y(t)=\\int_{t-2}^{t}e^{-\\tau}\\,\\d\\tau=e^{-(t-2)}-e^{-t}=e^{-t}\\bigl(e^{2}-1\\bigr).$$'
     +'<b>Solution — part (c).</b> At $t=2$: branch (a) gives $1-e^{-2}$; branch (b) gives $e^{-2}(e^2-1)=1-e^{-2}$, equal. As $t\\to\\infty$, both terms of branch (b) vanish, so $y(t)\\to0$.<br>'
     +'<b>Check.</b> Since $h(t)=u(t)-u(t-2)$, distributivity gives $y(t)=s(t)-s(t-2)$, where $s(t)=(1-e^{-t})u(t)$. For $t\\ge2$, this gives $(1-e^{-t})-(1-e^{-(t-2)})=e^{-(t-2)}-e^{-t}$. For $0\\le t<2$, $s(t-2)=0$, so $y(t)=1-e^{-t}$. Both results match the two branches above.',
  figSol:()=>{const y=t=>t<0?0:(t<2?1-Math.exp(-t):Math.exp(-t)*(Math.exp(2)-1));
    const a=P.Axes({w:1080,h:270,xr:[-1,6],yr:[-0.1,1.05],xlabel:'t\\;(\\text{s})',ylabel:'y(t)',
      pad:{l:52,r:28,t:30,b:36},xstep:1,ystep:0.25});
    a.curve(y,{color:C.out,n:900});
    a.vline(2,{color:C.muted,opacity:.5});
    a.point(2,1-Math.exp(-2),{color:C.coral});
    return a.svg();},
  err:'Integrating over $0\\le\\tau\\le2$ for every $t\\ge2$, forgetting that the lower edge of the pulse, $\\tau=t-2$, has itself moved past $0$ and now sets the lower limit.',
  teach:'Before writing an integral, have the student set the moving edge $t-2$ equal to the fixed edge $0$. This gives the boundary $t=2$ and separates the two integration intervals.' },

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
     +'<b>Method.</b> Use $y(t)=\\int x(\\tau)h(t-\\tau)\\,\\d\\tau$. The fixed interval is $(0,2)$ and the moving interval is $(t-3,t)$. Set each moving edge equal to each fixed edge before integrating; these equations give every case boundary.<br>'
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
     +'<b>Method.</b> First intersect the causal supports. They do not overlap for $t<0$, and for $t\\ge0$ their overlap is $0\\le\\tau\\le t$. On this interval, factor out the part independent of $\\tau$: $y(t)=\\int_0^t e^{-2\\tau}e^{-3(t-\\tau)}\\,\\d\\tau=e^{-3t}\\displaystyle\\int_0^t e^{\\tau}\\,\\d\\tau$.<br>'
     +'<b>Solution — part (a).</b> $e^{-3t}\\bigl[e^{\\tau}\\bigr]_0^{t}=e^{-3t}(e^{t}-1)=e^{-2t}-e^{-3t}$, for $t\\ge0$; $y(t)=0$ for $t<0$.<br>'
     +'<b>Solution — part (b).</b>$$\\frac{\\d y}{\\d t}=-2e^{-2t}+3e^{-3t}=0\\;\\Longrightarrow\\;e^{-t}=\\tfrac23\\;\\Longrightarrow\\;t^{*}=\\ln\\tfrac32.$$The peak value is $y(t^{*})=\\left(\\tfrac23\\right)^{2}-\\left(\\tfrac23\\right)^{3}=\\tfrac49-\\tfrac{8}{27}=\\tfrac{4}{27}$.<br>'
     +'<b>Solution — part (c).</b> At $t=0$ the interval of integration $[0,0]$ has zero length, so $y(0)=\\int_0^0(\\cdots)\\,\\d\\tau=0$ directly, without evaluating any antiderivative.<br>'
     +'<b>Check.</b> Both input functions are non-negative, so their convolution must satisfy $y(t)\\ge0$. The formula has this property because $e^{-2t}\\ge e^{-3t}$ for $t\\ge0$. It also gives $y(t)\\le e^{-2t}$, and the peak $4/27\\approx0.148$ is below $e^{-2t^{*}}=(2/3)^{2}=4/9\\approx0.444$.',
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
     +'<b>Method.</b> Use the support conditions to set the upper integration limit. $x(\\tau)$ requires $\\tau\\le0$, and $h(t-\\tau)=u(t-\\tau-2)$ requires $\\tau\\le t-2$. Therefore the overlap ends at $\\min(0,t-2)$, and the active limit changes at $t=2$.<br>'
     +'<b>Solution — part (a).</b> For $t<2$, $t-2<0$, so the overlap is $\\tau\\le t-2$:$$y(t)=\\int_{-\\infty}^{t-2}e^{3\\tau}\\,\\d\\tau=\\tfrac13e^{3(t-2)}.$$'
     +'<b>Solution — part (b).</b> For $t\\ge2$, $t-2\\ge0$, so the overlap is the whole support of $x$, $\\tau\\le0$:$$y(t)=\\int_{-\\infty}^{0}e^{3\\tau}\\,\\d\\tau=\\tfrac13.$$'
     +'<b>Solution — part (c).</b> At $t=2$, branch (a) gives $\\tfrac13e^{0}=\\tfrac13$, which matches branch (b). Since $h(t)=u(t-2)$, the system integrates $x$ up to time $t-2$. After this upper limit reaches the end of the support of $x$, the output remains equal to the total area.<br>'
     +'<b>Check.</b> The total area under $x$ is $\\int_{-\\infty}^{0}e^{3\\tau}\\,\\d\\tau=\\tfrac13$, which equals the level of $y(t)$ for $t\\ge2$. Before $t=2$, the derivative is $\\dfrac{\\d}{\\d t}\\left[\\tfrac13e^{3(t-2)}\\right]=e^{3(t-2)}>0$, so the first branch increases as the integration interval grows.',
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
     +'<b>Method.</b> The two impulses in the input give $y[n]=\\sum_k x[k]h[n-k]=2h[n+1]+h[n]$. Start with the earliest non-zero output sample because causality removes the negative-index term and leaves one unknown. Then solve forward.<br>'
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
     +'<b>Method.</b> The two input samples give $y[n]=\\sum_k x[k]h[n-k]=h[n]+2h[n-1]$. Begin at $n=0$ because causality makes $h[-1]=0$, so the first equation contains only $h[0]$. Then solve forward.<br>'
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
     +'<b>Method.</b> An inverse must satisfy $h[n]*g[n]=\\delta[n]$. Expand this convolution. Because $h$ has two taps, the equation becomes a first-order recursion for $g[n]$. Use causality to set $g[-1]=0$ and iterate forward.<br>'
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
     +'<b>Method.</b> With $x[n]=u[n]$, convolution gives $y[n]=\\displaystyle\\sum_{k\\le n}h[k]$, the running sum of $h$. Subtract two consecutive running sums; all common terms cancel and leave $h[n]$.<br>'
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
     +'<b>Method.</b> Test the two properties separately. Causality requires $h[n]=0$ for every $n<0$. BIBO stability requires the absolute sum $\\sum_n|h[n]|$ to be finite.<br>'
     +'<b>Solution — part (a).</b> $h_1[n]=0$ for $n<0$, so $h_1$ is <b>causal</b>. $\\displaystyle\\sum_{n=0}^{\\infty}2^{\\,n}$ diverges, since the terms grow without bound, so $h_1$ is <b>not stable</b>.<br>'
     +'<b>Solution — part (b).</b> $h_2[-1]=\\tfrac13\\ne0$, so $h_2$ is <b>not causal</b>. $\\displaystyle\\sum_{n=-\\infty}^{\\infty}\\left(\\tfrac13\\right)^{|n|}=1+2\\sum_{n=1}^{\\infty}\\left(\\tfrac13\\right)^{n}=1+2\\cdot\\dfrac{1/3}{1-1/3}=1+1=2<\\infty$, so $h_2$ is <b>stable</b>.<br>'
     +'<b>Solution — part (c).</b> $h_1$ is causal but unstable; $h_2$ is stable but not causal. Each property holds for one system and fails for the other, so neither implies, nor forbids, the other.<br>'
     +'<b>Check.</b> For $h_1$, the bounded input $x[n]=u[n]$ gives $y[n]=\\displaystyle\\sum_{k=0}^{n}2^{\\,k}=2^{\\,n+1}-1$, which is unbounded. This directly confirms that the system is not BIBO stable. For $h_2$, symmetry splits the absolute sum into one centre term and two equal geometric tails, which gives the same finite total found in part (b).',
  err:'Concluding that a two-sided impulse response must be unstable because "half of it is unbounded in extent" — length of support and stability are unrelated; a two-sided sequence that decays fast enough away from the origin, as here, is perfectly summable.',
  teach:'Ask for a third impulse response, causal and decaying, to be classified the same way, so the student sees a causal <em>and</em> stable case as well and does not associate one property with the other by pattern-matching these two examples alone.' },

{ id:'D3-18', module:'M3', type:'h-props',
  stem:'A continuous-time LTI system has impulse response $h(t)=e^{2t}u(-t)$.',
  parts:['Determine whether the system is causal.',
         'Determine whether it is stable.',
         'For the bounded input $x(t)=u(t)$, compute $y(t)=x(t)*h(t)$ explicitly and confirm it stays within the bound predicted by stability.'],
  sol:'<b>Given.</b> An anti-causal exponential impulse response.<br>'
     +'<b>Find.</b> Causality, stability, and an explicit bounded-input check.<br>'
     +'<b>Method.</b> Test causality from the support of $h(t)$ and stability from its absolute area. Causality requires $h(t)=0$ for $t<0$, while BIBO stability requires $\\int|h(t)|\\,\\d t<\\infty$.<br>'
     +'<b>Solution — part (a).</b> $h(t)=e^{2t}$ is non-zero for $t<0$, so the system is <b>not causal</b>.<br>'
     +'<b>Solution — part (b).</b>$$\\int_{-\\infty}^{\\infty}|h(t)|\\,\\d t=\\int_{-\\infty}^{0}e^{2t}\\,\\d t=\\left[\\tfrac12e^{2t}\\right]_{-\\infty}^{0}=\\tfrac12<\\infty,$$so the system is <b>stable</b>.<br>'
     +'<b>Solution — part (c).</b> $y(t)=\\displaystyle\\int_{-\\infty}^{0}e^{2\\tau}u(t-\\tau)\\,\\d\\tau$; the step is non-zero for $\\tau\\le t$, so the overlap with $\\tau\\le0$ ends at $\\min(0,t)$. For $t\\ge0$: $y(t)=\\int_{-\\infty}^{0}e^{2\\tau}\\,\\d\\tau=\\tfrac12$. For $t<0$: $y(t)=\\int_{-\\infty}^{t}e^{2\\tau}\\,\\d\\tau=\\tfrac12e^{2t}$.<br>'
     +'<b>Check.</b> The BIBO bound gives $|y(t)|\\le\\left(\\sup_t|x(t)|\\right)\\displaystyle\\int|h(\\tau)|\\,\\d\\tau=1\\cdot\\tfrac12=\\tfrac12$. The computed output reaches $\\tfrac12$ for $t\\ge0$. For $t<0$, it is $\\tfrac12e^{2t}<\\tfrac12$ because $e^{2t}<1$. Thus the explicit output satisfies the bound for every $t$.',
  figSol:()=>{const y=t=>t<0?0.5*Math.exp(2*t):0.5;
    const a=P.Axes({w:1080,h:260,xr:[-3,3],yr:[-0.05,0.65],xlabel:'t\\;(\\text{s})',ylabel:'y(t)',
      pad:{l:52,r:28,t:30,b:34},xstep:1,ystep:0.2});
    a.hline(0.5,{color:C.muted,dash:'4 5'});
    a.curve(y,{color:C.out,n:700});
    return a.svg();},
  err:'Declaring the system unstable on sight, because $h(t)$ grows as $t\\to0^{-}$ from the left — but $h(t)$ is exactly zero for $t>0$, so the only question is whether the *area* under its non-zero part is finite, which it is.',
  teach:'Compare this system with $h_2[n]$ in the previous question. Both are non-causal and stable. Stability depends on the integral or sum of the magnitude, not on whether the response lies at negative or positive times.' },

{ id:'D3-19', module:'M3', type:'h-props',
  stem:'A discrete-time LTI system has impulse response $h[n]=(0.6)^{n}u[n]$.',
  parts:['Find and plot the step response $s[n]=h[n]*u[n]$.',
         'Recover $h[n]$ from $s[n]$ using $h[n]=s[n]-s[n-1]$, and confirm it reproduces the given $h[n]$.',
         'State $\\lim_{n\\to\\infty}s[n]$ and identify it as $\\sum_n h[n]$.'],
  sol:'<b>Given.</b> A causal, decaying geometric impulse response with ratio $0.6$.<br>'
     +'<b>Find.</b> The step response, a check that differencing it recovers $h$, and its limit.<br>'
     +'<b>Method.</b> Convolution with $u[n]$ forms the running sum $s[n]=\\displaystyle\\sum_{k=-\\infty}^{n}h[k]$. Because $h$ is causal, the lower limit becomes $0$; because $h$ is geometric, evaluate the finite sum with the geometric-series formula.<br>'
     +'<b>Solution — part (a).</b>$$s[n]=\\sum_{k=0}^{n}(0.6)^{k}=\\frac{1-(0.6)^{n+1}}{1-0.6}=\\frac{1-(0.6)^{n+1}}{0.4}$$for $n\\ge0$; $s[n]=0$ for $n<0$.<br>'
     +'<b>Solution — part (b).</b>$$s[n]-s[n-1]=\\frac{\\bigl[1-(0.6)^{n+1}\\bigr]-\\bigl[1-(0.6)^{n}\\bigr]}{0.4}=\\frac{(0.6)^{n}(1-0.6)}{0.4}=(0.6)^{n},$$matching $h[n]$ for $n\\ge0$, and both $s[n]$ and $s[n-1]$ vanish for $n<0$, matching $h[n]=0$ there too.<br>'
     +'<b>Solution — part (c).</b> As $n\\to\\infty$, $(0.6)^{n+1}\\to0$, so $s[n]\\to\\dfrac{1}{0.4}=2.5$. This is exactly $\\displaystyle\\sum_{n=0}^{\\infty}h[n]$, since the running sum has, in the limit, added every term of $h$.<br>'
     +'<b>Check.</b> Starting from $s[-1]=0$, the recursion $s[n]=0.6\\,s[n-1]+1$ gives $s[0]=1$, $s[1]=1.6$, and $s[2]=1.96$. The closed form gives $\\dfrac{1-0.6}{0.4}=1$, $\\dfrac{1-0.36}{0.4}=1.6$, and $\\dfrac{1-0.216}{0.4}=1.96$. The two methods agree at the first three samples.',
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
     +'<b>Method.</b> Convolution with $u(t)$ forms the running integral $s(t)=\\displaystyle\\int_{-\\infty}^{t}h(\\tau)\\,\\d\\tau$. Use the causal support of $h$ to replace the lower limit by $0$ for $t\\ge0$.<br>'
     +'<b>Solution — part (a).</b>$$s(t)=\\int_0^t e^{-4\\tau}\\,\\d\\tau=\\left[-\\tfrac14e^{-4\\tau}\\right]_0^{t}=\\frac{1-e^{-4t}}{4}$$for $t\\ge0$; $s(t)=0$ for $t<0$.<br>'
     +'<b>Solution — part (b).</b> For $t>0$,$$\\frac{\\d s}{\\d t}=\\frac{\\d}{\\d t}\\left[\\frac{1-e^{-4t}}{4}\\right]=\\frac{4e^{-4t}}{4}=e^{-4t},$$matching $h(t)$ exactly.<br>'
     +'<b>Solution — part (c).</b> As $t\\to\\infty$, $e^{-4t}\\to0$, so $s(t)\\to\\dfrac14$. This limit equals $\\displaystyle\\int_0^{\\infty}e^{-4t}\\,\\d t=\\dfrac14$, the total area under $h(t)$, since the running integral has, in the limit, collected all of it.<br>'
     +'<b>Check.</b> At $t=\\tfrac14$, the formula gives $s\\!\\left(\\tfrac14\\right)=\\dfrac{1-e^{-1}}{4}\\approx0.158$. Its derivative gives $e^{-1}\\approx0.368=h\\!\\left(\\tfrac14\\right)$ at the same time. Also, the final value $\\tfrac14$ equals the total area under $h(t)$, as a step response must.',
  figSol:()=>{const s=t=>t<0?0:(1-Math.exp(-4*t))/4;
    const a=P.Axes({w:1080,h:270,xr:[-0.5,2.5],yr:[-0.02,0.34],xlabel:'t\\;(\\text{s})',ylabel:'s(t)',
      pad:{l:52,r:28,t:30,b:34},xstep:0.5,ystep:0.1});
    a.hline(0.25,{color:C.muted,dash:'4 5'});
    a.curve(s,{color:C.out,n:700});
    a.note(2.4,0.27,'0.25',{anchor:'end',color:C.muted,fs:14});
    return a.svg();},
  err:'Writing $s(t)=1-e^{-4t}$ without the factor $\\tfrac14$, by forgetting that integrating $e^{-4t}$ brings down a factor of $1/4$, not $1$.',
  teach:'Ask the student to state the discrete-time analogue from the previous question, $h[n]=s[n]-s[n-1]$, next to $h(t)=\\d s/\\d t$, side by side. A difference and a derivative are the same idea, once and for all, in the two settings the module keeps separate.' },

/* ----------------------------------------------------------------------
   Full-length questions. The impulse response first, the convolution
   after it, and the sum rule as the check on both.
   ---------------------------------------------------------------------- */

{ id:'D3-21', module:'M3', type:'full', src:'MT1 Q3',
  stem:'The input and output relationship of an LTI system is described as$$y[n]=3x[n]+x[n-2]+2x[n-3].$$',
  parts:['Determine and plot the impulse response of this LTI system, $h[n]$.',
         'For the input signal $x[n]=\\sum_{k=-1}^{2}k\\,\\delta[n-2k]$, compute and plot the output signal $y[n]=x[n]*h[n]$, using the discrete-time convolution.'],
  sol:'<b>Given.</b> A three-term moving average with weights $3$, $1$ and $2$ at lags $0$, $2$ and $3$.<br>'
     +'<b>Find.</b> The impulse response, and the response to a sum of four scaled impulses.<br>'
     +'<b>Method.</b> Apply $\\delta[n]$ to the system because the resulting output is $h[n]$. The second input is a sum of impulses, so linearity and time invariance make its output a sum of shifted and scaled copies of $h[n]$.<br>'
     +'<b>Solution — part (a).</b> Setting $x[n]=\\delta[n]$ leaves one term from each lag:$$h[n]=3\\delta[n]+\\delta[n-2]+2\\delta[n-3],$$so $h[0]=3$, $h[2]=1$, $h[3]=2$, and zero elsewhere.<br>'
     +'<b>Solution — part (b).</b> Write the input out. With $k$ running over $-1,0,1,2$ and the impulse sitting at $n=2k$,$$x[n]=-\\delta[n+2]+0\\cdot\\delta[n]+\\delta[n-2]+2\\delta[n-4],$$so $x[-2]=-1$, $x[2]=1$, $x[4]=2$, and zero elsewhere; the $k=0$ term vanishes because its weight is zero. Each surviving impulse contributes a copy of $h$:$$y[n]=-h[n+2]+h[n-2]+2h[n-4].$$Reading the three copies off $h$ and adding index by index,$$y[-2]=-3,\\;y[0]=-1,\\;y[1]=-2,\\;y[2]=3,\\;y[4]=7,\\;y[5]=2,\\;y[6]=2,\\;y[7]=4,$$and zero elsewhere. The value at $n=4$ is the only one where two copies overlap: $h[2]=1$ from the second copy and $2h[0]=6$ from the third.<br>'
     +'<b>Check.</b> The input samples total $-1+1+2=2$, and the impulse-response samples total $3+1+2=6$, so the output must total $12$:$$-3-1-2+3+7+2+2+4=12.$$The support must be $[-2,4]+[0,3]=[-2,7]$, which contains all computed output samples.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-1.6,4.6],yr:[-0.6,3.6],xlabel:'n',ylabel:'h[n]',
      pad:{l:48,r:26,t:28,b:34},xstep:1,ystep:1});
      a.stem([[0,3],[2,1],[3,2]],{color:C.h}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-3.6,8.6],yr:[-3.8,7.8],xlabel:'n',ylabel:'y[n]',
      pad:{l:48,r:26,t:28,b:34},xstep:2,ystep:2});
      a.stem([[-2,-3],[0,-1],[1,-2],[2,3],[4,7],[5,2],[6,2],[7,4]],{color:C.out}); return a.svg();})()),
  err:'Reading $\\sum_{k=-1}^{2}k\\,\\delta[n-2k]$ as four impulses at $n=-1,0,1,2$ with weight $k$. The impulse sits at $n=2k$, so the locations are $-2,0,2,4$ and they are two apart, not one.',
  teach:'The sum rule is the check to insist on here, because it costs one line and catches almost every arithmetic slip in a convolution. Ask for it before the plot is drawn.' },

{ id:'D3-22', module:'M3', type:'full', src:'MT1 Q3',
  stem:'In the figure below, the signal $x[n]$ is input into a linear time-invariant (LTI) system, resulting in $y[n]$ as the output.',
  parts:['Determine and plot the impulse response of this LTI system, $h[n]$. <em>Hint: attempt to express $y[n]$ as a function of $x[n]$.</em>',
         'Given the input signal $x_1[n]=2\\delta[n+1]-\\delta[n]+\\delta[n-2]$, sketch the output signal $y_1[n]=x_1[n]*h[n]$, using the discrete-time convolution.'],
  figure:()=>pair(
    (()=>{const a=P.Axes({w:520,h:230,xr:[-1.6,4.6],yr:[-0.6,3.8],xlabel:'n',ylabel:'x[n]',
      pad:{l:48,r:26,t:28,b:34},xstep:1,ystep:1});
      a.stem([[0,1],[1,3],[2,1]],{color:C.in}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:230,xr:[-1.6,4.6],yr:[-0.6,7.8],xlabel:'n',ylabel:'y[n]',
      pad:{l:48,r:26,t:28,b:34},xstep:1,ystep:2});
      a.stem([[0,1],[1,5],[2,7],[3,2]],{color:C.out}); return a.svg();})()),
  sol:'<b>Given.</b> $x[n]$ with samples $1,3,1$ at $n=0,1,2$, and $y[n]$ with samples $1,5,7,2$ at $n=0,1,2,3$.<br>'
     +'<b>Find.</b> The impulse response, and the response to a second input.<br>'
     +'<b>Method.</b> Use the support widths first to determine how many samples of $h$ are unknown: $N_h=N_y-N_x+1$. Then write the earliest convolution equation, which has the fewest unknowns, and solve the remaining equations in increasing order of $n$.<br>'
     +'<b>Solution — part (a).</b> $x$ occupies three samples and $y$ four, so $h$ occupies $4-3+1=2$ samples, beginning at $n=0$ because $y$ and $x$ both begin there. Write $h[0]=a$ and $h[1]=b$. The convolution gives, in order,$$y[0]=x[0]h[0]=a=1,$$$$y[1]=x[1]h[0]+x[0]h[1]=3+b=5\\;\\Rightarrow\\;b=2.$$So$$h[n]=\\delta[n]+2\\delta[n-1],$$that is, $y[n]=x[n]+2x[n-1]$.<br>'
     +'<b>Solution — part (b).</b> Apply that relation to $x_1$, which has $x_1[-1]=2$, $x_1[0]=-1$, $x_1[2]=1$:$$y_1[n]=x_1[n]+2x_1[n-1],$$giving $y_1[-1]=2$, $y_1[0]=-1+4=3$, $y_1[1]=0-2=-2$, $y_1[2]=1$, $y_1[3]=2$, and zero elsewhere.<br>'
     +'<b>Check.</b> The equations for $y[2]$ and $y[3]$ were not used to find $h$. Substitution gives $y[2]=x[2]h[0]+x[1]h[1]=1+6=7$ and $y[3]=x[2]h[1]=2$, which match the plot. For part (b), the sum rule gives $\\left(\\sum x_1\\right)\\left(\\sum h\\right)=2\\cdot3=6$, and the computed samples give $2+3-2+1+2=6$.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-1.6,3.6],yr:[-0.6,2.6],xlabel:'n',ylabel:'h[n]',
      pad:{l:48,r:26,t:28,b:34},xstep:1,ystep:1});
      a.stem([[0,1],[1,2]],{color:C.h}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-2.6,4.6],yr:[-2.8,3.8],xlabel:'n',ylabel:'y_1[n]',
      pad:{l:48,r:26,t:28,b:34},xstep:1,ystep:1});
      a.stem([[-1,2],[0,3],[1,-2],[2,1],[3,2]],{color:C.out}); return a.svg();})()),
  err:'Guessing $h$ from the ratio of the peaks, $7/3$, instead of solving the convolution equations in order. Only the first equation involves a single unknown; every later one has to be solved after the ones before it.',
  teach:'State the width rule $N_h=N_y-N_x+1$ before solving. It gives the number of unknown samples of $h$ and also tests whether the plotted support widths can belong to one LTI convolution.' },

{ id:'D3-23', module:'M3', type:'full', src:'MT1 Q3',
  stem:'The input and output relationship of an LTI system is described as$$y[n]=\\tfrac13y[n-1]+x[n].$$',
  parts:['Determine and plot the impulse response of this LTI system, $h[n]$.',
         'For the input signal $x[n]=u[n]$, compute and plot the output signal $y[n]=x[n]*h[n]$, using the discrete-time convolution.'],
  sol:'<b>Given.</b> A first-order recursive system with feedback coefficient $\\tfrac13$, at rest before the input arrives.<br>'
     +'<b>Find.</b> The impulse response and the step response.<br>'
     +'<b>Method.</b> Apply an impulse and iterate from rest because the resulting output is $h[n]$. Then convolve with $u[n]$; for a causal impulse response, this convolution is the running sum of $h[n]$.<br>'
     +'<b>Solution — part (a).</b> With $x[n]=\\delta[n]$ and $h[n]=0$ for $n<0$,$$h[0]=\\tfrac13\\cdot0+1=1,\\quad h[1]=\\tfrac13,\\quad h[2]=\\tfrac19,\\quad h[3]=\\tfrac1{27},$$and the pattern is clear:$$h[n]=\\left(\\tfrac13\\right)^{n}u[n].$$'
     +'<b>Solution — part (b).</b> Convolving with the step accumulates $h$:$$y[n]=\\sum_{k=-\\infty}^{\\infty}u[k]h[n-k]=\\sum_{m=0}^{n}\\left(\\tfrac13\\right)^{m}\\quad(n\\ge0),$$a finite geometric series. Summing it,$$y[n]=\\frac{1-\\left(\\tfrac13\\right)^{n+1}}{1-\\tfrac13}=\\frac32\\left[1-\\left(\\tfrac13\\right)^{n+1}\\right]u[n].$$The first values are $y[0]=1$, $y[1]=\\tfrac43$, $y[2]=\\tfrac{13}{9}$, and the sequence climbs to $\\tfrac32$.<br>'
     +'<b>Check.</b> Substitute into the difference equation: $y[1]=\\tfrac13y[0]+1=\\tfrac13+1=\\tfrac43$, which matches the result. Also, the step response must approach $\\sum_n h[n]=\\dfrac{1}{1-\\tfrac13}=\\tfrac32$, and the closed form has this limit.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-1.6,7.6],yr:[-0.2,1.3],xlabel:'n',ylabel:'h[n]',
      pad:{l:50,r:26,t:28,b:34},xstep:1,ystep:0.5});
      a.stem([[0,1],[1,1/3],[2,1/9],[3,1/27],[4,1/81],[5,1/243],[6,1/729],[7,1/2187]],{color:C.h}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-1.6,7.6],yr:[-0.2,1.8],xlabel:'n',ylabel:'y[n]',
      pad:{l:50,r:26,t:28,b:34},xstep:1,ystep:0.5});
      a.stem([[0,1],[1,4/3],[2,13/9],[3,40/27],[4,121/81],[5,364/243],[6,1093/729],[7,3280/2187]],{color:C.out});
      return a.svg();})()),
  err:'Reporting the step response as $\\tfrac32\\left[1-\\left(\\tfrac13\\right)^{n}\\right]$, with $n$ in place of $n+1$. That expression gives $y[0]=0$, but the system passes the input straight through at $n=0$, so $y[0]=1$.',
  teach:'The final-value check is the one to teach as a habit. A student who knows that the step response settles at $\\sum h[n]$ can test any answer of this kind in a single line, and the test catches an off-by-one in the exponent immediately.' },

{ id:'D3-24', module:'M3', type:'full', src:'MT1 Q4',
  stem:'Let $x(t)=e^{-2|t|}[u(t+1)-u(t-1)]$ be an input to the LTI system which has the following impulse response, $h(t)=u(t)$. Compute and plot the output signal $y(t)=x(t)*h(t)$, using the continuous-time convolution.',
  parts:['Write the convolution integral and identify the ranges of $t$ that need separate treatment.',
         'Evaluate the integral on each range and plot $y(t)$.'],
  sol:'<b>Given.</b> A two-sided decaying pulse cut off outside $|t|<1$, driving an integrator.<br>'
     +'<b>Find.</b> The output of the convolution.<br>'
     +'<b>Method.</b> Since $h(t)=u(t)$, convolution forms the running integral$$y(t)=\\int_{-\\infty}^{\\infty}x(\\tau)u(t-\\tau)\\,\\d\\tau=\\int_{-\\infty}^{t}x(\\tau)\\,\\d\\tau.$$The expression for $x(\\tau)$ changes at $\\tau=-1$, $0$, and $1$, so evaluate the running integral on the four intervals separated by these points.<br>'
     +'<b>Solution — part (a).</b> The breakpoints of the integral are the edges of the support and the kink at the origin, so the ranges are $t<-1$, $-1\\le t<0$, $0\\le t<1$ and $t\\ge1$.<br>'
     +'<b>Solution — part (b).</b> On $t<-1$ nothing has been accumulated, so $y(t)=0$. On $-1\\le t<0$,$$y(t)=\\int_{-1}^{t}e^{2\\tau}\\,\\d\\tau=\\tfrac12\\left(e^{2t}-e^{-2}\\right).$$At $t=0$ this has reached $\\tfrac12\\left(1-e^{-2}\\right)$. On $0\\le t<1$ the falling half is added,$$y(t)=\\tfrac12\\left(1-e^{-2}\\right)+\\int_{0}^{t}e^{-2\\tau}\\,\\d\\tau=\\tfrac12\\left(1-e^{-2}\\right)+\\tfrac12\\left(1-e^{-2t}\\right).$$For $t\\ge1$ the input is exhausted and the integral holds its value,$$y(t)=1-e^{-2}\\approx0.8647.$$'
     +'<b>Check.</b> The final value must be the total area under $x$, and it is:$$\\int_{-1}^{1}e^{-2|\\tau|}\\,\\d\\tau=2\\int_{0}^{1}e^{-2\\tau}\\,\\d\\tau=1-e^{-2},$$matching the plateau. The two pieces also join without a jump: at $t=0$ both expressions give $\\tfrac12\\left(1-e^{-2}\\right)\\approx0.4323$, and at $t=1$ the second gives $\\tfrac12\\left(1-e^{-2}\\right)+\\tfrac12\\left(1-e^{-2}\\right)=1-e^{-2}$, the plateau again. The output is continuous everywhere and rises fastest at $t=0$, where the input is largest.',
  figSol:()=>{const a=P.Axes({w:1080,h:270,xr:[-2.4,3.4],yr:[-0.1,1.05],xlabel:'t\\;(\\text{s})',ylabel:'y(t)',
      pad:{l:52,r:28,t:30,b:38},xstep:1,ystep:0.25});
    a.curve(t=> t<-1 ? 0 : t<0 ? 0.5*(Math.exp(2*t)-Math.exp(-2))
            : t<1 ? 0.5*(1-Math.exp(-2))+0.5*(1-Math.exp(-2*t)) : 1-Math.exp(-2),
      {color:C.out}); return a.svg();},
  err:'Treating $e^{-2|t|}$ as $e^{-2t}$ over the whole support. The exponent is $+2\\tau$ on the left half, and using $-2\\tau$ there makes the integral diverge at the lower limit instead of giving a finite rise.',
  teach:'Compute the input area before evaluating the convolution. For an integrator, the final output equals this area, so it provides an independent check on every piece of the result.' },

{ id:'D3-25', module:'M3', type:'full', src:'MT1 Q4',
  stem:'Let $$x(t)=\\begin{cases}e^{-3t},&0\\le t\\le1\\\\0,&\\text{otherwise}\\end{cases}$$be an input to the LTI system which has the following impulse response, $h(t)=u(t)-u(t-2)$. Compute the output signal $y(t)=x(t)*h(t)$, using the continuous-time convolution.',
  parts:['Identify the ranges of $t$ over which the overlap of $x(\\tau)$ and $h(t-\\tau)$ changes.',
         'Evaluate the convolution integral on each range and plot $y(t)$.'],
  sol:'<b>Given.</b> A decaying pulse of length $1$ driving a rectangular impulse response of length $2$.<br>'
     +'<b>Find.</b> The output of the convolution.<br>'
     +'<b>Method.</b> Use $y(t)=\\int x(\\tau)h(t-\\tau)\\,\\d\\tau$. The shifted pulse equals $1$ for $t-2\\le\\tau\\le t$. Intersect this interval with the support $0\\le\\tau\\le1$ of $x$ to obtain$$y(t)=\\int_{\\max(0,\\,t-2)}^{\\min(1,\\,t)}e^{-3\\tau}\\,\\d\\tau,$$and note that the active lower or upper limit changes at each case boundary.<br>'
     +'<b>Solution — part (a).</b> The window is $2$ long and the pulse $1$ long, so there are four ranges: no overlap for $t<0$; the window entering, $0\\le t<1$; the window covering the whole pulse, $1\\le t<2$; the window leaving, $2\\le t<3$; and no overlap again for $t\\ge3$.<br>'
     +'<b>Solution — part (b).</b> On $0\\le t<1$ the limits are $0$ and $t$:$$y(t)=\\int_{0}^{t}e^{-3\\tau}\\,\\d\\tau=\\tfrac13\\left(1-e^{-3t}\\right).$$On $1\\le t<2$ the window covers the pulse entirely, so$$y(t)=\\int_{0}^{1}e^{-3\\tau}\\,\\d\\tau=\\tfrac13\\left(1-e^{-3}\\right)\\approx0.3167,$$a plateau. On $2\\le t<3$ the lower limit becomes $t-2$:$$y(t)=\\int_{t-2}^{1}e^{-3\\tau}\\,\\d\\tau=\\tfrac13\\left(e^{-3(t-2)}-e^{-3}\\right).$$Outside $0\\le t<3$ the output is zero.<br>'
     +'<b>Check.</b> The pieces must join. At $t=1$ the first gives $\\tfrac13\\left(1-e^{-3}\\right)$, the plateau. At $t=2$ the third gives $\\tfrac13\\left(e^{0}-e^{-3}\\right)$, the plateau again. At $t=3$ it gives $\\tfrac13\\left(e^{-3}-e^{-3}\\right)=0$, so the output closes. The support is right too: convolution adds the supports, $[0,1]+[0,2]=[0,3]$, which is where the answer lives.',
  figSol:()=>{const a=P.Axes({w:1080,h:270,xr:[-1.2,4.4],yr:[-0.04,0.4],xlabel:'t\\;(\\text{s})',ylabel:'y(t)',
      pad:{l:60,r:28,t:30,b:38},xstep:1,ystep:0.1});
    a.curve(t=> t<0 ? 0 : t<1 ? (1-Math.exp(-3*t))/3
            : t<2 ? (1-Math.exp(-3))/3 : t<3 ? (Math.exp(-3*(t-2))-Math.exp(-3))/3 : 0,
      {color:C.out}); return a.svg();},
  err:'Using three ranges instead of four, by assuming the window enters and leaves without ever covering the pulse completely. The window is longer than the pulse, so there is a stretch where the whole pulse is inside it and the output is flat.',
  teach:'Then shorten $h$ to $u(t)-u(t-0.5)$. The interval in which the longer window covers the shorter signal changes, so compare the support lengths to determine whether a constant-output interval remains.' },

{ id:'D3-26', module:'M3', type:'full', src:'MT1 Q4',
  stem:'The $x(t)$ signal sketched below is an input to the LTI system with the impulse response $h(t)$, also sketched below. Compute and plot the output signal $y(t)=x(t)*h(t)$, using the continuous-time convolution.',
  parts:['Write $h(t)$ in terms of step functions and give its running integral.',
         'Evaluate the convolution and plot $y(t)$.'],
  figure:()=>pair(
    (()=>{const a=P.Axes({w:520,h:230,xr:[-2.4,3.4],yr:[-0.4,2.6],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',
      pad:{l:48,r:26,t:28,b:34},xstep:1,ystep:1});
      a.poly([[-2.4,0],[0,0],[0,2],[2,2],[2,0],[3.4,0]],{color:C.in}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:230,xr:[-2.4,2.4],yr:[-1.6,1.6],xlabel:'t\\;(\\text{s})',ylabel:'h(t)',
      pad:{l:48,r:26,t:28,b:34},xstep:1,ystep:1});
      a.poly([[-2.4,0],[-1,0],[-1,1],[0,1],[0,-1],[1,-1],[1,0],[2.4,0]],{color:C.h}); return a.svg();})()),
  sol:'<b>Given.</b> A rectangular input of height $2$ on $0<t<2$, and an impulse response that is $+1$ on $-1<t<0$ and $-1$ on $0<t<1$.<br>'
     +'<b>Find.</b> The output of the convolution.<br>'
     +'<b>Method.</b> The rectangular input limits the convolution to $0\\le\\tau\\le2$. Define the running integral $H(t)=\\int_{-\\infty}^{t}h(s)\\,\\d s$ and substitute $s=t-\\tau$. This converts the convolution into the difference of two values of $H$:$$y(t)=2\\int_{0}^{2}h(t-\\tau)\\,\\d\\tau=2\\int_{t-2}^{t}h(s)\\,\\d s=2\\left[H(t)-H(t-2)\\right].$$'
     +'<b>Solution — part (a).</b> In step form,$$h(t)=u(t+1)-2u(t)+u(t-1),$$and integrating,$$H(t)=\\begin{cases}0,&t<-1\\\\t+1,&-1\\le t<0\\\\1-t,&0\\le t<1\\\\0,&t\\ge1,\\end{cases}$$a triangle of height $1$ centred at the origin. Its total area is zero, which is why $H$ returns to zero.<br>'
     +'<b>Solution — part (b).</b> Taking $2[H(t)-H(t-2)]$ range by range:$$y(t)=\\begin{cases}2t+2,&-1\\le t<0\\\\2-2t,&0\\le t<1\\\\2-2t,&1\\le t<2\\\\2t-6,&2\\le t<3\\\\0,&\\text{otherwise.}\\end{cases}$$The middle two lines are the same expression, so the output is a triangle rising to $2$ at $t=0$, falling through zero at $t=1$, reaching $-2$ at $t=2$, and returning to zero at $t=3$.<br>'
     +'<b>Check.</b> The areas multiply: $x$ has area $2\\cdot2=4$ and $h$ has area $1-1=0$, so $y$ must have area zero. It does — the positive triangle on $[-1,1]$ has area $\\tfrac12\\cdot2\\cdot2=2$ and the negative one on $[1,3]$ has area $-2$. The support is right as well: $[0,2]+[-1,1]=[-1,3]$.',
  figSol:()=>{const a=P.Axes({w:1080,h:270,xr:[-2.2,4.2],yr:[-2.8,2.8],xlabel:'t\\;(\\text{s})',ylabel:'y(t)',
      pad:{l:52,r:28,t:30,b:38},xstep:1,ystep:1});
    a.poly([[-2.2,0],[-1,0],[0,2],[2,-2],[3,0],[4.2,0]],{color:C.out}); return a.svg();},
  err:'Reporting a support of $[0,3]$ by forgetting that $h$ begins at $t=-1$. The impulse response is not causal here, so the output starts before the input does, and the support runs from $-1$.',
  teach:'The area check is unusually informative in this question, because $h$ has zero area. Any answer whose positive and negative parts do not cancel exactly is wrong, and a student can see that before evaluating a single integral.' },

{ id:'D3-27', module:'M3', type:'full', src:'Final Q1',
  stem:'Consider a discrete-time <em>causal</em> LTI system where the output signal $y[n]$ is obtained when the input signal $x[n]$ is applied to this system. Both are plotted below.',
  parts:['Calculate and plot the impulse response of this LTI system.',
         'Determine and plot the output signal if the input signal is defined as $x_2[n]=(-1)^{n}$ for $0\\le n\\le3$, and zero otherwise.'],
  figure:()=>pair(
    (()=>{const a=P.Axes({w:520,h:230,xr:[-1.6,4.6],yr:[-0.6,3.8],xlabel:'n',ylabel:'x[n]',
      pad:{l:48,r:26,t:28,b:34},xstep:1,ystep:1});
      a.stem([[0,1],[1,1]],{color:C.in}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:230,xr:[-1.6,4.6],yr:[-0.6,3.8],xlabel:'n',ylabel:'y[n]',
      pad:{l:48,r:26,t:28,b:34},xstep:1,ystep:1});
      a.stem([[0,1],[1,3],[2,2]],{color:C.out}); return a.svg();})()),
  sol:'<b>Given.</b> $x[n]=\\delta[n]+\\delta[n-1]$, and $y[n]$ with samples $1,3,2$ at $n=0,1,2$. The system is causal and LTI.<br>'
     +'<b>Find.</b> The impulse response, and the response to a second input.<br>'
     +'<b>Method.</b> Use causality to set $h[n]=0$ for $n<0$. The earliest convolution equation then contains only $h[0]$. Solve that equation first and continue in increasing order of $n$.<br>'
     +'<b>Solution — part (a).</b> With $x[0]=x[1]=1$,$$y[0]=h[0]=1,$$$$y[1]=h[1]+h[0]=3\\;\\Rightarrow\\;h[1]=2,$$$$y[2]=h[2]+h[1]=2\\;\\Rightarrow\\;h[2]=0.$$Every later equation gives $h[n]=-h[n-1]$ with $h[2]=0$, so all remaining samples vanish and$$h[n]=\\delta[n]+2\\delta[n-1].$$'
     +'<b>Solution — part (b).</b> The relation is $y[n]=x[n]+2x[n-1]$. With $x_2=\\{1,-1,1,-1\\}$ on $0\\le n\\le3$,$$y_2[0]=1,\\;y_2[1]=-1+2=1,\\;y_2[2]=1-2=-1,\\;y_2[3]=-1+2=1,\\;y_2[4]=0-2=-2,$$and zero elsewhere.<br>'
     +'<b>Check.</b> The sum rule holds in both parts. In (a), $\\sum x=2$ and $\\sum y=6$, so $\\sum h$ must be $3$, and $1+2=3$. In (b), $\\sum x_2=0$, so $\\sum y_2$ must be zero: $1+1-1+1-2=0$. The support is right too, $[0,3]+[0,1]=[0,4]$.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-1.6,3.6],yr:[-0.6,2.6],xlabel:'n',ylabel:'h[n]',
      pad:{l:48,r:26,t:28,b:34},xstep:1,ystep:1});
      a.stem([[0,1],[1,2]],{color:C.h}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-1.6,5.6],yr:[-2.8,1.8],xlabel:'n',ylabel:'y_2[n]',
      pad:{l:48,r:26,t:28,b:34},xstep:1,ystep:1});
      a.stem([[0,1],[1,1],[2,-1],[3,1],[4,-2]],{color:C.out}); return a.svg();})()),
  err:'Stopping at $h[2]=0$ and assuming the impulse response ends there without saying why. The equations continue, and it is because $y[n]=0$ for $n\\ge3$ together with $h[2]=0$ that every later sample is forced to zero as well.',
  teach:'State the role of causality before solving. It sets every negative-index sample of $h$ to zero; without that condition, the convolution equations do not determine a unique impulse response.' },

{ id:'D3-28', module:'M3', type:'full', src:'Final Q1',
  stem:'Consider two discrete-time systems with input $x[n]$ and output $y[n]$, each defined by a difference equation and each initially at rest:$$\\text{S}_1:\\;y[n]=x[n]+2y[n-1],\\qquad\\text{S}_2:\\;y[n]=x[n]+\\tfrac12y[n-1].$$',
  parts:['Plot the impulse response of $\\text{S}_1$.',
         'For the impulse response obtained in part (a), state whether the system is stable or not.',
         'Repeat both parts for $\\text{S}_2$, and say what decides the difference.'],
  sol:'<b>Given.</b> Two first-order recursions differing only in the feedback coefficient, $2$ against $\\tfrac12$.<br>'
     +'<b>Find.</b> Both impulse responses, and the stability of each.<br>'
     +'<b>Method.</b> Apply $x[n]=\\delta[n]$ and iterate each recursion from rest to obtain its impulse response. Then use the LTI stability criterion $\\sum_n|h[n]|<\\infty$ to classify each system.<br>'
     +'<b>Solution — part (a).</b> For $\\text{S}_1$, starting from $h[n]=0$ for $n<0$,$$h[0]=1,\\;h[1]=2,\\;h[2]=4,\\;h[3]=8,$$so$$h_1[n]=2^{n}u[n],$$a one-sided geometric sequence that grows.<br>'
     +'<b>Solution — part (b).</b> <b>Not stable.</b>$$\\sum_{n=0}^{\\infty}\\left|2^{n}\\right|=\\sum_{n=0}^{\\infty}2^{n}=\\infty,$$so the absolute sum diverges. Concretely, the bounded input $x[n]=\\delta[n]$ already produces an output that grows without bound.<br>'
     +'<b>Solution — part (c).</b> For $\\text{S}_2$ the same iteration gives $h_2[n]=\\left(\\tfrac12\\right)^{n}u[n]$, and$$\\sum_{n=0}^{\\infty}\\left(\\tfrac12\\right)^{n}=\\frac{1}{1-\\tfrac12}=2<\\infty,$$so $\\text{S}_2$ is <b>stable</b>. What decides the difference is the magnitude of the feedback coefficient: a one-sided geometric sequence $a^{n}u[n]$ is absolutely summable exactly when $|a|<1$. At $|a|=1$ the sum still diverges, so the boundary case $y[n]=x[n]+y[n-1]$ — the accumulator, with $h[n]=u[n]$ — is unstable too.<br>'
     +'<b>Check.</b> Both impulse responses satisfy their own difference equations: for $\\text{S}_1$, $h[3]=0+2h[2]=8$; for $\\text{S}_2$, $h[3]=0+\\tfrac12h[2]=\\tfrac18$. And the stable one has a finite total, $2$, which is also the value its step response settles at — a number the unstable system has no counterpart for.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-1.6,5.6],yr:[-2,34],xlabel:'n',ylabel:'h_1[n]',
      pad:{l:52,r:26,t:28,b:34},xstep:1,ystep:8});
      a.stem([[0,1],[1,2],[2,4],[3,8],[4,16],[5,32]],{color:C.err}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-1.6,5.6],yr:[-0.15,1.2],xlabel:'n',ylabel:'h_2[n]',
      pad:{l:52,r:26,t:28,b:34},xstep:1,ystep:0.5});
      a.stem([[0,1],[1,0.5],[2,0.25],[3,0.125],[4,0.0625],[5,0.03125]],{color:C.h}); return a.svg();})()),
  err:'Calling $\\text{S}_1$ stable because every individual sample $2^{n}$ is finite. Stability asks for a bound that holds for all $n$ at once, and no finite bound holds for a sequence that doubles at every step.',
  teach:'The boundary case is the one to add out loud. Students remember $|a|<1$ as the condition and often assume $|a|=1$ is the harmless edge; the accumulator shows it is not, and it is the system they meet most often.' },

{ id:'D3-29', module:'M3', type:'full', src:'MT1 Q3',
  stem:'An LTI system has the impulse response $h[n]=\\delta[n]-\\delta[n-2]$.',
  parts:['Write the input-output difference equation of the system.',
         'For the input $x[n]=u[n]-u[n-4]$, compute and plot the output $y[n]=x[n]*h[n]$.',
         'State whether the system is causal and whether it is stable.'],
  sol:'<b>Given.</b> A two-tap impulse response with weights $+1$ at lag $0$ and $-1$ at lag $2$.<br>'
     +'<b>Find.</b> The difference equation, one convolution, and two properties.<br>'
     +'<b>Method.</b> Read the difference equation directly from the two impulse terms in $h$. For the rectangular input, use those same terms to write the output as the difference of two shifted copies of $x[n]$, which is shorter than evaluating the full sum.<br>'
     +'<b>Solution — part (a).</b> Reading the taps off $h$,$$y[n]=x[n]-x[n-2].$$'
     +'<b>Solution — part (b).</b> The input has $x[n]=1$ for $0\\le n\\le3$ and zero elsewhere. Then $y[n]=x[n]-x[n-2]$ gives$$y[0]=1,\\;y[1]=1,\\;y[2]=1-1=0,\\;y[3]=1-1=0,\\;y[4]=0-1=-1,\\;y[5]=0-1=-1,$$and zero elsewhere. The system passes the two edges of the pulse and cancels its flat interior.<br>'
     +'<b>Solution — part (c).</b> <b>Causal</b>, since $h[n]=0$ for $n<0$; the output uses only $x[n]$ and $x[n-2]$. <b>Stable</b>, since $\\sum_n|h[n]|=1+1=2<\\infty$.<br>'
     +'<b>Check.</b> The sum rule gives $\\sum y=(\\sum x)(\\sum h)=4(1-1)=0$, and the computed samples give $1+1+0+0-1-1=0$. The support is $[0,3]+[0,2]=[0,5]$. The zero samples in the interior also agree with the role of a difference operator: a constant region has no change to measure.',
  figSol:()=>{const a=P.Axes({w:1080,h:260,xr:[-1.6,7.6],yr:[-1.8,1.8],xlabel:'n',ylabel:'y[n]',
      pad:{l:50,r:28,t:30,b:34},xstep:1,ystep:1});
    a.stem([[0,1],[1,1],[2,0],[3,0],[4,-1],[5,-1]],{color:C.out}); return a.svg();},
  err:'Reporting a six-sample output that is non-zero throughout, by convolving without noticing that the two shifted copies overlap and cancel on $2\\le n\\le3$. The overlap is exactly where the pulse is flat.',
  teach:'Apply the filter to a constant input. The output is zero because $\\sum h[n]=0$. Record this result now; Module 6 will express the same fact through the frequency response.' },

{ id:'D3-30', module:'M3', type:'full', src:'MT1 Q4',
  stem:'Let $x(t)=u(t)-u(t-2)$ be an input to the LTI system which has the impulse response $h(t)=e^{-t}u(t)$.',
  parts:['Identify the ranges of $t$ over which the overlap changes, and write the convolution integral on each.',
         'Evaluate the integral and plot $y(t)=x(t)*h(t)$.',
         'State the value $y(t)$ approaches as $t\\to\\infty$ and explain it.'],
  sol:'<b>Given.</b> A rectangular pulse of height $1$ and length $2$ driving a one-sided decaying exponential.<br>'
     +'<b>Find.</b> The output, and its behaviour at large $t$.<br>'
     +'<b>Method.</b> Use $y(t)=\\int x(\\tau)h(t-\\tau)\\,\\d\\tau$. The exponential factor requires $\\tau\\le t$, while the pulse requires $0\\le\\tau\\le2$. Their intersection gives the limits $0$ and $\\min(2,t)$, so the upper limit changes at $t=2$.<br>'
     +'<b>Solution — part (a).</b> Three ranges: no overlap for $t<0$; a growing overlap for $0\\le t<2$, with limits $0$ and $t$; and the full pulse inside the exponential for $t\\ge2$, with limits $0$ and $2$.<br>'
     +'<b>Solution — part (b).</b> On $0\\le t<2$,$$y(t)=\\int_{0}^{t}e^{-(t-\\tau)}\\,\\d\\tau=e^{-t}\\int_{0}^{t}e^{\\tau}\\,\\d\\tau=e^{-t}\\left(e^{t}-1\\right)=1-e^{-t}.$$For $t\\ge2$,$$y(t)=\\int_{0}^{2}e^{-(t-\\tau)}\\,\\d\\tau=e^{-t}\\left(e^{2}-1\\right).$$The output rises towards $1$ while the pulse is on, reaching $1-e^{-2}\\approx0.8647$ at $t=2$, and decays exponentially afterwards.<br>'
     +'<b>Solution — part (c).</b> As $t\\to\\infty$, $y(t)=e^{-t}\\left(e^{2}-1\\right)\\to0$. The input has stopped and the impulse response decays, so nothing sustains the output. Unlike the integrator, this system forgets.<br>'
     +'<b>Check.</b> The two pieces join at $t=2$: the first gives $1-e^{-2}$ and the second $e^{-2}\\left(e^{2}-1\\right)=1-e^{-2}$, the same number. The support is $[0,2]+[0,\\infty)=[0,\\infty)$, and the output is indeed zero for $t<0$ and non-zero from $t=0$ on. The peak value is below $1$, which it must be: the output of a unit-area impulse response driven by a unit-height input can never exceed the input height.',
  figSol:()=>{const a=P.Axes({w:1080,h:270,xr:[-1.2,7.2],yr:[-0.1,1.1],xlabel:'t\\;(\\text{s})',ylabel:'y(t)',
      pad:{l:52,r:28,t:30,b:38},xstep:1,ystep:0.25});
    a.curve(t=> t<0 ? 0 : t<2 ? 1-Math.exp(-t) : Math.exp(-t)*(Math.exp(2)-1), {color:C.out}); return a.svg();},
  err:'Writing $y(t)=e^{-t}\\left(e^{2}-1\\right)$ for every $t>0$, by using the limits $0$ and $2$ before the pulse has finished. Until $t=2$ only part of the pulse has entered the window, and the upper limit is $t$.',
  teach:'Set the final value beside the previous question with $h(t)=u(t)$. There the output held its final value; here it returns to zero. The difference is whether $h$ has finite area with a decaying tail or an infinite one, and it is the same distinction as stability.' }

]);

window.DRILLMAP_M3 = [

{ id:'m3-drill-map', module:'M3', nav:'Module 3 · question types',
  title:'Module 3 — what a question looks like', src:'pp. 14–21',
  objective:'Name the six recurring question types before the module is read.',
  keywords:'practice questions module 3 question types impulse response convolution causality stability taxonomy practice',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 3 · Question types', src:'pp. 14–21'},
  {t:'title', text:'Six question types and the method for each'},
  {t:'lede', text:'This map lists five recurring question types in Module 3. Use it first to identify what the question asks, then follow the listed method. The later teaching scenes develop each method.'},
  {t:'raw', html:'<div style="height:10px"></div>'},
  {t:'drilltypes', module:'M3'}
]}

];

/* The questions themselves sit at the end of the module, after the teaching
   scenes. The taxonomy above sits in front of it: one is a map read before the
   work, the other is the work. */
window.DRILL_M3 = [

{ id:'m3-drill', module:'M3', nav:'Module 3 · practice questions',
  title:'Module 3 — practice questions', src:'pp. 14–21',
  objective:'Thirty open-ended questions with worked solutions, in the form they are asked in.',
  keywords:'practice questions module 3 practice impulse response convolution sum integral causality stability step response',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 3 · Practice D3-01 … D3-30', src:'pp. 14–21'},
  {t:'title', text:'Practice questions'},
  {t:'small', html:'Work each question on paper before opening its solution. Every solution ends with a <b>Check</b>. Check that convolution supports add and totals multiply. For piecewise results, confirm that adjacent formulas agree at each boundary. For a running sum or integral, compare the final value with the total sum or area of the impulse response.'},
  {t:'rule', short:true},
  {t:'drill', module:'M3'}
]}

];
})();
