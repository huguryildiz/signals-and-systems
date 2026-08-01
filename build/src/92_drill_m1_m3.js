/* ==========================================================================
   Exam drills — Modules 1, 2 and 3.
   Each module opens with two scenes: a taxonomy of the question types that
   recur in examinations, and a panel of open-ended questions in that form.
   The worked solution of every question is hidden until the reader asks for
   it, so a first pass shows the target and not the answer.
   ========================================================================== */
(function(){
const P = PLOT, C = P.COL;
const disc=(f,a,b)=>{const o=[];for(let n=Math.ceil(a);n<=b;n++)o.push([n,f(n)]);return o;};
const seq =(vals,n0)=>vals.map((v,i)=>[n0+i,v]);
const pair=(a,b)=>`<div class="dr-pair"><div>${a}</div><div>${b}</div></div>`;

/* ======================================================================
   MODULE 1 — Signal Foundations
   ====================================================================== */

CONTENT.DRILLTYPES.M1 = [
  { k:'period', name:'Periodicity and the fundamental period',
    asks:'A signal is given as a formula. Decide whether it repeats, and if it does, find the smallest period.',
    method:['In discrete time, test whether $\\omega_0/2\\pi$ is a ratio of two integers. If it is not, the sequence never repeats.',
            'If it is, write $N=(2\\pi/\\omega_0)k$ and take the smallest positive integer value.',
            'In continuous time every sinusoid repeats, with $T_0=2\\pi/|\\omega_0|$.',
            'For a sum, each term must repeat, and the period of the sum is the least common multiple of the individual periods.'],
    go:'m1-fundamental' },
  { k:'energy', name:'Energy, power, and which class a signal belongs to',
    asks:'Compute $E_\\infty$ or $P_\\infty$ for a given signal and classify it.',
    method:['Use the normalised definitions, $R=1\\,\\Omega$ throughout.',
            'Square the magnitude first, then integrate or sum over the whole axis.',
            'A finite $E_\\infty$ forces $P_\\infty=0$. A finite non-zero $P_\\infty$ forces $E_\\infty=\\infty$.',
            'Report both numbers, then name the class. One number alone does not classify.'],
    go:'m1-energy-inf' },
  { k:'transform', name:'Transformation of the independent variable',
    asks:'A signal is given by a plot or a formula. Plot $x(at+b)$ or $x[an+b]$.',
    method:['Write the transformation in the form $x(a t - b)$ and read off $a$ and $b$.',
            'Shift first, then scale or reflect. Doing it in the other order changes the sign of the shift.',
            'Map the edges of the support one at a time and check the width of the result.',
            'Verify one interior sample by direct substitution.'],
    go:'m1-combined' },
  { k:'evenodd', name:'Even and odd parts',
    asks:'Split a signal into its even and odd parts, and use the split.',
    method:['$\\Ev\\{x\\}=\\tfrac12[x(t)+x(-t)]$ and $\\Od\\{x\\}=\\tfrac12[x(t)-x(-t)]$.',
            'Build $x(-t)$ first, as a plot or a formula, and keep it visible.',
            'The two parts must add back to $x$. Check one point where $x$ is zero.',
            'The energies add: $E_x=E_{\\Ev}+E_{\\Od}$, because the two parts are orthogonal.'],
    go:'m1-evenodd' },
  { k:'impulse', name:'The impulse: sifting, scaling, and impulse trains',
    asks:'Evaluate an integral against an impulse, or sketch a sequence built from impulses.',
    method:['Sifting returns a number: $\\int x(t)\\delta(t-t_0)\\,\\d t=x(t_0)$.',
            'Sampling returns a signal: $x(t)\\delta(t-t_0)=x(t_0)\\delta(t-t_0)$.',
            'A scaled argument carries a factor: $\\delta(at-b)=\\frac{1}{|a|}\\delta\\!\\left(t-\\frac{b}{a}\\right)$.',
            'For a sum over $k$, find the impulse locations first, then read the period off the spacing.'],
    go:'m1-ct-impulse' }
];

CONTENT.DRILL = CONTENT.DRILL.concat([

{ id:'D1-01', module:'M1', type:'period', src:'MT1 Q1',
  stem:'Decide whether each sequence below is periodic. Where it is, give the fundamental period $N_0$.'
      +'$$\\text{(i)}\\;\\;x[n]=\\cos\\!\\left(\\tfrac{3\\pi}{7}n+\\tfrac{\\pi}{4}\\right)\\qquad\\text{(ii)}\\;\\;x[n]=e^{j2n}\\qquad\\text{(iii)}\\;\\;x[n]=\\cos\\!\\left(\\tfrac{n}{4}\\right)$$',
  parts:['Apply the periodicity test to each sequence.',
         'Give $N_0$ wherever it exists, and say why it does not exist otherwise.'],
  sol:'<b>Given.</b> Three discrete-time sinusoids.<br>'
     +'<b>Find.</b> Which repeat, and with what fundamental period.<br>'
     +'<b>Method.</b> A discrete-time sinusoid repeats only if $x[n]=x[n+N]$ for some positive <em>integer</em> $N$. That needs $\\omega_0N=2\\pi k$ with $k$ an integer, so$$\\frac{\\omega_0}{2\\pi}=\\frac{k}{N}$$must be rational. The phase never affects the test.<br>'
     +'<b>Solution — (i).</b> $\\omega_0=\\tfrac{3\\pi}{7}$, so $\\dfrac{\\omega_0}{2\\pi}=\\dfrac{3}{14}$, which is rational. Then $N=\\dfrac{2\\pi}{\\omega_0}k=\\dfrac{14}{3}k$ is an integer first at $k=3$, giving $N_0=14$. <b>Periodic.</b><br>'
     +'<b>Solution — (ii).</b> $\\omega_0=2$, so $\\dfrac{\\omega_0}{2\\pi}=\\dfrac{1}{\\pi}$, which is irrational. No integer $N$ works. <b>Not periodic.</b><br>'
     +'<b>Solution — (iii).</b> $\\omega_0=\\tfrac14$, so $\\dfrac{\\omega_0}{2\\pi}=\\dfrac{1}{8\\pi}$, again irrational. <b>Not periodic.</b><br>'
     +'<b>Check.</b> For (i), $\\cos\\!\\left(\\tfrac{3\\pi}{7}(n+14)+\\tfrac{\\pi}{4}\\right)=\\cos\\!\\left(\\tfrac{3\\pi}{7}n+6\\pi+\\tfrac{\\pi}{4}\\right)$, and $6\\pi$ is a whole number of turns. No smaller positive integer works, because $\\tfrac{14}{3}k$ is an integer only when $k$ is a multiple of $3$. The continuous-time signals $\\cos(2t)$ and $\\cos(t/4)$ are perfectly periodic — it is sampling on the integers that destroys the repetition in (ii) and (iii).',
  err:'Transferring the continuous-time rule and reporting a non-integer period such as $8\\pi$ for (iii). A period that is not an integer is not a period of a sequence.',
  teach:'Ask for the ratio $\\omega_0/2\\pi$ to be written down for all three before any of them is answered. A student who computes $2\\pi/\\omega_0$ instead has skipped the decisive step.' },

{ id:'D1-02', module:'M1', type:'period', src:'MT1 Q1',
  stem:'Let $$x[n]=\\cos\\!\\left(\\tfrac{\\pi}{3}n\\right)+\\sin\\!\\left(\\tfrac{\\pi}{4}n\\right).$$',
  parts:['Show that each term is periodic and give its period.',
         'Determine the fundamental period $N_0$ of $x[n]$ and the fundamental frequency.'],
  sol:'<b>Given.</b> A sum of two discrete-time sinusoids.<br>'
     +'<b>Find.</b> The fundamental period of the sum.<br>'
     +'<b>Method.</b> A sum repeats only when every term repeats. The period of the sum is then the least common multiple of the individual periods, which is the smallest length holding a whole number of each.<br>'
     +'<b>Solution — part (a).</b> For the first term $\\omega_1=\\tfrac{\\pi}{3}$, so $\\dfrac{\\omega_1}{2\\pi}=\\dfrac16$ and $N_1=6$. For the second $\\omega_2=\\tfrac{\\pi}{4}$, so $\\dfrac{\\omega_2}{2\\pi}=\\dfrac18$ and $N_2=8$. Both are rational, so both terms repeat.<br>'
     +'<b>Solution — part (b).</b>$$N_0=\\operatorname{lcm}(6,8)=24,$$and the fundamental frequency is $\\omega_0=\\dfrac{2\\pi}{24}=\\dfrac{\\pi}{12}$ rad/sample.<br>'
     +'<b>Check.</b> $24$ contains $4$ whole periods of the first term and $3$ of the second, so both return to their starting values together. Nothing smaller does: $12$ holds two periods of the first but only one and a half of the second. In terms of harmonics, the two terms are the $2$nd and the $3$rd harmonic of $\\pi/12$, which is consistent with $\\tfrac{\\pi}{3}=2\\cdot\\tfrac{\\pi}{12}$ and $\\tfrac{\\pi}{4}=3\\cdot\\tfrac{\\pi}{12}$.',
  err:'Multiplying the two periods to get $48$. The product is always a period, but it is the fundamental one only when the two are coprime.',
  teach:'Have the student verify $N_0$ by checking that $N_0/N_1$ and $N_0/N_2$ are both integers and that no smaller candidate has that property.' },

{ id:'D1-03', module:'M1', type:'period', src:'MT1 Q1',
  stem:'Decide whether each continuous-time signal is periodic. Where it is, give $T_0$ and $\\omega_0$.'
      +'$$\\text{(i)}\\;\\;x(t)=\\cos(4t)+\\sin(6t)\\qquad\\text{(ii)}\\;\\;x(t)=\\cos(t)+\\cos(\\pi t)$$',
  parts:['Give the period of each term separately.',
         'Decide whether the sum repeats, and give $T_0$ where it does.'],
  sol:'<b>Given.</b> Two sums of continuous-time sinusoids.<br>'
     +'<b>Find.</b> Whether each sum repeats, and its fundamental period.<br>'
     +'<b>Method.</b> Every continuous-time sinusoid is periodic, with $T=2\\pi/|\\omega|$. A sum repeats exactly when the ratio of the two periods is rational, and $T_0$ is then the smallest length containing a whole number of each.<br>'
     +'<b>Solution — (i).</b> $T_1=\\dfrac{2\\pi}{4}=\\dfrac{\\pi}{2}$ and $T_2=\\dfrac{2\\pi}{6}=\\dfrac{\\pi}{3}$. The ratio $\\dfrac{T_1}{T_2}=\\dfrac{3}{2}$ is rational, so the sum repeats. The smallest common length is$$T_0=\\pi=2T_1=3T_2,\\qquad\\omega_0=\\frac{2\\pi}{\\pi}=2\\;\\text{rad/s}.$$'
     +'<b>Solution — (ii).</b> $T_1=2\\pi$ and $T_2=\\dfrac{2\\pi}{\\pi}=2$. The ratio is $\\dfrac{2\\pi}{2}=\\pi$, which is irrational, so no common length exists and the sum is <b>not periodic</b>. Each term alone still is.<br>'
     +'<b>Check.</b> In (i) the two terms are the $2$nd and $3$rd harmonic of $\\omega_0=2$: $4=2\\cdot2$ and $6=3\\cdot2$. In (ii) no $\\omega_0$ makes both $1$ and $\\pi$ integer multiples, which is the same statement as $\\pi$ being irrational.<br>'
     +'<b>Contrast with discrete time.</b> In continuous time it is the <em>ratio</em> of two frequencies that must be rational. In discrete time each frequency has to satisfy its own rationality condition against $2\\pi$ first.',
  err:'Concluding from $T_1/T_2$ rational that $T_0=T_1T_2$. In (i) that would give $\\pi^2/6$, which is not a period of either term.',
  teach:'Case (ii) is the useful one. It shows that a sum of two perfectly periodic signals need not be periodic, which students find surprising and rarely forget afterwards.' },

{ id:'D1-04', module:'M1', type:'energy', src:'MT1 Q1',
  stem:'The signal $x(t)$ sketched below is zero outside $0\\le t\\le3$.',
  parts:['Calculate the total energy $E_\\infty$.',
         'Calculate the average power $P_\\infty$ and classify the signal.'],
  figure:()=>{const a=P.Axes({w:1080,h:250,xr:[-1.2,4.4],yr:[-0.4,2.6],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',
      pad:{l:52,r:28,t:30,b:38},xstep:1,ystep:1});
    a.poly([[-1.2,0],[0,0],[1,2],[2,2],[3,0],[4.4,0]],{color:C.in}); return a.svg();},
  sol:'<b>Given.</b> A trapezoidal pulse: $x(t)=2t$ on $0\\le t\\le1$, $x(t)=2$ on $1\\le t\\le2$, $x(t)=2(3-t)$ on $2\\le t\\le3$, zero elsewhere. Energy and power are normalised, $R=1\\,\\Omega$.<br>'
     +'<b>Find.</b> $E_\\infty$, $P_\\infty$, and the class.<br>'
     +'<b>Method.</b> Square first, then integrate over the whole axis. Outside the support the integrand is zero, so only three pieces contribute.<br>'
     +'<b>Solution — part (a).</b>$$E_\\infty=\\int_{0}^{1}4t^{2}\\,\\d t+\\int_{1}^{2}4\\,\\d t+\\int_{2}^{3}4(3-t)^{2}\\,\\d t=\\frac43+4+\\frac43=\\frac{20}{3}\\;\\text{J}\\approx6.667\\;\\text{J}.$$'
     +'<b>Solution — part (b).</b> The energy is finite, so$$P_\\infty=\\lim_{T\\to\\infty}\\frac{1}{2T}\\int_{-T}^{T}|x(t)|^{2}\\,\\d t=\\lim_{T\\to\\infty}\\frac{20/3}{2T}=0\\;\\text{W}.$$The signal is an <b>energy signal</b>.<br>'
     +'<b>Check.</b> The two sloping halves are mirror images, so their contributions must be equal — and they are, $\\tfrac43$ each. A bound: the pulse never exceeds $2$ and lasts $3$ seconds, so $E_\\infty\\le4\\cdot3=12$, and $\\tfrac{20}{3}$ sits inside that. Classification needs both numbers: $E_\\infty<\\infty$ <em>and</em> $P_\\infty=0$.',
  err:'Reporting $P_\\infty=20/9$ by averaging over the support instead of over $[-T,T]$ with $T\\to\\infty$. The averaging window is the whole axis, not the part where the signal is non-zero.',
  teach:'Ask for both numbers every time. A student who writes only $E_\\infty$ has not distinguished the energy class from the power class.' },

{ id:'D1-05', module:'M1', type:'energy', src:'MT1 Q1',
  stem:'Consider the two discrete-time signals $$x_1[n]=\\left(\\tfrac13\\right)^{\\!n}u[n],\\qquad x_2[n]=u[n].$$',
  parts:['Calculate $E_\\infty$ and $P_\\infty$ for $x_1[n]$.',
         'Calculate $E_\\infty$ and $P_\\infty$ for $x_2[n]$.',
         'Classify each signal.'],
  sol:'<b>Given.</b> A decaying geometric sequence and the unit step.<br>'
     +'<b>Find.</b> Energy, power and class for each.<br>'
     +'<b>Method.</b> In discrete time,$$E_\\infty=\\sum_{n=-\\infty}^{\\infty}|x[n]|^{2},\\qquad P_\\infty=\\lim_{N\\to\\infty}\\frac{1}{2N+1}\\sum_{n=-N}^{N}|x[n]|^{2}.$$'
     +'<b>Solution — part (a).</b>$$E_\\infty=\\sum_{n=0}^{\\infty}\\left(\\tfrac13\\right)^{\\!2n}=\\sum_{n=0}^{\\infty}\\left(\\tfrac19\\right)^{\\!n}=\\frac{1}{1-\\tfrac19}=\\frac98,$$which is finite, so $P_\\infty=0$.<br>'
     +'<b>Solution — part (b).</b> $|u[n]|^{2}=u[n]$, so the energy sum diverges: $E_\\infty=\\infty$. For the power, the window $-N\\le n\\le N$ contains $N+1$ non-zero samples out of $2N+1$, so$$P_\\infty=\\lim_{N\\to\\infty}\\frac{N+1}{2N+1}=\\frac12.$$'
     +'<b>Solution — part (c).</b> $x_1$ is an <b>energy signal</b>; $x_2$ is a <b>power signal</b>.<br>'
     +'<b>Check.</b> The two classes are mutually exclusive and neither is universal. The step has half the power of the constant sequence $x[n]=1$, whose power is $1$ — as expected, since the step is switched off for half the axis.',
  err:'Writing $P_\\infty=1$ for the step by averaging only over $n\\ge0$. The window is symmetric about the origin, and the zeros on the negative side count.',
  teach:'The counting argument $(N+1)/(2N+1)$ is worth demanding in writing. Students who quote $1/2$ from memory usually cannot produce it for $u[n-3]$, where the same limit still gives $1/2$.' },

{ id:'D1-06', module:'M1', type:'energy', src:'MT1 Q1',
  stem:'With the normalised convention $R=1\\,\\Omega$, consider $$x_1(t)=e^{-3t}u(t)\\;\\text{V},\\qquad x_2(t)=5\\cos(2t)\\;\\text{V}.$$',
  parts:['Calculate $E_\\infty$ for $x_1(t)$ and state $P_\\infty$.',
         'Calculate $P_\\infty$ for $x_2(t)$ and state $E_\\infty$.',
         'Explain in one sentence why no signal can have both a finite non-zero $P_\\infty$ and a finite $E_\\infty$.'],
  sol:'<b>Given.</b> A decaying exponential and a sinusoid, both in volts across $1\\,\\Omega$.<br>'
     +'<b>Find.</b> Energy, power, and the reason the two classes cannot overlap.<br>'
     +'<b>Method.</b> Square, then integrate over the axis for energy or average over a growing window for power. For a periodic signal the infinite average equals the average over one period.<br>'
     +'<b>Solution — part (a).</b>$$E_\\infty=\\int_{0}^{\\infty}e^{-6t}\\,\\d t=\\left[-\\tfrac16e^{-6t}\\right]_{0}^{\\infty}=\\tfrac16\\;\\text{J},$$finite, so $P_\\infty=0$.<br>'
     +'<b>Solution — part (b).</b> The signal has period $T_0=\\pi$, so$$P_\\infty=\\frac{1}{T_0}\\int_{0}^{T_0}25\\cos^{2}(2t)\\,\\d t=\\frac{25}{2}=12.5\\;\\text{W},$$using $\\overline{\\cos^{2}}=\\tfrac12$. Since $P_\\infty\\neq0$, the energy is infinite.<br>'
     +'<b>Solution — part (c).</b> A finite non-zero average power sustained over an infinite interval already accumulates infinite energy. Formally $E_\\infty\\ge 2T\\!\\cdot\\!P_T$ with $P_T\\to P_\\infty>0$, and the right-hand side grows without bound.<br>'
     +'<b>Check.</b> The familiar result $P=A^{2}/2$ for a sinusoid of amplitude $A$ gives $25/2$ directly. The exponential result can be sanity-checked against $\\int_{0}^{\\infty}e^{-2at}\\d t=1/(2a)$ with $a=3$.',
  err:'Reporting $P_\\infty=25$ for the sinusoid by forgetting the factor $\\tfrac12$ from the time average of $\\cos^{2}$.',
  teach:'Part (c) is the only conceptual part and it is where marks are lost. Insist on an inequality, not a slogan.' },

{ id:'D1-07', module:'M1', type:'transform', src:'MT1 Q1',
  stem:'The signal $x(t)$ is sketched below: it rises linearly from $0$ at $t=-1$ to $1$ at $t=0$, stays at $1$ until $t=1$, and is zero elsewhere.',
  parts:['Plot $y(t)=x\\!\\left(1-\\tfrac{t}{2}\\right)$.',
         'State the support of $y(t)$ and check its width against the width of $x(t)$.'],
  figure:()=>{const a=P.Axes({w:1080,h:250,xr:[-2.2,2.4],yr:[-0.25,1.4],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',
      pad:{l:52,r:28,t:30,b:38},xstep:1,ystep:0.5});
    a.poly([[-2.2,0],[-1,0],[0,1],[1,1],[1,0],[2.4,0]],{color:C.in}); return a.svg();},
  sol:'<b>Given.</b> $x(t)=t+1$ on $-1\\le t\\le0$, $x(t)=1$ on $0\\le t\\le1$, zero elsewhere.<br>'
     +'<b>Find.</b> $y(t)=x\\!\\left(1-\\tfrac{t}{2}\\right)$.<br>'
     +'<b>Method.</b> Write the argument in the standard form $x(at-b)$: here $a=-\\tfrac12$ and $b=-1$. Shift first, then scale and reflect. Doing the two in the other order changes the sign of the shift, and that is where the marks go.<br>'
     +'<b>Solution — step 1, shift.</b> $v(t)=x(t+1)$ moves the support one second to the left, to $-2\\le t\\le0$.<br>'
     +'<b>Solution — step 2, scale and reflect.</b> $y(t)=v\\!\\left(-\\tfrac{t}{2}\\right)$ expands by $2$ and reflects, so the support $-2\\le t\\le0$ maps to $0\\le t\\le4$.<br>'
     +'<b>Solution — the formula.</b> Substituting directly,$$y(t)=\\begin{cases}1,&0\\le t\\le2,\\\\[2pt] 2-\\tfrac{t}{2},&2\\le t\\le4,\\\\[2pt] 0,&\\text{otherwise,}\\end{cases}$$because $1-\\tfrac{t}{2}$ lies in $[0,1]$ for $t\\in[0,2]$ and in $[-1,0]$ for $t\\in[2,4]$, where $x$ equals its argument plus one.<br>'
     +'<b>Check.</b> Width: $x$ occupies $2$ seconds, and expansion by $1/|a|=2$ must give $4$ seconds — which it does. Two sample points: $y(0)=x(1)=1$ and $y(4)=x(-1)=0$, both matching the plot. The rising edge of $x$ has become the falling edge of $y$, which is what the reflection does.',
  figSol:()=>{const y=t=>(t>=0&&t<=2)?1:(t>2&&t<=4)?2-t/2:0;
    const a=P.Axes({w:1080,h:270,xr:[-1.6,5.4],yr:[-0.25,1.4],xlabel:'t\\;(\\text{s})',ylabel:'y(t)',
      pad:{l:52,r:28,t:32,b:38},xstep:1,ystep:0.5});
    a.curve(y,{color:C.out});
    [0,2,4].forEach(t=>a.vline(t,{color:C.muted,opacity:.5}));
    return a.svg();},
  err:'Reflecting first and then shifting by $+1$, which produces $x\\!\\left(-\\tfrac{t}{2}-1\\right)$ and puts the result on the negative axis.',
  teach:'Ask for the intermediate signal $v(t)$ to be drawn. A student who goes straight to the answer cannot be corrected, because there is nothing to inspect.' },

{ id:'D1-08', module:'M1', type:'transform', src:'MT1 Q1',
  stem:'The sequence $x[n]$ is plotted below.',
  parts:['Plot $y[n]=x[-n+1]$.',
         'Plot $z[n]=x[n-2]$ and say which of the two operations changes the order of the samples.'],
  figure:()=>{const a=P.Axes({w:1080,h:260,xr:[-3.6,4.6],yr:[-2.6,3.6],xlabel:'n',ylabel:'x[n]',
      pad:{l:50,r:28,t:30,b:34},xstep:1,ystep:1});
    a.stem([[-2,1],[-1,3],[1,-2],[2,2]],{color:C.in}); return a.svg();},
  sol:'<b>Given.</b> $x[-2]=1$, $x[-1]=3$, $x[1]=-2$, $x[2]=2$, and zero elsewhere.<br>'
     +'<b>Find.</b> A reflection with a shift, and a plain shift.<br>'
     +'<b>Method.</b> For $y[n]=x[1-n]$, the sample originally at index $m$ moves to $n=1-m$. Map the four non-zero indices one at a time. For $z[n]=x[n-2]$, every sample moves two places to the right.<br>'
     +'<b>Solution — part (a).</b>$$m=-2\\to n=3,\\quad m=-1\\to n=2,\\quad m=1\\to n=0,\\quad m=2\\to n=-1,$$so $y[-1]=2$, $y[0]=-2$, $y[2]=3$, $y[3]=1$, and zero elsewhere.<br>'
     +'<b>Solution — part (b).</b> $z[0]=1$, $z[1]=3$, $z[3]=-2$, $z[4]=2$. The delay moves the pattern without disturbing it; only the reflection reverses the order of the samples.<br>'
     +'<b>Check.</b> Both operations preserve the number of non-zero samples, four, and the gap of one empty index inside the pattern. For (a), one direct substitution: $y[3]=x[1-3]=x[-2]=1$, as listed. The support $[-2,2]$ maps to $[-1,3]$ under $n\\mapsto1-n$, which is the same width reflected and moved.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-2.6,4.6],yr:[-2.6,3.6],xlabel:'n',ylabel:'y[n]',
      pad:{l:46,r:26,t:30,b:34},xstep:1,ystep:1});
      a.stem([[-1,2],[0,-2],[2,3],[3,1]],{color:C.out}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-1.6,5.6],yr:[-2.6,3.6],xlabel:'n',ylabel:'z[n]',
      pad:{l:46,r:26,t:30,b:34},xstep:1,ystep:1});
      a.stem([[0,1],[1,3],[3,-2],[4,2]],{color:C.mid}); return a.svg();})()),
  err:'Reading $x[-n+1]$ as "reflect, then shift right by one", which gives $x[-n-1]$ and puts the pattern in the wrong place.',
  teach:'The index-mapping table is the reliable method and it takes four lines. Discourage the shortcut of redrawing by eye.' },

