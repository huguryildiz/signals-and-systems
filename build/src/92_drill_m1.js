/* ==========================================================================
   Practice questions — Module 1.
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
   MODULE 1 — Signal Foundations
   ====================================================================== */

CONTENT.DRILLTYPES.M1 = [
  { k:'period', name:'Periodicity and the fundamental period',
    asks:'A signal is given as a formula. Decide whether it repeats, and if it does, find the smallest period.',
    method:['In discrete time, test whether $\\omega_0/2\\pi$ is a ratio of two integers. If it is not, the sequence never repeats.',
            'If it is, write $N=(2\\pi/\\omega_0)k$ and take the smallest positive integer value.',
            'In continuous time every sinusoid repeats, with $T_0=2\\pi/|\\omega_0|$.',
            'For a sum, each term must repeat, and the period of the sum is the least common multiple of the individual periods.'],
    go:'m1-periodic' },
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
    asks:'Evaluate an integral against an impulse, or sketch a sequence or signal built from impulses and steps.',
    method:['Sifting returns a number: $\\int x(t)\\delta(t-t_0)\\,\\d t=x(t_0)$.',
            'Sampling returns a signal: $x(t)\\delta(t-t_0)=x(t_0)\\delta(t-t_0)$.',
            'A scaled argument carries a factor: $\\delta(at-b)=\\frac{1}{|a|}\\delta\\!\\left(t-\\frac{b}{a}\\right)$.',
            'The impulse and the step are related by $\\delta=\\d u/\\d t$ in continuous time and $\\delta[n]=u[n]-u[n-1]$ in discrete time; running the relation the other way turns a train of impulses into a staircase.'],
    go:'m1-ct-impulse' }
];