{ id:'D1-09', module:'M1', type:'evenodd', src:'MT1 Q1',
  stem:'Let $x(t)=e^{-2t}u(t)$.',
  parts:['Find $\\Ev\\{x(t)\\}$ and $\\Od\\{x(t)\\}$ and plot both.',
         'Calculate $E_\\infty$ for $x(t)$, for its even part, and for its odd part.',
         'Comment on the relation between the three energies.'],
  sol:'<b>Given.</b> A causal decaying exponential.<br>'
     +'<b>Find.</b> Its even and odd parts, and the three energies.<br>'
     +'<b>Method.</b> Build $x(-t)=e^{2t}u(-t)$ first, then$$\\Ev\\{x\\}=\\tfrac12[x(t)+x(-t)],\\qquad\\Od\\{x\\}=\\tfrac12[x(t)-x(-t)].$$'
     +'<b>Solution — part (a).</b> The two pieces sit on opposite half-lines and never overlap, so$$\\Ev\\{x(t)\\}=\\tfrac12e^{-2|t|},\\qquad\\Od\\{x(t)\\}=\\tfrac12e^{-2t}u(t)-\\tfrac12e^{2t}u(-t).$$The even part is a two-sided decaying exponential of height $\\tfrac12$; the odd part is the same shape with its left half turned upside down, and it jumps from $-\\tfrac12$ to $\\tfrac12$ at the origin.<br>'
     +'<b>Solution — part (b).</b>$$E_x=\\int_{0}^{\\infty}e^{-4t}\\,\\d t=\\tfrac14,$$$$E_{\\Ev}=\\int_{-\\infty}^{\\infty}\\tfrac14e^{-4|t|}\\,\\d t=\\tfrac14\\cdot2\\cdot\\tfrac14=\\tfrac18,$$and by the same computation $E_{\\Od}=\\tfrac18$.<br>'
     +'<b>Solution — part (c).</b> $E_{\\Ev}+E_{\\Od}=\\tfrac18+\\tfrac18=\\tfrac14=E_x$. The energies add because the even and odd parts are orthogonal: the cross term $\\int \\Ev\\{x\\}\\Od\\{x\\}\\,\\d t$ is the integral of an odd function over a symmetric interval, and is therefore zero.<br>'
     +'<b>Check.</b> The two parts add back to $x$: for $t>0$ they give $\\tfrac12e^{-2t}+\\tfrac12e^{-2t}=e^{-2t}$, and for $t<0$ they give $\\tfrac12e^{2t}-\\tfrac12e^{2t}=0$. Both are as required.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-2.2,2.2],yr:[-0.15,0.7],xlabel:'t\\;(\\text{s})',ylabel:'\\Ev\\{x(t)\\}',
      pad:{l:56,r:26,t:32,b:38},xstep:1,ystep:0.25});
      a.curve(t=>0.5*Math.exp(-2*Math.abs(t)),{color:C.mid}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-2.2,2.2],yr:[-0.7,0.7],xlabel:'t\\;(\\text{s})',ylabel:'\\Od\\{x(t)\\}',
      pad:{l:56,r:26,t:32,b:38},xstep:1,ystep:0.25});
      a.curve(t=>t>0?0.5*Math.exp(-2*t):null,{color:C.mid});
      a.curve(t=>t<0?-0.5*Math.exp(2*t):null,{color:C.mid});
      return a.svg();})()),
  err:'Writing $\\Od\\{x\\}=\\tfrac12e^{-2|t|}\\operatorname{sgn}(t)$ and then claiming it is continuous at the origin. It is not: the odd part of a signal with a jump at $t=0$ inherits that jump.',
  teach:'The orthogonality argument in part (c) is the transferable result. Ask why the cross term vanishes rather than accepting the arithmetic coincidence.' },