CONTENT.DRILL = CONTENT.DRILL.concat([

{ id:'D1-01', module:'M1', type:'period', src:'MT1 Q1',
  stem:'Decide whether each sequence below is periodic. Where it is, give the fundamental period $N_0$.'
      +'$$\\text{(i)}\\;\\;x[n]=\\cos\\!\\left(\\tfrac{5\\pi}{8}n-\\tfrac{\\pi}{6}\\right)\\qquad\\text{(ii)}\\;\\;x[n]=e^{j3n}\\qquad\\text{(iii)}\\;\\;x[n]=\\sin\\!\\left(\\tfrac{\\pi}{6}n\\right)$$',
  parts:['Apply the periodicity test to each sequence.',
         'Give $N_0$ wherever it exists, and say why it does not exist otherwise.'],
  sol:'<b>Given.</b> Three discrete-time sinusoids.<br>'
     +'<b>Find.</b> Which repeat, and with what fundamental period.<br>'
     +'<b>Method.</b> A discrete-time sinusoid repeats only if $x[n]=x[n+N]$ for some positive <em>integer</em> $N$. That needs $\\omega_0N=2\\pi k$ with $k$ an integer, so$$\\frac{\\omega_0}{2\\pi}=\\frac{k}{N}$$must be rational. The phase never affects the test.<br>'
     +'<b>Solution — (i).</b> $\\omega_0=\\tfrac{5\\pi}{8}$, so $\\dfrac{\\omega_0}{2\\pi}=\\dfrac{5}{16}$, rational. Then $N=\\dfrac{2\\pi}{\\omega_0}k=\\dfrac{16}{5}k$ is an integer first at $k=5$, giving $N_0=16$. <b>Periodic.</b><br>'
     +'<b>Solution — (ii).</b> $\\omega_0=3$, so $\\dfrac{\\omega_0}{2\\pi}=\\dfrac{3}{2\\pi}$, irrational because $\\pi$ is irrational. No integer $N$ works. <b>Not periodic.</b><br>'
     +'<b>Solution — (iii).</b> $\\omega_0=\\tfrac{\\pi}{6}$, so $\\dfrac{\\omega_0}{2\\pi}=\\dfrac{1}{12}$, rational. $N=\\dfrac{2\\pi}{\\omega_0}k=12k$ is an integer already at $k=1$, so $N_0=12$. <b>Periodic.</b><br>'
     +'<b>Check.</b> For (i), $\\cos\\!\\left(\\tfrac{5\\pi}{8}(n+16)-\\tfrac{\\pi}{6}\\right)=\\cos\\!\\left(\\tfrac{5\\pi}{8}n-\\tfrac{\\pi}{6}+10\\pi\\right)$, and $10\\pi$ is a whole number of turns, so $N=16$ does return the sequence to itself; no smaller positive integer does, because $\\tfrac{16}{5}k$ is an integer only when $5\\mid k$. The continuous-time signals $\\cos(5t/8-\\pi/6)$ and $\\sin(t/6)$ are perfectly periodic — it is sampling on the integers that removes the repetition in (ii).',
  err:'Transferring the continuous-time rule and reporting a non-integer period such as $2\\pi/3$ for (ii). A period that is not an integer is not a period of a sequence.',
  teach:'Ask for the ratio $\\omega_0/2\\pi$ to be written down for all three before any of them is answered. A student who computes $2\\pi/\\omega_0$ instead has skipped the decisive step.' },

{ id:'D1-02', module:'M1', type:'period', src:'MT1 Q1',
  stem:'Let $$x[n]=\\cos\\!\\left(\\tfrac{\\pi}{5}n\\right)+\\sin\\!\\left(\\tfrac{\\pi}{3}n\\right).$$',
  parts:['Show that each term is periodic and give its period.',
         'Determine the fundamental period $N_0$ of $x[n]$ and the fundamental frequency.'],
  sol:'<b>Given.</b> A sum of two discrete-time sinusoids.<br>'
     +'<b>Find.</b> The fundamental period of the sum.<br>'
     +'<b>Method.</b> A sum repeats only when every term repeats. The period of the sum is then the least common multiple of the individual periods, which is the smallest length holding a whole number of each.<br>'
     +'<b>Solution — part (a).</b> For the first term $\\omega_1=\\tfrac{\\pi}{5}$, so $\\dfrac{\\omega_1}{2\\pi}=\\dfrac{1}{10}$ and $N_1=10$. For the second $\\omega_2=\\tfrac{\\pi}{3}$, so $\\dfrac{\\omega_2}{2\\pi}=\\dfrac16$ and $N_2=6$. Both are rational, so both terms repeat.<br>'
     +'<b>Solution — part (b).</b>$$N_0=\\operatorname{lcm}(10,6)=30,$$and the fundamental frequency is $\\omega_0=\\dfrac{2\\pi}{30}=\\dfrac{\\pi}{15}$ rad/sample.<br>'
     +'<b>Check.</b> $30$ contains $3$ whole periods of the first term and $5$ of the second, so both return to their starting values together. Nothing smaller does: $15$ holds one and a half periods of the first term, which is not a whole number. In terms of harmonics, the two terms are the $3$rd and the $5$th harmonic of $\\pi/15$, consistent with $\\tfrac{\\pi}{5}=3\\cdot\\tfrac{\\pi}{15}$ and $\\tfrac{\\pi}{3}=5\\cdot\\tfrac{\\pi}{15}$.',
  err:'Multiplying the two periods to get $60$. The product is always a period, but it is the fundamental one only when the two are coprime — here $10$ and $6$ share the factor $2$.',
  teach:'Have the student verify $N_0$ by checking that $N_0/N_1$ and $N_0/N_2$ are both integers and that no smaller candidate has that property.' },

{ id:'D1-03', module:'M1', type:'period', src:'MT1 Q1',
  stem:'Decide whether each continuous-time signal is periodic. Where it is, give $T_0$ and $\\omega_0$.'
      +'$$\\text{(i)}\\;\\;x(t)=\\cos(3t)+\\sin(5t)\\qquad\\text{(ii)}\\;\\;y(t)=\\cos(t)+\\cos(\\sqrt2\\,t)$$',
  parts:['Give the period of each term separately.',
         'Decide whether the sum repeats, and give $T_0$ where it does.'],
  sol:'<b>Given.</b> Two sums of continuous-time sinusoids.<br>'
     +'<b>Find.</b> Whether each sum repeats, and its fundamental period.<br>'
     +'<b>Method.</b> Every continuous-time sinusoid is periodic, with $T=2\\pi/|\\omega|$. A sum repeats exactly when the ratio of the two periods is rational, and $T_0$ is then the smallest length containing a whole number of each.<br>'
     +'<b>Solution — (i).</b> $T_1=\\dfrac{2\\pi}{3}$ and $T_2=\\dfrac{2\\pi}{5}$. The ratio $\\dfrac{T_1}{T_2}=\\dfrac53$ is rational, so the sum repeats. The smallest common length is$$T_0=2\\pi=3T_1=5T_2,\\qquad\\omega_0=\\frac{2\\pi}{2\\pi}=1\\;\\text{rad/s}.$$'
     +'<b>Solution — (ii).</b> $T_1=2\\pi$ and $T_2=\\dfrac{2\\pi}{\\sqrt2}=\\sqrt2\\,\\pi$. The ratio $\\dfrac{T_1}{T_2}=\\sqrt2$ is irrational, so no common length exists and the sum is <b>not periodic</b>. Each term alone still is.<br>'
     +'<b>Check.</b> In (i) the two terms are the $3$rd and $5$th harmonic of $\\omega_0=1$: $3=3\\cdot1$ and $5=5\\cdot1$, and $\\gcd(3,5)=1$ already fixes $\\omega_0$ at its largest possible value, so $T_0=2\\pi$ cannot be reduced. In (ii) no $\\omega_0$ makes both $1$ and $\\sqrt2$ integer multiples, which is the same statement as $\\sqrt2$ being irrational.<br>'
     +'<b>Contrast with discrete time.</b> In continuous time it is the <em>ratio</em> of two frequencies that must be rational. In discrete time each frequency has to satisfy its own rationality condition against $2\\pi$ first.',
  err:'Concluding from $T_1/T_2$ rational that $T_0=T_1T_2$. In (i) that would give $4\\pi^2/15$, which is not a period of either term.',
  teach:'Case (ii) is the useful one. It shows that a sum of two perfectly periodic signals need not be periodic, which students find surprising and rarely forget afterwards.' },

{ id:'D1-04', module:'M1', type:'period',
  stem:'Let $$x(t)=2e^{-0.3t}\\cos(4t),\\qquad t\\in\\mathbb{R},$$a sinusoid carried inside the growing/decaying envelope $\\pm2e^{-0.3t}$.',
  parts:['State the period $T_0$ of the pure oscillation $y(t)=2\\cos(4t)$, the case $r=0$.',
         'Prove that $x(t)$ itself is not periodic, by testing the necessary condition $x(0)=x(T)$ for a candidate period $T>0$.',
         'In one sentence, say why no signal whose envelope is strictly monotonic can be periodic.'],
  sol:'<b>Given.</b> A damped sinusoid, envelope $2e^{-0.3t}$, angular frequency $4$ rad/s.<br>'
     +'<b>Find.</b> Whether the damped signal repeats.<br>'
     +'<b>Method.</b> If $x(t)$ were periodic with period $T>0$, then $x(t)=x(t+T)$ would hold for <em>every</em> $t$, in particular at $t=0$. Testing that one instant is enough to rule periodicity out.<br>'
     +'<b>Solution — part (a).</b> $\\omega_0=4$, so $T_0=\\dfrac{2\\pi}{4}=\\dfrac{\\pi}{2}$ s.<br>'
     +'<b>Solution — part (b).</b> $x(0)=2e^{0}\\cos(0)=2$. A period $T>0$ would require$$x(T)=2e^{-0.3T}\\cos(4T)=2\\;\\Longrightarrow\\;\\cos(4T)=e^{0.3T}.$$For every $T>0$, $e^{0.3T}>1$, while $\\cos(4T)\\le1$ always. The two sides can never meet, so no positive $T$ satisfies even this one necessary condition. <b>$x(t)$ is not periodic.</b><br>'
     +'<b>Solution — part (c).</b> A periodic signal must return to its starting value after every period, forever. A strictly monotonic envelope makes the peak amplitude smaller (or larger) at every later cycle, so the signal can never return exactly to where it started; the definition of periodicity fails at the very first candidate period.<br>'
     +'<b>Check.</b> The same argument holds without picking $t=0$: comparing the envelope at any two points a candidate period apart, $2e^{-0.3t}\\neq2e^{-0.3(t+T)}$ for $T\\neq0$, because $e^{-0.3t}$ is strictly decreasing and therefore injective. Injectivity of the envelope alone is already enough to block periodicity, independently of the oscillation inside it.',
  err:'Reporting $T_0=\\pi/2$ for $x(t)$ itself, by testing periodicity of the cosine factor only and ignoring that the full signal must return to the same value, not just the same phase.',
  teach:'Ask why the argument in part (b) only needs one instant, $t=0$, rather than checking all $t$. It is because periodicity is a universal claim, and a universal claim is refuted by a single counterexample.' },

{ id:'D1-05', module:'M1', type:'energy', src:'MT1 Q1',
  stem:'The signal $x(t)$ sketched below is zero outside $0\\le t\\le5$.',
  parts:['Calculate the total energy $E_\\infty$.',
         'Calculate the average power $P_\\infty$ and classify the signal.'],
  figure:()=>{const a=P.Axes({w:1080,h:250,xr:[-1.4,6.6],yr:[-0.4,2.6],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',
      pad:{l:52,r:28,t:30,b:38},xstep:1,ystep:1});
    a.poly([[-1.4,0],[0,0],[2,2],[3,2],[5,0],[6.6,0]],{color:C.in}); return a.svg();},
  sol:'<b>Given.</b> A trapezoidal pulse: $x(t)=t$ on $0\\le t\\le2$, $x(t)=2$ on $2\\le t\\le3$, $x(t)=5-t$ on $3\\le t\\le5$, zero elsewhere. Energy and power are normalised, $R=1\\,\\Omega$.<br>'
     +'<b>Find.</b> $E_\\infty$, $P_\\infty$, and the class.<br>'
     +'<b>Method.</b> Square first, then integrate over the whole axis. Outside the support the integrand is zero, so only three pieces contribute.<br>'
     +'<b>Solution — part (a).</b>$$E_\\infty=\\int_{0}^{2}t^{2}\\,\\d t+\\int_{2}^{3}4\\,\\d t+\\int_{3}^{5}(5-t)^{2}\\,\\d t=\\frac83+4+\\frac83=\\frac{28}{3}\\;\\text{J}\\approx9.333\\;\\text{J}.$$'
     +'<b>Solution — part (b).</b> The energy is finite, so$$P_\\infty=\\lim_{T\\to\\infty}\\frac{1}{2T}\\int_{-T}^{T}|x(t)|^{2}\\,\\d t=\\lim_{T\\to\\infty}\\frac{28/3}{2T}=0\\;\\text{W}.$$The signal is an <b>energy signal</b>.<br>'
     +'<b>Check.</b> The two sloping halves are mirror images of each other about $t=2.5$, so their contributions must be equal — and they are, $\\tfrac83$ each. A bound: the pulse never exceeds $2$ and lasts $5$ seconds, so $E_\\infty\\le4\\cdot5=20$, and $\\tfrac{28}{3}\\approx9.33$ sits well inside that. Classification needs both numbers: $E_\\infty<\\infty$ <em>and</em> $P_\\infty=0$.',
  err:'Reporting $P_\\infty=(28/3)/5$ by averaging over the support instead of over $[-T,T]$ with $T\\to\\infty$. The averaging window is the whole axis, not the part where the signal is non-zero.',
  teach:'Ask for both numbers every time. A student who writes only $E_\\infty$ has not distinguished the energy class from the power class.' },

{ id:'D1-06', module:'M1', type:'energy', src:'MT1 Q1',
  stem:'Consider the two discrete-time signals $$x_1[n]=\\left(\\tfrac25\\right)^{\\!n}u[n],\\qquad x_2[n]=3\\,u[n].$$',
  parts:['Calculate $E_\\infty$ and $P_\\infty$ for $x_1[n]$.',
         'Calculate $E_\\infty$ and $P_\\infty$ for $x_2[n]$.',
         'Classify each signal.'],
  sol:'<b>Given.</b> A decaying geometric sequence and a scaled unit step.<br>'
     +'<b>Find.</b> Energy, power and class for each.<br>'
     +'<b>Method.</b> In discrete time,$$E_\\infty=\\sum_{n=-\\infty}^{\\infty}|x[n]|^{2},\\qquad P_\\infty=\\lim_{N\\to\\infty}\\frac{1}{2N+1}\\sum_{n=-N}^{N}|x[n]|^{2}.$$'
     +'<b>Solution — part (a).</b>$$E_\\infty=\\sum_{n=0}^{\\infty}\\left(\\tfrac25\\right)^{\\!2n}=\\sum_{n=0}^{\\infty}\\left(\\tfrac{4}{25}\\right)^{\\!n}=\\frac{1}{1-\\tfrac{4}{25}}=\\frac{25}{21},$$which is finite, so $P_\\infty=0$.<br>'
     +'<b>Solution — part (b).</b> $|x_2[n]|^{2}=9\\,u[n]$, so the energy sum diverges: $E_\\infty=\\infty$. For the power, the window $-N\\le n\\le N$ contains $N+1$ non-zero samples out of $2N+1$, each contributing $9$, so$$P_\\infty=\\lim_{N\\to\\infty}\\frac{9(N+1)}{2N+1}=\\frac92=4.5.$$'
     +'<b>Solution — part (c).</b> $x_1$ is an <b>energy signal</b>; $x_2$ is a <b>power signal</b>.<br>'
     +'<b>Check.</b> A constant sequence of amplitude $A$ switched on at $n=0$ must have $P_\\infty=A^{2}/2$ by the same counting argument, and $A=3$ gives $9/2$ directly, matching part (b) without repeating the limit. For part (a), the geometric sum is bounded above by $1/(1-4/25)$ evaluated exactly, and $25/21\\approx1.19$, a sensible size for a sequence that starts at $1$ and shrinks.',
  err:'Writing $P_\\infty=9$ for $x_2$ by evaluating the sum only over $n\\ge0$ and dividing by $N+1$ instead of $2N+1$. The window is symmetric about the origin, and the zeros on the negative side count in the denominator.',
  teach:'The counting argument $(N+1)/(2N+1)$ is worth demanding in writing. Students who quote $1/2$ from memory usually cannot produce it for $3u[n-4]$, where the same limit still gives $9/2$.' },

{ id:'D1-07', module:'M1', type:'energy', src:'MT1 Q1',
  stem:'With the normalised convention $R=1\\,\\Omega$, consider $$x_1(t)=e^{-5t}u(t)\\;\\text{V},\\qquad x_2(t)=4\\cos(3t)\\;\\text{V}.$$',
  parts:['Calculate $E_\\infty$ for $x_1(t)$ and state $P_\\infty$.',
         'Calculate $P_\\infty$ for $x_2(t)$ and state $E_\\infty$.',
         'Starting from $P_T=\\dfrac{1}{2T}\\displaystyle\\int_{-T}^{T}|x(t)|^{2}\\,\\d t$, show directly that a finite $E_\\infty$ forces $P_\\infty=0$.'],
  sol:'<b>Given.</b> A decaying exponential and a sinusoid, both in volts across $1\\,\\Omega$.<br>'
     +'<b>Find.</b> Energy, power, and a general proof that the two classes cannot overlap.<br>'
     +'<b>Method.</b> Square, then integrate over the axis for energy or average over a growing window for power. For a periodic signal the infinite average equals the average over one period.<br>'
     +'<b>Solution — part (a).</b>$$E_\\infty=\\int_{0}^{\\infty}e^{-10t}\\,\\d t=\\left[-\\tfrac{1}{10}e^{-10t}\\right]_{0}^{\\infty}=\\tfrac{1}{10}\\;\\text{J},$$finite, so $P_\\infty=0$.<br>'
     +'<b>Solution — part (b).</b> The signal has period $T_0=\\dfrac{2\\pi}{3}$, so$$P_\\infty=\\frac{1}{T_0}\\int_{0}^{T_0}16\\cos^{2}(3t)\\,\\d t=\\frac{16}{2}=8\\;\\text{W},$$using $\\overline{\\cos^{2}}=\\tfrac12$. Since $P_\\infty\\neq0$, the energy is infinite.<br>'
     +'<b>Solution — part (c).</b> For any finite $T$,$$P_T=\\frac{1}{2T}\\int_{-T}^{T}|x(t)|^{2}\\,\\d t\\le\\frac{1}{2T}\\int_{-\\infty}^{\\infty}|x(t)|^{2}\\,\\d t=\\frac{E_\\infty}{2T},$$because the integrand is non-negative and $[-T,T]$ is only part of the whole axis. If $E_\\infty<\\infty$, the right-hand side $\\to0$ as $T\\to\\infty$, and since $P_T\\ge0$ throughout, $P_\\infty=\\lim_{T\\to\\infty}P_T=0$ by the squeeze.<br>'
     +'<b>Check.</b> Applying the bound of part (c) to $x_1$: $E_\\infty=1/10$, so $P_T\\le1/(20T)\\to0$, consistent with the direct answer $P_\\infty=0$. The familiar result $P=A^{2}/2$ for a sinusoid of amplitude $A$ gives $16/2=8$ for $x_2$ directly, matching part (b) by a route that never mentions $T_0$.',
  err:'Reporting $P_\\infty=16$ for the sinusoid by forgetting the factor $\\tfrac12$ from the time average of $\\cos^{2}$.',
  teach:'Part (c) is the general result behind D1-05 and D1-06. Insist on the inequality $P_T\\le E_\\infty/2T$ written out, not a slogan about the two classes being disjoint.' },

{ id:'D1-08', module:'M1', type:'energy',
  stem:'Let $$x[n]=\\begin{cases}2^{\\,n}, & n\\le-1,\\\\[2pt] 3, & n=0,\\\\[2pt] \\left(\\tfrac12\\right)^{\\!n}, & n\\ge1.\\end{cases}$$',
  parts:['List $x[n]$ for $-3\\le n\\le3$.',
         'Calculate $E_\\infty$.',
         'State $P_\\infty$ and classify the signal.'],
  sol:'<b>Given.</b> A two-sided sequence, defined by a different formula on each of three ranges of $n$.<br>'
     +'<b>Find.</b> $E_\\infty$, $P_\\infty$, and the class.<br>'
     +'<b>Method.</b> Split the energy sum at the same three ranges the signal is defined on, and evaluate each geometric series separately.<br>'
     +'<b>Solution — part (a).</b> $x[-3]=\\tfrac18$, $x[-2]=\\tfrac14$, $x[-1]=\\tfrac12$, $x[0]=3$, $x[1]=\\tfrac12$, $x[2]=\\tfrac14$, $x[3]=\\tfrac18$.<br>'
     +'<b>Solution — part (b).</b>$$E_\\infty=\\sum_{n=-\\infty}^{-1}4^{\\,n}+3^{2}+\\sum_{n=1}^{\\infty}4^{-n}.$$Substituting $m=-n$ in the first sum gives $\\sum_{m=1}^{\\infty}4^{-m}=\\tfrac13$, and the third sum is the same series, also $\\tfrac13$. So$$E_\\infty=\\tfrac13+9+\\tfrac13=\\frac{29}{3}\\;\\text{J}\\approx9.667\\;\\text{J}.$$'
     +'<b>Solution — part (c).</b> $E_\\infty$ is finite, so $P_\\infty=0$. The signal is an <b>energy signal</b>.<br>'
     +'<b>Check.</b> The two tails are mirror images in shape — $2^{\\,n}$ for $n\\le-1$ and $(1/2)^{\\,n}$ for $n\\ge1$ are reflections of each other about $n=0$ — so their energy contributions must match, and both come out to $\\tfrac13$. A bound: every sample has magnitude at most $3$, and the two tails are each dominated termwise by $4^{-|n|}$ for $|n|\\ge1$ summing to less than $1$, so $E_\\infty<9+2=11$, and $\\tfrac{29}{3}\\approx9.67$ sits inside that bound.',
  err:'Treating the piecewise definition as three separate signals to classify, and reporting three different answers instead of one $E_\\infty$ for the single sequence $x[n]$ they together define.',
  teach:'Ask for the table in part (a) before the sum is attempted. A student who cannot list seven values correctly will not get the two geometric series right either.' },

{ id:'D1-09', module:'M1', type:'transform', src:'MT1 Q1',
  stem:'The signal $x(t)$ is sketched below: it rises linearly from $0$ at $t=-2$ to $2$ at $t=0$, stays at $2$ until $t=1$, and is zero elsewhere.',
  parts:['Plot $y(t)=x(2t+2)$.',
         'State the support of $y(t)$ and check its width against the width of $x(t)$.'],
  figure:()=>{const a=P.Axes({w:1080,h:250,xr:[-3.2,2.2],yr:[-0.4,2.6],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',
      pad:{l:52,r:28,t:30,b:38},xstep:1,ystep:1});
    a.poly([[-3,0],[-2,0],[0,2],[1,2],[1,0],[2.2,0]],{color:C.in}); return a.svg();},
  sol:'<b>Given.</b> $x(t)=t+2$ on $-2\\le t\\le0$, $x(t)=2$ on $0\\le t\\le1$, zero elsewhere.<br>'
     +'<b>Find.</b> $y(t)=x(2t+2)$.<br>'
     +'<b>Method.</b> Write the argument in the standard form $x(at-b)$: here $a=2$ and $b=-2$. Shift first, then scale. Doing the two in the other order changes the sign of the shift, and that is where the marks go.<br>'
     +'<b>Solution — step 1, shift.</b> $v(t)=x(t-b)=x(t+2)$ moves the support two seconds to the left, to $-4\\le t\\le-1$.<br>'
     +'<b>Solution — step 2, scale.</b> $y(t)=v(2t)$ compresses by $2$, so the support $-4\\le t\\le-1$ maps to $-2\\le t\\le-0.5$.<br>'
     +'<b>Solution — the formula.</b> Substituting directly,$$y(t)=\\begin{cases}2t+4,&-2\\le t\\le-1,\\\\[2pt] 2,&-1\\le t\\le-0.5,\\\\[2pt] 0,&\\text{otherwise,}\\end{cases}$$because $2t+2$ lies in $[-2,0]$ for $t\\in[-2,-1]$, where $x$ equals its argument plus $2$, and in $[0,1]$ for $t\\in[-1,-0.5]$, where $x$ is the constant $2$.<br>'
     +'<b>Check.</b> Width: $x$ occupies $3$ seconds ($-2$ to $1$), and compression by $|a|=2$ must give $1.5$ seconds — and $-0.5-(-2)=1.5$, which matches. Two sample points: $y(-2)=x(-2)=0$ and $y(-0.5)=x(1)=2$, both matching the endpoints of the plot.',
  figSol:()=>{const y=t=>(t>=-2&&t<=-1)?2*t+4:(t>-1&&t<=-0.5)?2:0;
    const a=P.Axes({w:1080,h:270,xr:[-3,0.4],yr:[-0.4,2.6],xlabel:'t\\;(\\text{s})',ylabel:'y(t)',
      pad:{l:52,r:28,t:32,b:38},xstep:1,ystep:0.5});
    a.curve(y,{color:C.out});
    [-2,-1,-0.5].forEach(t=>a.vline(t,{color:C.muted,opacity:.5}));
    return a.svg();},
  err:'Scaling first and then shifting by $-2$, which produces $x(2(t-2))=x(2t-4)$ and places the result on the wrong part of the axis.',
  teach:'Ask for the intermediate signal $v(t)$ to be drawn. A student who goes straight to the answer cannot be corrected, because there is nothing to inspect.' },

{ id:'D1-10', module:'M1', type:'transform', src:'MT1 Q1',
  stem:'The sequence $x[n]$ is plotted below.',
  parts:['Plot $y[n]=x[2-n]$.',
         'Plot $z[n]=x[n+1]$ and say which of the two operations changes the order of the samples.'],
  figure:()=>{const a=P.Axes({w:1080,h:260,xr:[-3.6,4.6],yr:[-3.6,4.6],xlabel:'n',ylabel:'x[n]',
      pad:{l:50,r:28,t:30,b:34},xstep:1,ystep:1});
    a.stem([[-1,2],[0,-1],[1,3],[2,-2]],{color:C.in}); return a.svg();},
  sol:'<b>Given.</b> $x[-1]=2$, $x[0]=-1$, $x[1]=3$, $x[2]=-2$, and zero elsewhere.<br>'
     +'<b>Find.</b> A reflection with a shift, and a plain shift.<br>'
     +'<b>Method.</b> For $y[n]=x[2-n]$, the sample originally at index $m$ moves to $n=2-m$. Map the four non-zero indices one at a time. For $z[n]=x[n+1]$, every sample moves one place to the left.<br>'
     +'<b>Solution — part (a).</b>$$m=-1\\to n=3,\\quad m=0\\to n=2,\\quad m=1\\to n=1,\\quad m=2\\to n=0,$$so $y[0]=-2$, $y[1]=3$, $y[2]=-1$, $y[3]=2$, and zero elsewhere.<br>'
     +'<b>Solution — part (b).</b> $z[-2]=2$, $z[-1]=-1$, $z[0]=3$, $z[1]=-2$. The advance moves the pattern without disturbing it; only the reflection reverses the order of the samples.<br>'
     +'<b>Check.</b> Both operations preserve the number of non-zero samples, four, and the shape of the pattern. For (a), one direct substitution: $y[3]=x[2-3]=x[-1]=2$, as listed. Reading the samples in order of increasing index, $x$ gives $2,-1,3,-2$ and $y$ gives $-2,3,-1,2$ — exactly the reverse — while $z$ gives $2,-1,3,-2$, the same order as $x$, just relocated.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-1.6,4.6],yr:[-3.6,4.6],xlabel:'n',ylabel:'y[n]',
      pad:{l:46,r:26,t:30,b:34},xstep:1,ystep:1});
      a.stem([[0,-2],[1,3],[2,-1],[3,2]],{color:C.out}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-3.6,2.6],yr:[-3.6,4.6],xlabel:'n',ylabel:'z[n]',
      pad:{l:46,r:26,t:30,b:34},xstep:1,ystep:1});
      a.stem([[-2,2],[-1,-1],[0,3],[1,-2]],{color:C.mid}); return a.svg();})()),
  err:'Reading $x[2-n]$ as "reflect, then shift left by two", which gives $x(-(n+2))=x(-n-2)$ and puts the pattern in the wrong place.',
  teach:'The index-mapping table is the reliable method and it takes four lines. Discourage the shortcut of redrawing by eye.' },