{ id:'D1-10', module:'M1', type:'evenodd', src:'MT1 Q1',
  stem:'The sequence $x[n]$ equals $1$, $2$, $3$ at $n=0,1,2$ and is zero elsewhere.',
  parts:['Plot $x[-n]$.',
         'Plot $\\Ev\\{x[n]\\}$ and $\\Od\\{x[n]\\}$.',
         'Verify that the two parts add back to $x[n]$ at $n=-1$, $n=0$ and $n=2$.'],
  figure:()=>{const a=P.Axes({w:1080,h:250,xr:[-3.6,3.6],yr:[-0.4,3.6],xlabel:'n',ylabel:'x[n]',
      pad:{l:50,r:28,t:30,b:34},xstep:1,ystep:1});
    a.stem(seq([1,2,3],0),{color:C.in}); return a.svg();},
  sol:'<b>Given.</b> $x[0]=1$, $x[1]=2$, $x[2]=3$, zero elsewhere.<br>'
     +'<b>Find.</b> The reflection and the even and odd parts.<br>'
     +'<b>Method.</b> $x[-n]$ places the value $x[m]$ at index $-m$. Then$$\\Ev\\{x[n]\\}=\\tfrac12\\left(x[n]+x[-n]\\right),\\qquad\\Od\\{x[n]\\}=\\tfrac12\\left(x[n]-x[-n]\\right).$$'
     +'<b>Solution — part (a).</b> $x[-n]$ equals $3$, $2$, $1$ at $n=-2,-1,0$ and is zero elsewhere.<br>'
     +'<b>Solution — part (b).</b> Sample by sample,$$\\Ev\\{x\\}:\\;\\tfrac32,\\,1,\\,1,\\,1,\\,\\tfrac32\\quad\\text{at}\\quad n=-2,-1,0,1,2,$$$$\\Od\\{x\\}:\\;-\\tfrac32,\\,-1,\\,0,\\,1,\\,\\tfrac32\\quad\\text{at}\\quad n=-2,-1,0,1,2,$$and both are zero elsewhere.<br>'
     +'<b>Solution — part (c).</b> At $n=-1$: $1+(-1)=0=x[-1]$. At $n=0$: $1+0=1=x[0]$. At $n=2$: $\\tfrac32+\\tfrac32=3=x[2]$. All three agree.<br>'
     +'<b>Check.</b> The even part is symmetric about $n=0$ and the odd part is antisymmetric, with $\\Od\\{x\\}[0]=0$ as it must be for every sequence. Only $x[0]$ survives untouched into the even part, and it does: $\\Ev\\{x\\}[0]=x[0]=1$.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-3.6,3.6],yr:[-0.4,2],xlabel:'n',ylabel:'\\Ev\\{x[n]\\}',
      pad:{l:56,r:26,t:32,b:34},xstep:1,ystep:0.5});
      a.stem([[-2,1.5],[-1,1],[0,1],[1,1],[2,1.5]],{color:C.mid}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-3.6,3.6],yr:[-2,2],xlabel:'n',ylabel:'\\Od\\{x[n]\\}',
      pad:{l:56,r:26,t:32,b:34},xstep:1,ystep:0.5});
      a.stem([[-2,-1.5],[-1,-1],[0,0],[1,1],[2,1.5]],{color:C.mid}); return a.svg();})()),
  err:'Reflecting the plot about the vertical axis but leaving the sample at $n=0$ in place while also copying it to $n=0$ again, which doubles $x[0]$ in the even part.',
  teach:'The value $\\Od\\{x\\}[0]=0$ is a free check on every answer. If a student reports a non-zero odd part at the origin, the reflection was built incorrectly.' },

{ id:'D1-11', module:'M1', type:'impulse', src:'MT1 Q1',
  stem:'Evaluate each of the following.'
      +'$$\\text{(i)}\\;\\int_{-\\infty}^{\\infty}\\!\\left(2t^{2}-3\\right)\\bigl[\\delta(t+3)+\\delta(t-5)\\bigr]\\d t\\qquad'
      +'\\text{(ii)}\\;\\int_{-\\infty}^{\\infty}\\!e^{-t}\\cos(\\pi t)\\,\\delta(t-2)\\,\\d t\\qquad'
      +'\\text{(iii)}\\;\\int_{-\\infty}^{\\infty}\\!t^{2}\\,\\delta(3t-6)\\,\\d t$$',
  parts:['Evaluate the three integrals.',
         'State which property of the impulse each one uses, and say why the answer is a number rather than a signal.'],
  sol:'<b>Given.</b> Three integrals of an ordinary function against an impulse.<br>'
     +'<b>Find.</b> Their values, and the property behind each.<br>'
     +'<b>Method.</b> The <b>sifting</b> property, $\\int x(t)\\delta(t-t_0)\\,\\d t=x(t_0)$, evaluates the function at the location of the impulse. A scaled argument first needs$$\\delta(at-b)=\\frac{1}{|a|}\\,\\delta\\!\\left(t-\\frac{b}{a}\\right),$$because the impulse must keep unit area under the substitution.<br>'
     +'<b>Solution — (i).</b> Two impulses, so sift twice and add:$$\\left(2\\cdot9-3\\right)+\\left(2\\cdot25-3\\right)=15+47=62.$$'
     +'<b>Solution — (ii).</b> $e^{-2}\\cos(2\\pi)=e^{-2}\\approx0.1353$.<br>'
     +'<b>Solution — (iii).</b> Rewrite $\\delta(3t-6)=\\tfrac13\\delta(t-2)$, then sift:$$\\int t^{2}\\cdot\\tfrac13\\delta(t-2)\\,\\d t=\\tfrac13\\cdot4=\\tfrac43.$$'
     +'<b>Solution — part (b).</b> All three use sifting. The result is a number because the integral runs over $t$ and removes every $t$-dependence. The <b>sampling</b> property is the other statement, $x(t)\\delta(t-t_0)=x(t_0)\\delta(t-t_0)$, and it returns a signal: an impulse at $t_0$ carrying the weight $x(t_0)$.<br>'
     +'<b>Check.</b> Units confirm the split: if $x$ is in volts then $\\delta$ carries $\\mathrm{s}^{-1}$, so the product is a signal in $\\mathrm{V\\,s^{-1}}$ and the integral is a number in volts. In (iii), dropping the factor $\\tfrac13$ would triple the answer, and the area of $\\delta(3t-6)$ measured directly is $\\tfrac13$, not $1$.',
  err:'Treating $\\delta(3t-6)$ as $\\delta(t-6)$, or as $\\delta(t-2)$ without the factor $\\tfrac13$. Compressing the argument compresses the impulse, and its area must be restored.',
  teach:'Part (b) separates the two properties. A student who writes $x(t)\\delta(t-t_0)=x(t_0)$ has silently turned a signal into a number and will make the same slip in Module 3.' },

{ id:'D1-12', module:'M1', type:'impulse', src:'MT1 Q1',
  stem:'Let $$x[n]=\\sum_{k=-\\infty}^{\\infty}\\delta[n-3k],\\qquad y[n]=\\sum_{k=-\\infty}^{\\infty}\\Bigl(2\\delta[n-4k]-\\delta[n-2-4k]\\Bigr).$$',
  parts:['Sketch $x[n]$ for $-6\\le n\\le6$ and give its fundamental period.',
         'Sketch $y[n]$ for $-6\\le n\\le6$ and give its fundamental period.',
         'Is $x[n]+y[n]$ periodic? If so, give its fundamental period.'],
  sol:'<b>Given.</b> Two sequences written as sums of shifted impulses.<br>'
     +'<b>Find.</b> Their plots, their periods, and the period of the sum.<br>'
     +'<b>Method.</b> Each term of the sum places one impulse. Find the locations first; the spacing between repeats is the period.<br>'
     +'<b>Solution — part (a).</b> The index $n-3k$ vanishes at $n=3k$, so $x[n]=1$ at $n=\\dots,-6,-3,0,3,6,\\dots$ and zero elsewhere. The pattern repeats every $3$ samples, so $N_x=3$.<br>'
     +'<b>Solution — part (b).</b> The first family gives $+2$ at $n=4k$, that is at $-4,0,4$; the second gives $-1$ at $n=4k+2$, that is at $-6,-2,2,6$. No two locations coincide, so$$y[n]=2\\ \\text{at}\\ n=4k,\\qquad y[n]=-1\\ \\text{at}\\ n=4k+2,$$and zero elsewhere. The pattern repeats every $4$ samples, so $N_y=4$.<br>'
     +'<b>Solution — part (c).</b> Both are periodic, so the sum is periodic with$$N_0=\\operatorname{lcm}(3,4)=12.$$'
     +'<b>Check.</b> Over one period of length $12$, $x$ contributes $4$ impulses and $y$ contributes $3+3=6$, and both counts are whole numbers — which is exactly what makes $12$ a period. Nothing smaller works: $6$ holds two periods of $x$ but only one and a half of $y$.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:240,xr:[-6.8,6.8],yr:[-0.4,1.5],xlabel:'n',ylabel:'x[n]',
      pad:{l:46,r:26,t:30,b:34},xstep:2,ystep:0.5});
      a.stem(disc(n=>n%3===0?1:0,-6,6),{color:C.in}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:240,xr:[-6.8,6.8],yr:[-1.6,2.6],xlabel:'n',ylabel:'y[n]',
      pad:{l:46,r:26,t:30,b:34},xstep:2,ystep:1});
      a.stem(disc(n=>((n%4)+4)%4===0?2:(((n%4)+4)%4===2?-1:0),-6,6),{color:C.h}); return a.svg();})()),
  err:'Reading $\\delta[n-2-4k]$ as an impulse at $n=2$ only, instead of at every $n=4k+2$. The index $k$ runs over all integers in both sums.',
  teach:'Ask for the impulse locations as a list before anything is drawn. A student who sketches first usually places the second family at the wrong offset.' },

]);

window.DRILL_M1 = [

{ id:'m1-drill-map', module:'M1', nav:'Module 1 exam drill · question types',
  title:'Module 1 — what a question looks like', src:'pp. 2–10',
  objective:'Name the five recurring question shapes before the module is read.',
  keywords:'exam drill module 1 question types periodicity energy power transformation even odd impulse taxonomy practice',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 1 · Exam drill', src:'pp. 2–10'},
  {t:'title', text:'Five shapes, and the method each one wants'},
  {t:'lede', text:'Questions on signal foundations come in five shapes. Read them now, before the module. You are not expected to be able to answer them yet — you are expected to recognise them when they arrive.'},
  {t:'raw', html:'<div style="height:10px"></div>'},
  {t:'drilltypes', module:'M1'}
]},

{ id:'m1-drill', module:'M1', nav:'Module 1 exam drill · questions',
  title:'Module 1 — exam drill', src:'pp. 2–10',
  objective:'Twelve open-ended questions in examination form, with worked solutions.',
  keywords:'exam drill module 1 questions practice periodicity energy power transformation even odd sifting',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 1 · Exam drill D1-01 … D1-12', src:'pp. 2–10'},
  {t:'title', text:'Exam drill'},
  {t:'small', html:'Work each question on paper before opening its solution. Every solution ends with a <b>Check</b> step. In this module the cheap checks are: a period must divide into every term a whole number of times, a transformation must preserve the width of the support up to the scale factor, and the even and odd parts must add back to the signal.'},
  {t:'rule', short:true},
  {t:'drill', module:'M1'}
]}

];

/* ======================================================================
   MODULE 2 — Systems and Their Properties
   ====================================================================== */

CONTENT.DRILLTYPES.M2 = [
  { k:'p-nonlin', name:'A nonlinearity applied to the input',
    asks:'The rule squares, multiplies, rectifies or exponentiates. Linearity is the property at risk.',
    method:['Test homogeneity first: is the response to $ax$ equal to $a$ times the response to $x$?',
            'One constant input and one scale factor is usually enough to break it.',
            'A nonlinearity does not by itself break time invariance, causality or stability.',
            'Bound the output from a bound on the input to settle stability in one line.'],
    go:'m2-linearity' },
  { k:'p-accum', name:'Accumulation, integration or differencing',
    asks:'The rule sums or integrates the input, or takes a difference of neighbouring values. Memory and stability are the properties at risk.',
    method:['Write the output as an explicit sum or integral with its limits.',
            'The limits decide memory and causality: an upper limit above the present time is not causal.',
            'For stability, bound the output when $|x|\\le B$. A finite window gives a finite bound.',
            'An unbounded window needs a counterexample, and $x=u$ is almost always the one.'],
    go:'m2-stability' },
  { k:'p-gain', name:'An explicitly time-dependent gain',
    asks:'The rule multiplies the input by a known function of $t$ or $n$. Time invariance is the property at risk.',
    method:['Linearity survives: multiplication by a fixed function is linear in $x$.',
            'For time invariance, compute the response to $x(t-t_0)$ and compare it with $y(t-t_0)$.',
            'A gain that grows without bound also breaks stability. A bounded gain does not.',
            'Name a specific $x$ and a specific $t_0$ in the counterexample.'],
    go:'m2-ti-counter' },
  { k:'p-argop', name:'An operation on the time argument',
    asks:'The rule shifts, scales or reverses the argument of the input. Causality and time invariance are the properties at risk.',
    method:['Find one instant where the output uses an input from later than that instant.',
            'For time invariance, remember that a scaled argument rescales any shift you apply.',
            'Linearity always survives an operation on the argument alone.',
            'Stability also survives: the output only ever reuses input values.'],
    go:'m2-causality' }
];

CONTENT.DRILL = CONTENT.DRILL.concat([

{ id:'D2-01', module:'M2', type:'p-nonlin', src:'MT1 Q2',
  stem:'Consider the system $$y(t)=e^{x(t)}.$$',
  parts:['Determine whether the system is memoryless, linear, time invariant, causal and BIBO stable.',
         'Justify each answer. An unjustified answer receives no credit.'],
  sol:'<b>Given.</b> A memoryless exponential nonlinearity.<br>'
     +'<b>Find.</b> The five properties, each with a proof or a counterexample.<br>'
     +'<b>Memoryless — yes.</b> The output at $t$ is a fixed function of $x(t)$ alone. No shifted value and no integral appears.<br>'
     +'<b>Linear — no.</b> Homogeneity fails. Take $x(t)=0$, which gives $y(t)=e^{0}=1$. Scaling the input by $a=2$ leaves it at $0$, so the response is still $1$, but $2y(t)=2$. Since $1\\neq2$, the system is not homogeneous and therefore not linear.<br>'
     +'<b>Time invariant — yes.</b> The rule contains no explicit $t$. Feeding $x(t-t_0)$ gives $e^{x(t-t_0)}$, which is $y(t-t_0)$.<br>'
     +'<b>Causal — yes.</b> A memoryless system is automatically causal: nothing later than $t$ is ever used.<br>'
     +'<b>BIBO stable — yes.</b> If $|x(t)|\\le B<\\infty$ then $-B\\le x(t)\\le B$, so $e^{-B}\\le y(t)\\le e^{B}$ and $|y(t)|\\le e^{B}<\\infty$.<br>'
     +'<b>Check.</b> The failure is confined to linearity, which is what a nonlinearity should break and all it should break. A useful marker: a linear system must map the zero input to the zero output, and this one maps it to $1$.',
  err:'Calling the system linear because $e^{x}$ is a smooth, well-behaved function. Smoothness has nothing to do with linearity, which is additivity and homogeneity and nothing else.',
  teach:'The zero-input test is the fastest disqualifier available and costs one line. Ask for it whenever a candidate nonlinearity has a non-zero value at the origin.' },

{ id:'D2-02', module:'M2', type:'p-nonlin', src:'MT1 Q2',
  stem:'Consider the system $$y[n]=x[n]\\,x[n-1].$$',
  parts:['Determine whether the system is memoryless, linear, time invariant, causal and BIBO stable.',
         'Justify each answer.'],
  sol:'<b>Given.</b> A product of the present input with the previous one.<br>'
     +'<b>Find.</b> The five properties.<br>'
     +'<b>Memoryless — no.</b> The output at $n$ uses $x[n-1]$, a value from a different instant.<br>'
     +'<b>Linear — no.</b> Homogeneity fails. Let $x[n]=1$ for all $n$, so $y[n]=1$. Scaling the input by $a=2$ gives $x[n]=2$ and $y[n]=4$, but $2\\cdot1=2$. Since $4\\neq2$, the system is not linear.<br>'
     +'<b>Time invariant — yes.</b> No explicit $n$ appears. Feeding $x[n-n_0]$ gives $x[n-n_0]x[n-n_0-1]=y[n-n_0]$.<br>'
     +'<b>Causal — yes.</b> Only the present sample and one past sample are used.<br>'
     +'<b>BIBO stable — yes.</b> If $|x[n]|\\le B$ then $|y[n]|=|x[n]||x[n-1]|\\le B^{2}<\\infty$.<br>'
     +'<b>Check.</b> Memory and nonlinearity are independent failures here, and both are genuine. Compare with $y[n]=x[n-1]$, which has the same memory but is linear, and with $y[n]=x^{2}[n]$, which has the same nonlinearity but no memory.',
  err:'Declaring the system linear because it is a product of two linear terms. A product of two copies of the input is quadratic in the input, and quadratic is not linear.',
  teach:'Ask the student to name which of the two defining properties fails. "Not linear" without saying whether additivity or homogeneity broke is half an answer.' },

{ id:'D2-03', module:'M2', type:'p-nonlin', src:'MT1 Q2',
  stem:'Consider the system $$y(t)=\\left|x(t)\\right|.$$',
  parts:['Determine whether the system is memoryless, linear, time invariant, causal and BIBO stable.',
         'Determine whether it is invertible, and justify your answer.'],
  sol:'<b>Given.</b> A full-wave rectifier.<br>'
     +'<b>Find.</b> The five properties, and invertibility.<br>'
     +'<b>Memoryless — yes.</b> Only $x(t)$ appears.<br>'
     +'<b>Linear — no.</b> Homogeneity fails for a negative scale factor. Take $x(t)=1$, so $y(t)=1$. With $a=-1$ the input is $-1$ and the response is $\\left|-1\\right|=1$, but $a\\,y(t)=-1$. Since $1\\neq-1$, the system is not linear.<br>'
     +'<b>Time invariant — yes.</b> No explicit $t$ appears.<br>'
     +'<b>Causal — yes.</b> Memoryless implies causal.<br>'
     +'<b>BIBO stable — yes.</b> $|y(t)|=|x(t)|\\le B$.<br>'
     +'<b>Invertible — no.</b> The inputs $x_1(t)=1$ and $x_2(t)=-1$ are different, yet both give $y(t)=1$. Two distinct inputs sharing an output is exactly the failure of invertibility.<br>'
     +'<b>Check.</b> Additivity fails as well, and independently: with $x_1=1$ and $x_2=-1$ the sum is $0$, so the response to the sum is $0$, while $y_1+y_2=2$. Either failure alone settles linearity.',
  err:'Testing homogeneity only with positive scale factors, finding it holds, and concluding linearity. The definition quantifies over every complex $a$, and the negative ones are where the rectifier fails.',
  teach:'This system is the cleanest example of a rule that preserves four properties and destroys one. Use it to stop the habit of answering all five the same way.' },

{ id:'D2-04', module:'M2', type:'p-accum', src:'MT1 Q2',
  stem:'Consider the system $$y(t)=\\int_{t-1}^{t}x(\\tau)\\,\\d\\tau.$$',
  parts:['Determine whether the system is memoryless, linear, time invariant, causal and BIBO stable.',
         'Justify each answer.'],
  sol:'<b>Given.</b> A one-second sliding average, unnormalised.<br>'
     +'<b>Find.</b> The five properties.<br>'
     +'<b>Memoryless — no.</b> The output at $t$ uses every input value on $[t-1,t]$, not only the one at $t$.<br>'
     +'<b>Linear — yes.</b> Integration is linear: the response to $ax_1+bx_2$ is $a\\int x_1+b\\int x_2=ay_1+by_2$ over the same limits.<br>'
     +'<b>Time invariant — yes.</b> Feed $x(t-t_0)$ and substitute $\\sigma=\\tau-t_0$:$$\\int_{t-1}^{t}x(\\tau-t_0)\\,\\d\\tau=\\int_{t-t_0-1}^{t-t_0}x(\\sigma)\\,\\d\\sigma=y(t-t_0).$$'
     +'<b>Causal — yes.</b> The upper limit is $t$, so no value later than the present is used.<br>'
     +'<b>BIBO stable — yes.</b> If $|x|\\le B$ then$$|y(t)|\\le\\int_{t-1}^{t}|x(\\tau)|\\,\\d\\tau\\le B\\cdot1=B<\\infty.$$'
     +'<b>Check.</b> The window has finite length, and that single fact gives both the bound and the stability. Compare with $y(t)=\\int_{-\\infty}^{t}x\\,\\d\\tau$, which differs only in the lower limit and is not stable.',
  err:'Calling the system memoryless because no explicit delay appears in the formula. An integral over an interval is memory, and the interval is one second long.',
  teach:'The substitution in the time-invariance proof is the part students skip. Require the change of variable to be written out; asserting the shift is not a proof.' },

{ id:'D2-05', module:'M2', type:'p-accum', src:'MT1 Q2',
  stem:'Consider the system $$y[n]=x[n]-x[n-1].$$',
  parts:['Determine whether the system is memoryless, linear, time invariant, causal and BIBO stable.',
         'Determine whether it is invertible, and justify your answer.'],
  sol:'<b>Given.</b> The first difference.<br>'
     +'<b>Find.</b> The five properties, and invertibility.<br>'
     +'<b>Memoryless — no.</b> The output at $n$ uses the sample at $n-1$.<br>'
     +'<b>Linear — yes.</b> The response to $ax_1[n]+bx_2[n]$ is $a(x_1[n]-x_1[n-1])+b(x_2[n]-x_2[n-1])=ay_1[n]+by_2[n]$.<br>'
     +'<b>Time invariant — yes.</b> No explicit $n$. Feeding $x[n-n_0]$ gives $x[n-n_0]-x[n-n_0-1]=y[n-n_0]$.<br>'
     +'<b>Causal — yes.</b> Only the present and one past sample are used.<br>'
     +'<b>BIBO stable — yes.</b> $|y[n]|\\le|x[n]|+|x[n-1]|\\le2B<\\infty$.<br>'
     +'<b>Invertible — yes,</b> up to a constant. Accumulating recovers the input: $\\sum_{k=-\\infty}^{n}y[k]=x[n]$ whenever $x[k]\\to0$ as $k\\to-\\infty$. Without that condition two inputs differing by a constant give the same output, and the system is not invertible.<br>'
     +'<b>Check.</b> This is one half of the inverse pair in Module 3, where the cascade of a first difference and an accumulator turns out to have impulse response $\\delta[n]$.',
  err:'Claiming invertibility without stating any condition at $n\\to-\\infty$. The constant sequence $x[n]=c$ has $y[n]=0$ for every $c$, so the inverse is only determined once one value is pinned down.',
  teach:'The qualification on invertibility is the mark-bearing part. A bare "yes, integrate it" earns less than a "yes, provided the input decays".' },

{ id:'D2-06', module:'M2', type:'p-accum', src:'MT1 Q2',
  stem:'Consider the system $$y[n]=\\sum_{k=n-2}^{n+2}x[k].$$',
  parts:['Determine whether the system is memoryless, linear, time invariant, causal and BIBO stable.',
         'Justify each answer.'],
  sol:'<b>Given.</b> A five-sample sliding sum, centred on the present sample.<br>'
     +'<b>Find.</b> The five properties.<br>'
     +'<b>Memoryless — no.</b> The output at $n$ uses five samples, four of them at other instants.<br>'
     +'<b>Linear — yes.</b> A finite sum of input values is linear in the input.<br>'
     +'<b>Time invariant — yes.</b> Feed $x[n-n_0]$ and substitute $m=k-n_0$:$$\\sum_{k=n-2}^{n+2}x[k-n_0]=\\sum_{m=n-n_0-2}^{n-n_0+2}x[m]=y[n-n_0].$$'
     +'<b>Causal — no.</b> The sum reaches to $k=n+2$. At $n=0$ the output uses $x[1]$ and $x[2]$, which have not arrived yet. One such instant is enough.<br>'
     +'<b>BIBO stable — yes.</b> If $|x[n]|\\le B$ then $|y[n]|\\le5B<\\infty$: five terms, each bounded.<br>'
     +'<b>Check.</b> Causality is the only failure, and it comes entirely from the upper limit. Replacing the window with $\\sum_{k=n-4}^{n}x[k]$ keeps every other property and makes the system causal, which shows the failure is about the window position, not its length.',
  err:'Reading the sum as running over the past because it is written with a lower limit below $n$. What decides causality is the upper limit.',
  teach:'Ask for one specific instant and one specific future sample. "It uses future values" is an assertion; "$y[0]$ uses $x[2]$" is a proof.' },

{ id:'D2-07', module:'M2', type:'p-accum', src:'MT1 Q2',
  stem:'Consider the integrator $$y(t)=\\int_{-\\infty}^{t}x(\\tau)\\,\\d\\tau.$$',
  parts:['Determine whether the system is memoryless, linear, time invariant, causal and BIBO stable.',
         'For any property that fails, give an explicit counterexample.'],
  sol:'<b>Given.</b> The running integral, from the infinite past to the present.<br>'
     +'<b>Find.</b> The five properties, with counterexamples where they fail.<br>'
     +'<b>Memoryless — no.</b> The output at $t$ depends on the entire input history.<br>'
     +'<b>Linear — yes.</b> Integration is linear over the same limits.<br>'
     +'<b>Time invariant — yes.</b> With $\\sigma=\\tau-t_0$,$$\\int_{-\\infty}^{t}x(\\tau-t_0)\\,\\d\\tau=\\int_{-\\infty}^{t-t_0}x(\\sigma)\\,\\d\\sigma=y(t-t_0).$$'
     +'<b>Causal — yes.</b> The upper limit is $t$: only present and past values enter.<br>'
     +'<b>BIBO stable — no. Counterexample:</b> take $x(t)=u(t)$, which satisfies $|x(t)|\\le1$ for every $t$. Then$$y(t)=\\int_{-\\infty}^{t}u(\\tau)\\,\\d\\tau=t\\,u(t),$$which grows without bound. One bounded input with an unbounded output disproves stability.<br>'
     +'<b>Check.</b> The failure comes from the infinite window, not from the integration: the one-second sliding integral has the same linearity, time invariance and causality and is stable. In Module 3 the same conclusion returns as $\\int|h(t)|\\,\\d t=\\int u(t)\\,\\d t=\\infty$.',
  err:'Arguing that the system is stable because a bounded input has a bounded integrand. The integrand being bounded says nothing when the interval of integration is infinite.',
  teach:'A counterexample must name the input, verify that it is bounded, and exhibit the unbounded output. Answers usually stop after the first of the three.' },

{ id:'D2-08', module:'M2', type:'p-gain', src:'MT1 Q2',
  stem:'Consider the system $$y[n]=n\\,x[n].$$',
  parts:['Determine whether the system is memoryless, linear, time invariant, causal and BIBO stable.',
         'For any property that fails, give an explicit counterexample.'],
  sol:'<b>Given.</b> A memoryless gain that grows with the index.<br>'
     +'<b>Find.</b> The five properties, with counterexamples.<br>'
     +'<b>Memoryless — yes.</b> Only $x[n]$ appears; $n$ is a known number at each instant, not an input value.<br>'
     +'<b>Linear — yes.</b> The response to $ax_1[n]+bx_2[n]$ is $n(ax_1[n]+bx_2[n])=ay_1[n]+by_2[n]$. Multiplication by a fixed sequence is linear.<br>'
     +'<b>Time invariant — no. Counterexample:</b> let $x_1[n]=\\delta[n]$. Then $y_1[n]=n\\,\\delta[n]=0$ for every $n$. Now delay the input by one: $x_2[n]=\\delta[n-1]$ gives $y_2[n]=n\\,\\delta[n-1]$, which is $1$ at $n=1$. But $y_1[n-1]=0$. Since $y_2\\neq y_1$ shifted, the system is not time invariant.<br>'
     +'<b>Causal — yes.</b> The output at $n$ uses only the input at $n$.<br>'
     +'<b>BIBO stable — no. Counterexample:</b> $x[n]=1$ for all $n$ is bounded by $1$, and $y[n]=n$ grows without bound.<br>'
     +'<b>Check.</b> Two failures, both traceable to the same explicit $n$ in the gain: it makes the rule depend on absolute time, and it is unbounded. A bounded time-dependent gain such as $\\cos(n)$ would break time invariance only.',
  err:'Calling the system nonlinear because the gain varies. A gain that is a known function of the index — not of the input — leaves the system perfectly linear.',
  teach:'Contrast this system with $y[n]=x[n]x[n-1]$ in the same session. One is linear and time varying, the other nonlinear and time invariant, and students routinely conflate the two failures.' },

{ id:'D2-09', module:'M2', type:'p-gain', src:'MT1 Q2',
  stem:'A modulator multiplies its input by a fixed carrier: $$y(t)=x(t)\\cos(\\omega_c t),\\qquad \\omega_c>0 \\text{ known}.$$',
  parts:['Determine whether the system is memoryless, linear, time invariant, causal and BIBO stable.',
         'For any property that fails, give an explicit counterexample.'],
  sol:'<b>Given.</b> Multiplication by a known bounded carrier.<br>'
     +'<b>Find.</b> The five properties.<br>'
     +'<b>Memoryless — yes.</b> Only $x(t)$ appears; the carrier is a known deterministic gain.<br>'
     +'<b>Linear — yes.</b> Multiplication by a fixed function of $t$ is linear in $x$.<br>'
     +'<b>Time invariant — no. Counterexample:</b> let $x(t)=1$, so $y_1(t)=\\cos(\\omega_c t)$. The shifted input $x(t-t_0)=1$ is the same constant, so it produces $\\cos(\\omega_c t)$ again. But$$y_1(t-t_0)=\\cos\\bigl(\\omega_c(t-t_0)\\bigr),$$and the two differ for every $t_0$ that is not a whole number of carrier periods.<br>'
     +'<b>Causal — yes.</b> Memoryless implies causal.<br>'
     +'<b>BIBO stable — yes.</b> $|y(t)|=|x(t)||\\cos(\\omega_c t)|\\le B\\cdot1=B<\\infty$.<br>'
     +'<b>Check.</b> Only time invariance fails, and the reason is that the rule contains $t$ explicitly. The carrier is bounded, so stability survives — which is the difference between this system and $y[n]=n\\,x[n]$.',
  err:'Claiming time invariance because "the carrier is periodic, so shifting does not matter". It matters for every shift that is not a multiple of the carrier period, and the definition quantifies over all shifts.',
  teach:'This is the system behind every communication chain in Module 5. Establishing here that modulation is linear but time varying prevents the later error of applying convolution to it.' },

{ id:'D2-10', module:'M2', type:'p-argop', src:'MT1 Q2',
  stem:'Consider the system $$y(t)=x\\!\\left(\\tfrac{t}{2}\\right).$$',
  parts:['Determine whether the system is memoryless, linear, time invariant, causal and BIBO stable.',
         'For any property that fails, give an explicit counterexample.'],
  sol:'<b>Given.</b> A time expansion by a factor of two.<br>'
     +'<b>Find.</b> The five properties.<br>'
     +'<b>Memoryless — no.</b> For every $t\\neq0$ the output uses the input at $t/2$, a different instant.<br>'
     +'<b>Linear — yes.</b> Reading the input at a relocated instant is linear: the response to $ax_1+bx_2$ is $ax_1(t/2)+bx_2(t/2)=ay_1+by_2$.<br>'
     +'<b>Time invariant — no. Counterexample:</b> let $x_1(t)=u(t)-u(t-2)$, so $y_1(t)=1$ on $0\\le t\\le4$. Delay the input by one second: $x_2(t)=u(t-1)-u(t-3)$ gives $y_2(t)=1$ on $2\\le t\\le6$. But $y_1(t-1)=1$ on $1\\le t\\le5$. A delay of one at the input became a delay of two at the output.<br>'
     +'<b>Causal — no. Counterexample:</b> at $t=-2$ the output is $y(-2)=x(-1)$, and $-1>-2$: the output at that instant needs an input value from later.<br>'
     +'<b>BIBO stable — yes.</b> The output only ever repeats an input value, so $|y(t)|=|x(t/2)|\\le B$.<br>'
     +'<b>Check.</b> Expansion stretches the negative half of the axis towards the origin, which is exactly why causality fails on $t<0$. For $t>0$ the system reads the past and looks causal, and testing only positive $t$ is the usual way this failure is missed.',
  err:'Testing causality only for $t>0$, finding $t/2<t$, and concluding the system is causal. The inequality reverses for negative $t$, and the definition covers every $t$.',
  teach:'Ask for the general comparison of $t/2$ with $t$ including its sign. The single line $t/2>t \\iff t<0$ settles the question.' },

{ id:'D2-11', module:'M2', type:'p-argop', src:'MT1 Q2',
  stem:'Consider the system $$y(t)=x(2t-1).$$',
  parts:['Determine whether the system is memoryless, linear, time invariant, causal and BIBO stable.',
         'For any property that fails, give an explicit counterexample.'],
  sol:'<b>Given.</b> A compression combined with a shift.<br>'
     +'<b>Find.</b> The five properties.<br>'
     +'<b>Memoryless — no.</b> The output at $t$ uses the input at $2t-1$, which equals $t$ only at $t=1$.<br>'
     +'<b>Linear — yes.</b> An operation on the argument alone is linear in the input.<br>'
     +'<b>Time invariant — no. Counterexample:</b> let $x_1(t)=\\delta(t)$, whose output is concentrated where $2t-1=0$, that is at $t=\\tfrac12$. Delay the input by one: $x_2(t)=\\delta(t-1)$ produces an output where $2t-1=1$, at $t=1$. The output moved by $\\tfrac12$, not by $1$. A compression rescales every shift.<br>'
     +'<b>Causal — no. Counterexample:</b> at $t=2$ the output is $y(2)=x(3)$, and $3>2$.<br>'
     +'<b>BIBO stable — yes.</b> $|y(t)|=|x(2t-1)|\\le B$.<br>'
     +'<b>Check.</b> The output uses a future value exactly when $2t-1>t$, that is for $t>1$, so the failure occupies a half line rather than a single instant. Setting the scale factor to one recovers $y(t)=x(t-1)$, which is causal and time invariant — so the compression, not the shift, is what breaks both.',
  err:'Concluding causality from the minus sign in $2t-1$, as though any subtraction meant a delay. The comparison to make is between $2t-1$ and $t$, and it depends on $t$.',
  teach:'Have the student solve the inequality $2t-1>t$ rather than test one point. The solution set is the answer, and it also shows why the shift alone would have been harmless.' },

{ id:'D2-12', module:'M2', type:'p-argop', src:'MT1 Q2',
  stem:'Consider the decimator $$y[n]=x[2n].$$',
  parts:['Determine whether the system is memoryless, linear, time invariant, causal and BIBO stable.',
         'For any property that fails, give an explicit counterexample.'],
  sol:'<b>Given.</b> A system that keeps every second input sample.<br>'
     +'<b>Find.</b> The five properties.<br>'
     +'<b>Memoryless — no.</b> For $n\\neq0$ the output uses $x[2n]$, a different index.<br>'
     +'<b>Linear — yes.</b> Selecting samples is linear: the response to $ax_1[n]+bx_2[n]$ is $ax_1[2n]+bx_2[2n]$.<br>'
     +'<b>Time invariant — no. Counterexample:</b> let $x_1[n]=\\delta[n]$, so $y_1[n]=\\delta[2n]$, which is $1$ at $n=0$. Delay the input by two: $x_2[n]=\\delta[n-2]$ gives $y_2[n]=\\delta[2n-2]$, which is $1$ at $n=1$. A delay of two at the input became a delay of one at the output. Worse, delaying by one gives $x_3[n]=\\delta[n-1]$ and $y_3[n]=\\delta[2n-1]=0$ for every integer $n$: the impulse disappears entirely.<br>'
     +'<b>Causal — no. Counterexample:</b> $y[1]=x[2]$, and $2>1$.<br>'
     +'<b>BIBO stable — yes.</b> The output reuses input values, so $|y[n]|=|x[2n]|\\le B$.<br>'
     +'<b>Check.</b> The vanishing impulse in the second counterexample is the sharpest statement of the failure: a time-invariant system cannot destroy a signal merely because it arrived one sample later. Decimation is the reason Module 7 treats sampling as a separate subject rather than as another LTI system.',
  err:'Calling the system time invariant on the grounds that no explicit $n$ appears in the rule. The absence of an explicit index is necessary, not sufficient — an operation on the index is time varying too.',
  teach:'The disappearing impulse is worth showing on the board. It makes concrete why convolution, and everything built on it, does not apply to a decimator.' },

]);