{ id:'D1-11', module:'M1', type:'transform', src:'MT1 Q1',
  stem:'The signal $x(t)$ sketched below is a symmetric triangular pulse of height $1$, zero outside $-1\\le t\\le1$.',
  parts:['Plot $y(t)=x\\!\\left(1-\\tfrac{t}{3}\\right)$.',
         'State the support of $y(t)$ and check its width against the width of $x(t)$.',
         'Verify the location of the peak of $y(t)$ by direct substitution.'],
  figure:()=>{const a=P.Axes({w:1080,h:250,xr:[-2,2],yr:[-0.3,1.4],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',
      pad:{l:52,r:28,t:30,b:38},xstep:1,ystep:0.5});
    a.poly([[-1.6,0],[-1,0],[0,1],[1,0],[1.6,0]],{color:C.in}); return a.svg();},
  sol:'<b>Given.</b> $x(t)=t+1$ on $-1\\le t\\le0$, $x(t)=1-t$ on $0\\le t\\le1$, zero elsewhere, with a peak of $1$ at $t=0$.<br>'
     +'<b>Find.</b> $y(t)=x\\!\\left(1-\\tfrac{t}{3}\\right)$.<br>'
     +'<b>Method.</b> Here $a=-\\tfrac13$ and $b=-1$ in the form $x(at-b)$. The coefficient is negative and fractional, so the transformation reflects and expands as well as shifts. Map the support first, then substitute directly to get the two-piece formula.<br>'
     +'<b>Solution — the support.</b> The argument $s=1-t/3$ must lie in $[-1,1]$. At $s=1$, $t=0$; at $s=-1$, $t=6$. Because $s$ decreases as $t$ increases, the support of $y$ is $0\\le t\\le6$.<br>'
     +'<b>Solution — the formula.</b> For $t\\in[0,3]$, $s=1-t/3\\in[0,1]$, where $x(s)=1-s$, so$$y(t)=1-\\left(1-\\tfrac{t}{3}\\right)=\\frac{t}{3}.$$For $t\\in[3,6]$, $s\\in[-1,0]$, where $x(s)=s+1$, so$$y(t)=\\left(1-\\tfrac{t}{3}\\right)+1=2-\\frac{t}{3}.$$'
     +'<b>Solution — part (c).</b> The peak of $x$ is at $s=0$. Setting $1-t/3=0$ gives $t=3$, and indeed $y(3)=3/3=1=2-3/3$, matching the peak height from both branches.<br>'
     +'<b>Check.</b> Width: $x$ occupies $2$ seconds, and expansion by $1/|a|=3$ must give $6$ seconds, which the support $[0,6]$ has. Endpoint check: $y(0)=x(1)=0$ and $y(6)=x(-1)=0$, both matching the zeros at the edges of the plot. The reflection is visible in the shape: the rising half of $x$ (for $t<0$) has become the falling half of $y$ (for $t>3$).',
  figSol:()=>{const y=t=>(t>=0&&t<=3)?t/3:(t>3&&t<=6)?2-t/3:0;
    const a=P.Axes({w:1080,h:270,xr:[-1,7],yr:[-0.3,1.4],xlabel:'t\\;(\\text{s})',ylabel:'y(t)',
      pad:{l:52,r:28,t:32,b:38},xstep:1,ystep:0.5});
    a.curve(y,{color:C.out});
    [0,3,6].forEach(t=>a.vline(t,{color:C.muted,opacity:.5}));
    return a.svg();},
  err:'Applying the expansion factor $3$ but forgetting the sign of $a$, which draws $y$ rising from $t=0$ to $t=3$ and falling after — the mirror image of the correct shape.',
  teach:'Ask the student to name the sign of $a$ out loud before drawing anything. A negative $a$ always means a reflection is part of the answer, whatever its magnitude.' },