window.DRILL_M2 = [

{ id:'m2-drill-map', module:'M2', nav:'Module 2 exam drill · question types',
  title:'Module 2 — what a question looks like', src:'pp. 11–13',
  objective:'Name the four recurring question shapes before the module is read.',
  keywords:'exam drill module 2 question types system properties linearity time invariance causality stability taxonomy practice',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 2 · Exam drill', src:'pp. 11–13'},
  {t:'title', text:'One question, four disguises'},
  {t:'lede', text:'Questions on system properties ask the same thing every time: given a rule relating input to output, decide whether the system is memoryless, linear, time invariant, causal and stable, and justify each answer. What changes is the rule. Four shapes cover almost all of them, and each shape puts a different property at risk.'},
  {t:'raw', html:'<div style="height:10px"></div>'},
  {t:'drilltypes', module:'M2'},
  {t:'note', kind:'warn', head:'A property is settled by a proof or by a counterexample, never by an impression', html:'To establish a property, argue for every input. To destroy it, name one input, or one pair of inputs and one shift, and show the rule fails. An answer without one of the two earns nothing.'}
]},

{ id:'m2-drill', module:'M2', nav:'Module 2 exam drill · questions',
  title:'Module 2 — exam drill', src:'pp. 11–13',
  objective:'Twelve open-ended questions in examination form, with worked solutions.',
  keywords:'exam drill module 2 questions practice memoryless linear time invariant causal stable counterexample',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 2 · Exam drill D2-01 … D2-12', src:'pp. 11–13'},
  {t:'title', text:'Exam drill'},
  {t:'small', html:'Work each question on paper before opening its solution. Answer all five properties for every system, and give a proof or a named counterexample for each. Two cheap checks: a linear system must map the zero input to the zero output, and a memoryless system is always causal.'},
  {t:'rule', short:true},
  {t:'drill', module:'M2'}
]}

];

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
    go:'m3-caus-stab' }
];

CONTENT.DRILL = CONTENT.DRILL.concat([

/* ---------- Type A — impulse response from a difference equation ---------- */

{ id:'D3-01', module:'M3', type:'dt-h', src:'MT1 Q3',
  stem:'The input and output of a discrete-time LTI system are related by $$y[n]=3x[n]+x[n-2]-2x[n-4].$$',
  parts:['Determine and plot the impulse response $h[n]$.',
         'For the input $x[n]=u[n]-u[n-3]$, compute and plot $y[n]=x[n]*h[n]$.'],
  sol:'<b>Given.</b> A non-recursive relation with three terms, at delays $0$, $2$ and $4$.<br>'
     +'<b>Find.</b> $h[n]$, then the response to a three-sample rectangular input.<br>'
     +'<b>Method.</b> Set $x[n]=\\delta[n]$. Each term $c\\,x[n-n_0]$ contributes $c\\,\\delta[n-n_0]$, so the coefficients land at their own delays.<br>'
     +'<b>Solution — part (a).</b>$$h[n]=3\\delta[n]+\\delta[n-2]-2\\delta[n-4],$$that is $h[0]=3$, $h[1]=0$, $h[2]=1$, $h[3]=0$, $h[4]=-2$, and zero elsewhere. The support is $0\\le n\\le4$.<br>'
     +'<b>Solution — part (b).</b> The input is $x[n]=1$ for $n=0,1,2$ and zero elsewhere, so$$y[n]=\\sum_{k=0}^{2}h[n-k]=h[n]+h[n-1]+h[n-2].$$Evaluating the three-term window as it slides:$$y[0]=3,\\quad y[1]=3,\\quad y[2]=4,\\quad y[3]=1,\\quad y[4]=-1,\\quad y[5]=-2,\\quad y[6]=-2,$$and $y[n]=0$ otherwise.<br>'
     +'<b>Check.</b> The supports add: $x$ occupies $0\\le n\\le2$ and $h$ occupies $0\\le n\\le4$, so $y$ must occupy $0\\le n\\le6$ — seven samples, which is what came out. The totals multiply: $\\sum h[n]=3+0+1+0-2=2$ and $\\sum x[n]=3$, so $\\sum y[n]$ must be $6$, and $3+3+4+1-1-2-2=6$.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-1.6,6.6],yr:[-2.6,3.8],xlabel:'n',ylabel:'h[n]',
      pad:{l:46,r:26,t:30,b:34},xstep:1,ystep:1});
      a.stem(seq([3,0,1,0,-2],0),{color:C.h}); return a.svg();})(),
    (()=>{const H=[3,0,1,0,-2];const y=n=>[0,1,2].reduce((s,k)=>s+((n-k>=0&&n-k<=4)?H[n-k]:0),0);
      const a=P.Axes({w:520,h:250,xr:[-1.6,8.6],yr:[-2.6,4.6],xlabel:'n',ylabel:'y[n]',
      pad:{l:46,r:26,t:30,b:34},xstep:1,ystep:1});
      a.stem(disc(y,-1,8),{color:C.out}); return a.svg();})()),
  err:'Placing the coefficients at the wrong index, most often by reading $-2x[n-4]$ as a value at $n=-4$. The delay in the argument is the position in $h$, and its sign is not flipped.',
  teach:'Ask for the support of $h$ before part (b) is attempted. A student who cannot state $0\\le n\\le4$ will not predict the support of $y$ either, and will lose the only cheap check available.' },

{ id:'D3-02', module:'M3', type:'dt-h', src:'MT1 Q3',
  stem:'A discrete-time LTI system is described by $$y[n]=\\tfrac{1}{5}\\,y[n-1]+x[n],$$and is initially at rest.',
  parts:['Determine the impulse response $h[n]$.',
         'For the input $x[n]=u[n]$, compute and plot $y[n]$.',
         'State the limit of $y[n]$ as $n\\to\\infty$ and say what it means.'],
  sol:'<b>Given.</b> A first-order recursion with constant coefficients, at rest before the input arrives.<br>'
     +'<b>Find.</b> $h[n]$, the step response, and its limit.<br>'
     +'<b>Method.</b> Set $x[n]=\\delta[n]$ and iterate forward from rest. Then convolve with the step, which for a causal $h$ is a running sum.<br>'
     +'<b>Solution — part (a).</b> With $y[-1]=0$:$$h[0]=\\tfrac15(0)+1=1,\\quad h[1]=\\tfrac15(1)=\\tfrac15,\\quad h[2]=\\tfrac15\\!\\left(\\tfrac15\\right)=\\tfrac1{25},$$so the pattern is$$h[n]=\\left(\\tfrac15\\right)^{\\!n}u[n].$$'
     +'<b>Solution — part (b).</b> With $x[n]=u[n]$,$$y[n]=\\sum_{k=-\\infty}^{\\infty}u[k]\\,h[n-k]=\\sum_{k=0}^{n}\\left(\\tfrac15\\right)^{\\!n-k}=\\sum_{m=0}^{n}\\left(\\tfrac15\\right)^{\\!m}$$for $n\\ge0$, and zero for $n<0$. The finite geometric sum gives$$y[n]=\\frac{1-\\left(\\tfrac15\\right)^{n+1}}{1-\\tfrac15}=\\frac{5}{4}\\left[1-\\left(\\tfrac15\\right)^{\\!n+1}\\right]u[n].$$'
     +'<b>Solution — part (c).</b> $\\left(\\tfrac15\\right)^{n+1}\\to0$, so $y[n]\\to\\tfrac54$. The system settles at $5/4$ times the height of the step.<br>'
     +'<b>Check.</b> Direct iteration of the recursion with $x[n]=u[n]$ gives $y[0]=1$, $y[1]=\\tfrac15+1=\\tfrac65$, $y[2]=\\tfrac15\\!\\left(\\tfrac65\\right)+1=\\tfrac{31}{25}$, and the closed form returns $1$, $\\tfrac65$, $\\tfrac{31}{25}$ in turn. The limit agrees with $\\sum_n h[n]=\\dfrac{1}{1-1/5}=\\dfrac54$, which is the response to a step of height one once the transient has died.',
  figSol:()=>{const y=n=>n<0?0:1.25*(1-Math.pow(1/5,n+1));
    const a=P.Axes({w:1080,h:280,xr:[-2.6,10.6],yr:[-0.2,1.6],xlabel:'n',ylabel:'y[n]',
      pad:{l:52,r:28,t:30,b:34},xstep:1,ystep:0.5});
    a.hline(1.25,{color:C.muted,dash:'4 5'});
    a.stem(disc(y,-2,10),{color:C.out});
    a.note(10.2,1.40,'\\tfrac{5}{4}',{anchor:'end',color:C.muted,fs:14,tex:true});
    return a.svg();},
  err:'Writing $h[n]=(1/5)^{n}$ without the step, which makes the impulse response non-zero for every negative $n$ and turns a stable causal system into a divergent one.',
  teach:'The rest condition is what makes the iteration well posed. A student who starts the recursion without stating $y[-1]=0$ has assumed it silently and should be asked where it came from.' },

{ id:'D3-03', module:'M3', type:'dt-h', src:'MT1 Q3',
  stem:'Two discrete-time systems are placed in cascade. The first forms the first difference, $y_1[n]=x[n]-x[n-1]$. The second accumulates, $y_2[n]=\\sum_{k=-\\infty}^{n}y_1[k]$.',
  parts:['Determine $h_1[n]$ and $h_2[n]$.',
         'Determine the impulse response of the cascade, $h[n]=h_1[n]*h_2[n]$.',
         'Say what the cascade does to an arbitrary input, and why.'],
  sol:'<b>Given.</b> A first difference followed by a running sum. Both are LTI.<br>'
     +'<b>Find.</b> The two impulse responses and the impulse response of the cascade.<br>'
     +'<b>Method.</b> Set $x[n]=\\delta[n]$ in each block separately, then convolve the two results. The impulse response of a cascade of LTI systems is the convolution of the individual impulse responses.<br>'
     +'<b>Solution — part (a).</b>$$h_1[n]=\\delta[n]-\\delta[n-1],\\qquad h_2[n]=u[n],$$because accumulating an impulse gives $1$ for every $n\\ge0$.<br>'
     +'<b>Solution — part (b).</b>$$h[n]=h_1[n]*h_2[n]=u[n]-u[n-1]=\\delta[n].$$'
     +'<b>Solution — part (c).</b> Convolving any input with $\\delta[n]$ returns that input, so the cascade is the identity: the accumulator undoes the first difference exactly. The two systems are inverses of each other.<br>'
     +'<b>Check.</b> Take $x[n]=u[n]$. The first difference gives $\\delta[n]$; accumulating $\\delta[n]$ gives $u[n]$ back. The order also does not matter here, because convolution commutes: accumulating first and then differencing returns the input as well.',
  err:'Reporting $h[n]=u[n]-u[n-1]$ as the final answer without recognising it as $\\delta[n]$, and so missing the point of the question.',
  teach:'This is the discrete-time statement that differentiation and integration are inverse. Draw the connection explicitly — students meet the continuous-time version later and rarely link the two on their own.' },

/* ---------- Type B — convolution sum ---------- */

{ id:'D3-04', module:'M3', type:'dt-conv', src:'MT1 Q3',
  stem:'A discrete-time LTI system has the impulse response $h[n]=u[n]-u[n-4]$. Its input is $$x[n]=\\delta[n]+2\\delta[n-1]+3\\delta[n-2].$$',
  parts:['Compute $y[n]=x[n]*h[n]$.',
         'Plot $y[n]$ and state its support.'],
  figure:()=>pair(
    (()=>{const a=P.Axes({w:520,h:230,xr:[-1.6,6.6],yr:[-0.4,3.6],xlabel:'n',ylabel:'x[n]',
      pad:{l:44,r:26,t:30,b:34},xstep:1,ystep:1});
      a.stem(seq([1,2,3],0),{color:C.in}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:230,xr:[-1.6,6.6],yr:[-0.4,3.6],xlabel:'n',ylabel:'h[n]',
      pad:{l:44,r:26,t:30,b:34},xstep:1,ystep:1});
      a.stem(seq([1,1,1,1],0),{color:C.h}); return a.svg();})()),
  sol:'<b>Given.</b> $x[n]=\\{1,2,3\\}$ on $0\\le n\\le2$ and $h[n]=\\{1,1,1,1\\}$ on $0\\le n\\le3$.<br>'
     +'<b>Find.</b> $y[n]=x[n]*h[n]$.<br>'
     +'<b>Method.</b> Because $h$ is a run of ones, $$y[n]=\\sum_{k}x[k]h[n-k]=\\sum_{k=n-3}^{n}x[k],$$a four-sample window sliding over $x$. Sum the samples of $x$ that fall inside the window.<br>'
     +'<b>Solution.</b>$$\\begin{aligned}y[0]&=x[0]=1,\\\\ y[1]&=x[0]+x[1]=3,\\\\ y[2]&=x[0]+x[1]+x[2]=6,\\\\ y[3]&=x[0]+x[1]+x[2]=6,\\\\ y[4]&=x[1]+x[2]=5,\\\\ y[5]&=x[2]=3,\\end{aligned}$$and $y[n]=0$ elsewhere.<br>'
     +'<b>Check.</b> The supports add: $[0,2]+[0,3]=[0,5]$, six samples. The totals multiply: $\\sum x[n]=6$ and $\\sum h[n]=4$, so $\\sum y[n]=24$, and $1+3+6+6+5+3=24$. The plateau at $y[2]=y[3]=6$ is the window fully covering $x$, which must happen for exactly $4-3+1=2$ values of $n$.',
  figSol:()=>{const X=[1,2,3];const y=n=>{let s=0;for(let k=n-3;k<=n;k++) if(k>=0&&k<=2)s+=X[k];return s;};
    const a=P.Axes({w:1080,h:280,xr:[-1.6,7.6],yr:[-0.6,7],xlabel:'n',ylabel:'y[n]',
      pad:{l:50,r:28,t:30,b:34},xstep:1,ystep:2});
    a.stem(disc(y,-1,7),{color:C.out});
    a.span(2,3,6.4,'\\text{window covers all of }x',{tex:true,fs:13,color:C.coral});
    return a.svg();},
  err:'Sliding the window three positions instead of four, which drops $y[3]$ and leaves a support of five samples rather than six.',
  teach:'The support check is the fastest correction available here and costs one line. Insist on it being written before the sums are evaluated, not after.' },

{ id:'D3-05', module:'M3', type:'dt-conv', src:'MT1 Q3',
  stem:'Compute the convolution $y[n]=x[n]*h[n]$ for $$x[n]=\\left(\\tfrac12\\right)^{\\!n}u[n],\\qquad h[n]=u[n].$$',
  parts:['Find a closed form for $y[n]$.',
         'Plot $y[n]$ and give $\\lim_{n\\to\\infty}y[n]$.'],
  sol:'<b>Given.</b> A decaying geometric sequence and the unit step. Both start at $n=0$.<br>'
     +'<b>Find.</b> The step response of the system, in closed form.<br>'
     +'<b>Method.</b> Convolving with $u[n]$ is a running sum:$$y[n]=\\sum_{k=-\\infty}^{\\infty}x[k]u[n-k]=\\sum_{k=0}^{n}x[k],\\qquad n\\ge0,$$because $u[n-k]=1$ exactly when $k\\le n$, and $x[k]=0$ for $k<0$.<br>'
     +'<b>Solution.</b>$$y[n]=\\sum_{k=0}^{n}\\left(\\tfrac12\\right)^{\\!k}=\\frac{1-\\left(\\tfrac12\\right)^{n+1}}{1-\\tfrac12}=2-\\left(\\tfrac12\\right)^{\\!n},\\qquad n\\ge0,$$and $y[n]=0$ for $n<0$. In one line, $y[n]=\\left[2-\\left(\\tfrac12\\right)^{n}\\right]u[n]$.<br>'
     +'<b>Solution — the limit.</b> $y[n]\\to2$.<br>'
     +'<b>Check.</b> The first samples by hand: $y[0]=1$, $y[1]=1+\\tfrac12=\\tfrac32$, $y[2]=\\tfrac74$. The closed form gives $2-1=1$, $2-\\tfrac12=\\tfrac32$, $2-\\tfrac14=\\tfrac74$. The limit equals $\\sum_{n\\ge0}\\left(\\tfrac12\\right)^{n}=2$, which is the total area of $x$ — as it must be, since the running sum eventually collects all of it.',
  figSol:()=>{const y=n=>n<0?0:2-Math.pow(0.5,n);
    const a=P.Axes({w:1080,h:280,xr:[-2.6,10.6],yr:[-0.25,2.4],xlabel:'n',ylabel:'y[n]',
      pad:{l:52,r:28,t:30,b:34},xstep:1,ystep:0.5});
    a.hline(2,{color:C.muted,dash:'4 5'});
    a.stem(disc(y,-2,10),{color:C.out});
    a.note(10.2,2.16,'2',{anchor:'end',color:C.muted,fs:14,tex:true});
    return a.svg();},
  err:'Summing to $n-1$ instead of $n$, which gives $y[n]=2-2\\left(\\tfrac12\\right)^{n}$ and the wrong first sample $y[0]=0$.',
  teach:'Have the student write the inequality $u[n-k]=1\\iff k\\le n$ explicitly. Nearly every off-by-one in this question comes from skipping that line.' },

{ id:'D3-06', module:'M3', type:'dt-conv', src:'MT1 Q3',
  stem:'Compute $y[n]=x[n]*h[n]$ for $$x[n]=\\left(\\tfrac12\\right)^{\\!n}u[n],\\qquad h[n]=\\left(\\tfrac13\\right)^{\\!n}u[n].$$',
  parts:['Find a closed form for $y[n]$.',
         'Verify your result at $n=0$ and $n=1$ by direct summation.'],
  sol:'<b>Given.</b> Two causal geometric sequences with different ratios, $a=\\tfrac12$ and $b=\\tfrac13$.<br>'
     +'<b>Find.</b> Their convolution in closed form.<br>'
     +'<b>Method.</b> Both factors are zero for negative argument, so the sum runs over $0\\le k\\le n$ only. Factor out the term that does not depend on $k$ and sum the remaining geometric series.<br>'
     +'<b>Solution.</b> For $n\\ge0$,$$y[n]=\\sum_{k=0}^{n}a^{k}b^{\\,n-k}=b^{\\,n}\\sum_{k=0}^{n}\\left(\\frac{a}{b}\\right)^{\\!k}=b^{\\,n}\\,\\frac{(a/b)^{n+1}-1}{(a/b)-1}=\\frac{a^{\\,n+1}-b^{\\,n+1}}{a-b}.$$With $a-b=\\tfrac12-\\tfrac13=\\tfrac16$,$$y[n]=6\\left[\\left(\\tfrac12\\right)^{\\!n+1}-\\left(\\tfrac13\\right)^{\\!n+1}\\right]=3\\left(\\tfrac12\\right)^{\\!n}-2\\left(\\tfrac13\\right)^{\\!n},\\qquad n\\ge0,$$and $y[n]=0$ for $n<0$.<br>'
     +'<b>Check.</b> Direct summation: $y[0]=x[0]h[0]=1$, and the closed form gives $3-2=1$. Next, $y[1]=x[0]h[1]+x[1]h[0]=\\tfrac13+\\tfrac12=\\tfrac56$, and the closed form gives $\\tfrac32-\\tfrac23=\\tfrac56$. The totals also multiply: $\\sum x=2$, $\\sum h=\\tfrac32$, so $\\sum y$ must be $3$, and $3\\cdot2-2\\cdot\\tfrac32=6-3=3$.',
  err:'Cancelling $a-b$ before the limit $a\\to b$ has been considered. The formula above is valid only for $a\\neq b$; for $a=b$ the same sum gives $y[n]=(n+1)a^{n}u[n]$, which is a different shape.',
  teach:'The equal-ratio case is worth one extra minute. A student who reports the general formula without noticing its restriction has manipulated symbols rather than summed a series.' },

/* ---------- Type C — convolution integral ---------- */