{ id:'D1-12', module:'M1', type:'transform',
  stem:'A signal $x(t)$ is known only to satisfy $x(t)=0$ outside $2\\le t\\le8$, with a single, unique maximum at $t=5$. No other property of $x(t)$ is given. Let $y(t)=x(-3t+6)$.',
  parts:['Find the support of $y(t)$ as an interval, using inequalities on the argument of $x$.',
         'Find the value of $t$ at which $y(t)$ reaches its maximum.',
         'A second transformation is applied, $z(t)=y(t-4)$. Give the support of $z(t)$ directly in terms of the support of $y(t)$, and again directly in terms of the support of $x(t)$, and check the two routes agree.'],
  sol:'<b>Given.</b> Only the support and the location of the maximum of $x(t)$; its shape is unknown.<br>'
     +'<b>Find.</b> The support and the peak location of two signals built from $x$ by transformations of the argument, without ever needing the formula for $x$.<br>'
     +'<b>Method.</b> A transformation of the independent variable moves the support and the maximum together, by mapping the argument through the same rule that produced $y$ or $z$ from $x$. No value of $x$ itself is needed.<br>'
     +'<b>Solution — part (a).</b> $y(t)\\neq0$ exactly where $-3t+6\\in[2,8]$. Solving, $-3t\\in[-4,2]$, and dividing by $-3$ reverses the inequalities: $t\\in\\left[-\\tfrac23,\\tfrac43\\right]$.<br>'
     +'<b>Solution — part (b).</b> $x$ peaks where its argument equals $5$. Setting $-3t+6=5$ gives $t=\\tfrac13$, which lies inside $\\left[-\\tfrac23,\\tfrac43\\right]$ as it must.<br>'
     +'<b>Solution — part (c).</b> A shift by $4$ moves every point of the support of $y$ to the right by $4$, so directly from $y$: $$t\\in\\left[-\\tfrac23+4,\\;\\tfrac43+4\\right]=\\left[\\tfrac{10}{3},\\tfrac{16}{3}\\right].$$Directly from $x$: $z(t)=x(-3(t-4)+6)=x(-3t+18)$, so $-3t+18\\in[2,8]$ gives $-3t\\in[-16,-10]$, hence $t\\in\\left[\\tfrac{10}{3},\\tfrac{16}{3}\\right]$, the same interval.<br>'
     +'<b>Check.</b> The width of $x$\'s support is $8-2=6$. Compression by $|a|=3$ must give width $6/3=2$ for both $y$ and $z$, and indeed $\\tfrac43-\\left(-\\tfrac23\\right)=2$ and $\\tfrac{16}{3}-\\tfrac{10}{3}=2$. That the two routes to the support of $z$ in part (c) agree is itself an independent check on the whole chain of reasoning, since one route never used the formula for $y$ and the other never used $x$ directly.',
  err:'Solving $-3t+6\\in[2,8]$ without reversing the inequalities after dividing by the negative coefficient, which gives the interval $\\left[-\\tfrac43,\\tfrac23\\right]$ — the correct numbers, in the wrong order, silently reporting an empty or backwards interval when the arithmetic is written carelessly.',
  teach:'This question cannot be answered by drawing a picture, because no picture of $x$ exists. It isolates whether a student understands the transformation as a mapping on the argument, independent of the signal\'s shape.' },