{ id:'D3-07', module:'M3', type:'ct-conv', src:'MT1 Q4',
  stem:'Let $x(t)=u(t)-u(t-1)$ and $h(t)=u(t)-u(t-3)$.',
  parts:['Compute $y(t)=x(t)*h(t)$.',
         'Plot $y(t)$, marking every breakpoint.'],
  figure:()=>pair(
    (()=>{const a=P.Axes({w:520,h:230,xr:[-1.2,4.6],yr:[-0.3,1.5],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',
      pad:{l:44,r:26,t:30,b:36},xstep:1,ystep:0.5});
      a.poly([[-1.2,0],[0,0],[0,1],[1,1],[1,0],[4.6,0]],{color:C.in}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:230,xr:[-1.2,4.6],yr:[-0.3,1.5],xlabel:'t\\;(\\text{s})',ylabel:'h(t)',
      pad:{l:44,r:26,t:30,b:36},xstep:1,ystep:0.5});
      a.poly([[-1.2,0],[0,0],[0,1],[3,1],[3,0],[4.6,0]],{color:C.h}); return a.svg();})()),
  sol:'<b>Given.</b> Two rectangular pulses of unit height. The first is one second wide, the second three.<br>'
     +'<b>Find.</b> $y(t)=x(t)*h(t)$.<br>'
     +'<b>Method.</b> Write$$y(t)=\\int_{-\\infty}^{\\infty}x(\\tau)h(t-\\tau)\\,\\d\\tau.$$The fixed factor $x(\\tau)$ lives on $0\\le\\tau\\le1$. The moving factor $h(t-\\tau)$ is one when $0\\le t-\\tau\\le3$, that is $t-3\\le\\tau\\le t$. The overlap is $\\max(0,t-3)\\le\\tau\\le\\min(1,t)$, and $y(t)$ is its length. The moving edges $t$ and $t-3$ meet the fixed edges $0$ and $1$ at $t=0$, $t=1$, $t=3$ and $t=4$: those are the case boundaries.<br>'
     +'<b>Solution.</b>$$y(t)=\\begin{cases}0,& t<0,\\\\ t,& 0\\le t<1,\\\\ 1,& 1\\le t<3,\\\\ 4-t,& 3\\le t<4,\\\\ 0,& t\\ge4.\\end{cases}$$'
     +'<b>Check.</b> Continuity at every breakpoint: $y(0)=0$, $y(1)=1$ from both sides, $y(3)=1$ from both sides, $y(4)=0$. The supports add: $[0,1]+[0,3]=[0,4]$. The areas multiply: $\\int x=1$ and $\\int h=3$, so $\\int y$ must be $3$, and the trapezoid gives $\\tfrac12+2+\\tfrac12=3$. The flat top lasts $3-1=2$ seconds, the difference of the two widths, which is the general rule for two rectangles.',
  figSol:()=>{const y=t=>t<0?0:t<1?t:t<3?1:t<4?4-t:0;
    const a=P.Axes({w:1080,h:290,xr:[-1.2,5.4],yr:[-0.3,1.5],xlabel:'t\\;(\\text{s})',ylabel:'y(t)',
      pad:{l:52,r:28,t:32,b:38},xstep:1,ystep:0.5});
    a.curve(y,{color:C.out});
    [0,1,3,4].forEach(t=>a.vline(t,{color:C.muted,opacity:.5}));
    a.span(1,3,1.24,'\\text{width }3-1',{tex:true,fs:13,color:C.coral});
    return a.svg();},
  err:'Reporting a triangle. That is the answer for two pulses of equal width. With unequal widths the result is a trapezoid whose flat top is as long as the difference of the widths.',
  teach:'Ask for the four boundary equations before any integration. A student who writes only two has forgotten that each moving edge meets each fixed edge.' },

{ id:'D3-08', module:'M3', type:'ct-conv', src:'MT1 Q4',
  stem:'Let $$x(t)=\\begin{cases}e^{-3t},&0\\le t\\le1,\\\\ 0,&\\text{otherwise,}\\end{cases}\\qquad h(t)=u(t)-u(t-3).$$',
  parts:['Compute $y(t)=x(t)*h(t)$.',
         'Plot $y(t)$, marking every breakpoint, and state the maximum value.'],
  figure:()=>pair(
    (()=>{const a=P.Axes({w:520,h:230,xr:[-1,4.6],yr:[-0.2,1.3],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',
      pad:{l:46,r:26,t:30,b:36},xstep:1,ystep:0.5});
      a.curve(t=>(t>=0&&t<=1)?Math.exp(-3*t):0,{color:C.in});
      a.poly([[1,Math.exp(-3)],[1,0]],{color:C.in});
      return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:230,xr:[-1,4.6],yr:[-0.2,1.3],xlabel:'t\\;(\\text{s})',ylabel:'h(t)',
      pad:{l:46,r:26,t:30,b:36},xstep:1,ystep:0.5});
      a.poly([[-1,0],[0,0],[0,1],[3,1],[3,0],[4.6,0]],{color:C.h}); return a.svg();})()),
  sol:'<b>Given.</b> A one-second exponential pulse and a three-second rectangular window.<br>'
     +'<b>Find.</b> $y(t)=x(t)*h(t)$, and where it peaks.<br>'
     +'<b>Method.</b> Keep $x(\\tau)$ fixed on $0\\le\\tau\\le1$ and slide $h(t-\\tau)$, which is one for $t-3\\le\\tau\\le t$. The overlap is $a(t)\\le\\tau\\le b(t)$ with $a=\\max(0,t-3)$ and $b=\\min(1,t)$, so$$y(t)=\\int_{a}^{b}e^{-3\\tau}\\,\\d\\tau=\\tfrac13\\left[e^{-3a}-e^{-3b}\\right]$$whenever $b>a$. The moving edges $t$ and $t-3$ meet the fixed edges $0$ and $1$ at $t=0$, $t=1$, $t=3$ and $t=4$.<br>'
     +'<b>Solution.</b>$$y(t)=\\begin{cases}0,& t<0,\\\\[2pt] \\tfrac13\\left(1-e^{-3t}\\right),& 0\\le t<1,\\\\[2pt] \\tfrac13\\left(1-e^{-3}\\right),& 1\\le t<3,\\\\[2pt] \\tfrac13\\left(e^{-3(t-3)}-e^{-3}\\right),& 3\\le t<4,\\\\[2pt] 0,& t\\ge4.\\end{cases}$$The maximum is the plateau, $y=\\tfrac13\\left(1-e^{-3}\\right)\\approx0.3167$, held for $1\\le t\\le3$.<br>'
     +'<b>Check.</b> Continuity at each breakpoint: at $t=1$ both branches give $\\tfrac13(1-e^{-3})$; at $t=3$ the third branch gives $\\tfrac13(1-e^{-3})$ as well; at $t=4$ the fourth gives $\\tfrac13(e^{-3}-e^{-3})=0$. The supports add: $[0,1]+[0,3]=[0,4]$. The areas multiply: $\\int x=\\tfrac13(1-e^{-3})\\approx0.3167$ and $\\int h=3$, so $\\int y\\approx0.9502$, which is what the four branches integrate to.<br>'
     +'<b>Interpretation.</b> The window is wider than the pulse, so there is an interval over which the window contains the whole pulse. On that interval the output is constant and equal to the total area of the pulse. The plateau lasts $3-1=2$ seconds, the difference of the two widths.',
  figSol:()=>{const E=Math.exp;const y=t=>t<0?0:t<1?(1-E(-3*t))/3:t<3?(1-E(-3))/3:t<4?(E(-3*(t-3))-E(-3))/3:0;
    const a=P.Axes({w:1080,h:300,xr:[-0.8,5.2],yr:[-0.08,0.46],xlabel:'t\\;(\\text{s})',ylabel:'y(t)',
      pad:{l:60,r:28,t:32,b:38},xstep:1,ystep:0.1});
    a.curve(y,{color:C.out});
    [0,1,3,4].forEach(t=>a.vline(t,{color:C.muted,opacity:.5}));
    a.span(1,3,0.365,'\\tfrac{1}{3}\\left(1-e^{-3}\\right)',{tex:true,fs:13,color:C.coral});
    return a.svg();},
  err:'Using the limits $0$ to $t$ on every interval. Once $t>3$ the trailing edge of the window has entered the pulse, and the lower limit becomes $t-3$.',
  teach:'This question separates students who slide a window from students who memorised a four-case template. Ask for the two limit functions $a(t)$ and $b(t)$ in words before any integral is set up.' },

{ id:'D3-09', module:'M3', type:'ct-conv', src:'MT1 Q4',
  stem:'Compute $y(t)=x(t)*h(t)$ for $$x(t)=e^{-t}u(t),\\qquad h(t)=e^{-2t}u(t).$$',
  parts:['Find a closed form for $y(t)$.',
         'State $y(0)$ and $\\lim_{t\\to\\infty}y(t)$, and locate the maximum.'],
  sol:'<b>Given.</b> Two causal decaying exponentials with different rates.<br>'
     +'<b>Find.</b> Their convolution.<br>'
     +'<b>Method.</b> Both factors vanish for negative argument, so the integral runs over $0\\le\\tau\\le t$ only, and there is a single case, $t\\ge0$.<br>'
     +'<b>Solution.</b> For $t\\ge0$,$$y(t)=\\int_{0}^{t}e^{-\\tau}e^{-2(t-\\tau)}\\,\\d\\tau=e^{-2t}\\int_{0}^{t}e^{\\tau}\\,\\d\\tau=e^{-2t}\\left(e^{t}-1\\right)=e^{-t}-e^{-2t},$$and $y(t)=0$ for $t<0$. In one line, $y(t)=\\left(e^{-t}-e^{-2t}\\right)u(t)$.<br>'
     +'<b>Solution — the three values asked for.</b> $y(0)=0$ and $y(t)\\to0$. Setting $y\'(t)=-e^{-t}+2e^{-2t}=0$ gives $e^{t}=2$, so the maximum is at $t=\\ln2\\approx0.693$ with $y=\\tfrac12-\\tfrac14=\\tfrac14$.<br>'
     +'<b>Check.</b> The areas multiply: $\\int x=1$ and $\\int h=\\tfrac12$, so $\\int y$ must be $\\tfrac12$, and $\\int_{0}^{\\infty}\\left(e^{-t}-e^{-2t}\\right)\\d t=1-\\tfrac12=\\tfrac12$. The output starting at zero is expected: at $t=0$ the two signals overlap on a single point, which carries no area.',
  figSol:()=>{const E=Math.exp;const y=t=>t<0?0:E(-t)-E(-2*t);
    const a=P.Axes({w:1080,h:300,xr:[-0.6,5.4],yr:[-0.05,0.34],xlabel:'t\\;(\\text{s})',ylabel:'y(t)',
      pad:{l:60,r:28,t:32,b:38},xstep:1,ystep:0.1});
    a.curve(y,{color:C.out});
    a.vline(Math.LN2,{color:C.coral,opacity:.7});
    a.point(Math.LN2,0.25,{color:C.coral});
    a.note(Math.LN2+0.16,0.285,'t=\\ln 2,\\;y=\\tfrac14',{color:C.coral,fs:14,tex:true});
    return a.svg();},
  err:'Pulling $e^{-2\\tau}$ out of the integral instead of $e^{-2t}$. The variable of integration is $\\tau$, and only the part of the exponent that does not contain it may leave.',
  teach:'The rate difference is what makes the closed form finite. Ask what happens when the two rates are equal — the same integral then gives $te^{-t}u(t)$, and the shape changes.' },

{ id:'D3-10', module:'M3', type:'ct-conv', src:'MT1 Q4',
  stem:'The signal $x(t)$ is a rectangular pulse of height $1$ on $-1\\le t\\le1$. The impulse response is $$h(t)=\\bigl[u(t)-u(t-1)\\bigr]-\\bigl[u(t-1)-u(t-2)\\bigr].$$',
  parts:['Compute $y(t)=x(t)*h(t)$.',
         'Plot $y(t)$, marking every breakpoint, and explain why $\\int y(t)\\,\\d t=0$.'],
  figure:()=>pair(
    (()=>{const a=P.Axes({w:520,h:240,xr:[-2.4,3.4],yr:[-1.5,1.5],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',
      pad:{l:46,r:26,t:30,b:36},xstep:1,ystep:0.5});
      a.poly([[-2.4,0],[-1,0],[-1,1],[1,1],[1,0],[3.4,0]],{color:C.in}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:240,xr:[-2.4,3.4],yr:[-1.5,1.5],xlabel:'t\\;(\\text{s})',ylabel:'h(t)',
      pad:{l:46,r:26,t:30,b:36},xstep:1,ystep:0.5});
      a.poly([[-2.4,0],[0,0],[0,1],[1,1],[1,-1],[2,-1],[2,0],[3.4,0]],{color:C.h}); return a.svg();})()),
  sol:'<b>Given.</b> A two-second pulse and an impulse response made of two unit blocks of opposite sign.<br>'
     +'<b>Find.</b> $y(t)$, and the reason its total area vanishes.<br>'
     +'<b>Method.</b> Write $h(t)=r(t)-r(t-1)$, where $r(t)=u(t)-u(t-1)$ is the unit block on $0\\le t\\le1$. Convolution is linear and commutes with a shift, so$$y(t)=g(t)-g(t-1),\\qquad g(t)=x(t)*r(t).$$Only one convolution has to be done.<br>'
     +'<b>Solution — the building block.</b> Two rectangles of widths $2$ and $1$ give a trapezoid on $[-1,2]$ with a flat top of length $2-1=1$:$$g(t)=\\begin{cases}0,&t<-1,\\\\ t+1,&-1\\le t<0,\\\\ 1,&0\\le t<1,\\\\ 2-t,&1\\le t<2,\\\\ 0,&t\\ge2.\\end{cases}$$'
     +'<b>Solution — the difference.</b> Subtracting the same trapezoid delayed by one second,$$y(t)=\\begin{cases}0,&t<-1,\\\\ t+1,&-1\\le t<0,\\\\ 1-t,&0\\le t<2,\\\\ t-3,&2\\le t<3,\\\\ 0,&t\\ge3.\\end{cases}$$The two middle branches join smoothly, so the plot is a rise to $1$, a straight fall through zero to $-1$, and a rise back to zero.<br>'
     +'<b>Check.</b> Continuity: $y(0)=1$ from both sides, $y(2)=-1$ from both sides, $y(3)=0$. The supports add: $[-1,1]+[0,2]=[-1,3]$. The areas multiply: $\\int x=2$ and $\\int h=1-1=0$, so $\\int y=0$. Directly, the two positive triangles contribute $\\tfrac12+\\tfrac12=1$ and the two negative ones $-\\tfrac12-\\tfrac12=-1$.<br>'
     +'<b>Interpretation.</b> An impulse response of zero total area rejects any constant. Over the interval where the pulse looks locally constant to the system, the output passes through zero.',
  figSol:()=>{const y=t=>t<-1?0:t<0?t+1:t<2?1-t:t<3?t-3:0;
    const a=P.Axes({w:1080,h:320,xr:[-2,4.2],yr:[-1.5,1.5],xlabel:'t\\;(\\text{s})',ylabel:'y(t)',
      pad:{l:56,r:28,t:32,b:38},xstep:1,ystep:0.5});
    a.curve(y,{color:C.out});
    [-1,0,2,3].forEach(t=>a.vline(t,{color:C.muted,opacity:.5}));
    a.point(1,0,{color:C.coral});
    return a.svg();},
  err:'Convolving with the two blocks separately and then adding rather than subtracting the second, which gives a trapezoid of area $4$ instead of a signal of area zero.',
  teach:'Decomposing $h$ into shifted copies of one block is the transferable idea here. A student who sets up a five-case sliding argument will get the same answer with four times the work and four times the risk.' },