{ id:'D1-13', module:'M1', type:'evenodd', src:'MT1 Q1',
  stem:'Let $x(t)=3e^{-4t}u(t)$.',
  parts:['Find $\\Ev\\{x(t)\\}$ and $\\Od\\{x(t)\\}$ and plot both.',
         'Calculate $E_\\infty$ for $x(t)$, for its even part, and for its odd part.',
         'Comment on the relation between the three energies.'],
  sol:'<b>Given.</b> A causal decaying exponential.<br>'
     +'<b>Find.</b> Its even and odd parts, and the three energies.<br>'
     +'<b>Method.</b> Build $x(-t)=3e^{4t}u(-t)$ first, then$$\\Ev\\{x\\}=\\tfrac12[x(t)+x(-t)],\\qquad\\Od\\{x\\}=\\tfrac12[x(t)-x(-t)].$$'
     +'<b>Solution — part (a).</b> The two pieces sit on opposite half-lines and never overlap, so$$\\Ev\\{x(t)\\}=\\tfrac32e^{-4|t|},\\qquad\\Od\\{x(t)\\}=\\tfrac32e^{-4t}u(t)-\\tfrac32e^{4t}u(-t).$$The even part is a two-sided decaying exponential of height $\\tfrac32$; the odd part has the same shape with its left half turned upside down, jumping from $-\\tfrac32$ to $\\tfrac32$ at the origin.<br>'
     +'<b>Solution — part (b).</b>$$E_x=\\int_{0}^{\\infty}9e^{-8t}\\,\\d t=\\tfrac98,$$$$E_{\\Ev}=\\int_{-\\infty}^{\\infty}\\tfrac94e^{-8|t|}\\,\\d t=\\tfrac94\\cdot2\\cdot\\tfrac18=\\tfrac{9}{16},$$and by the same computation $E_{\\Od}=\\tfrac{9}{16}$.<br>'
     +'<b>Solution — part (c).</b> $E_{\\Ev}+E_{\\Od}=\\tfrac{9}{16}+\\tfrac{9}{16}=\\tfrac98=E_x$. The energies add because the even and odd parts are orthogonal: the cross term $\\int\\Ev\\{x\\}\\Od\\{x\\}\\,\\d t$ is the integral of an odd function over a symmetric interval, and is therefore zero.<br>'
     +'<b>Check.</b> The two parts add back to $x$: for $t>0$ they give $\\tfrac32e^{-4t}+\\tfrac32e^{-4t}=3e^{-4t}$, and for $t<0$ they give $\\tfrac32e^{4t}-\\tfrac32e^{4t}=0$, both as required. Scaling the amplitude by a factor of $3$ instead of $1$ has scaled every energy by $3^{2}=9$ compared with a unit-amplitude version, which is the expected quadratic dependence for a squared quantity.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-1.2,1.2],yr:[-0.15,1.7],xlabel:'t\\;(\\text{s})',ylabel:'\\Ev\\{x(t)\\}',
      pad:{l:56,r:26,t:32,b:38},xstep:0.5,ystep:0.5});
      a.curve(t=>1.5*Math.exp(-4*Math.abs(t)),{color:C.mid}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-1.2,1.2],yr:[-1.7,1.7],xlabel:'t\\;(\\text{s})',ylabel:'\\Od\\{x(t)\\}',
      pad:{l:56,r:26,t:32,b:38},xstep:0.5,ystep:0.5});
      a.curve(t=>t>0?1.5*Math.exp(-4*t):null,{color:C.mid});
      a.curve(t=>t<0?-1.5*Math.exp(4*t):null,{color:C.mid});
      return a.svg();})()),
  err:'Writing $\\Od\\{x\\}=\\tfrac32e^{-4|t|}\\operatorname{sgn}(t)$ and then claiming it is continuous at the origin. It is not: the odd part of a signal with a jump at $t=0$ inherits that jump.',
  teach:'The orthogonality argument in part (c) is the transferable result. Ask why the cross term vanishes rather than accepting the arithmetic coincidence.' },

{ id:'D1-14', module:'M1', type:'evenodd', src:'MT1 Q1',
  stem:'The sequence $x[n]$ equals $2$, $-1$, $4$, $1$ at $n=0,1,2,3$ and is zero elsewhere.',
  parts:['Plot $x[-n]$.',
         'Plot $\\Ev\\{x[n]\\}$ and $\\Od\\{x[n]\\}$.',
         'Verify that the two parts add back to $x[n]$ at $n=-1$, $n=0$ and $n=2$.'],
  figure:()=>{const a=P.Axes({w:1080,h:250,xr:[-3.6,3.6],yr:[-2.6,4.6],xlabel:'n',ylabel:'x[n]',
      pad:{l:50,r:28,t:30,b:34},xstep:1,ystep:1});
    a.stem(seq([2,-1,4,1],0),{color:C.in}); return a.svg();},
  sol:'<b>Given.</b> $x[0]=2$, $x[1]=-1$, $x[2]=4$, $x[3]=1$, zero elsewhere.<br>'
     +'<b>Find.</b> The reflection and the even and odd parts.<br>'
     +'<b>Method.</b> $x[-n]$ places the value $x[m]$ at index $-m$. Then$$\\Ev\\{x[n]\\}=\\tfrac12\\bigl(x[n]+x[-n]\\bigr),\\qquad\\Od\\{x[n]\\}=\\tfrac12\\bigl(x[n]-x[-n]\\bigr).$$'
     +'<b>Solution — part (a).</b> $x[-n]$ equals $1,4,-1,2$ at $n=-3,-2,-1,0$ and is zero elsewhere.<br>'
     +'<b>Solution — part (b).</b> Sample by sample,$$\\Ev\\{x\\}:\\;0.5,\\,2,\\,-0.5,\\,2,\\,-0.5,\\,2,\\,0.5\\quad\\text{at}\\quad n=-3,\\dots,3,$$$$\\Od\\{x\\}:\\;-0.5,\\,-2,\\,0.5,\\,0,\\,-0.5,\\,2,\\,0.5\\quad\\text{at}\\quad n=-3,\\dots,3,$$and both are zero elsewhere.<br>'
     +'<b>Solution — part (c).</b> At $n=-1$: $-0.5+0.5=0=x[-1]$. At $n=0$: $2+0=2=x[0]$. At $n=2$: $2+2=4=x[2]$. All three agree.<br>'
     +'<b>Check.</b> The even part is symmetric about $n=0$ and the odd part is antisymmetric, with $\\Od\\{x\\}[0]=0$ as it must be for every sequence. Only $x[0]$ survives untouched into the even part, and it does: $\\Ev\\{x\\}[0]=x[0]=2$.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-3.6,3.6],yr:[-1,2.6],xlabel:'n',ylabel:'\\Ev\\{x[n]\\}',
      pad:{l:56,r:26,t:32,b:34},xstep:1,ystep:0.5});
      a.stem([[-3,0.5],[-2,2],[-1,-0.5],[0,2],[1,-0.5],[2,2],[3,0.5]],{color:C.mid}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-3.6,3.6],yr:[-2.6,2.6],xlabel:'n',ylabel:'\\Od\\{x[n]\\}',
      pad:{l:56,r:26,t:32,b:34},xstep:1,ystep:0.5});
      a.stem([[-3,-0.5],[-2,-2],[-1,0.5],[0,0],[1,-0.5],[2,2],[3,0.5]],{color:C.mid}); return a.svg();})()),
  err:'Reflecting the plot about the vertical axis but leaving the sample at $n=0$ in place while also copying it to $n=0$ again, which doubles $x[0]$ in the even part.',
  teach:'The value $\\Od\\{x\\}[0]=0$ is a free check on every answer. If a student reports a non-zero odd part at the origin, the reflection was built incorrectly.' },

{ id:'D1-15', module:'M1', type:'evenodd',
  stem:'Let $$x(t)=\\begin{cases}-1,&-2\\le t<0,\\\\[2pt] 2,&0\\le t\\le3,\\\\[2pt] 0,&\\text{otherwise.}\\end{cases}$$',
  parts:['Determine $x(-t)$ as a piecewise formula.',
         'Determine $\\Ev\\{x(t)\\}$ and $\\Od\\{x(t)\\}$, each as a piecewise formula.',
         'Calculate $E_x$, $E_{\\Ev}$ and $E_{\\Od}$, and verify that the two parts\' energies add to $E_x$.'],
  sol:'<b>Given.</b> An asymmetric two-level rectangular signal, $-1$ on one side of the origin and $2$ on the other.<br>'
     +'<b>Find.</b> $x(-t)$, the two parts, and the three energies.<br>'
     +'<b>Method.</b> Substitute $t\\to-t$ in each piece of the definition to get $x(-t)$, then apply $\\Ev\\{x\\}=\\tfrac12[x(t)+x(-t)]$ and $\\Od\\{x\\}=\\tfrac12[x(t)-x(-t)]$ region by region, and integrate the square of each result.<br>'
     +'<b>Solution — part (a).</b> Replacing $t$ by $-t$: $-2\\le-t<0$ becomes $0<t\\le2$, where $x(-t)=-1$; and $0\\le-t\\le3$ becomes $-3\\le t\\le0$, where $x(-t)=2$. So$$x(-t)=\\begin{cases}2,&-3\\le t\\le0,\\\\[2pt] -1,&0<t\\le2,\\\\[2pt] 0,&\\text{otherwise.}\\end{cases}$$'
     +'<b>Solution — part (b).</b> Adding and subtracting $x(t)$ and $x(-t)$ on each of the four regions where either is non-zero,$$\\Ev\\{x(t)\\}=\\begin{cases}1,&-3\\le t<-2,\\\\ 0.5,&-2\\le t<2,\\\\ 1,&2\\le t\\le3,\\end{cases}\\qquad\\Od\\{x(t)\\}=\\begin{cases}-1,&-3\\le t<-2,\\\\ -1.5,&-2\\le t<0,\\\\ 1.5,&0\\le t<2,\\\\ 1,&2\\le t\\le3,\\end{cases}$$both zero outside $[-3,3]$.<br>'
     +'<b>Solution — part (c).</b>$$E_x=\\int_{-2}^{0}1\\,\\d t+\\int_{0}^{3}4\\,\\d t=2+12=14.$$$$E_{\\Ev}=\\int_{-3}^{-2}1\\,\\d t+\\int_{-2}^{2}0.25\\,\\d t+\\int_{2}^{3}1\\,\\d t=1+1+1=3.$$$$E_{\\Od}=\\int_{-3}^{-2}1\\,\\d t+\\int_{-2}^{0}2.25\\,\\d t+\\int_{0}^{2}2.25\\,\\d t+\\int_{2}^{3}1\\,\\d t=1+4.5+4.5+1=11.$$Then $E_{\\Ev}+E_{\\Od}=3+11=14=E_x$.<br>'
     +'<b>Check.</b> The two parts must add back to $x$ on every region: on $(0,2]$, $0.5+1.5=2=x(t)$; on $[-3,-2)$, $1+(-1)=0=x(t)$, both correct. As an independent bound, $E_{\\Ev}\\le E_x$ always, because $\\Ev\\{x\\}$ is built by averaging $x(t)$ with a reflected copy of itself and the energy of an average of two signals of comparable size cannot exceed the larger contribution; here $3<14$, consistent with that bound.',
  err:'Computing $\\Ev\\{x\\}$ and $\\Od\\{x\\}$ only on the region where $x(t)$ itself is non-zero, $[-2,3]$, and missing that $x(-t)$ is non-zero on $[-3,2]$ — a different interval — so the even and odd parts extend over $[-3,3]$, wider than $x$ itself.',
  teach:'Ask for $x(-t)$ to be written out fully, as in part (a), before either part (b) is attempted. The commonest failure is reusing the support of $x(t)$ for $x(-t)$ instead of reflecting it.' },