/* ---------- Type D — recovering h from an input-output pair ---------- */

{ id:'D3-11', module:'M3', type:'graph-h', src:'MT1 Q3',
  stem:'A discrete-time LTI system is driven by the input $x[n]$ plotted below, and produces the output $y[n]$ plotted beside it.',
  parts:['Write $x[n]$ as a sum of shifted impulses.',
         'Determine and plot the impulse response $h[n]$.'],
  figure:()=>pair(
    (()=>{const a=P.Axes({w:520,h:240,xr:[-1.6,5.6],yr:[-0.4,4.6],xlabel:'n',ylabel:'x[n]',
      pad:{l:44,r:26,t:30,b:34},xstep:1,ystep:1});
      a.stem(seq([1,1],0),{color:C.in}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:240,xr:[-1.6,5.6],yr:[-0.4,4.6],xlabel:'n',ylabel:'y[n]',
      pad:{l:44,r:26,t:30,b:34},xstep:1,ystep:1});
      a.stem(seq([1,3,4,2],0),{color:C.out}); return a.svg();})()),
  sol:'<b>Given.</b> $x[n]=\\{1,1\\}$ on $0\\le n\\le1$ and $y[n]=\\{1,3,4,2\\}$ on $0\\le n\\le3$.<br>'
     +'<b>Find.</b> $h[n]$.<br>'
     +'<b>Method.</b> Write the input as impulses. Linearity and time invariance then write the output as the same combination of shifted copies of $h$, and the resulting equations are solved from the earliest sample forward.<br>'
     +'<b>Solution — part (a).</b>$$x[n]=\\delta[n]+\\delta[n-1].$$'
     +'<b>Solution — part (b).</b> Therefore $y[n]=h[n]+h[n-1]$. The system is causal here because $y[n]=0$ for $n<0$, so start at $n=0$:$$\\begin{aligned}h[0]&=y[0]=1,\\\\ h[1]&=y[1]-h[0]=3-1=2,\\\\ h[2]&=y[2]-h[1]=4-2=2,\\\\ h[3]&=y[3]-h[2]=2-2=0,\\end{aligned}$$and every later sample is zero for the same reason. Hence$$h[n]=\\delta[n]+2\\delta[n-1]+2\\delta[n-2].$$'
     +'<b>Check.</b> Convolve back: $\\{1,1\\}*\\{1,2,2\\}=\\{1,\\,1+2,\\,2+2,\\,2\\}=\\{1,3,4,2\\}$, which is the given output. The supports agree too: $h$ occupies three samples and $x$ two, so $y$ must occupy four.',
  figSol:()=>{const a=P.Axes({w:1080,h:280,xr:[-1.6,6.6],yr:[-0.4,2.8],xlabel:'n',ylabel:'h[n]',
      pad:{l:48,r:28,t:30,b:34},xstep:1,ystep:1});
    a.stem(seq([1,2,2],0),{color:C.h}); return a.svg();},
  err:'Reading $h$ straight off the plot of $y$. That is only correct when the input is a single unit impulse, and here it is two.',
  teach:'The forward recursion terminates on its own: once the recovered samples stop changing the residual, $h$ has ended. Ask the student to say why $h[3]=0$ forces $h[n]=0$ for all $n>3$.' },

{ id:'D3-12', module:'M3', type:'graph-h', src:'MT1 Q3',
  stem:'The same LTI system is driven by the input $x[n]$ plotted below and produces the output $y[n]$ plotted beside it.',
  parts:['Write $x[n]$ as a sum of shifted impulses.',
         'Determine and plot $h[n]$.',
         'Using the recovered $h[n]$, give the output when the input is $\\delta[n-1]$.'],
  figure:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-1.6,5.6],yr:[-1.6,1.6],xlabel:'n',ylabel:'x[n]',
      pad:{l:44,r:26,t:30,b:34},xstep:1,ystep:1});
      a.stem(seq([1,0,-1],0),{color:C.in}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-1.6,5.6],yr:[-1.6,1.6],xlabel:'n',ylabel:'y[n]',
      pad:{l:44,r:26,t:30,b:34},xstep:1,ystep:1});
      a.stem(seq([1,1,0,-1,-1],0),{color:C.out}); return a.svg();})()),
  sol:'<b>Given.</b> $x[n]=\\{1,0,-1\\}$ on $0\\le n\\le2$ and $y[n]=\\{1,1,0,-1,-1\\}$ on $0\\le n\\le4$.<br>'
     +'<b>Find.</b> $h[n]$, and then the response to a delayed impulse.<br>'
     +'<b>Method.</b> As before: impulses in, shifted copies of $h$ out, solved forward.<br>'
     +'<b>Solution — part (a).</b>$$x[n]=\\delta[n]-\\delta[n-2].$$'
     +'<b>Solution — part (b).</b> Therefore $y[n]=h[n]-h[n-2]$, and$$\\begin{aligned}h[0]&=y[0]=1,\\\\ h[1]&=y[1]=1,\\\\ h[2]&=y[2]+h[0]=0+1=1,\\\\ h[3]&=y[3]+h[1]=-1+1=0,\\\\ h[4]&=y[4]+h[2]=-1+1=0,\\end{aligned}$$and zero from there on. Hence$$h[n]=\\delta[n]+\\delta[n-1]+\\delta[n-2].$$'
     +'<b>Solution — part (c).</b> Time invariance answers this without any further work: the response to $\\delta[n-1]$ is $h[n-1]=\\delta[n-1]+\\delta[n-2]+\\delta[n-3]$.<br>'
     +'<b>Check.</b> Convolve back: with $h=\\{1,1,1\\}$, $h[n]-h[n-2]$ gives $1,1,1-1,0-1,0-1$, that is $\\{1,1,0,-1,-1\\}$ — the given output.',
  figSol:()=>{const a=P.Axes({w:1080,h:280,xr:[-1.6,6.6],yr:[-0.4,1.7],xlabel:'n',ylabel:'h[n]',
      pad:{l:48,r:28,t:30,b:34},xstep:1,ystep:0.5});
    a.stem(seq([1,1,1],0),{color:C.h}); return a.svg();},
  err:'Solving $y[n]=h[n]-h[n-2]$ backwards from the last sample, which needs a terminating value that is not given and usually produces a non-zero $h$ on the negative axis.',
  teach:'Part (c) is free if time invariance has been understood and expensive if it has not. Watch for a student who convolves again instead of shifting.' },

/* ---------- Type E — causality and stability from h ---------- */

{ id:'D3-13', module:'M3', type:'h-props', src:'Final Q1',
  stem:'For each impulse response below, decide whether the system is causal and whether it is BIBO stable. Justify every answer.'
      +'$$\\text{(i)}\\;\\;h[n]=\\left(\\tfrac12\\right)^{\\!n}u[n]\\qquad\\text{(ii)}\\;\\;h[n]=3^{\\,n}u[-n]\\qquad\\text{(iii)}\\;\\;h[n]=\\left(\\tfrac32\\right)^{\\!n}u[n]$$',
  parts:['Decide causality for each, from the support of $h[n]$.',
         'Decide stability for each, by evaluating $\\sum_{n}|h[n]|$.'],
  sol:'<b>Given.</b> Three impulse responses, each a geometric sequence on a half line.<br>'
     +'<b>Find.</b> Causality and stability for each.<br>'
     +'<b>Method.</b> Causality is read off the support: the system is causal exactly when $h[n]=0$ for every $n<0$. Stability is the absolute summability of $h$, and for a geometric sequence that is a convergence test on the common ratio.<br>'
     +'<b>Solution — (i).</b> $h[n]=0$ for $n<0$, so the system is <b>causal</b>. And$$\\sum_{n=0}^{\\infty}\\left(\\tfrac12\\right)^{\\!n}=\\frac{1}{1-\\tfrac12}=2<\\infty,$$so it is <b>stable</b>.<br>'
     +'<b>Solution — (ii).</b> Here $u[-n]$ is one for $n\\le0$, so $h$ lives on the non-positive axis and is non-zero for negative $n$. The system is <b>not causal</b>. For stability substitute $m=-n$:$$\\sum_{n=-\\infty}^{0}3^{\\,n}=\\sum_{m=0}^{\\infty}3^{-m}=\\frac{1}{1-\\tfrac13}=\\tfrac32<\\infty,$$so it is <b>stable</b>. A ratio larger than one is not by itself a problem: what matters is that the sequence decays in the direction in which it extends.<br>'
     +'<b>Solution — (iii).</b> $h[n]=0$ for $n<0$, so the system is <b>causal</b>. But $\\left(\\tfrac32\\right)^{n}$ grows without bound, so the sum diverges and the system is <b>not stable</b>.<br>'
     +'<b>Check.</b> The three cases show that the two properties are independent: (i) has both, (ii) has stability without causality, (iii) has causality without stability. A fourth combination, neither, is given by $h[n]=3^{\\,n}u[-n]$ with the ratio replaced by $\\tfrac13$.',
  err:'Declaring (ii) unstable on the grounds that the ratio $3$ exceeds one. The ratio has to be compared with one in the direction the sequence extends, and this sequence extends towards $n=-\\infty$, where $3^{n}\\to0$.',
  teach:'Insist that the sum be written with its limits before it is evaluated. The substitution $m=-n$ in (ii) is the whole question, and it is invisible in an answer that only quotes a ratio.' },

{ id:'D3-14', module:'M3', type:'h-props', src:'Final Q1',
  stem:'For each continuous-time impulse response below, decide whether the system is causal and whether it is BIBO stable. Justify every answer.'
      +'$$\\text{(i)}\\;\\;h(t)=e^{-3t}u(t)\\qquad\\text{(ii)}\\;\\;h(t)=e^{2t}u(-t)\\qquad\\text{(iii)}\\;\\;h(t)=u(t)$$',
  parts:['Decide causality for each, from the support of $h(t)$.',
         'Decide stability for each, by evaluating $\\int_{-\\infty}^{\\infty}|h(t)|\\,\\d t$.',
         'For the unstable case, give one bounded input whose output is unbounded.'],
  sol:'<b>Given.</b> Three continuous-time impulse responses.<br>'
     +'<b>Find.</b> Causality, stability, and a counterexample where stability fails.<br>'
     +'<b>Method.</b> Causal exactly when $h(t)=0$ for $t<0$. Stable exactly when $\\int|h|<\\infty$. To disprove stability, exhibit one bounded input with an unbounded output.<br>'
     +'<b>Solution — (i).</b> Zero for $t<0$, so <b>causal</b>. And$$\\int_{0}^{\\infty}e^{-3t}\\,\\d t=\\tfrac13<\\infty,$$so <b>stable</b>.<br>'
     +'<b>Solution — (ii).</b> $u(-t)$ is one for $t\\le0$, so $h$ is non-zero on the negative axis: <b>not causal</b>. And$$\\int_{-\\infty}^{0}e^{2t}\\,\\d t=\\left[\\tfrac12e^{2t}\\right]_{-\\infty}^{0}=\\tfrac12<\\infty,$$so <b>stable</b>.<br>'
     +'<b>Solution — (iii).</b> Zero for $t<0$, so <b>causal</b>. But$$\\int_{0}^{\\infty}1\\,\\d t=\\infty,$$so <b>not stable</b>.<br>'
     +'<b>Solution — part (c).</b> For (iii) the system is the integrator $y(t)=\\int_{-\\infty}^{t}x(\\tau)\\,\\d\\tau$. Take $x(t)=u(t)$, which satisfies $|x|\\le1$. Then $y(t)=t$ for $t\\ge0$, which grows without bound. One bounded input with an unbounded output is enough to disprove stability.<br>'
     +'<b>Check.</b> The pattern matches the discrete-time cases exactly: an exponential is absolutely integrable when it decays in the direction it extends, and the integrator is the continuous-time twin of the accumulator, which failed the same test for the same reason.',
  err:'Calling (iii) stable because $|h(t)|\\le1$. Boundedness of the impulse response is not the criterion. The criterion is that its absolute integral converges, and a bounded signal of infinite duration can fail it.',
  teach:'Part (c) is the one place where a counterexample, not an argument, is required. A student who asserts instability without producing a specific bounded input has not answered the question asked.' },

]);

/* ---------- the two M3 drill scenes ---------- */

window.DRILL_M3 = [

{ id:'m3-drill-map', module:'M3', nav:'Module 3 exam drill · question types',
  title:'Module 3 — what a question looks like', src:'pp. 14–21',
  objective:'Name the five recurring question shapes before the module is read.',
  keywords:'exam drill module 3 question types convolution impulse response taxonomy practice',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 3 · Exam drill', src:'pp. 14–21'},
  {t:'title', text:'Five shapes, and the method each one wants'},
  {t:'lede', text:'Almost every question on linear time-invariant systems is one of five shapes. Read them now, before the module. You are not expected to be able to answer them yet — you are expected to recognise them when they arrive.'},
  {t:'raw', html:'<div style="height:10px"></div>'},
  {t:'drilltypes', module:'M3'}
]},

{ id:'m3-drill', module:'M3', nav:'Module 3 exam drill · questions',
  title:'Module 3 — exam drill', src:'pp. 14–21',
  objective:'Fourteen open-ended questions in examination form, with worked solutions.',
  keywords:'exam drill module 3 questions practice convolution sum integral impulse response causality stability',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 3 · Exam drill D3-01 … D3-14', src:'pp. 14–21'},
  {t:'title', text:'Exam drill'},
  {t:'small', html:'Work each question on paper before opening its solution. Every solution ends with a <b>Check</b> step: the supports add, the totals multiply, and the pieces join continuously. Those three tests catch most errors without redoing the work.'},
  {t:'rule', short:true},
  {t:'drill', module:'M3'}
]}

];

})();