{ id:'D1-16', module:'M1', type:'evenodd',
  stem:'Let $x[n]$ be an arbitrary real-valued sequence, not given by any formula.',
  parts:['Prove that $\\Od\\{x\\}[0]=0$, directly from the definition of the odd part.',
         'The sequence $w[n]$ has $w[-1]=-5$, $w[0]=0$, $w[1]=5$, zero elsewhere. A student claims $\\Od\\{w\\}[n]=w[n]$ for every $n$ and $\\Ev\\{w\\}[n]=0$ for every $n$. Determine whether the claim is correct.',
         'A second sequence has $y[0]=4$. Using part (a) only, and without computing $\\Od\\{y\\}$, explain why $y[n]$ cannot be an odd sequence.'],
  sol:'<b>Given.</b> The general definition $\\Od\\{x\\}[n]=\\tfrac12(x[n]-x[-n])$, applied first abstractly and then to one example.<br>'
     +'<b>Find.</b> A general identity at $n=0$, and its two consequences.<br>'
     +'<b>Method.</b> Substitute $n=0$ into the definition of the odd part; the two terms it produces are identical, for any sequence whatsoever.<br>'
     +'<b>Solution — part (a).</b> $\\Od\\{x\\}[0]=\\tfrac12\\bigl(x[0]-x[-0]\\bigr)=\\tfrac12\\bigl(x[0]-x[0]\\bigr)=0$, because $-0=0$. This holds for every real sequence $x[n]$, whatever its values are.<br>'
     +'<b>Solution — part (b).</b> $w[-n]$ equals $5,0,-5$ at $n=-1,0,1$. Then $\\Ev\\{w\\}[n]=\\tfrac12(w[n]+w[-n])$: at $n=-1$, $\\tfrac12(-5+5)=0$; at $n=0$, $0$; at $n=1$, $\\tfrac12(5-5)=0$ — zero everywhere, as claimed. And $\\Od\\{w\\}[n]=\\tfrac12(w[n]-w[-n])$: at $n=-1$, $\\tfrac12(-5-5)=-5=w[-1]$; at $n=1$, $\\tfrac12(5-(-5))=5=w[1]$; at $n=0$, $0=w[0]$ — so $\\Od\\{w\\}=w$ at every listed index. <b>The claim is correct</b>, because $w[n]$ is already odd: $w[-n]=-w[n]$ holds at every index.<br>'
     +'<b>Solution — part (c).</b> If $y[n]$ were odd, it would equal its own odd part: $y[n]=\\Od\\{y\\}[n]$ for every $n$, in particular at $n=0$. But part (a) shows $\\Od\\{y\\}[0]=0$ for <em>any</em> sequence, so an odd $y$ would need $y[0]=0$. Since $y[0]=4\\neq0$, $y[n]$ cannot be odd.<br>'
     +'<b>Check.</b> Part (b) gives a worked instance of the general fact used in part (c): $w[0]=0$ is exactly what let $w$ be odd in the first place. Reversing the logic, changing only $w[0]$ from $0$ to any non-zero number would immediately break oddness by the same argument, without touching $w[1]$ or $w[-1]$ at all — a one-sample edit with a predictable consequence, which is a fast way to check the general claim on a second example.',
  err:'Trying to verify the claim in part (b) by checking only $\\Od\\{w\\}[1]=w[1]$ and stopping there, without also checking $n=-1$ and confirming $\\Ev\\{w\\}$ is zero at every index, not only at the one checked.',
  teach:'Part (c) is the point of the question: a property proved once, in general, replaces a computation that would otherwise have to be redone for every new signal. Ask which other single-sample facts about $x[n]$ can be read off the definitions the same way.' },

{ id:'D1-17', module:'M1', type:'impulse', src:'MT1 Q1',
  stem:'Evaluate each of the following.'
      +'$$\\text{(i)}\\;\\int_{-\\infty}^{\\infty}\\!\\left(3t^{2}+1\\right)\\bigl[\\delta(t+2)+\\delta(t-4)\\bigr]\\d t\\qquad'
      +'\\text{(ii)}\\;\\int_{-\\infty}^{\\infty}\\!e^{-2t}\\sin(\\pi t)\\,\\delta(t-1.5)\\,\\d t\\qquad'
      +'\\text{(iii)}\\;\\int_{-\\infty}^{\\infty}\\!t^{2}\\,\\delta(4t-8)\\,\\d t$$',
  parts:['Evaluate the three integrals.',
         'State which property of the impulse each one uses, and say why the answer is a number rather than a signal.'],
  sol:'<b>Given.</b> Three integrals of an ordinary function against an impulse.<br>'
     +'<b>Find.</b> Their values, and the property behind each.<br>'
     +'<b>Method.</b> The <b>sifting</b> property, $\\int x(t)\\delta(t-t_0)\\,\\d t=x(t_0)$, evaluates the function at the location of the impulse. A scaled argument first needs$$\\delta(at-b)=\\frac{1}{|a|}\\,\\delta\\!\\left(t-\\frac{b}{a}\\right),$$because the impulse must keep unit area under the substitution.<br>'
     +'<b>Solution — (i).</b> Two impulses, so sift twice and add:$$\\bigl(3\\cdot4+1\\bigr)+\\bigl(3\\cdot16+1\\bigr)=13+49=62.$$'
     +'<b>Solution — (ii).</b> $e^{-3}\\sin(1.5\\pi)=e^{-3}\\cdot(-1)=-e^{-3}\\approx-0.0498$.<br>'
     +'<b>Solution — (iii).</b> Rewrite $\\delta(4t-8)=\\tfrac14\\delta(t-2)$, then sift:$$\\int t^{2}\\cdot\\tfrac14\\delta(t-2)\\,\\d t=\\tfrac14\\cdot4=1.$$'
     +'<b>Solution — part (b).</b> All three use sifting. The result is a number because the integral runs over $t$ and removes every $t$-dependence. The <b>sampling</b> property is the other statement, $x(t)\\delta(t-t_0)=x(t_0)\\delta(t-t_0)$, and it returns a signal: an impulse at $t_0$ carrying the weight $x(t_0)$.<br>'
     +'<b>Check.</b> Units confirm the split: if $x$ is in volts then $\\delta$ carries $\\mathrm{s}^{-1}$, so the product is a signal in $\\mathrm{V\\,s^{-1}}$ and the integral is a number in volts. In (iii), dropping the factor $\\tfrac14$ would quadruple the answer, and the area of $\\delta(4t-8)$ measured directly is $\\tfrac14$, not $1$; and $\\sin(1.5\\pi)=-1$ exactly, since $1.5\\pi$ is three-quarters of a full turn past zero, which fixes the sign in (ii) independently of the exponential factor.',
  err:'Treating $\\delta(4t-8)$ as $\\delta(t-8)$, or as $\\delta(t-2)$ without the factor $\\tfrac14$. Compressing the argument compresses the impulse, and its area must be restored.',
  teach:'Part (b) separates the two properties. A student who writes $x(t)\\delta(t-t_0)=x(t_0)$ has silently turned a signal into a number and will make the same slip in Module 3.' },

{ id:'D1-18', module:'M1', type:'impulse',
  stem:'Let $$g(t)=3\\delta(t+1)-2\\delta(t-2),\\qquad v(t)=\\int_{-\\infty}^{t}g(\\tau)\\,\\d\\tau.$$',
  parts:['Using $u(t)=\\displaystyle\\int_{-\\infty}^{t}\\delta(\\tau)\\,\\d\\tau$, express $v(t)$ as a combination of unit step functions.',
         'Sketch $v(t)$ for $-3\\le t\\le4$.',
         'Read $v(0)$ and $v(3)$ from the sketch, and check them against the formula from part (a).'],
  sol:'<b>Given.</b> A signal built from two weighted, shifted impulses, and its running integral.<br>'
     +'<b>Find.</b> $v(t)$ as a staircase, and two of its values checked two ways.<br>'
     +'<b>Method.</b> Integration is linear, so the running integral of a sum of impulses is the same sum of running integrals of each impulse alone, and $\\int_{-\\infty}^{t}\\delta(\\tau-t_0)\\,\\d\\tau=u(t-t_0)$ by definition of the step.<br>'
     +'<b>Solution — part (a).</b>$$v(t)=3u(t+1)-2u(t-2).$$'
     +'<b>Solution — part (b).</b> $v(t)$ is a staircase: $0$ for $t<-1$, rises to $3$ at $t=-1$ and holds until $t=2$, then drops by $2$ to $1$ and holds from $t=2$ onward.<br>'
     +'<b>Solution — part (c).</b> From the sketch, $v(0)=3$ (between the two steps) and $v(3)=1$ (after both). From the formula: $v(0)=3u(1)-2u(-2)=3\\cdot1-2\\cdot0=3$, and $v(3)=3u(4)-2u(1)=3\\cdot1-2\\cdot1=1$. Both agree.<br>'
     +'<b>Check.</b> The final level of the staircase, as $t\\to\\infty$, must equal the total area under $g(t)$, which is the sum of the two impulse weights: $3+(-2)=1$. The sketch settles at $1$ for large $t$, matching this weight-sum without reference to either step location.',
  figSol:()=>{const v=t=>t<-1?0:(t<2?3:1);
    const a=P.Axes({w:1080,h:270,xr:[-3,4],yr:[-0.5,3.8],xlabel:'t\\;(\\text{s})',ylabel:'v(t)',
      pad:{l:52,r:28,t:30,b:38},xstep:1,ystep:1});
    a.curve(v,{color:C.mid});
    [-1,2].forEach(t=>a.vline(t,{color:C.muted,opacity:.5}));
    return a.svg();},
  err:'Writing $v(t)=3\\delta(t+1)-2\\delta(t-2)$, that is, leaving the answer as the original impulses instead of integrating them into steps. The running integral of an impulse is a step, not another impulse.',
  teach:'Ask for the final level of the staircase before the sketch is drawn, using only the sum of the weights. A student who cannot predict it has not understood that the step is the running integral of the impulse.' },

{ id:'D1-19', module:'M1', type:'impulse',
  stem:'Let $x[n]$ have $x[-1]=5$, $x[0]=-3$, $x[1]=2$, $x[2]=7$, zero elsewhere.',
  parts:['Write the sampling-property result $x[n]\\delta[n-1]$ explicitly as a sequence.',
         'Write the sifting-property result $\\displaystyle\\sum_{n=-\\infty}^{\\infty}x[n]\\delta[n-1]$ as a number, and confirm it equals $x[1]$.',
         'Using the representation property $x[n]=\\displaystyle\\sum_{k=-\\infty}^{\\infty}x[k]\\delta[n-k]$, write out its four non-zero terms for this $x[n]$, and confirm the sum reproduces $x[0]$.'],
  sol:'<b>Given.</b> A four-sample sequence and the index $n_0=1$.<br>'
     +'<b>Find.</b> The two impulse properties applied at $n_0=1$, and the representation property evaluated at $n=0$.<br>'
     +'<b>Method.</b> Sampling multiplies $x[n]$ by a shifted impulse and returns a sequence with one surviving sample. Sifting sums that sequence and returns a number. The representation property is sifting run in reverse: it rebuilds $x[n]$ from weighted, shifted impulses, one for every non-zero sample.<br>'
     +'<b>Solution — part (a).</b> $x[n]\\delta[n-1]=x[1]\\delta[n-1]=2\\delta[n-1]$ — the sequence equal to $2$ at $n=1$ and zero everywhere else.<br>'
     +'<b>Solution — part (b).</b> $\\displaystyle\\sum_{n}x[n]\\delta[n-1]=x[1]=2$, since only the $n=1$ term of the sum survives, and $x[1]=2$ as given.<br>'
     +'<b>Solution — part (c).</b>$$x[n]=5\\delta[n+1]-3\\delta[n]+2\\delta[n-1]+7\\delta[n-2].$$At $n=0$: $5\\delta[1]-3\\delta[0]+2\\delta[-1]+7\\delta[-2]=5\\cdot0-3\\cdot1+2\\cdot0+7\\cdot0=-3=x[0]$.<br>'
     +'<b>Check.</b> Evaluating the same sum at $n=-1$ instead: $5\\delta[0]-3\\delta[-1]+2\\delta[-2]+7\\delta[-3]=5\\cdot1-3\\cdot0+2\\cdot0+7\\cdot0=5=x[-1]$, a second, independent index where the representation reproduces the given sequence, confirming part (c) was not a coincidence at $n=0$ alone.',
  err:'Writing the sampling result in part (a) as the number $2$ instead of the sequence $2\\delta[n-1]$. Sampling produces a signal that happens to have only one non-zero sample; it does not collapse to a number until it is summed.',
  teach:'Ask for the check at a second index, as in the Check step, before accepting part (c). A single matching index is a weak test; the representation property has to hold everywhere.' },

{ id:'D1-20', module:'M1', type:'impulse',
  stem:'Let $$x[n]=\\delta[n]+2\\delta[n-2]-\\delta[n-4],\\qquad y[n]=\\sum_{k=-\\infty}^{n}x[k].$$',
  parts:['Evaluate $y[n]$ for $-2\\le n\\le6$.',
         'Express $y[n]$ in closed form as a combination of unit step functions, and check it against part (a).',
         'A continuous-time signal $p(t)=\\delta(t)+2\\delta(t-2)-\\delta(t-4)$ carries the same weights at the same locations. State its running integral $q(t)=\\displaystyle\\int_{-\\infty}^{t}p(\\tau)\\,\\d\\tau$ directly by analogy with $y[n]$, without repeating the calculation.'],
  sol:'<b>Given.</b> A finite train of three weighted, shifted unit samples, and its running sum.<br>'
     +'<b>Find.</b> The running sum as a table, in closed form, and its continuous-time counterpart.<br>'
     +'<b>Method.</b> The running sum of $\\delta[n-k]$ is $u[n-k]$, exactly as the running integral of $\\delta(t-t_0)$ is $u(t-t_0)$; summation is linear, so it distributes over the three terms of $x[n]$ unchanged.<br>'
     +'<b>Solution — part (a).</b> Accumulating one impulse at a time as $n$ increases past each location:$$y[n]=0,0,1,1,3,3,2,2,2\\quad\\text{for}\\quad n=-2,-1,0,1,2,3,4,5,6.$$'
     +'<b>Solution — part (b).</b>$$y[n]=u[n]+2u[n-2]-u[n-4].$$Checking against part (a) at $n=4$: $u[4]+2u[2]-u[0]=1+2-1=2$, matching the table.<br>'
     +'<b>Solution — part (c).</b> The running sum replaced each $\\delta[n-k]$ by $u[n-k]$ with its weight unchanged; the running integral does the same with $\\delta(t-t_0)\\to u(t-t_0)$, so by the identical argument$$q(t)=u(t)+2u(t-2)-u(t-4),$$a staircase with the same three levels as $y[n]$, at $t=0,2,4$ instead of $n=0,2,4$.<br>'
     +'<b>Check.</b> The final level of $y[n]$, once every impulse has been passed, must equal the sum of the weights, $1+2-1=2$, and the table settles at $2$ for $n\\ge4$. The same sum, $2$, is also the final level $q(t)$ settles at for $t\\ge4$, so the discrete and continuous constructions agree on the one number that does not depend on where the impulses sit, only on how much weight they carry in total.',
  figSol:()=>{const a=P.Axes({w:1080,h:270,xr:[-3,7],yr:[-0.5,3.8],xlabel:'n',ylabel:'y[n]',
      pad:{l:52,r:28,t:30,b:34},xstep:1,ystep:1});
    a.stem([[-2,0],[-1,0],[0,1],[1,1],[2,3],[3,3],[4,2],[5,2],[6,2]],{color:C.mid});
    return a.svg();},
  err:'Reporting the running sum as another train of impulses, $u[n]+2u[n-2]-u[n-4]$ misread as a sum of samples rather than a sum of steps, so the plotted answer shows isolated dots instead of a staircase that holds its value between jumps.',
  teach:'Part (c) is the one to press on. A student who can only produce $q(t)$ by repeating the integration, rather than by relabelling $y[n]$, has not understood that the discrete and continuous constructions are the same argument in two notations.' }

]);

window.DRILLMAP_M1 = [

{ id:'m1-drill-map', module:'M1', nav:'Module 1 · question types',
  title:'Module 1 — what a question looks like', src:'pp. 2–10',
  objective:'Name the five recurring question shapes before the module is read.',
  keywords:'practice questions module 1 question types periodicity energy power transformation even odd impulse taxonomy practice',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 1 · Question types', src:'pp. 2–10'},
  {t:'title', text:'Five shapes, and the method each one wants'},
  {t:'lede', text:'Questions on signal foundations come in five shapes. Read them now, before the module. You are not expected to be able to answer them yet — you are expected to recognise them when they arrive.'},
  {t:'raw', html:'<div style="height:10px"></div>'},
  {t:'drilltypes', module:'M1'}
]}

];

/* The questions themselves sit at the end of the module, after the teaching
   scenes. The taxonomy above sits in front of it: one is a map read before the
   work, the other is the work. */
window.DRILL_M1 = [

{ id:'m1-drill', module:'M1', nav:'Module 1 · practice questions',
  title:'Module 1 — practice questions', src:'pp. 2–10',
  objective:'Twenty open-ended questions with worked solutions, in the form they are asked in.',
  keywords:'practice questions module 1 practice periodicity energy power transformation even odd sifting impulse step',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 1 · Practice D1-01 … D1-20', src:'pp. 2–10'},
  {t:'title', text:'Practice questions'},
  {t:'small', html:'Work each question on paper before opening its solution. Every solution ends with a <b>Check</b> step. In this module the cheap checks are: a period must divide into every term a whole number of times, a transformation must preserve the width of the support up to the scale factor, the even and odd parts must add back to the signal, and a running sum or integral must settle at the total weight of the impulses that built it.'},
  {t:'rule', short:true},
  {t:'drill', module:'M1'}
]}

];
})();
